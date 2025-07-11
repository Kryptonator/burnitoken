const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Konfiguration für die Kategorisierung
const fileCategories = {
  status: {
    patterns: [/\.json$/, /\.md$/, /\.log$/],
    paths: ['.recovery-data/', 'status/', 'tools/'],
  },
  config: {
    patterns: [/package\.json$/, /dependabot\.yml$/, /settings\.json$/, /tasks\.json$/],
  },
  core: {
    patterns: [/\.js$/],
    paths: ['tools/', '.github/'],
  },
  ignore: {
    patterns: [/\.todo$/, /\.bak$/, /tmp/],
    paths: ['.dependency-backups/', '.tmp.driveupload/'],
  },
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Führt einen Git-Befehl aus und gibt das Ergebnis zurück.
 * @param {string} command - Der auszuführende Git-Befehl.
 * @returns {string} - Die Ausgabe des Befehls.
 */
function git(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    log(`Fehler beim Ausführen von '${command}': ${error.message}`, colors.yellow);
    return '';
  }
}

/**
 * Kategorisiert eine Datei basierend auf den vordefinierten Regeln.
 * @param {string} filePath - Der Pfad zur Datei.
 * @returns {string} - Die Kategorie der Datei.
 */
function categorizeFile(filePath) {
  for (const category in fileCategories) {
    const rules = fileCategories[category];
    const inPath = !rules.paths || rules.paths.some((p) => filePath.startsWith(p));
    const matchesPattern = !rules.patterns || rules.patterns.some((p) => p.test(filePath));
    if (inPath && matchesPattern) {
      return category;
    }
  }
  return 'other';
}

/**
 * Hauptfunktion zum Managen der Git-Änderungen.
 */
function main() {
  log('🚀 Starte Smart Git Manager...', colors.magenta);

  // Zuverlässigere Methode zur Ermittlung der geänderten und neuen Dateien
  const modifiedFiles = git('git ls-files --modified');
  const untrackedFiles = git('git ls-files --others --exclude-standard');

  let allFiles = [];
  if (modifiedFiles) {
    allFiles = allFiles.concat(modifiedFiles.split('\n'));
  }
  if (untrackedFiles) {
    allFiles = allFiles.concat(untrackedFiles.split('\n'));
  }

  if (allFiles.length === 0) {
    log('✅ Keine Änderungen gefunden. Das Arbeitsverzeichnis ist sauber.', colors.green);
    return;
  }

  const files = allFiles.filter((f) => f); // Leere Zeilen entfernen
  const categorizedFiles = {
    status: [],
    config: [],
    core: [],
    ignore: [],
    other: [],
  };

  files.forEach((file) => {
    const category = categorizeFile(file);
    categorizedFiles[category].push(file);
  });

  log('\\n📊 Analyse der Änderungen:', colors.blue);
  for (const category in categorizedFiles) {
    if (categorizedFiles[category].length > 0) {
      log(
        `   - ${category.charAt(0).toUpperCase() + category.slice(1)}: ${categorizedFiles[category].length} Dateien`,
        colors.blue,
      );
    }
  }

  // Staging der Dateien
  log('\n⚙️ Bereite Commits vor (Staging)...', colors.magenta);
  const stagedGroups = [];

  ['status', 'config', 'core', 'other'].forEach((category) => {
    const filesToAdd = categorizedFiles[category];
    if (filesToAdd.length > 0) {
      log(`[${category}] Staging von ${filesToAdd.length} Dateien wird versucht...`, colors.blue);
      let successCount = 0;
      filesToAdd.forEach((file) => {
        const result = git(`git add "${file}"`);
        // git() gibt bei Fehler einen leeren String zurück
        if (result !== '') {
          successCount++;
        }
      });
      log(
        `[${category}] ${successCount} von ${filesToAdd.length} Dateien erfolgreich zum Staging hinzugefügt.`,
        colors.green,
      );
      if (successCount > 0) {
        stagedGroups.push({ group: category, count: successCount });
      }
    }
  });

  // .gitignore aktualisieren
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  let gitignoreContent = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf-8')
    : '';
  const filesToIgnore = categorizedFiles.ignore;
  let ignoreCount = 0;

  if (filesToIgnore.length > 0) {
    log(`\n📝 Aktualisiere .gitignore...`, colors.magenta);
    filesToIgnore.forEach((file) => {
      if (!gitignoreContent.includes(file)) {
        gitignoreContent += `\n# Automatisch ignoriert durch Smart Git Manager\n${file}`;
        ignoreCount++;
      }
    });
    fs.writeFileSync(gitignorePath, gitignoreContent);
    git('git add .gitignore');
    log(`${ignoreCount} neue Einträge zur .gitignore hinzugefügt und gestaged.`, colors.green);
  }

  log('\\n✅ Vorbereitung abgeschlossen.', colors.magenta);
  log('Führe jetzt `git commit` aus, um die vorbereiteten Änderungen zu committen.', colors.yellow);
}

main();
