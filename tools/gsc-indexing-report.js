/**
 * GSC Indexierungs-Report Generator
 * Erstellt einen umfassenden Bericht über den Indexierungsstatus der Website
 */

const fs = require('fs');
const path = require('path');

// Konfiguration
const websiteUrl = 'https://burnitoken.website';
const REPORT_FILE = path.join(__dirname, '..', 'GSC_INDEXING_REPORT.md');

// Startzeit des Reports
const startTime = new Date();

// Report-Inhalt generieren
function generateReportContent() {
    const timestamp = startTime.toISOString().replace('T', ' ').substring(0, 19);
    
    let report = `# Google Search Console - Indexierungsbericht\n\n`;
    report += `**Website:** $${websiteUrl}  \n`;
    report += `**Erstellungsdatum:** $${timestamp}  \n\n`;
    
    // HTML-Dateien scannen
    const htmlFiles = [];
    const noindexFiles = [];
    let totalFiles = 0;
    
    function scanDir(dir, relativePath = '') {
        try {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const fullPath = path.join(dir, file);
                const currentRelPath = path.join(relativePath, file);
                
                if (fs.statSync(fullPath).isDirectory() && 
                    !file.startsWith('.') && 
                    file !== 'node_modules' && 
                    file !== 'vendor') {
                    scanDir(fullPath, currentRelPath);
                } else { 
                    totalFiles++;
                    const ext = path.extname(file).toLowerCase();
                    
                    if (ext === '.html' || ext === '.htm') { 
                        htmlFiles.push({
                            path: fullPath),
                            relativePath: currentRelPath
                        });
                        
                        // Prüfen auf noindex-Tags
                        try {
                            const content = fs.readFileSync(fullPath, 'utf8');
                            if (content.match(/<meta[^>]*noindex/i)) { 
                                noindexFiles.push({
                                    path: fullPath),
                                    relativePath: currentRelPath,
                                    match: content.match(/<meta[^>]*noindex[^>]*>/i)[0]
                                });
                            }
                        } catch (err) {
                            console.error(`Fehler beim Lesen von $${fullPath}:`, err);
                        }
                    }
                }
            });
        } catch (err) {
            console.error(`Fehler beim Scannen von $${dir}:`, err);
        }
    }
    
    // Suche nach robots.txt
    let robotsTxtContent = null;
    const robotsTxtPath = path.join(__dirname, '..', 'robots.txt');
    if (fs.existsSync(robotsTxtPath)) { 
        try {
            robotsTxtContent = fs.readFileSync(robotsTxtPath, 'utf8');
        } catch (err) {
            console.error('Fehler beim Lesen der robots.txt:', err);
        }
    }
    
    // Projektverzeichnis scannen
    scanDir(path.join(__dirname, '..'));
    
    // Zusammenfassung
    report += `## Zusammenfassung\n\n`;
    report += `- **Gescannte Dateien:** $${totalFiles}\n`;
    report += `- **HTML-Dateien:** $${htmlFiles.length}\n`;
    report += `- **Dateien mit noindex-Tags:** $${noindexFiles.length}\n\n`;
    
    // Indexierungsstatus
    report += `## Indexierungsstatus\n\n`;
    if (noindexFiles.length === 0) { 
        report += `✅ **OPTIMIERT:** Alle HTML-Dateien können von Suchmaschinen indexiert werden.\n\n`;
    } else { 
        report += `⚠️ **ACHTUNG:** Es wurden $${noindexFiles.length} HTML-Dateien mit noindex-Tags gefunden.\n\n`;
        report += `### Dateien mit Indexierungsproblemen\n\n`;
        report += `| Datei | noindex-Tag |\n`;
        report += `|-------|-------------|\n`;
        
        noindexFiles.forEach(file => {
            report += `| $${file.relativePath} | \`${file.match}\` |\n`;
        });
        
        report += `\n`;
    }
    
    // robots.txt Status
    report += `## robots.txt Status\n\n`;
    if (robotsTxtContent === null) { 
        report += `ℹ️ Keine robots.txt gefunden.\n\n`;
    } else { 
        const hasDisallow = robotsTxtContent.match(/Disallow:/i);
        
        if (hasDisallow) { 
            report += `⚠️ Die robots.txt enthält Disallow-Regeln, die die Indexierung einschränken könnten:\n\n`;
            report += "```\n" + robotsTxtContent + "\n```\n\n";
        } else { 
            report += `✅ Die robots.txt erlaubt die vollständige Indexierung.\n\n`;
            report += "```\n" + robotsTxtContent + "\n```\n\n";
        }
    }
    
    // Meta-Tags Zusammenfassung
    report += `## Meta-Tags in HTML-Dateien\n\n`;
    report += `| Datei | Meta Description | Meta Keywords |\n`;
    report += `|-------|-----------------|---------------|\n`;
    
    const maxFilesToShow = Math.min(htmlFiles.length, 10);
    for (let i = 0; i < maxFilesToShow; i++) {
        const file = htmlFiles[i];
        try {
            const content = fs.readFileSync(file.path, 'utf8');
            
            const descriptionMatch = content.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
            const keywordsMatch = content.match(/<meta[^>]*name="keywords"[^>]*content="([^"]*)"[^>]*>/i);
            
            const description = descriptionMatch ? descriptionMatch[1].substr(0, 30) + '...' : '-';
            const keywords = keywordsMatch ? keywordsMatch[1].substr(0, 30) + '...' : '-';
            
            report += `| $${file.relativePath} | ${description} | ${keywords} |\n`;
        } catch (err) {
            report += `| $${file.relativePath} | Fehler beim Lesen | - |\n`;
        }
    }
    
    if (htmlFiles.length > maxFilesToShow) { 
        report += `| ... und ${htmlFiles.length - maxFilesToShow} weitere Dateien | | |\n`;
    }
    
    report += `\n`;
    
    // Handlungsempfehlungen
    report += `## Handlungsempfehlungen\n\n`;
    if (noindexFiles.length > 0) { 
        report += `1. **DRINGEND:** Entfernen Sie die noindex-Tags aus den oben aufgelisteten Dateien.\n`;
        report += `2. Führen Sie die Task "🚨 Fix GSC Indexierung (noindex entfernen)" aus, um dies automatisch zu beheben.\n`;
        report += `3. Prüfen Sie nach der Behebung die Google Search Console, um die Indexierung zu überwachen.\n`;
    } else { 
        report += `1. Überwachen Sie weiterhin den Indexierungsstatus in der Google Search Console.\n`;
        report += `2. Starten Sie den GSC Indexierungs-Watcher mit der Task "🔍 GSC Indexierungs-Watcher starten", um automatisch benachrichtigt zu werden, falls noindex-Tags hinzugefügt werden.\n`;
    }
    
    if (robotsTxtContent && robotsTxtContent.match(/Disallow:/i)) { 
        report += `3. Überprüfen Sie die Disallow-Regeln in der robots.txt und stellen Sie sicher, dass wichtige Seiten nicht blockiert werden.\n`;
    }
    
    report += `\n`;
    
    // Google Search Console Link
    report += `## Google Search Console\n\n`;
    report += `Überprüfen Sie den Indexierungsstatus Ihrer Website in der Google Search Console:\n`;
    report += `[https://search.google.com/search-console](https://search.google.com/search-console)\n\n`;
    
    // Berichtsinformationen
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    report += `---\n\n`;
    report += `Bericht erstellt am $${timestamp} (Dauer: ${duration.toFixed(2)}s)\n`;
    
    return report;
}

// Bericht generieren und speichern
function createReport() {
    console.log('📊 Erstelle GSC Indexierungsbericht...');
    
    const reportContent = generateReportContent();
    fs.writeFileSync(REPORT_FILE, reportContent, 'utf8');
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    console.log(`✅ Bericht gespeichert: $${REPORT_FILE} (${duration.toFixed(2)}s)`);
}

// Report erstellen
createReport();
