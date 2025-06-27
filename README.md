# 🏆 BurniToken.website - Vollständig automatisiert & qualitätsgesichert

[![Production Workflow](https://github.com/Kryptonator/burnitoken.com/actions/workflows/production.yml/badge.svg)](https://github.com/Kryptonator/burnitoken.com/actions/workflows/production.yml)
[![QA Workflow](https://github.com/Kryptonator/burnitoken.com/actions/workflows/qa-reports.yml/badge.svg)](https://github.com/Kryptonator/burnitoken.com/actions/workflows/qa-reports.yml)
[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fburnitoken.website)](https://burnitoken.website)

## 🚀 Live-Status & Qualität

**Alle Qualitäts- und Testberichte werden jetzt automatisch generiert und sind auf unserem Live-Dashboard verfügbar:**

### [➡️ Zum Live Status Dashboard](https://burnitoken.website/status.html)

Dieses Projekt verfügt über eine vollautomatische CI/CD-Pipeline, die bei jedem Commit den Code baut, testet, validiert und bei Erfolg auf GitHub Pages bereitstellt. Das Status-Dashboard bietet einen transparenten Echtzeit-Einblick in:

- **Lighthouse Scores** (Performance, SEO, Accessibility)
- **Playwright E2E-Test** Ergebnisse
- **ESLint Code-Qualität**

---

## 📁 Repository Struktur (Stand: 21.06.2025)

```text
burnitoken.com/
├── .github/          # GitHub Actions Workflows
├── .vscode/          # VS Code Konfiguration
├── assets/           # Statische Assets (CSS, Images, Videos)
├── docs/             # Konsolidierte Dokumentation
│   ├── ci-cd/        # CI/CD-Dokumentation
│   ├── deployment/   # Deployment-Anleitungen
│   ├── NETLIFY_OPTIMIZATION.md  # Netlify-Optimierungsanleitung
│   ├── JFROG_NETLIFY_INTEGRATION.md  # JFrog-Netlify-Integration
│   ├── development/  # Entwicklerdokumentation
│   └── reports/      # Statusberichte
├── src/              # Quellcode
│   ├── js/           # JavaScript-Module
│   └── css/          # CSS-Quelldateien
├── tools/            # Entwicklungstools und Skripte
│   ├── extension-management/ # VS Code Extension-Management
│   ├── monitoring/   # Website-Monitoring-Tools
│   ├── powershell/   # PowerShell-Skripte
│   └── validation/   # Validierungs-Tools
├── e2e/              # E2E-Test Suites (Playwright)
├── tests/            # Unit-/Integrationstests (Jest)
├── config/           # Konfigurationsdateien
├── netlify/          # Netlify-Funktionen und -Konfiguration
│   ├── functions/    # Serverlose Funktionen
│   └── plugin-config.toml  # Plugin-Konfiguration
├── index.html        # Hauptwebseite
└── README.md         # Hauptdokumentation
```

> **Hinweis:** Am 21.06.2025 wurde das Repository vollständig bereinigt und neu strukturiert. Alle temporären Dateien, Backups, leere Dateien und große Binärdateien wurden entfernt. Die Ordnerstruktur wurde optimiert und alle Skripte und Dokumentationen wurden an zentralen Stellen konsolidiert.

## Mitwirkende

Dieses Projekt wird von einem engagierten Team vorangetrieben:

- **Kryptonator** - Projektleitung & Entwicklung
- **GitHub Copilot** - KI-Assistent & Automatisierungs-Spezialist

---

## 🚀 Live Deployment

- **URL:** [https://burnitoken.website](https://burnitoken.website)
- **Hosting:** GitHub Pages
- **CDN:** Fastly/Varnish
- **SSL:** GitHub TLS (A+ Rating)
- **Monitoring:** Sentry + Custom Scripts
