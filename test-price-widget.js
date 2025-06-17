// Test Price Widget - Fehlende JavaScript-Datei
console.log('Test Price Widget loaded');

// Price widget testing functionality
window.TestPriceWidget = {
    init: function() {
        console.log('Test Price Widget initialized');
        this.testWidget();
    },
    
    testWidget: function() {
        console.log('Testing price widget');
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    if (window.TestPriceWidget) {
        window.TestPriceWidget.init();
    }
});
