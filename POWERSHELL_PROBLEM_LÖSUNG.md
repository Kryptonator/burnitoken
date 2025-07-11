# PowerShell-Problem Lösung

## Sofort-Lösung bei PowerShell-Endlosschleifen

Wenn PowerShell-Fenster sich im Sekundentakt öffnen und schließen:

1. **Task ausführen**: Führe den Task `🛠️ Fix PowerShell Problems` in VS Code aus
   (Strg+Shift+P → "Tasks: Run Task" → "🛠️ Fix PowerShell Problems")

2. **Alternativ im Terminal**:
   ```
   node tools/safe-task-starter.js
   ```

3. **Bei anhaltenden Problemen**:
   - VS Code komplett schließen
   - Im Task-Manager alle PowerShell- und Node.js-Prozesse beenden
   - VS Code neu starten
   - Sofort den Task `🛠️ Fix PowerShell Problems` ausführen

## Warum funktioniert die Lösung?

Der Safe Task Starter verhindert die PowerShell-Problemkaskade durch:

1. **Direkte Node.js-Ausführung**: Umgeht PowerShell als Zwischenschicht
2. **Strenge Lock-Mechanismen**: Verhindert mehrfache gleichzeitige Ausführungen
3. **Kontrollierten Start**: Nur ein Task wird als Auto-Start ausgeführt
4. **Robustes Fehler-Handling**: Verhindert Endlosschleifen bei Fehlern

## Wichtig: Nicht ändern!

Bitte ändere nicht die Einstellungen in `.vscode/tasks.json`, da dies die PowerShell-Probleme wieder verursachen könnte!
