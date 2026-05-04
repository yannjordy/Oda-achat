const CACHE_NAME = 'oda-market-cache-v2';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/images/oda.png',
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // API requests - network first
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ error: 'offline' }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          });
        })
    );
    return;
  }

  // Static assets - cache first
  if (event.request.destination === 'image' || 
      event.request.destination === 'style' || 
      event.request.destination === 'script' ||
      event.request.destination === 'font') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      }).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/images/icon-192x192.png');
        }
      })
    );
    return;
  }

  // Default - network first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'ODA Market', body: event.data.text() };
    }
  }

  const title = data.title || 'ODA Market';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: data.icon || '/images/icon-192x192.png',
    badge: data.badge || '/images/icon-192x192.png',
    image: data.image || null,
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'view', title: 'Voir', icon: '/images/icon-192x192.png' },
      { action: 'close', title: 'Fermer' }
    ],
    vibrate: data.vibrate || [200, 100, 200],
    renotify: true,
    timestamp: data.timestamp || Date.now(),
    dir: data.dir || 'auto',
    lang: 'fr'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  // Optional: track notification dismissal
  console.log('Notification closed', event);
});

// Message event - handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }

  if (event.data && event.data.type === 'SUBSCRIBE_PUSH') {
    event.source.postMessage({
      type: 'PUSH_SUBSCRIPTION_READY',
      ready: true
    });
  }

  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification(event.data.title || 'Test', {
      body: event.data.body || 'Ceci est un test',
      icon: event.data.icon || '/images/icon-192x192.png',
      badge: event.data.badge || '/images/icon-192x192.png',
      data: event.data.data || {},
      tag: 'test-notification',
      vibrate: [200, 100, 200],
    });
  }
});
