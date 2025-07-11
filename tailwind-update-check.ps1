# PowerShell-Script zum Updaten und Überprüfen von TailwindCSS
# Speichern als tailwind-update-check.ps1

# Überprüfe die aktuelle TailwindCSS Version
Write-Host "===== TailwindCSS Update und Check =====" -ForegroundColor Cyan

# Prüfe, ob package.json existiert
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json nicht gefunden" -ForegroundColor Red
    exit 1
}

# Lese die package.json
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$currentVersion = $packageJson.devDependencies.tailwindcss

Write-Host "Aktuelle TailwindCSS Version: $currentVersion" -ForegroundColor Cyan

# Prüfe, ob bereits Version 4.1.10 ist
if ($currentVersion -eq "^4.1.10") {
    Write-Host "✅ TailwindCSS ist bereits auf der gewünschten Version 4.1.10" -ForegroundColor Green
} else {
    Write-Host "⚠️ TailwindCSS muss auf Version 4.1.10 aktualisiert werden" -ForegroundColor Yellow
    
    # Frage nach Bestätigung
    $confirm = Read-Host "Möchten Sie TailwindCSS auf Version 4.1.10 aktualisieren? (j/n)"
    if ($confirm -eq "j") {
        Write-Host "Aktualisiere TailwindCSS..." -ForegroundColor Yellow
        npm install tailwindcss@4.1.10 --save-dev
    } else {
        Write-Host "Update abgebrochen" -ForegroundColor Yellow
    }
}

# Prüfe die VS Code Extension für TailwindCSS
Write-Host "`nPrüfe VS Code Extension für TailwindCSS..." -ForegroundColor Cyan

# Führe VS Code Befehl aus, um Extensions zu listen
try {
    $extensions = code --list-extensions 2>$null
    if ($extensions -match "bradlc.vscode-tailwindcss") {
        Write-Host "✅ TailwindCSS Extension ist installiert" -ForegroundColor Green
    } else {
        Write-Host "⚠️ TailwindCSS Extension ist nicht installiert" -ForegroundColor Yellow
        Write-Host "Installationsbefehl: code --install-extension bradlc.vscode-tailwindcss" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Konnte VS Code Extensions nicht prüfen" -ForegroundColor Red
    Write-Host "Bitte führen Sie manuell aus: code --list-extensions | Select-String tailwind" -ForegroundColor Yellow
}

# Prüfe settings.json
Write-Host "`nPrüfe VS Code settings.json für TailwindCSS..." -ForegroundColor Cyan
$settingsPath = ".vscode\settings.json"
if (Test-Path $settingsPath) {
    $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
    
    if ($settings.PSObject.Properties.Name -contains "tailwindCSS.includeLanguages") {
        Write-Host "✅ tailwindCSS.includeLanguages ist konfiguriert" -ForegroundColor Green
    } else {
        Write-Host "⚠️ tailwindCSS.includeLanguages fehlt in settings.json" -ForegroundColor Yellow
    }
    
    if ($settings.PSObject.Properties.Name -contains "tailwindCSS.experimental.classRegex") {
        Write-Host "✅ tailwindCSS.experimental.classRegex ist konfiguriert" -ForegroundColor Green
    } else {
        Write-Host "⚠️ tailwindCSS.experimental.classRegex fehlt in settings.json" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Keine settings.json gefunden" -ForegroundColor Red
}

# Zusammenfassung
Write-Host "`n===== Zusammenfassung =====" -ForegroundColor Cyan
Write-Host "TailwindCSS Version: $currentVersion"

# Mögliche nächste Schritte
Write-Host "`n===== Nächste Schritte =====" -ForegroundColor Cyan
Write-Host "Falls Probleme bestehen bleiben:" -ForegroundColor Yellow
Write-Host "1. VS Code neu starten"
Write-Host "2. Führen Sie 'npm run build:css' aus, um das CSS neu zu generieren"
Write-Host "3. Prüfen Sie tailwind.config.js auf korrekte Konfiguration"

Write-Host "`n===== Fertig =====" -ForegroundColor Cyan
