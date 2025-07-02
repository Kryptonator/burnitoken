
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
