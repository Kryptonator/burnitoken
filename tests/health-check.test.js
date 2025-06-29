/**
 * API Health Check Tests
 * Tests the external API monitoring system
 */

const APIHealthMonitor = require('../tools/monitoring/api-health-monitor');

describe('API Health Check System', () => {
  let monitor;

  beforeEach(() => {
    monitor = new APIHealthMonitor();
  });

  test('should initialize with default external APIs', () => {
    expect(monitor).toBeDefined();
    expect(monitor.externalAPIs).toBeDefined();
    expect(Object.keys(monitor.externalAPIs)).toContain('Fake Failing API');
    expect(Object.keys(monitor.externalAPIs)).toContain('CoinGecko API');
  });

  test('should generate proper health report structure', async () => {
    // Mock the health check to avoid external API calls
    monitor.healthStatus = {
      'Test API': {
        name: 'Test API',
        healthy: true,
        status: 200,
        responseTime: 100,
        timestamp: new Date().toISOString(),
        critical: false
      },
      'Fake Failing API': {
        name: 'Fake Failing API',
        healthy: false,
        status: 500,
        responseTime: 200,
        error: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        critical: false
      }
    };
    monitor.lastCheck = new Date().toISOString();

    const report = monitor.generateHealthReport();

    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('overallHealth');
    expect(report).toHaveProperty('unhealthyServices');
    expect(report).toHaveProperty('details');
    
    expect(report.overallHealth).toBe('UNHEALTHY');
    expect(report.unhealthyServices).toContain('Fake Failing API');
    expect(report.details).toContain('Fake Failing API');
    expect(report.details).toContain('not responding correctly');
  });

  test('should report healthy status when all APIs are working', () => {
    monitor.healthStatus = {
      'Test API 1': {
        name: 'Test API 1',
        healthy: true,
        status: 200,
        responseTime: 100,
        timestamp: new Date().toISOString(),
        critical: false
      },
      'Test API 2': {
        name: 'Test API 2',
        healthy: true,
        status: 200,
        responseTime: 150,
        timestamp: new Date().toISOString(),
        critical: false
      }
    };
    monitor.lastCheck = new Date().toISOString();

    const report = monitor.generateHealthReport();

    expect(report.overallHealth).toBe('HEALTHY');
    expect(report.unhealthyServices).toHaveLength(0);
    expect(report.details).toContain('All external APIs are responding correctly');
  });

  test('should handle multiple unhealthy services', () => {
    monitor.healthStatus = {
      'Failed API 1': {
        name: 'Failed API 1',
        healthy: false,
        status: 500,
        responseTime: 100,
        error: 'Server Error',
        timestamp: new Date().toISOString(),
        critical: true
      },
      'Failed API 2': {
        name: 'Failed API 2',
        healthy: false,
        status: 404,
        responseTime: 50,
        error: 'Not Found',
        timestamp: new Date().toISOString(),
        critical: false
      }
    };
    monitor.lastCheck = new Date().toISOString();

    const report = monitor.generateHealthReport();

    expect(report.overallHealth).toBe('UNHEALTHY');
    expect(report.unhealthyServices).toHaveLength(2);
    expect(report.unhealthyServices).toContain('Failed API 1');
    expect(report.unhealthyServices).toContain('Failed API 2');
    expect(report.details).toContain('Failed API 1, Failed API 2');
  });

  test('should format alert JSON correctly for GitHub issue format', () => {
    monitor.healthStatus = {
      'Fake Failing API': {
        name: 'Fake Failing API',
        healthy: false,
        status: 500,
        responseTime: 200,
        error: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        critical: false
      }
    };
    monitor.lastCheck = new Date().toISOString();

    const report = monitor.generateHealthReport();
    
    // This should match the format from the GitHub issue
    const expectedFormat = {
      details: report.details,
      unhealthyServices: report.unhealthyServices
    };

    expect(expectedFormat.details).toBe('The following external APIs are not responding correctly: Fake Failing API. This may affect website functionality.');
    expect(expectedFormat.unhealthyServices).toEqual(['Fake Failing API']);
  });

  test('should throw error when no health check has been performed', () => {
    expect(() => {
      monitor.getLastReport();
    }).toThrow('No health check has been performed yet');
  });
});