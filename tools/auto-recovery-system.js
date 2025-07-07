/**
 * Auto-Recovery System for BurniToken Website
 * 
 * Erkennt und behebt automatisch Probleme mit der BurniToken Website
 * Führt automatische Selbstheilungsmaßnahmen durch
 * 
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { runFullMonitoringCheck } = require('./unified-monitoring-service');

// Konfiguration
const CONFIG = {
  logFile: path.join(__dirname, 'auto-recovery.log'),
  statusFile: path.join(__dirname, 'auto-recovery-status.json'),
  recoveryIntervalMinutes: 30,
  maxRecoveriesPerDay: 5,
  netlifyDeployHook: process.env.NETLIFY_DEPLOY_HOOK || '',
  isNetlifyDeployEnabled: process.env.NETLIFY_DEPLOY_ENABLED === 'true',
  recoveryActions: [
    {
      name: 'refresh_dns',
      description: 'DNS Cache aktualisieren',
      command: 'ipconfig /flushdns',
      windowsOnly: true
    },
    {
      name: 'purge_cache',
      description: 'CDN Cache leeren',
      command: 'curl -X POST "${NETLIFY_DEPLOY_HOOK}&clear_cache=true"',
      requiresNetlifyHook: true
    },
    {
      name: 'trigger_redeploy',
      description: 'Redeployment auslösen',
      command: 'curl -X POST "${NETLIFY_DEPLOY_HOOK}"',
      requiresNetlifyHook: true
    },
    {
      name: 'validate_html',
      description: 'HTML validieren',
      command: 'npx html-validate index.html 404.html || true'
    },
    {
      name: 'optimize_assets',
      description: 'Assets optimieren',
      command: 'npm run optimize:assets || true'
    }
  ]
};

// Status-Objekt
const recoveryStatus = {
  timestamp: new Date().toISOString(),
  lastRecovery: null,
  recoveriesPerformed: 0,
  recoveriesPerformedToday: 0,
  recoveryEnabled: true,
  history: [],
  currentStatus: 'idle'
};

/**
 * Log-Funktion für Konsole und Datei
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
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
    fs.appendFileSync(CONFIG.logFile, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: ${err.message}`);
  }
}

/**
 * Speichert den Recovery-Status
 */
function saveRecoveryStatus() {
  try {
    // Stelle sicher, dass das Verzeichnis existiert
    const statusDir = path.dirname(CONFIG.statusFile);
    if (!fs.existsSync(statusDir)) {
      fs.mkdirSync(statusDir, { recursive: true });
    }
    
    fs.writeFileSync(CONFIG.statusFile, JSON.stringify(recoveryStatus, null, 2), 'utf8');
    return true;
  } catch (err) {
    log(`Fehler beim Speichern des Recovery-Status: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Führt eine Recovery-Aktion aus
 */
async function executeRecoveryAction(action) {
  return new Promise((resolve) => {
    try {
      // Prüfe, ob die Aktion nur für Windows ist
      if (action.windowsOnly && process.platform !== 'win32') {
        log(`Aktion ${action.name} wird übersprungen, da sie nur für Windows verfügbar ist`, 'warn');
        resolve({
          success: false,
          message: 'Action skipped: Windows only'
        });
        return;
      }
      
      // Prüfe, ob Netlify Deploy Hook erforderlich ist
      if (action.requiresNetlifyHook && (!CONFIG.netlifyDeployHook || !CONFIG.isNetlifyDeployEnabled)) {
        log(`Aktion ${action.name} wird übersprungen, da kein Netlify Deploy Hook konfiguriert ist`, 'warn');
        resolve({
          success: false,
          message: 'Action skipped: Netlify hook required but not configured'
        });
        return;
      }
      
      log(`Führe Recovery-Aktion aus: ${action.description}`, 'info');
      
      // Ersetze Umgebungsvariablen im Befehl
      let command = action.command;
      command = command.replace('${NETLIFY_DEPLOY_HOOK}', CONFIG.netlifyDeployHook);
      
      // Führe den Befehl aus
      const output = execSync(command, { encoding: 'utf8', shell: true, stdio: 'pipe' });
      
      log(`✅ Recovery-Aktion erfolgreich ausgeführt: ${action.name}`, 'success');
      
      resolve({
        success: true,
        output: output,
        action: action.name
      });
    } catch (err) {
      log(`❌ Fehler bei Recovery-Aktion ${action.name}: ${err.message}`, 'error');
      
      resolve({
        success: false,
        error: err.message,
        action: action.name
      });
    }
  });
}

/**
 * Führt eine automatische Wiederherstellung basierend auf dem aktuellen Status durch
 */
async function performAutoRecovery() {
  try {
    log('🔧 Starte automatische Wiederherstellung...', 'info');
    
    // Prüfe, ob Recovery aktiviert ist
    if (!recoveryStatus.recoveryEnabled) {
      log('Auto-Recovery ist deaktiviert. Keine Aktionen werden durchgeführt.', 'warn');
      return false;
    }
    
    // Prüfe das tägliche Limit für Recoveries
    const today = new Date().toISOString().split('T')[0];
    const recoveriesToday = recoveryStatus.history
      .filter(h => h.timestamp.startsWith(today))
      .length;
    
    if (recoveriesToday >= CONFIG.maxRecoveriesPerDay) {
      log(`Tägliches Recovery-Limit erreicht (${CONFIG.maxRecoveriesPerDay}). Keine weiteren Aktionen werden durchgeführt.`, 'warn');
      return false;
    }
    
    // Status aktualisieren
    recoveryStatus.currentStatus = 'recovering';
    recoveryStatus.lastRecovery = new Date().toISOString();
    recoveryStatus.recoveriesPerformed++;
    
    // Recovery-Aktionen ausführen
    const recoveryResults = [];
    
    for (const action of CONFIG.recoveryActions) {
      const result = await executeRecoveryAction(action);
      recoveryResults.push(result);
      
      // Kurze Pause zwischen den Aktionen
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Recovery-Historie aktualisieren
    recoveryStatus.history.push({
      timestamp: new Date().toISOString(),
      results: recoveryResults,
      successful: recoveryResults.some(r => r.success)
    });
    
    // Begrenze die Historieneinträge auf die letzten 100
    if (recoveryStatus.history.length > 100) {
      recoveryStatus.history = recoveryStatus.history.slice(-100);
    }
    
    // Status aktualisieren
    recoveryStatus.currentStatus = 'idle';
    saveRecoveryStatus();
    
    // Erfolg prüfen
    const successfulActions = recoveryResults.filter(r => r.success).length;
    log(`✅ Auto-Recovery abgeschlossen: ${successfulActions}/${CONFIG.recoveryActions.length} Aktionen erfolgreich ausgeführt`, 
      successfulActions > 0 ? 'success' : 'warn');
    
    // Nach Recovery einen Monitoring-Check durchführen
    log('Führe Monitoring-Check nach Recovery durch...', 'info');
    setTimeout(async () => {
      try {
        await runFullMonitoringCheck();
      } catch (err) {
        log(`Fehler beim Post-Recovery Monitoring-Check: ${err.message}`, 'error');
      }
    }, 10000); // 10 Sekunden warten, damit Änderungen wirksam werden können
    
    return successfulActions > 0;
  } catch (err) {
    log(`Kritischer Fehler bei der automatischen Wiederherstellung: ${err.message}`, 'error');
    recoveryStatus.currentStatus = 'error';
    saveRecoveryStatus();
    return false;
  }
}

/**
 * Analysiert den Status und entscheidet, ob eine Recovery notwendig ist
 */
async function analyzeAndRecover() {
  try {
    log('🔍 Analysiere Website-Status für mögliche Recovery...', 'info');
    
    // Monitoring-Status abrufen
    const monitoringStatus = await runFullMonitoringCheck();
    
    if (monitoringStatus === 'critical' || monitoringStatus === 'error') {
      log(`Kritischer Status erkannt: ${monitoringStatus}. Starte automatische Wiederherstellung...`, 'warn');
      return await performAutoRecovery();
    } else if (monitoringStatus === 'degraded') {
      log(`Degradierter Status erkannt. Prüfe Details...`, 'info');
      
      // Hier könnten wir detailliertere Analysen durchführen, um zu entscheiden,
      // ob eine Recovery notwendig ist
      
      // Für jetzt starten wir eine Recovery bei degradiertem Status
      log(`Degradierter Status: Starte automatische Wiederherstellung...`, 'warn');
      return await performAutoRecovery();
    } else {
      log(`Status ist ${monitoringStatus}. Keine Wiederherstellung notwendig.`, 'success');
      return false;
    }
  } catch (err) {
    log(`Fehler bei der Status-Analyse: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Aktiviert oder deaktiviert die automatische Wiederherstellung
 */
function setRecoveryEnabled(enabled) {
  recoveryStatus.recoveryEnabled = enabled;
  saveRecoveryStatus();
  
  log(`Auto-Recovery ist jetzt ${enabled ? 'aktiviert' : 'deaktiviert'}`, enabled ? 'success' : 'warn');
  return recoveryStatus.recoveryEnabled;
}

/**
 * Startet die kontinuierliche Überwachung mit automatischer Wiederherstellung
 */
function startContinuousRecovery() {
  log('🚀 Starte kontinuierliche Überwachung mit Auto-Recovery...', 'info');
  
  // Initialer Zustand
  recoveryStatus.recoveryEnabled = true;
  saveRecoveryStatus();
  
  // Sofortiger erster Check
  analyzeAndRecover().catch(err => {
    log(`Fehler beim initialen Recovery-Check: ${err.message}`, 'error');
  });
  
  // Reguläre Interval-Checks
  const intervalMs = CONFIG.recoveryIntervalMinutes * 60 * 1000;
  const intervalId = setInterval(() => {
    analyzeAndRecover().catch(err => {
      log(`Fehler beim regulären Recovery-Check: ${err.message}`, 'error');
    });
  }, intervalMs);
  
  return intervalId;
}

/**
 * Stoppt die kontinuierliche Überwachung
 */
function stopContinuousRecovery(intervalId) {
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  log('Kontinuierliche Überwachung mit Auto-Recovery wurde gestoppt', 'warn');
}

/**
 * Hauptfunktion
 */
async function main() {
  try {
    // Stelle sicher, dass das Verzeichnis für Logs existiert
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Lösche alte Log-Datei
    if (fs.existsSync(CONFIG.logFile)) {
      fs.truncateSync(CONFIG.logFile, 0);
    }
    
    log('🚀 Auto-Recovery System wird gestartet...', 'info');
    
    // Parameter prüfen
    const args = process.argv.slice(2);
    const runOnce = args.includes('--once');
    const forceRecovery = args.includes('--force');
    const disableRecovery = args.includes('--disable');
    
    if (disableRecovery) {
      setRecoveryEnabled(false);
      return;
    }
    
    if (forceRecovery) {
      log('Erzwinge Recovery-Durchführung...', 'warn');
      await performAutoRecovery();
      return;
    }
    
    if (runOnce) {
      // Einmaliger Check
      await analyzeAndRecover();
    } else {
      // Kontinuierliche Überwachung starten
      const intervalId = startContinuousRecovery();
      
      // Bei Ctrl+C sauber beenden
      process.on('SIGINT', () => {
        log('Auto-Recovery System wird beendet...', 'info');
        stopContinuousRecovery(intervalId);
        process.exit(0);
      });
    }
  } catch (err) {
    log(`Kritischer Fehler im Auto-Recovery System: ${err.message}`, 'error');
    console.error(err);
  }
}

// Führe Hauptfunktion aus, wenn direkt aufgerufen
if (require.main === module) {
  main().catch(err => {
    console.error(`Kritischer Fehler: ${err.message}`);
    console.error(err);
  });
}

module.exports = {
  analyzeAndRecover,
  performAutoRecovery,
  setRecoveryEnabled
};
