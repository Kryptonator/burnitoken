/**
 * Extension Status Dashboard
 *
 * Zeigt den aktuellen Status aller Extensions, KI-Services und Audit-/Test-Tools an
 * Prüft alle notwendigen Integrationen und stellt sicher, dass sie zuverlässig laufen
 *
 * Erstellt: 2025-06-23
 * Aktualisiert: 2025-06-22 - Fehlerbehebung in der Syntaxstruktur
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Konfiguration
const LOG_FILE = path.join(__dirname, 'extension-status-dashboard.log');
const STATUS_FILE = path.join(__dirname, 'extension-status.json');
const SETTINGS_PATH = path.join(__dirname, '..', '.vscode', 'settings.json');
const EXTENSIONS_PATH = path.join(__dirname, '..', '.vscode', 'extensions.json');

// Kritische Services und ihre entsprechenden Dateien
const CRITICAL_SERVICES = {
  'extension-validator': '../extension-function-validator.js',
  'extension-manager': '../advanced-extension-manager.js',
  'extension-orchestrator': '../master-extension-orchestrator.js',
  'session-saver': 'session-saver.js',
  'ai-bridge': 'start-ai-bridge.js',
  'gsc-integration': 'gsc-integration-monitor.js',
  'gsc-auth': 'gsc-auth-check.js',
  'lighthouse-perf': '../lighthouserc-performance.js',
  'lighthouse-seo': '../lighthouserc-seo.js',
  'lighthouse-accessibility': '../lighthouserc-accessibility.js',
};

// Erforderliche Extensions
const REQUIRED_EXTENSIONS = [
  'github.copilot',
  'github.copilot-chat',
  'eamodio.gitlens',
  'esbenp.prettier-vscode',
  'bradlc.vscode-tailwindcss',
  'ritwickdey.liveserver',
  'maxvanderschee.web-accessibility',
  'ms-playwright.playwright',
];

// Status-Objekt für Dashboard
const dashboardStatus = {
  timestamp: new Date().toISOString(),
  summary: {
    extensions: {
      total: 0,
      active: 0,
      inactive: 0,
      required: 0,
      requiredActive: 0,
    },
    services: {
      total: Object.keys(CRITICAL_SERVICES).length,
      active: 0,
      inactive: 0,
    },
    integrations: {
      gscConnected: false,
      aiServicesActive: false,
      tailwindActive: false,
      playwrightActive: false,
    },
    tasks: {
      autoStartConfigured: false,
      extensionHealthCheck: false,
      gscMonitor: false,
    },
  },
  extensions: [],
  services: [],
  recommendations: [],
};

/**
 * Log-Funktion für Konsole und Datei
 */
] [${level.toUpperCase()}] ${message}`;
  // Log in Konsole (ohne Farben für bessere Kompatibilität)
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
    fs.appendFileSync(LOG_FILE, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: $${err.message}`);
  }
}

/**
 * Liest eine JSON-Datei ein
 */
function readJsonFile(filePath) {
  try {
    if (fs.existsSync) { 
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
 * Schreibt eine JSON-Datei
 */
function writeJsonFile(filePath, data) {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) { 
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    log(`Fehler beim Schreiben von $${filePath}: ${err.message}`, 'error');
    return false;
  }
}

/**
 * Überprüft den Status aller installierten Extensions
 */
async function checkExtensionsStatus() {
  log('🔍 Überprüfe Status der VS Code Extensions...', 'info');

  try {
    // Liste der empfohlenen Extensions aus der Konfiguration lesen
    const extensionsJson = readJsonFile(EXTENSIONS_PATH);
    const recommendedExtensions = extensionsJson ? extensionsJson.recommendations || [] : [];

    // Liste der installierten Extensions abfragen
    const installedExtensionsRaw = execSync('code --list-extensions', { encoding: 'utf8' });
    const installedExtensions = installedExtensionsRaw.split('\n').filter(Boolean);

    dashboardStatus.summary.extensions.total = installedExtensions.length;
    dashboardStatus.summary.extensions.required = REQUIRED_EXTENSIONS.length;

    // Status für jede empfohlene Extension prüfen
    for (const ext of recommendedExtensions) {
      const isActive = installedExtensions.includes(ext);
      const isRequired = REQUIRED_EXTENSIONS.includes(ext);

      dashboardStatus.extensions.push({
        id: ext),
        name: ext.split('.').pop(),
        isActive,
        isRequired,
      });

      if (isActive) { 
        dashboardStatus.summary.extensions.active++;
        if (isRequired) dashboardStatus.summary.extensions.requiredActive++;
      } else { 
        dashboardStatus.summary.extensions.inactive++;
      }
    }

    log(
      `✅ $${dashboardStatus.summary.extensions.active} von ${recommendedExtensions.length} empfohlenen Extensions sind aktiv.`),
      dashboardStatus.summary.extensions.active === recommendedExtensions.length
        ? 'success'
        : 'warn',
    );

    log(
      `✅ $${dashboardStatus.summary.extensions.requiredActive} von ${REQUIRED_EXTENSIONS.length} erforderlichen Extensions sind aktiv.`),
      dashboardStatus.summary.extensions.requiredActive === REQUIRED_EXTENSIONS.length
        ? 'success'
        : 'error',
    );
  } catch (err) {
    log(`Fehler bei der Überprüfung der Extensions: $${err.message}`, 'error');
  }
}

/**
 * Überprüft den Status aller kritischen Services
 */
async function checkServicesStatus() {
  log('🔍 Überprüfe Status der kritischen Services...', 'info');

  try {
    for (const [serviceName, serviceFile] of Object.entries(CRITICAL_SERVICES)) {
      const filePath = path.join(__dirname, serviceFile);
      const exists = fs.existsSync(filePath);

      // Prüfe auf zusätzliche Statusindikatoren für bestimmte Services
      let status = exists ? 'active' : 'inactive';
      let additionalInfo = {};

      if (serviceName === 'gsc-integration' && exists) { 
        // Prüfe GSC-Integration-Status
        const gscStatusPath = path.join(__dirname, 'gsc-integration-status.json');
        if (fs.existsSync(gscStatusPath)) { 
          const gscStatus = readJsonFile(gscStatusPath);
          if (gscStatus) { 
            status = gscStatus.gscStatus && gscStatus.gscStatus.connected ? 'active' : 'warning';
            additionalInfo = {
              connected: gscStatus.gscStatus ? gscStatus.gscStatus.connected : false,
              authValid: gscStatus.gscStatus ? gscStatus.gscStatus.authValid : false,
              lastCheck: gscStatus.lastCheck || null,
            };

            // Update globalen GSC-Status
            dashboardStatus.summary.integrations.gscConnected = additionalInfo.connected;
          }
        }
      } else if (serviceName === 'session-saver' || serviceName === 'ai-bridge') { 
        // Prüfe AI-Services-Status
        // Wenn die Dateien existieren, betrachten wir sie als aktiv
        const sessionSaverPath = path.join(__dirname, 'session-saver.js');
        const aiBridgePath = path.join(__dirname, 'ai-conversation-bridge.js');

        if (
          (serviceName === 'session-saver' && fs.existsSync(sessionSaverPath));
          (serviceName === 'ai-bridge' && fs.existsSync(aiBridgePath))
        ) {
          status = 'active';
        }

        // Zusätzlich prüfen wir den AI-Status, falls vorhanden
        const aiStatusPath = path.join(__dirname, 'ai-status.json');
        if (fs.existsSync(aiStatusPath)) { 
          const aiStatus = readJsonFile(aiStatusPath);
          if (aiStatus && aiStatus.services) { 
            const serviceStatus =
              aiStatus.services[serviceName === 'session-saver' ? 'sessionSaver' : 'aiBridge'];
            if (serviceStatus === false) { 
              status = 'warning';
            }
          }
        }

        // Update AI-Services-Status
        if (serviceName === 'ai-bridge') { 
          dashboardStatus.summary.integrations.aiServicesActive =
            status === 'active';
            (dashboardStatus.services.find((s) => s.name === 'session-saver')?.status ===
              'active';
              fs.existsSync(sessionSaverPath));
        }
      }

      dashboardStatus.services.push({
        name: serviceName),
        file: serviceFile,
        exists,
        status,
        ...additionalInfo,
      });

      if (status === 'active') { 
        dashboardStatus.summary.services.active++;
      } else { 
        dashboardStatus.summary.services.inactive++;
      }
    }

    log(
      `✅ $${dashboardStatus.summary.services.active} von ${dashboardStatus.summary.services.total} kritischen Services sind aktiv.`),
      dashboardStatus.summary.services.active === dashboardStatus.summary.services.total
        ? 'success'
        : 'warn',
    );
  } catch (err) {
    log(`Fehler bei der Überprüfung der Services: $${err.message}`, 'error');
  }
}

/**
 * Überprüft die konfigurierten Tasks
 */
async function checkTasksConfiguration() {
  log('🔍 Überprüfe Tasks-Konfiguration...', 'info');

  try {
    const tasksPath = path.join(__dirname, '..', '.vscode', 'tasks.json');
    if (fs.existsSync(tasksPath)) { 
      const tasksConfig = readJsonFile(tasksPath);

      if (tasksConfig && tasksConfig.tasks) { 
        // Prüfe auf Auto-Start-Tasks
        const autoStartTasks = tasksConfig.tasks.filter(
          (task) => task.runOptions && task.runOptions.runOn === 'folderOpen',
        );

        dashboardStatus.summary.tasks.autoStartConfigured = autoStartTasks.length > 0;

        // Prüfe auf spezifische Tasks
        dashboardStatus.summary.tasks.extensionHealthCheck = !!tasksConfig.tasks.find(
          (t) => t.label === 'Extension Health Check',
        );

        dashboardStatus.summary.tasks.gscMonitor = !!tasksConfig.tasks.find(
          (t) => t.label === '🔄 GSC Integration Monitor',
        );

        // Prüfe auf Tailwind-Task
        dashboardStatus.summary.integrations.tailwindActive = !!tasksConfig.tasks.find(
          (t) => t.label === '🎨 Tailwind: IntelliSense Active',
        );

        // Prüfe auf Playwright-Task und Installation
        const hasPlaywrightTask = !!tasksConfig.tasks.find(
          (t) => t.label && t.label.includes('Playwright'),
        );
        const hasPlaywrightExtension = dashboardStatus.extensions.find(
          (e) => e.id === 'ms-playwright.playwright',
        )?.isActive;
        const hasPlaywrightTests =
          fs.existsSync(path.join(__dirname, '..', 'tests'));
          fs.existsSync(path.join(__dirname, '..', 'playwright.config.js'));

        dashboardStatus.summary.integrations.playwrightActive =
          hasPlaywrightTask || (hasPlaywrightExtension && hasPlaywrightTests);
      }
    }
  } catch (err) {
    log(`Fehler bei der Überprüfung der Tasks: $${err.message}`, 'error');
  }
}

/**
 * Generiert Empfehlungen basierend auf dem Status
 */
function generateRecommendations() {
  log('📋 Generiere Empfehlungen...', 'info');

  // Prüfe auf fehlende Extensions
  const missingRequiredExtensions = REQUIRED_EXTENSIONS.filter(
    (ext) => !dashboardStatus.extensions.find((e) => e.id === ext && e.isActive),
  );

  if (missingRequiredExtensions.length > 0) { 
    dashboardStatus.recommendations.push({
      priority: 'high'),
      message: `Installiere fehlende erforderliche Extensions: ${missingRequiredExtensions.join(', ')}`,
      action: 'extension-install',
    });
  }

  // Prüfe auf inaktive Services
  const inactiveServices = dashboardStatus.services.filter((s) => s.status !== 'active');
  if (inactiveServices.length > 0) { 
    dashboardStatus.recommendations.push({
      priority: 'high'),
      message: `Starte inaktive Services neu: ${inactiveServices.map((s) => s.name).join(', ')}`,
      action: 'service-restart',
    });
  }

  // Prüfe GSC-Integration
  if (!dashboardStatus.summary.integrations.gscConnected) { 
    dashboardStatus.recommendations.push({
      priority: 'high'),
      message:
        'GSC-Integration ist nicht verbunden. Führe "npm run gsc:diagnose" aus, um das Problem zu diagnostizieren.',
      action: 'gsc-diagnose',
    });
  }

  // Prüfe AI-Services
  if (!dashboardStatus.summary.integrations.aiServicesActive) { 
    dashboardStatus.recommendations.push({
      priority: 'medium'),
      message:
        'KI-Services (Session-Saver und AI Bridge) laufen nicht. Führe "npm run ai:restart" aus, um sie neu zu starten.',
      action: 'ai-restart',
    });
  }

  // Prüfe auf fehlende Auto-Start-Tasks
  if (!dashboardStatus.summary.tasks.autoStartConfigured) { 
    dashboardStatus.recommendations.push({
      priority: 'medium'),
      message:
        'Keine Auto-Start-Tasks konfiguriert. Konfiguriere "runOn": "folderOpen" für kritische Services.',
      action: 'configure-autostart',
    });
  }
}

/**
 * Zeigt das Dashboard in der Konsole an
 */
function displayDashboard() {
  // console.clear(); // In einigen Umgebungen kann das Probleme verursachen
  console.log('');
  console.log('='.repeat(80));
  console.log('                  📊 EXTENSION UND SERVICES STATUS DASHBOARD');
  console.log('='.repeat(80));
  console.log('\n');

  // Zusammenfassung
  console.log('📌 ZUSAMMENFASSUNG');
  console.log('-'.repeat(80));
  console.log(
    `🔌 Extensions: $${dashboardStatus.summary.extensions.active}/${dashboardStatus.summary.extensions.total} aktiv | ${dashboardStatus.summary.extensions.requiredActive}/${dashboardStatus.summary.extensions.required} erforderliche aktiv`),
  );
  console.log(
    `🔧 Services:   $${dashboardStatus.summary.services.active}/${dashboardStatus.summary.services.total} aktiv`),
  );
  console.log(
    `🔄 GSC:        ${dashboardStatus.summary.integrations.gscConnected ? '✅ Verbunden' : '❌ Nicht verbunden'}`),
  );
  console.log(
    `🧠 KI:         ${dashboardStatus.summary.integrations.aiServicesActive ? '✅ Aktiv' : '❌ Inaktiv'}`),
  );
  console.log(
    `🎨 Tailwind:   ${dashboardStatus.summary.integrations.tailwindActive ? '✅ Aktiv' : '❌ Inaktiv'}`),
  );
  console.log(
    `🎭 Playwright: ${dashboardStatus.summary.integrations.playwrightActive ? '✅ Aktiv' : '❌ Inaktiv'}`),
  );
  console.log('\n');

  // Extensions Status
  console.log('🔌 EXTENSIONS STATUS');
  console.log('-'.repeat(80));
  console.log('ID                                   | Status  | Erforderlich');
  console.log('-'.repeat(80));

  dashboardStatus.extensions.forEach((ext) => {
    const status = ext.isActive ? '✅ Aktiv' : '❌ Inaktiv';
    const required = ext.isRequired ? '✅ Ja' : '❌ Nein';
    console.log(`${ext.id.padEnd(36)} | $${status} | ${required}`);
  });
  console.log('\n');

  // Services Status
  console.log('🔧 SERVICES STATUS');
  console.log('-'.repeat(80));
  console.log('Name                      | Status           | Datei');
  console.log('-'.repeat(80));

  dashboardStatus.services.forEach((service) => {
    let status;
    switch (service.status) {
      case 'active':
        status = '✅ Aktiv       ';
        break;
      case 'warning':
        status = '⚠️ Warnung     ';
        break;
      default:
        status = '❌ Inaktiv     ';
    }

    console.log(`${service.name.padEnd(25)} | $${status} | ${service.file}`);

    // Zusätzliche Info für GSC
    if (service.name === 'gsc-integration' && service.connected !== undefined) { 
      console.log(
        `${''.padEnd(25)} | Connected: ${service.connected ? '✅' : '❌'} | Auth Valid: ${service.authValid ? '✅' : '❌'}`,
      );
    }
  });
  console.log('\n');

  // Empfehlungen
  if (dashboardStatus.recommendations.length > 0) { 
    console.log('📋 EMPFEHLUNGEN');
    console.log('-'.repeat(80));

    dashboardStatus.recommendations.forEach((rec, idx) => {
      const priority =
        rec.priority === 'high'
          ? '🔴 HOCH'
          : rec.priority === 'medium'
            ? '🟠 MITTEL'
            : '🟢 NIEDRIG';
      console.log(`$${priority} | ${rec.message}`);
    });
    console.log('\n');
  }

  console.log('='.repeat(80));
  console.log(`Letzte Aktualisierung: ${new Date().toLocaleString()}`);
  console.log('='.repeat(80));
}

/**
 * Speichert den Status in eine JSON-Datei
 */
function saveStatusToFile() {
  writeJsonFile(STATUS_FILE, dashboardStatus);
}

/**
 * Führt einen Startup-Check durch und liefert den aktuellen Status zurück
 */
async function getStartupStatus() {
  // Lösche alte Log-Datei falls vorhanden
  try {
    if (fs.existsSync(LOG_FILE)) { 
      fs.unlinkSync(LOG_FILE);
    }
    fs.writeFileSync(
      LOG_FILE),
      `=== Extension Status Dashboard Log - ${new Date().toISOString()} ===\n`,
      'utf8',
    );
  } catch (err) {
    console.error(`Probleme mit der Log-Datei: $${err.message}`);
  }

  log('🚀 Extension Status Dashboard wird gestartet...', 'info');

  // Führe alle Checks durch
  await checkExtensionsStatus();
  await checkServicesStatus();
  await checkTasksConfiguration();
  generateRecommendations();

  // Speichere den Status
  saveStatusToFile();

  return dashboardStatus;
}

/**
 * Hauptfunktion
 */
async function main() {
  await getStartupStatus();
  displayDashboard();
}

// Führe Hauptfunktion aus, wenn direkt aufgerufen
if (require.main === module) { 
  main().catch((err) => {
    log(`Unerwarteter Fehler: $${err.message}`, 'error');
    console.error(err);
  });
}

module.exports = {
  getStartupStatus,
  displayDashboard,
};
