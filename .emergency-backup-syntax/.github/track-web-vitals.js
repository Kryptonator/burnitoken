#!/usr/bin/env node

/**
 * Core Web Vitals Tracking
 *
 * Dieses Script protokolliert die Core Web Vitals-Metriken und erstellt historische Trends.
 * Es wird nach jedem Lighthouse-Lauf ausgeführt, um eine Performance-Historie aufzubauen.
 *
 * Features:
 * - Liest Lighthouse-Ergebnisse
 * - Speichert Metriken im JSON-Format
 * - Generiert Trend-Visualisierungen
 * - Überwacht Performance-Regression
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  PERF_HISTORY_DIR: path.join(__dirname, '../public/perf-history'),
  THRESHOLD_LCP: 2500, // ms
  THRESHOLD_FID: 100, // ms
  THRESHOLD_CLS: 0.1, // score
};

// Stelle sicher, dass das Verzeichnis existiert
if (!fs.existsSync(CONFIG.PERF_HISTORY_DIR)) {
  fs.mkdirSync(CONFIG.PERF_HISTORY_DIR, { recursive: true });
  console.log(`Erstelle Verzeichnis: ${CONFIG.PERF_HISTORY_DIR}`);
}

/**
 * Liest die neueste Lighthouse-Ergebnis-Datei
 */
function readLatestLighthouseResults() {
  try {
    // Suche nach der neuesten JSON-Datei im .lighthouseci-Verzeichnis
    const lhDir = path.join(__dirname, '../.lighthouseci');
    if (!fs.existsSync(lhDir)) {
      console.error('Lighthouse-Verzeichnis nicht gefunden');
      return null;
    }

    const files = fs
      .readdirSync(lhDir)
      .filter((file) => file.endsWith('.json') && !file.includes('manifest'))
      .map((file) => ({
        name: file,
        time: fs.statSync(path.join(lhDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      console.error('Keine Lighthouse-Ergebnisse gefunden');
      return null;
    }

    // Neueste Datei lesen
    const latestFile = files[0].name;
    const result = JSON.parse(fs.readFileSync(path.join(lhDir, latestFile), 'utf8'));
    console.log(`Lighthouse-Ergebnisse aus ${latestFile} gelesen`);
    return result;
  } catch (error) {
    console.error(`Fehler beim Lesen der Lighthouse-Ergebnisse: ${error.message}`);
    return null;
  }
}

/**
 * Extrahiert Core Web Vitals und andere wichtige Metriken
 */
function extractCoreWebVitals(lhResult) {
  if (!lhResult || !lhResult.audits) {
    console.error('Ungültiges Lighthouse-Ergebnisformat');
    return null;
  }

  try {
    const { audits, categories } = lhResult;

    // Core Web Vitals
    const metrics = {
      date: new Date().toISOString(),
      timestamp: Date.now(),
      url: lhResult.finalUrl,
      FCP: audits['first-contentful-paint']?.numericValue,
      LCP: audits['largest-contentful-paint']?.numericValue,
      CLS: audits['cumulative-layout-shift']?.numericValue,
      TTI: audits['interactive']?.numericValue,
      TBT: audits['total-blocking-time']?.numericValue,
      TTFB: audits['server-response-time']?.numericValue,

      // Performance-Scores
      performanceScore: categories.performance?.score * 100,
      seoScore: categories.seo?.score * 100,
      a11yScore: categories.accessibility?.score * 100,
      bestPracticesScore: categories['best-practices']?.score * 100,
    };

    // Status basierend auf Schwellenwerten
    metrics.lcpStatus = metrics.LCP <= CONFIG.THRESHOLD_LCP ? 'gut' : 'schlecht';
    metrics.clsStatus = metrics.CLS <= CONFIG.THRESHOLD_CLS ? 'gut' : 'schlecht';

    return metrics;
  } catch (error) {
    console.error(`Fehler beim Extrahieren der Core Web Vitals: ${error.message}`);
    return null;
  }
}

/**
 * Speichert die Metriken in der Performance-Historie
 */
function saveMetricsToHistory(metrics) {
  if (!metrics) return false;

  try {
    const date = new Date().toISOString().split('T')[0];
    const filePath = path.join(CONFIG.PERF_HISTORY_DIR, `metrics-${date}.json`);

    // Prüfen, ob es bereits Daten vom heutigen Tag gibt
    let existingData = [];
    if (fs.existsSync(filePath)) {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!Array.isArray(existingData)) {
        existingData = [existingData];
      }
    }

    // Neue Metriken hinzufügen
    existingData.push(metrics);

    // Speichern
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    console.log(`Metriken in ${filePath} gespeichert`);

    // Aktuellen Status für Dashboard bereitstellen
    fs.writeFileSync(
      path.join(CONFIG.PERF_HISTORY_DIR, 'latest-metrics.json'),
      JSON.stringify(metrics, null, 2),
    );

    return true;
  } catch (error) {
    console.error(`Fehler beim Speichern der Metriken: ${error.message}`);
    return false;
  }
}

/**
 * Erstellt eine einfache HTML-Visualisierung des Trends
 */
function generateTrendVisualization() {
  try {
    const files = fs
      .readdirSync(CONFIG.PERF_HISTORY_DIR)
      .filter((file) => file.startsWith('metrics-') && file.endsWith('.json'))
      .sort();

    if (files.length === 0) {
      console.log('Keine Metriken für Trend-Visualisierung gefunden');
      return false;
    }

    // Alle Metriken sammeln
    const allMetrics = [];
    files.forEach((file) => {
      const data = JSON.parse(fs.readFileSync(path.join(CONFIG.PERF_HISTORY_DIR, file), 'utf8'));
      if (Array.isArray(data)) {
        allMetrics.push(...data);
      } else {
        allMetrics.push(data);
      }
    });

    // Nach Zeitstempel sortieren
    allMetrics.sort((a, b) => a.timestamp - b.timestamp);

    // Aggregierte Daten für den Trend-Bericht
    const trendData = {
      dates: allMetrics.map((m) => m.date),
      lcpValues: allMetrics.map((m) => m.LCP),
      clsValues: allMetrics.map((m) => m.CLS),
      fcpValues: allMetrics.map((m) => m.FCP),
      ttiValues: allMetrics.map((m) => m.TTI),
      perfScores: allMetrics.map((m) => m.performanceScore),
      seoScores: allMetrics.map((m) => m.seoScore),
      a11yScores: allMetrics.map((m) => m.a11yScore),
    };

    // Speichern der Trend-Daten
    fs.writeFileSync(
      path.join(CONFIG.PERF_HISTORY_DIR, 'performance-trends.json'),
      JSON.stringify(trendData, null, 2),
    );

    // Generieren einer einfachen HTML-Seite für die Visualisierung
    const htmlPath = path.join(CONFIG.PERF_HISTORY_DIR, 'performance-trends.html');
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BurniToken - Performance Trends</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .chart-container { margin: 20px 0; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 16px; }
    h1, h2 { margin-top: 40px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .metric-card { background: #f5f5f5; border-radius: 8px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .metric-card h3 { margin-top: 0; }
    .good { color: #0c6; }
    .bad { color: #e53; }
    .metric-value { font-size: 24px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>BurniToken - Performance Trends</h1>
  <p>Letzte Aktualisierung: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="metric-card">
      <h3>Last LCP</h3>
      <div class="metric-value ${allMetrics[allMetrics.length - 1].lcpStatus === 'gut' ? 'good' : 'bad'}">
        ${(allMetrics[allMetrics.length - 1].LCP / 1000).toFixed(2)}s
      </div>
      <p>Schwellenwert: ${CONFIG.THRESHOLD_LCP / 1000}s</p>
    </div>
    <div class="metric-card">
      <h3>Last CLS</h3>
      <div class="metric-value ${allMetrics[allMetrics.length - 1].clsStatus === 'gut' ? 'good' : 'bad'}">
        ${allMetrics[allMetrics.length - 1].CLS.toFixed(3)}
      </div>
      <p>Schwellenwert: ${CONFIG.THRESHOLD_CLS}</p>
    </div>
    <div class="metric-card">
      <h3>Performance Score</h3>
      <div class="metric-value ${allMetrics[allMetrics.length - 1].performanceScore >= 90 ? 'good' : 'bad'}">
        ${allMetrics[allMetrics.length - 1].performanceScore.toFixed(0)}
      </div>
      <p>Schwellenwert: 90</p>
    </div>
    <div class="metric-card">
      <h3>SEO Score</h3>
      <div class="metric-value ${allMetrics[allMetrics.length - 1].seoScore >= 90 ? 'good' : 'bad'}">
        ${allMetrics[allMetrics.length - 1].seoScore.toFixed(0)}
      </div>
      <p>Schwellenwert: 90</p>
    </div>
  </div>

  <h2>Core Web Vitals</h2>
  <div class="chart-container">
    <canvas id="webVitalsChart"></canvas>
  </div>
  
  <h2>Performance Scores</h2>
  <div class="chart-container">
    <canvas id="scoresChart"></canvas>
  </div>

  <script>
    // Daten aus der performance-trends.json laden
    const trendData = ${JSON.stringify(trendData)};
    
    // Datumsformatierung
    const formatDates = dates => dates.map(d => {
      const date = new Date(d);
      return \`\${date.getMonth()+1}/\${date.getDate()}\`;
    });
    
    // Core Web Vitals Chart
    new Chart(document.getElementById('webVitalsChart'), {
      type: 'line',
      data: {
        labels: formatDates(trendData.dates),
        datasets: [
          {
            label: 'LCP (s)',
            data: trendData.lcpValues.map(v => v / 1000),
            borderColor: '#4285f4',
            tension: 0.1
          },
          {
            label: 'CLS',
            data: trendData.clsValues,
            borderColor: '#ea4335',
            tension: 0.1
          },
          {
            label: 'FCP (s)',
            data: trendData.fcpValues.map(v => v / 1000),
            borderColor: '#34a853',
            tension: 0.1
          },
          {
            label: 'TTI (s)',
            data: trendData.ttiValues.map(v => v / 1000),
            borderColor: '#fbbc05',
            tension: 0.1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Wert'
            }
          }
        }
      }
    });
    
    // Scores Chart
    new Chart(document.getElementById('scoresChart'), {
      type: 'line',
      data: {
        labels: formatDates(trendData.dates),
        datasets: [
          {
            label: 'Performance',
            data: trendData.perfScores,
            borderColor: '#4285f4',
            tension: 0.1
          },
          {
            label: 'SEO',
            data: trendData.seoScores,
            borderColor: '#34a853',
            tension: 0.1
          },
          {
            label: 'Accessibility',
            data: trendData.a11yScores,
            borderColor: '#ea4335',
            tension: 0.1
          }
        ]
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Score'
            }
          }
        }
      }
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`Trend-Visualisierung in ${htmlPath} generiert`);

    return true;
  } catch (error) {
    console.error(`Fehler beim Generieren der Trend-Visualisierung: ${error.message}`);
    return false;
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  console.log('Core Web Vitals Tracking gestartet...');

  // 1. Lighthouse-Ergebnisse lesen
  const lhResult = readLatestLighthouseResults();
  if (!lhResult) {
    console.log('Versuche Lighthouse-Ergebnisse aus lh-results.json zu lesen...');
    try {
      if (fs.existsSync('lh-results.json')) {
        const altResult = JSON.parse(fs.readFileSync('lh-results.json', 'utf8'));
        if (!altResult) throw new Error('Ungültiges Format');
        console.log('Erfolgreich aus lh-results.json gelesen');
      } else {
        console.log('Keine Lighthouse-Ergebnisse gefunden. Beende Skript.');
        return;
      }
    } catch (error) {
      console.error(`Fehler beim alternativen Lesen: ${error.message}`);
      return;
    }
  }

  // 2. Core Web Vitals extrahieren
  const metrics = extractCoreWebVitals(lhResult);
  if (!metrics) {
    console.error('Konnte Core Web Vitals nicht extrahieren. Beende Skript.');
    return;
  }

  // 3. Metriken in Historie speichern
  const saved = saveMetricsToHistory(metrics);
  if (!saved) {
    console.error('Fehler beim Speichern der Metriken. Beende Skript.');
    return;
  }

  // 4. Trend-Visualisierung generieren
  generateTrendVisualization();

  console.log('Core Web Vitals Tracking abgeschlossen!');
}

// Script ausführen
main().catch((error) => {
  console.error(`Unbehandelter Fehler: ${error.message}`);
  process.exit(1);
});
