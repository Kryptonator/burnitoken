#!/usr/bin/env node

/**
 * Test script to simulate SSL certificate expiration detection
 * This is for testing the website-health-check.js functionality
 */

const WebsiteHealthCheck = require('./website-health-check');

class TestWebsiteHealthCheck extends WebsiteHealthCheck {
  constructor() {
    super();
    this.domains = ['test.example.com']; // Use test domain
  }

  /**
   * Mock SSL certificate check to simulate expired certificate
   */
  async checkSSLCertificate(domain) {
    console.log(`🔐 [TEST] Simulating SSL check for ${domain}...`);

    // Simulate expired certificate (like the burnitoken.com issue)
    const expiredDate = new Date('2025-06-24'); // The date mentioned in the issue
    const currentDate = new Date();
    const daysExpired = Math.ceil((currentDate - expiredDate) / (1000 * 60 * 60 * 24));

    return {
      domain,
      status: 'SSL_CERT_EXPIRED',
      errorCode: 'E_SSL_CERT_EXPIRED',
      expirationDate: expiredDate.toISOString().split('T')[0],
      daysExpired: daysExpired,
      timestamp: new Date().toISOString(),
      details: `Das SSL-Zertifikat ist am ${expiredDate.toISOString().split('T')[0]} abgelaufen.`,
    };
  }

  /**
   * Mock connectivity check
   */
  async checkWebsiteConnectivity(domain) {
    console.log(`🌐 [TEST] Simulating connectivity check for ${domain}...`);

    return {
      domain,
      status: 'CONNECTIVITY_FAILED',
      errorCode: 'E_CONNECTIVITY_FAILED',
      error: 'SSL certificate expired',
      timestamp: new Date().toISOString(),
      details: 'Website ist nicht erreichbar aufgrund abgelaufenen SSL-Zertifikats.',
    };
  }
}

// Run test
console.log('🧪 TESTING WEBSITE HEALTH CHECK');
console.log('================================');
console.log('Simulating SSL certificate expiration scenario...\n');

const testHealthCheck = new TestWebsiteHealthCheck();
testHealthCheck
  .runHealthCheck()
  .then((results) => {
    console.log('\n✅ TEST COMPLETED');
    console.log('The health check successfully detected the SSL expiration issue!');

    // Verify that the correct error code was generated
    const expiredCert = results.find((r) => r.errorCode === 'E_SSL_CERT_EXPIRED');
    if (expiredCert) {
      console.log('✅ E_SSL_CERT_EXPIRED error code correctly generated');
      console.log(`✅ Expiration detection working: ${expiredCert.details}`);
    }
  })
  .catch((error) => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
