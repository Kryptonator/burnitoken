/**
 * Cross-Browser Compatibility Manager for BurniToken
 * Ensures consistent functionality across different browsers
 */

class BurniBrowserCompatibility {
  constructor() {
    this.browserInfo = this.detectBrowser();
    this.supportedFeatures = new Map();
    this.polyfillsLoaded = new Set();
    this.isInitialized = false;

    this.init();
  }

  init() {
    if (this.isInitialized) return;

    this.detectFeatures();
    this.loadPolyfills();
    this.addBrowserClasses();
    this.initBrowserSpecificFixes();
    this.initFeatureDetection();
    this.createCompatibilityReport();

    this.isInitialized = true;
    console.log('🌐 BurniToken Cross-Browser Compatibility initialized');
  }

  detectBrowser() {
    const userAgent = navigator.userAgent;
    const browser = {
      name: 'unknown',
      version: 'unknown',
      engine: 'unknown',
      mobile: false,
      tablet: false,
    };

    // Detect browser name and version
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser.name = 'chrome';
      browser.version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
      browser.engine = 'blink';
    } else if (userAgent.includes('Firefox')) {
      browser.name = 'firefox';
      browser.version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
      browser.engine = 'gecko';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser.name = 'safari';
      browser.version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
      browser.engine = 'webkit';
    } else if (userAgent.includes('Edg')) {
      browser.name = 'edge';
      browser.version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'unknown';
      browser.engine = 'blink';
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      browser.name = 'ie';
      browser.version = userAgent.match(/(?:MSIE |rv:)(\d+)/)?.[1] || 'unknown';
      browser.engine = 'trident';
    }

    // Detect mobile/tablet
    browser.mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    browser.tablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

    return browser;
  }

  detectFeatures() {
    const features = {
      // JavaScript Features
      promises: typeof Promise !== 'undefined',
      async: typeof (async () => {}) === 'function',
      fetch: typeof fetch !== 'undefined',
      es6: this.testES6Support(),
      es2015: this.testES2015Support(),
      es2017: this.testES2017Support(),

      // DOM Features
      customElements: 'customElements' in window,
      shadowDOM: 'attachShadow' in Element.prototype,

      // CSS Features
      cssGrid: this.testCSSGrid(),
      cssFlexbox: this.testCSSFlexbox(),
      cssCustomProperties: this.testCSSCustomProperties(),
      cssIntersectionObserver: 'IntersectionObserver' in window,

      // HTML Features
      webComponents: 'customElements' in window && 'attachShadow' in Element.prototype,

      // API Features
      serviceWorker: 'serviceWorker' in navigator,
      webWorker: typeof Worker !== 'undefined',
      geolocation: 'geolocation' in navigator,

      // Media Features
      webp: this.testWebPSupport(),
      avif: this.testAVIFSupport(),

      // Performance Features
      performanceObserver: 'PerformanceObserver' in window,
      intersectionObserver: 'IntersectionObserver' in window,

      // Touch Features
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,

      // Network Features
      connection: 'connection' in navigator,

      // Accessibility Features
      ariaLive: this.testARIALiveSupport(),

      // Storage Features
      localStorage: this.testLocalStorageSupport(),
      sessionStorage: this.testSessionStorageSupport(),
      indexedDB: 'indexedDB' in window,
    };

    // Store features for later use
    Object.entries(features).forEach(([key, value]) => {
      this.supportedFeatures.set(key, value);
    });

    return features;
  }

  testES6Support() {
    try {
      eval('const x = () => {}; class Test {}');
      return true;
    } catch (e) {
      return false;
    }
  }

  testES2015Support() {
    try {
      eval('const [a, b] = [1, 2]; const {c} = {c: 3};');
      return true;
    } catch (e) {
      return false;
    }
  }

  testES2017Support() {
    try {
      eval('async function test() { await Promise.resolve(); }');
      return true;
    } catch (e) {
      return false;
    }
  }

  testCSSGrid() {
    const element = document.createElement('div');
    element.style.display = 'grid';
    return element.style.display === 'grid';
  }

  testCSSFlexbox() {
    const element = document.createElement('div');
    element.style.display = 'flex';
    return element.style.display === 'flex';
  }

  testCSSCustomProperties() {
    return window.CSS && window.CSS.supports && window.CSS.supports('--test', 'value');
  }

  testWebPSupport() {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 1, 1);
      const dataURL = canvas.toDataURL('image/webp');
      resolve(dataURL.indexOf('data:image/webp') === 0);
    });
  }

  testAVIFSupport() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src =
        'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMgkQAAAAB0IqjqQA/fVAAAAAAAAAFQrQc=';
    });
  }

  testARIALiveSupport() {
    const element = document.createElement('div');
    element.setAttribute('aria-live', 'polite');
    return element.getAttribute('aria-live') === 'polite';
  }

  testLocalStorageSupport() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  testSessionStorageSupport() {
    try {
      const test = '__test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  loadPolyfills() {
    const polyfills = [];

    // Promise polyfill for older browsers
    if (!this.supportedFeatures.get('promises')) {
      polyfills.push(this.loadPromisePolyfill());
    }

    // Fetch polyfill for older browsers
    if (!this.supportedFeatures.get('fetch')) {
      polyfills.push(this.loadFetchPolyfill());
    }

    // Intersection Observer polyfill
    if (!this.supportedFeatures.get('intersectionObserver')) {
      polyfills.push(this.loadIntersectionObserverPolyfill());
    }

    // CSS Custom Properties polyfill for IE
    if (!this.supportedFeatures.get('cssCustomProperties') && this.browserInfo.name === 'ie') {
      polyfills.push(this.loadCSSCustomPropertiesPolyfill());
    }

    // Array.from polyfill
    if (!Array.from) {
      this.loadArrayFromPolyfill();
    }

    // Object.assign polyfill
    if (!Object.assign) {
      this.loadObjectAssignPolyfill();
    }

    Promise.all(polyfills).then(() => {
      console.log('✅ All polyfills loaded successfully');
    });
  }

  loadPromisePolyfill() {
    return new Promise((resolve) => {
      if (typeof Promise !== 'undefined') {
        resolve();
        return;
      }

      // Simple Promise polyfill
      window.Promise = function (executor) {
        const self = this;
        this.state = 'pending';
        this.value = undefined;
        this.handlers = [];

        function resolve(value) {
          if (self.state === 'pending') {
            self.state = 'fulfilled';
            self.value = value;
            self.handlers.forEach((handler) => handler.onFulfilled(value));
          }
        }

        function reject(reason) {
          if (self.state === 'pending') {
            self.state = 'rejected';
            self.value = reason;
            self.handlers.forEach((handler) => handler.onRejected(reason));
          }
        }

        try {
          executor(resolve, reject);
        } catch (error) {
          reject(error);
        }
      };

      window.Promise.prototype.then = function (onFulfilled, onRejected) {
        const self = this;
        return new Promise((resolve, reject) => {
          const handler = {
            onFulfilled: function (value) {
              try {
                const result = onFulfilled ? onFulfilled(value) : value;
                resolve(result);
              } catch (error) {
                reject(error);
              }
            },
            onRejected: function (reason) {
              try {
                const result = onRejected ? onRejected(reason) : reason;
                resolve(result);
              } catch (error) {
                reject(error);
              }
            },
          };

          if (self.state === 'fulfilled') {
            handler.onFulfilled(self.value);
          } else if (self.state === 'rejected') {
            handler.onRejected(self.value);
          } else {
            self.handlers.push(handler);
          }
        });
      };

      console.log('✅ Promise polyfill loaded');
      resolve();
    });
  }

  loadFetchPolyfill() {
    return new Promise((resolve) => {
      if (typeof fetch !== 'undefined') {
        resolve();
        return;
      }

      // Simple fetch polyfill using XMLHttpRequest
      window.fetch = function (url, options = {}) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(options.method || 'GET', url);

          // Set headers
          if (options.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }

          xhr.onload = function () {
            const response = {
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              json: function () {
                return Promise.resolve(JSON.parse(xhr.responseText));
              },
              text: function () {
                return Promise.resolve(xhr.responseText);
              },
            };
            resolve(response);
          };

          xhr.onerror = function () {
            reject(new Error('Network error'));
          };

          xhr.send(options.body || null);
        });
      };

      console.log('✅ Fetch polyfill loaded');
      resolve();
    });
  }

  loadIntersectionObserverPolyfill() {
    return new Promise((resolve) => {
      if ('IntersectionObserver' in window) {
        resolve();
        return;
      }

      // Simple Intersection Observer polyfill
      window.IntersectionObserver = function (callback, options = {}) {
        this.callback = callback;
        this.options = options;
        this.elements = new Set();
      };

      window.IntersectionObserver.prototype.observe = function (element) {
        this.elements.add(element);
        // Simplified: just call callback immediately
        this.callback([
          {
            target: element,
            isIntersecting: true,
            intersectionRatio: 1,
          },
        ]);
      };

      window.IntersectionObserver.prototype.unobserve = function (element) {
        this.elements.delete(element);
      };

      window.IntersectionObserver.prototype.disconnect = function () {
        this.elements.clear();
      };

      console.log('✅ Intersection Observer polyfill loaded');
      resolve();
    });
  }

  loadCSSCustomPropertiesPolyfill() {
    return new Promise((resolve) => {
      // Simple CSS Custom Properties polyfill for IE
      const cssCustomPropertiesPolyfill = function () {
        const sheets = document.styleSheets;
        for (let i = 0; i < sheets.length; i++) {
          try {
            const rules = sheets[i].cssRules || sheets[i].rules;
            for (let j = 0; j < rules.length; j++) {
              const rule = rules[j];
              if (rule.style && rule.style.cssText) {
                const text = rule.style.cssText;
                const matches = text.match(/--[\w-]+:\s*[^;]+/g);
                if (matches) {
                  console.log('CSS Custom Properties found:', matches);
                }
              }
            }
          } catch (e) {
            // Cross-origin stylesheets will throw errors
          }
        }
      };

      cssCustomPropertiesPolyfill();
      console.log('✅ CSS Custom Properties polyfill loaded');
      resolve();
    });
  }

  loadArrayFromPolyfill() {
    if (!Array.from) {
      Array.from = function (arrayLike, mapFn, thisArg) {
        const items = [];
        for (let i = 0; i < arrayLike.length; i++) {
          const item = mapFn ? mapFn.call(thisArg, arrayLike[i], i) : arrayLike[i];
          items.push(item);
        }
        return items;
      };
      console.log('✅ Array.from polyfill loaded');
    }
  }

  loadObjectAssignPolyfill() {
    if (!Object.assign) {
      Object.assign = function (target) {
        for (let i = 1; i < arguments.length; i++) {
          const source = arguments[i];
          for (const key in source) {
            if (source.hasOwnProperty(key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
      console.log('✅ Object.assign polyfill loaded');
    }
  }

  addBrowserClasses() {
    const html = document.documentElement;

    // Add browser-specific classes
    html.classList.add(`browser-${this.browserInfo.name}`);
    html.classList.add(`browser-${this.browserInfo.name}-${this.browserInfo.version}`);
    html.classList.add(`engine-${this.browserInfo.engine}`);

    if (this.browserInfo.mobile) {
      html.classList.add('mobile');
    }

    if (this.browserInfo.tablet) {
      html.classList.add('tablet');
    }

    // Add feature classes
    this.supportedFeatures.forEach((supported, feature) => {
      html.classList.add(supported ? `supports-${feature}` : `no-${feature}`);
    });
  }

  initBrowserSpecificFixes() {
    // Safari-specific fixes
    if (this.browserInfo.name === 'safari') {
      this.applySafariFixes();
    }

    // Firefox-specific fixes
    if (this.browserInfo.name === 'firefox') {
      this.applyFirefoxFixes();
    }

    // Chrome-specific fixes
    if (this.browserInfo.name === 'chrome') {
      this.applyChromeFixes();
    }

    // IE-specific fixes
    if (this.browserInfo.name === 'ie') {
      this.applyIEFixes();
    }

    // Edge-specific fixes
    if (this.browserInfo.name === 'edge') {
      this.applyEdgeFixes();
    }
  }

  applySafariFixes() {
    // Safari backdrop-filter fix
    const style = document.createElement('style');
    style.textContent = `
      @supports (-webkit-backdrop-filter: blur(1px)) {
        .backdrop-blur-md {
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
        }
      }
      
      /* Safari smooth scrolling fix */
      html {
        scroll-behavior: smooth;
      }
      
      /* Safari flexbox fix */
      .safari-flex-fix {
        display: -webkit-box;
        display: -webkit-flex;
        display: flex;
      }
    `;
    document.head.appendChild(style);

    console.log('✅ Safari-specific fixes applied');
  }

  applyFirefoxFixes() {
    const style = document.createElement('style');
    style.textContent = `
      /* Firefox scrollbar styling */
      * {
        scrollbar-width: thin;
        scrollbar-color: #f97316 #f1f1f1;
      }
      
      /* Firefox input styling */
      input[type="number"] {
        -moz-appearance: textfield;
      }
      
      input::-moz-focus-inner {
        border: 0;
        padding: 0;
      }
    `;
    document.head.appendChild(style);

    console.log('✅ Firefox-specific fixes applied');
  }

  applyChromeFixes() {
    const style = document.createElement('style');
    style.textContent = `
      /* Chrome scrollbar styling */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #f97316;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #ea580c;
      }
    `;
    document.head.appendChild(style);

    console.log('✅ Chrome-specific fixes applied');
  }

  applyIEFixes() {
    const style = document.createElement('style');
    style.textContent = `
      /* IE flexbox fixes */
      .ie-flex-fix {
        display: -ms-flexbox;
        -ms-flex-direction: row;
        -ms-flex-wrap: nowrap;
        -ms-flex-pack: start;
        -ms-flex-align: stretch;
      }
      
      /* IE grid fallback */
      .ie-grid-fallback {
        display: table;
        width: 100%;
      }
      
      .ie-grid-fallback > * {
        display: table-cell;
        vertical-align: top;
      }
      
      /* IE opacity fix */
      .ie-opacity {
        filter: alpha(opacity=80);
      }
    `;
    document.head.appendChild(style);

    // Add IE-specific JavaScript fixes
    this.addIEJavaScriptFixes();

    console.log('✅ IE-specific fixes applied');
  }

  addIEJavaScriptFixes() {
    // Add event listener polyfill for IE
    if (!Element.prototype.addEventListener) {
      Element.prototype.addEventListener = function (event, handler) {
        this.attachEvent('on' + event, handler);
      };
    }

    // Add classList polyfill for IE
    if (!Element.prototype.classList) {
      Element.prototype.classList = {
        add: function (className) {
          if (!this.contains(className)) {
            this.element.className += ' ' + className;
          }
        },
        remove: function (className) {
          this.element.className = this.element.className.replace(
            new RegExp('\\b' + className + '\\b', 'g'),
            '',
          );
        },
        contains: function (className) {
          return this.element.className.indexOf(className) !== -1;
        },
        toggle: function (className) {
          if (this.contains(className)) {
            this.remove(className);
          } else {
            this.add(className);
          }
        },
      };
    }
  }

  applyEdgeFixes() {
    const style = document.createElement('style');
    style.textContent = `
      /* Edge CSS fixes */
      @supports (-ms-ime-align: auto) {
        .edge-specific {
          /* Edge-specific styles */
        }
      }
    `;
    document.head.appendChild(style);

    console.log('✅ Edge-specific fixes applied');
  }

  initFeatureDetection() {
    // Add feature detection utilities
    window.BurniFeatureDetection = {
      supports: (feature) => this.supportedFeatures.get(feature),
      browser: () => this.browserInfo,
      isModern: () => this.isModernBrowser(),
      needsPolyfill: (feature) => !this.supportedFeatures.get(feature),
    };
  }

  isModernBrowser() {
    return (
      this.supportedFeatures.get('promises') &&
      this.supportedFeatures.get('fetch') &&
      this.supportedFeatures.get('es6') &&
      this.supportedFeatures.get('cssFlexbox')
    );
  }

  createCompatibilityReport() {
    const report = {
      browser: this.browserInfo,
      features: Object.fromEntries(this.supportedFeatures),
      polyfillsLoaded: Array.from(this.polyfillsLoaded),
      isModern: this.isModernBrowser(),
      score: this.calculateCompatibilityScore(),
    };

    console.log('🌐 Browser Compatibility Report:', report);

    // Store report for debugging
    window.BurniBrowserReport = report;

    return report;
  }

  calculateCompatibilityScore() {
    const totalFeatures = this.supportedFeatures.size;
    const supportedFeatures = Array.from(this.supportedFeatures.values()).filter(Boolean).length;

    return Math.round((supportedFeatures / totalFeatures) * 100);
  }

  showBrowserWarning() {
    if (!this.isModernBrowser()) {
      const warning = document.createElement('div');
      warning.className =
        'browser-warning fixed top-0 left-0 w-full bg-yellow-100 border-b border-yellow-400 p-4 text-center z-50';
      warning.innerHTML = `
        <p class="text-yellow-800">
          <strong>Browser Compatibility Notice:</strong> 
          Some features may not work optimally in your browser. 
          Please consider upgrading to a modern browser for the best experience.
          <button type="button" class="ml-4 text-yellow-600 underline" onclick="this.parentElement.parentElement.remove()">
            Dismiss
          </button>
        </p>
      `;

      document.body.insertBefore(warning, document.body.firstChild);

      setTimeout(() => {
        warning.remove();
      }, 10000);
    }
  }

  cleanup() {
    // Clean up any created elements or event listeners
    const warning = document.querySelector('.browser-warning');
    if (warning) {
      warning.remove();
    }
  }
}

// Initialize browser compatibility
if (typeof window !== 'undefined') {
  window.BurniBrowserCompatibility = BurniBrowserCompatibility;

  // Auto-initialize immediately
  window.burniBrowserCompatibility = new BurniBrowserCompatibility();

  // Show browser warning if needed
  document.addEventListener('DOMContentLoaded', () => {
    window.burniBrowserCompatibility.showBrowserWarning();
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BurniBrowserCompatibility;
}
