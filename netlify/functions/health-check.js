// Netlify Function for API Health Check
// Endpunkt: /.netlify/functions/health-check

const APIHealthMonitor = require('../../tools/monitoring/api-health-monitor');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const monitor = new APIHealthMonitor();
    const report = await monitor.performHealthCheck();
    
    // Return the expected format from the GitHub issue
    return {
      statusCode: report.unhealthyCount > 0 ? 503 : 200,
      headers,
      body: JSON.stringify({
        details: report.details,
        unhealthyServices: report.unhealthyServices,
        healthyServices: report.healthyServices,
        timestamp: report.timestamp,
        overallHealth: report.overallHealth
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        details: 'Health check system error. Unable to monitor external APIs.',
        unhealthyServices: ['Health Check System'],
        error: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};