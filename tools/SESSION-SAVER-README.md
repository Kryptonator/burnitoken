# Session-Saver: Automatische Sicherung für VS Code

## Überblick

Der Session-Saver ist ein fortschrittliches Tool zur automatischen Sicherung Ihrer Arbeit in VS Code. Er wurde speziell entwickelt, um Datenverluste bei Abstürzen zu verhindern und bietet eine einfache Wiederherstellungsmöglichkeit.

## Funktionen

- **Automatische Sicherung alle 10 Sekunden**
- **Intelligente Erkennung geänderter Dateien**
- **Minimaler Ressourcenverbrauch**
- **Einfache Wiederherstellung nach Abstürzen**
- **Verlaufsverwaltung mit bis zu 20 Sicherungspunkten**

## Installation & Verwendung

### Installation

1. Das Tool ist bereits in Ihrem Workspace integriert.
2. Es wird automatisch beim Öffnen des Workspaces gestartet.

### Manuelle Aktivierung

Um den Session-Saver manuell zu starten:

```bash
node tools/start-session-saver.js
```

### Wiederherstellung nach einem Absturz

Wenn VS Code oder Ihr System abgestürzt ist:

1. Öffnen Sie ein Terminal
2. Führen Sie den Wiederherstellungs-Assistenten aus:

```bash
node tools/recover-session.js
```

3. Folgen Sie den interaktiven Anweisungen, um eine Sicherung auszuwählen und wiederherzustellen.

## Wie es funktioniert

1. Der Session-Saver überwacht kontinuierlich Änderungen an Ihren Dateien
2. Alle 10 Sekunden werden geänderte Dateien automatisch gesichert
3. Die Sicherungen werden im temporären Verzeichnis Ihres Systems gespeichert
4. Bei Bedarf können Sie eine beliebige Sicherung wiederherstellen

## Sicherungsspeicherort

Sicherungen werden im temporären Verzeichnis Ihres Systems gespeichert:

- Windows: `%TEMP%\burnitoken-session-saver`
- MacOS/Linux: `/tmp/burnitoken-session-saver`

## Anpassung

Sie können die Konfiguration anpassen, indem Sie die Konstante `CONFIG` in `session-saver.js` bearbeiten:

- `saveInterval`: Zeitintervall zwischen Sicherungen (in Millisekunden)
- `maxBackups`: Maximale Anzahl von Sicherungspunkten pro Session
- `fileTypes`: Zu sichernde Dateitypen
- `ignoreFolders`: Zu ignorierende Ordner

## Fehlerbehebung

Wenn der Session-Saver nicht wie erwartet funktioniert:

1. Prüfen Sie, ob der Prozess läuft:
   ```bash
   ps aux | grep session-saver
   ```

2. Starten Sie den Session-Saver neu:
   ```bash
   node tools/start-session-saver.js
   ```

3. Aktivieren Sie Debug-Ausgaben:
   Ändern Sie `debug: false` zu `debug: true` in session-saver.js
