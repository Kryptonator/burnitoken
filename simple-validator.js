/**
 * Vereinfachter Extension Function Validator
 * Fokus auf TailwindCSS und Logging in Datei
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konstante Pfade
const LOG_FILE = 'extension-validator-output.log';
const SETTINGS_PATH = path.join('.vscode', 'settings.json');

// Stelle sicher, dass alte Log-Datei gelöscht wird
try {
    if (fs.existsSync(LOG_FILE)) {
        fs.unlinkSync(LOG_FILE);
    }
} catch (err) {
    // Fehler hier ignorieren
}

/**
 * In Datei loggen
 */
function log(message) {
    try {
        fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
    } catch (err) {
        // Fehler hier ignorieren, da kein Konsolen-Zugriff
    }
}

/**
 * Prüft Tailwind CSS Konfiguration
 */
function checkTailwindCSS() {
    log('===== TailwindCSS-Prüfung =====');

    // Prüfe package.json
    try {
        if (fs.existsSync('package.json')) {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            if (packageJson.devDependencies && packageJson.devDependencies.tailwindcss) {
                const tailwindVersion = packageJson.devDependencies.tailwindcss;
                log(`TailwindCSS Version: ${tailwindVersion}`);
                
                // Version prüfen
                if (tailwindVersion === '^4.1.10') {
                    log('✅ TailwindCSS ist auf der gewünschten Version 4.1.10');
                } else {
                    log(`⚠️ TailwindCSS sollte auf Version 4.1.10 aktualisiert werden (aktuell: ${tailwindVersion})`);
                }
            } else {
                log('❌ TailwindCSS ist nicht in package.json definiert');
            }
        } else {
            log('❌ package.json nicht gefunden');
        }
    } catch (err) {
        log(`❌ Fehler beim Prüfen der package.json: ${err.message}`);
    }

    // Prüfe settings.json
    try {
        if (fs.existsSync(SETTINGS_PATH)) {
            const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
            
            if (settings['tailwindCSS.includeLanguages']) {
                log('✅ tailwindCSS.includeLanguages ist konfiguriert');
                log(JSON.stringify(settings['tailwindCSS.includeLanguages'], null, 2));
            } else {
                log('⚠️ tailwindCSS.includeLanguages fehlt in settings.json');
            }
            
            if (settings['tailwindCSS.experimental.classRegex']) {
                log('✅ tailwindCSS.experimental.classRegex ist konfiguriert');
            } else {
                log('⚠️ tailwindCSS.experimental.classRegex fehlt in settings.json');
            }
        } else {
            log('❌ settings.json nicht gefunden');
        }
    } catch (err) {
        log(`❌ Fehler beim Prüfen der settings.json: ${err.message}`);
    }

    // Prüfe tailwind.config.js
    try {
        if (fs.existsSync('tailwind.config.js')) {
            log('✅ tailwind.config.js gefunden');
        } else {
            log('⚠️ tailwind.config.js nicht gefunden');
        }
    } catch (err) {
        log(`❌ Fehler beim Prüfen von tailwind.config.js: ${err.message}`);
    }
}

/**
 * Hauptfunktion
 */
function main() {
    log('===== Extension Function Validator (vereinfacht) =====');
    log(`Datum: ${new Date().toISOString()}`);
    log('');
    
    // Führe Prüfungen durch
    checkTailwindCSS();
    
    log('');
    log('===== Prüfung abgeschlossen =====');
    log(`Ergebnisse wurden in ${LOG_FILE} gespeichert.`);
}

// Führe Hauptfunktion aus
main();
