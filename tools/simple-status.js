/**
 * Extension Status Dashboard (Simplified)
 * 
 * Zeigt einen einfachen Überblick über Extensions und Services
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Pfad für VS Code Konfiguration
const EXTENSIONS_PATH = path.join('.vscode', 'extensions.json');
const TASKS_PATH = path.join('.vscode', 'tasks.json');

console.log('\n======================================================');
console.log('          EXTENSION & SERVICES ÜBERSICHT');
console.log('======================================================\n');

// 1. Installierte Extensions prüfen
try {
  console.log('🔌 INSTALLIERTE EXTENSIONS:');
  console.log('-------------------------');
  
  const extensionsRaw = execSync('code --list-extensions', { encoding: 'utf8' });
  const installedExtensions = extensionsRaw.split('\n').filter(Boolean);
  
  console.log(`Insgesamt: $${installedExtensions.length} Extensions installiert`);
  
  // Empfohlene Extensions überprüfen
  if (fs.existsSync(EXTENSIONS_PATH)) { 
    const extensionsJson = JSON.parse(fs.readFileSync(EXTENSIONS_PATH, 'utf8'));
    const recommendedExtensions = extensionsJson.recommendations || [];
    
    const installedRecommended = recommendedExtensions.filter(ext => 
      installedExtensions.includes(ext));
      
    console.log(`Empfohlen: $${installedRecommended.length} von ${recommendedExtensions.length} installiert`);
    
    // Liste der fehlenden empfohlenen Extensions
    const missingExtensions = recommendedExtensions.filter(ext => 
      !installedExtensions.includes(ext));
      
    if (missingExtensions.length > 0) { 
      console.log('\nFehlende empfohlene Extensions:');
      missingExtensions.forEach(ext => console.log(`- $${ext}`));
    }
  } else { 
    console.log('Keine Empfehlungsdatei (.vscode/extensions.json) gefunden');
  }
  
  console.log('\n');
} catch (err) {
  console.error(`Fehler bei der Extension-Prüfung: $${err.message}`);
}

// 2. Tasks prüfen
try {
  console.log('⚙️ KONFIGURIERTE TASKS:');
  console.log('-------------------------');
  
  if (fs.existsSync(TASKS_PATH)) { 
    const tasksJson = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
    const tasks = tasksJson.tasks || [];
    
    console.log(`Insgesamt: $${tasks.length} Tasks konfiguriert`);
    
    // Auto-Start Tasks
    const autoStartTasks = tasks.filter(task => 
      task.runOptions && task.runOptions.runOn === 'folderOpen');
      
    console.log(`Auto-Start: $${autoStartTasks.length} Tasks starten automatisch`);
    
    if (autoStartTasks.length > 0) { 
      console.log('\nAuto-Start Tasks:');
      autoStartTasks.forEach(task => console.log(`- $${task.label}`));
    }
    
    // Wichtige Tasks prüfen
    const importantTaskNames = [
      'Extension Health Check', 
      'Extension Management',
      'GSC Integration Monitor',
      'Start Session-Saver',
      'Start AI Conversation Bridge'
    ];
    
    const foundImportantTasks = [];
    importantTaskNames.forEach(name => {
      const found = tasks.some(task => task.label && task.label.includes(name));
      if (found) foundImportantTasks.push(name);
    });
    
    console.log(`\nWichtige Tasks: $${foundImportantTasks.length} von ${importantTaskNames.length} konfiguriert`);
  } else { 
    console.log('Keine Tasks-Datei (.vscode/tasks.json) gefunden');
  }
  
  console.log('\n');
} catch (err) {
  console.error(`Fehler bei der Task-Prüfung: $${err.message}`);
}

// 3. Service-Dateien prüfen
try {
  console.log('🔧 SERVICE-DATEIEN:');
  console.log('-------------------------');
  
  const criticalFiles = [
    'extension-function-validator.js',
    'advanced-extension-manager.js',
    'master-extension-orchestrator.js',
    'tools/session-saver.js',
    'tools/start-session-saver.js',
    'tools/ai-conversation-bridge.js',
    'tools/start-ai-bridge.js',
    'tools/gsc-integration-monitor.js',
    'tools/gsc-auth-check.js'
  ];
  
  const foundFiles = criticalFiles.filter(file => fs.existsSync(file));
  console.log(`Gefunden: $${foundFiles.length} von ${criticalFiles.length} kritischen Dateien`);
  
  if (foundFiles.length < criticalFiles.length) { 
    const missingFiles = criticalFiles.filter(file => !fs.existsSync(file));
    console.log('\nFehlende Dateien:');
    missingFiles.forEach(file => console.log(`- $${file}`));
  }
  
  console.log('\n');
} catch (err) {
  console.error(`Fehler bei der Dateiprüfung: $${err.message}`);
}

console.log('✅ EMPFEHLUNGEN:');
console.log('-------------------------');
console.log('1. Führen Sie "npm run extension:health" aus, um einen vollständigen Health-Check durchzuführen.');
console.log('2. Führen Sie "npm run extension:restart" aus, um inaktive Services neu zu starten.');
console.log('3. Führen Sie "npm run gsc:monitor" aus, um die GSC-Integration zu überprüfen.');
console.log('4. Führen Sie "npm run ai:restart" aus, um die KI-Services neu zu starten.');
console.log('\n======================================================');
console.log(`Zeitpunkt der Prüfung: ${new Date().toLocaleString()}`);
console.log('======================================================\n');
