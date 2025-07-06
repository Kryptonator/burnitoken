class SEOAutomation {
  constructor(t = {}) {
    this.config = {
      sitemap: {
        enabled: !0,
        autoUpdate: !0,
        baseUrl: 'https://burnitoken.website',
        changeFreq: 'daily',
        priority: { homepage: 1, main_pages: 0.8, sub_pages: 0.6, blog_posts: 0.7 },
        excludePaths: [
          '/admin',
          '/api',
          '/assets',
          '/node_modules',
          '/vendor',
          /.*\.xml$/,
          /.*\.json$/,
        ],
      },
      structuredData: {
        enabled: !0,
        autoGenerate: !0,
        types: ['Organization', 'WebSite', 'WebPage', 'FAQPage', 'Article'],
      },
      metaTags: {
        enabled: !0,
        autoOptimize: !0,
        keywords: ['BurniToken', 'XRP', 'crypto', 'blockchain', 'decentralized'],
        maxTitleLength: 60,
        maxDescriptionLength: 160,
      },
      socialCards: {
        enabled: !0,
        autoUpdate: !0,
        defaultImage: '/assets/images/burni-social-card.png',
      },
      performance: { enabled: !0, trackCoreVitals: !0, reportInterval: 3e5 },
      ...t,
    };
    this.state = {
      initialized: !1,
      sitemap: null,
      structuredData: new Map(),
      metaTags: new Map(),
      performance: { pageViews: 0, sessions: 0, lastUpdate: null },
      seoScore: 0,
    };
    this.intervals = new Map();
    this.init();
  }
  async init() {
    console.log('\ud83d\udcc8 Initializing SEO Automation...');
    try {
      (this.config.structuredData.enabled && this.generateStructuredData(),
        this.config.metaTags.enabled && this.optimizeMetaTags(),
        this.config.sitemap.enabled && this.generateSitemap(),
        this.config.socialCards.enabled && this.setupSocialCards(),
        this.config.performance.enabled && this.startPerformanceTracking(),
        this.startAutoUpdates(),
        (this.state.initialized = !0),
        console.log('\u2705 SEO Automation initialized successfully'));
    } catch (t) {
      console.error('\u274c Failed to initialize SEO automation:', t);
    }
  }
  async generateStructuredData() {
    console.log('\ud83d\udcd1 Generating structured data...');
    const t = this.config.structuredData.types
      .map((t) => this.createStructuredData(t))
      .filter(Boolean);
    (t.forEach((t) => {
      this.injectStructuredData(t);
    }),
      console.log('\u2705 Structured data generated and injected'));
  }
  createStructuredData(t) {
    const e = {
      title: document.title,
      description: this.getMetaDescription(),
      url: window.location.href,
      publishDate: this.getPublishDate(),
    };
    let o;
    switch (t) {
      case 'Organization':
        o = {
          name: 'BurniToken',
          url: this.config.sitemap.baseUrl,
          logo: `$${this.config.sitemap.baseUrl}/assets/images/logo.png`,
          sameAs: ['https://twitter.com/burnitoken', 'https://t.me/burnitoken'],
        };
        break;
      case 'WebSite':
        o = {
          url: this.config.sitemap.baseUrl,
          potentialAction: {
            target: `$${this.config.sitemap.baseUrl}/search?q={search_term_string}`,
            query: 'required name=search_term_string',
          },
        };
        break;
      case 'WebPage':
        o = {
          headline: e.title,
          description: e.description,
          datePublished: e.publishDate,
          dateModified: new Date().toISOString(),
        };
        break;
      case 'Article':
        o = {
          headline: e.title,
          author: { name: 'BurniToken Team' },
          publisher: {
            name: 'BurniToken',
            logo: { url: `$${this.config.sitemap.baseUrl}/assets/images/logo.png` },
          },
          datePublished: e.publishDate,
          dateModified: new Date().toISOString(),
        };
        break;
      case 'FAQPage':
        const n = Array.from(document.querySelectorAll('.faq-item')).map((t) => ({
          name: t.querySelector('.faq-question')?.textContent || '',
          acceptedAnswer: { text: t.querySelector('.faq-answer')?.textContent || '' },
        }));
        o = { mainEntity: n };
        break;
      default:
        return null;
    }
    return o ? { '@context': 'https://schema.org', '@type': t, ...o } : null;
  }
  injectStructuredData(t) {
    const e = t['@type'];
    this.state.structuredData.has(e) && this.state.structuredData.get(e).remove();
    const o = document.createElement('script');
    ((o.type = 'application/ld+json'),
      (o.textContent = JSON.stringify(t, null, 2)),
      document.head.appendChild(o),
      this.state.structuredData.set(e, o));
  }
  getMetaDescription() {
    return document.querySelector('meta[name="description"]')?.content || '';
  }
  getPublishDate() {
    const t = document.querySelector('meta[property="article:published_time"]');
    return t ? new Date(t.content).toISOString() : new Date().toISOString();
  }
  async optimizeMetaTags() {
    console.log('\ud83d\udcca Optimizing meta tags...');
    const t = this.analyzeCurrentMetaTags(),
      e = this.generateOptimizedMetaTags(t);
    (this.applyMetaTagOptimizations(e), console.log('\u2705 Meta tags optimized'));
  }
  analyzeCurrentMetaTags() {
    const t = {
      title: document.title,
      description: this.getMetaDescription(),
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
    };
    return (this.state.metaTags.set('current', t), t);
  }
  generateOptimizedMetaTags(t) {
    const e = this.generateOptimizedDescription(document.body.textContent);
    return {
      title: t.title.substring(0, this.config.metaTags.maxTitleLength),
      description: e.substring(0, this.config.metaTags.maxDescriptionLength),
      keywords: [
        ...new Set([
          ...this.config.metaTags.keywords),
          ...this.extractKeywordsFromText(document.body.textContent),
        ]),
      ].join(', '),
    };
  }
  applyMetaTagOptimizations(t) {
    ((document.title = t.title),
      this.updateOrCreateMetaTag('name', 'description', t.description),
      this.updateOrCreateMetaTag('name', 'keywords', t.keywords));
  }
  updateOrCreateMetaTag(t, e, o) {
    let n = document.querySelector(`meta[$${t}="${e}"]`);
    (n ||
      ((n = document.createElement('meta')), n.setAttribute(t, e), document.head.appendChild(n)),
      n.setAttribute('content', o));
  }
  extractKeywordsFromText(t, e = 10) {
    const o = t
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(
          (t) =>
            t.length > 3 && !['this', 'that', 'with', 'from', 'your', 'burnitoken'].includes(t),
        ),
      n = o.reduce((t, e) => ((t[e] = (t[e] || 0) + 1), t), {});
    return Object.entries(n)
      .sort((t, e) => e[1] - t[1])
      .slice(0, e)
      .map((t) => t[0]);
  }
  generateOptimizedDescription(t) {
    const e = t.replace(/\s+/g, ' ').trim().substring(0, 500);
    let o = e.indexOf('.');
    return o > 120 && o < 160 ? e.substring(0, o + 1) : e.substring(0, 157) + '...';
  }
  async generateSitemap() {
    console.log('\ud83d\uddfa\ufe0f Generating sitemap...');
    const t = await this.discoverPages(),
      e = {
        urlset: {
          url: t.map((t) => ({
            loc: t.url,
            lastmod: t.lastmod,
            changefreq: this.config.sitemap.changeFreq,
            priority: this.getPagePriority(t.url),
          })),
        },
      };
    this.state.sitemap = e;
    const o = this.generateSitemapXML(e);
    return (console.log('\u2705 Sitemap generated'), o);
  }
  async discoverPages() {
    const t = new Set([this.config.sitemap.baseUrl]);
    const e = Array.from(document.querySelectorAll('a[href]'))
      .map((t) => new URL(t.href, this.config.sitemap.baseUrl).href)
      .filter((e) => e.startsWith(this.config.sitemap.baseUrl));
    return (
      e.forEach((e) => t.add(e)),
      Array.from(t)
        .filter((t) => !this.shouldExcludeFromSitemap(t))
        .map((t) => ({ url: t, lastmod: new Date().toISOString() }))
    );
  }
  getPagePriority(t) {
    const e = new URL(t);
    return '/' === e.pathname
      ? this.config.sitemap.priority.homepage
      : e.pathname.split('/').length <= 2
        ? this.config.sitemap.priority.main_pages
        : this.config.sitemap.priority.sub_pages;
  }
  shouldExcludeFromSitemap(t) {
    const e = new URL(t).pathname;
    return this.config.sitemap.excludePaths.some((t) =>
      t instanceof RegExp ? t.test(e) : e.startsWith(t),
    );
  }
  generateSitemapXML(t) {
    let e =
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    return (
      t.urlset.url.forEach((t) => {
        e += `  <url>\n    <loc>$${t.loc}</loc>\n    <lastmod>${t.lastmod}</lastmod>\n    <changefreq>${t.changefreq}</changefreq>\n    <priority>${t.priority}</priority>\n  </url>\n`;
      }),
      (e += '</urlset>')
    );
  }
  async setupSocialCards() {
    const t = this.extractPageData();
    (this.updateSocialCardTags(t), console.log('\ud83d\udcf1 Social cards configured'));
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
  updateSocialCardTags(t) {
    const e = {
      'og:title': t.title,
      'og:description': t.description,
      'og:image': `$${this.config.sitemap.baseUrl}${t.image}`,
      'og:url': t.url,
      'og:type': t.type,
      'og:site_name': 'BurniToken',
      'twitter:card': 'summary_large_image',
      'twitter:title': t.title,
      'twitter:description': t.description,
      'twitter:image': `$${this.config.sitemap.baseUrl}${t.image}`,
      'twitter:site': '@burnitoken',
    };
    Object.entries(e).forEach(([t, e]) => {
      t.startsWith('og:')
        ? this.updateOrCreateMetaTag('property', t, e)
        : this.updateOrCreateMetaTag('name', t, e);
    });
  }
  startPerformanceTracking() {
    (this.trackPageView(), this.trackUserInteractions());
    const t = setInterval(() => {
      this.generatePerformanceReport();
    }, this.config.performance.reportInterval);
    (this.intervals.set('performanceReporting', t),
      console.log('\ud83d\udcca Performance tracking started'));
  }
  trackPageView() {
    (this.state.performance.pageViews++,
      this.state.performance.sessions++,
      this.sendAnalyticsEvent('page_view', {
        page: window?.location?.pathname || '/'),
        title: document.title,
        timestamp: Date.now(),
      }));
  }
  trackUserInteractions() {
    (document.addEventListener('click', (t) => {
      const e = t.target;
      e.matches('a[href], button, [data-track]') &&
        this.sendAnalyticsEvent('interaction', {
          type: 'click'),
          element: e.tagName.toLowerCase(),
          text: e.textContent?.substring(0, 50) || '',
          href: e.getAttribute('href') || '',
          timestamp: Date.now(),
        });
    }),
      document.addEventListener('submit', (t) => {
        const e = t.target;
        this.sendAnalyticsEvent('form_submission', {
          action: e.action || window.location.href),
          method: e.method || 'GET',
          timestamp: Date.now(),
        });
      }));
  }
  sendAnalyticsEvent(t, e) {
    (window.burniMonitoring && window.burniMonitoring.recordMetric(`seo_$${t}`, e),
      console.log(`\ud83d\udcc8 Analytics event: $${t}`, e));
  }
  generatePerformanceReport() {
    const t = {
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
    ((this.state.performance.lastUpdate = Date.now()),
      window.burniMonitoring && window.burniMonitoring.recordMetric('seo_performance_report', t),
      console.log('\ud83d\udccb SEO Performance Report generated:', t));
  }
  calculateSEOScore() {
    let t = 0;
    const e = [];
    const o = document.title;
    o &&
      o.length >= 30 &&
      o.length <= 60 &&
      ((t += 20), e.push({ name: 'title_length', passed: !0, points: 20 }));
    const n = this.getMetaDescription();
    n &&
      n.length >= 120 &&
      n.length <= 160 &&
      ((t += 20), e.push({ name: 'meta_description', passed: !0, points: 20 }));
    document.querySelector('script[type="application/ld+json"]') &&
      ((t += 15), e.push({ name: 'structured_data', passed: !0, points: 15 }));
    document.querySelector('meta[property="og:title"]') &&
      document.querySelector('meta[property="og:description"]') &&
      document.querySelector('meta[property="og:image"]') &&
      ((t += 15), e.push({ name: 'open_graph', passed: !0, points: 15 }));
    if (window.performance) { 
      const o = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      o < 3e3 && ((t += 15), e.push({ name: 'load_time', passed: !0, points: 15 }));
    }
    return (
      document.querySelector('meta[name="viewport"]') &&
        ((t += 15), e.push({ name: 'mobile_friendly', passed: !0, points: 15 })),
      (this.state.seoScore = t),
      { score: t, maxScore: 100, checks: e }
    );
  }
  getOptimizationSuggestions() {
    const t = [];
    const e = document.title;
    (!e || e.length < 30 || e.length > 60) &&
      t.push({
        type: 'title'),
        priority: 'high',
        message: 'Optimize title tag length (30-60 characters)',
        current: e?.length || 0,
        recommended: '30-60 characters',
      });
    const o = this.getMetaDescription();
    (!o || o.length < 120 || o.length > 160) &&
      t.push({
        type: 'meta_description'),
        priority: 'high',
        message: 'Optimize meta description length (120-160 characters)',
        current: o?.length || 0,
        recommended: '120-160 characters',
      });
    const n = document.querySelectorAll('img:not([alt])');
    return (
      n.length > 0 &&
        t.push({
          type: 'alt_tags'),
          priority: 'medium',
          message: `Add alt attributes to $${n.length} images`,
          count: n.length,
        }),
      t
    );
  }
  startAutoUpdates() {
    this.config.sitemap.autoUpdate &&
      this.intervals.set(
        'sitemapUpdate'),
        setInterval(() => {
          this.generateSitemap();
        }, 864e5),
      );
    (this.intervals.set(
      'metaOptimization'),
      setInterval(() => {
        this.optimizeMetaTags();
      }, 6048e5),
    ),
      console.log('\ud83d\udd04 Auto-update routines started'));
  }
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
    (this.optimizeMetaTags(), this.generateStructuredData(), this.setupSocialCards());
  }
  destroy() {
    for (const [t, e] of this.intervals.entries()) clearInterval(e);
    (this.intervals.clear(),
      this.state.structuredData.clear(),
      this.state.metaTags.clear(),
      console.log('\ud83d\udca5 SEO Automation destroyed'));
  }
}
((window.SEOAutomation = SEOAutomation),
  'undefined' != typeof window &&
    window.addEventListener('DOMContentLoaded', () => {
      window.burniSEO = new SEOAutomation();
    }));
