// tools/gsc-status-check.js
// Google Search Console Index Status Check (Basis-Skript)
// Voraussetzung: Service Account JSON und Property-Freigabe in GSC

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'gsc-service-account.json'); // Service Account Key
const SITE_URL = 'https://burnitoken.com/'; // Deine Property-URL

async function main() {
  if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    console.error('❌ Service Account JSON fehlt:', SERVICE_ACCOUNT_FILE);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  try {
    // Beispiel: Indexierungsstatus für die Property abfragen
    const res = await searchconsole.urlInspection.index.inspect({
      siteUrl: SITE_URL,
      inspectionUrl: SITE_URL,
    });
    const result = res.data.inspectionResult;
    console.log('🔎 Indexierungsstatus:', result.indexStatusResult);
  } catch (err) {
    console.error('❌ Fehler bei der GSC-Abfrage:', err.message);
    process.exit(2);
  }
}

main();
