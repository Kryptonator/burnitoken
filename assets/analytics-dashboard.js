// Analytics Dashboard - Fehlende JavaScript-Datei
console.log('Analytics Dashboard loaded');

// Simple analytics dashboard functionality
window.AnalyticsDashboard = {
  init: function () {
    console.log('Analytics Dashboard initialized');
  },
  track: function (event) {
    console.log('Tracking event:', event);
  },
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function () {
  if (window.AnalyticsDashboard) { 
    window.AnalyticsDashboard.init();
  }
});
