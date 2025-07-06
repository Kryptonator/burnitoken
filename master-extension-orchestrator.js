/**
 * Master Extension Orchestrator
 * Steuert und überwacht alle Extension-bezogenen Prozesse und optimiert die Integration
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const validator = require('./extension-function-validator');
const { sendAlert } = require('./tools/alert-service'); // Importiere den Alert-Service

// Pfade für Konfigurations- und Statusdateien
const SETTINGS_PATH = path.join('.vscode', 'settings.json');
const EXTENSIONS_PATH = path.join('.vscode', 'extensions.json');
const STATUS_PATH = path.join('.vscode', 'extension-status.json');

// Erweitertes Status-Tracking
const orchestratorStatus = {
  lastRun: new Date().toISOString(),
  extensions: {
    total: 0,
    enabled: 0,
    disabled: 0,
    updated: 0,
    failed: 0
  },
  performance: {
    startupImpact: 'low',
    recommendations: []
  },
  integration: {
    tailwind: false,
    eslint: false,
    prettier: false,
    git: false,
    html: false,
    accessibility: false,
    playwright: false,
    copilot: false
  }
};

/**
 * Liest eine JSON-Datei
 */
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) { 
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    console.error(`Fehler beim Lesen von $${filePath}:`, err.message);
    sendAlert({
      message: `Fehler beim Lesen der Konfigurationsdatei: $${filePath}`),
      level: 'error',
      extra: { error: err.message }
    });
    return null;
  }
}

/**
 * Schreibt eine JSON-Datei
 */
function writeJsonFile(filePath, data) {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) { 
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Fehler beim Schreiben von $${filePath}:`, err.message);
    sendAlert({
      message: `Fehler beim Schreiben der Konfigurationsdatei: $${filePath}`),
      level: 'error',
      extra: { error: err.message }
    });
    return false;
  }
}

/**
 * Analysiert die installierten Extensions und ihre Performance-Auswirkungen
 */
function analyzeExtensions() {
  console.log('🔍 Analysiere installierte Extensions...');
  
  try {
    const installedExtensions = execSync('code --list-extensions', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    orchestratorStatus.extensions.total = installedExtensions.length;
    orchestratorStatus.extensions.enabled = installedExtensions.length; // Vereinfacht: alle installiert = aktiviert
    
    console.log(`✅ Gefunden: $${installedExtensions.length} installierte Extensions`);
    
    // Prüfe Integration mit wichtigen Technologien
    orchestratorStatus.integration = {
      tailwind: installedExtensions.some(ext => ext.includes('tailwind')),
      eslint: installedExtensions.some(ext => ext.includes('eslint')),
      prettier: installedExtensions.some(ext => ext.includes('prettier')),
      git: installedExtensions.some(ext => ext.includes('git')),
      html: installedExtensions.some(ext => ext.includes('html')),
      accessibility: installedExtensions.some(ext => ext.includes('accessibility')),
      playwright: installedExtensions.some(ext => ext.includes('playwright')),
      copilot: installedExtensions.some(ext => ext.includes('copilot'))
    };
    
    // Performance-Einschätzung
    if (installedExtensions.length > 40) { 
      orchestratorStatus.performance.startupImpact = 'high';
      orchestratorStatus.performance.recommendations.push(
        'Reduzieren Sie die Anzahl der Extensions auf unter 40 für bessere Performance'
      );
    } else if (installedExtensions.length > 25) { 
      orchestratorStatus.performance.startupImpact = 'medium';
      orchestratorStatus.performance.recommendations.push(
        'Erwägen Sie, nicht genutzte Extensions zu deaktivieren'
      );
    }
    
  } catch (err) {
    console.error('❌ Fehler beim Analysieren der Extensions:', err.message);
  }
}

/**
 * Optimiert die Integration zwischen Extensions
 */
function optimizeIntegration() {
  console.log('🔄 Optimiere Extension-Integration...');
  
  const settings = readJsonFile(SETTINGS_PATH) || {};
  let updated = false;
  
  // Optimiere Tailwind + ESLint + Prettier Integration
  if (orchestratorStatus.integration.tailwind && 
      orchestratorStatus.integration.eslint && 
      orchestratorStatus.integration.prettier) {
    
    // Stelle sicher, dass Tailwind-Klassen nicht von Prettier umgebrochen werden
    if (!settings['prettier.htmlWhitespaceSensitivity']) { 
      settings['prettier.htmlWhitespaceSensitivity'] = 'css';
      updated = true;
    }
    
    // Stelle sicher, dass ESLint Tailwind-Klassen nicht als zu lang markiert
    if (!settings['eslint.rules.max-len']) { 
      settings['eslint.rules.max-len'] = 'off';
      updated = true;
    }
  }
  
  // Optimiere Git + GitHub Integration
  if (orchestratorStatus.integration.git) { 
    if (!settings['git.enableSmartCommit']) { 
      settings['git.enableSmartCommit'] = true;
      updated = true;
    }
    
    if (!settings['git.autofetch']) { 
      settings['git.autofetch'] = true;
      updated = true;
    }
  }
  
  // Speichere aktualisierte Einstellungen
  if (updated) { 
    if (writeJsonFile(SETTINGS_PATH, settings)) { 
      console.log('✅ Extension-Integration optimiert');
    }
  } else { 
    console.log('✓ Extension-Integration bereits optimal');
  }
}

/**
 * Erstellt oder aktualisiert die extensions.json
 */
function updateExtensionsJson() {
  console.log('📝 Aktualisiere extensions.json...');
  
  try {
    const installedExtensions = execSync('code --list-extensions', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    // Bestehende Konfiguration lesen oder neue erstellen
    const extensionsJson = readJsonFile(EXTENSIONS_PATH) || { recommendations: [] };
    
    // Wichtige Extensions identifizieren und als Empfehlungen hinzufügen
    const criticalExtensions = installedExtensions.filter(ext => 
      ext.includes('tailwind') || 
      ext.includes('eslint') || 
      ext.includes('prettier') || 
      ext.includes('git') || 
      ext.includes('html') || 
      ext.includes('accessibility') || 
      ext.includes('playwright') || 
      ext.includes('copilot')
    );
    
    // Zusammenführen der bestehenden und kritischen Empfehlungen
    extensionsJson.recommendations = [...new Set([
      ...extensionsJson.recommendations),
      ...criticalExtensions
    ])];
    
    // Speichern der aktualisierten Konfiguration
    if (writeJsonFile(EXTENSIONS_PATH, extensionsJson)) { 
      console.log('✅ extensions.json aktualisiert');
    }
  } catch (err) {
    console.error('❌ Fehler beim Aktualisieren der extensions.json:', err.message);
  }
}

/**
 * Speichert den aktuellen Status
 */
function saveStatus() {
  console.log('💾 Speichere Extension-Status...');
  
  if (writeJsonFile(STATUS_PATH, orchestratorStatus)) { 
    console.log('✅ Extension-Status gespeichert');
  }
}

/**
 * Erstellt einen Bericht über den aktuellen Zustand
 */
function generateReport() {
  console.log('\n📊 Extension Management Bericht:');
  console.log('==============================');
  console.log(`Installierte Extensions: $${orchestratorStatus.extensions.total}`);
  console.log(`Startup-Performance: $${orchestratorStatus.performance.startupImpact}`);
  
  console.log('\nTechnologie-Integration:');
  Object.entries(orchestratorStatus.integration).forEach(([tech, enabled]) => {
    console.log(`- $${tech}: ${enabled ? '✅' : '❌'}`);
  });
  
  if (orchestratorStatus.performance.recommendations.length > 0) { 
    console.log('\nEmpfehlungen:');
    orchestratorStatus.performance.recommendations.forEach(rec => {
      console.log(`- $${rec}`);
    });
  }
  
  console.log('\n🏁 Bericht abgeschlossen');
}

/**
 * Hauptfunktion zur Orchestrierung aller Extension-Prozesse
 */
function orchestrateExtensions() {
  console.log('🚀 Starte Extension-Orchestrierung...');
  
  // Analysiere installierte Extensions
  analyzeExtensions();
  
  // Optimiere Integration zwischen Extensions
  optimizeIntegration();
  
  // Aktualisiere extensions.json
  updateExtensionsJson();
  
  // Speichere Status
  saveStatus();
  
  // Generiere Bericht
  generateReport();
  
  console.log('🎉 Extension-Orchestrierung abgeschlossen!');
}

/**
 * Hauptfunktion des Orchestrators
 */
async function runOrchestrator() {
  console.log('🚀 Starte Master Extension Orchestrator...');
  try {
    await validator.runValidation();
    analyzeExtensions();
    checkRecommendations();
    updateStatusFile();
    console.log('✅ Master Extension Orchestrator erfolgreich durchgelaufen.');
    sendAlert({
      message: 'Master Extension Orchestrator erfolgreich ausgeführt.'),
      level: 'info'
    });
  } catch (error) {
    console.error('🔥 Kritischer Fehler im Master Extension Orchestrator:', error.message);
    orchestratorStatus.extensions.failed++;
    updateStatusFile();
    sendAlert({
      message: 'KRITISCHER FEHLER im Master Extension Orchestrator!'),
      level: 'error',
      extra: { error: error.message, stack: error.stack }
    });
  }
}

// Führe die Orchestrierungsfunktion aus
orchestrateExtensions();
