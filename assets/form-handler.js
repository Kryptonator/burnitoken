/* ========================================
   ENHANCED FORM HANDLING JAVASCRIPT
   ======================================== */

class FormHandler {
  constructor() {
    this.init();
  }

  init() {
    this.setupFormSubmissions();
    this.setupNotificationSystem();
  }

  setupFormSubmissions() {
    // Newsletter Form Handler
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) 
      newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
    }

    // Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
    }
  }

  async handleNewsletterSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('button');

    // Validation
    if (!this.isValidEmail(email)) {
      this.showNotification('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
      return;
    }

    // Show loading state
    this.setLoadingState(button, true);

    try {
      // Simulate API call (replace with real endpoint)
      await this.simulateAPICall();

      // Success
      this.showNotification(
        '🎉 Erfolgreich angemeldet! Willkommen in der Burni Community!',
        'success',
      );
      form.reset();

      // Track event (if analytics available)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'newsletter_signup', {
          event_category: 'engagement',
          event_label: 'email_signup',
        });
      }
    } catch (error) {
      this.showNotification(
        '⚠️ Fehler beim Anmelden. Bitte versuchen Sie es später erneut.',
        'error',
      );
    } finally {
      this.setLoadingState(button, false);
    }
  }

  async handleContactSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const button = form.querySelector('button[type="submit"]');

    // Basic validation
    const email = formData.get('email');
    const message = formData.get('message');

    if (!this.isValidEmail(email)) {
      this.showNotification('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
      return;
    }

    if (!message || message.trim().length < 10) {
      this.showNotification(
        'Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein.',
        'error',
      );
      return;
    }

    // Show loading state
    this.setLoadingState(button, true);

    try {
      // Simulate API call (replace with real endpoint)
      await this.simulateAPICall(2000);

      // Success
      this.showNotification(
        '✅ Ihre Nachricht wurde erfolgreich gesendet! Wir melden uns bald bei Ihnen.',
        'success',
      );
      form.reset();

      // Track event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_form_submit', {
          event_category: 'engagement',
          event_label: 'contact_message',
        });
      }
    } catch (error) {
      this.showNotification(
        '⚠️ Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.',
        'error',
      );
    } finally {
      this.setLoadingState(button, false);
    }
  }

  setupNotificationSystem() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }
  }

  showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // Icon based on type
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    notification.innerHTML = `
      <span class="notification-icon">${icons[type] || icons.info}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Schließen">×</button>
    `;

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.removeNotification(notification);
    });

    // Add to container
    container.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });
  }

  removeNotification(notification) {
    if (!notification || !notification.parentNode) return;

    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  setLoadingState(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.innerHTML = '<span class="loading-spinner"></span> Wird gesendet...';
      button.style.opacity = '0.7';
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || 'Senden';
      button.style.opacity = '1';
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async simulateAPICall(delay = 1500) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Simulated API error'));
        }
      }, delay);
    });
  }
}

// Form Validation Enhancement
class FormValidator {
  static validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
      return `${fieldName} ist erforderlich.`;
    }
    return null;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }
    return null;
  }

  static validateMinLength(value, minLength, fieldName) {
    if (value.length < minLength) {
      return `${fieldName} muss mindestens ${minLength} Zeichen lang sein.`;
    }
    return null;
  }

  static validateMaxLength(value, maxLength, fieldName) {
    if (value.length > maxLength) {
      return `${fieldName} darf maximal ${maxLength} Zeichen lang sein.`;
    }
    return null;
  }
}

// Enhanced form interactions
document.addEventListener('DOMContentLoaded', function () {
  // Initialize form handler
  new FormHandler();

  // Add real-time validation
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach((input) => {
    input.addEventListener('blur', function () {
      validateField(this);
    });

    input.addEventListener('input', function () {
      clearFieldError(this);
    });
  });
});

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.getAttribute('data-field-name') || field.name || 'Feld';
  let error = null;

  // Required validation
  if (field.hasAttribute('required')) {
    error = FormValidator.validateRequired(value, fieldName);
  }

  // Email validation
  if (!error && field.type === 'email') {
    error = FormValidator.validateEmail(value);
  }

  // Min length validation
  if (!error && field.hasAttribute('data-min-length')) {
    const minLength = parseInt(field.getAttribute('data-min-length'));
    error = FormValidator.validateMinLength(value, minLength, fieldName);
  }

  // Max length validation
  if (!error && field.hasAttribute('data-max-length')) {
    const maxLength = parseInt(field.getAttribute('data-max-length'));
    error = FormValidator.validateMaxLength(value, maxLength, fieldName);
  }

  if (error) {
    showFieldError(field, error);
    return false;
  } else {
    clearFieldError(field);
    return true;
  }
}

function showFieldError(field, message) {
  clearFieldError(field);

  field.classList.add('form-input-error');

  const errorDiv = document.createElement('div');
  errorDiv.className = 'form-error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #dc2626;
    font-size: 14px;
    margin-top: 4px;
    display: flex;
    align-items: center;
  `;

  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.classList.remove('form-input-error');

  const errorMessage = field.parentNode.querySelector('.form-error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

// Enhanced accessibility
document.addEventListener('keydown', function (e) {
  // Allow form submission with Ctrl+Enter in textareas
  if (e.ctrlKey && e.key === 'Enter') {
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'TEXTAREA') {
      const form = activeElement.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }
  }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FormHandler, FormValidator };
}


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
 * setupFormSubmissions - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setupFormSubmissions(...args) {
  console.log('setupFormSubmissions aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * setupNotificationSystem - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setupNotificationSystem(...args) {
  console.log('setupNotificationSystem aufgerufen mit Argumenten:', args);
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
 * addEventListener - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function addEventListener(...args) {
  console.log('addEventListener aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * handleNewsletterSubmit - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function handleNewsletterSubmit(...args) {
  console.log('handleNewsletterSubmit aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * handleContactSubmit - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function handleContactSubmit(...args) {
  console.log('handleContactSubmit aufgerufen mit Argumenten:', args);
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
 * querySelector - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function querySelector(...args) {
  console.log('querySelector aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * isValidEmail - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function isValidEmail(...args) {
  console.log('isValidEmail aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * showNotification - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function showNotification(...args) {
  console.log('showNotification aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * setLoadingState - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function setLoadingState(...args) {
  console.log('setLoadingState aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * call - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function call(...args) {
  console.log('call aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * simulateAPICall - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function simulateAPICall(...args) {
  console.log('simulateAPICall aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * reset - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function reset(...args) {
  console.log('reset aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * event - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function event(...args) {
  console.log('event aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * gtag - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function gtag(...args) {
  console.log('gtag aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * catch - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * FormData - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function FormData(...args) {
  console.log('FormData aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * get - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function get(...args) {
  console.log('get aufgerufen mit Argumenten:', args);
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
 * createElement - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function createElement(...args) {
  console.log('createElement aufgerufen mit Argumenten:', args);
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
 * removeNotification - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function removeNotification(...args) {
  console.log('removeNotification aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * requestAnimationFrame - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function requestAnimationFrame(...args) {
  console.log('requestAnimationFrame aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * translateX - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function translateX(...args) {
  console.log('translateX aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * removeChild - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function removeChild(...args) {
  console.log('removeChild aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * test - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function test(...args) {
  console.log('test aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * random - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function random(...args) {
  console.log('random aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * resolve - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function resolve(...args) {
  console.log('resolve aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * reject - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function reject(...args) {
  console.log('reject aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * validateRequired - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function validateRequired(...args) {
  console.log('validateRequired aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * validateEmail - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function validateEmail(...args) {
  console.log('validateEmail aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * validateMinLength - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function validateMinLength(...args) {
  console.log('validateMinLength aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * validateMaxLength - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function validateMaxLength(...args) {
  console.log('validateMaxLength aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * function - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */

/**
 * FormHandler - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function FormHandler(...args) {
  console.log('FormHandler aufgerufen mit Argumenten:', args);
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
 * forEach - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function forEach(...args) {
  console.log('forEach aufgerufen mit Argumenten:', args);
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
 * hasAttribute - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function hasAttribute(...args) {
  console.log('hasAttribute aufgerufen mit Argumenten:', args);
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
 * remove - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function remove(...args) {
  console.log('remove aufgerufen mit Argumenten:', args);
  return undefined;
}
/**
 * closest - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function closest(...args) {
  console.log('closest aufgerufen mit Argumenten:', args);
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
 * Event - Automatisch generierte Implementierung
 * @param {...any} args - Funktionsargumente
 * @returns {any} Ergebnis oder undefined
 */
function Event(...args) {
  console.log('Event aufgerufen mit Argumenten:', args);
  return undefined;
}
