/**
 * Unified Website Monitoring Service
 * 
 * Zentrales Monitoring-System für die BurniToken Website
 * Integriert alle vorhandenen Tools und Services für kontinuierliche Überwachung
 * 
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Import der vorhandenen Module
const websiteHealthCheck = require('./website-health-check');
const deploymentChecker = require('./deployment-checker');

// Konfiguration
const CONFIG = {
  monitoringIntervalMinutes: 15,
  criticalCheckIntervalMinutes: 5,
  reportPath: path.join(__dirname, 'reports'),
  logFile: path.join(__dirname, 'unified-monitoring.log'),
  statusFile: path.join(__dirname, 'unified-monitoring-status.json'),
  alertThreshold: {
    downtime: 2, // Anzahl aufeinanderfolgender Fehler, bevor ein Alert ausgelöst wird
    performance: 75, // Performance-Score unter diesem Wert löst ein Alert aus
  },
  urls: [
    'https://burnitoken.com',
    'https://www.burnitoken.com',
    'https://burnitoken.website'
  ],
  webhookUrls: {
    slack: process.env.SLACK_WEBHOOK_URL || '',
    discord: process.env.DISCORD_WEBHOOK_URL || '',
  },
  emailAlerts: {
    enabled: true,
    recipient: process.env.ALERT_EMAIL || 'admin@burnitoken.com',
  }
};

// Status-Objekt
const monitoringStatus = {
  timestamp: new Date().toISOString(),
  startTime: new Date().toISOString(),
  lastCheck: null,
  checksPerformed: 0,
  monitoringActive: false,
  currentStatus: 'unknown',
  history: [],
  alerts: [],
  services: {
    website: {
      status: 'unknown',
      lastCheck: null,
      checkCount: 0,
      errorCount: 0
    },
    deployment: {
      status: 'unknown',
      lastCheck: null,
      checkCount: 0,
      errorCount: 0
    },
    performance: {
      status: 'unknown',
      lastCheck: null,
      checkCount: 0,
      score: 0
    }
  }
};

/**
 * Log-Funktion für Konsole und Datei
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch(level) {
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
    console.error(`Fehler beim Schreiben ins Log: ${err.message}`);
  }
}

/**
 * Speichert den Monitoring-Status
 */
function saveMonitoringStatus() {
  try {
    // Stelle sicher, dass das Verzeichnis existiert
    const statusDir = path.dirname(CONFIG.statusFile);
    if (!fs.existsSync(statusDir)) {
      fs.mkdirSync(statusDir, { recursive: true });
    }
    
    fs.writeFileSync(CONFIG.statusFile, JSON.stringify(monitoringStatus, null, 2), 'utf8');
    return true;
  } catch (err) {
    log(`Fehler beim Speichern des Monitoring-Status: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Generiert einen Alert und sendet Benachrichtigungen
 */
async function generateAlert(type, message, details) {
  const alert = {
    timestamp: new Date().toISOString(),
    type,
    message,
    details
  };
  
  monitoringStatus.alerts.push(alert);
  log(`🚨 ALERT: ${message}`, 'error');
  
  // Benachrichtigungen senden
  try {
    // E-Mail-Benachrichtigung
    if (CONFIG.emailAlerts.enabled && CONFIG.emailAlerts.recipient) {
      await sendEmailAlert(alert);
    }
    
    // Webhook-Benachrichtigungen (Slack, Discord)
    if (CONFIG.webhookUrls.slack) {
      await sendWebhookAlert('slack', alert);
    }
    
    if (CONFIG.webhookUrls.discord) {
      await sendWebhookAlert('discord', alert);
    }
    
    // Status speichern
    saveMonitoringStatus();
    
  } catch (err) {
    log(`Fehler beim Senden der Benachrichtigung: ${err.message}`, 'error');
  }
}

/**
 * Sendet eine E-Mail-Benachrichtigung
 */
async function sendEmailAlert(alert) {
  try {
    // Nutze die vorhandene E-Mail-Alert-Funktion
    const emailScript = path.join(__dirname, 'test-email-alert.js');
    
    if (!fs.existsSync(emailScript)) {
      log(`E-Mail-Alert-Skript nicht gefunden: ${emailScript}`, 'error');
      return false;
    }
    
    const args = [
      emailScript,
      '--recipient', CONFIG.emailAlerts.recipient,
      '--subject', `BurniToken Alert: ${alert.type}`,
      '--message', `${alert.message}\n\n${JSON.stringify(alert.details, null, 2)}`
    ];
    
    execSync(`node ${args.join(' ')}`, { encoding: 'utf8' });
    log(`E-Mail-Alert erfolgreich gesendet an ${CONFIG.emailAlerts.recipient}`, 'success');
    return true;
  } catch (err) {
    log(`Fehler beim Senden des E-Mail-Alerts: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Sendet einen Webhook-Alert (Slack oder Discord)
 */
async function sendWebhookAlert(platform, alert) {
  try {
    const webhookUrl = CONFIG.webhookUrls[platform];
    
    if (!webhookUrl) {
      log(`Webhook-URL für ${platform} nicht konfiguriert`, 'warn');
      return false;
    }
    
    const fetch = (await import('node-fetch')).default;
    
    let payload;
    
    if (platform === 'slack') {
      // Slack-Format
      payload = {
        text: `*BurniToken Alert: ${alert.type}*`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 BurniToken Alert: ${alert.type}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: alert.message
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `\`\`\`${JSON.stringify(alert.details, null, 2)}\`\`\``
            }
          }
        ]
      };
    } else if (platform === 'discord') {
      // Discord-Format
      payload = {
        content: `**🚨 BurniToken Alert: ${alert.type}**`,
        embeds: [
          {
            title: alert.message,
            description: `\`\`\`json\n${JSON.stringify(alert.details, null, 2)}\n\`\`\``,
            color: 16711680, // Rot
            timestamp: new Date().toISOString()
          }
        ]
      };
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      log(`Webhook-Alert erfolgreich gesendet an ${platform}`, 'success');
      return true;
    } else {
      log(`Fehler beim Senden des Webhook-Alerts an ${platform}: ${response.statusText}`, 'error');
      return false;
    }
  } catch (err) {
    log(`Fehler beim Senden des Webhook-Alerts an ${platform}: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Überprüft den Website-Gesundheitsstatus
 */
async function checkWebsiteHealth() {
  try {
    log('Führe Website Health Check durch...', 'info');
    
    await websiteHealthCheck.runHealthCheck();
    const healthStatus = websiteHealthCheck.getHealthStatus();
    
    // Update Monitoring-Status
    monitoringStatus.services.website = {
      status: healthStatus.summary.overallStatus,
      lastCheck: new Date().toISOString(),
      checkCount: monitoringStatus.services.website.checkCount + 1,
      errorCount: healthStatus.summary.overallStatus === 'healthy' 
        ? 0 
        : monitoringStatus.services.website.errorCount + 1,
      details: {
        availableUrls: healthStatus.summary.availableUrls,
        totalUrls: healthStatus.summary.totalUrls,
        sslValid: healthStatus.ssl.valid
      }
    };
    
    // Prüfen, ob ein Alert ausgelöst werden muss
    if (healthStatus.summary.overallStatus === 'down') {
      if (monitoringStatus.services.website.errorCount >= CONFIG.alertThreshold.downtime) {
        await generateAlert('website_down', 'Die BurniToken-Website ist nicht erreichbar', {
          status: healthStatus.summary.overallStatus,
          availableUrls: healthStatus.summary.availableUrls,
          totalUrls: healthStatus.summary.totalUrls,
          urls: healthStatus.urls
        });
      }
    }
    
    return healthStatus.summary.overallStatus;
  } catch (err) {
    log(`Fehler bei der Überprüfung des Website-Gesundheitsstatus: ${err.message}`, 'error');
    
    monitoringStatus.services.website.errorCount++;
    monitoringStatus.services.website.lastCheck = new Date().toISOString();
    
    return 'error';
  }
}

/**
 * Überprüft den Deployment-Status
 */
async function checkDeploymentStatus() {
  try {
    log('Führe Deployment Check durch...', 'info');
    
    const status = await deploymentChecker.checkDeployment();
    
    // Update Monitoring-Status
    monitoringStatus.services.deployment = {
      status: status,
      lastCheck: new Date().toISOString(),
      checkCount: monitoringStatus.services.deployment.checkCount + 1,
      errorCount: status === 'deployed' 
        ? 0 
        : monitoringStatus.services.deployment.errorCount + 1
    };
    
    // Prüfen, ob ein Alert ausgelöst werden muss
    if (status === 'failed' || status === 'error') {
      await generateAlert('deployment_issues', 'Probleme mit dem BurniToken-Website-Deployment', {
        status,
        timestamp: new Date().toISOString()
      });
    }
    
    return status;
  } catch (err) {
    log(`Fehler bei der Überprüfung des Deployment-Status: ${err.message}`, 'error');
    
    monitoringStatus.services.deployment.errorCount++;
    monitoringStatus.services.deployment.lastCheck = new Date().toISOString();
    
    return 'error';
  }
}

/**
 * Überprüft die Website-Performance
 */
async function checkWebsitePerformance() {
  try {
    log('Überprüfe Website-Performance...', 'info');
    
    // Hier könnten wir ein Lighthouse-Skript ausführen, falls verfügbar
    // Alternativ nutzen wir den Performance-Score aus dem Website-Health-Check
    const healthStatus = websiteHealthCheck.getHealthStatus();
    const performanceScore = healthStatus.summary.performanceScore;
    
    // Update Monitoring-Status
    monitoringStatus.services.performance = {
      status: performanceScore >= CONFIG.alertThreshold.performance ? 'good' : 'poor',
      lastCheck: new Date().toISOString(),
      checkCount: monitoringStatus.services.performance.checkCount + 1,
      score: performanceScore
    };
    
    // Prüfen, ob ein Alert ausgelöst werden muss
    if (performanceScore < CONFIG.alertThreshold.performance) {
      await generateAlert('performance_issues', 'Die BurniToken-Website zeigt Performance-Probleme', {
        performanceScore,
        ttfb: healthStatus.performance.ttfb,
        loadTime: healthStatus.performance.loadTime
      });
    }
    
    return monitoringStatus.services.performance.status;
  } catch (err) {
    log(`Fehler bei der Performance-Überprüfung: ${err.message}`, 'error');
    return 'error';
  }
}

/**
 * Führt einen vollständigen Monitoring-Check durch
 */
async function runFullMonitoringCheck() {
  try {
    log('🔍 Starte vollständigen Monitoring-Check...', 'info');
    
    monitoringStatus.lastCheck = new Date().toISOString();
    monitoringStatus.checksPerformed++;
    
    // Website-Gesundheitsstatus überprüfen
    const websiteStatus = await checkWebsiteHealth();
    
    // Deployment-Status überprüfen
    const deploymentStatus = await checkDeploymentStatus();
    
    // Performance überprüfen
    const performanceStatus = await checkWebsitePerformance();
    
    // Aktuellen Gesamtstatus bestimmen
    let currentStatus;
    
    if (websiteStatus === 'healthy' && deploymentStatus === 'deployed' && performanceStatus === 'good') {
      currentStatus = 'optimal';
    } else if (websiteStatus === 'down' || deploymentStatus === 'failed') {
      currentStatus = 'critical';
    } else {
      currentStatus = 'degraded';
    }
    
    monitoringStatus.currentStatus = currentStatus;
    
    // Aktuellen Status zur Historie hinzufügen
    monitoringStatus.history.push({
      timestamp: new Date().toISOString(),
      status: currentStatus,
      websiteStatus,
      deploymentStatus,
      performanceStatus
    });
    
    // Begrenze die Historieneinträge auf die letzten 100
    if (monitoringStatus.history.length > 100) {
      monitoringStatus.history = monitoringStatus.history.slice(-100);
    }
    
    // Status speichern
    saveMonitoringStatus();
    
    log(`✅ Monitoring-Check abgeschlossen: Status ist ${currentStatus.toUpperCase()}`, 
      currentStatus === 'optimal' ? 'success' : currentStatus === 'degraded' ? 'warn' : 'error');
    
    return currentStatus;
  } catch (err) {
    log(`Kritischer Fehler beim Monitoring-Check: ${err.message}`, 'error');
    monitoringStatus.currentStatus = 'error';
    return 'error';
  }
}

/**
 * Startet den kontinuierlichen Monitoring-Prozess
 */
function startContinuousMonitoring() {
  if (monitoringStatus.monitoringActive) {
    log('Monitoring läuft bereits, starte es nicht erneut.', 'warn');
    return;
  }
  
  log('🚀 Starte kontinuierliches Website-Monitoring...', 'info');
  
  monitoringStatus.monitoringActive = true;
  saveMonitoringStatus();
  
  // Sofortiger erster Check
  runFullMonitoringCheck().catch(err => {
    log(`Fehler beim initialen Monitoring-Check: ${err.message}`, 'error');
  });
  
  // Reguläre Interval-Checks
  const intervalMs = CONFIG.monitoringIntervalMinutes * 60 * 1000;
  const intervalId = setInterval(() => {
    runFullMonitoringCheck().catch(err => {
      log(`Fehler beim regulären Monitoring-Check: ${err.message}`, 'error');
    });
  }, intervalMs);
  
  // Kritische Checks mit höherer Frequenz
  const criticalIntervalMs = CONFIG.criticalCheckIntervalMinutes * 60 * 1000;
  const criticalIntervalId = setInterval(async () => {
    // Nur Website-Health in kürzeren Intervallen prüfen
    try {
      const websiteStatus = await checkWebsiteHealth();
      
      if (websiteStatus === 'down') {
        log('Kritischer Website-Status erkannt, führe vollständigen Check durch...', 'warn');
        await runFullMonitoringCheck();
      }
    } catch (err) {
      log(`Fehler beim kritischen Health-Check: ${err.message}`, 'error');
    }
  }, criticalIntervalMs);
  
  return { intervalId, criticalIntervalId };
}

/**
 * Stoppt das kontinuierliche Monitoring
 */
function stopMonitoring(intervals) {
  if (intervals && intervals.intervalId) {
    clearInterval(intervals.intervalId);
  }
  
  if (intervals && intervals.criticalIntervalId) {
    clearInterval(intervals.criticalIntervalId);
  }
  
  monitoringStatus.monitoringActive = false;
  saveMonitoringStatus();
  
  log('Kontinuierliches Monitoring wurde gestoppt', 'warn');
}

/**
 * Hauptfunktion
 */
async function main() {
  try {
    // Stelle sicher, dass das Verzeichnis für Logs und Status existiert
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Stelle sicher, dass das Reports-Verzeichnis existiert
    if (!fs.existsSync(CONFIG.reportPath)) {
      fs.mkdirSync(CONFIG.reportPath, { recursive: true });
    }
    
    // Lösche alte Log-Datei
    if (fs.existsSync(CONFIG.logFile)) {
      fs.truncateSync(CONFIG.logFile, 0);
    }
    
    log('🚀 Unified Website Monitoring Service wird gestartet...', 'info');
    
    // Parameter prüfen
    const args = process.argv.slice(2);
    const runOnce = args.includes('--once');
    const checkOnly = args.includes('--check');
    
    if (runOnce || checkOnly) {
      // Einmaliger Check
      const status = await runFullMonitoringCheck();
      
      // Ausgabe formatieren
      const statusEmoji = status === 'optimal' ? '✅' : status === 'degraded' ? '⚠️' : '🔴';
      console.log(`\n${statusEmoji} BurniToken Website Status: ${status.toUpperCase()}\n`);
      console.log('Details:');
      console.log(`- Website: ${monitoringStatus.services.website.status}`);
      console.log(`- Deployment: ${monitoringStatus.services.deployment.status}`);
      console.log(`- Performance: Score ${monitoringStatus.services.performance.score}/100\n`);
    } else {
      // Kontinuierliches Monitoring starten
      const intervals = startContinuousMonitoring();
      
      // Bei Ctrl+C sauber beenden
      process.on('SIGINT', () => {
        log('Monitoring-Dienst wird beendet...', 'info');
        stopMonitoring(intervals);
        process.exit(0);
      });
    }
  } catch (err) {
    log(`Kritischer Fehler im Monitoring Service: ${err.message}`, 'error');
    console.error(err);
  }
}

// Führe Hauptfunktion aus, wenn direkt aufgerufen
if (require.main === module) {
  main().catch(err => {
    console.error(`Kritischer Fehler: ${err.message}`);
    console.error(err);
  });
}

module.exports = {
  runFullMonitoringCheck,
  startContinuousMonitoring,
  stopMonitoring
};
