#!/usr/bin/env node

/**
 * SSL Timeout Test Script
 * Simulates SSL connection timeout scenarios for testing the health monitoring system
 */

const https = require('https');
const WebsiteHealthMonitor = require('./website-health.js');

// Mock slow SSL endpoint for testing
const TEST_ENDPOINTS = [
  'httpbin.org', // Real endpoint for testing
  'badssl.com', // SSL testing site
  'expired.badssl.com', // Expired cert testing
];

console.log('🧪 SSL Timeout Test Script');
console.log('='.repeat(50));

async function testSSLTimeout() {
  console.log('\n🔐 Testing SSL Timeout Detection...');
  
  // Test with a very short timeout to force timeout
  const testPromise = new Promise((resolve) => {
    const req = https.get('https://httpbin.org/delay/5', {
      timeout: 1000, // Very short timeout
    }, (res) => {
      resolve({ status: 'SUCCESS', statusCode: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ status: 'FAILED', error: err.message, code: err.code });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'TIMEOUT', error: 'SSL-Verbindungs-Timeout' });
    });
  });

  const result = await testPromise;
  
  if (result.status === 'TIMEOUT') {
    console.log('✅ SSL Timeout successfully detected');
    console.log(`   Error: ${result.error}`);
  } else {
    console.log('❌ SSL Timeout test failed');
    console.log(`   Result: ${JSON.stringify(result)}`);
  }

  return result;
}

async function testHealthMonitorWithTimeout() {
  console.log('\n🏥 Testing Website Health Monitor...');
  
  // Create a mock health monitor for testing
  class TestHealthMonitor extends WebsiteHealthMonitor {
    async checkSSLConnection() {
      console.log('🔐 SSL-Verbindung wird überprüft (Test Mode)...');
      
      // Simulate SSL timeout
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = {
            type: 'SSL_CONNECTION',
            status: 'TIMEOUT',
            errorType: 'SSL_TIMEOUT',
            error: 'SSL-Verbindungs-Timeout für https://burnitoken.website',
            duration: '15000ms',
            timestamp: new Date().toISOString()
          };
          
          console.log('   ⏰ SSL-Verbindungs-Timeout simuliert');
          resolve(result);
        }, 100);
      });
    }

    async checkDNS() {
      // Simulate successful DNS for test
      return {
        type: 'DNS_CHECK',
        status: 'SUCCESS',
        address: '75.2.60.5',
        duration: '50ms',
        timestamp: new Date().toISOString()
      };
    }

    async checkHTTPResponse() {
      // Simulate HTTP failure due to SSL timeout
      return {
        type: 'HTTP_RESPONSE',
        status: 'FAILED',
        error: 'Connection failed due to SSL timeout',
        duration: '100ms',
        timestamp: new Date().toISOString()
      };
    }
  }

  const testMonitor = new TestHealthMonitor();
  const results = await testMonitor.performHealthCheck();

  console.log('\n📊 Test Results:');
  console.log(`Status: ${results.status}`);
  console.log(`SSL Timeout detected: ${results.status === 'SSL_TIMEOUT_ERROR' ? 'YES' : 'NO'}`);

  return results;
}

async function runTests() {
  console.log('\n🚀 Starting SSL Timeout Tests...');
  
  try {
    await testSSLTimeout();
    await testHealthMonitorWithTimeout();
    
    console.log('\n✅ All tests completed successfully');
    console.log('\n📝 To test with real burnitoken.website:');
    console.log('   node tools/monitoring/website-health.js');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testSSLTimeout, testHealthMonitorWithTimeout };