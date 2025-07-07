/**
 * Unified Monitoring Service
 *
 * Führt alle wichtigen Monitoring- und Health-Check-Skripte nacheinander aus
 * und aktualisiert anschließend das Status-Dashboard.
 * Dieser Service dient als zentraler Punkt für die kontinuierliche Überwachung.
 *
 * Argumente:
 * --silent: Führt das Skript mit minimaler Ausgabe aus, nur Fehler werden angezeigt.
 */

const { execSync } = require('child_process');
const path = require('path');

// Argumente aus der Kommandozeile auslesen
const args = process.argv.slice(2);
const isSilent = args.includes('--silent');

// Farben für die Konsolenausgabe
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

// Liste der auszuführenden Skripte in der gewünschten Reihenfolge
const scriptsToRun = [
  { name: 'GSC Auth Check', file: 'tools/gsc-auth-check.js' },
  { name: 'AI Auth Check', file: 'tools/ai-auth-check.js' },
  { name: 'Extension Health Check', file: 'extension-function-validator.js' },
  { name: 'Website Health Check', file: 'tools/website-health-check.js' },
  { name: 'GSC Integration Monitor', file: 'tools/gsc-integration-monitor.js' },
  { name: 'Deployment Checker', file: 'tools/deployment-checker.js' },
  { name: 'Dependabot Monitor', file: 'tools/dependabot-monitor.js' },
  { name: 'Snyk Security Scan', file: 'tools/enhanced-security-manager.js' },
];

const dashboardGeneratorScript = 'tools/generate-status-dashboard.js';

/**
 * Führt ein Skript aus und gibt den Status zurück.
 * @param {string} scriptName - Der Name des Skripts für die Ausgabe.
 * @param {string} scriptPath - Der Pfad zum Skript.
 */
function runScript(scriptName, scriptPath) {
  if (!isSilent) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {
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
    console.log(`${colors.cyan}--- Starte: ${scriptName} ---${colors.reset}`);
  }
  try {
    // Im Silent-Modus wird die Ausgabe unterdrückt, außer bei Fehlern
    const stdioOption = isSilent ? 'pipe' : 'inherit';
    execSync(`node ${scriptPath}`, { stdio: stdioOption });
    if (!isSilent) {
      console.log(`${colors.green}--- Beendet: ${scriptName} erfolgreich ---${colors.reset}\n`);
    }
    return true;
  } catch (error) {
    // Fehler werden immer angezeigt
    console.error(`${colors.red}--- Fehler bei: ${scriptName} ---${colors.reset}`);
    // Die detaillierte Fehlermeldung wird bereits vom untergeordneten Skript ausgegeben
    if (!isSilent) {
      console.error(`${colors.yellow}Fahre mit dem nächsten Skript fort...${colors.reset}\n`);
    }
    return false;
  }
}

/**
 * Hauptfunktion des Monitoring-Service
 */
function runAllChecks() {
  let hasErrors = false;
  if (!isSilent) {
    console.log(`${colors.green}🚀 Starte Unified Monitoring Service...${colors.reset}`);
  }

  // Alle Check-Skripte ausführen
  scriptsToRun.forEach((script) => {
    const scriptPath = path.resolve(__dirname, '..', script.file);
    const success = runScript(script.name, scriptPath);
    if (!success) {
      hasErrors = true;
    }
  });

  // Dashboard am Ende aktualisieren
  if (!isSilent) {
    console.log(`${colors.cyan}--- Starte: Dashboard-Generierung ---${colors.reset}`);
  }
  try {
    const dashboardPath = path.resolve(__dirname, '..', dashboardGeneratorScript);
    const stdioOption = isSilent ? 'pipe' : 'inherit';
    execSync(`node ${dashboardPath}`, { stdio: stdioOption });
    if (!isSilent) {
      console.log(
        `${colors.green}--- Beendet: Dashboard-Generierung erfolgreich ---${colors.reset}\n`,
      );
    }
  } catch (error) {
    console.error(`${colors.red}--- Fehler bei: Dashboard-Generierung ---${colors.reset}`);
    hasErrors = true;
  }

  if (isSilent && hasErrors) {
    console.log(
      `${colors.red}Einige Monitoring-Checks sind fehlgeschlagen. Bitte führen Sie 'Unified Monitoring Service' manuell aus für Details.${colors.reset}`,
    );
  } else if (!isSilent) {
    console.log(`${colors.green}✅ Unified Monitoring Service abgeschlossen.${colors.reset}`);
  }
}

// Service starten
runAllChecks();

] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
} // Auto-korrigierte schließende Klammer