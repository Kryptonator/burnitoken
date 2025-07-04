# JFrog Setup-Skript für BurniToken-Projekt
# Dieses Skript hilft dabei, JFrog für lokale Entwicklung einzurichten

# Prüfe, ob JFrog CLI installiert ist
function Test-JFrogCLI {
    try {
        $jfrogVersion = & .\jfrog.exe -v
        Write-Host "✅ JFrog CLI ist installiert: $jfrogVersion" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ JFrog CLI ist nicht installiert" -ForegroundColor Red
        return $false
    }
}

# JFrog CLI installieren, wenn nötig
if (-not (Test-JFrogCLI)) {
    Write-Host "🔄 Installiere JFrog CLI..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://releases.jfrog.io/artifactory/jfrog-cli/v2/[RELEASE]/jfrog-cli-windows-amd64/jfrog.exe" -OutFile "jfrog.exe"
        if (Test-JFrogCLI) {
            Write-Host "✅ JFrog CLI wurde erfolgreich installiert!" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Fehler bei der Installation von JFrog CLI: $_" -ForegroundColor Red
        exit 1
    }
}

# Konfiguriere lokale JFrog-Umgebung
Write-Host "🔧 Konfiguriere lokale JFrog-Umgebung..." -ForegroundColor Cyan

# Erstelle notwendige Verzeichnisse
New-Item -Path ".jfrog\repositories\npm-local" -ItemType Directory -Force | Out-Null
New-Item -Path ".jfrog\repositories\npm-remote" -ItemType Directory -Force | Out-Null
New-Item -Path ".jfrog\repositories\npm-virtual" -ItemType Directory -Force | Out-Null
New-Item -Path ".jfrog\projects" -ItemType Directory -Force | Out-Null

Write-Host "✅ JFrog-Repository-Struktur erstellt" -ForegroundColor Green

# Erstelle ein README im JFrog-Ordner für mehr Kontext
$readmeContent = @"
# JFrog-Integration für BurniToken

Diese Verzeichnisstruktur wird für die lokale JFrog-Integration verwendet.

## Verzeichnisse
- repositories/npm-local: Lokales Repository für intern erstellte Pakete
- repositories/npm-remote: Caches für externe Pakete
- repositories/npm-virtual: Virtuelles Repository, das local und remote kombiniert
- projects: Projektkonfigurationen

## Setup
Um die JFrog-Integration vollständig einzurichten, müssen Sie:
1. Ein JFrog Cloud-Konto erstellen oder JFrog Artifactory selbst hosten
2. Die entsprechenden Secrets in GitHub einrichten (JF_URL, JF_ACCESS_TOKEN)
3. Die .jfrog/projects/burnitoken.yaml-Konfiguration aktualisieren

## Vorteile
- Verbesserte Paket-Sicherheit
- Detaillierte Abhängigkeitsanalyse
- Zentrale Verwaltung von Paketen
- Compliance-Tracking
"@
Set-Content -Path ".jfrog\README.md" -Value $readmeContent

Write-Host "📋 README für JFrog-Integration erstellt" -ForegroundColor Green

# Informationen zur Einrichtung von JFrog Cloud
Write-Host "`n🌟 Nächste Schritte zur vollständigen JFrog-Integration:" -ForegroundColor Yellow
Write-Host "1. Registrieren Sie sich für ein JFrog Cloud-Konto: https://jfrog.com/start-free/" -ForegroundColor Cyan
Write-Host "2. Erstellen Sie diese Secrets in Ihrem GitHub-Repository:" -ForegroundColor Cyan
Write-Host "   - JF_URL: Die URL Ihrer JFrog-Plattform" -ForegroundColor Cyan
Write-Host "   - JF_ACCESS_TOKEN: Ihr JFrog-Zugriffstoken" -ForegroundColor Cyan
Write-Host "3. Aktualisieren Sie die .jfrog/projects/burnitoken.yaml mit Ihren Server-Details" -ForegroundColor Cyan
Write-Host "`n💡 Tipp: Mit 'jfrog.exe config add' können Sie JFrog CLI manuell konfigurieren" -ForegroundColor Green

Write-Host "`n✅ JFrog-Setup-Skript abgeschlossen!" -ForegroundColor Green
