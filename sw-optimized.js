// Production-ready Service Worker for BurniToken
// Optimized for performance, reliability, and PWA capabilities

const CACHE_VERSION = 'burni-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/main-optimized.css',
  '/assets/images/burniimage.webp',
  '/assets/images/favicon-32x32.png',
  '/assets/images/favicon-16x16.png',
  '/assets/images/apple-touch-icon.png'
];

// API endpoints with specific caching strategies
const API_ENDPOINTS = {
  'api.coingecko.com': { maxAge: 60000, strategy: 'network-first' }, // 1 minute
  'livenet.xrpl.org': { maxAge: 30000, strategy: 'network-first' },   // 30 seconds
  'bithomp.com': { maxAge: 300000, strategy: 'cache-first' }          // 5 minutes
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const deletePromises = cacheNames
          .filter(cacheName => !cacheName.startsWith(CACHE_VERSION))
          .map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('[SW] Failed to clean up caches:', error);
      })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Determine caching strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isApiRequest(url)) {
    event.respondWith(apiCacheStrategy(request, url));
  } else if (isPageRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
  } else {
    event.respondWith(dynamicCacheStrategy(request));
  }
});

// Caching strategies
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error);
    return new Response('Offline content not available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

async function networkFirstStrategy(request, timeout = 3000) {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), timeout);
    });
    
    const networkResponse = await Promise.race([
      fetch(request),
      timeoutPromise
    ]);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error.message);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback for page requests
    if (isPageRequest(request)) {
      const fallbackResponse = await caches.match('/index.html');
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

async function apiCacheStrategy(request, url) {
  const hostname = url.hostname;
  const apiConfig = API_ENDPOINTS[hostname] || { maxAge: 60000, strategy: 'network-first' };
  
  if (apiConfig.strategy === 'network-first') {
    return networkFirstWithExpiry(request, apiConfig.maxAge);
  } else {
    return cacheFirstWithExpiry(request, apiConfig.maxAge);
  }
}

async function networkFirstWithExpiry(request, maxAge) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Add timestamp header for expiry checking
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const responseWithTimestamp = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, responseWithTimestamp);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API network failed, trying cache:', error.message);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
      return cachedResponse;
    }
    
    return new Response('API unavailable', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

async function cacheFirstWithExpiry(request, maxAge) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      const responseToCache = networkResponse.clone();
      
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const responseWithTimestamp = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, responseWithTimestamp);
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse; // Return stale cache if network fails
    }
    
    return new Response('API unavailable', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

async function dynamicCacheStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      
      // Limit dynamic cache size
      const keys = await cache.keys();
      if (keys.length > 50) {
        cache.delete(keys[0]); // Remove oldest entry
      }
      
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Resource unavailable', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Helper functions
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname === asset) ||
         url.pathname.startsWith('/assets/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.webp') ||
         url.pathname.endsWith('.svg');
}

function isApiRequest(url) {
  return Object.keys(API_ENDPOINTS).some(domain => url.hostname.includes(domain));
}

function isPageRequest(request) {
  return request.headers.get('accept').includes('text/html');
}

function isCacheExpired(response, maxAge) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;
  
  const cacheAge = Date.now() - parseInt(cachedAt);
  return cacheAge > maxAge;
}

// Error handling
self.addEventListener('error', event => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

// Background sync for PWA features
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any queued actions
    console.log('[SW] Performing background sync...');
    
    // Update critical cached resources
    const criticalResources = ['/manifest.json', '/assets/css/main-optimized.css'];
    for (const resource of criticalResources) {
      try {
        const response = await fetch(resource);
        if (response.ok) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(resource, response.clone());
        }
      } catch (error) {
        console.log(`[SW] Failed to update ${resource}:`, error.message);
      }
    }
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notifications (basic setup)
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'New update available for BurniToken!',
    icon: '/assets/images/favicon-32x32.png',
    badge: '/assets/images/favicon-16x16.png',
    data: { url: '/' },
    actions: [
      { action: 'view', title: 'View Update' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.data.url = data.url || options.data.url;
    } catch (error) {
      console.log('[SW] Failed to parse push data:', error.message);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('BurniToken', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

console.log('[SW] Service Worker loaded successfully');