#!/usr/bin/env node

/**
 * KI-Modell-Wechsel
 * Ermöglicht den manuellen Wechsel zwischen verschiedenen KI-Modellen
 */

const path = require('path');

// Parse Kommandozeilenargumente
const args = process.argv.slice(2);
let targetModel = null;

// Extrahiere das Zielmodell aus den Argumenten
for (const arg of args) {
  if (arg.startsWith) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
    targetModel = arg.split('=')[1];
    break;
  }
}

// Unterstützte Modelle
const SUPPORTED_MODELS = ['copilot', 'chatgpt', 'claude', 'gemini', 'llama'];

/**
 * Hauptfunktion
 */
async function main() {
  console.log('🔄 KI-Modell-Wechsel-Tool');

  // Prüfe, ob ein Modell angegeben wurde
  if (!targetModel) {
    showUsage();
    return;
  }

  // Prüfe, ob das angegebene Modell unterstützt wird
  if (!SUPPORTED_MODELS.includes(targetModel)) {
    console.error(`❌ Nicht unterstütztes KI-Modell: ${targetModel}`);
    console.log(`💡 Unterstützte Modelle: ${SUPPORTED_MODELS.join(', ')}`);
    return;
  }

  try {
    // Importiere die AI Conversation Bridge
    const aiBridge = require('./ai-conversation-bridge');

    // Wechsle zum angegebenen Modell
    const currentModel = aiBridge.getCurrentModel();

    if (currentModel === targetModel) {
      console.log(`ℹ️ Sie verwenden bereits ${targetModel}`);
      return;
    }

    console.log(`🔄 Wechsel von ${currentModel} zu ${targetModel}...`);
    aiBridge.switchModel(targetModel);

    console.log(`✅ KI-Modell erfolgreich gewechselt zu ${targetModel}`);
    console.log('💡 Der Konversationskontext wurde übertragen');
  } catch (err) {
    console.error(`❌ Fehler beim Modellwechsel: ${err.message}`);
    console.log('⚠️ Stellen Sie sicher, dass die AI Conversation Bridge läuft');
    console.log('💡 Starten Sie die Bridge mit: node tools/start-ai-bridge.js');
  }
}

/**
 * Zeigt Verwendungshinweise
 */
function showUsage() {
  console.log('Verwendung: node model-switch.js --model=<modellname>');
  console.log('');
  console.log('Beispiele:');
  console.log('  node model-switch.js --model=chatgpt   # Wechsel zu ChatGPT');
  console.log('  node model-switch.js --model=claude    # Wechsel zu Claude');
  console.log('  node model-switch.js --model=copilot   # Wechsel zu GitHub Copilot');
  console.log('');
  console.log(`Unterstützte Modelle: ${SUPPORTED_MODELS.join(', ')}`);
}

// Führe Hauptfunktion aus
main();
