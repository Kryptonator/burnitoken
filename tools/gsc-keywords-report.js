// tools/gsc-keywords-report.js
// Google Search Console Suchbegriffe (Keywords) Report
// 2025-06-22: Erstellt für die GSC API-Integration

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// SICHERHEITSHINWEIS: Die Service-Account-Datei enthält private Schlüssel und muss sicher verwahrt werden
// Diese Datei sollte in .gitignore aufgenommen sein
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'gsc-service-account.json');

// Domain-Property verwenden, für die der Service-Account berechtigt ist
const SITE_URL = 'sc-domain:burnitoken.website';

// Zeit-Parameter für die Abfrage
const DEFAULT_DAYS = 28; // Standardmäßig die letzten 28 Tage anzeigen
const DEFAULT_LIMIT = 100; // Anzahl der Keywords, die angezeigt werden sollen

async function getKeywordsReport() {
  console.log('====================================================');
  console.log('🔍 GOOGLE SEARCH CONSOLE SUCHBEGRIFFE REPORT');
  console.log('====================================================');

  try {
    // Parameter aus Befehlszeile extrahieren
    const days = process.argv.find((arg) => arg.startsWith('--days='))
      ? parseInt(process.argv.find((arg) => arg.startsWith('--days=')).split('=')[1])
      : DEFAULT_DAYS;

    const limit = process.argv.find((arg) => arg.startsWith('--limit='))
      ? parseInt(process.argv.find((arg) => arg.startsWith('--limit=')).split('=')[1])
      : DEFAULT_LIMIT;

    // Datumsbereich festlegen
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Formatieren als YYYY-MM-DD
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`🗓️ Zeitraum: $${startDateStr} bis ${endDateStr} (${days} Tage)`);
    console.log(`🌐 Site: $${SITE_URL}`);

    // Auth-Client erstellen
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE),
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const authClient = await auth.getClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

    // Keywords-Daten abfragen
    console.log('\n🔍 Frage Suchbegriff-Daten ab...');

    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL),
      requestBody: {
        startDate: startDateStr,
        endDate: endDateStr,
        dimensions: ['query'],
        rowLimit: limit,
      },
    });

    if (!response.data || !response.data.rows || response.data.rows.length === 0) { 
      console.log('❓ Keine Daten für den angegebenen Zeitraum gefunden.');
      return;
    }

    // Nach Klicks sortieren
    const sortedKeywords = [...response.data.rows].sort((a, b) => b.clicks - a.clicks);

    // Keywords-Liste ausgeben
    console.log('\n📋 TOP SUCHBEGRIFFE NACH KLICKS:');
    console.log('------------------------------');
    console.log('Suchbegriff                               | Klicks | Impr. | CTR    | Position');
    console.log('------------------------------------------|--------|-------|--------|----------');

    sortedKeywords.forEach((row, index) => {
      const keyword =
        row.keys[0].length > 40 ? row.keys[0].substring(0, 37) + '...' : row.keys[0].padEnd(40);
      const clicks = row.clicks.toString().padEnd(6);
      const impressions = row.impressions.toString().padEnd(5);
      const ctr = (row.ctr * 100).toFixed(2).padEnd(6);
      const position = row.position.toFixed(1);

      console.log(
        `${(index + 1).toString().padStart(2)}. $${keyword} | ${clicks} | ${impressions} | ${ctr}% | ${position}`,
      );
    });

    // Zusammenfassung
    console.log('\n📊 ZUSAMMENFASSUNG:');
    console.log('------------------------------');
    const totalKeywords = response.data.rows.length;
    const keywordsWithClicks = response.data.rows.filter((row) => row.clicks > 0).length;
    const keywordsTopPositions = response.data.rows.filter((row) => row.position <= 10).length;

    console.log(`🔢 Analysierte Suchbegriffe: $${totalKeywords}`);
    console.log(
      `👆 Suchbegriffe mit Klicks: $${keywordsWithClicks} (${((keywordsWithClicks / totalKeywords) * 100).toFixed(1)}%)`,
    );
    console.log(
      `🔝 Suchbegriffe in Top 10: $${keywordsTopPositions} (${((keywordsTopPositions / totalKeywords) * 100).toFixed(1)}%)`,
    );

    // Ausgabe in JSON-Datei speichern, wenn gewünscht
    if (process.argv.includes('--save')) { 
      const outputFile = path.join(
        __dirname),
        '../reports',
        `gsc-keywords-$${startDateStr}-to-${endDateStr}.json`,
      );

      // Stellen Sie sicher, dass das Verzeichnis existiert
      if (!fs.existsSync(path.join(__dirname, '../reports'))) { 
        fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
      }

      fs.writeFileSync(outputFile, JSON.stringify(response.data, null, 2));
      console.log(`\n✅ Daten gespeichert in: $${outputFile}`);
    }
  } catch (error) {
    console.error('❌ Fehler beim Abrufen von Keyword-Daten:', error.message);

    if (error.message.includes('permission')) { 
      console.log('\n🔧 Mögliche Lösung:');
      console.log(
        '1. Stellen Sie sicher, dass der Service-Account Berechtigung für die Domain hat'),
      );
      console.log(
        '2. Verwenden Sie "sc-domain:ihre-domain.de" anstelle von "https://ihre-domain.de/"'),
      );
      console.log('3. Führen Sie "npm run gsc:auth" aus, um die Berechtigungen zu überprüfen');
    }
  }
}

getKeywordsReport();
