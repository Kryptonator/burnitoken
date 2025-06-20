// Community Features - Fehlende JavaScript-Datei
console.log('Community Features loaded');

// Community functionality
window.CommunityFeatures = {
  init: function () {
    console.log('Community Features initialized');
  },

  loadFeatures: function () {
    console.log('Loading community features');
  },
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function () {
  if (window.CommunityFeatures) {
    window.CommunityFeatures.init();
  }
});
