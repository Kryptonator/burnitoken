#!/usr/bin/env node

/**
 * BurniToken E-Mail Alert Test Tool
 * 
 * Dieses Tool sendet eine Test-E-Mail, um die korrekte Konfiguration
 * des E-Mail-Alert-Systems zu überprüfen.
 * 
 * Verwendung:
 *   node tools/test-email-alert.js
 * 
 * Benötigte Umgebungsvariablen:
 *   YAHOO_APP_PASSWORD
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🚀 BurniToken E-Mail Alert Test Tool');
console.log('=====================================');

// Überprüfe, ob das App-Passwort gesetzt ist
if (!process.env.YAHOO_APP_PASSWORD) {
  console.error('❌ Fehler: YAHOO_APP_PASSWORD ist nicht in der .env-Datei gesetzt.');
  console.log('   Bitte füge die folgende Zeile in die .env-Datei ein:');
  console.log('   YAHOO_APP_PASSWORD=dein_yahoo_app_passwort');
  process.exit(1);
}

// Verwende entweder das reale Yahoo-SMTP oder einen Test-Account
async function run() {
  console.log('🔍 Initialisiere E-Mail-Transport...');
  
  let transporter;
  let recipientInfo;
  
  if (process.argv.includes('--use-ethereal') || !process.env.YAHOO_APP_PASSWORD) {
    console.log('ℹ️ Verwende Ethereal-Test-Account (keine reale E-Mail wird versendet)');
    
    // Erstelle einen Test-Account bei Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    recipientInfo = `Ethereal Test-Account (${testAccount.user})`;
  } else {
    console.log('ℹ️ Verwende Yahoo-SMTP-Server für realen E-Mail-Versand');
    
    transporter = nodemailer.createTransport({
      host: 'smtp.mail.yahoo.com',
      port: 465,
      secure: true,
      auth: {
        user: 'burn.coin@yahoo.com',
        pass: process.env.YAHOO_APP_PASSWORD
      }
    });
    
    recipientInfo = 'burn.coin@yahoo.com';
  }
  
  // Bereite die E-Mail vor
  console.log('📧 Bereite Test-Alert vor...');
  
  const mailOptions = {
    from: 'BurniToken CI <burn.coin@yahoo.com>',
    to: 'burn.coin@yahoo.com',
    subject: '[TEST] BurniToken Alert-System',
    text: `
BurniToken Alert-System Test

Dies ist ein Test des BurniToken E-Mail-Alert-Systems.
Wenn Sie diese E-Mail erhalten, ist das Alert-System korrekt konfiguriert.

TESTDETAILS
-----------
Datum: ${new Date().toLocaleString()}
Modus: ${process.argv.includes('--use-ethereal') ? 'Test (Ethereal)' : 'Real (Yahoo)'}
Absender: burn.coin@yahoo.com

Falls Sie diese E-Mail nicht erwartet haben, ignorieren Sie sie bitte.
`,
    html: `
      <h2>BurniToken Alert-System Test</h2>
      <p>Dies ist ein <strong>Test</strong> des BurniToken E-Mail-Alert-Systems.</p>
      <p>Wenn Sie diese E-Mail erhalten, ist das Alert-System korrekt konfiguriert.</p>
      
      <h3>Testdetails</h3>
      <ul>
        <li><strong>Datum:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>Modus:</strong> ${process.argv.includes('--use-ethereal') ? 'Test (Ethereal)' : 'Real (Yahoo)'}</li>
        <li><strong>Absender:</strong> burn.coin@yahoo.com</li>
      </ul>
      
      <p style="color: #777; font-size: 0.8em;">Falls Sie diese E-Mail nicht erwartet haben, ignorieren Sie sie bitte.</p>
    `
  };
  
  // Sende die E-Mail
  try {
    console.log(`📤 Sende Test-Alert an ${recipientInfo}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ E-Mail erfolgreich gesendet!');
    console.log('   Message-ID:', info.messageId);
    
    // Wenn Ethereal verwendet wird, zeige die Test-URL an
    if (process.argv.includes('--use-ethereal') || !process.env.YAHOO_APP_PASSWORD) {
      console.log('   Vorschau-URL:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('   Bitte prüfe den Posteingang von burn.coin@yahoo.com');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Senden der E-Mail:', error.message);
    if (error.message.includes('Invalid login')) {
      console.log('   Hinweis: Überprüfe das Yahoo App-Passwort in der .env-Datei.');
    }
    return false;
  }
}

// Führe das Skript aus
run()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Unerwarteter Fehler:', err);
    process.exit(1);
  });
