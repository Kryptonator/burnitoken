/**
 * Snyk Auto-Scheduler
 *
 * Dieses Skript führt geplante Sicherheitsscans mit Snyk durch und
 * erstellt regelmäßige Backups.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const config = {
  reportDir: './.security-reports',
  dailyScanTime: '08:00', // Täglicher Scan um 8 Uhr morgens
  weeklyScanDay: 1, // 0 = Sonntag, 1 = Montag, ...
  weeklyScanTime: '09:00', // Wöchentlicher umfassender Scan um 9 Uhr morgens
};

// Farben für die Konsolenausgabe
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Logger-Funktion
function log(message, color = colors.reset) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} - ${color}${message}${colors.reset}`);
}

// Verzeichnisse initialisieren
function initDirectories() {
  if (!fs.existsSync(config.reportDir)) {
    fs.mkdirSync(config.reportDir, { recursive: true });
    log(`✅ Report-Verzeichnis erstellt: ${config.reportDir}`, colors.green);
  }
}

// Täglichen Scan durchführen
async function runDailyScan() {
  try {
    log('🔄 Starte täglichen Sicherheitsscan...', colors.blue);

    // Backup erstellen
    execSync('node tools/snyk-auto-backup.js --silent', { stdio: 'inherit' });

    // Snyk Test durchführen
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const reportFile = path.join(config.reportDir, `daily-scan-${timestamp}.md`);

    fs.writeFileSync(reportFile, `# 🔒 Daily Security Scan: ${timestamp}\n\n`);
    fs.appendFileSync(reportFile, `## NPM Audit\n\n`);

    try {
      const npmAudit = execSync('npm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(npmAudit);
      fs.appendFileSync(
        reportFile,
        `Vulnerabilities: ${JSON.stringify(auditData.metadata.vulnerabilities, null, 2)}\n\n`,
      );
    } catch (error) {
      fs.appendFileSync(reportFile, `Fehler bei npm audit: ${error.message}\n\n`);
    }

    fs.appendFileSync(reportFile, `## Snyk Test\n\n`);
    try {
      execSync('npx snyk test --json > ./snyk-test-temp.json', { stdio: 'pipe' });
      if (fs.existsSync('./snyk-test-temp.json')) {
        const snykData = JSON.parse(fs.readFileSync('./snyk-test-temp.json', 'utf8'));

        if (snykData.vulnerabilities && Array.isArray(snykData.vulnerabilities)) {
          fs.appendFileSync(
            reportFile,
            `Gefundene Schwachstellen: ${snykData.vulnerabilities.length}\n\n`,
          );

          snykData.vulnerabilities.forEach((vuln) => {
            fs.appendFileSync(
              reportFile,
              `### ${vuln.severity}: ${vuln.packageName} - ${vuln.title}\n\n`,
            );
            fs.appendFileSync(reportFile, `- ID: ${vuln.id}\n`);
            fs.appendFileSync(reportFile, `- Infizierter Pfad: ${vuln.from.join(' > ')}\n`);
            fs.appendFileSync(
              reportFile,
              `- Beschreibung: ${vuln.description || 'Keine Beschreibung verfügbar'}\n\n`,
            );
          });
        } else {
          fs.appendFileSync(reportFile, `Keine Schwachstellen gefunden.\n\n`);
        }

        // Temporäre Datei löschen
        fs.unlinkSync('./snyk-test-temp.json');
      }
    } catch (error) {
      fs.appendFileSync(reportFile, `Fehler bei Snyk Test: ${error.message}\n\n`);
    }

    log(`✅ Täglicher Sicherheitsscan abgeschlossen. Report: ${reportFile}`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Fehler beim täglichen Sicherheitsscan: ${error.message}`, colors.red);
    return false;
  }
}

// Wöchentlichen umfassenden Scan durchführen
async function runWeeklyScan() {
  try {
    log('🔄 Starte wöchentlichen umfassenden Sicherheitsscan...', colors.magenta);

    // Backup erstellen
    execSync('node tools/snyk-auto-backup.js --silent', { stdio: 'inherit' });

    // Umfassenden Scan durchführen
    execSync('node tools/enhanced-security-manager.js --full --report', { stdio: 'inherit' });

    // Alle alten Backups aufräumen
    try {
      execSync('node tools/auto-screenshot-manager.js --now', { stdio: 'pipe' });
    } catch (error) {
      log(
        `⚠️ Warnung: Screenshot-Manager konnte nicht ausgeführt werden: ${error.message}`,
        colors.yellow,
      );
    }

    log('✅ Wöchentlicher umfassender Sicherheitsscan abgeschlossen', colors.green);
    return true;
  } catch (error) {
    log(`❌ Fehler beim wöchentlichen Sicherheitsscan: ${error.message}`, colors.red);
    return false;
  }
}

// Prüfen, ob es Zeit für einen Scan ist
function checkSchedule() {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  const currentDay = now.getDay(); // 0 = Sonntag, 1 = Montag, ...

  // Täglicher Scan
  const [dailyHour, dailyMinute] = config.dailyScanTime.split(':');
  if (currentHour === dailyHour && currentMinute === dailyMinute) {
    log('⏰ Zeit für den täglichen Sicherheitsscan!', colors.blue);
    runDailyScan();
  }

  // Wöchentlicher Scan
  const [weeklyHour, weeklyMinute] = config.weeklyScanTime.split(':');
  if (
    currentDay === config.weeklyScanDay &&
    currentHour === weeklyHour &&
    currentMinute === weeklyMinute
  ) {
    log('⏰ Zeit für den wöchentlichen umfassenden Sicherheitsscan!', colors.magenta);
    runWeeklyScan();
  }
}

// Hauptfunktion
async function main() {
  const args = process.argv.slice(2);
  const options = {
    daily: args.includes('--daily'),
    weekly: args.includes('--weekly'),
    daemon: args.includes('--daemon'),
    silent: args.includes('--silent'),
  };

  // Verzeichnisse initialisieren
  initDirectories();

  if (!options.silent) {
    log('🔒 Snyk Auto-Scheduler', colors.magenta);
    log('=====================', colors.magenta);
  }

  if (options.daily) {
    await runDailyScan();
    return;
  }

  if (options.weekly) {
    await runWeeklyScan();
    return;
  }

  if (options.daemon) {
    if (!options.silent) {
      log('🔄 Starte Scheduler im Daemon-Modus...', colors.blue);
      log(`⏰ Täglicher Scan geplant für: ${config.dailyScanTime} Uhr`, colors.cyan);
      log(
        `⏰ Wöchentlicher Scan geplant für: ${['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][config.weeklyScanDay]} ${config.weeklyScanTime} Uhr`,
        colors.cyan,
      );
    }

    // Prüfe jede Minute
    setInterval(checkSchedule, 60000);

    // Initiale Prüfung
    checkSchedule();
    return;
  }

  // Standard: Einmaligen Scan ausführen
  await runDailyScan();
}

// Skript ausführen
main().catch((error) => {
  log(`❌ Unerwarteter Fehler: ${error.message}`, colors.red);
});
