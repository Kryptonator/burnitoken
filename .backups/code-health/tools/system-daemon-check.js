const { exec } = require('child_process');
const os = require('os');

// Liste der zu überwachenden System-Daemons (Beispiel)
const DAEMONS = [
  'live-server', // Beispiel: Live-Vorschau-Server
  'master-extension-orchestrator.js', // Beispiel: Ein wichtiger Hintergrundprozess
  'unified-monitoring-service.js', // Beispiel: Der Hauptüberwachungsdienst
];

function getProcessListCommand() {
  switch (os.platform()) {
    case 'win32':
      // /v für ausführliche Infos, /fo csv für einfache Analyse
      return 'tasklist /v /fo csv';
    case 'darwin':
      // Zeigt den vollständigen Befehl an
      return 'ps -ax -o command';
    case 'linux':
      return 'ps -ax -o command';
    default:
      // Fallback für andere Unix-ähnliche Systeme
      return 'ps -ax -o command';
  }
}

async function checkSystemDaemons() {
  console.log('Überprüfe System-Daemon-Status mit nativen Befehlen...');
  const status = {
    running: [],
    stopped: [],
    details: [],
    status: 'PASS',
  };

  const command = getProcessListCommand();

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Fehler beim Ausführen von "${command}":`, stderr);
        status.status = 'FAIL';
        status.details.push({
          daemon: 'ALL',
          status: 'STOPPED',
          error: `Fehler beim Abrufen der Prozessliste: ${stderr}`,
        });
        DAEMONS.forEach((d) => status.stopped.push(d));
        resolve(status);
        return;
      }

      // stdout zeilenweise aufteilen und Header überspringen
      const lines = stdout.trim().split(/\r?\n/).slice(1);

      for (const daemon of DAEMONS) {
        const daemonLower = daemon.toLowerCase();
        // Überprüft, ob eine der Zeilen den Daemon-Namen enthält.
        const isRunning = lines.some((line) => line.toLowerCase().includes(daemonLower));

        if (isRunning) {
          status.running.push(daemon);
          status.details.push({ daemon, status: 'RUNNING' });
          console.log(`✅ ${daemon} läuft.`);
        } else {
          status.stopped.push(daemon);
          status.details.push({
            daemon,
            status: 'STOPPED',
            error: 'Prozess nicht in der Taskliste gefunden',
          });
          console.error(`❌ ${daemon} läuft NICHT.`);
        }
      }

      if (status.stopped.length > 0) {
        status.status = 'FAIL';
      }

      console.log(`Daemon-Check abgeschlossen. Status: ${status.status}`);
      resolve(status);
    });
  });
}

module.exports = { checkSystemDaemons, DAEMONS };
