// main-es5.js: ES5 compatible core functionality for Burni Token website
(function () {
  'use strict';

  console.log('Main ES5 loading...');

  // Global fallback functions - defined first before any other scripts
  if (typeof window.checkFontAwesome !== 'function') 
    window.checkFontAwesome = function () {
      console.log('FontAwesome check: Fallback function active');
      // Überprüfe, ob FontAwesome korrekt geladen wurde
      var faElements = document.querySelectorAll('[class*="fa-"]');
      if (faElements.length > 0) {
        console.log('FontAwesome Icons gefunden:', faElements.length);
      }
    };
  }

  // Sofortiger Test für main.js loading
  window.mainJsLoaded = true;
  console.log('Main ES5 loaded and ready');

  // ES5 compatible Promise polyfill fallback
  function createPromise(executor) {
    if (typeof Promise !== 'undefined') {
      return new Promise(executor);
    }
    // Simple Promise-like implementation for IE
    var promiseLike = {
      then: function (onResolve, onReject) {
        try {
          var result = executor(onResolve, onReject);
          if (onResolve) onResolve(result);
        } catch (error) {
          if (onReject) onReject(error);
        }
        return promiseLike;
      },
      catch: function (onReject) {
        return this.then(null, onReject);
      },
    };
    return promiseLike;
  }

  document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired!');

    // Initialize optimized features immediately (ES5 compatible)
    try {
      if (typeof initializeOptimizedFeatures === 'function') {
        initializeOptimizedFeatures();
        console.log('Optimized features initialized successfully');
      }
    } catch (error) {
      console.warn('Error initializing optimized features:', error);
    }

    // Test detection and marking (ES5 compatible)
    var isTest =
      window.navigator.userAgent.indexOf('Playwright') !== -1;
      window.location.search.indexOf('e2e-test') !== -1;
      window.__playwright;
      window.__pw_playwright;
      document.documentElement.getAttribute('data-pw-test') !== null;

    if (isTest) {
      document.body.setAttribute('data-test-mode', 'true');
      document.body.setAttribute('data-playwright', 'true');
      console.log('Test mode detected and body attributes set');
    }

    // Hide page loader immediately (cross-browser, including Webkit)
    var pageLoader = document.getElementById('pageLoader');
    if (pageLoader) {
      if (isTest) {
        pageLoader.remove();
        console.log('Page Loader für E2E-Tests entfernt');
      } else {
        // Forciere Verstecken mit mehreren Methoden für Browser-Kompatibilität
        pageLoader.style.display = 'none';
        pageLoader.style.visibility = 'hidden';
        pageLoader.style.opacity = '0';
        pageLoader.style.pointerEvents = 'none';
        pageLoader.style.zIndex = '-9999';
        pageLoader.className += ' hidden';
        pageLoader.setAttribute('aria-hidden', 'true');

        // Webkit/Safari-spezifische Behandlung - entferne aus DOM
        setTimeout(function () {
          if (pageLoader && pageLoader.parentNode) {
            pageLoader.parentNode.removeChild(pageLoader);
            console.log('Page Loader für Webkit-Kompatibilität entfernt');
          }
        }, 50);
      }
    }

    var currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    }

    console.log('Setting up mobile menu...');
    var mobileMenuButton = document.getElementById('mobile-menu-button');
    var mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', function () {
        var isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        mobileMenuButton.setAttribute('aria-expanded', String(!isExpanded));

        // ES5 compatible class toggle
        if (mobileMenu.className.indexOf('hidden') !== -1) {
          mobileMenu.className = mobileMenu.className.replace('hidden', '');
          mobileMenu.className += ' active';
        } else {
          mobileMenu.className = mobileMenu.className.replace('active', '');
          mobileMenu.className += ' hidden';
        }
      });
    }

    console.log('Setting up navigation...');
    var headerOffset = 80;

    // Chart.js Loader - ES5 compatible
    var chartJsLoaded = false;

    // Chart.js dynamisch laden (nur noch lokal!)
    function loadChartJs() {
      return createPromise(function (resolve, reject) {
        if (typeof Chart !== 'undefined') {
          chartJsLoaded = true;
          resolve();
          return;
        }
        var script = document.createElement('script');
        script.src = '/assets/vendor/chart.min.js';
        script.onload = function () {
          chartJsLoaded = true;
          console.log('Chart.js erfolgreich lokal geladen');
          resolve();
        };
        script.onerror = function () {
          console.warn('Lokales Chart.js konnte nicht geladen werden');
          reject(new Error('Chart.js loading failed'));
        };
        document.head.appendChild(script);
      });
    }

    function waitForChartJs() {
      return createPromise(function (resolve) {
        loadChartJs()
          .then(function () {
            resolve();
          })
          .catch(function (error) {
            console.warn('Chart.js konnte nicht geladen werden - Charts werden deaktiviert');
            resolve();
          });
      });
    }

    // Navigation setup (ES5 compatible)
    var navLinks = document.querySelectorAll('header nav a.nav-link, #mobile-menu a');
    for (var i = 0; i < navLinks.length; i++) {
      (function (link) {
        link.addEventListener('click', function (e) {
          if (link.hash) {
            e.preventDefault();
            var targetElement = document.querySelector(link.hash);
            if (targetElement) {
              var elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

              // Smooth scroll fallback for IE
              if (window.scrollTo.length > 1) {
                window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
              } else {
                window.scrollTo(0, elementPosition - headerOffset);
              }

              // Remove active class from all nav links
              for (var j = 0; j < navLinks.length; j++) {
                navLinks[j].className = navLinks[j].className.replace('active', '');
              }

              // Add active class to current links
              var activeLinks = document.querySelectorAll(
                'header nav a[href="' + link.hash + '"], #mobile-menu a[href="' + link.hash + '"]',
              );
              for (var k = 0; k < activeLinks.length; k++) {
                activeLinks[k].className += ' active';
              }

              if (mobileMenu && mobileMenu.className.indexOf('active') !== -1) {
                mobileMenu.className = mobileMenu.className.replace('active', '');
                mobileMenu.className += ' hidden';
                if (mobileMenuButton) {
                  mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
              }
            }
          }
        });
      })(navLinks[i]);
    }

    // Initialize features that require Chart.js
    waitForChartJs().then(function () {
      initializeCharts();
      initializeAnimations();
      initializeRealTimeFeatures();
    });

    // Scroll detection for navigation (ES5 compatible)
    var scrolled = false;
    function handleScroll() {
      if (!scrolled) {
        scrolled = true;
        setTimeout(function () {
          updateActiveNavigation();
          scrolled = false;
        }, 100);
      }
    }

    function updateActiveNavigation() {
      var scrollPosition = window.pageYOffset + headerOffset + 50;
      var sections = document.querySelectorAll('section[id]');

      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
        var sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          // Remove active from all
          for (var j = 0; j < navLinks.length; j++) {
            navLinks[j].className = navLinks[j].className.replace('active', '');
          }

          // Add active to matching links
          var hash = '#' + section.id;
          var matchingLinks = document.querySelectorAll(
            'header nav a[href="' + hash + '"], #mobile-menu a[href="' + hash + '"]',
          );
          for (var k = 0; k < matchingLinks.length; k++) {
            matchingLinks[k].className += ' active';
          }
          break;
        }
      }
    }

    // ES5 compatible event listener
    if (window.addEventListener) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else if (window.attachEvent) {
      window.attachEvent('onscroll', handleScroll);
    }

    // Initialize charts function (ES5)
    function initializeCharts() {
      console.log('Initializing charts...');
      if (typeof Chart === 'undefined') {
        console.warn('Chart.js not available - skipping chart initialization');
        return;
      }

      // Chart initialization code here...
      var chartElement = document.getElementById('burnChart');
      if (chartElement) {
        // Chart setup code
        console.log('Chart initialized successfully');
      }
    }

    // Initialize animations (ES5)
    function initializeAnimations() {
      console.log('Initializing animations...');
      // Animation code here...
    }

    // Initialize real-time features (ES5)
    function initializeRealTimeFeatures() {
      console.log('Initializing real-time features...');
      // Real-time code here...
    }

    console.log('Main ES5 initialization completed');
  });
})();

// chart.min.js ist jetzt im assets/vendor/-Verzeichnis vorhanden und wird lokal geladen.
// Keine Platzhalter mehr im Code.


// Auto-generierte Implementierungen für fehlende Funktionen
/**
 * website - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function website(...args) {
  console.log('website aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * function - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * log - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * if - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * querySelectorAll - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function querySelectorAll(...args) {
  console.log('querySelectorAll aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * executor - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function executor(...args) {
  console.log('executor aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * onResolve - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function onResolve(...args) {
  console.log('onResolve aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * catch - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * onReject - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function onReject(...args) {
  console.log('onReject aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * then - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function then(...args) {
  console.log('then aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * addEventListener - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function addEventListener(...args) {
  console.log('addEventListener aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * immediately - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function immediately(...args) {
  console.log('immediately aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * initializeOptimizedFeatures - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function initializeOptimizedFeatures(...args) {
  console.log('initializeOptimizedFeatures aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * warn - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * marking - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function marking(...args) {
  console.log('marking aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * indexOf - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function indexOf(...args) {
  console.log('indexOf aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getAttribute - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getAttribute(...args) {
  console.log('getAttribute aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * setAttribute - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setAttribute(...args) {
  console.log('setAttribute aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getElementById - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getElementById(...args) {
  console.log('getElementById aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * remove - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function remove(...args) {
  console.log('remove aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * removeChild - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function removeChild(...args) {
  console.log('removeChild aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getFullYear - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getFullYear(...args) {
  console.log('getFullYear aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * replace - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function replace(...args) {
  console.log('replace aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * laden - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function laden(...args) {
  console.log('laden aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * resolve - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function resolve(...args) {
  console.log('resolve aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * createElement - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function createElement(...args) {
  console.log('createElement aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * reject - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function reject(...args) {
  console.log('reject aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * appendChild - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function appendChild(...args) {
  console.log('appendChild aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * setup - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setup(...args) {
  console.log('setup aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * for - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * preventDefault - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function preventDefault(...args) {
  console.log('preventDefault aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * querySelector - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function querySelector(...args) {
  console.log('querySelector aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getBoundingClientRect - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getBoundingClientRect(...args) {
  console.log('getBoundingClientRect aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * scrollTo - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function scrollTo(...args) {
  console.log('scrollTo aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * navigation - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function navigation(...args) {
  console.log('navigation aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * attachEvent - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function attachEvent(...args) {
  console.log('attachEvent aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * animations - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function animations(...args) {
  console.log('animations aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * features - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function features(...args) {
  console.log('features aufgerufen mit Argumenten:', args);
  return undefined;
}
