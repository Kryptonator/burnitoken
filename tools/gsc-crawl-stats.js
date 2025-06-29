// tools/gsc-crawl-stats.js
// Google Search Console Crawling-Statistiken Report
// 2025-06-22: Erstellt für die GSC API-Integration

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// SICHERHEITSHINWEIS: Die Service-Account-Datei enthält private Schlüssel und muss sicher verwahrt werden
// Diese Datei sollte in .gitignore aufgenommen sein
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'gsc-service-account.json');

// Domain-Property verwenden, für die der Service-Account berechtigt ist
const SITE_URL = 'sc-domain:burnitoken.website';

async function getCrawlStats() {
  console.log('====================================================');
  console.log('🕸️ GOOGLE SEARCH CONSOLE CRAWLING-STATISTIKEN');
  console.log('====================================================');

  try {
    console.log(`🌐 Site: ${SITE_URL}`);

    // Auth-Client erstellen
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const authClient = await auth.getClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

    // Crawling-Probleme abfragen
    console.log('\n🔍 Frage Crawling-Probleme ab...');

    const urlCrawlErrorsResponse = await searchconsole.urlcrawlerrorssamples.list({
      siteUrl: SITE_URL,
      category: 'notFound', // Mögliche Werte: authPermissions, manyToOneRedirect, notFollowed, notFound, other, roboted, serverError, soft404
      platform: 'web', // web, mobile, oder smartphoneOnly
    });

    console.log('\n📋 CRAWLING-PROBLEME (404 Fehler):');
    console.log('------------------------------');

    if (
      !urlCrawlErrorsResponse.data.urlCrawlErrorSample ||
      urlCrawlErrorsResponse.data.urlCrawlErrorSample.length === 0
    ) {
      console.log('✅ Keine 404-Fehler gefunden.');
    } else {
      const errors = urlCrawlErrorsResponse.data.urlCrawlErrorSample;

      console.log(`❌ Gefundene 404-Fehler: ${errors.length}`);
      console.log('URL                                       | Entdeckt am     | Letzte Prüfung');
      console.log('------------------------------------------|----------------|----------------');

      errors.forEach((error) => {
        const url =
          error.pageUrl.length > 40
            ? error.pageUrl.substring(0, 37) + '...'
            : error.pageUrl.padEnd(40);
        const firstDetected = new Date(error.firstDetected).toLocaleDateString();
        const lastCrawled = new Date(error.lastCrawled).toLocaleDateString();

        console.log(`${url} | ${firstDetected.padEnd(14)} | ${lastCrawled}`);
      });
    }

    // Auch andere Error-Kategorien prüfen
    const errorCategories = ['serverError', 'soft404', 'roboted', 'authPermissions'];

    for (const category of errorCategories) {
      try {
        const response = await searchconsole.urlcrawlerrorssamples.list({
          siteUrl: SITE_URL,
          category: category,
          platform: 'web',
        });

        const errorCount = response.data.urlCrawlErrorSample
          ? response.data.urlCrawlErrorSample.length
          : 0;

        console.log(
          `\n${category}: ${errorCount === 0 ? '✅ Keine Fehler' : `❌ ${errorCount} Fehler gefunden`}`,
        );

        if (errorCount > 0 && category === 'serverError') {
          // Details zu Server-Fehlern anzeigen, da diese oft kritisch sind
          console.log('URL                                       | Fehlercode');
          console.log('------------------------------------------|----------');

          response.data.urlCrawlErrorSample.forEach((error) => {
            const url =
              error.pageUrl.length > 40
                ? error.pageUrl.substring(0, 37) + '...'
                : error.pageUrl.padEnd(40);
            const responseCode = error.responseCode || 'Unbekannt';

            console.log(`${url} | ${responseCode}`);
          });
        }
      } catch (err) {
        // Manche APIs unterstützen nicht alle Error-Kategorien, daher Fehler ignorieren
        console.log(`\n${category}: API nicht verfügbar für diese Kategorie`);
      }
    }

    // Sitemap-Status prüfen
    console.log('\n🗺️ SITEMAP-STATUS:');
    console.log('------------------------------');

    try {
      const sitemapsResponse = await searchconsole.sitemaps.list({
        siteUrl: SITE_URL,
      });

      if (!sitemapsResponse.data.sitemap || sitemapsResponse.data.sitemap.length === 0) {
        console.log('❓ Keine Sitemaps in der GSC gefunden.');
      } else {
        sitemapsResponse.data.sitemap.forEach((sitemap) => {
          console.log(`URL: ${sitemap.path}`);
          console.log(
            `Status: ${sitemap.lastDownloaded ? '✅ Erfolgreich verarbeitet' : '❓ Noch nicht verarbeitet'}`,
          );

          if (sitemap.lastDownloaded) {
            console.log(
              `Letzte Verarbeitung: ${new Date(sitemap.lastDownloaded).toLocaleString()}`,
            );
          }

          if (sitemap.warnings) console.log(`⚠️ Warnungen: ${sitemap.warnings}`);
          if (sitemap.errors) console.log(`❌ Fehler: ${sitemap.errors}`);
          console.log('------------------------------');
        });
      }
    } catch (err) {
      console.log(`❓ Fehler beim Abrufen des Sitemap-Status: ${err.message}`);
    }

    // Indexierungs-Abdeckung-Hinweis
    console.log('\n📝 HINWEIS ZUR INDEXIERUNGS-ABDECKUNG:');
    console.log('Die detaillierte Indexierungs-Abdeckung (Index Coverage) kann über die GSC API');
    console.log('nicht direkt abgefragt werden. Bitte prüfen Sie diese in der Search Console UI:');
    console.log('https://search.google.com/search-console/index');

    if (process.argv.includes('--save')) {
      // Erstelle Report-Verzeichnis, falls es nicht existiert
      if (!fs.existsSync(path.join(__dirname, '../reports'))) {
        fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
      }

      // Speichere Crawling-Fehler in JSON-Datei
      const today = new Date().toISOString().split('T')[0];
      const outputFile = path.join(__dirname, '../reports', `gsc-crawl-errors-${today}.json`);

      // Sammle alle Fehler
      const crawlingReport = {
        date: new Date().toISOString(),
        site: SITE_URL,
        errors: {},
      };

      for (const category of ['notFound', 'serverError', 'soft404', 'roboted', 'authPermissions']) {
        try {
          const response = await searchconsole.urlcrawlerrorssamples.list({
            siteUrl: SITE_URL,
            category: category,
            platform: 'web',
          });

          crawlingReport.errors[category] = response.data.urlCrawlErrorSample || [];
        } catch (err) {
          crawlingReport.errors[category] = { error: err.message };
        }
      }

      fs.writeFileSync(outputFile, JSON.stringify(crawlingReport, null, 2));
      console.log(`\n✅ Crawling-Bericht gespeichert in: ${outputFile}`);
    }
  } catch (error) {
    console.error('❌ Fehler beim Abrufen von Crawling-Daten:', error.message);

    if (error.message.includes('permission')) {
      console.log('\n🔧 Mögliche Lösung:');
      console.log(
        '1. Stellen Sie sicher, dass der Service-Account Berechtigung für die Domain hat',
      );
      console.log(
        '2. Verwenden Sie "sc-domain:ihre-domain.de" anstelle von "https://ihre-domain.de/"',
      );
      console.log('3. Führen Sie "npm run gsc:auth" aus, um die Berechtigungen zu überprüfen');
    }
  }
}

getCrawlStats();
