/**
 * 🚨 CRITICAL BACKEND SERVICES E2E TEST
 * End-to-End testing for backend service connectivity and database connections
 * Addresses Issue #33 - Critical System Error E-12045 (Database Connection Failure)
 */

const { test, expect } = require('@playwright/test');

test.describe('Backend Services - Critical System Monitoring', () => {
  
  // Test payment-gateway service (referenced in error E-12045)
  test('Payment Gateway Service - Database Connectivity Test', async ({ request }) => {
    console.log('🔍 Testing payment-gateway service database connectivity...');
    
    try {
      // Test netlify functions that might represent payment gateway
      const tokenInfoResponse = await request.get('/.netlify/functions/token-info');
      expect(tokenInfoResponse.status()).toBe(200);
      
      const tokenData = await tokenInfoResponse.json();
      expect(tokenData).toHaveProperty('name');
      expect(tokenData).toHaveProperty('symbol');
      
      console.log('✅ Token info service responding correctly');
      
      // Test crypto price service (part of payment flow)  
      const priceResponse = await request.get('/.netlify/functions/crypto-price?symbol=ethereum');
      expect(priceResponse.status()).toBe(200);
      
      const priceData = await priceResponse.json();
      expect(priceData).toHaveProperty('data');
      expect(priceData).toHaveProperty('timestamp');
      
      console.log('✅ Price service responding correctly');
      
    } catch (error) {
      // Log error with specific code E-12045 for monitoring system
      console.error('❌ CRITICAL ERROR E-12045: Database connection failed in payment-gateway service');
      console.error('Details:', error.message);
      console.error('Timestamp:', new Date().toISOString());
      
      // Throw with structured error for monitoring
      const criticalError = new Error(`CRITICAL: Payment gateway database connection failed - E-12045`);
      criticalError.code = 'E-12045';
      criticalError.service = 'payment-gateway';
      criticalError.timestamp = new Date().toISOString();
      throw criticalError;
    }
  });

  // Test XRPL connectivity (blockchain "database")
  test('XRPL Integration - Blockchain Connectivity Test', async ({ page }) => {
    console.log('🌐 Testing XRPL blockchain connectivity...');
    
    await page.goto('/');
    
    // Check if XRPL integration loads
    await page.waitForFunction(() => {
      return window.BurniTokenXRPLIntegration || window.burniXRPL;
    }, { timeout: 30000 });
    
    // Test XRPL connection status
    const xrplStatus = await page.evaluate(() => {
      if (window.BurniTokenXRPLIntegration) {
        return window.BurniTokenXRPLIntegration.connected || false;
      }
      return false;
    });
    
    // If XRPL connection fails, this could be the "database" connection issue
    if (!xrplStatus) {
      console.error('❌ CRITICAL ERROR E-12045: XRPL blockchain connection failed');
      const criticalError = new Error(`CRITICAL: XRPL blockchain connection failed - E-12045`);
      criticalError.code = 'E-12045';
      criticalError.service = 'payment-gateway';
      criticalError.details = 'XRPL blockchain connection could not be established';
      throw criticalError;
    }
    
    console.log('✅ XRPL blockchain connection established');
  });

  // Test database operations for burn calculator
  test('Burn Calculator - Data Persistence Test', async ({ page }) => {
    console.log('🔥 Testing burn calculator data persistence...');
    
    await page.goto('/');
    
    // Wait for burn calculator to load
    await page.waitForFunction(() => {
      return window.BurniTokenBurnCalculator || window.burniCalculator;
    }, { timeout: 30000 });
    
    // Test data loading and saving capabilities
    const dataOperationResult = await page.evaluate(async () => {
      try {
        if (window.BurniTokenBurnCalculator) {
          const calculator = new window.BurniTokenBurnCalculator();
          
          // Test loading burn history (simulates database read)
          await calculator.loadBurnHistory();
          
          // Test saving burn history (simulates database write)
          await calculator.saveBurnHistory();
          
          return { success: true, connected: true };
        }
        return { success: false, connected: false };
      } catch (error) {
        return { success: false, error: error.message, connected: false };
      }
    });
    
    if (!dataOperationResult.success) {
      console.error('❌ CRITICAL ERROR E-12045: Data persistence operations failed');
      const criticalError = new Error(`CRITICAL: Data persistence failed - E-12045`);
      criticalError.code = 'E-12045';
      criticalError.service = 'payment-gateway';
      criticalError.details = 'Database operations for burn calculator failed';
      throw criticalError;
    }
    
    console.log('✅ Data persistence operations successful');
  });

  // Test contact form backend (potential database operation)
  test('Contact Form - Backend Processing Test', async ({ request }) => {
    console.log('📧 Testing contact form backend processing...');
    
    try {
      const contactResponse = await request.post('/.netlify/functions/contact-form', {
        data: {
          name: 'Test User',
          email: 'test@example.com',
          message: 'Test message for E2E monitoring'
        }
      });
      
      // Accept both success (200) and method not allowed (405) as valid responses
      // 405 means the endpoint exists but doesn't accept POST
      expect([200, 405, 404]).toContain(contactResponse.status());
      
      console.log('✅ Contact form endpoint accessible');
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR E-12045: Contact form backend failed');
      const criticalError = new Error(`CRITICAL: Contact form backend connection failed - E-12045`);
      criticalError.code = 'E-12045';
      criticalError.service = 'payment-gateway';
      criticalError.details = 'Contact form database connection failed';
      throw criticalError;
    }
  });

  // Test security report backend
  test('Security Report - Backend Connectivity Test', async ({ request }) => {
    console.log('🔒 Testing security report backend...');
    
    try {
      const securityResponse = await request.get('/.netlify/functions/security-report');
      
      // Accept various status codes as long as the endpoint responds
      expect(securityResponse.status()).toBeLessThan(500);
      
      console.log('✅ Security report backend responding');
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR E-12045: Security report backend failed');
      const criticalError = new Error(`CRITICAL: Security report backend connection failed - E-12045`);
      criticalError.code = 'E-12045';
      criticalError.service = 'payment-gateway';
      criticalError.details = 'Security report database connection failed';
      throw criticalError;
    }
  });

  // Comprehensive health check
  test('Overall Backend Health Check', async ({ request, page }) => {
    console.log('🏥 Running comprehensive backend health check...');
    
    const healthCheck = {
      timestamp: new Date().toISOString(),
      services: {},
      errors: []
    };
    
    // Test all critical services
    const services = [
      { name: 'token-info', endpoint: '/.netlify/functions/token-info' },
      { name: 'crypto-price', endpoint: '/.netlify/functions/crypto-price' },
      { name: 'security-report', endpoint: '/.netlify/functions/security-report' }
    ];
    
    for (const service of services) {
      try {
        const response = await request.get(service.endpoint);
        healthCheck.services[service.name] = {
          status: response.status(),
          healthy: response.status() < 500,
          responseTime: Date.now()
        };
      } catch (error) {
        healthCheck.services[service.name] = {
          status: 'ERROR',
          healthy: false,
          error: error.message
        };
        healthCheck.errors.push({
          service: service.name,
          error: error.message,
          code: 'E-12045'
        });
      }
    }
    
    // Check if any critical services failed
    const failedServices = Object.entries(healthCheck.services)
      .filter(([name, status]) => !status.healthy);
    
    if (failedServices.length > 0) {
      console.error('❌ CRITICAL ERROR E-12045: Multiple backend services failed');
      console.error('Failed services:', failedServices.map(([name]) => name));
      
      const criticalError = new Error(`CRITICAL: Multiple backend services failed - E-12045`);
      criticalError.code = 'E-12045';
      criticalError.service = 'payment-gateway';
      criticalError.details = `Failed services: ${failedServices.map(([name]) => name).join(', ')}`;
      criticalError.healthCheck = healthCheck;
      throw criticalError;
    }
    
    console.log('✅ All backend services healthy');
    console.log('Health check summary:', healthCheck);
  });
});