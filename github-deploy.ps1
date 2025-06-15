# Git Setup and GitHub Actions Deployment Script
# This script initializes git (if needed) and triggers GitHub Actions deployment

Write-Host "Burni Token Website - GitHub Actions Deployment" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git version: $gitVersion" -ForegroundColor Gray
} catch {
    Write-Host "Git is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Git first: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if this is a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    
    Write-Host "Setting up git configuration..." -ForegroundColor Yellow
    Write-Host "Please enter your Git configuration:"
    $name = Read-Host "Git user name"
    $email = Read-Host "Git user email"
    
    git config user.name "$name"
    git config user.email "$email"
    
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    $repo = Read-Host "GitHub repository URL (e.g., https://github.com/username/burnitoken.com.git)"
    git remote add origin $repo
}

# Check git status
Write-Host "Checking git status..." -ForegroundColor Yellow
git status

# Stage all files
Write-Host "Staging all files..." -ForegroundColor Yellow
git add .

# Show what will be committed
Write-Host "Files to be committed:" -ForegroundColor Yellow
git diff --cached --name-only

# Commit changes
Write-Host "Creating commit..." -ForegroundColor Yellow
$commitMessage = "Deploy i18n system and explorer links - Full internationalization implementation"
git commit -m "$commitMessage"

# Push to trigger GitHub Actions
Write-Host "Pushing to GitHub (this will trigger GitHub Actions deployment)..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "Push successful! GitHub Actions deployment should start now." -ForegroundColor Green
} catch {
    Write-Host "Push failed. Trying 'master' branch..." -ForegroundColor Yellow
    try {
        git push origin master
        Write-Host "Push successful! GitHub Actions deployment should start now." -ForegroundColor Green
    } catch {
        Write-Host "Push failed. Please check your GitHub repository configuration." -ForegroundColor Red
        Write-Host "Manual steps:" -ForegroundColor Yellow
        Write-Host "1. Check if the repository exists on GitHub" -ForegroundColor Gray
        Write-Host "2. Verify your GitHub credentials" -ForegroundColor Gray
        Write-Host "3. Try: git push origin main --force" -ForegroundColor Gray
        exit 1
    }
}

Write-Host "GitHub Actions Deployment Information:" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✅ Code pushed to GitHub" -ForegroundColor Gray
Write-Host "🔄 GitHub Actions workflow should be running" -ForegroundColor Gray
Write-Host "🌐 Deployment target: https://burnitoken.website" -ForegroundColor Gray

Write-Host "Monitor your deployment:" -ForegroundColor Yellow
Write-Host "1. Go to your GitHub repository" -ForegroundColor Gray
Write-Host "2. Click on 'Actions' tab" -ForegroundColor Gray
Write-Host "3. Look for 'Deploy Burni Token Website' workflow" -ForegroundColor Gray
Write-Host "4. Click on the running workflow to see live logs" -ForegroundColor Gray

Write-Host "Expected deployment time: 3-5 minutes" -ForegroundColor Cyan
Write-Host "Test URLs after deployment:" -ForegroundColor Cyan
Write-Host "- English: https://burnitoken.website" -ForegroundColor Gray
Write-Host "- German:  https://burnitoken.website?lang=de" -ForegroundColor Gray

Write-Host "Features that will be live:" -ForegroundColor Green
Write-Host "🌐 Full German/English i18n system" -ForegroundColor Gray
Write-Host "🔄 Dynamic language switching" -ForegroundColor Gray
Write-Host "🔗 Explorer links (XRPL/Bithomp)" -ForegroundColor Gray
Write-Host "📊 Localized charts and tables" -ForegroundColor Gray
Write-Host "💱 Currency formatting per language" -ForegroundColor Gray
