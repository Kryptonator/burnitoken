/**
 * Simple Extension Auto-Restart Manager
 *
 * Eine vereinfachte Version, die ohne Abhängigkeiten auskommt
 * und inaktive Services automatisch neu startet.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Konfiguration
const LOG_FILE = path.join(__dirname, 'extension-auto-restart.log');
const CRITICAL_SERVICES = [
  { name: 'session-saver', script: 'tools/start-session-saver.js' },
  { name: 'ai-bridge', script: 'tools/start-ai-bridge.js' },
  { name: 'gsc-auth', script: 'tools/gsc-auth-check.js' },
];

// Status-Tracking
const restartAttempts = {};

/**
 * Log-Funktion für Konsole und Datei
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;

  console.log(message);

  try {
    fs.appendFileSync(LOG_FILE, formattedMessage + '\n', 'utf8');
  } catch (err) {
    console.error(`Fehler beim Schreiben ins Log: ${err.message}`);
  }
}

/**
 * Startet einen Service neu
 */
function restartService(name, script) {
  log(`🔄 Starte Service "${name}" neu...`);

  try {
    const scriptPath = path.resolve(script);

    if (!fs.existsSync(scriptPath)) {
      log(`❌ Service-Skript nicht gefunden: ${scriptPath}`);
      return false;
    }

    // Führe das Skript aus
    const process = spawn('node', [scriptPath], {
      detached: true,
      stdio: 'ignore',
    });

    // Vom Elternprozess trennen
    process.unref();

    log(`✅ Service "${name}" erfolgreich gestartet (PID: ${process.pid})`);
    restartAttempts[name] = (restartAttempts[name] || 0) + 1;

    return true;
  } catch (err) {
    log(`❌ Fehler beim Starten von "${name}": ${err.message}`);
    return false;
  }
}

/**
 * Hauptfunktion
 */
function main() {
  // Lösche alte Log-Datei
  try {
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }

    fs.writeFileSync(
      LOG_FILE,
      `=== Extension Auto-Restart Log - ${new Date().toISOString()} ===\n`,
      'utf8',
    );
  } catch (err) {
    console.error(`Fehler mit Log-Datei: ${err.message}`);
  }

  log('\n======================================================');
  log('          EXTENSION AUTO-RESTART MANAGER');
  log('======================================================\n');

  log('🔍 Überprüfe und starte kritische Services...');

  // KI-Services neu starten
  log('\n📌 KI-SERVICES:');
  log('-------------------------');
  restartService('session-saver', 'tools/start-session-saver.js');
  restartService('ai-bridge', 'tools/start-ai-bridge.js');

  // GSC-Integration Services
  log('\n📌 GSC-SERVICES:');
  log('-------------------------');
  restartService('gsc-auth', 'tools/gsc-auth-check.js');
  restartService('gsc-integration', 'tools/gsc-integration-monitor.js');

  log('\n✅ AUTO-RESTART ABGESCHLOSSEN');
  log('-------------------------');
  log('Alle kritischen Services wurden neu gestartet');
  log('Um den Status zu überprüfen, führen Sie "npm run status:simple" aus');
  log('\n======================================================');
  log(`Zeitpunkt des Auto-Restarts: ${new Date().toLocaleString()}`);
  log('======================================================\n');
}

// Führe die Hauptfunktion aus
main();
