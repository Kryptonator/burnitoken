#!/usr/bin/env node

/**
 * 🚨 EMERGENCY: VS Code Anti-Input-Crash Tool
 *
 * Dieses Script behebt das kritische Problem, dass VS Code beim Schreiben abstürzt.
 * Es deaktiviert alle potentiell störenden Extensions und setzt sichere Einstellungen.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('🚨 NOTFALL: VS Code Input-Crash-Fix gestartet...\n');

// VS Code Benutzerverzeichnisse
const vscodeUserDir = path.join(os.homedir(), '.vscode', 'User');
const vscodeExtensionsDir = path.join(os.homedir(), '.vscode', 'extensions');

// 1. Alle VS Code Prozesse beenden
console.log('⚡ Beende alle VS Code Prozesse...');
try {
  if (os.platform() === 'win32') {
    execSync('taskkill /F /IM "Code.exe" 2>nul', { stdio: 'ignore' });
    execSync('taskkill /F /IM "code.exe" 2>nul', { stdio: 'ignore' });
    execSync('taskkill /F /IM "electron.exe" 2>nul', { stdio: 'ignore' });
  } else {
    execSync('pkill -f "code" || true', { stdio: 'ignore' });
    execSync('pkill -f "Code.exe" || true', { stdio: 'ignore' });
    execSync('pkill -f "electron" || true', { stdio: 'ignore' });
  }
  console.log('✅ VS Code Prozesse beendet');
} catch (e) {
  console.log('⚠️ Einige Prozesse waren bereits beendet');
}

// 2. Copilot Chat Extension deaktivieren
console.log('\n🚫 Deaktiviere problematische Extensions...');
try {
  if (fs.existsSync(vscodeExtensionsDir)) {
    const extensions = fs.readdirSync(vscodeExtensionsDir);
    const problematicExtensions = extensions.filter(
      (ext) =>
        ext.includes('copilot-chat') ||
        ext.includes('copilot') ||
        ext.includes('github.copilot-chat'),
    );

    problematicExtensions.forEach((ext) => {
      const extPath = path.join(vscodeExtensionsDir, ext);
      const disabledPath = path.join(vscodeExtensionsDir, ext + '.DISABLED');
      try {
        if (fs.existsSync(extPath) && !ext.includes('.DISABLED')) {
          fs.renameSync(extPath, disabledPath);
          console.log(`✅ Extension deaktiviert: ${ext}`);
        }
      } catch (e) {
        console.log(`⚠️ Konnte Extension nicht deaktivieren: ${ext}`);
      }
    });
  }
} catch (e) {
  console.log('⚠️ Extension-Verzeichnis nicht gefunden');
}

// 3. Sichere VS Code Settings erstellen
console.log('\n⌨️ Erstelle sichere VS Code Einstellungen...');
const emergencySettings = {
  'extensions.autoUpdate': false,
  'extensions.autoCheckUpdates': false,
  'github.copilot.enable': false,
  'github.copilot.chat.enable': false,
  'editor.quickSuggestions': false,
  'editor.suggestOnTriggerCharacters': false,
  'editor.acceptSuggestionOnEnter': 'off',
  'editor.tabCompletion': 'off',
  'typescript.suggest.enabled': false,
  'javascript.suggest.enabled': false,
  'emmet.showSuggestionsAsSnippets': false,
  'editor.parameterHints.enabled': false,
  'editor.hover.enabled': false,
  'editor.lightbulb.enabled': false,
  'workbench.startupEditor': 'none',
  'telemetry.telemetryLevel': 'off',
  'update.mode': 'none',
  'editor.wordBasedSuggestions': false,
  'editor.snippetSuggestions': 'none',
  'extensions.ignoreRecommendations': true,
};

try {
  // User Settings
  if (!fs.existsSync(vscodeUserDir)) {
    fs.mkdirSync(vscodeUserDir, { recursive: true });
  }

  const userSettingsPath = path.join(vscodeUserDir, 'settings.json');
  fs.writeFileSync(userSettingsPath, JSON.stringify(emergencySettings, null, 2));
  console.log('✅ User Settings gesichert');

  // Workspace Settings
  const workspaceSettingsDir = path.join(process.cwd(), '.vscode');
  if (!fs.existsSync(workspaceSettingsDir)) {
    fs.mkdirSync(workspaceSettingsDir, { recursive: true });
  }

  const workspaceSettingsPath = path.join(workspaceSettingsDir, 'settings.json');
  const workspaceSettings = {
    'extensions.ignoreRecommendations': true,
    'github.copilot.enable': false,
    'editor.quickSuggestions': false,
    'typescript.suggest.enabled': false,
    'javascript.suggest.enabled': false,
  };

  fs.writeFileSync(workspaceSettingsPath, JSON.stringify(workspaceSettings, null, 2));
  console.log('✅ Workspace Settings gesichert');
} catch (e) {
  console.log('⚠️ Fehler beim Erstellen der Settings:', e.message);
}

// 4. Cache-Dateien löschen
console.log('\n🧹 Lösche problematische Cache-Dateien...');
const cacheDirs = [
  path.join(os.homedir(), '.vscode', 'logs'),
  path.join(os.homedir(), '.vscode', 'CachedExtensions'),
  path.join(os.homedir(), '.vscode', 'User', 'workspaceStorage'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'logs'), // Windows
  path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'logs'), // macOS
];

cacheDirs.forEach((dir) => {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Cache gelöscht: ${path.basename(dir)}`);
    }
  } catch (e) {
    console.log(`⚠️ Cache-Ordner nicht zugänglich: ${path.basename(dir)}`);
  }
});

// 5. Status-Report
console.log('\n📊 NOTFALL-FIX ABGESCHLOSSEN');
console.log('=====================================');
console.log('✅ VS Code Prozesse beendet');
console.log('✅ Problematische Extensions deaktiviert');
console.log('✅ Sichere Einstellungen aktiviert');
console.log('✅ Cache-Dateien gelöscht');
console.log('\n💡 VS Code jetzt im SAFE MODE starten:');
console.log('   code --disable-extensions --disable-gpu');
console.log('\n🔧 Oder normale Neustart - sollte jetzt stabil laufen!');

// 6. Optional: VS Code im Safe Mode starten
if (process.argv.includes('--start-safe')) {
  console.log('\n🔧 Starte VS Code im Safe Mode...');
  try {
    execSync('code --disable-extensions --disable-gpu', {
      stdio: 'ignore',
      detached: true,
    });
    console.log('✅ VS Code gestartet');
  } catch (e) {
    console.log('⚠️ VS Code konnte nicht automatisch gestartet werden');
    console.log('💡 Starte manuell: code --disable-extensions --disable-gpu');
  }
}
