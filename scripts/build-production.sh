#!/bin/bash

# BurniToken Website Production Build Script
# This script optimizes the website for production deployment

set -e

echo "🚀 Starting BurniToken Website Production Build..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/
mkdir -p dist/

# Build CSS with TailwindCSS
echo "🎨 Building optimized CSS..."
npm run build:css

# Build JavaScript with Webpack
echo "📦 Building optimized JavaScript..."
npm run build:js

# Copy static assets
echo "📁 Copying static assets..."
cp -r assets dist/
cp sw.js _headers CNAME robots.txt sitemap.xml manifest.json 404.html dist/

# HTML optimization
echo "🗜️  Optimizing HTML..."
if command -v html-minifier-terser &> /dev/null; then
    html-minifier-terser index.html \
        --collapse-whitespace \
        --remove-comments \
        --minify-css \
        --minify-js \
        --keep-closing-slash \
        --remove-redundant-attributes \
        --remove-script-type-attributes \
        --remove-tag-whitespace \
        --use-short-doctype \
        --output dist/index.html
else
    echo "⚠️  HTML minifier not found, copying unminified HTML..."
    cp index.html dist/
fi

# Copy Jekyll config
cp _config.yml dist/

# Performance optimization
echo "🎯 Running performance optimization..."
bash ./scripts/optimize-performance.sh

# Performance audit
echo "📊 Running performance audit..."
if [ -f "dist/index.html" ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build Statistics:"
    echo "   - HTML files: $(find dist/ -name '*.html' | wc -l)"
    echo "   - CSS files: $(find dist/ -name '*.css' | wc -l)"
    echo "   - JS files: $(find dist/ -name '*.js' | wc -l)"
    echo "   - Image files: $(find dist/ -name '*.webp' -o -name '*.jpg' -o -name '*.png' | wc -l)"
    echo "   - Total files: $(find dist/ -type f | wc -l)"
    echo "   - Build size: $(du -sh dist/ | cut -f1)"
else
    echo "❌ Build failed - index.html not found in dist/"
    exit 1
fi

echo "🎉 Production build completed successfully!"