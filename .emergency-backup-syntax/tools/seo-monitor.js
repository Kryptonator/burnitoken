#!/usr/bin/env node
/**
 * SEO & Indexierungs-Monitor für BurniToken
 *
 * - Prüft Google Search Console Indexierungsstatus (API)
 * - Führt Lighthouse SEO-Checks aus
 * - Validiert robots.txt und sitemap.xml
 * - Optional: Alerting via E-Mail/Slack/Webhook
 *
 * Erstellt: 2025-06-23
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const fetch = require('node-fetch');

// === KONFIGURATION ===
const CONFIG = {
  SITE_URL: 'https://burnitoken.website/',
  SITEMAP_URL: 'https://burnitoken.website/sitemap.xml',
  ROBOTS_URL: 'https://burnitoken.website/robots.txt',
  GSC_API_KEY_FILE: path.join(__dirname, 'gsc-service-account.json'),
  ALERT_EMAIL: process.env.ALERT_EMAIL || '',
  REPORT_DIR: path.join(__dirname, '.seo-reports'),
};
if (!fs.existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) fs.mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
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

// === HILFSFUNKTIONEN ===
function log(msg) {
  console.log('\x1b[36m[SEO-MONITOR]\x1b[0m', msg);
}
function alert(msg) {
  if (CONFIG.ALERT_EMAIL) {
    // E-Mail-Alert (Platzhalter, Integration via CI/CD empfohlen)
    log(`[ALERT] E-Mail an ${CONFIG.ALERT_EMAIL}: ${msg}`);
  }
}

// === GOOGLE SEARCH CONSOLE API ===
async function checkGSC() {
  log('Prüfe Google Search Console Indexierungsstatus...');
  if (!fs.existsSync(CONFIG.GSC_API_KEY_FILE)) {
    log('GSC Service Account JSON fehlt. Überspringe GSC-Check.');
    return { status: 'warn', message: 'GSC Service Account fehlt' };
  }
  try {
    // Nutze vorhandenes gsc-status-check.js Tool
    const result = execSync(`node tools/gsc-status-check.js --diagnose --json`, {
      encoding: 'utf8',
    });
    const data = JSON.parse(result);
    if (data.status === 'ok') {
      log('GSC-Status: OK');
      return { status: 'ok', message: 'Indexierung in Ordnung' };
    } else {
      alert('GSC-Problem: ' + data.message);
      return { status: 'error', message: data.message };
    }
  } catch (e) {
    alert('GSC-API-Fehler: ' + e.message);
    return { status: 'error', message: e.message };
  }
}

// === LIGHTHOUSE SEO CHECK ===
async function checkLighthouse() {
  log('Starte Lighthouse SEO-Check...');
  try {
    const outFile = path.join(CONFIG.REPORT_DIR, 'lighthouse-seo.json');
    execSync(
      `npx lighthouse ${CONFIG.SITE_URL} --output=json --output-path=${outFile} --only-categories=seo --quiet`,
      { stdio: 'ignore' },
    );
    const report = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    const score = report.categories.seo.score;
    if (score < 0.9) {
      alert(`Lighthouse SEO-Score kritisch: ${score * 100}%`);
      return { status: 'warn', message: `SEO-Score niedrig: ${score * 100}%` };
    }
    log(`Lighthouse SEO-Score: ${score * 100}%`);
    return { status: 'ok', message: `SEO-Score: ${score * 100}%` };
  } catch (e) {
    alert('Lighthouse-Fehler: ' + e.message);
    return { status: 'error', message: e.message };
  }
}

// === robots.txt & sitemap.xml VALIDIERUNG ===
async function checkRobotsAndSitemap() {
  log('Prüfe robots.txt und sitemap.xml...');
  try {
    const robots = await fetch(CONFIG.ROBOTS_URL).then((r) => r.text());
    if (!robots.includes('User-agent')) {
      alert('robots.txt fehlt oder ist fehlerhaft!');
      return { status: 'error', message: 'robots.txt fehlt/fehlerhaft' };
    }
    const sitemap = await fetch(CONFIG.SITEMAP_URL).then((r) => r.text());
    if (!sitemap.includes('<urlset')) {
      alert('sitemap.xml fehlt oder ist fehlerhaft!');
      return { status: 'error', message: 'sitemap.xml fehlt/fehlerhaft' };
    }
    log('robots.txt und sitemap.xml OK');
    return { status: 'ok', message: 'robots.txt & sitemap.xml OK' };
  } catch (e) {
    alert('robots/sitemap-Fehler: ' + e.message);
    return { status: 'error', message: e.message };
  }
}

// === HAUPTAUSFÜHRUNG ===
(async () => {
  log('Starte SEO/Indexierungs-Monitor...');
  const results = {};
  results.gsc = await checkGSC();
  results.lighthouse = await checkLighthouse();
  results.robots = await checkRobotsAndSitemap();
  const errors = Object.values(results).filter((r) => r.status === 'error');
  const warns = Object.values(results).filter((r) => r.status === 'warn');
  if (errors.length > 0) {
    log('❌ Kritische SEO/Indexierungs-Probleme gefunden!');
    process.exit(2);
  } else if (warns.length > 0) {
    log('⚠️ SEO/Indexierungs-Warnungen gefunden!');
    process.exit(1);
  } else {
    log('✅ Alle SEO/Indexierungs-Checks bestanden!');
    process.exit(0);
  }
})();

] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
} // Auto-korrigierte schließende Klammer