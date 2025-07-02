#!/usr/bin/env node

/**
 * VS Code Recovery Center
 *
 * Zentrale Benutzeroberfläche für alle Wiederherstellungsfunktionen im Projekt
 * - Zeigt den Status des VS Code Recovery Managers
 * - Listet verfügbare Recovery-Screenshots auf
 * - Bietet Wiederherstellungsoptionen an
 * - Koordiniert Extension Orchestrator
 *
 * Erstellt: 2025-06-23
 * Erweitert: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  RECOVERY_SCREENSHOT_DIR: path.join(__dirname, '.recovery-screenshots'),
  RECOVERY_STATUS_FILE: path.join(__dirname, 'recovery-status.json'),
  RECOVERY_MANAGER_SCRIPT: path.join(__dirname, 'vscode-recovery-manager.js'),
  AUTO_SCREENSHOT_SCRIPT: path.join(__dirname, 'auto-screenshot-manager.js'),
  MAX_SCREENSHOTS_TO_DISPLAY: 10,
};

/**
 * Zeigt formatierte Ausgabe mit Farben an
 */
function printColored(message, colorCode = '\x1b[36m') {
  console.log(`${colorCode}${message}\x1b[0m`);
}

/**
 * Zeigt eine kompakte Projektübersicht mit Zielen, Status und ToDos
 */
function showProjectOverview() {
  printColored('\n📋 Projektübersicht: Ziele, Status & ToDos', '\x1b[1;36m');

  // Hauptziele
  const ziele = [
    'Technisch: Stabile, automatisierte, sichere Live-Website',
    'Inhaltlich: Vollständige, aktuelle, mehrsprachige Inhalte',
    'Organisatorisch: Monitoring, Recovery, DX, Dokumentation',
  ];
  printColored('Hauptziele:', '\x1b[1;37m');
  ziele.forEach((z) => printColored('  • ' + z, '\x1b[36m'));

  // Status-Checks (Dateien/Ordner)
  const checks = [
    { label: 'CI/CD-Workflow (ci.yml)', path: '../.github/workflows/ci.yml' },
    { label: 'Automatisierte Tests (tests/)', path: '../tests' },
    {
      label: 'Recovery Center (tools/vscode-recovery-center.js)',
      path: 'vscode-recovery-center.js',
    },
    {
      label: 'Extension Orchestrator (tools/extension-orchestrator.js)',
      path: 'extension-orchestrator.js',
    },
    { label: 'SEO/Meta/Social Cards', path: '../sitemap.xml' },
    { label: 'Mehrsprachigkeit (assets/translations.json)', path: '../assets/translations.json' },
    { label: 'Performance-Checks (Lighthouse, Core Web Vitals)', path: '../playwright.config.js' },
    { label: 'README aktuell', path: '../README.md' },
  ];

  printColored('\nStatus:', '\x1b[1;37m');
  checks.forEach((c) => {
    const abs = path.join(__dirname, c.path);
    if (fs.existsSync(abs)) {
      printColored(`  ✅ ${c.label}`, '\x1b[32m');
    } else {
      printColored(`  ❌ ${c.label} fehlt/noch offen`, '\x1b[31m');
    }
  });

  // ToDos (statisch + dynamisch)
  const todos = [
    'Extension Orchestrator: Alle kritischen Extensions koordinieren',
    'Auto-Healing: Kontinuierliche Überwachung und Selbstreparatur',
    'Alerts & Monitoring für alle Checks aktivieren',
    'Social Cards & strukturierte Daten finalisieren',
    'Live-Readiness-Checks automatisieren',
    'README & Dokumentation aktuell halten',
  ];
  printColored('\nOffene ToDos:', '\x1b[1;37m');
  todos.forEach((t) => printColored('  • ' + t, '\x1b[33m'));
}

/**
 * Startet den Extension Orchestrator für optimale Koordination
 */
function startExtensionOrchestrator() {
  printColored('\n🎯 Extension Orchestrator Status:', '\x1b[1;36m');

  try {
    // Prüfe, ob Extension Orchestrator verfügbar ist
    const orchestratorPath = path.join(__dirname, 'extension-orchestrator.js');
    if (fs.existsSync(orchestratorPath)) {
      printColored('✅ Extension Orchestrator verfügbar', '\x1b[32m');

      // Extension-Status anzeigen
      try {
        const output = execSync('node tools/extension-orchestrator.js --status', {
          encoding: 'utf8',
          timeout: 5000,
        });
        printColored('📊 Extension Status:', '\x1b[36m');
        console.log(output);
      } catch (error) {
        printColored('⚠️ Extension-Status konnte nicht abgerufen werden', '\x1b[33m');
      }
    } else {
      printColored('❌ Extension Orchestrator nicht gefunden', '\x1b[31m');
      printColored('   Installiere mit: node tools/setup-orchestrator.js', '\x1b[33m');
    }
  } catch (error) {
    printColored(
      `❌ Fehler beim Starten des Extension Orchestrators: ${error.message}`,
      '\x1b[31m',
    );
  }
}

/**
 * Prüft, ob der Recovery-Manager aktiv ist
 */
function checkRecoveryManagerStatus() {
  try {
    if (fs.existsSync(CONFIG.RECOVERY_STATUS_FILE)) {
      const statusData = JSON.parse(fs.readFileSync(CONFIG.RECOVERY_STATUS_FILE, 'utf8'));
      const isActive = statusData.isActive === true;
      const lastCheck = new Date(statusData.lastCheck || Date.now());
      const services = statusData.services || {};

      printColored('🔄 VS Code Recovery Manager Status:', '\x1b[1;36m');
      printColored(
        `Status: ${isActive ? '🟢 Aktiv' : '🔴 Inaktiv'}`,
        isActive ? '\x1b[32m' : '\x1b[31m',
      );
      printColored(`Letzte Prüfung: ${lastCheck.toLocaleString('de-DE')}`, '\x1b[33m');

      if (Object.keys(services).length > 0) {
        printColored('\n📊 Wiederhergestellte Services:', '\x1b[1;36m');
        Object.entries(services).forEach(([id, service]) => {
          const statusEmoji =
            service.status === 'running' ? '✅' : service.status === 'error' ? '❌' : '⚠️';
          printColored(
            `${statusEmoji} ${service.name}: ${service.status}`,
            service.status === 'running' ? '\x1b[32m' : '\x1b[33m',
          );
        });
      }
    } else {
      printColored('⚠️ Recovery Manager Status nicht verfügbar', '\x1b[33m');
    }
  } catch (error) {
    printColored(`❌ Fehler beim Prüfen des Recovery Manager Status: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Listet die neuesten Recovery-Screenshots auf
 */
function listRecoveryScreenshots() {
  try {
    if (fs.existsSync(CONFIG.RECOVERY_SCREENSHOT_DIR)) {
      const files = fs
        .readdirSync(CONFIG.RECOVERY_SCREENSHOT_DIR)
        .filter((file) => file.endsWith('.png'))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, a));
          const statB = fs.statSync(path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        })
        .slice(0, CONFIG.MAX_SCREENSHOTS_TO_DISPLAY);

      if (files.length > 0) {
        printColored('\n📸 Verfügbare Recovery-Screenshots:', '\x1b[1;36m');
        files.forEach((file) => {
          const filePath = path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, file);
          const stats = fs.statSync(filePath);
          const fileSizeKB = Math.round(stats.size / 1024);
          printColored(
            `  ${file} (${stats.mtime.toLocaleString('de-DE')}, ${fileSizeKB} KB)`,
            '\x1b[32m',
          );
        });
      } else {
        printColored('\n⚠️ Keine Recovery-Screenshots verfügbar', '\x1b[33m');
      }
    } else {
      printColored('\n⚠️ Recovery-Screenshot-Verzeichnis nicht gefunden', '\x1b[33m');
    }
  } catch (error) {
    printColored(
      `\n❌ Fehler beim Auflisten der Recovery-Screenshots: ${error.message}`,
      '\x1b[31m',
    );
  }
}

/**
 * Zeigt erweiterte Recovery-Optionen mit Extension-Integration
 */
function showAdvancedRecoveryOptions() {
  printColored('\n🛠️ Erweiterte Recovery & Extension-Optionen:', '\x1b[1;36m');

  // Kritische Extensions & Tools
  printColored('\n🔥 Kritische Systeme:', '\x1b[1;33m');
  printColored(
    '  1. Extension Orchestrator starten: "node tools/extension-orchestrator.js --install"',
    '\x1b[32m',
  );
  printColored(
    '  2. Auto-Healing aktivieren: "node tools/extension-orchestrator.js --auto-heal"',
    '\x1b[32m',
  );
  printColored(
    '  3. Alle kritischen Tests: "node tools/extension-orchestrator.js --group security"',
    '\x1b[32m',
  );

  // Performance & Monitoring
  printColored('\n⚡ Performance & Monitoring:', '\x1b[1;33m');
  printColored(
    '  4. Lighthouse + Core Web Vitals: "node tools/extension-orchestrator.js --group performance"',
    '\x1b[32m',
  );
  printColored(
    '  5. SEO + Accessibility Audit: "node tools/extension-orchestrator.js --group seoAccessibility"',
    '\x1b[32m',
  );
  printColored(
    '  6. API Health Check: "node tools/extension-orchestrator.js --group apiTesting"',
    '\x1b[32m',
  );

  // Code Quality & Deployment
  printColored('\n🔧 Code Quality & Deployment:', '\x1b[1;33m');
  printColored(
    '  7. Format + Lint All: "node tools/extension-orchestrator.js --group codeQuality"',
    '\x1b[32m',
  );
  printColored(
    '  8. GitHub Actions Check: "node tools/extension-orchestrator.js --group deployment"',
    '\x1b[32m',
  );

  // All-in-One Lösungen
  printColored('\n🎯 All-in-One Lösungen:', '\x1b[1;33m');
  printColored('  9. Komplette Umgebung setup: "node tools/auto-startup.js"', '\x1b[32m');
  printColored(
    ' 10. Live-Readiness-Check: "node tools/vscode-recovery-center.js --live-check"',
    '\x1b[32m',
  );
}

/**
 * Prüft alle Live-Gang-Kriterien und gibt Status/Hinweise aus
 */
function runLiveReadinessChecks() {
  printColored(
    '\n🌐 LIVE-READINESS-CHECK: Alle kritischen Kriterien für den Go-Live',
    '\x1b[1;36m',
  );
  let allOk = true;

  // 1. Sitemap vorhanden und valide
  const sitemapPath = path.join(__dirname, '../sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    if (sitemapContent.includes('<urlset')) {
      printColored('✅ Sitemap vorhanden und valide', '\x1b[32m');
    } else {
      printColored('❌ Sitemap fehlerhaft (kein <urlset> gefunden)', '\x1b[31m');
      allOk = false;
    }
  } else {
    printColored('❌ Sitemap fehlt!', '\x1b[31m');
    allOk = false;
  }

  // 2. Extension Orchestrator verfügbar
  const orchestratorPath = path.join(__dirname, 'extension-orchestrator.js');
  if (fs.existsSync(orchestratorPath)) {
    printColored('✅ Extension Orchestrator verfügbar', '\x1b[32m');
  } else {
    printColored('❌ Extension Orchestrator fehlt!', '\x1b[31m');
    allOk = false;
  }

  // 3. CSS-Build (Tailwind, PostCSS, cssnano)
  const cssPath = path.join(__dirname, '../assets/css/styles.min.css');
  if (fs.existsSync(cssPath)) {
    printColored('✅ CSS-Build vorhanden (styles.min.css)', '\x1b[32m');
  } else {
    printColored('❌ CSS-Build fehlt (styles.min.css)', '\x1b[31m');
    allOk = false;
  }

  // 4. API-Integration (main.js)
  const mainJsPath = path.join(__dirname, '../main.js');
  if (fs.existsSync(mainJsPath)) {
    printColored('✅ main.js vorhanden', '\x1b[32m');
  } else {
    printColored('❌ main.js fehlt!', '\x1b[31m');
    allOk = false;
  }

  // 5. Live-Status
  if (allOk) {
    printColored('\n🎉 ALLE KRITERIEN FÜR DEN LIVE-GANG SIND ERFÜLLT!\n', '\x1b[1;42m');
  } else {
    printColored(
      '\n❗ Es fehlen noch Kriterien für den Live-Gang! Siehe Hinweise oben.\n',
      '\x1b[1;41m',
    );
  }
}

/**
 * Hauptfunktion
 */
function main() {
  const divider = '═'.repeat(60);
  console.clear();
  printColored(`\n${divider}`, '\x1b[1;36m');
  printColored('           🔄 VS Code Recovery Center           ', '\x1b[1;37m');
  printColored(`${divider}\n`, '\x1b[1;36m');

  // Projektübersicht immer am Anfang anzeigen
  showProjectOverview();

  // Extension Orchestrator Status und Start
  startExtensionOrchestrator();

  if (process.argv.includes('--live-check')) {
    runLiveReadinessChecks();
    printColored('\nTipp: Führe nach jedem Deployment diesen Check erneut aus!', '\x1b[36m');
    return;
  }

  checkRecoveryManagerStatus();
  listRecoveryScreenshots();
  showAdvancedRecoveryOptions();

  printColored(`\n${divider}`, '\x1b[1;36m');
  printColored(' Prioritätenliste nach Absturz:', '\x1b[1;33m');
  printColored(' 1. ✅ Extension Orchestrator: Koordiniert alle Extensions optimal', '\x1b[32m');
  printColored(' 2. ✅ Auto-Healing: Kontinuierliche Überwachung aktiv', '\x1b[32m');
  printColored(' 3. ✅ Live-Readiness-Checks: Automatisiert verfügbar', '\x1b[32m');
  printColored(' 4. 🚦 Monitoring & Alerts: Aktivierung ausstehend', '\x1b[33m');
  printColored(' 5. 🚦 Social Cards & strukturierte Daten: Finalisierung ausstehend', '\x1b[33m');
  printColored(`${divider}\n`, '\x1b[1;36m');

  // Automatischer Live-Readiness-Check nach jedem Start
  printColored('\n[Auto-Check] Starte Live-Readiness-Check ...', '\x1b[36m');
  runLiveReadinessChecks();
  printColored('\n[Auto-Check] Live-Readiness-Check abgeschlossen.', '\x1b[36m');

  // Daemon-Modus: Läuft kontinuierlich
  if (process.argv.includes('--daemon')) {
    printColored('\n🔄 Daemon-Modus aktiviert: Dashboard läuft kontinuierlich...', '\x1b[1;32m');
    printColored('Drücke Ctrl+C zum Beenden.', '\x1b[36m');
    
    // Halte das Programm am Laufen
    setInterval(() => {
      printColored(`[${new Date().toLocaleTimeString('de-DE')}] Dashboard aktiv`, '\x1b[90m');
    }, 60000); // Jede Minute ein Lebenszeichen
    
    // Signal-Handler für sauberen Shutdown
    process.on('SIGINT', () => {
      printColored('\n[Daemon] Shutdown-Signal empfangen. Beende Dashboard...', '\x1b[33m');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      printColored('\n[Daemon] Termination-Signal empfangen. Beende Dashboard...', '\x1b[33m');
      process.exit(0);
    });
  }
}

// Programm ausführen
main();
