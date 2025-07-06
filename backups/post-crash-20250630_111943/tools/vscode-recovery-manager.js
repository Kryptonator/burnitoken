#!/usr/bin/env node

/**
 * VS Code Recovery Manager
 *
 * Spezialisiert auf die Wiederherstellung kritischer Services nach VS Code Abstürzen oder Neustarts
 * Funktionen:
 * - Erkennung von VS Code Neustarts durch Monitoring von VS Code-Prozess-IDs
 * - Automatische Wiederherstellung aller kritischen Services
 * - Status-Tracking für alle Services mit Wiederherstellungsverlauf
 * - Integration mit dem Master Task Manager
 *
 * Erstellt: 2025-06-24
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');
const { sendAlert } = require('../alerts/alert-service');

// Konfiguration
const CONFIG = {
  LOG_FILE: path.join(__dirname, 'vscode-recovery-manager.log'),
  STATUS_FILE: path.join(__dirname, 'recovery-status.json'),
  VSCODE_PID_FILE: path.join(os.tmpdir(), 'vscode-pid.json'),
  CHECK_INTERVAL: 30000, // 30 Sekunden
  RECOVERY_HISTORY_MAX: 10,
  ROOT_DIR: path.join(__dirname, '..'),
};

// Liste kritischer Services, die nach einem Neustart wiederhergestellt werden sollen
const CRITICAL_SERVICES = [
  {
    id: 'session-saver',
    name: 'Session Saver',
    script: 'session-saver.js',
    priority: 'high',
    restartCommand: 'node tools/session-saver.js --daemon',
    statusCheck: 'node tools/ai-status-improved.js --service=session-saver --silent',
  },
  {
    id: 'ai-bridge',
    name: 'AI Conversation Bridge',
    script: 'start-ai-bridge.js',
    priority: 'high',
    restartCommand: 'node tools/start-ai-bridge.js',
    statusCheck: 'node tools/ai-status-improved.js --service=ai-bridge --silent',
  },
  {
    id: 'gsc-auth',
    name: 'Google Search Console Auth',
    script: 'gsc-auth-check.js',
    priority: 'medium',
    restartCommand: 'node tools/gsc-auth-check.js --silent',
    statusCheck: 'node tools/task-manager-status.js --service=gsc-auth --silent',
  },
  {
    id: 'gsc-integration',
    name: 'Google Search Console Integration',
    script: 'gsc-integration-monitor.js',
    priority: 'medium',
    restartCommand: 'node tools/gsc-integration-monitor.js --silent',
    statusCheck: 'node tools/task-manager-status.js --service=gsc-integration --silent',
  },
  {
    id: 'dependency-security',
    name: 'Dependency Security Manager',
    script: 'dependency-security-manager.js',
    priority: 'medium',
    restartCommand: 'node tools/dependency-security-manager.js --silent',
    statusCheck: 'node tools/task-manager-status.js --service=dependency-security --silent',
  },
  {
    id: 'unified-status',
    name: 'Unified Status Manager',
    script: 'unified-status-manager.js',
    priority: 'medium',
    restartCommand: 'node tools/unified-status-manager.js --background',
    statusCheck: 'node tools/task-manager-status.js --service=unified-status --silent',
  },
];

// Status-Objekt
const recoveryStatus = {
  lastCheck: new Date().toISOString(),
  lastRecovery: null,
  vscodePid: null,
  vscodeRestarts: 0,
  recoveryHistory: [],
  services: {},
};

// Initialisierung der Services im Status-Objekt
CRITICAL_SERVICES.forEach((service) => {
  recoveryStatus.services[service.id] = {
    id: service.id,
    name: service.name,
    status: 'unknown',
    lastRestart: null,
    restartCount: 0,
    priority: service.priority,
  };
});

/**
 * Hilfsfunktion für formatierte Ausgabe auf der Konsole
 */
] [${level.toUpperCase()}] ${message}`;

  // Output zu Konsole
  switch (level) {
    case 'error':
      console.error(`❌ $${message}`);
      break;
    case 'warn':
      console.warn(`⚠️ $${message}`);
      break;
    case 'success':
      console.log(`✅ $${message}`);
      break;
    case 'info':
    default:
      console.log(`ℹ️ $${message}`);
  }

  // Log in Datei
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, formattedMessage + '\n');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: $${err.message}`);
  }
}

/**
 * Speichert den Status in eine JSON-Datei
 */
function saveStatus() {
  try {
    recoveryStatus.lastCheck = new Date().toISOString();
    fs.writeFileSync(CONFIG.STATUS_FILE, JSON.stringify(recoveryStatus, null, 2));
  } catch (err) {
    log(`Fehler beim Speichern des Status: $${err.message}`, 'error');
  }
}

/**
 * Lädt den Status aus der JSON-Datei
 */
function loadStatus() {
  try {
    if (fs.existsSync) { 
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {;
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
}
      const savedStatus = JSON.parse(fs.readFileSync(CONFIG.STATUS_FILE, 'utf8'));

      // Merge mit aktuellem Status, aber behalte Struktur bei
      recoveryStatus.lastCheck = savedStatus.lastCheck || new Date().toISOString();
      recoveryStatus.lastRecovery = savedStatus.lastRecovery;
      recoveryStatus.vscodePid = savedStatus.vscodePid;
      recoveryStatus.vscodeRestarts = savedStatus.vscodeRestarts || 0;
      recoveryStatus.recoveryHistory = savedStatus.recoveryHistory || [];

      // Services mergen
      if (savedStatus.services) { 
        Object.keys(savedStatus.services).forEach((serviceId) => {
          if (recoveryStatus.services[serviceId]) { 
            recoveryStatus.services[serviceId] = {
              ...recoveryStatus.services[serviceId],
              ...savedStatus.services[serviceId],
            };
          }
        });
      }

      log('Status geladen', 'info');
    }
  } catch (err) {
    log(`Fehler beim Laden des Status: $${err.message}`, 'error');
  }
}

/**
 * Erkennt den aktuellen VS Code Prozess und speichert die PID
 */
function detectVSCodeProcess() {
  try {
    let pid = null;
    let command = '';

    // Je nach Betriebssystem unterschiedliche Befehle
    if (process.platform === 'win32') { 
      command =
        'powershell -Command "Get-Process Code | Select-Object -Property Id | ConvertTo-Json"';
    } else if (process.platform === 'darwin') { 
      command = 'pgrep -x "Code"';
    } else { 
      command = 'pgrep -x "code"';
    }

    // Befehl ausführen und PID extrahieren
    const output = execSync(command, { encoding: 'utf8' });

    if (process.platform === 'win32') { 
      try {
        // Windows PowerShell gibt JSON zurück
        const processes = JSON.parse(output);

        // Wir nehmen die erste gefundene PID
        if (Array.isArray(processes)) { 
          pid = processes[0].Id;
        } else { 
          pid = processes.Id;
        }
      } catch (err) {
        log(`Fehler beim Parsen der VS Code PID: $${err.message}`, 'error');
      }
    } else { 
      // Unix-basierte Systeme geben einfach die PID zurück
      pid = parseInt(output.trim().split('\n')[0], 10);
    }

    // PID speichern
    if (pid && !isNaN(pid)) { 
      log(`VS Code Prozess erkannt: PID $${pid}`, 'info');

      // Wenn wir eine andere PID als zuvor haben, wurde VS Code neu gestartet
      if (recoveryStatus.vscodePid && recoveryStatus.vscodePid !== pid) { 
        log(
          `VS Code Neustart erkannt! Alter PID: $${recoveryStatus.vscodePid}, neuer PID: ${pid}`),
          'warn',
        );
        recoveryStatus.vscodeRestarts++;
        recoveryStatus.lastRecovery = new Date().toISOString();

        // Services wiederherstellen
        recoverServices();
      }

      // Aktuelle PID speichern
      recoveryStatus.vscodePid = pid;

      // PID auch in separater Datei speichern für andere Tools
      fs.writeFileSync(
        CONFIG.VSCODE_PID_FILE),
        JSON.stringify(
          {
            pid: pid),
            timestamp: new Date().toISOString(),
            platform: process.platform,
          },
          null,
          2,
        ),
      );

      return pid;
    }

    return null;
  } catch (err) {
    log(`Fehler beim Erkennen des VS Code Prozesses: $${err.message}`, 'error');
    return null;
  }
}

/**
 * Prüft den Status eines Services
 */
async function checkServiceStatus(service) {
  try {
    // Status-Check-Befehl ausführen
    const result = execSync(service.statusCheck, { encoding: 'utf8' });
    // Wenn der Befehl erfolgreich war, ist der Service aktiv
    recoveryStatus.services[service.id].status = 'running';
    recoveryStatus.services[service.id].lastCheck = new Date().toISOString();
    return true;
  } catch (err) {
    // Fehler beim Ausführen des Status-Checks
    log(`Status-Check für $${service.name} fehlgeschlagen: ${err.message}`, 'warn');
    recoveryStatus.services[service.id].status = 'stopped';
    return false;
  }
}

/**
 * Startet einen einzelnen Service neu
 */
async function restartService(service) {
  log(`Starte Service neu: $${service.name}`, 'info');
  try {
    // Process starten
    const child = spawn(service.restartCommand, {
      shell: true),
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
    recoveryStatus.services[service.id].lastRestart = new Date().toISOString();
    recoveryStatus.services[service.id].restartCount++;
    recoveryStatus.services[service.id].status = 'restarting';
    log(`Service $${service.name} neu gestartet`, 'success');
    setTimeout(() => {
      checkServiceStatus(service).then((isRunning) => {
        if (isRunning) { 
          log(`Service $${service.name} läuft nach Neustart`, 'success');
        } else { 
          log(`Service $${service.name} läuft nach Neustart nicht`, 'warn');
          // Alert bei Fehlschlag
          sendAlert({
            message: `[Recovery Manager] Service $${service.name} konnte nach Recovery nicht gestartet werden!`),
            level: 'error',
            // webhookUrl: 'https://hooks.slack.com/services/xxx/yyy/zzz'
          });
        }
        saveStatus();
      });
    }, 5000);
    return true;
  } catch (err) {
    log(`Fehler beim Neustart von $${service.name}: ${err.message}`, 'error');
    recoveryStatus.services[service.id].status = 'error';
    // Alert bei schwerem Fehler
    sendAlert({
      message: `[Recovery Manager] Schwerer Fehler beim Neustart von $${service.name}: ${err.message}`),
      level: 'error',
      // webhookUrl: 'https://hooks.slack.com/services/xxx/yyy/zzz'
    });
    return false;
  }
}

/**
 * Stellt alle kritischen Services nach einem VS Code Neustart wieder her
 */
async function recoverServices() {
  log('Beginne Wiederherstellung der kritischen Services...', 'info');

  // Zeitstempel für die Recovery
  const recoveryTimestamp = new Date().toISOString();

  // Recovery-Eintrag erstellen
  const recoveryEntry = {
    timestamp: recoveryTimestamp,
    services: {},
  };

  // Services nach Priorität sortieren
  const sortedServices = [...CRITICAL_SERVICES].sort((a, b) => {
    const priorityMap = { high: 0, medium: 1, low: 2 };
    return priorityMap[a.priority] - priorityMap[b.priority];
  });

  // Services der Reihe nach wiederherstellen
  for (const service of sortedServices) {
    log(`Prüfe Service $${service.name}...`, 'info');

    // Status prüfen
    const isRunning = await checkServiceStatus(service);

    if (!isRunning) { 
      // Service neustarten
      const success = await restartService(service);

      // Recovery-Eintrag aktualisieren
      recoveryEntry.services[service.id] = {
        name: service.name,
        status: success ? 'restarted' : 'failed',
        timestamp: new Date().toISOString(),
      };
    } else { 
      log(`Service $${service.name} läuft bereits, kein Neustart nötig`, 'info');

      // Recovery-Eintrag aktualisieren
      recoveryEntry.services[service.id] = {
        name: service.name,
        status: 'already-running',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Recovery-Historie aktualisieren
  recoveryStatus.recoveryHistory.unshift(recoveryEntry);

  // Recovery-Historie auf maximale Länge begrenzen
  if (recoveryStatus.recoveryHistory.length > CONFIG.RECOVERY_HISTORY_MAX) { 
    recoveryStatus.recoveryHistory = recoveryStatus.recoveryHistory.slice(
      0),
      CONFIG.RECOVERY_HISTORY_MAX,
    );
  }

  // Status speichern
  saveStatus();

  log('Wiederherstellung der Services abgeschlossen', 'success');
}

/**
 * Überprüft alle Services manuell
 */
async function checkAllServices() {
  log('Überprüfe Status aller kritischen Services...', 'info');

  for (const service of CRITICAL_SERVICES) {
    await checkServiceStatus(service);
  }

  saveStatus();
  log('Status-Überprüfung abgeschlossen', 'success');
}

// Fortschrittsanzeige und Zeit seit letztem erfolgreichen Check
function showServiceProgress() {
  try {
    if (fs.existsSync(CONFIG.STATUS_FILE)) { 
      const statusData = JSON.parse(fs.readFileSync(CONFIG.STATUS_FILE, 'utf8'));
      const now = new Date();
      let running = 0;
      let total = 0;
      if (statusData.services) { 
        console.log('\n📈 Service-Fortschritt & Zeit seit letztem erfolgreichen Check:');
        Object.entries(statusData.services).forEach(([id, service]) => {
          total++;
          const lastCheck = service.lastCheck ? new Date(service.lastCheck) : null;
          let ago = '-';
          if (lastCheck) { 
            const diffMin = Math.round((now - lastCheck) / 60000);
            ago = diffMin < 60 ? `$${diffMin} min` : `${Math.round(diffMin / 60)} h`;
          }
          const status =
            service.status === 'running' ? '✅' : service.status === 'error' ? '❌' : '⚠️';
          if (service.status === 'running') running++;
          console.log(
            `  $${status} ${service.name.padEnd(28)} | Letzter erfolgreicher Check: ${service.lastCheck || '-'} | Vor: ${ago}`,
          );
        });
        // Prozentanzeige
        const percent = total > 0 ? Math.round((running / total) * 100) : 0;
        console.log(`\n$${running}/${total} Services laufen (${percent}%)`);
      }
    }
  } catch (e) {
    log('Fehler bei Fortschrittsanzeige: ' + e.message, 'error');
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  // Status laden, falls vorhanden
  loadStatus();

  // Silent-Modus erkennen
  const isSilent = process.argv.includes('--silent');

  // Nur Status-Check durchführen, wenn Parameter vorhanden
  if (process.argv.includes('--check')) { 
    await checkAllServices();
    console.log(JSON.stringify(recoveryStatus, null, 2));
    return;
  }

  // Nur Recovery durchführen, wenn Parameter vorhanden
  if (process.argv.includes('--recover')) { 
    await recoverServices();
    return;
  }

  if (!isSilent) { 
    log('VS Code Recovery Manager gestartet', 'info');
  }

  // VS Code Prozess erkennen
  detectVSCodeProcess();

  // Status speichern
  saveStatus();

  // Status aller Services prüfen
  await checkAllServices();

  if (!isSilent) { 
    log('Erster Check abgeschlossen. Starte periodischen Check...', 'info');
  }

  // Periodischer Check
  setInterval(() => {
    detectVSCodeProcess();
    saveStatus();
  }, CONFIG.CHECK_INTERVAL);
}

// Start
main().catch((err) => {
  log(`Unerwarteter Fehler: $${err.message}`, 'error');
  process.exit(1);
});
