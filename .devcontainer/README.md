# Dev Container für BurniToken.com

Dieser Container stellt eine saubere, reproduzierbare Umgebung für alle Tests, Validierungen und das Deployment bereit.

**Enthalten:**
- Node.js 20 (npm, npx)
- PowerShell (für Validierungsskripte)
- Playwright (E2E-Tests)
- Lighthouse (Performance, SEO, Accessibility)
- VS Code Extensions: Playwright, Docker, ESLint, Prettier

**Nutzung:**
1. Öffne das Projekt in VS Code und wähle: "Reopen in Container" (bzw. "Im Container neu öffnen").
2. Warte, bis alle Abhängigkeiten installiert sind (`npm install` läuft automatisch).
3. Führe die Validierungsskripte und Tests im Container-Terminal aus:
   - `npm test` (Playwright)
   - `npx lhci autorun --config=./lighthouserc-performance.js` (Lighthouse)
   - `pwsh ./final-website-validation-clean.ps1` (PowerShell-Validierung)

**Hinweis:**
Alle Tools laufen im Container garantiert identisch – unabhängig vom Host-System.

**Go-Live:**
Nach erfolgreicher Validierung im Container kann die Seite live geschaltet werden.
