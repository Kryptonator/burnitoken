# SSL Certificate Monitoring System

This document describes the SSL certificate monitoring system implemented to address the critical SSL certificate expiration issue detected in burnitoken.com.

## Overview

The SSL monitoring system provides comprehensive monitoring of SSL certificates for all configured domains, with automatic detection of expired or expiring certificates and detailed error reporting.

## Components

### 1. Website Health Check (`tools/website-health-check.js`)

Primary SSL certificate monitoring tool that performs comprehensive health checks including:

- **SSL Certificate Expiration Detection**: Checks if certificates are expired
- **Expiration Warning System**: Alerts when certificates expire within 30 days
- **Connectivity Testing**: Verifies website accessibility
- **Detailed Error Reporting**: Provides structured error reports with specific error codes

#### Key Features:
- Detects `E_SSL_CERT_EXPIRED` errors (matching the original issue format)
- Generates detailed JSON reports
- Supports multiple domains
- Configurable timeout settings

#### Usage:
```bash
# Run health check
npm run health:check

# Or directly
node tools/website-health-check.js
```

### 2. SSL Expiration Tester (`tools/test-ssl-expiration.js`)

Testing tool that simulates SSL certificate expiration scenarios and validates the monitoring functionality.

#### Features:
- Simulates the exact error scenario from the original issue
- Tests date parsing functionality
- Validates error format compliance
- Tests multiple expiration scenarios (expired, warning, healthy)

#### Usage:
```bash
# Run SSL expiration tests
npm run health:test

# Or directly
node tools/test-ssl-expiration.js
```

### 3. SSL Monitoring Scheduler (`tools/ssl-monitoring-scheduler.js`)

Automated monitoring scheduler that runs regular SSL health checks and maintains monitoring logs.

#### Features:
- Scheduled health checks (default: every 6 hours)
- Critical error detection and alerting
- Monitoring log maintenance
- Report generation

#### Usage:
```bash
# Start continuous monitoring
npm run ssl:monitor

# Run single check
npm run ssl:monitor:once

# Generate monitoring report
npm run ssl:monitor:report
```

### 4. Enhanced DNS Monitors

Updated existing DNS monitoring tools to include SSL certificate expiration checking:

- `tools/monitoring/dns-migration-monitor.js`
- `tools/monitoring/dns-status-checker.js`

Both now include:
- Expiration date validation
- Critical error detection
- Enhanced reporting with expiration warnings

## Error Codes

The system uses standardized error codes for SSL certificate issues:

### E_SSL_CERT_EXPIRED
Indicates that an SSL certificate has expired.

**Example Error Format:**
```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-06-27T09:30:12.890Z",
  "details": "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen."
}
```

### E_SSL_CHECK_FAILED
Indicates that SSL certificate checking failed (e.g., domain not reachable).

## Configuration

### Monitored Domains
Default domains monitored by the system:
- `burnitoken.com`
- `burnitoken.website`

To modify monitored domains, edit the `domains` array in `tools/website-health-check.js`.

### Alert Thresholds
- **Expiration Warning**: 30 days before expiration
- **Check Timeout**: 15 seconds per domain
- **Monitoring Interval**: 6 hours (scheduler)

## Reports and Logs

### Health Reports
Generated as `website-health-report.json` with:
- Timestamp of check
- Per-domain results (connectivity + SSL)
- Summary statistics
- Error details

### Monitoring Logs
Maintained in `ssl-monitoring.log` with:
- Check timestamps
- Success/failure status
- Critical error details
- Alert information

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run health:check` | Run SSL health check |
| `npm run health:test` | Run SSL expiration tests |
| `npm run ssl:monitor` | Start continuous monitoring |
| `npm run ssl:monitor:once` | Run single monitoring check |
| `npm run ssl:monitor:report` | Generate monitoring report |

## Integration with Existing Systems

The SSL monitoring system integrates seamlessly with existing monitoring tools:

1. **DNS Migration Monitor**: Enhanced with SSL expiration checking
2. **Website Connectivity Check**: Extended SSL validation
3. **Extension Management**: Monitoring dashboard integration
4. **CI/CD Pipeline**: Can be integrated for automated SSL validation

## Troubleshooting

### Common Issues

1. **Domain Not Reachable**
   - Check DNS configuration
   - Verify network connectivity
   - Review domain settings

2. **SSL Certificate Check Failed**
   - Domain may not support HTTPS
   - Certificate may be invalid
   - Network connectivity issues

3. **Certificate Expired**
   - Contact hosting provider
   - Renew SSL certificate
   - Update certificate configuration

### Debug Mode
Add console logging or run individual components to debug specific issues:

```bash
# Test specific domain
node -e "
const { WebsiteHealthChecker } = require('./tools/website-health-check.js');
const checker = new WebsiteHealthChecker();
checker.checkSSLCertificate('example.com').then(console.log);
"
```

## Security Considerations

- SSL monitoring requires outbound HTTPS connections
- Certificate information is logged but not stored permanently
- Error messages may contain sensitive domain information
- Monitoring logs should be secured and rotated regularly

## Future Enhancements

Potential improvements for the SSL monitoring system:

1. **Alert Integrations**: Email, Slack, Teams notifications
2. **Certificate Renewal**: Automatic certificate renewal triggers
3. **Multiple Certificate Support**: Support for wildcard and multi-domain certificates
4. **Historical Tracking**: Long-term certificate status tracking
5. **Dashboard Integration**: Web-based monitoring dashboard
6. **Webhook Support**: Integration with external monitoring systems

## Testing

The system includes comprehensive tests in `tests/ssl-monitoring.test.js`:

- Date parsing validation
- Health status determination
- Error format compliance
- Expiration scenario testing

Run tests with:
```bash
npm test tests/ssl-monitoring.test.js
```

## Related Files

- `tools/website-health-check.js` - Main health check tool
- `tools/test-ssl-expiration.js` - Testing and validation
- `tools/ssl-monitoring-scheduler.js` - Automated monitoring
- `tools/monitoring/dns-migration-monitor.js` - Enhanced DNS monitor
- `tools/monitoring/dns-status-checker.js` - Enhanced DNS status checker
- `tests/ssl-monitoring.test.js` - Test suite
- `website-health-report.json` - Latest health report
- `ssl-monitoring.log` - Monitoring log file

This SSL monitoring system provides comprehensive coverage for the SSL certificate expiration issues identified in the original GitHub issue #29.