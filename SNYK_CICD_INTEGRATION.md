# 🔒 Snyk CI/CD Integration Leitfaden

## Übersicht

Diese Anleitung erklärt, wie die Snyk-Sicherheitsintegration in CI/CD-Pipelines verwendet wird und gibt Tipps zur optimalen Konfiguration.

## GitHub Actions Integration

### Bestehende Workflows

Die folgenden GitHub Actions Workflows enthalten bereits Snyk-Integrationen:

1. **ci.yml**: Standard CI-Pipeline mit Snyk-Sicherheitsscans
2. **ci-new.yml**: Erweiterte CI-Pipeline mit verbesserten Snyk-Tests
3. **production.yml**: Produktions-Deployment mit Sicherheitsprüfungen

### Snyk GitHub Action

```yaml
- name: 🔒 Snyk Security Scan
  uses: snyk/actions/node@v3
  with:
    command: test
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## Konfiguration

### 1. GitHub Secrets

Stellen Sie sicher, dass das folgende Secret in Ihrem Repository konfiguriert ist:

- **SNYK_TOKEN**: Ihr Snyk API-Token (erhältlich im Snyk Accountbereich)

### 2. Workflow-Anpassungen

#### Basis-Scan (Schnell)

```yaml
- name: 🛡️ Snyk Basic Test
  run: npm run snyk:test
```

#### Umfassender Scan

```yaml
- name: 🔒 Snyk Full Security Scan
  run: npm run snyk:full
```

#### Kontinuierliches Monitoring

```yaml
- name: 📊 Snyk Monitor
  run: npm run snyk:monitor
```

## Automatisierte Sicherheits-Workflows

### Pull-Request Scans

Bei jedem Pull-Request wird automatisch ein Sicherheitsscan durchgeführt:

```yaml
name: PR Security Check

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - name: 🔒 Snyk Security Scan
        uses: snyk/actions/node@v3
        with:
          command: test
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Geplante Scans

Wöchentliche umfassende Sicherheitsscans werden jeden Montag durchgeführt:

```yaml
name: Weekly Security Audit

on:
  schedule:
    - cron: '0 8 * * 1'  # Jeden Montag um 8:00 Uhr

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - name: 🔍 Full Security Audit
        run: npm run security
      - name: 📊 Snyk Monitor
        run: npm run snyk:monitor
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## Benachrichtigungen konfigurieren

Um bei Sicherheitsproblemen automatisch benachrichtigt zu werden:

1. **GitHub-Benachrichtigungen**: Aktivieren Sie Workflow-Benachrichtigungen in GitHub
2. **Snyk-Alerts**: Konfigurieren Sie E-Mail-Benachrichtigungen im Snyk-Dashboard
3. **Slack-Integration**: Verbinden Sie Snyk mit Slack für Echtzeit-Benachrichtigungen

## Best Practices

1. **Fail-Fast deaktivieren**: Verwenden Sie `|| true` bei Snyk-Befehlen in CI

   ```yaml
   run: npm run snyk:test || true
   ```

2. **Severity Threshold**: Setzen Sie Schwellwerte für Fehlschläge

   ```yaml
   run: snyk test --severity-threshold=high
   ```

3. **JSON-Output**: Verwenden Sie JSON-Ausgabe für bessere Analyse

   ```yaml
   run: snyk test --json > snyk-results.json
   ```

4. **PR-Kommentare aktivieren**: Lassen Sie Snyk automatisch PRs kommentieren

## Troubleshooting

### Häufige Probleme

1. **Timeout bei langen Scans**
   - Lösung: Erhöhen Sie das Timeout in der GitHub Action

2. **SNYK_TOKEN nicht verfügbar**
   - Lösung: Überprüfen Sie die Repository-Secrets

3. **Fehlschlagende Tests blockieren den Workflow**
   - Lösung: Verwenden Sie die continue-on-error Option oder `|| true`

### Support-Ressourcen

- Snyk-Dokumentation: [docs.snyk.io](https://docs.snyk.io)
- GitHub Actions: [docs.github.com/actions](https://docs.github.com/actions)
- CI/CD Beispiele: [snyk.io/blog/category/devops](https://snyk.io/blog/category/devops)
