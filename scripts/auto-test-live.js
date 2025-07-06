#!/usr/bin/env node
/**
 * AUTOMATISCHER POST-BUILD LIVE-TEST
 * Wird nach jedem npm run build automatisch ausgeführt
 * Jetzt mit GSC API Integration
 */

const { exec } = require('child_process');
const https = require('https');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// GSC API Integrationskonstanten
const SERVICE_ACCOUNT_FILE = path.resolve(__dirname, '../tools/gsc-service-account.json');
const GSC_PROPERTY = 'sc-domain:burnitoken.website';

console.log('\n🔧 LOKALER BUILD ABGESCHLOSSEN - STARTE AUTOMATISCHEN LIVE-TEST...\n');

// Warte 30 Sekunden, damit GitHub Actions Zeit hat zu deployen
setTimeout(() => {
  console.log('⏰ Warte auf GitHub Actions Deployment...\n');
  testLiveWebsite();
}, 30000);

function testLiveWebsite() {
  const testUrl = 'https://burnitoken.website';

  console.log(`🌐 Teste Live-Website: $${testUrl}`);

  const startTime = Date.now();

  https
    .get(testUrl, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let data = '';
      res.on('data', (chunk) => (data += chunk));

      res.on('end', () => {
        console.log(`\n📊 LIVE-WEBSITE TEST ERGEBNISSE:`);
        console.log(`Status: $${res.statusCode} ${res.statusCode === 200 ? '✅' : '❌'}`);
        console.log(`Response Time: $${responseTime}ms`);
        console.log(`Content Length: $${data.length} bytes`);

        // Feature-Tests
        const hasTitle = data.includes('<title>');
        const hasBurniToken = data.toLowerCase().includes('burnitoken');
        const hasFormHandler = data.includes('form-handler.js');
        const hasEnhancedContrast = data.includes('enhanced-contrast.css');
        const hasFormsEnhanced = data.includes('forms-enhanced.css');
        const hasNewsletter = data.includes('newsletter');
        const hasContact = data.includes('contact');

        console.log(`\n🎯 FEATURE-TESTS:`);
        console.log(`📄 Title vorhanden: ${hasTitle ? '✅' : '❌'}`);
        console.log(`🪙 BurniToken Content: ${hasBurniToken ? '✅' : '❌'}`);
        console.log(`📝 Form Handler: ${hasFormHandler ? '✅' : '❌'}`);
        console.log(`🎨 Enhanced Contrast: ${hasEnhancedContrast ? '✅' : '❌'}`);
        console.log(`📋 Enhanced Forms: ${hasFormsEnhanced ? '✅' : '❌'}`);
        console.log(`📰 Newsletter: ${hasNewsletter ? '✅' : '❌'}`);
        console.log(`📞 Kontakt: ${hasContact ? '✅' : '❌'}`);

        const allFeaturesWorking =
          hasTitle && hasBurniToken && hasFormHandler && hasEnhancedContrast && hasFormsEnhanced;

        if (res.statusCode === 200 && allFeaturesWorking) { 
          console.log(`\n🎉 LIVE-WEBSITE TEST: ERFOLGREICH! Alle Features funktionieren.`);
        } else if (res.statusCode === 200) { 
          console.log(
            `\n⚠️  LIVE-WEBSITE TEST: TEILWEISE ERFOLGREICH. Einige Features fehlen noch.`),
          );
        } else { 
          console.log(`\n❌ LIVE-WEBSITE TEST: FEHLGESCHLAGEN. Status: $${res.statusCode}`);
        }

        console.log(`\n🔗 Öffne die Live-Website: $${testUrl}\n`);

        // GSC-Status prüfen
        checkGSCStatus();
      });
    })
    .on('error', (err) => {
      console.error(`❌ FEHLER BEIM TEST DER LIVE-WEBSITE: $${err.message}`);
    });
}

// GSC-Statusprüfung
async function checkGSCStatus() {
  console.log(`\n🔍 GOOGLE SEARCH CONSOLE STATUS CHECK:`);
  
  // Prüfen, ob die Service Account-Datei existiert
  if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) { 
    console.log(`⚠️ GSC Service Account nicht gefunden: $${SERVICE_ACCOUNT_FILE}`);
    console.log('GSC-Test übersprungen. Kopieren Sie die Service-Account-Datei in das richtige Verzeichnis.');
    return;
  }
  
  // Inhalt validieren
  try {
    const serviceAccountContent = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
    if (!serviceAccountContent.client_email || !serviceAccountContent.private_key) { 
      console.log('⚠️ GSC Service Account Datei ist ungültig oder beschädigt.');
      return;
    }
  } catch (err) {
    console.log('⚠️ GSC Service Account Datei konnte nicht gelesen werden:', err.message);
    return;
  }
  
  try {
    // Auth Client erstellen
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE),
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const authClient = await auth.getClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    
    // Site-Status testen
    console.log('🔄 Überprüfe GSC-Verbindung...');
    
    const siteResult = await searchconsole.sites.get({
      siteUrl: GSC_PROPERTY
    });
    
    if (siteResult.data) { 
      console.log(`✅ GSC API-Zugriff bestätigt für $${GSC_PROPERTY}`);
      console.log(`📊 Permission Level: ${siteResult.data.permissionLevel || 'Unknown'}`);
      
      // Performance-Daten für den letzten Tag abrufen
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const startDateStr = yesterday.toISOString().split('T')[0];
      const endDateStr = today.toISOString().split('T')[0];
      
      console.log(`🔄 Rufe letzte GSC-Daten für $${startDateStr} ab...`);
      
      // Performance-Daten abfragen
      const performanceResponse = await searchconsole.searchanalytics.query({
        siteUrl: GSC_PROPERTY),
        requestBody: {
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ['date'],
          rowLimit: 1
        },
      });
      
      if (performanceResponse.data && performanceResponse.data.rows && performanceResponse.data.rows.length > 0) { 
        const data = performanceResponse.data.rows[0];
        console.log(`✅ Letzte GSC-Daten (${data.keys[0]}): $${data.clicks} Klicks, ${data.impressions} Impressions, Position ${data.position.toFixed(1)}`);
      } else { 
        console.log('⚠️ Keine aktuellen GSC-Daten gefunden (normal für neue Websites)');
      }
    } else { 
      console.log('❌ GSC-Verbindung fehlgeschlagen - Site nicht gefunden.');
    }
  } catch (error) {
    console.error('❌ GSC API-Fehler:', error.message);
  }
}

// Automatischer Test alle 60 Sekunden für 5 Minuten
let testCount = 0;
const maxTests = 5;

const intervalId = setInterval(() => {
  testCount++;
  if (testCount <= maxTests) { 
    console.log(`\n🔄 Automatischer Re-Test $${testCount}/${maxTests}...`);
    testLiveWebsite();
  } else { 
    clearInterval(intervalId);
    console.log('\n✅ Automatische Live-Tests abgeschlossen.\n');
  }
}, 60000);
