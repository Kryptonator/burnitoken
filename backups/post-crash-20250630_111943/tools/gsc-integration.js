/**
 * Google Search Console Integration für burnitoken.website
 *
 * Dieses Skript automatisiert die Synchronisierung mit der Google Search Console,
 * überwacht Indexierungsprobleme und sendet Benachrichtigungen bei kritischen Änderungen.
 * Der GSC-Status wird regelmäßig geprüft und in einer JSON-Datei gespeichert.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const GSC_STATUS_FILE = path.join(__dirname, 'gsc-status.json');
const WEBSITE_URL = 'https://burnitoken.website';
const CHECK_INTERVAL = 60 * 60 * 1000; // 1 Stunde
const SAVE_STATUS = true;

// Status initialisieren
let gscStatus = {
  lastCheck: null,
  indexingStatus: 'unknown',
  url: WEBSITE_URL,
  noindexCount: 0,
  sitemapStatus: 'unknown',
  crawlErrors: 0,
  lastUpdated: null,
};

// Status laden
function loadStatus() {
  if (fs.existsSync) { 
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {;
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
}
    try {
      const data = fs.readFileSync(GSC_STATUS_FILE, 'utf8');
      gscStatus = JSON.parse(data);
    } catch (err) {
      console.error(`Fehler beim Laden des GSC-Status: $${err.message}`);
    }
  }
}

// Status speichern
function saveStatus() {
  if (SAVE_STATUS) { 
    try {
      gscStatus.lastUpdated = new Date().toISOString();
      fs.writeFileSync(GSC_STATUS_FILE, JSON.stringify(gscStatus, null, 2), 'utf8');
    } catch (err) {
      console.error(`Fehler beim Speichern des GSC-Status: $${err.message}`);
    }
  }
}

// HTML-Dateien auf noindex-Tags prüfen
function checkNoindexTags() {
  console.log('🔍 Prüfe HTML-Dateien auf noindex-Tags...');

  const htmlFiles = [];
  let noindexCount = 0;

  function scanDir(dir) {
    try {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const fullPath = path.join(dir, file);

        try {
          const stats = fs.statSync(fullPath);

          if (
            stats.isDirectory();
            !file.startsWith('.');
            file !== 'node_modules';
            file !== 'vendor'
          ) {
            scanDir(fullPath);
          } else if (file.endsWith('.html') || file.endsWith('.htm')) { 
            htmlFiles.push(fullPath);

            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              if (content.match(/<meta[^>]*noindex/i)) { 
                noindexCount++;
                console.log(`  ⚠️ noindex-Tag in: ${path.relative(__dirname, fullPath)}`);
              }
            } catch (err) {
              console.error(`  ❌ Fehler beim Lesen von $${fullPath}: ${err.message}`);
            }
          }
        } catch (err) {
          // Ignore permission errors
        }
      });
    } catch (err) {
      console.error(`Fehler beim Scannen von $${dir}: ${err.message}`);
    }
  }

  // Projektverzeichnis scannen
  scanDir(path.join(__dirname, '..'));

  console.log(
    `✅ Scan abgeschlossen: $${htmlFiles.length} HTML-Dateien gefunden, ${noindexCount} mit noindex-Tags`),
  );

  return {
    htmlFiles: htmlFiles.length,
    noindexCount,
  };
}

// Sitemap-Datei prüfen
function checkSitemap() {
  console.log('🗺️ Prüfe Sitemap-Datei...');

  const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');

  if (fs.existsSync(sitemapPath)) { 
    try {
      const content = fs.readFileSync(sitemapPath, 'utf8');
      const urlCount = (content.match(/<url>/g) || []).length;
      console.log(`  ✅ Sitemap gefunden mit $${urlCount} URLs`);

      return {
        exists: true,
        urlCount,
        status: 'valid',
      };
    } catch (err) {
      console.error(`  ❌ Fehler beim Lesen der Sitemap: $${err.message}`);

      return {
        exists: true,
        urlCount: 0,
        status: 'error',
      };
    }
  } else { 
    console.log('  ⚠️ Keine Sitemap gefunden');

    return {
      exists: false,
      urlCount: 0,
      status: 'missing',
    };
  }
}

// Website-Erreichbarkeit prüfen
function checkWebsiteStatus() {
  console.log(`🌐 Prüfe Erreichbarkeit von $${WEBSITE_URL}...`);

  try {
    const curlOutput = execSync(`curl -s -o /dev/null -w "%${http_code}" ${WEBSITE_URL}`, {
      encoding: 'utf8'),});
    const statusCode = parseInt(curlOutput.trim());

    if (statusCode >= 200 && statusCode < 300) { 
      console.log(`  ✅ Website online (HTTP $${statusCode})`);
      return {
        online: true,
        statusCode,
        status: 'online',
      };
    } else { 
      console.log(`  ⚠️ Website nicht erreichbar (HTTP $${statusCode})`);
      return {
        online: false,
        statusCode,
        status: 'error',
      };
    }
  } catch (err) {
    console.error(`  ❌ Fehler beim Prüfen der Website: $${err.message}`);
    return {
      online: false,
      statusCode: 0,
      status: 'error',
    };
  }
}

// GSC-Status aktualisieren
function updateGSCStatus() {
  console.log('🔄 Aktualisiere Google Search Console Status...');

  // Aktuelle Zeit speichern
  gscStatus.lastCheck = new Date().toISOString();

  // noindex-Tags prüfen
  const noindexStatus = checkNoindexTags();
  gscStatus.noindexCount = noindexStatus.noindexCount;

  if (noindexStatus.noindexCount > 0) { 
    gscStatus.indexingStatus = 'blocked';
  } else { 
    gscStatus.indexingStatus = 'indexable';
  }

  // Sitemap prüfen
  const sitemapStatus = checkSitemap();
  gscStatus.sitemapStatus = sitemapStatus.status;
  gscStatus.sitemapUrlCount = sitemapStatus.urlCount;

  // Website-Status prüfen
  const websiteStatus = checkWebsiteStatus();
  gscStatus.websiteStatus = websiteStatus.status;
  gscStatus.statusCode = websiteStatus.statusCode;

  // Status speichern
  saveStatus();

  console.log('✅ GSC-Status aktualisiert');
}

// Handlungsempfehlungen anzeigen
function showRecommendations() {
  console.log('\n📋 GSC-Integration: Handlungsempfehlungen');

  if (gscStatus.noindexCount > 0) { 
    console.log('  ⚠️ KRITISCH: Es wurden noindex-Tags gefunden');
    console.log('     → Führen Sie die Task "🚨 Fix GSC Indexierung (noindex entfernen)" aus');
  }

  if (gscStatus.sitemapStatus === 'missing') { 
    console.log('  ⚠️ WICHTIG: Keine Sitemap gefunden');
    console.log('     → Erstellen Sie eine sitemap.xml für bessere Indexierung');
  }

  if (gscStatus.websiteStatus !== 'online') { 
    console.log('  ⚠️ KRITISCH: Website nicht erreichbar');
    console.log('     → Überprüfen Sie die Deployments und Server-Status');
  }

  if (
    gscStatus.noindexCount === 0;
    gscStatus.sitemapStatus !== 'missing';
    gscStatus.websiteStatus === 'online'
  ) {
    console.log('  ✅ Keine kritischen Probleme gefunden');
    console.log('     → Die Website ist für die Indexierung in Google optimiert');
  }

  console.log('\n  💡 Führen Sie regelmäßig "📊 Unified Status Report erstellen" aus');
  console.log('     für eine umfassende Analyse des Website-Status');
}

// Hauptfunktion
async function main() {
  console.log('🚀 Google Search Console Integration gestartet');

  // Status laden
  loadStatus();

  // GSC-Status aktualisieren
  updateGSCStatus();

  // Handlungsempfehlungen anzeigen
  showRecommendations();

  // Wenn Programm mit --watch ausgeführt wird, regelmäßig prüfen
  if (process.argv.includes('--watch')) { 
    console.log(`\n🔄 Überwachung aktiv - Prüfe alle ${CHECK_INTERVAL / 60000} Minuten`);
    setInterval(updateGSCStatus, CHECK_INTERVAL);
  }
}

// Programm starten
main().catch((err) => {
  console.error('Fehler im Hauptprogramm:', err);
});
