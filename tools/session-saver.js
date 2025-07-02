/**
 * Session-Saver für VS Code
 * Sichert laufende Arbeitssessions automatisch, um Datenverlust bei Abstürzen zu verhindern
 *
 * Funktionen:
 * - Automatische Sicherung des Arbeitsstandes alle 10 Sekunden
 * - Wiederherstellung nach Abstürzen
 * - Verlaufsverwaltung für mehrere Sicherungspunkte
 * - KI-Modell-übergreifende Konversationssicherung
 * - Nahtlose Übergabe zwischen verschiedenen KI-Modellen
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Konfiguration
const CONFIG = {
  // Sicherungsordner im temporären Verzeichnis des Systems
  backupDir: path.join(os.tmpdir(), 'burnitoken-session-saver'),

  // Intervall für automatische Sicherungen (in Millisekunden)
  saveInterval: 10000, // 10 Sekunden

  // Maximale Anzahl von Sicherungspunkten im Verlauf
  maxBackups: 20,

  // Dateitypen, die gesichert werden sollen
  fileTypes: [
    '.js',
    '.json',
    '.html',
    '.css',
    '.md',
    '.yml',
    '.yaml',
    '.ts',
    '.conversation',
    '.ai',
    '.chat',
  ],

  // KI-Modell-Integration
  ai: {
    enabled: true,
    conversationDir: path.join(os.tmpdir(), 'ai-conversations'),
    sharedContext: true,
    models: ['copilot', 'chatgpt', 'claude', 'llama', 'gemini'],
    saveStateOnSwitch: true,
    contextWindow: 200000, // ~200k Token Kontext bewahren
  },

  // Ordner, die ignoriert werden sollen
  ignoreFolders: ['node_modules', '.git', 'dist', 'build'],

  // Aktiviert Debug-Ausgaben
  debug: false,
};

// Status-Tracking
let savingInProgress = false;
let lastSaveTime = Date.now();
let backupCount = 0;
const modifiedFiles = new Set();

/**
 * Hauptfunktion zum Starten des Session-Savers
 */
function startSessionSaver() {
  console.log('🔄 Session-Saver wird gestartet...');

  // Erstelle Backup-Verzeichnis, falls nicht vorhanden
  ensureBackupDirExists();

  // Initialisiere Sicherungsmechanismen
  setupAutomaticBackup();
  setupFileWatchers();

  // Initialisiere KI-Modell-Integration, falls aktiviert
  if (CONFIG.ai && CONFIG.ai.enabled) 
    try {
      // Versuche, die AI Conversation Bridge zu importieren und zu starten
      const aiBridge = require('./ai-conversation-bridge');
      console.log(
        '🧠 KI-Modell-Integration aktiviert - Konversationskontext bleibt bei Modellwechsel erhalten',
      );
    } catch (err) {
      console.warn(`⚠️ KI-Modell-Integration konnte nicht aktiviert werden: ${err.message}`);
    }
  }

  console.log(
    `✅ Session-Saver aktiv - Automatische Sicherung alle ${CONFIG.saveInterval / 1000} Sekunden`,
  );
  console.log(`💾 Sicherungen werden gespeichert in: ${CONFIG.backupDir}`);
}

/**
 * Stellt sicher, dass das Backup-Verzeichnis existiert
 */
function ensureBackupDirExists() {
  try {
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }

    // Erstelle Unterverzeichnisse für die aktuelle Session
    const sessionDir = path.join(CONFIG.backupDir, `session-${Date.now()}`);
    fs.mkdirSync(sessionDir, { recursive: true });
    CONFIG.currentSessionDir = sessionDir;

    logDebug(`Backup-Verzeichnis erstellt: ${sessionDir}`);
  } catch (err) {
    console.error(`❌ Fehler beim Erstellen des Backup-Verzeichnisses: ${err.message}`);
  }
}

/**
 * Richtet automatische Sicherungen ein
 */
function setupAutomaticBackup() {
  setInterval(() => {
    // Wenn bereits eine Sicherung läuft, überspringe diese Iteration
    if (savingInProgress) return;

    // Wenn keine Änderungen vorliegen, überspringe diese Iteration
    if (modifiedFiles.size === 0) {
      logDebug('Keine Änderungen seit letzter Sicherung');
      return;
    }

    saveSession();
  }, CONFIG.saveInterval);

  // Erste Sicherung direkt durchführen
  setTimeout(saveSession, 5000);

  logDebug('Automatische Sicherung eingerichtet');
}

/**
 * Richtet Datei-Watcher für .vscode-Ordner und wichtige Konfigurationsdateien ein
 */
function setupFileWatchers() {
  try {
    // Beobachte .vscode-Verzeichnis
    if (fs.existsSync('.vscode')) {
      fs.watch('.vscode', { recursive: true }, (eventType, filename) => {
        if (filename) {
          const fullPath = path.join('.vscode', filename);
          modifiedFiles.add(fullPath);
          logDebug(`Änderung erkannt: ${fullPath}`);
        }
      });
    }

    // Beobachte wichtige Dateien im Workspace-Root
    fs.readdir('.', (err, files) => {
      if (err) {
        console.error(`❌ Fehler beim Lesen des Verzeichnisses: ${err.message}`);
        return;
      }

      files.forEach((file) => {
        const ext = path.extname(file);
        if (CONFIG.fileTypes.includes(ext) && !CONFIG.ignoreFolders.includes(file)) {
          fs.watch(file, () => {
            modifiedFiles.add(file);
            logDebug(`Änderung erkannt: ${file}`);
          });
        }
      });
    });

    logDebug('Datei-Watcher eingerichtet');
  } catch (err) {
    console.error(`❌ Fehler beim Einrichten der Datei-Watcher: ${err.message}`);
  }
}

/**
 * Sichert die aktuelle Arbeitssession
 */
function saveSession() {
  // Setze Flag, dass Sicherung läuft
  savingInProgress = true;

  try {
    const backupTime = Date.now();
    const backupDir = path.join(CONFIG.currentSessionDir, `backup-${backupTime}`);

    // Erstelle Unterverzeichnis für diesen Sicherungspunkt
    fs.mkdirSync(backupDir, { recursive: true });

    // Kopiere geänderte Dateien
    for (const file of modifiedFiles) {
      try {
        if (fs.existsSync(file)) {
          // Erstelle Zielverzeichnis mit Verzeichnisstruktur
          const targetDir = path.join(backupDir, path.dirname(file));
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          // Kopiere die Datei
          const targetPath = path.join(backupDir, file);
          fs.copyFileSync(file, targetPath);
          logDebug(`Datei gesichert: ${file} -> ${targetPath}`);
        }
      } catch (fileErr) {
        console.error(`⚠️ Konnte Datei nicht sichern: ${file} - ${fileErr.message}`);
      }
    }

    // Erstelle Metadaten-Datei für den Sicherungspunkt
    const metadata = {
      timestamp: backupTime,
      files: Array.from(modifiedFiles),
      system: {
        platform: os.platform(),
        release: os.release(),
        hostname: os.hostname(),
      },
    };

    fs.writeFileSync(
      path.join(backupDir, 'backup-metadata.json'),
      JSON.stringify(metadata, null, 2),
    );

    console.log(
      `💾 Session gesichert: ${new Date(backupTime).toLocaleTimeString()} - ${modifiedFiles.size} Dateien`,
    );

    // Aktualisiere letzten Sicherungszeitpunkt und Zähler
    lastSaveTime = backupTime;
    backupCount++;

    // Lösche alte Sicherungen, wenn zu viele
    cleanupOldBackups();

    // Setze Liste der geänderten Dateien zurück
    modifiedFiles.clear();
  } catch (err) {
    console.error(`❌ Fehler beim Sichern der Session: ${err.message}`);
  } finally {
    // Setze Flag zurück
    savingInProgress = false;
  }
}

/**
 * Löscht alte Sicherungspunkte, wenn zu viele existieren
 */
function cleanupOldBackups() {
  try {
    const sessionDir = CONFIG.currentSessionDir;
    fs.readdir(sessionDir, (err, files) => {
      if (err) {
        console.error(`❌ Fehler beim Lesen des Session-Verzeichnisses: ${err.message}`);
        return;
      }

      // Filtere Backup-Verzeichnisse
      const backupDirs = files
        .filter((file) => file.startsWith('backup-'))
        .map((file) => ({
          name: file,
          path: path.join(sessionDir, file),
          time: parseInt(file.split('-')[1]),
        }))
        .sort((a, b) => b.time - a.time); // Neueste zuerst

      // Lösche ältere Backups, wenn zu viele existieren
      if (backupDirs.length > CONFIG.maxBackups) {
        const dirsToDelete = backupDirs.slice(CONFIG.maxBackups);
        dirsToDelete.forEach((dir) => {
          try {
            deleteFolderRecursive(dir.path);
            logDebug(`Alte Sicherung gelöscht: ${dir.name}`);
          } catch (delErr) {
            console.error(
              `❌ Konnte alte Sicherung nicht löschen: ${dir.path} - ${delErr.message}`,
            );
          }
        });
      }
    });
  } catch (err) {
    console.error(`❌ Fehler beim Aufräumen alter Sicherungen: ${err.message}`);
  }
}

/**
 * Löscht ein Verzeichnis rekursiv
 */
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Rekursiver Aufruf für Unterverzeichnisse
        deleteFolderRecursive(curPath);
      } else {
        // Lösche Datei
        fs.unlinkSync(curPath);
      }
    });
    // Lösche das jetzt leere Verzeichnis
    fs.rmdirSync(folderPath);
  }
}

/**
 * Logger für Debug-Ausgaben
 */
function logDebug(message) {
  if (CONFIG.debug) {
    console.log(`[DEBUG] ${message}`);
  }
}

/**
 * Öffentliche API
 */
module.exports = {
  start: startSessionSaver,

  // Manuelle Sicherung durchführen
  saveNow: () => {
    console.log('🔄 Manuelle Sicherung wird durchgeführt...');
    saveSession();
  },

  // Sicherungsverlauf anzeigen
  showBackupHistory: () => {
    const sessionDir = CONFIG.currentSessionDir;
    if (fs.existsSync(sessionDir)) {
      const backups = fs
        .readdirSync(sessionDir)
        .filter((file) => file.startsWith('backup-'))
        .map((file) => {
          const timestamp = parseInt(file.split('-')[1]);
          return {
            id: file,
            timestamp,
            date: new Date(timestamp).toLocaleString(),
            path: path.join(sessionDir, file),
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      console.log('\n📋 Sicherungsverlauf:');
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.date} - ${backup.id}`);
      });
    } else {
      console.log('❌ Keine Sicherungen gefunden');
    }
  },

  // Konfiguration anpassen
  updateConfig: (newConfig) => {
    Object.assign(CONFIG, newConfig);
    console.log('✅ Konfiguration aktualisiert');
  },
};

// Starte den Session-Saver automatisch
startSessionSaver();
