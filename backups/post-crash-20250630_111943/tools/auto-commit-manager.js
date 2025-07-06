#!/usr/bin/env node

/**
 * Auto-Commit & Push Manager
 * 
 * Verhindert Verlust von Arbeit durch automatisches Committen und Pushen
 * kritischer Änderungen in definierten Intervallen.
 * 
 * Problem: Lösung für "window not respond" war fertig aber nicht committed
 * Lösung: Intelligentes Auto-Commit mit Conflict-Detection
 * 
 * Erstellt: 2025-06-30 (Post-Crash Recovery)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  AUTO_COMMIT_INTERVAL: 300000, // 5 Minuten
  CRITICAL_FILES: [
    'tools/',
    'index.html',
    'main.js',
    '.github/workflows/',
    'package.json'
  ],
  COMMIT_LOG_FILE: path.join(__dirname, '.auto-commit.log'),
  LAST_COMMIT_FILE: path.join(__dirname, '.last-auto-commit.json'),
  MAX_UNCOMMITTED_TIME: 900000, // 15 Minuten
  BRANCH_NAME: 'main'
};

class AutoCommitManager {
  constructor() {
    this.isRunning = false;
    this.lastCommitTime = null;
    this.criticalChangesDetected = false;
  }

  /**
   * Startet den Auto-Commit Manager
   */
  async start() {
    this.log('🚀 Auto-Commit Manager startet...');
    this.isRunning = true;
    
    // Lade letzten Commit-Zeitpunkt
    this.loadLastCommitTime();
    
    // Prüfe sofort auf nicht committete Änderungen
    await this.checkForUncommittedWork();
    
    // Starte Monitoring-Loop
    this.startMonitoring();
    
    // Registriere Exit-Handler
    this.registerExitHandlers();
    
    this.log('✅ Auto-Commit Manager aktiv');
  }

  /**
   * Lädt den letzten Commit-Zeitpunkt
   */
  loadLastCommitTime() {
    if (fs.existsSync) {
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
      try {
        const data = JSON.parse(fs.readFileSync(CONFIG.LAST_COMMIT_FILE, 'utf8'));
        this.lastCommitTime = new Date(data.timestamp);
        this.log(`📅 Letzter Auto-Commit: ${this.lastCommitTime.toLocaleString('de-DE')}`);
      } catch (error) {
        this.log(`⚠️ Fehler beim Laden des letzten Commit-Zeitpunkts: ${error.message}`);
      }
    }
  }

  /**
   * Prüft auf nicht committete Arbeit beim Start
   */
  async checkForUncommittedWork() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      
      if (status.trim()) {
        this.log('⚠️ Nicht committete Änderungen beim Start erkannt');
        this.log('📋 Geänderte Dateien:');
        status.trim().split('\n').forEach(line => {
          this.log(`  ${line}`);
        });
        
        // Prüfe, ob kritische Dateien betroffen sind
        const hasCriticalChanges = this.hasCriticalChanges(status);
        
        if (hasCriticalChanges) {
          this.log('🚨 Kritische Änderungen erkannt - Auto-Commit wird ausgeführt');
          await this.performAutoCommit('Post-crash recovery auto-commit');
        }
      } else {
        this.log('✅ Keine ungespeicherten Änderungen gefunden');
      }
    } catch (error) {
      this.log(`❌ Fehler beim Prüfen des Git-Status: ${error.message}`);
    }
  }

  /**
   * Prüft, ob kritische Dateien geändert wurden
   */
  hasCriticalChanges(gitStatus) {
    return CONFIG.CRITICAL_FILES.some(criticalPath => 
      gitStatus.includes(criticalPath)
    );
  }

  /**
   * Startet das kontinuierliche Monitoring
   */
  startMonitoring() {
    const monitor = async () => {
      if (!this.isRunning) return;
      
      try {
        await this.checkAndCommitIfNeeded();
      } catch (error) {
        this.log(`❌ Monitoring-Fehler: ${error.message}`);
      }
      
      // Schedule nächsten Check
      setTimeout(monitor, CONFIG.AUTO_COMMIT_INTERVAL);
    };
    
    monitor();
  }

  /**
   * Prüft und committet bei Bedarf
   */
  async checkAndCommitIfNeeded() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      
      if (!status.trim()) {
        return; // Keine Änderungen
      }
      
      const hasCriticalChanges = this.hasCriticalChanges(status);
      const timeSinceLastCommit = this.lastCommitTime ? 
        Date.now() - this.lastCommitTime.getTime() : 
        CONFIG.MAX_UNCOMMITTED_TIME + 1;
      
      // Commit wenn:
      // 1. Kritische Änderungen vorhanden sind, ODER
      // 2. Maximale Zeit ohne Commit überschritten ist
      if (hasCriticalChanges || timeSinceLastCommit > CONFIG.MAX_UNCOMMITTED_TIME) {
        const reason = hasCriticalChanges ? 
          'Critical changes detected' : 
          'Max uncommitted time exceeded';
        
        this.log(`🔄 Auto-Commit ausgelöst: ${reason}`);
        await this.performAutoCommit(`Auto-commit: ${reason}`);
      }
    } catch (error) {
      this.log(`❌ Fehler beim Check: ${error.message}`);
    }
  }

  /**
   * Führt einen automatischen Commit und Push durch
   */
  async performAutoCommit(message) {
    try {
      this.log('📝 Führe Auto-Commit durch...');
      
      // Füge alle Änderungen hinzu
      execSync('git add .', { stdio: 'inherit' });
      
      // Erstelle Commit mit Zeitstempel
      const timestamp = new Date().toISOString();
      const fullMessage = `${message}\n\nAuto-committed at: ${timestamp}`;
      
      execSync(`git commit -m "${fullMessage}"`, { stdio: 'inherit' });
      
      // Versuche Push (mit Fehlerbehandlung für Konflikte)
      try {
        execSync(`git push origin ${CONFIG.BRANCH_NAME}`, { stdio: 'inherit' });
        this.log('✅ Auto-Commit und Push erfolgreich');
      } catch (pushError) {
        this.log('⚠️ Push fehlgeschlagen - möglicherweise Konflikte');
        this.log('🔄 Versuche Pull mit Rebase...');
        
        try {
          execSync(`git pull --rebase origin ${CONFIG.BRANCH_NAME}`, { stdio: 'inherit' });
          execSync(`git push origin ${CONFIG.BRANCH_NAME}`, { stdio: 'inherit' });
          this.log('✅ Konflikte gelöst und gepusht');
        } catch (rebaseError) {
          this.log('❌ Konfliktlösung fehlgeschlagen - manueller Eingriff erforderlich');
          this.log(`Fehler: ${rebaseError.message}`);
        }
      }
      
      // Speichere Commit-Zeit
      this.saveLastCommitTime();
      
    } catch (error) {
      this.log(`❌ Auto-Commit fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Speichert den letzten Commit-Zeitpunkt
   */
  saveLastCommitTime() {
    this.lastCommitTime = new Date();
    const data = {
      timestamp: this.lastCommitTime.toISOString(),
      type: 'auto-commit'
    };
    
    fs.writeFileSync(CONFIG.LAST_COMMIT_FILE, JSON.stringify(data, null, 2));
  }

  /**
   * Registriert Exit-Handler für Emergency-Commit
   */
  registerExitHandlers() {
    const emergencyCommit = async () => {
      if (!this.isRunning) return;
      
      this.log('🚨 Emergency Exit erkannt - prüfe auf nicht gespeicherte Arbeit...');
      this.isRunning = false;
      
      try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        
        if (status.trim() && this.hasCriticalChanges(status)) {
          this.log('🆘 Kritische Änderungen erkannt - Emergency Commit...');
          await this.performAutoCommit('Emergency commit before exit');
        }
      } catch (error) {
        this.log(`❌ Emergency Commit fehlgeschlagen: ${error.message}`);
      }
    };
    
    process.on('SIGINT', emergencyCommit);
    process.on('SIGTERM', emergencyCommit);
    process.on('beforeExit', emergencyCommit);
    
    // Windows-spezifische Handler
    if (process.platform === 'win32') {
      process.on('SIGHUP', emergencyCommit);
    }
  }

  /**
   * Logging-Funktion
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log(logMessage);
    
    // Schreibe auch in Log-Datei
    fs.appendFileSync(CONFIG.COMMIT_LOG_FILE, logMessage + '\n');
  }

  /**
   * Stoppt den Manager
   */
  stop() {
    this.log('🛑 Auto-Commit Manager wird beendet...');
    this.isRunning = false;
  }
}

// CLI-Interface
if (require.main === module) {
  const manager = new AutoCommitManager();
  const args = process.argv.slice(2);
  
  if (args.includes('--force-commit')) {
    manager.performAutoCommit('Manual force commit').then(() => {
      console.log('✅ Force-Commit abgeschlossen');
      process.exit(0);
    });
  } else if (args.includes('--check-status')) {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      console.log('Git Status:');
      console.log(status || 'Keine Änderungen');
      process.exit(0);
    } catch (error) {
      console.error('❌ Fehler beim Status-Check:', error.message);
      process.exit(1);
    }
  } else {
    manager.start().catch(error => {
      console.error('❌ Auto-Commit Manager Fehler:', error);
      process.exit(1);
    });
  }
}

module.exports = AutoCommitManager;
