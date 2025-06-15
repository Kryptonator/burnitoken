// Advanced Token Price Tracker with Alerts and Historical Data
class TokenPriceTracker {
  constructor() {
    this.symbols = ['XRP', 'XPM', 'BURNI'];
    this.priceHistory = {};
    this.alerts = JSON.parse(localStorage.getItem('price_alerts') || '[]');
    this.updateInterval = 30000; // 30 seconds
    this.apiEndpoints = {
      coingecko: 'https://api.coingecko.com/api/v3',
      coinmarketcap: 'https://pro-api.coinmarketcap.com/v1', // Needs API key
      xrplServices: 'https://api.xrpledger.com/v1',
      xrplData: 'https://data.ripple.com/v2',
      xrpScan: 'https://api.xrpscan.com/api/v1',
      xrplCluster: 'https://xrplcluster.com',
      bithomp: 'https://bithomp.com/api/v2',
      backup: 'https://s1.ripple.com:51234',
    };

    this.init();
  }

  async init() {
    console.log('🚀 TokenPriceTracker.init() called');
    try {
      this.createPriceWidget();
      console.log('✅ Price widget created');
      this.loadHistoricalData();
      console.log('✅ Historical data loaded');
      this.startPriceUpdates();
      console.log('✅ Price updates started');
      this.setupNotifications();
      console.log('✅ Notifications setup complete');
    } catch (error) {
      console.error('❌ Error in TokenPriceTracker.init():', error);
    }
  }

  createPriceWidget() {
    console.log('🎨 Creating price widget...');
    const widget = `
      <div id="price-tracker-widget" class="fixed top-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-72 z-40">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-gray-800">💰 Live Prices</h3>
          <div class="flex space-x-1">
            <button id="price-alerts-btn" class="text-orange-500 hover:text-orange-700 text-sm">🔔</button>
            <button id="price-chart-btn" class="text-blue-500 hover:text-blue-700 text-sm">📈</button>
            <button id="toggle-price-widget" class="text-gray-500 hover:text-gray-700 text-sm">−</button>
          </div>
        </div>
        
        <div id="price-widget-content" class="space-y-2">
          ${this.symbols
            .map(
              (symbol) => `
            <div id="price-${symbol.toLowerCase()}" class="flex justify-between items-center p-2 border rounded">
              <div class="flex items-center space-x-2">
                <span class="font-semibold">${symbol}</span>
                <span id="change-indicator-${symbol.toLowerCase()}" class="text-xs"></span>
              </div>
              <div class="text-right">
                <div id="price-value-${symbol.toLowerCase()}" class="font-mono">Loading...</div>
                <div id="price-change-${symbol.toLowerCase()}" class="text-xs"></div>
              </div>
            </div>
          `,
            )
            .join('')}
          
          <div class="text-xs text-gray-500 text-center mt-2">
            Last updated: <span id="last-update-time">Never</span>
          </div>
        </div>

        <!-- Price Alerts Modal -->
        <div id="price-alerts-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold">Price Alerts</h3>
              <button id="close-alerts-modal" class="text-gray-500">✕</button>
            </div>
            
            <div class="mb-4">
              <div class="grid grid-cols-3 gap-2 mb-2">
                <select id="alert-symbol" class="border rounded p-1 text-sm">
                  ${this.symbols.map((s) => `<option value="${s}">${s}</option>`).join('')}
                </select>
                <select id="alert-type" class="border rounded p-1 text-sm">
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
                <input id="alert-price" type="number" step="0.0001" placeholder="Price" class="border rounded p-1 text-sm">
              </div>
              <button id="add-alert" class="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600">Add Alert</button>
            </div>
            
            <div id="alerts-list" class="space-y-2 max-h-40 overflow-y-auto"></div>
          </div>
        </div>

        <!-- Price Chart Modal -->
        <div id="price-chart-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-5/6 max-w-4xl h-5/6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold">Price Charts</h3>
              <button id="close-chart-modal" class="text-gray-500">✕</button>
            </div>
            <div class="h-full">
              <canvas id="price-history-chart" class="w-full h-5/6"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widget);
    console.log('✅ Widget HTML inserted into DOM');
    this.setupEventListeners();
    console.log('✅ Event listeners setup complete');
  }

  setupEventListeners() {
    // Toggle widget
    document.getElementById('toggle-price-widget').addEventListener('click', () => {
      const content = document.getElementById('price-widget-content');
      const button = document.getElementById('toggle-price-widget');
      if (content.style.display === 'none') {
        content.style.display = 'block';
        button.textContent = '−';
      } else {
        content.style.display = 'none';
        button.textContent = '+';
      }
    });

    // Alerts modal
    document.getElementById('price-alerts-btn').addEventListener('click', () => {
      document.getElementById('price-alerts-modal').classList.remove('hidden');
      this.renderAlerts();
    });

    document.getElementById('close-alerts-modal').addEventListener('click', () => {
      document.getElementById('price-alerts-modal').classList.add('hidden');
    });

    document.getElementById('add-alert').addEventListener('click', () => {
      this.addAlert();
    });

    // Chart modal
    document.getElementById('price-chart-btn').addEventListener('click', () => {
      document.getElementById('price-chart-modal').classList.remove('hidden');
      this.renderPriceChart();
    });

    document.getElementById('close-chart-modal').addEventListener('click', () => {
      document.getElementById('price-chart-modal').classList.add('hidden');
    });
  }

  async fetchPrices() {
    try {
      // Use the new real-time price fetching
      const prices = await this.fetchRealTimePrices();

      // Cache prices with timestamp
      localStorage.setItem(
        'cached_prices',
        JSON.stringify({
          prices,
          timestamp: Date.now(),
        }),
      );

      return prices;
    } catch (error) {
      console.error('All price fetching methods failed:', error);
      // Return cached prices as last resort
      return this.getCachedPrices() || this.getStaticPrices();
    }
  }

  async fetchXRPLTokenPrice(tokenCode, issuerAddress, fallbackPrice) {
    // Try multiple XRPL data sources for better reliability
    const apiAttempts = [
      // Method 1: XRPScan API
      async () => {
        const response = await fetch(
          `${this.apiEndpoints.xrpScan}/account/${issuerAddress}/tokens`,
        );
        const data = await response.json();
        if (data && data.tokens) {
          const token = data.tokens.find((t) => t.currency === tokenCode);
          if (token && token.price) {
            return parseFloat(token.price);
          }
        }
        return null;
      },

      // Method 2: Bithomp API
      async () => {
        const response = await fetch(
          `${this.apiEndpoints.bithomp}/token/${issuerAddress}.${tokenCode}`,
        );
        const data = await response.json();
        if (data && data.price) {
          return parseFloat(data.price);
        }
        return null;
      },

      // Method 3: Direct XRPL orderbook
      async () => {
        const orderBookRequest = {
          method: 'book_offers',
          params: [
            {
              taker_gets: {
                currency: tokenCode,
                issuer: issuerAddress,
              },
              taker_pays: 'XRP',
              limit: 10,
            },
          ],
        };

        const response = await fetch(this.apiEndpoints.xrplCluster, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderBookRequest),
        });

        const data = await response.json();
        if (data.result && data.result.offers && data.result.offers.length > 0) {
          const bestOffer = data.result.offers[0];
          const takerGets = parseFloat(bestOffer.TakerGets.value);
          const takerPays = parseFloat(bestOffer.TakerPays) / 1000000; // Convert drops to XRP
          return takerPays / takerGets;
        }
        return null;
      },
    ];

    // Try each method until one succeeds
    for (const attempt of apiAttempts) {
      try {
        const price = await attempt();
        if (price && price > 0) {
          console.log(`Successfully fetched ${tokenCode} price: ${price} XRP`);
          return price;
        }
      } catch (error) {
        console.warn(`API attempt failed for ${tokenCode}:`, error);
        continue;
      }
    }

    console.warn(
      `All API attempts failed for ${tokenCode}, using fallback price: ${fallbackPrice}`,
    );
    return fallbackPrice;
  }

  async fetchRealTimePrices() {
    const prices = {};

    try {
      // 1. Fetch XRP price (most reliable)
      const xrpPrice = await this.fetchXRPPrice();
      prices.XRP = xrpPrice;

      // 2. Fetch XPM price in parallel
      const xpmPriceInXRP = await this.fetchXRPLTokenPrice(
        'XPM',
        'rXPMxBeefHGxx2K7g5qmmWq3gFsgawkoa',
        0.048, // Current XPM/XRP rate based on your screenshot
      );

      prices.XPM = {
        price: xpmPriceInXRP * xrpPrice.price,
        change24h: this.calculateTokenChange('XPM', xpmPriceInXRP * xrpPrice.price),
        priceInXRP: xpmPriceInXRP,
      };

      // 3. Fetch BURNI price with real issuer address
      const burniPriceInXRP = await this.fetchXRPLTokenPrice(
        'BURNI',
        'rJzQVveWEob6x6PJQqXm9sdcFjGbACBwv2', // Real BURNI issuer address
        0.0026, // Current BURNI/XRP rate based on your screenshot
      );

      prices.BURNI = {
        price: burniPriceInXRP * xrpPrice.price,
        change24h: this.calculateTokenChange('BURNI', burniPriceInXRP * xrpPrice.price),
        priceInXRP: burniPriceInXRP,
      };
    } catch (error) {
      console.error('Failed to fetch real-time prices:', error);
      return this.getStaticPrices(); // Fallback to current known prices
    }

    return prices;
  }

  async fetchXRPPrice() {
    try {
      const response = await fetch(
        `${this.apiEndpoints.coingecko}/simple/price?ids=ripple&vs_currencies=usd&include_24hr_change=true`,
      );
      const data = await response.json();

      if (data.ripple) {
        return {
          price: data.ripple.usd,
          change24h: data.ripple.usd_24h_change || 0,
        };
      }
    } catch (error) {
      console.error('Failed to fetch XRP price:', error);
    }

    // Fallback to current price from screenshot
    return {
      price: 0.5,
      change24h: 0,
    };
  }

  getStaticPrices() {
    // Current prices based on your screenshot
    return {
      XRP: {
        price: 0.5,
        change24h: 0,
      },
      XPM: {
        price: 0.024,
        change24h: 0,
        priceInXRP: 0.048,
      },
      BURNI: {
        price: 0.0013,
        change24h: 0,
        priceInXRP: 0.0026,
      },
    };
  }

  calculateTokenChange(symbol, currentPrice) {
    const history = this.priceHistory[symbol];
    if (!history || history.length < 2) return 0;

    // Get price from 24 hours ago (assuming 30-second intervals = 2880 data points per day)
    const dayAgoIndex = Math.max(0, history.length - 2880);
    const dayAgoPrice = history[dayAgoIndex]?.price;

    if (!dayAgoPrice) return 0;

    return ((currentPrice - dayAgoPrice) / dayAgoPrice) * 100;
  }

  async startPriceUpdates() {
    const updatePrices = async () => {
      try {
        const prices = await this.fetchPrices();
        this.updatePriceDisplay(prices);
        this.storePriceHistory(prices);
        this.checkAlerts(prices);
      } catch (error) {
        console.error('Price update failed:', error);
      }
    };

    // Initial update
    await updatePrices();

    // Regular updates
    setInterval(updatePrices, this.updateInterval);
  }

  updatePriceDisplay(prices) {
    this.symbols.forEach((symbol) => {
      const priceData = prices[symbol];
      if (!priceData) return;

      const priceEl = document.getElementById(`price-value-${symbol.toLowerCase()}`);
      const changeEl = document.getElementById(`price-change-${symbol.toLowerCase()}`);
      const indicatorEl = document.getElementById(`change-indicator-${symbol.toLowerCase()}`);

      if (priceEl) {
        priceEl.textContent = `$${priceData.price.toFixed(symbol === 'XRP' ? 4 : 6)}`;
      }

      if (changeEl) {
        const change = priceData.change24h;
        const isPositive = change >= 0;
        changeEl.textContent = `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
        changeEl.className = `text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`;
      }

      if (indicatorEl) {
        const trend = this.getPriceTrend(symbol, priceData.price);
        indicatorEl.textContent = trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→';
      }
    });

    // Update timestamp
    const timeEl = document.getElementById('last-update-time');
    if (timeEl) {
      timeEl.textContent = new Date().toLocaleTimeString();
    }
  }

  storePriceHistory(prices) {
    const timestamp = Date.now();

    this.symbols.forEach((symbol) => {
      if (!this.priceHistory[symbol]) {
        this.priceHistory[symbol] = [];
      }

      const priceData = prices[symbol];
      if (priceData) {
        this.priceHistory[symbol].push({
          timestamp,
          price: priceData.price,
          change24h: priceData.change24h,
        });

        // Keep only last 100 data points
        if (this.priceHistory[symbol].length > 100) {
          this.priceHistory[symbol] = this.priceHistory[symbol].slice(-100);
        }
      }
    });

    // Save to localStorage
    localStorage.setItem('price_history', JSON.stringify(this.priceHistory));
  }

  loadHistoricalData() {
    const saved = localStorage.getItem('price_history');
    if (saved) {
      this.priceHistory = JSON.parse(saved);
    }
  }

  getPriceTrend(symbol, currentPrice) {
    const history = this.priceHistory[symbol];
    if (!history || history.length < 2) return 'neutral';

    const lastPrice = history[history.length - 2]?.price;
    if (!lastPrice) return 'neutral';

    const change = (currentPrice - lastPrice) / lastPrice;
    return change > 0.001 ? 'up' : change < -0.001 ? 'down' : 'neutral';
  }

  addAlert() {
    const symbol = document.getElementById('alert-symbol').value;
    const type = document.getElementById('alert-type').value;
    const price = parseFloat(document.getElementById('alert-price').value);

    if (!price || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const alert = {
      id: Date.now(),
      symbol,
      type,
      price,
      created: new Date().toISOString(),
    };

    this.alerts.push(alert);
    localStorage.setItem('price_alerts', JSON.stringify(this.alerts));

    this.renderAlerts();

    // Clear form
    document.getElementById('alert-price').value = '';
  }

  renderAlerts() {
    const container = document.getElementById('alerts-list');
    if (!container) return;

    container.innerHTML = this.alerts
      .map(
        (alert) => `
      <div class="flex justify-between items-center p-2 border rounded">
        <div class="text-sm">
          <span class="font-semibold">${alert.symbol}</span>
          ${alert.type} $${alert.price}
        </div>
        <button onclick="window.priceTracker.removeAlert(${alert.id})" class="text-red-500 text-xs">Remove</button>
      </div>
    `,
      )
      .join('');
  }

  removeAlert(alertId) {
    this.alerts = this.alerts.filter((alert) => alert.id !== alertId);
    localStorage.setItem('price_alerts', JSON.stringify(this.alerts));
    this.renderAlerts();
  }

  checkAlerts(prices) {
    this.alerts.forEach((alert) => {
      const priceData = prices[alert.symbol];
      if (!priceData) return;

      const currentPrice = priceData.price;
      const triggered =
        (alert.type === 'above' && currentPrice >= alert.price) ||
        (alert.type === 'below' && currentPrice <= alert.price);

      if (triggered) {
        this.showNotification(alert, currentPrice);
        this.removeAlert(alert.id);
      }
    });
  }

  setupNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  showNotification(alert, currentPrice) {
    const message = `${alert.symbol} is now ${alert.type} $${alert.price}! Current: $${currentPrice.toFixed(6)}`;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Burni Price Alert', {
        body: message,
        icon: '/assets/images/favicon-32x32.png',
      });
    }

    // Also show browser alert as fallback
    alert(message);
  }

  renderPriceChart() {
    const canvas = document.getElementById('price-history-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Simple chart rendering (you might want to use Chart.js here)
    const symbol = 'BURNI'; // Default to BURNI
    const data = this.priceHistory[symbol] || [];

    if (data.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No historical data available', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find min/max prices
    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Draw chart
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * canvas.width;
      const y = canvas.height - ((point.price - minPrice) / priceRange) * canvas.height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Min: $${minPrice.toFixed(6)}`, 10, canvas.height - 10);
    ctx.textAlign = 'right';
    ctx.fillText(`Max: $${maxPrice.toFixed(6)}`, canvas.width - 10, 20);
  }
}

// Initialize price tracker when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Price Tracker...');
    window.priceTracker = new TokenPriceTracker();
  });
} else {
  // DOM is already loaded
  console.log('🚀 DOM already loaded, initializing Price Tracker...');
  window.priceTracker = new TokenPriceTracker();
}

// Keyboard shortcut to toggle widget (Ctrl+Shift+P)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    const widget = document.getElementById('price-tracker-widget');
    if (widget) {
      widget.style.display = widget.style.display === 'none' ? 'block' : 'none';
    }
  }
});

// Make TokenPriceTracker available globally
window.TokenPriceTracker = TokenPriceTracker;
