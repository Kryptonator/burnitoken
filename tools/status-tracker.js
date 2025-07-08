// tools/status-tracker.js
/**
 * Status Tracker
 * 
 * Speichert und liest Zeitstempel für erfolgreiche Health-Checks und andere Tasks.
 * Ermöglicht detaillierte Statusanzeigen (z.B. "Zuletzt geprüft vor X Minuten").
 * 
 * Erstellt: 2025-06-26
 */

const fs = require('fs');
const path = require('path');

const STATUS_DIR = path.join(__dirname, '..', '.status');
const STATUS_FILE = path.join(STATUS_DIR, 'check-timestamps.json');

/**
 * Stellt sicher, dass das .status-Verzeichnis existiert.
 */
function ensureStatusDir() {
    if (!fs.existsSync(STATUS_DIR)) {
        fs.mkdirSync(STATUS_DIR, { recursive: true });
    }
}

/**
 * Liest den aktuellen Status aus der JSON-Datei.
 * @returns {Object} Das Status-Objekt.
 */
function readStatus() {
    ensureStatusDir();
    if (!fs.existsSync(STATUS_FILE)) {
        return {};
    }
    try {
        const data = fs.readFileSync(STATUS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Fehler beim Lesen der Status-Datei:', error);
        return {};
    }
}

/**
 * Schreibt das Status-Objekt in die JSON-Datei.
 * @param {Object} statusData - Das zu schreibende Status-Objekt.
 */
function writeStatus(statusData) {
    ensureStatusDir();
    try {
        fs.writeFileSync(STATUS_FILE, JSON.stringify(statusData, null, 2), 'utf8');
    } catch (error) {
        console.error('Fehler beim Schreiben der Status-Datei:', error);
    }
}

/**
 * Speichert den Zeitstempel und optional Details für einen erfolgreichen Check.
 * @param {string} checkId - Die ID des Checks (früher checkName).
 * @param {string} [checkName] - Der menschenlesbare Name des Checks.
 * @param {string} [message] - Die Erfolgsmeldung.
 */
function recordCheckSuccess(checkId, checkName, message) {
    if (!checkId) return;
    const status = readStatus();
    
    // Alter Aufruf: nur checkName (jetzt checkId)
    if (!checkName && !message) {
        status[checkId] = {
            status: 'success',
            lastSuccess: new Date().toISOString()
        };
        console.log(`✅ Zeitstempel für '${checkId}' erfolgreich gespeichert.`);
    } else { // Neuer Aufruf mit mehr Details
        status[checkId] = {
            name: checkName,
            status: 'success',
            message: message,
            lastCheck: new Date().toISOString(),
        };
        // console.log(`✅ Status für '${checkName}' (success) erfolgreich gespeichert.`);
    }
    
    writeStatus(status);
}

/**
 * Speichert die Details für einen fehlgeschlagenen Check.
 * @param {string} checkId - Die eindeutige ID des Checks.
 * @param {string} checkName - Der menschenlesbare Name des Checks.
 * @param {string} errorMessage - Die Fehlermeldung.
 * @param {string} recommendation - Die Handlungsempfehlung.
 */
function recordCheckError(checkId, checkName, errorMessage, recommendation) {
    if (!checkId || !checkName) return;
    const status = readStatus();
    status[checkId] = {
        name: checkName,
        status: 'error',
        message: errorMessage,
        recommendation: recommendation,
        lastCheck: new Date().toISOString(),
    };
    // console.log(`❌ Status für '${checkName}' (error) erfolgreich gespeichert.`);
    writeStatus(status);
}

/**
 * Ruft den letzten erfolgreichen Zeitstempel für einen Check ab.
 * @param {string} checkName - Der Name des Checks.
 * @returns {string|null} Der ISO-Zeitstempel oder null, wenn nicht vorhanden.
 */
function getLastSuccess(checkName) {
    const status = readStatus();
    return status[checkName] ? status[checkName].lastSuccess : null;
}

/**
 * Berechnet die vergangene Zeit seit dem letzten erfolgreichen Check.
 * @param {string} checkName - Der Name des Checks.
 * @returns {string} Eine menschenlesbare Zeitangabe (z.B. "vor 5 Minuten").
 */
function getTimeSinceLastSuccess(checkName) {
    const lastSuccess = getLastSuccess(checkName);
    if (!lastSuccess) {
        return 'nie';
    }
    const now = new Date();
    const lastCheckDate = new Date(lastSuccess);
    const diffSeconds = Math.floor((now - lastCheckDate) / 1000);

    if (diffSeconds < 60) return `vor ${diffSeconds} Sekunden`;
    if (diffSeconds < 3600) return `vor ${Math.floor(diffSeconds / 60)} Minuten`;
    if (diffSeconds < 86400) return `vor ${Math.floor(diffSeconds / 3600)} Stunden`;
    return `vor ${Math.floor(diffSeconds / 86400)} Tagen`;
}

module.exports = {
    readStatus,
    writeStatus,
    recordCheckSuccess,
    recordCheckError,
    getLastSuccess,
    getTimeSinceLastSuccess,
};
