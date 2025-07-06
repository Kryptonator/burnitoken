#!/usr/bin/env node

/**
 * VS Code Performance & Stabilität Manager
 * Behebt automatisch Performance-Probleme
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class VSCodeStabilizer {
  constructor() {
    this.isWindows = os.platform() === 'win32';
    this.userDataPath = this.isWindows
      ? path.join(os.homedir(), 'AppData', 'Roaming', 'Code')
      : path.join(os.homedir(), '.vscode');
  }

  async stabilizeVSCode() {
    console.log('🔧 VS CODE STABILISIERUNG GESTARTET...\n');

    try {
      // 1. Beende alle VS Code Prozesse
      await this.killVSCodeProcesses();

      // 2. Bereinige temporäre Dateien
      await this.cleanTempFiles();

      // 3. Optimiere Einstellungen
      await this.optimizeSettings();

      // 4. Bereinige Extensions
      await this.cleanExtensions();

      // 5. Starte VS Code neu
      await this.restartVSCode();

      console.log('\n✅ VS CODE ERFOLGREICH STABILISIERT!\n');
    } catch (error) {
      console.error('❌ Fehler bei Stabilisierung:', error.message);
    }
  }

  async killVSCodeProcesses() {
    console.log('🛑 Beende VS Code Prozesse...');

    const commands = this.isWindows
      ? ['taskkill /F /IM Code.exe', 'taskkill /F /IM node.exe', 'taskkill /F /IM electron.exe']
      : ['pkill -f "Visual Studio Code"', 'pkill -f "code"', 'pkill -f "node"'];

    for (const cmd of commands) {
      try {
        await this.execCommand(cmd);
      } catch (error) {
        // Ignoriere Fehler wenn Prozess nicht läuft
      }
    }

    // Warte 2 Sekunden
    await this.sleep(2000);
    console.log('✅ Prozesse beendet');
  }

  async cleanTempFiles() {
    console.log('🧹 Bereinige temporäre Dateien...');

    const pathsToClean = [
      path.join(this.userDataPath, 'logs'),
      path.join(this.userDataPath, 'CachedData'),
      path.join(this.userDataPath, 'CrashReports'),
      path.join(this.userDataPath, 'backups'),
      path.join(os.tmpdir(), 'vscode-*'),
    ];

    for (const cleanPath of pathsToClean) {
      try {
        if (fs.existsSync(cleanPath)) {
          const cmd = this.isWindows ? `rmdir /s /q "${cleanPath}"` : `rm -rf "${cleanPath}"`;
          await this.execCommand(cmd);
        }
      } catch (error) {
        // Ignoriere Fehler bei Bereinigung
      }
    }

    console.log('✅ Temporäre Dateien bereinigt');
  }

  async optimizeSettings() {
    console.log('⚙️ Optimiere VS Code Einstellungen...');

    const settingsPath = path.join(this.userDataPath, 'User', 'settings.json');

    const optimizedSettings = {
      'extensions.autoUpdate': false,
      'extensions.autoCheckUpdates': false,
      'telemetry.enableTelemetry': false,
      'files.autoSave': 'afterDelay',
      'files.autoSaveDelay': 5000,
      'editor.minimap.enabled': false,
      'editor.renderWhitespace': 'none',
      'editor.renderControlCharacters': false,
      'workbench.enableExperiments': false,
      'workbench.settings.enableNaturalLanguageSearch': false,
      'search.useIgnoreFiles': true,
      'search.useGlobalIgnoreFiles': true,
      'files.watcherExclude': {
        '**/node_modules/**': true,
        '**/.git/**': true,
        '**/coverage/**': true,
        '**/dist/**': true,
        '**/build/**': true,
      },
      'typescript.surveys.enabled': false,
      'typescript.updateImportsOnFileMove.enabled': 'never',
      'javascript.updateImportsOnFileMove.enabled': 'never',
    };

    try {
      // Erstelle User-Verzeichnis falls nicht vorhanden
      const userDir = path.dirname(settingsPath);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Lade existierende Einstellungen
      let currentSettings = {};
      if (fs.existsSync(settingsPath)) {
        try {
          const content = fs.readFileSync(settingsPath, 'utf8');
          currentSettings = JSON.parse(content);
        } catch (error) {
          console.log('⚠️ Einstellungen-Datei beschädigt, erstelle neue...');
        }
      }

      // Merge optimierte Einstellungen
      const mergedSettings = { ...currentSettings, ...optimizedSettings };

      // Schreibe optimierte Einstellungen
      fs.writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 2));

      console.log('✅ Einstellungen optimiert');
    } catch (error) {
      console.log('⚠️ Einstellungen konnten nicht optimiert werden:', error.message);
    }
  }

  async cleanExtensions() {
    console.log('🧩 Bereinige Extensions...');

    try {
      const extensionsPath = path.join(this.userDataPath, 'extensions');
      if (fs.existsSync(extensionsPath)) {
        // Entferne beschädigte Extension-Logs
        const logsPath = path.join(extensionsPath, 'logs');
        if (fs.existsSync(logsPath)) {
          const cmd = this.isWindows ? `rmdir /s /q "${logsPath}"` : `rm -rf "${logsPath}"`;
          await this.execCommand(cmd);
        }
      }
      console.log('✅ Extensions bereinigt');
    } catch (error) {
      console.log('⚠️ Extensions-Bereinigung fehlgeschlagen:', error.message);
    }
  }

  async restartVSCode() {
    console.log('🚀 Starte VS Code neu...');

    // Warte 3 Sekunden vor Neustart
    await this.sleep(3000);

    try {
      const cmd = this.isWindows ? 'code .' : 'code .';
      const workingDir = 'c:\\Users\\micha\\OneDrive\\Dokumente\\burnitoken.com';

      spawn(cmd, [], {
        cwd: workingDir,
        detached: true,
        stdio: 'ignore',
        shell: true,
      });

      console.log('✅ VS Code neugestartet');
    } catch (error) {
      console.log('⚠️ VS Code Neustart fehlgeschlagen:', error.message);
      console.log('💡 Starte VS Code manuell mit: code .');
    }
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (
          error &&
          !error.message.includes('not found') &&
          !error.message.includes('No such process')
        ) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Hauptfunktion
async function main() {
  console.log(`
🛠️  VS CODE PERFORMANCE STABILIZER
====================================

🎯 Ziel: VS Code stabil und performant machen
⚡ Features:
   - Prozesse bereinigen
   - Temporäre Dateien löschen  
   - Einstellungen optimieren
   - Extensions bereinigen
   - Neustart durchführen

Starte in 3 Sekunden...
`);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const stabilizer = new VSCodeStabilizer();
  await stabilizer.stabilizeVSCode();

  console.log(`
🎉 STABILISIERUNG ABGESCHLOSSEN!

📊 Dashboard verfügbar:
   - file:///c:/Users/micha/OneDrive/Dokumente/burnitoken.com/tools/lightweight-dashboard.html
   - Lokaler Server: http://localhost:3002

🚀 VS Code sollte jetzt stabil laufen!
`);
}

// Starte wenn direkt ausgeführt
if (require.main === module) {
  main().catch(console.error);
}

module.exports = VSCodeStabilizer;
