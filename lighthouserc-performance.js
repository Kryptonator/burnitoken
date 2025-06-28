// Konfiguration mit Google Search Console Integration
const path = require('path');
const fs = require('fs');

// GSC Service Account Datei prüfen
const GSC_SERVICE_ACCOUNT_FILE = path.join(__dirname, 'tools', 'gsc-service-account.json');
const GSC_ENABLED = fs.existsSync(GSC_SERVICE_ACCOUNT_FILE);

// GSC Quick Test ausführen, um Verbindung zu prüfen
if (GSC_ENABLED) {
  try {
    const { execSync } = require('child_process');
    execSync('node tools/gsc-quick-test.js --test', { stdio: 'ignore' });
  } catch (err) {
    console.warn('⚠️ GSC-Verbindung konnte nicht hergestellt werden');
    console.warn('   Lighthouse-Tests werden ohne GSC-Daten ausgeführt');
  }
}

module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 1,
      settings: { 
        onlyCategories: ['performance'],
        // GSC Service Account Datei verwenden, wenn vorhanden
        gatherMode: GSC_ENABLED ? 'navigation-and-lighthouse' : 'navigation',
        formFactor: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
          downloadThroughputKbps: 1024,
          uploadThroughputKbps: 512
        }
      },
    },
    assert: { assertions: { 'categories:performance': ['error', { minScore: 0.9 }] } },
    upload: { target: 'temporary-public-storage' },
  },
};
