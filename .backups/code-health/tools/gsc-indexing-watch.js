/**
 * Google Search Console - Indexierungs-Watcher
 * Kontinuierliche Überwachung von HTML-Dateien auf unerwünschte noindex-Tags
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const SCAN_INTERVAL_MS = 5 * 60 * 1000; // 5 Minuten
const HTML_EXTENSIONS = ['.html', '.htm'];
const LOG_FILE = path.join(__dirname, 'gsc-indexing-watch.log');
let isFirstRun = true;

// Logger
] ${message}\n`;

  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Überwachte Dateien finden
function findHtmlFiles() {
  const htmlFiles = [];

  function scanDir(dir) {
    try {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);

        try {
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'vendor') {
              scanDir(fullPath);
            }
          } else if (HTML_EXTENSIONS.includes(path.extname(entry).toLowerCase())) {
            htmlFiles.push(fullPath);
          }
        } catch (err) {
          log(`Fehler beim Prüfen von ${fullPath}: ${err.message}`);
        }
      }
    } catch (err) {
      log(`Fehler beim Scannen von Verzeichnis ${dir}: ${err.message}`);
    }
  }

  scanDir(path.resolve(__dirname, '..'));
  return htmlFiles;
}

// Nach noindex-Tags suchen
function checkForNoindexTags() {
  const htmlFiles = findHtmlFiles();
  const problemFiles = [];

  for (const file of htmlFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.match(/<meta[^>]*noindex/i)) {
        problemFiles.push({
          file,
          tag: content.match(/<meta[^>]*noindex[^>]*>/i)[0],
        });
      }
    } catch (err) {
      log(`Fehler beim Lesen von ${file}: ${err.message}`);
    }
  }

  return problemFiles;
}

// Probleme beheben
function fixNoindexTags(problemFiles) {
  if (problemFiles.length === 0) {
    return;
  }

  log(`⚠️ ${problemFiles.length} Dateien mit noindex-Tags gefunden!`);

  for (const problem of problemFiles) {
    log(`   - ${problem.file}: ${problem.tag}`);

    try {
      let content = fs.readFileSync(problem.file, 'utf8');
      content = content.replace(/<meta[^>]*noindex[^>]*>/i, '<!-- INDEXIERUNG AKTIVIERT -->');
      fs.writeFileSync(problem.file, content, 'utf8');
      log(`✅ Fix angewendet auf: ${problem.file}`);

      // Git-Commit für die Änderung erstellen
      try {
        execSync(`git add "${problem.file}"`, { stdio: 'pipe' });
        execSync(`git commit -m "Fix: noindex-Tag aus ${path.basename(problem.file)} entfernt"`, {
          stdio: 'pipe',
        });
        log(`✓ Git-Commit für ${path.basename(problem.file)} erstellt`);
      } catch (gitErr) {
        log(
          `Hinweis: Git-Commit für ${path.basename(problem.file)} nicht möglich: ${gitErr.message}`,
        );
      }
    } catch (err) {
      log(`❌ Fehler beim Reparieren von ${problem.file}: ${err.message}`);
    }
  }
}

// Hauptfunktion
function runIndexingCheck() {
  const startTime = new Date();

  if (isFirstRun) {
    log('🔍 GSC Indexierungs-Watcher gestartet');
    log(`🕒 Scanzyklus: Alle ${SCAN_INTERVAL_MS / 60000} Minuten`);
    isFirstRun = false;
  } else {
    log('🔄 Führe erneuten Indexierungs-Check durch...');
  }

  const problems = checkForNoindexTags();

  if (problems.length > 0) {
    fixNoindexTags(problems);
    log('⚠️ Probleme gefunden und behoben. Bitte überprüfen Sie die Google Search Console.');
  } else {
    log(
      '✓ Keine Indexierungsprobleme gefunden. Alle HTML-Dateien sind für die Indexierung optimiert.',
    );
  }

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  log(
    `✓ Scan abgeschlossen (${duration.toFixed(2)}s). Nächster Scan in ${SCAN_INTERVAL_MS / 60000} Minuten.`,
  );
}

// Initial ausführen
runIndexingCheck();

// Regelmäßig erneut ausführen
setInterval(runIndexingCheck, SCAN_INTERVAL_MS);

// Prozess-Events behandeln
process.on('SIGINT', () => {
  log('🛑 GSC Indexierungs-Watcher wird beendet...');
  process.exit(0);
});

log('⏱️ GSC Indexierungs-Watcher läuft im Hintergrund. Beenden mit Strg+C.');
