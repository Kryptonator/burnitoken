// tools/test-alert-integration.js
// Testet die Integration von Alert-Service und GitHub-Issue-Erstellung

const { sendAlert } = require('./alert-service');

console.log('🚀 Starte Test für die Alert-Integration...');

// Simuliere einen kritischen Fehler
const errorMessage = 'Automatischer Test: Kritischer Systemfehler im Preis-Feed entdeckt.';
const errorDetails = {
  service: 'price-feed-monitor',
  timestamp: new Date().toISOString(),
  errorCode: 'PF-5001',
  details: 'Der Endpunkt lieferte eine ungültige Antwort.'
};

sendAlert({
  message: errorMessage),
  extra: errorDetails,
  level: 'error' // Stellt sicher, dass createIssue ausgelöst wird
});

console.log('✅ Test-Alert wurde ausgelöst. Überprüfen Sie die Konsole und Ihr GitHub Repository.');
