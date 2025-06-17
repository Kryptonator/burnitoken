#!/usr/bin/env powershell

# 🔧 PowerShell HTML Auto-Fixer
# Fixes duplicate loading attributes and encoding issues

Write-Host "🔧 STARTING HTML AUTO-FIXER" -ForegroundColor Cyan

$filePath = "index.html"
$backupPath = "index.html.backup-before-auto-fix"

# Create backup
Write-Host "📋 Creating backup: $backupPath" -ForegroundColor Yellow
Copy-Item $filePath $backupPath -Force

# Read content
$content = Get-Content $filePath -Raw -Encoding UTF8

Write-Host "📄 Original file size: $($content.Length) characters" -ForegroundColor Gray

# Fix 1: Remove duplicate loading="lazy" attributes
Write-Host "🔧 Fixing duplicate loading attributes..." -ForegroundColor Green

# Pattern to match img tags with multiple loading attributes
$pattern = '(<img[^>]*?)(\s+loading="lazy")(.*?)(\s+loading="lazy")(.*?>)'
$fixCount = 0

while ($content -match $pattern) {
    $content = $content -replace $pattern, '$1$2$3$5'
    $fixCount++
    if ($fixCount -gt 100) { break } # Safety break
}

Write-Host "✅ Fixed $fixCount duplicate loading attributes" -ForegroundColor Green

# Fix 2: Encode unescaped ampersands
Write-Host "🔧 Fixing unescaped ampersands..." -ForegroundColor Green

$ampersandFixes = 0
# Fix & in text content that's not already encoded
$content = $content -replace '(?<!&amp;)(?<!&lt;)(?<!&gt;)(?<!&quot;)&(?!amp;)(?!lt;)(?!gt;)(?!quot;)(?!#\d+;)(?![a-zA-Z]+;)', '&amp;'

Write-Host "✅ Fixed ampersand encoding" -ForegroundColor Green

# Fix 3: Remove non-existent hreflang links
Write-Host "🔧 Removing non-existent hreflang links..." -ForegroundColor Green

$hreflangPattern = '\s*<link rel="alternate" hreflang="(?!x-default)[^"]*" href="[^"]*/(en|de|es|fr|ar|bn|ja|pt|ko|ru|tr|zh|hi|it)" >\s*'
$beforeHref = ($content | Select-String -Pattern $hreflangPattern -AllMatches).Matches.Count
$content = $content -replace $hreflangPattern, ''

Write-Host "✅ Removed $beforeHref non-existent hreflang links" -ForegroundColor Green

# Save fixed content
Set-Content $filePath $content -Encoding UTF8 -NoNewline

Write-Host "📄 New file size: $($content.Length) characters" -ForegroundColor Gray
Write-Host "💾 Fixed file saved: $filePath" -ForegroundColor Green

# Generate summary
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    file = $filePath
    backup = $backupPath
    duplicateLoadingFixes = $fixCount
    hreflangLinksRemoved = $beforeHref
    originalSize = (Get-Content $backupPath -Raw).Length
    newSize = $content.Length
}

$report | ConvertTo-Json -Depth 2 | Set-Content "html-autofix-report.json" -Encoding UTF8

Write-Host "📊 SUMMARY:" -ForegroundColor Cyan
Write-Host "  - Duplicate loading attributes fixed: $fixCount" -ForegroundColor White
Write-Host "  - Non-existent hreflang links removed: $beforeHref" -ForegroundColor White
Write-Host "  - Backup created: $backupPath" -ForegroundColor White
Write-Host "  - Report saved: html-autofix-report.json" -ForegroundColor White

Write-Host "`n✅ HTML AUTO-FIX COMPLETED!" -ForegroundColor Green
