/**
 * Debug-Version des Extension Function Validators
 */

console.log('Debug-Validator wird gestartet');

try {
  const fs = require('fs');
  console.log('fs geladen');

  const path = require('path');
  console.log('path geladen');

  const { execSync } = require('child_process');
  console.log('execSync geladen');

  console.log('Teste Dateizugriff...');
  const settingsPath = path.join('.vscode', 'settings.json');
  console.log(`Settings Pfad: ${settingsPath}`);

  const settingsExist = fs.existsSync(settingsPath);
  console.log(`settings.json existiert: ${settingsExist}`);

  console.log('Versuche VS Code Extensions zu listen...');
  try {
    const installedExtensions = execSync('code --list-extensions', { encoding: 'utf8' });
    console.log(`Installierte Extensions: ${installedExtensions.split('\n').length}`);
  } catch (execError) {
    console.error('Fehler beim Ausführen von code --list-extensions:', execError.message);
  }

  console.log('Debug-Validator erfolgreich durchgelaufen');
} catch (error) {
  console.error('Fehler im Debug-Validator:', error);
  console.error(error.stack);
}
