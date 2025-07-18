/**
 * Enhanced Performance Monitor for BurniToken
 * Tracks Core Web Vitals and provides real-time performance metrics
 */

class BurniPerformanceMonitor {
  constructor() {
    this.metrics = {
      LCP: null,
      FID: null,
      CLS: null,
      TTFB: null,
      INP: null,
    };

    this.observers = new Map();
    this.isInitialized = false;

    this.init();
  }

  init() {
    if (this.isInitialized) return;

    // Initialize performance monitoring
    this.initCoreWebVitals();
    this.initNavigationTiming();
    this.initResourceTiming();
    this.createPerformanceWidget();

    this.isInitialized = true;
    console.log('🚀 BurniToken Performance Monitor initialized');
  }

  initCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeLCP();

    // First Input Delay (FID)
    this.observeFID();

    // Cumulative Layout Shift (CLS)
    this.observeCLS();

    // Time to First Byte (TTFB)
    this.observeTTFB();

    // Interaction to Next Paint (INP)
    this.observeINP();
  }

  observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.metrics.LCP = Math.round(lastEntry.startTime);
      this.updateMetricDisplay('LCP', this.metrics.LCP);

      // Check if LCP is within good threshold (< 2.5s)
      if (this.metrics.LCP <= 2500) {
        console.log('✅ LCP: Good (' + this.metrics.LCP + 'ms)');
      } else if (this.metrics.LCP <= 4000) {
        console.warn('⚠️ LCP: Needs Improvement (' + this.metrics.LCP + 'ms)');
      } else {
        console.error('❌ LCP: Poor (' + this.metrics.LCP + 'ms)');
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.set('LCP', observer);
  }

  observeFID() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.FID = Math.round(entry.processingStart - entry.startTime);
        this.updateMetricDisplay('FID', this.metrics.FID);

        // Check if FID is within good threshold (< 100ms)
        if (this.metrics.FID <= 100) {
          console.log('✅ FID: Good (' + this.metrics.FID + 'ms)');
        } else if (this.metrics.FID <= 300) {
          console.warn('⚠️ FID: Needs Improvement (' + this.metrics.FID + 'ms)');
        } else {
          console.error('❌ FID: Poor (' + this.metrics.FID + 'ms)');
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.set('FID', observer);
  }

  observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let clsEntries = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      });

      this.metrics.CLS = Math.round(clsValue * 1000) / 1000;
      this.updateMetricDisplay('CLS', this.metrics.CLS);

      // Check if CLS is within good threshold (< 0.1)
      if (this.metrics.CLS <= 0.1) {
        console.log('✅ CLS: Good (' + this.metrics.CLS + ')');
      } else if (this.metrics.CLS <= 0.25) {
        console.warn('⚠️ CLS: Needs Improvement (' + this.metrics.CLS + ')');
      } else {
        console.error('❌ CLS: Poor (' + this.metrics.CLS + ')');
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('CLS', observer);
  }

  observeTTFB() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.TTFB = Math.round(entry.responseStart - entry.requestStart);
        this.updateMetricDisplay('TTFB', this.metrics.TTFB);

        // Check if TTFB is within good threshold (< 800ms)
        if (this.metrics.TTFB <= 800) {
          console.log('✅ TTFB: Good (' + this.metrics.TTFB + 'ms)');
        } else if (this.metrics.TTFB <= 1800) {
          console.warn('⚠️ TTFB: Needs Improvement (' + this.metrics.TTFB + 'ms)');
        } else {
          console.error('❌ TTFB: Poor (' + this.metrics.TTFB + 'ms)');
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.set('TTFB', observer);
  }

  observeINP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const duration = entry.processingEnd - entry.startTime;
        if (!this.metrics.INP || duration > this.metrics.INP) {
          this.metrics.INP = Math.round(duration);
          this.updateMetricDisplay('INP', this.metrics.INP);

          // Check if INP is within good threshold (< 200ms)
          if (this.metrics.INP <= 200) {
            console.log('✅ INP: Good (' + this.metrics.INP + 'ms)');
          } else if (this.metrics.INP <= 500) {
            console.warn('⚠️ INP: Needs Improvement (' + this.metrics.INP + 'ms)');
          } else {
            console.error('❌ INP: Poor (' + this.metrics.INP + 'ms)');
          }
        }
      });
    });

    observer.observe({ entryTypes: ['event'] });
    this.observers.set('INP', observer);
  }

  initNavigationTiming() {
    if (!('performance' in window)) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const metrics = {
            'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
            'TCP Connection': navigation.connectEnd - navigation.connectStart,
            Request: navigation.responseStart - navigation.requestStart,
            Response: navigation.responseEnd - navigation.responseStart,
            'DOM Processing': navigation.domComplete - navigation.domLoading,
            'Load Event': navigation.loadEventEnd - navigation.loadEventStart,
          };

          console.log('📊 Navigation Timing Metrics:', metrics);
          this.updateNavigationMetrics(metrics);
        }
      }, 0);
    });
  }

  initResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 100) {
          // Log slow resources
          console.log('🐌 Slow Resource:', entry.name, entry.duration + 'ms');
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('Resource', observer);
  }

  createPerformanceWidget() {
    // Create performance widget
    const widget = document.createElement('div');
    widget.id = 'burni-performance-widget';
    widget.className =
      'fixed bottom-4 left-4 z-40 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 text-xs font-mono opacity-95';
    widget.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-green-600">🚀 Performance Monitor</span>
        <button type="button" class="text-gray-500 hover:text-gray-700 close-widget" aria-label="Close performance widget">×</button>
      </div>
      <div class="space-y-1">
        <div class="flex justify-between">
          <span>LCP:</span>
          <span id="lcp-value" class="font-bold">-</span>
        </div>
        <div class="flex justify-between">
          <span>FID:</span>
          <span id="fid-value" class="font-bold">-</span>
        </div>
        <div class="flex justify-between">
          <span>CLS:</span>
          <span id="cls-value" class="font-bold">-</span>
        </div>
        <div class="flex justify-between">
          <span>TTFB:</span>
          <span id="ttfb-value" class="font-bold">-</span>
        </div>
        <div class="flex justify-between">
          <span>INP:</span>
          <span id="inp-value" class="font-bold">-</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-gray-500">
        <span id="performance-score">Score: Calculating...</span>
      </div>
    `;

    document.body.appendChild(widget);

    // Add close functionality
    widget.querySelector('.close-widget').addEventListener('click', () => {
      widget.remove();
    });

    // Update score periodically
    setInterval(() => this.updatePerformanceScore(), 5000);
  }

  updateMetricDisplay(metric, value) {
    const element = document.getElementById(metric.toLowerCase() + '-value');
    if (element) {
      element.textContent = value + (metric === 'CLS' ? '' : 'ms');
      element.className = this.getMetricColor(metric, value);
    }
  }

  getMetricColor(metric, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) {
      return 'font-bold text-green-600';
    } else if (value <= threshold.poor) {
      return 'font-bold text-yellow-600';
    } else {
      return 'font-bold text-red-600';
    }
  }

  updateNavigationMetrics(metrics) {
    // Add navigation metrics to the widget if needed
    console.log('Navigation metrics updated:', metrics);
  }

  updatePerformanceScore() {
    const score = this.calculatePerformanceScore();
    const element = document.getElementById('performance-score');
    if (element) {
      element.textContent = `Score: ${score}/100`;
      element.className =
        score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600';
    }
  }

  calculatePerformanceScore() {
    let score = 0;
    let metricCount = 0;

    // LCP scoring (25 points)
    if (this.metrics.LCP !== null) {
      if (this.metrics.LCP <= 2500) score += 25;
      else if (this.metrics.LCP <= 4000) score += 15;
      else score += 0;
      metricCount++;
    }

    // FID scoring (25 points)
    if (this.metrics.FID !== null) {
      if (this.metrics.FID <= 100) score += 25;
      else if (this.metrics.FID <= 300) score += 15;
      else score += 0;
      metricCount++;
    }

    // CLS scoring (25 points)
    if (this.metrics.CLS !== null) {
      if (this.metrics.CLS <= 0.1) score += 25;
      else if (this.metrics.CLS <= 0.25) score += 15;
      else score += 0;
      metricCount++;
    }

    // TTFB scoring (25 points)
    if (this.metrics.TTFB !== null) {
      if (this.metrics.TTFB <= 800) score += 25;
      else if (this.metrics.TTFB <= 1800) score += 15;
      else score += 0;
      metricCount++;
    }

    return metricCount > 0 ? Math.round((score / metricCount) * 4) : 0;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();

    const widget = document.getElementById('burni-performance-widget');
    if (widget) {
      widget.remove();
    }
  }
}

// Initialize performance monitor
if (typeof window !== 'undefined') {
  window.BurniPerformanceMonitor = BurniPerformanceMonitor;

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.burniPerformanceMonitor = new BurniPerformanceMonitor();
    });
  } else {
    window.burniPerformanceMonitor = new BurniPerformanceMonitor();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BurniPerformanceMonitor;
}
