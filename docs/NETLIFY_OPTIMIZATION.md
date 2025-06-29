# Netlify-Optimierung für BurniToken.com

Diese Dokumentation beschreibt die optimierte Netlify-Integration für das BurniToken-Projekt.

## 📋 Überblick

Die neue Netlify-Konfiguration bietet:

1. **Optimiertes Deployment** mit automatischer Asset-Optimierung
2. **Serverlose Funktionen** für API-Endpunkte ohne zusätzliche Server
3. **Performance-Monitoring** mit Lighthouse-Integration
4. **Erweiterte Sicherheitsheader** zur Absicherung der Website
5. **Branch-spezifische Deployments** mit unterschiedlichen Umgebungsvariablen

## 🚀 Deployment-Einstellungen

Die `netlify.toml`-Datei enthält alle Konfigurationen für das Deployment:

- **Build-Befehle:** `npm run build:prod` für Produktions-Deployments
- **Umgebungsvariablen:** Automatisch je nach Branch konfiguriert
- **Asset-Optimierung:** Automatische Komprimierung von JS, CSS und Bildern

## ⚙️ Serverlose Funktionen

In `/netlify/functions/` befinden sich mehrere serverlose Funktionen:

1. **Token-Info API** (`token-info.js`):
   - Endpunkt: `/.netlify/functions/token-info`
   - Liefert aktuelle Informationen zum BURNI-Token
   - Unterstützt CORS für Cross-Origin-Anfragen

2. **Kontaktformular-Handler** (`contact-form.js`):
   - Endpunkt: `/.netlify/functions/contact-form`
   - Verarbeitet Formularübermittlungen ohne Server-Backend
   - Validiert Eingaben und kann E-Mails versenden

3. **Krypto-Preis-API** (`crypto-price.js`):
   - Endpunkt: `/.netlify/functions/crypto-price?symbol=ethereum,bitcoin`
   - Ruft aktuelle Preisdaten von CoinGecko ab
   - Unterstützt mehrere Währungen mit Caching

## 📊 Performance-Monitoring

Das Lighthouse-Plugin ist so konfiguriert, dass es:

- Bei jedem Deployment automatisch Performance-Metriken erfasst
- Berichte im Verzeichnis `/reports/lighthouse/` speichert
- Benachrichtigungen sendet, wenn Performance-Schwellenwerte unterschritten werden

## 🔒 Sicherheitseinstellungen

Erweiterte Sicherheitsheader sind konfiguriert:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options, X-XSS-Protection und mehr
- Optimierte Cache-Einstellungen für verschiedene Ressourcen

## 🌿 Branch-Deployments

Unterschiedliche Umgebungen für verschiedene Branches:

- **Production:** `master`-Branch mit Produktionseinstellungen
- **Staging:** `deploy-preview`-Branches für Test-Deployments
- **Development:** `branch-deploy` für Feature-Branch-Tests

## 📝 Lokale Entwicklung

Um die Netlify-Funktionen lokal zu testen:

1. `npm install -g netlify-cli` (falls noch nicht installiert)
2. `netlify dev` oder `npm run dev:functions` zum Starten des lokalen Servers
3. Funktionen sind dann unter `http://localhost:8888/.netlify/functions/` verfügbar

## 🔍 Monitoring und Debugging

- Logs sind im Netlify-Dashboard unter "Functions" einsehbar
- Benutzerdefinierte Fehlerhandhabung in den Funktionen implementiert
- Analytics und Echtzeit-Überwachung über Netlify Analytics (Premium-Feature)

---

Erstellt am 21.06.2025 | Letzte Aktualisierung: 21.06.2025
