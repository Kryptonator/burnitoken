@echo off
REM TailwindCSS Validator und Update-Check Batch-Skript

echo ===== TailwindCSS Validator und Update-Check =====
echo.

echo 1. Führe vereinfachten Validator aus...
node simple-validator.js
echo Ausgabe in extension-validator-output.log gespeichert.
echo.

echo 2. Prüfe TailwindCSS Version...
call npm list tailwindcss --depth=0 > tailwindcss-version.txt
echo Ausgabe in tailwindcss-version.txt gespeichert.
echo.

echo 3. Sicherstellen, dass TailwindCSS korrekt installiert ist...
echo Falls Updates notwendig sind, führen Sie aus: npm install tailwindcss@4.1.10 --save-dev
echo.

echo 4. Prüfe VS Code Settings...
if exist .vscode\settings.json (
    echo settings.json gefunden. Tailwind-Konfiguration sollte vorhanden sein.
) else (
    echo WARNUNG: .vscode\settings.json nicht gefunden!
)
echo.

echo ===== Ergebnisse =====
if exist extension-validator-output.log (
    type extension-validator-output.log
) else (
    echo Keine Log-Datei gefunden.
)

echo.
echo ===== Prüfung abgeschlossen =====
echo.

pause
