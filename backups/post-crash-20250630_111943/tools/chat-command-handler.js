#!/usr/bin/env node

/**
 * 🤖 VS Code Chat Command Handler
 * 
 * Reagiert auf Chat-Befehle wie "hilfe", "help", "recovery", "fix"
 * und führt automatisch entsprechende Recovery-Aktionen aus.
 * 
 * Befehle:
 * - hilfe / help: Zeigt Hilfe und startet Basic-Recovery
 * - recovery / fix: Startet Emergency-Recovery
 * - status: Zeigt System-Status
 * - clean: Memory & Cache-Cleanup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Chat-Command-Patterns erkennen
const HELP_PATTERNS = [
  /^hilfe$/i,        // hilfe, Hilfe, HILFE
  /^help$/i,         // help, Help, HELP
  /^h$/i,            // h, H
  /^sos$/i,          // sos, SOS
  /^notfall$/i,      // notfall, Notfall, NOTFALL
  /.*hilfe.*/i,      // alles mit "hilfe" drin
  /.*help.*/i,       // alles mit "help" drin
  /.*hängt.*/i,      // hängt, blockiert, etc.
  /.*hang.*/i,       // hang, hanging
  /.*freeze.*/i,     // freeze, freezing
  /.*crash.*/i,      // crash, crashed
  /.*problem.*/i,    // problem, Problem
  /.*stuck.*/i,      // stuck, stecken
  /.*blockiert.*/i   // blockiert, blocked
];

const RECOVERY_PATTERNS = [
  /^recovery$/i,     // recovery, Recovery, RECOVERY
  /^fix$/i,          // fix, Fix, FIX
  /^repair$/i,       // repair, Repair, REPAIR
  /^reparieren$/i,   // reparieren, Reparieren
  /^emergency$/i,    // emergency, Emergency, EMERGENCY
  /^notfall$/i,      // notfall, Notfall, NOTFALL
  /^crash$/i         // crash, Crash, CRASH
];

const STATUS_PATTERNS = [
  /^status$/i,       // status, Status, STATUS
  /^check$/i,        // check, Check, CHECK
  /^prüfen$/i,       // prüfen, Prüfen
  /^info$/i,         // info, Info, INFO
  /^state$/i         // state, State, STATE
];

const CLEAN_PATTERNS = [
  /^clean$/i,        // clean, Clean, CLEAN
  /^cleanup$/i,      // cleanup, Cleanup, CLEANUP
  /^clear$/i,        // clear, Clear, CLEAR
  /^löschen$/i,      // löschen, Löschen
  /^delete$/i,       // delete, Delete, DELETE
  /^reset$/i         // reset, Reset, RESET
];

/**
 * Farbige Konsolen-Ausgabe
 */
function printColored(message, color = '\x1b[36m') {
  console.log(`$${color}${message}\x1b[0m`);
}

/**
 * Emergency Recovery ausführen
 */
function runEmergencyRecovery() {
  printColored('🚨 EMERGENCY RECOVERY GESTARTET...', '\x1b[1;31m');
  
  try {
    // Windows Recovery Script ausführen
    if (process.platform === 'win32') { 
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
  if (fs.existsSync('EMERGENCY-RECOVERY.bat')) { ;
}
        printColored('⚡ Führe Windows Recovery aus...', '\x1b[33m');
        execSync('EMERGENCY-RECOVERY.bat', { stdio: 'inherit' });
      }
    } else { 
      // Linux/Mac Recovery Script
      if (fs.existsSync('emergency-recovery.sh')) { 
        printColored('⚡ Führe Unix Recovery aus...', '\x1b[33m');
        execSync('chmod +x emergency-recovery.sh && ./emergency-recovery.sh', { stdio: 'inherit' });
      }
    }
    
    // Recovery Center starten
    if (fs.existsSync('tools/vscode-recovery-center.js')) { 
      printColored('🔄 Starte Recovery Center...', '\x1b[33m');
      execSync('node tools/vscode-recovery-center.js --live-check', { stdio: 'inherit' });
    }
    
    printColored('✅ EMERGENCY RECOVERY ABGESCHLOSSEN!', '\x1b[1;32m');
    
  } catch (error) {
    printColored(`❌ Recovery-Fehler: $${error.message}`, '\x1b[31m');
  }
}

/**
 * Basis-Hilfe und leichtes Recovery
 */
function runBasicHelp() {
  printColored('🆘 VS CODE HILFE & QUICK-FIX', '\x1b[1;36m');
  printColored('═'.repeat(50), '\x1b[36m');
  
  printColored('\n🔧 Verfügbare Chat-Befehle:', '\x1b[1;37m');
  printColored('• hilfe / Hilfe / help / Help        → Diese Hilfe + Quick-Fix', '\x1b[32m');
  printColored('• recovery / fix / Recovery / FIX     → Emergency-Recovery', '\x1b[32m');
  printColored('• status / check / Status / CHECK     → System-Status prüfen', '\x1b[32m');
  printColored('• clean / cleanup / Clean / CLEANUP   → Cache & Memory leeren', '\x1b[32m');
  printColored('• sos / SOS / notfall / NOTFALL       → Sofort-Hilfe', '\x1b[32m');
  
  printColored('\n⚡ Quick-Fix wird ausgeführt...', '\x1b[33m');
  
  try {
    // Prozesse sanft beenden
    if (process.platform === 'win32') { 
      execSync('taskkill /F /IM "Code.exe" /T 2>nul || echo "Prozesse beendet"', { stdio: 'inherit' });
    } else { 
      execSync('pkill -f "code" 2>/dev/null || echo "Prozesse beendet"', { stdio: 'inherit' });
    }
    
    // Cache leeren
    const tempDirs = [
      path.join(process.env.TEMP || '/tmp', 'vscode-*'),
      path.join(require('os').homedir(), '.vscode/logs'),
      path.join(require('os').homedir(), '.vscode/CachedExtensions')
    ];
    
    tempDirs.forEach(dir => {
      try {
        if (fs.existsSync(dir)) { 
          fs.rmSync(dir, { recursive: true, force: true });
          printColored(`✅ Cache geleert: $${dir}`, '\x1b[32m');
        }
      } catch (e) {
        // Ignorieren falls nicht löschbar
      }
    });
    
    printColored('\n🎯 Nächste Schritte:', '\x1b[1;37m');
    printColored('1. VS Code neu starten', '\x1b[36m');
    printColored('2. Bei Problemen: "recovery" in Chat eingeben', '\x1b[36m');
    printColored('3. Live-Status: "status" in Chat eingeben', '\x1b[36m');
    
  } catch (error) {
    printColored(`⚠️ Quick-Fix-Warnung: $${error.message}`, '\x1b[33m');
  }
}

/**
 * System-Status prüfen
 */
function runStatusCheck() {
  printColored('📊 SYSTEM-STATUS-CHECK', '\x1b[1;36m');
  printColored('═'.repeat(40), '\x1b[36m');
  
  try {
    // Recovery Center Status falls vorhanden
    if (fs.existsSync('tools/vscode-recovery-center.js')) { 
      execSync('node tools/vscode-recovery-center.js --live-check', { stdio: 'inherit' });
    } else { 
      printColored('⚠️ Recovery Center nicht gefunden', '\x1b[33m');
    }
    
    // Prozess-Check
    printColored('\n🔍 Aktive VS Code Prozesse:', '\x1b[1;37m');
    if (process.platform === 'win32') { 
      try {
        execSync('tasklist | findstr "Code.exe" || echo "Keine VS Code Prozesse"', { stdio: 'inherit' });
      } catch (e) {
        printColored('Keine VS Code Prozesse aktiv', '\x1b[32m');
      }
    } else { 
      try {
        execSync('ps aux | grep -i code | grep -v grep || echo "Keine VS Code Prozesse"', { stdio: 'inherit' });
      } catch (e) {
        printColored('Keine VS Code Prozesse aktiv', '\x1b[32m');
      }
    }
    
  } catch (error) {
    printColored(`❌ Status-Check-Fehler: $${error.message}`, '\x1b[31m');
  }
}

/**
 * Cache & Memory-Cleanup
 */
function runCleanup() {
  printColored('🧹 CACHE & MEMORY CLEANUP', '\x1b[1;36m');
  printColored('═'.repeat(40), '\x1b[36m');
  
  try {
    // Memory-Cleanup (plattformspezifisch)
    if (process.platform === 'win32') { 
      execSync('echo 🧹 Windows Memory-Cleanup... && sfc /scannow >nul 2>&1 || echo Cleanup OK', { stdio: 'inherit' });
    } else { 
      execSync('echo 🧹 Linux Memory-Cleanup... && sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || echo Cleanup OK', { stdio: 'inherit' });
    }
    
    printColored('✅ Memory-Cleanup abgeschlossen', '\x1b[32m');
    
  } catch (error) {
    printColored(`⚠️ Cleanup-Warnung: $${error.message}`, '\x1b[33m');
  }
}

/**
 * Chat-Input analysieren und entsprechende Aktion ausführen
 */
function handleChatCommand(input) {
  const command = input.trim();
  
  if (RECOVERY_PATTERNS.some(pattern => pattern.test(command))) { 
    runEmergencyRecovery();
  } else if (STATUS_PATTERNS.some(pattern => pattern.test(command))) { 
    runStatusCheck();
  } else if (CLEAN_PATTERNS.some(pattern => pattern.test(command))) { 
    runCleanup();
  } else if (HELP_PATTERNS.some(pattern => pattern.test(command))) { 
    runBasicHelp();
  } else { 
    // Unbekannter Befehl - zeige Hilfe
    printColored('❓ Unbekannter Befehl. Zeige Hilfe...', '\x1b[33m');
    runBasicHelp();
  }
}

/**
 * Hauptfunktion - Chat-Monitoring oder direkter Befehl
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) { 
    // Direkter Befehl via Argument
    const command = args.join(' ');
    handleChatCommand(command);
  } else { 
    // Standard-Hilfe anzeigen
    runBasicHelp();
  }
}

// Auto-Start falls direkt aufgerufen
if (require.main === module) { 
  main();
}

module.exports = { handleChatCommand, runEmergencyRecovery, runBasicHelp, runStatusCheck, runCleanup };



}
}


}


}




}


}


}
}


}
}




}
}




}


}










}
}
}

}


















}


}




}


}
}


}
}
}


}


}


] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
}
}
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer
}
] // Auto-korrigierte schließende Klammer
) // Auto-korrigierte schließende Klammer