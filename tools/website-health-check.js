// tools/website-health-check.js
// Comprehensive website health monitoring including SSL certificate expiration
// Generates critical alerts for expired SSL certificates

const { execSync } = require('child_process');
const https = require('https');
const crypto = require('crypto');

class WebsiteHealthCheck {
  constructor() {
    this.domain = 'burnitoken.com';
    this.alertThresholdDays = 7; // Alert if certificate expires within 7 days
    this.results = [];
  }

  /**
   * Main health check orchestrator
   */
  async runHealthCheck() {
    console.log('🏥 WEBSITE HEALTH CHECK');
    console.log('='.repeat(50));
    console.log(`🌐 Domain: ${this.domain}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log('');

    try {
      // SSL Certificate Expiration Check
      await this.checkSSLCertificateExpiration();

      // Additional health checks
      await this.checkHTTPSConnectivity();
      await this.checkResponseTime();

      // Generate final report
      this.generateHealthReport();
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.results.push({
        source: 'tools/website-health-check.js',
        errorCode: 'E_HEALTH_CHECK_FAILED',
        url: `https://${this.domain}`,
        timestamp: new Date().toISOString(),
        details: error.message,
      });
    }
  }

  /**
   * Check SSL certificate expiration status
   */
  async checkSSLCertificateExpiration() {
    console.log('🔐 SSL Certificate Expiration Check...');

    try {
      const certInfo = await this.getSSLCertificateInfo();

      if (!certInfo) {
        throw new Error('Unable to retrieve SSL certificate information');
      }

      const { validFrom, validTo, issuer, subject } = certInfo;
      const now = new Date();
      const expirationDate = new Date(validTo);
      const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

      console.log(`   📅 Valid From: ${validFrom}`);
      console.log(`   📅 Valid To: ${validTo}`);
      console.log(`   🏢 Issuer: ${issuer}`);
      console.log(`   🌐 Subject: ${subject}`);
      console.log(`   ⏱️  Days until expiration: ${daysUntilExpiration}`);

      // Check if certificate is expired
      if (expirationDate < now) {
        const expiredDays = Math.ceil((now - expirationDate) / (1000 * 60 * 60 * 24));
        const error = {
          source: 'tools/website-health-check.js',
          errorCode: 'E_SSL_CERT_EXPIRED',
          url: `https://${this.domain}`,
          timestamp: new Date().toISOString(),
          details: `Das SSL-Zertifikat ist am ${expirationDate.toISOString().split('T')[0]} abgelaufen.`,
          expiredDays,
          certificate: {
            validFrom,
            validTo,
            issuer,
            subject,
          },
        };

        console.log('   ❌ SSL Certificate Status: EXPIRED');
        console.log(`   ⚠️  Certificate expired ${expiredDays} days ago`);

        this.results.push(error);
        return false;
      }

      // Check if certificate expires soon
      if (daysUntilExpiration <= this.alertThresholdDays) {
        const warning = {
          source: 'tools/website-health-check.js',
          errorCode: 'E_SSL_CERT_EXPIRING_SOON',
          url: `https://${this.domain}`,
          timestamp: new Date().toISOString(),
          details: `Das SSL-Zertifikat läuft in ${daysUntilExpiration} Tagen ab (${validTo}).`,
          daysUntilExpiration,
          certificate: {
            validFrom,
            validTo,
            issuer,
            subject,
          },
        };

        console.log('   ⚠️  SSL Certificate Status: EXPIRING SOON');
        console.log(`   📢 Certificate expires in ${daysUntilExpiration} days`);

        this.results.push(warning);
        return false;
      }

      console.log('   ✅ SSL Certificate Status: VALID');
      console.log(`   ✓ Certificate is valid for ${daysUntilExpiration} more days`);
      return true;
    } catch (error) {
      console.log(`   ❌ SSL Certificate Check: FAILED`);
      console.log(`   🔍 Error: ${error.message}`);

      this.results.push({
        source: 'tools/website-health-check.js',
        errorCode: 'E_SSL_CERT_CHECK_FAILED',
        url: `https://${this.domain}`,
        timestamp: new Date().toISOString(),
        details: `SSL certificate check failed: ${error.message}`,
      });

      return false;
    }
  }

  /**
   * Get SSL certificate information using OpenSSL
   */
  async getSSLCertificateInfo() {
    try {
      // Get certificate dates
      const datesOutput = execSync(
        `echo | openssl s_client -servername ${this.domain} -connect ${this.domain}:443 2>/dev/null | openssl x509 -noout -dates`,
        { encoding: 'utf8', timeout: 10000 },
      );

      // Get certificate subject and issuer
      const subjectOutput = execSync(
        `echo | openssl s_client -servername ${this.domain} -connect ${this.domain}:443 2>/dev/null | openssl x509 -noout -subject`,
        { encoding: 'utf8', timeout: 10000 },
      );

      const issuerOutput = execSync(
        `echo | openssl s_client -servername ${this.domain} -connect ${this.domain}:443 2>/dev/null | openssl x509 -noout -issuer`,
        { encoding: 'utf8', timeout: 10000 },
      );

      // Parse the output
      const validFromMatch = datesOutput.match(/notBefore=(.+)/);
      const validToMatch = datesOutput.match(/notAfter=(.+)/);
      const subjectMatch = subjectOutput.match(/subject=(.+)/);
      const issuerMatch = issuerOutput.match(/issuer=(.+)/);

      if (!validFromMatch || !validToMatch) {
        throw new Error('Unable to parse certificate dates');
      }

      return {
        validFrom: validFromMatch[1].trim(),
        validTo: validToMatch[1].trim(),
        subject: subjectMatch ? subjectMatch[1].trim() : 'Unknown',
        issuer: issuerMatch ? issuerMatch[1].trim() : 'Unknown',
      };
    } catch (error) {
      // Fallback: try using Node.js native approach
      return await this.getSSLCertificateInfoFallback();
    }
  }

  /**
   * Fallback method using Node.js HTTPS module
   */
  async getSSLCertificateInfoFallback() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.domain,
        port: 443,
        method: 'GET',
        timeout: 10000,
        rejectUnauthorized: false, // Allow checking expired certificates
      };

      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();

        if (!cert || Object.keys(cert).length === 0) {
          reject(new Error('No certificate found'));
          return;
        }

        resolve({
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          subject: cert.subject ? `CN=${cert.subject.CN}` : 'Unknown',
          issuer: cert.issuer ? `CN=${cert.issuer.CN}` : 'Unknown',
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('SSL certificate check timed out'));
      });

      req.end();
    });
  }

  /**
   * Check HTTPS connectivity
   */
  async checkHTTPSConnectivity() {
    console.log('🌐 HTTPS Connectivity Check...');

    return new Promise((resolve) => {
      const startTime = Date.now();

      const req = https.get(`https://${this.domain}`, (res) => {
        const responseTime = Date.now() - startTime;
        console.log(`   ✅ HTTPS Response: ${res.statusCode} (${responseTime}ms)`);
        resolve(true);
      });

      req.on('error', (err) => {
        console.log(`   ❌ HTTPS Connectivity: FAILED`);
        console.log(`   🔍 Error: ${err.message}`);

        this.results.push({
          source: 'tools/website-health-check.js',
          errorCode: 'E_HTTPS_CONNECTIVITY_FAILED',
          url: `https://${this.domain}`,
          timestamp: new Date().toISOString(),
          details: `HTTPS connectivity failed: ${err.message}`,
        });

        resolve(false);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        console.log(`   ❌ HTTPS Connectivity: TIMEOUT`);
        resolve(false);
      });
    });
  }

  /**
   * Check response time
   */
  async checkResponseTime() {
    console.log('⏱️  Response Time Check...');

    const startTime = Date.now();
    try {
      await this.checkHTTPSConnectivity();
      const responseTime = Date.now() - startTime;

      if (responseTime > 5000) {
        console.log(`   ⚠️  Response Time: SLOW (${responseTime}ms)`);
        this.results.push({
          source: 'tools/website-health-check.js',
          errorCode: 'E_SLOW_RESPONSE_TIME',
          url: `https://${this.domain}`,
          timestamp: new Date().toISOString(),
          details: `Slow response time: ${responseTime}ms`,
        });
      } else {
        console.log(`   ✅ Response Time: OK (${responseTime}ms)`);
      }
    } catch (error) {
      console.log(`   ❌ Response Time Check: FAILED`);
    }
  }

  /**
   * Generate comprehensive health report
   */
  generateHealthReport() {
    console.log('\n📊 HEALTH CHECK SUMMARY');
    console.log('='.repeat(50));

    if (this.results.length === 0) {
      console.log('✅ All health checks passed!');
      console.log(`🌐 ${this.domain} is healthy and operational`);
      return;
    }

    console.log(`⚠️  Found ${this.results.length} issue(s):`);
    console.log('');

    this.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.errorCode}`);
      console.log(`   🌐 URL: ${result.url}`);
      console.log(`   📅 Time: ${result.timestamp}`);
      console.log(`   📝 Details: ${result.details}`);
      console.log('');

      // Output JSON format for automation
      if (result.errorCode === 'E_SSL_CERT_EXPIRED') {
        console.log('🤖 Automation Alert (JSON):');
        console.log(JSON.stringify(result, null, 2));
        console.log('');
      }
    });

    // Critical alerts
    const criticalIssues = this.results.filter(
      (r) => r.errorCode === 'E_SSL_CERT_EXPIRED' || r.errorCode === 'E_SSL_CERT_EXPIRING_SOON',
    );

    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES DETECTED:');
      criticalIssues.forEach((issue) => {
        console.log(`   • ${issue.errorCode}: ${issue.details}`);
      });
      console.log('');
      console.log('📋 RECOMMENDED ACTIONS:');
      console.log('   1. Renew SSL certificate immediately');
      console.log('   2. Update DNS/CDN configuration');
      console.log('   3. Verify certificate installation');
      console.log('   4. Test website accessibility');
    }
  }
}

// CLI execution
if (require.main === module) {
  const healthCheck = new WebsiteHealthCheck();
  healthCheck.runHealthCheck().catch(console.error);
}

module.exports = WebsiteHealthCheck;
