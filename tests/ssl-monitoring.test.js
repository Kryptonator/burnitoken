/**
 * SSL Monitoring Tests
 * Tests for SSL certificate expiration detection functionality
 */

const { WebsiteHealthChecker } = require('../tools/website-health-check.js');
const { SSLExpirationTester } = require('../tools/test-ssl-expiration.js');

describe('SSL Certificate Monitoring', () => {
  let checker;

  beforeEach(() => {
    checker = new WebsiteHealthChecker();
  });

  describe('Date Parsing', () => {
    test('should extract notAfter date correctly', () => {
      const mockSSLOutput = `notBefore=Jun 24 00:00:00 2024 GMT
notAfter=Jun 24 23:59:59 2025 GMT
subject=CN=burnitoken.com
issuer=C=US,O=Let's Encrypt,CN=R3`;

      const notAfter = checker.extractDate(mockSSLOutput, 'notAfter=');
      expect(notAfter).toBe('Jun 24 23:59:59 2025 GMT');
    });

    test('should extract issuer correctly', () => {
      const mockSSLOutput = `notBefore=Jun 24 00:00:00 2024 GMT
notAfter=Jun 24 23:59:59 2025 GMT
subject=CN=burnitoken.com
issuer=C=US,O=Let's Encrypt,CN=R3`;

      const issuer = checker.extractIssuer(mockSSLOutput);
      expect(issuer).toBe('C=US,O=Let\'s Encrypt,CN=R3');
    });

    test('should extract subject correctly', () => {
      const mockSSLOutput = `notBefore=Jun 24 00:00:00 2024 GMT
notAfter=Jun 24 23:59:59 2025 GMT
subject=CN=burnitoken.com
issuer=C=US,O=Let's Encrypt,CN=R3`;

      const subject = checker.extractSubject(mockSSLOutput);
      expect(subject).toBe('CN=burnitoken.com');
    });
  });

  describe('Health Status Determination', () => {
    test('should return critical for expired certificate', () => {
      const connectivityResult = { isReachable: true };
      const sslResult = { isExpired: true, daysUntilExpiry: -3 };

      const health = checker.determineOverallHealth(connectivityResult, sslResult);
      expect(health).toBe('critical');
    });

    test('should return warning for certificate expiring soon', () => {
      const connectivityResult = { isReachable: true };
      const sslResult = { isExpired: false, daysUntilExpiry: 15 };

      const health = checker.determineOverallHealth(connectivityResult, sslResult);
      expect(health).toBe('warning');
    });

    test('should return healthy for valid certificate', () => {
      const connectivityResult = { isReachable: true };
      const sslResult = { isExpired: false, daysUntilExpiry: 60 };

      const health = checker.determineOverallHealth(connectivityResult, sslResult);
      expect(health).toBe('healthy');
    });

    test('should return critical for unreachable domain', () => {
      const connectivityResult = { isReachable: false };
      const sslResult = { isExpired: false, daysUntilExpiry: 60 };

      const health = checker.determineOverallHealth(connectivityResult, sslResult);
      expect(health).toBe('critical');
    });
  });

  describe('SSL Expiration Tester', () => {
    test('should simulate expired certificate correctly', () => {
      const tester = new SSLExpirationTester();
      const result = tester.simulateExpiredCertificate();

      expect(result.isExpired).toBe(true);
      expect(result.error.errorCode).toBe('E_SSL_CERT_EXPIRED');
      expect(result.error.source).toBe('tools/website-health-check.js');
      expect(result.error.details).toContain('Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.');
    });

    test('should test date parsing functionality', () => {
      const tester = new SSLExpirationTester();
      const result = tester.testDateParsing();

      expect(result.notAfter).toBe('Jun 24 23:59:59 2025 GMT');
      expect(result.notBefore).toBe('Jun 24 00:00:00 2024 GMT');
      expect(result.issuer).toBe('C=US,O=Let\'s Encrypt,CN=R3');
      expect(result.subject).toBe('CN=burnitoken.com');
    });
  });

  describe('Error Format Validation', () => {
    test('should match issue error format exactly', () => {
      const expectedFormat = {
        source: "tools/website-health-check.js",
        errorCode: "E_SSL_CERT_EXPIRED",
        url: "https://burnitoken.com",
        timestamp: expect.any(String),
        details: expect.stringContaining("Das SSL-Zertifikat ist am")
      };

      const tester = new SSLExpirationTester();
      const result = tester.simulateExpiredCertificate();

      expect(result.error).toEqual(expect.objectContaining(expectedFormat));
      expect(result.error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});