const CACHE_NAME = 'burni-cache-v9'; // Updated for enhanced compatibility
const API_CACHE_NAME = 'burni-api-cache-v3';
const RUNTIME_CACHE_NAME = 'burni-runtime-cache-v1';

// Enhanced asset caching with compression detection
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
];

// Performance monitoring
const performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  errors: 0
};

// API URLs with caching strategies
const API_CONFIG = {
  realtime: {
    urls: [
      'https://api.coingecko.com/api/v3/simple/price',
      'https://api.xrpl.org',
      'https://livenet.xrpl.org'
    ],
    maxAge: 60000, // 1 minute
    strategy: 'network-first'
  },
  static: {
    urls: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ],
    maxAge: 86400000, // 24 hours
    strategy: 'cache-first'
  }
};

// Enhanced install event with progressive caching
self.addEventListener('install', (event) => {
  console.log('Service Worker installing with enhanced features...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets first
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching critical assets');
        const criticalAssets = ASSETS_TO_CACHE.filter(asset => 
          asset.includes('critical.css') || 
          asset.includes('security.js') || 
          asset === '/' || 
          asset === '/index.html'
        );
        return cache.addAll(criticalAssets);
      }),
      
      // Cache remaining assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching remaining assets');
        const remainingAssets = ASSETS_TO_CACHE.filter(asset => 
          !asset.includes('critical.css') && 
          !asset.includes('security.js') && 
          asset !== '/' && 
          asset !== '/index.html'
        );
        
        return Promise.allSettled(
          remainingAssets.map(asset => cache.add(asset).catch(err => {
            console.warn(`Failed to cache ${asset}:`, err);
            return null;
          }))
        );
      }),
      
      // Initialize runtime cache
      caches.open(RUNTIME_CACHE_NAME)
    ])
    .then(() => {
      console.log('Service Worker installation complete with enhanced features');
      
      // Performance mark
      if ('performance' in self && 'mark' in self.performance) {
        self.performance.mark('sw-install-complete');
      }
      
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('Service Worker installation failed:', error);
      performanceMetrics.errors++;
    })
  );
});

// Enhanced activate event with intelligent cache management
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating with enhanced cleanup...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        const validCaches = [CACHE_NAME, API_CACHE_NAME, RUNTIME_CACHE_NAME];
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!validCaches.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Clear runtime cache if it's too large
      caches.open(RUNTIME_CACHE_NAME).then((cache) => {
        return cache.keys().then((keys) => {
          if (keys.length > 100) { // Limit runtime cache size
            console.log('Cleaning runtime cache (too many entries)');
            const oldEntries = keys.slice(0, keys.length - 50);
            return Promise.all(oldEntries.map(key => cache.delete(key)));
          }
        });
      })
    ])
    .then(() => {
      console.log('Service Worker activated with enhanced features');
      
      // Performance mark
      if ('performance' in self && 'mark' in self.performance) {
        self.performance.mark('sw-activate-complete');
      }
      
      return self.clients.claim();
    })
    .catch((error) => {
      console.error('Service Worker activation failed:', error);
      performanceMetrics.errors++;
    })
  );
});

// Enhanced fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const request = event.request;
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Skip POST requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Determine caching strategy based on request type
  let strategy = 'cache-first';
  let cacheName = CACHE_NAME;
  let maxAge = null;
  
  // API requests
  if (isApiRequest(request.url)) {
    const apiConfig = getApiConfig(request.url);
    strategy = apiConfig.strategy;
    cacheName = API_CACHE_NAME;
    maxAge = apiConfig.maxAge;
  }
  
  // Runtime assets (not in main cache)
  else if (!ASSETS_TO_CACHE.includes(requestUrl.pathname)) {
    strategy = 'network-first';
    cacheName = RUNTIME_CACHE_NAME;
    maxAge = 3600000; // 1 hour
  }
  
  event.respondWith(
    executeStrategy(strategy, request, cacheName, maxAge)
      .catch((error) => {
        console.error(`Fetch failed for ${request.url}:`, error);
        performanceMetrics.errors++;
        
        // Fallback to offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/404.html') || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        }
        
        return new Response('Network error', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Enhanced strategy implementations
function executeStrategy(strategy, request, cacheName, maxAge) {
  switch (strategy) {
    case 'cache-first':
      return cacheFirstStrategy(request, cacheName, maxAge);
    case 'network-first':
      return networkFirstStrategy(request, cacheName, maxAge);
    case 'stale-while-revalidate':
      return staleWhileRevalidateStrategy(request, cacheName, maxAge);
    default:
      return cacheFirstStrategy(request, cacheName, maxAge);
  }
}

// Cache-first strategy with staleness check
function cacheFirstStrategy(request, cacheName, maxAge) {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Check if cached response is stale
        if (maxAge && isCacheStale(cachedResponse, maxAge)) {
          // Return cached response but update in background
          fetchAndCache(request, cache);
          performanceMetrics.cacheHits++;
          return cachedResponse;
        }
        
        performanceMetrics.cacheHits++;
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      performanceMetrics.cacheMisses++;
      return fetchAndCache(request, cache);
    });
  });
}

// Network-first strategy with timeout
function networkFirstStrategy(request, cacheName, maxAge, timeout = 3000) {
  performanceMetrics.networkRequests++;
  
  return caches.open(cacheName).then((cache) => {
    const networkPromise = fetchWithTimeout(request, timeout)
      .then((response) => {
        if (response.ok) {
          cache.put(request.clone(), response.clone());
        }
        return response;
      });
    
    const cachePromise = cache.match(request);
    
    return Promise.race([
      networkPromise,
      new Promise((resolve) => {
        setTimeout(() => {
          cachePromise.then((cachedResponse) => {
            if (cachedResponse) {
              performanceMetrics.cacheHits++;
              resolve(cachedResponse);
            }
          });
        }, timeout);
      })
    ]).catch(() => {
      // Network failed, try cache
      return cachePromise.then((cachedResponse) => {
        if (cachedResponse) {
          performanceMetrics.cacheHits++;
          return cachedResponse;
        }
        throw new Error('No cache available');
      });
    });
  });
}

// Stale-while-revalidate strategy
function staleWhileRevalidateStrategy(request, cacheName, maxAge) {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      const fetchPromise = fetchAndCache(request, cache);
      
      if (cachedResponse) {
        performanceMetrics.cacheHits++;
        return cachedResponse;
      }
      
      performanceMetrics.cacheMisses++;
      return fetchPromise;
    });
  });
}

// Helper functions
function fetchAndCache(request, cache) {
  return fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request.clone(), response.clone());
    }
    return response;
  });
}

function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Fetch timeout')), timeout);
    })
  ]);
}

function isCacheStale(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const date = new Date(dateHeader);
  return Date.now() - date.getTime() > maxAge;
}

function isApiRequest(url) {
  return Object.values(API_CONFIG).some(config =>
    config.urls.some(apiUrl => url.includes(apiUrl))
  );
}

function getApiConfig(url) {
  for (const [key, config] of Object.entries(API_CONFIG)) {
    if (config.urls.some(apiUrl => url.includes(apiUrl))) {
      return config;
    }
  }
  return API_CONFIG.static; // Default
}

// Real-Time Features and Advanced PWA Support
const REALTIME_CACHE_NAME = 'burni-realtime-v1';
const BACKGROUND_SYNC_TAG = 'background-sync';

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