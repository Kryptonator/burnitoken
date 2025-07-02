#!/usr/bin/env node

/**
 * AI Status Checker (Verbesserte Version)
 * Zeigt Statusinformationen über die aktiven KI-Integrationssysteme an
 *
 * Verbesserungen:
 * - Robustere Prozesserkennung
 * - Detailliertere Status-Informationen
 * - Erfolgreiches Erkennen auch nach VS Code-Neustart
 * - Präzisere Prozesssuche
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Debug-Option über Befehlszeilenparameter
const DEBUG = process.argv.includes('--debug');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Konfiguration
const CONFIG = {
  // Verzeichnis für gemeinsam genutzte KI-Konversationen
  conversationDir: path.join(os.tmpdir(), 'ai-conversations'),

  // Backup-Verzeichnis für Session-Saver
  backupDir: path.join(os.tmpdir(), 'burnitoken-session-saver'),

  // Status-Datei für laufende Prozesse
  processStatusFile: path.join(__dirname, 'ai-services-status.json'),

  // Unterstützte KI-Modelle
  supportedModels: [
    { id: 'copilot', name: 'GitHub Copilot', emoji: '🤖' },
    { id: 'chatgpt', name: 'ChatGPT', emoji: '🟢' },
    { id: 'claude', name: 'Claude', emoji: '🟣' },
    { id: 'gemini', name: 'Gemini', emoji: '🔵' },
    { id: 'llama', name: 'Llama', emoji: '🦙' },
  ],

  // Service-Definitionen
  services: [
    {
      id: 'ai-bridge',
      name: 'AI Conversation Bridge',
      scriptNames: ['ai-conversation-bridge.js', 'start-ai-bridge.js'],
      processSignature: 'ai-conversation-bridge',
      statusFile: 'ai-bridge-status.json',
      isBackground: true,
    },
    {
      id: 'session-saver',
      name: 'Session-Saver',
      scriptNames: ['session-saver.js'],
      processSignature: 'session-saver.js',
      statusFile: 'session-saver-status.json',
      isBackground: true,
    },
  ],

  // Pfad, wo die VS Code Tasks auch PID-Informationen speichern
  vscodeTasksPath: path.join(os.tmpdir(), 'vscode-tasks'),
};

// Farben für die Konsole
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Hilfsfunktion für Debug-Logging
function debugLog(message) {
  if (DEBUG) {
    console.log(`${colors.blue}[DEBUG]${colors.reset} ${message}`);
  }
}

// Hilfsfunktion für erweiterte Logging
function verboseLog(message) {
  if (VERBOSE || DEBUG) {
    console.log(`${colors.magenta}[INFO]${colors.reset} ${message}`);
  }
}

/**
 * Überprüft, ob eine Datei existiert
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    debugLog(`Fehler beim Prüfen, ob Datei existiert (${filePath}): ${err.message}`);
    return false;
  }
}

/**
 * Alter der Datei in Minuten
 */
function getFileAge(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const fileTime = stats.mtime.getTime();
    const now = Date.now();
    return Math.floor((now - fileTime) / (1000 * 60)); // Minuten
  } catch (err) {
    debugLog(`Fehler beim Prüfen des Dateialters (${filePath}): ${err.message}`);
    return -1;
  }
}

/**
 * Versucht, das aktive KI-Modell zu ermitteln
 */
function getActiveModel() {
  try {
    debugLog(`Suche aktive Session in ${CONFIG.conversationDir}`);

    // Prüfe, ob die AI Bridge aktiv ist
    const sessionFile = path.join(CONFIG.conversationDir, 'active-session.json');

    if (fileExists(sessionFile)) {
      debugLog(`Session-Datei gefunden: ${sessionFile}`);
      verboseLog(`Session-Datei Alter: ${getFileAge(sessionFile)} Minuten`);

      try {
        const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        const sessionId = sessionData.sessionId;

        debugLog(`Aktive Session-ID: ${sessionId}`);

        // Prüfe die Modell-spezifischen Dateien für das neueste Update
        let latestModel = null;
        let latestTimestamp = 0;

        for (const model of CONFIG.supportedModels) {
          const modelFile = path.join(
            CONFIG.conversationDir,
            `${sessionId}_${model.id}_context.json`,
          );

          if (fileExists(modelFile)) {
            try {
              debugLog(`Modell-Datei gefunden für ${model.id}: ${modelFile}`);
              const modelData = JSON.parse(fs.readFileSync(modelFile, 'utf8'));
              const timestamp = new Date(modelData.timestamp).getTime();

              debugLog(`${model.id} Zeitstempel: ${modelData.timestamp}`);

              if (timestamp > latestTimestamp) {
                latestTimestamp = timestamp;
                latestModel = model;
                debugLog(`Neues letztes aktives Modell: ${model.id}`);
              }
            } catch (err) {
              // Ignoriere Parsing-Fehler für diese Datei
              debugLog(`Fehler beim Lesen von Modell-Datei ${model.id}: ${err.message}`);
            }
          } else {
            debugLog(`Keine Modelldatei für ${model.id}`);
          }
        }

        if (latestModel) {
          return latestModel;
        } else {
          debugLog('Kein aktives Modell in den Dateien gefunden, verwende Standard');
        }
      } catch (err) {
        debugLog(`Fehler beim Lesen der Session-Datei: ${err.message}`);
      }
    } else {
      debugLog('Keine aktive Session-Datei gefunden');
    }
  } catch (err) {
    debugLog(`Fehler bei der Modell-Erkennung: ${err.message}`);
  }

  return CONFIG.supportedModels[0]; // Default zu Copilot
}

/**
 * Schreibt oder aktualisiert die Service-Status-Datei
 */
function updateServiceStatus(services) {
  try {
    const statusData = {
      timestamp: new Date().toISOString(),
      services: {},
    };

    for (const service of services) {
      statusData.services[service.id] = {
        running: service.running,
        lastCheck: new Date().toISOString(),
        pid: service.pid || null,
        startTime: service.startTime || null,
      };
    }

    fs.writeFileSync(CONFIG.processStatusFile, JSON.stringify(statusData, null, 2), 'utf8');
    debugLog(`Status in ${CONFIG.processStatusFile} aktualisiert`);
  } catch (err) {
    debugLog(`Fehler beim Speichern des Service-Status: ${err.message}`);
  }
}

/**
 * Liest PID-Informationen aus VS Code Tasks-Verzeichnis
 */
function getTaskPids() {
  try {
    if (!fileExists(CONFIG.vscodeTasksPath)) {
      debugLog(`VS Code Tasks-Verzeichnis existiert nicht: ${CONFIG.vscodeTasksPath}`);
      return {};
    }

    const taskPids = {};
    const files = fs.readdirSync(CONFIG.vscodeTasksPath);

    for (const file of files) {
      if (file.endsWith('.pid')) {
        try {
          const serviceName = file.replace('.pid', '');
          const pidContent = fs
            .readFileSync(path.join(CONFIG.vscodeTasksPath, file), 'utf8')
            .trim();

          if (pidContent && /^\d+$/.test(pidContent)) {
            const pid = parseInt(pidContent, 10);
            taskPids[serviceName] = pid;
            debugLog(`PID für ${serviceName} gefunden: ${pid}`);
          }
        } catch (err) {
          debugLog(`Fehler beim Lesen der PID-Datei ${file}: ${err.message}`);
        }
      }
    }

    return taskPids;
  } catch (err) {
    debugLog(`Fehler beim Lesen des VS Code Tasks-Verzeichnisses: ${err.message}`);
    return {};
  }
}

/**
 * Verbesserte Erkennung laufender Prozesse
 */
function getRunningServices() {
  // Erweiterte Prozess-Erkennung
  const services = JSON.parse(JSON.stringify(CONFIG.services)); // Deep copy

  // 1. Überprüfe anhand der Ausgabe des Betriebssystems
  try {
    let command = '';
    let output = '';

    if (process.platform === 'win32') {
      // Windows-Prozessliste mit mehr Details
      command = `powershell -Command "Get-Process -IncludeUserName | Where-Object { $_.Name -eq 'node' } | ForEach-Object { $_.Id.ToString() + ',' + $_.CommandLine + ',' + $_.StartTime + ',' + $_.UserName }"`;
      try {
        output = execSync(command, { encoding: 'utf8', timeout: 5000 }).trim();
      } catch (err) {
        debugLog(`Fehler bei Windows-Prozessabfrage: ${err.message}`);
        // Alternative Methode für ältere Windows-Versionen
        command = `tasklist /v /fo csv /nh`;
        output = execSync(command, { encoding: 'utf8', timeout: 5000 }).trim();
      }
    } else {
      // Unix-Prozessliste
      command = `ps -eo pid,lstart,cmd | grep node`;
      output = execSync(command, { encoding: 'utf8', timeout: 5000 }).trim();
    }

    verboseLog(`Prozessliste erhalten, Länge: ${output.length} Zeichen`);
    debugLog(`Prozessliste: ${output}`);

    // Verarbeite jeden Service
    for (const service of services) {
      service.running = false;
      service.pid = null;

      // Prüfe die Prozessliste für den Dienst
      for (const scriptName of service.scriptNames) {
        if (output.includes(scriptName)) {
          service.running = true;

          // Versuche, die PID zu extrahieren
          const match = new RegExp(`(\\d+).*${scriptName}`).exec(output);
          if (match && match[1]) {
            service.pid = parseInt(match[1], 10);
          }

          verboseLog(`Service ${service.name} läuft (PID: ${service.pid || 'unbekannt'})`);
          break;
        }
      }
    }
  } catch (err) {
    debugLog(`Fehler bei der Prozessabfrage: ${err.message}`);
  }

  // 2. Überprüfe anhand der VS Code Task-PIDs als Backup-Methode
  const taskPids = getTaskPids();
  debugLog(`VS Code Task PIDs: ${JSON.stringify(taskPids)}`);

  // Ergänze nicht erkannte Services mit Task-PIDs
  for (const service of services) {
    if (!service.running) {
      for (const scriptName of service.scriptNames) {
        const baseName = path.basename(scriptName, '.js');

        if (taskPids[baseName]) {
          service.running = true;
          service.pid = taskPids[baseName];
          verboseLog(`Service ${service.name} über Task-PID erkannt: ${service.pid}`);
          break;
        }
      }
    }
  }

  // 3. Überprüfe anhand des Status-Files als Fallback
  try {
    if (fileExists(CONFIG.processStatusFile)) {
      const statusData = JSON.parse(fs.readFileSync(CONFIG.processStatusFile, 'utf8'));
      const statusAge = getFileAge(CONFIG.processStatusFile);

      // Verwende Status-Daten, wenn sie nicht älter als 5 Minuten sind
      if (statusAge >= 0 && statusAge < 5) {
        verboseLog(`Status-Datei ist ${statusAge} Minuten alt, verwende als Fallback`);

        for (const service of services) {
          if (
            !service.running;
            statusData.services[service.id];
            statusData.services[service.id].running
          ) {
            // Überprüfe zusätzlich, ob der gespeicherte PID noch existiert
            const storedPid = statusData.services[service.id].pid;

            if (storedPid) {
              try {
                if (process.platform === 'win32') {
                  execSync(
                    `powershell -Command "Get-Process -Id ${storedPid} -ErrorAction SilentlyContinue"`,
                    { stdio: 'ignore' },
                  );
                } else {
                  execSync(`ps -p ${storedPid}`, { stdio: 'ignore' });
                }

                // Prozess existiert noch
                service.running = true;
                service.pid = storedPid;
                verboseLog(`Service ${service.name} über gespeicherte PID erkannt: ${service.pid}`);
              } catch (err) {
                // Prozess mit dieser PID existiert nicht mehr
                debugLog(
                  `Gespeicherter Prozess ${storedPid} für ${service.name} existiert nicht mehr`,
                );
              }
            }
          }
        }
      } else {
        debugLog(`Status-Datei ist zu alt (${statusAge} Minuten) oder nicht lesbar`);
      }
    } else {
      debugLog(`Keine Status-Datei gefunden: ${CONFIG.processStatusFile}`);
    }
  } catch (err) {
    debugLog(`Fehler beim Lesen der Status-Datei: ${err.message}`);
  }

  // Speichere den aktuellen Status
  updateServiceStatus(services);
  return services;
}

/**
 * Zeigt den AI-Status
 */
function showAIStatus() {
  console.log(`${colors.cyan}🧠 AI Integration Status${colors.reset}`);
  console.log(`${colors.cyan}=======================${colors.reset}`);
  console.log(`📅 ${new Date().toLocaleString('de-DE')}`);

  // Prüfe Verzeichnisse
  debugLog(`Prüfe Verzeichnisse: ${CONFIG.conversationDir} und ${CONFIG.backupDir}`);

  // Prüfe, ob die Verzeichnisse existieren
  const aiDirExists = fileExists(CONFIG.conversationDir);
  const backupDirExists = fileExists(CONFIG.backupDir);

  console.log(`\nVerzeichnisse:`);
  console.log(
    `AI Conversations: ${aiDirExists ? colors.green + '✅ Vorhanden' + colors.reset : colors.red + '❌ Fehlt' + colors.reset}`,
  );
  console.log(
    `Session Backups: ${backupDirExists ? colors.green + '✅ Vorhanden' + colors.reset : colors.red + '❌ Fehlt' + colors.reset}`,
  );

  // Hole und zeige Service-Status
  const services = getRunningServices();

  console.log(`\nServices:`);
  for (const service of services) {
    const status = service.running
      ? `${colors.green}✅ Aktiv${colors.reset}${service.pid ? ` (PID: ${service.pid})` : ''}`
      : `${colors.red}❌ Inaktiv${colors.reset}`;

    console.log(`${service.name}: ${status}`);
  }

  // Zeige das aktuell verwendete Modell
  debugLog('Ermittle aktives KI-Modell');
  const activeModel = getActiveModel();
  console.log(`\nAktives AI-Modell: ${activeModel.emoji} ${activeModel.name}`);

  // Überprüfe die Verfügbarkeit der KI-Dateien
  debugLog('Prüfe KI-Dateien');
  const aiFiles = [
    'tools/ai-conversation-bridge.js',
    'tools/start-ai-bridge.js',
    'tools/model-switch.js',
    'tools/session-saver.js',
    'tools/recover-session.js',
  ];

  console.log('\nKI-Dateien:');
  for (const file of aiFiles) {
    console.log(
      `${file}: ${fileExists(file) ? colors.green + '✅' + colors.reset : colors.red + '❌' + colors.reset}`,
    );
  }

  // Anzeige der verfügbaren Modelle
  console.log('\nVerfügbare Modelle:');
  for (const model of CONFIG.supportedModels) {
    const isActive = model.id === activeModel.id;
    console.log(
      `${model.emoji} ${model.name}${isActive ? colors.cyan + ' (Aktiv)' + colors.reset : ''}`,
    );
  }

  console.log('\n💡 TIP: Um das Modell zu wechseln, führe aus:');
  console.log('node tools/model-switch.js --model=<modellname>');
  console.log('Unterstützte Modelle: copilot, chatgpt, claude, gemini, llama');

  // Service neustarten
  console.log('\n🔄 Neustart: Wenn ein Service nicht aktiv ist, führe aus:');
  console.log('node tools/ai-services-manager.js restart');

  // Debug-Hinweis
  if (!DEBUG && !VERBOSE) {
    console.log(
      `\nℹ️ Für detailliertere Informationen: ${colors.yellow}node tools/ai-status-improved.js --debug${colors.reset} oder ${colors.yellow}--verbose${colors.reset}`,
    );
  }
}

// Verarbeite Befehlszeilenargumente
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('AI Status Checker - Zeigt den Status der KI-Integration an');
  console.log('\nOptionen:');
  console.log('  --debug    Zeigt detaillierte Debug-Informationen an');
  console.log('  --verbose  Zeigt zusätzliche Informationen an (weniger als --debug)');
  console.log('  --help, -h Zeigt diese Hilfeinformationen an');
  process.exit(0);
}

// Führe die Hauptfunktion aus
try {
  showAIStatus();
} catch (error) {
  console.error(`${colors.red}❌ Unerwarteter Fehler: ${error.message}${colors.reset}`);
  if (DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
}
