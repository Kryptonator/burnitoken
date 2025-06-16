# 🚀 BURNITOKEN MANUAL DEPLOYMENT SCRIPT (Windows PowerShell)
# Verwende dieses Skript für manuelles Deployment ohne GitHub Actions

Write-Host "🔥 BURNITOKEN.COM - MANUAL DEPLOYMENT SCRIPT" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Yellow

# Überprüfe ob alle notwendigen Dateien vorhanden sind
Write-Host "📋 Checking deployment files..." -ForegroundColor Cyan

$CriticalFiles = @("index.html", "main.js", "manifest.json", "sw.js", "robots.txt", "sitemap.xml")
$MissingFiles = @()

foreach ($file in $CriticalFiles) {
    if (-not (Test-Path $file)) {
        $MissingFiles += $file
    }
}

if ($MissingFiles.Count -eq 0) {
    Write-Host "✅ All critical files present" -ForegroundColor Green
}
else {
    Write-Host "❌ Missing files: $($MissingFiles -join ', ')" -ForegroundColor Red
    Write-Host "Please ensure all files are in the project directory" -ForegroundColor Yellow
    exit 1
}

# Erstelle Deployment-Ordner
Write-Host "📁 Creating deployment directory..." -ForegroundColor Cyan
if (Test-Path "deployment") {
    Remove-Item -Recurse -Force "deployment"
}
New-Item -ItemType Directory -Path "deployment" | Out-Null

# Kopiere alle notwendigen Dateien
Write-Host "📋 Copying files for deployment..." -ForegroundColor Cyan

# HTML Dateien
Get-ChildItem "*.html" | Copy-Item -Destination "deployment" -ErrorAction SilentlyContinue
Write-Host "✅ HTML files copied" -ForegroundColor Green

# JavaScript Dateien
Get-ChildItem "*.js" | Copy-Item -Destination "deployment" -ErrorAction SilentlyContinue
Write-Host "✅ JavaScript files copied" -ForegroundColor Green

# Manifest und Config Dateien
Get-ChildItem "*.json" | Copy-Item -Destination "deployment" -ErrorAction SilentlyContinue
Get-ChildItem "*.xml" | Copy-Item -Destination "deployment" -ErrorAction SilentlyContinue
Get-ChildItem "*.txt" | Copy-Item -Destination "deployment" -ErrorAction SilentlyContinue
Write-Host "✅ Configuration files copied" -ForegroundColor Green

# Assets Ordner
if (Test-Path "assets") {
    Copy-Item -Recurse "assets" -Destination "deployment" -ErrorAction SilentlyContinue
    Write-Host "✅ Assets directory copied" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Assets directory not found" -ForegroundColor Yellow
}

# Pages Ordner (falls vorhanden)
if (Test-Path "pages") {
    Copy-Item -Recurse "pages" -Destination "deployment" -ErrorAction SilentlyContinue
    Write-Host "✅ Pages directory copied" -ForegroundColor Green
}

# Public Ordner (falls vorhanden)
if (Test-Path "public") {
    Copy-Item -Recurse "public" -Destination "deployment" -ErrorAction SilentlyContinue
    Write-Host "✅ Public directory copied" -ForegroundColor Green
}

# Zeige Deployment-Struktur
Write-Host ""
Write-Host "📊 DEPLOYMENT STRUCTURE:" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Yellow
$files = Get-ChildItem -Recurse "deployment" -File | Select-Object -First 20
$files | ForEach-Object { Write-Host $_.FullName.Replace((Get-Location).Path + "\", "") }

$totalFiles = (Get-ChildItem -Recurse "deployment" -File).Count
if ($totalFiles -gt 20) {
    Write-Host "... and $($totalFiles - 20) more files"
}

# Zeige Dateigrößen
Write-Host ""
Write-Host "📈 FILE SIZES:" -ForegroundColor Magenta
Write-Host "==============" -ForegroundColor Yellow

$indexSize = if (Test-Path "deployment\index.html") { (Get-Item "deployment\index.html").Length } else { "not found" }
$mainSize = if (Test-Path "deployment\main.js") { (Get-Item "deployment\main.js").Length } else { "not found" }
$manifestSize = if (Test-Path "deployment\manifest.json") { (Get-Item "deployment\manifest.json").Length } else { "not found" }

Write-Host "index.html: $indexSize bytes"
Write-Host "main.js: $mainSize bytes"
Write-Host "manifest.json: $manifestSize bytes"

# Deployment-Zusammenfassung
Write-Host ""
Write-Host "🎉 DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "===================="
Write-Host "✅ All files prepared in 'deployment' directory" -ForegroundColor Green
Write-Host "🌐 Ready for upload to web hosting provider" -ForegroundColor Cyan
Write-Host "📂 Upload the contents of the 'deployment' directory" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔥 BURNITOKEN.COM DEPLOYMENT COMPLETED!" -ForegroundColor Red

# Optional: ZIP für einfachen Upload erstellen
Write-Host ""
Write-Host "📦 Creating deployment ZIP..." -ForegroundColor Cyan
$zipName = "burnitoken-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Compress-Archive -Path "deployment\*" -DestinationPath $zipName -Force
Write-Host "✅ Deployment ZIP created: $zipName" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Ready for live deployment!" -ForegroundColor Red
