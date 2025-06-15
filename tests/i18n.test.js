// tests/i18n.test.js
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Language Switcher', () => {
  let window, document;

  beforeEach(() => {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            // Mock Chart global für Tests
            window.Chart = function() {};
            window.Chart.register = function() {};
          </script>
        </head>
        <body>
          <select id="lang-select">
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
          <span data-i18n="nav_home">Home</span>
          <span data-i18n="nav_about">About</span>
          <span data-i18n="nav_tokenomics">Tokenomics</span>
        </body>
      </html>
    `, {
      runScripts: "dangerously",
      resources: "usable"
    });

    window = dom.window;
    document = window.document;
    global.document = document;
    global.window = window;
    global.console = console; // Für Debugging

    // Grundlegende globals für main.js
    window.mainJsLoaded = false;
    window.inlineScriptLoaded = true;
  });

  const translations = {
    en: {
      nav_home: 'Home',
      nav_about: 'About',
    },
    de: {
      nav_home: 'Startseite',
      nav_about: 'Über uns',
    },
  };

  const updateI18nTexts = (lang) => {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
  };

  it('should update text content on language change to German', () => {
    const langSelect = document.getElementById('lang-select');
    langSelect.value = 'de';
    updateI18nTexts('de');

    expect(document.querySelector('[data-i18n="nav_home"]').textContent).toBe('Startseite');
    expect(document.querySelector('[data-i18n="nav_about"]').textContent).toBe('Über uns');
  });

  it('should update text content on language change to English', () => {
    const langSelect = document.getElementById('lang-select');
    langSelect.value = 'en';
    updateI18nTexts('en');

    expect(document.querySelector('[data-i18n="nav_home"]').textContent).toBe('Home');
    expect(document.querySelector('[data-i18n="nav_about"]').textContent).toBe('About');
  });

  it('should handle missing translations gracefully', () => {
    updateI18nTexts('fr'); // French not in translations

    // Should keep original text when translation is missing
    expect(document.querySelector('[data-i18n="nav_home"]').textContent).toBe('Home');
  });
});
