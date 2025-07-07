const { execSync } = require('child_process');

function testSnykIntegration() {
  console.log('Starting Snyk integration test...');
  try {
    execSync('node tools/enhanced-security-manager.js', { stdio: 'inherit' });
    console.log('Snyk integration test finished successfully.');
  } catch (error) {
    console.error('Snyk integration test failed:', error);
  }
}

testSnykIntegration();
