#!/usr/bin/env node

/**
 * BurniToken Changes Detection Bot
 * 
 * Automatische Erkennung, Monitoring und Analyse von Änderungen
 * - Git-Änderungen überwachen
 * - Datei-Modifikationen tracken
 * - Performance-Impact bewerten
 * - Automatische Alerts senden
 * 
 * Autor: Technischer Visionär
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class ChangesBot {
  constructor() {
    this.config = {
      // Überwachte Verzeichnisse
      watchDirs: [
        'assets',
        'tools',
        'pages',
        'src'
      ],
      
      // Überwachte Dateitypen
      watchExtensions: ['.js', '.css', '.html', '.json', '.md', '.ts'],
      
      // Wichtige Dateien mit hoher Priorität
      criticalFiles: [
        'index.html',
        'main.js',
        'package.json',
        'assets/css/styles.min.css',
        'assets/js/price-oracle.js'
      ],
      
      // Monitoring-Intervall (in Millisekunden)
      monitoringInterval: 30000, // 30 Sekunden
      
      // Output-Verzeichnisse
      logDir: path.join(__dirname, 'changes-logs'),
      reportDir: path.join(__dirname, 'changes-reports'),
      
      // Alert-Konfiguration
      alerts: {
        enabled: true,
        webhook: null, // Webhook-URL für Alerts
        email: null    // E-Mail für Alerts
      }
    };
    
    this.isRunning = false;
    this.fileHashes = new Map();
    this.lastGitCommit = null;
    this.changeHistory = [];
    
    this.logFile = path.join(this.config.logDir, 'changes-bot.log');
    this.statusFile = path.join(__dirname, 'changes-bot-status.json');
    
    this.init();
  }

  /**
   * Initialisierung
   */
  init() {
    // Verzeichnisse erstellen
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.config.reportDir)) {
      fs.mkdirSync(this.config.reportDir, { recursive: true });
    }
    
    // Initiale Datei-Hashes erstellen
    this.createInitialSnapshot();
    
    // Git-Status erfassen
    this.updateGitStatus();
    
    this.log('🤖 Changes Bot initialisiert');
  }

  /**
   * Bot starten
   */
  start() {
    if (this.isRunning) {
      this.log('⚠️ Changes Bot läuft bereits');
      return;
    }
    
    this.isRunning = true;
    this.log('🚀 Changes Bot gestartet - Monitoring aktiv');
    
    // Status speichern
    this.updateStatus('running');
    
    // Monitoring-Loop starten
    this.monitoringLoop();
    
    // Graceful Shutdown Handler
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  /**
   * Bot stoppen
   */
  stop() {
    if (!this.isRunning) {
      this.log('⚠️ Changes Bot läuft nicht');
      return;
    }
    
    this.isRunning = false;
    this.log('🛑 Changes Bot gestoppt');
    
    // Status speichern
    this.updateStatus('stopped');
    
    // Finaler Report
    this.generateDailyReport();
  }

  /**
   * Monitoring-Schleife
   */
  async monitoringLoop() {
    while (this.isRunning) {
      try {
        await this.checkForChanges();
        
        // Warten bis zum nächsten Check
        await this.sleep(this.config.monitoringInterval);
        
      } catch (error) {
        this.log(`❌ Fehler im Monitoring: ${error.message}`);
        await this.sleep(5000); // 5 Sekunden warten bei Fehler
      }
    }
  }

  /**
   * Änderungen prüfen
   */
  async checkForChanges() {
    const changes = {
      timestamp: Date.now(),
      fileChanges: [],
      gitChanges: [],
      newFiles: [],
      deletedFiles: [],
      modifiedFiles: []
    };
    
    // 1. Datei-Änderungen prüfen
    await this.checkFileChanges(changes);
    
    // 2. Git-Änderungen prüfen
    await this.checkGitChanges(changes);
    
    // 3. Wenn Änderungen gefunden, verarbeiten
    if (this.hasChanges(changes)) {
      await this.processChanges(changes);
    }
    
    // 4. Status aktualisieren
    this.updateStatus('monitoring', {
      lastCheck: changes.timestamp,
      changesDetected: this.hasChanges(changes)
    });
  }

  /**
   * Datei-Änderungen prüfen
   */
  async checkFileChanges(changes) {
    for (const dir of this.config.watchDirs) {
      const dirPath = path.join(process.cwd(), dir);
      
      if (fs.existsSync(dirPath)) {
        await this.scanDirectory(dirPath, changes);
      }
    }
    
    // Kritische Dateien separat prüfen
    for (const file of this.config.criticalFiles) {
      const filePath = path.join(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        await this.checkFile(filePath, changes, true);
      }
    }
  }

  /**
   * Verzeichnis rekursiv scannen
   */
  async scanDirectory(dirPath, changes) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        // Unterverzeichnis scannen
        await this.scanDirectory(itemPath, changes);
      } else if (item.isFile()) {
        // Datei prüfen
        const ext = path.extname(item.name);
        if (this.config.watchExtensions.includes(ext)) {
          await this.checkFile(itemPath, changes, false);
        }
      }
    }
  }

  /**
   * Einzelne Datei prüfen
   */
  async checkFile(filePath, changes, isCritical = false) {
    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath);
      const hash = crypto.createHash('md5').update(content).digest('hex');
      
      const relativePath = path.relative(process.cwd(), filePath);
      const oldHash = this.fileHashes.get(relativePath);
      
      if (!oldHash) {
        // Neue Datei
        changes.newFiles.push({
          path: relativePath,
          size: stats.size,
          hash: hash,
          critical: isCritical,
          timestamp: stats.mtime
        });
        
        this.log(`📄 Neue Datei: ${relativePath}`);
        
      } else if (oldHash !== hash) {
        // Geänderte Datei
        const changeInfo = {
          path: relativePath,
          oldHash: oldHash,
          newHash: hash,
          size: stats.size,
          critical: isCritical,
          timestamp: stats.mtime,
          type: this.detectChangeType(filePath, content)
        };
        
        changes.modifiedFiles.push(changeInfo);
        changes.fileChanges.push(changeInfo);
        
        this.log(`✏️ Datei geändert: ${relativePath}${isCritical ? ' (CRITICAL)' : ''}`);
      }
      
      // Hash aktualisieren
      this.fileHashes.set(relativePath, hash);
      
    } catch (error) {
      this.log(`❌ Fehler beim Prüfen von ${filePath}: ${error.message}`);
    }
  }

  /**
   * Git-Änderungen prüfen
   */
  async checkGitChanges(changes) {
    try {
      // Aktueller Git-Status
      const gitStatus = execSync('git status --porcelain', { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      
      if (gitStatus) {
        const lines = gitStatus.split('\n');
        
        for (const line of lines) {
          const status = line.substring(0, 2);
          const filePath = line.substring(3);
          
          changes.gitChanges.push({
            status: status,
            file: filePath,
            type: this.parseGitStatus(status)
          });
        }
      }
      
      // Letzter Commit prüfen
      const lastCommit = execSync('git rev-parse HEAD', { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      
      if (this.lastGitCommit && this.lastGitCommit !== lastCommit) {
        // Neuer Commit
        changes.gitChanges.push({
          type: 'new_commit',
          oldCommit: this.lastGitCommit,
          newCommit: lastCommit,
          timestamp: Date.now()
        });
        
        this.log(`🔄 Neuer Git Commit: ${lastCommit.substring(0, 8)}`);
      }
      
      this.lastGitCommit = lastCommit;
      
    } catch (error) {
      this.log(`⚠️ Git-Status konnte nicht abgerufen werden: ${error.message}`);
    }
  }

  /**
   * Änderungen verarbeiten
   */
  async processChanges(changes) {
    // 1. Änderungen zu Historie hinzufügen
    this.changeHistory.push(changes);
    
    // 2. Performance-Impact bewerten
    const impact = this.assessPerformanceImpact(changes);
    changes.performanceImpact = impact;
    
    // 3. Alert senden falls nötig
    if (impact.level === 'high' || changes.modifiedFiles.some(f => f.critical)) {
      await this.sendAlert(changes);
    }
    
    // 4. Report erstellen
    await this.createChangeReport(changes);
    
    // 5. Automatische Aktionen ausführen
    await this.executeAutomaticActions(changes);
    
    this.log(`🔍 ${changes.fileChanges.length} Datei-Änderungen, ${changes.gitChanges.length} Git-Änderungen verarbeitet`);
  }

  /**
   * Performance-Impact bewerten
   */
  assessPerformanceImpact(changes) {
    let impact = {
      level: 'low',
      score: 0,
      reasons: [],
      recommendations: []
    };
    
    // Kritische Dateien
    const criticalChanges = changes.modifiedFiles.filter(f => f.critical);
    if (criticalChanges.length > 0) {
      impact.score += 50;
      impact.reasons.push(`${criticalChanges.length} kritische Dateien geändert`);
    }
    
    // CSS-Änderungen
    const cssChanges = changes.modifiedFiles.filter(f => f.path.endsWith('.css'));
    if (cssChanges.length > 0) {
      impact.score += 20;
      impact.reasons.push(`${cssChanges.length} CSS-Dateien geändert`);
      impact.recommendations.push('CSS-Optimierung prüfen');
    }
    
    // JavaScript-Änderungen
    const jsChanges = changes.modifiedFiles.filter(f => f.path.endsWith('.js'));
    if (jsChanges.length > 0) {
      impact.score += 25;
      impact.reasons.push(`${jsChanges.length} JavaScript-Dateien geändert`);
      impact.recommendations.push('Bundle-Größe prüfen');
    }
    
    // HTML-Änderungen
    const htmlChanges = changes.modifiedFiles.filter(f => f.path.endsWith('.html'));
    if (htmlChanges.length > 0) {
      impact.score += 30;
      impact.reasons.push(`${htmlChanges.length} HTML-Dateien geändert`);
      impact.recommendations.push('Lighthouse-Score prüfen');
    }
    
    // Impact-Level bestimmen
    if (impact.score >= 50) {
      impact.level = 'high';
    } else if (impact.score >= 25) {
      impact.level = 'medium';
    }
    
    return impact;
  }

  /**
   * Alert senden
   */
  async sendAlert(changes) {
    if (!this.config.alerts.enabled) return;
    
    const alert = {
      timestamp: Date.now(),
      type: 'change_detection',
      severity: changes.performanceImpact.level,
      summary: `${changes.fileChanges.length} Dateien geändert`,
      details: changes,
      recommendations: changes.performanceImpact.recommendations
    };
    
    // Console-Alert
    console.log('\n🚨 CHANGES DETECTED ALERT 🚨');
    console.log(`Severity: ${alert.severity.toUpperCase()}`);
    console.log(`Files Changed: ${changes.fileChanges.length}`);
    console.log(`Performance Impact: ${changes.performanceImpact.score}/100`);
    
    if (changes.performanceImpact.recommendations.length > 0) {
      console.log('Recommendations:');
      changes.performanceImpact.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
    console.log('\n');
    
    // Log-Alert speichern
    const alertPath = path.join(this.config.logDir, `alert-${Date.now()}.json`);
    fs.writeFileSync(alertPath, JSON.stringify(alert, null, 2));
    
    this.log(`🚨 Alert erstellt: ${alert.severity} impact`);
  }

  /**
   * Change-Report erstellen
   */
  async createChangeReport(changes) {
    const report = {
      timestamp: changes.timestamp,
      summary: {
        totalChanges: changes.fileChanges.length,
        newFiles: changes.newFiles.length,
        modifiedFiles: changes.modifiedFiles.length,
        deletedFiles: changes.deletedFiles.length,
        gitChanges: changes.gitChanges.length,
        performanceImpact: changes.performanceImpact
      },
      details: changes,
      analysis: {
        fileTypes: this.analyzeFileTypes(changes),
        directories: this.analyzeDirectories(changes),
        timeline: this.generateTimeline(changes)
      }
    };
    
    const reportPath = path.join(this.config.reportDir, `changes-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📊 Change-Report erstellt: ${path.basename(reportPath)}`);
  }

  /**
   * Automatische Aktionen ausführen
   */
  async executeAutomaticActions(changes) {
    // 1. Performance-Tests bei kritischen Änderungen
    if (changes.performanceImpact.level === 'high') {
      this.log('🔄 Starte automatische Performance-Tests...');
      
      try {
        // Performance Optimizer laufen lassen
        execSync('node tools/performance-optimizer.js analyze', {
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        
        this.log('✅ Performance-Tests abgeschlossen');
      } catch (error) {
        this.log(`❌ Performance-Tests fehlgeschlagen: ${error.message}`);
      }
    }
    
    // 2. CSS-Optimierung bei CSS-Änderungen
    const cssChanges = changes.modifiedFiles.filter(f => f.path.endsWith('.css'));
    if (cssChanges.length > 0) {
      this.log('🎨 Führe CSS-Optimierung aus...');
      
      try {
        execSync('node tools/performance-optimizer.js css', {
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        
        this.log('✅ CSS-Optimierung abgeschlossen');
      } catch (error) {
        this.log(`❌ CSS-Optimierung fehlgeschlagen: ${error.message}`);
      }
    }
    
    // 3. Live-Test bei kritischen Dateien
    const criticalChanges = changes.modifiedFiles.filter(f => f.critical);
    if (criticalChanges.length > 0) {
      this.log('🌐 Führe Live-Test aus...');
      
      try {
        execSync('node tools/vscode-recovery-center.js --live-check', {
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        
        this.log('✅ Live-Test abgeschlossen');
      } catch (error) {
        this.log(`❌ Live-Test fehlgeschlagen: ${error.message}`);
      }
    }
  }

  /**
   * Hilfsmethoden
   */
  createInitialSnapshot() {
    this.log('📸 Erstelle initialen Snapshot...');
    
    for (const dir of this.config.watchDirs) {
      const dirPath = path.join(process.cwd(), dir);
      
      if (fs.existsSync(dirPath)) {
        this.scanDirectoryForSnapshot(dirPath);
      }
    }
    
    // Kritische Dateien
    for (const file of this.config.criticalFiles) {
      const filePath = path.join(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const hash = crypto.createHash('md5').update(content).digest('hex');
        this.fileHashes.set(file, hash);
      }
    }
    
    this.log(`📸 Snapshot erstellt: ${this.fileHashes.size} Dateien`);
  }

  scanDirectoryForSnapshot(dirPath) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        this.scanDirectoryForSnapshot(itemPath);
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        if (this.config.watchExtensions.includes(ext)) {
          const content = fs.readFileSync(itemPath);
          const hash = crypto.createHash('md5').update(content).digest('hex');
          const relativePath = path.relative(process.cwd(), itemPath);
          this.fileHashes.set(relativePath, hash);
        }
      }
    }
  }

  updateGitStatus() {
    try {
      this.lastGitCommit = execSync('git rev-parse HEAD', { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      
      this.log(`📝 Git Status erfasst: ${this.lastGitCommit.substring(0, 8)}`);
    } catch (error) {
      this.log(`⚠️ Git Status konnte nicht erfasst werden: ${error.message}`);
    }
  }

  detectChangeType(filePath, content) {
    const ext = path.extname(filePath);
    const contentStr = content.toString();
    
    // JavaScript-spezifische Änderungen
    if (ext === '.js') {
      if (contentStr.includes('class ') || contentStr.includes('function ')) {
        return 'code_change';
      }
      if (contentStr.includes('import ') || contentStr.includes('require(')) {
        return 'dependency_change';
      }
    }
    
    // CSS-spezifische Änderungen
    if (ext === '.css') {
      if (contentStr.includes('@media')) {
        return 'responsive_change';
      }
      if (contentStr.includes('animation') || contentStr.includes('transition')) {
        return 'animation_change';
      }
    }
    
    return 'content_change';
  }

  parseGitStatus(status) {
    const statusMap = {
      'M ': 'modified',
      'A ': 'added',
      'D ': 'deleted',
      'R ': 'renamed',
      'C ': 'copied',
      '??': 'untracked'
    };
    
    return statusMap[status] || 'unknown';
  }

  analyzeFileTypes(changes) {
    const types = {};
    
    changes.modifiedFiles.forEach(file => {
      const ext = path.extname(file.path);
      types[ext] = (types[ext] || 0) + 1;
    });
    
    return types;
  }

  analyzeDirectories(changes) {
    const dirs = {};
    
    changes.modifiedFiles.forEach(file => {
      const dir = path.dirname(file.path);
      dirs[dir] = (dirs[dir] || 0) + 1;
    });
    
    return dirs;
  }

  generateTimeline(changes) {
    return {
      detectionTime: changes.timestamp,
      totalDuration: Date.now() - changes.timestamp,
      eventsProcessed: changes.fileChanges.length + changes.gitChanges.length
    };
  }

  hasChanges(changes) {
    return changes.fileChanges.length > 0 || 
           changes.gitChanges.length > 0 || 
           changes.newFiles.length > 0 || 
           changes.deletedFiles.length > 0;
  }

  updateStatus(status, data = {}) {
    const statusData = {
      status: status,
      timestamp: Date.now(),
      uptime: Date.now() - (this.startTime || Date.now()),
      monitoring: this.isRunning,
      filesWatched: this.fileHashes.size,
      changesDetected: this.changeHistory.length,
      lastActivity: this.changeHistory.length > 0 ? 
        this.changeHistory[this.changeHistory.length - 1].timestamp : null,
      ...data
    };
    
    fs.writeFileSync(this.statusFile, JSON.stringify(statusData, null, 2));
  }

  generateDailyReport() {
    const report = {
      date: new Date().toISOString().split('T')[0],
      summary: {
        totalChanges: this.changeHistory.length,
        filesWatched: this.fileHashes.size,
        uptime: Date.now() - (this.startTime || Date.now())
      },
      changeHistory: this.changeHistory,
      statistics: this.generateStatistics()
    };
    
    const reportPath = path.join(this.config.reportDir, `daily-${report.date}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📈 Tagesbericht erstellt: ${path.basename(reportPath)}`);
  }

  generateStatistics() {
    const stats = {
      fileTypes: {},
      directories: {},
      performanceImpacts: { low: 0, medium: 0, high: 0 },
      averageChangesPerHour: 0
    };
    
    this.changeHistory.forEach(change => {
      // Datei-Typen
      change.modifiedFiles.forEach(file => {
        const ext = path.extname(file.path);
        stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
      });
      
      // Performance-Impacts
      if (change.performanceImpact) {
        stats.performanceImpacts[change.performanceImpact.level]++;
      }
    });
    
    return stats;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    console.log(logEntry);
    
    try {
      fs.appendFileSync(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Log-Fehler:', error.message);
    }
  }

  // Public API Methods
  getStatus() {
    try {
      return JSON.parse(fs.readFileSync(this.statusFile, 'utf8'));
    } catch (error) {
      return { status: 'unknown', error: error.message };
    }
  }

  getRecentChanges(limit = 10) {
    return this.changeHistory.slice(-limit);
  }

  getStatistics() {
    return this.generateStatistics();
  }
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const bot = new ChangesBot();
  
  switch (command) {
    case 'start':
      bot.startTime = Date.now();
      bot.start();
      break;
      
    case 'stop':
      bot.stop();
      process.exit(0);
      
    case 'status':
      const status = bot.getStatus();
      console.log(JSON.stringify(status, null, 2));
      break;
      
    case 'stats':
      const stats = bot.getStatistics();
      console.log(JSON.stringify(stats, null, 2));
      break;
      
    case 'check':
      bot.checkForChanges().then(() => {
        console.log('✅ Change-Check abgeschlossen');
        process.exit(0);
      });
      break;
      
    default:
      console.log('🤖 BurniToken Changes Detection Bot');
      console.log('');
      console.log('Verwendung:');
      console.log('  node changes-bot.js start   - Bot starten');
      console.log('  node changes-bot.js stop    - Bot stoppen');
      console.log('  node changes-bot.js status  - Status anzeigen');
      console.log('  node changes-bot.js stats   - Statistiken anzeigen');
      console.log('  node changes-bot.js check   - Einmalige Prüfung');
      console.log('');
      console.log('Der Bot überwacht automatisch:');
      console.log('  • Datei-Änderungen in assets/, tools/, pages/, src/');
      console.log('  • Git-Status und Commits');
      console.log('  • Performance-Impact von Änderungen');
      console.log('  • Automatische Optimierungen');
      break;
  }
}

module.exports = ChangesBot;
