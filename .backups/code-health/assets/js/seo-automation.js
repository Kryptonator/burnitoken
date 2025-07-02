/**
 * BurniToken SEO & Content Automation System
 *
 * Automatisierung für maximale SEO-Performance:
 * - Dynamische Sitemap-Generierung
 * - Strukturierte Daten Management
 * - Social Cards Generation
 * - Meta Tags Optimization
 * - Content Performance Tracking
 * - Schema Markup Automation
 *
 * @version 1.0.0
 * @date 2025-01-23
 */

class SEOAutomation {
  constructor(config = {}) {
    this.config = {
      // Sitemap Configuration
      sitemap: {
        enabled: true,
        autoUpdate: true,
        baseUrl: 'https://burnitoken.website',
        changeFreq: 'daily',
        priority: {
          homepage: 1.0,
          main_pages: 0.8,
          sub_pages: 0.6,
          blog_posts: 0.7,
        },
        excludePaths: ['/admin', '/api', '/assets', '/*.json', '/*.xml'],
      },

      // Structured Data
      structuredData: {
        enabled: true,
        organization: {
          '@type': 'Organization',
          name: 'BurniToken',
          url: 'https://burnitoken.website',
          logo: 'https://burnitoken.website/assets/images/burni-logo.webp',
          description:
            'Die deflationäre Kryptowährung auf dem XRP Ledger mit automatischem Token-Burning.',
          foundingDate: '2024',
          sameAs: [
            'https://twitter.com/burnitoken',
            'https://discord.gg/burnitoken',
            'https://github.com/burnitoken',
          ],
        },
        website: {
          '@type': 'WebSite',
          name: 'BurniToken',
          url: 'https://burnitoken.website',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://burnitoken.website/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        },
        cryptocurrency: {
          '@type': 'Product',
          name: 'BurniToken',
          description: 'Deflationäre Kryptowährung auf dem XRP Ledger',
          category: 'Cryptocurrency',
          brand: {
            '@type': 'Brand',
            name: 'BurniToken',
          },
        },
      },

      // Social Cards
      socialCards: {
        enabled: true,
        defaultImage: '/assets/images/burni-social.webp',
        templates: {
          default: {
            width: 1200,
            height: 630,
            template: 'og_default',
          },
          twitter: {
            width: 1200,
            height: 600,
            template: 'twitter_summary_large',
          },
        },
      },

      // Meta Tags Optimization
      metaTags: {
        enabled: true,
        autoOptimize: true,
        titleTemplate: '{title} | BurniToken - XRPL Deflation Token',
        descriptionLength: { min: 120, max: 160 },
        keywordDensity: { min: 0.5, max: 2.5 },
        primaryKeywords: ['BurniToken', 'XRPL', 'Token Burning', 'Kryptowährung', 'Deflationär'],
      },

      // Performance Tracking
      performance: {
        enabled: true,
        trackMetrics: [
          'page_views',
          'bounce_rate',
          'session_duration',
          'conversion_rate',
          'search_rankings',
        ],
        reportInterval: 24 * 60 * 60 * 1000, // 24 hours
      },

      ...config,
    };

    this.state = {
      initialized: false,
      sitemap: null,
      structuredData: new Map(),
      metaTags: new Map(),
      performance: {
        pageViews: 0,
        sessions: 0,
        lastUpdate: null,
      },
      seoScore: 0,
    };

    this.intervals = new Map();
    this.init();
  }

  async init() {
    console.log('🔍 Initializing SEO Automation...');

    try {
      // Generate structured data
      if (this.config.structuredData.enabled) {
        await this.generateStructuredData();
      }

      // Optimize meta tags
      if (this.config.metaTags.enabled) {
        await this.optimizeMetaTags();
      }

      // Generate sitemap
      if (this.config.sitemap.enabled) {
        await this.generateSitemap();
      }

      // Setup social cards
      if (this.config.socialCards.enabled) {
        await this.setupSocialCards();
      }

      // Start performance tracking
      if (this.config.performance.enabled) {
        this.startPerformanceTracking();
      }

      // Auto-update routines
      this.startAutoUpdates();

      this.state.initialized = true;
      console.log('✅ SEO Automation initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SEO automation:', error);
    }
  }

  async generateStructuredData() {
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [],
    };

    // Organization data
    structuredData['@graph'].push({
      '@type': 'Organization',
      '@id': `${this.config.sitemap.baseUrl}/#organization`,
      ...this.config.structuredData.organization,
    });

    // Website data
    structuredData['@graph'].push({
      '@type': 'WebSite',
      '@id': `${this.config.sitemap.baseUrl}/#website`,
      ...this.config.structuredData.website,
      publisher: {
        '@id': `${this.config.sitemap.baseUrl}/#organization`,
      },
    });

    // Cryptocurrency product data
    structuredData['@graph'].push({
      '@type': 'Product',
      '@id': `${this.config.sitemap.baseUrl}/#product`,
      ...this.config.structuredData.cryptocurrency,
      manufacturer: {
        '@id': `${this.config.sitemap.baseUrl}/#organization`,
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: await this.getCurrentPrice(),
        availability: 'https://schema.org/InStock',
        url: this.config.sitemap.baseUrl,
      },
    });

    // WebPage data for current page
    const currentPage = {
      '@type': 'WebPage',
      '@id': `${window?.location?.href || this.config.sitemap.baseUrl}#webpage`,
      url: window?.location?.href || this.config.sitemap.baseUrl,
      name: document?.title || 'BurniToken',
      description: this.getMetaDescription(),
      isPartOf: {
        '@id': `${this.config.sitemap.baseUrl}/#website`,
      },
      about: {
        '@id': `${this.config.sitemap.baseUrl}/#organization`,
      },
      datePublished: this.getPublishDate(),
      dateModified: new Date().toISOString(),
    };

    structuredData['@graph'].push(currentPage);

    // Inject structured data
    this.injectStructuredData(structuredData);

    this.state.structuredData.set('main', structuredData);
    console.log('📋 Structured data generated');
  }

  async getCurrentPrice() {
    // Get price from price oracle if available
    if (window.burniOracle) {
      const state = window.burniOracle.getState();
      return state.price || '0.00001';
    }
    return '0.00001'; // Default price
  }

  getMetaDescription() {
    const metaDesc = document.querySelector('meta[name="description"]');
    return metaDesc?.content || this.config.structuredData.organization.description;
  }

  getPublishDate() {
    // Try to get from meta tag, otherwise use a default
    const publishDate = document.querySelector('meta[name="article:published_time"]');
    return publishDate?.content || '2024-01-01T00:00:00Z';
  }

  injectStructuredData(data) {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => {
      if (script.dataset.generated === 'seo-automation') {
        script.remove();
      }
    });

    // Inject new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.generated = 'seo-automation';
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
  }

  async optimizeMetaTags() {
    // Analyze current meta tags
    const currentTags = this.analyzeCurrentMetaTags();

    // Generate optimized tags
    const optimizedTags = this.generateOptimizedMetaTags(currentTags);

    // Apply optimizations
    this.applyMetaTagOptimizations(optimizedTags);

    console.log('🏷️ Meta tags optimized');
  }

  analyzeCurrentMetaTags() {
    const tags = {};

    // Title
    const title = document.querySelector('title');
    if (title) tags.title = title.textContent;

    // Description
    const description = document.querySelector('meta[name="description"]');
    if (description) tags.description = description.content;

    // Keywords
    const keywords = document.querySelector('meta[name="keywords"]');
    if (keywords) tags.keywords = keywords.content;

    // Open Graph
    document.querySelectorAll('meta[property^="og:"]').forEach((meta) => {
      const property = meta.getAttribute('property');
      tags[property] = meta.content;
    });

    // Twitter Cards
    document.querySelectorAll('meta[name^="twitter:"]').forEach((meta) => {
      const name = meta.getAttribute('name');
      tags[name] = meta.content;
    });

    return tags;
  }

  generateOptimizedMetaTags(currentTags) {
    const optimized = { ...currentTags };

    // Optimize title
    if (optimized.title) {
      if (!optimized.title.includes(this.config.metaTags.primaryKeywords[0])) {
        optimized.title = this.config.metaTags.titleTemplate.replace('{title}', optimized.title);
      }
    }

    // Optimize description
    if (optimized.description) {
      const desc = optimized.description;
      if (
        desc.length < this.config.metaTags.descriptionLength.min ||
        desc.length > this.config.metaTags.descriptionLength.max
      ) {
        optimized.description = this.generateOptimizedDescription(desc);
      }
    }

    // Add missing Open Graph tags
    if (!optimized['og:title']) optimized['og:title'] = optimized.title;
    if (!optimized['og:description']) optimized['og:description'] = optimized.description;
    if (!optimized['og:image'])
      optimized['og:image'] =
        `${this.config.sitemap.baseUrl}${this.config.socialCards.defaultImage}`;
    if (!optimized['og:url'])
      optimized['og:url'] = window?.location?.href || this.config.sitemap.baseUrl;
    if (!optimized['og:type']) optimized['og:type'] = 'website';

    // Add missing Twitter Card tags
    if (!optimized['twitter:card']) optimized['twitter:card'] = 'summary_large_image';
    if (!optimized['twitter:title']) optimized['twitter:title'] = optimized.title;
    if (!optimized['twitter:description']) optimized['twitter:description'] = optimized.description;
    if (!optimized['twitter:image']) optimized['twitter:image'] = optimized['og:image'];

    return optimized;
  }

  generateOptimizedDescription(currentDesc) {
    const targetLength = 155; // Optimal length
    const keywords = this.config.metaTags.primaryKeywords;

    let optimized = currentDesc;

    // Ensure primary keyword is included
    if (!optimized.toLowerCase().includes(keywords[0].toLowerCase())) {
      optimized = `${keywords[0]} - ${optimized}`;
    }

    // Trim to optimal length
    if (optimized.length > targetLength) {
      optimized = optimized.substring(0, targetLength - 3) + '...';
    }

    return optimized;
  }

  applyMetaTagOptimizations(optimizedTags) {
    Object.entries(optimizedTags).forEach(([key, value]) => {
      if (key === 'title') {
        const titleElement = document.querySelector('title');
        if (titleElement) titleElement.textContent = value;
      } else if (key.startsWith('og:')) {
        this.updateOrCreateMetaTag('property', key, value);
      } else if (key.startsWith('twitter:')) {
        this.updateOrCreateMetaTag('name', key, value);
      } else {
        this.updateOrCreateMetaTag('name', key, value);
      }
    });
  }

  updateOrCreateMetaTag(attribute, name, content) {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }

    meta.content = content;
  }

  async generateSitemap() {
    const sitemap = {
      urlset: {
        '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:schemaLocation':
          'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd',
        url: [],
      },
    };

    // Discover pages automatically
    const pages = await this.discoverPages();

    pages.forEach((page) => {
      sitemap.urlset.url.push({
        loc: page.url,
        lastmod: page.lastmod || new Date().toISOString().split('T')[0],
        changefreq: page.changefreq || this.config.sitemap.changeFreq,
        priority: page.priority || this.config.sitemap.priority.sub_pages,
      });
    });

    this.state.sitemap = sitemap;

    // Generate XML
    const sitemapXML = this.generateSitemapXML(sitemap);

    // Save or send sitemap (implementation depends on environment)
    console.log('🗺️ Sitemap generated with', pages.length, 'pages');

    return sitemapXML;
  }

  async discoverPages() {
    const pages = [
      {
        url: this.config.sitemap.baseUrl,
        priority: this.config.sitemap.priority.homepage,
        changefreq: 'daily',
      },
    ];

    // Discover from navigation links
    const navLinks = document.querySelectorAll('nav a[href]');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (
        href &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:')
      ) {
        const fullUrl = href.startsWith('http') ? href : `${this.config.sitemap.baseUrl}${href}`;

        if (!this.shouldExcludeFromSitemap(href)) {
          pages.push({
            url: fullUrl,
            priority: this.config.sitemap.priority.main_pages,
            changefreq: 'weekly',
          });
        }
      }
    });

    // Remove duplicates
    const uniquePages = pages.filter(
      (page, index, self) => index === self.findIndex((p) => p.url === page.url),
    );

    return uniquePages;
  }

  shouldExcludeFromSitemap(path) {
    return this.config.sitemap.excludePaths.some((exclude) => {
      if (exclude.includes('*')) {
        const regex = new RegExp(exclude.replace(/\*/g, '.*'));
        return regex.test(path);
      }
      return path.startsWith(exclude);
    });
  }

  generateSitemapXML(sitemap) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    sitemap.urlset.url.forEach((url) => {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  async setupSocialCards() {
    // Generate dynamic social cards based on page content
    const pageData = this.extractPageData();

    // Update social media meta tags with optimized content
    this.updateSocialCardTags(pageData);

    console.log('📱 Social cards configured');
  }

  extractPageData() {
    return {
      title: document.title,
      description: this.getMetaDescription(),
      image: this.config.socialCards.defaultImage,
      url: window?.location?.href || this.config.sitemap.baseUrl,
      type: 'website',
    };
  }

  updateSocialCardTags(pageData) {
    const socialTags = {
      // Open Graph
      'og:title': pageData.title,
      'og:description': pageData.description,
      'og:image': `${this.config.sitemap.baseUrl}${pageData.image}`,
      'og:url': pageData.url,
      'og:type': pageData.type,
      'og:site_name': 'BurniToken',

      // Twitter Cards
      'twitter:card': 'summary_large_image',
      'twitter:title': pageData.title,
      'twitter:description': pageData.description,
      'twitter:image': `${this.config.sitemap.baseUrl}${pageData.image}`,
      'twitter:site': '@burnitoken',
    };

    Object.entries(socialTags).forEach(([key, value]) => {
      if (key.startsWith('og:')) {
        this.updateOrCreateMetaTag('property', key, value);
      } else {
        this.updateOrCreateMetaTag('name', key, value);
      }
    });
  }

  startPerformanceTracking() {
    // Track page views
    this.trackPageView();

    // Track user interactions
    this.trackUserInteractions();

    // Performance reporting interval
    const reportingInterval = setInterval(() => {
      this.generatePerformanceReport();
    }, this.config.performance.reportInterval);

    this.intervals.set('performanceReporting', reportingInterval);

    console.log('📊 Performance tracking started');
  }

  trackPageView() {
    this.state.performance.pageViews++;
    this.state.performance.sessions++;

    // Send to analytics (implementation depends on analytics provider)
    this.sendAnalyticsEvent('page_view', {
      page: window?.location?.pathname || '/',
      title: document.title,
      timestamp: Date.now(),
    });
  }

  trackUserInteractions() {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target;

      if (target.matches('a[href], button, [data-track]')) {
        this.sendAnalyticsEvent('interaction', {
          type: 'click',
          element: target.tagName.toLowerCase(),
          text: target.textContent?.substring(0, 50) || '',
          href: target.getAttribute('href') || '',
          timestamp: Date.now(),
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      this.sendAnalyticsEvent('form_submission', {
        action: form.action || window.location.href,
        method: form.method || 'GET',
        timestamp: Date.now(),
      });
    });
  }

  sendAnalyticsEvent(eventName, data) {
    // Send to monitoring system
    if (window.burniMonitoring) {
      window.burniMonitoring.recordMetric(`seo_${eventName}`, data);
    }

    // Log for debugging
    console.log(`📈 Analytics event: ${eventName}`, data);
  }

  generatePerformanceReport() {
    const report = {
      period: {
        start:
          this.state.performance.lastUpdate || Date.now() - this.config.performance.reportInterval,
        end: Date.now(),
      },
      metrics: {
        pageViews: this.state.performance.pageViews,
        sessions: this.state.performance.sessions,
        seoScore: this.calculateSEOScore(),
      },
      optimizations: this.getOptimizationSuggestions(),
      timestamp: Date.now(),
    };

    this.state.performance.lastUpdate = Date.now();

    // Send report to monitoring
    if (window.burniMonitoring) {
      window.burniMonitoring.recordMetric('seo_performance_report', report);
    }

    console.log('📋 SEO Performance Report generated:', report);
  }

  calculateSEOScore() {
    let score = 0;
    const checks = [];

    // Title tag check
    const title = document.title;
    if (title && title.length >= 30 && title.length <= 60) {
      score += 20;
      checks.push({ name: 'title_length', passed: true, points: 20 });
    }

    // Meta description check
    const description = this.getMetaDescription();
    if (description && description.length >= 120 && description.length <= 160) {
      score += 20;
      checks.push({ name: 'meta_description', passed: true, points: 20 });
    }

    // Structured data check
    const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (structuredDataScript) {
      score += 15;
      checks.push({ name: 'structured_data', passed: true, points: 15 });
    }

    // Open Graph check
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogTitle && ogDescription && ogImage) {
      score += 15;
      checks.push({ name: 'open_graph', passed: true, points: 15 });
    }

    // Performance check (simplified)
    if (window.performance) {
      const loadTime =
        window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      if (loadTime < 3000) {
        // Less than 3 seconds
        score += 15;
        checks.push({ name: 'load_time', passed: true, points: 15 });
      }
    }

    // Mobile-friendly check
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      score += 15;
      checks.push({ name: 'mobile_friendly', passed: true, points: 15 });
    }

    this.state.seoScore = score;
    return { score, maxScore: 100, checks };
  }

  getOptimizationSuggestions() {
    const suggestions = [];

    // Check title optimization
    const title = document.title;
    if (!title || title.length < 30 || title.length > 60) {
      suggestions.push({
        type: 'title',
        priority: 'high',
        message: 'Optimize title tag length (30-60 characters)',
        current: title?.length || 0,
        recommended: '30-60 characters',
      });
    }

    // Check meta description
    const description = this.getMetaDescription();
    if (!description || description.length < 120 || description.length > 160) {
      suggestions.push({
        type: 'meta_description',
        priority: 'high',
        message: 'Optimize meta description length (120-160 characters)',
        current: description?.length || 0,
        recommended: '120-160 characters',
      });
    }

    // Check for missing alt tags
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      suggestions.push({
        type: 'alt_tags',
        priority: 'medium',
        message: `Add alt attributes to ${imagesWithoutAlt.length} images`,
        count: imagesWithoutAlt.length,
      });
    }

    return suggestions;
  }

  startAutoUpdates() {
    // Auto-update sitemap daily
    if (this.config.sitemap.autoUpdate) {
      const sitemapInterval = setInterval(
        () => {
          this.generateSitemap();
        },
        24 * 60 * 60 * 1000,
      ); // Daily

      this.intervals.set('sitemapUpdate', sitemapInterval);
    }

    // Auto-optimize meta tags weekly
    const metaOptimizationInterval = setInterval(
      () => {
        this.optimizeMetaTags();
      },
      7 * 24 * 60 * 60 * 1000,
    ); // Weekly

    this.intervals.set('metaOptimization', metaOptimizationInterval);

    console.log('🔄 Auto-update routines started');
  }

  // Public API
  getSEOReport() {
    return {
      score: this.calculateSEOScore(),
      structuredData: Object.fromEntries(this.state.structuredData),
      sitemap: this.state.sitemap,
      performance: this.state.performance,
      optimizations: this.getOptimizationSuggestions(),
      timestamp: Date.now(),
    };
  }

  async refreshSitemap() {
    return await this.generateSitemap();
  }

  async refreshStructuredData() {
    return await this.generateStructuredData();
  }

  optimizeCurrentPage() {
    this.optimizeMetaTags();
    this.generateStructuredData();
    this.setupSocialCards();
  }

  destroy() {
    // Clear all intervals
    for (const [name, intervalId] of this.intervals.entries()) {
      clearInterval(intervalId);
    }
    this.intervals.clear();

    // Clean up state
    this.state.structuredData.clear();
    this.state.metaTags.clear();

    console.log('💥 SEO Automation destroyed');
  }
}

// Make it available globally
window.SEOAutomation = SEOAutomation;

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.burniSEO = new SEOAutomation();
  });
}
