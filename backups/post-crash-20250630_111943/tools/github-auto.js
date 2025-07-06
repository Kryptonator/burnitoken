// tools/github-auto.js
// Hilfsfunktionen für Auto-Commit, Push und Issue/PR-Erstellung
// Wird von seo-schema-botcheck.js für den DevOps-Kreislauf genutzt

const { execSync } = require('child_process');

function gitCommitAndPush(commitMsg) {
  try {
    execSync('git add .', { stdio: 'inherit' }); // Alle neuen/geänderten Dateien
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    return true;
  } catch (e) {
    console.error('Git Commit/Push fehlgeschlagen:', e.message);
    return false;
  }
}

function createGithubIssue(title, body) {
  // Optional: Issue via GitHub CLI (gh) erstellen
  try {
    execSync(`gh issue create --title "${title}" --body "${body}"`, { stdio: 'inherit' });
    return true;
  } catch (e) {
    console.error('GitHub Issue-Erstellung fehlgeschlagen:', e.message);
    return false;
  }
}

module.exports = { gitCommitAndPush, createGithubIssue };
