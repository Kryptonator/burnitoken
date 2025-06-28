#!/usr/bin/env node

/**
 * Website Monitoring Suite Runner
 * Executes all monitoring scripts and provides a consolidated report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BurniToken Website Monitoring Suite');
console.log('='.repeat(60));
console.log(`🕐 Started at: ${new Date().toISOString()}`);
console.log('');

async function runMonitoringScript(scriptPath, scriptName) {
  console.log(`📊 Running ${scriptName}...`);
  console.log('-'.repeat(40));
  
  try {
    const output = execSync(`node ${scriptPath}`, {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 60000
    });
    
    console.log(output);
    return { script: scriptName, status: 'SUCCESS', output };
  } catch (error) {
    console.log(`❌ ${scriptName} failed with exit code ${error.status || 'unknown'}`);
    if (error.stdout) {
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.log('STDERR:', error.stderr);
    }
    return { script: scriptName, status: 'FAILED', error: error.message, output: error.stdout };
  }
}

async function runMonitoringSuite() {
  const results = [];
  
  // Run all monitoring scripts
  const scripts = [
    { path: 'tools/monitoring/website-health.js', name: 'Website Health Check' },
    { path: 'tools/monitoring/website-connectivity-check.js', name: 'Website Connectivity Check' },
    { path: 'tools/monitoring/simple-browser-monitor.js', name: 'Simple Browser Monitor' }
  ];
  
  for (const script of scripts) {
    const result = await runMonitoringScript(script.path, script.name);
    results.push(result);
    console.log('');
  }
  
  // Generate summary
  console.log('📋 MONITORING SUITE SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.status === 'SUCCESS').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  results.forEach(result => {
    const icon = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`   ${icon} ${result.script}`);
  });
  
  // Check for SSL timeout issues
  const healthLogPath = 'tools/monitoring/website-health.log';
  if (fs.existsSync(healthLogPath)) {
    console.log('\n🔍 Checking for SSL timeout issues...');
    const logContent = fs.readFileSync(healthLogPath, 'utf8');
    const lines = logContent.trim().split('\n');
    const latestEntry = JSON.parse(lines[lines.length - 1]);
    
    if (latestEntry.status === 'SSL_TIMEOUT_ERROR') {
      console.log('🚨 SSL TIMEOUT DETECTED in latest health check!');
      console.log(`   Timestamp: ${latestEntry.timestamp}`);
      console.log(`   Domain: ${latestEntry.domain}`);
    } else if (latestEntry.status === 'CRITICAL') {
      console.log('⚠️  CRITICAL STATUS detected in latest health check');
    } else if (latestEntry.status === 'HEALTHY') {
      console.log('✅ Website status is HEALTHY');
    }
  }
  
  console.log('\n📝 Health log location: tools/monitoring/website-health.log');
  console.log('📖 Documentation: tools/monitoring/README.md');
  
  return results;
}

if (require.main === module) {
  runMonitoringSuite()
    .then((results) => {
      const hasFailures = results.some(r => r.status === 'FAILED');
      process.exit(hasFailures ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Suite execution failed:', error);
      process.exit(2);
    });
}

module.exports = { runMonitoringSuite };