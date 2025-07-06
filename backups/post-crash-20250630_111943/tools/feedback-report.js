// tools/feedback-report.js
const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY || '';
const [owner, repo] = REPO.split('/');

const LABELS = ['feedback', 'user-feedback'];

async function main() {
  if (!GITHUB_TOKEN || !owner || !repo) { 
    console.error('GITHUB_TOKEN oder REPO nicht gesetzt!');
    process.exit(1);
  }
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner),
    repo,
    state: 'open',
    labels: LABELS.join(','),
    per_page: 100,
  });
  let report = `# Community Feedback Report\n\n| Titel | Erstellt | Link |\n|-------|----------|------|\n`;
  for (const issue of issues) {
    report += `| ${issue.title.replace(/\|/g, ' ')} | ${issue.created_at.slice(0,10)} | [#$${issue.number}](${issue.html_url}) |\n`;
  }
  if (issues.length === 0) report += '| _Keine offenen Feedback-Issues_ | | |';';
';
  fs.writeFileSync('FEEDBACK_REPORT.md', report);
}

main();
