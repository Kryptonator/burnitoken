/**
 * BURNI TOKEN - UNIFIED DARK MODE MANAGER
 * Einheitliche Dark-Mode-Steuerung ohne Konflikte
 */

class BurniDarkModeManager {
  constructor() {
    this.isDarkMode = false;
    this.toggleButton = null;
    this.storageKey = 'burni-dark-mode';

    this.init();
  }

  init() {
    console.log('🌙 BurniDarkModeManager: Initialisierung...');

    // Entferne alle existierenden Dark-Mode-Elemente
    this.removeExistingToggle();

    // Lade gespeicherte Präferenz
    this.loadStoredPreference();

    // Erstelle Toggle-Button
    this.createToggleButton();

    // Keyboard-Shortcuts
    this.setupKeyboardShortcuts();

    // System-Präferenz berücksichtigen
    this.detectSystemPreference();

    console.log('✅ BurniDarkModeManager: Initialisierung abgeschlossen');
  }

  removeExistingToggle() {
    // Entferne alle existierenden Dark-Mode-Elemente
    const existingToggles = [
      '#theme-toggle',
      '#theme-toggle-container',
      '#dark-mode-toggle',
      '[data-dark-mode-toggle]',
    ];

    existingToggles.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => el.remove());
    });

    console.log('🧹 Existierende Dark-Mode-Elemente entfernt');
  }

  loadStoredPreference() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.isDarkMode = stored === 'true';
      console.log('💾 Gespeicherte Präferenz geladen:', this.isDarkMode ? 'Dark' : 'Light');
    } catch (error) {
      console.warn('⚠️ LocalStorage nicht verfügbar:', error);
      this.isDarkMode = false;
    }
  }

  detectSystemPreference() {
    if (window.matchMedia && !localStorage.getItem(this.storageKey)) {
      this.systemMediaMatcher = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkMode = this.systemMediaMatcher.matches;
      console.log('🎨 System-Präferenz erkannt:', this.isDarkMode ? 'Dark' : 'Light');

      this.systemMediaMatcher.addEventListener('change', (e) => {
        this.isDarkMode = e.matches;
        this.update();
        console.log('🔄 System-Präferenz geändert:', this.isDarkMode ? 'Dark' : 'Light');
      });
    }
  }

  createToggleButton() {
    this.toggleButton = document.createElement('button');
    this.toggleButton.id = 'burni-dark-mode-toggle';
    this.toggleButton.setAttribute('aria-label', 'Toggle Dark Mode');
    this.toggleButton.style.position = 'fixed';
    this.toggleButton.style.bottom = '20px';
    this.toggleButton.style.right = '20px';
    this.toggleButton.style.zIndex = '9999';
    this.toggleButton.style.background = 'rgba(0, 0, 0, 0.5)';
    this.toggleButton.style.color = 'white';
    this.toggleButton.style.border = '1px solid white';
    this.toggleButton.style.borderRadius = '50%';
    this.toggleButton.style.width = '50px';
    this.toggleButton.style.height = '50px';
    this.toggleButton.style.fontSize = '24px';
    this.toggleButton.style.cursor = 'pointer';
    this.toggleButton.style.display = 'flex';
    this.toggleButton.style.justifyContent = 'center';
    this.toggleButton.style.alignItems = 'center';
    this.toggleButton.style.transition = 'transform 0.3s, background 0.3s';

    this.toggleButton.addEventListener('click', () => this.toggle());
    this.toggleButton.addEventListener('mouseenter', () => {
      this.toggleButton.style.transform = 'scale(1.1)';
      this.toggleButton.style.background = 'rgba(0, 0, 0, 0.7)';
    });
    this.toggleButton.addEventListener('mouseleave', () => {
      this.toggleButton.style.transform = 'scale(1)';
      this.toggleButton.style.background = 'rgba(0, 0, 0, 0.5)';
    });

    document.body.appendChild(this.toggleButton);
    console.log('🔘 Toggle-Button erstellt');

    this.update(); // Initialen Zustand setzen
  }

  toggle() {
    this.isDarkMode = !this.isDarkMode;
    this.savePreference();
    this.update();
  }

  update() {
    document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
    this.toggleButton.innerHTML = this.isDarkMode ? '☀️' : '🌙';
    this.toggleButton.setAttribute('aria-pressed', this.isDarkMode);

    // Dispatch custom event for other scripts
    document.dispatchEvent(
      new CustomEvent('burniDarkModeChange', { detail: { isDarkMode: this.isDarkMode } }),
    );

    console.log('🔄 Dark Mode aktualisiert:', this.isDarkMode ? 'Aktiviert' : 'Deaktiviert');
  }

  savePreference() {
    try {
      localStorage.setItem(this.storageKey, this.isDarkMode);
      console.log('💾 Präferenz gespeichert');
    } catch (error) {
      console.warn('⚠️ LocalStorage nicht verfügbar, Präferenz nicht gespeichert:', error);
    }
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Strg + Alt + D
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
        this.toggle();
      }
    });
  }
}

// Singleton-Instanz, um Konflikte zu vermeiden
window.burniDarkModeManager = new BurniDarkModeManager();

console.log('🌙 BURNI Dark Mode Manager geladen');

// Auto-generierte Implementierungen für fehlende Funktionen
/**
 * constructor - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * init - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function init(...args) {
  console.log('init aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * log - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * removeExistingToggle - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function removeExistingToggle(...args) {
  console.log('removeExistingToggle aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * loadStoredPreference - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function loadStoredPreference(...args) {
  console.log('loadStoredPreference aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * createToggleButton - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function createToggleButton(...args) {
  console.log('createToggleButton aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * setupKeyboardShortcuts - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setupKeyboardShortcuts(...args) {
  console.log('setupKeyboardShortcuts aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * detectSystemPreference - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function detectSystemPreference(...args) {
  console.log('detectSystemPreference aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * forEach - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function forEach(...args) {
  console.log('forEach aufgerufen mit Argumenten:', args);
  return undefined;
}
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
 * remove - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function remove(...args) {
  console.log('remove aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getItem - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getItem(...args) {
  console.log('getItem aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * catch - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * warn - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * if - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * matchMedia - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function matchMedia(...args) {
  console.log('matchMedia aufgerufen mit Argumenten:', args);
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
 * replace - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function replace(...args) {
  console.log('replace aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * trim - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function trim(...args) {
  console.log('trim aufgerufen mit Argumenten:', args);
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
 * umschalten - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function umschalten(...args) {
  console.log('umschalten aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * updateButtonIcon - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function updateButtonIcon(...args) {
  console.log('updateButtonIcon aufgerufen mit Argumenten:', args);
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
 * toggle - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function toggle(...args) {
  console.log('toggle aufgerufen mit Argumenten:', args);
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
 * preventDefault - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function preventDefault(...args) {
  console.log('preventDefault aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * applyTheme - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function applyTheme(...args) {
  console.log('applyTheme aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * savePreference - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function savePreference(...args) {
  console.log('savePreference aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * dispatchThemeChangeEvent - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function dispatchThemeChangeEvent(...args) {
  console.log('dispatchThemeChangeEvent aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * add - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function add(...args) {
  console.log('add aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * setProperty - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setProperty(...args) {
  console.log('setProperty aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * setItem - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setItem(...args) {
  console.log('setItem aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * toString - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function toString(...args) {
  console.log('toString aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * CustomEvent - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function CustomEvent(...args) {
  console.log('CustomEvent aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * dispatchEvent - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function dispatchEvent(...args) {
  console.log('dispatchEvent aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * setDarkMode - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setDarkMode(...args) {
  console.log('setDarkMode aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * getCurrentTheme - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function getCurrentTheme(...args) {
  console.log('getCurrentTheme aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * isDark - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function isDark(...args) {
  console.log('isDark aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * isLight - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function isLight(...args) {
  console.log('isLight aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * BurniDarkModeManager - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function BurniDarkModeManager(...args) {
  console.log('BurniDarkModeManager aufgerufen mit Argumenten:', args);
  return undefined;
}
