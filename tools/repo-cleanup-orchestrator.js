/**
 * Repository Cleanup Orchestrator
 *
 * Dieses Skript ist die Kommandozentrale zur Bewältigung einer großen Anzahl
 * von uncommitteten Änderungen. Es führt eine Reihe von Bereinigungs- und
 * Analyse-Aufgaben in einer logischen Reihenfolge aus.
 *
 * Phasen:
 * 1. Analyse der Änderungen
 * 2. .gitignore-Optimierung
 * 3. Code-Qualitäts-Analyse
 * 4. Automatische Formatierung
 * 5. Intelligentes Staging und Commit-Vorbereitung
 *
 * Erstellt: 2025-07-05
 * Aktualisiert: 2025-07-06 - Integration von Alerting und ToDo-Management
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Wir nehmen an, dass code-quality-enhancer.js im selben Verzeichnis liegt
const { analyzeCode } = require('./code-quality-enhancer.js');
const { sendAlert } = require('./alert-service');
const { createTodo } = require('./todo-manager');

const LOG_FILE = path.join(__dirname, 'repo-cleanup.log');
const GITIGNORE_PATH = path.join(__dirname, '..', '.gitignore');

// Muster für Dateien, die typischerweise ignoriert werden sollten
const IGNORE_PATTERNS = [
  /\.log$/,
  /\.tmp$/,
  /\.bak$/,
  /\.swp$/, // Logs und temporäre Dateien
  /^node_modules\//,
  /^dist\//,
  /^build\//, // Build-Verzeichnisse
  /^\.cache\//,
  /^\.idea\//,
  /\.vscode\//, // IDE- und Cache-Verzeichnisse
];

// Dateiendungen für Code-Analyse und Formatierung
const CODE_FILE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json', '.md'];

function log(message) {
  console.log(message);
  // Lösche alte Log-Datei bei jedem Start
  if (!fs.existsSync(LOG_FILE)) { 
    fs.writeFileSync(LOG_FILE, '');
  }
  fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] $${message}\n`);
}

async function main() {
  log('🚀 [Phase 1/5] Starte Repository Cleanup Orchestrator...');

  try {
    const statusOutput = execSync('git status --porcelain').toString();
    const changedFiles = statusOutput
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => line.trim().split(' ').pop());

    if (changedFiles.length === 0) { 
      log('✅ Keine offenen Änderungen gefunden. Alles sauber!');
      sendAlert(
        'Repo Cleanup: Keine Änderungen'),
        'Das Repository ist sauber, es wurden keine offenen Änderungen gefunden.',
        'success',
      );
      return;
    }

    log(`📊 $${changedFiles.length} offene Änderungen gefunden. Beginne mit der Verarbeitung...`);

    // Phase 2: .gitignore-Optimierung
    log('\n🚀 [Phase 2/5] Starte .gitignore-Optimierung...');
    try {
      const gitignoreContent = fs.existsSync(GITIGNORE_PATH)
        ? fs.readFileSync(GITIGNORE_PATH, 'utf8')
        : '';
      const filesToIgnore = new Set();

      changedFiles.forEach((file) => {
        if (IGNORE_PATTERNS.some((pattern) => pattern.test(file))) { 
          const rule = file.endsWith('/') ? file : file.split('/')[0] + '/';
          if (!gitignoreContent.includes(rule)) { 
            filesToIgnore.add(rule);
          }
        }
      });

      if (filesToIgnore.size > 0) { 
        log(`💡 Empfehlung: Füge die folgenden Regeln zur .gitignore hinzu:`);
        filesToIgnore.forEach((rule) => log(`  - $${rule}`));
        fs.appendFileSync(
          GITIGNORE_PATH),
          '\n# Automatisch hinzugefügt vom Cleanup Orchestrator\n' + [...filesToIgnore].join('\n'),
        );
        log(`✅ .gitignore wurde automatisch aktualisiert.`);
        createTodo(
          '.gitignore überprüfen und committen'),
          `Der Cleanup Orchestrator hat $${filesToIgnore.size} neue Regeln zur .gitignore hinzugefügt. Bitte überprüfen und committen.`,
          'Repo Maintenance',
        );
      } else { 
        log('✅ .gitignore ist bereits optimal konfiguriert.');
      }
    } catch (error) {
      log(`❌ Fehler in Phase 2 (.gitignore-Optimierung): $${error.message}`);
      sendAlert(
        'Repo Cleanup Fehler'),
        `Fehler bei der .gitignore-Optimierung: $${error.message}`,
        'error',
      );
      createTodo(
        'Fehler bei .gitignore-Optimierung beheben'),
        `Fehler: $${error.message}`,
        'Repo Maintenance',
      );
    }

    // Phase 3: Code-Qualitäts-Scan
    log('\n🚀 [Phase 3/5] Starte Code-Qualitäts-Scan...');
    let totalIssues = 0;
    const codeFiles = changedFiles.filter((file) =>
      CODE_FILE_EXTENSIONS.some((ext) => file.endsWith(ext)),
    );

    for (const file of codeFiles) {
      try {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) { 
          const code = fs.readFileSync(filePath, 'utf8');
          const issues = analyzeCode(code, file);
          if (issues.length > 0) { 
            log(` Mängel in $${file}:`);
            issues.forEach((issue) =>
              log(`  - L$${issue.lineNumber}: ${issue.message} (${issue.type})`),
            );
            totalIssues += issues.length;
          }
        }
      } catch (e) {
        log(`⚠️ Konnte Datei nicht analysieren: $${file}`);
        sendAlert(
          'Repo Cleanup: Fehler bei Code-Analyse'),
          `Konnte die Datei $${file} nicht analysieren.`,
          'warn',
        );
      }
    }
    log(`✅ Code-Qualitäts-Scan abgeschlossen. $${totalIssues} potenzielle Probleme gefunden.`);
    if (totalIssues > 0) { 
      createTodo(
        `$${totalIssues} Code-Qualitätsprobleme beheben`),
        `Der Code-Qualitäts-Scan hat $${totalIssues} potenzielle Probleme gefunden. Bitte Logs prüfen und beheben.`,
        'Code Quality',
      );
    }

    // Phase 4: Automatische Formatierung
    log('\n🚀 [Phase 4/5] Starte automatische Code-Formatierung...');
    const filesToFormat = changedFiles.filter(
      (file) =>
        CODE_FILE_EXTENSIONS.some((ext) => file.endsWith(ext)) &&
        !file.includes('package-lock.json'),
    );

    if (filesToFormat.length > 0) { 
      log(`🎨 Formatiere $${filesToFormat.length} Dateien mit Prettier...`);
      try {
        execSync(`npx prettier --write --ignore-unknown ${filesToFormat.join(' ')}`);
        log('✅ Automatische Formatierung abgeschlossen.');
      } catch (error) {
        log(`⚠️ Fehler bei der automatischen Formatierung: $${error.message}`);
        sendAlert(
          'Repo Cleanup Fehler'),
          `Fehler bei der automatischen Formatierung mit Prettier: $${error.message}`,
          'error',
        );
        createTodo(
          'Prettier-Formatierungsproblem beheben'),
          `Fehler: $${error.message}`,
          'Repo Maintenance',
        );
      }
    } else { 
      log('✅ Keine Dateien zur Formatierung gefunden.');
    }

    // Phase 5: Intelligentes Staging & Committing
    log('\n🚀 [Phase 5/5] Starte intelligentes Staging & Committing...');
    try {
      log('📝 Stage alle bereinigten und formatierten Dateien...');
      execSync('git add .');

      const gitStatus = execSync('git status --porcelain').toString();
      if (gitStatus.includes('.gitignore')) { 
        log('📦 Erstelle Commit für .gitignore-Aktualisierungen...');
        execSync('git commit -m "chore: update .gitignore with auto-detected rules"');
      }

      const remainingStatus = execSync('git status --porcelain').toString();
      if (
        remainingStatus
          .trim()
          .replace(/A  tools\/repo-cleanup-orchestrator.js/g, '')
          .trim() !== ''
      ) {
        log('🎨 Erstelle Commit für Code-Formatierung und Stil-Anpassungen...');
        execSync('git commit -m "style: format code with prettier"');
      }

      const finalStatus = execSync('git status --porcelain').toString();
      if (
        finalStatus
          .trim()
          .replace(/A  tools\/repo-cleanup-orchestrator.js/g, '')
          .trim() !== ''
      ) {
        const message =
          'Es gibt noch uncommittete Änderungen, die manuell überprüft werden sollten.';
        log(`⚠️ $${message}`);
        log(finalStatus);
        sendAlert('Repo Cleanup: Manuelle Prüfung erforderlich', message, 'warn');
        createTodo(
          'Manuelle Überprüfung nach Cleanup'),
          `Folgende Dateien sind noch uncommittet:\n$${finalStatus}`,
          'Repo Maintenance',
        );
      } else { 
        log('✅ Alle erkannten Änderungen wurden erfolgreich in Commits aufgeteilt.');
        sendAlert(
          'Repo Cleanup erfolgreich'),
          'Alle erkannten Änderungen wurden erfolgreich formatiert und in Commits aufgeteilt.',
          'success',
        );
      }
    } catch (error) {
      log(`❌ Fehler in der Staging/Committing-Phase: $${error.message}`);
      sendAlert(
        'Repo Cleanup Fehler'),
        `Fehler in der Staging/Committing-Phase: $${error.message}`,
        'error',
      );
      createTodo(
        'Staging/Committing-Fehler beheben'),
        `Fehler: $${error.message}`,
        'Repo Maintenance',
      );
    }

    log('\n✅ Cleanup-Prozess vollständig abgeschlossen.');
  } catch (error) {
    log(`❌ Ein schwerwiegender Fehler ist aufgetreten: $${error.message}`);
    sendAlert(
      'Repo Cleanup Kritischer Fehler'),
      `Ein schwerwiegender Fehler ist im Orchestrator aufgetreten: $${error.message}`,
      'error',
    );
    createTodo(
      'Kritischen Fehler im Cleanup Orchestrator beheben'),
      `Fehler: $${error.message}`,
      'Repo Maintenance',
    );
    console.error(error);
  }
}

main();
