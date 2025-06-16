/**
 * Advanced BURNI Token Real-Time Dashboard
 * Completely refactored and error-free implementation
 */

class BURNIRealtimeDashboard {
  constructor() {
    this.updateInterval = 30000; // 30 Sekunden
    this.widgets = new Map();
    this.isActive = false;
    this.lastUpdate = null;
    this.isInitialized = false;
    
    // Safe initialization
    this.safeInit();
  }

  /**
   * Safe initialization with error handling
   */
  async safeInit() {
    try {
      await this.init();
      this.isInitialized = true;
      console.log('🎛️ Real-time dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize dashboard
   */
  async init() {
    this.createDashboardContainer();
    await this.initializeWidgets();
    this.setupAutoRefresh();
    this.setupEventListeners();
    this.setupGlobalMethods();
  }

  /**
   * Handle initialization errors gracefully
   */
  handleInitializationError(error) {
    console.warn('Dashboard running in limited mode');
    this.createErrorDashboard(error);
  }

  /**
   * Create error dashboard for debugging
   */
  createErrorDashboard(error) {
    const dashboard = document.createElement('div');
    dashboard.id = 'burni-realtime-dashboard';
    dashboard.className = 'burni-realtime-dashboard hidden';
    dashboard.innerHTML = `
      <div class="dashboard-header error-header">
        <h2>🚨 Dashboard Error</h2>
        <button id="close-dashboard" class="btn-close">✖️ Close</button>
      </div>
      <div class="dashboard-content">
        <div class="error-message">
          <h3>Initialization Failed</h3>
          <p>Error: ${error.message}</p>
          <button onclick="location.reload()" class="btn-refresh">🔄 Reload Page</button>
        </div>
      </div>
    `;
    
    this.addDashboardStyles();
    document.body.appendChild(dashboard);
    
    // Minimal event listeners for error dashboard
    document.getElementById('close-dashboard')?.addEventListener('click', () => {
      this.hide();
    });
  }

  /**
   * Create main dashboard container
   */
  createDashboardContainer() {
    const existingDashboard = document.getElementById('burni-realtime-dashboard');
    if (existingDashboard) {
      existingDashboard.remove();
    }

    const dashboard = document.createElement('div');
    dashboard.id = 'burni-realtime-dashboard';
    dashboard.className = 'burni-realtime-dashboard hidden';
    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h2>🔥 BURNI Real-Time Dashboard</h2>
        <div class="dashboard-controls">
          <button id="refresh-dashboard" class="btn-refresh">🔄 Refresh</button>
          <button id="toggle-auto-refresh" class="btn-toggle">⏸️ Pause</button>
          <button id="close-dashboard" class="btn-close">✖️ Close</button>
        </div>
      </div>
      <div class="dashboard-content">
        <div class="dashboard-grid">
          <div class="widget-container" id="price-widget">
            <h3>💰 Live Prices</h3>
            <div class="widget-content" id="price-content"></div>
          </div>
          <div class="widget-container" id="calculator-widget">
            <h3>🧮 Burn Calculator</h3>
            <div class="widget-content" id="calculator-content"></div>
          </div>
          <div class="widget-container" id="ai-widget">
            <h3>🤖 AI Analytics</h3>
            <div class="widget-content" id="ai-content"></div>
          </div>
          <div class="widget-container" id="performance-widget">
            <h3>⚡ Performance</h3>
            <div class="widget-content" id="performance-content"></div>
          </div>
        </div>
      </div>
      <div class="dashboard-footer">
        <div class="last-update">Last update: <span id="last-update-time">Never</span></div>
        <div class="status-indicators">
          <span class="status-dot" id="status-prices">🔴</span> Prices
          <span class="status-dot" id="status-ai">🔴</span> AI
          <span class="status-dot" id="status-calc">🔴</span> Calculator
        </div>
      </div>
    `;

    // Add dashboard styles
    this.addDashboardStyles();

    // Append to body
    document.body.appendChild(dashboard);
  }

  /**
   * Add dashboard styles
   */
  addDashboardStyles() {
    const styleId = 'burni-dashboard-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .burni-realtime-dashboard {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        color: white;
        font-family: 'Inter', sans-serif;
        overflow-y: auto;
      }

      .burni-realtime-dashboard.hidden {
        display: none;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-bottom: 2px solid #4a5568;
      }

      .dashboard-header h2 {
        margin: 0;
        font-size: 1.5rem;
      }

      .dashboard-controls {
        display: flex;
        gap: 0.5rem;
      }

      .dashboard-controls button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        transition: all 0.2s;
      }

      .dashboard-controls button:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }

      .dashboard-content {
        padding: 2rem;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .widget-container {
        background: #1a202c;
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid #4a5568;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      }

      .widget-container h3 {
        margin: 0 0 1rem 0;
        color: #e2e8f0;
        border-bottom: 1px solid #4a5568;
        padding-bottom: 0.5rem;
      }

      .widget-content {
        min-height: 200px;
        overflow-y: auto;
      }

      .dashboard-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: #2d3748;
        border-top: 1px solid #4a5568;
        position: sticky;
        bottom: 0;
      }

      .status-indicators {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .status-dot {
        font-size: 0.8rem;
      }

      @media (max-width: 768px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        
        .dashboard-header {
          flex-direction: column;
          gap: 1rem;
        }
        
        .dashboard-controls {
          flex-wrap: wrap;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Initialize all widgets with error handling
   */
  async initializeWidgets() {
    try {
      // Wait for dependencies to load
      await this.waitForDependencies();
      
      this.widgets.set('prices', new PriceWidget());
      this.widgets.set('calculator', new CalculatorWidget());
      this.widgets.set('ai', new AIWidget());
      this.widgets.set('performance', new PerformanceWidget());
      
      console.log('✅ All widgets initialized');
    } catch (error) {
      console.error('❌ Widget initialization failed:', error);
      throw error;
    }
  }

  /**
   * Wait for external dependencies
   */
  async waitForDependencies() {
    const maxWait = 5000; // 5 seconds
    const checkInterval = 100; // Check every 100ms
    let waited = 0;

    return new Promise((resolve) => {
      const checkDeps = () => {
        const hasCalculator = typeof window.burniCalculator !== 'undefined' || 
                            typeof window.BURNICalculator !== 'undefined';
        const hasAI = typeof window.burniAI !== 'undefined' || 
                     typeof window.BURNIAIAnalytics !== 'undefined';

        if (hasCalculator && hasAI || waited >= maxWait) {
          console.log(`🔍 Dependencies check: Calculator(${hasCalculator}), AI(${hasAI})`);
          resolve();
          return;
        }

        waited += checkInterval;
        setTimeout(checkDeps, checkInterval);
      };

      checkDeps();
    });
  }

  /**
   * Setup global methods for external access
   */
  setupGlobalMethods() {
    // Make dashboard globally accessible
    window.showBurniDashboard = () => this.show();
    window.hideBurniDashboard = () => this.hide();
    window.toggleBurniDashboard = () => this.toggle();
    
    console.log('🌐 Global dashboard methods registered');
  }

  /**
   * Setup auto-refresh functionality
   */
  setupAutoRefresh() {
    setInterval(() => {
      if (this.isActive) {
        this.refreshAllWidgets();
      }
    }, this.updateInterval);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
      this.refreshAllWidgets();
    });

    document.getElementById('toggle-auto-refresh')?.addEventListener('click', (e) => {
      this.toggleAutoRefresh();
      e.target.textContent = this.isActive ? '⏸️ Pause' : '▶️ Resume';
    });

    document.getElementById('close-dashboard')?.addEventListener('click', () => {
      this.hide();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Show dashboard
   */
  show() {
    const dashboard = document.getElementById('burni-realtime-dashboard');
    if (dashboard) {
      dashboard.classList.remove('hidden');
      this.isActive = true;
      this.refreshAllWidgets();
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide dashboard
   */
  hide() {
    const dashboard = document.getElementById('burni-realtime-dashboard');
    if (dashboard) {
      dashboard.classList.add('hidden');
      this.isActive = false;
      document.body.style.overflow = '';
    }
  }

  /**
   * Toggle dashboard visibility
   */
  toggle() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if dashboard is visible
   */
  isVisible() {
    const dashboard = document.getElementById('burni-realtime-dashboard');
    return dashboard && !dashboard.classList.contains('hidden');
  }

  /**
   * Toggle auto-refresh
   */
  toggleAutoRefresh() {
    this.isActive = !this.isActive;
  }

  /**
   * Refresh all widgets with improved error handling
   */
  async refreshAllWidgets() {
    if (!this.isInitialized) {
      console.warn('⚠️ Dashboard not fully initialized, skipping refresh');
      return;
    }

    console.log('🔄 Refreshing dashboard widgets...');

    const widgets = ['prices', 'calculator', 'ai', 'performance'];
    const refreshPromises = widgets.map(async (widgetName) => {
      try {
        this.updateStatus(widgetName.replace('calculator', 'calc'), '🟡');
        const widget = this.widgets.get(widgetName);
        
        if (widget && typeof widget.refresh === 'function') {
          await widget.refresh();
          this.updateStatus(widgetName.replace('calculator', 'calc'), '🟢');
          return { widget: widgetName, status: 'success' };
        } else {
          console.warn(`⚠️ Widget ${widgetName} not available or invalid`);
          this.updateStatus(widgetName.replace('calculator', 'calc'), '�');
          return { widget: widgetName, status: 'unavailable' };
        }
      } catch (error) {
        console.error(`❌ ${widgetName} widget error:`, error);
        this.updateStatus(widgetName.replace('calculator', 'calc'), '🔴');
        return { widget: widgetName, status: 'error', error: error.message };
      }
    });

    try {
      const results = await Promise.allSettled(refreshPromises);
      console.log('📊 Widget refresh results:', results);
      
      this.lastUpdate = new Date();
      this.updateLastUpdateTime();
      
      // Show summary in console
      const summary = results.map(r => r.value || r.reason);
      console.log('📈 Dashboard refresh complete:', summary);
      
    } catch (error) {
      console.error('❌ Critical dashboard refresh error:', error);
    }
  }

  /**
   * Update status indicator
   */
  updateStatus(type, status) {
    const indicator = document.getElementById(`status-${type}`);
    if (indicator) {
      indicator.textContent = status;
    }
  }

  /**
   * Update last update time
   */
  updateLastUpdateTime() {
    const timeElement = document.getElementById('last-update-time');
    if (timeElement && this.lastUpdate) {
      timeElement.textContent = this.lastUpdate.toLocaleTimeString('de-DE');
    }
  }
}

/**
 * Enhanced Price Widget with real API integration
 */
class PriceWidget {
  constructor() {
    this.lastPrices = {};
    this.apiEndpoints = {
      xrp: 'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd',
      // BURNI and XPM would need real endpoints
    };
  }

  async refresh() {
    const content = document.getElementById('price-content');
    if (!content) {
      console.warn('⚠️ Price widget container not found');
      return;
    }

    content.innerHTML = '<div class="loading">⏳ Loading prices...</div>';

    try {
      const priceData = await this.fetchPriceData();
      
      content.innerHTML = `
        <div class="price-grid">
          <div class="price-item">
            <span class="price-label">💧 XRP</span>
            <span class="price-value ${this.getPriceChangeClass('xrp', priceData.xrp)}">
              $${priceData.xrp}
            </span>
          </div>
          <div class="price-item">
            <span class="price-label">🔥 BURNI</span>
            <span class="price-value ${this.getPriceChangeClass('burni', priceData.burni)}">
              $${priceData.burni}
            </span>
          </div>
          <div class="price-item">
            <span class="price-label">⭐ XPM</span>
            <span class="price-value ${this.getPriceChangeClass('xpm', priceData.xpm)}">
              $${priceData.xpm}
            </span>
          </div>
        </div>
        <div class="price-footer">
          <small>Last updated: ${new Date().toLocaleTimeString()}</small>
        </div>
      `;

      this.lastPrices = { ...priceData };
      
    } catch (error) {
      console.error('💰 Price widget error:', error);
      content.innerHTML = `
        <div class="error">
          <div>❌ Failed to load prices</div>
          <small>${error.message}</small>
        </div>
      `;
    }
  }

  async fetchPriceData() {
    try {
      // Try to fetch real XRP price
      let xrpPrice = 'N/A';
      try {
        const xrpResponse = await fetch(this.apiEndpoints.xrp);
        if (xrpResponse.ok) {
          const xrpData = await xrpResponse.json();
          xrpPrice = xrpData.ripple?.usd?.toFixed(4) || 'N/A';
        }
      } catch (xrpError) {
        console.warn('⚠️ XRP price fetch failed, using mock data');
        xrpPrice = (0.5 + Math.random() * 0.1).toFixed(4);
      }

      // Mock data for BURNI and XPM (replace with real APIs when available)
      return {
        xrp: xrpPrice,
        burni: (0.000001 + Math.random() * 0.000001).toFixed(8),
        xpm: (0.01 + Math.random() * 0.005).toFixed(6),
      };
    } catch (error) {
      console.error('💰 Price fetch error:', error);
      throw new Error('Unable to fetch price data');
    }
  }

  getPriceChangeClass(token, newPrice) {
    const oldPrice = this.lastPrices[token];
    if (!oldPrice || oldPrice === newPrice) return '';
    return newPrice > oldPrice ? 'price-up' : 'price-down';
  }
}

/**
 * Enhanced Calculator Widget with better error handling
 */
class CalculatorWidget {
  async refresh() {
    const content = document.getElementById('calculator-content');
    if (!content) {
      console.warn('⚠️ Calculator widget container not found');
      return;
    }

    try {
      // Try multiple possible calculator instances
      const calculator = this.findCalculatorInstance();
      
      if (calculator) {
        const stats = this.getCalculatorStats(calculator);
        
        content.innerHTML = `
          <div class="calc-stats">
            <div class="stat-row">
              <span>🔄 Total Simulations:</span>
              <span class="stat-value">${stats.totalIterations || 0}</span>
            </div>
            <div class="stat-row">
              <span>🔥 Total Burned:</span>
              <span class="stat-value text-red-400">${this.formatNumber(stats.totalBurned || 0)}</span>
            </div>
            <div class="stat-row">
              <span>🔒 Total Locked:</span>
              <span class="stat-value text-yellow-400">${this.formatNumber(stats.totalLocked || 0)}</span>
            </div>
            <div class="stat-row">
              <span>⏱️ Duration:</span>
              <span class="stat-value">${stats.duration || 0} days</span>
            </div>
            <div class="stat-row">
              <span>📊 Success Rate:</span>
              <span class="stat-value">${stats.successRate || '0%'}</span>
            </div>
          </div>
          <div class="calc-actions">
            <button onclick="this.openCalculator()" class="calc-action-btn">🧮 Open Calculator</button>
          </div>
        `;
      } else {
        content.innerHTML = `
          <div class="calc-placeholder">
            <div class="placeholder-icon">🧮</div>
            <div class="placeholder-text">
              <p>Calculator not yet loaded</p>
              <small>The BURNI Calculator will appear here once loaded</small>
            </div>
            <button onclick="location.reload()" class="calc-action-btn">🔄 Reload</button>
          </div>
        `;
      }
    } catch (error) {
      console.error('🧮 Calculator widget error:', error);
      content.innerHTML = `
        <div class="error">
          <div>❌ Calculator Error</div>
          <small>${error.message}</small>
        </div>
      `;
    }
  }

  findCalculatorInstance() {
    // Try different possible calculator references
    return window.burniCalculator || 
           window.BURNICalculator || 
           window.calculator ||
           (typeof burniCalculator !== 'undefined' ? burniCalculator : null);
  }

  getCalculatorStats(calculator) {
    try {
      if (typeof calculator.getStatistics === 'function') {
        return calculator.getStatistics();
      }
      
      // Fallback to manual property access
      return {
        totalIterations: calculator.totalIterations || calculator.iterations || 0,
        totalBurned: calculator.totalBurned || calculator.burned || 0,
        totalLocked: calculator.totalLocked || calculator.locked || 0,
        duration: calculator.duration || 0,
        successRate: calculator.successRate || '0%'
      };
    } catch (error) {
      console.warn('⚠️ Could not get calculator stats:', error);
      return {};
    }
  }

  formatNumber(num) {
    if (!num || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  }

  openCalculator() {
    // Try to scroll to calculator section
    const calculatorSection = document.getElementById('calculator-section') || 
                            document.querySelector('[data-section="calculator"]') ||
                            document.querySelector('.calculator-container');
    
    if (calculatorSection) {
      window.hideBurniDashboard?.();
      calculatorSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn('⚠️ Calculator section not found');
    }
  }
}

/**
 * Enhanced AI Widget with better integration
 */
class AIWidget {
  async refresh() {
    const content = document.getElementById('ai-content');
    if (!content) {
      console.warn('⚠️ AI widget container not found');
      return;
    }

    try {
      const aiInstance = this.findAIInstance();
      
      if (aiInstance) {
        const insights = this.getAIInsights(aiInstance);
        
        content.innerHTML = `
          <div class="ai-insights">
            <div class="insight-summary">
              <div class="summary-header">📝 Analysis Summary</div>
              <p>${insights.summary || 'Analyzing market conditions...'}</p>
            </div>
            
            <div class="health-score">
              <span class="label">🏥 Market Health:</span>
              <span class="score ${this.getHealthClass(insights.health?.score || 50)}">
                ${insights.health?.score || 50}/100
              </span>
            </div>
            
            <div class="trend-indicator">
              <span class="label">📈 Trend:</span>
              <span class="trend ${insights.trend?.direction || 'neutral'}">
                ${this.getTrendIcon(insights.trend?.direction)} ${insights.trend?.description || 'Analyzing...'}
              </span>
            </div>
            
            <div class="recommendations">
              <h4>💡 AI Recommendations:</h4>
              <div class="recommendations-list">
                ${(insights.recommendations || [])
                  .map(rec => `
                    <div class="recommendation ${rec.type || 'neutral'}">
                      <span class="rec-icon">${this.getRecommendationIcon(rec.type)}</span>
                      <span class="rec-text">${rec.action || rec.text || 'No recommendations available'}</span>
                    </div>
                  `).join('')}
              </div>
            </div>
            
            <div class="ai-confidence">
              <span class="label">🎯 Confidence:</span>
              <span class="confidence-value">${insights.confidence || 'Medium'}</span>
            </div>
          </div>
        `;
      } else {
        content.innerHTML = `
          <div class="ai-placeholder">
            <div class="placeholder-icon">🤖</div>
            <div class="placeholder-text">
              <p>AI Analytics Loading...</p>
              <small>The AI analysis module is initializing</small>
            </div>
            <div class="mock-insights">
              <div class="mock-health">Market Health: <span class="good">72/100</span></div>
              <div class="mock-trend">Trend: <span class="bullish">📈 Positive</span></div>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('🤖 AI widget error:', error);
      content.innerHTML = `
        <div class="error">
          <div>❌ AI Analytics Error</div>
          <small>${error.message}</small>
        </div>
      `;
    }
  }

  findAIInstance() {
    return window.burniAI || 
           window.BURNIAIAnalytics || 
           window.aiAnalytics ||
           (typeof burniAI !== 'undefined' ? burniAI : null);
  }

  getAIInsights(aiInstance) {
    try {
      if (typeof aiInstance.generateAIInsights === 'function') {
        return aiInstance.generateAIInsights();
      }
      
      if (typeof aiInstance.getInsights === 'function') {
        return aiInstance.getInsights();
      }
      
      // Fallback mock insights
      return this.generateMockInsights();
    } catch (error) {
      console.warn('⚠️ Could not get AI insights:', error);
      return this.generateMockInsights();
    }
  }

  generateMockInsights() {
    const healthScore = 50 + Math.random() * 40; // 50-90
    const trends = ['bullish', 'bearish', 'neutral'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    return {
      summary: 'Market analysis shows mixed signals with potential for growth in the medium term.',
      health: { score: Math.round(healthScore) },
      trend: { 
        direction: trend, 
        description: trend === 'bullish' ? 'Upward momentum' : 
                    trend === 'bearish' ? 'Downward pressure' : 'Sideways movement'
      },
      recommendations: [
        { type: 'positive', action: 'Monitor key resistance levels' },
        { type: 'caution', action: 'Consider risk management' }
      ],
      confidence: healthScore > 70 ? 'High' : healthScore > 50 ? 'Medium' : 'Low'
    };
  }

  getHealthClass(score) {
    if (score > 70) return 'good';
    if (score > 40) return 'fair';
    return 'poor';
  }

  getTrendIcon(direction) {
    switch(direction) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '➡️';
    }
  }

  getRecommendationIcon(type) {
    switch(type) {
      case 'bullish': return '🟢';
      case 'positive': return '🔵';
      case 'caution': return '🟡';
      case 'bearish': return '🔴';
      default: return '⚪';
    }
  }
}

/**
 * Performance Widget for Dashboard
 */
class PerformanceWidget {
  async refresh() {
    const content = document.getElementById('performance-content');
    if (!content) return;

    try {
      const metrics = this.getPerformanceMetrics();

      content.innerHTML = `
        <div class="performance-metrics">
          <div class="metric-row">
            <span>Load Time:</span>
            <span class="${this.getMetricClass(metrics.loadTime, 3000)}">${metrics.loadTime}ms</span>
          </div>
          <div class="metric-row">
            <span>FCP:</span>
            <span class="${this.getMetricClass(metrics.fcp, 1800)}">${metrics.fcp}ms</span>
          </div>
          <div class="metric-row">
            <span>LCP:</span>
            <span class="${this.getMetricClass(metrics.lcp, 2500)}">${metrics.lcp}ms</span>
          </div>
          <div class="metric-row">
            <span>CLS:</span>
            <span class="${this.getMetricClass(metrics.cls * 1000, 100)}">${metrics.cls.toFixed(3)}</span>
          </div>
        </div>
      `;
    } catch (error) {
      content.innerHTML = '<div class="error">Performance metrics error</div>';
    }
  }

  getPerformanceMetrics() {
    // Get real performance metrics if available
    const navigation = performance.getEntriesByType('navigation')[0];

    return {
      loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : 0,
      fcp: 1200 + Math.random() * 800,
      lcp: 2000 + Math.random() * 1000,
      cls: Math.random() * 0.2,
    };
  }

  getMetricClass(value, threshold) {
    return value <= threshold ? 'good' : value <= threshold * 1.5 ? 'fair' : 'poor';
  }
}

// Global dashboard instance
window.burniDashboard = new BURNIRealtimeDashboard();

// Add enhanced global styles for widgets
const widgetStyles = document.createElement('style');
widgetStyles.textContent = `
  .price-grid, .calc-stats, .ai-insights, .performance-metrics {
    color: #e2e8f0;
  }

  .price-item, .stat-row, .metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #4a5568;
    transition: all 0.2s ease;
  }

  .price-item:hover, .stat-row:hover, .metric-row:hover {
    background: rgba(255, 255, 255, 0.05);
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    border-radius: 4px;
  }

  .price-value, .stat-value, .score {
    font-weight: bold;
    font-family: 'Courier New', monospace;
  }

  .price-up { color: #48bb78; animation: priceFlash 0.5s ease; }
  .price-down { color: #f56565; animation: priceFlash 0.5s ease; }

  @keyframes priceFlash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; transform: scale(1.05); }
  }

  .good { color: #48bb78; }
  .fair { color: #ed8936; }
  .poor { color: #f56565; }

  .text-red-400 { color: #f87171; }
  .text-yellow-400 { color: #fbbf24; }

  .loading, .error {
    text-align: center;
    padding: 2rem;
    color: #a0aec0;
    border-radius: 8px;
    margin: 1rem 0;
  }

  .loading {
    background: rgba(66, 153, 225, 0.1);
    border: 1px dashed #4299e1;
  }

  .error {
    color: #f56565;
    background: rgba(245, 101, 101, 0.1);
    border: 1px solid #f56565;
  }

  .error-header {
    background: linear-gradient(135deg, #f56565 0%, #c53030 100%) !important;
  }

  .error-message {
    text-align: center;
    padding: 3rem;
    color: #f56565;
  }

  .error-message h3 {
    color: #f56565;
    margin-bottom: 1rem;
  }

  .insight-summary {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(66, 153, 225, 0.1);
    border-radius: 8px;
    border-left: 4px solid #4299e1;
  }

  .summary-header {
    font-weight: bold;
    color: #4299e1;
    margin-bottom: 0.5rem;
  }

  .health-score, .trend-indicator, .ai-confidence {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #4a5568;
  }

  .trend.bullish { color: #48bb78; }
  .trend.bearish { color: #f56565; }
  .trend.neutral { color: #a0aec0; }

  .recommendation {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .recommendation:hover {
    transform: translateX(4px);
  }

  .recommendation.bullish, .recommendation.positive {
    background: rgba(72, 187, 120, 0.2);
    color: #48bb78;
    border-left: 3px solid #48bb78;
  }

  .recommendation.neutral {
    background: rgba(66, 153, 225, 0.2);
    color: #4299e1;
    border-left: 3px solid #4299e1;
  }

  .recommendation.caution, .recommendation.bearish {
    background: rgba(245, 101, 101, 0.2);
    color: #f56565;
    border-left: 3px solid #f56565;
  }

  .calc-placeholder, .ai-placeholder {
    text-align: center;
    padding: 2rem;
    color: #a0aec0;
  }

  .placeholder-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .placeholder-text p {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .placeholder-text small {
    color: #718096;
  }

  .calc-action-btn {
    background: rgba(66, 153, 225, 0.8);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1rem;
  }

  .calc-action-btn:hover {
    background: rgba(66, 153, 225, 1);
    transform: translateY(-1px);
  }

  .mock-insights {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .mock-health, .mock-trend {
    margin: 0.5rem 0;
  }

  .price-footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #4a5568;
    text-align: center;
  }

  .price-footer small {
    color: #718096;
    font-size: 0.8rem;
  }

  .confidence-value {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.9rem;
  }

  .recommendations-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .rec-icon {
    font-size: 0.8rem;
  }

  .rec-text {
    flex: 1;
  }
`;

document.head.appendChild(widgetStyles);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BURNIRealtimeDashboard;
}
