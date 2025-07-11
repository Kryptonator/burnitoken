# Dependabot-Konfiguration für BurniToken

Dieses Dokument enthält Informationen zur Konfiguration und Verwendung von Dependabot im BurniToken-Projekt.

## Was ist Dependabot?

Dependabot ist ein Tool von GitHub, das automatisch Pull Requests erstellt, um Abhängigkeiten in verschiedenen Paket-Ökosystemen (npm, Docker, GitHub Actions, etc.) zu aktualisieren. Es hilft dabei, Sicherheitslücken zu schließen und die Abhängigkeiten aktuell zu halten.

## Konfiguration

Die Konfiguration von Dependabot erfolgt über die Datei `.github/dependabot.yml`. Diese Datei enthält:

- **Aktualisierungsregeln für verschiedene Ökosysteme** (npm, GitHub Actions, Docker)
- **Zeitpläne** für Aktualisierungen
- **Gruppierungsregeln** für zusammengehörige Abhängigkeiten
- **Auto-Merge-Regeln** für automatisches Zusammenführen von sicheren Updates
- **Lizenz-Filterung** für die Einhaltung von Compliance-Anforderungen

## Interaktion mit GitHub Actions

Dependabot interagiert mit GitHub Actions durch folgende Workflows:

1. **dependabot-auto.yml**: Automatisiert die Verarbeitung von Dependabot PRs (Kennzeichnen, Genehmigen, Zusammenführen)
2. **dependabot-check.yml**: Führt Tests auf Dependabot-Updates aus und überprüft Lizenzkompatibilität

## Sicherheitsfeatures

Dependabot erhöht die Sicherheit durch:

- **Automatische Sicherheits-Updates**: Priorisiert das Schließen von bekannten Sicherheitslücken
- **Lizenz-Compliance-Checks**: Stellt sicher, dass nur erlaubte Lizenzen verwendet werden
- **Pull Request Tests**: Testet Updates, bevor sie in den Hauptcode integriert werden

## Fehlerbehebung

### Keine Jobs werden ausgeführt

Wenn Dependabot-PRs keine GitHub Actions Workflows auslösen:

1. **Überprüfen der Berechtigungen**: Stellen Sie sicher, dass Dependabot die erforderlichen Berechtigungen hat
2. **Branch-Konfiguration prüfen**: Die Workflow-Datei sollte Dependabot-Branches einschließen
3. **Workflow-Syntax prüfen**: Achten Sie auf korrekte YAML-Syntax

### Konfigurieren von Repository-Berechtigungen

1. Gehen Sie zu Repository-Einstellungen > Actions > General
2. Unter "Workflow permissions" wählen Sie "Read and write permissions"
3. Aktivieren Sie "Allow GitHub Actions to create and approve pull requests"

## Weitere Informationen

- [GitHub Dependabot-Dokumentation](https://docs.github.com/en/code-security/dependabot)
- [GitHub Actions für Dependabot](https://github.com/dependabot/fetch-metadata)
