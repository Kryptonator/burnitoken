# Website Health Check System

## Übersicht

Das Website Health Check System erkennt SSL-Verbindungs-Timeouts und andere kritische Website-Probleme automatisch und erstellt detaillierte Berichte im Format wie in GitHub Issues #25 beschrieben.

## Features

### ✅ SSL Timeout Detection
- Spezifische Erkennung von SSL-Verbindungs-Timeouts
- Unterscheidung zwischen SSL-Handshake-Timeouts und allgemeinen Verbindungsproblemen
- Konfigurierbare Timeout-Werte (SSL: 8s, Verbindung: 15s)

### ✅ Automatische Berichterstattung
- Automatische Issue-Reports im GitHub-Format
- Logging im spezifizierten Format: `website-health.log`
- JSON-Reports für detaillierte Analyse

### ✅ Retry-Mechanismus
- Automatische Wiederholung bei kritischen Fehlern
- Intelligente Backoff-Strategien
- Maximal 3 Versuche pro Check

### ✅ Comprehensive Monitoring
- DNS-Auflösung
- SSL-Zertifikat-Status
- HTTPS-Erreichbarkeit
- Performance-Metriken

## Verwendung

### 1. Einzelner Health Check
```bash
npm run health:check
# oder
node tools/monitoring/website-health-checker.js
```

### 2. Automatisches Monitoring (kontinuierlich)
```bash
npm run health:monitor
# oder
node tools/monitoring/automated-health-monitor.js
```

### 3. Einmaliger automatischer Check
```bash
npm run health:monitor:single
# oder
node tools/monitoring/automated-health-monitor.js --single
```

### 4. Verbesserte Konnektivitätsprüfungen
```bash
npm run monitor:connectivity
npm run monitor:simple
```

## SSL Timeout Detection

Das System erkennt SSL-Timeouts spezifisch durch:

1. **Separater SSL-Timeout**: 8 Sekunden für SSL-Handshake
2. **Gesamtverbindungs-Timeout**: 15 Sekunden für komplette Verbindung
3. **Error-Code-Analyse**: Erkennung SSL-spezifischer Fehlercodes
4. **Timeout-Kategorisierung**: `SSL_HANDSHAKE` vs `FULL_CONNECTION`

### Erkannte SSL-Probleme:
- `SSL_TIMEOUT`: SSL-Handshake-Timeout
- `SSL_ERROR`: SSL-Zertifikat- oder Konfigurationsfehler
- `CONNECTION_TIMEOUT`: Allgemeine Verbindungsprobleme

## Log-Format

Automatische Logs werden im Format der GitHub Issue #25 erstellt:

```json
{
  "details": "Ein kritischer Fehler wurde im Health Check Skript festgestellt. Bitte sofort untersuchen.",
  "originalMessage": "SSL-Verbindungs-Timeout für https://burnitoken.website",
  "timestamp": "2025-06-26T18:00:00.289Z",
  "logFile": "tools/monitoring/logs/website-health.log",
  "domain": "burnitoken.website",
  "errorType": "SSL_TIMEOUT"
}
```

## Verzeichnisstruktur

```
tools/monitoring/
├── website-health-checker.js       # Haupt-Health-Check-System
├── automated-health-monitor.js     # Automatisiertes Monitoring
├── website-connectivity-check.js   # Verbesserte Konnektivitätsprüfung
├── simple-browser-monitor.js       # Verbesserte Browser-Überwachung
└── logs/                           # Log-Verzeichnis
    ├── website-health.log          # Haupt-Log-Datei
    ├── monitoring-summary-*.json   # Zusammenfassungsberichte
    └── issue-report-*.json         # Automatische Issue-Reports
```

## Konfiguration

### Timeout-Einstellungen
```javascript
// In website-health-checker.js
this.sslTimeout = 8000;        // 8 Sekunden SSL-Handshake
this.connectionTimeout = 15000; // 15 Sekunden Gesamtverbindung
this.maxRetries = 3;           // 3 Wiederholungsversuche
```

### Überwachte Domains
```javascript
this.domains = [
  'burnitoken.website',
  'burnitoken.com', 
  'www.burnitoken.website'
];
```

### Monitoring-Intervall
```javascript
// In automated-health-monitor.js
this.monitoringInterval = 5 * 60 * 1000; // 5 Minuten
```

## Integration in CI/CD

Das Health Check System kann in bestehende CI/CD-Pipelines integriert werden:

```yaml
# GitHub Actions Beispiel
- name: Website Health Check
  run: npm run health:check
```

## Empfehlungen und Warnungen

Das System generiert automatisch Empfehlungen basierend auf erkannten Problemen:

- **HIGH Priority**: SSL Connection Timeouts
- **HIGH Priority**: DNS Resolution Failures  
- **MEDIUM Priority**: HTTPS Connectivity Issues

## Troubleshooting

### Häufige SSL-Timeout-Ursachen:
1. SSL-Zertifikat abgelaufen oder ungültig
2. DNS-Probleme oder falsche A-Records
3. Server-Überlastung oder Performance-Probleme
4. CDN-Konfigurationsfehler
5. Firewall- oder Netzwerk-Probleme

### Debug-Befehle:
```bash
# DNS-Check
nslookup burnitoken.website

# SSL-Zertifikat-Check
openssl s_client -connect burnitoken.website:443 -servername burnitoken.website

# HTTPS-Status
curl -I https://burnitoken.website
```

## Ausgabe-Beispiele

### Erfolgreicher Check:
```
✅ burnitoken.website - OK
   DNS: ✅ 75.2.60.5
   SSL: ✅ 523ms
   HTTPS: ✅ 200 (789ms)
```

### SSL-Timeout-Erkennung:
```
❌ burnitoken.website - KRITISCHER FEHLER
   DNS: ✅ 75.2.60.5
   SSL: ⏰ TIMEOUT (8000ms)
   HTTPS: ❌ Connection failed
```

## Sicherheit

- Keine sensitiven Daten in Logs
- Sichere Behandlung von SSL-Fehlern
- Schutz vor Log-Injection
- Begrenzte Retry-Versuche gegen DoS

## Weiterentwicklung

Geplante Features:
- E-Mail-Benachrichtigungen bei kritischen Fehlern
- Integration mit Monitoring-Dashboards
- Erweiterte SSL-Zertifikat-Analyse
- Performance-Trend-Analyse
- Slack/Discord-Benachrichtigungen