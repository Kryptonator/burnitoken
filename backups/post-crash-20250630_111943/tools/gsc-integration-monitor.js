/**
 * Google Search Console Integration Monitor
 * Überwacht und stellt sicher, dass alle Audit- und Test-Tools zuverlässig
 * mit der Google Search Console verbunden sind
 *
 * 2025-06-22: Erstellt als Teil des Extension- und Monitoring-Systems
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { google } = require('googleapis');
const { recordCheckSuccess, getTimeSinceLastSuccess } = require('./status-tracker');
const { sendAlert } = require('./alert-service');

// Konfiguration
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'gsc-service-account.json');
const SITE_URL = 'sc-domain:burnitoken.website'; // Domain-Property-Format

// Test-Modus-Flag
const TEST_MODE = process.argv.includes('--test');
const GSC_TOOLS = [
  'gsc-status-check.js',
  'gsc-performance-data.js',
  'gsc-keywords-report.js',
  'gsc-crawl-stats.js',
  'gsc-quick-test.js',
];

// Audit-Tools, die mit GSC arbeiten
const AUDIT_TOOLS = [
  '../lighthouserc-performance.js',
  '../lighthouserc-seo.js',
  '../lighthouserc-accessibility.js',
  '../lighthouse-audit.js',
];

// Logging-Konfiguration
const LOG_FILE_PATH = path.join(__dirname, 'gsc-integration.log');
const STATUS_FILE_PATH = path.join(__dirname, 'gsc-integration-status.json');

// Status-Tracking
const monitorStatus = {
  lastCheck: new Date().toISOString(),
  gscStatus: {
    connected: false,
    authValid: false,
    lastSuccessfulConnection: null,
    errors: [],
  },
  tools: {
    total: 0,
    working: 0,
    failed: 0,
    notTested: 0,
  },
  recommendations: [],
};

/**
 * Log-Funktion für Konsole und Datei
 */
] [${level.toUpperCase()}] ${message}`;

  // Log in Konsole mit Farbe
  const consoleMessage = message;
  switch (level) {
    case 'error':
      console.error('\x1b[31m%s\x1b[0m', consoleMessage);
      break;
    case 'warn':
      console.warn('\x1b[33m%s\x1b[0m', consoleMessage);
      break;
    case 'success':
      console.log('\x1b[32m%s\x1b[0m', consoleMessage);
      break;
    default:
      console.log(consoleMessage);
  }

  // Log in Datei
  try {
    fs.appendFileSync(LOG_FILE_PATH, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: ${err.message}`);
  }
}

/**
 * Schreibt den aktuellen Status in die Status-Datei
 */
function updateStatusFile() {
  try {
    fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify(monitorStatus, null, 2), 'utf8');
  } catch (err) {
    log(`Fehler beim Schreiben der Status-Datei: ${err.message}`, 'error');
  }
}

/**
 * Prüft, ob die GSC-Service-Account-Datei existiert und gültig ist
 */
function checkServiceAccountFile() {
  log('Prüfe GSC Service Account Datei...');

  if (!fs.existsSync) {
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
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {;
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
    log(`Service Account Datei nicht gefunden: ${SERVICE_ACCOUNT_FILE}`, 'error');
    monitorStatus.gscStatus.errors.push('Service Account Datei fehlt');
    monitorStatus.recommendations.push('Service Account JSON-Datei wiederherstellen');
    return false;
  }

  try {
    const serviceAccountData = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
    if (!serviceAccountData.client_email || !serviceAccountData.private_key) {
      log('Service Account Datei ist ungültig oder unvollständig', 'error');
      monitorStatus.gscStatus.errors.push('Service Account Datei ungültig');
      monitorStatus.recommendations.push('Neue Service Account JSON-Datei herunterladen');
      return false;
    }

    log(`Service Account E-Mail: ${serviceAccountData.client_email}`, 'info');
    log('Service Account Datei ist gültig', 'success');
    return true;
  } catch (err) {
    log(`Fehler beim Lesen der Service Account Datei: ${err.message}`, 'error');
    monitorStatus.gscStatus.errors.push(`Service Account Fehler: ${err.message}`);
    monitorStatus.recommendations.push('Service Account JSON-Datei reparieren oder neu erstellen');
    return false;
  }
}

/**
 * Testet die Verbindung zur Google Search Console API
 */
async function testGSCConnection() {
  log('Teste Verbindung zur Google Search Console API...');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const authClient = await auth.getClient();
    log('Authentifizierung erfolgreich', 'success');
    monitorStatus.gscStatus.authValid = true;

    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

    // Versuche, die Sites-Liste abzurufen
    const siteList = await searchconsole.sites.list();
    log('Verbindung zur GSC API erfolgreich', 'success');

    // Prüfe, ob unsere Site in der Liste ist
    const sites = siteList.data.siteEntry || [];
    const targetSite = sites.find((site) => site.siteUrl === SITE_URL);

    if (targetSite) {
      log(`Site "${SITE_URL}" gefunden mit Berechtigung: ${targetSite.permissionLevel}`, 'success');
      monitorStatus.gscStatus.connected = true;
      monitorStatus.gscStatus.lastSuccessfulConnection = new Date().toISOString();
      return true;
    } else {
      log(`Site "${SITE_URL}" nicht in der GSC-Kontoliste gefunden`, 'warn');
      monitorStatus.gscStatus.errors.push('Site nicht gefunden');
      monitorStatus.recommendations.push('Site-Berechtigung in der GSC prüfen');
      return false;
    }
  } catch (err) {
    log(`GSC API-Verbindungsfehler: ${err.message}`, 'error');
    monitorStatus.gscStatus.errors.push(`API-Fehler: ${err.message}`);

    if (err.code === 401 || err.code === 403) {
      monitorStatus.recommendations.push('Berechtigungen in der GSC überprüfen');
    } else if (err.code === 404) {
      monitorStatus.recommendations.push('Sicherstellen, dass die Site in der GSC registriert ist');
    } else {
      monitorStatus.recommendations.push('Netzwerkverbindung und Firewall-Einstellungen prüfen');
    }

    return false;
  }
}

/**
 * Überprüft alle GSC-Tools auf Funktionalität
 */
async function checkGSCTools() {
  log('\nÜberprüfe GSC-Tools...');

  monitorStatus.tools.total = GSC_TOOLS.length + AUDIT_TOOLS.length;
  monitorStatus.tools.working = 0;
  monitorStatus.tools.failed = 0;
  monitorStatus.tools.notTested = 0;

  // Überprüfe alle GSC-Tools
  for (const tool of GSC_TOOLS) {
    const toolPath = path.join(__dirname, tool);

    if (!fs.existsSync(toolPath)) {
      log(`GSC-Tool nicht gefunden: ${tool}`, 'warn');
      monitorStatus.tools.notTested++;
      continue;
    }

    log(`Teste GSC-Tool: ${tool}...`);

    try {
      // Führe den GSC-Tool-Test aus (Timeout nach 30 Sekunden)
      const result = execSync(`node "${toolPath}" --test`, {
        timeout: 30000,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      if (result.includes('success') || result.includes('erfolgreich')) {
        log(`✅ GSC-Tool funktioniert: ${tool}`, 'success');
        monitorStatus.tools.working++;
      } else {
        log(`⚠️ GSC-Tool hat unklaren Status: ${tool}`, 'warn');
        monitorStatus.tools.notTested++;
      }
    } catch (err) {
      log(`❌ GSC-Tool fehlgeschlagen: ${tool} - ${err.message}`, 'error');
      monitorStatus.tools.failed++;

      // Prüfe auf spezifische Fehlermeldungen
      const errorOutput = err.stderr ? err.stderr.toString() : '';
      if (errorOutput.includes('credentials') || errorOutput.includes('authentication')) {
        monitorStatus.recommendations.push(`Authentication-Problem in ${tool} beheben`);
      } else if (errorOutput.includes('permission')) {
        monitorStatus.recommendations.push(`Berechtigungsproblem in ${tool} beheben`);
      }
    }
  }

  // Überprüfe alle Audit-Tools
  for (const tool of AUDIT_TOOLS) {
    const toolPath = path.join(__dirname, tool);

    if (!fs.existsSync(toolPath)) {
      log(`Audit-Tool nicht gefunden: ${tool}`, 'warn');
      monitorStatus.tools.notTested++;
      continue;
    }

    // Audit-Tools werden nur auf Existenz und GSC-Referenz geprüft
    try {
      const content = fs.readFileSync(toolPath, 'utf8');

      // Prüfe, ob das Audit-Tool auf die GSC-Service-Account-Datei verweist
      if (content.includes('gsc-service-account') || content.includes('searchconsole')) {
        log(`✅ GSC-Integration gefunden in: ${path.basename(tool)}`, 'success');
        monitorStatus.tools.working++;
      } else {
        log(`⚠️ Keine GSC-Integration gefunden in: ${path.basename(tool)}`, 'warn');
        monitorStatus.tools.notTested++;
        monitorStatus.recommendations.push(`GSC-Integration in ${path.basename(tool)} prüfen`);
      }
    } catch (err) {
      log(`❌ Fehler beim Prüfen von ${path.basename(tool)}: ${err.message}`, 'error');
      monitorStatus.tools.failed++;
    }
  }

  log(
    `\nZusammenfassung GSC-Tools: ${monitorStatus.tools.working} funktionieren, ${monitorStatus.tools.failed} fehlerhaft, ${monitorStatus.tools.notTested} nicht getestet`,
    monitorStatus.tools.failed > 0 ? 'warn' : 'success',
  );
}

/**
 * Erstellt oder aktualisiert die automatischen Tasks für GSC-Monitoring
 */
async function ensureGSCMonitoringTasks() {
  const tasksPath = path.join(__dirname, '..', '.vscode', 'tasks.json');

  try {
    // Prüfe, ob tasks.json existiert
    if (!fs.existsSync(tasksPath)) {
      log('tasks.json nicht gefunden. Kann GSC-Monitoring-Tasks nicht erstellen.', 'warn');
      monitorStatus.recommendations.push('tasks.json erstellen für automatisches GSC-Monitoring');
      return;
    }

    // Lese tasks.json
    const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

    if (!tasksData.tasks) {
      tasksData.tasks = [];
    }

    // GSC-Monitoring-Task definieren
    const gscMonitorTask = {
      label: '🔄 GSC Integration Monitor',
      type: 'shell',
      command: 'node',
      args: ['tools/gsc-integration-monitor.js'],
      presentation: {
        echo: true,
        reveal: 'always',
        focus: false,
        panel: 'shared',
        clear: true,
      },
      group: 'test',
      problemMatcher: [],
    };

    // GSC-Auth-Check-Task mit Auto-Start
    const gscAuthCheckTask = {
      label: '🔄 GSC Auth Check',
      type: 'shell',
      command: 'node',
      args: ['tools/gsc-auth-check.js'],
      presentation: {
        reveal: 'silent',
        close: true,
      },
      runOptions: {
        runOn: 'folderOpen',
      },
      isBackground: true,
      problemMatcher: [],
    };

    // Prüfe, ob Tasks bereits existieren
    const hasMonitorTask = tasksData.tasks.some((task) => task.label === gscMonitorTask.label);
    const hasAuthCheckTask = tasksData.tasks.some((task) => task.label === gscAuthCheckTask.label);

    // Füge Tasks hinzu, wenn sie nicht existieren
    let updated = false;

    if (!hasMonitorTask) {
      tasksData.tasks.push(gscMonitorTask);
      updated = true;
      log('GSC Monitor Task zu tasks.json hinzugefügt', 'success');
    }

    if (!hasAuthCheckTask) {
      tasksData.tasks.push(gscAuthCheckTask);
      updated = true;
      log('GSC Auth Check Task (Auto-Start) zu tasks.json hinzugefügt', 'success');
    }

    // Schreibe aktualisierte tasks.json
    if (updated) {
      fs.writeFileSync(tasksPath, JSON.stringify(tasksData, null, 2), 'utf8');
      log('tasks.json erfolgreich aktualisiert', 'success');
    } else {
      log('GSC-Monitoring-Tasks sind bereits konfiguriert', 'info');
    }
  } catch (err) {
    log(`Fehler beim Aktualisieren der tasks.json: ${err.message}`, 'error');
    monitorStatus.recommendations.push('tasks.json manuell für GSC-Monitoring aktualisieren');
  }
}

/**
 * Aktualisiert den Extension-Validator, um GSC-Integration zu prüfen
 */
async function updateExtensionValidator() {
  const validatorPath = path.join(__dirname, '..', 'extension-function-validator.js');

  if (!fs.existsSync(validatorPath)) {
    log('Extension Function Validator nicht gefunden', 'warn');
    return;
  }

  try {
    let content = fs.readFileSync(validatorPath, 'utf8');

    // Prüfe, ob GSC_TOOLS bereits definiert sind
    if (content.includes('GSC_TOOLS')) {
      log('GSC-Tools sind bereits im Extension Validator definiert', 'info');
      return;
    }

    // Finde die Stelle, an der die AI_INTEGRATION_FILES definiert werden
    const aiFilesEndPosition = content.indexOf('AI_INTEGRATION_FILES');
    if (aiFilesEndPosition === -1) {
      log(
        'AI_INTEGRATION_FILES nicht gefunden, kann Extension Validator nicht aktualisieren',
        'warn',
      );
      return;
    }

    // Finde das Ende der AI_INTEGRATION_FILES-Definition
    const aiFilesBlockEnd = content.indexOf('];', aiFilesEndPosition);
    if (aiFilesBlockEnd === -1) {
      log('Ende der AI_INTEGRATION_FILES nicht gefunden', 'warn');
      return;
    }

    // Der Einfügepunkt ist nach dem Ende der AI_INTEGRATION_FILES-Definition
    const insertPosition = content.indexOf('\n', aiFilesBlockEnd);

    // Erstelle den einzufügenden GSC_TOOLS-Block
    const gscToolsBlock = `

// GSC-Integration-Dateien
const GSC_TOOLS = [
  'tools/gsc-auth-check.js',
  'tools/gsc-status-check.js',
  'tools/gsc-performance-data.js',
  'tools/gsc-keywords-report.js',
  'tools/gsc-crawl-stats.js',
  'tools/gsc-quick-test.js',
  'tools/gsc-integration-monitor.js'
];`;

    // Füge den GSC_TOOLS-Block nach AI_INTEGRATION_FILES ein
    content = content.slice(0, insertPosition) + gscToolsBlock + content.slice(insertPosition);

    // Finde eine geeignete Stelle, um die GSC-Tools-Prüfung einzufügen
    const checkFunctionsPosition = content.lastIndexOf('function checkAIIntegration()');
    if (checkFunctionsPosition === -1) {
      log('checkAIIntegration-Funktion nicht gefunden', 'warn');
      return;
    }

    // Erstelle die checkGSCIntegration-Funktion
    const checkGSCIntegrationFunction = `

/**
 * Prüft die GSC-Integration und -Tools
 */
function checkGSCIntegration() {
  log('\\n🔍 Überprüfe GSC-Integration...');
  
  let gscStatusOK = true;
  let missingGSCTools = [];
  
  // Prüfe Service-Account-Datei
  const serviceAccountPath = path.join(__dirname, 'tools', 'gsc-service-account.json');
  if (!fileExists(serviceAccountPath)) {
    log('⚠️ GSC Service-Account-Datei fehlt', 'warn');
    extensionStatus.recommendations.push('GSC Service-Account-Datei wiederherstellen');
    gscStatusOK = false;
  } else {
    log('✅ GSC Service-Account-Datei gefunden');
  }
  
  // Prüfe GSC-Tools
  for (const tool of GSC_TOOLS) {
    const toolPath = path.join(__dirname, tool);
    if (!fileExists(toolPath)) {
      missingGSCTools.push(path.basename(tool));
    }
  }
  
  if (missingGSCTools.length > 0) {
    log(\`⚠️ Fehlende GSC-Tools: \${missingGSCTools.join(', ')}\`, 'warn');
    extensionStatus.recommendations.push(\`GSC-Tools wiederherstellen: \${missingGSCTools.join(', ')}\`);
    gscStatusOK = false;
  } else {
    log('✅ Alle GSC-Tools sind vorhanden');
  }
  
  // Prüfe GSC-Integration in Tasks
  const tasksPath = path.join(__dirname, '.vscode', 'tasks.json');
  if (fileExists(tasksPath)) {
    const tasksConfig = readJsonFile(tasksPath);
    if (tasksConfig && Array.isArray(tasksConfig.tasks)) {
      const hasGSCAuthTask = tasksConfig.tasks.some(t => 
        t.label && t.label.includes('GSC Auth');
        t.runOptions && t.runOptions.runOn === 'folderOpen');
      
      const hasGSCMonitorTask = tasksConfig.tasks.some(t => 
        t.label && t.label.includes('GSC Integration Monitor'));
      
      if (!hasGSCAuthTask || !hasGSCMonitorTask) {
        log('⚠️ GSC-Tasks fehlen oder sind nicht korrekt konfiguriert', 'warn');
        extensionStatus.recommendations.push('GSC-Tasks in tasks.json konfigurieren');
        gscStatusOK = false;
      } else {
        log('✅ GSC-Tasks sind korrekt konfiguriert');
      }
    }
  }
  
  if (gscStatusOK) {
    log('✅ GSC-Integration scheint vollständig zu sein');
    extensionStatus.healthy.push('gsc-integration');
  } else {
    extensionStatus.issues.push('gsc-integration');
    log('⚠️ GSC-Integration hat Probleme');
  }
}`;

    // Füge die GSC-Integrations-Prüffunktion hinzu
    content =
      content.slice(0, checkFunctionsPosition) +
      checkGSCIntegrationFunction +
      content.slice(checkFunctionsPosition);

    // Finde eine Stelle, an der die GSC-Prüfung aufgerufen werden soll
    const callAIIntegrationPos = content.indexOf('checkAIIntegration();');
    if (callAIIntegrationPos === -1) {
      log('Aufrufspunkt für checkAIIntegration nicht gefunden', 'warn');
      return;
    }

    // Füge den Aufruf von checkGSCIntegration nach checkAIIntegration ein
    const endOfLine = content.indexOf('\n', callAIIntegrationPos);
    content = content.slice(0, endOfLine) + '\ncheckGSCIntegration();' + content.slice(endOfLine);

    // Speichere die aktualisierte Datei
    fs.writeFileSync(validatorPath, content, 'utf8');
    log('Extension Function Validator erfolgreich um GSC-Integration erweitert', 'success');
  } catch (err) {
    log(`Fehler beim Aktualisieren des Extension Function Validators: ${err.message}`, 'error');
    monitorStatus.recommendations.push(
      'Extension Function Validator manuell um GSC-Integration erweitern',
    );
  }
}

/**
 * Hauptfunktion zur Ausführung aller Checks
 */
async function main() {
  // Initialisiere Log-Datei
  try {
    fs.writeFileSync(
      LOG_FILE_PATH,
      `=== GSC Integration Monitor Log - ${new Date().toISOString()} ===\n`,
      'utf8',
    );
  } catch (err) {
    console.error(`Fehler beim Erstellen der Log-Datei: ${err.message}`);
  }

  log('========================================================================');
  log('🔍 GOOGLE SEARCH CONSOLE INTEGRATION MONITOR');
  log('========================================================================');
  log(`Start: ${new Date().toLocaleString()}`);

  // Führe alle Prüfungen durch
  const serviceAccountValid = checkServiceAccountFile();

  if (serviceAccountValid) {
    await testGSCConnection();
  }

  await checkGSCTools();
  await ensureGSCMonitoringTasks();
  await updateExtensionValidator();

  // Status-Zusammenfassung und Empfehlungen
  log('\n========================================================================');
  log('📊 ZUSAMMENFASSUNG');
  log('========================================================================');

  if (monitorStatus.gscStatus.connected) {
    log('✅ Google Search Console API-Verbindung: AKTIV', 'success');
  } else {
    log('❌ Google Search Console API-Verbindung: FEHLERHAFT', 'error');
  }

  log(`✓ Funktionsfähige Tools: ${monitorStatus.tools.working}/${monitorStatus.tools.total}`);

  if (monitorStatus.recommendations.length > 0) {
    log('\n📋 EMPFEHLUNGEN:');
    monitorStatus.recommendations.forEach((rec, i) => {
      log(`${i + 1}. ${rec}`);
    });
  }

  // Status-Datei aktualisieren
  updateStatusFile();

  const isHealthy = monitorStatus.gscStatus.connected && monitorStatus.tools.failed === 0;

  if (isHealthy) {
    recordCheckSuccess('gsc-integration-monitor');
    log('✅ GSC Integration Check erfolgreich im Status-Tracker vermerkt.', 'success');
  } else {
    const errorTitle = `GSC Integration Alert: Status is ${isHealthy ? 'OK' : 'FAILED'}`;
    const errorBody = `**Die GSC-Integration hat Probleme festgestellt.**\n\n**Details:**\n- **API Verbunden:** ${monitorStatus.gscStatus.connected}\n- **Tools fehlerhaft:** ${monitorStatus.tools.failed}/${monitorStatus.tools.total}\n- **Empfehlungen:** ${monitorStatus.recommendations.join(', ') || 'Keine'}\n\nBitte die Logs prüfen.`;
    await sendAlert(errorTitle, errorBody, ['high', 'gsc']);
  }

  log('\n========================================================================');
  log(`🏁 GSC Integration Monitor abgeschlossen: ${new Date().toLocaleString()}`);
  log('========================================================================');
}

// Starte die Hauptfunktion
main()
  .then(() => {
    console.log('GSC Integration Monitor erfolgreich ausgeführt');
  })
  .catch((err) => {
    console.error(`Fehler bei der Ausführung des GSC Integration Monitors: ${err.message}`);
  });

// Für Tests exportieren
module.exports = {};










}
}
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}