#!/usr/bin/env node

/**
 * BurniToken Health Check Monitor
 *
 * Kontinuierliche Überwachung aller kritischen Services und APIs
 * Automatische Recovery-Aktionen bei Ausfällen
 *
 * Autor: Technischer Visionär
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const { sendAlert } = require('./alert-service');
const { createGitHubIssue } = require('./github-issue-creator');

class HealthCheckMonitor {
  constructor() {
    this.config = {
      checkInterval: 30000, // 30 Sekunden
      alertThreshold: 3, // 3 Fehlschläge in Folge lösen Alert aus
      services: [
        {
          name: 'BurniToken Price API',
          type: 'http',
          url: 'https://api.burnitoken.com/v1/price',
          timeout: 5000,
          expectedStatus: 200,
          healthyResponse: (data) => data && typeof data.price === 'number',
        },
        {
          name: 'XRPL Data API',
          type: 'http',
          url: 'https://data.xrpl.org/v1/network/tokens/burnitoken',
          timeout: 8000,
          expectedStatus: 200,
          healthyResponse: (data) => data && data.token,
        },
        {
          name: 'CoinGecko Fallback',
          type: 'http',
          url: 'https://api.coingecko.com/api/v3/ping',
          timeout: 5000,
          expectedStatus: 200,
          healthyResponse: (data) => data && data.gecko_says === '(V3) To the Moon!',
        },
        {
          name: 'GitHub Repository',
          type: 'http',
          url: 'https://api.github.com/repos/burnitoken/burnitoken.com',
          timeout: 5000,
          expectedStatus: 200,
          healthyResponse: (data) => data && data.name,
        },
        {
          name: 'Website Availability',
          type: 'http',
          url: 'https://burnitoken.website',
          timeout: 10000,
          expectedStatus: 200,
          healthyResponse: (html) => html && html.includes('BurniToken'),
        },
        {
          name: 'Local Build Process',
          type: 'command',
          command: 'npm --version',
          healthyResponse: (output) => output && /^\d+\.\d+\.\d+/.test(output.trim()),
        },
        {
          name: 'Git Repository Status',
          type: 'command',
          command: 'git status --porcelain',
          healthyResponse: () => true, // Git status immer OK, nur Check ob verfügbar
        },
      ],
      webhooks: {
        success: process.env.HEALTH_SUCCESS_WEBHOOK,
        alert: process.env.HEALTH_ALERT_WEBHOOK,
        recovery: process.env.HEALTH_RECOVERY_WEBHOOK,
      },
    };

    this.state = {
      running: false,
      checks: new Map(),
      alerts: new Map(),
      lastFullCheck: null,
      consecutiveFailures: new Map(),
    };

    this.logFile = path.join(__dirname, 'health-monitor.log');
    this.statusFile = path.join(__dirname, 'health-status.json');
  }

  /**
   * Startet den Health Check Monitor
   */
  start() {
    if (this.state.running) { 
      this.log('❌ Health Monitor läuft bereits');
      return;
    }

    this.state.running = true;
    this.log('🚀 Health Check Monitor gestartet');

    // Initial Check
    this.runFullHealthCheck();

    // Periodische Checks
    this.checkInterval = setInterval(() => {
      this.runFullHealthCheck();
    }, this.config.checkInterval);

    // Graceful Shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  /**
   * Stoppt den Health Check Monitor
   */
  stop() {
    if (!this.state.running) return;

    this.state.running = false;

    if (this.checkInterval) { 
      clearInterval(this.checkInterval);
    }

    this.log('🛑 Health Check Monitor gestoppt');
    this.saveStatus();
  }

  /**
   * Führt einen kompletten Health Check durch
   */
  async runFullHealthCheck() {
    this.log('🔍 Starte vollständigen Health Check...');
    const startTime = Date.now();
    const results = [];

    for (const service of this.config.services) {
      try {
        const result = await this.checkService(service);
        results.push(result);
        this.updateServiceState(service.name, result);
      } catch (error) {
        const failResult = {
          service: service.name,
          healthy: false,
          error: error.message,
          timestamp: Date.now(),
          responseTime: 0,
        };
        results.push(failResult);
        this.updateServiceState(service.name, failResult);
      }
    }

    const duration = Date.now() - startTime;
    const healthyCount = results.filter((r) => r.healthy).length;
    const totalCount = results.length;

    this.state.lastFullCheck = {
      timestamp: Date.now(),
      duration,
      healthyCount,
      totalCount,
      healthScore: Math.round((healthyCount / totalCount) * 100),
      results,
    };

    this.log(
      `✅ Health Check abgeschlossen: $${healthyCount}/${totalCount} Services gesund (${this.state.lastFullCheck.healthScore}%) in ${duration}ms`,
    );

    // Alerts prüfen
    this.processAlerts(results);

    // Status speichern
    this.saveStatus();

    // Webhook benachrichtigen
    if (this.state.lastFullCheck.healthScore >= 80) { 
      this.sendWebhook('success', this.state.lastFullCheck);
    } else if (this.state.lastFullCheck.healthScore < 50) { 
      this.sendWebhook('alert', this.state.lastFullCheck);
    }
  }

  /**
   * Prüft einen einzelnen Service
   */
  async checkService(service) {
    const startTime = Date.now();

    try {
      let result;

      if (service.type === 'http') { 
        result = await this.checkHTTPService(service);
      } else if (service.type === 'command') { 
        result = await this.checkCommandService(service);
      } else { 
        throw new Error(`Unbekannter Service-Typ: $${service.type}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        service: service.name,
        healthy: true,
        responseTime,
        timestamp: Date.now(),
        details: result,
      };
    } catch (error) {
      return {
        service: service.name,
        healthy: false,
        error: error.message,
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * HTTP Service Check
   */
  async checkHTTPService(service) {
    return new Promise((resolve, reject) => {
      const url = new URL(service.url);
      const isHttps = url.protocol === 'https:';
      const lib = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        timeout: service.timeout,
        headers: {
          'User-Agent': 'BurniToken-HealthMonitor/1.0',
          Accept: 'application/json, text/html',
        },
      };

      const req = lib.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            // Status Code prüfen
            if (res.statusCode !== service.expectedStatus) { 
              return reject(new Error(`HTTP $${res.statusCode}: Unerwarteter Status Code`));
            }

            // Response prüfen
            let parsedData;
            try {
              parsedData = JSON.parse(data);
            } catch {
              parsedData = data; // Falls keine JSON, rohe Daten verwenden
            }

            if (service.healthyResponse && !service.healthyResponse(parsedData)) { 
              return reject(new Error('Unhealthy response data'));
            }

            resolve({
              statusCode: res.statusCode),
              contentLength: data.length,
              contentType: res.headers['content-type'],
              responseValid: true,
            });
          } catch (error) {
            reject(new Error(`Response validation failed: $${error.message}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout nach $${service.timeout}ms`));
      });

      req.on('error', (error) => {
        reject(new Error(`Network error: $${error.message}`));
      });

      req.end();
    });
  }

  /**
   * Command Service Check
   */
  async checkCommandService(service) {
    return new Promise((resolve, reject) => {
      try {
        const output = execSync(service.command, {
          encoding: 'utf8'),
          timeout: 5000,
          stdio: 'pipe',
        });

        if (service.healthyResponse && !service.healthyResponse(output)) { 
          return reject(new Error('Command output indicates unhealthy state'));
        }

        resolve({
          output: output.trim(),
          exitCode: 0,
        });
      } catch (error) {
        reject(new Error(`Command failed: $${error.message}`));
      }
    });
  }

  /**
   * Service State Management
   */
  updateServiceState(serviceName, result) {
    const currentFailures = this.state.consecutiveFailures.get(serviceName) || 0;

    if (result.healthy) { 
      // Service ist gesund - Reset der Fehleranzahl
      if (currentFailures > 0) { 
        this.log(`✅ $${serviceName} ist wieder gesund (war ${currentFailures}x ausgefallen)`);
        this.sendWebhook('recovery', { service: serviceName, failures: currentFailures });
      }
      this.state.consecutiveFailures.set(serviceName, 0);
    } else { 
      // Service ist ungesund - Fehleranzahl erhöhen
      const newFailures = currentFailures + 1;
      this.state.consecutiveFailures.set(serviceName, newFailures);

      if (newFailures >= this.config.alertThreshold) { 
        this.triggerAlert(serviceName, result, newFailures);
      }
    }

    this.state.checks.set(serviceName, result);
  }

  /**
   * Alert Processing
   */
  processAlerts(results) {
    const failedServices = results.filter((r) => !r.healthy);

    if (failedServices.length > 0) { 
      this.log(`⚠️ $${failedServices.length} Services sind ungesund:`);
      failedServices.forEach((service) => {
        this.log(`   - $${service.service}: ${service.error}`);
      });
    }
  }

  triggerAlert(serviceName, result, failureCount) {
    this.log(`🚨 ALERT: $${serviceName} ist ${failureCount}x in Folge ausgefallen!`);

    const alert = {
      service: serviceName,
      error: result.error,
      failureCount,
      timestamp: Date.now(),
      severity: failureCount >= 5 ? 'critical' : 'warning',
    };

    this.state.alerts.set(serviceName, alert);
    this.sendWebhook('alert', alert);
    sendAlert(`Health Check Failure: $${serviceName}`, alert, alert.severity);

    // Auto-Recovery versuchen
    this.attemptAutoRecovery(serviceName, alert);
  }

  /**
   * Auto-Recovery Mechanismen
   */
  async attemptAutoRecovery(serviceName, alert) {
    this.log(`🔧 Versuche Auto-Recovery für $${serviceName}...`);
    todoManager.createTodo(`Attempt auto-recovery for $${serviceName}`, 'Operations', serviceName);

    try {
      switch (serviceName) {
        case 'Local Build Process':
          this.log('📦 Führe npm install durch...');
          execSync('npm install', { encoding: 'utf8', timeout: 30000 });
          break;

        case 'Git Repository Status':
          this.log('📥 Führe git fetch durch...');
          execSync('git fetch origin', { encoding: 'utf8', timeout: 10000 });
          break;

        default:
          this.log(`⚠️ Kein Auto-Recovery für $${serviceName} verfügbar`);
      }

      this.log(`✅ Auto-Recovery für $${serviceName} abgeschlossen`);
    } catch (error) {
      this.log(`❌ Auto-Recovery für $${serviceName} fehlgeschlagen: ${error.message}`);
      alertService.createAlert(
        `Auto-Recovery Failed: $${serviceName}`),
        { error: error.message },
        'critical',
      );
      todoManager.createTodo(
        `Manual intervention required for $${serviceName} recovery`),
        'Operations',
        serviceName,
      );
    }
  }

  /**
   * Webhook Notifications
   */
  async sendWebhook(type, data) {
    const webhookUrl = this.config.webhooks[type];
    if (!webhookUrl) return;

    try {
      const payload = {
        type,
        timestamp: Date.now(),
        project: 'BurniToken',
        data,
      };

      // Hier würde der Webhook-Call implementiert werden
      // Für Demo-Zwecke nur Logging
      this.log(`📡 Webhook ($${type}): ${JSON.stringify(payload, null, 2)}`);
    } catch (error) {
      this.log(`❌ Webhook-Fehler ($${type}): ${error.message}`);
    }
  }

  /**
   * Status Management
   */
  saveStatus() {
    const status = {
      running: this.state.running,
      lastCheck: this.state.lastFullCheck,
      services: Object.fromEntries(this.state.checks),
      alerts: Object.fromEntries(this.state.alerts),
      consecutiveFailures: Object.fromEntries(this.state.consecutiveFailures),
      timestamp: Date.now(),
    };

    try {
      fs.writeFileSync(this.statusFile, JSON.stringify(status, null, 2));
    } catch (error) {
      this.log(`❌ Status-Speicherung fehlgeschlagen: $${error.message}`);
    }
  }

  loadStatus() {
    try {
      if (fs.existsSync(this.statusFile)) { 
        const status = JSON.parse(fs.readFileSync(this.statusFile, 'utf8'));
        // Nur persistente Daten laden
        this.state.consecutiveFailures = new Map(Object.entries(status.consecutiveFailures || {}));
        this.log('📁 Status erfolgreich geladen');
      }
    } catch (error) {
      this.log(`⚠️ Status-Laden fehlgeschlagen: $${error.message}`);
    }
  }

  /**
   * Öffentliche API für Status-Abfragen
   */
  getHealthReport() {
    return {
      running: this.state.running,
      lastCheck: this.state.lastFullCheck,
      overallHealth: this.state.lastFullCheck?.healthScore || 0,
      services: Array.from(this.state.checks.entries()).map(([name, result]) => ({
        name,
        healthy: result.healthy,
        responseTime: result.responseTime,
        lastCheck: result.timestamp,
        consecutiveFailures: this.state.consecutiveFailures.get(name) || 0,
      })),
      activeAlerts: Array.from(this.state.alerts.values()),
    };
  }

  /**
   * Logging
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[$${timestamp}] ${message}`;

    console.log(logEntry);

    try {
      fs.appendFileSync(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Log-Fehler:', error.message);
    }
  }
}

// CLI Interface
if (require.main === module) { 
  const command = process.argv[2];
  const monitor = new HealthCheckMonitor();

  switch (command) {
    case 'start':
      monitor.loadStatus();
      monitor.start();
      break;

    case 'stop':
      console.log('🛑 Health Monitor gestoppt (falls laufend)');
      process.exit(0);
      break;

    case 'status':
      monitor.loadStatus();
      const report = monitor.getHealthReport();
      console.log('📊 Health Report:');
      console.log(JSON.stringify(report, null, 2));
      break;

    case 'check':
      monitor.loadStatus();
      monitor.runFullHealthCheck().then(() => {
        const report = monitor.getHealthReport();
        console.log('✅ Einmaliger Health Check abgeschlossen');
        console.log(`Gesundheit: $${report.overallHealth}%`);
        process.exit(report.overallHealth >= 80 ? 0 : 1);
      });
      break;

    default:
      console.log('🏥 BurniToken Health Monitor');
      console.log('');
      console.log('Verwendung:');
      console.log('  node health-monitor.js start   - Startet kontinuierliche Überwachung');
      console.log('  node health-monitor.js stop    - Stoppt die Überwachung');
      console.log('  node health-monitor.js status  - Zeigt aktuellen Status');
      console.log('  node health-monitor.js check   - Führt einmaligen Check durch');
      break;
  }
}

module.exports = HealthCheckMonitor;
