#!/usr/bin/env node
/**
 * VEREINFACHTER LIVE-AUDIT MIT DEBUGGING
 * Testet die GSC-Integration ohne große Komplexität
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { inspectError, safeExecute } = require('./debug-tools');

// Konstanten
const SERVICE_ACCOUNT_FILE = path.resolve(__dirname, '../tools/gsc-service-account.json');
const GSC_PROPERTY = 'sc-domain:burnitoken.website';

async function runSimpleGSCAudit() {
  console.log('====================================================');
  console.log('🔍 EINFACHER GSC LIVE-AUDIT');
  console.log('====================================================');
  console.log(`📁 Service-Account-Pfad: ${SERVICE_ACCOUNT_FILE}`);
  console.log(`🌐 GSC-Property: ${GSC_PROPERTY}`);
  
  // 1. Service-Account-Datei überprüfen
  if (!await safeExecute('Datei-Check', async () => {
    if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
      throw new Error(`Service Account Datei nicht gefunden: ${SERVICE_ACCOUNT_FILE}`);
    }
    const content = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
    if (!content.client_email || !content.private_key) {
      throw new Error('Service Account Datei enthält nicht alle erforderlichen Felder');
    }
    return true;
  })) {
    return;
  }
  
  // 2. Auth-Client erstellen
  const auth = await safeExecute('Auth-Client erstellen', async () => {
    return new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
  });
  
  if (!auth) return;
  
  // 3. Auth-Client-Instanz holen
  const authClient = await safeExecute('Auth-Client-Instanz abrufen', async () => {
    return await auth.getClient();
  });
  
  if (!authClient) return;
  
  // 4. Search Console API initialisieren
  const searchconsole = await safeExecute('Search Console API initialisieren', async () => {
    return google.searchconsole({ version: 'v1', auth: authClient });
  });
  
  if (!searchconsole) return;
  
  // 5. Site-Zugriff testen
  const siteInfo = await safeExecute('Site-Zugriff testen', async () => {
    const result = await searchconsole.sites.get({
      siteUrl: GSC_PROPERTY
    });
    return result.data;
  });
  
  if (!siteInfo) return;
  
  console.log(`📊 Permission Level: ${siteInfo.permissionLevel || 'Unknown'}`);
  
  // 6. Performance-Daten abrufen
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 28);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  console.log(`🗓️ Zeitraum: ${startDateStr} bis ${endDateStr}`);
  
  const performanceData = await safeExecute('Performance-Daten abrufen', async () => {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: GSC_PROPERTY,
      requestBody: {
        startDate: startDateStr,
        endDate: endDateStr,
        dimensions: ['date'],
        rowLimit: 28,
      },
    });
    return response.data;
  });
  
  if (!performanceData) return;
  
  // 7. Daten auswerten
  if (performanceData.rows && performanceData.rows.length > 0) {
    console.log(`✅ ${performanceData.rows.length} Datenzeilen erhalten`);
    
    // Gesamtzahlen berechnen
    const totalClicks = performanceData.rows.reduce((sum, row) => sum + row.clicks, 0);
    const totalImpressions = performanceData.rows.reduce((sum, row) => sum + row.impressions, 0);
    const avgCtr = ((totalClicks / totalImpressions) * 100).toFixed(2);
    const avgPosition = performanceData.rows.reduce((sum, row) => sum + row.position, 0) / performanceData.rows.length;
    
    console.log(`\n📊 GSC PERFORMANCE-ZUSAMMENFASSUNG (${performanceData.rows.length} Tage):`);
    console.log(`Klicks: ${totalClicks}`);
    console.log(`Impressions: ${totalImpressions}`);
    console.log(`CTR: ${avgCtr}%`);
    console.log(`Durchschnittliche Position: ${avgPosition.toFixed(1)}`);
    
    console.log('\n📈 TÄGLICHE DATEN:');
    performanceData.rows.forEach(row => {
      console.log(`${row.keys[0]}: ${row.clicks} Klicks, ${row.impressions} Impressions, CTR ${(row.ctr*100).toFixed(1)}%, Pos ${row.position.toFixed(1)}`);
    });
  } else {
    console.log('⚠️ Keine Performance-Daten gefunden (normal für neue Domains)');
  }
  
  console.log('\n====================================================');
  console.log('✅ GSC LIVE-AUDIT ERFOLGREICH ABGESCHLOSSEN!');
  console.log('====================================================');
}

// Audit ausführen
runSimpleGSCAudit().catch(err => {
  console.error('❌ Unbehandelter Fehler im Audit:', err.message);
});
