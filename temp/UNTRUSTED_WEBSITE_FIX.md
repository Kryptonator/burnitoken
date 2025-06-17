# 🚨 UNTRUSTED WEBSITE PROBLEM - SOFORT-FIXES

## Problem

GitHub Pages URL `https://kryptonator.github.io/burnitoken` wird als "untrusted" angezeigt

## Mögliche Ursachen

1. 🚨 SSL-Zertifikat noch nicht generiert (bei neuen Domains bis 24h)
2. 🚨 GitHub Pages "Enforce HTTPS" nicht aktiviert
3. 🚨 DNS Propagation läuft noch
4. 🚨 Custom Domain Konfiguration fehlerhaft

## SOFORT-AKTIONEN ERFORDERLICH:

### 1. GitHub Repository Settings prüfen:

- Repository: https://github.com/Kryptonator/burnitoken
- Settings → Pages
- Custom domain: burnitoken.website
- ✅ "Enforce HTTPS" AKTIVIEREN!

### 2. DNS bei Domain-Provider prüfen:

- CNAME: burnitoken.website → kryptonator.github.io
- A-Records zu GitHub Pages IPs

### 3. Alternative temporär nutzen:

- ✅ https://burnitoken.website (Custom Domain)
- ⚠️ http://kryptonator.github.io/burnitoken (ohne HTTPS)

## Status

- ✅ CNAME-Datei korrekt
- ❓ GitHub Pages HTTPS Settings
- ❓ DNS Propagation
- ❓ SSL-Zertifikat Status

**NÄCHSTER SCHRITT: GitHub Repository Settings überprüfen!**
