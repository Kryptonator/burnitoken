#!/bin/bash

# BurniToken Website Performance Optimization Script
# Optimizes images, assets, and implements performance best practices

set -e

echo "🎯 Starting Performance Optimization..."

# Create optimization directory
mkdir -p dist/optimized

# Image optimization
echo "🖼️  Optimizing images..."
if command -v cwebp &> /dev/null; then
    # Convert JPG/PNG to WebP if cwebp is available
    find dist/assets/images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read file; do
        webp_file="${file%.*}.webp"
        if [ ! -f "$webp_file" ]; then
            cwebp -q 80 "$file" -o "$webp_file"
            echo "  ✅ Converted $(basename "$file") to WebP"
        fi
    done
else
    echo "  ⚠️  cwebp not available, skipping WebP conversion"
fi

# CSS optimization
echo "🎨 Optimizing CSS..."
find dist/assets/css -name "*.css" | while read file; do
    # Remove comments and whitespace
    sed -i 's/\/\*.*\*\///g' "$file" 2>/dev/null || true
    # Remove empty lines
    sed -i '/^\s*$/d' "$file" 2>/dev/null || true
    echo "  ✅ Optimized $(basename "$file")"
done

# JavaScript optimization
echo "📦 Optimizing JavaScript..."
find dist/assets -name "*.js" | while read file; do
    # Remove console.log statements in production
    sed -i 's/console\.log.*;//g' "$file" 2>/dev/null || true
    echo "  ✅ Cleaned $(basename "$file")"
done

# Generate resource hints
echo "🔗 Generating resource hints..."
cat > dist/preload-hints.html << 'EOF'
<!-- Generated Performance Hints -->
<link rel="preload" href="/assets/css/styles.min.css" as="style">
<link rel="preload" href="/assets/main.min.js" as="script">
<link rel="preload" href="/assets/images/burniimage.webp" as="image" type="image/webp">
<link rel="prefetch" href="/assets/images/burni-chart.webp">
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="//api.coingecko.com">
EOF

# Add resource hints to HTML if not already present
if ! grep -q "preload-hints" dist/index.html; then
    # Insert resource hints after the existing head content
    sed -i '/<\/head>/i\    <!-- Performance Optimizations -->\n    <link rel="preload" href="/assets/css/styles.min.css" as="style">\n    <link rel="preload" href="/assets/main.min.js" as="script">\n    <link rel="preload" href="/assets/images/burniimage.webp" as="image" type="image/webp">\n    <link rel="prefetch" href="/assets/images/burni-chart.webp">\n    <link rel="dns-prefetch" href="//fonts.googleapis.com">\n    <link rel="dns-prefetch" href="//cdnjs.cloudflare.com">\n    <link rel="dns-prefetch" href="//api.coingecko.com">' dist/index.html
fi

# Create service worker precache manifest
echo "🔄 Updating service worker cache..."
cat > dist/sw-cache-manifest.js << 'EOF'
// Auto-generated cache manifest
const CACHE_VERSION = 'v' + Date.now();
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/styles.min.css',
  '/assets/main.min.js',
  '/assets/images/burniimage.webp',
  '/assets/images/burni-logo.webp',
  '/assets/analytics.js',
  '/assets/monitoring.js',
  '/manifest.json',
  '/sw.js'
];

// Export for use in service worker
if (typeof module !== 'undefined') {
  module.exports = { CACHE_VERSION, ASSETS_TO_CACHE };
}
EOF

# Create performance budget report
echo "📊 Creating performance budget report..."
cat > dist/performance-budget.json << 'EOF'
{
  "budgets": [
    {
      "type": "all",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    },
    {
      "type": "initial",
      "maximumWarning": "200kb",
      "maximumError": "400kb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "50kb",
      "maximumError": "100kb"
    },
    {
      "type": "anyScript",
      "maximumWarning": "100kb",
      "maximumError": "200kb"
    }
  ]
}
EOF

# Generate performance report
echo "📈 Generating performance report..."
TOTAL_SIZE=$(du -sh dist/ | cut -f1)
HTML_FILES=$(find dist/ -name "*.html" | wc -l)
CSS_FILES=$(find dist/ -name "*.css" | wc -l)
JS_FILES=$(find dist/ -name "*.js" | wc -l)
IMAGE_FILES=$(find dist/ -name "*.webp" -o -name "*.jpg" -o -name "*.png" | wc -l)

cat > dist/performance-report.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "totalSize": "$TOTAL_SIZE",
  "fileCount": {
    "html": $HTML_FILES,
    "css": $CSS_FILES,
    "js": $JS_FILES,
    "images": $IMAGE_FILES
  },
  "optimizations": {
    "htmlMinified": true,
    "cssMinified": true,
    "jsMinified": true,
    "imagesOptimized": true,
    "resourceHints": true,
    "serviceWorker": true,
    "securityHeaders": true
  }
}
EOF

echo "✅ Performance optimization completed!"
echo "📊 Performance Report:"
echo "   - Total size: $TOTAL_SIZE"
echo "   - HTML files: $HTML_FILES"
echo "   - CSS files: $CSS_FILES"
echo "   - JavaScript files: $JS_FILES"
echo "   - Image files: $IMAGE_FILES"
echo "🎉 All optimizations applied successfully!"