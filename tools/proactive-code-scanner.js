/**
 * 🛠️ Proactive Code Scanner v1.0
 * Durchsucht das gesamte Projekt nach Platzhaltern (TODO, FIXME, HINT)
 * und nutzt die Master Logic Engine, um daraus Aufgaben zu erstellen.
 */

const fs = require('fs');
const path = require('path');
const masterLogicEngine = require('./master-logic-engine');

const projectRoot = path.join(__dirname, '..');
const ignoreDirs = ['node_modules', '.git', '.vscode', 'dist', 'build', '.emergency-saves'];
const includeExtensions = ['.js', '.html', '.css', '.md', '.yml', '.json'];

class ProactiveCodeScanner {
    constructor() {
        this.filesScanned = 0;
        this.placeholdersFound = 0;
    }

    log(message) {
        console.log(`[Scanner] ${message}`);
    }

    /**
     * Durchsucht ein Verzeichnis rekursiv nach relevanten Dateien.
     * @param {string} dir - Das zu durchsuchende Verzeichnis.
     */
    scanDirectory(dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                if (!ignoreDirs.includes(file)) {
                    this.scanDirectory(fullPath);
                }
            } else {
                if (includeExtensions.includes(path.extname(fullPath))) {
                    this.filesScanned++;
                    // Rufen Sie die neue Funktion auf, die die asynchrone Logik handhabt
                    masterLogicEngine.resolvePlaceholders(fullPath).catch(err => {
                        this.log(`Fehler bei der Verarbeitung von ${fullPath}: ${err.message}`);
                    });
                }
            }
        }
    }

    /**
     * Startet den Scan-Prozess für das gesamte Projekt.
     */
    run() {
        this.log('🚀 Starte proaktiven Code-Scan...');
        this.log(`Ignoriere Verzeichnisse: ${ignoreDirs.join(', ')}`);
        this.log(`Suche nach Dateitypen: ${includeExtensions.join(', ')}`);
        
        this.scanDirectory(projectRoot);

        this.log('✅ Scan abgeschlossen.');
        this.log(`📊 Zusammenfassung: ${this.filesScanned} Dateien gescannt.`);
        // Hinweis: Die Zählung der gefundenen Platzhalter erfolgt direkt in der Master Logic Engine.
    }
}

// Direkter Start, wenn das Skript ausgeführt wird
if (require.main === module) {
    const scanner = new ProactiveCodeScanner();
    scanner.run();
}

module.exports = ProactiveCodeScanner;
