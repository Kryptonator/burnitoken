#!/bin/bash

echo "🔍 SYSTEMATISCHE JAVASCRIPT-FEHLER ANALYSE"
echo "=================================="

# Liste aller JS-Dateien aus index.html extrahieren
echo "📋 JavaScript-Dateien in index.html gefunden:"
echo ""

# Teste alle JS-Dateien
echo "🧪 TESTING JavaScript-Dateien:"
echo ""

declare -a js_files=(
    "/sentry.client.js"
    "/assets/burni-dark-mode.js"
    "/assets/test-dark-mode.js"
    "/assets/analytics-dashboard.js"
    "/assets/price-tracker.js"
    "/assets/community-features.js"
    "/assets/security-monitor.js"
    "/assets/xrpl-data.js"
    "/test-burni-live-prices.js"
    "/test-price-widget.js"
    "/assets/enhanced-polyfills.js"
    "/assets/enhanced-functionality.js"
    "/enhanced-price-widget.js"
    "/assets/main-es5.js"
    "/assets/scripts-fixed.min.js"
    "/assets/form-handler.js"
)

missing_files=()
working_files=()

for file in "${js_files[@]}"; do
    echo -n "Testing $file ... "
    
    response=$(curl -s -I "https://burnitoken.website$file" | head -n 1)
    
    if [[ $response == *"200 OK"* ]]; then
        echo "✅ OK"
        working_files+=("$file")
    elif [[ $response == *"404"* ]]; then
        echo "❌ 404 NOT FOUND"
        missing_files+=("$file")
    else
        echo "⚠️ $response"
        missing_files+=("$file")
    fi
done

echo ""
echo "📊 ERGEBNISSE:"
echo "=============="
echo "✅ Funktionierend: ${#working_files[@]} Dateien"
echo "❌ Fehlend: ${#missing_files[@]} Dateien"

echo ""
echo "🚨 FEHLENDE DATEIEN:"
for file in "${missing_files[@]}"; do
    echo "❌ $file"
done

echo ""
echo "✅ FUNKTIONIERENDE DATEIEN:"
for file in "${working_files[@]}"; do
    echo "✅ $file"
done
