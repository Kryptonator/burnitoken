// Test Burni Live Prices - Fehlende JavaScript-Datei
console.log('Test Burni Live Prices loaded');

// Burni live price testing functionality
window.TestBurniLivePrices = {
    init: function() {
        console.log('Test Burni Live Prices initialized');
        this.testPrices();
    },
    
    testPrices: function() {
        console.log('Testing Burni live prices');
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    if (window.TestBurniLivePrices) {
        window.TestBurniLivePrices.init();
    }
});
