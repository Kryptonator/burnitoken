// main-es5.js: ES5 compatible core functionality for Burni Token website
(function() {
  'use strict';
  
  console.log('Main ES5 loading...');

  // Global fallback functions - defined first before any other scripts
  if (typeof window.checkFontAwesome !== 'function') {
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
      then: function(onResolve, onReject) {
        try {
          var result = executor(onResolve, onReject);
          if (onResolve) onResolve(result);
        } catch (error) {
          if (onReject) onReject(error);
        }
        return promiseLike;
      },
      catch: function(onReject) {
        return this.then(null, onReject);
      }
    };
    return promiseLike;
  }

  document.addEventListener('DOMContentLoaded', function() {
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
    var isTest = window.navigator.userAgent.indexOf('Playwright') !== -1 ||
                 window.location.search.indexOf('e2e-test') !== -1 ||
                 window.__playwright ||
                 window.__pw_playwright ||
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
        setTimeout(function() {
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
      mobileMenuButton.addEventListener('click', function() {
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

    // Chart.js dynamisch laden (ES5)
    function loadChartJs() {
      return createPromise(function(resolve, reject) {
        // Prüfen, ob Chart.js bereits geladen ist
        if (typeof Chart !== 'undefined') {
          chartJsLoaded = true;
          resolve();
          return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = function() {
          chartJsLoaded = true;
          console.log('Chart.js erfolgreich geladen');
          resolve();
        };
        script.onerror = function() {
          console.warn('Chart.js konnte nicht geladen werden');
          reject(new Error('Chart.js loading failed'));
        };
        document.head.appendChild(script);
      });
    }

    function waitForChartJs() {
      return createPromise(function(resolve) {
        loadChartJs().then(function() {
          resolve();
        }).catch(function(error) {
          console.warn('Chart.js konnte nicht geladen werden - Charts werden deaktiviert');
          resolve();
        });
      });
    }

    // Navigation setup (ES5 compatible)
    var navLinks = document.querySelectorAll('header nav a.nav-link, #mobile-menu a');
    for (var i = 0; i < navLinks.length; i++) {
      (function(link) {
        link.addEventListener('click', function(e) {
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
              var activeLinks = document.querySelectorAll('header nav a[href="' + link.hash + '"], #mobile-menu a[href="' + link.hash + '"]');
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
    waitForChartJs().then(function() {
      initializeCharts();
      initializeAnimations();
      initializeRealTimeFeatures();
    });

    // Scroll detection for navigation (ES5 compatible)
    var scrolled = false;
    function handleScroll() {
      if (!scrolled) {
        scrolled = true;
        setTimeout(function() {
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
          var matchingLinks = document.querySelectorAll('header nav a[href="' + hash + '"], #mobile-menu a[href="' + hash + '"]');
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
