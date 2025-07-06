# Fix Encoding and Remove Emojis from index.html
# This script fixes UTF-8 encoding issues and removes emojis from critical meta tags

$indexPath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\index.html"
$backupPath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\index-backup-before-encoding-fix-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').html"

try {
    Write-Host "🔧 STARTING ENCODING AND EMOJI FIX..." -ForegroundColor Yellow
    
    # Create backup
    Copy-Item $indexPath $backupPath -Force
    Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green
    
    # Read file with proper UTF-8 encoding
    $content = Get-Content $indexPath -Encoding UTF8 -Raw
    
    # Fix title tag - remove emoji
    $content = $content -replace '<title>.*?BurniToken.*?</title>', '<title>BurniToken - XRPL Deflation Token | Crypto Investment</title>'
    
    # Fix description meta tag - remove emoji and fix encoding
    $content = $content -replace '<meta name="description" content=".*?BurniToken.*?".*?>', '<meta name="description" content="BurniToken - Die erste deflationäre XRPL-basierte Kryptowährung mit automatischem Token-Burning-Mechanismus. Investieren Sie in die Zukunft der Blockchain-Technologie mit über 2 Milliarden verbrannten Tokens!" >'
    
    # Fix keywords meta tag encoding
    $content = $content -replace '<meta name="keywords" content=".*?".*?>', '<meta name="keywords" content="BurniToken, XRPL, Token Burning, Kryptowährung, Blockchain, Deflationär, Investment, Crypto, XRP Ledger" >'
    
    # Fix comment encoding
    $content = $content -replace '<!-- SEO Meta Tags - KRITISCH F.*? SUCHMASCHINEN -->', '<!-- SEO Meta Tags - KRITISCH FÜR SUCHMASCHINEN -->'
    
    # Fix any remaining encoding issues
    $content = $content -replace 'Ã¤', 'ä'
    $content = $content -replace 'Ã¼', 'ü'
    $content = $content -replace 'Ã¶', 'ö'
    $content = $content -replace 'ÃŸ', 'ß'
    $content = $content -replace 'Ã„', 'Ä'
    $content = $content -replace 'Ãœ', 'Ü'
    $content = $content -replace 'Ã–', 'Ö'
    $content = $content -replace 'Ã¤r', 'är'
    $content = $content -replace 'Ã¼r', 'ür'
    
    # Remove any fire emoji characters
    $content = $content -replace 'ðŸ"¥', ''
    $content = $content -replace '🔥', ''
    
    # Save with proper UTF-8 encoding (with BOM to ensure compatibility)
    $utf8BOM = New-Object System.Text.UTF8Encoding $true
    [System.IO.File]::WriteAllText($indexPath, $content, $utf8BOM)
    
    Write-Host "✅ ENCODING AND EMOJI FIX COMPLETED!" -ForegroundColor Green
    Write-Host "📋 Changes made:" -ForegroundColor Cyan
    Write-Host "   - Removed emojis from title and meta description" -ForegroundColor White
    Write-Host "   - Fixed UTF-8 encoding issues (ä, ü, ö, etc.)" -ForegroundColor White
    Write-Host "   - Cleaned up meta tags" -ForegroundColor White
    Write-Host "   - File saved with proper UTF-8 BOM encoding" -ForegroundColor White
    
    # Validate the fixes
    $newContent = Get-Content $indexPath -Encoding UTF8 -Raw
    if ($newContent -notmatch 'ðŸ"¥|🔥' -and $newContent -match 'deflationäre') {
        Write-Host "✅ VALIDATION SUCCESSFUL: No emojis found, proper encoding confirmed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  VALIDATION WARNING: Please check the file manually" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if (Test-Path $backupPath) {
        Copy-Item $backupPath $indexPath -Force
        Write-Host "🔄 Restored from backup" -ForegroundColor Yellow
    }
}
