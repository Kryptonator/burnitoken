// tools/test-issue-creation.js
/**
 * Test-Skript zur Überprüfung der GitHub Issue Erstellung.
 * 
 * Löst einen Test-Alarm aus, der die gesamte Kette von
 * alert-service -> github-issue-creator anstößt.
 */

// GANZ OBEN: Umgebungsvariablen aus .env laden
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });


const { sendAlert } = require('./alert-service');

console.log('🚀 Starte Test für die Erstellung von GitHub Issues...');

// Ein Test-Fehlerobjekt, wie es von einem Monitoring-Skript kommen könnte
const testErrorDetails = {
    source: 'tools/website-health-check.js',
    errorCode: 'E_SSL_CERT_EXPIRED',
    url: 'https://burnitoken.com',
    timestamp: new Date().toISOString(),
    details: 'Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.'
};

// Den Alert senden, der das Issue erstellen soll
sendAlert({
    message: 'Test: Kritisches SSL-Zertifikat abgelaufen',
    level: 'error', // Wichtig, da nur 'error'-Level Issues erstellen
    extra: testErrorDetails,
    createIssue: true // Explizit auf true setzen für den Test
});

console.log('✅ Test-Alert wurde ausgelöst. Überprüfen Sie bitte Ihr GitHub Repository auf ein neues Issue.');
