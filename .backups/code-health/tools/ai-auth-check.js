// tools/ai-auth-check.js
// Überprüft die Konfiguration und Authentifizierung für die KI-Dienste.

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { recordCheckSuccess, recordCheckError } = require('./status-tracker');

const CHECK_ID = 'ai-auth';
const CHECK_NAME = 'KI Authentifizierungs-Check';

// Lade .env-Datei
dotenv.config();

async function checkAIAuth() {
  console.log('====================================================');
  console.log('🤖 KI AUTHENTIFIZIERUNGS-CHECK');
  console.log('====================================================');

  const requiredEnvVars = [
    'OPENAI_API_KEY',
    // Fügen Sie hier weitere benötigte Umgebungsvariablen für KI-Dienste hinzu
    // 'ANTHROPIC_API_KEY',
    // 'GOOGLE_API_KEY',
  ];

  let allKeysFound = true;
  let missingKeys = [];

  console.log('Prüfe auf erforderliche Umgebungsvariablen in .env...');

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      allKeysFound = false;
      missingKeys.push(envVar);
    } else {
      console.log(`✅ ${envVar} gefunden.`);
    }
  }

  if (allKeysFound) {
    const message = 'Alle erforderlichen KI-API-Schlüssel sind in der .env-Datei konfiguriert.';
    console.log(`\n✅ SUCCESS: ${message}`);
    await recordCheckSuccess(CHECK_ID, CHECK_NAME, message);
    return true;
  } else {
    const errorMessage = `Fehlende KI-API-Schlüssel in der .env-Datei: ${missingKeys.join(', ')}`;
    console.error(`\n❌ ERROR: ${errorMessage}`);
    console.log('\n🔧 Lösung:');
    console.log('1. Öffnen Sie die `.env`-Datei im Hauptverzeichnis des Projekts.');
    console.log(`2. Fügen Sie die folgenden Zeilen hinzu und ersetzen Sie die Platzhalter:`);
    missingKeys.forEach((key) => {
      console.log(`   ${key}=IHR_API_SCHLÜSSEL`);
    });
    await recordCheckError(
      CHECK_ID,
      CHECK_NAME,
      errorMessage,
      'Ergänzen Sie die fehlenden API-Schlüssel in der .env-Datei.',
    );
    return false;
  }
}

// Direkter Aufruf für Testzwecke
if (require.main === module) {
  checkAIAuth().catch((err) => {
    const errorMessage = `Unerwarteter Fehler beim KI-Auth-Check: ${err.message}`;
    console.error(errorMessage);
    recordCheckError(
      CHECK_ID,
      CHECK_NAME,
      errorMessage,
      'Überprüfen Sie das Skript tools/ai-auth-check.js',
    );
  });
}

module.exports = { checkAIAuth };
