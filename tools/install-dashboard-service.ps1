# Dashboard Service Installer für Windows
# Installiert das Dashboard als Windows-Service mit automatischem Start

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "install"
)

# Konfiguration
$ServiceName = "BurniDashboard"
$ServiceDisplayName = "Burni Token Dashboard Auto-Starter"
$ServiceDescription = "Automatischer Start und Überwachung des Burni Token Dashboards"
$ProjectDir = Split-Path -Parent $PSScriptRoot
$AutoStarterScript = Join-Path $ProjectDir "tools\dashboard-auto-starter.js"
$BatchScript = Join-Path $ProjectDir "tools\start-dashboard-autoboot.bat"

function Install-DashboardService {
    Write-Host "=== Dashboard Service Installation ===" -ForegroundColor Cyan
    
    # Prüfe Admin-Rechte
    if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
        Write-Host "FEHLER: Admin-Rechte erforderlich!" -ForegroundColor Red
        Write-Host "Führe PowerShell als Administrator aus." -ForegroundColor Yellow
        exit 1
    }

    # Prüfe Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js gefunden: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js nicht gefunden! Bitte installieren." -ForegroundColor Red
        exit 1
    }

    # Prüfe Dateien
    if (-not (Test-Path $AutoStarterScript)) {
        Write-Host "❌ Auto-Starter nicht gefunden: $AutoStarterScript" -ForegroundColor Red
        exit 1
    }

    # Entferne existierenden Service
    $existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-Host "⚠️ Service existiert bereits. Entferne..." -ForegroundColor Yellow
        Stop-Service -Name $ServiceName -Force
        sc.exe delete $ServiceName
        Start-Sleep -Seconds 2
    }

    # Erstelle Service
    Write-Host "📦 Erstelle Windows-Service..." -ForegroundColor Blue
    
    $servicePath = "cmd.exe"
    $serviceArgs = "/c `"$BatchScript`""
    
    sc.exe create $ServiceName binPath= "$servicePath $serviceArgs" DisplayName= "$ServiceDisplayName" start= auto
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Service erfolgreich erstellt!" -ForegroundColor Green
        
        # Service-Beschreibung setzen
        sc.exe description $ServiceName "$ServiceDescription"
        
        # Service konfigurieren
        sc.exe config $ServiceName start= auto
        sc.exe failure $ServiceName reset= 86400 actions= restart/5000/restart/10000/restart/30000
        
        # Service starten
        Write-Host "🚀 Starte Service..." -ForegroundColor Blue
        Start-Service -Name $ServiceName
        
        # Status prüfen
        $service = Get-Service -Name $ServiceName
        Write-Host "📊 Service Status: $($service.Status)" -ForegroundColor Cyan
        
        Write-Host "`n✅ Installation abgeschlossen!" -ForegroundColor Green
        Write-Host "Das Dashboard startet jetzt automatisch beim System-Start." -ForegroundColor Green
    } else {
        Write-Host "❌ Service-Erstellung fehlgeschlagen!" -ForegroundColor Red
        exit 1
    }
}

function Uninstall-DashboardService {
    Write-Host "=== Dashboard Service Deinstallation ===" -ForegroundColor Cyan
    
    # Prüfe Admin-Rechte
    if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
        Write-Host "FEHLER: Admin-Rechte erforderlich!" -ForegroundColor Red
        exit 1
    }

    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "🛑 Stoppe Service..." -ForegroundColor Yellow
        Stop-Service -Name $ServiceName -Force
        
        Write-Host "🗑️ Entferne Service..." -ForegroundColor Red
        sc.exe delete $ServiceName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Service erfolgreich entfernt!" -ForegroundColor Green
        } else {
            Write-Host "❌ Service-Entfernung fehlgeschlagen!" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Service nicht gefunden." -ForegroundColor Yellow
    }
}

function Show-ServiceStatus {
    Write-Host "=== Dashboard Service Status ===" -ForegroundColor Cyan
    
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "📊 Service Name: $($service.Name)" -ForegroundColor Blue
        Write-Host "📊 Display Name: $($service.DisplayName)" -ForegroundColor Blue
        Write-Host "📊 Status: $($service.Status)" -ForegroundColor Blue
        Write-Host "📊 Start Type: $($service.StartType)" -ForegroundColor Blue
        
        # Prüfe PID-Datei
        $pidFile = Join-Path $ProjectDir "tools\dashboard.pid"
        if (Test-Path $pidFile) {
            $dashboardPid = Get-Content $pidFile
            Write-Host "📊 Dashboard PID: $dashboardPid" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Keine PID-Datei gefunden" -ForegroundColor Yellow
        }
        
        # Zeige Log
        $logFile = Join-Path $ProjectDir "tools\dashboard-auto-starter.log"
        if (Test-Path $logFile) {
            Write-Host "`n📋 Letzte Log-Einträge:" -ForegroundColor Cyan
            Get-Content $logFile -Tail 10 | ForEach-Object { Write-Host "   $_" }
        }
    } else {
        Write-Host "❌ Service nicht installiert." -ForegroundColor Red
    }
}

# Hauptlogik
switch ($Action.ToLower()) {
    "install" { Install-DashboardService }
    "uninstall" { Uninstall-DashboardService }
    "status" { Show-ServiceStatus }
    "restart" {
        Write-Host "🔄 Starte Service neu..." -ForegroundColor Blue
        Restart-Service -Name $ServiceName -Force
        Show-ServiceStatus
    }
    default {
        Write-Host "Verwendung: .\install-dashboard-service.ps1 [install|uninstall|status|restart]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Aktionen:" -ForegroundColor Cyan
        Write-Host "  install   - Installiert das Dashboard als Windows-Service"
        Write-Host "  uninstall - Entfernt den Windows-Service"
        Write-Host "  status    - Zeigt den aktuellen Service-Status"
        Write-Host "  restart   - Startet den Service neu"
    }
}
