# 🚀 BurniToken.com - Extension Workflow Guide

Diese Dokumentation enthält Empfehlungen für VS Code Extensions, die für den optimalen Entwicklungsworkflow für das BurniToken.com-Projekt aktiviert sein sollten.

## ✅ Nach VS Code Update (Version aktualisiert am 21. Juni 2025)

Die folgende Konfiguration wurde nach dem VS Code-Update durchgeführt:

1. Automatische Extension-Updates wurden aktiviert
2. Extension-Empfehlungen werden für den Workspace beachtet
3. Alle Extensions wurden für den Workspace aktiviert
4. GitHub Copilot wurde für alle Dateitypen aktiviert

### 🔄 Weitere Updates durchführen

Falls weitere Updates nötig sind:

1. Öffnen Sie den Extensions-Tab (Ctrl+Shift+X)
2. Klicken Sie auf das "Aktualisieren"-Symbol oben in der Extensions-Ansicht
3. Installieren Sie alle Updates

## Empfohlene Extensions mit Workflow-Aktivierung

Die folgenden Extensions sollten für alle Entwickler des Projekts aktiviert sein, um einen konsistenten Workflow zu gewährleisten:

### Essentielle Extensions (immer aktiviert)

| Extension                       | Beschreibung                                 | Status    |
|--------------------------------|---------------------------------------------|-----------|
| GitHub Copilot                 | KI-gestützte Codevorschläge                 | AKTIVIERT |
| GitHub Copilot Chat            | Kontextsensitive Codehilfe                  | AKTIVIERT |
| GitLens                        | Erweiterte Git-Features                     | AKTIVIERT |
| GitHub Actions                 | Workflow-Verwaltung                         | AKTIVIERT |
| GitHub Pull Requests           | Pull Request-Integration                    | AKTIVIERT |

### Qualitätssicherung (immer aktiviert)

| Extension                       | Beschreibung                                 | Status    |
|--------------------------------|---------------------------------------------|-----------|
| Prettier                       | Code-Formatierung                           | AKTIVIERT |
| Web Accessibility              | Barrierefreiheit-Prüfungen                  | AKTIVIERT |
| HTML Validate                  | HTML-Validierung                            | AKTIVIERT |
| Code Spell Checker             | Rechtschreibprüfung                         | AKTIVIERT |

### Testing (immer aktiviert)

| Extension                       | Beschreibung                                 | Status    |
|--------------------------------|---------------------------------------------|-----------|
| Playwright                     | E2E-Tests                                   | AKTIVIERT |
| Jest                           | Unit-Tests                                  | AKTIVIERT |

### Frontend-Entwicklung

| Extension                       | Beschreibung                                 | Status    |
|--------------------------------|---------------------------------------------|-----------|
| Live Server                    | Lokaler Entwicklungsserver                  | AKTIVIERT |
| Tailwind CSS IntelliSense      | Tailwind CSS-Unterstützung                  | AKTIVIERT |
| Auto Close Tag                 | Automatisches Schließen von Tags             | Optional  |
| Auto Rename Tag                | Automatisches Umbenennen von Tags           | Optional  |

### Blockchain/Solidity (bei Bedarf)

| Extension                       | Beschreibung                                 | Status    |
|--------------------------------|---------------------------------------------|-----------|
| Solidity                       | Solidity-Sprachunterstützung                | Bei Bedarf |
| Solidity Visual Auditor        | Sicherheitsaudits für Solidity              | Bei Bedarf |

## VS Code-Einstellungen

Die folgenden globalen Einstellungen wurden für den optimalen Workflow konfiguriert:

```json
{
  "extensions.autoUpdate": true,
  "github-actions.workflows.pinned.workflows": [
    ".github/workflows/ci.yml",
    ".github/workflows/ci-cd.yml"
  ],
  "github-actions.workflows.pinned.refresh.enabled": true,
  "github-actions.workflows.pinned.refresh.interval": 60,
  "html-validate.enable": true,
  "playwright.showBrowser": false,
  "playwright.reuseBrowser": true,
  "jest.runMode": "watch"
}
```

## Empfohlener Update-Zyklus

- VS Code: Bei jeder neuen Hauptversion (~alle 1-2 Monate)
- Extensions: Alle 2 Wochen manuell aktualisieren oder automatisch (jetzt aktiviert)
- Einstellungen überprüfen: Jeden Monat

## CI/CD und Test-Workflow

Das Alert-System wurde so konfiguriert, dass bei fehlgeschlagenen Tests E-Mail-Benachrichtigungen gesendet werden. Das System nutzt:

1. GitHub Actions für CI/CD
2. Jest für Unit-Tests
3. Playwright für E2E-Tests
4. SonarQube für Code-Qualitätsanalyse
5. E-Mail-Benachrichtigungen bei Fehlern (konfiguriert mit Yahoo SMTP)

---

*Letzte Aktualisierung: 21. Juni 2025*
