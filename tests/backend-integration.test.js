/**
 * 🔧 BACKEND SERVICE INTEGRATION TEST
 * Integrates backend service monitoring with existing test infrastructure
 */

const { CriticalBackendServiceMonitor } = require('../tools/monitoring/backend-service-monitor');

describe('Backend Service Integration Tests', () => {
  let monitor;

  beforeAll(async () => {
    monitor = new CriticalBackendServiceMonitor();
  });

  test('Critical Backend Services Health Check', async () => {
    const healthReport = await monitor.monitorServices();
    
    expect(healthReport).toBeDefined();
    expect(healthReport.timestamp).toBeDefined();
    expect(healthReport.overallStatus).toBeDefined();
    
    // If there are critical alerts, the test should fail
    if (healthReport.alerts.length > 0) {
      const criticalAlerts = healthReport.alerts.filter(alert => alert.severity === 'CRITICAL');
      if (criticalAlerts.length > 0) {
        throw new Error(`Critical backend service alerts detected: ${criticalAlerts.map(a => a.errorCode).join(', ')}`);
      }
    }
    
    expect(healthReport.overallStatus).not.toBe('CRITICAL');
  });

  test('Payment Gateway Service Monitoring', async () => {
    const healthReport = await monitor.monitorServices();
    const paymentGatewayStatus = healthReport.services['payment-gateway'];
    
    expect(paymentGatewayStatus).toBeDefined();
    expect(paymentGatewayStatus.name).toBe('Payment Gateway Service');
    
    // If payment gateway is unhealthy, check for E-12045 error
    if (!paymentGatewayStatus.healthy) {
      const e12045Alert = healthReport.alerts.find(alert => alert.errorCode === 'E-12045');
      if (e12045Alert) {
        console.error('CRITICAL ERROR E-12045 detected:', e12045Alert.details);
        throw new Error(`Payment Gateway Database Connection Failed (E-12045): ${e12045Alert.details}`);
      }
    }
    
    expect(paymentGatewayStatus.healthy).toBe(true);
  });

  test('Database Connectivity Monitoring', async () => {
    const healthReport = await monitor.monitorServices();
    const databaseStatus = healthReport.services['database-connectivity'];
    
    expect(databaseStatus).toBeDefined();
    expect(databaseStatus.name).toBe('Database Connectivity');
    
    // Database connectivity issues should trigger E-12045
    if (!databaseStatus.healthy) {
      throw new Error(`Database connectivity failed: ${databaseStatus.error}`);
    }
    
    expect(databaseStatus.healthy).toBe(true);
  });

  test('XRPL Blockchain Integration Monitoring', async () => {
    const healthReport = await monitor.monitorServices();
    const xrplStatus = healthReport.services['xrpl-blockchain'];
    
    expect(xrplStatus).toBeDefined();
    expect(xrplStatus.name).toBe('XRPL Blockchain Integration');
    
    // XRPL connectivity is critical for the payment gateway
    if (!xrplStatus.healthy) {
      console.warn('XRPL blockchain connectivity issue detected');
      // This could also trigger E-12045 in some cases
    }
    
    // XRPL can be temporarily unavailable, so we don't fail the test
    // but we log the status for monitoring
    console.log('XRPL Status:', xrplStatus.healthy ? 'HEALTHY' : 'DEGRADED');
  });

  test('Alert History Tracking', async () => {
    await monitor.monitorServices();
    const alertHistory = monitor.getAlertHistory();
    
    expect(Array.isArray(alertHistory)).toBe(true);
    
    // Check if there are any E-12045 alerts in history
    const e12045Alerts = alertHistory.filter(alert => alert.errorCode === 'E-12045');
    if (e12045Alerts.length > 0) {
      console.warn(`Found ${e12045Alerts.length} E-12045 alerts in history`);
      e12045Alerts.forEach(alert => {
        console.warn(`- Alert ${alert.id}: ${alert.details} (${alert.timestamp})`);
      });
    }
  });
});