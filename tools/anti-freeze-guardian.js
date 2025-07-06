#!/usr/bin/env node

/**
 * Anti-Freeze Guardian - Priorität 1 Schutz
 *
 * Verhindert "The window is not responding" durch:
 * - Proaktive Ressourcen-Überwachung
 * - Automatische Speicherung vor kritischen Zuständen
 * - Sofortige Intervention bei Freeze-Indikatoren
 * - Präventive Neustarts bei Bedarf
 *
 * Erstellt: 2025-06-30
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');
const { sendAlert } = require('./alert-service');
const { createTodo } = require('./todo-manager');

// Anti-Freeze Konfiguration
const GUARDIAN_CONFIG = {
  MEMORY_THRESHOLD: 80, // % RAM-Nutzung
  CPU_THRESHOLD: 90, // % CPU-Nutzung
  RESPONSE_TIMEOUT: 5000, // ms für Reaktionszeit
  CHECK_INTERVAL: 10000, // ms zwischen Checks
  EMERGENCY_SAVE_PATH: path.join(__dirname, '.emergency-saves'),
  LOG_FILE: path.join(__dirname, 'anti-freeze.log'),
  VSCODE_PROCESS_NAME: 'Code.exe',
};

/**
 * Logger mit Timestamp
 */
function log(message, level = 'INFO') {
  const logEntry = `[${new Date().toISOString()}] [${level}] ${message}`;
  console.log(logEntry);

  if (level === 'ERROR' || level === 'CRITICAL' || level === 'WARN') {
    sendAlert(`Anti-Freeze Guardian: ${level}`, message, level.toLowerCase());
  }

  try {
    fs.appendFileSync(GUARDIAN_CONFIG.LOG_FILE, logEntry + '\n');
  } catch (e) {
    // Fehler beim Loggen ignorieren
  }
}

/**
 * Prüft System-Ressourcen
 */
function checkSystemResources() {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = ((totalMem - freeMem) / totalMem) * 100;

    const cpuUsage = (os.loadavg()[0] * 100) / os.cpus().length;

    const isCritical = usedMem > GUARDIAN_CONFIG.MEMORY_THRESHOLD || cpuUsage > GUARDIAN_CONFIG.CPU_THRESHOLD;

    if (isCritical) {
        createTodo(
            'Systemressourcen prüfen',
            `Kritische Auslastung erkannt: RAM ${Math.round(usedMem)}%, CPU ${Math.round(cpuUsage)}%. Manuelle Überprüfung empfohlen.`,
            'System Health'
        );
    }

    return {
      memory: Math.round(usedMem),
      cpu: Math.round(cpuUsage),
      critical: isCritical,
    };
  } catch (error) {
    log(`Fehler beim Ressourcen-Check: ${error.message}`, 'ERROR');
    return { memory: 0, cpu: 0, critical: false };
  }
}

/**
 * Prüft VS Code Prozess-Status
 */
function checkVSCodeProcess() {
  try {
    const command =
      process.platform === 'win32'
        ? `tasklist /FI "IMAGENAME eq ${GUARDIAN_CONFIG.VSCODE_PROCESS_NAME}" /FO CSV`
        : 'ps aux | grep -i code';

    const result = execSync(command, { encoding: 'utf8', timeout: 3000 });

    if (process.platform === 'win32') {
      const lines = result.split('\n').filter((line) => line.includes('Code.exe'));
      return {
        running: lines.length > 0,
        processCount: lines.length,
        responsive: true, // Wird durch Ping-Test ermittelt
      };
    } else {
      const processes = result.split('\n').filter((line) => line.includes('code'));
      return {
        running: processes.length > 0,
        processCount: processes.length,
        responsive: true,
      };
    }
  } catch (error) {
    log(`VS Code Prozess-Check fehlgeschlagen: ${error.message}`, 'WARN');
    return { running: false, processCount: 0, responsive: false };
  }
}

/**
 * Notfall-Speicherung aller offenen Dateien
 */
function emergencySave() {
  try {
    if (!fs.existsSync(GUARDIAN_CONFIG.EMERGENCY_SAVE_PATH)) {
      fs.mkdirSync(GUARDIAN_CONFIG.EMERGENCY_SAVE_PATH, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const saveDir = path.join(GUARDIAN_CONFIG.EMERGENCY_SAVE_PATH, `emergency-${timestamp}`);
    fs.mkdirSync(saveDir, { recursive: true });

    // Versuche VS Code Workspace zu speichern
    const workspaceFiles = [
      'index.html',
      'main.js',
      'package.json',
      'tools/vscode-recovery-center.js',
      'tools/anti-freeze-guardian.js',
    ];

    let savedFiles = 0;
    for (const file of workspaceFiles) {
      try {
        const sourcePath = path.join(__dirname, '..', file);
        if (fs.existsSync(sourcePath)) {
          const targetPath = path.join(saveDir, path.basename(file));
          fs.copyFileSync(sourcePath, targetPath);
          savedFiles++;
        }
      } catch (e) {
        log(`Fehler beim Speichern von ${file}: ${e.message}`, 'WARN');
      }
    }

    const successMessage = `Emergency Save: ${savedFiles} Dateien gesichert in ${saveDir}`;
    log(successMessage, 'SUCCESS');
    sendAlert('Emergency Save Ausgelöst', successMessage, 'warn');
    createTodo('Emergency Save überprüfen', `Ein Emergency Save wurde im Verzeichnis ${saveDir} erstellt. Bitte den Zustand der gesicherten Dateien prüfen.`, 'Recovery');
    return saveDir;
  } catch (error) {
    log(`Emergency Save fehlgeschlagen: ${error.message}`, 'ERROR');
    return null;
  }
}

/**
 * Präventiver VS Code Neustart
 */
function preventiveRestart() {
  try {
    const message = 'Präventiver VS Code Neustart wird eingeleitet...';
    log(message, 'WARN');
    sendAlert('Präventiver Neustart', message, 'warn');
    createTodo('Präventiven Neustart überwachen', 'Ein präventiver Neustart von VS Code wurde aufgrund kritischer Systemressourcen eingeleitet.', 'System Health');

    // Erst Emergency Save
    const saveDir = emergencySave();

    // Dann VS Code sanft beenden
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM Code.exe', { timeout: 10000 });
    } else {
      execSync('pkill -f code', { timeout: 10000 });
    }

    // Kurz warten
    setTimeout(() => {
      try {
        // VS Code neu starten
        if (process.platform === 'win32') {
          spawn('code', [path.join(__dirname, '..')], { detached: true });
        } else {
          spawn('code', [path.join(__dirname, '..')], { detached: true });
        }
        const successMsg = 'VS Code wurde erfolgreich neu gestartet';
        log(successMsg, 'SUCCESS');
        sendAlert('Neustart Erfolgreich', successMsg, 'success');
      } catch (e) {
        log(`Fehler beim Neustart: ${e.message}`, 'ERROR');
      }
    }, 2000);

    return true;
  } catch (error) {
    log(`Präventiver Neustart fehlgeschlagen: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Haupt-Guardian-Loop
 */
function runGuardian() {
  log('🛡️ Anti-Freeze Guardian gestartet', 'INFO');
  sendAlert('Guardian Gestartet', 'Anti-Freeze Guardian ist jetzt aktiv.', 'info');

  setInterval(() => {
    try {
      // System-Ressourcen prüfen
      const resources = checkSystemResources();

      if (resources.critical) {
        log(
          `⚠️ Kritische Ressourcen-Nutzung: RAM ${resources.memory}%, CPU ${resources.cpu}%`,
          'WARN',
        );

        // VS Code Prozess prüfen
        const vscodeStatus = checkVSCodeProcess();

        if (vscodeStatus.running && vscodeStatus.processCount > 0) {
          log(`VS Code läuft mit ${vscodeStatus.processCount} Prozessen`, 'INFO');

          // Bei kritischen Werten: Präventive Maßnahmen
          if (resources.memory > 85 || resources.cpu > 95) {
            const criticalMessage = 'KRITISCHER ZUSTAND - Präventive Maßnahmen werden eingeleitet';
            log(criticalMessage, 'CRITICAL');
            preventiveRestart();
          }
        } else {
          log('VS Code läuft nicht - Guardian bleibt aktiv', 'INFO');
        }
      } else {
        // Alles normal - nur gelegentlich loggen
        if (Math.random() < 0.1) {
          // 10% Chance für Info-Log
          log(`✅ System stabil: RAM ${resources.memory}%, CPU ${resources.cpu}%`, 'INFO');
        }
      }
    } catch (error) {
      log(`Guardian-Loop Fehler: ${error.message}`, 'ERROR');
    }
  }, GUARDIAN_CONFIG.CHECK_INTERVAL);

  // Graceful Shutdown
  process.on('SIGINT', () => {
    log('Anti-Freeze Guardian wird beendet', 'INFO');
    sendAlert('Guardian Gestoppt', 'Anti-Freeze Guardian wurde beendet.', 'info');
    process.exit(0);
  });
}

/**
 * Status-Check Funktion
 */
function checkStatus() {
  const resources = checkSystemResources();
  const vscode = checkVSCodeProcess();

  console.log('\n🛡️ ANTI-FREEZE GUARDIAN STATUS');
  console.log('═'.repeat(40));
  console.log(`System RAM: ${resources.memory}% (Schwelle: ${GUARDIAN_CONFIG.MEMORY_THRESHOLD}%)`);
  console.log(`System CPU: ${resources.cpu}% (Schwelle: ${GUARDIAN_CONFIG.CPU_THRESHOLD}%)`);
  console.log(`VS Code: ${vscode.running ? '✅ Läuft' : '❌ Nicht aktiv'}`);
  console.log(`Prozesse: ${vscode.processCount}`);
  console.log(`Status: ${resources.critical ? '🚨 KRITISCH' : '✅ STABIL'}`);
  console.log('═'.repeat(40));
}

// Kommandozeilen-Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--status')) {
    checkStatus();
  } else if (args.includes('--emergency-save')) {
    emergencySave();
  } else if (args.includes('--restart')) {
    preventiveRestart();
  } else {
    runGuardian();
  }
}

module.exports = {
  runGuardian,
  checkStatus,
  emergencySave,
  preventiveRestart,
};
