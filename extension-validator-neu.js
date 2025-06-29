/**
 * Extension Function Validator
 * Prüft die installierten VS Code Extensions auf Funktionalität und Kompatibilität
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Pfad für die Log-Datei
const LOG_FILE = 'extension-validator.log';

// Pfade für Konfigurationsdateien
const SETTINGS_PATH = path.join('.vscode', 'settings.json');
const EXTENSIONS_PATH = path.join('.vscode', 'extensions.json');
const TASKS_PATH = path.join('.vscode', 'tasks.json');

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
  'ms-playwright.playwright',
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
  'tools/ai-services-manager.js',
];

// Status-Tracking
const extensionStatus = {
  healthy: [],
  issues: [],
  recommendations: [],
};

// Lösche alte Log-Datei falls vorhanden
try {
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }
} catch (err) {
  console.error(`Konnte alte Log-Datei nicht löschen: ${err.message}`);
}

/**
 * Logge in Konsole und Datei
 */
function log(message) {
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
  } catch (err) {
    console.error(`Konnte nicht in Log-Datei schreiben: ${err.message}`);
  }
}

log('🚀 Extension Function Validator wird gestartet...');

/**
 * Prüft, ob eine Datei existiert
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    log(`Fehler beim Prüfen, ob Datei existiert (${filePath}): ${err.message}`);
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
    log(`Fehler beim Lesen von ${filePath}: ${err.message}`);
    return null;
  }
}

/**
 * Prüft den Status der VS Code Extensions
 */
function checkExtensionStatus() {
  log('🔍 Prüfe installierte VS Code Extensions...');

  try {
    // Prüfe, ob settings.json existiert
    if (!fileExists(SETTINGS_PATH)) {
      log('⚠️ Keine settings.json gefunden, erstelle Standard-Konfiguration');
      createDefaultSettings();
    }

    // Prüfe, ob extensions.json existiert
    if (!fileExists(EXTENSIONS_PATH)) {
      log('⚠️ Keine extensions.json gefunden, erstelle Standard-Konfiguration');
      createDefaultExtensionsRecommendations();
    }

    // Prüfe kritische Extensions
    try {
      const installedExtensions = execSync('code --list-extensions', { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);

      log(`✅ Gefunden: ${installedExtensions.length} installierte Extensions`);

      for (const ext of CRITICAL_EXTENSIONS) {
        if (installedExtensions.includes(ext)) {
          extensionStatus.healthy.push(ext);
        } else {
          extensionStatus.issues.push(ext);
          log(`⚠️ Kritische Extension nicht installiert: ${ext}`);
        }
      }

      // Prüfe auf Konflikte und redundante Extensions
      checkForExtensionConflicts(installedExtensions);
    } catch (err) {
      log(`❌ Fehler beim Prüfen der installierten Extensions: ${err.message}`);
    }

    // Prüfe settings.json auf korrekte Konfiguration
    checkSettingsConfiguration();

    // Prüfe tasks.json Struktur
    validateTasksStructure();

    // Prüfe KI-Integration
    checkAIIntegration();

    // Prüfe VS Code Umgebung
    checkEnvironment();

    // Ausgabe des Ergebnisses
    log('\n📊 Extension Health Check Ergebnis:');
    log(`✅ Gesunde Extensions: ${extensionStatus.healthy.length}`);
    log(`⚠️ Extensions mit Problemen: ${extensionStatus.issues.length}`);
    log(`💡 Empfehlungen: ${extensionStatus.recommendations.length}`);

    if (extensionStatus.issues.length === 0) {
      log('🎉 Alle kritischen Extensions sind korrekt installiert und konfiguriert!');
    } else {
      log('\n⚠️ Es wurden Probleme gefunden die behoben werden sollten:');
      extensionStatus.issues.forEach((issue) => {
        log(`  - Fehlende kritische Extension: ${issue}`);
      });

      log('\nFühren Sie folgende Befehle aus, um fehlende Extensions zu installieren:');
      extensionStatus.issues.forEach((issue) => {
        log(`  code --install-extension ${issue}`);
      });
    }

    if (extensionStatus.recommendations.length > 0) {
      log('\n💡 Empfehlungen zur Optimierung:');
      extensionStatus.recommendations.forEach((recommendation) => {
        log(`  - ${recommendation}`);
      });
    }

    return {
      healthy: extensionStatus.healthy.length,
      issues: extensionStatus.issues.length,
      recommendations: extensionStatus.recommendations.length,
    };
  } catch (error) {
    log(`❌ Unerwarteter Fehler bei der Ausführung des Extension Health Checks: ${error.message}`);
    return {
      healthy: 0,
      issues: 1,
      recommendations: 0,
      error: error.message,
    };
  }
}

/**
 * Prüft auf Konflikte und redundante Extensions
 */
function checkForExtensionConflicts(installedExtensions) {
  // Prüfe auf bekannte Konflikte und redundante Extensions
  const formatters = installedExtensions.filter(
    (ext) => ext.includes('prettier') || ext.includes('formatter') || ext.includes('beautify'),
  );

  if (formatters.length > 2) {
    log('⚠️ Mehrere Formatter-Extensions installiert, dies kann zu Konflikten führen');
    extensionStatus.recommendations.push('Reduzieren Sie die Anzahl der Formatter-Extensions');
  }

  const linters = installedExtensions.filter(
    (ext) => ext.includes('lint') || ext.includes('eslint') || ext.includes('tslint'),
  );

  if (linters.length > 2) {
    log('⚠️ Mehrere Linter-Extensions installiert, dies kann zu Konflikten führen');
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
    'tailwindCSS.includeLanguages': {
      html: 'html',
      javascript: 'javascript',
      css: 'css',
    },
    'prettier.enable': true,
    'prettier.singleQuote': true,
    'prettier.semi': true,
    'prettier.tabWidth': 2,
    'liveServer.settings.donotShowInfoMsg': true,
    'accessibility.focusVisible': true,
    'git.enableSmartCommit': true,
    'git.autofetch': true,
    'extensions.autoUpdate': true,
  };

  try {
    if (!fs.existsSync('.vscode')) {
      fs.mkdirSync('.vscode');
    }
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));
    log('✅ Standard-settings.json erstellt');
  } catch (err) {
    log(`❌ Fehler beim Erstellen der settings.json: ${err.message}`);
  }
}

/**
 * Erstellt eine Standard-extensions.json, falls keine existiert
 */
function createDefaultExtensionsRecommendations() {
  const defaultExtensions = {
    recommendations: [
      'bradlc.vscode-tailwindcss',
      'esbenp.prettier-vscode',
      'dbaeumer.vscode-eslint',
      'html-validate.vscode-html-validate',
      'maxvanderschee.web-accessibility',
      'ritwickdey.liveserver',
      'eamodio.gitlens',
      'github.copilot',
      'ms-playwright.playwright',
    ],
  };

  try {
    if (!fs.existsSync('.vscode')) {
      fs.mkdirSync('.vscode');
    }
    fs.writeFileSync(EXTENSIONS_PATH, JSON.stringify(defaultExtensions, null, 2));
    log('✅ Standard-extensions.json erstellt');
  } catch (err) {
    log(`❌ Fehler beim Erstellen der extensions.json: ${err.message}`);
  }
}

/**
 * Prüft, ob die KI-Integration aktiv und vollständig ist
 */
function checkAIIntegration() {
  log('\n🧠 Prüfe KI-Integration...');

  // Prüfe auf fehlende KI-Integrationsdateien
  const missingFiles = AI_INTEGRATION_FILES.filter((file) => !fileExists(file));

  if (missingFiles.length > 0) {
    log(`⚠️ Fehlende KI-Integrationsdateien: ${missingFiles.join(', ')}`);
    extensionStatus.recommendations.push('KI-Integration ist unvollständig');
  } else {
    log('✅ KI-Integrationsdateien vollständig');

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
  if (!fileExists(TASKS_PATH)) {
    log('⚠️ Keine tasks.json gefunden');
    extensionStatus.recommendations.push('tasks.json fehlt für KI-Auto-Start');
    return;
  }

  const tasksConfig = readJsonFile(TASKS_PATH);
  if (!tasksConfig || !Array.isArray(tasksConfig.tasks)) {
    log('⚠️ tasks.json hat kein gültiges Format');
    extensionStatus.recommendations.push('tasks.json hat kein gültiges Format');
    return;
  }

  // Prüfe Session-Saver Task
  const sessionSaverTask = tasksConfig.tasks.find(
    (task) => task.label && task.label.includes('Session-Saver'),
  );

  if (sessionSaverTask) {
    const autoStart =
      sessionSaverTask.runOptions && sessionSaverTask.runOptions.runOn === 'folderOpen';

    if (autoStart) {
      log('✅ Session-Saver Auto-Start konfiguriert');
    } else {
      log('⚠️ Session-Saver hat keinen automatischen Start');
      extensionStatus.recommendations.push('Session-Saver Auto-Start fehlt');
    }
  } else {
    log('⚠️ Kein Session-Saver Task gefunden');
    extensionStatus.recommendations.push('Session-Saver Task fehlt');
  }

  // Prüfe AI Conversation Bridge Task
  const aiBridgeTask = tasksConfig.tasks.find(
    (task) => task.label && task.label.includes('AI Conversation Bridge'),
  );

  if (aiBridgeTask) {
    const autoStart = aiBridgeTask.runOptions && aiBridgeTask.runOptions.runOn === 'folderOpen';

    if (autoStart) {
      log('✅ AI Conversation Bridge Auto-Start konfiguriert');
    } else {
      log('⚠️ AI Conversation Bridge hat keinen automatischen Start');
      extensionStatus.recommendations.push('AI Bridge Auto-Start fehlt');
    }
  } else {
    log('⚠️ Kein AI Conversation Bridge Task gefunden');
    extensionStatus.recommendations.push('AI Bridge Task fehlt');
  }

  // Prüfe Extension Check Task
  const extensionCheckTask = tasksConfig.tasks.find(
    (task) => task.label && task.label.includes('Extension Check'),
  );

  if (extensionCheckTask) {
    const autoStart =
      extensionCheckTask.runOptions && extensionCheckTask.runOptions.runOn === 'folderOpen';

    if (autoStart) {
      log('✅ Automatic Extension Check konfiguriert');
    } else {
      log('⚠️ Automatic Extension Check hat keinen automatischen Start');
      extensionStatus.recommendations.push('Extension Check Auto-Start fehlt');
    }
  }
}

/**
 * Prüft, ob die AI-Status-Tools vorhanden und korrekt konfiguriert sind
 */
function checkAIStatusTools() {
  // Prüfe, ob AI-Status-Tools existieren
  const statusToolsExist =
    fileExists('tools/ai-status.js') && fileExists('tools/ai-services-manager.js');

  if (statusToolsExist) {
    log('✅ AI-Status-Tools vorhanden');

    // Prüfe, ob entsprechende Tasks existieren
    if (fileExists(TASKS_PATH)) {
      const tasksConfig = readJsonFile(TASKS_PATH);

      if (tasksConfig && Array.isArray(tasksConfig.tasks)) {
        const hasStatusTask = tasksConfig.tasks.some(
          (task) => task.label && task.label.includes('Show AI Status'),
        );

        const hasRestartTask = tasksConfig.tasks.some(
          (task) => task.label && task.label.includes('Restart All AI Services'),
        );

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
  log('\n🔧 Prüfe tasks.json Struktur...');

  // Prüfe ob tasks.json existiert
  if (!fileExists(TASKS_PATH)) {
    log('⚠️ tasks.json nicht gefunden');
    extensionStatus.recommendations.push('tasks.json für automatische Tasks fehlt');
    return false;
  }

  // Lese tasks.json
  const tasksConfig = readJsonFile(TASKS_PATH);
  if (!tasksConfig || !tasksConfig.version || !Array.isArray(tasksConfig.tasks)) {
    log('⚠️ tasks.json hat kein gültiges Format');
    extensionStatus.recommendations.push('tasks.json hat kein gültiges Format');
    return false;
  }

  // Kritische Task-Prüfung
  const criticalTasks = [
    { name: 'Session-Saver', needsAutoStart: true },
    { name: 'AI Conversation Bridge', needsAutoStart: true },
    { name: 'Extension Check', needsAutoStart: true },
    { name: 'Show AI Status', needsAutoStart: false },
    { name: 'Restart All AI Services', needsAutoStart: false },
  ];

  const missingTasks = [];
  const misconfiguredTasks = [];

  for (const criticalTask of criticalTasks) {
    const task = tasksConfig.tasks.find((t) => t.label && t.label.includes(criticalTask.name));

    if (!task) {
      missingTasks.push(criticalTask.name);
      continue;
    }

    // Prüfe auf Auto-Start wenn erforderlich
    if (criticalTask.needsAutoStart) {
      const hasAutoStart = task.runOptions && task.runOptions.runOn === 'folderOpen';
      if (!hasAutoStart) {
        misconfiguredTasks.push(`${criticalTask.name} (fehlt Auto-Start)`);
      }
    }

    // Prüfe auf background für Session-Saver und AI Bridge
    if (criticalTask.name === 'Session-Saver' || criticalTask.name === 'AI Conversation Bridge') {
      if (task.isBackground !== true) {
        misconfiguredTasks.push(`${criticalTask.name} (fehlt isBackground)`);
      }
    }
  }

  if (missingTasks.length > 0) {
    log(`⚠️ Fehlende kritische Tasks: ${missingTasks.join(', ')}`);
    extensionStatus.recommendations.push(`Kritische Tasks fehlen: ${missingTasks.join(', ')}`);
  }

  if (misconfiguredTasks.length > 0) {
    log(`⚠️ Falsch konfigurierte Tasks: ${misconfiguredTasks.join(', ')}`);
    extensionStatus.recommendations.push(
      `Tasks falsch konfiguriert: ${misconfiguredTasks.join(', ')}`,
    );
  }

  if (missingTasks.length === 0 && misconfiguredTasks.length === 0) {
    log('✅ Alle kritischen Tasks sind richtig konfiguriert');
  }

  return missingTasks.length === 0 && misconfiguredTasks.length === 0;
}

/**
 * Prüft die VS Code Umgebung auf bekannte Probleme und gibt Empfehlungen zur Behebung
 */
function checkEnvironment() {
  log('\n🔧 Überprüfe VS Code Umgebung...');

  try {
    // Prüfe auf veraltete Node.js Version
    const nodeVersion = process.versions.node.split('.').map(Number);
    if (nodeVersion[0] < 14) {
      log('⚠️ Veraltete Node.js Version erkannt, bitte auf die neueste LTS-Version aktualisieren');
      extensionStatus.recommendations.push('Node.js auf die neueste LTS-Version aktualisieren');
    } else {
      log('✅ Node.js Version ist aktuell');
    }

    // Prüfe auf veraltete npm Version
    try {
      const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim().split('.').map(Number);
      if (npmVersion[0] < 6) {
        log('⚠️ Veraltete npm Version erkannt, bitte auf die neueste Version aktualisieren');
        extensionStatus.recommendations.push('npm auf die neueste Version aktualisieren');
      } else {
        log('✅ npm Version ist aktuell');
      }
    } catch (err) {
      log(`⚠️ Konnte npm-Version nicht prüfen: ${err.message}`);
    }

    // Prüfe auf globale vsce Installation
    try {
      execSync('vsce -v', { stdio: 'ignore' });
      log('✅ vsce ist global installiert');
    } catch (err) {
      log('⚠️ vsce ist nicht installiert, einige Funktionen könnten eingeschränkt sein');
      extensionStatus.recommendations.push('vsce global installieren für volle Funktionalität');
    }
  } catch (err) {
    log(`⚠️ Fehler bei der Umgebungsprüfung: ${err.message}`);
  }
}

// Führe die Hauptfunktion mit Fehlerbehandlung aus
let result;
try {
  log('Starte Extension Health Check...');
  result = checkExtensionStatus();
  log('Extension Health Check abgeschlossen.');
  log(`Einen ausführlichen Bericht finden Sie in der Datei: ${LOG_FILE}`);
} catch (error) {
  log(`💥 FEHLER beim Ausführen des Extension Health Checks: ${error.message}`);
  log(error.stack);
  result = {
    healthy: 0,
    issues: 1,
    recommendations: 0,
    error: error.message,
  };
}

// Exportiere für andere Module
module.exports = {
  status: result,
  details: extensionStatus,
};
