# Website Health Check System

This document describes the SSL certificate monitoring system implemented to address expired certificate issues.

## Overview

The `tools/website-health-check.js` script monitors SSL certificate expiration for critical domains and generates alerts when certificates are expired or expiring soon.

## Features

- **SSL Certificate Monitoring**: Checks certificate expiration dates for multiple domains
- **Early Warning System**: Alerts when certificates expire within 30 days
- **Automatic Error Reporting**: Generates structured error reports in JSON format
- **Domain Health Checks**: Includes connectivity testing alongside SSL monitoring
- **Test Scenarios**: Built-in test modes for development and CI/CD

## Usage

### Regular Health Check
```bash
npm run health:check
# or
node tools/website-health-check.js
```

### Test Scenarios
```bash
# Test expired certificate scenario
npm run health:test-expired

# Test certificate expiring soon scenario  
npm run health:test-expiring
```

## Monitored Domains

- `burnitoken.com` - Primary domain
- `burnitoken.website` - Secondary domain

## Error Codes

- `E_SSL_CERT_EXPIRED` - Certificate has already expired (critical)
- `E_SSL_CERT_EXPIRING_SOON` - Certificate expires within 30 days (warning)

## Error Report Format

```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-06-28T19:23:14.484Z",
  "details": "Das SSL-Zertifikat ist am 24.6.2025 abgelaufen."
}
```

## Integration

### CI/CD Integration
Add to your CI/CD pipeline:
```yaml
- name: Check SSL Certificates
  run: npm run health:check
```

### Monitoring Integration
The script exits with:
- `0` - All checks passed
- `1` - Critical issues detected (expired certificates)

## Testing

Run the test suite:
```bash
npx jest tests/website-health-check.test.js
```

## Configuration

Edit `tools/website-health-check.js` to:
- Add/remove monitored domains
- Adjust warning threshold (default: 30 days)
- Modify error reporting format

## Troubleshooting

### DNS Resolution Issues
If domains can't be resolved, the script will report connection errors but continue checking other domains.

### OpenSSL vs Node.js TLS
The implementation uses Node.js built-in TLS module for reliability instead of external OpenSSL commands.

### Network Connectivity
The script handles network timeouts and connection failures gracefully, reporting them as errors without crashing.