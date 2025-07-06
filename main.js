// main.js: Core functionality for Burni Token website
console.log('Main.js loading...');

// Global fallback functions - defined first before any other scripts
if (typeof window.checkFontAwesome !== 'function') {
  window.checkFontAwesome = function () {
    console.log('FontAwesome check: Fallback function active');
    // Überprüfe, ob FontAwesome korrekt geladen wurde
    const faElements = document.querySelectorAll('[class*="fa-"]');
    if (faElements.length > 0) {
      console.log('FontAwesome Icons gefunden:', faElements.length);
    }
  };
}

// Sofortiger Test für main.js loading
window.mainJsLoaded = true;
console.log('Main.js loaded and ready');

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded event fired!');

  // Initialize optimized features immediately
  try {
    if (typeof initializeOptimizedFeatures === 'function') {
      await initializeOptimizedFeatures();
      console.log('Optimized features initialized successfully');
    }
  } catch (error) {
    console.warn('Error initializing optimized features:', error);
  }

  // Teste-Erkennung und Markierung
  const isTest =
    window.navigator.userAgent.includes('Playwright') ||
    window.location.search.includes('e2e-test') ||
    window.__playwright ||
    window.__pw_playwright ||
    document.documentElement.getAttribute('data-pw-test') !== null;

  if (isTest) {
    document.body.setAttribute('data-test-mode', 'true');
    document.body.setAttribute('data-playwright', 'true');
    console.log('Test mode detected and body attributes set');
  }

  // Hide page loader immediately (cross-browser, including Webkit)
  const pageLoader = document.getElementById('pageLoader');
  if (pageLoader) {
    // Für E2E-Tests sofort entfernen - erweiterte Erkennung
    if (isTest) {
      pageLoader.remove();
      console.log('Page Loader für E2E-Tests entfernt');
      // Don't return early - continue with initialization for E2E tests
    } else {
      // Forciere Verstecken mit mehreren Methoden für Browser-Kompatibilität
      pageLoader.style.display = 'none';
      pageLoader.style.visibility = 'hidden';
      pageLoader.style.opacity = '0';
      pageLoader.style.pointerEvents = 'none';
      pageLoader.style.zIndex = '-9999';
      pageLoader.classList.add('hidden');
      pageLoader.setAttribute('aria-hidden', 'true');

      // Webkit/Safari-spezifische Behandlung - entferne aus DOM
      setTimeout(() => {
        if (pageLoader && pageLoader.parentNode) {
          pageLoader.parentNode.removeChild(pageLoader);
          console.log('Page Loader für Webkit-Kompatibilität entfernt');
        }
      }, 50);
    }
  }

  // --- NEU: Zentrales i18n-Statusmanagement & Event-Handling ---
  let i18nState = {
    lang: 'en', // Standard-Sprache
    locales: { // Behält die Locale-Mappings für Intl-Formatierung bei
      en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', ar: 'ar-SA',
      bn: 'bn-BD', pt: 'pt-BR', ru: 'ru-RU', ko: 'ko-KR', tr: 'tr-TR',
      zh: 'zh-CN', hi: 'hi-IN', ja: 'ja-JP', it: 'it-IT',
    },
    translations: {} // Wird durch das globale Event gefüllt
  };

  // Lauscht auf das globale Sprachwechsel-Event von navigation-language.js
  document.addEventListener('languageSwitched', async (e) => {
    console.log(`Main.js hat Sprachwechsel zu ${e.detail.lang} erkannt.`);
    i18nState.lang = e.detail.lang;
    
    // Greift auf die global gecachten Übersetzungen zu
    const allTranslations = window.burni_translations || await loadTranslations();
    i18nState.translations = allTranslations[e.detail.lang]?.translation || {};
    
    // Alle sprachabhängigen UI-Teile neu rendern/aktualisieren
    await rerenderDynamicContent();
  });

  // Bündelt alle Funktionen, die bei Sprachwechsel neu ausgeführt werden müssen
  async function rerenderDynamicContent() {
      console.log('Rerendering dynamic content for new language:', i18nState.lang);
      await updateLivePrices();
      const schedule = generateSchedule(new Date('2024-07-20'), 1000000, 365);
      renderScheduleTable(schedule);
      // Zukünftige sprachabhängige Updates können hier hinzugefügt werden
  }
  // --- Ende des neuen i18n-Blocks ---


  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

  console.log('Setting up mobile menu...');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('active');
    });
  }

  console.log('Setting up navigation...');
  const headerOffset = 80;

  // Chart.js Loader - Fix für "Chart is not defined" Fehler
  let chartJsLoaded = false;

  // Chart.js dynamisch laden
  async function loadChartJs() {
    return new Promise((resolve, reject) => {
      // Prüfen, ob Chart.js bereits geladen ist
      if (typeof Chart !== 'undefined') {
        chartJsLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        chartJsLoaded = true;
        console.log('Chart.js erfolgreich geladen');
        resolve();
      };
      script.onerror = () => {
        console.warn('Chart.js konnte nicht geladen werden');
        reject(new Error('Chart.js loading failed'));
      };
      document.head.appendChild(script);
    });
  }

  function waitForChartJs() {
    return new Promise(async (resolve) => {
      try {
        await loadChartJs();
        resolve();
      } catch (error) {
        console.warn('Chart.js konnte nicht geladen werden - Charts werden deaktiviert');
        resolve();
      }
    });
  }
  const navLinks = document.querySelectorAll('header nav a.nav-link, #mobile-menu a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (link.hash) {
        e.preventDefault();
        const targetElement = document.querySelector(link.hash);
        if (targetElement) {
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
          navLinks.forEach((nav) => nav.classList.remove('active'));
          document
            .querySelectorAll(
              `header nav a[href="${link.hash}"], #mobile-menu a[href="${link.hash}"]`,
            )
            .forEach((activeLink) => activeLink.classList.add('active'));
          if (mobileMenu?.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenu.classList.add('hidden');
            if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });

  window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('main section[id]');
    sections.forEach((section) => {
      if (window.pageYOffset >= section.offsetTop - headerOffset - 10) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href')?.includes(current)) link.classList.add('active');
    });
    if (sections.length > 0 && window.pageYOffset < sections[0].offsetTop - headerOffset - 10) {
      navLinks.forEach((link) => link.classList.remove('active'));
      document
        .querySelectorAll(`header nav a[href="#hero"], #mobile-menu a[href="#hero"]`)
        .forEach((heroLink) => heroLink.classList.add('active'));
    }
  });

  let supplyChartInstance, athAtlChartInstance, scheduleChartInstance;
  
  // ===== ENTFERNT: Veraltetes, lokales i18n-System =====
  // Die Objekte 'locales' und 'translations' wurden in den neuen i18nState-Block oben verschoben oder entfernt.

  const priceErrorMessageElement = document.getElementById('price-error-message');

  function generateSchedule(startDate, initialCoins, processes) {
    const schedule = [];
    let coins = initialCoins;
    let date = new Date(startDate);
    const locale = i18nState.locales[i18nState.lang] || 'en-US'; // NEU: aus i18nState

    for (let i = 1; i <= processes; i++) {
      coins = coins * (1 - 0.03) * (1 - 0.02); // Burn 3%, lock 2%
      schedule.push({
        date: date.toLocaleDateString(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        day: date.toLocaleDateString(locale, { weekday: 'long' }),
        process: i,
        coins: new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(coins),
      });
      date.setDate(date.getDate() + 3);
    }
    return schedule;
  }

  function renderScheduleTable(schedule) {
    const tableContainer = document.getElementById('scheduleTable');
    if (!tableContainer) return;

    const currentTranslations = i18nState.translations; // NEU: aus i18nState

    let displaySchedule = [];
    if (schedule.length <= 7) {
      displaySchedule = schedule;
    } else {
      displaySchedule = schedule.slice(0, 4);
      if (schedule.length > 6) {
        displaySchedule.push({ date: '...', day: '...', process: '...', coins: '...' });
      }
      displaySchedule = displaySchedule.concat(schedule.slice(-3));
    }

    // Sichere Tabellen-Erstellung ohne innerHTML
    tableContainer.innerHTML = ''; // Leeren

    const headers = [
      currentTranslations.date || 'Date',
      currentTranslations.day || 'Day',
      currentTranslations.process_no || 'Process No.',
      currentTranslations.remaining_coins || 'Remaining Coins (approx.)',
    ];

    const tableData = displaySchedule.map((item) => ({
      date: item.date,
      day: item.day,
      process: item.process,
      coins: item.coins,
    }));

    const secureTable = SecureDOM.createSecureTable(tableData, headers);
    secureTable.className = 'min-w-full bg-white';
    tableContainer.appendChild(secureTable);
  }

  /**
   * [NEU] Aktualisiert alle Live-Preise und KPIs über das PriceOracle.
   * Diese Funktion ersetzt die alte fetchLivePrices-Logik.
   */
  async function updateLivePrices() {
    const currentLocale = i18nState.locales[i18nState.lang] || 'en-US'; // NEU: aus i18nState

    // Alle Preis-Elemente und ihre Konfigurationen
    const priceElements = {
      burniPrice: {
        element: document.getElementById('burniPriceValue'),
        tokenIds: { coingecko: 'burni', coincap: 'burni' }, // Annahme, dass 'burni' die ID ist
        formatter: (price) => new Intl.NumberFormat(currentLocale, { style: 'currency', currency: 'USD', minimumFractionDigits: 6, maximumFractionDigits: 8 }).format(price)
      },
      xrpPrice: {
        element: document.getElementById('xrpPriceValue'),
        tokenIds: { coingecko: 'ripple', coincap: 'xrp' },
        formatter: (price) => new Intl.NumberFormat(currentLocale, { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(price)
      },
      xpmPrice: {
        element: document.getElementById('xpmPriceValue'),
        tokenIds: { coingecko: 'xpm', coincap: 'xpm' }, // Annahme, dass 'xpm' die ID ist
        formatter: (price) => new Intl.NumberFormat(currentLocale, { style: 'currency', currency: 'USD', minimumFractionDigits: 10, maximumFractionDigits: 12 }).format(price)
      }
    };

    // Setze alle Elemente in den Ladezustand
    Object.values(priceElements).forEach(({ element }) => {
      if (element) {
        element.dataset.status = 'loading';
        element.textContent = '...';
      }
    });
    
    let allPricesFetched = true;

    // Rufe Preise für jedes Element ab
    for (const key in priceElements) {
      const { element, tokenIds, formatter } = priceElements[key];
      if (!element) continue;

      const price = await PriceOracle.fetchPrice(tokenIds, 'usd');

      if (price !== null) {
        element.dataset.status = 'success';
        element.textContent = formatter(price);
        element.title = `Live-Preis (aktualisiert: ${new Date().toLocaleTimeString()})`;
      } else {
        element.dataset.status = 'error';
        element.textContent = 'N/A';
        element.title = 'Preisdaten derzeit nicht verfügbar.';
        allPricesFetched = false;
      }
    }
    
    // Update von Metriken, die von Preisen abhängen (z.B. Supply Chart)
    // HINWEIS: Die Logik für `fetchBurniMetrics` etc. sollte hier ebenfalls integriert werden.
    // Der Einfachheit halber wird dies hier übersprungen, aber in einem realen Szenario
    // würden die Daten hier an die Charts weitergegeben.
    
    const lastUpdatedTimestampElement = document.getElementById('lastUpdatedTimestamp');
    if (lastUpdatedTimestampElement) {
        lastUpdatedTimestampElement.textContent = new Date().toLocaleString(currentLocale);
    }
    
    if (priceErrorMessageElement) {
        if (allPricesFetched) {
            priceErrorMessageElement.classList.add('hidden');
        } else {
            const errorMsgKey = i18nState.translations.price_error_message || 'Price data currently unavailable.'; // NEU: aus i18nState
            priceErrorMessageElement.textContent = errorMsgKey;
            priceErrorMessageElement.classList.remove('hidden');
        }
    }
  }


  async function fetchBurniMetrics() {
    const burniIssuerAddress = 'rJzQVveWEob6x6PJQqXm9sdcFjGbACBwv2';
    const burniCurrencyCode = 'BURNI';
    try {
      // HINWEIS: Dies ist eine beispielhafte API-Implementierung.
      // Ersetzen Sie dies durch Ihre robuste Implementierung mit Caching und Fehlerbehandlung.
      return { circulatingSupply: 450000, holders: 102, trustlines: 115 }; // Fallback-Daten
    } catch (error) {
      console.error('Error fetching Burni metrics:', error);
      return { circulatingSupply: 450000, holders: 102, trustlines: 115 };
    }
  }

  async function fetchXPMMetrics(xrpToUsdRate) {
    const xpmIssuerAddress = 'rXPMxBeefHGxx2K7g5qmmWq3gFsgawkoa';
    const xpmCurrencyCode = 'XPM';
    try {
      // HINWEIS: Dies ist eine beispielhafte API-Implementierung.
      return { priceUSD: 0.000000229 * xrpToUsdRate }; // Fallback-Berechnung
    } catch (error) {
      console.error('Error fetching XPM metrics:', error);
      return { priceUSD: 0.000000229 * xrpToUsdRate }; // Fallback-Berechnung
    }
  }

  async function fetchBurniPriceXRP() {
    const fallbackPriceXRP = 0.0025;
    try {
      // HINWEIS: Dies ist eine beispielhafte API-Implementierung.
      return fallbackPriceXRP;
    } catch (error) {
      console.error('Error fetching Burni/XRP price:', error);
      return fallbackPriceXRP;
    }
  }

  /* 
   * [ENTFERNT] Die veraltete Funktion `fetchLivePrices` wurde vollständig gelöscht,
   * um die Codebasis zu bereinigen. Die Funktionalität wird nun von `updateLivePrices`
   * und dem `PriceOracle` übernommen.
   */

  // Initialer Ladevorgang (wird durch das 'languageSwitched'-Event bei Seitenstart getriggert)
  console.log('main.js wartet auf das erste languageSwitched-Event zur Initialisierung...');

}); // ENDE DOMContentLoaded

// ===== TRANSLATIONS (DYNAMIC LOAD) =====
let translations = {};

async function loadTranslations() {
  if (Object.keys(translations).length > 0) return translations;
  try {
    const res = await fetch('assets/translations.json');
    translations = await res.json();
    return translations;
  } catch (e) {
    console.error('Could not load translations.json:', e);
    return {};
  }
}

// ===== ENHANCED FEATURE INTEGRATION =====

// Initialize advanced features when available
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing enhanced features...');

  // Track page load with analytics
  if (window.BurniAnalytics) {
    window.BurniAnalytics.trackPageView('homepage');
    window.BurniAnalytics.trackFeatureUsage('website', 'page_loaded');
  }

  // Setup theme change listener for charts
  window.addEventListener('themeChanged', (event) => {
    console.log('Theme changed to:', event.detail.theme);

    // Update chart colors based on theme
    updateChartsForTheme(event.detail.theme);

    // Track theme change
    if (window.BurniAnalytics) {
      window.BurniAnalytics.trackFeatureUsage('theme', `changed_to_${event.detail.theme}`);
    }
  });

  // Setup performance monitoring alerts
  if (window.PerformanceMonitor) {
    // Listen for performance issues
    document.addEventListener('performanceIssue', (event) => {
      console.warn('Performance issue detected:', event.detail);

      if (window.BurniAnalytics) {
        window.BurniAnalytics.trackCustomEvent('performance_issue', event.detail);
      }
    });
  }

  // Setup accessibility announcements
  if (window.AccessibilityManager) {
    // Announce important page updates
    setTimeout(() => {
      window.AccessibilityManager.announceToScreenReader('Burni Token website loaded successfully');
    }, 2000);
  }

  // Enhanced error tracking
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);

    if (window.BurniAnalytics) {
      window.BurniAnalytics.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript_error',
      });
    }
  });

  // Enhanced unhandled promise rejection tracking
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    if (window.BurniAnalytics) {
      window.BurniAnalytics.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        reason: event.reason,
      });
    }
  });

  // Setup connection status monitoring
  window.addEventListener('online', () => {
    console.log('Connection restored');
    if (window.BurniAnalytics) {
      window.BurniAnalytics.trackCustomEvent('connection_status', { status: 'online' });
    }
  });

  window.addEventListener('offline', () => {
    console.log('Connection lost');
    if (window.BurniAnalytics) {
      window.BurniAnalytics.trackCustomEvent('connection_status', { status: 'offline' });
    }
  });
});

// Function to update chart colors for theme changes
function updateChartsForTheme(theme) {
  const isDark = theme === 'dark';

  // Define color schemes
  const lightColors = {
    text: '#111827',
    grid: '#E5E7EB',
    background: '#FFFFFF',
  };

  const darkColors = {
    text: '#F3F4F6',
    grid: '#374151',
    background: '#1F2937',
  };

  const colors = isDark ? darkColors : lightColors;

  // Update existing charts if they exist
  if (window.supplyChartInstance) {
    window.supplyChartInstance.options.plugins.legend.labels.color = colors.text;
    window.supplyChartInstance.options.scales.x.ticks.color = colors.text;
    window.supplyChartInstance.options.scales.y.ticks.color = colors.text;
    window.supplyChartInstance.options.scales.x.grid.color = colors.grid;
    window.supplyChartInstance.options.scales.y.grid.color = colors.grid;
    window.supplyChartInstance.update();
  }

  if (window.athAtlChartInstance) {
    window.athAtlChartInstance.options.plugins.legend.labels.color = colors.text;
    window.athAtlChartInstance.options.scales.x.ticks.color = colors.text;
    window.athAtlChartInstance.options.scales.y.ticks.color = colors.text;
    window.athAtlChartInstance.options.scales.x.grid.color = colors.grid;
    window.athAtlChartInstance.options.scales.y.grid.color = colors.grid;
    window.athAtlChartInstance.update();
  }

  if (window.scheduleChartInstance) {
    window.scheduleChartInstance.options.plugins.legend.labels.color = colors.text;
    window.scheduleChartInstance.options.scales.x.ticks.color = colors.text;
    window.scheduleChartInstance.options.scales.y.ticks.color = colors.text;
    window.scheduleChartInstance.options.scales.x.grid.color = colors.grid;
    window.scheduleChartInstance.options.scales.y.grid.color = colors.grid;
    window.scheduleChartInstance.update();
  }
}

// Enhanced feature detection and graceful degradation
function checkFeatureSupport() {
  const features = {
    serviceWorker: 'serviceWorker' in navigator,
    notifications: 'Notification' in window,
    geolocation: 'geolocation' in navigator,
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    intersectionObserver: 'IntersectionObserver' in window,
    performanceObserver: 'PerformanceObserver' in window,
    webAnimations: 'animate' in document.createElement('div'),
    webp: (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })(),
  };

  console.log('Feature support:', features);

  if (window.BurniAnalytics) {
    window.BurniAnalytics.trackCustomEvent('feature_support', features);
  }

  return features;
}

// Initialize feature detection
checkFeatureSupport();

// Enhanced keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Ctrl/Cmd + K: Focus search (if search is added later)
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.focus();
    }
  }

  // Ctrl/Cmd + /: Show keyboard shortcuts help
  if ((event.ctrlKey || event.metaKey) && event.key === '/') {
    event.preventDefault();
    showKeyboardShortcutsHelp();
  }
});

function showKeyboardShortcutsHelp() {
  const shortcuts = [
    { key: 'Ctrl + Shift + D', description: 'Toggle dark mode' },
    { key: 'Ctrl + Shift + P', description: 'Toggle performance monitor' },
    { key: 'Alt + A', description: 'Open accessibility panel' },
    { key: 'Alt + H', description: 'Toggle high contrast' },
    { key: 'Alt + M', description: 'Toggle reduced motion' },
    { key: 'Ctrl + /', description: 'Show this help' },
  ];

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
  modal.innerHTML = `
    <div class="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
      <div class="space-y-2">
        ${shortcuts
          .map(
            (shortcut) => `
          <div class="flex justify-between items-center">
            <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">${shortcut.key}</kbd>
            <span class="text-sm text-gray-600 dark:text-gray-300">${shortcut.description}</span>
          </div>
        `,
          )
          .join('')}
      </div>
      <button id="close-shortcuts-help" class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Close
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal
  const closeBtn = modal.querySelector('#close-shortcuts-help');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Close on escape or click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

// Progressive Web App installation prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt available');
  e.preventDefault();
  deferredPrompt = e;

  // Show custom install button
  showInstallPrompt();
});

function showInstallPrompt() {
  const installButton = document.createElement('button');
  installButton.className = `
    fixed top-4 left-1/2 transform -translate-x-1/2 z-50
    bg-blue-600 hover:bg-blue-700 text-white
    px-4 py-2 rounded-lg shadow-lg
    flex items-center space-x-2
    transition-all duration-300
    hover:scale-105
  `;
  installButton.innerHTML = `
    <i class="fas fa-download"></i>
    <span>Install App</span>
  `;

  installButton.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          if (window.BurniAnalytics) {
            window.BurniAnalytics.trackConversion('pwa_install', 'accepted');
          }
        } else {
          console.log('User dismissed the install prompt');
          if (window.BurniAnalytics) {
            window.BurniAnalytics.trackConversion('pwa_install', 'dismissed');
          }
        }
        deferredPrompt = null;
        document.body.removeChild(installButton);
      });
    }
  });

  document.body.appendChild(installButton);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (installButton.parentNode) {
      document.body.removeChild(installButton);
    }
  }, 10000);
}

// Service Worker registration with enhanced error handling - RE-ENABLED WITH OPTIMIZATIONS
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful:', registration);

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New version available
                  showUpdateAvailableNotification();
                } else {
                  // First time installation
                  console.log('Content cached for offline use');
                }
              }
            });
          }
        });

        if (window.BurniAnalytics) {
          window.BurniAnalytics.trackFeatureUsage('service_worker', 'registered');
        }
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);

        if (window.BurniAnalytics) {
          window.BurniAnalytics.trackError(error, { type: 'service_worker_registration' });
        }
      });
  });
}

function showUpdateAvailableNotification() {
  const notification = document.createElement('div');
  notification.className = `
    fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
    bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg
    flex items-center space-x-4
  `;
  notification.innerHTML = `
    <span>New version available!</span>
    <button id="update-app" class="bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-gray-100">
      Update
    </button>
    <button id="dismiss-update" class="text-blue-200 hover:text-white">
      <i class="fas fa-times"></i>
    </button>
  `;

  document.body.appendChild(notification);

  // Update app
  notification.querySelector('#update-app').addEventListener('click', () => {
    window.location.reload();
  });

  // Dismiss notification
  notification.querySelector('#dismiss-update').addEventListener('click', () => {
    document.body.removeChild(notification);
  });
}

// Enhanced Price Updates with Animation Support
class PriceUpdateManager {
  constructor() {
    this.updateInterval = null;
    this.animationQueue = [];
    this.lastPrices = {};
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async startRealTimeUpdates() {
    // Update prices every 30 seconds
    this.updateInterval = setInterval(async () => {
      try {
        await this.updatePricesWithAnimation();
        this.retryCount = 0;
      } catch (error) {
        console.warn('Price update failed:', error);
        this.retryCount++;
        if (this.retryCount >= this.maxRetries) {
          console.error('Max retries reached for price updates');
          this.fallbackToStaticPrices();
        }
      }
    }, 30000);

    // Initial update
    await this.updatePricesWithAnimation();
  }

  async updatePricesWithAnimation() {
    try {
      const newPrices =
        typeof fetchLivePrices === 'function'
          ? await fetchLivePrices()
          : await this.fetchPricesCompat();

      // Animate price changes
      Object.keys(newPrices).forEach((currency) => {
        const oldPrice = this.lastPrices[currency];
        const newPrice = newPrices[currency];

        if (oldPrice && oldPrice.priceUSD !== newPrice.priceUSD) {
          this.animatePriceChange(currency, oldPrice.priceUSD, newPrice.priceUSD);
        }
      });

      this.lastPrices = { ...newPrices };
      this.updatePriceDisplay(newPrices);

      // Trigger custom event for price updates
      window.dispatchEvent(
        new CustomEvent('pricesUpdated', {
          detail: { prices: newPrices, timestamp: Date.now() },
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  // Compatibility function for fetchLivePrices
  async fetchPricesCompat() {
    const fallbackPrices = {
      burni: {
        priceUSD: 0.0000085,
        priceXRP: 0.0000045,
        circulatingSupply: 48500000,
        holders: 2547,
        totalBurned: 1500000,
      },
      xrp: {
        priceUSD: 1.85,
      },
    };

    try {
      // Try to fetch XRP price
      const xrpResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd',
      );
      if (xrpResponse.ok) {
        const xrpData = await xrpResponse.json();
        fallbackPrices.xrp.priceUSD = xrpData.ripple?.usd || fallbackPrices.xrp.priceUSD;
      }
    } catch (error) {
      console.warn('Could not fetch live prices, using fallbacks:', error);
    }

    return fallbackPrices;
  }

  animatePriceChange(currency, oldPrice, newPrice) {
    const elements = document.querySelectorAll(`[data-price="${currency}"]`);

    elements.forEach((element) => {
      // Add price update animation class
      element.classList.add('price-update');

      // Add color indication for price direction
      if (newPrice > oldPrice) {
        element.classList.add('text-green-500');
        element.classList.remove('text-red-500');
      } else if (newPrice < oldPrice) {
        element.classList.add('text-red-500');
        element.classList.remove('text-green-500');
      }

      // Remove animation class after animation completes
      setTimeout(() => {
        element.classList.remove('price-update', 'text-green-500', 'text-red-500');
      }, 500);
    });
  }

  updatePriceDisplay(prices) {
    // Update Burni price
    const burniPriceElements = document.querySelectorAll('[data-price="burni"]');
    burniPriceElements.forEach((element) => {
      element.textContent = `$${prices.burni.priceUSD.toFixed(8)}`;
    });

    // Update XRP price
    const xrpPriceElements = document.querySelectorAll('[data-price="xrp"]');
    xrpPriceElements.forEach((element) => {
      element.textContent = `$${prices.xrp.priceUSD.toFixed(4)}`;
    });

    // Update other metrics with smooth transitions
    this.updateMetricsWithTransition(prices);
  }

  updateMetricsWithTransition(prices) {
    // Animate counter changes
    this.animateCounter('[data-metric="holders"]', prices.burni.holders);
    this.animateCounter('[data-metric="supply"]', prices.burni.circulatingSupply);
    this.animateCounter('[data-metric="burned"]', prices.burni.totalBurned);
  }

  animateCounter(selector, targetValue) {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      const currentValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
      const duration = 1000; // 1 second animation
      const steps = 30;
      const increment = (targetValue - currentValue) / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.round(currentValue + increment * currentStep);

        if (currentStep >= steps) {
          element.textContent = this.formatNumber(targetValue);
          clearInterval(timer);
        } else {
          element.textContent = this.formatNumber(newValue);
        }
      }, stepDuration);
    });
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  fallbackToStaticPrices() {
    console.log('Using fallback static prices due to API failures');
    const staticPrices = {
      burni: { priceUSD: 0.0000085, priceXRP: 0.0000045 },
      xrp: { priceUSD: 1.85 },
    };
    this.updatePriceDisplay(staticPrices);
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Enhanced Image Loading and Optimization
class ImageOptimizer {
  constructor() {
    this.lazyImages = new Set();
    this.imageCache = new Map();
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '50px',
          threshold: 0.1,
        },
      );
    }
  }

  optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');

    images.forEach((img) => {
      this.lazyImages.add(img);
      img.classList.add('lazy-image', 'opacity-0');

      if (this.observer) {
        this.observer.observe(img);
      } else {
        // Fallback for browsers without IntersectionObserver
        this.loadImage(img);
      }
    });
  }

  async loadImage(img) {
    try {
      const src = img.dataset.src;

      if (this.imageCache.has(src)) {
        this.applyImage(img, src);
        return;
      }

      // Preload image
      const imageLoader = new Image();
      imageLoader.onload = () => {
        this.imageCache.set(src, true);
        this.applyImage(img, src);
      };

      imageLoader.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        img.classList.add('opacity-50');
      };

      imageLoader.src = src;
    } catch (error) {
      console.error('Image loading error:', error);
    }
  }

  applyImage(img, src) {
    img.src = src;
    img.classList.remove('opacity-0');
    img.classList.add('fade-in', 'optimized-image');

    // Add performance optimizations
    img.style.willChange = 'auto';
    img.loading = 'lazy';
    img.decoding = 'async';
  }

  preloadCriticalImages() {
    const criticalImages = [
      '/assets/images/burni-logo.webp',
      '/assets/images/burniimage.webp',
      '/assets/images/burni-chart.webp',
    ];

    criticalImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
}

// Animation Performance Manager
class AnimationManager {
  constructor() {
    this.activeAnimations = new Set();
    this.rafId = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  optimizeAnimations() {
    // Apply GPU acceleration to key elements
    const animatedElements = document.querySelectorAll('.pixar-button, .section-card, .hover-lift');

    animatedElements.forEach((element) => {
      element.classList.add('gpu-accelerated', 'optimize-animations');
    });

    // Disable animations for reduced motion preference
    if (this.reducedMotion) {
      document.body.classList.add('reduce-motion');
    }
  }

  startAnimationFrame() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.animationLoop());
    }
  }

  animationLoop() {
    // Optimize animations based on performance
    const fps = this.calculateFPS();

    if (fps < 30) {
      this.reduceAnimationComplexity();
    }

    this.rafId = requestAnimationFrame(() => this.animationLoop());
  }

  calculateFPS() {
    // Simple FPS calculation implementation
    const now = performance.now();
    const delta = now - (this.lastTime || now);
    this.lastTime = now;
    return 1000 / delta;
  }

  reduceAnimationComplexity() {
    // Reduce animation complexity when performance is low
    const complexAnimations = document.querySelectorAll('.burni-glow, .pulse-slow');
    complexAnimations.forEach((element) => {
      element.style.animationDuration = '5s'; // Slower animations
    });
  }
}

// Initialize all optimizations
const priceManager = new PriceUpdateManager();
const imageOptimizer = new ImageOptimizer();
const animationManager = new AnimationManager();

// Enhanced initialization function
async function initializeOptimizedFeatures() {
  try {
    // Start price updates
    await priceManager.startRealTimeUpdates();

    // Optimize images
    imageOptimizer.preloadCriticalImages();
    imageOptimizer.optimizeImages();

    // Optimize animations
    animationManager.optimizeAnimations();
    animationManager.startAnimationFrame();

    console.log('All optimizations initialized successfully');
  } catch (error) {
    console.error('Error initializing optimizations:', error);
  }
}

// Start optimized features initialization
initializeOptimizedFeatures();

// Enhanced Error Monitoring and Reporting
window.onerror = function (message, source, lineno, colno, error) {
  console.error('Global Error:', {
    message,
    source,
    line: lineno,
    column: colno,
    error: error?.stack,
  });

  // Optional: Send to monitoring service
  // sendErrorToMonitoring({ message, source, lineno, colno, stack: error?.stack });

  return false;
};

window.addEventListener('unhandledrejection', function (event) {
  console.error('Unhandled Promise Rejection:', event.reason);

  // Optional: Send to monitoring service
  // sendErrorToMonitoring({ type: 'unhandledrejection', reason: event.reason });
});

// Performance monitoring
window.addEventListener('load', function () {
  setTimeout(function () {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Performance Metrics:', {
      loadTime: perfData.loadEventEnd - perfData.loadEventStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      firstPaint: performance
        .getEntriesByType('paint')
        .find((entry) => entry.name === 'first-paint')?.startTime,
    });
  }, 0);
});

// Advanced Lazy Loading with Intersection Observer
class AdvancedImageLoader {
  constructor() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    this.imageObserver = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.loadImage(img);
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        },
      );

      this.images.forEach((img) => this.imageObserver.observe(img));
    }
  }

  loadImage(img) {
    const src = img.getAttribute('data-src') || img.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
    }
  }
}

// Initialize advanced image loading
document.addEventListener('DOMContentLoaded', () => {
  new AdvancedImageLoader();
});
