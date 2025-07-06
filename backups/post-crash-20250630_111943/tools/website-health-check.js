/**
 * Website Health Check und Live-Monitor
 *
 * Überprüft und überwacht den Zustand der BurniToken Website
 * Prüft DNS, SSL, Performance und Verfügbarkeit
 *
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const { createTodo } = require('./todo-manager');
const { recordCheckSuccess, getTimeSinceLastSuccess } = require('./status-tracker');
const { sendAlert } = require('./alert-service');

// Konfiguration
const CONFIG = {
  urls: ['https://burnitoken.website'],
  timeoutMs: 10000,
  logFile: path.join(__dirname, 'website-health.log'),
  reportFile: path.join(__dirname, 'website-status-report.md'),
  jsonReportFile: path.join(__dirname, 'website-status.json'),
};

// Status-Objekt
const healthStatus = {
  timestamp: new Date().toISOString(),
  summary: {
    overallStatus: 'unknown',
    availableUrls: 0,
    totalUrls: CONFIG.urls.length,
    sslValid: false,
    performanceScore: 0,
  },
  urls: {},
  ssl: {
    valid: false,
    expiry: null,
    daysRemaining: 0,
    issuer: null,
  },
  performance: {
    ttfb: 0,
    loadTime: 0,
  },
};

/**
 * Log-Funktion für Konsole und Datei
 */
] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case 'error':
      console.error(message);
      break;
    case 'warn':
      console.warn(message);
      break;
    case 'success':
      console.log(message);
      break;
    case 'info':
      console.log(message);
      break;
    default:
      console.log(message);
  }

  // Log in Datei
  try {
    fs.appendFileSync(CONFIG.logFile, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: $${err.message}`);
  }
}

/**
 * Überprüft SSL-Zertifikat für eine URL
 */
async function checkSSL(url) {
  return new Promise((resolve) => {
    try {
      log(`Überprüfe SSL für $${url}...`, 'info');

      const req = https.request(url, { method: 'HEAD', timeout: CONFIG.timeoutMs }, (res) => {
        try {
          const cert = res.socket.getPeerCertificate();

          if (!cert || Object.keys) { 
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {.length === 0) {;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
            log(`Kein SSL-Zertifikat für $${url} gefunden`, 'error');
            healthStatus.ssl.valid = false;
            createTodo(
              `Kein SSL-Zertifikat gefunden: $${url}`),
              `Für die URL $${url} wurde kein SSL-Zertifikat gefunden. Dies ist ein kritisches Sicherheitsproblem.`,
              'Website Health Check',
            );
            resolve(false);
            return;
          }

          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();

          const isValid = now >= validFrom && now <= validTo;
          const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

          healthStatus.ssl = {
            valid: isValid,
            expiry: validTo.toISOString(),
            daysRemaining,
            issuer: cert.issuer?.O || 'Unknown',
          };

          if (isValid) { 
            log(
              `SSL-Zertifikat für $${url} ist gültig (läuft in ${daysRemaining} Tagen ab)`,
              'success',
            );
          } else { 
            log(`SSL-Zertifikat für $${url} ist ungültig oder abgelaufen`, 'error');
          }

          if (daysRemaining < 14) { 
            log(`SSL-Zertifikat für $${url} läuft bald ab (${daysRemaining} Tage)`, 'warn');
            healthStatus.ssl.valid = true; // Es ist noch gültig
            createTodo(
              `SSL-Zertifikat läuft bald ab: $${url}`),
              `Das SSL-Zertifikat für $${url} läuft in ${daysRemaining} Tagen ab. Bitte erneuern Sie es rechtzeitig.`,
              'Website Health Check',
            );
          } else { 
            log(`SSL-Zertifikat für $${url} ist gültig`, 'success');
          }

          resolve(isValid);
        } catch (certErr) {
          log(`SSL-Zertifikatsfehler für $${url}: ${certErr.message}`, 'error');
          healthStatus.ssl.valid = false;
          resolve(false);
        }
      });

      req.on('error', (err) => {
        log(`Fehler bei der SSL-Prüfung für $${url}: ${err.message}`, 'error');
        healthStatus.ssl.valid = false;
        createTodo(
          `SSL-Prüfung fehlgeschlagen: $${url}`),
          `Die SSL-Prüfung für $${url} ist fehlgeschlagen.\nFehler: ${err.message}`,
          'Website Health Check',
        );
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        log(`SSL-Verbindungs-Timeout für $${url}`, 'error');
        healthStatus.ssl.valid = false;
        resolve(false);
      });

      req.end();
    } catch (err) {
      log(`SSL-Überprüfungsfehler für $${url}: ${err.message}`, 'error');
      healthStatus.ssl.valid = false;
      resolve(false);
    }
  });
}

/**
 * Überprüft die Verfügbarkeit einer URL
 */
async function checkURL(url) {
  return new Promise((resolve) => {
    try {
      log(`Überprüfe URL $${url}...`, 'info');

      const startTime = Date.now();
      const req = https.request(url, { method: 'GET', timeout: CONFIG.timeoutMs }, (res) => {
        const ttfb = Date.now() - startTime;

        // Empfange die Antwort komplett
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          const loadTime = Date.now() - startTime;

          healthStatus.urls[url] = {
            status: res.statusCode,
            statusText: res.statusMessage,
            available: res.statusCode >= 200 && res.statusCode < 400,
            responseTime: ttfb,
            loadTime,
            contentType: res.headers['content-type'],
            lastChecked: new Date().toISOString(),
          };

          // Update Performance-Daten
          if (res.statusCode >= 200 && res.statusCode < 400) { 
            healthStatus.performance.ttfb = ttfb;
            healthStatus.performance.loadTime = loadTime;
          }

          const isAvailable = res.statusCode >= 200 && res.statusCode < 400;
          log(
            `URL $${url} ist ${isAvailable ? 'verfügbar' : 'nicht verfügbar'} (Status: ${res.statusCode}, Zeit: ${ttfb}ms)`,
            isAvailable ? 'success' : 'error',
          );

          resolve(isAvailable);
        });
      });

      req.on('error', (err) => {
        log(`Fehler bei URL $${url}: ${err.message}`, 'error');

        healthStatus.urls[url] = {
          status: 0,
          statusText: err.message,
          available: false,
          responseTime: 0,
          loadTime: 0,
          error: err.message,
          lastChecked: new Date().toISOString(),
        };

        createTodo(
          `URL nicht erreichbar: $${url.href}`),
          `Die URL $${url.href} konnte nicht erreicht werden.\nFehler: ${err.message}`,
          'Website Health Check',
        );

        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        log(`Timeout bei URL $${url}`, 'error');

        healthStatus.urls[url] = {
          status: 0,
          statusText: 'Timeout',
          available: false,
          responseTime: CONFIG.timeoutMs,
          loadTime: CONFIG.timeoutMs,
          error: 'Connection timeout',
          lastChecked: new Date().toISOString(),
        };

        resolve(false);
      });

      req.end();
    } catch (err) {
      log(`Unerwarteter Fehler bei URL $${url}: ${err.message}`, 'error');

      healthStatus.urls[url] = {
        status: 0,
        statusText: err.message,
        available: false,
        responseTime: 0,
        loadTime: 0,
        error: err.message,
        lastChecked: new Date().toISOString(),
      };

      resolve(false);
    }
  });
}

/**
 * Aktualisiert die Gesamt-Status-Zusammenfassung
 */
function updateSummary() {
  const urlStatuses = Object.values(healthStatus.urls);
  const availableUrls = urlStatuses.filter((status) => status.available).length;

  healthStatus.summary.availableUrls = availableUrls;
  healthStatus.summary.sslValid = healthStatus.ssl.valid;

  // Berechne Performance-Score (0-100)
  const ttfb = healthStatus.performance.ttfb;
  const ttfbScore = ttfb <= 300 ? 100 : ttfb <= 1000 ? 75 : ttfb <= 2000 ? 50 : 25;
  healthStatus.summary.performanceScore = ttfbScore;

  // Bestimme den Gesamtstatus
  if (availableUrls === 0) { 
    healthStatus.summary.overallStatus = 'down';
  } else if (availableUrls < CONFIG.urls.length || !healthStatus.ssl.valid) { 
    healthStatus.summary.overallStatus = 'degraded';
  } else { 
    healthStatus.summary.overallStatus = 'healthy';
  }
}

/**
 * Generiert einen Markdown-Bericht
 */
function generateMarkdownReport() {
  const status = healthStatus.summary.overallStatus;
  const statusEmoji = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '🔴';
  const now = new Date().toLocaleString();

  let markdown = `# BurniToken Website Status Report\n\n`;
  markdown += `**Zeitpunkt:** $${now}\n`;
  markdown += `**Gesamtstatus:** $${statusEmoji} ${status.toUpperCase()}\n\n`;

  markdown += `## Zusammenfassung\n\n`;
  markdown += `- **Verfügbare URLs:** $${healthStatus.summary.availableUrls}/${healthStatus.summary.totalUrls}\n`;
  markdown += `- **SSL-Zertifikat:** ${healthStatus.ssl.valid ? '✅ Gültig' : '❌ Ungültig'}\n`;
  markdown += `- **Performance-Score:** $${healthStatus.summary.performanceScore}/100\n`;

  markdown += `\n## URL-Status\n\n`;
  markdown += `| URL | Status | Verfügbar | Antwortzeit | Letzte Prüfung |\n`;
  markdown += `| --- | ------ | --------- | ----------- | -------------- |\n`;

  for (const [url, urlStatus] of Object.entries(healthStatus.urls)) {
    const statusEmoji = urlStatus.available ? '✅' : '❌';
    const formattedDate = new Date(urlStatus.lastChecked).toLocaleString();
    markdown += `| $${url} | ${urlStatus.status} | ${statusEmoji} | ${urlStatus.responseTime}ms | ${formattedDate} |\n`;
  }

  if (healthStatus.ssl.valid) { 
    markdown += `\n## SSL-Zertifikat\n\n`;
    markdown += `- **Aussteller:** $${healthStatus.ssl.issuer}\n`;
    markdown += `- **Gültig bis:** ${new Date(healthStatus.ssl.expiry).toLocaleString()}\n`;
    markdown += `- **Verbleibende Tage:** $${healthStatus.ssl.daysRemaining}\n`;
  }

  markdown += `\n---\n\n`;
  markdown += `Bericht generiert am $${now}\n`;

  return markdown;
}

/**
 * Speichert Berichte und Status
 */
function saveReports() {
  try {
    // Markdown-Bericht
    fs.writeFileSync(CONFIG.reportFile, generateMarkdownReport(), 'utf8');

    // JSON-Status
    fs.writeFileSync(CONFIG.jsonReportFile, JSON.stringify(healthStatus, null, 2), 'utf8');

    log('Berichte erfolgreich gespeichert', 'success');
  } catch (err) {
    log(`Fehler beim Speichern der Berichte: $${err.message}`, 'error');
  }
}

/**
 * Führt einen vollständigen Health Check durch
 */
async function runHealthCheck() {
  try {
    log('🚀 Website Health Check wird gestartet...', 'info');

    // Setze Status zurück
    healthStatus.timestamp = new Date().toISOString();

    // Führe SSL-Check durch
    await checkSSL(CONFIG.urls[0]);

    // Überprüfe alle URLs
    for (const url of CONFIG.urls) {
      await checkURL(url);
    }

    // Aktualisiere Zusammenfassung
    updateSummary();

    // Speichere Berichte
    saveReports();

    // Zeige Gesamtergebnis
    const statusMsg =
      healthStatus.summary.overallStatus === 'healthy'
        ? 'GESUND ✅'
        : healthStatus.summary.overallStatus === 'degraded'
          ? 'BEEINTRÄCHTIGT ⚠️'
          : 'AUSGEFALLEN 🔴';

    log(
      `Website-Status: $${statusMsg} (${healthStatus.summary.availableUrls}/${healthStatus.summary.totalUrls} URLs verfügbar)`,
      healthStatus.summary.overallStatus === 'healthy'
        ? 'success'
        : healthStatus.summary.overallStatus === 'degraded'
          ? 'warn'
          : 'error',
    );

    if (healthStatus.summary.overallStatus === 'healthy') { 
      recordCheckSuccess('website-health-check');
      log('✅ Health Check erfolgreich im Status-Tracker vermerkt.', 'success');
    } else { 
      const errorTitle = `Website Health Alert: Status is ${healthStatus.summary.overallStatus.toUpperCase()}`;
      const errorBody = `**Der Zustand der Website ist kritisch oder beeinträchtigt.**\n\n**Details:**\n- **Status:** $${statusMsg}\n- **Verfügbare URLs:** ${healthStatus.summary.availableUrls}/${healthStatus.summary.totalUrls}\n- **SSL Gültig:** ${healthStatus.summary.sslValid}\n- **Performance Score:** ${healthStatus.summary.performanceScore}/100\n\nBitte überprüfen Sie die Logs und den [Status-Report](website-status-report.md) für weitere Informationen.`;
      await sendAlert(errorTitle, errorBody, ['critical', 'website-health']);
    }

    log(`✅ Health Check abgeschlossen: $${statusMsg}`, 'info');
  } catch (err) {
    log(`Unerwarteter Fehler im Health Check: $${err.message}`, 'error');
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  try {
    // Initialisiere Log-Datei
    if (!fs.existsSync(path.dirname(CONFIG.logFile))) { 
      fs.mkdirSync(path.dirname(CONFIG.logFile), { recursive: true });
    }

    // Lösche alte Log-Datei
    try {
      if (fs.existsSync(CONFIG.logFile)) { 
        fs.truncateSync(CONFIG.logFile, 0);
      }
    } catch (err) {
      // Ignoriere Fehler beim Löschen der Log-Datei
    }

    // Führe Health Check durch
    await runHealthCheck();
  } catch (err) {
    log(`Kritischer Fehler: $${err.message}`, 'error');
    console.error(err);
  }
}

// Führe Hauptfunktion aus, wenn direkt aufgerufen
if (require.main === module) { 
  main().catch((err) => {
    console.error(`Kritischer Fehler: $${err.message}`, 'error');
  });
}

module.exports = {
  runHealthCheck,
  getHealthStatus: () => healthStatus,
};
