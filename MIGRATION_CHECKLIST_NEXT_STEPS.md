# ✅ MIGRATION CHECKLISTE - NÄCHSTE SCHRITTE

## 🎯 AKTUELLER STATUS
- ✅ **Netlify:** Website deployed auf endearing-mandazi-d7b985.netlify.app
- ✅ **GitHub:** Mit Netlify verbunden
- ✅ **Simple Browser:** Funktioniert perfekt
- ✅ **Konfiguration:** Alle Migration-Files bereit
- 🔄 **Nächster Schritt:** NETLIFY CUSTOM DOMAIN SETUP

## 🚀 SCHRITT-FÜR-SCHRITT ANLEITUNG

### ⏰ JETZT SOFORT (5-10 Minuten)

#### 1. Netlify Custom Domain hinzufügen
```
📖 Anleitung: STEP_1_NETLIFY_SETUP.md
🌐 URL: https://app.netlify.com
🎯 Aktion: Custom Domain "burnitoken.website" hinzufügen
📝 Ergebnis: DNS Records von Netlify notieren
```

#### 2. IONOS DNS Records setzen
```
📖 Anleitung: STEP_2_IONOS_DNS_SETUP.md
🌐 URL: https://www.ionos.de/domains
🎯 Aktion: A/AAAA/CNAME Records auf Netlify umstellen
📝 Ergebnis: DNS Propagation startet
```

### ⏳ DANN WARTEN (24-48 Stunden)

#### 3. DNS Propagation Monitor starten
```bash
# Automatisches Monitoring starten
node dns-migration-monitor.js

# Oder manuell testen:
nslookup burnitoken.website
# Erwartung: 75.2.60.5
```

#### 4. Live-Tests nach Propagation
```
✅ https://burnitoken.website → BurniToken Website
✅ https://www.burnitoken.website → Redirect zu burnitoken.website
✅ SSL Certificate → Automatisch von Let's Encrypt
✅ Simple Browser → Funktioniert weiterhin
```

### 📊 NACH GO-LIVE (direkt nach DNS)

#### 5. Google Search Console Update
```
🔍 Property: burnitoken.website
📄 Neue Sitemap: https://burnitoken.website/sitemap.xml
🧪 URL-Prüfung: Teste neue Domain URLs
📈 Indexierung: Warte auf Google Crawling
```

#### 6. Google Analytics Setup
```
📊 GA4 Property: Erstelle für burnitoken.website
🔧 Integration: Code aus google-analytics-integration.html
📈 Tracking: Burn Calculator, Dashboard Views
```

## 📋 VERWENDETE DATEIEN

### Migration Guides
- `STEP_1_NETLIFY_SETUP.md` - Netlify Custom Domain Setup
- `STEP_2_IONOS_DNS_SETUP.md` - IONOS DNS Konfiguration
- `IONOS_TO_NETLIFY_MIGRATION.md` - Vollständige Anleitung

### Tools & Scripts
- `dns-migration-monitor.js` - Live DNS Monitoring
- `migration-manager.js` - Automatisierungs-Tool
- `google-analytics-integration.html` - Analytics Code

### Konfiguration
- `netlify.toml` - Redirects und Headers für SEO
- `sitemap.xml` - Bereits für burnitoken.website konfiguriert
- `robots.txt` - SEO-optimiert

## 🎯 TIMELINE ERWARTUNGEN

### Tag 1 (Heute)
- **0-15 Min:** Netlify + IONOS Setup
- **1-6 Std:** Erste DNS Propagation
- **6-24 Std:** Teilweise Live

### Tag 2-3 (24-48h)
- **Vollständige DNS Propagation**
- **SSL Certificate automatisch aktiv**
- **Alle Redirects funktionieren**
- **Google Search Console Update**

### Woche 1
- **SEO Rankings:** Erste Indexierung
- **Analytics:** User-Daten sammeln
- **Performance:** Core Web Vitals monitoring

## 🚨 WICHTIGE HINWEISE

### DNS Records EXAKT verwenden
```
A Record:    @    →    75.2.60.5
AAAA Record: @    →    2600:1f18:3fff:c001::5
CNAME:       www  →    endearing-mandazi-d7b985.netlify.app
TTL: 300 (5 Minuten)
```

### Bei Problemen
1. **DNS Checker:** https://www.whatsmydns.net/#A/burnitoken.website
2. **TTL reduzieren:** Auf 60 Sekunden in IONOS
3. **Netlify Support:** Falls DNS Verification fehlschlägt
4. **Monitoring:** dns-migration-monitor.js für Live-Status

## 🎉 MIGRATION BENEFITS

### Performance
- **Global CDN:** Netlify Edge Network
- **Automatic HTTPS:** Let's Encrypt SSL
- **Caching:** Optimierte Cache Headers
- **Compression:** Gzip/Brotli automatisch

### SEO
- **Custom Domain Authority:** burnitoken.website
- **Structured Data:** Schema.org implementiert
- **Open Graph:** Social Media optimiert
- **Core Web Vitals:** Performance-optimiert

### Development
- **Auto-Deploy:** Bei GitHub Push
- **Preview Deployments:** Für Pull Requests
- **Simple Browser:** Bleibt voll funktionsfähig
- **Live Features:** Burn Calculator & Dashboard

---

## 🚀 BEREIT ZUM START!

**Alle Vorbereitungen sind abgeschlossen. Du kannst JETZT mit Schritt 1 (Netlify Setup) beginnen!**

**Brauchst du Hilfe bei einem spezifischen Schritt? Ich helfe dir dabei! 💪**
