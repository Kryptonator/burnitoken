// tools/status-persistence.js
/**
 * Status Persistence Manager
 *
 * Ein Hilfsmodul zum Lesen und Schreiben von Zeitstempeln und Statusinformationen
 * in eine zentrale JSON-Datei (z.B. recovery-status.json).
 * Dies verhindert, dass jeder Service seine eigene Logik für das Dateimanagement benötigt.
 *
 * Erstellt: 2025-06-27
 */

const fs = require('fs');
const path = require('path');

const STATUS_FILE_PATH = path.join(__dirname, '..', 'recovery-status.json');

/**
 * Liest den gesamten Status aus der JSON-Datei.
 * Erstellt die Datei, wenn sie nicht existiert.
 * @returns {Object} Das aktuelle Status-Objekt.
 */
function readStatus() {
  try {
    if (!fs.existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
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
      // Erstelle eine leere Datei, wenn sie nicht existiert
      fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify({}, null, 2));
      return {};
    }
    const data = fs.readFileSync(STATUS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Fehler beim Lesen der Status-Datei (${STATUS_FILE_PATH}):`, error);
    // Im Fehlerfall ein leeres Objekt zurückgeben, um Abstürze zu vermeiden
    return {};
  }
}

/**
 * Schreibt einen neuen Status für einen bestimmten Check/Service.
 * @param {string} checkName - Der Name des Checks (z.B. 'extensionHealthCheck').
 * @param {Object} statusData - Die zu speichernden Daten (z.B. { lastSuccess: new Date().toISOString(), status: 'ok' }).
 */
function writeStatus(checkName, statusData) {
  try {
    const currentStatus = readStatus();
    if (!currentStatus[checkName]) {
      currentStatus[checkName] = {};
    }
    // Füge die neuen Daten zum Status des Checks hinzu
    currentStatus[checkName] = { ...currentStatus[checkName], ...statusData };

    fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify(currentStatus, null, 2));
  } catch (error) {
    console.error(`❌ Fehler beim Schreiben der Status-Datei (${STATUS_FILE_PATH}):`, error);
  }
}

/**
 * Holt den letzten bekannten Status für einen bestimmten Check.
 * @param {string} checkName - Der Name des Checks.
 * @returns {Object | null} Das Status-Objekt für den Check oder null, wenn nicht vorhanden.
 */
function getCheckStatus(checkName) {
  const allStatus = readStatus();
  return allStatus[checkName] || null;
}

module.exports = {
  readStatus,
  writeStatus,
  getCheckStatus,
};
