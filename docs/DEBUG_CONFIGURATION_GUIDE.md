# 🔧 DEBUG & RUN KONFIGURATION GUIDE

## 🎯 Verfügbare Debug-Konfigurationen

### 1. 🌐 Debug Live Website (Chrome)
**Zweck:** Direkte Debugging der Live-Website burnitoken.website
- **Startet:** Chrome mit Debugging-Tools
- **URL:** https://burnitoken.website
- **Features:** Source Maps, Console-Debugging, Network-Analyse

### 2. 🔍 Debug Local HTML (Chrome)
**Zweck:** Lokale HTML-Datei testen ohne Server
- **Öffnet:** index.html direkt im Browser
- **Nutzen:** Offline-Tests, HTML-Validierung

### 3. 🔧 Attach to Chrome Debugger
**Zweck:** An laufende Chrome-Instanz anhängen
- **Port:** 9222 (Remote Debugging)
- **Nutzen:** Bereits geöffnete Browser-Tabs debuggen

### 4. 📜 Debug Node.js Scripts
**Zweck:** Server-seitige JavaScript-Dateien debuggen
- **Target:** main.js und andere Node-Skripte
- **Console:** Integriertes Terminal

### 5. 🧪 Debug Jest Tests
**Zweck:** Unit-Tests mit Breakpoints debuggen
- **Framework:** Jest
- **Features:** Test-Coverage, Error-Tracking

### 6. 🎯 Debug Audit Scripts
**Zweck:** Live-Audit-Skripte debuggen
- **Target:** comprehensive-live-audit.js
- **Nutzen:** Performance-Monitoring verbessern

### 7. 🚀 Debug with Performance Profiling
**Zweck:** Performance-Analyse mit Chrome DevTools
- **Features:** Auto-DevTools, Logging, Profiling
- **Nutzen:** Performance-Bottlenecks identifizieren

## 🛠️ Verfügbare Tasks

### 🚀 Start Live Debug Session
```bash
Startet Chrome mit Remote Debugging für Live-Website
```

### 🧪 Run Complete Test Suite
```bash
Führt npm test aus mit ESLint Problem Matcher
```

### 🔍 Live Website Audit
```bash
Startet PowerShell Live-Audit-Skript
```

### ⚡ Quick Asset Check
```bash
Prüft alle kritischen Assets auf Verfügbarkeit
```

## 🎮 Wie zu verwenden:

### Via VS Code UI:
1. **F5** drücken oder **Run and Debug** Panel öffnen
2. Gewünschte Konfiguration auswählen
3. **Start Debugging** (grüner Play-Button)

### Via Command Palette:
1. **Ctrl+Shift+P** drücken
2. "Debug: Select and Start Debugging" eingeben
3. Konfiguration wählen

### Via Tasks:
1. **Ctrl+Shift+P** drücken  
2. "Tasks: Run Task" eingeben
3. Task auswählen (z.B. "Live Website Audit")

## 🔍 Debug-Features für burnitoken.website:

### JavaScript-Debugging:
- ✅ Breakpoints in allen JS-Dateien
- ✅ Console-Logging und Error-Tracking
- ✅ Variable-Inspection
- ✅ Call-Stack-Analyse

### CSS-Debugging:
- ✅ Live-CSS-Editing
- ✅ Computed Styles Inspection
- ✅ Layout-Debugging
- ✅ Responsive Design Testing

### Performance-Debugging:
- ✅ Network-Tab für Asset-Loading
- ✅ Timeline für Rendering-Performance
- ✅ Memory-Usage-Profiling
- ✅ Core Web Vitals Monitoring

### Security-Debugging:
- ✅ HTTPS-Certificate-Validation
- ✅ Content-Security-Policy-Checks
- ✅ CORS-Issues-Detection

## 🎯 Empfohlener Workflow:

1. **Start:** "🌐 Debug Live Website" für allgemeine Probleme
2. **Performance:** "🚀 Debug with Performance Profiling" für Speed-Tests
3. **Assets:** "⚡ Quick Asset Check" Task für 404-Fehler
4. **Comprehensive:** "🔍 Live Website Audit" für vollständige Analyse

## 🔧 Troubleshooting:

### Chrome nicht gefunden?
```bash
Installiere Chrome oder passe den Pfad in launch.json an
```

### Port 9222 belegt?
```bash
Ändere Port in launch.json oder beende laufende Chrome-Instanzen
```

### Source Maps nicht verfügbar?
```bash
Aktiviere "sourceMaps": true in der Debug-Konfiguration
```

---

**🎮 BEREIT FÜR PROFESSIONELLES DEBUGGING!**
