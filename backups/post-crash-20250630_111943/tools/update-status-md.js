#!/usr/bin/env node
/**
 * update-status-md.js
 *
 * Erstellt/aktualisiert eine STATUS.md mit den wichtigsten Projekt- und Monitoring-Infos.
 * Automatisch nutzbar in CI/CD-Workflows.
 */
const fs = require('fs');
const path = require('path');

// Hilfsfunktionen
function checkFile(p) {
  return fs.existsSync(path.join(__dirname, '..', p));
}
function checkDir(p) {
  return (
    fs.existsSync(path.join(__dirname, '..', p)) &&
    fs.statSync(path.join(__dirname, '..', p)).isDirectory()
  );
}

// Statusdaten
const checks = [
  { label: 'CI/CD-Workflow', file: '.github/workflows/ci.yml' },
  { label: 'SEO-Monitor', file: '.github/workflows/seo-monitor.yml' },
  { label: 'Web Vitals', file: '.github/workflows/web-vitals-check.yml' },
  { label: 'Automatisierte Tests', dir: 'tests' },
  { label: 'Recovery Center', file: 'tools/vscode-recovery-center.js' },
  { label: 'Google Search Console API', file: 'tools/gsc-status-check.js' },
  { label: 'Monitoring/Alerts', file: 'sentry.client.js' },
  { label: 'Mehrsprachigkeit', file: 'assets/translations.json' },
  { label: 'README', file: 'README.md' },
];

const todos = [
  'Alerts & Monitoring für alle Checks aktivieren',
  'Social Cards & strukturierte Daten finalisieren',
  'Regelmäßige Live-Readiness-Checks automatisieren',
  'README & Dokumentation aktuell halten',
  'DX-Verbesserungen (Prettier, ESLint, Onboarding) umsetzen',
  'Recovery- und Health-Checks weiter ausbauen',
];

let md = `# Projektstatus\n\n`;
md += `Letzte Aktualisierung: ${new Date().toLocaleString('de-DE')}\n\n`;
md += `## Status\n`;
checks.forEach((c) => {
  let ok = c.file ? checkFile(c.file) : checkDir(c.dir);
  md += ok ? `- ✅ $${c.label}\n` : `- ❌ $${c.label} fehlt/noch offen\n`;
});
md += `\n## Offene ToDos\n`;
todos.forEach((t) => {
  md += `- [ ] $${t}\n`;
});

fs.writeFileSync(path.join(__dirname, '..', 'STATUS.md'), md);
console.log('STATUS.md aktualisiert.');
