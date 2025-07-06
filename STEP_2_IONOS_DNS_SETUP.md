# 🌐 IONOS DNS SETUP - SCHRITT 2

## 🔑 VORAUSSETZUNG: Netlify DNS Records

**Du brauchst diese Werte von Netlify (aus Schritt 1):**
```
A Record:    75.2.60.5
AAAA Record: 2600:1f18:3fff:c001::5
CNAME:       endearing-mandazi-d7b985.netlify.app
TXT Record:  netlify-verification-xxxxx (falls angezeigt)
```

## 🚀 IONOS Domain Center öffnen

**Jetzt ausführen:**
1. Gehe zu: https://www.ionos.de/
2. Login mit deinem IONOS Account
3. Gehe zu: **Domains & SSL**
4. Finde: **burnitoken.website**
5. Klicke auf: **DNS** (oder "DNS verwalten")

## 🗑️ SCHRITT 1: Alte Records löschen

**Lösche ALLE bestehenden Records:**
- Alle A Records (@, www, *, etc.)
- Alle AAAA Records
- Alle CNAME Records (besonders zu netlify.app)
- Behalte nur: MX Records (E-Mail) und NS Records (Nameserver)

## ➕ SCHRITT 2: Neue Netlify DNS Records setzen

**Setze diese Records EXAKT so:**

### A Record (IPv4):
```
Name/Host: @
Typ: A
Wert: 75.2.60.5
TTL: 300
```

### AAAA Record (IPv6):
```
Name/Host: @
Typ: AAAA
Wert: 2600:1f18:3fff:c001::5
TTL: 300
```

### CNAME Record (WWW Subdomain):
```
Name/Host: www
Typ: CNAME
Wert: endearing-mandazi-d7b985.netlify.app
TTL: 300
```

### TXT Record (nur falls Netlify es anzeigt):
```
Name/Host: @
Typ: TXT
Wert: netlify-verification-xxxxxxxxxxxxxxx
TTL: 300
```

## ✅ SCHRITT 3: Speichern und Aktivieren

1. **Klicke:** "Speichern" oder "Records hinzufügen"
2. **Bestätige:** Alle Änderungen
3. **Aktiviere:** DNS-Konfiguration

## ⏰ SCHRITT 4: DNS Propagation abwarten

**Timeline:**
- **5-30 Minuten:** Erste DNS-Updates
- **2-6 Stunden:** Teilweise Propagation
- **24-48 Stunden:** Vollständige weltweite Propagation

## 🧪 TESTEN während Propagation

**Befehle zum Testen:**
```bash
# DNS Lookup testen
nslookup burnitoken.website

# Erwartetes Ergebnis:
# Address: 75.2.60.5

# Online DNS Checker:
# https://www.whatsmydns.net/#A/burnitoken.website
```

## 🎯 ERWARTETE ERGEBNISSE

### Nach 2-6 Stunden:
- ✅ `burnitoken.website` → Zeigt auf Netlify IP
- ✅ Netlify zeigt: "DNS configuration verified"
- ✅ SSL Certificate wird automatisch erstellt

### Nach 24-48 Stunden:
- ✅ `https://burnitoken.website` → Live BurniToken Website
- ✅ `https://www.burnitoken.website` → Automatischer Redirect
- ✅ SSL Certificate: Let's Encrypt aktiv

## ❌ TROUBLESHOOTING

### Falls DNS nicht funktioniert:
1. **TTL reduzieren:** Setze TTL auf 60 Sekunden
2. **Cache leeren:** Router/Computer DNS Cache
3. **Unterschiedliche DNS:** Teste mit 8.8.8.8 und 1.1.1.1
4. **IONOS Support:** Falls Records nicht gespeichert werden

### Falls SSL Fehler:
1. **Warte 48h** für DNS Propagation
2. **Netlify:** Site settings → HTTPS → "Renew certificate"
3. **Force HTTPS:** Aktivieren nach SSL Certificate

---

## 🔄 NÄCHSTER SCHRITT: Google Search Console

**Nach DNS Propagation (24-48h):**
1. Google Search Console: Neue Sitemap einreichen
2. URL-Indexierung testen
3. Performance Monitoring aktivieren

**Hast du die DNS Records bei IONOS gesetzt? Dann warten wir auf Propagation! ⏱️**
