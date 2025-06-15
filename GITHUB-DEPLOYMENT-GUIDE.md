# 🚀 GitHub Actions Deployment - Schritt-für-Schritt Anleitung

## Status: Bereit für GitHub Actions Deployment! ✅

Ihre Burni Token Website mit vollständigem i18n-System ist bereit für die automatische Bereitstellung über GitHub Actions.

## 📋 Was ist bereit:

- ✅ **Optimierter GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
- ✅ **Vollständiges i18n-System** in `main.js` (48KB)
- ✅ **HTML mit i18n-Attributen** in `index.html` (77KB)
- ✅ **Alle Tests bestehen** (6/6 Tests erfolgreich)
- ✅ **Explorer-Links implementiert** (XRPL/Bithomp)
- ✅ **Build-Prozess validiert** (CSS minifiziert, Assets optimiert)

## 🎯 Option 1: Wenn Sie bereits ein GitHub Repository haben

### Schritt 1: Git installieren (falls noch nicht vorhanden)
- **Windows**: https://git-scm.com/download/win
- **macOS**: `brew install git`
- **Linux**: `sudo apt install git`

### Schritt 2: Repository initialisieren und verknüpfen
```bash
# Falls noch kein Git Repository
git init
git remote add origin https://github.com/IHR-USERNAME/IHR-REPOSITORY.git

# Git-Konfiguration
git config user.name "Ihr Name"
git config user.email "ihre-email@example.com"
```

### Schritt 3: Automatisches Deployment starten
```bash
# Alle Dateien hinzufügen
git add .

# Commit erstellen
git commit -m "Deploy i18n system and explorer links - Full internationalization"

# Push zum Deployment (triggert GitHub Actions)
git push origin main
```

## 🎯 Option 2: Neues GitHub Repository erstellen

### Schritt 1: GitHub Repository erstellen
1. Gehen Sie zu https://github.com
2. Klicken Sie auf "New repository"
3. Name: `burnitoken-website` (oder gewünschter Name)
4. Sichtbarkeit: Public (für GitHub Pages)
5. Klicken Sie "Create repository"

### Schritt 2: Repository klonen und Setup
```bash
# Repository klonen
git clone https://github.com/IHR-USERNAME/burnitoken-website.git
cd burnitoken-website

# Ihre Projektdateien kopieren
# (Kopieren Sie alle Dateien aus dem aktuellen Ordner hierher)

# Deployment starten
git add .
git commit -m "Initial deployment with i18n system"
git push origin main
```

## 🎯 Option 3: Manuelle Dateienübertragung (ohne Git)

Falls Sie Git nicht verwenden möchten:

### Schritt 1: Deployment-Dateien vorbereiten
```powershell
# PowerShell Deployment-Skript ausführen
PowerShell -ExecutionPolicy Bypass -File deploy.ps1
```

### Schritt 2: Manueller Upload
- Alle Dateien aus dem `dist/` Ordner
- Via FTP/SFTP zu Ihrem Webserver hochladen
- Domain: https://burnitoken.website

## 📊 GitHub Actions Workflow Details

Der automatische Deployment-Prozess umfasst:

### Phase 1: Quality Assurance (2-3 Minuten)
- 🔍 **Linting**: Code-Qualitätsprüfung
- 🧪 **Unit Tests**: Jest-Tests (i18n, Accessibility, Performance)
- ✅ **HTML Validation**: Markup-Validierung
- 🎭 **E2E Tests**: Playwright Browser-Tests

### Phase 2: Build & Verification (1 Minute)
- 🔨 **Build Process**: CSS-Kompilierung und Asset-Optimierung
- 🌐 **i18n Verification**: Übersetzungssystem-Validierung
- 📁 **Artifact Creation**: Deployment-Paket erstellen

### Phase 3: Deployment (1-2 Minuten)
- 🚀 **GitHub Pages Deploy**: Automatische Veröffentlichung
- 🌐 **DNS Update**: Domain-Konfiguration
- 🔍 **Post-Deploy Tests**: Verfügbarkeitsprüfung

## 🔍 Deployment überwachen

### GitHub Actions Status verfolgen:
1. **Repository öffnen** auf GitHub
2. **"Actions" Tab** anklicken
3. **"Deploy Burni Token Website"** Workflow finden
4. **Live-Logs ansehen** während des Deployments

### Status-Indikatoren:
- 🟡 **Gelber Kreis**: Deployment läuft
- ✅ **Grüner Haken**: Deployment erfolgreich
- ❌ **Rotes X**: Deployment fehlgeschlagen

## 🧪 Nach dem Deployment testen

### Automatische Tests:
```
✅ Hauptseite erreichbar
✅ SSL-Zertifikat aktiv
✅ Domain-Weiterleitung funktioniert
```

### Manuelle Tests:
- **English**: https://burnitoken.website
- **German**: https://burnitoken.website?lang=de

### Features validieren:
- [ ] Sprachauswahl-Dropdown in Navigation
- [ ] Text ändert sich beim Sprachwechsel
- [ ] Explorer-Links in Token Details funktionieren
- [ ] Alle Inhalte werden übersetzt
- [ ] Keine JavaScript-Fehler in Browser-Konsole
- [ ] Mobile Darstellung funktioniert

## 🆘 Troubleshooting

### Deployment schlägt fehl:
1. **GitHub Actions Logs prüfen** für spezifische Fehler
2. **Tests lokal ausführen**: `npm test`
3. **Repository-Berechtigungen** überprüfen
4. **Branch-Name** prüfen (main vs. master)

### i18n funktioniert nicht:
1. **Browser-Cache leeren** (Ctrl+F5)
2. **JavaScript-Konsole** auf Fehler prüfen
3. **main.js Dateigröße** überprüfen (~48KB erwartet)
4. **Lokal testen**: `npm run serve`

### Domain-Probleme:
1. **CNAME-Record** auf GitHub Pages überprüfen
2. **Custom Domain Settings** im Repository
3. **SSL-Zertifikat Status** kontrollieren

## 🎉 Erwartete Ergebnisse

Nach erfolgreichem Deployment:

- 🌐 **Vollständige Mehrsprachigkeit**: Deutsch/Englisch mit URL-Parameter
- 🔄 **Dynamisches Umschalten**: Sofortige Übersetzung ohne Neuladen
- 🔗 **Explorer-Integration**: Direkte Links zu XRPL-Explorern
- 📱 **Mobile-optimiert**: Funktioniert auf allen Geräten
- ⚡ **Schnell**: Optimierte Assets und Caching
- 📊 **Analytics-ready**: Verfolgung von Sprachnutzung möglich

## 📞 Support

Bei Problemen:
1. **Lokale Tests**: `npm test` und `npm run serve`
2. **GitHub Issues**: Im Repository erstellen
3. **Dokumentation**: `GITHUB-ACTIONS-README.md` lesen

---

**🚀 Bereit für Deployment!** Wählen Sie eine der obigen Optionen und starten Sie die automatische Bereitstellung.
