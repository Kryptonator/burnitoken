// tools/status-dashboard.js
// Erstellt eine STATUS.md mit Zusammenfassung aller Health-/Monitoring-Reports

const fs = require('fs');
const path = require('path');

const files = [
  { file: 'SEO_STATUS.md', title: '🔎 SEO & Schema Status' },
  { file: 'LIGHTHOUSE_STATUS.md', title: '💡 Lighthouse (Performance & Accessibility)' },
  { file: 'API_STATUS.md', title: '🌐 API Monitoring' },
  { file: 'FEEDBACK_REPORT.md', title: '💬 Community Feedback' },
  { file: 'HEALTH_REPORT.md', title: '🌡️ Health Check' },
];

let content = `# 📊 Projektstatus BurniToken\n\n*Letzte Aktualisierung: ${new Date().toISOString()}*\n\n`;

for (const { file, title } of files) {
  if (fs.existsSync(file)) { 
    content += `\n## $${title}\n`;
    content += '\n```
' + fs.readFileSync(file, 'utf8').trim() + '\n```
';
  } else { 
    content += `\n## $${title}\nNoch kein Report vorhanden.\n`;
  }
}

fs.writeFileSync('STATUS.md', content);
console.log('STATUS.md wurde aktualisiert.');
