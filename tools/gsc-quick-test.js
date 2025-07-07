// Schneller GSC API-Test
// Führt einen grundlegenden Test mit Fehlerberichterstattung durch
// Unterstützt --test Flag für automatisierte Tests

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Absolute Pfadangabe zur Service-Account-Datei
const SERVICE_ACCOUNT_FILE = path.resolve(__dirname, 'gsc-service-account.json');
const GSC_PROPERTY = 'sc-domain:burnitoken.website';

// Check for --test flag for automated testing
const isTestMode = process.argv.includes('--test');

async function testGSCAPI() {
  console.log('====================================================');
  console.log('🧪 SCHNELLER GSC API-TEST');
  console.log('====================================================');
  console.log(`📁 Service-Account-Pfad: ${SERVICE_ACCOUNT_FILE}`);
  console.log(`🌐 GSC-Property: ${GSC_PROPERTY}`);
  
  // 1. Datei überprüfen
  if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    console.error(`❌ Datei nicht gefunden: ${SERVICE_ACCOUNT_FILE}`);
    return;
  } else {
    console.log('✅ Service-Account-Datei gefunden');
  }
  
  // 2. Inhalt überprüfen
  try {
    const content = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
    console.log(`✅ Datei enthält gültiges JSON`);
    console.log(`📧 Service-Account: ${content.client_email}`);
    
    if (!content.client_email || !content.private_key) {
      console.error(`❌ Datei enthält nicht alle erforderlichen Felder`);
      return;
    }
  } catch (error) {
    console.error(`❌ Fehler beim Lesen der Datei: ${error.message}`);
    return;
  }
  
  // 3. API-Test
  try {
    console.log('🔄 Erstelle Auth-Client...');
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    
    console.log('🔄 Hole Auth-Client-Instanz...');
    const authClient = await auth.getClient();
    console.log('✅ Auth-Client erfolgreich erstellt');
    
    console.log('🔄 Initialisiere Search Console API...');
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    console.log('✅ Search Console API initialisiert');
    
    console.log('🔄 Teste Site-Zugriff...');
    try {
      const siteResult = await searchconsole.sites.get({
        siteUrl: GSC_PROPERTY
      });
      
      console.log('✅ Site-Zugriff erfolgreich');
      console.log(`📊 Permission Level: ${siteResult.data.permissionLevel || 'Unknown'}`);
      
      // 4. Minimaler Datenabruf
      console.log('🔄 Teste Datenabruf (Performance der letzten 7 Tage)...');
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const performanceResponse = await searchconsole.searchanalytics.query({
        siteUrl: GSC_PROPERTY,
        requestBody: {
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ['date'],
          rowLimit: 7,
        },
      });
        if (performanceResponse.data && performanceResponse.data.rows) {
        console.log(`✅ ${performanceResponse.data.rows.length} Datenzeilen erhalten`);
        console.log('====================================================');
        console.log('🏆 GSC API-TEST ERFOLGREICH!');
        console.log('====================================================');
        
        if (isTestMode) {
          console.log('success'); // Spezieller Output für automated testing
          process.exit(0);
        }
      } else {
        console.log('⚠️ Keine Datenzeilen erhalten (möglicherweise normal für neue Domains)');
        console.log('✅ API-Anfrage erfolgreich, aber keine Daten vorhanden');
        
        if (isTestMode) {
          console.log('success'); // Counts as success when no data but API works
          process.exit(0);
        }
      }
    } catch (siteError) {
      console.error(`❌ Site-Zugriff fehlgeschlagen: ${siteError.message}`);
      if (siteError.errors) {
        console.error('Details:', JSON.stringify(siteError.errors, null, 2));
      }
      
      if (isTestMode) {
        console.error('failed: site-access-error');
        process.exit(1);
      }
    }
  } catch (apiError) {
    console.error(`❌ API-Fehler: ${apiError.message}`);
    if (apiError.errors) {
      console.error('Details:', JSON.stringify(apiError.errors, null, 2));
    }
    
    if (isTestMode) {
      console.error('failed: api-error');
      process.exit(1);
    }
  }
}

// Test ausführen
testGSCAPI();
testGSCAPI().catch(error => {
  console.error('❌ Unbehandelter Fehler im Test:', error.message);
});
