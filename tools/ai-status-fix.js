#!/usr/bin/env node

/**
 * AI Status Checker (Vereinfacht)
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
    console.log(`Fehler beim Prüfen von Datei ${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * Vereinfachte Prozess-Erkennung
 */
function checkProcesses() {
  try {
    console.log("\n💻 Prozessstatus:");
    
    if (process.platform === 'win32') {
      // Unter Windows können wir nur eine einfache Ausgabe der laufenden Node-Prozesse machen
      console.log("Node-Prozesse auf Windows (manuell prüfen):");
      try {
        const output = execSync('powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,CPU,PM,Path"', {
          encoding: 'utf8'
        });
        console.log(output);
      } catch (err) {
        console.log("Keine Node-Prozesse aktiv oder keine Berechtigung für Prozessliste");
      }
    } else {
      // Unix-basierte Systeme
      try {
        console.log("AI Bridge Prozesse:");
        const bridgeOutput = execSync('ps -ef | grep -i "ai-conversation-bridge\|start-ai-bridge" | grep -v grep', {
          encoding: 'utf8'
        });
        console.log(bridgeOutput || "Keine AI Bridge-Prozesse gefunden");
      } catch (err) {
        console.log("Keine AI Bridge-Prozesse gefunden");
      }
      
      try {
        console.log("\nSession-Saver Prozesse:");
        const saverOutput = execSync('ps -ef | grep -i "session-saver" | grep -v grep', {
          encoding: 'utf8'
        });
        console.log(saverOutput || "Keine Session-Saver-Prozesse gefunden");
      } catch (err) {
        console.log("Keine Session-Saver-Prozesse gefunden");
      }
    }
  } catch (err) {
    console.log("Fehler bei der Prozessprüfung");
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
      try {
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
            } catch (error) {
              console.log(`Fehler beim Lesen von ${modelFile}`);
            }
          }
        }
        
        if (latestModel) return latestModel;
      } catch (error) {
        console.log(`Fehler beim Lesen von ${sessionFile}`);
      }
    }
  } catch (err) {
    console.log('Fehler bei der Modell-Erkennung');
  }
  
  // Default zu Copilot, falls kein anderes Modell erkannt wurde
  return CONFIG.supportedModels[0];
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
  
  // Prüfe laufende Prozesse
  checkProcesses();
  
  // Zeige das aktuell verwendete Modell
  const activeModel = getActiveModel();
  console.log(`\nAktives AI-Modell: ${activeModel.emoji} ${activeModel.name}`);
  
  // Überprüfe die Verfügbarkeit der KI-Dateien
  const aiFiles = [
    'tools/ai-conversation-bridge.js',
    'tools/start-ai-bridge.js',
    'tools/model-switch.js',
    'tools/session-saver.js',
    'tools/recover-session.js',
    'tools/ai-services-manager.js'
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
  
  // Zeige Verzeichnisinhalte
  if (aiDirExists) {
    try {
      console.log('\nInhalt des AI Conversations Verzeichnisses:');
      const files = fs.readdirSync(CONFIG.conversationDir);
      if (files.length === 0) {
        console.log('(leer)');
      } else {
        files.forEach(file => {
          const stats = fs.statSync(path.join(CONFIG.conversationDir, file));
          console.log(`- ${file} (${stats.size} Bytes, ${stats.mtime.toLocaleString()})`);
        });
      }
    } catch (err) {
      console.log(`Fehler beim Lesen des Verzeichnisses: ${err.message}`);
    }
  }
  
  console.log('\n💡 TIP: Um das Modell zu wechseln, führe aus:');
  console.log('node tools/model-switch.js --model=<modellname>');
  console.log('Unterstützte Modelle: copilot, chatgpt, claude, gemini, llama');
  
  console.log('\n💡 TIP: Um alle KI-Services zu starten oder neu zu starten:');
  console.log('node tools/ai-services-manager.js restart');
}

// Führe die Hauptfunktion aus
try {
  showAIStatus();
} catch (error) {
  console.error(`❌ Unerwarteter Fehler: ${error.message}`);
}
