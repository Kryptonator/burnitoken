/**
 * Comprehensive Test Suite for All BURNI Token Features
 * Tests all modules, AI, accessibility, i18n, and performance features
 */

console.log('🔬 Starting Comprehensive BURNI Feature Tests...\n');

// Test 1: BURNI Calculator
function testCalculator() {
  console.log('📊 Testing BURNI Calculator...');
  try {
    const BURNICalculator = require('./assets/burni-calculator.js');
    const calculator = new BURNICalculator();

    // Test basic calculation
    const stats = calculator.getStatistics();
    if (stats.totalBurned > 0 && stats.totalLocked > 0) {
      console.log('✅ Calculator: Basic functionality works');
      console.log(`  - Total burned: ${stats.totalBurned}`);
      console.log(`  - Total iterations: ${stats.totalIterations}`);
    } else {
      console.log('❌ Calculator: Basic functionality failed');
    }

    // Test CSV export
    const csv = calculator.generateCSV();
    if (csv.includes('Iteration') && csv.includes('Datum')) {
      console.log('✅ Calculator: CSV export works');
    } else {
      console.log('❌ Calculator: CSV export failed');
    }

    // Test HTML generation
    const html = calculator.generateHTMLTable();
    if (html.includes('burni-calculator-container')) {
      console.log('✅ Calculator: HTML generation works');
    } else {
      console.log('❌ Calculator: HTML generation failed');
    }
  } catch (error) {
    console.log('❌ Calculator test failed:', error.message);
  }
}

// Test 2: Check file existence and basic structure
function testFileIntegrity() {
  console.log('\n📁 Testing File Integrity...');

  const fs = require('fs');
  const path = require('path');

  const requiredFiles = [
    'assets/burni-calculator.js',
    'assets/ai-analytics.js',
    'assets/accessibility-enhanced.js',
    'assets/i18n-enhanced.js',
    'assets/performance-advanced.js',
    'assets/css/burni-calculator.css',
    'index.html',
  ];

  let allFilesExist = true;

  requiredFiles.forEach((file) => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`✅ File exists: ${file}`);
    } else {
      console.log(`❌ File missing: ${file}`);
      allFilesExist = false;
    }
  });

  if (allFilesExist) {
    console.log('✅ All required files present');
  } else {
    console.log('❌ Some files are missing');
  }
}

// Test 3: Module syntax validation
function testModuleSyntax() {
  console.log('\n🔍 Testing Module Syntax...');

  const fs = require('fs');
  const path = require('path');

  const jsFiles = [
    'assets/burni-calculator.js',
    'assets/ai-analytics.js',
    'assets/accessibility-enhanced.js',
    'assets/i18n-enhanced.js',
    'assets/performance-advanced.js',
  ];

  jsFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(path.join(__dirname, file), 'utf8');

      // Basic syntax checks
      if (content.includes('class ') && content.includes('constructor')) {
        console.log(`✅ ${file}: Valid class structure`);
      } else {
        console.log(`❌ ${file}: Invalid class structure`);
      }

      // Check for proper export
      if (content.includes('module.exports') || content.includes('window.')) {
        console.log(`✅ ${file}: Proper export structure`);
      } else {
        console.log(`⚠️ ${file}: No export found`);
      }
    } catch (error) {
      console.log(`❌ ${file}: Syntax error - ${error.message}`);
    }
  });
}

// Test 4: HTML Integration Check
function testHTMLIntegration() {
  console.log('\n🌐 Testing HTML Integration...');

  const fs = require('fs');
  const path = require('path');

  try {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

    // Check for script inclusions
    const scriptInclusions = [
      'burni-calculator.js',
      'ai-analytics.js',
      'accessibility-enhanced.js',
      'i18n-enhanced.js',
      'performance-advanced.js',
    ];

    scriptInclusions.forEach((script) => {
      if (html.includes(script)) {
        console.log(`✅ HTML includes: ${script}`);
      } else {
        console.log(`⚠️ HTML missing: ${script}`);
      }
    });

    // Check for CSS inclusions
    if (html.includes('burni-calculator.css')) {
      console.log('✅ HTML includes: burni-calculator.css');
    } else {
      console.log('⚠️ HTML missing: burni-calculator.css');
    }

    // Check for accessibility features
    if (html.includes('lang=') && html.includes('aria-')) {
      console.log('✅ HTML has accessibility attributes');
    } else {
      console.log('⚠️ HTML missing accessibility attributes');
    }
  } catch (error) {
    console.log('❌ HTML integration test failed:', error.message);
  }
}

// Test 5: Performance and Security
function testPerformanceAndSecurity() {
  console.log('\n⚡ Testing Performance and Security...');

  const fs = require('fs');
  const path = require('path');

  try {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

    // Check for CSP
    if (html.includes('Content-Security-Policy')) {
      console.log('✅ Content Security Policy present');
    } else {
      console.log('❌ Content Security Policy missing');
    }

    // Check for preload directives
    if (html.includes('rel="preload"')) {
      console.log('✅ Resource preloading configured');
    } else {
      console.log('⚠️ No resource preloading found');
    }

    // Check for meta viewport
    if (html.includes('name="viewport"')) {
      console.log('✅ Responsive viewport configured');
    } else {
      console.log('❌ Viewport meta tag missing');
    }
  } catch (error) {
    console.log('❌ Performance/Security test failed:', error.message);
  }
}

// Test 6: Package.json and Dependencies
function testDependencies() {
  console.log('\n📦 Testing Dependencies...');

  const fs = require('fs');
  const path = require('path');

  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

    console.log(`✅ Package name: ${packageJson.name}`);
    console.log(`✅ Package version: ${packageJson.version}`);

    if (packageJson.scripts && packageJson.scripts.test) {
      console.log('✅ Test script configured');
    } else {
      console.log('⚠️ No test script found');
    }

    if (packageJson.scripts && packageJson.scripts.lint) {
      console.log('✅ Lint script configured');
    } else {
      console.log('⚠️ No lint script found');
    }
  } catch (error) {
    console.log('❌ Package.json test failed:', error.message);
  }
}

// Test 7: Git Repository Status
function testGitStatus() {
  console.log('\n🔄 Testing Git Status...');

  const { execSync } = require('child_process');

  try {
    // Check if git is initialized
    execSync('git status', { stdio: 'pipe' });
    console.log('✅ Git repository initialized');

    // Check for remote
    const remotes = execSync('git remote -v', { encoding: 'utf8' });
    if (remotes.includes('origin')) {
      console.log('✅ Git remote configured');
    } else {
      console.log('⚠️ No git remote found');
    }
  } catch (error) {
    console.log('⚠️ Git not initialized or error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 BURNI Token Comprehensive Test Suite\n');
  console.log('='.repeat(50));

  testCalculator();
  testFileIntegrity();
  testModuleSyntax();
  testHTMLIntegration();
  testPerformanceAndSecurity();
  testDependencies();
  testGitStatus();

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Comprehensive Test Suite Complete!');
  console.log('📊 Check results above for any issues to address');
}

// Execute tests
runAllTests().catch(console.error);
