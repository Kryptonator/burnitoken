# Quick Asset Check Script (PowerShell)

$urls = @(
    "https://burnitoken.website/sentry.client.js",
    "https://burnitoken.website/assets/burni-dark-mode.js", 
    "https://burnitoken.website/assets/test-dark-mode.js",
    "https://burnitoken.website/assets/analytics-dashboard.js",
    "https://burnitoken.website/assets/price-tracker.js",
    "https://burnitoken.website/assets/community-features.js",
    "https://burnitoken.website/assets/security-monitor.js",
    "https://burnitoken.website/assets/xrpl-data.js",
    "https://burnitoken.website/test-burni-live-prices.js",
    "https://burnitoken.website/test-price-widget.js",
    "https://burnitoken.website/assets/enhanced-polyfills.js",
    "https://burnitoken.website/assets/css/styles.min.css"
)

Write-Host "🔍 CHECKING CRITICAL ASSETS..." -ForegroundColor Yellow

$working = 0
$broken = 0
$brokenAssets = @()

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $url" -ForegroundColor Green
            $working++
        } else {
            Write-Host "❌ $url (Status: $($response.StatusCode))" -ForegroundColor Red
            $broken++
            $brokenAssets += $url
        }
    } catch {
        Write-Host "❌ $url (Error: 404/Connection)" -ForegroundColor Red
        $broken++
        $brokenAssets += $url
    }
}

Write-Host "`n📊 SUMMARY:" -ForegroundColor Yellow
Write-Host "✅ Working: $working" -ForegroundColor Green
Write-Host "❌ Broken: $broken" -ForegroundColor Red

if ($broken -eq 0) {
    Write-Host "`n🎉 ALL ASSETS ARE WORKING!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ BROKEN ASSETS:" -ForegroundColor Red
    foreach ($asset in $brokenAssets) {
        Write-Host "  - $asset" -ForegroundColor Red
    }
}
