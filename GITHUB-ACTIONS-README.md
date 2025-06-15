# 🚀 GitHub Actions Deployment Setup

## Overview

This repository is configured with GitHub Actions for automatic deployment of the Burni Token website with full internationalization support.

## 🔧 Workflows

### 1. `deploy.yml` - Production Deployment
- **Trigger**: Push to `main` or `master` branch
- **Target**: https://burnitoken.website
- **Features**: Full build, test, and deploy pipeline

### 2. `ci.yml` - Continuous Integration
- **Trigger**: Pull requests and feature branches
- **Purpose**: Quality assurance and testing

## 🌐 i18n System Deployment

The GitHub Actions workflow automatically deploys:
- ✅ Full German/English translation system
- ✅ Dynamic language switching functionality  
- ✅ Explorer links for XRPL and Bithomp
- ✅ Localized charts and data visualization
- ✅ Proper currency formatting per language

## 📋 Deployment Process

1. **Code Push**: Push changes to main branch
2. **Automated Testing**: Runs all tests (unit, accessibility, performance)
3. **Build Process**: Compiles and optimizes assets
4. **i18n Verification**: Validates translation system
5. **Deployment**: Publishes to GitHub Pages
6. **Post-Deploy Tests**: Verifies website accessibility

## 🧪 Quality Gates

Before deployment, the following checks must pass:

- [ ] **Linting**: Code style and quality checks
- [ ] **Unit Tests**: All Jest tests pass (6/6)
- [ ] **HTML Validation**: Markup validation
- [ ] **E2E Tests**: Playwright browser tests  
- [ ] **i18n Verification**: Translation system validation
- [ ] **Build Success**: Asset compilation without errors

## 🌍 Testing After Deployment

Once deployed, verify these features:

### Language Switching
- [ ] English: https://burnitoken.website
- [ ] German: https://burnitoken.website?lang=de
- [ ] Language selector dropdown functions
- [ ] All text updates without page reload

### Explorer Links
- [ ] XRPL Explorer link works
- [ ] Bithomp Explorer link works
- [ ] Links open in new tab
- [ ] Correct issuer address displayed

### Content Localization
- [ ] Navigation menu translated
- [ ] Hero section shows correct language
- [ ] All KPIs and data sections translated
- [ ] Charts and tables use proper locale

## 🔍 Monitoring Deployment

### View Workflow Status
1. Go to repository **Actions** tab
2. Find **"Deploy Burni Token Website"** workflow
3. Click to view live deployment logs

### Deployment Timeline
- **Testing Phase**: ~2-3 minutes
- **Build Phase**: ~1 minute  
- **Deploy Phase**: ~1-2 minutes
- **Total Time**: ~4-6 minutes

## 🆘 Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs for specific errors
2. Verify all tests pass locally: `npm test`
3. Check repository permissions and settings
4. Ensure `GITHUB_TOKEN` has proper permissions

### i18n Not Working
1. Clear browser cache (Ctrl+F5)
2. Check browser console for JavaScript errors
3. Verify main.js file size (~48KB expected)
4. Test local version: `npm run serve`

### Domain Issues
1. Verify CNAME record points to GitHub Pages
2. Check custom domain settings in repository
3. Ensure SSL certificate is active

## 🔧 Manual Deployment

If automatic deployment fails, use manual deployment:

```bash
# Run the deployment script
PowerShell -ExecutionPolicy Bypass -File github-deploy.ps1
```

## 📊 Deployment Verification

After successful deployment, the website should have:

- 🌐 **Language Support**: EN/DE with URL parameter detection
- 🔄 **Dynamic Switching**: Instant translation without reload  
- 🔗 **Explorer Integration**: Direct links to XRPL explorers
- 📱 **Mobile Responsive**: Works on all device sizes
- ⚡ **Fast Loading**: Optimized assets and caching

## 🎯 Next Steps

1. **Monitor First Deployment**: Check all features work correctly
2. **User Testing**: Have German/English users test language switching
3. **SEO Optimization**: Consider adding hreflang tags
4. **Analytics**: Track language usage and user behavior
5. **Expand Languages**: Add more language support as needed

---

**Ready for deployment!** Push your changes to the main branch to trigger automatic deployment.
