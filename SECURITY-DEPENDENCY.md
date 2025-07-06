# BurniToken.com – Security & Dependency Management

- Dependabot ist für GitHub aktiviert (automatische PRs für Updates)
- JFrog Security Extension installiert (lokale und CI-Scans)
- Empfohlen: Regelmäßig `npm audit` und `npm update` ausführen
- Optional: Snyk oder weitere Security-Scanner einbinden

## Beispiel-Workflow für Security-Checks

```yaml
name: Security Audit
on:
  schedule:
    - cron: '0 3 * * 1'
  workflow_dispatch:
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Run npm audit
        run: npm audit --audit-level=high
```

---

> Security-Status und Reports werden regelmäßig geprüft und dokumentiert.
