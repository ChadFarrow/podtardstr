// Service Worker for Podtardstr PWA
// Provides offline support and caching for better mobile experience

const CACHE_NAME = 'podtardstr-v2';
const STATIC_CACHE_NAME = 'podtardstr-static-v2';
const DYNAMIC_CACHE_NAME = 'podtardstr-dynamic-v2';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(url => {
        // Only cache assets that exist
        return fetch(url).then(response => response.ok).catch(() => false);
      }));
    }).catch((error) => {
      console.warn('[SW] Failed to cache some static assets:', error);
    })
  );
  
  // Force the service worker to become active immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Skip WebSocket connections and EventSource
  if (event.request.headers.get('upgrade') === 'websocket' || 
      event.request.headers.get('accept') === 'text/event-stream') {
    return;
  }
  
  // Handle different types of requests
  if (event.request.method === 'GET') {
    // Static assets - cache first strategy
    if (STATIC_ASSETS.some(asset => event.request.url.endsWith(asset))) {
      event.respondWith(cacheFirstStrategy(event.request));
      return;
    }
    
    // API requests - network first with cache fallback
    if (url.pathname.startsWith('/api/') || 
        url.hostname.includes('api.') || 
        url.hostname.includes('stats.') ||
        url.hostname.includes('podcastindex.org')) {
      event.respondWith(networkFirstStrategy(event.request));
      return;
    }
    
    // Images and media - cache first with network fallback
    if (event.request.destination === 'image' || 
        event.request.destination === 'audio' ||
        event.request.url.includes('/image/') ||
        event.request.url.includes('.jpg') ||
        event.request.url.includes('.png') ||
        event.request.url.includes('.mp3') ||
        event.request.url.includes('.m4a')) {
      event.respondWith(cacheFirstStrategy(event.request));
      return;
    }
    
    // Other GET requests - network first
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Cache first strategy - good for static assets
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Return cached version immediately
      return cachedResponse;
    }
    
    // If not in cache, fetch from network and cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache first strategy failed:', error);
    // Return offline fallback if available
    return getOfflineFallback(request);
  }
}

// Network first strategy - good for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      const responseClone = networkResponse.clone();
      
      // Don't cache very large responses
      if (responseClone.headers.get('content-length') < 5000000) { // 5MB limit
        cache.put(request, responseClone);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network request failed, trying cache:', error);
    
    // If network fails, try to serve from cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback
    return getOfflineFallback(request);
  }
}

// Offline fallback responses
function getOfflineFallback(request) {
  if (request.destination === 'document') {
    // Return cached index.html for navigation requests
    return caches.match('/') || caches.match('/index.html');
  }
  
  if (request.destination === 'image') {
    // Return a simple offline image placeholder
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#666">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  // For other requests, return a basic offline response
  return new Response(
    JSON.stringify({ error: 'Offline', message: 'This feature requires an internet connection' }),
    { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform any background tasks when connection is restored
      console.log('[SW] Performing background sync tasks')
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New content available',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'podtardstr-notification',
      renotify: true
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Podtardstr', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});