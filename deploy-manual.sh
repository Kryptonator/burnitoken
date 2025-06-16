#!/bin/bash

# 🚀 BURNITOKEN MANUAL DEPLOYMENT SCRIPT
# Verwende dieses Skript für manuelles Deployment ohne GitHub Actions

echo "🔥 BURNITOKEN.COM - MANUAL DEPLOYMENT SCRIPT"
echo "=============================================="

# Überprüfe ob alle notwendigen Dateien vorhanden sind
echo "📋 Checking deployment files..."

CRITICAL_FILES=("index.html" "main.js" "manifest.json" "sw.js" "robots.txt" "sitemap.xml")
MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ All critical files present"
else
    echo "❌ Missing files: ${MISSING_FILES[*]}"
    echo "Please ensure all files are in the project directory"
    exit 1
fi

# Erstelle Deployment-Ordner
echo "📁 Creating deployment directory..."
mkdir -p deployment
rm -rf deployment/* 2>/dev/null

# Kopiere alle notwendigen Dateien
echo "📋 Copying files for deployment..."

# HTML Dateien
cp *.html deployment/ 2>/dev/null
echo "✅ HTML files copied"

# JavaScript Dateien
cp *.js deployment/ 2>/dev/null
echo "✅ JavaScript files copied"

# Manifest und Config Dateien
cp *.json deployment/ 2>/dev/null
cp *.xml deployment/ 2>/dev/null
cp *.txt deployment/ 2>/dev/null
echo "✅ Configuration files copied"

# Assets Ordner
if [ -d "assets" ]; then
    cp -r assets deployment/
    echo "✅ Assets directory copied"
else
    echo "⚠️ Assets directory not found"
fi

# Pages Ordner (falls vorhanden)
if [ -d "pages" ]; then
    cp -r pages deployment/
    echo "✅ Pages directory copied"
fi

# Public Ordner (falls vorhanden)
if [ -d "public" ]; then
    cp -r public deployment/
    echo "✅ Public directory copied"
fi

# Zeige Deployment-Struktur
echo ""
echo "📊 DEPLOYMENT STRUCTURE:"
echo "========================"
find deployment -type f | head -20
if [ $(find deployment -type f | wc -l) -gt 20 ]; then
    echo "... and $(( $(find deployment -type f | wc -l) - 20 )) more files"
fi

# Zeige Dateigrößen
echo ""
echo "📈 FILE SIZES:"
echo "=============="
echo "index.html: $(stat -c%s deployment/index.html 2>/dev/null || echo "not found") bytes"
echo "main.js: $(stat -c%s deployment/main.js 2>/dev/null || echo "not found") bytes"
echo "manifest.json: $(stat -c%s deployment/manifest.json 2>/dev/null || echo "not found") bytes"

# Deployment-Zusammenfassung
echo ""
echo "🎉 DEPLOYMENT READY!"
echo "===================="
echo "✅ All files prepared in 'deployment' directory"
echo "🌐 Ready for upload to web hosting provider"
echo "📂 Upload the contents of the 'deployment' directory"
echo ""
echo "🔥 BURNITOKEN.COM DEPLOYMENT COMPLETED!"

# Optional: ZIP für einfachen Upload erstellen
if command -v zip &> /dev/null; then
    echo ""
    echo "📦 Creating deployment ZIP..."
    cd deployment
    zip -r ../burnitoken-deployment-$(date +%Y%m%d-%H%M%S).zip .
    cd ..
    echo "✅ Deployment ZIP created: burnitoken-deployment-$(date +%Y%m%d-%H%M%S).zip"
fi

echo ""
echo "🚀 Ready for live deployment!"
