// tools/gsc-sitemap-manager.js
/**
 * Google Search Console Sitemap Manager
 *
 * Dieses Skript bietet Funktionen zum Einreichen und Überprüfen von Sitemaps
 * über die Google Search Console API.
 */

const { google } = require('googleapis');
const path = require('path');

// --- Konfiguration ---
const KEY_FILE_PATH = path.join(__dirname, 'gsc-credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/webmasters'];
const SITE_URL = 'https://burnitoken.website/'; // Deine Property in der GSC

// --- Authentifizierung ---
async function getAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH,
      scopes: SCOPES,
    });
    const client = await auth.getClient();
    return client;
  } catch (error) {
    console.error(
      '❌ Authentifizierungsfehler: Die Datei "gsc-credentials.json" konnte nicht gefunden oder gelesen werden.',
    );
    console.error(
      'Bitte stelle sicher, dass du eine gültige Service-Account-JSON-Datei unter diesem Namen im "tools"-Verzeichnis abgelegt hast.',
    );
    throw new Error('GSC Auth failed');
  }
}

// --- Hauptfunktionen ---

/**
 * Reicht eine Sitemap bei der Google Search Console ein.
 * @param {string} sitemapUrl - Die vollständige URL zur Sitemap.
 */
async function submitSitemap(sitemapUrl) {
  try {
    const auth = await getAuth();
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    console.log(`Reiche Sitemap ein: ${sitemapUrl}`);
    const res = await searchconsole.sitemaps.submit({
      siteUrl: SITE_URL,
      feedpath: sitemapUrl,
    });

    if (res.status === 204) 
      console.log('✅ Sitemap erfolgreich zur Verarbeitung eingereicht.');
    } else {
      console.warn('⚠️ Sitemap-Einreichung mit unerwartetem Status:', res.status, res.statusText);
    }
  } catch (error) {
    console.error('❌ Fehler beim Einreichen der Sitemap:', error.message);
  }
}

/**
 * Ruft den Status aller Sitemaps für die Webseite ab.
 */
async function getSitemapsStatus() {
  try {
    const auth = await getAuth();
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    console.log(`Rufe Sitemap-Status für ${SITE_URL} ab...`);
    const res = await searchconsole.sitemaps.list({
      siteUrl: SITE_URL,
    });

    if (res.data.sitemap) {
      console.log('📊 Gefundene Sitemaps:');
      res.data.sitemap.forEach((sitemap) => {
        console.log(`  - Pfad: ${sitemap.path}`);
        console.log(`    Letzte Einreichung: ${sitemap.lastSubmitted}`);
        console.log(`    Status: ${sitemap.status}`);
        if (sitemap.errors > 0 || sitemap.warnings > 0) {
          console.log(`    Fehler: ${sitemap.errors}, Warnungen: ${sitemap.warnings}`);
        }
      });
    } else {
      console.log('Keine Sitemaps für diese Property gefunden.');
    }
  } catch (error) {
    console.error('❌ Fehler beim Abrufen des Sitemap-Status:', error.message);
  }
}

// --- Ausführung via Kommandozeile ---
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const sitemapUrl = args[1] || `${SITE_URL}sitemap.xml`;

  if (command === 'submit') {
    await submitSitemap(sitemapUrl);
  } else if (command === 'status') {
    await getSitemapsStatus();
  } else {
    console.log('Verwendung:');
    console.log('  node tools/gsc-sitemap-manager.js submit [sitemap_url]');
    console.log('  node tools/gsc-sitemap-manager.js status');
  }
}

if (require.main === module) {
  main();
}
