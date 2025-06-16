// Cross-Browser Compatibility Check Script
const fs = require('fs');
const path = require('path');

class CrossBrowserChecker {
    constructor() {
        this.issues = [];
        this.checks = 0;
        this.passed = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    }

    addIssue(issue) {
        this.issues.push(issue);
        this.log(`ISSUE: ${issue}`, 'warn');
    }

    checkFile(filePath, checks) {
        if (!fs.existsSync(filePath)) {
            this.addIssue(`Missing file: ${filePath}`);
            return;
        }

        const content = fs.readFileSync(filePath, 'utf8');

        checks.forEach((check) => {
            this.checks++;
            if (check.test(content)) {
                this.passed++;
                this.log(`✓ ${check.description}`, 'pass');
            } else {
                this.addIssue(`${filePath}: ${check.description}`);
            }
        });
    }

    async runFullCheck() {
        this.log('Starting Cross-Browser Compatibility Check...', 'info');

        // CSS Compatibility Checks
        this.checkFile('assets/css/styles.min.css', [
            {
                description: 'Uses vendor prefixes for transforms',
                test: (content) => content.includes('-webkit-transform') || content.includes('transform:'),
            },
            {
                description: 'Uses vendor prefixes for transitions',
                test: (content) =>
                    content.includes('-webkit-transition') || content.includes('transition:'),
            },
            {
                description: 'Contains flexbox fallbacks',
                test: (content) =>
                    content.includes('display:flex') || content.includes('display:-webkit-flex'),
            },
        ]);

        // HTML Compatibility Checks
        this.checkFile('index.html', [
            {
                description: 'Has proper DOCTYPE declaration',
                test: (content) =>
                    content.startsWith('<!doctype html>') || content.startsWith('<!DOCTYPE html>'),
            },
            {
                description: 'Contains viewport meta tag',
                test: (content) => content.includes('name="viewport"'),
            },
            {
                description: 'Has Content Security Policy',
                test: (content) => content.includes('Content-Security-Policy'),
            },
            {
                description: 'Contains fallback fonts',
                test: (content) => content.includes('font-family') && content.includes('sans-serif'),
            },
            {
                description: 'Has proper semantic HTML structure',
                test: (content) =>
                    content.includes('<main') &&
                    (content.includes('<section') || content.includes('<article>')),
            },
        ]);

        // JavaScript Compatibility Checks
        this.checkFile('main.js', [
            {
                description: 'Uses modern event listeners',
                test: (content) => content.includes('addEventListener'),
            },
            {
                description: 'Has proper error handling',
                test: (content) => content.includes('try') && content.includes('catch'),
            },
            {
                description: 'Uses feature detection',
                test: (content) => content.includes('typeof') && content.includes('function'),
            },
            {
                description: 'Has fallback for modern features',
                test: (content) => content.includes('if (') && content.includes('else'),
            },
        ]);

        // Browser-specific CSS checks
        this.checkFile('assets/css/browser-compatibility.css', [
            {
                description: 'Contains Safari-specific fixes',
                test: (content) => content.includes('@supports (-webkit-appearance:'),
            },
            {
                description: 'Contains Firefox-specific fixes',
                test: (content) => content.includes('@-moz-document'),
            },
            {
                description: 'Contains Edge/IE compatibility',
                test: (content) => content.includes('@supports not') || content.includes('-ms-'),
            },
        ]);

        // Performance optimization checks
        this.checkFile('assets/css/performance-optimization.css', [
            {
                description: 'Uses hardware acceleration',
                test: (content) =>
                    content.includes('transform: translateZ(0)') || content.includes('will-change'),
            },
            {
                description: 'Optimizes animations',
                test: (content) => content.includes('@keyframes') && content.includes('cubic-bezier'),
            },
            {
                description: 'Contains mobile optimizations',
                test: (content) => content.includes('@media') && content.includes('max-width'),
            },
        ]);

        // Service Worker checks
        this.checkFile('sw.js', [
            {
                description: 'Has proper cache versioning',
                test: (content) => content.includes('CACHE_NAME') && content.includes('v'),
            },
            {
                description: 'Handles offline scenarios',
                test: (content) => content.includes('fetch') && content.includes('cache'),
            },
            {
                description: 'Updates cache properly',
                test: (content) => content.includes('activate') && content.includes('delete'),
            },
        ]);

        // Check for critical files
        const criticalFiles = [
            'assets/css/styles.min.css',
            'assets/css/browser-compatibility.css',
            'assets/css/performance-optimization.css',
            'assets/css/proportion-optimization.css',
            'assets/scripts.min.js',
            'manifest.json',
            'sw.js',
        ];

        criticalFiles.forEach((file) => {
            this.checks++;
            if (fs.existsSync(file)) {
                this.passed++;
                this.log(`✓ Critical file exists: ${file}`, 'pass');
            } else {
                this.addIssue(`Missing critical file: ${file}`);
            }
        });

        this.generateReport();
    }

    generateReport() {
        this.log('\n=== CROSS-BROWSER COMPATIBILITY REPORT ===', 'info');
        this.log(`Total Checks: ${this.checks}`, 'info');
        this.log(`Passed: ${this.passed}`, 'info');
        this.log(`Failed: ${this.checks - this.passed}`, 'info');
        this.log(`Success Rate: ${((this.passed / this.checks) * 100).toFixed(2)}%`, 'info');

        if (this.issues.length === 0) {
            this.log('\n🎉 ALL CHECKS PASSED! Website is browser-compatible.', 'pass');
        } else {
            this.log('\n⚠️  ISSUES FOUND:', 'warn');
            this.issues.forEach((issue, index) => {
                this.log(`${index + 1}. ${issue}`, 'warn');
            });
        }

        // Write detailed report
        const report = {
            timestamp: new Date().toISOString(),
            totalChecks: this.checks,
            passed: this.passed,
            failed: this.checks - this.passed,
            successRate: ((this.passed / this.checks) * 100).toFixed(2),
            issues: this.issues,
        };

        fs.writeFileSync('cross-browser-report.json', JSON.stringify(report, null, 2));
        this.log('\nDetailed report saved to: cross-browser-report.json', 'info');
    }
}

// Run the check
if (require.main === module) {
    const checker = new CrossBrowserChecker();
    checker.runFullCheck().catch((error) => {
        console.error('Error during cross-browser check:', error);
        process.exit(1);
    });
}

module.exports = CrossBrowserChecker;
