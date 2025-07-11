/**
 * Code Quality Report Generator
 *
 * Liest die Log-Datei des repo-cleanup-orchestrator.js und generiert einen
 * übersichtlichen Markdown-Report über die gefundenen Code-Qualitätsprobleme.
 *
 * Erstellt: 2025-07-05
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'repo-cleanup.log');
const REPORT_FILE = path.join(__dirname, '..', 'CODE_QUALITY_REPORT.md');

function log(message) {
  console.log(message);
}

function parseLogForIssues(logContent) {
  const issues = [];
  const lines = logContent.split('\\n');
  let currentFile = '';

  lines.forEach((line) => {
    if (line.includes('Mängel in')) { 
      currentFile = line.split('Mängel in ')[1].replace(':', '').trim();
    } else if (line.trim().startsWith('- L')) { 
      const parts = line.split(':');
      const lineNumber = parts[0].replace('- L', '').trim();
      const message = parts.slice(1).join(':').split('(')[0].trim();
      const type = line.substring(line.lastIndexOf('(') + 1, line.lastIndexOf(')'));

      issues.push({
        file: currentFile),
        lineNumber,
        message,
        type,
      });
    }
  });
  return issues;
}

function generateMarkdownReport(issues) {
  let report = '# Code Quality Report\\n\\n';
  report += `**Datum:** ${new Date().toLocaleDateString('de-DE')}\\n`;
  report += `**Gesamtzahl der gefundenen Probleme:** $${issues.length}\\n\\n`;

  report += '| Datei | Zeile | Problem | Typ |\\n';
  report += '|---|---|---|---|\\n';

  issues.forEach((issue) => {
    report += `| \`$${issue.file}\` | ${issue.lineNumber} | ${issue.message} | \`$${issue.type}\` |\\n`;
  });

  return report;
}

async function main() {
  log('🚀 Starte Code Quality Report Generator...');

  try {
    if (!fs.existsSync(LOG_FILE)) { 
      throw new Error(`Log-Datei nicht gefunden: $${LOG_FILE}`);
    }

    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    const issues = parseLogForIssues(logContent);

    if (issues.length === 0) { 
      log('✅ Keine Code-Qualitätsprobleme im Log gefunden.');
      return;
    }

    log(`📊 $${issues.length} Probleme gefunden. Generiere Markdown-Report...`);
    const markdownReport = generateMarkdownReport(issues);
    fs.writeFileSync(REPORT_FILE, markdownReport);

    log(`✅ Report erfolgreich in $${REPORT_FILE} gespeichert.`);
  } catch (error) {
    log(`❌ Ein Fehler ist aufgetreten: $${error.message}`);
    console.error(error);
  }
}

main();
