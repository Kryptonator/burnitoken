/**
 * Advanced Extension Manager
 * Optimiert und konfiguriert VS Code Extensions für optimale Performance und Funktionalität
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const validator = require('./extension-function-validator');

// Pfade für Konfigurationsdateien
const SETTINGS_PATH = path.join('.vscode', 'settings.json');
const EXTENSIONS_PATH = path.join('.vscode', 'extensions.json');

// Optimale Konfigurationen für Extensions
const OPTIMAL_SETTINGS = {
  // Tailwind CSS Optimierungen
  'tailwindCSS.includeLanguages': {
    html: 'html',
    javascript: 'javascript',
    css: 'css',
  },
  'tailwindCSS.experimental.classRegex': ['class="([^"]*)', 'className="([^"]*)'],

  // Prettier Optimierungen
  'prettier.enable': true,
  'prettier.singleQuote': true,
  'prettier.semi': true,
  'prettier.tabWidth': 2,
  'prettier.requireConfig': false,

  // LiveServer Optimierungen
  'liveServer.settings.donotShowInfoMsg': true,
  'liveServer.settings.donotVerifyTags': true,
  'liveServer.settings.port': 5500,

  // HTML Validierung
  'html.validate.scripts': true,
  'html.validate.styles': true,
  'css.validate': true,

  // Barrierefreiheit
  'accessibility.focusVisible': true,
  'accessibility.reduceMotion': 'auto',

  // Git Integration
  'git.enableSmartCommit': true,
  'git.autofetch': true,
  'git.confirmSync': false,

  // GitHub Copilot
  'github.copilot.enable': {
    '*': true,
    yaml: true,
    plaintext: false,
    markdown: true,
  },

  // Markdown
  'markdown.preview.fontSize': 14,
  'markdown.preview.lineHeight': 1.6,

  // System Performance
  'extensions.autoUpdate': true,
  'files.watcherExclude': {
    '**/node_modules/**': true,
    '**/.git/objects/**': true,
    '**/.git/subtree-cache/**': true,
  },

  // Tasks
  'task.allowAutomaticTasks': 'on',
};

// Empfohlene Extensions
const RECOMMENDED_EXTENSIONS = [
  'bradlc.vscode-tailwindcss',
  'esbenp.prettier-vscode',
  'dbaeumer.vscode-eslint',
  'html-validate.vscode-html-validate',
  'maxvanderschee.web-accessibility',
  'ritwickdey.liveserver',
  'eamodio.gitlens',
  'github.copilot',
  'github.copilot-chat',
  'ms-playwright.playwright',
  'github.vscode-pull-request-github',
  'pkief.material-icon-theme',
  'redhat.vscode-yaml',
];

/**
 * Liest eine JSON-Datei
 */
function readJsonFile(filePath) {
  try {
    if (fs.existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    console.error(`Fehler beim Lesen von ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Schreibt eine JSON-Datei
 */
function writeJsonFile(filePath, data) {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Fehler beim Schreiben von ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Optimiert die VS Code Einstellungen
 */
function optimizeSettings() {
  console.log('🔧 Optimiere VS Code Einstellungen...');

  const currentSettings = readJsonFile(SETTINGS_PATH) || {};
  const updatedSettings = { ...currentSettings };

  // Füge optimale Einstellungen hinzu, ohne bestehende zu überschreiben, außer sie sind suboptimal
  Object.keys(OPTIMAL_SETTINGS).forEach((key) => {
    if (
      !updatedSettings[key] ||
      (key === 'extensions.autoUpdate' && updatedSettings[key] === false) ||
      (key === 'accessibility.focusVisible' && updatedSettings[key] === false)
    ) {
      updatedSettings[key] = OPTIMAL_SETTINGS[key];
    }
  });

  // Schreibe aktualisierte Einstellungen
  if (writeJsonFile(SETTINGS_PATH, updatedSettings)) {
    console.log('✅ VS Code Einstellungen optimiert');
  }
}

/**
 * Aktualisiert die empfohlenen Extensions
 */
function updateExtensionRecommendations() {
  console.log('📋 Aktualisiere Extension-Empfehlungen...');

  const currentExtensions = readJsonFile(EXTENSIONS_PATH) || { recommendations: [] };

  // Füge fehlende Empfehlungen hinzu
  const updatedRecommendations = [
    ...new Set([...(currentExtensions.recommendations || []), ...RECOMMENDED_EXTENSIONS]),
  ];

  const updatedExtensions = {
    ...currentExtensions,
    recommendations: updatedRecommendations,
  };

  if (writeJsonFile(EXTENSIONS_PATH, updatedExtensions)) {
    console.log('✅ Extension-Empfehlungen aktualisiert');
  }
}

/**
 * Installiert fehlende kritische Extensions
 */
function installMissingExtensions() {
  console.log('🔍 Prüfe auf fehlende kritische Extensions...');

  if (validator.status.issues > 0) {
    const installedExtensions = execSync('code --list-extensions', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);

    const missingExtensions = RECOMMENDED_EXTENSIONS.filter(
      (ext) => !installedExtensions.includes(ext),
    );

    if (missingExtensions.length > 0) {
      console.log(`⚠️ ${missingExtensions.length} kritische Extensions fehlen`);

      missingExtensions.forEach((ext) => {
        try {
          console.log(`📦 Versuche Installation: ${ext}`);
          // Führe Installation im Hintergrund aus, sofort zum nächsten fortfahren
          execSync(`code --install-extension ${ext} --force`, { stdio: 'ignore' });
        } catch (error) {
          // Logge den Fehler und fahre fort
          console.warn(`⚠️ Konnte Extension nicht automatisch installieren: ${ext}`);
          console.warn(`   Grund: ${error.message || 'Unbekannter Fehler'}`);
        }
      });

      console.log('✅ Installation fehlender Extensions versucht');
    } else {
      console.log('✅ Keine fehlenden Extensions gefunden');
    }
  } else {
    console.log('✅ Alle kritischen Extensions sind bereits installiert');
  }
}

/**
 * Hauptfunktion zur Optimierung von Extensions
 */
function optimizeExtensions() {
  console.log('🚀 Starte Extension-Optimierung...');

  // Optimiere Einstellungen
  optimizeSettings();

  // Aktualisiere Empfehlungen
  updateExtensionRecommendations();

  // Installiere fehlende Extensions
  installMissingExtensions();

  console.log('🎉 Extension-Optimierung abgeschlossen!');
}

// Führe die Optimierungsfunktion aus
optimizeExtensions();
