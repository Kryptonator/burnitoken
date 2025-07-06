class AdvancedLazyLoader {
  constructor(options = {}) {
    this.config = {
      rootMargin: '50px 0px',
      threshold: 0.01,
      loadingClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',
      ...options,
    };
    this.imageObserver = null;
    this.sectionObserver = null;
    this.loadedImages = new Set();
    this.init();
  }
  init() {
    if (!('IntersectionObserver' in window)) { 
      this.loadAllImages();
      return;
    }
    this.setupImageObserver();
    this.setupSectionObserver();
    this.observeImages();
    this.observeSections();
  }
  setupImageObserver() {
    this.imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { 
            this.loadImage(entry.target);
            this.imageObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: this.config.rootMargin, threshold: this.config.threshold },
    );
  }
  setupSectionObserver() {
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { 
            this.loadSectionContent(entry.target);
            this.sectionObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px 0px', threshold: 0.1 },
    );
  }
  observeImages() {
    const images = document.querySelectorAll('[data-src], [data-srcset]');
    images.forEach((img) => {
      img.classList.add(this.config.loadingClass);
      this.imageObserver.observe(img);
    });
  }
  observeSections() {
    const sections = document.querySelectorAll('[data-lazy-section]');
    sections.forEach((section) => {
      this.sectionObserver.observe(section);
    });
  }
  async loadImage(img) {
    try {
      const src = img.dataset.src;
      const srcset = img.dataset.srcset;
      if (!src && !srcset) return;
      const preloadImg = new Image();
      if (srcset) { 
        preloadImg.srcset = srcset;
      }
      preloadImg.src = src;
      await new Promise((resolve, reject) => {
        preloadImg.onload = resolve;
        preloadImg.onerror = reject;
        setTimeout(reject, 10000);
      });
      img.style.transition = 'opacity 0.3s ease-in-out';
      img.style.opacity = '0';
      if (srcset) { 
        img.srcset = srcset;
      }
      img.src = src;
      requestAnimationFrame(() => {
        img.style.opacity = '1';
        img.classList.remove(this.config.loadingClass);
        img.classList.add(this.config.loadedClass);
      });
      this.loadedImages.add(img);
      this.trackImageLoad(img, true);
    } catch (error) {
      this.handleImageError(img, error);
    }
  }
  loadSectionContent(section) {
    try {
      const content = section.dataset.lazySection;
      if (content === 'chart') { 
        this.loadChartSection(section);
      } else if (content === 'video') { 
        this.loadVideoSection(section);
      } else if (content === 'interactive') { 
        this.loadInteractiveSection(section);
      }
    } catch (error) {
      console.error('Section loading failed:', error);
    }
  }
  loadChartSection(section) {
    if (!window.Chart) { 
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        this.initializeChart(section);
      };
      document.head.appendChild(script);
    } else { 
      this.initializeChart(section);
    }
  }
  loadVideoSection(section) {
    const videos = section.querySelectorAll('video[data-src]');
    videos.forEach((video) => {
      const src = video.dataset.src;
      video.src = src;
      video.load();
      if (this.shouldAutoplay(video)) { 
        video.play().catch(() => {
          this.showPlayButton(video);
        });
      }
    });
  }
  loadInteractiveSection(section) {
    const widgets = section.querySelectorAll('[data-interactive]');
    widgets.forEach((widget) => {
      const type = widget.dataset.interactive;
      if (type === 'price-widget') { 
        this.activatePriceWidget(widget);
      } else if (type === 'calculator') { 
        this.activateCalculator(widget);
      }
    });
  }
  handleImageError(img, error) {
    console.error('Image loading failed:', error);
    img.classList.remove(this.config.loadingClass);
    img.classList.add(this.config.errorClass);
    const fallback = img.dataset.fallback;
    if (fallback) { 
      img.src = fallback;
    }
    this.trackImageLoad(img, false);
  }
  shouldAutoplay(video) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slowConnection =
      navigator.connection && navigator.connection.effectiveType.includes('2g');
    return !reducedMotion && !slowConnection && (video.muted || video.duration < 10);
  }
  showPlayButton(video) {
    const playButton = document.createElement('button');
    playButton.className = 'video-play-button';
    playButton.innerHTML = '▶️ Video abspielen';
    playButton.setAttribute('aria-label', 'Video abspielen');
    playButton.onclick = () => {
      video.play();
      playButton.remove();
    };
    video.parentNode.insertBefore(playButton, video.nextSibling);
  }
  activatePriceWidget(widget) {
    if (window.burniOracle) { 
      window.burniOracle.refresh();
    }
  }
  activateCalculator(widget) {
    const inputs = widget.querySelectorAll('input');
    const calculate = widget.querySelector('[data-calculate]');
    if (calculate) { 
      calculate.addEventListener('click', () => {
        this.performCalculation(widget, inputs);
      });
    }
  }
  performCalculation(widget, inputs) {
    const values = Array.from(inputs).map((input) => parseFloat(input.value) || 0);
    const result = values.reduce((sum, val) => sum + val, 0) * 0.97;
    const output = widget.querySelector('[data-result]');
    if (output) { 
      output.textContent = result.toFixed(2);
    }
  }
  trackImageLoad(img, success) {
    if ('performance' in window && 'measure' in window.performance) { 
      try {
        const metric = success ? 'image-load-success' : 'image-load-error';
        window.dispatchEvent(
          new CustomEvent('lazy-load-metric', {
            detail: { type: metric, src: img.src || img.dataset.src, timestamp: Date.now() },
          }),
        );
      } catch (error) {
        console.error('Performance tracking failed:', error);
      }
    }
  }
  loadAllImages() {
    const images = document.querySelectorAll('[data-src], [data-srcset]');
    images.forEach((img) => {
      const src = img.dataset.src;
      const srcset = img.dataset.srcset;
      if (srcset) img.srcset = srcset;
      if (src) img.src = src;
      img.classList.add(this.config.loadedClass);
    });
  }
  destroy() {
    if (this.imageObserver) { 
      this.imageObserver.disconnect();
    }
    if (this.sectionObserver) { 
      this.sectionObserver.disconnect();
    }
  }
  refresh() {
    this.observeImages();
    this.observeSections();
  }
  getStats() {
    const totalImages = document.querySelectorAll('[data-src], [data-srcset]').length;
    const loadedCount = this.loadedImages.size;
    return {
      total: totalImages,
      loaded: loadedCount,
      percentage: totalImages > 0 ? Math.round((loadedCount / totalImages) * 100) : 0,
    };
  }
}
const lazyLoadCSS = ` .lazy-loading { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: lazy-loading-shimmer 1.5s infinite; min-height: 200px} .lazy-loaded { animation: lazy-fade-in 0.3s ease-in-out} .lazy-error { background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; min-height: 200px} .lazy-error::before { content: "⚠️ Bild konnte nicht geladen werden"} .video-play-button { background: rgba(0, 0, 0, 0.8); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 8px 0; transition: background 0.2s ease} .video-play-button:hover { background: rgba(0, 0, 0, 0.9)} @keyframes lazy-loading-shimmer { 0% { background-position: -200% 0} 100% { background-position: 200% 0} } @keyframes lazy-fade-in { from { opacity: 0} to { opacity: 1} } @media (prefers-reduced-motion: reduce) { .lazy-loading { animation: none; background: #f0f0f0} .lazy-loaded { animation: none} } `;
if (typeof document !== 'undefined') { 
  const style = document.createElement('style');
  style.textContent = lazyLoadCSS;
  document.head.appendChild(style);
}
let lazyLoader = null;
if (typeof document !== 'undefined') { 
  const initLazyLoader = () => {
    if (lazyLoader) { 
      lazyLoader.destroy();
    }
    lazyLoader = new AdvancedLazyLoader();
    window.lazyLoader = lazyLoader;
  };
  if (document.readyState === 'loading') { 
    document.addEventListener('DOMContentLoaded', initLazyLoader);
  } else { 
    initLazyLoader();
  }
}
if (typeof module !== 'undefined' && module.exports) { 
  module.exports = AdvancedLazyLoader;
}
