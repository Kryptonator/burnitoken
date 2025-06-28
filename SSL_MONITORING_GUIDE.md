# 🔍 Website Health Check & SSL Monitoring

## Übersicht

Dieses System erkennt und überwacht SSL-Zertifikat-Probleme automatisch, um Ausfälle wie das in Issue #16 beschriebene SSL-Zertifikat-Expiry zu verhindern.

## Neue Dateien

### `tools/website-health-check.js`
- **Hauptfunktion**: Detaillierte SSL-Zertifikat-Überprüfung
- **Erkennt**: Abgelaufene Zertifikate, bald ablaufende Zertifikate, SSL-Verbindungsprobleme
- **Ausgabe**: Strukturierte Fehlerberichte im JSON-Format

### `tools/automated-health-monitor.js`
- **Hauptfunktion**: Kontinuierliches Monitoring 
- **Erkennt**: Kritische SSL-Probleme automatisch
- **Ausgabe**: Incident Reports für kritische Fälle

## Nutzung

### Einmalige Überprüfung
```bash
# Vollständiger Health Check
node tools/website-health-check.js

# Oder über den automatisierten Monitor
node tools/automated-health-monitor.js
```

### Kontinuierliches Monitoring
```bash
# Startet 24/7 Monitoring (alle 60 Minuten)
node tools/automated-health-monitor.js --monitor
```

## Erkannte Fehlertypen

| Error Code | Beschreibung | Kritikalität |
|------------|--------------|--------------|
| `E_SSL_CERT_EXPIRED` | SSL-Zertifikat ist abgelaufen | 🚨 KRITISCH |
| `E_SSL_CERT_EXPIRING_SOON` | SSL-Zertifikat läuft in <30 Tagen ab | ⚠️ WARNUNG |
| `E_SSL_CHECK_FAILED` | SSL-Überprüfung fehlgeschlagen | ⚠️ WARNUNG |
| `E_HTTPS_CONNECTION_FAILED` | HTTPS-Verbindung fehlgeschlagen | ⚠️ WARNUNG |
| `E_HTTPS_TIMEOUT` | HTTPS-Verbindung Timeout | ⚠️ WARNUNG |

## Ausgabe-Format

### Konsole
```
🏥 WEBSITE HEALTH CHECK STARTING...
==================================================

🔍 Checking burnitoken.com:
------------------------------
🔐 Checking SSL certificate for burnitoken.com...
   ❌ SSL certificate EXPIRED on 24.6.2025

📊 HEALTH CHECK RESULTS:
==================================================
⚠️ 1 issue(s) detected:

1. E_SSL_CERT_EXPIRED:
   URL: https://burnitoken.com
   Details: Das SSL-Zertifikat ist am 2025-06-24 abgelaufen.
```

### JSON Report
```json
{
  "source": "tools/website-health-check.js",
  "errorCode": "E_SSL_CERT_EXPIRED",
  "url": "https://burnitoken.com", 
  "timestamp": "2025-06-25T07:31:22.495Z",
  "details": "Das SSL-Zertifikat ist am 2025-06-24 abgelaufen."
}
```

## Integration in bestehendes Monitoring

### Erweiterte DNS Migration Monitor
Die bestehenden SSL-Checks in `dns-migration-monitor.js` und `dns-status-checker.js` wurden erweitert:

- ✅ **Vorher**: Nur Existenz von SSL-Zertifikaten prüfen
- ✅ **Jetzt**: Zusätzlich Ablaufdatum überprüfen und Warnung bei baldiger Expiry

### Automatische Alerts
- Kritische SSL-Reports werden automatisch in der Projekt-Root gespeichert
- Incident Reports enthalten Handlungsempfehlungen
- Monitoring kann als Service/Cronjob eingerichtet werden

## Geplante Erweiterungen

1. **E-Mail Alerts**: Integration mit dem bestehenden Alert-System
2. **Slack/Discord Notifications**: Für Echtzeit-Benachrichtigungen  
3. **Certificate Renewal Monitoring**: Automatische Erneuerung überwachen
4. **Multi-Domain Support**: Bulk-Monitoring für mehrere Domains

## Behebung von SSL-Problemen

### Bei abgelaufenem Zertifikat:
1. **Hosting Provider prüfen**: SSL-Renewal Settings überprüfen
2. **DNS Konfiguration**: A-Records und CNAME-Redirects validieren
3. **Let's Encrypt**: Automatische Renewal-Prozesse überprüfen
4. **Netlify Settings**: SSL-Konfiguration in Netlify Dashboard prüfen

### Bei bald ablaufendem Zertifikat:
1. **Monitoring verstärken**: Häufigere Checks in den letzten 30 Tagen
2. **Renewal Process**: Automatische Verlängerung aktivieren/überprüfen
3. **Backup Plans**: Alternative SSL-Provider als Fallback

## Troubleshooting

### DNS Resolution Fehler
- Domain ist nicht erreichbar → DNS-Konfiguration prüfen
- Domains zeigen auf falsche IPs → DNS-Records aktualisieren

### SSL Connection Fehler  
- Port 443 nicht erreichbar → Firewall/Hosting Settings prüfen
- Certificate Chain Probleme → Intermediate Certificates prüfen

### OpenSSL Command Fehler
- OpenSSL nicht installiert → `apt install openssl` oder entsprechend
- Timeout bei Checks → Netzwerk-Connectivity prüfen