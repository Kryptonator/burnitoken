# Auto-Recovery System mit Screenshot-Sicherung

Dieses System bietet automatische Screenshots und Wiederherstellungsmöglichkeiten für VS Code, um bei Abstürzen den Arbeitsfortschritt zu minimieren.

## Funktionen

### Automatische High-Frequency Screenshots
- Erstellt alle 5 Sekunden automatisch Screenshots des VS Code-Fensters
- Speichert die Bilder im `.recovery-screenshots`-Verzeichnis
- Löscht automatisch Screenshots, die älter als 60 Minuten sind
- Begrenzt die Gesamtgröße auf 1,5 GB (konfigurierbar)
- Unterstützt verschiedene Intervalle (1 Sekunde, 5 Sekunden, 30 Sekunden)

### Dependabot-Monitoring
- Überwacht den Status aller Abhängigkeiten
- Prüft auf Sicherheitslücken und veraltete Pakete
- Erstellt detaillierte Reports über den Zustand der Abhängigkeiten
- Läuft automatisch beim Projektstart

## VS Code Tasks

Die folgenden Tasks wurden für das Recovery-System eingerichtet:

| Task | Beschreibung |
|------|-------------|
| 📸 Start Auto Screenshot Recovery | Startet automatisch beim Öffnen des Projekts und erstellt in regelmäßigen Abständen Screenshots |
| 📸 Take Recovery Screenshot Now | Erstellt sofort einen Screenshot als Sicherung |
| 🔍 View Recovery Screenshots | Zeigt alle verfügbaren Recovery-Screenshots mit Datum und Größe an |
| 📦 Dependabot Status Check | Führt eine vollständige Prüfung aller Abhängigkeiten durch |
| 🔄 Auto Dependabot Monitor | Startet automatisch beim Öffnen des Projekts und überwacht alle Abhängigkeiten |

## Verwendung nach einem Absturz

1. Nach einem VS Code-Absturz, starten Sie das Projekt neu
2. Führen Sie den Task **🔍 View Recovery Screenshots** aus, um die verfügbaren Screenshots anzuzeigen
3. Öffnen Sie den letzten Screenshot vor dem Absturz, um Ihren Arbeitsfortschritt zu sehen
4. Stellen Sie Ihren Code entsprechend wieder her

## Konfiguration anpassen

Sie können die Konfiguration in den folgenden Dateien anpassen:

- `tools/auto-screenshot-manager.js`: Ändern Sie die `CONFIG`-Variablen für Screenshot-Intervall, maximale Anzahl usw.
- `tools/dependabot-status-monitor.js`: Passen Sie die `CONFIG`-Variablen für Reports und Monitoring an

## Tipp: Schnell-Kommandos

Verwenden Sie die VS Code-Kommandopalette (Strg+Shift+P) und geben Sie ein:
- `Tasks: Screenshot` für sofortige Screenshots
- `Tasks: Dependabot` für Abhängigkeitsprüfungen

## Notfallwiederherstellung

Im Notfall können Sie die Screenshots aus dem `.recovery-screenshots`-Verzeichnis direkt über den Datei-Explorer öffnen.
