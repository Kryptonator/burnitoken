# 🚨 Error Collector - Zentrales Fehler-Management

## Überblick

Der **Error Collector** ist ein zentrales Tool zur Sammlung und Verarbeitung aller Fehler aus den zahlreichen Audit-, Test- und Monitoring-Tools des Projekts. Er sammelt Fehler aus verschiedenen Quellen, priorisiert sie und erstellt einen konsolidierten Bericht mit konkreten Handlungsempfehlungen.

## Features

- ✅ **Automatische Fehlersammlung** aus allen Log-Dateien, Task-Outputs und Reports
- ✅ **Fehlerpriorisierung** nach Kritikalität und Aktualität
- ✅ **Handlungsempfehlungen** auf Basis der gefundenen Probleme
- ✅ **Markdown-Report** mit detaillierter Analyse
- ✅ **Integration mit VS Code Tasks**
- ✅ **Automatischer Start** beim Öffnen des Projekts

## Eingerichtete Tasks

Der Error Collector ist als VS Code Task eingerichtet und kann direkt aus der Task-Liste ausgeführt werden:

- **🚨 Fehler-Report erstellen**: Führt eine vollständige Fehleranalyse durch und erstellt einen Bericht
- **🔄 Auto Fehler-Monitoring**: Startet automatisch beim Öffnen des Projekts und erstellt im Hintergrund einen Report

## Gesammelte Fehlerquellen

Der Error Collector aggregiert Fehler aus den folgenden Kategorien:

1. **Extension-Status** (hohe Priorität)
   - Probleme mit VS Code Extensions
   - Extension-Validator-Logs

2. **GSC-Integration** (hohe Priorität)
   - Indexierungsprobleme
   - GSC-Authentifizierungsfehler

3. **Recovery-System** (hohe Priorität)
   - Auto-Recovery-Fehler
   - Screenshot-Manager-Probleme

4. **Dependency-Status** (kritische Priorität)
   - Dependabot-Warnungen
   - Sicherheitslücken in Abhängigkeiten

5. **Worker-System** (mittlere Priorität)
   - Worker-Abstürze oder -Probleme
   - Task-Parallelisierungsfehler

6. **Status-Reports** (mittlere Priorität)
   - Unified-Status-Manager-Probleme
   - Dashboard-Fehler

7. **Lighthouse-Audits** (niedrige Priorität)
   - Performance-Probleme
   - Accessibility-Warnungen

## Bericht verstehen

Der generierte Bericht (`ERROR_REPORT.md`) enthält:

1. **Zusammenfassung** der gefundenen Fehler
2. **Handlungsempfehlungen** nach Priorität
3. **Detaillierte Fehlerliste** nach Kategorie und Priorität

### Fehlerkategorien

- 🔴 **Kritisch**: Erfordern sofortige Aufmerksamkeit (z.B. Sicherheitslücken)
- 🟠 **Hohe Priorität**: Wichtige Probleme, die den Betrieb beeinträchtigen können
- 🟡 **Mittlere Priorität**: Probleme, die behoben werden sollten
- 🟢 **Niedrige Priorität**: Kleinere Probleme oder Verbesserungsmöglichkeiten

## Integration mit anderen Tools

Der Error Collector ist so konzipiert, dass er nahtlos mit den anderen Tools des Projekts zusammenarbeitet:

- **Unified Status Manager**: Ergänzt dessen Funktionalität um eine detailliertere Fehleranalyse
- **Auto Recovery Manager**: Hilft bei der Erkennung von Recovery-Problemen
- **Dependabot Status Monitor**: Ergänzt das Dependabot-Monitoring um eine zentralisierte Fehlerberichterstattung

## Logfile-Struktur

Der Error Collector erwartet Log-Dateien im `.logs`-Verzeichnis. Diese werden standardmäßig von allen vorhandenen Tools dort angelegt.

## Manuelle Verwendung

```bash
node tools/error-collector.js
```

Dies erstellt den Fehler-Report in der Datei `ERROR_REPORT.md` im Stammverzeichnis des Projekts.

---

## Über

Entwickelt als Teil des burnitoken.website Management-Systems, Juni 2025
