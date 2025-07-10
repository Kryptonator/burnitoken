# 🔐 SSL Certificate Monitoring System

This document describes the automated SSL certificate monitoring system implemented to detect and alert on SSL certificate issues.

## Overview

The SSL monitoring system automatically checks SSL certificates for the BurniToken websites and generates alerts when certificates are expired, expiring soon, or have other issues.

## Components

### 1. Website Health Check Tool (`tools/website-health-check.js`)

The main monitoring script that performs comprehensive SSL certificate and HTTPS connectivity checks.

**Features:**
- SSL certificate expiration detection
- Certificate validity verification
- HTTPS connectivity testing
- Automated error reporting with structured JSON output
- CLI interface with various options

**Usage:**
```bash
# Full health check for all domains
npm run health:check

# Check specific domain
node tools/website-health-check.js --domain burnitoken.com

# Set custom alert threshold (default: 7 days)
node tools/website-health-check.js --alert-days 14

# Critical alerts only (1 day threshold)
npm run health:check:critical
```

### 2. GitHub Actions Workflow (`.github/workflows/ssl-monitoring.yml`)

Automated monitoring that runs daily and on code changes.

**Features:**
- Daily scheduled SSL certificate checks
- Automatic issue creation for SSL problems
- Test execution for the monitoring system
- Report artifact storage

**Schedule:** Runs daily at 08:00 UTC

### 3. CI/CD Integration

SSL health checks are integrated into the main CI/CD pipeline to catch SSL issues during deployments.

## Error Codes and Meanings

| Error Code | Description | Severity |
|------------|-------------|----------|
| `E_SSL_CERT_EXPIRED` | SSL certificate has expired | Critical |
| `E_SSL_CERT_EXPIRING_SOON` | SSL certificate expires within threshold | Warning |
| `E_SSL_CERT_CHECK_FAILED` | Unable to check SSL certificate | Critical |
| `E_HTTPS_CONNECTION_FAILED` | HTTPS connection failed | Critical |

## Monitored Domains

- `burnitoken.com` - Primary domain
- `burnitoken.website` - Alternative domain

## Alert System

### Automatic Issue Creation

When SSL certificate problems are detected, the system automatically:

1. Creates a GitHub issue with detailed error information
2. Labels the issue appropriately (`ssl-monitoring`, `critical`, `automated`)
3. Includes JSON error details matching the format in issue reports
4. Provides recommended actions for resolution

### Example Alert Format

```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-06-27T16:15:14.819Z",
  "details": "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen."
}
```

## Manual Monitoring

### Run Immediate Check

```bash
# Quick health check
npm run health:check

# Critical issues only
npm run health:check:critical

# Check specific domain
node tools/website-health-check.js --domain burnitoken.com
```

### View Health Report

The system generates a detailed JSON report at `website-health-report.json` containing:
- Certificate expiration dates
- Connection status
- Detailed error information
- Summary statistics

## Troubleshooting SSL Issues

### Certificate Expired

1. **Immediate Action:** Renew the SSL certificate
2. **Check Certificate Authority:** Verify with Let's Encrypt or certificate provider
3. **Update DNS:** Ensure DNS settings are correct
4. **Test Connection:** Verify HTTPS connectivity after renewal

### Certificate Expiring Soon

1. **Schedule Renewal:** Plan certificate renewal before expiration
2. **Check Auto-Renewal:** Verify automatic renewal is configured
3. **Monitor Progress:** Track renewal process

### Connection Failed

1. **Check DNS:** Verify domain resolves correctly
2. **Check Server:** Ensure web server is running
3. **Check Firewall:** Verify port 443 is accessible
4. **Check Load Balancer:** Verify SSL termination configuration

## Testing

The monitoring system includes comprehensive tests:

```bash
# Run all SSL monitoring tests
npm test -- tests/website-health-check.test.js

# Test CLI functionality
node tools/website-health-check.js --help
```

## Configuration

### Alert Threshold

The default alert threshold is 7 days before expiration. This can be configured:

```bash
# Set to 14 days
node tools/website-health-check.js --alert-days 14
```

### Domains

Monitored domains are configured in the `WebsiteHealthChecker` class constructor:

```javascript
this.domains = [
  'burnitoken.com',
  'burnitoken.website'
];
```

## Integration with Existing Monitoring

This SSL monitoring system complements existing monitoring tools:

- **DNS Migration Monitor:** Focuses on DNS propagation
- **Website Connectivity Check:** Basic connectivity testing
- **Simple Browser Monitor:** Application-level testing

## Maintenance

### Regular Tasks

1. **Review Alert Thresholds:** Adjust based on certificate renewal frequency
2. **Update Domain List:** Add/remove domains as needed
3. **Check Report Storage:** Monitor GitHub Actions artifact retention
4. **Validate Test Coverage:** Ensure tests cover all scenarios

### Updates

When updating the monitoring system:

1. Update the main script (`tools/website-health-check.js`)
2. Update tests (`tests/website-health-check.test.js`)
3. Update GitHub Actions workflow if needed
4. Test changes with `npm run health:check`

## Security Considerations

- The monitoring tool does not store or transmit sensitive data
- SSL certificate information is only used for validation
- All network connections use proper timeouts
- Error handling prevents information disclosure

---

*This monitoring system was implemented to address issue #30 regarding SSL certificate expiration detection.*