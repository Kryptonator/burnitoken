/**
 * Dependency Security Updater
 *
 * Dieses Tool analysiert und behebt automatisch Sicherheitslücken in Abhängigkeiten:
 * - Identifiziert veraltete Pakete mit Sicherheitslücken
 * - Führt intelligente Updates durch, die nur notwendige Pakete aktualisieren
 * - Erstellt Backup vor den Updates für sicheres Rollback
 * - Testet die Anwendung nach Updates auf Funktionalität
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Konfiguration
const CONFIG = {
  packageJsonPath: path.join(__dirname, '..', 'package.json'),
  packageLockPath: path.join(__dirname, '..', 'package-lock.json'),
  backupDir: path.join(__dirname, '..', '.dependency-backups'),
  reportDir: path.join(__dirname, '..', '.worker-system'),
  securityLogPath: path.join(__dirname, '..', '.worker-system', 'security-updates.log'),
  dateFormat: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
  priorityOrder: [
    'high', // Hohe Sicherheitslücken
    'critical', // Kritische Sicherheitslücken
    'moderate', // Mittlere Sicherheitslücken
    'prod', // Produktionsabhängigkeiten
    'dev', // Entwicklungsabhängigkeiten
  ],
};

// Stellen Sie sicher, dass die Verzeichnisse existieren
[CONFIG.backupDir, CONFIG.reportDir].forEach((dir) => {
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
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Zeigt eine formatierte Meldung in der Konsole an
 */
;
  const reset = '\x1b[0m';
  const color = colorCodes[type] || colorCodes.INFO;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp} ${type}]${reset} ${message}`);

  // Optional: In Logdatei schreiben
  try {
    fs.appendFileSync(
      CONFIG.securityLogPath,
      `[${new Date().toISOString()}] [${type}] ${message}\n`,
    );
  } catch (error) {}
}

/**
 * Liest die package.json Datei
 */
function readPackageJson() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.packageJsonPath, 'utf8'));
  } catch (error) {
    log(`Fehler beim Lesen der package.json: ${error.message}`, 'ERROR');
    return null;
  }
}

/**
 * Erstellt ein Backup der package.json und package-lock.json
 */
function createBackup() {
  try {
    const timestamp = new Date()
      .toLocaleString('de-DE', CONFIG.dateFormat)
      .replace(/[\/:]/g, '-')
      .replace(/,/g, '')
      .replace(/\s/g, '_');

    const backupFolder = path.join(CONFIG.backupDir, `backup_${timestamp}`);
    fs.mkdirSync(backupFolder, { recursive: true });

    // package.json sichern
    if (fs.existsSync(CONFIG.packageJsonPath)) {
      fs.copyFileSync(CONFIG.packageJsonPath, path.join(backupFolder, 'package.json'));
    }

    // package-lock.json sichern, falls vorhanden
    if (fs.existsSync(CONFIG.packageLockPath)) {
      fs.copyFileSync(CONFIG.packageLockPath, path.join(backupFolder, 'package-lock.json'));
    }

    log(`Backup erstellt in ${backupFolder}`, 'SUCCESS');
    return backupFolder;
  } catch (error) {
    log(`Fehler beim Erstellen des Backups: ${error.message}`, 'ERROR');
    return null;
  }
}

/**
 * Führt einen npm audit Check durch
 */
function checkSecurityVulnerabilities() {
  try {
    const output = execSync('npm audit --json', {
      encoding: 'utf8',
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
      log(`Fehler beim Parsen der npm audit Ausgabe: ${parseError.message}`, 'ERROR');
    }
    return { vulnerabilities: {} };
  }
}

/**
 * Führt einen npm outdated Check durch
 */
function checkOutdatedPackages() {
  try {
    const output = execSync('npm outdated --json', {
      encoding: 'utf8',
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
      log(`Fehler beim Parsen der npm outdated Ausgabe: ${parseError.message}`, 'ERROR');
    }
    return {};
  }
}

/**
 * Analysiert die Sicherheitslücken und veralteten Pakete, um eine Prioritätenliste zu erstellen
 */
function analyzeAndPrioritize() {
  const packageJson = readPackageJson();
  if (!packageJson) return null;

  const securityReport = checkSecurityVulnerabilities();
  const outdatedPackages = checkOutdatedPackages();

  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});

  const prioritizedPackages = [];

  // Pakete mit Sicherheitslücken identifizieren
  if (securityReport.vulnerabilities) {
    Object.entries(securityReport.vulnerabilities).forEach(([packageName, info]) => {
      const isDev = devDependencies.includes(packageName);
      prioritizedPackages.push({
        name: packageName,
        severity: info.severity || 'moderate',
        type: isDev ? 'dev' : 'prod',
        currentVersion: info.range,
        targetVersion: info.fixAvailable ? info.fixAvailable.version : null,
        fixCommand: info.fixAvailable
          ? `npm install ${packageName}@${info.fixAvailable.version}`
          : null,
        reason: `${info.severity || 'moderate'} Sicherheitslücke`,
      });
    });
  }

  // Veraltete Pakete identifizieren, die noch keine Sicherheitslücken haben
  Object.entries(outdatedPackages).forEach(([packageName, info]) => {
    const existing = prioritizedPackages.find((p) => p.name === packageName);
    if (!existing) {
      const isDev = devDependencies.includes(packageName);
      prioritizedPackages.push({
        name: packageName,
        severity: 'none',
        type: isDev ? 'dev' : 'prod',
        currentVersion: info.current,
        targetVersion: info.latest,
        fixCommand: `npm install ${packageName}@${info.latest}`,
        reason: 'Veraltetes Paket',
      });
    }
  });

  // Nach Priorität sortieren
  prioritizedPackages.sort((a, b) => {
    // Erst nach Schweregrad sortieren
    const severityA = CONFIG.priorityOrder.indexOf(a.severity);
    const severityB = CONFIG.priorityOrder.indexOf(b.severity);

    if (severityA !== severityB) {
      return severityA - severityB;
    }

    // Dann nach Abhängigkeitstyp (Prod vs. Dev)
    const typeA = CONFIG.priorityOrder.indexOf(a.type);
    const typeB = CONFIG.priorityOrder.indexOf(b.type);

    return typeA - typeB;
  });

  return prioritizedPackages;
}

/**
 * Aktualisiert die angegebenen Pakete
 */
async function updatePackages(packagesToUpdate) {
  if (!packagesToUpdate || packagesToUpdate.length === 0) {
    log('Keine Pakete zu aktualisieren', 'INFO');
    return { success: true, results: [] };
  }

  const results = [];
  let hasErrors = false;

  // Backup erstellen
  const backupFolder = createBackup();
  if (!backupFolder) {
    return { success: false, results: [], error: 'Backup konnte nicht erstellt werden' };
  }

  log(`Starte Update von ${packagesToUpdate.length} Paketen...`, 'INFO');

  // Updates sequentiell durchführen, um Konflikte zu vermeiden
  for (const pkg of packagesToUpdate) {
    try {
      log(
        `Aktualisiere ${pkg.name} von ${pkg.currentVersion} auf ${pkg.targetVersion} (${pkg.reason})`,
        'INFO',
      );

      if (!pkg.fixCommand) {
        log(`Kein Fix-Befehl für ${pkg.name} verfügbar, überspringen...`, 'WARNING');
        results.push({
          package: pkg.name,
          success: false,
          error: 'Kein Fix-Befehl verfügbar',
        });
        continue;
      }

      // Führe Update-Befehl aus
      execSync(pkg.fixCommand, { stdio: 'pipe' });

      log(`✅ ${pkg.name} erfolgreich aktualisiert`, 'SUCCESS');
      results.push({
        package: pkg.name,
        success: true,
        from: pkg.currentVersion,
        to: pkg.targetVersion,
      });
    } catch (error) {
      log(`❌ Fehler beim Aktualisieren von ${pkg.name}: ${error.message}`, 'ERROR');
      results.push({
        package: pkg.name,
        success: false,
        error: error.message,
      });
      hasErrors = true;
    }
  }

  return {
    success: !hasErrors,
    results,
    backupFolder,
  };
}

/**
 * Führt einen Funktionstest nach den Updates durch
 */
function runFunctionalTests() {
  try {
    log('Führe npm test aus, um Funktionalität zu überprüfen...', 'INFO');
    const output = execSync('npm test', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    log('✅ Funktionstests erfolgreich', 'SUCCESS');
    return { success: true, output };
  } catch (error) {
    log(`❌ Funktionstests fehlgeschlagen: ${error.message}`, 'ERROR');
    return { success: false, error: error.message, output: error.stdout };
  }
}

/**
 * Führt ein Rollback durch, wenn Updates fehlgeschlagen sind
 */
function rollback(backupFolder) {
  try {
    if (!backupFolder || !fs.existsSync(backupFolder)) {
      log('Kein Backup-Verzeichnis für Rollback gefunden', 'ERROR');
      return false;
    }

    log('Führe Rollback durch...', 'WARNING');

    // package.json wiederherstellen
    const backupPackageJson = path.join(backupFolder, 'package.json');
    if (fs.existsSync(backupPackageJson)) {
      fs.copyFileSync(backupPackageJson, CONFIG.packageJsonPath);
    }

    // package-lock.json wiederherstellen
    const backupPackageLock = path.join(backupFolder, 'package-lock.json');
    if (fs.existsSync(backupPackageLock)) {
      fs.copyFileSync(backupPackageLock, CONFIG.packageLockPath);
    }

    // npm install ausführen, um korrekten Zustand wiederherzustellen
    execSync('npm install', { stdio: 'pipe' });

    log('✅ Rollback erfolgreich durchgeführt', 'SUCCESS');
    return true;
  } catch (error) {
    log(`❌ Rollback fehlgeschlagen: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  log('Dependency Security Updater wird gestartet...', 'INFO');

  // Sicherheitslücken und veraltete Pakete analysieren
  const prioritizedPackages = analyzeAndPrioritize();

  if (!prioritizedPackages || prioritizedPackages.length === 0) {
    log('Keine Aktualisierungen nötig. Alle Pakete sind aktuell und sicher.', 'SUCCESS');
    return;
  }

  // Anzahl der Pakete mit Sicherheitslücken
  const securityIssues = prioritizedPackages.filter((p) => p.severity !== 'none');

  log(
    `${prioritizedPackages.length} Pakete benötigen Updates, davon ${securityIssues.length} mit Sicherheitslücken`,
    'INFO',
  );

  // Top-Priorität Pakete auswählen (mit Sicherheitslücken)
  const highPriorityPackages =
    securityIssues.length > 0 ? securityIssues : prioritizedPackages.slice(0, 5);

  log(`Aktualisiere ${highPriorityPackages.length} Pakete mit höchster Priorität:`, 'INFO');
  highPriorityPackages.forEach((pkg) => {
    log(
      `- ${pkg.name}: ${pkg.currentVersion} → ${pkg.targetVersion} (${pkg.reason})`,
      pkg.severity === 'critical' || pkg.severity === 'high' ? 'ERROR' : 'WARNING',
    );
  });

  // Updates durchführen
  const updateResults = await updatePackages(highPriorityPackages);

  if (updateResults.success) {
    log('Alle Pakete erfolgreich aktualisiert!', 'SUCCESS');

    // Funktionstest durchführen
    const testResults = runFunctionalTests();

    if (!testResults.success) {
      log('Tests fehlgeschlagen nach Update. Führe Rollback durch...', 'ERROR');
      rollback(updateResults.backupFolder);
    } else {
      log('✅ Updates erfolgreich installiert und Tests bestanden', 'SUCCESS');
    }
  } else {
    log('Einige Updates sind fehlgeschlagen, siehe Details oben.', 'WARNING');

    // Frage, ob trotzdem Tests ausgeführt werden sollen oder Rollback
    const failedPackages = updateResults.results.filter((r) => !r.success);
    const successfulUpdates = updateResults.results.filter((r) => r.success);

    log(
      `${successfulUpdates.length} Pakete erfolgreich aktualisiert, ${failedPackages.length} fehlgeschlagen`,
      'INFO',
    );

    if (successfulUpdates.length > 0) {
      const testResults = runFunctionalTests();

      if (!testResults.success) {
        log('Tests fehlgeschlagen nach Update. Führe Rollback durch...', 'ERROR');
        rollback(updateResults.backupFolder);
      } else {
        log(
          `✅ Teilweise Update erfolgreich (${successfulUpdates.length} von ${highPriorityPackages.length} Paketen)`,
          'SUCCESS',
        );
      }
    } else {
      log('Keine Pakete konnten aktualisiert werden.', 'ERROR');
    }
  }

  // Finaler Sicherheitscheck
  const finalSecurityCheck = checkSecurityVulnerabilities();
  const remainingVulnerabilities = Object.keys(finalSecurityCheck.vulnerabilities || {}).length;

  if (remainingVulnerabilities > 0) {
    log(`⚠️ Es verbleiben noch ${remainingVulnerabilities} Sicherheitslücken.`, 'WARNING');
    log('Führen Sie den Updater erneut aus, um weitere Abhängigkeiten zu aktualisieren.', 'INFO');
  } else {
    log('🔒 Keine Sicherheitslücken mehr vorhanden!', 'SUCCESS');
  }
}

// Kommandozeilenargumente verarbeiten
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force') || args.includes('-f'),
  all: args.includes('--all') || args.includes('-a'),
  security: args.includes('--security-only') || args.includes('-s'),
  test: args.includes('--test') || args.includes('-t'),
};

// Programm starten
if (options.test) {
  log('Test-Modus aktiviert - nur Analyse, keine Updates', 'INFO');
  analyzeAndPrioritize();
} else {
  main().catch((error) => {
    log(`Unerwarteter Fehler: ${error.message}`, 'ERROR');
  });
}







}
}
] // Auto-korrigierte schließende Klammer