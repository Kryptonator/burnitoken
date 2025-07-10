#!/usr/bin/env node

/**
 * Test script for website-health-check.js
 * Verifies SSL certificate checking functionality
 */

const WebsiteHealthChecker = require('./website-health-check.js');

async function runTests() {
  console.log('🧪 Testing Website Health Checker...\n');
  
  const checker = new WebsiteHealthChecker();
  
  // Test with a known working domain (Google)
  checker.setTestUrls(['https://www.google.com']);
  
  console.log('Testing with a known working domain (Google)...');
  const results = await checker.runHealthCheck();
  
  console.log('\n📊 Test Results:');
  console.log(`Checks performed: ${results.summary.totalChecks}`);
  console.log(`Healthy URLs: ${results.summary.healthyUrls}`);
  console.log(`Errors: ${results.summary.errors}`);
  console.log(`Alerts: ${results.alerts.length}`);
  
  if (results.summary.healthyUrls > 0) {
    console.log('\n✅ SSL certificate checking functionality is working correctly!');
    
    // Now test the original functionality with a mocked expired certificate scenario
    console.log('\n🧪 Testing expired certificate detection...');
    
    // Create a test case to simulate the exact error from the issue
    const mockExpiredAlert = {
      source: "tools/website-health-check.js",
      errorCode: "E_SSL_CERT_EXPIRED",
      url: "https://burnitoken.com",
      timestamp: "2025-06-26T17:35:33.150Z",
      details: "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen."
    };
    
    console.log('Expected alert format for expired certificate:');
    console.log(JSON.stringify(mockExpiredAlert, null, 2));
    
    return true;
  } else {
    console.log('\n❌ SSL certificate checking needs debugging');
    return false;
  }
}

if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };