class SystemStatusDashboard {
  constructor(t = {}) {
    ((this.config = {
      refreshInterval: 5e3,
      maxHistoryEntries: 100,
      alertDisplayTime: 5e3,
      components: ['priceOracle', 'monitoring', 'security', 'seo', 'recovery'],
      theme: 'dark',
      compactMode: !1,
      showDetailed: !0,
      adminMode: !1,
      debugMode: !1,
      ...t,
    }),
      (this.state = {
        initialized: !1,
        systems: {},
        alerts: [],
        metrics: new Map(),
        history: [],
        dashboardVisible: !1,
      }),
      (this.dashboardElement = null),
      (this.intervals = new Map()),
      this.init());
  }
  async init() {
    console.log('\ud83d\udcca Initializing System Status Dashboard...');
    try {
      (await this.waitForSystems(),
        this.createDashboard(),
        this.setupKeyboardShortcuts(),
        this.startMonitoring(),
        (this.state.initialized = !0),
        console.log('\u2705 System Status Dashboard initialized'));
    } catch (t) {
      console.error('\u274c Failed to initialize dashboard:', t);
    }
  }
  async waitForSystems() {
    const t = 1e4;
    let e = 0;
    for (; e < t; ) {
      if (this.checkSystemsReady()) { 
        console.log('\u2705 All systems ready for dashboard');
        return;
      }
      (await new Promise((t) => setTimeout(t, 100)), (e += 100));
    }
    console.warn('\u26a0\ufe0f Some systems may not be ready, proceeding anyway');
  }
  checkSystemsReady() {
    return Object.values({
      priceOracle: window.burniOracle),
      monitoring: window.burniMonitoring,
      security: window.burniSecurity,
      seo: window.burniSEO,
    }).every((t) => t && t.getState);
  }
  createDashboard() {
    ((this.dashboardElement = document.createElement('div')),
      (this.dashboardElement.id = 'burni-system-dashboard'),
      (this.dashboardElement.className = `burni-dashboard $${this.config.theme}`),
      (this.dashboardElement.style.cssText = `
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: ${this.config.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
      color: ${this.config.theme === 'dark' ? '#ffffff' : '#000000'};
      border-left: 2px solid ${this.config.theme === 'dark' ? '#333' : '#ccc'};
      box-shadow: -2px 0 10px rgba(0,0,0,0.3);
      z-index: 10000;
      transition: right 0.3s ease;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    `),
      (this.dashboardElement.innerHTML = this.generateDashboardHTML()),
      document.body.appendChild(this.dashboardElement),
      this.setupDashboardEvents(),
      console.log('\ud83d\udda5\ufe0f Dashboard UI created'));
  }
  generateDashboardHTML() {
    return `
      <div class="dashboard-header" style="padding: 15px; border-bottom: 1px solid #333; position: sticky; top: 0; background: inherit;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: #ff6b35;">\ud83d\udd25 BurniToken Status</h3>
          <button id="close-dashboard" style="background: none; border: none; color: inherit; font-size: 18px; cursor: pointer;">×</button>
        </div>
        <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">Press Ctrl+Shift+D to toggle</div>
      </div>
      <div class="dashboard-content" style="padding: 15px;">
        <div id="system-status" class="section">
          <h4 style="color: #4caf50; margin: 0 0 10px 0;">⚡ System Status</h4>
          <div id="status-indicators"></div>
        </div>
        <div id="performance-metrics" class="section" style="margin-top: 20px;">
          <h4 style="color: #2196f3; margin: 0 0 10px 0;">\ud83d\udcca Performance</h4>
          <div id="metrics-display"></div>
        </div>
        <div id="security-alerts" class="section" style="margin-top: 20px;">
          <h4 style="color: #ff9800; margin: 0 0 10px 0;">\ud83d\udee1\ufe0f Security</h4>
          <div id="security-display"></div>
        </div>
        <div id="seo-analytics" class="section" style="margin-top: 20px;">
          <h4 style="color: #9c27b0; margin: 0 0 10px 0;">\ud83d\udd0d SEO Analytics</h4>
          <div id="seo-display"></div>
        </div>
        <div id="recent-alerts" class="section" style="margin-top: 20px;">
          <h4 style="color: #f44336; margin: 0 0 10px 0;">\ud83d\udea8 Recent Alerts</h4>
          <div id="alerts-display"></div>
        </div>
        <div id="quick-actions" class="section" style="margin-top: 20px;">
          <h4 style="color: #607d8b; margin: 0 0 10px 0;">⚡ Quick Actions</h4>
          <div id="actions-display"></div>
        </div>
      </div>
    `;
  }
  setupDashboardEvents() {
    (this.dashboardElement
      .querySelector('#close-dashboard')
      .addEventListener('click', () => this.hideDashboard()),
      this.setupQuickActions());
  }
  setupQuickActions() {
    const t = this.dashboardElement.querySelector('#actions-display'),
      e = [
        {
          id: 'refresh-price',
          label: '\ud83d\udcb0 Refresh Price',
          action: () => this.refreshPrice(),
        },
        {
          id: 'force-backup',
          label: '\ud83d\udcbe Force Backup',
          action: () => this.forceBackup(),
        },
        {
          id: 'security-scan',
          label: '\ud83d\udd0d Security Scan',
          action: () => this.runSecurityScan(),
        },
        { id: 'seo-audit', label: '\ud83d\udcc8 SEO Audit', action: () => this.runSEOAudit() },
        {
          id: 'clear-alerts',
          label: '\ud83d\uddd1\ufe0f Clear Alerts',
          action: () => this.clearAlerts(),
        },
        { id: 'export-logs', label: '\ud83d\udce4 Export Logs', action: () => this.exportLogs() },
      ];
    ((t.innerHTML = e
      .map(
        (t) => `
      <button id="$${t.id}" class="action-btn" style="
        display: block;
        width: 100%;
        margin: 5px 0;
        padding: 8px;
        background: #333;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        transition: background 0.2s;
      " onmouseover="this.style.background='#555'" onmouseout="this.style.background='#333'">
        ${t.label}
      </button>
    `,
      )
      .join('')),
      e.forEach((e) => {
        this.dashboardElement.querySelector(`#$${e.id}`).addEventListener('click', e.action);
      }));
  }
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (t) => {
      (t.ctrlKey && t.shiftKey && 'D' === t.key && (t.preventDefault(), this.toggleDashboard()),
        'Escape' === t.key && this.state.dashboardVisible && this.hideDashboard());
    });
  }
  startMonitoring() {
    const t = setInterval(() => {
      this.updateDashboard();
    }, this.config.refreshInterval);
    this.intervals.set('monitoring', t);
    const e = setInterval(() => {
      this.cleanupHistory();
    }, 6e4);
    (this.intervals.set('cleanup', e), console.log('\ud83d\udd04 Dashboard monitoring started'));
  }
  updateDashboard() {
    if (!this.state.dashboardVisible) return;
    try {
      const t = this.collectSystemData();
      (this.updateSystemStatus(t),
        this.updatePerformanceMetrics(t),
        this.updateSecurityDisplay(t),
        this.updateSEODisplay(t),
        this.updateAlertsDisplay(t),
        this.addToHistory(t));
    } catch (t) {
      console.error('Dashboard update error:', t);
    }
  }
  collectSystemData() {
    const t = { timestamp: Date.now(), systems: {} };
    try {
      t.systems.priceOracle = { status: 'active', data: window.burniOracle.getState() };
    } catch (e) {
      t.systems.priceOracle = { status: 'error', error: e.message };
    }
    try {
      t.systems.monitoring = { status: 'active', data: window.burniMonitoring.getState() };
    } catch (e) {
      t.systems.monitoring = { status: 'error', error: e.message };
    }
    try {
      t.systems.security = { status: 'active', data: window.burniSecurity.getSecurityStatus() };
    } catch (e) {
      t.systems.security = { status: 'error', error: e.message };
    }
    try {
      t.systems.seo = { status: 'active', data: window.burniSEO.getSEOReport() };
    } catch (e) {
      t.systems.seo = { status: 'error', error: e.message };
    }
    return t;
  }
  updateSystemStatus(t) {
    const e = this.dashboardElement.querySelector('#status-indicators');
    e.innerHTML = Object.entries(t.systems)
      .map(([t, e]) => {
        const o = 'active' === e.status ? '#4caf50' : 'error' === e.status ? '#f44336' : '#ff9800',
          n = 'active' === e.status ? '\u2705' : 'error' === e.status ? '\u274c' : '\u26a0\ufe0f';
        return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.05); border-radius: 3px;">
          <span>$${n} ${t}</span>
          <span style="color: ${o}; font-weight: bold;">${e.status.toUpperCase()}</span>
        </div>
      `;
      })
      .join('');
  }
  updatePerformanceMetrics(t) {
    const e = this.dashboardElement.querySelector('#metrics-display'),
      o = [];
    t.systems.priceOracle?.data?.price &&
      o.push({
        label: 'BTC Price'),
        value: `$${t.systems.priceOracle.data.price.toLocaleString()}`,
        color: '#4caf50',
      });
    const n = window.performance?.timing
      ? window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
      : 0;
    (n > 0 &&
      o.push({
        label: 'Load Time'),
        value: `${Math.round(n)}ms`,
        color: n < 3e3 ? '#4caf50' : '#ff9800',
      }),
      (e.innerHTML =
        o.length > 0
          ? o
              .map(
                (t) => `
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>$${t.label}</span>
          <span style="color: ${t.color}; font-weight: bold;">${t.value}</span>
        </div>
      `,
              )
              .join('')
          : '<div style="opacity: 0.7;">No metrics available</div>'));
  }
  updateSecurityDisplay(t) {
    const e = this.dashboardElement.querySelector('#security-display');
    if (t.systems.security?.data) { 
      const o = t.systems.security.data;
      e.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>\ud83e\udd16 Detected Bots</span>
          <span style="color: ${o.threats?.detectedThreats > 0 ? '#ff9800' : '#4caf50'}"> ${o.threats?.detectedThreats || 0} </span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>\ud83d\udeab Blocked IPs</span>
          <span style="color: ${o.threats?.blockedIPs > 0 ? '#ff9800' : '#4caf50'}"> ${o.threats?.blockedIPs || 0} </span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>\ud83d\udea8 Recent Incidents</span>
          <span style="color: ${o.threats?.recentIncidents?.length > 0 ? '#f44336' : '#4caf50'}"> ${o.threats?.recentIncidents?.length || 0} </span>
        </div>
      `;
    } else e.innerHTML = '<div style="opacity: 0.7;">Security data unavailable</div>';
  }
  updateSEODisplay(t) {
    const e = this.dashboardElement.querySelector('#seo-display');
    if (t.systems.seo?.data) { 
      const o = t.systems.seo.data;
      e.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>\ud83d\udcca SEO Score</span>
          <span style="color: ${o.score?.score >= 80 ? '#4caf50' : o.score?.score >= 60 ? '#ff9800' : '#f44336'}"> ${o.score?.score || 0}/100 </span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>\ud83d\udc40 Page Views</span>
          <span style="color: #2196f3;"> ${o.performance?.pageViews || 0} </span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>\u26a0\ufe0f Issues</span>
          <span style="color: ${o.optimizations?.length > 0 ? '#ff9800' : '#4caf50'}"> ${o.optimizations?.length || 0} </span>
        </div>
      `;
    } else e.innerHTML = '<div style="opacity: 0.7;">SEO data unavailable</div>';
  }
  updateAlertsDisplay(t) {
    const e = this.dashboardElement.querySelector('#alerts-display');
    let o = [];
    (Object.values(t.systems).forEach((t) => {
      t.data?.alerts && (o = o.concat(t.data.alerts));
    }),
      o.sort((t, e) => (e.timestamp || 0) - (t.timestamp || 0)));
    const n = o.slice(0, 5);
    if (0 === n.length)
      return void (e.innerHTML = '<div style="opacity: 0.7;">No recent alerts</div>');
    const i = n
      .map((t) => {
        const e =
            { critical: '#f44336', high: '#ff9800', medium: '#ff9800', low: '#4caf50' }[
              t.severity
            ] || '#607d8b',
          o = this.formatTimeAgo(t.timestamp);
        return `
        <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.03); border-radius: 3px; border-left: 3px solid $${e};">
          <div style="font-weight: bold; color: ${e};"> ${t.type || 'Unknown'} </div>
          <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;"> ${t.message || 'No message'} </div>
          <div style="font-size: 9px; opacity: 0.6; margin-top: 2px;"> ${o} </div>
        </div>
      `;
      })
      .join('');
    e.innerHTML = i;
  }
  formatTimeAgo(t) {
    if (!t) return 'Unknown time';
    const e = Date.now() - t;
    return e < 6e4
      ? `${Math.floor(e / 1e3)}s ago`
      : e < 36e5
        ? `${Math.floor(e / 6e4)}m ago`
        : e < 864e5
          ? `${Math.floor(e / 36e5)}h ago`
          : `${Math.floor(e / 864e5)}d ago`;
  }
  addToHistory(t) {
    (this.state.history.push(t),
      this.state.history.length > this.config.maxHistoryEntries && this.state.history.shift());
  }
  cleanupHistory() {
    const t = Date.now() - 36e5;
    this.state.history = this.state.history.filter((e) => e.timestamp > t);
  }
  refreshPrice() {
    window.burniOracle &&
      (window.burniOracle.forceRefresh(),
      this.showNotification('\ud83d\udcb0 Price refresh triggered', 'success'));
  }
  forceBackup() {
    this.showNotification('\ud83d\udcbe Backup triggered (simulated)', 'info');
  }
  runSecurityScan() {
    window.burniSecurity && this.showNotification('\ud83d\udd0d Security scan running...', 'info');
  }
  runSEOAudit() {
    window.burniSEO &&
      (window.burniSEO.optimizeCurrentPage(),
      this.showNotification('\ud83d\udcc8 SEO audit completed', 'success'));
  }
  clearAlerts() {
    ((this.state.alerts = []),
      this.showNotification('\ud83d\uddd1\ufe0f Alerts cleared', 'success'));
  }
  exportLogs() {
    const t = {
        timestamp: new Date().toISOString(),
        history: this.state.history,
        alerts: this.state.alerts,
        systems: this.state.systems,
      },
      e = new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' }),
      o = URL.createObjectURL(e),
      n = document.createElement('a');
    ((n.href = o),
      (n.download = `burnitoken-logs-${Date.now()}.json`),
      n.click(),
      URL.revokeObjectURL(o),
      this.showNotification('\ud83d\udce4 Logs exported', 'success'));
  }
  showNotification(t, e = 'info') {
    const o = document.createElement('div');
    ((o.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${e === 'success' ? '#4caf50' : e === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      border-radius: 5px;
      z-index: 10001;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
    `),
      (o.textContent = t),
      document.body.appendChild(o),
      setTimeout(() => {
        o.remove();
      }, this.config.alertDisplayTime));
  }
  toggleDashboard() {
    this.state.dashboardVisible ? this.hideDashboard() : this.showDashboard();
  }
  showDashboard() {
    ((this.dashboardElement.style.right = '0'),
      (this.state.dashboardVisible = !0),
      this.updateDashboard(),
      (document.body.style.marginRight = '400px'));
  }
  hideDashboard() {
    ((this.dashboardElement.style.right = '-400px'),
      (this.state.dashboardVisible = !1),
      (document.body.style.marginRight = '0'));
  }
  getSystemStatus() {
    return {
      initialized: this.state.initialized,
      visible: this.state.dashboardVisible,
      systems: Object.keys(this.state.systems).length,
      alerts: this.state.alerts.length,
      historyEntries: this.state.history.length,
    };
  }
  destroy() {
    for (const [t, e] of this.intervals.entries()) clearInterval(e);
    (this.intervals.clear(),
      this.dashboardElement && this.dashboardElement.remove(),
      (document.body.style.marginRight = '0'),
      console.log('\ud83d\udca5 System Status Dashboard destroyed'));
  }
}
((window.SystemStatusDashboard = SystemStatusDashboard),
  'undefined' != typeof window &&
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.burniDashboard = new SystemStatusDashboard();
      }, 2e3);
    }));
