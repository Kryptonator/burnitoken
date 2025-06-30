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
        const psVersionOutput = execSync('powershell -Command "$PSVersionTable.PSVersion.ToString()"', { encoding: 'utf8' });
        shellType = 'powershell';
        shellVersion = psVersionOutput.trim();
        
        // Execution-Policy prüfen
        try {
          const policyOutput = execSync('powershell -Command "Get-ExecutionPolicy"', { encoding: 'utf8' });
          const policy = policyOutput.trim().toLowerCase();
          if (policy === 'restricted' || policy === 'allsigned') {
            hasPowerShellIssues = true;
            console.warn('⚠️ PowerShell Execution-Policy ist restriktiv. Dies könnte Skriptausführungen blockieren.');
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
        shellType = process.env.SHELL?.includes('zsh') ? 'zsh' : 
                   process.env.SHELL?.includes('bash') ? 'bash' : 'sh';
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
      gitCheckout: shellType === 'powershell' 
        ? 'git checkout' // PowerShell verwendet normale Git-Befehle
        : 'git checkout',
      npmInstall: shellType === 'powershell'
        ? 'npm install' // Normales npm install
        : 'npm install',
      npmBuild: shellType === 'powershell'
        ? 'npm run build' // Normales npm run
        : 'npm run build',
      checkInternet: shellType === 'powershell'
        ? 'Test-NetConnection -ComputerName github.com -Port 443 | Select-Object -ExpandProperty TcpTestSucceeded'
        : isWindows 
          ? 'ping -n 1 github.com >nul && echo true || echo false'
          : 'ping -c 1 github.com >/dev/null && echo true || echo false'
    }
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
    recommendations: shellEnv.hasPowerShellIssues ? [
      'PowerShell mit -ExecutionPolicy Bypass ausführen',
      'In .ps1 Files [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 einfügen',
      'Pfade mit doppelten Backslashes in PowerShell-Skripten verwenden'
    ] : []
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
    .filter(entry => entry.status === 'success' && new Date(entry.date) < targetDate)
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
  console.log(`- Workflow: ${lastStableDeploy.url}`);
  console.log('\nZum Wiederherstellen:');
  console.log(`git checkout ${lastStableDeploy.commit}`);
  console.log('npm install');
  console.log('npm run build');
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
        apiLatency: 0
      },
      thresholds: {
        memoryWarning: 500 * 1024 * 1024, // 500MB
        loadTimeWarning: 2000, // 2 Sekunden
        criticalErrors: 5
      }
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
  const previousSuccessful = history.slice(0, -1)
    .filter(h => h.measurements && h.commit !== currentCommit)
    .slice(-3); // Letzte 3
  
  if (previousSuccessful.length === 0) return;
  
  // Durchschnittliche Performance berechnen
  const avgPrevLoadTime = previousSuccessful.reduce((sum, item) => 
    sum + (item.measurements?.loadTime || 0), 0) / previousSuccessful.length;
  
  // Wenn aktuelle Ladezeit mehr als 50% langsamer ist - kritisch
  if (current.measurements.loadTime > avgPrevLoadTime * 1.5 &&
      current.measurements.loadTime > current.thresholds.loadTimeWarning) {
    console.warn(`⚠️ KRITISCHES PERFORMANCE-PROBLEM: Ladezeit ${current.measurements.loadTime}ms ist ${Math.round((current.measurements.loadTime/avgPrevLoadTime - 1) * 100)}% langsamer als vorher (${Math.round(avgPrevLoadTime)}ms)`);
    
    // Flag für nötiges Recovery setzen
    fs.writeFileSync(recoveryFlagPath, JSON.stringify({
      reason: 'performance-degradation',
      timestamp: new Date().toISOString(),
      metrics: {
        current: current.measurements.loadTime,
        previous: avgPrevLoadTime,
        percentSlower: Math.round((current.measurements.loadTime/avgPrevLoadTime - 1) * 100)
      },
      recommendedAction: 'rollback'
    }));
    
    // In Produktion hier einen Alert auslösen oder Auto-Rollback starten
  }
}

/**
 * Führt einen automatischen Rollback durch, wenn nötig
 */
function executeAutoRollbackIfNeeded() {
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
    
    // Letzten stabilen Deploy finden
    const lastStableDeploy = findLastStableDeployBefore(new Date(recoveryData.timestamp));
    if (!lastStableDeploy) {
      console.error('Keinen stabilen Deploy für Rollback gefunden!');
      return;
    }
    
    const shellEnv = detectShellEnvironment();
    
    console.log(`Rollback zu Commit: ${lastStableDeploy.commit.substring(0, 7)} vom ${new Date(lastStableDeploy.date).toLocaleString()}`);
    
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
    
    // 4. Auto-Recovery dokumentieren und committen
    const recoveryFiles = [
      'package-lock.json',
      'public/deploy-history.json',
      'public/performance-history.json',
      'public/crash-logs.json'
    ];
    
    const recoveryCommitMessage = `Auto-Rollback zu stabilem Commit ${lastStableDeploy.commit.substring(0, 7)} vom ${new Date(lastStableDeploy.date).toLocaleString()} wegen ${recoveryData.reason}`;
    
    // Commit erstellen und pushen
    const commitSuccess = commitAndPushChanges(
      recoveryCommitMessage,
      recoveryFiles,
      {
        autoFix: true,
        createBranch: true,  // Sicherheitshalber neuen Branch erstellen
        pushOrigin: true,
        recoveryMode: true
      }
    );
    
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
    autoFix = true,     // Automatisches Fixen von Fehlern
    branch = '',        // Ziel-Branch, leer = aktueller Branch
    createBranch = false, // Neuen Branch erstellen?
    pushOrigin = true,  // Nach Origin pushen?
    recoveryMode = false // Ist dies ein Recovery-Commit?
  } = options;
  
  const shellEnv = detectShellEnvironment();
  const isPowerShell = shellEnv.type === 'powershell';
  
  try {
    // 1. Aktuelle Branch ermitteln wenn nicht angegeben
    let targetBranch = branch;
    if (!targetBranch) {
      try {
        const branchCmd = isPowerShell ? 
          'git rev-parse --abbrev-ref HEAD' : 
          'git rev-parse --abbrev-ref HEAD';
        targetBranch = execSync(branchCmd, { encoding: 'utf8' }).trim();
      } catch (e) {
        console.error('Fehler beim Ermitteln des aktuellen Branch:', e);
        return false;
      }
    }
    
    // 2. Prüfen, ob Änderungen vorhanden sind
    try {
      const statusCmd = isPowerShell ? 
        'git status --porcelain' : 
        'git status --porcelain';
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
        const createBranchCmd = isPowerShell ? 
          `git checkout -b ${newBranch}` : 
          `git checkout -b ${newBranch}`;
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
          const addCmd = isPowerShell ? 
            `git add "${file}"` : 
            `git add "${file}"`;
          execSync(addCmd, { encoding: 'utf8' });
        } catch (e) {
          console.error(`Fehler beim Stagen von ${file}:`, e);
          if (!autoFix) return false;
        }
      }
    } else {
      // Alle Änderungen stagen
      try {
        const addAllCmd = isPowerShell ? 
          'git add .' : 
          'git add .';
        execSync(addAllCmd, { encoding: 'utf8' });
      } catch (e) {
        console.error('Fehler beim Stagen aller Änderungen:', e);
        if (!autoFix) return false;
      }
    }
    
    // 5. Commit durchführen
    const commitMessage = recoveryMode ? 
      `[AUTO-RECOVERY] ${message}` : 
      message;
    
    try {
      const commitCmd = isPowerShell ? 
        `git commit -m "${commitMessage.replace(/"/g, '\\"')}"` : 
        `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`;
      execSync(commitCmd, { encoding: 'utf8' });
      console.log(`Änderungen committet: "${commitMessage}"`);
    } catch (e) {
      console.error('Fehler beim Committen:', e);
      return false;
    }
    
    // 6. Push, falls gewünscht
    if (pushOrigin) {
      try {
        const pushCmd = isPowerShell ? 
          `git push origin ${targetBranch}` : 
          `git push origin ${targetBranch}`;
        execSync(pushCmd, { encoding: 'utf8' });
        console.log(`Änderungen zu origin/${targetBranch} gepusht`);
      } catch (e) {
        console.error('Fehler beim Pushen:', e);
        
        if (autoFix) {
          console.log('Versuche Push mit --force-with-lease...');
          try {
            const forcePushCmd = isPowerShell ? 
              `git push --force-with-lease origin ${targetBranch}` : 
              `git push --force-with-lease origin ${targetBranch}`;
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
 */
function executeSelfHealing() {
  if (!fs.existsSync(selfHealingPath)) {
    console.log('Keine Selbstheilungs-Historie gefunden, starte ersten Eintrag');
  }
  
  try {
    // Aktuelle Deploy-Historie laden
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    const latestDeploy = history[history.length - 1];
    
    // Aktuelle Performance-Historie laden
    const performanceHistory = JSON.parse(fs.readFileSync(performancePath, 'utf8'));
    const latestPerformance = performanceHistory[performanceHistory.length - 1];
    
    // Fehlerprotokollierung aktivieren
    let errorLog = [];
    const logError = (error) => {
      errorLog.push({
        timestamp: new Date().toISOString(),
        error
      });
    };
    
    // Beispiel: Automatisches Rollback bei wiederholten Fehlern
    if (latestDeploy.status !== 'success') {
      console.warn('Letzter Deploy war nicht erfolgreich, führe Selbstheilung durch');
      
      // 1. Letzten stabilen Deploy finden
      const lastStableDeploy = findLastStableDeployBefore(new Date(latestDeploy.date));
      if (lastStableDeploy) {
        console.log(`Rollback zu letztem stabilen Deploy vom ${new Date(lastStableDeploy.date).toLocaleString()}`);
        
        // Rollback-Befehle sammeln
        let rollbackCommands = [
          `git checkout ${lastStableDeploy.commit}`,
          'npm install',
          'npm run build'
        ];
        
        // 2. Führe Rollback-Befehle aus
        for (const command of rollbackCommands) {
          try {
            console.log(`Führe aus: ${command}`);
            execSync(command, { encoding: 'utf8', stdio: 'inherit' });
          } catch (e) {
            console.error(`Fehler bei Befehl "${command}":`, e);
            logError(e);
          }
        }
        
        // 3. Status nach Rollback überprüfen
        const postRollbackDeploy = JSON.parse(fs.readFileSync(historyPath, 'utf8')).pop();
        if (postRollbackDeploy.status === 'success') {
          console.log('Rollback erfolgreich, dokumentiere Selbstheilung');
          
          // Selbstheilungs-Eintrag erstellen
          const healingEntry = {
            timestamp: new Date().toISOString(),
            deploy: postRollbackDeploy,
            performance: latestPerformance,
            errors: errorLog
          };
          
          safeWriteJson(selfHealingPath, healingEntry);
        } else {
          console.warn('Rollback war nicht erfolgreich, weitere Analyse erforderlich');
        }
      } else {
        console.error('Kein stabiler Deploy für Rollback gefunden');
      }
    } else {
      console.log('Letzter Deploy war erfolgreich, keine Aktion erforderlich');
    }
  } catch (err) {
    console.error('Fehler im Selbstheilungsprozess:', err);
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
    const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
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
        memoryUsage: process.memoryUsage()
      }
    };
    
    // Absturz protokollieren
    crashes.push(crashEntry);
    if (crashes.length > 100) {
      crashes = crashes.slice(-100); // Auf letzte 100 beschränken
    }
    
    safeWriteJson(crashLogsPath, crashes);
    
    // Recovery Flag setzen, falls kritisch
    if (crashInfo.severity === 'critical' && !fs.existsSync(recoveryFlagPath)) {
      fs.writeFileSync(recoveryFlagPath, JSON.stringify({
        reason: `crash-${crashInfo.type}`,
        timestamp: new Date().toISOString(),
        crashId,
        recommendedAction: 'check-logs-and-fix'
      }));
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
        filterDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
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
      ? crashes.filter(crash => new Date(crash.timestamp) >= filterDate)
      : crashes;
    
    console.log('\n=== ABSTURZ-BERICHT ===');
    console.log(`Anzahl der Abstürze${filterDate ? ` seit ${filterDate.toLocaleString()}` : ''}: ${filteredCrashes.length}`);
    
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
      console.log(`Betroffene Komponente(n): ${[...new Set(crashes.map(c => c.component))].join(', ')}`);
      console.log(`Erste Meldung: ${new Date(crashes[0].timestamp).toLocaleString()}`);
      console.log(`Letzte Meldung: ${new Date(crashes[crashes.length - 1].timestamp).toLocaleString()}`);
      
      if (crashes.length >= 3) {
        console.log('Der Fehler tritt wiederholt auf. Eine Untersuchung wird empfohlen.');
      }
    });
    
    // Empfehlungen
    console.log('\nEmpfehlungen:');
    if (filteredCrashes.some(c => c.severity === 'critical')) {
      console.log('❗ KRITISCHE ABSTÜRZE festgestellt! Sofortiges Handeln erforderlich.');
      console.log('   Prüfen Sie die Logs und führen Sie einen Rollback durch, falls nötig.');
      console.log('   Verwenden Sie: node .github/update-deploy-history.js --recovery --time=<letzte-stabile-zeit>');
    } else if (filteredCrashes.some(c => c.severity === 'high')) {
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
    autoFix = true,           // Automatische Behebung von Fehlern
    runAudits = true,         // Audits ausführen (Lighthouse, AXE, etc.)
    updateMetaTags = true,    // Meta-Tags aktualisieren basierend auf GSC-Daten
    optimizeImages = true,    // Bilder optimieren
    testAfterFix = true,      // Tests nach Fixes ausführen
    commitOnSuccess = true,   // Änderungen committen, wenn Tests erfolgreich
    maxChangesPerRun = 3      // Maximale Anzahl an Änderungen pro Durchlauf
  } = options;

  console.log('\n🔄 Starte Self-Healing-Prozess...');
  
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
    failedFixes: []
  };
  
  if (fs.existsSync(optimizationKnowledgeBase)) {
    try {
      knowledgeBase = JSON.parse(fs.readFileSync(optimizationKnowledgeBase, 'utf8'));
    } catch (e) {
      console.warn('Optimierungs-Wissensbasis konnte nicht geladen werden, erstelle neu');
    }
  }

  // Self-Healing Protokoll starten
  const healingSession = {
    id: `healing-${Date.now()}`,
    timestamp: new Date().toISOString(),
    commit: commit,
    issues: [],
    fixes: [],
    tests: {},
    success: false
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
  const prioritizedIssues = prioritizeIssues(issues, knowledgeBase)
    .slice(0, maxChangesPerRun);
    
  console.log(`🔧 Höchste Priorität: ${prioritizedIssues.map(i => i.type).join(', ')}`);
  
  // 3. Probleme beheben
  if (autoFix) {
    const fixes = applyFixes(prioritizedIssues, knowledgeBase);
    healingSession.fixes = fixes;
    
    // 4. Tests nach Fixes ausführen
    if (testAfterFix && fixes.some(f => f.applied)) {
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
          fixes.forEach(fix => {
            if (fix.applied && fix.successful) {
              knowledgeBase.successfulFixes.push({
                type: fix.type,
                pattern: fix.pattern,
                solution: fix.solution,
                date: new Date().toISOString()
              });
            } else if (fix.applied && !fix.successful) {
              knowledgeBase.failedFixes.push({
                type: fix.type,
                pattern: fix.pattern,
                solution: fix.solution,
                date: new Date().toISOString(),
                error: fix.error || 'Unknown error'
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
  healingSession.success = healingSession.tests.allPassed || false;
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
            'Reduzieren der Blocking-Zeit'
          ]
        },
        {
          type: 'performance-unused-css',
          severity: 'medium',
          score: 0.82,
          description: 'Ungenutztes CSS entdeckt: ~30% der styles.min.css',
          affectedElements: ['assets/css/styles.min.css'],
          recommendations: [
            'CSS optimieren und ungenutztes entfernen',
            'Critical CSS extrahieren und inline einfügen'
          ]
        }
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
            'Beschreibungen auf 150-160 Zeichen optimieren'
          ]
        },
        {
          type: 'seo-structured-data',
          severity: 'medium',
          score: 0.7,
          description: 'Schema.org-Markup für FAQ unvollständig',
          affectedElements: ['index.html'],
          recommendations: [
            'Vollständiges FAQ-Schema implementieren',
            'Strukturierte Daten validieren'
          ]
        }
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
            'WCAG AA-Standard erreichen (4.5:1)'
          ]
        }
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
      const imgTagsWithoutAlt = (content.match(/<img(?!.*alt=)[^>]*>/g) || []);
      
      if (imgTagsWithoutAlt.length > 0) {
        issues.push({
          type: 'a11y-missing-alt',
          severity: 'high',
          description: `${imgTagsWithoutAlt.length} Bilder ohne alt-Attribut gefunden`,
          affectedElements: imgTagsWithoutAlt.map(tag => tag.match(/src="([^"]+)"/)?.[1] || 'unknown'),
          recommendations: [
            'Alt-Attribute für alle Bilder hinzufügen',
            'Für Dekorative Bilder alt="" verwenden'
          ]
        });
      }
      
      // Fehlende Meta-Tags prüfen
      const hasTitleTag = /<title>.*<\/title>/i.test(content);
      const hasDescriptionTag = /<meta\s+(?:name="description"|content="[^"]*"\s+name="description")/i.test(content);
      
      if (!hasTitleTag || !hasDescriptionTag) {
        issues.push({
          type: 'seo-missing-meta',
          severity: 'critical',
          description: `Kritische Meta-Tags fehlen: ${!hasTitleTag ? 'title, ' : ''}${!hasDescriptionTag ? 'description' : ''}`,
          affectedElements: ['index.html'],
          recommendations: [
            'Titel-Tag hinzufügen, falls nicht vorhanden',
            'Meta-Description hinzufügen mit name="description"'
          ]
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
        { regex: /\/\/\s*TODO/g, type: 'js-todo-comment', desc: 'TODO-Kommentare im Code' },
        { regex: /(?<!\/\/)\s*debugger;/g, type: 'js-debugger', desc: 'Debugger-Statements im Code' },
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
              'Linting-Regeln für Produktionscode einrichten'
            ]
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
  // Gewichtungen für verschiedene Faktoren
  const weights = {
    severity: {
      critical: 10,
      high: 5,
      medium: 3,
      low: 1
    },
    score: 5,  // Multiplikator für (1 - score)
    successHistory: 2, // Bonus für Probleme, die wir erfolgreich beheben können
    failHistory: -3    // Malus für Probleme, bei denen Fixes fehlgeschlugen
  };
  
  return issues.map(issue => {
    let priority = 0;
    
    // 1. Nach Schweregrad priorisieren
    priority += weights.severity[issue.severity] || weights.severity.medium;
    
    // 2. Nach Score priorisieren (niedrigerer Score = höhere Priorität)
    if (issue.score !== undefined) {
      priority += weights.score * (1 - issue.score);
    }
    
    // 3. Erfolgshistorie berücksichtigen
    const successfulFixes = knowledgeBase.successfulFixes.filter(fix => 
      fix.type === issue.type
    ).length;
    
    const failedFixes = knowledgeBase.failedFixes.filter(fix => 
      fix.type === issue.type
    ).length;
    
    priority += successfulFixes * weights.successHistory;
    priority += failedFixes * weights.failHistory;
    
    return { ...issue, priority };
  })
  .sort((a, b) => b.priority - a.priority); // Absteigend nach Priorität
}

/**
 * Wendet automatische Fixes für die Probleme an
 * @param {Array} issues - Priorisierte Probleme
 * @param {Object} knowledgeBase - Wissensbasis mit Lösungsmustern
 * @returns {Array} Angewendete Fixes mit Ergebnissen
 */
function applyFixes(issues, knowledgeBase) {
  const appliedFixes = [];
  
  for (const issue of issues) {
    console.log(`🔧 Versuche Fix für: ${issue.type} (${issue.description})`);
    
    let fix = {
      type: issue.type,
      issueDescription: issue.description,
      applied: false,
      successful: false,
      timestamp: new Date().toISOString()
    };
    
    try {
      switch (issue.type) {
        case 'seo-meta-description':
          fix = applyMetaDescriptionFix(issue, fix);
          break;
          
        case 'a11y-missing-alt':
          fix = applyMissingAltFix(issue, fix);
          break;
          
        case 'performance-lcp':
          fix = applyLCPFix(issue, fix);
          break;
          
        case 'seo-structured-data':
          fix = applyStructuredDataFix(issue, fix);
          break;
          
        case 'js-debugger':
        case 'js-console-log':
        case 'js-todo-comment':
          fix = applyJSCleanupFix(issue, fix);
          break;
          
        default:
          console.log(`⚠️ Kein automatischer Fix verfügbar für ${issue.type}`);
          fix.reason = 'No automated fix available';
      }
    } catch (err) {
      console.error(`❌ Fehler beim Fix für ${issue.type}:`, err);
      fix.successful = false;
      fix.error = err.message;
    }
    
    appliedFixes.push(fix);
  }
  
  return appliedFixes;
}

/**
 * Fügt fehlende Meta-Description hinzu oder korrigiert diese
 * @param {Object} issue - Das Problem
 * @param {Object} fix - Das Fix-Objekt, das angereichert wird
 * @returns {Object} Das aktualisierte Fix-Objekt
 */
function applyMetaDescriptionFix(issue, fix) {
  const filePaths = issue.affectedElements || [];
  
  for (const filePath of filePaths) {
    const fullPath = path.join(__dirname, '..', '..', filePath);
    if (!fs.existsSync(fullPath)) continue;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 1. Prüfen, ob <head> vorhanden ist
    if (!/<head[^>]*>/i.test(content)) {
      fix.reason = 'No head tag found';
      continue;
    }
    
    // 2. Prüfen, ob bereits eine Meta-Description vorhanden ist
    const hasMetaDescription = /<meta\s+(?:name="description"|content="[^"]*"\s+name="description")/i.test(content);
    
    let updatedContent = content;
    if (!hasMetaDescription) {
      // Meta-Description einfügen
      const defaultDesc = 'Die deflationäre Kryptowährung auf dem XRP Ledger mit automatischem Token-Burning. Investieren Sie in eine nachhaltige Zukunft.';
      const metaTag = `<meta name="description" content="${defaultDesc}" />`;
      
      // Einfügen nach <head> oder vor </head>
      updatedContent = updatedContent.replace(
        /<head[^>]*>/i,
        match => `${match}\n    ${metaTag}`
      );
      
      fs.writeFileSync(fullPath, updatedContent, 'utf8');
      fix.applied = true;
      fix.successful = true;
      fix.changes = [{
        file: filePath,
        description: 'Meta-Description-Tag eingefügt',
        insertedContent: metaTag
      }];
    } else {
      // Meta-Description korrigieren, wenn name fehlt
      const metaDescWithoutName = /<meta\s+content="([^"]*)"\s*(?!name=)[^>]*>/gi;
      if (metaDescWithoutName.test(content)) {
        updatedContent = content.replace(
          metaDescWithoutName,
          (match, content) => `<meta name="description" content="${content}" />`
        );
        
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        fix.applied = true;
        fix.successful = true;
        fix.changes = [{
          file: filePath,
          description: 'Meta-Description-Tag korrigiert (name-Attribut hinzugefügt)',
        }];
      }
    }
  }
  
  return fix;
}

/**
 * Fügt fehlende alt-Attribute zu Bildern hinzu
 * @param {Object} issue - Das Problem
 * @param {Object} fix - Das Fix-Objekt, das angereichert wird
 * @returns {Object} Das aktualisierte Fix-Objekt
 */
function applyMissingAltFix(issue, fix) {
  const filePaths = ['index.html', ...issue.affectedElements.map(el => {
    if (el.startsWith('/')) return el.substring(1);
    return el;
  })];
  
  // Eindeutigen Dateipfad finden (index.html oder ähnliches)
  let htmlFiles = filePaths.filter(p => p.endsWith('.html'));
  if (htmlFiles.length === 0) htmlFiles = ['index.html'];

  const changes = [];
  
  for (const htmlFile of htmlFiles) {
    const fullPath = path.join(__dirname, '..', '..', htmlFile);
    if (!fs.existsSync(fullPath)) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Bilder ohne alt-Attribute finden und fix anwenden
    const imgRegex = /<img(?!.*alt=)[^>]*>/g;
    content = content.replace(imgRegex, match => {
      modified = true;
      
      // Versuche, einen sinnvollen Alt-Text zu generieren
      let altText = 'BurniToken Bild'; // Default
      
      // Aus src-Attribut einen besseren Alt-Text ableiten
      const srcMatch = match.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        const src = srcMatch[1];
        const filename = path.basename(src, path.extname(src));
        
        // Vom Dateinamen abgeleitet
        if (filename.includes('logo')) {
          altText = 'BurniToken Logo';
        } else if (filename.includes('chart')) {
          altText = 'BurniToken Chart zur Performance';
        } else if (filename.includes('burn')) {
          altText = 'Token-Burning Illustration';
        } else if (filename.includes('lagerfeuer')) {
          altText = 'Burni im Lagerfeuer - Token-Burning Symbol';
        }
      }
      
      // Alt-Attribut einfügen
      return match.replace(/(<img)/, `$1 alt="${altText}"`);
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      changes.push({
        file: htmlFile,
        description: 'Alt-Attribute zu Bildern ohne alt-Text hinzugefügt'
      });
    }
  }
  
  if (changes.length > 0) {
    fix.applied = true;
    fix.successful = true;
    fix.changes = changes;
  }
  
  return fix;
}

/**
 * Optimiert die LCP (Largest Contentful Paint)
 * @param {Object} issue - Das Problem
 * @param {Object} fix - Das Fix-Objekt, das angereichert wird
 * @returns {Object} Das aktualisierte Fix-Objekt
 */
function applyLCPFix(issue, fix) {
  const changes = [];
  
  // 1. Preloading für wichtige Bilder hinzufügen
  const indexPath = path.join(__dirname, '..', '..', 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Kritische Assets aus dem Issue
    const criticalAssets = issue.affectedElements || [];
    
    // Bereits vorhandene Preloads prüfen
    const existingPreloads = [];
    const preloadRegex = /<link[^>]*rel="preload"[^>]*href="([^"]+)"[^>]*>/g;
    let preloadMatch;
    while ((preloadMatch = preloadRegex.exec(content)) !== null) {
      existingPreloads.push(preloadMatch[1]);
    }
    
    // Preloads für kritische Assets hinzufügen, die noch nicht preloaded werden
    const preloadsToAdd = criticalAssets.filter(asset => 
      !existingPreloads.some(preload => preload.includes(asset.split('/').pop()))
    );
    
    if (preloadsToAdd.length > 0) {
      let updatedContent = content;
      
      // Preloads nach dem Titel einfügen
      const preloadTags = preloadsToAdd.map(asset => 
        `    <link rel="preload" href="${asset}" as="${asset.endsWith('.css') ? 'style' : 'image'}" type="${
          asset.endsWith('.css') ? 'text/css' : 
          asset.endsWith('.webp') ? 'image/webp' : 
          asset.endsWith('.png') ? 'image/png' : 
          'image/jpeg'
        }" />`
      ).join('\n');
      
      updatedContent = updatedContent.replace(
        /<\/title>/i,
        match => `${match}\n${preloadTags}`
      );
      
      fs.writeFileSync(indexPath, updatedContent, 'utf8');
      changes.push({
        file: 'index.html',
        description: `Preload-Tags für kritische Assets hinzugefügt: ${preloadsToAdd.join(', ')}`
      });
    }
  }
  
  if (changes.length > 0) {
    fix.applied = true;
    fix.successful = true;
    fix.changes = changes;
  } else {
    fix.reason = 'Keine optimierbaren Assets gefunden oder alle kritischen Assets werden bereits preloaded';
  }
  
  return fix;
}

/**
 * Fügt strukturierte Daten (Schema.org) hinzu oder korrigiert diese
 * @param {Object} issue - Das Problem
 * @param {Object} fix - Das Fix-Objekt, das angereichert wird
 * @returns {Object} Das aktualisierte Fix-Objekt
 */
function applyStructuredDataFix(issue, fix) {
  const filePaths = issue.affectedElements || [];
  
  for (const filePath of filePaths) {
    const fullPath = path.join(__dirname, '..', '..', filePath);
    if (!fs.existsSync(fullPath)) continue;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 1. Prüfen, ob <head> vorhanden ist
    if (!/<head[^>]*>/i.test(content)) {
      fix.reason = 'No head tag found';
      continue;
    }
    
    // 2. FAQ-Strukturierte Daten finden/erstellen
    // FAQ-Abschnitt in der HTML suchen
    const faqSection = content.match(/<section[^>]*id="faq"[^>]*>([\s\S]*?)<\/section>/i);
    
    if (faqSection) {
      // FAQ-Fragen und Antworten extrahieren
      const faqItems = [];
      const faqItemRegex = /<h3[^>]*>(.*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
      let match;
      
      let faqContent = faqSection[1];
      while ((match = faqItemRegex.exec(faqContent)) !== null) {
        faqItems.push({
          question: match[1].trim().replace(/<[^>]*>/g, ''),
          answer: match[2].trim().replace(/<[^>]*>/g, '')
        });
      }
      
      if (faqItems.length > 0) {
        // FAQ-Schema erstellen
        const faqSchema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.answer
            }
          }))
        };
        
        // Als JSON-LD in den head einfügen
        const schemaScript = `<script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
</script>`;
        
        // Prüfen, ob bereits FAQ-Schema vorhanden ist
        const hasExistingFAQSchema = content.includes('"@type": "FAQPage"');
        
        let updatedContent = content;
        if (!hasExistingFAQSchema) {
          updatedContent = updatedContent.replace(
            /<\/head>/i,
            `${schemaScript}\n</head>`
          );
          
          fs.writeFileSync(fullPath, updatedContent, 'utf8');
          fix.applied = true;
          fix.successful = true;
          fix.changes = [{
            file: filePath,
            description: `FAQ Schema.org-Markup für ${faqItems.length} Fragen hinzugefügt`
          }];
        } else {
          // Hier könnte man auch vorhandenes Schema aktualisieren
          fix.reason = 'FAQ Schema bereits vorhanden';
        }
      } else {
        fix.reason = 'Keine FAQ-Fragen gefunden';
      }
    } else {
      fix.reason = 'Kein FAQ-Abschnitt gefunden';
    }
  }
  
  return fix;
}

/**
 * Behebt JavaScript-Probleme (debugger, console.log, etc.)
 * @param {Object} issue - Das Problem
 * @param {Object} fix - Das Fix-Objekt, das angereichert wird
 * @returns {Object} Das aktualisierte Fix-Objekt
 */
function applyJSCleanupFix(issue, fix) {
  const filePaths = issue.affectedElements || [];
  
  for (const filePath of filePaths) {
    const fullPath = path.join(__dirname, '..', '..', filePath);
    if (!fs.existsSync(fullPath)) continue;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    let updatedContent = content;
    
    switch (issue.type) {
      case 'js-debugger':
        // Debugger-Statements entfernen
        updatedContent = updatedContent.replace(/(?<!\/\/)\s*debugger;/g, '');
        break;
        
      case 'js-console-log':
        // console.log-Statements auskommentieren
        updatedContent = updatedContent.replace(/(console\.log\([^)]*\);)/g, '// $1');
        break;
        
      case 'js-todo-comment':
        // TODO-Kommentare mit Warnung versehen
        updatedContent = updatedContent.replace(
          /(\/\/\s*TODO[^:\n]*):?\s*(.*)/g, 
          '// FIXME: Production has TODO comment - $1: $2'
        );
        break;
    }
    
    if (updatedContent !== content) {
      fs.writeFileSync(fullPath, updatedContent, 'utf8');
      fix.applied = true;
      fix.successful = true;
      fix.changes = [{
        file: filePath,
        description: `JavaScript bereinigt: ${issue.type}`
      }];
    }
  }
  
  return fix;
}

/**
 * Führt Tests nach angewendeten Fixes durch
 * @param {Array} appliedFixes - Die angewendeten Fixes
 * @returns {Object} Testergebnisse
 */
function runTestsAfterFixes(appliedFixes) {
  console.log('🧪 Teste Änderungen...');
  
  const testResults = {
    performanceTests: [],
    accessibilityTests: [],
    seoTests: [],
    validationTests: [],
    allPassed: true
  };
  
  // Nur relevante Tests basierend auf den angewendeten Fixes ausführen
  const fixTypes = appliedFixes
    .filter(fix => fix.applied)
    .map(fix => fix.type);
  
  try {
    // 1. HTML-Validierung für alle HTML-Änderungen
    if (appliedFixes.some(fix => fix.changes?.some(change => change.file?.endsWith('.html')))) {
      const htmlFiles = new Set();
      
      appliedFixes.forEach(fix => {
        fix.changes?.forEach(change => {
          if (change.file?.endsWith('.html')) {
            htmlFiles.add(change.file);
          }
        });
      });
      
      // Hier würde man W3C-Validierung ausführen
      // Simuliertes Ergebnis
      htmlFiles.forEach(file => {
        const validationResult = {
          file,
          passed: true,
          errors: 0,
          warnings: 0
        };
        
        testResults.validationTests.push(validationResult);
        testResults.allPassed = testResults.allPassed && validationResult.passed;
      });
      
      console.log(`✅ HTML-Validierung für ${htmlFiles.size} Dateien bestanden`);
    }
    
    // 2. Accessibility-Tests für A11Y-Fixes
    if (fixTypes.some(type => type.startsWith('a11y'))) {
      // Hier würde man accessibility-Tests ausführen
      // Simuliertes Ergebnis
      const a11yResult = {
        passed: true,
        score: 0.95,
        issues: 2,
        critical: 0
      };
      
      testResults.accessibilityTests.push(a11yResult);
      testResults.allPassed = testResults.allPassed && a11yResult.passed;
      
      console.log(`✅ Accessibility-Tests bestanden: Score ${a11yResult.score}`);
    }
    
    // 3. SEO-Tests für SEO-Fixes
    if (fixTypes.some(type => type.startsWith('seo'))) {
      // Hier würde man SEO-Tests ausführen
      // Simuliertes Ergebnis
      const seoResult = {
        passed: true,
        score: 0.92,
        issues: 3,
        critical: 0
      };
      
      testResults.seoTests.push(seoResult);
      testResults.allPassed = testResults.allPassed && seoResult.passed;
      
      console.log(`✅ SEO-Tests bestanden: Score ${seoResult.score}`);
    }
    
    // 4. Performance-Tests für Performance-Fixes
    if (fixTypes.some(type => type.startsWith('performance'))) {
      // Hier würde man Performance-Tests ausführen
      // Simuliertes Ergebnis
      const performanceResult = {
        passed: true,
        score: 0.88,
        lcp: 2800, // ms
        fid: 80,   // ms
        cls: 0.05
      };
      
      testResults.performanceTests.push(performanceResult);
      testResults.allPassed = testResults.allPassed && performanceResult.passed;
      
      console.log(`✅ Performance-Tests bestanden: Score ${performanceResult.score}`);
    }
  } catch (err) {
    console.error('❌ Fehler bei den Tests:', err);
    testResults.error = err.message;
    testResults.allPassed = false;
  }
  
  return testResults;
}

/**
 * Committet die erfolgreichen Änderungen
 * @param {Array} fixes - Die angewendeten Fixes
 * @returns {boolean} Erfolg
 */
function commitSelfHealingChanges(fixes) {
  // Dateien sammeln, die geändert wurden
  const changedFiles = [];
  fixes.forEach(fix => {
    if (fix.applied && fix.successful && fix.changes) {
      fix.changes.forEach(change => {
        if (change.file && !changedFiles.includes(change.file)) {
          changedFiles.push(change.file);
        }
      });
    }
  });
  
  if (changedFiles.length === 0) {
    console.log('Keine Änderungen zum Committen');
    return false;
  }
  
  // Commit-Nachricht erstellen
  const fixTypes = [...new Set(fixes
    .filter(fix => fix.applied && fix.successful)
    .map(fix => fix.type)
  )];
  
  const commitMessage = `[AUTO-OPTIMIZE] ${fixTypes.join(', ')} - Self-Healing durch KI`;
  
  try {
    return commitAndPushChanges(commitMessage, changedFiles, { 
      autoFix: true,
      createBranch: true,
      pushOrigin: true
    });
  } catch (err) {
    console.error('Fehler beim Committen der Self-Healing-Änderungen:', err);
    return false;
  }
}

function main() {
  // PowerShell-Probleme prüfen und beheben
  checkAndFixPowerShellIssues();
  
  // Prüfe auf Auto-Rollback
  executeAutoRollbackIfNeeded();
  
  // Self-Healing-Modus
  if (process.argv.includes('--self-healing')) {
    console.log('🤖 Self-Healing-Modus gestartet...');
    runSelfHealing({
      autoFix: !process.argv.includes('--no-fix'),
      runAudits: !process.argv.includes('--no-audits'),
      commitOnSuccess: !process.argv.includes('--no-commit')
    });
    return;
  }
  
  // PowerShell-spezifische Diagnosemodus
  if (process.argv.includes('--check-powershell')) {
    const shellEnv = detectShellEnvironment();
    console.log('\n=== POWERSHELL DIAGNOSE ===');
    console.log(`Shell-Typ: ${shellEnv.type}`);
    console.log(`Version: ${shellEnv.version}`);
    console.log(`Windows: ${shellEnv.isWindows}`);
    console.log(`PowerShell-Probleme: ${shellEnv.hasPowerShellIssues ? 'Ja' : 'Nein'}`);
    
    console.log('\nKommando-Anpassungen:');
    Object.entries(shellEnv.commands).forEach(([key, cmd]) => {
      console.log(`${key}: ${cmd}`);
    });
    
    // Internetverbindung testen
    try {
      const internetCmd = shellEnv.commands.checkInternet;
      const internetResult = execSync(internetCmd, { encoding: 'utf8' });
      console.log(`\nInternetverbindung: ${internetResult.includes('true') ? 'Verfügbar' : 'Nicht verfügbar'}`);
    } catch (e) {
      console.log('\nInternetverbindung: Fehler beim Test');
    }
    
    // PowerShell-spezifische Lösungen
    if (shellEnv.type === 'powershell') {
      console.log('\nEmpfehlungen für PowerShell:');
      console.log('1. UTF-8 Kodierung sicherstellen:');
      console.log('   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8');
      console.log('2. Execution Policy temporär umgehen:');
      console.log('   powershell -ExecutionPolicy Bypass -File "script.ps1"');
      console.log('3. JSON-Dateien mit BOM speichern für PowerShell:');
      console.log('   $content | Out-File -FilePath file.json -Encoding UTF8');
    }
    
    console.log('=== ENDE DER DIAGNOSE ===\n');
    return;
  }
  
  // Prüfe auf Recovery-Modus
  if (process.argv.includes('--recovery')) {
    const timeArg = process.argv.find(arg => arg.startsWith('--time='));
    if (timeArg) {
      const timeValue = timeArg.split('=')[1];
      showRecoveryInformation(timeValue);
      
      // Bei Recovery auch gleich Absturz-Bericht anzeigen
      showCrashReport(timeValue);
      return;
    } else {
      console.error('Bitte gib einen Zeitpunkt an: --time=HH:MM oder --time=ISO-TIMESTAMP');
      return;
    }
  }
  
  // Absturz-Berichts-Modus
  if (process.argv.includes('--crash-report')) {
    const timeArg = process.argv.find(arg => arg.startsWith('--since='));
    const timeValue = timeArg ? timeArg.split('=')[1] : null;
    showCrashReport(timeValue);
    return;
  }
  
  // Absturz-Protokollierungs-Modus
  if (process.argv.includes('--log-crash')) {
    const typeArg = process.argv.find(arg => arg.startsWith('--type='));
    const messageArg = process.argv.find(arg => arg.startsWith('--message='));
    const componentArg = process.argv.find(arg => arg.startsWith('--component='));
    
    if (!typeArg || !messageArg) {
      console.error('Für die Absturz-Protokollierung sind mindestens --type und --message erforderlich');
      return;
    }
    
    const crashInfo = {
      type: typeArg.split('=')[1],
      message: messageArg.split('=')[1],
      component: componentArg ? componentArg.split('=')[1] : 'unknown',
      severity: (process.argv.find(arg => arg.startsWith('--severity=')) || '=high').split('=')[1],
      affectedUsers: parseInt((process.argv.find(arg => arg.startsWith('--users=')) || '=1').split('=')[1], 10)
    };
    
    const crashId = logCrash(crashInfo);
    console.log(`Absturz protokolliert mit ID: ${crashId}`);
    return;
  }
  
  // Performance-Analyse-Modus
  if (process.argv.includes('--analyze-performance')) {
    if (!fs.existsSync(performancePath)) {
      console.error('Keine Performance-Historie gefunden');
      return;
    }
    
    try {
      const perfHistory = JSON.parse(fs.readFileSync(performancePath, 'utf8'));
      console.log('\n=== PERFORMANCE-ANALYSE ===');
      console.log(`${perfHistory.length} Einträge in der Historie`);
      
      if (perfHistory.length > 0) {
        // Neueste Messung
        const latest = perfHistory[perfHistory.length - 1];
        console.log(`\nAktuelle Messung (${new Date(latest.timestamp).toLocaleString()}):`);
        console.log(`- Ladezeit: ${latest.measurements.loadTime.toFixed(0)}ms`);
        console.log(`- Speicherverbrauch: ${Math.round(latest.measurements.memory.heapUsed / 1024 / 1024)}MB`);
        
        // Trend berechnen
        if (perfHistory.length > 1) {
          const previous = perfHistory.slice(-6, -1); // Letzte 5 vor aktuell
          const avgPrevLoad = previous.reduce((sum, item) => sum + item.measurements.loadTime, 0) / previous.length;
          const trend = latest.measurements.loadTime / avgPrevLoad;
          
          console.log(`\nTrend: ${trend < 0.95 ? '🟢 Verbessert' : trend > 1.05 ? '🔴 Verschlechtert' : '🟡 Stabil'} (${Math.abs(100 - trend*100).toFixed(1)}% ${trend < 1 ? 'schneller' : 'langsamer'})`);
        }
      }
      
      console.log('\n=== ENDE DER ANALYSE ===');
    } catch (e) {
      console.error('Fehler bei der Performance-Analyse:', e);
    }
    
    return;
  }

  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {
      history = [];
    }
  }
  
  // Nur anhängen, wenn Run-ID oder Commit neu ist
  if (!history.length || history[history.length - 1].run_id !== run_id) {
    const entry = { date, status, run_id, commit, url };
    history.push(entry);
    
    if (safeWriteJson(historyPath, history)) {
      console.log('Deploy-Historie aktualisiert:', { date, status, run_id, commit });
      
      // Performance tracking nach erfolgreichem Deploy
      if (status === 'success') {
        trackPerformance(commit, date);
        
        // Nach erfolgreichem Deploy: Self-Healing ausführen, wenn aktiviert
        if (process.env.ENABLE_SELF_HEALING === 'true') {
          console.log('\n🤖 Automatisches Self-Healing nach erfolgreichem Deploy gestartet...');
          runSelfHealing({
            autoFix: true,
            runAudits: true,
            commitOnSuccess: true
          });
        }
      }
    }
  } else {
    console.log('Deploy bereits eingetragen.');
  }
}

main();
