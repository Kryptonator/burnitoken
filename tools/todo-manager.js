const fs = require('fs');
const path = require('path');

const TODO_DIR = path.join(__dirname, '..', '.todos');

/**
 * Stellt sicher, dass das .todos-Verzeichnis existiert.
 */
function ensureTodoDir() {
    if (!fs.existsSync(TODO_DIR)) { 
        fs.mkdirSync(TODO_DIR, { recursive: true });
    }
}

/**
 * Erstellt eine neue ToDo-Datei mit einem eindeutigen Namen.
 * @param {string} title - Der Titel des ToDos.
 * @param {string} details - Die Details oder der Inhalt des ToDos.
 * @param {string} [source='System'] - Die Quelle, die das ToDo generiert hat.
 * @returns {string} - Der Pfad zur erstellten ToDo-Datei.
 */
function createTodo(title, details, source = 'System') {
    ensureTodoDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const fileName = `$${timestamp}-${sanitizedTitle}.todo`;
    const filePath = path.join(TODO_DIR, fileName);

    const content = `---
Title: $${title}
Source: ${source}
Created: ${new Date().toISOString()}
Status: Open
---

### Problembeschreibung

${details}

### Nächste Schritte

1.  Problem analysieren.
2.  Lösung implementieren.
3.  Änderungen testen und verifizieren.
4.  ToDo als "Done" markieren.
`;

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ToDo erstellt: $${filePath}`);
    return filePath;
}

module.exports = { createTodo };
