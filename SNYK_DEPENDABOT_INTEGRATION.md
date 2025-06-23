# 🔒 Integration von Snyk und GitHub Dependabot

Dieses Dokument beschreibt die optimierte Integration von Snyk Security und GitHub Dependabot für maximale Sicherheit bei Abhängigkeiten.

**Zuletzt aktualisiert: 23.06.2025**

## Was ist neu?

- Optimierte Integration zwischen Snyk und GitHub Dependabot
- Konkurrierenden Extensions (Red Hat Dependency Analytics, JFrog) wurden entfernt
- Neues Dependency Security Management Tool
- VS Code-Einstellungen wurden für beste Leistung konfiguriert

## Konfiguration

### Snyk + GitHub Dependabot

VS Code ist nun mit optimierten Einstellungen für beide Tools konfiguriert:

```json
"snyk.advanced.organization": "burnitoken",
"snyk.scanningMode": "manual",
"snyk.additionalParameters": "--all-projects --detection-depth=3",
"snyk.snykCodeSecurity": true,
"snyk.snykCodeQuality": true,
"snyk.features.showcaseFilesWithAnyVulnerability": true,
"snyk.severity": "medium",
"snyk.autoScan.enabled": false,
"github.gitAuthentication": true,
"github.dependabot.webview": true
```

### Dependency Security Manager

Der neue Dependency Security Manager (`tools/dependency-security-manager.js`) bietet eine einheitliche Oberfläche für:

- Status-Checks beider Tools
- Schwachstellenprüfung
- Übersichtliche Berichte
- Empfehlungen zur Behebung von Problemen

## Anleitung

1. **VS Code Tasks:** Verwenden Sie den Task `🔒 Dependency Security Manager` aus der Task-Palette
2. **Terminal:** Führen Sie `node tools/dependency-security-manager.js` aus
3. **CI/CD:** Die Tools sind für automatische Überprüfungen in CI/CD-Pipelines vorbereitet

### GitHub Dependabot (wöchentliche Aktualisierungen)

GitHub Dependabot erstellt automatisch Pull Requests, wenn Abhängigkeiten aktualisiert werden müssen.
Die Konfiguration in `.github/dependabot.yml` bleibt unverändert und funktioniert optimal mit Snyk.

### Snyk Security (Tiefgreifende Analyse)

Snyk prüft den Code und die Abhängigkeiten auf tiefgreifendere Sicherheitsprobleme und ergänzt damit Dependabot.

## Nächste Schritte

- Führen Sie regelmäßige Scans mit dem Dependency Security Manager durch
- Überprüfen Sie die Dependabot Pull Requests zeitnah
- Bei größeren Projekten erwägen Sie die Verwendung von `snyk monitor` für kontinuierliche Überwachung

## Support

Bei Problemen mit der Integration:

1. VS Code neustarten und Extensions neu laden
2. Snyk CLI mit `npm install -g snyk` und `snyk auth` einrichten
3. Den Master Task Manager neu starten

---

*Diese Integration wurde speziell für das burnitoken-Projekt optimiert.*
