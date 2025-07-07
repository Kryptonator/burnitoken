#!/usr/bin/env node

/**
 * NOTFALL-RECOVERY für VS Code Hänger und große Anzahl offener Changes
 * Automatische Wiederherstellung bei blockierten VS Code-Instanzen
 *
 * Erstellt: 2025-07-01 (Notfall-Situation)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

const CONFIG = {
  MAX_VSCODE_HANG_TIME: 10000, // 10 Sekunden max. Wartezeit
  BACKUP_DIR: path.join(__dirname, '.emergency-backups'),
  RECOVERY_LOG: path.join(__dirname, 'emergency-recovery.log'),
  MAX_CHANGES_BEFORE_COMMIT: 50, // Bei mehr als 50 Changes automatisch committen
};

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  console.log(message);

  try {
    if (!fs.existsSync(path.dirname(CONFIG.RECOVERY_LOG))) {
      fs.mkdirSync(path.dirname(CONFIG.RECOVERY_LOG), { recursive: true });
    }
    fs.appendFileSync(CONFIG.RECOVERY_LOG, logEntry);
  } catch (e) {
    console.error('Fehler beim Schreiben ins Recovery-Log:', e);
  }
}

/**
 * Beendet alle VS Code-Prozesse forciert
 */
function killVSCodeProcesses() {
  log('🚨 NOTFALL: Beende alle VS Code-Prozesse...');

  try {
    if (os.platform() === 'win32') {
      // Windows: Alle Code.exe Prozesse beenden
      try {
        execSync('taskkill /F /IM Code.exe', { stdio: 'pipe' });
        log('✅ VS Code-Prozesse (Code.exe) beendet');
      } catch (e) {
        log('⚠️ Keine Code.exe Prozesse gefunden oder bereits beendet');
      }

      // Auch Node.js-Prozesse der Extensions beenden
      try {
        execSync('taskkill /F /IM node.exe /FI "COMMANDLINE eq *vscode*"', { stdio: 'pipe' });
        log('✅ VS Code Extension-Prozesse beendet');
      } catch (e) {
        log('⚠️ Keine VS Code Extension-Prozesse gefunden');
      }
    } else {
      // Unix/Linux/Mac
      try {
        execSync('pkill -f "Visual Studio Code"', { stdio: 'pipe' });
        log('✅ VS Code-Prozesse beendet');
      } catch (e) {
        log('⚠️ Keine VS Code-Prozesse gefunden oder bereits beendet');
      }
    }

    // 3 Sekunden warten, damit Prozesse sauber beendet werden
    log('⏳ Warte 3 Sekunden...');
    const startTime = Date.now();
    while (Date.now() - startTime < 3000) {
      // Blocking wait
    }
  } catch (error) {
    log(`❌ Fehler beim Beenden der VS Code-Prozesse: ${error.message}`);
  }
}

/**
 * Erstellt ein Backup aller wichtigen Dateien
 */
function createEmergencyBackup() {
  log('💾 Erstelle Notfall-Backup...');

  try {
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(CONFIG.BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupFolder, { recursive: true });

    // Wichtige Dateien/Ordner kopieren
    const importantPaths = [
      'tools/',
      'assets/',
      'index.html',
      'main.js',
      'package.json',
      '.github/',
      'public/',
    ];

    const rootDir = path.join(__dirname, '..');

    for (const importantPath of importantPaths) {
      const sourcePath = path.join(rootDir, importantPath);
      const targetPath = path.join(backupFolder, importantPath);

      if (fs.existsSync(sourcePath)) {
        try {
          // Verzeichnis oder Datei kopieren
          if (fs.statSync(sourcePath).isDirectory()) {
            copyDirRecursive(sourcePath, targetPath);
          } else {
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            fs.copyFileSync(sourcePath, targetPath);
          }
          log(`✅ Backup erstellt: ${importantPath}`);
        } catch (e) {
          log(`⚠️ Backup fehlgeschlagen für: ${importantPath} - ${e.message}`);
        }
      }
    }

    log(`✅ Notfall-Backup erstellt in: ${backupFolder}`);
    return backupFolder;
  } catch (error) {
    log(`❌ Fehler beim Erstellen des Notfall-Backups: ${error.message}`);
    return null;
  }
}

/**
 * Hilfsfunktion: Verzeichnis rekursiv kopieren
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Professionelles Git-Management: Commit, Push und Branch-Switch zu main
 */
function handleMassiveChanges() {
  log('🔍 Prüfe Git-Status und führe professionelles Branch-Management durch...');

  try {
    const rootDir = path.join(__dirname, '..');
    process.chdir(rootDir);

    // Aktuellen Branch ermitteln
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    log(`📍 Aktueller Branch: ${currentBranch}`);

    // Git-Status abrufen
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
    const changes = statusOutput.split('\n').filter((line) => line.trim().length > 0);

    log(`📊 Gefunden: ${changes.length} offene Changes`);

    // Immer committen und pushen für sauberes Repository
    if (changes.length > 0) {
      log(`� Starte professionelles Git-Management...`);

      // Alle Changes stagen
      execSync('git add .', { encoding: 'utf8' });
      log('✅ Alle Changes gestaged');

      // Commit mit aussagekräftiger Nachricht
      const commitMessage = `[EMERGENCY-RECOVERY] Auto-commit von ${changes.length} Changes - Stabilisierung nach VS Code Hänger - ${new Date().toISOString()}`;
      execSync(`git commit -m "${commitMessage}"`, { encoding: 'utf8' });
      log('✅ Emergency-Commit erstellt');

      // Push zum aktuellen Branch
      try {
        execSync(`git push origin ${currentBranch}`, { encoding: 'utf8' });
        log(`✅ Changes zu ${currentBranch} gepusht`);
      } catch (e) {
        log(`⚠️ Push zu ${currentBranch} fehlgeschlagen: ${e.message} - Commit bleibt lokal`);
      }
    }

    // Branch-Management: Zu main wechseln für Stabilität
    if (currentBranch !== 'main' && currentBranch !== 'master') {
      log('🔄 Wechsle zu main Branch für maximale Stabilität...');

      try {
        // Prüfen ob main Branch existiert
        try {
          execSync('git show-ref --verify --quiet refs/heads/main', { stdio: 'pipe' });
          // main existiert, dorthin wechseln
          execSync('git checkout main', { encoding: 'utf8' });
          log('✅ Zu main Branch gewechselt');

          // main Branch aktualisieren
          try {
            execSync('git pull origin main', { encoding: 'utf8' });
            log('✅ main Branch aktualisiert');
          } catch (e) {
            log(`⚠️ main Branch Update fehlgeschlagen: ${e.message}`);
          }
        } catch (e) {
          // main existiert nicht, prüfe master
          try {
            execSync('git show-ref --verify --quiet refs/heads/master', { stdio: 'pipe' });
            // master existiert, dorthin wechseln
            execSync('git checkout master', { encoding: 'utf8' });
            log('✅ Zu master Branch gewechselt');

            // master Branch aktualisieren
            try {
              execSync('git pull origin master', { encoding: 'utf8' });
              log('✅ master Branch aktualisiert');
            } catch (e) {
              log(`⚠️ master Branch Update fehlgeschlagen: ${e.message}`);
            }
          } catch (e2) {
            // Weder main noch master existiert - main erstellen
            log('🆕 Erstelle main Branch als neuen Hauptbranch...');
            execSync('git checkout -b main', { encoding: 'utf8' });
            log('✅ main Branch erstellt und aktiviert');

            try {
              execSync('git push -u origin main', { encoding: 'utf8' });
              log('✅ main Branch als neuer Hauptbranch gepusht');
            } catch (e3) {
              log(`⚠️ main Branch Push fehlgeschlagen: ${e3.message}`);
            }
          }
        }
      } catch (error) {
        log(`❌ Branch-Wechsel fehlgeschlagen: ${error.message} - Bleibe bei ${currentBranch}`);
      }
    } else {
      log(`✅ Bereits auf Hauptbranch (${currentBranch}) - kein Wechsel nötig`);

      // Hauptbranch aktualisieren
      try {
        execSync(`git pull origin ${currentBranch}`, { encoding: 'utf8' });
        log(`✅ ${currentBranch} Branch aktualisiert`);
      } catch (e) {
        log(`⚠️ ${currentBranch} Branch Update fehlgeschlagen: ${e.message}`);
      }
    }

    return true;
  } catch (error) {
    log(`❌ Fehler beim professionellen Git-Management: ${error.message}`);
    return false;
  }
}

/**
 * Startet VS Code neu mit optimierten Einstellungen
 */
function restartVSCodeOptimized() {
  log('🔄 Starte VS Code mit optimierten Einstellungen neu...');

  try {
    const rootDir = path.join(__dirname, '..');

    // VS Code mit speziellen Flags für Stabilität starten
    const vscodeFlags = [
      '--disable-gpu', // GPU-Beschleunigung deaktivieren
      '--disable-extensions', // Extensions temporär deaktivieren
      '--new-window', // Neues Fenster erzwingen
      '--max-memory=4096', // Memory-Limit setzen
    ];

    if (os.platform() === 'win32') {
      // Windows
      spawn('code', [...vscodeFlags, rootDir], {
        detached: true,
        stdio: 'ignore',
      });
    } else {
      // Unix/Linux/Mac
      spawn('code', [...vscodeFlags, rootDir], {
        detached: true,
        stdio: 'ignore',
      });
    }

    log('✅ VS Code Neustart eingeleitet');
    log('⚠️ Extensions sind temporär deaktiviert für Stabilität');
    log(
      'ℹ️ Nach dem Start: Strg+Shift+P > "Developer: Reload Window" um Extensions zu reaktivieren',
    );
  } catch (error) {
    log(`❌ Fehler beim Neustart von VS Code: ${error.message}`);
  }
}

/**
 * Hauptfunktion: Notfall-Recovery
 */
function executeEmergencyRecovery() {
  log('🆘 NOTFALL-RECOVERY GESTARTET');
  log('=====================================');

  // 1. Backup erstellen
  const backupPath = createEmergencyBackup();

  // 2. Professionelles Git-Management durchführen
  const gitManaged = handleMassiveChanges();

  // 3. VS Code-Prozesse beenden
  killVSCodeProcesses();

  // 4. VS Code optimiert neustarten
  restartVSCodeOptimized();

  // 5. Zusammenfassung
  log('=====================================');
  log('✅ NOTFALL-RECOVERY ABGESCHLOSSEN');
  log(`📁 Backup erstellt: ${backupPath || 'FEHLER'}`);
  log(`💾 Git-Management durchgeführt: ${gitManaged ? 'ERFOLGREICH' : 'FEHLER'}`);
  log('🔄 VS Code neugestartet mit optimierten Einstellungen');
  log('');
  log('📋 NÄCHSTE SCHRITTE:');
  log('1. Warte bis VS Code vollständig geladen ist');
  log('2. Strg+Shift+P > "Developer: Reload Window"');
  log('3. Extensions nach und nach wieder aktivieren');
  log('4. Du befindest dich jetzt auf dem main/master Branch für maximale Stabilität');
  log('5. Recovery-Log prüfen für weitere Details');
  log(`5. Log-Datei: ${CONFIG.RECOVERY_LOG}`);

  console.log('\n🎯 RECOVERY ABGESCHLOSSEN - VS Code sollte jetzt stabil laufen!');
}

// Recovery sofort ausführen, wenn direkt aufgerufen
if (require.main === module) {
  executeEmergencyRecovery();
}

module.exports = {
  executeEmergencyRecovery,
  killVSCodeProcesses,
  createEmergencyBackup,
  handleMassiveChanges,
};
