#!/usr/bin/env node

/**
 * 🔄 AUTOMATED WEBSITE HEALTH MONITORING
 * Integriert Website Health Checks in das bestehende Monitoring-System
 * Läuft periodisch und erkennt kritische SSL-Probleme automatisch
 */

const WebsiteHealthChecker = require('./website-health-check.js');
const fs = require('fs');

class AutomatedHealthMonitor {
  constructor() {
    this.checkInterval = 60 * 60 * 1000; // 1 Stunde
    this.isRunning = false;
    this.monitoringInterval = null;
  }

  /**
   * Startet das automatische Monitoring
   */
  startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️ Monitoring already running!');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Automated Website Health Monitoring...');
    console.log(`🔄 Checking every ${this.checkInterval / 1000 / 60} minutes`);
    console.log('💡 Press Ctrl+C to stop monitoring\n');

    // Initial check
    this.runHealthCheck();

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      if (!this.isRunning) return;
      this.runHealthCheck();
    }, this.checkInterval);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping automated health monitoring...');
      this.stopMonitoring();
      process.exit(0);
    });
  }

  /**
   * Führt einen Health Check aus
   */
  async runHealthCheck() {
    try {
      console.log(`\n🕐 ${new Date().toLocaleString('de-DE')} - Running Health Check`);
      console.log('='.repeat(60));

      const checker = new WebsiteHealthChecker();
      await checker.runHealthChecks();

      // Prüfe auf kritische Probleme
      const criticalIssues = checker.alerts.filter(alert => 
        alert.errorCode === 'E_SSL_CERT_EXPIRED' || 
        alert.errorCode === 'E_SSL_CERT_EXPIRING_SOON'
      );

      if (criticalIssues.length > 0) {
        this.handleCriticalIssues(criticalIssues);
      }

    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Behandelt kritische SSL-Probleme
   */
  handleCriticalIssues(issues) {
    console.log('\n🚨 CRITICAL ISSUES DETECTED:');
    console.log('='.repeat(40));

    issues.forEach(issue => {
      console.log(`❌ ${issue.errorCode}:`);
      console.log(`   URL: ${issue.url}`);
      console.log(`   Details: ${issue.details}`);
      console.log('');

      // Erweiterte Aktionen für kritische Fälle
      if (issue.errorCode === 'E_SSL_CERT_EXPIRED') {
        console.log('🚨 IMMEDIATE ACTION REQUIRED:');
        console.log('   1. Check SSL certificate renewal process');
        console.log('   2. Verify domain DNS settings');
        console.log('   3. Contact hosting provider if necessary');
        console.log('   4. Monitor website accessibility');
        console.log('');
      }
    });

    // Speichere Incident Report
    this.saveIncidentReport(issues);
  }

  /**
   * Speichert Incident Report
   */
  saveIncidentReport(issues) {
    const incident = {
      timestamp: new Date().toISOString(),
      type: 'SSL_CERTIFICATE_INCIDENT',
      severity: 'CRITICAL',
      issues: issues,
      recommendedActions: [
        'Verify SSL certificate status',
        'Check domain DNS configuration', 
        'Review hosting provider settings',
        'Monitor website accessibility'
      ]
    };

    const reportPath = `./ssl-incident-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(incident, null, 2));
    console.log(`📄 Incident report saved: ${reportPath}`);
  }

  /**
   * Stoppt das Monitoring
   */
  stopMonitoring() {
    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('✅ Automated health monitoring stopped');
  }
}

// One-time check mode
async function runSingleCheck() {
  console.log('🔍 Running single health check...\n');
  const checker = new WebsiteHealthChecker();
  await checker.runHealthChecks();
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--monitor') || args.includes('-m')) {
    // Continuous monitoring mode
    const monitor = new AutomatedHealthMonitor();
    monitor.startMonitoring();
  } else {
    // Single check mode (default)
    runSingleCheck().catch(error => {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    });
  }
}

module.exports = AutomatedHealthMonitor;