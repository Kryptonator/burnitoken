/**
 * Test for Service Monitor - validates false positive detection
 */

const ServiceMonitor = require('../tools/monitoring/service-monitor');

describe('Service Monitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new ServiceMonitor();
  });

  test('should detect false positive for payment gateway error on frontend service', () => {
    const errorReport = {
      service: "payment-gateway",
      errorCode: "E-12045",
      timestamp: "2025-06-26T17:42:24.659Z",
      details: "Die Verbindung zur Datenbank konnte nicht hergestellt werden."
    };

    const result = monitor.processErrorReport(errorReport);

    expect(result.isValidError).toBe(false);
    expect(result.category).toBe('false-positive');
    expect(result.reason).toContain('Payment gateway error reported for frontend-only service');
  });

  test('should correctly identify service as frontend-only', () => {
    expect(monitor.config.service.type).toBe('static-website');
    expect(monitor.config.service.hasBackend).toBe(false);
    expect(monitor.config.service.hasDatabase).toBe(false);
    expect(monitor.config.service.hasPaymentGateway).toBe(false);
  });

  test('should exclude database errors for frontend service', () => {
    const result = monitor.shouldReportError('E-12045', 'database-connection');
    
    expect(result.shouldReport).toBe(false);
    expect(result.reason).toContain('Database connection errors not applicable to frontend-only service');
  });

  test('should exclude payment gateway errors for frontend service', () => {
    const result = monitor.shouldReportError('E-12045', 'payment-gateway');
    
    expect(result.shouldReport).toBe(false);
    expect(result.reason).toContain('Payment gateway errors not applicable to service without payment processing');
  });
});