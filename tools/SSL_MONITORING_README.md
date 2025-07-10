# SSL Certificate Monitoring System

This directory contains enhanced SSL certificate monitoring tools that detect and report SSL certificate expiration issues.

## Tools Overview

### 1. `website-health-check.js`
**Primary SSL monitoring tool** that checks certificate expiration and website health.

**Features:**
- SSL certificate expiration detection
- Website connectivity testing
- Structured error reporting with specific error codes
- JSON report generation
- Recommendations for issue resolution

**Usage:**
```bash
npm run health:check
```

**Error Codes:**
- `E_SSL_CERT_EXPIRED`: Certificate has expired
- `E_SSL_CERT_EXPIRING_SOON`: Certificate expires within 7 days
- `E_SSL_CHECK_FAILED`: Unable to check SSL certificate
- `E_CONNECTIVITY_FAILED`: Website not reachable
- `E_HTTP_ERROR`: HTTP status code not 200
- `E_SLOW_RESPONSE`: Response time exceeds threshold
- `E_TIMEOUT`: Request timeout

### 2. `automated-ssl-monitoring.js`
**Automated monitoring system** for CI/CD and cron job integration.

**Features:**
- Runs health checks automatically
- Creates GitHub issue data for critical problems
- Maintains monitoring logs
- Generates actionable reports

**Usage:**
```bash
npm run health:monitor
```

### 3. Enhanced `dns-migration-monitor.js`
**Updated DNS migration tool** with improved SSL certificate checking.

**Improvements:**
- Now checks SSL certificate expiration dates
- Reports remaining days until expiration
- Warns about certificates expiring within 7 days
- Enhanced error reporting

## Issue Detection

When an SSL certificate expires, the system generates a structured error report:

```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-06-27T05:17:01.952Z",
  "details": "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen."
}
```

## Testing

### Test SSL Monitoring
```bash
npm run health:test
```

### Test Issue Format
```bash
node tools/test-issue-format.js
```

## Integration

### CI/CD Integration
Add to your workflow:
```yaml
- name: SSL Health Check
  run: npm run health:monitor
```

### Cron Job
```bash
# Check SSL certificates daily at 6 AM
0 6 * * * cd /path/to/project && npm run health:monitor
```

## Configuration

Edit the monitoring configuration in `website-health-check.js`:

```javascript
this.alertThresholds = {
  sslExpirationDays: 7,    // Alert if expires within 7 days
  responseTimeMs: 5000,    // Alert if response > 5 seconds
};
```

## Output Files

- `website-health-report.json`: Detailed health check results
- `monitoring-log.json`: Historical monitoring data
- `ssl-issue-*.json`: Critical issue data for GitHub integration

## Troubleshooting

1. **Network Issues**: The tools require internet access to check SSL certificates
2. **OpenSSL Dependency**: Requires `openssl` command-line tool
3. **Permissions**: May need appropriate file write permissions for reports

## Related Tools

- `website-connectivity-check.js`: Basic connectivity testing
- `dns-migration-monitor.js`: DNS migration monitoring with SSL checks