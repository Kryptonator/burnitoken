// tools/dependabot-monitor.js
// Überwacht offene Dependabot Pull Requests und sendet Alerts bei Verzögerungen.
// Benötigt die GitHub CLI (`gh`) und ein gesetztes GITHUB_TOKEN.

const { exec, execSync } = require('child_process');
const { sendAlert } = require('./alert-service');
const { createTodo } = require('./todo-manager');
const { recordCheckSuccess } = require('./status-tracker');

// --- Konfiguration ---
// Webhook-URL für Benachrichtigungen (aus Umgebungsvariablen oder .env laden)
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''; 
// Maximales Alter eines PRs in Tagen, bevor ein Alert gesendet wird
const MAX_PR_AGE_DAYS = 3; 
// GitHub Repository (z.B. 'owner/repo')
const GITHUB_REPO = 'Kryptonator/burnitoken.com'; // Bitte anpassen, falls nötig

// --- Hilfsfunktionen ---
/**
 * Prüft, ob die GitHub CLI installiert ist.
 */
function isGhCliInstalled() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// --- Hauptlogik ---
async function monitorDependabot() {
  console.log(`🔍 Überwache Dependabot PRs für das Repository: ${GITHUB_REPO}...`);

  if (!isGhCliInstalled()) {
    const errorTitle = 'GitHub CLI (gh) ist nicht installiert';
    const errorBody = `Das Dependabot-Monitoring-Tool benötigt die GitHub CLI, um zu funktionieren. Bitte installieren Sie sie von [https://cli.github.com/](https://cli.github.com/) und stellen Sie sicher, dass sie im Systempfad verfügbar ist.`;
    console.error(`❌ ${errorTitle}`);
    await sendAlert(errorTitle, errorBody, ['blocker', 'dependabot', 'setup']);
    createTodo(
      errorTitle,
      errorBody,
      'Dependabot Monitor'
    );
    return;
  }

  // Führe den GitHub CLI-Befehl aus, um offene PRs von Dependabot abzurufen
  exec(
    `gh pr list --repo ${GITHUB_REPO} --author "app/dependabot" --state open --json number,title,createdAt`,
    async (error, stdout, stderr) => {
      if (error) {
        console.error(`Fehler beim Abrufen der PRs: ${error.message}`);
        const errorTitle = 'Fehler beim Abrufen von Dependabot PRs';
        const errorBody = `Dependabot Monitor konnte keine PRs abrufen.\nFehlerdetails: ${stderr}`;
        await sendAlert(errorTitle, errorBody, ['bug', 'dependabot', 'ci-cd']);
        createTodo(
          errorTitle,
          errorBody,
          'Dependabot Monitor'
        );
        return;
      }

      try {
        const prs = JSON.parse(stdout);
        if (prs.length === 0) {
          console.log('✅ Keine offenen Dependabot PRs gefunden.');
          recordCheckSuccess('dependabot-monitor');
          return;
        }

        console.log(`📊 ${prs.length} offene Dependabot PR(s) gefunden.`);
        const now = new Date();
        let overduePrs = 0;

        for (const pr of prs) {
          const createdAt = new Date(pr.createdAt);
          const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

          if (ageInDays > MAX_PR_AGE_DAYS) {
            overduePrs++;
            const alertTitle = `Überfälliger Dependabot PR: #${pr.number}`;
            const alertBody = `Dependabot PR #${pr.number} ("${pr.title}") ist seit ${Math.floor(ageInDays)} Tagen offen und benötigt eine Überprüfung.`
            console.warn(`❗ ALERT: ${alertBody}`);
            await sendAlert(alertTitle, alertBody, ['warning', 'dependabot', 'stale']);
            createTodo(
              alertTitle,
              `Der Dependabot Pull Request #${pr.number} ("${pr.title}") im Repository ${GITHUB_REPO} ist seit ${Math.floor(ageInDays)} Tagen offen und erfordert eine manuelle Überprüfung und Zusammenführung.`,
              'Dependabot Monitor'
            );
          }
        }

        if (overduePrs === 0) {
          console.log('✅ Alle offenen Dependabot PRs sind innerhalb des Zeitlimits.');
          recordCheckSuccess('dependabot-monitor');
        } else {
          console.log(`🔔 ${overduePrs} überfällige PR(s) gemeldet.`);
        }

      } catch (parseError) {
        console.error('Fehler beim Parsen der PR-Daten:', parseError);
        const errorTitle = 'Dependabot Monitor Parsing Fehler';
        const errorBody = `Fehler beim Parsen der PR-Daten von GitHub: ${parseError.message}`;
        await sendAlert(errorTitle, errorBody, ['bug', 'dependabot']);
        createTodo(
          errorTitle,
          errorBody,
          'Dependabot Monitor'
        );
      }
    }
  );
}

// Starte die Überwachung
monitorDependabot();
