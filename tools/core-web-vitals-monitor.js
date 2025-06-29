#!/usr/bin/env node

/**
 * Core Web Vitals & Fehlerseiten-Monitor
 *
 * Ein Tool zur Überwachung der Core Web Vitals und zur Erkennung von Fehlerseiten (404, 500)
 * - Testet Core Web Vitals für wichtige Seiten
 * - Überwacht Fehlerseiten auf korrekte Funktion
 * - Generiert Berichte über Leistungsprobleme
 *
 * Erstellt: 2025-06-24
 */

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const readline = require('readline');

// Konfiguration
const CONFIG = {
  REPORT_DIR: path.join(__dirname, '.web-vitals-reports'),
  THRESHOLDS: {
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100, // First Input Delay (ms)
    CLS: 0.1, // Cumulative Layout Shift (score)
    TTFB: 600, // Time to First Byte (ms)
  },
  URLS: {
    HOME: 'https://burnitoken.website/',
    NOT_FOUND: 'https://burnitoken.website/nicht-existierende-seite', // 404 Test
    ERROR: 'https://burnitoken.website/error-simulation', // 500 Test (falls implementiert)
  },
  ERROR_PAGES: {
    404: '/404.html',
    500: '/500.html', // Falls vorhanden
  },
};

// Erstelle Report-Verzeichnis, falls nicht vorhanden
if (!fs.existsSync(CONFIG.REPORT_DIR)) {
  fs.mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
}

/**
 * Hilfsklasse für formatierte Ausgabe
 */
class ConsoleUI {
  static info(message) {
    console.log(`\x1b[36m${message}\x1b[0m`);
  }

  static success(message) {
    console.log(`\x1b[32m${message}\x1b[0m`);
  }

  static warn(message) {
    console.log(`\x1b[33m${message}\x1b[0m`);
  }

  static error(message) {
    console.log(`\x1b[31m${message}\x1b[0m`);
  }

  static title(message) {
    const line = '='.repeat(message.length + 4);
    console.log(`\n\x1b[1;36m${line}\n  ${message}\n${line}\x1b[0m\n`);
  }
}

/**
 * Lighthouse-Test für eine bestimmte URL ausführen
 */
function runLighthouseTest(
  url,
  outputPath,
  deviceType = 'desktop',
  categories = ['performance', 'accessibility'],
) {
  ConsoleUI.info(`🔍 Starte Lighthouse-Test für ${url} (${deviceType})...`);

  return new Promise((resolve, reject) => {
    const categoryFlags = categories.map((c) => `--only-categories=${c}`).join(' ');
    // Verwende entweder --preset=desktop oder keine Preset (für mobile Ansicht)
    const presetFlag = deviceType === 'desktop' ? '--preset=desktop' : '--form-factor=mobile';
    const command = `npx lighthouse ${url} --output=json --output-path="${outputPath}" ${presetFlag} --quiet ${categoryFlags}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        ConsoleUI.error(`❌ Lighthouse-Test fehlgeschlagen: ${error.message}`);
        reject(error);
        return;
      }

      ConsoleUI.success(`✅ Lighthouse-Test für ${url} abgeschlossen.`);
      ConsoleUI.info(`📊 Report gespeichert in: ${outputPath}`);
      resolve(outputPath);
    });
  });
}

/**
 * Lighthouse-Report für Core Web Vitals auswerten
 */
function analyzeWebVitals(reportPath) {
  try {
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(reportContent);
    const audits = report.audits;

    const webVitals = {
      LCP: {
        value: Math.round(audits['largest-contentful-paint'].numericValue),
        score: audits['largest-contentful-paint'].score,
        displayValue: audits['largest-contentful-paint'].displayValue,
        threshold: CONFIG.THRESHOLDS.LCP,
      },
      CLS: {
        value: audits['cumulative-layout-shift'].numericValue.toFixed(2),
        score: audits['cumulative-layout-shift'].score,
        displayValue: audits['cumulative-layout-shift'].displayValue,
        threshold: CONFIG.THRESHOLDS.CLS,
      },
      TTFB: {
        value: Math.round(audits['server-response-time'].numericValue),
        score: audits['server-response-time'].score,
        displayValue: audits['server-response-time'].displayValue,
        threshold: CONFIG.THRESHOLDS.TTFB,
      },
      FCP: {
        value: Math.round(audits['first-contentful-paint'].numericValue),
        score: audits['first-contentful-paint'].score,
        displayValue: audits['first-contentful-paint'].displayValue,
      },
    };

    const url = report.requestedUrl;
    const formattedUrl = url.replace(/https?:\/\//, '').replace(/\/$/, '');

    ConsoleUI.title(`Core Web Vitals: ${formattedUrl}`);

    // LCP ausgeben
    const lcpStatus = webVitals.LCP.value <= CONFIG.THRESHOLDS.LCP ? '✅' : '❌';
    ConsoleUI.info(`${lcpStatus} LCP (Largest Contentful Paint): ${webVitals.LCP.displayValue}`);
    if (webVitals.LCP.value > CONFIG.THRESHOLDS.LCP) {
      ConsoleUI.warn(`   ⚠️ Überschreitet Grenzwert von ${CONFIG.THRESHOLDS.LCP}ms!`);
    }

    // CLS ausgeben
    const clsStatus = webVitals.CLS.value <= CONFIG.THRESHOLDS.CLS ? '✅' : '❌';
    ConsoleUI.info(`${clsStatus} CLS (Cumulative Layout Shift): ${webVitals.CLS.displayValue}`);
    if (webVitals.CLS.value > CONFIG.THRESHOLDS.CLS) {
      ConsoleUI.warn(`   ⚠️ Überschreitet Grenzwert von ${CONFIG.THRESHOLDS.CLS}!`);
    }

    // TTFB ausgeben
    const ttfbStatus = webVitals.TTFB.value <= CONFIG.THRESHOLDS.TTFB ? '✅' : '❌';
    ConsoleUI.info(`${ttfbStatus} TTFB (Time to First Byte): ${webVitals.TTFB.displayValue}`);
    if (webVitals.TTFB.value > CONFIG.THRESHOLDS.TTFB) {
      ConsoleUI.warn(`   ⚠️ Überschreitet Grenzwert von ${CONFIG.THRESHOLDS.TTFB}ms!`);
    }

    // FCP ausgeben (kein offizieller Core Web Vital, aber hilfreich)
    ConsoleUI.info(`ℹ️ FCP (First Contentful Paint): ${webVitals.FCP.displayValue}`);

    // Zusammenfassung
    const hasProblem =
      webVitals.LCP.value > CONFIG.THRESHOLDS.LCP ||
      webVitals.CLS.value > CONFIG.THRESHOLDS.CLS ||
      webVitals.TTFB.value > CONFIG.THRESHOLDS.TTFB;

    console.log('');
    if (hasProblem) {
      ConsoleUI.warn('⚠️ Probleme mit Core Web Vitals gefunden. Optimierung empfohlen.');
    } else {
      ConsoleUI.success('✅ Alle Core Web Vitals im grünen Bereich!');
    }

    return {
      url,
      timestamp: new Date().toISOString(),
      webVitals,
      hasProblem,
    };
  } catch (error) {
    ConsoleUI.error(`❌ Fehler bei der Analyse des Reports: ${error.message}`);
    return null;
  }
}

/**
 * Playwright-Test für eine bestimmte URL ausführen
 */
async function runPlaywrightTest(url, testType = 'navigation') {
  const testFile = path.join(__dirname, '..', 'tests', 'e2e', 'quick-nav-test.js');

  // Erstelle temporäre Playwright-Testdatei
  if (!fs.existsSync(path.dirname(testFile))) {
    fs.mkdirSync(path.dirname(testFile), { recursive: true });
  }

  // Erstelle einen einfachen Playwright-Test
  if (testType === 'navigation') {
    fs.writeFileSync(
      testFile,
      `
      const { test, expect } = require('@playwright/test');
      
      test('Navigation und Statusüberprüfung für ${url}', async ({ page }) => {
        console.log('🔍 Teste Navigation nach: ${url}');
        
        // Seite aufrufen und auf Laden warten
        const response = await page.goto('${url}', { waitUntil: 'networkidle' });
        
        // Status-Code prüfen
        console.log('🔢 HTTP-Status-Code:', response.status());
        expect(response.ok()).toBeTruthy();
        
        // Titel prüfen
        const title = await page.title();
        console.log('📝 Seitentitel:', title);
        expect(title).not.toBe('');
        
        // Screenshot machen
        await page.screenshot({ path: '${path.join(CONFIG.REPORT_DIR, url.replace(/https?:\/\/|\/|\./g, '_') + '.png')}' });
      });
    `,
    );
  } else if (testType === '404') {
    fs.writeFileSync(
      testFile,
      `
      const { test, expect } = require('@playwright/test');
      
      test('404-Fehlerseite für ${url}', async ({ page }) => {
        console.log('🔍 Teste 404-Seite für: ${url}');
        
        // Seite aufrufen und auf Laden warten
        const response = await page.goto('${url}', { waitUntil: 'networkidle' });
        
        // Status-Code prüfen
        console.log('🔢 HTTP-Status-Code:', response.status());
        expect(response.status()).toBe(404);
        
        // Titel prüfen
        const title = await page.title();
        console.log('📝 Seitentitel:', title);
        expect(title.toLowerCase()).toContain('nicht gefunden' || 'not found' || '404');
        
        // Screenshot machen
        await page.screenshot({ path: '${path.join(CONFIG.REPORT_DIR, 'error_404_' + url.replace(/https?:\/\/|\/|\./g, '_') + '.png')}' });
      });
    `,
    );
  }

  ConsoleUI.info(`🎭 Starte Playwright-Test für ${url}...`);
  return new Promise((resolve, reject) => {
    const command = `npx playwright test ${testFile} --headed false`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        ConsoleUI.error(`❌ Playwright-Test fehlgeschlagen: ${error.message}`);
        ConsoleUI.info(stdout);
        reject(error);
        return;
      }

      ConsoleUI.success(`✅ Playwright-Test für ${url} abgeschlossen.`);
      ConsoleUI.info(stdout);
      resolve(url);
    });
  });
}

/**
 * Ausführlicher Test für alle wichtigen Seiten
 */
async function testAllCorePages() {
  ConsoleUI.title('Core Web Vitals & Fehlerseiten-Monitoring');
  ConsoleUI.info('Starte umfangreiche Tests für die Burnitoken-Website...\n');

  try {
    // Wichtige Seiten testen
    const results = {};
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    // Teste Hauptseite
    const homepageReport = path.join(CONFIG.REPORT_DIR, `home_${timestamp}.json`);
    await runLighthouseTest(CONFIG.URLS.HOME, homepageReport);
    results.home = analyzeWebVitals(homepageReport);

    // Playwright-Tests für Navigation und Fehlerseiten
    ConsoleUI.title('Navigationstests und Fehlerseiten');

    // Test für die Homepage
    await runPlaywrightTest(CONFIG.URLS.HOME);

    // Test für die 404-Seite
    await runPlaywrightTest(CONFIG.URLS.NOT_FOUND, '404');

    // Zusammenfassung speichern
    const summaryPath = path.join(CONFIG.REPORT_DIR, `summary_${timestamp}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

    ConsoleUI.title('Zusammenfassung');
    ConsoleUI.info(`📊 Anzahl getesteter Seiten: ${Object.keys(results).length}`);

    const problemSeiten = Object.entries(results)
      .filter(([key, data]) => data && data.hasProblem)
      .map(([key, data]) => key);

    if (problemSeiten.length > 0) {
      ConsoleUI.warn(`⚠️ Seiten mit Core Web Vitals Problemen: ${problemSeiten.length}`);
      problemSeiten.forEach((page) => {
        ConsoleUI.warn(`   - ${page}`);
      });
    } else {
      ConsoleUI.success('✅ Alle getesteten Seiten haben gute Core Web Vitals!');
    }

    ConsoleUI.info(`\n📄 Detaillierte Berichte wurden gespeichert in: ${CONFIG.REPORT_DIR}`);
  } catch (error) {
    ConsoleUI.error(`❌ Fehler beim Test der Website: ${error.message}`);
  }
}

/**
 * Spezifischer Test für Fehlerseiten
 */
async function testErrorPages() {
  ConsoleUI.title('Fehlerseiten-Test');

  try {
    // 404-Seite testen
    ConsoleUI.info('🔍 Teste 404-Fehlerseite...');
    await runPlaywrightTest(CONFIG.URLS.NOT_FOUND, '404');

    // 500-Seite testen, falls implementiert
    if (fs.existsSync(path.join(__dirname, '..', CONFIG.ERROR_PAGES['500']))) {
      ConsoleUI.info('🔍 Teste 500-Fehlerseite...');
      await runPlaywrightTest(CONFIG.URLS.ERROR, '500');
    } else {
      ConsoleUI.warn('⚠️ Keine 500-Fehlerseite gefunden. Überspringen...');
    }
  } catch (error) {
    ConsoleUI.error(`❌ Fehler beim Test der Fehlerseiten: ${error.message}`);
  }
}

/**
 * CI-Modus: Ausgabe in kompakter Form für CI/CD-Pipelines
 */
async function runCIMode() {
  try {
    // Festlegen der Testparameter für CI
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const homepageReport = path.join(CONFIG.REPORT_DIR, `ci_home_${timestamp}.json`);

    // Ausführen eines einfachen Tests für die Homepage
    await runLighthouseTest(CONFIG.URLS.HOME, homepageReport);
    const results = analyzeWebVitals(homepageReport);

    // Kurze Zusammenfassung für CI-Log
    console.log('\n--- Core Web Vitals CI Zusammenfassung ---');
    console.log(`LCP: ${results.webVitals.LCP.value}ms (Limit: ${CONFIG.THRESHOLDS.LCP}ms)`);
    console.log(`CLS: ${results.webVitals.CLS.value} (Limit: ${CONFIG.THRESHOLDS.CLS})`);
    console.log(`TTFB: ${results.webVitals.TTFB.value}ms (Limit: ${CONFIG.THRESHOLDS.TTFB}ms)`);

    // Exit-Code basierend auf Ergebnissen
    if (results.hasProblem) {
      console.log('\n❌ Core Web Vitals nicht im grünen Bereich!');
      process.exit(1);
    } else {
      console.log('\n✅ Alle Core Web Vitals im grünen Bereich!');
      process.exit(0);
    }
  } catch (error) {
    console.error(`Fehler im CI-Modus: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Kommandozeilen-Argumente verarbeiten
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Core Web Vitals & Fehlerseiten-Monitor
--------------------------------------

Verwendung:
  node core-web-vitals-monitor.js [optionen]

Optionen:
  --ci           CI-Modus mit kompakter Ausgabe und Exit-Code
  --full         Ausführlicher Test aller wichtigen Seiten
  --error-pages  Nur Fehlerseiten (404, 500) testen
  --help, -h     Diese Hilfe anzeigen
    `);
    process.exit(0);
  }

  if (args.includes('--ci')) {
    runCIMode();
  } else if (args.includes('--error-pages')) {
    testErrorPages();
  } else if (args.includes('--full')) {
    testAllCorePages();
  } else {
    // Standardmäßig ausführlichen Test durchführen
    testAllCorePages();
  }
}

// Programm ausführen
parseArgs();
