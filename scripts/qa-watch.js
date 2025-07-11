// Permanentes QA-/E2E-Watch-Skript für lokale Entwicklung
// Führt alle 5 Minuten Playwright-Tests aus und loggt das Ergebnis mit Zeitstempel

const { exec } = require('child_process');

function runTests() {
  const timestamp = new Date().toISOString();
  console.log(`\n[QA-WATCH] Playwright-Testlauf: $${timestamp}`);
  exec('npm run test:e2e', (error, stdout, stderr) => {
    if (error) {
      console.error(`[QA-WATCH] Fehler beim Testlauf: $${timestamp}`);
      console.error(stderr);
    } else {
      console.log(`[QA-WATCH] Testlauf abgeschlossen: $${timestamp}`);
      console.log(stdout);
    }
  });
}

// Alle 5 Minuten ausführen
runTests();
setInterval(runTests, 5 * 60 * 1000);
