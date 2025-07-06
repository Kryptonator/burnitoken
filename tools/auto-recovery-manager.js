/**
 * Auto Recovery Manager
 * 
 * Dieses Tool erkennt VS Code-Abstürze und stellt automatisch den letzten Arbeitsstand wieder her.
 * Es arbeitet eng mit dem Screenshot-Manager und Dependabot-Monitor zusammen.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { EventEmitter } = require('events');

// Konfiguration
const CONFIG = {
  recoveryDir: path.join(__dirname, '..', '.recovery-data'),
  screenshotDir: path.join(__dirname, '..', '.recovery-screenshots'),
  heartbeatInterval: 30000,          // 30 Sekunden
  lastSessionFile: 'last-session.json',
  cleanupOlderThan: 7 * 24 * 60 * 60 * 1000,  // 7 Tage
  maxCrashesBeforeAlert: 3,
  dateFormat: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
};

// Recovery Manager Event Emitter
const recoveryEvents = new EventEmitter();

// Stellen Sie sicher, dass das Recovery-Verzeichnis existiert
if (!fs.existsSync(CONFIG.recoveryDir)) { 
  fs.mkdirSync(CONFIG.recoveryDir, { recursive: true });
}

/**
 * Zeigt eine formatierte Meldung in der Konsole an
 */
function log(message, type = 'INFO') {
  const colorCodes = {
    INFO: '\x1b[36m',    // Cyan
    SUCCESS: '\x1b[32m', // Grün
    WARNING: '\x1b[33m', // Gelb
    ERROR: '\x1b[31m',   // Rot
    DEBUG: '\x1b[90m'    // Grau
  };
  const reset = '\x1b[0m';
  const color = colorCodes[type] || colorCodes.INFO;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`$${color}[${timestamp} ${type}]${reset} ${message}`);
}

/**
 * Speichert Informationen zur aktuellen VS Code-Sitzung
 */
function saveSessionInfo() {
  const sessionInfo = {
    timestamp: new Date().toISOString(),
    pid: process.pid,
    workspaceFolder: path.resolve(__dirname, '..'),
    heartbeat: new Date().toISOString()
  };
  
  try {
    fs.writeFileSync(
      path.join(CONFIG.recoveryDir, CONFIG.lastSessionFile),
      JSON.stringify(sessionInfo, null, 2)
    );
    return true;
  } catch (error) {
    log(`Fehler beim Speichern der Sitzungsinformationen: $${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Liest Informationen zur letzten VS Code-Sitzung
 */
function getLastSessionInfo() {
  try {
    const sessionFilePath = path.join(CONFIG.recoveryDir, CONFIG.lastSessionFile);
    if (fs.existsSync(sessionFilePath)) { 
      return JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
    }
    return null;
  } catch (error) {
    log(`Fehler beim Lesen der letzten Sitzungsinformationen: $${error.message}`, 'ERROR');
    return null;
  }
}

/**
 * Aktualisiert den Heartbeat der aktuellen Sitzung
 */
function updateHeartbeat() {
  try {
    const sessionFilePath = path.join(CONFIG.recoveryDir, CONFIG.lastSessionFile);
    if (fs.existsSync(sessionFilePath)) { 
      const sessionInfo = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
      sessionInfo.heartbeat = new Date().toISOString();
      fs.writeFileSync(sessionFilePath, JSON.stringify(sessionInfo, null, 2));
    }
  } catch (error) {
    log(`Fehler beim Aktualisieren des Heartbeats: $${error.message}`, 'DEBUG');
  }
}

/**
 * Überprüft, ob die letzte Sitzung abgestürzt ist
 */
function checkForCrash() {
  const lastSession = getLastSessionInfo();
  if (!lastSession) return false;
  
  const now = new Date();
  const lastHeartbeat = new Date(lastSession.heartbeat);
  const timeDiff = now - lastHeartbeat;
  
  // Wenn der letzte Heartbeat älter als 2 Intervalle ist, 
  // gilt die Sitzung als abgestürzt
  if (timeDiff > CONFIG.heartbeatInterval * 2) { 
    return {
      crashed: true,
      timeSinceCrash: timeDiff,
      lastSession
    };
  }
  
  return false;
}

/**
 * Erstellt einen schnellen Screenshot als Recovery-Punkt
 */
function takeRecoveryScreenshot() {
  try {
    // Prüfe, ob der Screenshot-Manager existiert
    const screenshotManagerPath = path.join(__dirname, 'auto-screenshot-manager.js');
    if (!fs.existsSync(screenshotManagerPath)) { 
      log('Screenshot-Manager nicht gefunden', 'ERROR');
      return null;
    }
    
    // Screenshot erstellen
    const output = execSync(`node "$${screenshotManagerPath}" --now`, { encoding: 'utf8' });
    const screenshotMatch = output.match(/Screenshot gespeichert: (.+\.png)/);
    
    if (screenshotMatch && screenshotMatch[1]) { 
      const screenshotName = screenshotMatch[1];
      log(`Recovery-Screenshot erstellt: $${screenshotName}`, 'SUCCESS');
      return path.join(CONFIG.screenshotDir, screenshotName);
    }
    
    return null;
  } catch (error) {
    log(`Fehler beim Erstellen des Recovery-Screenshots: $${error.message}`, 'ERROR');
    return null;
  }
}

/**
 * Findet den letzten Screenshot vor einem Absturz
 */
function findLastScreenshotBeforeCrash(crashTime) {
  try {
    if (!fs.existsSync(CONFIG.screenshotDir)) { 
      log('Screenshot-Verzeichnis nicht gefunden', 'ERROR');
      return null;
    }
    
    const screenshots = fs.readdirSync(CONFIG.screenshotDir)
      .filter(file => file.startsWith('vscode_recovery_') && file.endsWith('.png'))
      .map(file => ({
        name: file),
        path: path.join(CONFIG.screenshotDir, file),
        time: fs.statSync(path.join(CONFIG.screenshotDir, file)).mtime
      }))
      .sort((a, b) => b.time - a.time); // Neueste zuerst
    
    // Finde den letzten Screenshot vor dem Absturz
    if (crashTime) { 
      const crashDate = new Date(crashTime);
      const beforeCrash = screenshots.find(screenshot => screenshot.time < crashDate);
      
      if (beforeCrash) { 
        return beforeCrash;
      }
    }
    
    // Fallback: Neuester Screenshot
    return screenshots.length > 0 ? screenshots[0] : null;
  } catch (error) {
    log(`Fehler beim Suchen des letzten Screenshots: $${error.message}`, 'ERROR');
    return null;
  }
}

/**
 * Verarbeitet einen erkannten Absturz
 */
function handleCrash(crashInfo) {
  log('🚨 VS Code-Absturz erkannt!', 'ERROR');
  log(`Letztes Lebenszeichen: ${new Date(crashInfo.lastSession.heartbeat).toLocaleString()}`, 'INFO');
  
  // Ereignis auslösen
  recoveryEvents.emit('crash', crashInfo);
  
  // Letzten Screenshot vor dem Absturz finden
  const lastScreenshot = findLastScreenshotBeforeCrash(crashInfo.lastSession.heartbeat);
  
  if (lastScreenshot) { 
    log(`📸 Letzter Screenshot vor dem Absturz: $${lastScreenshot.name}`, 'SUCCESS');
    log(`Zeitpunkt: ${lastScreenshot.time.toLocaleString()}`, 'INFO');
    
    // Ereignis auslösen
    recoveryEvents.emit('recovery-available', { 
      crashInfo),
      recoveryScreenshot: lastScreenshot 
    });
    
    return lastScreenshot;
  } else { 
    log('Kein Recovery-Screenshot verfügbar', 'WARNING');
    return null;
  }
}

/**
 * Aufräumen alter Recovery-Daten
 */
function cleanupOldRecoveryData() {
  try {
    const now = new Date();
    
    // Recovery-Verzeichnis aufräumen
    fs.readdirSync(CONFIG.recoveryDir)
      .filter(file => file !== CONFIG.lastSessionFile && file.endsWith('.json'))
      .forEach(file => {
        const filePath = path.join(CONFIG.recoveryDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime > CONFIG.cleanupOlderThan) { 
          fs.unlinkSync(filePath);
          log(`Alte Recovery-Datei gelöscht: $${file}`, 'DEBUG');
        }
      });
      
  } catch (error) {
    log(`Fehler beim Aufräumen alter Recovery-Daten: $${error.message}`, 'ERROR');
  }
}

/**
 * Zeige Recovery-Benachrichtigung mit Windows-Benachrichtigung
 */
function showRecoveryNotification(recoveryInfo) {
  try {
    const powershellScript = `
    [reflection.assembly]::loadwithpartialname('System.Windows.Forms')
    [reflection.assembly]::loadwithpartialname('System.Drawing')
    $notify = new-object system.windows.forms.notifyicon
    $notify.icon = [System.Drawing.SystemIcons]::Information
    $notify.visible = $true
    $notify.showballoontip(10, 'VS Code Recovery', 'VS Code wurde nach einem Absturz wiederhergestellt. Öffnen Sie das Recovery Center für weitere Informationen.', [system.windows.forms.tooltipicon]::Info)
    Start-Sleep -Seconds 3
    $notify.Dispose()
    `;
    
    execSync('powershell -Command "' + powershellScript + '"', { stdio: 'ignore' });
    log('Recovery-Benachrichtigung angezeigt', 'SUCCESS');
    return true;
  } catch (error) {
    log(`Fehler beim Anzeigen der Recovery-Benachrichtigung: $${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Öffnet das Recovery-Center
 */
function openRecoveryCenter(recoveryInfo = null) {
  try {
    // Letzten Screenshot als aktives Bild setzen (falls verfügbar)
    if (recoveryInfo && recoveryInfo.recoveryScreenshot) { 
      fs.writeFileSync(
        path.join(CONFIG.recoveryDir, 'active-recovery.json'),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          screenshot: recoveryInfo.recoveryScreenshot,
          crashInfo: recoveryInfo.crashInfo
        }, null, 2)
      );
    }
    
    // Starte den VS Code Task für das Recovery Center
    execSync('code -r . --command workbench.action.tasks.runTask "🔄 VS Code Recovery Center"', { 
      stdio: 'ignore'
    });
    
    log('Recovery Center geöffnet', 'SUCCESS');
    return true;
  } catch (error) {
    log(`Fehler beim Öffnen des Recovery Centers: $${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Hauptfunktion
 */
function main() {
  log('Auto Recovery Manager gestartet', 'INFO');
  
  // Nach Abstürzen beim Start prüfen
  const crashInfo = checkForCrash();
  if (crashInfo && crashInfo.crashed) { 
    const recoveryInfo = {
      crashInfo,
      recoveryScreenshot: handleCrash(crashInfo)
    };
    
    // Zeige Benachrichtigung und öffne Recovery Center
    showRecoveryNotification(recoveryInfo);
    openRecoveryCenter(recoveryInfo);
  }
  
  // Neue Sitzungsinformationen speichern
  saveSessionInfo();
  
  // Heartbeat regelmäßig aktualisieren
  setInterval(updateHeartbeat, CONFIG.heartbeatInterval);
  
  // Initiale Recovery-Screenshot erstellen
  takeRecoveryScreenshot();
  
  // Alte Recovery-Daten aufräumen
  cleanupOldRecoveryData();
  
  log('Recovery Manager läuft im Hintergrund', 'SUCCESS');
}

// Kommandozeilenargumente verarbeiten
const args = process.argv.slice(2);
const options = {
  showAlert: args.includes('--show-alert'),
  forceRecover: args.includes('--force-recover'),
  silent: args.includes('--silent')
};

// Programm ausführen
if (options.forceRecover) { 
  openRecoveryCenter();
} else { 
  main();
}

// Export als Modul
module.exports = {
  recoveryEvents,
  takeRecoveryScreenshot,
  openRecoveryCenter,
  findLastScreenshotBeforeCrash,
  CONFIG
};
