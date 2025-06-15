// Simple fallback price widget for debugging
console.log('🔧 Fallback Price Widget starting...');

function createFallbackPriceWidget() {
  console.log('🔧 Creating fallback price widget...');

  // Remove existing widgets first
  const existingWidgets = document.querySelectorAll(
    '#price-tracker-widget, #test-price-widget, #fallback-price-widget',
  );
  existingWidgets.forEach((widget) => widget.remove());

  const widget = document.createElement('div');
  widget.id = 'fallback-price-widget';
  widget.style.cssText = `
        position: fixed !important;
        top: 80px !important;
        right: 20px !important;
        width: 280px !important;
        min-height: 200px !important;
        background: #ffffff !important;
        border: 2px solid #f97316 !important;
        border-radius: 12px !important;
        padding: 16px !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        z-index: 9999 !important;
        font-family: 'Inter', Arial, sans-serif !important;
        font-size: 14px !important;
        color: #333 !important;
    `;

  widget.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
            <h3 style="margin: 0; color: #f97316; font-size: 16px; font-weight: 700;">🔥 BURNI Live Prices</h3>
            <button id="close-fallback-widget" style="background: none; border: none; color: #666; cursor: pointer; font-size: 18px;">×</button>
        </div>
        
        <div id="price-list" style="space-y: 8px;">
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #374151;">XRP</span>
                    <span id="fallback-xrp-price" style="font-family: monospace; font-weight: 600; color: #059669;">Loading...</span>
                </div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 2px;" id="fallback-xrp-change">24h change: ---</div>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #92400e;">BURNI</span>
                    <span id="fallback-burni-price" style="font-family: monospace; font-weight: 600; color: #dc2626;">Loading...</span>
                </div>
                <div style="font-size: 11px; color: #92400e; margin-top: 2px;" id="fallback-burni-change">XRPL Token</div>
            </div>
            
            <div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #374151;">XPM</span>
                    <span id="fallback-xpm-price" style="font-family: monospace; font-weight: 600; color: #059669;">Loading...</span>
                </div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 2px;" id="fallback-xpm-change">Primecoin</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <div style="font-size: 10px; color: #6b7280;">
                Last update: <span id="fallback-last-update">Never</span>
            </div>
            <button id="fallback-refresh" style="margin-top: 4px; background: #f97316; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">
                🔄 Refresh
            </button>
        </div>
    `;

  document.body.appendChild(widget);
  console.log('✅ Fallback widget created and added to DOM');

  // Setup event listeners
  document.getElementById('close-fallback-widget').addEventListener('click', () => {
    widget.remove();
  });

  document.getElementById('fallback-refresh').addEventListener('click', () => {
    loadFallbackPrices();
  });

  // Load initial prices
  loadFallbackPrices();
}

async function loadFallbackPrices() {
  console.log('🔧 Loading fallback prices...');

  const updateTime = document.getElementById('fallback-last-update');
  if (updateTime) {
    updateTime.textContent = new Date().toLocaleTimeString();
  }

  // Load XRP price
  try {
    console.log('📊 Fetching XRP price from CoinGecko...');
    const xrpResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true',
    );
    const xrpData = await xrpResponse.json();

    if (xrpData.ripple) {
      const xrpPriceElement = document.getElementById('fallback-xrp-price');
      const xrpChangeElement = document.getElementById('fallback-xrp-change');

      if (xrpPriceElement) {
        xrpPriceElement.textContent = `$${xrpData.ripple.usd.toFixed(6)}`;
        xrpPriceElement.style.color = '#059669';
      }

      if (xrpChangeElement && xrpData.ripple.usd_24h_change) {
        const change = xrpData.ripple.usd_24h_change;
        xrpChangeElement.textContent = `24h: ${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
        xrpChangeElement.style.color = change > 0 ? '#059669' : '#dc2626';
      }

      console.log('✅ XRP price loaded:', xrpData.ripple.usd);
    }
  } catch (error) {
    console.error('❌ Error loading XRP price:', error);
    const xrpPriceElement = document.getElementById('fallback-xrp-price');
    if (xrpPriceElement) {
      xrpPriceElement.textContent = 'Error';
      xrpPriceElement.style.color = '#dc2626';
    }
  }

  // Load BURNI price (mock for now)
  try {
    const burniPriceElement = document.getElementById('fallback-burni-price');
    if (burniPriceElement) {
      burniPriceElement.textContent = '$0.000001';
      burniPriceElement.style.color = '#f97316';
    }
    console.log('✅ BURNI price loaded (mock)');
  } catch (error) {
    console.error('❌ Error loading BURNI price:', error);
  }

  // Load XPM price
  try {
    console.log('📊 Fetching XPM price from CoinGecko...');
    const xpmResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=primecoin&vs_currencies=usd&include_24hr_change=true',
    );
    const xpmData = await xpmResponse.json();

    if (xpmData.primecoin) {
      const xpmPriceElement = document.getElementById('fallback-xpm-price');
      const xpmChangeElement = document.getElementById('fallback-xpm-change');

      if (xpmPriceElement) {
        xpmPriceElement.textContent = `$${xpmData.primecoin.usd.toFixed(6)}`;
        xpmPriceElement.style.color = '#059669';
      }

      if (xpmChangeElement && xpmData.primecoin.usd_24h_change) {
        const change = xpmData.primecoin.usd_24h_change;
        xpmChangeElement.textContent = `24h: ${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
        xpmChangeElement.style.color = change > 0 ? '#059669' : '#dc2626';
      }

      console.log('✅ XPM price loaded:', xpmData.primecoin.usd);
    }
  } catch (error) {
    console.error('❌ Error loading XPM price:', error);
    const xpmPriceElement = document.getElementById('fallback-xpm-price');
    if (xpmPriceElement) {
      xpmPriceElement.textContent = 'Error';
      xpmPriceElement.style.color = '#dc2626';
    }
  }
}

// Initialize fallback widget
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFallbackPriceWidget);
} else {
  createFallbackPriceWidget();
}

console.log('🔧 Fallback price widget script loaded');
