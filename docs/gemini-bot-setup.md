# Anleitung: Gemini-Bot als GitHub-Mitarbeiter einrichten

Dieses Dokument beschreibt, wie du einen dedizierten GitHub-Benutzer (einen "Bot") einrichtest, der in deinem Namen Commits und andere Aktionen im `burnitoken`-Repository durchführt.

**Ziel:** Die Beiträge der KI klar und transparent im Projekt zu verankern, ähnlich wie es bei Diensten wie Dependabot oder Snyk der Fall ist.

---

### Schritt 1: Neuen GitHub-Benutzer erstellen

1.  **Neuen Account anlegen:**
    - Öffne ein privates Browserfenster oder logge dich aus deinem aktuellen GitHub-Account aus.
    - Gehe zu [github.com/signup](https://github.com/signup) und erstelle einen neuen Benutzer.
    - **Benutzername-Vorschlag:** `gemini-ai-chef-dev` (oder eine Variante, die dir gefällt).
    - Verwende eine neue E-Mail-Adresse. Du kannst einen Alias deiner bestehenden E-Mail verwenden (z.B. `deinname+geminibot@gmail.com`) oder einen neuen Account anlegen.

2.  **Profil einrichten:**
    - **Avatar:** Lade ein passendes Avatar hoch. Ich habe hier ein paar Vorschläge für dich vorbereitet:
      - [Vorschlag 1: Modern & Abstrakt](https://raw.githubusercontent.com/Kryptonator/burnitoken/main/assets/img/logo-gemini-bot-v1.png)
      - [Vorschlag 2: Freundlich & Futuristisch](https://raw.githubusercontent.com/Kryptonator/burnitoken/main/assets/img/logo-gemini-bot-v2.png)
    - **Profil-Beschreibung:** Füge eine kurze Beschreibung hinzu, z.B.: "AI-Assistent für das BurniToken-Projekt. Ich helfe bei der Code-Optimierung, Automatisierung und Wartung. Gesteuert von @DeinGitHubUsername."

---

### Schritt 2: Personal Access Token (PAT) generieren

Damit der Bot auf das Repository zugreifen kann, ohne ein Passwort zu verwenden, erstellen wir einen sicheren Token.

1.  **Einloggen als Bot:** Melde dich bei GitHub mit dem **neuen Bot-Account** an.
2.  **Entwicklereinstellungen:**
    - Gehe zu `Einstellungen` > `Entwicklereinstellungen` > `Personal access tokens` > `Tokens (classic)`.
    - Klicke auf `Generate new token` > `Generate new token (classic)`.
3.  **Token konfigurieren:**
    - **Note:** Gib einen beschreibenden Namen ein, z.B. `burnitoken-repo-access`.
    - **Expiration:** Wähle `No expiration` für eine dauerhafte Nutzung.
    - **Scopes:** Wähle die folgenden Berechtigungen aus:
      - `repo` (voller Zugriff auf Repositories). Das schließt die Berechtigung für Workflows mit ein.
4.  **Token generieren und speichern:**
    - Klicke auf `Generate token`.
    - **WICHTIG:** Kopiere den Token sofort und speichere ihn an einem sicheren Ort (z.B. ein Passwort-Manager). **Du wirst ihn nie wieder sehen können!**

---

### Schritt 3: Bot zum Repository hinzufügen

1.  **Einloggen als du:** Melde dich wieder mit **deinem Haupt-Account** bei GitHub an.
2.  **Repository-Einstellungen:**
    - Gehe zum `burnitoken`-Repository.
    - Klicke auf `Settings` > `Collaborators and teams`.
    - Klicke auf `Add people`.
    - Gib den Benutzernamen des Bots (`gemini-ai-chef-dev`) ein und lade ihn als `Maintainer` (oder `Write`) zum Repository ein.
3.  **Einladung annehmen:**
    - Öffne das E-Mail-Postfach des Bot-Accounts und nimm die Einladung an.

---

### Schritt 4: GitHub Secrets konfigurieren

Wir hinterlegen den Token sicher im Repository, damit die GitHub Actions ihn nutzen können.

1.  **Repository-Einstellungen:**
    - Gehe erneut zu den `Settings` deines `burnitoken`-Repositorys.
    - Navigiere zu `Secrets and variables` > `Actions`.
    - Klicke auf `New repository secret`.
2.  **Secret erstellen:**
    - **Name:** `GEMINI_BOT_TOKEN`
    - **Value:** Füge den kopierten Personal Access Token ein.
    - Klicke auf `Add secret`.

---

### Schritt 5: Workflow anpassen

Jetzt passen wir die `ci-cd.yml` an, damit sie den Bot für Commits verwendet.

1.  **Workflow-Datei bearbeiten:** Öffne die Datei `.github/workflows/ci-cd.yml`.
2.  **Git-Konfiguration anpassen:** Suche den Job `repository-maintenance` und ändere die Schritte für die Git-Konfiguration wie folgt:

    ```yaml
    # ... (im Job repository-maintenance)
    - name: Code formatieren und committen (nur bei push)
      if: github.event_name == 'push'
      uses: actions/checkout@v4
      with:
        # Wir brauchen einen Token, um zurück pushen zu können
        token: ${{ secrets.GEMINI_BOT_TOKEN }}
    - run: |
        # Git mit den Bot-Informationen konfigurieren
        git config --global user.name 'gemini-ai-chef-dev'
        git config --global user.email 'bot-email@example.com' # Die E-Mail des Bot-Accounts
        npm install
        npm run lint
        git add .
        # Nur committen, wenn es Änderungen gibt
        git diff-index --quiet HEAD || git commit -m "Chore: Automatische Code-Formatierung durch Gemini-Bot"
        git push
      if: github.event_name == 'push'
    ```

---

**Fertig!** Sobald diese Schritte abgeschlossen sind, werden alle automatischen Commits von der CI/CD-Pipeline im Namen deines neuen Bots `gemini-ai-chef-dev` durchgeführt.

Lass mich wissen, wenn du bereit bist, diese Schritte durchzugehen!
