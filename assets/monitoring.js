// BurniToken Website Monitoring System
// Comprehensive monitoring with error tracking and performance metrics

class BurniMonitor {
  constructor() {
    this.config = {
      maxErrors: 50,
      maxPerformanceEntries: 100,
      reportInterval: 30000, // 30 seconds
      enableConsoleLogging: true,
      enableLocalStorage: true,
    };

    this.data = {
      errors: [],
      performance: [],
      userInteractions: [],
      systemInfo: this.getSystemInfo(),
      startTime: Date.now(),
    };

    this.init();
  }

  init() {
    try {
      this.setupErrorTracking();
      this.setupPerformanceMonitoring();
      this.setupUserInteractionTracking();
      this.setupPeriodicReporting();

      this.log('BurniMonitor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize BurniMonitor:', error);
    }
  }

  setupErrorTracking() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // Promise rejection errors
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        reason: event.reason,
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // Network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.recordError({
            type: 'network',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            timestamp: Date.now(),
          });
        }
        return response;
      } catch (error) {
        this.recordError({
          type: 'network',
          message: error.message,
          url: args[0],
          timestamp: Date.now(),
        });
        throw error;
      }
    };
  }

  setupPerformanceMonitoring() {
    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordPerformance({
            metric: 'lcp',
            value: lastEntry.startTime,
            timestamp: Date.now(),
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordPerformance({
              metric: 'fid',
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now(),
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordPerformance({
            metric: 'cls',
            value: clsValue,
            timestamp: Date.now(),
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        this.log('Performance monitoring setup failed:', error);
      }
    }

    // Resource loading performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.recordPerformance({
          metric: 'page_load',
          value: navigation.loadEventEnd - navigation.navigationStart,
          details: {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          },
          timestamp: Date.now(),
        });
      }
    });
  }

  setupUserInteractionTracking() {
    // Track critical user interactions
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (
        target.tagName === 'BUTTON' ||
        target.classList.contains('btn') ||
        target.tagName === 'A'
      ) {
        this.recordInteraction({
          type: 'click',
          element: target.tagName,
          id: target.id,
          class: target.className,
          text: target.textContent?.trim().substring(0, 100),
          href: target.href,
          timestamp: Date.now(),
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      this.recordInteraction({
        type: 'form_submit',
        formId: event.target.id,
        formAction: event.target.action,
        timestamp: Date.now(),
      });
    });
  }

  setupPeriodicReporting() {
    setInterval(() => {
      this.generateReport();
    }, this.config.reportInterval);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.generateReport();
    });
  }

  recordError(error) {
    this.data.errors.push(error);

    // Limit array size
    if (this.data.errors.length > this.config.maxErrors) {
      this.data.errors.shift();
    }

    this.log('Error recorded:', error);

    // Save to localStorage
    if (this.config.enableLocalStorage) {
      this.saveToLocalStorage();
    }
  }

  recordPerformance(metric) {
    this.data.performance.push(metric);

    // Limit array size
    if (this.data.performance.length > this.config.maxPerformanceEntries) {
      this.data.performance.shift();
    }

    this.log('Performance metric recorded:', metric);
  }

  recordInteraction(interaction) {
    this.data.userInteractions.push(interaction);

    // Limit array size
    if (this.data.userInteractions.length > 100) {
      this.data.userInteractions.shift();
    }
  }

  getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      url: window.location.href,
      referrer: document.referrer,
    };
  }

  generateReport() {
    const report = {
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.data.startTime,
      systemInfo: this.data.systemInfo,
      errorCount: this.data.errors.length,
      performanceMetricsCount: this.data.performance.length,
      userInteractionsCount: this.data.userInteractions.length,
      recentErrors: this.data.errors.slice(-5),
      performanceSummary: this.getPerformanceSummary(),
    };

    this.log('Generated monitoring report:', report);
    return report;
  }

  getPerformanceSummary() {
    const summary = {};

    this.data.performance.forEach((metric) => {
      if (!summary[metric.metric]) {
        summary[metric.metric] = { values: [], avg: 0, max: 0, min: Infinity };
      }

      summary[metric.metric].values.push(metric.value);
      summary[metric.metric].max = Math.max(summary[metric.metric].max, metric.value);
      summary[metric.metric].min = Math.min(summary[metric.metric].min, metric.value);
    });

    // Calculate averages
    Object.keys(summary).forEach((metric) => {
      const values = summary[metric].values;
      summary[metric].avg = values.reduce((a, b) => a + b, 0) / values.length;
    });

    return summary;
  }

  saveToLocalStorage() {
    try {
      const dataToSave = {
        errors: this.data.errors.slice(-10), // Save last 10 errors
        performance: this.data.performance.slice(-20), // Save last 20 performance metrics
        lastUpdated: Date.now(),
      };

      localStorage.setItem('burni_monitor_data', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Could not save monitoring data to localStorage:', error);
    }
  }

  log(...args) {
    if (this.config.enableConsoleLogging) {
      console.log('[BurniMonitor]', ...args);
    }
  }

  // Public API
  getErrorCount() {
    return this.data.errors.length;
  }

  getPerformanceMetrics() {
    return this.data.performance;
  }

  clearData() {
    this.data.errors = [];
    this.data.performance = [];
    this.data.userInteractions = [];
    localStorage.removeItem('burni_monitor_data');
  }
}

// Initialize monitoring
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.burniMonitor = new BurniMonitor();
  });
} else {
  window.burniMonitor = new BurniMonitor();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BurniMonitor;
}
