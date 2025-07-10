#!/usr/bin/env node

/**
 * Website Health Check
 * Monitors SSL certificate expiration and website health for burnitoken.com
 * Reports specific error codes for different health issues
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');

class WebsiteHealthCheck {
  constructor() {
    this.domains = ['burnitoken.com', 'burnitoken.website'];
    this.alertThresholds = {
      sslExpirationDays: 7, // Alert if SSL expires within 7 days
      responseTimeMs: 5000, // Alert if response time > 5 seconds
    };
  }

  /**
   * Check SSL certificate expiration for a domain
   */
  async checkSSLCertificate(domain) {
    try {
      console.log(`🔐 Checking SSL certificate for ${domain}...`);

      // Get SSL certificate info using openssl
      const sslInfo = execSync(
        `echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -dates`,
        {
          encoding: 'utf8',
          timeout: 10000,
        },
      );

      const notAfterMatch = sslInfo.match(/notAfter=(.+)/);
      if (!notAfterMatch) {
        return {
          domain,
          status: 'SSL_INFO_UNAVAILABLE',
          error: 'Could not retrieve SSL certificate information',
          timestamp: new Date().toISOString(),
        };
      }

      const expirationDate = new Date(notAfterMatch[1]);
      const currentDate = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));

      // Check if certificate is expired
      if (daysUntilExpiration < 0) {
        return {
          domain,
          status: 'SSL_CERT_EXPIRED',
          errorCode: 'E_SSL_CERT_EXPIRED',
          expirationDate: expirationDate.toISOString().split('T')[0],
          daysExpired: Math.abs(daysUntilExpiration),
          timestamp: new Date().toISOString(),
          details: `Das SSL-Zertifikat ist am ${expirationDate.toISOString().split('T')[0]} abgelaufen.`,
        };
      }

      // Check if certificate expires soon
      if (daysUntilExpiration <= this.alertThresholds.sslExpirationDays) {
        return {
          domain,
          status: 'SSL_CERT_EXPIRING_SOON',
          errorCode: 'E_SSL_CERT_EXPIRING_SOON',
          expirationDate: expirationDate.toISOString().split('T')[0],
          daysUntilExpiration,
          timestamp: new Date().toISOString(),
          details: `Das SSL-Zertifikat läuft in ${daysUntilExpiration} Tagen ab.`,
        };
      }

      // Certificate is valid
      return {
        domain,
        status: 'SSL_CERT_VALID',
        expirationDate: expirationDate.toISOString().split('T')[0],
        daysUntilExpiration,
        timestamp: new Date().toISOString(),
        details: `SSL-Zertifikat ist gültig bis ${expirationDate.toISOString().split('T')[0]}.`,
      };
    } catch (error) {
      return {
        domain,
        status: 'SSL_CHECK_FAILED',
        errorCode: 'E_SSL_CHECK_FAILED',
        error: error.message,
        timestamp: new Date().toISOString(),
        details: 'SSL-Zertifikat-Überprüfung fehlgeschlagen.',
      };
    }
  }

  /**
   * Check website connectivity and response time
   */
  async checkWebsiteConnectivity(domain) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      console.log(`🌐 Checking connectivity for ${domain}...`);

      const req = https.get(`https://${domain}`, (res) => {
        const responseTime = Date.now() - startTime;
        const result = {
          domain,
          status: 'CONNECTIVITY_OK',
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
        };

        if (responseTime > this.alertThresholds.responseTimeMs) {
          result.status = 'SLOW_RESPONSE';
          result.errorCode = 'E_SLOW_RESPONSE';
          result.details = `Antwortzeit von ${responseTime}ms überschreitet Schwellenwert von ${this.alertThresholds.responseTimeMs}ms.`;
        }

        if (res.statusCode !== 200) {
          result.status = 'HTTP_ERROR';
          result.errorCode = 'E_HTTP_ERROR';
          result.details = `HTTP-Status ${res.statusCode} ist nicht OK.`;
        }

        resolve(result);
      });

      req.on('error', (err) => {
        resolve({
          domain,
          status: 'CONNECTIVITY_FAILED',
          errorCode: 'E_CONNECTIVITY_FAILED',
          error: err.message,
          timestamp: new Date().toISOString(),
          details: 'Website ist nicht erreichbar.',
        });
      });

      req.setTimeout(15000, () => {
        req.destroy();
        resolve({
          domain,
          status: 'TIMEOUT',
          errorCode: 'E_TIMEOUT',
          timestamp: new Date().toISOString(),
          details: 'Verbindung zur Website ist abgelaufen.',
        });
      });
    });
  }

  /**
   * Run comprehensive health check for all domains
   */
  async runHealthCheck() {
    console.log('🏥 WEBSITE HEALTH CHECK STARTED');
    console.log('===============================');
    console.log('🎯 Monitoring SSL certificates and website health');
    console.log('🔍 Domains:', this.domains.join(', '));
    console.log('');

    const results = [];

    for (const domain of this.domains) {
      console.log(`\n📊 Checking ${domain}...`);
      console.log('─'.repeat(40));

      // Check SSL certificate
      const sslResult = await this.checkSSLCertificate(domain);
      results.push(sslResult);

      // Check website connectivity if SSL is not expired
      if (sslResult.status !== 'SSL_CERT_EXPIRED') {
        const connectivityResult = await this.checkWebsiteConnectivity(domain);
        results.push(connectivityResult);
      }

      // Log results
      this.logResult(sslResult);
      if (sslResult.status !== 'SSL_CERT_EXPIRED') {
        this.logResult(results[results.length - 1]);
      }
    }

    // Generate report
    this.generateHealthReport(results);
    return results;
  }

  /**
   * Log individual check result
   */
  logResult(result) {
    const status = result.status;
    let icon = '✅';
    let message = result.details || 'OK';

    if (status.includes('EXPIRED') || status.includes('FAILED') || status.includes('ERROR')) {
      icon = '❌';
    } else if (
      status.includes('EXPIRING') ||
      status.includes('SLOW') ||
      status.includes('TIMEOUT')
    ) {
      icon = '⚠️';
    }

    console.log(`   ${icon} ${result.domain} - ${message}`);
    if (result.errorCode) {
      console.log(`      Error Code: ${result.errorCode}`);
    }
  }

  /**
   * Generate comprehensive health report
   */
  generateHealthReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      source: 'tools/website-health-check.js',
      summary: {
        totalChecks: results.length,
        healthyChecks: results.filter((r) => r.status.includes('OK') || r.status.includes('VALID'))
          .length,
        warningChecks: results.filter(
          (r) => r.status.includes('EXPIRING') || r.status.includes('SLOW'),
        ).length,
        criticalChecks: results.filter(
          (r) =>
            r.status.includes('EXPIRED') ||
            r.status.includes('FAILED') ||
            r.status.includes('ERROR'),
        ).length,
      },
      checks: results,
      recommendations: this.generateRecommendations(results),
    };

    // Save report to file
    fs.writeFileSync('website-health-report.json', JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n📋 HEALTH CHECK SUMMARY');
    console.log('=======================');
    console.log(`✅ Healthy: ${report.summary.healthyChecks}`);
    console.log(`⚠️  Warnings: ${report.summary.warningChecks}`);
    console.log(`❌ Critical: ${report.summary.criticalChecks}`);
    console.log(`📄 Report saved: website-health-report.json`);

    // Log critical issues
    const criticalIssues = results.filter(
      (r) =>
        r.status.includes('EXPIRED') || r.status.includes('FAILED') || r.status.includes('ERROR'),
    );

    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED');
      console.log('===========================');
      criticalIssues.forEach((issue) => {
        console.log(`❌ ${issue.domain}: ${issue.details}`);
        if (issue.errorCode) {
          console.log(`   Error Code: ${issue.errorCode}`);
        }
      });
    }

    return report;
  }

  /**
   * Generate recommendations based on health check results
   */
  generateRecommendations(results) {
    const recommendations = [];

    const expiredCerts = results.filter((r) => r.status === 'SSL_CERT_EXPIRED');
    const expiringSoonCerts = results.filter((r) => r.status === 'SSL_CERT_EXPIRING_SOON');
    const connectivityIssues = results.filter((r) => r.status === 'CONNECTIVITY_FAILED');

    if (expiredCerts.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Expired SSL certificates detected',
        action: 'Renew SSL certificates immediately',
        domains: expiredCerts.map((c) => c.domain),
      });
    }

    if (expiringSoonCerts.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'SSL certificates expiring soon',
        action: 'Schedule SSL certificate renewal',
        domains: expiringSoonCerts.map((c) => c.domain),
      });
    }

    if (connectivityIssues.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Website connectivity problems',
        action: 'Check hosting provider and DNS settings',
        domains: connectivityIssues.map((c) => c.domain),
      });
    }

    return recommendations;
  }
}

// Run health check if this script is executed directly
if (require.main === module) {
  const healthCheck = new WebsiteHealthCheck();
  healthCheck
    .runHealthCheck()
    .then((results) => {
      const criticalIssues = results.filter(
        (r) =>
          r.status.includes('EXPIRED') || r.status.includes('FAILED') || r.status.includes('ERROR'),
      );

      if (criticalIssues.length > 0) {
        console.log('\n🔥 HEALTH CHECK COMPLETED WITH CRITICAL ISSUES');
        process.exit(1);
      } else {
        console.log('\n✅ HEALTH CHECK COMPLETED SUCCESSFULLY');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('❌ Health check failed:', error.message);
      process.exit(1);
    });
}

module.exports = WebsiteHealthCheck;
