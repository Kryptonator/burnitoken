/**
 * Debug-Hilfsfunktionen für die Fehlerbehebung in Scripts
 */

function formatJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

function inspectError(err) {
  const details = {
    message: err.message,
    name: err.name,
    stack: err.stack,
  };
  
  if (err.errors) {
    details.errors = err.errors;
  }
  
  if (err.response) {
    details.response = {
      status: err.response.status,
      statusText: err.response.statusText,
      data: err.response.data,
    };
  }
  
  return formatJSON(details);
}

/**
 * Führt eine Funktion mit Fehlerbehandlung aus
 * @param {string} name - Name der Operation
 * @param {Function} fn - Auszuführende Funktion
 * @param {boolean} stopOnError - Bei true wird bei Fehler eine Exception geworfen
 * @returns {Promise<*>} - Ergebnis der Funktion oder null bei Fehler
 */
async function safeExecute(name, fn, stopOnError = false) {
  console.log(`🔄 Starte Operation: ${name}`);
  try {
    const result = await fn();
    console.log(`✅ Operation erfolgreich: ${name}`);
    return result;
  } catch (error) {
    console.error(`❌ Fehler bei: ${name}`);
    console.error(inspectError(error));
    
    if (stopOnError) {
      throw error;
    }
    
    return null;
  }
}

module.exports = {
  formatJSON,
  inspectError,
  safeExecute,
};
