/**
 * Health Check Integration
 * Integrates API health monitoring with the existing dashboard system
 */

const APIHealthMonitor = require('./api-health-monitor');

class HealthCheckDashboard {
  constructor() {
    this.monitor = new APIHealthMonitor();
    this.isRunning = false;
  }

  async startHealthMonitoring() {
    console.log('🏥 HEALTH CHECK DASHBOARD INTEGRATION');
    console.log('====================================');
    
    try {
      const report = await this.monitor.performHealthCheck();
      
      console.log('\n📊 API HEALTH STATUS:');
      console.log('---------------------');
      console.log(`Overall Health: ${report.overallHealth}`);
      console.log(`Total APIs: ${report.totalAPIs}`);
      console.log(`Healthy: ${report.healthyCount}`);
      console.log(`Unhealthy: ${report.unhealthyCount}`);
      
      if (report.unhealthyCount > 0) {
        console.log('\n🚨 ALERT STATUS:');
        console.log('---------------');
        console.log('⚠️ EXTERNAL API ISSUES DETECTED');
        console.log(JSON.stringify({
          details: report.details,
          unhealthyServices: report.unhealthyServices
        }, null, 2));
        
        console.log('\n🔧 RECOMMENDED ACTIONS:');
        console.log('• Check external API status pages');
        console.log('• Verify network connectivity');
        console.log('• Implement fallback mechanisms');
        console.log('• Monitor for recovery');
      } else {
        console.log('\n✅ ALL SYSTEMS OPERATIONAL');
        console.log('All external APIs are responding correctly.');
      }
      
      return report;
      
    } catch (error) {
      console.error('❌ Health monitoring failed:', error);
      return null;
    }
  }

  async generateHealthReport() {
    const report = await this.startHealthMonitoring();
    
    if (!report) return null;
    
    return {
      timestamp: new Date().toISOString(),
      healthCheck: {
        status: report.overallHealth,
        apis: {
          total: report.totalAPIs,
          healthy: report.healthyCount,
          unhealthy: report.unhealthyCount
        },
        issues: report.unhealthyServices,
        details: report.details
      }
    };
  }
}

module.exports = HealthCheckDashboard;

// CLI execution
if (require.main === module) {
  async function runHealthDashboard() {
    const dashboard = new HealthCheckDashboard();
    await dashboard.startHealthMonitoring();
  }
  
  runHealthDashboard().catch(console.error);
}