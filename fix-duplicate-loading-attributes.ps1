# Fix Duplicate loading="lazy" Attributes in index.html
# This script removes duplicate loading="lazy" attributes systematically

$filePath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\index.html"
$backupPath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\index-backup-loading-fix.html"

Write-Host "Creating backup of index.html..." -ForegroundColor Yellow
Copy-Item $filePath $backupPath

Write-Host "Reading index.html content..." -ForegroundColor Yellow
$content = Get-Content $filePath -Raw

Write-Host "Initial content length: $($content.Length) characters" -ForegroundColor Cyan

# Count initial duplicate loading attributes
$initialLoadingCount = ([regex]::Matches($content, 'loading="lazy"')).Count
Write-Host "Initial loading='lazy' attributes found: $initialLoadingCount" -ForegroundColor Cyan

# Remove duplicate loading="lazy" attributes in specific patterns
# Pattern 1: Multiple loading="lazy" on same line or consecutive lines
$content = $content -replace '(\s+loading="lazy")\s+([^>]*)\s+loading="lazy"', '$1$2'
$content = $content -replace 'loading="lazy"\s+([^>]*)\s+loading="lazy"', 'loading="lazy"$1'

# Pattern 2: Remove loading="lazy" that appears after other attributes on img tags
$content = $content -replace '(<img[^>]+)(loading="lazy")([^>]+)(loading="lazy")', '$1$2$3'

# Pattern 3: Clean up any remaining consecutive loading="lazy" attributes
$content = $content -replace 'loading="lazy"\s*loading="lazy"', 'loading="lazy"'

# Pattern 4: Handle multi-line duplicates more aggressively
$lines = $content -split "`n"
$cleanedLines = @()

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    
    # If this line contains loading="lazy" and the next line also does, remove from next line
    if ($line -match 'loading="lazy"' -and $i + 1 -lt $lines.Length -and $lines[$i + 1] -match '^\s*loading="lazy"') {
        $cleanedLines += $line
        $i++ # Skip the next line with duplicate loading="lazy"
        # Add the next line without the loading="lazy" part
        $nextLine = $lines[$i] -replace '^\s*loading="lazy"\s*', ''
        if ($nextLine.Trim() -ne '') {
            $cleanedLines += $nextLine
        }
    }
    # If this line only contains loading="lazy" and previous line had it, skip this line
    elseif ($line -match '^\s*loading="lazy"\s*$' -and $cleanedLines.Count -gt 0 -and $cleanedLines[-1] -match 'loading="lazy"') {
        # Skip this duplicate line
        continue
    }
    else {
        $cleanedLines += $line
    }
}

$content = $cleanedLines -join "`n"

# Final cleanup: Remove any remaining duplicate loading attributes
$content = $content -replace 'loading="lazy"([^>]*?)loading="lazy"', 'loading="lazy"$1'

# Count final loading attributes
$finalLoadingCount = ([regex]::Matches($content, 'loading="lazy"')).Count
Write-Host "Final loading='lazy' attributes: $finalLoadingCount" -ForegroundColor Green
Write-Host "Removed $($initialLoadingCount - $finalLoadingCount) duplicate loading attributes" -ForegroundColor Green

Write-Host "Writing cleaned content back to index.html..." -ForegroundColor Yellow
Set-Content $filePath $content -Encoding UTF8

Write-Host "✅ Fixed duplicate loading='lazy' attributes in index.html" -ForegroundColor Green
Write-Host "📁 Backup saved as: index-backup-loading-fix.html" -ForegroundColor Cyan

# Validate the fix
Write-Host "`n🔍 Running validation..." -ForegroundColor Yellow
$validationContent = Get-Content $filePath -Raw
$remainingDuplicates = ([regex]::Matches($validationContent, 'loading="lazy"[^>]*loading="lazy"')).Count

if ($remainingDuplicates -eq 0) {
    Write-Host "✅ SUCCESS: No duplicate loading='lazy' attributes found!" -ForegroundColor Green
} else {
    Write-Host "⚠️ WARNING: $remainingDuplicates potential duplicates still exist" -ForegroundColor Red
}

Write-Host "Final content length: $($validationContent.Length) characters" -ForegroundColor Cyan
