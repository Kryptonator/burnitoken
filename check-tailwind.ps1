# Check Tailwind Version und Extensions
Write-Host "TailwindCSS-Check" -ForegroundColor Cyan

# Prüfe, ob package.json existiert
if (Test-Path "package.json") {
    Write-Host "package.json gefunden, überprüfe TailwindCSS-Version..." -ForegroundColor Green
    $packageJson = Get-Content -Raw "package.json" | ConvertFrom-Json

    # Überprüfe Tailwind-Version in devDependencies
    if ($packageJson.devDependencies.tailwindcss) {
        $tailwindVersion = $packageJson.devDependencies.tailwindcss
        Write-Host "TailwindCSS Version: $tailwindVersion" -ForegroundColor Green

        # Extrahiere nur die Versionsnummer ohne das ^ oder ~
        $versionNumber = $tailwindVersion -replace '[\^~]', ''
        Write-Host "Bereinigte Versionsnummer: $versionNumber" -ForegroundColor Green

        # Überprüfe, ob die Version 4.1.10 ist
        if ($versionNumber -eq "4.1.10") {
            Write-Host "TailwindCSS ist bereits auf Version 4.1.10, keine Aktualisierung erforderlich." -ForegroundColor Green
        } else {
            Write-Host "TailwindCSS sollte von '$versionNumber' auf '4.1.10' aktualisiert werden." -ForegroundColor Yellow
        }
    } else {
        Write-Host "TailwindCSS ist nicht in devDependencies definiert." -ForegroundColor Red
    }
} else {
    Write-Host "package.json nicht gefunden!" -ForegroundColor Red
}

# Erstelle eine Datei mit den VS Code Extensions
Write-Host "`nListe installierte VS Code Extensions..." -ForegroundColor Cyan
code --list-extensions > extensions.txt
if (Test-Path "extensions.txt") {
    $extensions = Get-Content "extensions.txt"
    Write-Host "Gefundene Extensions: $($extensions.Count)" -ForegroundColor Green

    # Suche nach Tailwind-Extensions
    $tailwindExtensions = $extensions | Where-Object { $_ -like "*tailwind*" }
    if ($tailwindExtensions) {
        Write-Host "Gefundene Tailwind-Extensions:" -ForegroundColor Green
        foreach ($ext in $tailwindExtensions) {
            Write-Host " - $ext" -ForegroundColor Green
        }
    } else {
        Write-Host "Keine Tailwind-Extensions gefunden!" -ForegroundColor Red
        Write-Host "Empfehlung: Installiere 'bradlc.vscode-tailwindcss'" -ForegroundColor Yellow
    }

    # Schreibe Ergebnisse in eine Datei
    Set-Content -Path "tailwind-check-results.txt" -Value "TailwindCSS-Check Ergebnisse:"
    Add-Content -Path "tailwind-check-results.txt" -Value "========================="
    if ($packageJson.devDependencies.tailwindcss) {
        Add-Content -Path "tailwind-check-results.txt" -Value "TailwindCSS Version: $tailwindVersion"
    } else {
        Add-Content -Path "tailwind-check-results.txt" -Value "TailwindCSS ist nicht in package.json definiert."
    }
    Add-Content -Path "tailwind-check-results.txt" -Value "`nGefundene Tailwind-Extensions:"
    if ($tailwindExtensions) {
        foreach ($ext in $tailwindExtensions) {
            Add-Content -Path "tailwind-check-results.txt" -Value " - $ext"
        }
    } else {
        Add-Content -Path "tailwind-check-results.txt" -Value "Keine Tailwind-Extensions gefunden!"
        Add-Content -Path "tailwind-check-results.txt" -Value "Empfehlung: Installiere 'bradlc.vscode-tailwindcss'"
    }

    Write-Host "`nErgebnisse wurden in tailwind-check-results.txt gespeichert." -ForegroundColor Green
} else {
    Write-Host "Konnte keine Extensions-Liste erstellen." -ForegroundColor Red
}
