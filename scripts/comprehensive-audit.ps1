# 🔍 COMPREHENSIVE LIVE WEBSITE AUDIT (PowerShell)
# Prüft alle Aspekte einer Live-Website

param(
    [string]$Url = "https://burnitoken.website"
)

$ReportFile = "docs/LIVE_AUDIT_REPORT_$(Get-Date -Format 'yyyy-MM-dd').md"
$Results = @{}

Write-Host "🔍 STARTING COMPREHENSIVE LIVE AUDIT..." -ForegroundColor Yellow
Write-Host "🌐 Target: $Url" -ForegroundColor Cyan
Write-Host "⏰ Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# 1. PERFORMANCE AUDIT
Write-Host "`n⚡ PERFORMANCE AUDIT" -ForegroundColor Green
$startTime = Get-Date
try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30
    $endTime = Get-Date
    $responseTime = ($endTime - $startTime).TotalMilliseconds
    
    $Results.Performance = @{
        ResponseTime = [math]::Round($responseTime, 0)
        StatusCode = $response.StatusCode
        ContentLength = $response.Content.Length
        SizeMB = [math]::Round($response.Content.Length / 1MB, 2)
        Headers = $response.Headers
    }
    
    Write-Host "✅ Response: $($response.StatusCode) ($([math]::Round($responseTime, 0))ms)" -ForegroundColor Green
    Write-Host "📦 Size: $($Results.Performance.SizeMB)MB" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to fetch website: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. HTML CONTENT ANALYSIS
Write-Host "`n📄 HTML CONTENT ANALYSIS" -ForegroundColor Green
$html = $response.Content

# SEO Analysis
$Results.SEO = @{
    Title = if ($html -match '<title[^>]*>([^<]+)</title>') { $matches[1].Trim() } else { $null }
    Description = if ($html -match '<meta[^>]*name=["\''']description["\'''][^>]*content=["\''']([^"'\'']+)["\''']') { $matches[1].Trim() } else { $null }
    H1Count = ([regex]::Matches($html, '<h1[^>]*>', 'IgnoreCase')).Count
    H2Count = ([regex]::Matches($html, '<h2[^>]*>', 'IgnoreCase')).Count
    H3Count = ([regex]::Matches($html, '<h3[^>]*>', 'IgnoreCase')).Count
    ImageCount = ([regex]::Matches($html, '<img[^>]*>', 'IgnoreCase')).Count
    ImagesWithoutAlt = ([regex]::Matches($html, '<img(?![^>]*alt=)[^>]*>', 'IgnoreCase')).Count
    HasCanonical = $html -match '<link[^>]*rel=["\''']canonical["\''']'
    HasOpenGraph = $html -match 'property=["\''']og:'
    HasJsonLd = $html -match 'application/ld\+json'
}

if ($Results.SEO.Title) {
    $Results.SEO.TitleLength = $Results.SEO.Title.Length
    Write-Host "✅ Title: '$($Results.SEO.Title)' ($($Results.SEO.TitleLength) chars)" -ForegroundColor Green
} else {
    Write-Host "❌ Title: Missing" -ForegroundColor Red
    $Results.SEO.TitleLength = 0
}

if ($Results.SEO.Description) {
    $Results.SEO.DescriptionLength = $Results.SEO.Description.Length
    Write-Host "✅ Description: $($Results.SEO.DescriptionLength) chars" -ForegroundColor Green
} else {
    Write-Host "❌ Description: Missing" -ForegroundColor Red
    $Results.SEO.DescriptionLength = 0
}

# 3. ACCESSIBILITY AUDIT
Write-Host "`n♿ ACCESSIBILITY AUDIT" -ForegroundColor Green
$Results.Accessibility = @{
    HasLangAttribute = $html -match '<html[^>]*lang='
    AriaLabelsCount = ([regex]::Matches($html, 'aria-label=', 'IgnoreCase')).Count
    AriaDescribedByCount = ([regex]::Matches($html, 'aria-describedby=', 'IgnoreCase')).Count
    FormInputsCount = ([regex]::Matches($html, '<input[^>]*>', 'IgnoreCase')).Count
    FormLabelsCount = ([regex]::Matches($html, '<label[^>]*>', 'IgnoreCase')).Count
    HasSkipLinks = $html -match 'skip.*content' -or $html -match 'skip.*main'
}

Write-Host "📋 Lang Attribute: $(if ($Results.Accessibility.HasLangAttribute) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($Results.Accessibility.HasLangAttribute) { 'Green' } else { 'Red' })
Write-Host "📋 ARIA Labels: $($Results.Accessibility.AriaLabelsCount)" -ForegroundColor Cyan
Write-Host "📋 Form Inputs: $($Results.Accessibility.FormInputsCount)" -ForegroundColor Cyan
Write-Host "📋 Form Labels: $($Results.Accessibility.FormLabelsCount)" -ForegroundColor Cyan

# 4. SECURITY AUDIT
Write-Host "`n🔒 SECURITY AUDIT" -ForegroundColor Green
$Results.Security = @{
    HasHTTPS = $Url.StartsWith('https://')
    HasHSTS = $response.Headers.ContainsKey('Strict-Transport-Security')
    HasCSP = $response.Headers.ContainsKey('Content-Security-Policy')
    HasXFrameOptions = $response.Headers.ContainsKey('X-Frame-Options')
    HasXContentTypeOptions = $response.Headers.ContainsKey('X-Content-Type-Options')
    HasMixedContent = $html -match 'http://' -and $Url.StartsWith('https://')
    ExternalScriptsCount = ([regex]::Matches($html, '<script[^>]*src=["\''']([^"'\'']+)["\''']', 'IgnoreCase')).Count
    InlineScriptsCount = ([regex]::Matches($html, '<script[^>]*>(?!.*src=)', 'IgnoreCase')).Count
}

Write-Host "🔐 HTTPS: $(if ($Results.Security.HasHTTPS) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($Results.Security.HasHTTPS) { 'Green' } else { 'Red' })
Write-Host "🔐 HSTS: $(if ($Results.Security.HasHSTS) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($Results.Security.HasHSTS) { 'Green' } else { 'Red' })
Write-Host "🔐 CSP: $(if ($Results.Security.HasCSP) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($Results.Security.HasCSP) { 'Green' } else { 'Red' })

# 5. MOBILE AUDIT
Write-Host "`n📱 MOBILE AUDIT" -ForegroundColor Green
$Results.Mobile = @{
    HasViewport = $html -match '<meta[^>]*name=["\''']viewport["\''']'
    HasMediaQueries = $html -match '@media' -or $html -match 'responsive'
    HasAppleTouchIcon = $html -match 'apple-touch-icon'
    HasAppleMobileWebApp = $html -match 'apple-mobile-web-app-capable'
}

Write-Host "📱 Viewport: $(if ($Results.Mobile.HasViewport) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($Results.Mobile.HasViewport) { 'Green' } else { 'Red' })
Write-Host "📱 Responsive: $(if ($Results.Mobile.HasMediaQueries) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($Results.Mobile.HasMediaQueries) { 'Green' } else { 'Red' })

# 6. ASSET TESTING
Write-Host "`n📦 ASSET TESTING" -ForegroundColor Green

# Test kritische JavaScript-Dateien
$jsFiles = @(
    '/sentry.client.js',
    '/assets/analytics-dashboard.js',
    '/assets/price-tracker.js',
    '/assets/community-features.js',
    '/assets/xrpl-data.js',
    '/test-burni-live-prices.js',
    '/test-price-widget.js',
    '/enhanced-price-widget.js'
)

$Results.Assets = @{
    WorkingJS = @()
    FailingJS = @()
    CSSFiles = ([regex]::Matches($html, '<link[^>]*rel=["\''']stylesheet["\''']', 'IgnoreCase')).Count
}

foreach ($jsFile in $jsFiles) {
    $jsUrl = $Url + $jsFile
    try {
        $jsResponse = Invoke-WebRequest -Uri $jsUrl -Method Head -UseBasicParsing -TimeoutSec 10
        if ($jsResponse.StatusCode -eq 200) {
            Write-Host "✅ $jsFile" -ForegroundColor Green
            $Results.Assets.WorkingJS += $jsFile
        } else {
            Write-Host "⚠️ $jsFile ($($jsResponse.StatusCode))" -ForegroundColor Yellow
            $Results.Assets.FailingJS += $jsFile
        }
    } catch {
        Write-Host "❌ $jsFile (404 Not Found)" -ForegroundColor Red
        $Results.Assets.FailingJS += $jsFile
    }
}

# 7. CALCULATE SCORES
Write-Host "`n📊 CALCULATING SCORES" -ForegroundColor Green

function Calculate-PerformanceScore {
    $score = 100
    if ($Results.Performance.ResponseTime -gt 1000) { $score -= 30 }
    elseif ($Results.Performance.ResponseTime -gt 500) { $score -= 15 }
    
    if ($Results.Performance.StatusCode -ne 200) { $score -= 20 }
    
    if ($Results.Performance.SizeMB -gt 1) { $score -= 20 }
    elseif ($Results.Performance.SizeMB -gt 0.5) { $score -= 10 }
    
    return [math]::Max(0, $score)
}

function Calculate-SEOScore {
    $score = 100
    if (-not $Results.SEO.Title) { $score -= 20 }
    if (-not $Results.SEO.Description) { $score -= 20 }
    if ($Results.SEO.H1Count -eq 0) { $score -= 15 }
    if ($Results.SEO.ImagesWithoutAlt -gt 0) { $score -= 10 }
    if (-not $Results.SEO.HasCanonical) { $score -= 10 }
    if (-not $Results.SEO.HasOpenGraph) { $score -= 10 }
    if (-not $Results.SEO.HasJsonLd) { $score -= 15 }
    
    return [math]::Max(0, $score)
}

function Calculate-AccessibilityScore {
    $score = 100
    if (-not $Results.Accessibility.HasLangAttribute) { $score -= 20 }
    if ($Results.Accessibility.AriaLabelsCount -eq 0) { $score -= 15 }
    if (-not $Results.Accessibility.HasSkipLinks) { $score -= 15 }
    
    if ($Results.Accessibility.FormInputsCount -gt 0) {
        $labelCoverage = ($Results.Accessibility.FormLabelsCount / $Results.Accessibility.FormInputsCount) * 100
        if ($labelCoverage -lt 100) { $score -= (100 - $labelCoverage) * 0.4 }
    }
    
    return [math]::Max(0, $score)
}

function Calculate-SecurityScore {
    $score = 100
    if (-not $Results.Security.HasHTTPS) { $score -= 30 }
    if (-not $Results.Security.HasHSTS) { $score -= 15 }
    if (-not $Results.Security.HasCSP) { $score -= 20 }
    if (-not $Results.Security.HasXFrameOptions) { $score -= 10 }
    if (-not $Results.Security.HasXContentTypeOptions) { $score -= 10 }
    if ($Results.Security.HasMixedContent) { $score -= 15 }
    
    return [math]::Max(0, $score)
}

function Calculate-MobileScore {
    $score = 100
    if (-not $Results.Mobile.HasViewport) { $score -= 30 }
    if (-not $Results.Mobile.HasMediaQueries) { $score -= 25 }
    if (-not $Results.Mobile.HasAppleTouchIcon) { $score -= 15 }
    if (-not $Results.Mobile.HasAppleMobileWebApp) { $score -= 15 }
    
    return [math]::Max(0, $score)
}

$Scores = @{
    Performance = Calculate-PerformanceScore
    SEO = Calculate-SEOScore
    Accessibility = Calculate-AccessibilityScore
    Security = Calculate-SecurityScore
    Mobile = Calculate-MobileScore
}

$OverallScore = ($Scores.Values | Measure-Object -Average).Average

# 8. GENERATE REPORT
Write-Host "`n📄 GENERATING REPORT" -ForegroundColor Green

$reportContent = @"
# 🔍 COMPREHENSIVE LIVE WEBSITE AUDIT REPORT

**Website:** $Url  
**Date:** $(Get-Date -Format 'yyyy-MM-dd')  
**Time:** $(Get-Date -Format 'HH:mm:ss') GMT  

## 📊 EXECUTIVE SUMMARY

**Overall Score: $([math]::Round($OverallScore, 1))/100**

| Category | Score | Status |
|----------|-------|---------|
| Performance | $($Scores.Performance)/100 | $(if ($Scores.Performance -ge 90) { '🟢 Excellent' } elseif ($Scores.Performance -ge 70) { '🟡 Good' } elseif ($Scores.Performance -ge 50) { '🟠 Fair' } else { '🔴 Poor' }) |
| SEO | $($Scores.SEO)/100 | $(if ($Scores.SEO -ge 90) { '🟢 Excellent' } elseif ($Scores.SEO -ge 70) { '🟡 Good' } elseif ($Scores.SEO -ge 50) { '🟠 Fair' } else { '🔴 Poor' }) |
| Accessibility | $($Scores.Accessibility)/100 | $(if ($Scores.Accessibility -ge 90) { '🟢 Excellent' } elseif ($Scores.Accessibility -ge 70) { '🟡 Good' } elseif ($Scores.Accessibility -ge 50) { '🟠 Fair' } else { '🔴 Poor' }) |
| Security | $($Scores.Security)/100 | $(if ($Scores.Security -ge 90) { '🟢 Excellent' } elseif ($Scores.Security -ge 70) { '🟡 Good' } elseif ($Scores.Security -ge 50) { '🟠 Fair' } else { '🔴 Poor' }) |
| Mobile | $($Scores.Mobile)/100 | $(if ($Scores.Mobile -ge 90) { '🟢 Excellent' } elseif ($Scores.Mobile -ge 70) { '🟡 Good' } elseif ($Scores.Mobile -ge 50) { '🟠 Fair' } else { '🔴 Poor' }) |

## ⚡ PERFORMANCE AUDIT

### Response Metrics
- **Response Time:** $($Results.Performance.ResponseTime)ms
- **Status Code:** $($Results.Performance.StatusCode)
- **Content Size:** $($Results.Performance.SizeMB)MB

## 🔍 SEO AUDIT

### Meta Tags
- **Title:** $(if ($Results.SEO.Title) { $Results.SEO.Title } else { '❌ Missing' })
- **Title Length:** $($Results.SEO.TitleLength) chars $(if ($Results.SEO.TitleLength -ge 30 -and $Results.SEO.TitleLength -le 60) { '✅' } elseif ($Results.SEO.TitleLength -gt 60) { '⚠️ Too long' } else { '⚠️ Too short' })
- **Description:** $(if ($Results.SEO.Description) { "Present ($($Results.SEO.DescriptionLength) chars)" } else { '❌ Missing' })

### Content Structure
- **H1 Tags:** $($Results.SEO.H1Count)
- **H2 Tags:** $($Results.SEO.H2Count)
- **H3 Tags:** $($Results.SEO.H3Count)

### Images
- **Total Images:** $($Results.SEO.ImageCount)
- **Images without Alt:** $($Results.SEO.ImagesWithoutAlt) $(if ($Results.SEO.ImagesWithoutAlt -gt 0) { '⚠️' } else { '✅' })

### Advanced SEO
- **Canonical URL:** $(if ($Results.SEO.HasCanonical) { '✅ Yes' } else { '❌ No' })
- **Open Graph:** $(if ($Results.SEO.HasOpenGraph) { '✅ Yes' } else { '❌ No' })
- **JSON-LD:** $(if ($Results.SEO.HasJsonLd) { '✅ Yes' } else { '❌ No' })

## ♿ ACCESSIBILITY AUDIT

### Basic Requirements
- **Lang Attribute:** $(if ($Results.Accessibility.HasLangAttribute) { '✅ Yes' } else { '❌ No' })
- **ARIA Labels:** $($Results.Accessibility.AriaLabelsCount)
- **ARIA Described By:** $($Results.Accessibility.AriaDescribedByCount)

### Forms
- **Form Inputs:** $($Results.Accessibility.FormInputsCount)
- **Form Labels:** $($Results.Accessibility.FormLabelsCount)

### Navigation
- **Skip Links:** $(if ($Results.Accessibility.HasSkipLinks) { '✅ Yes' } else { '❌ No' })

## 🔒 SECURITY AUDIT

### Protocol & Headers
- **HTTPS:** $(if ($Results.Security.HasHTTPS) { '✅ Yes' } else { '❌ No' })
- **HSTS:** $(if ($Results.Security.HasHSTS) { '✅ Yes' } else { '❌ No' })
- **CSP:** $(if ($Results.Security.HasCSP) { '✅ Yes' } else { '❌ No' })
- **X-Frame-Options:** $(if ($Results.Security.HasXFrameOptions) { '✅ Yes' } else { '❌ No' })
- **X-Content-Type-Options:** $(if ($Results.Security.HasXContentTypeOptions) { '✅ Yes' } else { '❌ No' })

### Content Security
- **Mixed Content:** $(if ($Results.Security.HasMixedContent) { '⚠️ Found' } else { '✅ None' })
- **External Scripts:** $($Results.Security.ExternalScriptsCount)
- **Inline Scripts:** $($Results.Security.InlineScriptsCount)

## 📦 ASSETS AUDIT

### JavaScript Files Status
- **Working JS Files:** $($Results.Assets.WorkingJS.Count)
- **Failing JS Files:** $($Results.Assets.FailingJS.Count)

#### ✅ Working JavaScript Files:
$($Results.Assets.WorkingJS | ForEach-Object { "- ✅ $_" } | Out-String)

#### ❌ Failing JavaScript Files:
$($Results.Assets.FailingJS | ForEach-Object { "- ❌ $_" } | Out-String)

### CSS Files
- **External CSS Files:** $($Results.Assets.CSSFiles)

## 📱 MOBILE AUDIT

### Viewport & Responsive
- **Has Viewport:** $(if ($Results.Mobile.HasViewport) { '✅ Yes' } else { '❌ No' })
- **Responsive CSS:** $(if ($Results.Mobile.HasMediaQueries) { '✅ Yes' } else { '❌ No' })

### Mobile Meta Tags
- **Apple Touch Icon:** $(if ($Results.Mobile.HasAppleTouchIcon) { '✅ Yes' } else { '❌ No' })
- **Apple Web App:** $(if ($Results.Mobile.HasAppleMobileWebApp) { '✅ Yes' } else { '❌ No' })

## 🎯 TOP RECOMMENDATIONS

$(if ($Results.Assets.FailingJS.Count -gt 0) { "🚨 **CRITICAL:** Fix $($Results.Assets.FailingJS.Count) missing JavaScript files" })
$(if (-not $Results.SEO.Title) { "🔍 **SEO:** Add a title tag to improve search visibility" })
$(if (-not $Results.SEO.Description) { "🔍 **SEO:** Add a meta description for better search snippets" })
$(if ($Results.SEO.ImagesWithoutAlt -gt 0) { "🖼️ **Accessibility:** Add alt text to $($Results.SEO.ImagesWithoutAlt) images" })
$(if (-not $Results.Security.HasCSP) { "🔒 **Security:** Implement Content Security Policy (CSP) headers" })
$(if (-not $Results.Accessibility.HasLangAttribute) { "♿ **Accessibility:** Add lang attribute to html tag" })
$(if (-not $Results.Mobile.HasViewport) { "📱 **Mobile:** Add viewport meta tag for responsive design" })

---

**Audit completed at:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Tool:** PowerShell Live Website Auditor  
"@

# Ensure docs directory exists
if (-not (Test-Path "docs")) {
    New-Item -ItemType Directory -Path "docs" -Force | Out-Null
}

# Save report
$reportContent | Out-File -FilePath $ReportFile -Encoding UTF8

Write-Host "`n✅ AUDIT COMPLETED!" -ForegroundColor Green
Write-Host "📄 Report saved to: $ReportFile" -ForegroundColor Cyan
Write-Host "🎯 Overall Score: $([math]::Round($OverallScore, 1))/100" -ForegroundColor $(if ($OverallScore -ge 80) { 'Green' } elseif ($OverallScore -ge 60) { 'Yellow' } else { 'Red' })

# Display summary
Write-Host "`n📊 SUMMARY:" -ForegroundColor Yellow
Write-Host "⚡ Performance: $($Scores.Performance)/100" -ForegroundColor Cyan
Write-Host "🔍 SEO: $($Scores.SEO)/100" -ForegroundColor Cyan
Write-Host "♿ Accessibility: $($Scores.Accessibility)/100" -ForegroundColor Cyan
Write-Host "🔒 Security: $($Scores.Security)/100" -ForegroundColor Cyan
Write-Host "📱 Mobile: $($Scores.Mobile)/100" -ForegroundColor Cyan

if ($Results.Assets.FailingJS.Count -gt 0) {
    Write-Host "`n🚨 CRITICAL ISSUES FOUND:" -ForegroundColor Red
    Write-Host "❌ $($Results.Assets.FailingJS.Count) JavaScript files are missing (404)" -ForegroundColor Red
    Write-Host "This explains the 'tausende Fehler' you mentioned!" -ForegroundColor Yellow
}
