// Enhanced Cross-Browser Polyfills for Maximum Compatibility
// Supports IE11+, old Android, iOS Safari, and all modern browsers

(function () {
  'use strict';

  // Performance API polyfill for older browsers
  if (!window.performance) {
    window.performance = {
      now: function () {
        return Date.now();
      },
      timing: {
        navigationStart: Date.now(),
      },
      mark: function () {},
      measure: function () {},
    };
  }

  // Promise polyfill for IE11
  if (!window.Promise) {
    window.Promise = function (executor) {
      var self = this;
      self.state = 'pending';
      self.value = undefined;
      self.handlers = [];

      function resolve(value) {
        if (self.state === 'pending') {
          self.state = 'fulfilled';
          self.value = value;
          self.handlers.forEach(handle);
        }
      }

      function reject(reason) {
        if (self.state === 'pending') {
          self.state = 'rejected';
          self.value = reason;
          self.handlers.forEach(handle);
        }
      }

      function handle(handler) {
        if (self.state === 'pending') {
          self.handlers.push(handler);
        } else {
          if (self.state === 'fulfilled' && handler.onFulfilled) {
            handler.onFulfilled(self.value);
          }
          if (self.state === 'rejected' && handler.onRejected) {
            handler.onRejected(self.value);
          }
        }
      }

      this.then = function (onFulfilled, onRejected) {
        return new Promise(function (resolve, reject) {
          handle({
            onFulfilled: function (value) {
              try {
                resolve(onFulfilled ? onFulfilled(value) : value);
              } catch (ex) {
                reject(ex);
              }
            },
            onRejected: function (reason) {
              try {
                resolve(onRejected ? onRejected(reason) : reason);
              } catch (ex) {
                reject(ex);
              }
            },
          });
        });
      };

      this.catch = function (onRejected) {
        return this.then(null, onRejected);
      };

      executor(resolve, reject);
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
  }

  // Fetch API polyfill for IE11 and old browsers
  if (!window.fetch) {
    window.fetch = function (url, options) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open((options && options.method) || 'GET', url);

        if (options && options.headers) {
          for (var key in options.headers) {
            xhr.setRequestHeader(key, options.headers[key]);
          }
        }

        xhr.onload = function () {
          resolve({
            status: xhr.status,
            statusText: xhr.statusText,
            json: function () {
              return Promise.resolve(JSON.parse(xhr.responseText));
            },
            text: function () {
              return Promise.resolve(xhr.responseText);
            },
          });
        };

        xhr.onerror = function () {
          reject(new Error('Network error'));
        };

        xhr.send((options && options.body) || null);
      });
    };
  }

  // IntersectionObserver polyfill for IE11
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = function (callback, options) {
      this.callback = callback;
      this.options = options || {};
      this.elements = [];
      this.isPolyfill = true;

      var self = this;
      this.checkIntersections = function () {
        self.elements.forEach(function (element) {
          var rect = element.getBoundingClientRect();
          var isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;

          if (element.wasIntersecting !== isIntersecting) {
            element.wasIntersecting = isIntersecting;
            self.callback([
              {
                target: element,
                isIntersecting: isIntersecting,
                intersectionRatio: isIntersecting ? 1 : 0,
              },
            ]);
          }
        });
      };

      // Check intersections on scroll and resize
      window.addEventListener('scroll', this.checkIntersections);
      window.addEventListener('resize', this.checkIntersections);
    };

    IntersectionObserver.prototype.observe = function (element) {
      this.elements.push(element);
      element.wasIntersecting = false;
      this.checkIntersections();
    };

    IntersectionObserver.prototype.unobserve = function (element) {
      var index = this.elements.indexOf(element);
      if (index > -1) {
        this.elements.splice(index, 1);
      }
    };

    IntersectionObserver.prototype.disconnect = function () {
      this.elements = [];
      window.removeEventListener('scroll', this.checkIntersections);
      window.removeEventListener('resize', this.checkIntersections);
    };
  }

  // Object.assign polyfill for IE11
  if (!Object.assign) {
    Object.assign = function (target) {
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

  // Array.from polyfill for IE11
  if (!Array.from) {
    Array.from = function (arrayLike, mapFn, thisArg) {
      var result = [];
      var length = arrayLike.length || 0;
      for (var i = 0; i < length; i++) {
        var value = arrayLike[i];
        if (mapFn) {
          value = mapFn.call(thisArg, value, i);
        }
        result.push(value);
      }
      return result;
    };
  }

  // Array.includes polyfill for IE11
  if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement, fromIndex) {
      var O = Object(this);
      var len = parseInt(O.length) || 0;
      if (len === 0) return false;
      var n = parseInt(fromIndex) || 0;
      var k = n >= 0 ? n : Math.max(len + n, 0);
      for (; k < len; k++) {
        if (O[k] === searchElement) return true;
      }
      return false;
    };
  }

  // String.includes polyfill for IE11
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

  // CustomEvent polyfill for IE11
  if (!window.CustomEvent) {
    window.CustomEvent = function (event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    CustomEvent.prototype = window.Event.prototype;
  }

  // classList polyfill for IE9/10
  if (!('classList' in document.createElement('_'))) {
    (function (view) {
      if (!('Element' in view)) return;

      var classListProp = 'classList',
        protoProp = 'prototype',
        elemCtrProto = view.Element[protoProp],
        objCtr = Object,
        strTrim =
          String[protoProp].trim ||
          function () {
            return this.replace(/^\s+|\s+$/g, '');
          },
        arrIndexOf =
          Array[protoProp].indexOf ||
          function (item) {
            var i = 0,
              len = this.length;
            for (; i < len; i++) {
              if (i in this && this[i] === item) {
                return i;
              }
            }
            return -1;
          };

      var DOMTokenList = function (el) {
        this.el = el;
        var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
        for (var i = 0; i < classes.length; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          el.className = this.toString();
        };
      };

      DOMTokenList[protoProp] = [];
      DOMTokenList[protoProp].item = function (i) {
        return this[i] || null;
      };
      DOMTokenList[protoProp].contains = function (token) {
        token += '';
        return arrIndexOf.call(this, token) !== -1;
      };
      DOMTokenList[protoProp].add = function () {
        var tokens = arguments;
        for (var i = 0, l = tokens.length; i < l; i++) {
          var token = tokens[i] + '';
          if (arrIndexOf.call(this, token) === -1) {
            this.push(token);
          }
        }
        this._updateClassName();
      };
      DOMTokenList[protoProp].remove = function () {
        var tokens = arguments;
        for (var i = 0, l = tokens.length; i < l; i++) {
          var token = tokens[i] + '';
          var index = arrIndexOf.call(this, token);
          if (index !== -1) {
            this.splice(index, 1);
          }
        }
        this._updateClassName();
      };
      DOMTokenList[protoProp].toggle = function (token, force) {
        token += '';
        var result = this.contains(token);
        var method = result ? (force !== true ? 'remove' : null) : force !== false ? 'add' : null;
        if (method) {
          this[method](token);
        }
        return !result;
      };
      DOMTokenList[protoProp].toString = function () {
        return this.join(' ');
      };

      if (objCtr.defineProperty) {
        var defineProperty = {
          get: function () {
            return new DOMTokenList(this);
          },
          enumerable: true,
          configurable: true,
        };
        try {
          objCtr.defineProperty(elemCtrProto, classListProp, defineProperty);
        } catch (ex) {
          if (ex.number === -0x7ff5ec54) {
            defineProperty.enumerable = false;
            objCtr.defineProperty(elemCtrProto, classListProp, defineProperty);
          }
        }
      }
    })(window);
  }

  // requestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      return setTimeout(callback, 16);
    };
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }

  // CSS.supports polyfill
  if (!window.CSS || !window.CSS.supports) {
    window.CSS = window.CSS || {};
    window.CSS.supports = function (property, value) {
      var el = document.createElement('div');
      try {
        el.style[property] = value;
        return el.style[property] === value;
      } catch (e) {
        return false;
      }
    };
  }

  console.log('🔧 Enhanced cross-browser polyfills loaded successfully');
})();
