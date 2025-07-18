// Price Tracker - Robust API Fallback System
console.log('🔥 BurniToken Price Tracker with API Fallbacks loaded');

// Price tracking functionality with multiple API fallbacks
window.PriceTracker = {
  // API Configuration with fallbacks
  apiConfig: {
    primary: {
      name: 'CoinGecko',
      endpoints: {
        xrp: 'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd',
        xpm: 'https://api.coingecko.com/api/v3/simple/price?ids=primecoin&vs_currencies=usd'
      },
      parser: function(data, coin) {
        if (coin === 'xrp') return data.ripple?.usd;
        if (coin === 'xpm') return data.primecoin?.usd;
        return null;
      }
    },
    secondary: {
      name: 'CoinCap',
      endpoints: {
        xrp: 'https://api.coincap.io/v2/assets/ripple',
        xpm: 'https://api.coincap.io/v2/assets/primecoin'
      },
      parser: function(data, coin) {
        return data.data?.priceUsd ? parseFloat(data.data.priceUsd) : null;
      }
    },
    tertiary: {
      name: 'CryptoCompare',
      endpoints: {
        xrp: 'https://min-api.cryptocompare.com/data/price?fsym=XRP&tsyms=USD',
        xpm: 'https://min-api.cryptocompare.com/data/price?fsym=XPM&tsyms=USD'
      },
      parser: function(data, coin) {
        return data.USD ? parseFloat(data.USD) : null;
      }
    }
  },

  // State management
  state: {
    lastUpdate: null,
    updateInterval: 30000, // 30 seconds
    retryInterval: 5000, // 5 seconds on error
    maxRetries: 3,
    currentRetries: 0,
    isLoading: false,
    lastSuccessfulApi: null,
    prices: {
      xrp: null,
      xpm: null,
      burni: 0.000001 // Static for now
    },
    errors: []
  },

  init: function () {
    console.log('🚀 Price Tracker initialized with robust fallback system');
    this.setupUI();
    this.startTracking();
  },

  setupUI: function() {
    // Setup loading and error states in UI
    this.updateLoadingState(true);
    this.showStatus('Initializing price tracking...', 'info');
  },

  startTracking: function () {
    console.log('📈 Starting price tracking with fallback mechanisms');
    
    // Initial load
    this.updatePrices();
    
    // Set up regular updates
    this.setupUpdateInterval();
  },

  setupUpdateInterval: function() {
    // Clear existing interval
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
    
    this.updateIntervalId = setInterval(() => {
      this.updatePrices();
    }, this.state.updateInterval);
  },

  updatePrices: async function () {
    if (this.state.isLoading) {
      console.log('⏳ Price update already in progress, skipping...');
      return;
    }

    this.state.isLoading = true;
    this.updateLoadingState(true);
    
    console.log('🔄 Updating prices with fallback strategy...');

    try {
      // Try to fetch prices with fallback strategy
      const prices = await this.fetchPricesWithFallback();
      
      if (prices.xrp !== null || prices.xpm !== null) {
        // Update successful
        this.state.prices = { ...this.state.prices, ...prices };
        this.state.lastUpdate = new Date();
        this.state.currentRetries = 0;
        this.updateUI();
        this.showStatus('Prices updated successfully', 'success');
        console.log('✅ Prices updated successfully:', prices);
      } else {
        throw new Error('No valid price data received from any API');
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.state.isLoading = false;
      this.updateLoadingState(false);
    }
  },

  fetchPricesWithFallback: async function() {
    const apis = [this.apiConfig.primary, this.apiConfig.secondary, this.apiConfig.tertiary];
    const results = { xrp: null, xpm: null };
    
    for (const api of apis) {
      try {
        console.log(`🔄 Trying API: ${api.name}`);
        
        // Fetch XRP price
        if (results.xrp === null) {
          results.xrp = await this.fetchFromAPI(api, 'xrp');
        }
        
        // Fetch XPM price
        if (results.xpm === null) {
          results.xpm = await this.fetchFromAPI(api, 'xpm');
        }
        
        // If we got at least one price, mark this API as successful
        if (results.xrp !== null || results.xpm !== null) {
          this.state.lastSuccessfulApi = api.name;
          console.log(`✅ Successfully got data from ${api.name}`);
        }
        
        // If we got both prices, we can break
        if (results.xrp !== null && results.xpm !== null) {
          break;
        }
      } catch (error) {
        console.warn(`⚠️ API ${api.name} failed:`, error.message);
        this.state.errors.push({
          api: api.name,
          error: error.message,
          timestamp: new Date()
        });
      }
    }
    
    return results;
  },

  fetchFromAPI: async function(api, coin) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(api.endpoints[coin], {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const price = api.parser(data, coin);
      
      if (price === null || price === undefined || isNaN(price)) {
        throw new Error('Invalid price data received');
      }
      
      return price;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  handleError: function(error) {
    console.error('❌ Price tracking error:', error);
    
    this.state.currentRetries++;
    
    if (this.state.currentRetries < this.state.maxRetries) {
      this.showStatus(`Retrying in ${this.state.retryInterval/1000}s... (${this.state.currentRetries}/${this.state.maxRetries})`, 'warning');
      
      setTimeout(() => {
        this.updatePrices();
      }, this.state.retryInterval);
    } else {
      this.showStatus('All price APIs failed. Using last known prices.', 'error');
      this.state.currentRetries = 0;
      // Continue with regular interval
    }
  },

  updateUI: function() {
    const { xrp, xpm, burni } = this.state.prices;
    
    // Update all price displays
    this.updatePriceElement('direct-xrp', xrp, '$');
    this.updatePriceElement('direct-xpm', xpm, '$');
    this.updatePriceElement('direct-burni', burni, '$');
    
    // Update hero section KPIs
    this.updatePriceElement('price-hero', burni, '$');
    this.updatePriceElement('xrpPriceValue', xrp, '$');
    this.updatePriceElement('xpmPriceValue', xpm, '$');
    this.updatePriceElement('burniPriceValue', burni, '$');
    
    // Update timestamp
    this.updateTimestamp();
  },

  updatePriceElement: function(elementId, price, prefix = '') {
    const element = document.getElementById(elementId);
    if (element && price !== null) {
      const formattedPrice = this.formatPrice(price);
      element.textContent = prefix + formattedPrice;
      element.classList.remove('error');
    } else if (element) {
      element.textContent = 'N/A';
      element.classList.add('error');
    }
  },

  formatPrice: function(price) {
    if (price === null || price === undefined) return 'N/A';
    
    if (price < 0.001) {
      return price.toFixed(8);
    } else if (price < 1) {
      return price.toFixed(6);
    } else if (price < 100) {
      return price.toFixed(4);
    } else {
      return price.toFixed(2);
    }
  },

  updateTimestamp: function() {
    const elements = ['direct-update', 'lastUpdatedTimestamp'];
    const timeString = this.state.lastUpdate ? 
      this.state.lastUpdate.toLocaleTimeString() : 
      'Never';
    
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = timeString;
      }
    });
  },

  updateLoadingState: function(isLoading) {
    const elements = document.querySelectorAll('[data-loading]');
    elements.forEach(element => {
      element.setAttribute('data-loading', isLoading);
    });
  },

  showStatus: function(message, type = 'info') {
    console.log(`📊 Status [${type}]: ${message}`);
    
    // Show status in UI if status element exists
    const statusElement = document.getElementById('price-status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `price-status ${type}`;
      
      // Auto-hide success messages after 3 seconds
      if (type === 'success') {
        setTimeout(() => {
          statusElement.textContent = '';
          statusElement.className = 'price-status';
        }, 3000);
      }
    }
  },

  // Public methods for manual control
  forceUpdate: function() {
    console.log('🔄 Force updating prices...');
    this.state.currentRetries = 0;
    this.updatePrices();
  },

  getState: function() {
    return { ...this.state };
  },

  // Cleanup method
  destroy: function() {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
    console.log('🔥 Price Tracker destroyed');
  }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function () {
  if (window.PriceTracker) {
    window.PriceTracker.init();
  }
});
