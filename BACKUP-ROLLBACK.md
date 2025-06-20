# BurniToken.com – Backup & Rollback

## Rollback-Anleitung

1. Im Repository auf GitHub den gewünschten Commit auswählen.
2. Über die GitHub-Oberfläche oder lokal mit `git checkout <commit>` und `git push --force` zurücksetzen.
3. Netlify/GitHub Pages deployen automatisch den Stand des Repos.

## Backup-Strategie
- Jeder Commit ist ein Backup (GitHub, Netlify)
- Netlify-Backup-URL: https://burnitoken.netlify.app
- Manuelle Snapshots können als Release getaggt werden

## Monitoring
- UptimeRobot oder Netlify Monitoring nutzen
- Reports und Validierungen im Repo versioniert

---

> Für Notfälle: README-LIVE.md und diese Datei beachten!
