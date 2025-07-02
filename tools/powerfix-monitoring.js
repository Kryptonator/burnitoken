/**
 * PowerShell Fix - Unified Monitoring Service
 *
 * Optimierte Version des Unified Monitoring Service ohne PowerShell-Probleme
 * Verhindert das ständige Öffnen/Schließen von PowerShell-Fenstern
 *
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Konfiguration
const CONFIG = {
  monitoringIntervalMinutes: 15,
  criticalCheckIntervalMinutes: 5,
  reportPath: path.join(__dirname, 'reports'),
  logFile: path.join(__dirname, 'powerfix-monitoring.log'),
  statusFile: path.join(__dirname, 'powerfix-monitoring-status.json'),
  lockFile: path.join(__dirname, '.powerfix-monitoring.lock'),
  maxLockAgeMinutes: 10,
  urls: ['https://burnitoken.com', 'https://www.burnitoken.com', 'https://burnitoken.website'],
};

// Status-Objekt
const monitoringStatus = {
  timestamp: new Date().toISOString(),
  startTime: new Date().toISOString(),
  lastCheck: null,
  checksPerformed: 0,
  monitoringActive: false,
  isFirstRun: true,
  errors: [],
  websiteStatus: {
    isAvailable: false,
    statusCode: 0,
    responseTime: 0,
    lastCheck: null,
  },
  sslStatus: {
    isValid: false,
    expiryDate: null,
    daysRemaining: 0,
    lastCheck: null,
  },
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
  if (fs.existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
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

      Object.assign(monitoringStatus, loadedStatus);
      monitoringStatus.isFirstRun = false;
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
    monitoringStatus.timestamp = new Date().toISOString();
    fs.writeFileSync(CONFIG.statusFile, JSON.stringify(monitoringStatus, null, 2), 'utf8');
    return true;
  } catch (err) {
    log(`Fehler beim Speichern des Status: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Überprüft die Website-Verfügbarkeit
 */
async function checkWebsiteAvailability() {
  return new Promise((resolve) => {
    try {
      log(`Überprüfe Website-Verfügbarkeit: ${CONFIG.urls[0]}...`, 'info');

      const startTime = Date.now();
      const req = https.request(CONFIG.urls[0], { method: 'HEAD', timeout: 10000 }, (res) => {
        const responseTime = Date.now() - startTime;

        monitoringStatus.websiteStatus = {
          isAvailable: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          responseTime,
          lastCheck: new Date().toISOString(),
        };

        if (monitoringStatus.websiteStatus.isAvailable) {
          log(
            `✅ Website ist verfügbar. Status: ${res.statusCode}, Zeit: ${responseTime}ms`,
            'success',
          );
        } else {
          log(
            `❌ Website ist nicht verfügbar. Status: ${res.statusCode}, Zeit: ${responseTime}ms`,
            'error',
          );
        }

        resolve(monitoringStatus.websiteStatus.isAvailable);
      });

      req.on('error', (err) => {
        log(`❌ Fehler bei Website-Prüfung: ${err.message}`, 'error');

        monitoringStatus.websiteStatus = {
          isAvailable: false,
          statusCode: 0,
          responseTime: 0,
          error: err.message,
          lastCheck: new Date().toISOString(),
        };

        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        log(`❌ Timeout bei Website-Prüfung`, 'error');

        monitoringStatus.websiteStatus = {
          isAvailable: false,
          statusCode: 0,
          responseTime: 10000,
          error: 'Timeout',
          lastCheck: new Date().toISOString(),
        };

        resolve(false);
      });

      req.end();
    } catch (err) {
      log(`❌ Unerwarteter Fehler bei Website-Prüfung: ${err.message}`, 'error');
      monitoringStatus.websiteStatus.isAvailable = false;
      monitoringStatus.websiteStatus.lastCheck = new Date().toISOString();
      monitoringStatus.websiteStatus.error = err.message;
      resolve(false);
    }
  });
}

/**
 * Überprüft das SSL-Zertifikat
 */
async function checkSSLCertificate() {
  return new Promise((resolve) => {
    try {
      log(`Überprüfe SSL-Zertifikat: ${CONFIG.urls[0]}...`, 'info');

      const req = https.request(CONFIG.urls[0], { method: 'HEAD', timeout: 10000 }, (res) => {
        try {
          const cert = res.socket.getPeerCertificate();

          if (!cert || Object.keys(cert).length === 0) {
            log(`❌ Kein SSL-Zertifikat gefunden`, 'error');
            monitoringStatus.sslStatus.isValid = false;
            monitoringStatus.sslStatus.lastCheck = new Date().toISOString();
            resolve(false);
            return;
          }

          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();

          const isValid = now >= validFrom && now <= validTo;
          const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

          monitoringStatus.sslStatus = {
            isValid,
            expiryDate: validTo.toISOString(),
            daysRemaining,
            issuer: cert.issuer?.O || 'Unknown',
            lastCheck: new Date().toISOString(),
          };

          if (isValid) {
            log(`✅ SSL-Zertifikat ist gültig (läuft in ${daysRemaining} Tagen ab)`, 'success');
          } else {
            log(`❌ SSL-Zertifikat ist ungültig oder abgelaufen`, 'error');
          }

          resolve(isValid);
        } catch (certErr) {
          log(`❌ SSL-Zertifikatsfehler: ${certErr.message}`, 'error');
          monitoringStatus.sslStatus.isValid = false;
          monitoringStatus.sslStatus.lastCheck = new Date().toISOString();
          monitoringStatus.sslStatus.error = certErr.message;
          resolve(false);
        }
      });

      req.on('error', (err) => {
        log(`❌ Fehler bei SSL-Prüfung: ${err.message}`, 'error');
        monitoringStatus.sslStatus.isValid = false;
        monitoringStatus.sslStatus.lastCheck = new Date().toISOString();
        monitoringStatus.sslStatus.error = err.message;
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        log(`❌ Timeout bei SSL-Prüfung`, 'error');
        monitoringStatus.sslStatus.isValid = false;
        monitoringStatus.sslStatus.lastCheck = new Date().toISOString();
        monitoringStatus.sslStatus.error = 'Timeout';
        resolve(false);
      });

      req.end();
    } catch (err) {
      log(`❌ Unerwarteter Fehler bei SSL-Prüfung: ${err.message}`, 'error');
      monitoringStatus.sslStatus.isValid = false;
      monitoringStatus.sslStatus.lastCheck = new Date().toISOString();
      monitoringStatus.sslStatus.error = err.message;
      resolve(false);
    }
  });
}

/**
 * Führt einen vollständigen Monitoring-Check durch
 */
async function runFullMonitoringCheck() {
  try {
    log('🚀 Starte vollständigen Monitoring-Check...', 'info');

    // Setze Status
    monitoringStatus.lastCheck = new Date().toISOString();
    monitoringStatus.checksPerformed++;

    // Überprüfe Website-Verfügbarkeit
    const isAvailable = await checkWebsiteAvailability();

    // Überprüfe SSL nur wenn Website verfügbar ist
    let sslValid = false;
    if (isAvailable) {
      sslValid = await checkSSLCertificate();
    }

    // Speichere Status
    saveStatus();

    return {
      isAvailable,
      sslValid,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    log(`❌ Fehler bei Monitoring-Check: ${err.message}`, 'error');
    monitoringStatus.errors.push({
      timestamp: new Date().toISOString(),
      message: err.message,
    });
    saveStatus();
    return {
      isAvailable: false,
      sslValid: false,
      timestamp: new Date().toISOString(),
      error: err.message,
    };
  }
}

/**
 * Erkennt Probleme und löst entsprechende Aktionen aus
 */
function detectAndHandleIssues(checkResult) {
  // Wenn die Website nicht verfügbar ist, versuche einen Selbstheilungsprozess
  if (!checkResult.isAvailable) {
    log('⚠️ Website ist nicht verfügbar, aktiviere Auto-Recovery...', 'warn');

    try {
      // Statt PowerShell zu nutzen, rufen wir den Node.js-Prozess direkt auf
      execSync('node tools/powerfix-auto-recovery.js', {
        stdio: 'ignore',
      });
    } catch (err) {
      log(`❌ Fehler beim Aktivieren des Auto-Recovery: ${err.message}`, 'error');
    }
  }

  // Wenn das SSL-Zertifikat nicht gültig ist, gib eine Warnung aus
  if (!checkResult.sslValid && checkResult.isAvailable) {
    log('⚠️ SSL-Zertifikat ist nicht gültig, bitte manuell überprüfen!', 'warn');
  }
}

/**
 * Startet den kontinuierlichen Monitoring-Prozess
 */
async function startContinuousMonitoring() {
  try {
    if (monitoringStatus.monitoringActive) {
      log('Kontinuierliches Monitoring läuft bereits', 'info');
      return;
    }

    log('🚀 Starte kontinuierliches Website-Monitoring...', 'info');
    monitoringStatus.monitoringActive = true;
    saveStatus();

    // Erster Check sofort
    const initialCheck = await runFullMonitoringCheck();
    detectAndHandleIssues(initialCheck);

    // Reguläre Checks nach Zeitplänen
    const monitoringInterval = setInterval(
      async () => {
        if (!checkLock()) {
          createLock();
          const checkResult = await runFullMonitoringCheck();
          detectAndHandleIssues(checkResult);
          removeLock();
        }
      },
      CONFIG.monitoringIntervalMinutes * 60 * 1000,
    );

    // Kritische Checks häufiger
    const criticalCheckInterval = setInterval(
      async () => {
        if (!checkLock()) {
          createLock();
          const isAvailable = await checkWebsiteAvailability();
          if (!isAvailable) {
            log('⚠️ Critical Check: Website ist nicht verfügbar!', 'warn');
            detectAndHandleIssues({ isAvailable, sslValid: false });
          }
          removeLock();
        }
      },
      CONFIG.criticalCheckIntervalMinutes * 60 * 1000,
    );

    // Cleanup bei Beendigung
    process.on('SIGINT', () => {
      clearInterval(monitoringInterval);
      clearInterval(criticalCheckInterval);
      monitoringStatus.monitoringActive = false;
      saveStatus();
      log('Monitoring-Service wurde beendet', 'info');
      process.exit(0);
    });

    return { monitoringInterval, criticalCheckInterval };
  } catch (err) {
    log(`Fehler beim Starten des Monitorings: ${err.message}`, 'error');
    monitoringStatus.monitoringActive = false;
    monitoringStatus.errors.push({
      timestamp: new Date().toISOString(),
      message: err.message,
    });
    saveStatus();
  }
}

/**
 * Hauptfunktion
 */
async function main(args = []) {
  try {
    // Überprüfe Lock-Datei
    if (checkLock()) {
      log('Monitoring Service läuft bereits, Ausführung wird abgebrochen', 'warn');
      return;
    }

    // Erstelle Lock-Datei
    createLock();

    // Lade Status
    loadStatus();

    // Stelle sicher, dass der Report-Ordner existiert
    if (!fs.existsSync(CONFIG.reportPath)) {
      fs.mkdirSync(CONFIG.reportPath, { recursive: true });
    }

    // Lösche alte Log-Datei falls zu groß
    try {
      if (fs.existsSync(CONFIG.logFile)) {
        const logStat = fs.statSync(CONFIG.logFile);
        if (logStat.size > 1024 * 1024) {
          // > 1 MB
          fs.truncateSync(CONFIG.logFile, 0);
          log('Log-Datei zurückgesetzt (war > 1 MB)', 'info');
        }
      }
    } catch (err) {
      // Ignoriere Fehler beim Zurücksetzen der Log-Datei
    }

    const isSingleRun = args.includes('--single');
    const isSilent = args.includes('--silent');

    if (isSilent) {
      log = () => {};
    }

    if (isSingleRun) {
      log('🔍 Einmaliger Monitoring-Check wird ausgeführt...', 'info');
      await runFullMonitoringCheck();
      log('✅ Monitoring-Check abgeschlossen', 'success');
    } else {
      // Starte kontinuierliches Monitoring
      await startContinuousMonitoring();
    }

    // Lock entfernen nach einmaligem Check
    if (isSingleRun) {
      removeLock();
    }
  } catch (err) {
    log(`Kritischer Fehler im Monitoring-Service: ${err.message}`, 'error');
    monitoringStatus.errors.push({
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

  main(args).catch((err) => {
    fs.appendFileSync(
      CONFIG.logFile,
      `[${new Date().toISOString()}] [CRITICAL] ${err.message}\n${err.stack}\n`,
      'utf8',
    );
  });
}

module.exports = {
  runFullMonitoringCheck,
  checkWebsiteAvailability,
  checkSSLCertificate,
};
