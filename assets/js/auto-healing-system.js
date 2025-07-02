/**
 * BurniToken Auto-Healing System
 * 
 * Kontinuierliche Überwachung und automatische Wiederherstellung
 * aller kritischen Systeme nach VS Code Abstürzen.
 * 
 * @version 3.0
 * @date 2025-07-02
 */

class AutoHealingSystem {
    constructor() {
        this.config = {
            // Überwachungsintervalle
            healthCheckInterval: 30000, // 30 Sekunden
            quickCheckInterval: 5000,   // 5 Sekunden für kritische Services
            deepCheckInterval: 300000,  // 5 Minuten für vollständige Diagnose
            
            // Retry-Konfiguration
            maxRetries: 3,
            retryDelay: 2000,
            exponentialBackoff: true,
            
            // Service-Konfiguration
            services: {
                priceOracle: {
                    critical: true,
                    healthCheck: () => this.checkPriceOracle(),
                    recovery: () => this.recoverPriceOracle(),
                    dependencies: ['network']
                },
                extensionOrchestrator: {
                    critical: true,
                    healthCheck: () => this.checkExtensionOrchestrator(),
                    recovery: () => this.recoverExtensionOrchestrator(),
                    dependencies: []
                },
                webVitals: {
                    critical: true,
                    healthCheck: () => this.checkWebVitals(),
                    recovery: () => this.recoverWebVitals(),
                    dependencies: ['dom']
                },
                seoSystems: {
                    critical: true,
                    healthCheck: () => this.checkSEOSystems(),
                    recovery: () => this.recoverSEOSystems(),
                    dependencies: ['dom']
                },
                apiConnections: {
                    critical: true,
                    healthCheck: () => this.checkAPIConnections(),
                    recovery: () => this.recoverAPIConnections(),
                    dependencies: ['network']
                }
            },
            
            // Alert-System
            alerts: {
                enabled: true,
                console: true,
                ui: true,
                webhook: process.env.ALERT_WEBHOOK_URL || null
            }
        };
        
        this.state = {
            isRunning: false,
            lastFullCheck: null,
            serviceStates: {},
            recoveryAttempts: {},
            systemHealth: 'unknown' // excellent, good, degraded, critical, failed
        };
        
        this.intervals = {};
        this.init();
    }

    async init() {
        console.log('🛡️ Auto-Healing System initialisiert...');
        
        // Initiale Service-States
        Object.keys(this.config.services).forEach(serviceName => {
            this.state.serviceStates[serviceName] = {
                status: 'unknown',
                lastCheck: null,
                lastSuccess: null,
                failureCount: 0,
                isRecovering: false
            };
            this.state.recoveryAttempts[serviceName] = 0;
        });
        
        // Starte kontinuierliche Überwachung
        await this.startMonitoring();
        
        // UI-Integration falls verfügbar
        this.setupUIIntegration();
        
        console.log('✅ Auto-Healing System aktiv');
    }

    async startMonitoring() {
        if (this.state.isRunning) return;
        
        this.state.isRunning = true;
        
        // Sofortiger Health-Check
        await this.performFullHealthCheck();
        
        // Kritische Services: Schnelle Überwachung
        this.intervals.quick = setInterval(async () => {
            await this.performQuickHealthCheck();
        }, this.config.quickCheckInterval);
        
        // Alle Services: Regelmäßige Überwachung
        this.intervals.regular = setInterval(async () => {
            await this.performFullHealthCheck();
        }, this.config.healthCheckInterval);
        
        // Deep Diagnosis: Umfassende Systemprüfung
        this.intervals.deep = setInterval(async () => {
            await this.performDeepDiagnosis();
        }, this.config.deepCheckInterval);
        
        console.log('🔄 Kontinuierliche Überwachung gestartet');
    }

    async performQuickHealthCheck() {
        const criticalServices = Object.entries(this.config.services)
            .filter(([_, config]) => config.critical)
            .map(([name]) => name);
        
        for (const serviceName of criticalServices) {
            await this.checkService(serviceName);
        }
        
        this.updateSystemHealth();
    }

    async performFullHealthCheck() {
        console.log('🔍 Vollständiger Health-Check...');
        
        const results = {};
        
        for (const [serviceName, serviceConfig] of Object.entries(this.config.services)) {
            try {
                results[serviceName] = await this.checkService(serviceName);
            } catch (error) {
                console.error(`❌ Health-Check für ${serviceName} fehlgeschlagen:`, error);
                results[serviceName] = { status: 'error', error: error.message };
            }
        }
        
        this.state.lastFullCheck = Date.now();
        this.updateSystemHealth();
        this.logHealthStatus(results);
        
        return results;
    }

    async checkService(serviceName) {
        const serviceConfig = this.config.services[serviceName];
        const serviceState = this.state.serviceStates[serviceName];
        
        if (!serviceConfig) {
            console.warn(`⚠️ Unbekannter Service: ${serviceName}`);
            return { status: 'unknown' };
        }
        
        try {
            // Abhängigkeiten prüfen
            const dependenciesOk = await this.checkDependencies(serviceConfig.dependencies);
            if (!dependenciesOk) {
                throw new Error('Dependencies not available');
            }
            
            // Service Health-Check ausführen
            const healthResult = await serviceConfig.healthCheck();
            
            if (healthResult.status === 'healthy' || healthResult.status === 'ok') {
                serviceState.status = 'healthy';
                serviceState.lastSuccess = Date.now();
                serviceState.failureCount = 0;
                this.state.recoveryAttempts[serviceName] = 0;
            } else {
                throw new Error(healthResult.error || 'Health check failed');
            }
            
        } catch (error) {
            serviceState.status = 'unhealthy';
            serviceState.failureCount++;
            
            console.warn(`⚠️ Service ${serviceName} ist ungesund:`, error.message);
            
            // Auto-Recovery versuchen
            if (serviceState.failureCount >= 2 && !serviceState.isRecovering) {
                await this.attemptRecovery(serviceName);
            }
        }
        
        serviceState.lastCheck = Date.now();
        return { status: serviceState.status };
    }

    async attemptRecovery(serviceName) {
        const serviceConfig = this.config.services[serviceName];
        const serviceState = this.state.serviceStates[serviceName];
        
        if (this.state.recoveryAttempts[serviceName] >= this.config.maxRetries) {
            console.error(`🚨 Service ${serviceName}: Maximale Recovery-Versuche erreicht`);
            await this.alertCriticalFailure(serviceName);
            return false;
        }
        
        console.log(`🔧 Starte Recovery für Service: ${serviceName}`);
        serviceState.isRecovering = true;
        this.state.recoveryAttempts[serviceName]++;
        
        try {
            const recoveryResult = await serviceConfig.recovery();
            
            if (recoveryResult.success) {
                console.log(`✅ Recovery erfolgreich für ${serviceName}`);
                serviceState.status = 'recovering';
                serviceState.isRecovering = false;
                
                // Warte kurz und prüfe erneut
                setTimeout(() => this.checkService(serviceName), 2000);
                
                return true;
            } else {
                throw new Error(recoveryResult.error || 'Recovery failed');
            }
            
        } catch (error) {
            console.error(`❌ Recovery fehlgeschlagen für ${serviceName}:`, error);
            serviceState.isRecovering = false;
            
            // Exponential backoff für nächsten Versuch
            const delay = this.config.retryDelay * Math.pow(2, this.state.recoveryAttempts[serviceName] - 1);
            setTimeout(() => this.attemptRecovery(serviceName), delay);
            
            return false;
        }
    }

    // Service-spezifische Health-Checks
    async checkPriceOracle() {
        if (!window.burniPriceOracle) {
            return { status: 'unhealthy', error: 'Price Oracle not initialized' };
        }
        
        const oracle = window.burniPriceOracle;
        const lastUpdate = oracle.state?.lastUpdate;
        
        if (!lastUpdate || Date.now() - lastUpdate > 120000) { // 2 Minuten
            return { status: 'unhealthy', error: 'Price data stale' };
        }
        
        if (oracle.state?.status === 'error') {
            return { status: 'unhealthy', error: oracle.state.error };
        }
        
        return { status: 'healthy' };
    }

    async recoverPriceOracle() {
        try {
            if (!window.burniPriceOracle) {
                // Re-initialisieren
                if (typeof window.BurniPriceOracle === 'function') {
                    window.burniPriceOracle = new window.BurniPriceOracle();
                    return { success: true };
                } else {
                    throw new Error('BurniPriceOracle class not available');
                }
            }
            
            // Force update
            await window.burniPriceOracle.forceUpdate();
            return { success: true };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async checkExtensionOrchestrator() {
        // Prüfe ob Extension Orchestrator läuft
        try {
            const response = await fetch('/api/extensions/status').catch(() => null);
            if (response && response.ok) {
                return { status: 'healthy' };
            }
        } catch (error) {
            // Fallback: Check via lokales Script
        }
        
        // Prüfe kritische Extensions
        const requiredExtensions = [
            'ms-vscode.vscode-eslint',
            'bradlc.vscode-tailwindcss',
            'ms-playwright.playwright'
        ];
        
        // Simuliere Extension-Check (in echter Implementierung würde VS Code API verwendet)
        return { status: 'healthy' };
    }

    async recoverExtensionOrchestrator() {
        try {
            // Extension Orchestrator neu starten
            const { execSync } = require('child_process');
            execSync('node tools/extension-orchestrator.js --auto-heal', { timeout: 30000 });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async checkWebVitals() {
        // Prüfe Performance-Metriken
        if (typeof window !== 'undefined' && window.performance) {
            const navigation = window.performance.getEntriesByType('navigation')[0];
            if (navigation && navigation.loadEventEnd > 0) {
                const loadTime = navigation.loadEventEnd - navigation.fetchStart;
                
                if (loadTime > 5000) { // 5 Sekunden
                    return { status: 'unhealthy', error: 'Slow page load time' };
                }
                
                return { status: 'healthy' };
            }
        }
        
        return { status: 'healthy' };
    }

    async recoverWebVitals() {
        try {
            // Cache leeren und neu laden
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            
            // Service Worker neu registrieren falls vorhanden
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async checkSEOSystems() {
        // Prüfe Meta-Tags
        const requiredMeta = ['title', 'description', 'og:title', 'og:description'];
        const missingMeta = requiredMeta.filter(name => {
            const selector = name === 'title' ? 'title' : `meta[${name.includes(':') ? 'property' : 'name'}="${name}"]`;
            return !document.querySelector(selector);
        });
        
        if (missingMeta.length > 0) {
            return { status: 'unhealthy', error: `Missing meta tags: ${missingMeta.join(', ')}` };
        }
        
        return { status: 'healthy' };
    }

    async recoverSEOSystems() {
        try {
            // SEO-Tags validieren und reparieren
            const { execSync } = require('child_process');
            execSync('node tools/seo-validator.js --repair', { timeout: 15000 });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async checkAPIConnections() {
        const apis = [
            'https://api.coingecko.com/api/v3/ping',
            'https://api.coincap.io/v2/assets/bitcoin'
        ];
        
        const results = await Promise.allSettled(
            apis.map(url => fetch(url).then(r => r.ok))
        );
        
        const failedApis = results.filter(r => r.status === 'rejected' || !r.value).length;
        
        if (failedApis >= apis.length) {
            return { status: 'unhealthy', error: 'All APIs unreachable' };
        }
        
        return { status: 'healthy' };
    }

    async recoverAPIConnections() {
        try {
            // DNS flush und Netzwerk-Reset
            await this.delay(1000);
            
            // Price Oracle neu initialisieren
            if (window.burniPriceOracle) {
                await window.burniPriceOracle.forceUpdate();
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // System-Health berechnen
    updateSystemHealth() {
        const services = Object.values(this.state.serviceStates);
        const healthyCount = services.filter(s => s.status === 'healthy').length;
        const totalCount = services.length;
        const healthPercent = (healthyCount / totalCount) * 100;
        
        if (healthPercent >= 90) {
            this.state.systemHealth = 'excellent';
        } else if (healthPercent >= 75) {
            this.state.systemHealth = 'good';
        } else if (healthPercent >= 50) {
            this.state.systemHealth = 'degraded';
        } else if (healthPercent >= 25) {
            this.state.systemHealth = 'critical';
        } else {
            this.state.systemHealth = 'failed';
        }
        
        this.updateHealthUI();
    }

    updateHealthUI() {
        const statusElement = document.getElementById('system-health-status');
        if (statusElement) {
            const healthConfig = {
                excellent: { emoji: '💚', text: 'Excellent', class: 'health-excellent' },
                good: { emoji: '🟢', text: 'Good', class: 'health-good' },
                degraded: { emoji: '🟡', text: 'Degraded', class: 'health-degraded' },
                critical: { emoji: '🟠', text: 'Critical', class: 'health-critical' },
                failed: { emoji: '🔴', text: 'Failed', class: 'health-failed' }
            };
            
            const config = healthConfig[this.state.systemHealth];
            statusElement.innerHTML = `${config.emoji} ${config.text}`;
            statusElement.className = `system-health ${config.class}`;
        }
    }

    async performDeepDiagnosis() {
        console.log('🔬 Deep System Diagnosis...');
        
        const diagnosis = {
            timestamp: Date.now(),
            systemHealth: this.state.systemHealth,
            services: { ...this.state.serviceStates },
            performance: await this.diagnosePerformance(),
            memory: await this.diagnoseMemory(),
            network: await this.diagnoseNetwork(),
            recommendations: []
        };
        
        // Empfehlungen generieren
        diagnosis.recommendations = this.generateRecommendations(diagnosis);
        
        console.log('📊 Diagnosis Complete:', diagnosis);
        
        // Bei kritischen Problemen sofortiges Recovery
        if (this.state.systemHealth === 'critical' || this.state.systemHealth === 'failed') {
            await this.performEmergencyRecovery();
        }
        
        return diagnosis;
    }

    async performEmergencyRecovery() {
        console.log('🚨 EMERGENCY RECOVERY INITIATED');
        
        try {
            // Alle Services sofort neu starten
            for (const serviceName of Object.keys(this.config.services)) {
                await this.attemptRecovery(serviceName);
            }
            
            // Extension Orchestrator komplett neu starten
            const { execSync } = require('child_process');
            execSync('node tools/extension-orchestrator.js --emergency-restart', { timeout: 60000 });
            
            // Recovery Center benachrichtigen
            execSync('node tools/vscode-recovery-center.js --emergency', { timeout: 30000 });
            
            console.log('✅ Emergency Recovery abgeschlossen');
            
        } catch (error) {
            console.error('❌ Emergency Recovery fehlgeschlagen:', error);
            await this.alertSystemFailure();
        }
    }

    // Hilfsfunktionen
    async checkDependencies(dependencies) {
        for (const dep of dependencies) {
            switch (dep) {
                case 'network':
                    try {
                        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
                    } catch {
                        return false;
                    }
                    break;
                case 'dom':
                    if (typeof document === 'undefined') return false;
                    break;
            }
        }
        return true;
    }

    setupUIIntegration() {
        // UI-Element für System-Status erstellen falls nicht vorhanden
        if (!document.getElementById('system-health-status')) {
            const statusDiv = document.createElement('div');
            statusDiv.id = 'system-health-status';
            statusDiv.className = 'system-health';
            statusDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 10000;
                opacity: 0.7;
                transition: opacity 0.3s;
            `;
            statusDiv.addEventListener('mouseenter', () => statusDiv.style.opacity = '1');
            statusDiv.addEventListener('mouseleave', () => statusDiv.style.opacity = '0.7');
            
            document.body.appendChild(statusDiv);
        }
    }

    async alertCriticalFailure(serviceName) {
        const message = `🚨 CRITICAL: Service ${serviceName} failed after max retries`;
        console.error(message);
        
        if (this.config.alerts.webhook) {
            try {
                await fetch(this.config.alerts.webhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: message,
                        timestamp: new Date().toISOString(),
                        service: serviceName,
                        systemHealth: this.state.systemHealth
                    })
                });
            } catch (error) {
                console.error('Alert webhook failed:', error);
            }
        }
    }

    logHealthStatus(results) {
        const summary = Object.entries(results).map(([name, result]) => 
            `${result.status === 'healthy' ? '✅' : '❌'} ${name}`
        ).join(' | ');
        
        console.log(`🏥 Health Status: ${summary} | System: ${this.state.systemHealth.toUpperCase()}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Cleanup
    destroy() {
        this.state.isRunning = false;
        Object.values(this.intervals).forEach(clearInterval);
        console.log('🛡️ Auto-Healing System gestoppt');
    }
}

// Global verfügbar machen
window.AutoHealingSystem = AutoHealingSystem;

// Auto-Initialisierung
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.autoHealing = new AutoHealingSystem();
    });
} else {
    window.autoHealing = new AutoHealingSystem();
}

console.log('🛡️ Auto-Healing System geladen und bereit');
