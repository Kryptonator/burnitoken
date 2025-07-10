#!/usr/bin/env node

/**
 * Website Health Check System
 * Detects SSL connection timeouts and other critical website issues
 * Logs to format compatible with issue reports
 */

const https = require('https');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

class WebsiteHealthChecker {
  constructor() {
    this.domains = ['burnitoken.website', 'burnitoken.com', 'www.burnitoken.website'];
    this.sslTimeout = 8000; // 8 seconds for SSL handshake
    this.connectionTimeout = 15000; // 15 seconds total connection timeout
    this.maxRetries = 3;
    this.logFile = path.join(__dirname, 'website-health.log');
  }

  /**
   * Main health check method
   */
  async performHealthCheck() {
    console.log('🏥 Website Health Check gestartet...');
    console.log('='.repeat(50));

    const timestamp = new Date().toISOString();
    const results = [];

    for (const domain of this.domains) {
      console.log(`\n🔍 Überprüfe ${domain}...`);
      
      try {
        const result = await this.checkDomainHealth(domain);
        results.push(result);
        
        if (result.critical) {
          await this.logCriticalError(result, timestamp);
        }
        
        this.displayResult(result);
      } catch (error) {
        const errorResult = {
          domain,
          status: 'CRITICAL_ERROR',
          error: error.message,
          critical: true,
          timestamp
        };
        results.push(errorResult);
        await this.logCriticalError(errorResult, timestamp);
        console.log(`❌ Kritischer Fehler: ${error.message}`);
      }
    }

    await this.generateHealthReport(results, timestamp);
    console.log('\n✅ Health Check abgeschlossen');
    
    return results;
  }

  /**
   * Comprehensive domain health check
   */
  async checkDomainHealth(domain) {
    const result = {
      domain,
      timestamp: new Date().toISOString(),
      dns: null,
      ssl: null,
      https: null,
      critical: false,
      warnings: []
    };

    // DNS Check
    try {
      result.dns = await this.checkDNS(domain);
    } catch (error) {
      result.dns = { status: 'FAILED', error: error.message };
      result.critical = true;
    }

    // SSL Connection Check with specific timeout detection
    try {
      result.ssl = await this.checkSSLConnection(domain);
      if (result.ssl.status === 'SSL_TIMEOUT') {
        result.critical = true;
      }
    } catch (error) {
      result.ssl = { status: 'FAILED', error: error.message };
      result.critical = true;
    }

    // HTTPS Check
    try {
      result.https = await this.checkHTTPS(domain);
    } catch (error) {
      result.https = { status: 'FAILED', error: error.message };
      if (!result.critical && result.dns?.status === 'OK') {
        result.critical = true;
      }
    }

    return result;
  }

  /**
   * DNS resolution check
   */
  async checkDNS(domain) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          status: 'TIMEOUT',
          error: 'DNS resolution timeout',
          duration: this.connectionTimeout
        });
      }, this.connectionTimeout);

      dns.lookup(domain, (err, address) => {
        clearTimeout(timeout);
        
        if (err) {
          resolve({
            status: 'FAILED',
            error: err.message,
            code: err.code
          });
        } else {
          resolve({
            status: 'OK',
            ip: address,
            duration: Date.now() - performance.now()
          });
        }
      });
    });
  }

  /**
   * SSL connection check with specific timeout detection
   */
  async checkSSLConnection(domain) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let resolved = false;

      // SSL-specific timeout
      const sslTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({
            status: 'SSL_TIMEOUT',
            error: `SSL-Verbindungs-Timeout für https://${domain}`,
            duration: this.sslTimeout,
            timeout: 'SSL_HANDSHAKE'
          });
        }
      }, this.sslTimeout);

      // Overall connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({
            status: 'CONNECTION_TIMEOUT',
            error: `Connection timeout für https://${domain}`,
            duration: this.connectionTimeout,
            timeout: 'FULL_CONNECTION'
          });
        }
      }, this.connectionTimeout);

      const options = {
        hostname: domain,
        port: 443,
        method: 'HEAD',
        timeout: this.connectionTimeout
      };

      const req = https.request(options, (res) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(sslTimeout);
          clearTimeout(connectionTimeout);
          
          const duration = Date.now() - startTime;
          resolve({
            status: 'OK',
            statusCode: res.statusCode,
            duration,
            sslProtocol: res.socket?.getProtocol?.() || 'unknown',
            cipher: res.socket?.getCipher?.() || 'unknown'
          });
        }
      });

      req.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(sslTimeout);
          clearTimeout(connectionTimeout);
          
          const duration = Date.now() - startTime;
          
          // Detect SSL-specific errors
          if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || 
              err.message.includes('SSL') || err.message.includes('TLS')) {
            resolve({
              status: 'SSL_ERROR',
              error: `SSL-Verbindungs-Timeout für https://${domain}`,
              originalError: err.message,
              code: err.code,
              duration
            });
          } else {
            resolve({
              status: 'CONNECTION_ERROR',
              error: err.message,
              code: err.code,
              duration
            });
          }
        }
      });

      req.on('timeout', () => {
        if (!resolved) {
          resolved = true;
          req.destroy();
          clearTimeout(sslTimeout);
          clearTimeout(connectionTimeout);
          
          resolve({
            status: 'REQUEST_TIMEOUT',
            error: `Request timeout für https://${domain}`,
            duration: this.connectionTimeout
          });
        }
      });

      req.end();
    });
  }

  /**
   * HTTPS connectivity check
   */
  async checkHTTPS(domain) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const url = `https://${domain}`;

      const req = https.get(url, (res) => {
        const duration = Date.now() - startTime;
        resolve({
          status: 'OK',
          statusCode: res.statusCode,
          duration,
          headers: {
            server: res.headers.server,
            'content-type': res.headers['content-type']
          }
        });
      });

      req.on('error', (err) => {
        const duration = Date.now() - startTime;
        resolve({
          status: 'FAILED',
          error: err.message,
          code: err.code,
          duration
        });
      });

      req.setTimeout(this.connectionTimeout, () => {
        req.destroy();
        resolve({
          status: 'TIMEOUT',
          error: 'HTTPS request timeout',
          duration: this.connectionTimeout
        });
      });
    });
  }

  /**
   * Display result in console
   */
  displayResult(result) {
    const domain = result.domain;
    
    if (result.critical) {
      console.log(`❌ ${domain} - KRITISCHER FEHLER`);
    } else {
      console.log(`✅ ${domain} - OK`);
    }

    // DNS Status
    if (result.dns?.status === 'OK') {
      console.log(`   DNS: ✅ ${result.dns.ip}`);
    } else {
      console.log(`   DNS: ❌ ${result.dns?.error || 'Fehler'}`);
    }

    // SSL Status
    if (result.ssl?.status === 'OK') {
      console.log(`   SSL: ✅ ${result.ssl.duration}ms`);
    } else if (result.ssl?.status === 'SSL_TIMEOUT') {
      console.log(`   SSL: ⏰ TIMEOUT (${result.ssl.duration}ms)`);
    } else {
      console.log(`   SSL: ❌ ${result.ssl?.error || 'Fehler'}`);
    }

    // HTTPS Status
    if (result.https?.status === 'OK') {
      console.log(`   HTTPS: ✅ ${result.https.statusCode} (${result.https.duration}ms)`);
    } else {
      console.log(`   HTTPS: ❌ ${result.https?.error || 'Fehler'}`);
    }
  }

  /**
   * Log critical errors in the format matching the issue
   */
  async logCriticalError(result, timestamp) {
    const logEntry = {
      details: "Ein kritischer Fehler wurde im Health Check Skript festgestellt. Bitte sofort untersuchen.",
      originalMessage: result.ssl?.error || result.error || `Critical error for ${result.domain}`,
      timestamp,
      logFile: this.logFile,
      domain: result.domain,
      errorType: result.ssl?.status || 'UNKNOWN_ERROR'
    };

    const logLine = `${timestamp} [CRITICAL] ${JSON.stringify(logEntry)}\n`;
    
    try {
      await fs.promises.appendFile(this.logFile, logLine);
      console.log(`🔴 Kritischer Fehler geloggt: ${this.logFile}`);
    } catch (error) {
      console.error(`❌ Fehler beim Schreiben der Log-Datei: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive health report
   */
  async generateHealthReport(results, timestamp) {
    const report = {
      timestamp,
      summary: {
        total: results.length,
        healthy: results.filter(r => !r.critical).length,
        critical: results.filter(r => r.critical).length,
        sslTimeouts: results.filter(r => r.ssl?.status === 'SSL_TIMEOUT').length
      },
      domains: results,
      recommendations: this.generateRecommendations(results)
    };

    const reportFile = path.join(__dirname, `health-report-${timestamp.replace(/[:.]/g, '-')}.json`);
    
    try {
      await fs.promises.writeFile(reportFile, JSON.stringify(report, null, 2));
      console.log(`📄 Health Report erstellt: ${reportFile}`);
    } catch (error) {
      console.error(`❌ Fehler beim Erstellen des Reports: ${error.message}`);
    }

    return report;
  }

  /**
   * Generate recommendations based on results
   */
  generateRecommendations(results) {
    const recommendations = [];

    const sslTimeouts = results.filter(r => r.ssl?.status === 'SSL_TIMEOUT');
    if (sslTimeouts.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'SSL Connection Timeouts',
        domains: sslTimeouts.map(r => r.domain),
        action: 'Überprüfen Sie die SSL-Konfiguration und Zertifikate für die betroffenen Domains'
      });
    }

    const dnsFailures = results.filter(r => r.dns?.status !== 'OK');
    if (dnsFailures.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'DNS Resolution Failures',
        domains: dnsFailures.map(r => r.domain),
        action: 'DNS-Konfiguration überprüfen und sicherstellen, dass die A-Records korrekt sind'
      });
    }

    const httpsFailures = results.filter(r => r.https?.status !== 'OK');
    if (httpsFailures.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'HTTPS Connectivity Issues',
        domains: httpsFailures.map(r => r.domain),
        action: 'Web-Server-Konfiguration und HTTPS-Setup überprüfen'
      });
    }

    return recommendations;
  }

  /**
   * Run health check with retry logic
   */
  async runWithRetries() {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`\n🔄 Health Check Versuch ${attempt}/${this.maxRetries}`);
        const results = await this.performHealthCheck();
        
        // If we have critical errors, retry
        const criticalErrors = results.filter(r => r.critical);
        if (criticalErrors.length === 0 || attempt === this.maxRetries) {
          return results;
        }
        
        console.log(`⚠️  ${criticalErrors.length} kritische Fehler gefunden. Wiederhole in 5 Sekunden...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        lastError = error;
        console.error(`❌ Health Check Fehler (Versuch ${attempt}): ${error.message}`);
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    throw lastError || new Error('Alle Health Check Versuche fehlgeschlagen');
  }
}

// CLI Interface
if (require.main === module) {
  const checker = new WebsiteHealthChecker();
  
  checker.runWithRetries()
    .then(results => {
      const criticalCount = results.filter(r => r.critical).length;
      process.exit(criticalCount > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('🚨 Health Check Fehler:', error.message);
      process.exit(1);
    });
}

module.exports = WebsiteHealthChecker;