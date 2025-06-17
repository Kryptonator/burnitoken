# 🔍 FINAL COMPREHENSIVE LIVE WEBSITE AUDIT
# Endgültige 100% Verifikation der Live-Website

param(
    [string]$Url = "https://burnitoken.website"
)

$ReportFile = "docs/FINAL_AUDIT_100_PERCENT_$(Get-Date -Format 'yyyy-MM-dd').md"
$Results = @{}

Write-Host "🔍 STARTING FINAL 100% LIVE AUDIT..." -ForegroundColor Yellow
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
    }
    
    $responseTimeStr = "$([math]::Round($responseTime, 0))ms"
    Write-Host "✅ Response: $($response.StatusCode) ($responseTimeStr)" -ForegroundColor Green
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
    Description = if ($html -match '<meta[^>]*name="description"[^>]*content="([^"]+)"') { $matches[1].Trim() } else { $null }
    H1Count = ([regex]::Matches($html, '<h1[^>]*>', 'IgnoreCase')).Count
    H2Count = ([regex]::Matches($html, '<h2[^>]*>', 'IgnoreCase')).Count
    H3Count = ([regex]::Matches($html, '<h3[^>]*>', 'IgnoreCase')).Count
    ImageCount = ([regex]::Matches($html, '<img[^>]*>', 'IgnoreCase')).Count
    ImagesWithoutAlt = ([regex]::Matches($html, '<img(?![^>]*alt=)[^>]*>', 'IgnoreCase')).Count
}

Write-Host "📝 Title: $($Results.SEO.Title)" -ForegroundColor Cyan
Write-Host "📝 Description: $($Results.SEO.Description)" -ForegroundColor Cyan
Write-Host "📊 Headings: H1:$($Results.SEO.H1Count) H2:$($Results.SEO.H2Count) H3:$($Results.SEO.H3Count)" -ForegroundColor Cyan
Write-Host "🖼️ Images: $($Results.SEO.ImageCount) total, $($Results.SEO.ImagesWithoutAlt) without alt" -ForegroundColor Cyan

# 3. ASSET VERIFICATION
Write-Host "`n🔗 ASSET VERIFICATION" -ForegroundColor Green
$CSSFiles = @()
$JSFiles = @()
$Assets404 = @()

# Extract CSS files
$CSSMatches = [regex]::Matches($html, '<link[^>]*href=[''"]([^''"]*\.css[^''"]*)["''][^>]*>', 'IgnoreCase')
foreach ($match in $CSSMatches) {
    $cssUrl = $match.Groups[1].Value
    if ($cssUrl -notmatch '^https?://') {
        $cssUrl = "$Url/$($cssUrl.TrimStart('/'))"
    }
    $CSSFiles += $cssUrl
}

# Extract JS files
$JSMatches = [regex]::Matches($html, '<script[^>]*src=[''"]([^''"]*\.js[^''"]*)["''][^>]*>', 'IgnoreCase')
foreach ($match in $JSMatches) {
    $jsUrl = $match.Groups[1].Value
    if ($jsUrl -notmatch '^https?://') {
        $jsUrl = "$Url/$($jsUrl.TrimStart('/'))"
    }
    $JSFiles += $jsUrl
}

# Check CSS files
Write-Host "🎨 Checking CSS files..." -ForegroundColor Cyan
foreach ($cssFile in $CSSFiles) {
    try {
        $cssResponse = Invoke-WebRequest -Uri $cssFile -UseBasicParsing -TimeoutSec 10
        if ($cssResponse.StatusCode -eq 200) {
            Write-Host "✅ $cssFile" -ForegroundColor Green
        } else {
            Write-Host "❌ $cssFile (Status: $($cssResponse.StatusCode))" -ForegroundColor Red
            $Assets404 += $cssFile
        }
    } catch {
        Write-Host "❌ $cssFile (Error: $($_.Exception.Message))" -ForegroundColor Red
        $Assets404 += $cssFile
    }
}

# Check JS files
Write-Host "📜 Checking JavaScript files..." -ForegroundColor Cyan
foreach ($jsFile in $JSFiles) {
    try {
        $jsResponse = Invoke-WebRequest -Uri $jsFile -UseBasicParsing -TimeoutSec 10
        if ($jsResponse.StatusCode -eq 200) {
            Write-Host "✅ $jsFile" -ForegroundColor Green
        } else {
            Write-Host "❌ $jsFile (Status: $($jsResponse.StatusCode))" -ForegroundColor Red
            $Assets404 += $jsFile
        }
    } catch {
        Write-Host "❌ $jsFile (Error: $($_.Exception.Message))" -ForegroundColor Red
        $Assets404 += $jsFile
    }
}

# 4. MOBILE RESPONSIVENESS
Write-Host "`n📱 MOBILE RESPONSIVENESS CHECK" -ForegroundColor Green
$Results.Mobile = @{
    ViewportMeta = $html -match '<meta[^>]*name=[''"]viewport[''"][^>]*>'
    ResponsiveCSS = $html -match '@media[^{]*\([^)]*\)'
}

if ($Results.Mobile.ViewportMeta) {
    Write-Host "✅ Viewport meta tag found" -ForegroundColor Green
} else {
    Write-Host "❌ Viewport meta tag missing" -ForegroundColor Red
}

# 5. SECURITY HEADERS
Write-Host "`n🔒 SECURITY HEADERS CHECK" -ForegroundColor Green
$Results.Security = @{
    HTTPS = $Url.StartsWith('https://')
    HSTS = $response.Headers.ContainsKey('Strict-Transport-Security')
    ContentType = $response.Headers.ContainsKey('Content-Type')
    CacheControl = $response.Headers.ContainsKey('Cache-Control')
}

if ($Results.Security.HTTPS) {
    Write-Host "✅ HTTPS enabled" -ForegroundColor Green
} else {
    Write-Host "❌ HTTPS not enabled" -ForegroundColor Red
}

if ($Results.Security.HSTS) {
    Write-Host "✅ HSTS header present" -ForegroundColor Green
} else {
    Write-Host "⚠️ HSTS header missing" -ForegroundColor Yellow
}

# 6. CALCULATE OVERALL SCORE
Write-Host "`n📊 CALCULATING OVERALL SCORE" -ForegroundColor Green

$score = 0

# Performance (25 points)
if ($Results.Performance.ResponseTime -lt 1000) { $score += 15 }
elseif ($Results.Performance.ResponseTime -lt 2000) { $score += 10 }
elseif ($Results.Performance.ResponseTime -lt 3000) { $score += 5 }

if ($Results.Performance.StatusCode -eq 200) { $score += 10 }

# SEO (25 points)
if ($Results.SEO.Title) { $score += 5 }
if ($Results.SEO.Description) { $score += 5 }
if ($Results.SEO.H1Count -ge 1) { $score += 5 }
if ($Results.SEO.ImagesWithoutAlt -eq 0) { $score += 10 }

# Assets (25 points)
if ($Assets404.Count -eq 0) { $score += 25 }
elseif ($Assets404.Count -le 2) { $score += 15 }
elseif ($Assets404.Count -le 5) { $score += 10 }

# Mobile & Security (25 points)
if ($Results.Mobile.ViewportMeta) { $score += 5 }
if ($Results.Mobile.ResponsiveCSS) { $score += 5 }
if ($Results.Security.HTTPS) { $score += 10 }
if ($Results.Security.HSTS) { $score += 5 }

$Results.OverallScore = $score
if ($score -ge 90) { $Results.OverallGrade = "A" }
elseif ($score -ge 80) { $Results.OverallGrade = "B" } 
elseif ($score -ge 70) { $Results.OverallGrade = "C" }
elseif ($score -ge 60) { $Results.OverallGrade = "D" }
else { $Results.OverallGrade = "F" }

Write-Host "`n🎯 FINAL SCORE: $score/100 (Grade: $($Results.OverallGrade))" -ForegroundColor $(if ($score -ge 90) { "Green" } elseif ($score -ge 70) { "Yellow" } else { "Red" })

# 7. GENERATE REPORT
Write-Host "`n📋 GENERATING FINAL REPORT" -ForegroundColor Green

$httpStatus = if ($Results.Security.HTTPS) { "✅ Enabled" } else { "❌ Disabled" }
$hstsStatus = if ($Results.Security.HSTS) { "✅ Present" } else { "⚠️ Missing" }
$viewportStatus = if ($Results.Mobile.ViewportMeta) { "✅ Present" } else { "❌ Missing" }
$responsiveStatus = if ($Results.Mobile.ResponsiveCSS) { "✅ Detected" } else { "❌ Not detected" }

$report = @"
# 🎯 FINAL 100% LIVE WEBSITE AUDIT REPORT

**Website:** $Url  
**Date:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Overall Score:** $score/100 (Grade: $($Results.OverallGrade))

## ⚡ Performance Results
- **Response Time:** $($Results.Performance.ResponseTime)ms
- **Status Code:** $($Results.Performance.StatusCode)
- **Content Size:** $($Results.Performance.SizeMB)MB

## 📄 SEO Analysis
- **Title:** $($Results.SEO.Title)
- **Description:** $($Results.SEO.Description)
- **Headings:** H1:$($Results.SEO.H1Count), H2:$($Results.SEO.H2Count), H3:$($Results.SEO.H3Count)
- **Images:** $($Results.SEO.ImageCount) total, $($Results.SEO.ImagesWithoutAlt) without alt text

## 🔗 Asset Verification
- **CSS Files Found:** $($CSSFiles.Count)
- **JavaScript Files Found:** $($JSFiles.Count)
- **404 Errors:** $($Assets404.Count)

## 📱 Mobile & Accessibility
- **Viewport Meta:** $viewportStatus
- **Responsive CSS:** $responsiveStatus

## 🔒 Security
- **HTTPS:** $httpStatus
- **HSTS:** $hstsStatus

## 🎯 Final Assessment

$(if ($score -ge 90) {
    "🎉 **EXCELLENT** - Website meets highest quality standards!"
} elseif ($score -ge 80) {
    "👍 **GOOD** - Website quality is very good with minor improvements possible."
} elseif ($score -ge 70) {
    "⚠️ **ACCEPTABLE** - Website quality is acceptable but needs improvements."
} else {
    "❌ **NEEDS IMPROVEMENT** - Website requires significant fixes."
})

---
*Generated by Final Live Audit Script v1.0*
"@

$report | Out-File -FilePath $ReportFile -Encoding UTF8
Write-Host "📄 Report saved to: $ReportFile" -ForegroundColor Green

Write-Host "`n🏁 FINAL AUDIT COMPLETE!" -ForegroundColor Yellow
Write-Host "📊 Overall Grade: $($Results.OverallGrade) ($score/100)" -ForegroundColor $(if ($score -ge 90) { "Green" } elseif ($score -ge 70) { "Yellow" } else { "Red" })

if ($Assets404.Count -eq 0) {
    Write-Host "✅ ALL ASSETS VERIFIED - NO 404 ERRORS!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Found $($Assets404.Count) missing assets" -ForegroundColor Yellow
}
