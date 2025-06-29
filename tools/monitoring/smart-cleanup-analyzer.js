/**
 * 🧠 SMART CLEANUP - INTELLIGENTE DATEI-SORTIERUNG
 * Analysiert alle 105 Dateien und kategorisiert sie automatisch
 */

const fs = require('fs');
const path = require('path');

async function smartFileAnalysis() {
  console.log('🧠 SMART CLEANUP GESTARTET');
  console.log('===========================');

  // Kategorien definieren
  const categories = {
    ESSENTIAL: [], // Wichtige Tools/Scripts - BEHALTEN
    DOCUMENTATION: [], // Wertvolle Dokumentation - BEHALTEN
    ARCHIVE: [], // Experimentell/Backup - ARCHIVIEREN
    DELETE: [], // Redundant/Temporär - LÖSCHEN
  };

  // Datei-Patterns für Kategorisierung
  const patterns = {
    // ESSENTIAL: Wichtige Scripts und Tools
    essential: [
      /performance.*\.js$/,
      /security.*\.js$/,
      /test.*\.js$/,
      /optimization.*\.js$/,
      /deployment.*\.(js|bat|ps1)$/,
      /github.*\.(js|bat|ps1)$/,
      /quality.*\.js$/,
      /comprehensive.*\.js$/,
    ],

    // DOCUMENTATION: Wichtige Dokumentation
    documentation: [
      /README/i,
      /GUIDE/i,
      /SETUP/i,
      /IMPLEMENTATION/i,
      /OPTIMIZATION/i,
      /BROWSER.*COMPATIBILITY/i,
      /DEPLOYMENT/i,
      /CUSTOM.*DOMAIN/i,
      /FINAL.*REPORT/i,
    ],

    // DELETE: Definitiv unnötig
    delete: [
      /test-minimal\.html$/,
      /debug.*\.js$/,
      /temp.*\./,
      /backup.*\./,
      /old.*\./,
      /duplicate.*\./,
      /\.tmp$/,
      /check-deployment\.bat$/,
    ],

    // ARCHIVE: Experimentell, aber interessant
    archive: [
      /advanced.*\.js$/,
      /experimental.*\.js$/,
      /ai-.*\.js$/,
      /ultra.*\.js$/,
      /dashboard.*\.html$/,
      /\.py$/,
    ],
  };

  try {
    // Alle untracked Files holen
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const { stdout } = await execAsync('git ls-files --others --exclude-standard');
    const files = stdout
      .trim()
      .split('\n')
      .filter((f) => f.length > 0);

    console.log(`📁 Analysiere ${files.length} Dateien...`);

    // Jede Datei kategorisieren
    for (const file of files) {
      const fileName = path.basename(file);
      const filePath = file;

      let categorized = false;

      // ESSENTIAL prüfen
      for (const pattern of patterns.essential) {
        if (pattern.test(fileName) || pattern.test(filePath)) {
          categories.ESSENTIAL.push(file);
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        // DELETE prüfen
        for (const pattern of patterns.delete) {
          if (pattern.test(fileName) || pattern.test(filePath)) {
            categories.DELETE.push(file);
            categorized = true;
            break;
          }
        }
      }

      if (!categorized) {
        // DOCUMENTATION prüfen
        for (const pattern of patterns.documentation) {
          if (pattern.test(fileName) || pattern.test(filePath)) {
            categories.DOCUMENTATION.push(file);
            categorized = true;
            break;
          }
        }
      }

      if (!categorized) {
        // ARCHIVE prüfen
        for (const pattern of patterns.archive) {
          if (pattern.test(fileName) || pattern.test(filePath)) {
            categories.ARCHIVE.push(file);
            categorized = true;
            break;
          }
        }
      }

      // Fallback: Unbekannte Dateien nach Extension
      if (!categorized) {
        if (fileName.endsWith('.md')) {
          categories.DOCUMENTATION.push(file);
        } else if (fileName.endsWith('.js')) {
          categories.ARCHIVE.push(file);
        } else {
          categories.DELETE.push(file);
        }
      }
    }

    // Ergebnisse ausgeben
    console.log('\n📊 KATEGORISIERUNG ABGESCHLOSSEN:');
    console.log('===================================');
    console.log(`✅ ESSENTIAL (behalten): ${categories.ESSENTIAL.length} Dateien`);
    console.log(`📋 DOCUMENTATION (behalten): ${categories.DOCUMENTATION.length} Dateien`);
    console.log(`📦 ARCHIVE (verschieben): ${categories.ARCHIVE.length} Dateien`);
    console.log(`🗑️ DELETE (löschen): ${categories.DELETE.length} Dateien`);

    // Detaillierte Listen erstellen
    let report = `# 🧠 SMART CLEANUP ANALYSE\n\n`;
    report += `**Zeitstempel:** ${new Date().toISOString()}\n`;
    report += `**Analysierte Dateien:** ${files.length}\n\n`;

    report += `## ✅ ESSENTIAL - BEHALTEN (${categories.ESSENTIAL.length})\n`;
    report += `*Wichtige Tools, Scripts und Funktionalitäten*\n\n`;
    categories.ESSENTIAL.forEach((file) => (report += `- ${file}\n`));

    report += `\n## 📋 DOCUMENTATION - BEHALTEN (${categories.DOCUMENTATION.length})\n`;
    report += `*Wertvolle Dokumentation und Guides*\n\n`;
    categories.DOCUMENTATION.forEach((file) => (report += `- ${file}\n`));

    report += `\n## 📦 ARCHIVE - VERSCHIEBEN (${categories.ARCHIVE.length})\n`;
    report += `*Experimentelle Features und Alternative Implementierungen*\n\n`;
    categories.ARCHIVE.forEach((file) => (report += `- ${file}\n`));

    report += `\n## 🗑️ DELETE - LÖSCHEN (${categories.DELETE.length})\n`;
    report += `*Redundante, temporäre oder veraltete Dateien*\n\n`;
    categories.DELETE.forEach((file) => (report += `- ${file}\n`));

    report += `\n## 🎯 NÄCHSTE SCHRITTE:\n`;
    report += `1. ✅ Essential & Documentation zu Git hinzufügen\n`;
    report += `2. 📦 Archive-Ordner erstellen und Dateien verschieben\n`;
    report += `3. 🗑️ Delete-Dateien entfernen\n`;
    report += `4. 📝 Cleanup-Commit erstellen\n`;

    // Report speichern
    fs.writeFileSync('SMART_CLEANUP_ANALYSIS.md', report, 'utf8');

    console.log('\n✅ Analyse gespeichert in: SMART_CLEANUP_ANALYSIS.md');
    console.log('\n🎯 BEREIT FÜR AUTOMATISCHE AUSFÜHRUNG!');

    return categories;
  } catch (error) {
    console.error('❌ Fehler bei der Analyse:', error.message);
    return null;
  }
}

// Analyse starten
smartFileAnalysis().catch(console.error);
