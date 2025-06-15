/**
 * Enhanced Accessibility Features for BURNI Token Website
 * WCAG 2.1 AA compliance and advanced accessibility tools
 */

class BURNIAccessibility {
  constructor() {
    this.settings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindFriendly: false,
    };

    this.init();
  }

  /**
   * Initialize accessibility features
   */
  init() {
    this.loadUserPreferences();
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupFocusManagement();
    this.createAccessibilityToolbar();
    this.monitorUserPreferences();
    console.log('♿ Accessibility features initialized');
  }

  /**
   * Load user accessibility preferences
   */
  loadUserPreferences() {
    try {
      const savedSettings = localStorage.getItem('burni-accessibility-settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }

      // Apply saved settings
      this.applyAccessibilitySettings();
    } catch (error) {
      console.warn('Could not load accessibility preferences:', error);
    }
  }

  /**
   * Save user accessibility preferences
   */
  saveUserPreferences() {
    try {
      localStorage.setItem('burni-accessibility-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Could not save accessibility preferences:', error);
    }
  }

  /**
   * Setup enhanced keyboard navigation
   */
  setupKeyboardNavigation() {
    // Skip to main content link
    this.createSkipLink();

    // Enhanced tab navigation
    this.setupTabTraps();

    // Keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Focus visible indicators
    this.enhanceFocusIndicators();
  }

  /**
   * Create skip to main content link
   */
  createSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.setAttribute('aria-label', 'Skip to main content');

    // Style the skip link
    skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;

    // Show on focus
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Setup tab traps for modals and dropdowns
   */
  setupTabTraps() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const activeModal = document.querySelector('.modal:not([hidden])');
        if (activeModal) {
          this.trapFocusInElement(e, activeModal);
        }
      }
    });
  }

  /**
   * Trap focus within an element
   */
  trapFocusInElement(event, element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + M: Go to main content
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const main = document.getElementById('main-content') || document.querySelector('main');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Alt + N: Go to navigation
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const nav = document.querySelector('nav');
        if (nav) {
          const firstLink = nav.querySelector('a');
          if (firstLink) firstLink.focus();
        }
      }

      // Alt + H: Go to header
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        const header = document.querySelector('header') || document.querySelector('h1');
        if (header) {
          header.focus();
          header.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Alt + F: Go to footer
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        const footer = document.querySelector('footer');
        if (footer) {
          footer.focus();
          footer.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Alt + A: Open accessibility settings
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        this.toggleAccessibilityToolbar();
      }
    });
  }

  /**
   * Enhance focus indicators
   */
  enhanceFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
            .enhanced-focus:focus,
            .enhanced-focus:focus-visible {
                outline: 3px solid #ff6b35 !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 1px #fff, 0 0 0 4px #ff6b35 !important;
            }
            
            .focus-ring {
                position: relative;
            }
            
            .focus-ring:focus::after {
                content: '';
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px;
                border: 2px solid #ff6b35;
                border-radius: 8px;
                pointer-events: none;
            }
        `;
    document.head.appendChild(style);

    // Add enhanced focus class to interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    interactiveElements.forEach((element) => {
      element.classList.add('enhanced-focus');
    });
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Add ARIA live regions
    this.createLiveRegions();

    // Enhance existing elements with ARIA attributes
    this.enhanceARIAAttributes();

    // Add screen reader announcements
    this.setupScreenReaderAnnouncements();
  }

  /**
   * Create ARIA live regions
   */
  createLiveRegions() {
    // Polite announcements
    const politeRegion = document.createElement('div');
    politeRegion.id = 'aria-live-polite';
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
    document.body.appendChild(politeRegion);

    // Assertive announcements
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'aria-live-assertive';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.style.cssText = politeRegion.style.cssText;
    document.body.appendChild(assertiveRegion);
  }

  /**
   * Announce to screen readers
   */
  announceToScreenReader(message, priority = 'polite') {
    const region = document.getElementById(`aria-live-${priority}`);
    if (region) {
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  }

  /**
   * Enhance ARIA attributes
   */
  enhanceARIAAttributes() {
    // Add labels to buttons without text
    document
      .querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
      .forEach((button) => {
        const icon = button.querySelector('i');
        if (icon && !button.textContent.trim()) {
          const iconClass = icon.className;
          let label = 'Button';

          // Infer label from icon class
          if (iconClass.includes('home')) label = 'Home';
          else if (iconClass.includes('menu')) label = 'Menu';
          else if (iconClass.includes('close')) label = 'Close';
          else if (iconClass.includes('search')) label = 'Search';
          else if (iconClass.includes('user')) label = 'User menu';

          button.setAttribute('aria-label', label);
        }
      });

    // Add headings hierarchy
    this.fixHeadingHierarchy();

    // Add form labels
    this.enhanceFormAccessibility();
  }

  /**
   * Fix heading hierarchy for screen readers
   */
  fixHeadingHierarchy() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));

      // Add role and aria-level for proper hierarchy
      heading.setAttribute('role', 'heading');
      heading.setAttribute('aria-level', level.toString());

      currentLevel = level;
    });
  }

  /**
   * Enhance form accessibility
   */
  enhanceFormAccessibility() {
    // Associate labels with inputs
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach((input) => {
      const label =
        input.closest('label') ||
        document.querySelector(`label[for="${input.id}"]`) ||
        input.previousElementSibling;

      if (label && label.tagName === 'LABEL') {
        if (!input.id) {
          input.id = 'input-' + Math.random().toString(36).substr(2, 9);
          label.setAttribute('for', input.id);
        }
      } else {
        // Create accessible label from placeholder or nearby text
        const placeholder = input.getAttribute('placeholder');
        if (placeholder) {
          input.setAttribute('aria-label', placeholder);
        }
      }
    });

    // Add error announcements
    document.querySelectorAll('input').forEach((input) => {
      input.addEventListener('invalid', () => {
        const errorMessage = input.validationMessage;
        this.announceToScreenReader(`Error: ${errorMessage}`, 'assertive');
      });
    });
  }

  /**
   * Setup screen reader announcements for dynamic content
   */
  setupScreenReaderAnnouncements() {
    // Announce price updates
    const priceElements = document.querySelectorAll('[id*="price"], [class*="price"]');
    priceElements.forEach((element) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const newValue = element.textContent.trim();
            if (newValue) {
              this.announceToScreenReader(`Price updated: ${newValue}`);
            }
          }
        });
      });

      observer.observe(element, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });
  }

  /**
   * Create accessibility toolbar
   */
  createAccessibilityToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'accessibility-toolbar';
    toolbar.className = 'accessibility-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Accessibility Settings');
    toolbar.style.display = 'none';

    toolbar.innerHTML = `
            <div class="toolbar-header">
                <h3>♿ Accessibility Settings</h3>
                <button class="close-toolbar" aria-label="Close accessibility settings">×</button>
            </div>
            <div class="toolbar-content">
                <div class="setting-group">
                    <label class="setting-item">
                        <input type="checkbox" id="high-contrast" ${this.settings.highContrast ? 'checked' : ''}>
                        <span>High Contrast</span>
                    </label>
                    
                    <label class="setting-item">
                        <input type="checkbox" id="large-text" ${this.settings.largeText ? 'checked' : ''}>
                        <span>Large Text</span>
                    </label>
                    
                    <label class="setting-item">
                        <input type="checkbox" id="reduced-motion" ${this.settings.reducedMotion ? 'checked' : ''}>
                        <span>Reduced Motion</span>
                    </label>
                    
                    <label class="setting-item">
                        <input type="checkbox" id="color-blind-friendly" ${this.settings.colorBlindFriendly ? 'checked' : ''}>
                        <span>Color Blind Friendly</span>
                    </label>
                </div>
                
                <div class="toolbar-actions">
                    <button class="reset-settings">Reset to Default</button>
                    <button class="save-settings">Save Settings</button>
                </div>
            </div>
        `;

    this.styleAccessibilityToolbar();
    document.body.appendChild(toolbar);
    this.setupToolbarEvents();
  }

  /**
   * Style accessibility toolbar
   */
  styleAccessibilityToolbar() {
    const style = document.createElement('style');
    style.textContent = `
            .accessibility-toolbar {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fff;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 1rem;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                max-width: 300px;
                font-family: inherit;
            }
            
            .toolbar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                border-bottom: 1px solid #ccc;
                padding-bottom: 0.5rem;
            }
            
            .toolbar-header h3 {
                margin: 0;
                font-size: 1.1rem;
            }
            
            .close-toolbar {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
            }
            
            .setting-item {
                display: flex;
                align-items: center;
                margin-bottom: 0.5rem;
                cursor: pointer;
            }
            
            .setting-item input {
                margin-right: 0.5rem;
            }
            
            .toolbar-actions {
                margin-top: 1rem;
                display: flex;
                gap: 0.5rem;
            }
            
            .toolbar-actions button {
                flex: 1;
                padding: 0.5rem;
                border: 1px solid #ccc;
                border-radius: 4px;
                background: #f5f5f5;
                cursor: pointer;
            }
            
            .toolbar-actions button:hover {
                background: #e0e0e0;
            }
            
            /* Accessibility button */
            .accessibility-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #ff6b35;
                color: white;
                border: none;
                border-radius: 50%;
                width: 56px;
                height: 56px;
                font-size: 1.5rem;
                cursor: pointer;
                z-index: 9999;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: transform 0.2s;
            }
            
            .accessibility-toggle:hover {
                transform: scale(1.1);
            }
            
            /* High contrast mode */
            .high-contrast {
                filter: contrast(150%) !important;
                background: #000 !important;
                color: #fff !important;
            }
            
            .high-contrast a {
                color: #ffff00 !important;
            }
            
            .high-contrast button {
                background: #fff !important;
                color: #000 !important;
                border: 2px solid #fff !important;
            }
            
            /* Large text */
            .large-text {
                font-size: 120% !important;
                line-height: 1.6 !important;
            }
            
            /* Reduced motion */
            .reduced-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            /* Color blind friendly */
            .color-blind-friendly {
                filter: saturate(150%) hue-rotate(15deg);
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Setup toolbar events
   */
  setupToolbarEvents() {
    const toolbar = document.getElementById('accessibility-toolbar');

    // Close button
    toolbar.querySelector('.close-toolbar').addEventListener('click', () => {
      this.hideAccessibilityToolbar();
    });

    // Setting checkboxes
    toolbar.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        const setting = e.target.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        this.settings[setting] = e.target.checked;
        this.applyAccessibilitySettings();
        this.saveUserPreferences();
      });
    });

    // Reset button
    toolbar.querySelector('.reset-settings').addEventListener('click', () => {
      this.resetAccessibilitySettings();
    });

    // Save button
    toolbar.querySelector('.save-settings').addEventListener('click', () => {
      this.saveUserPreferences();
      this.announceToScreenReader('Settings saved successfully');
    });

    // Create accessibility toggle button
    this.createAccessibilityToggle();
  }

  /**
   * Create accessibility toggle button
   */
  createAccessibilityToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'accessibility-toggle';
    toggle.innerHTML = '♿';
    toggle.setAttribute('aria-label', 'Open accessibility settings');
    toggle.setAttribute('title', 'Accessibility Settings (Alt+A)');

    toggle.addEventListener('click', () => {
      this.toggleAccessibilityToolbar();
    });

    document.body.appendChild(toggle);
  }

  /**
   * Toggle accessibility toolbar visibility
   */
  toggleAccessibilityToolbar() {
    const toolbar = document.getElementById('accessibility-toolbar');
    const isVisible = toolbar.style.display !== 'none';

    if (isVisible) {
      this.hideAccessibilityToolbar();
    } else {
      this.showAccessibilityToolbar();
    }
  }

  /**
   * Show accessibility toolbar
   */
  showAccessibilityToolbar() {
    const toolbar = document.getElementById('accessibility-toolbar');
    toolbar.style.display = 'block';

    // Focus first element
    const firstCheckbox = toolbar.querySelector('input[type="checkbox"]');
    if (firstCheckbox) {
      firstCheckbox.focus();
    }

    this.announceToScreenReader('Accessibility settings opened');
  }

  /**
   * Hide accessibility toolbar
   */
  hideAccessibilityToolbar() {
    const toolbar = document.getElementById('accessibility-toolbar');
    toolbar.style.display = 'none';

    // Return focus to toggle button
    document.querySelector('.accessibility-toggle').focus();

    this.announceToScreenReader('Accessibility settings closed');
  }

  /**
   * Apply accessibility settings
   */
  applyAccessibilitySettings() {
    document.body.classList.toggle('high-contrast', this.settings.highContrast);
    document.body.classList.toggle('large-text', this.settings.largeText);
    document.body.classList.toggle('reduced-motion', this.settings.reducedMotion);
    document.body.classList.toggle('color-blind-friendly', this.settings.colorBlindFriendly);

    // Update media query for reduced motion
    if (this.settings.reducedMotion) {
      document.documentElement.style.setProperty('--motion-reduce', '1');
    } else {
      document.documentElement.style.setProperty('--motion-reduce', '0');
    }
  }

  /**
   * Reset accessibility settings
   */
  resetAccessibilitySettings() {
    this.settings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindFriendly: false,
    };

    // Update checkboxes
    const toolbar = document.getElementById('accessibility-toolbar');
    toolbar.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      const setting = checkbox.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      checkbox.checked = this.settings[setting] || false;
    });

    this.applyAccessibilitySettings();
    this.saveUserPreferences();
    this.announceToScreenReader('Settings reset to default');
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    let lastFocusedElement = null;

    document.addEventListener('focusin', (e) => {
      lastFocusedElement = e.target;
    });

    // Return focus after modal closes
    document.addEventListener('modalClosed', () => {
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    });
  }

  /**
   * Monitor user preferences (system settings)
   */
  monitorUserPreferences() {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      this.settings.reducedMotion = true;
      this.applyAccessibilitySettings();
    }

    mediaQuery.addEventListener('change', (e) => {
      this.settings.reducedMotion = e.matches;
      this.applyAccessibilitySettings();
    });

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (highContrastQuery.matches) {
      this.settings.highContrast = true;
      this.applyAccessibilitySettings();
    }

    highContrastQuery.addEventListener('change', (e) => {
      this.settings.highContrast = e.matches;
      this.applyAccessibilitySettings();
    });
  }

  /**
   * Test accessibility compliance
   */
  runAccessibilityTest() {
    const issues = [];

    // Check for images without alt text
    document.querySelectorAll('img:not([alt])').forEach((img) => {
      issues.push({
        element: img,
        issue: 'Image missing alt attribute',
        severity: 'high',
      });
    });

    // Check for buttons without accessible names
    document
      .querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
      .forEach((button) => {
        if (!button.textContent.trim()) {
          issues.push({
            element: button,
            issue: 'Button missing accessible name',
            severity: 'high',
          });
        }
      });

    // Check for proper heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    headings.forEach((heading) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      if (currentLevel > lastLevel + 1) {
        issues.push({
          element: heading,
          issue: 'Heading hierarchy skipped',
          severity: 'medium',
        });
      }
      lastLevel = currentLevel;
    });

    console.log('♿ Accessibility test results:', issues);
    return issues;
  }
}

// Initialize accessibility features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.burniAccessibility = new BURNIAccessibility();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BURNIAccessibility;
}
