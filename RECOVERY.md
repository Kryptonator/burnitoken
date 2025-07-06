# Disaster Recovery Guide

## 1. Backup-Wiederherstellung

1. Gehe ins Backup-Repository (siehe GitHub Secrets `BACKUP_REPO`).
2. Lade die gewünschte Version (z.B. letzte funktionierende Version) herunter.
3. Ersetze die defekten oder verlorenen Dateien im Hauptprojekt durch die Backup-Dateien.
4. Prüfe die Funktion lokal und pushe ggf. ins Haupt-Repo.

## 2. Notfallmaßnahmen bei Ausfall

- Prüfe die Health-Check- und Monitoring-Alerts (Slack, Discord, Status-Webhook).
- Analysiere die Fehlerberichte (`HEALTH_REPORT.md`, Issues).
- Führe ggf. einen Rollback mit den Backup-Dateien durch.

## 3. Kontakt & Support

- Bei kritischen Problemen: Team benachrichtigen (Slack/Discord).
- Recovery-Schritte dokumentieren und im Issue-Tracker festhalten.

---

**Hinweis:** Backups werden täglich und bei jedem Push automatisch erstellt. Die Zugangsdaten zum Backup-Repo sind sicher in den GitHub Secrets hinterlegt.
