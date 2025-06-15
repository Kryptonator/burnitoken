const CACHE_NAME = 'burni-cache-v5';
const API_CACHE_NAME = 'burni-api-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/assets/css/styles.min.css',
  '/assets/scripts.min.js',
  '/assets/scripts.js',
  '/assets/config.js',
  '/assets/browserconfig.xml',
  '/assets/images/burniimage.jpg',
  '/assets/images/burniimage.webp',
  '/assets/images/favicon.ico',
  '/assets/images/favicon-32x32.png',
  '/assets/images/favicon-16x16.png',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/mstile-150x150.png',
  '/assets/images/burni-social.jpg',
  '/assets/images/burni-social.webp',
  '/assets/images/burni-logo.png',
  '/assets/images/burni-logo.webp',
  '/assets/images/burn-chart1.jpg',
  '/assets/images/burn-coin-schwarzes-loch.jpg',
  '/assets/images/burni-chart.jpg',
  '/assets/images/burni-chart.webp',
  '/assets/images/burni-lagerfeuer.jpg',
  '/assets/images/burni-verbrannt.jpg',
  '/assets/images/burni-verbrennt-burnis-im-lagerfeuer.jpeg',
  '/assets/images/burni-verbrennt-lagerfeuer.webp',
  '/assets/images/burni-versperrt-coins-im-tresor.jpg',
  '/assets/images/burni-versperrt-coins-im-tresor.webp',
  '/assets/images/burni.png',
  '/assets/images/burnicoin.jpg',
  '/assets/images/burnicoin1.jpg',
  '/assets/images/burni1.png',
  '/assets/images/burni1 (1).png',
  '/assets/images/burni-verbrennt-lagerfeuer.jpg',
  '/assets/images/burni-chart-illustration.jpg',
  '/assets/images/gamepad.png',
  '/assets/images/gamepad.svg',
  '/assets/images/gamepad.webp',
  '/assets/images/palette.png',
  '/assets/images/palette.webp',
  '/assets/images/use-case-rewards.jpg',
  '/assets/images/use-case-rewards.webp',
  '/assets/images/exchange.png',
  '/assets/images/exchange.webp',
  '/assets/images/vote.png',
  '/assets/images/vote.webp',
  '/assets/images/burni-07.27.2027.jpg',
];

// API URLs that should be cached
const API_URLS = [
  'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd',
  'https://api.xrpl.org/v1/accounts/*/balance',
];

// Improved install event with error handling
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('Service Worker installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Enhanced activate event with cache cleanup
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Enhanced fetch event with network-first strategy for API calls and cache-first for assets
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Handle API requests with network-first strategy
  if (API_URLS.some(url => event.request.url.includes(url.split('?')[0]))) {
    event.respondWith(
      networkFirstStrategy(event.request, API_CACHE_NAME)
    );
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Handle asset requests with cache-first strategy
  if (event.request.destination === 'image' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script') {
    event.respondWith(
      cacheFirstStrategy(event.request, CACHE_NAME)
    );
    return;
  }

  // Default strategy for other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Fetch failed for:', request.url, error);
    throw error;
  }
}

// Network-first strategy for API calls
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('Network request failed, trying cache:', request.url, error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Background sync for offline data collection
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);

  if (event.tag === 'background-analytics') {
    event.waitUntil(
      handleBackgroundAnalytics()
    );
  }

  if (event.tag === 'background-price-update') {
    event.waitUntil(
      handleBackgroundPriceUpdate()
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  const options = {
    body: event.data ? event.data.text() : 'New update from Burni Token!',
    icon: '/assets/images/burni-logo.png',
    badge: '/assets/images/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/assets/images/favicon-16x16.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/favicon-16x16.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Burni Token Update', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background analytics handler
async function handleBackgroundAnalytics() {
  try {
    const analyticsData = await getStoredAnalytics();
    if (analyticsData.length > 0) {
      await sendAnalyticsData(analyticsData);
      await clearStoredAnalytics();
    }
  } catch (error) {
    console.error('Background analytics failed:', error);
  }
}

// Background price update handler
async function handleBackgroundPriceUpdate() {
  try {
    const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd');
    if (priceResponse.ok) {
      const priceData = await priceResponse.json();
      await storePriceData(priceData);

      // Notify all clients about price update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'PRICE_UPDATE',
          data: priceData
        });
      });
    }
  } catch (error) {
    console.error('Background price update failed:', error);
  }
}

// Utility functions for data storage
async function getStoredAnalytics() {
  // Implementation would use IndexedDB
  return [];
}

async function sendAnalyticsData(data) {
  // Implementation would send data to analytics endpoint
  console.log('Sending analytics data:', data);
}

async function clearStoredAnalytics() {
  // Implementation would clear IndexedDB
  console.log('Analytics data cleared');
}

async function storePriceData(data) {
  // Implementation would store in IndexedDB
  console.log('Price data stored:', data);
}
