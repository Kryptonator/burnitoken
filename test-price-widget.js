// Quick price tracker test for browser console
window.testPriceTracker = async function () {
  console.log('🔥 Testing BURNI Live Prices...');

  if (window.priceTracker) {
    try {
      // Test the price fetching
      const prices = await window.priceTracker.fetchPrices();
      console.log('✅ Live Prices:', prices);

      // Show in widget
      window.priceTracker.updatePriceDisplay(prices);
      console.log('✅ Price widget updated');

      return prices;
    } catch (error) {
      console.error('❌ Price tracker test failed:', error);
    }
  } else {
    console.error('❌ Price tracker not loaded yet');
  }
};

// Auto-test after page load
setTimeout(() => {
  if (window.testPriceTracker) {
    console.log('🚀 Auto-testing price tracker...');
    window.testPriceTracker();
  }
}, 3000);
