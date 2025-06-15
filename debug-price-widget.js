// Debug version of Price Tracker to identify the issue
console.log('🔍 DEBUG: Price Tracker starting...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔍 DEBUG: DOM Content Loaded');

  // Check if TokenPriceTracker exists
  if (typeof TokenPriceTracker !== 'undefined') {
    console.log('🔍 DEBUG: TokenPriceTracker class found');
    try {
      const tracker = new TokenPriceTracker();
      console.log('🔍 DEBUG: TokenPriceTracker instance created successfully');
    } catch (error) {
      console.error('🔍 DEBUG: Error creating TokenPriceTracker:', error);
    }
  } else {
    console.error('🔍 DEBUG: TokenPriceTracker class not found');
  }

  // Check if price widget exists in DOM
  setTimeout(() => {
    const widget = document.getElementById('price-tracker-widget');
    if (widget) {
      console.log('🔍 DEBUG: Price widget found in DOM:', widget);
      console.log('🔍 DEBUG: Widget visibility:', window.getComputedStyle(widget).visibility);
      console.log('🔍 DEBUG: Widget display:', window.getComputedStyle(widget).display);
      console.log('🔍 DEBUG: Widget position:', window.getComputedStyle(widget).position);
    } else {
      console.error('🔍 DEBUG: Price widget NOT found in DOM');
    }

    // Check all price elements
    const symbols = ['xrp', 'xpm', 'burni'];
    symbols.forEach((symbol) => {
      const priceElement = document.getElementById(`price-value-${symbol}`);
      if (priceElement) {
        console.log(`🔍 DEBUG: Price element for ${symbol} found:`, priceElement.textContent);
      } else {
        console.error(`🔍 DEBUG: Price element for ${symbol} NOT found`);
      }
    });
  }, 2000);
});

// Check if the script loads at all
console.log('🔍 DEBUG: Price tracker debug script loaded');

// Simple test function to create a visible element
function createTestWidget() {
  console.log('🔍 DEBUG: Creating test widget...');

  const testWidget = document.createElement('div');
  testWidget.id = 'test-price-widget';
  testWidget.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        width: 250px;
        background: #ffffff;
        border: 2px solid #f97316;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-family: Arial, sans-serif;
    `;

  testWidget.innerHTML = `
        <h3 style="margin: 0 0 12px 0; color: #f97316; font-size: 16px;">🧪 Test Price Widget</h3>
        <div style="background: #f3f4f6; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
            <strong>XRP:</strong> <span id="test-xrp-price">Loading...</span>
        </div>
        <div style="background: #f3f4f6; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
            <strong>BURNI:</strong> <span id="test-burni-price">Loading...</span>
        </div>
        <div style="background: #f3f4f6; padding: 8px; border-radius: 4px;">
            <strong>XPM:</strong> <span id="test-xpm-price">Loading...</span>
        </div>
        <div style="font-size: 10px; color: #666; text-align: center; margin-top: 8px;">
            Debug Widget
        </div>
    `;

  document.body.appendChild(testWidget);
  console.log('🔍 DEBUG: Test widget created and added to DOM');

  // Test API call
  testPriceAPI();
}

async function testPriceAPI() {
  console.log('🔍 DEBUG: Testing price API...');

  try {
    // Test XRP price from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd',
    );
    const data = await response.json();
    console.log('🔍 DEBUG: XRP API response:', data);

    if (data.ripple && data.ripple.usd) {
      const testXrpElement = document.getElementById('test-xrp-price');
      if (testXrpElement) {
        testXrpElement.textContent = `$${data.ripple.usd.toFixed(4)}`;
        console.log('🔍 DEBUG: XRP price updated in test widget');
      }
    }
  } catch (error) {
    console.error('🔍 DEBUG: Error fetching XRP price:', error);
  }
}

// Auto-create test widget when script loads
setTimeout(createTestWidget, 1000);
