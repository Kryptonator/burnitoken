// Advanced Security Monitoring for Burni Token Website
class SecurityMonitor {
  constructor() {
    this.securityEvents = [];
    this.threats = [];
    this.securityLevel = 'normal'; // normal, elevated, high
    this.maxEvents = 100;

    this.init();
  }

  init() {
    this.setupContentSecurityPolicy();
    this.monitorDOMManipulation();
    this.trackSuspiciousActivity();
    this.monitorNetworkRequests();
    this.setupSecurityDashboard();
    this.initRealTimeProtection();
  }

  setupContentSecurityPolicy() {
    // Monitor CSP violations
    document.addEventListener('securitypolicyviolation', (e) => {
      this.logSecurityEvent(
        'csp_violation',
        {
          directive: e.violatedDirective,
          blockedURI: e.blockedURI,
          documentURI: e.documentURI,
          lineNumber: e.lineNumber,
          columnNumber: e.columnNumber,
        },
        'high',
      );
    });
  }

  monitorDOMManipulation() {
    // Monitor for suspicious DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.analyzeNewElement(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  analyzeNewElement(element) {
    const suspiciousPatterns = [
      // Suspicious script injections
      /javascript:/i,
      /eval\(/i,
      /innerHTML\s*=/i,
      /document\.write/i,

      // Phishing indicators
      /login|password|credit.*card|social.*security/i,

      // Cryptocurrency scams
      /send.*bitcoin|ethereum.*wallet|private.*key/i,
    ];

    const elementHTML = element.outerHTML || '';
    const elementText = element.textContent || '';

    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(elementHTML) || pattern.test(elementText)) {
        this.logSecurityEvent(
          'suspicious_dom_injection',
          {
            pattern: pattern.toString(),
            element: elementHTML.substring(0, 200),
            text: elementText.substring(0, 100),
          },
          'high',
        );
      }
    });

    // Check for external script sources
    if (element.tagName === 'SCRIPT' && element.src) {
      const allowedDomains = [
        'cdn.jsdelivr.net',
        'cdnjs.cloudflare.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        location.hostname,
      ];

      const scriptDomain = new URL(element.src).hostname;
      if (!allowedDomains.includes(scriptDomain)) {
        this.logSecurityEvent(
          'unauthorized_script',
          {
            src: element.src,
            domain: scriptDomain,
          },
          'high',
        );
      }
    }
  }

  trackSuspiciousActivity() {
    let rapidClicks = 0;
    let rapidClickTimer = null;

    // Monitor rapid clicking (potential bot activity)
    document.addEventListener('click', () => {
      rapidClicks++;

      if (rapidClickTimer) clearTimeout(rapidClickTimer);

      rapidClickTimer = setTimeout(() => {
        if (rapidClicks > 20) {
          this.logSecurityEvent(
            'rapid_clicking',
            {
              clickCount: rapidClicks,
              timeWindow: '5s',
            },
            'medium',
          );
        }
        rapidClicks = 0;
      }, 5000);
    });

    // Monitor console access (potential developer tools usage)
    let consoleAccessCount = 0;
    const originalLog = console.log;
    console.log = (...args) => {
      consoleAccessCount++;
      if (consoleAccessCount > 10) {
        this.logSecurityEvent(
          'console_access',
          {
            accessCount: consoleAccessCount,
          },
          'low',
        );
      }
      return originalLog.apply(console, args);
    };

    // Monitor for copy/paste of sensitive data
    document.addEventListener('paste', (e) => {
      const pastedText = e.clipboardData.getData('text');
      if (this.containsSensitiveData(pastedText)) {
        this.logSecurityEvent(
          'sensitive_data_paste',
          {
            length: pastedText.length,
            preview: pastedText.substring(0, 20) + '...',
          },
          'medium',
        );
      }
    });

    // Monitor keyboard shortcuts that might indicate automated tools
    document.addEventListener('keydown', (e) => {
      const suspiciousShortcuts = [
        { ctrl: true, shift: true, key: 'I' }, // Dev tools
        { ctrl: true, shift: true, key: 'J' }, // Console
        { key: 'F12' }, // Dev tools
      ];

      if (
        suspiciousShortcuts.some(
          (shortcut) =>
            e.ctrlKey === !!shortcut.ctrl &&
            e.shiftKey === !!shortcut.shift &&
            e.key === shortcut.key,
        )
      ) {
        this.logSecurityEvent(
          'dev_tools_shortcut',
          {
            key: e.key,
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
          },
          'low',
        );
      }
    });
  }

  monitorNetworkRequests() {
    // Override fetch to monitor outgoing requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];

      // Check for requests to suspicious domains
      if (typeof url === 'string') {
        const domain = new URL(url, location.origin).hostname;
        if (this.isSuspiciousDomain(domain)) {
          this.logSecurityEvent(
            'suspicious_network_request',
            {
              url: url,
              domain: domain,
            },
            'high',
          );
        }
      }

      return originalFetch.apply(window, args);
    };

    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      if (typeof url === 'string') {
        const domain = new URL(url, location.origin).hostname;
        if (window.securityMonitor.isSuspiciousDomain(domain)) {
          window.securityMonitor.logSecurityEvent(
            'suspicious_xhr_request',
            {
              method: method,
              url: url,
              domain: domain,
            },
            'high',
          );
        }
      }
      return originalXHROpen.apply(this, [method, url, ...args]);
    };
  }

  containsSensitiveData(text) {
    const sensitivePatterns = [
      /\b[0-9]{16}\b/, // Credit card numbers
      /\b[A-Za-z0-9]{64}\b/, // Crypto private keys
      /password\s*[:=]\s*\S+/i,
      /api[_\s]*key\s*[:=]\s*\S+/i,
    ];

    return sensitivePatterns.some((pattern) => pattern.test(text));
  }

  isSuspiciousDomain(domain) {
    const suspiciousDomains = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl'];

    const suspiciousPatterns = [/burni.*fake/i, /.*phishing/i, /.*scam/i];

    return (
      suspiciousDomains.includes(domain) ||
      suspiciousPatterns.some((pattern) => pattern.test(domain))
    );
  }

  logSecurityEvent(type, details, severity = 'low') {
    const event = {
      id: Date.now() + Math.random(),
      type,
      details,
      severity,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: location.href,
    };

    this.securityEvents.push(event);

    // Keep only recent events
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents = this.securityEvents.slice(-this.maxEvents);
    }

    // Update security level
    this.updateSecurityLevel();

    // Handle high severity events immediately
    if (severity === 'high') {
      this.handleHighSeverityEvent(event);
    }

    // Update dashboard if visible
    this.updateSecurityDashboard();

    console.warn('Security Event:', event);
  }

  updateSecurityLevel() {
    const recentEvents = this.securityEvents.filter(
      (event) => Date.now() - event.timestamp < 300000, // Last 5 minutes
    );

    const highSeverityCount = recentEvents.filter((e) => e.severity === 'high').length;
    const mediumSeverityCount = recentEvents.filter((e) => e.severity === 'medium').length;

    if (highSeverityCount >= 3 || (highSeverityCount >= 1 && mediumSeverityCount >= 3)) {
      this.securityLevel = 'high';
    } else if (highSeverityCount >= 1 || mediumSeverityCount >= 2) {
      this.securityLevel = 'elevated';
    } else {
      this.securityLevel = 'normal';
    }
  }

  handleHighSeverityEvent(event) {
    // Create threat assessment
    const threat = {
      id: event.id,
      type: event.type,
      severity: 'high',
      timestamp: event.timestamp,
      mitigation: this.getMitigationStrategy(event.type),
      status: 'active',
    };

    this.threats.push(threat);

    // Show security alert
    this.showSecurityAlert(event);

    // Auto-mitigation for certain threats
    this.applyAutoMitigation(event);
  }

  getMitigationStrategy(threatType) {
    const strategies = {
      csp_violation: 'Review and update Content Security Policy',
      suspicious_dom_injection: 'Scan for XSS vulnerabilities',
      unauthorized_script: 'Block external script and review source',
      suspicious_network_request: 'Block request and scan for malware',
      sensitive_data_paste: 'Clear clipboard and warn user',
    };

    return strategies[threatType] || 'Manual review required';
  }

  applyAutoMitigation(event) {
    switch (event.type) {
      case 'unauthorized_script':
        // Remove the script element if it exists
        const scripts = document.querySelectorAll(`script[src="${event.details.src}"]`);
        scripts.forEach((script) => script.remove());
        break;

      case 'sensitive_data_paste':
        // Clear sensitive data from memory
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
        break;
    }
  }

  showSecurityAlert(event) {
    const alert = document.createElement('div');
    alert.className =
      'fixed top-4 right-4 bg-red-100 border border-red-400 rounded-lg p-4 w-80 z-50 shadow-lg';
    alert.innerHTML = `
      <div class="flex items-start space-x-2">
        <span class="text-red-600 text-xl">🚨</span>
        <div class="flex-1">
          <div class="font-semibold text-red-800">Security Alert</div>
          <div class="text-sm text-red-700">${this.getEventDescription(event)}</div>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">
            Dismiss
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(alert);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (alert.parentElement) {
        alert.remove();
      }
    }, 10000);
  }

  getEventDescription(event) {
    const descriptions = {
      csp_violation: 'Content Security Policy violation detected',
      suspicious_dom_injection: 'Suspicious content injection attempt',
      unauthorized_script: 'Unauthorized external script blocked',
      suspicious_network_request: 'Suspicious network request blocked',
      sensitive_data_paste: 'Sensitive data pasted - clipboard cleared',
    };

    return descriptions[event.type] || 'Security event detected';
  }

  setupSecurityDashboard() {
    const dashboardHTML = `
      <div id="security-dashboard" class="fixed top-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg w-80 z-40 hidden">
        <div class="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-t-lg">
          <div class="flex justify-between items-center">
            <h3 class="font-bold">🛡️ Security Monitor</h3>
            <button id="toggle-security-dashboard" class="text-white hover:text-gray-200">−</button>
          </div>
        </div>
        
        <div id="security-dashboard-content" class="p-4 max-h-96 overflow-y-auto">
          <!-- Security Level -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="font-semibold">Security Level:</span>
              <span id="security-level-indicator" class="px-2 py-1 rounded text-sm font-semibold">Normal</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div id="security-level-bar" class="bg-green-500 h-2 rounded-full transition-all" style="width: 33%"></div>
            </div>
          </div>

          <!-- Recent Events -->
          <div class="mb-4">
            <h4 class="font-semibold mb-2">Recent Events</h4>
            <div id="recent-events" class="space-y-1 max-h-40 overflow-y-auto">
              <!-- Events will be populated here -->
            </div>
          </div>

          <!-- Active Threats -->
          <div class="mb-4">
            <h4 class="font-semibold mb-2">Active Threats</h4>
            <div id="active-threats" class="space-y-1">
              <!-- Threats will be populated here -->
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2">
            <button id="export-security-log" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Export Log</button>
            <button id="clear-security-log" class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">Clear</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dashboardHTML);
    this.setupDashboardEventListeners();
  }

  setupDashboardEventListeners() {
    document.getElementById('toggle-security-dashboard').addEventListener('click', () => {
      const content = document.getElementById('security-dashboard-content');
      const button = document.getElementById('toggle-security-dashboard');
      if (content.style.display === 'none') {
        content.style.display = 'block';
        button.textContent = '−';
      } else {
        content.style.display = 'none';
        button.textContent = '+';
      }
    });

    document.getElementById('export-security-log').addEventListener('click', () => {
      this.exportSecurityLog();
    });

    document.getElementById('clear-security-log').addEventListener('click', () => {
      this.clearSecurityLog();
    });
  }

  updateSecurityDashboard() {
    const dashboard = document.getElementById('security-dashboard');
    if (!dashboard || dashboard.classList.contains('hidden')) return;

    // Update security level indicator
    const levelIndicator = document.getElementById('security-level-indicator');
    const levelBar = document.getElementById('security-level-bar');

    if (levelIndicator && levelBar) {
      const levelConfig = {
        normal: {
          text: 'Normal',
          color: 'bg-green-500',
          width: '33%',
          class: 'bg-green-100 text-green-800',
        },
        elevated: {
          text: 'Elevated',
          color: 'bg-yellow-500',
          width: '66%',
          class: 'bg-yellow-100 text-yellow-800',
        },
        high: {
          text: 'High Risk',
          color: 'bg-red-500',
          width: '100%',
          class: 'bg-red-100 text-red-800',
        },
      };

      const config = levelConfig[this.securityLevel];
      levelIndicator.textContent = config.text;
      levelIndicator.className = `px-2 py-1 rounded text-sm font-semibold ${config.class}`;
      levelBar.className = `${config.color} h-2 rounded-full transition-all`;
      levelBar.style.width = config.width;
    }

    // Update recent events
    this.renderRecentEvents();
    this.renderActiveThreats();
  }

  renderRecentEvents() {
    const container = document.getElementById('recent-events');
    if (!container) return;

    const recentEvents = this.securityEvents.slice(-5).reverse();

    container.innerHTML =
      recentEvents
        .map((event) => {
          const severityColors = {
            low: 'text-blue-600',
            medium: 'text-yellow-600',
            high: 'text-red-600',
          };

          return `
        <div class="text-xs p-2 border rounded">
          <div class="flex justify-between">
            <span class="font-semibold ${severityColors[event.severity]}">${event.type}</span>
            <span class="text-gray-500">${new Date(event.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="text-gray-600">${event.severity} severity</div>
        </div>
      `;
        })
        .join('') || '<div class="text-gray-500 text-xs">No recent events</div>';
  }

  renderActiveThreats() {
    const container = document.getElementById('active-threats');
    if (!container) return;

    const activeThreats = this.threats.filter((threat) => threat.status === 'active');

    container.innerHTML =
      activeThreats
        .map(
          (threat) => `
      <div class="text-xs p-2 border border-red-200 rounded bg-red-50">
        <div class="flex justify-between">
          <span class="font-semibold text-red-800">${threat.type}</span>
          <button onclick="window.securityMonitor.resolveThread(${threat.id})" class="text-red-600 hover:text-red-800">Resolve</button>
        </div>
        <div class="text-red-600">${threat.mitigation}</div>
      </div>
    `,
        )
        .join('') || '<div class="text-gray-500 text-xs">No active threats</div>';
  }

  resolveThread(threatId) {
    const threat = this.threats.find((t) => t.id === threatId);
    if (threat) {
      threat.status = 'resolved';
      this.updateSecurityDashboard();
    }
  }

  exportSecurityLog() {
    const logData = {
      events: this.securityEvents,
      threats: this.threats,
      securityLevel: this.securityLevel,
      exportTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: location.href,
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearSecurityLog() {
    if (confirm('Are you sure you want to clear the security log?')) {
      this.securityEvents = [];
      this.threats = [];
      this.securityLevel = 'normal';
      this.updateSecurityDashboard();
    }
  }

  initRealTimeProtection() {
    // Monitor for common attack patterns
    setInterval(() => {
      this.scanForThreats();
    }, 30000); // Every 30 seconds

    // Monitor page integrity
    this.setupIntegrityChecking();
  }

  scanForThreats() {
    // Check for suspicious elements
    const suspiciousElements = document.querySelectorAll(
      '[onclick*="javascript:"], [onload], [onerror]',
    );
    if (suspiciousElements.length > 0) {
      this.logSecurityEvent(
        'suspicious_inline_handlers',
        {
          count: suspiciousElements.length,
        },
        'medium',
      );
    }

    // Check for modified critical elements
    const criticalElements = ['script[src*="main.js"]', 'script[src*="assets/"]'];
    criticalElements.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (
          element.dataset.securityHash &&
          this.calculateHash(element.outerHTML) !== element.dataset.securityHash
        ) {
          this.logSecurityEvent(
            'element_tampering',
            {
              selector,
              element: element.outerHTML.substring(0, 100),
            },
            'high',
          );
        }
      });
    });
  }

  setupIntegrityChecking() {
    // Add security hashes to critical elements
    const criticalElements = document.querySelectorAll(
      'script[src*="main.js"], script[src*="assets/"]',
    );
    criticalElements.forEach((element) => {
      element.dataset.securityHash = this.calculateHash(element.outerHTML);
    });
  }

  calculateHash(text) {
    // Simple hash function (in production, use a proper crypto library)
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Public method to show security dashboard
  showDashboard() {
    const dashboard = document.getElementById('security-dashboard');
    if (dashboard) {
      dashboard.classList.remove('hidden');
      this.updateSecurityDashboard();
    }
  }

  hideDashboard() {
    const dashboard = document.getElementById('security-dashboard');
    if (dashboard) {
      dashboard.classList.add('hidden');
    }
  }
}

// Initialize security monitor
window.securityMonitor = new SecurityMonitor();

// Keyboard shortcut to show security dashboard (Ctrl+Shift+S)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    const dashboard = document.getElementById('security-dashboard');
    if (dashboard.classList.contains('hidden')) {
      window.securityMonitor.showDashboard();
    } else {
      window.securityMonitor.hideDashboard();
    }
  }
});

export default SecurityMonitor;
