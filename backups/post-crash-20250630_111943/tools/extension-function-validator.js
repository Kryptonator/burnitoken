/**
 * EXTENSION FUNCTION VALIDATOR
 *
 * Dieses Skript prüft den Status und die Funktionalität von VS Code Extensions
 * und gibt detaillierte Informationen über deren Zustand zurück.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createTodo } = require('./todo-manager');

// Farben für die Konsolenausgabe
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

// Konfiguration der zu prüfenden Extensions
const EXTENSIONS = {
  'session-saver': {
    id: 'nicoespeon.session-saver',
    name: 'Session Saver',
    requiredFiles: ['.vscode/session-saver.json'],
    checkFunction: checkSessionSaver,
  },
  'ai-conversation-bridge': {
    id: 'ai-conversation-bridge',
    name: 'AI Conversation Bridge',
    requiredFiles: ['.vscode/ai-conversation-settings.json'],
    checkFunction: checkAIConversationBridge,
  },
  gitlens: {
    id: 'eamodio.gitlens',
    name: 'GitLens',
    checkFunction: checkGitLens,
  },
  'live-server': {
    id: 'ritwickdey.liveserver',
    name: 'Live Server',
    checkFunction: checkLiveServer,
  },
  'tailwindcss-intellisense': {
    id: 'bradlc.vscode-tailwindcss',
    name: 'Tailwind CSS IntelliSense',
    requiredFiles: ['tailwind.config.js'],
    checkFunction: checkTailwindIntellisense,
  },
  'thunder-client': {
    id: 'rangav.vscode-thunder-client',
    name: 'Thunder Client',
    requiredFiles: ['.vscode/thunder-client'],
    checkFunction: checkThunderClient,
  },
  'web-accessibility': {
    id: 'deque-systems.vscode-axe-linter',
    name: 'Web Accessibility',
    checkFunction: checkWebAccessibility,
  },
};

/**
 * Prüft den Zustand der Session Saver Extension
 * @returns {Object} Status-Objekt
 */
function checkSessionSaver() {
  try {
    const configPath = path.join(process.cwd(), '.vscode', 'session-saver.json');

    if (!fs.existsSync(configPath)) {
      return {
        status: 'FEHLER',
        message: 'Konfigurationsdatei nicht gefunden',
      };
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!config.autoSave) {
      return {
        status: 'WARNUNG',
        message: 'Auto-Save ist deaktiviert',
      };
    }

    return {
      status: 'OK',
      message: 'Session Saver ist korrekt konfiguriert',
    };
  } catch (error) {
    return {
      status: 'FEHLER',
      message: `Fehler beim Prüfen: ${error.message}`,
    };
  }
}

/**
 * Prüft den Zustand der AI Conversation Bridge
 * @returns {Object} Status-Objekt
 */
function checkAIConversationBridge() {
  try {
    const configPath = path.join(process.cwd(), '.vscode', 'ai-conversation-settings.json');

    if (!fs.existsSync(configPath)) {
      return {
        status: 'FEHLER',
        message: 'Konfigurationsdatei nicht gefunden',
      };
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (!config.enabled) {
        return {
          status: 'WARNUNG',
          message: 'AI Conversation Bridge ist deaktiviert',
        };
      }

      return {
        status: 'OK',
        message: 'AI Conversation Bridge ist korrekt konfiguriert',
      };
    } catch (jsonError) {
      return {
        status: 'FEHLER',
        message: `Ungültige Konfigurationsdatei: ${jsonError.message}`,
      };
    }
  } catch (error) {
    return {
      status: 'FEHLER',
      message: `Fehler beim Prüfen: ${error.message}`,
    };
  }
}

/**
 * Prüft den Zustand der GitLens Extension
 * @returns {Object} Status-Objekt
 */
function checkGitLens() {
  try {
    // Prüfe Git-Repository
    try {
      execSync('git status', { stdio: 'pipe' });
    } catch (gitError) {
      return {
        status: 'WARNUNG',
        message: 'Kein gültiges Git-Repository gefunden',
      };
    }

    const configPath = path.join(process.cwd(), '.vscode', 'settings.json');

    if (fs.existsSync(configPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Prüfe GitLens-Einstellungen
        const gitLensKeys = Object.keys(settings).filter((key) => key.startsWith('gitlens.'));

        if (gitLensKeys.length === 0) {
          return {
            status: 'OK',
            message: 'GitLens verwendet Standardeinstellungen',
          };
        }

        return {
          status: 'OK',
          message: `GitLens mit ${gitLensKeys.length} angepassten Einstellungen`,
        };
      } catch (jsonError) {
        return {
          status: 'WARNUNG',
          message: `Konnte VS Code Einstellungen nicht lesen: ${jsonError.message}`,
        };
      }
    }

    return {
      status: 'OK',
      message: 'GitLens verwendet Standardeinstellungen',
    };
  } catch (error) {
    return {
      status: 'FEHLER',
      message: `Fehler beim Prüfen: ${error.message}`,
    };
  }
}

/**
 * Prüft den Zustand der Live Server Extension
 * @returns {Object} Status-Objekt
 */
function checkLiveServer() {
  try {
    const configPath = path.join(process.cwd(), '.vscode', 'settings.json');

    if (fs.existsSync(configPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        const port = settings['liveServer.settings.port'];
        const browser = settings['liveServer.settings.CustomBrowser'];

        let message = 'Live Server ist einsatzbereit';

        if (port) {
          message += ` (Port: ${port})`;
        }

        if (browser) {
          message += ` (Browser: ${browser})`;
        }

        return {
          status: 'OK',
          message,
        };
      } catch (jsonError) {
        return {
          status: 'WARNUNG',
          message: `Konnte VS Code Einstellungen nicht lesen: ${jsonError.message}`,
        };
      }
    }

    return {
      status: 'OK',
      message: 'Live Server verwendet Standardeinstellungen',
    };
  } catch (error) {
    return {
      status: 'FEHLER',
      message: `Fehler beim Prüfen: ${error.message}`,
    };
  }
}

/**
 * Prüft den Zustand der Tailwind CSS IntelliSense Extension
 * @returns {Object} Status-Objekt
 */
function checkTailwindIntellisense() {
  try {
    const configPath = path.join(process.cwd(), 'tailwind.config.js');

    if (!fs.existsSync(configPath)) {
      return {
        status: 'WARNUNG',
        message: 'Keine Tailwind-Konfigurationsdatei gefunden',
      };
    }

    const configContent = fs.readFileSync(configPath, 'utf8');

    if (!configContent.includes('module.exports')) {
      return {
        status: 'FEHLER',
        message: 'Ungültige Tailwind-Konfiguration',
      };
    }

    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        if (!packageJson.dependencies?.tailwindcss && !packageJson.devDependencies?.tailwindcss) {
          return {
            status: 'WARNUNG',
            message: 'Tailwind CSS ist nicht als Abhängigkeit installiert',
          };
        }
      } catch (jsonError) {
        // Ignorieren, falls package.json nicht gelesen werden kann
      }
    }

    return {
      status: 'OK',
      message: 'Tailwind CSS IntelliSense ist korrekt konfiguriert',
    };
  } catch (error) {
    return {
      status: 'FEHLER',
      message: `Fehler beim Prüfen: ${error.message}`,
    };
  }
}

/**
 * Prüft den Zustand der Thunder Client Extension
 * @returns {Object} Status-Objekt
 */
function checkThunderClient() {
  try {
    const thunderDir = path.join(process.cwd(), '.vscode', 'thunder-client');

    if (!fs.existsSync(thunderDir)) {
      return {
        status: 'WARNUNG',
        message: 'Keine Thunder Client Datenverzeichnis gefunden',
      };
    }

    try {
      const files = fs.readdirSync(thunderDir);
      const collectionsFound = files.some((file) => file.includes('thunder-collection'));
      const environmentsFound = files.some((file) => file.includes('thunder-environment'));

      let message = 'Thunder Client ist konfiguriert';

      if (collectionsFound) {
        message += ' (Collections gefunden)';
      }

      if (environmentsFound) {
        message += ' (Environments gefunden)';
      }

      return {
        status: 'OK',
        message,
      };
    } catch (fsError) {
      return {
        status: 'FEHLER',
        message: `Konnte Thunder Client Verzeichnis nicht lesen: ${fsError.message}`,
      };
    }
  } catch (error) {
    return {
      status: 'FEHLER',
      message: `Fehler beim Prüfen: ${error.message}`,
    };
  }
}

/**
 * Prüft den Zustand der Web Accessibility Extension
 * @returns {Object} Status-Objekt
 */
function checkWebAccessibility() {
  try {
    const configPath = path.join(process.cwd(), '.vscode', 'settings.json');

    if (fs.existsSync(configPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        const accessibilityKeys = Object.keys(settings).filter(
          (key) => key.startsWith('axe-linter.') || key.startsWith('accessibility.'),
        );

        if (accessibilityKeys.length > 0) {
          return {
            status: 'OK',
            message: `Web Accessibility mit ${accessibilityKeys.length} angepassten Einstellungen`,
          };
        }
      } catch (jsonError) {
        // Ignorieren, falls settings.json nicht gelesen werden kann
      }
    }

    // Prüfe HTML-Dateien auf Accessibility-relevante Tags
    try {
      const htmlFiles = findHtmlFiles(process.cwd());
      let accessibilityTagsFound = false;

      for (const htmlFile of htmlFiles.slice(0, 5)) {
        // Prüfe max. 5 Dateien
        const content = fs.readFileSync(htmlFile, 'utf8');

        if (content.includes('aria-') || content.includes('role=')) {
          accessibilityTagsFound = true;
          break;
        }
      }

      if (accessibilityTagsFound) {
        return {
          status: 'OK',
          message: 'Web Accessibility Tags wurden in HTML-Dateien gefunden',
        };
      }
    } catch (fsError) {
      // Ignorieren, falls HTML-Dateien nicht gelesen werden können
    }

    return {
      status: 'OK',
      message: 'Web Accessibility Extension ist einsatzbereit',
    };
  } catch (error) {
    return {
      status: 'FEHLER',
      message: `Fehler beim Prüfen: ${error.message}`,
    };
  }
}

/**
 * Findet alle HTML-Dateien im angegebenen Verzeichnis und Unterverzeichnissen
 * @param {string} dir - Das zu durchsuchende Verzeichnis
 * @returns {Array<string>} - Array mit Dateipfaden
 */
function findHtmlFiles(dir) {
  let results = [];

  try {
    const list = fs.readdirSync(dir);

    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
        results = results.concat(findHtmlFiles(filePath));
      } else if (file.endsWith('.html')) {
        results.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Fehler beim Durchsuchen von ${dir}: ${error.message}`);
  }

  return results;
}

/**
 * Gibt detaillierte Informationen über alle oder eine bestimmte Extension zurück
 * @param {string} extensionKey - Optional: Schlüssel der zu prüfenden Extension
 */
function validateExtensions(extensionKey = null) {
  console.log(
    `${COLORS.bright}${COLORS.blue}=== 🔍 EXTENSION FUNCTION VALIDATOR ====${COLORS.reset}`,
  );
  console.log(`${COLORS.blue}Gestartet: ${new Date().toLocaleString('de-DE')}${COLORS.reset}\n`);

  const extensionsToCheck = extensionKey
    ? EXTENSIONS[extensionKey]
      ? { [extensionKey]: EXTENSIONS[extensionKey] }
      : {}
    : EXTENSIONS;

  if (extensionKey && !EXTENSIONS[extensionKey]) {
    console.log(
      `${COLORS.red}❌ Die angegebene Extension "${extensionKey}" wurde nicht gefunden!${COLORS.reset}`,
    );
    process.exit(1);
  }

  if (Object.keys(extensionsToCheck).length === 0) {
    console.log(`${COLORS.yellow}⚠️ Keine Extensions zum Prüfen gefunden!${COLORS.reset}`);
    process.exit(1);
  }

  const results = {};
  let allPassed = true;

  for (const [key, extension] of Object.entries(extensionsToCheck)) {
    console.log(`${COLORS.magenta}=== ${extension.name} (${key}) ===${COLORS.reset}`);

    // Prüfe benötigte Dateien
    if (extension.requiredFiles) {
      for (const requiredFile of extension.requiredFiles) {
        const filePath = path.join(process.cwd(), requiredFile);

        if (fs.existsSync(filePath)) {
          console.log(`${COLORS.green}✅ Datei gefunden: ${requiredFile}${COLORS.reset}`);
        } else {
          console.log(`${COLORS.red}❌ Datei nicht gefunden: ${requiredFile}${COLORS.reset}`);
          allPassed = false;
        }
      }
    }

    // Führe spezifische Check-Funktion aus
    if (extension.checkFunction) {
      try {
        const checkResult = extension.checkFunction();

        if (checkResult.status === 'OK') {
          console.log(`${COLORS.green}✅ Status: ${checkResult.message}${COLORS.reset}`);
        } else if (checkResult.status === 'WARNUNG') {
          console.log(`${COLORS.yellow}⚠️ Warnung: ${checkResult.message}${COLORS.reset}`);
        } else {
          console.log(`${COLORS.red}❌ Fehler: ${checkResult.message}${COLORS.reset}`);
          allPassed = false;
          createTodo(
            `Fehler bei Extension: ${extension.name}`,
            `Die Überprüfung der Extension "${extension.name}" hat einen Fehler ergeben: ${checkResult.message}`,
            'Extension Validator',
          );
        }

        results[key] = checkResult;
      } catch (error) {
        console.log(`${COLORS.red}❌ Fehler bei der Prüfung: ${error.message}${COLORS.reset}`);
        results[key] = {
          status: 'FEHLER',
          message: `Fehler bei der Prüfung: ${error.message}`,
        };
        allPassed = false;
      }
    } else {
      console.log(`${COLORS.yellow}⚠️ Keine Check-Funktion definiert${COLORS.reset}`);
      results[key] = {
        status: 'WARNUNG',
        message: 'Keine Check-Funktion definiert',
      };
    }

    console.log(''); // Leerzeile für bessere Lesbarkeit
  }

  console.log(`${COLORS.bright}${COLORS.blue}=== 📋 ZUSAMMENFASSUNG ====${COLORS.reset}`);

  if (allPassed) {
    console.log(`${COLORS.green}✅ Alle Prüfungen erfolgreich abgeschlossen!${COLORS.reset}`);
  } else {
    console.log(`${COLORS.red}❌ Es wurden Probleme bei der Prüfung festgestellt!${COLORS.reset}`);
  }

  // Status-Datei speichern
  const statusFile = path.join(process.cwd(), 'EXTENSION_STATUS.json');

  fs.writeFileSync(
    statusFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results,
        allPassed,
      },
      null,
      2,
    ),
  );

  console.log(`${COLORS.cyan}📄 Status in EXTENSION_STATUS.json gespeichert${COLORS.reset}`);

  return {
    results,
    allPassed,
  };
}

// Haupt-Ausführung
if (require.main === module) {
  const args = process.argv.slice(2);
  let extensionKey = null;

  // Argument-Parsing
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--extension=')) {
      extensionKey = arg.split('=')[1];
    }
  }

  validateExtensions(extensionKey);
}

module.exports = { validateExtensions };
