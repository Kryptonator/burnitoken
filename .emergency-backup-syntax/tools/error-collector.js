/**
 * Error Collector - Zentrales Tool zur Sammlung und Auswertung aller Fehlermeldungen
 *
 * Sammelt, aggregiert und analysiert Fehler aus:
 * - Audit-Tools
 * - Test-Ergebnissen
 * - Extension-Status
 * - GSC-Integrationen
 * - Recovery-Logs
 * - Dependency-Checks
 *
 * Erstellt einen konsolidierten Bericht mit priorisierten Handlungsempfehlungen.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  reportFile: path.join(__dirname, '..', 'ERROR_REPORT.md'),
  logDir: path.join(__dirname, '..', '.logs'),
  maxErrorAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage in Millisekunden
  errorSources: [
    {
      name: 'Extension-Status',
      logPattern: ['extension-status*.log', 'extension-function-validator*.log'],
      priority: 'high',
    },
    {
      name: 'GSC-Integration',
      logPattern: ['gsc-*.log', 'indexing-*.log'],
      priority: 'high',
    },
    {
      name: 'Recovery-System',
      logPattern: ['auto-recovery*.log', 'auto-screenshot*.log'],
      priority: 'high',
    },
    {
      name: 'Dependency-Status',
      logPattern: ['dependabot-*.log', 'dependency-security*.log'],
      priority: 'critical',
    },
    {
      name: 'Worker-System',
      logPattern: ['worker-*.log', 'parallel-task*.log'],
      priority: 'medium',
    },
    {
      name: 'Allgemeine Status-Reports',
      logPattern: ['unified-status*.log'],
      priority: 'medium',
    },
    {
      name: 'Lighthouse-Audits',
      logPattern: ['lighthouse-*.log'],
      priority: 'low',
    },
  ],
};

// Stellt sicher, dass die erforderlichen Verzeichnisse existieren
if (!fs.existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
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
  fs.mkdirSync(CONFIG.logDir, { recursive: true });
}

/**
 * Formatierter Logger
 */
function log(message, type = 'INFO') {
  const colors = {
    INFO: '\x1b[36m', // Cyan
    SUCCESS: '\x1b[32m', // Grün
    WARNING: '\x1b[33m', // Gelb
    ERROR: '\x1b[31m', // Rot
    CRITICAL: '\x1b[41m\x1b[37m', // Weiß auf Rot
    DEBUG: '\x1b[90m', // Grau
  };
  const reset = '\x1b[0m';
  const color = colors[type] || colors.INFO;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp} ${type}]${reset} ${message}`);
}

/**
 * Sammelt Fehlermeldungen aus den Log-Dateien
 */
function collectErrorsFromLogs() {
  const now = new Date().getTime();
  const errors = [];
  const sources = CONFIG.errorSources;

  sources.forEach((source) => {
    const patterns = Array.isArray(source.logPattern) ? source.logPattern : [source.logPattern];

    patterns.forEach((pattern) => {
      try {
        // PowerShell verwenden, um Dateien mit Wildcards zu finden
        const command = `powershell -Command "Get-ChildItem -Path '${CONFIG.logDir}' -Filter '${pattern}' -Recurse | Select-Object FullName"`;
        const result = execSync(command, { encoding: 'utf-8' });

        const fileLines = result.split('\n');
        const logFiles = fileLines
          .filter((line) => line.trim().length > 0 && line.includes('.log'))
          .map((line) => line.trim())
          .map((line) => {
            // FullName aus der PowerShell-Ausgabe extrahieren
            const match = line.match(/\s*(.+\.log)\s*/);
            return match ? match[1] : line;
          });

        logFiles.forEach((logFile) => {
          try {
            // Prüfen, ob die Datei existiert
            if (fs.existsSync(logFile)) {
              const fileStats = fs.statSync(logFile);
              // Nur Dateien, die nicht zu alt sind
              if (now - fileStats.mtimeMs < CONFIG.maxErrorAge) {
                const content = fs.readFileSync(logFile, 'utf-8');
                // Fehlerrelevante Zeilen extrahieren
                const lines = content.split('\n');
                const errorLines = lines.filter((line) => {
                  const lowerLine = line.toLowerCase();
                  return (
                    lowerLine.includes('error') ||
                    lowerLine.includes('fehler') ||
                    lowerLine.includes('critical') ||
                    lowerLine.includes('kritisch') ||
                    lowerLine.includes('exception') ||
                    lowerLine.includes('❌') ||
                    lowerLine.includes('⚠️')
                  );
                });

                if (errorLines.length > 0) {
                  errors.push({
                    source: source.name,
                    file: path.basename(logFile),
                    priority: source.priority,
                    timestamp: fileStats.mtime,
                    errors: errorLines.map((line) => {
                      // Zeitstempel extrahieren, wenn vorhanden
                      const timestampMatch = line.match(/\[([0-9:]+)\]/);
                      return {
                        message: line.trim(),
                        timestamp: timestampMatch ? timestampMatch[1] : null,
                      };
                    }),
                  });
                }
              }
            }
          } catch (error) {
            log(`Fehler beim Lesen der Logdatei ${logFile}: ${error.message}`, 'ERROR');
          }
        });
      } catch (error) {
        log(`Fehler beim Sammeln von Logs für ${source.name}: ${error.message}`, 'ERROR');
      }
    });
  });

  return errors;
}

/**
 * Sammelt Fehler aus den letzten VS Code Tasks
 */
function collectErrorsFromTaskOutput() {
  try {
    const taskOutputDir = path.join(__dirname, '..', '.vscode', 'tasks');
    if (!fs.existsSync(taskOutputDir)) {
      return [];
    }

    const now = new Date().getTime();
    const errors = [];

    // PowerShell verwenden, um Dateien mit Wildcards zu finden
    const command = `powershell -Command "Get-ChildItem -Path '${taskOutputDir}' -Filter '*output*.log' -Recurse | Select-Object FullName"`;
    const result = execSync(command, { encoding: 'utf-8' });

    const fileLines = result.split('\n');
    const logFiles = fileLines
      .filter((line) => line.trim().length > 0 && line.includes('.log'))
      .map((line) => line.trim())
      .map((line) => {
        // FullName aus der PowerShell-Ausgabe extrahieren
        const match = line.match(/\s*(.+\.log)\s*/);
        return match ? match[1] : line;
      });

    logFiles.forEach((logFile) => {
      try {
        if (fs.existsSync(logFile)) {
          const fileStats = fs.statSync(logFile);
          // Nur Dateien, die nicht zu alt sind
          if (now - fileStats.mtimeMs < CONFIG.maxErrorAge) {
            const content = fs.readFileSync(logFile, 'utf-8');
            // Task-Namen aus dem Dateinamen extrahieren
            const taskNameMatch = path.basename(logFile).match(/task-(.+)-output/);
            const taskName = taskNameMatch
              ? taskNameMatch[1].replace(/-/g, ' ')
              : 'Unbekannte Task';

            // Fehlerrelevante Zeilen extrahieren
            const lines = content.split('\n');
            const errorLines = lines.filter((line) => {
              const lowerLine = line.toLowerCase();
              return (
                lowerLine.includes('error') ||
                lowerLine.includes('fehler') ||
                lowerLine.includes('critical') ||
                lowerLine.includes('kritisch') ||
                lowerLine.includes('exception') ||
                lowerLine.includes('❌') ||
                lowerLine.includes('⚠️')
              );
            });

            if (errorLines.length > 0) {
              errors.push({
                source: 'VS Code Task',
                task: taskName,
                file: path.basename(logFile),
                priority: 'medium',
                timestamp: fileStats.mtime,
                errors: errorLines.map((line) => ({
                  message: line.trim(),
                  timestamp: null,
                })),
              });
            }
          }
        }
      } catch (error) {
        log(`Fehler beim Lesen der Task-Output-Datei ${logFile}: ${error.message}`, 'ERROR');
      }
    });

    return errors;
  } catch (error) {
    log(`Fehler beim Sammeln von Task-Outputs: ${error.message}`, 'ERROR');
    return [];
  }
}

/**
 * Sammelt Fehler aus JSON-Report-Dateien
 */
function collectErrorsFromJsonReports() {
  try {
    const reportFiles = [
      { path: path.join(__dirname, '..', 'lighthouse-report.json'), source: 'Lighthouse' },
      { path: path.join(__dirname, '..', 'dependabot-status.json'), source: 'Dependabot' },
      { path: path.join(__dirname, '..', 'extension-status.json'), source: 'Extensions' },
      { path: path.join(__dirname, '..', 'unified-status.json'), source: 'Unified Status' },
      { path: path.join(__dirname, '..', 'indexing-status.json'), source: 'GSC Indexierung' },
    ];

    const errors = [];

    reportFiles.forEach((reportFile) => {
      try {
        if (fs.existsSync(reportFile.path)) {
          const fileStats = fs.statSync(reportFile.path);
          const content = fs.readFileSync(reportFile.path, 'utf-8');
          const report = JSON.parse(content);

          // Fehler basierend auf der Berichtsstruktur extrahieren
          let extractedErrors = [];

          if (reportFile.source === 'Lighthouse' && report.audits) {
            // Lighthouse-spezifische Extraktion
            const failedAudits = Object.values(report.audits)
              .filter((audit) => audit.score < 0.9)
              .map((audit) => ({
                message: `[${audit.id}] ${audit.title}: ${audit.description}`,
                timestamp: null,
              }));

            if (failedAudits.length > 0) {
              extractedErrors = failedAudits;
            }
          } else if (reportFile.source === 'Dependabot') {
            // Dependabot-spezifische Extraktion
            if (report.vulnerabilities && report.vulnerabilities.length > 0) {
              extractedErrors = report.vulnerabilities.map((vuln) => ({
                message: `${vuln.severity} Sicherheitslücke in ${vuln.package}: ${vuln.description}`,
                timestamp: null,
              }));
            }
          } else if (report.errors || report.warnings || report.issues) {
            // Generische Extraktion
            const reportErrors = report.errors || report.issues || [];
            extractedErrors = reportErrors.map((err) => ({
              message: typeof err === 'string' ? err : err.message || JSON.stringify(err),
              timestamp: err.timestamp || null,
            }));
          }

          if (extractedErrors.length > 0) {
            errors.push({
              source: reportFile.source,
              file: path.basename(reportFile.path),
              priority: reportFile.source.includes('Dependabot') ? 'critical' : 'medium',
              timestamp: fileStats.mtime,
              errors: extractedErrors,
            });
          }
        }
      } catch (error) {
        log(`Fehler beim Parsen von ${reportFile.path}: ${error.message}`, 'WARNING');
      }
    });

    return errors;
  } catch (error) {
    log(`Fehler beim Sammeln von JSON-Reports: ${error.message}`, 'ERROR');
    return [];
  }
}

/**
 * Gibt eine priorisierte Fehlerliste zurück
 */
function prioritizeErrors(allErrors) {
  const priorityMap = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  // Nach Priorität sortieren, dann nach Zeitstempel (neueste zuerst)
  return allErrors.sort((a, b) => {
    const priorityA = priorityMap[a.priority] || 999;
    const priorityB = priorityMap[b.priority] || 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Bei gleicher Priorität nach Zeitstempel sortieren (neueste zuerst)
    const timeA = a.timestamp ? a.timestamp.getTime() : 0;
    const timeB = b.timestamp ? b.timestamp.getTime() : 0;
    return timeB - timeA;
  });
}

/**
 * Generiert Handlungsempfehlungen basierend auf den gefundenen Fehlern
 */
function generateRecommendations(errors) {
  const recommendations = [];

  // Zählen, wie viele Fehler pro Quelle und Priorität vorliegen
  const errorStats = {};
  errors.forEach((error) => {
    const key = error.source;
    if (!errorStats[key]) {
      errorStats[key] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
    }

    errorStats[key].total += error.errors.length;
    errorStats[key][error.priority] += error.errors.length;
  });

  // Kritische Sicherheitsprobleme haben höchste Priorität
  const securityIssues = errors.filter(
    (e) =>
      e.priority === 'critical' &&
      (e.source.includes('Dependabot') || e.source.includes('Security')),
  );

  if (securityIssues.length > 0) {
    recommendations.push({
      priority: 'critical',
      action: 'Führen Sie sofort den Task "🔒 Sicherheitsrelevante Updates installieren" aus',
      reason: `${securityIssues.reduce((total, e) => total + e.errors.length, 0)} kritische Sicherheitsprobleme gefunden`,
    });
  }

  // Extensions-Probleme
  const extensionIssues = errors.filter((e) => e.source.includes('Extension'));
  if (extensionIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      action: 'Führen Sie den Task "🚀 Complete Extension Optimization" aus',
      reason: `${extensionIssues.reduce((total, e) => total + e.errors.length, 0)} Probleme mit VS Code Extensions gefunden`,
    });
  }

  // GSC-Indexierungsprobleme
  const gscIssues = errors.filter(
    (e) => e.source.includes('GSC') || e.source.includes('Indexierung'),
  );
  if (gscIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      action: 'Führen Sie den Task "🚨 Fix GSC Indexierung (noindex entfernen)" aus',
      reason: `${gscIssues.reduce((total, e) => total + e.errors.length, 0)} Probleme mit der GSC-Indexierung gefunden`,
    });
  }

  // Recovery-System-Probleme
  const recoveryIssues = errors.filter((e) => e.source.includes('Recovery'));
  if (recoveryIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      action: 'Führen Sie den Task "🔄 Auto Recovery Manager starten" aus',
      reason: `${recoveryIssues.reduce((total, e) => total + e.errors.length, 0)} Probleme mit dem Recovery-System gefunden`,
    });
  }

  // Sortieren nach Priorität
  return recommendations.sort((a, b) => {
    const priorityMap = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return priorityMap[a.priority] - priorityMap[b.priority];
  });
}

/**
 * Generiert einen Markdown-Report
 */
function generateMarkdownReport(errors, recommendations) {
  const now = new Date();
  let markdown = `# 🚨 Fehler-Report für burnitoken.com\n\n`;
  markdown += `**Erstellt am:** ${now.toLocaleString('de-DE')}\n\n`;

  // Zusammenfassung
  const totalErrors = errors.reduce((total, e) => total + e.errors.length, 0);
  const criticalErrors = errors
    .filter((e) => e.priority === 'critical')
    .reduce((total, e) => total + e.errors.length, 0);
  const highErrors = errors
    .filter((e) => e.priority === 'high')
    .reduce((total, e) => total + e.errors.length, 0);

  markdown += `## 📊 Zusammenfassung\n\n`;
  markdown += `- **Gesamtzahl der Fehler:** ${totalErrors}\n`;
  markdown += `- **Kritische Fehler:** ${criticalErrors}\n`;
  markdown += `- **Hohe Priorität:** ${highErrors}\n`;
  markdown += `- **Quellen überprüft:** ${CONFIG.errorSources.length}\n\n`;

  // Handlungsempfehlungen
  if (recommendations.length > 0) {
    markdown += `## 🛠️ Handlungsempfehlungen\n\n`;
    recommendations.forEach((rec) => {
      const emoji = rec.priority === 'critical' ? '🔴' : rec.priority === 'high' ? '🟠' : '🟡';
      markdown += `### ${emoji} ${rec.action}\n`;
      markdown += `> ${rec.reason}\n\n`;
    });
  }

  // Detaillierte Fehlerauflistung nach Priorität
  const priorityCategories = ['critical', 'high', 'medium', 'low'];

  priorityCategories.forEach((priority) => {
    const priorityErrors = errors.filter((e) => e.priority === priority);
    if (priorityErrors.length > 0) {
      const emoji =
        priority === 'critical'
          ? '🔴'
          : priority === 'high'
            ? '🟠'
            : priority === 'medium'
              ? '🟡'
              : '🟢';
      const priorityTitle =
        priority === 'critical'
          ? 'Kritisch'
          : priority === 'high'
            ? 'Hohe Priorität'
            : priority === 'medium'
              ? 'Mittlere Priorität'
              : 'Niedrige Priorität';

      markdown += `## ${emoji} ${priorityTitle}\n\n`;

      priorityErrors.forEach((error) => {
        markdown += `### ${error.source}\n`;
        markdown += `- **Datei:** \`${error.file}\`\n`;
        markdown += `- **Zeitpunkt:** ${error.timestamp ? error.timestamp.toLocaleString('de-DE') : 'Unbekannt'}\n\n`;

        if (error.errors.length > 10) {
          markdown += `<details>\n<summary>Zeige ${error.errors.length} Fehler (aufklappen)</summary>\n\n`;
          markdown += '```\n';
          error.errors.forEach((err) => {
            markdown += `${err.message}\n`;
          });
          markdown += '```\n</details>\n\n';
        } else {
          markdown += '```\n';
          error.errors.forEach((err) => {
            markdown += `${err.message}\n`;
          });
          markdown += '```\n\n';
        }
      });
    }
  });

  return markdown;
}

/**
 * Hauptfunktion
 */
async function main() {
  log('Error-Collector gestartet', 'INFO');
  log('Sammle Fehler aus Logs...', 'INFO');

  // Fehler aus verschiedenen Quellen sammeln
  const logErrors = collectErrorsFromLogs();
  log(`${logErrors.length} Fehlerquellen in Logs gefunden`, 'INFO');

  const taskErrors = collectErrorsFromTaskOutput();
  log(`${taskErrors.length} Fehlerquellen in Task-Outputs gefunden`, 'INFO');

  const jsonErrors = collectErrorsFromJsonReports();
  log(`${jsonErrors.length} Fehlerquellen in JSON-Reports gefunden`, 'INFO');

  // Alle Fehler zusammenführen
  const allErrors = [...logErrors, ...taskErrors, ...jsonErrors];

  // Keine Fehler gefunden?
  if (allErrors.length === 0) {
    log('Keine Fehler gefunden!', 'SUCCESS');
    const noErrorReport = `# ✅ Keine Fehler gefunden\n\n**Erstellt am:** ${new Date().toLocaleString('de-DE')}\n\nAlle überprüften Systeme funktionieren ohne Fehler.`;
    fs.writeFileSync(CONFIG.reportFile, noErrorReport);
    log(`Leerer Report wurde gespeichert: ${CONFIG.reportFile}`, 'SUCCESS');
    return;
  }

  // Fehler priorisieren
  const prioritizedErrors = prioritizeErrors(allErrors);

  // Handlungsempfehlungen generieren
  const recommendations = generateRecommendations(prioritizedErrors);

  // Markdown-Report generieren
  const report = generateMarkdownReport(prioritizedErrors, recommendations);
  fs.writeFileSync(CONFIG.reportFile, report);

  // Ausgabe
  const totalErrors = prioritizedErrors.reduce((total, e) => total + e.errors.length, 0);
  log(`Bericht mit ${totalErrors} Fehlern wurde gespeichert: ${CONFIG.reportFile}`, 'SUCCESS');

  if (recommendations.length > 0) {
    log('Handlungsempfehlungen:', 'WARNING');
    recommendations.forEach((rec) => {
      const priority =
        rec.priority === 'critical'
          ? 'CRITICAL'
          : rec.priority === 'high'
            ? 'ERROR'
            : rec.priority === 'medium'
              ? 'WARNING'
              : 'INFO';
      log(`- ${rec.action}`, priority);
    });
  }
}

// Programmstart
main().catch((error) => {
  log(`Unerwarteter Fehler: ${error.message}`, 'ERROR');
  console.error(error);
});

] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
] // Auto-korrigierte schließende Klammer
} // Auto-korrigierte schließende Klammer
} // Auto-korrigierte schließende Klammer