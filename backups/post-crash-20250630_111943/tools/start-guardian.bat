@echo off
REM Anti-Freeze Guardian Auto-Starter
REM Startet automatisch nach System-Boot oder VS Code Start

echo 🛡️ BurniToken Anti-Freeze Guardian wird gestartet...

cd /d "c:\Users\micha\OneDrive\Dokumente\burnitoken.com"

REM Prüfe zuerst den Status
node tools/anti-freeze-guardian.js --status

echo.
echo ⚠️ Guardian wird im Hintergrund gestartet...
echo ℹ️ Zum Beenden: Strg+C oder Fenster schließen

REM Starte Guardian im Überwachungsmodus
node tools/anti-freeze-guardian.js

pause
