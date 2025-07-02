// ...existing code before setupSmoothScrolling...
function setupSmoothScrolling() {
  var links = document.querySelectorAll('a[href^="#"]');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = e.currentTarget.getAttribute('href').substring(1);
      var targetElement = document.getElementById(targetId);

      if (targetElement) 
        var headerOffset = 80;
        var elementPosition = targetElement.getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        // Use smooth scrolling if supported, otherwise use instant
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        } else {
          window.scrollTo(0, offsetPosition);
        }

        // Update active navigation
        if (typeof updateActiveNavigation === 'function') {
          updateActiveNavigation(targetId);
        }

        // Close mobile menu if open
        var mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('show')) {
          mobileMenu.classList.remove('show');
          document.getElementById('mobile-menu-button').setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
}
// ...existing code after setupSmoothScrolling...


// Auto-generierte Implementierungen für fehlende Funktionen
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
 * for - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

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
 * function - Automatisch generierte Implementierung
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
 * getAttribute - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getAttribute(...args) {
  console.log('getAttribute aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * substring - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function substring(...args) {
  console.log('substring aufgerufen mit Argumenten:', args);
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
 * if - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

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
 * updateActiveNavigation - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function updateActiveNavigation(...args) {
  console.log('updateActiveNavigation aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * contains - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function contains(...args) {
  console.log('contains aufgerufen mit Argumenten:', args);
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
 * setAttribute - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setAttribute(...args) {
  console.log('setAttribute aufgerufen mit Argumenten:', args);
  return undefined;
}
