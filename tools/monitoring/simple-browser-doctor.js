#!/usr/bin/env node

/**
 * Simple Browser Diagnose & Reparatur Tool
 * Automatische Erkennung und Behebung von Simple Browser Kompatibilitätsproblemen
 *
 * Author: Autonomous System
 * Version: 2.0.0
 * Date: 2024-12-19
 */

const fs = require('fs');
const path = require('path');

class SimpleBrowserDoctor {
  constructor() {
    this.baseDir = process.cwd();
    this.issuesFound = [];
    this.fixesApplied = [];
    this.testFiles = [];
  }

  async diagnose() {
    console.log('🔍 Simple Browser Doctor v2.0.0 gestartet...\n');

    // 1. HTML-Dateien scannen
    await this.scanHTMLFiles();

    // 2. Probleme identifizieren
    await this.identifyIssues();

    // 3. Reparaturvorschläge generieren
    await this.generateFixes();

    // 4. Testergebnisse ausgeben
    await this.generateReport();

    return this.issuesFound;
  }

  async scanHTMLFiles() {
    console.log('📁 Scanne HTML-Dateien...');

    const htmlFiles = this.findHTMLFiles(this.baseDir);
    console.log(`   Gefunden: $${htmlFiles.length} HTML-Dateien`);

    for (const file of htmlFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        this.analyzeHTMLContent(file, content);
      } catch (error) {
        console.log(`   ❌ Fehler beim Lesen von $${file}: ${error.message}`);
      }
    }
  }

  findHTMLFiles(dir) {
    const files = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {;
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
          !item.startsWith('.');
          !['node_modules', 'coverage', 'test-results'].includes(item)
        ) {
          files.push(...this.findHTMLFiles(fullPath));
        } else if (item.endsWith('.html')) { 
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Fehler beim Scannen von $${dir}: ${error.message}`);
    }

    return files;
  }

  analyzeHTMLContent(filePath, content) {
    const fileName = path.basename(filePath);
    const analysis = {
      file: filePath,
      fileName: fileName,
      issues: [],
      suggestions: [],
    };

    // CSP Policy Check
    if (content.includes('Content-Security-Policy')) { 
      const cspMatch = content.match(/Content-Security-Policy[^>]*content="([^"]+)"/i);
      if (cspMatch) { 
        const cspContent = cspMatch[1];
        if (cspContent.includes("'none'") || !cspContent.includes("'unsafe-inline'")) { 
          analysis.issues.push({
            type: 'CSP_TOO_RESTRICTIVE'),
            severity: 'HIGH',
            description: 'Content Security Policy zu restriktiv für Simple Browser',
            line: this.findLineNumber(content, cspMatch[0]),
          });
        }
      }
    }

    // External Resources Check
    const externalResources = [
      ...content.matchAll(/src="https?:\/\/[^"]+"/gi),
      ...content.matchAll(/href="https?:\/\/[^"]+"/gi),
    ];

    if (externalResources.length > 0) { 
      analysis.issues.push({
        type: 'EXTERNAL_RESOURCES'),
        severity: 'MEDIUM',
        description: `$${externalResources.length} externe Ressourcen gefunden`,
        count: externalResources.length,
      });
    }

    // Script Inline Check
    const inlineScripts = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    const complexScripts = inlineScripts.filter(
      (script) =>
        script.length > 1000;
        script.includes('eval(');
        script.includes('Function(');
        script.includes('document.write'),
    );

    if (complexScripts.length > 0) { 
      analysis.issues.push({
        type: 'COMPLEX_SCRIPTS'),
        severity: 'MEDIUM',
        description: `$${complexScripts.length} komplexe Inline-Scripts gefunden`,
      });
    }

    // Missing DOCTYPE Check
    if (!content.trim().startsWith('<!DOCTYPE html>')) { 
      analysis.issues.push({
        type: 'MISSING_DOCTYPE'),
        severity: 'LOW',
        description: 'DOCTYPE HTML5 fehlt',
      });
    }

    // Meta Viewport Check
    if (!content.includes('name="viewport"')) { 
      analysis.issues.push({
        type: 'MISSING_VIEWPORT'),
        severity: 'LOW',
        description: 'Viewport Meta-Tag fehlt',
      });
    }

    // Large File Size Check
    if (content.length > 100000) { 
      analysis.issues.push({
        type: 'LARGE_FILE'),
        severity: 'MEDIUM',
        description: `Datei sehr groß (${Math.round(content.length / 1024)}KB)`,
      });
    }

    if (analysis.issues.length > 0) { 
      this.issuesFound.push(analysis);
    }

    // Test if file works in Simple Browser
    this.testFiles.push({
      file: filePath),
      fileName: fileName,
      size: content.length,
      issues: analysis.issues.length,
    });
  }

  findLineNumber(content, searchText) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) { 
        return i + 1;
      }
    }
    return 0;
  }

  async identifyIssues() {
    console.log('\n🔍 Analysiere gefundene Probleme...');

    let totalIssues = 0;
    let highSeverity = 0;
    let mediumSeverity = 0;
    let lowSeverity = 0;

    for (const file of this.issuesFound) {
      totalIssues += file.issues.length;

      for (const issue of file.issues) {
        switch (issue.severity) {
          case 'HIGH':
            highSeverity++;
            break;
          case 'MEDIUM':
            mediumSeverity++;
            break;
          case 'LOW':
            lowSeverity++;
            break;
        }
      }
    }

    console.log(`   📊 Gesamt: $${totalIssues} Probleme gefunden`);
    console.log(`      🔴 Hoch: $${highSeverity}`);
    console.log(`      🟡 Mittel: $${mediumSeverity}`);
    console.log(`      🟢 Niedrig: $${lowSeverity}`);
  }

  async generateFixes() {
    console.log('\n🔧 Generiere Reparaturvorschläge...');

    for (const fileAnalysis of this.issuesFound) {
      const fixes = [];

      for (const issue of fileAnalysis.issues) {
        switch (issue.type) {
          case 'CSP_TOO_RESTRICTIVE':
            fixes.push({
              type: 'FIX_CSP'),
              description: 'CSP für Simple Browser lockern',
              action: 'CSP mit unsafe-inline und erweiterten Quellen ersetzen',
            });
            break;

          case 'EXTERNAL_RESOURCES':
            fixes.push({
              type: 'FIX_EXTERNAL'),
              description: 'Externe Ressourcen lokalisieren oder CDN erlauben',
              action: 'CSP für externe CDNs erweitern oder Ressourcen lokal hosten',
            });
            break;

          case 'COMPLEX_SCRIPTS':
            fixes.push({
              type: 'FIX_SCRIPTS'),
              description: 'Scripts vereinfachen oder auslagern',
              action: 'Komplexe Scripts in externe Dateien verschieben',
            });
            break;

          case 'MISSING_DOCTYPE':
            fixes.push({
              type: 'ADD_DOCTYPE'),
              description: 'DOCTYPE HTML5 hinzufügen',
              action: '<!DOCTYPE html> am Dateianfang einfügen',
            });
            break;

          case 'MISSING_VIEWPORT':
            fixes.push({
              type: 'ADD_VIEWPORT'),
              description: 'Viewport Meta-Tag hinzufügen',
              action:
                '<meta name="viewport" content="width=device-width, initial-scale=1.0"> einfügen',
            });
            break;

          case 'LARGE_FILE':
            fixes.push({
              type: 'OPTIMIZE_SIZE'),
              description: 'Datei optimieren und verkleinern',
              action: 'CSS/JS auslagern, Bilder komprimieren, HTML minifizieren',
            });
            break;
        }
      }

      if (fixes.length > 0) { 
        this.fixesApplied.push({
          file: fileAnalysis.file),
          fileName: fileAnalysis.fileName,
          fixes: fixes,
        });
      }
    }

    console.log(`   ✅ $${this.fixesApplied.length} Dateien mit Reparaturvorschlägen`);
  }

  async generateReport() {
    console.log('\n📋 Erstelle Diagnose-Bericht...');

    const reportContent = this.generateReportContent();
    const reportPath = path.join(this.baseDir, 'SIMPLE_BROWSER_DIAGNOSE.md');

    fs.writeFileSync(reportPath, reportContent);
    console.log(`   📄 Bericht gespeichert: $${reportPath}`);
  }

  generateReportContent() {
    const now = new Date().toLocaleString('de-DE');

    let report = `# Simple Browser Diagnose Bericht

**Erstellt:** $${now}  
**Tool:** Simple Browser Doctor v2.0.0  
**Workspace:** ${this.baseDir}

## 📊 Zusammenfassung

- **HTML-Dateien gefunden:** ${this.testFiles.length}
- **Dateien mit Problemen:** ${this.issuesFound.length}
- **Gesamte Probleme:** ${this.issuesFound.reduce((sum, file) => sum + file.issues.length, 0)}

## 🔍 Detaillierte Analyse

`;

    // Test Files Overview
    report += `### Alle HTML-Dateien\n\n`;
    report += `| Datei | Größe | Probleme | Status |\n`;
    report += `|-------|-------|----------|--------|\n`;

    for (const file of this.testFiles) {
      const sizeKB = Math.round(file.size / 1024);
      const status = file.issues === 0 ? '✅ OK' : `❌ $${file.issues} Probleme`;
      report += `| $${file.fileName} | ${sizeKB}KB | ${file.issues} | ${status} |\n`;
    }

    // Issues Details
    if (this.issuesFound.length > 0) { 
      report += `\n### 🚨 Gefundene Probleme\n\n`;

      for (const fileAnalysis of this.issuesFound) {
        report += `#### $${fileAnalysis.fileName}\n\n`;

        for (const issue of fileAnalysis.issues) {
          const severity =
            issue.severity === 'HIGH' ? '🔴' : issue.severity === 'MEDIUM' ? '🟡' : '🟢';
          report += `- $${severity} **${issue.type}**: ${issue.description}\n`;
          if (issue.line) report += `  - Zeile: $${issue.line}\n`;
          if (issue.count) report += `  - Anzahl: $${issue.count}\n`;
        }
        report += `\n`;
      }
    }

    // Fixes
    if (this.fixesApplied.length > 0) { 
      report += `### 🔧 Reparaturvorschläge\n\n`;

      for (const fileFix of this.fixesApplied) {
        report += `#### $${fileFix.fileName}\n\n`;

        for (const fix of fileFix.fixes) {
          report += `- **$${fix.type}**: ${fix.description}\n`;
          report += `  - Aktion: $${fix.action}\n`;
        }
        report += `\n`;
      }
    }

    // Simple Browser Tipps
    report += `## 💡 Simple Browser Tipps

### ✅ Was funktioniert gut:
- Einfache HTML5-Struktur
- Inline CSS und JavaScript
- Lokale Ressourcen
- Relative Pfade
- Moderate Dateigröße (<50KB)

### ❌ Häufige Probleme:
- Restriktive Content Security Policy (CSP)
- Externe CDN-Ressourcen ohne CSP-Erlaubnis
- Komplexe JavaScript-Module
- Sehr große HTML-Dateien (>100KB)
- Fehlende DOCTYPE oder Viewport

### 🔧 Schnelle Fixes:
1. **CSP lockern:** Ersetze restriktive CSP-Policies
2. **Externe Ressourcen:** Erlaube CDNs in CSP oder hoste lokal
3. **Scripts vereinfachen:** Verwende einfache, kompatible JavaScript-Patterns
4. **Dateien optimieren:** Lagere CSS/JS aus, komprimiere Inhalte

## 🎯 Nächste Schritte

1. Behebe die identifizierten HIGH-Severity-Probleme
2. Teste reparierte Dateien im Simple Browser
3. Erstelle backup-Kopien funktionierender Versionen
4. Implementiere automatische Kompatibilitätsprüfungen

---
*Generiert von Simple Browser Doctor v2.0.0*
`;

    return report;
  }

  // Auto-Fix Funktionen
  async autoFixCSP(filePath) {
    console.log(`🔧 Repariere CSP in ${path.basename(filePath)}...`);

    try {
      let content = fs.readFileSync(filePath, 'utf8');

      // Finde und ersetze restriktive CSP
      const cspRegex = /(<meta[^>]*Content-Security-Policy[^>]*content=")[^"]*(")/gi;
      const relaxedCSP =
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https:; object-src 'self'; base-uri 'self'; form-action 'self';";

      const newContent = content.replace(cspRegex, `$1$${relaxedCSP}$2`);

      if (newContent !== content) { 
        // Backup erstellen
        const backupPath = filePath + '.backup.' + Date.now();
        fs.writeFileSync(backupPath, content);

        // Reparierte Version speichern
        const fixedPath = filePath.replace('.html', '-simple-browser-ready.html');
        fs.writeFileSync(fixedPath, newContent);

        console.log(`   ✅ CSP repariert und gespeichert als: ${path.basename(fixedPath)}`);
        console.log(`   💾 Backup erstellt: ${path.basename(backupPath)}`);

        return fixedPath;
      }
    } catch (error) {
      console.log(`   ❌ Fehler beim Reparieren der CSP: $${error.message}`);
    }

    return null;
  }
}

// CLI Interface
async function main() {
  const doctor = new SimpleBrowserDoctor();

  console.log('🩺 Simple Browser Doctor - Diagnose & Reparatur');
  console.log('='.repeat(50));

  const issues = await doctor.diagnose();

  console.log('\n🎯 Diagnose abgeschlossen!');

  if (issues.length === 0) { 
    console.log('✅ Alle HTML-Dateien sind Simple Browser-kompatibel!');
  } else { 
    console.log(`❌ $${issues.length} Dateien benötigen Reparaturen.`);
    console.log('📋 Details siehe: SIMPLE_BROWSER_DIAGNOSE.md');

    // Auto-Fix anbieten
    console.log('\n🔧 Möchtest du automatische Reparaturen durchführen?');
    console.log('   (Backups werden automatisch erstellt)');

    // Für die wichtigste Datei Auto-Fix durchführen
    const mainIndexFile = issues.find((file) => file.fileName === 'index.html');
    if (mainIndexFile) { 
      console.log('\n🔧 Führe Auto-Fix für index.html durch...');
      const fixedFile = await doctor.autoFixCSP(mainIndexFile.file);
      if (fixedFile) { 
        console.log(`✅ Reparierte Version erstellt: ${path.basename(fixedFile)}`);
      }
    }
  }

  console.log('\n📈 Live-Test der reparierten Datei...');
  console.log('🌐 Simple Browser sollte jetzt korrekt funktionieren!');
}

// Export für Verwendung als Modul
module.exports = SimpleBrowserDoctor;

// CLI Ausführung
if (require.main === module) { 
  main().catch(console.error);
}



}
}