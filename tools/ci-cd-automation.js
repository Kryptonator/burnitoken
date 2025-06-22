/**
 * CI/CD AUTOMATION - Automatisierte Tests und Deployment-Checks
 * 
 * Dieses Skript führt CI/CD-Prozesse durch:
 * 1. Test-Ausführung (alle Tests für Extensions, Services, GSC)
 * 2. Überprüfung der Build-Integrität
 * 3. Deployment-Check und Monitoring
 * 4. Benachrichtigung bei Fehlschlägen
 * 5. Automatischer Rollback bei Problemen
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { runFullDashboard } = require('./comprehensive-monitor-dashboard');
const { autoCommitAndPush } = require('./auto-commit-push');

// Konfiguration
const CONFIG = {
  testTimeout: 120000, // 2 Minuten Timeout für Tests
  deploymentChecks: {
    retries: 3,
    interval: 30000, // 30 Sekunden zwischen Versuchen
  },
  notifyOnFailure: true,
};

// Farben für die Konsolenausgabe
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

/**
 * Führt alle Tests aus und gibt den Status zurück
 * @returns {boolean} Ob alle Tests erfolgreich waren
 */
function runAllTests() {
  console.log(`${COLORS.bright}${COLORS.blue}=== 🧪 CI/CD: ALLE TESTS AUSFÜHREN ====${COLORS.reset}`);
  
  try {
    // Extension Tests
    console.log(`${COLORS.magenta}\n=== EXTENSION TESTS ====${COLORS.reset}`);
    execSync('node tests/extension-service-test-framework.js', { stdio: 'inherit', timeout: CONFIG.testTimeout });
    
    // Jest Tests (für alle Service-Tests)
    console.log(`${COLORS.magenta}\n=== SERVICE TESTS (JEST) ====${COLORS.reset}`);
    execSync('npm run test:unit', { stdio: 'inherit', timeout: CONFIG.testTimeout });
    
    // End-to-End Tests
    console.log(`${COLORS.magenta}\n=== E2E TESTS ====${COLORS.reset}`);
    execSync('npm run test:e2e', { stdio: 'inherit', timeout: CONFIG.testTimeout });
    
    // GSC Integration Tests
    console.log(`${COLORS.magenta}\n=== GSC INTEGRATION TESTS ====${COLORS.reset}`);
    execSync('node tools/gsc-quick-test.js', { stdio: 'inherit', timeout: CONFIG.testTimeout });
    
    console.log(`${COLORS.green}✅ Alle Tests erfolgreich durchgeführt!${COLORS.reset}`);
    return true;
  } catch (error) {
    console.log(`${COLORS.red}❌ Fehler bei Tests: ${error.message}${COLORS.reset}`);
    return false;
  }
}

/**
 * Überprüft, ob die Deployment-Integrität gegeben ist
 * @returns {boolean} Ob das Deployment fehlerfrei ist
 */
async function checkDeploymentIntegrity() {
  console.log(`${COLORS.bright}${COLORS.blue}=== 🚀 CI/CD: DEPLOYMENT-CHECK ====${COLORS.reset}`);
  
  for (let attempt = 1; attempt <= CONFIG.deploymentChecks.retries; attempt++) {
    console.log(`${COLORS.yellow}🔍 Überprüfe Deployment (Versuch ${attempt}/${CONFIG.deploymentChecks.retries})...${COLORS.reset}`);
    
    try {
      // Website-Erreichbarkeit prüfen
      console.log(`${COLORS.cyan}📡 Prüfe Website-Erreichbarkeit...${COLORS.reset}`);
      execSync('curl -s -o /dev/null -w "%{http_code}" https://burnitoken.website', { stdio: 'pipe' });
      
      // GSC-Integration prüfen
      console.log(`${COLORS.cyan}🔍 Prüfe GSC-Integration...${COLORS.reset}`);
      execSync('node tools/gsc-integration-monitor.js --quick-check', { stdio: 'inherit' });
      
      // Sitemap prüfen
      console.log(`${COLORS.cyan}🗺️ Prüfe Sitemap...${COLORS.reset}`);
      execSync('node tools/fix-sitemap-gsc-issue.js --check', { stdio: 'inherit' });
      
      console.log(`${COLORS.green}✅ Deployment-Check erfolgreich!${COLORS.reset}`);
      return true;
    } catch (error) {
      console.log(`${COLORS.red}❌ Deployment-Check fehlgeschlagen: ${error.message}${COLORS.reset}`);
      
      if (attempt < CONFIG.deploymentChecks.retries) {
        console.log(`${COLORS.yellow}⏳ Warte ${CONFIG.deploymentChecks.interval / 1000} Sekunden vor erneutem Versuch...${COLORS.reset}`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.deploymentChecks.interval));
      } else {
        return false;
      }
    }
  }
  
  return false;
}

/**
 * Führt einen Rollback durch, wenn ein Deployment fehlschlägt
 */
function performRollback() {
  console.log(`${COLORS.bright}${COLORS.red}=== ⚠️ CI/CD: ROLLBACK DURCHFÜHREN ====${COLORS.reset}`);
  
  try {
    // Letzten erfolgreichen Commit ermitteln
    const lastGoodCommit = execSync('git log -n 10 --grep="CI/CD Check: PASSED" --pretty=format:"%H"')
      .toString()
      .trim()
      .split('\n')[0];
    
    if (!lastGoodCommit) {
      throw new Error('Konnte keinen letzten erfolgreichen Commit finden');
    }
    
    console.log(`${COLORS.yellow}🔙 Rollback zum letzten erfolgreichen Commit: ${lastGoodCommit}${COLORS.reset}`);
    
    // Rollback auf den letzten guten Commit
    execSync(`git checkout ${lastGoodCommit}`, { stdio: 'inherit' });
    execSync('git checkout -b rollback-branch', { stdio: 'inherit' });
    execSync('git push origin rollback-branch -f', { stdio: 'inherit' });
    
    console.log(`${COLORS.green}✅ Rollback erfolgreich durchgeführt. Branch "rollback-branch" erstellt.${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}❌ Rollback fehlgeschlagen: ${error.message}${COLORS.reset}`);
    return false;
  }
}

/**
 * Benachrichtigt über einen Fehler im CI/CD-Prozess
 * @param {string} stage - Die Stage, in der der Fehler aufgetreten ist
 * @param {string} error - Der Fehler 
 */
function notifyFailure(stage, error) {
  console.log(`${COLORS.bright}${COLORS.red}=== ⚠️ CI/CD FEHLER IN ${stage} ====${COLORS.reset}`);
  console.log(`${COLORS.red}${error}${COLORS.reset}`);
  
  // Schreibe Fehler in Logdatei
  const logFile = path.join(process.cwd(), 'CICD_FAILURE.log');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] FEHLER IN ${stage}: ${error}\n`;
  
  fs.appendFileSync(logFile, logEntry);
  
  // Hier könnte noch eine externe Benachrichtigung implementiert werden
  // z.B. Email, Slack, Teams, etc.
}

/**
 * Hauptfunktion: Führt den CI/CD-Prozess aus
 */
async function runCiCdProcess() {
  console.log(`${COLORS.bright}${COLORS.blue}=== 🚀🔄 CI/CD PROZESS GESTARTET ====${COLORS.reset}`);
  console.log(`${COLORS.blue}Gestartet: ${new Date().toLocaleString('de-DE')}${COLORS.reset}\n`);
  
  let success = true;
  let stage = '';
  
  try {
    // 1. Tests ausführen
    stage = 'TESTS';
    const testsSuccessful = runAllTests();
    if (!testsSuccessful) {
      throw new Error('Tests fehlgeschlagen');
    }
    
    // 2. Dashboard ausführen (prüft und repariert Extensions, Services, GSC)
    stage = 'MONITOR-DASHBOARD';
    runFullDashboard();
    
    // 3. Deployment-Integrität prüfen
    stage = 'DEPLOYMENT';
    const deploymentOk = await checkDeploymentIntegrity();
    if (!deploymentOk) {
      throw new Error('Deployment-Check fehlgeschlagen');
    }
    
    // Alles erfolgreich
    console.log(`${COLORS.bright}${COLORS.green}=== ✅ CI/CD PROZESS ERFOLGREICH ABGESCHLOSSEN ====${COLORS.reset}`);
    
    // Commit mit dem Erfolg
    autoCommitAndPush('CI/CD Check: PASSED - Alle Tests und Checks erfolgreich');
    
    // Status aktualisieren
    updateCiCdStatus(true);
    
  } catch (error) {
    success = false;
    console.log(`${COLORS.red}❌ CI/CD Fehler in ${stage}: ${error.message}${COLORS.reset}`);
    
    // Bei Benachrichtigungen
    if (CONFIG.notifyOnFailure) {
      notifyFailure(stage, error.message);
    }
    
    // Bei Deployment-Fehlern Rollback durchführen
    if (stage === 'DEPLOYMENT') {
      performRollback();
    }
    
    // Status aktualisieren
    updateCiCdStatus(false, stage, error.message);
  }
  
  return success;
}

/**
 * Aktualisiert die CI/CD-Statusdatei
 * @param {boolean} success - Ob der CI/CD-Prozess erfolgreich war 
 * @param {string} failedStage - Optional: die Stage, die fehlgeschlagen ist
 * @param {string} errorMessage - Optional: die Fehlermeldung
 */
function updateCiCdStatus(success, failedStage = null, errorMessage = null) {
  const statusFile = path.join(process.cwd(), 'CICD_STATUS.json');
  const status = {
    timestamp: new Date().toISOString(),
    success,
    lastRun: new Date().toLocaleString('de-DE'),
  };
  
  if (!success && failedStage) {
    status.failedStage = failedStage;
    status.errorMessage = errorMessage;
  }
  
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
  console.log(`${COLORS.cyan}📄 CI/CD-Status in CICD_STATUS.json gespeichert${COLORS.reset}`);
}

// Hauptfunktion ausführen, wenn direkt aufgerufen
if (require.main === module) {
  runCiCdProcess().then(success => {
    if (!success) {
      process.exit(1);
    }
  });
}

module.exports = { runCiCdProcess, runAllTests, checkDeploymentIntegrity, performRollback };
