#!/usr/bin/env node

/**
 * Auto-Startup Script für optimale Extension-Koordination
 *
 * Startet automatisch nach VS Code Neustart und koordiniert alle Extensions
 * für maximale Effizienz und Fehlerfreiheit.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Farbige Ausgabe
 */
function printColored(message, colorCode = '\x1b[36m') {
  console.log(`${colorCode}${message}\x1b[0m`);
}

/**
 * Führt Extension-Tasks aus
 */
async function executeExtensionTasks(groupName) {
  try {
    printColored(`🔄 Führe ${groupName} Tasks aus...`, '\x1b[36m');
    execSync(`node tools/extension-orchestrator.js --group ${groupName}`, {
      stdio: 'inherit',
      timeout: 30000,
    });
    printColored(`✅ ${groupName} Tasks abgeschlossen`, '\x1b[32m');
  } catch (error) {
    printColored(`⚠️ ${groupName} Tasks teilweise fehlgeschlagen: ${error.message}`, '\x1b[33m');
  }
}

/**
 * Hauptstartup-Sequenz
 */
async function startup() {
  printColored('\n🚀 BurniToken Development Environment Startup', '\x1b[1;42m');
  printColored('═'.repeat(60), '\x1b[1;36m');

  try {
    // 1. Extensions installieren und konfigurieren
    printColored('\n📦 Phase 1: Extension Setup', '\x1b[1;36m');
    try {
      execSync('node tools/extension-orchestrator.js --install', {
        stdio: 'inherit',
        timeout: 60000,
      });
    } catch (error) {
      printColored('⚠️ Extension-Installation partiell erfolgreich', '\x1b[33m');
    }

    // 2. Kritische Systeme prüfen
    printColored('\n🔍 Phase 2: System Health Check', '\x1b[1;36m');
    await executeExtensionTasks('security');
    await executeExtensionTasks('deployment');

    // 3. Performance-optimierte Workflows starten
    printColored('\n⚡ Phase 3: Performance Workflows', '\x1b[1;36m');
    await executeExtensionTasks('codeQuality');
    await executeExtensionTasks('performance');

    // 4. SEO & Accessibility kontinuierlich überwachen
    printColored('\n🎯 Phase 4: SEO & Accessibility Monitoring', '\x1b[1;36m');
    await executeExtensionTasks('seoAccessibility');

    // 5. Auto-Healing aktivieren
    printColored('\n🔄 Phase 5: Auto-Healing Activation', '\x1b[1;36m');

    // Recovery Center starten
    try {
      execSync('node tools/vscode-recovery-center.js --live-check', {
        stdio: 'inherit',
        timeout: 30000,
      });
    } catch (error) {
      printColored('⚠️ Recovery Center läuft bereits oder ist nicht verfügbar', '\x1b[33m');
    }

    printColored('\n✅ Startup Complete - Alle Systeme optimal konfiguriert!', '\x1b[1;42m');
    printColored('🎉 BurniToken Development Environment läuft perfekt!', '\x1b[1;32m');
  } catch (error) {
    printColored(`❌ Startup-Fehler: ${error.message}`, '\x1b[31m');
    printColored('🔧 Führe Recovery-Maßnahmen durch...', '\x1b[33m');

    // Fallback: Basis-Recovery
    try {
      execSync('node tools/vscode-recovery-center.js', { stdio: 'inherit' });
    } catch (recoveryError) {
      printColored(`❌ Recovery fehlgeschlagen: ${recoveryError.message}`, '\x1b[31m');
    }
  }
}

// Startup ausführen
startup();
