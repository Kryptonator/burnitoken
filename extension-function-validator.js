/**
 * Extension Function Validator
 * Prüft die installierten VS Code Extensions auf Funktionalität und Kompatibilität
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  'tools/model-switch.js'
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
    console.error(`Fehler beim Lesen von ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Prüft den Status der VS Code Extensions
 */
function checkExtensionStatus() {
  console.log('🔍 Prüfe installierten VS Code Extensions...');

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
    
    console.log(`✅ Gefunden: ${installedExtensions.length} installierte Extensions`);
    
    for (const ext of CRITICAL_EXTENSIONS) {
      if (installedExtensions.includes(ext)) {
        extensionStatus.healthy.push(ext);
      } else {
        extensionStatus.issues.push(ext);
        console.warn(`⚠️ Kritische Extension nicht installiert: ${ext}`);
      }
    }
  } catch (err) {
    console.error('❌ Fehler beim Prüfen der installierten Extensions:', err.message);
  }

  // Prüfe settings.json auf korrekte Konfiguration
  checkSettingsConfiguration();

  // Prüfe KI-Integration
  checkAIIntegration();

  // Ausgabe des Ergebnisses
  console.log('\n📊 Extension Health Check Ergebnis:');
  console.log(`✅ Gesunde Extensions: ${extensionStatus.healthy.length}`);
  console.log(`⚠️ Extensions mit Problemen: ${extensionStatus.issues.length}`);
  console.log(`💡 Empfehlungen: ${extensionStatus.recommendations.length}`);
  
  if (extensionStatus.issues.length === 0) {
    console.log('🎉 Alle kritischen Extensions sind korrekt installiert und konfiguriert!');
  }

  return {
    healthy: extensionStatus.healthy.length,
    issues: extensionStatus.issues.length,
    recommendations: extensionStatus.recommendations.length
  };
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
function checkAIIntegration() {
  console.log('\n🧠 Prüfe KI-Integration...');
  
  let missingFiles = [];
  
  // Prüfe, ob alle benötigten KI-Dateien vorhanden sind
  for (const file of AI_INTEGRATION_FILES) {
    if (!fileExists(file)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.warn(`⚠️ Fehlende KI-Integrationsdateien: ${missingFiles.join(', ')}`);
    extensionStatus.recommendations.push('KI-Integration ist unvollständig');
  } else {
    console.log('✅ KI-Integrationsdateien vollständig');
    
    // Prüfe Tasks für automatischen Start
    const tasksPath = path.join('.vscode', 'tasks.json');
    if (fileExists(tasksPath)) {
      const tasksConfig = readJsonFile(tasksPath);
      
      if (tasksConfig) {
        const hasSessionSaverTask = tasksConfig.tasks.some(task => 
          task.label?.includes('Session-Saver') && task.runOptions?.runOn === 'folderOpen');
        
        const hasAIBridgeTask = tasksConfig.tasks.some(task => 
          task.label?.includes('AI Conversation Bridge') && task.runOptions?.runOn === 'folderOpen');
        
        if (hasSessionSaverTask) {
          console.log('✅ Session-Saver Auto-Start konfiguriert');
        } else {
          console.warn('⚠️ Session-Saver hat keinen automatischen Start');
          extensionStatus.recommendations.push('Session-Saver Auto-Start fehlt');
        }
        
        if (hasAIBridgeTask) {
          console.log('✅ AI Conversation Bridge Auto-Start konfiguriert');
        } else {
          console.warn('⚠️ AI Conversation Bridge hat keinen automatischen Start');
          extensionStatus.recommendations.push('AI Bridge Auto-Start fehlt');
        }
      }
    }
  }
}

// Führe die Hauptfunktion aus
const result = checkExtensionStatus();

// Exportiere für andere Module
module.exports = {
  status: result,
  details: extensionStatus
};
