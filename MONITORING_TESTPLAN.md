# 🧪 CI/CD und Monitoring Testplan

Dieser Testplan dient dazu, alle neu implementierten CI/CD- und Monitoring-Funktionen zu überprüfen und sicherzustellen, dass sie korrekt funktionieren.

## 📋 Testschritte

### 1. Umfassendes Monitoring-Dashboard testen

```powershell
# Führe das umfassende Monitoring-Dashboard aus
npm run monitor:full
```

**Erwartetes Ergebnis:**
- Das Dashboard sollte alle Extensions, KI-Services und GSC-Tools überprüfen
- Der Status jeder Komponente sollte angezeigt werden (OK, Fehler, Repariert)
- Bei erkannten Problemen sollten automatische Reparaturversuche durchgeführt werden
- Die Ergebnisse sollten in MONITOR_STATUS.json und EXTENSION_SERVICES_MONITOR_IMPLEMENTATION.md gespeichert werden
- Bei erfolgreichen Fixes sollte ein automatischer Commit ausgeführt werden

### 2. Verbesserten GSC-Integration-Monitor testen

```powershell
# Führe den verbesserten GSC-Integration-Monitor aus
npm run gsc:monitor:v2

# Führe ihn mit automatischer Reparatur aus
npm run gsc:monitor:fix
```

**Erwartetes Ergebnis:**
- Der Monitor sollte Website, Sitemap, Robots.txt und GSC API überprüfen
- Die Timeout-Probleme des vorherigen Monitors sollten behoben sein
- Der Monitor sollte detaillierte Diagnose-Informationen ausgeben
- Im Fix-Modus sollten erkannte Probleme automatisch repariert werden
- Die Ergebnisse sollten in GSC_INTEGRATION_STATUS.json und GSC_INTEGRATION_STATUS.md gespeichert werden

### 3. CI/CD-Automatisierung testen

```powershell
# Führe nur die Tests aus
npm run cicd:test

# Führe die vollständige CI/CD-Pipeline aus
npm run cicd
```

**Erwartetes Ergebnis:**
- Alle Tests (Extension, Service, E2E, GSC) sollten ausgeführt werden
- Das Dashboard sollte nach erfolgreichen Tests ausgeführt werden
- Die Deployment-Integrität sollte überprüft werden
- Die Ergebnisse sollten in CICD_STATUS.json gespeichert werden
- Bei Erfolg sollte ein Commit mit "CI/CD Check: PASSED" erstellt werden

### 4. Automatisches Commit-System testen

```powershell
# Führe das Auto-Commit-System mit einer Beschreibung aus
npm run auto:commit "Test: Auto-Commit-System funktioniert"
```

**Erwartetes Ergebnis:**
- Ein Git-Commit sollte mit der angegebenen Beschreibung erstellt werden
- Der Commit sollte zum Remote-Repository gepusht werden
- Die COMMIT_SUMMARY.md sollte mit dem neuen Commit aktualisiert werden

### 5. Extension-Wiederherstellung testen

```powershell
# Deaktiviere manuell eine Extension über VS Code UI
# Führe dann den Extension-Auto-Restart aus
npm run extension:restart
```

**Erwartetes Ergebnis:**
- Die deaktivierte Extension sollte erkannt werden
- Ein Wiederherstellungsversuch sollte automatisch durchgeführt werden
- Der Status der Extension sollte sich auf "Aktiviert" ändern

### 6. GSC-Tools-Fixer V2 testen

```powershell
# Führe den verbesserten GSC-Tools-Fixer aus
npm run gsc:fix:v2
```

**Erwartetes Ergebnis:**
- Alle GSC-Tools sollten überprüft werden
- Bei erkannten Problemen sollten automatische Reparaturversuche durchgeführt werden
- Die Ergebnisse der Fixes sollten angezeigt werden

## 🔍 Edge-Case-Tests

### 1. Rollback-Funktionalität testen

```powershell
# Erstelle einen fehlerhaften Commit (z.B. beschädigte Datei)
echo "Fehlerhafte Datei" > test-fehler.txt
git add test-fehler.txt
git commit -m "Fehlerhafter Test-Commit"
git push

# Führe CI/CD aus, was zum Fehler und Rollback führen sollte
npm run cicd
```

**Erwartetes Ergebnis:**
- Der CI/CD-Prozess sollte fehlschlagen
- Ein Rollback zum letzten erfolgreichen Commit sollte ausgeführt werden
- Ein "rollback-branch" sollte erstellt und gepusht werden

### 2. Timeout-Behandlung im GSC-Monitor testen

```powershell
# Führe den GSC-Monitor mit reduziertem Timeout aus
# (Nur im Code Timeout auf 100ms setzen zum Testen)
npm run gsc:monitor:v2
```

**Erwartetes Ergebnis:**
- Der Monitor sollte die Timeouts erkennen und Retry-Versuche durchführen
- Nach mehreren Versuchen sollte eine sinnvolle Fehlermeldung angezeigt werden
- Die Fehler sollten in den Diagnose-Dateien protokolliert werden

## 📊 Validierung der Ergebnisse

Nach dem Durchlaufen aller Tests sollten folgende Dateien überprüft werden:

1. **MONITOR_STATUS.json** - Sollte den aktuellen Status aller überwachten Komponenten enthalten
2. **GSC_INTEGRATION_STATUS.json** - Sollte den aktuellen Status der GSC-Integration enthalten
3. **CICD_STATUS.json** - Sollte den Status des letzten CI/CD-Laufs enthalten
4. **COMMIT_SUMMARY.md** - Sollte alle automatischen Commits dokumentieren
5. **EXTENSION_SERVICES_MONITOR_IMPLEMENTATION.md** - Sollte mit dem aktuellen Status aktualisiert sein

## 🚀 Regelmäßige Testausführung

Es wird empfohlen, diese Tests in folgenden Intervallen durchzuführen:

- **Täglich:** `npm run monitor:full` (Umfassendes Monitoring)
- **Nach jedem Commit:** `npm run cicd` (CI/CD-Pipeline)
- **Wöchentlich:** Vollständiger Testplan mit allen Edge Cases

Die Ergebnisse sollten protokolliert und regelmäßig überprüft werden, um sicherzustellen, dass das System dauerhaft zuverlässig funktioniert.
