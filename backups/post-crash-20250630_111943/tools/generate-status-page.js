const fs = require('fs');
const path = require('path');

// Pfade zu den Report-Dateien
const lighthouseManifestPath = path.join('.lighthouseci', 'manifest.json');
const playwrightReportPath = path.join('playwright-report', 'results.json'); // Annahme, dass es einen JSON-Reporter gibt
const lintReportPath = path.join('lint-results.json'); // Annahme für Linting-Ergebnisse
const outputPath = path.join('status.html');

// --- Hilfsfunktionen zum Einlesen der Daten ---

function getLighthouseSummary() {
  if (!fs.existsSync) {
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
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) return null;
};
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
  const manifest = JSON.parse(fs.readFileSync(lighthouseManifestPath, 'utf-8'));
  const summaryEntry = manifest.find((entry) => entry.isRepresentativeRun && entry.summary);
  return summaryEntry ? summaryEntry.summary : null;
}

function getPlaywrightResults() {
  // Diese Funktion muss an den tatsächlichen Playwright-Reporter angepasst werden.
  // Hier wird eine Dummy-Struktur angenommen, falls die Datei nicht existiert.
  if (!fs.existsSync(playwrightReportPath)) {
    return { passed: 0, failed: 0, skipped: 0, total: 0, status: 'nicht gefunden' };
  }
  // Hier müsste die Logik zum Parsen des spezifischen Playwright-JSON-Reports stehen.
  // Beispielhafte Dummy-Logik:
  const report = JSON.parse(fs.readFileSync(playwrightReportPath, 'utf-8'));
  const stats = report.stats || { passed: 0, failed: 0, skipped: 0 };
  return {
    ...stats,
    total: stats.passed + stats.failed + stats.skipped,
    status: stats.failed > 0 ? 'Fehlgeschlagen' : 'Bestanden',
  };
}

function getLintingResults() {
  if (!fs.existsSync(lintReportPath)) {
    return { errorCount: 0, warningCount: 0, status: 'nicht gefunden' };
  }
  const results = JSON.parse(fs.readFileSync(lintReportPath, 'utf-8'));
  const summary = results.reduce(
    (acc, file) => {
      acc.errorCount += file.errorCount;
      acc.warningCount += file.warningCount;
      return acc;
    },
    { errorCount: 0, warningCount: 0 },
  );
  summary.status = summary.errorCount > 0 ? 'Fehlgeschlagen' : 'Bestanden';
  return summary;
}

// --- Daten sammeln ---

const lighthouse = getLighthouseSummary();
const playwright = getPlaywrightResults();
const linting = getLintingResults();

// --- HTML-Generierung ---

const toPercent = (score) => (score * 100).toFixed(0);

const getScoreColor = (score) => {
  if (score >= 0.9) return '#22c55e'; // Green
  if (score >= 0.5) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
};

const getStatusColor = (status) => {
  if (status === 'Bestanden') return '#22c55e';
  if (status === 'Fehlgeschlagen') return '#ef4444';
  return '#9ca3af'; // Gray
};

let lighthouseHtml = '<div class="grid">...</div>';
if (lighthouse) {
  lighthouseHtml = `
        <div class="grid">
            <div class="metric">
                <h2>Performance</h2>
                <p class="score" style="color: ${getScoreColor(lighthouse.performance)};">${toPercent(lighthouse.performance)}</p>
            </div>
            <div class="metric">
                <h2>Accessibility</h2>
                <p class="score" style="color: ${getScoreColor(lighthouse.accessibility)};">${toPercent(lighthouse.accessibility)}</p>
            </div>
            <div class="metric">
                <h2>Best Practices</h2>
                <p class="score" style="color: ${getScoreColor(lighthouse['best-practices'])};">${toPercent(lighthouse['best-practices'])}</p>
            </div>
            <div class="metric">
                <h2>SEO</h2>
                <p class="score" style="color: ${getScoreColor(lighthouse.seo)};">${toPercent(lighthouse.seo)}</p>
            </div>
        </div>
    `;
} else {
  lighthouseHtml = `<p style="text-align:center; color: #ef4444;">Lighthouse-Report nicht gefunden.</p>`;
}

const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Projekt-Status</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #1f2937; margin: 0; padding: 2rem; }
        .container { max-width: 900px; margin: auto; background: white; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        h1, h2 { color: #111827; }
        h1 { border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
        h2 { font-size: 1.5rem; margin-bottom: 1rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.5rem;}
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; }
        .metric { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; text-align: center; background-color: #f9fafb; }
        .metric h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #374151; }
        .score { font-size: 2.8rem; font-weight: 700; }
        .status-box { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; margin-bottom: 1rem; }
        .status-box p { margin: 0; }
        .status-indicator { padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 500; color: white; }
        .footer { margin-top: 3rem; text-align: center; font-size: 0.875rem; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Live Projekt-Status</h1>
        
        <h2><span style="font-size: 1.5em; vertical-align: middle;">🚦</span> End-to-End Tests (Playwright)</h2>
        <div class="status-box">
            <p><strong>Status:</strong> ${playwright.passed} Bestanden, ${playwright.failed} Fehlgeschlagen, ${playwright.skipped} Übersprungen</p>
            <span class="status-indicator" style="background-color: ${getStatusColor(playwright.status)};">${playwright.status}</span>
        </div>

        <h2><span style="font-size: 1.5em; vertical-align: middle;">🧹</span> Code Qualität (Linting)</h2>
        <div class="status-box">
            <p><strong>Status:</strong> ${linting.errorCount} Fehler, ${linting.warningCount} Warnungen</p>
            <span class="status-indicator" style="background-color: ${getStatusColor(linting.status)};">${linting.status}</span>
        </div>

        <h2><span style="font-size: 1.5em; vertical-align: middle;">📈</span> Website Performance (Lighthouse)</h2>
        ${lighthouseHtml}

        <div class="footer">
            Zuletzt aktualisiert am: <strong>${new Date().toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'medium' })}</strong>
        </div>
    </div>
</body>
</html>
`;

fs.writeFileSync(outputPath, htmlContent);
console.log(`✅ Erweitertes Status-Dashboard erfolgreich in ${outputPath} erstellt.`);
