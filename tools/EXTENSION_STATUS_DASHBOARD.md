# Extension Status Dashboard und Auto-Recovery System

Dieses System überwacht und verwaltet den Status von VS Code Extensions, KI-Services (Session-Saver, AI Conversation Bridge), Audit-/Test-Tools (inkl. Google Search Console Integration) und stellt sicher, dass sie nach einem Absturz oder Neustart automatisch wiederhergestellt werden.

## 🛠️ Komponenten

1. **Extension Status Dashboard** (`tools/extension-status-dashboard.js`)  
   Zeigt den aktuellen Status aller Extensions, Services und Integrationen an.

2. **Extension Auto-Restart Manager** (`tools/extension-auto-restart.js`)  
   Stellt deaktivierte oder abgestürzte Extensions und Services automatisch wieder her.

3. **Automatic Tasks**  
   Führt bei Workspace-Öffnung automatisch einen Health-Check und Recovery-Prozess durch.

## 📋 Verwendung

### Status-Dashboard anzeigen

1. **Als VS Code Task**:
   - Drücken Sie `F1` und geben Sie `Tasks: Run Task` ein
   - Wählen Sie `📊 Extension Status Dashboard`

2. **Via Terminal**:
   ```powershell
   npm run status:dashboard
   ```

3. **Kompletter Status**:
   ```powershell
   npm run status:all
   ```

### Auto-Recovery manuell ausführen

```powershell
npm run extension:restart
```

### Weitere nützliche Befehle

- Health-Check ausführen:
  ```powershell
  npm run extension:health
  ```

- GSC-Integration überwachen:
  ```powershell
  npm run gsc:monitor
  ```

- KI-Services Status prüfen:
  ```powershell
  node tools/ai-status.js
  ```

- KI-Services neu starten:
  ```powershell
  node tools/ai-services-manager.js restart
  ```

## 📊 Automatischer Start

Das System wurde konfiguriert, um automatisch zu starten, wenn der VS Code Workspace geöffnet wird. Folgende Tasks werden automatisch ausgeführt:

1. `🔄 Automatic Extension Check` - Prüft den Status aller Extensions
2. `🔄 Automatic Extension Recovery` - Stellt deaktivierte Services wieder her
3. `🔄 Start Session-Saver` - Startet den KI-Session-Saver
4. `🧠 Start AI Conversation Bridge` - Startet die KI-Conversation-Bridge
5. `🔄 GSC Auth Check` - Überprüft die GSC-Authentifizierung

## 🔍 Überwachte Systeme

- **VS Code Extensions**: Alle in `.vscode/extensions.json` empfohlenen Extensions
- **KI-Services**: Session-Saver und AI Conversation Bridge
- **GSC-Integration**: Authentifizierung und Verbindung zur Google Search Console
- **Audit-/Test-Tools**: Lighthouse, Playwright, etc.

## ⚠️ Fehlerbehebung

Falls das Dashboard Probleme meldet:

1. Überprüfen Sie die Log-Dateien:
   - `tools/extension-status-dashboard.log`
   - `tools/extension-auto-restart.log`
   - `tools/gsc-integration.log`

2. Folgen Sie den Empfehlungen im Dashboard

3. Führen Sie die Auto-Recovery manuell aus:
   ```powershell
   node tools/extension-auto-restart.js
   ```

4. Starten Sie VS Code neu, um den automatischen Wiederherstellungsprozess auszulösen
