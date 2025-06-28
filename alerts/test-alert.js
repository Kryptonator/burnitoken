// alerts/test-alert.js
// Testet den E-Mail-Alert in deutscher Sprache
const { sendAlert } = require('./alert-service');

sendAlert({
  message: 'Dies ist ein automatischer Test-Alarm aus dem BurniToken Recovery-System.\n\nWenn Sie diese E-Mail erhalten, funktioniert die deutschsprachige Benachrichtigung korrekt!\n\nMit freundlichen Grüßen,\nIhr BurniToken System',
  email: 'burn.coin@yahoo.com',
  level: 'info',
  extra: { test: true, zeit: new Date().toLocaleString('de-DE') }
});

console.log('Deutscher Test-Alert wurde ausgelöst. Bitte prüfen Sie Ihr E-Mail-Postfach!');
