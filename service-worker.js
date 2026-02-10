// ==================== SERVICE WORKER ODA MARKETPLACE ====================
const CACHE_NAME = 'oda-marketplace-v1.0.3';
const RUNTIME_CACHE = 'oda-runtime-v1';
const IMAGE_CACHE = 'oda-images-v1';

// Ressources à mettre en cache immédiatement
const PRECACHE_URLS = [
    '/',
    '/oda-achats.html',
    '/favorie.html',
    '/boutique.html',
    '/boutiques.html',
    '/produit.html',
    '/oda.png',
    '/oda-icon-192.png',
    '/oda-icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// ==================== INSTALLATION ====================
self.addEventListener('install', event => {
    console.log('🔧 [SW] Installation du Service Worker');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 [SW] Mise en cache des ressources');
                return cache.addAll(PRECACHE_URLS).catch(err => {
                    console.warn('⚠️ [SW] Erreur cache précache:', err);
                    // Ne pas bloquer l'installation si certaines ressources échouent
                });
            })
            .then(() => self.skipWaiting())
    );
});

// ==================== ACTIVATION ====================
self.addEventListener('activate', event => {
    console.log('✅ [SW] Activation du Service Worker');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== RUNTIME_CACHE && 
                        cacheName !== IMAGE_CACHE) {
                        console.log('🗑️ [SW] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim())
    );
});

// ==================== FETCH - STRATÉGIE DE CACHE ====================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignorer les requêtes vers Supabase (toujours en ligne)
    if (url.hostname.includes('supabase.co')) {
        return;
    }
    
    // Images: Cache First
    if (request.destination === 'image') {
        event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
        return;
    }
    
    // Scripts et styles: Network First avec fallback cache
    if (request.destination === 'script' || 
        request.destination === 'style' ||
        url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'cdnjs.cloudflare.com') {
        event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
        return;
    }
    
    // HTML et autres: Network First
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
});

// Stratégie Cache First (pour images)
async function cacheFirstStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.warn('⚠️ [SW] Erreur fetch image:', error);
        // Retourner une image placeholder si disponible
        return cache.match('/oda.png') || new Response('Image non disponible', { status: 404 });
    }
}

// Stratégie Network First (pour HTML, scripts, styles)
async function networkFirstStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.warn('⚠️ [SW] Erreur réseau, utilisation du cache:', error);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        // Fallback pour les pages HTML
        if (request.destination === 'document') {
            return cache.match('/oda-achats.html') || 
                   new Response('Application hors ligne', {
                       status: 503,
                       statusText: 'Service Unavailable',
                       headers: new Headers({
                           'Content-Type': 'text/html'
                       })
                   });
        }
        
        throw error;
    }
}

// ==================== NOTIFICATIONS ====================
self.addEventListener('notificationclick', event => {
    console.log('🔔 [SW] Notification cliquée:', event.notification.tag);
    
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Si une fenêtre est déjà ouverte, la focus
                for (let client of clientList) {
                    if (client.url.includes('oda-achats.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Sinon, ouvrir une nouvelle fenêtre
                if (clients.openWindow) {
                    return clients.openWindow('/oda-achats.html');
                }
            })
    );
});

self.addEventListener('notificationclose', event => {
    console.log('🔕 [SW] Notification fermée');
});

// ==================== PUSH NOTIFICATIONS ====================
self.addEventListener('push', event => {
    console.log('📨 [SW] Réception d\'un message push');
    
    let data = {
        title: 'ODA Marketplace',
        body: 'Nouvelle notification',
        icon: '/oda-icon-192.png',
        badge: '/oda-icon-96.png'
    };
    
    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            vibrate: [200, 100, 200],
            tag: 'oda-push',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: 'Ouvrir',
                    icon: '/icon-open.png'
                },
                {
                    action: 'close',
                    title: 'Fermer',
                    icon: '/icon-close.png'
                }
            ]
        })
    );
});

// ==================== SYNCHRONISATION EN ARRIÈRE-PLAN ====================
self.addEventListener('sync', event => {
    console.log('🔄 [SW] Synchronisation en arrière-plan:', event.tag);
    
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

async function syncFavorites() {
    try {
        console.log('🔄 [SW] Synchronisation des favoris...');
        // Logique de synchronisation ici
        return Promise.resolve();
    } catch (error) {
        console.error('❌ [SW] Erreur sync favoris:', error);
        throw error;
    }
}

// ==================== MESSAGES ====================
self.addEventListener('message', event => {
    console.log('💬 [SW] Message reçu:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
});

// ==================== GESTION DES ERREURS ====================
self.addEventListener('error', event => {
    console.error('❌ [SW] Erreur globale:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('❌ [SW] Promise rejetée:', event.reason);
});

console.log('✅ [SW] Service Worker chargé - Version:', CACHE_NAME);
