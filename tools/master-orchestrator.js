#!/usr/bin/env node

/**
 * BurniToken Master Orchestrator
 * 
 * Zentraler Controller für alle Automatisierungen, Monitoring und Recovery-Systeme
 * Koordiniert Price Oracle, Health Monitoring, Recovery Center und CI/CD
 * 
 * Autor: Technischer Visionär
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

class MasterOrchestrator {
  constructor() {
    this.config = {
      tools: {
        healthMonitor: path.join(__dirname, 'health-monitor.js'),
        recoveryCenter: path.join(__dirname, 'vscode-recovery-center.js'),
        gscCheck: path.join(__dirname, 'gsc-status-check.js'),
        emergencyRecovery: path.join(__dirname, 'emergency-recovery.js')
      },
      processes: new Map(),
      statusFile: path.join(__dirname, 'orchestrator-status.json'),
      logFile: path.join(__dirname, 'orchestrator.log')
    };
    
    this.state = {
      running: false,
      startTime: null,
      services: new Map(),
      lastHealthCheck: null,
      errors: []
    };
  }

  /**
   * Startet alle kritischen Services
   */
  async startAll() {
    this.log('🚀 Master Orchestrator startet alle Services...');
    this.state.running = true;
    this.state.startTime = Date.now();
    
    try {
      // 1. Health Monitor starten
      await this.startHealthMonitor();
      
      // 2. Initial Recovery Check
      await this.runRecoveryCheck();
      
      // 3. Google Search Console Check
      await this.runGSCCheck();
      
      // 4. Status-Dashboard aktualisieren
      this.updateStatus();
      
      this.log('✅ Alle Services erfolgreich gestartet');
      
      // 5. Periodische Checks einrichten
      this.setupPeriodicChecks();
      
    } catch (error) {
      this.log(`❌ Fehler beim Starten der Services: ${error.message}`);
      this.state.errors.push({
        timestamp: Date.now(),
        error: error.message,
        action: 'startAll'
      });
    }
  }

  /**
   * Health Monitor starten
   */
  async startHealthMonitor() {
    this.log('🏥 Starte Health Monitor...');
    
    try {
      const healthProcess = spawn('node', [this.config.tools.healthMonitor, 'start'], {
        detached: true,
        stdio: 'pipe'
      });
      
      this.config.processes.set('healthMonitor', healthProcess);
      this.state.services.set('healthMonitor', {
        status: 'running',
        pid: healthProcess.pid,
        startTime: Date.now()
      });
      
      this.log(`✅ Health Monitor gestartet (PID: ${healthProcess.pid})`);
      
    } catch (error) {
      throw new Error(`Health Monitor Start fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Recovery Check durchführen
   */
  async runRecoveryCheck() {
    this.log('🔄 Führe Recovery Check durch...');
    
    try {
      const result = execSync(`node "${this.config.tools.recoveryCenter}" --live-check`, {
        encoding: 'utf8',
        timeout: 30000
      });
      
      this.state.services.set('recoveryCheck', {
        status: 'completed',
        lastRun: Date.now(),
        output: result.substring(0, 500) // Ersten 500 Zeichen speichern
      });
      
      this.log('✅ Recovery Check abgeschlossen');
      
    } catch (error) {
      this.log(`⚠️ Recovery Check mit Warnungen: ${error.message}`);
      this.state.services.set('recoveryCheck', {
        status: 'warning',
        lastRun: Date.now(),
        error: error.message
      });
    }
  }

  /**
   * Google Search Console Check
   */
  async runGSCCheck() {
    this.log('🔍 Führe Google Search Console Check durch...');
    
    try {
      const result = execSync(`node "${this.config.tools.gscCheck}"`, {
        encoding: 'utf8',
        timeout: 20000
      });
      
      this.state.services.set('gscCheck', {
        status: 'completed',
        lastRun: Date.now(),
        output: result.substring(0, 300)
      });
      
      this.log('✅ GSC Check abgeschlossen');
      
    } catch (error) {
      this.log(`⚠️ GSC Check fehlgeschlagen: ${error.message}`);
      this.state.services.set('gscCheck', {
        status: 'error',
        lastRun: Date.now(),
        error: error.message
      });
    }
  }

  /**
   * Periodische Checks einrichten
   */
  setupPeriodicChecks() {
    this.log('⏰ Richte periodische Checks ein...');
    
    // Recovery Check alle 10 Minuten
    setInterval(() => {
      this.runRecoveryCheck();
    }, 600000);
    
    // GSC Check alle 30 Minuten
    setInterval(() => {
      this.runGSCCheck();
    }, 1800000);
    
    // Status Update alle 5 Minuten
    setInterval(() => {
      this.updateStatus();
    }, 300000);
    
    this.log('✅ Periodische Checks eingerichtet');
  }

  /**
   * Notfall-Recovery auslösen
   */
  async triggerEmergencyRecovery() {
    this.log('🆘 Triggere Notfall-Recovery...');
    
    try {
      // Alle laufenden Prozesse stoppen
      this.stopAllProcesses();
      
      // Emergency Recovery ausführen
      const result = execSync(`node "${this.config.tools.emergencyRecovery}"`, {
        encoding: 'utf8',
        timeout: 60000
      });
      
      this.log('✅ Notfall-Recovery abgeschlossen');
      this.log('🔄 Starte Services neu...');
      
      // Nach kurzer Pause Services neu starten
      setTimeout(() => {
        this.startAll();
      }, 5000);
      
    } catch (error) {
      this.log(`❌ Notfall-Recovery fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Alle Prozesse stoppen
   */
  stopAllProcesses() {
    this.log('🛑 Stoppe alle laufenden Prozesse...');
    
    this.config.processes.forEach((process, name) => {
      try {
        process.kill('SIGTERM');
        this.log(`✅ ${name} gestoppt`);
      } catch (error) {
        this.log(`⚠️ Fehler beim Stoppen von ${name}: ${error.message}`);
      }
    });
    
    this.config.processes.clear();
    this.state.running = false;
  }

  /**
   * Umfassender Status-Report
   */
  getStatusReport() {
    const uptime = this.state.startTime ? Date.now() - this.state.startTime : 0;
    
    return {
      orchestrator: {
        running: this.state.running,
        uptime: uptime,
        startTime: this.state.startTime,
        version: '1.0.0'
      },
      services: Object.fromEntries(this.state.services),
      processes: Array.from(this.config.processes.keys()),
      health: {
        overallStatus: this.calculateOverallHealth(),
        lastCheck: this.state.lastHealthCheck,
        errorCount: this.state.errors.length
      },
      timestamp: Date.now()
    };
  }

  /**
   * Gesamtstatus berechnen
   */
  calculateOverallHealth() {
    const services = Array.from(this.state.services.values());
    if (services.length === 0) return 'unknown';
    
    const healthyCount = services.filter(s => 
      s.status === 'running' || s.status === 'completed'
    ).length;
    
    const healthPercentage = (healthyCount / services.length) * 100;
    
    if (healthPercentage >= 90) return 'excellent';
    if (healthPercentage >= 70) return 'good';
    if (healthPercentage >= 50) return 'warning';
    return 'critical';
  }

  /**
   * Status speichern und aktualisieren
   */
  updateStatus() {
    const status = this.getStatusReport();
    
    try {
      fs.writeFileSync(this.config.statusFile, JSON.stringify(status, null, 2));
      this.state.lastHealthCheck = Date.now();
    } catch (error) {
      this.log(`❌ Status-Update fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Dashboard für Konsolen-Ausgabe
   */
  showDashboard() {
    console.clear();
    const status = this.getStatusReport();
    const divider = '═'.repeat(80);
    
    console.log(`\n${divider}`);
    console.log('🎯 BurniToken Master Orchestrator Dashboard');
    console.log(`${divider}\n`);
    
    // Orchestrator Status
    console.log('🤖 Orchestrator Status:');
    console.log(`   Status: ${status.orchestrator.running ? '🟢 Läuft' : '🔴 Gestoppt'}`);
    if (status.orchestrator.uptime > 0) {
      const uptimeMin = Math.floor(status.orchestrator.uptime / 60000);
      console.log(`   Uptime: ${uptimeMin} Minuten`);
    }
    console.log(`   Gesundheit: ${this.getHealthEmoji(status.health.overallStatus)} ${status.health.overallStatus.toUpperCase()}`);
    
    // Services Status
    console.log('\n📊 Services Status:');
    Object.entries(status.services).forEach(([name, service]) => {
      const emoji = this.getServiceEmoji(service.status);
      const lastRun = service.lastRun ? 
        `(${Math.floor((Date.now() - service.lastRun) / 60000)}min ago)` : '';
      console.log(`   ${emoji} ${name}: ${service.status.toUpperCase()} ${lastRun}`);
    });
    
    // Aktive Prozesse
    if (status.processes.length > 0) {
      console.log('\n⚙️  Aktive Prozesse:');
      status.processes.forEach(process => {
        console.log(`   🔄 ${process}`);
      });
    }
    
    // Fehler (falls vorhanden)
    if (status.health.errorCount > 0) {
      console.log(`\n⚠️  Fehler: ${status.health.errorCount} in diesem Session`);
    }
    
    console.log(`\n${divider}`);
    console.log('💡 Befehle:');
    console.log('   Strg+C: Graceful Shutdown');
    console.log('   r: Recovery Check');
    console.log('   e: Emergency Recovery');
    console.log('   s: Status Report');
    console.log(`${divider}\n`);
  }

  getHealthEmoji(health) {
    const emojis = {
      excellent: '🟢',
      good: '🟡',
      warning: '🟠',
      critical: '🔴',
      unknown: '⚪'
    };
    return emojis[health] || '⚪';
  }

  getServiceEmoji(status) {
    const emojis = {
      running: '🟢',
      completed: '✅',
      warning: '🟡',
      error: '🔴',
      stopped: '⚪'
    };
    return emojis[status] || '⚪';
  }

  /**
   * Logging
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    console.log(logEntry);
    
    try {
      fs.appendFileSync(this.config.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Log-Fehler:', error.message);
    }
  }

  /**
   * Interaktive Befehle
   */
  setupInteractiveMode() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (key) => {
      switch (key.toLowerCase()) {
        case 'r':
          this.runRecoveryCheck();
          break;
        case 'e':
          this.triggerEmergencyRecovery();
          break;
        case 's':
          console.log(JSON.stringify(this.getStatusReport(), null, 2));
          break;
        case '\u0003': // Strg+C
          this.gracefulShutdown();
          break;
      }
    });
  }

  /**
   * Graceful Shutdown
   */
  gracefulShutdown() {
    this.log('🛑 Graceful Shutdown eingeleitet...');
    
    this.stopAllProcesses();
    this.updateStatus();
    
    this.log('✅ Shutdown abgeschlossen');
    process.exit(0);
  }
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const orchestrator = new MasterOrchestrator();
  
  switch (command) {
    case 'start':
      orchestrator.startAll().then(() => {
        orchestrator.setupInteractiveMode();
        
        // Dashboard alle 10 Sekunden aktualisieren
        setInterval(() => {
          orchestrator.showDashboard();
        }, 10000);
        
        orchestrator.showDashboard();
      });
      break;
      
    case 'stop':
      orchestrator.stopAllProcesses();
      break;
      
    case 'status':
      console.log(JSON.stringify(orchestrator.getStatusReport(), null, 2));
      break;
      
    case 'dashboard':
      orchestrator.showDashboard();
      break;
      
    case 'emergency':
      orchestrator.triggerEmergencyRecovery();
      break;
      
    default:
      console.log('🎯 BurniToken Master Orchestrator');
      console.log('');
      console.log('Verwendung:');
      console.log('  node master-orchestrator.js start      - Startet alle Services mit Dashboard');
      console.log('  node master-orchestrator.js stop       - Stoppt alle Services');
      console.log('  node master-orchestrator.js status     - Zeigt JSON-Status');
      console.log('  node master-orchestrator.js dashboard  - Zeigt Dashboard');
      console.log('  node master-orchestrator.js emergency  - Notfall-Recovery');
      break;
  }
}

module.exports = MasterOrchestrator;
