# Backend Service Monitoring System

This document describes the backend service monitoring system implemented to address Issue #33 - Critical System Error E-12045 (Database Connection Failure).

## Overview

The monitoring system detects and alerts on critical backend service failures, specifically focusing on:
- Payment gateway database connectivity issues (Error E-12045)
- XRPL blockchain integration health
- Backend service availability

## Files Added

### Core Monitoring
- `tools/monitoring/backend-service-monitor.js` - Main monitoring script
- `tests/e2e/backend-services.spec.js` - End-to-end tests for backend services
- `tests/backend-integration.test.js` - Jest integration tests

### Enhanced Integration
- Enhanced `tools/monitoring/critical-website-issues-detector.js` - Integrated backend monitoring into existing infrastructure

## Usage

### Command Line Monitoring

```bash
# Run backend service monitoring
npm run monitor:backend

# Run backend integration tests
npm run test:backend

# Run end-to-end backend tests (requires Playwright)
npm run test:e2e:backend
```

### Integration with Existing Monitoring

The backend monitoring is automatically integrated into the existing critical issues detector:

```bash
# Run comprehensive monitoring (includes backend services)
node tools/monitoring/critical-website-issues-detector.js
```

## Error Detection

### E-12045 Error Detection

The system specifically monitors for error E-12045 which indicates:
- **Service**: payment-gateway
- **Issue**: Database connection failure
- **Impact**: Backend services non-functional, affecting user transactions

### Alert Structure

When E-12045 is detected, the system generates structured alerts:

```json
{
  "id": "ALERT_E-12045_[timestamp]",
  "errorCode": "E-12045",
  "severity": "CRITICAL",
  "title": "🚨 CRITICAL: Database connection failure in payment-gateway service",
  "service": "Payment Gateway Service",
  "details": "Connection details and error message",
  "timestamp": "2025-06-28T19:26:44.476Z",
  "actions": [
    "Check database connectivity",
    "Verify service configuration", 
    "Restart payment gateway service",
    "Escalate to development team"
  ],
  "status": "ACTIVE"
}
```

## Monitored Services

### 1. Payment Gateway Service
- **Endpoints**: 
  - `/.netlify/functions/token-info`
  - `/.netlify/functions/crypto-price`
- **Critical**: Yes
- **Error Code**: E-12045 for database failures

### 2. Database Connectivity
- **Endpoints**:
  - `/.netlify/functions/contact-form`
  - `/.netlify/functions/security-report`
- **Critical**: Yes
- **Error Code**: E-12045 for connection failures

### 3. XRPL Blockchain Integration
- **Endpoints**:
  - `https://api.xrpl.org/v1/server/info`
  - `https://livenet.xrpl.org`
- **Critical**: Yes
- **Purpose**: Blockchain connectivity for payment processing

## Output Files

### Alert Files
- Location: `monitoring-alerts/`
- Format: `ALERT_E-12045_[timestamp].json`
- Content: Structured alert information

### Health Reports
- Location: `monitoring-reports/`
- Latest: `backend-health-latest.json`
- Historical: `backend-health-[timestamp].json`

## Test Results

The monitoring system successfully detects the E-12045 error as described in the original issue:

```json
{
  "service": "payment-gateway",
  "errorCode": "E-12045", 
  "timestamp": "2025-06-27T20:13:04.880Z",
  "details": "Die Verbindung zur Datenbank konnte nicht hergestellt werden. Dieser Test überprüft die gesamte Kette."
}
```

## Integration Notes

- Monitoring output files are excluded from Git via `.gitignore`
- System integrates with existing monitoring infrastructure
- Provides both unit and end-to-end testing capabilities
- Generates actionable alerts with specific remediation steps

## Troubleshooting

If monitoring fails:
1. Check network connectivity
2. Verify service endpoints are accessible
3. Review monitoring configuration
4. Check for proper dependencies installation

For E-12045 errors specifically:
1. Verify database connectivity
2. Check service configuration
3. Restart payment gateway service
4. Escalate to development team if persistent