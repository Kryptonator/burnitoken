// tools/dependabot-monitor.js
// Überwacht offene Dependabot Pull Requests und sendet Alerts bei Verzögerungen.
// Benötigt die GitHub CLI (`gh`) und ein gesetztes GITHUB_TOKEN.

const { exec } = require('child_process');
const { sendAlert } = require('./alert-service');
const { createTodo } = require('./todo-manager');

// --- Konfiguration ---
// Webhook-URL für Benachrichtigungen (aus Umgebungsvariablen oder .env laden)
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''; 
// Maximales Alter eines PRs in Tagen, bevor ein Alert gesendet wird
const MAX_PR_AGE_DAYS = 3; 
// GitHub Repository (z.B. 'owner/repo')
const GITHUB_REPO = 'Kryptonator/burnitoken.com'; // Bitte anpassen, falls nötig

console.log(`🔍 Überwache Dependabot PRs für das Repository: ${GITHUB_REPO}...`);

// Führe den GitHub CLI-Befehl aus, um offene PRs von Dependabot abzurufen
exec(
  `gh pr list --repo ${GITHUB_REPO} --author "app/dependabot" --state open --json number,title,createdAt`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Fehler beim Abrufen der PRs: ${error.message}`);
      const errorMessage = `Dependabot Monitor konnte keine PRs abrufen.`;
      sendAlert({
        message: errorMessage,
        webhookUrl: SLACK_WEBHOOK_URL,
        level: 'error',
        extra: { details: stderr }
      });
      createTodo(
        'Fehler beim Abrufen von Dependabot PRs',
        `${errorMessage}\nFehlerdetails: ${stderr}`,
        'Dependabot Monitor'
      );
      return;
    }

    try {
      const prs = JSON.parse(stdout);
      if (prs.length === 0) {
        console.log('✅ Keine offenen Dependabot PRs gefunden.');
        return;
      }

      console.log(`📊 ${prs.length} offene Dependabot PR(s) gefunden.`);
      const now = new Date();
      let overduePrs = 0;

      prs.forEach(pr => {
        const createdAt = new Date(pr.createdAt);
        const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

        if (ageInDays > MAX_PR_AGE_DAYS) {
          overduePrs++;
          const alertMessage = `Dependabot PR #${pr.number} ("${pr.title}") ist seit ${Math.floor(ageInDays)} Tagen offen und benötigt eine Überprüfung.`;
          console.warn(`❗ ALERT: ${alertMessage}`);
          sendAlert({
            message: alertMessage,
            webhookUrl: SLACK_WEBHOOK_URL,
            level: 'warning',
            extra: {
              pr_number: pr.number,
              pr_title: pr.title,
              repo: GITHUB_REPO
            }
          });
          createTodo(
            `Überfälliger Dependabot PR: #${pr.number}`,
            `Der Dependabot Pull Request #${pr.number} ("${pr.title}") im Repository ${GITHUB_REPO} ist seit ${Math.floor(ageInDays)} Tagen offen und erfordert eine manuelle Überprüfung und Zusammenführung.`,
            'Dependabot Monitor'
          );
        }
      });

      if (overduePrs === 0) {
        console.log('✅ Alle offenen Dependabot PRs sind innerhalb des Zeitlimits.');
      } else {
        console.log(`🔔 ${overduePrs} überfällige PR(s) gemeldet.`);
      }

    } catch (parseError) {
      console.error('Fehler beim Parsen der PR-Daten:', parseError);
      createTodo(
        'Dependabot Monitor Parsing Fehler',
        `Fehler beim Parsen der PR-Daten von GitHub: ${parseError.message}`,
        'Dependabot Monitor'
      );
    }
  }
);
