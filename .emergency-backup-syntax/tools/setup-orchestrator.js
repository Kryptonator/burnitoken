#!/usr/bin/env node

/**
 * Setup Script für optimale VS Code Extension Konfiguration
 *
 * Installiert und konfiguriert alle Extensions für perfekte BurniToken Development Experience
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Farbige Konsolen-Ausgabe
 */
function printColored(message, colorCode = '\x1b[36m') {
  console.log(`${colorCode}${message}\x1b[0m`);
}

/**
 * Erstellt optimierte VS Code Workspace-Konfiguration
 */
function createWorkspaceConfig() {
  const workspaceConfig = {
    folders: [
      {
        name: 'BurniToken Website',
        path: '.',
      },
    ],
    settings: {
      // Performance Optimierungen
      'files.watcherExclude': {
        '**/node_modules/**': true,
        '**/coverage/**': true,
        '**/public/**': true,
        '**/.git/**': true,
        '**/playwright-report/**': true,
        '**/test-results/**': true,
      },

      // Auto-Format & Linting
      'editor.formatOnSave': true,
      'editor.formatOnPaste': true,
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': true,
        'source.organizeImports': true,
        'source.removeUnusedImports': true,
      },

      // Extension-spezifische Einstellungen
      'prettier.requireConfig': true,
      'prettier.useEditorConfig': true,
      'eslint.alwaysShowStatus': true,
      'eslint.format.enable': true,

      // Live Server für lokale Entwicklung
      'liveServer.settings.port': 3000,
      'liveServer.settings.host': 'localhost',
      'liveServer.settings.donotShowInfoMsg': true,
      'liveServer.settings.CustomBrowser': 'chrome',
      'liveServer.settings.NoBrowser': false,
      'liveServer.settings.ignoreFiles': ['.vscode/**', '**/*.scss', '**/*.sass', '**/*.ts'],

      // Playwright Testing
      'playwright.showTrace': true,
      'playwright.reuseBrowser': true,
      'playwright.experimental.ctRunOptions': {
        reporter: 'html',
      },

      // GitHub Actions Integration
      'github-actions.workflows.pinned.refresh.enabled': true,
      'github-actions.workflows.pinned.refresh.interval': 300,

      // Accessibility & SEO
      'axe.enableAccessibilityTree': true,
      'axe.enabledRules': ['all'],
      'webhint.enableTelemetry': false,

      // Thunder Client API Testing
      'thunder-client.saveToWorkspace': true,
      'thunder-client.followRedirect': true,
      'thunder-client.requestLayout': 'Left/Right',

      // Security & Vulnerability Scanning
      'snyk.enableCodeActions': true,
      'snyk.enableDeltaFindings': true,

      // Markdown & Documentation
      'markdownlint.config': {
        default: true,
        MD033: false,
        MD013: {
          line_length: 120,
        },
      },

      // Tailwind CSS
      'tailwindCSS.includeLanguages': {
        html: 'html',
        javascript: 'javascript',
      },
      'tailwindCSS.experimental.classRegex': [
        ['class:\\s*?["\'`]([^"\'`]*).*?["\'`]', '["\'`]([^"\'`]*)["\'`]'],
        ['className:\\s*?["\'`]([^"\'`]*).*?["\'`]', '["\'`]([^"\'`]*)["\'`]'],
      ],

      // Auto-Healing & Monitoring (Custom)
      'burnitoken.autoHeal.enabled': true,
      'burnitoken.autoHeal.interval': 30000,
      'burnitoken.monitoring.realtime': true,
      'burnitoken.lighthouse.autoRun': true,
      'burnitoken.seo.autoValidate': true,
    },

    extensions: {
      recommendations: [
        // Code Quality & Formatting
        'esbenp.prettier-vscode',
        'ms-vscode.vscode-eslint',
        'bradlc.vscode-tailwindcss',
        'formulahendry.auto-rename-tag',
        'christian-kohler.path-intellisense',

        // Testing & Performance
        'ms-playwright.playwright',
        'connor4312.nodejs-testing',
        'formulahendry.code-runner',

        // SEO & Accessibility
        'deque-systems.vscode-axe-linter',
        'webhint.vscode-webhint',

        // Deployment & CI/CD
        'github.vscode-github-actions',
        'ms-vscode-remote.remote-containers',
        'ms-azuretools.vscode-docker',

        // API Testing
        'rangav.vscode-thunder-client',
        'humao.rest-client',

        // Security
        'snyk-security.snyk-vulnerability-scanner',

        // Utilities
        'ms-vscode.live-server',
        'wayou.vscode-todo-highlight',
        'yzhang.markdown-all-in-one',
        'davidanson.vscode-markdownlint',
      ],
    },

    tasks: {
      version: '2.0.0',
      tasks: [
        {
          label: '🚀 BurniToken: Full Setup',
          type: 'shell',
          command: 'npm install && npm run build && node tools/extension-orchestrator.js --install',
          group: 'build',
          presentation: {
            echo: true,
            reveal: 'always',
            focus: true,
            panel: 'new',
          },
        },
        {
          label: '⚡ Auto-Heal All Systems',
          type: 'shell',
          command: 'node tools/extension-orchestrator.js --auto-heal',
          isBackground: true,
          group: 'build',
        },
        {
          label: '🎯 Live-Readiness Check',
          type: 'shell',
          command: 'node tools/vscode-recovery-center.js --live-check',
          group: 'test',
        },
        {
          label: '🔍 Complete Audit Suite',
          type: 'shell',
          command: 'npm run lighthouse && npm run test:a11y && npm audit && npm run validate',
          group: 'test',
        },
      ],
    },
  };

  const workspacePath = path.join(__dirname, '..', 'burnitoken.code-workspace');

  try {
    fs.writeFileSync(workspacePath, JSON.stringify(workspaceConfig, null, 2));
    printColored('✅ VS Code Workspace-Konfiguration erstellt', '\x1b[32m');
    return true;
  } catch (error) {
    printColored(
      `❌ Fehler beim Erstellen der Workspace-Konfiguration: ${error.message}`,
      '\x1b[31m',
    );
    return false;
  }
}

/**
 * Erstellt Keybindings für häufige Extension-Aktionen
 */
function createKeybindings() {
  const keybindings = [
    // Extension Orchestrator Shortcuts
    {
      key: 'ctrl+shift+h',
      command: 'workbench.action.terminal.sendSequence',
      args: {
        text: 'node tools/extension-orchestrator.js --auto-heal\r',
      },
      when: 'terminalFocus',
    },
    {
      key: 'ctrl+shift+l',
      command: 'workbench.action.terminal.sendSequence',
      args: {
        text: 'node tools/vscode-recovery-center.js --live-check\r',
      },
      when: 'terminalFocus',
    },

    // Lighthouse & Performance
    {
      key: 'ctrl+shift+p ctrl+l',
      command: 'workbench.action.terminal.sendSequence',
      args: {
        text: 'npm run lighthouse\r',
      },
    },

    // Accessibility Audit
    {
      key: 'ctrl+shift+p ctrl+a',
      command: 'workbench.action.terminal.sendSequence',
      args: {
        text: 'npm run test:a11y\r',
      },
    },

    // Format & Lint All
    {
      key: 'ctrl+shift+p ctrl+f',
      command: 'workbench.action.terminal.sendSequence',
      args: {
        text: 'npm run format && npm run lint -- --fix\r',
      },
    },

    // Live Server Start
    {
      key: 'ctrl+shift+p ctrl+s',
      command: 'extension.liveServer.goOnline',
    },

    // Thunder Client Open
    {
      key: 'ctrl+shift+p ctrl+t',
      command: 'thunder-client.new-request',
    },

    // Quick Recovery
    {
      key: 'ctrl+shift+r',
      command: 'workbench.action.terminal.sendSequence',
      args: {
        text: 'node tools/vscode-recovery-center.js\r',
      },
    },
  ];

  const keybindingsPath = path.join(__dirname, '..', '.vscode', 'keybindings.json');
  const vscodeDirPath = path.dirname(keybindingsPath);

  // .vscode Verzeichnis erstellen falls nicht vorhanden
  if (!fs.existsSync(vscodeDirPath)) {
    fs.mkdirSync(vscodeDirPath, { recursive: true });
  }

  try {
    fs.writeFileSync(keybindingsPath, JSON.stringify(keybindings, null, 2));
    printColored('✅ VS Code Keybindings erstellt', '\x1b[32m');
    return true;
  } catch (error) {
    printColored(`❌ Fehler beim Erstellen der Keybindings: ${error.message}`, '\x1b[31m');
    return false;
  }
}

/**
 * Erstellt NPM Scripts für Extension-Integration
 */
function updatePackageJsonScripts() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    printColored('⚠️ package.json nicht gefunden', '\x1b[33m');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Neue Scripts hinzufügen oder aktualisieren
    const newScripts = {
      // Extension Management
      'ext:install': 'node tools/extension-orchestrator.js --install',
      'ext:heal': 'node tools/extension-orchestrator.js --auto-heal',
      'ext:status': 'node tools/extension-orchestrator.js --status',

      // Quality Assurance Groups
      'qa:security': 'node tools/extension-orchestrator.js --group security',
      'qa:performance': 'node tools/extension-orchestrator.js --group performance',
      'qa:seo': 'node tools/extension-orchestrator.js --group seoAccessibility',
      'qa:code': 'node tools/extension-orchestrator.js --group codeQuality',
      'qa:api': 'node tools/extension-orchestrator.js --group apiTesting',
      'qa:deploy': 'node tools/extension-orchestrator.js --group deployment',

      // Complete Workflows
      startup: 'node tools/auto-startup.js',
      recovery: 'node tools/vscode-recovery-center.js',
      'live-check': 'node tools/vscode-recovery-center.js --live-check',

      // Comprehensive Audits
      'audit:all': 'npm run qa:security && npm run qa:performance && npm run qa:seo',
      'audit:critical': 'npm run qa:security && npm run qa:deploy',

      // Development Workflow
      'dev:start': 'npm run startup && npm run ext:heal',
      'dev:check': 'npm run live-check && npm run ext:status',
    };

    // Scripts mergen
    packageJson.scripts = { ...packageJson.scripts, ...newScripts };

    // package.json zurückschreiben
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    printColored('✅ package.json Scripts aktualisiert', '\x1b[32m');

    // Neue Scripts anzeigen
    printColored('\n📋 Neue NPM Scripts verfügbar:', '\x1b[1;36m');
    Object.keys(newScripts).forEach((script) => {
      printColored(`  npm run ${script}`, '\x1b[36m');
    });

    return true;
  } catch (error) {
    printColored(`❌ Fehler beim Aktualisieren der package.json: ${error.message}`, '\x1b[31m');
    return false;
  }
}

/**
 * Hauptfunktion für komplettes Setup
 */
async function main() {
  const divider = '═'.repeat(80);

  console.clear();
  printColored(`\n${divider}`, '\x1b[1;36m');
  printColored('             🎯 BurniToken VS Code Extension Setup             ', '\x1b[1;37m');
  printColored(`${divider}\n`, '\x1b[1;36m');

  printColored(
    '🚀 Starte komplettes VS Code Setup für optimale Development Experience...',
    '\x1b[1;36m',
  );

  try {
    // 1. Workspace-Konfiguration erstellen
    printColored('\n📁 Phase 1: Workspace-Konfiguration', '\x1b[1;33m');
    createWorkspaceConfig();

    // 2. Keybindings erstellen
    printColored('\n⌨️ Phase 2: Keybindings Setup', '\x1b[1;33m');
    createKeybindings();

    // 3. NPM Scripts aktualisieren
    printColored('\n📦 Phase 3: NPM Scripts Update', '\x1b[1;33m');
    updatePackageJsonScripts();

    // 4. Extension Orchestrator initialisieren
    printColored('\n🎯 Phase 4: Extension Orchestrator Setup', '\x1b[1;33m');
    try {
      execSync('node tools/extension-orchestrator.js --install', {
        stdio: 'inherit',
        timeout: 60000,
      });
      printColored('✅ Extension Orchestrator erfolgreich initialisiert', '\x1b[32m');
    } catch (error) {
      printColored('⚠️ Extension Orchestrator wird beim nächsten Start initialisiert', '\x1b[33m');
    }

    printColored(
      '\n🎉 Setup Complete! VS Code ist optimal für BurniToken Development konfiguriert!',
      '\x1b[1;42m',
    );

    printColored('\n📋 Nächste Schritte:', '\x1b[1;36m');
    printColored('  1. VS Code neu starten', '\x1b[36m');
    printColored('  2. Workspace öffnen: "burnitoken.code-workspace"', '\x1b[36m');
    printColored('  3. Auto-Startup ausführen: npm run startup', '\x1b[36m');
    printColored('  4. Extensions testen: npm run ext:status', '\x1b[36m');

    printColored('\n🔥 Empfohlene Shortcuts:', '\x1b[1;33m');
    printColored('  Ctrl+Shift+H = Auto-Heal All Systems', '\x1b[33m');
    printColored('  Ctrl+Shift+L = Live-Readiness Check', '\x1b[33m');
    printColored('  Ctrl+Shift+R = Recovery Center', '\x1b[33m');
  } catch (error) {
    printColored(`❌ Setup-Fehler: ${error.message}`, '\x1b[31m');
    printColored('🔧 Führe manuelle Recovery durch...', '\x1b[33m');

    try {
      execSync('node tools/vscode-recovery-center.js', { stdio: 'inherit' });
    } catch (recoveryError) {
      printColored(`❌ Recovery fehlgeschlagen: ${recoveryError.message}`, '\x1b[31m');
    }
  }

  printColored(`\n${divider}`, '\x1b[1;36m');
}

// Setup ausführen
if (require.main === module) {
  main();
}

module.exports = {
  createWorkspaceConfig,
  createKeybindings,
  updatePackageJsonScripts,
};
