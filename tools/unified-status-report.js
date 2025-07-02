/**
 * Unified Status Report Generator für burnitoken.website
 *
 * Erstellt einen umfassenden Status-Report der Website, einschließlich:
 * - Extension Status
 * - GSC-Indexierung
 * - AI-Services
 * - Live-Website-Validierung
 *
 * Der Report wird als Markdown-Datei gespeichert und enthält
 * Handlungsempfehlungen basierend auf den gefundenen Problemen.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const REPORT_FILE = path.join(__dirname, '..', 'UNIFIED_STATUS_REPORT.md');
const websiteUrl = 'https://burnitoken.website';
const startTime = new Date();

// Hilfsfunktionen
function safeExecSync(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (err) {
    return `Fehler: ${err.message}`;
  }
}

function safeRequire(modulePath) {
  try {
    const fullPath = path.resolve(__dirname, modulePath);
    if (fs.existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
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
      return require(fullPath);
    }
    return null;
  } catch (err) {
    console.error(`Fehler beim Laden von ${modulePath}: ${err.message}`);
    return null;
  }
}

// HTML-Dateien und Indexierungsprobleme analysieren
function analyzeIndexingStatus() {
  console.log('🔍 Analysiere GSC-Indexierungsstatus...');

  const htmlFiles = [];
  const noindexFiles = [];

  function scanDir(dir) {
    try {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const fullPath = path.join(dir, file);

        if (
          fs.statSync(fullPath).isDirectory();
          !file.startsWith('.');
          file !== 'node_modules';
          file !== 'vendor'
        ) {
          scanDir(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.htm')) {
          htmlFiles.push(fullPath);

          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.match(/<meta[^>]*noindex/i)) {
              noindexFiles.push({
                file: fullPath,
                relativePath: path.relative(__dirname, fullPath),
                match: content.match(/<meta[^>]*noindex[^>]*>/i)[0],
              });
            }
          } catch (err) {
            console.error(`Fehler beim Lesen von ${fullPath}: ${err.message}`);
          }
        }
      });
    } catch (err) {
      console.error(`Fehler beim Scannen von ${dir}: ${err.message}`);
    }
  }

  try {
    scanDir(path.join(__dirname, '..'));

    return {
      totalHtmlFiles: htmlFiles.length,
      noindexFiles,
    };
  } catch (err) {
    console.error('Fehler bei der Indexierungsanalyse:', err);
    return {
      totalHtmlFiles: 0,
      noindexFiles: [],
    };
  }
}

// Extension-Status prüfen
function checkExtensionStatus() {
  console.log('🧩 Prüfe Extension-Status...');

  // Extension-Status direkt prüfen
  const extensionValidator = path.join(__dirname, '..', 'extension-function-validator.js');
  let extensionCheckResult = 'Nicht verfügbar';

  if (fs.existsSync(extensionValidator)) {
    try {
      // Versuchen, das Ergebnis zu simulieren, ohne tatsächlich auszuführen
      const extensionFolders = [
        '.vscode/extensions',
        path.join(process.env.USERPROFILE || process.env.HOME, '.vscode/extensions'),
      ];

      // Prüfen auf typische VS Code Extensions
      const expectedExtensions = [
        'ms-vscode.js-debug',
        'dbaeumer.vscode-eslint',
        'esbenp.prettier-vscode',
        'ritwickdey.LiveServer',
      ];

      let foundExtensions = 0;
      extensionFolders.forEach((folder) => {
        if (fs.existsSync(folder)) {
          const extensions = fs.readdirSync(folder);
          expectedExtensions.forEach((ext) => {
            if (extensions.some((e) => e.toLowerCase().includes(ext.toLowerCase()))) {
              foundExtensions++;
            }
          });
        }
      });

      extensionCheckResult = `${foundExtensions} von ${expectedExtensions.length} erwarteten Extensions gefunden`;
    } catch (err) {
      extensionCheckResult = `Fehler: ${err.message}`;
    }
  }

  return {
    extensionValidatorExists: fs.existsSync(extensionValidator),
    extensionCheckResult,
  };
}

// AI-Services prüfen
function checkAIServices() {
  console.log('🤖 Prüfe AI-Services...');

  // Prüfen, ob AI-Service-Scripts existieren
  const aiServiceFiles = [
    'tools/ai-status.js',
    'tools/ai-services-manager.js',
    'tools/start-ai-bridge.js',
    'tools/session-saver.js',
  ];

  const existingServices = aiServiceFiles.filter((file) => {
    return fs.existsSync(path.join(__dirname, '..', file));
  });

  // Versuchen, Prozess-Status zu simulieren
  const runningProcesses = [];
  try {
    const psOutput = safeExecSync(
      'powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,CommandLine | ConvertTo-Json"',
    );

    try {
      const processes = JSON.parse(psOutput);

      if (Array.isArray(processes)) {
        processes.forEach((proc) => {
          if (proc.CommandLine) {
            aiServiceFiles.forEach((service) => {
              if (proc.CommandLine.includes(service)) {
                runningProcesses.push({
                  pid: proc.Id,
                  service: service,
                });
              }
            });
          }
        });
      } else if (processes && processes.CommandLine) {
        // Einzelner Prozess
        aiServiceFiles.forEach((service) => {
          if (processes.CommandLine.includes(service)) {
            runningProcesses.push({
              pid: processes.Id,
              service: service,
            });
          }
        });
      }
    } catch (jsonErr) {
      console.error('Fehler beim Parsen der Prozessinformationen:', jsonErr);
    }
  } catch (err) {
    console.error('Fehler beim Abrufen laufender Prozesse:', err);
  }

  return {
    totalAIServices: aiServiceFiles.length,
    existingServices: existingServices.length,
    existingServicesList: existingServices,
    runningServices: runningProcesses.length,
    runningServicesList: runningProcesses,
  };
}

// Live-Website-Status prüfen
function checkLiveWebsiteStatus() {
  console.log('🌐 Prüfe Live-Website-Status...');

  // HTTP-Request simulieren
  let isOnline = false;
  let statusMessage = 'Offline';

  try {
    const curlOutput = safeExecSync(`curl -s -o /dev/null -w "%{http_code}" ${websiteUrl}`);
    const statusCode = parseInt(curlOutput.trim());

    if (statusCode >= 200 && statusCode < 300) {
      isOnline = true;
      statusMessage = `Online (HTTP ${statusCode})`;
    } else {
      statusMessage = `Fehler (HTTP ${statusCode})`;
    }
  } catch (err) {
    statusMessage = `Fehler: ${err.message}`;
  }

  return {
    isOnline,
    statusMessage,
  };
}

// Report generieren
function generateReport() {
  console.log('📝 Erstelle umfassenden Status-Report...');

  // Daten sammeln
  const indexingStatus = analyzeIndexingStatus();
  const extensionStatus = checkExtensionStatus();
  const aiServicesStatus = checkAIServices();
  const websiteStatus = checkLiveWebsiteStatus();

  // Timestamp
  const timestamp = startTime.toISOString().replace('T', ' ').substring(0, 19);

  // Report erstellen
  let report = `# Unified Status Report: burnitoken.website\n\n`;
  report += `**Erstellungsdatum:** ${timestamp}  \n`;
  report += `**Website:** ${websiteUrl}  \n\n`;

  // Gesamtstatus
  let overallStatus = '✅ Optimal';
  let statusEmoji = '🟢';

  if (indexingStatus.noindexFiles.length > 0 || !websiteStatus.isOnline) {
    overallStatus = '⚠️ Kritische Probleme';
    statusEmoji = '🔴';
  } else if (aiServicesStatus.runningServices < aiServicesStatus.existingServices) {
    overallStatus = '⚠️ Warnungen';
    statusEmoji = '🟡';
  }

  report += `## ${statusEmoji} Gesamtstatus: ${overallStatus}\n\n`;

  // Website Status
  report += `## 🌐 Website-Status\n\n`;
  report += `* **Status:** ${websiteStatus.isOnline ? '✅ Online' : '❌ Offline'}\n`;
  report += `* **Details:** ${websiteStatus.statusMessage}\n\n`;

  // Indexierungsstatus
  report += `## 🔍 GSC-Indexierungsstatus\n\n`;
  report += `* **HTML-Dateien gesamt:** ${indexingStatus.totalHtmlFiles}\n`;
  report += `* **Dateien mit noindex-Tags:** ${indexingStatus.noindexFiles.length}\n\n`;

  if (indexingStatus.noindexFiles.length > 0) {
    report += `### ⚠️ Nicht indexierte Dateien\n\n`;
    report += `| Datei | noindex-Tag |\n`;
    report += `|-------|-------------|\n`;

    indexingStatus.noindexFiles.forEach((file) => {
      report += `| ${file.relativePath} | \`${file.match}\` |\n`;
    });

    report += `\n`;
  }

  // Extension Status
  report += `## 🧩 Extension-Status\n\n`;
  report += `* **Extension-Validator:** ${extensionStatus.extensionValidatorExists ? '✅ Vorhanden' : '❌ Nicht gefunden'}\n`;
  report += `* **Status:** ${extensionStatus.extensionCheckResult}\n\n`;

  // AI-Services Status
  report += `## 🤖 AI-Services\n\n`;
  report += `* **Services konfiguriert:** ${aiServicesStatus.existingServices} von ${aiServicesStatus.totalAIServices}\n`;
  report += `* **Services aktiv:** ${aiServicesStatus.runningServices} von ${aiServicesStatus.existingServices}\n\n`;

  if (aiServicesStatus.existingServicesList.length > 0) {
    report += `### Konfigurierte Services\n\n`;
    aiServicesStatus.existingServicesList.forEach((service) => {
      const isRunning = aiServicesStatus.runningServicesList.some((p) => p.service === service);
      report += `* ${isRunning ? '✅' : '❌'} ${service}\n`;
    });
    report += `\n`;
  }

  // Handlungsempfehlungen
  report += `## 🛠️ Handlungsempfehlungen\n\n`;

  if (indexingStatus.noindexFiles.length > 0) {
    report += `1. **KRITISCH:** Entfernen Sie die noindex-Tags aus ${indexingStatus.noindexFiles.length} Dateien mit der Task "🚨 Fix GSC Indexierung (noindex entfernen)"\n`;
  }

  if (!websiteStatus.isOnline) {
    report += `${indexingStatus.noindexFiles.length > 0 ? '2' : '1'}. **KRITISCH:** Überprüfen Sie die Website-Verfügbarkeit. Die Website scheint offline zu sein.\n`;
  }

  if (aiServicesStatus.runningServices < aiServicesStatus.existingServices) {
    const nextNum =
      (indexingStatus.noindexFiles.length > 0 ? 2 : 1) + (!websiteStatus.isOnline ? 1 : 0);
    report += `${nextNum}. **WICHTIG:** Starten Sie alle AI-Services mit der Task "🔄 Restart All AI Services"\n`;
  }

  // Keine kritischen Probleme
  if (
    indexingStatus.noindexFiles.length === 0;
    websiteStatus.isOnline;
    aiServicesStatus.runningServices === aiServicesStatus.existingServices
  ) {
    report += `* ✅ Keine kritischen Probleme gefunden. Das System läuft optimal.\n`;
    report += `* 💡 Führen Sie regelmäßig die Task "🔍 Unified Status Check" aus, um den Status zu überwachen.\n`;
  }

  report += `\n`;

  // VS Code Tasks
  report += `## 🔧 Verfügbare Tasks\n\n`;
  report += `| Task | Beschreibung |\n`;
  report += `|------|-------------|\n`;
  report += `| 🚨 Fix GSC Indexierung | Entfernt alle noindex-Tags aus HTML-Dateien |\n`;
  report += `| 🔍 GSC Indexierungsmonitor | Zeigt detaillierte Informationen zur Indexierung |\n`;
  report += `| 🔍 GSC Indexierungs-Watcher | Überwacht kontinuierlich die Indexierungseinstellungen |\n`;
  report += `| 🔄 Restart All AI Services | Startet alle AI-Services neu |\n`;
  report += `| 🔍 Show AI Status | Zeigt den Status aller AI-Services |\n`;
  report += `| 🔧 Extension Health Check | Prüft den Zustand aller VS Code Extensions |\n`;
  report += `\n`;

  // Zusammenfassung
  const duration = (new Date() - startTime) / 1000;
  report += `---\n\n`;
  report += `Dieser Bericht wurde automatisch erstellt am ${timestamp} (Dauer: ${duration.toFixed(2)}s)\n`;

  return report;
}

// Report speichern
function saveReport(content) {
  try {
    fs.writeFileSync(REPORT_FILE, content, 'utf8');
    console.log(`✅ Unified Status Report gespeichert: ${REPORT_FILE}`);
  } catch (err) {
    console.error('Fehler beim Speichern des Reports:', err);
  }
}

// Hauptfunktion
async function main() {
  console.log('🚀 Unified Status Report Generator startet...');

  const reportContent = generateReport();
  saveReport(reportContent);

  const duration = (new Date() - startTime) / 1000;
  console.log(`✅ Fertig! Dauer: ${duration.toFixed(2)}s`);
}

// Ausführen
main().catch((err) => {
  console.error('Fehler im Hauptprogramm:', err);
});
