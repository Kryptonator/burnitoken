#!/usr/bin/env node

/**
 * Dashboard Auto-Starter
 *
 * Automatischer Start und Überwachung des Recovery Centers
 * - Startet das Dashboard automatisch beim System-Start
 * - Überwacht Prozesse und startet sie bei Abstürzen neu
 * - Protokolliert alle Aktivitäten für Debugging
 *
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');

// Konfiguration
const CONFIG = {
  DASHBOARD_SCRIPT: path.join(__dirname, 'vscode-recovery-center.js'),
  LOG_FILE: path.join(__dirname, 'dashboard-auto-starter.log'),
  PID_FILE: path.join(__dirname, 'dashboard.pid'),
  RESTART_DELAY: 10000, // 10 Sekunden
  MAX_RESTARTS: 100, // Erhöht für kontinuierlichen Betrieb
  RESTART_WINDOW: 3600000, // 1 Stunde
  HEALTH_CHECK_INTERVAL: 30000, // 30 Sekunden
  STARTUP_DELAY: 2000, // 2 Sekunden nach System-Start
};

class DashboardAutoStarter {
  constructor() {
    this.restartCount = 0;
    this.restartWindow = Date.now();
    this.dashboardProcess = null;
    this.isShuttingDown = false;
    this.healthCheckInterval = null;
  }

  /**
   * Protokolliert Nachrichten mit Zeitstempel
   */
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;

    console.log(logEntry.trim());

    try {
      fs.appendFileSync(CONFIG.LOG_FILE, logEntry);
    } catch (error) {
      console.error('Fehler beim Schreiben der Log-Datei:', error.message);
    }
  }

  /**
   * Schreibt die Prozess-ID in eine Datei
   */
  writePidFile(pid) {
    try {
      fs.writeFileSync(CONFIG.PID_FILE, pid.toString());
      this.log(`PID-Datei erstellt: ${CONFIG.PID_FILE} (PID: ${pid})`);
    } catch (error) {
      this.log(`Fehler beim Schreiben der PID-Datei: ${error.message}`, 'ERROR');
    }
  }

  /**
   * Löscht die PID-Datei
   */
  removePidFile() {
    try {
      if (fs.existsSync(CONFIG.PID_FILE)) {
        fs.unlinkSync(CONFIG.PID_FILE);
        this.log('PID-Datei gelöscht');
      }
    } catch (error) {
      this.log(`Fehler beim Löschen der PID-Datei: ${error.message}`, 'ERROR');
    }
  }

  /**
   * Prüft, ob bereits eine Instanz läuft
   */
  checkExistingInstance() {
    if (!fs.existsSync(CONFIG.PID_FILE)) {
      return false;
    }

    try {
      const pid = parseInt(fs.readFileSync(CONFIG.PID_FILE, 'utf8').trim());

      // Prüfe, ob der Prozess noch läuft
      if (os.platform() === 'win32') {
        exec(`tasklist /FI "PID eq ${pid}"`, (error, stdout) => {
          if (error || !stdout.includes(pid.toString())) {
            this.log('Verwaiste PID-Datei gefunden, wird entfernt');
            this.removePidFile();
            return false;
          }
        });
      } else {
        try {
          process.kill(pid, 0); // Signal 0 prüft nur Existenz
          this.log(`Dashboard läuft bereits (PID: ${pid})`);
          return true;
        } catch (error) {
          this.log('Verwaiste PID-Datei gefunden, wird entfernt');
          this.removePidFile();
          return false;
        }
      }
    } catch (error) {
      this.log(`Fehler beim Prüfen der existierenden Instanz: ${error.message}`, 'ERROR');
      this.removePidFile();
      return false;
    }

    return false;
  }

  /**
   * Startet das Dashboard
   */
  startDashboard() {
    if (this.isShuttingDown) {
      this.log('Shutdown in Bearbeitung, kein Neustart');
      return;
    }

    // Reset Restart-Counter wenn genug Zeit vergangen ist
    if (Date.now() - this.restartWindow > CONFIG.RESTART_WINDOW) {
      this.restartCount = 0;
      this.restartWindow = Date.now();
    }

    // Prüfe Restart-Limit
    if (this.restartCount >= CONFIG.MAX_RESTARTS) {
      this.log(
        `Maximale Anzahl von Neustarts erreicht (${CONFIG.MAX_RESTARTS}). Auto-Restart deaktiviert.`,
        'ERROR',
      );
      return;
    }

    this.log('Starte Dashboard...');

    // Starte Dashboard-Prozess im Daemon-Modus
    this.dashboardProcess = spawn('node', [CONFIG.DASHBOARD_SCRIPT, '--daemon'], {
      detached: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.writePidFile(this.dashboardProcess.pid);
    this.log(`Dashboard gestartet (PID: ${this.dashboardProcess.pid})`);

    // Event-Handler
    this.dashboardProcess.stdout.on('data', (data) => {
      this.log(`Dashboard STDOUT: ${data.toString().trim()}`);
    });

    this.dashboardProcess.stderr.on('data', (data) => {
      this.log(`Dashboard STDERR: ${data.toString().trim()}`, 'WARN');
    });

    this.dashboardProcess.on('close', (code, signal) => {
      this.log(`Dashboard beendet (Code: ${code}, Signal: ${signal})`);
      this.removePidFile();
      this.dashboardProcess = null;

      if (!this.isShuttingDown) {
        this.restartCount++;
        this.log(
          `Plane Neustart (${this.restartCount}/${CONFIG.MAX_RESTARTS}) in ${CONFIG.RESTART_DELAY}ms`,
        );

        setTimeout(() => {
          this.startDashboard();
        }, CONFIG.RESTART_DELAY);
      }
    });

    this.dashboardProcess.on('error', (error) => {
      this.log(`Dashboard-Fehler: ${error.message}`, 'ERROR');
    });

    // Starte Health-Check
    this.startHealthCheck();
  }

  /**
   * Startet periodische Gesundheitsprüfung
   */
  startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      if (this.dashboardProcess && !this.dashboardProcess.killed) {
        // Prüfe, ob der Prozess noch reagiert
        try {
          process.kill(this.dashboardProcess.pid, 0);
          this.log('Health-Check: Dashboard läuft normal', 'DEBUG');
        } catch (error) {
          this.log('Health-Check: Dashboard-Prozess nicht erreichbar', 'WARN');
          this.dashboardProcess = null;
          this.startDashboard();
        }
      } else if (!this.isShuttingDown) {
        this.log('Health-Check: Dashboard nicht aktiv, starte neu');
        this.startDashboard();
      }
    }, CONFIG.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Stoppt das Dashboard und alle Überwachungsprozesse
   */
  shutdown() {
    this.log('Shutdown eingeleitet...');
    this.isShuttingDown = true;

    // Stoppe Health-Check
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Stoppe Dashboard-Prozess
    if (this.dashboardProcess && !this.dashboardProcess.killed) {
      this.log('Beende Dashboard-Prozess...');
      this.dashboardProcess.kill('SIGTERM');

      // Force-Kill nach 5 Sekunden
      setTimeout(() => {
        if (this.dashboardProcess && !this.dashboardProcess.killed) {
          this.log('Force-Kill Dashboard-Prozess');
          this.dashboardProcess.kill('SIGKILL');
        }
      }, 5000);
    }

    this.removePidFile();
    this.log('Shutdown abgeschlossen');
  }

  /**
   * Hauptstart-Methode
   */
  start() {
    this.log('=== Dashboard Auto-Starter gestartet ===');
    this.log(`Node.js Version: ${process.version}`);
    this.log(`Platform: ${os.platform()} ${os.arch()}`);
    this.log(`Dashboard Script: ${CONFIG.DASHBOARD_SCRIPT}`);

    // Prüfe, ob bereits eine Instanz läuft
    if (this.checkExistingInstance()) {
      this.log('Dashboard läuft bereits. Auto-Starter beendet sich.');
      return;
    }

    // Registriere Signal-Handler für sauberen Shutdown
    process.on('SIGINT', () => {
      this.log('SIGINT empfangen');
      this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.log('SIGTERM empfangen');
      this.shutdown();
      process.exit(0);
    });

    // Fehlerbehandlung
    process.on('uncaughtException', (error) => {
      this.log(`Unbehandelter Fehler: ${error.message}`, 'ERROR');
      this.log(`Stack: ${error.stack}`, 'ERROR');
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.log(`Unbehandelte Promise-Ablehnung: ${reason}`, 'ERROR');
    });

    // Warte kurz, dann starte Dashboard
    setTimeout(() => {
      this.startDashboard();
    }, CONFIG.STARTUP_DELAY);

    this.log('Auto-Starter bereit. Dashboard wird überwacht...');
  }
}

// Programm ausführen
if (require.main === module) {
  const autoStarter = new DashboardAutoStarter();
  autoStarter.start();
}

module.exports = DashboardAutoStarter;
