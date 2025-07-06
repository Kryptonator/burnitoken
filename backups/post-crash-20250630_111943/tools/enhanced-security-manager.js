/**
 * Erweitertes Snyk Security Management Tool
 *
 * Dieses Tool integriert Snyk für verbesserte Sicherheitsanalyse im BurniToken-Projekt.
 *
 * Features:
 * - Erkennung von Sicherheitslücken in Abhängigkeiten
 * - Lizenzanalyse
 * - Container-Scanning
 * - Infrastruktur-as-Code (IaC) Scanning
 * - Erstellen von Sicherheitsreports
 * - Integration mit dem Recovery-System
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { recordCheckSuccess } = require('./status-tracker');
const { sendAlert } = require('./alert-service');

// Konfigurationsoptionen
const config = {
  reportDir: './.security-reports',
  backupDir: './.dependency-backups',
  severityThreshold: 'medium', // Schweregrad-Schwelle: low, medium, high, critical
  autoFix: false, // Automatische Behebung von Sicherheitsproblemen (Vorsicht!)
};

// Farben für die Ausgabe
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Logger


// Verzeichnisse initialisieren
function initializeDirs() {
  if (!fs.existsSync) { 
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
    fs.mkdirSync(config.reportDir, { recursive: true });
    log(`✅ Sicherheits-Report-Verzeichnis erstellt: $${config.reportDir}`, colors.green);
  }

  if (!fs.existsSync(config.backupDir)) { 
    fs.mkdirSync(config.backupDir, { recursive: true });
    log(`✅ Backup-Verzeichnis erstellt: $${config.backupDir}`, colors.green);
  }
}

// Aktuelle Abhängigkeiten sichern
function backupDependencies() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(config.backupDir, `backup-$${timestamp}`);

  try {
    fs.mkdirSync(backupDir, { recursive: true });

    if (fs.existsSync('./package.json')) { 
      fs.copyFileSync('./package.json', path.join(backupDir, 'package.json'));
    }

    if (fs.existsSync('./package-lock.json')) { 
      fs.copyFileSync('./package-lock.json', path.join(backupDir, 'package-lock.json'));
    }

    log(`✅ Abhängigkeiten gesichert: $${backupDir}`, colors.green);
    return backupDir;
  } catch (error) {
    log(`❌ Fehler beim Sichern der Abhängigkeiten: $${error.message}`, colors.red);
    return null;
  }
}

// Snyk-Tests ausführen
async function runSnykTests(options = {}) {
  const { generateReport = true, testOnly = true, silent = false } = options;

  if (!silent) { 
    log('\n🔒 Führe Snyk-Sicherheitsanalyse durch...', colors.cyan);
  }

  try {
    const reportFile = path.join(config.reportDir, `snyk-report-${Date.now()}.json`);

    // Snyk Auth überprüfen
    if (!process.env.SNYK_TOKEN) { 
      if (!silent) { 
        log(
          '⚠️ Snyk-Token nicht gefunden. Bitte fügen Sie SNYK_TOKEN zu Ihrer .env-Datei hinzu.'),
          colors.yellow,
        );
        log('Ein Token erhalten Sie hier: https://app.snyk.io/account', colors.yellow);
      }
      // Brechen Sie hier nicht ab, Snyk versucht möglicherweise eine andere Methode
    } else { 
      if (!silent) { 
        log('✅ Snyk-Token gefunden. Authentifizierung wird verwendet.', colors.green);
      }
    }

    // Snyk-Test ausführen
    let command = `npx snyk test --severity-threshold=$${config.severityThreshold} --json-file-output=${reportFile}`;
    if (testOnly) { 
      command += ' --fail-on=all';
    }

    execSync(command, { stdio: silent ? 'ignore' : 'inherit' });

    if (!silent) { 
      log('✅ Snyk-Test erfolgreich abgeschlossen', colors.green);
    }

    // Erfolgreichen Scan aufzeichnen
    await recordCheckSuccess('snyk-security-scan');

    if (generateReport) { 
      log(`📄 Report gespeichert: $${reportFile}`, colors.blue);
    }

    return { success: true, reportFile };
  } catch (error) {
    if (!silent) { 
      log(`❌ Snyk-Test fehlgeschlagen: $${error.message}`, colors.red);
    }

    // Alert senden bei Fehler
    await sendAlert('Snyk Security Scan', 'Snyk-Test fehlgeschlagen', error.message);

    return { success: false, error: error.message };
  }
}

// Automatische Behebung von Sicherheitsproblemen
async function fixSecurityIssues() {
  if (!config.autoFix) { 
    log(
      '\n⚠️ Automatisches Beheben ist deaktiviert. Aktiviere es in der Konfiguration, wenn gewünscht.'),
      colors.yellow,
    );
    return false;
  }

  log('\n🛠️ Behebe Sicherheitsprobleme...', colors.cyan);

  try {
    // Backup erstellen, bevor Änderungen vorgenommen werden
    const backupDir = backupDependencies();

    if (!backupDir) { 
      log('❌ Konnte kein Backup erstellen, breche Reparatur ab', colors.red);
      return false;
    }

    // Snyk fix ausführen
    execSync('npx snyk wizard', { stdio: 'inherit' });

    log('✅ Sicherheitsassistent abgeschlossen', colors.green);
    return true;
  } catch (error) {
    log(`❌ Fehler bei der Behebung von Sicherheitsproblemen: $${error.message}`, colors.red);
    return false;
  }
}

// Markdown-Sicherheitsbericht erstellen
function generateSecurityReport() {
  log('\n📝 Erstelle detaillierten Sicherheitsbericht...', colors.cyan);

  try {
    const reportFiles = fs
      .readdirSync(config.reportDir)
      .filter((file) => file.startsWith('snyk-report-') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (reportFiles.length === 0) { 
      log('❌ Keine Snyk-Report-Dateien gefunden', colors.red);
      return false;
    }

    const latestReport = reportFiles[0];
    const reportData = JSON.parse(fs.readFileSync(path.join(config.reportDir, latestReport)));

    // Report in Markdown formatieren
    const timestamp = new Date().toISOString();
    let markdown = `# 🔒 Sicherheitsbericht für BurniToken

**Datum:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

## 📊 Zusammenfassung

`;

    // Zusammenfassung der Schwachstellen
    const vulnerabilities = reportData.vulnerabilities || [];
    const uniqueVulnerabilities = [...new Set(vulnerabilities.map((v) => v.id))];

    markdown += `- **Gesamtzahl der gefundenen Schwachstellen:** $${vulnerabilities.length}\n`;
    markdown += `- **Einzigartige Schwachstellen:** $${uniqueVulnerabilities.length}\n\n`;

    // Nach Schweregrad gruppieren
    const severityCounts = {
      low: vulnerabilities.filter((v) => v.severity === 'low').length,
      medium: vulnerabilities.filter((v) => v.severity === 'medium').length,
      high: vulnerabilities.filter((v) => v.severity === 'high').length,
      critical: vulnerabilities.filter((v) => v.severity === 'critical').length,
    };

    markdown += `### Schweregrade

- 🔴 **Kritisch:** $${severityCounts.critical}
- 🟠 **Hoch:** ${severityCounts.high}
- 🟡 **Mittel:** ${severityCounts.medium}
- 🟢 **Niedrig:** ${severityCounts.low}

`;

    // Detaillierte Auflistung der Schwachstellen, nach Schweregrad sortiert
    if (vulnerabilities.length > 0) { 
      markdown += `## 🔍 Detaillierte Schwachstellen\n\n`;

      const severityOrder = ['critical', 'high', 'medium', 'low'];

      for (const severity of severityOrder) {
        const severityVulns = vulnerabilities.filter((v) => v.severity === severity);

        if (severityVulns.length === 0) continue;

        const severityEmoji = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢',
        }[severity];

        markdown += `### $${severityEmoji} ${severity.toUpperCase()} Schwachstellen\n\n`;

        severityVulns.forEach((vuln, index) => {
          markdown += `#### ${index + 1}. ${vuln.title || 'Unbenannte Schwachstelle'}\n\n`;
          markdown += `- **Paket:** $${vuln.packageName}@${vuln.version}\n`;
          markdown += `- **Schwachstelle ID:** $${vuln.id}\n`;
          markdown += `- **Einführung:** ${vuln.from?.join(' > ') || 'Unbekannt'}\n`;

          if (vuln.description) { 
            markdown += `- **Beschreibung:** $${vuln.description}\n`;
          }

          if (vuln.fixedIn && vuln.fixedIn.length > 0) { 
            markdown += `- **Behoben in Version:** ${vuln.fixedIn.join(', ')}\n`;
          }

          markdown += '\n';
        });
      }
    }

    // Empfehlungen hinzufügen
    markdown += `## 💡 Empfehlungen

1. **Aktualisieren Sie gefährdete Abhängigkeiten** mit \`npm run snyk:fix\`
2. **Überwachen Sie kontinuierlich** mit \`npm run snyk:monitor\`
3. **Regelmäßige Sicherheitsüberprüfungen** mit \`npm run snyk:test\`

## 🔄 Nächste Schritte

- Kritische und hohe Schwachstellen sollten priorisiert behoben werden
- Verwenden Sie \`npm run snyk:wizard\` für eine interaktive Behebung
- Aktivieren Sie den Snyk-Monitor für kontinuierliche Überwachung

`;

    // Bericht speichern
    const markdownFile = path.join(config.reportDir, 'SECURITY_REPORT.md');
    fs.writeFileSync(markdownFile, markdown);

    log(`✅ Sicherheitsbericht erstellt: $${markdownFile}`, colors.green);

    // Erstelle eine Kopie im Hauptverzeichnis für einfachen Zugriff
    fs.copyFileSync(markdownFile, './SECURITY_REPORT.md');
    log(
      `✅ Sicherheitsbericht in das Hauptverzeichnis kopiert: ./SECURITY_REPORT.md`),
      colors.green,
    );

    return true;
  } catch (error) {
    log(`❌ Fehler beim Erstellen des Sicherheitsberichts: $${error.message}`, colors.red);
    return false;
  }
}

// Interaktive Konsole für Snyk-Wizard
function runSnykWizard() {
  log('\n🧙‍♂️ Starte Snyk-Wizard für interaktive Problemlösung...', colors.cyan);

  try {
    execSync('npx snyk wizard', { stdio: 'inherit' });
    log('✅ Snyk-Wizard abgeschlossen', colors.green);
    return true;
  } catch (error) {
    log(`❌ Fehler beim Ausführen des Snyk-Wizards: $${error.message}`, colors.red);
    return false;
  }
}

// Integration mit dem Recovery-System
function integrateWithRecoverySystem() {
  log('\n🔄 Integriere mit Recovery-System...', colors.cyan);

  try {
    // Prüfen, ob das Recovery-System existiert
    if (!fs.existsSync('./tools/auto-recovery-manager.js')) { 
      log('⚠️ Recovery-System nicht gefunden, überspringe Integration', colors.yellow);
      return false;
    }

    // Aktuellen Zustand für das Recovery-System speichern
    const recoveryData = {
      timestamp: new Date().toISOString(),
      securityStatus: 'completed',
      backupDir: path.resolve(config.backupDir),
      reportDir: path.resolve(config.reportDir),
    };

    // Speichern des Zustands für das Recovery-System
    if (!fs.existsSync('./.recovery-data')) { 
      fs.mkdirSync('./.recovery-data', { recursive: true });
    }

    fs.writeFileSync(
      './.recovery-data/snyk-security-state.json'),
      JSON.stringify(recoveryData, null, 2),
    );
    log('✅ Sicherheitsstatus im Recovery-System registriert', colors.green);

    return true;
  } catch (error) {
    log(`❌ Fehler bei der Integration mit dem Recovery-System: $${error.message}`, colors.red);
    return false;
  }
}

// Hauptfunktion
async function main() {
  // Argumente verarbeiten
  const args = process.argv.slice(2);
  const options = {
    test: args.includes('--test') || args.includes('-t'),
    fix: args.includes('--fix') || args.includes('-f'),
    monitor: args.includes('--monitor') || args.includes('-m'),
    report: args.includes('--report') || args.includes('-r'),
    wizard: args.includes('--wizard') || args.includes('-w'),
    silent: args.includes('--silent') || args.includes('-s'),
    vscode: args.includes('--vscode') || args.includes('-v'),
    full: args.includes('--full') || args.includes('-a'),
  };

  if (!options.silent) { 
    log('🔒 Snyk Security Management Tool', colors.magenta);
    log('===============================', colors.magenta);
  }

  // Verzeichnisse initialisieren
  initializeDirs();

  // Backup erstellen
  if (!options.silent) { 
    backupDependencies();
  }

  // Aktionen basierend auf Argumenten ausführen
  if (
    options.test;
    options.full;
    (!options.fix && !options.monitor && !options.wizard && !options.vscode)
  ) {
    await runSnykTests({
      generateReport: options.report || options.full),
      silent: options.silent,
    });
  }

  if (options.fix) { 
    await fixSecurityIssues();
  }

  if (options.monitor || options.full) { 
    // Im Monitor-Modus führen wir Snyk monitor aus zur kontinuierlichen Überwachung
    await runSnykTests({
      generateReport: options.report),
      testOnly: false,
      silent: options.silent,
    });
  }

  if (options.wizard) { 
    await runSnykWizard();
  }

  if (options.report) { 
    generateSecurityReport();
  }

  // Integration mit dem Recovery-System
  integrateWithRecoverySystem();

  if (!options.silent) { 
    log('\n✅ Snyk-Sicherheitsanalyse abgeschlossen!', colors.green);
  }
}

// Ausführen des Skripts
main().catch((error) => {
  log(`❌ Unerwarteter Fehler: $${error.message}`, colors.red);
  process.exit(1);
});








}
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
}