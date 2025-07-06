@echo off
echo 🚨 NOTFALL: VS Code Anti-Crash-Fix (Windows)
echo.

echo ⚡ Beende alle VS Code Prozesse...
taskkill /F /IM "Code.exe" 2>nul
taskkill /F /IM "code.exe" 2>nul
taskkill /F /IM "electron.exe" 2>nul
timeout /t 2 /nobreak >nul

echo 🚫 Deaktiviere Copilot Chat Extension...
if exist "%USERPROFILE%\.vscode\extensions\github.copilot-chat*" (
    ren "%USERPROFILE%\.vscode\extensions\github.copilot-chat*" "github.copilot-chat-DISABLED" 2>nul
)

echo ⌨️ Notfall-Settings aktivieren...
mkdir "%USERPROFILE%\.vscode\User" 2>nul
echo { > "%USERPROFILE%\.vscode\User\settings.json"
echo   "extensions.autoUpdate": false, >> "%USERPROFILE%\.vscode\User\settings.json"
echo   "github.copilot.enable": false, >> "%USERPROFILE%\.vscode\User\settings.json"
echo   "github.copilot.chat.enable": false, >> "%USERPROFILE%\.vscode\User\settings.json"
echo   "editor.quickSuggestions": false, >> "%USERPROFILE%\.vscode\User\settings.json"
echo   "editor.acceptSuggestionOnEnter": "off", >> "%USERPROFILE%\.vscode\User\settings.json"
echo   "typescript.suggest.enabled": false, >> "%USERPROFILE%\.vscode\User\settings.json"
echo   "javascript.suggest.enabled": false >> "%USERPROFILE%\.vscode\User\settings.json"
echo } >> "%USERPROFILE%\.vscode\User\settings.json"

echo 🧹 Lösche problematische Cache-Dateien...
rd /s /q "%USERPROFILE%\.vscode\logs" 2>nul
rd /s /q "%USERPROFILE%\.vscode\CachedExtensions" 2>nul
rd /s /q "%APPDATA%\Code\logs" 2>nul

echo.
echo ✅ Notfall-Fix abgeschlossen!
echo 💡 Starte VS Code jetzt neu - es sollte stabil laufen
echo.
pause

REM VS Code im Safe Mode starten
echo 🔧 Starte VS Code im Safe Mode...
start "" "code" --disable-extensions --disable-gpu
