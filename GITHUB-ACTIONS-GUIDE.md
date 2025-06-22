# GitHub Actions für BurniToken.com

## Einrichtung und Konfiguration

Diese Anleitung hilft bei der Einrichtung und Konfiguration der CI/CD-Workflows für das BurniToken-Projekt.

## 🚀 Workflow: Production Deployment

Dieser Workflow ist für die Produktionsumgebung konfiguriert und umfasst folgende Schritte:

1. **Build & Test**: Kompiliert den Code, führt Tests und Linting durch
2. **GitHub Pages Deployment**: Veröffentlicht die Website auf GitHub Pages
3. **Netlify Deployment**: Optional - Veröffentlicht die Website auf Netlify

### Konfiguration

#### GitHub Secrets einrichten

1. Gehe zu den Repository-Einstellungen
2. Wähle "Secrets and variables" → "Actions"
3. Füge folgende Secrets hinzu:

**Für Netlify Deployment:**

- `NETLIFY_AUTH_TOKEN`: Ein persönlicher Zugriffstoken von Netlify
- `NETLIFY_SITE_ID`: Die ID deiner Netlify-Site

#### Netlify Konfiguration

1. Logge dich in dein Netlify-Konto ein
2. Erstelle eine neue Site oder wähle eine bestehende aus
3. Gehe zu Site settings → Build & deploy → Continuous deployment
4. Finde die Site-ID und kopiere sie (für `NETLIFY_SITE_ID`)

#### Personal Access Token erstellen

1. Logge dich in dein Netlify-Konto ein
2. Gehe zu User settings → Applications
3. Unter "Personal access tokens", klicke auf "New access token"
4. Gib einen Namen ein und erstelle den Token
5. Kopiere den Token (für `NETLIFY_AUTH_TOKEN`)

### GitHub Pages Deployment

Der Workflow veröffentlicht automatisch auf dem Branch `gh-pages`. Stelle sicher, dass GitHub Pages korrekt konfiguriert ist:

1. Gehe zu den Repository-Einstellungen
2. Wähle "Pages"
3. Wähle unter "Source" den Branch "gh-pages"
4. Klicke auf "Save"

## Workflow-Dateien

### production.yml

Dieser Workflow wird ausgeführt:
- Bei jedem Push auf den `main` oder `master` Branch
- Manuell über die GitHub Actions UI

### Fehlerbehandlung

Einige Schritte sind mit `|| true` konfiguriert, damit der Workflow nicht fehlschlägt, wenn diese Schritte Fehler zurückgeben:

- Tests: `npm test || true`
- Linting: `npm run lint:check || true`
- Security audit: `npm audit --audit-level moderate || true`
- Lighthouse: `npm run lighthouse || true`

Dies stellt sicher, dass der Workflow immer ein Deployment durchführt, selbst wenn einige Tests fehlschlagen.

## Troubleshooting

### Workflow wird nicht ausgeführt

1. Überprüfe, ob du auf dem `main` oder `master` Branch bist
2. Stelle sicher, dass die Workflow-Datei korrekt formatiert ist
3. Überprüfe die GitHub Actions-Logs auf Fehler

### Deployment schlägt fehl

1. Überprüfe, ob die GitHub Pages-Einstellungen korrekt sind
2. Stelle sicher, dass alle erforderlichen Secrets vorhanden sind
3. Überprüfe, ob die Build-Skripte korrekt konfiguriert sind

## Erweiterte Konfiguration

### Branch-Schutzregeln

Es wird empfohlen, Branch-Schutzregeln für `main` und `master` einzurichten:

1. Gehe zu den Repository-Einstellungen
2. Wähle "Branches"
3. Klicke auf "Add rule"
4. Gib "main" oder "master" als Branch-Name ein
5. Aktiviere "Require status checks to pass before merging"
6. Wähle den CI-Check "build-and-test" aus
7. Klicke auf "Create"
