# 🌐 IONOS DNS KONFIGURATION - burnitoken.website

## 📅 Setup Date: June 16, 2025

## 🎯 Domain: burnitoken.website

## 🏢 Provider: IONOS.de

---

## 🚀 IONOS DNS SETUP - SCHRITT FÜR SCHRITT

### **SCHRITT 1: IONOS KUNDENCENTER ÖFFNEN**

1. **URL:** https://www.ionos.de/login
2. **Einloggen** mit Ihren IONOS-Zugangsdaten
3. **"Domains & SSL"** auswählen
4. **"burnitoken.website"** anklicken

### **SCHRITT 2: DNS EINSTELLUNGEN ÖFFNEN**

1. **"DNS"** Tab anklicken
2. **"DNS-Einstellungen bearbeiten"** wählen
3. **Oder:** "Weitere Einstellungen" → "DNS-Einstellungen"

---

## 🔧 **DNS RECORDS BEI IONOS HINZUFÜGEN**

### **ALLE BESTEHENDEN A-RECORDS LÖSCHEN**

_(Falls vorhanden - wichtig für saubere Konfiguration)_

### **NEUE A-RECORDS ERSTELLEN:**

#### **A-Record 1:**

```
Record Type: A
Host: @ (oder leer lassen)
Points to: 185.199.108.153
TTL: 3600 (Standard)
```

#### **A-Record 2:**

```
Record Type: A
Host: @ (oder leer lassen)
Points to: 185.199.109.153
TTL: 3600 (Standard)
```

#### **A-Record 3:**

```
Record Type: A
Host: @ (oder leer lassen)
Points to: 185.199.110.153
TTL: 3600 (Standard)
```

#### **A-Record 4:**

```
Record Type: A
Host: @ (oder leer lassen)
Points to: 185.199.111.153
TTL: 3600 (Standard)
```

#### **CNAME-Record für WWW:**

```
Record Type: CNAME
Host: www
Points to: kryptonator.github.io
TTL: 3600 (Standard)
```

---

## 📱 **IONOS MOBILE APP ALTERNATIVE**

Falls Sie die IONOS App nutzen:

1. **IONOS App** öffnen
2. **Domain** auswählen
3. **DNS** → **DNS-Records verwalten**
4. **Obige Records hinzufügen**

---

## ⏰ **IONOS SPEZIFISCHE TIMING**

### **DNS-Propagation bei IONOS:**

- **IONOS Server:** 15-30 Minuten
- **Deutsche Provider:** 2-6 Stunden
- **Weltweit:** 24-48 Stunden
- **Vollständige Aktivierung:** Max. 72 Stunden

### **IONOS TTL EMPFEHLUNG:**

- **Während Setup:** TTL = 300 (5 Min.) für schnelle Änderungen
- **Nach Aktivierung:** TTL = 3600 (1 Std.) für Stabilität

---

## 🔍 **IONOS DNS KONFIGURATION PRÜFEN**

### **IM IONOS PANEL:**

1. **DNS-Übersicht** → **Aktuelle Records anzeigen**
2. **Status:** "Aktiv" sollte angezeigt werden
3. **Propagation:** Grüner Haken nach 15-30 Min.

### **MIT TOOLS PRÜFEN:**

```bash
# CMD/PowerShell:
nslookup burnitoken.website 8.8.8.8
dig burnitoken.website @8.8.8.8

# Online Tools:
https://dnschecker.org
https://whatsmydns.net
```

---

## 🚨 **IONOS BESONDERHEITEN**

### **⚠️ WICHTIGE IONOS-HINWEISE:**

1. **Subdomain-Records:** Manchmal automatisch erstellt
2. **Mail-Records:** Nicht löschen (falls E-Mail genutzt)
3. **Wildcards:** Entfernen falls vorhanden (_, _.domain)
4. **IPv6 (AAAA):** Optional - kann aktiviert bleiben

### **✅ IONOS VORTEILE:**

- ✅ Sehr schnelle DNS-Propagation
- ✅ Zuverlässige Server
- ✅ Deutsche Rechenzentren
- ✅ 24/7 Support
- ✅ Einfache Verwaltung

---

## 📞 **IONOS SUPPORT (Falls benötigt)**

- **Telefon:** 0721 / 960 5727
- **Chat:** Im Kundencenter verfügbar
- **E-Mail:** Über Kundencenter
- **Zeiten:** 24/7 verfügbar

---

## 🎯 **NACH DER DNS-KONFIGURATION**

### **SCHRITT 1: GITHUB PAGES AKTIVIEREN**

1. **URL:** https://github.com/Kryptonator/burnitoken/settings/pages
2. **Custom Domain:** `burnitoken.website` eingeben
3. **"Enforce HTTPS"** aktivieren (wichtig!)
4. **Speichern**

### **SCHRITT 2: VERIFICATION WARTEN**

- **DNS Check:** 15-30 Minuten
- **GitHub Verification:** 5-10 Minuten
- **SSL Certificate:** Automatisch erstellt

### **SCHRITT 3: TESTEN**

- ✅ https://burnitoken.website
- ✅ https://www.burnitoken.website
- ✅ Mobile Version
- ✅ Alle Features

---

## 🌐 **FINALE URLS NACH AKTIVIERUNG**

### **HAUPT-WEBSITE:**

**https://burnitoken.website**

### **WWW-VERSION:**

**https://www.burnitoken.website**

### **BACKUP (Sofort verfügbar):**

**https://kryptonator.github.io/burnitoken**

---

## 📊 **ERFOLGS-CHECKLISTE**

### **✅ DNS Konfiguration erfolgreich wenn:**

- [ ] Alle 4 A-Records bei IONOS hinzugefügt
- [ ] CNAME für www konfiguriert
- [ ] DNS-Status "Aktiv" im IONOS Panel
- [ ] nslookup zeigt GitHub IPs
- [ ] GitHub Pages Custom Domain akzeptiert
- [ ] HTTPS-Zertifikat erstellt
- [ ] Website unter burnitoken.website erreichbar

---

## 🎉 **ZUSAMMENFASSUNG**

**Mit IONOS haben Sie einen der besten deutschen DNS-Provider gewählt!**

✅ **Schnelle Propagation** (15-30 Min.)
✅ **Zuverlässige Server**
✅ **Deutsche Qualität**
✅ **Professioneller Support**

**Ihre burnitoken.website wird bald mit Premium-Performance live sein!** 🚀

---

_IONOS DNS Setup für burnitoken.website - German Engineering meets GitHub Pages! 🇩🇪_
