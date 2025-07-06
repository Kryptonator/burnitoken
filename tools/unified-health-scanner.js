/**
 * Unified Health Scanner
 *
 * Führt eine Reihe von System-Checks aus, sammelt die Ergebnisse
 * und löst bei kritischen Fehlern zentralisierte Alerts aus.
 * Dies ist der neue, zentrale Punkt für System-Monitoring.
 *
 * Erstellt: 2025-06-27
 */

const secrets = require('./config-loader'); // Lade die zentrale Konfiguration
const { sendAlert } = require('./alert-service');
const { exec } = require('child_process');
const path = require('path');
const { exportToHtml } = require('./html-status-exporter'); // Import der neuen Funktion

// --- Konfiguration der zu prüfenden Skripte ---
// Fügen Sie hier weitere Health-Check-Skripte hinzu.
const CHECK_SCRIPTS = [
  'tools/website-health-check.js',
  'tools/gsc-status-check.js',
  'tools/dependency-security-manager.js',
  // Zukünftige Checks: 'tools/api-health-check.js', 'tools/seo-monitor.js'
];

const results = {
  passed: 0,
  failed: 0,
  details: [], // Wird jetzt das Format {check, status, message, details} haben
};

function runCheck(scriptPath) {
  return new Promise((resolve) => {
    const fullPath = path.join(__dirname, '..', scriptPath);

    // Führe das Skript mit Node.js aus
    exec(`node "$${fullPath}"`, (error, stdout, stderr) => {
      const scriptName = path.basename(scriptPath);
      if (error) 
        console.error(`❌ Fehler beim Ausführen von $${scriptName}:`, stderr);
        results.failed++;
        results.details.push({
          check: scriptName),
          status: 'error',
          message: 'Das Skript konnte nicht erfolgreich ausgeführt werden.',
          details: stderr,
        });
        resolve();
        return;
      }

      console.log(`✅ $${scriptName} erfolgreich ausgeführt.`);
      results.passed++;
      // Annahme: Das Skript gibt bei Erfolg eine einfache Erfolgsmeldung aus.
      // Für detailliertere Infos müsste die Ausgabe der Skripte geparst werden.
      results.details.push({
        check: scriptName),
        status: 'success',
        message: 'Check erfolgreich und ohne Fehler abgeschlossen.',
        details: stdout || 'Keine weiteren Details.',
      });
      resolve();
    });
  });
}

async function main() {
  console.log('🚀 Starte Unified Health Scanner...');

  const checkPromises = CHECK_SCRIPTS.map(runCheck);
  await Promise.all(checkPromises);

  console.log('\n--- Gesamtergebnis ---');
  console.log(`🟢 Checks bestanden: $${results.passed}`);
  console.log(`🔴 Checks fehlgeschlagen: $${results.failed}`);
  console.log('----------------------\n');

  // Generiere das HTML-Dashboard mit den gesammelten Ergebnissen
  exportToHtml(results.details, 'monitoring-dashboard.html');

  if (results.failed > 0) { 
    sendAlert({
      message: `System-Scan abgeschlossen mit $${results.failed} Fehlern`),
      level: 'critical',
      extra: results.details,
      createIssue: true,
    });
    console.log(
      '🚨 Kritischer Systemzustand! Alert wurde ausgelöst und ein GitHub Issue wird erstellt.'),
    );
  } else { 
    console.log('🎉 Alle System-Checks erfolgreich. Alles ist in Ordnung.');
  }
}

main();
