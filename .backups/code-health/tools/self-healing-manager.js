#!/usr/bin/env node

/**
 * Self-Healing Manager v4.0 - Enterprise-Grade System Recovery
 *
 * Automatisches Self-Healing System für BurniToken Enterprise Infrastructure
 * - Kontinuierliche Health-Checks aller kritischen Systeme
 * - Automatische Recovery bei Ausfällen
 * - Zero-Downtime Healing
 * - Enterprise-Grade Monitoring & Alerting
 *
 * @version 4.0.0
 * @date 2025-06-29T23:30:00 (Recovery from crash)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class SelfHealingManager {
  constructor() {
    this.healingInterval = 30000; // 30 seconds
    this.criticalServices = [
      'github-actions',
      'monitoring-services',
      'security-hardening',
      'seo-automation',
      'price-oracle',
      'backup-system',
      'disaster-recovery',
    ];

    this.healthMetrics = new Map();
    this.isHealing = false;
    this.healingAttempts = 0;
    this.maxHealingAttempts = 3;

    this.initializeLogging();
    this.loadHealthState();

    console.log('🛡️ Self-Healing Manager v4.0 initialized (Recovery Mode)');
  }

  /**
   * Initialize logging system
   */
  initializeLogging() {
    this.logFile = path.join(__dirname, '../.logs/self-healing.log');

    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Load previous health state if available
   */
  loadHealthState() {
    const stateFile = path.join(__dirname, '../.recovery-data/health-state.json');

    try {
      if (fs.existsSync(stateFile)) {
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        this.healthMetrics = new Map(Object.entries(state.healthMetrics || {}));
        console.log('✅ Health state loaded from previous session');
      }
    } catch (error) {
      console.warn('⚠️ Could not load previous health state:', error.message);
    }
  }

  /**
   * Save current health state
   */
  saveHealthState() {
    const stateFile = path.join(__dirname, '../.recovery-data/health-state.json');
    const stateDir = path.dirname(stateFile);

    try {
      if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
      }

      const state = {
        timestamp: new Date().toISOString(),
        healthMetrics: Object.fromEntries(this.healthMetrics),
        healingAttempts: this.healingAttempts,
      };

      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('❌ Failed to save health state:', error.message);
    }
  }

  /**
   * Log with timestamp
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    console.log(logEntry);

    try {
      fs.appendFileSync(this.logFile, logEntry + '\n');

      if (data) {
        fs.appendFileSync(this.logFile, JSON.stringify(data, null, 2) + '\n');
      }
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Check health of all critical services
   */
  async checkSystemHealth() {
    this.log('info', '🔍 Starting comprehensive system health check...');

    const healthResults = {};

    for (const service of this.criticalServices) {
      try {
        const health = await this.checkServiceHealth(service);
        healthResults[service] = health;
        this.healthMetrics.set(service, health);

        if (!health.healthy) {
          this.log('warn', `⚠️ Service ${service} is unhealthy`, health);
        }
      } catch (error) {
        this.log('error', `❌ Failed to check health for ${service}`, { error: error.message });
        healthResults[service] = { healthy: false, error: error.message };
      }
    }

    const overallHealth = this.calculateOverallHealth(healthResults);
    this.log(
      'info',
      `📊 Overall system health: ${overallHealth.healthy ? '✅ HEALTHY' : '🚨 UNHEALTHY'}`,
      overallHealth,
    );

    if (!overallHealth.healthy) {
      await this.triggerHealing(healthResults);
    }

    this.saveHealthState();
    return healthResults;
  }

  /**
   * Check health of individual service
   */
  async checkServiceHealth(service) {
    switch (service) {
      case 'github-actions':
        return this.checkGitHubActionsHealth();
      case 'monitoring-services':
        return this.checkMonitoringHealth();
      case 'security-hardening':
        return this.checkSecurityHealth();
      case 'seo-automation':
        return this.checkSEOHealth();
      case 'price-oracle':
        return this.checkPriceOracleHealth();
      case 'backup-system':
        return this.checkBackupSystemHealth();
      case 'disaster-recovery':
        return this.checkDisasterRecoveryHealth();
      default:
        return { healthy: false, error: `Unknown service: ${service}` };
    }
  }

  /**
   * Check GitHub Actions health
   */
  checkGitHubActionsHealth() {
    const workflowsDir = path.join(__dirname, '../.github/workflows');
    const requiredWorkflows = [
      'backup.yml',
      'health-check.yml',
      'seo-monitor.yml',
      'web-vitals-check.yml',
      'disaster-recovery-test.yml',
    ];

    const missingWorkflows = [];

    for (const workflow of requiredWorkflows) {
      if (!fs.existsSync(path.join(workflowsDir, workflow))) {
        missingWorkflows.push(workflow);
      }
    }

    return {
      healthy: missingWorkflows.length === 0,
      missingWorkflows,
      totalWorkflows: requiredWorkflows.length,
      existingWorkflows: requiredWorkflows.length - missingWorkflows.length,
    };
  }

  /**
   * Check monitoring services health
   */
  checkMonitoringHealth() {
    const monitoringScript = path.join(__dirname, '../assets/js/monitoring-services.js');

    return {
      healthy: fs.existsSync(monitoringScript),
      scriptExists: fs.existsSync(monitoringScript),
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Check security hardening health
   */
  checkSecurityHealth() {
    const securityScript = path.join(__dirname, '../assets/js/security-hardening.js');
    const securityReportsDir = path.join(__dirname, '../.security-reports');

    return {
      healthy: fs.existsSync(securityScript),
      scriptExists: fs.existsSync(securityScript),
      reportsDirectoryExists: fs.existsSync(securityReportsDir),
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Check SEO automation health
   */
  checkSEOHealth() {
    const seoScript = path.join(__dirname, '../assets/js/seo-automation.js');
    const sitemapExists = fs.existsSync(path.join(__dirname, '../sitemap.xml'));

    return {
      healthy: fs.existsSync(seoScript) && sitemapExists,
      scriptExists: fs.existsSync(seoScript),
      sitemapExists,
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Check price oracle health
   */
  checkPriceOracleHealth() {
    const oracleScript = path.join(__dirname, '../assets/js/price-oracle.js');

    return {
      healthy: fs.existsSync(oracleScript),
      scriptExists: fs.existsSync(oracleScript),
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Check backup system health
   */
  checkBackupSystemHealth() {
    const backupWorkflow = path.join(__dirname, '../.github/workflows/backup.yml');
    const backupDir = path.join(__dirname, '../.backup');

    return {
      healthy: fs.existsSync(backupWorkflow),
      workflowExists: fs.existsSync(backupWorkflow),
      backupDirectoryExists: fs.existsSync(backupDir),
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Check disaster recovery health
   */
  checkDisasterRecoveryHealth() {
    const recoveryWorkflow = path.join(
      __dirname,
      '../.github/workflows/disaster-recovery-test.yml',
    );
    const recoveryDataDir = path.join(__dirname, '../.recovery-data');

    return {
      healthy: fs.existsSync(recoveryWorkflow),
      workflowExists: fs.existsSync(recoveryWorkflow),
      recoveryDataExists: fs.existsSync(recoveryDataDir),
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Calculate overall system health
   */
  calculateOverallHealth(healthResults) {
    const services = Object.keys(healthResults);
    const healthyServices = services.filter((service) => healthResults[service].healthy);
    const healthPercentage = (healthyServices.length / services.length) * 100;

    return {
      healthy: healthPercentage >= 80, // 80% threshold
      healthPercentage,
      totalServices: services.length,
      healthyServices: healthyServices.length,
      unhealthyServices: services.length - healthyServices.length,
      details: healthResults,
    };
  }

  /**
   * Trigger healing process
   */
  async triggerHealing(healthResults) {
    if (this.isHealing) {
      this.log('warn', '⚠️ Healing already in progress, skipping...');
      return;
    }

    this.isHealing = true;
    this.healingAttempts++;

    this.log(
      'info',
      `🔧 Starting healing process (attempt ${this.healingAttempts}/${this.maxHealingAttempts})...`,
    );

    try {
      for (const [service, health] of Object.entries(healthResults)) {
        if (!health.healthy) {
          await this.healService(service, health);
        }
      }

      this.log('info', '✅ Healing process completed');
    } catch (error) {
      this.log('error', '❌ Healing process failed', { error: error.message });
    } finally {
      this.isHealing = false;
    }
  }

  /**
   * Heal individual service
   */
  async healService(service, health) {
    this.log('info', `🔧 Healing service: ${service}`);

    switch (service) {
      case 'github-actions':
        await this.healGitHubActions(health);
        break;
      case 'monitoring-services':
        await this.healMonitoringServices(health);
        break;
      case 'security-hardening':
        await this.healSecurityHardening(health);
        break;
      case 'seo-automation':
        await this.healSEOAutomation(health);
        break;
      case 'price-oracle':
        await this.healPriceOracle(health);
        break;
      case 'backup-system':
        await this.healBackupSystem(health);
        break;
      case 'disaster-recovery':
        await this.healDisasterRecovery(health);
        break;
    }
  }

  /**
   * Heal GitHub Actions workflows
   */
  async healGitHubActions(health) {
    if (health.missingWorkflows && health.missingWorkflows.length > 0) {
      this.log('info', `🔧 Recreating missing workflows: ${health.missingWorkflows.join(', ')}`);

      // Trigger workflow recreation
      try {
        execSync('node tools/recovery-center.js --restore-workflows', {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
        });
        this.log('info', '✅ GitHub Actions workflows restored');
      } catch (error) {
        this.log('error', '❌ Failed to restore workflows', { error: error.message });
      }
    }
  }

  /**
   * Heal monitoring services
   */
  async healMonitoringServices(health) {
    if (!health.scriptExists) {
      this.log('info', '🔧 Recreating monitoring services script');
      try {
        execSync('node tools/recovery-center.js --restore-monitoring', {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
        });
        this.log('info', '✅ Monitoring services restored');
      } catch (error) {
        this.log('error', '❌ Failed to restore monitoring services', { error: error.message });
      }
    }
  }

  /**
   * Heal security hardening
   */
  async healSecurityHardening(health) {
    if (!health.scriptExists) {
      this.log('info', '🔧 Recreating security hardening script');
      try {
        execSync('node tools/recovery-center.js --restore-security', {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
        });
        this.log('info', '✅ Security hardening restored');
      } catch (error) {
        this.log('error', '❌ Failed to restore security hardening', { error: error.message });
      }
    }
  }

  /**
   * Heal SEO automation
   */
  async healSEOAutomation(health) {
    if (!health.scriptExists || !health.sitemapExists) {
      this.log('info', '🔧 Recreating SEO automation components');
      try {
        execSync('node tools/recovery-center.js --restore-seo', {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
        });
        this.log('info', '✅ SEO automation restored');
      } catch (error) {
        this.log('error', '❌ Failed to restore SEO automation', { error: error.message });
      }
    }
  }

  /**
   * Heal price oracle
   */
  async healPriceOracle(health) {
    if (!health.scriptExists) {
      this.log('info', '🔧 Recreating price oracle script');
      try {
        execSync('node tools/recovery-center.js --restore-price-oracle', {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
        });
        this.log('info', '✅ Price oracle restored');
      } catch (error) {
        this.log('error', '❌ Failed to restore price oracle', { error: error.message });
      }
    }
  }

  /**
   * Heal backup system
   */
  async healBackupSystem(health) {
    if (!health.workflowExists) {
      this.log('info', '🔧 Recreating backup system workflow');
      try {
        execSync('node tools/recovery-center.js --restore-backup', {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
        });
        this.log('info', '✅ Backup system restored');
      } catch (error) {
        this.log('error', '❌ Failed to restore backup system', { error: error.message });
      }
    }
  }

  /**
   * Heal disaster recovery
   */
  async healDisasterRecovery(health) {
    if (!health.workflowExists) {
      this.log('info', '🔧 Recreating disaster recovery workflow');
      try {
        execSync('node tools/recovery-center.js --restore-disaster-recovery', {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
        });
        this.log('info', '✅ Disaster recovery restored');
      } catch (error) {
        this.log('error', '❌ Failed to restore disaster recovery', { error: error.message });
      }
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    this.log('info', '🚀 Starting continuous health monitoring...');

    // Initial health check
    this.checkSystemHealth();

    // Set up interval monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkSystemHealth();
    }, this.healingInterval);

    // Set up process handlers
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  /**
   * Stop monitoring and cleanup
   */
  shutdown() {
    this.log('info', '🛑 Shutting down Self-Healing Manager...');

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.saveHealthState();

    this.log('info', '✅ Self-Healing Manager stopped gracefully');
    process.exit(0);
  }

  /**
   * Generate health report
   */
  async generateHealthReport() {
    const healthResults = await this.checkSystemHealth();
    const overallHealth = this.calculateOverallHealth(healthResults);

    const report = {
      timestamp: new Date().toISOString(),
      overallHealth,
      serviceDetails: healthResults,
      healingAttempts: this.healingAttempts,
      isHealing: this.isHealing,
    };

    const reportFile = path.join(__dirname, '../.reports/health-report.json');
    const reportDir = path.dirname(reportFile);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    this.log('info', '📊 Health report generated', report);
    return report;
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new SelfHealingManager();

  const args = process.argv.slice(2);

  if (args.includes('--emergency-recovery')) {
    console.log('🚨 EMERGENCY RECOVERY MODE ACTIVATED!');
    manager.generateHealthReport().then(() => {
      manager.startMonitoring();
    });
  } else if (args.includes('--check')) {
    manager.checkSystemHealth().then(() => {
      console.log('✅ Health check completed');
      process.exit(0);
    });
  } else if (args.includes('--report')) {
    manager.generateHealthReport().then(() => {
      console.log('✅ Health report generated');
      process.exit(0);
    });
  } else {
    // Default: start monitoring
    manager.startMonitoring();
  }
}

module.exports = SelfHealingManager;
