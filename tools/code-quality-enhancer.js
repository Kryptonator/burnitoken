/**
 * Code Quality Enhancer
 *
 * Dieses Modul bietet Funktionen zur Analyse und Verbesserung der Codequalität.
 * Es kann von anderen Skripten und Bots genutzt werden, um "Super-Developer-Eigenschaften"
 * zu implementieren, wie z.B. das Erkennen von Platzhaltern, Syntaxfehlern und
 * das Vorschlagen von logischen Verbesserungen.
 *
 * Erstellt: 2025-07-05
 */

const fs = require('fs');
const path = require('path');

// Reguläre Ausdrücke zur Erkennung von Mustern
const PLACEHOLDER_REGEX = /(TODO|FIXME|XXX)/gi;
const CONSOLE_LOG_REGEX = /(?<!\/\/.*|\*.*)console\.log\(/g;
const INCOMPLETE_LOGIC_REGEX = /(\.{3,}|placeholder|implement me)/gi;

/**
 * Analysiert den Code auf Qualitätsmängel.
 * @param {string} code - Der zu analysierende Code-String.
 * @param {string} filePath - Der Pfad zur Datei (für Kontexterstellung).
 * @returns {Array<object>} Eine Liste von gefundenen Problemen.
 */
function analyzeCode(code, filePath) {
  const issues = [];
  const lines = code.split('\\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // 1. Suche nach Platzhaltern (TODO, FIXME, etc.)
    let match;
    while ((match = PLACEHOLDER_REGEX.exec(line)) !== null) {
      issues.push({
        filePath,
        lineNumber,
        lineContent: line.trim(),
        type: 'placeholder',
        severity: 'medium',
        message: `Platzhalter gefunden: "${match[0]}"`,
      });
    }

    // 2. Suche nach unvollständiger Logik
    if (INCOMPLETE_LOGIC_REGEX.test(line)) {
      issues.push({
        filePath,
        lineNumber,
        lineContent: line.trim(),
        type: 'incomplete-logic',
        severity: 'high',
        message: 'Potenziell unvollständige Logik oder Platzhalter-Text gefunden.',
      });
    }

    // 3. Suche nach console.log-Anweisungen (in Produktiv-Code unerwünscht)
    if (CONSOLE_LOG_REGEX.test(line)) {
      issues.push({
        filePath,
        lineNumber,
        lineContent: line.trim(),
        type: 'debug-code',
        severity: 'low',
        message: 'Eine "console.log"-Anweisung gefunden. Sollte diese entfernt werden?',
      });
    }
  });

  return issues;
}

/**
 * Führt eine Selbstprüfung für eine gegebene Datei durch.
 * @param {string} filePath - Der Pfad zum Skript, das sich selbst prüfen soll.
 * @returns {Promise<Array<object>>} Ein Promise, das mit der Liste der Probleme resolvt.
 */
async function performSelfCheck(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, code) => {
      if (err) {
        return reject(
          new Error(`Datei konnte nicht gelesen werden: ${filePath}. Fehler: ${err.message}`),
        );
      }
      const issues = analyzeCode(code, filePath);
      resolve(issues);
    });
  });
}

module.exports = {
  analyzeCode,
  performSelfCheck,
};
