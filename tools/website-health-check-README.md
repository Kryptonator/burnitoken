# 🔐 Website Health Check Tool

Ein automatisiertes Monitoring-Tool zur Überwachung von SSL-Zertifikat-Abläufen für die BurniToken-Website.

## 🎯 Zweck

Dieses Tool wurde entwickelt, um kritische SSL-Zertifikat-Probleme automatisch zu erkennen und zu melden. Es überwacht:

- SSL-Zertifikat-Ablaufdaten
- Abgelaufene Zertifikate
- Bald ablaufende Zertifikate (innerhalb von 7 Tagen)
- Zertifikat-Erreichbarkeitsprobleme

## 📋 Funktionen

### Automatische Erkennung
- ✅ Abgelaufene SSL-Zertifikate
- ⏰ Bald ablaufende Zertifikate
- 🔍 SSL-Handshake-Probleme
- 📊 Detaillierte Reporting

### Alert-Generierung
Generiert standardisierte JSON-Alerts im Format:
```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-06-26T17:35:33.150Z",
  "details": "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen."
}
```

### Error Codes
- `E_SSL_CERT_EXPIRED` - Zertifikat ist abgelaufen
- `E_SSL_CERT_EXPIRING_SOON` - Zertifikat läuft bald ab
- `E_SSL_CERT_CHECK_FAILED` - SSL-Prüfung fehlgeschlagen

## 🚀 Verwendung

### NPM Scripts
```bash
# Normale Überprüfung (Live-URLs)
npm run health:check

# Test-Modus (simulierte Daten)
npm run health:test
```

### Direkter Aufruf
```bash
# Normale Überprüfung
node tools/website-health-check.js

# Test-Modus
NODE_ENV=test node tools/website-health-check.js
```

### CLI Integration
```bash
# In CI/CD-Pipeline
npm run health:check || echo "SSL certificate issues detected!"

# Nur Alerts ausgeben
npm run health:check 2>/dev/null || true
```

## 📊 Output

### Console Output
- 🔍 Live-Überwachungsfortschritt
- ⚠️ Alert-Benachrichtigungen
- 📊 Status-Zusammenfassung
- 🟢/🟡/🔴 Gesamtstatus

### JSON Results
Speichert detaillierte Ergebnisse in `/tmp/website-health-check-YYYY-MM-DD.json`:

```json
{
  "timestamp": "2025-06-28T19:22:01.071Z",
  "checks": [...],
  "alerts": [...],
  "summary": {
    "totalChecks": 2,
    "healthyUrls": 0,
    "expiredCertificates": 1,
    "expiringSoonCertificates": 1,
    "errors": 0
  }
}
```

### Stderr Output
Alerts werden zusätzlich als JSON-Objekte an stderr ausgegeben für automatisierte Verarbeitung.

## ⚙️ Konfiguration

### Überwachte URLs
Standardmäßig überwacht:
- `https://burnitoken.com`
- `https://burnitoken.website`

### Alert-Schwellenwerte
- **Expiring Soon**: 7 Tage vor Ablauf
- **Check Timeout**: 15 Sekunden
- **Retry-Strategien**: Multiple OpenSSL-Ansätze

## 🧪 Testing

### Unit Tests
```bash
# Alle Tests ausführen
npm test

# Nur Health Check Tests
npx jest tests/website-health-check.test.js
```

### Test Cases
- ✅ Erkennung abgelaufener Zertifikate
- ✅ Erkennung bald ablaufender Zertifikate
- ✅ Gesunde Zertifikate
- ✅ Alert-Format-Validierung
- ✅ Multiple URL-Handling

## 🔧 Technische Details

### Dependencies
- Native Node.js (keine externen Dependencies)
- OpenSSL für Zertifikat-Parsing
- Child Process für Shell-Kommandos

### OpenSSL Commands
Verwendet verschiedene Fallback-Strategien:
1. `openssl s_client -servername ... -verify_return_error`
2. `echo | openssl s_client ...`
3. Timeout-basierte Varianten

### Error Handling
- Automatische Retry-Mechanismen
- Graceful Degradation bei Netzwerkproblemen
- Detaillierte Error-Logging

## 📋 Exit Codes

| Code | Status | Bedeutung |
|------|--------|-----------|
| 0 | SUCCESS | Alle Zertifikate gesund |
| 1 | WARNING/CRITICAL | Alerts generiert |

## 🔄 Integration

### GitHub Actions
```yaml
- name: SSL Health Check
  run: npm run health:check
  continue-on-error: true
```

### Cron Jobs
```bash
# Täglich um 6:00 Uhr
0 6 * * * cd /path/to/project && npm run health:check
```

### Monitoring Systems
Das Tool kann in Prometheus, Grafana oder andere Monitoring-Systeme integriert werden durch Parsing der JSON-Outputs.

## 🚨 Issue #22 Resolution

Dieses Tool wurde speziell entwickelt, um das in Issue #22 gemeldete Problem zu lösen:

> 🤖 [Automatisch gemeldet] Test: Kritisches SSL-Zertifikat abgelaufen

Das Tool generiert exakt das erwartete Alert-Format und ermöglicht proaktive SSL-Überwachung.