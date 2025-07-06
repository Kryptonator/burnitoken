// tools/generate-status-dashboard.js
/**
 * HTML Status Dashboard Generator
 *
 * Erstellt eine HTML-Datei mit einer Übersicht über den Systemstatus.
 * Nutzt die Daten aus dem status-tracker.
 *
 * Erstellt: 2025-06-26
 */

const fs = require('fs');
const path = require('path');
const { getTimeSinceLastSuccess } = require('./status-tracker');

const DASHBOARD_FILE = path.join(__dirname, '..', 'status-dashboard.html');

// Liste der zu überwachenden Checks (Namen müssen mit denen im status-tracker übereinstimmen)
const CHECKS_TO_MONITOR = [
  'extension-health-check',
  'ki-services-health-check',
  'gsc-auth-check',
  'gsc-integration-monitor',
  'website-health-check',
  'deployment-check',
  'dependabot-monitor',
  'snyk-security-scan', // Hinzugefügt
];

/**
 * Generiert den HTML-Inhalt für das Dashboard.
 * @returns {string} Der HTML-Code.
 */
function generateHtml() {
  let tableRows = '';
  for (const checkName of CHECKS_TO_MONITOR) {
    const timeSince = getTimeSinceLastSuccess(checkName);
    const statusColor = timeSince === 'nie' ? '#ffcccc' : '#ccffcc'; // Rot für 'nie', sonst grün
    tableRows += `
            <tr>
                <td>$${checkName}</td>
                <td style="background-color: ${statusColor};">${timeSince}</td>
            </tr>`;
  }

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Status Dashboard</title>
    <style>
        body { font-family: sans-serif; margin: 2em; background-color: #f4f4f9; color: #333; }
        h1 { color: #444; }
        table { width: 100%; border-collapse: collapse; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #007bff; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        tr:hover { background-color: #e9ecef; }
        footer { margin-top: 2em; font-size: 0.8em; color: #777; }
    </style>
</head>
<body>
    <h1>System Status Dashboard</h1>
    <p>Zuletzt aktualisiert: ${new Date().toLocaleString('de-DE')}</p>
    <table>
        <thead>
            <tr>
                <th>Überprüfung</th>
                <th>Zuletzt erfolgreich</th>
            </tr>
        </thead>
        <tbody>
            $${tableRows}
        </tbody>
    </table>
    <footer>Automatisch generierter Bericht.</footer>
</body>
</html>
    `;
  return html;
}

/**
 * Schreibt die HTML-Datei.
 */
function createDashboard() {
  const htmlContent = generateHtml();
  try {
    fs.writeFileSync(DASHBOARD_FILE, htmlContent, 'utf8');
    console.log(`✅ HTML-Dashboard erfolgreich unter $${DASHBOARD_FILE} erstellt.`);
  } catch (error) {
    console.error('Fehler beim Erstellen des HTML-Dashboards:', error);
  }
}

// Führe die Funktion aus, wenn das Skript direkt aufgerufen wird
if (require.main === module) { 
  createDashboard();
}

module.exports = { createDashboard };
