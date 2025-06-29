#!/usr/bin/env node

/**
 * SSL Certificate Monitoring Scheduler
 * Schedules regular SSL certificate health checks and reports critical issues
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class SSLMonitoringScheduler {
  constructor() {
    this.checkInterval = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    this.alertThreshold = 30; // Alert when certificate expires within 30 days
    this.logFile = path.join(__dirname, '..', 'ssl-monitoring.log');
    this.isRunning = false;
  }

  /**
   * Start the SSL monitoring scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  SSL monitoring scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting SSL Certificate Monitoring Scheduler');
    console.log(`⏰ Check interval: ${this.checkInterval / (60 * 60 * 1000)} hours`);
    console.log(`📄 Log file: ${this.logFile}`);

    // Initial check
    this.performHealthCheck();

    // Schedule regular checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
    });

    process.on('SIGTERM', () => {
      this.stop();
    });
  }

  /**
   * Stop the SSL monitoring scheduler
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('\n🛑 Stopping SSL Certificate Monitoring Scheduler');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.isRunning = false;
    process.exit(0);
  }

  /**
   * Perform health check and log results
   */
  performHealthCheck() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 Running SSL health check at ${timestamp}`);

    exec('node tools/website-health-check.js', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      const logEntry = {
        timestamp,
        success: !error,
        output: stdout,
        errors: stderr
      };

      // Parse output for critical SSL errors
      const criticalErrors = this.parseCriticalErrors(stdout, stderr);
      
      if (criticalErrors.length > 0) {
        console.error('🚨 CRITICAL SSL ERRORS DETECTED:');
        criticalErrors.forEach(err => {
          console.error(`   ❌ ${err.errorCode}: ${err.details}`);
          console.error(`   🔗 URL: ${err.url}`);
        });
        
        logEntry.criticalErrors = criticalErrors;
        
        // In a real implementation, you would send alerts here
        this.sendAlert(criticalErrors);
      } else {
        console.log('✅ SSL health check completed successfully');
      }

      // Log to file
      this.logToFile(logEntry);
    });
  }

  /**
   * Parse critical errors from health check output
   * @param {string} stdout - Standard output
   * @param {string} stderr - Standard error
   * @returns {Array} Array of critical errors
   */
  parseCriticalErrors(stdout, stderr) {
    const errors = [];
    const output = stdout + stderr;

    // Look for SSL certificate expiration errors
    const lines = output.split('\n');
    let currentError = null;

    lines.forEach(line => {
      try {
        // Try to parse JSON error objects
        if (line.trim().startsWith('{') && line.includes('E_SSL_CERT_EXPIRED')) {
          const errorObj = JSON.parse(line.trim());
          if (errorObj.errorCode === 'E_SSL_CERT_EXPIRED') {
            errors.push(errorObj);
          }
        }
      } catch (e) {
        // Not a JSON line, continue
      }

      // Also check for direct error messages
      if (line.includes('SSL certificate expired') || line.includes('E_SSL_CERT_EXPIRED')) {
        // Extract error information from log line if possible
      }
    });

    return errors;
  }

  /**
   * Send alert for critical SSL errors
   * @param {Array} errors - Array of critical errors
   */
  sendAlert(errors) {
    console.log('📧 Sending SSL alert notifications...');
    
    // In a real implementation, this would:
    // - Send email notifications
    // - Post to Slack/Teams
    // - Create GitHub issues
    // - Send webhooks to monitoring systems
    
    errors.forEach(error => {
      console.log(`🚨 ALERT: ${error.errorCode} for ${error.url}`);
      console.log(`   Details: ${error.details}`);
      console.log(`   Time: ${error.timestamp}`);
    });
  }

  /**
   * Log health check results to file
   * @param {Object} logEntry - Log entry to write
   */
  logToFile(logEntry) {
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFile(this.logFile, logLine, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err.message);
      }
    });
  }

  /**
   * Get recent log entries
   * @param {number} hours - Number of hours to look back
   * @returns {Array} Array of log entries
   */
  getRecentLogs(hours = 24) {
    if (!fs.existsSync(this.logFile)) {
      return [];
    }

    const content = fs.readFileSync(this.logFile, 'utf8');
    const lines = content.trim().split('\n');
    const entries = [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    lines.forEach(line => {
      if (line.trim()) {
        try {
          const entry = JSON.parse(line);
          if (new Date(entry.timestamp) >= cutoffTime) {
            entries.push(entry);
          }
        } catch (e) {
          // Invalid JSON line, skip
        }
      }
    });

    return entries;
  }

  /**
   * Generate monitoring report
   */
  generateReport() {
    const recentLogs = this.getRecentLogs(24);
    const criticalErrors = recentLogs.filter(log => log.criticalErrors && log.criticalErrors.length > 0);
    
    console.log('\n📊 SSL MONITORING REPORT (Last 24 hours)');
    console.log('='.repeat(50));
    console.log(`Total checks: ${recentLogs.length}`);
    console.log(`Successful checks: ${recentLogs.filter(log => log.success).length}`);
    console.log(`Failed checks: ${recentLogs.filter(log => !log.success).length}`);
    console.log(`Critical SSL errors: ${criticalErrors.length}`);

    if (criticalErrors.length > 0) {
      console.log('\n🚨 Recent Critical Errors:');
      criticalErrors.forEach((log, index) => {
        console.log(`${index + 1}. ${log.timestamp}`);
        log.criticalErrors.forEach(error => {
          console.log(`   ❌ ${error.errorCode}: ${error.details}`);
        });
      });
    }

    return {
      totalChecks: recentLogs.length,
      successfulChecks: recentLogs.filter(log => log.success).length,
      failedChecks: recentLogs.filter(log => !log.success).length,
      criticalErrors: criticalErrors.length,
      recentErrors: criticalErrors
    };
  }
}

// Main execution
function main() {
  const scheduler = new SSLMonitoringScheduler();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--report')) {
    scheduler.generateReport();
  } else if (args.includes('--check-once')) {
    scheduler.performHealthCheck();
  } else {
    scheduler.start();
  }
}

// Export for testing
module.exports = { SSLMonitoringScheduler };

// Run if called directly
if (require.main === module) {
  main();
}