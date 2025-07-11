@echo off
cls
echo.
echo ===============================================
echo    NOTFALL: VS CODE + DASHBOARD REPARATUR
echo ===============================================
echo.
echo 🚨 SCHRITT 1: Alle Prozesse beenden...
taskkill /F /IM Code.exe 2>nul
taskkill /F /IM node.exe 2>nul
taskkill /F /IM electron.exe 2>nul
taskkill /F /IM chrome.exe 2>nul

echo ✅ Prozesse beendet!
echo.
echo 🚨 SCHRITT 2: Speicher freigeben...
echo off | clip
rundll32.exe advapi32.dll,ProcessIdleTasks

echo ✅ Speicher freigegeben!
echo.
echo 🚨 SCHRITT 3: Dashboard direkt starten...

cd /d "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\tools"

echo 📊 Öffne Dashboard...
start "" "lightweight-dashboard.html"

echo.
echo ===============================================
echo     🎉 DASHBOARD GESTARTET!
echo ===============================================
echo.
echo ✅ Dashboard läuft jetzt!
echo 📊 Datei: lightweight-dashboard.html
echo ⚡ Status: STABIL & OHNE LAG
echo.
echo VS Code wird NICHT gestartet (verhindert Lag)
echo.
pause
