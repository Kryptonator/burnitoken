# GitHub Actions Workflows für BurniToken

Dieses Verzeichnis enthält die CI/CD Workflow-Definitionen für das BurniToken-Projekt.

## Production Workflows

- **production.yml**: Haupt-Deployment-Workflow für GitHub Pages und Netlify
  - Wird ausgeführt bei Push auf die Branches: main, master, temp-merge-master
  - Baut das Projekt, führt Tests aus und deployed auf GitHub Pages und Netlify
- **production-new.yml**: Neue Version des Workflows (Referenz)
- **production-fixed.yml**: Alternative Version des Workflows (Referenz)

## Dependabot Integration (NEU)

- **dependabot-auto.yml**: Automatisches Verarbeiten von Dependabot PRs
  - Kennzeichnet automatisch Dependabot PRs mit den richtigen Labels
  - Genehmigt und merged automatisch Sicherheits-Updates und Patch-Updates
  
- **dependabot-check.yml**: Validierung von Dependabot-Updates
  - Führt Tests auf Dependabot PRs aus
  - Überprüft Lizenzkompatibilität der neuen Abhängigkeiten
  - Hinterlässt einen Kommentar mit den Ergebnissen im PR

## Backup und Emergency

- **backup-deploy.yml**: Backup-Deployment für Notfälle
  - Kann manuell ausgeführt werden, wenn das Haupt-Deployment fehlschlägt
  
- **emergency-deploy.yml**: Notfall-Deployment bei kritischen Sicherheits-Updates
  - Schneller Deployment-Prozess für dringende Fixes

Für die detaillierte Konfiguration und Anleitung, siehe [GITHUB-ACTIONS-GUIDE.md](/GITHUB-ACTIONS-GUIDE.md) und [DEPENDABOT-GUIDE.md](/DEPENDABOT-GUIDE.md)
