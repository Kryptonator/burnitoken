require('dotenv').config();
const { sendAlert } = require('./alert-service');

console.log('🚀 Starte Test: Sende kritischen Alert, der ein Issue erstellen soll...');

const testError = {
  message: 'Automatischer Test: Kritischer Systemfehler im Backend-Service',
  level: 'critical',
  createIssue: true, // Explizit auf true setzen für den Test
  extra: {
    service: 'payment-gateway',
    errorCode: 'E-12045',
    timestamp: new Date().toISOString(),
    details: 'Die Verbindung zur Datenbank konnte nicht hergestellt werden.'
  }
};

sendAlert(testError);

console.log('✅ Test-Alert wurde ausgelöst. Überprüfen Sie die Konsolenausgabe und Ihr GitHub Repository.');
