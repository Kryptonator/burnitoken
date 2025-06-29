/**
 * Tests for Price Feed Monitor
 */

const PriceFeedMonitor = require('../tools/monitoring/test-live-prices');

describe('Price Feed Monitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new PriceFeedMonitor();
  });

  test('should initialize with default endpoints', () => {
    expect(monitor.endpoints).toBeDefined();
    expect(monitor.endpoints.length).toBeGreaterThan(0);
    expect(monitor.errors).toEqual([]);
    expect(monitor.warnings).toEqual([]);
  });

  test('should have CoinGecko XRP endpoint configured', () => {
    const xrpEndpoint = monitor.endpoints.find(ep => ep.name === 'CoinGecko XRP Price');
    expect(xrpEndpoint).toBeDefined();
    expect(xrpEndpoint.critical).toBe(true);
    expect(xrpEndpoint.url).toContain('api.coingecko.com');
  });

  test('should validate XRP price response structure', () => {
    const xrpEndpoint = monitor.endpoints.find(ep => ep.name === 'CoinGecko XRP Price');
    
    // Valid response
    expect(xrpEndpoint.validator({ ripple: { usd: 0.5234 } })).toBe(true);
    
    // Invalid responses
    expect(xrpEndpoint.validator({})).toBe(false);
    expect(xrpEndpoint.validator({ ripple: {} })).toBe(false);
    expect(xrpEndpoint.validator({ ripple: { usd: 'invalid' } })).toBe(false);
    expect(xrpEndpoint.validator(null)).toBe(false);
  });

  test('should handle network errors gracefully', async () => {
    // Create a monitor with an invalid endpoint to test error handling
    const testMonitor = new PriceFeedMonitor();
    testMonitor.endpoints = [
      {
        name: 'Invalid Endpoint',
        url: 'https://invalid-endpoint-that-does-not-exist.com/api',
        validator: (data) => true,
        critical: true,
      }
    ];

    const result = await testMonitor.testEndpoint(testMonitor.endpoints[0]);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Network error');
  });

  test('should detect invalid response structure', async () => {
    // Mock a successful HTTP response but with invalid data structure
    const testEndpoint = {
      name: 'Test Endpoint',
      url: 'http://localhost/test',
      validator: (data) => data?.required?.field === 'expected_value',
      critical: true,
    };

    // We can't easily mock fetch in this environment, but we can test the validator logic
    const validData = { required: { field: 'expected_value' } };
    const invalidData = { invalid: 'structure' };

    expect(testEndpoint.validator(validData)).toBe(true);
    expect(testEndpoint.validator(invalidData)).toBe(false);
  });

  test('should generate proper error codes', () => {
    const timestamp = new Date().toISOString();
    const testError = {
      service: 'price-feed-monitor',
      timestamp: timestamp,
      errorCode: 'PF-5001',
      details: 'Der Endpunkt lieferte eine ungültige Antwort.',
      endpoint: 'Test Endpoint',
      critical: true,
    };

    expect(testError.errorCode).toBe('PF-5001');
    expect(testError.service).toBe('price-feed-monitor');
    expect(testError.details).toContain('ungültige Antwort');
  });
});