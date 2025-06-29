# Price Feed Monitor Documentation

## Overview

The Price Feed Monitor is designed to detect critical issues with price API endpoints and generate alerts when invalid responses are detected. This addresses the PF-5001 error: "Der Endpunkt lieferte eine ungültige Antwort" (The endpoint delivered an invalid response).

## Usage

### Running the Monitor

```bash
# Using npm script (recommended)
npm run monitor:price-feed

# Direct execution
node tools/monitoring/test-live-prices.js
```

### Error Codes

- **PF-5001**: Invalid endpoint response - generated when:
  - API endpoint returns HTTP error status
  - Response data structure is invalid or missing required fields
  - Network connectivity issues prevent API access
  - Request timeouts (>5 seconds)

## Monitored Endpoints

1. **CoinGecko XRP Price** (Critical)
   - URL: `https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd`
   - Validates: `data.ripple.usd` is a valid number
   - Impact: Critical for price calculations

2. **CoinGecko API Health** (Non-Critical)
   - URL: `https://api.coingecko.com/api/v3/ping`
   - Validates: `data.gecko_says === 'To the Moon!'`
   - Impact: API availability monitoring

## Integration

The monitor integrates with the main application's price fetching system. When price fetch errors occur in `main.js`, they are logged in the same format as the monitoring system for consistency.

## Testing

Run the test suite to validate monitor functionality:

```bash
npm test -- --testNamePattern="Price Feed Monitor"
```

## Error Response Format

```json
{
  "service": "price-feed-monitor",
  "timestamp": "2025-06-26T03:06:24.422Z",
  "errorCode": "PF-5001",
  "details": "Der Endpunkt lieferte eine ungültige Antwort.",
  "endpoint": "CoinGecko XRP Price",
  "specificError": "Network error: request timeout",
  "critical": true
}
```

## Monitoring Report

The monitor generates a comprehensive report showing:
- Total endpoints tested
- Critical error count
- Detailed error information
- Response times and validation results

## Exit Codes

- **0**: All endpoints functioning correctly
- **1**: Critical errors detected (requires immediate attention)