// security.js - Sichere DOM-Manipulationen ohne innerHTML
class SecureDOM {
  static createSafeElement(tagName, className = '', textContent = '') {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }

  static createSafeHTML(template, data = {}) {
    // Template mit sicheren Ersetzungen
    const container = document.createElement('div');

    // Sichere Template-Engine ohne innerHTML
    const safeParts = template.split(/{{(\w+)}}/g);
    for (let i = 0; i < safeParts.length; i += 2) {
      if (safeParts[i]) {
        container.appendChild(document.createTextNode(safeParts[i]));
      }
      if (safeParts[i + 1] && data[safeParts[i + 1]]) {
        container.appendChild(document.createTextNode(data[safeParts[i + 1]]));
      }
    }

    return container;
  }

  static showNotification(message, type = 'info') {
    const notification = this.createSafeElement(
      'div',
      `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
      }`,
    );

    const icon = this.createSafeElement('span', 'mr-2');
    icon.textContent = type === 'error' ? '⚠️' : 'ℹ️';

    const text = this.createSafeElement('span', '', message);

    notification.appendChild(icon);
    notification.appendChild(text);

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 5000);
  }

  static createSecureTable(data, headers) {
    const table = this.createSafeElement(
      'table',
      'w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden',
    );
    const thead = this.createSafeElement('thead');
    const tbody = this.createSafeElement('tbody');

    // Header erstellen mit besseren Farben
    const headerRow = this.createSafeElement(
      'tr',
      'bg-gradient-to-r from-orange-500 to-orange-600',
    );
    headers.forEach((header) => {
      const th = this.createSafeElement(
        'th',
        'border border-orange-300 p-4 text-white font-bold text-left',
        header,
      );
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Daten-Rows erstellen mit alternativen Farben
    data.forEach((row, index) => {
      const isEven = index % 2 === 0;
      const rowClass = isEven ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50';
      const tr = this.createSafeElement('tr', rowClass);

      Object.values(row).forEach((cell, cellIndex) => {
        const cellText = String(cell);
        let cellClass = 'border border-gray-200 p-4 text-gray-800 font-medium';

        // Spezielle Formatierung für bestimmte Spalten
        if (cellIndex === 0) {
          // Datum
          cellClass += ' text-orange-600 font-semibold';
        } else if (cellIndex === 3) {
          // Remaining Coins
          cellClass += ' text-right font-mono text-green-700';
        }

        const td = this.createSafeElement('td', cellClass, cellText);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
  }
}

// Globale sichere Funktionen
window.SecureDOM = SecureDOM;

// Comprehensive Browser Compatibility & Performance Enhancements
(function () {
  'use strict';

  // Performance timing and metrics
  var perfMetrics = {
    start: performance.now(),
    domReady: 0,
    loadComplete: 0
  };

  // 1. Core JavaScript Features Polyfills
  
  // Array.from polyfill for IE11
  if (!Array.from) {
    Array.from = function(arrayLike, mapFn, thisArg) {
      var O = Object(arrayLike);
      var len = parseInt(O.length) || 0;
      var result = Array(len);
      for (var i = 0; i < len; i++) {
        result[i] = mapFn ? mapFn.call(thisArg, O[i], i) : O[i];
      }
      return result;
    };
  }

  // Object.assign polyfill for IE11
  if (!Object.assign) {
    Object.assign = function(target) {
      for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  }

  // Promise polyfill for IE11
  if (!window.Promise) {
    window.Promise = function(executor) {
      const self = this;
      self.state = 'pending';
      self.value = undefined;
      self.handlers = [];

      function resolve(result) {
        if (self.state === 'pending') {
          self.state = 'fulfilled';
          self.value = result;
          self.handlers.forEach(handle);
          self.handlers = null;
        }
      }

      function reject(error) {
        if (self.state === 'pending') {
          self.state = 'rejected';
          self.value = error;
          self.handlers.forEach(handle);
          self.handlers = null;
        }
      }

      function handle(handler) {
        if (self.state === 'pending') {
          self.handlers.push(handler);
        } else {
          if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
            handler.onFulfilled(self.value);
          }
          if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
            handler.onRejected(self.value);
          }
        }
      }

      this.then = function(onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
          handle({
            onFulfilled: function(result) {
              try {
                const returnValue = onFulfilled ? onFulfilled(result) : result;
                resolve(returnValue);
              } catch (ex) {
                reject(ex);
              }
            },
            onRejected: function(error) {
              try {
                const returnValue = onRejected ? onRejected(error) : error;
                reject(returnValue);
              } catch (ex) {
                reject(ex);
              }
            }
          });
        });
      };

      try {
        executor(resolve, reject);
      } catch (ex) {
        reject(ex);
      }
    };
  }

  // 2. DOM and Event Polyfills
  
  // addEventListener for IE8
  if (!window.addEventListener) {
    window.addEventListener = function(type, listener) {
      this.attachEvent('on' + type, listener);
    };
  }

  // querySelector for IE7
  if (!document.querySelector) {
    document.querySelector = function(selector) {
      const elements = document.querySelectorAll(selector);
      return elements.length ? elements[0] : null;
    };
  }

  // classList for IE9
  if (!('classList' in document.createElement('_'))) {
    (function(view) {
      const tokens = /\s+/;
      const ClassList = function(el) {
        this.el = el;
        const classes = el.className.replace(/^\s+|\s+$/g, '').split(tokens);
        for (let i = 0; i < classes.length; i++) {
          this[i] = classes[i];
        }
        this.length = classes.length;
      };
      
      ClassList.prototype = {
        add: function(token) {
          if (!this.contains(token)) {
            this.el.className += (this.el.className ? ' ' : '') + token;
          }
        },
        contains: function(token) {
          return this.el.className.indexOf(token) !== -1;
        },
        remove: function(token) {
          this.el.className = this.el.className.replace(new RegExp('\\b' + token + '\\b', 'g'), '');
        }
      };
      
      if (view.HTMLElement) {
        view.HTMLElement.prototype.classList = new ClassList();
      }
    })(window);
  }

  // 3. Modern Web APIs Polyfills
  
  // Intersection Observer Polyfill
  if (!('IntersectionObserver' in window)) {
    console.log('Loading IntersectionObserver polyfill');
    
    window.IntersectionObserver = function(callback, options) {
      this.callback = callback;
      this.options = options || {};
      this.observedElements = [];
    };

    window.IntersectionObserver.prototype.observe = function(element) {
      this.observedElements.push(element);
      // Immediate trigger for fallback
      setTimeout(() => {
        this.callback([{
          target: element,
          isIntersecting: true,
          intersectionRatio: 1
        }]);
      }, 100);
    };

    window.IntersectionObserver.prototype.unobserve = function(element) {
      const index = this.observedElements.indexOf(element);
      if (index > -1) {
        this.observedElements.splice(index, 1);
      }
    };

    window.IntersectionObserver.prototype.disconnect = function() {
      this.observedElements = [];
    };

    // Fallback lazy loading
    document.addEventListener('DOMContentLoaded', function () {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add('loaded');
        }
      });
    });
  }

  // fetch polyfill for IE11
  if (!window.fetch) {
    window.fetch = function(url, options) {
      return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        options = options || {};
        
        xhr.open(options.method || 'GET', url);
        
        if (options.headers) {
          Object.keys(options.headers).forEach(function(key) {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }
        
        xhr.onload = function() {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            text: function() {
              return Promise.resolve(xhr.responseText);
            },
            json: function() {
              return Promise.resolve(JSON.parse(xhr.responseText));
            }
          });
        };
        
        xhr.onerror = function() {
          reject(new TypeError('Network request failed'));
        };
        
        xhr.send(options.body);
      });
    };
  }

  // 4. CSS and Styling Enhancements
  
  // CSS Custom Properties fallback with comprehensive variable support
  if (!CSS || !CSS.supports || !CSS.supports('color', 'var(--fake-var)')) {
    const cssVars = {
      '--primary-color': '#f97316',
      '--secondary-color': '#ffffff',
      '--accent-color': '#1e40af',
      '--background-color': '#000000',
      '--text-color': '#ffffff',
      '--border-radius': '8px',
      '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      '--transition': 'all 0.3s ease'
    };
    
    Object.keys(cssVars).forEach(function(property) {
      document.documentElement.style.setProperty(property, cssVars[property]);
    });

    // CSS feature detection and fallbacks
    const testDiv = document.createElement('div');
    testDiv.style.cssText = 'display: grid; display: flex; transform: translateZ(0);';
    
    if (!testDiv.style.display.includes('grid')) {
      document.documentElement.classList.add('no-grid');
    }
    if (!testDiv.style.display.includes('flex')) {
      document.documentElement.classList.add('no-flexbox');
    }
    if (!testDiv.style.transform) {
      document.documentElement.classList.add('no-transforms');
    }
  }

  // 5. Performance Optimizations
  
  // Preload critical resources
  function preloadCriticalResources() {
    const criticalResources = [
      { href: '/assets/css/critical.css', as: 'style' },
      { href: '/assets/images/burni-logo.webp', as: 'image' },
      { href: '/assets/real-time-monitor.js', as: 'script' }
    ];

    criticalResources.forEach(function(resource) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.as === 'style') {
        link.onload = function() {
          this.rel = 'stylesheet';
        };
      }
      document.head.appendChild(link);
    });
  }

  // Defer non-critical scripts
  function deferNonCriticalScripts() {
    const scripts = document.querySelectorAll('script[data-defer="true"]');
    scripts.forEach(function(script) {
      script.setAttribute('defer', '');
    });
  }

  // Image optimization
  function optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(function(img) {
      // Add decode attribute for better rendering
      img.setAttribute('decoding', 'async');
      
      // Add loading attribute if not set
      if (!img.getAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // WebP fallback
      if (img.src && img.src.includes('.jpg') || img.src.includes('.png')) {
        const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        // Test WebP support
        const webp = new Image();
        webp.onload = webp.onerror = function() {
          if (webp.height === 2) {
            img.src = webpSrc;
          }
        };
        webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      }
    });
  }

  // 6. Service Worker and PWA
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js')
        .then(function (registration) {
          console.log('SW registered: ', registration);
          
          // Update available notification
          registration.addEventListener('updatefound', function() {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', function() {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (window.SecureDOM) {
                  window.SecureDOM.showNotification('App update available! Refresh to get the latest version.', 'info');
                }
              }
            });
          });
        })
        .catch(function (registrationError) {
          console.log('SW registration failed: ', registrationError);
        });
    });
  } else {
    // Fallback for browsers without service worker support
    const link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.href = '/assets/images/favicon.ico';
    document.head.appendChild(link);
  }

  // 7. Responsive and Touch Enhancements
  
  // Touch support detection
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (hasTouch) {
    document.documentElement.classList.add('touch');
    
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  } else {
    document.documentElement.classList.add('no-touch');
  }

  // Viewport meta tag for responsive design
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    document.head.appendChild(viewport);
  }

  // 8. Performance Monitoring
  
  function measurePerformance() {
    if ('performance' in window) {
      window.addEventListener('load', function() {
        setTimeout(function() {
          const perfData = performance.getEntriesByType('navigation')[0];
          const metrics = {
            dns: perfData.domainLookupEnd - perfData.domainLookupStart,
            tcp: perfData.connectEnd - perfData.connectStart,
            ttfb: perfData.responseStart - perfData.navigationStart,
            download: perfData.responseEnd - perfData.responseStart,
            dom: perfData.domContentLoadedEventEnd - perfData.navigationStart,
            load: perfData.loadEventEnd - perfData.navigationStart
          };
          
          console.log('Performance Metrics:', metrics);
          
          // Send to analytics if available
          if (window.gtag) {
            window.gtag('event', 'page_performance', {
              custom_map: { metric1: 'load_time' },
              metric1: metrics.load
            });
          }
        }, 1000);
      });
    }
  }

  // 9. Error Handling and Fallbacks
  
  window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    // Fallback for critical functionality
    if (event.filename && event.filename.includes('real-time-monitor.js')) {
      console.log('Real-time monitoring failed, using fallback');
      // Implement basic price display fallback
    }
  });

  // 10. Initialize all enhancements
  
  function initializeEnhancements() {
    perfMetrics.domReady = performance.now();
    
    preloadCriticalResources();
    deferNonCriticalScripts();
    optimizeImages();
    measurePerformance();
    
    console.log('Browser compatibility enhancements loaded in', 
      Math.round(perfMetrics.domReady - perfMetrics.start), 'ms');
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancements);
  } else {
    initializeEnhancements();
  }

  window.addEventListener('load', function() {
    perfMetrics.loadComplete = performance.now();
    console.log('Total page load time:', 
      Math.round(perfMetrics.loadComplete - perfMetrics.start), 'ms');
  });

})();
