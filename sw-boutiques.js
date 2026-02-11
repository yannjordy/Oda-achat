// ==================== SERVICE WORKER POUR CACHE ====================
// À placer dans un fichier séparé nommé 'sw-boutiques.js'
const CACHE_NAME = 'boutiques-v1';
const urlsToCache = [
    '/boutiques.html',
    '/boutiques-styles.css',
    '/oda.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// ==================== CODE À AJOUTER DANS boutiques.html ====================
// À placer juste avant la balise </body>

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw-boutiques.js')
            .then(reg => console.log('✅ Service Worker enregistré'))
            .catch(err => console.log('❌ Erreur SW:', err));
    });
}

// Préchargement des ressources critiques
const preloadResources = () => {
    const criticalResources = [
        { href: '/boutiques-styles.css', as: 'style' },
        { href: '/oda.png', as: 'image' },
        { href: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', as: 'script' }
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.as === 'style') link.onload = function() { this.rel = 'stylesheet'; };
        document.head.appendChild(link);
    });
};

// Optimisation du chargement des images avec IntersectionObserver
const optimizedLazyLoad = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                if (src) {
                    // Utiliser une image en cache si disponible
                    caches.open(CACHE_NAME).then(cache => {
                        cache.match(src).then(response => {
                            if (response) {
                                response.blob().then(blob => {
                                    img.src = URL.createObjectURL(blob);
                                });
                            } else {
                                img.src = src;
                            }
                        });
                    });
                    img.classList.remove('lazy-load');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.01
    });

    document.querySelectorAll('.lazy-load').forEach(img => imageObserver.observe(img));
};

// Stockage local des données pour cache
const cacheData = {
    set: (key, data, ttl = 3600000) => { // TTL par défaut: 1 heure
        const item = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
    },
    
    get: (key) => {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp > parsed.ttl) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed.data;
    },
    
    clear: (key) => {
        localStorage.removeItem(key);
    }
};

// Optimisation du chargement des boutiques avec cache
const loadBoutiquesOptimized = async () => {
    const CACHE_KEY = 'boutiques_data';
    
    // Vérifier le cache d'abord
    const cachedData = cacheData.get(CACHE_KEY);
    if (cachedData) {
        console.log('📦 Chargement depuis le cache');
        displayBoutiques(cachedData);
        document.querySelector('.loader').style.display = 'none';
        // Charger en arrière-plan pour mise à jour
        fetchAndCacheBoutiques(CACHE_KEY);
        return;
    }
    
    // Sinon charger normalement
    await fetchAndCacheBoutiques(CACHE_KEY);
};

const fetchAndCacheBoutiques = async (cacheKey) => {
    try {
        const { data, error } = await window.supabase
            .from('boutiques')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Mettre en cache
        cacheData.set(cacheKey, data, 3600000); // 1 heure
        
        displayBoutiques(data);
        document.querySelector('.loader').style.display = 'none';
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur de chargement', 'error');
    }
};

// Compression des données en mémoire
const compressState = () => {
    // Nettoyer les anciennes entrées du localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('boutiques_')) {
            const item = localStorage.getItem(key);
            try {
                const parsed = JSON.parse(item);
                if (Date.now() - parsed.timestamp > 86400000) { // > 24h
                    localStorage.removeItem(key);
                }
            } catch (e) {
                localStorage.removeItem(key);
            }
        }
    }
};

// Préchargement conditionnel basé sur la connexion
const smartPreload = () => {
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        // Ne précharger que si bonne connexion
        if (connection.effectiveType === '4g' || connection.effectiveType === 'wifi') {
            preloadResources();
        }
    } else {
        preloadResources();
    }
};

// Débounce pour les événements fréquents
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Optimiser le scroll
const optimizedScroll = debounce(() => {
    // Logique de scroll ici
    optimizedLazyLoad();
}, 100);

// Initialisation optimisée
document.addEventListener('DOMContentLoaded', () => {
    smartPreload();
    compressState();
    loadBoutiquesOptimized();
    
    // Ajouter les écouteurs optimisés
    window.addEventListener('scroll', optimizedScroll, { passive: true });
    
    // Nettoyer périodiquement
    setInterval(compressState, 3600000); // Toutes les heures
});

// Préconnexion aux domaines externes
const addPreconnect = () => {
    const domains = [
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
    ];
    
    domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });
};

addPreconnect();
