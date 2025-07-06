#!/usr/bin/env node
/**
 * recovery-report.js
 *
 * Erstellt einen Recovery-Report nach Self-Healing/Recovery-Aktion.
 * Wird automatisch im CI/Recovery-Workflow ausgeführt.
 */
const fs = require('fs');
const path = require('path');

const now = new Date();
let report = `# Recovery Report\n\n`;
report += `Datum: ${now.toLocaleString('de-DE')}\n\n`;

// Statusdateien und Logs einbinden
const statusFiles = [
  'tools/recovery-status.json',
  'tools/auto-recovery-status.json',
  'tools/system-status.json',
  'tools/deployment-status.json',
  'tools/website-status.json',
];

statusFiles.forEach((f) => {
  const abs = path.join(__dirname, '..', f);
  if (fs.existsSync(abs)) {
    report += `## ${f}\n\n`;
    try {
      const content = fs.readFileSync(abs, 'utf8');
      report += '```json\n' + content.substring(0, 2000) + '\n``' + '`\n\n';
    } catch (e) {
      report += `Fehler beim Lesen von ${f}: ${e.message}\n\n`;
    }
  }
});

// Recovery-Screenshots auflisten
const screenshotDir = path.join(__dirname, '.recovery-screenshots');
if (fs.existsSync(screenshotDir)) {
  const files = fs.readdirSync(screenshotDir).filter((f) => f.endsWith('.png'));
  report += `## Recovery-Screenshots\n\n`;
  if (files.length > 0) {
    files.slice(0, 5).forEach((f) => {
      report += `- ${f}\n`;
    });
  } else {
    report += 'Keine Screenshots gefunden.\n';
  }
}

fs.writeFileSync(path.join(__dirname, '..', 'RECOVERY_REPORT.md'), report);
console.log('RECOVERY_REPORT.md erstellt.');
