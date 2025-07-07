/**
 * Master Worker System für parallele Ausführung
 * Dieses Tool verwaltet die parallele Ausführung kritischer Tasks
 * für einen beschleunigten Go-Live und höhere Ausfallsicherheit.
 */

const { exec, spawn } = require('child_process');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

// Konfiguration der Worker-Gruppen und ihre Tasks
const WORKER_CONFIG = {
  'system': {
    priority: 1,
    tasks: [
      { name: 'Auto-Recovery', script: 'tools/auto-recovery.js', args: [], critical: true },
      { name: 'Unified Status Manager', script: 'tools/unified-status-manager.js', args: ['--silent'], critical: true },
      { name: 'Extension Function Validator', script: 'extension-function-validator.js', args: [], critical: true }
    ]
  },
  'ai-services': {
    priority: 2,
    tasks: [
      { name: 'AI Session Saver', script: 'tools/session-saver.js', args: [], critical: true },
      { name: 'AI Conversation Bridge', script: 'tools/start-ai-bridge.js', args: [], critical: true },
      { name: 'Model Switch', script: 'tools/model-switch.js', args: ['--auto'], critical: false }
    ]
  },
  'search-console': {
    priority: 3,
    tasks: [
      { name: 'GSC Auth Check', script: 'tools/gsc-auth-check.js', args: [], critical: true },
      { name: 'GSC Integration Monitor', script: 'tools/gsc-integration-monitor.js', args: [], critical: true },
      { name: 'GSC Indexing Monitor', script: 'tools/gsc-indexing-monitor.js', args: [], critical: true }
    ]
  },
  'monitoring': {
    priority: 4,
    tasks: [
      { name: 'GSC Indexing Watch', script: 'tools/gsc-indexing-watch.js', args: [], critical: false },
      { name: 'Extension Auto-Restart', script: 'tools/extension-auto-restart.js', args: ['--monitor'], critical: false }
    ]
  }
};

// Verzeichnis für Worker-Status und Logs
const WORKER_DIR = path.join(__dirname, '..', '.worker-system');
if (!existsSync(WORKER_DIR)) {
  mkdirSync(WORKER_DIR, { recursive: true });
}

// Status-Datei für Worker-System
const STATUS_FILE = path.join(WORKER_DIR, 'worker-status.json');
const LOG_FILE = path.join(WORKER_DIR, 'worker-log.txt');

/**
 * Logging-Funktion
 */
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  // Konsole und Datei
  console.log(`[${type}] ${message}`);
  
  try {
    const fs = require('fs');
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Fehler beim Schreiben ins Log:', error);
  }
}

/**
 * Worker-Status aktualisieren
 */
function updateWorkerStatus(workerId, status, exitCode = null) {
  let currentStatus = {};
  
  try {
    if (existsSync(STATUS_FILE)) {
      currentStatus = JSON.parse(readFileSync(STATUS_FILE, 'utf8'));
    }
  } catch (error) {
    log(`Fehler beim Lesen der Status-Datei: ${error.message}`, 'ERROR');
    currentStatus = {};
  }
  
  currentStatus[workerId] = {
    status,
    lastUpdate: new Date().toISOString(),
    exitCode: exitCode
  };
  
  try {
    writeFileSync(STATUS_FILE, JSON.stringify(currentStatus, null, 2));
  } catch (error) {
    log(`Fehler beim Schreiben der Status-Datei: ${error.message}`, 'ERROR');
  }
}

/**
 * Worker-Gruppen nacheinander starten
 */
async function startWorkerGroups() {
  // Worker-Gruppen nach Priorität sortieren
  const sortedGroups = Object.entries(WORKER_CONFIG)
    .sort(([, a], [, b]) => a.priority - b.priority);
  
  log(`🚀 Master Worker System startet ${sortedGroups.length} Worker-Gruppen...`);
  
  for (const [groupName, config] of sortedGroups) {
    log(`⚙️ Starte Worker-Gruppe: ${groupName} (Priorität ${config.priority})`);
    await startWorkerGroup(groupName, config);
  }
  
  log('✅ Alle Worker-Gruppen wurden gestartet!');
  
  // Status-Report erstellen
  setTimeout(generateStatusReport, 5000);
}

/**
 * Eine Worker-Gruppe starten (parallel)
 */
async function startWorkerGroup(groupName, config) {
  const promises = config.tasks.map(task => startWorker(groupName, task));
  await Promise.allSettled(promises);
}

/**
 * Einzelnen Worker starten
 */
function startWorker(groupName, task) {
  return new Promise((resolve) => {
    const workerId = `${groupName}:${task.name}`;
    log(`▶️ Starte Worker: ${workerId}`);
    
    updateWorkerStatus(workerId, 'starting');
    
    try {
      // Node-Prozess als Worker starten
      const child = spawn('node', [task.script, ...task.args], {
        detached: task.detached !== false,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      // Worker-Ausgabe sammeln (begrenzt)
      let output = '';
      const maxOutputLength = 1000;
      
      child.stdout.on('data', (data) => {
        const text = data.toString().trim();
        if (text) {
          output += text + '\n';
          if (output.length > maxOutputLength) {
            output = output.substring(output.length - maxOutputLength);
          }
        }
      });
      
      child.stderr.on('data', (data) => {
        const text = data.toString().trim();
        if (text) {
          log(`Worker ${workerId} Fehler: ${text}`, 'ERROR');
          output += `ERROR: ${text}\n`;
          if (output.length > maxOutputLength) {
            output = output.substring(output.length - maxOutputLength);
          }
        }
      });
      
      child.on('error', (error) => {
        log(`Fehler beim Starten von ${workerId}: ${error.message}`, 'ERROR');
        updateWorkerStatus(workerId, 'error', error.code || -1);
        resolve();
      });
      
      child.on('exit', (code) => {
        if (code === 0) {
          log(`Worker ${workerId} erfolgreich beendet`, 'SUCCESS');
          updateWorkerStatus(workerId, 'completed', code);
        } else {
          log(`Worker ${workerId} mit Fehlercode beendet: ${code}`, 'WARNING');
          updateWorkerStatus(workerId, 'failed', code);
          
          // Bei kritischen Tasks: Neustart versuchen
          if (task.critical) {
            log(`Kritischer Task ${workerId} fehlgeschlagen - versuche Neustart in 5 Sekunden...`, 'WARNING');
            setTimeout(() => {
              startWorker(groupName, task);
            }, 5000);
          }
        }
        resolve();
      });
      
      // Status aktualisieren
      updateWorkerStatus(workerId, 'running', null);
      
      // Worker-Info speichern
      writeFileSync(
        path.join(WORKER_DIR, `${groupName}-${task.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`),
        JSON.stringify({
          workerId,
          script: task.script,
          args: task.args,
          critical: task.critical,
          startTime: new Date().toISOString(),
          pid: child.pid
        }, null, 2)
      );
      
    } catch (error) {
      log(`Fehler beim Starten des Workers ${workerId}: ${error.message}`, 'ERROR');
      updateWorkerStatus(workerId, 'error');
      resolve();
    }
  });
}

/**
 * Status-Report für alle Worker generieren
 */
function generateStatusReport() {
  try {
    let status = {};
    if (existsSync(STATUS_FILE)) {
      status = JSON.parse(readFileSync(STATUS_FILE, 'utf8'));
    }
    
    // Markdown-Report erstellen
    const now = new Date().toISOString();
    let report = `# Worker-System Status Report\n\n`;
    report += `Erstellt: ${now}\n\n`;
    
    // Statistiken
    const stats = {
      total: 0,
      running: 0,
      completed: 0,
      failed: 0,
      error: 0
    };
    
    // Nach Gruppen gruppieren
    const groupedStatus = {};
    
    Object.entries(status).forEach(([workerId, info]) => {
      stats.total++;
      stats[info.status] = (stats[info.status] || 0) + 1;
      
      const [groupName] = workerId.split(':');
      if (!groupedStatus[groupName]) {
        groupedStatus[groupName] = [];
      }
      
      groupedStatus[groupName].push({
        name: workerId.split(':')[1],
        ...info
      });
    });
    
    // Zusammenfassung
    report += `## Zusammenfassung\n\n`;
    report += `- Gesamt: ${stats.total} Worker\n`;
    report += `- Laufend: ${stats.running || 0} Worker\n`;
    report += `- Abgeschlossen: ${stats.completed || 0} Worker\n`;
    report += `- Fehlgeschlagen: ${stats.failed || 0} Worker\n`;
    report += `- Fehler: ${stats.error || 0} Worker\n\n`;
    
    // Details nach Gruppen
    report += `## Worker-Details\n\n`;
    
    Object.entries(groupedStatus).forEach(([groupName, workers]) => {
      report += `### ${groupName}\n\n`;
      
      report += `| Worker | Status | Letzte Aktualisierung | Exit-Code |\n`;
      report += `|--------|--------|------------------------|----------|\n`;
      
      workers.forEach(worker => {
        const statusEmoji = worker.status === 'running' ? '🟢' : 
                           worker.status === 'completed' ? '✅' : 
                           worker.status === 'failed' ? '🔴' : '⚠️';
        
        report += `| ${worker.name} | ${statusEmoji} ${worker.status} | ${worker.lastUpdate} | ${worker.exitCode || '-'} |\n`;
      });
      
      report += `\n`;
    });
    
    // Report speichern
    const reportPath = path.join(WORKER_DIR, 'worker-report.md');
    writeFileSync(reportPath, report);
    log(`Status-Report erstellt: ${reportPath}`);
    
    // Status an Unified Status Manager senden
    try {
      const healthStatus = stats.failed > 0 || stats.error > 0 ? 'warning' : 'healthy';
      exec(`node tools/unified-status-manager.js --update "worker-system" "${healthStatus}" "Worker-System: ${stats.running} aktiv, ${stats.failed} fehlgeschlagen"`);
    } catch (error) {
      log(`Fehler bei Status-Update: ${error.message}`, 'ERROR');
    }
    
  } catch (error) {
    log(`Fehler beim Erstellen des Status-Reports: ${error.message}`, 'ERROR');
  }
}

// Haupt-Funktion
async function main() {
  log('🚀 Master Worker System wird initialisiert...');
  
  // Argumente prüfen
  const args = process.argv.slice(2);
  
  if (args.includes('--report')) {
    generateStatusReport();
    return;
  }
  
  if (args.includes('--restart')) {
    // TODO: Implementiere Worker-Neustart-Logik
    log('Worker-Neustart wird durchgeführt...');
    return;
  }
  
  // Standard: Starte alle Worker-Gruppen
  await startWorkerGroups();
  
  // Regelmäßiger Status-Report
  setInterval(generateStatusReport, 60000); // Alle 60 Sekunden
  
  log('Master Worker System läuft und überwacht alle Worker');
}

// Start
main().catch(error => {
  log(`Kritischer Fehler im Master Worker System: ${error.message}`, 'CRITICAL');
  process.exit(1);
});
