const { WebsiteHealthChecker } = require('../tools/website-health-check.js');

describe('Website Health Check', () => {
  let checker;

  beforeEach(() => {
    checker = new WebsiteHealthChecker();
  });

  test('should be instantiated correctly', () => {
    expect(checker).toBeDefined();
    expect(checker.domains).toContain('burnitoken.com');
    expect(checker.domains).toContain('burnitoken.website');
    expect(checker.alertThresholdDays).toBe(7);
  });

  test('should generate error report with correct format', () => {
    const domain = 'burnitoken.com';
    const errorCode = 'E_SSL_CERT_EXPIRED';
    const details = 'Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.';
    
    const report = checker.generateErrorReport(domain, errorCode, details);
    
    expect(report).toHaveProperty('source', 'tools/website-health-check.js');
    expect(report).toHaveProperty('errorCode', errorCode);
    expect(report).toHaveProperty('url', `https://${domain}`);
    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('details', details);
    expect(new Date(report.timestamp)).toBeInstanceOf(Date);
  });

  test('should detect expired SSL certificate', async () => {
    // This will use the simulated expired certificate for burnitoken.com
    const result = await checker.checkSSLCertificate('burnitoken.com');
    
    expect(result.domain).toBe('burnitoken.com');
    expect(result.status).toBe('success');
    expect(result.certificate).toBeDefined();
    expect(result.certificate.isExpired).toBe(true);
    expect(result.certificate.isValid).toBe(false);
    expect(result.certificate.expirationDate).toBe('2025-06-24T00:00:00.000Z');
  });

  test('should calculate days until expiration correctly', async () => {
    const result = await checker.checkSSLCertificate('burnitoken.com');
    
    expect(result.certificate.daysUntilExpiration).toBeLessThan(0); // Already expired
  });

  test('should handle domain without SSL certificate', async () => {
    const result = await checker.checkSSLCertificate('nonexistent-domain.test');
    
    expect(result.domain).toBe('nonexistent-domain.test');
    expect(result.status).toBe('error');
    expect(result.certificate).toBeNull();
    expect(result.error).toBeDefined();
  });
});