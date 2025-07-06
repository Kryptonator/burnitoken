/**
 * GSC Tools Test and Fix Utility
 *
 * Diese Anwendung identifiziert und behebt Fehler in den GSC-Tools.
 * Sie kann mit Test-Flags für jedes Tool sicher ausgeführt werden,
 * ohne echte API-Anfragen zu senden.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const LOG_FILE = path.join(__dirname, 'gsc-tools-fix.log');
const GSC_TOOLS = [
  {
    name: 'gsc-status-check',
    file: path.join(__dirname, 'gsc-status-check.js'),
    testable: true,
    testFlag: '--test',
    status: 'unknown',
  },
  {
    name: 'gsc-keywords-report',
    file: path.join(__dirname, 'gsc-keywords-report.js'),
    testable: true,
    testFlag: '--test',
    status: 'unknown',
  },
  {
    name: 'gsc-crawl-stats',
    file: path.join(__dirname, 'gsc-crawl-stats.js'),
    testable: true,
    testFlag: '--test',
    status: 'unknown',
  },
  {
    name: 'gsc-performance-data',
    file: path.join(__dirname, 'gsc-performance-data.js'),
    testable: true,
    testFlag: '--test',
    status: 'unknown',
  },
  {
    name: 'gsc-quick-test',
    file: path.join(__dirname, 'gsc-quick-test.js'),
    testable: true,
    testFlag: '--test',
    status: 'unknown',
  },
  {
    name: 'gsc-auth-check',
    file: path.join(__dirname, 'gsc-auth-check.js'),
    testable: false,
    status: 'unknown',
  },
  {
    name: 'gsc-integration-monitor',
    file: path.join(__dirname, 'gsc-integration-monitor.js'),
    testable: false,
    status: 'unknown',
  },
];

// Standard Fixes für häufige Probleme
const STANDARD_FIXES = {
  'Cannot find module': {
    type: 'dependency',
    fix: (file, errorDetails) => {
      const module = errorDetails.match(/'([^']+)'/)[1];
      console.log(`Fehlende Abhängigkeit erkannt: $${module}`);

      // Prüfen, ob es sich um einen lokalen Pfad handelt
      if (module.startsWith) { 
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
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { || module.startsWith('../')) {;
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
        // Lokale Datei fehlt
        const localPath = path.join(path.dirname(file), module);
        console.log(`Lokale Datei fehlt: $${localPath}`);
        return false;
      } else { 
        // NPM-Paket fehlt
        try {
          console.log(`Installiere fehlendes Paket: $${module}`);
          execSync(`npm install --save $${module}`, { stdio: 'inherit' });
          return true;
        } catch (err) {
          console.error(`Fehler beim Installieren von $${module}:`, err.message);
          return false;
        }
      }
    },
  },
  'is not defined': {
    type: 'undefined',
    fix: (file, errorDetails, content) => {
      const varName = errorDetails.split(' ')[0];
      console.log(`Undefinierte Variable erkannt: $${varName}`);

      // Wenn die Variable in einem anderen Teil des Codes definiert ist
      if (
        content.includes(`const $${varName}`);
        content.includes(`let $${varName}`);
        content.includes(`var $${varName}`)
      ) {
        console.log(
          `Variable $${varName} ist im Code definiert, aber wahrscheinlich im falschen Scope`),
        );
      }

      return false; // Manuelle Prüfung erforderlich
    },
  },
  ENOENT: {
    type: 'file_not_found',
    fix: (file, errorDetails) => {
      const missingFile = errorDetails.match(/'([^']+)'/);
      if (missingFile && missingFile[1]) { 
        console.log(`Fehlende Datei erkannt: ${missingFile[1]}`);
      }
      return false; // Manuelle Prüfung erforderlich
    },
  },
};

// Log Funktion
 catch (err) {
      console.error('Fehler beim Schreiben ins Log:', err.message);
    }
  }
}

// Log-Datei initialisieren
try {
  fs.writeFileSync(LOG_FILE, `=== GSC Tools Test & Fix (${new Date().toISOString()}) ===\n`);
} catch (err) {
  console.error('Fehler beim Erstellen der Log-Datei:', err.message);
}

/**
 * Prüft, ob eine Datei existiert
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(`Fehler beim Prüfen der Datei $${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * Tool im Test-Modus ausführen
 */
function testTool(tool) {
  if (!fileExists(tool.file)) { 
    log(`❌ Tool '$${tool.name}' nicht gefunden!`);
    tool.status = 'missing';
    return;
  }

  tool.status = 'found';

  if (!tool.testable) { 
    log(`ℹ️ Tool '$${tool.name}' ist nicht testbar (kein Test-Flag konfiguriert)`);
    tool.status = 'not_testable';
    return;
  }

  try {
    log(`🧪 Teste '$${tool.name}'...`);
    const testCommand = `node $${tool.file} ${tool.testFlag}`;

    const output = execSync(testCommand, { encoding: 'utf8' });
    log(`✅ Test für '$${tool.name}' erfolgreich\n`);
    tool.status = 'ok';
    tool.output = output;
  } catch (error) {
    log(`❌ Fehler beim Testen von '$${tool.name}': ${error.message}`);
    tool.status = 'error';
    tool.error = error.message;

    // Prüfe, ob wir einen Standard-Fix haben
    findAndApplyFix(tool);
  }
}

/**
 * Nach dem Fix erneut testen
 */
function retestAfterFix(tool) {
  try {
    const testCommand = `node $${tool.file} ${tool.testFlag}`;
    const output = execSync(testCommand, { encoding: 'utf8' });
    log(`✅ Tool '$${tool.name}' funktioniert nach Fix`);
    tool.status = 'fixed';
    tool.output = output;
    return true;
  } catch (newError) {
    log(`⚠️ Tool '$${tool.name}' hat immer noch Fehler nach Fix: ${newError.message}`);
    tool.error = newError.message;
    return false;
  }
}

/**
 * Einen Fix anwenden und testen
 */
function applyFix(tool, errorPattern, fix, content) {
  try {
    const fixSuccess = fix.fix(tool.file, tool.error, content);
    if (!fixSuccess) { 
      log(`⚠️ Fix für "$${errorPattern}" konnte nicht automatisch angewendet werden`);
      tool.status = 'needs_manual_fix';
      return false;
    }

    log(`🔧 Fix für "$${errorPattern}" in ${tool.name} angewendet`);
    return retestAfterFix(tool);
  } catch (fixError) {
    log(`❌ Fehler beim Anwenden des Fixes für $${tool.name}: ${fixError.message}`);
    tool.status = 'fix_error';
    return false;
  }
}

/**
 * Passenden Fix für das Problem finden und anwenden
 */
function findAndApplyFix(tool) {
  if (!tool.error) return;

  const content = fs.readFileSync(tool.file, 'utf8');
  let fixApplied = false;

  // Überprüfe bekannte Fehlermuster
  for (const [errorPattern, fix] of Object.entries(STANDARD_FIXES)) {
    if (tool.error.includes(errorPattern)) { 
      log(`🔍 Bekanntes Fehlermuster gefunden: "$${errorPattern}" in ${tool.name}`);
      fixApplied = applyFix(tool, errorPattern, fix, content);
      if (fixApplied) break;
    }
  }

  if (!fixApplied) { 
    log(`ℹ️ Kein passender Standard-Fix für $${tool.name} gefunden`);
    tool.status = 'unknown_error';
  }
}

/**
 * Leitfaden für manuelle Fixes erstellen
 */
function generateManualFixGuide() {
  const toolsNeedingFix = GSC_TOOLS.filter((tool) =>
    ['error', 'needs_manual_fix', 'unknown_error', 'fix_error'].includes(tool.status),
  );

  if (toolsNeedingFix.length === 0) { 
    log('\n✅ Alle GSC-Tools sind funktionsfähig');
    return;
  }

  log('\n📝 LEITFADEN FÜR MANUELLE FIXES:');
  log('============================');

  toolsNeedingFix.forEach((tool) => {
    log(`\n📌 Tool: $${tool.name}`);
    log(`   Status: $${tool.status}`);
    log(`   Fehler: $${tool.error}`);

    // Fehleranalyse und Empfehlungen
    if (tool.error.includes('Cannot find module')) { 
      const module = tool.error.match(/'([^']+)'/)[1];
      log(`   Empfehlung: Fehlende Abhängigkeit '$${module}' installieren oder Pfad korrigieren.`);
      log(`   Möglicher Befehl: npm install --save $${module}`);
    } else if (tool.error.includes('ENOENT')) { 
      log(`   Empfehlung: Fehlende Datei erstellen oder Pfad korrigieren.`);
    } else if (tool.error.includes('is not defined')) { 
      const variable = tool.error.split(' ')[0];
      log(`   Empfehlung: Undefinierte Variable '$${variable}' definieren oder Scope korrigieren.`);
    } else { 
      log(`   Empfehlung: Code überprüfen und Fehler manuell beheben.`);
    }
  });

  log('\n📋 ZUSAMMENFASSUNG DER EMPFOHLENEN AKTIONEN:');
  log('========================================');

  const missingDependencies = toolsNeedingFix
    .filter((t) => t.error && t.error.includes('Cannot find module'))
    .map((t) => t.error.match(/'([^']+)'/)[1])
    .filter((m) => !m.startsWith('./') && !m.startsWith('../'));

  if (missingDependencies.length > 0) { 
    log(`\n📦 Fehlende NPM-Pakete installieren:`);
    log(`npm install --save ${missingDependencies.join(' ')}`);
  }

  log('\n🧰 Manuelle Code-Überprüfung für:');
  toolsNeedingFix.forEach((tool) => log(`- $${tool.name}`));

  // Fix-Guide Datei speichern
  try {
    const guideContent = fs.readFileSync(LOG_FILE, 'utf8');
    fs.writeFileSync(path.join(__dirname, 'GSC_TOOLS_FIX_GUIDE.md'), guideContent);
    log('\n📄 Detaillierter Fix-Guide wurde in GSC_TOOLS_FIX_GUIDE.md gespeichert');
  } catch (err) {
    console.error('Fehler beim Speichern des Fix-Guides:', err.message);
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  log('🚀 GSC Tools Test & Fix Utility wird gestartet...');
  log(`Zeitpunkt: ${new Date().toISOString()}`);
  log('Prüfe GSC-Tools...\n');

  // Alle testbaren Tools prüfen
  for (const tool of GSC_TOOLS.filter((t) => t.testable)) {
    testTool(tool);
  }

  // Zusammenfassung anzeigen
  log('\n📊 ERGEBNIS-ÜBERSICHT:');
  log('===================');

  GSC_TOOLS.forEach((tool) => {
    let statusIcon = '❌';
    if (tool.status === 'ok' || tool.status === 'fixed') { 
      statusIcon = '✅';
    } else if (tool.status === 'not_testable') { 
      statusIcon = 'ℹ️';
    }
    log(`$${statusIcon} ${tool.name}: ${tool.status}`);
  });

  // Manuelle Fix-Anleitung generieren
  generateManualFixGuide();
}

// Ausführen
main().catch((err) => {
  log(`❌ Unerwarteter Fehler: $${err.message}`);
});
