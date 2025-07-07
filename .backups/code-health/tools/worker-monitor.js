/**
 * Worker Monitor
 * Überwacht das Master Worker System und startet es bei Bedarf neu
 */

const { exec, spawn } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');
const os = require('os');

// Konfiguration
const WORKER_DIR = path.join(__dirname, '..', '.worker-system');
const MASTER_SCRIPT = path.join(__dirname, 'master-worker-system.js');
const STATUS_FILE = path.join(WORKER_DIR, 'worker-status.json');
const MONITOR_STATUS_FILE = path.join(WORKER_DIR, 'monitor-status.json');
const HEARTBEAT_INTERVAL = 30000; // 30 Sekunden

/**
 * Logging-Funktion
 */
] ${message}`);

  try {
    const logFile = path.join(WORKER_DIR, 'monitor-log.txt');
    const fs = require('fs');
    fs.appendFileSync(logFile, `[${timestamp}] [${type}] ${message}\n`);
  } catch (error) {
    console.error('Fehler beim Schreiben ins Log:', error);
  }
}

/**
 * Prüft, ob der Master-Prozess noch läuft
 */
async function checkMasterProcess() {
  try {
    // Prüft, wann die Worker-Status-Datei zuletzt aktualisiert wurde
    if (!existsSync(STATUS_FILE)) {
      log('Status-Datei nicht gefunden, Master-Worker scheint nicht zu laufen', 'WARNING');
      return false;
    }

    const stats = require('fs').statSync(STATUS_FILE);
    const now = new Date();
    const lastModified = new Date(stats.mtime);
    const diffMinutes = (now - lastModified) / 60000;

    if (diffMinutes > 2) {
      // 2 Minuten ohne Update
      log(
        `Status-Datei ist veraltet (${diffMinutes.toFixed(1)} Minuten), Master-Worker scheint eingefroren`,
        'WARNING',
      );
      return false;
    }

    // Status aktiv und aktuell
    return true;
  } catch (error) {
    log(`Fehler bei der Master-Prozess-Prüfung: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Startet das Master Worker System
 */
function startMasterWorker() {
  try {
    log('Starte Master Worker System...', 'INFO');

    const child = spawn('node', [MASTER_SCRIPT], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (data) => {
      const text = data.toString().trim();
      if (text) log(`Master Worker: ${text}`, 'OUTPUT');
    });

    child.stderr.on('data', (data) => {
      const text = data.toString().trim();
      if (text) log(`Master Worker Fehler: ${text}`, 'ERROR');
    });

    child.on('error', (error) => {
      log(`Fehler beim Starten des Master Workers: ${error.message}`, 'ERROR');
    });

    child.on('exit', (code) => {
      log(`Master Worker beendet mit Code: ${code}`, code === 0 ? 'INFO' : 'WARNING');

      // Wenn Master unerwartet beendet wurde, nach einer Verzögerung neu starten
      if (code !== 0) {
        log('Master Worker wurde unerwartet beendet, Neustart in 5 Sekunden...', 'WARNING');
        setTimeout(() => startMasterWorker(), 5000);
      }
    });

    // Prozess unabhängig machen
    child.unref();

    // Monitor-Status speichern
    updateMonitorStatus({
      masterStarted: new Date().toISOString(),
      masterPid: child.pid,
    });

    log(`Master Worker System gestartet (PID: ${child.pid})`, 'SUCCESS');
    return true;
  } catch (error) {
    log(`Kritischer Fehler beim Starten des Master Workers: ${error.message}`, 'CRITICAL');
    return false;
  }
}

/**
 * Heartbeat und Monitor-Status aktualisieren
 */
function updateMonitorStatus(additionalData = {}) {
  try {
    let status = {
      lastHeartbeat: new Date().toISOString(),
      monitorPid: process.pid,
      hostname: os.hostname(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      ...additionalData,
    };

    if (!existsSync(WORKER_DIR)) {
      require('fs').mkdirSync(WORKER_DIR, { recursive: true });
    }

    writeFileSync(MONITOR_STATUS_FILE, JSON.stringify(status, null, 2));
  } catch (error) {
    log(`Fehler beim Aktualisieren des Monitor-Status: ${error.message}`, 'ERROR');
  }
}

/**
 * Systemlast (CPU, Speicher) checken
 */
function checkSystemLoad() {
  try {
    const cpuLoad = os.loadavg()[0] / os.cpus().length; // Normalisiert auf CPU-Kerne
    const memoryUsage = process.memoryUsage();
    const freeMemPercentage = os.freemem() / os.totalmem();

    // Status melden
    if (cpuLoad > 0.8) {
      log(`Hohe CPU-Last: ${(cpuLoad * 100).toFixed(1)}%`, 'WARNING');
    }

    if (freeMemPercentage < 0.1) {
      log(`Niedriger freier Speicher: ${(freeMemPercentage * 100).toFixed(1)}%`, 'WARNING');
    }

    // Status speichern
    updateMonitorStatus({
      systemLoad: {
        cpuLoad,
        freeMemPercentage: freeMemPercentage,
        memoryUsageMB: Math.round(memoryUsage.rss / 1024 / 1024),
      },
    });

    return {
      cpuOverloaded: cpuLoad > 0.9,
      memoryLow: freeMemPercentage < 0.05,
    };
  } catch (error) {
    log(`Fehler beim Prüfen der Systemlast: ${error.message}`, 'ERROR');
    return { cpuOverloaded: false, memoryLow: false };
  }
}

/**
 * Hauptfunktion für den Monitoring-Zyklus
 */
async function monitorCycle() {
  try {
    // Heartbeat aktualisieren
    updateMonitorStatus();

    // Systemlast prüfen
    const systemLoad = checkSystemLoad();

    // Master-Prozess prüfen
    const masterRunning = await checkMasterProcess();

    if (!masterRunning) {
      log('Master Worker System läuft nicht oder ist eingefroren, starte neu...', 'WARNING');
      startMasterWorker();
    } else if (systemLoad.cpuOverloaded || systemLoad.memoryLow) {
      log('System überlastet, Worker-Neustarts werden verzögert', 'WARNING');
      // Hier könnte man bestimmte Worker gezielt herunterfahren oder neu starten
    } else {
      log('Monitoring-Zyklus abgeschlossen, System läuft normal', 'INFO');
    }
  } catch (error) {
    log(`Fehler im Monitoring-Zyklus: ${error.message}`, 'ERROR');
  }

  // Nächster Zyklus planen
  setTimeout(monitorCycle, HEARTBEAT_INTERVAL);
}

/**
 * Hauptfunktion
 */
async function main() {
  log('🔍 Worker Monitor wird initialisiert...');

  // Verzeichnis für Monitor-Logs erstellen
  if (!existsSync(WORKER_DIR)) {
    require('fs').mkdirSync(WORKER_DIR, { recursive: true });
  }

  // Prüfen, ob Master Worker läuft
  const masterRunning = await checkMasterProcess();

  if (!masterRunning) {
    log('Master Worker System nicht gefunden oder inaktiv, starte neu...', 'INFO');
    startMasterWorker();
  } else {
    log('Master Worker System läuft bereits', 'INFO');
  }

  // Start des Monitoring-Zyklus
  monitorCycle();

  log('Worker Monitor läuft und überwacht das Master Worker System');

  // Status an Unified Status Manager senden
  try {
    exec(
      `node tools/unified-status-manager.js --update "worker-monitor" "healthy" "Worker Monitor aktiv"`,
    );
  } catch (error) {
    log(`Fehler bei Status-Update: ${error.message}`, 'ERROR');
  }
}

// Start
main().catch((error) => {
  log(`Kritischer Fehler im Worker Monitor: ${error.message}`, 'CRITICAL');
  process.exit(1);
});
