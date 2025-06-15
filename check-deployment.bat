@echo off
echo ===============================================
echo GitHub Actions Deployment Status Checker
echo ===============================================
echo.

echo Opening GitHub Actions page...
echo.
echo Please check the following in your browser:
echo.
echo 1. GITHUB REPOSITORY:
echo    - Go to your GitHub repository
echo    - Click on "Actions" tab
echo    - Look for "Deploy Burni Token Website" workflow
echo.
echo 2. WORKFLOW STATUS:
echo    - Green checkmark = Deployment successful
echo    - Yellow circle = Deployment in progress  
echo    - Red X = Deployment failed
echo.
echo 3. LIVE WEBSITE TEST:
echo    After deployment completes, test these URLs:
echo.
echo    English: https://burnitoken.website
echo    German:  https://burnitoken.website?lang=de
echo.
echo 4. VERIFY THESE FEATURES:
echo    [ ] Language selector dropdown in navigation
echo    [ ] Text changes when switching languages  
echo    [ ] Explorer links in Token Details section
echo    [ ] All content properly translated
echo    [ ] No JavaScript errors in browser console
echo.
echo ===============================================
echo TROUBLESHOOTING:
echo ===============================================
echo.
echo If deployment fails:
echo - Check GitHub Actions logs for error details
echo - Verify all tests pass locally: npm test
echo - Check file permissions and repository settings
echo.
echo If i18n doesn't work after deployment:
echo - Clear browser cache (Ctrl+F5)
echo - Check browser console for JavaScript errors
echo - Verify main.js was uploaded correctly
echo.
echo GitHub Actions deployment typically takes 3-5 minutes.
echo.
pause
