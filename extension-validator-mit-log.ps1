# Extension Function Validator (PowerShell Version mit Datei-Output)
# Erstelle Log-Datei
$logFile = "extension-validator-results.txt"
"🚀 Extension Function Validator wird gestartet..." | Out-File -FilePath $logFile

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

# Log-Funktion
function Write-Log {
  param ([string]$message)
  $message | Out-File -FilePath $logFile -Append
}

# Prüfe, ob eine Datei existiert
function Test-FileExistence($filePath) {
  return Test-Path -Path $filePath
}

# Prüfe installierte Extensions
Write-Log "🔍 Prüfe installierte VS Code Extensions..."
try {
  $installedExtensions = code --list-extensions | Where-Object { $_ -ne "" }
  Write-Log "✅ Gefunden: $($installedExtensions.Count) installierte Extensions"
  
  foreach ($ext in $CRITICAL_EXTENSIONS) {
    if ($installedExtensions -contains $ext) {
      $healthyExtensions += $ext
    } else {
      $issuesExtensions += $ext
      Write-Log "⚠️ Kritische Extension nicht installiert: $ext"
    }
  }
} catch {
  Write-Log "❌ Fehler beim Prüfen der installierten Extensions: $_"
}

# Prüfe VS Code Einstellungen
if (Test-FileExistence $SETTINGS_PATH) {
  Write-Log "✅ settings.json gefunden"
} else {
  Write-Log "⚠️ settings.json nicht gefunden!"
  $recommendations += "settings.json erstellen"
}

if (Test-FileExistence $EXTENSIONS_PATH) {
  Write-Log "✅ extensions.json gefunden"
} else {
  Write-Log "⚠️ extensions.json nicht gefunden!"
  $recommendations += "extensions.json erstellen"
}

# Prüfe KI-Integration Dateien
Write-Log "`n🧠 Prüfe KI-Integration..."

$missingFiles = @()
foreach ($file in $AI_INTEGRATION_FILES) {
  if (-not (Test-FileExistence $file)) {
    $missingFiles += $file
  }
}

if ($missingFiles.Count -gt 0) {
  Write-Log "⚠️ Fehlende KI-Integrationsdateien: $($missingFiles -join ', ')"
  $recommendations += "KI-Integration ist unvollständig"
} else {
  Write-Log "✅ KI-Integrationsdateien vollständig"
}

# Prüfe tasks.json für Auto-Start-Konfiguration
$TASKS_PATH = ".vscode\tasks.json"
if (Test-FileExistence $TASKS_PATH) {
  Write-Log "✅ tasks.json gefunden"
  
  try {
    $tasksContent = Get-Content -Path $TASKS_PATH -Raw | ConvertFrom-Json
    
    # Prüfe Session-Saver Task
    $hasSessionSaverTask = $false
    $hasAIBridgeTask = $false
    
    foreach ($task in $tasksContent.tasks) {
      if ($task.label -like "*Session-Saver*") {
        $hasSessionSaverTask = $true
        if ($task.runOptions.runOn -ne "folderOpen") {
          Write-Log "⚠️ Session-Saver hat keinen automatischen Start"
          $recommendations += "Session-Saver Auto-Start fehlt"
        } else {
          Write-Log "✅ Session-Saver Auto-Start konfiguriert"
        }
      }
      
      if ($task.label -like "*AI Conversation Bridge*") {
        $hasAIBridgeTask = $true
        if ($task.runOptions.runOn -ne "folderOpen") {
          Write-Log "⚠️ AI Conversation Bridge hat keinen automatischen Start"
          $recommendations += "AI Bridge Auto-Start fehlt"
        } else {
          Write-Log "✅ AI Conversation Bridge Auto-Start konfiguriert"
        }
      }
    }
    
    if (-not $hasSessionSaverTask) {
      Write-Log "⚠️ Kein Session-Saver Task gefunden"
      $recommendations += "Session-Saver Task fehlt"
    }
    
    if (-not $hasAIBridgeTask) {
      Write-Log "⚠️ Kein AI Conversation Bridge Task gefunden"
      $recommendations += "AI Bridge Task fehlt"
    }
  } catch {
    Write-Log "⚠️ Fehler beim Lesen der tasks.json: $_"
  }
} else {
  Write-Log "⚠️ tasks.json nicht gefunden!"
  $recommendations += "tasks.json für Auto-Start fehlt"
}

# Ausgabe des Ergebnisses
Write-Log "`n📊 Extension Health Check Ergebnis:"
Write-Log "=============================="
Write-Log "✅ Gesunde Extensions: $($healthyExtensions.Count)"
Write-Log "⚠️ Extensions mit Problemen: $($issuesExtensions.Count)"
Write-Log "💡 Empfehlungen: $($recommendations.Count)"

if ($issuesExtensions.Count -eq 0) {
  Write-Log "`n🎉 Alle kritischen Extensions sind korrekt installiert und konfiguriert!"
} else {
  Write-Log "`n⚠️ Es wurden Probleme gefunden die behoben werden sollten:"
  foreach ($issue in $issuesExtensions) {
    Write-Log "  - Fehlende kritische Extension: $issue"
  }
  
  Write-Log "`nFühren Sie folgende Befehle aus, um fehlende Extensions zu installieren:"
  foreach ($issue in $issuesExtensions) {
    Write-Log "  code --install-extension $issue"
  }
}

if ($recommendations.Count -gt 0) {
  Write-Log "`n💡 Empfehlungen zur Optimierung:"
  foreach ($recommendation in $recommendations) {
    Write-Log "  - $recommendation"
  }
}

Write-Log "`n✅ Extension Function Validator abgeschlossen!"
Write-Log "Ergebnisse wurden in $logFile gespeichert."

# Erstelle auch eine JSON-Ausgabe für andere Module
$result = @{
  healthy = $healthyExtensions.Count
  issues = $issuesExtensions.Count
  recommendations = $recommendations.Count
  healthyExtensions = $healthyExtensions
  issuesExtensions = $issuesExtensions
  recommendationsList = $recommendations
}

$result | ConvertTo-Json | Out-File -FilePath "extension-validator-results.json"
