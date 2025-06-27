# Mitwirken bei burnitoken.com

Zunächst einmal vielen Dank, dass du in Erwägung ziehst, zu burnitoken.com beizutragen! Es sind Menschen wie du, die die Open-Source-Community zu einem so großartigen Ort machen.

## Verhaltenskodex

Dieses Projekt und alle, die daran teilnehmen, unterliegen dem [Verhaltenskodex](CODE_OF_CONDUCT.md). Durch deine Teilnahme wird erwartet, dass du diesen Kodex einhältst. Bitte melde inakzeptables Verhalten an [deine-email@beispiel.de](mailto:deine-email@beispiel.de).

## Wie kann ich mitwirken?

### Fehler melden

- **Stelle sicher, dass der Fehler nicht bereits gemeldet wurde**, indem du auf GitHub unter [Issues](https://github.com/Kryptonator/burnitoken.com/issues) suchst.
- Wenn du kein offenes Issue findest, das das Problem behandelt, [öffne ein neues](https://github.com/Kryptonator/burnitoken.com/issues/new). Achte darauf, einen **Titel und eine klare Beschreibung**, so viele relevante Informationen wie möglich und ein **Codebeispiel** oder einen **ausführbaren Testfall** beizufügen, der das erwartete Verhalten demonstriert, das nicht auftritt.

### Verbesserungsvorschläge

- Eröffne ein neues Issue und gib eine klare Beschreibung der von dir vorgeschlagenen Verbesserung an.

### Pull Requests

- Forke das Repository und erstelle deinen Branch von `main`.
- Stelle sicher, dass die Test-Suite erfolgreich durchläuft.
- Stelle sicher, dass dein Code den Linting-Regeln entspricht.
- Reiche den Pull Request ein!

## Styleguides

### Git Commit-Nachrichten

- Verwende das Präsens ("Fügt Feature hinzu" nicht "Feature hinzugefügt").
- Verwende den Imperativ ("Verschiebe Cursor nach..." nicht "Verschiebt Cursor nach...").
- Beschränke die erste Zeile auf 72 Zeichen oder weniger.
- Referenziere Issues und Pull Requests großzügig nach der ersten Zeile.

### JavaScript Styleguide

- Der gesamte JavaScript-Code muss dem [JavaScript Standard Style](https://standardjs.com/) entsprechen.

## Einrichtung der Entwicklungsumgebung

1.  Klone das Repository: `git clone https://github.com/Kryptonator/burnitoken.com.git`
2.  Installiere die Abhängigkeiten: `npm install`
3.  Starte den Entwicklungsserver: `npm start`

## Projektstruktur

- `index.html`: Die Haupt-HTML-Datei.
- `main.js`: Die Haupt-JavaScript-Datei.
- `assets/`: Enthält alle statischen Assets wie Bilder und CSS.
- `tools/`: Enthält Skripte für Automatisierung und Werkzeuge.
- `.github/workflows/`: Enthält die CI/CD-Workflows.
