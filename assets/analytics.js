/**
 * Advanced Analytics and Performance Monitoring
 * For Burni Token Website
 */

(function () {
  'use strict';

  // Avoid duplicate initialization
  if (window.BurniAnalytics) {
    console.log('BurniAnalytics already exists, skipping initialization');
    return;
  }

  class BurniAnalytics {
    constructor() {
      this.sessionId = this.generateSessionId();
      this.startTime = Date.now();
      this.pageViews = [];
      this.interactions = [];
      this.performanceMetrics = {};
      this.isOnline = navigator.onLine;
      this.isSafari = this.detectSafari();

      this.init();
    }

    detectSafari() {
      return (
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
        (/WebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
      );
    }

    generateSessionId() {
      return `burni_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    init() {
      // Track page load
      this.trackPageLoad();

      // Track performance metrics
      this.trackPerformanceMetrics();

      // Track user interactions
      this.setupInteractionTracking();

      // Track network status
      this.setupNetworkTracking();

      // Track visibility changes
      this.setupVisibilityTracking();

      // Setup error tracking
      this.setupErrorTracking();

      // Setup periodic data transmission
      this.setupDataTransmission();

      // Mark analytics as ready for E2E tests (Safari-compatible timing)
      const markReady = () => {
        document.body.setAttribute('data-analytics-ready', 'true');
        console.log('Burni Analytics initialized with session:', this.sessionId);
      };

      // Always mark ready immediately for tests
      markReady();

      // Setup real-time features
      this.setupRealTimeFeatures();

      // Initialize advanced PWA features
      this.initAdvancedPWA();
    }

    trackPageLoad() {
      const pageLoadData = {
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      this.pageViews.push(pageLoadData);
      this.sendAnalyticsEvent('page_view', pageLoadData);
    }

    trackPerformanceMetrics() {
      // Wait for page load to complete
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          const paintEntries = performance.getEntriesByType('paint');

          this.performanceMetrics = {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            navigationTiming: {
              domContentLoaded:
                perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
              responseTime: perfData.responseEnd - perfData.requestStart,
              domInteractive: perfData.domInteractive - perfData.navigationStart,
            },
            paintTiming: {
              firstPaint: paintEntries.find((p) => p.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint:
                paintEntries.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
            },
            resourceTiming: this.analyzeResourceLoading(),
            coreWebVitals: this.measureCoreWebVitals(),
          };

          this.sendAnalyticsEvent('performance_metrics', this.performanceMetrics);
        }, 1000);
      });
    }

    analyzeResourceLoading() {
      const resources = performance.getEntriesByType('resource');
      const analysis = {
        totalResources: resources.length,
        totalSize: 0,
        slowestResource: null,
        resourcesByType: {},
      };

      let slowestTime = 0;

      resources.forEach((resource) => {
        const type = this.getResourceType(resource.name);
        if (!analysis.resourcesByType[type]) {
          analysis.resourcesByType[type] = { count: 0, totalTime: 0 };
        }

        analysis.resourcesByType[type].count++;
        analysis.resourcesByType[type].totalTime += resource.responseEnd - resource.startTime;

        if (resource.transferSize) {
          analysis.totalSize += resource.transferSize;
        }

        if (resource.responseEnd - resource.startTime > slowestTime) {
          slowestTime = resource.responseEnd - resource.startTime;
          analysis.slowestResource = {
            name: resource.name,
            duration: slowestTime,
            size: resource.transferSize,
          };
        }
      });

      return analysis;
    }

    getResourceType(url) {
      if (url.includes('.css')) return 'stylesheet';
      if (url.includes('.js')) return 'script';
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
      if (url.includes('font')) return 'font';
      return 'other';
    }

    measureCoreWebVitals() {
      const vitals = {};

      // Try to measure LCP (Largest Contentful Paint)
      try {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
          this.sendAnalyticsEvent('core_web_vital', { metric: 'LCP', value: vitals.lcp });
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP measurement not supported');
      }

      // Try to measure FID (First Input Delay)
      try {
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            vitals.fid = entry.processingStart - entry.startTime;
            this.sendAnalyticsEvent('core_web_vital', { metric: 'FID', value: vitals.fid });
          }
        }).observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID measurement not supported');
      }

      // Try to measure CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
          this.sendAnalyticsEvent('core_web_vital', { metric: 'CLS', value: vitals.cls });
        }).observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS measurement not supported');
      }

      return vitals;
    }

    setupInteractionTracking() {
      // Track clicks
      document.addEventListener('click', (event) => {
        this.trackInteraction('click', {
          element: event.target.tagName,
          className: event.target.className,
          id: event.target.id,
          text: event.target.textContent?.substring(0, 50),
          x: event.clientX,
          y: event.clientY,
        });
      });

      // Track form submissions
      document.addEventListener('submit', (event) => {
        this.trackInteraction('form_submit', {
          formId: event.target.id,
          formClass: event.target.className,
          formAction: event.target.action,
        });
      });

      // Track scroll behavior
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.trackInteraction('scroll', {
            scrollY: window.scrollY,
            maxScroll: document.body.scrollHeight - window.innerHeight,
            scrollPercent: Math.round(
              (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100,
            ),
          });
        }, 250);
      });

      // Track time on page
      window.addEventListener('beforeunload', () => {
        this.trackInteraction('page_exit', {
          timeOnPage: Date.now() - this.startTime,
          scrollDepth: Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100,
          ),
        });
      });
    }

    setupNetworkTracking() {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.sendAnalyticsEvent('network_status', { status: 'online', timestamp: Date.now() });
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.sendAnalyticsEvent('network_status', { status: 'offline', timestamp: Date.now() });
      });
    }

    setupVisibilityTracking() {
      document.addEventListener('visibilitychange', () => {
        this.sendAnalyticsEvent('visibility_change', {
          hidden: document.hidden,
          timestamp: Date.now(),
          timeOnPage: Date.now() - this.startTime,
        });
      });
    }

    setupErrorTracking() {
      // Track JavaScript errors
      window.addEventListener('error', (event) => {
        this.trackError(new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript_error',
        });
      });

      // Track unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(new Error(event.reason), {
          type: 'unhandled_promise_rejection',
        });
      });
    }

    setupDataTransmission() {
      // Send data every 30 seconds if there's new data
      setInterval(() => {
        this.sendQueuedData();
      }, 30000);

      // Send data before page unload
      window.addEventListener('beforeunload', () => {
        this.sendQueuedData();
      });
    }

    setupRealTimeFeatures() {
      // Real-time price monitoring
      this.initPriceMonitoring();

      // WebSocket connection for live data
      this.initWebSocketConnection();

      // Background sync for offline actions
      this.initBackgroundSync();

      // Push notifications setup
      this.initPushNotifications();
    }

    initPriceMonitoring() {
      // Monitor BURNI, XRP, XPM prices in real-time
      setInterval(() => {
        this.fetchPriceData();
      }, 30000); // Every 30 seconds
    }

    async fetchPriceData() {
      try {
        // Simulate API call - replace with actual endpoints
        const response = await fetch('/api/prices', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {
          const priceData = await response.json();
          this.updatePriceDisplay(priceData);
          this.trackEvent('price_update', { timestamp: Date.now(), ...priceData });
        }
      } catch (error) {
        console.log('Price fetch failed, using cached data');
        this.handleOfflinePrice();
      }
    }

    updatePriceDisplay(priceData) {
      // Update price elements with real-time data
      const priceElements = {
        'burni-price': priceData.burni || '$0.0011',
        'xrp-price': priceData.xrp || '$0.50',
        'xpm-price': priceData.xpm || '$0.02',
      };

      Object.entries(priceElements).forEach(([id, price]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = price;
          element.style.animation = 'priceUpdate 0.5s ease-in-out';
        }
      });
    }

    initWebSocketConnection() {
      if (typeof WebSocket !== 'undefined') {
        try {
          // Replace with actual WebSocket endpoint
          this.ws = new WebSocket('wss://api.burnitoken.website/ws');

          this.ws.onopen = () => {
            console.log('🔗 Real-time connection established');
            this.trackEvent('websocket_connected');
          };

          this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealTimeData(data);
          };

          this.ws.onerror = () => {
            console.log('⚠️ WebSocket connection failed, using polling');
            this.fallbackToPolling();
          };
        } catch (error) {
          this.fallbackToPolling();
        }
      }
    }

    handleRealTimeData(data) {
      switch (data.type) {
        case 'price_update':
          this.updatePriceDisplay(data.payload);
          break;
        case 'burn_event':
          this.showBurnNotification(data.payload);
          break;
        case 'community_update':
          this.updateCommunityStats(data.payload);
          break;
      }
    }

    initBackgroundSync() {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          // Register background sync for offline actions
          registration.sync.register('background-sync');
          this.trackEvent('background_sync_registered');
        });
      }
    }

    initPushNotifications() {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        // Request notification permission
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            this.setupPushSubscription();
            this.trackEvent('notifications_enabled');
          }
        });
      }
    }

    async setupPushSubscription() {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array('your-vapid-public-key'), // Replace with actual key
        });

        // Send subscription to server
        await this.sendSubscriptionToServer(subscription);
      } catch (error) {
        console.log('Push subscription failed:', error);
      }
    }

    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    // Advanced PWA Features
    initAdvancedPWA() {
      this.setupAppInstallPrompt();
      this.initAppShortcuts();
      this.setupShareAPI();
      this.initAppBadging();
    }

    setupAppInstallPrompt() {
      let deferredPrompt;

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        this.showInstallButton(deferredPrompt);
      });
    }

    showInstallButton(deferredPrompt) {
      const installButton = document.createElement('button');
      installButton.textContent = '📱 Install App';
      installButton.className = 'install-btn';
      installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(238,90,36,0.4);
      `;

      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          this.trackEvent('app_install_prompt', { outcome });
          deferredPrompt = null;
          installButton.remove();
        }
      });

      document.body.appendChild(installButton);
    }

    initAppShortcuts() {
      // App shortcuts are defined in manifest.json
      // Track shortcut usage
      const urlParams = new URLSearchParams(window.location.search);
      const shortcut = urlParams.get('shortcut');
      if (shortcut) {
        this.trackEvent('app_shortcut_used', { shortcut });
      }
    }

    setupShareAPI() {
      if (navigator.share) {
        // Add share buttons where needed
        document.addEventListener('click', (e) => {
          if (e.target.classList.contains('share-btn')) {
            this.shareContent(e.target.dataset.url, e.target.dataset.title);
          }
        });
      }
    }

    async shareContent(url, title) {
      try {
        await navigator.share({
          title: title || 'Burni Token - Deflationary XRPL Token',
          text: 'Check out Burni Token - the deflationary token creating value through scarcity!',
          url: url || window.location.href,
        });
        this.trackEvent('content_shared', { url, title });
      } catch (error) {
        // Fallback to clipboard
        this.copyToClipboard(url || window.location.href);
      }
    }

    initAppBadging() {
      if ('setAppBadge' in navigator) {
        // Update app badge with unread notifications count
        this.updateAppBadge(0);
      }
    }

    updateAppBadge(count) {
      if ('setAppBadge' in navigator) {
        if (count > 0) {
          navigator.setAppBadge(count);
        } else {
          navigator.clearAppBadge();
        }
      }
    }

    trackInteraction(type, data) {
      const interaction = {
        type,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        ...data,
      };

      this.interactions.push(interaction);

      // Send critical interactions immediately
      if (['error', 'form_submit'].includes(type)) {
        this.sendAnalyticsEvent('interaction', interaction);
      }
    }

    trackCustomEvent(eventName, eventData = {}) {
      const eventObj = {
        name: eventName,
        data: eventData,
        timestamp: Date.now(),
        sessionId: this.sessionId,
      };

      // Store locally for session data
      this.interactions.push(eventObj);

      // Send to analytics
      this.sendAnalyticsEvent('custom_event', eventObj);
    }

    trackError(error, context = {}) {
      const errorObj = {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        context,
      };

      // Store locally for session data
      this.interactions.push({
        type: 'error',
        timestamp: Date.now(),
        sessionId: this.sessionId,
        data: errorObj,
      });

      // Send to analytics
      this.sendAnalyticsEvent('error', errorObj);
    }

    sendAnalyticsEvent(eventType, eventData) {
      // In production, this would send to your analytics endpoint
      if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') {
        console.log(`Analytics Event [${eventType}]:`, eventData);
        return;
      }

      // Store for offline sending if needed
      if (!this.isOnline) {
        this.storeOfflineEvent(eventType, eventData);
        return;
      }

      // Send to analytics endpoint
      this.sendToEndpoint(eventType, eventData);
    }

    sendToEndpoint(eventType, eventData) {
      const payload = {
        eventType,
        eventData,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Use sendBeacon for better reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/analytics', JSON.stringify(payload));
      } else {
        // Fallback to fetch
        fetch('/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch((error) => {
          console.warn('Analytics send failed:', error);
        });
      }
    }

    storeOfflineEvent(eventType, eventData) {
      try {
        const offlineEvents = JSON.parse(localStorage.getItem('burni_offline_analytics') || '[]');
        offlineEvents.push({ eventType, eventData, timestamp: Date.now() });

        // Limit offline storage to prevent memory issues
        if (offlineEvents.length > 100) {
          offlineEvents.splice(0, 50);
        }

        localStorage.setItem('burni_offline_analytics', JSON.stringify(offlineEvents));
      } catch (error) {
        console.warn('Failed to store offline analytics:', error);
      }
    }

    sendQueuedData() {
      // Send queued interactions
      if (this.interactions.length > 0) {
        this.sendAnalyticsEvent('interaction_batch', {
          interactions: this.interactions.splice(0, 10), // Send in batches
        });
      }

      // Send offline events when back online
      if (this.isOnline) {
        this.sendOfflineEvents();
      }
    }

    sendOfflineEvents() {
      try {
        const offlineEvents = JSON.parse(localStorage.getItem('burni_offline_analytics') || '[]');
        if (offlineEvents.length > 0) {
          this.sendAnalyticsEvent('offline_events_batch', { events: offlineEvents });
          localStorage.removeItem('burni_offline_analytics');
        }
      } catch (error) {
        console.warn('Failed to send offline events:', error);
      }
    }

    // Public API methods
    trackPageView(page) {
      this.trackCustomEvent('manual_page_view', { page });
    }

    trackConversion(type, value = null) {
      this.trackCustomEvent('conversion', { type, value });
    }

    trackFeatureUsage(feature, action) {
      this.trackCustomEvent('feature_usage', { feature, action });
    }

    getSessionData() {
      return {
        sessionId: this.sessionId,
        duration: Date.now() - this.startTime,
        pageViews: this.pageViews.length,
        interactions: this.interactions.length,
        performance: this.performanceMetrics,
      };
    }
  }

  // Global analytics instance
  window.BurniAnalytics = new BurniAnalytics();

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BurniAnalytics;
  }
})(); // End of IIFE
