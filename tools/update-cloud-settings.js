#!/usr/bin/env node
/**
 * Cloud-Umgebung Einstellungsaktualisierung
 * Dieses Skript hilft dabei, bestehende Cloud-Entwicklungsumgebungen mit den neuesten Extension-Einstellungen zu aktualisieren.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CloudSettingsSynchronizer {
  constructor() {
    this.workspaceRoot = process.cwd();
    console.log('🔄 Starte Cloud-Umgebung Einstellungsaktualisierung...');
  }

  /**
   * Aktualisiert die lokale Umgebung mit den neuesten Einstellungen vom Repository
   */
  updateLocalEnvironment() {
    try {
      console.log('📥 Hole die neuesten Änderungen vom Repository...');
      execSync('git pull', { stdio: 'inherit' });
      
      console.log('✅ Repository aktualisiert!');
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren des Repositories:', error.message);
      return false;
    }
  }

  /**
   * Überprüft, ob VS Code-Einstellungen seit dem letzten Pull aktualisiert wurden
   */
  checkForSettingsChanges() {
    try {
      const output = execSync('git diff --name-only HEAD@{1} HEAD', { encoding: 'utf8' });
      const changedFiles = output.split('\n').filter(Boolean);
      
      const vsCodeSettingsChanged = changedFiles.some(file => 
        file.includes('.vscode/') || file.endsWith('.code-workspace')
      );
      
      if (vsCodeSettingsChanged) {
        console.log('🔔 VS Code-Einstellungen wurden aktualisiert!');
        return changedFiles.filter(file => 
          file.includes('.vscode/') || file.endsWith('.code-workspace')
        );
      } else {
        console.log('ℹ️ Keine Änderungen an VS Code-Einstellungen gefunden.');
        return [];
      }
    } catch (error) {
      console.error('❌ Fehler beim Überprüfen der Änderungen:', error.message);
      return [];
    }
  }

  /**
   * Aktualisiert die Codespaces-Konfiguration, falls vorhanden
   */
  updateCodespacesConfig() {
    const devcontainerPath = path.join(this.workspaceRoot, '.devcontainer', 'devcontainer.json');
    const vscodeSettingsPath = path.join(this.workspaceRoot, '.vscode', 'settings.json');
    const extensionsPath = path.join(this.workspaceRoot, '.vscode', 'extensions.json');
    
    if (!fs.existsSync(vscodeSettingsPath)) {
      console.log('⚠️ Keine .vscode/settings.json gefunden.');
      return false;
    }
    
    try {
      // Erstelle .devcontainer, falls es nicht existiert
      if (!fs.existsSync(path.dirname(devcontainerPath))) {
        fs.mkdirSync(path.dirname(devcontainerPath), { recursive: true });
      }
      
      const settings = JSON.parse(fs.readFileSync(vscodeSettingsPath, 'utf8'));
      let extensions = [];
      
      if (fs.existsSync(extensionsPath)) {
        const extensionsJson = JSON.parse(fs.readFileSync(extensionsPath, 'utf8'));
        extensions = extensionsJson.recommendations || [];
      }
      
      let devcontainer = {};
      if (fs.existsSync(devcontainerPath)) {
        devcontainer = JSON.parse(fs.readFileSync(devcontainerPath, 'utf8'));
      } else {
        devcontainer = {
          "name": "BurniToken Development Environment",
          "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
          "forwardPorts": [3000, 5000, 5500],
          "postCreateCommand": "npm install",
          "features": {
            "ghcr.io/devcontainers/features/node:1": {}
          }
        };
      }
      
      // Aktualisiere Einstellungen und Erweiterungen
      devcontainer.settings = { ...devcontainer.settings, ...settings };
      devcontainer.extensions = extensions;
      
      fs.writeFileSync(devcontainerPath, JSON.stringify(devcontainer, null, 2), 'utf8');
      console.log('✅ Codespaces-Konfiguration aktualisiert!');
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren der Codespaces-Konfiguration:', error.message);
      return false;
    }
  }

  /**
   * Führt den gesamten Aktualisierungsprozess aus
   */
  async run() {
    const updated = this.updateLocalEnvironment();
    if (!updated) {
      console.error('🛑 Abbruch: Repository konnte nicht aktualisiert werden.');
      return;
    }
    
    const changedSettingsFiles = this.checkForSettingsChanges();
    if (changedSettingsFiles.length > 0) {
      console.log('📄 Geänderte Einstellungsdateien:');
      changedSettingsFiles.forEach(file => console.log(`  - ${file}`));
      
      this.updateCodespacesConfig();
      
      console.log('\n🔄 Bitte starte VS Code neu, um die Änderungen zu übernehmen!');
      console.log('💡 Tipp: Wenn du VS Code in einer Cloud-Umgebung nutzt, stelle sicher, dass die Einstellungen korrekt synchronisiert sind.');
    }
    
    console.log('\n✨ Cloud-Umgebung Einstellungsaktualisierung abgeschlossen!');
  }
}

// Führe das Skript aus
const synchronizer = new CloudSettingsSynchronizer();
synchronizer.run().catch(error => {
  console.error('💥 Unerwarteter Fehler:', error);
  process.exit(1);
});
