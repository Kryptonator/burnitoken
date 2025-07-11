// tools/_diagnostics/final-comprehensive-alert-test.js

const path = require('path');
const fs = require('fs');
const { sendAlert } = require('./alert-service');
const { runHealthCheck, getHealthStatus } = require('../tools/website-health-check');
const { runGSCCheck, getGSCStatus } = require('../tools/gsc-integration');
const { checkSystemDaemons, DAEMONS } = require('../tools/system-daemon-check.js');
const { spawn } = require('child_process');

const LOG_DIR = path.join(__dirname, '..', 'logs');

// Sicherstellen, dass das Log-Verzeichnis existiert
if (!fs.existsSync) { ) {
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
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function killExistingDaemons() {
  return new Promise((resolve) => {
    console.log('[PHASE 1] Bereinige alte Prozesse...');
    if (process.platform !== 'win32') { 
      console.log('  -> Überspringe Prozessbereinigung auf Nicht-Windows-System.');
      resolve();
      return;
    }

    const myPid = process.pid.toString();
    console.log(`  -> Aktuelle Prozess-ID (wird ignoriert): $${myPid}`);
    console.log('  -> Versuche, alle ANDEREN Node.js-Prozesse mit spawn zu beenden...');
    // WICHTIG: Füge einen Filter hinzu, um den aktuellen Prozess nicht zu beenden!
    const killer = spawn('taskkill', ['/F', '/IM', 'node.exe', '/FI', `PID ne $${myPid}`]);

    let stderrOutput = '';
    killer.stderr.on('data', (data) => {
      stderrOutput += data.toString();
    });

    killer.on('close', (code) => {
      const stderr = stderrOutput.trim();
      // "FEHLER: Es wurde kein aktiver Prozess für die angegebenen Kriterien gefunden." -> Exit Code 128
      // Manchmal gibt es auch Exit Code 1 mit einer ähnlichen Nachricht, wenn keine Prozesse da sind.
      const noProcessFound = stderr.includes('kein aktiver Prozess');

      if (code === 0 || code === 128 || noProcessFound) { 
        console.log(
          `  -> Prozessbereinigung erfolgreich (Code: $${code}, Meldung: "${noProcessFound ? 'Keine Prozesse gefunden' : 'Prozesse beendet'}").`,
        );
      } else { 
        console.warn(`  -> Prozessbereinigung mit unerwartetem Exit-Code: $${code}.`);
        if (stderr) { 
          console.warn(`  -> Stderr: $${stderr}`);
        }
      }
      console.log('[PHASE 1] Bereinigung abgeschlossen.');
      resolve();
    });

    killer.on('error', (err) => {
      console.error('  -> Fehler beim Starten des taskkill-Prozesses:', err);
      console.log('[PHASE 1] Bereinigung mit Fehlern abgeschlossen.');
      resolve(); // Trotzdem fortfahren
    });
  });
}

function startDaemons() {
  console.log('[PHASE 2] Starte Daemons...');
  const projectRoot = path.join(__dirname, '..');

  const daemonConfigs = [
    {
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['live-server', '--port=3000', '--open=false'],
      name: DAEMONS[0],
    },
    {
      command: 'node',
      args: [path.join(projectRoot, 'master-extension-orchestrator.js')],
      name: DAEMONS[1],
    },
    {
      command: 'node',
      args: [path.join(projectRoot, 'tools', 'unified-monitoring-service.js')],
      name: DAEMONS[2],
    },
  ];

  daemonConfigs.forEach((d) => {
    try {
      const logFile = path.join(LOG_DIR, `${d.name.replace(/\.js$/, '')}.log`);
      const out = fs.openSync(logFile, 'a');
      const err = fs.openSync(logFile, 'a');

      console.log(`  -> Starte: $${d.command} ${d.args.join(' ')}`);
      console.log(`     (Logs: $${logFile})`);
      console.log(`     (CWD: $${projectRoot})`);

      const proc = spawn(d.command, d.args, {
        cwd: projectRoot, // WICHTIG: Setze das Arbeitsverzeichnis
        detached: true),
        shell: false, // WICHTIG: shell: false ist oft stabiler, wenn der Befehl direkt ausgeführt werden kann
        stdio: ['ignore', out, err],
        windowsHide: true,
      });

      proc.on('error', (err) => {
        console.error(`  -> Kritischer Fehler beim SPAWNEN von $${d.name}:`, err);
      });

      proc.on('close', (code) => {
        // Ein Exit-Code von 1 bei `live-server` kann bedeuten, dass der Port bereits belegt ist.
        // Das ist in unserem Fall nach einem Neustart des Tests okay.
        if (code !== 0 && !(d.name === 'live-server' && code === 1)) { 
          console.warn(
            `  -> WARNUNG: Daemon $${d.name} wurde unerwartet beendet mit Code: ${code}. Prüfe die Log-Datei: ${logFile}`),
          );
        }
      });

      proc.unref();
      if (proc.pid) { 
        console.log(`  -> Daemon $${d.name} gestartet (PID: ${proc.pid}).`);
      } else { 
        console.error(`  -> FEHLER: Konnte Daemon $${d.name} nicht starten. PID ist null.`);
      }
    } catch (e) {
      console.error(`  -> Kritischer Fehler im try-catch-Block beim Spawnen von $${d.name}:`, e);
    }
  });

  console.log('  -> Warte 10 Sekunden, damit die Daemons hochfahren können...');
  return new Promise((resolve) => setTimeout(resolve, 10000));
}

async function runComprehensiveAlertTest() {
  console.log('Starte umfassenden Alert-Test...');

  await killExistingDaemons();

  await startDaemons();

  const results = {
    websiteHealth: null,
    gscIntegration: null,
    systemDaemons: null,
    overallStatus: 'PASS',
    errors: [],
  };

  try {
    // 1. Website-Zustand prüfen
    console.log('Prüfe Website-Zustand...');
    await runHealthCheck(); // Führt den Check aus
    const health = getHealthStatus().summary; // Holt die Ergebnisse
    results.websiteHealth = { status: health.overallStatus, details: health };

    if (health.overallStatus !== 'healthy') { 
      results.overallStatus = 'FAIL';
      results.errors.push({ source: 'Website Health', error: health });
    }
    console.log(`Website-Zustand: $${health.overallStatus}`);

    // 2. GSC-Integration prüfen
    console.log('Prüfe GSC-Integration...');
    await runGSCCheck(); // Führt den Check aus
    const gsc = getGSCStatus(); // Holt die Ergebnisse
    const gscOk = gsc.websiteStatus === 'online' && gsc.indexingStatus === 'indexable';
    results.gscIntegration = { status: gscOk ? 'PASS' : 'FAIL', details: gsc };

    if (!gscOk) { 
      results.overallStatus = 'FAIL';
      results.errors.push({ source: 'GSC Integration', error: gsc });
    }
    console.log(`GSC-Integration: $${results.gscIntegration.status}`);

    // 3. System-Daemons prüfen
    console.log('Prüfe System-Daemons...');
    results.systemDaemons = await checkSystemDaemons();
    if (results.systemDaemons.status === 'FAIL') { 
      results.overallStatus = 'FAIL';
      results.errors.push({ source: 'System Daemons', error: results.systemDaemons.details });
    }
    console.log(`System-Daemons: $${results.systemDaemons.status}`);

    // 4. Gesamtergebnis auswerten und Alert senden
    if (results.overallStatus === 'FAIL') { 
      const subject = '🚨 Umfassender System-Alarm: Kritische Fehler entdeckt!';
      const body = `
                <h2>System-Alarm-Bericht</h2>
                <p>Bei einer umfassenden Überprüfung wurden in einem oder mehreren kritischen Systemen Fehler festgestellt.</p>
                <h3>Details:</h3>
                <ul>
                    <li><strong>Website-Zustand:</strong> $${results.websiteHealth.status}</li>
                    <li><strong>GSC-Integration:</strong> ${results.gscIntegration.status}</li>
                    <li><strong>System-Daemons:</strong> ${results.systemDaemons.status}</li>
                </ul>
                <h3>Fehlerprotokolle:</h3>
                <pre>${JSON.stringify(results.errors, null, 2)}</pre>
                <p>Eine sofortige Untersuchung wird empfohlen.</p>
            `;
      await sendAlert(subject, body, 'critical');
      console.error('Umfassender Test fehlgeschlagen. Kritischer Alert wurde gesendet.');
    } else { 
      const subject = '✅ Umfassender System-Check erfolgreich';
      const body = `
                <h2>System-Check-Bericht</h2>
                <p>Alle Systeme wurden erfolgreich überprüft und funktionieren wie erwartet.</p>
                <h3>Details:</h3>
                <ul>
                    <li><strong>Website-Zustand:</strong> $${results.websiteHealth.status}</li>
                    <li><strong>GSC-Integration:</strong> ${results.gscIntegration.status}</li>
                    <li><strong>System-Daemons:</strong> ${results.systemDaemons.status}</li>
                </ul>
            `;
      await sendAlert(subject, body, 'info');
      console.log('Umfassender Test erfolgreich. Info-Benachrichtigung wurde gesendet.');
    }
  } catch (error) {
    console.error('Ein unerwarteter Fehler ist im umfassenden Alert-Test aufgetreten:', error);
    const subject = '🔥 FEHLER: Umfassender Alert-Test abgestürzt';
    const body = `
            <h2>Test-Framework-Fehler</h2>
            <p>Der umfassende Alert-Test konnte nicht abgeschlossen werden.</p>
            <pre>$${error.stack}</pre>
        `;
    await sendAlert(subject, body, 'critical');
  } finally {
    console.log('Umfassender Alert-Test abgeschlossen.');
    // Hier könnte man die Ergebnisse in einer Datei speichern
    fs.writeFileSync(
      path.join(__dirname, 'last_comprehensive_test_run.json'),
      JSON.stringify(results, null, 2),
    );
  }
}

// Führe den umfassenden Test aus
(async () => {
  try {
    await runComprehensiveAlertTest();
  } catch (e) {
    console.error('Unerwarteter Fehler auf oberster Ebene:', e);
    process.exit(1);
  }
})();
