#!/usr/bin/env node

/**
 * AI Bridge Starter
 * Startet die AI Conversation Bridge für nahtlose KI-Modell-Wechsel
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Pfad zur AI Conversation Bridge
const aiBridgePath = path.join(__dirname, 'ai-conversation-bridge.js');

/**
 * Startet die AI Conversation Bridge im Hintergrund
 */
function startAIBridge() {
  console.log('🚀 Starte AI Conversation Bridge...');
  
  // Prüfe, ob die Bridge-Datei existiert
  if (!fs.existsSync(aiBridgePath)) {
    console.error(`❌ AI Conversation Bridge nicht gefunden: ${aiBridgePath}`);
    return;
  }
  
  try {
    // Starte die Bridge als separaten Prozess
    const process = spawn('node', [aiBridgePath], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Löse den Prozess vom Elternprozess
    process.unref();
    
    console.log('✅ AI Conversation Bridge gestartet');
    console.log('💡 Die Bridge ermöglicht nahtlose Wechsel zwischen KI-Modellen mit gemeinsamem Kontext');
    console.log('📋 Unterstützte Modelle: GitHub Copilot, ChatGPT, Claude, Gemini, Llama');
  } catch (err) {
    console.error(`❌ Fehler beim Starten der AI Conversation Bridge: ${err.message}`);
  }
}

/**
 * Zeigt Anweisungen für manuelle Modellwechsel
 */
function showManualSwitchInstructions() {
  console.log('\n📝 Manuelle Modellwechsel:');
  console.log('-------------------------');
  console.log('Um zu einem anderen KI-Modell zu wechseln, verwenden Sie eine der folgenden Methoden:');
  console.log('1. Fügen Sie eine Zeile in Ihre Konversation ein: "Bitte wechsle zu [Modellname]"');
  console.log('2. Oder führen Sie folgenden Befehl aus:');
  console.log('   node tools/model-switch.js --model=chatgpt');
  console.log('\n💡 Verfügbare Modelle: copilot, chatgpt, claude, gemini, llama');
}

// Starte die AI Conversation Bridge
startAIBridge();
showManualSwitchInstructions();
