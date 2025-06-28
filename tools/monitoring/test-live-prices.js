/**
 * Price Feed Monitor - Detects critical issues with price API endpoints
 * Error Code: PF-5001 - Invalid endpoint response
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

class PriceFeedMonitor {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.endpoints = [
      {
        name: 'CoinGecko XRP Price',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd',
        validator: (data) => {
          return !!(data && data.ripple && data.ripple.usd && typeof data.ripple.usd === 'number');
        },
        critical: true,
      },
      {
        name: 'CoinGecko API Health',
        url: 'https://api.coingecko.com/api/v3/ping',
        validator: (data) => {
          return !!(data && data.gecko_says === 'To the Moon!');
        },
        critical: false,
      },
    ];
  }

  /**
   * Main monitoring function
   */
  async runPriceFeedMonitoring() {
    console.log('🚨 PRICE FEED MONITORING');
    console.log('========================');
    console.log('🎯 Monitoring price feed endpoints for critical issues');
    console.log('🔍 Checking for invalid responses, timeouts, and data integrity');
    console.log('');

    const timestamp = new Date().toISOString();
    let criticalErrorDetected = false;

    for (const endpoint of this.endpoints) {
      try {
        console.log(`🔍 Testing endpoint: ${endpoint.name}`);
        const result = await this.testEndpoint(endpoint);

        if (!result.valid) {
          const error = {
            service: 'price-feed-monitor',
            timestamp: timestamp,
            errorCode: 'PF-5001',
            details: 'Der Endpunkt lieferte eine ungültige Antwort.',
            endpoint: endpoint.name,
            url: endpoint.url,
            specificError: result.error,
            critical: endpoint.critical,
          };

          this.errors.push(error);
          if (endpoint.critical) {
            criticalErrorDetected = true;
          }

          console.log(`❌ CRITICAL ERROR: ${endpoint.name}`);
          console.log(`   Error Code: ${error.errorCode}`);
          console.log(`   Details: ${error.details}`);
          console.log(`   Specific Error: ${result.error}`);
          console.log('');
        } else {
          console.log(`✅ ${endpoint.name}: Valid response`);
          console.log(`   Response time: ${result.responseTime}ms`);
          console.log(`   Data integrity: OK`);
          console.log('');
        }
      } catch (error) {
        const criticalError = {
          service: 'price-feed-monitor',
          timestamp: timestamp,
          errorCode: 'PF-5001',
          details: 'Der Endpunkt lieferte eine ungültige Antwort.',
          endpoint: endpoint.name,
          url: endpoint.url,
          specificError: error.message,
          critical: endpoint.critical,
        };

        this.errors.push(criticalError);
        if (endpoint.critical) {
          criticalErrorDetected = true;
        }

        console.log(`❌ EXCEPTION: ${endpoint.name}`);
        console.log(`   Error: ${error.message}`);
        console.log('');
      }
    }

    // Generate monitoring report
    await this.generateMonitoringReport();

    if (criticalErrorDetected) {
      console.log('🚨 CRITICAL PRICE FEED ERRORS DETECTED!');
      console.log('Action required: Check endpoint configurations and API availability');
      process.exit(1);
    } else {
      console.log('✅ All price feed endpoints are functioning correctly');
    }

    return this.errors;
  }

  /**
   * Test individual endpoint
   */
  async testEndpoint(endpoint) {
    const startTime = Date.now();

    try {
      // Test with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(endpoint.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BurniToken-PriceMonitor/1.0',
        },
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          valid: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        };
      }

      const data = await response.json();

      // Validate response structure
      if (!endpoint.validator(data)) {
        return {
          valid: false,
          error: 'Invalid response structure or missing required data fields',
          responseTime,
          receivedData: JSON.stringify(data).substring(0, 200) + '...',
        };
      }

      return {
        valid: true,
        responseTime,
        data,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (error.name === 'AbortError') {
        return {
          valid: false,
          error: 'Request timeout (>5s)',
          responseTime,
        };
      }

      return {
        valid: false,
        error: `Network error: ${error.message}`,
        responseTime,
      };
    }
  }

  /**
   * Generate detailed monitoring report
   */
  async generateMonitoringReport() {
    const report = {
      timestamp: new Date().toISOString(),
      service: 'price-feed-monitor',
      summary: {
        totalEndpoints: this.endpoints.length,
        errorCount: this.errors.length,
        warningCount: this.warnings.length,
        criticalErrors: this.errors.filter((e) => e.critical).length,
      },
      errors: this.errors,
      warnings: this.warnings,
    };

    console.log('\n📊 PRICE FEED MONITORING REPORT');
    console.log('================================');
    console.log(`Total Endpoints Tested: ${report.summary.totalEndpoints}`);
    console.log(`Critical Errors: ${report.summary.criticalErrors}`);
    console.log(`Total Errors: ${report.summary.errorCount}`);
    console.log(`Warnings: ${report.summary.warningCount}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS DETECTED:');
      console.log('==================');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.endpoint}:`);
        console.log(`   Error Code: ${error.errorCode}`);
        console.log(`   Details: ${error.details}`);
        console.log(`   Specific Error: ${error.specificError}`);
        console.log(`   Critical: ${error.critical ? 'YES' : 'NO'}`);
        console.log('');
      });
    }

    return report;
  }
}

// Export for programmatic use
module.exports = PriceFeedMonitor;

// Run monitoring if called directly
if (require.main === module) {
  const monitor = new PriceFeedMonitor();
  monitor
    .runPriceFeedMonitoring()
    .then(() => {
      console.log('Price feed monitoring completed successfully');
    })
    .catch((error) => {
      console.error('Price feed monitoring failed:', error);
      process.exit(1);
    });
}
