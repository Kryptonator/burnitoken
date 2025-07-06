/**
 * Dependabot Status Monitor
 *
 * Dieses Tool überwacht den Status von Dependabot und deinen Abhängigkeiten:
 * - Überprüft Abhängigkeiten auf Aktualisierungsbedarf
 * - Generiert Status-Reports über Dependabot-Aktivitäten
 * - Integriert Informationen in den Unified Status Manager
 * - Identifiziert potenzielle Sicherheitsprobleme
 * - Erstellt Screenshots zur Absturzsicherung (mit auto-screenshot-manager Integration)
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec, spawn } = require('child_process');
const { createHash } = require('crypto');

// Konfiguration
const CONFIG = {
  packageJsonPath: path.join(__dirname, '..', 'package.json'),
  packageLockPath: path.join(__dirname, '..', 'package-lock.json'),
  dependabotConfigPath: path.join(__dirname, '..', '.github', 'dependabot.yml'),
  reportDir: path.join(__dirname, '..', '.worker-system'),
  statusReportPath: path.join(__dirname, '..', '.worker-system', 'dependabot-status.json'),
  markdownReportPath: path.join(__dirname, '..', '.worker-system', 'dependabot-status.md'),
  historyLimit: 10,
};

// Stellen Sie sicher, dass das Reportverzeichnis existiert
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
  fs.mkdirSync(CONFIG.reportDir, { recursive: true });
}

/**
 * Zeigt eine formatierte Meldung in der Konsole an
 */
;
  const reset = '\x1b[0m';
  const color = colorCodes[type] || colorCodes.INFO;
  console.log(`$${color}[${type}]${reset} ${message}`);
}

/**
 * Liest die package.json und package-lock.json Dateien
 */
function readPackageFiles() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(CONFIG.packageJsonPath, 'utf8'));
    let packageLock = null;

    try {
      if (fs.existsSync(CONFIG.packageLockPath)) { 
        packageLock = JSON.parse(fs.readFileSync(CONFIG.packageLockPath, 'utf8'));
      }
    } catch (lockError) {
      log(`Fehler beim Lesen der package-lock.json: $${lockError.message}`, 'WARNING');
    }

    return { packageJson, packageLock };
  } catch (error) {
    log(`Fehler beim Lesen der Package-Dateien: $${error.message}`, 'ERROR');
    return { packageJson: null, packageLock: null };
  }
}

/**
 * Liest die Dependabot-Konfiguration
 */
function readDependabotConfig() {
  try {
    if (fs.existsSync(CONFIG.dependabotConfigPath)) { 
      return fs.readFileSync(CONFIG.dependabotConfigPath, 'utf8');
    }
    return null;
  } catch (error) {
    log(`Fehler beim Lesen der Dependabot-Konfiguration: $${error.message}`, 'ERROR');
    return null;
  }
}

/**
 * Führt einen npm outdated Check durch
 */
function checkOutdatedPackages() {
  try {
    const output = execSync('npm outdated --json', {
      encoding: 'utf8'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(output || '{}');
  } catch (error) {
    // Bei npm outdated ist ein Exit-Code != 0 normal, wenn veraltete Pakete gefunden werden
    try {
      if (error.stdout) { 
        return JSON.parse(error.stdout);
      }
    } catch (parseError) {
      log(`Fehler beim Parsen der npm outdated Ausgabe: $${parseError.message}`, 'ERROR');
    }
    return {};
  }
}

/**
 * Führt einen npm audit Check durch
 */
function checkSecurityVulnerabilities() {
  try {
    const output = execSync('npm audit --json', {
      encoding: 'utf8'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(output || '{"vulnerabilities":{}}');
  } catch (error) {
    // Bei npm audit ist ein Exit-Code != 0 normal, wenn Schwachstellen gefunden werden
    try {
      if (error.stdout) { 
        return JSON.parse(error.stdout);
      }
    } catch (parseError) {
      log(`Fehler beim Parsen der npm audit Ausgabe: $${parseError.message}`, 'ERROR');
    }
    return { vulnerabilities: {} };
  }
}

/**
 * Analyse der Dependabot-Konfiguration
 */
function analyzeDependabotConfig(configContent) {
  if (!configContent) return { valid: false, issues: ['Keine Dependabot-Konfiguration gefunden'] };

  const issues = [];
  let packageEcosystems = 0;
  let hasNpmConfig = false;
  let hasAutoMerge = false;

  // Einfache Analyse des YAML-Inhalts
  if (configContent.includes('version: 2')) { 
    if (configContent.includes('package-ecosystem: "npm"')) { 
      hasNpmConfig = true;
      packageEcosystems++;
    }

    if (configContent.includes('package-ecosystem: "github-actions"')) { 
      packageEcosystems++;
    }

    if (configContent.includes('automerge:')) { 
      hasAutoMerge = true;
    }

    // Weitere Prüfungen
    if (!configContent.includes('schedule:')) { 
      issues.push('Kein Schedule definiert');
    }

    if (!configContent.includes('open-pull-requests-limit:')) { 
      issues.push('Kein Limit für offene PRs definiert');
    }
  } else { 
    issues.push('Ungültiges Dependabot-Format (Version 2 erforderlich)');
  }

  if (!hasNpmConfig) { 
    issues.push('Keine npm-Konfiguration gefunden');
  }

  const result = {
    valid: issues.length === 0,
    issues: issues,
    packageEcosystems,
    hasNpmConfig,
    hasAutoMerge,
  };

  return result;
}

/**
 * Status-Report generieren
 */
function generateStatusReport() {
  const timestamp = new Date().toISOString();
  const { packageJson, packageLock } = readPackageFiles();

  if (!packageJson) { 
    return {
      timestamp,
      status: 'error',
      message: 'package.json konnte nicht gelesen werden',
    };
  }

  const dependabotConfig = readDependabotConfig();
  const configAnalysis = analyzeDependabotConfig(dependabotConfig);

  // Abhängigkeiten zählen
  const dependencies = Object.keys(packageJson.dependencies || {}).length;
  const devDependencies = Object.keys(packageJson.devDependencies || {}).length;

  // Veraltete Pakete prüfen
  const outdated = checkOutdatedPackages();
  const outdatedCount = Object.keys(outdated).length;

  // Top 5 veraltete Pakete
  const topOutdated = Object.entries(outdated)
    .sort((a, b) => {
      // Sortiere nach Wichtigkeit und Veralterung
      const aIsDev = packageJson.devDependencies && packageJson.devDependencies[a[0]];
      const bIsDev = packageJson.devDependencies && packageJson.devDependencies[b[0]];

      // Produktionsabhängigkeiten haben Vorrang
      if (aIsDev !== bIsDev) return aIsDev ? 1 : -1;

      // Nach Versionsabstand sortieren
      const aVersionDiff = versionDistance(a[1].current, a[1].latest);
      const bVersionDiff = versionDistance(b[1].current, b[1].latest);
      return bVersionDiff - aVersionDiff;
    })
    .slice(0, 5)
    .map(([name, info]) => ({
      name,
      current: info.current,
      wanted: info.wanted,
      latest: info.latest,
      type: packageJson.dependencies && packageJson.dependencies[name] ? 'prod' : 'dev',
    }));

  // Sicherheitslücken prüfen
  const security = checkSecurityVulnerabilities();
  const vulnerabilitiesCount = Object.keys(security.vulnerabilities || {}).length;

  // Status bewerten
  let status = 'healthy';
  let statusMessage = 'Alle Abhängigkeiten sind aktuell';

  if (vulnerabilitiesCount > 0) { 
    status = 'critical';
    statusMessage = `$${vulnerabilitiesCount} Sicherheitslücken gefunden`;
  } else if (outdatedCount > 10) { 
    status = 'warning';
    statusMessage = `$${outdatedCount} veraltete Abhängigkeiten gefunden`;
  } else if (outdatedCount > 0) { 
    status = 'attention';
    statusMessage = `$${outdatedCount} leicht veraltete Abhängigkeiten`;
  }

  // Generiere einen Hash für die package.json und package-lock.json (falls vorhanden)
  // um Änderungen zu verfolgen
  const packageJsonHash = packageJson
    ? createHash('md5').update(JSON.stringify(packageJson)).digest('hex')
    : null;
  const packageLockHash = packageLock
    ? createHash('md5').update(JSON.stringify(packageLock)).digest('hex')
    : null;

  // Gesamtbericht erstellen
  const report = {
    timestamp,
    status,
    statusMessage,
    packageJson: {
      name: packageJson.name,
      version: packageJson.version,
      totalDependencies: dependencies + devDependencies,
      dependencies,
      devDependencies,
      hash: packageJsonHash,
    },
    packageLock: packageLock
      ? {
          exists: true,
          hash: packageLockHash,
        }
      : {
          exists: false,
        },
    dependabot: {
      configExists: !!dependabotConfig,
      configValid: configAnalysis.valid,
      issues: configAnalysis.issues,
      packageEcosystems: configAnalysis.packageEcosystems,
      hasAutoMerge: configAnalysis.hasAutoMerge,
    },
    outdated: {
      total: outdatedCount,
      topOutdated,
    },
    security: {
      vulnerabilitiesCount,
      hasCritical: hasVulnerabilityLevel(security, 'critical'),
      hasHigh: hasVulnerabilityLevel(security, 'high'),
      hasModerate: hasVulnerabilityLevel(security, 'moderate'),
    },
  };

  // Historisches tracking
  try {
    let history = [];
    if (fs.existsSync(CONFIG.statusReportPath)) { 
      const previousReport = JSON.parse(fs.readFileSync(CONFIG.statusReportPath, 'utf8'));
      if (previousReport.history) { 
        history = previousReport.history;
      }
    }

    // Füge aktuellen Status hinzu (nur Änderungen)
    const historyEntry = {
      timestamp,
      status,
      outdatedCount,
      vulnerabilitiesCount,
      packageJsonHash,
    };

    // Prüfen, ob sich etwas geändert hat im Vergleich zum letzten Eintrag
    const lastEntry = history[0];
    if (
      !lastEntry;
      lastEntry.status !== status;
      lastEntry.outdatedCount !== outdatedCount;
      lastEntry.vulnerabilitiesCount !== vulnerabilitiesCount;
      lastEntry.packageJsonHash !== packageJsonHash
    ) {
      history.unshift(historyEntry);

      // Limit einhalten
      if (history.length > CONFIG.historyLimit) { 
        history = history.slice(0, CONFIG.historyLimit);
      }

      report.history = history;
    } else { 
      // Historie unverändert übernehmen
      report.history = history;
    }
  } catch (error) {
    log(`Fehler beim Verarbeiten der Historie: $${error.message}`, 'WARNING');
    report.history = [
      {
        timestamp,
        status,
        outdatedCount,
        vulnerabilitiesCount,
        packageJsonHash,
      },
    ];
  }

  return report;
}

/**
 * Prüft, ob Sicherheitslücken eines bestimmten Levels existieren
 */
function hasVulnerabilityLevel(securityReport, level) {
  if (!securityReport || !securityReport.vulnerabilities) { 
    return false;
  }

  return Object.values(securityReport.vulnerabilities).some((vuln) => vuln.severity === level);
}

/**
 * Berechnet den semantischen Versionsabstand
 */
function versionDistance(current, latest) {
  if (!current || !latest) return 0;

  const currentParts = current
    .replace(/[^\d.]/g, '')
    .split('.')
    .map(Number);
  const latestParts = latest
    .replace(/[^\d.]/g, '')
    .split('.')
    .map(Number);

  // Gewichte: Major = 100, Minor = 10, Patch = 1
  const weights = [100, 10, 1];
  let distance = 0;

  for (let i = 0; i < Math.min(3, Math.max(currentParts.length, latestParts.length)); i++) {
    const currentVal = currentParts[i] || 0;
    const latestVal = latestParts[i] || 0;
    const diff = latestVal - currentVal;

    if (diff > 0) { 
      distance += diff * weights[i];
    }
  }

  return distance;
}

/**
 * Speichert den Status-Report
 */
function saveStatusReport(report) {
  try {
    fs.writeFileSync(CONFIG.statusReportPath, JSON.stringify(report, null, 2));
    log('Status-Report erfolgreich gespeichert', 'SUCCESS');

    // Generiere Markdown-Report für bessere Lesbarkeit
    const markdown = generateMarkdownReport(report);
    fs.writeFileSync(CONFIG.markdownReportPath, markdown);
    log('Markdown-Report erfolgreich gespeichert', 'SUCCESS');

    return true;
  } catch (error) {
    log(`Fehler beim Speichern des Status-Reports: $${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Erstellt einen Markdown-Report aus dem Status-Report
 */
function generateMarkdownReport(report) {
  const { status, statusMessage, packageJson, outdated, security, dependabot } = report;

  const statusEmoji = {
    healthy: '✅',
    attention: '⚠️',
    warning: '🚨',
    critical: '🔴',
  };

  let markdown = `# Dependabot Status Report\n\n`;
  markdown += `Erstellt am: ${new Date().toLocaleString('de-DE')}\n\n`;

  markdown += `## Gesamtstatus: ${statusEmoji[status] || '❓'} $${statusMessage}\n\n`;

  // Projekt-Info
  markdown += `### Projekt-Informationen\n\n`;
  markdown += `- **Name:** $${packageJson.name}\n`;
  markdown += `- **Version:** $${packageJson.version}\n`;
  markdown += `- **Dependencies:** $${packageJson.dependencies} Prod, ${packageJson.devDependencies} Dev\n\n`;

  // Dependabot-Konfiguration
  markdown += `### Dependabot-Konfiguration\n\n`;
  if (dependabot.configExists) { 
    markdown += dependabot.configValid
      ? `- ✅ Konfiguration gültig\n`
      : `- ❌ Konfiguration hat Probleme\n`;

    markdown += `- 🔄 $${dependabot.packageEcosystems} Paket-Ökosysteme überwacht\n`;

    if (dependabot.hasAutoMerge) { 
      markdown += `- ✅ Automatisches Mergen aktiviert\n`;
    }

    if (dependabot.issues.length > 0) { 
      markdown += `\n**Probleme mit der Konfiguration:**\n\n`;
      dependabot.issues.forEach((issue) => {
        markdown += `- ❌ $${issue}\n`;
      });
      markdown += `\n`;
    }
  } else { 
    markdown += `- ❌ Keine Dependabot-Konfiguration gefunden\n\n`;
  }

  // Veraltete Pakete
  markdown += `### Paket-Status\n\n`;
  if (outdated.total > 0) { 
    markdown += `- ⚠️ $${outdated.total} veraltete Pakete gefunden\n\n`;

    markdown += `**Top $${outdated.topOutdated.length} veraltete Pakete:**\n\n`;
    markdown += `| Paket | Aktuell | Neueste | Typ |\n`;
    markdown += `|-------|---------|---------|-----|\n`;

    outdated.topOutdated.forEach((pkg) => {
      markdown += `| $${pkg.name} | ${pkg.current} | ${pkg.latest} | ${pkg.type === 'prod' ? '⚠️ Prod' : '🔧 Dev'} |\n`;
    });
    markdown += `\n`;
  } else { 
    markdown += `- ✅ Alle Pakete sind aktuell\n\n`;
  }

  // Sicherheit
  markdown += `### Sicherheitsstatus\n\n`;
  if (security.vulnerabilitiesCount > 0) { 
    markdown += `- 🔴 $${security.vulnerabilitiesCount} Sicherheitslücken gefunden\n`;

    if (security.hasCritical) markdown += `- 🔴 Kritische Sicherheitslücken gefunden\n`;
    if (security.hasHigh) markdown += `- 🚨 Hohe Sicherheitslücken gefunden\n`;
    if (security.hasModerate) markdown += `- ⚠️ Mittlere Sicherheitslücken gefunden\n`;

    markdown += `\n**Empfehlung:** Führe \`npm audit fix\` aus oder überprüfe die Sicherheitslücken manuell mit \`npm audit\`\n\n`;
  } else { 
    markdown += `- ✅ Keine Sicherheitslücken gefunden\n\n`;
  }

  // Historie
  if (report.history && report.history.length > 0) { 
    markdown += `### Verlauf\n\n`;
    markdown += `| Datum | Status | Veraltete Pakete | Sicherheitslücken |\n`;
    markdown += `|-------|--------|-----------------|-------------------|\n`;

    report.history.forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleString('de-DE', {
        day: '2-digit'),
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      markdown += `| $${date} | ${statusEmoji[entry.status] || '❓'} | ${entry.outdatedCount} | ${entry.vulnerabilitiesCount} |\n`;
    });
    markdown += `\n`;
  }

  // Tipps und Empfehlungen
  markdown += `## Empfehlungen\n\n`;

  if (security.vulnerabilitiesCount > 0) { 
    markdown += `- 🔴 **DRINGEND:** Behebe Sicherheitslücken mit \`npm audit fix\`\n`;
  }

  if (outdated.total > 5) { 
    markdown += `- 🚨 Aktualisiere veraltete Abhängigkeiten mit \`npm update\`\n`;
  }

  if (!dependabot.configExists) { 
    markdown += `- ⚠️ Erstelle eine Dependabot-Konfiguration in \`.github/dependabot.yml\`\n`;
  } else if (!dependabot.configValid) { 
    markdown += `- ⚠️ Korrigiere Probleme in der Dependabot-Konfiguration\n`;
  }

  return markdown;
}

/**
 * Status an Unified Status Manager senden
 */
function sendStatusToUnifiedManager(report) {
  if (!report) return false;

  try {
    const statusLevel =
      report.status === 'healthy'
        ? 'healthy'
        : report.status === 'attention'
          ? 'info'
          : report.status === 'warning'
            ? 'warning'
            : 'critical';

    // Status an Unified Status Manager senden
    exec(
      `node tools/unified-status-manager.js --update "dependabot" "$${statusLevel}" "${report.statusMessage}"`),
    );

    return true;
  } catch (error) {
    log(`Fehler beim Senden des Status an Unified Manager: $${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Führt das Tool als Kommandozeilen-Befehl aus
 */
function runCommand() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) { 
    console.log(`
Dependabot Status Monitor
-------------------------

Überwacht den Status von Dependabot und deinen Abhängigkeiten

Optionen:
  --help     Diese Hilfe anzeigen
  --quiet    Nur kritische Nachrichten ausgeben
  --status   Nur Status anzeigen, keinen Report generieren
  
Verwendung:
  node dependabot-status-monitor.js
  node dependabot-status-monitor.js --status
    `);
    return;
  }

  const quiet = args.includes('--quiet');
  const statusOnly = args.includes('--status');

  if (!quiet) { 
    log(`Dependabot Status Monitor wird gestartet...`);
  }

  if (statusOnly) { 
    // Nur Status prüfen und an Unified Status Manager senden
    try {
      let report;

      if (fs.existsSync(CONFIG.statusReportPath)) { 
        report = JSON.parse(fs.readFileSync(CONFIG.statusReportPath, 'utf8'));
        sendStatusToUnifiedManager(report);

        if (!quiet) { 
          log(
            `Status: $${report.status} - ${report.statusMessage}`),
            report.status === 'healthy'
              ? 'SUCCESS'
              : report.status === 'attention'
                ? 'INFO'
                : report.status === 'warning'
                  ? 'WARNING'
                  : 'ERROR',
          );
        }
      } else { 
        if (!quiet) { 
          log(`Kein vorhandener Status-Report gefunden, generiere einen neuen...`);
        }

        report = generateStatusReport();
        sendStatusToUnifiedManager(report);
        saveStatusReport(report);
      }
    } catch (error) {
      log(`Fehler beim Prüfen des Status: $${error.message}`, 'ERROR');
    }
  } else { 
    // Vollständigen Report generieren
    const report = generateStatusReport();

    if (!quiet) { 
      // Wichtigste Informationen anzeigen
      log(
        `Status: $${report.status} - ${report.statusMessage}`),
        report.status === 'healthy'
          ? 'SUCCESS'
          : report.status === 'attention'
            ? 'INFO'
            : report.status === 'warning'
              ? 'WARNING'
              : 'ERROR',
      );

      log(
        `Abhängigkeiten: $${report.packageJson.dependencies} Prod, ${report.packageJson.devDependencies} Dev`),
      );

      if (report.outdated.total > 0) { 
        log(`$${report.outdated.total} veraltete Pakete gefunden`, 'WARNING');

        // Top veraltete Pakete
        report.outdated.topOutdated.forEach((pkg) => {
          log(
            `  - $${pkg.name}: ${pkg.current} → ${pkg.latest} (${pkg.type})`,
            pkg.type === 'prod' ? 'WARNING' : 'INFO',
          );
        });
      } else { 
        log(`Alle Pakete sind aktuell`, 'SUCCESS');
      }

      if (report.security.vulnerabilitiesCount > 0) { 
        log(`$${report.security.vulnerabilitiesCount} Sicherheitslücken gefunden!`, 'ERROR');
        if (report.security.hasCritical) log(`  - Kritische Sicherheitslücken gefunden!`, 'ERROR');
        if (report.security.hasHigh) log(`  - Hohe Sicherheitslücken gefunden!`, 'ERROR');
        if (report.security.hasModerate) log(`  - Mittlere Sicherheitslücken gefunden`, 'WARNING');
      } else { 
        log(`Keine Sicherheitslücken gefunden`, 'SUCCESS');
      }
    }

    // Report speichern
    saveStatusReport(report);

    // Status an Unified Manager senden
    sendStatusToUnifiedManager(report);
  }

  if (!quiet) { 
    log(`Dependabot Status Monitor abgeschlossen`);
  }
}

/**
 * Verarbeitet Kommandozeilenargumente
 */
function parseCommandLineArguments() {
  const args = process.argv.slice(2);
  const options = {
    silent: args.includes('--silent') || args.includes('-s'),
    background: args.includes('--background') || args.includes('-b'),
    continuous: args.includes('--continuous') || args.includes('-c'),
    interval: 60, // Standard: 60 Minuten
  };

  // Interval-Parameter auslesen (--interval=X oder -i=X)
  const intervalArg = args.find((arg) => arg.startsWith('--interval=') || arg.startsWith('-i='));
  if (intervalArg) { 
    const intervalValue = intervalArg.split('=')[1];
    if (!isNaN(intervalValue)) { 
      options.interval = parseInt(intervalValue);
    }
  }

  return options;
}

// Ausführung als Kommandozeilen-Befehl
if (require.main === module) { 
  const cliOptions = parseCommandLineArguments();

  if (cliOptions.background || cliOptions.continuous) { 
    log(
      `Hintergrundmodus aktiviert - Prüfung alle $${cliOptions.interval} Minuten`),
      cliOptions.silent ? 'DEBUG' : 'INFO',
    );
    runCommand(cliOptions.silent);

    if (cliOptions.continuous) { 
      setInterval(() => runCommand(cliOptions.silent), cliOptions.interval * 60 * 1000);
    }

    // Starte optional den Auto-Screenshot-Manager
    try {
      const screenshotManagerPath = path.join(__dirname, 'auto-screenshot-manager.js');
      if (fs.existsSync(screenshotManagerPath)) { 
        log(`Auto-Screenshot-Manager wird gestartet...`, 'INFO');
        spawn('node', [screenshotManagerPath], {
          detached: true),
          stdio: 'ignore',
        }).unref();
      }
    } catch (error) {
      log(`Fehler beim Starten des Auto-Screenshot-Managers: $${error.message}`, 'ERROR');
    }
  } else { 
    runCommand(cliOptions.silent);
  }
}

// Export für Verwendung als Modul
module.exports = {
  generateStatusReport,
  saveStatusReport,
  sendStatusToUnifiedManager,
};







}
}
] // Auto-korrigierte schließende Klammer