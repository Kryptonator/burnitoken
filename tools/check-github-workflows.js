/**
 * GitHub Workflows Check Tool
 * 
 * Überprüft die GitHub Actions Workflows auf korrekte Konfiguration und Status
 * 
 * Verwendung:
 * - node tools/check-github-workflows.js - Ausführliche Ausgabe
 * - node tools/check-github-workflows.js --silent - Nur Fehler werden angezeigt
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
const isSilent = process.argv.includes('--silent');

/**
 * Logger-Funktion
 */
function log(message, type = 'info') {
  if (isSilent && type !== 'error') return;
  
  const colorCodes = {
    info: '\x1b[36m', // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
    reset: '\x1b[0m' // reset
  };
  
  console.log(`${colorCodes[type]}${message}${colorCodes.reset}`);
}

/**
 * Prüft, ob das Workflows-Verzeichnis existiert
 */
function checkWorkflowsDir() {
  if (!fs.existsSync(workflowsDir)) {
    log(`GitHub Workflows-Verzeichnis nicht gefunden: ${workflowsDir}`, 'error');
    return false;
  }
  
  log(`GitHub Workflows-Verzeichnis gefunden: ${workflowsDir}`, 'success');
  return true;
}

/**
 * Liest Workflow-Dateien und validiert deren Inhalt
 */
function validateWorkflows() {
  const workflowFiles = fs.readdirSync(workflowsDir)
    .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  
  if (workflowFiles.length === 0) {
    log('Keine Workflow-Dateien gefunden', 'warning');
    return false;
  }
  
  log(`${workflowFiles.length} Workflow-Dateien gefunden`, 'info');
  
  let hasErrors = false;
  const workflows = [];
  
  workflowFiles.forEach(file => {
    const filePath = path.join(workflowsDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const workflow = yaml.parse(content);
      
      workflows.push({ 
        name: file, 
        config: workflow,
        valid: true,
        errors: []
      });
      
      log(`✅ ${file} - Gültiges YAML`, 'success');
    } catch (err) {
      hasErrors = true;
      log(`❌ ${file} - Ungültiges YAML: ${err.message}`, 'error');
      workflows.push({ 
        name: file, 
        valid: false,
        errors: [err.message]
      });
    }
  });
  
  // Tiefergehende Analyse der Workflows
  workflows.forEach(workflow => {
    if (!workflow.valid) return;
    
    const errors = validateWorkflowConfig(workflow.config);
    if (errors.length > 0) {
      hasErrors = true;
      workflow.valid = false;
      workflow.errors = errors;
      
      errors.forEach(error => {
        log(`❌ ${workflow.name} - ${error}`, 'error');
      });
    } else {
      log(`✅ ${workflow.name} - Konfiguration korrekt`, 'success');
    }
  });
  
  // Prüfe, ob mindestens ein Produktions-Deployment-Workflow existiert
  const hasProductionWorkflow = workflows.some(w => 
    w.valid && w.config && w.config.name && 
    (w.config.name.includes('Production') || 
     w.config.name.includes('Deploy') || 
     w.name.includes('production') ||
     w.name.includes('deploy'))
  );
  
  if (!hasProductionWorkflow) {
    log('⚠️ Kein Produktions-Deployment-Workflow gefunden', 'warning');
  } else {
    log('✅ Produktions-Deployment-Workflow gefunden', 'success');
  }
  
  return !hasErrors;
}

/**
 * Validiert die Workflow-Konfiguration auf typische Probleme
 */
function validateWorkflowConfig(config) {
  const errors = [];
  
  // Prüfe Basisstruktur
  if (!config.name) {
    errors.push('Workflow hat keinen Namen (name)');
  }
  
  if (!config.on) {
    errors.push('Workflow hat keinen Trigger (on)');
  }
  
  if (!config.jobs || Object.keys(config.jobs).length === 0) {
    errors.push('Workflow hat keine Jobs (jobs)');
  }
  
  // Prüfe Jobs
  if (config.jobs) {
    Object.entries(config.jobs).forEach(([jobName, job]) => {
      if (!job.runs_on && !job['runs-on']) {
        errors.push(`Job '${jobName}' hat kein 'runs-on' Feld`);
      }
      
      if (!job.steps || !Array.isArray(job.steps) || job.steps.length === 0) {
        errors.push(`Job '${jobName}' hat keine Schritte (steps)`);
      }
    });
  }
  
  return errors;
}

/**
 * Hauptfunktion
 */
function main() {
  try {
    log('🔍 Prüfe GitHub Workflows...', 'info');
    
    if (!checkWorkflowsDir()) {
      log('❌ GitHub Workflows-Verzeichnis nicht gefunden. Überspringe Prüfung.', 'error');
      process.exit(1);
    }
    
    const isValid = validateWorkflows();
    
    if (isValid) {
      log('✅ Alle GitHub Workflows sind korrekt konfiguriert', 'success');
      process.exit(0);
    } else {
      log('❌ Es wurden Probleme in den GitHub Workflows gefunden', 'error');
      process.exit(1);
    }
  } catch (err) {
    log(`❌ Unerwarteter Fehler: ${err.message}`, 'error');
    process.exit(1);
  }
}

// Starte das Skript
main();
