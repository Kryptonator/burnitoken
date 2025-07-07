/**
 * COMPREHENSIVE-MONITOR-DASHBOARD - Zentrales Monitoring-Dashboard
 * 
 * Überwacht alle Extensions, KI-Services und GSC-Integrationen
 * und führt nach Fixes automatische Commits durch.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { autoCommitAndPush } = require('./auto-commit-push');

// Konfigurations-Objekt für alle zu überwachenden Komponenten
const CONFIG = {
  extensions: [
    { name: 'Session-Saver', statusChecker: './tools/extension-function-validator.js', params: ['--extension=session-saver'] },
    { name: 'AI Conversation Bridge', statusChecker: './tools/extension-function-validator.js', params: ['--extension=ai-conversation-bridge'] },
    { name: 'Extension Status Dashboard', statusChecker: './tools/extension-status-dashboard.js', params: ['--check'] },
  ],
  aiServices: [
    { name: 'AI Status Checker', statusChecker: './tools/ai-status.js', params: [] },
    { name: 'AI Services Manager', statusChecker: './tools/ai-services-manager.js', params: ['--check'] },
  ],
  gscTools: [
    { name: 'GSC Status Check', statusChecker: './tools/gsc-status-check.js', params: [] },
    { name: 'GSC Auth Check', statusChecker: './tools/gsc-auth-check.js', params: [] },
    { name: 'GSC Crawl Stats', statusChecker: './tools/gsc-crawl-stats.js', params: ['--test'] },
    { name: 'GSC Integration Monitor', statusChecker: './tools/gsc-integration-monitor.js', params: ['--quick-check'] },
    { name: 'GSC Sitemap Monitor', statusChecker: './tools/fix-sitemap-gsc-issue.js', params: ['--check'] },
  ],
};

// Farben für die Konsolenausgabe
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

/**
 * Führt einen Status-Check für eine bestimmte Komponente durch
 * @param {Object} component - Die Komponente mit name und statusChecker
 * @returns {boolean} - Status (true = OK, false = Fehler)
 */
function checkComponentStatus(component) {
  try {
    console.log(`${COLORS.cyan}🔍 Prüfe Status von ${component.name}...${COLORS.reset}`);
    
    const command = `node ${component.statusChecker} ${(component.params || []).join(' ')}`;
    const result = execSync(command, { stdio: 'pipe' }).toString().trim();
    
    const isSuccess = !result.includes('FEHLER') && !result.includes('ERROR') && !result.toLowerCase().includes('failed');
    
    if (isSuccess) {
      console.log(`${COLORS.green}✅ ${component.name}: OK${COLORS.reset}`);
      return true;
    } else {
      console.log(`${COLORS.red}❌ ${component.name}: FEHLER - ${result}${COLORS.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${COLORS.red}❌ ${component.name}: FEHLER - ${error.message}${COLORS.reset}`);
    return false;
  }
}

/**
 * Versucht eine fehlerhafte Komponente zu reparieren
 * @param {Object} component - Die Komponente mit name und statusChecker
 * @returns {boolean} - Reparaturstatus (true = repariert, false = weiterhin fehlerhaft)
 */
function tryFixComponent(component) {
  try {
    console.log(`${COLORS.yellow}🔧 Versuche ${component.name} zu reparieren...${COLORS.reset}`);
    
    // Bestimme den passenden Fixer basierend auf der Komponente
    let fixCommand = '';
    
    if (component.name.includes('GSC')) {
      fixCommand = 'node ./tools/gsc-tools-fixer-v2.js';
      
      // Spezialfall für Sitemap-Probleme
      if (component.name.includes('Sitemap')) {
        fixCommand = 'node ./tools/fix-sitemap-gsc-issue.js --fix';
      }
    } else if (component.name.includes('AI')) {
      fixCommand = 'node ./tools/ai-services-manager.js --fix';
    } else {
      // Extension-Fixes
      fixCommand = 'node ./tools/extension-auto-restart.js';
    }
    
    // Fix ausführen
    console.log(`${COLORS.cyan}🛠️ Führe aus: ${fixCommand}${COLORS.reset}`);
    execSync(fixCommand, { stdio: 'inherit' });
    
    // Überprüfen, ob der Fix erfolgreich war
    return checkComponentStatus(component);
    
  } catch (error) {
    console.log(`${COLORS.red}❌ Reparatur von ${component.name} fehlgeschlagen: ${error.message}${COLORS.reset}`);
    return false;
  }
}

/**
 * Durchläuft alle Komponenten und protokolliert ihren Status
 */
function runFullDashboard() {
  console.log(`${COLORS.bright}${COLORS.blue}=== 🚀 COMPREHENSIVE MONITOR DASHBOARD ====${COLORS.reset}`);
  console.log(`${COLORS.blue}Gestartet: ${new Date().toLocaleString('de-DE')}${COLORS.reset}\n`);
  
  let results = {
    extensions: { total: 0, success: 0, fixed: 0, failed: 0 },
    aiServices: { total: 0, success: 0, fixed: 0, failed: 0 },
    gscTools: { total: 0, success: 0, fixed: 0, failed: 0 },
  };
  
  const fixedComponents = [];
  
  // Extensions prüfen
  console.log(`${COLORS.bright}${COLORS.magenta}\n=== EXTENSIONS ====${COLORS.reset}`);
  for (const extension of CONFIG.extensions) {
    results.extensions.total++;
    const status = checkComponentStatus(extension);
    
    if (status) {
      results.extensions.success++;
    } else {
      // Reparatur versuchen
      const fixed = tryFixComponent(extension);
      if (fixed) {
        results.extensions.fixed++;
        fixedComponents.push(extension.name);
      } else {
        results.extensions.failed++;
      }
    }
  }
  
  // AI-Services prüfen
  console.log(`${COLORS.bright}${COLORS.magenta}\n=== AI SERVICES ====${COLORS.reset}`);
  for (const service of CONFIG.aiServices) {
    results.aiServices.total++;
    const status = checkComponentStatus(service);
    
    if (status) {
      results.aiServices.success++;
    } else {
      // Reparatur versuchen
      const fixed = tryFixComponent(service);
      if (fixed) {
        results.aiServices.fixed++;
        fixedComponents.push(service.name);
      } else {
        results.aiServices.failed++;
      }
    }
  }
  
  // GSC-Tools prüfen
  console.log(`${COLORS.bright}${COLORS.magenta}\n=== GSC TOOLS ====${COLORS.reset}`);
  for (const tool of CONFIG.gscTools) {
    results.gscTools.total++;
    const status = checkComponentStatus(tool);
    
    if (status) {
      results.gscTools.success++;
    } else {
      // Reparatur versuchen
      const fixed = tryFixComponent(tool);
      if (fixed) {
        results.gscTools.fixed++;
        fixedComponents.push(tool.name);
      } else {
        results.gscTools.failed++;
      }
    }
  }
  
  // Zusammenfassung ausgeben
  console.log(`\n${COLORS.bright}${COLORS.blue}=== 📊 ZUSAMMENFASSUNG ====${COLORS.reset}`);
  printResults('Extensions', results.extensions);
  printResults('AI Services', results.aiServices);
  printResults('GSC Tools', results.gscTools);
  
  // Gesamtergebnis
  const totalComponents = results.extensions.total + results.aiServices.total + results.gscTools.total;
  const totalSuccess = results.extensions.success + results.aiServices.success + results.gscTools.success;
  const totalFixed = results.extensions.fixed + results.aiServices.fixed + results.gscTools.fixed;
  const totalFailed = results.extensions.failed + results.aiServices.failed + results.gscTools.failed;
  
  console.log(`\n${COLORS.bright}${COLORS.blue}=== 📈 GESAMTERGEBNIS ====${COLORS.reset}`);
  console.log(`${COLORS.cyan}Gesamt: ${totalComponents} Komponenten${COLORS.reset}`);
  console.log(`${COLORS.green}✅ Erfolgreich: ${totalSuccess} (${Math.round(totalSuccess/totalComponents*100)}%)${COLORS.reset}`);
  console.log(`${COLORS.yellow}🔧 Repariert: ${totalFixed} (${Math.round(totalFixed/totalComponents*100)}%)${COLORS.reset}`);
  console.log(`${COLORS.red}❌ Fehlgeschlagen: ${totalFailed} (${Math.round(totalFailed/totalComponents*100)}%)${COLORS.reset}`);
  
  // Aktualisiere Statusdatei
  updateStatusFile({
    timestamp: new Date().toISOString(),
    summary: { total: totalComponents, success: totalSuccess, fixed: totalFixed, failed: totalFailed },
    details: results,
    fixedComponents
  });
  
  // Auto-Commit wenn es Fixes gab
  if (fixedComponents.length > 0) {
    const fixDescription = `Auto-Fix: ${fixedComponents.join(', ')} repariert`;
    autoCommitAndPush(fixDescription);
  }
}

/**
 * Gibt das Ergebnis einer Kategorie formatiert aus
 * @param {string} category - Name der Kategorie
 * @param {Object} result - Ergebnis-Objekt
 */
function printResults(category, result) {
  console.log(`\n${COLORS.cyan}${category}: ${result.total} Komponenten${COLORS.reset}`);
  console.log(`${COLORS.green}✅ Erfolgreich: ${result.success} (${Math.round(result.success/result.total*100)}%)${COLORS.reset}`);
  console.log(`${COLORS.yellow}🔧 Repariert: ${result.fixed} (${Math.round(result.fixed/result.total*100)}%)${COLORS.reset}`);
  console.log(`${COLORS.red}❌ Fehlgeschlagen: ${result.failed} (${Math.round(result.failed/result.total*100)}%)${COLORS.reset}`);
}

/**
 * Aktualisiert die Statusdatei mit den aktuellen Ergebnissen
 * @param {Object} status - Status-Objekt
 */
function updateStatusFile(status) {
  const statusFile = path.join(process.cwd(), 'MONITOR_STATUS.json');
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
  console.log(`\n${COLORS.cyan}📄 Status in MONITOR_STATUS.json gespeichert${COLORS.reset}`);
  
  // Auch Markdown-Dokumentation erstellen/aktualisieren
  const markdownFile = path.join(process.cwd(), 'EXTENSION_SERVICES_MONITOR_IMPLEMENTATION.md');
  let markdown = '';
  
  if (fs.existsSync(markdownFile)) {
    markdown = fs.readFileSync(markdownFile, 'utf8');
    
    // Füge neue Statusinfo am Ende hinzu
    markdown += `\n\n## Status-Update: ${new Date().toLocaleString('de-DE')}\n\n`;
  } else {
    markdown = `# Extension & Services Monitoring\n\n## Status-Update: ${new Date().toLocaleString('de-DE')}\n\n`;
  }
  
  markdown += `### Zusammenfassung\n\n`;
  markdown += `- Gesamtzahl Komponenten: ${status.summary.total}\n`;
  markdown += `- ✅ Erfolgreich: ${status.summary.success} (${Math.round(status.summary.success/status.summary.total*100)}%)\n`;
  markdown += `- 🔧 Repariert: ${status.summary.fixed} (${Math.round(status.summary.fixed/status.summary.total*100)}%)\n`;
  markdown += `- ❌ Fehlgeschlagen: ${status.summary.failed} (${Math.round(status.summary.failed/status.summary.total*100)}%)\n\n`;
  
  if (status.fixedComponents.length > 0) {
    markdown += `### Automatisch reparierte Komponenten\n\n`;
    status.fixedComponents.forEach(comp => {
      markdown += `- ${comp}\n`;
    });
  }
  
  fs.writeFileSync(markdownFile, markdown);
  console.log(`${COLORS.cyan}📄 Dokumentation in EXTENSION_SERVICES_MONITOR_IMPLEMENTATION.md aktualisiert${COLORS.reset}`);
}

// Hauptfunktion ausführen
if (require.main === module) {
  runFullDashboard();
}

module.exports = { runFullDashboard, checkComponentStatus, tryFixComponent };
