# Google Search Console Monitoring-System

## Übersicht

Das GSC Monitoring-System stellt sicher, dass alle Audit- und Test-Tools zuverlässig mit der Google Search Console verbunden sind. Das System überprüft die Verbindung, testet alle GSC-bezogenen Tools und integriert die GSC-Daten in die Lighthouse-Berichte.

Stand: 22.06.2025

## Komponenten

### 1. GSC Integration Monitor

Der zentrale Bestandteil des Systems ist der **GSC Integration Monitor**, der folgende Aufgaben erfüllt:

- Überprüft die Gültigkeit der GSC Service-Account-Datei
- Testet die Verbindung zur Google Search Console API
- Prüft alle GSC-bezogenen Tools auf Funktionalität
- Verifiziert die GSC-Integration in Audit-Tools (wie Lighthouse)
- Stellt sicher, dass alle notwendigen Auto-Start-Tasks konfiguriert sind
- Erweitert den Extension Function Validator um GSC-Integration

**Ausführung**: `npm run gsc:monitor` oder über die VS Code Task `🔄 GSC Integration Monitor`

### 2. Automatische Tasks

Das System verwendet zwei automatische Tasks:

1. **🔄 GSC Auth Check** (Auto-Start)
   - Startet automatisch beim Öffnen des Workspace
   - Prüft die GSC-Verbindung im Hintergrund
   - Läuft als Hintergrundprozess

2. **🔄 GSC Integration Monitor**
   - Manuelle Ausführung für umfassenden Status
   - Erstellt detaillierten Bericht

### 3. Lighthouse-Integration

Alle Lighthouse-Konfigurationsdateien wurden erweitert, um die GSC-Integration zu unterstützen:

- **lighthouserc-performance.js**
- **lighthouserc-seo.js**
- **lighthouserc-accessibility.js**
- **lighthouse.config.js**

Die Lighthouse-Tools prüfen automatisch, ob die GSC-Verbindung besteht und konfigurieren die Tests entsprechend.

### 4. Extension Function Validator Integration

Der Extension Function Validator wurde erweitert, um:

- Die GSC-Integration zu überprüfen
- Die Service-Account-Datei zu validieren
- Die Auto-Start-Tasks für GSC zu überwachen
- Den Status aller GSC-Tools zu prüfen

## Setup und Verwendung

### Voraussetzungen

1. Gültige `gsc-service-account.json` Datei im `tools/`-Verzeichnis
2. Berechtigungen des Service-Accounts für die GSC-Property
3. Korrekt konfigurierte Tasks in `.vscode/tasks.json`

### Befehle

```bash
# Vollständiger GSC-Integrationscheck
npm run gsc:monitor

# Nur Verbindungs- und Auth-Check
npm run gsc:auth

# Schneller Test der GSC-Verbindung
npm run gsc:test

# Sitemap-Status prüfen
npm run gsc:status
```

### Automatische Prüfung

1. Die GSC-Integration wird automatisch beim Öffnen des Workspaces geprüft
2. Bei Lighthouse-Tests wird die GSC-Verbindung automatisch getestet
3. Der Extension Function Validator prüft die GSC-Integration bei jedem Health-Check

## Fehlerbehandlung

### Häufige Probleme

1. **"Service Account Datei nicht gefunden"**
   - Lösung: Stellen Sie sicher, dass sich die Datei `gsc-service-account.json` im Verzeichnis `tools/` befindet

2. **"Keine Berechtigung für GSC-Zugriff"**
   - Lösung: Prüfen Sie die Berechtigungen des Service-Accounts in der Google Search Console

3. **"GSC-Tools schlagen fehl"**
   - Lösung: Führen Sie `npm run gsc:test` aus, um die grundlegende Verbindung zu testen
   - Wenn der Test erfolgreich ist, aber die Tools fehlschlagen, könnte es an spezifischen API-Berechtigungen liegen

4. **"Lighthouse-Tests laufen ohne GSC-Daten"**
   - Lösung: Überprüfen Sie die GSC-Verbindung mit `npm run gsc:auth`
   - Stellen Sie sicher, dass die Lighthouse-Konfigurationsdateien nicht manuell überschrieben wurden

## Status-Dateien und Logs

Das System generiert folgende Dateien:

- **tools/gsc-integration.log**: Detailliertes Log aller Überprüfungen
- **tools/gsc-integration-status.json**: Aktueller Status der GSC-Integration

Diese Dateien sind in `.gitignore` aufgenommen, um keine sensiblen Informationen im Repository zu speichern.

## Erweiterung des Systems

Um das GSC Monitoring-System zu erweitern:

1. Fügen Sie neue GSC-Tools im Array `GSC_TOOLS` im `tools/gsc-integration-monitor.js` hinzu
2. Ergänzen Sie entsprechende NPM-Skripte in `package.json`
3. Aktualisieren Sie bei Bedarf die Task-Konfiguration

## Sicherheit

- Service-Account-Dateien sind in `.gitignore` aufgenommen
- Logs mit potenziell sensiblen Informationen werden nicht ins Repository übertragen
- Das System prüft die Berechtigung des Service-Accounts vor jeder API-Anfrage
