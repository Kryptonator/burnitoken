/**
 * Extension Task Validator
 * Überprüft und korrigiert VS Code Task-Konfigurationen für Extension-Management
 */

const fs = require('fs');
const path = require('path');

// Pfade für Konfigurationsdateien
const TASKS_PATH = path.join('.vscode', 'tasks.json');
const SETTINGS_PATH = path.join('.vscode', 'settings.json');

// Erwartete Task-Namen
const EXPECTED_TASKS = [
  'Extension Health Check',
  'Extension Management Full Run',
  'Extension Configuration Update',
  '🚀 Complete Extension Optimization',
];

/**
 * Liest eine JSON-Datei
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
    console.error(`Fehler beim Lesen von ${filePath}:`, err.message);
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
    console.error(`Fehler beim Schreiben von ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Validiere und repariere Tasks
 */
function validateAndRepairTasks() {
  console.log('🔍 Prüfe Tasks für Extension-Management...');

  const tasksJson = readJsonFile(TASKS_PATH);
  if (!tasksJson) {
    console.error('❌ tasks.json fehlt oder ist beschädigt.');
    return false;
  }

  let updated = false;
  const taskMap = new Map();

  // Erstelle Map von Task-Labels
  tasksJson.tasks.forEach((task) => {
    taskMap.set(task.label, task);
  });

  // Prüfe auf fehlende Tasks
  for (const expectedTask of EXPECTED_TASKS) {
    if (!taskMap.has(expectedTask)) {
      console.warn(`⚠️ Fehlende Task: ${expectedTask}`);

      // Füge fehlende Task hinzu basierend auf Art
      if (expectedTask === 'Extension Health Check') {
        tasksJson.tasks.push({
          label: 'Extension Health Check',
          type: 'shell',
          command: 'node',
          args: ['extension-function-validator.js'],
          group: 'test',
          presentation: {
            echo: true,
            reveal: 'always',
            focus: false,
            panel: 'shared',
          },
          problemMatcher: [],
        });
        updated = true;
      } else if (expectedTask === 'Extension Management Full Run') {
        tasksJson.tasks.push({
          label: 'Extension Management Full Run',
          type: 'shell',
          command: 'node',
          args: ['master-extension-orchestrator.js'],
          group: 'build',
          presentation: {
            echo: true,
            reveal: 'always',
            focus: false,
            panel: 'shared',
          },
          problemMatcher: [],
        });
        updated = true;
      } else if (expectedTask === 'Extension Configuration Update') {
        tasksJson.tasks.push({
          label: 'Extension Configuration Update',
          type: 'shell',
          command: 'node',
          args: ['advanced-extension-manager.js'],
          group: 'build',
          presentation: {
            echo: true,
            reveal: 'always',
            focus: false,
            panel: 'shared',
          },
          problemMatcher: [],
        });
        updated = true;
      } else if (expectedTask === '🚀 Complete Extension Optimization') {
        tasksJson.tasks.push({
          label: '🚀 Complete Extension Optimization',
          type: 'shell',
          command: 'powershell',
          args: [
            '-Command',
            "Write-Host '🔍 Starting Full Extension Optimization...' -ForegroundColor Cyan; node extension-function-validator.js && node advanced-extension-manager.js && node master-extension-orchestrator.js && Write-Host '✅ Extension Optimization Complete!' -ForegroundColor Green",
          ],
          group: {
            kind: 'build',
            isDefault: true,
          },
          presentation: {
            echo: true,
            reveal: 'always',
            focus: true,
            panel: 'new',
            clear: true,
          },
          problemMatcher: [],
        });
        updated = true;
      }
    }
  }

  // Speichere aktualisierte Tasks
  if (updated) {
    if (writeJsonFile(TASKS_PATH, tasksJson)) {
      console.log('✅ tasks.json für Extension-Management aktualisiert');
    }
  } else {
    console.log('✓ Alle erwarteten Tasks sind korrekt konfiguriert');
  }

  return true;
}

/**
 * Validiere und repariere Settings
 */
function validateAndRepairSettings() {
  console.log('🔍 Prüfe Settings für Extension-Management...');

  const settings = readJsonFile(SETTINGS_PATH);
  if (!settings) {
    console.error('❌ settings.json fehlt oder ist beschädigt.');
    return false;
  }

  let updated = false;

  // Prüfe und korrigiere Auto-Update Einstellung
  if (settings['extensions.autoUpdate'] === false) {
    settings['extensions.autoUpdate'] = true;
    updated = true;
    console.warn('⚠️ Automatische Extension-Updates waren deaktiviert - aktiviert');
  }

  // Prüfe und korrigiere automatische Tasks
  if (settings['task.allowAutomaticTasks'] !== 'on') {
    settings['task.allowAutomaticTasks'] = 'on';
    updated = true;
    console.warn('⚠️ Automatische Tasks waren deaktiviert - aktiviert');
  }

  // Speichere aktualisierte Settings
  if (updated) {
    if (writeJsonFile(SETTINGS_PATH, settings)) {
      console.log('✅ settings.json für Extension-Management aktualisiert');
    }
  } else {
    console.log('✓ Alle erwarteten Settings sind korrekt konfiguriert');
  }

  return true;
}

// Hauptfunktion
function main() {
  console.log('🚀 Starte Extension Task Validator...');

  const tasksValid = validateAndRepairTasks();
  const settingsValid = validateAndRepairSettings();

  if (tasksValid && settingsValid) {
    console.log('🎉 Extension Task Validation abgeschlossen - Alles OK!');
  } else {
    console.warn(
      '⚠️ Extension Task Validation abgeschlossen - Einige Probleme konnten nicht behoben werden',
    );
  }
}

// Führe die Hauptfunktion aus
main();
