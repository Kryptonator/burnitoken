// ultra-performance.js - 100% Performance Score Optimizations
(function () {
  'use strict';

  // Ultra-aggressive performance optimizations
  var UltraPerf = {
    // Immediate DOM optimizations
    optimizeDOM: function () {
      // Critical CSS already loaded, optimize remaining
      this.optimizeImages();
      this.preloadCriticalResources();
      this.optimizeAnimations();
      this.deferNonCritical();
    },

    // Aggressive image optimization with IntersectionObserver
    optimizeImages: function () {
      var images = document.querySelectorAll('img[data-src], img[loading="lazy"]');

      if ('IntersectionObserver' in window) {
        var imageObserver = new IntersectionObserver(
          function (entries, observer) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                var img = entry.target;
                if (img.dataset.src) {
                  img.src = img.dataset.src;
                  img.removeAttribute('data-src');
                }
                img.classList.add('loaded');
                observer.unobserve(img);
              }
            });
          },
          {
            rootMargin: '50px',
          },
        );

        for (var i = 0; i < images.length; i++) {
          imageObserver.observe(images[i]);
        }
      } else {
        // Fallback for browsers without IntersectionObserver
        for (var j = 0; j < images.length; j++) {
          var img = images[j];
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
        }
      }
    },

    // Preload critical above-the-fold resources
    preloadCriticalResources: function () {
      var criticalResources = [
        '/assets/css/styles.min.css',
        '/assets/images/burni-logo.webp',
        '/assets/images/burni-chart.webp',
      ];

      for (var i = 0; i < criticalResources.length; i++) {
        var link = document.createElement('link');
        link.rel = 'preload';
        link.href = criticalResources[i];

        if (criticalResources[i].endsWith('.css')) {
          link.as = 'style';
        } else if (criticalResources[i].match(/\.(webp|jpg|png)$/)) {
          link.as = 'image';
        }

        document.head.appendChild(link);
      }
    },

    // Optimize animations for 60fps
    optimizeAnimations: function () {
      // Force hardware acceleration on animated elements
      var animatedElements = document.querySelectorAll(
        '.animate-spin, .animate-pulse, .animate-bounce',
      );
      for (var i = 0; i < animatedElements.length; i++) {
        var element = animatedElements[i];
        element.style.willChange = 'transform';
        element.style.transform = 'translateZ(0)';
        element.style.backfaceVisibility = 'hidden';
      }
    },

    // Defer non-critical resources
    deferNonCritical: function () {
      // Defer non-critical CSS
      var nonCriticalCSS = [
        '/assets/css/responsive-enhancements.css',
        '/assets/css/styles-compat.css',
      ];

      for (var i = 0; i < nonCriticalCSS.length; i++) {
        this.loadCSS(nonCriticalCSS[i]);
      }
    },

    // Asynchronous CSS loading
    loadCSS: function (href) {
      var link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'style';
      link.onload = function () {
        this.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    },

    // Core Web Vitals optimization
    optimizeCoreWebVitals: function () {
      // LCP optimization
      this.optimizeLCP();

      // FID optimization
      this.optimizeFID();

      // CLS optimization
      this.optimizeCLS();
    },

    // Largest Contentful Paint optimization
    optimizeLCP: function () {
      // Ensure hero image is preloaded
      var heroImage = document.querySelector('.hero-section img');
      if (heroImage && !heroImage.complete) {
        var preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = heroImage.src || heroImage.dataset.src;
        document.head.appendChild(preloadLink);
      }
    },

    // First Input Delay optimization
    optimizeFID: function () {
      // Break up long tasks
      var heavyTasks = [];

      function runTask() {
        if (heavyTasks.length > 0) {
          var task = heavyTasks.shift();
          task();

          if (heavyTasks.length > 0) {
            setTimeout(runTask, 0);
          }
        }
      }

      // Schedule heavy tasks
      window.scheduleTask = function (task) {
        heavyTasks.push(task);
        if (heavyTasks.length === 1) {
          setTimeout(runTask, 0);
        }
      };
    },

    // Cumulative Layout Shift optimization
    optimizeCLS: function () {
      // Set explicit dimensions for images
      var images = document.querySelectorAll('img:not([width]):not([height])');
      for (var i = 0; i < images.length; i++) {
        var img = images[i];
        // Set aspect ratio to prevent layout shift
        img.style.aspectRatio = '16/9';
        img.style.objectFit = 'cover';
      }

      // Reserve space for dynamic content
      var dynamicElements = document.querySelectorAll('[data-dynamic]');
      for (var j = 0; j < dynamicElements.length; j++) {
        var element = dynamicElements[j];
        element.style.minHeight = element.dataset.minHeight || '200px';
      }
    },

    // Memory optimization
    optimizeMemory: function () {
      // Clean up unused variables
      window.addEventListener('beforeunload', function () {
        // Clear intervals and timeouts
        var highestTimeoutId = setTimeout(function () {}, 0);
        for (var i = 0; i < highestTimeoutId; i++) {
          clearTimeout(i);
        }

        var highestIntervalId = setInterval(function () {}, 9999);
        for (var j = 0; j < highestIntervalId; j++) {
          clearInterval(j);
        }
      });
    },

    // Network optimization
    optimizeNetwork: function () {
      // Implement aggressive caching
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then(function (registration) {
            console.log('SW registered with aggressive caching');
          })
          .catch(function (error) {
            console.log('SW registration failed');
          });
      }
    },

    // Initialize all optimizations
    init: function () {
      var self = this;

      // Immediate optimizations
      this.optimizeDOM();
      this.optimizeCoreWebVitals();

      // Post-load optimizations
      window.addEventListener('load', function () {
        self.optimizeMemory();
        self.optimizeNetwork();
      });

      // Performance monitoring
      if ('performance' in window && performance.mark) {
        performance.mark('ultra-perf-init');
      }
    },
  };

  // Initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      UltraPerf.init();
    });
  } else {
    UltraPerf.init();
  }

  // Export for global access
  window.UltraPerf = UltraPerf;
})();
