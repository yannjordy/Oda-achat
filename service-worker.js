// ==================== SERVICE WORKER ULTRA-OPTIMISÉ ====================
// Version: 1.0.0
// Cache-First Strategy pour vitesse maximale

const CACHE_VERSION = 'oda-v1.0.0';
const CACHE_NAME = `oda-marketplace-${CACHE_VERSION}`;

// Ressources critiques à mettre en cache immédiatement
const CRITICAL_ASSETS = [
    '/favorie.html',
    '/index.html',
    '/boutiques.html',
    '/boutique.html',
    '/manifest1.html',
    '/oda-achats.html',
    '/oda.png',
    '/manifest.json'
];

// Ressources à mettre en cache en arrière-plan (différé)
const SECONDARY_ASSETS = [
    '/oda-shop-styles.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Routes à NE PAS mettre en cache
const BYPASS_ROUTES = [
    '/api/',
    '/admin/',
    'chrome-extension://'
];

// Configuration
const CONFIG = {
    maxCacheAge: 86400000,      // 24 heures en millisecondes
    networkTimeout: 5000,       // 5 secondes de timeout
    enableDebug: false,         // Logs de débogage
    cacheStrategy: 'cache-first' // 'cache-first' | 'network-first' | 'stale-while-revalidate'
};

// ==================== UTILITAIRES ====================

// Logger conditionnel
const log = (...args) => {
    if (CONFIG.enableDebug) {
        console.log('[SW]', ...args);
    }
};

// Vérifier si une URL doit être bypassée
const shouldBypass = (url) => {
    return BYPASS_ROUTES.some(route => url.includes(route));
};

// Vérifier si une réponse est valide
const isValidResponse = (response) => {
    return response && response.status === 200 && response.type !== 'error';
};

// Nettoyer les anciens caches
const cleanOldCaches = async () => {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('oda-marketplace-') && name !== CACHE_NAME
    );
    
    return Promise.all(
        oldCaches.map(cacheName => {
            log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
        })
    );
};

// ==================== INSTALLATION ====================

self.addEventListener('install', (event) => {
    log('📦 Installation du Service Worker...');
    
    event.waitUntil(
        (async () => {
            try {
                // Ouvrir le cache
                const cache = await caches.open(CACHE_NAME);
                
                // Mettre en cache les ressources CRITIQUES (priorité)
                log('⚡ Mise en cache des ressources critiques...');
                await cache.addAll(CRITICAL_ASSETS.map(url => new Request(url, {
                    cache: 'reload' // Forcer le téléchargement
                })));
                
                log('✅ Ressources critiques mises en cache');
                
                // Activer immédiatement
                await self.skipWaiting();
                
                // Mettre en cache les ressources SECONDAIRES (en arrière-plan)
                setTimeout(async () => {
                    try {
                        log('📦 Mise en cache des ressources secondaires...');
                        for (const url of SECONDARY_ASSETS) {
                            try {
                                await cache.add(new Request(url, { mode: 'no-cors' }));
                            } catch (e) {
                                log('⚠️ Échec cache secondaire:', url);
                            }
                        }
                        log('✅ Ressources secondaires mises en cache');
                    } catch (error) {
                        log('⚠️ Erreur cache secondaire:', error);
                    }
                }, 2000); // Après 2 secondes
                
            } catch (error) {
                console.error('❌ Erreur installation SW:', error);
            }
        })()
    );
});

// ==================== ACTIVATION ====================

self.addEventListener('activate', (event) => {
    log('🔄 Activation du Service Worker...');
    
    event.waitUntil(
        (async () => {
            try {
                // Nettoyer les anciens caches
                await cleanOldCaches();
                
                // Prendre le contrôle immédiatement
                await self.clients.claim();
                
                log('✅ Service Worker activé et prêt');
            } catch (error) {
                console.error('❌ Erreur activation SW:', error);
            }
        })()
    );
});

// ==================== STRATÉGIES DE CACHE ====================

// Stratégie: Cache First (par défaut - ultra rapide)
const cacheFirst = async (request) => {
    try {
        // 1. Chercher dans le cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            log('⚡ Cache HIT:', request.url);
            
            // Mise à jour en arrière-plan (optionnel)
            if (!request.url.includes('supabase')) {
                // Ne pas bloquer, mettre à jour en background
                event.waitUntil(
                    fetch(request)
                        .then(response => {
                            if (isValidResponse(response)) {
                                return caches.open(CACHE_NAME).then(cache => {
                                    cache.put(request, response.clone());
                                });
                            }
                        })
                        .catch(() => {}) // Ignorer les erreurs silencieusement
                );
            }
            
            return cachedResponse;
        }
        
        // 2. Si pas en cache, aller sur le réseau
        log('🌐 Cache MISS, requête réseau:', request.url);
        const networkResponse = await fetch(request);
        
        // 3. Mettre en cache la réponse
        if (isValidResponse(networkResponse)) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            log('💾 Mis en cache:', request.url);
        }
        
        return networkResponse;
        
    } catch (error) {
        log('❌ Erreur cache-first:', error);
        
        // Fallback: essayer de retourner quelque chose du cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            log('🔄 Fallback cache:', request.url);
            return cachedResponse;
        }
        
        // Si vraiment rien, retourner une erreur
        return new Response('Hors ligne', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
        });
    }
};

// Stratégie: Network First (pour données fraîches)
const networkFirst = async (request) => {
    try {
        // 1. Essayer le réseau avec timeout
        const networkPromise = fetch(request);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), CONFIG.networkTimeout)
        );
        
        const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
        
        // 2. Si succès, mettre en cache
        if (isValidResponse(networkResponse)) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            log('💾 Mis en cache (network-first):', request.url);
        }
        
        return networkResponse;
        
    } catch (error) {
        log('⚠️ Réseau échoué, fallback cache:', request.url);
        
        // 3. Fallback: cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            log('🔄 Fallback cache:', request.url);
            return cachedResponse;
        }
        
        // Si rien, erreur
        return new Response('Hors ligne', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
};

// Stratégie: Stale While Revalidate (pour équilibre)
const staleWhileRevalidate = async (request) => {
    const cache = await caches.open(CACHE_NAME);
    
    // 1. Récupérer depuis le cache immédiatement
    const cachedResponse = await cache.match(request);
    
    // 2. Mettre à jour en arrière-plan
    const fetchPromise = fetch(request).then(networkResponse => {
        if (isValidResponse(networkResponse)) {
            cache.put(request, networkResponse.clone());
            log('🔄 Mise à jour cache (SWR):', request.url);
        }
        return networkResponse;
    }).catch(() => {
        log('⚠️ Mise à jour échouée (SWR):', request.url);
    });
    
    // 3. Retourner le cache ou attendre le réseau
    return cachedResponse || fetchPromise;
};

// ==================== INTERCEPTION DES REQUÊTES ====================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorer les requêtes à bypasser
    if (shouldBypass(request.url)) {
        log('⏭️ Bypass:', request.url);
        return;
    }
    
    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') {
        log('⏭️ Non-GET:', request.method, request.url);
        return;
    }
    
    // Choisir la stratégie selon le type de ressource
    let strategy = cacheFirst; // Par défaut
    
    if (request.url.includes('/api/') || request.url.includes('supabase.co')) {
        // API: Network First (données fraîches)
        strategy = networkFirst;
    } else if (request.url.includes('.css') || request.url.includes('.js')) {
        // CSS/JS: Stale While Revalidate (équilibre)
        strategy = staleWhileRevalidate;
    }
    
    // Exécuter la stratégie
    event.respondWith(strategy(request));
});

// ==================== MESSAGES ====================

self.addEventListener('message', (event) => {
    log('📬 Message reçu:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                log('🗑️ Tous les caches supprimés');
                event.ports[0].postMessage({ success: true });
            })
        );
    }
    
    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

// ==================== NOTIFICATIONS ====================

self.addEventListener('notificationclick', (event) => {
    log('🔔 Notification cliquée');
    
    event.notification.close();
    
    // Ouvrir ou focus sur la fenêtre de l'app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Si une fenêtre existe déjà, la focus
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Sinon, ouvrir une nouvelle fenêtre
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// ==================== SYNC EN ARRIÈRE-PLAN ====================

self.addEventListener('sync', (event) => {
    log('🔄 Background Sync:', event.tag);
    
    if (event.tag === 'sync-products') {
        event.waitUntil(
            // Logique de synchronisation personnalisée
            fetch('/api/products')
                .then(response => response.json())
                .then(data => {
                    log('✅ Sync produits réussie');
                })
                .catch(error => {
                    log('❌ Sync produits échouée:', error);
                })
        );
    }
});

// ==================== PUSH NOTIFICATIONS ====================

self.addEventListener('push', (event) => {
    log('📬 Push reçu');
    
    const data = event.data ? event.data.json() : {};
    const title = data.title || '📢 ODA Marketplace';
    const options = {
        body: data.body || 'Nouvelle notification',
        icon: data.icon || '/oda.png',
        badge: '/oda.png',
        vibrate: [200, 100, 200],
        data: data,
        actions: data.actions || []
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ==================== LOGS ====================

log('🚀 Service Worker chargé - Version:', CACHE_VERSION);
log('📦 Stratégie:', CONFIG.cacheStrategy);
log('⏱️ Timeout réseau:', CONFIG.networkTimeout, 'ms');
log('🗄️ Nom du cache:', CACHE_NAME);
