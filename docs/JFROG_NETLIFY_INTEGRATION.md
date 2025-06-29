# JFrog und Netlify Integration für BurniToken

Dieses Dokument beschreibt die optimale Integration von JFrog-Sicherheitsscans mit dem Netlify-Deployment-Workflow.

## 1. Architektur-Überblick

```
GitHub Repository
    │
    ├─── CI/CD Pipeline (GitHub Actions)
    │     │
    │     ├─── JFrog Security Scans
    │     │     └─── Vulnerability Reports
    │     │
    │     └─── Build & Test
    │           └─── Artifact Creation
    │
    └─── Deployment Pipeline
          │
          ├─── JFrog Artifact Validation
          │
          └─── Netlify Deployment
                └─── Serverless Functions & Site Hosting
```

## 2. Workflow-Integration

### Pre-Commit / Lokale Entwicklung

1. **Husky Pre-Commit Hooks** führen lokale Sicherheitschecks aus
2. **Lokales Netlify-Dev** ermöglicht Funktions- und Site-Tests

### CI/CD-Integration

```yaml
# Kombinierter Workflow für BurniToken
name: Security & Deployment Pipeline

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup JFrog CLI
        uses: jfrog/setup-jfrog-cli@v3
        
      - name: Run JFrog Security Scan
        run: |
          jfrog audit --fail=false
          jfrog audit --licenses --fail=false
        
      - name: Upload Security Reports
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: reports/

  build-and-deploy:
    needs: security-scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Build Project
        run: npm run build:prod
        
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

## 3. JFrog-Konfiguration

Die `.jfrog`-Konfigurationsordner sollte folgende Struktur haben:

```
.jfrog/
├── README.md                   # Dokumentation
├── jfrog-config.json           # Hauptkonfiguration
├── projects/
│   └── burnitoken.yaml         # Projektspezifische Einstellungen
└── security/
    └── security-policy.yaml    # Sicherheitsrichtlinien
```

## 4. Netlify-JFrog-Integration

### a) Sicherheitsberichte in Netlify-Funktionen

Eine Netlify-Funktion kann JFrog-Sicherheitsberichte darstellen:

```javascript
// netlify/functions/security-report.js
exports.handler = async function(event, context) {
  // Implementierung für Sicherheitsberichte
  // Kann JFrog API aufrufen oder statische Berichte darstellen
}
```

### b) Netlify-Build-Plugins für JFrog-Integration

```toml
# netlify.toml
[[plugins]]
  package = "@netlify/plugin-custom"
  [plugins.inputs]
    command = "node tools/jfrog-netlify-integration.js"
```

## 5. Setup-Anleitung

1. JFrog-Konfiguration wiederherstellen:
   ```
   mkdir -p .jfrog/projects .jfrog/security
   ```

2. Husky-Hooks wiederherstellen:
   ```
   npx husky install
   npx husky add .husky/pre-commit "npm run lint:check && npm run test:unit"
   ```

3. Netlify-JFrog-Integration einrichten:
   ```
   npm install @jfrog/netlify-integration --save-dev
   ```

## 6. Best Practices

1. **Separate Umgebungsvariablen** für JFrog und Netlify
2. **Automatisierte Schwachstellenberichte** nach jedem Build
3. **Artifact-Validierung** vor dem Netlify-Deployment
4. **Backup aller Konfigurationsdateien** in einem separaten Branch
