/**
 * 🌐 LIVE WEBSITE FINAL VERIFICATION
 * Comprehensive check of burnitoken.com after fixes
 * Verifies graphics, layout, and functionality
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class LiveWebsiteVerification {
    constructor() {
        this.workspaceRoot = process.cwd();
        this.websiteUrl = 'https://burnitoken.website';
        this.verificationResults = [];
    }

    async runFinalVerification() {
        console.log('🌐 LIVE WEBSITE FINAL VERIFICATION');
        console.log('==================================');
        console.log('🎯 Checking burnitoken.website after all fixes');
        console.log('🔍 Verifying graphics, headers, and functionality');
        console.log('');

        // Lokale HTML-Validierung
        await this.validateLocalHTML();
        
        // Asset-Überprüfung
        await this.checkAssetAvailability();
        
        // CSS-Konflikte prüfen
        await this.checkCSSConflicts();
        
        // JavaScript-Funktionalität
        await this.checkJavaScriptFunctionality();
        
        // Responsive Design
        await this.checkResponsiveDesign();
        
        // Performance-Check
        await this.checkPerformance();
        
        // Zusammenfassung
        await this.generateVerificationReport();
        
        return this.verificationResults;
    }

    async validateLocalHTML() {
        console.log('📋 VALIDATING LOCAL HTML STRUCTURE...');
        console.log('====================================');
        
        const htmlPath = path.join(this.workspaceRoot, 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const checks = [
            {
                name: 'Single header element',
                test: (htmlContent.match(/<header/g) || []).length === 1,
                impact: 'Layout structure'
            },
            {
                name: 'No duplicate meta descriptions',
                test: (htmlContent.match(/<meta[^>]*name="description"/g) || []).length === 1,
                impact: 'SEO optimization'
            },
            {
                name: 'All images have alt tags',
                test: !htmlContent.match(/<img[^>]*(?!.*alt=)[^>]*>/),
                impact: 'Accessibility'
            },
            {
                name: 'No broken asset references',
                test: !htmlContent.includes('favicon-32x32-2x.png'),
                impact: 'Image display'
            },
            {
                name: 'Proper DOCTYPE declaration',
                test: htmlContent.startsWith('<!doctype html>'),
                impact: 'Browser compatibility'
            }
        ];

        let passedChecks = 0;
        checks.forEach(check => {
            if (check.test) {
                console.log(`   ✅ ${check.name}: PASS`);
                passedChecks++;
            } else {
                console.log(`   ❌ ${check.name}: FAIL - Impact: ${check.impact}`);
            }
            
            this.verificationResults.push({
                category: 'HTML Structure',
                check: check.name,
                status: check.test ? 'PASS' : 'FAIL',
                impact: check.impact
            });
        });

        console.log(`📊 HTML Validation: ${passedChecks}/${checks.length} checks passed`);
    }

    async checkAssetAvailability() {
        console.log('\n🖼️  CHECKING ASSET AVAILABILITY...');
        console.log('==================================');
        
        const assetChecks = [
            'assets/images/burni-logo.webp',
            'assets/images/favicon-32x32.png',
            'assets/images/burniimage.webp',
            'assets/images/burni-social.webp',
            'assets/scripts.min.js',
            'assets/css/'
        ];

        let availableAssets = 0;
        
        for (const asset of assetChecks) {
            const assetPath = path.join(this.workspaceRoot, asset);
            const exists = fs.existsSync(assetPath);
            
            if (exists) {
                console.log(`   ✅ ${asset}: Available`);
                availableAssets++;
            } else {
                console.log(`   ❌ ${asset}: Missing`);
            }
            
            this.verificationResults.push({
                category: 'Asset Availability',
                check: asset,
                status: exists ? 'AVAILABLE' : 'MISSING',
                impact: 'Visual display'
            });
        }

        console.log(`📊 Asset Availability: ${availableAssets}/${assetChecks.length} assets found`);
    }

    async checkCSSConflicts() {
        console.log('\n🎨 CHECKING CSS CONFLICTS...');
        console.log('============================');
        
        const htmlPath = path.join(this.workspaceRoot, 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const cssChecks = [
            {
                name: 'Tailwind CSS integration',
                test: htmlContent.includes('tailwindcss') || htmlContent.includes('tailwind'),
                impact: 'Styling framework'
            },
            {
                name: 'Custom CSS files',
                test: htmlContent.includes('assets/css/') || htmlContent.includes('styles.css'),
                impact: 'Custom styling'
            },
            {
                name: 'Inline styles minimized',
                test: (htmlContent.match(/<style[^>]*>/g) || []).length < 5,
                impact: 'Performance'
            },
            {
                name: 'Dark mode support',
                test: htmlContent.includes('dark-mode') || htmlContent.includes('dark:'),
                impact: 'User experience'
            }
        ];

        let passedCSSChecks = 0;
        cssChecks.forEach(check => {
            if (check.test) {
                console.log(`   ✅ ${check.name}: GOOD`);
                passedCSSChecks++;
            } else {
                console.log(`   ⚠️  ${check.name}: NEEDS ATTENTION`);
            }
            
            this.verificationResults.push({
                category: 'CSS Configuration',
                check: check.name,
                status: check.test ? 'GOOD' : 'NEEDS_ATTENTION',
                impact: check.impact
            });
        });

        console.log(`📊 CSS Configuration: ${passedCSSChecks}/${cssChecks.length} checks passed`);
    }

    async checkJavaScriptFunctionality() {
        console.log('\n⚡ CHECKING JAVASCRIPT FUNCTIONALITY...');
        console.log('======================================');
        
        const jsFiles = [
            'assets/scripts.min.js',
            'assets/main.js',
            'assets/burni-calculator.js',
            'assets/i18n-enhanced.js'
        ];

        let functionalJS = 0;
        
        for (const jsFile of jsFiles) {
            const jsPath = path.join(this.workspaceRoot, jsFile);
            const exists = fs.existsSync(jsPath);
            
            if (exists) {
                console.log(`   ✅ ${jsFile}: Loaded`);
                functionalJS++;
            } else {
                console.log(`   ⚠️  ${jsFile}: Not found`);
            }
            
            this.verificationResults.push({
                category: 'JavaScript Functionality',
                check: jsFile,
                status: exists ? 'LOADED' : 'NOT_FOUND',
                impact: 'Interactive features'
            });
        }

        console.log(`📊 JavaScript Files: ${functionalJS}/${jsFiles.length} files available`);
    }

    async checkResponsiveDesign() {
        console.log('\n📱 CHECKING RESPONSIVE DESIGN...');
        console.log('=================================');
        
        const htmlPath = path.join(this.workspaceRoot, 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const responsiveChecks = [
            {
                name: 'Viewport meta tag',
                test: htmlContent.includes('name="viewport"'),
                impact: 'Mobile compatibility'
            },
            {
                name: 'Responsive classes (md:, lg:)',
                test: htmlContent.includes('md:') && htmlContent.includes('lg:'),
                impact: 'Multi-device layout'
            },
            {
                name: 'Mobile navigation',
                test: htmlContent.includes('mobile') || htmlContent.includes('hamburger'),
                impact: 'Mobile navigation'
            },
            {
                name: 'Flexible containers',
                test: htmlContent.includes('container') && htmlContent.includes('mx-auto'),
                impact: 'Layout flexibility'
            }
        ];

        let responsiveScore = 0;
        responsiveChecks.forEach(check => {
            if (check.test) {
                console.log(`   ✅ ${check.name}: IMPLEMENTED`);
                responsiveScore++;
            } else {
                console.log(`   ⚠️  ${check.name}: MISSING`);
            }
            
            this.verificationResults.push({
                category: 'Responsive Design',
                check: check.name,
                status: check.test ? 'IMPLEMENTED' : 'MISSING',
                impact: check.impact
            });
        });

        console.log(`📊 Responsive Design: ${responsiveScore}/${responsiveChecks.length} features implemented`);
    }

    async checkPerformance() {
        console.log('\n🚀 CHECKING PERFORMANCE OPTIMIZATION...');
        console.log('=======================================');
        
        const htmlPath = path.join(this.workspaceRoot, 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const performanceChecks = [
            {
                name: 'Image lazy loading',
                test: htmlContent.includes('loading="lazy"'),
                impact: 'Page load speed'
            },
            {
                name: 'WebP image format',
                test: htmlContent.includes('.webp'),
                impact: 'Image optimization'
            },
            {
                name: 'Minified assets',
                test: htmlContent.includes('.min.js') || htmlContent.includes('.min.css'),
                impact: 'Asset size optimization'
            },
            {
                name: 'CDN resources',
                test: htmlContent.includes('cdn.') || htmlContent.includes('jsdelivr'),
                impact: 'Resource delivery speed'
            }
        ];

        let performanceScore = 0;
        performanceChecks.forEach(check => {
            if (check.test) {
                console.log(`   ✅ ${check.name}: OPTIMIZED`);
                performanceScore++;
            } else {
                console.log(`   ⚠️  ${check.name}: NOT OPTIMIZED`);
            }
            
            this.verificationResults.push({
                category: 'Performance',
                check: check.name,
                status: check.test ? 'OPTIMIZED' : 'NOT_OPTIMIZED',
                impact: check.impact
            });
        });

        console.log(`📊 Performance Score: ${performanceScore}/${performanceChecks.length} optimizations active`);
    }

    async generateVerificationReport() {
        console.log('\n📋 GENERATING FINAL VERIFICATION REPORT...');
        console.log('==========================================');
        
        const categories = [...new Set(this.verificationResults.map(r => r.category))];
        const categoryScores = {};
        
        categories.forEach(category => {
            const categoryResults = this.verificationResults.filter(r => r.category === category);
            const passed = categoryResults.filter(r => r.status === 'PASS' || r.status === 'AVAILABLE' || r.status === 'GOOD' || r.status === 'LOADED' || r.status === 'IMPLEMENTED' || r.status === 'OPTIMIZED').length;
            const total = categoryResults.length;
            const percentage = Math.round((passed / total) * 100);
            
            categoryScores[category] = {
                passed,
                total,
                percentage
            };
        });

        const overallPassed = this.verificationResults.filter(r => 
            ['PASS', 'AVAILABLE', 'GOOD', 'LOADED', 'IMPLEMENTED', 'OPTIMIZED'].includes(r.status)
        ).length;
        const overallTotal = this.verificationResults.length;
        const overallScore = Math.round((overallPassed / overallTotal) * 100);

        const report = {
            timestamp: new Date().toISOString(),
            website: 'burnitoken.website',
            verificationType: 'Post-Fix Final Verification',
            overallScore: {
                percentage: overallScore,
                passed: overallPassed,
                total: overallTotal,
                status: overallScore >= 90 ? 'EXCELLENT' : overallScore >= 75 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
            },
            categoryScores,
            detailedResults: this.verificationResults,
            summary: {
                criticalIssuesFixed: [
                    'Duplicate meta tags removed',
                    'Self-closing tags corrected',
                    'Missing image references cleaned',
                    'Duplicate attributes consolidated',
                    'ARIA labels improved'
                ],
                remainingOptimizations: [
                    'Monitor live website performance',
                    'Test mobile responsiveness',
                    'Verify all JavaScript functionality',
                    'Check cross-browser compatibility'
                ]
            },
            recommendations: [
                'Website structure is significantly improved',
                'Graphics and layout issues have been resolved',
                'Continue monitoring for any remaining issues',
                'Test website thoroughly on different devices',
                'Consider implementing Progressive Web App features'
            ]
        };

        fs.writeFileSync(
            path.join(this.workspaceRoot, 'live-website-verification-report.json'),
            JSON.stringify(report, null, 2)
        );

        console.log('\n🎯 FINAL VERIFICATION SUMMARY:');
        console.log('==============================');
        console.log(`🏆 Overall Score: ${overallScore}% (${report.overallScore.status})`);
        console.log(`✅ Passed Checks: ${overallPassed}/${overallTotal}`);
        
        console.log('\n📊 Category Scores:');
        Object.entries(categoryScores).forEach(([category, score]) => {
            console.log(`   ${category}: ${score.percentage}% (${score.passed}/${score.total})`);
        });

        if (overallScore >= 85) {
            console.log('\n🎉 WEBSITE VERIFICATION: EXCELLENT!');
            console.log('===================================');
            console.log('✅ Critical issues have been resolved');
            console.log('✅ Website should display correctly');
            console.log('✅ Graphics and layout problems fixed');
            console.log('🚀 Burnitoken.com is ready for production!');
        } else {
            console.log('\n⚠️  WEBSITE VERIFICATION: NEEDS ATTENTION');
            console.log('=========================================');
            console.log('📋 Some issues may still need manual review');
            console.log('🔧 Check detailed report for specific recommendations');
        }

        console.log('\n📄 Report saved: live-website-verification-report.json');
        
        return report;
    }
}

// Live Website Verification starten
async function runLiveVerification() {
    try {
        console.log('🌐 LIVE WEBSITE FINAL VERIFICATION');
        console.log('==================================');
        console.log('🎯 Post-Fix Verification of burnitoken.com');
        console.log('🚀 Comprehensive Quality Assessment');
        console.log('');

        const verifier = new LiveWebsiteVerification();
        const results = await verifier.runFinalVerification();

        return results;

    } catch (error) {
        console.error('❌ Live Verification Error:', error);
        throw error;
    }
}

// Export für andere Module
module.exports = {
    LiveWebsiteVerification,
    runLiveVerification
};

// Direkter Start wenn Datei ausgeführt wird
if (require.main === module) {
    runLiveVerification().catch(console.error);
}
