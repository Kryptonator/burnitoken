// tools/monitoring/generate-status-dashboard.js
// Erstellt ein HTML-Dashboard aus den Ergebnissen der Monitoring-Skripte.

const fs = require('fs');
const path = require('path');

// Platzhalter für die Ergebnisse der verschiedenen Checks
// In Zukunft werden hier die echten Daten aus anderen Skripten geladen.
const MOCK_DATA = {
  lastUpdated: new Date().toLocaleString('de-DE'),
  connectivity: {
    status: 'OK',
    details: 'Alle Domains sind erreichbar.',
    domains: [
      { name: 'burnitoken.website', status: '✅ Online', code: 200 },
      { name: 'kryptonator.github.io', status: '✅ Online', code: 200 },
    ]
  },
  lighthouse: {
    status: 'GOOD',
    performance: 95,
    accessibility: 100,
    seo: 98
  },
  security: {
    status: 'OK',
    details: 'Keine kritischen Sicherheitsprobleme gefunden.'
  }
};

function generateHTML(data) {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System-Status Dashboard - BurniToken</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: #f0f2f5; color: #1c1e21; }
    .container { max-width: 800px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1, h2 { color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .status-ok { color: #28a745; }
    .status-good { color: #17a2b8; }
    .status-warning { color: #ffc107; }
    .status-error { color: #dc3545; }
    .card { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin-bottom: 15px; }
    .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <h1>System-Status Dashboard</h1>
    <p class="footer">Letzte Aktualisierung: ${data.lastUpdated}</p>

    <div class="card">
      <h2>Konnektivität</h2>
      <p class="status-ok">Status: ${data.connectivity.status}</p>
      <ul>
        ${data.connectivity.domains.map(d => `<li>${d.name}: <strong>${d.status} (${d.code})</strong></li>`).join('')}
      </ul>
    </div>

    <div class="card">
      <h2>Lighthouse Audit</h2>
      <p class="status-good">Performance: ${data.lighthouse.performance} | Accessibility: ${data.lighthouse.accessibility} | SEO: ${data.lighthouse.seo}</p>
    </div>

     <div class="card">
      <h2>Sicherheit</h2>
      <p class="status-ok">Status: ${data.security.status}</p>
    </div>

  </div>
</body>
</html>
  `;
}

function saveDashboard() {
  console.log('🚀 Generiere HTML-Status-Dashboard...');
  const htmlContent = generateHTML(MOCK_DATA);
  const outputPath = path.join(__dirname, '../../docs', 'status-dashboard.html');

  // Sicherstellen, dass das /docs Verzeichnis existiert
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath));
  }

  fs.writeFileSync(outputPath, htmlContent);
  console.log(`✅ Dashboard erfolgreich gespeichert unter: ${outputPath}`);
}

saveDashboard();

module.exports = { generateHTML, saveDashboard };
