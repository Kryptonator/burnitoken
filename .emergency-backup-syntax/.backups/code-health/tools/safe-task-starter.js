/**
 * PowerShell-Safe Task Starter
 *
 * Verhindert PowerShell-Fenster, die sich im Sekundentakt öffnen/schließen
 * Zentrale Steuerung für alle Tasks mit PowerShell-Safe-Mode
 *
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Konfiguration
const CONFIG = {
  logFile: path.join(__dirname, 'safe-task-starter.log'),
  statusFile: path.join(__dirname, 'safe-task-status.json'),
  lockFile: path.join(__dirname, '.safe-task.lock'),
  maxLockAge: 30 * 1000, // 30 Sekunden
};

// Status-Objekt
const taskStatus = {
  timestamp: new Date().toISOString(),
  lastRun: null,
  runningTasks: [],
  completedTasks: [],
  errors: [],
};

/**
 * Log-Funktion für Konsole und Datei
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

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

    // Wenn der Lock zu alt ist, entfernen wir ihn
    if (lockAge > CONFIG.maxLockAge) {
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
 * Führt einen Task direkt mit Node.js aus (kein PowerShell)
 */
function runNodeTask(taskScript, args = [], isBackground = false) {
  return new Promise((resolve) => {
    try {
      log(`Führe Task aus: ${taskScript} ${args.join(' ')}`, 'info');

      const scriptPath = path.join(__dirname, taskScript);

      if (!fs.existsSync(scriptPath)) {
        log(`Task-Skript nicht gefunden: ${scriptPath}`, 'error');
        resolve({
          success: false,
          error: 'Script not found',
        });
        return;
      }

      const taskId = `${Date.now()}_${path.basename(taskScript)}`;

      taskStatus.runningTasks.push({
        id: taskId,
        script: taskScript,
        args,
        startTime: new Date().toISOString(),
        isBackground,
      });

      // Führe den Prozess direkt aus, ohne PowerShell zu nutzen
      const nodeProcess = spawn(process.execPath, [scriptPath, ...args], {
        detached: isBackground,
        stdio: isBackground ? 'ignore' : 'pipe',
      });

      if (isBackground) {
        nodeProcess.unref();
        log(`Task im Hintergrund gestartet: ${taskScript}`, 'success');

        taskStatus.completedTasks.push({
          id: taskId,
          script: taskScript,
          args,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          background: true,
          success: true,
        });

        taskStatus.runningTasks = taskStatus.runningTasks.filter((t) => t.id !== taskId);

        resolve({
          success: true,
          background: true,
          taskId,
        });
      } else {
        let stdout = '';
        let stderr = '';

        nodeProcess.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        nodeProcess.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        nodeProcess.on('close', (code) => {
          const success = code === 0;
          log(`Task ${taskScript} beendet mit Code: ${code}`, success ? 'success' : 'error');

          taskStatus.completedTasks.push({
            id: taskId,
            script: taskScript,
            args,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            success,
            exitCode: code,
          });

          taskStatus.runningTasks = taskStatus.runningTasks.filter((t) => t.id !== taskId);

          resolve({
            success,
            exitCode: code,
            stdout,
            stderr,
            taskId,
          });
        });

        nodeProcess.on('error', (err) => {
          log(`Fehler beim Ausführen von ${taskScript}: ${err.message}`, 'error');

          taskStatus.completedTasks.push({
            id: taskId,
            script: taskScript,
            args,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            success: false,
            error: err.message,
          });

          taskStatus.runningTasks = taskStatus.runningTasks.filter((t) => t.id !== taskId);

          resolve({
            success: false,
            error: err.message,
            taskId,
          });
        });
      }
    } catch (err) {
      log(`Unerwarteter Fehler beim Ausführen des Tasks ${taskScript}: ${err.message}`, 'error');
      resolve({
        success: false,
        error: err.message,
      });
    }
  });
}

/**
 * Startet die Master Task Manager mit sicherer Ausführung
 */
async function startMasterTaskManager() {
  try {
    log('🚀 Starte Master Task Manager...', 'info');

    // Führe Master Task Manager aus ohne PowerShell zu nutzen
    const result = await runNodeTask('master-task-manager.js', ['--silent'], false);

    if (result.success) {
      log('✅ Master Task Manager erfolgreich ausgeführt', 'success');
    } else {
      log(
        `❌ Fehler beim Ausführen des Master Task Manager: ${result.error || result.stderr || 'Unknown error'}`,
        'error',
      );
    }

    return result;
  } catch (err) {
    log(`Kritischer Fehler beim Starten des Master Task Manager: ${err.message}`, 'error');
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Starte Website Health Check
 */
async function startWebsiteHealthCheck() {
  try {
    log('🚀 Starte Website Health Check...', 'info');
    return await runNodeTask('powerfix-monitoring.js', ['--single'], false);
  } catch (err) {
    log(`Kritischer Fehler beim Starten des Website Health Checks: ${err.message}`, 'error');
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Starte Deployment Status Check
 */
async function startDeploymentCheck() {
  try {
    log('🚀 Starte Deployment Status Check...', 'info');
    return await runNodeTask('deployment-checker.js', [], false);
  } catch (err) {
    log(`Kritischer Fehler beim Starten des Deployment Checks: ${err.message}`, 'error');
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Starte kontinuierliches Monitoring im Hintergrund
 */
async function startContinuousMonitoring() {
  try {
    log('🚀 Starte kontinuierliches Monitoring im Hintergrund...', 'info');
    return await runNodeTask('powerfix-monitoring.js', [], true);
  } catch (err) {
    log(`Kritischer Fehler beim Starten des kontinuierlichen Monitorings: ${err.message}`, 'error');
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Zeigt den Status aller Tasks
 */
function displayStatus() {
  console.log('\n==== TASK STATUS ====');
  console.log(`Laufende Tasks: ${taskStatus.runningTasks.length}`);
  console.log(`Abgeschlossene Tasks: ${taskStatus.completedTasks.length}`);
  console.log(`Letzte Ausführung: ${taskStatus.lastRun || 'Keine'}`);

  if (taskStatus.runningTasks.length > 0) {
    console.log('\nLAUFENDE TASKS:');
    taskStatus.runningTasks.forEach((task) => {
      console.log(
        `- ${task.script} ${task.args.join(' ')} (gestartet: ${new Date(task.startTime).toLocaleTimeString()})`,
      );
    });
  }

  if (taskStatus.completedTasks.length > 0) {
    console.log('\nABGESCHLOSSENE TASKS:');
    taskStatus.completedTasks.slice(-5).forEach((task) => {
      console.log(
        `- ${task.script}: ${task.success ? '✅' : '❌'} ${task.exitCode !== undefined ? `(Code: ${task.exitCode})` : ''}`,
      );
    });
  }

  console.log('\n====================\n');
}

/**
 * Speichert den aktuellen Status
 */
function saveStatus() {
  try {
    taskStatus.timestamp = new Date().toISOString();
    fs.writeFileSync(CONFIG.statusFile, JSON.stringify(taskStatus, null, 2), 'utf8');
  } catch (err) {
    log(`Fehler beim Speichern des Status: ${err.message}`, 'error');
  }
}

/**
 * Hauptfunktion
 */
async function main(args = []) {
  try {
    // Überprüfe Lock-Datei
    if (checkLock()) {
      log('Safe Task Starter läuft bereits, Ausführung wird abgebrochen', 'warn');
      return;
    }

    // Erstelle Lock-Datei
    createLock();

    // Lösche alte Log-Datei wenn sie zu groß ist
    try {
      if (fs.existsSync(CONFIG.logFile)) {
        const logStat = fs.statSync(CONFIG.logFile);
        if (logStat.size > 512 * 1024) {
          // > 512 KB
          fs.truncateSync(CONFIG.logFile, 0);
          log('Log-Datei zurückgesetzt (war > 512 KB)', 'info');
        }
      }
    } catch (err) {
      // Ignoriere Fehler beim Zurücksetzen der Log-Datei
    }

    log('🚀 Safe Task Starter wird gestartet...', 'info');
    taskStatus.lastRun = new Date().toISOString();

    // Starte den Master Task Manager
    await startMasterTaskManager();

    // Starte Website Health Check
    await startWebsiteHealthCheck();

    // Speichere Status
    saveStatus();

    // Zeige Abschlussmeldung
    displayStatus();
    log('✅ Safe Task Starter erfolgreich abgeschlossen', 'success');

    // Lock entfernen
    removeLock();
  } catch (err) {
    log(`Kritischer Fehler im Safe Task Starter: ${err.message}`, 'error');
    taskStatus.errors.push({
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
  startMasterTaskManager,
  startWebsiteHealthCheck,
  startDeploymentCheck,
  startContinuousMonitoring,
};
