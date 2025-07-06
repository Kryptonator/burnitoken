# AI Conversation Bridge

## Überblick

Die AI Conversation Bridge ist eine Erweiterung für den Session-Saver, die speziell für den nahtlosen Wechsel zwischen verschiedenen KI-Modellen entwickelt wurde. Sie stellt sicher, dass der Konversationskontext und der Arbeitsstand auch beim Modellwechsel erhalten bleiben.

## Funktionen

- **Nahtloser Wechsel zwischen KI-Modellen**
- **Gemeinsamer Konversationskontext**
- **Automatische Erkennung von Modellwechseln**
- **Unterstützung für mehrere KI-Modelle**
  - GitHub Copilot
  - ChatGPT
  - Claude
  - Gemini
  - Llama
- **Bewahrung des vollständigen Konversationsverlaufs**

## Installation & Verwendung

### Installation

Die AI Conversation Bridge ist Teil des Session-Savers und ist bereits in Ihrem Workspace integriert.

### Manuelle Aktivierung

Um die AI Conversation Bridge manuell zu starten:

```bash
node tools/start-ai-bridge.js
```

### Wechseln zwischen KI-Modellen

Es gibt zwei Möglichkeiten, zwischen KI-Modellen zu wechseln:

1. **Automatisch:** Geben Sie einen Hinweis in Ihrer Konversation ein:
   ```
   Bitte wechsle zu ChatGPT
   ```
   oder
   ```
   Verwende jetzt Claude
   ```

2. **Manuell:** Verwenden Sie das model-switch.js Tool:
   ```bash
   node tools/model-switch.js --model=chatgpt
   ```

Unterstützte Modellnamen: `copilot`, `chatgpt`, `claude`, `gemini`, `llama`

## Wie es funktioniert

1. Die AI Conversation Bridge überwacht Ihre Konversationen auf Hinweise zu Modellwechseln
2. Beim Wechsel wird der aktuelle Konversationskontext gespeichert
3. Der Kontext wird für das neue Modell aufbereitet und übergeben
4. Das neue Modell kann nahtlos weiterarbeiten, ohne dass Informationen verloren gehen

## Speicherort der Konversationen

Konversationskontexte werden gespeichert in:

- Windows: `%TEMP%\ai-conversations`
- MacOS/Linux: `/tmp/ai-conversations`

## Anpassung

Sie können die Bridge-Konfiguration anpassen, indem Sie die Konstante `CONFIG` in `ai-conversation-bridge.js` bearbeiten:

- `maxContextSize`: Maximale Größe des gemeinsamen Kontexts
- `autoDetectModelSwitch`: Automatische Erkennung von Modellwechseln
- `supportedModels`: Liste der unterstützten KI-Modelle

## Fehlerbehebung

Wenn die AI Conversation Bridge nicht wie erwartet funktioniert:

1. Prüfen Sie, ob der Prozess läuft:
   ```bash
   ps aux | grep ai-conversation-bridge
   ```

2. Starten Sie die Bridge neu:
   ```bash
   node tools/start-ai-bridge.js
   ```

3. Aktivieren Sie Debug-Ausgaben:
   Ändern Sie `debug: false` zu `debug: true` in ai-conversation-bridge.js
