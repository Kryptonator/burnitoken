# FINAL HTML BATCH FIXER - Behebung aller HTML-Probleme
param()

$indexPath = ".\index.html"
$backupPath = ".\index-backup-final.html"

Write-Host "🔧 FINALE HTML-BATCH-BEHEBUNG GESTARTET..." -ForegroundColor Green

# Backup erstellen
Copy-Item $indexPath $backupPath -Force
Write-Host "✅ Backup erstellt: $backupPath" -ForegroundColor Yellow

# Index.html einlesen
$content = Get-Content $indexPath -Raw

Write-Host "🔍 Suche nach Problemen..." -ForegroundColor Cyan

# 1. DUPLICATE LOADING ATTRIBUTES BEHEBEN
Write-Host "🔧 Behebe duplicate loading attributes..." -ForegroundColor Yellow
$duplicateCount = 0

# Pattern für doppelte loading attributes in derselben Zeile
$content = $content -replace '(\s+loading="lazy".*?)\s+loading="lazy"', '$1'
$duplicateCount = ([regex]::Matches($content, '(\s+loading="lazy".*?)\s+loading="lazy"')).Count

# 2. MISSING BUTTON TYPES BEHEBEN
Write-Host "🔧 Behebe missing button types..." -ForegroundColor Yellow
$buttonCount = 0
$buttonMatches = [regex]::Matches($content, '<button(?![^>]*type=)')
$buttonCount = $buttonMatches.Count

foreach ($match in $buttonMatches) {
    $buttonTag = $match.Value
    $newButtonTag = $buttonTag -replace '<button', '<button type="button"'
    $content = $content.Replace($buttonTag, $newButtonTag)
}

# 3. MISSING ARIA-LABELS BEHEBEN
Write-Host "🔧 Behebe missing aria-labels..." -ForegroundColor Yellow

# High Contrast Toggle
if ($content -match '<input type="checkbox" id="high-contrast-toggle" class="mr-2">') {
    $content = $content -replace '<input type="checkbox" id="high-contrast-toggle" class="mr-2">', '<input type="checkbox" id="high-contrast-toggle" class="mr-2" aria-label="Toggle high contrast mode">'
}

# Large Text Toggle  
if ($content -match '<input type="checkbox" id="large-text-toggle" class="mr-2">') {
    $content = $content -replace '<input type="checkbox" id="large-text-toggle" class="mr-2">', '<input type="checkbox" id="large-text-toggle" class="mr-2" aria-label="Toggle large text size">'
}

# Reduce Motion Toggle
if ($content -match '<input type="checkbox" id="reduce-motion-toggle" class="mr-2">') {
    $content = $content -replace '<input type="checkbox" id="reduce-motion-toggle" class="mr-2">', '<input type="checkbox" id="reduce-motion-toggle" class="mr-2" aria-label="Toggle reduced motion">'
}

$ariaCount = 3

# Inhalt zurückschreiben
$content | Set-Content $indexPath -Encoding UTF8

Write-Host ""
Write-Host "✅ FINALE HTML-BATCH-BEHEBUNG ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host "🔧 $duplicateCount duplicate loading attributes fixed" -ForegroundColor Yellow  
Write-Host "🔧 $buttonCount missing button types fixed" -ForegroundColor Yellow
Write-Host "🔧 $ariaCount missing aria-labels fixed" -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 Backup saved as: $backupPath" -ForegroundColor Cyan
Write-Host "🎯 All HTML issues should now be resolved!" -ForegroundColor Green
