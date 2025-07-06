@echo off
title BurniToken Dashboard Starter
echo.
echo ========================================
echo    BURNITOKEN BOT DASHBOARD STARTER
echo ========================================
echo.
echo 🚀 Beende alle alten Prozesse...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM Code.exe >nul 2>&1

echo ✅ Starte leichtgewichtiges Dashboard...
cd /d "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\tools"

echo 📊 Dashboard wird geöffnet...
start "" "lightweight-dashboard.html"

echo 🌐 Server wird gestartet...
node lightweight-server.js

echo.
echo ========================================
echo     DASHBOARD ERFOLGREICH GESTARTET!
echo ========================================
echo.
echo 📊 Dashboard: lightweight-dashboard.html
echo 🌐 Server: localhost:3002
echo ⚡ Status: STABIL & PERFORMANT
echo.
pause
