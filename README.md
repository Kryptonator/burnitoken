# 🏆 BurniToken.website - Mission-Critical Live Operations

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fburnitoken.website)](https://burnitoken.website)
[![XRPL Oracle Status](https://img.shields.io/badge/XRPL%20Price%20Oracle-Live-green)](https://burnitoken.website)
[![Performance](https://img.shields.io/badge/Performance-A-green)](https://burnitoken.website)
[![Security](https://img.shields.io/badge/Security-HTTPS-green)](https://burnitoken.website)
[![Mobile](https://img.shields.io/badge/Mobile-Optimized-green)](https://burnitoken.website)
[![CI Tests](https://github.com/burnitoken/burnitoken.com/actions/workflows/ci.yml/badge.svg)](https://github.com/burnitoken/burnitoken.com/actions/workflows/ci.yml)
[![CI/CD Pipeline](https://github.com/burnitoken/burnitoken.com/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/burnitoken/burnitoken.com/actions/workflows/ci-cd.yml)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-Optimized-brightgreen)](https://github.com/burnitoken/burnitoken.com/actions)
[![Accessibility](https://img.shields.io/badge/WCAG-AA-brightgreen)](https://github.com/burnitoken/burnitoken.com/actions)

## 🎯 Status: Live, Robust & Monitored

Die Live-Website [burnitoken.website](https://burnitoken.website) ist **vollständig technisch, funktional und qualitativ abgesichert** und wird durch ein proaktives Überwachungssystem permanent überwacht.

### ⚡ Key Features

- **Live XRPL Price Oracle:** Direkte, dezentrale Preisabfrage aus dem XRPL-Orderbuch in Echtzeit.
- **Automated Health Checks:** Tägliche, automatisierte Überprüfung aller kritischen Systeme inkl. XRPL-Konnektivität.
- **Real-time Alerting:** Sofortige Benachrichtigung bei Fehlern via Slack, Discord und Status-Webhooks.
- **High-Performance Frontend:** Optimierte Ladezeiten, responsive Design und hohe Verfügbarkeit.

## 🛠️ System Architecture

Die Architektur ist auf maximale Robustheit, Dezentralisierung und Performance ausgelegt.

```text
burnitoken.website/
├── .github/workflows/   # GitHub Actions: CI/CD, Health Checks
├── assets/
│   ├── js/
│   │   └── price-oracle.js # Client-seitiges XRPL Preis-Orakel
│   └── ...
├── tools/
│   └── health-check.js   # Skript für automatisierte Health-Checks
├── index.html            # Haupt-Website mit Orakel-Integration
└── README.md             # Projektdokumentation
```

### Preis-Orakel: Direkte XRPL-Integration

Das Herzstück der Seite ist das `BurniPriceOracle`, eine client-seitige JavaScript-Klasse, die über WebSockets direkt mit dem XRPL-Netzwerk (`wss://xrplcluster.com/`) kommuniziert. Anstatt sich auf zentrale APIs (wie CoinGecko) zu verlassen, fragt das Orakel das `book_offers` (Orderbuch) für das Handelspaar BURNI/XRP direkt ab. Dies sorgt für:

- **Dezentralisierung:** Keine Abhängigkeit von Drittanbieter-APIs.
- **Echtzeit-Daten:** Preise werden live aus dem Ledger gestreamt.
- **Robustheit:** Das System fängt Fehler ab und zeigt einen klaren Status in der UI an.

### Überwachung: Proaktive Health-Checks

Ein täglicher GitHub-Actions-Workflow (`.github/workflows/health-check.yml`) führt ein umfassendes Health-Check-Skript (`tools/health-check.js`) aus. Dieses Skript:

1. **Prüft die Erreichbarkeit** der Website und kritischer Endpunkte.
2. **Verifiziert die SSL-Zertifikate** und DNS-Einträge.
3. **Simuliert eine XRPL-Preisabfrage**, um die Funktionalität des Preis-Orakels zu testen.
4. **Erstellt einen detaillierten Report** (`HEALTH_REPORT.md`).
5. **Sendet bei Fehlern Alarme** an Slack, Discord und erstellt automatisch ein GitHub-Issue.

## 🚀 Live Deployment & Monitoring

- **URL:** [https://burnitoken.website](https://burnitoken.website)
- **Hosting:** Netlify
- **SSL:** Let's Encrypt (via Netlify)
- **Monitoring:** GitHub Actions, Slack/Discord Alerts, Status-Webhooks

## ✅ Mission Complete

Das Projekt hat alle Ziele erreicht: Eine technisch exzellente, robuste und proaktiv überwachte Web-Präsenz mit einer dezentralen, live an das XRPL angebundenen Preisanzeige. Die Automatisierung von Tests, Health-Checks und Alerts stellt den stabilen Betrieb sicher.

---

> Letzte Aktualisierung: 19.06.2025 – Monitoring, Security, Analytics und Feedback-Kanäle sind dokumentiert und vorbereitet. Für produktive Nutzung API-Keys und Links anpassen!
