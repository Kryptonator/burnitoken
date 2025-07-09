# SSL Certificate Monitoring

This repository includes comprehensive SSL certificate monitoring to prevent certificate expiration issues and ensure website availability.

## Overview

The SSL monitoring system was implemented to address issue #17 where an SSL certificate for burnitoken.com expired on 2025-06-24. The system now provides:

- **SSL Certificate Expiration Detection**: Monitors certificates and alerts when they expire or will expire soon (within 30 days)
- **Website Availability Checking**: Verifies HTTPS connectivity and response times
- **Automated Error Reporting**: Generates standardized error reports in JSON format
- **GitHub Actions Integration**: Automatic daily monitoring with issue creation

## Tools

### 1. Website Health Check (`tools/website-health-check.js`)

Complete health monitoring tool that checks SSL certificates and website availability for all configured domains.

**Usage:**
```bash
node tools/website-health-check.js
```

**Features:**
- Checks SSL certificate expiration dates
- Monitors website availability and response times
- Generates comprehensive JSON reports
- Creates alerts for expired or expiring certificates
- Supports multiple domains

**Output Example:**
```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-06-25T10:27:09.783Z",
  "details": "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen."
}
```

### 2. Burnitoken SSL Checker (`tools/check-burnitoken-ssl.js`)

Focused SSL certificate checker specifically for burnitoken.com domain.

**Usage:**
```bash
node tools/check-burnitoken-ssl.js
```

**Features:**
- Quick SSL certificate status check for burnitoken.com
- Generates alerts in the same format as the monitoring system expects
- Lightweight tool for focused monitoring

## Error Codes

The monitoring system generates the following error codes:

- **`E_SSL_CERT_EXPIRED`**: SSL certificate has already expired
- **`E_SSL_CERT_EXPIRING_SOON`**: SSL certificate will expire within 30 days
- **`E_SSL_CHECK_FAILED`**: Unable to retrieve or parse SSL certificate information
- **`E_WEBSITE_UNAVAILABLE`**: Website is not accessible via HTTPS
- **`E_WEBSITE_TIMEOUT`**: Website request timed out

## Automated Monitoring

### GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/ssl-health-check.yml`) that:

- **Runs daily at 10:00 UTC** to check SSL certificate status
- **Can be triggered manually** via workflow dispatch
- **Creates GitHub issues** automatically when SSL problems are detected
- **Updates existing issues** with new monitoring data
- **Uploads reports** as artifacts for debugging

### Issue Creation

When SSL certificate issues are detected, the system automatically:

1. **Creates a new issue** with the `ssl-monitoring` label
2. **Includes detailed error information** in JSON format
3. **Provides recommended actions** for resolution
4. **Attaches full monitoring logs** for debugging

## Configuration

### Monitored Domains

Currently monitored domains (configurable in `tools/website-health-check.js`):
- `burnitoken.com`
- `burnitoken.website`

### Warning Threshold

Certificates that expire within **30 days** trigger expiring soon warnings.

### Timeout Settings

- **SSL checks**: 10 seconds
- **Website availability**: 10 seconds

## Manual Usage

### Check All Domains

```bash
# Run comprehensive health check
node tools/website-health-check.js

# Check the generated report
cat website-health-report.json
```

### Check Specific Domain

```bash
# Check only burnitoken.com
node tools/check-burnitoken-ssl.js
```

### Integration with Existing Monitoring

The tools can be integrated with existing monitoring tools in the `tools/monitoring/` directory by importing the `WebsiteHealthChecker` class:

```javascript
const WebsiteHealthChecker = require('../website-health-check.js');

const checker = new WebsiteHealthChecker();
const sslResult = await checker.checkSSLCertificate('burnitoken.com');
```

## Troubleshooting

### Common Issues

1. **Domain not resolving**: Check DNS configuration
2. **SSL connection failed**: Verify domain is accessible via HTTPS
3. **Certificate parsing failed**: Check if domain has a valid SSL certificate

### Debug Mode

For detailed debugging, check the generated logs and JSON reports:

```bash
# Run with output redirection for debugging
node tools/website-health-check.js > ssl-debug.log 2>&1
cat ssl-debug.log
```

## Resolution Steps

When SSL certificate issues are detected:

1. **Verify the issue**: Run manual checks to confirm the problem
2. **Check domain configuration**: Ensure DNS and hosting settings are correct
3. **Renew certificate**: Contact hosting provider or use Let's Encrypt
4. **Verify fix**: Run monitoring tools again to confirm resolution
5. **Close issues**: Close the automatically created GitHub issues once resolved

## Related Files

- `tools/website-health-check.js` - Main monitoring tool
- `tools/check-burnitoken-ssl.js` - Focused SSL checker
- `.github/workflows/ssl-health-check.yml` - Automation workflow
- `tools/monitoring/dns-migration-monitor.js` - Related DNS monitoring
- `tools/monitoring/website-connectivity-check.js` - Basic connectivity check