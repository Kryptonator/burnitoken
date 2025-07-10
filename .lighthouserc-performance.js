// .lighthouserc-performance.js
// Strict performance configuration for BurniToken production optimization

module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8080'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
        skipAudits: [
          'uses-http2', // May not be available in all environments
          'redirects-http', // Depends on server configuration
        ],
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false
        },
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      assertions: {
        // Performance metrics - strict production requirements
        'categories:performance': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        
        // Accessibility - WCAG 2.1 AA compliance
        'categories:accessibility': ['error', { minScore: 0.98 }],
        'color-contrast': ['error', { minScore: 1 }],
        'heading-order': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        'button-name': ['error', { minScore: 1 }],
        'aria-allowed-attr': ['error', { minScore: 1 }],
        'aria-required-attr': ['error', { minScore: 1 }],
        'aria-valid-attr-value': ['error', { minScore: 1 }],
        'aria-valid-attr': ['error', { minScore: 1 }],
        'duplicate-id-aria': ['error', { minScore: 1 }],
        'duplicate-id-active': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'valid-lang': ['error', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        
        // SEO optimization
        'categories:seo': ['error', { minScore: 0.98 }],
        'document-title': ['error', { minScore: 1 }],
        'meta-description': ['error', { minScore: 1 }],
        'canonical': ['error', { minScore: 1 }],
        'hreflang': ['warn', { minScore: 0.8 }],
        'robots-txt': ['warn', { minScore: 0.8 }],
        'image-alt': ['error', { minScore: 1 }],
        'structured-data': ['warn', { minScore: 0.8 }],
        
        // Best practices
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'uses-https': ['error', { minScore: 1 }],
        'is-on-https': ['error', { minScore: 1 }],
        'no-vulnerable-libraries': ['error', { minScore: 1 }],
        'errors-in-console': ['warn', { maxLength: 0 }],
        
        // Progressive Web App features
        'installable-manifest': ['warn', { minScore: 1 }],
        'service-worker': ['error', { minScore: 1 }],
        'themed-omnibox': ['warn', { minScore: 1 }],
        'content-width': ['error', { minScore: 1 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxLength: 3 }],
        'unused-javascript': ['warn', { maxLength: 3 }],
        'modern-image-formats': ['error', { minScore: 0.9 }],
        'efficiently-encode-images': ['error', { minScore: 0.9 }],
        'offscreen-images': ['error', { minScore: 0.9 }],
        'render-blocking-resources': ['error', { maxLength: 2 }],
        'unminified-css': ['error', { minScore: 1 }],
        'unminified-javascript': ['error', { minScore: 1 }],
        
        // Font optimization
        'font-display': ['error', { minScore: 1 }],
        'preload-fonts': ['warn', { minScore: 0.8 }],
        
        // Network efficiency
        'uses-text-compression': ['error', { minScore: 1 }],
        'uses-rel-preconnect': ['warn', { minScore: 0.8 }],
        'uses-rel-preload': ['warn', { minScore: 0.8 }],
        'efficient-animated-content': ['warn', { minScore: 0.8 }],
        
        // Third-party optimization
        'third-party-summary': ['warn', { maxNumericValue: 500 }],
        'third-party-facades': ['warn', { minScore: 0.8 }],
        
        // Security
        'csp-xss': ['warn', { minScore: 0.8 }],
        'external-anchors-use-rel-noopener': ['error', { minScore: 1 }],
        
        // Mobile optimization (for responsive testing)
        'tap-targets': ['error', { minScore: 1 }],
        'viewport': ['error', { minScore: 1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage',
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      githubToken: process.env.GITHUB_TOKEN
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db'
      }
    }
  }
};