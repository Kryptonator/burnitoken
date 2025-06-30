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
 * @version 1.0.0
 * @date 2025-06-30
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class MasterSelfHealingController {
    constructor() {
        this.services = new Map();
        this.config = {
            autoStart: true,
            selfHealing: true,
            healthCheckInterval: 30000, // 30 seconds
            restartAttempts: 3,
            crashThreshold: 5, // max crashes before disabling
            logLevel: 'info'
        };
        
        this.state = {
            running: false,
            startTime: null,
            totalRestarts: 0,
            healthChecks: 0,
            lastHealthCheck: null
        };

        this.intervals = new Map();
        this.init();
    }

    async init() {
        console.log('🔥 Master Self-Healing Controller starting...');
        
        // Discover all services
        await this.discoverServices();
        
        // Start health monitoring
        this.startHealthMonitoring();
        
        // Auto-start critical services
        if (this.config.autoStart) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
            await this.autoStartServices();
        }
        
        this.state.running = true;
        this.state.startTime = Date.now();
        
        console.log(`✅ Master Controller active with ${this.services.size} services`);
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
            { pattern: /test-.*\.js$/, type: 'test', priority: 5, autoStart: false }
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
                            name: serviceName,
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
                            enabled: true
                        });
                        
                        console.log(`📦 Discovered: ${serviceName} (${service.type})`);
                    }
                    break;
                }
            }
        }
        
        console.log(`✅ Found ${this.services.size} services`);
    }

    async isServiceExecutable(servicePath) {
        try {
            const content = fs.readFileSync(servicePath, 'utf8');
            // Check if it's a proper Node.js script
            return content.includes('module.exports') || 
                   content.includes('function') || 
                   content.includes('class') ||
                   content.includes('console.log') ||
                   content.startsWith('#!/usr/bin/env node');
        } catch (error) {
            return false;
        }
    }

    async autoStartServices() {
        console.log('🚀 Auto-starting critical services...');
        
        // Sort by priority (lower number = higher priority)
        const autoStartServices = Array.from(this.services.values())
            .filter(service => service.autoStart && service.enabled)
            .sort((a, b) => a.priority - b.priority);
        
        for (const service of autoStartServices) {
            try {
                await this.startService(service.name);
                // Small delay between starts
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`❌ Failed to auto-start ${service.name}:`, error.message);
            }
        }
    }

    async startService(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found`);
        }
        
        if (service.status === 'running') {
            console.log(`⚠️ Service ${serviceName} already running`);
            return;
        }
        
        console.log(`🚀 Starting ${serviceName}...`);
        
        try {
            // Special handling for different service types
            let args = [];
            let options = {
                stdio: ['pipe', 'pipe', 'pipe'],
                detached: false
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
                console.log(`✅ ${serviceName} started (PID: ${childProcess.pid})`);
            });
            
            childProcess.on('exit', (code, signal) => {
                service.status = 'stopped';
                service.process = null;
                
                if (code !== 0) {
                    service.crashes++;
                    console.error(`💥 ${serviceName} crashed (code: ${code}, signal: ${signal})`);
                    
                    // Self-healing: Auto-restart if enabled and under crash threshold
                    if (this.config.selfHealing && service.crashes < this.config.crashThreshold) {
                        console.log(`🔄 Auto-restarting ${serviceName} (attempt ${service.crashes}/${this.config.crashThreshold})`);
                        setTimeout(() => {
                            this.startService(serviceName).catch(err => {
                                console.error(`❌ Failed to restart ${serviceName}:`, err.message);
                            });
                        }, 5000 * service.crashes); // Exponential backoff
                    } else if (service.crashes >= this.config.crashThreshold) {
                        console.error(`🚫 ${serviceName} disabled due to excessive crashes`);
                        service.enabled = false;
                    }
                } else {
                    console.log(`👋 ${serviceName} stopped gracefully`);
                }
            });
            
            childProcess.on('error', (error) => {
                console.error(`❌ ${serviceName} error:`, error.message);
                service.status = 'error';
                service.crashes++;
            });
            
            // Capture output for monitoring services
            if (childProcess.stdout) {
                childProcess.stdout.on('data', (data) => {
                    if (this.config.logLevel === 'debug') {
                        console.log(`[${serviceName}] ${data.toString().trim()}`);
                    }
                });
            }
            
            if (childProcess.stderr) {
                childProcess.stderr.on('data', (data) => {
                    console.error(`[${serviceName}] ERROR: ${data.toString().trim()}`);
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
        
        console.log(`🛑 Stopping ${serviceName}...`);
        
        if (service.process) {
            service.process.kill('SIGTERM');
            
            // Force kill after 10 seconds
            setTimeout(() => {
                if (service.process && !service.process.killed) {
                    console.log(`💀 Force killing ${serviceName}`);
                    service.process.kill('SIGKILL');
                }
            }, 10000);
        }
    }

    async restartService(serviceName) {
        await this.stopService(serviceName);
        
        // Wait for clean shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
            console.log(`💓 Health check #${this.state.healthChecks}`);
        }
        
        // Perform specialized cloud service checks
        await this.checkCloudServices();
        
        for (const [name, service] of this.services.entries()) {
            if (!service.enabled) continue;
            
            service.lastHealthCheck = Date.now();
            
            // Check if service should be running but isn't
            if (service.autoStart && service.status !== 'running' && service.crashes < this.config.crashThreshold) {
                console.log(`🔄 Restarting stopped service: ${name}`);
                try {
                    await this.startService(name);
                } catch (error) {
                    console.error(`❌ Failed to restart ${name}:`, error.message);
                }
            }
            
            // Check for hanging processes
            if (service.status === 'starting' && service.lastStart && 
                (Date.now() - service.lastStart) > 60000) { // 1 minute timeout
                console.log(`⚠️ ${name} seems to be hanging, restarting...`);
                await this.restartService(name);
            }
        }
    }

    /**
     * Specialized health check for cloud services (GSC, SEO, Indexing)
     */
    async checkCloudServices() {
        const cloudServices = Array.from(this.services.values()).filter(service => 
            ['gsc-cloud', 'seo-cloud', 'indexing-cloud', 'cloud-integration'].includes(service.type)
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
                console.error(`⚠️ Cloud service check failed for ${service.name}:`, error.message);
            }
        }
    }

    async checkGSCService(service) {
        // Check if GSC service is responding and API is accessible
        if (service.name.includes('status-check') || service.name.includes('integration')) {
            // These services should be able to run a quick status check
            if (service.status !== 'running' && service.autoStart) {
                console.log(`🔍 GSC Service ${service.name} needs restart for continuous monitoring`);
                await this.startService(service.name);
            }
        }
    }

    async checkSEOService(service) {
        // Check SEO bot services
        if (service.status !== 'running' && service.autoStart) {
            console.log(`🔍 SEO Service ${service.name} needs restart for continuous monitoring`);
            await this.startService(service.name);
        }
    }

    async checkIndexingService(service) {
        // Check indexing monitor services
        if (service.status !== 'running' && service.autoStart) {
            console.log(`📊 Indexing Service ${service.name} needs restart for continuous monitoring`);
            await this.startService(service.name);
        }
    }

    async checkIntegrationService(service) {
        // Check cloud integration services
        if (service.status !== 'running' && service.autoStart) {
            console.log(`🌐 Integration Service ${service.name} needs restart for continuous monitoring`);
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
                lastHealthCheck: this.state.lastHealthCheck
            },
            services: {
                total: services.length,
                running: services.filter(s => s.status === 'running').length,
                stopped: services.filter(s => s.status === 'stopped').length,
                error: services.filter(s => s.status === 'error').length,
                disabled: services.filter(s => !s.enabled).length
            },
            details: services.map(s => ({
                name: s.name,
                type: s.type,
                status: s.status,
                crashes: s.crashes,
                restarts: s.restarts,
                enabled: s.enabled,
                autoStart: s.autoStart,
                priority: s.priority,
                pid: s.process?.pid || null,
                uptime: s.lastStart ? Date.now() - s.lastStart : 0
            }))
        };
        
        return status;
    }

    printStatus() {
        const status = this.getSystemStatus();
        
        console.log('\n🔥 MASTER SELF-HEALING CONTROLLER STATUS');
        console.log('═'.repeat(50));
        console.log(`Controller Uptime: ${Math.round(status.controller.uptime / 1000)}s`);
        console.log(`Total Restarts: ${status.controller.totalRestarts}`);
        console.log(`Health Checks: ${status.controller.healthChecks}`);
        console.log('');
        console.log(`Services: ${status.services.running}/${status.services.total} running`);
        console.log(`Stopped: ${status.services.stopped}, Errors: ${status.services.error}, Disabled: ${status.services.disabled}`);
        console.log('');
        
        // Group by type
        const byType = {};
        status.details.forEach(service => {
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
            
            services.forEach(service => {
                const statusIcon = service.status === 'running' ? '✅' : 
                                 service.status === 'error' ? '❌' : '⏸️';
                const autoStartIcon = service.autoStart ? '🚀' : '🔧';
                const uptime = service.uptime > 0 ? `(${Math.round(service.uptime / 1000)}s)` : '';
                const crashInfo = service.crashes > 0 ? `[${service.crashes} crashes]` : '';
                console.log(`  ${statusIcon} ${autoStartIcon} ${service.name} ${uptime} ${crashInfo}`);
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
                    const autoStartServices = Array.from(this.services.values())
                        .filter(s => s.autoStart && s.enabled);
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
                        service.crashes = 0; // Reset crash counter
                        console.log(`✅ ${args[0]} enabled`);
                    }
                }
                break;
                
            case 'disable':
                if (args[0]) {
                    await this.stopService(args[0]);
                    const service = this.services.get(args[0]);
                    if (service) {
                        service.enabled = false;
                        console.log(`🚫 ${args[0]} disabled`);
                    }
                }
                break;
                
            case 'heal':
                console.log('🔄 Running full system healing...');
                await this.performHealthCheck();
                break;
                
            case 'cloud':
                console.log('🌐 CLOUD SERVICES STATUS (GSC, SEO, Indexing):');
                console.log('═'.repeat(50));
                const cloudTypes = ['gsc-cloud', 'seo-cloud', 'indexing-cloud', 'cloud-integration'];
                const cloudServices = Array.from(this.services.values())
                    .filter(s => cloudTypes.includes(s.type));
                
                if (cloudServices.length === 0) {
                    console.log('⚠️ No cloud services found');
                } else {
                    cloudServices.forEach(service => {
                        const statusIcon = service.status === 'running' ? '✅' : 
                                         service.status === 'error' ? '❌' : '⏸️';
                        const autoStartIcon = service.autoStart ? '🚀' : '🔧';
                        const uptime = service.uptime > 0 ? `(${Math.round((Date.now() - service.lastStart) / 1000)}s)` : '';
                        const crashInfo = service.crashes > 0 ? `[${service.crashes} crashes]` : '';
                        console.log(`${statusIcon} ${autoStartIcon} ${service.name} - ${service.type} ${uptime} ${crashInfo}`);
                    });
                }
                
                // Auto-start stopped cloud services
                const stoppedCloudServices = cloudServices.filter(s => s.status !== 'running' && s.autoStart && s.enabled);
                if (stoppedCloudServices.length > 0) {
                    console.log(`\n🔄 Auto-starting ${stoppedCloudServices.length} stopped cloud services...`);
                    for (const service of stoppedCloudServices) {
                        await this.startService(service.name);
                    }
                }
                break;
                
            default:
                console.log('❌ Unknown command. Available: status, start, stop, restart, enable, disable, heal, cloud');
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'status';
    const commandArgs = args.slice(1);
    
    const controller = new MasterSelfHealingController();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received SIGINT, shutting down...');
        await controller.shutdown();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM, shutting down...');
        await controller.shutdown();
        process.exit(0);
    });
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Execute command
    await controller.handleCommand(command, commandArgs);
    
    // For daemon mode
    if (command === 'daemon' || command === 'run') {
        console.log('🔄 Running in daemon mode... Press Ctrl+C to stop');
        // Keep running
        setInterval(() => {
            // Keep alive
        }, 60000);
    } else if (command === 'status') {
        // For status, exit after showing
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Master Controller error:', error);
        process.exit(1);
    });
}

module.exports = MasterSelfHealingController;
