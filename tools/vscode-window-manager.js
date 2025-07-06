#!/usr/bin/env node

/**
 * VS Code Window Manager - Enterprise Solution
 * 
 * Verhindert die Proliferation von VS Code-Fenstern nach Abstürzen
 * und managed die Window-Instanzen intelligent.
 * 
 * Kritisches Problem: Nach Absturz öffnen sich mehrere VS Code-Fenster
 * Lösung: Intelligentes Window-Management mit Single-Instance-Enforcement
 * 
 * Erstellt: 2025-06-30 (Post-Crash Recovery)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

// Konfiguration
const CONFIG = {
  WINDOW_STATE_FILE: path.join(__dirname, '.vscode-window-state.json'),
  MAX_ALLOWED_WINDOWS: 1,
  CRASH_DETECTION_FILE: path.join(__dirname, '.crash-detected.json'),
  RECOVERY_LOG_FILE: path.join(__dirname, '.window-recovery.log'),
  CHECK_INTERVAL: 5000, // 5 Sekunden
  WORKSPACE_PATH: path.dirname(__dirname)
};

class VSCodeWindowManager {
  constructor() {
    this.isRunning = false;
    this.windowPids = new Set();
    this.crashDetected = false;
    this.recoveryAttempts = 0;
    this.maxRecoveryAttempts = 3;
  }

  /**
   * Startet den Window Manager
   */
  async start() {
    this.log('🚀 VS Code Window Manager startet...');
    this.isRunning = true;
    
    // Prüfe auf vorherigen Absturz
    await this.checkForCrash();
    
    // Starte Monitoring-Loop
    this.startMonitoring();
    
    // Registriere Exit-Handler
    this.registerExitHandlers();
    
    this.log('✅ VS Code Window Manager aktiv');
  }

  /**
   * Prüft auf vorherigen Absturz und räumt auf
   */
  async checkForCrash() {
    if (fs.existsSync) {) {
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
        const crashData = JSON.parse(fs.readFileSync(CONFIG.CRASH_DETECTION_FILE, 'utf8'));
        this.log(`⚠️ Absturz erkannt: ${crashData.timestamp}`);
        this.crashDetected = true;
        
        // Cleanup nach Absturz
        await this.postCrashCleanup();
        
        // Lösche Crash-Marker
        fs.unlinkSync(CONFIG.CRASH_DETECTION_FILE);
      } catch (error) {
        this.log(`❌ Fehler beim Lesen der Crash-Daten: ${error.message}`);
      }
    }
  }

  /**
   * Cleanup nach erkanntem Absturz
   */
  async postCrashCleanup() {
    this.log('🧹 Post-Crash Cleanup wird ausgeführt...');
    
    try {
      // Finde alle VS Code-Prozesse
      const processes = await this.findVSCodeProcesses();
      this.log(`Gefundene VS Code-Prozesse: ${processes.length}`);
      
      if (processes.length > CONFIG.MAX_ALLOWED_WINDOWS) {
        this.log(`⚠️ Zu viele VS Code-Fenster erkannt (${processes.length}), bereinige...`);
        await this.cleanupExcessWindows(processes);
      }
      
      // Stelle sicher, dass genau ein Fenster mit dem korrekten Workspace offen ist
      await this.ensureSingleWorkspaceWindow();
      
      this.log('✅ Post-Crash Cleanup abgeschlossen');
    } catch (error) {
      this.log(`❌ Fehler beim Post-Crash Cleanup: ${error.message}`);
    }
  }

  /**
   * Findet alle VS Code-Prozesse
   */
  async findVSCodeProcesses() {
    try {
      let command;
      if (os.platform() === 'win32') {
        command = 'tasklist /fi "imagename eq Code.exe" /fo csv';
      } else {
        command = 'ps aux | grep "[C]ode"';
      }
      
      const output = execSync(command, { encoding: 'utf8' });
      
      if (os.platform() === 'win32') {
        const lines = output.split('\n').slice(1); // Skip header
        return lines.filter(line => line.trim()).map(line => {
          const parts = line.split(',');
          return {
            pid: parts[1]?.replace(/"/g, ''),
            name: parts[0]?.replace(/"/g, '')
          };
        });
      } else {
        const lines = output.split('\n').filter(line => line.trim());
        return lines.map(line => {
          const parts = line.split(/\s+/);
          return {
            pid: parts[1],
            name: parts[10]
          };
        });
      }
    } catch (error) {
      this.log(`⚠️ Keine VS Code-Prozesse gefunden oder Fehler: ${error.message}`);
      return [];
    }
  }

  /**
   * Bereinigt überschüssige Fenster
   */
  async cleanupExcessWindows(processes) {
    const excessProcesses = processes.slice(CONFIG.MAX_ALLOWED_WINDOWS);
    
    for (const process of excessProcesses) {
      try {
        this.log(`🗑️ Schließe überschüssiges VS Code-Fenster (PID: ${process.pid})`);
        
        if (os.platform() === 'win32') {
          execSync(`taskkill /pid ${process.pid} /f`, { stdio: 'ignore' });
        } else {
          execSync(`kill -9 ${process.pid}`, { stdio: 'ignore' });
        }
        
        await this.sleep(1000); // Warte 1 Sekunde zwischen Kills
      } catch (error) {
        this.log(`⚠️ Konnte Prozess ${process.pid} nicht beenden: ${error.message}`);
      }
    }
  }

  /**
   * Stellt sicher, dass genau ein Workspace-Fenster offen ist
   */
  async ensureSingleWorkspaceWindow() {
    try {
      // Prüfe, ob ein VS Code mit unserem Workspace läuft
      const processes = await this.findVSCodeProcesses();
      
      if (processes.length === 0) {
        this.log('📂 Öffne VS Code mit korrektem Workspace...');
        await this.openWorkspace();
      } else if (processes.length === 1) {
        this.log('✅ Genau ein VS Code-Fenster aktiv');
      }
    } catch (error) {
      this.log(`❌ Fehler beim Workspace-Management: ${error.message}`);
    }
  }

  /**
   * Öffnet VS Code mit dem korrekten Workspace
   */
  async openWorkspace() {
    try {
      const command = `code "${CONFIG.WORKSPACE_PATH}"`;
      spawn(command, [], { 
        shell: true, 
        detached: true,
        stdio: 'ignore'
      });
      
      this.log(`✅ VS Code mit Workspace geöffnet: ${CONFIG.WORKSPACE_PATH}`);
    } catch (error) {
      this.log(`❌ Fehler beim Öffnen des Workspace: ${error.message}`);
    }
  }

  /**
   * Startet das kontinuierliche Monitoring
   */
  startMonitoring() {
    const monitor = async () => {
      if (!this.isRunning) return;
      
      try {
        const processes = await this.findVSCodeProcesses();
        
        // Prüfe auf Proliferation
        if (processes.length > CONFIG.MAX_ALLOWED_WINDOWS) {
          this.log(`⚠️ Window-Proliferation erkannt: ${processes.length} Fenster`);
          await this.cleanupExcessWindows(processes);
        }
        
        // Prüfe auf "Not Responding" Windows (Windows-spezifisch)
        if (os.platform() === 'win32') {
          await this.checkForNonResponsiveWindows();
        }
        
      } catch (error) {
        this.log(`❌ Monitoring-Fehler: ${error.message}`);
      }
      
      // Schedule nächsten Check
      setTimeout(monitor, CONFIG.CHECK_INTERVAL);
    };
    
    monitor();
  }

  /**
   * Prüft auf nicht reagierende Fenster (Windows)
   */
  async checkForNonResponsiveWindows() {
    try {
      const command = 'tasklist /fi "imagename eq Code.exe" /fi "status eq Not Responding" /fo csv';
      const output = execSync(command, { encoding: 'utf8' });
      
      if (output.includes('Code.exe')) {
        this.log('⚠️ Nicht reagierendes VS Code-Fenster erkannt');
        
        // Erstelle Crash-Marker für nächsten Start
        this.createCrashMarker('Not Responding Window');
        
        // Versuche Recovery
        await this.recoverFromNonResponsive();
      }
    } catch (error) {
      // Ignoriere Fehler (kein nicht reagierendes Fenster gefunden)
    }
  }

  /**
   * Recovery von nicht reagierenden Fenstern
   */
  async recoverFromNonResponsive() {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      this.log('❌ Maximale Recovery-Versuche erreicht');
      return;
    }
    
    this.recoveryAttempts++;
    this.log(`🔄 Recovery-Versuch ${this.recoveryAttempts}/${this.maxRecoveryAttempts}`);
    
    try {
      // Beende alle VS Code-Prozesse sanft
      const processes = await this.findVSCodeProcesses();
      for (const process of processes) {
        execSync(`taskkill /pid ${process.pid}`, { stdio: 'ignore' });
      }
      
      // Warte kurz
      await this.sleep(3000);
      
      // Öffne neues Fenster
      await this.openWorkspace();
      
      this.log('✅ Recovery erfolgreich');
    } catch (error) {
      this.log(`❌ Recovery fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Erstellt einen Crash-Marker
   */
  createCrashMarker(reason) {
    const crashData = {
      timestamp: new Date().toISOString(),
      reason: reason,
      windowCount: this.windowPids.size
    };
    
    fs.writeFileSync(CONFIG.CRASH_DETECTION_FILE, JSON.stringify(crashData, null, 2));
    this.log(`📝 Crash-Marker erstellt: ${reason}`);
  }

  /**
   * Registriert Exit-Handler
   */
  registerExitHandlers() {
    const cleanup = () => {
      this.log('🛑 VS Code Window Manager wird beendet...');
      this.isRunning = false;
      
      // Speichere aktuellen Zustand
      this.saveWindowState();
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('beforeExit', cleanup);
  }

  /**
   * Speichert den aktuellen Window-Zustand
   */
  saveWindowState() {
    const state = {
      timestamp: new Date().toISOString(),
      windowCount: this.windowPids.size,
      workspacePath: CONFIG.WORKSPACE_PATH
    };
    
    fs.writeFileSync(CONFIG.WINDOW_STATE_FILE, JSON.stringify(state, null, 2));
  }

  /**
   * Logging-Funktion
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log(logMessage);
    
    // Schreibe auch in Log-Datei
    fs.appendFileSync(CONFIG.RECOVERY_LOG_FILE, logMessage + '\n');
  }

  /**
   * Sleep-Utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Starte Window Manager wenn direkt ausgeführt
if (require.main === module) {
  const manager = new VSCodeWindowManager();
  
  // Handle Command Line Arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    manager.postCrashCleanup().then(() => {
      console.log('✅ Cleanup abgeschlossen');
      process.exit(0);
    });
  } else if (args.includes('--check')) {
    manager.findVSCodeProcesses().then(processes => {
      console.log(`VS Code-Prozesse: ${processes.length}`);
      processes.forEach(p => console.log(`  PID: ${p.pid}, Name: ${p.name}`));
      process.exit(0);
    });
  } else {
    manager.start().catch(error => {
      console.error('❌ Window Manager Fehler:', error);
      process.exit(1);
    });
  }
}

module.exports = VSCodeWindowManager;
