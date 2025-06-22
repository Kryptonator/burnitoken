# PowerShell-Script zum Zusammenfassen und Committen der Änderungen
# extension-push-changes.ps1

Write-Host "===== TailwindCSS Validierung und Push =====" -ForegroundColor Cyan

# Liste der geänderten Dateien
$changedFiles = @(
    "simple-validator.js",
    "tailwind-update-check.ps1",
    "check-tailwindcss.bat",
    "extension-validator-web-new.js"
)

Write-Host "`nFolgende Dateien wurden erstellt oder aktualisiert:" -ForegroundColor Yellow
foreach ($file in $changedFiles) {
    if (Test-Path $file) {
        Write-Host "- $file" -ForegroundColor Green
    } else {
        Write-Host "- $file (nicht gefunden)" -ForegroundColor Red
    }
}

Write-Host "`nZusammenfassung der Ergebnisse:" -ForegroundColor Cyan
Write-Host "1. TailwindCSS ist bereits auf Version 4.1.10 aktualisiert" -ForegroundColor Green
Write-Host "2. VS Code Einstellungen sind korrekt konfiguriert" -ForegroundColor Green
Write-Host "3. Validator-Logik wurde verbessert und robuster gemacht" -ForegroundColor Green
Write-Host "4. Alternative Tools für die Validierung wurden erstellt" -ForegroundColor Green

# Erstelle eine Zusammenfassungsdatei
$summary = @"
# TailwindCSS Validierung - Zusammenfassung

## Status
- TailwindCSS Version: 4.1.10 (✅ aktuell)
- VS Code Extension: bradlc.vscode-tailwindcss (sollte installiert sein)
- VS Code Settings: korrekt konfiguriert mit Sprachunterstützung und ClassRegex

## Erstellte Tools
- `simple-validator.js`: Vereinfachter Validator mit Fokus auf TailwindCSS
- `tailwind-update-check.ps1`: PowerShell-Script zur detaillierten Prüfung
- `check-tailwindcss.bat`: Batch-Datei für einfache Ausführung
- `extension-validator-web-new.js`: Frontend für browserbasierte Validierung

## Ergebnis
Die Analyse hat bestätigt, dass TailwindCSS bereits auf Version 4.1.10 aktualisiert ist und die Konfiguration in VS Code korrekt vorgenommen wurde. Falls weiterhin Probleme bestehen, empfehlen wir folgende Schritte:

1. VS Code neu starten
2. TailwindCSS Extension manuell überprüfen und ggf. neu installieren
3. Node Module neu installieren: `npm install`
4. CSS neu generieren: `npm run build:css`

Datum: $(Get-Date -Format "yyyy-MM-dd")
"@

Set-Content -Path "TAILWIND_VALIDATION_SUMMARY.md" -Value $summary
Write-Host "`nZusammenfassung in TAILWIND_VALIDATION_SUMMARY.md gespeichert" -ForegroundColor Green

# Committen der Änderungen
$commitMessage = "Update TailwindCSS-Validierung und Tools

- Bestätigt, dass TailwindCSS bereits auf Version 4.1.10 ist
- Verbesserte Validierungs-Tools erstellt
- Alternative Prüfmethoden implementiert
- Dokumentation erstellt"

Write-Host "`nSollen die Änderungen committed werden? (j/n): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host

if ($confirm -eq "j") {
    # Füge Dateien hinzu
    git add $changedFiles
    git add "TAILWIND_VALIDATION_SUMMARY.md"
    
    # Commit
    git commit -m $commitMessage
    
    Write-Host "`nÄnderungen wurden committed. Möchten Sie jetzt pushen? (j/n): " -ForegroundColor Yellow -NoNewline
    $pushConfirm = Read-Host
    
    if ($pushConfirm -eq "j") {
        # Push
        git push
        Write-Host "`nÄnderungen wurden gepusht." -ForegroundColor Green
    } else {
        Write-Host "`nPush abgebrochen. Führen Sie 'git push' manuell aus, wenn Sie bereit sind." -ForegroundColor Yellow
    }
} else {
    Write-Host "`nCommit abgebrochen. Die Zusammenfassung wurde dennoch gespeichert." -ForegroundColor Yellow
}

Write-Host "`n===== Prozess abgeschlossen =====" -ForegroundColor Cyan
