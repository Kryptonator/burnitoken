# BurniToken Alert-System

In diesem Ordner werden alle Alert-bezogenen Dateien, Logs und Testskripte gesammelt.

- `logs/` – Hier werden zukünftig Alert-Logs gespeichert
- `test-alert.js` – Testskript für E-Mail-Benachrichtigung
- `alert-service.js` – Zentrale Alert-Logik (wird aus `tools` hierher verschoben)

## Hinweise
- Für E-Mail-Benachrichtigungen muss ein App-Passwort für Yahoo gesetzt sein.
- Die Alert-Logik kann für weitere Kanäle (Slack, Webhook, etc.) erweitert werden.
