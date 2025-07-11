#!/usr/bin/env node

/**
 * BurniToken Performance Optimizer & Core Web Vitals Monitor
 *
 * Automatisierte Performance-Analyse, Optimierung und Überwachung
 * Fokus auf: LCP, FID, CLS, TTFB, Speed Index
 *
 * Autor: Technischer Visionär
 * Erstellt: 2025-07-01
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceOptimizer {
  constructor() {
    this.config = {
      targetScores: {
        performance: 95,
        accessibility: 100,
        bestPractices: 95,
        seo: 100,
        lcp: 2.5, // seconds
        fid: 100, // milliseconds
        cls: 0.1, // score
      },
      urls: [
        'https://burnitoken.website',
        'https://burnitoken.website/#about',
        'https://burnitoken.website/#tokenomics',
        'http://localhost:3000', // für lokale Tests
      ],
      outputDir: path.join(__dirname, 'performance-reports'),
      optimizationsDir: path.join(__dirname, '../optimizations'),
    };

    this.findings = {
      critical: [],
      major: [],
      minor: [],
      suggestions: [],
    };

    this.logFile = path.join(__dirname, 'performance-optimizer.log');
  }

  /**
   * Hauptanalyse-Methode
   */
  async runFullOptimization() {
    this.log('🚀 Performance-Optimierung gestartet...');

    try {
      // 1. Asset-Analyse
      await this.analyzeAssets();

      // 2. CSS-Optimierung
      await this.optimizeCSS();

      // 3. JavaScript-Optimierung
      await this.optimizeJavaScript();

      // 4. Image-Optimierung
      await this.optimizeImages();

      // 5. HTML-Optimierung
      await this.optimizeHTML();

      // 6. Caching-Strategie
      await this.optimizeCaching();

      // 7. Critical Resource Hints
      await this.optimizeResourceHints();

      // 8. Service Worker Enhancement
      await this.optimizeServiceWorker();

      // 9. Performance Budget
      await this.createPerformanceBudget();

      // 10. Monitoring Setup
      await this.setupPerformanceMonitoring();

      this.log('✅ Performance-Optimierung abgeschlossen');
      this.generateReport();
    } catch (error) {
      this.log(`❌ Fehler bei Performance-Optimierung: $${error.message}`);
    }
  }

  /**
   * Asset-Analyse für Bundle-Größen und Ladezeiten
   */
  async analyzeAssets() {
    this.log('📊 Analysiere Assets...');

    const assetDir = path.join(__dirname, '../assets');
    const analysis = {
      totalSize: 0,
      files: [],
      largeFiles: [],
      unoptimized: [],
    };

    try {
      const scanDir = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        files.forEach((file) => {
          const fullPath = path.join(dir, file.name);

          if (file.isDirectory()) { 
            scanDir(fullPath);
          } else { 
            const stats = fs.statSync(fullPath);
            const relativePath = path.relative(assetDir, fullPath);
            const ext = path.extname(file.name).toLowerCase();

            const fileInfo = {
              path: relativePath,
              size: stats.size,
              sizeKB: Math.round(stats.size / 1024),
              type: this.getFileType(ext),
              optimized: this.isOptimized(ext, file.name),
            };

            analysis.files.push(fileInfo);
            analysis.totalSize += stats.size;

            // Large Files (>100KB)
            if (stats.size > 102400) { 
              analysis.largeFiles.push(fileInfo);
              this.findings.major.push(`Large asset: $${relativePath} (${fileInfo.sizeKB}KB)`);
            }

            // Unoptimized Files
            if (!fileInfo.optimized) { 
              analysis.unoptimized.push(fileInfo);
              this.findings.minor.push(`Unoptimized: $${relativePath}`);
            }
          }
        });
      };

      if (fs.existsSync(assetDir)) { 
        scanDir(assetDir);
      }

      this.log(
        `📈 Asset-Analyse: $${analysis.files.length} Dateien, ${Math.round(analysis.totalSize / 1024)}KB total`,
      );
      this.log(
        `⚠️ $${analysis.largeFiles.length} große Dateien, ${analysis.unoptimized.length} unoptimierte Dateien`),
      );

      this.saveAnalysis('assets', analysis);
    } catch (error) {
      this.log(`❌ Asset-Analyse fehlgeschlagen: $${error.message}`);
    }
  }

  /**
   * CSS-Optimierung: Minification, Critical CSS, Unused CSS
   */
  async optimizeCSS() {
    this.log('🎨 Optimiere CSS...');

    try {
      const cssDir = path.join(__dirname, '../assets/css');
      const optimizations = [];

      if (fs.existsSync(cssDir)) { 
        const cssFiles = fs
          .readdirSync(cssDir)
          .filter((file) => file.endsWith('.css') && !file.endsWith('.min.css'));

        for (const file of cssFiles) {
          const filePath = path.join(cssDir, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // CSS-Analyse
          const analysis = this.analyzeCSSContent(content);

          // Minified Version erstellen
          const minifiedPath = path.join(cssDir, file.replace('.css', '.min.css'));
          const minified = this.minifyCSS(content);

          fs.writeFileSync(minifiedPath, minified);

          const originalSize = Buffer.byteLength(content, 'utf8');
          const minifiedSize = Buffer.byteLength(minified, 'utf8');
          const savings = Math.round((1 - minifiedSize / originalSize) * 100);

          optimizations.push({
            file: file),
            originalSize: Math.round(originalSize / 1024),
            minifiedSize: Math.round(minifiedSize / 1024),
            savings: savings,
            analysis: analysis,
          });

          this.log(`✅ CSS optimiert: $${file} (${savings}% kleiner)`);
        }
      }

      // Critical CSS extrahieren
      await this.extractCriticalCSS();

      this.saveAnalysis('css-optimization', optimizations);
    } catch (error) {
      this.log(`❌ CSS-Optimierung fehlgeschlagen: $${error.message}`);
    }
  }

  /**
   * Critical CSS extrahieren
   */
  async extractCriticalCSS() {
    this.log('🔥 Extrahiere Critical CSS...');

    const criticalCSS = `
/* Critical CSS - Above-the-fold optimiert */
:root {
  --theme-color: #f97316;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
  }
}

/* Essential Layout */
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
}

/* Navigation - Critical für LCP */
.nav-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  transition: transform 0.3s ease;
}

/* Hero Section - Critical für LCP */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--theme-color) 0%, #ea580c 100%);
}

/* Price Widget - Critical für LCP */
.price-widget {
  min-height: 60px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
}

/* Skeleton Loading - Zero CLS */
.skeleton-bar {
  background: linear-gradient(90deg),
    rgba(255, 255, 255, 0.1) 25%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Utility Classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Performance Optimizations */
* {
  box-sizing: border-box;
}

img {
  height: auto;
  max-width: 100%;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

    const criticalPath = path.join(__dirname, '../assets/css/critical.min.css');
    fs.writeFileSync(criticalPath, this.minifyCSS(criticalCSS));

    this.log('✅ Critical CSS erstellt: critical.min.css');
  }

  /**
   * JavaScript-Optimierung
   */
  async optimizeJavaScript() {
    this.log('⚡ Optimiere JavaScript...');

    try {
      const jsDir = path.join(__dirname, '../assets/js');
      const optimizations = [];

      if (fs.existsSync(jsDir)) { 
        const jsFiles = fs
          .readdirSync(jsDir)
          .filter((file) => file.endsWith('.js') && !file.endsWith('.min.js'));

        for (const file of jsFiles) {
          const filePath = path.join(jsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // JavaScript-Analyse
          const analysis = this.analyzeJSContent(content);

          // Performance-optimierte Version erstellen
          const optimized = this.optimizeJSContent(content);
          const optimizedPath = path.join(jsDir, file.replace('.js', '.optimized.js'));

          fs.writeFileSync(optimizedPath, optimized);

          const originalSize = Buffer.byteLength(content, 'utf8');
          const optimizedSize = Buffer.byteLength(optimized, 'utf8');
          const savings = Math.round((1 - optimizedSize / originalSize) * 100);

          optimizations.push({
            file: file),
            originalSize: Math.round(originalSize / 1024),
            optimizedSize: Math.round(optimizedSize / 1024),
            savings: savings,
            analysis: analysis,
          });

          this.log(`✅ JS optimiert: $${file} (${savings}% kleiner)`);
        }
      }

      this.saveAnalysis('js-optimization', optimizations);
    } catch (error) {
      this.log(`❌ JavaScript-Optimierung fehlgeschlagen: $${error.message}`);
    }
  }

  /**
   * Image-Optimierung für bessere LCP
   */
  async optimizeImages() {
    this.log('🖼️ Optimiere Images...');

    try {
      const imageDir = path.join(__dirname, '../assets/images');
      const optimizations = [];

      if (fs.existsSync(imageDir)) { 
        const imageFiles = fs
          .readdirSync(imageDir)
          .filter((file) => /\.(jpg|jpeg|png|webp|svg)$/i.test(file));

        for (const file of imageFiles) {
          const filePath = path.join(imageDir, file);
          const stats = fs.statSync(filePath);
          const ext = path.extname(file).toLowerCase();

          const optimization = {
            file: file,
            size: Math.round(stats.size / 1024),
            recommendations: [],
          };

          // WebP-Konvertierung empfehlen
          if (['.jpg', '.jpeg', '.png'].includes(ext)) { 
            const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            if (!fs.existsSync(webpPath)) { 
              optimization.recommendations.push('WebP-Version erstellen');
              this.findings.minor.push(`Missing WebP: $${file}`);
            }
          }

          // Große Bilder identifizieren
          if (stats.size > 500000) { 
            // >500KB
            optimization.recommendations.push('Größe reduzieren');
            this.findings.major.push(`Large image: $${file} (${optimization.size}KB)`);
          }

          optimizations.push(optimization);
        }
      }

      // Image-Optimierung Script erstellen
      this.createImageOptimizationScript();

      this.saveAnalysis('image-optimization', optimizations);
    } catch (error) {
      this.log(`❌ Image-Optimierung fehlgeschlagen: $${error.message}`);
    }
  }

  /**
   * HTML-Optimierung für bessere Performance
   */
  async optimizeHTML() {
    this.log('📄 Optimiere HTML...');

    try {
      const indexPath = path.join(__dirname, '../index.html');

      if (fs.existsSync(indexPath)) { 
        const content = fs.readFileSync(indexPath, 'utf8');
        const analysis = this.analyzeHTMLPerformance(content);

        const recommendations = [];

        // Resource Hints prüfen
        if (!content.includes('rel="preload"')) { 
          recommendations.push('Preload-Hints für kritische Ressourcen hinzufügen');
        }

        if (!content.includes('rel="prefetch"')) { 
          recommendations.push('Prefetch-Hints für nicht-kritische Ressourcen hinzufügen');
        }

        // Meta-Tags für Performance
        if (!content.includes('http-equiv="X-UA-Compatible"')) { 
          recommendations.push('X-UA-Compatible Meta-Tag hinzufügen');
        }

        // Service Worker
        if (!content.includes('serviceWorker')) { 
          recommendations.push('Service Worker für Caching implementieren');
        }

        this.saveAnalysis('html-optimization', {
          analysis),
          recommendations,
        });

        recommendations.forEach((rec) => {
          this.findings.suggestions.push(`HTML: $${rec}`);
        });
      }
    } catch (error) {
      this.log(`❌ HTML-Optimierung fehlgeschlagen: $${error.message}`);
    }
  }

  /**
   * Caching-Strategie optimieren
   */
  async optimizeCaching() {
    this.log('💾 Optimiere Caching-Strategie...');

    const cacheManifest = {
      version: '1.0.0',
      timestamp: Date.now(),
      strategies: {
        'critical-css': {
          pattern: '*.critical.css',
          strategy: 'CacheFirst',
          maxAge: '1 year',
        },
        'static-assets': {
          pattern: '/assets/**/*',
          strategy: 'CacheFirst',
          maxAge: '6 months',
        },
        'api-calls': {
          pattern: '/api/**/*',
          strategy: 'NetworkFirst',
          maxAge: '5 minutes',
        },
        'price-data': {
          pattern: 'api.*.com/price',
          strategy: 'StaleWhileRevalidate',
          maxAge: '1 minute',
        },
      },
    };

    const manifestPath = path.join(__dirname, '../cache-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(cacheManifest, null, 2));

    this.log('✅ Cache-Manifest erstellt');
  }

  /**
   * Resource Hints optimieren
   */
  async optimizeResourceHints() {
    this.log('🔗 Optimiere Resource Hints...');

    const resourceHints = {
      preload: [
        { href: '/assets/css/critical.min.css', as: 'style' },
        { href: '/assets/js/price-oracle.js', as: 'script' },
        { href: '/assets/images/burni-logo.webp', as: 'image' },
        { href: '/assets/fonts/main.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
      ],
      prefetch: [
        { href: '/assets/css/styles.min.css' },
        { href: '/assets/images/burni-chart.webp' },
        { href: '/assets/videos/burni-intro.mp4' },
      ],
      preconnect: [
        { href: 'https://api.coingecko.com' },
        { href: 'https://data.xrpl.org' },
        { href: 'https://fonts.googleapis.com' },
      ],
    };

    const hintsPath = path.join(__dirname, '../resource-hints.json');
    fs.writeFileSync(hintsPath, JSON.stringify(resourceHints, null, 2));

    this.log('✅ Resource Hints konfiguriert');
  }

  /**
   * Service Worker Enhancement
   */
  async optimizeServiceWorker() {
    this.log('⚙️ Optimiere Service Worker...');

    const swOptimizations = `
// Enhanced Service Worker für Performance
const CACHE_NAME = 'burnitoken-v1.0.0';
const CRITICAL_CACHE = 'burnitoken-critical-v1.0.0';

// Critical Resources - sofort cachen
const CRITICAL_URLS = [
  '/',
  '/assets/css/critical.min.css',
  '/assets/js/price-oracle.js',
  '/assets/images/burni-logo.webp'
];

// Performance-optimierte Cache-Strategien
const CACHE_STRATEGIES = {
  'critical': (request) => {
    return caches.open(CRITICAL_CACHE).then(cache => {
      return cache.match(request).then(response => {
        if (response) { 
          return response;
        }
        return fetch(request).then(fetchResponse => {
          cache.put(request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    });
  },
  
  'staleWhileRevalidate': (request) => {
    return caches.open(CACHE_NAME).then(cache => {
      return cache.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(fetchResponse => {
          cache.put(request, fetchResponse.clone());
          return fetchResponse;
        });
        return cachedResponse || fetchPromise;
      });
    });
  }
};

// Performance Monitoring
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Critical resources
  if (CRITICAL_URLS.includes(url.pathname)) { 
    event.respondWith(CACHE_STRATEGIES.critical(event.request));
    return;
  }
  
  // API calls - StaleWhileRevalidate
  if (url.pathname.includes('/api/') || url.hostname.includes('api.')) { 
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(event.request));
    return;
  }
});
`;

    const swPath = path.join(__dirname, '../sw-optimized.js');
    fs.writeFileSync(swPath, swOptimizations);

    this.log('✅ Service Worker optimiert');
  }

  /**
   * Performance Budget erstellen
   */
  async createPerformanceBudget() {
    this.log('💰 Erstelle Performance Budget...');

    const budget = {
      version: '1.0.0',
      targets: {
        'lighthouse-performance': 95,
        'lighthouse-accessibility': 100,
        'lighthouse-best-practices': 95,
        'lighthouse-seo': 100,
        'first-contentful-paint': 1500,
        'largest-contentful-paint': 2500,
        'first-input-delay': 100,
        'cumulative-layout-shift': 0.1,
        'total-blocking-time': 300,
      },
      budgets: {
        'total-size': '2MB',
        'javascript-size': '500KB',
        'css-size': '200KB',
        'image-size': '1MB',
        'font-size': '100KB',
      },
      alerts: {
        'budget-exceeded': true,
        'performance-regression': true,
        'core-web-vitals-failed': true,
      },
    };

    const budgetPath = path.join(__dirname, '../performance-budget.json');
    fs.writeFileSync(budgetPath, JSON.stringify(budget, null, 2));

    this.log('✅ Performance Budget definiert');
  }

  /**
   * Performance Monitoring Setup
   */
  async setupPerformanceMonitoring() {
    this.log('📊 Richte Performance Monitoring ein...');

    const monitoringCode = `
// Real User Monitoring (RUM) für Core Web Vitals
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }
  
  init() {
    // LCP überwachen
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.reportMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID überwachen
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.metrics.fid = entry.processingStart - entry.startTime;
        this.reportMetric('fid', this.metrics.fid);
      }
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS überwachen
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) { 
          clsValue += entry.value;
        }
      }
      this.metrics.cls = clsValue;
      this.reportMetric('cls', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  reportMetric(name, value) {
    // Performance-Daten an Monitoring-Service senden
    if ('sendBeacon' in navigator) { 
      navigator.sendBeacon('/api/performance', JSON.stringify({
        metric: name),
        value: value,
        timestamp: Date.now(),
        url: location.href
      }));
    }
  }
}

// Auto-Start
if (typeof window !== 'undefined') { 
  new PerformanceMonitor();
}
`;

    const monitorPath = path.join(__dirname, '../assets/js/performance-monitor.js');
    fs.writeFileSync(monitorPath, monitoringCode);

    this.log('✅ Performance Monitoring eingerichtet');
  }

  /**
   * Hilfsmethoden
   */
  getFileType(ext) {
    const types = {
      '.css': 'stylesheet',
      '.js': 'script',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.png': 'image',
      '.webp': 'image',
      '.svg': 'image',
      '.woff': 'font',
      '.woff2': 'font',
      '.mp4': 'video',
    };
    return types[ext] || 'other';
  }

  isOptimized(ext, filename) {
    if (filename.includes('.min.')) return true;
    if (ext === '.webp') return true;
    if (ext === '.woff2') return true;
    return false;
  }

  minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Kommentare entfernen
      .replace(/\s+/g, ' ') // Mehrfache Leerzeichen
      .replace(/;\s*}/g, '}') // Überflüssige Semikolons
      .replace(/\s*{\s*/g, '{') // Leerzeichen um Klammern
      .replace(/}\s*/g, '}')
      .replace(/;\s*/g, ';')
      .trim();
  }

  analyzeCSSContent(content) {
    return {
      size: Buffer.byteLength(content, 'utf8'),
      lines: content.split('\n').length,
      selectors: (content.match(/[^{}]+{/g) || []).length,
      mediaQueries: (content.match(/@media/g) || []).length,
      comments: (content.match(/\/\*[\s\S]*?\*\//g) || []).length,
    };
  }

  optimizeJSContent(content) {
    // Grundlegende JS-Optimierungen
    return content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Block-Kommentare
      .replace(/\/\/.*$/gm, '') // Zeilen-Kommentare
      .replace(/\s+/g, ' ') // Mehrfache Leerzeichen
      .replace(/;\s*}/g, '}') // Überflüssige Semikolons
      .trim();
  }

  analyzeJSContent(content) {
    return {
      size: Buffer.byteLength(content, 'utf8'),
      lines: content.split('\n').length,
      functions: (content.match(/function\s+\w+/g) || []).length,
      classes: (content.match(/class\s+\w+/g) || []).length,
      imports: (content.match(/import\s+/g) || []).length,
    };
  }

  analyzeHTMLPerformance(content) {
    return {
      size: Buffer.byteLength(content, 'utf8'),
      scripts: (content.match(/<script/g) || []).length,
      stylesheets: (content.match(/<link[^>]*stylesheet/g) || []).length,
      images: (content.match(/<img/g) || []).length,
      preloads: (content.match(/rel="preload"/g) || []).length,
      prefetches: (content.match(/rel="prefetch"/g) || []).length,
    };
  }

  createImageOptimizationScript() {
    const script = `#!/bin/bash
# Image Optimization Script für BurniToken
# Konvertiert alle Bilder zu WebP und optimiert Größen

echo "🖼️ Starte Image-Optimierung..."

# WebP-Konvertierung
for img in assets/images/*.jpg assets/images/*.jpeg assets/images/*.png; do
  if [ -f "$img" ]; then
    webp_file="\${img%.*}.webp"
    if [ ! -f "$webp_file" ]; then
      cwebp -q 85 "$img" -o "$webp_file"
      echo "✅ Konvertiert: $webp_file"
    fi
  fi
done

echo "✅ Image-Optimierung abgeschlossen"
`;

    const scriptPath = path.join(__dirname, 'optimize-images.sh');
    fs.writeFileSync(scriptPath, script);
    fs.chmodSync(scriptPath, '755');
  }

  /**
   * Report-Generierung
   */
  generateReport() {
    const report = {
      timestamp: Date.now(),
      findings: this.findings,
      summary: {
        critical: this.findings.critical.length,
        major: this.findings.major.length,
        minor: this.findings.minor.length,
        suggestions: this.findings.suggestions.length,
      },
      recommendations: this.generateRecommendations(),
    };

    const reportPath = path.join(this.config.outputDir, `performance-report-${Date.now()}.json`);

    if (!fs.existsSync(this.config.outputDir)) { 
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log('📊 Performance-Report generiert');
    this.printSummary(report);
  }

  generateRecommendations() {
    return [
      'Critical CSS in <head> einbinden für bessere LCP',
      'WebP-Bilder für alle kritischen Images verwenden',
      'Service Worker für aggressives Caching implementieren',
      'Resource Hints (preload, prefetch) optimieren',
      'JavaScript-Bundles code-splitten',
      'Performance Monitoring aktivieren',
      'Performance Budget in CI/CD integrieren',
    ];
  }

  printSummary(report) {
    console.log('\n' + '═'.repeat(60));
    console.log('🚀 PERFORMANCE-OPTIMIERUNG ABGESCHLOSSEN');
    console.log('═'.repeat(60));
    console.log(`📊 Findings:`);
    console.log(`   🔴 Critical: $${report.summary.critical}`);
    console.log(`   🟠 Major: $${report.summary.major}`);
    console.log(`   🟡 Minor: $${report.summary.minor}`);
    console.log(`   💡 Suggestions: $${report.summary.suggestions}`);
    console.log('\n📈 Nächste Schritte:');
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. $${rec}`);
    });
    console.log('═'.repeat(60) + '\n');
  }

  saveAnalysis(type, data) {
    const analysisPath = path.join(this.config.outputDir, `$${type}-${Date.now()}.json`);

    if (!fs.existsSync(this.config.outputDir)) { 
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    fs.writeFileSync(analysisPath, JSON.stringify(data, null, 2));
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[$${timestamp}] ${message}`;

    console.log(logEntry);

    try {
      fs.appendFileSync(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Log-Fehler:', error.message);
    }
  }
}

// CLI Interface
if (require.main === module) { 
  const command = process.argv[2];
  const optimizer = new PerformanceOptimizer();

  switch (command) {
    case 'analyze':
      optimizer.runFullOptimization();
      break;

    case 'assets':
      optimizer.analyzeAssets();
      break;

    case 'css':
      optimizer.optimizeCSS();
      break;

    case 'js':
      optimizer.optimizeJavaScript();
      break;

    case 'images':
      optimizer.optimizeImages();
      break;

    default:
      console.log('🚀 BurniToken Performance Optimizer');
      console.log('');
      console.log('Verwendung:');
      console.log('  node performance-optimizer.js analyze  - Vollständige Analyse');
      console.log('  node performance-optimizer.js assets   - Asset-Analyse');
      console.log('  node performance-optimizer.js css      - CSS-Optimierung');
      console.log('  node performance-optimizer.js js       - JavaScript-Optimierung');
      console.log('  node performance-optimizer.js images   - Image-Optimierung');
      break;
  }
}

module.exports = PerformanceOptimizer;
