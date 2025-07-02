// tools/_diagnostics/test-email-alert.js
const { sendAlert } = require('../alert-service');

console.log('Starte E-Mail-Alert-Test...');

sendAlert({
  message: 'Dies ist ein Test-Alert vom neuen E-Mail-System.',
  level: 'info',
  extra: {
    details: 'Dieser Test prüft, ob die E-Mail-Funktion im alert-service korrekt funktioniert.',
    timestamp: new Date().toISOString(),
  },
  createIssue: false, // Wir wollen kein GitHub Issue für diesen Test
  sendEmail: true, // Wir wollen eine E-Mail senden
});

console.log('Test-Alert-Funktion aufgerufen. Überprüfen Sie die Konsole und das E-Mail-Postfach.');
