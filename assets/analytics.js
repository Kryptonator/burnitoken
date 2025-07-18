// BurniToken Website Analytics Configuration
// Lightweight analytics with performance monitoring

class BurniAnalytics {
  constructor() {
    this.initialized = false;
    this.metrics = {
      pageViews: 0,
      uniqueVisitors: new Set(),
      loadTime: 0,
      errors: [],
      performance: {
        fcp: 0,
        lcp: 0,
        cls: 0,
        fid: 0,
        ttfb: 0,
      },
    };

    this.init();
  }

  init() {
    if (this.initialized) return;

    try {
      // Track page load
      this.trackPageLoad();

      // Track performance metrics
      this.trackWebVitals();

      // Track user interactions
      this.trackUserInteractions();

      // Track errors
      this.trackErrors();

      this.initialized = true;
      console.log('BurniAnalytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize BurniAnalytics:', error);
    }
  }

  trackPageLoad() {
    this.metrics.pageViews++;
    this.metrics.loadTime = performance.now();

    // Generate user ID (session-based)
    const userId = this.getUserId();
    this.metrics.uniqueVisitors.add(userId);

    // Track referrer
    const referrer = document.referrer || 'direct';
    this.sendEvent('page_view', {
      url: window.location.href,
      referrer,
      loadTime: this.metrics.loadTime,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  trackWebVitals() {
    // Track Core Web Vitals
    if ('web-vital' in window || typeof webVitals !== 'undefined') {
      // Use web-vitals library if available
      return;
    }

    // Basic performance tracking
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        this.metrics.performance.ttfb = perfData.responseStart - perfData.requestStart;
        this.sendEvent('performance', {
          ttfb: this.metrics.performance.ttfb,
          loadTime: perfData.loadEventEnd - perfData.navigationStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        });
      }
    });

    // Track Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.performance.lcp = lastEntry.startTime;
          this.sendEvent('web_vital', {
            metric: 'lcp',
            value: lastEntry.startTime,
          });
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP tracking not supported:', e);
      }
    }
  }

  trackUserInteractions() {
    // Track button clicks
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (target.tagName === 'BUTTON' || target.classList.contains('btn')) {
        this.sendEvent('button_click', {
          buttonText: target.textContent?.trim(),
          buttonId: target.id,
          buttonClass: target.className,
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      this.sendEvent('form_submit', {
        formId: form.id,
        formAction: form.action,
      });
    });
  }

  trackErrors() {
    window.addEventListener('error', (event) => {
      const error = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack || 'No stack trace',
        timestamp: new Date().toISOString(),
      };

      this.metrics.errors.push(error);
      this.sendEvent('error', error);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = {
        reason: event.reason,
        timestamp: new Date().toISOString(),
      };

      this.metrics.errors.push(error);
      this.sendEvent('promise_rejection', error);
    });
  }

  getUserId() {
    // Generate or retrieve session-based user ID
    let userId = sessionStorage.getItem('burni_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem('burni_user_id', userId);
    }
    return userId;
  }

  sendEvent(eventType, eventData) {
    // For now, just log to console
    // In production, this would send to your analytics service
    console.log('Analytics Event:', eventType, eventData);

    // Store in localStorage for debugging
    try {
      const events = JSON.parse(localStorage.getItem('burni_analytics') || '[]');
      events.push({ type: eventType, data: eventData, timestamp: Date.now() });

      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }

      localStorage.setItem('burni_analytics', JSON.stringify(events));
    } catch (e) {
      console.warn('Could not store analytics event:', e);
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      uniqueVisitors: this.metrics.uniqueVisitors.size,
    };
  }
}

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.burniAnalytics = new BurniAnalytics();
  });
} else {
  window.burniAnalytics = new BurniAnalytics();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BurniAnalytics;
}
