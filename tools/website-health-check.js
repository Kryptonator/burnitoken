#!/usr/bin/env node

/**
 * Website Health Check
 * Monitors SSL certificate status and expiration dates
 * Reports critical issues with proper error codes
 */

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

class WebsiteHealthChecker {
  constructor() {
    this.domains = ['burnitoken.com', 'burnitoken.website'];
    this.checkTimeout = 15000; // 15 seconds timeout
  }

  /**
   * Check SSL certificate expiration for a domain
   * @param {string} domain - Domain to check
   * @returns {Promise<Object>} SSL certificate information
   */
  async checkSSLCertificate(domain) {
    try {
      console.log(`🔐 Checking SSL certificate for ${domain}...`);

      // Get SSL certificate information using openssl
      const sslInfo = execSync(
        `echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer`,
        {
          encoding: 'utf8',
          timeout: this.checkTimeout,
        }
      );

      if (!sslInfo) {
        throw new Error('No SSL certificate found');
      }

      // Parse certificate dates
      const notBefore = this.extractDate(sslInfo, 'notBefore=');
      const notAfter = this.extractDate(sslInfo, 'notAfter=');
      
      if (!notAfter) {
        throw new Error('Could not parse certificate expiration date');
      }

      const expirationDate = new Date(notAfter);
      const currentDate = new Date();
      const daysUntilExpiry = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));

      const result = {
        domain,
        expirationDate: expirationDate.toISOString().split('T')[0],
        daysUntilExpiry,
        isValid: expirationDate > currentDate,
        isExpired: expirationDate <= currentDate,
        issuer: this.extractIssuer(sslInfo),
        subject: this.extractSubject(sslInfo)
      };

      // Check if certificate is expired
      if (result.isExpired) {
        const error = {
          source: "tools/website-health-check.js",
          errorCode: "E_SSL_CERT_EXPIRED",
          url: `https://${domain}`,
          timestamp: new Date().toISOString(),
          details: `Das SSL-Zertifikat ist am ${result.expirationDate} abgelaufen.`
        };

        console.error(`❌ CRITICAL: SSL certificate expired for ${domain}`);
        console.error(JSON.stringify(error, null, 2));
        
        return { ...result, error };
      }

      // Check if certificate expires soon (within 30 days)
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        console.warn(`⚠️  WARNING: SSL certificate for ${domain} expires in ${daysUntilExpiry} days`);
      } else if (result.isValid) {
        console.log(`✅ SSL certificate for ${domain} is valid (expires in ${daysUntilExpiry} days)`);
      }

      return result;

    } catch (error) {
      const sslError = {
        source: "tools/website-health-check.js",
        errorCode: "E_SSL_CHECK_FAILED",
        url: `https://${domain}`,
        timestamp: new Date().toISOString(),
        details: `SSL certificate check failed: ${error.message}`
      };

      console.error(`❌ Failed to check SSL certificate for ${domain}: ${error.message}`);
      
      return {
        domain,
        isValid: false,
        isExpired: false,
        error: sslError,
        checkFailed: true
      };
    }
  }

  /**
   * Extract date from SSL certificate output
   * @param {string} sslInfo - SSL certificate information
   * @param {string} prefix - Date prefix to search for
   * @returns {string|null} Extracted date
   */
  extractDate(sslInfo, prefix) {
    const lines = sslInfo.split('\n');
    for (const line of lines) {
      if (line.includes(prefix)) {
        return line.replace(prefix, '').trim();
      }
    }
    return null;
  }

  /**
   * Extract issuer from SSL certificate output
   * @param {string} sslInfo - SSL certificate information
   * @returns {string} Certificate issuer
   */
  extractIssuer(sslInfo) {
    const lines = sslInfo.split('\n');
    for (const line of lines) {
      if (line.startsWith('issuer=')) {
        return line.replace('issuer=', '').trim();
      }
    }
    return 'Unknown';
  }

  /**
   * Extract subject from SSL certificate output
   * @param {string} sslInfo - SSL certificate information
   * @returns {string} Certificate subject
   */
  extractSubject(sslInfo) {
    const lines = sslInfo.split('\n');
    for (const line of lines) {
      if (line.startsWith('subject=')) {
        return line.replace('subject=', '').trim();
      }
    }
    return 'Unknown';
  }

  /**
   * Check website connectivity and SSL status
   * @param {string} domain - Domain to check
   * @returns {Promise<Object>} Connectivity check result
   */
  async checkWebsiteConnectivity(domain) {
    return new Promise((resolve) => {
      const url = `https://${domain}`;
      const startTime = Date.now();

      console.log(`🌐 Checking connectivity for ${domain}...`);

      const req = https.get(url, (res) => {
        const responseTime = Date.now() - startTime;
        console.log(`✅ ${domain} is reachable (${res.statusCode}, ${responseTime}ms)`);
        
        resolve({
          domain,
          status: 'CONNECTED',
          statusCode: res.statusCode,
          responseTime,
          isReachable: true
        });
      });

      req.on('error', (err) => {
        console.error(`❌ ${domain} is not reachable: ${err.message}`);
        
        resolve({
          domain,
          status: 'CONNECTION_FAILED',
          error: err.message,
          isReachable: false
        });
      });

      req.setTimeout(this.checkTimeout, () => {
        req.destroy();
        console.error(`❌ ${domain} connection timeout`);
        
        resolve({
          domain,
          status: 'TIMEOUT',
          error: 'Connection timeout',
          isReachable: false
        });
      });
    });
  }

  /**
   * Perform comprehensive health check for all domains
   * @returns {Promise<Object>} Complete health check results
   */
  async performHealthCheck() {
    console.log('🏥 WEBSITE HEALTH CHECK');
    console.log('='.repeat(50));
    console.log(`📊 Checking ${this.domains.length} domains...`);
    console.log(`⏱️  Timeout: ${this.checkTimeout / 1000}s\n`);

    const results = {
      timestamp: new Date().toISOString(),
      domains: {},
      summary: {
        total: this.domains.length,
        healthy: 0,
        warnings: 0,
        critical: 0
      },
      errors: []
    };

    for (const domain of this.domains) {
      console.log(`\n🔍 Checking ${domain}...`);
      
      // Check connectivity
      const connectivityResult = await this.checkWebsiteConnectivity(domain);
      
      // Check SSL certificate
      const sslResult = await this.checkSSLCertificate(domain);

      const domainResult = {
        domain,
        connectivity: connectivityResult,
        ssl: sslResult,
        overallHealth: this.determineOverallHealth(connectivityResult, sslResult)
      };

      results.domains[domain] = domainResult;

      // Update summary
      if (domainResult.overallHealth === 'healthy') {
        results.summary.healthy++;
      } else if (domainResult.overallHealth === 'warning') {
        results.summary.warnings++;
      } else {
        results.summary.critical++;
      }

      // Collect errors
      if (connectivityResult.error) {
        results.errors.push(connectivityResult.error);
      }
      if (sslResult.error) {
        results.errors.push(sslResult.error);
      }
    }

    return results;
  }

  /**
   * Determine overall health status for a domain
   * @param {Object} connectivityResult - Connectivity check result
   * @param {Object} sslResult - SSL check result
   * @returns {string} Health status: 'healthy', 'warning', or 'critical'
   */
  determineOverallHealth(connectivityResult, sslResult) {
    // Critical issues
    if (!connectivityResult.isReachable || sslResult.isExpired) {
      return 'critical';
    }

    // Warning issues
    if (sslResult.daysUntilExpiry <= 30 && sslResult.daysUntilExpiry > 0) {
      return 'warning';
    }

    // All good
    return 'healthy';
  }

  /**
   * Generate health check report
   * @param {Object} results - Health check results
   */
  generateReport(results) {
    console.log('\n📋 HEALTH CHECK REPORT');
    console.log('='.repeat(50));
    
    console.log(`⏰ Timestamp: ${results.timestamp}`);
    console.log(`📊 Summary: ${results.summary.healthy}/${results.summary.total} healthy`);
    
    if (results.summary.warnings > 0) {
      console.log(`⚠️  Warnings: ${results.summary.warnings}`);
    }
    
    if (results.summary.critical > 0) {
      console.log(`🚨 Critical Issues: ${results.summary.critical}`);
    }

    // Save detailed report
    const reportFile = 'website-health-report.json';
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportFile}`);

    // Log critical errors for monitoring systems
    if (results.errors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS:');
      results.errors.forEach(error => {
        if (error.errorCode === 'E_SSL_CERT_EXPIRED') {
          console.error(`❌ ${error.errorCode}: ${error.details}`);
          console.error(`   URL: ${error.url}`);
          console.error(`   Time: ${error.timestamp}`);
        }
      });
    }

    return results;
  }
}

// Main execution
async function main() {
  try {
    const checker = new WebsiteHealthChecker();
    const results = await checker.performHealthCheck();
    const report = checker.generateReport(results);

    // Exit with error code if there are critical issues
    if (results.summary.critical > 0) {
      console.error('\n💥 Health check failed with critical issues!');
      process.exit(1);
    } else if (results.summary.warnings > 0) {
      console.warn('\n⚠️  Health check completed with warnings.');
      process.exit(0);
    } else {
      console.log('\n✅ All systems healthy!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = { WebsiteHealthChecker };

// Run if called directly
if (require.main === module) {
  main();
}