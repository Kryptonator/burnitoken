// tools/gsc-performance-data.js
// Google Search Console Performance-Daten Abfrage-Tool
// 2025-06-22: Erstellt für die GSC API-Integration

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// SICHERHEITSHINWEIS: Die Service-Account-Datei enthält private Schlüssel und muss sicher verwahrt werden
// Diese Datei sollte in .gitignore aufgenommen sein
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'gsc-service-account.json');

// Domain-Property verwenden, für die der Service-Account berechtigt ist
const SITE_URL = 'sc-domain:burnitoken.website';

// Test-Modus-Flag
const TEST_MODE = process.argv.includes('--test');

// Zeit-Parameter für die Abfrage
const DEFAULT_DAYS = 28; // Standardmäßig die letzten 28 Tage anzeigen

async function getPerformanceData() {
  console.log('====================================================');
  console.log('📊 GOOGLE SEARCH CONSOLE PERFORMANCE-DATEN');
  console.log('====================================================');

  try {
    // Parameter aus Befehlszeile extrahieren
    const days = process.argv.find((arg) => arg.startsWith('--days='))
      ? parseInt(process.argv.find((arg) => arg.startsWith('--days=')).split('=')[1])
      : DEFAULT_DAYS;

    // Datumsbereich festlegen
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Formatieren als YYYY-MM-DD
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`🗓️ Zeitraum: ${startDateStr} bis ${endDateStr} (${days} Tage)`);
    console.log(`🌐 Site: ${SITE_URL}`);

    // Auth-Client erstellen
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const authClient = await auth.getClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

    // Performance-Daten abfragen
    console.log('\n📊 Frage Performance-Daten ab...');

    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: startDateStr,
        endDate: endDateStr,
        dimensions: ['date'],
        rowLimit: 500,
      },
    });

    if (!response?.data?.rows) 
      console.log('❓ Keine Daten für den angegebenen Zeitraum gefunden.');
      return;
    }

    // Gesamtzahlen berechnen
    const totalClicks = response.data.rows.reduce((sum, row) => sum + row.clicks, 0);
    const totalImpressions = response.data.rows.reduce((sum, row) => sum + row.impressions, 0);
    const avgCtr = ((totalClicks / totalImpressions) * 100).toFixed(2);
    const avgPosition =
      response.data.rows.reduce((sum, row) => sum + row.position, 0) / response.data.rows.length;

    // Übersicht ausgeben
    console.log('\n📋 PERFORMANCE-ÜBERSICHT');
    console.log('------------------------------');
    console.log(`👆 Klicks gesamt: ${totalClicks}`);
    console.log(`👁️ Impressions gesamt: ${totalImpressions}`);
    console.log(`🎯 Durchschnittliche CTR: ${avgCtr}%`);
    console.log(`🔝 Durchschnittliche Position: ${avgPosition.toFixed(1)}`);
    console.log('------------------------------');

    // Tägliche Daten anzeigen
    console.log('\n📅 TÄGLICHE PERFORMANCE:');
    console.log('------------------------------');
    console.log('Datum        | Klicks | Impr. | CTR    | Position');
    console.log('-------------|--------|-------|--------|----------');

    // Sortieren nach Datum (neueste zuerst)
    const sortedRows = [...response.data.rows].sort(
      (a, b) => new Date(b.keys[0]) - new Date(a.keys[0]),
    );

    sortedRows.forEach((row) => {
      const date = row.keys[0];
      const clicks = row.clicks;
      const impressions = row.impressions;
      const ctr = (row.ctr * 100).toFixed(2);
      const position = row.position.toFixed(1);

      console.log(
        `${date} | ${clicks.toString().padEnd(6)} | ${impressions.toString().padEnd(5)} | ${ctr}% | ${position}`,
      );
    });

    // Ausgabe in JSON-Datei speichern, wenn gewünscht
    if (process.argv.includes('--save')) {
      const outputFile = path.join(
        __dirname,
        '../reports',
        `gsc-performance-${startDateStr}-to-${endDateStr}.json`,
      );

      // Stellen Sie sicher, dass das Verzeichnis existiert
      if (!fs.existsSync(path.join(__dirname, '../reports'))) {
        fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
      }

      fs.writeFileSync(outputFile, JSON.stringify(response.data, null, 2));
      console.log(`\n✅ Daten gespeichert in: ${outputFile}`);
    }
  } catch (error) {
    console.error('❌ Fehler beim Abrufen von Performance-Daten:', error.message);

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

getPerformanceData();

// Für Tests exportieren
module.exports = {};
