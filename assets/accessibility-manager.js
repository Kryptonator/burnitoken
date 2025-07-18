/**
 * Enhanced Accessibility Manager for BurniToken
 * Ensures WCAG 2.1 AA compliance and enhanced user experience
 */

class BurniAccessibilityManager {
  constructor() {
    this.isInitialized = false;
    this.preferences = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      keyboardNavigation: true,
      screenReader: false,
    };

    this.focusableElements = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex^="-"])',
    ];

    this.init();
  }

  init() {
    if (this.isInitialized) return;

    this.loadPreferences();
    this.initKeyboardNavigation();
    this.initFocusManagement();
    this.initARIAEnhancements();
    this.initContrastChecker();
    this.initScreenReaderSupport();
    this.createAccessibilityToolbar();
    this.initAccessibilityTests();

    this.isInitialized = true;
    console.log('♿ BurniToken Accessibility Manager initialized');
  }

  loadPreferences() {
    // Load accessibility preferences from localStorage
    const saved = localStorage.getItem('burni-accessibility-preferences');
    if (saved) {
      this.preferences = { ...this.preferences, ...JSON.parse(saved) };
    }

    // Apply saved preferences
    this.applyPreferences();

    // Listen for system preferences
    if (window.matchMedia) {
      // Reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (prefersReducedMotion.matches) {
        this.preferences.reducedMotion = true;
      }

      prefersReducedMotion.addEventListener('change', (e) => {
        this.preferences.reducedMotion = e.matches;
        this.applyPreferences();
      });

      // High contrast preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
      if (prefersHighContrast.matches) {
        this.preferences.highContrast = true;
      }

      prefersHighContrast.addEventListener('change', (e) => {
        this.preferences.highContrast = e.matches;
        this.applyPreferences();
      });
    }
  }

  savePreferences() {
    localStorage.setItem('burni-accessibility-preferences', JSON.stringify(this.preferences));
  }

  applyPreferences() {
    const body = document.body;

    // High contrast mode
    if (this.preferences.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Large text mode
    if (this.preferences.largeText) {
      body.classList.add('large-text');
    } else {
      body.classList.remove('large-text');
    }

    // Reduced motion mode
    if (this.preferences.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }

    // Update CSS custom properties
    document.documentElement.style.setProperty(
      '--accessibility-high-contrast',
      this.preferences.highContrast ? '1' : '0',
    );
    document.documentElement.style.setProperty(
      '--accessibility-large-text',
      this.preferences.largeText ? '1.2' : '1',
    );
    document.documentElement.style.setProperty(
      '--accessibility-reduced-motion',
      this.preferences.reducedMotion ? '1' : '0',
    );
  }

  initKeyboardNavigation() {
    // Ensure all interactive elements are keyboard accessible
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]',
    );

    interactiveElements.forEach((element) => {
      // Add keyboard event handlers
      element.addEventListener('keydown', (e) => {
        // Handle Enter key as click for buttons
        if (
          e.key === 'Enter' &&
          (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button')
        ) {
          e.preventDefault();
          element.click();
        }

        // Handle Space key for checkboxes and buttons
        if (e.key === ' ' && (element.type === 'checkbox' || element.tagName === 'BUTTON')) {
          e.preventDefault();
          element.click();
        }
      });
    });

    // Add keyboard navigation for mobile menu
    this.initMobileMenuKeyboardNavigation();

    // Add keyboard navigation for FAQ toggles
    this.initFAQKeyboardNavigation();
  }

  initMobileMenuKeyboardNavigation() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMobileMenu();
        }
      });

      // Trap focus within mobile menu when open
      mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeMobileMenu();
          mobileMenuButton.focus();
        }

        if (e.key === 'Tab') {
          this.trapFocus(e, mobileMenu);
        }
      });
    }
  }

  initFAQKeyboardNavigation() {
    const faqButtons = document.querySelectorAll('[onclick^="toggleFAQ"]');

    faqButtons.forEach((button) => {
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    });
  }

  initFocusManagement() {
    // Create focus trap utility
    this.focusTrap = null;

    // Add visible focus indicators
    this.addFocusIndicators();

    // Handle focus restoration after modal close
    this.initFocusRestoration();

    // Skip links functionality
    this.initSkipLinks();
  }

  addFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced focus indicators */
      *:focus {
        outline: 2px solid #f97316 !important;
        outline-offset: 2px !important;
      }
      
      .focus-visible {
        outline: 2px solid #f97316 !important;
        outline-offset: 2px !important;
      }
      
      /* High contrast focus indicators */
      .high-contrast *:focus {
        outline: 3px solid #000 !important;
        outline-offset: 3px !important;
        background-color: #ff0 !important;
        color: #000 !important;
      }
      
      /* Skip links */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #f97316;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 6px;
      }
    `;

    document.head.appendChild(style);
  }

  initFocusRestoration() {
    this.lastFocusedElement = null;

    // Store focus before opening modals
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-modal-trigger]')) {
        this.lastFocusedElement = e.target;
      }
    });
  }

  initSkipLinks() {
    const skipLinks = document.querySelectorAll('a[href^="#"]');

    skipLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });

          // Focus the target element
          if (target.tabIndex === -1) {
            target.tabIndex = -1;
          }
          target.focus();
        }
      });
    });
  }

  initARIAEnhancements() {
    // Add ARIA labels to elements that need them
    this.addARIALabels();

    // Add ARIA live regions
    this.addARIALiveRegions();

    // Add ARIA landmarks
    this.addARIALandmarks();

    // Add ARIA states
    this.addARIAStates();
  }

  addARIALabels() {
    // Add labels to buttons without text
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach((button) => {
      const text = button.textContent.trim();
      if (!text) {
        const icon = button.querySelector('i, svg');
        if (icon) {
          button.setAttribute('aria-label', 'Button');
        }
      }
    });

    // Add labels to form inputs
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach((input) => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (!label && input.placeholder) {
        input.setAttribute('aria-label', input.placeholder);
      }
    });
  }

  addARIALiveRegions() {
    // Add live regions for dynamic content
    const priceElements = document.querySelectorAll(
      '[id*="price"], [id*="supply"], [id*="market-cap"]',
    );
    priceElements.forEach((element) => {
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
    });

    // Add live region for notifications
    if (!document.getElementById('aria-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }
  }

  addARIALandmarks() {
    // Ensure main content areas have proper landmarks
    const main = document.querySelector('main');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }

    const nav = document.querySelector('nav');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
    }

    const footer = document.querySelector('footer');
    if (footer && !footer.getAttribute('role')) {
      footer.setAttribute('role', 'contentinfo');
    }
  }

  addARIAStates() {
    // Add expanded states to collapsible elements
    const collapsibleButtons = document.querySelectorAll('[data-toggle], [onclick*="toggle"]');
    collapsibleButtons.forEach((button) => {
      if (!button.getAttribute('aria-expanded')) {
        button.setAttribute('aria-expanded', 'false');
      }
    });
  }

  initContrastChecker() {
    // Check color contrast ratios
    this.checkContrast();
  }

  checkContrast() {
    const elements = document.querySelectorAll('*');
    const issues = [];

    elements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;

      if (color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(color, backgroundColor);

        if (contrast < 4.5) {
          issues.push({
            element: element,
            contrast: contrast,
            required: 4.5,
          });
        }
      }
    });

    if (issues.length > 0) {
      console.warn('⚠️ Contrast issues found:', issues);
    }
  }

  calculateContrast(color1, color2) {
    // Simplified contrast calculation
    // In a real implementation, this would be more sophisticated
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);

    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);

    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  parseColor(color) {
    // Parse RGB color string to values
    const rgb = color.match(/\d+/g);
    return rgb ? rgb.map(Number) : [0, 0, 0];
  }

  getRelativeLuminance(rgb) {
    // Calculate relative luminance
    const [r, g, b] = rgb.map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  initScreenReaderSupport() {
    // Add screen reader only content
    this.addScreenReaderContent();

    // Announce page changes
    this.announcePageChanges();
  }

  addScreenReaderContent() {
    // Add descriptive content for screen readers
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach((img) => {
      img.setAttribute('alt', 'Decorative image');
    });

    // Add descriptions for complex content
    const charts = document.querySelectorAll('[id*="chart"]');
    charts.forEach((chart) => {
      if (!chart.getAttribute('aria-describedby')) {
        const description = document.createElement('div');
        description.id = chart.id + '-description';
        description.className = 'sr-only';
        description.textContent = 'Interactive chart showing data visualization';
        chart.parentNode.insertBefore(description, chart.nextSibling);
        chart.setAttribute('aria-describedby', description.id);
      }
    });
  }

  announcePageChanges() {
    // Announce route changes to screen readers
    let lastUrl = location.href;

    const announceChange = () => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        this.announceToScreenReader(`Page changed to ${document.title}`);
        lastUrl = currentUrl;
      }
    };

    // Listen for navigation changes
    window.addEventListener('popstate', announceChange);

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const target = document.querySelector(location.hash);
      if (target) {
        const heading = target.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          this.announceToScreenReader(`Navigated to ${heading.textContent}`);
        }
      }
    });
  }

  announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  createAccessibilityToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'accessibility-toolbar';
    toolbar.className =
      'fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 hidden';
    toolbar.innerHTML = `
      <div class="mb-3 font-semibold text-gray-800 dark:text-gray-200">♿ Accessibility Tools</div>
      <div class="space-y-2">
        <label class="flex items-center space-x-2">
          <input type="checkbox" id="high-contrast-toggle" class="accessibility-toggle">
          <span class="text-sm">High Contrast</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" id="large-text-toggle" class="accessibility-toggle">
          <span class="text-sm">Large Text</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" id="reduced-motion-toggle" class="accessibility-toggle">
          <span class="text-sm">Reduce Motion</span>
        </label>
        <button type="button" id="focus-test-btn" class="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          Test Focus Order
        </button>
        <button type="button" id="contrast-test-btn" class="w-full px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
          Check Contrast
        </button>
      </div>
    `;

    document.body.appendChild(toolbar);

    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'accessibility-toggle-btn';
    toggleButton.className =
      'fixed bottom-20 right-4 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center';
    toggleButton.innerHTML = '♿';
    toggleButton.setAttribute('aria-label', 'Toggle accessibility tools');

    document.body.appendChild(toggleButton);

    // Add event listeners
    this.addAccessibilityEventListeners(toolbar, toggleButton);
  }

  addAccessibilityEventListeners(toolbar, toggleButton) {
    // Toggle toolbar
    toggleButton.addEventListener('click', () => {
      toolbar.classList.toggle('hidden');
    });

    // High contrast toggle
    document.getElementById('high-contrast-toggle').addEventListener('change', (e) => {
      this.preferences.highContrast = e.target.checked;
      this.applyPreferences();
      this.savePreferences();
    });

    // Large text toggle
    document.getElementById('large-text-toggle').addEventListener('change', (e) => {
      this.preferences.largeText = e.target.checked;
      this.applyPreferences();
      this.savePreferences();
    });

    // Reduced motion toggle
    document.getElementById('reduced-motion-toggle').addEventListener('change', (e) => {
      this.preferences.reducedMotion = e.target.checked;
      this.applyPreferences();
      this.savePreferences();
    });

    // Focus test button
    document.getElementById('focus-test-btn').addEventListener('click', () => {
      this.testFocusOrder();
    });

    // Contrast test button
    document.getElementById('contrast-test-btn').addEventListener('click', () => {
      this.checkContrast();
    });

    // Update checkboxes to reflect current preferences
    document.getElementById('high-contrast-toggle').checked = this.preferences.highContrast;
    document.getElementById('large-text-toggle').checked = this.preferences.largeText;
    document.getElementById('reduced-motion-toggle').checked = this.preferences.reducedMotion;
  }

  testFocusOrder() {
    const focusableElements = document.querySelectorAll(this.focusableElements.join(', '));
    let currentIndex = 0;

    const highlightElement = (element) => {
      element.style.outline = '3px solid red';
      element.style.outlineOffset = '2px';
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const removeHighlight = (element) => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    };

    const testNext = () => {
      if (currentIndex > 0) {
        removeHighlight(focusableElements[currentIndex - 1]);
      }

      if (currentIndex < focusableElements.length) {
        highlightElement(focusableElements[currentIndex]);
        currentIndex++;
        setTimeout(testNext, 1000);
      } else {
        this.announceToScreenReader('Focus order test completed');
      }
    };

    this.announceToScreenReader('Starting focus order test');
    testNext();
  }

  initAccessibilityTests() {
    // Run accessibility tests on page load
    setTimeout(() => {
      this.runAccessibilityTests();
    }, 2000);
  }

  runAccessibilityTests() {
    const results = {
      missingAltText: [],
      missingLabels: [],
      lowContrast: [],
      keyboardIssues: [],
    };

    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    results.missingAltText = Array.from(images);

    // Check for missing labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach((input) => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (!label) {
        results.missingLabels.push(input);
      }
    });

    // Check for keyboard accessibility
    const clickableElements = document.querySelectorAll(
      '[onclick]:not(button):not(a):not([tabindex])',
    );
    results.keyboardIssues = Array.from(clickableElements);

    // Report results
    if (results.missingAltText.length > 0) {
      console.warn('⚠️ Images missing alt text:', results.missingAltText);
    }

    if (results.missingLabels.length > 0) {
      console.warn('⚠️ Form inputs missing labels:', results.missingLabels);
    }

    if (results.keyboardIssues.length > 0) {
      console.warn('⚠️ Clickable elements not keyboard accessible:', results.keyboardIssues);
    }

    const totalIssues =
      results.missingAltText.length + results.missingLabels.length + results.keyboardIssues.length;

    if (totalIssues === 0) {
      console.log('✅ No accessibility issues found');
    } else {
      console.warn(`⚠️ ${totalIssues} accessibility issues found`);
    }

    return results;
  }

  trapFocus(event, container) {
    const focusableElements = container.querySelectorAll(this.focusableElements.join(', '));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    if (mobileMenu && mobileMenuButton) {
      const isOpen = !mobileMenu.classList.contains('hidden');

      if (isOpen) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    }
  }

  openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    mobileMenu.classList.remove('hidden');
    mobileMenuButton.setAttribute('aria-expanded', 'true');

    // Focus first menu item
    const firstMenuItem = mobileMenu.querySelector('a');
    if (firstMenuItem) {
      firstMenuItem.focus();
    }
  }

  closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    mobileMenu.classList.add('hidden');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
  }

  cleanup() {
    // Remove accessibility toolbar
    const toolbar = document.getElementById('accessibility-toolbar');
    if (toolbar) {
      toolbar.remove();
    }

    const toggleButton = document.getElementById('accessibility-toggle-btn');
    if (toggleButton) {
      toggleButton.remove();
    }
  }
}

// Initialize accessibility manager
if (typeof window !== 'undefined') {
  window.BurniAccessibilityManager = BurniAccessibilityManager;

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.burniAccessibilityManager = new BurniAccessibilityManager();
    });
  } else {
    window.burniAccessibilityManager = new BurniAccessibilityManager();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BurniAccessibilityManager;
}
