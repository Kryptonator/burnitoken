/**
 * Master Task Coordinator
 *
 * Hilfsskript zur Diagnose und Reparatur von Master Task Manager Problemen
 *
 * Erstellt: 2025-06-30
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const MASTER_SCRIPT = path.join(__dirname, 'master-task-manager.js');
const LOCK_FILE = path.join(__dirname, '.master-task.lock');
const STATUS_FILE = path.join(__dirname, 'master-task-status.json');
const LOG_FILE = path.join(__dirname, 'master-task-manager.log');
const BACKUP_DIR = path.join(__dirname, '.backups');

/**
 * Prüft, ob der Master Task Manager aktiv ist oder hängt
 */
function checkMasterTaskStatus() {
  console.log('🔍 Prüfe Status des Master Task Managers...');

  let isLocked = false;
  let isStale = false;
  let lockAge = 0;

  // Lock-Datei prüfen
  if (fs.existsSync(LOCK_FILE)) {
    isLocked = true;
    const stats = fs.statSync(LOCK_FILE);
    const now = new Date();
    lockAge = now - stats.mtime;
    isStale = lockAge > 10 * 60 * 1000; // 10 Minuten

    console.log(`Lock-Datei gefunden: ${isStale ? '🔴 VERALTET' : '🟢 AKTIV'}`);
    console.log(`Alter: ${Math.round(lockAge / 1000 / 60)} Minuten`);
  } else {
    console.log('Lock-Datei: 🟡 NICHT VORHANDEN');
  }

  // Status-Datei prüfen
  if (fs.existsSync(STATUS_FILE)) {
    try {
      const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
      const lastUpdate = new Date(status.lastUpdate || 0);
      const now = new Date();
      const statusAge = now - lastUpdate;

      console.log(`Status-Datei: ${statusAge > 30 * 60 * 1000 ? '🟠 VERALTET' : '🟢 AKTUELL'}`);
      console.log(`Letzte Aktualisierung: ${lastUpdate.toLocaleString()}`);

      const errorCount = (status.errors || []).length;
      if (errorCount > 0) {
        console.log(`⚠️ ${errorCount} Fehler im Status`);

        status.errors.forEach((error, i) => {
          console.log(`  ${i + 1}. Service: ${error.service}`);
          console.log(`     Fehler: ${error.error}`);
          console.log(`     Zeit: ${new Date(error.timestamp).toLocaleString()}`);
        });
      }

      const serviceCount = Object.keys(status.services || {}).length;
      const failedServices = Object.values(status.services || {}).filter(
        (s) => s.status === 'failed' || s.status === 'error',
      ).length;

      console.log(`Services: ${serviceCount} gesamt, ${failedServices} fehlgeschlagen`);
    } catch (e) {
      console.log('⚠️ Fehler beim Lesen der Status-Datei:', e.message);
    }
  } else {
    console.log('Status-Datei: 🟠 NICHT VORHANDEN');
  }

  // Log-Datei prüfen
  if (fs.existsSync(LOG_FILE)) {
    const stats = fs.statSync(LOG_FILE);
    const size = stats.size / 1024; // KB

    console.log(`Log-Datei: 🟢 VORHANDEN (${Math.round(size)} KB)`);

    try {
      // Letzte 5 Log-Zeilen anzeigen
      const logTail = execSync(`tail -n 5 "${LOG_FILE}"`, { encoding: 'utf8' });
      console.log('\nLetzte Log-Einträge:');
      console.log(logTail);
    } catch (e) {
      // Bei Windows oder anderen Problemen mit tail
      try {
        const log = fs.readFileSync(LOG_FILE, 'utf8');
        const lines = log.split('\n');
        const lastLines = lines.slice(-5);

        console.log('\nLetzte Log-Einträge:');
        lastLines.forEach((line) => console.log(line));
      } catch (e2) {
        console.log('Fehler beim Lesen der Log-Datei');
      }
    }
  } else {
    console.log('Log-Datei: 🟠 NICHT VORHANDEN');
  }

  return { isLocked, isStale, lockAge };
}

/**
 * Sichert alle Master Task Manager Dateien
 */
function backupMasterTaskFiles() {
  console.log('\n📦 Erstelle Sicherungskopien...');

  // Backup-Verzeichnis erstellen, falls es nicht existiert
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupBase = path.join(BACKUP_DIR, `master-task-backup-${timestamp}`);

  // Lock-Datei sichern
  if (fs.existsSync(LOCK_FILE)) {
    fs.copyFileSync(LOCK_FILE, `${backupBase}-lock`);
  }

  // Status-Datei sichern
  if (fs.existsSync(STATUS_FILE)) {
    fs.copyFileSync(STATUS_FILE, `${backupBase}-status.json`);
  }

  // Log-Datei sichern
  if (fs.existsSync(LOG_FILE)) {
    fs.copyFileSync(LOG_FILE, `${backupBase}-log.txt`);
  }

  console.log(`✅ Backup erstellt in ${BACKUP_DIR}`);
}

/**
 * Repariert veraltete Lock- und Status-Dateien
 */
function repairMasterTaskManager() {
  console.log('\n🔧 Repariere Master Task Manager...');

  // Lock-Datei entfernen, falls sie existiert
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
    console.log('✅ Lock-Datei entfernt');
  }

  // Status-Datei aktualisieren
  if (fs.existsSync(STATUS_FILE)) {
    try {
      const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));

      // Setze alle Services auf 'stopped'
      Object.keys(status.services || {}).forEach((key) => {
        status.services[key].status = 'stopped';
        status.services[key].exitCode = null;
        status.services[key].running = false;
      });

      // Leere Fehlerliste
      status.errors = [];
      status.lastUpdate = new Date().toISOString();
      status.isActive = false;

      // Status-Datei speichern
      fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
      console.log('✅ Status-Datei aktualisiert');
    } catch (e) {
      console.log('⚠️ Fehler beim Aktualisieren der Status-Datei:', e.message);

      // Erstelle neue leere Status-Datei als Fallback
      const emptyStatus = {
        isActive: false,
        services: {},
        errors: [],
        lastUpdate: new Date().toISOString(),
      };

      fs.writeFileSync(STATUS_FILE, JSON.stringify(emptyStatus, null, 2));
      console.log('✅ Neue leere Status-Datei erstellt');
    }
  }

  console.log('✅ Reparatur abgeschlossen');
}

/**
 * Prüft, ob alle erforderlichen Module vorhanden sind
 */
function checkRequiredModules() {
  console.log('\n🔍 Prüfe erforderliche Module...');
  const modulesToCheck = ['alert-service.js', 'todo-manager.js'];

  let allOk = true;

  modulesToCheck.forEach((module) => {
    const modulePath = path.join(__dirname, module);

    if (fs.existsSync(modulePath)) {
      console.log(`✅ Modul gefunden: ${module}`);
    } else {
      console.log(`❌ Modul fehlt: ${module}`);
      allOk = false;

      // Erstelle leere Modul-Dateien als Fallback
      const moduleContent = `/**
 * ${module.replace('.js', '')}
 * Automatisch generierter Fallback-Stub
 */

// Leere Implementierungen, um Abstürze zu vermeiden
${
  module === 'alert-service.js'
    ? `exports.sendAlert = function(title, message) {
  console.log(\`ALERT: \${title} - \${message}\`);
  return true;
};`
    : ''
}

${
  module === 'todo-manager.js'
    ? `exports.createTodo = function(title, description, source) {
  console.log(\`TODO: \${title} (\${source})\`);
  return true;
};`
    : ''
}
`;

      try {
        fs.writeFileSync(modulePath, moduleContent);
        console.log(`✅ Fallback-Modul erstellt: ${module}`);
      } catch (e) {
        console.log(`⚠️ Konnte kein Fallback-Modul erstellen: ${e.message}`);
      }
    }
  });

  return allOk;
}

/**
 * Hauptfunktion
 */
function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║ MASTER TASK MANAGER DIAGNOSE & REPAIR  ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Master Task Manager Status prüfen
  const status = checkMasterTaskStatus();

  // Module überprüfen
  const modulesOk = checkRequiredModules();

  // Sicherheitskopien erstellen
  backupMasterTaskFiles();

  // Reparieren, falls veraltet
  if (status.isStale || process.argv.includes('--force-repair')) {
    repairMasterTaskManager();
  }

  // Zusammenfassung und Empfehlungen
  console.log('\n📊 Diagnose-Zusammenfassung:');
  console.log(
    `Master Task Manager Script: ${fs.existsSync(MASTER_SCRIPT) ? '✅ GEFUNDEN' : '❌ FEHLT'}`,
  );
  console.log(
    `Lock-Status: ${status.isLocked ? (status.isStale ? '🔴 VERALTET' : '🟢 AKTIV') : '🟡 NICHT GESPERRT'}`,
  );
  console.log(`Module: ${modulesOk ? '✅ ALLE OK' : '⚠️ PROBLEME GEFUNDEN UND BEHOBEN'}`);

  console.log('\n🛠️ Empfohlene Aktionen:');

  if (status.isStale) {
    console.log('✓ Master Task Manager wurde repariert und kann neu gestartet werden.');
    console.log('  Befehl: node tools/master-task-manager.js');
  } else if (status.isLocked && !status.isStale) {
    console.log('! Master Task Manager läuft derzeit. Keine Aktion erforderlich.');
  } else {
    console.log('✓ Master Task Manager kann gestartet werden.');
    console.log('  Befehl: node tools/master-task-manager.js');
  }

  if (!modulesOk) {
    console.log('\n⚠️ Wichtiger Hinweis:');
    console.log('  Fehlende Module wurden durch Fallback-Implementierungen ersetzt.');
    console.log('  Dies könnte die Funktionalität einschränken.');
    console.log('  Die korrekten Module sollten wenn möglich wiederhergestellt werden.');
  }

  console.log('\n✨ Diagnose abgeschlossen!');
}

// Programm ausführen
main();
