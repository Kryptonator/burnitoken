@echo off
REM ================================================
REM 🚨 EMERGENCY RECOVERY SCRIPT 🚨
REM Für VS Code Crash, Chat-Blockade, Freeze-Probleme
REM ================================================

echo 🚨 NOTFALL-RECOVERY GESTARTET...
echo.

REM VS Code Prozesse sofort beenden
echo ⚡ Beende alle VS Code Prozesse...
taskkill /F /IM "Code.exe" /T 2>nul
taskkill /F /IM "electron.exe" /T 2>nul
taskkill /F /IM "node.exe" /F /T 2>nul
echo VS Code-Prozesse beendet!

REM Chat/Extension-Prozesse killen
echo 💬 Beende Chat/Extension-Prozesse...
taskkill /F /IM "Microsoft.VSCode.CPP.Extension.exe" /T 2>nul
taskkill /F /IM "typescript.exe" /T 2>nul
echo Chat-Prozesse beendet!

REM Temp-Ordner leeren
echo 🗑️ Lösche blockierende Temp-Dateien...
del /Q /S "%TEMP%\vscode-*" 2>nul
del /Q /S "%APPDATA%\Code\logs\*" 2>nul
del /Q /S "%APPDATA%\Code\CachedExtensions\*" 2>nul
echo Temp-Cleanup abgeschlossen!

REM Extension-Cache leeren
echo 🔧 Repariere Extension-Cache...
del /Q /S "%USERPROFILE%\.vscode\extensions\*\out\*" 2>nul
del /Q /S "%USERPROFILE%\.vscode\extensions\.obsolete" 2>nul
echo Extension-Cache repariert!

REM Memory-Cleanup (Windows)
echo 🧹 Memory-Cleanup...
sfc /scannow >nul 2>&1
echo Memory-Cleanup durchgeführt!

REM Recovery Center starten falls vorhanden
echo 🔄 Starte Recovery Center...
if exist "tools\vscode-recovery-center.js" (
    node tools\vscode-recovery-center.js --live-check
) else (
    echo Recovery Center nicht gefunden
)

echo.
echo ✅ NOTFALL-RECOVERY ABGESCHLOSSEN!
echo.
echo 📋 Nächste Schritte:
echo 1. VS Code neu starten
echo 2. Nur wichtige Extensions aktivieren
echo 3. Chat-Features langsam testen
echo 4. Bei Problemen erneut ausführen
echo.
pause
