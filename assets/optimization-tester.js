/**
 * BurniToken Website Optimization Test Suite
 * Tests performance, accessibility, and cross-browser compatibility
 */

class BurniOptimizationTester {
  constructor() {
    this.results = {
      performance: {},
      accessibility: {},
      compatibility: {},
      seo: {},
      overall: {},
    };

    this.startTime = performance.now();
    this.isInitialized = false;
  }

  async runAllTests() {
    console.log('🧪 Starting BurniToken Optimization Tests...');

    // Run tests in sequence to avoid conflicts
    await this.testPerformance();
    await this.testAccessibility();
    await this.testCompatibility();
    await this.testSEO();
    await this.testCoreWebVitals();

    this.generateReport();

    console.log('✅ All tests completed!');
    return this.results;
  }

  async testPerformance() {
    console.log('🚀 Testing Performance...');

    const performanceStart = performance.now();

    // Test 1: Page Load Time
    this.results.performance.loadTime = this.startTime;

    // Test 2: Resource Loading
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter((resource) => resource.duration > 1000);
    this.results.performance.slowResources = slowResources.length;

    // Test 3: Critical CSS
    const criticalStylesInline = document.querySelector('style')?.textContent.length || 0;
    this.results.performance.criticalCSSSize = criticalStylesInline;

    // Test 4: Image Optimization
    const images = document.querySelectorAll('img');
    const webpImages = Array.from(images).filter((img) => img.src.includes('.webp')).length;
    this.results.performance.webpOptimization = (webpImages / images.length) * 100;

    // Test 5: JavaScript Loading
    const scripts = document.querySelectorAll('script[defer]');
    this.results.performance.deferredScripts = scripts.length;

    // Test 6: Preloading
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    this.results.performance.preloadedResources = preloadLinks.length;

    const performanceEnd = performance.now();
    this.results.performance.testDuration = performanceEnd - performanceStart;

    console.log('✅ Performance tests completed');
  }

  async testAccessibility() {
    console.log('♿ Testing Accessibility...');

    const accessibilityStart = performance.now();

    // Test 1: Alt Text
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter((img) => img.alt).length;
    this.results.accessibility.altTextCoverage = (imagesWithAlt / images.length) * 100;

    // Test 2: Form Labels
    const inputs = document.querySelectorAll('input, textarea, select');
    const labeledInputs = Array.from(inputs).filter((input) => {
      return (
        input.labels?.length > 0 ||
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby')
      );
    }).length;
    this.results.accessibility.labeledInputs = (labeledInputs / inputs.length) * 100;

    // Test 3: Heading Structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const properHeadingOrder = this.checkHeadingOrder(headings);
    this.results.accessibility.headingStructure = properHeadingOrder;

    // Test 4: ARIA Attributes
    const ariaElements = document.querySelectorAll(
      '[aria-label], [aria-labelledby], [aria-describedby], [role]',
    );
    this.results.accessibility.ariaAttributes = ariaElements.length;

    // Test 5: Keyboard Navigation
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]',
    );
    this.results.accessibility.focusableElements = focusableElements.length;

    // Test 6: Color Contrast (simplified)
    const contrastIssues = await this.checkColorContrast();
    this.results.accessibility.contrastIssues = contrastIssues;

    // Test 7: Skip Links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    this.results.accessibility.skipLinks = skipLinks.length;

    const accessibilityEnd = performance.now();
    this.results.accessibility.testDuration = accessibilityEnd - accessibilityStart;

    console.log('✅ Accessibility tests completed');
  }

  async testCompatibility() {
    console.log('🌐 Testing Cross-Browser Compatibility...');

    const compatibilityStart = performance.now();

    // Test 1: Browser Detection
    const browserInfo = this.detectBrowser();
    this.results.compatibility.browser = browserInfo;

    // Test 2: Feature Support
    const features = {
      promises: typeof Promise !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      intersectionObserver: 'IntersectionObserver' in window,
      customElements: 'customElements' in window,
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: this.testLocalStorage(),
      flexbox: this.testFlexbox(),
      grid: this.testGrid(),
    };

    const supportedFeatures = Object.values(features).filter(Boolean).length;
    this.results.compatibility.featureSupport =
      (supportedFeatures / Object.keys(features).length) * 100;
    this.results.compatibility.features = features;

    // Test 3: Polyfill Loading
    const polyfillsLoaded = this.checkPolyfillsLoaded();
    this.results.compatibility.polyfillsLoaded = polyfillsLoaded;

    // Test 4: CSS Vendor Prefixes
    const vendorPrefixes = this.checkVendorPrefixes();
    this.results.compatibility.vendorPrefixes = vendorPrefixes;

    const compatibilityEnd = performance.now();
    this.results.compatibility.testDuration = compatibilityEnd - compatibilityStart;

    console.log('✅ Compatibility tests completed');
  }

  async testSEO() {
    console.log('🔍 Testing SEO Optimization...');

    const seoStart = performance.now();

    // Test 1: Meta Tags
    const metaTags = {
      title: !!document.title,
      description: !!document.querySelector('meta[name="description"]'),
      keywords: !!document.querySelector('meta[name="keywords"]'),
      viewport: !!document.querySelector('meta[name="viewport"]'),
      canonical: !!document.querySelector('link[rel="canonical"]'),
    };

    const metaScore = Object.values(metaTags).filter(Boolean).length;
    this.results.seo.metaTags = (metaScore / Object.keys(metaTags).length) * 100;

    // Test 2: Open Graph
    const ogTags = document.querySelectorAll('meta[property^="og:"]');
    this.results.seo.openGraphTags = ogTags.length;

    // Test 3: Twitter Cards
    const twitterTags = document.querySelectorAll('meta[name^="twitter:"]');
    this.results.seo.twitterCards = twitterTags.length;

    // Test 4: Structured Data
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    this.results.seo.structuredData = structuredData.length;

    // Test 5: Heading Tags
    const h1Tags = document.querySelectorAll('h1');
    this.results.seo.h1Count = h1Tags.length;
    this.results.seo.properH1 = h1Tags.length === 1;

    // Test 6: Image Alt Text for SEO
    const images = document.querySelectorAll('img');
    const seoFriendlyImages = Array.from(images).filter(
      (img) => img.alt && img.alt.length > 5 && img.alt.length < 125,
    ).length;
    this.results.seo.seoFriendlyImages = (seoFriendlyImages / images.length) * 100;

    const seoEnd = performance.now();
    this.results.seo.testDuration = seoEnd - seoStart;

    console.log('✅ SEO tests completed');
  }

  async testCoreWebVitals() {
    console.log('📊 Testing Core Web Vitals...');

    const vitalsStart = performance.now();

    // Test 1: Largest Contentful Paint (LCP)
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.results.performance.LCP = Math.round(lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      this.results.performance.LCP = 'Not supported';
    }

    // Test 2: First Input Delay (FID) - Can't test synthetically
    this.results.performance.FID = 'Requires user interaction';

    // Test 3: Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.results.performance.CLS = Math.round(clsValue * 1000) / 1000;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      this.results.performance.CLS = 'Not supported';
    }

    // Test 4: Time to First Byte (TTFB)
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.results.performance.TTFB = Math.round(
        navigation.responseStart - navigation.requestStart,
      );
    }

    const vitalsEnd = performance.now();
    this.results.performance.vitalsDuration = vitalsEnd - vitalsStart;

    console.log('✅ Core Web Vitals tests completed');
  }

  checkHeadingOrder(headings) {
    let previousLevel = 0;
    let isValid = true;

    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        isValid = false;
        break;
      }
      previousLevel = level;
    }

    return isValid;
  }

  async checkColorContrast() {
    // Simplified contrast check - in production, use proper color contrast algorithms
    const elements = document.querySelectorAll('*');
    let issues = 0;

    for (let i = 0; i < Math.min(elements.length, 100); i++) {
      const element = elements[i];
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;

      if (color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // Simplified check - would need proper contrast calculation
        if (color === backgroundColor) {
          issues++;
        }
      }
    }

    return issues;
  }

  detectBrowser() {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return { name: 'Chrome', version: userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown' };
    } else if (userAgent.includes('Firefox')) {
      return { name: 'Firefox', version: userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown' };
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return { name: 'Safari', version: userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown' };
    } else if (userAgent.includes('Edg')) {
      return { name: 'Edge', version: userAgent.match(/Edg\/(\d+)/)?.[1] || 'unknown' };
    } else {
      return { name: 'Unknown', version: 'unknown' };
    }
  }

  testLocalStorage() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  testFlexbox() {
    const element = document.createElement('div');
    element.style.display = 'flex';
    return element.style.display === 'flex';
  }

  testGrid() {
    const element = document.createElement('div');
    element.style.display = 'grid';
    return element.style.display === 'grid';
  }

  checkPolyfillsLoaded() {
    const polyfills = [];

    if (typeof Promise !== 'undefined') polyfills.push('Promise');
    if (typeof fetch !== 'undefined') polyfills.push('fetch');
    if ('IntersectionObserver' in window) polyfills.push('IntersectionObserver');
    if (Array.from) polyfills.push('Array.from');
    if (Object.assign) polyfills.push('Object.assign');

    return polyfills;
  }

  checkVendorPrefixes() {
    const prefixes = [];
    const testElement = document.createElement('div');

    // Test common vendor prefixes
    const properties = ['transform', 'transition', 'animation', 'backdrop-filter'];

    properties.forEach((prop) => {
      if (testElement.style[prop] !== undefined) {
        prefixes.push(prop);
      }
      if (testElement.style['-webkit-' + prop] !== undefined) {
        prefixes.push('-webkit-' + prop);
      }
      if (testElement.style['-moz-' + prop] !== undefined) {
        prefixes.push('-moz-' + prop);
      }
      if (testElement.style['-ms-' + prop] !== undefined) {
        prefixes.push('-ms-' + prop);
      }
    });

    return prefixes;
  }

  generateReport() {
    const totalTests = Object.keys(this.results).length;
    const endTime = performance.now();

    // Calculate overall score
    const scores = {
      performance: this.calculatePerformanceScore(),
      accessibility: this.calculateAccessibilityScore(),
      compatibility: this.calculateCompatibilityScore(),
      seo: this.calculateSEOScore(),
    };

    const overallScore =
      Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    this.results.overall = {
      score: Math.round(overallScore),
      breakdown: scores,
      totalTestTime: endTime - this.startTime,
      timestamp: new Date().toISOString(),
    };

    // Display results
    console.log('📊 BurniToken Optimization Test Results:');
    console.log('==========================================');
    console.log(`Overall Score: ${this.results.overall.score}/100`);
    console.log(`Performance: ${scores.performance}/100`);
    console.log(`Accessibility: ${scores.accessibility}/100`);
    console.log(`Compatibility: ${scores.compatibility}/100`);
    console.log(`SEO: ${scores.seo}/100`);
    console.log(`Total Test Time: ${Math.round(this.results.overall.totalTestTime)}ms`);
    console.log('==========================================');

    // Store results globally for debugging
    window.BurniTestResults = this.results;
  }

  calculatePerformanceScore() {
    let score = 0;

    // LCP score (25 points)
    if (this.results.performance.LCP <= 2500) score += 25;
    else if (this.results.performance.LCP <= 4000) score += 15;

    // CLS score (25 points)
    if (this.results.performance.CLS <= 0.1) score += 25;
    else if (this.results.performance.CLS <= 0.25) score += 15;

    // WebP optimization (20 points)
    if (this.results.performance.webpOptimization >= 80) score += 20;
    else if (this.results.performance.webpOptimization >= 50) score += 10;

    // Deferred scripts (15 points)
    if (this.results.performance.deferredScripts >= 5) score += 15;

    // Preloaded resources (10 points)
    if (this.results.performance.preloadedResources >= 3) score += 10;

    // Slow resources (5 points)
    if (this.results.performance.slowResources === 0) score += 5;

    return Math.min(score, 100);
  }

  calculateAccessibilityScore() {
    let score = 0;

    // Alt text coverage (25 points)
    if (this.results.accessibility.altTextCoverage >= 95) score += 25;
    else if (this.results.accessibility.altTextCoverage >= 80) score += 15;

    // Form labels (25 points)
    if (this.results.accessibility.labeledInputs >= 95) score += 25;
    else if (this.results.accessibility.labeledInputs >= 80) score += 15;

    // Heading structure (20 points)
    if (this.results.accessibility.headingStructure) score += 20;

    // ARIA attributes (15 points)
    if (this.results.accessibility.ariaAttributes >= 10) score += 15;
    else if (this.results.accessibility.ariaAttributes >= 5) score += 10;

    // Focusable elements (10 points)
    if (this.results.accessibility.focusableElements >= 20) score += 10;

    // Color contrast (5 points)
    if (this.results.accessibility.contrastIssues === 0) score += 5;

    return Math.min(score, 100);
  }

  calculateCompatibilityScore() {
    let score = 0;

    // Feature support (50 points)
    if (this.results.compatibility.featureSupport >= 90) score += 50;
    else if (this.results.compatibility.featureSupport >= 70) score += 30;
    else if (this.results.compatibility.featureSupport >= 50) score += 15;

    // Polyfills loaded (25 points)
    if (this.results.compatibility.polyfillsLoaded.length >= 3) score += 25;
    else if (this.results.compatibility.polyfillsLoaded.length >= 1) score += 15;

    // Vendor prefixes (25 points)
    if (this.results.compatibility.vendorPrefixes.length >= 8) score += 25;
    else if (this.results.compatibility.vendorPrefixes.length >= 4) score += 15;

    return Math.min(score, 100);
  }

  calculateSEOScore() {
    let score = 0;

    // Meta tags (30 points)
    if (this.results.seo.metaTags >= 90) score += 30;
    else if (this.results.seo.metaTags >= 70) score += 20;

    // Structured data (25 points)
    if (this.results.seo.structuredData >= 3) score += 25;
    else if (this.results.seo.structuredData >= 1) score += 15;

    // Open Graph tags (20 points)
    if (this.results.seo.openGraphTags >= 5) score += 20;
    else if (this.results.seo.openGraphTags >= 3) score += 10;

    // Proper H1 (15 points)
    if (this.results.seo.properH1) score += 15;

    // SEO friendly images (10 points)
    if (this.results.seo.seoFriendlyImages >= 80) score += 10;

    return Math.min(score, 100);
  }
}

// Initialize and run tests when DOM is loaded
if (typeof window !== 'undefined') {
  window.BurniOptimizationTester = BurniOptimizationTester;

  // Auto-run tests after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.burniOptimizationTester = new BurniOptimizationTester();
      window.burniOptimizationTester.runAllTests();
    }, 2000);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BurniOptimizationTester;
}
