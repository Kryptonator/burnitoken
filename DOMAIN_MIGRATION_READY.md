# 🎯 DOMAIN MIGRATION: IONOS → NETLIFY - READY TO EXECUTE

**Status:** ✅ **BEREIT ZUR AUSFÜHRUNG**  
**Domain:** burnitoken.website  
**Current Netlify:** endearing-mandazi-d7b985.netlify.app  
**Target:** https://burnitoken.website  

## 🚀 NÄCHSTE SCHRITTE (Reihenfolge befolgen)

### SCHRITT 1: Netlify Custom Domain Setup (5 Minuten)

**In Netlify Dashboard:**
```
1. Gehe zu: https://app.netlify.com/sites/endearing-mandazi-d7b985
2. Klicke: Site settings → Domain management
3. Klicke: "Add custom domain"
4. Eingabe: burnitoken.website
5. Bestätige: "Yes, add domain"
```

**Netlify zeigt dann die DNS Records:**
```
A Record:    75.2.60.5
AAAA Record: 2600:1f18:3fff:c001::5
```

### SCHRITT 2: IONOS DNS Records setzen (10 Minuten)

**In IONOS Domain Center:**
```
1. Gehe zu: https://www.ionos.de/domains
2. Klicke: burnitoken.website → DNS verwalten
3. LÖSCHE alle bestehenden A/CNAME Records
4. SETZE neue Records:
   
   Typ: A
   Name: @
   Wert: 75.2.60.5
   TTL: 300
   
   Typ: AAAA  
   Name: @
   Wert: 2600:1f18:3fff:c001::5
   TTL: 300
   
   Typ: CNAME
   Name: www
   Wert: endearing-mandazi-d7b985.netlify.app
   TTL: 300

5. Speichern und aktivieren
```

### SCHRITT 3: Google Search Console Update (5 Minuten)

**In Google Search Console:**
```
1. Property: burnitoken.website
2. Sitemaps → Neue Sitemap hinzufügen:
   https://burnitoken.website/sitemap.xml
3. URL-Prüfung testen:
   https://burnitoken.website
```

### SCHRITT 4: Warten & Testen (24-48 Stunden)

**DNS Propagation Check:**
```
nslookup burnitoken.website
dig burnitoken.website
```

**Live Tests:**
- https://burnitoken.website → Sollte BurniToken Website laden
- https://www.burnitoken.website → Sollte zu burnitoken.website redirecten
- SSL Certificate → Sollte automatisch aktiviert werden

## 📊 NACH MIGRATION: Google Analytics Setup

### Google Analytics 4 Property erstellen:

1. **Gehe zu:** https://analytics.google.com
2. **Erstelle:** Neue Property für "burnitoken.website"
3. **Kopiere:** Tracking ID (G-XXXXXXXXXX)
4. **Integriere:** Code in index.html (siehe google-analytics-integration.html)

### Analytics Integration Code:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🎯 ERWARTETE ERGEBNISSE

### Nach DNS Propagation (24-48h):
- ✅ **https://burnitoken.website** → Live BurniToken Website
- ✅ **https://burnitoken.website/live-dashboard.html** → Live Dashboard
- ✅ **www.burnitoken.website** → Automatischer Redirect
- ✅ **SSL Certificate** → Automatisch von Let's Encrypt
- ✅ **Global CDN** → Weltweite Performance
- ✅ **SEO Benefits** → Custom Domain Authority

### Performance Verbesserungen:
- **Geschwindigkeit:** Netlify Global CDN
- **Verfügbarkeit:** 99.9% Uptime SLA
- **Sicherheit:** Automatische HTTPS + Security Headers
- **SEO:** Custom Domain + Structured Data
- **Analytics:** Detailliertes User Tracking

## 🔧 TROUBLESHOOTING

### Falls DNS nicht propagiert (nach 48h):
```bash
# DNS Check Tools:
https://www.whatsmydns.net/#A/burnitoken.website
https://dnschecker.org/#A/burnitoken.website

# TTL reduzieren in IONOS auf 60 Sekunden
# Cloudflare DNS Flush: https://1.1.1.1/purge-cache/
```

### Falls SSL Certificate Fehler:
```
Netlify → Site settings → Domain management
→ HTTPS → "Verify DNS configuration"
→ "Renew certificate"
```

## 📈 NACH GO-LIVE CHECKLIST

### Erste Woche:
- [ ] **PageSpeed Insights:** Score 90+
- [ ] **Google Search Console:** Keine Crawling-Fehler
- [ ] **Analytics:** Tracking funktioniert
- [ ] **Social Media:** Open Graph Tags testen
- [ ] **Mobile:** Responsive Design Check

### Erste Monat:
- [ ] **SEO Rankings:** Google Position Monitoring
- [ ] **Core Web Vitals:** Performance Metriken
- [ ] **User Analytics:** Behavior Flow Analysis
- [ ] **Conversion Tracking:** Burn Calculator Usage
- [ ] **Technical SEO:** Schema.org Markup

## 🎉 READY TO EXECUTE!

**Alle Konfigurationen sind vollständig vorbereitet:**
- ✅ Netlify Deployment aktiv
- ✅ Domain-Redirects konfiguriert
- ✅ SEO-Optimierungen implementiert
- ✅ Google Integration vorbereitet
- ✅ Analytics Code bereit

**Die Migration kann JETZT starten!**

---

**Timeline:** IONOS DNS Setup (heute) → DNS Propagation (24-48h) → Full Live Migration ✅

**Support:** Bei Problemen alle Konfigurationsdateien sind dokumentiert und einsatzbereit.
