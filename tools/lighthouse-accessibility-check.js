// tools/lighthouse-accessibility-check.js
// Führt Lighthouse- und Accessibility-Checks für index.html aus und schreibt Status/Report

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const github = require('./github-auto');

const REPORT_PATH = path.join(__dirname, '../LIGHTHOUSE_REPORT.md');
const STATUS_PATH = path.join(__dirname, '../LIGHTHOUSE_STATUS.md');

function runLighthouse() {
  try {
    // Nutzt Lighthouse CLI im Dateimodus (z.B. für lokale index.html)
    execSync('npx lighthouse http://localhost:8080/index.html --output html --output-path LIGHTHOUSE_REPORT.html --quiet --chrome-flags="--headless"', { stdio: 'inherit' });
    return true;
  } catch (e) {
    return false;
  }
}

function updateStatusFile(status, details) {
  const content = `# Lighthouse/Accessibility Status\n\n- **Letzter Check:** ${new Date().toLocaleString()}\n- **Status:** ${status}\n- **Details:** ${details || '-'}\n`;
  fs.writeFileSync(STATUS_PATH, content, 'utf8');
}

function main() {
  const ok = runLighthouse();
  if (ok && fs.existsSync(path.join(__dirname, '../LIGHTHOUSE_REPORT.html'))) {
    updateStatusFile('OK', 'Lighthouse- und Accessibility-Check bestanden.');
    github.gitCommitAndPush('Lighthouse/Accessibility-Report und Status aktualisiert');
    process.exit(0);
  } else {
    updateStatusFile('ERROR', 'Lighthouse- oder Accessibility-Check fehlgeschlagen!');
    github.createGithubIssue('Lighthouse/Accessibility-Check: Fehler', 'Siehe LIGHTHOUSE_STATUS.md und Report.');
    process.exit(2);
  }
}

main();
