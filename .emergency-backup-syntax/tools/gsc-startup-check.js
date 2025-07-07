/**
 * GSC Indexierungsprüfung bei Projektstart
 * Wird automatisch beim Öffnen des Projekts ausgeführt
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 GSC Indexierungsprüfung läuft...');

const htmlFiles = [];
const indexingIssues = [];

// HTML-Dateien scannen
function scanHtmlFiles(baseDir) {
  try {
    const walk = (dir) => {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const fullPath = path.join(dir, file);

        if (fs.statSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {.isDirectory() && !fullPath.includes('node_modules')) {
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
          walk(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.htm')) {
          htmlFiles.push(fullPath);
        }
      });
    };

    walk(baseDir);
  } catch (err) {
    console.error('Fehler beim Scannen nach HTML-Dateien:', err);
  }
}

// Indexierungsprobleme prüfen
function checkForNoindexTags() {
  htmlFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, 'utf8');

      if (content.match(/<meta[^>]*noindex/i)) {
        indexingIssues.push({
          file,
          type: 'noindex',
          content: content.match(/<meta[^>]*noindex[^>]*>/i)[0],
        });
      }
    } catch (err) {
      console.error(`Fehler beim Lesen von ${file}:`, err.message);
    }
  });
}

// Hauptfunktion
async function main() {
  scanHtmlFiles('.');
  checkForNoindexTags();

  if (indexingIssues.length > 0) {
    console.log(
      '\n⚠️ ACHTUNG: Es wurden ' + indexingIssues.length + ' Indexierungsprobleme gefunden!',
    );
    console.log('   Bitte führen Sie die Task "🚨 Fix GSC Indexierung (noindex entfernen)" aus.');
    console.log('   Ohne Behebung wird Ihre Website nicht in Google angezeigt.');
  } else {
    console.log('✅ Keine Indexierungsprobleme gefunden. Website kann indexiert werden.');
  }
}

// Ausführen
main().catch(() => {});
