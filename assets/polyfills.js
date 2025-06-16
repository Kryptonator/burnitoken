// polyfills.js - Comprehensive browser compatibility polyfills
(function () {
  'use strict';

  // ES6+ Features Polyfills for IE11 and older browsers

  // 1. Array Methods
  if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement, fromIndex) {
      return this.indexOf(searchElement, fromIndex) !== -1;
    };
  }

  if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = parseInt(list.length) || 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    };
  }

  if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function (predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = parseInt(list.length) || 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return i;
        }
      }
      return -1;
    };
  }

  if (!Array.from) {
    Array.from = function (arrayLike, mapFn, thisArg) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }
      var mapFunction = mapFn === undefined ? undefined : mapFn;
      if (typeof mapFunction !== 'undefined' && typeof mapFunction !== 'function') {
        throw new TypeError('Array.from: when provided, the second argument must be a function');
      }
      var T = thisArg;
      var len = parseInt(items.length) || 0;
      var A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFunction) {
          A[k] = typeof T === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }

  // 2. String Methods
  if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
      if (typeof start !== 'number') {
        start = 0;
      }
      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
    };
  }

  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, length) {
      if (length === undefined || length > this.length) {
        length = this.length;
      }
      return this.substring(length - searchString.length, length) === searchString;
    };
  }

  if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
      if (this == null) {
        throw new TypeError("can't convert " + this + ' to object');
      }
      var str = '' + this;
      count = +count;
      if (count != count) {
        count = 0;
      }
      if (count < 0) {
        throw new RangeError('repeat count must be non-negative');
      }
      if (count == Infinity) {
        throw new RangeError('repeat count must be less than infinity');
      }
      count = Math.floor(count);
      if (str.length == 0 || count == 0) {
        return '';
      }
      if (str.length * count >= 1 << 28) {
        throw new RangeError('repeat count must not overflow maximum string length');
      }
      var rpt = '';
      for (var i = 0; i < count; i++) {
        rpt += str;
      }
      return rpt;
    };
  }

  // 3. Object Methods
  if (!Object.assign) {
    Object.assign = function (target, varArgs) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      if (o !== Object(o)) {
        throw new TypeError('Object.keys called on a non-object');
      }
      var k = [],
        p;
      for (p in o) {
        if (Object.prototype.hasOwnProperty.call(o, p)) {
          k.push(p);
        }
      }
      return k;
    };
  }

  if (!Object.values) {
    Object.values = function (o) {
      if (o !== Object(o)) {
        throw new TypeError('Object.values called on a non-object');
      }
      var v = [];
      for (var k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) {
          v.push(o[k]);
        }
      }
      return v;
    };
  }

  if (!Object.entries) {
    Object.entries = function (o) {
      if (o !== Object(o)) {
        throw new TypeError('Object.entries called on a non-object');
      }
      var e = [];
      for (var k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) {
          e.push([k, o[k]]);
        }
      }
      return e;
    };
  }

  // 4. Promise Polyfill (comprehensive)
  if (!window.Promise) {
    window.Promise = function (executor) {
      var self = this;
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
          setTimeout(function () {
            if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
              try {
                var x = handler.onFulfilled(self.value);
                handler.resolve(x);
              } catch (ex) {
                handler.reject(ex);
              }
            }
            if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
              try {
                var x = handler.onRejected(self.value);
                handler.resolve(x);
              } catch (ex) {
                handler.reject(ex);
              }
            }
            if (self.state === 'rejected' && typeof handler.onRejected !== 'function') {
              handler.reject(self.value);
            }
          }, 0);
        }
      }

      this.then = function (onFulfilled, onRejected) {
        return new Promise(function (resolve, reject) {
          handle({
            onFulfilled: onFulfilled,
            onRejected: onRejected,
            resolve: resolve,
            reject: reject,
          });
        });
      };

      this.catch = function (onRejected) {
        return this.then(null, onRejected);
      };

      if (typeof executor === 'function') {
        try {
          executor(resolve, reject);
        } catch (ex) {
          reject(ex);
        }
      }
    };

    Promise.resolve = function (value) {
      return new Promise(function (resolve) {
        resolve(value);
      });
    };

    Promise.reject = function (reason) {
      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    };

    Promise.all = function (promises) {
      return new Promise(function (resolve, reject) {
        var count = 0;
        var result = [];
        if (promises.length === 0) {
          resolve(result);
        } else {
          function resolver(i) {
            return function (value) {
              result[i] = value;
              count++;
              if (count === promises.length) {
                resolve(result);
              }
            };
          }
          for (var i = 0; i < promises.length; i++) {
            Promise.resolve(promises[i]).then(resolver(i), reject);
          }
        }
      });
    };
  }

  // 5. Fetch API Polyfill
  if (!window.fetch) {
    window.fetch = function (url, options) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        options = options || {};
        var method = options.method || 'GET';
        var body = options.body;
        var headers = options.headers || {};

        xhr.open(method, url, true);

        for (var key in headers) {
          if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
          }
        }

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            var response = {
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: {
                get: function (name) {
                  return xhr.getResponseHeader(name);
                },
              },
              text: function () {
                return Promise.resolve(xhr.responseText);
              },
              json: function () {
                return Promise.resolve(JSON.parse(xhr.responseText));
              },
              blob: function () {
                return Promise.resolve(new Blob([xhr.response]));
              },
            };

            if (response.ok) {
              resolve(response);
            } else {
              reject(new Error('HTTP ' + xhr.status + ': ' + xhr.statusText));
            }
          }
        };

        xhr.onerror = function () {
          reject(new Error('Network error'));
        };

        xhr.ontimeout = function () {
          reject(new Error('Request timeout'));
        };

        if (options.timeout) {
          xhr.timeout = options.timeout;
        }

        xhr.send(body);
      });
    };
  }

  // 6. DOM and Event Polyfills

  // addEventListener for IE8
  if (!window.addEventListener) {
    window.addEventListener = function (type, listener, useCapture) {
      this.attachEvent('on' + type, function (e) {
        e = e || window.event;
        e.preventDefault =
          e.preventDefault ||
          function () {
            e.returnValue = false;
          };
        e.stopPropagation =
          e.stopPropagation ||
          function () {
            e.cancelBubble = true;
          };
        e.target = e.target || e.srcElement;
        listener.call(this, e);
      });
    };
  }

  if (!window.removeEventListener) {
    window.removeEventListener = function (type, listener, useCapture) {
      this.detachEvent('on' + type, listener);
    };
  }

  // querySelector polyfill for IE7
  if (!document.querySelector) {
    document.querySelector = function (selector) {
      var elements = document.querySelectorAll(selector);
      return elements.length ? elements[0] : null;
    };
  }

  if (!document.querySelectorAll) {
    document.querySelectorAll = function (selector) {
      var style = document.createElement('style');
      var elements = [];
      var element;
      document.documentElement.firstChild.appendChild(style);
      document._qsa = [];

      style.styleSheet.cssText =
        selector + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
      window.scrollBy(0, 0);
      style.parentNode.removeChild(style);

      while (document._qsa.length) {
        element = document._qsa.shift();
        elements.push(element);
      }
      document._qsa = null;
      return elements;
    };
  }

  // classList polyfill for IE9
  if (!('classList' in document.createElement('_'))) {
    (function (view) {
      var tokens = /\s+/;
      var ClassList = function (el) {
        this.el = el;
        var classes = el.className.replace(/^\s+|\s+$/g, '').split(tokens);
        for (var i = 0; i < classes.length; i++) {
          this[i] = classes[i];
        }
        this.length = classes.length;
      };

      ClassList.prototype = {
        add: function (token) {
          if (!this.contains(token)) {
            this.el.className += (this.el.className ? ' ' : '') + token;
          }
        },
        contains: function (token) {
          return this.el.className.indexOf(token) !== -1;
        },
        item: function (index) {
          return this[index] || null;
        },
        remove: function (token) {
          this.el.className = this.el.className
            .replace(new RegExp('\\b' + token + '\\b', 'g'), '')
            .replace(/^\s+|\s+$/g, '');
        },
        toString: function () {
          return this.el.className;
        },
        toggle: function (token) {
          if (this.contains(token)) {
            this.remove(token);
            return false;
          } else {
            this.add(token);
            return true;
          }
        },
      };

      if (view.HTMLElement) {
        Object.defineProperty(view.HTMLElement.prototype, 'classList', {
          get: function () {
            return new ClassList(this);
          },
        });
      }
    })(window);
  }

  // 7. CustomEvent polyfill for IE9+
  if (!window.CustomEvent) {
    window.CustomEvent = function (event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }

  // 8. IntersectionObserver polyfill
  if (!('IntersectionObserver' in window)) {
    window.IntersectionObserver = function (callback, options) {
      this.callback = callback;
      this.options = options || {};
      this.observedElements = [];
      this.isPolyfill = true;
    };

    window.IntersectionObserver.prototype.observe = function (element) {
      if (this.observedElements.indexOf(element) === -1) {
        this.observedElements.push(element);
        this._checkIntersections();
      }
    };

    window.IntersectionObserver.prototype.unobserve = function (element) {
      var index = this.observedElements.indexOf(element);
      if (index > -1) {
        this.observedElements.splice(index, 1);
      }
    };

    window.IntersectionObserver.prototype.disconnect = function () {
      this.observedElements = [];
    };

    window.IntersectionObserver.prototype._checkIntersections = function () {
      var self = this;
      this.observedElements.forEach(function (element) {
        var rect = element.getBoundingClientRect();
        var isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;

        self.callback([
          {
            target: element,
            isIntersecting: isIntersecting,
            intersectionRatio: isIntersecting ? 1 : 0,
            boundingClientRect: rect,
            rootBounds: {
              top: 0,
              left: 0,
              bottom: window.innerHeight,
              right: window.innerWidth,
              width: window.innerWidth,
              height: window.innerHeight,
            },
            time: Date.now(),
          },
        ]);
      });
    };
  }

  // 9. Performance API polyfill
  if (!window.performance) {
    window.performance = {};
  }

  if (!window.performance.now) {
    window.performance.now = function () {
      return Date.now();
    };
  }

  if (!window.performance.mark) {
    window.performance.mark = function (name) {
      console.log('Performance mark:', name, Date.now());
    };
  }

  // 10. CSS supports polyfill
  if (!window.CSS) {
    window.CSS = {};
  }

  if (!window.CSS.supports) {
    window.CSS.supports = function (property, value) {
      var element = document.createElement('div');
      element.style.cssText = property + ':' + value;
      return element.style.length > 0;
    };
  }

  // 11. requestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      return setTimeout(callback, 16);
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }

  // 12. getComputedStyle polyfill for IE8
  if (!window.getComputedStyle) {
    window.getComputedStyle = function (element, pseudoElement) {
      this.el = element;
      this.getPropertyValue = function (prop) {
        var re = /(\-([a-z]){1})/g;
        if (prop === 'float') prop = 'styleFloat';
        if (re.test(prop)) {
          prop = prop.replace(re, function () {
            return arguments[2].toUpperCase();
          });
        }
        return element.currentStyle && element.currentStyle[prop]
          ? element.currentStyle[prop]
          : null;
      };
      return this;
    };
  }

  // 13. matchMedia polyfill
  if (!window.matchMedia) {
    window.matchMedia = function (media) {
      return {
        matches: false,
        media: media,
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {},
      };
    };
  }

  // Console polyfill for older browsers
  if (!window.console) {
    window.console = {
      log: function () {},
      warn: function () {},
      error: function () {},
      info: function () {},
      debug: function () {},
      trace: function () {},
    };
  }

  // Add feature detection classes
  var html = document.documentElement;

  // Test for flexbox
  var flexTest = document.createElement('div');
  flexTest.style.display = 'flex';
  if (flexTest.style.display !== 'flex') {
    html.classList.add('no-flexbox');
  } else {
    html.classList.add('flexbox');
  }

  // Test for grid
  var gridTest = document.createElement('div');
  gridTest.style.display = 'grid';
  if (gridTest.style.display !== 'grid') {
    html.classList.add('no-grid');
  } else {
    html.classList.add('grid');
  }

  // Test for transforms
  var transformTest = document.createElement('div');
  transformTest.style.transform = 'translateX(1px)';
  if (!transformTest.style.transform) {
    html.classList.add('no-transforms');
  } else {
    html.classList.add('transforms');
  }

  // Test for WebP support
  var webpTest = document.createElement('canvas');
  if (webpTest.getContext && webpTest.getContext('2d')) {
    webpTest.width = webpTest.height = 1;
    var dataURI = webpTest.toDataURL('image/webp');
    if (dataURI.indexOf('data:image/webp') === 0) {
      html.classList.add('webp');
    } else {
      html.classList.add('no-webp');
    }
  } else {
    html.classList.add('no-webp');
  }

  // Test for touch support
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    html.classList.add('touch');
  } else {
    html.classList.add('no-touch');
  }

  // Log polyfill status
  console.log('Browser compatibility polyfills loaded successfully');

  // Notify about legacy browser
  if (!Array.prototype.includes || !Promise || !fetch) {
    console.warn('Legacy browser detected. Some modern features may not work optimally.');
  }
})();
