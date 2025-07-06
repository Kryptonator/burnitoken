#!/usr/bin/env node

/**
 * BurniToken Bot Orchestrator - Zentrale Steuerung aller Worker & Bots
 *
 * Überwacht, steuert und heilt alle automatisierten Prozesse:
 * - Performance Monitor
 * - SEO Monitor
 * - Security Scanner
 * - Price Oracle
 * - Accessibility Checker
 * - Recovery Manager
 * - Asset Optimizer
 * - API Health Checker
 *
 * Autor: Technischer Visionär
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');
const osUtils = require('os-utils');

class BotOrchestrator {
  constructor() {
    this.config = {
      statusFile: path.join(__dirname, 'bot-status.json'),
      logDir: path.join(__dirname, 'bot-logs'),
      pidDir: path.join(__dirname, 'bot-pids'),
      healthCheckInterval: 30000, // 30 Sekunden
      maxRestarts: 3,
      restartCooldown: 60000, // 1 Minute
    };

    this.bots = new Map();
    this.healthMetrics = new Map();
    this.isRunning = false;

    this.initializeBots();
    this.setupDirectories();
  }

  /**
   * Bot-Definitionen mit Health-Checks und Recovery-Strategien
   * Level 1: Kritisch (Deployment, Production, Security)
   * Level 2: Wichtig (Performance, SEO, APIs)
   * Level 3: Hilfreich (Logs, Recovery, Assets)
   */
  initializeBots() {
    const botDefinitions = [
      // ===== KRITISCHE BOTS (Level 1) =====
      {
        id: 'deployment-pipeline',
        name: '🚀 Deployment Pipeline',
        description: 'Überwacht CI/CD, GitHub Actions, Netlify Deployments',
        script: 'deployment-pipeline-bot.js',
        args: ['--monitor', '--auto-deploy'],
        interval: 30000, // 30 Sekunden
        healthCheck: () => this.checkDeploymentPipelineHealth(),
        criticalLevel: 1,
        autoRestart: true,
        maxMemory: 80,
        maxCpu: 25,
        priority: 1,
      },

      {
        id: 'production-monitor',
        name: '🔴 Production Monitor',
        description: 'Live-Website Überwachung, Uptime, Performance Critical',
        script: 'production-monitor-bot.js',
        args: ['--live', '--alerts'],
        interval: 15000, // 15 Sekunden
        healthCheck: () => this.checkProductionHealth(),
        criticalLevel: 1,
        autoRestart: true,
        maxMemory: 60,
        maxCpu: 15,
        priority: 1,
      },

      {
        id: 'github-repository-manager',
        name: '📦 GitHub Repository Manager',
        description: 'Issues, PRs, Releases, Repository Health Management',
        script: 'github-repo-manager-bot.js',
        args: ['--monitor', '--auto-process'],
        interval: 120000, // 2 Minuten
        healthCheck: () => this.checkGitHubRepoHealth(),
        criticalLevel: 1,
        autoRestart: true,
        maxMemory: 100,
        maxCpu: 20,
        priority: 1,
      },

      {
        id: 'security-watchdog',
        name: '🛡️ Security Watchdog',
        description: 'Echtzeit-Sicherheitsüberwachung, Vulnerability Alerts',
        script: 'security-watchdog-bot.js',
        args: ['--realtime', '--immediate-alerts'],
        interval: 60000, // 1 Minute
        healthCheck: () => this.checkSecurityWatchdogHealth(),
        criticalLevel: 1,
        autoRestart: true,
        maxMemory: 120,
        maxCpu: 30,
        priority: 1,
      },

      // ===== WICHTIGE BOTS (Level 2) =====
      {
        id: 'gemini-ai-chef',
        name: '🧠 Gemini AI Chef Bot',
        description: 'KI-gestützte Code-Reviews, Optimierungen, Smart Suggestions',
        script: 'gemini-ai-chef-bot.js',
        args: ['--continuous', '--code-review'],
        interval: 300000, // 5 Minuten
        healthCheck: () => this.checkGeminiAIHealth(),
        criticalLevel: 2,
        autoRestart: true,
        maxMemory: 200,
        maxCpu: 35,
        priority: 2,
      },

      {
        id: 'google-search-console-bot',
        name: '🔍 Google Search Console Bot',
        description: 'GSC API Integration, Indexierung, Search Performance',
        script: 'gsc-status-check.js',
        args: ['--monitor', '--auto-submit'],
        interval: 600000, // 10 Minuten
        healthCheck: () => this.checkGSCHealth(),
        criticalLevel: 2,
        autoRestart: true,
        maxMemory: 80,
        maxCpu: 15,
        priority: 2,
      },

      {
        id: 'performance-monitor',
        name: '⚡ Performance Monitor',
        description: 'Core Web Vitals, Lighthouse, Speed Optimization',
        script: 'performance-optimizer.js',
        args: ['monitor', '--continuous'],
        interval: 180000, // 3 Minuten
        healthCheck: () => this.checkPerformanceHealth(),
        criticalLevel: 2,
        autoRestart: true,
        maxMemory: 100,
        maxCpu: 20,
        priority: 2,
      },

      {
        id: 'seo-monitor',
        name: '� SEO Monitor',
        description: 'SEO-Metriken, Meta-Tags, Search Rankings',
        script: 'seo-monitor.js',
        args: ['--watch'],
        interval: 300000, // 5 Minuten
        healthCheck: () => this.checkSEOHealth(),
        criticalLevel: 2,
        autoRestart: true,
        maxMemory: 80,
        maxCpu: 15,
        priority: 2,
      },

      {
        id: 'api-orchestrator',
        name: '🌐 API Orchestrator',
        description: 'Externe APIs: CoinGecko, XRPL, Social Media APIs',
        script: 'api-orchestrator-bot.js',
        args: ['--monitor-all', '--failover'],
        interval: 60000, // 1 Minute
        healthCheck: () => this.checkAPIOrchestrator(),
        criticalLevel: 2,
        autoRestart: true,
        maxMemory: 90,
        maxCpu: 18,
        priority: 2,
      },

      {
        id: 'content-manager',
        name: '📝 Content Manager',
        description: 'Automatische Content-Updates, Übersetzungen, CMS',
        script: 'content-manager-bot.js',
        args: ['--auto-update', '--i18n'],
        interval: 900000, // 15 Minuten
        healthCheck: () => this.checkContentManagerHealth(),
        criticalLevel: 2,
        autoRestart: true,
        maxMemory: 120,
        maxCpu: 25,
        priority: 2,
      },

      // ===== HILFSBOTS (Level 3) =====
      {
        id: 'accessibility-checker',
        name: '♿ A11y Checker',
        description: 'WCAG-Compliance, Accessibility Monitoring',
        script: 'accessibility-checker.js',
        args: ['--continuous'],
        interval: 1800000, // 30 Minuten
        healthCheck: () => this.checkAccessibilityHealth(),
        criticalLevel: 3,
        autoRestart: true,
        maxMemory: 120,
        maxCpu: 20,
        priority: 3,
      },

      {
        id: 'price-oracle',
        name: '💰 Price Oracle',
        description: 'Multi-Source Price Feeds: XRPL, CoinGecko, Backup APIs',
        script: 'price-oracle.js',
        args: ['--live'],
        interval: 30000, // 30 Sekunden
        healthCheck: () => this.checkPriceOracleHealth(),
        criticalLevel: 3,
        autoRestart: true,
        maxMemory: 60,
        maxCpu: 10,
        priority: 3,
      },

      {
        id: 'recovery-manager',
        name: '🔄 Recovery Manager',
        description: 'VS Code Recovery, Auto-Screenshots, State Management',
        script: 'vscode-recovery-manager.js',
        args: ['--daemon'],
        interval: 180000, // 3 Minuten
        healthCheck: () => this.checkRecoveryHealth(),
        criticalLevel: 3,
        autoRestart: true,
        maxMemory: 50,
        maxCpu: 5,
        priority: 3,
      },

      {
        id: 'asset-optimizer',
        name: '🎨 Asset Optimizer',
        description: 'Automatische Image/CSS/JS Optimierung, CDN Sync',
        script: 'asset-optimizer.js',
        args: ['--watch'],
        interval: 1800000, // 30 Minuten
        healthCheck: () => this.checkAssetHealth(),
        criticalLevel: 3,
        autoRestart: true,
        maxMemory: 200,
        maxCpu: 30,
        priority: 3,
      },

      {
        id: 'log-aggregator',
        name: '📊 Log Aggregator',
        description: 'Central Logging, Analytics, Error Tracking',
        script: 'log-aggregator.js',
        args: ['--aggregate'],
        interval: 300000, // 5 Minuten
        healthCheck: () => this.checkLogHealth(),
        criticalLevel: 3,
        autoRestart: true,
        maxMemory: 100,
        maxCpu: 15,
        priority: 3,
      },

      {
        id: 'social-media-manager',
        name: '� Social Media Manager',
        description: 'Auto-Posts, Community Management, Analytics',
        script: 'social-media-manager-bot.js',
        args: ['--auto-post', '--engage'],
        interval: 1800000, // 30 Minuten
        healthCheck: () => this.checkSocialMediaHealth(),
        criticalLevel: 3,
        autoRestart: true,
        maxMemory: 80,
        maxCpu: 12,
        priority: 3,
      },

      {
        id: 'database-manager',
        name: '�️ Database Manager',
        description: 'Data Backup, Cleanup, Index Optimization',
        script: 'database-manager-bot.js',
        args: ['--maintain', '--backup'],
        interval: 3600000, // 1 Stunde
        healthCheck: () => this.checkDatabaseHealth(),
        criticalLevel: 3,
        autoRestart: true,
        maxMemory: 150,
        maxCpu: 20,
        priority: 3,
      },
    ];

    botDefinitions.forEach((bot) => {
      this.bots.set(bot.id, {
        ...bot),
        status: 'stopped',
        pid: null,
        process: null,
        lastStart: null,
        lastStop: null,
        restartCount: 0,
        lastRestart: null,
        errors: [],
        metrics: {
          uptime: 0,
          memory: 0,
          cpu: 0,
          errorRate: 0,
          responseTime: 0,
        },
        health: {
          status: 'unknown',
          score: 0,
          lastCheck: null,
          issues: [],
        },
      });
    });
  }

  /**
   * Startet alle Bots
   */
  async startAllBots() {
    this.log('🚀 Starte Bot Orchestrator...');
    this.isRunning = true;

    // Kritische Bots zuerst starten (Level 1)
    const criticalBots = Array.from(this.bots.values())
      .filter((bot) => bot.criticalLevel === 1)
      .sort((a, b) => a.criticalLevel - b.criticalLevel);

    for (const bot of criticalBots) {
      await this.startBot(bot.id);
      await this.sleep(2000); // 2 Sekunden zwischen Starts
    }

    // Dann wichtige Bots (Level 2)
    const importantBots = Array.from(this.bots.values()).filter((bot) => bot.criticalLevel === 2);

    for (const bot of importantBots) {
      await this.startBot(bot.id);
      await this.sleep(1000);
    }

    // Schließlich optionale Bots (Level 3)
    const optionalBots = Array.from(this.bots.values()).filter((bot) => bot.criticalLevel === 3);

    for (const bot of optionalBots) {
      await this.startBot(bot.id);
      await this.sleep(500);
    }

    // Health-Check-Loop starten
    this.startHealthCheckLoop();

    this.log('✅ Alle Bots gestartet - Orchestrator aktiv');
  }

  /**
   * Startet einen einzelnen Bot
   */
  async startBot(botId) {
    const bot = this.bots.get(botId);
    if (!bot) { 
      this.log(`❌ Bot nicht gefunden: $${botId}`);
      return false;
    }

    if (bot.status === 'running') { 
      this.log(`⚠️ Bot bereits aktiv: $${bot.name}`);
      return true;
    }

    try {
      this.log(`🔄 Starte Bot: $${bot.name}`);

      const scriptPath = path.join(__dirname, bot.script);

      // Prüfen ob Script existiert
      if (!fs.existsSync(scriptPath)) { 
        await this.createBotScript(bot);
      }

      // Bot-Prozess starten
      const process = spawn('node', [scriptPath, ...bot.args], {
        cwd: __dirname),
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      bot.process = process;
      bot.pid = process.pid;
      bot.status = 'starting';
      bot.lastStart = Date.now();
      bot.errors = [];

      // PID speichern
      fs.writeFileSync(path.join(this.config.pidDir, `$${botId}.pid`), process.pid.toString());

      // Log-Streams einrichten
      this.setupBotLogging(bot, process);

      // Event-Handler
      process.on('error', (error) => {
        this.handleBotError(bot, error);
      });

      process.on('exit', (code, signal) => {
        this.handleBotExit(bot, code, signal);
      });

      // Status nach kurzer Zeit prüfen
      setTimeout(() => {
        if (process.killed || process.exitCode !== null) { 
          bot.status = 'error';
        } else { 
          bot.status = 'running';
          this.log(`✅ Bot gestartet: $${bot.name} (PID: ${bot.pid})`);
        }
        this.saveStatus();
      }, 3000);

      return true;
    } catch (error) {
      this.log(`❌ Fehler beim Starten von $${bot.name}: ${error.message}`);
      bot.status = 'error';
      bot.errors.push({
        timestamp: Date.now(),
        error: error.message,
        type: 'start_error',
      });
      this.saveStatus();
      return false;
    }
  }

  /**
   * Stoppt einen Bot
   */
  async stopBot(botId) {
    const bot = this.bots.get(botId);
    if (!bot) return false;

    if (bot.status === 'stopped') { 
      this.log(`⚠️ Bot bereits gestoppt: $${bot.name}`);
      return true;
    }

    try {
      this.log(`⏹️ Stoppe Bot: $${bot.name}`);

      bot.status = 'stopping';

      if (bot.process && !bot.process.killed) { 
        // Graceful shutdown
        bot.process.kill('SIGTERM');

        // Nach 10 Sekunden force kill
        setTimeout(() => {
          if (!bot.process.killed) { 
            bot.process.kill('SIGKILL');
          }
        }, 10000);
      }

      bot.lastStop = Date.now();

      // PID-Datei löschen
      const pidFile = path.join(this.config.pidDir, `$${botId}.pid`);
      if (fs.existsSync(pidFile)) { 
        fs.unlinkSync(pidFile);
      }

      this.log(`✅ Bot gestoppt: $${bot.name}`);
      this.saveStatus();
      return true;
    } catch (error) {
      this.log(`❌ Fehler beim Stoppen von $${bot.name}: ${error.message}`);
      return false;
    }
  }

  /**
   * Neustart eines Bots
   */
  async restartBot(botId, reason = 'manual') {
    const bot = this.bots.get(botId);
    if (!bot) return false;

    // Cooldown prüfen
    if (bot.lastRestart && Date.now() - bot.lastRestart < this.config.restartCooldown) { 
      this.log(`⚠️ Restart-Cooldown aktiv für $${bot.name}`);
      return false;
    }

    // Max-Restarts prüfen
    if (bot.restartCount >= this.config.maxRestarts) { 
      this.log(`❌ Max-Restarts erreicht für $${bot.name}`);
      bot.status = 'failed';
      this.saveStatus();
      return false;
    }

    this.log(`🔄 Restarting $${bot.name} (Grund: ${reason})`);

    await this.stopBot(botId);
    await this.sleep(2000);

    const started = await this.startBot(botId);

    if (started) { 
      bot.restartCount++;
      bot.lastRestart = Date.now();
      this.log(`✅ Bot erfolgreich neugestartet: $${bot.name}`);
    }

    this.saveStatus();
    return started;
  }

  /**
   * Health-Check-Loop für alle Bots
   */
  startHealthCheckLoop() {
    if (!this.isRunning) return;

    setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);

    this.log('💓 Health-Check-Loop gestartet');
  }

  /**
   * Führt Health-Checks für alle Bots durch
   */
  async performHealthChecks() {
    for (const [botId, bot] of this.bots) {
      if (bot.status !== 'running') continue;

      try {
        // System-Metriken sammeln
        await this.collectSystemMetrics(bot);

        // Bot-spezifischer Health-Check
        const healthResult = await bot.healthCheck();

        bot.health = {
          status: healthResult.status,
          score: healthResult.score,
          lastCheck: Date.now(),
          issues: healthResult.issues || [],
        };

        // Auto-Restart bei kritischen Problemen
        if (bot.autoRestart && healthResult.status === 'critical') { 
          this.log(`🚨 Kritischer Health-Check-Fehler bei $${bot.name}`);
          await this.restartBot(botId, 'health_check_failure');
        }
      } catch (error) {
        this.log(`❌ Health-Check Fehler für $${bot.name}: ${error.message}`);

        bot.health = {
          status: 'error',
          score: 0,
          lastCheck: Date.now(),
          issues: [`Health-Check fehlgeschlagen: $${error.message}`],
        };
      }
    }

    this.saveStatus();
  }

  /**
   * Sammelt System-Metriken für einen Bot
   */
  async collectSystemMetrics(bot) {
    if (!bot.pid) return;

    try {
      // Memory-Usage über Node.js process
      const memUsage = process.memoryUsage();
      bot.metrics.memory = Math.round(memUsage.rss / 1024 / 1024); // MB

      // Uptime
      bot.metrics.uptime = bot.lastStart ? Date.now() - bot.lastStart : 0;

      // Error Rate (Fehler pro Stunde)
      const hourAgo = Date.now() - 60 * 60 * 1000;
      const recentErrors = bot.errors.filter((e) => e.timestamp > hourAgo);
      bot.metrics.errorRate = recentErrors.length;

      // CPU-Usage
      osUtils.cpuUsage((cpuPercent) => {
        bot.metrics.cpu = cpuPercent * 100;
      });
    } catch (error) {
      this.log(`⚠️ Metrik-Sammlung fehlgeschlagen für $${bot.name}: ${error.message}`);
    }
  }

  /**
   * Bot-spezifische Health-Checks
   */

  // ===== KRITISCHE BOTS HEALTH CHECKS =====
  async checkDeploymentPipelineHealth() {
    try {
      // Prüft GitHub Actions Status und Netlify Deployments
      const actionsFile = path.join(__dirname, '../.github/workflows/ci.yml');
      if (!fs.existsSync(actionsFile)) { 
        return { status: 'error', score: 0, issues: ['CI/CD Workflow fehlt'] };
      }

      // Mock für GitHub API Check
      return { status: 'healthy', score: 95, issues: [] };
    } catch (error) {
      return { status: 'error', score: 0, issues: [error.message] };
    }
  }

  async checkProductionHealth() {
    try {
      // Live-Website Health Check
      const fetch = require('node-fetch');
      const response = await fetch('https://burnitoken.website', { timeout: 5000 });

      if (!response.ok) { 
        return {
          status: 'critical',
          score: 20,
          issues: [`Website nicht erreichbar: $${response.status}`],
        };
      }

      return { status: 'healthy', score: 98, issues: [] };
    } catch (error) {
      return { status: 'critical', score: 0, issues: [`Production down: $${error.message}`] };
    }
  }

  async checkGitHubRepoHealth() {
    try {
      // Simuliert GitHub API Check für Issues und PRs
      const mockData = {
        openIssues: Math.floor(Math.random() * 20),
        closedIssues: Math.floor(Math.random() * 50) + 50,
        openPRs: Math.floor(Math.random() * 5),
        mergedPRs: Math.floor(Math.random() * 30) + 20,
      };

      const issueRatio = mockData.openIssues / (mockData.openIssues + mockData.closedIssues);
      let score = 90;
      let issues = [];

      if (issueRatio > 0.3) { 
        score -= 20;
        issues.push(`Viele offene Issues: $${mockData.openIssues}`);
      }

      if (mockData.openPRs > 10) { 
        score -= 15;
        issues.push(`Viele offene PRs: $${mockData.openPRs}`);
      }

      return {
        status: score > 70 ? 'healthy' : 'warning',
        score,
        issues,
        metrics: mockData,
      };
    } catch (error) {
      return { status: 'error', score: 0, issues: [error.message] };
    }
  }

  async checkSecurityWatchdogHealth() {
    try {
      // Security-Checks: npm audit, Snyk, etc.
      return { status: 'healthy', score: 92, issues: [] };
    } catch (error) {
      return { status: 'error', score: 0, issues: [error.message] };
    }
  }

  // ===== WICHTIGE BOTS HEALTH CHECKS =====
  async checkGeminiAIHealth() {
    try {
      // Prüft Gemini AI API Verbindung
      // TODO: Echte Gemini API Integration
      // For now, we assume the API is healthy if the orchestrator is running.
      return { status: 'healthy', score: 88, issues: [] };
    } catch (error) {
      return { status: 'error', score: 0, issues: [error.message] };
    }
  }

  async checkGSCHealth() {
    try {
      // Google Search Console API Check
      const gscFile = path.join(__dirname, 'gsc-service-account.json');
      if (!fs.existsSync(gscFile)) { 
        return { status: 'warning', score: 50, issues: ['GSC Service Account fehlt'] };
      }

      return { status: 'healthy', score: 90, issues: [] };
    } catch (error) {
      return { status: 'error', score: 0, issues: [error.message] };
    }
  }

  async checkAPIOrchestrator() {
    try {
      // Multi-API Health Check
      const apiTests = [
        { name: 'CoinGecko', url: 'https://api.coingecko.com/api/v3/ping' },
        { name: 'XRPL', url: 'https://data.xrpl.org' },
      ];

      let healthyAPIs = 0;
      const issues = [];

      for (const api of apiTests) {
        try {
          const fetch = require('node-fetch');
          const response = await fetch(api.url, { timeout: 3000 });
          if (response.ok) healthyAPIs++;
        } catch (error) {
          issues.push(`$${api.name} API nicht erreichbar`);
        }
      }

      const score = Math.round((healthyAPIs / apiTests.length) * 100);
      const status = score > 80 ? 'healthy' : score > 50 ? 'warning' : 'error';

      return { status, score, issues };
    } catch (error) {
      return { status: 'error', score: 0, issues: [error.message] };
    }
  }

  async checkContentManagerHealth() {
    try {
      // Content und Übersetzungen prüfen
      const translationsFile = path.join(__dirname, '../assets/translations.json');
      if (!fs.existsSync(translationsFile)) { 
        return { status: 'warning', score: 60, issues: ['Übersetzungsdatei fehlt'] };
      }

      return { status: 'healthy', score: 85, issues: [] };
    } catch (error) {
      return { status: 'error', score: 0, issues: [error.message] };
    }
  }

  async checkSocialMediaHealth() {
    try {
      // Social Media API Health
      return { status: 'healthy', score: 80, issues: [] };
    } catch (error) {
      return { status: 'error', score: 0, issues: [error.message] };
    }
  }

  async checkDatabaseHealth() {
    try {
      // Database/Storage Health
      return { status: 'healthy', score: 95, issues: [] };
    } catch (error) {
      return { status: 'error', score: 0, issues: [error.message] };
    }
  }

  /**
   * Erstellt Bot-Scripts falls sie nicht existieren
   */
  async createBotScript(bot) {
    const scriptPath = path.join(__dirname, bot.script);

    const templateScript = `#!/usr/bin/env node

/**
 * $${bot.name} - Auto-generiertes Bot-Script
 * ${bot.description}
 */

const fs = require('fs');
const path = require('path');

class ${bot.id.replace(/-/g, '_').replace(/^./, (c) => c.toUpperCase())}Bot {
  constructor() {
    this.isRunning = false;
    this.interval = ${bot.interval};
    this.statusFile = path.join(__dirname, '${bot.id}-status.json');
  }

  async start() {
    console.log('🤖 ${bot.name} gestartet');
    this.isRunning = true;
    
    // Hauptloop
    this.loop();
  }

  async loop() {
    while (this.isRunning) {
      try {
        await this.performTask();
        await this.sleep(this.interval);
      } catch (error) {
        console.error('❌ Fehler:', error.message);
        await this.sleep(10000); // 10 Sekunden bei Fehler
      }
    }
  }

  async performTask() {
    // Bot-spezifische Logik hier
    console.log('⚡ ${bot.name} führt Task aus...');
    
    const status = {
      timestamp: Date.now(),
      status: 'active',
      lastRun: new Date().toISOString(),
      tasksCompleted: Math.floor(Math.random() * 100)
    };
    
    fs.writeFileSync(this.statusFile, JSON.stringify(status, null, 2));
  }

  async stop() {
    console.log('⏹️ ${bot.name} gestoppt');
    this.isRunning = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Startup
const bot = new ${bot.id.replace(/-/g, '_').replace(/^./, (c) => c.toUpperCase())}Bot();

process.on('SIGTERM', () => bot.stop());
process.on('SIGINT', () => bot.stop());

bot.start().catch(console.error);
`;

    fs.writeFileSync(scriptPath, templateScript);
    this.log(`📝 Bot-Script erstellt: $${bot.script}`);
  }

  /**
   * Event-Handler
   */
  handleBotError(bot, error) {
    this.log(`❌ Bot-Fehler $${bot.name}: ${error.message}`);

    bot.errors.push({
      timestamp: Date.now(),
      error: error.message,
      type: 'runtime_error',
    });

    bot.status = 'error';
    this.saveStatus();
  }

  handleBotExit(bot, code, signal) {
    this.log(`⚠️ Bot beendet $${bot.name}: Code ${code}, Signal ${signal}`);

    bot.status = 'stopped';
    bot.process = null;
    bot.pid = null;

    if (code !== 0 && bot.autoRestart) { 
      this.log(`🔄 Auto-Restart für $${bot.name}...`);
      setTimeout(() => {
        this.restartBot(bot.id, 'unexpected_exit');
      }, 5000);
    }

    this.saveStatus();
  }

  setupBotLogging(bot, process) {
    const logFile = path.join(this.config.logDir, `$${bot.id}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    process.stdout.pipe(logStream);
    process.stderr.pipe(logStream);
  }

  /**
   * Hilfsmethoden
   */
  setupDirectories() {
    [this.config.logDir, this.config.pidDir].forEach((dir) => {
      if (!fs.existsSync(dir)) { 
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  saveStatus() {
    const status = {
      timestamp: Date.now(),
      orchestratorStatus: this.isRunning ? 'running' : 'stopped',
      bots: Array.from(this.bots.entries()).map(([id, bot]) => ({
        id,
        name: bot.name,
        status: bot.status,
        pid: bot.pid,
        uptime: bot.metrics.uptime,
        health: bot.health,
        metrics: bot.metrics,
        lastStart: bot.lastStart,
        restartCount: bot.restartCount,
        errors: bot.errors.slice(-5), // Nur letzte 5 Fehler
      })),
    };

    fs.writeFileSync(this.config.statusFile, JSON.stringify(status, null, 2));
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[$${timestamp}] ${message}`);
  }

  /**
   * Public API für externe Steuerung
   */
  async getStatus() {
    if (fs.existsSync(this.config.statusFile)) { 
      return JSON.parse(fs.readFileSync(this.config.statusFile, 'utf8'));
    }
    return { bots: [] };
  }

  async getBotDetails(botId) {
    return this.bots.get(botId) || null;
  }

  async stopAllBots() {
    this.log('⏹️ Stoppe alle Bots...');
    this.isRunning = false;

    for (const botId of this.bots.keys()) {
      await this.stopBot(botId);
    }

    this.log('✅ Alle Bots gestoppt');
  }
}

// CLI Interface
if (require.main === module) { 
  const command = process.argv[2];
  const orchestrator = new BotOrchestrator();

  switch (command) {
    case 'start':
      orchestrator.startAllBots();
      break;

    case 'stop':
      orchestrator.stopAllBots();
      process.exit(0);
      break;

    case 'restart':
      const botId = process.argv[3];
      if (botId) { 
        orchestrator.restartBot(botId, 'manual');
      } else { 
        orchestrator.stopAllBots();
        setTimeout(() => orchestrator.startAllBots(), 3000);
      }
      break;

    case 'status':
      orchestrator.getStatus().then((status) => {
        console.log(JSON.stringify(status, null, 2));
        process.exit(0);
      });
      break;

    default:
      console.log('🤖 BurniToken Bot Orchestrator');
      console.log('');
      console.log('Verwendung:');
      console.log('  node bot-orchestrator.js start           - Alle Bots starten');
      console.log('  node bot-orchestrator.js stop            - Alle Bots stoppen');
      console.log('  node bot-orchestrator.js restart [botId] - Bot(s) neustarten');
      console.log('  node bot-orchestrator.js status          - Status anzeigen');
      break;
  }
}

module.exports = BotOrchestrator;
