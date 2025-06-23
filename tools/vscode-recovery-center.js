#!/usr/bin/env node

/**
 * VS Code Recovery Center
 * 
 * Zentrale Benutzeroberfläche für alle Wiederherstellungsfunktionen im Projekt
 * - Zeigt den Status des VS Code Recovery Managers
 * - Listet verfügbare Recovery-Screenshots auf
 * - Bietet Wiederherstellungsoptionen an
 * 
 * Erstellt: 2025-06-23
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  RECOVERY_SCREENSHOT_DIR: path.join(__dirname, '.recovery-screenshots'),
  RECOVERY_STATUS_FILE: path.join(__dirname, 'recovery-status.json'),
  RECOVERY_MANAGER_SCRIPT: path.join(__dirname, 'vscode-recovery-manager.js'),
  AUTO_SCREENSHOT_SCRIPT: path.join(__dirname, 'auto-screenshot-manager.js'),
  MAX_SCREENSHOTS_TO_DISPLAY: 10
};

/**
 * Zeigt formatierte Ausgabe mit Farben an
 */
function printColored(message, colorCode = '\x1b[36m') {
  console.log(`${colorCode}${message}\x1b[0m`);
}

/**
 * Prüft, ob der Recovery-Manager aktiv ist
 */
function checkRecoveryManagerStatus() {
  try {
    if (fs.existsSync(CONFIG.RECOVERY_STATUS_FILE)) {
      const statusData = JSON.parse(fs.readFileSync(CONFIG.RECOVERY_STATUS_FILE, 'utf8'));
      const isActive = statusData.isActive === true;
      const lastCheck = new Date(statusData.lastCheck || Date.now());
      const services = statusData.services || {};
      
      printColored('🔄 VS Code Recovery Manager Status:', '\x1b[1;36m');
      printColored(`Status: ${isActive ? '🟢 Aktiv' : '🔴 Inaktiv'}`, isActive ? '\x1b[32m' : '\x1b[31m');
      printColored(`Letzte Prüfung: ${lastCheck.toLocaleString('de-DE')}`, '\x1b[33m');
      
      if (Object.keys(services).length > 0) {
        printColored('\n📊 Wiederhergestellte Services:', '\x1b[1;36m');
        Object.entries(services).forEach(([id, service]) => {
          const statusEmoji = service.status === 'running' ? '✅' : 
                              service.status === 'error' ? '❌' : '⚠️';
          printColored(`${statusEmoji} ${service.name}: ${service.status}`, 
                      service.status === 'running' ? '\x1b[32m' : '\x1b[33m');
        });
      }
    } else {
      printColored('⚠️ Recovery Manager Status nicht verfügbar', '\x1b[33m');
    }
  } catch (error) {
    printColored(`❌ Fehler beim Prüfen des Recovery Manager Status: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Listet die neuesten Recovery-Screenshots auf
 */
function listRecoveryScreenshots() {
  try {
    if (fs.existsSync(CONFIG.RECOVERY_SCREENSHOT_DIR)) {
      const files = fs.readdirSync(CONFIG.RECOVERY_SCREENSHOT_DIR)
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, a));
          const statB = fs.statSync(path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        })
        .slice(0, CONFIG.MAX_SCREENSHOTS_TO_DISPLAY);
      
      if (files.length > 0) {
        printColored('\n📸 Verfügbare Recovery-Screenshots:', '\x1b[1;36m');
        files.forEach(file => {
          const filePath = path.join(CONFIG.RECOVERY_SCREENSHOT_DIR, file);
          const stats = fs.statSync(filePath);
          const fileSizeKB = Math.round(stats.size / 1024);
          printColored(`  ${file} (${stats.mtime.toLocaleString('de-DE')}, ${fileSizeKB} KB)`, '\x1b[32m');
        });
      } else {
        printColored('\n⚠️ Keine Recovery-Screenshots verfügbar', '\x1b[33m');
      }
    } else {
      printColored('\n⚠️ Recovery-Screenshot-Verzeichnis nicht gefunden', '\x1b[33m');
    }
  } catch (error) {
    printColored(`\n❌ Fehler beim Auflisten der Recovery-Screenshots: ${error.message}`, '\x1b[31m');
  }
}

/**
 * Zeigt Wiederherstellungsoptionen an
 */
function showRecoveryOptions() {
  printColored('\n🛠️ Wiederherstellungsoptionen:', '\x1b[1;36m');
  printColored('  1. Recovery Manager neu starten: "node tools/vscode-recovery-manager.js --force-restart"', '\x1b[32m');
  printColored('  2. Sofortigen Recovery-Screenshot erstellen: "node tools/auto-screenshot-manager.js --now"', '\x1b[32m');
  printColored('  3. Google Search Console Status prüfen: "node tools/gsc-status-check.js"', '\x1b[32m');
  printColored('  4. Google Search Console Setup Guide: "node tools/gsc-setup-guide.js"', '\x1b[32m');
  printColored('  5. Alle Dienste prüfen: "npm run validate"', '\x1b[32m');
}

/**
 * Hauptfunktion
 */
function main() {
  const divider = '═'.repeat(60);
  
  console.clear();
  printColored(`\n${divider}`, '\x1b[1;36m');
  printColored('           🔄 VS Code Recovery Center           ', '\x1b[1;37m');
  printColored(`${divider}\n`, '\x1b[1;36m');
  
  checkRecoveryManagerStatus();
  listRecoveryScreenshots();
  showRecoveryOptions();
  
  printColored(`\n${divider}`, '\x1b[1;36m');
  printColored(' Prioritätenliste nach Absturz:', '\x1b[1;33m');
  printColored(' 1. Google Search Console & SEO Monitoring', '\x1b[33m');
  printColored(' 2. CI/CD-Qualität & Live-Überwachung', '\x1b[33m');
  printColored(' 3. Developer Experience & VS Code Optimierung', '\x1b[33m');
  printColored(`${divider}\n`, '\x1b[1;36m');
}

// Programm ausführen
main();
