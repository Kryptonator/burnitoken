#!/usr/bin/env node

/**
 * BurniToken Git Commit Bot
 * 
 * Automatischer Git-Bot für intelligente Commits
 * - Erkennt Änderungen automatisch
 * - Generiert aussagekräftige Commit-Messages
 * - Führt automatische Commits durch
 * - Pushed zu Remote-Repository
 * 
 * Autor: Technischer Visionär
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitCommitBot {
  constructor() {
    this.config = {
      // Auto-Commit Einstellungen
      autoCommit: true,
      autoPush: true,
      
      // Commit-Message Präfixe basierend auf Dateitypen
      commitPrefixes: {
        '.js': '⚡ JavaScript',
        '.css': '🎨 Styling',
        '.html': '📄 HTML',
        '.json': '🔧 Config',
        '.md': '📝 Docs',
        '.ts': '⚡ TypeScript',
        '.yml': '👷 CI/CD',
        '.yaml': '👷 CI/CD'
      },
      
      // Spezielle Datei-Keywords für intelligente Messages
      fileKeywords: {
        'package.json': '📦 Dependencies',
        'index.html': '🏠 Homepage',
        'main.js': '🚀 Core',
        'style': '🎨 Styling',
        'test': '🧪 Tests',
        'config': '⚙️ Config',
        'readme': '📖 Documentation',
        'security': '🔒 Security',
        'performance': '⚡ Performance',
        'price': '💰 Price',
        'api': '🔌 API',
        'fix': '🐛 Fix',
        'feature': '✨ Feature',
        'optimization': '🚀 Optimization'
      },
      
      // Branch-Strategien
      branchStrategy: 'auto', // 'auto', 'main', 'development'
      
      // Commit-Intervall (Millisekunden)
      commitInterval: 300000, // 5 Minuten
      
      // Logs und Status
      logDir: path.join(__dirname, 'git-logs'),
      statusFile: path.join(__dirname, 'git-bot-status.json')
    };
    
    this.isRunning = false;
    this.pendingChanges = [];
    this.commitHistory = [];
    this.lastCommitTime = null;
    
    this.logFile = path.join(this.config.logDir, 'git-commit-bot.log');
    
    this.init();
  }

  /**
   * Initialisierung
   */
  init() {
    // Log-Verzeichnis erstellen
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
    
    // Git-Repository validieren
    this.validateGitRepo();
    
    this.log('🤖 Git Commit Bot initialisiert');
  }

  /**
   * Bot starten
   */
  start() {
    if (this.isRunning) {
      this.log('⚠️ Git Commit Bot läuft bereits');
      return;
    }
    
    this.isRunning = true;
    this.log('🚀 Git Commit Bot gestartet - Auto-Commit aktiv');
    
    // Status speichern
    this.updateStatus('running');
    
    // Commit-Loop starten
    this.commitLoop();
    
    // Graceful Shutdown Handler
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  /**
   * Bot stoppen
   */
  stop() {
    if (!this.isRunning) {
      this.log('⚠️ Git Commit Bot läuft nicht');
      return;
    }
    
    this.isRunning = false;
    
    // Finale Commits falls noch ausstehend
    if (this.pendingChanges.length > 0) {
      this.log('📝 Führe finale Commits durch...');
      this.executeCommits();
    }
    
    this.log('🛑 Git Commit Bot gestoppt');
    this.updateStatus('stopped');
  }

  /**
   * Commit-Loop
   */
  async commitLoop() {
    while (this.isRunning) {
      try {
        await this.checkAndCommit();
        
        // Warten bis zum nächsten Check
        await this.sleep(this.config.commitInterval);
        
      } catch (error) {
        this.log(`❌ Fehler im Commit-Loop: ${error.message}`);
        await this.sleep(10000); // 10 Sekunden warten bei Fehler
      }
    }
  }

  /**
   * Änderungen prüfen und committen
   */
  async checkAndCommit() {
    // 1. Git-Status prüfen
    const changes = this.getGitStatus();
    
    if (changes.length === 0) {
      return; // Keine Änderungen
    }
    
    this.log(`🔍 ${changes.length} Änderungen erkannt`);
    
    // 2. Änderungen kategorisieren
    const categorizedChanges = this.categorizeChanges(changes);
    
    // 3. Commit-Messages generieren
    const commitGroups = this.groupChangesForCommits(categorizedChanges);
    
    // 4. Commits ausführen
    for (const group of commitGroups) {
      await this.executeCommit(group);
    }
    
    // 5. Push falls konfiguriert
    if (this.config.autoPush) {
      await this.pushToRemote();
    }
  }

  /**
   * Git-Status abrufen
   */
  getGitStatus() {
    try {
      const output = execSync('git status --porcelain', { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      
      if (!output) return [];
      
      return output.split('\n').map(line => {
        const status = line.substring(0, 2).trim();
        const file = line.substring(3);
        
        return {
          status: status,
          file: file,
          type: this.getChangeType(status),
          category: this.getFileCategory(file)
        };
      });
      
    } catch (error) {
      this.log(`❌ Git-Status konnte nicht abgerufen werden: ${error.message}`);
      return [];
    }
  }

  /**
   * Änderungen kategorisieren
   */
  categorizeChanges(changes) {
    const categories = {
      critical: [],
      features: [],
      fixes: [],
      styles: [],
      docs: [],
      config: [],
      tests: [],
      other: []
    };
    
    changes.forEach(change => {
      const file = change.file.toLowerCase();
      
      // Kritische Dateien
      if (this.isCriticalFile(file)) {
        categories.critical.push(change);
      }
      // Features
      else if (file.includes('feature') || change.status === 'A') {
        categories.features.push(change);
      }
      // Fixes
      else if (file.includes('fix') || file.includes('bug')) {
        categories.fixes.push(change);
      }
      // Styling
      else if (file.endsWith('.css') || file.includes('style')) {
        categories.styles.push(change);
      }
      // Dokumentation
      else if (file.endsWith('.md') || file.includes('doc')) {
        categories.docs.push(change);
      }
      // Konfiguration
      else if (file.endsWith('.json') || file.includes('config')) {
        categories.config.push(change);
      }
      // Tests
      else if (file.includes('test') || file.includes('spec')) {
        categories.tests.push(change);
      }
      // Sonstige
      else {
        categories.other.push(change);
      }
    });
    
    return categories;
  }

  /**
   * Änderungen für Commits gruppieren
   */
  groupChangesForCommits(categories) {
    const commitGroups = [];
    
    // Kritische Änderungen - einzelne Commits
    categories.critical.forEach(change => {
      commitGroups.push({
        type: 'critical',
        files: [change],
        message: this.generateCriticalCommitMessage(change)
      });
    });
    
    // Features - gruppiert
    if (categories.features.length > 0) {
      commitGroups.push({
        type: 'feature',
        files: categories.features,
        message: this.generateFeatureCommitMessage(categories.features)
      });
    }
    
    // Fixes - gruppiert
    if (categories.fixes.length > 0) {
      commitGroups.push({
        type: 'fix',
        files: categories.fixes,
        message: this.generateFixCommitMessage(categories.fixes)
      });
    }
    
    // Styling - gruppiert
    if (categories.styles.length > 0) {
      commitGroups.push({
        type: 'style',
        files: categories.styles,
        message: this.generateStyleCommitMessage(categories.styles)
      });
    }
    
    // Dokumentation - gruppiert
    if (categories.docs.length > 0) {
      commitGroups.push({
        type: 'docs',
        files: categories.docs,
        message: this.generateDocsCommitMessage(categories.docs)
      });
    }
    
    // Konfiguration - gruppiert
    if (categories.config.length > 0) {
      commitGroups.push({
        type: 'config',
        files: categories.config,
        message: this.generateConfigCommitMessage(categories.config)
      });
    }
    
    // Tests - gruppiert
    if (categories.tests.length > 0) {
      commitGroups.push({
        type: 'test',
        files: categories.tests,
        message: this.generateTestCommitMessage(categories.tests)
      });
    }
    
    // Sonstige - gruppiert
    if (categories.other.length > 0) {
      commitGroups.push({
        type: 'misc',
        files: categories.other,
        message: this.generateMiscCommitMessage(categories.other)
      });
    }
    
    return commitGroups;
  }

  /**
   * Commit ausführen
   */
  async executeCommit(group) {
    try {
      // 1. Dateien zur Staging Area hinzufügen
      const files = group.files.map(f => f.file);
      
      for (const file of files) {
        execSync(`git add "${file}"`, { 
          cwd: process.cwd(),
          stdio: 'pipe'
        });
      }
      
      // 2. Commit erstellen
      execSync(`git commit -m "${group.message}"`, { 
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      // 3. Commit zur Historie hinzufügen
      const commit = {
        timestamp: Date.now(),
        type: group.type,
        message: group.message,
        files: files,
        hash: this.getLastCommitHash()
      };
      
      this.commitHistory.push(commit);
      this.lastCommitTime = Date.now();
      
      this.log(`✅ Commit erstellt: ${group.message}`);
      this.log(`📁 Dateien: ${files.join(', ')}`);
      
    } catch (error) {
      this.log(`❌ Commit fehlgeschlagen: ${error.message}`);
      this.log(`📁 Dateien: ${group.files.map(f => f.file).join(', ')}`);
    }
  }

  /**
   * Push zu Remote-Repository
   */
  async pushToRemote() {
    try {
      // Aktueller Branch
      const currentBranch = execSync('git branch --show-current', { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      
      // Push
      execSync(`git push origin ${currentBranch}`, { 
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      this.log(`🚀 Pushed zu Remote: ${currentBranch}`);
      
    } catch (error) {
      this.log(`❌ Push fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Commit-Message-Generatoren
   */
  generateCriticalCommitMessage(change) {
    const file = change.file;
    const action = this.getActionWord(change.status);
    
    if (file.includes('index.html')) {
      return `🏠 ${action} Homepage (${file})`;
    }
    if (file.includes('main.js')) {
      return `🚀 ${action} Core Application (${file})`;
    }
    if (file.includes('package.json')) {
      return `📦 ${action} Dependencies (${file})`;
    }
    if (file.includes('price-oracle')) {
      return `💰 ${action} Price Oracle System (${file})`;
    }
    
    return `🔥 ${action} Critical File: ${file}`;
  }

  generateFeatureCommitMessage(changes) {
    if (changes.length === 1) {
      const file = changes[0].file;
      return `✨ Add new feature: ${this.getFeatureName(file)}`;
    }
    
    const features = changes.map(c => this.getFeatureName(c.file))
      .filter((f, i, arr) => arr.indexOf(f) === i) // Unique
      .slice(0, 3);
    
    if (features.length === 1) {
      return `✨ Add feature: ${features[0]}`;
    }
    
    return `✨ Add features: ${features.join(', ')}${features.length > 3 ? ' +more' : ''}`;
  }

  generateFixCommitMessage(changes) {
    if (changes.length === 1) {
      const file = changes[0].file;
      return `🐛 Fix: ${this.getFixDescription(file)}`;
    }
    
    const components = this.getUniqueComponents(changes);
    
    if (components.length === 1) {
      return `🐛 Fix ${components[0]} issues`;
    }
    
    return `🐛 Fix multiple issues: ${components.slice(0, 2).join(', ')}${components.length > 2 ? ' +more' : ''}`;
  }

  generateStyleCommitMessage(changes) {
    const components = this.getUniqueComponents(changes);
    
    if (components.length === 1) {
      return `🎨 Style: Update ${components[0]} styling`;
    }
    
    return `🎨 Style: Update styling for ${components.slice(0, 2).join(', ')}${components.length > 2 ? ' +more' : ''}`;
  }

  generateDocsCommitMessage(changes) {
    if (changes.some(c => c.file.toLowerCase().includes('readme'))) {
      return `📝 Docs: Update README and documentation`;
    }
    
    return `📝 Docs: Update documentation (${changes.length} file${changes.length > 1 ? 's' : ''})`;
  }

  generateConfigCommitMessage(changes) {
    const configs = changes.map(c => path.basename(c.file, path.extname(c.file)))
      .filter((f, i, arr) => arr.indexOf(f) === i)
      .slice(0, 2);
    
    return `⚙️ Config: Update ${configs.join(', ')}${configs.length > 2 ? ' +more' : ''}`;
  }

  generateTestCommitMessage(changes) {
    return `🧪 Tests: Update test files (${changes.length} file${changes.length > 1 ? 's' : ''})`;
  }

  generateMiscCommitMessage(changes) {
    const types = [...new Set(changes.map(c => path.extname(c.file)))];
    
    if (types.length === 1) {
      const emoji = this.config.commitPrefixes[types[0]] || '📝';
      return `${emoji} Update ${types[0].substring(1)} files (${changes.length})`;
    }
    
    return `📝 Misc: Update various files (${changes.length} changes)`;
  }

  /**
   * Hilfsmethoden
   */
  validateGitRepo() {
    try {
      execSync('git rev-parse --git-dir', { 
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      this.log('✅ Git-Repository validiert');
    } catch (error) {
      throw new Error('Kein gültiges Git-Repository gefunden');
    }
  }

  getChangeType(status) {
    const typeMap = {
      'M': 'modified',
      'A': 'added',
      'D': 'deleted',
      'R': 'renamed',
      'C': 'copied',
      '??': 'untracked'
    };
    
    return typeMap[status] || 'unknown';
  }

  getFileCategory(file) {
    const ext = path.extname(file).toLowerCase();
    const basename = path.basename(file).toLowerCase();
    
    if (this.isCriticalFile(file)) return 'critical';
    if (ext === '.css' || basename.includes('style')) return 'style';
    if (ext === '.js' || ext === '.ts') return 'script';
    if (ext === '.html') return 'markup';
    if (ext === '.json') return 'config';
    if (ext === '.md') return 'docs';
    if (basename.includes('test') || basename.includes('spec')) return 'test';
    
    return 'other';
  }

  isCriticalFile(file) {
    const criticalFiles = [
      'index.html',
      'main.js',
      'package.json',
      'price-oracle.js',
      'performance-optimizer.js'
    ];
    
    return criticalFiles.some(critical => 
      file.toLowerCase().includes(critical.toLowerCase())
    );
  }

  getActionWord(status) {
    const actions = {
      'M': 'Update',
      'A': 'Add',
      'D': 'Remove',
      'R': 'Rename',
      'C': 'Copy'
    };
    
    return actions[status] || 'Modify';
  }

  getFeatureName(file) {
    const basename = path.basename(file, path.extname(file));
    
    // Intelligente Feature-Namen basierend auf Dateinamen
    if (basename.includes('price')) return 'Price System';
    if (basename.includes('performance')) return 'Performance';
    if (basename.includes('security')) return 'Security';
    if (basename.includes('monitor')) return 'Monitoring';
    if (basename.includes('bot')) return 'Automation';
    if (basename.includes('optimization')) return 'Optimization';
    
    return basename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getFixDescription(file) {
    const basename = path.basename(file, path.extname(file));
    
    if (basename.includes('price')) return 'price system';
    if (basename.includes('performance')) return 'performance issues';
    if (basename.includes('style')) return 'styling issues';
    if (basename.includes('security')) return 'security vulnerabilities';
    
    return `${basename.replace(/[-_]/g, ' ')} issues`;
  }

  getUniqueComponents(changes) {
    return [...new Set(changes.map(c => {
      const basename = path.basename(c.file, path.extname(c.file));
      
      if (basename.includes('price')) return 'price system';
      if (basename.includes('performance')) return 'performance';
      if (basename.includes('style')) return 'styling';
      if (basename.includes('security')) return 'security';
      if (basename.includes('monitor')) return 'monitoring';
      
      return basename.replace(/[-_]/g, ' ');
    }))];
  }

  getLastCommitHash() {
    try {
      return execSync('git rev-parse --short HEAD', { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  updateStatus(status, data = {}) {
    const statusData = {
      status: status,
      timestamp: Date.now(),
      uptime: Date.now() - (this.startTime || Date.now()),
      running: this.isRunning,
      commitsToday: this.getCommitsToday(),
      lastCommit: this.lastCommitTime,
      pendingChanges: this.pendingChanges.length,
      ...data
    };
    
    fs.writeFileSync(this.config.statusFile, JSON.stringify(statusData, null, 2));
  }

  getCommitsToday() {
    const today = new Date().toDateString();
    return this.commitHistory.filter(commit => 
      new Date(commit.timestamp).toDateString() === today
    ).length;
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
  commitNow() {
    this.log('🔄 Manuelle Commit-Prüfung gestartet...');
    return this.checkAndCommit();
  }

  getStatus() {
    try {
      return JSON.parse(fs.readFileSync(this.config.statusFile, 'utf8'));
    } catch (error) {
      return { status: 'unknown', error: error.message };
    }
  }

  getCommitHistory(limit = 10) {
    return this.commitHistory.slice(-limit);
  }

  setConfig(key, value) {
    this.config[key] = value;
    this.log(`⚙️ Konfiguration geändert: ${key} = ${value}`);
  }
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const bot = new GitCommitBot();
  
  switch (command) {
    case 'start':
      bot.startTime = Date.now();
      bot.start();
      break;
      
    case 'stop':
      bot.stop();
      process.exit(0);
      
    case 'commit':
      bot.commitNow().then(() => {
        console.log('✅ Commit-Check abgeschlossen');
        process.exit(0);
      });
      break;
      
    case 'status':
      const status = bot.getStatus();
      console.log(JSON.stringify(status, null, 2));
      break;
      
    case 'history':
      const history = bot.getCommitHistory();
      console.log(JSON.stringify(history, null, 2));
      break;
      
    case 'config':
      const key = process.argv[3];
      const value = process.argv[4];
      
      if (key && value) {
        bot.setConfig(key, value);
        console.log(`✅ Konfiguration gesetzt: ${key} = ${value}`);
      } else {
        console.log('❌ Verwendung: node git-commit-bot.js config <key> <value>');
      }
      break;
      
    default:
      console.log('🤖 BurniToken Git Commit Bot');
      console.log('');
      console.log('Verwendung:');
      console.log('  node git-commit-bot.js start     - Bot starten (Auto-Commits)');
      console.log('  node git-commit-bot.js stop      - Bot stoppen');
      console.log('  node git-commit-bot.js commit    - Sofortiger Commit-Check');
      console.log('  node git-commit-bot.js status    - Status anzeigen');
      console.log('  node git-commit-bot.js history   - Commit-Historie anzeigen');
      console.log('  node git-commit-bot.js config    - Konfiguration ändern');
      console.log('');
      console.log('Features:');
      console.log('  ✨ Intelligente Commit-Messages');
      console.log('  🔄 Automatische Kategorisierung');
      console.log('  🚀 Auto-Push zu Remote');
      console.log('  📊 Commit-Historie und Status');
      console.log('  ⚙️ Konfigurierbare Intervalle');
      break;
  }
}

module.exports = GitCommitBot;
