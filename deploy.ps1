# PowerShell Deployment Script for Burni Token Website
# This script prepares the files for deployment

Write-Host "Burni Token Website - Deployment Preparation" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# 1. Run tests
Write-Host "Step 1: Running tests..." -ForegroundColor Yellow
try {
    npm test
    if ($LASTEXITCODE -ne 0) {
        throw "Tests failed"
    }
    Write-Host "All tests passed!" -ForegroundColor Green
} catch {
    Write-Host "Tests failed. Deployment aborted." -ForegroundColor Red
    exit 1
}

# 2. Run build
Write-Host "Step 2: Running build..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "Build successful!" -ForegroundColor Green
} catch {
    Write-Host "Build failed. Deployment aborted." -ForegroundColor Red
    exit 1
}

# 3. Create deployment folder
Write-Host "Step 3: Preparing deployment folder..." -ForegroundColor Yellow
$deployDir = ".\dist"

if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}

New-Item -ItemType Directory -Path $deployDir | Out-Null

# 4. Copy files
Write-Host "Step 4: Copying files for deployment..." -ForegroundColor Yellow

$filesToCopy = @(
    "index.html",
    "404.html", 
    "main.js",
    "manifest.json",
    "robots.txt",
    "sitemap.xml",
    "sw.js"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file $deployDir
        Write-Host "  $file copied" -ForegroundColor Gray
    } else {
        Write-Host "  $file not found" -ForegroundColor Yellow
    }
}

$foldersToCopy = @(
    "assets",
    "pages", 
    "public"
)

foreach ($folder in $foldersToCopy) {
    if (Test-Path $folder) {
        Copy-Item $folder $deployDir -Recurse
        Write-Host "  $folder/ copied" -ForegroundColor Gray
    } else {
        Write-Host "  $folder/ not found" -ForegroundColor Yellow
    }
}

# 5. Validation
Write-Host "Step 5: Validating deployment files..." -ForegroundColor Yellow

$criticalFiles = @("$deployDir\index.html", "$deployDir\main.js")
$allFilesPresent = $true

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "  $(Split-Path $file -Leaf) present ($size bytes)" -ForegroundColor Gray
    } else {
        Write-Host "  $(Split-Path $file -Leaf) missing!" -ForegroundColor Red
        $allFilesPresent = $false
    }
}

if (-not $allFilesPresent) {
    Write-Host "Critical files missing. Deployment aborted." -ForegroundColor Red
    exit 1
}

# 6. i18n System Validation
Write-Host "Step 6: Validating i18n system..." -ForegroundColor Yellow

$mainJsContent = Get-Content "$deployDir\main.js" -Raw
if ($mainJsContent -match "translations" -and $mainJsContent -match "changeLanguage") {
    Write-Host "  i18n system found in main.js" -ForegroundColor Gray
} else {
    Write-Host "  i18n system not found in main.js!" -ForegroundColor Red
    exit 1
}

$indexContent = Get-Content "$deployDir\index.html" -Raw
if ($indexContent -match "data-i18n=" -and $indexContent -match 'id="lang-select"') {
    Write-Host "  i18n attributes found in index.html" -ForegroundColor Gray
} else {
    Write-Host "  i18n attributes not found in index.html!" -ForegroundColor Red
    exit 1
}

# 7. Success
Write-Host "Deployment preparation completed successfully!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Deployment files are in: $deployDir" -ForegroundColor Cyan
Write-Host "Number of files: $((Get-ChildItem $deployDir -Recurse -File).Count)" -ForegroundColor Cyan

Write-Host "Next steps for deployment:" -ForegroundColor Yellow
Write-Host "1. Upload all files from the 'dist' folder to your web server" -ForegroundColor White
Write-Host "2. Or use Git to commit and push the changes" -ForegroundColor White
Write-Host "3. Test the website after deployment:" -ForegroundColor White
Write-Host "   - English: https://burnitoken.website" -ForegroundColor Gray
Write-Host "   - German:  https://burnitoken.website?lang=de" -ForegroundColor Gray

Write-Host "Features available after deployment:" -ForegroundColor Green
Write-Host "- Full German and English language support" -ForegroundColor Gray
Write-Host "- Dynamic language switching via dropdown menu" -ForegroundColor Gray  
Write-Host "- Explorer links for Burni issuer address" -ForegroundColor Gray
Write-Host "- Localized charts and tables" -ForegroundColor Gray
Write-Host "- Correct currency formatting per language" -ForegroundColor Gray

Write-Host "To test locally:" -ForegroundColor Yellow
Write-Host "npm run serve" -ForegroundColor Gray
Write-Host "Then open: http://localhost:8080?lang=de" -ForegroundColor Gray
