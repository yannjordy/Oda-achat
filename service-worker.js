// ==================== SERVICE WORKER OPTIMISÉ ====================
// Pour ODA Marketplace PWA avec support notifications avancées

const CACHE_NAME = 'oda-marketplace-v2.0';
const RUNTIME_CACHE = 'oda-runtime-v2.0';

// Fichiers à mettre en cache lors de l'installation
const STATIC_ASSETS = [
     '/',
    '/oda-achats.html',
    '/favorie.html',
    '/boutique.html',
     '/manifest.json',
    '/boutiques.html',
    '/produit.html',
    '/oda.png',
    '/oda-icon-192.png',
    '/oda-icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// ==================== INSTALLATION ====================
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installation');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Mise en cache des ressources statiques');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Installé');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Erreur installation SW:', error);
            })
    );
});

// ==================== ACTIVATION ====================
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: Activation');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('🗑️ Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activé');
                return self.clients.claim();
            })
    );
});

// ==================== STRATÉGIE DE CACHE ====================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ne pas mettre en cache les requêtes externes (API, etc.)
    if (url.origin !== location.origin) {
        return;
    }
    
    // Stratégie Cache First pour les ressources statiques
    if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(request).then((response) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, response.clone());
                            return response;
                        });
                    });
                })
        );
        return;
    }
    
    // Stratégie Network First pour le reste
    event.respondWith(
        fetch(request)
            .then((response) => {
                return caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, response.clone());
                    return response;
                });
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});

// ==================== NOTIFICATIONS PUSH ====================
self.addEventListener('push', (event) => {
    console.log('📬 Notification Push reçue');
    
    let notificationData = {
        title: '🔔 Nouvelle notification',
        body: 'Vous avez une nouvelle notification',
        icon: '/icon.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'default',
        requireInteraction: false,
        renotify: true
    };
    
    // Si les données sont fournies dans le push
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data
            };
        } catch (error) {
            console.error('Erreur parsing push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// ==================== CLIC SUR NOTIFICATION ====================
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Clic sur notification:', event.notification.tag);
    
    event.notification.close();
    
    // URL de destination selon le tag
    const urlMap = {
        'new-products': '/oda-achats.html#nouveautes',
        'flash-sale': '/oda-achats.html#promotions',
        'popular': '/oda-achats.html#populaires',
        'special-offer': '/oda-achats.html#offres',
        'recommended': '/oda-achats.html#recommandations',
        'default': '/oda-achats.html'
    };
    
    const urlToOpen = urlMap[event.notification.tag] || urlMap['default'];
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si une fenêtre est déjà ouverte, la focaliser
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Sinon, ouvrir une nouvelle fenêtre
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ==================== FERMETURE DE NOTIFICATION ====================
self.addEventListener('notificationclose', (event) => {
    console.log('❌ Notification fermée:', event.notification.tag);
    
    // Analytics ou tracking ici si besoin
});

// ==================== SYNCHRONISATION EN ARRIÈRE-PLAN ====================
self.addEventListener('sync', (event) => {
    console.log('🔄 Background Sync:', event.tag);
    
    if (event.tag === 'sync-notifications') {
        event.waitUntil(
            // Synchroniser les données ou récupérer de nouvelles notifications
            fetch('/api/check-notifications')
                .then(response => response.json())
                .then(data => {
                    if (data.hasNew) {
                        return self.registration.showNotification('🆕 Nouveautés', {
                            body: data.message,
                            icon: '/icon.png',
                            badge: '/badge.png'
                        });
                    }
                })
                .catch(error => {
                    console.error('Erreur sync:', error);
                })
        );
    }
});

// ==================== MESSAGES DU CLIENT ====================
self.addEventListener('message', (event) => {
    console.log('💬 Message reçu:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        self.registration.showNotification(title, options);
    }
});

// ==================== GESTION DES ERREURS ====================
self.addEventListener('error', (event) => {
    console.error('❌ Erreur Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejetée:', event.reason);
});

console.log('✅ Service Worker chargé et prêt');
