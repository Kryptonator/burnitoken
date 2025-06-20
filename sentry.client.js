// Sentry Client - Fehlende JavaScript-Datei für Error Tracking
console.log('Sentry Client loaded');

// Simple error tracking (Sentry replacement)
window.Sentry = {
  init: function (config) {
    console.log('Sentry initialized with config:', config);
  },

  captureException: function (error) {
    console.log('Captured exception:', error);
  },

  captureMessage: function (message) {
    console.log('Captured message:', message);
  },
};

// Auto-initialize with basic config
window.Sentry.init({
  dsn: 'placeholder-dsn',
  environment: 'production',
});

// Global error handler
window.addEventListener('error', function (event) {
  console.log('Global error captured:', event.error);
  if (window.Sentry) {
    window.Sentry.captureException(event.error);
  }
});
