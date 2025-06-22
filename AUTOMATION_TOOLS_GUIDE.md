# BurniToken.com Automation & Recovery Tools

Dies ist eine Sammlung von Tools und VS Code Tasks für die automatisierte Verwaltung, Überwachung, Recovery und Sicherheit der BurniToken Website.

## 🔧 Extension Management

Diese Tools helfen bei der Verwaltung und Überwachung von VS Code Extensions:

- **Extension Health Check**: Überprüft alle benötigten Extensions (`extension-function-validator.js`)
- **Extension Management**: Orchestriert Extensions für optimale Performance (`master-extension-orchestrator.js`)
- **Extension Configuration**: Konfiguriert Extensions für das Projekt (`advanced-extension-manager.js`)

## 🧠 KI-Integration

Diese Tools integrieren KI-Services in den Workflow:

- **Session-Saver**: Speichert automatisch den Arbeitsfortschritt (`tools/session-saver.js`)
- **AI Conversation Bridge**: Verbindet VS Code mit KI-Services (`tools/start-ai-bridge.js`)
- **AI Services Manager**: Startet und verwaltet KI-Services (`tools/ai-services-manager.js`)

## 🌐 Google Search Console Integration

Tools zur Integration und Überwachung der Google Search Console:

- **GSC Auth Check**: Überprüft Authentifizierung mit GSC (`tools/gsc-auth-check.js`)
- **GSC Integration Monitor**: Überwacht GSC-Integration (`tools/gsc-integration-monitor.js`)
- **GSC Indexing Monitor**: Überwacht Indexierungsstatus (`tools/gsc-indexing-monitor.js`)
- **GSC Indexierungsbericht**: Erstellt detaillierten Bericht (`tools/gsc-indexing-report.js`)

## 🔄 Auto-Recovery System

Tools für automatisches Recovery nach Abstürzen oder Neustarts:

- **Auto-Recovery**: Haupttool für automatische Recovery (`tools/auto-recovery.js`)
- **Auto Screenshot Manager**: Erstellt regelmäßige Screenshots (`tools/auto-screenshot-manager.js`)
- **Auto Recovery Manager**: Verwaltet den Recovery-Prozess (`tools/auto-recovery-manager.js`)

## 📊 Status & Reporting

Tools für Status-Monitoring und Reporting:

- **Unified Status Manager**: Zentrale Status-Verwaltung (`tools/unified-status-manager.js`)
- **Unified Status Report**: Erstellt umfassende Berichte (`tools/unified-status-report.js`)
- **System Health Report**: Systemdiagnose und -prüfung (`tools/generate-health-report.js`)
- **Error Collector**: Sammelt und analysiert Fehler (`tools/error-collector.js`)

## 🔒 Security & Dependencies

Tools für Sicherheit und Abhängigkeitsmanagement:

- **Dependabot Status Monitor**: Überwacht Dependabot (`tools/dependabot-status-monitor.js`)
- **Dependency Security Updater**: Sicherheitsupdates für Abhängigkeiten (`tools/dependency-security-updater.js`)
- **GitHub Workflow Checker**: Validiert CI/CD Workflows (`tools/check-github-workflows.js`)

## 🚀 Verwendung der Tools

Die Tools können auf zwei Arten verwendet werden:

1. **VS Code Tasks**: Die meisten Tools sind als VS Code Tasks konfiguriert und können über das Command Palette (Strg+Shift+P) aufgerufen werden.
2. **Terminal**: Die Tools können auch direkt über das Terminal aufgerufen werden, z.B. `node tools/auto-recovery.js`.

## ⚙️ Automatischer Start

Die wichtigsten Tools werden automatisch beim Öffnen des Projekts gestartet:

- Extension Health Check
- Auto Recovery
- Session Saver
- AI Conversation Bridge
- GSC Integration

## 📋 System-Komplettcheck

Für einen umfassenden System-Check führen Sie den Task `🚀 System Komplettcheck & Optimierung` aus. Dieser Check:

1. Überprüft Extensions
2. Startet KI-Services
3. Prüft GSC-Integration
4. Erstellt Recovery-Screenshots
5. Prüft Dependencies
6. Generiert einen umfassenden Status-Report

## 📝 System Health Report

Der System Health Report (`SYSTEM_HEALTH_REPORT.md`) wird automatisch generiert und bietet einen Überblick über den Status aller Systeme und Komponenten.
