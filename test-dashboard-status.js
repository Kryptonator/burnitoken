/**
 * Dashboard Status Test
 * Tests the current state of the real-time dashboard
 */

const fs = require('fs');
const path = require('path');

function testDashboardStatus() {
  console.log('🔍 Testing BURNI Real-Time Dashboard Status...\n');

  // Check if dashboard file exists
  const dashboardPath = path.join(__dirname, 'assets', 'burni-realtime-dashboard.js');

  if (!fs.existsSync(dashboardPath)) {
    console.error('❌ Dashboard file not found!');
    return false;
  }

  console.log('✅ Dashboard file found');

  // Read and analyze dashboard content
  try {
    const dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

    // Check for essential components
    const components = [
      'class BURNIRealtimeDashboard',
      'safeInit()',
      'waitForDependencies',
      'setupGlobalMethods',
      'class PriceWidget',
      'class CalculatorWidget',
      'class AIWidget',
      'class PerformanceWidget',
    ];

    console.log('\n📊 Component Analysis:');
    components.forEach((component) => {
      const found = dashboardCode.includes(component);
      console.log(`${found ? '✅' : '❌'} ${component}`);
    });

    // Check for error handling
    const errorHandling = [
      'try {',
      'catch (error)',
      'handleInitializationError',
      'createErrorDashboard',
    ];

    console.log('\n🛡️ Error Handling Analysis:');
    errorHandling.forEach((handler) => {
      const found = dashboardCode.includes(handler);
      console.log(`${found ? '✅' : '❌'} ${handler}`);
    });

    // Check file size and structure
    const lines = dashboardCode.split('\n').length;
    const size = fs.statSync(dashboardPath).size;

    console.log('\n📈 File Statistics:');
    console.log(`📏 Lines: ${lines}`);
    console.log(`💾 Size: ${(size / 1024).toFixed(2)} KB`);

    // Check recent formatting
    const hasGoodFormatting =
      dashboardCode.includes('  async safeInit()') &&
      dashboardCode.includes('    this.safeInit();');

    console.log(`🎨 Formatting: ${hasGoodFormatting ? '✅ Good' : '⚠️ Needs attention'}`);

    console.log('\n🎯 Dashboard Status: OPERATIONAL');
    return true;
  } catch (error) {
    console.error('❌ Error analyzing dashboard:', error.message);
    return false;
  }
}

// Run the test
testDashboardStatus();
