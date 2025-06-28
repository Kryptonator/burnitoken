// tests/ssl-monitoring.test.js
// Unit tests for SSL certificate expiration monitoring

const WebsiteHealthCheck = require('../tools/website-health-check.js');

describe('SSL Certificate Monitoring', () => {
  let healthCheck;

  beforeEach(() => {
    healthCheck = new WebsiteHealthCheck();
    healthCheck.domain = 'test.example.com';
    healthCheck.results = [];
  });

  // Mock console methods to reduce test output noise
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('should detect expired SSL certificate', async () => {
    // Mock certificate info for expired certificate
    healthCheck.getSSLCertificateInfo = jest.fn().mockResolvedValue({
      validFrom: 'Jun 24 00:00:00 2024 GMT',
      validTo: 'Tue, 24 Jun 2025 00:00:00 GMT', // Expired
      subject: 'CN=test.example.com',
      issuer: "CN=Let's Encrypt Authority X3",
    });

    const result = await healthCheck.checkSSLCertificateExpiration();

    expect(result).toBe(false);
    expect(healthCheck.results).toHaveLength(1);
    expect(healthCheck.results[0].errorCode).toBe('E_SSL_CERT_EXPIRED');
    expect(healthCheck.results[0].details).toContain('abgelaufen');
  });

  test('should detect SSL certificate expiring soon', async () => {
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 3); // Expires in 3 days

    healthCheck.getSSLCertificateInfo = jest.fn().mockResolvedValue({
      validFrom: 'Jun 24 00:00:00 2024 GMT',
      validTo: soonDate.toUTCString(),
      subject: 'CN=test.example.com',
      issuer: "CN=Let's Encrypt Authority X3",
    });

    const result = await healthCheck.checkSSLCertificateExpiration();

    expect(result).toBe(false);
    expect(healthCheck.results).toHaveLength(1);
    expect(healthCheck.results[0].errorCode).toBe('E_SSL_CERT_EXPIRING_SOON');
    expect(healthCheck.results[0].details).toContain('3 Tagen');
  });

  test('should pass for valid SSL certificate', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60); // Valid for 60 more days

    healthCheck.getSSLCertificateInfo = jest.fn().mockResolvedValue({
      validFrom: 'Jun 24 00:00:00 2024 GMT',
      validTo: futureDate.toUTCString(),
      subject: 'CN=test.example.com',
      issuer: "CN=Let's Encrypt Authority X3",
    });

    const result = await healthCheck.checkSSLCertificateExpiration();

    expect(result).toBe(true);
    expect(healthCheck.results).toHaveLength(0);
  });

  test('should handle SSL certificate check failure', async () => {
    healthCheck.getSSLCertificateInfo = jest
      .fn()
      .mockRejectedValue(new Error('Connection timeout'));

    const result = await healthCheck.checkSSLCertificateExpiration();

    expect(result).toBe(false);
    expect(healthCheck.results).toHaveLength(1);
    expect(healthCheck.results[0].errorCode).toBe('E_SSL_CERT_CHECK_FAILED');
    expect(healthCheck.results[0].details).toContain('Connection timeout');
  });

  test('should generate correct JSON format for automation', async () => {
    // Mock expired certificate
    healthCheck.getSSLCertificateInfo = jest.fn().mockResolvedValue({
      validFrom: 'Jun 24 00:00:00 2024 GMT',
      validTo: 'Tue, 24 Jun 2025 00:00:00 GMT',
      subject: 'CN=burnitoken.com',
      issuer: "CN=Let's Encrypt Authority X3",
    });

    await healthCheck.checkSSLCertificateExpiration();

    expect(healthCheck.results[0]).toMatchObject({
      source: 'tools/website-health-check.js',
      errorCode: 'E_SSL_CERT_EXPIRED',
      url: 'https://test.example.com',
      details: expect.stringContaining('2025-06-24'),
      expiredDays: expect.any(Number),
      certificate: {
        validFrom: 'Jun 24 00:00:00 2024 GMT',
        validTo: 'Tue, 24 Jun 2025 00:00:00 GMT',
        issuer: "CN=Let's Encrypt Authority X3",
        subject: 'CN=burnitoken.com',
      },
    });

    expect(healthCheck.results[0].timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });
});
