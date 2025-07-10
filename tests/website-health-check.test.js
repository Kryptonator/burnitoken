const WebsiteHealthChecker = require('../tools/website-health-check');
const fs = require('fs');

describe('Website Health Check', () => {
  let healthChecker;

  beforeEach(() => {
    healthChecker = new WebsiteHealthChecker();
    // Clean up any existing error report files
    const files = fs.readdirSync('.').filter(f => f.startsWith('ssl-error-report-'));
    files.forEach(f => fs.unlinkSync(f));
  });

  afterEach(() => {
    // Clean up error report files after tests
    const files = fs.readdirSync('.').filter(f => f.startsWith('ssl-error-report-'));
    files.forEach(f => fs.unlinkSync(f));
  });

  test('should detect expired SSL certificate for burnitoken.com', async () => {
    const result = await healthChecker.checkSSLCertificate('burnitoken.com');
    
    expect(result.domain).toBe('burnitoken.com');
    expect(result.status).toBe('EXPIRED');
    expect(result.expiryDate).toBe('2025-06-24');
    expect(result.error).toContain('Das SSL-Zertifikat ist am 2025-06-24 abgelaufen');
    expect(result.expiredDays).toBeGreaterThan(0);
  });

  test('should generate proper error report format', () => {
    const sslStatus = {
      status: 'EXPIRED',
      error: 'Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.',
    };

    const errorReport = healthChecker.generateErrorReport('burnitoken.com', sslStatus);

    expect(errorReport.source).toBe('tools/website-health-check.js');
    expect(errorReport.errorCode).toBe('E_SSL_CERT_EXPIRED');
    expect(errorReport.url).toBe('https://burnitoken.com');
    expect(errorReport.details).toBe('Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.');
    expect(errorReport.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  test('should save error report to JSON file', () => {
    const sslStatus = {
      status: 'EXPIRED',
      error: 'Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.',
    };

    healthChecker.generateErrorReport('burnitoken.com', sslStatus);

    const files = fs.readdirSync('.').filter(f => f.startsWith('ssl-error-report-burnitoken.com-'));
    expect(files.length).toBe(1);

    const reportContent = JSON.parse(fs.readFileSync(files[0], 'utf8'));
    expect(reportContent.errorCode).toBe('E_SSL_CERT_EXPIRED');
    expect(reportContent.url).toBe('https://burnitoken.com');
  });

  test('should handle domains configuration correctly', () => {
    expect(healthChecker.domains).toContain('burnitoken.com');
    expect(healthChecker.domains).toContain('burnitoken.website');
  });

  test('should handle SSL certificate check errors gracefully', async () => {
    const result = await healthChecker.checkSSLCertificate('non-existent-domain-12345.invalid');
    
    expect(result.domain).toBe('non-existent-domain-12345.invalid');
    expect(['ERROR', 'EXPIRED'].includes(result.status)).toBe(true);
    expect(result.error).toBeDefined();
  });
});