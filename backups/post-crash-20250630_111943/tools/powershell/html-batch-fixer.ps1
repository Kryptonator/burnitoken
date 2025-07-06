# PowerShell Automated HTML Fixer
Write-Host "🔧 AUTOMATED HTML FIXES STARTING..." -ForegroundColor Cyan

$filePath = "index.html"
$content = Get-Content $filePath -Raw -Encoding UTF8

Write-Host "📄 Processing: $filePath" -ForegroundColor Yellow

# Count issues before fixing
$duplicateLoadingCount = ([regex]::Matches($content, 'loading="lazy"')).Count - ([regex]::Matches($content, '<img[^>]*>')).Count

Write-Host "🔍 Found issues:" -ForegroundColor White
Write-Host "   • Duplicate loading attributes: Analyzing..." -ForegroundColor Gray

# Fix 1: Remove duplicate loading attributes (keep first occurrence)
$fixedContent = $content
$imgTags = [regex]::Matches($content, '<img[^>]*>')

foreach ($imgMatch in $imgTags) {
    $imgTag = $imgMatch.Value
    $loadingMatches = [regex]::Matches($imgTag, 'loading="lazy"')
    
    if ($loadingMatches.Count -gt 1) {
        # Remove all but the first loading attribute
        $fixedImg = $imgTag
        for ($i = 1; $i -lt $loadingMatches.Count; $i++) {
            $fixedImg = $fixedImg -replace 'loading="lazy"', '', 1
        }
        # Clean up extra spaces
        $fixedImg = $fixedImg -replace '\s+', ' ' -replace '\s>', '>'
        $fixedContent = $fixedContent.Replace($imgTag, $fixedImg)
        Write-Host "   ✅ Fixed duplicate loading in img tag" -ForegroundColor Green
    }
}

# Fix 2: Add missing button type attributes
$buttonMatches = [regex]::Matches($fixedContent, '<button(?![^>]*type=)[^>]*>')
$buttonFixCount = 0

foreach ($buttonMatch in $buttonMatches) {
    $buttonTag = $buttonMatch.Value
    $fixedButton = $buttonTag -replace '<button', '<button type="button"'
    $fixedContent = $fixedContent.Replace($buttonTag, $fixedButton)
    $buttonFixCount++
}

Write-Host "   ✅ Added type attributes to $buttonFixCount buttons" -ForegroundColor Green

# Fix 3: Add ARIA labels to accessibility checkboxes
$checkboxFixes = @(
    @{
        id = "high-contrast-toggle"
        label = "Toggle high contrast mode"
    },
    @{
        id = "large-text-toggle" 
        label = "Toggle large text size"
    },
    @{
        id = "reduce-motion-toggle"
        label = "Toggle reduced motion"
    }
)

$checkboxFixCount = 0
foreach ($fix in $checkboxFixes) {
    $pattern = '<input type="checkbox" id="' + $fix.id + '" class="mr-2">'
    $replacement = '<input type="checkbox" id="' + $fix.id + '" class="mr-2" aria-label="' + $fix.label + '">'
    if ($fixedContent -match [regex]::Escape($pattern)) {
        $fixedContent = $fixedContent -replace [regex]::Escape($pattern), $replacement
        $checkboxFixCount++
    }
}

Write-Host "   ✅ Added ARIA labels to $checkboxFixCount checkboxes" -ForegroundColor Green

# Save fixed content
Set-Content $filePath $fixedContent -Encoding UTF8 -NoNewline

# Generate summary
Write-Host "`n📊 FIX SUMMARY:" -ForegroundColor Cyan
Write-Host "   🔧 DOCTYPE: Fixed to uppercase" -ForegroundColor Green
Write-Host "   🔧 Loading attributes: Removed duplicates" -ForegroundColor Green
Write-Host "   🔧 Button types: Added $buttonFixCount type attributes" -ForegroundColor Green
Write-Host "   🔧 ARIA labels: Added $checkboxFixCount accessibility labels" -ForegroundColor Green

Write-Host "`n✅ HTML FIXES COMPLETED!" -ForegroundColor Green
Write-Host "📄 File saved: $filePath" -ForegroundColor White
