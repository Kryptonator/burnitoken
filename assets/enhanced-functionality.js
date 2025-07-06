// Enhanced JavaScript Functionality for Burnitoken Website
// Provides maximum browser compatibility and advanced features

(function () {
  'use strict';

  // Global namespace for Burnitoken functions
  window.BurniToken = window.BurniToken || {};

  // Enhanced mobile detection
  BurniToken.device = {
    isMobile: function () {
      return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent),
        ) || window.innerWidth <= 768
      );
    },
    isTablet: function () {
      return (
        /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) ||
        (window.innerWidth > 768 && window.innerWidth <= 1024)
      );
    },
    isIOS: function () {
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },
    isAndroid: function () {
      return /Android/i.test(navigator.userAgent);
    },
    isSafari: function () {
      return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    },
    isIE: function () {
      return /MSIE|Trident/.test(navigator.userAgent);
    },
  };

  // Enhanced performance monitoring
  BurniToken.performance = {
    start: Date.now(),
    marks: {},

    mark: function (name) {
      this.marks[name] = Date.now();
      if (window.performance && window.performance.mark) { 
        window.performance.mark(name);
      }
    },

    measure: function (name, startMark, endMark) {
      var startTime = this.marks[startMark] || this.start;
      var endTime = this.marks[endMark] || Date.now();
      var duration = endTime - startTime;

      console.log('Performance: ' + name + ' took ' + duration + 'ms');

      if (window.performance && window.performance.measure) { 
        try {
          window.performance.measure(name, startMark, endMark);
        } catch (e) {
          // Ignore errors in legacy browsers
        }
      }

      return duration;
    },

    getMetrics: function () {
      if (window.performance && window.performance.getEntriesByType) { 
        return {
          navigation: window.performance.getEntriesByType('navigation')[0],
          paint: window.performance.getEntriesByType('paint'),
          marks: window.performance.getEntriesByType('mark'),
          measures: window.performance.getEntriesByType('measure'),
        };
      }
      return null;
    },
  };

  // Enhanced error handling
  BurniToken.errorHandler = {
    errors: [],

    log: function (error, context) {
      var errorInfo = {
        message: error.message || error,
        stack: error.stack || 'No stack trace',
        context: context || 'Unknown',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      this.errors.push(errorInfo);
      console.error('BurniToken Error:', errorInfo);

      // Show user-friendly message for critical errors
      if (context === 'critical') { 
        this.showUserNotification(
          'Ein technischer Fehler ist aufgetreten. Die Seite wird neu geladen.'),
          'error',
        );
        setTimeout(function () {
          window.location.reload();
        }, 3000);
      }
    },

    showUserNotification: function (message, type) {
      var notification = document.createElement('div');
      notification.className = 'user-notification ' + (type || 'info');
      notification.innerHTML =
        '<span>' + message + '</span><button onclick="this.parentElement.remove()">×</button>';
      notification.style.cssText =
        'position:fixed;top:20px;right:20px;background:' +
        (type === 'error' ? '#ef4444' : '#10b981') +
        ';color:white;padding:12px 16px;border-radius:8px;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;max-width:300px;animation:slideIn 0.3s ease;';

      document.body.appendChild(notification);

      // Auto-remove after 5 seconds
      setTimeout(function () {
        if (notification.parentElement) { 
          notification.remove();
        }
      }, 5000);
    },
  };

  // Enhanced API management
  BurniToken.api = {
    cache: {},
    cacheDuration: 5 * 60 * 1000, // 5 minutes

    fetch: function (url, options) {
      var self = this;
      var cacheKey = url + JSON.stringify(options || {});
      var cachedData = this.cache[cacheKey];

      // Return cached data if available and not expired
      if (cachedData && Date.now() - cachedData.timestamp < this.cacheDuration) { 
        return Promise.resolve(cachedData.data);
      }

      // Use native fetch or polyfill
      var fetchPromise = window.fetch
        ? window.fetch(url, options)
        : this.fallbackFetch(url, options);

      return fetchPromise
        .then(function (response) {
          if (!response.ok) { 
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
          }
          return response.json();
        })
        .then(function (data) {
          // Cache successful responses
          self.cache[cacheKey] = {
            data: data,
            timestamp: Date.now(),
          };
          return data;
        })
        .catch(function (error) {
          BurniToken.errorHandler.log(error, 'api-fetch');
          throw error;
        });
    },

    fallbackFetch: function (url, options) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open((options && options.method) || 'GET', url);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) { 
            resolve({
              ok: true),
              status: xhr.status,
              json: function () {
                return Promise.resolve(JSON.parse(xhr.responseText));
              },
            });
          } else { 
            reject(new Error('HTTP ' + xhr.status));
          }
        };

        xhr.onerror = function () {
          reject(new Error('Network error'));
        };

        xhr.send((options && options.body) || null);
      });
    },
  };

  // Enhanced price management
  BurniToken.prices = {
    data: {},
    subscribers: [],
    updateInterval: null,

    subscribe: function (callback) {
      this.subscribers.push(callback);
    },

    unsubscribe: function (callback) {
      var index = this.subscribers.indexOf(callback);
      if (index > -1) { 
        this.subscribers.splice(index, 1);
      }
    },

    notify: function () {
      var self = this;
      this.subscribers.forEach(function (callback) {
        try {
          callback(self.data);
        } catch (error) {
          BurniToken.errorHandler.log(error, 'price-notification');
        }
      });
    },

    startUpdates: function () {
      var self = this;

      // Initial update
      this.updatePrices();

      // Set up periodic updates
      this.updateInterval = setInterval(function () {
        self.updatePrices();
      }, 30000); // Update every 30 seconds
    },

    stopUpdates: function () {
      if (this.updateInterval) { 
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    },

    updatePrices: function () {
      var self = this;

      // Update XRP price
      BurniToken.api
        .fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd')
        .then(function (data) {
          if (data && data.ripple && data.ripple.usd) { 
            self.data.xrp = data.ripple.usd;
            self.updateUI();
            self.notify();
          }
        })
        .catch(function (error) {
          console.warn('Failed to update XRP price:', error);
        });

      // Update BURNI price (mock data for now)
      this.data.burni = 0.000001;
      this.data.lastUpdate = new Date().toLocaleTimeString();

      this.updateUI();
      this.notify();
    },

    updateUI: function () {
      // Update XRP price displays
      var xrpElements = document.querySelectorAll(
        '#xrpPriceValue, #direct-xrp, [data-price="xrp"]'),
      );
      for (var i = 0; i < xrpElements.length; i++) {
        if (this.data.xrp) { 
          xrpElements[i].textContent = '$' + this.data.xrp.toFixed(4);
        }
      }

      // Update BURNI price displays
      var burniElements = document.querySelectorAll(
        '#burniPriceValue, #direct-burni, [data-price="burni"]'),
      );
      for (var i = 0; i < burniElements.length; i++) {
        if (this.data.burni) { 
          burniElements[i].textContent = '$' + this.data.burni.toFixed(6);
        }
      }

      // Update timestamp displays
      var updateElements = document.querySelectorAll('#direct-update, [data-update-time]');
      for (var i = 0; i < updateElements.length; i++) {
        if (this.data.lastUpdate) { 
          updateElements[i].textContent = this.data.lastUpdate;
        }
      }
    },
  };

  // Enhanced navigation
  BurniToken.navigation = {
    currentSection: 'hero',

    init: function () {
      this.setupMobileMenu();
      this.setupSmoothScrolling();
      this.setupSectionObserver();
      this.setupKeyboardNavigation();
    },

    setupMobileMenu: function () {
      var button = document.getElementById('mobile-menu-button');
      var menu = document.getElementById('mobile-menu');

      if (button && menu) { 
        button.addEventListener('click', function () {
          var isOpen = menu.classList.contains('show');
          if (isOpen) { 
            menu.classList.remove('show');
            button.setAttribute('aria-expanded', 'false');
          } else { 
            menu.classList.add('show');
            button.setAttribute('aria-expanded', 'true');
          }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
          if (!button.contains(e.target) && !menu.contains(e.target)) { 
            menu.classList.remove('show');
            button.setAttribute('aria-expanded', 'false');
          }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && menu.classList.contains('show')) { 
            menu.classList.remove('show');
            button.setAttribute('aria-expanded', 'false');
            button.focus();
          }
        });
      }
    },

    setupSmoothScrolling: function () {
      var links = document.querySelectorAll('a[href^="#"]');
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener(
          'click'),
          function (e) {
            e.preventDefault();
            var targetId = e.currentTarget.getAttribute('href').substring(1);
            var targetElement = document.getElementById(targetId);

            if (targetElement) { 
              var headerOffset = 80;
              var elementPosition = targetElement.getBoundingClientRect().top;
              var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

              // Use smooth scrolling if supported, otherwise use instant
              if ('scrollBehavior' in document.documentElement.style) { 
                window.scrollTo({
                  top: offsetPosition),
                  behavior: 'smooth',
                });
              } else { 
                window.scrollTo(0, offsetPosition);
              }

              // Update active navigation
              this.updateActiveNavigation(targetId);

              // Close mobile menu if open
              var mobileMenu = document.getElementById('mobile-menu');
              if (mobileMenu && mobileMenu.classList.contains('show')) { 
                mobileMenu.classList.remove('show');
                document
                  .getElementById('mobile-menu-button')
                  .setAttribute('aria-expanded', 'false');
              }
            }
          }.bind(this),
        );
      }
    },

    setupSectionObserver: function () {
      var sections = document.querySelectorAll('section[id]');
      var self = this;

      if (window.IntersectionObserver) { 
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) { 
                self.updateActiveNavigation(entry.target.id);
              }
            });
          },
          {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px',
          },
        );

        for (var i = 0; i < sections.length; i++) {
          observer.observe(sections[i]);
        }
      }
    },

    setupKeyboardNavigation: function () {
      // Tab navigation enhancement
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') { 
          document.body.classList.add('keyboard-navigation');
        }
      });

      document.addEventListener('mousedown', function () {
        document.body.classList.remove('keyboard-navigation');
      });
    },

    updateActiveNavigation: function (sectionId) {
      this.currentSection = sectionId;

      // Update navigation links
      var navLinks = document.querySelectorAll('.nav-link');
      for (var i = 0; i < navLinks.length; i++) {
        var href = navLinks[i].getAttribute('href');
        if (href === '#' + sectionId) { 
          navLinks[i].classList.add('active');
        } else { 
          navLinks[i].classList.remove('active');
        }
      }
    },
  };

  // Enhanced accessibility
  BurniToken.accessibility = {
    init: function () {
      this.setupFocusManagement();
      this.setupARIAUpdates();
      this.setupReducedMotion();
      this.setupHighContrast();
    },

    setupFocusManagement: function () {
      // Enhanced focus indicators
      var style = document.createElement('style');
      style.textContent = `
        .keyboard-navigation *:focus {
          outline: 3px solid #f97316 !important;
          outline-offset: 2px !important;
        }
        .keyboard-navigation *:focus:not(:focus-visible) {
          outline: none !important;
        }
      `;
      document.head.appendChild(style);
    },

    setupARIAUpdates: function () {
      // Dynamic ARIA updates for live regions
      var liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'live-region';
      document.body.appendChild(liveRegion);
    },

    announceToScreenReader: function (message) {
      var liveRegion = document.getElementById('live-region');
      if (liveRegion) { 
        liveRegion.textContent = message;
        setTimeout(function () {
          liveRegion.textContent = '';
        }, 1000);
      }
    },

    setupReducedMotion: function () {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { 
        document.documentElement.classList.add('reduced-motion');
      }
    },

    setupHighContrast: function () {
      if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) { 
        document.documentElement.classList.add('high-contrast');
      }
    },
  };

  // Initialize everything when DOM is ready
  function initialize() {
    BurniToken.performance.mark('init-start');

    try {
      // Initialize core modules
      BurniToken.navigation.init();
      BurniToken.accessibility.init();
      BurniToken.prices.startUpdates();

      // Browser-specific optimizations
      if (BurniToken.device.isIOS()) { 
        document.body.classList.add('ios-device');
      }

      if (BurniToken.device.isAndroid()) { 
        document.body.classList.add('android-device');
      }

      if (BurniToken.device.isMobile()) { 
        document.body.classList.add('mobile-device');
      }

      BurniToken.performance.mark('init-end');
      BurniToken.performance.measure('initialization', 'init-start', 'init-end');

      console.log('🚀 BurniToken enhanced functionality initialized successfully');
    } catch (error) {
      BurniToken.errorHandler.log(error, 'initialization');
    }
  }

  // Global error handler
  window.addEventListener('error', function (e) {
    BurniToken.errorHandler.log(e.error || e.message, 'global');
  });

  window.addEventListener('unhandledrejection', function (e) {
    BurniToken.errorHandler.log(e.reason, 'promise-rejection');
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') { 
    document.addEventListener('DOMContentLoaded', initialize);
  } else { 
    initialize();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', function () {
    BurniToken.prices.stopUpdates();
  });
})();
