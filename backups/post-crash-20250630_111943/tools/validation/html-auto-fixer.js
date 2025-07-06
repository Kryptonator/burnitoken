#!/usr/bin/env node

/**
 * 🔧 AUTOMATIC HTML FIXER
 * Fixes common HTML issues like duplicate attributes and encoding problems
 */

const fs = require('fs');

class HTMLFixer {
  constructor(filePath) {
    this.filePath = filePath;
    this.fixes = [];
    this.content = fs.readFileSync(filePath, 'utf8');
    this.originalContent = this.content;
  }

  fixDuplicateLoadingAttributes() {
    console.log('🔧 Fixing duplicate loading attributes...');

    // Find all img tags with multiple loading attributes
    const imgRegex = /<img[^>]*>/gi;
    let fixCount = 0;

    this.content = this.content.replace(imgRegex, (match) => {
      const loadingMatches = match.match(/loading="[^"]*"/gi);
      if (loadingMatches && loadingMatches.length > 1) {
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  // Keep only the first loading attribute;
}
        let fixed = match;
        for (let i = 1; i < loadingMatches.length; i++) {
          fixed = fixed.replace(loadingMatches[i], '');
        }
        // Clean up extra spaces
        fixed = fixed.replace(/\s+/g, ' ').replace(/\s>/g, '>');
        fixCount++;
        return fixed;
      }
      return match;
    });

    this.fixes.push(`Fixed ${fixCount} duplicate loading attributes`);
    console.log(`✅ Fixed ${fixCount} duplicate loading attributes`);
  }

  fixUncodedAmpersands() {
    console.log('🔧 Fixing uncoded ampersands...');

    let fixCount = 0;

    // Fix & in text content (not in HTML entities or attributes)
    this.content = this.content.replace(
      /(?<!&[a-zA-Z]{1,10});([^&]*?)&(?![a-zA-Z]{1,10};)/g,
      (match, p1) => {
        if (!match.includes('&amp;') && !match.includes('&lt;') && !match.includes('&gt;')) {
          fixCount++;
          return match.replace('&', '&amp;');
        }
        return match;
      },
    );

    // More specific fix for text content
    this.content = this.content.replace(
      />\s*([^<]*?)\s*&\s*([^<]*?)\s*</g,
      (match, before, after) => {
        if (!before.includes('&amp;') && !after.includes(';')) {
          fixCount++;
          return match.replace('&', '&amp;');
        }
        return match;
      },
    );

    this.fixes.push(`Fixed ${fixCount} uncoded ampersands`);
    console.log(`✅ Fixed ${fixCount} uncoded ampersands`);
  }

  fixHreflangLinks() {
    console.log('🔧 Fixing non-existent hreflang links...');

    // Since we only have a single-page website, remove language-specific hreflang links
    const hreflangPattern =
      /<link rel="alternate" hreflang="(?!x-default)[^"]*" href="[^"]*\/(?:en|de|es|fr|ar|bn|ja|pt|ko|ru|tr|zh|hi|it)" >/g;

    const beforeCount = (this.content.match(hreflangPattern) || []).length;
    this.content = this.content.replace(hreflangPattern, '');

    // Fix the x-default to point to the main domain
    this.content = this.content.replace(
      /<link rel="alternate" hreflang="x-default" href="https:\/\/www\.burnitoken\.website" >/,
      '<link rel="alternate" hreflang="x-default" href="https://burnitoken.website" >',
    );

    this.fixes.push(`Removed ${beforeCount} non-existent language hreflang links`);
    console.log(`✅ Removed ${beforeCount} non-existent language hreflang links`);
  }

  validateAndCleanup() {
    console.log('🔧 Final validation and cleanup...');

    // Remove empty lines in head section
    this.content = this.content.replace(/(<head[^>]*>[\s\S]*?)<\/head>/gi, (match) => {
      return match.replace(/\n\s*\n/g, '\n');
    });

    // Ensure proper spacing
    this.content = this.content.replace(/>\s*</g, '>\n    <');

    this.fixes.push('Performed final cleanup and validation');
    console.log('✅ Final cleanup completed');
  }

  applyFixes() {
    console.log('🔧 STARTING AUTOMATIC HTML FIXES\n');

    this.fixDuplicateLoadingAttributes();
    this.fixUncodedAmpersands();
    this.fixHreflangLinks();
    this.validateAndCleanup();

    return this.content !== this.originalContent;
  }

  saveFile() {
    if (this.content !== this.originalContent) {
      // Create backup
      fs.writeFileSync(this.filePath + '.backup-before-fixes', this.originalContent);

      // Save fixed content
      fs.writeFileSync(this.filePath, this.content);

      console.log('\n📊 FIXES APPLIED:');
      this.fixes.forEach((fix) => console.log(`✅ ${fix}`));
      console.log(`\n💾 File saved: ${this.filePath}`);
      console.log(`📋 Backup created: ${this.filePath}.backup-before-fixes`);

      return true;
    } else {
      console.log('\n✅ No fixes needed - file is already clean!');
      return false;
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      file: this.filePath,
      fixes: this.fixes,
      hasChanges: this.content !== this.originalContent,
      originalSize: this.originalContent.length,
      newSize: this.content.length,
    };

    fs.writeFileSync('html-fixes-report.json', JSON.stringify(report, null, 2));
    console.log('\n📋 Report saved: html-fixes-report.json');

    return report;
  }
}

// Fix the main HTML file
const fixer = new HTMLFixer('index.html');
const hasChanges = fixer.applyFixes();

if (hasChanges) {
  fixer.saveFile();
}

const report = fixer.generateReport();

module.exports = HTMLFixer;
