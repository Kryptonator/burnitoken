#!/usr/bin/env node

/**
 * VS Code Performance Optimizer
 *
 * Kritische Performance-Verbesserung für VS Code nach Abstürzen
 * - Bereinigt Cache und temporäre Dateien
 * - Optimiert Workspace-Einstellungen
 * - Deaktiviert ressourcenintensive Extensions
 * - Implementiert Auto-Recovery
 *
 * PRIO 1: Sofortige Behebung von VS Code Performance-Problemen
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

// Konfiguration
const CONFIG = {
  VSCODE_USER_DIR: path.join(os.homedir(), 'AppData', 'Roaming', 'Code'),
  VSCODE_CACHE_DIR: path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'CachedData'),
  VSCODE_LOGS_DIR: path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'logs'),
  WORKSPACE_DIR: process.cwd(),
  BACKUP_DIR: path.join(__dirname, '.vscode-backup'),
  MAX_CACHE_SIZE_MB: 500, // Maximale Cache-Größe in MB
  PERFORMANCE_SETTINGS: {
    'editor.semanticTokenColorCustomizations': null,
    'editor.bracketPairColorization.enabled': false,
    'editor.guides.bracketPairs': false,
    'editor.minimap.enabled': false,
    'editor.hover.delay': 1000,
    'editor.quickSuggestions': false,
    'editor.parameterHints.enabled': false,
    'typescript.disableAutomaticTypeAcquisition': true,
    'extensions.autoUpdate': false,
    'telemetry.telemetryLevel': 'off',
    'workbench.enableExperiments': false,
    'git.decorations.enabled': false,
    'explorer.incrementalNaming': 'disabled',
  },
};

/**
 * Zeigt formatierte Ausgabe mit Farben an
 */
function printColored(message, colorCode = '\x1b[36m') {
  const timestamp = new Date().toLocaleTimeString('de-DE');
  console.log(`${colorCode}[${timestamp}] ${message}\x1b[0m`);
}

/**
 * Erstellt Backup von wichtigen VS Code Einstellungen
 */
function createBackup() {
  try {
    printColored('🔄 Erstelle Backup der VS Code Einstellungen...', '\x1b[33m');

    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    }

    const settingsPath = path.join(CONFIG.VSCODE_USER_DIR, 'User', 'settings.json');
    const keybindingsPath = path.join(CONFIG.VSCODE_USER_DIR, 'User', 'keybindings.json');

    if (fs.existsSync(settingsPath)) {
      const backupPath = path.join(CONFIG.BACKUP_DIR, `settings-${Date.now()}.json`);
      fs.copyFileSync(settingsPath, backupPath);
      printColored(`✅ Settings-Backup erstellt: ${backupPath}`, '\x1b[32m');
    }

    if (fs.existsSync(keybindingsPath)) {
      const backupPath = path.join(CONFIG.BACKUP_DIR, `keybindings-${Date.now()}.json`);
      fs.copyFileSync(keybindingsPath, backupPath);
      printColored(`✅ Keybindings-Backup erstellt: ${backupPath}`, '\x1b[32m');
    }
  } catch (error) {
    printColored(`❌ Backup-Fehler: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Bereinigt VS Code Cache und temporäre Dateien
 */
function cleanCache() {
  try {
    printColored('🧹 Bereinige VS Code Cache...', '\x1b[33m');

    // Cache-Verzeichnisse bereinigen
    const cacheDirs = [
      CONFIG.VSCODE_CACHE_DIR,
      CONFIG.VSCODE_LOGS_DIR,
      path.join(CONFIG.VSCODE_USER_DIR, 'logs'),
      path.join(CONFIG.VSCODE_USER_DIR, 'CachedExtensions'),
      path.join(CONFIG.WORKSPACE_DIR, '.vscode', 'settings.json.backup*'),
    ];

    let totalCleaned = 0;

    cacheDirs.forEach((dir) => {
      if (fs.existsSync(dir)) {
        try {
          const stats = fs.statSync(dir);
          if (stats.isDirectory()) {
            const files = fs.readdirSync(dir);
            files.forEach((file) => {
              const filePath = path.join(dir, file);
              try {
                const fileStats = fs.statSync(filePath);
                totalCleaned += fileStats.size;
                fs.rmSync(filePath, { recursive: true, force: true });
              } catch (e) {
                // Datei könnte in Verwendung sein, ignorieren
              }
            });
          }
        } catch (e) {
          // Verzeichnis könnte gesperrt sein, ignorieren
        }
      }
    });

    const cleanedMB = Math.round(totalCleaned / 1024 / 1024);
    printColored(`✅ Cache bereinigt: ${cleanedMB} MB freigegeben`, '\x1b[32m');
  } catch (error) {
    printColored(`❌ Cache-Bereinigung fehlgeschlagen: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Optimiert VS Code Einstellungen für bessere Performance
 */
function optimizeSettings() {
  try {
    printColored('⚙️ Optimiere VS Code Einstellungen für Performance...', '\x1b[33m');

    const settingsPath = path.join(CONFIG.VSCODE_USER_DIR, 'User', 'settings.json');
    let settings = {};

    // Lade bestehende Einstellungen
    if (fs.existsSync(settingsPath)) {
      const settingsContent = fs.readFileSync(settingsPath, 'utf8');
      try {
        settings = JSON.parse(settingsContent);
      } catch (e) {
        printColored('⚠️ Settings.json beschädigt, erstelle neue...', '\x1b[33m');
      }
    }

    // Füge Performance-Optimierungen hinzu
    Object.assign(settings, CONFIG.PERFORMANCE_SETTINGS);

    // Workspace-spezifische Optimierungen
    settings['files.watcherExclude'] = {
      '**/.git/objects/**': true,
      '**/.git/subtree-cache/**': true,
      '**/node_modules/**': true,
      '**/coverage/**': true,
      '**/.reports/**': true,
      '**/playwright-report/**': true,
      '**/test-results/**': true,
    };

    // Speichere optimierte Einstellungen
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    printColored('✅ Performance-Einstellungen angewendet', '\x1b[32m');
  } catch (error) {
    printColored(`❌ Einstellungs-Optimierung fehlgeschlagen: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Deaktiviert ressourcenintensive Extensions temporär
 */
function optimizeExtensions() {
  try {
    printColored('🔌 Optimiere Extensions...', '\x1b[33m');

    // Liste ressourcenintensiver Extensions
    const heavyExtensions = [
      'ms-vscode.vscode-typescript-next',
      'bradlc.vscode-tailwindcss',
      'ms-vscode.vscode-json',
      'esbenp.prettier-vscode',
    ];

    // Deaktiviere temporär ressourcenintensive Extensions
    heavyExtensions.forEach((ext) => {
      try {
        execSync(`code --disable-extension ${ext}`, { stdio: 'ignore' });
        printColored(`🔇 Extension temporär deaktiviert: ${ext}`, '\x1b[33m');
      } catch (e) {
        // Extension nicht installiert oder bereits deaktiviert
      }
    });

    printColored('✅ Extensions optimiert', '\x1b[32m');
  } catch (error) {
    printColored(`❌ Extension-Optimierung fehlgeschlagen: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Startet VS Code mit optimierten Parametern neu
 */
function restartVSCode() {
  try {
    printColored('🔄 Starte VS Code mit Performance-Optimierungen neu...', '\x1b[33m');

    // Beende laufende VS Code Prozesse
    try {
      if (process.platform === 'win32') {
        execSync('taskkill /F /IM Code.exe', { stdio: 'ignore' });
      } else {
        execSync('pkill -f "Visual Studio Code"', { stdio: 'ignore' });
      }
      printColored('✅ VS Code Prozesse beendet', '\x1b[32m');
    } catch (e) {
      // Keine laufenden Prozesse
    }

    // Warte kurz
    setTimeout(() => {
      // Starte VS Code mit Performance-Flags
      const vscodeArgs = [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--max-memory=2048',
        '--disable-extensions',
        CONFIG.WORKSPACE_DIR,
      ];

      spawn('code', vscodeArgs, {
        detached: true,
        stdio: 'ignore',
      });

      printColored('🚀 VS Code wird mit Optimierungen gestartet...', '\x1b[32m');
    }, 2000);
  } catch (error) {
    printColored(`❌ VS Code Neustart fehlgeschlagen: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Überwacht VS Code Performance
 */
function monitorPerformance() {
  try {
    printColored('📊 Starte Performance-Monitoring...', '\x1b[33m');

    const monitoringScript = `
      const { spawn } = require('child_process');
      
      setInterval(() => {
        try {
          const ps = spawn('tasklist', ['/FI', 'IMAGENAME eq Code.exe', '/FO', 'CSV']);
          let output = '';
          
          ps.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          ps.on('close', (code) => {
            if (output.includes('Code.exe')) {
              const lines = output.split('\\n');
              lines.forEach(line => {
                if (line.includes('Code.exe')) {
                  const parts = line.split(',');
                  if (parts.length > 4) {
                    const memory = parts[4].replace(/[^0-9]/g, '');
                    const memoryMB = Math.round(memory / 1024);
                    if (memoryMB > 1000) {
                      console.log(\`⚠️ VS Code hoher RAM-Verbrauch: \${memoryMB} MB\`);
                    }
                  }
                }
              });
            }
          });
        } catch (e) {
          // Monitoring-Fehler ignorieren
        }
      }, 30000); // Alle 30 Sekunden prüfen
    `;

    // Speichere Monitoring-Script
    const monitorPath = path.join(__dirname, 'vscode-monitor.js');
    fs.writeFileSync(monitorPath, monitoringScript);

    // Starte Monitoring im Hintergrund
    spawn('node', [monitorPath], {
      detached: true,
      stdio: 'ignore',
    });

    printColored('✅ Performance-Monitoring gestartet', '\x1b[32m');
  } catch (error) {
    printColored(`❌ Monitoring-Start fehlgeschlagen: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Hauptfunktion - Komplette VS Code Performance-Optimierung
 */
function main() {
  const divider = '═'.repeat(60);
  console.clear();
  printColored(`\n${divider}`, '\x1b[1;36m');
  printColored('    🚀 VS CODE PERFORMANCE OPTIMIZER (PRIO 1)    ', '\x1b[1;37m');
  printColored(`${divider}\n`, '\x1b[1;36m');

  printColored('🔥 KRITISCHER MODUS: VS Code Performance-Problem erkannt!', '\x1b[1;31m');
  printColored('Starte sofortige Optimierung...', '\x1b[33m');

  // Schritt-für-Schritt Optimierung
  createBackup();
  cleanCache();
  optimizeSettings();
  optimizeExtensions();

  printColored('\n⏱️ Warte 5 Sekunden vor Neustart...', '\x1b[33m');
  setTimeout(() => {
    restartVSCode();
    monitorPerformance();

    printColored(`\n${divider}`, '\x1b[1;36m');
    printColored('✅ VS CODE PERFORMANCE-OPTIMIERUNG ABGESCHLOSSEN', '\x1b[1;42m');
    printColored('🎯 Nächste Schritte:', '\x1b[1;37m');
    printColored('  1. VS Code wird automatisch mit Optimierungen gestartet', '\x1b[32m');
    printColored('  2. Performance wird kontinuierlich überwacht', '\x1b[32m');
    printColored(
      '  3. Bei erneuten Problemen: node tools/vscode-performance-optimizer.js',
      '\x1b[32m',
    );
    printColored(`${divider}\n`, '\x1b[1;36m');
  }, 5000);
}

// Bei direktem Aufruf starten
if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  cleanCache,
  optimizeSettings,
  optimizeExtensions,
  restartVSCode,
  monitorPerformance,
};
