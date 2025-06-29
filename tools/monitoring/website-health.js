#!/usr/bin/env node

/**
 * Website Health Check Script - SSL Connection Timeout Handler
 * Monitors burnitoken.website for SSL connection issues and logs to website-health.log
 */

const https = require('https');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

const WEBSITE_URL = 'https://burnitoken.website';
const HEALTH_LOG_PATH = path.join(__dirname, 'website-health.log');
const SSL_TIMEOUT = 15000; // 15 seconds for SSL connections
const CONNECTION_TIMEOUT = 10000; // 10 seconds for general connections

class WebsiteHealthMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      domain: 'burnitoken.website',
      checks: [],
      status: 'MONITORING'
    };
  }

  async performHealthCheck() {
    console.log('🔍 Website Health Check gestartet...');
    console.log(`🕐 Timestamp: ${this.results.timestamp}`);
    console.log('='.repeat(60));

    try {
      // DNS Resolution Check
      const dnsResult = await this.checkDNS();
      this.results.checks.push(dnsResult);

      // SSL Connection Check (with specific timeout handling)
      const sslResult = await this.checkSSLConnection();
      this.results.checks.push(sslResult);

      // HTTP Response Check
      const httpResult = await this.checkHTTPResponse();
      this.results.checks.push(httpResult);

      // Overall status assessment
      this.assessOverallStatus();

      // Log results
      await this.logResults();

      // Display summary
      this.displaySummary();

    } catch (error) {
      const errorResult = {
        type: 'SYSTEM_ERROR',
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.results.checks.push(errorResult);
      this.results.status = 'SYSTEM_ERROR';
      
      await this.logCriticalError(error);
      console.error('❌ Kritischer System-Fehler:', error.message);
    }

    return this.results;
  }

  async checkDNS() {
    console.log('🌐 DNS-Auflösung wird überprüft...');
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      dns.lookup('burnitoken.website', (err, address) => {
        const duration = Date.now() - startTime;
        
        if (err) {
          const result = {
            type: 'DNS_CHECK',
            status: 'FAILED',
            error: err.message,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
          };
          
          console.log(`   ❌ DNS-Auflösung fehlgeschlagen: ${err.message}`);
          resolve(result);
        } else {
          const result = {
            type: 'DNS_CHECK',
            status: 'SUCCESS',
            address: address,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
          };
          
          console.log(`   ✅ DNS-Auflösung erfolgreich: ${address}`);
          resolve(result);
        }
      });
    });
  }

  async checkSSLConnection() {
    console.log('🔐 SSL-Verbindung wird überprüft...');
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const options = {
        hostname: 'burnitoken.website',
        port: 443,
        method: 'HEAD',
        timeout: SSL_TIMEOUT,
        headers: {
          'User-Agent': 'BurniToken-Health-Monitor/1.0'
        }
      };

      const req = https.request(options, (res) => {
        const duration = Date.now() - startTime;
        
        const result = {
          type: 'SSL_CONNECTION',
          status: 'SUCCESS',
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          sslInfo: {
            authorized: res.socket.authorized,
            protocol: res.socket.getProtocol ? res.socket.getProtocol() : 'unknown'
          },
          timestamp: new Date().toISOString()
        };
        
        console.log(`   ✅ SSL-Verbindung erfolgreich: ${res.statusCode} (${duration}ms)`);
        resolve(result);
      });

      req.on('error', (err) => {
        const duration = Date.now() - startTime;
        
        const result = {
          type: 'SSL_CONNECTION',
          status: 'FAILED',
          error: err.message,
          errorCode: err.code,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        };
        
        if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
          result.errorType = 'SSL_TIMEOUT';
          console.log(`   ⏰ SSL-Verbindungs-Timeout nach ${duration}ms`);
        } else {
          console.log(`   ❌ SSL-Verbindungsfehler: ${err.message}`);
        }
        
        resolve(result);
      });

      req.on('timeout', () => {
        req.destroy();
        const duration = Date.now() - startTime;
        
        const result = {
          type: 'SSL_CONNECTION',
          status: 'TIMEOUT',
          errorType: 'SSL_TIMEOUT',
          error: 'SSL-Verbindungs-Timeout',
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        };
        
        console.log(`   ⏰ SSL-Verbindungs-Timeout nach ${SSL_TIMEOUT}ms`);
        resolve(result);
      });

      req.end();
    });
  }

  async checkHTTPResponse() {
    console.log('🌍 HTTP-Response wird überprüft...');
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = https.get(WEBSITE_URL, {
        timeout: CONNECTION_TIMEOUT,
        headers: {
          'User-Agent': 'BurniToken-Health-Monitor/1.0'
        }
      }, (res) => {
        const duration = Date.now() - startTime;
        
        const result = {
          type: 'HTTP_RESPONSE',
          status: 'SUCCESS',
          statusCode: res.statusCode,
          headers: {
            server: res.headers.server,
            contentType: res.headers['content-type']
          },
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        };
        
        console.log(`   ✅ HTTP-Response erfolgreich: ${res.statusCode} (${duration}ms)`);
        resolve(result);
      });

      req.on('error', (err) => {
        const duration = Date.now() - startTime;
        
        const result = {
          type: 'HTTP_RESPONSE',
          status: 'FAILED',
          error: err.message,
          errorCode: err.code,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        };
        
        console.log(`   ❌ HTTP-Response Fehler: ${err.message}`);
        resolve(result);
      });

      req.on('timeout', () => {
        req.destroy();
        const duration = Date.now() - startTime;
        
        const result = {
          type: 'HTTP_RESPONSE',
          status: 'TIMEOUT',
          error: 'HTTP-Response Timeout',
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        };
        
        console.log(`   ⏰ HTTP-Response Timeout nach ${CONNECTION_TIMEOUT}ms`);
        resolve(result);
      });
    });
  }

  assessOverallStatus() {
    const failedChecks = this.results.checks.filter(check => 
      check.status === 'FAILED' || check.status === 'TIMEOUT'
    );
    
    const sslTimeoutCheck = this.results.checks.find(check => 
      check.type === 'SSL_CONNECTION' && check.errorType === 'SSL_TIMEOUT'
    );

    if (sslTimeoutCheck) {
      this.results.status = 'SSL_TIMEOUT_ERROR';
    } else if (failedChecks.length === 0) {
      this.results.status = 'HEALTHY';
    } else if (failedChecks.length < this.results.checks.length) {
      this.results.status = 'DEGRADED';
    } else {
      this.results.status = 'CRITICAL';
    }
  }

  async logResults() {
    const logEntry = {
      timestamp: this.results.timestamp,
      status: this.results.status,
      domain: this.results.domain,
      checks: this.results.checks,
      summary: this.generateSummary()
    };

    // Ensure log directory exists
    const logDir = path.dirname(HEALTH_LOG_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Append to log file
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(HEALTH_LOG_PATH, logLine, 'utf8');
    
    console.log(`📝 Health Check geloggt: ${HEALTH_LOG_PATH}`);
  }

  async logCriticalError(error) {
    const criticalError = {
      details: "Ein kritischer Fehler wurde im Health Check Skript festgestellt. Bitte sofort untersuchen.",
      originalMessage: error.message,
      timestamp: new Date().toISOString(),
      logFile: HEALTH_LOG_PATH
    };

    // Create error log entry matching the issue format
    const errorLogEntry = {
      timestamp: criticalError.timestamp,
      status: 'CRITICAL_ERROR',
      error: criticalError,
      domain: 'burnitoken.website'
    };

    const logLine = JSON.stringify(errorLogEntry) + '\n';
    fs.appendFileSync(HEALTH_LOG_PATH, logLine, 'utf8');
  }

  generateSummary() {
    const successfulChecks = this.results.checks.filter(check => check.status === 'SUCCESS').length;
    const totalChecks = this.results.checks.length;
    
    return {
      totalChecks,
      successfulChecks,
      failedChecks: totalChecks - successfulChecks,
      overallStatus: this.results.status
    };
  }

  displaySummary() {
    console.log('\n📊 HEALTH CHECK ZUSAMMENFASSUNG:');
    console.log('='.repeat(60));
    
    const summary = this.generateSummary();
    console.log(`📈 Status: ${this.results.status}`);
    console.log(`✅ Erfolgreiche Checks: ${summary.successfulChecks}/${summary.totalChecks}`);
    console.log(`❌ Fehlgeschlagene Checks: ${summary.failedChecks}`);
    
    // Show specific issues
    const sslTimeout = this.results.checks.find(check => 
      check.type === 'SSL_CONNECTION' && check.errorType === 'SSL_TIMEOUT'
    );
    
    if (sslTimeout) {
      console.log('\n🚨 KRITISCHES PROBLEM ERKANNT:');
      console.log(`   ⏰ SSL-Verbindungs-Timeout für https://burnitoken.website`);
      console.log(`   📅 Zeitstempel: ${sslTimeout.timestamp}`);
      console.log(`   📝 Details im Log: ${HEALTH_LOG_PATH}`);
    }
    
    console.log(`\n📝 Vollständiger Report: ${HEALTH_LOG_PATH}`);
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new WebsiteHealthMonitor();
  monitor.performHealthCheck()
    .then((results) => {
      process.exit(results.status === 'HEALTHY' ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fataler Fehler:', error);
      process.exit(2);
    });
}

module.exports = WebsiteHealthMonitor;