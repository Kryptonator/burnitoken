#!/usr/bin/env node

// Quick validation script for the optimized BurniToken website
const fs = require('fs');
const path = require('path');

console.log('🔍 BurniToken Website Optimization Validation\n');

// Check if optimized files exist
const requiredFiles = [
  'index.html',
  'sw.js',
  'assets/css/styles.min.css',
  'manifest.json',
  '.lighthouserc-performance.js'
];

console.log('✅ File Existence Check:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Validate HTML structure
console.log('\n📝 HTML Structure Validation:');
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const checks = [
  {
    name: 'DOCTYPE declaration',
    test: () => htmlContent.includes('<!DOCTYPE html>'),
  },
  {
    name: 'HTML lang attribute',
    test: () => htmlContent.includes('<html lang="en">'),
  },
  {
    name: 'Meta charset',
    test: () => htmlContent.includes('<meta charset="UTF-8">'),
  },
  {
    name: 'Meta viewport',
    test: () => htmlContent.includes('name="viewport"'),
  },
  {
    name: 'Skip to content link',
    test: () => htmlContent.includes('skip-to-content'),
  },
  {
    name: 'Preload critical CSS',
    test: () => htmlContent.includes('rel="preload"') && htmlContent.includes('as="style"'),
  },
  {
    name: 'Schema.org structured data',
    test: () => htmlContent.includes('"@context": "https://schema.org"'),
  },
  {
    name: 'OpenGraph meta tags',
    test: () => htmlContent.includes('property="og:title"'),
  },
  {
    name: 'Twitter Card meta tags',
    test: () => htmlContent.includes('property="twitter:card"'),
  },
  {
    name: 'Semantic HTML5 elements',
    test: () => htmlContent.includes('<main') && htmlContent.includes('<section') && htmlContent.includes('<header'),
  },
  {
    name: 'Service Worker registration',
    test: () => htmlContent.includes('serviceWorker.register'),
  },
  {
    name: 'Accessibility attributes',
    test: () => htmlContent.includes('aria-label') && htmlContent.includes('role='),
  }
];

checks.forEach(check => {
  const passed = check.test();
  console.log(`  ${passed ? '✅' : '❌'} ${check.name}`);
});

// Check CSS for critical optimizations
console.log('\n🎨 CSS Optimization Check:');
const cssContent = fs.readFileSync(path.join(__dirname, 'assets/css/styles.min.css'), 'utf8');

const cssChecks = [
  {
    name: 'Font-display swap',
    test: () => cssContent.includes('font-display: swap'),
  },
  {
    name: 'CSS custom properties',
    test: () => cssContent.includes(':root') && cssContent.includes('--'),
  },
  {
    name: 'Screen reader only class',
    test: () => cssContent.includes('.sr-only'),
  },
  {
    name: 'Skip link styles',
    test: () => cssContent.includes('skip-to-content'),
  },
  {
    name: 'Focus indicators',
    test: () => cssContent.includes(':focus'),
  },
  {
    name: 'Prefers-reduced-motion',
    test: () => cssContent.includes('prefers-reduced-motion'),
  },
  {
    name: 'High contrast support',
    test: () => cssContent.includes('prefers-contrast'),
  },
  {
    name: 'Responsive image styles',
    test: () => cssContent.includes('responsive-image'),
  }
];

cssChecks.forEach(check => {
  const passed = check.test();
  console.log(`  ${passed ? '✅' : '❌'} ${check.name}`);
});

// Check Service Worker
console.log('\n⚙️ Service Worker Check:');
const swContent = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');

const swChecks = [
  {
    name: 'Install event handler',
    test: () => swContent.includes('addEventListener(\'install\''),
  },
  {
    name: 'Activate event handler',
    test: () => swContent.includes('addEventListener(\'activate\''),
  },
  {
    name: 'Fetch event handler',
    test: () => swContent.includes('addEventListener(\'fetch\''),
  },
  {
    name: 'Cache management',
    test: () => swContent.includes('caches.open'),
  },
  {
    name: 'Static assets caching',
    test: () => swContent.includes('STATIC_ASSETS'),
  },
  {
    name: 'Error handling',
    test: () => swContent.includes('catch('),
  }
];

swChecks.forEach(check => {
  const passed = check.test();
  console.log(`  ${passed ? '✅' : '❌'} ${check.name}`);
});

// Check Lighthouse configuration
console.log('\n🚨 Lighthouse CI Configuration:');
const lighthouseConfig = fs.readFileSync(path.join(__dirname, '.lighthouserc-performance.js'), 'utf8');

const lighthouseChecks = [
  {
    name: 'Performance threshold (95%)',
    test: () => lighthouseConfig.includes('minScore: 0.95'),
  },
  {
    name: 'Accessibility threshold',
    test: () => lighthouseConfig.includes('accessibility'),
  },
  {
    name: 'SEO configuration',
    test: () => lighthouseConfig.includes('seo'),
  },
  {
    name: 'Core Web Vitals metrics',
    test: () => lighthouseConfig.includes('largest-contentful-paint') && lighthouseConfig.includes('cumulative-layout-shift'),
  }
];

lighthouseChecks.forEach(check => {
  const passed = check.test();
  console.log(`  ${passed ? '✅' : '❌'} ${check.name}`);
});

console.log('\n📊 Summary:');
const totalChecks = checks.length + cssChecks.length + swChecks.length + lighthouseChecks.length;
const passedChecks = [
  ...checks.filter(c => c.test()),
  ...cssChecks.filter(c => c.test()),
  ...swChecks.filter(c => c.test()),
  ...lighthouseChecks.filter(c => c.test())
].length;

console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks (${Math.round((passedChecks/totalChecks)*100)}%)`);

if (passedChecks === totalChecks) {
  console.log('🎉 All optimization requirements met! Ready for production.');
} else {
  console.log('⚠️  Some checks failed. Review the items marked with ❌ above.');
}

console.log('\n🚀 Next steps:');
console.log('  1. Run: npm run lighthouse (for performance testing)');
console.log('  2. Test accessibility with screen readers');
console.log('  3. Validate with W3C HTML validator');
console.log('  4. Test on mobile devices');
console.log('  5. Deploy to production environment');