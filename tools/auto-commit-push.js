/**
 * AUTO-COMMIT-PUSH - Automatisches Commit und Push nach Fixes
 * 
 * Dieses Skript führt automatisch einen git commit und push durch,
 * nachdem ein Fix abgeschlossen wurde.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Führt git add, commit und push aus
 * @param {string} fixDescription - Beschreibung des Fixes für die Commit-Message
 * @param {Array<string>} [files=[]] - Optionale Liste von Dateien für selektiven Add
 */
function autoCommitAndPush(fixDescription, files = []) {
  try {
    console.log('🔄 Auto-Commit-Push nach erfolgreicher Fix-Operation starten...');
    
    // Git-Status prüfen
    const gitStatus = execSync('git status --porcelain').toString();
    
    if (!gitStatus.trim()) {
      console.log('✅ Keine Änderungen zum Committen vorhanden.');
      return;
    }
    
    // Entweder bestimmte Dateien oder alles adden
    if (files.length > 0) {
      files.forEach(file => {
        console.log(`📁 Füge Datei hinzu: ${file}`);
        execSync(`git add "${file}"`);
      });
    } else {
      console.log('📁 Füge alle Änderungen hinzu');
      execSync('git add .');
    }
    
    // Commit mit sinnvoller Message erstellen
    const commitMessage = `Fix: ${fixDescription} (Auto-Commit)`;
    console.log(`✍️ Erstelle Commit: "${commitMessage}"`);
    execSync(`git commit -m "${commitMessage}"`);
    
    // Push durchführen
    console.log('🚀 Pushe Änderungen zum Remote-Repository');
    execSync('git push');
    
    console.log('✅ Auto-Commit-Push erfolgreich abgeschlossen!');
    
    // Aktualisiere die Dokumentation über den erfolgten Commit
    updateCommitDocumentation(commitMessage);
    
  } catch (error) {
    console.error('❌ Fehler beim Auto-Commit-Push:', error.message);
    console.log('Bitte führen Sie die Git-Operationen manuell durch.');
  }
}

/**
 * Aktualisiert die COMMIT_SUMMARY.md mit dem neuesten Commit
 * @param {string} commitMessage - Die Commit-Nachricht
 */
function updateCommitDocumentation(commitMessage) {
  const commitFile = path.join(process.cwd(), 'COMMIT_SUMMARY.md');
  const date = new Date().toLocaleString('de-DE');
  
  let content = '';
  if (fs.existsSync(commitFile)) {
    content = fs.readFileSync(commitFile, 'utf8');
  } else {
    content = '# 📝 Zusammenfassung der Commits\n\n';
  }
  
  // Neuen Eintrag hinzufügen
  content = content + `\n## ${date}\n\n- ${commitMessage}\n`;
  
  fs.writeFileSync(commitFile, content);
  console.log(`📄 COMMIT_SUMMARY.md wurde aktualisiert.`);
}

// Wenn das Skript direkt aufgerufen wird
if (require.main === module) {
  const args = process.argv.slice(2);
  const description = args[0] || 'Automatischer Fix-Commit';
  const files = args.slice(1);
  
  autoCommitAndPush(description, files);
}

module.exports = { autoCommitAndPush };
