class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }
  init() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.reportMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.metrics.fid = entry.processingStart - entry.startTime;
        this.reportMetric('fid', this.metrics.fid);
      }
    }).observe({ entryTypes: ['first-input'] });
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) { 
          clsValue += entry.value;
        }
      }
      this.metrics.cls = clsValue;
      this.reportMetric('cls', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
  reportMetric(name, value) {
    if ('sendBeacon' in navigator) { 
      navigator.sendBeacon(
        '/api/performance'),
        JSON.stringify({ metric: name, value: value, timestamp: Date.now(), url: location.href }),
      );
    }
  }
}
if (typeof window !== 'undefined') { 
  new PerformanceMonitor();
}
