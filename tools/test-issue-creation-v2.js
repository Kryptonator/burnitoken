require('dotenv').config();
const https = require('https');

/**
 * tools/test-issue-creation-v2.js
 *
 * Dieses Skript führt einen minimalen Test durch, um ein GitHub-Issue zu erstellen.
 * Es hilft bei der Diagnose von Problemen mit der GitHub API, insbesondere bei 404-Fehlern,
 * die auf Berechtigungsprobleme hindeuten könnten.
 */

// --- Konfiguration ---
const GITHUB_REPO = process.env.GITHUB_REPO || 'Kryptonator/burnitoken';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = GITHUB_REPO.split('/')[0];

async function testCreateIssue() {
  if (!GITHUB_TOKEN) {
    console.error('❌ Fehler: GITHUB_TOKEN ist nicht in der .env-Datei gesetzt.');
    return;
  }

  console.log(`ℹ️  Versuche, ein Test-Issue im Repository zu erstellen: ${GITHUB_REPO}`);

  const issueData = JSON.stringify({
    title: '🤖 Minimal Test Issue V2',
    body: 'This is a test issue created by a diagnostic script to verify API access and permissions.',
    labels: ['test', 'diagnostic'],
    assignees: [GITHUB_OWNER],
  });

  const options = {
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/issues`,
    method: 'POST',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'burnitoken-issue-creation-test-v2',
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
      'Content-Length': Buffer.byteLength(issueData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        console.log(`▶️  GitHub API Antwort-Status: ${res.statusCode}`);
        try {
          const response = JSON.parse(responseBody);
          console.log('▶️  Antwort-Body:', JSON.stringify(response, null, 2));

          if (res.statusCode === 201) {
            console.log(`✅ Erfolgreich! Test-Issue erstellt: ${response.html_url}`);
            resolve(response.html_url);
          } else if (res.statusCode === 404) {
            console.error(
              `❌ Fehler (404 Not Found): Das Repository '${GITHUB_REPO}' wurde nicht gefunden oder der Token hat keine Schreibrechte.`,
            );
            console.error(
              '   Bitte stellen Sie sicher, dass der Token den Scope `public_repo` (für öffentliche Repos) oder `repo` (für private Repos) hat.',
            );
            reject(new Error('Repository not found or write access denied.'));
          } else if (res.statusCode === 422) {
            console.error(
              `❌ Fehler (422 Unprocessable Entity): Die übermittelten Daten sind ungültig.`,
            );
            console.error(
              '   Dies kann passieren, wenn der zugewiesene Benutzer (`assignee`) kein Mitarbeiter des Repositories ist.',
            );
            reject(new Error('Invalid data provided.'));
          } else {
            console.error(`❌ Unerwarteter Fehler (Status: ${res.statusCode})`);
            reject(new Error(`Failed to create issue with status code: ${res.statusCode}`));
          }
        } catch (e) {
          console.error('Fehler beim Parsen der JSON-Antwort:', e);
          console.error('Roh-Antwort:', responseBody);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Fehler bei der API-Anfrage: ${error.message}`);
      reject(error);
    });

    console.log('   Sende Anfrage an GitHub...');
    req.write(issueData);
    req.end();
  });
}

testCreateIssue().catch((err) => {
  console.error('\nScript-Ausführung fehlgeschlagen.');
  process.exit(1);
});
