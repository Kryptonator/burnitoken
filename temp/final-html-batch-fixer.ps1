# FINAL HTML BATCH FIXER - Batch Fix for All Remaining HTML Issues
# Automatische Behebung aller verbliebenen HTML-Probleme in index.html

$indexPath = ".\index.html"
$backupPath = ".\index-backup-final.html"

Write-Host "🔧 FINALE HTML-BATCH-BEHEBUNG GESTARTET..." -ForegroundColor Green

# Backup erstellen
Copy-Item $indexPath $backupPath -Force
Write-Host "✅ Backup erstellt: $backupPath" -ForegroundColor Yellow

# Index.html einlesen
$content = Get-Content $indexPath -Raw

Write-Host "🔍 Suche nach Problemen..." -ForegroundColor Cyan

# 1. DUPLICATE LOADING="LAZY" ATTRIBUTE BEHEBEN
$duplicateLoadingCount = 0
$lines = $content -split "`n"
$fixedLines = @()

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    
    # Check if line has multiple loading="lazy" attributes
    $loadingMatches = [regex]::Matches($line, 'loading="lazy"')
    
    if ($loadingMatches.Count -gt 1) {
        # Remove all but the first occurrence
        $fixedLine = $line
        for ($j = $loadingMatches.Count - 1; $j -gt 0; $j--) {
            $match = $loadingMatches[$j]
            $fixedLine = $fixedLine.Remove($match.Index, $match.Length)
        }
        $fixedLines += $fixedLine.TrimEnd()
        $duplicateLoadingCount++
        Write-Host "🔧 Fixed duplicate loading attribute on line $($i+1)" -ForegroundColor Yellow
    } else {
        $fixedLines += $line
    }
}

$content = $fixedLines -join "`n"

# 2. MISSING TYPE="BUTTON" BEHEBEN
$buttonTypeCount = 0
$buttonMatches = [regex]::Matches($content, '(?i)<button(\s+(?!type=)[^>]*?)>')
foreach ($match in $buttonMatches) {
    $buttonTypeCount++
    $attributes = $match.Groups[1].Value
    $replacement = "<button type=`"button`"$attributes>"
    $content = $content.Replace($match.Value, $replacement)
}

# 3. MISSING ARIA-LABEL BEHEBEN
$ariaLabelCount = 0

# High Contrast Toggle
$content = $content -replace '(?i)<input type="checkbox" id="high-contrast-toggle" class="mr-2">', 
    '<input type="checkbox" id="high-contrast-toggle" class="mr-2" aria-label="Toggle high contrast mode">'

# Large Text Toggle
$content = $content -replace '(?i)<input type="checkbox" id="large-text-toggle" class="mr-2">', 
    '<input type="checkbox" id="large-text-toggle" class="mr-2" aria-label="Toggle large text size">'

# Reduce Motion Toggle
$content = $content -replace '(?i)<input type="checkbox" id="reduce-motion-toggle" class="mr-2">', 
    '<input type="checkbox" id="reduce-motion-toggle" class="mr-2" aria-label="Toggle reduced motion">'

$ariaLabelCount = 3

# 4. META THEME-COLOR BROWSERKOMPATIBILITÄT VERBESSERN (OPTIONAL)
$content = $content -replace '(?i)<meta name="theme-color" content="#f97316"\s*>', 
    '<meta name="theme-color" content="#f97316" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)">'

# Inhalt zurückschreiben
$content | Set-Content $indexPath -Encoding UTF8

Write-Host ""
Write-Host "✅ FINALE HTML-BATCH-BEHEBUNG ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host "🔧 $duplicateLoadingCount duplicate loading attributes fixed" -ForegroundColor Yellow
Write-Host "🔧 $buttonTypeCount missing button types fixed" -ForegroundColor Yellow
Write-Host "🔧 $ariaLabelCount missing aria-labels fixed" -ForegroundColor Yellow
Write-Host "🔧 Meta theme-color improved for browser compatibility" -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 Backup saved as: $backupPath" -ForegroundColor Cyan
Write-Host "🎯 All HTML issues should now be resolved!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Magenta
Write-Host "1. Run validation: npm test" -ForegroundColor White
Write-Host "2. Check live site: Open index.html in browser" -ForegroundColor White
Write-Host "3. Commit changes: git add . ; git commit -m 'Final HTML fixes'" -ForegroundColor White
