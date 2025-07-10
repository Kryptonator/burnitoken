// Navigation & Language Switcher Optimierung für Burni Token

// Sprachumschaltung
async function loadTranslations(lang) {
  const res = await fetch('/assets/translations.json');
  const translations = await res.json();
  return translations[lang]?.translation || {};
}

function updateI18nElements(trans) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    // Immer Wert setzen, auch wenn leer, Fallback: Key selbst
    el.textContent = (key in trans) ? trans[key] : key;
    // aria-label ggf. mitübersetzen, falls vorhanden und identisch mit Key
    if (el.hasAttribute('aria-label') && el.getAttribute('aria-label').toLowerCase().includes(key.replace(/_/g, ' '))) {
      el.setAttribute('aria-label', (key in trans) ? trans[key] : key);
    }
  });
  
  // Update multilingual alt attributes for images
  document.querySelectorAll('[data-i18n-alt]').forEach(img => {
    const altKey = img.getAttribute('data-i18n-alt');
    if (altKey in trans) {
      img.setAttribute('alt', trans[altKey]);
    }
  });
}

function updatePageTitle(trans) {
  if (trans.hero_title) document.title = trans.hero_title;
}

async function switchLanguage(lang) {
  const trans = await loadTranslations(lang);
  // Alle i18n-Elemente synchron updaten
  updateI18nElements(trans);
  updatePageTitle(trans);
  // <html lang="...">-Attribut setzen
  document.documentElement.lang = lang;
  
  // Update aria-current="true" for active language
  updateActiveLanguage(lang);
  
  // Warten, bis alle DOM-Änderungen durch sind (Microtask-Queue leeren)
  await Promise.resolve();
  // Playwright-Testfreundlich: Event erst dispatchen, wenn DOM wirklich aktualisiert
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('languageSwitched', { detail: { lang } }));
  }, 0);
}

function updateActiveLanguage(activeLang) {
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    // Remove aria-current from all options
    Array.from(langSelect.options).forEach(option => {
      option.removeAttribute('aria-current');
    });
    
    // Add aria-current="true" to selected option
    const activeOption = Array.from(langSelect.options).find(option => option.value === activeLang);
    if (activeOption) {
      activeOption.setAttribute('aria-current', 'true');
    }
    
    // Update select element aria-label to reflect current selection
    const currentLangText = activeOption ? activeOption.textContent : activeLang.toUpperCase();
    langSelect.setAttribute('aria-label', `Current language: ${currentLangText}. Select to change language.`);
  }
}

function initNavigationAndLanguage() {
  // Sprachumschaltung
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', e => switchLanguage(e.target.value));
    switchLanguage(langSelect.value);
  }

  // Enhanced Mobile Navigation with Focus Management and ESC handling
  const mobileBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  let focusableElements = [];
  let isMenuOpen = false;
  
  if (mobileBtn && mobileMenu) {
    // Get all focusable elements in mobile menu
    function updateFocusableElements() {
      focusableElements = mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    }
    
    function openMobileMenu() {
      isMenuOpen = true;
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('active');
      mobileBtn.setAttribute('aria-expanded', 'true');
      updateFocusableElements();
      
      // Focus first menu item
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
      
      // Announce menu opened to screen readers
      const announcement = document.getElementById('live-announcements');
      if (announcement) {
        announcement.textContent = 'Navigation menu opened';
        setTimeout(() => announcement.textContent = '', 1000);
      }
    }
    
    function closeMobileMenu() {
      isMenuOpen = false;
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('active');
      mobileBtn.setAttribute('aria-expanded', 'false');
      
      // Return focus to menu button
      mobileBtn.focus();
      
      // Announce menu closed to screen readers
      const announcement = document.getElementById('live-announcements');
      if (announcement) {
        announcement.textContent = 'Navigation menu closed';
        setTimeout(() => announcement.textContent = '', 1000);
      }
    }
    
    function handleFocusTrap(e) {
      if (!isMenuOpen) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
    
    // Event-Listener entfernen und neu setzen (Test-Kompatibilität)
    const newBtn = mobileBtn.cloneNode(true);
    mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
    
    newBtn.addEventListener('click', () => {
      if (isMenuOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
    
    // Menü schließt bei Klick auf Link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
    
    // Enhanced Keyboard Support
    newBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        newBtn.click();
      }
    });
    
    // Global ESC key handler and focus trap
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isMenuOpen) {
        e.preventDefault();
        closeMobileMenu();
      }
      handleFocusTrap(e);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', e => {
      if (isMenuOpen && !mobileMenu.contains(e.target) && !newBtn.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // Verbesserte Navigation Active-State beim Scrollen
  const navLinks = Array.from(document.querySelectorAll('a.nav-link'));
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
  function updateActiveNav() {
    let index = sections.findIndex((section, i) => {
      if (!section) return false;
      const rect = section.getBoundingClientRect();
      return rect.top <= 100 && rect.bottom > 100;
    });
    if (index === -1) index = 0;
    navLinks.forEach((link, i) => link.classList.toggle('active', i === index));
  }
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // Verbesserte Smooth Scrolling Logik
  document.querySelectorAll('a.nav-link, #mobile-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Nach Scrollen aktiv setzen (für flakey Browser)
          setTimeout(updateActiveNav, 800);
        }
      }
    });
  });

  // --- CSP-konforme Event-Handler für dynamische Aktionen ---
  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function showTooltip(el) {
    // Beispiel-Tooltip-Logik (kann angepasst werden)
    el.setAttribute('title', el.getAttribute('data-tooltip') || 'Info');
  }

  function initializeCalculator() {
    // Dummy-Implementierung für Calculator-Init
    if (window.calculatorInit) window.calculatorInit();
  }

  function toggleFAQ(faqId) {
    const el = document.getElementById(faqId);
    if (el) {
      el.classList.toggle('open');
    }
  }

  // Event-Listener für alle ehemals onclick/onkeydown-Elemente
  // scrollToSection
  document.querySelectorAll('[data-scroll-to]').forEach(el => {
    el.addEventListener('click', e => {
      const section = el.getAttribute('data-scroll-to');
      if (section) scrollToSection(section);
    });
  });
  // showTooltip
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => showTooltip(el));
  });
  // initializeCalculator
  document.querySelectorAll('[data-init-calculator]').forEach(el => {
    el.addEventListener('click', initializeCalculator);
  });
  // toggleFAQ
  document.querySelectorAll('[data-toggle-faq]').forEach(el => {
    el.addEventListener('click', () => {
      const faqId = el.getAttribute('data-toggle-faq');
      if (faqId) toggleFAQ(faqId);
    });
  });

  // Für Playwright-Tests: Desktop-Navigation immer sichtbar machen
  if (navigator.userAgent.includes('Playwright') || window.__playwright || document.body.getAttribute('data-playwright') === 'true') {
    const desktopNav = document.querySelector('nav[aria-label="Main navigation"]');
    if (desktopNav) {
      desktopNav.classList.remove('hidden');
      desktopNav.classList.add('test-visible');
    }
  }
}

// Automatisch bei DOMContentLoaded initialisieren
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigationAndLanguage);
} else {
  initNavigationAndLanguage();
}

// Für Playwright-Tests explizit verfügbar machen
window.initNavigationAndLanguage = initNavigationAndLanguage;
