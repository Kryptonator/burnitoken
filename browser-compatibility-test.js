// browser-compatibility-test.js - Comprehensive browser compatibility testing
const fs = require('fs');
const path = require('path');

class BrowserCompatibilityAuditor {
  constructor() {
    this.score = 0;
    this.totalTests = 0;
    this.passedTests = 0;
    this.results = [];
  }

  test(name, condition, weight = 1) {
    this.totalTests += weight;
    const passed = condition();
    if (passed) {
      this.passedTests += weight;
    }
    
    this.results.push({
      name,
      passed,
      weight,
      message: passed ? '✅ Passed' : '❌ Failed'
    });
    
    return passed;
  }

  checkFileExists(filePath) {
    try {
      return fs.existsSync(path.join(__dirname, filePath));
    } catch (e) {
      return false;
    }
  }

  checkFileContains(filePath, searchString) {
    try {
      const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
      return content.includes(searchString);
    } catch (e) {
      return false;
    }
  }

  checkPolyfillCoverage() {
    const polyfillFile = 'assets/polyfills.js';
    
    this.test('Polyfill file exists', () => this.checkFileExists(polyfillFile), 3);
    
    this.test('Array.prototype polyfills', () => 
      this.checkFileContains(polyfillFile, 'Array.prototype.includes') &&
      this.checkFileContains(polyfillFile, 'Array.prototype.find') &&
      this.checkFileContains(polyfillFile, 'Array.from'), 2);
    
    this.test('Object methods polyfills', () => 
      this.checkFileContains(polyfillFile, 'Object.assign') &&
      this.checkFileContains(polyfillFile, 'Object.keys') &&
      this.checkFileContains(polyfillFile, 'Object.values'), 2);
    
    this.test('Promise polyfill', () => 
      this.checkFileContains(polyfillFile, 'window.Promise') &&
      this.checkFileContains(polyfillFile, 'Promise.resolve') &&
      this.checkFileContains(polyfillFile, 'Promise.all'), 3);
    
    this.test('Fetch API polyfill', () => 
      this.checkFileContains(polyfillFile, 'window.fetch') &&
      this.checkFileContains(polyfillFile, 'XMLHttpRequest'), 3);
    
    this.test('DOM polyfills', () => 
      this.checkFileContains(polyfillFile, 'addEventListener') &&
      this.checkFileContains(polyfillFile, 'querySelector') &&
      this.checkFileContains(polyfillFile, 'classList'), 2);
    
    this.test('IntersectionObserver polyfill', () => 
      this.checkFileContains(polyfillFile, 'IntersectionObserver') &&
      this.checkFileContains(polyfillFile, 'observe') &&
      this.checkFileContains(polyfillFile, 'unobserve'), 2);
  }

  checkCSSCompatibility() {
    const compatFile = 'assets/css/styles-compat.css';
    
    this.test('CSS compatibility file exists', () => this.checkFileExists(compatFile), 3);
    
    this.test('Flexbox fallbacks', () => 
      this.checkFileContains(compatFile, '-webkit-flex') &&
      this.checkFileContains(compatFile, '-ms-flexbox') &&
      this.checkFileContains(compatFile, '-webkit-box'), 3);
    
    this.test('Grid fallbacks', () => 
      this.checkFileContains(compatFile, '-ms-grid') &&
      this.checkFileContains(compatFile, 'grid-template-columns') &&
      this.checkFileContains(compatFile, 'float: left'), 2);
    
    this.test('Transform fallbacks', () => 
      this.checkFileContains(compatFile, '-webkit-transform') &&
      this.checkFileContains(compatFile, '-moz-transform') &&
      this.checkFileContains(compatFile, '-ms-transform'), 2);
    
    this.test('Transition fallbacks', () => 
      this.checkFileContains(compatFile, '-webkit-transition') &&
      this.checkFileContains(compatFile, '-moz-transition') &&
      this.checkFileContains(compatFile, '-ms-transition'), 2);
    
    this.test('Border radius fallbacks', () => 
      this.checkFileContains(compatFile, '-webkit-border-radius') &&
      this.checkFileContains(compatFile, '-moz-border-radius'), 1);
    
    this.test('Box shadow fallbacks', () => 
      this.checkFileContains(compatFile, '-webkit-box-shadow') &&
      this.checkFileContains(compatFile, '-moz-box-shadow'), 1);
    
    this.test('Gradient fallbacks', () => 
      this.checkFileContains(compatFile, '-webkit-linear-gradient') &&
      this.checkFileContains(compatFile, '-moz-linear-gradient'), 1);
    
    this.test('CSS custom properties fallbacks', () => 
      this.checkFileContains(compatFile, 'var(--primary-color, #f97316)') &&
      this.checkFileContains(compatFile, ':root'), 2);
  }

  checkHTMLCompatibility() {
    const htmlFile = 'index.html';
    
    this.test('HTML5 doctype', () => 
      this.checkFileContains(htmlFile, '<!doctype html>'), 1);
    
    this.test('Viewport meta tag', () => 
      this.checkFileContains(htmlFile, 'name="viewport"'), 2);
    
    this.test('IE compatibility meta', () => 
      this.checkFileContains(htmlFile, 'X-UA-Compatible'), 2);
    
    this.test('Charset declaration', () => 
      this.checkFileContains(htmlFile, 'charset="UTF-8"'), 1);
    
    this.test('Polyfill script inclusion', () => 
      this.checkFileContains(htmlFile, 'polyfills.js'), 3);
    
    this.test('CSS compatibility inclusion', () => 
      this.checkFileContains(htmlFile, 'styles-compat.css'), 3);
    
    this.test('Fallback font stacks', () => 
      this.checkFileContains(htmlFile, '-apple-system') &&
      this.checkFileContains(htmlFile, 'BlinkMacSystemFont'), 1);
    
    this.test('Preload critical resources', () => 
      this.checkFileContains(htmlFile, 'rel="preload"') &&
      this.checkFileContains(htmlFile, 'as="script"'), 1);
  }

  checkJavaScriptCompatibility() {
    const securityFile = 'assets/security.js';
    
    this.test('ES5 compatible code structure', () => 
      this.checkFileContains(securityFile, 'function()') &&
      !this.checkFileContains(securityFile, '=>'), 2);
    
    this.test('Feature detection', () => 
      this.checkFileContains(securityFile, "'IntersectionObserver' in window") &&
      this.checkFileContains(securityFile, "'serviceWorker' in navigator"), 2);
    
    this.test('Graceful degradation', () => 
      this.checkFileContains(securityFile, 'console.log') &&
      this.checkFileContains(securityFile, 'try') &&
      this.checkFileContains(securityFile, 'catch'), 2);
  }

  checkServiceWorkerCompatibility() {
    const swFile = 'sw.js';
    
    this.test('Service Worker exists', () => this.checkFileExists(swFile), 2);
    
    this.test('SW feature detection', () => 
      this.checkFileContains('index.html', "'serviceWorker' in navigator"), 2);
    
    this.test('SW error handling', () => 
      this.checkFileContains(swFile, 'catch') &&
      this.checkFileContains(swFile, 'console.error'), 1);
    
    this.test('SW fallback strategies', () => 
      this.checkFileContains(swFile, 'cache.match') &&
      this.checkFileContains(swFile, 'fetch'), 2);
  }

  checkAccessibilityCompatibility() {
    const htmlFile = 'index.html';
    
    this.test('Language attribute', () => 
      this.checkFileContains(htmlFile, 'lang="en"'), 1);
    
    this.test('Alt attributes for images', () => 
      this.checkFileContains(htmlFile, 'alt='), 1);
    
    this.test('ARIA support', () => 
      this.checkFileContains(htmlFile, 'aria-') ||
      this.checkFileContains(htmlFile, 'role='), 1);
    
    this.test('Skip navigation', () => 
      this.checkFileContains(htmlFile, 'skip') ||
      this.checkFileContains(htmlFile, 'sr-only'), 1);
  }

  checkPerformanceCompatibility() {
    const htmlFile = 'index.html';
    
    this.test('Resource hints', () => 
      this.checkFileContains(htmlFile, 'rel="preconnect"') &&
      this.checkFileContains(htmlFile, 'rel="dns-prefetch"'), 2);
    
    this.test('Critical CSS inline', () => 
      this.checkFileContains(htmlFile, 'critical.css'), 1);
    
    this.test('Script defer/async', () => 
      this.checkFileContains(htmlFile, 'defer') ||
      this.checkFileContains(htmlFile, 'async'), 1);
    
    this.test('Image optimization', () => 
      this.checkFileContains(htmlFile, '.webp') &&
      this.checkFileContains(htmlFile, 'loading="lazy"'), 2);
  }

  checkLegacyBrowserSupport() {
    this.test('IE11 support indicators', () => 
      this.checkFileContains('assets/css/styles-compat.css', '-ms-') &&
      this.checkFileContains('assets/polyfills.js', 'Array.from'), 3);
    
    this.test('Old Android support', () => 
      this.checkFileContains('assets/css/styles-compat.css', '-webkit-') &&
      this.checkFileContains('assets/polyfills.js', 'touchstart'), 2);
    
    this.test('iOS Safari support', () => 
      this.checkFileContains('assets/css/styles-compat.css', '-webkit-overflow-scrolling') &&
      this.checkFileContains('assets/css/styles-compat.css', '-webkit-appearance'), 2);
  }

  runAllTests() {
    console.log('🌐 Starting Browser Compatibility Audit...\n');
    
    console.log('📦 Checking Polyfill Coverage...');
    this.checkPolyfillCoverage();
    
    console.log('\n🎨 Checking CSS Compatibility...');
    this.checkCSSCompatibility();
    
    console.log('\n📄 Checking HTML Compatibility...');
    this.checkHTMLCompatibility();
    
    console.log('\n⚙️ Checking JavaScript Compatibility...');
    this.checkJavaScriptCompatibility();
    
    console.log('\n🔧 Checking Service Worker Compatibility...');
    this.checkServiceWorkerCompatibility();
    
    console.log('\n♿ Checking Accessibility Compatibility...');
    this.checkAccessibilityCompatibility();
    
    console.log('\n⚡ Checking Performance Compatibility...');
    this.checkPerformanceCompatibility();
    
    console.log('\n🕰️ Checking Legacy Browser Support...');
    this.checkLegacyBrowserSupport();
    
    this.calculateScore();
    this.generateReport();
  }

  calculateScore() {
    this.score = Math.round((this.passedTests / this.totalTests) * 100);
  }

  generateReport() {
    console.log('\n================================================================================');
    console.log('🎯 BROWSER COMPATIBILITY AUDIT REPORT');
    console.log('================================================================================');
    console.log(`📊 Overall Compatibility Score: ${this.score}%`);
    console.log(`✅ Passed Tests: ${this.passedTests}/${this.totalTests}`);
    console.log('');
    
    // Group results by category
    const categories = {
      '📦 Polyfills': this.results.slice(0, 6),
      '🎨 CSS Compatibility': this.results.slice(6, 16),
      '📄 HTML Compatibility': this.results.slice(16, 24),
      '⚙️ JavaScript': this.results.slice(24, 27),
      '🔧 Service Worker': this.results.slice(27, 31),
      '♿ Accessibility': this.results.slice(31, 35),
      '⚡ Performance': this.results.slice(35, 39),
      '🕰️ Legacy Support': this.results.slice(39)
    };
    
    Object.entries(categories).forEach(([category, tests]) => {
      console.log(`${category}:`);
      tests.forEach(test => {
        console.log(`  ${test.message} ${test.name} (weight: ${test.weight})`);
      });
      console.log('');
    });
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length === 0) {
      console.log('✅ Excellent! All compatibility tests passed.');
    } else {
      failedTests.forEach(test => {
        console.log(`❌ Fix: ${test.name}`);
      });
    }
    
    console.log('\n📄 Detailed report saved to: browser-compatibility-report.json');
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      score: this.score,
      passedTests: this.passedTests,
      totalTests: this.totalTests,
      results: this.results,
      summary: {
        polyfillCoverage: Math.round((this.results.slice(0, 6).filter(r => r.passed).length / 6) * 100),
        cssCompatibility: Math.round((this.results.slice(6, 16).filter(r => r.passed).length / 10) * 100),
        htmlCompatibility: Math.round((this.results.slice(16, 24).filter(r => r.passed).length / 8) * 100),
        javascriptCompatibility: Math.round((this.results.slice(24, 27).filter(r => r.passed).length / 3) * 100),
        serviceWorkerCompatibility: Math.round((this.results.slice(27, 31).filter(r => r.passed).length / 4) * 100),
        accessibilityCompatibility: Math.round((this.results.slice(31, 35).filter(r => r.passed).length / 4) * 100),
        performanceCompatibility: Math.round((this.results.slice(35, 39).filter(r => r.passed).length / 4) * 100),
        legacySupport: Math.round((this.results.slice(39).filter(r => r.passed).length / this.results.slice(39).length) * 100)
      }
    };
    
    fs.writeFileSync('browser-compatibility-report.json', JSON.stringify(report, null, 2));
    console.log('================================================================================');
  }
}

// Run the audit
const auditor = new BrowserCompatibilityAuditor();
auditor.runAllTests();
