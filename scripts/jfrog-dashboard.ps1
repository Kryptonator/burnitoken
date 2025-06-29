# JFrog Dashboard für BurniToken
# Zeigt eine Übersicht über Sicherheitsmetriken und Abhängigkeiten

Write-Host "📊 JFrog Abhängigkeits-Dashboard für BurniToken" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Prüfe JFrog CLI
if (-not (Test-Path ".\jfrog.exe")) {
    Write-Host "❌ JFrog CLI nicht gefunden. Bitte führe Auto-Setup aus." -ForegroundColor Red
    exit 1
}

# Zähle Abhängigkeiten
Write-Host "
📦 Abhängigkeiten analysieren..." -ForegroundColor Yellow
try {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $dependencies = ($packageJson.dependencies | Get-Member -MemberType NoteProperty).Count
    $devDependencies = ($packageJson.devDependencies | Get-Member -MemberType NoteProperty).Count
    
    Write-Host "   ✓ Produktions-Abhängigkeiten: $dependencies" -ForegroundColor Green
    Write-Host "   ✓ Entwicklungs-Abhängigkeiten: $devDependencies" -ForegroundColor Green
    Write-Host "   ✓ Gesamt: $($dependencies + $devDependencies)" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ package.json konnte nicht gelesen werden: $_" -ForegroundColor Red
}

# Führe schnellen Security-Scan durch
Write-Host "
🔒 Schneller Sicherheitscheck..." -ForegroundColor Yellow
.\jfrog.exe audit --fail=false --format=table

Write-Host "
📈 JFrog Dashboard abgeschlossen" -ForegroundColor Cyan
Write-Host "Für detailliertere Analysen nutzen Sie 'scripts\jfrog-security-scan.ps1'" -ForegroundColor Yellow
