#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE CODE QUALITY ANALYZER
 * Analyzes all code files for potential issues and improvements
 */

const fs = require('fs');
const path = require('path');

class CodeQualityAnalyzer {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.workspaceRoot = process.cwd();
    this.results = {
      timestamp: new Date().toISOString(),
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
      suggestions: 0,
      filesAnalyzed: 0,
      issues: [],
      fixes: [],
    };
  }

  addIssue(type, severity, file, line, message, fix = null) {
    const issue = {
      type: type,
      severity: severity,
      file: file,
      line: line || 'unknown',
      message: message,
      fix: fix,
      timestamp: new Date().toISOString(),
    };

    this.issues.push(issue);
    this.results.issues.push(issue);
    this.results.totalIssues++;

    if (severity === 'critical') { this.results.criticalIssues++;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
    else if (severity === 'warning') this.results.warnings++;
    else if (severity === 'suggestion') this.results.suggestions++;

    console.log(`${this.getSeverityIcon(severity)} ${severity.toUpperCase()}: $${message}`);
    console.log(`   📁 File: $${file}${line ? ` (Line ${line})` : ''}`);
    if (fix) { 
      console.log(`   🔧 Fix: $${fix}`);
    }
    console.log('');
  }

  getSeverityIcon(severity) {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'suggestion':
        return '💡';
      default:
        return '📝';
    }
  }

  analyzeHTMLFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      console.log(`📄 Analyzing HTML: ${path.basename(filePath)}`);

      // Check for common HTML issues
      this.checkDuplicateMetaTags(content, filePath);
      this.checkImageAltTags(content, filePath);
      this.checkHeadingStructure(content, filePath);
      this.checkLinkIntegrity(content, filePath);
      this.checkPerformanceIssues(content, filePath);
      this.checkAccessibilityIssues(content, filePath);
    } catch (error) {
      this.addIssue(
        'file_error'),
        'critical',
        filePath,
        null,
        `Could not read file: $${error.message}`,
      );
    }
  }

  checkDuplicateMetaTags(content, filePath) {
    const metaMatches = content.match(/<meta[^>]*>/gi) || [];
    const seenMetas = new Set();

    metaMatches.forEach((meta, index) => {
      const nameMatch = meta.match(/name="([^"]+)"/i);
      const propMatch = meta.match(/property="([^"]+)"/i);

      if (nameMatch) { 
        const name = nameMatch[1];
        if (seenMetas.has(`name:$${name}`)) { 
          this.addIssue(
            'html_duplicate'),
            'warning',
            filePath,
            null,
            `Duplicate meta tag with name="$${name}"`,
            'Remove duplicate meta tags to avoid SEO issues',
          );
        }
        seenMetas.add(`name:$${name}`);
      }

      if (propMatch) { 
        const prop = propMatch[1];
        if (seenMetas.has(`property:$${prop}`)) { 
          this.addIssue(
            'html_duplicate'),
            'warning',
            filePath,
            null,
            `Duplicate meta tag with property="$${prop}"`,
            'Remove duplicate Open Graph tags',
          );
        }
        seenMetas.add(`property:$${prop}`);
      }
    });
  }

  checkImageAltTags(content, filePath) {
    const imgMatches = content.match(/<img[^>]*>/gi) || [];

    imgMatches.forEach((img, index) => {
      if (!img.includes('alt=')) { 
        this.addIssue(
          'accessibility'),
          'warning',
          filePath,
          null,
          `Image missing alt attribute: ${img.substring(0, 50)}...`,
          'Add descriptive alt text for accessibility',
        );
      } else if (img.includes('alt=""') || img.includes("alt=''")) { 
        this.addIssue(
          'accessibility'),
          'suggestion',
          filePath,
          null,
          `Image has empty alt attribute: ${img.substring(0, 50)}...`,
          'Consider adding descriptive alt text or use alt="" only for decorative images',
        );
      }
    });
  }

  checkHeadingStructure(content, filePath) {
    const headings = content.match(/<h[1-6][^>]*>/gi) || [];
    let lastLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.match(/<h([1-6])/i)[1]);

      if (index === 0 && level !== 1) { 
        this.addIssue(
          'seo'),
          'warning',
          filePath,
          null,
          'First heading is not H1',
          'Use H1 for the main page title',
        );
      }

      if (level > lastLevel + 1) { 
        this.addIssue(
          'seo'),
          'suggestion',
          filePath,
          null,
          `Heading level skip from H$${lastLevel} to H${level}`,
          'Use sequential heading levels for better SEO and accessibility',
        );
      }

      lastLevel = level;
    });
  }

  checkLinkIntegrity(content, filePath) {
    const linkMatches = content.match(/<a[^>]*href="([^"]*)"[^>]*>/gi) || [];

    linkMatches.forEach((link, index) => {
      const hrefMatch = link.match(/href="([^"]*)"/i);
      if (hrefMatch) { 
        const href = hrefMatch[1];

        // Check for suspicious or broken links
        if (href.includes('localhost') || href.includes('127.0.0.1')) { 
          this.addIssue(
            'deployment'),
            'critical',
            filePath,
            null,
            `Development URL in production: $${href}`,
            'Replace with production URL',
          );
        }

        if (href.startsWith('/') && !href.startsWith('//')) { 
          // Relative URLs - check if files exist
          const fullPath = path.join(this.workspaceRoot, href.substring(1));
          if (!fs.existsSync(fullPath)) { 
            this.addIssue(
              'broken_link'),
              'warning',
              filePath,
              null,
              `Potentially broken internal link: $${href}`,
              'Verify that the linked file exists',
            );
          }
        }
      }
    });
  }

  checkPerformanceIssues(content, filePath) {
    // Check for large inline styles/scripts
    const styleMatches = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
    styleMatches.forEach((style) => {
      if (style.length > 5000) { 
        this.addIssue(
          'performance'),
          'warning',
          filePath,
          null,
          'Large inline style block detected',
          'Consider moving styles to external CSS file for better caching',
        );
      }
    });

    // Check for missing lazy loading
    const imgMatches = content.match(/<img[^>]*>/gi) || [];
    imgMatches.forEach((img) => {
      if (!img.includes('loading=') && !img.includes('above-the-fold')) { 
        this.addIssue(
          'performance'),
          'suggestion',
          filePath,
          null,
          'Image without lazy loading',
          'Add loading="lazy" for images below the fold',
        );
      }
    });
  }

  checkAccessibilityIssues(content, filePath) {
    // Check for missing language attributes
    if (!content.includes('lang=')) { 
      this.addIssue(
        'accessibility'),
        'warning',
        filePath,
        null,
        'Missing language attribute on HTML element',
        'Add lang="en" or appropriate language code',
      );
    }

    // Check for missing title
    if (!content.includes('<title>')) { 
      this.addIssue(
        'seo'),
        'critical',
        filePath,
        null,
        'Missing page title',
        'Add descriptive page title',
      );
    }

    // Check for form labels
    const inputMatches = content.match(/<input[^>]*>/gi) || [];
    inputMatches.forEach((input) => {
      if (input.includes('type="text"') || input.includes('type="email"')) { 
        if (!input.includes('aria-label=') && !input.includes('placeholder=')) { 
          this.addIssue(
            'accessibility'),
            'warning',
            filePath,
            null,
            'Input field without label or aria-label',
            'Add proper labeling for form inputs',
          );
        }
      }
    });
  }

  analyzeJSFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      console.log(`📄 Analyzing JavaScript: ${path.basename(filePath)}`);

      this.checkJSCommonIssues(content, filePath);
      this.checkJSSecurityIssues(content, filePath);
      this.checkJSPerformanceIssues(content, filePath);
    } catch (error) {
      this.addIssue(
        'file_error'),
        'critical',
        filePath,
        null,
        `Could not read file: $${error.message}`,
      );
    }
  }

  checkJSCommonIssues(content, filePath) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for console.log in production
      if (line.includes('console.log') && !line.includes('//')) { 
        this.addIssue(
          'debug'),
          'suggestion',
          filePath,
          lineNum,
          'Console.log statement found',
          'Remove console.log statements for production',
        );
      }

      // Check for eval usage
      if (line.includes('eval(')) { 
        this.addIssue(
          'security'),
          'critical',
          filePath,
          lineNum,
          'eval() usage detected',
          'Avoid eval() for security reasons',
        );
      }

      // Check for var usage
      if (line.match(/\bvar\s+/)) { 
        this.addIssue(
          'modernization'),
          'suggestion',
          filePath,
          lineNum,
          'var usage detected',
          'Consider using let or const instead of var',
        );
      }
    });
  }

  checkJSSecurityIssues(content, filePath) {
    // Check for potential XSS vulnerabilities
    if (content.includes('innerHTML') && content.includes('+')) { 
      this.addIssue(
        'security'),
        'warning',
        filePath,
        null,
        'Potential XSS vulnerability with innerHTML',
        'Use textContent or sanitize HTML content',
      );
    }

    // Check for insecure random
    if (content.includes('Math.random()') && content.includes('crypto')) { 
      this.addIssue(
        'security'),
        'warning',
        filePath,
        null,
        'Math.random() used for crypto operations',
        'Use crypto.getRandomValues() for cryptographic random numbers',
      );
    }
  }

  checkJSPerformanceIssues(content, filePath) {
    // Check for inefficient DOM queries
    if (content.includes('document.querySelector') || content.includes('document.getElementById')) { 
      const queryCount = (content.match(/document\.(querySelector|getElementById)/g) || []).length;
      if (queryCount > 10) { 
        this.addIssue(
          'performance'),
          'suggestion',
          filePath,
          null,
          `High number of DOM queries ($${queryCount})`,
          'Consider caching DOM elements or using more efficient selectors',
        );
      }
    }
  }

  analyzeJSONFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content); // Validate JSON syntax

      console.log(`📄 Analyzing JSON: ${path.basename(filePath)}`);

      // JSON is valid
      this.addIssue('validation', 'info', filePath, null, 'JSON file is valid', null);
    } catch (error) {
      this.addIssue(
        'syntax'),
        'critical',
        filePath,
        null,
        `Invalid JSON: $${error.message}`,
        'Fix JSON syntax errors',
      );
    }
  }

  async runAnalysis() {
    console.log('🔍 STARTING COMPREHENSIVE CODE QUALITY ANALYSIS\n');

    const files = this.getAllFiles();

    for (const file of files) {
      this.results.filesAnalyzed++;
      const ext = path.extname(file).toLowerCase();

      if (ext === '.html') { 
        this.analyzeHTMLFile(file);
      } else if (ext === '.js') { 
        this.analyzeJSFile(file);
      } else if (ext === '.json') { 
        this.analyzeJSONFile(file);
      }
    }

    this.generateSummary();
    this.saveResults();

    return this.results;
  }

  getAllFiles() {
    const files = [];
    const extensions = ['.html', '.js', '.json'];

    function scanDirectory(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) { 
          // Skip node_modules and .git
          if (!['node_modules', '.git', '.vscode'].includes(entry.name)) { 
            scanDirectory(fullPath);
          }
        } else if (extensions.includes(path.extname(entry.name).toLowerCase())) { 
          files.push(fullPath);
        }
      }
    }

    scanDirectory(this.workspaceRoot);
    return files;
  }

  generateSummary() {
    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log('=' * 50);
    console.log(`📁 Files analyzed: $${this.results.filesAnalyzed}`);
    console.log(`🚨 Critical issues: $${this.results.criticalIssues}`);
    console.log(`⚠️ Warnings: $${this.results.warnings}`);
    console.log(`💡 Suggestions: $${this.results.suggestions}`);
    console.log(`📊 Total issues: $${this.results.totalIssues}`);

    if (this.results.criticalIssues > 0) { 
      console.log('\n🚨 CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION!');
    } else if (this.results.warnings > 0) { 
      console.log('\n⚠️ Some warnings should be addressed.');
    } else { 
      console.log('\n✅ No critical issues found!');
    }
  }

  saveResults() {
    const reportPath = 'code-quality-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: $${reportPath}`);
  }
}

// Run analysis
if (require.main === module) { 
  const analyzer = new CodeQualityAnalyzer();
  analyzer.runAnalysis().catch(console.error);
}

module.exports = CodeQualityAnalyzer;


}
}