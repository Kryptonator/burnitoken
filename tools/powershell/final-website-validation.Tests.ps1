# Pester-Tests für BurniToken.com Final Website Validation
# Lädt die Validierungsdaten aus dem Hauptskript-Report

$reportPath = "final-validation-report.json"
if (!(Test-Path $reportPath)) {
    Write-Host "Report file not found. Bitte erst final-website-validation.ps1 ausführen!" -ForegroundColor Red
    exit 1
}

$report = Get-Content $reportPath | ConvertFrom-Json
$validation = $report.validation
$seo = $report.seo
$accessibility = $report.accessibility
$performance = $report.performance
$i18n = $report.i18n

Describe 'BurniToken.com Final Website Validation' {
    It 'HTML Structure is valid' {
        $validation.HasDoctype | Should -Be $true
        $validation.HasTitle | Should -Be $true
        $validation.HasMetaCharset | Should -Be $true
        $validation.HasMetaViewport | Should -Be $true
        $validation.HasMetaDescription | Should -Be $true
        $validation.DuplicateLoadingAttrs | Should -Be 0
    }
    It 'SEO is valid' {
        $seo.MetaTags | Should -BeGreaterThan 0
        $seo.H1Headings | Should -BeGreaterThan 0
        $seo.ImagesWithAlt | Should -Be $seo.Images
    }
    It 'Accessibility is valid' {
        $accessibility.LangAttribute | Should -Be $true
        $accessibility.SkipLinks | Should -Be $true
    }
    It 'Performance is valid' {
        $performance.LazyLoadingImages | Should -BeGreaterThan 0
        $performance.PreloadLinks | Should -BeGreaterThan 0
    }
    It 'Internationalization is valid' {
        $i18n.DataI18nElements | Should -BeGreaterThan 0
        $i18n.LangSwitcher | Should -Be $true
    }
}
