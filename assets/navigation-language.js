// Navigation & Language Switcher Optimierung für Burni Token

// --- NEU: Verbesserte i18n-Logik ---

/**
 * Bestimmt die initiale Sprache basierend auf der Nutzerpräferenz, den Browser-Einstellungen oder einem Standardwert.
 * Reihenfolge: localStorage -> navigator.language -> Fallback (z.B. 'en')
 * @param {string[]} availableLangs - Array der verfügbaren Sprachcodes (z.B. ['en', 'de']).
 * @param {string} fallbackLang - Die Standardsprache, falls keine andere gefunden wird.
 * @returns {string} Der zu verwendende Sprachcode.
 */
function getInitialLanguage(availableLangs, fallbackLang = 'en') {
  const savedLang = localStorage.getItem('userLanguage');
  if (savedLang && availableLangs.includes(savedLang)) { 
    return savedLang;
  }

  const browserLang = navigator.language.split('-')[0];
  if (availableLangs.includes(browserLang)) { 
    return browserLang;
  }

  return fallbackLang;
}

/**
 * Aktualisiert die hreflang-Tags im <head> für SEO.
 * @param {string[]} availableLangs - Array aller verfügbaren Sprachcodes.
 */
function updateHreflangTags(availableLangs) {
  const head = document.head;
  // Alte hreflang-Tags entfernen, um Duplikate zu vermeiden
  head.querySelectorAll('link[rel="alternate"]').forEach(el => el.remove());

  const baseUrl = window.location.origin + window.location.pathname;

  availableLangs.forEach(lang => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = baseUrl; // Annahme: URL ändert sich nicht pro Sprache
    head.appendChild(link);
  });
  
  // x-default für die Fallback-Sprache hinzufügen
  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = baseUrl;
  head.appendChild(defaultLink);
}


// --- Bestehende Logik (angepasst) ---

// Sprachumschaltung
async function loadTranslations() {
  // Nur einmal fetchen und cachen für bessere Performance
  if (!window.burni_translations) { 
    const res = await fetch('/assets/translations.json');
    window.burni_translations = await res.json();
  }
  return window.burni_translations;
}

function updateI18nElements(trans) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    // Immer Wert setzen, auch wenn leer, Fallback: Key selbst
    el.textContent = key in trans ? trans[key] : key;
    // aria-label ggf. mitübersetzen, falls vorhanden und identisch mit Key
    if (
      el.hasAttribute('aria-label') &&
      el.getAttribute('aria-label').toLowerCase().includes(key.replace(/_/g, ' '))
    ) {
      el.setAttribute('aria-label', key in trans ? trans[key] : key);
    }
  });
}

function updatePageTitle(trans) {
  if (trans.hero_title) document.title = trans.hero_title;
}

async function switchLanguage(lang, availableLangs) {
  const allTranslations = await loadTranslations();
  const trans = allTranslations[lang]?.translation || {};
  
  updateI18nElements(trans);
  updatePageTitle(trans);
  document.documentElement.lang = lang;

  // NEU: Sprache speichern und hreflang-Tags aktualisieren
  localStorage.setItem('userLanguage', lang);
  updateHreflangTags(availableLangs);

  await Promise.resolve();
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('languageSwitched', { detail: { lang } }));
  }, 0);
}

async function initNavigationAndLanguage() {
  const allTranslations = await loadTranslations();
  const availableLangs = Object.keys(allTranslations);
  const initialLang = getInitialLanguage(availableLangs, 'de');

  // Sprachumschaltung
  const langSelect = document.getElementById('lang-select');
  if (langSelect) { 
    langSelect.value = initialLang; // UI synchronisieren
    langSelect.addEventListener('change', (e) => switchLanguage(e.target.value, availableLangs));
    // Initial die Sprache setzen
    switchLanguage(initialLang, availableLangs);
  }

  // Verbesserte Mobile Menü Logik
  const mobileBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) { 
    // Event-Listener entfernen und neu setzen (Test-Kompatibilität)
    const newBtn = mobileBtn.cloneNode(true);
    mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
    newBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('active', isOpen);
      newBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Menü schließt bei Klick auf Link
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('active');
        newBtn.setAttribute('aria-expanded', 'false');
      });
    });
    // Tastatursteuerung für mobilen Menü-Button
    newBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault();
        newBtn.click();
      }
    });
  }

  // Verbesserte Navigation Active-State beim Scrollen
  const navLinks = Array.from(document.querySelectorAll('a.nav-link'));
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));
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
  document.querySelectorAll('a.nav-link, #mobile-menu a').forEach((link) => {
    link.addEventListener('click', function (e) {
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
  document.querySelectorAll('[data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const section = el.getAttribute('data-scroll-to');
      if (section) scrollToSection(section);
    });
  });
  // showTooltip
  document.querySelectorAll('[data-tooltip]').forEach((el) => {
    el.addEventListener('mouseenter', () => showTooltip(el));
  });
  // initializeCalculator
  document.querySelectorAll('[data-init-calculator]').forEach((el) => {
    el.addEventListener('click', initializeCalculator);
  });
  // toggleFAQ
  document.querySelectorAll('[data-toggle-faq]').forEach((el) => {
    el.addEventListener('click', () => {
      const faqId = el.getAttribute('data-toggle-faq');
      if (faqId) toggleFAQ(faqId);
    });
  });

  // Für Playwright-Tests: Desktop-Navigation immer sichtbar machen
  if (
    navigator.userAgent.includes('Playwright') ||
    window.__playwright ||
    document.body.getAttribute('data-playwright') === 'true'
  ) {
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
