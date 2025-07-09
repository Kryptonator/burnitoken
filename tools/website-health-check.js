#!/usr/bin/env node

/**
 * Website Health Check
 * Monitors SSL certificate expiration and website health
 */

const { execSync } = require('child_process');
const https = require('https');
const tls = require('tls');

class WebsiteHealthChecker {
  constructor() {
    this.domains = ['burnitoken.com', 'burnitoken.website'];
    this.warningDays = 30; // Warn if certificate expires within 30 days
  }

  /**
   * Check SSL certificate expiration for a domain
   * @param {string} domain - Domain to check
   * @returns {Promise<Object>} Certificate information
   */
  async checkSSLCertificate(domain) {
    return new Promise((resolve) => {
      console.log(`🔒 Checking SSL certificate for ${domain}...`);
      
      const options = {
        host: domain,
        port: 443,
        servername: domain,
        timeout: 10000,
        rejectUnauthorized: false // We want to check even expired certs
      };

      const socket = tls.connect(options, () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (!cert || !cert.valid_to) {
          resolve({
            domain,
            error: 'Could not retrieve certificate information',
            isValid: false,
            isExpired: false,
            isExpiringSoon: false
          });
          return;
        }

        const expirationDate = new Date(cert.valid_to);
        const currentDate = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));

        const result = {
          domain,
          expirationDate: expirationDate.toISOString(),
          daysUntilExpiration,
          isValid: currentDate < expirationDate,
          isExpiringSoon: daysUntilExpiration <= this.warningDays && daysUntilExpiration > 0,
          isExpired: daysUntilExpiration <= 0,
          issuer: cert.issuer ? cert.issuer.O || cert.issuer.CN : 'Unknown',
          subject: cert.subject ? cert.subject.CN : domain
        };

        // Log status
        if (result.isExpired) {
          console.log(`   ❌ EXPIRED: Certificate expired ${Math.abs(daysUntilExpiration)} days ago`);
        } else if (result.isExpiringSoon) {
          console.log(`   ⚠️  WARNING: Certificate expires in ${daysUntilExpiration} days`);
        } else {
          console.log(`   ✅ OK: Certificate valid for ${daysUntilExpiration} days`);
        }

        resolve(result);
      });

      socket.on('error', (error) => {
        console.log(`   ❌ ERROR: ${error.message}`);
        resolve({
          domain,
          error: error.message,
          isValid: false,
          isExpired: false,
          isExpiringSoon: false
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        console.log(`   ❌ ERROR: Connection timeout`);
        resolve({
          domain,
          error: 'Connection timeout',
          isValid: false,
          isExpired: false,
          isExpiringSoon: false
        });
      });
    });
  }

  /**
   * Generate error report in the format expected by the monitoring system
   * @param {string} domain - Domain with the issue
   * @param {Object} certInfo - Certificate information
   * @returns {Object} Error report
   */
  generateErrorReport(domain, certInfo) {
    const timestamp = new Date().toISOString();
    const url = `https://${domain}`;
    
    if (certInfo.isExpired) {
      const expiredDays = Math.abs(certInfo.daysUntilExpiration);
      const expiredDate = new Date(certInfo.expirationDate).toLocaleDateString('de-DE');
      
      return {
        source: "tools/website-health-check.js",
        errorCode: "E_SSL_CERT_EXPIRED",
        url,
        timestamp,
        details: `Das SSL-Zertifikat ist am ${expiredDate} abgelaufen.`
      };
    }
    
    if (certInfo.isExpiringSoon) {
      const expiredDate = new Date(certInfo.expirationDate).toLocaleDateString('de-DE');
      
      return {
        source: "tools/website-health-check.js",
        errorCode: "E_SSL_CERT_EXPIRING_SOON",
        url,
        timestamp,
        details: `Das SSL-Zertifikat läuft am ${expiredDate} ab (in ${certInfo.daysUntilExpiration} Tagen).`
      };
    }

    return null;
  }

  /**
   * Check website connectivity
   * @param {string} domain - Domain to check
   * @returns {Promise<Object>} Connectivity status
   */
  async checkConnectivity(domain) {
    return new Promise((resolve) => {
      const url = `https://${domain}`;
      const startTime = Date.now();

      const req = https.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Website-Health-Check/1.0'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime;
        resolve({
          domain,
          status: 'ONLINE',
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          isHealthy: res.statusCode >= 200 && res.statusCode < 400
        });
      });

      req.on('error', (err) => {
        resolve({
          domain,
          status: 'OFFLINE',
          error: err.message,
          isHealthy: false
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          domain,
          status: 'TIMEOUT',
          error: 'Request timeout',
          isHealthy: false
        });
      });
    });
  }

  /**
   * Run complete health check for all domains
   */
  async runHealthCheck() {
    console.log('🏥 WEBSITE HEALTH CHECK');
    console.log('='.repeat(50));
    console.log(`🕐 ${new Date().toLocaleString('de-DE')}\n`);

    const results = {
      timestamp: new Date().toISOString(),
      domains: {},
      errors: [],
      warnings: []
    };

    for (const domain of this.domains) {
      console.log(`\n🔍 Checking ${domain}:`);
      
      // Check SSL certificate
      const sslResult = await this.checkSSLCertificate(domain);
      
      // Check connectivity
      const connectivityResult = await this.checkConnectivity(domain);
      
      results.domains[domain] = {
        ssl: sslResult,
        connectivity: connectivityResult
      };

      // Generate error reports if needed
      const errorReport = this.generateErrorReport(domain, sslResult);
      if (errorReport) {
        if (errorReport.errorCode === 'E_SSL_CERT_EXPIRED') {
          results.errors.push(errorReport);
          console.log(`\n❌ CRITICAL ERROR for ${domain}:`);
          console.log(JSON.stringify(errorReport, null, 2));
        } else if (errorReport.errorCode === 'E_SSL_CERT_EXPIRING_SOON') {
          results.warnings.push(errorReport);
          console.log(`\n⚠️  WARNING for ${domain}:`);
          console.log(JSON.stringify(errorReport, null, 2));
        }
      }
    }

    // Summary
    console.log('\n📊 HEALTH CHECK SUMMARY');
    console.log('='.repeat(30));
    console.log(`✅ Domains checked: ${this.domains.length}`);
    console.log(`❌ Critical errors: ${results.errors.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);

    if (results.errors.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED:');
      results.errors.forEach(error => {
        console.log(`   - ${error.url}: ${error.details}`);
      });
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      results.warnings.forEach(warning => {
        console.log(`   - ${warning.url}: ${warning.details}`);
      });
    }

    return results;
  }
}

// Run health check if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const healthChecker = new WebsiteHealthChecker();
  
  // Support for testing scenarios
  if (args.includes('--test-expired')) {
    console.log('🧪 TESTING EXPIRED CERTIFICATE SCENARIO');
    console.log('='.repeat(50));
    
    // Simulate expired certificate for burnitoken.com
    const expiredCertInfo = {
      domain: 'burnitoken.com',
      expirationDate: '2025-06-24T12:00:00.000Z',
      daysUntilExpiration: -1,
      isValid: false,
      isExpired: true,
      isExpiringSoon: false
    };
    
    const errorReport = healthChecker.generateErrorReport('burnitoken.com', expiredCertInfo);
    if (errorReport) {
      console.log('\n❌ SIMULATED ERROR REPORT:');
      console.log(JSON.stringify(errorReport, null, 2));
    }
    
    process.exit(1); // Exit with error code to simulate critical issue
  }
  
  if (args.includes('--test-expiring')) {
    console.log('🧪 TESTING EXPIRING CERTIFICATE SCENARIO');
    console.log('='.repeat(50));
    
    // Simulate expiring certificate for burnitoken.com
    const expiringSoonCertInfo = {
      domain: 'burnitoken.com',
      expirationDate: '2025-07-10T12:00:00.000Z',
      daysUntilExpiration: 15,
      isValid: true,
      isExpired: false,
      isExpiringSoon: true
    };
    
    const warningReport = healthChecker.generateErrorReport('burnitoken.com', expiringSoonCertInfo);
    if (warningReport) {
      console.log('\n⚠️  SIMULATED WARNING REPORT:');
      console.log(JSON.stringify(warningReport, null, 2));
    }
    
    process.exit(0);
  }
  
  // Regular health check
  healthChecker.runHealthCheck()
    .then((results) => {
      // Exit with error code if there are critical issues
      process.exit(results.errors.length > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Health check failed:', error.message);
      process.exit(1);
    });
}

module.exports = WebsiteHealthChecker;