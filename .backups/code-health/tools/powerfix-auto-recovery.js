/**
 * PowerShell Fix - Auto-Recovery System
 *
 * Optimierte Version des Auto-Recovery Systems ohne PowerShell-Probleme
 * Verhindert das ständige Öffnen/Schließen von PowerShell-Fenstern
 *
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Konfiguration
const CONFIG = {
  logFile: path.join(__dirname, 'auto-recovery.log'),
  statusFile: path.join(__dirname, 'auto-recovery-status.json'),
  lockFile: path.join(__dirname, '.auto-recovery.lock'),
  recoveryIntervalMinutes: 30,
  maxRecoveriesPerDay: 5,
  netlifyDeployHook: process.env.NETLIFY_DEPLOY_HOOK || '',
  isNetlifyDeployEnabled: process.env.NETLIFY_DEPLOY_ENABLED === 'true',
  maxLockAgeMinutes: 10, // Lock-Datei wird nach dieser Zeit ignoriert
};

// Status-Objekt
const recoveryStatus = {
  timestamp: new Date().toISOString(),
  lastRun: null,
  recoveriesPerformed: 0,
  lastRecoveryDate: null,
  todaysRecoveries: 0,
  status: 'idle',
  lastActions: [],
  errors: [],
};

/**
 * Log-Funktion für Konsole und Datei
 */
] [${level.toUpperCase()}] ${message}`;

  // Log in Konsole
  switch (level) {
    case 'error':
      console.error(message);
      break;
    case 'warn':
      console.warn(message);
      break;
    case 'success':
      console.log(message);
      break;
    case 'info':
      console.log(message);
      break;
    default:
      console.log(message);
  }

  // Log in Datei
  try {
    fs.appendFileSync(CONFIG.logFile, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: ${err.message}`);
  }
}

/**
 * Prüft ob eine Lock-Datei existiert und ob sie gültig ist
 */
function checkLock() {
  if (fs.existsSync(CONFIG.lockFile)) {
    const lockData = fs.statSync(CONFIG.lockFile);
    const lockAge = Date.now() - lockData.mtimeMs;
    const maxLockAge = CONFIG.maxLockAgeMinutes * 60 * 1000;

    // Wenn der Lock zu alt ist, entfernen wir ihn
    if (lockAge > maxLockAge) {
      log(`Lock-Datei ist zu alt (${Math.round(lockAge / 1000)}s), wird entfernt`, 'warn');
      fs.unlinkSync(CONFIG.lockFile);
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Erstellt eine Lock-Datei
 */
function createLock() {
  try {
    fs.writeFileSync(CONFIG.lockFile, new Date().toISOString(), 'utf8');
    return true;
  } catch (err) {
    log(`Fehler beim Erstellen der Lock-Datei: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Entfernt die Lock-Datei
 */
function removeLock() {
  if (fs.existsSync(CONFIG.lockFile)) {
    try {
      fs.unlinkSync(CONFIG.lockFile);
      return true;
    } catch (err) {
      log(`Fehler beim Entfernen der Lock-Datei: ${err.message}`, 'error');
      return false;
    }
  }
  return true;
}

/**
 * Lädt den aktuellen Status oder erstellt einen neuen
 */
function loadStatus() {
  try {
    if (fs.existsSync(CONFIG.statusFile)) {
      const data = fs.readFileSync(CONFIG.statusFile, 'utf8');
      const loadedStatus = JSON.parse(data);

      // Prüfe ob wir den Tages-Zähler zurücksetzen müssen
      const today = new Date().toISOString().split('T')[0];
      if (loadedStatus.lastRecoveryDate && !loadedStatus.lastRecoveryDate.startsWith(today)) {
        loadedStatus.todaysRecoveries = 0;
        loadedStatus.lastRecoveryDate = null;
      }

      Object.assign(recoveryStatus, loadedStatus);
    }
  } catch (err) {
    log(`Fehler beim Laden des Status: ${err.message}`, 'error');
  }
}

/**
 * Speichert den aktuellen Status
 */
function saveStatus() {
  try {
    recoveryStatus.timestamp = new Date().toISOString();
    fs.writeFileSync(CONFIG.statusFile, JSON.stringify(recoveryStatus, null, 2), 'utf8');
    return true;
  } catch (err) {
    log(`Fehler beim Speichern des Status: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Führt einen Node.js-Befehl aus (vermeidet PowerShell)
 */
function runNodeCommand(command) {
  return new Promise((resolve) => {
    try {
      log(`Führe Befehl aus: ${command}`, 'info');

      const result = execSync(command, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      log(`Befehl erfolgreich abgeschlossen: ${command}`, 'success');
      resolve(true);
    } catch (err) {
      log(`Fehler beim Ausführen des Befehls ${command}: ${err.message}`, 'error');
      resolve(false);
    }
  });
}

/**
 * Führt eine Selbstdiagnose durch
 */
function performSelfDiagnosis() {
  try {
    log('🔍 Führe Selbstdiagnose durch...', 'info');

    // Prüfe ob kritische Dateien existieren
    const criticalFiles = [
      '../index.html',
      '../main.js',
      '../styles.css',
      '../favicon.ico',
      'website-health-check.js',
      'deployment-checker.js',
    ];

    const missingFiles = criticalFiles.filter((file) => !fs.existsSync(path.join(__dirname, file)));

    if (missingFiles.length > 0) {
      log(`⚠️ Kritische Dateien fehlen: ${missingFiles.join(', ')}`, 'warn');
    } else {
      log('✅ Alle kritischen Dateien vorhanden', 'success');
    }

    return missingFiles.length === 0;
  } catch (err) {
    log(`Fehler bei der Selbstdiagnose: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Website-Zustand prüfen
 */
async function checkWebsiteStatus() {
  try {
    log('🔍 Prüfe Website-Status...', 'info');

    // Führe Website Health Check aus
    const healthCheck = require('./website-health-check');
    await healthCheck.runHealthCheck();

    return true;
  } catch (err) {
    log(`Fehler beim Prüfen des Website-Status: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Führt die notwendigen Reparaturmaßnahmen durch
 */
async function performRecoveryActions(force = false) {
  // Prüfe ob maximale Anzahl von Recoveries für heute erreicht ist
  if (!force && recoveryStatus.todaysRecoveries >= CONFIG.maxRecoveriesPerDay) {
    log(
      `⚠️ Maximale Anzahl von Recoveries für heute erreicht (${CONFIG.maxRecoveriesPerDay})`,
      'warn',
    );
    return false;
  }

  log('🔧 Führe Wiederherstellungsmaßnahmen durch...', 'info');
  recoveryStatus.status = 'recovering';
  saveStatus();

  // Liste der auszuführenden Aktionen
  const actions = [
    // Website Health Check ausführen
    {
      name: 'health_check',
      command: 'node tools/website-health-check.js --silent',
    },
    // Deployment Status prüfen
    {
      name: 'deployment_check',
      command: 'node tools/deployment-checker.js --silent',
    },
    // HTML validieren
    {
      name: 'validate_html',
      command: 'npx html-validate index.html 404.html || true',
    },
    // Assets optimieren
    {
      name: 'optimize_assets',
      command: 'node tools/optimize-assets.js || true',
    },
  ];

  // Füge Netlify-spezifische Aktionen hinzu, wenn konfiguriert
  if (CONFIG.isNetlifyDeployEnabled && CONFIG.netlifyDeployHook) {
    actions.push({
      name: 'purge_cache',
      command: `curl -X POST "${CONFIG.netlifyDeployHook}&clear_cache=true" || true`,
    });
  }

  // Führe Aktionen aus
  recoveryStatus.lastActions = [];
  let successCount = 0;

  for (const action of actions) {
    const success = await runNodeCommand(action.command);
    recoveryStatus.lastActions.push({
      name: action.name,
      timestamp: new Date().toISOString(),
      success,
    });

    if (success) successCount++;

    // Kleine Pause zwischen den Aktionen
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Update Status
  recoveryStatus.recoveriesPerformed++;
  recoveryStatus.todaysRecoveries++;
  recoveryStatus.lastRecoveryDate = new Date().toISOString();
  recoveryStatus.lastRun = new Date().toISOString();
  recoveryStatus.status = 'idle';

  const success = successCount > 0;
  log(
    `${success ? '✅' : '❌'} Wiederherstellungsmaßnahmen ${success ? 'erfolgreich' : 'teilweise fehlgeschlagen'} (${successCount}/${actions.length} erfolgreich)`,
    success ? 'success' : 'warn',
  );

  saveStatus();
  return success;
}

/**
 * Hauptfunktion
 */
async function main(args = []) {
  try {
    const forceRecovery = args.includes('--force');

    // Überprüfe Lock-Datei, um Mehrfachausführungen zu vermeiden
    if (checkLock() && !forceRecovery) {
      log('Auto-Recovery System läuft bereits, Ausführung wird abgebrochen', 'warn');
      return;
    }

    // Erstelle Lock-Datei
    createLock();

    // Lade den aktuellen Status
    loadStatus();

    // Lösche alte Log-Datei falls zu groß
    try {
      const logStat = fs.statSync(CONFIG.logFile);
      if (logStat.size > 1024 * 1024) {
        // > 1 MB
        fs.truncateSync(CONFIG.logFile, 0);
        log('Log-Datei zurückgesetzt (war > 1 MB)', 'info');
      }
    } catch (err) {
      // Ignoriere Fehler beim Zurücksetzen der Log-Datei
    }

    log('🚀 Auto-Recovery System wird gestartet...', 'info');

    // Prüfe Selbstdiagnose
    const selfDiagnosisOk = performSelfDiagnosis();

    if (!selfDiagnosisOk && !forceRecovery) {
      log('❌ Selbstdiagnose fehlgeschlagen, Recovery wird abgebrochen', 'error');
      recoveryStatus.status = 'error';
      recoveryStatus.errors.push({
        timestamp: new Date().toISOString(),
        message: 'Selbstdiagnose fehlgeschlagen',
      });
      saveStatus();
      removeLock();
      return;
    }

    // Prüfe Website-Status
    await checkWebsiteStatus();

    // Führe Recovery-Aktionen durch
    if (forceRecovery) {
      log('⚠️ Erzwungener Recovery-Modus aktiviert', 'warn');
      await performRecoveryActions(true);
    } else {
      // Prüfe ob es Zeit für ein reguläres Recovery ist
      const lastRun = recoveryStatus.lastRun ? new Date(recoveryStatus.lastRun) : null;
      const now = new Date();

      if (!lastRun || (now - lastRun) / (1000 * 60) >= CONFIG.recoveryIntervalMinutes) {
        await performRecoveryActions();
      } else {
        log(
          `Nächstes reguläres Recovery in ${Math.ceil(CONFIG.recoveryIntervalMinutes - (now - lastRun) / (1000 * 60))} Minuten`,
          'info',
        );
      }
    }

    // Lock entfernen
    removeLock();

    log('✅ Auto-Recovery System abgeschlossen', 'success');
  } catch (err) {
    log(`Kritischer Fehler im Auto-Recovery System: ${err.message}`, 'error');
    recoveryStatus.status = 'error';
    recoveryStatus.errors.push({
      timestamp: new Date().toISOString(),
      message: err.message,
      stack: err.stack,
    });
    saveStatus();
    removeLock();
  }
}

// Führe Hauptfunktion aus, wenn direkt aufgerufen
if (require.main === module) {
  const args = process.argv.slice(2);
  const silentMode = args.includes('--silent');

  if (silentMode) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }

  main(args).catch((err) => {
    fs.appendFileSync(
      CONFIG.logFile,
      `[${new Date().toISOString()}] [CRITICAL] ${err.message}\n${err.stack}\n`,
      'utf8',
    );
  });
}

module.exports = {
  performRecoveryActions,
  checkWebsiteStatus,
};
