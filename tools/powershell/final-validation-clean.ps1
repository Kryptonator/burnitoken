# FINAL VALIDATION SCRIPT (Unicode/Emoji-frei)
# Prüft alle kritischen Qualitätsaspekte der index.html

$indexPath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\index.html"
$reportPath = "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\FINAL-VALIDATION-REPORT-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').md"

Write-Host "==============================="
Write-Host " FINAL VALIDATION (CLEAN) "
Write-Host "==============================="

$report = @()

try {
    $content = Get-Content $indexPath -Encoding UTF8 -Raw
    $fileSize = (Get-Item $indexPath).Length

    # 1. Emoji-Check (typische Emoji-Sonderzeichen)
    $emojiCheck = $content -notmatch '[🔥🚀💰📈⭐🎯✅❌⚠🟢🔴]'
    $titleCheck = $content -match '<title>[^<]+</title>'
    $descCheck = $content -match '<meta name="description" content="[^"]+"'

    # 2. Encoding-Check (Umlaute korrekt, keine Artefakte)
    $encodingCheck = $content -match 'ä|ü|ö|ß' -and $content -notmatch 'Ã¤|Ã¼|Ã¶|ÃŸ'

    # 3. Security-Check
    $cspCheck = $content -match 'Content-Security-Policy'
    $noEval = $content -notmatch 'eval\('
    $externalHandlers = Test-Path "c:\Users\micha\OneDrive\Dokumente\burnitoken.com\assets\event-handlers.js"

    # 4. Accessibility-Check
    $skipLinks = $content -match 'skip-to-content'
    $ariaLabels = $content -match 'aria-label'
    $altTexts = $content -match 'alt='

    # 5. SEO-Check
    $metaDesc = $content -match '<meta name="description"'
    $canonical = $content -match '<link rel="canonical"'
    $ogTags = $content -match 'property="og:'
    $structuredData = $content -match 'application/ld\+json'

    # 6. Performance-Check
    $preloads = ($content | Select-String -Pattern '<link rel="preload"' -AllMatches).Matches.Count
    $modernFormats = $content -match 'webp|avif'
    $deferScripts = $content -match 'defer|async'

    # 7. File Size
    $sizeKB = [Math]::Round($fileSize / 1024, 2)

    # Zusammenfassung
    $report += "# FINAL VALIDATION REPORT (Clean)"
    $report += "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $report += "File: index.html"
    $report += ""
    $report += "## Checks:"
    $report += "- Emoji in Title/Description: $emojiCheck"
    $report += "- Title present: $titleCheck"
    $report += "- Description present: $descCheck"
    $report += "- Encoding (Umlaute): $encodingCheck"
    $report += "- CSP present: $cspCheck"
    $report += "- No eval(): $noEval"
    $report += "- External event handlers: $externalHandlers"
    $report += "- Skip Links: $skipLinks"
    $report += "- ARIA Labels: $ariaLabels"
    $report += "- Alt Texts: $altTexts"
    $report += "- Meta Description: $metaDesc"
    $report += "- Canonical: $canonical"
    $report += "- OG Tags: $ogTags"
    $report += "- Structured Data: $structuredData"
    $report += "- Preload count: $preloads"
    $report += "- Modern image formats: $modernFormats"
    $report += "- Script optimization: $deferScripts"
    $report += "- File size (KB): $sizeKB"

    $score = 0
    if ($emojiCheck) { $score++ }
    if ($titleCheck) { $score++ }
    if ($descCheck) { $score++ }
    if ($encodingCheck) { $score++ }
    if ($cspCheck) { $score++ }
    if ($noEval) { $score++ }
    if ($externalHandlers) { $score++ }
    if ($skipLinks) { $score++ }
    if ($ariaLabels) { $score++ }
    if ($altTexts) { $score++ }
    if ($metaDesc) { $score++ }
    if ($canonical) { $score++ }
    if ($ogTags) { $score++ }
    if ($structuredData) { $score++ }
    if ($preloads -gt 0) { $score++ }
    if ($modernFormats) { $score++ }
    if ($deferScripts) { $score++ }
    if ($sizeKB -lt 300) { $score++ }

    $report += ""
    $report += "## Score: $score / 18"
    $report += ""
    if ($score -ge 17) {
        $report += "Status: EXCELLENT - Production ready!"
    } elseif ($score -ge 15) {
        $report += "Status: GOOD - Minor improvements possible."
    } else {
        $report += "Status: Needs optimization."
    }

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "Report saved: $reportPath"

} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}

Write-Host "Validation complete. Awaiting further instructions..."
