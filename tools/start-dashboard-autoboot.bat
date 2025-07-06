@echo off
REM Dashboard Auto-Start für Windows
REM Dieses Skript startet das Dashboard automatisch beim System-Start

setlocal enabledelayedexpansion

REM Konfiguration
set "PROJECT_DIR=%~dp0..\"
set "AUTO_STARTER=%PROJECT_DIR%tools\dashboard-auto-starter.js"
set "LOG_FILE=%PROJECT_DIR%tools\startup.log"

REM Warte 30 Sekunden nach System-Start für Stabilität
echo [%date% %time%] Warte 30 Sekunden für System-Stabilität... >> "%LOG_FILE%"
timeout /t 30 /nobreak >nul

REM Prüfe Node.js Installation
node --version >nul 2>&1
if errorlevel 1 (
    echo [%date% %time%] FEHLER: Node.js ist nicht installiert oder nicht im PATH! >> "%LOG_FILE%"
    exit /b 1
)

REM Wechsle ins Projekt-Verzeichnis
cd /d "%PROJECT_DIR%"

REM Starte Auto-Starter
echo [%date% %time%] Starte Dashboard Auto-Starter... >> "%LOG_FILE%"
start /min "Dashboard Auto-Starter" node "%AUTO_STARTER%"

REM Bestätigung
echo [%date% %time%] Dashboard Auto-Starter gestartet. >> "%LOG_FILE%"

endlocal
exit /b 0
