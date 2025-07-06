#!/usr/bin/env node

/**
 * 🛡️ ANTI-CRASH-GUARDIAN v2.0
 *
 * MISSION: Ein für alle Mal Abstürze eliminieren!
 * BASED ON: Goldene Basis vom 29.06.2025 23:00-02:00 Uhr
 *
 * Automatische Crash-Prevention mit:
 * - VS Code Prozess-Hygiene
 * - RAM-Überwachung
 * - Emergency-Saves
 * - Golden-State-Recovery
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { sendAlert } = require('./alert-service');
const { createTodo } = require('./todo-manager');

// 🎯 KONFIGURATION
const CONFIG = {
  MAX_VSCODE_PROCESSES: 3,
  MAX_RAM_USAGE_PERCENT: 75,
  CHECK_INTERVAL: 15000, // 15 Sekunden
  EMERGENCY_SAVE_DIR: path.join(__dirname, '.emergency-saves'),
  GOLDEN_COMMIT: '63e227f', // Perfekte Basis
  LOG_FILE: path.join(__dirname, 'anti-crash-guardian.log'),
};

class AntiCrashGuardian {
  constructor() {
    this.isActive = false;
    this.crashCount = 0;
    this.lastCheck = new Date();
    this.log('🛡️ Anti-Crash-Guardian v2.0 initialisiert');
    sendAlert('Guardian Initialisiert', 'Anti-Crash-Guardian v2.0 wurde gestartet.', 'info');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);

    // Sende Alarme für kritische Logs
    if (level === 'critical' || level === 'error') {
      sendAlert(`Guardian: ${level.toUpperCase()}`, message, level);
    }

    try {
      fs.appendFileSync(CONFIG.LOG_FILE, logEntry + '\n');
    } catch (err) {
      console.error('Log-Fehler:', err.message);
    }
  }

  // 🚨 KRITISCH: VS Code Prozess-Bereinigung
  async cleanupVSCodeProcesses() { // Make function async
    try {
      const processes = execSync('tasklist | findstr "Code.exe"', { encoding: 'utf8' });
      const processLines = processes.split('\n').filter((line) => line.includes('Code.exe'));

      if (processLines.length > CONFIG.MAX_VSCODE_PROCESSES) {
        const criticalMessage = `KRITISCH: ${processLines.length} VS Code Prozesse gefunden (Max: ${CONFIG.MAX_VSCODE_PROCESSES})`;
        this.log(criticalMessage, 'critical');
        
        // Create a GitHub issue in addition to the local todo
        await createTodo( // await the async function
          'VS Code Prozess-Hygiene prüfen',
          `Es wurden ${processLines.length} laufende VS Code-Prozesse erkannt. Dies kann die Systemstabilität gefährden. Manuelle Überprüfung empfohlen.`,
          'System Health',
          true // Explicitly request issue creation
        );

        // Emergency Save BEVOR wir Prozesse beenden
        this.emergencySave();

        // Sortiere Prozesse nach Speicherverbrauch (kleinste zuerst beenden)
        const processInfo = processLines
          .map((line) => {
            const parts = line.trim().split(/\s+/);
            return {
              pid: parts[1],
              memory: parseInt(parts[4].replace(/[^\d]/g, '')) || 0,
            };
          })
          .sort((a, b) => a.memory - b.memory);

        // Beende überschüssige Prozesse (außer den 3 größten)
        const toKill = processInfo.slice(0, -CONFIG.MAX_VSCODE_PROCESSES);

        for (const proc of toKill) {
          try {
            execSync(`taskkill /F /PID ${proc.pid}`, { encoding: 'utf8' });
            this.log(`✅ Prozess ${proc.pid} beendet (${proc.memory}K RAM)`);
          } catch (err) {
            this.log(`❌ Fehler beim Beenden von PID ${proc.pid}: ${err.message}`, 'error');
          }
        }

        return true; // Bereinigung durchgeführt
      }

      return false; // Keine Bereinigung nötig
    } catch (err) {
      this.log(`❌ Fehler bei Prozess-Bereinigung: ${err.message}`, 'error');
      return false;
    }
  }

  // 💾 Emergency Save (wie gehabt, aber optimiert)
  emergencySave() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const saveDir = path.join(CONFIG.EMERGENCY_SAVE_DIR, `emergency-${timestamp}`);

      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }

      // Sichere kritische Dateien
      const criticalFiles = [
        'index.html',
        'main.js',
        'package.json',
        'assets/css/styles.min.css',
        'tools/vscode-recovery-center.js',
      ];

      for (const file of criticalFiles) {
        const srcPath = path.join(__dirname, '..', file);
        const destPath = path.join(saveDir, path.basename(file));

        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      }

      const message = `Emergency Save in: ${saveDir}`;
      this.log(`💾 ${message}`);
      sendAlert('Emergency Save Ausgelöst', message, 'warn');
      createTodo('Emergency Save überprüfen', `Ein Emergency Save wurde im Verzeichnis ${saveDir} erstellt. Bitte den Zustand der gesicherten Dateien prüfen.`, 'Recovery');
      return saveDir;
    } catch (err) {
      this.log(`❌ Emergency Save Fehler: ${err.message}`, 'error');
      return null;
    }
  }

  // 🏆 Golden State Recovery
  recoverToGoldenState() {
    const message = 'GOLDEN STATE RECOVERY wird eingeleitet...';
    this.log(`🏆 ${message}`, 'critical');
    createTodo('Golden State Recovery durchführen', 'Das System wird auf den letzten stabilen Zustand zurückgesetzt. Manuelle Überprüfung nach Abschluss erforderlich.', 'Recovery');

    try {
      // Sichere aktuelle Arbeit
      this.emergencySave();

      // Reset zu goldener Basis
      execSync(`git stash`);
      execSync(`git reset --hard ${CONFIG.GOLDEN_COMMIT}`);
      execSync(`npm install --silent`);

      this.log('✅ Golden State wiederhergestellt!');
      sendAlert('Golden State Recovery Erfolgreich', `Das System wurde erfolgreich auf den Commit ${CONFIG.GOLDEN_COMMIT} zurückgesetzt.`, 'success');
      return true;
    } catch (err) {
      this.log(`❌ Golden Recovery Fehler: ${err.message}`, 'error');
      createTodo('Fehler bei Golden State Recovery beheben', `Fehler: ${err.message}`, 'Recovery');
      return false;
    }
  }

  // 📊 System Health Check
  checkSystemHealth() {
    try {
      // RAM-Check
      const memInfo = execSync(
        'wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:csv',
        { encoding: 'utf8' },
      );
      const lines = memInfo.split('\n').filter((line) => line.includes(','));

      if (lines.length > 0) {
        const parts = lines[0].split(',');
        const totalMem = parseInt(parts[2]) || 0;
        const freeMem = parseInt(parts[1]) || 0;
        const usedPercent = ((totalMem - freeMem) / totalMem) * 100;

        if (usedPercent > CONFIG.MAX_RAM_USAGE_PERCENT) {
          const criticalMessage = `RAM KRITISCH: ${usedPercent.toFixed(1)}% verwendet`;
          this.log(`🚨 ${criticalMessage}`, 'critical');
          createTodo('Kritischen RAM-Verbrauch prüfen', `Die RAM-Auslastung hat ${usedPercent.toFixed(1)}% erreicht. Systemleistung ist gefährdet.`, 'System Health');
          return 'RAM_CRITICAL';
        }
      }

      // Prozess-Check
      if (this.cleanupVSCodeProcesses()) {
        return 'PROCESSES_CLEANED';
      }

      return 'HEALTHY';
    } catch (err) {
      this.log(`❌ Health Check Fehler: ${err.message}`);
      return 'ERROR';
    }
  }

  // 🚀 Hauptüberwachungsschleife
  start() {
    this.isActive = true;
    this.log('🚀 Anti-Crash-Guardian AKTIVIERT');

    const runCheck = () => {
      if (!this.isActive) return;

      const health = this.checkSystemHealth();
      this.lastCheck = new Date();

      switch (health) {
        case 'RAM_CRITICAL':
          this.log('🆘 RAM KRITISCH - Emergency Save & Cleanup');
          sendAlert('RAM Kritisch', 'Hohe RAM-Auslastung erkannt. Notfallmaßnahmen werden eingeleitet.', 'warn');
          this.emergencySave();
          this.cleanupVSCodeProcesses();
          break;

        case 'PROCESSES_CLEANED':
          this.log('🧹 VS Code Prozesse bereinigt');
          sendAlert('Prozesse Bereinigt', 'Überflüssige VS Code-Prozesse wurden beendet.', 'info');
          break;

        case 'HEALTHY':
          // Stille Überwachung
          break;

        case 'ERROR':
          this.crashCount++;
          if (this.crashCount >= 3) {
            this.log('🆘 MULTIPLE ERRORS - Golden State Recovery', 'critical');
            this.recoverToGoldenState();
            this.crashCount = 0;
          }
          break;
      }

      // Nächster Check
      setTimeout(runCheck, CONFIG.CHECK_INTERVAL);
    };

    // Starte erste Prüfung
    runCheck();
  }

  stop() {
    this.isActive = false;
    this.log('⏹️ Anti-Crash-Guardian DEAKTIVIERT');
    sendAlert('Guardian Deaktiviert', 'Anti-Crash-Guardian wurde beendet.', 'info');
  }
}

// 🚀 AUTOSTART
if (require.main === module) {
  const guardian = new AntiCrashGuardian();

  // Graceful Shutdown
  process.on('SIGINT', () => {
    guardian.log('🛑 Shutdown Signal empfangen');
    guardian.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    guardian.log('🛑 Terminate Signal empfangen');
    guardian.stop();
    process.exit(0);
  });

  // Start Guardian
  guardian.start();
}

module.exports = AntiCrashGuardian;
