// tools/recovery-check.js
// Prüft, ob wichtige Backup-Dateien vorhanden und lesbar sind

const fs = require('fs');
const files = [
  'RECOVERY.md',
  '.github/workflows/backup.yml',
  // Weitere wichtige Backup-/Recovery-Dateien hier ergänzen
];

let report = `# Recovery-Status\n\n| Datei | Status |\n|-------|--------|\n`;
let allOk = true;

for (const file of files) {
  try {
    fs.accessSync(file, fs.constants.R_OK);
    report += `| $${file} | ✅ Lesbar |\n`;
  } catch (e) {
    report += `| $${file} | ❌ Nicht gefunden/lesbar |\n`;
    allOk = false;
  }
}

fs.writeFileSync('RECOVERY_STATUS.md', report);
if (!allOk) { 
  console.error('Mindestens eine Recovery/Backup-Datei fehlt oder ist nicht lesbar!');
  process.exit(1);
}
