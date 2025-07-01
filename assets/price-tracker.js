// Price Feed Monitor - Enhanced Price Tracking with Error Detection
console.log('Price Feed Monitor loaded');

// Price feed monitoring service
window.PriceFeedMonitor = {
  errors: [],
  lastValidResponse: null,
  consecutiveFailures: 0,
  
  init: function () {
    console.log('Price Feed Monitor initialized');
    this.startMonitoring();
  },

  startMonitoring: function () {
    console.log('Price feed monitoring started');
    // Monitor will be called by existing price update functions
  },

  // Validate API response structure
  validateResponse: function (response, endpoint) {
    if (!response) {
      return this.reportError('PF-5001', 'Der Endpunkt lieferte eine ungültige Antwort.', { 
        reason: 'Empty response', 
        endpoint: endpoint 
      });
    }

    // Validate CoinGecko API response structure
    if (endpoint.includes('coingecko.com')) {
      if (endpoint.includes('ripple')) {
        if (!response.ripple || typeof response.ripple.usd !== 'number') {
          return this.reportError('PF-5001', 'Der Endpunkt lieferte eine ungültige Antwort.', { 
            reason: 'Invalid XRP price structure', 
            endpoint: endpoint,
            received: response
          });
        }
      }
    }

    // Reset consecutive failures on successful validation
    this.consecutiveFailures = 0;
    this.lastValidResponse = {
      timestamp: new Date().toISOString(),
      endpoint: endpoint,
      data: response
    };

    return { valid: true, data: response };
  },

  // Report price feed errors in the required format
  reportError: function (errorCode, details, context) {
    this.consecutiveFailures++;
    
    const errorReport = {
      service: 'price-feed-monitor',
      timestamp: new Date().toISOString(),
      errorCode: errorCode,
      details: details,
      context: context || {},
      consecutiveFailures: this.consecutiveFailures
    };

    this.errors.push(errorReport);
    console.error('Price Feed Error:', JSON.stringify(errorReport, null, 2));

    // Log to BurniToken error handler if available
    if (window.BurniToken && window.BurniToken.errorHandler) {
      window.BurniToken.errorHandler.log(
        new Error(details), 
        'price-feed-monitor'
      );
    }

    // Trigger custom event for error monitoring
    window.dispatchEvent(new CustomEvent('priceFeedError', {
      detail: errorReport
    }));

    return { valid: false, error: errorReport };
  },

  // Monitor fetch operations for price endpoints
  monitorFetch: async function (url, options) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        return this.reportError('PF-5001', 'Der Endpunkt lieferte eine ungültige Antwort.', {
          reason: `HTTP ${response.status}: ${response.statusText}`,
          endpoint: url,
          status: response.status
        });
      }

      const data = await response.json();
      return this.validateResponse(data, url);
      
    } catch (error) {
      return this.reportError('PF-5001', 'Der Endpunkt lieferte eine ungültige Antwort.', {
        reason: error.message,
        endpoint: url,
        error: error.toString()
      });
    }
  },

  // Get monitoring status
  getStatus: function () {
    return {
      totalErrors: this.errors.length,
      consecutiveFailures: this.consecutiveFailures,
      lastValidResponse: this.lastValidResponse,
      recentErrors: this.errors.slice(-5) // Last 5 errors
    };
  },

  // Clear error history
  clearErrors: function () {
    this.errors = [];
    this.consecutiveFailures = 0;
    console.log('Price feed error history cleared');
  }
};

// Backward compatibility
window.PriceTracker = window.PriceFeedMonitor;

// Auto-initialize
document.addEventListener('DOMContentLoaded', function () {
  if (window.PriceFeedMonitor) {
    window.PriceFeedMonitor.init();
  }
});
