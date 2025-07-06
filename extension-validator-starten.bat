@echo off
echo Extension Function Validator wird gestartet...
echo.

node extension-validator-neu.js

if exist extension-validator.log (
  echo.
  echo Ergebnis-Log gefunden. Zeige Zusammenfassung:
  echo ==========================================
  echo.
  findstr /C:"Extension Health Check Ergebnis" /C:"Gesunde Extensions" /C:"Extensions mit Problemen" /C:"Empfehlungen" extension-validator.log
  echo.
  echo Das vollständige Protokoll finden Sie in: extension-validator.log
  echo.
  echo Möchten Sie das vollständige Protokoll anzeigen? [j/n]
  choice /c jn /n
  if errorlevel 2 goto end
  if errorlevel 1 notepad extension-validator.log
) else (
  echo Keine Log-Datei gefunden.
)

:end
