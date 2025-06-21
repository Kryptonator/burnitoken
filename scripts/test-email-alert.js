// Test script for e-mail alerts
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailAlert() {
  // Erstelle einen Transporter mit Yahoo SMTP-Einstellungen
  const transporter = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true, // true für port 465
    auth: {
      user: 'burn.coin@yahoo.com',
      pass: process.env.YAHOO_APP_PASSWORD,
    },
  });

  // Konfiguriere die E-Mail
  const mailOptions = {
    from: 'BurniToken CI <burn.coin@yahoo.com>',
    to: 'burn.coin@yahoo.com',
    subject: '[TEST] BurniToken Alert System',
    text: 'Dies ist ein Test der BurniToken E-Mail-Alert-Funktion. Wenn Sie diese E-Mail erhalten, funktioniert das Alert-System korrekt.',
    html: `
      <h2>BurniToken Alert-System Test</h2>
      <p>Dies ist ein <strong>Test</strong> der BurniToken E-Mail-Alert-Funktion.</p>
      <p>Wenn Sie diese E-Mail erhalten, funktioniert das Alert-System korrekt.</p>
      <p>Test durchgeführt am: ${new Date().toLocaleString()}</p>
    `,
  };

  try {
    // Sende die E-Mail
    const info = await transporter.sendMail(mailOptions);
    console.log('E-Mail erfolgreich gesendet:', info.messageId);
    console.log('Vorschau-URL:', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    return false;
  }
}

// Führe den Test aus
testEmailAlert().then((success) => {
  if (success) {
    console.log('✅ E-Mail-Alert-Test erfolgreich');
    process.exit(0);
  } else {
    console.log('❌ E-Mail-Alert-Test fehlgeschlagen');
    process.exit(1);
  }
});
