# 🎯 NETLIFY CUSTOM DOMAIN SETUP - LIVE ANLEITUNG

## 🔧 SCHRITT 1: Netlify Dashboard öffnen

**Jetzt ausführen:**
1. Gehe zu: https://app.netlify.com
2. Login mit deinem GitHub Account
3. Finde deine Site: **endearing-mandazi-d7b985**
4. Klicke auf die Site

## 🌐 SCHRITT 2: Custom Domain hinzufügen

**In der Netlify Site:**
1. **Klicke:** "Site settings" (oben rechts)
2. **Scrolle zu:** "Domain management" (linke Sidebar)
3. **Klicke:** "Add custom domain"
4. **Eingabe:** `burnitoken.website`
5. **Klicke:** "Verify" → "Yes, add domain"

## 📋 SCHRITT 3: DNS Records notieren

**Netlify zeigt dir jetzt die DNS Records an:**

```
Primary domain: burnitoken.website
Netlify DNS Records:

A Record:    burnitoken.website    →    75.2.60.5
AAAA Record: burnitoken.website    →    2600:1f18:3fff:c001::5
CNAME:       www.burnitoken.website →   endearing-mandazi-d7b985.netlify.app
```

**WICHTIG:** Notiere dir diese Werte! Du brauchst sie für IONOS.

## ⚠️ WENN DNS VERIFICATION FEHLER:

Falls Netlify sagt "DNS verification required":
1. **Netlify zeigt zusätzlich einen TXT Record:**
   ```
   TXT Record: burnitoken.website → netlify-verification-xxxxxxxxx
   ```
2. **Diesen TXT Record** musst du **zuerst** bei IONOS setzen
3. **Dann** die A/AAAA/CNAME Records

## 🎯 ERWARTETES ERGEBNIS:

Nach diesem Schritt siehst du in Netlify:
- ✅ **Primary domain:** burnitoken.website (Pending DNS verification)
- ⏳ **Status:** "Check DNS configuration"
- 📝 **DNS Records:** Angezeigt zum Kopieren

---

## 🔄 NÄCHSTER SCHRITT: IONOS DNS Setup

**Nach Netlify Setup sofort weiter zu:**
1. IONOS Domain Center öffnen
2. DNS Records wie von Netlify angezeigt setzen
3. DNS Propagation abwarten (24-48h)

**Hast du Schritt 1 abgeschlossen? Dann können wir zu IONOS DNS Setup! 🚀**
