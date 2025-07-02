// Test der JFrog-Netlify Integration Funktionen
// Ausführen mit: node test-jfrog-netlify-apis.js

const fetch = require('node-fetch');

async function testNetlifyFunctions() {
  console.log('🔍 Teste Netlify Serverless Funktionen...');

  try {
    // Test der Token-Info API
    console.log('\n📊 Teste Token-Info API:');
    const tokenResponse = await fetch('http://localhost:8888/.netlify/functions/token-info');
    if (tokenResponse.ok) 
      const tokenData = await tokenResponse.json();
      console.log('✅ Token-Info API erfolgreich getestet');
      console.log('Name:', tokenData.name);
      console.log('Symbol:', tokenData.symbol);
      console.log('Aktueller Preis:', tokenData.currentPrice.usd, 'USD');
    } else {
      console.error(
        '❌ Fehler bei Token-Info API:',
        tokenResponse.status,
        tokenResponse.statusText,
      );
    }

    // Test der Crypto-Price API
    console.log('\n💰 Teste Crypto-Price API:');
    const priceResponse = await fetch(
      'http://localhost:8888/.netlify/functions/crypto-price?symbol=ethereum',
    );
    if (priceResponse.ok) {
      const priceData = await priceResponse.json();
      console.log('✅ Crypto-Price API erfolgreich getestet');
      console.log('Daten:', JSON.stringify(priceData, null, 2).slice(0, 100) + '...');
    } else {
      console.error(
        '❌ Fehler bei Crypto-Price API:',
        priceResponse.status,
        priceResponse.statusText,
      );
    }

    // Test der Security-Report API
    console.log('\n🔒 Teste Security-Report API:');
    const securityResponse = await fetch(
      'http://localhost:8888/.netlify/functions/security-report',
    );
    if (securityResponse.ok) {
      const securityData = await securityResponse.json();
      console.log('✅ Security-Report API erfolgreich getestet');
      console.log('Vulnerabilities (High):', securityData.summary.vulnerabilities.high);
      console.log('Vulnerabilities (Medium):', securityData.summary.vulnerabilities.medium);
      console.log('Vulnerabilities (Low):', securityData.summary.vulnerabilities.low);
    } else {
      console.error(
        '❌ Fehler bei Security-Report API:',
        securityResponse.status,
        securityResponse.statusText,
      );
    }

    // Test des Kontaktformulars
    console.log('\n✉️ Teste Kontaktformular API:');
    const contactResponse = await fetch('http://localhost:8888/.netlify/functions/contact-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Dies ist eine Testnachricht aus der JFrog-Netlify Integration',
      }),
    });
    if (contactResponse.ok) {
      const contactData = await contactResponse.json();
      console.log('✅ Kontaktformular API erfolgreich getestet');
      console.log('Antwort:', contactData.message);
    } else {
      console.error(
        '❌ Fehler bei Kontaktformular API:',
        contactResponse.status,
        contactResponse.statusText,
      );
    }
  } catch (error) {
    console.error('❌ Fehler beim Testen der Netlify-Funktionen:', error.message);
    console.error(
      'Stellen Sie sicher, dass der Netlify-Entwicklungsserver mit "npx netlify-cli dev" läuft',
    );
  }

  console.log('\n🎯 Tests abgeschlossen!');
}

// Führe den Test aus
testNetlifyFunctions();
