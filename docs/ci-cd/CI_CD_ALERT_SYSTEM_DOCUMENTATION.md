# 🚀 BurniToken CI/CD & Alert System - Technische Dokumentation

## 1. CI/CD Konfiguration

Die BurniToken.website-Plattform verwendet eine moderne CI/CD-Pipeline basierend auf GitHub Actions, die aus zwei spezialisierten Workflows besteht.

### 1.1 CI-Workflow (`ci.yml`)

**Zweck**: Kontinuierliche Integration (CI) für Feature-Branches und Pull Requests

**Auslöser**:
- Pull Requests auf `main` oder `master`
- Push-Events auf `develop` oder `feature/*` Branches
- Manuelle Auslösung

**Jobs**:

1. **Test Suite** 🧪
   - Statische Code-Analyse (Linting)
   - Unit-Tests mit Jest
   - HTML-Validierung
   - Lighthouse CI für Performance-Metriken
   - Playwright E2E-Tests
   - npm audit für Dependency-Checks
   - Snyk Security Tests (optional)

2. **Security Check** 🔒
   - Snyk Security Scan
   - SonarQube Scan für Code-Qualität und Sicherheitslücken

3. **Accessibility Check** ♿
   - Axe-core Tests für WCAG-Konformität

4. **Failure Notification** 📧
   - E-Mail-Alerts bei Pipeline-Fehlern
   - Detaillierte Fehlerberichte mit Commit-Informationen

### 1.2 CI/CD-Workflow (`ci-cd.yml`)

**Zweck**: Kontinuierliche Auslieferung (CD) für den Hauptbranch

**Auslöser**:
- Push-Events auf den `main` Branch
- Pull Requests auf den `main` Branch

**Jobs**:

1. **Build-Lint-Test**
   - Code-Checkout
   - Node.js-Setup (v20)
   - Abhängigkeiten installieren
   - Code-Linting
   - Unit-Tests
   - CSS-Build
   - Lighthouse CI
   - OnPage SEO-Check
   - E2E-Tests

2. **Notify-on-Failure**
   - Discord-Notification
   - E-Mail-Alert an burn.coin@yahoo.com

## 2. Alert-System

Das Alert-System ist so konfiguriert, dass es bei CI/CD-Pipeline-Fehlern automatisch Benachrichtigungen sendet.

### 2.1 E-Mail-Alerts

**Konfiguration**:
- **SMTP-Server**: smtp.mail.yahoo.com (Port 465, SSL)
- **Absender/Empfänger**: burn.coin@yahoo.com
- **Authentifizierung**: Über YAHOO_APP_PASSWORD Secret
- **Format**: Markdown-formatierte E-Mails mit detaillierten Fehlerinformationen

**Inhalt der Benachrichtigung**:
- Commit-Hash
- Branch-Name
- Name des auslösenden Benutzers
- Workflow-Name
- Link zur GitHub Actions-Run-Seite

### 2.2 Discord-Alerts

**Konfiguration**:
- Integration über DISCORD_WEBHOOK Secret
- Formatierte Nachrichten für verbesserte Lesbarkeit

## 3. Tests & Validierung

Die Testsuite überprüft regelmäßig:

- **Funktionale Tests**: Sicherstellen, dass alle Kernfunktionen der Website korrekt arbeiten
- **Performance-Tests**: Lighthouse-Metriken für Ladezeiten und Optimierung
- **Sicherheitstests**: npm audit und Snyk für Vulnerability-Scanning
- **Accessibility-Tests**: WCAG-AA-Konformitätsprüfung mit axe-core
- **Browser-Kompatibilitätstests**: Mehrere Geräte und Browser-Umgebungen

## 4. Status-Monitoring

Status-Badges in der README.md zeigen den aktuellen Status der CI/CD-Pipeline:

- CI-Workflow-Status
- CI/CD-Workflow-Status
- Lighthouse Performance
- WCAG-Konformität

## 5. GitHub Repository-Secrets

Folgende Secrets müssen für die volle Funktionalität konfiguriert sein:

| Secret-Name | Zweck | Status |
|------------|-------|--------|
| YAHOO_APP_PASSWORD | SMTP-Authentifizierung für E-Mail-Alerts | Erforderlich |
| DISCORD_WEBHOOK | Discord-Channel-Integration | Optional |
| SNYK_TOKEN | Snyk Security Scans | Optional |
| SONAR_TOKEN | SonarQube-Integration | Optional |
| SONAR_HOST_URL | SonarQube-Server-URL | Optional |

## 6. Manuelle Tests

Um die Alert-Konfiguration zu testen:

1. Führe die Testsuite aus: `npm test tests/alert-system.test.js`
2. Prüfe den Ethereal-Test-Mail-Link in der Konsole
3. Bei vollem E2E-Test, provoziere einen Pipeline-Fehler und prüfe den E-Mail-Eingang

---

**Zuletzt aktualisiert**: 21.06.2025  
**Erstellt von**: GitHub Copilot  
**Version**: 1.0
