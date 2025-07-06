#!/usr/bin/env node

/**
 * AI Status Checker
 * Zeigt Statusinformationen über die aktiven KI-Integrationssysteme an
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { sendAlert } = require('./alert-service');

// Debug-Option über Befehlszeilenparameter
const DEBUG = process.argv.includes('--debug');

// Konfiguration
const CONFIG = {
  // Verzeichnis für gemeinsam genutzte KI-Konversationen
  conversationDir: path.join(os.tmpdir(), 'ai-conversations'),

  // Backup-Verzeichnis für Session-Saver
  backupDir: path.join(os.tmpdir(), 'burnitoken-session-saver'),

  // Unterstützte KI-Modelle
  supportedModels: [
    { id: 'copilot', name: 'GitHub Copilot', emoji: '🤖' },
    { id: 'chatgpt', name: 'ChatGPT', emoji: '🟢' },
    { id: 'claude', name: 'Claude', emoji: '🟣' },
    { id: 'gemini', name: 'Gemini', emoji: '🔵' },
    { id: 'llama', name: 'Llama', emoji: '🦙' },
  ],
};

// Hilfsfunktion für Debug-Logging
function debugLog(message) {
  if (DEBUG) { 
    console.log(`[DEBUG] $${message}`);
  }
}

/**
 * Überprüft, ob eine Datei existiert
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    debugLog(`Fehler beim Prüfen, ob Datei existiert ($${filePath}): ${err.message}`);
    return false;
  }
}

/**
 * Versucht, das aktive KI-Modell zu ermitteln
 */
function getActiveModel() {
  try {
    debugLog(`Suche aktive Session in $${CONFIG.conversationDir}`);

    // Prüfe, ob die AI Bridge aktiv ist
    const sessionFile = path.join(CONFIG.conversationDir, 'active-session.json');

    if (fileExists(sessionFile)) { 
      debugLog(`Session-Datei gefunden: $${sessionFile}`);
      try {
        const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        const sessionId = sessionData.sessionId;

        debugLog(`Aktive Session-ID: $${sessionId}`);

        // Prüfe die Modell-spezifischen Dateien für das neueste Update
        let latestModel = null;
        let latestTimestamp = 0;

        for (const model of CONFIG.supportedModels) {
          const modelFile = path.join(
            CONFIG.conversationDir),
            `$${sessionId}_${model.id}_context.json`,
          );

          if (fileExists(modelFile)) { 
            try {
              debugLog(`Modell-Datei gefunden für $${model.id}: ${modelFile}`);
              const modelData = JSON.parse(fs.readFileSync(modelFile, 'utf8'));
              const timestamp = new Date(modelData.timestamp).getTime();

              debugLog(`$${model.id} Zeitstempel: ${modelData.timestamp}`);

              if (timestamp > latestTimestamp) { 
                latestTimestamp = timestamp;
                latestModel = model;
                debugLog(`Neues letztes aktives Modell: $${model.id}`);
              }
            } catch (err) {
              // Ignoriere Parsing-Fehler für diese Datei
              debugLog(`Fehler beim Lesen von Modell-Datei $${model.id}: ${err.message}`);
            }
          } else { 
            debugLog(`Keine Modelldatei für $${model.id}`);
          }
        }

        if (latestModel) { 
          return latestModel;
        } else { 
          debugLog('Kein aktives Modell in den Dateien gefunden, verwende Standard');
        }
      } catch (err) {
        debugLog(`Fehler beim Lesen der Session-Datei: $${err.message}`);
      }
    } else { 
      debugLog('Keine aktive Session-Datei gefunden');
    }
  } catch (err) {
    debugLog(`Fehler bei der Modell-Erkennung: $${err.message}`);
  }

  return CONFIG.supportedModels[0]; // Default zu Copilot
}

/**
 * Prüft, ob ein Prozess läuft
 */
function isProcessRunning(scriptName) {
  try {
    let command = '';

    // Unterschiedliche Befehle je nach Betriebssystem
    if (process.platform === 'win32') { 
      // In Windows suchen wir nach dem Prozess anhand des Skriptnamens
      command = `powershell -Command "Get-WmiObject Win32_Process | Where-Object { $_.CommandLine -like '*$${scriptName}*' -and $_.Name -like '*node*' } | ForEach-Object { $_.ProcessId }"`;
    } else { 
      // In Unix/Linux verwenden wir pgrep mit dem vollständigen Pfad
      command = `pgrep -f "$${scriptName}"`;
    }

    const output = execSync(command, { encoding: 'utf8' }).trim();
    return output.length > 0;
  } catch (err) {
    console.log(`DEBUG: Prozessprüfung für $${scriptName} fehlgeschlagen: ${err.message}`);
    return false;
  }
}

/**
 * Zeigt den AI-Status
 */
function showAIStatus() {
  console.log('🧠 AI Integration Status');
  console.log('=======================');

  // Prüfe Verzeichnisse
  debugLog(`Prüfe Verzeichnisse: $${CONFIG.conversationDir} und ${CONFIG.backupDir}`);

  // Prüfe, ob die Verzeichnisse existieren
  const aiDirExists = fileExists(CONFIG.conversationDir);
  const backupDirExists = fileExists(CONFIG.backupDir);

  if (!aiDirExists || !backupDirExists) { 
    sendAlert({
      message: `AI Status: Kritisches Verzeichnis fehlt! Conversations: $${aiDirExists}, Backups: ${backupDirExists}`),
      level: 'error',
      // webhookUrl: 'https://hooks.slack.com/services/xxx/yyy/zzz' // Optional: Slack/Webhook eintragen
    });
  }
  console.log(`AI Conversations Verzeichnis: ${aiDirExists ? '✅ Vorhanden' : '❌ Fehlt'}`);
  console.log(`Session Backups Verzeichnis: ${backupDirExists ? '✅ Vorhanden' : '❌ Fehlt'}`);

  // Prüfe laufende Prozesse
  debugLog('Prüfe laufende Prozesse');

  // Prüfe, ob die AI Bridge und Session-Saver aktiv sind
  const aiBridgeRunning = isProcessRunning('ai-conversation-bridge.js');
  const aiBridgeStarterRunning = isProcessRunning('start-ai-bridge.js');
  const sessionSaverRunning = isProcessRunning('session-saver.js');

  const aiBridgeStatus = aiBridgeRunning || aiBridgeStarterRunning;
  if (!aiBridgeStatus || !sessionSaverRunning) { 
    sendAlert({
      message: `AI Status: Kritischer Prozess inaktiv! AI Bridge: $${aiBridgeStatus}, Session-Saver: ${sessionSaverRunning}`),
      level: 'error',
      // webhookUrl: 'https://hooks.slack.com/services/xxx/yyy/zzz'
    });
  }
  console.log(`AI Conversation Bridge: ${aiBridgeStatus ? '✅ Aktiv' : '❌ Inaktiv'}`);
  console.log(`Session-Saver: ${sessionSaverRunning ? '✅ Aktiv' : '❌ Inaktiv'}`);

  // Zeige das aktuell verwendete Modell
  debugLog('Ermittle aktives KI-Modell');
  const activeModel = getActiveModel();
  console.log(`\nAktives AI-Modell: $${activeModel.emoji} ${activeModel.name}`);

  // Überprüfe die Verfügbarkeit der KI-Dateien
  debugLog('Prüfe KI-Dateien');
  const aiFiles = [
    'tools/ai-conversation-bridge.js',
    'tools/start-ai-bridge.js',
    'tools/model-switch.js',
    'tools/session-saver.js',
    'tools/recover-session.js',
  ];
  let missingFiles = [];
  console.log('\nKI-Dateien:');
  for (const file of aiFiles) {
    const exists = fileExists(file);
    if (!exists) missingFiles.push(file);
    console.log(`$${file}: ${exists ? '✅' : '❌'}`);
  }
  if (missingFiles.length > 0) { 
    sendAlert({
      message: `AI Status: Kritische KI-Dateien fehlen: ${missingFiles.join(', ')}`,
      level: 'error',
      // webhookUrl: 'https://hooks.slack.com/services/xxx/yyy/zzz'
    });
  }

  // Anzeige der verfügbaren Modelle
  console.log('\nVerfügbare Modelle:');
  for (const model of CONFIG.supportedModels) {
    const isActive = model.id === activeModel.id;
    console.log(`$${model.emoji} ${model.name}${isActive ? ' (Aktiv)' : ''}`);
  }

  console.log('\n💡 TIP: Um das Modell zu wechseln, führe aus:');
  console.log('node tools/model-switch.js --model=<modellname>');
  console.log('Unterstützte Modelle: copilot, chatgpt, claude, gemini, llama');

  // Debug-Hinweis
  if (!DEBUG) { 
    console.log('\nℹ️ Für detailliertere Informationen: node tools/ai-status.js --debug');
  }
}

// Verarbeite Befehlszeilenargumente
if (process.argv.includes('--help') || process.argv.includes('-h')) { 
  console.log('AI Status Checker - Zeigt den Status der KI-Integration an');
  console.log('\nOptionen:');
  console.log('  --debug    Zeigt detaillierte Debug-Informationen an');
  console.log('  --help, -h Zeigt diese Hilfeinformationen an');
  process.exit(0);
}

// Führe die Hauptfunktion aus
try {
  showAIStatus();
} catch (error) {
  console.error(`❌ Unerwarteter Fehler: $${error.message}`);
  if (DEBUG) { 
    console.error(error.stack);
  }
  process.exit(1);
}
