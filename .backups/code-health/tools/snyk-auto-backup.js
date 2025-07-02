/**
 * Snyk Auto-Backup Tool
 *
 * Dieses Tool erstellt automatische Backups vor Snyk-Sicherheitsupdates
 * und stellt eine Recovery-Option für fehlgeschlagene Updates bereit.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const config = {
  backupDir: './.dependency-backups',
  maxBackups: 10,
  securityDir: './.security-reports',
  emergencyDir: './.security-emergency',
};

// Farben für die Konsolenausgabe
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Logger-Funktion


// Verzeichnisse initialisieren
function initDirectories() {
  const dirs = [config.backupDir, config.securityDir, config.emergencyDir];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ Verzeichnis erstellt: ${dir}`, colors.green);
    }
  });
}

// Backup der Abhängigkeiten erstellen
function backupDependencies() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(config.backupDir, `backup-${timestamp}`);

  try {
    fs.mkdirSync(backupDir, { recursive: true });

    // package.json sichern
    if (fs.existsSync('./package.json')) {
      fs.copyFileSync('./package.json', path.join(backupDir, 'package.json'));
    }

    // package-lock.json sichern
    if (fs.existsSync('./package-lock.json')) {
      fs.copyFileSync('./package-lock.json', path.join(backupDir, 'package-lock.json'));
    }

    // node_modules sichern (optional)
    // const nodeModulesBackup = path.join(backupDir, 'node_modules_backup.tar');
    // if (fs.existsSync('./node_modules')) {
    //   execSync(`tar -cf ${nodeModulesBackup} ./node_modules`);
    // }

    log(`✅ Abhängigkeiten gesichert: ${backupDir}`, colors.green);
    cleanupOldBackups();
    return backupDir;
  } catch (error) {
    log(`❌ Fehler beim Sichern der Abhängigkeiten: ${error.message}`, colors.red);
    return null;
  }
}

// Alte Backups aufräumen
function cleanupOldBackups() {
  try {
    const backups = fs
      .readdirSync(config.backupDir)
      .filter((dir) => dir.startsWith('backup-'))
      .map((dir) => ({
        name: dir,
        path: path.join(config.backupDir, dir),
        time: fs.statSync(path.join(config.backupDir, dir)).birthtime,
      }))
      .sort((a, b) => b.time - a.time); // Sortieren nach Zeit (neueste zuerst)

    if (backups.length > config.maxBackups) {
      const toDelete = backups.slice(config.maxBackups);
      toDelete.forEach((backup) => {
        fs.rmSync(backup.path, { recursive: true, force: true });
        log(`🗑️ Altes Backup gelöscht: ${backup.name}`, colors.yellow);
      });
    }
  } catch (error) {
    log(`❌ Fehler beim Aufräumen alter Backups: ${error.message}`, colors.red);
  }
}

// Hauptfunktion
async function main() {
  const args = process.argv.slice(2);
  const options = {
    silent: args.includes('--silent'),
    beforeUpdate: args.includes('--before-update'),
    restore: args.includes('--restore'),
    list: args.includes('--list'),
  };

  if (!options.silent) {
    log('🔒 Snyk Auto-Backup Tool', colors.magenta);
    log('========================', colors.magenta);
  }

  // Verzeichnisse initialisieren
  initDirectories();

  // Aktionen ausführen
  if (options.list) {
    listBackups();
    return;
  }

  if (options.restore) {
    const backupName = args.find((arg) => arg.startsWith('--backup='))?.split('=')[1];
    restoreBackup(backupName);
    return;
  }

  // Standard: Backup erstellen
  backupDependencies();

  if (!options.silent) {
    log('\n✅ Backup abgeschlossen!', colors.green);
  }
}

// Backups auflisten
function listBackups() {
  try {
    const backups = fs
      .readdirSync(config.backupDir)
      .filter((dir) => dir.startsWith('backup-'))
      .map((dir) => ({
        name: dir,
        path: path.join(config.backupDir, dir),
        time: fs.statSync(path.join(config.backupDir, dir)).birthtime,
      }))
      .sort((a, b) => b.time - a.time); // Sortieren nach Zeit (neueste zuerst)

    log('\n📋 Verfügbare Backups:', colors.cyan);
    log('------------------', colors.cyan);

    if (backups.length === 0) {
      log('Keine Backups gefunden.', colors.yellow);
      return;
    }

    backups.forEach((backup, index) => {
      log(
        `${index + 1}. ${backup.name} - ${backup.time.toLocaleString()}`,
        index === 0 ? colors.green : colors.reset,
      );
    });

    log('\nWiederherstellung: node snyk-auto-backup.js --restore --backup=<name>', colors.blue);
  } catch (error) {
    log(`❌ Fehler beim Auflisten der Backups: ${error.message}`, colors.red);
  }
}

// Backup wiederherstellen
function restoreBackup(backupName) {
  try {
    if (!backupName) {
      // Wenn kein Backup-Name angegeben, verwende das neueste
      const backups = fs
        .readdirSync(config.backupDir)
        .filter((dir) => dir.startsWith('backup-'))
        .map((dir) => ({
          name: dir,
          path: path.join(config.backupDir, dir),
          time: fs.statSync(path.join(config.backupDir, dir)).birthtime,
        }))
        .sort((a, b) => b.time - a.time); // Sortieren nach Zeit (neueste zuerst)

      if (backups.length === 0) {
        log('❌ Keine Backups gefunden.', colors.red);
        return;
      }

      backupName = backups[0].name;
      log(`ℹ️ Kein Backup angegeben, verwende neuestes: ${backupName}`, colors.blue);
    }

    const backupDir = path.join(config.backupDir, backupName);

    if (!fs.existsSync(backupDir)) {
      log(`❌ Backup nicht gefunden: ${backupName}`, colors.red);
      return;
    }

    // Aktuelle Dateien als Notfall-Backup speichern
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const emergencyDir = path.join(config.emergencyDir, `emergency-${timestamp}`);
    fs.mkdirSync(emergencyDir, { recursive: true });

    if (fs.existsSync('./package.json')) {
      fs.copyFileSync('./package.json', path.join(emergencyDir, 'package.json'));
    }

    if (fs.existsSync('./package-lock.json')) {
      fs.copyFileSync('./package-lock.json', path.join(emergencyDir, 'package-lock.json'));
    }

    log(`✅ Notfall-Backup erstellt: ${emergencyDir}`, colors.green);

    // Wiederherstellung durchführen
    log('🔄 Stelle Backup wieder her...', colors.cyan);

    if (fs.existsSync(path.join(backupDir, 'package.json'))) {
      fs.copyFileSync(path.join(backupDir, 'package.json'), './package.json');
      log('✅ package.json wiederhergestellt', colors.green);
    }

    if (fs.existsSync(path.join(backupDir, 'package-lock.json'))) {
      fs.copyFileSync(path.join(backupDir, 'package-lock.json'), './package-lock.json');
      log('✅ package-lock.json wiederhergestellt', colors.green);
    }

    // Node-Module neu installieren
    log('📦 Installiere Abhängigkeiten neu...', colors.cyan);
    try {
      execSync('npm ci', { stdio: 'inherit' });
      log('✅ Abhängigkeiten erfolgreich installiert', colors.green);
    } catch (error) {
      log(
        `⚠️ Warnung: npm ci fehlgeschlagen, versuche npm install: ${error.message}`,
        colors.yellow,
      );
      try {
        execSync('npm install', { stdio: 'inherit' });
        log('✅ Abhängigkeiten erfolgreich installiert', colors.green);
      } catch (installError) {
        log(`❌ Fehler bei der Installation: ${installError.message}`, colors.red);
      }
    }

    log('\n✅ Wiederherstellung abgeschlossen!', colors.green);
  } catch (error) {
    log(`❌ Fehler bei der Wiederherstellung: ${error.message}`, colors.red);
  }
}

// Skript ausführen
main().catch((error) => {
  log(`❌ Unerwarteter Fehler: ${error.message}`, colors.red);
  process.exit(1);
});
