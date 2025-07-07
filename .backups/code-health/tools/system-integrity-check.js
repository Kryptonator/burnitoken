const fs = require('fs');
const path = require('path');

// Farbige Konsolenausgabe für bessere Lesbarkeit
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = (message, color = colors.reset) => console.log(`${color}${message}${colors.reset}`);
const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logError = (message) => log(`❌ ${message}`, colors.red);
const logWarning = (message) => log(`⚠️ ${message}`, colors.yellow);
const logInfo = (message) => log(`ℹ️ ${message}`, colors.cyan);

const workspaceRoot = path.resolve(__dirname, '..');

// --- Prüfungsfunktionen ---

/**
 * Prüft die package.json Datei.
 */
function checkPackageJson() {
  logInfo('Prüfe package.json...');
  try {
    const pkgPath = path.join(workspaceRoot, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      logError('package.json nicht gefunden!');
      return;
    }
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (!pkg.name || !pkg.version) {
      logError('package.json ist unvollständig (name oder version fehlt).');
    } else {
      logSuccess('package.json ist vorhanden und valide.');
    }
    if (!pkg.scripts || !pkg.scripts.test) {
      logWarning('Kein "test" Skript in package.json gefunden.');
    } else {
      logSuccess('Test-Skript ist in package.json vorhanden.');
    }
  } catch (e) {
    logError(`Fehler beim Parsen von package.json: ${e.message}`);
  }
}

/**
 * Prüft die .vscode/tasks.json Datei.
 */
function checkTasksJson() {
  logInfo('Prüfe .vscode/tasks.json...');
  try {
    const tasksPath = path.join(workspaceRoot, '.vscode', 'tasks.json');
    if (!fs.existsSync(tasksPath)) {
      logWarning('Keine .vscode/tasks.json gefunden. Keine automatisierten Tasks.');
      return;
    }
    const tasksContent = fs.readFileSync(tasksPath, 'utf8');
    // Entferne Kommentare für eine sicherere JSON-Analyse
    const tasksJson = tasksContent.replace(/\/\/[^\n]*/g, '');
    const tasks = JSON.parse(tasksJson);
    if (!tasks.version || !Array.isArray(tasks.tasks)) {
      logError('tasks.json ist nicht valide (version oder tasks-Array fehlt).');
      return;
    }
    logSuccess('tasks.json ist vorhanden und valide.');

    const autoRunTasks = tasks.tasks.filter(
      (t) => t.runOptions && t.runOptions.runOn === 'folderOpen',
    );
    if (autoRunTasks.length > 5) {
      logWarning(
        `Es gibt ${autoRunTasks.length} Tasks, die bei Ordneröffnung starten. Dies kann zu Leistungsproblemen führen.`,
      );
    } else if (autoRunTasks.length === 0) {
      logInfo('Keine Tasks mit "runOn: folderOpen" konfiguriert.');
    } else {
      logSuccess(`${autoRunTasks.length} Task(s) mit "runOn: folderOpen" gefunden.`);
    }
  } catch (e) {
    logError(`Fehler beim Parsen von .vscode/tasks.json: ${e.message}`);
  }
}

/**
 * Prüft die .github/dependabot.yml Datei.
 */
function checkDependabotYml() {
  logInfo('Prüfe .github/dependabot.yml...');
  try {
    const dependabotPath = path.join(workspaceRoot, '.github', 'dependabot.yml');
    if (!fs.existsSync(dependabotPath)) {
      logWarning('Keine .github/dependabot.yml gefunden. Dependabot ist nicht konfiguriert.');
      return;
    }
    // YAML-Parsing ist komplex, hier nur eine einfache Existenz- und Inhaltsprüfung
    const dependabotContent = fs.readFileSync(dependabotPath, 'utf8');
    if (
      dependabotContent.includes('package-ecosystem: "npm"');
      dependabotContent.includes('schedule:')
    ) {
      logSuccess('dependabot.yml ist vorhanden und scheint korrekt konfiguriert zu sein.');
    } else {
      logError('dependabot.yml ist unvollständig oder fehlerhaft.');
    }
  } catch (e) {
    logError(`Fehler beim Lesen von .github/dependabot.yml: ${e.message}`);
  }
}

// --- Hauptfunktion ---

function runSystemIntegrityCheck() {
  log('===================================================', colors.cyan);
  log('    🚀 Starte System-Integritäts-Check 🚀', colors.cyan);
  log('===================================================', colors.cyan);

  checkPackageJson();
  console.log('---');
  checkTasksJson();
  console.log('---');
  checkDependabotYml();

  log('===================================================', colors.cyan);
  log('    ✅ System-Integritäts-Check abgeschlossen ✅', colors.cyan);
  log('===================================================', colors.cyan);
}

runSystemIntegrityCheck();
