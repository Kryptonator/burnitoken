# Google Search Console Tools

Dieses Verzeichnis enthält Tools zur Überwachung und Verwaltung der Google Search Console (GSC) Integration für die burnitoken.com Website.

## Verfügbare Tools

### gsc-status-check.js

Prüft den Status der Sitemap in der Google Search Console und diagnostiziert häufige Probleme.

```bash
# Standard-Check mit API
node tools/gsc-status-check.js

# Test der API-Verbindung
node tools/gsc-status-check.js --test

# Diagnose-Modus (ohne API-Credentials)
node tools/gsc-status-check.js --diagnose

# Spezifische Problemdiagnose
node tools/gsc-status-check.js --status=notfetchable
```

### gsc-setup-guide.js

Führt durch den Prozess zum Einrichten eines Google Service Accounts für die Search Console API.

```bash
node tools/gsc-setup-guide.js
```

## Einrichtung

1. Führe `node tools/gsc-setup-guide.js` aus und folge den Anweisungen
2. Stelle sicher, dass die Datei `gsc-service-account.json` im `tools/`-Verzeichnis liegt
3. Füge das Secret `GSC_SERVICE_ACCOUNT` zu deinen GitHub Repository-Secrets hinzu

## CI/CD Integration

Die GSC-Tools sind in zwei Workflows integriert:

1. `.github/workflows/ci.yml`: Prüft den GSC-Status bei Pushes auf main/master
2. `.github/workflows/gsc-weekly-check.yml`: Führt wöchentliche GSC-Checks durch

## Sicherheitshinweise

- Die Service Account Datei (`gsc-service-account.json`) enthält sensible Zugangsdaten
- Stelle sicher, dass sie in `.gitignore` eingetragen ist (bereits erledigt)
- Speichere den Inhalt der Datei als GitHub Secret `GSC_SERVICE_ACCOUNT`
