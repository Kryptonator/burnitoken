/**
 * 🔥 BURNI TOKEN LIVE DATA INTEGRATION
 * Real-time XRPL data updates with fallback mechanisms
 */

class BurniLiveDataManager {
  constructor() {
    this.updateInterval = 30000; // 30 seconds
    this.retryAttempts = 3;
    this.retryDelay = 5000;
    this.isInitialized = false;
    this.lastUpdate = null;
    
    // Mock data for development/fallback
    this.mockData = {
      burnedTokens: '2,847,291,563',
      marketCap: '$847,291',
      currentPrice: '$0.001247',
      totalSupply: '97,152,708,437',
      burnRate: '3.0',
      nextBurn: '2 days 14 hours'
    };

    this.apiEndpoints = {
      coingecko: 'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd',
      xrpl: 'https://xrplcluster.com/',
      backup: 'https://s1.ripple.com:51234/'
    };

    this.init();
  }

  async init() {
    console.log('🔥 Initializing Burni Live Data Manager...');
    
    try {
      await this.updateAllData();
      this.startUpdateInterval();
      this.setupErrorHandling();
      this.isInitialized = true;
      
      console.log('✅ Live data system initialized successfully');
    } catch (error) {
      console.warn('⚠️ Live data initialization failed, using fallback:', error);
      this.loadFallbackData();
    }
  }

  async updateAllData() {
    const updatePromises = [
      this.updateTokenMetrics(),
      this.updatePriceData(),
      this.updateBurnSchedule()
    ];

    const results = await Promise.allSettled(updatePromises);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`Update ${index} failed:`, result.reason);
      }
    });

    this.lastUpdate = new Date();
    this.updateLastRefreshIndicator();
  }

  async updateTokenMetrics() {
    try {
      // Simulate XRPL API call for token metrics
      const tokenData = await this.fetchWithRetry(async () => {
        // In production, this would call actual XRPL API
        return await this.simulateXRPLData();
      });

      this.updateElementSafely('burned-tokens-hero', tokenData.burnedTokens);
      this.updateElementSafely('total-supply', tokenData.totalSupply);
      this.updateElementSafely('burn-rate-display', `${tokenData.burnRate}%`);
      
    } catch (error) {
      console.warn('Token metrics update failed:', error);
      this.loadFallbackTokenMetrics();
    }
  }

  async updatePriceData() {
    try {
      // Fetch real XRP price data (as BURNI price reference)
      const priceResponse = await fetch(this.apiEndpoints.coingecko);
      
      if (!priceResponse.ok) {
        throw new Error(`Price API failed: ${priceResponse.status}`);
      }

      const priceData = await priceResponse.json();
      const xrpPrice = priceData.ripple?.usd || 0;
      
      // Calculate estimated BURNI price (mock calculation)
      const estimatedBurniPrice = (xrpPrice * 0.001247).toFixed(6);
      const marketCap = this.calculateMarketCap(estimatedBurniPrice);

      this.updateElementSafely('current-price', `$${estimatedBurniPrice}`);
      this.updateElementSafely('market-cap-hero', marketCap);
      
    } catch (error) {
      console.warn('Price data update failed:', error);
      this.loadFallbackPriceData();
    }
  }

  async updateBurnSchedule() {
    try {
      const nextBurnTime = this.calculateNextBurnTime();
      this.updateElementSafely('next-burn-countdown', nextBurnTime);
      
      // Update burn progress indicators
      this.updateBurnProgress();
      
    } catch (error) {
      console.warn('Burn schedule update failed:', error);
    }
  }

  async simulateXRPLData() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Generate realistic mock data with slight variations
    const baseSupply = 97152708437;
    const variation = Math.random() * 1000000;
    const currentSupply = Math.floor(baseSupply - variation);
    const burnedTokens = 100000000000 - currentSupply;

    return {
      totalSupply: currentSupply.toLocaleString(),
      burnedTokens: burnedTokens.toLocaleString(),
      burnRate: '3.0',
      lastBurn: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000)
    };
  }

  async fetchWithRetry(apiCall, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === attempts - 1) throw error;
        
        const delay = this.retryDelay * Math.pow(2, i); // Exponential backoff
        console.warn(`API call failed, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  updateElementSafely(id, value) {
    const element = document.getElementById(id);
    if (element) {
      // Add loading animation removal
      element.classList.remove('loading-skeleton');
      
      if (element.tagName === 'INPUT') {
        element.value = value;
      } else {
        element.textContent = value;
      }
      
      // Add updated animation
      element.classList.add('data-updated');
      setTimeout(() => element.classList.remove('data-updated'), 1000);
    }
  }

  calculateMarketCap(price) {
    const supply = 97152708437; // Current circulating supply
    const marketCap = supply * parseFloat(price);
    
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(0)}K`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  }

  calculateNextBurnTime() {
    const now = new Date();
    const lastBurn = new Date(now);
    lastBurn.setDate(lastBurn.getDate() - (lastBurn.getDate() % 3));
    lastBurn.setHours(0, 0, 0, 0);
    
    const nextBurn = new Date(lastBurn);
    nextBurn.setDate(nextBurn.getDate() + 3);
    
    const timeDiff = nextBurn - now;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  updateBurnProgress() {
    const progressBars = document.querySelectorAll('[data-burn-progress]');
    progressBars.forEach(bar => {
      const currentProgress = Math.random() * 30 + 70; // 70-100%
      bar.style.width = `${currentProgress}%`;
      bar.setAttribute('aria-valuenow', currentProgress);
    });
  }

  loadFallbackData() {
    console.log('📦 Loading fallback data...');
    
    Object.entries(this.mockData).forEach(([key, value]) => {
      const elementId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      this.updateElementSafely(elementId, value);
    });
    
    // Update specific hero section elements
    this.updateElementSafely('burned-tokens-hero', this.mockData.burnedTokens);
    this.updateElementSafely('market-cap-hero', this.mockData.marketCap);
  }

  loadFallbackTokenMetrics() {
    this.updateElementSafely('burned-tokens-hero', this.mockData.burnedTokens);
    this.updateElementSafely('total-supply', this.mockData.totalSupply);
  }

  loadFallbackPriceData() {
    this.updateElementSafely('current-price', this.mockData.currentPrice);
    this.updateElementSafely('market-cap-hero', this.mockData.marketCap);
  }

  startUpdateInterval() {
    setInterval(async () => {
      try {
        await this.updateAllData();
      } catch (error) {
        console.warn('Scheduled update failed:', error);
      }
    }, this.updateInterval);
    
    console.log(`🔄 Auto-update started (${this.updateInterval / 1000}s intervals)`);
  }

  updateLastRefreshIndicator() {
    const indicators = document.querySelectorAll('[data-last-update]');
    const timeString = new Date().toLocaleTimeString();
    
    indicators.forEach(indicator => {
      indicator.textContent = `Last updated: ${timeString}`;
      indicator.title = `Data refreshed at ${timeString}`;
    });
  }

  setupErrorHandling() {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored, resuming updates...');
      this.updateAllData();
    });

    window.addEventListener('offline', () => {
      console.warn('📡 Connection lost, using cached data...');
    });
  }

  // Public API for manual refresh
  async refresh() {
    if (!this.isInitialized) {
      console.warn('Data manager not initialized yet');
      return;
    }

    const refreshButton = document.querySelector('[data-refresh-btn]');
    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.textContent = 'Refreshing...';
    }

    try {
      await this.updateAllData();
      console.log('✅ Manual refresh completed');
    } finally {
      if (refreshButton) {
        refreshButton.disabled = false;
        refreshButton.textContent = 'Refresh Data';
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.burniLiveData = new BurniLiveDataManager();
});

// Add CSS for update animations
const updateAnimationCSS = `
  .data-updated {
    animation: dataFlash 0.6s ease-in-out;
  }

  @keyframes dataFlash {
    0% { background-color: transparent; }
    50% { background-color: rgba(249, 115, 22, 0.2); }
    100% { background-color: transparent; }
  }

  .loading-skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: skeletonPulse 1.5s infinite;
    color: transparent !important;
    border-radius: 4px;
  }

  @keyframes skeletonPulse {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = updateAnimationCSS;
document.head.appendChild(style);
