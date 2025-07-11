# 🔒 Snyk Schnellstart-Guide

## Einrichtung

1. **Snyk-Account**: Erstellen Sie einen Account auf [snyk.io](https://snyk.io/)

2. **Authentifizierung**: Führen Sie einen der folgenden Schritte aus:
   - Task "🔍 Check Snyk Token" in VS Code ausführen
   - Oder im Terminal: `npx snyk auth`

3. **Auto-Scheduler aktivieren**: Task "⏰ Start Snyk Auto-Scheduler" starten

## Tägliche Sicherheitsprüfung

1. **Schneller Sicherheitsscan**:

   ```bash
   Task "🔒 Snyk Security Scan" ausführen
   ```

2. **Code-Sicherheitscheck**:

   ```bash
   Task "🔍 Snyk Code Security Scan" ausführen
   ```

3. **Sicherheitsbericht anzeigen**:
   - Prüfen Sie das Verzeichnis `.security-reports`
   - Oder öffnen Sie das Snyk-Dashboard mit der Task "🔍 Snyk Dashboard öffnen"

## Vor wichtigen Updates

1. **Backup erstellen**:

   ```bash
   Task "📦 Snyk Auto-Backup erstellen" ausführen
   ```

2. **Umfassende Sicherheitsanalyse**:

   ```bash
   Task "🛡️ Comprehensive Security Scan" ausführen
   ```

## Bei Sicherheitsproblemen

1. **Security Advisories prüfen**:

   ```bash
   Task "📢 Security Advisory Check" ausführen
   ```

2. **Fehlerberichte integrieren**:

   ```bash
   Task "🚨 Snyk Security Alert" ausführen
   ```

3. **Bei kritischen Problemen**:

   ```bash
   Task "🚨 Security Emergency Recovery" ausführen
   ```

## Wiederherstellung

1. **Verfügbare Backups anzeigen**:

   ```bash
   Task "📋 Snyk Backups anzeigen" ausführen
   ```

2. **Backup wiederherstellen**:

   ```bash
   Task "🔄 Letztes Snyk Backup wiederherstellen" ausführen
   ```

## Automatisierter Zeitplan

- **Täglicher Scan**: Automatisch um 08:00 Uhr
- **Wöchentlicher Scan**: Montags um 09:00 Uhr

> **Hinweis**: Der Auto-Scheduler muss mit der Task "⏰ Start Snyk Auto-Scheduler" aktiviert sein.

## Wichtigste Dateien

- **Sicherheitsberichte**: `.security-reports/`
- **Dependency-Backups**: `.dependency-backups/`
- **Notfall-Backups**: `.security-emergency/`
