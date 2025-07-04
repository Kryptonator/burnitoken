/**
 * Test for Website Health Check Tool
 * Tests SSL certificate monitoring functionality
 */

const WebsiteHealthChecker = require('../tools/website-health-check');

describe('Website Health Check', () => {
  let healthChecker;

  beforeEach(() => {
    healthChecker = new WebsiteHealthChecker();
  });

  test('should initialize with default domains', () => {
    expect(healthChecker.domains).toContain('burnitoken.com');
    expect(healthChecker.domains).toContain('burnitoken.website');
    expect(healthChecker.criticalDaysThreshold).toBe(7);
    expect(healthChecker.warningDaysThreshold).toBe(30);
  });

  test('should create test scenario for expired SSL certificate', () => {
    const testChecker = new WebsiteHealthChecker({ testMode: true });
    const testScenario = testChecker.createTestScenario();
    
    expect(testScenario.domain).toBe('burnitoken.com');
    expect(testScenario.isExpired).toBe(true);
    expect(testScenario.status).toBe('EXPIRED');
    expect(testScenario.daysUntilExpiration).toBe(-10);
    expect(testScenario.expirationDate).toBe('2025-06-24T23:59:59.000Z');
  });

  test('should generate correct error report for expired SSL', () => {
    const testChecker = new WebsiteHealthChecker({ testMode: true });
    const testScenario = testChecker.createTestScenario();
    const errorReport = testChecker.generateErrorReport(testScenario);
    
    expect(errorReport).toBeTruthy();
    expect(errorReport.source).toBe('tools/website-health-check.js');
    expect(errorReport.errorCode).toBe('E_SSL_CERT_EXPIRED');
    expect(errorReport.url).toBe('https://burnitoken.com');
    expect(errorReport.severity).toBe('CRITICAL');
    expect(errorReport.details).toContain('SSL-Zertifikat ist am 24.6.2025 abgelaufen');
  });

  test('should generate correct error report for expiring SSL', () => {
    const testChecker = new WebsiteHealthChecker({ testMode: true });
    const expiringScenario = {
      domain: 'burnitoken.com',
      isExpired: false,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      daysUntilExpiration: 5,
      status: 'CRITICAL'
    };
    
    const errorReport = testChecker.generateErrorReport(expiringScenario);
    
    expect(errorReport).toBeTruthy();
    expect(errorReport.errorCode).toBe('E_SSL_CERT_EXPIRING_SOON');
    expect(errorReport.severity).toBe('HIGH');
    expect(errorReport.details).toContain('SSL-Zertifikat läuft in 5 Tagen ab');
  });

  test('should not generate error report for valid SSL', () => {
    const testChecker = new WebsiteHealthChecker({ testMode: true });
    const validScenario = {
      domain: 'burnitoken.com',
      isExpired: false,
      expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
      daysUntilExpiration: 60,
      status: 'OK'
    };
    
    const errorReport = testChecker.generateErrorReport(validScenario);
    
    expect(errorReport).toBeNull();
  });

  test('should handle SSL certificate statuses correctly', () => {
    const testChecker = new WebsiteHealthChecker({ testMode: true });
    
    // Test expired certificate
    const expiredResult = {
      isExpired: true,
      daysUntilExpiration: -10,
      status: 'EXPIRED'
    };
    
    // Test critical certificate (expires soon)
    const criticalResult = {
      isExpired: false,
      daysUntilExpiration: 5,
      status: 'CRITICAL'
    };
    
    // Test warning certificate
    const warningResult = {
      isExpired: false,
      daysUntilExpiration: 20,
      status: 'WARNING'
    };
    
    // Test OK certificate
    const okResult = {
      isExpired: false,
      daysUntilExpiration: 60,
      status: 'OK'
    };
    
    expect(testChecker.generateErrorReport(expiredResult)).toBeTruthy();
    expect(testChecker.generateErrorReport(criticalResult)).toBeTruthy();
    expect(testChecker.generateErrorReport(warningResult)).toBeNull();
    expect(testChecker.generateErrorReport(okResult)).toBeNull();
  });
});