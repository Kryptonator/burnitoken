/**
 * Auto Screenshot Manager
 *
 * Dieses Tool erstellt automatisch Screenshots des aktuellen Arbeitsbereichs
 * und speichert sie als Backup. Alte Screenshots werden automatisch gelöscht,
 * um Speicherplatz zu sparen.
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  screenshotDir: path.join(__dirname, '..', '.recovery-screenshots'),
  maxScreenshotsToKeep: 120, // Maximal gespeicherte Screenshots (10 Minuten bei 5-Sekunden-Intervall)
  screenshotIntervalSeconds: 5, // Screenshot alle X Sekunden
  maxStorageGB: 1.5, // Maximaler Speicherplatz in GB
  maxAgeMinutes: 60, // Maximales Alter der Screenshots in Minuten
  compressionQuality: 0.8, // Kompressionsrate für Screenshots (0.0-1.0)
  dateFormat: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
};

// Stelle sicher, dass das Screenshot-Verzeichnis existiert
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

/**
 * Zeigt eine formatierte Meldung in der Konsole an
 */
;
  const reset = '\x1b[0m';
  const color = colorCodes[type] || colorCodes.INFO;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp} ${type}]${reset} ${message}`);
}

/**
 * Erstellt einen Screenshot mithilfe von PowerShell
 */
function takeScreenshot() {
  try {
    const timestamp = new Date()
      .toLocaleString('de-DE', CONFIG.dateFormat)
      .replace(/[\/:]/g, '-')
      .replace(/,/g, '')
      .replace(/\s/g, '_');

    const filename = `vscode_recovery_${timestamp}.png`;
    const filePath = path.join(CONFIG.screenshotDir, filename);

    // PowerShell-Befehl zum Erstellen eines Screenshots
    const powershellScript = `
      Add-Type -AssemblyName System.Windows.Forms
      Add-Type -AssemblyName System.Drawing
      $screen = [System.Windows.Forms.SystemInformation]::VirtualScreen
      $bitmap = New-Object System.Drawing.Bitmap $screen.Width, $screen.Height
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $graphics.CopyFromScreen($screen.Left, $screen.Top, 0, 0, $bitmap.Size)
      $bitmap.Save('${filePath.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Png)
      $graphics.Dispose()
      $bitmap.Dispose()
    `;

    // PowerShell ausführen
    execSync('powershell -Command "' + powershellScript.replace(/"/g, '`"') + '"', {
      stdio: 'ignore',
    });

    log(`Screenshot gespeichert: ${filename}`, 'SUCCESS');

    // Alte Screenshots aufräumen
    cleanupOldScreenshots();

    return filePath;
  } catch (error) {
    log(`Fehler beim Erstellen des Screenshots: ${error.message}`, 'ERROR');
    return null;
  }
}

/**
 * Löscht alte Screenshots, um Speicherplatz zu sparen
 */
function cleanupOldScreenshots() {
  try {
    const now = new Date().getTime();
    const maxAgeMs = CONFIG.maxAgeMinutes * 60 * 1000;

    const files = fs
      .readdirSync(CONFIG.screenshotDir)
      .filter((file) => file.endsWith('.png') && file.includes('vscode_recovery_'))
      .map((file) => {
        const filePath = path.join(CONFIG.screenshotDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          time: stats.mtime.getTime(),
          size: stats.size,
          age: now - stats.mtime.getTime(),
        };
      })
      .sort((a, b) => b.time - a.time); // Neueste zuerst

    // 1. Lösche zu alte Screenshots
    const tooOldFiles = files.filter((file) => file.age > maxAgeMs);
    if (tooOldFiles.length > 0) {
      tooOldFiles.forEach((file) => {
        fs.unlinkSync(file.path);
        log(`Zu alter Screenshot gelöscht (>${CONFIG.maxAgeMinutes} Min.): ${file.name}`, 'DEBUG');
      });
    }

    // Aktualisierte Liste nach dem Löschen zu alter Dateien
    const remainingFiles = files.filter((file) => file.age <= maxAgeMs);

    // 2. Lösche überzählige Screenshots, wenn mehr als maxScreenshotsToKeep vorhanden sind
    if (remainingFiles.length > CONFIG.maxScreenshotsToKeep) {
      const filesToDelete = remainingFiles.slice(CONFIG.maxScreenshotsToKeep);
      filesToDelete.forEach((file) => {
        fs.unlinkSync(file.path);
        log(
          `Screenshot gelöscht (über Limit von ${CONFIG.maxScreenshotsToKeep}): ${file.name}`,
          'DEBUG',
        );
      });
    }

    // 3. Überprüfe die Gesamtgröße und lösche ältere Screenshots, wenn das Limit überschritten wird
    const updatedFiles = fs
      .readdirSync(CONFIG.screenshotDir)
      .filter((file) => file.endsWith('.png') && file.includes('vscode_recovery_'))
      .map((file) => ({
        name: file,
        path: path.join(CONFIG.screenshotDir, file),
        time: fs.statSync(path.join(CONFIG.screenshotDir, file)).mtime.getTime(),
        size: fs.statSync(path.join(CONFIG.screenshotDir, file)).size,
      }))
      .sort((a, b) => b.time - a.time); // Neueste zuerst

    const totalSizeInBytes = updatedFiles.reduce((total, file) => total + file.size, 0);
    const totalSizeInGB = totalSizeInBytes / (1024 * 1024 * 1024);

    if (totalSizeInGB > CONFIG.maxStorageGB) {
      log(
        `Speicherplatzgrenze erreicht (${totalSizeInGB.toFixed(2)} GB / ${CONFIG.maxStorageGB} GB)`,
        'WARNING',
      );

      // Lösche ältere Screenshots bis unter das Limit
      let currentSize = totalSizeInBytes;
      let i = updatedFiles.length - 1;

      while (currentSize / (1024 * 1024 * 1024) > CONFIG.maxStorageGB * 0.8 && i >= 0) {
        fs.unlinkSync(updatedFiles[i].path);
        currentSize -= updatedFiles[i].size;
        log(`Screenshot gelöscht wegen Speicherlimit: ${updatedFiles[i].name}`, 'WARNING');
        i--;
      }
    }

    // Log-Informationen zur aktuellen Speichernutzung
    const finalFiles = fs
      .readdirSync(CONFIG.screenshotDir)
      .filter((file) => file.endsWith('.png') && file.includes('vscode_recovery_'));

    const finalSize =
      finalFiles.reduce((total, file) => {
        return total + fs.statSync(path.join(CONFIG.screenshotDir, file)).size;
      }, 0) /
      (1024 * 1024);

    log(`Aktueller Status: ${finalFiles.length} Screenshots, ${finalSize.toFixed(2)} MB`, 'DEBUG');
  } catch (error) {
    log(`Fehler beim Aufräumen alter Screenshots: ${error.message}`, 'ERROR');
  }
}

/**
 * Verarbeitet Kommandozeilenargumente
 */
function parseCommandLineArguments() {
  const args = process.argv.slice(2);
  const options = {
    now: args.includes('--now') || args.includes('-n'),
    silent: args.includes('--silent') || args.includes('-s'),
    intervalSeconds: CONFIG.screenshotIntervalSeconds,
    highFrequency: args.includes('--high-freq') || args.includes('-hf'),
    lowFrequency: args.includes('--low-freq') || args.includes('-lf'),
  };

  // Interval in Sekunden auslesen (--interval=X oder -i=X)
  const intervalArg = args.find((arg) => arg.startsWith('--interval=') || arg.startsWith('-i='));
  if (intervalArg) {
    const intervalValue = intervalArg.split('=')[1];
    if (!isNaN(intervalValue)) {
      options.intervalSeconds = parseInt(intervalValue);
    }
  }

  // High-Frequency Mode (1 Sekunde)
  if (options.highFrequency) {
    options.intervalSeconds = 1;
  }

  // Low-Frequency Mode (30 Sekunden)
  if (options.lowFrequency) {
    options.intervalSeconds = 30;
  }

  return options;
}

/**
 * Startet das Hauptprogramm
 */
function main(options = {}) {
  if (!options.silent) {
    log(`Auto Screenshot Manager gestartet`, 'INFO');
    log(
      `Screenshots werden alle ${options.intervalSeconds || CONFIG.screenshotIntervalSeconds} Sekunden erstellt`,
      'INFO',
    );
    log(`Maximale Anzahl Screenshots: ${CONFIG.maxScreenshotsToKeep}`, 'INFO');
    log(`Maximaler Speicherplatz: ${CONFIG.maxStorageGB} GB`, 'INFO');
    log(`Maximales Alter: ${CONFIG.maxAgeMinutes} Minuten`, 'INFO');
    log(`Speicherort: ${CONFIG.screenshotDir}`, 'INFO');
  }

  // Screenshot sofort erstellen
  takeScreenshot();

  // Regelmäßig Screenshots erstellen, außer im now-Modus
  if (!options.now) {
    const intervalMs = (options.intervalSeconds || CONFIG.screenshotIntervalSeconds) * 1000;
    setInterval(takeScreenshot, intervalMs);

    // Regelmäßig alte Screenshots aufräumen
    const cleanupIntervalMs = Math.max(intervalMs * 10, 30000); // Mindestens alle 30 Sekunden
    setInterval(cleanupOldScreenshots, cleanupIntervalMs);
  }

  return true;
}

// Kommandozeilenargumente verarbeiten
const cliOptions = parseCommandLineArguments();

// Programm starten
if (cliOptions.now) {
  // Nur einmal ausführen und beenden
  takeScreenshot();
} else {
  main(cliOptions);
}
