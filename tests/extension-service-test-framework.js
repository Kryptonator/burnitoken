/**
 * Test Suite für Erweiterungen und Services
 * 
 * Dieses Skript führt automatisierte Tests für alle VS Code Extensions, 
 * KI-Services und GSC-Tools durch, um sicherzustellen, dass sie korrekt
 * funktionieren und sich auch nach einem Neustart wiederherstellen lassen.
 * 
 * 2025-06-22: Erstellt als Teil des EXTENSION & SERVICES MONITOR
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const assert = require('assert');

// Konfiguration
const LOG_DIR = path.join(__dirname, 'logs');
const TEST_LOG_FILE = path.join(LOG_DIR, `extension-tests-${new Date().toISOString().split('T')[0]}.log`);
const REPORT_FILE = path.join(__dirname, '..', 'TEST_REPORT.md');

// Stelle sicher, dass das Log-Verzeichnis existiert
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Test-Modi
const QUICK_TEST = process.argv.includes('--quick');
const VERBOSE = process.argv.includes('--verbose');
const CI_MODE = process.argv.includes('--ci');
const TARGET = process.argv.find(arg => arg.startsWith('--target='))?.split('=')[1] || 'all';

// Globaler Test-Status
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  extensionTests: {},
  serviceTests: {},
  gscTests: {}
};

// Logger-Funktionen
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  if (VERBOSE || type === 'error') {
    console.log(logMessage);
  }
  
  fs.appendFileSync(TEST_LOG_FILE, logMessage + '\n');
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
  log(message, 'success');
}

function logError(message) {
  console.error(`❌ ${message}`);
  log(message, 'error');
}

function logWarning(message) {
  console.warn(`⚠️ ${message}`);
  log(message, 'warning');
}

function logInfo(message) {
  if (VERBOSE) {
    console.info(`ℹ️ ${message}`);
  }
  log(message, 'info');
}

// Extension-Tests

const extensionsToTest = [
  // Format: [name, testFile, isRequired]
  ['Extension Status Dashboard', '../tools/extension-status-dashboard.js', true],
  ['Extension Auto-Restart', '../tools/extension-auto-restart.js', true],
  ['Extension Function Validator', '../extension-function-validator.js', true],
  ['AI Services Manager', '../tools/ai-services-manager.js', true],
  ['AI Status Checker', '../tools/ai-status.js', true],
];

async function testExtensions() {
  console.log('\n🧪 TESTING EXTENSIONS...');
  
  for (const [name, testFile, isRequired] of extensionsToTest) {
    testResults.total++;
    const fullPath = path.resolve(__dirname, testFile);
    
    if (!fs.existsSync(fullPath)) {
      logWarning(`${name}: File not found at ${fullPath}`);
      testResults.extensionTests[name] = {
        result: 'skipped',
        reason: 'File not found'
      };
      testResults.skipped++;
      continue;
    }
    
    try {
      logInfo(`Testing ${name}...`);
      
      // Füge einen --test Parameter hinzu, der von den meisten Tools unterstützt werden sollte
      const output = execSync(`node "${fullPath}" --test`, { encoding: 'utf8', timeout: 10000 });
      
      if (output.toLowerCase().includes('error') || output.toLowerCase().includes('exception')) {
        throw new Error(`Test output contains errors: ${output.split('\n')[0]}...`);
      }
      
      logSuccess(`${name}: Test passed`);
      testResults.extensionTests[name] = {
        result: 'passed',
        notes: output.length > 100 ? output.substring(0, 100) + '...' : output
      };
      testResults.passed++;
      
    } catch (error) {
      const errorMessage = error.message || 'Unknown error';
      
      if (isRequired) {
        logError(`${name}: Test failed - ${errorMessage}`);
        testResults.extensionTests[name] = {
          result: 'failed',
          error: errorMessage
        };
        testResults.failed++;
      } else {
        logWarning(`${name}: Test failed, but not required - ${errorMessage}`);
        testResults.extensionTests[name] = {
          result: 'failed but optional',
          error: errorMessage
        };
        testResults.skipped++;
      }
    }
  }
  
  console.log(`\nExtension Tests Summary: ${testResults.passed} passed, ${testResults.failed} failed, ${testResults.skipped} skipped`);
}

// Service Tests
const servicesToTest = [
  // Format: [name, testCommand, expectedOutput, isRequired]
  ['Session Saver', 'npm run ai:status -- --service=session-saver', 'Status', true],
  ['AI Conversation Bridge', 'npm run ai:status -- --service=conversation-bridge', 'Status', true],
];

async function testServices() {
  console.log('\n🧪 TESTING AI SERVICES...');
  
  for (const [name, command, expectedOutput, isRequired] of servicesToTest) {
    testResults.total++;
    
    try {
      logInfo(`Testing ${name}...`);
      
      const output = execSync(command, { encoding: 'utf8', timeout: 10000 });
      
      if (!output.includes(expectedOutput)) {
        throw new Error(`Expected output containing "${expectedOutput}" but got: ${output.substring(0, 50)}...`);
      }
      
      logSuccess(`${name}: Test passed`);
      testResults.serviceTests[name] = {
        result: 'passed',
        notes: output.length > 100 ? output.substring(0, 100) + '...' : output
      };
      testResults.passed++;
      
    } catch (error) {
      const errorMessage = error.message || 'Unknown error';
      
      if (isRequired) {
        logError(`${name}: Test failed - ${errorMessage}`);
        testResults.serviceTests[name] = {
          result: 'failed',
          error: errorMessage
        };
        testResults.failed++;
      } else {
        logWarning(`${name}: Test failed, but not required - ${errorMessage}`);
        testResults.serviceTests[name] = {
          result: 'failed but optional',
          error: errorMessage
        };
        testResults.skipped++;
      }
    }
  }
  
  console.log(`\nService Tests Summary: ${Object.keys(testResults.serviceTests).filter(k => testResults.serviceTests[k].result === 'passed').length} passed, ${Object.keys(testResults.serviceTests).filter(k => testResults.serviceTests[k].result === 'failed').length} failed`);
}

// GSC Tool Tests
const gscToolsToTest = [
  // Format: [name, testCommand, isRequired]
  ['GSC Status Check', 'npm run gsc:status -- --test', true],
  ['GSC Auth Check', 'npm run gsc:auth -- --test', true],
  ['GSC Quick Test', 'npm run gsc:test', true],
  ['GSC Performance Data', 'npm run gsc:performance -- --test', false],
  ['GSC Keywords Report', 'npm run gsc:keywords -- --test', false],
  ['GSC Crawl Stats', 'npm run gsc:crawl -- --test', false]
];

async function testGscTools() {
  console.log('\n🧪 TESTING GSC TOOLS...');
  
  for (const [name, command, isRequired] of gscToolsToTest) {
    testResults.total++;
    
    try {
      logInfo(`Testing ${name}...`);
      
      const output = execSync(command, { encoding: 'utf8', timeout: 20000 });
      
      if (output.toLowerCase().includes('error') && !output.toLowerCase().includes('no error')) {
        throw new Error(`Test output contains errors: ${output.split('\n')[0]}...`);
      }
      
      logSuccess(`${name}: Test passed`);
      testResults.gscTests[name] = {
        result: 'passed',
        notes: output.length > 100 ? output.substring(0, 100) + '...' : output
      };
      testResults.passed++;
      
    } catch (error) {
      const errorMessage = error.message || 'Unknown error';
      
      if (isRequired) {
        logError(`${name}: Test failed - ${errorMessage}`);
        testResults.gscTests[name] = {
          result: 'failed',
          error: errorMessage
        };
        testResults.failed++;
      } else {
        logWarning(`${name}: Test failed, but not required - ${errorMessage}`);
        testResults.gscTests[name] = {
          result: 'failed but optional',
          error: errorMessage
        };
        testResults.skipped++;
      }
    }
  }
  
  console.log(`\nGSC Tool Tests Summary: ${Object.keys(testResults.gscTests).filter(k => testResults.gscTests[k].result === 'passed').length} passed, ${Object.keys(testResults.gscTests).filter(k => testResults.gscTests[k].result === 'failed').length} failed`);
}

// Integration Tests
async function testIntegration() {
  console.log('\n🧪 TESTING INTEGRATION SCENARIOS...');
  
  // Test 1: Restart Sequence
  try {
    logInfo('Testing extension restart sequence...');
    
    // Simulate a shutdown and restart
    execSync('npm run extension:restart', { encoding: 'utf8', timeout: 20000 });
    
    // Check if all services are running after restart
    const statusOutput = execSync('npm run status:all', { encoding: 'utf8', timeout: 20000 });
    
    if (statusOutput.toLowerCase().includes('error') && !statusOutput.toLowerCase().includes('no error')) {
      throw new Error('Services not properly restarted');
    }
    
    logSuccess('Integration Test: Restart Sequence passed');
  } catch (error) {
    logError(`Integration Test: Restart Sequence failed - ${error.message}`);
  }
  
  // Test 2: Dashboard and Status Reporting
  try {
    logInfo('Testing status dashboard consistency...');
    
    // Get individual status
    const aiStatus = execSync('npm run ai:status', { encoding: 'utf8', timeout: 10000 });
    const gscStatus = execSync('npm run gsc:status', { encoding: 'utf8', timeout: 10000 });
    
    // Get unified status
    const unifiedStatus = execSync('npm run status:unified', { encoding: 'utf8', timeout: 10000 });
    
    // Check consistency (simplified)
    if (!unifiedStatus.includes('AI Status') || !unifiedStatus.includes('GSC Status')) {
      throw new Error('Unified status report is missing components');
    }
    
    logSuccess('Integration Test: Dashboard and Status Reporting passed');
  } catch (error) {
    logError(`Integration Test: Dashboard and Status Reporting failed - ${error.message}`);
  }
}

// Create Report
function createTestReport() {
  const report = `# 🧪 EXTENSION & SERVICES TEST REPORT
  
## 📊 Test Summary

**Date:** ${new Date().toISOString().split('T')[0]}
**Time:** ${new Date().toISOString().split('T')[1].substring(0, 8)}
**Mode:** ${QUICK_TEST ? 'Quick Test' : 'Full Test'}${CI_MODE ? ' (CI)' : ''}
**Target:** ${TARGET}

| Category | Passed | Failed | Skipped | Total |
|----------|--------|--------|---------|-------|
| Extensions | ${Object.keys(testResults.extensionTests).filter(k => testResults.extensionTests[k].result === 'passed').length} | ${Object.keys(testResults.extensionTests).filter(k => testResults.extensionTests[k].result === 'failed').length} | ${Object.keys(testResults.extensionTests).filter(k => !['passed', 'failed'].includes(testResults.extensionTests[k].result)).length} | ${Object.keys(testResults.extensionTests).length} |
| Services | ${Object.keys(testResults.serviceTests).filter(k => testResults.serviceTests[k].result === 'passed').length} | ${Object.keys(testResults.serviceTests).filter(k => testResults.serviceTests[k].result === 'failed').length} | ${Object.keys(testResults.serviceTests).filter(k => !['passed', 'failed'].includes(testResults.serviceTests[k].result)).length} | ${Object.keys(testResults.serviceTests).length} |
| GSC Tools | ${Object.keys(testResults.gscTests).filter(k => testResults.gscTests[k].result === 'passed').length} | ${Object.keys(testResults.gscTests).filter(k => testResults.gscTests[k].result === 'failed').length} | ${Object.keys(testResults.gscTests).filter(k => !['passed', 'failed'].includes(testResults.gscTests[k].result)).length} | ${Object.keys(testResults.gscTests).length} |
| **TOTAL** | **${testResults.passed}** | **${testResults.failed}** | **${testResults.skipped}** | **${testResults.total}** |

## 🔍 Detailed Results

### Extensions

${Object.entries(testResults.extensionTests)
  .map(([name, result]) => `- **${name}**: ${result.result === 'passed' ? '✅ PASSED' : result.result === 'failed' ? '❌ FAILED: ' + result.error : '⚠️ SKIPPED: ' + result.reason}`)
  .join('\n')}

### Services

${Object.entries(testResults.serviceTests)
  .map(([name, result]) => `- **${name}**: ${result.result === 'passed' ? '✅ PASSED' : result.result === 'failed' ? '❌ FAILED: ' + result.error : '⚠️ SKIPPED: ' + result.reason}`)
  .join('\n')}

### GSC Tools

${Object.entries(testResults.gscTests)
  .map(([name, result]) => `- **${name}**: ${result.result === 'passed' ? '✅ PASSED' : result.result === 'failed' ? '❌ FAILED: ' + result.error : '⚠️ SKIPPED: ' + result.reason}`)
  .join('\n')}

## 📋 Next Steps

1. Fix failed tests, especially required components:
   ${Object.entries({...testResults.extensionTests, ...testResults.serviceTests, ...testResults.gscTests})
     .filter(([_, result]) => result.result === 'failed')
     .map(([name, _]) => `- [ ] ${name}`)
     .join('\n   ') || '   - No failed tests! 🎉'}

2. Consider implementing additional tests for:
   - [ ] Cloud workspace compatibility
   - [ ] VS Code automatic startup behavior
   - [ ] Edge cases (network failures, incomplete authentication)

## 🛠️ Test Environment

- Node.js: ${process.version}
- OS: ${process.platform} ${process.arch}
- Test Framework: Custom Test Framework v1.0.0
- Log File: \`${TEST_LOG_FILE}\`
`;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`\n📝 Test report written to: ${REPORT_FILE}`);
}

// Main Function
async function main() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('🧪 EXTENSION & SERVICES TEST FRAMEWORK');
  console.log('====================================================');
  console.log(`Run Mode: ${QUICK_TEST ? 'Quick' : 'Full'}, Target: ${TARGET}`);
  console.log(`Start Time: ${new Date().toISOString()}`);
  
  try {
    // Run Tests based on target
    if (TARGET === 'all' || TARGET === 'extensions') {
      await testExtensions();
    }
    
    if (TARGET === 'all' || TARGET === 'services') {
      await testServices();
    }
    
    if (TARGET === 'all' || TARGET === 'gsc') {
      await testGscTools();
    }
    
    if (!QUICK_TEST && (TARGET === 'all' || TARGET === 'integration')) {
      await testIntegration();
    }
    
    // Create Report
    createTestReport();
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Test run completed in ${duration.toFixed(2)} seconds`);
    console.log(`📊 Results: ${testResults.passed} passed, ${testResults.failed} failed, ${testResults.skipped} skipped (total: ${testResults.total})`);
    
    // Exit with appropriate code for CI
    if (CI_MODE && testResults.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    logError(`Unhandled error in test framework: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
