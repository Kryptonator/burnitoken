// Accessibility & Keyboard Navigation Enhancement for BurniToken
// WCAG 2.1 AA compliant keyboard navigation and focus management

console.log('🚀 BurniToken Accessibility & Keyboard Enhancement loaded');

window.BurniAccessibility = {
  // State management
  state: {
    mobileMenuOpen: false,
    focusedFAQ: null,
    focusHistory: [],
    keyboardNavigation: false
  },

  // Initialize accessibility features
  init: function() {
    console.log('🔧 Initializing accessibility features...');
    this.enhanceMobileMenuKeyboard();
    this.enhanceFAQKeyboard();
    this.setupFocusManagement();
    this.setupKeyboardIndicators();
    this.setupEscapeHandlers();
    this.setupAriaLiveRegions();
    console.log('✅ Accessibility features initialized');
  },

  // Enhanced mobile menu with full keyboard support
  enhanceMobileMenuKeyboard: function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) return;

    // Remove existing event listeners by cloning
    const newButton = mobileMenuButton.cloneNode(true);
    mobileMenuButton.parentNode.replaceChild(newButton, mobileMenuButton);

    // Enhanced click handler
    newButton.addEventListener('click', (e) => {
      this.toggleMobileMenu();
    });

    // Enhanced keyboard handler
    newButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMobileMenu();
      }
    });

    // Setup mobile menu keyboard navigation
    this.setupMobileMenuNavigation(mobileMenu);
  },

  toggleMobileMenu: function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) return;

    const isCurrentlyOpen = !mobileMenu.classList.contains('hidden');
    
    if (isCurrentlyOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  },

  openMobileMenu: function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) return;

    // Update state
    this.state.mobileMenuOpen = true;
    
    // Update DOM
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('active');
    mobileMenuButton.setAttribute('aria-expanded', 'true');
    
    // Focus management
    this.state.focusHistory.push(document.activeElement);
    
    // Focus first menu item
    const firstMenuItem = mobileMenu.querySelector('a');
    if (firstMenuItem) {
      firstMenuItem.focus();
    }
    
    // Setup focus trap
    this.setupFocusTrap(mobileMenu);
    
    // Announce to screen readers
    this.announceToScreenReader('Mobile menu opened');
    
    console.log('📱 Mobile menu opened with focus management');
  },

  closeMobileMenu: function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) return;

    // Update state
    this.state.mobileMenuOpen = false;
    
    // Update DOM
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('active');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    
    // Remove focus trap
    this.removeFocusTrap(mobileMenu);
    
    // Restore focus
    const previousFocus = this.state.focusHistory.pop();
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    } else {
      mobileMenuButton.focus();
    }
    
    // Announce to screen readers
    this.announceToScreenReader('Mobile menu closed');
    
    console.log('📱 Mobile menu closed with focus restored');
  },

  setupMobileMenuNavigation: function(mobileMenu) {
    const menuItems = mobileMenu.querySelectorAll('a');
    
    menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        switch(e.key) {
          case 'Escape':
            e.preventDefault();
            this.closeMobileMenu();
            break;
          case 'ArrowDown':
            e.preventDefault();
            const nextItem = menuItems[index + 1] || menuItems[0];
            nextItem.focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            const prevItem = menuItems[index - 1] || menuItems[menuItems.length - 1];
            prevItem.focus();
            break;
          case 'Home':
            e.preventDefault();
            menuItems[0].focus();
            break;
          case 'End':
            e.preventDefault();
            menuItems[menuItems.length - 1].focus();
            break;
        }
      });
      
      // Close menu when item is clicked
      item.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
  },

  // Enhanced FAQ keyboard navigation
  enhanceFAQKeyboard: function() {
    const faqButtons = document.querySelectorAll('[id^="faq"][id$="-icon"]');
    
    faqButtons.forEach(button => {
      const faqId = button.id.replace('-icon', '');
      const questionButton = button.parentElement;
      
      if (questionButton) {
        // Remove existing onclick handlers
        questionButton.removeAttribute('onclick');
        
        // Add enhanced event listeners
        questionButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleFAQ(faqId);
        });
        
        questionButton.addEventListener('keydown', (e) => {
          switch(e.key) {
            case 'Enter':
            case ' ':
              e.preventDefault();
              this.toggleFAQ(faqId);
              break;
            case 'ArrowDown':
              e.preventDefault();
              this.focusNextFAQ(questionButton);
              break;
            case 'ArrowUp':
              e.preventDefault();
              this.focusPreviousFAQ(questionButton);
              break;
            case 'Home':
              e.preventDefault();
              this.focusFirstFAQ();
              break;
            case 'End':
              e.preventDefault();
              this.focusLastFAQ();
              break;
          }
        });
        
        // Ensure proper tab order
        questionButton.setAttribute('tabindex', '0');
      }
    });
  },

  toggleFAQ: function(faqId) {
    const answer = document.getElementById(faqId + '-answer');
    const icon = document.getElementById(faqId + '-icon');
    const question = answer ? answer.previousElementSibling : null;

    if (!answer || !icon || !question) {
      console.warn('FAQ elements not found for:', faqId);
      return;
    }

    const isCurrentlyOpen = !answer.classList.contains('hidden');
    
    if (isCurrentlyOpen) {
      // Close FAQ
      answer.classList.add('hidden');
      answer.classList.remove('animate-slideDown');
      icon.textContent = '+';
      icon.setAttribute('aria-label', 'Expand answer');
      question.setAttribute('aria-expanded', 'false');
      
      this.announceToScreenReader('FAQ answer collapsed');
    } else {
      // Open FAQ
      answer.classList.remove('hidden');
      answer.classList.add('animate-slideDown');
      icon.textContent = '−';
      icon.setAttribute('aria-label', 'Collapse answer');
      question.setAttribute('aria-expanded', 'true');
      
      this.announceToScreenReader('FAQ answer expanded');
    }
    
    // Update state
    this.state.focusedFAQ = isCurrentlyOpen ? null : faqId;
    
    console.log(`❓ FAQ ${faqId} ${isCurrentlyOpen ? 'closed' : 'opened'}`);
  },

  focusNextFAQ: function(currentButton) {
    const faqButtons = Array.from(document.querySelectorAll('[id^="faq"][id$="-icon"]'))
      .map(icon => icon.parentElement);
    const currentIndex = faqButtons.indexOf(currentButton);
    const nextButton = faqButtons[currentIndex + 1] || faqButtons[0];
    nextButton.focus();
  },

  focusPreviousFAQ: function(currentButton) {
    const faqButtons = Array.from(document.querySelectorAll('[id^="faq"][id$="-icon"]'))
      .map(icon => icon.parentElement);
    const currentIndex = faqButtons.indexOf(currentButton);
    const prevButton = faqButtons[currentIndex - 1] || faqButtons[faqButtons.length - 1];
    prevButton.focus();
  },

  focusFirstFAQ: function() {
    const firstFAQ = document.querySelector('[id^="faq"][id$="-icon"]');
    if (firstFAQ && firstFAQ.parentElement) {
      firstFAQ.parentElement.focus();
    }
  },

  focusLastFAQ: function() {
    const faqButtons = document.querySelectorAll('[id^="faq"][id$="-icon"]');
    const lastFAQ = faqButtons[faqButtons.length - 1];
    if (lastFAQ && lastFAQ.parentElement) {
      lastFAQ.parentElement.focus();
    }
  },

  // Focus trap implementation
  setupFocusTrap: function(container) {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const trapFocus = (e) => {
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
    };
    
    container.addEventListener('keydown', trapFocus);
    container.focusTrap = trapFocus;
  },

  removeFocusTrap: function(container) {
    if (container.focusTrap) {
      container.removeEventListener('keydown', container.focusTrap);
      delete container.focusTrap;
    }
  },

  getFocusableElements: function(container) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return container.querySelectorAll(focusableSelectors.join(', '));
  },

  // General focus management
  setupFocusManagement: function() {
    // Detect keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.state.keyboardNavigation = true;
        document.body.classList.add('keyboard-navigation');
      }
    });
    
    document.addEventListener('mousedown', () => {
      this.state.keyboardNavigation = false;
      document.body.classList.remove('keyboard-navigation');
    });
    
    // Enhanced focus indicators
    document.addEventListener('focusin', (e) => {
      if (this.state.keyboardNavigation) {
        e.target.classList.add('keyboard-focused');
      }
    });
    
    document.addEventListener('focusout', (e) => {
      e.target.classList.remove('keyboard-focused');
    });
  },

  // Setup keyboard indicators
  setupKeyboardIndicators: function() {
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced keyboard focus indicators */
      .keyboard-navigation *:focus,
      .keyboard-focused {
        outline: 2px solid #f97316 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2) !important;
      }
      
      /* Hide focus indicators for mouse users */
      body:not(.keyboard-navigation) *:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Special focus styles for specific elements */
      .keyboard-navigation .nav-link:focus,
      .keyboard-navigation .mobile-menu a:focus {
        background-color: rgba(249, 115, 22, 0.1) !important;
        border-radius: 4px !important;
      }
      
      .keyboard-navigation button:focus {
        background-color: rgba(249, 115, 22, 0.1) !important;
        border-radius: 4px !important;
      }
    `;
    document.head.appendChild(style);
  },

  // Global escape handler
  setupEscapeHandlers: function() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close mobile menu if open
        if (this.state.mobileMenuOpen) {
          this.closeMobileMenu();
        }
        
        // Close any open modals or overlays
        const modals = document.querySelectorAll('.modal, .overlay');
        modals.forEach(modal => {
          if (modal.style.display !== 'none') {
            modal.style.display = 'none';
          }
        });
      }
    });
  },

  // ARIA live regions for screen reader announcements
  setupAriaLiveRegions: function() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'aria-live-region';
    document.body.appendChild(liveRegion);
    
    // Create assertive live region for urgent announcements
    const assertiveRegion = document.createElement('div');
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    assertiveRegion.id = 'aria-assertive-region';
    document.body.appendChild(assertiveRegion);
  },

  // Announce to screen readers
  announceToScreenReader: function(message, urgent = false) {
    const regionId = urgent ? 'aria-assertive-region' : 'aria-live-region';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
    
    console.log(`📢 Screen reader announcement: ${message}`);
  },

  // Public API methods
  openMobileMenuProgrammatically: function() {
    if (!this.state.mobileMenuOpen) {
      this.openMobileMenu();
    }
  },

  closeMobileMenuProgrammatically: function() {
    if (this.state.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  },

  toggleFAQProgrammatically: function(faqId) {
    this.toggleFAQ(faqId);
  },

  getAccessibilityState: function() {
    return { ...this.state };
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.BurniAccessibility.init();
});

// Make globally available for testing
window.toggleFAQ = function(faqId) {
  window.BurniAccessibility.toggleFAQ(faqId);
};

console.log('🎯 BurniToken Accessibility Enhancement ready');