const fs = require('fs');
const path = require('path');

const logFile = 'git_status_summary.log';
const outputFile = 'change_analysis_report.json';

const categorization = {
  sourceCode: {
    extensions: ['.js', '.html', '.css', '.ps1', '.bat', '.sh', '.ts'],
    files: [],
  },
  config: {
    extensions: ['.json', '.yml', '.yaml', '.xml', '.toml', '.ini', '.cfg'],
    files: [],
  },
  documentation: {
    extensions: ['.md', '.txt', '.docx', '.pdf'],
    files: [],
  },
  assets: {
    extensions: [
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.ico',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot',
    ],
    files: [],
  },
  logsAndTemp: {
    extensions: ['.log', '.tmp', '.temp', '.bak', '.swp'],
    files: [],
  },
  dependencies: {
    filenames: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
    files: [],
  },
  git: {
    filenames: ['.gitignore', '.gitattributes', '.gitmodules'],
    files: [],
  },
  vscode: {
    directories: ['.vscode'],
    files: [],
  },
  other: {
    files: [],
  },
};

function categorizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);
  const dirname = path.dirname(filePath);

  if (categorization.dependencies.filenames.includes(filename)) {
    categorization.dependencies.files.push(filePath);
    return;
  }
  if (categorization.git.filenames.includes(filename)) {
    categorization.git.files.push(filePath);
    return;
  }
  if (dirname.includes('.vscode')) {
    categorization.vscode.files.push(filePath);
    return;
  }

  for (const category in categorization) {
    if (categorization[category].extensions && categorization[category].extensions.includes(ext)) {
      categorization[category].files.push(filePath);
      return;
    }
  }

  categorization.other.files.push(filePath);
}

function cleanGitStatusLine(line) {
  // Entfernt Null-Zeichen (\u0000) und andere Steuerzeichen, die durch die Umleitung in PowerShell entstehen können.
  // Konvertiert die Zeile in ein lesbares Format.
  const cleanedLine = line.replace(/\u0000/g, '').trim();

  // Extrahiert den Dateipfad nach dem Status-Kürzel (z.B. " M ", "?? ")
  const match = cleanedLine.match(/^(?:[AMDRCU? ]{1,2})\s+(.*)$/);
  if (match && match[1]) {
    // Entfernt mögliche Anführungszeichen, die Git bei Pfaden mit Leerzeichen hinzufügt
    return match[1].replace(/"/g, '');
  }
  return cleanedLine; // Fallback
}

try {
  const data = fs.readFileSync(logFile, 'utf8');
  const lines = data.split('\n').filter((line) => line.trim() !== '');

  lines.forEach((line) => {
    // Extract file path from git status line
    const filePath = cleanGitStatusLine(line);
    if (filePath) {
      categorizeFile(filePath);
    }
  });

  const report = {
    totalChanges: lines.length,
    analysisDate: new Date().toISOString(),
    summary: {},
  };

  for (const category in categorization) {
    const count = categorization[category].files.length;
    if (count > 0) {
      report.summary[category] = count;
    }
  }

  report.details = categorization;

  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  console.log(`✅ Analyse abgeschlossen. Bericht wurde in ${outputFile} gespeichert.`);
  console.log('Zusammenfassung:', report.summary);
} catch (error) {
  console.error(`❌ Fehler bei der Analyse der Git-Änderungen: ${error.message}`);
}
