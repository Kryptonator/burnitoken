# 🌐 BURNITOKEN CUSTOM DOMAIN SETUP GUIDE

## 📅 Setup Date: June 16, 2025

---

## 🎯 **IHRE CUSTOM DOMAIN KONFIGURATION**

### **✅ SCHRITT 1: CNAME-Datei erstellt (Automatisch erledigt)**

- Datei: `CNAME`
- Inhalt: `burnitoken.com`
- Status: ✅ Erstellt und wird beim nächsten Push aktiviert

---

## 🔧 **SCHRITT 2: DNS-EINSTELLUNGEN (Bei Ihrem Domain-Anbieter)**

### **OPTION A: APEX DOMAIN (burnitoken.com)**

```dns
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153

Type: CNAME
Name: www
Value: kryptonator.github.io
```

### **OPTION B: SUBDOMAIN (www.burnitoken.com)**

```dns
Type: CNAME
Name: www
Value: kryptonator.github.io

Type: CNAME
Name: @
Value: kryptonator.github.io
```

---

## 🏆 **EMPFOHLENE KONFIGURATION (BEIDE):**

### **Für MAXIMUM Erreichbarkeit:**

```dns
# Apex Domain (burnitoken.com)
Type: A
Name: @
Values: 185.199.108.153
        185.199.109.153
        185.199.110.153
        185.199.111.153

# WWW Subdomain (www.burnitoken.com)
Type: CNAME
Name: www
Value: kryptonator.github.io

# Alternate subdomain (optional)
Type: CNAME
Name: website
Value: kryptonator.github.io
```

---

## ⏱️ **TIMING & AKTIVIERUNG:**

### **Sofort (0-30 Minuten):**

1. ✅ CNAME-Datei wird mit nächstem Git Push aktiviert
2. 🔄 DNS-Einstellungen bei Domain-Anbieter vornehmen
3. ⏳ GitHub Pages erkennt Custom Domain automatisch

### **Propagation (1-24 Stunden):**

- DNS-Propagation weltweit
- SSL-Zertifikat wird automatisch erstellt
- Domain wird vollständig aktiviert

---

## 🔒 **SICHERHEITS-FEATURES (Automatisch aktiviert):**

### **✅ Was GitHub Pages automatisch macht:**

- **SSL/TLS Zertifikat** (Let's Encrypt)
- **HTTPS Enforcement**
- **HSTS Headers**
- **CDN Distribution**
- **DDoS Protection**

---

## 📊 **DOMAIN-ANBIETER ANLEITUNGEN:**

### **Namecheap:**

1. Dashboard → Domain List → Manage
2. Advanced DNS → Add New Record
3. DNS-Einstellungen eingeben
4. Save Changes

### **GoDaddy:**

1. My Products → DNS → Manage Zones
2. Add Record → Type auswählen
3. DNS-Werte eingeben
4. Save

### **Cloudflare:**

1. DNS → Records → Add record
2. Type, Name, Content eingeben
3. Proxy status: DNS only (grau)
4. Save

### **1&1/IONOS:**

1. Domains & SSL → Domain verwalten
2. DNS Einstellungen → Bearbeiten
3. Records hinzufügen
4. Speichern

---

## 🎯 **NACH DER KONFIGURATION:**

### **Live URLs (nach DNS-Propagation):**

- **https://burnitoken.com** ← Hauptdomain
- **https://www.burnitoken.com** ← Mit www
- **https://kryptonator.github.io/burnitoken/** ← GitHub Fallback

### **Verifikation:**

```bash
# DNS testen:
nslookup burnitoken.com

# Website testen:
curl -I https://burnitoken.com
```

---

## 🚀 **SOFORTIGE AKTIVIERUNG:**

### **Was Sie JETZT tun müssen:**

1. **DNS-Einstellungen** bei Ihrem Domain-Anbieter vornehmen
2. **CNAME-Datei committen** (ich mache das gleich)
3. **24-48h warten** für vollständige Propagation
4. **Domain-Verifikation** in GitHub Pages aktivieren

---

## 💡 **ZUSÄTZLICHE EMPFEHLUNGEN:**

### **Performance:**

- Cloudflare CDN (optional)
- Custom DNS (8.8.8.8, 1.1.1.1)
- Domain-Monitoring Setup

### **SEO:**

- Weiterleitungen von www ↔ non-www
- Canonical URLs definiert
- Sitemap bei Search Engines einreichen

---

## ✅ **NÄCHSTE SCHRITTE:**

1. **DNS konfigurieren** (Sie bei Domain-Anbieter)
2. **CNAME committen** (ich mache das)
3. **GitHub Pages Custom Domain aktivieren** (automatisch)
4. **Testen und verifizieren** (24-48h später)

---

_Custom Domain Setup bereit - Professional branding incoming! 🌟_
