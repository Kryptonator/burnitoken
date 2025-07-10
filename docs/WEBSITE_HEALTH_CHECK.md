# Website Health Check Tool

Das Website Health Check Tool überwacht die Gesundheit der BurniToken-Website und erkennt kritische Probleme wie abgelaufene SSL-Zertifikate.

## Features

- ✅ **SSL-Zertifikat Überwachung**: Erkennt abgelaufene und bald ablaufende Zertifikate
- ✅ **Website-Erreichbarkeit**: Prüft HTTP-Status und Antwortzeiten
- ✅ **Automatische Fehlerberichterstattung**: JSON-Format für Integration mit CI/CD
- ✅ **GitHub Issues Integration**: Automatische Issue-Erstellung bei Problemen

## Verwendung

### Manuell ausführen

```bash
# Einmalige Health Check
npm run health:check

# Direkt über Node.js
node tools/website-health-check.js
```

### Automatisiert

Das Tool läuft automatisch über GitHub Actions:
- **Täglich um 2:00 UTC** für reguläre Überwachung
- **Alle 6 Stunden** für kontinuierliche Überwachung
- **Bei manueller Auslösung** über GitHub Actions Interface

## Fehlertypen

| Error Code | Beschreibung | Kritikalität |
|------------|--------------|--------------|
| `E_SSL_CERT_EXPIRED` | SSL-Zertifikat ist abgelaufen | 🔴 Kritisch |
| `E_SSL_CERT_EXPIRING_SOON` | SSL-Zertifikat läuft in ≤7 Tagen ab | 🟡 Warnung |
| `E_WEBSITE_UNREACHABLE` | Website ist nicht erreichbar | 🔴 Kritisch |
| `E_WEBSITE_SLOW` | Website reagiert langsam (>5s) | 🟡 Warnung |
| `E_SSL_CHECK_FAILED` | SSL-Überprüfung fehlgeschlagen | 🟠 Fehler |

## Beispiel-Output

Bei einem abgelaufenen SSL-Zertifikat:

```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com",
  "timestamp": "2025-06-26T02:56:01.248Z",
  "details": "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.",
  "expiryDate": "2025-06-24",
  "expiredDays": 2
}
```

## GitHub Actions Integration

Das Tool ist in `.github/workflows/health-monitoring.yml` integriert und:

1. **Führt Health Checks aus** auf Zeitplan-Basis
2. **Erstellt automatisch GitHub Issues** bei kritischen Problemen
3. **Speichert Berichte** für weitere Analyse
4. **Benachrichtigt bei Problemen** (konfigurierbar)

### Workflow-Trigger

```yaml
schedule:
  # Täglich um 2:00 UTC
  - cron: '0 2 * * *'
  # Alle 6 Stunden
  - cron: '0 */6 * * *'
```

## Testen

```bash
# Unit Tests ausführen
npm test tests/website-health-check.test.js

# Manuelle Überprüfung mit anderem Domain
node -e "
const WebsiteHealthChecker = require('./tools/website-health-check.js');
const checker = new WebsiteHealthChecker('https://example.com');
checker.performHealthCheck().then(() => checker.generateReport());
"
```

## Konfiguration

Das Tool erkennt automatisch:
- **Standard-URL**: `https://burnitoken.com`
- **Timeout**: 10 Sekunden für SSL/HTTP-Checks
- **SSL-Warnung**: 7 Tage vor Ablauf
- **Langsame Response**: >5 Sekunden

### Anpassung für andere URLs

```javascript
const checker = new WebsiteHealthChecker('https://ihre-domain.com');
```

## Integration in bestehende Workflows

Das Health Check Tool kann in bestehende CI/CD-Pipelines integriert werden:

```yaml
- name: Website Health Check
  run: npm run health:check
  continue-on-error: true
```

## Fehlerbehebung

### Häufige Probleme

1. **DNS-Auflösung fehlgeschlagen**: Netzwerk- oder DNS-Probleme
2. **SSL-Verbindung fehlgeschlagen**: Zertifikat-/Server-Probleme
3. **HTTP-Timeout**: Server reagiert nicht oder ist langsam

### Debug-Informationen

Health Reports werden in `/tmp/` gespeichert:
```
/tmp/health-check-report-YYYY-MM-DDTHH-mm-ss-sssZ.json
```

## Automatische Issue-Erstellung

Bei kritischen Problemen wird automatisch ein GitHub Issue erstellt:

- **Titel**: `🤖 [Automatisch gemeldet] Test: Kritisches SSL-Zertifikat abgelaufen`
- **Labels**: `bug`, `security`, `ssl`, `automated`
- **Content**: JSON-Fehlerbericht mit Details

Dies entspricht genau dem Format aus dem ursprünglichen Issue #19.