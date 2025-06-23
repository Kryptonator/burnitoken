/**
 * Master Task Manager
 * 
 * Zentrale Steuerung für alle automatisch startenden Tasks
 * Verhindert mehrfache PowerShell-Prozesse und Endlosschleifen
 * 
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// Konfiguration
const LOG_FILE = path.join(__dirname, 'master-task-manager.log');
const STATUS_FILE = path.join(__dirname, 'master-task-status.json');
const LOCK_FILE = path.join(__dirname, '.master-task.lock');
const MAX_LOCK_AGE = 10 * 60 * 1000; // 10 Minuten

// Wichtigste Services in Reihenfolge der Initialisierung
const CRITICAL_SERVICES = [
  {
    name: 'extension-validator',
    script: '../extension-function-validator.js',
    priority: 'high',
    args: ['--silent'],
    background: false
  },
  {
    name: 'powerfix-recovery',
    script: 'powerfix-auto-recovery.js',
    priority: 'high',
    args: [],
    background: false
  },
  {
    name: 'powerfix-monitoring',
    script: 'powerfix-monitoring.js', 
    priority: 'high',
    args: ['--single'],
    background: false
  },
  {
    name: 'website-health-check',
    script: 'website-health-check.js', 
    priority: 'medium',
    args: [],
    background: false
  },
  {
    name: 'deployment-checker',
    script: 'deployment-checker.js', 
    priority: 'medium',
    args: [],
    background: false
  },
  {
    name: 'unified-status-manager',
    script: 'unified-status-manager.js', 
    priority: 'medium',
    args: ['--silent'],
    background: true
  }
];

// Status-Objekt
const managerStatus = {
  timestamp: new Date().toISOString(),
  startTime: new Date().toISOString(),
  services: {},
  activeProcesses: 0,
  errors: []
};

/**
 * Log-Funktion für Konsole und Datei
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Log in Konsole
  switch(level) {
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
    fs.appendFileSync(LOG_FILE, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: ${err.message}`);
  }
}

/**
 * Prüft ob eine Lock-Datei existiert und ob sie gültig ist
 */
function checkLock() {
  if (fs.existsSync(LOCK_FILE)) {
    const lockData = fs.statSync(LOCK_FILE);
    const lockAge = Date.now() - lockData.mtimeMs;
    
    // Wenn der Lock zu alt ist, entfernen wir ihn
    if (lockAge > MAX_LOCK_AGE) {
      log(`Lock-Datei ist zu alt (${Math.round(lockAge/1000)}s), wird entfernt`, 'warn');
      fs.unlinkSync(LOCK_FILE);
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
    fs.writeFileSync(LOCK_FILE, new Date().toISOString(), 'utf8');
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
  if (fs.existsSync(LOCK_FILE)) {
    try {
      fs.unlinkSync(LOCK_FILE);
      return true;
    } catch (err) {
      log(`Fehler beim Entfernen der Lock-Datei: ${err.message}`, 'error');
      return false;
    }
  }
  return true;
}

/**
 * Speichert den Status in eine JSON-Datei
 */
function saveStatus() {
  try {
    managerStatus.timestamp = new Date().toISOString();
    fs.writeFileSync(STATUS_FILE, JSON.stringify(managerStatus, null, 2), 'utf8');
    return true;
  } catch (err) {
    log(`Fehler beim Speichern des Status: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Führt ein Skript aus
 */
async function runScript(service) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, service.script);
    
    if (!fs.existsSync(scriptPath)) {
      log(`Skript nicht gefunden: ${scriptPath}`, 'error');
      managerStatus.services[service.name] = {
        status: 'error',
        error: 'Script not found',
        lastRun: new Date().toISOString()
      };
      resolve(false);
      return;
    }

    log(`Starte Service: ${service.name}`, 'info');
    
    const args = service.args || [];
    const node = process.execPath;
    const child = spawn(node, [scriptPath, ...args], {
      detached: service.background,
      stdio: service.background ? 'ignore' : 'pipe'
    });

    managerStatus.activeProcesses++;
    
    if (service.background) {
      child.unref();
      managerStatus.services[service.name] = {
        status: 'running',
        pid: child.pid,
        background: true,
        lastRun: new Date().toISOString()
      };
      resolve(true);
    } else {
      let output = '';
      let errorOutput = '';
      
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        managerStatus.activeProcesses--;
        
        if (code === 0) {
          log(`Service erfolgreich beendet: ${service.name}`, 'success');
          managerStatus.services[service.name] = {
            status: 'completed',
            exitCode: code,
            lastRun: new Date().toISOString()
          };
          resolve(true);
        } else {
          log(`Service mit Fehler beendet: ${service.name} (Code: ${code})`, 'error');
          managerStatus.services[service.name] = {
            status: 'error',
            exitCode: code,
            error: errorOutput || 'Unknown error',
            lastRun: new Date().toISOString()
          };
          resolve(false);
        }
      });
      
      child.on('error', (err) => {
        managerStatus.activeProcesses--;
        log(`Fehler beim Ausführen von ${service.name}: ${err.message}`, 'error');
        managerStatus.services[service.name] = {
          status: 'error',
          error: err.message,
          lastRun: new Date().toISOString()
        };
        resolve(false);
      });
    }
  });
}

/**
 * Hauptfunktion
 */
async function main() {
  try {
    // Überprüfe Lock-Datei, um Mehrfachausführungen zu vermeiden
    if (checkLock()) {
      log('⚠️ Master Task Manager läuft bereits, Ausführung wird abgebrochen', 'warn');
      return;
    }
    
    // Erstelle Lock-Datei
    createLock();
    
    // Lösche alte Log-Datei
    if (fs.existsSync(LOG_FILE)) {
      fs.truncateSync(LOG_FILE, 0);
    }
    
    log('🚀 Master Task Manager wird gestartet...', 'info');
    log('📅 Startzeit: ' + new Date().toLocaleString('de-DE'), 'info');
    
    // Starte kritische Services mit Prioritäten
    const highPriorityServices = CRITICAL_SERVICES.filter(s => s.priority === 'high');
    const mediumPriorityServices = CRITICAL_SERVICES.filter(s => s.priority === 'medium');
    
    // Starte Services entsprechend der Priorität
    log(`🔴 Starte ${highPriorityServices.length} Services mit hoher Priorität...`, 'info');
    for (const service of highPriorityServices) {
      await runScript(service);
      // Kleine Pause zwischen den Starts
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    log(`🟠 Starte ${mediumPriorityServices.length} Services mit mittlerer Priorität...`, 'info');
    for (const service of mediumPriorityServices) {
      await runScript(service);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Status speichern
    saveStatus();
    
    // Lock entfernen nach erfolgreichem Abschluss
    setTimeout(() => {
      if (fs.existsSync(LOCK_FILE)) {
        log('🔓 Master Task Manager abgeschlossen, Lock wird entfernt', 'info');
        removeLock();
      }
    }, 5000); // 5 Sekunden warten
    
    log('✅ Master Task Manager hat alle Services gestartet', 'success');
    
    // Status-Zusammenfassung ausgeben
    const servicesStarted = Object.keys(managerStatus.services).length;
    const servicesRunning = Object.values(managerStatus.services).filter(s => s.status === 'running' || s.status === 'completed').length;
    const servicesError = Object.values(managerStatus.services).filter(s => s.status === 'error').length;
    
    log(`📊 Status-Übersicht: ${servicesStarted} Services gestartet, ${servicesRunning} laufen, ${servicesError} Fehler`, servicesError > 0 ? 'warn' : 'success');
    
    if (servicesError > 0) {
      log(`⚠️ Die folgenden Services haben Fehler:`, 'warn');
      Object.entries(managerStatus.services)
        .filter(([_, s]) => s.status === 'error')
        .forEach(([name, service]) => {
          log(`  - ${name}: ${service.error || 'Unbekannter Fehler'}`, 'warn');
        });
    }
    
    log(`⏱️ Gesamtlaufzeit: ${((new Date() - new Date(managerStatus.startTime)) / 1000).toFixed(2)} Sekunden`, 'info');
  } catch (err) {
    log(`❌ Unerwarteter Fehler im Master Task Manager: ${err.message}`, 'error');
    managerStatus.errors.push({
      timestamp: new Date().toISOString(),
      message: err.message,
      stack: err.stack
    });
    saveStatus();
    removeLock();
  }
}

/**
 * Zeigt eine deutsche Benachrichtigung an
 */
function showNotification(message, type = 'info') {
  try {
    // Verwende die VS Code Notification API über einen temporären Node-Prozess
    const notificationScript = `
      const vscode = require('vscode');
      vscode.window.showInformationMessage("${message.replace(/"/g, '\\"')}");
    `;
    
    const notificationType = type === 'error' ? 'showErrorMessage' : 
                             type === 'warn' ? 'showWarningMessage' : 
                             'showInformationMessage';
    
    const tempScriptPath = path.join(__dirname, '.temp-notification.js');
    fs.writeFileSync(tempScriptPath, `
      const vscode = require('vscode');
      vscode.window.${notificationType}("${message.replace(/"/g, '\\"')}");
    `);
    
    try {
      execSync(`code --execute "require('${tempScriptPath.replace(/\\/g, '\\\\')}')"`, { stdio: 'ignore' });
    } catch (e) {
      // Fehler ignorieren - VS Code notification API könnte fehlschlagen
    }
    
    // Lösche temporäre Datei nach kurzer Verzögerung
    setTimeout(() => {
      try { fs.unlinkSync(tempScriptPath); } catch (e) {}
    }, 5000);
  } catch (err) {
    // Fallback zu Desktop-Benachrichtigung, wenn VS Code API nicht verfügbar ist
    try {
      const { execSync } = require('child_process');
      execSync(`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${message.replace(/'/g, "''")}', 'Master Task Manager', 'OK', '${
        type === 'error' ? 'Error' : type === 'warn' ? 'Warning' : 'Information'
      }')"`, { stdio: 'ignore' });
    } catch (notificationErr) {
      // Keine Desktop-Benachrichtigung möglich
      console.log(`Konnte Benachrichtigung nicht anzeigen: ${message}`);
    }
  }
}

// Führe Hauptfunktion aus, wenn direkt aufgerufen
if (require.main === module) {
  const args = process.argv.slice(2);
  const silentMode = args.includes('--silent');
  
  // Zeige Startbenachrichtigung, wenn nicht im Silent-Modus
  if (!silentMode) {
    showNotification("🚀 Master Task Manager wird gestartet...", "info");
  }
  
  if (silentMode) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }
  
  main()
    .then(() => {
      if (!silentMode) {
        const servicesStarted = Object.keys(managerStatus.services).length;
        const servicesError = Object.values(managerStatus.services).filter(s => s.status === 'error').length;
        
        if (servicesError > 0) {
          showNotification(`⚠️ Task Manager: ${servicesError} von ${servicesStarted} Services haben Fehler`, "warn");
        } else {
          showNotification(`✅ Task Manager: Alle ${servicesStarted} Services erfolgreich gestartet`, "info");
        }
      }
    })
    .catch(err => {
      fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] [CRITICAL] ${err.message}\n${err.stack}\n`, 'utf8');
      showNotification(`❌ Kritischer Fehler im Task Manager: ${err.message}`, "error");
    });
}

module.exports = { main };
