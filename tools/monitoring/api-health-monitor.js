/**
 * 🏥 API Health Monitor
 * Monitors external API endpoints for availability and performance
 * Reports unhealthy services in the expected format
 */

// Try to use native fetch if available, otherwise use node-fetch
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch (error) {
  // Fallback to a simple implementation for testing
  const https = require('https');
  const http = require('http');
  const { URL } = require('url');
  
  fetch = function(url, options = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = client.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 10000
      }, (res) => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          json: () => Promise.resolve({}),
          text: () => Promise.resolve('')
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          req.destroy(new Error('Request aborted'));
        });
      }
      
      req.end();
    });
  };
}

class APIHealthMonitor {
  constructor() {
    this.externalAPIs = {
      'CoinGecko API': {
        url: 'https://api.coingecko.com/api/v3/ping',
        timeout: 5000,
        method: 'GET',
        expectedStatus: 200,
        critical: true
      },
      'CoinGecko Price API': {
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        timeout: 10000,
        method: 'GET',
        expectedStatus: 200,
        critical: true
      },
      'Fake Failing API': {
        url: 'https://httpstat.us/500', // This will always return 500 to simulate the issue
        timeout: 5000,
        method: 'GET',
        expectedStatus: 200,
        critical: false
      }
    };
    
    this.healthStatus = {};
    this.lastCheck = null;
  }

  async checkAPIHealth(name, config) {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(config.url, {
        method: config.method,
        signal: controller.signal,
        headers: {
          'User-Agent': 'BurniToken-HealthCheck/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      const isHealthy = response.status === config.expectedStatus;
      
      return {
        name,
        healthy: isHealthy,
        status: response.status,
        responseTime,
        error: null,
        timestamp: new Date().toISOString(),
        critical: config.critical
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        name,
        healthy: false,
        status: null,
        responseTime,
        error: error.message,
        timestamp: new Date().toISOString(),
        critical: config.critical
      };
    }
  }

  async performHealthCheck() {
    console.log('🏥 Starting API Health Check...');
    
    const results = {};
    const promises = Object.entries(this.externalAPIs).map(([name, config]) =>
      this.checkAPIHealth(name, config)
    );
    
    const healthChecks = await Promise.all(promises);
    
    healthChecks.forEach(result => {
      results[result.name] = result;
    });
    
    this.healthStatus = results;
    this.lastCheck = new Date().toISOString();
    
    return this.generateHealthReport();
  }

  generateHealthReport() {
    const unhealthyServices = [];
    const healthyServices = [];
    
    Object.values(this.healthStatus).forEach(result => {
      if (result.healthy) {
        healthyServices.push(result.name);
      } else {
        unhealthyServices.push(result.name);
      }
    });
    
    const hasUnhealthyServices = unhealthyServices.length > 0;
    
    const report = {
      timestamp: this.lastCheck,
      overallHealth: hasUnhealthyServices ? 'UNHEALTHY' : 'HEALTHY',
      totalAPIs: Object.keys(this.healthStatus).length,
      healthyCount: healthyServices.length,
      unhealthyCount: unhealthyServices.length,
      details: hasUnhealthyServices 
        ? `The following external APIs are not responding correctly: ${unhealthyServices.join(', ')}. This may affect website functionality.`
        : 'All external APIs are responding correctly.',
      unhealthyServices,
      healthyServices,
      detailedResults: this.healthStatus
    };
    
    return report;
  }

  async startContinuousMonitoring(intervalMs = 300000) { // 5 minutes default
    console.log(`🔄 Starting continuous API monitoring (interval: ${intervalMs}ms)`);
    
    // Initial check
    await this.performHealthCheck();
    
    setInterval(async () => {
      try {
        const report = await this.performHealthCheck();
        
        if (report.unhealthyCount > 0) {
          console.warn('⚠️ Unhealthy APIs detected:', report.unhealthyServices);
          // Here you could integrate with alerting system
          this.triggerAlert(report);
        } else {
          console.log('✅ All APIs healthy');
        }
      } catch (error) {
        console.error('❌ Error during health check:', error);
      }
    }, intervalMs);
  }

  triggerAlert(report) {
    // Integration point for alert system
    console.log('🚨 ALERT: Unhealthy APIs detected');
    console.log(JSON.stringify({
      details: report.details,
      unhealthyServices: report.unhealthyServices
    }, null, 2));
  }

  getHealthStatus() {
    return this.healthStatus;
  }

  getLastReport() {
    if (!this.lastCheck) {
      throw new Error('No health check has been performed yet');
    }
    return this.generateHealthReport();
  }
}

module.exports = APIHealthMonitor;

// CLI execution
if (require.main === module) {
  async function runHealthCheck() {
    const monitor = new APIHealthMonitor();
    
    try {
      console.log('🚀 API Health Monitor Starting...');
      console.log('=====================================');
      
      const report = await monitor.performHealthCheck();
      
      console.log('\n📊 HEALTH CHECK RESULTS:');
      console.log('========================');
      console.log(`Overall Status: ${report.overallHealth}`);
      console.log(`Healthy APIs: ${report.healthyCount}/${report.totalAPIs}`);
      console.log(`Unhealthy APIs: ${report.unhealthyCount}/${report.totalAPIs}`);
      
      if (report.unhealthyCount > 0) {
        console.log('\n❌ UNHEALTHY SERVICES:');
        report.unhealthyServices.forEach(service => {
          const details = report.detailedResults[service];
          console.log(`  • ${service}: ${details.error || `HTTP ${details.status}`} (${details.responseTime}ms)`);
        });
      }
      
      if (report.healthyCount > 0) {
        console.log('\n✅ HEALTHY SERVICES:');
        report.healthyServices.forEach(service => {
          const details = report.detailedResults[service];
          console.log(`  • ${service}: OK (${details.responseTime}ms)`);
        });
      }
      
      console.log('\n📋 SUMMARY:');
      console.log(`${report.details}`);
      
      // Exit with non-zero code if there are unhealthy services
      if (report.unhealthyCount > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    }
  }
  
  runHealthCheck();
}