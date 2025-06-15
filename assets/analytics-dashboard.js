// Advanced Analytics Dashboard for Burni Token
class AnalyticsDashboard {
  constructor() {
    this.metrics = {
      pageViews: 0,
      uniqueVisitors: new Set(),
      avgSessionDuration: 0,
      topSections: {},
      userInteractions: [],
      deviceTypes: {},
      languages: {},
      referrers: {},
    };

    this.startTime = Date.now();
    this.init();
  }

  init() {
    this.trackPageView();
    this.trackUserBehavior();
    this.trackDeviceInfo();
    this.trackPerformance();
    this.setupRealtimeUpdates();
  }

  trackPageView() {
    this.metrics.pageViews++;
    this.metrics.uniqueVisitors.add(this.getUserId());

    // Track referrer
    const referrer = document.referrer || 'direct';
    this.metrics.referrers[referrer] = (this.metrics.referrers[referrer] || 0) + 1;

    // Track language
    const lang = navigator.language || 'unknown';
    this.metrics.languages[lang] = (this.metrics.languages[lang] || 0) + 1;
  }

  trackUserBehavior() {
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100,
      );
      maxScroll = Math.max(maxScroll, scrollPercent);
    });

    // Track section visibility
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.id;
            this.metrics.topSections[sectionName] =
              (this.metrics.topSections[sectionName] || 0) + 1;

            this.trackInteraction('section_view', sectionName);
          }
        });
      },
      { threshold: 0.5 },
    );

    sections.forEach((section) => observer.observe(section));

    // Track clicks
    document.addEventListener('click', (e) => {
      const element = e.target.closest('a, button, [data-track]');
      if (element) {
        this.trackInteraction('click', {
          type: element.tagName.toLowerCase(),
          text: element.textContent?.slice(0, 50),
          href: element.href,
          id: element.id,
        });
      }
    });

    // Track form interactions
    const forms = document.querySelectorAll('form, select, input');
    forms.forEach((form) => {
      form.addEventListener('focus', () => {
        this.trackInteraction('form_focus', form.id || form.name || 'unknown');
      });
    });
  }

  trackDeviceInfo() {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Categorize device type
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    this.metrics.deviceTypes[deviceType] = (this.metrics.deviceTypes[deviceType] || 0) + 1;
    this.metrics.deviceInfo = deviceInfo;
  }

  trackPerformance() {
    // Track Core Web Vitals
    if ('web-vital' in window) {
      this.trackWebVitals();
    }

    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          this.metrics.performance = {
            domContentLoaded: Math.round(
              perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            ),
            loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
            ttfb: Math.round(perfData.responseStart - perfData.requestStart),
            domInteractive: Math.round(perfData.domInteractive - perfData.domLoading),
          };
        }
      }, 0);
    });
  }

  trackWebVitals() {
    // Track Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.metrics.lcp = Math.round(entry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.cls = Math.round(clsValue * 1000) / 1000;
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  trackInteraction(type, data) {
    this.metrics.userInteractions.push({
      type,
      data,
      timestamp: Date.now(),
      url: window.location.href,
    });

    // Limit stored interactions
    if (this.metrics.userInteractions.length > 100) {
      this.metrics.userInteractions = this.metrics.userInteractions.slice(-50);
    }
  }

  setupRealtimeUpdates() {
    // Update session duration every 30 seconds
    setInterval(() => {
      this.metrics.avgSessionDuration = Math.round((Date.now() - this.startTime) / 1000);
      this.updateDashboard();
    }, 30000);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackInteraction('page_blur', { duration: this.metrics.avgSessionDuration });
      } else {
        this.trackInteraction('page_focus', { timestamp: Date.now() });
      }
    });
  }

  updateDashboard() {
    const dashboardEvent = new CustomEvent('analyticsUpdate', {
      detail: {
        metrics: this.getMetricsSummary(),
        timestamp: Date.now(),
      },
    });
    document.dispatchEvent(dashboardEvent);
  }

  getMetricsSummary() {
    return {
      pageViews: this.metrics.pageViews,
      uniqueVisitors: this.metrics.uniqueVisitors.size,
      sessionDuration: this.metrics.avgSessionDuration,
      topSections: Object.entries(this.metrics.topSections)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      deviceTypes: this.metrics.deviceTypes,
      performance: this.metrics.performance,
      webVitals: {
        lcp: this.metrics.lcp,
        fid: this.metrics.fid,
        cls: this.metrics.cls,
      },
      recentInteractions: this.metrics.userInteractions.slice(-10),
    };
  }

  getUserId() {
    let userId = localStorage.getItem('burni_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('burni_user_id', userId);
    }
    return userId;
  }

  // Export data for analysis
  exportData() {
    const data = {
      ...this.getMetricsSummary(),
      fullInteractionLog: this.metrics.userInteractions,
      deviceInfo: this.metrics.deviceInfo,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `burni-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Create visual dashboard
  createDashboard() {
    const dashboardHTML = `
      <div id="analytics-dashboard" class="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 z-50 max-h-96 overflow-y-auto">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-gray-800">📊 Analytics Dashboard</h3>
          <button id="close-dashboard" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div id="dashboard-content" class="space-y-2 text-sm">
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-blue-50 p-2 rounded">
              <div class="font-semibold text-blue-800">Page Views</div>
              <div class="text-blue-600" id="metric-pageviews">0</div>
            </div>
            <div class="bg-green-50 p-2 rounded">
              <div class="font-semibold text-green-800">Session</div>
              <div class="text-green-600" id="metric-session">0s</div>
            </div>
          </div>
          <div id="top-sections" class="bg-gray-50 p-2 rounded">
            <div class="font-semibold text-gray-800 mb-1">Top Sections</div>
            <div id="sections-list" class="text-xs"></div>
          </div>
          <div class="flex justify-between">
            <button id="export-analytics" class="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600">Export</button>
            <button id="toggle-dashboard" class="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600">Minimize</button>
          </div>
        </div>
      </div>
    `;

    // Insert dashboard
    document.body.insertAdjacentHTML('beforeend', dashboardHTML);

    // Add event listeners
    document.getElementById('close-dashboard').addEventListener('click', () => {
      document.getElementById('analytics-dashboard').remove();
    });

    document.getElementById('export-analytics').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('toggle-dashboard').addEventListener('click', () => {
      const content = document.getElementById('dashboard-content');
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });

    // Update dashboard content
    document.addEventListener('analyticsUpdate', (e) => {
      this.renderDashboard(e.detail.metrics);
    });

    // Initial render
    this.renderDashboard(this.getMetricsSummary());
  }

  renderDashboard(metrics) {
    const pageViewsEl = document.getElementById('metric-pageviews');
    const sessionEl = document.getElementById('metric-session');
    const sectionsEl = document.getElementById('sections-list');

    if (pageViewsEl) pageViewsEl.textContent = metrics.pageViews;
    if (sessionEl) sessionEl.textContent = `${metrics.sessionDuration}s`;

    if (sectionsEl && metrics.topSections) {
      sectionsEl.innerHTML = metrics.topSections
        .map(([section, views]) => `<div>${section}: ${views}</div>`)
        .join('');
    }
  }
}

// Initialize analytics dashboard
window.burniAnalytics = new AnalyticsDashboard();

// Keyboard shortcut to show dashboard (Ctrl+Shift+A)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    if (!document.getElementById('analytics-dashboard')) {
      window.burniAnalytics.createDashboard();
    }
  }
});

export default AnalyticsDashboard;
