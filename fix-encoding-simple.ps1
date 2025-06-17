# Fix Encoding and Remove Emojis from index.html
# This script fixes UTF-8 encoding issues and removes emojis from critical meta tags

$indexPath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\index.html"
$backupPath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\index-backup-before-encoding-fix-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').html"

try {
    Write-Host "STARTING ENCODING AND EMOJI FIX..." -ForegroundColor Yellow
    
    # Create backup
    Copy-Item $indexPath $backupPath -Force
    Write-Host "Backup created: $backupPath" -ForegroundColor Green
    
    # Read file with proper UTF-8 encoding
    $content = Get-Content $indexPath -Encoding UTF8 -Raw
    
    # Fix title tag - remove emoji
    $content = $content -replace '<title>.*?BurniToken.*?</title>', '<title>BurniToken - XRPL Deflation Token | Crypto Investment</title>'
    
    # Fix description meta tag - remove emoji and fix encoding
    $content = $content -replace '<meta name="description" content="[^"]*BurniToken[^"]*"[^>]*>', '<meta name="description" content="BurniToken - Die erste deflationaere XRPL-basierte Kryptowaehrung mit automatischem Token-Burning-Mechanismus. Investieren Sie in die Zukunft der Blockchain-Technologie mit ueber 2 Milliarden verbrannten Tokens!" >'
    
    # Fix keywords meta tag encoding
    $content = $content -replace '<meta name="keywords" content="[^"]*"[^>]*>', '<meta name="keywords" content="BurniToken, XRPL, Token Burning, Kryptowaehrung, Blockchain, Deflationaer, Investment, Crypto, XRP Ledger" >'
    
    # Remove any emoji characters (multiple patterns)
    $content = $content -replace '[^\x00-\x7F]', ''
    
    # Save with proper UTF-8 encoding
    [System.IO.File]::WriteAllText($indexPath, $content, [System.Text.Encoding]::UTF8)
    
    Write-Host "ENCODING AND EMOJI FIX COMPLETED!" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if (Test-Path $backupPath) {
        Copy-Item $backupPath $indexPath -Force
        Write-Host "Restored from backup" -ForegroundColor Yellow
    }
}
