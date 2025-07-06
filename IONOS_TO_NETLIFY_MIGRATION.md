# 🌐 IONOS zu Netlify Domain Migration Guide

## 📋 Aktueller Status
- ✅ **Domain:** burnitoken.website (bei IONOS)
- ✅ **Netlify:** Deployment läuft auf endearing-mandazi-d7b985.netlify.app
- ✅ **GitHub:** Mit Netlify verbunden
- ✅ **Google Search Console:** Für burnitoken.website eingerichtet

## 🎯 Ziel: Domain von IONOS zu Netlify weiterleiten

### Schritt 1: Netlify Custom Domain Setup

1. **In Netlify Dashboard:**
   ```
   Site: endearing-mandazi-d7b985.netlify.app
   → Site settings → Domain management
   → Add custom domain: burnitoken.website
   ```

2. **Netlify DNS Records (werden angezeigt):**
   ```
   A Record: 75.2.60.5
   AAAA Record: 2600:1f18:3fff:c001::5
   CNAME: endearing-mandazi-d7b985.netlify.app
   ```

### Schritt 2: IONOS DNS Konfiguration

**In IONOS Domain Center:**

1. **Gehe zu:** Domains & SSL → burnitoken.website → DNS

2. **Lösche bestehende Records:**
   - Alte CNAME zu endearing-mandazi-d7b985.netlify.app (falls vorhanden)
   - Alte A Records

3. **Setze neue Netlify DNS Records:**

```dns
# Hauptdomain (ultra-niedrige TTL für sofortige Migration)
A Record:    @              75.2.60.5          TTL: 1 Minute (60) ⚡⚡
AAAA Record: @              2600:1f18:3fff:c001::5   TTL: 1 Minute (60) ⚡⚡

# WWW Subdomain
CNAME:       www            endearing-mandazi-d7b985.netlify.app   TTL: 1 Minute (60) ⚡⚡

# Netlify Domain Verification (wenn angezeigt)
TXT:         @              netlify-verification-string   TTL: 1 Minute (60) ⚡⚡
```

### 🕐 TTL-Strategie für Migration:

**Während Migration (jetzt) - ULTRA SCHNELL:**
- TTL: 1 Minute (60 Sekunden) = Blitzschnelle DNS-Updates ⚡⚡
- Propagation: 1-10 Minuten weltweit
- Änderungen werden quasi sofort übernommen

**Nach erfolgreicher Migration (später):**
- TTL: 24 Stunden (86400 Sekunden) = Standard für stabile Domains
- Bessere Performance durch weniger DNS-Abfragen
- Reduziert DNS-Server-Last

### Schritt 3: Netlify SSL Certificate

Nach DNS-Setup (24-48h):
```
Netlify → Site settings → Domain management
→ HTTPS → Verify DNS configuration
→ Let's Encrypt certificate (automatisch)
```

## 🔍 Google Search Console Integration

### Neue Sitemap URL für Google

**In Google Search Console:**

1. **Property:** burnitoken.website
2. **Sitemaps → Neue Sitemap hinzufügen:**
   ```
   https://burnitoken.website/sitemap.xml
   ```

3. **URL-Prüfung testen:**
   ```
   https://burnitoken.website
   https://burnitoken.website/live-dashboard.html
   ```

### Zusätzliche Google Integration

**Analytics & Performance:**
```
Google Analytics 4: Tracking Code für burnitoken.website
Google PageSpeed Insights: Performance-Monitoring
Google Tag Manager: Advanced Tracking
```

## 🚀 Netlify Optimierungen für Production

### Headers für SEO & Performance
Bereits in `netlify.toml` konfiguriert:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "index, follow"
    Cache-Control = "public, max-age=31536000, immutable"
```

### Redirects für SEO
```toml
# WWW zu non-WWW
[[redirects]]
  from = "https://www.burnitoken.website/*"
  to = "https://burnitoken.website/:splat"
  status = 301

# Old Netlify URL zu Custom Domain
[[redirects]]
  from = "https://endearing-mandazi-d7b985.netlify.app/*"
  to = "https://burnitoken.website/:splat"
  status = 301
```

## 📊 Nach Migration - Checklist

### DNS Propagation (24-48h)
- [ ] `nslookup burnitoken.website` → Netlify IP
- [ ] `https://burnitoken.website` → Lädt korrekt
- [ ] `https://www.burnitoken.website` → Redirect zu main domain

### Google Search Console
- [ ] Neue Sitemap eingereicht
- [ ] URL-Indexierung getestet
- [ ] Core Web Vitals Monitoring aktiv
- [ ] Mobile Usability Check

### Performance & SEO
- [ ] PageSpeed Insights: 90+ Score
- [ ] SSL Certificate aktiv (HTTPS)
- [ ] Social Media Cards funktionieren
- [ ] Search Engine Preview korrekt

## 🎯 Erwartete Ergebnisse

**Live URLs nach Migration:**
- ✅ `https://burnitoken.website` → Hauptseite
- ✅ `https://burnitoken.website/live-dashboard.html` → Dashboard
- ✅ `https://www.burnitoken.website` → Redirect zu main
- ✅ `https://endearing-mandazi-d7b985.netlify.app` → Redirect zu main

**SEO Benefits:**
- Custom Domain Authority
- Google Search Console Integration
- Automatic HTTPS/SSL
- Global CDN Performance
- Social Media Sharing Optimization

---

**Next Steps:** IONOS DNS Records setzen → 24-48h warten → Google Sitemap update
