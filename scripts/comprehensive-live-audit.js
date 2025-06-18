#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE LIVE WEBSITE AUDIT TOOL
 * Prüft alle Aspekte einer Live-Website: Performance, SEO, Accessibility, Security, HTML/CSS/JS
 */

const fs = require('fs');
const https = require('https');
const { URL } = require('url');

const WEBSITE_URL = 'https://burnitoken.website';
const REPORT_FILE = 'docs/LIVE_AUDIT_REPORT_' + new Date().toISOString().split('T')[0] + '.md';

class WebsiteAuditor {
    constructor(url) {
        this.url = url;
        this.results = {
            performance: {},
            seo: {},
            accessibility: {},
            security: {},
            html: {},
            css: {},
            javascript: {},
            mobile: {},
            errors: []
        };
    }

    async runFullAudit() {
        console.log('🔍 STARTING COMPREHENSIVE LIVE AUDIT...');
        console.log('🌐 Target:', this.url);
        console.log('⏰ Started:', new Date().toISOString());
        
        try {
            // 1. Basic connectivity and response
            await this.testConnectivity();
            
            // 2. Performance audit
            await this.auditPerformance();
            
            // 3. SEO audit
            await this.auditSEO();
            
            // 4. Accessibility audit
            await this.auditAccessibility();
            
            // 5. Security audit
            await this.auditSecurity();
            
            // 6. HTML/CSS/JS audit
            await this.auditAssets();
            
            // 7. Mobile responsiveness
            await this.auditMobile();
            
            // 8. Generate report
            await this.generateReport();
            
            console.log('✅ AUDIT COMPLETED!');
            console.log('📄 Report saved to:', REPORT_FILE);
            
        } catch (error) {
            console.error('❌ AUDIT FAILED:', error.message);
            this.results.errors.push(error.message);
        }
    }

    async testConnectivity() {
        console.log('📡 Testing connectivity...');
        
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            https.get(this.url, (res) => {
                const endTime = Date.now();
                
                this.results.performance.responseTime = endTime - startTime;
                this.results.performance.statusCode = res.statusCode;
                this.results.performance.statusMessage = res.statusMessage;
                this.results.performance.headers = res.headers;
                
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    this.htmlContent = data;
                    this.results.performance.contentLength = data.length;
                    
                    console.log(`✅ Response: ${res.statusCode} (${endTime - startTime}ms)`);
                    resolve();
                });
            }).on('error', reject);
        });
    }

    async auditPerformance() {
        console.log('⚡ Auditing performance...');
        
        // Response time analysis
        const responseTime = this.results.performance.responseTime;
        this.results.performance.grade = responseTime < 200 ? 'A' : 
                                          responseTime < 500 ? 'B' : 
                                          responseTime < 1000 ? 'C' : 'D';
        
        // Content size analysis
        const sizeKB = this.results.performance.contentLength / 1024;
        this.results.performance.sizeMB = (sizeKB / 1024).toFixed(2);
        this.results.performance.sizeGrade = sizeKB < 100 ? 'A' : 
                                            sizeKB < 500 ? 'B' : 
                                            sizeKB < 1000 ? 'C' : 'D';

        // Headers analysis
        const headers = this.results.performance.headers;
        this.results.performance.compression = headers['content-encoding'] || 'none';
        this.results.performance.caching = headers['cache-control'] || 'none';
        this.results.performance.server = headers.server || 'unknown';
    }

    async auditSEO() {
        console.log('🔍 Auditing SEO...');
        
        const html = this.htmlContent;
        
        // Title tag
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        this.results.seo.title = titleMatch ? titleMatch[1].trim() : null;
        this.results.seo.titleLength = this.results.seo.title ? this.results.seo.title.length : 0;
        
        // Meta description
        const descMatch = html.match(/<meta[^>]*name=["|']description["|'][^>]*content=["|']([^"']+)["|']/i);
        this.results.seo.description = descMatch ? descMatch[1].trim() : null;
        this.results.seo.descriptionLength = this.results.seo.description ? this.results.seo.description.length : 0;
        
        // Meta keywords
        const keywordsMatch = html.match(/<meta[^>]*name=["|']keywords["|'][^>]*content=["|']([^"']+)["|']/i);
        this.results.seo.keywords = keywordsMatch ? keywordsMatch[1].trim() : null;
        
        // Headings structure
        this.results.seo.h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
        this.results.seo.h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
        this.results.seo.h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
        
        // Images without alt text
        const imgMatches = html.match(/<img[^>]*>/gi) || [];
        this.results.seo.totalImages = imgMatches.length;
        this.results.seo.imagesWithoutAlt = imgMatches.filter(img => !img.includes('alt=')).length;
        
        // Canonical URL
        const canonicalMatch = html.match(/<link[^>]*rel=["|']canonical["|'][^>]*href=["|']([^"']+)["|']/i);
        this.results.seo.canonical = canonicalMatch ? canonicalMatch[1] : null;
        
        // Open Graph
        this.results.seo.hasOpenGraph = html.includes('property="og:');
        
        // JSON-LD structured data
        this.results.seo.hasJsonLd = html.includes('application/ld+json');
    }

    async auditAccessibility() {
        console.log('♿ Auditing accessibility...');
        
        const html = this.htmlContent;
        
        // Lang attribute
        this.results.accessibility.hasLangAttribute = html.includes('<html') && html.includes('lang=');
        
        // ARIA labels
        this.results.accessibility.ariaLabels = (html.match(/aria-label=/gi) || []).length;
        this.results.accessibility.ariaDescribedBy = (html.match(/aria-describedby=/gi) || []).length;
        
        // Form labels
        const formInputs = (html.match(/<input[^>]*>/gi) || []).length;
        const formLabels = (html.match(/<label[^>]*>/gi) || []).length;
        this.results.accessibility.formInputs = formInputs;
        this.results.accessibility.formLabels = formLabels;
        
        // Color contrast (basic check)
        this.results.accessibility.hasColorContrastCSS = html.includes('contrast') || html.includes('color:');
        
        // Skip links
        this.results.accessibility.hasSkipLinks = html.includes('skip') && html.includes('content');
        
        // Focus management
        this.results.accessibility.hasFocusManagement = html.includes('focus') || html.includes('tabindex');
    }

    async auditSecurity() {
        console.log('🔒 Auditing security...');
        
        const headers = this.results.performance.headers;
        
        // Security headers
        this.results.security.hasHTTPS = this.url.startsWith('https://');
        this.results.security.hasHSTS = !!headers['strict-transport-security'];
        this.results.security.hasCSP = !!headers['content-security-policy'];
        this.results.security.hasXFrameOptions = !!headers['x-frame-options'];
        this.results.security.hasXContentTypeOptions = !!headers['x-content-type-options'];
        
        // Mixed content
        const html = this.htmlContent;
        this.results.security.hasMixedContent = html.includes('http://') && this.url.startsWith('https://');
        
        // External scripts
        const scriptMatches = html.match(/<script[^>]*src=["|']([^"']+)["|']/gi) || [];
        this.results.security.externalScripts = scriptMatches.length;
        
        // Inline scripts
        this.results.security.inlineScripts = (html.match(/<script[^>]*>(?!.*src=)/gi) || []).length;
    }

    async auditAssets() {
        console.log('📦 Auditing assets...');
        
        const html = this.htmlContent;
        
        // CSS files
        const cssMatches = html.match(/<link[^>]*rel=["|']stylesheet["|'][^>]*href=["|']([^"']+)["|']/gi) || [];
        this.results.css.externalFiles = cssMatches.length;
        
        // JavaScript files
        const jsMatches = html.match(/<script[^>]*src=["|']([^"']+)["|']/gi) || [];
        this.results.javascript.externalFiles = jsMatches.length;
        
        // Images
        const imgMatches = html.match(/<img[^>]*src=["|']([^"']+)["|']/gi) || [];
        this.results.html.images = imgMatches.length;
        
        // HTML validation basics
        this.results.html.hasDoctype = html.toLowerCase().includes('<!doctype html>');
        this.results.html.hasMetaCharset = html.includes('charset=');
        this.results.html.hasViewport = html.includes('name="viewport"');
        
        // Check for common errors
        this.results.html.unclosedTags = this.checkUnclosedTags(html);
        this.results.html.duplicateIds = this.checkDuplicateIds(html);
    }

    checkUnclosedTags(html) {
        // Simplified check for common unclosed tags
        const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
        const tagCounts = {};
        
        // Count opening tags
        const openingTags = html.match(/<(\w+)[^>]*>/g) || [];
        openingTags.forEach(tag => {
            const tagName = tag.match(/<(\w+)/)[1].toLowerCase();
            if (!selfClosingTags.includes(tagName)) {
                tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
            }
        });
        
        // Count closing tags
        const closingTags = html.match(/<\/(\w+)>/g) || [];
        closingTags.forEach(tag => {
            const tagName = tag.match(/<\/(\w+)>/)[1].toLowerCase();
            tagCounts[tagName] = (tagCounts[tagName] || 0) - 1;
        });
        
        return Object.entries(tagCounts).filter(([tag, count]) => count !== 0).length;
    }

    checkDuplicateIds(html) {
        const idMatches = html.match(/id=["|']([^"']+)["|']/gi) || [];
        const ids = idMatches.map(match => match.match(/id=["|']([^"']+)["|']/i)[1]);
        const uniqueIds = new Set(ids);
        return ids.length - uniqueIds.size;
    }

    async auditMobile() {
        console.log('📱 Auditing mobile...');
        
        const html = this.htmlContent;
        
        // Viewport meta tag
        const viewportMatch = html.match(/<meta[^>]*name=["|']viewport["|'][^>]*content=["|']([^"']+)["|']/i);
        this.results.mobile.hasViewport = !!viewportMatch;
        this.results.mobile.viewportContent = viewportMatch ? viewportMatch[1] : null;
        
        // Responsive CSS
        this.results.mobile.hasMediaQueries = html.includes('@media') || html.includes('responsive');
        
        // Touch-friendly elements
        this.results.mobile.hasTouchCSS = html.includes('touch') || html.includes('tap');
        
        // Mobile-specific meta tags
        this.results.mobile.hasAppleMobileWebAppCapable = html.includes('apple-mobile-web-app-capable');
        this.results.mobile.hasAppleTouchIcon = html.includes('apple-touch-icon');
    }

    async generateReport() {
        console.log('📄 Generating report...');
        
        const report = this.createMarkdownReport();
        
        // Ensure docs directory exists
        if (!fs.existsSync('docs')) {
            fs.mkdirSync('docs');
        }
        
        fs.writeFileSync(REPORT_FILE, report);
    }

    createMarkdownReport() {
        const timestamp = new Date().toISOString();
        const results = this.results;
        
        return `# 🔍 COMPREHENSIVE LIVE WEBSITE AUDIT REPORT

**Website:** ${this.url}  
**Date:** ${timestamp.split('T')[0]}  
**Time:** ${timestamp.split('T')[1].split('.')[0]} GMT  

## 📊 EXECUTIVE SUMMARY

| Category | Score | Status |
|----------|-------|---------|
| Performance | ${this.calculatePerformanceScore()}/100 | ${this.getPerformanceStatus()} |
| SEO | ${this.calculateSEOScore()}/100 | ${this.getSEOStatus()} |
| Accessibility | ${this.calculateAccessibilityScore()}/100 | ${this.getAccessibilityStatus()} |
| Security | ${this.calculateSecurityScore()}/100 | ${this.getSecurityStatus()} |
| HTML Quality | ${this.calculateHTMLScore()}/100 | ${this.getHTMLStatus()} |
| Mobile | ${this.calculateMobileScore()}/100 | ${this.getMobileStatus()} |

## ⚡ PERFORMANCE AUDIT

### Response Metrics
- **Response Time:** ${results.performance.responseTime}ms (Grade: ${results.performance.grade})
- **Status Code:** ${results.performance.statusCode} ${results.performance.statusMessage}
- **Content Size:** ${results.performance.sizeMB}MB (Grade: ${results.performance.sizeGrade})
- **Server:** ${results.performance.server}

### Optimization
- **Compression:** ${results.performance.compression}
- **Caching:** ${results.performance.caching}

## 🔍 SEO AUDIT

### Meta Tags
- **Title:** ${results.seo.title || '❌ Missing'}
- **Title Length:** ${results.seo.titleLength} chars ${this.getTitleLengthStatus()}
- **Description:** ${results.seo.description || '❌ Missing'}
- **Description Length:** ${results.seo.descriptionLength} chars ${this.getDescriptionLengthStatus()}
- **Keywords:** ${results.seo.keywords || '❌ Missing'}

### Content Structure
- **H1 Tags:** ${results.seo.h1Count}
- **H2 Tags:** ${results.seo.h2Count}
- **H3 Tags:** ${results.seo.h3Count}

### Images
- **Total Images:** ${results.seo.totalImages}
- **Images without Alt:** ${results.seo.imagesWithoutAlt} ${results.seo.imagesWithoutAlt > 0 ? '⚠️' : '✅'}

### Advanced SEO
- **Canonical URL:** ${results.seo.canonical || '❌ Missing'}
- **Open Graph:** ${results.seo.hasOpenGraph ? '✅ Yes' : '❌ No'}
- **JSON-LD:** ${results.seo.hasJsonLd ? '✅ Yes' : '❌ No'}

## ♿ ACCESSIBILITY AUDIT

### Basic Requirements
- **Lang Attribute:** ${results.accessibility.hasLangAttribute ? '✅ Yes' : '❌ No'}
- **ARIA Labels:** ${results.accessibility.ariaLabels}
- **ARIA Described By:** ${results.accessibility.ariaDescribedBy}

### Forms
- **Form Inputs:** ${results.accessibility.formInputs}
- **Form Labels:** ${results.accessibility.formLabels}
- **Label Coverage:** ${this.getFormLabelCoverage()}

### Navigation
- **Skip Links:** ${results.accessibility.hasSkipLinks ? '✅ Yes' : '❌ No'}
- **Focus Management:** ${results.accessibility.hasFocusManagement ? '✅ Yes' : '❌ No'}

## 🔒 SECURITY AUDIT

### Protocol & Headers
- **HTTPS:** ${results.security.hasHTTPS ? '✅ Yes' : '❌ No'}
- **HSTS:** ${results.security.hasHSTS ? '✅ Yes' : '❌ No'}
- **CSP:** ${results.security.hasCSP ? '✅ Yes' : '❌ No'}
- **X-Frame-Options:** ${results.security.hasXFrameOptions ? '✅ Yes' : '❌ No'}
- **X-Content-Type-Options:** ${results.security.hasXContentTypeOptions ? '✅ Yes' : '❌ No'}

### Content Security
- **Mixed Content:** ${results.security.hasMixedContent ? '⚠️ Found' : '✅ None'}
- **External Scripts:** ${results.security.externalScripts}
- **Inline Scripts:** ${results.security.inlineScripts}

## 📦 ASSETS AUDIT

### Files
- **External CSS Files:** ${results.css.externalFiles}
- **External JS Files:** ${results.javascript.externalFiles}
- **Images:** ${results.html.images}

### HTML Quality
- **DOCTYPE:** ${results.html.hasDoctype ? '✅ Yes' : '❌ No'}
- **Meta Charset:** ${results.html.hasMetaCharset ? '✅ Yes' : '❌ No'}
- **Viewport:** ${results.html.hasViewport ? '✅ Yes' : '❌ No'}
- **Unclosed Tags:** ${results.html.unclosedTags} ${results.html.unclosedTags > 0 ? '⚠️' : '✅'}
- **Duplicate IDs:** ${results.html.duplicateIds} ${results.html.duplicateIds > 0 ? '⚠️' : '✅'}

## 📱 MOBILE AUDIT

### Viewport
- **Has Viewport:** ${results.mobile.hasViewport ? '✅ Yes' : '❌ No'}
- **Viewport Content:** ${results.mobile.viewportContent || 'N/A'}

### Responsive Design
- **Media Queries:** ${results.mobile.hasMediaQueries ? '✅ Yes' : '❌ No'}
- **Touch CSS:** ${results.mobile.hasTouchCSS ? '✅ Yes' : '❌ No'}

### Mobile Meta Tags
- **Apple Web App:** ${results.mobile.hasAppleMobileWebAppCapable ? '✅ Yes' : '❌ No'}
- **Apple Touch Icon:** ${results.mobile.hasAppleTouchIcon ? '✅ Yes' : '❌ No'}

## 🚨 ERRORS & WARNINGS

${results.errors.length > 0 ? results.errors.map(error => `- ❌ ${error}`).join('\\n') : '✅ No critical errors found'}

## 📋 RECOMMENDATIONS

${this.generateRecommendations()}

---

**Audit completed at:** ${timestamp}  
**Tool:** Comprehensive Live Website Auditor  
`;
    }

    calculatePerformanceScore() {
        let score = 100;
        if (this.results.performance.responseTime > 1000) score -= 30;
        else if (this.results.performance.responseTime > 500) score -= 15;
        
        if (this.results.performance.statusCode !== 200) score -= 20;
        
        const sizeMB = parseFloat(this.results.performance.sizeMB);
        if (sizeMB > 1) score -= 20;
        else if (sizeMB > 0.5) score -= 10;
        
        return Math.max(0, score);
    }

    calculateSEOScore() {
        let score = 100;
        if (!this.results.seo.title) score -= 20;
        if (!this.results.seo.description) score -= 20;
        if (this.results.seo.h1Count === 0) score -= 15;
        if (this.results.seo.imagesWithoutAlt > 0) score -= 10;
        if (!this.results.seo.canonical) score -= 10;
        if (!this.results.seo.hasOpenGraph) score -= 10;
        if (!this.results.seo.hasJsonLd) score -= 15;
        
        return Math.max(0, score);
    }

    calculateAccessibilityScore() {
        let score = 100;
        if (!this.results.accessibility.hasLangAttribute) score -= 20;
        if (this.results.accessibility.ariaLabels === 0) score -= 15;
        if (!this.results.accessibility.hasSkipLinks) score -= 15;
        if (!this.results.accessibility.hasFocusManagement) score -= 10;
        
        const formCoverage = this.getFormLabelCoveragePercent();
        if (formCoverage < 100) score -= (100 - formCoverage) * 0.4;
        
        return Math.max(0, score);
    }

    calculateSecurityScore() {
        let score = 100;
        if (!this.results.security.hasHTTPS) score -= 30;
        if (!this.results.security.hasHSTS) score -= 15;
        if (!this.results.security.hasCSP) score -= 20;
        if (!this.results.security.hasXFrameOptions) score -= 10;
        if (!this.results.security.hasXContentTypeOptions) score -= 10;
        if (this.results.security.hasMixedContent) score -= 15;
        
        return Math.max(0, score);
    }

    calculateHTMLScore() {
        let score = 100;
        if (!this.results.html.hasDoctype) score -= 20;
        if (!this.results.html.hasMetaCharset) score -= 15;
        if (!this.results.html.hasViewport) score -= 15;
        if (this.results.html.unclosedTags > 0) score -= this.results.html.unclosedTags * 10;
        if (this.results.html.duplicateIds > 0) score -= this.results.html.duplicateIds * 15;
        
        return Math.max(0, score);
    }

    calculateMobileScore() {
        let score = 100;
        if (!this.results.mobile.hasViewport) score -= 30;
        if (!this.results.mobile.hasMediaQueries) score -= 25;
        if (!this.results.mobile.hasTouchCSS) score -= 15;
        if (!this.results.mobile.hasAppleTouchIcon) score -= 15;
        if (!this.results.mobile.hasAppleMobileWebAppCapable) score -= 15;
        
        return Math.max(0, score);
    }

    getPerformanceStatus() {
        const score = this.calculatePerformanceScore();
        return score >= 90 ? '🟢 Excellent' : score >= 70 ? '🟡 Good' : score >= 50 ? '🟠 Fair' : '🔴 Poor';
    }

    getSEOStatus() {
        const score = this.calculateSEOScore();
        return score >= 90 ? '🟢 Excellent' : score >= 70 ? '🟡 Good' : score >= 50 ? '🟠 Fair' : '🔴 Poor';
    }

    getAccessibilityStatus() {
        const score = this.calculateAccessibilityScore();
        return score >= 90 ? '🟢 Excellent' : score >= 70 ? '🟡 Good' : score >= 50 ? '🟠 Fair' : '🔴 Poor';
    }

    getSecurityStatus() {
        const score = this.calculateSecurityScore();
        return score >= 90 ? '🟢 Excellent' : score >= 70 ? '🟡 Good' : score >= 50 ? '🟠 Fair' : '🔴 Poor';
    }

    getHTMLStatus() {
        const score = this.calculateHTMLScore();
        return score >= 90 ? '🟢 Excellent' : score >= 70 ? '🟡 Good' : score >= 50 ? '🟠 Fair' : '🔴 Poor';
    }

    getMobileStatus() {
        const score = this.calculateMobileScore();
        return score >= 90 ? '🟢 Excellent' : score >= 70 ? '🟡 Good' : score >= 50 ? '🟠 Fair' : '🔴 Poor';
    }

    getTitleLengthStatus() {
        const len = this.results.seo.titleLength;
        return len >= 30 && len <= 60 ? '✅' : len > 60 ? '⚠️ Too long' : '⚠️ Too short';
    }

    getDescriptionLengthStatus() {
        const len = this.results.seo.descriptionLength;
        return len >= 120 && len <= 160 ? '✅' : len > 160 ? '⚠️ Too long' : '⚠️ Too short';
    }

    getFormLabelCoverage() {
        const inputs = this.results.accessibility.formInputs;
        const labels = this.results.accessibility.formLabels;
        if (inputs === 0) return '✅ N/A';
        const coverage = Math.round((labels / inputs) * 100);
        return `${coverage}% ${coverage >= 100 ? '✅' : coverage >= 80 ? '⚠️' : '❌'}`;
    }

    getFormLabelCoveragePercent() {
        const inputs = this.results.accessibility.formInputs;
        const labels = this.results.accessibility.formLabels;
        if (inputs === 0) return 100;
        return Math.min(100, (labels / inputs) * 100);
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Performance recommendations
        if (this.results.performance.responseTime > 500) {
            recommendations.push('🚀 **Performance:** Optimize server response time (currently ' + this.results.performance.responseTime + 'ms)');
        }
        
        if (parseFloat(this.results.performance.sizeMB) > 0.5) {
            recommendations.push('📦 **Performance:** Compress content and optimize asset sizes');
        }
        
        // SEO recommendations
        if (!this.results.seo.title) {
            recommendations.push('🔍 **SEO:** Add a title tag to improve search visibility');
        }
        
        if (!this.results.seo.description) {
            recommendations.push('🔍 **SEO:** Add a meta description for better search snippets');
        }
        
        if (this.results.seo.imagesWithoutAlt > 0) {
            recommendations.push('🖼️ **SEO/Accessibility:** Add alt text to ' + this.results.seo.imagesWithoutAlt + ' images');
        }
        
        // Security recommendations
        if (!this.results.security.hasCSP) {
            recommendations.push('🔒 **Security:** Implement Content Security Policy (CSP) headers');
        }
        
        if (!this.results.security.hasHSTS) {
            recommendations.push('🔒 **Security:** Enable HTTP Strict Transport Security (HSTS)');
        }
        
        // Accessibility recommendations
        if (!this.results.accessibility.hasLangAttribute) {
            recommendations.push('♿ **Accessibility:** Add lang attribute to html tag');
        }
        
        if (!this.results.accessibility.hasSkipLinks) {
            recommendations.push('♿ **Accessibility:** Add skip navigation links');
        }
        
        // HTML recommendations
        if (this.results.html.unclosedTags > 0) {
            recommendations.push('🏗️ **HTML:** Fix ' + this.results.html.unclosedTags + ' unclosed tags');
        }
        
        if (this.results.html.duplicateIds > 0) {
            recommendations.push('🏗️ **HTML:** Fix ' + this.results.html.duplicateIds + ' duplicate ID attributes');
        }
        
        // Mobile recommendations
        if (!this.results.mobile.hasViewport) {
            recommendations.push('📱 **Mobile:** Add viewport meta tag for responsive design');
        }
        
        if (!this.results.mobile.hasMediaQueries) {
            recommendations.push('📱 **Mobile:** Implement responsive CSS with media queries');
        }
        
        return recommendations.length > 0 ? recommendations.join('\\n') : '✅ **No critical recommendations** - Website is well optimized!';
    }
}

// Run the audit
const auditor = new WebsiteAuditor(WEBSITE_URL);
auditor.runFullAudit().catch(console.error);
