# 🔐 SSL Certificate Health Monitoring System

## Overview

This document describes the SSL certificate health monitoring system implemented to detect and report SSL certificate expiration issues for the burnitoken.com website.

## Problem Statement

The automated monitoring system detected that the SSL certificate for burnitoken.com expired on 2025-06-24, generating the following error:

```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-07-03T15:17:47.484Z",
  "details": "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen."
}
```

## Solution Implementation

### 1. Website Health Check Tool (`tools/website-health-check.js`)

A comprehensive Node.js tool that monitors SSL certificates and website accessibility for multiple domains.

**Key Features:**
- SSL certificate expiration detection
- Multi-domain monitoring (burnitoken.com, burnitoken.website)
- Structured error reporting in JSON format
- Website accessibility testing
- Configurable warning thresholds (7 days critical, 30 days warning)
- Test mode for simulating SSL expiration scenarios

**Usage:**
```bash
# Production health check
npm run health:check
node tools/website-health-check.js

# Test mode (simulates SSL expiration)
npm run health:test
node tools/website-health-check.js --test
```

### 2. Error Report Format

The tool generates structured error reports matching the original issue format:

```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-07-04T10:33:40.457Z",
  "details": "Das SSL-Zertifikat ist am 24.6.2025 abgelaufen.",
  "severity": "CRITICAL",
  "expirationDate": "2025-06-24T23:59:59.000Z",
  "daysExpired": 10
}
```

**Error Codes:**
- `E_SSL_CERT_EXPIRED` - Certificate has expired
- `E_SSL_CERT_EXPIRING_SOON` - Certificate expires within threshold

### 3. GitHub Actions Workflow (`.github/workflows/ssl-monitoring.yml`)

Automated SSL monitoring that runs daily and creates issues when problems are detected.

**Features:**
- Daily scheduled monitoring (09:00 UTC)
- Manual trigger with test mode option
- Automatic GitHub issue creation for SSL problems
- Report artifacts upload
- Duplicate issue prevention

**Workflow Triggers:**
- `schedule`: Daily at 09:00 UTC
- `workflow_dispatch`: Manual trigger with test mode option

### 4. Comprehensive Monitoring

The system monitors:
- **SSL Certificate Status**: Expiration dates, issuer information, validity
- **Website Accessibility**: HTTP response codes, response times
- **DNS Resolution**: Domain name resolution status
- **Multiple Domains**: burnitoken.com and burnitoken.website

### 5. Alert Thresholds

- **Critical (7 days)**: SSL certificate expires within 7 days
- **Warning (30 days)**: SSL certificate expires within 30 days
- **Expired**: SSL certificate has already expired

## File Structure

```
tools/
├── website-health-check.js     # Main monitoring tool
└── reports/                    # Generated health reports
    └── website-health-*.json   # Timestamped reports

.github/workflows/
└── ssl-monitoring.yml          # GitHub Actions workflow

tests/
└── website-health-check.test.js # Unit tests

package.json                    # NPM scripts configuration
```

## NPM Scripts

```json
{
  "health:check": "node tools/website-health-check.js",
  "health:test": "node tools/website-health-check.js --test"
}
```

## Testing

### Manual Testing

```bash
# Test SSL expiration scenario
npm run health:test

# Test production monitoring
npm run health:check
```

### Unit Tests

```bash
npm test tests/website-health-check.test.js
```

## Integration

### GitHub Actions Integration

The workflow automatically:
1. Runs daily SSL certificate checks
2. Creates GitHub issues for expired/expiring certificates
3. Uploads detailed reports as artifacts
4. Prevents duplicate issue creation

### Example GitHub Issue Creation

When an SSL certificate expires, the system automatically creates a GitHub issue with:
- **Title**: "🤖 [Automatisch gemeldet] Test: Kritisches SSL-Zertifikat abgelaufen"
- **Labels**: `ssl-monitoring`, `automated`, `critical`
- **Body**: Detailed error information and context

## Error Handling

The system handles various failure scenarios:
- DNS resolution failures
- Connection timeouts
- SSL handshake failures
- Certificate parsing errors
- Network connectivity issues

## Reports

Health check reports are saved in `tools/reports/` with:
- Timestamp information
- Domain-specific results
- SSL certificate details
- Accessibility status
- Error summaries
- Overall health status

## Monitoring Best Practices

1. **Regular Monitoring**: The system runs daily checks
2. **Proactive Alerts**: Warns 30 days before expiration
3. **Critical Alerts**: Alerts 7 days before expiration
4. **Immediate Action**: Creates issues for expired certificates
5. **Comprehensive Logging**: Detailed reports for troubleshooting

## Troubleshooting

### Common Issues

1. **DNS Resolution Failures**
   - Check domain configuration
   - Verify DNS propagation

2. **SSL Connection Failures**
   - Verify certificate installation
   - Check SSL configuration

3. **Certificate Parsing Errors**
   - Validate certificate format
   - Check OpenSSL compatibility

### Debug Mode

Use test mode to simulate SSL expiration:
```bash
npm run health:test
```

This helps verify the monitoring system without waiting for actual certificate expiration.

## Security Considerations

- SSL certificates should be renewed before expiration
- Monitor multiple domains for comprehensive coverage
- Use Let's Encrypt or similar automated certificate providers
- Implement certificate auto-renewal where possible

## Conclusion

This SSL monitoring system provides comprehensive, automated detection of SSL certificate issues with:
- Proactive monitoring and alerts
- Structured error reporting
- GitHub integration for issue tracking
- Detailed health reports
- Test capabilities for validation

The system successfully detects the SSL certificate expiration issue described in the original GitHub issue and provides actionable alerts for prompt resolution.