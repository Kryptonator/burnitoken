#!/usr/bin/env node

/**
 * VS Code Recovery Center
 *
 * Zentrale Benutzeroberfläche für alle Wiederherstellungsfunktionen im Projekt
 * - Zeigt den Status des VS Code Recovery Managers
 * - Listet verfügbare Recovery-Screenshots auf
 * - Bietet Wiederherstellungsoptionen an
 *
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const https = require('https');

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

// Hilfsfunktion für sicheres Lesen von Dateien
function safeReadFileSync(filePath, encoding = 'utf8') {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (e) {
    printColored(`❌ Fehler beim Lesen von ${filePath}: ${e.message}`, '\x1b[31m');
    return null;
  }
}
// Hilfsfunktion für sicheres Stat
function safeStatSync(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (e) {
    printColored(`❌ Fehler bei stat für ${filePath}: ${e.message}`, '\x1b[31m');
    return null;
  }
}
// Hilfsfunktion für sicheres readdir
function safeReaddirSync(dirPath) {
  try {
    return fs.readdirSync(dirPath);
  } catch (e) {
    printColored(`❌ Fehler beim Lesen von Verzeichnis ${dirPath}: ${e.message}`, '\x1b[31m');
    return [];
  }
}

/**
 * Listet die neuesten Recovery-Screenshots auf
 */
function listRecoveryScreenshots() {
  try {
    if (fs.existsSync(CONFIG.RECOVERY_SCREENSHOT_DIR)) {
      const files = safeReaddirSync(CONFIG.RECOVERY_SCREENSHOT_DIR)
        .filter((file) => file.endsWith('.png'))
        .sort((a, b) => {
          const statA = safeStatSync(path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, a)) || { mtime: 0 };
          const statB = safeStatSync(path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, b)) || { mtime: 0 };
          return (statB.mtime?.getTime?.() || 0) - (statA.mtime?.getTime?.() || 0);
        })
        .slice(0, CONFIG.MAX_SCREENSHOTS_TO_DISPLAY);

      if (files.length > 0) {
        printColored('\n📸 Verfügbare Recovery-Screenshots:', '\x1b[1;36m');
        files.forEach((file) => {
          const filePath = path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, file);
          const stats = safeStatSync(filePath);
          const fileSizeKB = stats ? Math.round(stats.size / 1024) : '?';
          const mtime = stats ? stats.mtime.toLocaleString('de-DE') : '?';
          printColored(`  ${file} (${mtime}, ${fileSizeKB} KB)`, '\x1b[32m');
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
    const sitemapContent = safeReadFileSync(sitemapPath, 'utf8');
    if (sitemapContent && sitemapContent.includes('<urlset')) {
      printColored('✅ Sitemap vorhanden und valide', '\x1b[32m');
    } else {
      printColored('❌ Sitemap fehlerhaft (kein <urlset> gefunden)', '\x1b[31m');
      allOk = false;
    }
  } else {
    printColored('❌ Sitemap fehlt!', '\x1b[31m');
    allOk = false;
  }

  // 2. Übersetzungen: 14 Sprachen, 22 neue Keys
  const translationsPath = path.join(__dirname, '../assets/translations.json');
  let translationsOk = true;
  if (fs.existsSync(translationsPath)) {
    try {
      const translationsContent = safeReadFileSync(translationsPath, 'utf8');
      const translations = translationsContent ? JSON.parse(translationsContent) : {};
      const requiredLangs = [
        'de',
        'en',
        'es',
        'fr',
        'pt',
        'ar',
        'bn',
        'hi',
        'ja',
        'ko',
        'ru',
        'tr',
        'zh',
        'it',
      ];
      const requiredKeys = [
        'alt_logo',
        'alt_burn_chart',
        'alt_burni_lagerfeuer',
        'alt_burni_tresor',
        'alt_exchange',
        'alt_gamepad',
        'alt_vote',
        'alt_rewards',
        'table_rank',
        'table_wallet',
        'table_burned',
        'table_locked',
        'table_rewards',
        'table_total',
        'table_action',
        'btn_connect_aria_label',
        'btn_disconnect_aria_label',
        'btn_language_aria_label',
        'btn_theme_aria_label',
        'btn_menu_aria_label',
        'btn_close_aria_label',
        'btn_recover_aria_label',
        'btn_copy_aria_label',
      ];
      for (const lang of requiredLangs) {
        if (!translations[lang] || !translations[lang].translation) {
          printColored(`❌ Übersetzung für ${lang} fehlt!`, '\x1b[31m');
          translationsOk = false;
          allOk = false;
        } else {
          for (const key of requiredKeys) {
            if (!(key in translations[lang].translation)) {
              printColored(`❌ Key "${key}" fehlt in ${lang}`, '\x1b[31m');
              translationsOk = false;
              allOk = false;
            }
          }
        }
      }
      if (translationsOk) printColored('✅ Alle Übersetzungen vollständig', '\x1b[32m');
    } catch (e) {
      printColored('❌ Fehler beim Parsen von translations.json', '\x1b[31m');
      allOk = false;
    }
  } else {
    printColored('❌ translations.json fehlt!', '\x1b[31m');
    allOk = false;
  }

  // 3. Accessibility-Test (nur Hinweis, automatisiert via npm run test)
  printColored('ℹ️ Accessibility-Test: npm run test (axe, pa11y, playwright)', '\x1b[36m');

  // 4. SEO-Test (nur Hinweis, automatisiert via npm run test)
  printColored('ℹ️ SEO-Test: npm run test (Lighthouse, Meta-Validator)', '\x1b[36m');

  // 5. API-Integration (XRPL)
  const mainJsPath = path.join(__dirname, '../main.js');
  if (fs.existsSync(mainJsPath)) {
    const mainJs = safeReadFileSync(mainJsPath, 'utf8');
    if (mainJs && mainJs.includes('fetchLivePrices')) {
      printColored('✅ API-Integration (fetchLivePrices) vorhanden', '\x1b[32m');
    } else {
      printColored('❌ API-Integration (fetchLivePrices) fehlt!', '\x1b[31m');
      allOk = false;
    }
  } else {
    printColored('❌ main.js fehlt!', '\x1b[31m');
    allOk = false;
  }

  // 6. Asset-Bereitstellung
  const assetChecks = [
    '../assets/burni-logo.png',
    '../assets/burni-social.jpg',
    '../assets/videos/1burni-favicon-im-pixar-comic-sti.mp4',
    '../assets/browserconfig.xml',
    '../assets/fonts',
    '../assets/css/styles.min.css',
    '../assets/images/favicon.ico',
    '../assets/images/burni-chart.jpg',
    '../assets/images/exchange.png',
  ];
  let assetsOk = true;
  for (const relPath of assetChecks) {
    const absPath = path.join(__dirname, relPath);
    if (!fs.existsSync(absPath)) {
      const dir = path.dirname(absPath);
      const base = path.basename(absPath, path.extname(absPath));
      const altExts = ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico'];
      let foundAlternative = false;
      for (const ext of altExts) {
        const altPath = path.join(dir, base + ext);
        if (fs.existsSync(altPath)) {
          printColored(
            `⚠️  Asset fehlt als ${path.extname(absPath)}, aber vorhanden als ${ext}: ${path.relative(__dirname, altPath)}`,
            '\x1b[33m',
          );
          foundAlternative = true;
          break;
        }
      }
      if (!foundAlternative) {
        printColored(`❌ Asset fehlt: ${relPath}`, '\x1b[31m');
      }
      assetsOk = false;
      allOk = false;
    }
  }
  if (assetsOk) printColored('✅ Alle Kern-Assets vorhanden', '\x1b[32m');

  // 7. CSP/Nonce (nur Hinweis, da dynamisch)
  printColored(
    'ℹ️ CSP/Nonce: Stelle sicher, dass Nonce-Generierung und CSP-Header im Deployment aktiv sind!',
    '\x1b[36m',
  );

  // 8. CSS-Build (Tailwind, PostCSS, cssnano)
  const cssPath = path.join(__dirname, '../assets/css/styles.min.css');
  if (fs.existsSync(cssPath)) {
    printColored('✅ CSS-Build vorhanden (styles.min.css)', '\x1b[32m');
  } else {
    printColored('❌ CSS-Build fehlt (styles.min.css)', '\x1b[31m');
    allOk = false;
  }

  // 9. Monitoring (nur Hinweis)
  printColored(
    'ℹ️ Monitoring: Aktiviere Sentry, UptimeRobot, Google Search Console, Core Web Vitals!',
    '\x1b[36m',
  );

  // 10. Developer Experience (nur Hinweis)
  printColored(
    'ℹ️ Developer Experience: CI/CD, Prettier, ESLint, Tests, README aktuell?',
    '\x1b[36m',
  );

  // 11. Live-Status
  if (allOk) {
    printColored('\n🎉 ALLE KRITERIEN FÜR DEN LIVE-GANG SIND ERFÜLLT!\n', '\x1b[1;42m');
  } else {
    printColored(
      '\n❗ Es fehlen noch Kriterien für den Live-Gang! Siehe Hinweise oben.\n',
      '\x1b[1;41m',
    );
    sendAlert(
      '[Recovery Center] Live-Readiness-Check fehlgeschlagen! Siehe Recovery Center für Details.',
    );
  }
}

function sendAlert(message) {
  if (!ALERT_WEBHOOK_URL) return;
  try {
    const url = new URL(ALERT_WEBHOOK_URL);
    const data = JSON.stringify({ text: message });
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
    };
    const req = https.request(options, (res) => {});
    req.on('error', (error) =>
      printColored('❌ Fehler beim Senden des Alerts: ' + error.message, '\x1b[31m'),
    );
    req.write(data);
    req.end();
  } catch (e) {
    printColored('❌ Fehler beim Senden des Alerts: ' + e.message, '\x1b[31m');
  }
}

/**
 * Zeigt Wiederherstellungsoptionen an
 */
function showRecoveryOptions() {
  printColored('\n🛠️ Wiederherstellungsoptionen:', '\x1b[1;36m');
  printColored(
    '  1. Recovery Manager neu starten: "node tools/vscode-recovery-manager.js --force-restart"',
    '\x1b[32m',
  );
  printColored(
    '  2. Sofortigen Recovery-Screenshot erstellen: "node tools/auto-screenshot-manager.js --now"',
    '\x1b[32m',
  );
  printColored(
    '  3. Google Search Console Status prüfen: "node tools/gsc-status-check.js"',
    '\x1b[32m',
  );
  printColored(
    '  4. Google Search Console Setup Guide: "node tools/gsc-setup-guide.js"',
    '\x1b[32m',
  );
  printColored('  5. Core Web Vitals prüfen: "node tools/core-web-vitals-monitor.js"', '\x1b[32m');
  printColored(
    '  6. Meta-Tags & Social Cards validieren: "node tools/meta-tags-validator.js"',
    '\x1b[32m',
  );
  printColored('  7. Alle Dienste prüfen: "npm run validate"', '\x1b[32m');
  printColored(
    '  8. Live-Readiness-Check: "node tools/vscode-recovery-center.js --live-check"',
    '\x1b[32m',
  );
  printColored('  9. Monitoring-Status prüfen: "node tools/sentry-status.js"', '\x1b[32m');
  printColored(' 10. Deployment-Check: "node tools/deployment-check.js"', '\x1b[32m');
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
    { label: 'Google Search Console API (tools/gsc-status-check.js)', path: 'gsc-status-check.js' },
    { label: 'Monitoring/Alerts (Sentry, UptimeRobot)', path: '../sentry.client.js' },
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
    'Alerts & Monitoring für alle Checks aktivieren',
    'Social Cards & strukturierte Daten finalisieren',
    'Regelmäßige Live-Readiness-Checks automatisieren',
    'README & Dokumentation aktuell halten',
    'DX-Verbesserungen (Prettier, ESLint, Onboarding) umsetzen',
    'Recovery- und Health-Checks weiter ausbauen',
  ];
  printColored('\nOffene ToDos:', '\x1b[1;37m');
  todos.forEach((t) => printColored('  • ' + t, '\x1b[33m'));
}

/**
 * Zeigt dynamische Überwachung aller Kern-Tools, Cloud-Integrationen und Extensions
 */
function showToolAndCloudStatus() {
  printColored('\n☁️ Tool- & Cloud-Überwachung:', '\x1b[1;36m');
  const checks = [
    {
      label: 'Google Search Console API',
      path: 'gsc-status-check.js',
      log: '../tools/gsc-status.log',
      todo: 'API-Status prüfen & Alerts einrichten',
    },
    {
      label: 'Sentry Monitoring',
      path: '../sentry.client.js',
      log: '../logs/sentry.log',
      todo: 'Sentry-Status & letzte Errors prüfen',
    },
    {
      label: 'Playwright/Lighthouse Tests',
      path: '../playwright.config.js',
      log: '../test-results/playwright.log',
      todo: 'Automatisierte Tests regelmäßig ausführen',
    },
    {
      label: 'GitHub Actions CI/CD',
      path: '../.github/workflows/ci.yml',
      log: '../.github/workflows/ci.log',
      todo: 'CI/CD-Status & letzte Runs prüfen',
    },
    {
      label: 'Cloud Worker/Serverless',
      path: '../cloudflare-worker.js',
      log: '../logs/worker.log',
      todo: 'Worker-Status & Fehler überwachen',
    },
    {
      label: 'VS Code Extensions',
      path: '../.vscode/extensions.json',
      log: null,
      todo: 'Extensions aktuell & funktionsfähig halten',
    },
  ];
  checks.forEach((c) => {
    const abs = path.join(__dirname, c.path);
    if (fs.existsSync(abs)) {
      printColored(`  ✅ ${c.label} installiert`, '\x1b[32m');
      if (c.log && fs.existsSync(path.join(__dirname, c.log))) {
        const logContent = fs.readFileSync(path.join(__dirname, c.log), 'utf8');
        const lastLine = logContent.trim().split('\n').pop();
        printColored(`     Letzter Status: ${lastLine}`, '\x1b[36m');
      }
    } else {
      printColored(`  ❌ ${c.label} fehlt/fehlerhaft`, '\x1b[31m');
      printColored(`     ToDo: ${c.todo}`, '\x1b[33m');
    }
  });
}

/**
 * Zeigt die letzten Fehler aus Logs (Sentry, Playwright, CI, Snyk, Dependabot)
 */
function showRecentErrorsAndSecurity() {
  printColored('\n🚨 Letzte Fehler & Security-Status:', '\x1b[1;31m');
  let criticalErrorFound = false;
  // Sentry-Log
  const sentryLog = path.join(__dirname, '../logs/sentry.log');
  if (fs.existsSync(sentryLog)) {
    const content = safeReadFileSync(sentryLog, 'utf8');
    const lines = content ? content.trim().split('\n') : [];
    const lastError = lines
      .reverse()
      .find((l) => l.toLowerCase().includes('error') || l.toLowerCase().includes('exception'));
    if (lastError) {
      printColored('  Sentry: ' + lastError, '\x1b[31m');
      criticalErrorFound = true;
    } else {
      printColored('  Sentry: Keine kritischen Fehler gefunden', '\x1b[32m');
    }
  } else {
    printColored('  Sentry: Kein Log gefunden', '\x1b[33m');
  }
  // Playwright-Log
  const pwLog = path.join(__dirname, '../test-results/playwright.log');
  if (fs.existsSync(pwLog)) {
    const content = safeReadFileSync(pwLog, 'utf8');
    const lines = content ? content.trim().split('\n') : [];
    const lastFail = lines.reverse().find((l) => l.toLowerCase().includes('fail'));
    if (lastFail) {
      printColored('  Playwright: ' + lastFail, '\x1b[31m');
      criticalErrorFound = true;
    } else {
      printColored('  Playwright: Alle Tests grün', '\x1b[32m');
    }
  } else {
    printColored('  Playwright: Kein Log gefunden', '\x1b[33m');
  }
  // CI-Log
  const ciLog = path.join(__dirname, '../.github/workflows/ci.log');
  if (fs.existsSync(ciLog)) {
    const content = safeReadFileSync(ciLog, 'utf8');
    const lines = content ? content.trim().split('\n') : [];
    const lastFail = lines
      .reverse()
      .find((l) => l.toLowerCase().includes('fail') || l.toLowerCase().includes('error'));
    if (lastFail) {
      printColored('  CI/CD: ' + lastFail, '\x1b[31m');
      criticalErrorFound = true;
    } else {
      printColored('  CI/CD: Letzter Run erfolgreich', '\x1b[32m');
    }
  } else {
    printColored('  CI/CD: Kein Log gefunden', '\x1b[33m');
  }
  // Snyk-Log
  const snykLog = path.join(__dirname, '../test-results/snyk.log');
  if (fs.existsSync(snykLog)) {
    const content = safeReadFileSync(snykLog, 'utf8');
    const lines = content ? content.trim().split('\n') : [];
    const lastVuln = lines
      .reverse()
      .find((l) => l.toLowerCase().includes('vuln') || l.toLowerCase().includes('critical'));
    if (lastVuln) {
      printColored('  Snyk: ' + lastVuln, '\x1b[31m');
      criticalErrorFound = true;
    } else {
      printColored('  Snyk: Keine kritischen Schwachstellen', '\x1b[32m');
    }
  } else {
    printColored('  Snyk: Kein Log gefunden', '\x1b[33m');
  }
  // Dependabot Alerts
  const dependabotAlerts = path.join(__dirname, '../.github/dependabot-alerts.json');
  if (fs.existsSync(dependabotAlerts)) {
    const content = safeReadFileSync(dependabotAlerts, 'utf8');
    let alerts = [];
    try {
      alerts = content ? JSON.parse(content) : [];
    } catch (e) {
      printColored('  Dependabot: Fehler beim Parsen!', '\x1b[33m');
    }
    if (alerts.length > 0) {
      printColored(`  Dependabot: ${alerts.length} offene Alerts`, '\x1b[31m');
      alerts.slice(0, 3).forEach((a) => printColored('    - ' + a.summary, '\x1b[33m'));
      criticalErrorFound = true;
    } else {
      printColored('  Dependabot: Keine offenen Alerts', '\x1b[32m');
    }
  } else {
    printColored('  Dependabot: Kein Alert-Export gefunden', '\x1b[33m');
  }
  if (criticalErrorFound) {
    sendAlert(
      '[Recovery Center] Kritische Fehler oder Security-Probleme erkannt! Siehe Recovery Center für Details.',
    );
  }
}

/**
 * Führt Self-Checks für alle Kern-Tools und Integrationen durch
 */
function runSelfChecks() {
  printColored('\n🔎 Self-Check: Funktionsfähigkeit aller Kern-Tools', '\x1b[1;36m');
  // Google Search Console API
  try {
    const gscScript = path.join(__dirname, 'gsc-status-check.js');
    if (fs.existsSync(gscScript)) {
      const result = safeExecSync(`node ${gscScript} --diagnose`);
      if (result.toLowerCase().includes('ok') || result.toLowerCase().includes('success')) {
        printColored('  ✅ Google Search Console API erreichbar', '\x1b[32m');
      } else {
        printColored(
          '  ⚠️  GSC-API: Antwort prüfen! (' + result.trim().split('\n').pop() + ')',
          '\x1b[33m',
        );
      }
    } else {
      printColored('  ❌ GSC-API Self-Check nicht möglich (Script fehlt)', '\x1b[31m');
    }
  } catch (e) {
    printColored('  ❌ GSC-API Self-Check Fehler: ' + e.message, '\x1b[31m');
  }
  // Sentry Monitoring
  try {
    const sentryClient = path.join(__dirname, '../sentry.client.js');
    if (fs.existsSync(sentryClient)) {
      printColored('  ✅ Sentry-Client vorhanden (Status siehe Log)', '\x1b[32m');
    } else {
      printColored('  ❌ Sentry-Client fehlt', '\x1b[31m');
    }
  } catch (e) {
    printColored('  ❌ Sentry Self-Check Fehler: ' + e.message, '\x1b[31m');
  }
  // Playwright Test
  try {
    const pwConfig = path.join(__dirname, '../playwright.config.js');
    if (fs.existsSync(pwConfig)) {
      const result = safeExecSync('npx playwright test --list');
      if (result.toLowerCase().includes('test')) {
        printColored('  ✅ Playwright-Tests erkannt', '\x1b[32m');
      } else {
        printColored('  ⚠️  Playwright: Keine Tests gefunden', '\x1b[33m');
      }
    } else {
      printColored('  ❌ Playwright-Konfiguration fehlt', '\x1b[31m');
    }
  } catch (e) {
    printColored('  ❌ Playwright Self-Check Fehler: ' + e.message, '\x1b[31m');
  }
  // Snyk
  try {
    const snykLog = path.join(__dirname, '../test-results/snyk.log');
    if (fs.existsSync(snykLog)) {
      printColored('  ✅ Snyk-Scan vorhanden (Status siehe Log)', '\x1b[32m');
    } else {
      printColored('  ❌ Snyk-Scan fehlt', '\x1b[31m');
    }
  } catch (e) {
    printColored('  ❌ Snyk Self-Check Fehler: ' + e.message, '\x1b[31m');
  }
  // Dependabot
  try {
    const dependabotAlerts = path.join(__dirname, '../.github/dependabot-alerts.json');
    if (fs.existsSync(dependabotAlerts)) {
      printColored('  ✅ Dependabot-Alerts vorhanden (Status siehe oben)', '\x1b[32m');
    } else {
      printColored('  ❌ Dependabot-Alerts fehlen', '\x1b[31m');
    }
  } catch (e) {
    printColored('  ❌ Dependabot Self-Check Fehler: ' + e.message, '\x1b[31m');
  }
}

// Hilfsfunktion für sichere execSync-Aufrufe
function safeExecSync(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 8000, ...opts });
  } catch (e) {
    printColored(`❌ Fehler bei execSync (${cmd}): ${e.message}`, '\x1b[31m');
    return '';
  }
}

/**
 * Prüft, ob README, CHANGELOG und Onboarding-Doku aktuell sind
 */
function checkDocumentationStatus() {
  printColored('\n📚 Dokumentations-Check:', '\x1b[1;36m');
  const docs = [
    { name: 'README.md', path: '../README.md' },
    { name: 'CHANGELOG.md', path: '../CHANGELOG.md' },
    { name: 'Onboarding (docs/)', path: '../pages/docs/' },
  ];
  docs.forEach((doc) => {
    const abs = path.join(__dirname, doc.path);
    if (fs.existsSync(abs)) {
      const stats = safeStatSync(abs);
      const modified = stats ? stats.mtime.toLocaleString('de-DE') : '?';
      printColored(`  ✅ ${doc.name} vorhanden (letzte Änderung: ${modified})`, '\x1b[32m');
    } else {
      printColored(`  ❌ ${doc.name} fehlt!`, '\x1b[31m');
    }
  });
}

/**
 * Exportiert den aktuellen Recovery/Projektstatus als Markdown
 */
function exportStatusMarkdown() {
  const mdPath = path.join(__dirname, '../RECOVERY_STATUS.md');
  let md = '# Burnitoken Recovery/Projektstatus\n\n';
  md += '## Stand: ' + new Date().toLocaleString('de-DE') + '\n\n';
  md += '### Kernbereiche\n';
  const bereiche = [
    {
      name: 'Accessibility',
      ok: fs.existsSync(path.join(__dirname, '../test-results/playwright.log')),
    },
    { name: 'SEO', ok: fs.existsSync(path.join(__dirname, '../sitemap.xml')) },
    { name: 'Security', ok: fs.existsSync(path.join(__dirname, '../test-results/snyk.log')) },
    { name: 'DX', ok: fs.existsSync(path.join(__dirname, '../.github/workflows/ci.yml')) },
    { name: 'Monitoring', ok: fs.existsSync(path.join(__dirname, '../sentry.client.js')) },
    { name: 'Recovery', ok: fs.existsSync(path.join(__dirname, 'vscode-recovery-center.js')) },
  ];
  bereiche.forEach((b) => {
    md += `- ${b.ok ? '✅' : '❌'} ${b.name}\n`;
  });
  md += '\n### Hinweise\n';
  if (!fs.existsSync(path.join(__dirname, '../test-results/playwright.log')))
    md += '- Accessibility-Tests fehlen oder zu alt\n';
  if (!fs.existsSync(path.join(__dirname, '../sitemap.xml'))) md += '- SEO: Sitemap fehlt\n';
  if (!fs.existsSync(path.join(__dirname, '../test-results/snyk.log')))
    md += '- Security: Snyk-Scan fehlt\n';
  if (!fs.existsSync(path.join(__dirname, '../.github/workflows/ci.yml')))
    md += '- DX: CI/CD-Workflow fehlt\n';
  if (!fs.existsSync(path.join(__dirname, '../sentry.client.js')))
    md += '- Monitoring: Sentry fehlt\n';
  if (!fs.existsSync(path.join(__dirname, 'vscode-recovery-center.js')))
    md += '- Recovery Center fehlt\n';
  try {
    fs.writeFileSync(mdPath, md, 'utf8');
    printColored(`\n📝 Status-Export als Markdown: RECOVERY_STATUS.md aktualisiert`, '\x1b[36m');
  } catch (e) {
    printColored(`\n❌ Fehler beim Schreiben von RECOVERY_STATUS.md: ${e.message}`, '\x1b[31m');
  }
}

/**
 * Exportiert die recovery-history.json als Markdown (RECOVERY_HISTORY.md)
 */
function exportHistoryMarkdown() {
  const historyPath = path.join(__dirname, '../recovery-history.json');
  const mdPath = path.join(__dirname, '../RECOVERY_HISTORY.md');
  let history = [];
  try {
    if (fs.existsSync(historyPath)) {
      const content = safeReadFileSync(historyPath, 'utf8');
      history = content ? JSON.parse(content) : [];
    }
  } catch (e) {
    printColored('❌ Fehler beim Lesen der History: ' + e.message, '\x1b[31m');
  }
  let md = '# Recovery Center Verlauf\n\n| Datum | Status | Fehler | ToDos |\n|---|---|---|---|\n';
  history
    .slice(-50)
    .reverse()
    .forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleString('de-DE');
      const status = entry.status === 'OK' ? '✅' : '❌';
      const errors = entry.errors && entry.errors.length ? entry.errors.join('<br>') : '-';
      const todos = entry.todos && entry.todos.length ? entry.todos.join('<br>') : '-';
      md += `| ${date} | ${status} | ${errors} | ${todos} |\n`;
    });
  try {
    fs.writeFileSync(mdPath, md, 'utf8');
    printColored('📄 Verlauf als Markdown exportiert (RECOVERY_HISTORY.md)', '\x1b[36m');
  } catch (e) {
    printColored('❌ Fehler beim Schreiben von RECOVERY_HISTORY.md: ' + e.message, '\x1b[31m');
  }
}

/**
 * Zeigt Fortschrittsbalken und Reminder/Alerts für alle Kernbereiche
 */
function showProgressAndReminders() {
  printColored('\n📈 Fortschritt & Reminder:', '\x1b[1;36m');
  // Fortschritt pro Bereich (Beispielwerte, dynamisch anpassbar)
  const bereiche = [
    {
      name: 'Accessibility',
      done: fs.existsSync(path.join(__dirname, '../test-results/playwright.log')),
      todo: false,
    },
    { name: 'SEO', done: fs.existsSync(path.join(__dirname, '../sitemap.xml')), todo: false },
    {
      name: 'Security',
      done: fs.existsSync(path.join(__dirname, '../test-results/snyk.log')),
      todo: false,
    },
    {
      name: 'DX',
      done: fs.existsSync(path.join(__dirname, '../.github/workflows/ci.yml')),
      todo: false,
    },
    {
      name: 'Monitoring',
      done: fs.existsSync(path.join(__dirname, '../sentry.client.js')),
      todo: false,
    },
    {
      name: 'Recovery',
      done: fs.existsSync(path.join(__dirname, 'vscode-recovery-center.js')),
      todo: false,
    },
  ];
  bereiche.forEach((b) => {
    const status = b.done ? '✅' : '❌';
    printColored(`  ${status} ${b.name}`, b.done ? '\x1b[32m' : '\x1b[31m');
  });
  // Reminder/Alerts (wenn Bereich fehlt oder Problem erkannt)
  if (!fs.existsSync(path.join(__dirname, '../test-results/playwright.log'))) {
    printColored(
      '  ⚠️  Accessibility-Tests fehlen oder wurden zu lange nicht ausgeführt!',
      '\x1b[33m',
    );
  }
  if (!fs.existsSync(path.join(__dirname, '../sitemap.xml'))) {
    printColored('  ⚠️  SEO: Sitemap fehlt!', '\x1b[33m');
  }
  if (!fs.existsSync(path.join(__dirname, '../test-results/snyk.log'))) {
    printColored('  ⚠️  Security: Snyk-Scan fehlt!', '\x1b[33m');
  }
  if (!fs.existsSync(path.join(__dirname, '../.github/workflows/ci.yml'))) {
    printColored('  ⚠️  DX: CI/CD-Workflow fehlt!', '\x1b[33m');
  }
  if (!fs.existsSync(path.join(__dirname, '../sentry.client.js'))) {
    printColored('  ⚠️  Monitoring: Sentry fehlt!', '\x1b[33m');
  }
  if (!fs.existsSync(path.join(__dirname, 'vscode-recovery-center.js'))) {
    printColored('  ⚠️  Recovery Center fehlt!', '\x1b[33m');
  }
}

/**
 * Zeigt die wichtigsten Fehler und Status aus ERROR_REPORT.md
 */
function showErrorReportSummary() {
  const errorReportPath = path.join(__dirname, '../ERROR_REPORT.md');
  if (fs.existsSync(errorReportPath)) {
    printColored('\n🛑 Fehler- und Status-Report:', '\x1b[1;31m');
    const lines = fs.readFileSync(errorReportPath, 'utf8').split('\n');
    // Zeige die ersten 15 Zeilen oder bis zur ersten Leerzeile nach Fehlern
    let count = 0;
    for (const line of lines) {
      if (line.trim() === '' && count > 5) break;
      printColored('  ' + line, '\x1b[31m');
      count++;
      if (count >= 15) break;
    }
  } else {
    printColored('\nℹ️ Kein ERROR_REPORT.md gefunden.', '\x1b[33m');
  }
}

/**
 * Prüft alle Automatisierungen, Extensions und Bots und stellt sie ggf. wieder her
 */
function runAutomationHealthChecks() {
  printColored('\n🤖 Automatisierungs- & Bot-Health-Check', '\x1b[1;36m');
  let allOk = true;

  // 1. Absturzbericht prüfen/generieren
  const crashLogPath = path.join(__dirname, 'crash.log');
  if (fs.existsSync(crashLogPath)) {
    printColored('❗ Absturz erkannt! Crash-Log gefunden.', '\x1b[31m');
    const crashLog = fs.readFileSync(crashLogPath, 'utf8');
    printColored('--- Crash-Log ---', '\x1b[33m');
    console.log(crashLog);
    printColored('-----------------', '\x1b[33m');
    // Optional: Crash-Log an Monitoring senden
    allOk = false;
  } else {
    printColored('✅ Kein Absturz seit letztem Start erkannt.', '\x1b[32m');
  }

  // 2. VS Code Extensions prüfen (nur Beispiel, da Node.js)
  try {
    const extensions = [
      'dbaeumer.vscode-eslint',
      'esbenp.prettier-vscode',
      'streetsidesoftware.code-spell-checker',
      'ms-playwright.playwright',
      'github.vscode-pull-request-github',
    ];
    const extDir = path.join(os.homedir(), '.vscode', 'extensions');
    let missing = [];
    extensions.forEach((ext) => {
      if (!fs.existsSync(path.join(extDir, ext))) {
        missing.push(ext);
      }
    });
    if (missing.length > 0) {
      printColored('❌ Fehlende VS Code Extensions:', '\x1b[31m');
      missing.forEach((e) => printColored('  - ' + e, '\x1b[33m'));
      allOk = false;
    } else {
      printColored('✅ Alle kritischen VS Code Extensions installiert.', '\x1b[32m');
    }
  } catch (e) {
    printColored('⚠️ Konnte Extensions nicht prüfen (Berechtigungen?)', '\x1b[33m');
    allOk = false;
  }

  // 3. Bots & Tokens prüfen (z.B. GEMINI_BOT_TOKEN)
  const secretsPath = path.join(__dirname, '../config.secrets');
  let geminiToken = null;
  if (fs.existsSync(secretsPath)) {
    const secrets = fs.readFileSync(secretsPath, 'utf8');
    const match = secrets.match(/GEMINI_BOT_TOKEN\s*=\s*(\S+)/);
    if (match) {
      geminiToken = match[1];
      printColored('✅ GEMINI_BOT_TOKEN gefunden.', '\x1b[32m');
      // Hier könnte ein Live-Check gegen den Bot erfolgen (z.B. HTTP-Request)
      // ...
    } else {
      printColored('❌ GEMINI_BOT_TOKEN fehlt in config.secrets!', '\x1b[31m');
      allOk = false;
    }
  } else {
    printColored('❌ config.secrets fehlt!', '\x1b[31m');
    allOk = false;
  }

  // 4. Weitere Bots prüfen (z.B. Slack, Discord, eigene Bots)
  // Beispiel: Slack Bot Token
  const slackMatch =
    secretsPath && fs.existsSync(secretsPath)
      ? fs.readFileSync(secretsPath, 'utf8').match(/SLACK_BOT_TOKEN\s*=\s*(\S+)/)
      : null;
  if (slackMatch) {
    printColored('✅ SLACK_BOT_TOKEN gefunden.', '\x1b[32m');
    // ... ggf. Live-Check
  } else {
    printColored('⚠️ SLACK_BOT_TOKEN nicht gefunden (optional)', '\x1b[33m');
  }

  // 5. Bots automatisch neu starten (nur Beispiel, falls Skripte vorhanden)
  // Hier könnten child_process.execSync-Aufrufe stehen, z.B.:
  // try { execSync('pm2 restart gemini-bot'); printColored('🔄 Gemini-Bot neu gestartet.', '\x1b[36m'); } catch (e) { ... }

  if (allOk) {
    printColored(
      '\n🎉 Alle Automatisierungen, Extensions und Bots sind funktionsfähig!',
      '\x1b[1;42m',
    );
  } else {
    printColored(
      '\n❗ Es gibt Probleme mit Automatisierungen, Extensions oder Bots! Siehe Hinweise oben.',
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

  // Projekt-Manifest-Hinweis immer am Anfang anzeigen
  const manifestPath = path.join(__dirname, '../PROJECT_MANIFEST.md');
  if (fs.existsSync(manifestPath)) {
    printColored(
      '\n📌 WICHTIG: Lies und beachte immer PROJECT_MANIFEST.md für Rollen, Ziele und Arbeitsweise!',
      '\x1b[1;35m',
    );
    printColored(`Pfad: ${manifestPath}`, '\x1b[35m');
  }
  showProjectOverview();

  // Fehler- und Status-Report anzeigen
  showErrorReportSummary();

  if (process.argv.includes('--live-check')) {
    runLiveReadinessChecks();
    printColored('\nTipp: Führe nach jedem Deployment diesen Check erneut aus!', '\x1b[36m');
    return;
  }

  checkRecoveryManagerStatus();
  listRecoveryScreenshots();
  showRecoveryOptions();
  // SEO/Schema/Bot-Check nach jedem Recovery-Event
  printColored('\n[Recovery] Starte SEO/Schema/Bot-Check ...', '\x1b[36m');
  try {
    require('child_process').execSync('node tools/seo-schema-botcheck.js', { stdio: 'inherit' });
    printColored('[Recovery] SEO/Schema/Bot-Check abgeschlossen.', '\x1b[32m');
  } catch (e) {
    printColored('[Recovery] SEO/Schema/Bot-Check: Fehler erkannt! Siehe Log.', '\x1b[31m');
  }
  printColored(`\n${divider}`, '\x1b[1;36m');
  printColored(' Prioritätenliste nach Absturz:', '\x1b[1;33m');
  printColored(' 1. ✅ Meta-Tags & Social Media Cards optimieren', '\x1b[32m');
  printColored(' 2. ✅ Core Web Vitals verbessern (insb. LCP und CLS)', '\x1b[32m');
  printColored(' 3. ✅ Fehlerseiten optimieren (404, 500)', '\x1b[32m');
  printColored(' 4. ✅ Schema.org strukturierte Daten implementieren', '\x1b[32m');
  printColored(' 5. 🚦 Live-Readiness-Check regelmäßig ausführen!', '\x1b[33m');
  printColored(`${divider}\n`, '\x1b[1;36m');

  // Automatischer Live-Readiness-Check nach jedem Start
  printColored('\n[Auto-Check] Starte Live-Readiness-Check ...', '\x1b[36m');
  runLiveReadinessChecks();
  printColored('\n[Auto-Check] Live-Readiness-Check abgeschlossen.', '\x1b[36m');

  // Status-Snapshot für Verlauf speichern
  // Sammle Fehler und ToDos (vereinfachtes Beispiel)
  const errors = [];
  const todos = [];
  // Beispiel: Sammle Fehler aus Logs (kann weiter ausgebaut werden)
  const sentryLog = path.join(__dirname, '../logs/sentry.log');
  if (fs.existsSync(sentryLog)) {
    const content = safeReadFileSync(sentryLog, 'utf8');
    const lines = content ? content.trim().split('\n') : [];
    const lastError = lines
      .reverse()
      .find((l) => l.toLowerCase().includes('error') || l.toLowerCase().includes('exception'));
    if (lastError) errors.push('Sentry: ' + lastError);
  }
  // Beispiel: ToDos aus statischer Liste
  todos.push(
    ...[
      'Alerts & Monitoring für alle Checks aktivieren',
      'Social Cards & strukturierte Daten finalisieren',
      'Regelmäßige Live-Readiness-Checks automatisieren',
      'README & Dokumentation aktuell halten',
      'DX-Verbesserungen (Prettier, ESLint, Onboarding) umsetzen',
      'Recovery- und Health-Checks weiter ausbauen',
    ],
  );
  // allOk: true, wenn keine Fehler gefunden wurden
  const allOk = errors.length === 0;
  appendRecoveryHistory({ allOk, errors, todos });
  exportHistoryMarkdown();
}

/**
 * Speichert den aktuellen Status in recovery-history.json
 */
function appendRecoveryHistory({ allOk, errors, todos }) {
  const historyPath = path.join(__dirname, '../recovery-history.json');
  let history = [];
  try {
    if (fs.existsSync(historyPath)) {
      const content = safeReadFileSync(historyPath, 'utf8');
      history = content ? JSON.parse(content) : [];
    }
  } catch (e) {
    printColored('❌ Fehler beim Lesen der History: ' + e.message, '\x1b[31m');
  }
  const entry = {
    timestamp: new Date().toISOString(),
    status: allOk ? 'OK' : 'ERROR',
    errors: errors || [],
    todos: todos || [],
  };
  history.push(entry);
  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
    printColored('📊 Status-History aktualisiert (recovery-history.json)', '\x1b[36m');
  } catch (e) {
    printColored('❌ Fehler beim Schreiben der History: ' + e.message, '\x1b[31m');
  }
}

// Programm ausführen
main();
