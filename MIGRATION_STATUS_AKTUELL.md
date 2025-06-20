# 🎯 MIGRATION STATUS - Aktueller Stand (Screenshot-Analyse)

## 📋 IONOS DNS Records - IST-Zustand (20.06.2025)

### ✅ Bereits korrekt konfiguriert:
```dns
CNAME    _domainconnect    _domainconnect.ionos.com    (Domain Connect)
TXT      @                 google-site-verification=... (Google Verification ✅)
MX       @                 mx00.ionos.de               (Mail Server ✅)
MX       @                 mx01.ionos.de               (Mail Server ✅)
CNAME    www               endearing-mandazi-d7b985.netlify.app (WWW → Netlify ✅)
```

### ❌ FEHLT NOCH für Go-Live:
```dns
A Record     @    75.2.60.5                    (Hauptdomain → Netlify)
AAAA Record  @    2600:1f18:3fff:c001::5       (IPv6 Hauptdomain → Netlify)
```

## 🚨 Nächster Schritt: A/AAAA Records hinzufügen

### Genau diese 2 Records in IONOS erstellen:

1. **"Record hinzufügen" Button klicken**

2. **A Record für Hauptdomain:**
   ```
   TYP:       A
   HOSTNAME:  @
   WERT:      75.2.60.5
   SERVICE:   - (leer)
   TTL:       1 Minute (60 Sekunden) ⚡⚡ ULTRA SCHNELL
   ```

3. **AAAA Record für IPv6:**
   ```
   TYP:       AAAA
   HOSTNAME:  @
   WERT:      2600:1f18:3fff:c001::5
   SERVICE:   - (leer)
   TTL:       1 Minute (60 Sekunden) ⚡⚡ ULTRA SCHNELL
   ```

## 🕐 TTL-Erklärung für Migration

**TTL = Time To Live (Cache-Zeit für DNS)**

**Während Migration (JETZT):**
- ✅ **1 Stunde TTL** = DNS-Änderungen werden schnell übernommen
- ✅ **Propagation:** 1-6 Stunden weltweit
- ✅ **Vorteil:** Schnelle Korrektur bei Problemen möglich

**Nach Go-Live (später ändern):**
- 🔄 **24 Stunden TTL** = Standard für stabile Domains  
- 🔄 **Performance:** Weniger DNS-Abfragen, bessere Geschwindigkeit

## 📊 Nach dem Update - Erwarteter DNS-Zustand:

```dns
✅ A Record     @                 75.2.60.5                           (NEU!)
✅ AAAA Record  @                 2600:1f18:3fff:c001::5               (NEU!)
✅ CNAME        www               endearing-mandazi-d7b985.netlify.app (Bleibt)
✅ TXT          @                 google-site-verification=...         (Bleibt)
✅ MX           @                 mx00.ionos.de                        (Bleibt)
✅ MX           @                 mx01.ionos.de                        (Bleibt)
```

## ⏰ Timeline nach DNS-Update:

### Sofort (0-5 Minuten):
- DNS Records werden in IONOS gespeichert
- Netlify beginnt Domain-Verification

### 15-30 Minuten:
- Netlify erkennt DNS-Konfiguration
- SSL-Zertifikat wird automatisch generiert
- `https://burnitoken.website` wird aktiv

### 24-48 Stunden:
- Vollständige DNS-Propagation weltweit
- Alle Benutzer sehen neue Domain
- Migration 100% abgeschlossen

## 🔍 Monitoring-Befehle:

Nach DNS-Update diese Befehle ausführen:

```powershell
# DNS-Check
nslookup burnitoken.website

# Website-Test
curl -I https://burnitoken.website

# Netlify SSL Status prüfen
# Netlify Dashboard → Domain Settings → HTTPS
```

## 🎯 Go-Live Checklist:

### Phase 1: DNS Update (JETZT)
- [ ] A Record @ → 75.2.60.5 hinzufügen
- [ ] AAAA Record @ → 2600:1f18:3fff:c001::5 hinzufügen
- [ ] IONOS speichern & bestätigen

### Phase 2: Verification (15-30 Min)
- [ ] Netlify Domain Status prüfen
- [ ] SSL Certificate automatisch aktiv
- [ ] `https://burnitoken.website` testet

### Phase 3: SEO/Analytics (Nach Go-Live)
- [ ] Google Search Console Sitemap update
- [ ] Google Analytics Code einbauen
- [ ] Social Media Links testen
- [ ] Performance-Check (PageSpeed)

---

**🚀 BEREIT FÜR GO-LIVE!** 
Nur noch 2 DNS Records hinzufügen → Website läuft auf burnitoken.website
