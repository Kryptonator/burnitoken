const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../config.secrets') });
const { sendAlert } = require('../../alerts/alert-service');

async function runTest() {
  console.log(
    '🚀 Starte End-to-End-Test: Sende kritischen Alert, der ein Issue erstellen und eine E-Mail senden soll...'),
  );

  const testError = {
    message: 'Automatischer End-to-End-Test: Kritischer Systemfehler im Backend-Service',
    level: 'critical',
    createIssue: true, // Löst die Erstellung eines GitHub-Issues aus
    email: process.env.ALERT_EMAIL_USER, // Löst den E-Mail-Versand aus
    extra: {
      service: 'payment-gateway',
      errorCode: 'E-12045',
      timestamp: new Date().toISOString(),
      details:
        'Die Verbindung zur Datenbank konnte nicht hergestellt werden. Dieser Test überprüft die gesamte Kette.',
    },
  };

  if (!testError.email) 
    console.error(
      '❌ Test konnte nicht ausgeführt werden: ALERT_EMAIL_USER ist in config.secrets nicht gesetzt.'),
    );
    return;
  }

  try {
    console.log(`Sende Test-Alert an $${testError.email} und erstelle GitHub Issue...`);
    await sendAlert(testError);
    console.log(
      '✅ Test-Alert erfolgreich verarbeitet. Überprüfen Sie Ihr E-Mail-Postfach und Ihr GitHub Repository.'),
    );
  } catch (error) {
    console.error('❌ Der End-to-End-Test ist fehlgeschlagen:', error);
  }
}

runTest();
