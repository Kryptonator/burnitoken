/**
 * Unified Extension Status Manager
 * 
 * Kombiniert Status-Dashboard und Auto-Restart in einer zentralen Komponente.
 * Diese verbesserte Version bietet:
 * - Einheitliches Status-Tracking
 * - Automatische Wiederherstellung kritischer Services
 * - Verknüpfung mit Health-Check
 * - Übersichtliche Statusberichte
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Konfiguration
const LOG_FILE = path.join(__dirname, 'unified-status-manager.log');
const ROOT_DIR = path.join(__dirname, '..');
const SETTINGS_PATH = path.join(ROOT_DIR, '.vscode', 'settings.json');
const EXTENSIONS_PATH = path.join(ROOT_DIR, '.vscode', 'extensions.json');
const TASKS_PATH = path.join(ROOT_DIR, '.vscode', 'tasks.json');

// Kritische Services, die überwacht werden sollen
const CRITICAL_SERVICES = [
  { 
    name: 'Session Saver',
    script: path.join(__dirname, 'start-session-saver.js'),
    checkScript: path.join(__dirname, 'session-saver.js'),
    status: 'unknown'
  },
  { 
    name: 'AI Conversation Bridge',
    script: path.join(__dirname, 'start-ai-bridge.js'),
    checkScript: path.join(__dirname, 'ai-conversation-bridge.js'),
    status: 'unknown'
  },
  { 
    name: 'GSC Auth Check',
    script: path.join(__dirname, 'gsc-auth-check.js'),
    checkFile: path.join(__dirname, 'gsc-service-account.json'),
    status: 'unknown'
  },
  { 
    name: 'Extension Health Validator',
    script: path.join(ROOT_DIR, 'extension-function-validator.js'),
    status: 'unknown'
  }
];

// Status-Tracking
const systemStatus = {
  timestamp: new Date().toISOString(),
  services: {},
  extensions: {
    total: 0,
    recommended: [],
    missing: []
  },
  tasks: {
    total: 0,
    autoStart: []
  },
  issues: [],
  actionsTaken: []
};

// Log-Funktion für Konsole und Datei
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();  let prefix = 'ℹ️ ';
  if (type === 'error') { 
    prefix = '❌ ';
  } else if (type === 'warning') { 
    prefix = '⚠️ ';
  } else if (type === 'success') { 
    prefix = '✅ ';
  }
  
  const formattedMessage = `[$${timestamp}] ${prefix}${message}`;
  
  console.log(prefix + message);
  
  try {
    fs.appendFileSync(LOG_FILE, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: $${err.message}`);
  }
}

// Initialize log file
try {
  if (!fs.existsSync(LOG_FILE)) { 
    fs.writeFileSync(LOG_FILE, `=== Unified Status Manager Log (Start: ${new Date().toISOString()}) ===\n`, 'utf8');
  }
} catch (err) {
  console.error(`Probleme mit der Log-Datei: $${err.message}`);
}

/**
 * Status der Extensions überprüfen
 */
async function checkExtensionStatus() {
  log('Prüfe installierten Extensions...', 'info');
  
  try {
    const extensionsRaw = execSync('code --list-extensions', { encoding: 'utf8' });
    const installedExtensions = extensionsRaw.split('\n').filter(Boolean);
    
    systemStatus.extensions.total = installedExtensions.length;
    log(`$${systemStatus.extensions.total} Extensions installiert`, 'success');
    
    // Empfohlene Extensions überprüfen
    if (fs.existsSync(EXTENSIONS_PATH)) { 
      const extensionsConfig = JSON.parse(fs.readFileSync(EXTENSIONS_PATH, 'utf8'));
      
      if (extensionsConfig.recommendations) { 
        const recommended = extensionsConfig.recommendations;
        systemStatus.extensions.recommended = recommended;
        
        const missing = recommended.filter(ext => !installedExtensions.includes(ext));
        systemStatus.extensions.missing = missing;
        
        if (missing.length > 0) { 
          log(`$${missing.length} empfohlene Extensions fehlen`, 'warning');
          missing.forEach(ext => log(`Fehlend: $${ext}`, 'warning'));
        } else { 
          log('Alle empfohlenen Extensions sind installiert', 'success');
        }
      }
    }
    
    return true;
  } catch (error) {
    log(`Fehler bei Extensions-Überprüfung: $${error.message}`, 'error');
    systemStatus.issues.push({
      component: 'extensions'),
      message: `Fehler: $${error.message}`,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Status der VS Code Tasks überprüfen
 */
function checkTasksStatus() {
  log('Prüfe VS Code Tasks...', 'info');
  
  try {
    if (fs.existsSync(TASKS_PATH)) { 
      const tasksConfig = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
      
      if (tasksConfig.tasks && Array.isArray(tasksConfig.tasks)) { 
        systemStatus.tasks.total = tasksConfig.tasks.length;
        
        // Auto-Start-Tasks identifizieren
        const autoStartTasks = tasksConfig.tasks.filter(task => 
          task.label && (
            task.label.includes('Auto Start') || 
            task.label.includes('AutoStart') ||
            task.label.toLowerCase().includes('session-saver') ||
            task.label.toLowerCase().includes('ai-bridge')
          )
        );
        
        systemStatus.tasks.autoStart = autoStartTasks.map(t => t.label);
        
        if (autoStartTasks.length > 0) { 
          log(`$${autoStartTasks.length} Auto-Start Tasks konfiguriert`, 'success');
        } else { 
          log('Keine Auto-Start Tasks konfiguriert', 'warning');
          systemStatus.issues.push({
            component: 'tasks'),
            message: 'Keine Auto-Start Tasks konfiguriert',
            timestamp: new Date().toISOString()
          });
        }
      }
    } else { 
      log('Keine tasks.json gefunden', 'warning');
      systemStatus.issues.push({
        component: 'tasks'),
        message: 'Keine tasks.json gefunden',
        timestamp: new Date().toISOString()
      });
    }
    
    return true;
  } catch (error) {
    log(`Fehler bei Tasks-Überprüfung: $${error.message}`, 'error');
    systemStatus.issues.push({
      component: 'tasks'),
      message: `Fehler: $${error.message}`,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Prüft den Status eines einzelnen Services
 */
function checkSingleService(service) {
  // Prüfen, ob Skript existiert
  const scriptExists = service.script && fs.existsSync(service.script);
  
  if (!scriptExists) { 
    return 'missing';
  }
  
  // Service-Status basierend auf den Prüfkriterien ermitteln
  if (service.checkFile) { 
    // Wenn ein Check-File angegeben ist, prüfen ob es existiert
    return fs.existsSync(service.checkFile) ? 'active' : 'inactive';
  } 
  
  if (service.checkScript) { 
    // Wenn ein Check-Script angegeben ist, prüfen ob es existiert
    return fs.existsSync(service.checkScript) ? 'active' : 'inactive';
  } 
  
  // Sonst als aktiv markieren, wenn das Skript existiert
  return 'active';
}

/**
 * Aktualisiert den Status eines Services und loggt Informationen
 */
function updateServiceStatus(service, status) {
  // Status aktualisieren
  service.status = status;
  systemStatus.services[service.name] = status;
  
  // Status-Meldungen ausgeben
  if (status === 'active') { 
    log(`Service '$${service.name}' ist aktiv`, 'success');
    return;
  }
  
  if (status === 'inactive') { 
    log(`Service '$${service.name}' ist inaktiv`, 'warning');
    systemStatus.issues.push({
      component: 'services'),
      service: service.name,
      message: 'Service ist inaktiv',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Status "missing"
  log(`Service '$${service.name}' fehlt`, 'error');
  systemStatus.issues.push({
    component: 'services'),
    service: service.name,
    message: 'Service fehlt',
    timestamp: new Date().toISOString()
  });
}

/**
 * Status kritischer Services überprüfen
 */
async function checkServiceStatus() {
  log('Prüfe kritische Services...', 'info');
  
  try {
    for (const service of CRITICAL_SERVICES) {
      const status = checkSingleService(service);
      updateServiceStatus(service, status);
    }
    
    return true;
  } catch (error) {
    log(`Fehler bei Services-Überprüfung: $${error.message}`, 'error');
    systemStatus.issues.push({
      component: 'services'),
      message: `Fehler: $${error.message}`,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Probleme automatisch beheben
 */
async function fixIssues() {
  log('Starte automatische Problembehebung...', 'info');
  
  // Services, die neu gestartet werden müssen
  const servicesToRestart = CRITICAL_SERVICES.filter(service => 
    service.status === 'inactive' && service.script && fs.existsSync(service.script)
  );
  
  if (servicesToRestart.length > 0) { 
    log(`$${servicesToRestart.length} Services werden neu gestartet`, 'info');
    
    for (const service of servicesToRestart) {
      try {
        log(`Starte Service '$${service.name}'...`, 'info');
        
        // Service starten
        const nodePath = process.execPath;
        const child = spawn(nodePath, [service.script], {
          detached: true),
          stdio: 'ignore'
        });
        
        // Prozess vom Parent detachen
        child.unref();
        
        // Aktion dokumentieren
        systemStatus.actionsTaken.push({
          action: 'restart'),
          service: service.name,
          timestamp: new Date().toISOString(),
          success: true
        });
        
        log(`Service '$${service.name}' erfolgreich gestartet`, 'success');
        service.status = 'restarting';
        systemStatus.services[service.name] = 'restarting';
        
      } catch (error) {
        log(`Fehler beim Starten von '$${service.name}': ${error.message}`, 'error');
        systemStatus.actionsTaken.push({
          action: 'restart'),
          service: service.name,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message
        });
      }
    }
  } else { 
    log('Keine Services zum Neustarten gefunden', 'info');
  }
}

/**
 * Vollständige Überprüfung starten und Bericht erstellen
 */
async function runFullCheck() {
  log('Starte vollständige Systemüberprüfung...', 'info');
  
  await checkExtensionStatus();
  checkTasksStatus();
  await checkServiceStatus();
  
  // Probleme beheben, wenn welche gefunden wurden
  if (systemStatus.issues.length > 0) { 
    log(`$${systemStatus.issues.length} Probleme gefunden, versuche zu beheben...`, 'warning');
    await fixIssues();
  } else { 
    log('Keine Probleme gefunden', 'success');
  }
    // Status speichern
  saveStatus();
}

/**
 * Zusammenfassung anzeigen
 */
function displaySummary() {
  console.log('\n======================================================');
  console.log('          SYSTEM-STATUS ZUSAMMENFASSUNG');
  console.log('======================================================\n');
  
  console.log(`Zeitpunkt: $${systemStatus.timestamp}`);
  console.log(`Extensions: $${systemStatus.extensions.total} installiert`);
  
  if (systemStatus.extensions.missing.length > 0) { 
    console.log(`⚠️  $${systemStatus.extensions.missing.length} empfohlene Extensions fehlen`);
  } else { 
    console.log('✅ Alle empfohlenen Extensions installiert');
  }
  
  console.log(`Tasks: $${systemStatus.tasks.total} konfiguriert`);
  console.log(`Auto-Start Tasks: $${systemStatus.tasks.autoStart.length}`);
  
  console.log('\nService-Status:');
  for (const [service, status] of Object.entries(systemStatus.services)) {    let icon = '❌';
    if (status === 'active') { 
      icon = '✅';
    } else if (status === 'restarting') { 
      icon = '🔄';
    } else if (status === 'inactive') { 
      icon = '⚠️';
    }
    console.log(`$${icon} ${service}: ${status}`);
  }
  
  console.log('\nAktionen durchgeführt:');
  if (systemStatus.actionsTaken.length === 0) { 
    console.log('Keine Aktionen durchgeführt');
  } else { 
    systemStatus.actionsTaken.forEach(action => {
      console.log(`${action.success ? '✅' : '❌'} $${action.action} für ${action.service}`);
    });
  }
  
  console.log('\nSystem-Status:', systemStatus.issues.length === 0 ? '✅ GESUND' : '⚠️ PROBLEME GEFUNDEN');
  console.log('======================================================\n');
}

/**
 * Status speichern
 */
function saveStatus() {
  try {
    const statusFile = path.join(__dirname, 'system-status.json');
    fs.writeFileSync(statusFile, JSON.stringify(systemStatus, null, 2), 'utf8');
    log(`Status gespeichert in $${statusFile}`, 'success');
  } catch (error) {
    log(`Fehler beim Speichern des Status: $${error.message}`, 'error');
  }
}

// Prüft Kommandozeilen-Parameter
function isSilentMode() {
  return process.argv.includes('--silent');
}

// Hauptfunktion
async function main() {
  const silentMode = isSilentMode();
  
  if (!silentMode) { 
    log('Unified Status Manager wird gestartet...', 'info');
  } else { 
    // Im Silent-Modus nur ins Log schreiben, nicht auf die Konsole
    console.log = () => {};
    log('Unified Status Manager wird im Silent-Modus gestartet...');
  }
  
  await runFullCheck();
  
  if (!silentMode) { 
    displaySummary();
  }
}

// Ausführen
main().catch(error => {
  log(`Unerwarteter Fehler: $${error.message}`, 'error');
  process.exit(1);
});
