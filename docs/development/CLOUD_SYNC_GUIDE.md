# 🌩️ Cloud-Umgebung Synchronisation für BurniToken.com

Diese Dokumentation beschreibt, wie die VS Code Extension-Einstellungen für Cloud-Entwicklungsumgebungen (wie GitHub Codespaces) synchronisiert werden.

## 🔄 Automatische Synchronisierung

Wir haben ein automatisches System eingerichtet, um sicherzustellen, dass alle Cloud-Entwicklungsumgebungen die neuesten Extension-Einstellungen erhalten:

1. **GitHub Actions Workflow**: 
   - Datei: `.github/workflows/cloud-sync.yml`
   - Wird automatisch ausgeführt, wenn Änderungen an `.vscode/*` oder `*.code-workspace` Dateien gepusht werden
   - Aktualisiert die `.devcontainer/devcontainer.json` mit den neuesten Einstellungen
   - Sendet eine E-Mail-Benachrichtigung an Entwickler, damit sie ihre bestehenden Cloud-Umgebungen aktualisieren können

2. **Update-Skript**:
   - Datei: `tools/update-cloud-settings.js`
   - Kann manuell ausgeführt werden: `npm run cloud:sync`
   - Synchronisiert die lokale Cloud-Umgebung mit den neuesten Einstellungen

## 🔧 Manuelle Aktualisierung bestehender Cloud-Umgebungen

Wenn du eine E-Mail-Benachrichtigung erhältst, dass die Extension-Einstellungen aktualisiert wurden, führe in deiner Cloud-Umgebung folgende Schritte aus:

1. Führe `git pull` aus, um die neuesten Änderungen zu holen
2. Führe `npm run cloud:sync` aus, um die Einstellungen zu aktualisieren
3. Starte VS Code in der Cloud-Umgebung neu (oder reloade das Fenster mit `F1` > `Developer: Reload Window`)

## 🆕 Neue Cloud-Umgebungen

Neue Cloud-Umgebungen (wie neue GitHub Codespaces), die nach dem Update erstellt werden, werden automatisch die neuesten Einstellungen verwenden. Es ist keine manuelle Konfiguration nötig.

## 📋 Überprüfen der aktuellen Konfiguration

Um zu überprüfen, ob deine Cloud-Umgebung die neuesten Einstellungen verwendet:

1. Öffne die VS Code-Einstellungen (`Ctrl+,`)
2. Suche nach `extensions.autoUpdate`
   - Sollte auf `true` gesetzt sein
3. Suche nach `extensions.ignoreRecommendations`
   - Sollte auf `false` gesetzt sein

## 🔄 Synchronisierte Einstellungen

Folgende Einstellungen werden zwischen lokalen und Cloud-Umgebungen synchronisiert:

- **Extension-Empfehlungen**: Liste der empfohlenen Extensions für das Projekt
- **Extension-Konfigurationen**: Spezifische Einstellungen für Extensions wie Tailwind CSS, Prettier, usw.
- **Editor-Einstellungen**: Allgemeine VS Code-Einstellungen für ein konsistentes Coding-Erlebnis

Für weitere Details zu den spezifischen Extension-Einstellungen, siehe die `EXTENSION_WORKFLOW_GUIDE.md` Datei.

---

*Erstellt am 21. Juni 2025*
