/**
 * Parallelisierungsmanager für Worker
 * Optimiert die Verteilung von Tasks auf verfügbare Worker
 */

const { spawn, exec } = require('child_process');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');
const os = require('os');

// Konfiguration
const WORKER_DIR = path.join(__dirname, '..', '.worker-system');
const LOG_FILE = path.join(WORKER_DIR, 'parallelize-log.txt');
const MAX_PARALLEL_TASKS = Math.max(1, os.cpus().length - 1); // Nutze Anzahl der CPUs minus 1
const TASK_TIMEOUT = 120000; // 2 Minuten Timeout für hängende Tasks

// Taskgruppen definieren (mit Abhängigkeiten)
const TASK_GROUPS = {
  startup: {
    description: 'Grundlegende Startdienste',
    parallel: true,
    tasks: ['extension-function-validator.js', 'tools/auto-recovery.js', 'tools/session-saver.js'],
    requiredFor: ['extensions', 'ai-services', 'gsc'],
  },
  extensions: {
    description: 'Extension-Management',
    parallel: true,
    tasks: [
      'tools/extension-auto-restart.js --on-startup',
      'advanced-extension-manager.js',
      'master-extension-orchestrator.js',
    ],
    dependsOn: ['startup'],
  },
  'ai-services': {
    description: 'KI-Dienste und Integrationen',
    parallel: true,
    tasks: [
      'tools/start-ai-bridge.js',
      'tools/ai-services-manager.js --startup',
      'tools/model-switch.js --auto',
    ],
    dependsOn: ['startup'],
  },
  gsc: {
    description: 'Google Search Console Integration',
    parallel: true,
    tasks: [
      'tools/gsc-auth-check.js',
      'tools/gsc-integration-monitor.js',
      'tools/gsc-startup-check.js',
    ],
    dependsOn: ['startup'],
  },
  monitoring: {
    description: 'Kontinuierliche Überwachung',
    parallel: true,
    tasks: [
      'tools/gsc-indexing-monitor.js',
      'tools/gsc-indexing-watch.js',
      'tools/unified-status-manager.js --silent',
    ],
    dependsOn: ['gsc', 'extensions', 'ai-services'],
  },
  reporting: {
    description: 'Status Reports und Analytics',
    parallel: true,
    tasks: ['tools/unified-status-report.js --auto', 'tools/gsc-indexing-report.js --auto'],
    dependsOn: ['monitoring'],
    runAfterDelay: 10000, // 10 Sekunden warten nach Start der Monitoring-Gruppe
  },
};

/**
 * Logging-Funktion
 */
] [${type}] ${message}\n`;

  // Konsole und Datei
  console.log(`[${type}] ${message}`);

  try {
    // Stellen Sie sicher, dass das Verzeichnis existiert
    if (!existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
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
      mkdirSync(WORKER_DIR, { recursive: true });
    }

    require('fs').appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Fehler beim Schreiben ins Log:', error);
  }
}

// Aktive Tasks tracken
const activeTasks = new Map();
const completedTasks = new Set();
const failedTasks = new Set();
const taskResults = new Map();

/**
 * Task ausführen
 */
function runTask(task, groupName) {
  return new Promise((resolve) => {
    const taskId = `${groupName}:${task}`;
    const startTime = Date.now();

    log(`▶️ Starte Task: ${taskId}`);

    // Timeout setzen, um hängende Tasks zu erkennen
    const timeoutId = setTimeout(() => {
      log(`⚠️ Task-Timeout erreicht: ${taskId} (${TASK_TIMEOUT / 1000}s)`, 'WARNING');
      if (activeTasks.has(taskId)) {
        const process = activeTasks.get(taskId);
        if (process && process.pid) {
          try {
            // Versuchen, den Prozess zu beenden
            process.kill();
          } catch (err) {
            log(`Fehler beim Beenden des Timeout-Tasks ${taskId}: ${err.message}`, 'ERROR');
          }
        }

        failedTasks.add(taskId);
        activeTasks.delete(taskId);
        resolve({ taskId, success: false, reason: 'timeout' });
      }
    }, TASK_TIMEOUT);

    try {
      // Kommandozeile aufteilen
      const parts = task.split(' ');
      const script = parts[0];
      const args = parts.slice(1);

      const child = spawn('node', [script, ...args], {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      activeTasks.set(taskId, child);

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const text = data.toString().trim();
        if (text) {
          output += text + '\n';
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString().trim();
        if (text) {
          log(`Task ${taskId} Fehler: ${text}`, 'ERROR');
          errorOutput += text + '\n';
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        log(`Fehler beim Ausführen von ${taskId}: ${error.message}`, 'ERROR');
        failedTasks.add(taskId);
        activeTasks.delete(taskId);

        taskResults.set(taskId, {
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
        });

        resolve({ taskId, success: false, reason: error.message });
      });

      child.on('exit', (code) => {
        clearTimeout(timeoutId);
        activeTasks.delete(taskId);
        const duration = Date.now() - startTime;

        if (code === 0) {
          log(`✅ Task ${taskId} erfolgreich abgeschlossen (${duration}ms)`, 'SUCCESS');
          completedTasks.add(taskId);

          taskResults.set(taskId, {
            success: true,
            duration,
            output: output.length > 500 ? output.substring(0, 500) + '...' : output,
          });

          resolve({ taskId, success: true });
        } else {
          log(`❌ Task ${taskId} fehlgeschlagen mit Code ${code} (${duration}ms)`, 'ERROR');
          failedTasks.add(taskId);

          taskResults.set(taskId, {
            success: false,
            exitCode: code,
            duration,
            error: errorOutput,
            output: output.length > 500 ? output.substring(0, 500) + '...' : output,
          });

          resolve({ taskId, success: false, reason: `Exit code ${code}` });
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      log(`Kritischer Fehler beim Starten des Tasks ${taskId}: ${error.message}`, 'CRITICAL');
      failedTasks.add(taskId);

      taskResults.set(taskId, {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      });

      resolve({ taskId, success: false, reason: error.message });
    }
  });
}

/**
 * Taskgruppe ausführen
 */
async function runTaskGroup(groupName, group) {
  log(`📊 Starte Taskgruppe: ${groupName} - ${group.description}`);

  const tasks = [...group.tasks];
  const results = [];

  // Abhängigkeiten prüfen
  if (group.dependsOn && group.dependsOn.length > 0) {
    const missingDependencies = group.dependsOn.filter((dep) => {
      // Prüfe, ob alle Tasks der abhängigen Gruppe erfolgreich waren
      const depGroup = TASK_GROUPS[dep];
      if (!depGroup) return true;

      return !depGroup.tasks.every((task) => completedTasks.has(`${dep}:${task}`));
    });

    if (missingDependencies.length > 0) {
      log(
        `⚠️ Taskgruppe ${groupName} kann nicht gestartet werden: Abhängigkeiten nicht erfüllt: ${missingDependencies.join(', ')}`,
        'WARNING',
      );
      return { groupName, success: false, reason: 'dependencies-not-satisfied' };
    }
  }

  // Warte auf Verzögerung, falls angegeben
  if (group.runAfterDelay) {
    log(`⏱️ Warte ${group.runAfterDelay / 1000} Sekunden vor Start von Gruppe ${groupName}...`);
    await new Promise((resolve) => setTimeout(resolve, group.runAfterDelay));
  }

  // Alle Tasks parallel ausführen
  if (group.parallel) {
    // Limitiere die parallele Ausführung auf MAX_PARALLEL_TASKS
    const chunks = [];
    for (let i = 0; i < tasks.length; i += MAX_PARALLEL_TASKS) {
      chunks.push(tasks.slice(i, i + MAX_PARALLEL_TASKS));
    }

    for (const chunk of chunks) {
      // Diese Tasks parallel ausführen
      const chunkPromises = chunk.map((task) => runTask(task, groupName));
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }
  } else {
    // Tasks sequentiell ausführen
    for (const task of tasks) {
      const result = await runTask(task, groupName);
      results.push(result);

      // Bei Fehler und wenn nicht optional, breche die Gruppe ab
      if (!result.success && !group.continueOnError) {
        log(`❌ Breche Taskgruppe ${groupName} wegen Fehler in Task ${result.taskId} ab`, 'ERROR');
        break;
      }
    }
  }

  // Groupenstatus bestimmen
  const success = results.every((r) => r.success);
  log(
    `${success ? '✅' : '❌'} Taskgruppe ${groupName} ${success ? 'erfolgreich' : 'mit Fehlern'} abgeschlossen`,
  );

  // Nach erfolgreichem Abschluss: Status an Unified Status Manager melden
  if (success) {
    try {
      exec(
        `node tools/unified-status-manager.js --update "taskgroup-${groupName}" "healthy" "Taskgruppe ${groupName} erfolgreich"`,
      );
    } catch (error) {
      log(`Fehler beim Update des Status für Gruppe ${groupName}: ${error.message}`, 'ERROR');
    }
  }

  return { groupName, success, results };
}

/**
 * Worker-Status-Bericht erstellen
 */
function generateReport() {
  const reportData = {
    timestamp: new Date().toISOString(),
    totalTasks: completedTasks.size + failedTasks.size + activeTasks.size,
    completed: completedTasks.size,
    failed: failedTasks.size,
    active: activeTasks.size,
    taskResults: Object.fromEntries(taskResults),
  };

  try {
    const reportPath = path.join(WORKER_DIR, 'parallel-tasks-report.json');
    writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    log(`📝 Task-Report erstellt: ${reportPath}`);

    // Markdown-Report erstellen für bessere Lesbarkeit
    let mdReport = `# Parallele Task-Ausführung Bericht\n\n`;
    mdReport += `Erstellt: ${reportData.timestamp}\n\n`;

    mdReport += `## Zusammenfassung\n\n`;
    mdReport += `- Gesamt: ${reportData.totalTasks} Tasks\n`;
    mdReport += `- Erfolgreich: ${reportData.completed} Tasks\n`;
    mdReport += `- Fehlgeschlagen: ${reportData.failed} Tasks\n`;
    mdReport += `- Aktiv: ${reportData.active} Tasks\n\n`;

    mdReport += `## Task-Gruppen Details\n\n`;

    // Nach Gruppen gruppieren
    const groups = {};
    for (const [taskId, result] of taskResults.entries()) {
      const [groupName] = taskId.split(':');
      if (!groups[groupName]) {
        groups[groupName] = { success: 0, failed: 0, tasks: [] };
      }

      groups[groupName].tasks.push({
        name: taskId.split(':')[1],
        ...result,
      });

      if (result.success) {
        groups[groupName].success++;
      } else {
        groups[groupName].failed++;
      }
    }

    Object.entries(groups).forEach(([groupName, group]) => {
      const groupInfo = TASK_GROUPS[groupName] || { description: 'Unbekannte Gruppe' };

      mdReport += `### ${groupName} - ${groupInfo.description}\n\n`;
      mdReport += `Status: ${group.failed > 0 ? '❌ Fehler' : '✅ Erfolgreich'}\n`;
      mdReport += `Erfolgreiche Tasks: ${group.success} | Fehlgeschlagene Tasks: ${group.failed}\n\n`;

      mdReport += `| Task | Status | Dauer | Details |\n`;
      mdReport += `|------|--------|-------|--------|\n`;

      group.tasks
        .sort((a, b) => {
          // Erst nach Erfolg/Fehler sortieren, dann nach Dauer
          if (a.success !== b.success) return a.success ? -1 : 1;
          return a.duration - b.duration;
        })
        .forEach((task) => {
          const status = task.success ? '✅' : '❌';
          const duration = task.duration ? `${(task.duration / 1000).toFixed(1)}s` : '-';
          const details = task.error || '';

          mdReport += `| ${task.name} | ${status} | ${duration} | ${details} |\n`;
        });

      mdReport += `\n`;
    });

    const mdReportPath = path.join(WORKER_DIR, 'parallel-tasks-report.md');
    writeFileSync(mdReportPath, mdReport);
  } catch (error) {
    log(`Fehler beim Erstellen des Task-Reports: ${error.message}`, 'ERROR');
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  log('🚀 Parallelisierungsmanager wird initialisiert...');

  // Verzeichnis für Reports erstellen
  if (!existsSync(WORKER_DIR)) {
    mkdirSync(WORKER_DIR, { recursive: true });
  }

  // Argumente prüfen
  const args = process.argv.slice(2);

  if (args.includes('--report')) {
    generateReport();
    return;
  }

  // Gruppen nach Abhängigkeiten sortieren
  const groupOrder = [];
  const addedGroups = new Set();

  // Hilfsfunktion zum rekursiven Hinzufügen von Gruppen mit Abhängigkeiten
  function addGroupWithDependencies(groupName) {
    if (addedGroups.has(groupName)) return;

    const group = TASK_GROUPS[groupName];
    if (!group) return;

    // Zuerst Abhängigkeiten hinzufügen
    if (group.dependsOn) {
      for (const dep of group.dependsOn) {
        addGroupWithDependencies(dep);
      }
    }

    // Dann die Gruppe selbst
    if (!addedGroups.has(groupName)) {
      groupOrder.push(groupName);
      addedGroups.add(groupName);
    }
  }

  // Alle Gruppen mit ihren Abhängigkeiten hinzufügen
  Object.keys(TASK_GROUPS).forEach(addGroupWithDependencies);

  log(`📋 Ausführungsreihenfolge: ${groupOrder.join(' → ')}`);

  // Ausführungszeit messen
  const startTime = Date.now();

  // Taskgruppen ausführen
  for (const groupName of groupOrder) {
    const group = TASK_GROUPS[groupName];
    await runTaskGroup(groupName, group);
  }

  const totalTime = (Date.now() - startTime) / 1000;
  log(`⏱️ Gesamtausführungszeit: ${totalTime.toFixed(1)} Sekunden`, 'INFO');

  // Abschlussbericht erstellen
  generateReport();

  log(
    `✅ Parallelisierung abgeschlossen: ${completedTasks.size} erfolgreich, ${failedTasks.size} fehlgeschlagen`,
  );

  // Falls noch Tasks aktiv sind, warten wir noch eine Weile
  if (activeTasks.size > 0) {
    log(`⚠️ Es sind noch ${activeTasks.size} Tasks aktiv, warte auf Abschluss...`, 'WARNING');

    // 10 Sekunden warten
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Finalen Report erstellen
    generateReport();
  }

  // Status an Unified Status Manager melden
  try {
    const healthStatus = failedTasks.size > 0 ? 'warning' : 'healthy';
    exec(
      `node tools/unified-status-manager.js --update "parallel-manager" "${healthStatus}" "Parallel Execution: ${completedTasks.size} ok, ${failedTasks.size} failed"`,
    );
  } catch (error) {
    log(`Fehler bei Status-Update: ${error.message}`, 'ERROR');
  }
}

// Start
main().catch((error) => {
  log(`Kritischer Fehler im Parallelisierungsmanager: ${error.message}`, 'CRITICAL');
  generateReport();
  process.exit(1);
});
