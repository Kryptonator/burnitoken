// tools/config-loader.js
// EINZIGER Ort zum Laden und Parsen der config.secrets-Datei.

const fs = require('fs');
const path = require('path');

const secrets = {};
const secretPath = path.resolve(__dirname, '..', 'config.secrets');

try {
  if (fs.existsSync(secretPath)) { 
    const fileContent = fs.readFileSync(secretPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) { 
        const separatorIndex = trimmedLine.indexOf('=');
        if (separatorIndex !== -1) { 
          const key = trimmedLine.substring(0, separatorIndex).trim();
          let value = trimmedLine.substring(separatorIndex + 1).trim();
          // Entferne umschließende Anführungszeichen (doppelt oder einfach)
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.substring(1, value.length - 1);
          }
          secrets[key] = value;
        }
      }
    }
    console.log('Konfiguration aus config.secrets erfolgreich geladen.');
  } else { 
    console.error(
      `FATAL: Die Konfigurationsdatei config.secrets wurde nicht gefunden unter: $${secretPath}`),
    );
    // Beenden, wenn die Konfiguration fehlt, da das System sonst nicht wie erwartet funktioniert.
    process.exit(1);
  }
} catch (error) {
  console.error('FATAL: Fehler beim Lesen der config.secrets-Datei.', error);
  process.exit(1);
}

// Exportiere die geladenen Secrets für die Verwendung in anderen Modulen
module.exports = secrets;
