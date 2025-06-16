/**
 * Real-Time Price Monitor for Burni Token
 * Advanced price tracking with WebSocket support
 */

class RealTimePriceMonitor {
  constructor() {
    this.prices = {
      burni: { current: 0.0011, change24h: 0, trend: 'stable' },
      xrp: { current: 0.5, change24h: 0, trend: 'stable' },
      xpm: { current: 0.02, change24h: 0, trend: 'stable' },
    };

    this.subscribers = new Set();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.updateInterval = null;

    this.init();
  }

  init() {
    this.createPriceElements();
    this.setupWebSocket();
    this.setupFallbackPolling();
    this.setupVisibilityHandling();
    this.startMonitoring();
  }

  createPriceElements() {
    // Create dynamic price display elements if they don't exist
    const priceContainer =
      document.querySelector('.price-container') || this.createPriceContainer();

    const priceHTML = `
      <div class="real-time-prices">
        <div class="price-header">
          <h3>🔥 Live Prices</h3>
          <span class="connection-status" id="connection-status">●</span>
        </div>
        <div class="price-grid">
          <div class="price-item" data-token="burni">
            <div class="token-info">
              <img src="/assets/images/burnicoin.jpg" alt="Burni" class="token-icon">
              <span class="token-name">BURNI</span>
            </div>
            <div class="price-data">
              <span class="price" id="burni-price">$0.0011</span>
              <span class="change" id="burni-change">+0.00%</span>
            </div>
          </div>
          
          <div class="price-item" data-token="xrp">
            <div class="token-info">
              <span class="token-symbol">XRP</span>
              <span class="token-name">Ripple</span>
            </div>
            <div class="price-data">
              <span class="price" id="xrp-price">$0.50</span>
              <span class="change" id="xrp-change">+0.00%</span>
            </div>
          </div>
          
          <div class="price-item" data-token="xpm">
            <div class="token-info">
              <span class="token-symbol">XPM</span>
              <span class="token-name">XPMarket</span>
            </div>
            <div class="price-data">
              <span class="price" id="xpm-price">$0.02</span>
              <span class="change" id="xpm-change">+0.00%</span>
            </div>
          </div>
        </div>
        <div class="last-updated">
          Last updated: <span id="last-updated">Just now</span>
        </div>
      </div>
    `;

    priceContainer.innerHTML = priceHTML;
    this.addPriceStyles();
  }

  createPriceContainer() {
    const container = document.createElement('div');
    container.className = 'price-container';

    // Insert after hero section or at top of main content
    const heroSection = document.querySelector('#hero');
    const targetElement = heroSection?.nextElementSibling || document.querySelector('main');

    if (targetElement) {
      targetElement.insertAdjacentElement('beforebegin', container);
    } else {
      document.body.appendChild(container);
    }

    return container;
  }

  addPriceStyles() {
    if (document.getElementById('price-monitor-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'price-monitor-styles';
    styles.textContent = `
      .real-time-prices {
        background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.05));
        border: 1px solid rgba(249, 115, 22, 0.2);
        border-radius: 15px;
        padding: 20px;
        margin: 20px 0;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .price-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .price-header h3 {
        margin: 0;
        color: #f97316;
        font-size: 1.2rem;
      }
      
      .connection-status {
        font-size: 1.5rem;
        transition: color 0.3s ease;
      }
      
      .connection-status.connected { color: #10b981; }
      .connection-status.disconnected { color: #ef4444; }
      .connection-status.connecting { color: #f59e0b; }
      
      .price-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 15px;
      }
      
      .price-item {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 10px;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .price-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .token-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .token-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
      
      .token-symbol {
        font-weight: bold;
        color: #f97316;
      }
      
      .token-name {
        font-size: 0.9rem;
        color: #666;
      }
      
      .price-data {
        text-align: right;
      }
      
      .price {
        display: block;
        font-weight: bold;
        font-size: 1.1rem;
        color: #1f2937;
      }
      
      .change {
        font-size: 0.85rem;
        padding: 2px 6px;
        border-radius: 4px;
        margin-top: 4px;
        display: inline-block;
      }
      
      .change.positive {
        background: #dcfce7;
        color: #166534;
      }
      
      .change.negative {
        background: #fef2f2;
        color: #dc2626;
      }
      
      .change.neutral {
        background: #f3f4f6;
        color: #6b7280;
      }
      
      .last-updated {
        text-align: center;
        font-size: 0.8rem;
        color: #6b7280;
        margin-top: 10px;
      }
      
      @keyframes priceUpdate {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .price-updating {
        animation: priceUpdate 0.5s ease-in-out;
      }
      
      @media (max-width: 640px) {
        .price-grid {
          grid-template-columns: 1fr;
        }
        
        .real-time-prices {
          margin: 10px;
          padding: 15px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  setupWebSocket() {
    // Try to connect to WebSocket for real-time updates
    try {
      // Replace with actual WebSocket endpoint when available
      const wsUrl = 'wss://api.burnitoken.website/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔗 Real-time price connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateConnectionStatus('connected');

        // Subscribe to price updates
        this.ws.send(
          JSON.stringify({
            type: 'subscribe',
            channels: ['prices', 'burni', 'xrp', 'xpm'],
          }),
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlePriceUpdate(data);
        } catch (error) {
          console.log('WebSocket message parsing failed:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        this.isConnected = false;
        this.updateConnectionStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.log('❌ WebSocket error:', error);
        this.isConnected = false;
        this.updateConnectionStatus('disconnected');
      };
    } catch (error) {
      console.log('WebSocket not available, using polling');
      this.setupFallbackPolling();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      this.reconnectAttempts++;

      setTimeout(() => {
        console.log(
          `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );
        this.updateConnectionStatus('connecting');
        this.setupWebSocket();
      }, delay);
    }
  }

  setupFallbackPolling() {
    // Fallback to polling if WebSocket fails
    this.updateInterval = setInterval(() => {
      if (!this.isConnected) {
        this.fetchPriceData();
      }
    }, 30000); // Poll every 30 seconds
  }

  async fetchPriceData() {
    try {
      // Simulate API calls - replace with actual endpoints
      const responses = await Promise.allSettled([
        this.fetchTokenPrice('burni'),
        this.fetchTokenPrice('xrp'),
        this.fetchTokenPrice('xpm'),
      ]);

      responses.forEach((response, index) => {
        if (response.status === 'fulfilled') {
          const tokens = ['burni', 'xrp', 'xpm'];
          this.updatePrice(tokens[index], response.value);
        }
      });

      this.updateLastUpdated();
    } catch (error) {
      console.log('Price fetch failed:', error);
      this.showOfflineIndicator();
    }
  }

  async fetchTokenPrice(token) {
    // Mock price data - replace with actual API calls
    const mockPrices = {
      burni: 0.0011 + (Math.random() - 0.5) * 0.0002,
      xrp: 0.5 + (Math.random() - 0.5) * 0.05,
      xpm: 0.02 + (Math.random() - 0.5) * 0.002,
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

    return {
      price: mockPrices[token],
      change24h: (Math.random() - 0.5) * 10, // -5% to +5%
    };
  }

  handlePriceUpdate(data) {
    if (data.type === 'price_update') {
      const { token, price, change24h } = data;
      this.updatePrice(token, { price, change24h });
    }
  }

  updatePrice(token, data) {
    const priceElement = document.getElementById(`${token}-price`);
    const changeElement = document.getElementById(`${token}-change`);

    if (priceElement && changeElement) {
      // Update price with animation
      priceElement.textContent = `$${data.price.toFixed(token === 'burni' ? 4 : 2)}`;
      priceElement.classList.add('price-updating');
      setTimeout(() => priceElement.classList.remove('price-updating'), 500);

      // Update change percentage
      const changeValue = data.change24h;
      const changeText = `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`;
      changeElement.textContent = changeText;

      // Update change styling
      changeElement.className = 'change';
      if (changeValue > 0) {
        changeElement.classList.add('positive');
      } else if (changeValue < 0) {
        changeElement.classList.add('negative');
      } else {
        changeElement.classList.add('neutral');
      }

      // Store price data
      this.prices[token] = {
        current: data.price,
        change24h: changeValue,
        trend: changeValue > 0 ? 'up' : changeValue < 0 ? 'down' : 'stable',
      };

      // Notify subscribers
      this.notifySubscribers(token, this.prices[token]);
    }
  }

  updateConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
      statusElement.className = `connection-status ${status}`;
      statusElement.title =
        status === 'connected'
          ? 'Live updates active'
          : status === 'connecting'
            ? 'Connecting...'
            : 'Offline mode';
    }
  }

  updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = new Date().toLocaleTimeString();
    }
  }

  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseUpdates();
      } else {
        this.resumeUpdates();
      }
    });
  }

  pauseUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  resumeUpdates() {
    this.setupFallbackPolling();
    this.fetchPriceData(); // Immediate update when returning to page
  }

  startMonitoring() {
    // Initial price fetch
    this.fetchPriceData();

    // Subscribe to price notifications
    if ('BurniAnalytics' in window) {
      window.BurniAnalytics.trackEvent('price_monitor_started');
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(token, priceData) {
    this.subscribers.forEach((callback) => {
      try {
        callback(token, priceData);
      } catch (error) {
        console.log('Subscriber notification failed:', error);
      }
    });
  }

  getCurrentPrice(token) {
    return this.prices[token];
  }

  destroy() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.subscribers.clear();
  }
}

// Initialize real-time price monitor when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.PriceMonitor = new RealTimePriceMonitor();
  });
} else {
  window.PriceMonitor = new RealTimePriceMonitor();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealTimePriceMonitor;
}
