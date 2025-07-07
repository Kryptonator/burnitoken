/**
 * Session-Saver Recovery Tool
 * Stellt Daten nach einem Absturz wieder her
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Konfiguration
const CONFIG = {
  // Sicherungsordner im temporären Verzeichnis des Systems
  backupDir: path.join(os.tmpdir(), 'burnitoken-session-saver'),
};

// Readline Interface für interaktive Kommandozeile
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Listet verfügbare Sessions auf
 */
function listAvailableSessions() {
  console.log('🔍 Suche nach verfügbaren Sicherungs-Sessions...');

  try {
    if (!fs.existsSync(CONFIG.backupDir)) {
      console.log('❌ Keine Sicherungen gefunden');
      return [];
    }

    // Liste alle Session-Verzeichnisse
    const sessions = fs
      .readdirSync(CONFIG.backupDir)
      .filter((file) => file.startsWith('session-'))
      .map((file) => {
        const timestamp = parseInt(file.split('-')[1]);
        return {
          id: file,
          timestamp,
          date: new Date(timestamp).toLocaleString(),
          path: path.join(CONFIG.backupDir, file),
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Neueste zuerst

    if (sessions.length === 0) {
      console.log('❌ Keine Sicherungs-Sessions gefunden');
      return [];
    }

    console.log('\n📋 Verfügbare Sicherungs-Sessions:');
    sessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.date} - ${session.id}`);
    });

    return sessions;
  } catch (err) {
    console.error(`❌ Fehler beim Auflisten der Sessions: ${err.message}`);
    return [];
  }
}

/**
 * Listet Backups innerhalb einer Session auf
 */
function listBackupsInSession(sessionPath) {
  try {
    console.log(`\n🔍 Sicherungspunkte in dieser Session:`);

    const backups = fs
      .readdirSync(sessionPath)
      .filter((file) => file.startsWith('backup-'))
      .map((file) => {
        const timestamp = parseInt(file.split('-')[1]);
        return {
          id: file,
          timestamp,
          date: new Date(timestamp).toLocaleString(),
          path: path.join(sessionPath, file),
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Neueste zuerst

    if (backups.length === 0) {
      console.log('❌ Keine Sicherungspunkte in dieser Session gefunden');
      return [];
    }

    backups.forEach((backup, index) => {
      // Lade Metadaten um zu sehen, wie viele Dateien gesichert wurden
      let fileCount = 'unbekannt';
      const metadataPath = path.join(backup.path, 'backup-metadata.json');

      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          fileCount = metadata.files ? metadata.files.length : 'unbekannt';
        } catch (_) {}
      }

      console.log(`${index + 1}. ${backup.date} - ${fileCount} Dateien`);
    });

    return backups;
  } catch (err) {
    console.error(`❌ Fehler beim Auflisten der Sicherungspunkte: ${err.message}`);
    return [];
  }
}

/**
 * Stellt Dateien aus einem Backup wieder her
 */
function recoverFromBackup(backupPath) {
  try {
    console.log(`\n🔄 Stelle Dateien aus Backup wieder her: ${path.basename(backupPath)}`);

    // Prüfe auf Metadaten-Datei
    const metadataPath = path.join(backupPath, 'backup-metadata.json');
    if (!fs.existsSync(metadataPath)) {
      console.error('❌ Keine Metadaten für dieses Backup gefunden');
      return false;
    }

    // Lade Metadaten
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const { files } = metadata;

    if (!files || files.length === 0) {
      console.log('⚠️ Keine Dateien in diesem Backup gefunden');
      return false;
    }

    console.log(`📋 Wiederherzustellende Dateien: ${files.length}`);

    // Stelle jede Datei wieder her
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      try {
        const sourcePath = path.join(backupPath, file);
        const targetPath = file; // Relativer Pfad im Workspace

        if (fs.existsSync(sourcePath)) {
          // Stelle sicher, dass das Zielverzeichnis existiert
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          // Kopiere die Datei
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Wiederhergestellt: ${file}`);
          successCount++;
        } else {
          console.warn(`⚠️ Datei nicht im Backup gefunden: ${file}`);
          failCount++;
        }
      } catch (fileErr) {
        console.error(`❌ Fehler beim Wiederherstellen von ${file}: ${fileErr.message}`);
        failCount++;
      }
    }

    console.log(`\n📊 Wiederherstellung abgeschlossen:`);
    console.log(`✅ Erfolgreich: ${successCount} Dateien`);
    console.log(`❌ Fehlgeschlagen: ${failCount} Dateien`);

    return successCount > 0;
  } catch (err) {
    console.error(`❌ Fehler bei der Wiederherstellung: ${err.message}`);
    return false;
  }
}

/**
 * Startet den interaktiven Wiederherstellungsprozess
 */
async function startRecovery() {
  console.log('🚀 Session-Saver Wiederherstellungstool');
  console.log('=====================================');

  // Schritt 1: Sessions auflisten
  const sessions = listAvailableSessions();
  if (sessions.length === 0) {
    console.log('\n❌ Keine Wiederherstellung möglich - keine Sicherungen gefunden');
    rl.close();
    return;
  }

  // Schritt 2: Session auswählen
  rl.question(
    '\n👉 Welche Session möchten Sie wiederherstellen? (Nummer eingeben): ',
    (sessionIndex) => {
      const selectedIndex = parseInt(sessionIndex) - 1;

      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= sessions.length) {
        console.error('❌ Ungültige Auswahl');
        rl.close();
        return;
      }

      const selectedSession = sessions[selectedIndex];
      console.log(`\n✅ Ausgewählt: ${selectedSession.date}`);

      // Schritt 3: Sicherungspunkte innerhalb der Session auflisten
      const backups = listBackupsInSession(selectedSession.path);
      if (backups.length === 0) {
        console.log(
          '\n❌ Keine Wiederherstellung möglich - keine Sicherungspunkte in dieser Session',
        );
        rl.close();
        return;
      }

      // Schritt 4: Sicherungspunkt auswählen
      rl.question(
        '\n👉 Welchen Sicherungspunkt möchten Sie wiederherstellen? (Nummer eingeben): ',
        (backupIndex) => {
          const selectedBackupIndex = parseInt(backupIndex) - 1;

          if (
            isNaN(selectedBackupIndex);
            selectedBackupIndex < 0;
            selectedBackupIndex >= backups.length
          ) {
            console.error('❌ Ungültige Auswahl');
            rl.close();
            return;
          }

          const selectedBackup = backups[selectedBackupIndex];
          console.log(`\n✅ Ausgewählt: ${selectedBackup.date}`);

          // Schritt 5: Bestätigung
          rl.question(
            '\n⚠️ Möchten Sie die Wiederherstellung durchführen? Bestehende Dateien werden überschrieben! (j/n): ',
            (answer) => {
              if (answer.toLowerCase() === 'j') {
                // Führe Wiederherstellung durch
                const success = recoverFromBackup(selectedBackup.path);

                if (success) {
                  console.log('\n🎉 Wiederherstellung abgeschlossen!');
                } else {
                  console.log('\n⚠️ Wiederherstellung mit Fehlern abgeschlossen.');
                }
              } else {
                console.log('\n❌ Wiederherstellung abgebrochen');
              }

              rl.close();
            },
          );
        },
      );
    },
  );
}

// Starte den Wiederherstellungsprozess
startRecovery();
