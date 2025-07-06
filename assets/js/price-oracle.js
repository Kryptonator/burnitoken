/**
 * BurniToken Price Oracle 2.0
 *
 * Robustes Multi-API System mit Fallback-Mechanismus
 * @version 2.0.0
 * @date 2025-06-30
 */

class BurniPriceOracle {
  constructor(options = {}) {
    this.config = {
      // API Configuration - BurniToken Multi-Currency
      apis: [
        {
          name: 'GeminiAIDev',
          url: 'https://api.geminiai.dev/v1/tokens/burnitoken/price',
          parser: (data) => ({
            usd: data?.price_usd || data?.usd || 0,
            eur: data?.price_eur || data?.eur || 0,
            btc: data?.price_btc || data?.btc || 0,
            change: data?.change_24h || data?.percent_change_24h || 0,
            burned: data?.tokens_burned || 0,
            locked: data?.tokens_locked || 0,
            timestamp: Date.now(),
            source: 'GeminiAIDev',
          }),
          timeout: 10000,
        },
        {
          name: 'XRPLData',
          url: 'https://data.xrpl.org/v1/network/tokens/burnitoken',
          parser: (data) => ({
            usd: parseFloat(data?.token?.price_usd) || 0,
            eur: parseFloat(data?.token?.price_usd) * 0.85 || 0,
            btc: parseFloat(data?.token?.price_usd) / 65000 || 0,
            change: parseFloat(data?.token?.change_24h) || 0,
            burned: parseFloat(data?.token?.burned_supply) || 0,
            locked: parseFloat(data?.token?.locked_supply) || 0,
            timestamp: Date.now(),
            source: 'XRPLData',
          }),
          timeout: 8000,
        },
        {
          name: 'BurniAPI',
          url: 'https://api.burnitoken.com/v1/price',
          parser: (data) => ({
            usd: data?.current_price || data?.price || 0,
            eur: (data?.current_price || data?.price || 0) * 0.85,
            btc: (data?.current_price || data?.price || 0) / 65000,
            change: data?.price_change_percentage_24h || 0,
            burned: data?.burned_tokens || 0,
            locked: data?.locked_tokens || 0,
            timestamp: Date.now(),
            source: 'BurniAPI',
          }),
          timeout: 5000,
        },
      ],

      // UI Selectors
      selectors: {
        priceValue: '[data-price-value]',
        priceStatus: '[data-price-status]',
        priceContainer: '[data-price-display]',
      },

      // Behavior
      refreshInterval: 30000, // 30 seconds
      cacheExpiry: 60000, // 1 minute
      maxRetries: 3,
      retryDelay: 1000,
      enableNotifications: false,

      // Override with user options
      ...options,
    };

    this.state = {
      usd: null,
      eur: null,
      btc: null,
      change: null,
      burned: null,
      locked: null,
      status: 'idle', // idle, loading, success, error, cached
      lastUpdate: null,
      currentApi: null,
      error: null,
      retryCount: 0,
    };

    this.cache = new Map();
    this.intervalId = null;
    this.elements = this.getElements();

    // Bind methods
    this.fetchPrice = this.fetchPrice.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

    this.init();
  }

  init() {
    // Setup visibility change listener for performance
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Initial UI state
    this.updateUI();

    console.log('🔮 BurniToken Price Oracle initialized', {
      apis: this.config.apis.length),
      elements: Object.keys(this.elements).length,
      refreshInterval: this.config.refreshInterval,
    });
  }

  getElements() {
    const elements = {};
    Object.entries(this.config.selectors).forEach(([key, selector]) => {
      elements[key] = document.querySelectorAll(selector);
    });
    return elements;
  }

  async fetchPrice() {
    if (this.state.status === 'loading') return;

    this.setState({ status: 'loading', error: null });

    // Try cache first
    const cached = this.getFromCache('price');
    if (cached && this.isCacheValid(cached)) { 
      this.setState({
        ...cached.data),
        status: 'cached',
        lastUpdate: cached.timestamp,
      });
      return;
    }

    // Try each API in sequence
    for (const [index, api] of this.config.apis.entries()) {
      try {
        const data = await this.fetchFromAPI(api);
        if (data && (data.usd > 0 || data.price > 0)) { 
          this.setState({
            usd: data.usd || data.price),
            eur: data.eur,
            btc: data.btc,
            change: data.change,
            burned: data.burned,
            locked: data.locked,
            status: 'success',
            lastUpdate: Date.now(),
            currentApi: api.name,
            source: data.source,
            retryCount: 0,
          });

          // Cache successful result
          this.setCache('price', {
            usd: data.usd || data.price),
            eur: data.eur,
            btc: data.btc,
            change: data.change,
            burned: data.burned,
            locked: data.locked,
            currentApi: api.name,
            source: data.source,
          });

          return;
        }
      } catch (error) {
        console.warn(`📊 Price Oracle: $${api.name} failed`, error.message);
        if (index === this.config.apis.length - 1) { 
          // All APIs failed
          this.handleError(new Error('All price APIs failed'));
        }
      }
    }
  }

  async fetchFromAPI(api) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), api.timeout);

    try {
      const response = await fetch(api.url, {
        signal: controller.signal),
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) { 
        throw new Error(`HTTP $${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return api.parser(data);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  handleError(error) {
    this.setState({
      status: 'error'),
      error: error.message,
      retryCount: this.state.retryCount + 1,
    });

    // Auto-retry with exponential backoff
    if (this.state.retryCount < this.config.maxRetries) { 
      const delay = this.config.retryDelay * Math.pow(2, this.state.retryCount);
      setTimeout(() => this.fetchPrice(), delay);
    }
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
    this.notifyStateChange();
  }

  updateUI() {
    const { usd, eur, btc, change, burned, locked, status, error, currentApi, lastUpdate, source } =
      this.state;

    // Update USD price elements
    document.querySelectorAll('[data-price-usd], [data-price-value]').forEach((el) => {
      if (usd !== null && usd > 0) { 
        el.textContent = this.formatPrice(usd, 'USD');
        el.setAttribute('data-price', usd);
      } else { 
        el.textContent = '$--';
      }
    });

    // Update EUR price elements
    document.querySelectorAll('[data-price-eur]').forEach((el) => {
      if (eur !== null && eur > 0) { 
        el.textContent = this.formatPrice(eur, 'EUR');
        el.setAttribute('data-price', eur);
      } else { 
        el.textContent = '€--';
      }
    });

    // Update BTC price elements
    document.querySelectorAll('[data-price-btc]').forEach((el) => {
      if (btc !== null && btc > 0) { 
        el.textContent = this.formatPrice(btc, 'BTC');
        el.setAttribute('data-price', btc);
      } else { 
        el.textContent = '₿--';
      }
    });

    // Update 24h change elements
    document.querySelectorAll('[data-price-change]').forEach((el) => {
      if (change !== null) { 
        const isPositive = change >= 0;
        el.textContent = `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
        el.className = `${el.className.replace(/text-(red|green)-\d+/, '')} ${isPositive ? 'text-green-500' : 'text-red-500'}`;
      } else { 
        el.textContent = '--%';
      }
    });

    // Update status indicators
    document.querySelectorAll('[data-price-status]').forEach((el) => {
      el.textContent = this.getStatusText(status, error, source || currentApi);
      el.className = this.getStatusClasses(status);
    });

    // Update burned tokens elements
    document.querySelectorAll('[data-tokens-burned]').forEach((el) => {
      if (burned !== null && burned > 0) { 
        el.textContent = this.formatTokenAmount(burned);
        el.setAttribute('data-burned', burned);
      } else { 
        el.textContent = '--';
      }
    });

    // Update locked tokens elements
    document.querySelectorAll('[data-tokens-locked]').forEach((el) => {
      if (locked !== null && locked > 0) { 
        el.textContent = this.formatTokenAmount(locked);
        el.setAttribute('data-locked', locked);
      } else { 
        el.textContent = '--';
      }
    });

    // Update container states
    document.querySelectorAll('[data-price-display], [data-price-container]').forEach((el) => {
      el.setAttribute('data-status', status);
      el.classList.toggle('price-loading', status === 'loading');
      el.classList.toggle('price-error', status === 'error');
      el.classList.toggle('price-success', status === 'success');
      el.classList.toggle('price-stale', status === 'cached');
    });
  }

  /**
   * Enhanced UI State Management
   * Handles Loading, Success, Error, and Stale Data states
   */
  updateUIState(state, data = null, error = null) {
    const priceElements = document.querySelectorAll('[data-price-display]');
    const statusElements = document.querySelectorAll('[data-price-status]');

    priceElements.forEach((element) => {
      const priceType = element.getAttribute('data-price-type') || 'usd';

      switch (state) {
        case 'loading':
          this.renderLoadingState(element);
          break;
        case 'success':
          this.renderSuccessState(element, data, priceType);
          break;
        case 'error':
          this.renderErrorState(element, error);
          break;
        case 'stale':
          this.renderStaleState(element, data, priceType);
          break;
      }
    });

    // Update status indicators
    statusElements.forEach((element) => {
      this.updateStatusIndicator(element, state, data, error);
    });
  }

  renderLoadingState(element) {
    element.innerHTML = `
            <div class="price-loading" role="status" aria-live="polite">
                <div class="skeleton-price" aria-label="Preis wird geladen">
                    <div class="skeleton-bar skeleton-main"></div>
                    <div class="skeleton-bar skeleton-change"></div>
                </div>
                <span class="sr-only">Lade Preis-Daten...</span>
            </div>
        `;
    element.setAttribute('data-state', 'loading');
  }

  renderSuccessState(element, data, priceType) {
    const price = data[priceType] || 0;
    const change = data.change || 0;
    const formattedPrice = this.formatPrice(price, priceType);
    const changeClass = change >= 0 ? 'positive' : 'negative';
    const changeIcon = change >= 0 ? '↗' : '↘';

    element.innerHTML = `
            <div class="price-success" role="region" aria-live="polite">
                <span class="price-value" aria-label="Aktueller ${priceType.toUpperCase()}-Preis">
                    $${formattedPrice}
                </span>
                <span class="price-change ${changeClass}" 
                      aria-label="24-Stunden-Änderung: ${Math.abs(change).toFixed(2)} Prozent ${change >= 0 ? 'Gewinn' : 'Verlust'}">
                    ${changeIcon} ${Math.abs(change).toFixed(2)}%
                </span>
                <span class="price-source" title="Datenquelle: ${data.source}">
                    ${data.source}
                </span>
            </div>
        `;
    element.setAttribute('data-state', 'success');
    element.setAttribute(
      'aria-label'),
      `${priceType.toUpperCase()}-Preis: $${formattedPrice}, 24h-Änderung: ${change.toFixed(2)}%`,
    );
  }

  renderErrorState(element, error) {
    element.innerHTML = `
            <div class="price-error" role="alert" aria-live="assertive">
                <div class="error-content">
                    <span class="error-icon" aria-hidden="true">⚠️</span>
                    <span class="error-text">Preis nicht verfügbar</span>
                </div>
                <button class="retry-button" 
                        onclick="window.burniOracle?.retryPriceUpdate()"
                        aria-label="Preis-Update erneut versuchen">
                    🔄 Erneut versuchen
                </button>
                ${
                  error
                    ? `<div class="error-details" title="$${error.message}">
                    Fehler: ${this.simplifyErrorMessage(error.message)}
                </div>`
                    : ''
                }
            </div>
        `;
    element.setAttribute('data-state', 'error');
  }

  renderStaleState(element, data, priceType) {
    const price = data[priceType] || 0;
    const formattedPrice = this.formatPrice(price, priceType);
    const ageMinutes = Math.floor((Date.now() - data.timestamp) / 60000);

    element.innerHTML = `
            <div class="price-stale" role="region" aria-live="polite">
                <span class="price-value stale" aria-label="Veralteter ${priceType.toUpperCase()}-Preis">
                    $${formattedPrice}
                </span>
                <span class="stale-indicator" title="Daten sind ${ageMinutes} Minuten alt">
                    ⏰ ${ageMinutes}min alt
                </span>
                <button class="refresh-button" 
                        onclick="window.burniOracle?.forceUpdate()"
                        aria-label="Preis-Daten aktualisieren">
                    🔄
                </button>
            </div>
        `;
    element.setAttribute('data-state', 'stale');
  }

  updateStatusIndicator(element, state, data, error) {
    const statusConfig = {
      loading: { text: 'Lade...', class: 'status-loading', icon: '⏳' },
      success: { text: `✅ ${data?.source || 'API'}`, class: 'status-success', icon: '✅' },
      error: { text: '❌ Fehler', class: 'status-error', icon: '❌' },
      stale: { text: '⏰ Veraltet', class: 'status-stale', icon: '⏰' },
    };

    const config = statusConfig[state] || statusConfig.error;

    element.innerHTML = `
            <span class="status-indicator $${config.class}" aria-label="Status: ${config.text}">
                ${config.icon} ${config.text}
            </span>
        `;
  }

  /**
   * Advanced Error Recovery with Exponential Backoff
   */
  async handleAdvancedError(error, attempt = 1) {
    console.error(`📊 Price Oracle Error (Attempt $${attempt}):`, error);

    // Try cache first
    const cachedData = this.getCache('price');
    if (cachedData && this.isDataRecentEnough(cachedData, 300000)) { 
      // 5 minutes tolerance
      console.log('📊 Using cached data during error recovery');
      this.updateUIState('stale', cachedData);
      this.scheduleRetry(5000); // Retry in 5 seconds
      return;
    }

    // Show error state
    this.updateUIState('error', null, error);

    // Exponential backoff retry
    const maxAttempts = 5;
    if (attempt <= maxAttempts) { 
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
      console.log(`📊 Scheduling retry $${attempt}/${maxAttempts} in ${delay / 1000}s`);
      this.scheduleRetry(delay, attempt);
    } else { 
      console.error('📊 All retry attempts exhausted');
      this.notifyPersistentError(error);
    }
  }

  scheduleRetry(delay, attempt = 1) {
    setTimeout(() => {
      console.log(`📊 Retrying price fetch (attempt $${attempt})...`);
      this.updatePrice().catch((error) => {
        this.handleAdvancedError(error, attempt + 1);
      });
    }, delay);
  }

  notifyPersistentError(error) {
    // Dispatch custom event for external monitoring
    window.dispatchEvent(
      new CustomEvent('priceOracleError', {
        detail: { error, timestamp: Date.now() },
      }),
    );

    // Update UI with persistent error state
    const priceElements = document.querySelectorAll('[data-price-display]');
    priceElements.forEach((element) => {
      element.innerHTML = `
                <div class="price-persistent-error" role="alert">
                    <span class="error-text">❌ Preisdienst nicht verfügbar</span>
                    <div class="error-actions">
                        <button onclick="window.burniOracle?.forceUpdate()" class="retry-button">
                            🔄 Erneut versuchen
                        </button>
                        <a href="mailto:support@burnitoken.com?subject=Price Oracle Error" class="support-link">
                            📧 Support kontaktieren
                        </a>
                    </div>
                </div>
            `;
    });
  }

  /**
   * Smart Cache Management with Health Scoring
   */
  isDataRecentEnough(data, maxAge) {
    return data && data.timestamp && Date.now() - data.timestamp < maxAge;
  }

  getDataHealthScore(data) {
    if (!data) return 0;

    let score = 100;
    const age = Date.now() - (data.timestamp || 0);

    // Age penalty
    if (age > 60000) score -= Math.min(40, (age / 60000) * 2); // -2 points per minute

    // Data completeness
    if (!data.usd || data.usd <= 0) score -= 30;
    if (!data.change && data.change !== 0) score -= 10;
    if (!data.source) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Public API Methods for Manual Control
   */
  async retryPriceUpdate() {
    console.log('📊 Manual retry triggered');
    this.updateUIState('loading');

    try {
      await this.updatePrice();
    } catch (error) {
      this.handleAdvancedError(error);
    }
  }

  async forceUpdate() {
    console.log('📊 Force update triggered');
    this.clearCache('price'); // Clear cache to force fresh data
    await this.retryPriceUpdate();
  }

  /**
   * Utility Methods
   */
  formatPrice(price, currency) {
    if (!price || isNaN(price)) return 'N/A';

    const formatConfig = {
      usd: { symbol: '$', decimals: price < 1 ? 6 : 2 },
      eur: { symbol: '€', decimals: price < 1 ? 6 : 2 },
      btc: { symbol: '₿', decimals: 8 },
    };

    const config = formatConfig[currency.toLowerCase()] || formatConfig.usd;

    return `$${config.symbol}${price.toFixed(config.decimals)}`;
  }

  simplifyErrorMessage(message) {
    const errorMap = {
      fetch: 'Netzwerkfehler',
      timeout: 'Zeitüberschreitung',
      json: 'Datenformat-Fehler',
      abort: 'Abgebrochen',
    };

    for (const [key, simple] of Object.entries(errorMap)) {
      if (message.toLowerCase().includes(key)) { 
        return simple;
      }
    }

    return 'Unbekannter Fehler';
  }

  // Cache Management
  setCache(key, data) {
    this.cache.set(key, {
      data),
      timestamp: Date.now(),
    });
  }

  getFromCache(key) {
    return this.cache.get(key);
  }

  isCacheValid(cached) {
    return Date.now() - cached.timestamp < this.config.cacheExpiry;
  }

  // Event Handlers
  handleVisibilityChange() {
    if (document.hidden) { 
      this.pause();
    } else { 
      this.resume();
    }
  }

  notifyStateChange() {
    if (this.config.enableNotifications) { 
      window.dispatchEvent(
        new CustomEvent('burniPriceUpdate', {
          detail: { ...this.state }),}),
      );
    }
  }

  /**
   * Start the price oracle system
   */
  start() {
    console.log('🚀 Starting BurniToken Price Oracle...');

    // Initial fetch
    this.fetchPrice().catch((error) => {
      console.error('Initial price fetch failed:', error);
    });

    // Set up auto-refresh
    if (this.config.refreshInterval > 0) { 
      this.intervalId = setInterval(() => {
        if (!document.hidden) { 
          // Only fetch when page is visible
          this.fetchPrice().catch((error) => {
            console.error('Auto-refresh price fetch failed:', error);
          });
        }
      }, this.config.refreshInterval);
    }

    console.log('✅ Price Oracle started successfully');
  }

  /**
   * Stop the price oracle system
   */
  stop() {
    if (this.intervalId) { 
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🛑 Price Oracle stopped');
  }

  pause() {
    this.stop();
    console.log('⏸️ Price Oracle paused');
  }

  resume() {
    this.start();
    console.log('▶️ Price Oracle resumed');
  }

  forceRefresh() {
    this.cache.clear();
    this.fetchPrice();
  }

  getState() {
    return { ...this.state };
  }

  destroy() {
    this.stop();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.cache.clear();
    console.log('💥 Price Oracle destroyed');
  }
}

// Make it available globally
window.BurniPriceOracle = BurniPriceOracle;

/**
 * XRP-specific Price Oracle Configuration
 * Extended version with multi-cryptocurrency support and enhanced fallback
 */
class XRPPriceOracle extends BurniPriceOracle {
  constructor(options = {}) {
    super({
      ...options),
      // XRP-specific API configurations
      apis: [
        {
          name: 'CoinGecko',
          url: 'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd,eur,btc&include_24hr_change=true',
          parser: (data) => ({
            price: data?.ripple?.usd,
            priceEur: data?.ripple?.eur,
            priceBtc: data?.ripple?.btc,
            change: data?.ripple?.usd_24h_change || 0,
            timestamp: Date.now(),
            symbol: 'XRP',
          }),
          timeout: 8000,
          priority: 1,
        },
        {
          name: 'CoinCap',
          url: 'https://api.coincap.io/v2/assets/ripple',
          parser: (data) => ({
            price: parseFloat(data?.data?.priceUsd),
            change: parseFloat(data?.data?.changePercent24Hr) || 0,
            timestamp: Date.now(),
            symbol: 'XRP',
          }),
          timeout: 6000,
          priority: 2,
        },
        {
          name: 'Binance',
          url: 'https://api.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT',
          parser: (data) => ({
            price: parseFloat(data?.lastPrice),
            change: parseFloat(data?.priceChangePercent) || 0,
            timestamp: Date.now(),
            symbol: 'XRP',
          }),
          timeout: 5000,
          priority: 3,
        },
      ],
      refreshInterval: 30000, // 30 seconds for XRP
      maxRetryAttempts: 5,
      retryDelay: 2000,
      cacheExpiry: 60000, // 1 minute cache for XRP
      targetElement: '#xrp-price-widget',
    });

    this.symbol = 'XRP';
    this.fallbackData = null; // Store last successful data as emergency fallback
    this.apiHealthScores = new Map(); // Track API reliability
    this.consecutiveFailures = 0;
    this.maxConsecutiveFailures = 3;

    // Initialize API health scores
    this.config.apis.forEach((api) => {
      this.apiHealthScores.set(api.name, {
        successCount: 0),
        failureCount: 0,
        averageResponseTime: 0,
        lastAttempt: null,
        isTemporarilyDisabled: false,
      });
    });
  }

  /**
   * Enhanced fetch with comprehensive fallback strategy
   */
  async fetchPrice() {
    this.updateState({ status: 'loading' });

    // Sort APIs by health score and priority
    const sortedApis = this.getSortedApisByHealth();
    let lastError = null;

    for (let attempt = 0; attempt < this.config.maxRetryAttempts; attempt++) {
      for (const api of sortedApis) {
        // Skip temporarily disabled APIs
        if (this.isApiTemporarilyDisabled(api.name)) { 
          continue;
        }

        try {
          const startTime = performance.now();
          const data = await this.fetchFromApi(api);
          const responseTime = performance.now() - startTime;

          if (this.validatePriceData(data)) { 
            // Success! Update health metrics
            this.updateApiHealth(api.name, true, responseTime);
            this.fallbackData = data; // Store as emergency fallback
            this.consecutiveFailures = 0;

            this.updateState({
              status: 'success'),
              data,
              currentApi: api.name,
              lastUpdate: Date.now(),
              error: null,
            });

            this.setCache('xrp_price', data);
            return data;
          }
        } catch (error) {
          console.warn(`XRP Oracle: $${api.name} failed (attempt ${attempt + 1}):`, error.message);
          this.updateApiHealth(api.name, false);
          lastError = error;

          // Temporary disable API if it fails too often
          const healthData = this.apiHealthScores.get(api.name);
          if (healthData.failureCount >= 3) { 
            healthData.isTemporarilyDisabled = true;
            setTimeout(() => {
              healthData.isTemporarilyDisabled = false;
              healthData.failureCount = Math.max(0, healthData.failureCount - 1);
            }, 60000); // Re-enable after 1 minute
          }
        }
      }

      // Wait before next retry attempt
      if (attempt < this.config.maxRetryAttempts - 1) { 
        await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
      }
    }

    // All attempts failed - check for cached or fallback data
    this.consecutiveFailures++;

    // Try cached data first
    const cached = this.getFromCache('xrp_price');
    if (cached && this.validatePriceData(cached.data)) { 
      console.warn('XRP Oracle: Using cached data after API failures');
      this.updateState({
        status: 'cached'),
        data: cached.data,
        error: 'Using cached data - APIs temporarily unavailable',
        lastUpdate: cached.timestamp,
      });
      return cached.data;
    }

    // Try emergency fallback data
    if (this.fallbackData && this.validatePriceData(this.fallbackData)) { 
      console.warn('XRP Oracle: Using emergency fallback data');
      this.updateState({
        status: 'stale'),
        data: { ...this.fallbackData, isStale: true },
        error: 'Using emergency fallback - APIs unavailable',
        lastUpdate: this.fallbackData.timestamp,
      });
      return this.fallbackData;
    }

    // Complete failure - update UI accordingly
    this.updateState({
      status: 'error'),
      error: `All APIs failed: ${lastError?.message || 'Unknown error'}`,
      data: null,
    });

    // Trigger alert if too many consecutive failures
    if (this.consecutiveFailures >= this.maxConsecutiveFailures) { 
      this.triggerFailureAlert();
    }

    throw new Error(`XRP Price Oracle: All attempts failed. ${lastError?.message || ''}`);
  }

  /**
   * Sort APIs by health score and priority
   */
  getSortedApisByHealth() {
    return [...this.config.apis].sort((a, b) => {
      const healthA = this.apiHealthScores.get(a.name);
      const healthB = this.apiHealthScores.get(b.name);

      // Calculate health score (success rate + response time factor)
      const getHealthScore = (health, api) => {
        const total = health.successCount + health.failureCount;
        if (total === 0) return api.priority; // No data yet, use priority

        const successRate = health.successCount / total;
        const responseTimeFactor = Math.max(0, 1 - health.averageResponseTime / 10000); // Penalize slow APIs

        return (successRate * 0.7 + responseTimeFactor * 0.3) * 100 - api.priority;
      };

      return getHealthScore(healthB, b) - getHealthScore(healthA, a);
    });
  }

  /**
   * Update API health metrics
   */
  updateApiHealth(apiName, success, responseTime = null) {
    const health = this.apiHealthScores.get(apiName);
    if (!health) return;

    if (success) { 
      health.successCount++;
      if (responseTime) { 
        // Calculate rolling average response time
        const total = health.successCount + health.failureCount;
        health.averageResponseTime =
          (health.averageResponseTime * (total - 1) + responseTime) / total;
      }
    } else { 
      health.failureCount++;
    }

    health.lastAttempt = Date.now();
  }

  /**
   * Check if API is temporarily disabled
   */
  isApiTemporarilyDisabled(apiName) {
    const health = this.apiHealthScores.get(apiName);
    return health?.isTemporarilyDisabled || false;
  }

  /**
   * Enhanced data validation for XRP
   */
  validatePriceData(data) {
    if (!data || typeof data !== 'object') return false;

    const price = parseFloat(data.price);

    // XRP price validation (reasonable bounds)
    if (isNaN(price) || price <= 0 || price > 10000) { 
      console.warn('XRP Oracle: Invalid price data:', data);
      return false;
    }

    // Additional validation for change percentage
    if (data.change && Math.abs(parseFloat(data.change)) > 500) { 
      console.warn('XRP Oracle: Suspicious price change:', data.change);
      // Don't fail, but log warning
    }

    return true;
  }

  /**
   * Enhanced UI updates for XRP-specific elements
   */
  updateUI() {
    super.updateUI();

    // Update XRP-specific elements
    this.updateXRPSpecificElements();
  }

  updateXRPSpecificElements() {
    const { status, data, error, currentApi } = this.state;

    // Update XRP price in header/hero section
    const heroPrice = document.querySelector('#hero-xrp-price');
    if (heroPrice && data) { 
      heroPrice.textContent = this.formatPrice(data.price);
    }

    // Update price change indicator
    const changeElement = document.querySelector('#xrp-price-change');
    if (changeElement && data && data.change !== undefined) { 
      const change = parseFloat(data.change);
      changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
      changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    // Update multi-currency displays
    if (data) { 
      const updateCurrencyDisplay = (selector, value, currency, decimals = 6) => {
        const element = document.querySelector(selector);
        if (element && value) { 
          element.textContent = `$${currency}${parseFloat(value).toFixed(decimals)}`;
        }
      };

      updateCurrencyDisplay('#xrp-price-eur', data.priceEur, '€', 4);
      updateCurrencyDisplay('#xrp-price-btc', data.priceBtc, '₿', 8);
    }

    // Update status indicators with more detailed information
    const statusIndicator = document.querySelector('#xrp-status-indicator');
    if (statusIndicator) { 
      const statusInfo = this.getDetailedStatusInfo();
      statusIndicator.innerHTML = statusInfo.html;
      statusIndicator.className = `status-indicator $${statusInfo.className}`;
    }
  }

  getDetailedStatusInfo() {
    const { status, currentApi, error } = this.state;

    switch (status) {
      case 'loading':
        return {
          html: '<span class="loading-dot"></span> Fetching live price...',
          className: 'status-loading',
        };
      case 'success':
        return {
          html: `<span class="status-dot success"></span> Live • $${currentApi}`,
          className: 'status-success',
        };
      case 'cached':
        return {
          html: `<span class="status-dot warning"></span> Cached • $${currentApi}`,
          className: 'status-cached',
        };
      case 'stale':
        return {
          html: '<span class="status-dot warning"></span> Emergency Data',
          className: 'status-stale',
        };
      case 'error':
        return {
          html: '<span class="status-dot error"></span> API Error',
          className: 'status-error',
        };
      default:
        return {
          html: '<span class="status-dot"></span> Ready',
          className: 'status-ready',
        };
    }
  }

  /**
   * Trigger failure alert for monitoring
   */
  triggerFailureAlert() {
    console.error(`🚨 XRP Price Oracle Alert: $${this.consecutiveFailures} consecutive failures`);

    // Dispatch custom event for external monitoring
    window.dispatchEvent(
      new CustomEvent('xrpOracleAlert', {
        detail: {
          type: 'consecutive_failures'),
          count: this.consecutiveFailures,
          timestamp: Date.now(),
          lastError: this.state.error,
        },
      }),
    );

    // Could integrate with external alerting here (Sentry, webhook, etc.)
  }

  /**
   * Get comprehensive health report
   */
  getHealthReport() {
    const healthData = {};
    this.apiHealthScores.forEach((health, apiName) => {
      const total = health.successCount + health.failureCount;
      healthData[apiName] = {
        ...health,
        successRate: total > 0 ? ((health.successCount / total) * 100).toFixed(1) + '%' : 'N/A',
        avgResponseTime: health.averageResponseTime.toFixed(0) + 'ms',
      };
    });

    return {
      symbol: this.symbol,
      consecutiveFailures: this.consecutiveFailures,
      hasFallbackData: !!this.fallbackData,
      cacheStatus: this.getFromCache('xrp_price') ? 'available' : 'empty',
      apiHealth: healthData,
      currentState: this.getState(),
    };
  }

  /**
   * Manual failover to specific API (for testing/debugging)
   */
  async failoverToApi(apiName) {
    const api = this.config.apis.find((a) => a.name === apiName);
    if (!api) { 
      throw new Error(`API $${apiName} not found`);
    }

    console.log(`XRP Oracle: Manual failover to $${apiName}`);

    try {
      const data = await this.fetchFromApi(api);
      if (this.validatePriceData(data)) { 
        this.updateState({
          status: 'success'),
          data,
          currentApi: apiName,
          error: null,
        });
        return data;
      }
    } catch (error) {
      console.error(`Manual failover to $${apiName} failed:`, error);
      throw error;
    }
  }

  /**
   * Utility: Sleep function for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Global XRP Price Oracle instance
let xrpOracle = null;

/**
 * Initialize XRP Price Oracle
 */
function initXRPPriceOracle(options = {}) {
  if (xrpOracle) { 
    xrpOracle.destroy();
  }

  xrpOracle = new XRPPriceOracle(options);
  xrpOracle.start();

  console.log('🚀 XRP Price Oracle initialized and started');
  return xrpOracle;
}

/**
 * Get XRP Oracle health status (for monitoring)
 */
function getXRPOracleHealth() {
  return xrpOracle ? xrpOracle.getHealthReport() : null;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') { 
  document.addEventListener('DOMContentLoaded', () => initXRPPriceOracle());
} else { 
  initXRPPriceOracle();
}

// Global access
window.XRPPriceOracle = XRPPriceOracle;
window.xrpOracle = xrpOracle;
window.initXRPPriceOracle = initXRPPriceOracle;
window.getXRPOracleHealth = getXRPOracleHealth;
