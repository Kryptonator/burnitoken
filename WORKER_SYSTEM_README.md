# Paralleles Worker-System: Kurzanleitung

Dieses parallele Worker-System ermöglicht eine hochgradig optimierte, gleichzeitige Ausführung aller kritischen Tasks für einen beschleunigten Go-Live und höhere Ausfallsicherheit.

## Schnellstart

### Über VS Code Tasks

Die einfachste Nutzung erfolgt über die VS Code Tasks:

1. Öffne die Command Palette (`Ctrl+Shift+P`)
2. Wähle "Tasks: Run Task"
3. Wähle eine der folgenden Optionen:
   - **🚀 Start Parallel Worker System** - Startet das Master Worker System
   - **🔍 Start Worker Monitor** - Startet den unabhängigen Monitor
   - **⚡ Execute Tasks Parallel** - Führt Tasks parallel aus

### Über Terminal

Alternativ können die Komponenten direkt über das Terminal gestartet werden:

```powershell
# Master Worker System starten
node tools/master-worker-system.js

# Worker Monitor starten
node tools/worker-monitor.js

# Parallele Tasks ausführen
node tools/parallel-task-manager.js
```

## Statusberichte

Um Statusberichte zu generieren:

```powershell
# Worker System Status
node tools/master-worker-system.js --report

# Parallelisierungsbericht
node tools/parallel-task-manager.js --report
```

Die Berichte werden im Verzeichnis `.worker-system` gespeichert.

## Installation als Windows-Dienst

Für maximale Zuverlässigkeit und automatischen Start:

```powershell
# Als Administrator ausführen
.\scripts\install-worker-system.ps1
```

## Dokumentation

Ausführliche Dokumentation finden Sie in:

- [PARALLEL_WORKER_SYSTEM.md](./PARALLEL_WORKER_SYSTEM.md) - Vollständige Dokumentation
- [WORKER_SYSTEM_OVERVIEW.md](./WORKER_SYSTEM_OVERVIEW.md) - Systemarchitektur und Komponenten
