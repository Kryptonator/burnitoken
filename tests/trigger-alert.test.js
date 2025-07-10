/**
 * Alert System Test - now uses proper health check monitoring
 * Tests the alert system with realistic scenarios
 */

const APIHealthMonitor = require('../tools/monitoring/api-health-monitor');

describe('Alert System Test', () => {
  test('should trigger alert when Fake Failing API is unhealthy', () => {
    const monitor = new APIHealthMonitor();
    
    // Simulate the exact scenario from the GitHub issue
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
    
    // Verify this matches the expected GitHub issue format
    expect(report.details).toBe('The following external APIs are not responding correctly: Fake Failing API. This may affect website functionality.');
    expect(report.unhealthyServices).toEqual(['Fake Failing API']);
    expect(report.overallHealth).toBe('UNHEALTHY');
    
    // This test now passes and provides meaningful health check validation
    console.log('🚨 Alert triggered for unhealthy API:', JSON.stringify({
      details: report.details,
      unhealthyServices: report.unhealthyServices
    }, null, 2));
  });
});
