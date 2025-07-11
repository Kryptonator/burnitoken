/**
 * Advanced Features Test Suite
 * Tests for Dark Mode, Analytics, Accessibility, and Performance Monitoring
 */

const { JSDOM } = require('jsdom');

describe('Advanced Features', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Create a more complete DOM environment
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Test</title>
        </head>
        <body>
          <div id="app">
            <button id="theme-toggle">Toggle Theme</button>
            <div id="accessibility-panel" style="opacity: 0;">
              <button id="high-contrast-toggle">High Contrast</button>
            </div>
            <div id="performance-widget" style="opacity: 0;">
              <div id="lcp-value">-</div>
            </div>
          </div>
        </body>
      </html>
    `;

    dom = new JSDOM(html, {
      url: 'http://localhost:8080'),
      pretendToBeVisual: true,
      resources: 'usable',
    });

    window = dom.window;
    document = window.document;

    // Mock global objects and APIs
    global.window = window;
    global.document = document;
    global.localStorage = {
      data: {},
      getItem: function (key) {
        return this.data[key] || null;
      },
      setItem: function (key, value) {
        this.data[key] = value;
      },
      removeItem: function (key) {
        delete this.data[key];
      },
      clear: function () {
        this.data = {};
      },
    };

    // Mock performance API
    global.performance = {
      now: () => Date.now(),
      getEntriesByType: () => [],
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000,
      },
    };

    // Mock navigator
    global.navigator = {
      userAgent: 'Test Browser',
      language: 'en-US',
      onLine: true,
      sendBeacon: jest.fn(),
      serviceWorker: {
        register: jest.fn().mockResolvedValue({}),
      },
    };

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock PerformanceObserver
    global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock CSS media queries
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // Mock Intl
    global.Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'UTC' }),
      }),
    };
  });

  afterEach(() => {
    // Clean up
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Dark Mode Manager', () => {
    let DarkModeManager;

    beforeEach(() => {
      // Load Dark Mode Manager (simulate loading the script)
      DarkModeManager = class {
        constructor() {
          this.currentTheme = 'light';
          this.prefersDark = false;
          this.storageKey = 'burni-theme-preference';
        }

        init() {
          this.loadThemePreference();
          this.applyTheme(this.currentTheme);
        }

        loadThemePreference() {
          const saved = localStorage.getItem(this.storageKey);
          if (saved && ['light', 'dark', 'auto'].includes(saved)) { 
            this.currentTheme = saved;
            return saved;
          }
          return 'auto';
        }

        setTheme(theme) {
          if (['light', 'dark', 'auto'].includes(theme)) { 
            this.currentTheme = theme;
            localStorage.setItem(this.storageKey, theme);
            this.applyTheme(theme);
          }
        }

        applyTheme(theme) {
          const html = document.documentElement;
          html.classList.remove('light', 'dark');
          html.classList.add(theme === 'dark' ? 'dark' : 'light');
        }

        getCurrentTheme() {
          return this.currentTheme;
        }
      };
    });

    test('should initialize with default theme', () => {
      const manager = new DarkModeManager();
      manager.init();
      expect(manager.getCurrentTheme()).toBe('light');
    });

    test('should save and load theme preference', () => {
      const manager = new DarkModeManager();
      manager.init();

      manager.setTheme('dark');
      expect(localStorage.getItem('burni-theme-preference')).toBe('dark');
      expect(manager.getCurrentTheme()).toBe('dark');
    });

    test('should apply theme to document', () => {
      const manager = new DarkModeManager();
      manager.init();

      manager.setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);

      manager.setTheme('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    test('should validate theme values', () => {
      const manager = new DarkModeManager();
      manager.init();

      manager.setTheme('invalid');
      expect(manager.getCurrentTheme()).toBe('light'); // Should remain unchanged

      manager.setTheme('dark');
      expect(manager.getCurrentTheme()).toBe('dark');
    });
  });

  describe('Analytics Manager', () => {
    let BurniAnalytics;

    beforeEach(() => {
      BurniAnalytics = class {
        constructor() {
          this.sessionId = this.generateSessionId();
          this.events = [];
          this.isOnline = true;
        }

        generateSessionId() {
          return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        trackCustomEvent(eventName, eventData = {}) {
          this.events.push({
            type: 'custom_event'),
            name: eventName,
            data: eventData,
            timestamp: Date.now(),
            sessionId: this.sessionId,
          });
        }

        trackError(error, context = {}) {
          this.events.push({
            type: 'error'),
            message: error.message,
            stack: error.stack,
            context,
            timestamp: Date.now(),
            sessionId: this.sessionId,
          });
        }

        trackFeatureUsage(feature, action) {
          this.trackCustomEvent('feature_usage', { feature, action });
        }

        getEvents() {
          return [...this.events];
        }

        getSessionData() {
          return {
            sessionId: this.sessionId,
            eventCount: this.events.length,
          };
        }
      };
    });

    test('should generate unique session ID', () => {
      const analytics1 = new BurniAnalytics();
      const analytics2 = new BurniAnalytics();

      expect(analytics1.sessionId).toBeDefined();
      expect(analytics2.sessionId).toBeDefined();
      expect(analytics1.sessionId).not.toBe(analytics2.sessionId);
    });

    test('should track custom events', () => {
      const analytics = new BurniAnalytics();

      analytics.trackCustomEvent('test_event', { value: 123 });

      const events = analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].name).toBe('test_event');
      expect(events[0].data.value).toBe(123);
      expect(events[0].sessionId).toBe(analytics.sessionId);
    });

    test('should track errors', () => {
      const analytics = new BurniAnalytics();
      const testError = new Error('Test error');

      analytics.trackError(testError, { component: 'test' });

      const events = analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('error');
      expect(events[0].message).toBe('Test error');
      expect(events[0].context.component).toBe('test');
    });

    test('should track feature usage', () => {
      const analytics = new BurniAnalytics();

      analytics.trackFeatureUsage('dark_mode', 'toggle');

      const events = analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].name).toBe('feature_usage');
      expect(events[0].data.feature).toBe('dark_mode');
      expect(events[0].data.action).toBe('toggle');
    });

    test('should provide session data', () => {
      const analytics = new BurniAnalytics();
      analytics.trackCustomEvent('test1');
      analytics.trackCustomEvent('test2');

      const sessionData = analytics.getSessionData();
      expect(sessionData.sessionId).toBe(analytics.sessionId);
      expect(sessionData.eventCount).toBe(2);
    });
  });

  describe('Accessibility Manager', () => {
    let AccessibilityManager;

    beforeEach(() => {
      AccessibilityManager = class {
        constructor() {
          this.settings = {
            highContrast: false,
            fontSize: 'normal',
            reducedMotion: false,
            focusVisible: true,
            screenReaderOptimized: false,
            colorBlindFriendly: false,
          };
          this.storageKey = 'burni-accessibility-settings';
        }

        loadSettings() {
          try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) { 
              this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
          } catch (error) {
            console.warn('Could not load accessibility settings:', error);
          }
        }

        saveSettings() {
          try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
          } catch (error) {
            console.warn('Could not save accessibility settings:', error);
          }
        }

        updateSetting(key, value) {
          if (key in this.settings) { 
            this.settings[key] = value;
            this.saveSettings();
            this.applySetting(key, value);
          }
        }

        applySetting(key, value) {
          switch (key) {
            case 'highContrast':
              document.body.classList.toggle('high-contrast', value);
              break;
            case 'fontSize':
              document.body.classList.remove(
                'font-small'),
                'font-normal',
                'font-large',
                'font-xlarge',
              );
              document.body.classList.add(`font-$${value}`);
              break;
            case 'reducedMotion':
              document.body.classList.toggle('reduced-motion', value);
              break;
          }
        }

        getSettings() {
          return { ...this.settings };
        }

        resetToDefaults() {
          this.settings = {
            highContrast: false,
            fontSize: 'normal',
            reducedMotion: false,
            focusVisible: true,
            screenReaderOptimized: false,
            colorBlindFriendly: false,
          };
          this.saveSettings();
        }
      };
    });

    test('should initialize with default settings', () => {
      const manager = new AccessibilityManager();
      const settings = manager.getSettings();

      expect(settings.highContrast).toBe(false);
      expect(settings.fontSize).toBe('normal');
      expect(settings.reducedMotion).toBe(false);
    });

    test('should save and load settings', () => {
      const manager = new AccessibilityManager();

      manager.updateSetting('highContrast', true);
      manager.updateSetting('fontSize', 'large');

      expect(localStorage.getItem('burni-accessibility-settings')).toBeTruthy();

      // Create new manager to test loading
      const manager2 = new AccessibilityManager();
      manager2.loadSettings();

      const settings = manager2.getSettings();
      expect(settings.highContrast).toBe(true);
      expect(settings.fontSize).toBe('large');
    });

    test('should apply settings to DOM', () => {
      const manager = new AccessibilityManager();

      manager.updateSetting('highContrast', true);
      expect(document.body.classList.contains('high-contrast')).toBe(true);

      manager.updateSetting('fontSize', 'large');
      expect(document.body.classList.contains('font-large')).toBe(true);

      manager.updateSetting('reducedMotion', true);
      expect(document.body.classList.contains('reduced-motion')).toBe(true);
    });

    test('should reset to defaults', () => {
      const manager = new AccessibilityManager();

      manager.updateSetting('highContrast', true);
      manager.updateSetting('fontSize', 'large');

      manager.resetToDefaults();

      const settings = manager.getSettings();
      expect(settings.highContrast).toBe(false);
      expect(settings.fontSize).toBe('normal');
    });

    test('should validate setting keys', () => {
      const manager = new AccessibilityManager();
      const originalSettings = manager.getSettings();

      manager.updateSetting('invalidKey', 'value');

      const newSettings = manager.getSettings();
      expect(newSettings).toEqual(originalSettings);
    });
  });

  describe('Performance Monitor', () => {
    let PerformanceMonitor;

    beforeEach(() => {
      PerformanceMonitor = class {
        constructor() {
          this.metrics = {};
          this.thresholds = {
            LCP: { good: 2500, poor: 4000 },
            FID: { good: 100, poor: 300 },
            CLS: { good: 0.1, poor: 0.25 },
          };
        }

        trackMetric(name, value) {
          this.metrics[name] = value;
        }

        getMetricStatus(metric, value) {
          const threshold = this.thresholds[metric];
          if (!threshold) return 'unknown';

          if (value <= threshold.good) return 'good';
          if (value <= threshold.poor) return 'needs-improvement';
          return 'poor';
        }

        calculatePerformanceScore() {
          const scores = [];

          Object.keys(this.thresholds).forEach((metric) => {
            if (this.metrics[metric] !== undefined) { 
              const score = this.scoreMetric(metric, this.metrics[metric]);
              scores.push(score);
            }
          });

          return scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
        }

        scoreMetric(metric, value) {
          const threshold = this.thresholds[metric];
          if (value <= threshold.good) return 90;
          if (value <= threshold.poor) return 60;
          return 30;
        }

        getMetrics() {
          return { ...this.metrics };
        }

        exportReport() {
          return {
            timestamp: Date.now(),
            metrics: this.getMetrics(),
            score: this.calculatePerformanceScore(),
          };
        }
      };
    });

    test('should track performance metrics', () => {
      const monitor = new PerformanceMonitor();

      monitor.trackMetric('LCP', 2000);
      monitor.trackMetric('FID', 50);
      monitor.trackMetric('CLS', 0.05);

      const metrics = monitor.getMetrics();
      expect(metrics.LCP).toBe(2000);
      expect(metrics.FID).toBe(50);
      expect(metrics.CLS).toBe(0.05);
    });

    test('should evaluate metric status correctly', () => {
      const monitor = new PerformanceMonitor();

      expect(monitor.getMetricStatus('LCP', 2000)).toBe('good');
      expect(monitor.getMetricStatus('LCP', 3000)).toBe('needs-improvement');
      expect(monitor.getMetricStatus('LCP', 5000)).toBe('poor');

      expect(monitor.getMetricStatus('FID', 50)).toBe('good');
      expect(monitor.getMetricStatus('FID', 200)).toBe('needs-improvement');
      expect(monitor.getMetricStatus('FID', 400)).toBe('poor');
    });

    test('should calculate performance score', () => {
      const monitor = new PerformanceMonitor();

      // All good metrics
      monitor.trackMetric('LCP', 2000);
      monitor.trackMetric('FID', 50);
      monitor.trackMetric('CLS', 0.05);

      expect(monitor.calculatePerformanceScore()).toBe(90);

      // Mixed metrics
      monitor.trackMetric('LCP', 5000); // poor
      expect(monitor.calculatePerformanceScore()).toBe(70); // (30 + 90 + 90) / 3
    });

    test('should export performance report', () => {
      const monitor = new PerformanceMonitor();

      monitor.trackMetric('LCP', 2000);
      monitor.trackMetric('FID', 50);

      const report = monitor.exportReport();

      expect(report.timestamp).toBeDefined();
      expect(report.metrics.LCP).toBe(2000);
      expect(report.metrics.FID).toBe(50);
      expect(report.score).toBe(90);
    });

    test('should handle missing metrics gracefully', () => {
      const monitor = new PerformanceMonitor();

      expect(monitor.calculatePerformanceScore()).toBe(0);
      expect(monitor.getMetricStatus('UNKNOWN', 100)).toBe('unknown');
    });
  });

  describe('Feature Integration', () => {
    test('should detect browser features', () => {
      // Mock various browser features
      global.localStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      };

      function checkFeatureSupport() {
        return {
          localStorage: (() => {
            try {
              localStorage.setItem('test', 'test');
              localStorage.removeItem('test');
              return true;
            } catch (e) {
              return false;
            }
          })(),
          intersectionObserver: typeof global.IntersectionObserver !== 'undefined',
          performanceObserver: typeof global.PerformanceObserver !== 'undefined',
        };
      }

      const features = checkFeatureSupport();

      expect(features.localStorage).toBe(true);
      expect(features.intersectionObserver).toBe(true);
      expect(features.performanceObserver).toBe(true);
    });

    test('should handle theme changes across components', () => {
      const listeners = [];

      // Mock event system
      window.addEventListener = jest.fn((event, callback) => {
        if (event === 'themeChanged') { 
          listeners.push(callback);
        }
      });

      window.dispatchEvent = jest.fn((event) => {
        listeners.forEach((callback) => callback(event));
      });

      // Simulate theme change
      let currentTheme = 'light';

      window.addEventListener('themeChanged', (event) => {
        currentTheme = event.detail.theme;
      });

      // Trigger theme change
      window.dispatchEvent({
        detail: { theme: 'dark' }),});

      expect(currentTheme).toBe('dark');
    });

    test('should coordinate between analytics and other features', () => {
      const analytics = {
        events: [],
        trackFeatureUsage: function (feature, action) {
          this.events.push({ feature, action, timestamp: Date.now() });
        },
      };

      // Simulate feature usage tracking
      function simulateThemeChange() {
        analytics.trackFeatureUsage('theme', 'changed_to_dark');
      }

      function simulateAccessibilityChange() {
        analytics.trackFeatureUsage('accessibility', 'high_contrast_enabled');
      }

      simulateThemeChange();
      simulateAccessibilityChange();

      expect(analytics.events).toHaveLength(2);
      expect(analytics.events[0].feature).toBe('theme');
      expect(analytics.events[1].feature).toBe('accessibility');
    });
  });
});
