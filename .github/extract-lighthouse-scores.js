// Extrahiert die wichtigsten Lighthouse-Scores aus LIGHTHOUSE_REPORT.html und pflegt lighthouse-scores.json
// Im GitHub Actions Workflow nach jedem Lighthouse-Check aufrufen

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const reportPath = path.join(__dirname, '..', '..', 'LIGHTHOUSE_REPORT.html');
const scoresPath = path.join(__dirname, '..', '..', 'public', 'lighthouse-scores.json');

// Hilfsfunktion: Score aus HTML extrahieren (Lighthouse-Report)
function extractScores(html) {
  const $ = cheerio.load(html);
  // Die Scores stehen meist in <div class="lh-gauge__percentage"> oder als JSON im <script id="lh-log">
  let perf = null, acc = null, bp = null, seo = null;
  // Versuche JSON-Block zu finden
  const jsonScript = $("script#lh-log").html();
  if (jsonScript) {
    try {
      const match = jsonScript.match(/window\.lhLog = (.*);/);
      if (match) {
        const lhData = JSON.parse(match[1]);
        perf = Math.round((lhData.categories.performance.score || 0) * 100);
        acc = Math.round((lhData.categories.accessibility.score || 0) * 100);
        bp = Math.round((lhData.categories['best-practices'].score || 0) * 100);
        seo = Math.round((lhData.categories.seo.score || 0) * 100);
      }
    } catch (e) {}
  }
  // Fallback: Versuche Werte aus sichtbaren Score-Elementen zu lesen
  if (perf === null) {
    const scores = $(".lh-gauge__percentage").map((i, el) => parseInt($(el).text())).get();
    if (scores.length >= 4) {
      [perf, acc, bp, seo] = scores;
    }
  }
  return { performance: perf, accessibility: acc, best_practices: bp, seo };
}

function main() {
  if (!fs.existsSync(reportPath)) {
    console.error('Lighthouse-Report nicht gefunden:', reportPath);
    process.exit(1);
  }
  const html = fs.readFileSync(reportPath, 'utf8');
  const scores = extractScores(html);
  if (!scores.performance) {
    console.error('Konnte keine Scores extrahieren.');
    process.exit(1);
  }
  // Zeitstempel (ISO)
  const now = new Date().toISOString();
  let history = [];
  if (fs.existsSync(scoresPath)) {
    try {
      history = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
    } catch (e) { history = []; }
  }
  // Nur anhängen, wenn sich Score oder Tag unterscheidet
  if (!history.length || JSON.stringify(history[history.length-1]).indexOf(scores.performance) === -1) {
    history.push({ date: now, ...scores });
    fs.writeFileSync(scoresPath, JSON.stringify(history, null, 2));
    console.log('Lighthouse-Scores aktualisiert:', scores);
  } else {
    console.log('Score unverändert, kein Eintrag hinzugefügt.');
  }
}

main();
