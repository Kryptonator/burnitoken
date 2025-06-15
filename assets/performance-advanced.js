/**
 * Advanced Performance Optimization Suite for BURNI Token Website
 * Comprehensive performance monitoring and optimization
 */

class BURNIPerformanceOptimizer {
  constructor() {
    this.metrics = {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      interactionToNextPaint: 0,
    };

    this.thresholds = {
      loadTime: 3000,
      firstContentfulPaint: 1800,
      largestContentfulPaint: 2500,
      firstInputDelay: 100,
      cumulativeLayoutShift: 0.1,
      interactionToNextPaint: 200,
    };

    this.optimizations = {
      imageOptimization: true,
      lazyLoading: true,
      resourceHints: true,
      bundleOptimization: true,
      cacheOptimization: true,
      criticalCss: true,
      serviceWorker: true,
    };

    this.performanceObserver = null;
    this.resourceObserver = null;
    this.mutationObserver = null;

    this.init();
  }

  /**
   * Initialize performance optimization suite
   */
  init() {
    this.measureInitialMetrics();
    this.setupPerformanceObserver();
    this.optimizeImages();
    this.setupLazyLoading();
    this.optimizeResourceLoading();
    this.setupCacheOptimization();
    this.initializeServiceWorker();
    this.setupPerformanceMonitoring();
    this.createPerformanceDashboard();

    console.log('⚡ Performance optimization suite initialized');
  }

  /**
   * Measure initial performance metrics
   */
  measureInitialMetrics() {
    // Navigation Timing API
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      }
    }

    // Performance Observer for Core Web Vitals
    if (PerformanceObserver) {
      this.setupCoreWebVitalsObserver();
    }

    // Custom timing measurements
    this.measureCustomMetrics();
  }

  /**
   * Setup Core Web Vitals observer
   */
  setupCoreWebVitalsObserver() {
    try {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        this.evaluateMetric('largestContentfulPaint', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          this.evaluateMetric('firstInputDelay', this.metrics.firstInputDelay);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
        this.evaluateMetric('cumulativeLayoutShift', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Could not setup Core Web Vitals observer:', error);
    }
  }

  /**
   * Setup general performance observer
   */
  setupPerformanceObserver() {
    if (!PerformanceObserver) return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzePerformanceEntry(entry);
        }
      });

      this.performanceObserver.observe({
        entryTypes: ['measure', 'navigation', 'resource', 'paint'],
      });
    } catch (error) {
      console.warn('Could not setup performance observer:', error);
    }
  }

  /**
   * Analyze performance entry
   */
  analyzePerformanceEntry(entry) {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
          this.evaluateMetric('firstContentfulPaint', entry.startTime);
        }
        break;

      case 'resource':
        this.analyzeResourcePerformance(entry);
        break;

      case 'navigation':
        this.analyzeNavigationPerformance(entry);
        break;

      case 'measure':
        console.log(`Custom measurement: ${entry.name} took ${entry.duration}ms`);
        break;
    }
  }

  /**
   * Analyze resource performance
   */
  analyzeResourcePerformance(entry) {
    const slowThreshold = 1000; // 1 second

    if (entry.duration > slowThreshold) {
      console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`);

      // Suggest optimizations for slow resources
      this.suggestResourceOptimization(entry);
    }

    // Track resource types
    const resourceType = this.getResourceType(entry.name);
    this.updateResourceMetrics(resourceType, entry);
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(css)$/i)) return 'stylesheet';
    if (url.match(/\.(js)$/i)) return 'script';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
    if (url.includes('api.') || url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Update resource metrics
   */
  updateResourceMetrics(type, entry) {
    if (!this.resourceMetrics) {
      this.resourceMetrics = {};
    }

    if (!this.resourceMetrics[type]) {
      this.resourceMetrics[type] = {
        count: 0,
        totalSize: 0,
        totalDuration: 0,
        avgDuration: 0,
      };
    }

    const metrics = this.resourceMetrics[type];
    metrics.count++;
    metrics.totalSize += entry.transferSize || 0;
    metrics.totalDuration += entry.duration;
    metrics.avgDuration = metrics.totalDuration / metrics.count;
  }

  /**
   * Suggest resource optimization
   */
  suggestResourceOptimization(entry) {
    const resourceType = this.getResourceType(entry.name);
    const suggestions = [];

    switch (resourceType) {
      case 'image':
        suggestions.push('Consider using WebP format');
        suggestions.push('Implement responsive images');
        suggestions.push('Add lazy loading');
        break;

      case 'script':
        suggestions.push('Consider code splitting');
        suggestions.push('Use async/defer attributes');
        suggestions.push('Minify and compress');
        break;

      case 'stylesheet':
        suggestions.push('Remove unused CSS');
        suggestions.push('Use critical CSS');
        suggestions.push('Consider CSS-in-JS for components');
        break;

      case 'api':
        suggestions.push('Implement response caching');
        suggestions.push('Use GraphQL for specific data needs');
        suggestions.push('Consider API pagination');
        break;
    }

    console.log(`Optimization suggestions for ${entry.name}:`, suggestions);
  }

  /**
   * Analyze navigation performance
   */
  analyzeNavigationPerformance(entry) {
    const timings = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart ? entry.connectEnd - entry.secureConnectionStart : 0,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domProcessing: entry.domContentLoadedEventStart - entry.responseEnd,
      onload: entry.loadEventEnd - entry.loadEventStart,
    };

    // Analyze each timing
    Object.entries(timings).forEach(([name, duration]) => {
      if (duration > this.getTimingThreshold(name)) {
        console.warn(`Slow ${name}: ${duration}ms`);
        this.suggestNavigationOptimization(name, duration);
      }
    });

    this.navigationTimings = timings;
  }

  /**
   * Get timing threshold for navigation phases
   */
  getTimingThreshold(timing) {
    const thresholds = {
      dns: 200,
      tcp: 200,
      ssl: 300,
      ttfb: 600,
      download: 1000,
      domProcessing: 800,
      onload: 500,
    };
    return thresholds[timing] || 1000;
  }

  /**
   * Suggest navigation optimization
   */
  suggestNavigationOptimization(timing, duration) {
    const suggestions = {
      dns: ['Use DNS prefetch', 'Consider a faster DNS provider'],
      tcp: ['Use HTTP/2', 'Reduce server distance with CDN'],
      ssl: ['Optimize SSL certificate chain', 'Use HTTP/2'],
      ttfb: ['Optimize server response time', 'Use caching'],
      download: ['Compress responses', 'Reduce payload size'],
      domProcessing: ['Optimize DOM size', 'Reduce JavaScript execution'],
      onload: ['Defer non-critical resources', 'Optimize images'],
    };

    console.log(`Suggestions for slow ${timing} (${duration}ms):`, suggestions[timing]);
  }

  /**
   * Measure custom metrics
   */
  measureCustomMetrics() {
    // Calculator initialization time
    performance.mark('calculator-start');

    // API response times
    this.measureAPIPerformance();

    // User interaction responsiveness
    this.measureInteractionResponsiveness();
  }

  /**
   * Measure API performance
   */
  measureAPIPerformance() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const url = args[0];
      const startTime = performance.now();

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log API performance
        console.log(`API call to ${url} took ${duration.toFixed(2)}ms`);

        // Track slow APIs
        if (duration > 2000) {
          console.warn(`Slow API detected: ${url} (${duration.toFixed(2)}ms)`);
          this.reportSlowAPI(url, duration);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.error(`API call to ${url} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      }
    };
  }

  /**
   * Report slow API
   */
  reportSlowAPI(url, duration) {
    // In production, send to analytics
    console.log(`Reporting slow API: ${url} - ${duration}ms`);
  }

  /**
   * Measure interaction responsiveness
   */
  measureInteractionResponsiveness() {
    let interactionStart = 0;

    ['click', 'touchstart', 'keydown'].forEach((eventType) => {
      document.addEventListener(eventType, () => {
        interactionStart = performance.now();
      });
    });

    // Measure time to next paint after interaction
    if (PerformanceObserver) {
      try {
        new PerformanceObserver((entryList) => {
          if (interactionStart > 0) {
            const paintTime = performance.now();
            const inp = paintTime - interactionStart;
            this.metrics.interactionToNextPaint = inp;

            if (inp > this.thresholds.interactionToNextPaint) {
              console.warn(`Slow interaction detected: ${inp}ms`);
            }

            interactionStart = 0;
          }
        }).observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('Could not measure interaction responsiveness:', error);
      }
    }
  }

  /**
   * Optimize images
   */
  optimizeImages() {
    // Add WebP support detection
    this.detectWebPSupport().then((supportsWebP) => {
      if (supportsWebP) {
        this.convertToWebP();
      }
    });

    // Implement responsive images
    this.implementResponsiveImages();

    // Optimize image loading
    this.optimizeImageLoading();
  }

  /**
   * Detect WebP support
   */
  detectWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Convert images to WebP where supported
   */
  convertToWebP() {
    document.querySelectorAll('img[src$=".jpg"], img[src$=".png"]').forEach((img) => {
      const webpSrc = img.src.replace(/\.(jpg|png)$/, '.webp');

      // Create a new image to test if WebP version exists
      const testImg = new Image();
      testImg.onload = () => {
        img.src = webpSrc;
      };
      testImg.src = webpSrc;
    });
  }

  /**
   * Implement responsive images
   */
  implementResponsiveImages() {
    document.querySelectorAll('img:not([srcset])').forEach((img) => {
      const src = img.src;
      if (src && !src.includes('data:')) {
        // Generate srcset for different screen sizes
        const baseName = src.replace(/\.[^/.]+$/, '');
        const extension = src.split('.').pop();

        const srcset = [
          `${baseName}-400w.${extension} 400w`,
          `${baseName}-800w.${extension} 800w`,
          `${baseName}-1200w.${extension} 1200w`,
          `${src} 1600w`,
        ].join(', ');

        img.setAttribute('srcset', srcset);
        img.setAttribute('sizes', '(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px');
      }
    });
  }

  /**
   * Optimize image loading
   */
  optimizeImageLoading() {
    // Add loading="lazy" to non-critical images
    document.querySelectorAll('img').forEach((img, index) => {
      // First few images should load immediately
      if (index > 3) {
        img.setAttribute('loading', 'lazy');
      }

      // Add decode hint
      img.setAttribute('decoding', 'async');
    });
  }

  /**
   * Setup lazy loading for non-image content
   */
  setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, skipping lazy loading');
      return;
    }

    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadLazyContent(entry.target);
            lazyObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      },
    );

    // Observe elements marked for lazy loading
    document.querySelectorAll('[data-lazy]').forEach((element) => {
      lazyObserver.observe(element);
    });

    // Lazy load calculator
    const calculator = document.getElementById('burni-calculator');
    if (calculator) {
      lazyObserver.observe(calculator);
    }
  }

  /**
   * Load lazy content
   */
  loadLazyContent(element) {
    const lazyType = element.getAttribute('data-lazy');

    switch (lazyType) {
      case 'calculator':
        if (typeof initializeCalculator === 'function') {
          performance.mark('calculator-load-start');
          initializeCalculator();
          performance.mark('calculator-load-end');
          performance.measure('calculator-load', 'calculator-load-start', 'calculator-load-end');
        }
        break;

      case 'analytics':
        if (window.burniAI) {
          window.burniAI.generateAIInsights();
        }
        break;

      case 'component':
        const src = element.getAttribute('data-src');
        if (src) {
          this.loadComponent(src, element);
        }
        break;
    }
  }

  /**
   * Load component dynamically
   */
  async loadComponent(src, target) {
    try {
      const module = await import(src);
      if (module.default) {
        target.innerHTML = module.default();
      }
    } catch (error) {
      console.error(`Failed to load component ${src}:`, error);
    }
  }

  /**
   * Optimize resource loading
   */
  optimizeResourceLoading() {
    // Add resource hints
    this.addResourceHints();

    // Preload critical resources
    this.preloadCriticalResources();

    // Defer non-critical resources
    this.deferNonCriticalResources();
  }

  /**
   * Add resource hints
   */
  addResourceHints() {
    const hints = [
      { rel: 'dns-prefetch', href: '//api.coingecko.com' },
      { rel: 'dns-prefetch', href: '//livenet.xrpl.org' },
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
      { rel: 'preconnect', href: 'https://api.coingecko.com' },
      { rel: 'preconnect', href: 'https://livenet.xrpl.org' },
    ];

    hints.forEach((hint) => {
      const link = document.createElement('link');
      Object.assign(link, hint);
      document.head.appendChild(link);
    });
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    const criticalResources = [
      { href: '/assets/css/critical.css', as: 'style' },
      { href: '/assets/scripts.min.js', as: 'script' },
      { href: '/assets/images/burniimage.webp', as: 'image' },
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.as === 'font') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  /**
   * Defer non-critical resources
   */
  deferNonCriticalResources() {
    // Defer non-critical scripts
    document.querySelectorAll('script[src]:not([async]):not([defer])').forEach((script) => {
      if (!this.isCriticalScript(script.src)) {
        script.defer = true;
      }
    });

    // Defer non-critical stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      if (!this.isCriticalStylesheet(link.href)) {
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
        };
      }
    });
  }

  /**
   * Check if script is critical
   */
  isCriticalScript(src) {
    const criticalPatterns = ['critical', 'security', 'polyfill'];
    return criticalPatterns.some((pattern) => src.includes(pattern));
  }

  /**
   * Check if stylesheet is critical
   */
  isCriticalStylesheet(href) {
    const criticalPatterns = ['critical', 'above-fold'];
    return criticalPatterns.some((pattern) => href.includes(pattern));
  }

  /**
   * Setup cache optimization
   */
  setupCacheOptimization() {
    // Implement smart caching strategies
    this.implementCacheStrategies();

    // Setup cache invalidation
    this.setupCacheInvalidation();

    // Monitor cache performance
    this.monitorCachePerformance();
  }

  /**
   * Implement cache strategies
   */
  implementCacheStrategies() {
    // Cache API responses
    const originalFetch = window.fetch;
    const cache = new Map();
    const cacheTimeout = 5 * 60 * 1000; // 5 minutes

    window.fetch = async (url, options = {}) => {
      // Only cache GET requests
      if (options.method && options.method !== 'GET') {
        return originalFetch(url, options);
      }

      const cacheKey = `${url}-${JSON.stringify(options)}`;
      const cachedResponse = cache.get(cacheKey);

      if (cachedResponse && Date.now() - cachedResponse.timestamp < cacheTimeout) {
        console.log(`Cache hit for ${url}`);
        return new Response(JSON.stringify(cachedResponse.data), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const response = await originalFetch(url, options);
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();

        cache.set(cacheKey, {
          data: data,
          timestamp: Date.now(),
        });

        console.log(`Cache miss for ${url} - cached for future use`);
        return response;
      } catch (error) {
        // If fresh request fails, try to use stale cache
        if (cachedResponse) {
          console.log(`Using stale cache for ${url}`);
          return new Response(JSON.stringify(cachedResponse.data), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
        throw error;
      }
    };
  }

  /**
   * Setup cache invalidation
   */
  setupCacheInvalidation() {
    // Invalidate cache on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Clear old cache entries when page becomes visible
        this.clearOldCacheEntries();
      }
    });
  }

  /**
   * Clear old cache entries
   */
  clearOldCacheEntries() {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();

    for (const [key, value] of this.cache?.entries() || []) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Monitor cache performance
   */
  monitorCachePerformance() {
    let cacheHits = 0;
    let cacheMisses = 0;

    const originalLog = console.log;
    console.log = (...args) => {
      const message = args[0];
      if (typeof message === 'string') {
        if (message.includes('Cache hit')) cacheHits++;
        if (message.includes('Cache miss')) cacheMisses++;
      }
      return originalLog(...args);
    };

    // Report cache performance every 5 minutes
    setInterval(() => {
      const totalRequests = cacheHits + cacheMisses;
      if (totalRequests > 0) {
        const hitRate = ((cacheHits / totalRequests) * 100).toFixed(1);
        console.log(`Cache performance: ${hitRate}% hit rate (${cacheHits}/${totalRequests})`);
      }
    }, 300000);
  }

  /**
   * Initialize service worker
   */
  async initializeServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        this.handleServiceWorkerUpdate(registration);
      });
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  /**
   * Handle service worker update
   */
  handleServiceWorkerUpdate(registration) {
    const newWorker = registration.installing;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker available
        this.showUpdateNotification();
      }
    });
  }

  /**
   * Show update notification
   */
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
            <div class="notification-content">
                <p>🚀 A new version is available!</p>
                <button class="update-button">Update Now</button>
                <button class="dismiss-button">Later</button>
            </div>
        `;

    this.styleUpdateNotification(notification);
    document.body.appendChild(notification);

    notification.querySelector('.update-button').addEventListener('click', () => {
      window.location.reload();
    });

    notification.querySelector('.dismiss-button').addEventListener('click', () => {
      notification.remove();
    });
  }

  /**
   * Style update notification
   */
  styleUpdateNotification(notification) {
    notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #fff;
            border: 2px solid #ff6b35;
            border-radius: 8px;
            padding: 1rem;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 300px;
        `;
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor CPU usage (approximation)
    this.monitorCPUUsage();

    // Monitor network usage
    this.monitorNetworkUsage();

    // Setup automated reporting
    this.setupAutomatedReporting();
  }

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage() {
    if (!performance.memory) {
      console.warn('Memory monitoring not available');
      return;
    }

    setInterval(() => {
      const memory = performance.memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

      if (used / limit > 0.8) {
        console.warn(
          `High memory usage: ${used}MB/${limit}MB (${((used / limit) * 100).toFixed(1)}%)`,
        );
        this.suggestMemoryOptimization();
      }

      this.memoryMetrics = { used, total, limit };
    }, 30000); // Check every 30 seconds
  }

  /**
   * Suggest memory optimization
   */
  suggestMemoryOptimization() {
    const suggestions = [
      'Clear unused variables and references',
      'Optimize image sizes and formats',
      'Remove unused event listeners',
      'Clear cache periodically',
      'Optimize DOM size',
    ];

    console.log('Memory optimization suggestions:', suggestions);
  }

  /**
   * Monitor CPU usage (approximation)
   */
  monitorCPUUsage() {
    let lastTime = performance.now();
    let lastUsage = 0;

    const measureCPU = () => {
      const start = performance.now();

      // Simulate some work to measure available CPU
      let count = 0;
      const workStart = performance.now();
      while (performance.now() - workStart < 10) {
        count++;
      }

      const actualTime = performance.now() - start;
      const expectedTime = 10;
      const cpuUsage = Math.max(0, ((expectedTime - actualTime) / expectedTime) * 100);

      if (cpuUsage > 80) {
        console.warn(`High CPU usage detected: ${cpuUsage.toFixed(1)}%`);
      }

      this.cpuMetrics = { usage: cpuUsage };
    };

    setInterval(measureCPU, 60000); // Check every minute
  }

  /**
   * Monitor network usage
   */
  monitorNetworkUsage() {
    if (!navigator.connection) {
      console.warn('Network monitoring not available');
      return;
    }

    const connection = navigator.connection;

    // Monitor connection changes
    connection.addEventListener('change', () => {
      console.log(`Network changed: ${connection.effectiveType} (${connection.downlink}Mbps)`);
      this.adaptToNetworkConditions(connection);
    });

    // Initial adaptation
    this.adaptToNetworkConditions(connection);
  }

  /**
   * Adapt to network conditions
   */
  adaptToNetworkConditions(connection) {
    const effectiveType = connection.effectiveType;

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        this.enableDataSaverMode();
        break;

      case '3g':
        this.enableReducedQualityMode();
        break;

      case '4g':
      default:
        this.enableFullQualityMode();
        break;
    }
  }

  /**
   * Enable data saver mode
   */
  enableDataSaverMode() {
    console.log('🐌 Enabling data saver mode for slow connection');

    // Reduce image quality
    document.querySelectorAll('img').forEach((img) => {
      img.loading = 'lazy';
    });

    // Disable autoplay videos
    document.querySelectorAll('video[autoplay]').forEach((video) => {
      video.removeAttribute('autoplay');
    });

    // Reduce update frequency
    this.updateFrequency = 60000; // 1 minute
  }

  /**
   * Enable reduced quality mode
   */
  enableReducedQualityMode() {
    console.log('📱 Enabling reduced quality mode for 3G connection');
    this.updateFrequency = 30000; // 30 seconds
  }

  /**
   * Enable full quality mode
   */
  enableFullQualityMode() {
    console.log('🚀 Enabling full quality mode for fast connection');
    this.updateFrequency = 15000; // 15 seconds
  }

  /**
   * Setup automated reporting
   */
  setupAutomatedReporting() {
    // Report performance metrics every 5 minutes
    setInterval(() => {
      this.generatePerformanceReport();
    }, 300000);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.generateFinalReport();
    });
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      resourceMetrics: this.resourceMetrics,
      navigationTimings: this.navigationTimings,
      memoryMetrics: this.memoryMetrics,
      cpuMetrics: this.cpuMetrics,
      score: this.calculatePerformanceScore(),
    };

    console.log('📊 Performance Report:', report);

    // In production, send to analytics
    this.sendToAnalytics(report);

    return report;
  }

  /**
   * Calculate overall performance score
   */
  calculatePerformanceScore() {
    let score = 100;

    // Deduct points for slow metrics
    Object.entries(this.metrics).forEach(([metric, value]) => {
      const threshold = this.thresholds[metric];
      if (threshold && value > threshold) {
        const penalty = Math.min(30, (value / threshold - 1) * 20);
        score -= penalty;
      }
    });

    return Math.max(0, Math.round(score));
  }

  /**
   * Send to analytics (placeholder)
   */
  sendToAnalytics(data) {
    // In production, send to your analytics service
    console.log('📈 Sending performance data to analytics:', data);
  }

  /**
   * Generate final report on page unload
   */
  generateFinalReport() {
    const finalReport = this.generatePerformanceReport();
    finalReport.sessionDuration = performance.now();

    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/performance', JSON.stringify(finalReport));
    }
  }

  /**
   * Evaluate metric against threshold
   */
  evaluateMetric(metric, value) {
    const threshold = this.thresholds[metric];
    const status =
      value <= threshold ? 'good' : value <= threshold * 1.5 ? 'needs-improvement' : 'poor';

    console.log(`${metric}: ${value.toFixed(2)}ms (${status})`);

    if (status === 'poor') {
      this.suggestOptimization(metric, value);
    }
  }

  /**
   * Suggest optimization for poor metrics
   */
  suggestOptimization(metric, value) {
    const suggestions = {
      firstContentfulPaint: [
        'Optimize critical rendering path',
        'Reduce server response time',
        'Eliminate render-blocking resources',
      ],
      largestContentfulPaint: [
        'Optimize images',
        'Preload important resources',
        'Reduce server response times',
      ],
      firstInputDelay: [
        'Reduce JavaScript execution time',
        'Break up long tasks',
        'Use web workers for heavy computation',
      ],
      cumulativeLayoutShift: [
        'Include size attributes on images and videos',
        'Never insert content above existing content',
        'Preload fonts',
      ],
    };

    console.log(`Optimization suggestions for ${metric}:`, suggestions[metric] || []);
  }

  /**
   * Create performance dashboard
   */
  createPerformanceDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'performance-dashboard';
    dashboard.style.display = 'none';
    dashboard.innerHTML = `
            <div class="dashboard-header">
                <h3>⚡ Performance Dashboard</h3>
                <button class="close-dashboard">×</button>
            </div>
            <div class="dashboard-content">
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h4>Load Time</h4>
                        <span class="metric-value" id="load-time-value">-</span>
                        <div class="metric-status" id="load-time-status"></div>
                    </div>
                    <div class="metric-card">
                        <h4>FCP</h4>
                        <span class="metric-value" id="fcp-value">-</span>
                        <div class="metric-status" id="fcp-status"></div>
                    </div>
                    <div class="metric-card">
                        <h4>LCP</h4>
                        <span class="metric-value" id="lcp-value">-</span>
                        <div class="metric-status" id="lcp-status"></div>
                    </div>
                    <div class="metric-card">
                        <h4>FID</h4>
                        <span class="metric-value" id="fid-value">-</span>
                        <div class="metric-status" id="fid-status"></div>
                    </div>
                    <div class="metric-card">
                        <h4>CLS</h4>
                        <span class="metric-value" id="cls-value">-</span>
                        <div class="metric-status" id="cls-status"></div>
                    </div>
                    <div class="metric-card">
                        <h4>Score</h4>
                        <span class="metric-value" id="score-value">-</span>
                        <div class="metric-status" id="score-status"></div>
                    </div>
                </div>
                <div class="dashboard-actions">
                    <button onclick="burniPerformance.generatePerformanceReport()">Generate Report</button>
                    <button onclick="burniPerformance.optimizePerformance()">Optimize</button>
                </div>
            </div>
        `;

    this.stylePerformanceDashboard();
    document.body.appendChild(dashboard);
    this.setupDashboardEvents();

    // Create toggle button
    this.createPerformanceToggle();

    // Update dashboard periodically
    setInterval(() => {
      this.updateDashboard();
    }, 5000);
  }

  /**
   * Style performance dashboard
   */
  stylePerformanceDashboard() {
    const style = document.createElement('style');
    style.textContent = `
            #performance-dashboard {
                position: fixed;
                top: 20px;
                left: 20px;
                background: #fff;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 1rem;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                font-family: monospace;
            }
            
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                border-bottom: 1px solid #ccc;
                padding-bottom: 0.5rem;
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .metric-card {
                background: #f5f5f5;
                padding: 1rem;
                border-radius: 4px;
                text-align: center;
            }
            
            .metric-card h4 {
                margin: 0 0 0.5rem 0;
                font-size: 0.8rem;
                color: #666;
            }
            
            .metric-value {
                display: block;
                font-size: 1.2rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            
            .metric-status {
                height: 4px;
                border-radius: 2px;
            }
            
            .metric-status.good { background: #4caf50; }
            .metric-status.needs-improvement { background: #ff9800; }
            .metric-status.poor { background: #f44336; }
            
            .dashboard-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .dashboard-actions button {
                flex: 1;
                padding: 0.5rem;
                border: 1px solid #ccc;
                border-radius: 4px;
                background: #f5f5f5;
                cursor: pointer;
            }
            
            .performance-toggle {
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: #333;
                color: white;
                border: none;
                border-radius: 50%;
                width: 56px;
                height: 56px;
                font-size: 1.2rem;
                cursor: pointer;
                z-index: 9999;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Setup dashboard events
   */
  setupDashboardEvents() {
    const dashboard = document.getElementById('performance-dashboard');

    dashboard.querySelector('.close-dashboard').addEventListener('click', () => {
      dashboard.style.display = 'none';
    });
  }

  /**
   * Create performance toggle button
   */
  createPerformanceToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'performance-toggle';
    toggle.innerHTML = '⚡';
    toggle.setAttribute('aria-label', 'Toggle performance dashboard');
    toggle.setAttribute('title', 'Performance Dashboard');

    toggle.addEventListener('click', () => {
      const dashboard = document.getElementById('performance-dashboard');
      const isVisible = dashboard.style.display !== 'none';
      dashboard.style.display = isVisible ? 'none' : 'block';

      if (!isVisible) {
        this.updateDashboard();
      }
    });

    document.body.appendChild(toggle);
  }

  /**
   * Update dashboard with current metrics
   */
  updateDashboard() {
    const getValue = (id) => document.getElementById(id);
    const getStatus = (id) => document.getElementById(id);

    // Update values
    if (getValue('load-time-value')) {
      getValue('load-time-value').textContent = `${this.metrics.loadTime.toFixed(0)}ms`;
      this.updateMetricStatus('load-time-status', this.metrics.loadTime, this.thresholds.loadTime);
    }

    if (getValue('fcp-value')) {
      getValue('fcp-value').textContent = `${this.metrics.firstContentfulPaint.toFixed(0)}ms`;
      this.updateMetricStatus(
        'fcp-status',
        this.metrics.firstContentfulPaint,
        this.thresholds.firstContentfulPaint,
      );
    }

    if (getValue('lcp-value')) {
      getValue('lcp-value').textContent = `${this.metrics.largestContentfulPaint.toFixed(0)}ms`;
      this.updateMetricStatus(
        'lcp-status',
        this.metrics.largestContentfulPaint,
        this.thresholds.largestContentfulPaint,
      );
    }

    if (getValue('fid-value')) {
      getValue('fid-value').textContent = `${this.metrics.firstInputDelay.toFixed(0)}ms`;
      this.updateMetricStatus(
        'fid-status',
        this.metrics.firstInputDelay,
        this.thresholds.firstInputDelay,
      );
    }

    if (getValue('cls-value')) {
      getValue('cls-value').textContent = this.metrics.cumulativeLayoutShift.toFixed(3);
      this.updateMetricStatus(
        'cls-status',
        this.metrics.cumulativeLayoutShift,
        this.thresholds.cumulativeLayoutShift,
      );
    }

    if (getValue('score-value')) {
      const score = this.calculatePerformanceScore();
      getValue('score-value').textContent = score;
      this.updateScoreStatus('score-status', score);
    }
  }

  /**
   * Update metric status indicator
   */
  updateMetricStatus(elementId, value, threshold) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.className = 'metric-status';

    if (value <= threshold) {
      element.classList.add('good');
    } else if (value <= threshold * 1.5) {
      element.classList.add('needs-improvement');
    } else {
      element.classList.add('poor');
    }
  }

  /**
   * Update score status
   */
  updateScoreStatus(elementId, score) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.className = 'metric-status';

    if (score >= 90) {
      element.classList.add('good');
    } else if (score >= 50) {
      element.classList.add('needs-improvement');
    } else {
      element.classList.add('poor');
    }
  }

  /**
   * Auto-optimize performance
   */
  optimizePerformance() {
    console.log('🔧 Starting automatic performance optimization...');

    // Remove unused CSS
    this.removeUnusedCSS();

    // Optimize images
    this.optimizeImages();

    // Clean up memory
    this.cleanupMemory();

    // Optimize DOM
    this.optimizeDOM();

    console.log('✅ Performance optimization complete');
  }

  /**
   * Remove unused CSS (simplified)
   */
  removeUnusedCSS() {
    console.log('🧹 Cleaning up unused CSS...');
    // In a real implementation, this would analyze used CSS
  }

  /**
   * Clean up memory
   */
  cleanupMemory() {
    console.log('🗑️ Cleaning up memory...');

    // Clear old cache entries
    this.clearOldCacheEntries();

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  /**
   * Optimize DOM
   */
  optimizeDOM() {
    console.log('🌳 Optimizing DOM...');

    // Remove empty elements
    document.querySelectorAll('*').forEach((element) => {
      if (
        element.children.length === 0 &&
        !element.textContent.trim() &&
        !element.tagName.match(/^(img|input|br|hr)$/i)
      ) {
        element.remove();
      }
    });
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    return {
      metrics: this.metrics,
      score: this.calculatePerformanceScore(),
      recommendations: this.getRecommendations(),
    };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations() {
    const recommendations = [];

    if (this.metrics.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      recommendations.push('Optimize critical rendering path');
    }

    if (this.metrics.largestContentfulPaint > this.thresholds.largestContentfulPaint) {
      recommendations.push('Optimize images and preload resources');
    }

    if (this.metrics.firstInputDelay > this.thresholds.firstInputDelay) {
      recommendations.push('Reduce JavaScript execution time');
    }

    if (this.metrics.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      recommendations.push('Prevent layout shifts');
    }

    return recommendations;
  }
}

// Initialize performance optimization
document.addEventListener('DOMContentLoaded', () => {
  window.burniPerformance = new BURNIPerformanceOptimizer();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BURNIPerformanceOptimizer;
}
