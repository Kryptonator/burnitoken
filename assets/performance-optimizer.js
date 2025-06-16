// performance-optimizer.js - Ultra Performance Optimizations for 100% Score
(function () {
  'use strict';

  // Performance Monitoring with ES5 fallbacks
  var perfMonitor = {
    metrics: {},
    start: typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now(),

    mark: function (name) {
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark(name);
      }
      this.metrics[name] =
        typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    },

    measure: function (name, startMark, endMark) {
      if (typeof performance !== 'undefined' && performance.measure) {
        performance.measure(name, startMark, endMark);
      }
      var start = this.metrics[startMark] || this.start;
      var end =
        this.metrics[endMark] ||
        (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
      return end - start;
    },
  };

  // Ultra Critical Rendering Path Optimization
  function optimizeCriticalPath() {
    perfMonitor.mark('critical-path-start');

    // Aggressive DNS prefetch for external resources
    var dnsPrefetch = [
      '//fonts.googleapis.com',
      '//fonts.gstatic.com',
      '//cdn.jsdelivr.net',
      '//api.coingecko.com',
      '//cdnjs.cloudflare.com',
    ];

    for (var i = 0; i < dnsPrefetch.length; i++) {
      var link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = dnsPrefetch[i];
      document.head.appendChild(link);
    }

    // Preload and preconnect critical resources
    var criticalResources = [
      { href: 'https://fonts.gstatic.com', rel: 'preconnect', crossOrigin: true },
      { href: 'https://cdn.jsdelivr.net', rel: 'preconnect', crossOrigin: true },
      { href: '/assets/css/critical.css', rel: 'preload', as: 'style' },
      { href: '/assets/images/burni-logo.webp', rel: 'preload', as: 'image' },
    ];

    for (var j = 0; j < criticalResources.length; j++) {
      var resource = criticalResources[j];
      var link = document.createElement('link');
      link.rel = resource.rel;
      link.href = resource.href;
      if (resource.as) link.as = resource.as;
      if (resource.crossOrigin) link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // Preload critical fonts with font-display swap
    var fontPreloads = [
      'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2',
      'https://fonts.gstatic.com/s/baloo2/v3/wXKrE3kTposypRyd76j0_w.woff2',
    ];

    for (var k = 0; k < fontPreloads.length; k++) {
      var fontUrl = fontPreloads[k];
      var link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    perfMonitor.mark('critical-path-end');
  }

  // Aggressive Image Optimization
  function optimizeImages() {
    perfMonitor.mark('image-opt-start');

    // WebP Detection and Replacement
    function supportsWebP() {
      return new Promise(function (resolve) {
        const webP = new Image();
        webP.onload = webP.onerror = function () {
          resolve(webP.height === 2);
        };
        webP.src =
          'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });
    }

    supportsWebP().then(function (supported) {
      document.documentElement.classList.add(supported ? 'webp' : 'no-webp');

      // Progressive image loading with WebP fallback
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(function (img) {
        const webpSrc = img.dataset.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const fallbackSrc = img.dataset.src;

        if (supported) {
          // Check if WebP version exists
          const testImg = new Image();
          testImg.onload = function () {
            img.src = webpSrc;
            img.classList.add('loaded');
          };
          testImg.onerror = function () {
            img.src = fallbackSrc;
            img.classList.add('loaded');
          };
          testImg.src = webpSrc;
        } else {
          img.src = fallbackSrc;
          img.classList.add('loaded');
        }
      });
    });

    perfMonitor.mark('image-opt-end');
  }

  // Advanced Lazy Loading
  function setupAdvancedLazyLoading() {
    perfMonitor.mark('lazy-loading-start');

    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
    };

    function lazyLoad(entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const element = entry.target;

          if (element.tagName === 'IMG') {
            if (element.dataset.src) {
              element.src = element.dataset.src;
              element.classList.add('loaded');
            }
          } else if (element.dataset.background) {
            element.style.backgroundImage = 'url(' + element.dataset.background + ')';
            element.classList.add('loaded');
          }

          observer.unobserve(element);
        }
      });
    }

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(lazyLoad, observerOptions);

      // Observe images and background elements
      const lazyElements = document.querySelectorAll('[data-src], [data-background]');
      lazyElements.forEach(function (el) {
        imageObserver.observe(el);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      optimizeImages();
    }

    perfMonitor.mark('lazy-loading-end');
  }

  // Resource Prioritization
  function prioritizeResources() {
    perfMonitor.mark('resource-priority-start');

    // Critical CSS inlining detection
    const criticalCSS = document.querySelector('link[href*="critical.css"]');
    if (criticalCSS) {
      criticalCSS.onload = function () {
        document.documentElement.classList.add('critical-css-loaded');
      };
    }

    // Defer non-critical scripts
    const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
    nonCriticalScripts.forEach(function (script) {
      script.defer = true;
    });

    // Preload next navigation resources
    const navigationLinks = document.querySelectorAll('a[href^="/"], a[href^="./"]');
    const preloadedUrls = new Set();

    navigationLinks.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        const url = this.href;
        if (!preloadedUrls.has(url)) {
          const preload = document.createElement('link');
          preload.rel = 'prefetch';
          preload.href = url;
          document.head.appendChild(preload);
          preloadedUrls.add(url);
        }
      });
    });

    perfMonitor.mark('resource-priority-end');
  }

  // CSS Animation Performance
  function optimizeAnimations() {
    perfMonitor.mark('animation-opt-start');

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    }

    // GPU acceleration for animated elements
    const animatedElements = document.querySelectorAll('.animate, .transition, [class*="hover:"]');
    animatedElements.forEach(function (el) {
      el.style.willChange = 'transform, opacity';
      el.style.transform = 'translateZ(0)';
    });

    // Pause animations when not visible
    if ('IntersectionObserver' in window) {
      const animationObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          const element = entry.target;
          if (entry.isIntersecting) {
            element.style.animationPlayState = 'running';
          } else {
            element.style.animationPlayState = 'paused';
          }
        });
      });

      animatedElements.forEach(function (el) {
        animationObserver.observe(el);
      });
    }

    perfMonitor.mark('animation-opt-end');
  }

  // Memory Management
  function optimizeMemory() {
    perfMonitor.mark('memory-opt-start');

    // Clean up unused images
    function cleanupImages() {
      const images = document.querySelectorAll('img');
      images.forEach(function (img) {
        if (!img.complete || img.naturalHeight === 0) {
          img.loading = 'lazy';
        }
      });
    }

    // Debounced scroll handler
    let scrollTimeout;
    function handleScroll() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        // Clean up off-screen elements
        cleanupImages();
      }, 100);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Memory leak prevention
    window.addEventListener('beforeunload', function () {
      // Clear timers and observers
      clearTimeout(scrollTimeout);

      // Remove event listeners
      window.removeEventListener('scroll', handleScroll);
    });

    perfMonitor.mark('memory-opt-end');
  }

  // Core Web Vitals Optimization
  function optimizeCoreWebVitals() {
    perfMonitor.mark('cwv-opt-start');

    // Largest Contentful Paint (LCP) optimization
    function optimizeLCP() {
      // Preload LCP image
      const heroImage = document.querySelector('.hero img, .banner img, [data-lcp]');
      if (heroImage && heroImage.src) {
        const preload = document.createElement('link');
        preload.rel = 'preload';
        preload.href = heroImage.src;
        preload.as = 'image';
        document.head.appendChild(preload);
      }
    }

    // First Input Delay (FID) optimization
    function optimizeFID() {
      // Break up long tasks
      function yieldToMain() {
        return new Promise(function (resolve) {
          setTimeout(resolve, 0);
        });
      }

      // Use scheduler if available
      if ('scheduler' in window && 'postTask' in scheduler) {
        scheduler.postTask(optimizeLCP, { priority: 'user-blocking' });
      } else {
        setTimeout(optimizeLCP, 0);
      }
    }

    // Cumulative Layout Shift (CLS) optimization
    function optimizeCLS() {
      // Reserve space for images
      const images = document.querySelectorAll('img:not([width]):not([height])');
      images.forEach(function (img) {
        img.style.aspectRatio = '16 / 9'; // Default aspect ratio
      });

      // Preload fonts to prevent FOUT
      const fontFaces = ['Inter', 'Baloo 2'];

      fontFaces.forEach(function (fontFamily) {
        if (document.fonts && document.fonts.load) {
          document.fonts.load('1em ' + fontFamily);
        }
      });
    }

    optimizeLCP();
    optimizeFID();
    optimizeCLS();

    perfMonitor.mark('cwv-opt-end');
  }

  // Network Optimization
  function optimizeNetwork() {
    perfMonitor.mark('network-opt-start');

    // Service Worker registration with performance monitoring
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(function (registration) {
        perfMonitor.mark('sw-registered');

        // Update available notification
        registration.addEventListener('updatefound', function () {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', function () {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Show update notification
              console.log('App update available');
            }
          });
        });
      });
    }

    // Adaptive loading based on connection
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const slowConnection =
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.saveData;

      if (slowConnection) {
        document.documentElement.classList.add('slow-connection');
        // Reduce image quality, disable non-essential features
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(function (img) {
          if (img.dataset.lowRes) {
            img.dataset.src = img.dataset.lowRes;
          }
        });
      }
    }

    perfMonitor.mark('network-opt-end');
  }

  // Initialize all optimizations
  function initializePerformanceOptimizations() {
    perfMonitor.mark('init-start');

    // Run immediately
    optimizeCriticalPath();
    optimizeCoreWebVitals();

    // Run when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setupAdvancedLazyLoading();
        prioritizeResources();
        optimizeAnimations();
        optimizeMemory();
        optimizeNetwork();
      });
    } else {
      setupAdvancedLazyLoading();
      prioritizeResources();
      optimizeAnimations();
      optimizeMemory();
      optimizeNetwork();
    }

    // Performance reporting
    window.addEventListener('load', function () {
      perfMonitor.mark('init-complete');

      setTimeout(function () {
        const totalTime = perfMonitor.measure('total-optimization', 'init-start', 'init-complete');
        console.log('Performance optimizations completed in', Math.round(totalTime), 'ms');

        // Report Core Web Vitals if available
        if ('performance' in window && 'getEntriesByType' in performance) {
          const paintEntries = performance.getEntriesByType('paint');
          paintEntries.forEach(function (entry) {
            console.log(entry.name + ':', Math.round(entry.startTime), 'ms');
          });
        }

        // Send to analytics if available
        if (window.gtag) {
          gtag('event', 'performance_optimized', {
            optimization_time: Math.round(totalTime),
          });
        }
      }, 1000);
    });

    perfMonitor.mark('init-complete');
  }

  // Start performance optimizations
  initializePerformanceOptimizations();

  // Export for testing
  window.perfOptimizer = {
    monitor: perfMonitor,
    optimize: {
      images: optimizeImages,
      animations: optimizeAnimations,
      network: optimizeNetwork,
      memory: optimizeMemory,
    },
  };
})();
