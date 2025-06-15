@echo off
echo ================================================
echo Burni Token Website - Quick Deployment Guide
echo ================================================
echo.
echo Your deployment files are ready in the 'dist' folder!
echo.
echo DEPLOYMENT OPTIONS:
echo.
echo 1. MANUAL UPLOAD (Recommended):
echo    - Open your FTP client (FileZilla, WinSCP, etc.)
echo    - Upload ALL files from the 'dist' folder to your web server
echo    - Make sure to preserve the folder structure
echo.
echo 2. GIT-BASED DEPLOYMENT:
echo    - If your website auto-deploys from Git:
echo    - Copy files from 'dist' back to root directory
echo    - git add .
echo    - git commit -m "Deploy i18n system and explorer links"
echo    - git push origin main
echo.
echo 3. GITHUB PAGES (if configured):
echo    - The GitHub Actions workflow will handle deployment
echo    - Just push your changes to the main branch
echo.
echo ================================================
echo POST-DEPLOYMENT TESTING:
echo ================================================
echo.
echo Test these URLs after deployment:
echo - English: https://burnitoken.website
echo - German:  https://burnitoken.website?lang=de
echo.
echo Verify these features work:
echo [x] Language selector dropdown in top navigation
echo [x] Text changes when switching languages
echo [x] Explorer links in Token Details section
echo [x] All navigation and content is translated
echo.
echo ================================================
echo TROUBLESHOOTING:
echo ================================================
echo.
echo If the i18n system doesn't work after deployment:
echo 1. Check browser console for JavaScript errors
echo 2. Verify main.js was uploaded correctly
echo 3. Clear browser cache and reload
echo 4. Test the local version: npm run serve
echo.
pause
