# Extension Function Validator (PowerShell Version)
Write-Host "🚀 Extension Function Validator wird gestartet..." -ForegroundColor Cyan

# Definiere Pfade
$SETTINGS_PATH = ".vscode\settings.json"
$EXTENSIONS_PATH = ".vscode\extensions.json"

# Kritische Extensions
$CRITICAL_EXTENSIONS = @(
  "bradlc.vscode-tailwindcss",
  "esbenp.prettier-vscode",
  "dbaeumer.vscode-eslint",
  "html-validate.vscode-html-validate",
  "maxvanderschee.web-accessibility",
  "ritwickdey.liveserver",
  "eamodio.gitlens",
  "github.copilot",
  "ms-playwright.playwright"
)

# KI-Integration-Dateien
$AI_INTEGRATION_FILES = @(
  "tools/session-saver.js",
  "tools/recover-session.js",
  "tools/start-session-saver.js",
  "tools/ai-conversation-bridge.js",
  "tools/start-ai-bridge.js",
  "tools/model-switch.js",
  "tools/ai-status.js",
  "tools/ai-status-fix.js",
  "tools/ai-services-manager.js"
)

# Status-Tracking
$healthyExtensions = @()
$issuesExtensions = @()
$recommendations = @()

# Prüfe, ob eine Datei existiert
function Test-FileExistence($filePath) {
  return Test-Path -Path $filePath
}

# Prüfe installierte Extensions
Write-Host "🔍 Prüfe installierte VS Code Extensions..." -ForegroundColor Cyan
try {
  $installedExtensions = code --list-extensions | Where-Object { $_ -ne "" }
  Write-Host "✅ Gefunden: $($installedExtensions.Count) installierte Extensions" -ForegroundColor Green
  
  foreach ($ext in $CRITICAL_EXTENSIONS) {
    if ($installedExtensions -contains $ext) {
      $healthyExtensions += $ext
    } else {
      $issuesExtensions += $ext
      Write-Host "⚠️ Kritische Extension nicht installiert: $ext" -ForegroundColor Yellow
    }
  }
} catch {
  Write-Host "❌ Fehler beim Prüfen der installierten Extensions: $_" -ForegroundColor Red
}

# Prüfe VS Code Einstellungen
if (Test-FileExistence $SETTINGS_PATH) {
  Write-Host "✅ settings.json gefunden" -ForegroundColor Green
} else {
  Write-Host "⚠️ settings.json nicht gefunden!" -ForegroundColor Yellow
  $recommendations += "settings.json erstellen"
}

if (Test-FileExistence $EXTENSIONS_PATH) {
  Write-Host "✅ extensions.json gefunden" -ForegroundColor Green
} else {
  Write-Host "⚠️ extensions.json nicht gefunden!" -ForegroundColor Yellow
  $recommendations += "extensions.json erstellen"
}

# Prüfe KI-Integration Dateien
Write-Host "`n🧠 Prüfe KI-Integration..." -ForegroundColor Cyan

$missingFiles = @()
foreach ($file in $AI_INTEGRATION_FILES) {
  if (-not (Test-FileExistence $file)) {
    $missingFiles += $file
  }
}

if ($missingFiles.Count -gt 0) {
  Write-Host "⚠️ Fehlende KI-Integrationsdateien: $($missingFiles -join ', ')" -ForegroundColor Yellow
  $recommendations += "KI-Integration ist unvollständig"
} else {
  Write-Host "✅ KI-Integrationsdateien vollständig" -ForegroundColor Green
}

# Prüfe tasks.json für Auto-Start-Konfiguration
$TASKS_PATH = ".vscode\tasks.json"
if (Test-FileExistence $TASKS_PATH) {
  Write-Host "✅ tasks.json gefunden" -ForegroundColor Green
  
  try {
    $tasksContent = Get-Content -Path $TASKS_PATH -Raw | ConvertFrom-Json
    
    # Prüfe Session-Saver Task
    $hasSessionSaverTask = $false
    $hasAIBridgeTask = $false
    
    foreach ($task in $tasksContent.tasks) {
      if ($task.label -like "*Session-Saver*") {
        $hasSessionSaverTask = $true
        if ($task.runOptions.runOn -ne "folderOpen") {
          Write-Host "⚠️ Session-Saver hat keinen automatischen Start" -ForegroundColor Yellow
          $recommendations += "Session-Saver Auto-Start fehlt"
        } else {
          Write-Host "✅ Session-Saver Auto-Start konfiguriert" -ForegroundColor Green
        }
      }
      
      if ($task.label -like "*AI Conversation Bridge*") {
        $hasAIBridgeTask = $true
        if ($task.runOptions.runOn -ne "folderOpen") {
          Write-Host "⚠️ AI Conversation Bridge hat keinen automatischen Start" -ForegroundColor Yellow
          $recommendations += "AI Bridge Auto-Start fehlt"
        } else {
          Write-Host "✅ AI Conversation Bridge Auto-Start konfiguriert" -ForegroundColor Green
        }
      }
    }
    
    if (-not $hasSessionSaverTask) {
      Write-Host "⚠️ Kein Session-Saver Task gefunden" -ForegroundColor Yellow
      $recommendations += "Session-Saver Task fehlt"
    }
    
    if (-not $hasAIBridgeTask) {
      Write-Host "⚠️ Kein AI Conversation Bridge Task gefunden" -ForegroundColor Yellow
      $recommendations += "AI Bridge Task fehlt"
    }
  } catch {
    Write-Host "⚠️ Fehler beim Lesen der tasks.json: $_" -ForegroundColor Yellow
  }
} else {
  Write-Host "⚠️ tasks.json nicht gefunden!" -ForegroundColor Yellow
  $recommendations += "tasks.json für Auto-Start fehlt"
}

# Ausgabe des Ergebnisses
Write-Host "`n📊 Extension Health Check Ergebnis:" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "✅ Gesunde Extensions: $($healthyExtensions.Count)" -ForegroundColor Green
Write-Host "⚠️ Extensions mit Problemen: $($issuesExtensions.Count)" -ForegroundColor Yellow
Write-Host "💡 Empfehlungen: $($recommendations.Count)" -ForegroundColor Magenta

if ($issuesExtensions.Count -eq 0) {
  Write-Host "`n🎉 Alle kritischen Extensions sind korrekt installiert und konfiguriert!" -ForegroundColor Green
} else {
  Write-Host "`n⚠️ Es wurden Probleme gefunden die behoben werden sollten:" -ForegroundColor Yellow
  foreach ($issue in $issuesExtensions) {
    Write-Host "  - Fehlende kritische Extension: $issue" -ForegroundColor Yellow
  }
  
  Write-Host "`nFühren Sie folgende Befehle aus, um fehlende Extensions zu installieren:" -ForegroundColor Cyan
  foreach ($issue in $issuesExtensions) {
    Write-Host "  code --install-extension $issue" -ForegroundColor White
  }
}

if ($recommendations.Count -gt 0) {
  Write-Host "`n💡 Empfehlungen zur Optimierung:" -ForegroundColor Magenta
  foreach ($recommendation in $recommendations) {
    Write-Host "  - $recommendation" -ForegroundColor White
  }
}

Write-Host "`n✅ Extension Function Validator abgeschlossen!" -ForegroundColor Green
