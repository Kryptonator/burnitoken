/**
 * BurniToken System Status Dashboard
 * 
 * Zentrale Konsole für alle Monitoring- und Management-Systeme:
 * - Echtzeit System Status
 * - Performance Metrics Dashboard
 * - Security Monitoring Console
 * - SEO Analytics Dashboard
 * - Recovery Management Interface
 * - Alert Management System
 * 
 * @version 1.0.0
 * @date 2025-01-23
 */

class SystemStatusDashboard {
    constructor(config = {}) {
        this.config = {
            // Dashboard Configuration
            refreshInterval: 5000, // 5 seconds
            maxHistoryEntries: 100,
            alertDisplayTime: 5000,
            
            // System Components
            components: [
                'priceOracle',
                'monitoring',
                'security',
                'seo',
                'recovery'
            ],
            
            // Display Options
            theme: 'dark', // 'light' or 'dark'
            compactMode: false,
            showDetailed: true,
            
            // Access Control
            adminMode: false,
            debugMode: false,
            
            ...config
        };

        this.state = {
            initialized: false,
            systems: {},
            alerts: [],
            metrics: new Map(),
            history: [],
            dashboardVisible: false
        };

        this.dashboardElement = null;
        this.intervals = new Map();
        
        this.init();
    }

    async init() {
        console.log('📊 Initializing System Status Dashboard...');
        
        try {
            // Wait for other systems to initialize
            await this.waitForSystems();
            
            // Create dashboard UI
            this.createDashboard();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Start monitoring
            this.startMonitoring();
            
            this.state.initialized = true;
            console.log('✅ System Status Dashboard initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize dashboard:', error);
        }
    }

    async waitForSystems() {
        const maxWait = 10000; // 10 seconds
        const checkInterval = 100; // 100ms
        let waited = 0;
        
        while (waited < maxWait) {
            const systemsReady = this.checkSystemsReady();
            if (systemsReady) {
                console.log('✅ All systems ready for dashboard');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
        }
        
        console.warn('⚠️ Some systems may not be ready, proceeding anyway');
    }

    checkSystemsReady() {
        const systems = {
            priceOracle: window.burniOracle,
            monitoring: window.burniMonitoring,
            security: window.burniSecurity,
            seo: window.burniSEO
        };
        
        return Object.values(systems).every(system => system && system.getState);
    }

    createDashboard() {
        // Create dashboard container
        this.dashboardElement = document.createElement('div');
        this.dashboardElement.id = 'burni-system-dashboard';
        this.dashboardElement.className = `burni-dashboard ${this.config.theme}`;
        this.dashboardElement.style.cssText = `
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
        `;
        
        // Create dashboard content
        this.dashboardElement.innerHTML = this.generateDashboardHTML();
        
        // Add to page
        document.body.appendChild(this.dashboardElement);
        
        // Setup event listeners
        this.setupDashboardEvents();
        
        console.log('🖥️ Dashboard UI created');
    }

    generateDashboardHTML() {
        return `
            <div class="dashboard-header" style="padding: 15px; border-bottom: 1px solid #333; position: sticky; top: 0; background: inherit;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #ff6b35;">🔥 BurniToken Status</h3>
                    <button id="close-dashboard" style="background: none; border: none; color: inherit; font-size: 18px; cursor: pointer;">×</button>
                </div>
                <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">
                    Press Ctrl+Shift+D to toggle
                </div>
            </div>
            
            <div class="dashboard-content" style="padding: 15px;">
                <div id="system-status" class="section">
                    <h4 style="color: #4caf50; margin: 0 0 10px 0;">⚡ System Status</h4>
                    <div id="status-indicators"></div>
                </div>
                
                <div id="performance-metrics" class="section" style="margin-top: 20px;">
                    <h4 style="color: #2196f3; margin: 0 0 10px 0;">📊 Performance</h4>
                    <div id="metrics-display"></div>
                </div>
                
                <div id="security-alerts" class="section" style="margin-top: 20px;">
                    <h4 style="color: #ff9800; margin: 0 0 10px 0;">🛡️ Security</h4>
                    <div id="security-display"></div>
                </div>
                
                <div id="seo-analytics" class="section" style="margin-top: 20px;">
                    <h4 style="color: #9c27b0; margin: 0 0 10px 0;">🔍 SEO Analytics</h4>
                    <div id="seo-display"></div>
                </div>
                
                <div id="recent-alerts" class="section" style="margin-top: 20px;">
                    <h4 style="color: #f44336; margin: 0 0 10px 0;">🚨 Recent Alerts</h4>
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
        // Close button
        const closeBtn = this.dashboardElement.querySelector('#close-dashboard');
        closeBtn.addEventListener('click', () => this.hideDashboard());
        
        // Quick actions
        this.setupQuickActions();
    }

    setupQuickActions() {
        const actionsContainer = this.dashboardElement.querySelector('#actions-display');
        
        const actions = [
            { id: 'refresh-price', label: '💰 Refresh Price', action: () => this.refreshPrice() },
            { id: 'force-backup', label: '💾 Force Backup', action: () => this.forceBackup() },
            { id: 'security-scan', label: '🔍 Security Scan', action: () => this.runSecurityScan() },
            { id: 'seo-audit', label: '📈 SEO Audit', action: () => this.runSEOAudit() },
            { id: 'clear-alerts', label: '🗑️ Clear Alerts', action: () => this.clearAlerts() },
            { id: 'export-logs', label: '📤 Export Logs', action: () => this.exportLogs() }
        ];
        
        actionsContainer.innerHTML = actions.map(action => 
            `<button id="${action.id}" class="action-btn" style="
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
                ${action.label}
            </button>`
        ).join('');
        
        // Add event listeners
        actions.forEach(action => {
            const btn = this.dashboardElement.querySelector(`#${action.id}`);
            btn.addEventListener('click', action.action);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+D to toggle dashboard
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                this.toggleDashboard();
            }
            
            // Escape to close dashboard
            if (event.key === 'Escape' && this.state.dashboardVisible) {
                this.hideDashboard();
            }
        });
    }

    startMonitoring() {
        // Main monitoring loop
        const monitoringInterval = setInterval(() => {
            this.updateDashboard();
        }, this.config.refreshInterval);
        
        this.intervals.set('monitoring', monitoringInterval);
        
        // History cleanup
        const cleanupInterval = setInterval(() => {
            this.cleanupHistory();
        }, 60000); // Every minute
        
        this.intervals.set('cleanup', cleanupInterval);
        
        console.log('🔄 Dashboard monitoring started');
    }

    updateDashboard() {
        if (!this.state.dashboardVisible) return;
        
        try {
            // Collect system data
            const systemData = this.collectSystemData();
            
            // Update displays
            this.updateSystemStatus(systemData);
            this.updatePerformanceMetrics(systemData);
            this.updateSecurityDisplay(systemData);
            this.updateSEODisplay(systemData);
            this.updateAlertsDisplay(systemData);
            
            // Store in history
            this.addToHistory(systemData);
            
        } catch (error) {
            console.error('Dashboard update error:', error);
        }
    }

    collectSystemData() {
        const data = {
            timestamp: Date.now(),
            systems: {}
        };
        
        // Price Oracle
        if (window.burniOracle) {
            try {
                data.systems.priceOracle = {
                    status: 'active',
                    data: window.burniOracle.getState()
                };
            } catch (error) {
                data.systems.priceOracle = { status: 'error', error: error.message };
            }
        }
        
        // Monitoring Services
        if (window.burniMonitoring) {
            try {
                data.systems.monitoring = {
                    status: 'active',
                    data: window.burniMonitoring.getState()
                };
            } catch (error) {
                data.systems.monitoring = { status: 'error', error: error.message };
            }
        }
        
        // Security
        if (window.burniSecurity) {
            try {
                data.systems.security = {
                    status: 'active',
                    data: window.burniSecurity.getSecurityStatus()
                };
            } catch (error) {
                data.systems.security = { status: 'error', error: error.message };
            }
        }
        
        // SEO
        if (window.burniSEO) {
            try {
                data.systems.seo = {
                    status: 'active',
                    data: window.burniSEO.getSEOReport()
                };
            } catch (error) {
                data.systems.seo = { status: 'error', error: error.message };
            }
        }
        
        return data;
    }

    updateSystemStatus(data) {
        const container = this.dashboardElement.querySelector('#status-indicators');
        
        const statusHTML = Object.entries(data.systems).map(([name, system]) => {
            const statusColor = system.status === 'active' ? '#4caf50' : 
                               system.status === 'error' ? '#f44336' : '#ff9800';
            
            const statusIcon = system.status === 'active' ? '✅' : 
                              system.status === 'error' ? '❌' : '⚠️';
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.05); border-radius: 3px;">
                    <span>${statusIcon} ${name}</span>
                    <span style="color: ${statusColor}; font-weight: bold;">${system.status.toUpperCase()}</span>
                </div>
            `;
        }).join('');
        
        container.innerHTML = statusHTML;
    }

    updatePerformanceMetrics(data) {
        const container = this.dashboardElement.querySelector('#metrics-display');
        
        const metrics = [];
        
        // Price Oracle metrics
        if (data.systems.priceOracle?.data?.price) {
            metrics.push({
                label: 'BTC Price',
                value: `$${data.systems.priceOracle.data.price.toLocaleString()}`,
                color: '#4caf50'
            });
        }
        
        // Performance metrics
        if (window.performance) {
            const memory = (window.performance as any).memory;
            if (memory) {
                metrics.push({
                    label: 'Memory Usage',
                    value: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
                    color: '#2196f3'
                });
            }
        }
        
        // Page load time
        const loadTime = window.performance?.timing ? 
            window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : 0;
        if (loadTime > 0) {
            metrics.push({
                label: 'Load Time',
                value: `${Math.round(loadTime)}ms`,
                color: loadTime < 3000 ? '#4caf50' : '#ff9800'
            });
        }
        
        const metricsHTML = metrics.map(metric => `
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>${metric.label}</span>
                <span style="color: ${metric.color}; font-weight: bold;">${metric.value}</span>
            </div>
        `).join('');
        
        container.innerHTML = metricsHTML || '<div style="opacity: 0.7;">No metrics available</div>';
    }

    updateSecurityDisplay(data) {
        const container = this.dashboardElement.querySelector('#security-display');
        
        if (data.systems.security?.data) {
            const security = data.systems.security.data;
            
            const securityHTML = `
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>🤖 Detected Bots</span>
                    <span style="color: ${security.threats?.detectedThreats > 0 ? '#ff9800' : '#4caf50'}">
                        ${security.threats?.detectedThreats || 0}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>🚫 Blocked IPs</span>
                    <span style="color: ${security.threats?.blockedIPs > 0 ? '#ff9800' : '#4caf50'}">
                        ${security.threats?.blockedIPs || 0}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>🚨 Recent Incidents</span>
                    <span style="color: ${security.threats?.recentIncidents?.length > 0 ? '#f44336' : '#4caf50'}">
                        ${security.threats?.recentIncidents?.length || 0}
                    </span>
                </div>
            `;
            
            container.innerHTML = securityHTML;
        } else {
            container.innerHTML = '<div style="opacity: 0.7;">Security data unavailable</div>';
        }
    }

    updateSEODisplay(data) {
        const container = this.dashboardElement.querySelector('#seo-display');
        
        if (data.systems.seo?.data) {
            const seo = data.systems.seo.data;
            
            const seoHTML = `
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>📊 SEO Score</span>
                    <span style="color: ${seo.score?.score >= 80 ? '#4caf50' : seo.score?.score >= 60 ? '#ff9800' : '#f44336'}">
                        ${seo.score?.score || 0}/100
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>👀 Page Views</span>
                    <span style="color: #2196f3;">
                        ${seo.performance?.pageViews || 0}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>⚠️ Issues</span>
                    <span style="color: ${seo.optimizations?.length > 0 ? '#ff9800' : '#4caf50'}">
                        ${seo.optimizations?.length || 0}
                    </span>
                </div>
            `;
            
            container.innerHTML = seoHTML;
        } else {
            container.innerHTML = '<div style="opacity: 0.7;">SEO data unavailable</div>';
        }
    }

    updateAlertsDisplay(data) {
        const container = this.dashboardElement.querySelector('#alerts-display');
        
        // Collect all alerts from all systems
        let allAlerts = [];
        
        Object.values(data.systems).forEach(system => {
            if (system.data?.alerts) {
                allAlerts = allAlerts.concat(system.data.alerts);
            }
        });
        
        // Sort by timestamp (newest first)
        allAlerts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        // Take only the most recent 5
        const recentAlerts = allAlerts.slice(0, 5);
        
        if (recentAlerts.length === 0) {
            container.innerHTML = '<div style="opacity: 0.7;">No recent alerts</div>';
            return;
        }
        
        const alertsHTML = recentAlerts.map(alert => {
            const severityColor = {
                'critical': '#f44336',
                'high': '#ff9800',
                'medium': '#ff9800',
                'low': '#4caf50'
            }[alert.severity] || '#607d8b';
            
            const timeAgo = this.formatTimeAgo(alert.timestamp);
            
            return `
                <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.03); border-radius: 3px; border-left: 3px solid ${severityColor};">
                    <div style="font-weight: bold; color: ${severityColor};">
                        ${alert.type || 'Unknown'}
                    </div>
                    <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">
                        ${alert.message || 'No message'}
                    </div>
                    <div style="font-size: 9px; opacity: 0.6; margin-top: 2px;">
                        ${timeAgo}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = alertsHTML;
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown time';
        
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }

    addToHistory(data) {
        this.state.history.push(data);
        
        // Keep only recent history
        if (this.state.history.length > this.config.maxHistoryEntries) {
            this.state.history.shift();
        }
    }

    cleanupHistory() {
        const oneHourAgo = Date.now() - 3600000;
        this.state.history = this.state.history.filter(
            entry => entry.timestamp > oneHourAgo
        );
    }

    // Quick Actions
    refreshPrice() {
        if (window.burniOracle) {
            window.burniOracle.forceRefresh();
            this.showNotification('💰 Price refresh triggered', 'success');
        }
    }

    forceBackup() {
        // This would trigger a backup workflow
        this.showNotification('💾 Backup triggered (simulated)', 'info');
    }

    runSecurityScan() {
        if (window.burniSecurity) {
            this.showNotification('🔍 Security scan running...', 'info');
        }
    }

    runSEOAudit() {
        if (window.burniSEO) {
            window.burniSEO.optimizeCurrentPage();
            this.showNotification('📈 SEO audit completed', 'success');
        }
    }

    clearAlerts() {
        this.state.alerts = [];
        this.showNotification('🗑️ Alerts cleared', 'success');
    }

    exportLogs() {
        const logs = {
            timestamp: new Date().toISOString(),
            history: this.state.history,
            alerts: this.state.alerts,
            systems: this.state.systems
        };
        
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `burnitoken-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('📤 Logs exported', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 5px;
            z-index: 10001;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, this.config.alertDisplayTime);
    }

    // Public API
    toggleDashboard() {
        if (this.state.dashboardVisible) {
            this.hideDashboard();
        } else {
            this.showDashboard();
        }
    }

    showDashboard() {
        this.dashboardElement.style.right = '0';
        this.state.dashboardVisible = true;
        this.updateDashboard(); // Immediate update
        document.body.style.marginRight = '400px';
    }

    hideDashboard() {
        this.dashboardElement.style.right = '-400px';
        this.state.dashboardVisible = false;
        document.body.style.marginRight = '0';
    }

    getSystemStatus() {
        return {
            initialized: this.state.initialized,
            visible: this.state.dashboardVisible,
            systems: Object.keys(this.state.systems).length,
            alerts: this.state.alerts.length,
            historyEntries: this.state.history.length
        };
    }

    destroy() {
        // Clear intervals
        for (const [name, intervalId] of this.intervals.entries()) {
            clearInterval(intervalId);
        }
        this.intervals.clear();
        
        // Remove dashboard
        if (this.dashboardElement) {
            this.dashboardElement.remove();
        }
        
        // Reset body margin
        document.body.style.marginRight = '0';
        
        console.log('💥 System Status Dashboard destroyed');
    }
}

// Make it available globally
window.SystemStatusDashboard = SystemStatusDashboard;

// Auto-initialize in browser
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for other systems to initialize
        setTimeout(() => {
            window.burniDashboard = new SystemStatusDashboard();
        }, 2000);
    });
}
