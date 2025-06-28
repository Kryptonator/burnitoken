// alerts/alert-service.js
// Zentrale Alert-Funktion für kritische Fehler/Status (E-Mail und Webhook)
const nodemailer = require('nodemailer');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const ALERT_LOG = path.join(__dirname, 'logs/alert.log');

function sendAlert({ message, webhookUrl, email, level = 'error', extra = {} }) {
  if (!message) return;
  const payload = {
    text: `[${level.toUpperCase()}] ${message}`,
    ...extra,
  };
  // Logge Alert zusätzlich in Datei
  try {
    fs.appendFileSync(
      ALERT_LOG,
      `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`,
    );
  } catch (e) {}
  // E-Mail senden
  if (email) {
    const transporter = nodemailer.createTransport({
      service: 'yahoo',
      auth: {
        user: process.env.ALERT_EMAIL_USER || 'burn.coin@yahoo.com',
        pass: process.env.ALERT_EMAIL_PASS || 'DEIN_APP_PASSWORT',
      },
    });
    const mailOptions = {
      from: process.env.ALERT_EMAIL_USER || 'burn.coin@yahoo.com',
      to: email,
      subject: `[ALARM] ${level.toUpperCase()} - BurniToken Recovery/Status`,
      text:
        `Automatische Benachrichtigung (BurniToken Recovery/Status):\n\n${message}` +
        (extra && Object.keys(extra).length
          ? '\n\nZusatzinfos:\n' + JSON.stringify(extra, null, 2)
          : '') +
        '\n\nBitte prüfen Sie umgehend das System!',
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('E-Mail-Alert-Fehler:', error);
      } else {
        console.log('E-Mail-Alert gesendet:', info.response);
      }
    });
  }
  // Webhook senden (optional)
  else if (webhookUrl) {
    const parsedUrl = url.parse(webhookUrl);
    const data = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      },
      (res) => {},
    );
    req.on('error', (e) => {
      console.error('Alert-Webhook-Fehler:', e);
    });
    req.write(data);
    req.end();
  } else {
    // Fallback: Logge Alert lokal
    console.error('ALERT:', payload);
  }
}

module.exports = { sendAlert };
