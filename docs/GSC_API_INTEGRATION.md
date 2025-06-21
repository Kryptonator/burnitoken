# Google Search Console API-Integration

## Überblick

Diese Dokumentation beschreibt die Integration von Google Search Console API (GSC API) in das Burnitoken-Website-Projekt. Die Integration ermöglicht automatisierten Zugriff auf Daten der Google Search Console, einschließlich Sitemap-Status, Suchergebnisse und Leistungsmetriken.

## Setup und Konfiguration

### 1. Google Cloud-Projekt

Das Projekt verwendet das bestehende Google Cloud-Projekt:
- **Name**: Burnitoken GSC
- **Projekt-ID**: burnitoken-gsc

### 2. Service-Account

Für die API-Authentifizierung wird ein Service-Account verwendet:
- **E-Mail**: searchconsole-service@burnitoken-gsc.iam.gserviceaccount.com
- **Name**: Searchconsole-Service

### 3. Erforderliche Dateien

Die API-Integration erfordert folgende Dateien:
- **Service-Account-Datei**: `tools/gsc-service-account.json`
- **GSC-Status-Check-Tool**: `tools/gsc-status-check.js`
- **GSC-Auth-Check-Tool**: `tools/gsc-auth-check.js`
- **GSC-Performance-Daten-Tool**: `tools/gsc-performance-data.js`
- **GSC-Keywords-Report-Tool**: `tools/gsc-keywords-report.js`
- **GSC-Crawl-Stats-Tool**: `tools/gsc-crawl-stats.js`

### 4. Abhängigkeiten

Die Folgende Abhängigkeit wurde in der `package.json` Datei hinzugefügt:
```json
"googleapis": "^150.0.0"
```

## Service-Account-Datei einrichten

Die Service-Account-Datei (`gsc-service-account.json`) ist ein JSON-Schlüssel, der für die Authentifizierung bei der Google API benötigt wird.

### Schritt-für-Schritt-Anleitung:

1. Melden Sie sich bei der [Google Cloud Console](https://console.cloud.google.com) an
2. Wählen Sie das Projekt "Burnitoken GSC"
3. Gehen Sie zu "IAM & Admin" > "Service Accounts"
4. Finden Sie den Service-Account "searchconsole-service@burnitoken-gsc.iam.gserviceaccount.com"
5. Wählen Sie "Keys" > "ADD KEY" > "Create new key"
6. Wählen Sie JSON-Format und laden Sie die Schlüsseldatei herunter
7. Ersetzen Sie den Inhalt der Datei `tools/gsc-service-account.json` mit dem Inhalt der heruntergeladenen Datei

## Berechtigungen einrichten

Der Service-Account muss Zugriff auf die Google Search Console-Daten haben:

1. Gehen Sie zur [Google Search Console](https://search.google.com/search-console)
2. Wählen Sie die Property "burnitoken.website"
3. Klicken Sie auf "Einstellungen" (Zahnrad-Symbol)
4. Wählen Sie "Nutzer und Berechtigungen"
5. Klicken Sie auf "Nutzer hinzufügen"
6. Geben Sie die Service-Account-E-Mail ein: searchconsole-service@burnitoken-gsc.iam.gserviceaccount.com
7. Wählen Sie als Berechtigungsstufe "Inhaber" oder mindestens "Vollständiger Zugriff"

## Verwendung der GSC-API-Tools

### 1. GSC-Auth-Check-Tool

Das Tool `tools/gsc-auth-check.js` überprüft die Authentifizierung und Berechtigungen des Service-Accounts:

```bash
# Überprüfen der Authentifizierung und Berechtigungen
npm run gsc:auth
```

### 2. GSC-Status-Check-Tool

Das Tool `tools/gsc-status-check.js` bietet folgende Funktionen:

1. **GSC API-Abfrage**: Ruft Sitemap-Status und -Informationen ab
2. **Diagnose-Modus**: Hilft bei Fehlerbehebung von Sitemap-Problemen

```bash
# Prüfen des Sitemap-Status mit der API
npm run gsc:status

# Diagnose-Modus für spezifische Probleme
npm run gsc:diagnose
```

### 3. GSC-Performance-Daten-Tool

Das Tool `tools/gsc-performance-data.js` ruft Performance-Metriken aus der GSC ab:

```bash
# Standard-Performance-Daten für die letzten 28 Tage abrufen
npm run gsc:performance

# Performance-Daten für einen benutzerdefinierten Zeitraum abrufen
npm run gsc:performance -- --days=90

# Daten als JSON speichern
npm run gsc:performance -- --save
```

### 4. GSC-Keywords-Report-Tool

Das Tool `tools/gsc-keywords-report.js` zeigt die Top-Suchbegriffe nach Klicks an:

```bash
# Standard-Keyword-Bericht für die letzten 28 Tage
npm run gsc:keywords

# Mehr Keywords anzeigen
npm run gsc:keywords -- --limit=200

# Längeren Zeitraum wählen und Daten speichern
npm run gsc:keywords -- --days=90 --save
```

### 5. GSC-Crawl-Stats-Tool

Das Tool `tools/gsc-crawl-stats.js` zeigt Informationen zu Crawling-Problemen:

```bash
# Crawling-Statistiken anzeigen
npm run gsc:crawl

# Crawling-Daten als JSON speichern
npm run gsc:crawl -- --save
```

## Wichtige Sicherheitshinweise

⚠️ **ACHTUNG: SERVICE-ACCOUNT-SCHLÜSSEL SCHÜTZEN** ⚠️

Die Datei `tools/gsc-service-account.json` enthält private Schlüssel und Zugangsdaten für die Google API. Diese Datei:
- **DARF NIEMALS** in ein Git-Repository hochgeladen werden
- **DARF NIEMALS** öffentlich geteilt werden
- **MUSS** sicher aufbewahrt werden
- Ist in der `.gitignore` Liste enthalten, um versehentliches Hochladen zu verhindern

## Fehlerbehebung

Bei Problemen mit der GSC API-Integration:

1. **Überprüfen Sie die Service-Account-Datei**: Stellen Sie sicher, dass die JSON-Datei korrekt formatiert ist und gültige Anmeldeinformationen enthält
2. **Überprüfen Sie die API-Berechtigungen**: Der Service-Account benötigt ausreichende Berechtigungen in der Search Console
3. **API-Aktivierung**: Stellen Sie sicher, dass die Search Console API im Google Cloud-Projekt aktiviert ist
4. **Diagnose-Modus verwenden**: Führen Sie das Tool mit `--diagnose` aus, um auf Probleme zu testen
5. **Property-Format beachten**: Verwenden Sie das Format `sc-domain:burnitoken.website` statt `https://burnitoken.website/`
6. **Authentifizierung testen**: Verwenden Sie `npm run gsc:auth`, um den Authentifizierungsstatus zu prüfen

## Erweiterung und Anpassung

Sie können die GSC-API-Tools erweitern oder anpassen:

- **Neue Dimensionen hinzufügen**: Die bestehenden Skripts können erweitert werden, um zusätzliche Dimensionen wie Seiten, Länder oder Geräte einzubeziehen
- **Automatisierte Berichte**: Erstellen Sie zeitgesteuerte Berichte, die regelmäßig per E-Mail versendet werden
- **Integration mit Dashboards**: Die abgerufenen Daten können in Business-Intelligence-Tools eingespeist werden
- **Warnungen einrichten**: Bei Performance-Einbrüchen oder kritischen Crawling-Fehlern können automatische Benachrichtigungen gesendet werden

## Datenspeicherung und Analyse

Alle Tools unterstützen die Option `--save`, die Daten als JSON-Dateien im Verzeichnis `reports/` speichert. Diese Daten können verwendet werden für:

- Historische Analysen und Trends
- Datenvisualisierung
- Export zu anderen Tools
- Backups von GSC-Daten

## Zusätzliche Ressourcen

- [Google Search Console API-Dokumentation](https://developers.google.com/webmaster-tools/search-console-api-original)
- [Google Cloud Service-Account-Dokumentation](https://cloud.google.com/iam/docs/service-accounts)
- [Google API Client für Node.js](https://github.com/googleapis/google-api-nodejs-client)
- [GSC Search Analytics API Referenz](https://developers.google.com/webmaster-tools/search-console-api-original/v3/searchanalytics/query)

---

Zuletzt aktualisiert: 22. Juni 2025
