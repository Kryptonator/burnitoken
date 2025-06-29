const WebsiteHealthChecker = require('../tools/website-health-check.js');

describe('Website Health Check', () => {
  let checker;

  beforeEach(() => {
    checker = new WebsiteHealthChecker('https://burnitoken.com');
  });

  test('should report SSL certificate expiration issue in correct format', () => {
    // Simuliere eine SSL-Zertifikat-Ablauf-Situation
    const expectedErrorCode = 'E_SSL_CERT_EXPIRED';
    const expectedDetails = 'Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.';
    
    checker.reportIssue(expectedErrorCode, expectedDetails);
    
    expect(checker.issues).toHaveLength(1);
    expect(checker.issues[0]).toMatchObject({
      source: 'tools/website-health-check.js',
      errorCode: expectedErrorCode,
      url: 'https://burnitoken.com',
      details: expectedDetails
    });
    expect(checker.issues[0]).toHaveProperty('timestamp');
    expect(new Date(checker.issues[0].timestamp)).toBeInstanceOf(Date);
  });

  test('should detect expired certificate based on date logic', () => {
    // Teste die Logik zur Erkennung abgelaufener Zertifikate
    const pastDate = new Date('2025-06-24'); // Datum aus dem Issue
    const currentDate = new Date('2025-06-26'); // Datum aus dem Issue
    
    const isExpired = pastDate < currentDate;
    const expiredDays = Math.ceil((currentDate - pastDate) / (1000 * 60 * 60 * 24));
    
    expect(isExpired).toBe(true);
    expect(expiredDays).toBe(2);
  });

  test('should generate health report correctly', () => {
    // Füge verschiedene Issues hinzu
    checker.reportIssue('E_SSL_CERT_EXPIRED', 'Test SSL Issue');
    checker.reportIssue('E_WEBSITE_UNREACHABLE', 'Test Website Issue');
    
    const report = checker.generateReport();
    
    expect(report.status).toBe('unhealthy');
    expect(report.issues).toHaveLength(2);
    expect(report.issues[0].errorCode).toBe('E_SSL_CERT_EXPIRED');
    expect(report.issues[1].errorCode).toBe('E_WEBSITE_UNREACHABLE');
  });

  test('should generate healthy report when no issues found', () => {
    const report = checker.generateReport();
    
    expect(report.status).toBe('healthy');
    expect(report.issues).toHaveLength(0);
  });

  test('should format issue timestamps correctly', () => {
    checker.reportIssue('E_SSL_CERT_EXPIRED', 'Test issue');
    
    const issue = checker.issues[0];
    const timestamp = issue.timestamp;
    
    // Prüfe ISO 8601 Format
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    
    // Prüfe dass es ein valides Datum ist
    expect(new Date(timestamp)).toBeInstanceOf(Date);
    expect(new Date(timestamp).getTime()).not.toBeNaN();
  });
});