
/**
 * RESPONSIVE OPTIMIZATION SCRIPT
 * Enhanced mobile experience and performance
 */

class ResponsiveManager {
    constructor() {
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            large: 1200
        };
        
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.init();
    }

    init() {
        this.setupViewportHandler();
        this.setupLazyLoading();
        this.setupTouchOptimizations();
        this.setupPerformanceMonitoring();
        this.setupAccessibilityFeatures();
        
        // Initialize on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onReady());
        } else {
            this.onReady();
        }
    }

    onReady() {
        this.optimizeImages();
        this.setupMobileNavigation();
        this.setupFormOptimizations();
        this.setupScrollOptimizations();
    }

    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width >= this.breakpoints.large) return 'large';
        if (width >= this.breakpoints.desktop) return 'desktop';
        if (width >= this.breakpoints.tablet) return 'tablet';
        return 'mobile';
    }

    setupViewportHandler() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    this.currentBreakpoint = newBreakpoint;
                    this.onBreakpointChange(newBreakpoint);
                }
            }, 150);
        });
    }

    onBreakpointChange(breakpoint) {
        document.body.className = document.body.className.replace(/bp-\w+/g, '');
        document.body.classList.add(`bp-${breakpoint}`);
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('breakpointChange', {
            detail: { breakpoint }
        }));
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            document.querySelectorAll('img[data-src], .lazy-load').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupTouchOptimizations() {
        // Enhance touch targets
        document.querySelectorAll('button, .btn, a[role="button"]').forEach(element => {
            if (!element.style.minHeight) {
                element.style.minHeight = '44px';
                element.style.minWidth = '44px';
            }
        });

        // Improve touch feedback
        let touchStartTime;
        document.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < 200) {
                e.target.classList.add('touch-feedback');
                setTimeout(() => {
                    e.target.classList.remove('touch-feedback');
                }, 150);
            }
        }, { passive: true });
    }

    setupMobileNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', 
                    navMenu.classList.contains('active'));
            });

            // Close menu on outside click
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    optimizeImages() {
        // Convert images to WebP if supported
        const supportsWebP = () => {
            const canvas = document.createElement('canvas');
            return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
        };

        if (supportsWebP()) {
            document.querySelectorAll('img').forEach(img => {
                const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                
                // Test if WebP version exists
                const testImg = new Image();
                testImg.onload = () => {
                    img.src = webpSrc;
                };
                testImg.src = webpSrc;
            });
        }
    }

    setupFormOptimizations() {
        // Enhanced form handling for mobile
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                // Add loading state
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                }
            });
        });

        // Auto-resize textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
        });
    }

    setupScrollOptimizations() {
        let scrollTimeout;
        let isScrolling = false;

        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                document.body.classList.add('scrolling');
                isScrolling = true;
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('scrolling');
                isScrolling = false;
            }, 150);
        }, { passive: true });
    }

    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            new PerformanceObserver((entryList) => {
                let cls = 0;
                entryList.getEntries().forEach(entry => {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                });
                console.log('CLS:', cls);
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }

    setupAccessibilityFeatures() {
        // Keyboard navigation enhancement
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Skip link for screen readers
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link sr-only';
            skipLink.textContent = 'Skip to main content';
            skipLink.addEventListener('focus', () => {
                skipLink.classList.remove('sr-only');
            });
            skipLink.addEventListener('blur', () => {
                skipLink.classList.add('sr-only');
            });
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
    }

    // Public API
    getBreakpoint() {
        return this.currentBreakpoint;
    }

    isMobile() {
        return this.currentBreakpoint === 'mobile';
    }

    isTablet() {
        return this.currentBreakpoint === 'tablet';
    }

    isDesktop() {
        return this.currentBreakpoint === 'desktop' || this.currentBreakpoint === 'large';
    }
}

// Initialize responsive manager
const responsiveManager = new ResponsiveManager();

// Export for use in other scripts
window.ResponsiveManager = ResponsiveManager;
window.responsiveManager = responsiveManager;

// CSS for touch feedback
const touchStyles = document.createElement('style');
touchStyles.textContent = `
.touch-feedback {
    transform: scale(0.95);
    opacity: 0.8;
    transition: all 0.1s ease;
}

.keyboard-navigation *:focus {
    outline: 2px solid #007acc !important;
    outline-offset: 2px !important;
}

.skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 0 0 4px 4px;
}

.skip-link:focus {
    top: 0;
}

.scrolling {
    pointer-events: none;
}

.scrolling * {
    pointer-events: auto;
}

.loading {
    position: relative;
    color: transparent !important;
}

.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid #ccc;
    border-radius: 50%;
    border-top-color: #007acc;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
`;
document.head.appendChild(touchStyles);
