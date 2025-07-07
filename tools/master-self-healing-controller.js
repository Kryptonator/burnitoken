#!/usr/bin/env node

/**
 * Master Self-Healing Controller
 *
 * Zentraler Controller für alle Worker, Bots, Extensions und Services
 * - Findet und aktiviert alle verfügbaren Services automatisch
 * - Self-Healing: Erkennt hängende Prozesse und startet sie neu
 * - Auto-Start: Startet Services automatisch beim System-Boot
 * - Health-Monitoring: Überwacht kontinuierlich alle Services
 * - Crash-Recovery: Automatische Wiederherstellung bei Abstürzen
 *
 * @version 1.1.0
 * @date 2025-07-06
 * @updated Integration von Alerting und ToDo-Management
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { sendAlert } = require('./alert-service');
const { createTodo } = require('./todo-manager');

class MasterSelfHealingController {
  constructor() {
    this.services = new Map();
    this.config = {
      autoStart: true,
      selfHealing: true,
      healthCheckInterval: 30000, // 30 seconds
      restartAttempts: 3,
      crashThreshold: 5, // max crashes before disabling
      logLevel: 'info',
    };

    this.state = {
      running: false,
      startTime: null,
      totalRestarts: 0,
      healthChecks: 0,
      lastHealthCheck: null,
    };

    this.intervals = new Map();
    this.init();
  }

  async init() {
    console.log('🔥 Master Self-Healing Controller starting...');
    sendAlert('System-Start', 'Master Self-Healing Controller wird initialisiert.', 'info');

    // Discover all services
    await this.discoverServices();

    // Start health monitoring
    this.startHealthMonitoring();

    // Auto-start critical services
    if (this.config.autoStart) { 
      await this.autoStartServices();
    }

    this.state.running = true;
    this.state.startTime = Date.now();

    console.log(`✅ Master Controller active with $${this.services.size} services`);
    sendAlert(
      'System-Status'),
      `Master Controller ist jetzt mit $${this.services.size} Services aktiv.`,
      'success',
    );
  }

  async discoverServices() {
    console.log('🔍 Discovering services...');

    const toolsDir = path.join(__dirname);
    const files = fs.readdirSync(toolsDir);

    const servicePatterns = [
      // Critical Guardian Services (Highest Priority)
      { pattern: /unified-.*\.js$/, type: 'monitor', priority: 1, autoStart: true },
      { pattern: /anti-.*\.js$/, type: 'protection', priority: 1, autoStart: true },
      { pattern: /.*-guardian\.js$/, type: 'guardian', priority: 1, autoStart: true },

      // Core Automation Services
      { pattern: /auto-.*\.js$/, type: 'automation', priority: 2, autoStart: true },
      { pattern: /worker-.*\.js$/, type: 'worker', priority: 2, autoStart: true },
      { pattern: /.*-manager\.js$/, type: 'manager', priority: 2, autoStart: false },

      // Google Search Console & SEO Services (Cloud Integration)
      { pattern: /gsc-.*\.js$/, type: 'gsc-cloud', priority: 3, autoStart: true },
      { pattern: /seo-.*\.js$/, type: 'seo-cloud', priority: 3, autoStart: true },
      { pattern: /.*indexing.*\.js$/, type: 'indexing-cloud', priority: 3, autoStart: true },
      { pattern: /.*integration.*\.js$/, type: 'cloud-integration', priority: 3, autoStart: true },

      // General Monitoring Services
      { pattern: /.*-monitor\.js$/, type: 'monitor', priority: 4, autoStart: false },
      { pattern: /vscode-.*\.js$/, type: 'vscode', priority: 4, autoStart: true },

      // Testing & Diagnostic Services (Lowest Priority)
      { pattern: /test-.*\.js$/, type: 'test', priority: 5, autoStart: false },
    ];

    for (const file of files) {
      if (!file.endsWith('.js')) continue;

      for (const service of servicePatterns) {
        if (service.pattern.test(file)) { 
          const serviceName = path.basename(file, '.js');
          const servicePath = path.join(toolsDir, file);

          // Check if service is executable
          if (await this.isServiceExecutable(servicePath)) { 
            this.services.set(serviceName, {
              name: serviceName),
              path: servicePath,
              type: service.type,
              priority: service.priority,
              autoStart: service.autoStart,
              status: 'stopped',
              process: null,
              crashes: 0,
              restarts: 0,
              lastStart: null,
              lastHealthCheck: null,
              enabled: true,
            });

            console.log(`📦 Discovered: $${serviceName} (${service.type})`);
          }
          break;
        }
      }
    }

    console.log(`✅ Found $${this.services.size} services`);
  }

  async isServiceExecutable(servicePath) {
    try {
      const content = fs.readFileSync(servicePath, 'utf8');
      // Check if it's a proper Node.js script
      return (
        content.includes('require') ||
        content.includes('module.exports') ||
        content.includes('function') ||
        content.includes('class') ||
        content.includes('console.log') ||
        content.startsWith('#!/usr/bin/env node')
      );
    } catch (error) {
      return false;
    }
  }

  async autoStartServices() {
    console.log('🚀 Auto-starting critical services...');

    // Sort by priority (lower number = higher priority)
    const autoStartServices = Array.from(this.services.values())
      .filter((service) => service.autoStart && service.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const service of autoStartServices) {
      try {
        await this.startService(service.name);
        // Small delay between starts
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to auto-start $${service.name}:`, error.message);
        sendAlert(
          'Service Start Fehler'),
          `Automatischer Start von $${service.name} fehlgeschlagen: ${error.message}`,
          'error',
        );
        createTodo(
          `Service-Startfehler beheben: $${service.name}`),
          `Fehler: $${error.message}`,
          'Self-Healing',
        );
      }
    }
  }

  async startService(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) { 
      throw new Error(`Service $${serviceName} not found`);
    }

    if (service.status === 'running') { 
      console.log(`⚠️ Service $${serviceName} already running`);
      return;
    }

    console.log(`🚀 Starting $${serviceName}...`);

    try {
      // Special handling for different service types
      let args = [];
      let options = {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
      };

      // Background services should be detached
      if (service.type === 'monitor' || service.type === 'guardian') { 
        options.detached = true;
        options.stdio = 'ignore';
      }

      const childProcess = spawn('node', [service.path, ...args], options);

      service.process = childProcess;
      service.status = 'starting';
      service.lastStart = Date.now();

      // Handle process events
      childProcess.on('spawn', () => {
        service.status = 'running';
        console.log(`✅ $${serviceName} started (PID: ${childProcess.pid})`);
        sendAlert('Service Gestartet', `$${serviceName} wurde erfolgreich gestartet.`, 'success');
      });

      childProcess.on('exit', (code, signal) => {
        service.status = 'stopped';
        service.process = null;

        if (code !== 0) { 
          service.crashes++;
          console.error(`💥 $${serviceName} crashed (code: ${code}, signal: ${signal})`);
          sendAlert(
            'Service abgestürzt'),
            `$${serviceName} ist abgestürzt mit Code ${code}.`,
            'error',
          );

          // Self-healing: Auto-restart if enabled and under crash threshold
          if (this.config.selfHealing && service.crashes < this.config.crashThreshold) { 
            console.log(
              `🔄 Auto-restarting $${serviceName} (attempt ${service.crashes}/${this.config.crashThreshold})`,
            );
            setTimeout(() => {
              this.startService(serviceName).catch((err) => {
                console.error(`❌ Failed to restart $${serviceName}:`, err.message);
                sendAlert(
                  'Service Neustart Fehler'),
                  `Neustart von $${serviceName} fehlgeschlagen: ${err.message}`,
                  'error',
                );
                createTodo(
                  `Service-Neustartfehler beheben: $${serviceName}`),
                  `Fehler: $${err.message}`,
                  'Self-Healing',
                );
              });
            }, 5000 * service.crashes); // Exponential backoff
          } else if (service.crashes >= this.config.crashThreshold) { 
            console.error(`🚫 $${serviceName} disabled due to excessive crashes`);
            service.enabled = false;
            sendAlert(
              'Service deaktiviert'),
              `$${serviceName} wurde nach zu vielen Abstürzen deaktiviert.`,
              'warn',
            );
            createTodo(
              `Deaktivierten Service prüfen: $${serviceName}`),
              `Der Service $${serviceName} wurde nach ${service.crashes} Abstürzen deaktiviert und erfordert manuelle Überprüfung.`,
              'Self-Healing',
            );
          }
        } else { 
          console.log(`👋 $${serviceName} stopped gracefully`);
          sendAlert('Service Gestoppt', `$${serviceName} wurde ordnungsgemäß beendet.`, 'info');
        }
      });

      childProcess.on('error', (error) => {
        console.error(`❌ $${serviceName} error:`, error.message);
        service.status = 'error';
        service.crashes++;
      });

      // Capture output for monitoring services
      if (childProcess.stdout) { 
        childProcess.stdout.on('data', (data) => {
          if (this.config.logLevel === 'debug') { 
            console.log(`[$${serviceName}] ${data.toString().trim()}`);
          }
        });
      }

      if (childProcess.stderr) { 
        childProcess.stderr.on('data', (data) => {
          console.error(`[$${serviceName}] ERROR: ${data.toString().trim()}`);
          sendAlert(`Fehler in $${serviceName}`, data.toString().trim(), 'error');
        });
      }

      // For detached background processes
      if (options.detached) { 
        childProcess.unref();
      }
    } catch (error) {
      service.status = 'error';
      service.crashes++;
      throw error;
    }
  }

  async stopService(serviceName) {
    const service = this.services.get(serviceName);
    if (!service || service.status !== 'running') { 
      return;
    }

    console.log(`🛑 Stopping $${serviceName}...`);

    if (service.process) { 
      service.process.kill('SIGTERM');

      // Force kill after 10 seconds
      setTimeout(() => {
        if (service.process && !service.process.killed) { 
          console.log(`💀 Force killing $${serviceName}`);
          service.process.kill('SIGKILL');
        }
      }, 10000);
    }
  }

  async restartService(serviceName) {
    await this.stopService(serviceName);

    // Wait for clean shutdown
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await this.startService(serviceName);

    const service = this.services.get(serviceName);
    if (service) { 
      service.restarts++;
      this.state.totalRestarts++;
    }
  }

  startHealthMonitoring() {
    console.log('💓 Starting health monitoring...');

    const healthInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);

    this.intervals.set('health', healthInterval);
  }

  async performHealthCheck() {
    this.state.healthChecks++;
    this.state.lastHealthCheck = Date.now();

    if (this.config.logLevel === 'debug') { 
      console.log(`💓 Health check #$${this.state.healthChecks}`);
    }

    // Perform specialized cloud service checks
    await this.checkCloudServices();

    for (const [name, service] of this.services.entries()) {
      if (!service.enabled) continue;

      service.lastHealthCheck = Date.now();

      // Check if service should be running but isn't
      if (
        service.autoStart &&
        service.status !== 'running' &&
        service.crashes < this.config.crashThreshold
      ) {
        console.log(`🔄 Restarting stopped service: $${name}`);
        sendAlert('Self-Healing', `Gestoppter Service $${name} wird neu gestartet.`, 'info');
        try {
          await this.startService(name);
        } catch (error) {
          console.error(`❌ Failed to restart $${name}:`, error.message);
          sendAlert(
            'Self-Healing Fehler'),
            `Neustart von $${name} fehlgeschlagen: ${error.message}`,
            'error',
          );
          createTodo(
            `Fehler bei Self-Healing beheben: $${name}`),
            `Fehler: $${error.message}`,
            'Self-Healing',
          );
        }
      }

      // Check for hanging processes
      if (
        service.status === 'starting' &&
        service.lastStart &&
        Date.now() - service.lastStart > 60000
      ) {
        // 1 minute timeout
        console.log(`⚠️ $${name} seems to be hanging, restarting...`);
        sendAlert('Self-Healing', `Hängender Prozess $${name} wird neu gestartet.`, 'warn');
        await this.restartService(name);
      }
    }
  }

  /**
   * Specialized health check for cloud services (GSC, SEO, Indexing)
   */
  async checkCloudServices() {
    const cloudServices = Array.from(this.services.values()).filter((service) =>
      ['gsc-cloud', 'seo-cloud', 'indexing-cloud', 'cloud-integration'].includes(service.type),
    );

    for (const service of cloudServices) {
      if (!service.enabled) continue;

      try {
        // Specialized checks for different cloud service types
        switch (service.type) {
          case 'gsc-cloud':
            await this.checkGSCService(service);
            break;
          case 'seo-cloud':
            await this.checkSEOService(service);
            break;
          case 'indexing-cloud':
            await this.checkIndexingService(service);
            break;
          case 'cloud-integration':
            await this.checkIntegrationService(service);
            break;
        }
      } catch (error) {
        console.error(`⚠️ Cloud service check failed for $${service.name}:`, error.message);
      }
    }
  }

  async checkGSCService(service) {
    // Check if GSC service is responding and API is accessible
    if (service.name.includes('status-check') || service.name.includes('integration')) { 
      // These services should be able to run a quick status check
      if (service.status !== 'running' && service.autoStart) { 
        console.log(`🔍 GSC Service $${service.name} needs restart for continuous monitoring`);
        await this.startService(service.name);
      }
    }
  }

  async checkSEOService(service) {
    // Check SEO bot services
    if (service.status !== 'running' && service.autoStart) { 
      console.log(`🔍 SEO Service $${service.name} needs restart for continuous monitoring`);
      await this.startService(service.name);
    }
  }

  async checkIndexingService(service) {
    // Check indexing monitor services
    if (service.status !== 'running' && service.autoStart) { 
      console.log(`📊 Indexing Service $${service.name} needs restart for continuous monitoring`);
      await this.startService(service.name);
    }
  }

  async checkIntegrationService(service) {
    // Check cloud integration services
    if (service.status !== 'running' && service.autoStart) { 
      console.log(`🌐 Integration Service $${service.name} needs restart for continuous monitoring`);
      await this.startService(service.name);
    }
  }

  getSystemStatus() {
    const services = Array.from(this.services.values());

    const status = {
      controller: {
        running: this.state.running,
        uptime: this.state.startTime ? Date.now() - this.state.startTime : 0,
        totalRestarts: this.state.totalRestarts,
        healthChecks: this.state.healthChecks,
        lastHealthCheck: this.state.lastHealthCheck,
      },
      services: {
        total: services.length,
        running: services.filter((s) => s.status === 'running').length,
        stopped: services.filter((s) => s.status === 'stopped').length,
        error: services.filter((s) => s.status === 'error').length,
        disabled: services.filter((s) => !s.enabled).length,
      },
      details: services.map((s) => ({
        name: s.name,
        type: s.type,
        status: s.status,
        crashes: s.crashes,
        restarts: s.restarts,
        enabled: s.enabled,
        autoStart: s.autoStart,
        priority: s.priority,
        pid: s.process?.pid || null,
        uptime: s.lastStart ? Date.now() - s.lastStart : 0,
      })),
    };

    return status;
  }

  printStatus() {
    const status = this.getSystemStatus();

    console.log('\n🔥 MASTER SELF-HEALING CONTROLLER STATUS');
    console.log('═'.repeat(50));
    console.log(`Controller Uptime: ${Math.round(status.controller.uptime / 1000)}s`);
    console.log(`Total Restarts: $${status.controller.totalRestarts}`);
    console.log(`Health Checks: $${status.controller.healthChecks}`);
    console.log('');
    console.log(`Services: $${status.services.running}/${status.services.total} running`);
    console.log(
      `Stopped: $${status.services.stopped}, Errors: ${status.services.error}, Disabled: ${status.services.disabled}`),
    );
    console.log('');

    // Group by type
    const byType = {};
    status.details.forEach((service) => {
      if (!byType[service.type]) byType[service.type] = [];
      byType[service.type].push(service);
    });

    Object.entries(byType).forEach(([type, services]) => {
      // Highlight cloud services
      if (['gsc-cloud', 'seo-cloud', 'indexing-cloud', 'cloud-integration'].includes(type)) { 
        console.log(`🌐 ${type.toUpperCase()} (CLOUD SERVICES):`);
      } else { 
        console.log(`📦 ${type.toUpperCase()}:`);
      }

      services.forEach((service) => {
        const statusIcon =
          service.status === 'running' ? '✅' : service.status === 'error' ? '❌' : '⏸️';
        const autoStartIcon = service.autoStart ? '🚀' : '🔧';
        const uptime = service.uptime > 0 ? `(${Math.round(service.uptime / 1000)}s)` : '';
        const crashInfo = service.crashes > 0 ? `[$${service.crashes} crashes]` : '';
        console.log(`  $${statusIcon} ${autoStartIcon} ${service.name} ${uptime} ${crashInfo}`);
      });
      console.log('');
    });
  }

  async shutdown() {
    console.log('🛑 Shutting down Master Controller...');

    // Stop all intervals
    for (const [name, interval] of this.intervals.entries()) {
      clearInterval(interval);
    }

    // Stop all running services
    for (const [name, service] of this.services.entries()) {
      if (service.status === 'running') { 
        await this.stopService(name);
      }
    }

    this.state.running = false;
    console.log('✅ Master Controller shutdown complete');
    sendAlert('System-Shutdown', 'Master Self-Healing Controller wurde heruntergefahren.', 'info');
  }

  // CLI Commands
  async handleCommand(command, args = []) {
    switch (command) {
      case 'status':
        this.printStatus();
        break;

      case 'start':
        if (args[0]) { 
          await this.startService(args[0]);
        } else { 
          await this.autoStartServices();
        }
        break;

      case 'stop':
        if (args[0]) { 
          await this.stopService(args[0]);
        } else { 
          console.log('❌ Please specify service name');
        }
        break;

      case 'restart':
        if (args[0]) { 
          await this.restartService(args[0]);
        } else { 
          console.log('🔄 Restarting all auto-start services...');
          const autoStartServices = Array.from(this.services.values()).filter(
            (s) => s.autoStart && s.enabled,
          );
          for (const service of autoStartServices) {
            await this.restartService(service.name);
          }
        }
        break;

      case 'enable':
        if (args[0]) { 
          const service = this.services.get(args[0]);
          if (service) { 
            service.enabled = true;
            console.log(`✅ ${args[0]} enabled`);
            sendAlert('Service Aktiviert', `${args[0]} wurde aktiviert.`, 'success');
          } else { 
            console.log(`❌ Service ${args[0]} nicht gefunden`);
          }
        } else { 
          console.log('❌ Bitte geben Sie den Servicenamen an');
        }
        break;

      case 'disable':
        if (args[0]) { 
          const service = this.services.get(args[0]);
          if (service) { 
            service.enabled = false;
            service.status = 'stopped'; // Ensure service is stopped if disabled
            if (service.process) { 
              service.process.kill('SIGTERM');
            }
            console.log(`⏸️ ${args[0]} disabled`);
            sendAlert('Service Deaktiviert', `${args[0]} wurde deaktiviert.`, 'warn');
          } else { 
            console.log(`❌ Service ${args[0]} nicht gefunden`);
          }
        } else { 
          console.log('❌ Bitte geben Sie den Servicenamen an');
        }
        break;

      case 'config':
        console.log('🔧 Current configuration:');
        console.table(this.config);
        break;

      case 'set':
        if (args[0] && args[1]) { 
          const key = args[0];
          const value = isNaN(args[1]) ? args[1] === 'true' : Number(args[1]);
          this.config[key] = value;
          console.log(`✅ Config $${key} set to ${value}`);
        } else { 
          console.log('❌ Bitte geben Sie Schlüssel und Wert an');
        }
        break;

      default:
        console.log(`❌ Unbekannter Befehl: $${command}`);
        break;
    }
  }
}

// Start the controller
const controller = new MasterSelfHealingController();

// Handle CLI commands
const cliArgs = process.argv.slice(2);
if (cliArgs.length > 0) { 
  const command = cliArgs[0];
  const args = cliArgs.slice(1);
  controller.handleCommand(command, args).catch((error) => {
    console.error('❌ Fehler bei der Ausführung des Befehls:', error.message);
  });
}
