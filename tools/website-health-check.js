#!/usr/bin/env node

/**
 * Website Health Check Tool
 * Monitors SSL certificate expiration and website health for burnitoken domains
 * 
 * Generates error reports in JSON format for automated monitoring
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class WebsiteHealthChecker {
  constructor() {
    this.domains = ['burnitoken.com', 'burnitoken.website'];
    this.warningDays = 30; // Alert if certificate expires within 30 days
    this.timeout = 10000; // 10 second timeout
  }

  /**
   * Check SSL certificate expiration for a domain
   * @param {string} domain - Domain to check
   * @returns {Object} SSL certificate information
   */
  async checkSSLCertificate(domain) {
    try {
      console.log(`🔐 Checking SSL certificate for ${domain}...`);

      // Get certificate information using openssl
      const sslInfo = execSync(
        `timeout 10 openssl s_client -servername ${domain} -connect ${domain}:443 -verify_return_error < /dev/null 2>/dev/null | openssl x509 -noout -dates -subject -issuer 2>/dev/null`,
        { 
          encoding: 'utf8', 
          timeout: this.timeout 
        }
      );

      if (!sslInfo.trim()) {
        throw new Error('Could not retrieve SSL certificate information');
      }

      // Parse certificate dates
      const notBeforeMatch = sslInfo.match(/notBefore=(.+)/);
      const notAfterMatch = sslInfo.match(/notAfter=(.+)/);
      const subjectMatch = sslInfo.match(/subject=(.+)/);
      const issuerMatch = sslInfo.match(/issuer=(.+)/);

      if (!notAfterMatch) {
        throw new Error('Could not parse certificate expiration date');
      }

      const expirationDate = new Date(notAfterMatch[1]);
      const currentDate = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));

      const result = {
        domain,
        status: 'valid',
        expirationDate: expirationDate.toISOString(),
        daysUntilExpiration,
        issuer: issuerMatch ? issuerMatch[1].trim() : 'Unknown',
        subject: subjectMatch ? subjectMatch[1].trim() : 'Unknown',
        isExpired: daysUntilExpiration < 0,
        isExpiringSoon: daysUntilExpiration <= this.warningDays,
        timestamp: new Date().toISOString()
      };

      if (result.isExpired) {
        result.status = 'expired';
        result.errorCode = 'E_SSL_CERT_EXPIRED';
        result.details = `Das SSL-Zertifikat ist am ${expirationDate.toISOString().split('T')[0]} abgelaufen.`;
      } else if (result.isExpiringSoon) {
        result.status = 'expiring_soon';
        result.errorCode = 'E_SSL_CERT_EXPIRING_SOON';
        result.details = `Das SSL-Zertifikat läuft in ${daysUntilExpiration} Tagen am ${expirationDate.toISOString().split('T')[0]} ab.`;
      }

      return result;

    } catch (error) {
      console.error(`❌ SSL check failed for ${domain}: ${error.message}`);
      
      return {
        domain,
        status: 'error',
        errorCode: 'E_SSL_CHECK_FAILED',
        error: error.message,
        timestamp: new Date().toISOString(),
        details: `SSL-Zertifikat konnte nicht überprüft werden: ${error.message}`
      };
    }
  }

  /**
   * Check website availability and response time
   * @param {string} domain - Domain to check
   * @returns {Object} Website availability information
   */
  async checkWebsiteAvailability(domain) {
    return new Promise((resolve) => {
      const url = `https://${domain}`;
      const startTime = Date.now();
      
      console.log(`🌐 Checking website availability for ${domain}...`);

      const req = https.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Burnitoken-Health-Monitor/1.0'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime;
        
        resolve({
          domain,
          status: 'available',
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          isHealthy: res.statusCode >= 200 && res.statusCode < 400
        });
      });

      req.on('error', (error) => {
        resolve({
          domain,
          status: 'unavailable',
          errorCode: 'E_WEBSITE_UNAVAILABLE',
          error: error.message,
          timestamp: new Date().toISOString(),
          details: `Website ist nicht erreichbar: ${error.message}`
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          domain,
          status: 'timeout',
          errorCode: 'E_WEBSITE_TIMEOUT',
          error: 'Request timeout',
          timestamp: new Date().toISOString(),
          details: `Website-Anfrage ist nach ${this.timeout}ms abgelaufen.`
        });
      });
    });
  }

  /**
   * Generate error report in the format expected by the monitoring system
   * @param {Object} check - Check result with error
   * @returns {Object} Formatted error report
   */
  generateErrorReport(check) {
    return {
      source: "tools/website-health-check.js",
      errorCode: check.errorCode,
      url: `https://${check.domain}`,
      timestamp: check.timestamp,
      details: check.details || check.error
    };
  }

  /**
   * Run comprehensive health check for all domains
   */
  async runHealthCheck() {
    console.log('🏥 WEBSITE HEALTH CHECK STARTING...');
    console.log('=====================================');
    console.log(`🎯 Checking ${this.domains.length} domains for SSL and availability`);
    console.log('');

    const results = {
      timestamp: new Date().toISOString(),
      domains: [],
      errors: [],
      summary: {
        total: this.domains.length,
        healthy: 0,
        errors: 0,
        warnings: 0
      }
    };

    for (const domain of this.domains) {
      console.log(`\n📊 Checking ${domain}:`);
      console.log('-'.repeat(30));

      // Check SSL certificate
      const sslCheck = await this.checkSSLCertificate(domain);
      
      // Check website availability
      const availabilityCheck = await this.checkWebsiteAvailability(domain);

      const domainResult = {
        domain,
        ssl: sslCheck,
        availability: availabilityCheck,
        overall: 'healthy'
      };

      // Determine overall status
      if (sslCheck.status === 'expired' || sslCheck.status === 'error' || availabilityCheck.status === 'unavailable') {
        domainResult.overall = 'critical';
        results.summary.errors++;
        
        // Generate error reports for critical issues
        if (sslCheck.errorCode) {
          results.errors.push(this.generateErrorReport(sslCheck));
        }
        if (availabilityCheck.errorCode) {
          results.errors.push(this.generateErrorReport(availabilityCheck));
        }
      } else if (sslCheck.status === 'expiring_soon') {
        domainResult.overall = 'warning';
        results.summary.warnings++;
        
        // Generate warning reports for expiring certificates
        results.errors.push(this.generateErrorReport(sslCheck));
      } else {
        results.summary.healthy++;
      }

      results.domains.push(domainResult);

      // Log results
      console.log(`   🔒 SSL: ${this.getStatusEmoji(sslCheck.status)} ${sslCheck.status}`);
      if (sslCheck.expirationDate) {
        console.log(`   📅 Expires: ${sslCheck.expirationDate.split('T')[0]} (${sslCheck.daysUntilExpiration} days)`);
      }
      console.log(`   🌐 Website: ${this.getStatusEmoji(availabilityCheck.status)} ${availabilityCheck.status}`);
      if (availabilityCheck.responseTime) {
        console.log(`   ⏱️  Response: ${availabilityCheck.responseTime}`);
      }
    }

    // Print summary
    console.log('\n📋 HEALTH CHECK SUMMARY');
    console.log('========================');
    console.log(`   ✅ Healthy: ${results.summary.healthy}/${results.summary.total}`);
    console.log(`   ⚠️  Warnings: ${results.summary.warnings}`);
    console.log(`   ❌ Errors: ${results.summary.errors}`);

    // Save results to file
    const reportPath = path.join(__dirname, '..', 'website-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Report saved: ${reportPath}`);

    // Print errors in the format expected by monitoring system
    if (results.errors.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED:');
      console.log('============================');
      
      results.errors.forEach(error => {
        console.log('\n' + JSON.stringify(error, null, 2));
      });
      
      // Exit with error code if critical issues found
      process.exit(1);
    } else {
      console.log('\n🎉 All checks passed! Website is healthy.');
      process.exit(0);
    }
  }

  /**
   * Get emoji for status
   * @param {string} status - Status string
   * @returns {string} Emoji
   */
  getStatusEmoji(status) {
    const statusEmojis = {
      'valid': '✅',
      'expired': '❌',
      'expiring_soon': '⚠️',
      'error': '❌',
      'available': '✅',
      'unavailable': '❌',
      'timeout': '⏱️'
    };
    return statusEmojis[status] || '❓';
  }
}

// Run health check if called directly
if (require.main === module) {
  const checker = new WebsiteHealthChecker();
  checker.runHealthCheck().catch(error => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  });
}

module.exports = WebsiteHealthChecker;