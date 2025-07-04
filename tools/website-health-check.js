#!/usr/bin/env node

/**
 * 🏥 Website Health Check - SSL Certificate Monitoring
 * Monitors SSL certificates for expiration and reports critical issues
 * 
 * This tool detects SSL certificate expiration and generates structured error reports
 * for automated monitoring systems.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class WebsiteHealthChecker {
  constructor(options = {}) {
    this.domains = [
      'burnitoken.com',
      'burnitoken.website'
    ];
    this.criticalDaysThreshold = 7; // Alert when certificate expires within 7 days
    this.warningDaysThreshold = 30; // Warning when certificate expires within 30 days
    this.testMode = options.testMode || false; // For testing SSL expiration scenarios
  }

  /**
   * Create test data for SSL certificate expiration scenario
   * This simulates the issue described in the problem statement
   */
  createTestScenario() {
    return {
      domain: 'burnitoken.com',
      isExpired: true,
      expirationDate: '2025-06-24T23:59:59.000Z', // Expired on 2025-06-24 as per issue
      issueDate: '2024-06-24T00:00:00.000Z',
      daysUntilExpiration: -10, // 10 days ago
      subject: 'CN=burnitoken.com',
      issuer: 'CN=Let\'s Encrypt Authority X3, O=Let\'s Encrypt, C=US',
      status: 'EXPIRED'
    };
  }

  /**
   * Check SSL certificate for a domain
   * @param {string} domain 
   * @returns {Object} SSL certificate information
   */
  async checkSSLCertificate(domain) {
    console.log(`🔐 Checking SSL certificate for ${domain}...`);
    
    // If in test mode and checking burnitoken.com, return test scenario
    if (this.testMode && domain === 'burnitoken.com') {
      const testResult = this.createTestScenario();
      console.log(`   ❌ SSL Certificate EXPIRED on ${new Date(testResult.expirationDate).toLocaleDateString('de-DE')} (${Math.abs(testResult.daysUntilExpiration)} days ago)`);
      return testResult;
    }
    
    try {
      // First try to connect and get certificate information
      // Use timeout and better error handling for expired certs
      let certInfo;
      
      try {
        certInfo = execSync(
          `timeout 30 openssl s_client -servername ${domain} -connect ${domain}:443 -verify_return_error 2>&1 | openssl x509 -noout -dates -subject 2>/dev/null || echo "CERT_ERROR"`,
          { 
            encoding: 'utf8',
            timeout: 35000 
          }
        );
      } catch (sslError) {
        // If the above fails, try without verify_return_error for expired certs
        console.log(`   ⚠️  Initial SSL check failed, trying alternate method...`);
        
        try {
          certInfo = execSync(
            `timeout 30 openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -dates -subject 2>/dev/null || echo "CERT_ERROR"`,
            { 
              encoding: 'utf8',
              timeout: 35000 
            }
          );
        } catch (altError) {
          // Try one more method specifically for expired certificates
          console.log(`   ⚠️  Standard SSL check failed, checking for expired certificate...`);
          
          try {
            // This method should work even with expired certificates
            const rawCert = execSync(
              `timeout 30 openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p'`,
              { 
                encoding: 'utf8',
                timeout: 35000 
              }
            );
            
            if (rawCert && rawCert.includes('BEGIN CERTIFICATE')) {
              // Parse the certificate even if expired
              certInfo = execSync(
                `echo "${rawCert}" | openssl x509 -noout -dates -subject 2>/dev/null || echo "CERT_ERROR"`,
                { 
                  encoding: 'utf8',
                  timeout: 10000 
                }
              );
            } else {
              throw new Error('Could not retrieve certificate');
            }
          } catch (finalError) {
            throw new Error(`SSL connection failed: ${finalError.message}`);
          }
        }
      }

      // Check if we got certificate info
      if (!certInfo || certInfo.trim() === 'CERT_ERROR' || certInfo.includes('unable to load certificate')) {
        throw new Error('Could not parse certificate information');
      }

      // Parse certificate dates
      const notAfterMatch = certInfo.match(/notAfter=(.+)/);
      const notBeforeMatch = certInfo.match(/notBefore=(.+)/);
      const subjectMatch = certInfo.match(/subject=(.+)/);

      if (!notAfterMatch) {
        throw new Error('Could not parse certificate expiration date');
      }

      const expirationDate = new Date(notAfterMatch[1]);
      const issueDate = new Date(notBeforeMatch ? notBeforeMatch[1] : null);
      const subject = subjectMatch ? subjectMatch[1] : 'Unknown';
      
      const now = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
      
      // Check if certificate is expired
      const isExpired = expirationDate < now;
      
      // Get issuer information (optional, may fail for expired certs)
      let issuerInfo = 'Unknown';
      try {
        issuerInfo = execSync(
          `timeout 20 openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null | sed 's/issuer=//' || echo "Unknown"`,
          { 
            encoding: 'utf8',
            timeout: 25000 
          }
        );
      } catch (issuerError) {
        console.log(`   ⚠️  Could not get issuer information: ${issuerError.message}`);
      }

      const result = {
        domain,
        isExpired,
        expirationDate: expirationDate.toISOString(),
        issueDate: issueDate ? issueDate.toISOString() : null,
        daysUntilExpiration,
        subject: subject.trim(),
        issuer: issuerInfo.replace('issuer=', '').trim(),
        status: isExpired ? 'EXPIRED' : 
                daysUntilExpiration <= this.criticalDaysThreshold ? 'CRITICAL' : 
                daysUntilExpiration <= this.warningDaysThreshold ? 'WARNING' : 'OK'
      };

      // Log status
      if (isExpired) {
        console.log(`   ❌ SSL Certificate EXPIRED on ${expirationDate.toLocaleDateString('de-DE')} (${Math.abs(daysUntilExpiration)} days ago)`);
      } else if (daysUntilExpiration <= this.criticalDaysThreshold) {
        console.log(`   🚨 SSL Certificate expires in ${daysUntilExpiration} days (CRITICAL)`);
      } else if (daysUntilExpiration <= this.warningDaysThreshold) {
        console.log(`   ⚠️  SSL Certificate expires in ${daysUntilExpiration} days (WARNING)`);
      } else {
        console.log(`   ✅ SSL Certificate OK (expires in ${daysUntilExpiration} days)`);
      }

      return result;

    } catch (error) {
      console.log(`   ❌ SSL Check failed: ${error.message}`);
      
      // Check if this is a DNS resolution error
      if (error.message.includes('name resolution') || error.message.includes('REFUSED')) {
        return {
          domain,
          isExpired: null,
          expirationDate: null,
          issueDate: null,
          daysUntilExpiration: null,
          subject: null,
          issuer: null,
          status: 'DNS_ERROR',
          error: `DNS resolution failed for ${domain}`
        };
      }
      
      return {
        domain,
        isExpired: null,
        expirationDate: null,
        issueDate: null,
        daysUntilExpiration: null,
        subject: null,
        issuer: null,
        status: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * Check website accessibility
   * @param {string} domain 
   * @returns {Object} Website accessibility status
   */
  async checkWebsiteAccessibility(domain) {
    console.log(`🌐 Checking website accessibility for ${domain}...`);
    
    try {
      const response = execSync(
        `timeout 30 curl -s -o /dev/null -w "%{http_code},%{time_total}" --max-time 30 --connect-timeout 10 https://${domain}`,
        { 
          encoding: 'utf8',
          timeout: 35000 
        }
      );

      const [statusCode, responseTime] = response.trim().split(',');
      const isAccessible = statusCode === '200';
      
      console.log(`   ${isAccessible ? '✅' : '❌'} HTTPS Access: ${statusCode} (${parseFloat(responseTime).toFixed(3)}s)`);
      
      return {
        domain,
        isAccessible,
        statusCode: parseInt(statusCode),
        responseTime: parseFloat(responseTime),
        status: isAccessible ? 'OK' : statusCode === '000' ? 'CONNECTION_FAILED' : 'HTTP_ERROR'
      };

    } catch (error) {
      // Check if this is a DNS or connection error
      let errorType = 'ERROR';
      let errorMessage = error.message;
      
      if (error.message.includes('Could not resolve host') || error.message.includes('name resolution')) {
        errorType = 'DNS_ERROR';
        errorMessage = `DNS resolution failed for ${domain}`;
      } else if (error.message.includes('Connection timed out') || error.message.includes('timeout')) {
        errorType = 'TIMEOUT';
        errorMessage = `Connection timeout for ${domain}`;
      } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
        errorType = 'SSL_ERROR';
        errorMessage = `SSL/TLS error for ${domain}`;
      }
      
      console.log(`   ❌ Accessibility check failed: ${errorMessage}`);
      
      return {
        domain,
        isAccessible: false,
        statusCode: null,
        responseTime: null,
        status: errorType,
        error: errorMessage
      };
    }
  }

  /**
   * Generate error report for critical SSL certificate issues
   * @param {Object} sslResult 
   * @returns {Object} Structured error report
   */
  generateErrorReport(sslResult) {
    const timestamp = new Date().toISOString();
    
    if (sslResult.isExpired) {
      return {
        source: "tools/website-health-check.js",
        errorCode: "E_SSL_CERT_EXPIRED",
        url: `https://${sslResult.domain}`,
        timestamp,
        details: `Das SSL-Zertifikat ist am ${new Date(sslResult.expirationDate).toLocaleDateString('de-DE')} abgelaufen.`,
        severity: "CRITICAL",
        expirationDate: sslResult.expirationDate,
        daysExpired: Math.abs(sslResult.daysUntilExpiration)
      };
    } else if (sslResult.status === 'CRITICAL') {
      return {
        source: "tools/website-health-check.js",
        errorCode: "E_SSL_CERT_EXPIRING_SOON",
        url: `https://${sslResult.domain}`,
        timestamp,
        details: `Das SSL-Zertifikat läuft in ${sslResult.daysUntilExpiration} Tagen ab.`,
        severity: "HIGH",
        expirationDate: sslResult.expirationDate,
        daysUntilExpiration: sslResult.daysUntilExpiration
      };
    }
    
    return null;
  }

  /**
   * Save health check report to file
   * @param {Object} report 
   */
  saveReport(report) {
    const reportsDir = path.join(process.cwd(), 'tools/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `website-health-${timestamp}.json`;
    const filepath = path.join(reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Health check report saved: ${filepath}`);
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck() {
    console.log('🏥 WEBSITE HEALTH CHECK');
    console.log('='.repeat(60));
    console.log(`📅 ${new Date().toLocaleString('de-DE')}`);
    console.log('');

    const results = {
      timestamp: new Date().toISOString(),
      domains: [],
      errors: [],
      summary: {
        totalDomains: this.domains.length,
        sslExpired: 0,
        sslCritical: 0,
        sslWarning: 0,
        sslOk: 0,
        websiteErrors: 0
      }
    };

    // Check each domain
    for (const domain of this.domains) {
      console.log(`\n🔍 Checking ${domain}:`);
      console.log('-'.repeat(40));
      
      const sslResult = await this.checkSSLCertificate(domain);
      const accessibilityResult = await this.checkWebsiteAccessibility(domain);
      
      // Update summary counters
      if (sslResult.status === 'EXPIRED') results.summary.sslExpired++;
      else if (sslResult.status === 'CRITICAL') results.summary.sslCritical++;
      else if (sslResult.status === 'WARNING') results.summary.sslWarning++;
      else if (sslResult.status === 'OK') results.summary.sslOk++;
      
      if (accessibilityResult.status === 'ERROR') results.summary.websiteErrors++;
      
      // Generate error reports for critical issues
      const errorReport = this.generateErrorReport(sslResult);
      if (errorReport) {
        results.errors.push(errorReport);
        console.log(`\n🚨 CRITICAL ERROR DETECTED:`);
        console.log(JSON.stringify(errorReport, null, 2));
      }
      
      results.domains.push({
        domain,
        ssl: sslResult,
        accessibility: accessibilityResult
      });
    }

    // Print summary
    console.log('\n📊 HEALTH CHECK SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ SSL OK: ${results.summary.sslOk}`);
    console.log(`⚠️  SSL Warning: ${results.summary.sslWarning}`);
    console.log(`🚨 SSL Critical: ${results.summary.sslCritical}`);
    console.log(`❌ SSL Expired: ${results.summary.sslExpired}`);
    console.log(`🌐 Website Errors: ${results.summary.websiteErrors}`);
    
    // Overall status
    const hasErrors = results.summary.sslExpired > 0 || results.summary.sslCritical > 0 || results.summary.websiteErrors > 0;
    console.log(`\n🎯 Overall Status: ${hasErrors ? '❌ CRITICAL ISSUES DETECTED' : '✅ ALL SYSTEMS HEALTHY'}`);
    
    // Save report
    this.saveReport(results);
    
    // Exit with appropriate code
    if (results.summary.sslExpired > 0) {
      console.log('\n💥 EXITING WITH ERROR: SSL certificates expired!');
      process.exit(1);
    } else if (results.summary.sslCritical > 0) {
      console.log('\n⚠️  EXITING WITH WARNING: SSL certificates expiring soon!');
      process.exit(2);
    }
    
    console.log('\n✅ Health check completed successfully!');
    return results;
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test') || args.includes('--simulate-expired');
  
  const healthChecker = new WebsiteHealthChecker({ testMode });
  
  if (testMode) {
    console.log('🧪 Running in TEST MODE - simulating SSL certificate expiration scenario');
    console.log('💡 This simulates the issue described in the GitHub issue');
    console.log('');
  }
  
  healthChecker.runHealthCheck().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = WebsiteHealthChecker;