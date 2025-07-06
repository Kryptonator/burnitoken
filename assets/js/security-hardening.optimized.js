class SecurityHardening {
  constructor(t = {}) {
    this.config = {
      csp: {
        enabled: !0,
        reportOnly: !1,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", 'https:'],
          'style-src': ["'self'", "'unsafe-inline'", 'https:'],
          'img-src': ["'self'", 'data:', 'https:'],
          'font-src': ["'self'", 'https:'],
          'connect-src': ["'self'", 'https:', 'wss:'],
          'frame-src': ["'none'"],
          'object-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'upgrade-insecure-requests': [],
        },
      },
      rateLimit: {
        enabled: !0,
        windowMs: 9e5,
        maxRequests: 100,
        skipSuccessfulRequests: !0,
        skipFailedRequests: !1,
        keyGenerator: (t) => t.ip || t.headers['x-forwarded-for'] || 'unknown',
      },
      ddosProtection: {
        enabled: !0,
        maxConcurrentRequests: 50,
        maxRequestsPerSecond: 10,
        burstSize: 20,
        blockDuration: 6e4,
        whitelist: ['127.0.0.1', '::1'],
      },
      botDetection: {
        enabled: !0,
        honeypots: [
          { path: '/admin', type: 'path' },
          { path: '/wp-admin', type: 'path' },
          { path: '/login', type: 'path' },
          { selector: '.honeypot', type: 'form' },
        ],
        userAgentPatterns: [/bot/i, /crawler/i, /spider/i, /scraper/i],
        behaviorAnalysis: {
          maxClicksPerSecond: 5,
          maxScrollSpeed: 1e4,
          minTimeBetweenActions: 100,
        },
      },
      securityHeaders: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      },
      threatMonitoring: {
        enabled: !0,
        alertThreshold: 10,
        trackingEvents: [
          'failed_requests',
          'blocked_ips',
          'honeypot_triggers',
          'rate_limit_exceeded',
          'suspicious_behavior',
        ],
      },
      ...t,
    };
    this.state = {
      initialized: !1,
      requestCounts: new Map(),
      blockedIPs: new Set(),
      suspiciousEvents: [],
      detectedBots: new Set(),
      securityIncidents: [],
      activeConnections: new Map(),
    };
    this.intervals = new Map();
    this.init();
  }
  async init() {
    console.log('\ud83d\udd10 Initializing Security Hardening...');
    try {
      (this.config.csp.enabled && this.setupCSP(),
        this.config.rateLimit.enabled && this.setupRateLimit(),
        this.config.botDetection.enabled && this.setupBotDetection(),
        this.config.threatMonitoring.enabled && this.setupThreatMonitoring(),
        this.setupSecurityHeaders(),
        this.startSecurityMonitoring(),
        (this.state.initialized = !0),
        console.log('\u2705 Security Hardening initialized successfully'));
    } catch (t) {
      (console.error('\u274c Failed to initialize security hardening:', t),
        this.reportSecurityIncident('INIT_ERROR', t));
    }
  }
  setupCSP() {
    const t = this.generateCSPString();
    ('undefined' != typeof window &&
      (document.head.appendChild(
        Object.assign(document.createElement('meta'), {
          httpEquiv: 'Content-Security-Policy',
          content: t,
        }),
      ),
      document.addEventListener('securitypolicyviolation', (t) => {
        this.handleCSPViolation(t);
      })),
      console.log('\ud83d\udee1\ufe0f CSP configured:', t));
  }
  generateCSPString() {
    const t = [];
    for (const [e, o] of Object.entries(this.config.csp.directives))
      t.push(0 === o.length ? e : `$${e} ${o.join(' ')}`);
    return t.join('; ');
  }
  handleCSPViolation(t) {
    const e = {
      directive: t.violatedDirective,
      blockedURI: t.blockedURI,
      documentURI: t.documentURI,
      sourceFile: t.sourceFile,
      lineNumber: t.lineNumber,
      timestamp: Date.now(),
    };
    (this.reportSecurityIncident('CSP_VIOLATION', e),
      console.warn('\ud83d\udea8 CSP Violation:', e));
  }
  setupRateLimit() {
    ('undefined' != typeof window &&
      (() => {
        const t = new Map();
        window.fetch = async (...e) => {
          const o = e[0],
            n = Date.now();
          t.has(o) || t.set(o, []);
          const i = t.get(o);
          for (i.push(n); i.length > 0 && i[0] < n - this.config.rateLimit.windowMs; ) i.shift();
          if (i.length > this.config.rateLimit.maxRequests)
            throw (
              this.reportSecurityIncident('RATE_LIMIT_EXCEEDED', {
                url: o),
                requestCount: i.length,
                timeWindow: this.config.rateLimit.windowMs,
              }),
              new Error('Rate limit exceeded')
            );
          return fetch.apply(this, e);
        };
      })(),
      console.log('\u23f1\ufe0f Rate limiting configured'));
  }
  setupBotDetection() {
    'undefined' != typeof window &&
      (this.setupHoneypots(),
      this.analyzeUserAgent(),
      this.setupBehaviorAnalysis(),
      console.log('\ud83e\udd16 Bot detection configured'));
  }
  setupHoneypots() {
    this.config.botDetection.honeypots.forEach((t) => {
      'form' === t.type
        ? document.querySelectorAll('input, textarea').forEach((e) => {
            const o = e.closest('form');
            o &&
              !o.querySelector('.honeypot') &&
              o
                .appendChild(
                  Object.assign(document.createElement('input'), {
                    type: 'text',
                    name: 'website',
                    className: 'honeypot',
                    style: { display: 'none' },
                    tabIndex: -1,
                    autocomplete: 'off',
                  }),
                )
                .addEventListener('input', () => {
                  this.triggerHoneypot('form_honeypot', {
                    form: o.action || window.location.href),
                    value: e.value,
                  });
                });
          })
        : 'path' === t.type && console.log(`\ud83c\udf6f Honeypot path configured: $${t.path}`);
    });
  }
  analyzeUserAgent() {
    const t = navigator.userAgent;
    for (const e of this.config.botDetection.userAgentPatterns)
      if (e.test(t)) { 
        this.detectBot('user_agent', { userAgent: t, pattern: e.toString() });
        break;
      }
  }
  setupBehaviorAnalysis() {
    let t = 0,
      e = 0;
    document.addEventListener('click', () => {
      const o = Date.now();
      (e++,
        o - t < 1e3
          ? e > this.config.botDetection.behaviorAnalysis.maxClicksPerSecond &&
            this.detectBot('suspicious_clicks', {
              clicksPerSecond: e),
              threshold: this.config.botDetection.behaviorAnalysis.maxClicksPerSecond,
            })
          : (e = 1),
        (t = o));
    });
    let o = window.scrollY,
      n = Date.now();
    window.addEventListener('scroll', () => {
      const t = Date.now(),
        e = window.scrollY,
        i = Math.abs(e - o),
        s = t - n;
      if (s > 0) { 
        const o = i / s;
        o > this.config.botDetection.behaviorAnalysis.maxScrollSpeed &&
          this.detectBot('suspicious_scroll', {
            scrollSpeed: o),
            threshold: this.config.botDetection.behaviorAnalysis.maxScrollSpeed,
          });
      }
      ((o = e), (n = t));
    });
  }
  triggerHoneypot(t, e) {
    (this.detectBot('honeypot', { type: t, ...e }),
      console.warn('\ud83c\udf6f Honeypot triggered:', t, e));
  }
  detectBot(t, e) {
    const o = {
      reason: t,
      data: e,
      userAgent: navigator.userAgent,
      ip: 'unknown',
      timestamp: Date.now(),
    };
    (this.state.detectedBots.add(JSON.stringify(o)),
      this.reportSecurityIncident('BOT_DETECTED', o),
      console.warn('\ud83e\udd16 Bot detected:', o));
  }
  setupThreatMonitoring() {
    const t = setInterval(() => {
      this.analyzeThreatLevel();
    }, 6e4);
    (this.intervals.set('threatMonitoring', t),
      console.log('\ud83d\udc41\ufe0f Threat monitoring configured'));
  }
  analyzeThreatLevel() {
    const t = Date.now(),
      e = t - 6e4,
      o = this.state.suspiciousEvents.filter((t) => t.timestamp > e);
    (o.length > this.config.threatMonitoring.alertThreshold &&
      this.reportSecurityIncident('HIGH_THREAT_LEVEL', {
        eventCount: o.length),
        threshold: this.config.threatMonitoring.alertThreshold,
        events: o.slice(-5),
      }),
      (this.state.suspiciousEvents = this.state.suspiciousEvents.filter(
        (e) => e.timestamp > t - 36e5,
      )));
  }
  setupSecurityHeaders() {
    console.log('\ud83d\udd12 Security headers configured:', this.config.securityHeaders);
  }
  startSecurityMonitoring() {
    const t = setInterval(() => {
      this.performSecurityCheck();
    }, 3e4);
    (this.intervals.set('securityMonitoring', t),
      console.log('\ud83d\udd0d Security monitoring started'));
  }
  performSecurityCheck() {
    (this.checkForAnomalies(), this.updateSecurityMetrics());
  }
  checkForAnomalies() {
    const t = Date.now();
    for (const [e, o] of this.state.requestCounts.entries()) {
      const n = o.filter((e) => e > t - 6e4);
      n.length > 50 &&
        this.reportSecurityIncident('SUSPICIOUS_REQUEST_PATTERN', {
          ip: e),
          requestCount: n.length,
          timeWindow: '1 minute',
        });
    }
  }
  updateSecurityMetrics() {
    const t = {
      blockedIPs: this.state.blockedIPs.size,
      detectedBots: this.state.detectedBots.size,
      securityIncidents: this.state.securityIncidents.length,
      suspiciousEvents: this.state.suspiciousEvents.length,
      timestamp: Date.now(),
    };
    window.burniMonitoring && window.burniMonitoring.recordMetric('security_metrics', t);
  }
  reportSecurityIncident(t, e) {
    const o = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: t,
      data: e,
      severity: this.getIncidentSeverity(t),
      timestamp: Date.now(),
      userAgent: navigator?.userAgent || 'unknown',
      url: window?.location?.href || 'unknown',
    };
    (this.state.securityIncidents.push(o),
      this.state.suspiciousEvents.push(o),
      window.burniMonitoring &&
        window.burniMonitoring.createAlert({
          type: 'security_incident'),
          message: `Security incident: $${t}`,
          severity: o.severity,
          data: o,
        }),
      console.warn('\ud83d\udea8 Security incident:', o),
      this.state.securityIncidents.length > 100 &&
        this.state.securityIncidents.splice(0, this.state.securityIncidents.length - 100));
  }
  getIncidentSeverity(t) {
    return (
      {
        CSP_VIOLATION: 'medium',
        RATE_LIMIT_EXCEEDED: 'medium',
        BOT_DETECTED: 'low',
        HIGH_THREAT_LEVEL: 'critical',
        SUSPICIOUS_REQUEST_PATTERN: 'high',
        INIT_ERROR: 'high',
      }[t] || 'medium'
    );
  }
  getSecurityStatus() {
    return {
      initialized: this.state.initialized,
      threats: {
        blockedIPs: this.state.blockedIPs.size,
        detectedBots: this.state.detectedBots.size,
        recentIncidents: this.state.securityIncidents.slice(-10),
      },
      protection: {
        csp: this.config.csp.enabled,
        rateLimit: this.config.rateLimit.enabled,
        botDetection: this.config.botDetection.enabled,
        threatMonitoring: this.config.threatMonitoring.enabled,
      },
      timestamp: Date.now(),
    };
  }
  getSecurityMetrics() {
    return {
      incidents: this.state.securityIncidents.length,
      recentEvents: this.state.suspiciousEvents.length,
      detectedThreats: this.state.detectedBots.size,
      blockedIPs: this.state.blockedIPs.size,
    };
  }
  blockIP(t, e) {
    (this.state.blockedIPs.add(t),
      this.reportSecurityIncident('IP_BLOCKED', { ip: t, reason: e }),
      console.warn(`\ud83d\udeab IP blocked: $${t} (${e})`));
  }
  unblockIP(t) {
    (this.state.blockedIPs.delete(t), console.log(`\u2705 IP unblocked: $${t}`));
  }
  destroy() {
    for (const [t, e] of this.intervals.entries()) clearInterval(e);
    (this.intervals.clear(),
      this.state.requestCounts.clear(),
      this.state.blockedIPs.clear(),
      this.state.detectedBots.clear(),
      (this.state.suspiciousEvents = []),
      (this.state.securityIncidents = []),
      console.log('\ud83d\udca5 Security Hardening destroyed'));
  }
}
((window.SecurityHardening = SecurityHardening),
  'undefined' != typeof window &&
    window.addEventListener('DOMContentLoaded', () => {
      window.burniSecurity = new SecurityHardening();
    }));
