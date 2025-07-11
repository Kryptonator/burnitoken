@echo off
echo Starte Extension Validator...
echo Extension Validator > extension-validator-report.txt
echo ======================= >> extension-validator-report.txt
echo. >> extension-validator-report.txt

echo Prüfe VS Code Extensions... >> extension-validator-report.txt

rem Prüfe, ob .vscode Ordner existiert
if exist ".vscode" (
  echo ✓ .vscode Ordner gefunden >> extension-validator-report.txt
) else (
  echo X .vscode Ordner nicht gefunden >> extension-validator-report.txt
)

rem Prüfe, ob settings.json existiert
if exist ".vscode\settings.json" (
  echo ✓ settings.json gefunden >> extension-validator-report.txt
) else (
  echo X settings.json nicht gefunden >> extension-validator-report.txt
)

rem Prüfe, ob extensions.json existiert
if exist ".vscode\extensions.json" (
  echo ✓ extensions.json gefunden >> extension-validator-report.txt
) else (
  echo X extensions.json nicht gefunden >> extension-validator-report.txt
)

rem Prüfe, ob tasks.json existiert
if exist ".vscode\tasks.json" (
  echo ✓ tasks.json gefunden >> extension-validator-report.txt
) else (
  echo X tasks.json nicht gefunden >> extension-validator-report.txt
)

rem Prüfe KI-Integration Dateien
echo. >> extension-validator-report.txt
echo Prüfe KI-Integration... >> extension-validator-report.txt

set AI_FILES=0
set MISSING_FILES=0

if exist "tools\session-saver.js" (
  echo ✓ session-saver.js gefunden >> extension-validator-report.txt
  set /a AI_FILES+=1
) else (
  echo X session-saver.js fehlt >> extension-validator-report.txt
  set /a MISSING_FILES+=1
)

if exist "tools\recover-session.js" (
  echo ✓ recover-session.js gefunden >> extension-validator-report.txt
  set /a AI_FILES+=1
) else (
  echo X recover-session.js fehlt >> extension-validator-report.txt
  set /a MISSING_FILES+=1
)

if exist "tools\ai-conversation-bridge.js" (
  echo ✓ ai-conversation-bridge.js gefunden >> extension-validator-report.txt
  set /a AI_FILES+=1
) else (
  echo X ai-conversation-bridge.js fehlt >> extension-validator-report.txt
  set /a MISSING_FILES+=1
)

if exist "tools\ai-status.js" (
  echo ✓ ai-status.js gefunden >> extension-validator-report.txt
  set /a AI_FILES+=1
) else (
  echo X ai-status.js fehlt >> extension-validator-report.txt
  set /a MISSING_FILES+=1
)

if exist "tools\ai-services-manager.js" (
  echo ✓ ai-services-manager.js gefunden >> extension-validator-report.txt
  set /a AI_FILES+=1
) else (
  echo X ai-services-manager.js fehlt >> extension-validator-report.txt
  set /a MISSING_FILES+=1
)

echo. >> extension-validator-report.txt
echo Zusammenfassung: >> extension-validator-report.txt
echo KI-Tools gefunden: %AI_FILES% >> extension-validator-report.txt
echo KI-Tools fehlend: %MISSING_FILES% >> extension-validator-report.txt

echo. >> extension-validator-report.txt
echo Validator abgeschlossen! >> extension-validator-report.txt
echo Bericht wurde in extension-validator-report.txt gespeichert.

echo Öffne Bericht...
start notepad extension-validator-report.txt
