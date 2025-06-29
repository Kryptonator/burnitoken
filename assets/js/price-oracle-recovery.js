/**
 * Price Oracle Recovery & Backup System
 * Automatic backup, recovery, and disaster management for the Price Oracle
 */

class PriceOracleRecovery {
  constructor() {
    this.backupInterval = 5 * 60 * 1000; // 5 minutes
    this.backupKey = 'xrp_oracle_backup';
    this.maxBackupAge = 24 * 60 * 60 * 1000; // 24 hours
    this.recoveryAttempts = 0;
    this.maxRecoveryAttempts = 3;

    this.startBackupSystem();
    this.setupEventListeners();

    console.log('🛡️ Price Oracle Recovery System initialized');
  }

  /**
   * Start automatic backup system
   */
  startBackupSystem() {
    // Initial backup
    this.createBackup();

    // Periodic backups
    setInterval(() => {
      this.createBackup();
    }, this.backupInterval);

    // Cleanup old backups periodically
    setInterval(
      () => {
        this.cleanupOldBackups();
      },
      60 * 60 * 1000,
    ); // Every hour
  }

  /**
   * Setup event listeners for recovery triggers
   */
  setupEventListeners() {
    // Listen for Oracle alerts
    window.addEventListener('xrpOracleAlert', (e) => {
      this.handleOracleAlert(e.detail);
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkOracleHealth();
      }
    });

    // Listen for network changes
    window.addEventListener('online', () => {
      console.log('🌐 Network restored - checking Oracle health');
      this.checkOracleHealth();
    });

    window.addEventListener('offline', () => {
      console.log('🌐 Network lost - activating emergency mode');
      this.activateEmergencyMode();
    });
  }

  /**
   * Create backup of current Oracle state
   */
  createBackup() {
    try {
      if (!window.xrpOracle) return;

      const backupData = {
        timestamp: Date.now(),
        version: '1.0.0',
        state: window.xrpOracle.getState(),
        healthReport: window.getXRPOracleHealth(),
        cacheSnapshot: this.getCacheSnapshot(),
        configuration: {
          refreshInterval: window.xrpOracle.config?.refreshInterval,
          cacheExpiry: window.xrpOracle.config?.cacheExpiry,
          maxRetryAttempts: window.xrpOracle.config?.maxRetryAttempts,
        },
      };

      // Store in localStorage
      const backups = this.getBackups();
      backups.push(backupData);

      // Keep only recent backups (last 24 hours)
      const cutoffTime = Date.now() - this.maxBackupAge;
      const filteredBackups = backups.filter((backup) => backup.timestamp > cutoffTime);

      localStorage.setItem(this.backupKey, JSON.stringify(filteredBackups.slice(-50))); // Max 50 backups

      console.log('💾 Oracle backup created');
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
    }
  }

  /**
   * Get cache snapshot for backup
   */
  getCacheSnapshot() {
    if (!window.xrpOracle || !window.xrpOracle.cache) return {};

    const snapshot = {};
    window.xrpOracle.cache.forEach((value, key) => {
      snapshot[key] = value;
    });

    return snapshot;
  }

  /**
   * Get all backups from localStorage
   */
  getBackups() {
    try {
      const backupsJson = localStorage.getItem(this.backupKey);
      return backupsJson ? JSON.parse(backupsJson) : [];
    } catch (error) {
      console.error('❌ Failed to load backups:', error);
      return [];
    }
  }

  /**
   * Find the most recent valid backup
   */
  getLatestValidBackup() {
    const backups = this.getBackups();

    // Sort by timestamp (newest first)
    const sortedBackups = backups.sort((a, b) => b.timestamp - a.timestamp);

    // Find first valid backup
    for (const backup of sortedBackups) {
      if (this.validateBackup(backup)) {
        return backup;
      }
    }

    return null;
  }

  /**
   * Validate backup data integrity
   */
  validateBackup(backup) {
    if (!backup || typeof backup !== 'object') return false;
    if (!backup.timestamp || !backup.state) return false;
    if (!backup.healthReport || !backup.cacheSnapshot) return false;

    // Check if backup is not too old
    const age = Date.now() - backup.timestamp;
    if (age > this.maxBackupAge) return false;

    // Check if backup has valid price data
    if (backup.state.data && backup.state.data.price) {
      const price = parseFloat(backup.state.data.price);
      if (isNaN(price) || price <= 0 || price > 10000) return false;
    }

    return true;
  }

  /**
   * Restore Oracle from backup
   */
  async restoreFromBackup(backup = null) {
    try {
      const backupData = backup || this.getLatestValidBackup();

      if (!backupData) {
        throw new Error('No valid backup found');
      }

      console.log('🔄 Restoring Oracle from backup...');

      // Reinitialize Oracle if needed
      if (!window.xrpOracle) {
        window.initXRPPriceOracle();
        await this.sleep(2000); // Wait for initialization
      }

      // Restore cache data
      if (backupData.cacheSnapshot && window.xrpOracle.cache) {
        window.xrpOracle.cache.clear();
        Object.entries(backupData.cacheSnapshot).forEach(([key, value]) => {
          window.xrpOracle.cache.set(key, value);
        });
      }

      // Restore state
      if (backupData.state && backupData.state.data) {
        window.xrpOracle.updateState({
          status: 'success',
          data: backupData.state.data,
          currentApi: backupData.state.currentApi || 'Backup',
          lastUpdate: backupData.timestamp,
          error: null,
        });
      }

      // Force UI update
      if (window.xrpOracle.updateUI) {
        window.xrpOracle.updateUI();
      }

      console.log('✅ Oracle restored from backup successfully');

      // Trigger immediate refresh to get fresh data
      setTimeout(() => {
        if (window.xrpOracle && window.xrpOracle.fetchPrice) {
          window.xrpOracle.fetchPrice().catch(console.error);
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('❌ Oracle restoration failed:', error);
      return false;
    }
  }

  /**
   * Handle Oracle alerts and trigger recovery if needed
   */
  async handleOracleAlert(alertDetail) {
    console.log('🚨 Recovery system handling alert:', alertDetail);

    if (alertDetail.type === 'consecutive_failures' && alertDetail.count >= 3) {
      console.log('🔄 Triggering automatic recovery...');

      this.recoveryAttempts++;

      if (this.recoveryAttempts <= this.maxRecoveryAttempts) {
        const restored = await this.restoreFromBackup();

        if (restored) {
          console.log('✅ Automatic recovery successful');
          this.recoveryAttempts = 0; // Reset counter on success
        } else {
          console.error('❌ Automatic recovery failed');

          if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
            this.activateEmergencyMode();
          }
        }
      } else {
        console.error('🚨 Max recovery attempts reached - activating emergency mode');
        this.activateEmergencyMode();
      }
    }
  }

  /**
   * Check Oracle health and trigger recovery if needed
   */
  async checkOracleHealth() {
    try {
      if (!window.xrpOracle) {
        console.log('🔄 Oracle not found - attempting to restore...');
        await this.restoreFromBackup();
        return;
      }

      const health = window.getXRPOracleHealth();

      if (!health || !health.healthy) {
        console.log('🔄 Oracle unhealthy - attempting recovery...');

        // Try to restart the oracle first
        if (window.xrpOracle.stop && window.xrpOracle.start) {
          window.xrpOracle.stop();
          await this.sleep(2000);
          window.xrpOracle.start();

          // Wait and check again
          await this.sleep(5000);
          const newHealth = window.getXRPOracleHealth();

          if (!newHealth || !newHealth.healthy) {
            // Restart didn't work, try backup restoration
            await this.restoreFromBackup();
          }
        }
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Activate emergency mode with static fallback data
   */
  activateEmergencyMode() {
    console.warn('🚨 EMERGENCY MODE ACTIVATED - Using static fallback data');

    // Get the most recent backup for emergency data
    const backup = this.getLatestValidBackup();

    if (backup && backup.state && backup.state.data) {
      // Create a static display with emergency data
      this.displayEmergencyData(backup.state.data, backup.timestamp);
    } else {
      // Absolute fallback - show error state
      this.displayEmergencyError();
    }

    // Notify user about emergency mode
    this.showEmergencyNotification();

    // Try to recover every 5 minutes in emergency mode
    setInterval(
      () => {
        console.log('🔄 Emergency mode - attempting recovery...');
        this.checkOracleHealth();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Display emergency data in UI
   */
  displayEmergencyData(data, timestamp) {
    const widgets = document.querySelectorAll('[id*="xrp-price"], [id*="price-widget"]');

    widgets.forEach((widget) => {
      const priceElement = widget.querySelector('.price-value, .price');
      const statusElement = widget.querySelector('.price-status, .status');

      if (priceElement) {
        priceElement.innerHTML = `$${data.price.toFixed(6)}`;
        priceElement.style.opacity = '0.7';
      }

      if (statusElement) {
        statusElement.innerHTML = '🚨 Emergency Mode';
        statusElement.className = 'price-status status-emergency';
        statusElement.title = `Last update: ${new Date(timestamp).toLocaleString()}`;
      }

      // Add emergency styling
      widget.style.border = '2px solid #f59e0b';
      widget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
    });
  }

  /**
   * Display emergency error state
   */
  displayEmergencyError() {
    const widgets = document.querySelectorAll('[id*="xrp-price"], [id*="price-widget"]');

    widgets.forEach((widget) => {
      widget.innerHTML = `
                <div class="emergency-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-text">Price Service Unavailable</div>
                    <div class="error-subtitle">Emergency maintenance mode</div>
                </div>
            `;
      widget.style.border = '2px solid #ef4444';
      widget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    });
  }

  /**
   * Show emergency notification to user
   */
  showEmergencyNotification() {
    // Create a non-intrusive notification
    const notification = document.createElement('div');
    notification.id = 'emergency-notification';
    notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f59e0b;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 9999;
                font-weight: 500;
                max-width: 300px;
            ">
                🚨 Price Service Recovery Mode
                <div style="font-size: 0.9em; margin-top: 5px; opacity: 0.9;">
                    Displaying emergency data while reconnecting...
                </div>
            </div>
        `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 10000);
  }

  /**
   * Cleanup old backups
   */
  cleanupOldBackups() {
    try {
      const backups = this.getBackups();
      const cutoffTime = Date.now() - this.maxBackupAge;

      const validBackups = backups.filter(
        (backup) => backup.timestamp > cutoffTime && this.validateBackup(backup),
      );

      if (validBackups.length < backups.length) {
        localStorage.setItem(this.backupKey, JSON.stringify(validBackups));
        console.log(`🧹 Cleaned up ${backups.length - validBackups.length} old backups`);
      }
    } catch (error) {
      console.error('❌ Backup cleanup failed:', error);
    }
  }

  /**
   * Export backup data for external storage
   */
  exportBackups() {
    const backups = this.getBackups();
    const exportData = {
      exportDate: new Date().toISOString(),
      backupCount: backups.length,
      backups: backups,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xrp-oracle-backups-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('💾 Backups exported');
  }

  /**
   * Import backup data from external file
   */
  importBackups(backupData) {
    try {
      if (!backupData || !backupData.backups || !Array.isArray(backupData.backups)) {
        throw new Error('Invalid backup data format');
      }

      const validBackups = backupData.backups.filter((backup) => this.validateBackup(backup));

      if (validBackups.length === 0) {
        throw new Error('No valid backups found in import data');
      }

      // Merge with existing backups
      const existingBackups = this.getBackups();
      const allBackups = [...existingBackups, ...validBackups];

      // Remove duplicates and sort
      const uniqueBackups = allBackups
        .filter(
          (backup, index, arr) => arr.findIndex((b) => b.timestamp === backup.timestamp) === index,
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50); // Keep only 50 most recent

      localStorage.setItem(this.backupKey, JSON.stringify(uniqueBackups));

      console.log(`✅ Imported ${validBackups.length} valid backups`);
      return true;
    } catch (error) {
      console.error('❌ Backup import failed:', error);
      return false;
    }
  }

  /**
   * Get recovery system status
   */
  getStatus() {
    const backups = this.getBackups();
    const latestBackup = this.getLatestValidBackup();

    return {
      isActive: true,
      backupCount: backups.length,
      latestBackupAge: latestBackup ? Date.now() - latestBackup.timestamp : null,
      recoveryAttempts: this.recoveryAttempts,
      maxRecoveryAttempts: this.maxRecoveryAttempts,
      emergencyModeActive: document.getElementById('emergency-notification') !== null,
    };
  }

  /**
   * Manual recovery function
   */
  async manualRecovery() {
    console.log('🔄 Manual recovery initiated...');
    this.recoveryAttempts = 0; // Reset counter for manual recovery
    return await this.restoreFromBackup();
  }

  /**
   * Utility: Sleep function
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Initialize Recovery System
const priceOracleRecovery = new PriceOracleRecovery();

// Global access
window.priceOracleRecovery = priceOracleRecovery;

// Console helpers
console.log('🛡️ Price Oracle Recovery System loaded');
console.log('Available commands:');
console.log('- priceOracleRecovery.manualRecovery() - Trigger manual recovery');
console.log('- priceOracleRecovery.getStatus() - Get recovery system status');
console.log('- priceOracleRecovery.exportBackups() - Export backup data');
console.log('- priceOracleRecovery.createBackup() - Create immediate backup');
