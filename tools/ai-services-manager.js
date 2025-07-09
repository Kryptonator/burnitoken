#!/usr/bin/env node

/**
 * AI Services Manager
 * Startet oder neustartet alle KI-Services (AI Bridge und Session-Saver)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Service-Konfiguration
const SERVICES = [
  {
    name: 'Session-Saver',
    script: path.join(__dirname, 'session-saver.js'),
    emoji: '💾',
  },
  {
    name: 'AI Conversation Bridge',
    script: path.join(__dirname, 'start-ai-bridge.js'),
    emoji: '🧠',
  },
];

/**
 * Beendet einen laufenden Prozess
 * (Dies ist eine Vereinfachung - in einer echten Implementierung
 * würde man die PIDs besser verwalten)
 */
function killProcess(name) {
  try {
    if (process.platform === 'win32') {
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      {
      }
      spawn('powershell', ['-Command', `Stop-Process -Name "*node*" -Force`], { stdio: 'ignore' });
    } else {
      spawn('pkill', ['-f', name], { stdio: 'ignore' });
    }
    return true;
  } catch (error) {
    console.log(`⚠️ Konnte ${name} nicht beenden: ${error.message}`);
    return false;
  }
}

/**
 * Startet einen Service im Hintergrund
 */
function startService(service) {
  console.log(`${service.emoji} Starte ${service.name}...`);

  // Prüfe, ob die Skriptdatei existiert
  if (!fs.existsSync(service.script)) {
    console.error(`❌ Skript nicht gefunden: ${service.script}`);
    return false;
  }

  try {
    // Starte den Service als separaten Prozess
    const process = spawn('node', [service.script], {
      detached: true,
      stdio: 'ignore',
    });

    // Löse den Prozess vom Elternprozess
    process.unref();

    console.log(`✅ ${service.name} gestartet`);
    return true;
  } catch (error) {
    console.error(`❌ Fehler beim Starten von ${service.name}: ${error.message}`);
    return false;
  }
}

/**
 * Startet alle KI-Services
 */
function startAllServices() {
  console.log('🚀 Starte alle KI-Services...');

  let success = true;
  for (const service of SERVICES) {
    if (!startService(service)) {
      success = false;
    }
  }

  if (success) {
    console.log('\n✅ Alle KI-Services wurden erfolgreich gestartet!');
    console.log('\n💡 Tipp: Führe aus, um Status zu prüfen:');
    console.log('node tools/ai-status.js');
  } else {
    console.error('\n⚠️ Einige Services konnten nicht gestartet werden.');
  }
}

/**
 * Führt einen Neustart aller KI-Services durch
 */
function restartAllServices() {
  console.log('🔄 Neustart aller KI-Services...');

  // Beende zuerst alle laufenden Services
  console.log('⏹️ Beende laufende Services...');

  for (const service of SERVICES) {
    killProcess(path.basename(service.script));
  }

  // Kurze Pause, um sicherzustellen, dass alle Prozesse beendet sind
  console.log('⌛ Warte auf Prozessbeendigung...');
  setTimeout(() => {
    // Starte alle Services neu
    startAllServices();
  }, 2000);
}

// Verarbeite Kommandozeilenargumente
const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === 'restart') {
  restartAllServices();
} else {
  startAllServices();
}
