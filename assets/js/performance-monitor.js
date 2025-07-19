/**
 * Enhanced Performance Monitor for BurniToken
 * Tracks Core Web Vitals and page performance metrics
 */

class BurniPerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.startTime = performance.now();
    this.init();
  }

  init() {
    this.observeWebVitals();
    this.trackPageLoad();
    this.trackResourceTiming();
    this.setupErrorTracking();
  }

  // Core Web Vitals monitoring
  observeWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              this.metrics.lcp = entry.startTime;
              console.log(`📊 LCP: ${entry.startTime.toFixed(2)}ms`);
            }
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID) - using event timing
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-input') {
              const fid = entry.processingStart - entry.startTime;
              this.metrics.fid = fid;
              console.log(`📊 FID: ${fid.toFixed(2)}ms`);
            }
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.metrics.cls = clsValue;
          console.log(`📊 CLS: ${clsValue.toFixed(4)}`);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  // Page load performance tracking
  trackPageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        this.metrics.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
        
        console.log(`📊 TTFB: ${this.metrics.ttfb.toFixed(2)}ms`);
        console.log(`📊 DOM Ready: ${this.metrics.domContentLoaded.toFixed(2)}ms`);
        console.log(`📊 Load Complete: ${this.metrics.loadComplete.toFixed(2)}ms`);
      }
    });
  }

  // Resource timing monitoring
  trackResourceTiming() {
    const resources = performance.getEntriesByType('resource');
    const resourceMetrics = {
      css: [],
      js: [],
      images: [],
      fonts: []
    };

    resources.forEach(resource => {
      const type = this.getResourceType(resource.name);
      const duration = resource.responseEnd - resource.startTime;
      
      if (type && resourceMetrics[type]) {
        resourceMetrics[type].push({
          name: resource.name,
          duration: duration,
          size: resource.transferSize || 0
        });
      }
    });

    this.metrics.resources = resourceMetrics;
    console.log('📊 Resource timing:', resourceMetrics);
  }

  getResourceType(url) {
    if (url.includes('.css')) return 'css';
    if (url.includes('.js')) return 'js';
    if (url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) return 'images';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'fonts';
    return null;
  }

  // Error tracking for failed requests
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason);
    });
  }

  logError(type, error) {
    const errorInfo = {
      type: type,
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    console.error('🚨 Performance Monitor Error:', errorInfo);
    
    // Store errors in metrics
    if (!this.metrics.errors) this.metrics.errors = [];
    this.metrics.errors.push(errorInfo);
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.metrics,
      webVitalsScore: this.calculateWebVitalsScore(),
      recommendations: this.generateRecommendations()
    };

    console.log('📈 Performance Report:', report);
    return report;
  }

  calculateWebVitalsScore() {
    const scores = {};
    
    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (this.metrics.lcp) {
      scores.lcp = this.metrics.lcp < 2500 ? 'good' : this.metrics.lcp < 4000 ? 'needs-improvement' : 'poor';
    }

    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)  
    if (this.metrics.fid) {
      scores.fid = this.metrics.fid < 100 ? 'good' : this.metrics.fid < 300 ? 'needs-improvement' : 'poor';
    }

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (this.metrics.cls !== undefined) {
      scores.cls = this.metrics.cls < 0.1 ? 'good' : this.metrics.cls < 0.25 ? 'needs-improvement' : 'poor';
    }

    return scores;
  }

  generateRecommendations() {
    const recommendations = [];
    const scores = this.calculateWebVitalsScore();

    if (scores.lcp === 'poor') {
      recommendations.push('Optimize LCP: Consider image optimization, reducing render-blocking resources, or improving server response time');
    }

    if (scores.fid === 'poor') {
      recommendations.push('Improve FID: Reduce JavaScript execution time, split long tasks, or use web workers');
    }

    if (scores.cls === 'poor') {
      recommendations.push('Fix CLS: Set dimensions on images, avoid injecting content above existing content, or use CSS aspect ratios');
    }

    if (this.metrics.errors && this.metrics.errors.length > 0) {
      recommendations.push(`Fix ${this.metrics.errors.length} JavaScript errors affecting performance`);
    }

    return recommendations;
  }

  // Display performance widget
  showWidget() {
    const widget = document.createElement('div');
    widget.id = 'performance-widget';
    widget.className = 'fixed bottom-4 right-4 z-50 bg-white border rounded-lg shadow-lg p-4 max-w-sm text-sm';
    widget.style.display = 'none';
    
    const scores = this.calculateWebVitalsScore();
    widget.innerHTML = `
      <div class="font-bold mb-2">⚡ Performance Monitor</div>
      <div class="space-y-1">
        ${this.metrics.lcp ? `<div>LCP: ${this.metrics.lcp.toFixed(0)}ms <span class="text-${this.getScoreColor(scores.lcp)}-600">${scores.lcp}</span></div>` : ''}
        ${this.metrics.fid ? `<div>FID: ${this.metrics.fid.toFixed(0)}ms <span class="text-${this.getScoreColor(scores.fid)}-600">${scores.fid}</span></div>` : ''}
        ${this.metrics.cls !== undefined ? `<div>CLS: ${this.metrics.cls.toFixed(3)} <span class="text-${this.getScoreColor(scores.cls)}-600">${scores.cls}</span></div>` : ''}
        ${this.metrics.ttfb ? `<div>TTFB: ${this.metrics.ttfb.toFixed(0)}ms</div>` : ''}
      </div>
      <button onclick="this.parentElement.style.display='none'" class="absolute top-1 right-2 text-gray-400 hover:text-gray-600">&times;</button>
    `;

    document.body.appendChild(widget);

    // Show widget after 3 seconds
    setTimeout(() => {
      widget.style.display = 'block';
    }, 3000);
  }

  getScoreColor(score) {
    switch (score) {
      case 'good': return 'green';
      case 'needs-improvement': return 'yellow';
      case 'poor': return 'red';
      default: return 'gray';
    }
  }
}

// Initialize performance monitor
window.BurniPerformance = new BurniPerformanceMonitor();

// Show widget in development/testing
if (window.location.search.includes('debug') || window.location.hostname === 'localhost') {
  window.BurniPerformance.showWidget();
}