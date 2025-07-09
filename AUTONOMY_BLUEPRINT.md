# Autonomy Blueprint: Vision 2.0 für das BurniToken-Projekt

Dieses Dokument dient als zentrale Missionsbeschreibung und unveränderliche Direktive für den KI-Chefentwickler. Es stellt sicher, dass die Entwicklung nach jeder Unterbrechung oder jedem Neustart konsequent auf das Endziel ausgerichtet bleibt.

## Die Vision: Das perfekte, geschlossene Ökosystem

Das Ziel ist die Schaffung eines vollautomatischen, sich selbst heilenden Projekt-Ökosystems. Alle Komponenten – lokale Skripte, GitHub-Workflows, Cloud-Worker, Bots und VS-Code-Extensions – werden von einem zentralen "logischen Gehirn" (`master-logic-engine.js`) gesteuert und arbeiten als perfektes, autonomes Ganzes zusammen.

### Kernprinzipien

1.  **Der geschlossene Kreis:** Die Kette darf niemals unterbrochen werden. Jede Aktion löst die nächste aus, wie Zahnräder in einem Uhrwerk. Von der Code-Änderung über die Fehlererkennung bis zur selbstständigen Korrektur und dem Deployment.
2.  **Keine Platzhalter:** Das System findet, analysiert und ersetzt proaktiv *jeden* Platzhalter (`[TODO]`, `PLACEHOLDER`, etc.) durch die korrekte logische Implementierung.
3.  **Keine Syntaxfehler:** Das System erkennt und korrigiert Syntaxfehler und Linting-Probleme selbstständig in Echtzeit.
4.  **Vollständige Autonomie:** Das System läuft von Anfang an ohne manuellen Eingriff. Es überwacht, repariert und verbessert sich kontinuierlich selbst.

## Die Architektur: Komponenten & das logische Gehirn

- **Das Gehirn:** `tools/master-logic-engine.js` - Der zentrale Dispatcher, der Signale empfängt, analysiert, Entscheidungen trifft und Aufgaben an die Helferlein delegiert.

- **Die Helferlein (Auszug):**
  - **Sinnesorgane (Erkennung):** `tools/proactive-code-scanner.js`, ESLint-Extension, `anti-crash-guardian.js`.
  - **Stimme (Kommunikation):** `tools/github-issue-creator.js`, `tools/alert-service.js`.
  - **Hände (Aktion & Reparatur):** `tools/html-auto-fixer.js`, `fix-*.ps1`-Skripte, `auto-git-manager.js`.
  - **Wächter (Validierung):** `.github/workflows/monitoring.yml`, Dependabot, Snyk.

## Aktionsplan zur Umsetzung (Phasen)

Jeder abgeschlossene Punkt wird durch einen Commit im Git-Repository "verankert", bevor der nächste Schritt begonnen wird.

### Phase 1: Zentralisierung der Logik (Fundament legen)
- **Status:** `In Arbeit`
- **Aufgabe:** Umbau der `master-logic-engine.js` zu einem permanent lauschenden, zentralen HTTP-Server/Service, der auf Anfragen von anderen Skripten wartet und Aufgaben entgegennimmt. Dies entkoppelt die "Denk"-Logik von den ausführenden Werkzeugen.

### Phase 2: Integration der Sinne (Signale an das Gehirn)
- **Status:** `Pausiert`
- **Aufgabe:** Anpassung aller "Helferlein" (Scanner, Linter, etc.). Sie handeln nicht mehr selbstständig, sondern senden ihre Funde (z.B. "Platzhalter gefunden in Datei X, Zeile Y") als standardisierte Anfrage an die zentrale `master-logic-engine.js`.

### Phase 3: Implementierung der Selbstheilung (Autonome Reparatur)
- **Status:** `Pausiert`
- **Aufgabe:** Entwicklung der Kernlogik in der `master-logic-engine.js`, die es ihr ermöglicht, basierend auf den eingehenden Signalen, die richtigen Reparatur-Skripte auszuwählen und auszuführen. Dies beinhaltet die Fähigkeit, Code-Dateien intelligent zu modifizieren.

### Phase 4: Aktivierung des Auto-Git-Managers (Der Kreis schließt sich)
- **Status:** `Pausiert`
- **Aufgabe:** Verbindung der erfolgreichen Reparatur-Aktionen aus Phase 3 mit dem `auto-git-manager.js`. Nach jeder erfolgreichen Selbstheilung wird der Code automatisch gestaged, committet (mit einer aussagekräftigen Nachricht) und gepusht, was den Cloud-Workflow auslöst.
