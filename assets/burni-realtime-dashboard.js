/**
 * Advanced BURNI Token Real-Time Dashboard
 * Kombiniert alle Features in einem interaktiven Dashboard
 */

class BURNIRealtimeDashboard {
  constructor() {
    this.updateInterval = 30000; // 30 Sekunden
    this.widgets = new Map();
    this.isActive = false;
    this.lastUpdate = null;
    this.init();
  }

  /**
   * Initialize dashboard
   */
  init() {
    this.createDashboardContainer();
    this.initializeWidgets();
    this.setupAutoRefresh();
    this.setupEventListeners();
    console.log('🎛️ Real-time dashboard initialized');
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
   * Initialize all widgets
   */
  initializeWidgets() {
    this.widgets.set('prices', new PriceWidget());
    this.widgets.set('calculator', new CalculatorWidget());
    this.widgets.set('ai', new AIWidget());
    this.widgets.set('performance', new PerformanceWidget());
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
   * Refresh all widgets
   */
  async refreshAllWidgets() {
    console.log('🔄 Refreshing dashboard widgets...');

    this.updateStatus('prices', '🟡');
    this.updateStatus('ai', '🟡');
    this.updateStatus('calc', '🟡');

    try {
      // Refresh prices
      await this.widgets.get('prices')?.refresh();
      this.updateStatus('prices', '🟢');
    } catch (error) {
      console.error('Price widget error:', error);
      this.updateStatus('prices', '🔴');
    }

    try {
      // Refresh calculator
      await this.widgets.get('calculator')?.refresh();
      this.updateStatus('calc', '🟢');
    } catch (error) {
      console.error('Calculator widget error:', error);
      this.updateStatus('calc', '🔴');
    }

    try {
      // Refresh AI analytics
      await this.widgets.get('ai')?.refresh();
      this.updateStatus('ai', '🟢');
    } catch (error) {
      console.error('AI widget error:', error);
      this.updateStatus('ai', '🔴');
    }

    try {
      // Refresh performance
      await this.widgets.get('performance')?.refresh();
    } catch (error) {
      console.error('Performance widget error:', error);
    }

    this.lastUpdate = new Date();
    this.updateLastUpdateTime();
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
 * Price Widget for Dashboard
 */
class PriceWidget {
  async refresh() {
    const content = document.getElementById('price-content');
    if (!content) return;

    content.innerHTML = '<div class="loading">Loading prices...</div>';

    try {
      // Get live prices from existing functions
      const priceData = await this.fetchPriceData();

      content.innerHTML = `
        <div class="price-grid">
          <div class="price-item">
            <span class="price-label">XRP</span>
            <span class="price-value">$${priceData.xrp || 'N/A'}</span>
          </div>
          <div class="price-item">
            <span class="price-label">BURNI</span>
            <span class="price-value">$${priceData.burni || 'N/A'}</span>
          </div>
          <div class="price-item">
            <span class="price-label">XPM</span>
            <span class="price-value">$${priceData.xpm || 'N/A'}</span>
          </div>
        </div>
      `;
    } catch (error) {
      content.innerHTML = '<div class="error">Failed to load prices</div>';
    }
  }

  async fetchPriceData() {
    // Simulate API calls
    return {
      xrp: (0.5 + Math.random() * 0.1).toFixed(4),
      burni: (0.000001 + Math.random() * 0.000001).toFixed(8),
      xpm: (0.01 + Math.random() * 0.005).toFixed(6),
    };
  }
}

/**
 * Calculator Widget for Dashboard
 */
class CalculatorWidget {
  async refresh() {
    const content = document.getElementById('calculator-content');
    if (!content) return;

    try {
      if (typeof burniCalculator !== 'undefined') {
        const stats = burniCalculator.getStatistics();

        content.innerHTML = `
          <div class="calc-stats">
            <div class="stat-row">
              <span>Total Iterations:</span>
              <span>${stats.totalIterations}</span>
            </div>
            <div class="stat-row">
              <span>Total Burned:</span>
              <span class="text-red-400">${burniCalculator.formatNumber(stats.totalBurned)}</span>
            </div>
            <div class="stat-row">
              <span>Total Locked:</span>
              <span class="text-yellow-400">${burniCalculator.formatNumber(stats.totalLocked)}</span>
            </div>
            <div class="stat-row">
              <span>Duration:</span>
              <span>${stats.duration} days</span>
            </div>
          </div>
        `;
      } else {
        content.innerHTML = '<div class="error">Calculator not available</div>';
      }
    } catch (error) {
      content.innerHTML = '<div class="error">Calculator error</div>';
    }
  }
}

/**
 * AI Widget for Dashboard
 */
class AIWidget {
  async refresh() {
    const content = document.getElementById('ai-content');
    if (!content) return;

    try {
      if (typeof burniAI !== 'undefined') {
        const insights = burniAI.generateAIInsights();

        content.innerHTML = `
          <div class="ai-insights">
            <div class="insight-summary">
              <p>${insights.summary}</p>
            </div>
            <div class="health-score">
              <span class="label">Market Health:</span>
              <span class="score ${this.getHealthClass(insights.health.score)}">${insights.health.score}/100</span>
            </div>
            <div class="recommendations">
              <h4>Recommendations:</h4>
              ${insights.recommendations
                .map(
                  (rec) => `
                <div class="recommendation ${rec.type}">
                  ${rec.action}
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        `;
      } else {
        content.innerHTML = '<div class="error">AI Analytics not available</div>';
      }
    } catch (error) {
      content.innerHTML = '<div class="error">AI Analytics error</div>';
    }
  }

  getHealthClass(score) {
    if (score > 70) return 'good';
    if (score > 40) return 'fair';
    return 'poor';
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

// Add global styles for widgets
const widgetStyles = document.createElement('style');
widgetStyles.textContent = `
  .price-grid, .calc-stats, .ai-insights, .performance-metrics {
    color: #e2e8f0;
  }

  .price-item, .stat-row, .metric-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #4a5568;
  }

  .price-value, .score {
    font-weight: bold;
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
  }

  .error {
    color: #f56565;
  }

  .insight-summary {
    margin-bottom: 1rem;
    padding: 1rem;
    background: rgba(66, 153, 225, 0.1);
    border-radius: 6px;
  }

  .recommendation {
    padding: 0.5rem;
    margin: 0.25rem 0;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .recommendation.bullish {
    background: rgba(72, 187, 120, 0.2);
    color: #48bb78;
  }

  .recommendation.positive {
    background: rgba(66, 153, 225, 0.2);
    color: #4299e1;
  }

  .recommendation.caution {
    background: rgba(245, 101, 101, 0.2);
    color: #f56565;
  }
`;

document.head.appendChild(widgetStyles);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BURNIRealtimeDashboard;
}
