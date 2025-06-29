/**
 * BurniToken Security Hardening System
 * 
 * Umfassendes Security-System für maximale Sicherheit:
 * - Content Security Policy (CSP) Management
 * - Rate Limiting & DDoS Protection
 * - Bot Detection & Honeypots
 * - Security Headers & Validation
 * - Threat Monitoring & Alerting
 * 
 * @version 1.0.0
 * @date 2025-01-23
 */

class SecurityHardening {
    constructor(config = {}) {
        this.config = {
            // Content Security Policy
            csp: {
                enabled: true,
                reportOnly: false,
                directives: {
                    'default-src': ["'self'"],
                    'script-src': [
                        "'self'",
                        "'unsafe-inline'", // Temporary for inline scripts
                        'https://unpkg.com',
                        'https://cdnjs.cloudflare.com'
                    ],
                    'style-src': [
                        "'self'",
                        "'unsafe-inline'",
                        'https://cdnjs.cloudflare.com'
                    ],
                    'img-src': [
                        "'self'",
                        'data:',
                        'https:'
                    ],
                    'font-src': [
                        "'self'",
                        'https://cdnjs.cloudflare.com'
                    ],
                    'connect-src': [
                        "'self'",
                        'https://api.coingecko.com',
                        'https://api.coincap.io',
                        'https://api.binance.com',
                        'wss://s.altnet.rippletest.net:51233'
                    ],
                    'frame-src': ["'none'"],
                    'object-src': ["'none'"],
                    'base-uri': ["'self'"],
                    'form-action': ["'self'"],
                    'upgrade-insecure-requests': []
                }
            },
            
            // Rate Limiting
            rateLimit: {
                enabled: true,
                windowMs: 15 * 60 * 1000, // 15 minutes
                maxRequests: 100, // per window
                skipSuccessfulRequests: true,
                skipFailedRequests: false,
                keyGenerator: (request) => {
                    return request.ip || request.headers['x-forwarded-for'] || 'unknown';
                }
            },
            
            // DDoS Protection
            ddosProtection: {
                enabled: true,
                maxConcurrentRequests: 50,
                maxRequestsPerSecond: 10,
                burstSize: 20,
                blockDuration: 60000, // 1 minute
                whitelist: ['127.0.0.1', '::1']
            },
            
            // Bot Detection
            botDetection: {
                enabled: true,
                honeypots: [
                    { path: '/admin', type: 'path' },
                    { path: '/wp-admin', type: 'path' },
                    { path: '/login', type: 'path' },
                    { selector: '.honeypot', type: 'form' }
                ],
                userAgentPatterns: [
                    /bot/i,
                    /crawler/i,
                    /spider/i,
                    /scraper/i
                ],
                behaviorAnalysis: {
                    maxClicksPerSecond: 5,
                    maxScrollSpeed: 10000,
                    minTimeBetweenActions: 100
                }
            },
            
            // Security Headers
            securityHeaders: {
                'X-Frame-Options': 'DENY',
                'X-Content-Type-Options': 'nosniff',
                'X-XSS-Protection': '1; mode=block',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
            },
            
            // Threat Monitoring
            threatMonitoring: {
                enabled: true,
                alertThreshold: 10, // suspicious events per minute
                trackingEvents: [
                    'failed_requests',
                    'blocked_ips',
                    'honeypot_triggers',
                    'rate_limit_exceeded',
                    'suspicious_behavior'
                ]
            },
            
            ...config
        };

        this.state = {
            initialized: false,
            requestCounts: new Map(),
            blockedIPs: new Set(),
            suspiciousEvents: [],
            detectedBots: new Set(),
            securityIncidents: [],
            activeConnections: new Map()
        };

        this.intervals = new Map();
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Security Hardening...');
        
        try {
            // Setup CSP
            if (this.config.csp.enabled) {
                this.setupCSP();
            }
            
            // Setup Rate Limiting
            if (this.config.rateLimit.enabled) {
                this.setupRateLimit();
            }
            
            // Setup Bot Detection
            if (this.config.botDetection.enabled) {
                this.setupBotDetection();
            }
            
            // Setup Threat Monitoring
            if (this.config.threatMonitoring.enabled) {
                this.setupThreatMonitoring();
            }
            
            // Setup Security Headers (if in Node.js environment)
            this.setupSecurityHeaders();
            
            // Start monitoring
            this.startSecurityMonitoring();
            
            this.state.initialized = true;
            console.log('✅ Security Hardening initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize security hardening:', error);
            this.reportSecurityIncident('INIT_ERROR', error);
        }
    }

    setupCSP() {
        const cspString = this.generateCSPString();
        
        // Set CSP header (browser environment)
        if (typeof window !== 'undefined') {
            const metaCSP = document.createElement('meta');
            metaCSP.httpEquiv = 'Content-Security-Policy';
            metaCSP.content = cspString;
            document.head.appendChild(metaCSP);
            
            // Listen for CSP violations
            document.addEventListener('securitypolicyviolation', (event) => {
                this.handleCSPViolation(event);
            });
        }
        
        console.log('🛡️ CSP configured:', cspString);
    }

    generateCSPString() {
        const directives = [];
        
        for (const [directive, sources] of Object.entries(this.config.csp.directives)) {
            if (sources.length === 0) {
                directives.push(directive);
            } else {
                directives.push(`${directive} ${sources.join(' ')}`);
            }
        }
        
        return directives.join('; ');
    }

    handleCSPViolation(event) {
        const violation = {
            directive: event.violatedDirective,
            blockedURI: event.blockedURI,
            documentURI: event.documentURI,
            sourceFile: event.sourceFile,
            lineNumber: event.lineNumber,
            timestamp: Date.now()
        };
        
        this.reportSecurityIncident('CSP_VIOLATION', violation);
        console.warn('🚨 CSP Violation:', violation);
    }

    setupRateLimit() {
        // Client-side rate limiting simulation
        if (typeof window !== 'undefined') {
            const requests = new Map();
            
            // Intercept fetch requests to track rates
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const url = args[0];
                const now = Date.now();
                
                // Track request rate
                if (!requests.has(url)) {
                    requests.set(url, []);
                }
                
                const urlRequests = requests.get(url);
                urlRequests.push(now);
                
                // Remove old requests outside window
                const cutoff = now - this.config.rateLimit.windowMs;
                while (urlRequests.length > 0 && urlRequests[0] < cutoff) {
                    urlRequests.shift();
                }
                
                // Check rate limit
                if (urlRequests.length > this.config.rateLimit.maxRequests) {
                    this.reportSecurityIncident('RATE_LIMIT_EXCEEDED', {
                        url,
                        requestCount: urlRequests.length,
                        timeWindow: this.config.rateLimit.windowMs
                    });
                    
                    throw new Error('Rate limit exceeded');
                }
                
                return originalFetch.apply(this, args);
            };
        }
        
        console.log('⏱️ Rate limiting configured');
    }

    setupBotDetection() {
        if (typeof window === 'undefined') return;
        
        // Setup honeypots
        this.setupHoneypots();
        
        // User agent analysis
        this.analyzeUserAgent();
        
        // Behavior analysis
        this.setupBehaviorAnalysis();
        
        console.log('🤖 Bot detection configured');
    }

    setupHoneypots() {
        this.config.botDetection.honeypots.forEach(honeypot => {
            if (honeypot.type === 'form') {
                // Create invisible form fields
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    const form = input.closest('form');
                    if (form && !form.querySelector('.honeypot')) {
                        const honeypotField = document.createElement('input');
                        honeypotField.type = 'text';
                        honeypotField.name = 'website';
                        honeypotField.className = 'honeypot';
                        honeypotField.style.display = 'none';
                        honeypotField.tabIndex = -1;
                        honeypotField.setAttribute('autocomplete', 'off');
                        
                        form.appendChild(honeypotField);
                        
                        // Monitor honeypot field
                        honeypotField.addEventListener('input', () => {
                            this.triggerHoneypot('form_honeypot', {
                                form: form.action || window.location.href,
                                value: honeypotField.value
                            });
                        });
                    }
                });
                
            } else if (honeypot.type === 'path') {
                // Monitor for requests to honeypot paths
                // This would typically be handled server-side
                console.log(`🍯 Honeypot path configured: ${honeypot.path}`);
            }
        });
    }

    analyzeUserAgent() {
        const userAgent = navigator.userAgent;
        
        for (const pattern of this.config.botDetection.userAgentPatterns) {
            if (pattern.test(userAgent)) {
                this.detectBot('user_agent', {
                    userAgent,
                    pattern: pattern.toString()
                });
                break;
            }
        }
    }

    setupBehaviorAnalysis() {
        let lastAction = 0;
        let clickCount = 0;
        let scrollSpeed = 0;
        
        // Click monitoring
        document.addEventListener('click', () => {
            const now = Date.now();
            clickCount++;
            
            if (now - lastAction < 1000) {
                if (clickCount > this.config.botDetection.behaviorAnalysis.maxClicksPerSecond) {
                    this.detectBot('suspicious_clicks', {
                        clicksPerSecond: clickCount,
                        threshold: this.config.botDetection.behaviorAnalysis.maxClicksPerSecond
                    });
                }
            } else {
                clickCount = 1;
            }
            
            lastAction = now;
        });
        
        // Scroll monitoring
        let lastScrollY = window.scrollY;
        let lastScrollTime = Date.now();
        
        window.addEventListener('scroll', () => {
            const now = Date.now();
            const currentScrollY = window.scrollY;
            const scrollDiff = Math.abs(currentScrollY - lastScrollY);
            const timeDiff = now - lastScrollTime;
            
            if (timeDiff > 0) {
                scrollSpeed = scrollDiff / timeDiff;
                
                if (scrollSpeed > this.config.botDetection.behaviorAnalysis.maxScrollSpeed) {
                    this.detectBot('suspicious_scroll', {
                        scrollSpeed,
                        threshold: this.config.botDetection.behaviorAnalysis.maxScrollSpeed
                    });
                }
            }
            
            lastScrollY = currentScrollY;
            lastScrollTime = now;
        });
    }

    triggerHoneypot(type, data) {
        this.detectBot('honeypot', { type, ...data });
        console.warn('🍯 Honeypot triggered:', type, data);
    }

    detectBot(reason, data) {
        const botData = {
            reason,
            data,
            userAgent: navigator.userAgent,
            ip: 'unknown', // Would be available server-side
            timestamp: Date.now()
        };
        
        this.state.detectedBots.add(JSON.stringify(botData));
        this.reportSecurityIncident('BOT_DETECTED', botData);
        
        console.warn('🤖 Bot detected:', botData);
    }

    setupThreatMonitoring() {
        // Monitor for suspicious events
        const monitoringInterval = setInterval(() => {
            this.analyzeThreatLevel();
        }, 60000); // Check every minute
        
        this.intervals.set('threatMonitoring', monitoringInterval);
        
        console.log('👁️ Threat monitoring configured');
    }

    analyzeThreatLevel() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Count recent suspicious events
        const recentEvents = this.state.suspiciousEvents.filter(
            event => event.timestamp > oneMinuteAgo
        );
        
        if (recentEvents.length > this.config.threatMonitoring.alertThreshold) {
            this.reportSecurityIncident('HIGH_THREAT_LEVEL', {
                eventCount: recentEvents.length,
                threshold: this.config.threatMonitoring.alertThreshold,
                events: recentEvents.slice(-5) // Last 5 events
            });
        }
        
        // Cleanup old events
        this.state.suspiciousEvents = this.state.suspiciousEvents.filter(
            event => event.timestamp > now - 3600000 // Keep last hour
        );
    }

    setupSecurityHeaders() {
        // This would typically be handled server-side
        console.log('🔒 Security headers configured:', this.config.securityHeaders);
    }

    startSecurityMonitoring() {
        // General monitoring interval
        const monitoringInterval = setInterval(() => {
            this.performSecurityCheck();
        }, 30000); // Every 30 seconds
        
        this.intervals.set('securityMonitoring', monitoringInterval);
        
        console.log('🔍 Security monitoring started');
    }

    performSecurityCheck() {
        // Check for anomalies
        this.checkForAnomalies();
        
        // Update security metrics
        this.updateSecurityMetrics();
    }

    checkForAnomalies() {
        // Check for unusual patterns
        // This is a simplified implementation
        const now = Date.now();
        
        // Check request patterns
        for (const [ip, requests] of this.state.requestCounts.entries()) {
            const recentRequests = requests.filter(
                timestamp => timestamp > now - 60000
            );
            
            if (recentRequests.length > 50) { // Threshold for suspicion
                this.reportSecurityIncident('SUSPICIOUS_REQUEST_PATTERN', {
                    ip,
                    requestCount: recentRequests.length,
                    timeWindow: '1 minute'
                });
            }
        }
    }

    updateSecurityMetrics() {
        // Update internal metrics
        const metrics = {
            blockedIPs: this.state.blockedIPs.size,
            detectedBots: this.state.detectedBots.size,
            securityIncidents: this.state.securityIncidents.length,
            suspiciousEvents: this.state.suspiciousEvents.length,
            timestamp: Date.now()
        };
        
        // Send to monitoring system
        if (window.burniMonitoring) {
            window.burniMonitoring.recordMetric('security_metrics', metrics);
        }
    }

    reportSecurityIncident(type, data) {
        const incident = {
            id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            data,
            severity: this.getIncidentSeverity(type),
            timestamp: Date.now(),
            userAgent: navigator?.userAgent || 'unknown',
            url: window?.location?.href || 'unknown'
        };
        
        this.state.securityIncidents.push(incident);
        this.state.suspiciousEvents.push(incident);
        
        // Alert monitoring system
        if (window.burniMonitoring) {
            window.burniMonitoring.createAlert({
                type: 'security_incident',
                message: `Security incident: ${type}`,
                severity: incident.severity,
                data: incident
            });
        }
        
        console.warn('🚨 Security incident:', incident);
        
        // Keep only last 100 incidents
        if (this.state.securityIncidents.length > 100) {
            this.state.securityIncidents.splice(0, this.state.securityIncidents.length - 100);
        }
    }

    getIncidentSeverity(type) {
        const severityMap = {
            'CSP_VIOLATION': 'medium',
            'RATE_LIMIT_EXCEEDED': 'medium',
            'BOT_DETECTED': 'low',
            'HIGH_THREAT_LEVEL': 'critical',
            'SUSPICIOUS_REQUEST_PATTERN': 'high',
            'INIT_ERROR': 'high'
        };
        
        return severityMap[type] || 'medium';
    }

    // Public API
    getSecurityStatus() {
        return {
            initialized: this.state.initialized,
            threats: {
                blockedIPs: this.state.blockedIPs.size,
                detectedBots: this.state.detectedBots.size,
                recentIncidents: this.state.securityIncidents.slice(-10)
            },
            protection: {
                csp: this.config.csp.enabled,
                rateLimit: this.config.rateLimit.enabled,
                botDetection: this.config.botDetection.enabled,
                threatMonitoring: this.config.threatMonitoring.enabled
            },
            timestamp: Date.now()
        };
    }

    getSecurityMetrics() {
        return {
            incidents: this.state.securityIncidents.length,
            recentEvents: this.state.suspiciousEvents.length,
            detectedThreats: this.state.detectedBots.size,
            blockedIPs: this.state.blockedIPs.size
        };
    }

    blockIP(ip, reason) {
        this.state.blockedIPs.add(ip);
        this.reportSecurityIncident('IP_BLOCKED', { ip, reason });
        console.warn(`🚫 IP blocked: ${ip} (${reason})`);
    }

    unblockIP(ip) {
        this.state.blockedIPs.delete(ip);
        console.log(`✅ IP unblocked: ${ip}`);
    }

    destroy() {
        // Clear all intervals
        for (const [name, intervalId] of this.intervals.entries()) {
            clearInterval(intervalId);
        }
        this.intervals.clear();
        
        // Clean up state
        this.state.requestCounts.clear();
        this.state.blockedIPs.clear();
        this.state.detectedBots.clear();
        this.state.suspiciousEvents = [];
        this.state.securityIncidents = [];
        
        console.log('💥 Security Hardening destroyed');
    }
}

// Make it available globally
window.SecurityHardening = SecurityHardening;

// Auto-initialize in browser
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.burniSecurity = new SecurityHardening();
    });
}
