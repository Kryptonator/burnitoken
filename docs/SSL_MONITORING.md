# SSL Certificate Monitoring Documentation

## Overview

This documentation describes the SSL certificate expiration monitoring system implemented to address critical SSL certificate expiration issues.

## Features

### 🔐 SSL Certificate Expiration Detection

The system monitors SSL certificates and detects:

- **Expired certificates** - Certificates that have already expired
- **Expiring certificates** - Certificates expiring within 7 days
- **Valid certificates** - Certificates with sufficient validity period

### 🚨 Error Codes

The monitoring system emits specific error codes for automation:

- `E_SSL_CERT_EXPIRED` - SSL certificate has expired
- `E_SSL_CERT_EXPIRING_SOON` - SSL certificate expires within threshold
- `E_SSL_CERT_CHECK_FAILED` - Unable to check SSL certificate
- `E_HTTPS_CONNECTIVITY_FAILED` - HTTPS connection failed
- `E_SLOW_RESPONSE_TIME` - Website response time is too slow

### 📊 JSON Output Format

For automated monitoring systems, the tool outputs structured JSON alerts:

```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-06-26T12:11:21.456Z",
  "details": "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.",
  "expiredDays": 2,
  "certificate": {
    "validFrom": "Jun 24 00:00:00 2024 GMT",
    "validTo": "Tue, 24 Jun 2025 00:00:00 GMT",
    "issuer": "CN=Let's Encrypt Authority X3",
    "subject": "CN=burnitoken.com"
  }
}
```

## Usage

### Command Line

```bash
# Run health check for burnitoken.com
npm run health:check

# Run SSL expiration tests
npm run health:test
```

### Direct Node.js Usage

```javascript
const WebsiteHealthCheck = require('./tools/website-health-check.js');

const healthCheck = new WebsiteHealthCheck();
await healthCheck.runHealthCheck();
```

### Custom Domain

```javascript
const healthCheck = new WebsiteHealthCheck();
healthCheck.domain = 'your-domain.com';
await healthCheck.runHealthCheck();
```

## Enhanced Monitoring Tools

### DNS Migration Monitor

The existing `tools/monitoring/dns-migration-monitor.js` has been enhanced to include SSL expiration checking during migration monitoring.

### DNS Status Checker

The `tools/monitoring/dns-status-checker.js` now includes detailed SSL certificate expiration information.

## Configuration

### Alert Threshold

The default alert threshold is 7 days. Certificates expiring within this period will trigger warnings:

```javascript
const healthCheck = new WebsiteHealthCheck();
healthCheck.alertThresholdDays = 14; // Custom threshold
```

### Timeout Settings

SSL checks have a 10-second timeout by default:

```javascript
// Timeout is configurable in the OpenSSL commands
const timeout = 10000; // 10 seconds
```

## Testing

### Unit Tests

Comprehensive unit tests are available in `tests/ssl-monitoring.test.js`:

```bash
npm test -- tests/ssl-monitoring.test.js
```

### Integration Tests

Run the full SSL expiration test suite:

```bash
npm run health:test
```

## Integration with Existing Systems

### Automated Monitoring

The JSON output format allows easy integration with monitoring systems:

```bash
# Example: Check SSL and pipe to monitoring system
npm run health:check | grep "E_SSL_CERT_EXPIRED" | your-monitoring-system
```

### CI/CD Integration

Add SSL monitoring to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: SSL Health Check
  run: npm run health:check
```

### Alert Integration

The structured error output can be integrated with alerting systems like:

- Email notifications
- Slack/Discord webhooks
- PagerDuty
- Custom monitoring dashboards

## Troubleshooting

### Common Issues

1. **Network connectivity** - Ensure the domain is accessible
2. **Firewall restrictions** - Port 443 must be accessible
3. **Certificate validation** - Invalid certificates will trigger errors

### Debug Mode

Enable verbose logging for troubleshooting:

```javascript
const healthCheck = new WebsiteHealthCheck();
// Detailed console output is provided by default
await healthCheck.runHealthCheck();
```

## Security Considerations

- The tool checks certificates but doesn't validate chain of trust by default
- Uses `rejectUnauthorized: false` for expired certificate inspection
- Only connects to retrieve certificate information, no sensitive data is transmitted

## Future Enhancements

Planned improvements include:

- Multi-domain monitoring
- Certificate chain validation
- Integration with certificate renewal systems
- Webhook notifications
- Dashboard integration
- Historical certificate tracking