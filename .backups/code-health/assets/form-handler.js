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
    if (newsletterForm) {
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
