# Website Health Monitoring System

## Overview

This system monitors the health of burnitoken.website and handles SSL connection timeout issues. It provides comprehensive monitoring, logging, and error reporting for SSL-related connectivity problems.

## Components

### 1. Website Health Monitor (`website-health.js`)

**Purpose**: Dedicated health check script that specifically handles SSL connection timeouts.

**Features**:
- DNS resolution checking
- SSL connection timeout detection (15-second timeout)
- HTTP response validation
- Detailed logging to `website-health.log`
- SSL-specific error classification
- Critical error reporting in JSON format

**Usage**:
```bash
node tools/monitoring/website-health.js
```

**Output**: 
- Console report with detailed status
- JSON log file at `tools/monitoring/website-health.log`
- Exit code 0 for healthy, 1 for issues, 2 for system errors

### 2. Enhanced Website Connectivity Check (`website-connectivity-check.js`)

**Purpose**: Improved version of the original connectivity checker with SSL timeout handling.

**Enhancements**:
- Increased SSL timeout to 15 seconds
- SSL-specific error detection and reporting
- Enhanced error classification (DNS_FAILED, SSL_TIMEOUT, CONNECTION_REFUSED)
- SSL verification status reporting
- Specific recommendations for SSL timeout issues

**Usage**:
```bash
node tools/monitoring/website-connectivity-check.js
```

### 3. Enhanced Simple Browser Monitor (`simple-browser-monitor.js`)

**Purpose**: Browser-independent monitoring with SSL timeout detection.

**Enhancements**:
- SSL timeout detection and classification
- Extended timeout for SSL connections (15 seconds)
- Error type classification (SSL_TIMEOUT, DNS_ERROR, etc.)
- SSL certificate error detection
- Summary reporting for SSL issues

**Usage**:
```bash
node tools/monitoring/simple-browser-monitor.js
```

### 4. SSL Timeout Test Script (`ssl-timeout-test.js`)

**Purpose**: Test script to validate SSL timeout detection functionality.

**Features**:
- Simulates SSL timeout scenarios
- Tests the health monitor with mock timeouts
- Validates error detection and reporting
- Educational examples of SSL timeout handling

**Usage**:
```bash
node tools/monitoring/ssl-timeout-test.js
```

## Error Handling

### SSL Timeout Detection

The system detects SSL timeouts through multiple mechanisms:

1. **Connection Timeout**: 15-second timeout for SSL handshake
2. **Error Code Detection**: Monitors for `ETIMEDOUT` error codes
3. **Message Analysis**: Looks for timeout-related error messages
4. **Response Time Monitoring**: Tracks connection duration

### Error Classification

- `SSL_TIMEOUT`: SSL connection timeout
- `DNS_FAILED`: Domain name resolution failed
- `CONNECTION_REFUSED`: Server refused connection
- `SSL_CERTIFICATE_EXPIRED`: SSL certificate has expired
- `SSL_VERIFICATION_ERROR`: SSL certificate verification failed

## Logging Format

### Health Log (`website-health.log`)

JSON format with detailed information:

```json
{
  "timestamp": "2025-06-28T19:19:43.190Z",
  "status": "SSL_TIMEOUT_ERROR",
  "domain": "burnitoken.website",
  "checks": [
    {
      "type": "SSL_CONNECTION",
      "status": "TIMEOUT",
      "errorType": "SSL_TIMEOUT",
      "error": "SSL-Verbindungs-Timeout für https://burnitoken.website",
      "duration": "15000ms",
      "timestamp": "2025-06-28T19:19:43.209Z"
    }
  ],
  "summary": {
    "totalChecks": 3,
    "successfulChecks": 0,
    "failedChecks": 3,
    "overallStatus": "SSL_TIMEOUT_ERROR"
  }
}
```

### Critical Error Format

Matches the format reported in GitHub issues:

```json
{
  "details": "Ein kritischer Fehler wurde im Health Check Skript festgestellt. Bitte sofort untersuchen.",
  "originalMessage": "SSL-Verbindungs-Timeout für https://burnitoken.website",
  "timestamp": "2025-06-28T19:19:43.190Z",
  "logFile": "tools/monitoring/website-health.log"
}
```

## Integration

### Automated Monitoring

To set up automated monitoring, add to your CI/CD pipeline or cron jobs:

```bash
# Daily health check
0 */6 * * * /usr/bin/node /path/to/tools/monitoring/website-health.js

# Continuous monitoring (every 5 minutes)
*/5 * * * * /usr/bin/node /path/to/tools/monitoring/simple-browser-monitor.js
```

### Alert Integration

The scripts return appropriate exit codes for integration with alerting systems:

- Exit code 0: All checks passed
- Exit code 1: SSL timeout or other connectivity issues detected
- Exit code 2: System error or script failure

## Troubleshooting

### SSL Timeout Issues

When SSL timeouts are detected:

1. **Check SSL Certificate Status**:
   ```bash
   openssl s_client -connect burnitoken.website:443 -servername burnitoken.website
   ```

2. **Verify DNS Configuration**:
   ```bash
   nslookup burnitoken.website
   dig burnitoken.website
   ```

3. **Test from Different Locations**:
   Use external monitoring services to test from different geographic locations.

4. **Check Netlify Status**:
   Verify Netlify service status and SSL certificate configuration.

### Common Solutions

- **DNS Propagation**: Wait for DNS changes to propagate (up to 48 hours)
- **SSL Certificate Renewal**: Check if SSL certificate needs renewal
- **CDN Issues**: Clear CDN cache or check CDN configuration
- **Firewall Settings**: Verify firewall doesn't block SSL connections

## Monitoring Recommendations

1. **Regular Health Checks**: Run health check at least every 6 hours
2. **Alert Thresholds**: Set up alerts for consecutive SSL timeout failures
3. **Log Rotation**: Implement log rotation for the health log file
4. **Backup Monitoring**: Use external services as backup monitoring
5. **SSL Certificate Monitoring**: Monitor SSL certificate expiration dates

## Files Created/Modified

- `tools/monitoring/website-health.js` (NEW)
- `tools/monitoring/ssl-timeout-test.js` (NEW)
- `tools/monitoring/website-connectivity-check.js` (ENHANCED)
- `tools/monitoring/simple-browser-monitor.js` (ENHANCED)
- `tools/monitoring/website-health.log` (GENERATED)

This system provides comprehensive SSL timeout monitoring and resolves the issue reported in GitHub issue #24.