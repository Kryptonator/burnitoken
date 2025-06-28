// tests/ssl-timeout-detection.test.js
const WebsiteHealthChecker = require('../tools/monitoring/website-health-checker');
const AutomatedHealthMonitor = require('../tools/monitoring/automated-health-monitor');

describe('SSL Timeout Detection', () => {
  let healthChecker;

  beforeEach(() => {
    healthChecker = new WebsiteHealthChecker();
  });

  it('should detect SSL timeout correctly', async () => {
    // Mock a domain that would cause SSL timeout
    const mockDomain = 'example.com';
    
    // Mock SSL check that simulates timeout
    const originalCheckSSL = healthChecker.checkSSLConnection;
    healthChecker.checkSSLConnection = jest.fn().mockResolvedValue({
      status: 'SSL_TIMEOUT',
      error: `SSL-Verbindungs-Timeout für https://${mockDomain}`,
      duration: 8000,
      timeout: 'SSL_HANDSHAKE'
    });

    const result = await healthChecker.checkDomainHealth(mockDomain);
    
    expect(result.ssl.status).toBe('SSL_TIMEOUT');
    expect(result.ssl.error).toContain('SSL-Verbindungs-Timeout');
    expect(result.critical).toBe(true);
  });

  it('should differentiate between SSL timeout and other errors', async () => {
    const mockDomain = 'example.com';
    
    // Test SSL timeout
    healthChecker.checkSSLConnection = jest.fn().mockResolvedValue({
      status: 'SSL_TIMEOUT',
      error: `SSL-Verbindungs-Timeout für https://${mockDomain}`,
      timeout: 'SSL_HANDSHAKE'
    });

    const sslTimeoutResult = await healthChecker.checkDomainHealth(mockDomain);
    expect(sslTimeoutResult.ssl.status).toBe('SSL_TIMEOUT');

    // Test general connection error
    healthChecker.checkSSLConnection = jest.fn().mockResolvedValue({
      status: 'CONNECTION_ERROR',
      error: 'Connection refused',
      code: 'ECONNREFUSED'
    });

    const connectionErrorResult = await healthChecker.checkDomainHealth(mockDomain);
    expect(connectionErrorResult.ssl.status).toBe('CONNECTION_ERROR');
    expect(connectionErrorResult.ssl.status).not.toBe('SSL_TIMEOUT');
  });

  it('should generate correct log format for SSL timeouts', async () => {
    const monitor = new AutomatedHealthMonitor();
    
    const mockResult = {
      domain: 'burnitoken.website',
      ssl: {
        status: 'SSL_TIMEOUT',
        error: 'SSL-Verbindungs-Timeout für https://burnitoken.website',
        duration: 8000
      },
      critical: true,
      timestamp: '2025-06-26T18:00:00.289Z'
    };

    // Mock file writing to capture the log format
    const fs = require('fs');
    const originalAppendFile = fs.promises.appendFile;
    let loggedData = '';
    
    fs.promises.appendFile = jest.fn().mockImplementation((file, data) => {
      loggedData = data;
      return Promise.resolve();
    });

    await monitor.createAutomatedIssueReport(mockResult, mockResult.timestamp);

    // Verify log format matches issue description
    expect(loggedData).toContain('SSL-Verbindungs-Timeout für https://burnitoken.website');
    expect(loggedData).toContain('Ein kritischer Fehler wurde im Health Check Skript festgestellt');
    expect(loggedData).toContain('2025-06-26T18:00:00.289Z');

    // Restore original function
    fs.promises.appendFile = originalAppendFile;
  });

  it('should handle retry logic for SSL connections', async () => {
    const healthChecker = new WebsiteHealthChecker();
    let callCount = 0;

    // Mock that fails first two times, succeeds third time
    healthChecker.checkSSLConnection = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.resolve({
          status: 'SSL_TIMEOUT',
          error: 'SSL-Verbindungs-Timeout',
          timeout: 'SSL_HANDSHAKE'
        });
      }
      return Promise.resolve({
        status: 'OK',
        statusCode: 200,
        duration: 500
      });
    });

    const results = await healthChecker.runWithRetries();
    
    expect(callCount).toBeGreaterThan(1); // Should have retried
    expect(results).toBeDefined();
  });

  it('should validate timeout values are appropriate', () => {
    const healthChecker = new WebsiteHealthChecker();
    
    // SSL timeout should be shorter than connection timeout
    expect(healthChecker.sslTimeout).toBeLessThan(healthChecker.connectionTimeout);
    
    // SSL timeout should be reasonable (between 5-15 seconds)
    expect(healthChecker.sslTimeout).toBeGreaterThanOrEqual(5000);
    expect(healthChecker.sslTimeout).toBeLessThanOrEqual(15000);
  });
});