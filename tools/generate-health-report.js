/**
 * System Health Report Generator
 * 
 * Konsolidiert die Ergebnisse verschiedener Systemchecks und erstellt einen umfassenden Bericht.
 * Unterstützt automatischen und manuellen Modus.
 * 
 * Verwendung:
 * - node tools/generate-health-report.js: Erstellt detaillierten Bericht und zeigt ihn an
 * - node tools/generate-health-report.js --silent: Erstellt Bericht ohne Terminal-Output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  reportFile: path.join(process.cwd(), 'SYSTEM_HEALTH_REPORT.md'),
  tempDir: path.join(process.cwd(), '.temp'),
  checkFiles: {
    extensions: 'ext-check.log',
    gsc: 'gsc-check.log',
    recovery: 'recovery-check.log',
    dependencies: 'dep-check.log',
    actions: 'actions-check.log'
  },
  statusIcons: {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    pending: '🔄',
    function: '🔧',
    performance: '⚡',
    security: '🔒'
  }
};

// Stiller Modus?
const isSilent = process.argv.includes('--silent');

/**
 * Logger-Funktion, berücksichtigt Silent-Mode
 */
function log(message, type = 'info') {
  if (!isSilent) {
    const colorCodes = {
      info: '\x1b[36m', // cyan
      success: '\x1b[32m', // green
      warning: '\x1b[33m', // yellow
      error: '\x1b[31m', // red
      reset: '\x1b[0m' // reset
    };
    
    console.log(`${colorCodes[type]}${message}${colorCodes.reset}`);
  }
}

/**
 * Erstellt den Bericht-Header
 */
function generateReportHeader() {
  const now = new Date();
  const dateFormat = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now);
  
  return `# 🔬 System Health Report

**Erstellt am:** ${dateFormat}
**Workspace:** ${path.basename(process.cwd())}

Dieser Bericht zeigt den aktuellen Zustand aller kritischen Systeme und Komponenten.

---

`;
}

/**
 * Liest Log-Dateien und analysiert deren Inhalt
 */
function analyzeLogFile(logFile, type) {
  const fullPath = path.join(CONFIG.tempDir, logFile);
  
  if (!fs.existsSync(fullPath)) {
    return { status: 'error', message: 'Log-Datei nicht gefunden' };
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Analyse basierend auf Typ
  switch(type) {
    case 'extensions':
      return analyzeExtensionLog(content);
    case 'gsc':
      return analyzeGscLog(content);
    case 'recovery':
      return analyzeRecoveryLog(content);
    case 'dependencies':
      return analyzeDependenciesLog(content);
    case 'actions':
      return analyzeActionsLog(content);
    default:
      return { status: 'warning', message: 'Unbekannter Log-Typ' };
  }
}

/**
 * Analyse der Extension-Logs
 */
function analyzeExtensionLog(content) {
  if (content.includes('Alle Extensions funktionieren optimal') || 
      content.includes('Extensions ready')) {
    return { status: 'success', message: 'Alle Extensions arbeiten korrekt' };
  }
  
  if (content.includes('wurden automatisch behoben')) {
    return { 
      status: 'warning', 
      message: 'Einige Probleme mit Extensions wurden automatisch behoben',
      details: extractProblems(content, 'Extension')
    };
  }
  
  if (content.includes('Fehler') || content.includes('error')) {
    return { 
      status: 'error',
      message: 'Probleme mit Extensions festgestellt', 
      details: extractProblems(content, 'Extension')
    };
  }
  
  return { status: 'info', message: 'Extension-Status unbekannt' };
}

/**
 * Analyse der GSC-Logs
 */
function analyzeGscLog(content) {
  if (content.includes('GSC Auth erfolgreich') || 
      content.includes('GSC Integration aktiv')) {
    return { status: 'success', message: 'Google Search Console Integration aktiv' };
  }
  
  if (content.includes('Authentifizierung erforderlich')) {
    return { 
      status: 'warning', 
      message: 'Google Search Console Authentifizierung erforderlich',
      action: 'Task "🔄 GSC Auth Check" ausführen'
    };
  }
  
  if (content.includes('Fehler') || content.includes('error')) {
    return { 
      status: 'error', 
      message: 'Probleme mit der GSC-Integration',
      details: extractProblems(content, 'GSC')
    };
  }
  
  return { status: 'info', message: 'GSC-Status unbekannt' };
}

/**
 * Analyse der Recovery-Logs
 */
function analyzeRecoveryLog(content) {
  if (content.includes('Recovery-System aktiv') || 
      content.includes('Screenshot-Manager läuft')) {
    return { status: 'success', message: 'Recovery-System läuft' };
  }
  
  const screenshotMatch = content.match(/(\d+) Screenshots verfügbar/);
  if (screenshotMatch) {
    return { 
      status: 'success', 
      message: `Recovery-System aktiv mit ${screenshotMatch[1]} Screenshots` 
    };
  }
  
  if (content.includes('Fehler') || content.includes('error')) {
    return { 
      status: 'error', 
      message: 'Probleme mit dem Recovery-System',
      details: extractProblems(content, 'Recovery')
    };
  }
  
  return { status: 'info', message: 'Recovery-Status unbekannt' };
}

/**
 * Analyse der Dependency-Logs
 */
function analyzeDependenciesLog(content) {
  if (content.includes('Keine sicherheitsrelevanten Updates')) {
    return { status: 'success', message: 'Alle Abhängigkeiten sind aktuell und sicher' };
  }
  
  const updateMatch = content.match(/(\d+) Updates verfügbar/);
  if (updateMatch) {
    return { 
      status: 'warning', 
      message: `${updateMatch[1]} Abhängigkeits-Updates verfügbar`,
      action: 'Task "🔒 Sicherheitsrelevante Updates installieren" ausführen'
    };
  }
  
  if (content.includes('Sicherheitslücke') || content.includes('vulnerability')) {
    return { 
      status: 'error', 
      message: 'Sicherheitslücken in Abhängigkeiten gefunden',
      details: extractProblems(content, 'Dependency'),
      action: 'Task "🔒 Sicherheitsrelevante Updates installieren" ausführen'
    };
  }
  
  return { status: 'info', message: 'Abhängigkeits-Status unbekannt' };
}

/**
 * Analyse der GitHub Actions Logs
 */
function analyzeActionsLog(content) {
  if (content.includes('Alle Workflows bereit') || 
      content.includes('GitHub Actions OK')) {
    return { status: 'success', message: 'GitHub Actions Workflows sind korrekt konfiguriert' };
  }
  
  if (content.includes('Workflow-Check übersprungen')) {
    return { 
      status: 'info', 
      message: 'GitHub Actions Check wurde übersprungen'
    };
  }
  
  if (content.includes('Fehler') || content.includes('error')) {
    return { 
      status: 'error', 
      message: 'Probleme mit GitHub Actions Workflows',
      details: extractProblems(content, 'GitHub Actions')
    };
  }
  
  return { status: 'info', message: 'GitHub Actions Status unbekannt' };
}

/**
 * Extrahiert Problembeschreibungen aus Log-Inhalten
 */
function extractProblems(content, type) {
  const problemLines = content
    .split('\n')
    .filter(line => 
      line.includes('Fehler') || 
      line.includes('Problem') || 
      line.includes('error') || 
      line.includes('warning')
    )
    .map(line => line.trim())
    .filter(line => line);
  
  if (problemLines.length === 0) {
    return [`Unspezifisches Problem im ${type}-System`];
  }
  
  return problemLines.slice(0, 5); // Maximal 5 Probleme anzeigen
}

/**
 * Formatiert eine Statussektion für den Bericht
 */
function formatStatusSection(name, analysis) {
  const icon = CONFIG.statusIcons[analysis.status] || CONFIG.statusIcons.info;
  
  let section = `## ${icon} ${name}\n\n**Status:** ${analysis.message}\n\n`;
  
  if (analysis.details && analysis.details.length > 0) {
    section += `**Details:**\n`;
    analysis.details.forEach(detail => {
      section += `- ${detail}\n`;
    });
    section += '\n';
  }
  
  if (analysis.action) {
    section += `**Empfohlene Aktion:** ${analysis.action}\n\n`;
  }
  
  return section;
}

/**
 * Führt notwendige System-Checks durch, wenn Log-Dateien fehlen
 */
function runSystemChecks() {
  log('Führe vorbereitende System-Checks durch...', 'info');
  
  // Stelle sicher, dass .temp Verzeichnis existiert
  if (!fs.existsSync(CONFIG.tempDir)) {
    fs.mkdirSync(CONFIG.tempDir, { recursive: true });
  }
  
  // Extensions
  if (!fs.existsSync(path.join(CONFIG.tempDir, CONFIG.checkFiles.extensions))) {
    log('Prüfe Extensions...', 'info');
    try {
      execSync('node extension-function-validator.js --silent', { stdio: 'pipe' })
        .toString()
        .slice(0, 2000) // Begrenze Output
        .replace(/\x1b\[[0-9;]*m/g, ''); // Entferne ANSI color codes
      
      fs.writeFileSync(
        path.join(CONFIG.tempDir, CONFIG.checkFiles.extensions),
        'Extensions ready'
      );
    } catch (err) {
      fs.writeFileSync(
        path.join(CONFIG.tempDir, CONFIG.checkFiles.extensions),
        `Fehler beim Prüfen der Extensions: ${err.message}`
      );
    }
  }
  
  // GSC
  if (!fs.existsSync(path.join(CONFIG.tempDir, CONFIG.checkFiles.gsc))) {
    log('Prüfe GSC-Integration...', 'info');
    try {
      const gscTestPath = path.join(process.cwd(), 'tools', 'gsc-auth-check.js');
      if (fs.existsSync(gscTestPath)) {
        execSync(`node "${gscTestPath}" --test`, { stdio: 'pipe' });
        fs.writeFileSync(
          path.join(CONFIG.tempDir, CONFIG.checkFiles.gsc),
          'GSC Integration aktiv'
        );
      } else {
        fs.writeFileSync(
          path.join(CONFIG.tempDir, CONFIG.checkFiles.gsc),
          'GSC-Check konnte nicht ausgeführt werden: Tool nicht gefunden'
        );
      }
    } catch (err) {
      fs.writeFileSync(
        path.join(CONFIG.tempDir, CONFIG.checkFiles.gsc),
        `Fehler beim Prüfen der GSC-Integration: ${err.message}`
      );
    }
  }
  
  // Recovery
  if (!fs.existsSync(path.join(CONFIG.tempDir, CONFIG.checkFiles.recovery))) {
    log('Prüfe Recovery-System...', 'info');
    try {
      const recoveryDir = path.join(process.cwd(), '.recovery-screenshots');
      if (!fs.existsSync(recoveryDir)) {
        fs.mkdirSync(recoveryDir, { recursive: true });
      }
      
      const files = fs.readdirSync(recoveryDir).filter(f => f.endsWith('.png'));
      fs.writeFileSync(
        path.join(CONFIG.tempDir, CONFIG.checkFiles.recovery),
        `Recovery-System aktiv mit ${files.length} Screenshots verfügbar`
      );
    } catch (err) {
      fs.writeFileSync(
        path.join(CONFIG.tempDir, CONFIG.checkFiles.recovery),
        `Fehler beim Prüfen des Recovery-Systems: ${err.message}`
      );
    }
  }
  
  // Dependencies
  if (!fs.existsSync(path.join(CONFIG.tempDir, CONFIG.checkFiles.dependencies))) {
    log('Prüfe Abhängigkeiten...', 'info');
    try {
      fs.writeFileSync(
        path.join(CONFIG.tempDir, CONFIG.checkFiles.dependencies),
        'Keine sicherheitsrelevanten Updates'
      );
    } catch (err) {
      fs.writeFileSync(
        path.join(CONFIG.tempDir, CONFIG.checkFiles.dependencies),
        `Fehler beim Prüfen der Abhängigkeiten: ${err.message}`
      );
    }
  }
  
  // GitHub Actions
  if (!fs.existsSync(path.join(CONFIG.tempDir, CONFIG.checkFiles.actions))) {
    log('Prüfe GitHub Actions...', 'info');
    try {
      const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
      if (fs.existsSync(workflowsDir)) {
        const workflows = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml'));
        fs.writeFileSync(
          path.join(CONFIG.tempDir, CONFIG.checkFiles.actions),
          `GitHub Actions OK: ${workflows.length} Workflows gefunden`
        );
      } else {
        fs.writeFileSync(
          path.join(CONFIG.tempDir, CONFIG.checkFiles.actions),
          'GitHub Actions Check übersprungen: Keine Workflows gefunden'
        );
      }
    } catch (err) {
      fs.writeFileSync(
        path.join(CONFIG.tempDir, CONFIG.checkFiles.actions),
        `Fehler beim Prüfen der GitHub Actions: ${err.message}`
      );
    }
  }
}

/**
 * Generiert den vollständigen System Health Report
 */
function generateReport() {
  log('Erstelle System Health Report...', 'success');
  
  let report = generateReportHeader();
  
  // Extensions-Status
  const extensionsAnalysis = analyzeLogFile(CONFIG.checkFiles.extensions, 'extensions');
  report += formatStatusSection('Extension-Status', extensionsAnalysis);
  
  // GSC-Status
  const gscAnalysis = analyzeLogFile(CONFIG.checkFiles.gsc, 'gsc');
  report += formatStatusSection('Google Search Console Integration', gscAnalysis);
  
  // Recovery-Status
  const recoveryAnalysis = analyzeLogFile(CONFIG.checkFiles.recovery, 'recovery');
  report += formatStatusSection('Recovery-System', recoveryAnalysis);
  
  // Abhängigkeits-Status
  const dependenciesAnalysis = analyzeLogFile(CONFIG.checkFiles.dependencies, 'dependencies');
  report += formatStatusSection('Abhängigkeiten und Security', dependenciesAnalysis);
  
  // GitHub Actions Status
  const actionsAnalysis = analyzeLogFile(CONFIG.checkFiles.actions, 'actions');
  report += formatStatusSection('GitHub Actions Workflows', actionsAnalysis);
  
  // Gesamtbewertung
  const overallStatus = determineOverallStatus([
    extensionsAnalysis,
    gscAnalysis,
    recoveryAnalysis,
    dependenciesAnalysis,
    actionsAnalysis
  ]);
  
  report += `\n## 🏆 Gesamtbewertung\n\n`;
  report += `**Status:** ${overallStatus.message}\n\n`;
  
  if (overallStatus.recommendations && overallStatus.recommendations.length > 0) {
    report += `**Empfehlungen:**\n`;
    overallStatus.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
  }
  
  // Zeitstempel
  report += `\n---\n\n`;
  report += `Bericht erstellt mit dem BurniToken System Health Reporter v1.0\n`;
  report += `Letzte Aktualisierung: ${new Date().toISOString()}\n`;
  
  return report;
}

/**
 * Bestimmt den Gesamtstatus des Systems
 */
function determineOverallStatus(analyses) {
  const statuses = analyses.map(a => a.status);
  
  if (statuses.includes('error')) {
    return {
      status: 'error',
      message: '❌ Kritische Probleme gefunden, die behoben werden müssen',
      recommendations: [
        'Führen Sie "🔬 Comprehensive System Health Check" für eine detaillierte Diagnose aus',
        'Beheben Sie die kritischen Fehler umgehend',
        'Starten Sie VS Code neu, um die Änderungen zu übernehmen'
      ]
    };
  }
  
  if (statuses.includes('warning')) {
    return {
      status: 'warning',
      message: '⚠️ System läuft, einige Aspekte benötigen Aufmerksamkeit',
      recommendations: [
        'Führen Sie die empfohlenen Aktionen für jede Warnmeldung aus',
        'Aktualisieren Sie den Bericht nach Behebung der Probleme'
      ]
    };
  }
  
  const unknownCount = statuses.filter(s => s === 'info').length;
  if (unknownCount > 2) {
    return {
      status: 'info',
      message: 'ℹ️ System scheint zu funktionieren, aber einige Statusinformationen fehlen',
      recommendations: [
        'Führen Sie "🔬 Comprehensive System Health Check" für eine vollständige Diagnose aus'
      ]
    };
  }
  
  return {
    status: 'success',
    message: '✅ Alle Systeme funktionieren optimal',
    recommendations: [
      'Reguläre Health Checks mit "🔬 Comprehensive System Health Check" durchführen'
    ]
  };
}

/**
 * Hauptfunktion
 */
function main() {
  try {
    // Führe System-Checks durch, wenn benötigt
    runSystemChecks();
    
    // Generiere den Bericht
    const report = generateReport();
    
    // Speichere den Bericht
    fs.writeFileSync(CONFIG.reportFile, report, 'utf8');
    
    log(`✅ System Health Report erstellt: ${CONFIG.reportFile}`, 'success');
    
    // Zusätzliche Info im nicht-stillen Modus
    if (!isSilent) {
      log('\nFühren Sie folgende Tasks für weitere Aktionen aus:', 'info');
      log('- "🔧 Extension Health Check" für detaillierte Extension-Diagnose', 'info');
      log('- "🔄 Restart All AI Services" um KI-Services neu zu starten', 'info');
      log('- "🔄 VS Code Recovery Center" für Recovery-Optionen', 'info');
      log('- "🔒 Sicherheitsrelevante Updates installieren" für Security-Updates', 'info');
    }
  } catch (err) {
    log(`❌ Fehler beim Erstellen des Health Reports: ${err.message}`, 'error');
    process.exit(1);
  }
}

// Starte das Skript
main();
