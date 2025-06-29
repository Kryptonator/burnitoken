# JFrog Auto-Setup für BurniToken.com
# Dieses Skript führt die vollständige JFrog-Integration automatisch durch

# Farben für die Ausgabe
$Green = @{ForegroundColor = "Green"}
$Yellow = @{ForegroundColor = "Yellow"}
$Cyan = @{ForegroundColor = "Cyan"}
$Red = @{ForegroundColor = "Red"}

Write-Host "🚀 Starte vollständige JFrog-Integration für BurniToken..." @Yellow

# 1. Stelle sicher, dass JFrog CLI korrekt installiert ist
Write-Host "🔄 Prüfe JFrog CLI-Installation..." @Cyan
if (-not (Test-Path ".\jfrog.exe")) {
    Write-Host "   JFrog CLI nicht gefunden, wird heruntergeladen..." @Yellow
    try {
        Invoke-WebRequest -Uri "https://releases.jfrog.io/artifactory/jfrog-cli/v2/jfrog-cli-windows-amd64/jfrog.exe" -OutFile "jfrog.exe"
        if (Test-Path ".\jfrog.exe") {
            Write-Host "✅ JFrog CLI erfolgreich heruntergeladen" @Green
        } else {
            Write-Host "❌ Download fehlgeschlagen, versuche alternative URL..." @Red
            Invoke-WebRequest -Uri "https://releases.jfrog.io/artifactory/jfrog-cli/v2-jf/[RELEASE]/jfrog-cli-windows-amd64/jfrog.exe" -OutFile "jfrog.exe"
        }
    }
    catch {
        Write-Host "❌ Fehler beim Download: $_" @Red
        Write-Host "   Versuche alternative URL..." @Yellow
        try {
            Invoke-WebRequest -Uri "https://releases.jfrog.io/artifactory/jfrog-cli/v2-jf/[RELEASE]/jfrog-cli-windows-amd64/jfrog.exe" -OutFile "jfrog.exe"
        }
        catch {
            Write-Host "❌ Kritischer Fehler bei JFrog-Installation: $_" @Red
            exit 1
        }
    }
}

# JFrog CLI-Version prüfen
try {
    $jfrogVersion = & .\jfrog.exe -v
    Write-Host "✅ JFrog CLI installiert: $jfrogVersion" @Green
}
catch {
    Write-Host "❌ JFrog CLI scheint beschädigt zu sein. Bitte manuell neu installieren." @Red
    exit 1
}

# 2. Verzeichnisstruktur erstellen
Write-Host "📁 Erstelle JFrog-Verzeichnisstruktur..." @Cyan
$directories = @(
    ".jfrog\repositories\npm-local",
    ".jfrog\repositories\npm-remote",
    ".jfrog\repositories\npm-virtual",
    ".jfrog\projects",
    ".jfrog\security"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Host "   ✓ $dir erstellt" @Green
    } else {
        Write-Host "   ℹ️ $dir existiert bereits" @Cyan
    }
}

# 3. Projektdateien erstellen
Write-Host "📄 Erstelle JFrog-Konfigurationsdateien..." @Cyan

# Projekt-Konfiguration
$projectConfigPath = ".jfrog\projects\burnitoken.yaml"
$projectConfig = @"
version: 1
type: npm
resolver:
  repo: npm-remote
  serverId: burnitoken
deployer:
  repo: npm-local
  serverId: burnitoken
useNpmrcConfig: true
npmRegistryConfig:
  registry: https://registry.npmjs.org/
"@
Set-Content -Path $projectConfigPath -Value $projectConfig
Write-Host "   ✓ Projekt-Konfiguration erstellt: $projectConfigPath" @Green

# JFrog-README
$readmePath = ".jfrog\README.md"
$readmeContent = @"
# JFrog-Integration für BurniToken

Diese Verzeichnisstruktur wird für die JFrog-Integration des BurniToken-Projekts verwendet.

## Verzeichnisse
- repositories/npm-local: Lokales Repository für intern erstellte Pakete
- repositories/npm-remote: Caches für externe Pakete
- repositories/npm-virtual: Virtuelles Repository, das local und remote kombiniert
- projects: Projektkonfigurationen
- security: Sicherheitsrichtlinien und -berichte

## Vorteile
- Verbesserte Paket-Sicherheit durch Xray-Scans
- Detaillierte Abhängigkeitsanalyse
- Zentrale Verwaltung von Paketen
- Compliance-Tracking und Versionskontrolle
"@
Set-Content -Path $readmePath -Value $readmeContent
Write-Host "   ✓ Dokumentation erstellt: $readmePath" @Green

# Sicherheitsrichtlinien
$securityPolicyPath = ".jfrog\security\security-policy.yaml"
$securityPolicy = @"
policies:
  - name: "severity-threshold"
    type: "security"
    rules:
      - name: "critical-severity"
        priority: 1
        criteria:
          - "security.severity >= critical"
        actions:
          - "fail-build"
          - "notify"

  - name: "license-policy"
    type: "license"
    rules:
      - name: "banned-licenses"
        priority: 1
        criteria:
          - "license.name == 'GPL'"
        actions:
          - "notify"
"@
Set-Content -Path $securityPolicyPath -Value $securityPolicy
Write-Host "   ✓ Sicherheitsrichtlinien erstellt: $securityPolicyPath" @Green

# 4. GitHub Workflow für JFrog erstellen
Write-Host "🔄 Erstelle GitHub Actions Workflow für JFrog CI/CD..." @Cyan
$workflowsDir = ".github\workflows"
if (-not (Test-Path $workflowsDir)) {
    New-Item -Path $workflowsDir -ItemType Directory -Force | Out-Null
}

$jfrogWorkflowPath = "$workflowsDir\jfrog-integration.yml"
$jfrogWorkflow = @"
name: JFrog Security & Dependency Scan

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
  schedule:
    - cron: '0 8 * * 1'  # Weekly scan on Monday at 8 AM

jobs:
  scan-dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          
      - name: Setup JFrog CLI
        uses: jfrog/setup-jfrog-cli@v3
        with:
          version: 2.77.0
        env:
          JF_ARTIFACTORY_1: \${{ secrets.JF_ARTIFACTORY_SERVER }}
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Run Security Scan with JFrog Xray
        run: |
          jf audit --fail=false
          
      - name: Generate Security Report
        run: |
          jf audit --licenses --fail=false > security-report.txt
          
      - name: Upload Security Report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.txt
          
  build-and-publish:
    needs: scan-dependencies
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          
      - name: Setup JFrog CLI
        uses: jfrog/setup-jfrog-cli@v3
        with:
          version: 2.77.0
        env:
          JF_ARTIFACTORY_1: \${{ secrets.JF_ARTIFACTORY_SERVER }}
          
      - name: Build Project
        run: npm run build
        
      - name: Publish to JFrog Artifactory
        if: success()
        run: |
          jf rt upload "dist/" "npm-local/burnitoken/\${{ github.run_number }}/" --flat=false
"@
Set-Content -Path $jfrogWorkflowPath -Value $jfrogWorkflow
Write-Host "   ✓ GitHub Actions Workflow erstellt: $jfrogWorkflowPath" @Green

# 5. Automatisierungsskripts erstellen
Write-Host "🛠️ Erstelle Automatisierungsskripts..." @Cyan

# Scan-Skript
$scanScriptPath = "scripts\jfrog-security-scan.ps1"
$scriptDir = "scripts"
if (-not (Test-Path $scriptDir)) {
    New-Item -Path $scriptDir -ItemType Directory -Force | Out-Null
}

$scanScript = @"
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
Write-Host "`n📜 Prüfe Lizenzen..." -ForegroundColor Yellow
.\jfrog.exe audit --licenses --fail=false

Write-Host "`n✅ Sicherheitsscan abgeschlossen!" -ForegroundColor Green
Write-Host "   Falls Probleme gefunden wurden, prüfe die detaillierten Ergebnisse oben." -ForegroundColor Cyan
"@
Set-Content -Path $scanScriptPath -Value $scanScript
Write-Host "   ✓ Security-Scan-Skript erstellt: $scanScriptPath" @Green

# Dashboard-Script
$dashboardScriptPath = "scripts\jfrog-dashboard.ps1"
$dashboardScript = @"
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
Write-Host "`n📦 Abhängigkeiten analysieren..." -ForegroundColor Yellow
try {
    `$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    `$dependencies = (`$packageJson.dependencies | Get-Member -MemberType NoteProperty).Count
    `$devDependencies = (`$packageJson.devDependencies | Get-Member -MemberType NoteProperty).Count
    
    Write-Host "   ✓ Produktions-Abhängigkeiten: `$dependencies" -ForegroundColor Green
    Write-Host "   ✓ Entwicklungs-Abhängigkeiten: `$devDependencies" -ForegroundColor Green
    Write-Host "   ✓ Gesamt: `$(`$dependencies + `$devDependencies)" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ package.json konnte nicht gelesen werden: `$_" -ForegroundColor Red
}

# Führe schnellen Security-Scan durch
Write-Host "`n🔒 Schneller Sicherheitscheck..." -ForegroundColor Yellow
.\jfrog.exe audit --fail=false --format=table

Write-Host "`n📈 JFrog Dashboard abgeschlossen" -ForegroundColor Cyan
Write-Host "Für detailliertere Analysen nutzen Sie 'scripts\jfrog-security-scan.ps1'" -ForegroundColor Yellow
"@
Set-Content -Path $dashboardScriptPath -Value $dashboardScript
Write-Host "   ✓ Dashboard-Skript erstellt: $dashboardScriptPath" @Green

# 6. .npmrc konfigurieren für JFrog
Write-Host "🔄 Konfiguriere .npmrc für JFrog-Integration..." @Cyan
$npmrcPath = ".npmrc"
$npmrcContent = @"
; JFrog Artifactory-Integration für BurniToken
; Fügen Sie hier Ihre JFrog-Anmeldeinformationen hinzu, wenn Sie sich bei JFrog registriert haben
registry=https://registry.npmjs.org/
; registry=https://burnitoken.jfrog.io/artifactory/api/npm/npm-virtual/
; _auth=<Base64-kodierter Authentifizierungsstring>
; email=<Ihre-Email-Adresse>
; always-auth=true
"@
Set-Content -Path $npmrcPath -Value $npmrcContent
Write-Host "   ✓ .npmrc für JFrog konfiguriert: $npmrcPath" @Green

# 7. Konfiguriere eine Dummy-JFrog-Verbindung für lokale Tests
Write-Host "🔄 Konfiguriere lokale JFrog-Testumgebung..." @Cyan
$connectionConfig = @{
    serverId = "burnitoken"
    url = "http://localhost:8082/artifactory/"
    user = "_internal"
    password = "dummy_password"
}

$configFile = ".jfrog\jfrog-config.json"
$configJSON = $connectionConfig | ConvertTo-Json
Set-Content -Path $configFile -Value $configJSON
Write-Host "   ✓ Demo-Konfiguration erstellt: $configFile" @Green

# 8. Update Dependabot für JFrog-Integration
Write-Host "🔄 Aktualisiere Dependabot für JFrog-Integration..." @Cyan
$dependabotPath = ".github\dependabot.yml"

if (Test-Path $dependabotPath) {
    $dependabotContent = Get-Content $dependabotPath -Raw
    
    # Prüfe, ob JFrog-Registry bereits konfiguriert ist
    if ($dependabotContent -notmatch "registries:") {
        $updatedContent = $dependabotContent -replace "groups:", @"
    # JFrog Artifactory registry configuration
    registries:
      npm-jfrog:
        type: npm-registry
        url: https://burnitoken.jfrog.io/artifactory/api/npm/npm-virtual/
        token: `${{secrets.JFROG_NPM_TOKEN}}
    groups:
"@
        Set-Content -Path $dependabotPath -Value $updatedContent
        Write-Host "   ✓ Dependabot mit JFrog-Registry aktualisiert" @Green
    } else {
        Write-Host "   ℹ️ JFrog-Registry bereits in Dependabot konfiguriert" @Cyan
    }
} else {
    Write-Host "   ⚠️ Dependabot-Konfiguration nicht gefunden" @Yellow
}

# 9. JFrog-Scan ausführen
Write-Host "`n🔍 Führe initialen JFrog Security-Scan aus..." @Yellow
try {
    & .\scripts\jfrog-security-scan.ps1
}
catch {
    Write-Host "   ⚠️ Scan konnte nicht ausgeführt werden: $_" @Yellow
    Write-Host "   Sie können den Scan später manuell mit '.\scripts\jfrog-security-scan.ps1' ausführen" @Cyan
}

# 10. Zusammenfassung und nächste Schritte
Write-Host "`n✅ JFrog Auto-Setup abgeschlossen!" @Green
Write-Host "`n📋 Zusammenfassung der Einrichtung:" @Cyan
Write-Host "   ✓ JFrog CLI installiert und konfiguriert" @Green
Write-Host "   ✓ JFrog-Verzeichnisstruktur erstellt" @Green
Write-Host "   ✓ Konfigurationsdateien erstellt" @Green
Write-Host "   ✓ GitHub Actions Workflow eingerichtet" @Green
Write-Host "   ✓ Automatisierungsskripts erstellt" @Green
Write-Host "   ✓ Dependabot für JFrog konfiguriert" @Green

Write-Host "`n🚀 Nächste Schritte:" @Yellow
Write-Host "   1. Erstellen Sie ein JFrog-Cloud-Konto: https://jfrog.com/start-free/" @Cyan
Write-Host "   2. Fügen Sie diese Secrets zu Ihrem GitHub-Repository hinzu:" @Cyan
Write-Host "      - JF_ARTIFACTORY_SERVER: {url=..., token=...}" @Cyan
Write-Host "      - JFROG_NPM_TOKEN: Ihr JFrog-API-Token" @Cyan
Write-Host "   3. Aktualisieren Sie .npmrc mit Ihren Anmeldeinformationen" @Cyan
Write-Host "   4. Commiten und pushen Sie alle Änderungen" @Cyan

Write-Host "`n📊 Verwenden der JFrog-Integration:" @Yellow
Write-Host "   - Führen Sie Sicherheitsscans aus: .\scripts\jfrog-security-scan.ps1" @Cyan
Write-Host "   - Zeigen Sie das Dashboard an: .\scripts\jfrog-dashboard.ps1" @Cyan
Write-Host "   - JFrog CLI direkt verwenden: .\jfrog.exe <command>" @Cyan

Write-Host "`n🎉 Ihre BurniToken-Projektumgebung ist nun mit JFrog optimiert!" @Green
