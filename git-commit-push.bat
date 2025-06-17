@echo off
echo 🚀 GIT COMMIT & PUSH SCRIPT
echo ===========================

cd /d "c:\Users\micha\OneDrive\Dokumente\burnitoken.com"

echo 📁 Current Directory:
cd

echo 📋 Git Status:
git status --short

echo ➕ Adding all files...
git add .

echo 💾 Creating commit...
git commit -m "🎯 FIX: URL-Korrekturen & SSL-Diagnose komplett - Website STABIL"

echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ COMMIT & PUSH COMPLETED!
pause
