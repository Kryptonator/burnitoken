# SEO & Performance Tools

Tools zur Überwachung und Verbesserung der SEO und Performance der Burnitoken-Website.

## Core Web Vitals & Fehlerseiten-Monitor

Dieses Tool überwacht die Core Web Vitals der Website und testet die Fehlerseiten auf korrekte Funktionalität.

```bash
# Standard-Check durchführen
npm run web-vitals

# Ausführlichen Test aller wichtigen Seiten durchführen
npm run web-vitals:full

# Nur Fehlerseiten (404, 500) testen
npm run web-vitals:errors

# CI-Modus mit Exit-Code für Pipelines
npm run web-vitals:ci
```

Direkt ausführen:

```bash
node tools/core-web-vitals-monitor.js [--full|--error-pages|--ci]
```

## Meta-Tags & Social Media Cards Validator

Dieses Tool überprüft Meta-Tags, Open Graph, Twitter Cards und strukturierte Daten für bessere SEO und Social Media Sharing.

```bash
# Standard-Check durchführen
npm run meta-tags

# CI-Modus mit Exit-Code für Pipelines
npm run meta-tags:ci
```

Direkter Aufruf mit bestimmter URL:

```bash
node tools/meta-tags-validator.js --url=https://burnitoken.website/token/
```

## Google Search Console Tools

Siehe [GSC_TOOLS_README.md](GSC_TOOLS_README.md) für Details zu den Google Search Console Tools.

## Integration in CI/CD

Die Tools sind in zwei GitHub Actions Workflows integriert:

1. `.github/workflows/gsc-weekly-check.yml`: Wöchentliche Google Search Console Checks
2. `.github/workflows/web-vitals-check.yml`: Wöchentliche Web Vitals und Meta-Tags Checks

## VS Code Integration

VS Code Tasks für schnellen Zugriff auf alle SEO & Performance Tools:

- 🔍 GSC: Status Check
- 🔍 GSC: Diagnose Mode
- 🔧 GSC: Setup Guide
- 📊 Core Web Vitals Check
- 📊 Core Web Vitals: Ausführlicher Check
- 📊 Fehlerseiten-Check
- 🏷️ Meta-Tags Validator
