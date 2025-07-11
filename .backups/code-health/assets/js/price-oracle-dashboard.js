/**
 * XRP Price Oracle Dashboard
 * Real-time monitoring and management interface for the Price Oracle system
 * Accessible via Ctrl+Shift+P (Price Oracle Dashboard)
 */

class PriceOracleDashboard {
  constructor() {
    this.isVisible = false;
    this.refreshInterval = null;
    this.dashboardElement = null;

    // Keyboard shortcut: Ctrl+Shift+P
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Listen for Oracle events
    window.addEventListener('xrpOracleAlert', (e) => {
      this.handleOracleAlert(e.detail);
    });
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (this.isVisible) return;

    this.createDashboard();
    this.isVisible = true;

    // Start real-time updates
    this.refreshInterval = setInterval(() => {
      this.updateDashboard();
    }, 2000);

    this.updateDashboard();
    console.log('📊 Price Oracle Dashboard opened');
  }

  hide() {
    if (!this.isVisible) return;

    if (this.dashboardElement) {
      this.dashboardElement.remove();
      this.dashboardElement = null;
    }

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    this.isVisible = false;
    console.log('📊 Price Oracle Dashboard closed');
  }

  createDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'price-oracle-dashboard';
    dashboard.innerHTML = `
            <div class="dashboard-overlay">
                <div class="dashboard-content">
                    <div class="dashboard-header">
                        <h2>🔮 XRP Price Oracle Dashboard</h2>
                        <button class="dashboard-close" onclick="priceOracleDashboard.hide()">×</button>
                    </div>
                    
                    <div class="dashboard-body">
                        <div class="dashboard-section">
                            <h3>📈 Current Status</h3>
                            <div id="oracle-current-status" class="status-grid">
                                <div class="status-loading">Loading...</div>
                            </div>
                        </div>
                        
                        <div class="dashboard-section">
                            <h3>🏥 API Health Metrics</h3>
                            <div id="oracle-health-metrics" class="health-grid">
                                <div class="status-loading">Loading...</div>
                            </div>
                        </div>
                        
                        <div class="dashboard-section">
                            <h3>📊 Real-time Data</h3>
                            <div id="oracle-realtime-data" class="data-grid">
                                <div class="status-loading">Loading...</div>
                            </div>
                        </div>
                        
                        <div class="dashboard-section">
                            <h3>🛠️ Quick Actions</h3>
                            <div class="actions-grid">
                                <button onclick="priceOracleDashboard.forceRefresh()" class="action-btn primary">
                                    🔄 Force Refresh
                                </button>
                                <button onclick="priceOracleDashboard.clearCache()" class="action-btn secondary">
                                    🗑️ Clear Cache
                                </button>
                                <button onclick="priceOracleDashboard.testAllAPIs()" class="action-btn secondary">
                                    🧪 Test All APIs
                                </button>
                                <button onclick="priceOracleDashboard.exportLogs()" class="action-btn secondary">
                                    📋 Export Logs
                                </button>
                            </div>
                        </div>
                        
                        <div class="dashboard-section">
                            <h3>📋 Recent Activity</h3>
                            <div id="oracle-activity-log" class="activity-log">
                                <div class="status-loading">Loading...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Add CSS styles
    dashboard.innerHTML += `
            <style>
                #price-oracle-dashboard {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .dashboard-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }
                
                .dashboard-content {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 1000px;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                }
                
                .dashboard-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .dashboard-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 600;
                }
                
                .dashboard-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .dashboard-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
                .dashboard-body {
                    padding: 20px;
                    max-height: calc(90vh - 80px);
                    overflow-y: auto;
                }
                
                .dashboard-section {
                    margin-bottom: 30px;
                }
                
                .dashboard-section h3 {
                    margin: 0 0 15px 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #374151;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 5px;
                }
                
                .status-grid, .health-grid, .data-grid {
                    display: grid;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .status-grid {
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                }
                
                .health-grid {
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                }
                
                .data-grid {
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                }
                
                .status-card, .health-card, .data-card {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 15px;
                    transition: all 0.2s;
                }
                
                .status-card:hover, .health-card:hover, .data-card:hover {
                    border-color: #d1d5db;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .card-title {
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                }
                
                .card-value {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                
                .card-subtitle {
                    font-size: 0.8rem;
                    color: #6b7280;
                }
                
                .status-success { color: #10b981; }
                .status-warning { color: #f59e0b; }
                .status-error { color: #ef4444; }
                .status-loading { color: #3b82f6; }
                
                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                }
                
                .action-btn {
                    padding: 10px 15px;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }
                
                .action-btn.primary {
                    background: #3b82f6;
                    color: white;
                }
                
                .action-btn.primary:hover {
                    background: #2563eb;
                }
                
                .action-btn.secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }
                
                .action-btn.secondary:hover {
                    background: #e5e7eb;
                }
                
                .activity-log {
                    background: #1f2937;
                    color: #e5e7eb;
                    border-radius: 6px;
                    padding: 15px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.85rem;
                    max-height: 200px;
                    overflow-y: auto;
                    line-height: 1.4;
                }
                
                .log-entry {
                    margin-bottom: 5px;
                    padding: 2px 0;
                }
                
                .log-timestamp {
                    color: #9ca3af;
                    margin-right: 8px;
                }
                
                .log-level-info { color: #60a5fa; }
                .log-level-warn { color: #fbbf24; }
                .log-level-error { color: #f87171; }
                .log-level-success { color: #34d399; }
                
                @media (prefers-color-scheme: dark) {
                    .dashboard-content {
                        background: #1f2937;
                        color: #e5e7eb;
                    }
                    
                    .dashboard-section h3 {
                        color: #f3f4f6;
                        border-bottom-color: #374151;
                    }
                    
                    .status-card, .health-card, .data-card {
                        background: #374151;
                        border-color: #4b5563;
                    }
                    
                    .card-title {
                        color: #f3f4f6;
                    }
                    
                    .card-subtitle {
                        color: #9ca3af;
                    }
                    
                    .action-btn.secondary {
                        background: #374151;
                        color: #e5e7eb;
                        border-color: #4b5563;
                    }
                    
                    .action-btn.secondary:hover {
                        background: #4b5563;
                    }
                }
            </style>
        `;

    document.body.appendChild(dashboard);
    this.dashboardElement = dashboard;
  }

  updateDashboard() {
    if (!this.isVisible || !window.xrpOracle) return;

    try {
      const healthReport = window.getXRPOracleHealth();
      if (!healthReport) return;

      this.updateCurrentStatus(healthReport);
      this.updateHealthMetrics(healthReport);
      this.updateRealtimeData(healthReport);
      this.updateActivityLog();
    } catch (error) {
      console.error('Dashboard update error:', error);
    }
  }

  updateCurrentStatus(report) {
    const container = document.getElementById('oracle-current-status');
    if (!container) return;

    const { currentState, consecutiveFailures, hasFallbackData, cacheStatus } = report;

    container.innerHTML = `
            <div class="status-card">
                <div class="card-title">Oracle Status</div>
                <div class="card-value status-${currentState.status}">${currentState.status.toUpperCase()}</div>
                <div class="card-subtitle">${currentState.currentApi || 'No API'}</div>
            </div>
            <div class="status-card">
                <div class="card-title">Price Data</div>
                <div class="card-value">${currentState.data ? '$' + currentState.data.price.toFixed(6) : 'N/A'}</div>
                <div class="card-subtitle">${currentState.data ? currentState.data.symbol : 'No data'}</div>
            </div>
            <div class="status-card">
                <div class="card-title">Failures</div>
                <div class="card-value ${consecutiveFailures > 0 ? 'status-warning' : 'status-success'}">${consecutiveFailures}</div>
                <div class="card-subtitle">Consecutive</div>
            </div>
            <div class="status-card">
                <div class="card-title">Fallback</div>
                <div class="card-value ${hasFallbackData ? 'status-success' : 'status-warning'}">${hasFallbackData ? 'Ready' : 'None'}</div>
                <div class="card-subtitle">Emergency data</div>
            </div>
        `;
  }

  updateHealthMetrics(report) {
    const container = document.getElementById('oracle-health-metrics');
    if (!container) return;

    let html = '';
    Object.entries(report.apiHealth).forEach(([apiName, health]) => {
      const total = health.successCount + health.failureCount;
      const successRate = total > 0 ? ((health.successCount / total) * 100).toFixed(1) : '0';
      const statusClass = health.isTemporarilyDisabled
        ? 'status-error'
        : parseFloat(successRate) > 80
          ? 'status-success'
          : parseFloat(successRate) > 50
            ? 'status-warning'
            : 'status-error';

      html += `
                <div class="health-card">
                    <div class="card-title">${apiName} API</div>
                    <div class="card-value ${statusClass}">${successRate}%</div>
                    <div class="card-subtitle">
                        ${health.avgResponseTime} avg • 
                        ${health.successCount}/${total} success
                        ${health.isTemporarilyDisabled ? ' • DISABLED' : ''}
                    </div>
                </div>
            `;
    });

    container.innerHTML = html;
  }

  updateRealtimeData(report) {
    const container = document.getElementById('oracle-realtime-data');
    if (!container) return;

    const { currentState } = report;
    const data = currentState.data;

    container.innerHTML = `
            <div class="data-card">
                <div class="card-title">USD Price</div>
                <div class="card-value">${data ? '$' + data.price.toFixed(6) : 'N/A'}</div>
                <div class="card-subtitle">Current</div>
            </div>
            <div class="data-card">
                <div class="card-title">24h Change</div>
                <div class="card-value ${data && data.change >= 0 ? 'status-success' : 'status-error'}">
                    ${data ? (data.change >= 0 ? '+' : '') + data.change.toFixed(2) + '%' : 'N/A'}
                </div>
                <div class="card-subtitle">Percentage</div>
            </div>
            <div class="data-card">
                <div class="card-title">EUR Price</div>
                <div class="card-value">${data && data.priceEur ? '€' + data.priceEur.toFixed(4) : 'N/A'}</div>
                <div class="card-subtitle">European</div>
            </div>
            <div class="data-card">
                <div class="card-title">BTC Price</div>
                <div class="card-value">${data && data.priceBtc ? '₿' + data.priceBtc.toFixed(8) : 'N/A'}</div>
                <div class="card-subtitle">Bitcoin</div>
            </div>
            <div class="data-card">
                <div class="card-title">Last Update</div>
                <div class="card-value">${currentState.lastUpdate ? new Date(currentState.lastUpdate).toLocaleTimeString() : 'Never'}</div>
                <div class="card-subtitle">Timestamp</div>
            </div>
            <div class="data-card">
                <div class="card-title">Cache Status</div>
                <div class="card-value ${report.cacheStatus === 'available' ? 'status-success' : 'status-warning'}">${report.cacheStatus}</div>
                <div class="card-subtitle">Data cache</div>
            </div>
        `;
  }

  updateActivityLog() {
    const container = document.getElementById('oracle-activity-log');
    if (!container) return;

    // Get recent console logs related to Price Oracle
    const logs = this.getRecentLogs();

    container.innerHTML = logs
      .map(
        (log) => `
            <div class="log-entry">
                <span class="log-timestamp">${log.timestamp}</span>
                <span class="log-level-${log.level}">[${log.level.toUpperCase()}]</span>
                ${log.message}
            </div>
        `,
      )
      .join('');

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  getRecentLogs() {
    // In a real implementation, you would capture and store logs
    // For now, we'll return some sample logs
    const now = new Date();
    return [
      {
        timestamp: new Date(now.getTime() - 5000).toLocaleTimeString(),
        level: 'success',
        message: 'XRP price fetched successfully from CoinGecko',
      },
      {
        timestamp: new Date(now.getTime() - 35000).toLocaleTimeString(),
        level: 'info',
        message: 'Starting periodic price update cycle',
      },
      {
        timestamp: new Date(now.getTime() - 65000).toLocaleTimeString(),
        level: 'warn',
        message: 'CoinCap API response time elevated: 3.2s',
      },
      {
        timestamp: new Date(now.getTime() - 95000).toLocaleTimeString(),
        level: 'success',
        message: 'Price Oracle initialized and started',
      },
    ].reverse();
  }

  // Quick Actions
  async forceRefresh() {
    if (window.xrpOracle) {
      try {
        await window.xrpOracle.forceRefresh();
        console.log('✅ Force refresh completed');
      } catch (error) {
        console.error('❌ Force refresh failed:', error);
      }
    }
  }

  clearCache() {
    if (window.xrpOracle) {
      window.xrpOracle.cache.clear();
      console.log('🗑️ Cache cleared');
    }
  }

  async testAllAPIs() {
    if (!window.xrpOracle) return;

    console.log('🧪 Testing all APIs...');
    const apis = ['CoinGecko', 'CoinCap', 'Binance'];

    for (const api of apis) {
      try {
        await window.xrpOracle.failoverToApi(api);
        console.log(`✅ ${api} API test passed`);
      } catch (error) {
        console.error(`❌ ${api} API test failed:`, error.message);
      }
    }

    console.log('🧪 API testing completed');
  }

  exportLogs() {
    const healthReport = window.getXRPOracleHealth();
    const exportData = {
      timestamp: new Date().toISOString(),
      healthReport,
      recentLogs: this.getRecentLogs(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xrp-oracle-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📋 Logs exported');
  }

  handleOracleAlert(detail) {
    // Handle alerts from the Oracle system
    console.warn('🚨 Oracle Alert:', detail);

    // You could add visual indicators, notifications, etc.
    if (this.isVisible) {
      // Flash the dashboard or show an alert
      this.updateDashboard();
    }
  }
}

// Global Dashboard instance
const priceOracleDashboard = new PriceOracleDashboard();
window.priceOracleDashboard = priceOracleDashboard;

// Console helper
console.log('📊 Price Oracle Dashboard loaded. Press Ctrl+Shift+P to open.');
