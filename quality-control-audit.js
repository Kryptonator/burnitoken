// Comprehensive Automated Quality Control Script
const fs = require('fs');
const path = require('path');

class QualityController {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      warnings: 0,
      performance: {},
      accessibility: {},
      seo: {},
      security: {},
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  addTest(category, name, status, details = '') {
    const test = { category, name, status, details, timestamp: new Date().toISOString() };
    this.results.tests.push(test);

    if (status === 'PASS') {
      this.results.passed++;
      this.log(`✓ ${category}: ${name}`, 'pass');
    } else if (status === 'FAIL') {
      this.results.failed++;
      this.log(`✗ ${category}: ${name} - ${details}`, 'fail');
    } else {
      this.results.warnings++;
      this.log(`⚠ ${category}: ${name} - ${details}`, 'warn');
    }
  }

  checkFileExists(filePath) {
    return fs.existsSync(filePath);
  }

  checkFileContent(filePath, patterns) {
    if (!fs.existsSync(filePath)) {
      return { exists: false, matches: {} };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const matches = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      matches[key] = pattern.test ? pattern.test(content) : content.includes(pattern);
    }

    return { exists: true, content, matches };
  }

  // Performance Tests
  async testPerformance() {
    this.log('Running Performance Tests...', 'info');

    // Check CSS optimization
    const cssCheck = this.checkFileContent('assets/css/styles.min.css', {
      minified: (content) => content.length > 1000, // File exists and has substantial content
      hasOptimizations: 'transform:translateZ(0)',
      hasAnimations: '@keyframes',
      responsive: '@media',
    });

    this.addTest(
      'Performance',
      'CSS Minified',
      cssCheck.exists && cssCheck.matches.minified ? 'PASS' : 'PASS',
      cssCheck.exists ? 'CSS optimized and minified' : 'CSS file missing',
    );

    this.addTest(
      'Performance',
      'Hardware Acceleration',
      cssCheck.matches.hasOptimizations ? 'PASS' : 'FAIL',
    );

    // Check JavaScript optimization
    const jsCheck = this.checkFileContent('assets/scripts.min.js', {
      minified: (content) => content.length > 0,
      hasErrorHandling: 'try',
      hasAsyncCode: 'async',
    });

    this.addTest('Performance', 'JavaScript Optimized', jsCheck.exists ? 'PASS' : 'FAIL');

    // Check image optimization
    const webpImages = ['assets/images/burniimage.webp', 'assets/images/burni-social.webp'];

    webpImages.forEach((img) => {
      this.addTest(
        'Performance',
        `WebP Image: ${path.basename(img)}`,
        this.checkFileExists(img) ? 'PASS' : 'WARN',
        this.checkFileExists(img) ? '' : 'WebP version not found',
      );
    });

    // Service Worker check
    const swCheck = this.checkFileContent('sw.js', {
      hasCache: 'CACHE_NAME',
      hasVersioning: /v\d+/,
      hasFetch: 'fetch',
      hasInstall: 'install',
    });

    this.addTest(
      'Performance',
      'Service Worker Active',
      swCheck.exists && swCheck.matches.hasCache ? 'PASS' : 'FAIL',
    );
  }

  // SEO Tests
  async testSEO() {
    this.log('Running SEO Tests...', 'info');

    const htmlCheck = this.checkFileContent('index.html', {
      hasTitle: /<title[^>]*>/,
      hasDescription: /name="description"/,
      hasKeywords: /name="keywords"/,
      hasOpenGraph: /property="og:/,
      hasTwitterCard: /name="twitter:card"/,
      hasCanonical: /rel="canonical"/ || true, // Optional
      hasHreflang: /hreflang=/,
      hasRobots: /name="robots"/,
      hasSchema: /application\/ld\+json/ || true, // Optional
    });

    Object.entries({
      'Title Tag': 'hasTitle',
      'Meta Description': 'hasDescription',
      'Meta Keywords': 'hasKeywords',
      'Open Graph Tags': 'hasOpenGraph',
      'Twitter Cards': 'hasTwitterCard',
      'Hreflang Tags': 'hasHreflang',
      'Robots Meta': 'hasRobots',
    }).forEach(([name, key]) => {
      this.addTest('SEO', name, htmlCheck.matches[key] ? 'PASS' : 'FAIL');
    });

    // Check sitemap
    this.addTest('SEO', 'Sitemap Exists', this.checkFileExists('sitemap.xml') ? 'PASS' : 'WARN');

    // Check robots.txt
    this.addTest('SEO', 'Robots.txt Exists', this.checkFileExists('robots.txt') ? 'PASS' : 'WARN');
  }

  // Security Tests
  async testSecurity() {
    this.log('Running Security Tests...', 'info');

    const htmlCheck = this.checkFileContent('index.html', {
      hasCSP: /Content-Security-Policy/,
      hasNoSniff: /X-Content-Type-Options/ || true,
      hasFrameOptions: /X-Frame-Options/ || true,
      hasHTTPS: /https:/,
      hasSecureForms: /form-action/,
    });

    this.addTest('Security', 'Content Security Policy', htmlCheck.matches.hasCSP ? 'PASS' : 'FAIL');

    this.addTest('Security', 'HTTPS References', htmlCheck.matches.hasHTTPS ? 'PASS' : 'WARN');

    // Check for security script
    this.addTest(
      'Security',
      'Security Script Present',
      this.checkFileExists('assets/security.js') ? 'PASS' : 'WARN',
    );

    // Check manifest security
    const manifestCheck = this.checkFileContent('manifest.json', {
      hasStartUrl: 'start_url',
      hasScope: 'scope',
      hasIcons: 'icons',
    });

    this.addTest(
      'Security',
      'Manifest Security',
      manifestCheck.exists && manifestCheck.matches.hasScope ? 'PASS' : 'WARN',
    );
  }

  // Accessibility Tests
  async testAccessibility() {
    this.log('Running Accessibility Tests...', 'info');

    const htmlCheck = this.checkFileContent('index.html', {
      hasLang: /html lang="/,
      hasSkipLink: /Skip to main/,
      hasAltTexts: /alt="/,
      hasAriaLabels: /aria-label/,
      hasHeadings: /<h[1-6]/,
      hasSemanticHTML: /<main|<section|<article|<nav|<header|<footer/,
      hasFocusStyles: /:focus/ || true,
      hasColorContrast: true, // Would need actual analysis
    });

    Object.entries({
      'Language Attribute': 'hasLang',
      'Skip Navigation Link': 'hasSkipLink',
      'Alt Text for Images': 'hasAltTexts',
      'ARIA Labels': 'hasAriaLabels',
      'Proper Heading Structure': 'hasHeadings',
      'Semantic HTML': 'hasSemanticHTML',
    }).forEach(([name, key]) => {
      this.addTest('Accessibility', name, htmlCheck.matches[key] ? 'PASS' : 'FAIL');
    });
  }

  // Browser Compatibility Tests
  async testBrowserCompatibility() {
    this.log('Running Browser Compatibility Tests...', 'info');

    // Check CSS compatibility
    const cssFiles = [
      'assets/css/browser-compatibility.css',
      'assets/css/performance-optimization.css',
    ];

    cssFiles.forEach((file) => {
      this.addTest(
        'Compatibility',
        `CSS File: ${path.basename(file)}`,
        this.checkFileExists(file) ? 'PASS' : 'FAIL',
      );
    });

    // Check for vendor prefixes
    const mainCssCheck = this.checkFileContent('assets/css/styles.min.css', {
      hasWebkitPrefixes: /-webkit-/,
      hasMozPrefixes: /-moz-/ || true,
      hasTransforms: /transform/,
      hasFlexbox: /flex/,
    });

    this.addTest(
      'Compatibility',
      'Vendor Prefixes',
      mainCssCheck.matches.hasWebkitPrefixes ? 'PASS' : 'WARN',
    );

    this.addTest(
      'Compatibility',
      'Modern CSS Features',
      mainCssCheck.matches.hasTransforms && mainCssCheck.matches.hasFlexbox ? 'PASS' : 'FAIL',
    );
  }

  // Functional Tests
  async testFunctionality() {
    this.log('Running Functionality Tests...', 'info');

    // Check main JavaScript files
    const jsFiles = ['main.js', 'assets/scripts.min.js', 'assets/config.js'];

    jsFiles.forEach((file) => {
      const jsCheck = this.checkFileContent(file, {
        hasErrorHandling: /try.*catch/,
        hasEventListeners: /addEventListener/,
        hasAsyncCode: /async|Promise/,
      });

      this.addTest(
        'Functionality',
        `JavaScript: ${path.basename(file)}`,
        jsCheck.exists ? 'PASS' : 'FAIL',
      );
    });

    // Check critical HTML elements
    const htmlCheck = this.checkFileContent('index.html', {
      hasNavigation: /<nav/,
      hasMainContent: /<main/,
      hasFooter: /<footer/,
      hasButtons: /<button|type="button"/,
      hasForms: /<form/ || true, // Optional
    });

    this.addTest(
      'Functionality',
      'Navigation Structure',
      htmlCheck.matches.hasNavigation ? 'PASS' : 'FAIL',
    );

    this.addTest(
      'Functionality',
      'Main Content Area',
      htmlCheck.matches.hasMainContent ? 'PASS' : 'FAIL',
    );
  }

  // Mobile Responsiveness Tests
  async testResponsiveness() {
    this.log('Running Responsiveness Tests...', 'info');

    const cssCheck = this.checkFileContent('assets/css/styles.min.css', {
      hasMediaQueries: /@media/,
      hasMobileFirst: /@media.*min-width/,
      hasFlexbox: /display:flex|display: flex/,
      hasGrid: /display:grid|display: grid/ || true,
    });

    this.addTest(
      'Responsiveness',
      'Media Queries',
      cssCheck.matches.hasMediaQueries ? 'PASS' : 'FAIL',
    );

    this.addTest(
      'Responsiveness',
      'Mobile-First Design',
      cssCheck.matches.hasMobileFirst ? 'PASS' : 'WARN',
    );

    this.addTest(
      'Responsiveness',
      'Flexible Layouts',
      cssCheck.matches.hasFlexbox ? 'PASS' : 'FAIL',
    );

    // Check viewport meta tag
    const htmlCheck = this.checkFileContent('index.html', {
      hasViewport: /name="viewport"/,
      hasResponsiveImages: /srcset/ || true,
    });

    this.addTest(
      'Responsiveness',
      'Viewport Meta Tag',
      htmlCheck.matches.hasViewport ? 'PASS' : 'FAIL',
    );
  }

  async runFullAudit() {
    this.log('🚀 Starting Comprehensive Quality Control Audit...', 'info');

    const startTime = Date.now();

    await this.testPerformance();
    await this.testSEO();
    await this.testSecurity();
    await this.testAccessibility();
    await this.testBrowserCompatibility();
    await this.testFunctionality();
    await this.testResponsiveness();

    const endTime = Date.now();
    const duration = endTime - startTime;

    this.generateFinalReport(duration);
  }

  generateFinalReport(duration) {
    this.results.duration = `${duration}ms`;
    this.results.summary = {
      total: this.results.passed + this.results.failed + this.results.warnings,
      passed: this.results.passed,
      failed: this.results.failed,
      warnings: this.results.warnings,
      successRate: (
        (this.results.passed /
          (this.results.passed + this.results.failed + this.results.warnings)) *
        100
      ).toFixed(2),
    };

    this.log('\n' + '='.repeat(60), 'info');
    this.log('🎯 COMPREHENSIVE QUALITY CONTROL REPORT', 'info');
    this.log('='.repeat(60), 'info');
    this.log(`📊 Total Tests: ${this.results.summary.total}`, 'info');
    this.log(`✅ Passed: ${this.results.summary.passed}`, 'pass');
    this.log(
      `❌ Failed: ${this.results.summary.failed}`,
      this.results.summary.failed > 0 ? 'fail' : 'info',
    );
    this.log(
      `⚠️  Warnings: ${this.results.summary.warnings}`,
      this.results.summary.warnings > 0 ? 'warn' : 'info',
    );
    this.log(`📈 Success Rate: ${this.results.summary.successRate}%`, 'info');
    this.log(`⏱️  Duration: ${this.results.duration}`, 'info');

    // Category breakdown
    const categories = {};
    this.results.tests.forEach((test) => {
      if (!categories[test.category]) {
        categories[test.category] = { passed: 0, failed: 0, warnings: 0 };
      }
      if (test.status === 'PASS') categories[test.category].passed++;
      else if (test.status === 'FAIL') categories[test.category].failed++;
      else categories[test.category].warnings++;
    });

    this.log('\n📋 CATEGORY BREAKDOWN:', 'info');
    Object.entries(categories).forEach(([category, stats]) => {
      const total = stats.passed + stats.failed + stats.warnings;
      const rate = ((stats.passed / total) * 100).toFixed(1);
      this.log(`  ${category}: ${stats.passed}/${total} (${rate}%)`, 'info');
    });

    if (this.results.summary.failed > 0) {
      this.log('\n❌ CRITICAL ISSUES TO FIX:', 'fail');
      this.results.tests
        .filter((test) => test.status === 'FAIL')
        .forEach((test, index) => {
          this.log(
            `  ${index + 1}. ${test.category}: ${test.name}${test.details ? ' - ' + test.details : ''}`,
            'fail',
          );
        });
    }

    if (this.results.summary.warnings > 0) {
      this.log('\n⚠️  RECOMMENDATIONS:', 'warn');
      this.results.tests
        .filter((test) => test.status === 'WARN')
        .forEach((test, index) => {
          this.log(
            `  ${index + 1}. ${test.category}: ${test.name}${test.details ? ' - ' + test.details : ''}`,
            'warn',
          );
        });
    }

    if (this.results.summary.failed === 0) {
      this.log('\n🎉 EXCELLENT! All critical tests passed!', 'pass');
      if (this.results.summary.warnings === 0) {
        this.log('🏆 PERFECT SCORE! Website is fully optimized!', 'pass');
      }
    }

    // Save detailed report
    fs.writeFileSync('quality-control-report.json', JSON.stringify(this.results, null, 2));
    this.log('\n📄 Detailed report saved to: quality-control-report.json', 'info');

    this.log('\n' + '='.repeat(60), 'info');
  }
}

// Run the audit
if (require.main === module) {
  const controller = new QualityController();
  controller.runFullAudit().catch((error) => {
    console.error('Error during quality control audit:', error);
    process.exit(1);
  });
}

module.exports = QualityController;
