// tools/master-task-runner.js
/**
 * Master Task Runner
 *
 * Führt eine Reihe von vordefinierten Skripten und Befehlen in einer
 * kontrollierten Reihenfolge aus, um eine Überlastung des Systems zu vermeiden.
 * Dies ist der zentrale Einstiegspunkt für alle automatisierten Start-Tasks.
 *
 * Erstellt: 2025-06-28
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// --- Konfiguration der auszuführenden Tasks ---
// Hier definieren wir, welche Skripte in welcher Reihenfolge laufen sollen.
// Jede Stufe wird nacheinander abgearbeitet.
const TASK_STAGES = [
  {
    name: 'Stufe 1: Kritische Validatoren',
    tasks: [
      {
        name: 'Extension-Funktionen validieren',
        command: 'node extension-function-validator.js',
        required: true,
      },
      {
        name: 'GSC Authentifizierung prüfen',
        command: 'node tools/gsc-auth-check.js',
        required: true,
      },
    ],
  },
  {
    name: 'Stufe 2: Hintergrund-Services starten',
    tasks: [
      { name: 'Session Saver starten', command: 'node tools/session-saver.js', required: false },
      {
        name: 'AI Conversation Bridge starten',
        command: 'node tools/start-ai-bridge.js',
        required: false,
      },
    ],
  },
  {
    name: 'Stufe 3: Status- und Management-Tools',
    tasks: [
      {
        name: 'Unified Status Manager ausführen',
        command: 'node tools/unified-status-manager.js --silent',
        required: false,
      },
      {
        name: 'Extension Orchestrator ausführen',
        command: 'node master-extension-orchestrator.js',
        required: false,
      },
    ],
  },
];

// --- Ausführungs-Logik ---
async function runTasks() {
  console.log('🚀 Master Task Runner gestartet...');
  console.log('------------------------------------');

  for (const stage of TASK_STAGES) {
    console.log(`
▶️ Führe aus: $${stage.name}`);
    for (const task of stage.tasks) {
      try {
        console.log(`  -> Starte Task: $${task.name}...`);
        const { stdout, stderr } = await execPromise(task.command);
        if (stderr && task.required) 
          // Wenn ein erforderlicher Task einen Fehler im stderr hat, abbrechen.
          throw new Error(stderr);
        }
        console.log(`  ✅ Task erfolgreich beendet: $${task.name}`);
      } catch (error) {
        console.error(`  ❌ FEHLER beim Task "$${task.name}":`, error.message);
        if (task.required) { 
          console.error('Abbruch, da ein kritischer Task fehlgeschlagen ist.');
          return; // Beendet die gesamte Ausführung
        }
      }
    }
  }

  console.log('------------------------------------');
  console.log('🎉 Master Task Runner hat alle Stufen abgeschlossen.');
}

runTasks();
