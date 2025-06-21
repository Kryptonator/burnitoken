#!/bin/bash

# Skript zum Erstellen eines Git-Commits für die Repository-Bereinigung
echo "🧹 Erstelle Git-Commit für Repository-Bereinigung..."

# Status überprüfen
git status

# Alle Änderungen hinzufügen
git add .

# Commit erstellen
git commit -m "🧹 Repository-Bereinigung: Optimierte Struktur, konsolidierte Skripte, entfernte leere Dateien und Binärdateien"

# Push-Befehl vorbereiten (auskommentiert, muss manuell ausgeführt werden)
echo "🚀 Um die Änderungen zu pushen, führen Sie aus:"
echo "    git push origin main"

echo "✅ Commit erfolgreich erstellt!"
