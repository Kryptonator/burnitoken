/**
 * AI Conversation Bridge
 * Ermöglicht nahtlose Übergänge zwischen verschiedenen KI-Modellen mit gemeinsamem Kontext
 * 
 * Diese Erweiterung für den Session-Saver sorgt dafür, dass beim Wechsel zwischen 
 * verschiedenen KI-Modellen (z.B. GitHub Copilot, ChatGPT, Claude) der vollständige 
 * Konversationsverlauf und Arbeitskontext erhalten bleibt.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Konfiguration
const CONFIG = {
  // Verzeichnis für gemeinsam genutzte KI-Konversationen
  conversationDir: path.join(os.tmpdir(), 'ai-conversations'),
  
  // Unterstützte KI-Modelle
  supportedModels: [
    { id: 'copilot', name: 'GitHub Copilot', contextFormat: 'markdown' },
    { id: 'chatgpt', name: 'ChatGPT', contextFormat: 'markdown' },
    { id: 'claude', name: 'Claude', contextFormat: 'markdown' },
    { id: 'gemini', name: 'Gemini', contextFormat: 'markdown' },
    { id: 'llama', name: 'Llama', contextFormat: 'markdown' }
  ],
  
  // Maximale Größe des gemeinsamen Kontexts in Zeichen
  maxContextSize: 200000,
  
  // Automatisches Erkennen von Modellwechseln
  autoDetectModelSwitch: true,
  
  // Debug-Modus
  debug: false
};

// Status-Tracking
let currentModel = 'copilot'; // Standard: GitHub Copilot
let activeSessionId = null;
let lastSavedContext = null;

/**
 * Initialisiert die AI Conversation Bridge
 */
function initAIBridge() {
  console.log('🧠 AI Conversation Bridge wird initialisiert...');
  
  // Erstelle Konversationsverzeichnis, falls nicht vorhanden
  if (!fs.existsSync(CONFIG.conversationDir) {
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  ) {;
}
    fs.mkdirSync(CONFIG.conversationDir, { recursive: true });
  }
  
  // Erstelle aktive Session-ID oder lade letzte
  activeSessionId = getOrCreateSessionId();
  
  // Binde Event-Handler ein
  setupModelSwitchHandling();
  
  console.log(`✅ AI Conversation Bridge aktiv - Session ID: ${activeSessionId}`);
}

/**
 * Generiert eine neue Session-ID oder lädt die zuletzt verwendete
 */
function getOrCreateSessionId() {
  const sessionFile = path.join(CONFIG.conversationDir, 'active-session.json');
  
  try {
    if (fs.existsSync(sessionFile)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      
      // Prüfe, ob die Session älter als 12 Stunden ist
      const sessionTime = new Date(sessionData.timestamp);
      const currentTime = new Date();
      const hoursDiff = (currentTime - sessionTime) / (1000 * 60 * 60);
      
      if (hoursDiff < 12) {
        return sessionData.sessionId;
      }
    }
  } catch (err) {
    logDebug(`Fehler beim Laden der aktiven Session: ${err.message}`);
  }
  
  // Erstelle neue Session-ID
  const newSessionId = crypto.randomBytes(8).toString('hex');
  
  try {
    fs.writeFileSync(sessionFile, JSON.stringify({
      sessionId: newSessionId,
      timestamp: new Date().toISOString(),
      workspaceRoot: process.cwd()
    }, null, 2));
  } catch (err) {
    logDebug(`Fehler beim Speichern der aktiven Session: ${err.message}`);
  }
  
  return newSessionId;
}

/**
 * Richtet Handler für Modellwechsel ein
 */
function setupModelSwitchHandling() {
  // Diese Funktion würde idealerweise auf Events von VS Code reagieren,
  // was in diesem Kontext schwierig ist. Stattdessen verwenden wir periodische Checks.
  
  setInterval(() => {
    detectModelSwitch();
  }, 5000); // Alle 5 Sekunden prüfen
}

/**
 * Erkennt, ob ein Wechsel des KI-Modells stattgefunden hat
 */
function detectModelSwitch() {
  try {
    // In einer realen Implementierung würde dies die VS Code API oder
    // andere Signale verwenden, um einen Modellwechsel zu erkennen
    
    const activeEditorContent = getActiveEditorContent();
    if (!activeEditorContent) return;
    
    // Prüfe auf Hinweise eines Modellwechsels in den letzten Zeilen
    const lastLines = activeEditorContent.split('\n').slice(-20).join('\n').toLowerCase();
    
    for (const model of CONFIG.supportedModels) {
      if (model.id === currentModel) continue;
      
      if (lastLines.includes(`using ${model.id}`) || 
          lastLines.includes(`switch to ${model.id}`) ||
          lastLines.includes(`${model.name.toLowerCase()}`)) {
        
        handleModelSwitch(currentModel, model.id);
        currentModel = model.id;
        break;
      }
    }
  } catch (err) {
    logDebug(`Fehler beim Erkennen des Modellwechsels: ${err.message}`);
  }
}

/**
 * Behandelt einen Wechsel zwischen KI-Modellen
 */
function handleModelSwitch(fromModel, toModel) {
  console.log(`🔄 KI-Modellwechsel erkannt: ${fromModel} → ${toModel}`);
  
  try {
    // Speichere aktuellen Kontext
    saveCurrentContext(fromModel);
    
    // Lade Kontext für das neue Modell
    loadContextForModel(toModel);
    
    console.log(`✅ Kontext erfolgreich übertragen von ${fromModel} zu ${toModel}`);
  } catch (err) {
    console.error(`❌ Fehler bei der Kontextübertragung: ${err.message}`);
  }
}

/**
 * Speichert den aktuellen Konversationskontext für ein KI-Modell
 */
function saveCurrentContext(modelId) {
  try {
    const context = generateCurrentContext();
    if (!context) return;
    
    lastSavedContext = context;
    
    const contextFile = path.join(
      CONFIG.conversationDir, 
      `${activeSessionId}_${modelId}_context.json`
    );
    
    fs.writeFileSync(contextFile, JSON.stringify({
      modelId,
      timestamp: new Date().toISOString(),
      sessionId: activeSessionId,
      context: context
    }, null, 2));
    
    logDebug(`Kontext für ${modelId} gespeichert (${context.length} Zeichen)`);
  } catch (err) {
    console.error(`❌ Fehler beim Speichern des Kontexts: ${err.message}`);
  }
}

/**
 * Lädt den gespeicherten Kontext für ein KI-Modell
 */
function loadContextForModel(modelId) {
  try {
    const contextFile = path.join(
      CONFIG.conversationDir, 
      `${activeSessionId}_${modelId}_context.json`
    );
    
    // Wenn keine spezifische Datei für dieses Modell existiert,
    // verwende den zuletzt gespeicherten Kontext
    if (!fs.existsSync(contextFile) && lastSavedContext) {
      logDebug(`Keine spezifische Kontextdatei für ${modelId} gefunden, verwende letzten Kontext`);
      return;
    }
    
    if (fs.existsSync(contextFile)) {
      const contextData = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
      logDebug(`Kontext für ${modelId} geladen (${contextData.context.length} Zeichen)`);
    }
  } catch (err) {
    console.error(`❌ Fehler beim Laden des Kontexts: ${err.message}`);
  }
}

/**
 * Generiert einen Kontext aus dem aktuellen Arbeitsbereich
 */
function generateCurrentContext() {
  try {
    // In einer realen Implementierung würde dies den Inhalt des aktuellen Editorfensters,
    // offene Dateien und den Konversationsverlauf enthalten
    
    const editorContent = getActiveEditorContent();
    if (!editorContent) return null;
    
    // Begrenzen Sie die Kontextgröße, um Speicher- und Leistungsprobleme zu vermeiden
    if (editorContent.length > CONFIG.maxContextSize) {
      return editorContent.substring(0, CONFIG.maxContextSize);
    }
    
    return editorContent;
  } catch (err) {
    logDebug(`Fehler beim Generieren des Kontexts: ${err.message}`);
    return null;
  }
}

/**
 * Simuliert das Abrufen des aktiven Editorinhalts
 * In einer realen VS Code Extension würde dies die VS Code API verwenden
 */
function getActiveEditorContent() {
  // Simulierte Funktion - in einer echten Extension würde hier
  // window.activeTextEditor.document.getText() oder Ähnliches stehen
  try {
    const recentFiles = fs.readdirSync('.')
      .filter(file => CONFIG.supportedModels.some(model => 
        file.includes(model.id) || file.includes('conversation')
      ));
    
    if (recentFiles.length > 0) {
      const latestFile = recentFiles[0];
      if (fs.existsSync(latestFile)) {
        return fs.readFileSync(latestFile, 'utf8');
      }
    }
    
    return "Aktueller Konversationskontext";
  } catch (err) {
    logDebug(`Fehler beim Abrufen des Editorinhalts: ${err.message}`);
    return null;
  }
}

/**
 * Debug-Logger
 */
function logDebug(message) {
  if (CONFIG.debug) {
    console.log(`[AI-Bridge Debug] ${message}`);
  }
}

/**
 * Öffentliche API
 */
module.exports = {
  init: initAIBridge,
  
  // Manuell ein Modell wechseln
  switchModel: (toModel) => {
    if (toModel === currentModel) return;
    
    const validModel = CONFIG.supportedModels.find(model => model.id === toModel);
    if (!validModel) {
      console.error(`❌ Unbekanntes KI-Modell: ${toModel}`);
      return;
    }
    
    handleModelSwitch(currentModel, toModel);
    currentModel = toModel;
  },
  
  // Aktuelles Modell abfragen
  getCurrentModel: () => currentModel,
  
  // Manuell Kontext speichern
  saveContext: () => saveCurrentContext(currentModel),
  
  // Konfiguration aktualisieren
  updateConfig: (newConfig) => {
    Object.assign(CONFIG, newConfig);
    console.log('✅ AI Bridge Konfiguration aktualisiert');
  }
};

// Initialisiere die AI Conversation Bridge
initAIBridge();

) // Auto-korrigierte schließende Klammer
} // Auto-korrigierte schließende Klammer