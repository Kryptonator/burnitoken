#!/usr/bin/env node

/**
 * Session-Saver Starter Script
 * Startet den Session-Saver im Hintergrund und integriert ihn in VS Code
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Pfad zum Session-Saver
const sessionSaverPath = path.join(__dirname, 'session-saver.js');

// Pfad zur VS Code Konfiguration
const vscodeSettingsPath = path.join(__dirname, '..', '.vscode', 'settings.json');
const vscodeTasksPath = path.join(__dirname, '..', '.vscode', 'tasks.json');

/**
 * Fügt Session-Saver zu VS Code Tasks hinzu
 */
function addSessionSaverTask() {
  console.log('🔄 Füge Session-Saver Task zu VS Code hinzu...');

  try {
    // Lese bestehende tasks.json
    let tasksJson = { version: '2.0.0', tasks: [] };
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
      const tasksContent = fs.readFileSync(vscodeTasksPath, 'utf8');
      tasksJson = JSON.parse(tasksContent);
    }

    // Prüfe, ob Session-Saver Task bereits existiert
    const existingTask = tasksJson.tasks.find((task) => task.label === '🔄 Start Session-Saver');

    if (!existingTask) {
      // Füge neuen Task hinzu
      const newTask = {
        label: '🔄 Start Session-Saver',
        type: 'shell',
        command: 'node',
        args: ['tools/session-saver.js'],
        presentation: {
          reveal: 'never',
          echo: false,
          focus: false,
          panel: 'dedicated',
          close: true,
        },
        runOptions: {
          runOn: 'folderOpen',
        },
        isBackground: true,
        problemMatcher: [],
      };

      tasksJson.tasks.push(newTask);

      // Speichere aktualisierte Task-Konfiguration
      fs.writeFileSync(vscodeTasksPath, JSON.stringify(tasksJson, null, 2));

      console.log('✅ Session-Saver Task hinzugefügt');
    } else {
      console.log('✓ Session-Saver Task bereits vorhanden');
    }
  } catch (err) {
    console.error(`❌ Fehler beim Hinzufügen des Session-Saver Tasks: ${err.message}`);
  }
}

/**
 * Aktiviert automatischen Start des Session-Savers in VS Code Einstellungen
 */
function enableAutoStart() {
  console.log('🔄 Aktiviere automatischen Start des Session-Savers...');

  try {
    // Lese bestehende settings.json
    let settingsJson = {};
    if (fs.existsSync(vscodeSettingsPath)) {
      const settingsContent = fs.readFileSync(vscodeSettingsPath, 'utf8');
      settingsJson = JSON.parse(settingsContent);
    }

    // Aktiviere automatische Tasks
    settingsJson['task.allowAutomaticTasks'] = 'on';

    // Speichere aktualisierte Einstellungen
    fs.writeFileSync(vscodeSettingsPath, JSON.stringify(settingsJson, null, 2));

    console.log('✅ Automatischer Start aktiviert');
  } catch (err) {
    console.error(`❌ Fehler beim Aktivieren des automatischen Starts: ${err.message}`);
  }
}

/**
 * Startet den Session-Saver im Hintergrund
 */
function startSessionSaver() {
  console.log('🚀 Starte Session-Saver im Hintergrund...');

  try {
    // Starte Session-Saver als separaten Prozess
    const process = spawn('node', [sessionSaverPath], {
      detached: true,
      stdio: 'ignore',
    });

    // Löse den Prozess vom Elternprozess
    process.unref();

    console.log('✅ Session-Saver gestartet');
  } catch (err) {
    console.error(`❌ Fehler beim Starten des Session-Savers: ${err.message}`);
  }
}

/**
 * Hauptfunktion
 */
function main() {
  console.log('🚀 Session-Saver Initialisierung...');

  // Prüfe, ob Session-Saver existiert
  if (!fs.existsSync(sessionSaverPath)) {
    console.error(`❌ Session-Saver nicht gefunden: ${sessionSaverPath}`);
    return;
  }

  // Füge Task hinzu und aktiviere automatischen Start
  addSessionSaverTask();
  enableAutoStart();

  // Starte Session-Saver
  startSessionSaver();

  console.log('🎉 Session-Saver Setup abgeschlossen');
  console.log('💡 Der Session-Saver speichert automatisch alle 10 Sekunden Ihren Arbeitsstand');
}

// Ausführung der Hauptfunktion
main();
