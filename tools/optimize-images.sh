#!/bin/bash
# Image Optimization Script für BurniToken
# Konvertiert alle Bilder zu WebP und optimiert Größen

echo "🖼️ Starte Image-Optimierung..."

# WebP-Konvertierung
for img in assets/images/*.jpg assets/images/*.jpeg assets/images/*.png; do
  if [ -f "$img" ]; then
    webp_file="${img%.*}.webp"
    if [ ! -f "$webp_file" ]; then
      cwebp -q 85 "$img" -o "$webp_file"
      echo "✅ Konvertiert: $webp_file"
    fi
  fi
done

echo "✅ Image-Optimierung abgeschlossen"
