// ============================================================
//  SERVICE WORKER — ODA MARKETPLACE
//  Version : 3.0 (notifications enrichies + background push)
//  Remplace l'ancien service-worker.js
// ============================================================

const CACHE_NAME   = 'oda-marketplace-v3.0';
const RUNTIME_CACHE = 'oda-runtime-v3.0';

const STATIC_ASSETS = [
    '/',
    '/oda-achats.html',
    '/favorie.html',
    '/boutique.html',
    '/boutiques.html',
    '/produit.html',
    '/manifest.json',
    '/notifications.js',
    '/oda1.png',
    '/oda-icon-192.png',
    '/oda-icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
];

// ==================== INSTALLATION ====================
self.addEventListener('install', event => {
    console.log('🔧 SW v3.0 — Installation');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => {
                console.log('📦 Ressources mises en cache');
                // NE PAS appeler skipWaiting ici automatiquement
                // On attend le signal du UpdateChecker pour activer proprement
            })
            .catch(err => console.error('❌ Erreur cache install:', err))
    );
});

// ==================== ACTIVATION ====================
self.addEventListener('activate', event => {
    console.log('🔄 SW v3.0 — Activation');
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names
                    .filter(n => n !== CACHE_NAME && n !== RUNTIME_CACHE)
                    .map(n => {
                        console.log('🗑️ Ancien cache supprimé:', n);
                        return caches.delete(n);
                    })
            ))
            .then(() => self.clients.claim())
            .then(() => console.log('✅ SW v3.0 actif'))
    );
});

// ==================== STRATÉGIE CACHE ====================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorer les requêtes non-GET et les API externes
    if (request.method !== 'GET') return;
    if (!url.origin.includes(location.hostname) && !url.href.includes('fonts.googleapis.com')) return;

    // Cache First pour les assets statiques
    if (STATIC_ASSETS.some(a => url.pathname === a || url.href === a)) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(res => {
                    caches.open(CACHE_NAME).then(c => c.put(request, res.clone()));
                    return res;
                });
            })
        );
        return;
    }

    // Network First pour le reste (API, produits, etc.)
    event.respondWith(
        fetch(request)
            .then(res => {
                if (res.ok) {
                    caches.open(RUNTIME_CACHE).then(c => c.put(request, res.clone()));
                }
                return res;
            })
            .catch(() => caches.match(request))
    );
});

// ==================== NOTIFICATIONS PUSH ENRICHIES ====================
self.addEventListener('push', event => {
    console.log('📬 Push reçu en arrière-plan');

    // Valeurs par défaut
    let payload = {
        title  : '🛍️ ODA Marketplace',
        body   : 'Nouveau produit disponible !',
        icon   : '/oda1.png',
        badge  : '/oda1.png',
        image  : null,
        tag    : 'oda-default',
        data   : { url: '/oda-achats.html' },
        actions: [
            { action: 'voir',    title: '👀 Voir le produit' },
            { action: 'ignorer', title: 'Ignorer'            },
        ],
        vibrate          : [200, 100, 200],
        requireInteraction: false,
        renotify         : true,
        silent           : false,
    };

    if (event.data) {
        try {
            const received = event.data.json();
            payload = { ...payload, ...received };
        } catch (e) {
            payload.body = event.data.text();
        }
    }

    // ── Notification avec image produit ────────────────────
    // L'image est affichée en grand sous le titre sur Android/Chrome
    const notifOptions = {
        body            : payload.body,
        icon            : payload.icon,
        badge           : payload.badge,
        tag             : payload.tag,
        data            : payload.data,
        actions         : payload.actions,
        vibrate         : payload.vibrate,
        requireInteraction: payload.requireInteraction,
        renotify        : payload.renotify,
        silent          : payload.silent,
    };

    // L'image n'est supportée que sur Chrome/Android — on la rajoute si présente
    if (payload.image) {
        notifOptions.image = payload.image;
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, notifOptions)
    );
});

// ==================== CLIC SUR NOTIFICATION ====================
self.addEventListener('notificationclick', event => {
    const { action, notification } = event;
    notification.close();

    console.log('👆 Clic notification:', action, notification.tag);

    // Action "ignorer" — on ferme juste
    if (action === 'ignorer') return;

    // URL de destination
    const url = notification.data?.url || '/oda-achats.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Chercher un onglet ODA déjà ouvert
                const existing = clientList.find(c =>
                    c.url.includes(location.origin)
                );
                if (existing) {
                    existing.focus();
                    // Envoyer un message à la page pour naviguer vers le produit
                    existing.postMessage({
                        type: 'NAVIGATE',
                        url,
                        productId: notification.data?.productId,
                    });
                    return;
                }
                // Sinon ouvrir un nouvel onglet
                return clients.openWindow(url);
            })
    );
});

// ==================== FERMETURE DE NOTIFICATION ====================
self.addEventListener('notificationclose', event => {
    console.log('❌ Notification fermée:', event.notification.tag);
});

// ==================== MESSAGES DU CLIENT ====================
self.addEventListener('message', event => {
    const { type } = event.data || {};

    // Demande de mise à jour (UpdateChecker)
    if (type === 'SKIP_WAITING') {
        console.log('🔄 SKIP_WAITING reçu — activation immédiate');
        self.skipWaiting();
    }

    // Notification locale (app ouverte — envoyée depuis la page)
    if (type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        self.registration.showNotification(title, {
            ...options,
            icon : options.icon  || '/oda1.png',
            badge: options.badge || '/oda1.png',
        });
    }

    // Ping de santé
    if (type === 'PING') {
        event.source?.postMessage({ type: 'PONG', version: CACHE_NAME });
    }
});

// ==================== BACKGROUND SYNC ====================
self.addEventListener('sync', event => {
    if (event.tag === 'sync-subscriptions') {
        event.waitUntil(
            // Placeholder — réabonnement auto si subscription expirée
            self.registration.pushManager.getSubscription()
                .then(sub => {
                    if (!sub) console.warn('⚠️ Subscription push perdue — réabonnement requis');
                })
        );
    }
});

// ==================== GESTION ERREURS ====================
self.addEventListener('error',             e => console.error('❌ SW Error:', e.error));
self.addEventListener('unhandledrejection', e => console.error('❌ SW Unhandled:', e.reason));

console.log('✅ Service Worker ODA v3.0 chargé');
