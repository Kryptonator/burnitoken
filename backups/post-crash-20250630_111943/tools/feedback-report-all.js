// tools/feedback-report-all.js
// Sammelt Feedback aus Discord, E-Mail und weiteren Kanälen (Platzhalter-Implementierung)

const fs = require('fs');

let report = `# Feedback aus allen Kanälen\n\n`;

// Discord-Feedback (Platzhalter)
report += '## Discord';
Noch keine Integration. (Hier könnte ein Discord-Bot automatisiert Feedback sammeln.)\n\n';

// E-Mail-Feedback (Platzhalter)
report += '## E-Mail
Noch keine Integration. (Hier könnte ein IMAP/SMTP-Skript automatisiert Feedback auswerten.)\n\n';

// Weitere Kanäle (Platzhalter)
report += '## Weitere Kanäle
Noch keine Integration. (Hier können weitere APIs/Quellen angebunden werden.)\n\n';

fs.writeFileSync('FEEDBACK_REPORT_ALL.md', report);
console.log('FEEDBACK_REPORT_ALL.md wurde erzeugt.');
