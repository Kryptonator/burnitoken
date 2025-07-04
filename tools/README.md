# Tools Directory

This directory contains various monitoring and utility tools for the burnitoken project.

## Available Tools

### 🔐 website-health-check.js
**SSL Certificate and Website Health Monitoring**

Monitors SSL certificates for expiration and checks website accessibility.

```bash
# Production health check
npm run health:check
node tools/website-health-check.js

# Test mode (simulates SSL expiration)
npm run health:test
node tools/website-health-check.js --test
```

**Features:**
- SSL certificate expiration detection
- Multi-domain monitoring (burnitoken.com, burnitoken.website)
- Structured JSON error reporting
- Website accessibility testing
- Configurable alert thresholds

**Reports:** Generated in `tools/reports/` directory

### 📧 test-email-alert.js
**Email Alert System Testing**

Tests the email alert functionality.

```bash
npm run test:alert
npm run test:alert:dry
```

### 🔍 Other Tools

- `gsc-status-check.js` - Google Search Console status monitoring
- `lighthouse-check.js` - Lighthouse performance auditing
- `onpage-seo-check.js` - On-page SEO analysis

## Reports Directory

The `reports/` subdirectory contains generated monitoring reports:
- SSL certificate health reports
- Website accessibility reports
- Performance monitoring data

Reports are automatically archived and excluded from version control.