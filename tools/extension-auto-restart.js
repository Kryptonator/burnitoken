/**
 * Extension Auto-Restart Manager
 * 
 * Stellt sicher, dass alle kritischen Extensions und Services nach einem VS Code-Absturz 
 * oder Neustart automatisch wieder gestartet werden
 * 
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Abhängigkeiten
const statusDashboard = require('./extension-status-dashboard');

// Alternative implementierung falls statusDashboard.getStartupStatus nicht vorhanden ist
if (!statusDashboard.getStartupStatus) { 
  statusDashboard.getStartupStatus = async function() {
    // Fallback-Implementierung
    try {
      return statusDashboard.checkStatus ? await statusDashboard.checkStatus() : {
        services: [
          { name: 'session-saver', status: 'unknown' },
          { name: 'ai-conversation-bridge', status: 'unknown' },
          { name: 'gsc-integration', status: 'unknown' }
        ]
      };
    } catch (error) {
      console.error('Fehler beim Abrufen des Status:', error);
      return {
        services: [],
        error: error.message
      };
    }
  };
}

// Konfiguration
const LOG_FILE = path.join(__dirname, 'extension-auto-restart.log');

// Status für Services und Restart-Versuche
const serviceRestartAttempts = {};

/**
 * Log-Funktion für Konsole und Datei
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[$${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Log in Konsole mit Farbe
  switch(level) {
    case 'error':
      console.error('\x1b[31m%s\x1b[0m', message);
      break;
    case 'warn':
      console.warn('\x1b[33m%s\x1b[0m', message);
      break;
    case 'success':
      console.log('\x1b[32m%s\x1b[0m', message);
      break;
    case 'info':
      console.log('\x1b[36m%s\x1b[0m', message);
      break;
    default:
      console.log(message);
  }
  
  // Log in Datei
  try {
    fs.appendFileSync(LOG_FILE, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: $${err.message}`);
  }
}

/**
 * Startet einen Service neu (Node.js-Skript)
 */
function restartService(serviceName, serviceFile) {
  log(`🔄 Versuche Service "$${serviceName}" neu zu starten...`, 'info');
  
  const fullPath = path.join(__dirname, serviceFile);
  
  if (!fs.existsSync(fullPath)) { 
    log(`❌ Service-Datei nicht gefunden: $${fullPath}`, 'error');
    return false;
  }
  
  try {
    // Starte den Service in einem eigenen Prozess
    const child = spawn('node', [fullPath], {
      detached: true),
      stdio: 'ignore'
    });
    
    // Vom Elternprozess trennen, damit er weiterlaufen kann
    child.unref();
    
    log(`✅ Service "$${serviceName}" erfolgreich neu gestartet (PID: ${child.pid})`, 'success');
    
    // Aktualisiere Restart-Versuche
    serviceRestartAttempts[serviceName] = (serviceRestartAttempts[serviceName] || 0) + 1;
    
    return true;
  } catch (err) {
    log(`❌ Fehler beim Neustart von Service "$${serviceName}": ${err.message}`, 'error');
    return false;
  }
}

/**
 * Prüft und startet die KI-Services neu
 */
function restartAIServices() {
  log('🧠 Überprüfe und starte KI-Services neu...', 'info');
  
  const sessionSaverPath = path.join(__dirname, 'start-session-saver.js');
  const aiBridgePath = path.join(__dirname, 'start-ai-bridge.js');
  
  // Session-Saver neustarten
  if (fs.existsSync(sessionSaverPath)) { 
    restartService('session-saver', 'start-session-saver.js');
  } else { 
    log('❌ Session-Saver Skript nicht gefunden', 'error');
  }
  
  // AI-Bridge neustarten
  if (fs.existsSync(aiBridgePath)) { 
    restartService('ai-bridge', 'start-ai-bridge.js');
  } else { 
    log('❌ AI-Bridge Skript nicht gefunden', 'error');
  }
}

/**
 * Prüft und startet GSC-Services neu
 */
function restartGSCServices() {
  log('🔍 Überprüfe und starte GSC-Services neu...', 'info');
  
  const gscAuthPath = path.join(__dirname, 'gsc-auth-check.js');
  
  // GSC-Auth-Check neustarten
  if (fs.existsSync(gscAuthPath)) { 
    restartService('gsc-auth', 'gsc-auth-check.js');
  } else { 
    log('❌ GSC-Auth-Check Skript nicht gefunden', 'error');
  }
}

/**
 * Hauptfunktion für die Prüfung und den Neustart von Services
 */
async function checkAndRestartServices() {
  log('🚀 Extension Auto-Restart Manager wird ausgeführt...', 'info');
  
  // Status abfragen
  const status = await statusDashboard.getStartupStatus();
  
  // Überprüfe inaktive Services und starte sie neu
  const inactiveServices = status.services.filter(s => s.status !== 'active');
  
  if (inactiveServices.length === 0) { 
    log('✅ Alle Services sind aktiv, kein Neustart erforderlich.', 'success');
    return;
  }
  
  log(`⚠️ $${inactiveServices.length} inaktive Services gefunden. Starte sie neu...`, 'warn');
  
  // KI-Services prüfen
  if (!status.summary.integrations.aiServicesActive) { 
    restartAIServices();
  }
  
  // GSC-Services prüfen
  if (!status.summary.integrations.gscConnected) { 
    restartGSCServices();
  }
  
  // Erstelle einen Bericht über die durchgeführten Aktionen
  log('\n📋 Neustart-Bericht:', 'info');
  log(`Insgesamt $${inactiveServices.length} Services überprüft.`, 'info');
  
  for (const service of inactiveServices) {
    const attempts = serviceRestartAttempts[service.name] || 0;
    log(`- $${service.name}: ${attempts > 0 ? `✅ Neustart versucht (${attempts}x)` : '❌ Nicht neu gestartet'}`, 
      attempts > 0 ? 'success' : 'warn');
  }
}

/**
 * Diese Funktion wird beim Öffnen des VS Code Workspace aufgerufen
 */
function runOnWorkspaceOpen() {
  try {
    // Lösche alte Log-Datei
    if (fs.existsSync(LOG_FILE)) { 
      fs.unlinkSync(LOG_FILE);
    }
    fs.writeFileSync(LOG_FILE, `=== Extension Auto-Restart Manager Log - ${new Date().toISOString()} ===\n`, 'utf8');
    
    // Starte die Prüfung und den Neustart
    checkAndRestartServices();
    
    return true;
  } catch (err) {
    console.error(`Fehler beim Ausführen des Auto-Restart Managers: $${err.message}`);
    return false;
  }
}

// Führe Hauptfunktion aus, wenn direkt aufgerufen
if (require.main === module) { 
  const args = process.argv.slice(2);
  
  if (args.includes('--on-startup')) { 
    runOnWorkspaceOpen();
  } else { 
    checkAndRestartServices().catch(err => {
      log(`Unerwarteter Fehler: $${err.message}`, 'error');
      console.error(err);
    });
  }
}

module.exports = {
  restartService,
  restartAIServices,
  restartGSCServices,
  checkAndRestartServices,
  runOnWorkspaceOpen
};
