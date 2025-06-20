#!/usr/bin/env node
/**
 * AUTOMATISCHER POST-BUILD LIVE-TEST
 * Wird nach jedem npm run build automatisch ausgeführt
 */

const { exec } = require('child_process');
const https = require('https');

console.log('\n🔧 LOKALER BUILD ABGESCHLOSSEN - STARTE AUTOMATISCHEN LIVE-TEST...\n');

// Warte 30 Sekunden, damit GitHub Actions Zeit hat zu deployen
setTimeout(() => {
  console.log('⏰ Warte auf GitHub Actions Deployment...\n');
  testLiveWebsite();
}, 30000);

function testLiveWebsite() {
  const testUrl = 'https://burnitoken.webseit';

  console.log(`🌐 Teste Live-Website: ${testUrl}`);

  const startTime = Date.now();

  https
    .get(testUrl, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let data = '';
      res.on('data', (chunk) => (data += chunk));

      res.on('end', () => {
        console.log(`\n📊 LIVE-WEBSITE TEST ERGEBNISSE:`);
        console.log(`Status: ${res.statusCode} ${res.statusCode === 200 ? '✅' : '❌'}`);
        console.log(`Response Time: ${responseTime}ms`);
        console.log(`Content Length: ${data.length} bytes`);

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
        console.log(`📝 Form Handler JS: ${hasFormHandler ? '✅' : '❌'}`);
        console.log(`🎨 Enhanced Contrast CSS: ${hasEnhancedContrast ? '✅' : '❌'}`);
        console.log(`📋 Forms Enhanced CSS: ${hasFormsEnhanced ? '✅' : '❌'}`);
        console.log(`📧 Newsletter Form: ${hasNewsletter ? '✅' : '❌'}`);
        console.log(`📞 Contact Form: ${hasContact ? '✅' : '❌'}`);

        const allFeaturesWorking =
          hasTitle && hasBurniToken && hasFormHandler && hasEnhancedContrast && hasFormsEnhanced;

        if (res.statusCode === 200 && allFeaturesWorking) {
          console.log(`\n🎉 LIVE-WEBSITE TEST: ERFOLGREICH! Alle Features funktionieren.`);
        } else if (res.statusCode === 200) {
          console.log(
            `\n⚠️  LIVE-WEBSITE TEST: TEILWEISE ERFOLGREICH. Einige Features fehlen noch.`,
          );
        } else {
          console.log(`\n❌ LIVE-WEBSITE TEST: FEHLGESCHLAGEN. Status: ${res.statusCode}`);
        }

        console.log(`\n🔗 Öffne die Live-Website: ${testUrl}\n`);
      });
    })
    .on('error', (err) => {
      console.log(`\n❌ LIVE-WEBSITE TEST FEHLER: ${err.message}`);
      console.log(`Möglicherweise ist das Deployment noch nicht abgeschlossen.\n`);
    });
}

// Automatischer Test alle 60 Sekunden für 5 Minuten
let testCount = 0;
const maxTests = 5;

const intervalId = setInterval(() => {
  testCount++;
  if (testCount <= maxTests) {
    console.log(`\n🔄 Automatischer Re-Test ${testCount}/${maxTests}...`);
    testLiveWebsite();
  } else {
    clearInterval(intervalId);
    console.log('\n✅ Automatische Live-Tests abgeschlossen.\n');
  }
}, 60000);
