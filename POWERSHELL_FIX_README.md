# PowerShell Problem Fix - 23.06.2025

## Problem: PowerShell öffnet sich im Sekundentakt

Bei der BurniToken-Website-Verwaltung wurde ein kritisches Problem festgestellt, bei dem sich PowerShell-Fenster im Sekundentakt öffnen und schließen. Dies führt zu erheblichen Performance-Problemen und verhindert ein effektives Arbeiten.

## Ursache

Die Hauptursache für das Problem waren:

1. **Rekursive Task-Aufrufe**: Die automatischen Tasks in VS Code haben weitere PowerShell-Prozesse gestartet, die wiederum weitere Tasks ausgelöst haben.
2. **Fehlende Lock-Mechanismen**: Die Skripte hatten keine ausreichenden Lock-Mechanismen, um Mehrfachausführungen zu vermeiden.
3. **PowerShell als Zwischenebene**: Die Verwendung von PowerShell als Zwischenebene für Node.js-Skripte hat zu einer Kaskade von Prozessen geführt.
4. **Auto-Start bei Ordneröffnung**: Zu viele Auto-Start-Tasks haben zu einer Überlastung geführt.

## Lösung

Die folgenden Optimierungen wurden durchgeführt, um das Problem zu beheben:

1. **Safe Task Starter**: Ein neues Tool `safe-task-starter.js` wurde entwickelt, das:
   - PowerShell-Aufrufe vermeidet und direkt Node.js nutzt
   - Robuste Lock-Mechanismen verwendet
   - Tasks seriell und kontrolliert ausführt
   - Redundante Aufrufe verhindert

2. **PowerShell-Optimierte Skripte**:
   - `powerfix-auto-recovery.js`: Verbesserte Version des Auto-Recovery Systems
   - `powerfix-monitoring.js`: Optimierte Website-Überwachung ohne PowerShell-Probleme

3. **Reduzierung der Auto-Start-Tasks**:
   - Nur noch ein einziger Auto-Start-Task (Safe Task Starter)
   - Alle anderen Tasks werden kontrolliert vom Safe Task Starter aufgerufen

4. **Verbesserte Lock-Mechanismen**:
   - Alle Skripte verwenden nun Lock-Dateien mit Altersüberprüfung
   - Vermeidung von gleichzeitiger/redundanter Ausführung

## Verwendung

Um die Website nach wie vor optimal zu überwachen und zu warten, stehen folgende Tasks zur Verfügung:

- **🚀 PowerShell-Safe Task Starter (Auto-Start)**: Startet automatisch beim Öffnen des Ordners
- **🛠️ Fix PowerShell Problems**: Manuell ausführbar bei PowerShell-Problemen
- **💻 Start PowerShell-Safe Monitoring**: Startet eine dauerhafte Überwachung im Hintergrund
- **🌐 Website Health Check**: Überprüft den aktuellen Status der Website
- **🚢 Deployment Status Check**: Überprüft den Deployment-Status

## Weiteres Vorgehen

Diese Optimierungen sollten das PowerShell-Problem vollständig beheben. Falls dennoch Probleme auftreten:

1. Schließe VS Code vollständig
2. Öffne den Task-Manager und beende alle PowerShell- und Node.js-Prozesse
3. Starte VS Code neu
4. Führe den "🛠️ Fix PowerShell Problems" Task aus

## Technische Details

Die Optimierungen nutzen:
- Direkte Node.js-Prozesssteuerung über `child_process`
- Atomare Dateioperationen für Locks
- Sequentielle Task-Ausführung
- Verbesserte Fehlerbehandlung und Logging

Die Website-Überwachung und das automatische Recovery-System funktionieren weiterhin uneingeschränkt und stellen sicher, dass die BurniToken-Website 100% live und optimal funktioniert.
