const WebsiteHealthChecker = require('../tools/website-health-check.js');

describe('Website Health Check', () => {
  let healthChecker;

  beforeEach(() => {
    healthChecker = new WebsiteHealthChecker();
  });

  test('should generate correct error report for expired certificate', () => {
    const domain = 'burnitoken.com';
    const expiredCertInfo = {
      domain,
      expirationDate: '2025-06-24T12:00:00.000Z',
      daysUntilExpiration: -1,
      isValid: false,
      isExpired: true,
      isExpiringSoon: false
    };

    const errorReport = healthChecker.generateErrorReport(domain, expiredCertInfo);
    
    expect(errorReport).toBeDefined();
    expect(errorReport.source).toBe('tools/website-health-check.js');
    expect(errorReport.errorCode).toBe('E_SSL_CERT_EXPIRED');
    expect(errorReport.url).toBe('https://burnitoken.com');
    expect(errorReport.details).toContain('Das SSL-Zertifikat ist am');
    expect(errorReport.details).toContain('abgelaufen');
    expect(errorReport.timestamp).toBeDefined();
  });

  test('should generate warning for certificate expiring soon', () => {
    const domain = 'burnitoken.com';
    const expiringSoonCertInfo = {
      domain,
      expirationDate: '2025-07-10T12:00:00.000Z',
      daysUntilExpiration: 15,
      isValid: true,
      isExpired: false,
      isExpiringSoon: true
    };

    const errorReport = healthChecker.generateErrorReport(domain, expiringSoonCertInfo);
    
    expect(errorReport).toBeDefined();
    expect(errorReport.errorCode).toBe('E_SSL_CERT_EXPIRING_SOON');
    expect(errorReport.details).toContain('läuft am');
    expect(errorReport.details).toContain('ab');
  });

  test('should return null for valid certificate', () => {
    const domain = 'burnitoken.com';
    const validCertInfo = {
      domain,
      expirationDate: '2026-06-24T12:00:00.000Z',
      daysUntilExpiration: 365,
      isValid: true,
      isExpired: false,
      isExpiringSoon: false
    };

    const errorReport = healthChecker.generateErrorReport(domain, validCertInfo);
    
    expect(errorReport).toBeNull();
  });

  test('should have correct domain configuration', () => {
    expect(healthChecker.domains).toContain('burnitoken.com');
    expect(healthChecker.warningDays).toBe(30);
  });
});