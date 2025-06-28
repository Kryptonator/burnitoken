#!/usr/bin/env node

/**
 * Automated SSL Certificate Monitoring
 * Runs health checks and creates GitHub issues for critical problems
 * This script can be run as a cron job or in CI/CD pipelines
 */

const WebsiteHealthCheck = require('./website-health-check');
const fs = require('fs');

class AutomatedMonitoring {
  constructor() {
    this.healthCheck = new WebsiteHealthCheck();
    this.issueTemplate = {
      title: '🤖 [Automatisch gemeldet] Test: Kritisches SSL-Zertifikat abgelaufen',
      labels: ['bug', 'ssl', 'critical', 'automated'],
    };
  }

  /**
   * Run automated monitoring and handle results
   */
  async runMonitoring() {
    console.log('🤖 AUTOMATED SSL MONITORING STARTED');
    console.log('====================================');
    console.log(`📅 ${new Date().toISOString()}`);
    console.log('');

    try {
      const results = await this.healthCheck.runHealthCheck();

      // Check for critical SSL issues
      const criticalSSLIssues = results.filter(
        (r) => r.errorCode === 'E_SSL_CERT_EXPIRED' || r.errorCode === 'E_SSL_CERT_EXPIRING_SOON',
      );

      if (criticalSSLIssues.length > 0) {
        console.log('\n🚨 CRITICAL SSL ISSUES DETECTED');
        console.log('================================');

        for (const issue of criticalSSLIssues) {
          await this.handleCriticalSSLIssue(issue);
        }
      } else {
        console.log('\n✅ NO CRITICAL SSL ISSUES DETECTED');
        console.log('All SSL certificates are healthy.');
      }

      // Save monitoring log
      this.saveMonitoringLog(results);

      return criticalSSLIssues.length === 0;
    } catch (error) {
      console.error('❌ Monitoring failed:', error.message);
      return false;
    }
  }

  /**
   * Handle critical SSL issue
   */
  async handleCriticalSSLIssue(issue) {
    console.log(`\n🔥 Processing critical SSL issue for ${issue.domain}`);

    // Create issue data in the format shown in the GitHub issue
    const issueData = {
      source: 'tools/website-health-check.js',
      errorCode: issue.errorCode,
      url: `https://${issue.domain}`,
      timestamp: issue.timestamp,
      details: issue.details,
    };

    // Log the issue in the same format as the original
    console.log('\n**Fehlerdetails:**\n');
    console.log('```json');
    console.log(JSON.stringify(issueData, null, 2));
    console.log('```');

    // Save issue data for potential GitHub issue creation
    const issueFileName = `ssl-issue-${issue.domain}-${Date.now()}.json`;
    fs.writeFileSync(
      issueFileName,
      JSON.stringify(
        {
          title: this.issueTemplate.title,
          body: this.generateIssueBody(issueData),
          labels: this.issueTemplate.labels,
          issueData: issueData,
        },
        null,
        2,
      ),
    );

    console.log(`📄 Issue data saved: ${issueFileName}`);
    console.log('This file can be used to create a GitHub issue automatically.');
  }

  /**
   * Generate GitHub issue body
   */
  generateIssueBody(issueData) {
    return `**Fehlerdetails:**

\`\`\`json
${JSON.stringify(issueData, null, 2)}
\`\`\`

**Kontext:**

Dieser Fehler wurde vom automatisierten System-Monitoring erkannt. Bitte untersuchen Sie die Ursache und beheben Sie das Problem.

---
*Dieses Issue wurde automatisch vom System-Monitoring erstellt.*`;
  }

  /**
   * Save monitoring log
   */
  saveMonitoringLog(results) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'automated-monitoring',
      results: results,
      summary: {
        totalChecks: results.length,
        criticalIssues: results.filter((r) => r.errorCode && r.errorCode.includes('EXPIRED'))
          .length,
        warnings: results.filter((r) => r.errorCode && r.errorCode.includes('EXPIRING')).length,
      },
    };

    const logFile = 'monitoring-log.json';
    let logs = [];

    if (fs.existsSync(logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      } catch (e) {
        logs = [];
      }
    }

    logs.push(logEntry);

    // Keep only last 100 log entries
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    console.log(`📝 Monitoring log updated: ${logFile}`);
  }
}

// Run automated monitoring if this script is executed directly
if (require.main === module) {
  const monitoring = new AutomatedMonitoring();
  monitoring
    .runMonitoring()
    .then((success) => {
      if (success) {
        console.log('\n✅ AUTOMATED MONITORING COMPLETED SUCCESSFULLY');
        process.exit(0);
      } else {
        console.log('\n🚨 AUTOMATED MONITORING DETECTED CRITICAL ISSUES');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Automated monitoring failed:', error.message);
      process.exit(1);
    });
}

module.exports = AutomatedMonitoring;
