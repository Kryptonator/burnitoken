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
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = prefersDark;
      console.log('🖥️ System-Präferenz erkannt:', prefersDark ? 'Dark' : 'Light');
    }
  }

  createToggleButton() {
    // Container
    const container = document.createElement('div');
    container.id = 'burni-dark-mode-container';
    container.className = 'fixed z-50 top-4 right-4';

    // Button
    this.toggleButton = document.createElement('button');
    this.toggleButton.id = 'burni-dark-mode-toggle';
    this.toggleButton.className = `
            flex items-center justify-center w-12 h-12 rounded-full 
            bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500
            text-white shadow-lg transform transition-all duration-300 
            hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50
        `
      .replace(/\s+/g, ' ')
      .trim();

    this.toggleButton.setAttribute('aria-label', 'Dark Mode umschalten');
    this.toggleButton.setAttribute('title', 'Dark Mode umschalten (Ctrl+Shift+D)');

    // Icon setzen
    this.updateButtonIcon();

    // Event Listener
    this.toggleButton.addEventListener('click', () => this.toggle());

    // Zusammenbauen
    container.appendChild(this.toggleButton);
    document.body.appendChild(container);

    console.log('🎛️ Dark-Mode-Toggle erstellt');
  }

  updateButtonIcon() {
    if (this.toggleButton) {
      this.toggleButton.innerHTML = this.isDarkMode
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+D oder Cmd+Shift+D
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        this.toggle();
      }
    });

    console.log('⌨️ Keyboard-Shortcuts eingerichtet: Ctrl+Shift+D');
  }

  toggle() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.savePreference();
    this.updateButtonIcon();

    // Event für andere Scripts
    this.dispatchThemeChangeEvent();

    console.log('🔄 Dark Mode umgeschaltet:', this.isDarkMode ? 'Dark' : 'Light');
  }

  applyTheme() {
    const html = document.documentElement;
    const body = document.body;

    if (this.isDarkMode) {
      html.classList.add('dark');
      body.classList.add('dark-mode');
      body.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark-mode');
      body.setAttribute('data-theme', 'light');
    }

    // CSS Custom Properties für kompatible Themes
    document.documentElement.style.setProperty('--theme-mode', this.isDarkMode ? 'dark' : 'light');
  }

  savePreference() {
    try {
      localStorage.setItem(this.storageKey, this.isDarkMode.toString());
    } catch (error) {
      console.warn('⚠️ Konnte Präferenz nicht speichern:', error);
    }
  }

  dispatchThemeChangeEvent() {
    const event = new CustomEvent('burni-theme-change', {
      detail: {
        isDarkMode: this.isDarkMode,
        theme: this.isDarkMode ? 'dark' : 'light',
      },
    });

    document.dispatchEvent(event);
  }

  // Public API
  setDarkMode(isDark) {
    this.isDarkMode = isDark;
    this.applyTheme();
    this.savePreference();
    this.updateButtonIcon();
    this.dispatchThemeChangeEvent();
  }

  getCurrentTheme() {
    return this.isDarkMode ? 'dark' : 'light';
  }

  isDark() {
    return this.isDarkMode;
  }

  isLight() {
    return !this.isDarkMode;
  }
}

// Global verfügbar machen
window.BurniDarkModeManager = BurniDarkModeManager;

// Auto-Initialisierung wenn DOM bereit ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.burniDarkMode) {
      window.burniDarkMode = new BurniDarkModeManager();
    }
  });
} else {
  // DOM bereits bereit
  if (!window.burniDarkMode) {
    window.burniDarkMode = new BurniDarkModeManager();
  }
}

console.log('🌙 BURNI Dark Mode Manager geladen');
