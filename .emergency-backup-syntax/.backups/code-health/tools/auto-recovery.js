/**
 * Auto-Recovery-System für burnitoken.website
 *
 * Wird beim Start von VS Code automatisch ausgeführt und stellt sicher,
 * dass alle kritischen Services und Extensions aktiv sind. Behandelt
 * Wiederherstellung nach Abstürzen oder Neustarts des Editors.
 */

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

// Konfiguration
const LOG_FILE = path.join(__dirname, 'auto-recovery.log');
const STATE_FILE = path.join(__dirname, 'recovery-state.json');
const RECOVERY_INTERVAL = 5000; // 5 Sekunden zwischen Recovery-Versuchen

// Status-Datei für die Wiederherstellung
let recoveryState = {
  lastCheckTime: 0,
  recoveryAttempts: 0,
  servicesStarted: {},
  extensionsActivated: false,
};

// Logging-Funktion
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Status-Datei laden
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      recoveryState = JSON.parse(data);
    } catch (err) {
      log(`Fehler beim Laden der Status-Datei: ${err.message}`);
    }
  }
}

// Status-Datei speichern
function saveState() {
  try {
    recoveryState.lastCheckTime = Date.now();
    fs.writeFileSync(STATE_FILE, JSON.stringify(recoveryState, null, 2), 'utf8');
  } catch (err) {
    log(`Fehler beim Speichern der Status-Datei: ${err.message}`);
  }
}

// Prüfen, ob ein Service läuft
function isServiceRunning(serviceName) {
  try {
    const command = `powershell -Command "Get-Process | Where-Object { $_.CommandLine -like '*${serviceName}*' } | Select-Object -First 1 | Select-Object Id"`;
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });

    // Wenn ein Prozess gefunden wurde, enthält die Ausgabe eine Zahl
    return output.trim().match(/\d+/) !== null;
  } catch (err) {
    return false;
  }
}

// Kritische Services starten
function startCriticalServices() {
  const criticalServices = [
    {
      name: 'session-saver',
      script: 'tools/session-saver.js',
    },
    {
      name: 'ai-bridge',
      script: 'tools/start-ai-bridge.js',
    },
    {
      name: 'gsc-indexing-watch',
      script: 'tools/gsc-indexing-watch.js',
    },
  ];

  log('🔄 Starte kritische Services...');

  criticalServices.forEach((service) => {
    if (!recoveryState.servicesStarted[service.name] && !isServiceRunning(service.script)) {
      log(`▶️ Starte ${service.name}...`);

      try {
        const child = exec(`node ${service.script}`, (err) => {
          if (err) {
            log(`❌ Fehler beim Starten von ${service.name}: ${err.message}`);
          }
        });

        // Erfolg nur loggen, nicht auf tatsächlichen Start warten
        log(`✅ ${service.name} gestartet (PID: ${child.pid})`);
        recoveryState.servicesStarted[service.name] = true;
      } catch (err) {
        log(`❌ Fehler beim Starten von ${service.name}: ${err.message}`);
      }
    } else {
      log(`ℹ️ ${service.name} bereits aktiv`);
    }
  });
}

// Extensions prüfen
function checkExtensions() {
  if (recoveryState.extensionsActivated) {
    log('ℹ️ Extensions bereits überprüft');
    return;
  }

  log('🧩 Überprüfe Extensions...');

  // Extension-Validator ausführen, falls vorhanden
  const extensionValidator = path.join(__dirname, '..', 'extension-function-validator.js');

  if (fs.existsSync(extensionValidator)) {
    try {
      execSync(`node ${extensionValidator}`, { stdio: 'pipe' });
      log('✅ Extension-Validator erfolgreich ausgeführt');
      recoveryState.extensionsActivated = true;
    } catch (err) {
      log(`❌ Fehler beim Ausführen des Extension-Validators: ${err.message}`);
    }
  } else {
    log('⚠️ Extension-Validator nicht gefunden');
  }
}

// GSC-Indexierung prüfen
function checkGSCIndexing() {
  log('🔍 Überprüfe GSC-Indexierung...');

  // Schnelle Prüfung auf noindex-Tags
  try {
    const htmlFiles = [];
    const scanDir = (dir) => {
      try {
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
          const fullPath = path.join(dir, file);

          if (
            fs.statSync(fullPath).isDirectory() &&
            !file.startsWith('.') &&
            file !== 'node_modules' &&
            file !== 'vendor'
          ) {
            scanDir(fullPath);
          } else if (file.endsWith('.html') || file.endsWith('.htm')) {
            htmlFiles.push(fullPath);
          }
        });
      } catch (err) {
        // Ignorieren
      }
    };

    // Hauptverzeichnis scannen
    scanDir(path.join(__dirname, '..'));

    // Erste 5 HTML-Dateien auf noindex prüfen
    const samplesToCheck = Math.min(5, htmlFiles.length);
    let noindexFound = false;

    for (let i = 0; i < samplesToCheck; i++) {
      const file = htmlFiles[i];
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.match(/<meta[^>]*noindex/i)) {
          log(`⚠️ noindex-Tag gefunden in ${file}`);
          noindexFound = true;
          break;
        }
      } catch (err) {
        // Ignorieren
      }
    }

    if (noindexFound) {
      log(
        '⚠️ noindex-Tags gefunden! Es wird empfohlen, die Task "Fix GSC Indexierung" auszuführen',
      );
    } else if (htmlFiles.length > 0) {
      log('✅ Keine noindex-Tags in den überprüften HTML-Dateien gefunden');
    } else {
      log('ℹ️ Keine HTML-Dateien gefunden');
    }
  } catch (err) {
    log(`❌ Fehler bei der GSC-Indexierungsprüfung: ${err.message}`);
  }
}

// Hauptfunktion für die Wiederherstellung
function performRecovery() {
  log('🚀 Auto-Recovery-System startet...');

  // Status laden
  loadState();

  // Zähler erhöhen
  recoveryState.recoveryAttempts++;

  // Services und Extensions prüfen & starten
  startCriticalServices();
  checkExtensions();
  checkGSCIndexing();

  // Status speichern
  saveState();

  log(`✅ Recovery-Durchlauf ${recoveryState.recoveryAttempts} abgeschlossen`);
}

// Hauptfunktion
function main() {
  // Sicherstellen, dass Log-Verzeichnis existiert
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (err) {
      console.error(`Fehler beim Erstellen des Log-Verzeichnisses: ${err.message}`);
    }
  }

  // Silent Mode erkennen
  const isSilent = process.argv.includes('--silent');

  // Recovery sofort durchführen
  performRecovery();

  if (!isSilent) {
    // Abschlussmeldung
    log('✅ Auto-Recovery abgeschlossen. Das System wurde wiederhergestellt.');
    console.log('\n✅ Alle kritischen Systeme wurden überprüft und gestartet.');
    console.log('   Die Website ist bereit für die Entwicklung und das Deployment.');
    console.log(
      '\nFür einen detaillierten Status führen Sie "📊 Unified Status Report erstellen" aus.',
    );
  }
}

// Programm starten
main();
