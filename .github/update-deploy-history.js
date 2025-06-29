// Fügt nach jedem Deploy einen Eintrag in public/deploy-history.json hinzu
// Im GitHub Actions Workflow nach erfolgreichem Deploy aufrufen

const fs = require('fs');
const path = require('path');

const historyPath = path.join(__dirname, '..', '..', 'public', 'deploy-history.json');

// Diese Werte werden im Workflow als Umgebungsvariablen übergeben
const date = process.env.DEPLOY_DATE || new Date().toISOString();
const status = process.env.DEPLOY_STATUS || 'success';
const run_id = process.env.GITHUB_RUN_ID || '';
const commit = process.env.GITHUB_SHA || '';
const repo = process.env.GITHUB_REPOSITORY || '';
const url = `https://github.com/${repo}/actions/runs/${run_id}`;

function main() {
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) { history = []; }
  }
  // Nur anhängen, wenn Run-ID oder Commit neu ist
  if (!history.length || history[history.length-1].run_id !== run_id) {
    history.push({ date, status, run_id, commit, url });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    console.log('Deploy-Historie aktualisiert:', { date, status, run_id, commit });
  } else {
    console.log('Deploy bereits eingetragen.');
  }
}

main();
