/**
 * 🚨 CRITICAL WEBSITE ISSUES DETECTOR
 * Comprehensive analysis of burnitoken.com graphics and code problems
 * Detecting: duplicate headers, missing images, overlapping code
 */

const fs = require('fs');
const path = require('path');

class CriticalWebsiteIssueDetector {
    constructor() {
        this.workspaceRoot = process.cwd();
        this.issues = [];
        this.duplicateElements = [];
        this.missingAssets = [];
        this.codeConflicts = [];
    }

    async runComprehensiveAnalysis() {
        console.log('🚨 CRITICAL WEBSITE ISSUES ANALYSIS');
        console.log('===================================');
        console.log('🎯 Analyzing burnitoken.com for critical problems');
        console.log('🔍 Checking for duplicate elements, missing images, code conflicts');
        console.log('');

        // Lade HTML-Datei
        const htmlContent = await this.loadHTMLFile();
        
        // Führe verschiedene Analysen durch
        await this.detectDuplicateMetaTags(htmlContent);
        await this.detectDuplicateHeaders(htmlContent);
        await this.detectMissingImages(htmlContent);
        await this.detectCodeConflicts(htmlContent);
        await this.detectCSSConflicts();
        await this.detectJSConflicts();
        
        // Generiere Bericht
        await this.generateIssueReport();
        
        return this.issues;
    }

    async loadHTMLFile() {
        const htmlPath = path.join(this.workspaceRoot, 'index.html');
        if (!fs.existsSync(htmlPath)) {
            throw new Error('index.html not found');
        }
        return fs.readFileSync(htmlPath, 'utf8');
    }

    async detectDuplicateMetaTags(htmlContent) {
        console.log('🔍 ANALYZING DUPLICATE META TAGS...');
        console.log('====================================');
        
        const metaTags = htmlContent.match(/<meta[^>]*>/g) || [];
        const descriptions = htmlContent.match(/<meta[^>]*name="description"[^>]*>/g) || [];
        const keywords = htmlContent.match(/<meta[^>]*name="keywords"[^>]*>/g) || [];
        const authors = htmlContent.match(/<meta[^>]*name="author"[^>]*>/g) || [];
        
        if (descriptions.length > 1) {
            console.log(`❌ CRITICAL: ${descriptions.length} duplicate description meta tags found!`);
            descriptions.forEach((desc, index) => {
                console.log(`   ${index + 1}. ${desc.substring(0, 80)}...`);
            });
            this.issues.push({
                type: 'CRITICAL',
                category: 'Duplicate Meta Tags',
                issue: `${descriptions.length} duplicate description meta tags`,
                impact: 'SEO damage, search engine confusion',
                solution: 'Remove duplicate meta description tags'
            });
        }
        
        if (keywords.length > 1) {
            console.log(`❌ CRITICAL: ${keywords.length} duplicate keywords meta tags found!`);
            this.issues.push({
                type: 'CRITICAL',
                category: 'Duplicate Meta Tags', 
                issue: `${keywords.length} duplicate keywords meta tags`,
                impact: 'SEO damage',
                solution: 'Remove duplicate meta keywords tags'
            });
        }
        
        if (authors.length > 1) {
            console.log(`❌ WARNING: ${authors.length} duplicate author meta tags found!`);
            this.issues.push({
                type: 'WARNING',
                category: 'Duplicate Meta Tags',
                issue: `${authors.length} duplicate author meta tags`, 
                impact: 'Minor SEO issue',
                solution: 'Remove duplicate meta author tags'
            });
        }
        
        console.log(`📊 Total meta tags: ${metaTags.length}`);
        console.log(`📋 Analysis: ${descriptions.length > 1 || keywords.length > 1 ? 'ISSUES FOUND' : 'OK'}`);
    }

    async detectDuplicateHeaders(htmlContent) {
        console.log('\n🔍 ANALYZING DUPLICATE HEADERS...');
        console.log('=================================');
        
        const headers = htmlContent.match(/<header[^>]*>[\s\S]*?<\/header>/g) || [];
        const navElements = htmlContent.match(/<nav[^>]*>[\s\S]*?<\/nav>/g) || [];
        
        if (headers.length > 1) {
            console.log(`❌ CRITICAL: ${headers.length} duplicate header elements found!`);
            headers.forEach((header, index) => {
                const preview = header.substring(0, 100).replace(/\n/g, ' ');
                console.log(`   ${index + 1}. ${preview}...`);
            });
            this.issues.push({
                type: 'CRITICAL',
                category: 'Duplicate Headers',
                issue: `${headers.length} duplicate header elements`,
                impact: 'Layout breaks, visual duplication',
                solution: 'Remove duplicate header elements'
            });
        }
        
        if (navElements.length > 2) { // Erlaubt mobile + desktop nav
            console.log(`⚠️  WARNING: ${navElements.length} navigation elements found (expected max 2)`);
            this.issues.push({
                type: 'WARNING',
                category: 'Multiple Navigation',
                issue: `${navElements.length} navigation elements`,
                impact: 'Potential layout confusion',
                solution: 'Review navigation structure'
            });
        }
        
        console.log(`📊 Headers found: ${headers.length}`);
        console.log(`📊 Navigation elements: ${navElements.length}`);
    }

    async detectMissingImages(htmlContent) {
        console.log('\n🖼️  ANALYZING MISSING IMAGES...');
        console.log('===============================');
        
        const imgTags = htmlContent.match(/<img[^>]*src="([^"]*)"[^>]*>/g) || [];
        const backgroundImages = htmlContent.match(/background-image:\s*url\(['"]([^'"]*)['"]\)/g) || [];
        
        let missingCount = 0;
        
        for (const imgTag of imgTags) {
            const srcMatch = imgTag.match(/src="([^"]*)"/);
            if (srcMatch) {
                const src = srcMatch[1];
                if (!src.startsWith('http') && !src.startsWith('data:')) {
                    const imagePath = path.join(this.workspaceRoot, src.replace(/^\.\//, ''));
                    if (!fs.existsSync(imagePath)) {
                        console.log(`❌ MISSING IMAGE: ${src}`);
                        missingCount++;
                        this.missingAssets.push({
                            type: 'image',
                            path: src,
                            fullPath: imagePath
                        });
                    }
                }
            }
        }
        
        if (missingCount > 0) {
            console.log(`❌ CRITICAL: ${missingCount} missing images detected!`);
            this.issues.push({
                type: 'CRITICAL',
                category: 'Missing Assets',
                issue: `${missingCount} missing image files`,
                impact: 'Broken layout, poor user experience',
                solution: 'Add missing image files or fix image paths'
            });
        } else {
            console.log('✅ All images found and accessible');
        }
        
        console.log(`📊 Total image references: ${imgTags.length}`);
        console.log(`📊 Missing images: ${missingCount}`);
    }

    async detectCodeConflicts(htmlContent) {
        console.log('\n🔧 ANALYZING CODE CONFLICTS...');
        console.log('==============================');
        
        // Suche nach doppelten IDs
        const idMatches = htmlContent.match(/id="([^"]*)"/g) || [];
        const ids = idMatches.map(match => match.match(/id="([^"]*)"/)[1]);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        
        if (duplicateIds.length > 0) {
            console.log(`❌ CRITICAL: Duplicate IDs found!`);
            const uniqueDuplicates = [...new Set(duplicateIds)];
            uniqueDuplicates.forEach(id => {
                console.log(`   - Duplicate ID: "${id}"`);
            });
            this.issues.push({
                type: 'CRITICAL',
                category: 'Code Conflicts',
                issue: `${uniqueDuplicates.length} duplicate HTML IDs`,
                impact: 'JavaScript errors, CSS conflicts',
                solution: 'Make all IDs unique'
            });
        }
        
        // Suche nach überlappenden script-Tags
        const scriptTags = htmlContent.match(/<script[^>]*>[\s\S]*?<\/script>/g) || [];
        console.log(`📊 Script tags found: ${scriptTags.length}`);
        
        // Suche nach style-Konflikten
        const styleTags = htmlContent.match(/<style[^>]*>[\s\S]*?<\/style>/g) || [];
        console.log(`📊 Style tags found: ${styleTags.length}`);
        
        if (styleTags.length > 3) {
            console.log(`⚠️  WARNING: Many inline style tags (${styleTags.length}) - consider consolidation`);
            this.issues.push({
                type: 'WARNING',
                category: 'Code Organization',
                issue: `${styleTags.length} inline style tags`,
                impact: 'Performance impact, maintenance difficulty',
                solution: 'Consolidate styles into external CSS files'
            });
        }
    }

    async detectCSSConflicts() {
        console.log('\n🎨 ANALYZING CSS CONFLICTS...');
        console.log('=============================');
        
        const cssFiles = ['assets/styles.css', 'assets/custom.css', 'assets/dark-mode.css'];
        let totalCSSFiles = 0;
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.workspaceRoot, cssFile);
            if (fs.existsSync(cssPath)) {
                totalCSSFiles++;
                console.log(`✅ Found: ${cssFile}`);
            }
        }
        
        console.log(`📊 CSS files found: ${totalCSSFiles}`);
        
        // Überprüfe auf Tailwind + Custom CSS Konflikte
        const htmlPath = path.join(this.workspaceRoot, 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const hasTailwind = htmlContent.includes('tailwindcss') || htmlContent.includes('tailwind');
        const hasCustomCSS = htmlContent.includes('assets/styles.css');
        
        if (hasTailwind && hasCustomCSS) {
            console.log('⚠️  WARNING: Tailwind CSS + Custom CSS detected - potential conflicts');
            this.issues.push({
                type: 'WARNING',
                category: 'CSS Conflicts',
                issue: 'Tailwind CSS + Custom CSS combination',
                impact: 'Style conflicts, specificity issues',
                solution: 'Review CSS priority and specificity'
            });
        }
    }

    async detectJSConflicts() {
        console.log('\n⚡ ANALYZING JAVASCRIPT CONFLICTS...');
        console.log('====================================');
        
        const jsFiles = ['assets/scripts.js', 'assets/scripts.min.js', 'main.js'];
        let loadedJSFiles = 0;
        
        for (const jsFile of jsFiles) {
            const jsPath = path.join(this.workspaceRoot, jsFile);
            if (fs.existsSync(jsPath)) {
                loadedJSFiles++;
                console.log(`✅ Found: ${jsFile}`);
            }
        }
        
        console.log(`📊 JavaScript files found: ${loadedJSFiles}`);
        
        if (loadedJSFiles > 2) {
            console.log('⚠️  WARNING: Multiple JS files may cause conflicts');
            this.issues.push({
                type: 'WARNING',
                category: 'JavaScript Conflicts',
                issue: `${loadedJSFiles} JavaScript files loaded`,
                impact: 'Potential variable conflicts, performance impact',
                solution: 'Consolidate JavaScript files'
            });
        }
    }

    async generateIssueReport() {
        console.log('\n📋 CRITICAL ISSUES SUMMARY');
        console.log('==========================');
        
        const criticalIssues = this.issues.filter(issue => issue.type === 'CRITICAL');
        const warningIssues = this.issues.filter(issue => issue.type === 'WARNING');
        
        console.log(`❌ CRITICAL ISSUES: ${criticalIssues.length}`);
        console.log(`⚠️  WARNING ISSUES: ${warningIssues.length}`);
        console.log(`📊 TOTAL ISSUES: ${this.issues.length}`);
        
        if (criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
            console.log('================================================');
            criticalIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.category}: ${issue.issue}`);
                console.log(`   💥 Impact: ${issue.impact}`);
                console.log(`   🔧 Solution: ${issue.solution}`);
                console.log('');
            });
        }
        
        if (warningIssues.length > 0) {
            console.log('\n⚠️  WARNING ISSUES FOR OPTIMIZATION:');
            console.log('====================================');
            warningIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.category}: ${issue.issue}`);
                console.log(`   📊 Impact: ${issue.impact}`);
                console.log(`   💡 Suggestion: ${issue.solution}`);
                console.log('');
            });
        }
        
        // Report speichern
        const report = {
            timestamp: new Date().toISOString(),
            website: 'burnitoken.com',
            analysisType: 'Critical Issues Detection',
            summary: {
                totalIssues: this.issues.length,
                criticalIssues: criticalIssues.length,
                warningIssues: warningIssues.length,
                missingAssets: this.missingAssets.length
            },
            issues: this.issues,
            missingAssets: this.missingAssets,
            recommendations: this.generateRecommendations(criticalIssues, warningIssues)
        };
        
        fs.writeFileSync(
            path.join(this.workspaceRoot, 'critical-website-issues-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('📄 Detailed report saved: critical-website-issues-report.json');
        
        return report;
    }

    generateRecommendations(critical, warnings) {
        const recommendations = [];
        
        if (critical.length > 0) {
            recommendations.push('🚨 URGENT: Fix all critical issues immediately');
            recommendations.push('🔧 Clean up duplicate meta tags and headers');
            recommendations.push('🖼️  Add missing image files or fix paths');
            recommendations.push('⚡ Fix duplicate HTML IDs');
        }
        
        if (warnings.length > 0) {
            recommendations.push('🎯 Optimize CSS and JavaScript structure');
            recommendations.push('📦 Consolidate multiple CSS/JS files');
            recommendations.push('🔄 Review Tailwind + Custom CSS integration');
        }
        
        recommendations.push('🧪 Test website thoroughly after fixes');
        recommendations.push('📊 Monitor website performance');
        recommendations.push('✅ Validate HTML and CSS');
        
        return recommendations;
    }
}

// Critical Issues Detector starten
async function runCriticalIssuesDetection() {
    try {
        console.log('🚨 CRITICAL WEBSITE ISSUES DETECTOR');
        console.log('===================================');
        console.log('🎯 Comprehensive Analysis of burnitoken.com');
        console.log('🔍 Detecting Graphics Errors, Code Conflicts, Missing Assets');
        console.log('');

        const detector = new CriticalWebsiteIssueDetector();
        const issues = await detector.runComprehensiveAnalysis();

        if (issues.length === 0) {
            console.log('\n🎉 NO CRITICAL ISSUES DETECTED!');
            console.log('==============================');
            console.log('✅ Website structure appears clean');
            console.log('✅ No duplicate elements found');
            console.log('✅ All assets accessible');
        } else {
            console.log('\n🚨 ISSUES DETECTED - IMMEDIATE ACTION REQUIRED!');
            console.log('===============================================');
            console.log('📋 Review critical-website-issues-report.json for details');
            console.log('🔧 Apply recommended fixes immediately');
        }

        return issues;

    } catch (error) {
        console.error('❌ Critical Issues Detection Error:', error);
        throw error;
    }
}

// Export für andere Module
module.exports = {
    CriticalWebsiteIssueDetector,
    runCriticalIssuesDetection
};

// Direkter Start wenn Datei ausgeführt wird
if (require.main === module) {
    runCriticalIssuesDetection().catch(console.error);
}
