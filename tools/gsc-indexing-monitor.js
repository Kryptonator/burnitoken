/**
 * Google Search Console Indexierungsmonitor
 * Überwacht und behebt Indexierungsprobleme für burnitoken.website
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk'); // Falls nicht installiert: npm install chalk

console.log(chalk.blue('🔍 Google Search Console - Indexierungsmonitor startet'));

// Konfiguration
const websiteUrl = 'https://burnitoken.website';
const htmlFiles = [];
const indexingIssues = [];

// HTML-Dateien im Projekt finden
function scanForHtmlFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      
      if (fs.statSync(fullPath).isDirectory() && !fullPath.includes('node_modules')) {
        scanForHtmlFiles(fullPath);
      } else if (file.endsWith('.html') || file.endsWith('.htm')) {
        htmlFiles.push(fullPath);
      }
    });
  } catch (err) {
    console.error(chalk.red(`Fehler beim Scannen von ${dir}:`), err);
  }
}

// Nach Indexierungsproblemen suchen
function checkForIndexingIssues() {
  console.log(chalk.yellow(`Überprüfe ${htmlFiles.length} HTML-Dateien auf Indexierungsprobleme...`));
  
  htmlFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Suche nach noindex-Tags
      if (content.match(/<meta[^>]*noindex/i)) {
        indexingIssues.push({
          file,
          type: 'noindex',
          content: content.match(/<meta[^>]*noindex[^>]*>/i)[0]
        });
      }
      
      // Suche nach robots.txt-Disallow
      if (file.includes('robots.txt') && content.match(/Disallow:/i)) {
        indexingIssues.push({
          file,
          type: 'robots-disallow',
          content: content.match(/Disallow:[^\n]*/i)[0]
        });
      }
    } catch (err) {
      console.error(chalk.red(`Fehler beim Überprüfen von ${file}:`), err);
    }
  });
}

// Indexierungsprobleme melden und beheben
function fixIndexingIssues() {
  if (indexingIssues.length === 0) {
    console.log(chalk.green('✓ Keine Indexierungsprobleme gefunden!'));
    return;
  }
  
  console.log(chalk.red(`⚠️  ${indexingIssues.length} Indexierungsprobleme gefunden:`));
  
  indexingIssues.forEach((issue, index) => {
    console.log(chalk.yellow(`\nProblem ${index+1}:`));
    console.log(`Datei: ${issue.file}`);
    console.log(`Typ: ${issue.type}`);
    console.log(`Problematischer Inhalt: ${issue.content}`);
    
    // Automatische Behebung
    try {
      let content = fs.readFileSync(issue.file, 'utf8');
      
      if (issue.type === 'noindex') {
        content = content.replace(/<meta[^>]*noindex[^>]*>/i, '<!-- INDEXIERUNG AKTIVIERT -->');
      } else if (issue.type === 'robots-disallow') {
        content = content.replace(/Disallow:[^\n]*/i, '# Disallow deaktiviert - Alle Seiten indexieren lassen');
      }
      
      fs.writeFileSync(issue.file, content, 'utf8');
      console.log(chalk.green('✓ Problem automatisch behoben!'));
    } catch (err) {
      console.error(chalk.red('Fehler bei der automatischen Behebung:'), err);
    }
  });
}

// Hauptfunktion
async function main() {
  console.log(chalk.blue(`🌐 Überprüfe Website: ${websiteUrl}`));
  
  // Arbeitsverzeichnis scannen
  scanForHtmlFiles('.');
  console.log(chalk.blue(`🗂️ ${htmlFiles.length} HTML-Dateien gefunden`));
  
  // Nach Problemen suchen und beheben
  checkForIndexingIssues();
  fixIndexingIssues();
  
  console.log(chalk.green('\n✅ GSC Indexierungsmonitor abgeschlossen'));
  
  // Status
  if (indexingIssues.length > 0) {
    console.log(chalk.yellow(`\n⚠️ Es wurden ${indexingIssues.length} Probleme gefunden und behoben.`));
    console.log(chalk.yellow('Bitte prüfen Sie die Google Search Console, um den Indexierungsstatus zu überwachen.'));
    console.log(chalk.blue('https://search.google.com/search-console'));
  } else {
    console.log(chalk.green('\n🎉 Alle Dateien sind für die Indexierung optimiert!'));
  }
}

// Programm starten
main().catch(err => {
  console.error(chalk.red('Fehler im Hauptprogramm:'), err);
});
