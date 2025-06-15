// Enhanced Live Price Widget with BURNI support
class EnhancedPriceWidget {
  constructor() {
    this.config = {
      burni: {
        issuer: 'rJzQVveWEob6x6PJQqXm9sdcFjGbACBwv2',
        currency: 'BURNI',
      },
      updateInterval: 30000, // 30 seconds
      apis: {
        coingecko: 'https://api.coingecko.com/api/v3',
        xrpscan: 'https://api.xrpscan.com/api/v1',
        bithomp: 'https://bithomp.com/api/v2',
        xrpl: 'https://s1.ripple.com:51234',
      },
    };
    this.init();
  }

  init() {
    this.enhanceDirectWidget();
    this.startPriceUpdates();
    console.log('🚀 Enhanced Price Widget initialized');
  }

  enhanceDirectWidget() {
    // Add more functionality to the existing direct widget
    const widget = document.getElementById('direct-price-widget');
    if (widget) {
      // Add refresh button with improved styling
      const refreshBtn = document.createElement('button');
      refreshBtn.innerHTML = '🔄';
      refreshBtn.className = 'enhanced-refresh-btn';
      refreshBtn.style.cssText = `
                position: absolute;
                top: 8px;
                left: 12px;
                background: linear-gradient(135deg, #f97316, #ea580c);
                color: white;
                border: none;
                border-radius: 50%;
                width: 26px;
                height: 26px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
      refreshBtn.onmouseover = () => {
        refreshBtn.style.transform = 'scale(1.1) rotate(90deg)';
        refreshBtn.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
      };
      refreshBtn.onmouseout = () => {
        refreshBtn.style.transform = 'scale(1) rotate(0deg)';
        refreshBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      };
      refreshBtn.onclick = () => {
        refreshBtn.style.transform = 'scale(0.95) rotate(180deg)';
        setTimeout(() => {
          refreshBtn.style.transform = 'scale(1) rotate(0deg)';
        }, 150);
        this.loadAllPrices();
      };
      widget.appendChild(refreshBtn);

      // Add loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.id = 'loading-indicator';
      loadingIndicator.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255,255,255,0.9);
                padding: 10px;
                border-radius: 5px;
                display: none;
            `;
      loadingIndicator.innerHTML = '🔄 Loading...';
      widget.appendChild(loadingIndicator);
    }
  }

  async loadAllPrices() {
    this.showLoading(true);

    try {
      await Promise.all([this.loadXRPPrice(), this.loadBURNIPrice(), this.loadXPMPrice()]);
      this.updateTimestamp();
    } catch (error) {
      console.error('❌ Error loading prices:', error);
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.style.display = show ? 'block' : 'none';
    }
  }

  async loadXRPPrice() {
    try {
      const response = await fetch(
        `${this.config.apis.coingecko}/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true`,
      );
      const data = await response.json();

      if (data.ripple?.usd) {
        const priceElement = document.getElementById('direct-xrp');
        if (priceElement) {
          const price = data.ripple.usd;
          const change = data.ripple.usd_24h_change || 0;
          priceElement.innerHTML = `$${price.toFixed(6)} <small style="color: ${change >= 0 ? '#28a745' : '#dc3545'}">(${change >= 0 ? '+' : ''}${change.toFixed(2)}%)</small>`;
        }
        console.log('✅ XRP price updated:', data.ripple.usd);
      }
    } catch (error) {
      console.error('❌ XRP price error:', error);
      const priceElement = document.getElementById('direct-xrp');
      if (priceElement) priceElement.textContent = 'Error loading';
    }
  }

  async loadBURNIPrice() {
    try {
      // Try multiple APIs for BURNI price
      let burniPrice = await this.getBURNIFromXRPScan();

      if (!burniPrice) {
        burniPrice = await this.getBURNIFromBithomp();
      }

      if (!burniPrice) {
        burniPrice = await this.getBURNIFromXRPL();
      }

      const priceElement = document.getElementById('direct-burni');
      if (priceElement) {
        if (burniPrice) {
          priceElement.innerHTML = `$${burniPrice.toFixed(8)} <small style="color: #f97316">(Live)</small>`;
          console.log('✅ BURNI price updated:', burniPrice);
        } else {
          priceElement.innerHTML = `$0.000001 <small style="color: #666">(Est.)</small>`;
          console.log('⚠️ BURNI price not available, using estimate');
        }
      }
    } catch (error) {
      console.error('❌ BURNI price error:', error);
      const priceElement = document.getElementById('direct-burni');
      if (priceElement)
        priceElement.innerHTML = `$0.000001 <small style="color: #dc3545">(Error)</small>`;
    }
  }

  async getBURNIFromXRPScan() {
    try {
      const response = await fetch(
        `${this.config.apis.xrpscan}/token/${this.config.burni.currency}.${this.config.burni.issuer}`,
      );
      const data = await response.json();
      return data.price?.usd || null;
    } catch (error) {
      console.log('XRPScan BURNI fetch failed:', error);
      return null;
    }
  }

  async getBURNIFromBithomp() {
    try {
      const response = await fetch(
        `${this.config.apis.bithomp}/token/${this.config.burni.currency}/${this.config.burni.issuer}`,
      );
      const data = await response.json();
      return data.price?.usd || null;
    } catch (error) {
      console.log('Bithomp BURNI fetch failed:', error);
      return null;
    }
  }

  async getBURNIFromXRPL() {
    try {
      // Query XRPL orderbook
      const response = await fetch(this.config.apis.xrpl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'book_offers',
          params: [
            {
              taker_gets: { currency: 'XRP' },
              taker_pays: {
                currency: this.config.burni.currency,
                issuer: this.config.burni.issuer,
              },
              limit: 1,
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.result?.offers?.length > 0) {
        const offer = data.result.offers[0];
        const xrpAmount = parseFloat(offer.TakerGets) / 1000000; // Convert drops to XRP
        const burniAmount = parseFloat(offer.TakerPays.value);
        const burniPerXrp = burniAmount / xrpAmount;

        // Get XRP price in USD
        const xrpResponse = await fetch(
          `${this.config.apis.coingecko}/simple/price?ids=ripple&vs_currencies=usd`,
        );
        const xrpData = await xrpResponse.json();
        const xrpUsd = xrpData.ripple?.usd || 0;

        return (1 / burniPerXrp) * xrpUsd;
      }
      return null;
    } catch (error) {
      console.log('XRPL BURNI fetch failed:', error);
      return null;
    }
  }

  async loadXPMPrice() {
    try {
      const response = await fetch(
        `${this.config.apis.coingecko}/simple/price?ids=primecoin&vs_currencies=usd&include_24hr_change=true`,
      );
      const data = await response.json();

      if (data.primecoin?.usd) {
        const priceElement = document.getElementById('direct-xpm');
        if (priceElement) {
          const price = data.primecoin.usd;
          const change = data.primecoin.usd_24h_change || 0;
          priceElement.innerHTML = `$${price.toFixed(6)} <small style="color: ${change >= 0 ? '#28a745' : '#dc3545'}">(${change >= 0 ? '+' : ''}${change.toFixed(2)}%)</small>`;
        }
        console.log('✅ XPM price updated:', data.primecoin.usd);
      }
    } catch (error) {
      console.error('❌ XPM price error:', error);
      const priceElement = document.getElementById('direct-xpm');
      if (priceElement) priceElement.textContent = 'Error loading';
    }
  }

  updateTimestamp() {
    const updateElement = document.getElementById('direct-update');
    if (updateElement) {
      updateElement.textContent = new Date().toLocaleTimeString();
    }
  }

  startPriceUpdates() {
    // Initial load
    setTimeout(() => this.loadAllPrices(), 2000);

    // Regular updates
    setInterval(() => this.loadAllPrices(), this.config.updateInterval);
  }
}

// Initialize enhanced widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EnhancedPriceWidget();
  });
} else {
  new EnhancedPriceWidget();
}
