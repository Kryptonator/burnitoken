// tools/test-ssl-expiration.js
// Test script to simulate SSL certificate expiration scenarios

const WebsiteHealthCheck = require('./website-health-check.js');

class TestSSLExpiration extends WebsiteHealthCheck {
  constructor() {
    super();
    this.domain = 'test.example.com';
  }

  // Override to simulate expired certificate
  async getSSLCertificateInfo() {
    const testDate = new Date('2025-06-24T00:00:00Z'); // Simulate the expired date from the issue

    return {
      validFrom: 'Jun 24 00:00:00 2024 GMT',
      validTo: testDate.toUTCString(), // Expired certificate
      subject: 'CN=burnitoken.com',
      issuer: "CN=Let's Encrypt Authority X3",
    };
  }

  // Override to simulate successful HTTPS check (for testing SSL logic only)
  async checkHTTPSConnectivity() {
    console.log('🌐 HTTPS Connectivity Check...');
    console.log('   ✅ HTTPS Response: 200 (simulated)');
    return true;
  }
}

class TestSSLExpiringSoon extends WebsiteHealthCheck {
  constructor() {
    super();
    this.domain = 'test.example.com';
  }

  // Override to simulate certificate expiring soon
  async getSSLCertificateInfo() {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3); // Expires in 3 days

    return {
      validFrom: 'Jun 24 00:00:00 2024 GMT',
      validTo: futureDate.toUTCString(),
      subject: 'CN=burnitoken.com',
      issuer: "CN=Let's Encrypt Authority X3",
    };
  }

  // Override to simulate successful HTTPS check
  async checkHTTPSConnectivity() {
    console.log('🌐 HTTPS Connectivity Check...');
    console.log('   ✅ HTTPS Response: 200 (simulated)');
    return true;
  }
}

class TestSSLValid extends WebsiteHealthCheck {
  constructor() {
    super();
    this.domain = 'test.example.com';
  }

  // Override to simulate valid certificate
  async getSSLCertificateInfo() {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60); // Valid for 60 more days

    return {
      validFrom: 'Jun 24 00:00:00 2024 GMT',
      validTo: futureDate.toUTCString(),
      subject: 'CN=burnitoken.com',
      issuer: "CN=Let's Encrypt Authority X3",
    };
  }

  // Override to simulate successful HTTPS check
  async checkHTTPSConnectivity() {
    console.log('🌐 HTTPS Connectivity Check...');
    console.log('   ✅ HTTPS Response: 200 (simulated)');
    return true;
  }
}

async function runTests() {
  console.log('🧪 SSL CERTIFICATE EXPIRATION TESTS');
  console.log('='.repeat(60));

  console.log('\n📋 Test 1: Expired Certificate (E_SSL_CERT_EXPIRED)');
  console.log('-'.repeat(50));
  const expiredTest = new TestSSLExpiration();
  await expiredTest.runHealthCheck();

  console.log('\n📋 Test 2: Certificate Expiring Soon (E_SSL_CERT_EXPIRING_SOON)');
  console.log('-'.repeat(50));
  const expiringSoonTest = new TestSSLExpiringSoon();
  await expiringSoonTest.runHealthCheck();

  console.log('\n📋 Test 3: Valid Certificate');
  console.log('-'.repeat(50));
  const validTest = new TestSSLValid();
  await validTest.runHealthCheck();

  console.log('\n✅ All tests completed!');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { TestSSLExpiration, TestSSLExpiringSoon, TestSSLValid };
