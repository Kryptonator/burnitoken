// tools/gsc-status-check.js
// Google Search Console Sitemap Status Checker und Fehlerbehebungs-Tool
// 2025-06-21: Aktualisiert mit Feature zur Diagnose von "Konnte nicht abgerufen werden"

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'gsc-service-account.json'); // Service Account Key
// Domain-Property statt URL-Property verwenden, da der Service-Account dafür berechtigt ist
const SITE_URL = 'sc-domain:burnitoken.website'; // Domain-Property-Format
const SITEMAP_URL = 'https://burnitoken.website/sitemap.xml'; // Sitemap URL

// Führe Diagnose direkt aus, wenn keine API-Credentials vorhanden sind
function runDiagnosis() {
  console.log('====================================================');
  console.log('🔍 GOOGLE SEARCH CONSOLE SITEMAP STATUS CHECKER');
  console.log('====================================================');
  console.log(
    '\nDieses Tool hilft bei der Diagnose von Google Search Console Sitemap-Problemen.\n',
  );

  // Fehlerstatus: "Konnte nicht abgerufen werden"
  if (process.argv.includes('--status=notfetchable')) {
    console.log('⚠️ ERKANNTER FEHLER: "Konnte nicht abgerufen werden"\n');
    console.log('Mögliche Ursachen und Lösungen:');
    console.log('------------------------------');
    console.log('1. ❓ DNS-PROBLEME:');
    console.log('   - Stellen Sie sicher, dass Ihre Domain korrekt auf Netlify zeigt.');
    console.log(
      '   - Überprüfen Sie die DNS-Einträge und warten Sie ggf. auf vollständige Propagation (24-48 Stunden).',
    );

    console.log('\n2. ❓ NETLIFY REDIRECTS:');
    console.log('   - Prüfen Sie die netlify.toml-Datei auf falsche Weiterleitungen.');
    console.log(
      '   - Stellen Sie sicher, dass die sitemap.xml-Datei explizit von Weiterleitungen ausgenommen ist.',
    );
    console.log('   - Aktueller Status (empfohlen):');
    console.log('     [[redirects]]');
    console.log('       from = "/sitemap.xml"');
    console.log('       to = "/sitemap.xml"');
    console.log('       status = 200');

    console.log('\n3. ❓ ROBOTS.TXT:');
    console.log('   - Stellen Sie sicher, dass Ihre robots.txt die korrekte Sitemap-URL enthält:');
    console.log('     Sitemap: https://burnitoken.website/sitemap.xml');

    // Testen Sie die HTTP-Erreichbarkeit
    testSitemapAccess();

    console.log('\n4. ❓ FIREWALL/CDN:');
    console.log(
      '   - Überprüfen Sie, ob Firewalls oder CDN-Einstellungen den Google-Bot blockieren.',
    );
    console.log('   - Stellen Sie sicher, dass Google-Bot-IPs nicht blockiert werden.');

    console.log('\n5. ❓ XML-VALIDITÄT:');
    console.log('   - Validieren Sie Ihre sitemap.xml mit einem Online-Tool wie validator.w3.org');
    console.log('   - Beheben Sie etwaige XML-Fehler oder -Warnungen.');

    console.log('\n------------------------------');
    console.log('📋 EMPFOHLENE SCHRITTE:');
    console.log('------------------------------');
    console.log(
      '1. Rufen Sie die Sitemap selbst auf: curl -v https://burnitoken.website/sitemap.xml',
    );
    console.log('2. Führen Sie das Prüftool aus: npm run validate:sitemap');
    console.log(
      '3. Verwenden Sie die Google Mobile-Friendly Test-Seite, um zu testen, ob Google auf die Sitemap zugreifen kann:',
    );
    console.log(
      '   https://search.google.com/test/mobile-friendly?url=https://burnitoken.website/sitemap.xml',
    );
  } else {
    console.log('Verwendung: node gsc-status-check.js --status=notfetchable');
    console.log('\nVerfügbare Status:');
    console.log('  --status=notfetchable  : "Konnte nicht abgerufen werden"');
    console.log('  --status=error         : "Fehler bei der Verarbeitung"');
  }
}

async function testSitemapAccess() {
  console.log('\n🌐 Teste Erreichbarkeit der Sitemap...');

  // Versuch, die Sitemap mit verschiedenen User-Agents abzurufen
  const googlebot = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

  try {
    console.log(`Teste als Googlebot: ${SITEMAP_URL}`);
    const url = new URL(SITEMAP_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': googlebot,
      },
    };

    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);

      if (res.statusCode === 200) {
        console.log('   ✅ Die Sitemap scheint erreichbar zu sein');
      } else {
        console.log('   ❌ Die Sitemap ist nicht korrekt erreichbar');
      }
    });

    req.on('error', (error) => {
      console.error(`   ❌ Fehler beim Zugriff auf die Sitemap: ${error.message}`);
    });

    req.end();
  } catch (error) {
    console.error(`   ❌ Fehler beim Test der Sitemap: ${error.message}`);
  }
}

// Prüfe, ob Service Account vorhanden ist oder Diagnose-Modus gefordert ist
if (process.argv.includes('--diagnose') || !fs.existsSync(SERVICE_ACCOUNT_FILE)) {
  runDiagnosis();
} else {
  // API-basierter Check, falls Service Account vorhanden
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  async function checkSitemapStatus() {
    try {
      // Zeige verfügbare Sitemaps an
      console.log('🔍 Frage GSC API nach Sitemap-Status ab...');
      console.log(`Site-URL: ${SITE_URL}`);
      console.log(`Sitemap-URL: ${SITEMAP_URL}`);

      const sitemaps = await searchconsole.sitemaps.list({
        siteUrl: SITE_URL,
      });

      if (!sitemaps.data || !sitemaps.data.sitemap || sitemaps.data.sitemap.length === 0) {
        console.log('❌ Keine Sitemaps in der Google Search Console gefunden.');
        return false;
      }

      console.log('\n📋 Gefundene Sitemaps:');
      console.log('------------------------------');

      let targetSitemap = null;

      sitemaps.data.sitemap.forEach((sitemap) => {
        console.log(`URL: ${sitemap.path}`);
        console.log(`Status: ${sitemap.lastSubmitted ? 'Eingereicht' : 'Nicht eingereicht'}`);
        console.log(`Letzte Verarbeitung: ${sitemap.lastDownloaded || 'Noch nicht verarbeitet'}`);

        if (sitemap.errors) console.log(`Fehler: ${sitemap.errors}`);
        if (sitemap.warnings) console.log(`Warnungen: ${sitemap.warnings}`);
        console.log('------------------------------');

        if (sitemap.path === SITEMAP_URL) {
          targetSitemap = sitemap;
        }
      });

      if (!targetSitemap) {
        console.log(`❌ Die angegebene Sitemap ${SITEMAP_URL} wurde nicht in der GSC gefunden.`);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Fehler bei der GSC-Abfrage:', err.message);
      return false;
    }
  }

  // Führe die Sitemap-Prüfung aus
  checkSitemapStatus()
    .then((success) => {
      if (!success) {
        console.log(
          '⚠️ API-Abfrage fehlgeschlagen oder keine Ergebnisse, wechsele zu Diagnose-Modus',
        );
        runDiagnosis();
      }
    })
    .catch((err) => {
      console.error('❌ Unerwarteter Fehler:', err.message);
      runDiagnosis();
    });
}
