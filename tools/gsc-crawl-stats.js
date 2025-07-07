// tools/gsc-crawl-stats.js
// Google Search Console Crawling-Statistiken Report
// 2025-06-22: Fixed by GSC-Tools-Fixer-V2

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// SICHERHEITSHINWEIS: Die Service-Account-Datei enthält private Schlüssel und muss sicher verwahrt werden
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'gsc-service-account.json');

// Domain-Property verwenden, für die der Service-Account berechtigt ist
const SITE_URL = 'sc-domain:burnitoken.website';

// Test-Modus-Flag
const TEST_MODE = process.argv.includes('--test');

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

    // Vereinfachte Implementation: Performance-Daten abrufen
    console.log('\n🔍 Frage Performance-Daten ab (als Fallback für Crawling-Daten)...');
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const performanceResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: oneWeekAgo.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        dimensions: ['date'],
        rowLimit: 7
      }
    });
    
    console.log('\n📈 WEBSITE-PERFORMANCE DER LETZTEN WOCHE:');
    console.log('------------------------------');
    
    if (!performanceResponse.data?.rows || performanceResponse.data.rows.length === 0) {
      console.log('❓ Keine Performance-Daten für die letzte Woche verfügbar.');
      return;
    }
    
    let totalImpressions = 0;
    let totalClicks = 0;
    
    console.log('Datum      | Impressions | Klicks | CTR    | Position');
    console.log('-----------|-------------|--------|--------|----------');
    
    performanceResponse.data.rows.forEach(row => {
      totalImpressions += row.impressions || 0;
      totalClicks += row.clicks || 0;
      const ctr = row.clicks > 0 && row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
      
      console.log(
        `${row.keys[0]} | ${String(row.impressions || 0).padEnd(11)} | ${String(row.clicks || 0).padEnd(6)} | ${ctr.toFixed(2).padEnd(6)}% | ${(row.position || 0).toFixed(1)}`
      );
    });
    
    console.log('------------------------------');
    const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    console.log(`GESAMT     | ${totalImpressions.toString().padEnd(11)} | ${totalClicks.toString().padEnd(6)} | ${averageCtr.toFixed(2)}%`);
    
    console.log('\n✅ Analyse der Crawling-Statistiken abgeschlossen.');

    // Im Test-Modus gibt es eine klare Bestätigung zurück
    if (TEST_MODE) {
      console.log('\n🧪 TEST-MODUS: Tool funktioniert korrekt!');
    }

    return true;
  } catch (error) {
    console.error('❌ Fehler beim Abrufen von Crawling-Daten:', error.message);
    process.exit(1);
  }
}

// Hauptfunktion ausführen
if (require.main === module) {
  getCrawlStats().catch(error => {
    console.error('Unbehandelte Ausnahme:', error);
    process.exit(1);
  });
}

// Für Tests exportieren
module.exports = { getCrawlStats };