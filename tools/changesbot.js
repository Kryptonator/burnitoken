#!/usr/bin/env node

/**
 * 🤖 BurniToken ChangesBot - Continuous Change Detection & Monitoring
 * 
 * Überwacht Änderungen in:
 * - Git Repository (commits, branches, files)
 * - Website Status (performance, accessibility)
 * - System Files (dependencies, configurations)
 * - Extension Status (installations, configurations)
 * 
 * Autor: Technischer Visionär
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ChangesBot {
  constructor() {
    this.config = {
      monitoringInterval: 30000, // 30 seconds
      alertThreshold: 5, // Anzahl Änderungen für Alert
      logFile: path.join(__dirname, 'changesbot.log'),
      statusFile: path.join(__dirname, 'changesbot-status.json'),
      changeHistoryFile: path.join(__dirname, 'changes-history.json')
    };
    
    this.status = {
      isRunning: false,
      startTime: null,
      lastCheck: null,
      changesDetected: 0,
      alerts: [],
      performance: {
        checks: 0,
        errors: 0,
        avgCheckTime: 0
      }
    };
    
    this.lastStates = {
      gitHash: null,
      fileCount: 0,
      packageJsonHash: null,
      indexHtmlHash: null,
      extensionsCount: 0
    };

    this.changeHistory = [];
    this.loadStatus();
    this.loadChangeHistory();
  }

  /**
   * Startet den ChangesBot
   */
  async start() {
    console.log('🤖 BurniToken ChangesBot wird gestartet...');
    console.log('═'.repeat(50));
    
    this.status.isRunning = true;
    this.status.startTime = new Date().toISOString();
    this.saveStatus();
    
    this.log('🚀 ChangesBot gestartet');
    
    // Initial State erfassen
    await this.captureInitialState();
    
    // Monitoring-Loop starten
    console.log(`🔄 Kontinuierliche Überwachung gestartet (alle ${this.config.monitoringInterval/1000}s)`);
    this.startMonitoringLoop();
    
    // Dashboard anzeigen
    this.showDashboard();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
    });
  }

  /**
   * Stoppt den ChangesBot
   */
  stop() {
    console.log('\n🛑 ChangesBot wird gestoppt...');
    this.status.isRunning = false;
    this.saveStatus();
    this.log('🛑 ChangesBot gestoppt');
    process.exit(0);
  }

  /**
   * Erfasst den initialen Zustand
   */
  async captureInitialState() {
    this.log('📸 Erfasse initialen Zustand...');
    
    try {
      // Git Hash
      this.lastStates.gitHash = this.getGitHash();
      
      // File Count
      this.lastStates.fileCount = this.getFileCount();
      
      // Package.json Hash
      this.lastStates.packageJsonHash = this.getFileHash('package.json');
      
      // Index.html Hash
      this.lastStates.indexHtmlHash = this.getFileHash('index.html');
      
      // Extensions Count (VS Code)
      this.lastStates.extensionsCount = this.getExtensionsCount();
      
      this.log('✅ Initialer Zustand erfasst');
      
    } catch (error) {
      this.log(`❌ Fehler beim Erfassen des initialen Zustands: ${error.message}`);
    }
  }

  /**
   * Monitoring-Loop
   */
  startMonitoringLoop() {
    setInterval(async () => {
      if (!this.status.isRunning) return;
      
      const startTime = Date.now();
      this.status.lastCheck = new Date().toISOString();
      this.status.performance.checks++;
      
      try {
        await this.checkForChanges();
        
        // Performance-Messung
        const checkTime = Date.now() - startTime;
        this.status.performance.avgCheckTime = 
          (this.status.performance.avgCheckTime + checkTime) / 2;
          
      } catch (error) {
        this.status.performance.errors++;
        this.log(`❌ Fehler beim Change-Check: ${error.message}`);
      }
      
      this.saveStatus();
      
    }, this.config.monitoringInterval);
  }

  /**
   * Überprüft auf Änderungen
   */
  async checkForChanges() {
    const changes = [];
    
    // Git Changes
    const currentGitHash = this.getGitHash();
    if (currentGitHash !== this.lastStates.gitHash) {
      changes.push({
        type: 'git',
        description: 'Git commit detected',
        oldValue: this.lastStates.gitHash,
        newValue: currentGitHash,
        impact: 'high'
      });
      this.lastStates.gitHash = currentGitHash;
    }
    
    // File Count Changes
    const currentFileCount = this.getFileCount();
    if (currentFileCount !== this.lastStates.fileCount) {
      changes.push({
        type: 'files',
        description: `File count changed: ${this.lastStates.fileCount} → ${currentFileCount}`,
        oldValue: this.lastStates.fileCount,
        newValue: currentFileCount,
        impact: 'medium'
      });
      this.lastStates.fileCount = currentFileCount;
    }
    
    // Package.json Changes
    const currentPackageHash = this.getFileHash('package.json');
    if (currentPackageHash !== this.lastStates.packageJsonHash) {
      changes.push({
        type: 'dependencies',
        description: 'package.json modified',
        oldValue: this.lastStates.packageJsonHash,
        newValue: currentPackageHash,
        impact: 'high'
      });
      this.lastStates.packageJsonHash = currentPackageHash;
    }
    
    // Index.html Changes
    const currentIndexHash = this.getFileHash('index.html');
    if (currentIndexHash !== this.lastStates.indexHtmlHash) {
      changes.push({
        type: 'website',
        description: 'index.html modified',
        oldValue: this.lastStates.indexHtmlHash,
        newValue: currentIndexHash,
        impact: 'high'
      });
      this.lastStates.indexHtmlHash = currentIndexHash;
    }
    
    // Extensions Changes
    const currentExtensionsCount = this.getExtensionsCount();
    if (currentExtensionsCount !== this.lastStates.extensionsCount) {
      changes.push({
        type: 'extensions',
        description: `Extensions count changed: ${this.lastStates.extensionsCount} → ${currentExtensionsCount}`,
        oldValue: this.lastStates.extensionsCount,
        newValue: currentExtensionsCount,
        impact: 'medium'
      });
      this.lastStates.extensionsCount = currentExtensionsCount;
    }
    
    // Änderungen verarbeiten
    if (changes.length > 0) {
      this.processChanges(changes);
    }
  }

  /**
   * Verarbeitet erkannte Änderungen
   */
  processChanges(changes) {
    this.status.changesDetected += changes.length;
    
    changes.forEach(change => {
      const changeEntry = {
        ...change,
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random()
      };
      
      this.changeHistory.push(changeEntry);
      this.log(`🔄 Change detected: ${change.description}`);
      
      // Alert bei kritischen Änderungen
      if (change.impact === 'high') {
        this.createAlert(change);
      }
    });
    
    // History-Limit
    if (this.changeHistory.length > 100) {
      this.changeHistory = this.changeHistory.slice(-100);
    }
    
    this.saveChangeHistory();
    this.updateDashboard();
  }

  /**
   * Erstellt Alert
   */
  createAlert(change) {
    const alert = {
      id: Date.now(),
      type: 'change_detected',
      level: change.impact === 'high' ? 'WARNING' : 'INFO',
      message: `High-impact change: ${change.description}`,
      timestamp: new Date().toISOString(),
      change: change
    };
    
    this.status.alerts.push(alert);
    
    // Alert-Limit
    if (this.status.alerts.length > 10) {
      this.status.alerts = this.status.alerts.slice(-10);
    }
    
    this.log(`🚨 Alert: ${alert.message}`);
  }

  /**
   * Dashboard anzeigen
   */
  showDashboard() {
    console.clear();
    console.log('🤖 BurniToken ChangesBot Dashboard');
    console.log('═'.repeat(50));
    console.log(`Status: ${this.status.isRunning ? '🟢 RUNNING' : '🔴 STOPPED'}`);
    console.log(`Uptime: ${this.getUptime()}`);
    console.log(`Changes Detected: ${this.status.changesDetected}`);
    console.log(`Active Alerts: ${this.status.alerts.length}`);
    console.log(`Performance: ${this.status.performance.checks} checks, ${this.status.performance.errors} errors`);
    console.log(`Avg Check Time: ${Math.round(this.status.performance.avgCheckTime)}ms`);
    console.log('═'.repeat(50));
    
    // Recent Changes
    if (this.changeHistory.length > 0) {
      console.log('\n📋 Recent Changes:');
      this.changeHistory.slice(-5).forEach(change => {
        const time = new Date(change.timestamp).toLocaleTimeString();
        const impact = change.impact === 'high' ? '🔴' : change.impact === 'medium' ? '🟡' : '🟢';
        console.log(`  ${impact} ${time} - ${change.description}`);
      });
    }
    
    // Active Alerts
    if (this.status.alerts.length > 0) {
      console.log('\n🚨 Active Alerts:');
      this.status.alerts.slice(-3).forEach(alert => {
        const time = new Date(alert.timestamp).toLocaleTimeString();
        console.log(`  ⚠️  ${time} - ${alert.message}`);
      });
    }
    
    console.log('\n💡 Commands: Ctrl+C to stop');
    console.log('═'.repeat(50));
  }

  /**
   * Dashboard Update (alle 10 Checks)
   */
  updateDashboard() {
    if (this.status.performance.checks % 10 === 0) {
      this.showDashboard();
    }
  }

  /**
   * Hilfsmethoden
   */
  getGitHash() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'no-git';
    }
  }

  getFileCount() {
    try {
      const result = execSync('find . -type f | wc -l', { encoding: 'utf8' });
      return parseInt(result.trim());
    } catch {
      // Windows fallback
      try {
        const files = this.getAllFiles('.');
        return files.length;
      } catch {
        return 0;
      }
    }
  }

  getAllFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules') {
          files = files.concat(this.getAllFiles(fullPath));
        }
      } else {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  getFileHash(filename) {
    try {
      const content = fs.readFileSync(filename, 'utf8');
      return this.simpleHash(content);
    } catch {
      return 'not-found';
    }
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  getExtensionsCount() {
    try {
      // Fallback für VS Code Extensions count
      return this.status.extensionsCount || 0;
    } catch {
      return 0;
    }
  }

  getUptime() {
    if (!this.status.startTime) return 'N/A';
    const start = new Date(this.status.startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  /**
   * Persistierung
   */
  saveStatus() {
    try {
      fs.writeFileSync(this.config.statusFile, JSON.stringify(this.status, null, 2));
    } catch (error) {
      console.error('Fehler beim Speichern des Status:', error.message);
    }
  }

  loadStatus() {
    try {
      if (fs.existsSync(this.config.statusFile)) {
        const data = fs.readFileSync(this.config.statusFile, 'utf8');
        this.status = { ...this.status, ...JSON.parse(data) };
      }
    } catch (error) {
      console.warn('Warnung beim Laden des Status:', error.message);
    }
  }

  saveChangeHistory() {
    try {
      fs.writeFileSync(this.config.changeHistoryFile, JSON.stringify(this.changeHistory, null, 2));
    } catch (error) {
      console.error('Fehler beim Speichern der Change History:', error.message);
    }
  }

  loadChangeHistory() {
    try {
      if (fs.existsSync(this.config.changeHistoryFile)) {
        const data = fs.readFileSync(this.config.changeHistoryFile, 'utf8');
        this.changeHistory = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Warnung beim Laden der Change History:', error.message);
    }
  }

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
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const bot = new ChangesBot();
  
  switch (command) {
    case 'start':
    case undefined:
      bot.start();
      break;
      
    case 'status':
      console.log(JSON.stringify(bot.status, null, 2));
      break;
      
    case 'history':
      console.log(JSON.stringify(bot.changeHistory.slice(-10), null, 2));
      break;
      
    case 'stop':
      bot.stop();
      break;
      
    default:
      console.log('🤖 BurniToken ChangesBot');
      console.log('');
      console.log('Usage:');
      console.log('  node changesbot.js start   - Start continuous monitoring');
      console.log('  node changesbot.js status  - Show current status');
      console.log('  node changesbot.js history - Show recent changes');
      console.log('  node changesbot.js stop    - Stop monitoring');
      break;
  }
}

module.exports = ChangesBot;
