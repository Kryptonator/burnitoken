/**
 * Tests for Website Health Check Tool
 * Validates SSL certificate expiration monitoring functionality
 */

const WebsiteHealthChecker = require('../tools/website-health-check.js');

describe('WebsiteHealthChecker', () => {
  let checker;

  beforeEach(() => {
    checker = new WebsiteHealthChecker();
    // Set test environment to use simulated SSL checks
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  test('should detect expired SSL certificate for burnitoken.com', async () => {
    checker.setTestUrls(['https://burnitoken.com']);
    
    const results = await checker.runHealthCheck();
    
    expect(results.summary.expiredCertificates).toBe(1);
    expect(results.alerts).toHaveLength(1);
    
    const alert = results.alerts[0];
    expect(alert.errorCode).toBe('E_SSL_CERT_EXPIRED');
    expect(alert.url).toBe('https://burnitoken.com');
    expect(alert.source).toBe('tools/website-health-check.js');
    expect(alert.details).toContain('Das SSL-Zertifikat ist am 2025-06-24 abgelaufen');
  });

  test('should detect expiring soon SSL certificate for burnitoken.website', async () => {
    checker.setTestUrls(['https://burnitoken.website']);
    
    const results = await checker.runHealthCheck();
    
    expect(results.summary.expiringSoonCertificates).toBe(1);
    expect(results.alerts).toHaveLength(1);
    
    const alert = results.alerts[0];
    expect(alert.errorCode).toBe('E_SSL_CERT_EXPIRING_SOON');
    expect(alert.url).toBe('https://burnitoken.website');
    expect(alert.source).toBe('tools/website-health-check.js');
    expect(alert.details).toContain('Das SSL-Zertifikat läuft in 3 Tag(en) ab');
  });

  test('should detect healthy SSL certificate for other domains', async () => {
    checker.setTestUrls(['https://example.com']);
    
    const results = await checker.runHealthCheck();
    
    expect(results.summary.healthyUrls).toBe(1);
    expect(results.alerts).toHaveLength(0);
    expect(results.summary.expiredCertificates).toBe(0);
    expect(results.summary.expiringSoonCertificates).toBe(0);
  });

  test('should generate proper alert object format', () => {
    const mockSSLInfo = {
      url: 'https://burnitoken.com',
      hostname: 'burnitoken.com',
      expirationDate: '2025-06-24',
      isExpired: true,
      isExpiringSoon: false
    };

    const alert = checker.generateAlert(mockSSLInfo);
    
    expect(alert).toMatchObject({
      source: 'tools/website-health-check.js',
      errorCode: 'E_SSL_CERT_EXPIRED',
      url: 'https://burnitoken.com',
      details: 'Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.'
    });
    expect(alert.timestamp).toBeDefined();
  });

  test('should handle multiple URLs with different SSL states', async () => {
    checker.setTestUrls([
      'https://burnitoken.com',        // Expired
      'https://burnitoken.website',    // Expiring soon  
      'https://example.com'            // Healthy
    ]);
    
    const results = await checker.runHealthCheck();
    
    expect(results.summary.totalChecks).toBe(3);
    expect(results.summary.healthyUrls).toBe(1);
    expect(results.summary.expiredCertificates).toBe(1);
    expect(results.summary.expiringSoonCertificates).toBe(1);
    expect(results.alerts).toHaveLength(2);
  });

  test('should match exact alert format from issue #22', async () => {
    checker.setTestUrls(['https://burnitoken.com']);
    
    const results = await checker.runHealthCheck();
    const alert = results.alerts[0];
    
    // Verify it matches the exact format from the GitHub issue
    expect(alert).toMatchObject({
      source: "tools/website-health-check.js",
      errorCode: "E_SSL_CERT_EXPIRED", 
      url: "https://burnitoken.com",
      details: expect.stringContaining("Das SSL-Zertifikat ist am 2025-06-24 abgelaufen")
    });
    
    // Verify timestamp format (ISO 8601)
    expect(alert.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});