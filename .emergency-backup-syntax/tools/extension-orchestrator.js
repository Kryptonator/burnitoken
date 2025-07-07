#!/usr/bin/env node

/**
 * Extension Orchestrator - Zentrales Management für alle VS Code Extensions
 *
 * Koordiniert und überwacht alle Extensions für optimale Performance:
 * - Lighthouse, Axe, ESLint, Prettier
 * - GitHub Actions, Docker, GitLens
 * - Live Server, REST Client, Thunder Client
 * - Monitoring- und Audit-Extensions
 *
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  EXTENSION_CONFIG_FILE: path.join(__dirname, 'extension-config.json'),
  TASK_QUEUE_FILE: path.join(__dirname, 'task-queue.json'),
  PERFORMANCE_LOG: path.join(__dirname, '../public/extension-performance.json'),
  AUTO_HEAL_INTERVAL: 30000, // 30 Sekunden
  MAX_CONCURRENT_TASKS: 3,
};

/**
 * Definierte Extension-Gruppen mit spezifischen Aufgaben
 */
const EXTENSION_GROUPS = {
  // 1. Code-Qualität & Linting
  codeQuality: {
    extensions: [
      'esbenp.prettier-vscode',
      'dbaeumer.vscode-eslint',
      'bradlc.vscode-tailwindcss',
      'formulahendry.auto-rename-tag',
      'christian-kohler.path-intellisense',
    ],
    tasks: ['format-on-save', 'lint-on-change', 'auto-fix-imports', 'validate-html-structure'],
    priority: 'high',
    autoRun: true,
  },

  // 2. Performance & Monitoring
  performance: {
    extensions: [
      'ms-vscode.test-adapter-converter',
      'ms-playwright.playwright',
      'formulahendry.code-runner',
      'wayou.vscode-todo-highlight',
    ],
    tasks: [
      'lighthouse-audit',
      'performance-monitoring',
      'core-web-vitals-check',
      'bundle-analysis',
    ],
    priority: 'high',
    autoRun: true,
  },

  // 3. SEO & Accessibility
  seoAccessibility: {
    extensions: ['ms-vscode.live-server', 'ritwickdey.liveserver'],
    tasks: [
      'accessibility-audit',
      'seo-validation',
      'meta-tags-check',
      'structured-data-validation',
    ],
    priority: 'high',
    autoRun: true,
  },

  // 4. Deployment & CI/CD
  deployment: {
    extensions: [
      'github.vscode-github-actions',
      'ms-vscode-remote.remote-containers',
      'ms-azuretools.vscode-docker',
      'gitpod.gitpod-desktop',
    ],
    tasks: [
      'github-actions-check',
      'docker-health-check',
      'deployment-validation',
      'environment-sync',
    ],
    priority: 'critical',
    autoRun: true,
  },

  // 5. API & Integration Testing
  apiTesting: {
    extensions: [
      'rangav.vscode-thunder-client',
      'humao.rest-client',
      'ms-vscode.test-adapter-converter',
    ],
    tasks: [
      'api-endpoint-testing',
      'xrpl-integration-test',
      'webhook-validation',
      'external-service-health',
    ],
    priority: 'medium',
    autoRun: true,
  },

  // 6. Security & Compliance
  security: {
    extensions: ['ms-vscode.azure-account'],
    tasks: ['vulnerability-scan', 'dependency-audit', 'csp-validation', 'security-headers-check'],
    priority: 'critical',
    autoRun: true,
  },

  // 7. Documentation & Knowledge
  documentation: {
    extensions: [
      'yzhang.markdown-all-in-one',
      'davidanson.vscode-markdownlint',
      'ms-vscode.wordcount',
    ],
    tasks: ['readme-update', 'changelog-generation', 'api-docs-sync', 'knowledge-base-update'],
    priority: 'low',
    autoRun: false,
  },
};

/**
 * Farbige Konsolen-Ausgabe
 */
function printColored(message, colorCode = '\x1b[36m') {
  console.log(`${colorCode}${message}\x1b[0m`);
}

/**
 * Prüft, welche Extensions installiert sind
 */
function getInstalledExtensions() {
  try {
    const output = execSync('code --list-extensions', { encoding: 'utf8' });
    return output
      .trim()
      .split('\n')
      .filter((ext) => ext.length > 0);
  } catch (error) {
    printColored(`❌ Fehler beim Abrufen der Extensions: ${error.message}`, '\x1b[31m');
    return [];
  }
}

/**
 * Installiert fehlende Extensions automatisch
 */
function installMissingExtensions() {
  const installed = getInstalledExtensions();
  const requiredExtensions = [];

  // Alle benötigten Extensions sammeln
  Object.values(EXTENSION_GROUPS).forEach((group) => {
    requiredExtensions.push(...group.extensions);
  });

  const missing = requiredExtensions.filter((ext) => !installed.includes(ext));

  if (missing.length === 0) {
    printColored('✅ Alle benötigten Extensions sind installiert', '\x1b[32m');
    return true;
  }

  printColored(`📦 Installiere ${missing.length} fehlende Extensions...`, '\x1b[33m');

  let installSuccess = true;
  for (const extension of missing) {
    try {
      printColored(`  📦 Installiere: ${extension}`, '\x1b[36m');
      execSync(`code --install-extension ${extension}`, { encoding: 'utf8' });
      printColored(`  ✅ ${extension} erfolgreich installiert`, '\x1b[32m');
    } catch (error) {
      printColored(`  ❌ Fehler bei ${extension}: ${error.message}`, '\x1b[31m');
      installSuccess = false;
    }
  }

  return installSuccess;
}

/**
 * Erstellt optimierte VS Code Settings für alle Extensions
 */
function generateOptimizedSettings() {
  const settings = {
    // Code-Qualität
    'editor.formatOnSave': true,
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': true,
      'source.organizeImports': true,
    },
    'prettier.requireConfig': true,
    'eslint.alwaysShowStatus': true,
    'eslint.format.enable': true,

    // Performance
    'files.watcherExclude': {
      '**/node_modules/**': true,
      '**/coverage/**': true,
      '**/public/**': true,
    },
    'search.exclude': {
      '**/node_modules': true,
      '**/coverage': true,
    },

    // Live Server
    'liveServer.settings.donotShowInfoMsg': true,
    'liveServer.settings.donotVerifyTags': true,
    'liveServer.settings.port': 3000,

    // Playwright
    'playwright.showTrace': true,
    'playwright.reuseBrowser': true,

    // GitHub Actions
    'github-actions.workflows.pinned.refresh.enabled': true,
    'github-actions.workflows.pinned.refresh.interval': 300,

    // Axe Accessibility
    'axe.enableAccessibilityTree': true,
    'axe.enabledRules': ['all'],

    // Thunder Client
    'thunder-client.saveToWorkspace': true,
    'thunder-client.followRedirect': true,

    // Auto-Healing Konfiguration
    'burnitoken.autoHeal.enabled': true,
    'burnitoken.autoHeal.interval': 30000,
    'burnitoken.monitoring.realtime': true,
  };

  const settingsPath = path.join(__dirname, '..', '.vscode', 'settings.json');
  const vscodeDirPath = path.dirname(settingsPath);

  // .vscode Verzeichnis erstellen falls nicht vorhanden
  if (!fs.existsSync(vscodeDirPath)) {
    fs.mkdirSync(vscodeDirPath, { recursive: true });
  }

  // Bestehende Settings laden und mergen
  let existingSettings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (error) {
      printColored(`⚠️ Fehler beim Lesen bestehender Settings: ${error.message}`, '\x1b[33m');
    }
  }

  const mergedSettings = { ...existingSettings, ...settings };

  try {
    fs.writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 2));
    printColored('✅ VS Code Settings optimiert', '\x1b[32m');
    return true;
  } catch (error) {
    printColored(`❌ Fehler beim Schreiben der Settings: ${error.message}`, '\x1b[31m');
    return false;
  }
}

/**
 * Erstellt Tasks für alle Extension-Gruppen
 */
function generateTaskConfiguration() {
  const tasks = {
    version: '2.0.0',
    tasks: [
      // Code-Qualität Tasks
      {
        label: 'Format & Lint All',
        type: 'shell',
        command: 'npm',
        args: ['run', 'format', '&&', 'npm', 'run', 'lint', '--', '--fix'],
        group: 'build',
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'shared',
        },
      },

      // Performance Tasks
      {
        label: 'Lighthouse Audit',
        type: 'shell',
        command: 'npm',
        args: ['run', 'lighthouse'],
        group: 'test',
        isBackground: true,
      },

      // SEO & Accessibility
      {
        label: 'Accessibility Audit',
        type: 'shell',
        command: 'npm',
        args: ['run', 'test:a11y'],
        group: 'test',
      },

      // Deployment
      {
        label: 'Deploy Check',
        type: 'shell',
        command: 'node',
        args: ['.github/update-deploy-history.js', '--validation'],
        group: 'build',
      },

      // API Testing
      {
        label: 'API Health Check',
        type: 'shell',
        command: 'node',
        args: ['tools/api-health-check.js'],
        group: 'test',
      },

      // Security
      {
        label: 'Security Scan',
        type: 'shell',
        command: 'npm',
        args: ['audit', '&&', 'snyk', 'test'],
        group: 'test',
      },

      // Auto-Healing
      {
        label: 'Auto-Heal All',
        type: 'shell',
        command: 'node',
        args: ['tools/extension-orchestrator.js', '--auto-heal'],
        isBackground: true,
        group: 'build',
      },
    ],
  };

  const tasksPath = path.join(__dirname, '..', '.vscode', 'tasks.json');

  try {
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
    printColored('✅ Task-Konfiguration erstellt', '\x1b[32m');
    return true;
  } catch (error) {
    printColored(`❌ Fehler beim Erstellen der Tasks: ${error.message}`, '\x1b[31m');
    return false;
  }
}

/**
 * Führt alle Tasks einer Extension-Gruppe aus
 */
async function executeGroupTasks(groupName, options = {}) {
  const group = EXTENSION_GROUPS[groupName];
  if (!group) {
    printColored(`❌ Extension-Gruppe "${groupName}" nicht gefunden`, '\x1b[31m');
    return false;
  }

  const { dryRun = false, timeout = 30000 } = options;

  printColored(`🔄 Führe Tasks für Gruppe "${groupName}" aus...`, '\x1b[36m');

  const results = [];

  for (const task of group.tasks) {
    if (dryRun) {
      printColored(`  🔍 [DRY RUN] ${task}`, '\x1b[33m');
      continue;
    }

    const startTime = Date.now();

    try {
      // Task-spezifische Commands
      let command = '';
      switch (task) {
        case 'format-on-save':
          command = 'npm run format';
          break;
        case 'lint-on-change':
          command = 'npm run lint -- --fix';
          break;
        case 'lighthouse-audit':
          command = 'npm run lighthouse';
          break;
        case 'accessibility-audit':
          command = 'npm run test:a11y';
          break;
        case 'api-endpoint-testing':
          command = 'node tools/api-health-check.js';
          break;
        case 'vulnerability-scan':
          command = 'npm audit && snyk test';
          break;
        case 'github-actions-check':
          command = 'node .github/update-deploy-history.js --validation';
          break;
        default:
          printColored(`  ⚠️ Unbekannter Task: ${task}`, '\x1b[33m');
          continue;
      }

      printColored(`  ▶️ ${task}: ${command}`, '\x1b[36m');

      const output = execSync(command, {
        encoding: 'utf8',
        timeout,
        stdio: 'pipe',
      });

      const duration = Date.now() - startTime;

      results.push({
        task,
        success: true,
        duration,
        output: output.substring(0, 200), // Erste 200 Zeichen
      });

      printColored(`  ✅ ${task} (${duration}ms)`, '\x1b[32m');
    } catch (error) {
      const duration = Date.now() - startTime;

      results.push({
        task,
        success: false,
        duration,
        error: error.message.substring(0, 200),
      });

      printColored(`  ❌ ${task} fehlgeschlagen: ${error.message}`, '\x1b[31m');
    }
  }

  // Ergebnisse speichern
  const performanceData = {
    timestamp: new Date().toISOString(),
    group: groupName,
    results,
    summary: {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
    },
  };

  // Performance-Log aktualisieren
  let performanceHistory = [];
  if (fs.existsSync(CONFIG.PERFORMANCE_LOG)) {
    try {
      performanceHistory = JSON.parse(fs.readFileSync(CONFIG.PERFORMANCE_LOG, 'utf8'));
    } catch (error) {
      printColored(`⚠️ Performance-Log konnte nicht gelesen werden`, '\x1b[33m');
    }
  }

  performanceHistory.push(performanceData);
  if (performanceHistory.length > 100) {
    performanceHistory = performanceHistory.slice(-100); // Auf letzte 100 beschränken
  }

  try {
    // Public-Verzeichnis erstellen falls nicht vorhanden
    const publicDir = path.dirname(CONFIG.PERFORMANCE_LOG);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG.PERFORMANCE_LOG, JSON.stringify(performanceHistory, null, 2));
  } catch (error) {
    printColored(
      `⚠️ Performance-Log konnte nicht gespeichert werden: ${error.message}`,
      '\x1b[33m',
    );
  }

  const successRate = (performanceData.summary.successful / performanceData.summary.total) * 100;
  printColored(
    `📊 Gruppe "${groupName}": ${successRate.toFixed(1)}% erfolgreich (${performanceData.summary.successful}/${performanceData.summary.total})`,
    successRate >= 80 ? '\x1b[32m' : '\x1b[33m',
  );

  return successRate >= 80;
}

/**
 * Auto-Healing: Führt alle kritischen Tasks automatisch aus
 */
async function runAutoHealing() {
  printColored('\n🔄 Auto-Healing gestartet...', '\x1b[1;36m');

  const criticalGroups = Object.entries(EXTENSION_GROUPS)
    .filter(([_, group]) => group.priority === 'critical' && group.autoRun)
    .map(([name, _]) => name);

  const highPriorityGroups = Object.entries(EXTENSION_GROUPS)
    .filter(([_, group]) => group.priority === 'high' && group.autoRun)
    .map(([name, _]) => name);

  // Kritische Gruppen zuerst
  for (const groupName of criticalGroups) {
    await executeGroupTasks(groupName, { timeout: 60000 });
  }

  // Dann High-Priority Gruppen
  for (const groupName of highPriorityGroups) {
    await executeGroupTasks(groupName, { timeout: 45000 });
  }

  printColored('✅ Auto-Healing abgeschlossen', '\x1b[32m');
}

/**
 * Zeigt den Status aller Extension-Gruppen
 */
function showExtensionStatus() {
  const installed = getInstalledExtensions();

  printColored('\n📊 Extension-Status:', '\x1b[1;36m');

  Object.entries(EXTENSION_GROUPS).forEach(([groupName, group]) => {
    const installedCount = group.extensions.filter((ext) => installed.includes(ext)).length;
    const totalCount = group.extensions.length;
    const percentage = (installedCount / totalCount) * 100;

    const statusEmoji = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
    const color = percentage === 100 ? '\x1b[32m' : percentage >= 80 ? '\x1b[33m' : '\x1b[31m';

    printColored(
      `${statusEmoji} ${groupName}: ${installedCount}/${totalCount} Extensions (${percentage.toFixed(0)}%)`,
      color,
    );

    if (percentage < 100) {
      const missing = group.extensions.filter((ext) => !installed.includes(ext));
      printColored(`   Fehlend: ${missing.join(', ')}`, '\x1b[31m');
    }
  });
}

/**
 * Hauptfunktion
 */
async function main() {
  const args = process.argv.slice(2);
  const divider = '═'.repeat(80);

  console.clear();
  printColored(`\n${divider}`, '\x1b[1;36m');
  printColored('                    🎯 Extension Orchestrator                    ', '\x1b[1;37m');
  printColored(`${divider}\n`, '\x1b[1;36m');

  if (args.includes('--install')) {
    installMissingExtensions();
    generateOptimizedSettings();
    generateTaskConfiguration();
    return;
  }

  if (args.includes('--auto-heal')) {
    await runAutoHealing();
    return;
  }

  if (args.includes('--status')) {
    showExtensionStatus();
    return;
  }

  if (args.includes('--group')) {
    const groupIndex = args.indexOf('--group');
    const groupName = args[groupIndex + 1];
    if (groupName && EXTENSION_GROUPS[groupName]) {
      await executeGroupTasks(groupName);
    } else {
      printColored('❌ Ungültiger Gruppenname. Verfügbare Gruppen:', '\x1b[31m');
      Object.keys(EXTENSION_GROUPS).forEach((name) => {
        printColored(`  - ${name}`, '\x1b[36m');
      });
    }
    return;
  }

  // Standard: Status anzeigen und Auto-Healing aktivieren
  showExtensionStatus();

  printColored('\n🛠️ Verfügbare Befehle:', '\x1b[1;36m');
  printColored(
    '  --install      Installiert fehlende Extensions und konfiguriert VS Code',
    '\x1b[32m',
  );
  printColored(
    '  --auto-heal    Führt automatische Heilung aller kritischen Systeme durch',
    '\x1b[32m',
  );
  printColored('  --status       Zeigt den Status aller Extension-Gruppen', '\x1b[32m');
  printColored('  --group <name> Führt Tasks für eine spezifische Gruppe aus', '\x1b[32m');

  printColored('\n📋 Empfohlene Reihenfolge nach VS Code Neustart:', '\x1b[1;33m');
  printColored('  1. node tools/extension-orchestrator.js --install', '\x1b[33m');
  printColored('  2. node tools/extension-orchestrator.js --auto-heal', '\x1b[33m');
  printColored('  3. Regelmäßig: node tools/extension-orchestrator.js --status', '\x1b[33m');

  printColored(`\n${divider}`, '\x1b[1;36m');
}

// Programm ausführen
if (require.main === module) {
  main().catch((error) => {
    printColored(`❌ Unerwarteter Fehler: ${error.message}`, '\x1b[31m');
    process.exit(1);
  });
}

module.exports = {
  executeGroupTasks,
  runAutoHealing,
  getInstalledExtensions,
  installMissingExtensions,
  EXTENSION_GROUPS,
};
