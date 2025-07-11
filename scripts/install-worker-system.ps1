# Install-WorkerSystem.ps1
# Installiert das Worker-System als Windows-Dienste für höchste Zuverlässigkeit

# Erfordert erhöhte Rechte
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Administrator-Rechte erforderlich. Bitte Script als Administrator ausführen." -ForegroundColor Red
    exit 1
}

# Pfad zum Projektverzeichnis (aktuelles Verzeichnis)
$projectPath = (Get-Location).Path
$toolsPath = Join-Path $projectPath "tools"

# NSSM installieren (falls nicht vorhanden)
$nssmPath = Join-Path $projectPath "tools" "nssm.exe"
if (-not (Test-Path $nssmPath)) {
    Write-Host "Lade NSSM (Non-Sucking Service Manager) herunter..." -ForegroundColor Cyan
    $nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
    $nssmZip = Join-Path $env:TEMP "nssm.zip"
    $nssmExtract = Join-Path $env:TEMP "nssm-extract"
    
    Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip
    Expand-Archive -Path $nssmZip -DestinationPath $nssmExtract -Force
    
    if (-not (Test-Path (Join-Path $toolsPath))) {
        New-Item -Path $toolsPath -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item -Path (Join-Path $nssmExtract "nssm-2.24" "win64" "nssm.exe") -Destination $nssmPath
    
    Remove-Item $nssmZip -Force
    Remove-Item $nssmExtract -Recurse -Force
    
    Write-Host "NSSM wurde heruntergeladen und installiert." -ForegroundColor Green
}

# Node.js Pfad ermitteln
$nodePath = where.exe node 2>$null
if (-not $nodePath) {
    Write-Host "Node.js wurde nicht gefunden. Bitte installieren Sie Node.js." -ForegroundColor Red
    exit 1
}

# Worker-System Dienste installieren
function Install-WorkerSystemService {
    param (
        [string]$ServiceName,
        [string]$DisplayName,
        [string]$Description,
        [string]$ScriptPath,
        [string[]]$Arguments = @(),
        [string]$Dependencies = $null
    )
    
    Write-Host "Installiere Dienst: $DisplayName..." -ForegroundColor Cyan
    
    # Prüfen, ob der Dienst bereits existiert
    $existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-Host "Dienst $ServiceName existiert bereits. Wird entfernt..." -ForegroundColor Yellow
        & $nssmPath stop $ServiceName
        & $nssmPath remove $ServiceName confirm
        Start-Sleep -Seconds 2
    }
    
    # Vollständiger Pfad zum Skript
    $fullScriptPath = Join-Path $projectPath $ScriptPath
    
    if (-not (Test-Path $fullScriptPath)) {
        Write-Host "Skriptdatei nicht gefunden: $fullScriptPath" -ForegroundColor Red
        return
    }
    
    # Dienst mit NSSM installieren
    & $nssmPath install $ServiceName $nodePath $fullScriptPath ($Arguments -join " ")
    & $nssmPath set $ServiceName DisplayName $DisplayName
    & $nssmPath set $ServiceName Description $Description
    & $nssmPath set $ServiceName AppDirectory $projectPath
    & $nssmPath set $ServiceName AppStdout (Join-Path $projectPath ".worker-system" "$ServiceName-output.log")
    & $nssmPath set $ServiceName AppStderr (Join-Path $projectPath ".worker-system" "$ServiceName-error.log")
    & $nssmPath set $ServiceName AppRotateFiles 1
    & $nssmPath set $ServiceName AppRotateOnline 1
    & $nssmPath set $ServiceName AppRotateBytes 10485760  # 10 MB
    & $nssmPath set $ServiceName Start SERVICE_AUTO_START
    
    # Abhängigkeiten setzen, falls vorhanden
    if ($Dependencies) {
        & $nssmPath set $ServiceName DependOnService $Dependencies
    }
    
    # Dienst starten
    & $nssmPath start $ServiceName
    
    Write-Host "Dienst $DisplayName wurde installiert und gestartet." -ForegroundColor Green
}

# .worker-system Verzeichnis erstellen
$workerDir = Join-Path $projectPath ".worker-system"
if (-not (Test-Path $workerDir)) {
    New-Item -Path $workerDir -ItemType Directory -Force | Out-Null
}

# Dienst-Verzeichnis erstellen
$serviceConfigDir = Join-Path $workerDir "service-config"
if (-not (Test-Path $serviceConfigDir)) {
    New-Item -Path $serviceConfigDir -ItemType Directory -Force | Out-Null
}

# Dienst-Konfigurationen erstellen
$serviceConfig = @{
    WorkerMonitor = @{
        ServiceName = "BurniTokenWorkerMonitor"
        DisplayName = "Burni Token Worker Monitor"
        Description = "Überwacht das Master Worker System und stellt seine Verfügbarkeit sicher"
        ScriptPath = "tools/worker-monitor.js"
        Arguments = @()
        Dependencies = ""
    }
    MasterWorker = @{
        ServiceName = "BurniTokenMasterWorker"
        DisplayName = "Burni Token Master Worker"
        Description = "Verwaltet alle Worker-Prozesse und koordiniert ihre Ausführung"
        ScriptPath = "tools/master-worker-system.js"
        Arguments = @()
        Dependencies = "BurniTokenWorkerMonitor"
    }
    ParallelTasks = @{
        ServiceName = "BurniTokenParallelTasks"
        DisplayName = "Burni Token Parallel Tasks"
        Description = "Führt regelmäßig parallele Tasks aus und optimiert die Ressourcennutzung"
        ScriptPath = "tools/parallel-task-manager.js"
        Arguments = @("--service")
        Dependencies = "BurniTokenMasterWorker"
    }
}

# Dienst-Konfigurationen speichern
$serviceConfigJson = ConvertTo-Json $serviceConfig -Depth 5
Set-Content -Path (Join-Path $serviceConfigDir "service-config.json") -Value $serviceConfigJson

# Dienste installieren
Write-Host "Installiere Worker-System-Dienste..." -ForegroundColor Cyan

Install-WorkerSystemService `
    -ServiceName $serviceConfig.WorkerMonitor.ServiceName `
    -DisplayName $serviceConfig.WorkerMonitor.DisplayName `
    -Description $serviceConfig.WorkerMonitor.Description `
    -ScriptPath $serviceConfig.WorkerMonitor.ScriptPath `
    -Arguments $serviceConfig.WorkerMonitor.Arguments

Install-WorkerSystemService `
    -ServiceName $serviceConfig.MasterWorker.ServiceName `
    -DisplayName $serviceConfig.MasterWorker.DisplayName `
    -Description $serviceConfig.MasterWorker.Description `
    -ScriptPath $serviceConfig.MasterWorker.ScriptPath `
    -Arguments $serviceConfig.MasterWorker.Arguments `
    -Dependencies $serviceConfig.MasterWorker.Dependencies

Install-WorkerSystemService `
    -ServiceName $serviceConfig.ParallelTasks.ServiceName `
    -DisplayName $serviceConfig.ParallelTasks.DisplayName `
    -Description $serviceConfig.ParallelTasks.Description `
    -ScriptPath $serviceConfig.ParallelTasks.ScriptPath `
    -Arguments $serviceConfig.ParallelTasks.Arguments `
    -Dependencies $serviceConfig.ParallelTasks.Dependencies

# Dienststatus prüfen
Write-Host "`nDienststatus:" -ForegroundColor Cyan
Get-Service -Name BurniToken* | Format-Table -AutoSize

# Erfolgreiche Installation
Write-Host "`n✅ Worker-System wurde erfolgreich als Windows-Dienste installiert!" -ForegroundColor Green
Write-Host "Das System ist jetzt hochverfügbar und wird automatisch gestartet, auch nach Systemneustarts." -ForegroundColor Green
Write-Host "`nDie Logs finden Sie im Verzeichnis: $workerDir" -ForegroundColor Cyan
