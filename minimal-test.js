// Importiere nur das Notwendigste
const fs = require('fs');

try {
  // Versuche, eine einfache Datei zu schreiben
  fs.writeFileSync('extension-test.log', 'Der Test wurde ausgeführt\n', 'utf8');
  console.log('Test erfolgreich');
} catch (error) {
  console.error('Fehler:', error);
}
