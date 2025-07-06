/**
 * Extension Function Validator
 * Prüft die installierten VS Code Extensions auf Funktionalität und Kompatibilität
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { recordCheckSuccess } = require('./tools/status-tracker'); // Import status-tracker

// Pfad für die Log-Datei
const LOG_FILE = 'extension-validator.log';

// Logge in Konsole und Datei
function log(message) {
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: $${err.message}`);
  }
}

// Lösche alte Log-Datei falls vorhanden und erstelle Verzeichnis wenn nötig
try {
  if (fs.existsSync(LOG_FILE)) { 
    fs.unlinkSync(LOG_FILE);
  }
  
  // Stelle sicher, dass wir auch in die Datei schreiben können
  fs.writeFileSync(LOG_FILE, '=== Extension Validator Log ===\n', 'utf8');
  
} catch (err) {
  console.error(`Probleme mit der Log-Datei: $${err.message}`);
}

log('🚀 Extension Function Validator wird gestartet...');

// Pfade für Konfigurationsdateien
const SETTINGS_PATH = path.join('.vscode', 'settings.json');
const EXTENSIONS_PATH = path.join('.vscode', 'extensions.json');

// Prüfbare Extensions
const CRITICAL_EXTENSIONS = [
  'bradlc.vscode-tailwindcss',
  'esbenp.prettier-vscode',
  'dbaeumer.vscode-eslint',
  'html-validate.vscode-html-validate',
  'maxvanderschee.web-accessibility',
  'ritwickdey.liveserver',
  'eamodio.gitlens',
  'github.copilot',
  'ms-playwright.playwright'
];

// KI-Integration-Dateien
const AI_INTEGRATION_FILES = [
  'tools/session-saver.js',
  'tools/recover-session.js',
  'tools/start-session-saver.js',
  'tools/ai-conversation-bridge.js',
  'tools/start-ai-bridge.js',
  'tools/model-switch.js',
  'tools/ai-status.js',
  'tools/ai-status-fix.js',
  'tools/ai-services-manager.js'
];

// GSC-Integration-Dateien
const GSC_TOOLS = [
  'tools/gsc-auth-check.js',
  'tools/gsc-status-check.js',
  'tools/gsc-performance-data.js',
  'tools/gsc-keywords-report.js',
  'tools/gsc-crawl-stats.js',
  'tools/gsc-quick-test.js',
  'tools/gsc-integration-monitor.js'
];

// Status-Tracking
const extensionStatus = {
  healthy: [],
  issues: [],
  recommendations: []
};

/**
 * Prüft, ob eine Datei existiert
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(`Fehler beim Prüfen, ob Datei existiert ($${filePath}):`, err.message);
    return false;
  }
}

/**
 * Liest eine JSON-Datei ein
 */
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Fehler beim Lesen von $${filePath}:`, err.message);
    return null;
  }
}

/**
 * Prüft den Status der VS Code Extensions
 */
function checkExtensionStatus() {
  console.log('🔍 Prüfe installierten VS Code Extensions...');
  
  try {
    // Prüfe, ob settings.json existiert
    if (!fileExists(SETTINGS_PATH)) { 
      console.warn('⚠️ Keine settings.json gefunden, erstelle Standard-Konfiguration');
      createDefaultSettings();
    }

    // Prüfe, ob extensions.json existiert
    if (!fileExists(EXTENSIONS_PATH)) { 
      console.warn('⚠️ Keine extensions.json gefunden, erstelle Standard-Konfiguration');
      createDefaultExtensionsRecommendations();
    }

    // Prüfe kritische Extensions
    try {
      const installedExtensions = execSync('code --list-extensions', { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);
      
      console.log(`✅ Gefunden: $${installedExtensions.length} installierte Extensions`);
      
      for (const ext of CRITICAL_EXTENSIONS) {
        if (installedExtensions.includes(ext)) { 
          extensionStatus.healthy.push(ext);
        } else { 
          extensionStatus.issues.push(ext);
          console.warn(`⚠️ Kritische Extension nicht installiert: $${ext}`);
        }
      }
      
      // Prüfe auf Konflikte und redundante Extensions
      checkForExtensionConflicts(installedExtensions);
        } catch (err) {
      console.error('❌ Fehler beim Prüfen der installierten Extensions:', err.message);
    }
    
    // Prüfe settings.json auf korrekte Konfiguration
    checkSettingsConfiguration();
    
    // Prüfe tasks.json Struktur
    validateTasksStructure();    // Prüfe KI-Integration
    checkAIIntegration();
checkGSCIntegration();
      // Prüfe VS Code Umgebung
    checkEnvironment();
    
    // Prüfe Tailwind CSS-Konfiguration spezifisch
    checkTailwindCSSSetup();

    // Ausgabe des Ergebnisses
    console.log('\n📊 Extension Health Check Ergebnis:');
    console.log(`✅ Gesunde Extensions: $${extensionStatus.healthy.length}`);
    console.log(`⚠️ Extensions mit Problemen: $${extensionStatus.issues.length}`);
    console.log(`💡 Empfehlungen: $${extensionStatus.recommendations.length}`);
    
    if (extensionStatus.issues.length === 0) { 
      console.log('🎉 Alle kritischen Extensions sind korrekt installiert und konfiguriert!');
      recordCheckSuccess('extension-health-check'); // Zeitstempel für erfolgreichen Check speichern
    } else { 
      console.log('\n⚠️ Es wurden Probleme gefunden die behoben werden sollten:');
      extensionStatus.issues.forEach(issue => {
        console.log(`  - Fehlende kritische Extension: $${issue}`);
      });
      
      console.log('\nFühren Sie folgende Befehle aus, um fehlende Extensions zu installieren:');
      extensionStatus.issues.forEach(issue => {
        console.log(`  code --install-extension $${issue}`);
      });
    }
    
    if (extensionStatus.recommendations.length > 0) { 
      console.log('\n💡 Empfehlungen zur Optimierung:');
      extensionStatus.recommendations.forEach(recommendation => {
        console.log(`  - $${recommendation}`);
      });
    }
    
    return {
      healthy: extensionStatus.healthy.length,
      issues: extensionStatus.issues.length,
      recommendations: extensionStatus.recommendations.length
    };
  } catch (error) {
    console.error('❌ Unerwarteter Fehler bei der Ausführung des Extension Health Checks:', error.message);
    return {
      healthy: 0,
      issues: 1,
      recommendations: 0,
      error: error.message
    };
  }
}

/**
 * Prüft auf Konflikte und redundante Extensions
 */
function checkForExtensionConflicts(installedExtensions) {
  // Prüfe auf bekannte Konflikte und redundante
  const formatters = installedExtensions.filter(ext => 
    ext.includes('prettier') || 
    ext.includes('formatter') || 
    ext.includes('beautify')
  );
  
  if (formatters.length > 2) { 
    console.warn('⚠️ Mehrere Formatter-Extensions installiert, dies kann zu Konflikten führen');
    extensionStatus.recommendations.push('Reduzieren Sie die Anzahl der Formatter-Extensions');
  }
  
  const linters = installedExtensions.filter(ext => 
    ext.includes('lint') || 
    ext.includes('eslint') || 
    ext.includes('tslint')
  );
  
  if (linters.length > 2) { 
    console.warn('⚠️ Mehrere Linter-Extensions installiert, dies kann zu Konflikten führen');
    extensionStatus.recommendations.push('Reduzieren Sie die Anzahl der Linter-Extensions');
  }
}

/**
 * Prüft die VS Code Einstellungen auf korrekte Konfiguration
 */
function checkSettingsConfiguration() {
  const settings = readJsonFile(SETTINGS_PATH);
  if (!settings) return;

  // Prüfe auf Tailwind-Konfiguration
  if (!settings['tailwindCSS.includeLanguages']) { 
    extensionStatus.recommendations.push('Tailwind CSS Sprachunterstützung fehlt');
  }

  // Prüfe auf Prettier-Konfiguration
  if (!settings['prettier.enable']) { 
    extensionStatus.recommendations.push('Prettier ist nicht aktiviert');
  }

  // Prüfe auf Barrierefreiheit-Konfiguration
  if (!settings['accessibility.focusVisible']) { 
    extensionStatus.recommendations.push('Barrierefreiheits-Fokus ist nicht aktiviert');
  }

  // Prüfe auf automatische Updates
  if (settings['extensions.autoUpdate'] === false) { 
    extensionStatus.recommendations.push('Automatische Extension-Updates sind deaktiviert');
  }
}

/**
 * Erstellt eine Standard-settings.json, falls keine existiert
 */
function createDefaultSettings() {
  const defaultSettings = {
    "tailwindCSS.includeLanguages": {
      "html": "html",
      "javascript": "javascript",
      "css": "css"
    },
    "prettier.enable": true,
    "prettier.singleQuote": true,
    "prettier.semi": true,
    "prettier.tabWidth": 2,
    "liveServer.settings.donotShowInfoMsg": true,
    "accessibility.focusVisible": true,
    "git.enableSmartCommit": true,
    "git.autofetch": true,
    "extensions.autoUpdate": true
  };

  try {
    if (!fs.existsSync('.vscode')) { 
      fs.mkdirSync('.vscode');
    }
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));
    console.log('✅ Standard-settings.json erstellt');
  } catch (err) {
    console.error('❌ Fehler beim Erstellen der settings.json:', err.message);
  }
}

/**
 * Erstellt eine Standard-extensions.json, falls keine existiert
 */
function createDefaultExtensionsRecommendations() {
  const defaultExtensions = {
    "recommendations": [
      "bradlc.vscode-tailwindcss",
      "esbenp.prettier-vscode",
      "dbaeumer.vscode-eslint",
      "html-validate.vscode-html-validate",
      "maxvanderschee.web-accessibility",
      "ritwickdey.liveserver",
      "eamodio.gitlens",
      "github.copilot",
      "ms-playwright.playwright"
    ]
  };

  try {
    if (!fs.existsSync('.vscode')) { 
      fs.mkdirSync('.vscode');
    }
    fs.writeFileSync(EXTENSIONS_PATH, JSON.stringify(defaultExtensions, null, 2));
    console.log('✅ Standard-extensions.json erstellt');
  } catch (err) {
    console.error('❌ Fehler beim Erstellen der extensions.json:', err.message);
  }
}

/**
 * Prüft, ob die KI-Integration aktiv und vollständig ist
 */


/**
 * Prüft die GSC-Integration und -Tools
 */
function checkGSCIntegration() {
  log('\n🔍 Überprüfe GSC-Integration...');
  
  let gscStatusOK = true;
  let missingGSCTools = [];
  
  // Prüfe Service-Account-Datei
  const serviceAccountPath = path.join(__dirname, 'tools', 'gsc-service-account.json');
  if (!fileExists(serviceAccountPath)) { 
    log('⚠️ GSC Service-Account-Datei fehlt', 'warn');
    extensionStatus.recommendations.push('GSC Service-Account-Datei wiederherstellen');
    gscStatusOK = false;
  } else { 
    log('✅ GSC Service-Account-Datei gefunden');
  }
  
  // Prüfe GSC-Tools
  for (const tool of GSC_TOOLS) {
    const toolPath = path.join(__dirname, tool);
    if (!fileExists(toolPath)) { 
      missingGSCTools.push(path.basename(tool));
    }
  }
  
  if (missingGSCTools.length > 0) { 
    log(`⚠️ Fehlende GSC-Tools: ${missingGSCTools.join(', ')}`, 'warn');
    extensionStatus.recommendations.push(`GSC-Tools wiederherstellen: ${missingGSCTools.join(', ')}`);
    gscStatusOK = false;
  } else { 
    log('✅ Alle GSC-Tools sind vorhanden');
  }
  
  // Prüfe GSC-Integration in Tasks
  const tasksPath = path.join(__dirname, '.vscode', 'tasks.json');
  if (fileExists(tasksPath)) { 
    const tasksConfig = readJsonFile(tasksPath);
    if (tasksConfig && Array.isArray(tasksConfig.tasks)) { 
      const hasGSCAuthTask = tasksConfig.tasks.some(t => 
        t.label && t.label.includes('GSC Auth') && 
        t.runOptions && t.runOptions.runOn === 'folderOpen');
      
      const hasGSCMonitorTask = tasksConfig.tasks.some(t => 
        t.label && t.label.includes('GSC Integration Monitor'));
      
      if (!hasGSCAuthTask || !hasGSCMonitorTask) { 
        log('⚠️ GSC-Tasks fehlen oder sind nicht korrekt konfiguriert', 'warn');
        extensionStatus.recommendations.push('GSC-Tasks in tasks.json konfigurieren');
        gscStatusOK = false;
      } else { 
        log('✅ GSC-Tasks sind korrekt konfiguriert');
      }
    }
  }
  
  if (gscStatusOK) { 
    log('✅ GSC-Integration scheint vollständig zu sein');
    extensionStatus.healthy.push('gsc-integration');
  } else { 
    extensionStatus.issues.push('gsc-integration');
    log('⚠️ GSC-Integration hat Probleme');
  }
}function checkAIIntegration() {
  console.log('\n🧠 Prüfe KI-Integration...');
  
  // Prüfe auf fehlende KI-Integrationsdateien
  const missingFiles = AI_INTEGRATION_FILES.filter(file => !fileExists(file));
  
  if (missingFiles.length > 0) { 
    console.warn(`⚠️ Fehlende KI-Integrationsdateien: ${missingFiles.join(', ')}`);
    extensionStatus.recommendations.push('KI-Integration ist unvollständig');
  } else { 
    console.log('✅ KI-Integrationsdateien vollständig');
    
    // Prüfe Tasks für automatischen Start
    checkAutoStartTasks();
    
    // Prüfe andere KI-Tools und Status-Tools
    checkAIStatusTools();
  }
}

/**
 * Prüft, ob die Tasks für automatischen Start konfiguriert sind
 */
function checkAutoStartTasks() {
  const tasksPath = path.join('.vscode', 'tasks.json');
  if (!fileExists(tasksPath)) { 
    console.warn('⚠️ Keine tasks.json gefunden');
    extensionStatus.recommendations.push('tasks.json fehlt für KI-Auto-Start');
    return;
  }
  
  const tasksConfig = readJsonFile(tasksPath);
  if (!tasksConfig || !Array.isArray(tasksConfig.tasks)) { 
    console.warn('⚠️ tasks.json hat kein gültiges Format');
    extensionStatus.recommendations.push('tasks.json hat kein gültiges Format');
    return;
  }
  
  // Prüfe Session-Saver Task
  const sessionSaverTask = tasksConfig.tasks.find(task => 
    task.label && task.label.includes('Session-Saver'));
  
  if (sessionSaverTask) { 
    const autoStart = sessionSaverTask.runOptions && 
                     sessionSaverTask.runOptions.runOn === 'folderOpen';
    
    if (autoStart) { 
      console.log('✅ Session-Saver Auto-Start konfiguriert');
    } else { 
      console.warn('⚠️ Session-Saver hat keinen automatischen Start');
      extensionStatus.recommendations.push('Session-Saver Auto-Start fehlt');
    }
  } else { 
    console.warn('⚠️ Kein Session-Saver Task gefunden');
    extensionStatus.recommendations.push('Session-Saver Task fehlt');
  }
  
  // Prüfe AI Conversation Bridge Task
  const aiBridgeTask = tasksConfig.tasks.find(task => 
    task.label && task.label.includes('AI Conversation Bridge'));
  
  if (aiBridgeTask) { 
    const autoStart = aiBridgeTask.runOptions && 
                     aiBridgeTask.runOptions.runOn === 'folderOpen';
    
    if (autoStart) { 
      console.log('✅ AI Conversation Bridge Auto-Start konfiguriert');
    } else { 
      console.warn('⚠️ AI Conversation Bridge hat keinen automatischen Start');
      extensionStatus.recommendations.push('AI Bridge Auto-Start fehlt');
    }
  } else { 
    console.warn('⚠️ Kein AI Conversation Bridge Task gefunden');
    extensionStatus.recommendations.push('AI Bridge Task fehlt');
  }
  
  // Prüfe Extension Check Task
  const extensionCheckTask = tasksConfig.tasks.find(task => 
    task.label && task.label.includes('Extension Check'));
  
  if (extensionCheckTask) { 
    const autoStart = extensionCheckTask.runOptions && 
                     extensionCheckTask.runOptions.runOn === 'folderOpen';
    
    if (autoStart) { 
      console.log('✅ Automatic Extension Check konfiguriert');
    } else { 
      console.warn('⚠️ Automatic Extension Check hat keinen automatischen Start');
      extensionStatus.recommendations.push('Extension Check Auto-Start fehlt');
    }
  }
}

/**
 * Prüft, ob die AI-Status-Tools vorhanden und korrekt konfiguriert sind
 */
function checkAIStatusTools() {
  // Prüfe, ob AI-Status-Tools existieren
  const statusToolsExist = fileExists('tools/ai-status.js') && 
                          fileExists('tools/ai-services-manager.js');
  
  if (statusToolsExist) { 
    log('✅ AI-Status-Tools vorhanden');
    
    // Prüfe, ob entsprechende Tasks existieren
    if (fileExists(path.join('.vscode', 'tasks.json'))) { 
      const tasksConfig = readJsonFile(path.join('.vscode', 'tasks.json'));
      
      if (tasksConfig && Array.isArray(tasksConfig.tasks)) { 
        const hasStatusTask = tasksConfig.tasks.some(task => 
          task.label && task.label.includes('Show AI Status'));
        
        const hasRestartTask = tasksConfig.tasks.some(task => 
          task.label && task.label.includes('Restart All AI Services'));
        
        if (!hasStatusTask) { 
          log('⚠️ Kein Task für AI-Status gefunden');
          extensionStatus.recommendations.push('AI Status Task fehlt');
        }
        
        if (!hasRestartTask) { 
          log('⚠️ Kein Task für AI-Service-Neustarts gefunden');
          extensionStatus.recommendations.push('AI Service Restart Task fehlt');
        }
      }
    }
  } else { 
    log('⚠️ AI-Status-Tools fehlen oder sind unvollständig');
    extensionStatus.recommendations.push('AI-Status-Tools fehlen oder sind unvollständig');
  }
}

/**
 * Prüft die Struktur der tasks.json und stellt sicher, dass alle kritischen Tasks korrekt konfiguriert sind
 */
function validateTasksStructure() {
  console.log('\n🔧 Prüfe tasks.json Struktur...');
  
  const tasksPath = path.join('.vscode', 'tasks.json');
  
  // Prüfe ob tasks.json existiert
  if (!fileExists(tasksPath)) { 
    console.warn('⚠️ tasks.json nicht gefunden');
    extensionStatus.recommendations.push('tasks.json für automatische Tasks fehlt');
    return false;
  }
  
  // Lese tasks.json
  const tasksConfig = readJsonFile(tasksPath);
  if (!tasksConfig || !tasksConfig.version || !Array.isArray(tasksConfig.tasks)) { 
    console.warn('⚠️ tasks.json hat kein gültiges Format');
    extensionStatus.recommendations.push('tasks.json hat kein gültiges Format');
    return false;
  }
  
  // Kritische Task-Prüfung
  const criticalTasks = [
    { name: 'Session-Saver', needsAutoStart: true },
    { name: 'AI Conversation Bridge', needsAutoStart: true },
    { name: 'Extension Check', needsAutoStart: true },
    { name: 'Show AI Status', needsAutoStart: false },
    { name: 'Restart All AI Services', needsAutoStart: false }
  ];
  
  const missingTasks = [];
  const misconfiguredTasks = [];
  
  for (const criticalTask of criticalTasks) {
    const task = tasksConfig.tasks.find(t => 
      t.label && t.label.includes(criticalTask.name));
    
    if (!task) { 
      missingTasks.push(criticalTask.name);
      continue;
    }
    
    // Prüfe auf Auto-Start wenn erforderlich
    if (criticalTask.needsAutoStart) { 
      const hasAutoStart = task.runOptions && task.runOptions.runOn === 'folderOpen';
      if (!hasAutoStart) { 
        misconfiguredTasks.push(`$${criticalTask.name} (fehlt Auto-Start)`);
      }
    }
    
    // Prüfe auf background für Session-Saver und AI Bridge
    if (criticalTask.name === 'Session-Saver' || criticalTask.name === 'AI Conversation Bridge') { 
      if (task.isBackground !== true) { 
        misconfiguredTasks.push(`$${criticalTask.name} (fehlt isBackground)`);
      }
    }
  }
  
  if (missingTasks.length > 0) { 
    console.warn(`⚠️ Fehlende kritische Tasks: ${missingTasks.join(', ')}`);
    extensionStatus.recommendations.push(`Kritische Tasks fehlen: ${missingTasks.join(', ')}`);
  }
  
  if (misconfiguredTasks.length > 0) { 
    console.warn(`⚠️ Falsch konfigurierte Tasks: ${misconfiguredTasks.join(', ')}`);
    extensionStatus.recommendations.push(`Tasks falsch konfiguriert: ${misconfiguredTasks.join(', ')}`);
  }
  
  if (missingTasks.length === 0 && misconfiguredTasks.length === 0) { 
    console.log('✅ Alle kritischen Tasks sind richtig konfiguriert');
  }
  
  return missingTasks.length === 0 && misconfiguredTasks.length === 0;
}

/**
 * Prüft die VS Code Umgebung auf bekannte Probleme und gibt Empfehlungen zur Behebung
 */
function checkEnvironment() {
  console.log('\n🔧 Überprüfe VS Code Umgebung...');
  
  // Prüfe auf veraltete Node.js Version
  const nodeVersion = process.versions.node.split('.').map(Number);
  if (nodeVersion[0] < 14) { 
    console.warn('⚠️ Veraltete Node.js Version erkannt, bitte auf die neueste LTS-Version aktualisieren');
    extensionStatus.recommendations.push('Node.js auf die neueste LTS-Version aktualisieren');
  } else { 
    console.log('✅ Node.js Version ist aktuell');
  }
  
  // Prüfe auf veraltete npm Version
  const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim().split('.').map(Number);
  if (npmVersion[0] < 6) { 
    console.warn('⚠️ Veraltete npm Version erkannt, bitte auf die neueste Version aktualisieren');
    extensionStatus.recommendations.push('npm auf die neueste Version aktualisieren');
  } else { 
    console.log('✅ npm Version ist aktuell');
  }
  
  // Prüfe auf globale vsce Installation
  try {
    execSync('vsce -v', { stdio: 'ignore' });
    console.log('✅ vsce ist global installiert');
  } catch (err) {
    console.warn('⚠️ vsce ist nicht installiert, einige Funktionen könnten eingeschränkt sein');
    extensionStatus.recommendations.push('vsce global installieren für volle Funktionalität');
  }
}

/**
 * Spezifisch die Tailwind CSS-Konfiguration prüfen
 */
function checkTailwindCSSSetup() {
  log('\n🎨 Überprüfe TailwindCSS-Konfiguration...');
  
  // Prüfe auf Tailwind CSS Extension
  try {
    const installedExtensions = execSync('code --list-extensions', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    const tailwindExtension = installedExtensions.find(ext => ext === 'bradlc.vscode-tailwindcss');
    
    if (tailwindExtension) { 
      log('✅ Tailwind CSS Extension ist installiert');
    } else { 
      log('⚠️ Tailwind CSS Extension ist nicht installiert');
      extensionStatus.issues.push('bradlc.vscode-tailwindcss');
    }
  } catch (err) {
    log(`❌ Fehler beim Prüfen der Tailwind CSS Extension: $${err.message}`);
  }
  
  // Prüfe package.json auf Tailwind CSS Version
  try {
    if (fileExists('package.json')) { 
      const packageJsonContent = fs.readFileSync('package.json', 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      
      if (packageJson.devDependencies && packageJson.devDependencies.tailwindcss) { 
        const tailwindVersion = packageJson.devDependencies.tailwindcss;
        log(`✅ Tailwind CSS Version: $${tailwindVersion}`);
        
        // Extrahiere nur die Versionsnummer ohne das ^ oder ~
        const versionNumber = tailwindVersion.replace(/[\^~]/, '');
        
        // Überprüfe, ob die Version aktuell genug ist
        if (versionNumber === "4.1.10") { 
          log('✅ Tailwind CSS ist auf der neuesten Version (4.1.10)');
        } else { 
          log(`⚠️ Tailwind CSS sollte auf Version 4.1.10 aktualisiert werden (aktuell: $${versionNumber})`);
          extensionStatus.recommendations.push(`Tailwind CSS von $${versionNumber} auf 4.1.10 aktualisieren`);
        }
      } else { 
        log('⚠️ Tailwind CSS ist nicht in package.json definiert');
        extensionStatus.recommendations.push('Tailwind CSS fehlt in package.json');
      }
    } else { 
      log('⚠️ package.json nicht gefunden');
    }
  } catch (err) {
    log(`❌ Fehler beim Prüfen der Tailwind CSS Version: $${err.message}`);
  }
  
  // Prüfe settings.json auf Tailwind CSS Konfiguration
  const settings = readJsonFile(SETTINGS_PATH);
  if (settings) { 
    if (settings['tailwindCSS.includeLanguages']) { 
      log('✅ Tailwind CSS Sprachunterstützung konfiguriert');
    } else { 
      log('⚠️ Tailwind CSS Sprachunterstützung fehlt in settings.json');
      extensionStatus.recommendations.push('Tailwind CSS Sprachunterstützung in settings.json konfigurieren');
    }
    
    if (settings['tailwindCSS.experimental.classRegex']) { 
      log('✅ Tailwind CSS Class-Regex konfiguriert');
    }
  }
  
  // Prüfe auf tailwind.config.js
  if (fileExists('tailwind.config.js')) { 
    log('✅ tailwind.config.js gefunden');
  } else { 
    log('⚠️ tailwind.config.js nicht gefunden');
    extensionStatus.recommendations.push('tailwind.config.js erstellen');
  }
}

// Führe die Hauptfunktion mit Fehlerbehandlung aus
let result;
try {
  console.log('Starte Extension Health Check...');
  result = checkExtensionStatus();
  console.log('Extension Health Check abgeschlossen.');
} catch (error) {
  console.error('💥 FEHLER beim Ausführen des Extension Health Checks:', error);
  console.error(error.stack);
  result = { 
    healthy: 0, 
    issues: 1, 
    recommendations: 0,
    error: error.message
  };
}

// Exportiere für andere Module
module.exports = {
  status: result,
  details: extensionStatus
};
