/**
 * 🚨 CRITICAL BACKEND SERVICE MONITOR
 * Monitors payment-gateway and database connectivity
 * Addresses Issue #33 - Critical System Error E-12045
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class CriticalBackendServiceMonitor {
  constructor() {
    this.services = {
      'payment-gateway': {
        name: 'Payment Gateway Service',
        endpoints: [
          'https://burnitoken.website/.netlify/functions/token-info',
          'https://burnitoken.website/.netlify/functions/crypto-price'
        ],
        critical: true
      },
      'database-connectivity': {
        name: 'Database Connectivity',
        endpoints: [
          'https://burnitoken.website/.netlify/functions/contact-form',
          'https://burnitoken.website/.netlify/functions/security-report'
        ],
        critical: true
      },
      'xrpl-blockchain': {
        name: 'XRPL Blockchain Integration',
        endpoints: [
          'https://api.xrpl.org/v1/server/info',
          'https://livenet.xrpl.org'
        ],
        critical: true
      }
    };
    
    this.alertHistory = [];
    this.lastHealthCheck = null;
    this.errorCodes = {
      'E-12045': {
        description: 'Database connection failure in payment-gateway service',
        severity: 'CRITICAL',
        actions: [
          'Check database connectivity',
          'Verify service configuration',
          'Restart payment gateway service',
          'Escalate to development team'
        ]
      }
    };
  }

  async monitorServices() {
    console.log('🚨 Starting Critical Backend Service Monitoring...');
    console.log('===================================================');
    console.log('🎯 Monitoring payment-gateway and database connectivity');
    console.log('🔍 Checking for error E-12045 and related issues');
    console.log('');

    const healthReport = {
      timestamp: new Date().toISOString(),
      overallStatus: 'HEALTHY',
      services: {},
      alerts: [],
      errors: []
    };

    // Monitor each service
    for (const [serviceId, service] of Object.entries(this.services)) {
      console.log(`🔍 Monitoring ${service.name}...`);
      
      const serviceStatus = await this.checkService(serviceId, service);
      healthReport.services[serviceId] = serviceStatus;
      
      if (!serviceStatus.healthy) {
        healthReport.overallStatus = 'CRITICAL';
        
        // Generate E-12045 alert if it's a database connectivity issue
        if (serviceId === 'payment-gateway' || serviceId === 'database-connectivity') {
          const alert = this.generateCriticalAlert('E-12045', service.name, serviceStatus.error);
          healthReport.alerts.push(alert);
          this.alertHistory.push(alert);
          
          console.error(`❌ CRITICAL ALERT: ${alert.title}`);
          console.error(`   Error Code: ${alert.errorCode}`);
          console.error(`   Service: ${alert.service}`);
          console.error(`   Details: ${alert.details}`);
        }
      }
    }

    // Save health report
    await this.saveHealthReport(healthReport);
    
    // Generate alerts if needed
    if (healthReport.alerts.length > 0) {
      await this.processAlerts(healthReport.alerts);
    }

    console.log('');
    console.log('📊 MONITORING SUMMARY:');
    console.log('======================');
    console.log(`Overall Status: ${healthReport.overallStatus}`);
    console.log(`Services Monitored: ${Object.keys(this.services).length}`);
    console.log(`Alerts Generated: ${healthReport.alerts.length}`);
    console.log(`Timestamp: ${healthReport.timestamp}`);

    this.lastHealthCheck = healthReport;
    return healthReport;
  }

  async checkService(serviceId, service) {
    const serviceStatus = {
      name: service.name,
      healthy: true,
      endpoints: {},
      responseTime: 0,
      error: null,
      timestamp: new Date().toISOString()
    };

    const startTime = Date.now();

    for (const endpoint of service.endpoints) {
      try {
        const endpointStatus = await this.checkEndpoint(endpoint);
        serviceStatus.endpoints[endpoint] = endpointStatus;
        
        if (!endpointStatus.healthy) {
          serviceStatus.healthy = false;
          serviceStatus.error = endpointStatus.error;
        }
      } catch (error) {
        serviceStatus.healthy = false;
        serviceStatus.error = error.message;
        serviceStatus.endpoints[endpoint] = {
          healthy: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    serviceStatus.responseTime = Date.now() - startTime;

    if (serviceStatus.healthy) {
      console.log(`   ✅ ${service.name} - HEALTHY (${serviceStatus.responseTime}ms)`);
    } else {
      console.log(`   ❌ ${service.name} - FAILED (${serviceStatus.error})`);
    }

    return serviceStatus;
  }

  async checkEndpoint(url) {
    return new Promise((resolve) => {
      const request = https.get(url, (response) => {
        const status = {
          healthy: response.statusCode === 200 || response.statusCode < 500,
          statusCode: response.statusCode,
          timestamp: new Date().toISOString()
        };

        if (!status.healthy) {
          status.error = `HTTP ${response.statusCode}`;
        }

        resolve(status);
      });

      request.on('error', (error) => {
        resolve({
          healthy: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });

      request.setTimeout(30000, () => {
        request.destroy();
        resolve({
          healthy: false,
          error: 'Request timeout (30s)',
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  generateCriticalAlert(errorCode, serviceName, errorDetails) {
    const errorInfo = this.errorCodes[errorCode] || {
      description: 'Unknown critical error',
      severity: 'CRITICAL',
      actions: ['Investigate immediately', 'Contact development team']
    };

    return {
      id: `ALERT_${errorCode}_${Date.now()}`,
      errorCode: errorCode,
      severity: errorInfo.severity,
      title: `🚨 CRITICAL: ${errorInfo.description}`,
      service: serviceName,
      details: errorDetails || 'Die Verbindung zur Datenbank konnte nicht hergestellt werden. Dieser Test überprüft die gesamte Kette.',
      timestamp: new Date().toISOString(),
      actions: errorInfo.actions,
      status: 'ACTIVE'
    };
  }

  async processAlerts(alerts) {
    console.log('');
    console.log('🚨 PROCESSING CRITICAL ALERTS:');
    console.log('===============================');

    for (const alert of alerts) {
      // Log alert in the format expected by monitoring system
      console.log(`Alert ID: ${alert.id}`);
      console.log(`Error Code: ${alert.errorCode}`);
      console.log(`Severity: ${alert.severity}`);
      console.log(`Service: ${alert.service}`);
      console.log(`Details: ${alert.details}`);
      console.log('Recommended Actions:');
      alert.actions.forEach((action, index) => {
        console.log(`  ${index + 1}. ${action}`);
      });
      console.log('');

      // Create alert file for integration with existing monitoring
      await this.saveAlert(alert);
    }
  }

  async saveAlert(alert) {
    const alertsDir = path.join(__dirname, '../../monitoring-alerts');
    
    try {
      if (!fs.existsSync(alertsDir)) {
        fs.mkdirSync(alertsDir, { recursive: true });
      }

      const alertFile = path.join(alertsDir, `${alert.id}.json`);
      await fs.promises.writeFile(alertFile, JSON.stringify(alert, null, 2));
      
      console.log(`💾 Alert saved: ${alertFile}`);
    } catch (error) {
      console.error('❌ Failed to save alert:', error.message);
    }
  }

  async saveHealthReport(report) {
    const reportsDir = path.join(__dirname, '../../monitoring-reports');
    
    try {
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const reportFile = path.join(reportsDir, `backend-health-${Date.now()}.json`);
      await fs.promises.writeFile(reportFile, JSON.stringify(report, null, 2));
      
      // Also update the latest report
      const latestFile = path.join(reportsDir, 'backend-health-latest.json');
      await fs.promises.writeFile(latestFile, JSON.stringify(report, null, 2));
      
      console.log(`📊 Health report saved: ${reportFile}`);
    } catch (error) {
      console.error('❌ Failed to save health report:', error.message);
    }
  }

  async runContinuousMonitoring(intervalMinutes = 5) {
    console.log(`🔄 Starting continuous monitoring (every ${intervalMinutes} minutes)...`);
    
    // Initial monitoring
    await this.monitorServices();
    
    // Set up interval
    setInterval(async () => {
      try {
        await this.monitorServices();
      } catch (error) {
        console.error('❌ Monitoring cycle failed:', error.message);
      }
    }, intervalMinutes * 60 * 1000);
  }

  getLastHealthCheck() {
    return this.lastHealthCheck;
  }

  getAlertHistory() {
    return this.alertHistory;
  }
}

// Run monitoring if executed directly
async function runBackendMonitoring() {
  try {
    const monitor = new CriticalBackendServiceMonitor();
    const healthReport = await monitor.monitorServices();
    
    if (healthReport.overallStatus === 'CRITICAL') {
      console.error('🚨 CRITICAL SYSTEM ALERT: Backend services are experiencing issues!');
      process.exit(1);
    } else {
      console.log('✅ All backend services are healthy');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Backend monitoring failed:', error.message);
    process.exit(1);
  }
}

// Export for other modules
module.exports = {
  CriticalBackendServiceMonitor,
  runBackendMonitoring
};

// Direct execution
if (require.main === module) {
  runBackendMonitoring().catch(console.error);
}