/**
 * Extension Function Validator mit Datei-Logging
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const logFile = 'extension-validator.log';

// Log-Funktion, die sowohl in die Konsole als auch in die Datei schreibt


// Lösche alte Log-Datei
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
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
 * Hauptfunktion zum Prüfen des Extension-Status
 */
function checkExtensionStatus() {
  log('🔍 Prüfe installierte VS Code Extensions...');

  try {
    // Prüfe, ob settings.json existiert
    if (!fileExists(SETTINGS_PATH)) {
      log('⚠️ Keine settings.json gefunden');
    }

    // Prüfe, ob extensions.json existiert
    if (!fileExists(EXTENSIONS_PATH)) {
      log('⚠️ Keine extensions.json gefunden');
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
    } catch (err) {
      log(`❌ Fehler beim Prüfen der installierten Extensions: ${err.message}`);
    }

    // Prüfe KI-Integration
    const missingFiles = AI_INTEGRATION_FILES.filter((file) => !fileExists(file));
    if (missingFiles.length > 0) {
      log(`⚠️ Fehlende KI-Integrationsdateien: ${missingFiles.join(', ')}`);
      extensionStatus.recommendations.push('KI-Integration ist unvollständig');
    } else {
      log('✅ KI-Integrationsdateien vollständig');
    }

    // Ausgabe des Ergebnisses
    log('\n📊 Extension Health Check Ergebnis:');
    log(`✅ Gesunde Extensions: ${extensionStatus.healthy.length}`);
    log(`⚠️ Extensions mit Problemen: ${extensionStatus.issues.length}`);
    log(`💡 Empfehlungen: ${extensionStatus.recommendations.length}`);

    log('Health Check abgeschlossen!');

    return {
      healthy: extensionStatus.healthy.length,
      issues: extensionStatus.issues.length,
      recommendations: extensionStatus.recommendations.length,
    };
  } catch (error) {
    log(`❌ Unerwarteter Fehler: ${error.message}`);
    log(error.stack);
    return {
      healthy: 0,
      issues: 1,
      recommendations: 0,
    };
  }
}

// Führe die Hauptfunktion aus
try {
  const result = checkExtensionStatus();
  log(`Ergebnis: ${JSON.stringify(result)}`);
} catch (error) {
  log(`Kritischer Fehler: ${error.message}`);
  log(error.stack);
}

log('Extension Validator beendet.');
