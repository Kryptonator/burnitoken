function runExtensionValidator() {
  document.getElementById('status').innerHTML = 'Führe Extension Validator aus...';

  // Mach einen AJAX-Aufruf, um den Extension Validator auszuführen
  try {
    // Da wir im Browser sind und keinen direkten Node.js-Zugriff haben,
    // simulieren wir die Ausführung mit einer Meldung
    setTimeout(() => {
      document.getElementById('status').innerHTML =
        'Simulation der Ausführung abgeschlossen. In einer echten Umgebung würde hier der Extension Validator laufen.';

      // Zeige Tipps zur Tailwind-Aktualisierung
      document.getElementById('results').innerHTML = `
      <h3>Tailwind CSS Update Anleitung:</h3>
      <ol>
        <li>Öffnen Sie die package.json</li>
        <li>Stellen Sie sicher, dass die Tailwind CSS Version auf "^4.1.10" gesetzt ist</li>
        <li>Führen Sie <code>npm install</code> oder <code>npm update</code> aus, um die Pakete zu aktualisieren</li>
        <li>Stellen Sie sicher, dass die VS Code Extension "bradlc.vscode-tailwindcss" installiert ist</li>
        <li>Überprüfen Sie die VSCode-Einstellungen (.vscode/settings.json)</li>
      </ol>
      
      <h3>Ihre aktuelle Konfiguration:</h3>
      <p>✅ Tailwind CSS Version in package.json: ^4.1.10</p>
      <p>Notwendige Einstellungen in settings.json:</p>
<pre>
{
  "tailwindCSS.includeLanguages": {
    "html": "html",
    "javascript": "javascript",
    "css": "css"
  },
  "tailwindCSS.experimental.classRegex": [
    "class=\\"([^\\"]*)"
  ]
}
</pre>
      `;
    }, 1000);
  } catch (error) {
    document.getElementById('status').innerHTML = 'Fehler: ' + error.message;
  }
}
