# Fix spacing issues between HTML attributes
# This script adds missing spaces between HTML attributes

$filePath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\index.html"
$backupPath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\index-backup-spacing-fix.html"

Write-Host "Creating backup of index.html..." -ForegroundColor Yellow
Copy-Item $filePath $backupPath

Write-Host "Reading index.html content..." -ForegroundColor Yellow
$content = Get-Content $filePath -Raw

Write-Host "Fixing spacing between HTML attributes..." -ForegroundColor Yellow

# Fix specific spacing issues found
$content = $content -replace 'loading="lazy"srcset=', 'loading="lazy" srcset='
$content = $content -replace 'loading="lazy"alt=', 'loading="lazy" alt='
$content = $content -replace 'loading="lazy"class=', 'loading="lazy" class='
$content = $content -replace 'loading="lazy"data-', 'loading="lazy" data-'

# General patterns for missing spaces between attributes
$content = $content -replace '="([^"]*)"([a-zA-Z-]+)=', '="$1" $2='
$content = $content -replace '([a-zA-Z-]+)="([^"]*)"([a-zA-Z-]+)="', '$1="$2" $3="'

# Fix any remaining attribute spacing issues
$content = $content -replace '"([a-zA-Z][a-zA-Z0-9-]*)=', '" $1='

Write-Host "Writing fixed content back to index.html..." -ForegroundColor Yellow
Set-Content $filePath $content -Encoding UTF8

Write-Host "✅ Fixed spacing issues between HTML attributes" -ForegroundColor Green
Write-Host "📁 Backup saved as: index-backup-spacing-fix.html" -ForegroundColor Cyan

# Quick validation
Write-Host "`n🔍 Running quick validation..." -ForegroundColor Yellow
$testContent = Get-Content $filePath -Raw
$spacingIssues = ([regex]::Matches($testContent, '="[^"]*"[a-zA-Z]')).Count

Write-Host "Potential spacing issues remaining: $spacingIssues" -ForegroundColor $(if ($spacingIssues -eq 0) { "Green" } else { "Yellow" })
