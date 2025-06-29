#!/usr/bin/env node

/**
 * Automated Website Health Monitoring System
 * Runs periodic health checks and creates automated issue reports
 * for SSL connection timeouts and other critical website issues
 */

const WebsiteHealthChecker = require('./website-health-checker');
const fs = require('fs');
const path = require('path');

class AutomatedHealthMonitor {
  constructor() {
    this.healthChecker = new WebsiteHealthChecker();
    this.monitoringInterval = 5 * 60 * 1000; // 5 minutes
    this.logDirectory = path.join(__dirname, 'logs');
    this.isRunning = false;
    this.intervalId = null;
    
    // Ensure log directory exists
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  /**
   * Start automated monitoring
   */
  async startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring ist bereits aktiv');
      return;
    }

    console.log('🤖 Automatisches Website Health Monitoring gestartet');
    console.log(`📅 Intervall: ${this.monitoringInterval / 1000 / 60} Minuten`);
    console.log(`📁 Log-Verzeichnis: ${this.logDirectory}`);
    console.log('='.repeat(60));

    this.isRunning = true;

    // Initial check
    await this.performMonitoringCheck();

    // Schedule periodic checks
    this.intervalId = setInterval(async () => {
      await this.performMonitoringCheck();
    }, this.monitoringInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n⏹️  Stopping automated monitoring...');
      this.stopMonitoring();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.stopMonitoring();
      process.exit(0);
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('✅ Automated monitoring gestoppt');
  }

  /**
   * Perform a single monitoring check
   */
  async performMonitoringCheck() {
    const timestamp = new Date().toISOString();
    
    try {
      console.log(`\n🕐 ${new Date().toLocaleString('de-DE')} - Automatischer Health Check`);
      console.log('-'.repeat(50));

      const results = await this.healthChecker.performHealthCheck();
      
      await this.analyzeAndReport(results, timestamp);
      
    } catch (error) {
      console.error(`❌ Monitoring Fehler: ${error.message}`);
      await this.logSystemError(error, timestamp);
    }
  }

  /**
   * Analyze results and create reports for critical issues
   */
  async analyzeAndReport(results, timestamp) {
    const criticalIssues = results.filter(r => r.critical);
    const sslTimeouts = results.filter(r => r.ssl?.status === 'SSL_TIMEOUT');
    
    if (criticalIssues.length > 0) {
      console.log(`🚨 ${criticalIssues.length} kritische Problem(e) erkannt`);
      
      for (const issue of criticalIssues) {
        await this.createAutomatedIssueReport(issue, timestamp);
      }
    } else {
      console.log('✅ Alle Domains sind gesund');
    }

    // Create summary report
    await this.createSummaryReport(results, timestamp);

    // Special handling for SSL timeouts
    if (sslTimeouts.length > 0) {
      await this.createSSLTimeoutAlert(sslTimeouts, timestamp);
    }
  }

  /**
   * Create automated issue report in the format from the GitHub issue
   */
  async createAutomatedIssueReport(issue, timestamp) {
    const reportData = {
      details: "Ein kritischer Fehler wurde im Health Check Skript festgestellt. Bitte sofort untersuchen.",
      originalMessage: issue.ssl?.error || issue.error || `Critical error for ${issue.domain}`,
      timestamp,
      logFile: path.join(this.logDirectory, 'website-health.log'),
      domain: issue.domain,
      errorType: issue.ssl?.status || 'UNKNOWN_ERROR',
      automated: true,
      systemGenerated: true
    };

    // Log to main health log file
    const logEntry = `${timestamp} [AUTOMATED_ALERT] ${JSON.stringify(reportData)}\n`;
    const healthLogFile = path.join(this.logDirectory, 'website-health.log');
    
    try {
      await fs.promises.appendFile(healthLogFile, logEntry);
      
      // Create individual issue report file
      const issueFileName = `issue-report-${issue.domain}-${timestamp.replace(/[:.]/g, '-')}.json`;
      const issueReportFile = path.join(this.logDirectory, issueFileName);
      
      await fs.promises.writeFile(issueReportFile, JSON.stringify({
        issueTitle: `🤖 [Automatisch gemeldet] Website Health Check Error: ${issue.ssl?.error || issue.error}`,
        issueDescription: {
          fehlerdetails: reportData,
          kontext: "Dieser Fehler wurde vom automatisierten System-Monitoring erkannt. Bitte untersuchen Sie die Ursache und beheben Sie das Problem.",
          automaticGeneration: "Dieses Issue wurde automatisch vom System-Monitoring erstellt."
        },
        rawData: issue
      }, null, 2));

      console.log(`🔴 Automatischer Issue-Report erstellt: ${issueReportFile}`);
      
    } catch (error) {
      console.error(`❌ Fehler beim Erstellen des Issue-Reports: ${error.message}`);
    }
  }

  /**
   * Create SSL timeout specific alert
   */
  async createSSLTimeoutAlert(sslTimeouts, timestamp) {
    const alertData = {
      alertType: 'SSL_CONNECTION_TIMEOUT',
      timestamp,
      affectedDomains: sslTimeouts.map(t => t.domain),
      count: sslTimeouts.length,
      details: sslTimeouts.map(t => ({
        domain: t.domain,
        error: t.ssl.error,
        duration: t.ssl.duration,
        timeout: t.ssl.timeout
      })),
      recommendations: [
        'SSL-Zertifikate auf Gültigkeit überprüfen',
        'DNS-Konfiguration validieren',
        'Server-Performance analysieren',
        'CDN-Status überprüfen (falls verwendet)'
      ]
    };

    const alertFile = path.join(this.logDirectory, `ssl-timeout-alert-${timestamp.replace(/[:.]/g, '-')}.json`);
    
    try {
      await fs.promises.writeFile(alertFile, JSON.stringify(alertData, null, 2));
      console.log(`⚠️  SSL-Timeout Alert erstellt: ${alertFile}`);
    } catch (error) {
      console.error(`❌ Fehler beim Erstellen des SSL-Timeout Alerts: ${error.message}`);
    }
  }

  /**
   * Create summary report
   */
  async createSummaryReport(results, timestamp) {
    const summary = {
      timestamp,
      totalDomains: results.length,
      healthyDomains: results.filter(r => !r.critical).length,
      criticalDomains: results.filter(r => r.critical).length,
      sslTimeouts: results.filter(r => r.ssl?.status === 'SSL_TIMEOUT').length,
      dnsFailures: results.filter(r => r.dns?.status !== 'OK').length,
      httpsFailures: results.filter(r => r.https?.status !== 'OK').length,
      overallHealth: results.filter(r => !r.critical).length / results.length * 100,
      details: results
    };

    const summaryFile = path.join(this.logDirectory, `monitoring-summary-${timestamp.replace(/[:.]/g, '-')}.json`);
    
    try {
      await fs.promises.writeFile(summaryFile, JSON.stringify(summary, null, 2));
      
      // Also log to main log for tracking
      const logEntry = `${timestamp} [SUMMARY] Health: ${summary.overallHealth.toFixed(1)}% | Critical: ${summary.criticalDomains} | SSL Timeouts: ${summary.sslTimeouts}\n`;
      const healthLogFile = path.join(this.logDirectory, 'website-health.log');
      await fs.promises.appendFile(healthLogFile, logEntry);
      
    } catch (error) {
      console.error(`❌ Fehler beim Erstellen des Summary Reports: ${error.message}`);
    }
  }

  /**
   * Log system errors
   */
  async logSystemError(error, timestamp) {
    const errorData = {
      timestamp,
      errorType: 'SYSTEM_ERROR',
      message: error.message,
      stack: error.stack,
      details: "System error in automated health monitoring"
    };

    const logEntry = `${timestamp} [SYSTEM_ERROR] ${JSON.stringify(errorData)}\n`;
    const healthLogFile = path.join(this.logDirectory, 'website-health.log');
    
    try {
      await fs.promises.appendFile(healthLogFile, logEntry);
    } catch (logError) {
      console.error(`❌ Kritischer Fehler beim Logging: ${logError.message}`);
    }
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: this.monitoringInterval,
      logDirectory: this.logDirectory,
      startTime: this.startTime
    };
  }

  /**
   * Run a single check (for CLI usage)
   */
  async runSingleCheck() {
    console.log('🔍 Einzelner Health Check wird ausgeführt...');
    await this.performMonitoringCheck();
    console.log('✅ Einzelner Health Check abgeschlossen');
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new AutomatedHealthMonitor();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--single') || args.includes('-s')) {
    // Run single check
    monitor.runSingleCheck()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('❌ Single check failed:', error.message);
        process.exit(1);
      });
  } else {
    // Start continuous monitoring
    monitor.startMonitoring()
      .catch(error => {
        console.error('❌ Monitoring failed:', error.message);
        process.exit(1);
      });
  }
}

module.exports = AutomatedHealthMonitor;