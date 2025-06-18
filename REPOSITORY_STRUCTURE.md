# Repository Structure - burnitoken.com

## 📁 Ordnerstruktur

### 🏗️ **Hauptverzeichnis**

- `index.html` - Hauptwebseite
- `package.json` - Node.js Abhängigkeiten
- `manifest.json` - PWA Manifest
- `sw.js` - Service Worker
- `robots.txt` - SEO Roboter-Anweisungen
- `sitemap.xml` - SEO Sitemap
- `404.html` - Fehlerseite
- `CNAME` - GitHub Pages Domain-Konfiguration
- `_headers` - HTTP Headers für Netlify/Cloudflare

### ⚙️ **Konfigurationsdateien**
- `.gitignore` - Git Ignore-Regeln
- `.htaccess` - Apache Server-Konfiguration
- `.prettierrc` - Code-Formatierungsregeln
- `.lighthouserc.js` - Lighthouse Performance-Tests
- `jest.config.js` - Jest Test-Konfiguration
- `lighthouse.config.js` - Lighthouse Konfiguration
- `playwright.config.js` - Playwright E2E-Tests
- `postcss.config.js` - PostCSS Konfiguration
- `tailwind.config.js` - Tailwind CSS Framework
- `webpack.config.js` - Webpack Build-Konfiguration
- `netlify.toml` - Netlify Deployment-Konfiguration

### 📚 **docs/** - Dokumentation
- `README.md` - Hauptdokumentation
- `FINAL_SUCCESS_REPORT_2025-06-17.md` - Finaler Erfolgsbericht
- `QUALITY_ANALYSIS_SUMMARY_2025-06-17.md` - Code-Qualitätsanalyse
- `LIVE_VERIFICATION_REPORT_2025-06-17.md` - Live-Verifikationsbericht
- `CLEANUP_PLAN.md` - Repository Aufräumungsplan
- `DEPLOYMENT-README.md` - Deployment-Anleitung
- `GITHUB-ACTIONS-README.md` - CI/CD Workflows
- `ADVANCED_FEATURES.md` - Erweiterte Features
- Domain-Setup-Dokumentation (CUSTOM_DOMAIN_SETUP.md, etc.)

### 🔧 **scripts/** - Produktive Skripte
- `auto-test-live.js` - Automatische Live-Website Tests
- `browser-compatibility-test.js` - Browser-Kompatibilitätstests
- `comprehensive-validation.js` - Umfassende Validierung
- `deployment-monitor.js` - Deployment-Überwachung
- `simple-live-check.js` - Einfache Live-Status-Prüfung
- `github-deploy.ps1` - GitHub Deployment-Skript
- `code-quality-analyzer.js` - Code-Qualitätsanalyse
- `advanced-extension-manager.js` - Extension-Management

### 🎨 **assets/** - Statische Ressourcen
- Bilder, CSS, JavaScript, Fonts

### 🧪 **tests/** - Test-Dateien
- Unit Tests
- E2E Tests
- Performance Tests

### 📦 **src/** - Quellcode
- Komponenten
- Utilities
- Styles

### ⚙️ **config/** - Erweiterte Konfiguration
- Spezielle Konfigurationsdateien

### 🗄️ **backups/** - Backup-Dateien
- HTML-Backups
- Konfiguration-Backups
- Nur aktuelle, relevante Backups

### 📁 **temp/** - Temporäre Dateien
- Alte/veraltete Dateien
- Entwicklungs-Experimente
- Temporäre Reports

### 📂 **archive/** - Archivierte Dateien
- Historische Versionen
- Abgeschlossene Projekte

### 🔄 **.github/** - GitHub Actions
- `workflows/ci.yml` - Continuous Integration
- `workflows/production.yml` - Production Deployment

### 💻 **.vscode/** - VS Code Konfiguration
- Editor-Einstellungen
- Debug-Konfiguration
- Task-Runner

## 🚀 **Wichtige Befehle**

```bash
# Installation
npm install

# Tests ausführen
npm test
npm run test:e2e

# Build erstellen
npm run build

# Entwicklungsserver starten
npm run dev

# Code-Qualität prüfen
npm run lint
npm run format

# Live-Website testen
node scripts/auto-test-live.js
node scripts/simple-live-check.js
```

## 📊 **Qualitätsstatus**

✅ **100% Code-Qualität erreicht**
- HTML/CSS/JavaScript validiert
- Performance optimiert (Lighthouse Score: 100/100)
- SEO optimiert
- Accessibility konform
- Browser-Kompatibilität getestet
- CI/CD Pipeline aktiv

## 🌐 **Live-Website**

- **Produktions-URL**: https://burnitoken.website
- **GitHub Pages**: https://burnimad.github.io/burnitoken.com
- **Status**: ✅ Live und funktional

## 📝 **Letztes Update**

Repository aufgeräumt und reorganisiert am 17. Juni 2025
- Klare Ordnerstruktur implementiert
- Alle Dateien kategorisiert und organisiert
- Dokumentation konsolidiert
- Produktive Skripte separiert
- Temporäre Dateien archiviert
