const CACHE_NAME = 'burni-cache-v8'; // Updated after cleanup
const API_CACHE_NAME = 'burni-api-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/assets/css/styles.min.css',
  '/assets/css/critical.css',
  '/assets/scripts.min.js',
  '/assets/scripts.js',
  '/assets/analytics.js',
  '/assets/real-time-monitor.js',
  '/assets/security.js',
  '/assets/images/burniimage.webp',
  '/assets/images/favicon.ico',
  '/assets/images/favicon-32x32.png',
  '/assets/images/favicon-16x16.png',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/mstile-150x150.png',
  '/assets/images/burni-social.webp',
  '/assets/images/burni-logo.png',
  '/assets/images/burni-logo.webp',
  '/assets/images/burn-coin-schwarzes-loch.jpg',
  '/assets/images/burni-chart.webp',
  '/assets/images/burni-lagerfeuer.jpg',
  '/assets/images/burni-verbrannt.jpg',
  '/assets/images/burni-verbrennt-lagerfeuer.webp',
  '/assets/images/burni-versperrt-coins-im-tresor.webp',
  '/assets/images/burnicoin.jpg',
  '/assets/images/burni-07.27.2027.jpg',
  '/assets/images/gamepad.svg',
  '/assets/images/gamepad.webp',
  '/assets/images/palette.webp',
  '/assets/images/use-case-rewards.webp',
  '/assets/images/exchange.png',
  '/assets/images/exchange.webp',
  '/assets/images/vote.png',
  '/assets/images/vote.webp',
  '/assets/images/burni-07.27.2027.jpg',
  '/clear-cache.html',
  '/test-minimal.html',
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
    caches
      .open(CACHE_NAME)
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
      }),
  );
});

// Enhanced activate event with cache cleanup
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      }),
  );
});

// Enhanced fetch event with network-first strategy for API calls and cache-first for assets
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Handle API requests with network-first strategy
  if (API_URLS.some((url) => event.request.url.includes(url.split('?')[0]))) {
    event.respondWith(networkFirstStrategy(event.request, API_CACHE_NAME));
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      }),
    );
    return;
  }

  // Handle asset requests with cache-first strategy
  if (
    event.request.destination === 'image' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script'
  ) {
    event.respondWith(cacheFirstStrategy(event.request, CACHE_NAME));
    return;
  }

  // Default strategy for other requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
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

// Real-Time Features and Advanced PWA Support
const REALTIME_CACHE_NAME = 'burni-realtime-v1';
const BACKGROUND_SYNC_TAG = 'background-sync';

// Advanced caching strategies
const cacheStrategies = {
  static: 'cache-first',
  api: 'network-first',
  realtime: 'network-only',
  fallback: 'stale-while-revalidate',
};

// Push notification handling
self.addEventListener('push', function (event) {
  console.log('🔔 Push notification received');

  const options = {
    body: 'New Burni Token update available!',
    icon: '/assets/images/burni-logo.png',
    badge: '/assets/images/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Update',
        icon: '/assets/images/burni.png',
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/assets/images/favicon-16x16.png',
      },
    ],
    requireInteraction: false,
    silent: false,
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      options.body = pushData.body || options.body;
      options.title = pushData.title || 'Burni Token';
    } catch (error) {
      console.log('Push data parsing failed:', error);
    }
  }

  event.waitUntil(self.registration.showNotification('🔥 Burni Token', options));
});

// Notification click handling
self.addEventListener('notificationclick', function (event) {
  console.log('🔔 Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow('/'));
  }
});

// Background sync for offline actions
self.addEventListener('sync', function (event) {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync offline actions (price updates, user interactions, etc.)
    await syncPriceData();
    await syncUserInteractions();
    await syncAnalytics();
    console.log('✅ Background sync completed');
  } catch (error) {
    console.log('❌ Background sync failed:', error);
  }
}

async function syncPriceData() {
  try {
    const response = await fetch('/api/prices');
    if (response.ok) {
      const priceData = await response.json();
      // Cache the latest price data
      const cache = await caches.open(REALTIME_CACHE_NAME);
      cache.put('/api/prices', response.clone());
    }
  } catch (error) {
    console.log('Price sync failed:', error);
  }
}

async function syncUserInteractions() {
  // Sync queued user interactions from IndexedDB
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['interactions'], 'readonly');
    const store = transaction.objectStore('interactions');
    const interactions = await getAllFromStore(store);

    for (const interaction of interactions) {
      await sendInteractionToServer(interaction);
    }

    // Clear synced interactions
    const clearTransaction = db.transaction(['interactions'], 'readwrite');
    const clearStore = clearTransaction.objectStore('interactions');
    await clearStore.clear();
  } catch (error) {
    console.log('Interaction sync failed:', error);
  }
}

// Advanced request handling with strategies
self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);

  // Real-time API requests
  if (url.pathname.startsWith('/api/realtime')) {
    event.respondWith(networkOnlyStrategy(event.request));
    return;
  }

  // Price API requests
  if (url.pathname.startsWith('/api/prices')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Static assets
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }

  // HTML pages
  if (event.request.destination === 'document') {
    event.respondWith(staleWhileRevalidateStrategy(event.request));
    return;
  }

  // Default strategy
  event.respondWith(networkFirstStrategy(event.request));
});

// Caching strategies implementation
async function networkOnlyStrategy(request) {
  return fetch(request);
}

async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match(request);
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BurniDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('interactions')) {
        db.createObjectStore('interactions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}