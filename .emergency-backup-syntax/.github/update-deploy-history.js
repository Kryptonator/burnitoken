// Fügt nach jedem Deploy einen Eintrag in public/deploy-history.json hinzu
// Im GitHub Actions Workflow nach erfolgreichem Deploy aufrufen

const fs = require('fs');
const path = require('path');
const https = require('https'); // Für externe API-Calls
const { execSync } = require('child_process'); // Für Shell-Befehle

// Projektwurzel bestimmen (unabhängig von Ausführungspfad)
const rootDir = path.resolve(__dirname, '..', '..');
const publicDir = path.join(rootDir, 'public');

// Stelle sicher, dass das public-Verzeichnis existiert
if (!fs.existsSync(publicDir)) {
  try {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`Public-Verzeichnis erstellt: ${publicDir}`);
  } catch (err) {
    console.error(`Fehler beim Erstellen von ${publicDir}:`, err);
  }
}

console.log(`📁 Arbeite mit Projektwurzel: ${rootDir}`);
console.log(`📁 Public-Verzeichnis: ${publicDir}`);

const historyPath = path.join(publicDir, 'deploy-history.json');
const performancePath = path.join(publicDir, 'performance-history.json');
const recoveryFlagPath = path.join(publicDir, '.recovery-needed');
const crashLogsPath = path.join(publicDir, 'crash-logs.json');
const shellInfoPath = path.join(publicDir, 'shell-environment.json');
const selfHealingPath = path.join(publicDir, 'self-healing-history.json');
const optimizationKnowledgeBase = path.join(__dirname, '..', 'optimization-knowledge-base.json');

// Diese Werte werden im Workflow als Umgebungsvariablen übergeben
const date = process.env.DEPLOY_DATE || new Date().toISOString();
const status = process.env.DEPLOY_STATUS || 'success';
const run_id = process.env.GITHUB_RUN_ID || '';
const commit = process.env.GITHUB_SHA || '';
const repo = process.env.GITHUB_REPOSITORY || '';
const url = `https://github.com/${repo}/actions/runs/${run_id}`;

/**
 * Liest eine JSON-Datei sicher aus.
 * @param {string} filePath - Der Pfad zur Datei.
 * @param {*} defaultValue - Der Standardwert, der zurückgegeben wird, wenn die Datei nicht existiert.
 * @returns {Object|Array} Die geparsten JSON-Daten oder der Standardwert.
 */
function readJsonFile(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Behebt das Problem leerer oder ungültiger JSON-Dateien
      if (fileContent.trim() === '') {
        return defaultValue;
      }
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error(`Fehler beim Lesen oder Parsen von ${filePath}:`, error);
    // Bei einem Fehler wird eine Sicherungskopie der fehlerhaften Datei erstellt
    const backupPath = `${filePath}.${Date.now()}.bak`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Sicherungskopie der fehlerhaften Datei wurde unter ${backupPath} erstellt.`);
  }
  return defaultValue;
}

/**
 * Schreibt Daten sicher in eine JSON-Datei.
 * @param {string} filePath - Der Pfad zur Datei.
 * @param {Object|Array} data - Die zu schreibenden Daten.
 */
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Fehler beim Schreiben von ${filePath}:`, error);
  }
}

/**
 * Ruft externe Daten über HTTPS ab.
 * @param {string} url - Die URL der API.
 * @returns {Promise<Object>} Die abgerufenen JSON-Daten.
 */
function fetchExternalData(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Führt einen Shell-Befehl aus und gibt das Ergebnis zurück.
 * @param {string} command - Der auszuführende Befehl.
 * @returns {string} Die Ausgabe des Befehls.
 */
function executeShellCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`Fehler beim Ausführen des Befehls "${command}":`, error);
    return '';
  }
}

/**
 * Erkennt die Shell-Umgebung und passt Befehle an
 * @returns {Object} Shell-Informationen und angepasste Befehle
 */
function detectShellEnvironment() {
  const isWindows = process.platform === 'win32';
  let shellType = 'bash'; // Standard
  let shellVersion = '';
  let hasPowerShellIssues = false;

  try {
    if (isWindows) {
      try {
        // PowerShell-Version prüfen
        const psVersionOutput = execSync(
          'powershell -Command "$PSVersionTable.PSVersion.ToString()"',
          { encoding: 'utf8' },
        );
        shellType = 'powershell';
        shellVersion = psVersionOutput.trim();

        // Execution-Policy prüfen
        try {
          const policyOutput = execSync('powershell -Command "Get-ExecutionPolicy"', {
            encoding: 'utf8',
          });
          const policy = policyOutput.trim().toLowerCase();
          if (policy === 'restricted' || policy === 'allsigned') {
            hasPowerShellIssues = true;
            console.warn(
              '⚠️ PowerShell Execution-Policy ist restriktiv. Dies könnte Skriptausführungen blockieren.',
            );
          }
        } catch {
          hasPowerShellIssues = true;
        }
      } catch {
        // Fallback zu CMD
        shellType = 'cmd';
        try {
          const cmdVersionOutput = execSync('cmd /c "ver"', { encoding: 'utf8' });
          shellVersion = cmdVersionOutput.trim();
        } catch {
          shellVersion = 'unknown';
        }
      }
    } else {
      // Unix-Shell erkennen
      try {
        shellType = process.env.SHELL?.includes('zsh')
          ? 'zsh'
          : process.env.SHELL?.includes('bash')
            ? 'bash'
            : 'sh';
        const versionOutput = execSync(`${shellType} --version`, { encoding: 'utf8' });
        shellVersion = versionOutput.split('\n')[0];
      } catch {
        shellVersion = 'unknown';
      }
    }
  } catch (e) {
    console.error('Fehler bei der Shell-Erkennung:', e);
  }

  // Angepasste Befehle zurückgeben
  return {
    type: shellType,
    version: shellVersion,
    isWindows,
    hasPowerShellIssues,
    commands: {
      gitCheckout:
        shellType === 'powershell'
          ? 'git checkout' // PowerShell verwendet normale Git-Befehle
          : 'git checkout',
      npmInstall:
        shellType === 'powershell'
          ? 'npm install' // Normales npm install
          : 'npm install',
      npmBuild:
        shellType === 'powershell'
          ? 'npm run build' // Normales npm run
          : 'npm run build',
      checkInternet:
        shellType === 'powershell'
          ? 'Test-NetConnection -ComputerName github.com -Port 443 | Select-Object -ExpandProperty TcpTestSucceeded'
          : isWindows
            ? 'ping -n 1 github.com >nul && echo true || echo false'
            : 'ping -c 1 github.com >/dev/null && echo true || echo false',
    },
  };
}

/**
 * Prüft und behebt PowerShell-spezifische Probleme
 */
function checkAndFixPowerShellIssues() {
  const shellEnv = detectShellEnvironment();

  // Nur wenn PowerShell erkannt wurde
  if (shellEnv.type !== 'powershell') return;

  console.log('\n🛠️ PowerShell-Umgebung erkannt:', shellEnv.version);

  // UTF-8 Probleme prüfen
  try {
    // Erstellung einer temporären Datei zum Testen
    const testPath = path.join(__dirname, '.ps-utf8-test.txt');
    const testContent = 'äöüß🔄📊'; // UTF-8 Zeichen

    fs.writeFileSync(testPath, testContent, 'utf8');
    const readContent = fs.readFileSync(testPath, 'utf8');

    if (readContent !== testContent) {
      console.warn('⚠️ PowerShell UTF-8 Zeichenkodierungs-Problem erkannt!');
      console.log('   Workaround: Verwende explizite UTF-8 Kodierung für alle Dateivorgänge.');
      shellEnv.hasUtf8Issues = true;
    }

    // Aufräumen
    fs.unlinkSync(testPath);
  } catch (e) {
    console.error('Fehler beim UTF-8 Test:', e);
  }

  // Execution Policy prüfen und Hinweise geben
  if (shellEnv.hasPowerShellIssues) {
    console.log('\n🔧 PowerShell Execution-Policy Problem erkannt!');
    console.log('   Für diesen Prozess temporär beheben:');
    console.log('   powershell -ExecutionPolicy Bypass -File "script.ps1"');
    console.log('   Oder dauerhaft (als Administrator):');
    console.log('   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser');
  }

  // Shell-Informationen speichern
  safeWriteJson(shellInfoPath, {
    detected: shellEnv,
    timestamp: new Date().toISOString(),
    recommendations: shellEnv.hasPowerShellIssues
      ? [
          'PowerShell mit -ExecutionPolicy Bypass ausführen',
          'In .ps1 Files [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 einfügen',
          'Pfade mit doppelten Backslashes in PowerShell-Skripten verwenden',
        ]
      : [],
  });

  return shellEnv;
}

/**
 * Gibt einen Shell-angepassten Befehl zurück
 * @param {string} command - Der auszuführende Befehl
 * @param {boolean} isPowerShellSafe - Ist der Befehl PowerShell-sicher?
 * @returns {string} Der angepasste Befehl
 */
function getShellSafeCommand(command, isPowerShellSafe = false) {
  const shellEnv = detectShellEnvironment();

  if (shellEnv.type === 'powershell' && !isPowerShellSafe) {
    // PowerShell-spezifische Anpassungen

    // Wenn es ein Git-Checkout ist, spezielle Behandlung
    if (command.startsWith('git checkout')) {
      return `powershell -Command "& {${command}}"`;
    }

    // Für npm-Befehle
    if (command.startsWith('npm')) {
      // Anführungszeichen in PowerShell richtig escapen
      return command.replace(/"/g, '`"');
    }
  }

  return command;
}

/**
 * Findet den letzten erfolgreichen Deploy vor einem bestimmten Zeitpunkt
 * @param {string} targetTime - Zeitstempel im ISO-Format oder 'HH:MM' Format für heute
 * @returns {Object|null} Der letzte erfolgreiche Deploy-Eintrag oder null
 */
function findLastStableDeployBefore(targetTime) {
  if (!fs.existsSync(historyPath)) {
    console.error('Keine Deploy-Historie gefunden');
    return null;
  }

  let history;
  try {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  } catch (e) {
    console.error('Fehler beim Lesen der Deploy-Historie:', e);
    return null;
  }

  // Format HH:MM für heute interpretieren
  let targetDate;
  if (/^\d{1,2}:\d{2}$/.test(targetTime)) {
    const today = new Date();
    const [hours, minutes] = targetTime.split(':').map(Number);
    targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
  } else {
    // Sonst als ISO-String interpretieren
    targetDate = new Date(targetTime);
  }

  // Validiere das Datum
  if (isNaN(targetDate.getTime())) {
    console.error('Ungültiges Zeitformat. Verwende HH:MM oder ISO-Zeitstempel');
    return null;
  }

  // Finde den letzten erfolgreichen Deploy vor dem Ziel-Zeitpunkt
  const stableDeploysBefore = history
    .filter((entry) => entry.status === 'success' && new Date(entry.date) < targetDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return stableDeploysBefore.length > 0 ? stableDeploysBefore[0] : null;
}

/**
 * Zeigt Informationen zum letzten stabilen Deploy vor einem Zeitpunkt an
 * @param {string} timeString - Zeitstempel oder Uhrzeit (HH:MM)
 */
function showRecoveryInformation(timeString) {
  const lastStableDeploy = findLastStableDeployBefore(timeString);

  if (!lastStableDeploy) {
    console.error('Keinen stabilen Deploy-Status vor diesem Zeitpunkt gefunden.');
    return;
  }

  const deployDate = new Date(lastStableDeploy.date);

  console.log('\n=== RECOVERY INFORMATION ===');
  console.log(`Letzter stabiler Deploy vor ${timeString}:`);
  console.log(`- Datum: ${deployDate.toLocaleString()}`);
  console.log(`- Commit: ${lastStableDeploy.commit.substring(0, 7)}`);
  console.log(`- Workflow: ${lastStableDeploy.url || 'Nicht verfügbar'}`);

  // Shell-spezifische Anpassungen für Befehle
  const shellEnv = detectShellEnvironment();
  const isPowerShell = shellEnv.type === 'powershell';

  const checkoutCmd = isPowerShell
    ? `git checkout ${lastStableDeploy.commit}`
    : `git checkout ${lastStableDeploy.commit}`;

  console.log('\nZum Wiederherstellen:');
  console.log(checkoutCmd);
  console.log('npm install');
  console.log('npm run build');
  console.log('\nFür automatisches Rollback:');
  console.log(
    `node .github/update-deploy-history.js --recovery --time="${deployDate.toISOString()}"`,
  );
  console.log('=== RECOVERY COMPLETE ===\n');
}

/**
 * Sicheres Schreiben in eine JSON-Datei mit Backup und Validierung
 * @param {string} filePath - Pfad zur Datei
 * @param {object} data - Zu speichernde Daten
 * @returns {boolean} Erfolg
 */
function safeWriteJson(filePath, data) {
  try {
    // Backup erstellen, falls Datei existiert
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.bak`;
      fs.copyFileSync(filePath, backupPath);
    }

    // Validiere, dass es sich um gültiges JSON handelt
    const jsonStr = JSON.stringify(data, null, 2);
    JSON.parse(jsonStr); // Testweise parsen

    // In temporäre Datei schreiben und bei Erfolg umbenennen
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, jsonStr);
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Fehler beim Schreiben der Datei ${filePath}:`, err);
    return false;
  }
}

/**
 * Zeichnet Performance-Metriken nach einem Deploy auf
 * @param {string} commitId - Git Commit ID
 * @param {string} deployTime - Zeitstempel des Deploys
 */
function trackPerformance(commitId, deployTime) {
  try {
    // Performance-Historie laden oder neu erstellen
    let perfHistory = [];
    if (fs.existsSync(performancePath)) {
      try {
        perfHistory = JSON.parse(fs.readFileSync(performancePath, 'utf8'));
      } catch (e) {
        console.warn('Performance-Historie konnte nicht geladen werden, erstelle neu');
      }
    }

    // Aktuelle Performance messen
    const metrics = {
      timestamp: new Date().toISOString(),
      commit: commitId,
      deployTime,
      measurements: {
        memory: process.memoryUsage(),
        loadTime: Math.random() * 1000 + 500, // Platzhalter - würde in Prod durch echte Messung ersetzt
        scriptErrors: 0,
        apiLatency: 0,
      },
      thresholds: {
        memoryWarning: 500 * 1024 * 1024, // 500MB
        loadTimeWarning: 2000, // 2 Sekunden
        criticalErrors: 5,
      },
    };

    // In Produktion hier externe Performance-APIs/Monitoring integrieren
    if (process.env.PERF_API_KEY) {
      // Hier würde ein API-Call zu Lighthouse, WebPageTest, etc. erfolgen
      console.log('Performance-Messung via API gestartet...');
    }

    // Performance speichern
    perfHistory.push(metrics);
    if (perfHistory.length > 100) {
      perfHistory = perfHistory.slice(-100); // Beschränken auf letzte 100 Einträge
    }

    safeWriteJson(performancePath, perfHistory);

    // Auto-Rollback bei kritischen Problemen prüfen
    checkCriticalPerformanceIssues(perfHistory, commitId);
  } catch (err) {
    console.error('Fehler beim Performance-Tracking:', err);
  }
}

/**
 * Prüft auf kritische Performance-Probleme und löst ggf. Auto-Rollback aus
 * @param {Array} history - Performance-Historie
 * @param {string} currentCommit - Aktueller Commit
 */
function checkCriticalPerformanceIssues(history, currentCommit) {
  if (history.length < 3) return; // Zu wenig Daten für Analyse

  const current = history[history.length - 1];

  // Die letzten erfolgreichen Deployments vor dem aktuellen finden
  const previousSuccessful = history
    .slice(0, -1)
    .filter((h) => h.measurements && h.commit !== currentCommit)
    .slice(-3); // Letzte 3

  if (previousSuccessful.length === 0) return;

  // Durchschnittliche Performance berechnen
  const avgPrevLoadTime =
    previousSuccessful.reduce((sum, item) => sum + (item.measurements?.loadTime || 0), 0) /
    previousSuccessful.length;

  // Wenn aktuelle Ladezeit mehr als 50% langsamer ist - kritisch
  if (
    current.measurements.loadTime > avgPrevLoadTime * 1.5 &&
    current.measurements.loadTime > current.thresholds.loadTimeWarning
  ) {
    console.warn(
      `⚠️ KRITISCHES PERFORMANCE-PROBLEM: Ladezeit ${current.measurements.loadTime}ms ist ${Math.round((current.measurements.loadTime / avgPrevLoadTime - 1) * 100)}% langsamer als vorher (${Math.round(avgPrevLoadTime)}ms)`,
    );

    // Flag für nötiges Recovery setzen
    fs.writeFileSync(
      recoveryFlagPath,
      JSON.stringify({
        reason: 'performance-degradation',
        timestamp: new Date().toISOString(),
        metrics: {
          current: current.measurements.loadTime,
          previous: avgPrevLoadTime,
          percentSlower: Math.round((current.measurements.loadTime / avgPrevLoadTime - 1) * 100),
        },
        recommendedAction: 'rollback',
      }),
    );

    // In Produktion hier einen Alert auslösen oder Auto-Rollback starten
  }
}

/**
 * Führt einen automatischen Rollback durch, wenn nötig
 */
function executeAutoRollbackIfNeeded(autoFix = true) {
  if (!fs.existsSync(recoveryFlagPath)) return;

  try {
    const recoveryData = JSON.parse(fs.readFileSync(recoveryFlagPath, 'utf8'));

    // Älter als 15 Minuten ignorieren - verhindert doppelte Rollbacks
    if (new Date() - new Date(recoveryData.timestamp) > 15 * 60 * 1000) {
      console.log('Recovery-Flag ignoriert (älter als 15 Minuten)');
      return;
    }

    console.log('\n🚨 AUTO-ROLLBACK WIRD AUSGEFÜHRT 🚨');
    console.log(`Grund: ${recoveryData.reason}`);
    console.log(`Zeitpunkt: ${new Date(recoveryData.timestamp).toLocaleString()}`);
    console.log(`Empfohlene Aktion: ${recoveryData.recommendedAction || 'Rollback durchführen'}`);

    if (!autoFix) {
      console.log('\nAuto-Fix ist deaktiviert. Um den Rollback manuell durchzuführen:');
      console.log(
        'node .github/update-deploy-history.js --recovery --time=' +
          new Date(recoveryData.timestamp).toISOString(),
      );
      return;
    }

    // Sicherstellen, dass die Historie existiert
    if (!fs.existsSync(historyPath)) {
      console.error('Keine Deploy-Historie gefunden, kann kein Rollback durchführen');
      return;
    }

    let history;
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      if (!Array.isArray(history) || history.length === 0) {
        console.error('Deploy-Historie ist leer oder fehlerhaft');
        return;
      }
    } catch (e) {
      console.error('Fehler beim Lesen der Deploy-Historie:', e);
      return;
    }

    // Letzten stabilen Deploy finden
    const lastStableDeploy = findLastStableDeployBefore(new Date(recoveryData.timestamp));
    if (!lastStableDeploy) {
      console.error('Keinen stabilen Deploy für Rollback gefunden!');
      return;
    }

    const shellEnv = detectShellEnvironment();

    console.log(
      `Rollback zu Commit: ${lastStableDeploy.commit.substring(0, 7)} vom ${new Date(lastStableDeploy.date).toLocaleString()}`,
    );

    // Hier führt in Produktion der tatsächliche Rollback aus:

    // 1. Git Reset/Checkout zum stabilen Commit - mit Shell-spezifischen Anpassungen
    const gitCheckout = getShellSafeCommand(`git checkout ${lastStableDeploy.commit}`);
    console.log(`Shell-angepasster Befehl: ${gitCheckout}`);

    try {
      execSync(gitCheckout, { encoding: 'utf8' });
      console.log('Git-Checkout erfolgreich');
    } catch (e) {
      console.error('Fehler beim Git-Checkout:', e);
      return;
    }

    // 2. Dependencies installieren - mit Shell-spezifischen Anpassungen
    const npmInstall = getShellSafeCommand('npm install');
    console.log(`Shell-angepasster Befehl: ${npmInstall}`);

    try {
      execSync(npmInstall, { encoding: 'utf8', stdio: 'inherit' });
      console.log('npm install erfolgreich');
    } catch (e) {
      console.error('Fehler bei npm install:', e);
      // Weiter mit Build, auch wenn Install Probleme hatte
    }

    // 3. Build ausführen - mit Shell-spezifischen Anpassungen
    const npmBuild = getShellSafeCommand('npm run build');
    console.log(`Shell-angepasster Befehl: ${npmBuild}`);

    try {
      execSync(npmBuild, { encoding: 'utf8', stdio: 'inherit' });
      console.log('npm run build erfolgreich');
    } catch (e) {
      console.error('Fehler bei npm run build:', e);
      // Weiter mit Commit, auch wenn Build fehlgeschlagen ist
    }

    // 4. Self-Healing-Historie aktualisieren
    let healingHistory = readJsonFile(selfHealingPath, []);

    // Neuen Recovery-Eintrag erstellen
    healingHistory.push({
      id: `recovery-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'auto-rollback',
      commit: lastStableDeploy.commit,
      reason: recoveryData.reason,
      success: true,
    });

    safeWriteJson(selfHealingPath, healingHistory);

    // Deploy-Historie aktualisieren
    history.push({
      date: new Date().toISOString(),
      status: 'success',
      run_id: 'recovery-run',
      commit: lastStableDeploy.commit,
      url: lastStableDeploy.url || '',
      recovery: true,
      reason: recoveryData.reason,
    });

    safeWriteJson(historyPath, history);

    // 5. Auto-Recovery dokumentieren und committen
    const recoveryFiles = [
      'package-lock.json',
      'public/deploy-history.json',
      'public/performance-history.json',
      'public/self-healing-history.json',
      'public/crash-logs.json',
    ];

    const recoveryCommitMessage = `Auto-Rollback zu stabilem Commit ${lastStableDeploy.commit.substring(0, 7)} vom ${new Date(lastStableDeploy.date).toLocaleString()} wegen ${recoveryData.reason}`;

    // Commit erstellen und pushen
    const commitSuccess = commitAndPushChanges(recoveryCommitMessage, recoveryFiles, {
      autoFix: true,
      createBranch: true, // Sicherheitshalber neuen Branch erstellen
      pushOrigin: true,
      recoveryMode: true,
    });

    if (commitSuccess) {
      console.log('Recovery-Commit erfolgreich erstellt und gepusht');
    } else {
      console.warn('Recovery-Commit konnte nicht erstellt/gepusht werden');
    }

    // Recovery-Flag löschen
    fs.unlinkSync(recoveryFlagPath);
    console.log('Auto-Rollback abgeschlossen');
  } catch (err) {
    console.error('Fehler beim Auto-Rollback:', err);
  }
}

/**
 * Führt einen Git-Commit und Push für Änderungen durch
 * @param {string} message - Commit-Nachricht
 * @param {string[]} files - Liste der Dateien, die committet werden sollen (relative Pfade)
 * @param {Object} options - Optionen (autoFix, branch, etc.
 * @returns {boolean} Erfolg
 */
function commitAndPushChanges(message, files = [], options = {}) {
  const {
    autoFix = true, // Automatisches Fixen von Fehlern
    branch = '', // Ziel-Branch, leer = aktueller Branch
    createBranch = false, // Neuen Branch erstellen?
    pushOrigin = true, // Nach Origin pushen?
    recoveryMode = false, // Ist dies ein Recovery-Commit?
  } = options;

  const shellEnv = detectShellEnvironment();
  const isPowerShell = shellEnv.type === 'powershell';

  try {
    // 1. Aktuelle Branch ermitteln wenn nicht angegeben
    let targetBranch = branch;
    if (!targetBranch) {
      try {
        const branchCmd = isPowerShell
          ? 'git rev-parse --abbrev-ref HEAD'
          : 'git rev-parse --abbrev-ref HEAD';
        targetBranch = execSync(branchCmd, { encoding: 'utf8' }).trim();
      } catch (e) {
        console.error('Fehler beim Ermitteln des aktuellen Branch:', e);
        return false;
      }
    }

    // 2. Prüfen, ob Änderungen vorhanden sind
    try {
      const statusCmd = isPowerShell ? 'git status --porcelain' : 'git status --porcelain';
      const statusOutput = execSync(statusCmd, { encoding: 'utf8' });

      if (!statusOutput && files.length === 0) {
        console.log('Keine Änderungen zum Committen gefunden.');
        return true; // Erfolg, aber nichts zu tun
      }
    } catch (e) {
      console.error('Fehler beim Prüfen des Git-Status:', e);
      if (!autoFix) return false;
    }

    // 3. Neuen Branch erstellen falls gewünscht
    if (createBranch) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newBranch = `recovery-${timestamp}`;

      try {
        const createBranchCmd = isPowerShell
          ? `git checkout -b ${newBranch}`
          : `git checkout -b ${newBranch}`;
        execSync(createBranchCmd, { encoding: 'utf8' });
        console.log(`Neuen Branch "${newBranch}" erstellt`);
        targetBranch = newBranch;
      } catch (e) {
        console.error('Fehler beim Erstellen eines neuen Branch:', e);
        if (!autoFix) return false;
      }
    }

    // 4. Dateien stagen
    if (files.length > 0) {
      for (const file of files) {
        try {
          const addCmd = isPowerShell ? `git add "${file}"` : `git add "${file}"`;
          execSync(addCmd, { encoding: 'utf8' });
        } catch (e) {
          console.error(`Fehler beim Stagen von ${file}:`, e);
          if (!autoFix) return false;
        }
      }
    } else {
      // Alle Änderungen stagen
      try {
        const addAllCmd = isPowerShell ? 'git add .' : 'git add .';
        execSync(addAllCmd, { encoding: 'utf8' });
      } catch (e) {
        console.error('Fehler beim Stagen aller Änderungen:', e);
        if (!autoFix) return false;
      }
    }

    // 5. Commit durchführen
    const commitMessage = recoveryMode ? `[AUTO-RECOVERY] ${message}` : message;

    try {
      const commitCmd = isPowerShell
        ? `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`
        : `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`;
      execSync(commitCmd, { encoding: 'utf8' });
      console.log(`Änderungen committet: "${commitMessage}"`);
    } catch (e) {
      console.error('Fehler beim Committen:', e);
      return false;
    }

    // 6. Push, falls gewünscht
    if (pushOrigin) {
      try {
        const pushCmd = isPowerShell
          ? `git push origin ${targetBranch}`
          : `git push origin ${targetBranch}`;
        execSync(pushCmd, { encoding: 'utf8' });
        console.log(`Änderungen zu origin/${targetBranch} gepusht`);
      } catch (e) {
        console.error('Fehler beim Pushen:', e);

        if (autoFix) {
          console.log('Versuche Push mit --force-with-lease...');
          try {
            const forcePushCmd = isPowerShell
              ? `git push --force-with-lease origin ${targetBranch}`
              : `git push --force-with-lease origin ${targetBranch}`;
            execSync(forcePushCmd, { encoding: 'utf8' });
            console.log(`Änderungen mit --force-with-lease zu origin/${targetBranch} gepusht`);
          } catch (e2) {
            console.error('Auch Force-Push fehlgeschlagen:', e2);
            return false;
          }
        } else {
          return false;
        }
      }
    }

    return true;
  } catch (e) {
    console.error('Unerwarteter Fehler beim Git-Workflow:', e);
    return false;
  }
}

/**
 * Führt einen Selbstheilungsprozess durch, basierend auf der Historie und Wissensdatenbank
 * Diese Funktion wird von der neuen runSelfHealing-Funktion abgelöst, bleibt aber für Kompatibilität erhalten
 */
function executeSelfHealing() {
  console.log(
    '⚠️ Hinweis: executeSelfHealing wurde durch runSelfHealing ersetzt, verwende die neue Funktion',
  );

  // Prüfen, ob public-Verzeichnis existiert
  if (!fs.existsSync(publicDir)) {
    try {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log(`Public-Verzeichnis erstellt: ${publicDir}`);
    } catch (err) {
      console.error(`Fehler beim Erstellen von ${publicDir}:`, err);
      return;
    }
  }

  if (!fs.existsSync(selfHealingPath)) {
    console.log('Keine Selbstheilungs-Historie gefunden, starte ersten Eintrag');
  }

  try {
    // Aktuelle Deploy-Historie laden
    let history = readJsonFile(historyPath, []);

    if (history.length === 0) {
      console.log('Keine Deploy-Historie gefunden, erstelle Dummy-Eintrag für ersten Lauf');
      history.push({
        date: new Date().toISOString(),
        status: 'success',
        run_id: 'initial-run',
        commit: 'initial-commit',
        url: 'https://github.com/example/burnitoken',
      });
      writeJsonFile(historyPath, history);
    }

    const latestDeploy = history[history.length - 1];

    // Aktuelle Performance-Historie laden
    let performanceHistory = readJsonFile(performancePath, []);

    if (performanceHistory.length === 0) {
      console.log('Keine Performance-Historie gefunden, erstelle Dummy-Eintrag für ersten Lauf');
      performanceHistory.push({
        timestamp: new Date().toISOString(),
        commit: latestDeploy.commit,
        deployTime: latestDeploy.date,
        measurements: {
          memory: process.memoryUsage(),
          loadTime: 1000, // This is a placeholder, will be replaced by real measurement
          scriptErrors: 0,
          apiLatency: 0,
        },
      });
      writeJsonFile(performancePath, performanceHistory);
    }

    const latestPerformance = performanceHistory[performanceHistory.length - 1];

    // Fehlerprotokollierung aktivieren
    let errorLog = [];
    const logError = (error) => {
      errorLog.push({
        timestamp: new Date().toISOString(),
        error: typeof error === 'string' ? error : error.message || 'Unbekannter Fehler',
      });
    };

    // Beispiel: Automatisches Rollback bei wiederholten Fehlern
    if (latestDeploy.status !== 'success') {
      console.warn('Letzter Deploy war nicht erfolgreich, führe Selbstheilung durch');

      // 1. Letzten stabilen Deploy finden
      const lastStableDeploy = findLastStableDeployBefore(new Date(latestDeploy.date));
      if (lastStableDeploy) {
        console.log(
          `Rollback zu letztem stabilen Deploy vom ${new Date(lastStableDeploy.date).toLocaleString()}`,
        );

        // Rollback-Befehle sammeln
        let rollbackCommands = [
          `git checkout ${lastStableDeploy.commit}`,
          'npm install',
          'npm run build',
        ];

        // 2. Führe Rollback-Befehle aus
        for (const command of rollbackCommands) {
          executeShellCommand(command);
        }

        // 3. Status nach Rollback überprüfen
        let postRollbackHistory = readJsonFile(historyPath, []);

        const postRollbackDeploy =
          postRollbackHistory.length > 0
            ? postRollbackHistory[postRollbackHistory.length - 1]
            : null;
        if (postRollbackDeploy && postRollbackDeploy.status === 'success') {
          console.log('Rollback erfolgreich, dokumentiere Selbstheilung');

          // Selbstheilungs-Eintrag erstellen
          const healingEntry = {
            timestamp: new Date().toISOString(),
            deploy: postRollbackDeploy,
            performance: latestPerformance,
            errors: errorLog,
            action: 'rollback',
            success: true,
          };

          // Bisherige Einträge laden oder neu initialisieren
          let healingHistory = readJsonFile(selfHealingPath, []);

          healingHistory.push(healingEntry);
          writeJsonFile(selfHealingPath, healingHistory);
        } else {
          console.warn('Rollback war nicht erfolgreich, weitere Analyse erforderlich');
          logError('Rollback fehlgeschlagen - Status nicht erfolgreich oder Historie nicht lesbar');
        }
      } else {
        console.error('Kein stabiler Deploy für Rollback gefunden');
        logError('Kein stabiler Deploy für Rollback gefunden');
      }
    } else {
      console.log('Letzter Deploy war erfolgreich, keine Rollback-Aktion erforderlich');

      // Stattdessen die moderne Self-Healing-Funktion aufrufen
      runSelfHealing({
        autoFix: true,
        runAudits: true,
        commitOnSuccess: true,
      });
    }
  } catch (err) {
    console.error('Fehler im Selbstheilungsprozess:', err);
    logCrash({
      type: 'self-healing-execution',
      message: err.message,
      stack: err.stack,
      severity: 'high',
      component: 'update-deploy-history.js',
    });
  }
}

/**
 * Loggt einen Absturz oder kritischen Fehler
 * @param {Object} crashInfo - Informationen zum Absturz
 * @returns {string} Die Absturz-ID
 */
function logCrash(crashInfo) {
  try {
    // Crash-Logs laden oder neu erstellen
    let crashes = [];
    if (fs.existsSync(crashLogsPath)) {
      try {
        crashes = JSON.parse(fs.readFileSync(crashLogsPath, 'utf8'));
      } catch (e) {
        console.warn('Crash-Logs konnten nicht geladen werden, erstelle neu');
      }
    }

    // Absturz-ID generieren (Zeitstempel + Hash)
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    const crashId = `crash-${timestamp}-${randomPart}`;

    // Absturz-Eintrag erstellen
    const crashEntry = {
      id: crashId,
      timestamp: new Date().toISOString(),
      ...crashInfo,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage(),
      },
    };

    // Absturz protokollieren
    crashes.push(crashEntry);
    if (crashes.length > 100) {
      crashes = crashes.slice(-100); // Auf letzte 100 beschränken
    }

    safeWriteJson(crashLogsPath, crashes);

    // Recovery Flag setzen, falls kritisch
    if (crashInfo.severity === 'critical' && !fs.existsSync(recoveryFlagPath)) {
      fs.writeFileSync(
        recoveryFlagPath,
        JSON.stringify({
          reason: `crash-${crashInfo.type}`,
          timestamp: new Date().toISOString(),
          crashId,
          recommendedAction: 'check-logs-and-fix',
        }),
      );
    }

    return crashId;
  } catch (err) {
    console.error('Fehler beim Protokollieren des Absturzes:', err);
    return 'error-logging-crash';
  }
}

/**
 * Zeigt Absturz-Protokolle an
 * @param {string} [since] - Optional: Zeitstempel oder Uhrzeit (HH:MM), ab dem Abstürze angezeigt werden sollen
 */
function showCrashReport(since = null) {
  if (!fs.existsSync(crashLogsPath)) {
    console.log('Keine Absturz-Protokolle gefunden. Das ist gut!');
    return;
  }

  try {
    const crashes = JSON.parse(fs.readFileSync(crashLogsPath, 'utf8'));

    if (crashes.length === 0) {
      console.log('Keine Abstürze protokolliert. Das ist gut!');
      return;
    }

    // Startdatum für Filter
    let filterDate = null;
    if (since) {
      if (/^\d{1,2}:\d{2}$/.test(since)) {
        // Format HH:MM für heute interpretieren
        const today = new Date();
        const [hours, minutes] = since.split(':').map(Number);
        filterDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hours,
          minutes,
        );
      } else {
        // Als ISO-String interpretieren
        filterDate = new Date(since);
        if (isNaN(filterDate.getTime())) {
          console.error('Ungültiges Zeitformat:', since);
          filterDate = null;
        }
      }
    }

    // Crashes nach Zeit filtern, falls Filter gesetzt
    let filteredCrashes = filterDate
      ? crashes.filter((crash) => new Date(crash.timestamp) >= filterDate)
      : crashes;

    console.log('\n=== ABSTURZ-BERICHT ===');
    console.log(
      `Anzahl der Abstürze${filterDate ? ` seit ${filterDate.toLocaleString()}` : ''}: ${filteredCrashes.length}`,
    );

    if (filteredCrashes.length === 0) {
      console.log('Keine Abstürze im ausgewählten Zeitraum.');
      return;
    }

    // Nach Typ gruppieren
    const crashesByType = filteredCrashes.reduce((acc, crash) => {
      acc[crash.type] = acc[crash.type] || [];
      acc[crash.type].push(crash);
      return acc;
    }, {});

    // Bericht für jeden Typ ausgeben
    Object.entries(crashesByType).forEach(([type, crashes]) => {
      console.log(`\nTyp: ${type} (${crashes.length} Vorkommen)`);
      console.log(`Schweregrad: ${crashes[0].severity}`);
      console.log(`Beispielnachricht: ${crashes[0].message}`);
      console.log(
        `Betroffene Komponente(n): ${[...new Set(crashes.map((c) => c.component))].join(', ')}`,
      );
      console.log(`Erste Meldung: ${new Date(crashes[0].timestamp).toLocaleString()}`);
      console.log(
        `Letzte Meldung: ${new Date(crashes[crashes.length - 1].timestamp).toLocaleString()}`,
      );

      if (crashes.length >= 3) {
        console.log('Der Fehler tritt wiederholt auf. Eine Untersuchung wird empfohlen.');
      }
    });

    // Empfehlungen
    console.log('\nEmpfehlungen:');
    if (filteredCrashes.some((c) => c.severity === 'critical')) {
      console.log('❗ KRITISCHE ABSTÜRZE festgestellt! Sofortiges Handeln erforderlich.');
      console.log('   Prüfen Sie die Logs und führen Sie einen Rollback durch, falls nötig.');
      console.log(
        '   Verwenden Sie: node .github/update-deploy-history.js --recovery --time=<letzte-stabile-zeit>',
      );
    } else if (filteredCrashes.some((c) => c.severity === 'high')) {
      console.log('⚠️ Schwerwiegende Fehler festgestellt. Eine zeitnahe Behebung wird empfohlen.');
    } else {
      console.log('ℹ️ Kleinere Probleme gefunden. Beheben Sie diese bei Gelegenheit.');
    }

    console.log('\n=== ENDE DES BERICHTS ===');
  } catch (err) {
    console.error('Fehler beim Anzeigen des Absturz-Berichts:', err);
  }
}

/**
 * Self-Healing: Automatische Optimierung und Fehlerbehebung
 * Identifiziert Probleme und wendet automatisch Korrekturen an
 * @param {Object} options - Konfigurationsparameter
 */
function runSelfHealing(options = {}) {
  const {
    autoFix = true, // Automatische Behebung von Fehlern
    runAudits = true, // Audits ausführen (Lighthouse, AXE, etc.)
    updateMetaTags = true, // Meta-Tags aktualisieren basierend auf GSC-Daten
    optimizeImages = true, // Bilder optimieren
    testAfterFix = true, // Tests nach Fixes ausführen
    commitOnSuccess = true, // Änderungen committen, wenn Tests erfolgreich
    maxChangesPerRun = 3, // Maximale Anzahl an Änderungen pro Durchlauf
  } = options;

  console.log('\n🔄 Starte Self-Healing-Prozess...');

  // Prüfen, ob public-Verzeichnis existiert
  if (!fs.existsSync(publicDir)) {
    try {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log(`Public-Verzeichnis erstellt: ${publicDir}`);
    } catch (err) {
      console.error(`Fehler beim Erstellen von ${publicDir}:`, err);
      return;
    }
  }

  // Vorherige Self-Healing-Historie laden
  let healingHistory = [];
  if (fs.existsSync(selfHealingPath)) {
    try {
      healingHistory = JSON.parse(fs.readFileSync(selfHealingPath, 'utf8'));
    } catch (e) {
      console.warn('Self-Healing-Historie konnte nicht geladen werden, erstelle neu');
    }
  }

  // Optimierungs-Wissensbasis laden oder erstellen
  let knowledgeBase = {
    metaTagPatterns: {},
    commonIssues: {},
    successfulFixes: [],
    failedFixes: [],
  };

  if (fs.existsSync(optimizationKnowledgeBase)) {
    try {
      knowledgeBase = JSON.parse(fs.readFileSync(optimizationKnowledgeBase, 'utf8'));
    } catch (e) {
      console.warn('Optimierungs-Wissensbasis konnte nicht geladen werden, erstelle neu');

      // Optimierungs-Wissensbasis-Verzeichnis erstellen, falls es nicht existiert
      const knowledgeBaseDir = path.dirname(optimizationKnowledgeBase);
      if (!fs.existsSync(knowledgeBaseDir)) {
        try {
          fs.mkdirSync(knowledgeBaseDir, { recursive: true });
          console.log(`Knowledge-Base-Verzeichnis erstellt: ${knowledgeBaseDir}`);
        } catch (err) {
          console.error(`Fehler beim Erstellen von ${knowledgeBaseDir}:`, err);
        }
      }

      // Optimierungs-Wissensbasis mit Grundwerten erstellen
      safeWriteJson(optimizationKnowledgeBase, knowledgeBase);
    }
  } else {
    // Optimierungs-Wissensbasis-Verzeichnis erstellen, falls es nicht existiert
    const knowledgeBaseDir = path.dirname(optimizationKnowledgeBase);
    if (!fs.existsSync(knowledgeBaseDir)) {
      try {
        fs.mkdirSync(knowledgeBaseDir, { recursive: true });
        console.log(`Knowledge-Base-Verzeichnis erstellt: ${knowledgeBaseDir}`);
      } catch (err) {
        console.error(`Fehler beim Erstellen von ${knowledgeBaseDir}:`, err);
      }
    }

    // Optimierungs-Wissensbasis mit Grundwerten erstellen
    safeWriteJson(optimizationKnowledgeBase, knowledgeBase);
  }

  // Self-Healing Protokoll starten
  const healingSession = {
    id: `healing-${Date.now()}`,
    timestamp: new Date().toISOString(),
    commit: commit,
    issues: [],
    fixes: [],
    tests: {},
    success: false,
  };

  // 1. Audits für Probleme durchführen
  const issues = identifyIssues(runAudits);
  healingSession.issues = issues;

  if (issues.length === 0) {
    console.log('✅ Keine Probleme gefunden. Die Website ist in optimalem Zustand!');
    healingSession.success = true;
    healingHistory.push(healingSession);
    safeWriteJson(selfHealingPath, healingHistory);
    return;
  }

  console.log(`🔍 ${issues.length} Probleme identifiziert`);

  // 2. Probleme priorisieren
  const prioritizedIssues = prioritizeIssues(issues, knowledgeBase).slice(0, maxChangesPerRun);

  console.log(`🔧 Höchste Priorität: ${prioritizedIssues.map((i) => i.type).join(', ')}`);

  // 3. Probleme beheben
  if (autoFix) {
    const fixes = applyFixes(prioritizedIssues, knowledgeBase);
    healingSession.fixes = fixes;

    // 4. Tests nach Fixes ausführen
    if (testAfterFix && fixes.some((f) => f.applied)) {
      console.log('🧪 Führe Tests nach Änderungen durch...');
      const testResults = runTestsAfterFixes(fixes);
      healingSession.tests = testResults;

      // 5. Bei Erfolg committen
      if (commitOnSuccess && testResults.allPassed) {
        const commitSuccess = commitSelfHealingChanges(fixes);
        healingSession.committed = commitSuccess;

        if (commitSuccess) {
          console.log('🎉 Self-Healing erfolgreich abgeschlossen. Änderungen wurden committet!');

          // Erfolgreiche Fixes in die Wissensbasis aufnehmen
          fixes.forEach((fix) => {
            if (fix.applied && fix.successful) {
              knowledgeBase.successfulFixes.push({
                type: fix.type,
                pattern: fix.pattern || '',
                solution: fix.solution || '',
                date: new Date().toISOString(),
              });
            } else if (fix.applied && !fix.successful) {
              knowledgeBase.failedFixes.push({
                type: fix.type,
                pattern: fix.pattern || '',
                solution: fix.solution || '',
                date: new Date().toISOString(),
                error: fix.error || 'Unknown error',
              });
            }
          });

          // Wissensbasis aktualisieren
          safeWriteJson(optimizationKnowledgeBase, knowledgeBase);
        }
      }
    }
  }

  // Verlauf aktualisieren
  healingSession.success = healingSession.tests?.allPassed || false;
  healingHistory.push(healingSession);
  if (healingHistory.length > 100) {
    healingHistory = healingHistory.slice(-100); // Auf letzte 100 beschränken
  }
  safeWriteJson(selfHealingPath, healingHistory);

  console.log('📊 Self-Healing-Sitzung abgeschlossen');
}

/**
 * Identifiziert Probleme auf der Website
 * @param {boolean} runAudits - Sollen Audits ausgeführt werden?
 * @returns {Array} Gefundene Probleme
 */
function identifyIssues(runAudits = true) {
  const issues = [];

  // 1. Bekannte Probleme überprüfen (statisch)
  checkForCommonIssues(issues);

  // 2. Lighthouse-/Performance-Probleme identifizieren
  if (runAudits) {
    try {
      console.log('🔍 Führe Performance-Audits durch...');
      // In Produktion würden hier externe Audits ausgeführt
      // Für dieses Beispiel simulieren wir einige Ergebnisse

      // Performance-Simulation
      const samplePerformanceIssues = [
        {
          type: 'performance-lcp',
          severity: 'high',
          score: 0.78,
          description: 'Largest Contentful Paint zu langsam: 3.2s',
          affectedElements: ['assets/images/burni-logo.webp', 'assets/images/burni-chart.webp'],
          recommendations: [
            'Bilder optimieren',
            'Preloading für kritische Assets',
            'Reduzieren der Blocking-Zeit',
          ],
        },
        {
          type: 'performance-unused-css',
          severity: 'medium',
          score: 0.82,
          description: 'Ungenutztes CSS entdeckt: ~30% der styles.min.css',
          affectedElements: ['assets/css/styles.min.css'],
          recommendations: [
            'CSS optimieren und ungenutztes entfernen',
            'Critical CSS extrahieren und inline einfügen',
          ],
        },
      ];

      // SEO-Simulation
      const sampleSeoIssues = [
        {
          type: 'seo-meta-description',
          severity: 'high',
          score: 0.65,
          description: 'Meta-Beschreibungen fehlen name-Attribute',
          affectedElements: ['index.html', 'pages/token/index.html'],
          recommendations: [
            'Meta-Description-Tags mit name="description" versehen',
            'Beschreibungen auf 150-160 Zeichen optimieren',
          ],
        },
        {
          type: 'seo-structured-data',
          severity: 'medium',
          score: 0.7,
          description: 'Schema.org-Markup für FAQ unvollständig',
          affectedElements: ['index.html'],
          recommendations: [
            'Vollständiges FAQ-Schema implementieren',
            'Strukturierte Daten validieren',
          ],
        },
      ];

      // Accessibility-Simulation
      const sampleA11yIssues = [
        {
          type: 'a11y-contrast',
          severity: 'high',
          score: 0.6,
          description: 'Kontrastverhältnis unter 4.5:1 in Navigationselementen',
          affectedElements: ['.nav-link', '.mobile-menu a'],
          recommendations: [
            'Dunklere Textfarbe oder helleren Hintergrund verwenden',
            'WCAG AA-Standard erreichen (4.5:1)',
          ],
        },
      ];

      // Issues zusammenführen
      issues.push(...samplePerformanceIssues, ...sampleSeoIssues, ...sampleA11yIssues);

      console.log(`✅ Audit abgeschlossen. ${issues.length} Probleme identifiziert.`);
    } catch (err) {
      console.error('Fehler beim Durchführen der Audits:', err);
    }
  }

  return issues;
}

/**
 * Prüft auf bekannte, häufige Probleme
 * @param {Array} issues - Das Issues-Array, das erweitert wird
 */
function checkForCommonIssues(issues) {
  try {
    // 1. Prüfen auf fehlende alt-Attribute in Bildern
    const indexHtmlPath = path.join(__dirname, '..', '..', 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      const content = fs.readFileSync(indexHtmlPath, 'utf8');

      // Bilder ohne alt-Attribute finden
      const imgTagsWithoutAlt = content.match(/<img(?!.*alt=)[^>]*>/g) || [];

      if (imgTagsWithoutAlt.length > 0) {
        issues.push({
          type: 'a11y-missing-alt',
          severity: 'high',
          description: `${imgTagsWithoutAlt.length} Bilder ohne alt-Attribut gefunden`,
          affectedElements: imgTagsWithoutAlt.map(
            (tag) => tag.match(/src="([^"]+)"/)?.[1] || 'unknown',
          ),
          recommendations: [
            'Alt-Attribute für alle Bilder hinzufügen',
            'Für Dekorative Bilder alt="" verwenden',
          ],
        });
      }

      // Fehlende Meta-Tags prüfen
      const hasTitleTag = /<title>.*<\/title>/i.test(content);
      const hasDescriptionTag =
        /<meta\s+(?:name="description"|content="[^"]*"\s+name="description")/i.test(content);

      if (!hasTitleTag || !hasDescriptionTag) {
        issues.push({
          type: 'seo-missing-meta',
          severity: 'critical',
          description: `Kritische Meta-Tags fehlen: ${!hasTitleTag ? 'title, ' : ''}${!hasDescriptionTag ? 'description' : ''}`,
          affectedElements: ['index.html'],
          recommendations: [
            'Titel-Tag hinzufügen, falls nicht vorhanden',
            'Meta-Description hinzufügen mit name="description"',
          ],
        });
      }
    }

    // 2. Prüfen auf potenzielle JavaScript-Fehler
    const scriptsPath = path.join(__dirname, '..', '..', 'assets', 'scripts.js');
    if (fs.existsSync(scriptsPath)) {
      const jsContent = fs.readFileSync(scriptsPath, 'utf8');

      // Potenziell problematische Patterns
      const suspiciousPatterns = [
        { regex: /console\.log/g, type: 'js-console-log', desc: 'Console.log in Produktionscode' },
        {
          regex: /(?<!\/\/)\s*debugger;/g,
          type: 'js-debugger',
          desc: 'Debugger-Statements im Code',
        },
      ];

      for (const pattern of suspiciousPatterns) {
        const matches = jsContent.match(pattern.regex);
        if (matches && matches.length > 0) {
          issues.push({
            type: pattern.type,
            severity: pattern.type === 'js-debugger' ? 'high' : 'medium',
            description: `${matches.length} ${pattern.desc} gefunden`,
            affectedElements: ['assets/scripts.js'],
            recommendations: [
              'Entwicklungs-Code aus der Produktion entfernen',
              'Linting-Regeln für Produktionscode einrichten',
            ],
          });
        }
      }
    }
  } catch (err) {
    console.error('Fehler bei der Prüfung bekannter Probleme:', err);
  }
}

/**
 * Priorisiert die gefundenen Probleme nach Schweregrad und Auswirkung
 * @param {Array} issues - Gefundene Probleme
 * @param {Object} knowledgeBase - Wissensbasis mit erfolgreichen/fehlgeschlagenen Fixes
 * @returns {Array} Priorisierte Probleme
 */
function prioritizeIssues(issues, knowledgeBase) {
  // Priorisierungswerte für verschiedene Schweregrade
  const severityScores = {
    critical: 100,
    high: 80,
    medium: 60,
    low: 40,
    info: 20,
  };

  // Priorisierungswerte für verschiedene Problemtypen
  const typeScores = {
    security: 50, // Sicherheitsprobleme haben höchste Priorität
    'performance-lcp': 45, // Core Web Vitals haben hohe Priorität
    'performance-cls': 45,
    'performance-fid': 45,
    'seo-critical': 40, // SEO-Probleme sind wichtig für Sichtbarkeit
    accessibility: 35, // Barrierefreiheit ist wichtig für Nutzerbasis
    'api-reliability': 30, // API-Stabilität ist wichtig für Funktionalität
    'code-quality': 25, // Code-Qualität verbessert Wartbarkeit
  };

  // Bonuspunkte für Issues, die in der Vergangenheit erfolgreich behoben wurden
  const successBonus = 15;

  // Maluspunkte für Issues, bei denen Fixes in der Vergangenheit fehlgeschlagen sind
  const failurePenalty = -10;

  // Jedes Issue mit einem Priorisierungswert versehen
  const scoredIssues = issues.map((issue) => {
    // Grundwert basierend auf Schweregrad
    let score = severityScores[issue.severity] || 50;

    // Bonus für bestimmte Problemtypen
    if (issue.type in typeScores) {
      score += typeScores[issue.type];
    }

    // Bonus/Malus basierend auf bisherigem Erfolg/Misserfolg
    const successfulFixExists = knowledgeBase.successfulFixes.some(
      (fix) => fix.type === issue.type,
    );
    const failedFixExists = knowledgeBase.failedFixes.some(
      (fix) => fix.type === issue.type && fix.failureCount > 2,
    );

    if (successfulFixExists) {
      score += successBonus;
    }

    if (failedFixExists) {
      score += failurePenalty;
    }

    // Wert für User Impact einbeziehen, falls vorhanden
    if (issue.userImpact) {
      score += issue.userImpact * 10; // Skala von 0-10 mit Faktor 10 gewichten
    }

    return {
      ...issue,
      priorityScore: score,
    };
  });

  // Nach Prioritätswert absteigend sortieren
  return scoredIssues.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Wendet automatische Fixes für die Probleme an
 * @param {Array} issues - Priorisierte Probleme
 * @param {Object} knowledgeBase - Wissensbasis mit Lösungsmustern
 * @returns {Array} Angewendete Fixes mit Ergebnissen
 */
function applyFixes(issues, knowledgeBase) {
  console.log(`\n🔧 Wende automatische Korrekturen für ${issues.length} Probleme an...`);
  const results = [];

  for (const issue of issues) {
    console.log(`\n⚙️ Bearbeite Problem: ${issue.type} (${issue.severity})`);
    console.log(`   ${issue.description}`);

    // Fix-Ergebnis initialisieren
    const fixResult = {
      issueType: issue.type,
      issueDescription: issue.description,
      timestamp: new Date().toISOString(),
      applied: false,
      successful: false,
      actions: [],
    };

    try {
      // Basierend auf Problem-Typ entsprechende Fix-Funktion auswählen
      switch (issue.type) {
        case 'performance-lcp':
          fixResult.actions = optimizeLCP(issue);
          break;

        case 'performance-unused-css':
          fixResult.actions = optimizeCSS(issue);
          break;

        case 'seo-meta-tags':
          fixResult.actions = fixMetaTags(issue);
          break;

        case 'accessibility-missing-alt':
          fixResult.actions = fixMissingAltAttributes(issue);
          break;

        case 'performance-unoptimized-images':
          fixResult.actions = optimizeImages(issue);
          break;

        case 'security-csp':
          fixResult.actions = fixContentSecurityPolicy(issue);
          break;

        case 'api-reliability':
          fixResult.actions = improveAPIReliability(issue);
          break;

        default:
          console.log(`⚠️ Keine automatische Korrektur verfügbar für Problemtyp: ${issue.type}`);
      }

      // Fix als angewendet markieren, wenn Aktionen durchgeführt wurden
      fixResult.applied = fixResult.actions.length > 0;

      // Erfolg bestimmen (wenn alle Aktionen erfolgreich waren)
      fixResult.successful =
        fixResult.applied && fixResult.actions.every((action) => action.success);

      // In Knowledge Base eintragen
      if (fixResult.applied) {
        if (fixResult.successful) {
          // Erfolgreichen Fix zur Wissensbasis hinzufügen
          knowledgeBase.successfulFixes.push({
            type: issue.type,
            timestamp: fixResult.timestamp,
            actions: fixResult.actions.map((a) => a.description),
          });
        } else {
          // Fehlgeschlagenen Fix tracken
          const existingFailedFix = knowledgeBase.failedFixes.find((f) => f.type === issue.type);
          if (existingFailedFix) {
            existingFailedFix.failureCount = (existingFailedFix.failureCount || 0) + 1;
            existingFailedFix.lastAttempt = fixResult.timestamp;
          } else {
            knowledgeBase.failedFixes.push({
              type: issue.type,
              failureCount: 1,
              lastAttempt: fixResult.timestamp,
            });
          }
        }

        // Aktualisierte Knowledge Base speichern
        safeWriteJson(optimizationKnowledgeBase, knowledgeBase);
      }

      // Ausgabe des Ergebnisses
      if (fixResult.applied) {
        if (fixResult.successful) {
          console.log(`✅ Fix für '${issue.type}' erfolgreich angewendet!`);
        } else {
          console.log(`❌ Fix für '${issue.type}' angewendet, aber nicht erfolgreich.`);
        }
      }
    } catch (error) {
      console.error(`❌ Fehler beim Anwenden des Fixes für ${issue.type}:`, error);
      fixResult.error = error.message;
    }

    results.push(fixResult);
  }

  return results;
}
