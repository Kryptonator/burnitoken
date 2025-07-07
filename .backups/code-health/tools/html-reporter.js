const fs = require('fs');
const path = require('path');

// Pfade zu den Statusdateien
const STATUS_FILES = {
  extensions: '.vscode/extension-status.json',
  gsc: 'gsc-integration-status.json',
  // Weitere Statusdateien hier hinzufügen
};

// Ausgabepfad für den HTML-Report
const OUTPUT_PATH = path.join(__dirname, '..', 'status-dashboard.html');

/**
 * Liest eine JSON-Datei sicher aus.
 */
function readJson(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Fehler beim Lesen von ${filePath}:`, error);
  }
  return null;
}

/**
 * Generiert den HTML-Report.
 */
function generateReport() {
  console.log('📊 Generiere HTML-Status-Dashboard...');

  const statusData = {};
  for (const key in STATUS_FILES) {
    const filePath = path.join(__dirname, '..', STATUS_FILES[key]);
    statusData[key] = readJson(filePath);
  }

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status-Dashboard - BurniToken</title>
  <style>
    /* Hier kommt modernes CSS für das Dashboard */
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: #f0f2f5; }
    header { background-color: #1a202c; color: white; padding: 20px; text-align: center; }
    main { padding: 20px; }
    .card { background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; padding: 20px; }
    h1, h2 { margin-top: 0; }
    .status-ok { color: #28a745; }
    .status-error { color: #dc3545; }
  </style>
</head>
<body>
  <header>
    <h1>BurniToken Projekt-Dashboard</h1>
    <p>Automatisch generiert am ${new Date().toLocaleString('de-DE')}</p>
  </header>
  <main>
    <div class="card">
      <h2>Erweiterungs-Status</h2>
      ${generateExtensionHTML(statusData.extensions)}
    </div>
    <div class="card">
      <h2>Google Search Console</h2>
      ${generateGscHTML(statusData.gsc)}
    </div>
    <!-- Weitere Karten hier einfügen -->
  </main>
</body>
</html>
  `;

  fs.writeFileSync(OUTPUT_PATH, html);
  console.log(`✅ HTML-Dashboard erfolgreich erstellt: ${OUTPUT_PATH}`);
}

/**
 * Generiert HTML für den Extension-Status.
 */
function generateExtensionHTML(data) {
  if (!data) return '<p class="status-error">Keine Daten verfügbar.</p>';
  return `
    <p>Letzter Lauf: ${new Date(data.lastRun).toLocaleString('de-DE')}</p>
    <ul>
      <li>Aktivierte Extensions: <strong class="status-ok">${data.extensions.enabled}</strong></li>
      <li>Fehlgeschlagene Extensions: <strong class="${data.extensions.failed > 0 ? 'status-error' : 'status-ok'}">${data.extensions.failed}</strong></li>
    </ul>
  `;
}

/**
 * Generiert HTML für den GSC-Status.
 */
function generateGscHTML(data) {
  if (!data) return '<p class="status-error">Keine Daten verfügbar.</p>';
  const statusClass = data.status === 'OK' ? 'status-ok' : 'status-error';
  return `
    <p>Status: <strong class="${statusClass}">${data.status}</strong></p>
    <p>Letzte Prüfung: ${new Date(data.lastChecked).toLocaleString('de-DE')}</p>
  `;
}

generateReport();
