/**
 * Advanced Accessibility Manager for Burni Token Website
 * Provides comprehensive accessibility features and user customization options
 */

(function () {
  'use strict';

  // Avoid duplicate initialization
  if (window.AccessibilityManager) {
    console.log('AccessibilityManager already exists, skipping initialization');
    return;
  }

  // Safari immediate detection and setup - use global detection
  if (typeof window.isSafari === 'undefined') {
    window.isSafari =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
      (/WebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent));
  }

  if (window.isSafari) {
    console.log('Safari detected in accessibility script');
    document.body.classList.add('safari-browser');
  }

  class AccessibilityManager {
    constructor() {
      this.settings = {
        highContrast: false,
        fontSize: 'normal', // small, normal, large, xlarge
        reducedMotion: false,
        focusVisible: true,
        keyboardNavigation: true,
        screenReaderOptimized: false,
        colorBlindFriendly: false,
      };

      this.storageKey = 'burni-accessibility-settings';
      this.focusableElements = [];
      this.currentFocusIndex = -1;

      this.init();
    }

    init() {
      console.log('AccessibilityManager init() called');
      try {
        // Safari compatibility check
        if (this.isSafari()) {
          console.log('Safari detected, using compatibility mode');
          this.setupSafariCompatibility();
        }

        console.log('Loading settings...');
        this.loadSettings();
        console.log('Applying settings...');
        this.applySettings();
        console.log('Creating accessibility panel...');
        this.createAccessibilityPanel();
        console.log('Setting up keyboard navigation...');
        this.setupKeyboardNavigation();
        console.log('Setting up focus management...');
        this.setupFocusManagement();
        console.log('Setting up screen reader...');
        this.setupScreenReader();
        console.log('Detecting user preferences...');
        this.detectUserPreferences();
        console.log('Adding skip links...');
        this.addSkipLinks();
        console.log('Accessibility Manager initialized successfully');
      } catch (error) {
        console.error('Error in AccessibilityManager init():', error);
        throw error;
      }
    }

    loadSettings() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
      } catch (error) {
        console.warn('Could not load accessibility settings:', error);
      }
    }

    saveSettings() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      } catch (error) {
        console.warn('Could not save accessibility settings:', error);
      }
    }

    applySettings() {
      this.applyHighContrast();
      this.applyFontSize();
      this.applyReducedMotion();
      this.applyFocusVisible();
      this.applyColorBlindFriendly();
      this.applyScreenReaderOptimizations();
    }

    createAccessibilityPanel() {
      console.log('Creating accessibility panel...');
      try {
        // Create floating accessibility button
        console.log('Creating accessibility button...');
        const accessibilityButton = document.createElement('button');
        accessibilityButton.className =
          'fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-110';
        accessibilityButton.id = 'accessibility-toggle';
        accessibilityButton.setAttribute('aria-label', 'Open accessibility panel');
        accessibilityButton.innerHTML = '♿';
        console.log('Accessibility button created:', accessibilityButton);

        // Create accessibility panel
        console.log('Creating accessibility panel...');
        const panel = document.createElement('div');
        panel.className =
          'fixed bottom-20 right-4 z-40 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-6 transform opacity-0 scale-95 translate-y-4 transition-all duration-300 pointer-events-none';
        panel.id = 'accessibility-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'accessibility-panel-title');

        panel.innerHTML = `
                    <div class="flex justify-between items-center mb-4">
                        <h3 id="accessibility-panel-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                            Accessibility Options
                        </h3>
                        <button id="close-accessibility-panel" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            ✕
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- High Contrast -->
                        <div class="flex items-center justify-between">
                            <label for="high-contrast-toggle" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                High Contrast
                            </label>
                            <button id="high-contrast-toggle" role="switch" aria-checked="false"
                                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200">
                                <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"></span>
                            </button>
                        </div>
                        
                        <!-- Font Size -->
                        <div>
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                                Font Size
                            </label>
                            <div class="grid grid-cols-4 gap-1">
                                <button data-font-size="small" class="font-size-btn px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700">A</button>
                                <button data-font-size="normal" class="font-size-btn px-2 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700">A</button>
                                <button data-font-size="large" class="font-size-btn px-2 py-1 text-base border rounded hover:bg-gray-100 dark:hover:bg-gray-700">A</button>
                                <button data-font-size="xlarge" class="font-size-btn px-2 py-1 text-lg border rounded hover:bg-gray-100 dark:hover:bg-gray-700">A</button>
                            </div>
                        </div>
                        
                        <!-- Reduced Motion -->
                        <div class="flex items-center justify-between">
                            <label for="reduced-motion-toggle" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reduce Motion
                            </label>
                            <button id="reduced-motion-toggle" role="switch" aria-checked="false"
                                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200">
                                <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"></span>
                            </button>
                        </div>
                        
                        <!-- Reset Button -->
                        <button id="reset-accessibility" class="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            Reset to Defaults
                        </button>
                    </div>
                `;

        console.log('Panel HTML set, creating event listeners...');
        // Add event listeners
        this.setupPanelEvents(accessibilityButton, panel);

        console.log('Appending elements to DOM...'); // Safari-specific DOM insertion
        if (this.safariMode) {
          // Use immediate insertion for Safari
          document.body.appendChild(accessibilityButton);
          document.body.appendChild(panel);

          // Force Safari to render
          accessibilityButton.offsetHeight;
          panel.offsetHeight;

          // Set data attribute for Safari tests - force synchronous
          document.body.setAttribute('data-accessibility-loaded', 'true');
          console.log('Accessibility panel created successfully (Safari mode)');
        } else {
          document.body.appendChild(accessibilityButton);
          document.body.appendChild(panel);
          console.log('Accessibility panel created successfully');
        }
      } catch (error) {
        console.error('Error creating accessibility panel:', error);
        throw error;
      }
    }

    setupPanelEvents(button, panel) {
      // Toggle panel
      button.addEventListener('click', () => this.togglePanel());

      // Close panel
      panel
        .querySelector('#close-accessibility-panel')
        .addEventListener('click', () => this.closePanel());

      // High contrast toggle
      panel.querySelector('#high-contrast-toggle').addEventListener('click', () => {
        this.settings.highContrast = !this.settings.highContrast;
        this.applyHighContrast();
        this.updateToggleState('high-contrast-toggle', this.settings.highContrast);
        this.saveSettings();
      });

      // Font size buttons
      panel.querySelectorAll('.font-size-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.settings.fontSize = btn.dataset.fontSize;
          this.applyFontSize();
          this.updateFontSizeButtons();
          this.saveSettings();
        });
      });

      // Reduced motion toggle
      panel.querySelector('#reduced-motion-toggle').addEventListener('click', () => {
        this.settings.reducedMotion = !this.settings.reducedMotion;
        this.applyReducedMotion();
        this.updateToggleState('reduced-motion-toggle', this.settings.reducedMotion);
        this.saveSettings();
      });

      // Reset button
      panel.querySelector('#reset-accessibility').addEventListener('click', () => {
        this.resetToDefaults();
      });

      // Close panel when clicking outside
      document.addEventListener('click', (event) => {
        if (!panel.contains(event.target) && !button.contains(event.target)) {
          this.closePanel();
        }
      });

      // Close panel with Escape key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.isPanelOpen()) {
          this.closePanel();
        }
      });
    }

    togglePanel() {
      if (this.isPanelOpen()) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }

    openPanel() {
      const panel = document.getElementById('accessibility-panel');
      panel.style.pointerEvents = 'auto';
      panel.style.opacity = '1';
      panel.style.transform = 'scale(1) translateY(0)';

      // Update toggle states
      this.updateAllToggleStates();
      this.updateFontSizeButtons();

      // Focus first element in panel
      setTimeout(() => {
        const firstFocusable = panel.querySelector(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }, 100);
    }

    closePanel() {
      const panel = document.getElementById('accessibility-panel');
      panel.style.pointerEvents = 'none';
      panel.style.opacity = '0';
      panel.style.transform = 'scale(0.95) translateY(4px)';
    }

    isPanelOpen() {
      const panel = document.getElementById('accessibility-panel');
      return panel && panel.style.opacity === '1';
    }

    updateToggleState(toggleId, isActive) {
      const toggle = document.getElementById(toggleId);
      const span = toggle.querySelector('span');

      if (isActive) {
        toggle.classList.remove('bg-gray-200');
        toggle.classList.add('bg-blue-600');
        toggle.setAttribute('aria-checked', 'true');
        span.classList.add('translate-x-5');
      } else {
        toggle.classList.remove('bg-blue-600');
        toggle.classList.add('bg-gray-200');
        toggle.setAttribute('aria-checked', 'false');
        span.classList.remove('translate-x-5');
      }
    }

    updateAllToggleStates() {
      this.updateToggleState('high-contrast-toggle', this.settings.highContrast);
      this.updateToggleState('reduced-motion-toggle', this.settings.reducedMotion);
    }

    updateFontSizeButtons() {
      document.querySelectorAll('.font-size-btn').forEach((btn) => {
        if (btn.dataset.fontSize === this.settings.fontSize) {
          btn.classList.add('bg-blue-600', 'text-white');
          btn.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        } else {
          btn.classList.remove('bg-blue-600', 'text-white');
          btn.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        }
      });
    }

    applyHighContrast() {
      if (this.settings.highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    }

    applyFontSize() {
      // Remove existing font size classes
      document.body.classList.remove('font-small', 'font-normal', 'font-large', 'font-xlarge');
      // Add new font size class
      document.body.classList.add('font-' + this.settings.fontSize);
    }

    applyReducedMotion() {
      if (this.settings.reducedMotion) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    }

    applyFocusVisible() {
      if (this.settings.focusVisible) {
        document.body.classList.add('focus-visible-enabled');
      } else {
        document.body.classList.remove('focus-visible-enabled');
      }
    }

    applyColorBlindFriendly() {
      if (this.settings.colorBlindFriendly) {
        document.body.classList.add('colorblind-friendly');
      } else {
        document.body.classList.remove('colorblind-friendly');
      }
    }

    applyScreenReaderOptimizations() {
      if (this.settings.screenReaderOptimized) {
        document.body.classList.add('screen-reader-optimized');
        this.addAriaDescriptions();
      } else {
        document.body.classList.remove('screen-reader-optimized');
      }
    }

    setupKeyboardNavigation() {
      // Global keyboard shortcuts
      document.addEventListener('keydown', (event) => {
        // Alt + A: Open accessibility panel
        if (event.altKey && event.key === 'a') {
          event.preventDefault();
          document.getElementById('accessibility-toggle').click();
        }

        // Alt + H: Toggle high contrast
        if (event.altKey && event.key === 'h') {
          event.preventDefault();
          this.settings.highContrast = !this.settings.highContrast;
          this.applyHighContrast();
          this.saveSettings();
          this.announceToScreenReader(
            'High contrast ' + (this.settings.highContrast ? 'enabled' : 'disabled'),
          );
        }

        // Alt + M: Toggle reduced motion
        if (event.altKey && event.key === 'm') {
          event.preventDefault();
          this.settings.reducedMotion = !this.settings.reducedMotion;
          this.applyReducedMotion();
          this.saveSettings();
          this.announceToScreenReader(
            'Reduced motion ' + (this.settings.reducedMotion ? 'enabled' : 'disabled'),
          );
        }
      });
    }

    setupFocusManagement() {
      // Enhanced focus indicators
      document.addEventListener('focusin', (event) => {
        if (this.settings.focusVisible) {
          event.target.classList.add('accessibility-focused');
        }
      });

      document.addEventListener('focusout', (event) => {
        event.target.classList.remove('accessibility-focused');
      });
    }

    addSkipLinks() {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className =
        'sr-only focus:not-sr-only fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';
      skipLink.textContent = 'Skip to main content';

      document.body.insertBefore(skipLink, document.body.firstChild);

      // Ensure main content has an ID
      const main = document.querySelector('main');
      if (main && !main.id) {
        main.id = 'main-content';
      }
    }

    setupScreenReader() {
      // Create live region for announcements
      const liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
      const liveRegion = document.getElementById('accessibility-announcements');
      if (liveRegion) {
        liveRegion.textContent = message;

        // Clear after 1 second to allow for new announcements
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    }

    addAriaDescriptions() {
      // Add missing aria-labels and descriptions
      document.querySelectorAll('img:not([alt])').forEach((img) => {
        img.setAttribute('alt', 'Decorative image');
      });

      document
        .querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
        .forEach((input) => {
          const label = document.querySelector('label[for="' + input.id + '"]');
          if (!label && input.placeholder) {
            input.setAttribute('aria-label', input.placeholder);
          }
        });

      // Add landmark roles where missing
      const nav = document.querySelector('nav:not([role])');
      if (nav) nav.setAttribute('role', 'navigation');

      const main = document.querySelector('main:not([role])');
      if (main) main.setAttribute('role', 'main');

      const footer = document.querySelector('footer:not([role])');
      if (footer) footer.setAttribute('role', 'contentinfo');
    }

    detectUserPreferences() {
      // Check for system preferences
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.settings.reducedMotion = true;
      }

      if (window.matchMedia('(prefers-contrast: high)').matches) {
        this.settings.highContrast = true;
      }

      // Listen for changes
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (e.matches) {
          this.settings.reducedMotion = true;
          this.applyReducedMotion();
          this.saveSettings();
        }
      });

      window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
        if (e.matches) {
          this.settings.highContrast = true;
          this.applyHighContrast();
          this.saveSettings();
        }
      });
    }

    resetToDefaults() {
      this.settings = {
        highContrast: false,
        fontSize: 'normal',
        reducedMotion: false,
        focusVisible: true,
        keyboardNavigation: true,
        screenReaderOptimized: false,
        colorBlindFriendly: false,
      };

      this.applySettings();
      this.updateAllToggleStates();
      this.updateFontSizeButtons();
      this.saveSettings();

      this.announceToScreenReader('Accessibility settings reset to defaults');
    }

    // Add CSS for accessibility features
    addAccessibilityStyles() {
      if (document.getElementById('accessibility-styles')) {
        return; // Already added
      }

      const style = document.createElement('style');
      style.id = 'accessibility-styles';
      style.textContent = `
                /* High Contrast Mode */
                .high-contrast {
                    filter: contrast(150%) brightness(110%);
                }
                
                .high-contrast * {
                    border-color: currentColor !important;
                }
                
                /* Font Size Classes */
                .font-small { font-size: 14px; }
                .font-normal { font-size: 16px; }
                .font-large { font-size: 18px; }
                .font-xlarge { font-size: 20px; }
                
                /* Reduced Motion */
                .reduced-motion *,
                .reduced-motion *::before,
                .reduced-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
                
                /* Enhanced Focus Indicators */
                .focus-visible-enabled .accessibility-focused {
                    outline: 3px solid #2563eb !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.2) !important;
                }
                
                /* Color Blind Friendly */
                .colorblind-friendly .bg-red-500 { background-color: #dc2626 !important; }
                .colorblind-friendly .bg-green-500 { background-color: #059669 !important; }
                .colorblind-friendly .text-red-500 { color: #dc2626 !important; }
                .colorblind-friendly .text-green-500 { color: #059669 !important; }
                
                /* Screen Reader Only */
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
                
                .focus\\:not-sr-only:focus {
                    position: static;
                    width: auto;
                    height: auto;
                    padding: 0.5rem 1rem;
                    margin: 0;
                    overflow: visible;
                    clip: auto;
                    white-space: normal;
                }
                
                /* Screen Reader Optimized */
                .screen-reader-optimized img:not([alt]) {
                    opacity: 0.5;
                }
                
                .screen-reader-optimized [aria-hidden="true"] {
                    opacity: 0.7;
                }
            `;
      document.head.appendChild(style);
    }

    // Safari compatibility methods
    isSafari() {
      return (
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
        (/WebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
      );
    }

    setupSafariCompatibility() {
      // Add Safari-specific CSS
      const safariStyles = document.createElement('style');
      safariStyles.id = 'safari-accessibility-compatibility';
      safariStyles.textContent = `
                /* Safari-specific accessibility fixes */
                .accessibility-panel {
                    -webkit-transform: translateZ(0);
                    transform: translateZ(0);
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                }
                
                .accessibility-button {
                    -webkit-appearance: none;
                    appearance: none;
                }
                
                /* Ensure proper rendering */
                body.safari-compat * {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
            `;
      document.head.appendChild(safariStyles);

      // Add Safari compatibility class
      document.body.classList.add('safari-compat');

      // Safari-specific timing adjustments
      this.safariMode = true;
      this.initDelay = 500; // Longer delay for Safari
    }

    // Public API
    getSettings() {
      return { ...this.settings };
    }

    updateSetting(key, value) {
      if (key in this.settings) {
        this.settings[key] = value;
        this.applySettings();
        this.saveSettings();
      }
    }
  }

  // Initialize when DOM is ready
  console.log('Accessibility script loaded, readyState:', document.readyState);
  if (document.readyState === 'loading') {
    console.log('DOM still loading, adding DOMContentLoaded listener for accessibility');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOMContentLoaded fired, creating AccessibilityManager');
      try {
        window.AccessibilityManager = new AccessibilityManager();
        window.AccessibilityManager.addAccessibilityStyles();
        console.log('AccessibilityManager created successfully');
      } catch (error) {
        console.error('Error creating AccessibilityManager:', error);
      }
    });
  } else {
    console.log('DOM ready, creating AccessibilityManager immediately');
    try {
      window.AccessibilityManager = new AccessibilityManager();
      window.AccessibilityManager.addAccessibilityStyles();
      console.log('AccessibilityManager created successfully');
    } catch (error) {
      console.error('Error creating AccessibilityManager:', error);
    }
  }

  // Safari-specific initialization - immediate execution
  if (window.isSafari) {
    // Force immediate initialization for Safari
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          if (!window.AccessibilityManager) {
            console.log('Creating AccessibilityManager for Safari');
            window.AccessibilityManager = new AccessibilityManager();
            window.accessibilityToggle = true;
          }
        }, 50);
      });
    } else {
      // DOM already loaded
      setTimeout(() => {
        if (!window.AccessibilityManager) {
          console.log('Creating AccessibilityManager for Safari (DOM ready)');
          window.AccessibilityManager = new AccessibilityManager();
          window.accessibilityToggle = true;
        }
      }, 50);
    }
  }

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
  }
})(); // End of IIFE
