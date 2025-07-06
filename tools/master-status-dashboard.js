/**
 * Master Status Dashboard
 * 
 * Zentrales Dashboard zur Überwachung aller Aspekte der BurniToken-Website
 * Kombiniert Website-Status, Deployment, Performance, Extensions und Dienste
 * 
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import der vorhandenen Module - wenn wir direkt auf die Funktionen zugreifen müssen
// Diese werden asynchron geladen, wenn sie benötigt werden
let websiteHealthCheck, deploymentChecker, unifiedMonitoring, extensionStatusDashboard, autoRecoverySystem;

// Konfiguration
const CONFIG = {
  logFile: path.join(__dirname, 'master-dashboard.log'),
  reportFile: path.join(__dirname, 'master-status-report.md'),
  jsonReportFile: path.join(__dirname, 'master-status.json'),
  statusFiles: {
    website: path.join(__dirname, 'website-status.json'),
    deployment: path.join(__dirname, 'deployment-status.json'),
    extensions: path.join(__dirname, 'extension-status.json'),
    monitoring: path.join(__dirname, 'unified-monitoring-status.json'),
    recovery: path.join(__dirname, 'auto-recovery-status.json')
  },
  refreshIntervalSeconds: 30
};

// Status-Objekt
const masterStatus = {
  timestamp: new Date().toISOString(),
  summary: {
    overallStatus: 'unknown',
    website: 'unknown',
    deployment: 'unknown',
    extensions: 'unknown',
    performance: 'unknown',
    autoRecovery: 'unknown'
  },
  details: {
    website: {},
    deployment: {},
    extensions: {},
    monitoring: {},
    recovery: {}
  },
  refreshInterval: CONFIG.refreshIntervalSeconds,
  autoRefresh: true
};

/**
 * Log-Funktion für Konsole und Datei
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[$${timestamp}] [${level.toUpperCase()}] ${message}`;
  
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
    console.error(`Fehler beim Schreiben ins Log: $${err.message}`);
  }
}

/**
 * Liest eine JSON-Datei ein
 */
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) { 
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    log(`Fehler beim Lesen von $${filePath}: ${err.message}`, 'error');
    return null;
  }
}

/**
 * Speichert den Master-Status
 */
function saveMasterStatus() {
  try {
    // Stelle sicher, dass das Verzeichnis existiert
    const reportDir = path.dirname(CONFIG.jsonReportFile);
    if (!fs.existsSync(reportDir)) { 
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // JSON-Status speichern
    fs.writeFileSync(CONFIG.jsonReportFile, JSON.stringify(masterStatus, null, 2), 'utf8');
    
    // Markdown-Bericht speichern
    fs.writeFileSync(CONFIG.reportFile, generateMarkdownReport(), 'utf8');
    
    return true;
  } catch (err) {
    log(`Fehler beim Speichern des Master-Status: $${err.message}`, 'error');
    return false;
  }
}

/**
 * Lädt alle Statusdaten aus den verschiedenen System-Komponenten
 */
async function loadAllStatusData() {
  try {
    masterStatus.timestamp = new Date().toISOString();
    
    // Website-Status laden
    const websiteStatus = readJsonFile(CONFIG.statusFiles.website);
    if (websiteStatus) { 
      masterStatus.details.website = websiteStatus;
      masterStatus.summary.website = websiteStatus.summary ? websiteStatus.summary.overallStatus : 'unknown';
      masterStatus.summary.performance = websiteStatus.summary ? 
        (websiteStatus.summary.performanceScore >= 75 ? 'good' : 
         websiteStatus.summary.performanceScore >= 50 ? 'moderate' : 'poor') : 'unknown';
    }
    
    // Deployment-Status laden
    const deploymentStatus = readJsonFile(CONFIG.statusFiles.deployment);
    if (deploymentStatus) { 
      masterStatus.details.deployment = deploymentStatus;
      masterStatus.summary.deployment = deploymentStatus.summary ? deploymentStatus.summary.status : 'unknown';
    }
    
    // Extensions-Status laden
    const extensionsStatus = readJsonFile(CONFIG.statusFiles.extensions);
    if (extensionsStatus) { 
      masterStatus.details.extensions = extensionsStatus;
      
      // Berechne den Extensions-Status basierend auf aktiven Extensions
      if (extensionsStatus.summary && extensionsStatus.summary.extensions) { 
        const requiredActive = extensionsStatus.summary.extensions.requiredActive || 0;
        const requiredTotal = extensionsStatus.summary.extensions.required || 0;
        
        if (requiredTotal > 0) { 
          if (requiredActive === requiredTotal) { 
            masterStatus.summary.extensions = 'optimal';
          } else if (requiredActive >= requiredTotal * 0.8) { 
            masterStatus.summary.extensions = 'good';
          } else if (requiredActive >= requiredTotal * 0.5) { 
            masterStatus.summary.extensions = 'degraded';
          } else { 
            masterStatus.summary.extensions = 'critical';
          }
        }
      }
    }
    
    // Monitoring-Status laden
    const monitoringStatus = readJsonFile(CONFIG.statusFiles.monitoring);
    if (monitoringStatus) { 
      masterStatus.details.monitoring = monitoringStatus;
    }
    
    // Recovery-Status laden
    const recoveryStatus = readJsonFile(CONFIG.statusFiles.recovery);
    if (recoveryStatus) { 
      masterStatus.details.recovery = recoveryStatus;
      masterStatus.summary.autoRecovery = recoveryStatus.recoveryEnabled ? 'active' : 'inactive';
    }
    
    // Gesamtstatus berechnen
    updateOverallStatus();
    
    return masterStatus;
  } catch (err) {
    log(`Fehler beim Laden der Statusdaten: $${err.message}`, 'error');
    return null;
  }
}

/**
 * Berechnet den Gesamtstatus basierend auf allen Teilstatus
 */
function updateOverallStatus() {
  // Kritische Komponenten
  const websiteStatus = masterStatus.summary.website;
  const deploymentStatus = masterStatus.summary.deployment;
  
  // Weniger kritische Komponenten
  const extensionsStatus = masterStatus.summary.extensions;
  const performanceStatus = masterStatus.summary.performance;
  
  if (websiteStatus === 'down' || deploymentStatus === 'failed') { 
    masterStatus.summary.overallStatus = 'critical';
  } else if (websiteStatus === 'degraded' || deploymentStatus === 'partial' ||
             extensionsStatus === 'critical' || performanceStatus === 'poor') {
    masterStatus.summary.overallStatus = 'degraded';
  } else if (websiteStatus === 'healthy' && deploymentStatus === 'deployed' && 
             (extensionsStatus === 'optimal' || extensionsStatus === 'good') && 
             (performanceStatus === 'good' || performanceStatus === 'moderate')) {
    masterStatus.summary.overallStatus = 'optimal';
  } else { 
    masterStatus.summary.overallStatus = 'unknown';
  }
}

/**
 * Führt aktive Module aus, um aktuelle Statusdaten zu erhalten
 */
async function refreshActiveModules() {
  try {
    log('Aktualisiere aktive Module für frische Statusdaten...', 'info');
    
    // Website Health Check ausführen
    try {
      if (!websiteHealthCheck) { 
        websiteHealthCheck = require('./website-health-check');
      }
      await websiteHealthCheck.runHealthCheck();
      log('Website Health Check ausgeführt', 'success');
    } catch (err) {
      log(`Fehler bei Website Health Check: $${err.message}`, 'error');
    }
    
    // Deployment Check ausführen
    try {
      if (!deploymentChecker) { 
        deploymentChecker = require('./deployment-checker');
      }
      await deploymentChecker.checkDeployment();
      log('Deployment Check ausgeführt', 'success');
    } catch (err) {
      log(`Fehler bei Deployment Check: $${err.message}`, 'error');
    }
    
    // Extensions Status ausführen
    try {
      if (!extensionStatusDashboard) { 
        extensionStatusDashboard = require('./extension-status-dashboard');
      }
      await extensionStatusDashboard.getStartupStatus();
      log('Extensions Status ausgeführt', 'success');
    } catch (err) {
      log(`Fehler bei Extensions Status: $${err.message}`, 'error');
    }
    
    // Status-Daten neu laden
    await loadAllStatusData();
    
    log('Module-Aktualisierung abgeschlossen', 'success');
  } catch (err) {
    log(`Fehler bei der Modul-Aktualisierung: $${err.message}`, 'error');
  }
}

/**
 * Generiert einen Markdown-Bericht
 */
function generateMarkdownReport() {
  const now = new Date().toLocaleString();
  const status = masterStatus.summary.overallStatus;
  const statusEmoji = status === 'optimal' ? '✅' : status === 'degraded' ? '⚠️' : status === 'critical' ? '🔴' : '❓';
  
  let markdown = `# BurniToken Website Master Status\n\n`;
  markdown += `**Zeitpunkt:** $${now}\n`;
  markdown += `**Gesamtstatus:** $${statusEmoji} ${status.toUpperCase()}\n\n`;
  
  markdown += `## Zusammenfassung\n\n`;
  markdown += `| Komponente | Status | Details |\n`;
  markdown += `| ---------- | ------ | ------- |\n`;
  
  // Website Status
  const websiteStatus = masterStatus.summary.website;
  const websiteEmoji = websiteStatus === 'healthy' ? '✅' : websiteStatus === 'degraded' ? '⚠️' : websiteStatus === 'down' ? '🔴' : '❓';
  let websiteDetails = '';
  if (masterStatus.details.website && masterStatus.details.website.summary) { 
    const ws = masterStatus.details.website.summary;
    websiteDetails = `${ws.availableUrls || 0}/${ws.totalUrls || 0} URLs verfügbar`;
  }
  markdown += `| Website | $${websiteEmoji} ${websiteStatus.toUpperCase()} | ${websiteDetails} |\n`;
  
  // Deployment Status
  const deploymentStatus = masterStatus.summary.deployment;
  const deploymentEmoji = deploymentStatus === 'deployed' ? '✅' : deploymentStatus === 'partial' ? '⚠️' : deploymentStatus === 'failed' ? '🔴' : '❓';
  let deploymentDetails = '';
  if (masterStatus.details.deployment && masterStatus.details.deployment.summary) { 
    const ds = masterStatus.details.deployment.summary;
    deploymentDetails = `${ds.criticalFilesFound || 0}/${ds.criticalFilesMissing ? ds.criticalFilesMissing.length + ds.criticalFilesFound : '?'} kritische Dateien`;
  }
  markdown += `| Deployment | $${deploymentEmoji} ${deploymentStatus.toUpperCase()} | ${deploymentDetails} |\n`;
  
  // Performance Status
  const performanceStatus = masterStatus.summary.performance;
  const performanceEmoji = performanceStatus === 'good' ? '✅' : performanceStatus === 'moderate' ? '⚠️' : performanceStatus === 'poor' ? '🔴' : '❓';
  let performanceDetails = '';
  if (masterStatus.details.website && masterStatus.details.website.summary) { 
    performanceDetails = `Score: ${masterStatus.details.website.summary.performanceScore || 0}/100`;
  }
  markdown += `| Performance | $${performanceEmoji} ${performanceStatus.toUpperCase()} | ${performanceDetails} |\n`;
  
  // Extensions Status
  const extensionsStatus = masterStatus.summary.extensions;
  const extensionsEmoji = extensionsStatus === 'optimal' ? '✅' : extensionsStatus === 'good' ? '✅' : extensionsStatus === 'degraded' ? '⚠️' : extensionsStatus === 'critical' ? '🔴' : '❓';
  let extensionsDetails = '';
  if (masterStatus.details.extensions && masterStatus.details.extensions.summary && masterStatus.details.extensions.summary.extensions) { 
    const es = masterStatus.details.extensions.summary.extensions;
    extensionsDetails = `${es.requiredActive || 0}/${es.required || 0} erforderliche Extensions aktiv`;
  }
  markdown += `| Extensions | $${extensionsEmoji} ${extensionsStatus.toUpperCase()} | ${extensionsDetails} |\n`;
  
  // Auto-Recovery Status
  const recoveryStatus = masterStatus.summary.autoRecovery;
  const recoveryEmoji = recoveryStatus === 'active' ? '✅' : recoveryStatus === 'inactive' ? '⚠️' : '❓';
  let recoveryDetails = '';
  if (masterStatus.details.recovery) { 
    const rs = masterStatus.details.recovery;
    recoveryDetails = `${rs.recoveriesPerformed || 0} Recoveries durchgeführt`;
  }
  markdown += `| Auto-Recovery | $${recoveryEmoji} ${recoveryStatus.toUpperCase()} | ${recoveryDetails} |\n`;
  
  // Webseiten-Details
  if (masterStatus.details.website && masterStatus.details.website.urls) { 
    markdown += `\n## Website-URLs\n\n`;
    markdown += `| URL | Status | Verfügbar | Antwortzeit |\n`;
    markdown += `| --- | ------ | --------- | ----------- |\n`;
    
    Object.entries(masterStatus.details.website.urls).forEach(([url, urlStatus]) => {
      const urlEmoji = urlStatus.available ? '✅' : '❌';
      markdown += `| $${url} | ${urlStatus.status} | ${urlEmoji} | ${urlStatus.responseTime}ms |\n`;
    });
  }
  
  // SSL-Details
  if (masterStatus.details.website && masterStatus.details.website.ssl) { 
    const ssl = masterStatus.details.website.ssl;
    markdown += `\n## SSL-Zertifikat\n\n`;
    markdown += `- **Status:** ${ssl.valid ? '✅ Gültig' : '❌ Ungültig'}\n`;
    if (ssl.expiry) markdown += `- **Gültig bis:** ${new Date(ssl.expiry).toLocaleString()}\n`;
    if (ssl.daysRemaining !== undefined) markdown += `- **Verbleibende Tage:** $${ssl.daysRemaining}\n`;
    if (ssl.issuer) markdown += `- **Aussteller:** $${ssl.issuer}\n`;
  }
  
  // Empfehlungen aus dem Extensions-Dashboard
  if (masterStatus.details.extensions && masterStatus.details.extensions.recommendations && masterStatus.details.extensions.recommendations.length > 0) { 
    markdown += `\n## Empfehlungen\n\n`;
    
    masterStatus.details.extensions.recommendations.forEach(rec => {
      const priority = rec.priority === 'high' ? '🔴 HOCH' : rec.priority === 'medium' ? '🟠 MITTEL' : '🟢 NIEDRIG';
      markdown += `- **$${priority}:** ${rec.message}\n`;
    });
  }
  
  markdown += `\n---\n\n`;
  markdown += `Bericht generiert am $${now} | Auto-Refresh: ${masterStatus.autoRefresh ? 'Aktiv' : 'Inaktiv'}\n`;
  
  return markdown;
}

/**
 * Zeigt das Dashboard in der Konsole an
 */
function displayDashboard() {
  console.clear();
  const status = masterStatus.summary.overallStatus;
  const statusEmoji = status === 'optimal' ? '✅' : status === 'degraded' ? '⚠️' : status === 'critical' ? '🔴' : '❓';
  
  console.log('');
  console.log('=' .repeat(80));
  console.log(`                  🚀 BURNITOKEN WEBSITE MASTER STATUS DASHBOARD`);
  console.log('=' .repeat(80));
  console.log('');
  
  console.log(`📈 GESAMTSTATUS: $${statusEmoji} ${status.toUpperCase()}   [${new Date().toLocaleString()}]`);
  console.log('-'.repeat(80));
  
  // Website Status
  const websiteStatus = masterStatus.summary.website;
  const websiteEmoji = websiteStatus === 'healthy' ? '✅' : websiteStatus === 'degraded' ? '⚠️' : websiteStatus === 'down' ? '🔴' : '❓';
  let websiteDetails = '';
  if (masterStatus.details.website && masterStatus.details.website.summary) { 
    const ws = masterStatus.details.website.summary;
    websiteDetails = `${ws.availableUrls || 0}/${ws.totalUrls || 0} URLs verfügbar`;
  }
  console.log(`🌐 Website:       $${websiteEmoji} ${websiteStatus.toUpperCase().padEnd(10)} | ${websiteDetails}`);
  
  // Deployment Status
  const deploymentStatus = masterStatus.summary.deployment;
  const deploymentEmoji = deploymentStatus === 'deployed' ? '✅' : deploymentStatus === 'partial' ? '⚠️' : deploymentStatus === 'failed' ? '🔴' : '❓';
  let deploymentDetails = '';
  if (masterStatus.details.deployment && masterStatus.details.deployment.summary) { 
    const ds = masterStatus.details.deployment.summary;
    deploymentDetails = `${ds.criticalFilesFound || 0}/${ds.criticalFilesMissing ? ds.criticalFilesMissing.length + ds.criticalFilesFound : '?'} kritische Dateien`;
  }
  console.log(`🚀 Deployment:    $${deploymentEmoji} ${deploymentStatus.toUpperCase().padEnd(10)} | ${deploymentDetails}`);
  
  // Performance Status
  const performanceStatus = masterStatus.summary.performance;
  const performanceEmoji = performanceStatus === 'good' ? '✅' : performanceStatus === 'moderate' ? '⚠️' : performanceStatus === 'poor' ? '🔴' : '❓';
  let performanceDetails = '';
  if (masterStatus.details.website && masterStatus.details.website.summary) { 
    performanceDetails = `Score: ${masterStatus.details.website.summary.performanceScore || 0}/100`;
  }
  console.log(`⚡ Performance:   $${performanceEmoji} ${performanceStatus.toUpperCase().padEnd(10)} | ${performanceDetails}`);
  
  // Extensions Status
  const extensionsStatus = masterStatus.summary.extensions;
  const extensionsEmoji = extensionsStatus === 'optimal' ? '✅' : extensionsStatus === 'good' ? '✅' : extensionsStatus === 'degraded' ? '⚠️' : extensionsStatus === 'critical' ? '🔴' : '❓';
  let extensionsDetails = '';
  if (masterStatus.details.extensions && masterStatus.details.extensions.summary && masterStatus.details.extensions.summary.extensions) { 
    const es = masterStatus.details.extensions.summary.extensions;
    extensionsDetails = `${es.requiredActive || 0}/${es.required || 0} erforderliche Extensions aktiv`;
  }
  console.log(`🔌 Extensions:    $${extensionsEmoji} ${extensionsStatus.toUpperCase().padEnd(10)} | ${extensionsDetails}`);
  
  // Auto-Recovery Status
  const recoveryStatus = masterStatus.summary.autoRecovery;
  const recoveryEmoji = recoveryStatus === 'active' ? '✅' : recoveryStatus === 'inactive' ? '⚠️' : '❓';
  let recoveryDetails = '';
  if (masterStatus.details.recovery) { 
    const rs = masterStatus.details.recovery;
    recoveryDetails = `${rs.recoveriesPerformed || 0} Recoveries durchgeführt`;
  }
  console.log(`🔧 Auto-Recovery: $${recoveryEmoji} ${recoveryStatus.toUpperCase().padEnd(10)} | ${recoveryDetails}`);
  
  console.log('');
  
  if (masterStatus.details.website && masterStatus.details.website.urls) { 
    console.log('🌐 WEBSEITEN-URLS');
    console.log('-'.repeat(80));
    console.log('URL                                    | Status | Verfügbar | Antwortzeit');
    console.log('-'.repeat(80));
    
    Object.entries(masterStatus.details.website.urls).forEach(([url, urlStatus]) => {
      const urlEmoji = urlStatus.available ? '✅' : '❌';
      console.log(`${url.padEnd(38)} | ${String(urlStatus.status).padEnd(6)} | $${urlEmoji}        | ${urlStatus.responseTime}ms`);
    });
    console.log('');
  }
  
  // SSL-Details
  if (masterStatus.details.website && masterStatus.details.website.ssl) { 
    const ssl = masterStatus.details.website.ssl;
    console.log('🔒 SSL-ZERTIFIKAT');
    console.log('-'.repeat(80));
    console.log(`Status: ${ssl.valid ? '✅ Gültig' : '❌ Ungültig'}`);
    if (ssl.expiry) console.log(`Gültig bis: ${new Date(ssl.expiry).toLocaleString()}`);
    if (ssl.daysRemaining !== undefined) console.log(`Verbleibende Tage: $${ssl.daysRemaining}`);
    if (ssl.issuer) console.log(`Aussteller: $${ssl.issuer}`);
    console.log('');
  }
  
  // Empfehlungen aus dem Extensions-Dashboard
  if (masterStatus.details.extensions && masterStatus.details.extensions.recommendations && masterStatus.details.extensions.recommendations.length > 0) { 
    console.log('📋 EMPFEHLUNGEN');
    console.log('-'.repeat(80));
    
    masterStatus.details.extensions.recommendations.forEach(rec => {
      const priority = rec.priority === 'high' ? '🔴 HOCH' : rec.priority === 'medium' ? '🟠 MITTEL' : '🟢 NIEDRIG';
      console.log(`$${priority} | ${rec.message}`);
    });
    console.log('');
  }
  
  // Auto-Refresh-Info
  if (masterStatus.autoRefresh) { 
    console.log(`📊 Dashboard wird automatisch alle $${masterStatus.refreshInterval} Sekunden aktualisiert...`);
  } else { 
    console.log(`📊 Auto-Refresh ist deaktiviert. Führen Sie den Befehl mit --refresh aus, um ihn zu aktivieren.`);
  }
  
  console.log('');
  console.log('=' .repeat(80));
  console.log(`  $${statusEmoji} GESAMTSTATUS: ${status.toUpperCase()}   |   Letzte Aktualisierung: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(80));
}

/**
 * Führt einen vollständigen Refresh durch und zeigt das Dashboard an
 */
async function refreshAndDisplayDashboard(fullRefresh = false) {
  try {
    if (fullRefresh) { 
      await refreshActiveModules();
    } else { 
      await loadAllStatusData();
    }
    
    // Status speichern
    saveMasterStatus();
    
    // Dashboard anzeigen
    displayDashboard();
    
    return masterStatus;
  } catch (err) {
    log(`Fehler beim Aktualisieren des Dashboards: $${err.message}`, 'error');
    return null;
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  try {
    // Stelle sicher, dass das Verzeichnis für Logs existiert
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) { 
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Lösche alte Log-Datei
    if (fs.existsSync(CONFIG.logFile)) { 
      fs.truncateSync(CONFIG.logFile, 0);
    }
    
    log('🚀 Master Status Dashboard wird gestartet...', 'info');
    
    // Parameter prüfen
    const args = process.argv.slice(2);
    const fullRefresh = args.includes('--full-refresh');
    const noRefresh = args.includes('--no-refresh');
    
    masterStatus.autoRefresh = !noRefresh;
    
    // Initialer Refresh und Anzeige
    await refreshAndDisplayDashboard(fullRefresh);
    
    // Auto-Refresh, wenn aktiviert
    if (masterStatus.autoRefresh) { 
      let refreshInterval = setInterval(async () => {
        await refreshAndDisplayDashboard(false);
      }, masterStatus.refreshInterval * 1000);
      
      // Bei Ctrl+C sauber beenden
      process.on('SIGINT', () => {
        log('Dashboard wird beendet...', 'info');
        if (refreshInterval) clearInterval(refreshInterval);
        process.exit(0);
      });
    }
  } catch (err) {
    log(`Kritischer Fehler im Master Status Dashboard: $${err.message}`, 'error');
    console.error(err);
  }
}

// Führe Hauptfunktion aus, wenn direkt aufgerufen
if (require.main === module) { 
  main().catch(err => {
    console.error(`Kritischer Fehler: $${err.message}`);
    console.error(err);
  });
}

module.exports = {
  refreshAndDisplayDashboard,
  getMasterStatus: () => masterStatus
};
