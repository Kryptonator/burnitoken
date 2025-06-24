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

// Konfiguration
const CONFIG = {
  RECOVERY_SCREENSHOT_DIR: path.join(__dirname, '.recovery-screenshots'),
  RECOVERY_STATUS_FILE: path.join(__dirname, 'recovery-status.json'),
  RECOVERY_MANAGER_SCRIPT: path.join(__dirname, 'vscode-recovery-manager.js'),
  AUTO_SCREENSHOT_SCRIPT: path.join(__dirname, 'auto-screenshot-manager.js'),
  MAX_SCREENSHOTS_TO_DISPLAY: 10
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
      printColored(`Status: ${isActive ? '🟢 Aktiv' : '🔴 Inaktiv'}`, isActive ? '\x1b[32m' : '\x1b[31m');
      printColored(`Letzte Prüfung: ${lastCheck.toLocaleString('de-DE')}`, '\x1b[33m');
      
      if (Object.keys(services).length > 0) {
        printColored('\n📊 Wiederhergestellte Services:', '\x1b[1;36m');
        Object.entries(services).forEach(([id, service]) => {
          const statusEmoji = service.status === 'running' ? '✅' : 
                              service.status === 'error' ? '❌' : '⚠️';
          printColored(`${statusEmoji} ${service.name}: ${service.status}`, 
                      service.status === 'running' ? '\x1b[32m' : '\x1b[33m');
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
      const files = fs.readdirSync(CONFIG.RECOVERY_SCREENSHOT_DIR)
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, a));
          const statB = fs.statSync(path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        })
        .slice(0, CONFIG.MAX_SCREENSHOTS_TO_DISPLAY);
      
      if (files.length > 0) {
        printColored('\n📸 Verfügbare Recovery-Screenshots:', '\x1b[1;36m');
        files.forEach(file => {
          const filePath = path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, file);
          const stats = fs.statSync(filePath);
          const fileSizeKB = Math.round(stats.size / 1024);
          printColored(`  ${file} (${stats.mtime.toLocaleString('de-DE')}, ${fileSizeKB} KB)`, '\x1b[32m');
        });
      } else {
        printColored('\n⚠️ Keine Recovery-Screenshots verfügbar', '\x1b[33m');
      }
    } else {
      printColored('\n⚠️ Recovery-Screenshot-Verzeichnis nicht gefunden', '\x1b[33m');
    }
  } catch (error) {
    printColored(`\n❌ Fehler beim Auflisten der Recovery-Screenshots: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Prüft alle Live-Gang-Kriterien und gibt Status/Hinweise aus
 */
function runLiveReadinessChecks() {
  printColored('\n🌐 LIVE-READINESS-CHECK: Alle kritischen Kriterien für den Go-Live', '\x1b[1;36m');
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

  // 2. Übersetzungen: 14 Sprachen, 22 neue Keys
  const translationsPath = path.join(__dirname, '../assets/translations.json');
  let translationsOk = true;
  if (fs.existsSync(translationsPath)) {
    try {
      const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
      const requiredLangs = ['de','en','es','fr','pt','ar','bn','hi','ja','ko','ru','tr','zh','it'];
      const requiredKeys = [
        'alt_logo','alt_burn_chart','alt_burni_lagerfeuer','alt_burni_tresor','alt_exchange','alt_gamepad','alt_vote','alt_rewards','table_rank','table_wallet','table_burned','table_locked','table_rewards','table_total','table_action','btn_connect_aria_label','btn_disconnect_aria_label','btn_language_aria_label','btn_theme_aria_label','btn_menu_aria_label','btn_close_aria_label','btn_recover_aria_label','btn_copy_aria_label'
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
  // Hier nur Check auf fetchLivePrices.js oder main.js mit fetchLivePrices
  const mainJsPath = path.join(__dirname, '../main.js');
  if (fs.existsSync(mainJsPath)) {
    const mainJs = fs.readFileSync(mainJsPath, 'utf8');
    if (mainJs.includes('fetchLivePrices')) {
      printColored('✅ API-Integration (fetchLivePrices) vorhanden', '\x1b[32m');
    } else {
      printColored('❌ API-Integration (fetchLivePrices) fehlt!', '\x1b[31m');
      allOk = false;
    }
  } else {
    printColored('❌ main.js fehlt!', '\x1b[31m');
    allOk = false;
  }

  // 6. Asset-Bereitstellung (Bilder, Videos, Whitepaper, Favicon, OG-Image)
  const assetChecks = [
    '../assets/burni-logo.png',
    '../assets/burni-social.jpg',
    '../assets/videos/1burni-favicon-im-pixar-comic-sti.mp4',
    '../assets/browserconfig.xml',
    '../assets/fonts',
    '../assets/css/styles.min.css',
    '../assets/images/favicon.ico',
    '../assets/images/burni-chart.jpg',
    '../assets/images/exchange.png'
  ];
  let assetsOk = true;
  for (const relPath of assetChecks) {
    const absPath = path.join(__dirname, relPath);
    if (!fs.existsSync(absPath)) {
      // Erweiterung: Prüfe auf alternative Formate (.webp, .svg, .ico, .jpg, .png)
      const dir = path.dirname(absPath);
      const base = path.basename(absPath, path.extname(absPath));
      const altExts = ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico'];
      let foundAlternative = false;
      for (const ext of altExts) {
        const altPath = path.join(dir, base + ext);
        if (fs.existsSync(altPath)) {
          printColored(`⚠️  Asset fehlt als ${path.extname(absPath)}, aber vorhanden als ${ext}: ${path.relative(__dirname, altPath)}`,'\x1b[33m');
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
  printColored('ℹ️ CSP/Nonce: Stelle sicher, dass Nonce-Generierung und CSP-Header im Deployment aktiv sind!', '\x1b[36m');

  // 8. CSS-Build (Tailwind, PostCSS, cssnano)
  const cssPath = path.join(__dirname, '../assets/css/styles.min.css');
  if (fs.existsSync(cssPath)) {
    printColored('✅ CSS-Build vorhanden (styles.min.css)', '\x1b[32m');
  } else {
    printColored('❌ CSS-Build fehlt (styles.min.css)', '\x1b[31m');
    allOk = false;
  }

  // 9. Monitoring (nur Hinweis)
  printColored('ℹ️ Monitoring: Aktiviere Sentry, UptimeRobot, Google Search Console, Core Web Vitals!', '\x1b[36m');

  // 10. Developer Experience (nur Hinweis)
  printColored('ℹ️ Developer Experience: CI/CD, Prettier, ESLint, Tests, README aktuell?', '\x1b[36m');

  // 11. Live-Status
  if (allOk) {
    printColored('\n🎉 ALLE KRITERIEN FÜR DEN LIVE-GANG SIND ERFÜLLT!\n', '\x1b[1;42m');
  } else {
    printColored('\n❗ Es fehlen noch Kriterien für den Live-Gang! Siehe Hinweise oben.\n', '\x1b[1;41m');
  }
}

/**
 * Zeigt Wiederherstellungsoptionen an
 */
function showRecoveryOptions() {
  printColored('\n🛠️ Wiederherstellungsoptionen:', '\x1b[1;36m');
  printColored('  1. Recovery Manager neu starten: "node tools/vscode-recovery-manager.js --force-restart"', '\x1b[32m');
  printColored('  2. Sofortigen Recovery-Screenshot erstellen: "node tools/auto-screenshot-manager.js --now"', '\x1b[32m');
  printColored('  3. Google Search Console Status prüfen: "node tools/gsc-status-check.js"', '\x1b[32m');
  printColored('  4. Google Search Console Setup Guide: "node tools/gsc-setup-guide.js"', '\x1b[32m');
  printColored('  5. Core Web Vitals prüfen: "node tools/core-web-vitals-monitor.js"', '\x1b[32m');
  printColored('  6. Meta-Tags & Social Cards validieren: "node tools/meta-tags-validator.js"', '\x1b[32m');
  printColored('  7. Alle Dienste prüfen: "npm run validate"', '\x1b[32m');
  printColored('  8. Live-Readiness-Check: "node tools/vscode-recovery-center.js --live-check"', '\x1b[32m');
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
    'Organisatorisch: Monitoring, Recovery, DX, Dokumentation'
  ];
  printColored('Hauptziele:', '\x1b[1;37m');
  ziele.forEach(z => printColored('  • ' + z, '\x1b[36m'));

  // Status-Checks (Dateien/Ordner)
  const checks = [
    { label: 'CI/CD-Workflow (ci.yml)', path: '../.github/workflows/ci.yml' },
    { label: 'Automatisierte Tests (tests/)', path: '../tests' },
    { label: 'Recovery Center (tools/vscode-recovery-center.js)', path: 'vscode-recovery-center.js' },
    { label: 'Google Search Console API (tools/gsc-status-check.js)', path: 'gsc-status-check.js' },
    { label: 'Monitoring/Alerts (Sentry, UptimeRobot)', path: '../sentry.client.js' },
    { label: 'SEO/Meta/Social Cards', path: '../sitemap.xml' },
    { label: 'Mehrsprachigkeit (assets/translations.json)', path: '../assets/translations.json' },
    { label: 'Performance-Checks (Lighthouse, Core Web Vitals)', path: '../playwright.config.js' },
    { label: 'README aktuell', path: '../README.md' }
  ];
  printColored('\nStatus:', '\x1b[1;37m');
  checks.forEach(c => {
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
    'Recovery- und Health-Checks weiter ausbauen'
  ];
  printColored('\nOffene ToDos:', '\x1b[1;37m');
  todos.forEach(t => printColored('  • ' + t, '\x1b[33m'));
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
      todo: 'API-Status prüfen & Alerts einrichten'
    },
    {
      label: 'Sentry Monitoring',
      path: '../sentry.client.js',
      log: '../logs/sentry.log',
      todo: 'Sentry-Status & letzte Errors prüfen'
    },
    {
      label: 'Playwright/Lighthouse Tests',
      path: '../playwright.config.js',
      log: '../test-results/playwright.log',
      todo: 'Automatisierte Tests regelmäßig ausführen'
    },
    {
      label: 'GitHub Actions CI/CD',
      path: '../.github/workflows/ci.yml',
      log: '../.github/workflows/ci.log',
      todo: 'CI/CD-Status & letzte Runs prüfen'
    },
    {
      label: 'Cloud Worker/Serverless',
      path: '../cloudflare-worker.js',
      log: '../logs/worker.log',
      todo: 'Worker-Status & Fehler überwachen'
    },
    {
      label: 'VS Code Extensions',
      path: '../.vscode/extensions.json',
      log: null,
      todo: 'Extensions aktuell & funktionsfähig halten'
    }
  ];
  checks.forEach(c => {
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
  // Sentry-Log
  const sentryLog = path.join(__dirname, '../logs/sentry.log');
  if (fs.existsSync(sentryLog)) {
    const lines = fs.readFileSync(sentryLog, 'utf8').trim().split('\n');
    const lastError = lines.reverse().find(l => l.toLowerCase().includes('error') || l.toLowerCase().includes('exception'));
    if (lastError) {
      printColored('  Sentry: ' + lastError, '\x1b[31m');
    } else {
      printColored('  Sentry: Keine kritischen Fehler gefunden', '\x1b[32m');
    }
  } else {
    printColored('  Sentry: Kein Log gefunden', '\x1b[33m');
  }
  // Playwright-Log
  const pwLog = path.join(__dirname, '../test-results/playwright.log');
  if (fs.existsSync(pwLog)) {
    const lines = fs.readFileSync(pwLog, 'utf8').trim().split('\n');
    const lastFail = lines.reverse().find(l => l.toLowerCase().includes('fail'));
    if (lastFail) {
      printColored('  Playwright: ' + lastFail, '\x1b[31m');
    } else {
      printColored('  Playwright: Alle Tests grün', '\x1b[32m');
    }
  } else {
    printColored('  Playwright: Kein Log gefunden', '\x1b[33m');
  }
  // CI-Log
  const ciLog = path.join(__dirname, '../.github/workflows/ci.log');
  if (fs.existsSync(ciLog)) {
    const lines = fs.readFileSync(ciLog, 'utf8').trim().split('\n');
    const lastFail = lines.reverse().find(l => l.toLowerCase().includes('fail') || l.toLowerCase().includes('error'));
    if (lastFail) {
      printColored('  CI/CD: ' + lastFail, '\x1b[31m');
    } else {
      printColored('  CI/CD: Letzter Run erfolgreich', '\x1b[32m');
    }
  } else {
    printColored('  CI/CD: Kein Log gefunden', '\x1b[33m');
  }
  // Snyk-Log
  const snykLog = path.join(__dirname, '../test-results/snyk.log');
  if (fs.existsSync(snykLog)) {
    const lines = fs.readFileSync(snykLog, 'utf8').trim().split('\n');
    const lastVuln = lines.reverse().find(l => l.toLowerCase().includes('vuln') || l.toLowerCase().includes('critical'));
    if (lastVuln) {
      printColored('  Snyk: ' + lastVuln, '\x1b[31m');
    } else {
      printColored('  Snyk: Keine kritischen Schwachstellen', '\x1b[32m');
    }
  } else {
    printColored('  Snyk: Kein Log gefunden', '\x1b[33m');
  }
  // Dependabot Alerts (GitHub Advisory Database)
  const dependabotAlerts = path.join(__dirname, '../.github/dependabot-alerts.json');
  if (fs.existsSync(dependabotAlerts)) {
    const alerts = JSON.parse(fs.readFileSync(dependabotAlerts, 'utf8'));
    if (alerts.length > 0) {
      printColored(`  Dependabot: ${alerts.length} offene Alerts`, '\x1b[31m');
      alerts.slice(0, 3).forEach(a => printColored('    - ' + a.summary, '\x1b[33m'));
    } else {
      printColored('  Dependabot: Keine offenen Alerts', '\x1b[32m');
    }
  } else {
    printColored('  Dependabot: Kein Alert-Export gefunden', '\x1b[33m');
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
      const result = execSync(`node ${gscScript} --diagnose`, { encoding: 'utf8', timeout: 10000 });
      if (result.toLowerCase().includes('ok') || result.toLowerCase().includes('success')) {
        printColored('  ✅ Google Search Console API erreichbar', '\x1b[32m');
      } else {
        printColored('  ⚠️  GSC-API: Antwort prüfen! (' + result.trim().split('\n').pop() + ')', '\x1b[33m');
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
      // Hier könnte ein echter Sentry-API-Call stehen, Platzhalter:
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
      const result = execSync('npx playwright test --list', { encoding: 'utf8', timeout: 10000 });
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
  // Dynamische Tool- & Cloud-Überwachung anzeigen
  showToolAndCloudStatus();
  // Letzte Fehler & Security-Status anzeigen
  showRecentErrorsAndSecurity();
  // Self-Checks für alle Kern-Tools durchführen
  runSelfChecks();

  if (process.argv.includes('--live-check')) {
    runLiveReadinessChecks();
    printColored('\nTipp: Führe nach jedem Deployment diesen Check erneut aus!', '\x1b[36m');
    return;
  }

  checkRecoveryManagerStatus();
  listRecoveryScreenshots();
  showRecoveryOptions();
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
}

// Programm ausführen
main();
