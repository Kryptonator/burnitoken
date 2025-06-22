#!/usr/bin/env node

/**
 * AI Status Checker
 * Zeigt Statusinformationen über die aktiven KI-Integrationssysteme an
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  // Verzeichnis für gemeinsam genutzte KI-Konversationen
  conversationDir: path.join(os.tmpdir(), 'ai-conversations'),
  
  // Backup-Verzeichnis für Session-Saver
  backupDir: path.join(os.tmpdir(), 'burnitoken-session-saver'),
  
  // Unterstützte KI-Modelle
  supportedModels: [
    { id: 'copilot', name: 'GitHub Copilot', emoji: '🤖' },
    { id: 'chatgpt', name: 'ChatGPT', emoji: '🟢' },
    { id: 'claude', name: 'Claude', emoji: '🟣' },
    { id: 'gemini', name: 'Gemini', emoji: '🔵' },
    { id: 'llama', name: 'Llama', emoji: '🦙' }
  ]
};

/**
 * Überprüft, ob eine Datei existiert
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

/**
 * Versucht, das aktive KI-Modell zu ermitteln
 */
function getActiveModel() {
  try {
    // Prüfe, ob die AI Bridge aktiv ist
    const sessionFile = path.join(CONFIG.conversationDir, 'active-session.json');
    
    if (fileExists(sessionFile)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      const sessionId = sessionData.sessionId;
      
      // Prüfe die Modell-spezifischen Dateien für das neueste Update
      let latestModel = null;
      let latestTimestamp = 0;
      
      for (const model of CONFIG.supportedModels) {
        const modelFile = path.join(
          CONFIG.conversationDir, 
          `${sessionId}_${model.id}_context.json`
        );
        
        if (fileExists(modelFile)) {
          try {
            const modelData = JSON.parse(fs.readFileSync(modelFile, 'utf8'));
            const timestamp = new Date(modelData.timestamp).getTime();
            
            if (timestamp > latestTimestamp) {
              latestTimestamp = timestamp;
              latestModel = model;
            }
          } catch (err) {
            // Ignoriere Parsing-Fehler für diese Datei
          }
        }
      }
      
      return latestModel || CONFIG.supportedModels[0]; // Default zu Copilot
    }
  } catch (err) {
    console.error('Fehler bei der Modell-Erkennung:', err.message);
  }
  
  return CONFIG.supportedModels[0]; // Default zu Copilot
}

/**
 * Prüft, ob ein Prozess läuft
 */
function isProcessRunning(name) {
  try {
    let command = '';
    if (process.platform === 'win32') {
      command = `powershell -Command "Get-Process -Name ${name} -ErrorAction SilentlyContinue"`;
    } else {
      command = `pgrep -f ${name}`;
    }
    
    execSync(command);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Zeigt den AI-Status
 */
function showAIStatus() {
  console.log('🧠 AI Integration Status');
  console.log('=======================');
  
  // Prüfe, ob die Verzeichnisse existieren
  const aiDirExists = fileExists(CONFIG.conversationDir);
  const backupDirExists = fileExists(CONFIG.backupDir);
  
  console.log(`AI Conversations Verzeichnis: ${aiDirExists ? '✅ Vorhanden' : '❌ Fehlt'}`);
  console.log(`Session Backups Verzeichnis: ${backupDirExists ? '✅ Vorhanden' : '❌ Fehlt'}`);
  
  // Prüfe, ob die AI Bridge aktiv ist
  const aiBridgeRunning = isProcessRunning('ai-conversation-bridge');
  const sessionSaverRunning = isProcessRunning('session-saver');
  
  console.log(`AI Conversation Bridge: ${aiBridgeRunning ? '✅ Aktiv' : '❌ Inaktiv'}`);
  console.log(`Session-Saver: ${sessionSaverRunning ? '✅ Aktiv' : '❌ Inaktiv'}`);
  
  // Zeige das aktuell verwendete Modell
  const activeModel = getActiveModel();
  console.log(`\nAktives AI-Modell: ${activeModel.emoji} ${activeModel.name}`);
  
  // Überprüfe die Verfügbarkeit der KI-Dateien
  const aiFiles = [
    'tools/ai-conversation-bridge.js',
    'tools/start-ai-bridge.js',
    'tools/model-switch.js',
    'tools/session-saver.js',
    'tools/recover-session.js'
  ];
  
  console.log('\nKI-Dateien:');
  for (const file of aiFiles) {
    console.log(`${file}: ${fileExists(file) ? '✅' : '❌'}`);
  }
  
  // Anzeige der verfügbaren Modelle
  console.log('\nVerfügbare Modelle:');
  for (const model of CONFIG.supportedModels) {
    const isActive = model.id === activeModel.id;
    console.log(`${model.emoji} ${model.name}${isActive ? ' (Aktiv)' : ''}`);
  }
  
  console.log('\n💡 TIP: Um das Modell zu wechseln, führe aus:');
  console.log('node tools/model-switch.js --model=<modellname>');
  console.log('Unterstützte Modelle: copilot, chatgpt, claude, gemini, llama');
}

// Führe die Hauptfunktion aus
showAIStatus();
