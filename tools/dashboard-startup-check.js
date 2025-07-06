#!/usr/bin/env node

/**
 * Dashboard Startup Check
 *
 * Prüft alle Voraussetzungen für den automatischen Dashboard-Start
 * - Node.js Version und Installation
 * - Projektdateien und Berechtigungen
 * - System-Kompatibilität
 * - Service-Installation
 *
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Konfiguration
const CONFIG = {
  MIN_NODE_VERSION: '14.0.0',
  REQUIRED_FILES: [
    'tools/vscode-recovery-center.js',
    'tools/dashboard-auto-starter.js',
    'tools/start-dashboard-autoboot.bat',
    'tools/install-dashboard-service.ps1',
  ],
  REQUIRED_DIRS: ['tools', 'assets'],
};

class DashboardStartupCheck {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  /**
   * Protokolliert Nachrichten
   */
  log(message, type = 'info') {
    const colorCodes = {
      error: '\x1b[31m❌',
      warning: '\x1b[33m⚠️',
      success: '\x1b[32m✅',
      info: '\x1b[36mℹ️',
    };

    console.log(`${colorCodes[type]} ${message}\x1b[0m`);

    switch (type) {
      case 'error':
        this.errors.push(message);
        break;
      case 'warning':
        this.warnings.push(message);
        break;
      default:
        this.info.push(message);
        break;
    }
  }

  /**
   * Prüft Node.js Version
   */
  checkNodeVersion() {
    try {
      const nodeVersion = process.version;
      const currentVersion = nodeVersion.substring(1); // Entferne 'v'

      if (this.compareVersions(currentVersion, CONFIG.MIN_NODE_VERSION) >= 0) {
        this.log(`Node.js Version: ${nodeVersion}`, 'success');
        return true;
      } else {
        this.log(
          `Node.js Version zu alt: ${nodeVersion} (min. v${CONFIG.MIN_NODE_VERSION})`,
          'error',
        );
        return false;
      }
    } catch (error) {
      this.log(`Fehler beim Prüfen der Node.js Version: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Vergleicht Versionen (a.b.c Format)
   */
  compareVersions(version1, version2) {
    const parts1 = version1.split('.').map(Number);
    const parts2 = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  /**
   * Prüft erforderliche Dateien
   */
  checkRequiredFiles() {
    let allFilesExist = true;

    for (const file of CONFIG.REQUIRED_FILES) {
      const filePath = path.join(__dirname, '..', file);

      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          this.log(`Datei vorhanden: ${file} (${Math.round(stats.size / 1024)} KB)`, 'success');
        } catch (error) {
          this.log(`Datei nicht lesbar: ${file} - ${error.message}`, 'error');
          allFilesExist = false;
        }
      } else {
        this.log(`Datei fehlt: ${file}`, 'error');
        allFilesExist = false;
      }
    }

    return allFilesExist;
  }

  /**
   * Prüft erforderliche Verzeichnisse
   */
  checkRequiredDirectories() {
    let allDirsExist = true;

    for (const dir of CONFIG.REQUIRED_DIRS) {
      const dirPath = path.join(__dirname, '..', dir);

      if (fs.existsSync(dirPath)) {
        try {
          const stats = fs.statSync(dirPath);
          if (stats.isDirectory()) {
            const fileCount = fs.readdirSync(dirPath).length;
            this.log(`Verzeichnis vorhanden: ${dir} (${fileCount} Dateien)`, 'success');
          } else {
            this.log(`Pfad ist keine Verzeichnis: ${dir}`, 'error');
            allDirsExist = false;
          }
        } catch (error) {
          this.log(`Verzeichnis nicht lesbar: ${dir} - ${error.message}`, 'error');
          allDirsExist = false;
        }
      } else {
        this.log(`Verzeichnis fehlt: ${dir}`, 'error');
        allDirsExist = false;
      }
    }

    return allDirsExist;
  }

  /**
   * Prüft System-Kompatibilität
   */
  checkSystemCompatibility() {
    const platform = os.platform();
    const arch = os.arch();
    const memory = Math.round(os.totalmem() / 1024 / 1024 / 1024);

    this.log(`Betriebssystem: ${platform} ${arch}`, 'info');
    this.log(`Arbeitsspeicher: ${memory} GB`, 'info');

    if (platform === 'win32') {
      this.log('Windows erkannt - alle Features verfügbar', 'success');
      return true;
    } else if (platform === 'darwin' || platform === 'linux') {
      this.log('Unix-System erkannt - Service-Installation nicht verfügbar', 'warning');
      return true;
    } else {
      this.log(`Unbekanntes System: ${platform} - Kompatibilität nicht garantiert`, 'warning');
      return true;
    }
  }

  /**
   * Prüft bestehende Service-Installation
   */
  checkServiceInstallation() {
    if (os.platform() !== 'win32') {
      this.log('Service-Prüfung nur unter Windows verfügbar', 'info');
      return true;
    }

    try {
      const output = execSync('sc query BurniDashboard', { encoding: 'utf8' });
      if (output.includes('RUNNING')) {
        this.log('Windows-Service läuft bereits', 'success');
      } else if (output.includes('STOPPED')) {
        this.log('Windows-Service installiert aber gestoppt', 'warning');
      } else {
        this.log('Windows-Service installiert mit unbekanntem Status', 'warning');
      }
      return true;
    } catch (error) {
      this.log('Windows-Service nicht installiert', 'info');
      return true;
    }
  }

  /**
   * Prüft laufende Dashboard-Instanzen
   */
  checkRunningInstances() {
    const pidFile = path.join(__dirname, 'dashboard.pid');

    if (fs.existsSync(pidFile)) {
      try {
        const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim());

        if (os.platform() === 'win32') {
          try {
            execSync(`tasklist /FI "PID eq ${pid}"`, { encoding: 'utf8' });
            this.log(`Dashboard läuft bereits (PID: ${pid})`, 'warning');
          } catch (error) {
            this.log('Verwaiste PID-Datei gefunden', 'warning');
            fs.unlinkSync(pidFile);
          }
        } else {
          try {
            process.kill(pid, 0);
            this.log(`Dashboard läuft bereits (PID: ${pid})`, 'warning');
          } catch (error) {
            this.log('Verwaiste PID-Datei gefunden', 'warning');
            fs.unlinkSync(pidFile);
          }
        }
      } catch (error) {
        this.log(`Fehler beim Prüfen der PID-Datei: ${error.message}`, 'error');
      }
    } else {
      this.log('Keine laufende Dashboard-Instanz gefunden', 'success');
    }

    return true;
  }

  /**
   * Führt alle Checks durch
   */
  runAllChecks() {
    this.log('=== Dashboard Startup Check ===', 'info');
    this.log(`Zeitstempel: ${new Date().toISOString()}`, 'info');

    const checks = [
      { name: 'Node.js Version', fn: () => this.checkNodeVersion() },
      { name: 'Erforderliche Dateien', fn: () => this.checkRequiredFiles() },
      { name: 'Erforderliche Verzeichnisse', fn: () => this.checkRequiredDirectories() },
      { name: 'System-Kompatibilität', fn: () => this.checkSystemCompatibility() },
      { name: 'Service-Installation', fn: () => this.checkServiceInstallation() },
      { name: 'Laufende Instanzen', fn: () => this.checkRunningInstances() },
    ];

    let allChecksPassed = true;

    for (const check of checks) {
      this.log(`\n--- ${check.name} ---`, 'info');
      if (!check.fn()) {
        allChecksPassed = false;
      }
    }

    // Zusammenfassung
    this.log('\n=== Zusammenfassung ===', 'info');
    this.log(`Fehler: ${this.errors.length}`, this.errors.length > 0 ? 'error' : 'success');
    this.log(
      `Warnungen: ${this.warnings.length}`,
      this.warnings.length > 0 ? 'warning' : 'success',
    );

    if (allChecksPassed && this.errors.length === 0) {
      this.log('\n🎉 Alle Checks erfolgreich! Dashboard kann gestartet werden.', 'success');
      this.showStartupInstructions();
    } else {
      this.log('\n❗ Es gibt Probleme, die behoben werden müssen:', 'error');
      this.errors.forEach((error) => this.log(`  • ${error}`, 'error'));
    }

    return allChecksPassed && this.errors.length === 0;
  }

  /**
   * Zeigt Startup-Anweisungen
   */
  showStartupInstructions() {
    this.log('\n=== Startup-Anweisungen ===', 'info');
    this.log('Manuelle Starts:', 'info');
    this.log('  npm run dashboard:start', 'info');
    this.log('  node tools/dashboard-auto-starter.js', 'info');

    if (os.platform() === 'win32') {
      this.log('\nWindows-Service (Admin-Rechte erforderlich):', 'info');
      this.log('  npm run dashboard:install', 'info');
      this.log('  npm run dashboard:status', 'info');
      this.log('  npm run dashboard:restart', 'info');
      this.log('  npm run dashboard:uninstall', 'info');
    }
  }
}

// Programm ausführen
if (require.main === module) {
  const checker = new DashboardStartupCheck();
  const success = checker.runAllChecks();
  process.exit(success ? 0 : 1);
}

module.exports = DashboardStartupCheck;
