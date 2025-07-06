#!/usr/bin/env node

/**
 * Deploy History Manager - Bereinigt nach Recovery
 *
 * Zentrale Verwaltung für Deploy-Historie, Self-Healing und Recovery
 * Nach VS Code Absturz repariert und optimiert
 *
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Projektwurzel bestimmen
const rootDir = path.resolve(__dirname, '..', '..');
const publicDir = path.join(rootDir, 'public');

// Sicherstellen, dass das public-Verzeichnis existiert
if (!fs.existsSync(publicDir)) {
  try {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`📁 Public-Verzeichnis erstellt: ${publicDir}`);
  } catch (err) {
    console.error(`❌ Fehler beim Erstellen von ${publicDir}:`, err);
  }
}

console.log(`📁 Arbeite mit Projektwurzel: ${rootDir}`);
console.log(`📁 Public-Verzeichnis: ${publicDir}`);

// Dateipfade
const historyPath = path.join(publicDir, 'deploy-history.json');
const performancePath = path.join(publicDir, 'performance-history.json');
const recoveryFlagPath = path.join(publicDir, '.recovery-needed');
const crashLogsPath = path.join(publicDir, 'crash-logs.json');
const selfHealingPath = path.join(publicDir, 'self-healing-history.json');

// Deploy-Parameter aus Umgebungsvariablen
const date = process.env.DEPLOY_DATE || new Date().toISOString();
const status = process.env.DEPLOY_STATUS || 'success';
const run_id = process.env.GITHUB_RUN_ID || '';
const commit = process.env.GITHUB_SHA || '';
const repo = process.env.GITHUB_REPOSITORY || '';
const url = `https://github.com/${repo}/actions/runs/${run_id}`;

/**
 * Sicheres Schreiben in eine JSON-Datei
 */
function safeWriteJson(filePath, data) {
  try {
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.bak`;
      fs.copyFileSync(filePath, backupPath);
    }

    const jsonStr = JSON.stringify(data, null, 2);
    JSON.parse(jsonStr); // Validierung

    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, jsonStr);
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`❌ Fehler beim Schreiben der Datei ${filePath}:`, err);
    return false;
  }
}

/**
 * Zeigt Recovery-Informationen an
 */
function showRecoveryInformation(timeString) {
  if (!fs.existsSync(historyPath)) {
    console.error('❌ Keine Deploy-Historie gefunden');
    return;
  }

  try {
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

    let targetDate;
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      const today = new Date();
      const [hours, minutes] = timeString.split(':').map(Number);
      targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    } else {
      targetDate = new Date(timeString);
    }

    if (isNaN(targetDate.getTime())) {
      console.error('❌ Ungültiges Zeitformat. Verwende HH:MM oder ISO-Zeitstempel');
      return;
    }

    const stableDeploysBefore = history
      .filter((entry) => entry.status === 'success' && new Date(entry.date) < targetDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const lastStableDeploy = stableDeploysBefore[0];

    if (!lastStableDeploy) {
      console.error('❌ Keinen stabilen Deploy vor diesem Zeitpunkt gefunden.');
      return;
    }

    const deployDate = new Date(lastStableDeploy.date);

    console.log('\n🔄 === RECOVERY INFORMATION ===');
    console.log(`📅 Letzter stabiler Deploy vor ${timeString}:`);
    console.log(`   Datum: ${deployDate.toLocaleString()}`);
    console.log(`   Commit: ${lastStableDeploy.commit.substring(0, 7)}`);
    console.log(`   Workflow: ${lastStableDeploy.url || 'Nicht verfügbar'}`);

    console.log('\n🛠️ Zum Wiederherstellen:');
    console.log(`git checkout ${lastStableDeploy.commit}`);
    console.log('npm install');
    console.log('npm run build');

    console.log('\n🤖 Für automatisches Rollback:');
    console.log(
      `node .github/update-deploy-history-clean.js --recovery --time="${deployDate.toISOString()}"`,
    );
    console.log('=== RECOVERY COMPLETE ===\n');
  } catch (err) {
    console.error('❌ Fehler beim Lesen der Deploy-Historie:', err);
  }
}

/**
 * Loggt einen Deploy-Eintrag
 */
function logDeploy() {
  try {
    let history = [];
    if (fs.existsSync(historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      } catch (e) {
        console.warn('⚠️ Deploy-Historie konnte nicht geladen werden, erstelle neu');
      }
    }

    const entry = {
      date,
      status,
      run_id,
      commit,
      url,
      recovery: false,
    };

    history.push(entry);

    // Auf letzte 100 Einträge beschränken
    if (history.length > 100) {
      history = history.slice(-100);
    }

    const success = safeWriteJson(historyPath, history);

    if (success) {
      console.log(`✅ Deploy-Eintrag hinzugefügt: ${status} (${commit.substring(0, 7)})`);
    } else {
      console.error('❌ Fehler beim Speichern der Deploy-Historie');
    }
  } catch (err) {
    console.error('❌ Fehler beim Protokollieren des Deploys:', err);
  }
}

/**
 * Führt Self-Healing aus
 */
function runSelfHealing() {
  console.log('\n🔄 Starte Self-Healing-Prozess...');

  try {
    let healingHistory = [];
    if (fs.existsSync(selfHealingPath)) {
      try {
        healingHistory = JSON.parse(fs.readFileSync(selfHealingPath, 'utf8'));
      } catch (e) {
        console.warn('⚠️ Self-Healing-Historie konnte nicht geladen werden, erstelle neu');
      }
    }

    const healingSession = {
      id: `healing-${Date.now()}`,
      timestamp: new Date().toISOString(),
      commit: commit,
      issues: [],
      fixes: [],
      success: true,
    };

    // Basis-Checks durchführen
    console.log('🔍 Führe Basis-Gesundheitschecks durch...');

    // 1. Prüfe ob wichtige Dateien existieren
    const criticalFiles = ['index.html', 'package.json', 'assets/scripts.js', 'sitemap.xml'];

    let issues = [];
    for (const file of criticalFiles) {
      const filePath = path.join(rootDir, file);
      if (!fs.existsSync(filePath)) {
        issues.push({
          type: 'missing-file',
          file: file,
          severity: 'high',
        });
      }
    }

    healingSession.issues = issues;

    if (issues.length === 0) {
      console.log('✅ Alle kritischen Dateien vorhanden');
    } else {
      console.log(`⚠️ ${issues.length} Probleme gefunden`);
      issues.forEach((issue) => {
        console.log(`   - ${issue.file} fehlt (${issue.severity})`);
      });
    }

    // Healing-Session speichern
    healingHistory.push(healingSession);
    if (healingHistory.length > 50) {
      healingHistory = healingHistory.slice(-50);
    }

    safeWriteJson(selfHealingPath, healingHistory);
    console.log('📊 Self-Healing-Sitzung abgeschlossen');
  } catch (err) {
    console.error('❌ Fehler im Self-Healing-Prozess:', err);
  }
}

/**
 * Zeigt Status-Übersicht an
 */
function showStatus() {
  console.log('\n📊 === SYSTEM STATUS ===');

  // Deploy-Historie
  if (fs.existsSync(historyPath)) {
    try {
      const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      const recent = history.slice(-5);
      console.log(`📈 Deploy-Historie: ${history.length} Einträge`);
      console.log('   Letzte 5 Deploys:');
      recent.forEach((entry) => {
        const date = new Date(entry.date).toLocaleString();
        const statusEmoji = entry.status === 'success' ? '✅' : '❌';
        console.log(`   ${statusEmoji} ${date} - ${entry.commit.substring(0, 7)}`);
      });
    } catch (e) {
      console.log('❌ Deploy-Historie konnte nicht gelesen werden');
    }
  } else {
    console.log('📈 Deploy-Historie: Noch keine Einträge');
  }

  // Self-Healing
  if (fs.existsSync(selfHealingPath)) {
    try {
      const healing = JSON.parse(fs.readFileSync(selfHealingPath, 'utf8'));
      console.log(`🔄 Self-Healing: ${healing.length} Sitzungen`);
      if (healing.length > 0) {
        const last = healing[healing.length - 1];
        console.log(`   Letzte Sitzung: ${new Date(last.timestamp).toLocaleString()}`);
        console.log(`   Gefundene Probleme: ${last.issues.length}`);
      }
    } catch (e) {
      console.log('❌ Self-Healing-Historie konnte nicht gelesen werden');
    }
  } else {
    console.log('🔄 Self-Healing: Noch keine Sitzungen');
  }

  // Recovery-Flag prüfen
  if (fs.existsSync(recoveryFlagPath)) {
    try {
      const recovery = JSON.parse(fs.readFileSync(recoveryFlagPath, 'utf8'));
      console.log(`🚨 Recovery-Flag aktiv: ${recovery.reason}`);
      console.log(`   Zeitpunkt: ${new Date(recovery.timestamp).toLocaleString()}`);
    } catch (e) {
      console.log('⚠️ Recovery-Flag vorhanden, aber nicht lesbar');
    }
  } else {
    console.log('✅ Kein Recovery-Flag aktiv');
  }

  console.log('=== STATUS ENDE ===\n');
}

/**
 * Hauptfunktion
 */
function main() {
  const args = process.argv.slice(2);

  // Hilfe anzeigen
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🔄 Deploy History Manager (Bereinigt)');
    console.log('\nVerfügbare Optionen:');
    console.log('  --log              Deploy-Eintrag hinzufügen');
    console.log('  --status           System-Status anzeigen');
    console.log('  --recovery --time=<zeit>  Recovery-Info für Zeitpunkt anzeigen');
    console.log('  --self-healing     Self-Healing-Prozess starten');
    console.log('  --help, -h         Diese Hilfe anzeigen');
    console.log('\nBeispiele:');
    console.log('  node update-deploy-history-clean.js --log');
    console.log('  node update-deploy-history-clean.js --recovery --time="14:30"');
    console.log('  node update-deploy-history-clean.js --status');
    return;
  }

  // Recovery-Information
  if (args.includes('--recovery')) {
    const timeIndex = args.findIndex((arg) => arg.startsWith('--time='));
    if (timeIndex !== -1) {
      const timeValue = args[timeIndex].split('=')[1];
      showRecoveryInformation(timeValue);
    } else {
      console.error('❌ --recovery benötigt --time=<zeitpunkt> Parameter');
    }
    return;
  }

  // Status anzeigen
  if (args.includes('--status')) {
    showStatus();
    return;
  }

  // Self-Healing
  if (args.includes('--self-healing')) {
    runSelfHealing();
    return;
  }

  // Deploy loggen (Standard)
  if (args.includes('--log') || args.length === 0) {
    logDeploy();
    return;
  }

  console.log('❌ Unbekannte Option. Verwende --help für Hilfe.');
}

// Programm ausführen, falls direkt aufgerufen
if (require.main === module) {
  main();
}

module.exports = {
  logDeploy,
  showRecoveryInformation,
  runSelfHealing,
  showStatus,
  safeWriteJson,
};
