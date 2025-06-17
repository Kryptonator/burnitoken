#!/bin/bash
# 🧹 REPOSITORY AUFRÄUMEN - DATEIEN KATEGORISIEREN

echo "🧹 REPOSITORY AUFRÄUMEN GESTARTET"
echo "================================="

# Kategorien erstellen
mkdir -p cleanup-analysis
cd cleanup-analysis

echo "📁 Erstelle Kategorien..."

# Dokumentation
echo "📋 DOKUMENTATION FILES:" > ../CLEANUP_ANALYSIS.md
git ls-files --others --exclude-standard | findstr "\.md$" >> ../CLEANUP_ANALYSIS.md

echo "" >> ../CLEANUP_ANALYSIS.md
echo "🔧 SCRIPT FILES:" >> ../CLEANUP_ANALYSIS.md  
git ls-files --others --exclude-standard | findstr "\.js$" >> ../CLEANUP_ANALYSIS.md

echo "" >> ../CLEANUP_ANALYSIS.md
echo "🛠️ DEPLOYMENT FILES:" >> ../CLEANUP_ANALYSIS.md
git ls-files --others --exclude-standard | findstr "\.bat$\|\.ps1$\|\.sh$" >> ../CLEANUP_ANALYSIS.md

echo "" >> ../CLEANUP_ANALYSIS.md
echo "🌐 HTML FILES:" >> ../CLEANUP_ANALYSIS.md
git ls-files --others --exclude-standard | findstr "\.html$" >> ../CLEANUP_ANALYSIS.md

echo "" >> ../CLEANUP_ANALYSIS.md
echo "📂 DIRECTORIES:" >> ../CLEANUP_ANALYSIS.md
git ls-files --others --exclude-standard | findstr "/$" >> ../CLEANUP_ANALYSIS.md

echo "✅ Analyse erstellt: CLEANUP_ANALYSIS.md"
