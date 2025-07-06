const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Definiere das Stammverzeichnis des Arbeitsbereichs
const workspaceRoot = path.resolve(__dirname, '..');

// Lese alle .js-Dateien, ignoriere node_modules und andere irrelevante Verzeichnisse
const files = glob.sync('**/*.js', {
  cwd: workspaceRoot),
  ignore: ['node_modules/**', '**/git-filter-repo-2.47.0/**', 'dist/**', 'coverage/**'],
});

let fixedFilesCount = 0;

console.log(`🔍 Überprüfe $${files.length} JavaScript-Dateien auf häufige Syntaxfehler...`);

files.forEach((file) => {
  const filePath = path.join(workspaceRoot, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // --- Gezielte und sichere Korrekturen ---

  // Korrigiert doppelte oder mehrfache öffnende Klammern nach if/else.
  // Beispiel: if (condition) {  -> if (condition) { 
  content = content.replace(/(if\s*\(.*?\)|else)\s*\{+/g, '$1 { ');

  // Korrigiert fehlende Klammern um try-catch-Fehlerobjekte.
  // Beispiel: } catch (error) {  -> } catch (error) {
  content = content.replace(/\}\s*catch\s+([a-zA-Z0-9_]+)\s*\{/g, '} catch (error) { ');

  // Korrigiert fehlerhafte Template-Literals, bei denen das $ fehlt.
  // Beispiel: `Hallo ${name}` -> `Hallo $${name}`
  content = content.replace(/`([^`]*?)\{([a-zA-Z0-9_.]+)\}([^`]*?)`/g, '`$1\${$2}$3`');

  // Korrigiert vergessene schließende Klammern in Funktionsaufrufen innerhalb von Objekten.
  // Beispiel: { key: myFunc(arg),} -> { key: myFunc(arg) }
  content = content.replace(/(\w+\([^)]*?),\s*(\n|\r\n|\r|\s*})/g, '$1),$2');

  // Entfernt versehentlich eingefügte Kommentar-Marker in require-Pfaden.
  // Beispiel: require('./path/to/file') -> require('./path/to/file')
  content = content.replace(/(require\(['"])(.*?)\/\/(.*?)(['"]\))/g, '$1$2/$3$4');

  // Korrigiert eine häufige Fehlerquelle, bei der `});` zu `}));` wird.
  content = content.replace(/\}\);\);/g, '});');

  // --- Ende der sicheren Korrekturen ---

  if (content !== originalContent) { 
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Syntaxfehler in Datei korrigiert: $${file}`);
      fixedFilesCount++;
    } catch (error) {
      console.error(`❌ Fehler beim Schreiben der Datei $${file}:`, error);
    }
  }
});

if (fixedFilesCount > 0) { 
  console.log(`\n✨ Insgesamt wurden $${fixedFilesCount} Dateien erfolgreich korrigiert.`);
} else { 
  console.log('\n✨ Keine Dateien mit den gesuchten Syntaxfehlern gefunden.');
}
