# FINAL HTML BATCH FIXER - Clean Version
$indexPath = ".\index.html"
$backupPath = ".\index-backup-final.html"

Write-Host "FINALE HTML-BATCH-BEHEBUNG GESTARTET..." -ForegroundColor Green

# Backup erstellen
Copy-Item $indexPath $backupPath -Force
Write-Host "Backup erstellt: $backupPath" -ForegroundColor Yellow

# Index.html einlesen
$content = Get-Content $indexPath -Raw

# 1. DUPLICATE LOADING ATTRIBUTES BEHEBEN (manuell durch Regex)
Write-Host "Behebe duplicate loading attributes..." -ForegroundColor Yellow

# Spezifische Zeilen mit doppelten loading attributes reparieren
$content = $content -replace '(\s+loading="lazy".*?)\s+loading="lazy"', '$1'
$content = $content -replace 'loading="lazy"\s+loading="lazy"', 'loading="lazy"'

# 2. MISSING BUTTON TYPES BEHEBEN  
Write-Host "Behebe missing button types..." -ForegroundColor Yellow
$content = $content -replace '<button\s+(?![^>]*type=)', '<button type="button" '

# 3. MISSING ARIA-LABELS BEHEBEN
Write-Host "Behebe missing aria-labels..." -ForegroundColor Yellow

$content = $content -replace '<input type="checkbox" id="high-contrast-toggle" class="mr-2">', '<input type="checkbox" id="high-contrast-toggle" class="mr-2" aria-label="Toggle high contrast mode">'

$content = $content -replace '<input type="checkbox" id="large-text-toggle" class="mr-2">', '<input type="checkbox" id="large-text-toggle" class="mr-2" aria-label="Toggle large text size">'

$content = $content -replace '<input type="checkbox" id="reduce-motion-toggle" class="mr-2">', '<input type="checkbox" id="reduce-motion-toggle" class="mr-2" aria-label="Toggle reduced motion">'

# Inhalt zurückschreiben
$content | Set-Content $indexPath -Encoding UTF8

Write-Host "FINALE HTML-BATCH-BEHEBUNG ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host "Backup saved as: $backupPath" -ForegroundColor Cyan
Write-Host "All HTML issues should now be resolved!" -ForegroundColor Green
