# JFrog Security Scan für BurniToken
# Führt einen vollständigen Sicherheitsscan der Abhängigkeiten durch

Write-Host "🔍 Starte JFrog Security Scan..." -ForegroundColor Cyan

# Prüfe JFrog CLI
if (-not (Test-Path ".\jfrog.exe")) {
    Write-Host "❌ JFrog CLI nicht gefunden. Bitte führe Auto-Setup aus." -ForegroundColor Red
    exit 1
}

# Führe Audit aus
Write-Host "📊 Führe Abhängigkeits-Audit durch..." -ForegroundColor Yellow
.\jfrog.exe audit --fail=false

# Führe Lizenz-Prüfung durch
Write-Host "
📜 Prüfe Lizenzen..." -ForegroundColor Yellow
.\jfrog.exe audit --licenses --fail=false

Write-Host "
✅ Sicherheitsscan abgeschlossen!" -ForegroundColor Green
Write-Host "   Falls Probleme gefunden wurden, prüfe die detaillierten Ergebnisse oben." -ForegroundColor Cyan
