// Hauptkonfiguration für Lighthouse mit Google Search Console Integration
const path = require('path');
const fs = require('fs');

// GSC Service Account Datei prüfen
const GSC_SERVICE_ACCOUNT_FILE = path.join(__dirname, 'tools', 'gsc-service-account.json');
const GSC_ENABLED = fs.existsSync(GSC_SERVICE_ACCOUNT_FILE);

// GSC Quick Test ausführen, um Verbindung zu prüfen
if (GSC_ENABLED) {  try {
    const { execSync } = require('child_process');
    execSync('node tools/gsc-quick-test.js --test', { stdio: 'ignore' });
    console.log('✅ GSC-Verbindung erfolgreich hergestellt');
    console.log('   Lighthouse-Tests werden mit GSC-Daten ausgeführt');
  } catch (err) {
    console.warn('⚠️ GSC-Verbindung konnte nicht hergestellt werden');
    console.warn('   Lighthouse-Tests werden ohne GSC-Daten ausgeführt');
    console.warn('   Fehlerdetails:', err.message || 'Unbekannter Fehler');
  }
}

// Basis-URL für Tests
const TEST_URL = process.env.LIGHTHOUSE_TEST_URL || 'http://localhost:3000';

module.exports = {
  ci: {
    collect: {
      url: [TEST_URL],
      numberOfRuns: 2,
      settings: {
        // GSC Service Account Datei verwenden, wenn vorhanden
        gatherMode: GSC_ENABLED ? 'navigation-and-lighthouse' : 'navigation',
        // Emulierte Umgebung
        formFactor: 'desktop',
        screenEmulation: {
          width: 1280,
          height: 720,
          deviceScaleFactor: 1,
          mobile: false,
          disable: false
        },
        // Verbesserte Performance beim Testen
        throttling: {
          cpuSlowdownMultiplier: 1,
          downloadThroughputKbps: 1024,
          uploadThroughputKbps: 512,
          rttMs: 40
        },
        // Audit-Konfiguration
        skipAudits: ['uses-http2'],
        onlyAudits: undefined,
        // Kategorien zur Prüfung
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage',
      githubToken: process.env.GITHUB_TOKEN,
      githubStatusContextSuffix: 'lighthouse'
    },
    server: {
      port: 9090,
      serveDir: __dirname
    },
    wizard: {
      disableInteractiveUi: false,
      disableGathering: false
    }
  },
};
