# 🚀 Dashboard Auto-Start System

Dieses System sorgt dafür, dass das Burni Dashboard automatisch startet und bei Abstürzen automatisch neu gestartet wird.

## ✨ Features

- **Automatischer Start** beim System-Boot
- **Crash-Recovery** - automatischer Neustart bei Abstürzen
- **Health-Monitoring** - periodische Gesundheitsprüfung
- **Windows-Service Integration** für maximale Zuverlässigkeit
- **Detailliertes Logging** für Debugging
- **Restart-Limits** um Boot-Loops zu vermeiden

## 🎯 Quick Start

### 1. Voraussetzungen prüfen
```bash
npm run dashboard:check
# oder
node tools/dashboard-startup-check.js
```

### 2. Manueller Start (für Tests)
```bash
npm run dashboard:start
# oder
node tools/dashboard-auto-starter.js
```

### 3. Windows-Service Installation (Empfohlen)
```bash
# Als Administrator ausführen!
npm run dashboard:install
```

### 4. Service-Verwaltung
```bash
npm run dashboard:status    # Status anzeigen
npm run dashboard:restart   # Neustart
npm run dashboard:uninstall # Deinstallation
```

## 📁 Dateien & Komponenten

### Kern-Komponenten
- **`dashboard-auto-starter.js`** - Hauptlogik für Auto-Start und Monitoring
- **`start-dashboard-autoboot.bat`** - Windows-Batch für System-Start
- **`install-dashboard-service.ps1`** - PowerShell für Service-Installation
- **`dashboard-startup-check.js`** - Voraussetzungen-Prüfung

### Generated Files
- **`dashboard.pid`** - Prozess-ID der laufenden Instanz
- **`dashboard-auto-starter.log`** - Detaillierte Logs
- **`startup.log`** - System-Start-Logs

## 🔧 Konfiguration

### Auto-Starter Einstellungen
```javascript
const CONFIG = {
  RESTART_DELAY: 3000,        // 3 Sekunden zwischen Neustarts
  MAX_RESTARTS: 10,           // Max. 10 Neustarts pro Zeitfenster
  RESTART_WINDOW: 300000,     // 5-Minuten-Zeitfenster
  HEALTH_CHECK_INTERVAL: 30000, // 30 Sekunden Health-Check
  STARTUP_DELAY: 5000         // 5 Sekunden nach System-Start
};
```

### Anpassungen
Die Konfiguration kann direkt in `dashboard-auto-starter.js` angepasst werden.

## 🔍 Überwachung & Debugging

### Status prüfen
```bash
npm run dashboard:status
```

### Logs einsehen
```bash
# Windows
type tools\dashboard-auto-starter.log
type tools\startup.log

# PowerShell
Get-Content tools\dashboard-auto-starter.log -Tail 20
```

### Live-Monitoring
```bash
# Windows PowerShell
Get-Content tools\dashboard-auto-starter.log -Wait
```

## 🛠️ Troubleshooting

### Dashboard startet nicht
1. Voraussetzungen prüfen: `npm run dashboard:check`
2. Manuell testen: `npm run dashboard:start`
3. Logs prüfen: `type tools\dashboard-auto-starter.log`

### Service-Probleme
```bash
# Service-Status prüfen
npm run dashboard:status

# Service neu installieren
npm run dashboard:uninstall
npm run dashboard:install
```

### Zu viele Neustarts
- Auto-Starter protokolliert jeden Neustart
- Nach 10 Neustarts in 5 Minuten wird Auto-Restart deaktiviert
- Logs prüfen für Root-Cause-Analyse

### Zombie-Prozesse
```bash
# PID-Datei manuell löschen
del tools\dashboard.pid

# Prozess finden und beenden (Windows)
tasklist | findstr node
taskkill /PID <PID> /F
```

## 🔐 Sicherheit

### Admin-Rechte
- Service-Installation benötigt Administrator-Rechte
- Manueller Start funktioniert mit normalen Benutzerrechten

### Berechtigungen
- Auto-Starter läuft mit Benutzerrechten des angemeldeten Users
- Service läuft im System-Kontext

## 🚀 Best Practices

### Entwicklung
```bash
# Für Entwicklung: Manueller Start
npm run dashboard:start
```

### Produktion
```bash
# Für Produktion: Service-Installation
npm run dashboard:install
npm run dashboard:status
```

### Monitoring
- Regelmäßige Status-Checks in CI/CD
- Log-Rotation für lange Läufe
- Alert-Integration bei kritischen Fehlern

## 📊 Monitoring-Integration

Das Dashboard-System kann mit folgenden Monitoring-Tools integriert werden:

- **Windows Event Log** (automatisch bei Service-Installation)
- **Sentry** (für Fehler-Tracking)
- **Slack/Teams** (für Status-Benachrichtigungen)
- **Prometheus/Grafana** (für Metriken)

## 🔄 Updates & Wartung

### Dashboard-Update
```bash
# Service stoppen
npm run dashboard:uninstall

# Code aktualisieren
git pull

# Service neu installieren
npm run dashboard:install
```

### Log-Rotation
Logs wachsen über Zeit. Empfohlene Rotation:
```bash
# Alte Logs archivieren
move tools\dashboard-auto-starter.log tools\dashboard-auto-starter.log.old
```

## ⚡ Performance

- **CPU-Verbrauch:** Minimal (nur Health-Checks)
- **RAM-Verbrauch:** ~10-20 MB für Auto-Starter
- **Disk I/O:** Nur für Logging
- **Netzwerk:** Kein direkter Netzwerk-Zugriff

## 🎛️ Erweiterte Optionen

### Custom Health-Checks
Auto-Starter kann erweitert werden um:
- API-Endpunkt-Checks
- Datei-Überwachung
- Memory/CPU-Monitoring
- Custom Alert-Logik

### Multi-Instance-Support
Für Load-Balancing können mehrere Dashboard-Instanzen parallel laufen.

## 📝 Changelog

### v1.0.0 (2025-07-01)
- Initiales Release
- Auto-Start und Crash-Recovery
- Windows-Service-Integration
- Health-Monitoring
- Umfassendes Logging
