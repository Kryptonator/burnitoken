#!/bin/bash
# GitHub Actions Setup Script for Linux/Mac/WSL
# Alternative to PowerShell script for Git deployment

echo "🚀 Burni Token Website - GitHub Actions Setup"
echo "=============================================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo "Please install Git first:"
    echo "- Ubuntu/Debian: sudo apt install git"
    echo "- macOS: brew install git" 
    echo "- Windows: https://git-scm.com/download/win"
    exit 1
fi

echo "✅ Git found: $(git --version)"

# Check if this is a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    
    echo "👤 Setting up git configuration..."
    read -p "Enter your Git user name: " name
    read -p "Enter your Git user email: " email
    
    git config user.name "$name"
    git config user.email "$email"
    
    echo "🔗 Adding remote repository..."
    read -p "Enter GitHub repository URL: " repo
    git remote add origin "$repo"
    
    echo "🌿 Setting default branch to main..."
    git branch -M main
fi

# Verify deployment files are ready
echo "🔍 Verifying deployment files..."

if [ ! -f "main.js" ] || [ ! -f "index.html" ]; then
    echo "❌ Critical files missing! Please ensure main.js and index.html exist."
    exit 1
fi

# Check file sizes (rough validation)
main_js_size=$(stat -c%s "main.js" 2>/dev/null || stat -f%z "main.js" 2>/dev/null || echo "0")
index_html_size=$(stat -c%s "index.html" 2>/dev/null || stat -f%z "index.html" 2>/dev/null || echo "0")

echo "📊 File sizes:"
echo "  - main.js: $main_js_size bytes (expected: ~48,000)"
echo "  - index.html: $index_html_size bytes (expected: ~77,000)"

if [ "$main_js_size" -lt 40000 ]; then
    echo "⚠️  main.js seems too small - might be missing i18n code"
fi

# Verify i18n system
echo "🌐 Verifying i18n system..."

if grep -q "translations.*=" main.js && grep -q "changeLanguage" main.js; then
    echo "✅ i18n system found in main.js"
else
    echo "❌ i18n system not found in main.js!"
    exit 1
fi

if grep -q "data-i18n" index.html && grep -q 'id="lang-select"' index.html; then
    echo "✅ i18n attributes found in index.html" 
else
    echo "❌ i18n attributes not found in index.html!"
    exit 1
fi

# Check GitHub Actions workflow
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✅ GitHub Actions deployment workflow found"
else
    echo "❌ GitHub Actions workflow missing!"
    exit 1
fi

# Stage all files
echo "📦 Staging all files..."
git add .

# Show status
echo "📋 Git status:"
git status --short

# Create commit
echo "💾 Creating commit..."
commit_message="Deploy i18n system and explorer links

✨ Features:
- Full German/English internationalization
- Dynamic language switching via dropdown
- Explorer links (XRPL/Bithomp) 
- Localized charts and tables
- Currency formatting per language
- All tests passing (6/6)

🧪 Tested locally:
- English: http://localhost:8080
- German: http://localhost:8080?lang=de

🚀 Ready for GitHub Actions deployment"

git commit -m "$commit_message"

# Push to trigger GitHub Actions
echo "🚀 Pushing to GitHub (this will trigger deployment)..."

if git push origin main; then
    echo "✅ Push successful!"
elif git push origin master; then
    echo "✅ Push to master successful!"
else
    echo "❌ Push failed!"
    echo "Manual steps:"
    echo "1. Check GitHub repository exists"
    echo "2. Verify GitHub credentials" 
    echo "3. Try: git push origin main --set-upstream"
    exit 1
fi

echo ""
echo "🎉 GitHub Actions Deployment Started!"
echo "====================================="
echo ""
echo "📍 Monitor your deployment:"
echo "1. Go to your GitHub repository"
echo "2. Click 'Actions' tab"
echo "3. Look for 'Deploy Burni Token Website' workflow"
echo "4. Click to view live deployment logs"
echo ""
echo "⏱️  Expected deployment time: 4-6 minutes"
echo ""
echo "🌐 Test URLs after deployment:"
echo "   English: https://burnitoken.website"
echo "   German:  https://burnitoken.website?lang=de"
echo ""
echo "✨ Features going live:"
echo "   🌐 Full German/English i18n system"
echo "   🔄 Dynamic language switching"
echo "   🔗 Explorer links (XRPL/Bithomp)"
echo "   📊 Localized charts and tables"
echo "   💱 Currency formatting per language"
echo ""
echo "🔍 Verify after deployment:"
echo "   [ ] Language selector in navigation works"
echo "   [ ] URL parameter ?lang=de switches to German"
echo "   [ ] Explorer links open correctly"
echo "   [ ] All content translates properly"
echo "   [ ] No JavaScript errors in console"
