

'use strict';



const ODA_CACHE_CONFIG = {
    VERSION: 'v4',                    // Incrementer pour invalider tout le cache
    PREFIX: 'oda_boutiques_',

    // Durées de vie par type de données (en millisecondes)
    TTL: {
        shops:       6 * 60 * 60 * 1000,   
        products:    2 * 60 * 60 * 1000,   
        likes:       30 * 60 * 1000,       
        subscribers: 15 * 60 * 1000,       
        auth:        60 * 60 * 1000,       
        compiled:    30 * 60 * 1000,       

    // Taille max localStorage avant nettoyage (bytes)
    MAX_STORAGE_SIZE: 4 * 1024 * 1024,     // 4 MB

    // Délai avant refresh silencieux en arrière-plan (ms)
    BACKGROUND_REFRESH_DELAY: 2000,

    // Nombre de requêtes en parallèle max
    MAX_PARALLEL_REQUESTS: 4,
};


class MemoryCache {
    constructor() {
        this._store = new Map();
        this._hits = 0;
        this._misses = 0;
    }

    set(key, data, ttlMs) {
        this._store.set(key, {
            data,
            expiresAt: Date.now() + ttlMs,
            createdAt: Date.now(),
        });
    }

    get(key) {
        const entry = this._store.get(key);
        if (!entry) { this._misses++; return null; }
        if (Date.now() > entry.expiresAt) {
            this._store.delete(key);
            this._misses++;
            return null;
        }
        this._hits++;
        return entry.data;
    }

    has(key) {
        const entry = this._store.get(key);
        if (!entry) return false;
        if (Date.now() > entry.expiresAt) { this._store.delete(key); return false; }
        return true;
    }

    invalidate(key) { this._store.delete(key); }
    invalidateAll() { this._store.clear(); }

    get stats() {
        return {
            hits: this._hits,
            misses: this._misses,
            size: this._store.size,
            ratio: this._hits + this._misses > 0
                ? ((this._hits / (this._hits + this._misses)) * 100).toFixed(1) + '%'
                : '0%'
        };
    }
}

/* ================================================================
   3. COUCHE LOCALSTORAGE (persistant entre sessions)
   ================================================================ */

class StorageCache {
    constructor(prefix, version) {
        this._prefix = prefix + version + '_';
        this._cleanOldVersions(prefix, version);
    }

    // Nettoyer les anciennes versions au démarrage
    _cleanOldVersions(prefix, currentVersion) {
        try {
            const keysToDelete = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix) && !key.startsWith(this._prefix)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(k => localStorage.removeItem(k));
            if (keysToDelete.length > 0) {
                console.log(`🧹 Cache: ${keysToDelete.length} entrées obsolètes supprimées`);
            }
        } catch { /* Silencieux */ }
    }

    set(key, data, ttlMs) {
        try {
            const entry = {
                d: data,                         // data (compressé mentalement)
                e: Date.now() + ttlMs,            // expiresAt
                c: Date.now(),                    // createdAt
            };
            const serialized = JSON.stringify(entry);

            // Vérifier la taille avant d'écrire
            if (serialized.length > ODA_CACHE_CONFIG.MAX_STORAGE_SIZE / 4) {
                console.warn('⚠️ Cache: entrée trop grande, ignorée');
                return false;
            }

            this._ensureSpace(serialized.length);
            localStorage.setItem(this._prefix + key, serialized);
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                this._emergencyCleanup();
                try {
                    localStorage.setItem(this._prefix + key, JSON.stringify({ d: data, e: Date.now() + ttlMs, c: Date.now() }));
                } catch { return false; }
            }
            return false;
        }
    }

    get(key) {
        try {
            const raw = localStorage.getItem(this._prefix + key);
            if (!raw) return null;
            const entry = JSON.parse(raw);
            if (Date.now() > entry.e) {
                localStorage.removeItem(this._prefix + key);
                return null;
            }
            return entry.d;
        } catch {
            return null;
        }
    }

    getStale(key) {
        // Retourne même si expiré (pour affichage immédiat pendant refresh)
        try {
            const raw = localStorage.getItem(this._prefix + key);
            if (!raw) return null;
            const entry = JSON.parse(raw);
            return { data: entry.d, expired: Date.now() > entry.e, age: Date.now() - entry.c };
        } catch { return null; }
    }

    has(key) {
        return this.get(key) !== null;
    }

    invalidate(key) {
        try { localStorage.removeItem(this._prefix + key); } catch { }
    }

    invalidatePattern(pattern) {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(this._prefix) && k.includes(pattern)) keys.push(k);
            }
            keys.forEach(k => localStorage.removeItem(k));
        } catch { }
    }

    _ensureSpace(neededBytes) {
        try {
            let totalSize = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k) totalSize += (localStorage.getItem(k) || '').length * 2;
            }
            if (totalSize + neededBytes > ODA_CACHE_CONFIG.MAX_STORAGE_SIZE) {
                this._emergencyCleanup();
            }
        } catch { }
    }

    _emergencyCleanup() {
        // Supprimer les plus anciennes entrées ODA d'abord
        try {
            const odaEntries = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(this._prefix)) {
                    try {
                        const entry = JSON.parse(localStorage.getItem(k));
                        odaEntries.push({ key: k, createdAt: entry.c || 0 });
                    } catch { }
                }
            }
            // Trier par âge et supprimer la moitié
            odaEntries.sort((a, b) => a.createdAt - b.createdAt);
            odaEntries.slice(0, Math.ceil(odaEntries.length / 2))
                      .forEach(e => localStorage.removeItem(e.key));
            console.log('🧹 Cache: nettoyage d\'urgence effectué');
        } catch { }
    }

    getStorageInfo() {
        let totalSize = 0;
        let odaSize = 0;
        let odaCount = 0;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                const v = localStorage.getItem(k) || '';
                const bytes = v.length * 2;
                totalSize += bytes;
                if (k && k.startsWith(this._prefix)) {
                    odaSize += bytes;
                    odaCount++;
                }
            }
        } catch { }
        return {
            total: (totalSize / 1024).toFixed(1) + ' KB',
            oda: (odaSize / 1024).toFixed(1) + ' KB',
            entries: odaCount,
        };
    }
}

/* ================================================================
   4. GESTIONNAIRE DE CACHE PRINCIPAL (orchestrateur)
   ================================================================ */

class OdaCacheManager {
    constructor() {
        this._mem = new MemoryCache();
        this._storage = new StorageCache(
            ODA_CACHE_CONFIG.PREFIX,
            ODA_CACHE_CONFIG.VERSION
        );
        this._pendingRequests = new Map(); // Déduplication des requêtes en vol
        this._backgroundRefreshTimer = null;
        this._isRefreshing = false;

        console.log('⚡ OdaCacheManager initialisé');
    }

    /**
     * Écrire dans les deux couches
     */
    write(key, data, ttlMs) {
        this._mem.set(key, data, ttlMs);
        this._storage.set(key, data, ttlMs);
    }

    /**
     * Lire : Mémoire → localStorage → null
     */
    read(key) {
        // Couche 1 : Mémoire (instantané)
        const mem = this._mem.get(key);
        if (mem !== null) return { data: mem, source: 'memory', fresh: true };

        // Couche 2 : localStorage (rapide)
        const stored = this._storage.getStale(key);
        if (stored) {
            // Remettre en mémoire pour les prochains accès
            if (!stored.expired) {
                const ttlRemaining = ODA_CACHE_CONFIG.TTL[key] || 60000;
                this._mem.set(key, stored.data, ttlRemaining);
            }
            return {
                data: stored.data,
                source: 'storage',
                fresh: !stored.expired,
                age: stored.age,
            };
        }

        return null;
    }

    /**
     * Vérifier si une clé est fraîche (pas expirée)
     */
    isFresh(key) {
        if (this._mem.has(key)) return true;
        return this._storage.has(key);
    }

    /**
     * Dédupliquer les requêtes réseau identiques en vol
     */
    async dedup(key, fetchFn) {
        if (this._pendingRequests.has(key)) {
            console.log(`🔄 Cache: déduplication requête "${key}"`);
            return this._pendingRequests.get(key);
        }
        const promise = fetchFn().finally(() => this._pendingRequests.delete(key));
        this._pendingRequests.set(key, promise);
        return promise;
    }

    /**
     * Invalider les données d'une boutique spécifique
     */
    invalidateShop(shopId) {
        this._mem.invalidate('compiled');
        this._storage.invalidate('compiled');
        this._storage.invalidatePattern(`shop_${shopId}`);
        console.log(`♻️ Cache invalidé pour boutique ${shopId}`);
    }

    /**
     * Invalider tout le cache
     */
    flush() {
        this._mem.invalidateAll();
        this._storage.invalidatePattern('');
        console.log('🗑️ Cache totalement vidé');
    }

    get memStats() { return this._mem.stats; }
    get storageInfo() { return this._storage.getStorageInfo(); }
}

/* ================================================================
   5. CHARGEUR DE DONNÉES AVEC CACHE
   ================================================================ */

class OdaDataLoader {
    constructor(supabaseClient, cacheManager) {
        this._db = supabaseClient;
        this._cache = cacheManager;
    }

    /**
     * Charge toutes les données nécessaires
     * Stratégie : Cache-First avec Stale-While-Revalidate
     *
     * @param {Function} onProgress   (pct, label) callback
     * @returns {{ data, fromCache, stale }}
     */
    async loadAll(onProgress = () => {}) {
        const progress = onProgress;

        // ── ÉTAPE 1 : Vérifier le cache compilé (toutes données assemblées)
        const compiled = this._cache.read('compiled');
        if (compiled) {
            progress(95, compiled.fresh ? '✓ Depuis le cache' : '⚡ Cache (actualisation...)');
            console.log(`📦 Cache ${compiled.source}: données boutiques (fresh: ${compiled.fresh})`);

            // Si stale → déclencher refresh silencieux en arrière-plan
            if (!compiled.fresh) {
                this._scheduleBackgroundRefresh(progress);
            }

            return { data: compiled.data, fromCache: true, stale: !compiled.fresh };
        }

        // ── ÉTAPE 2 : Pas de cache → charger depuis le réseau
        progress(5, 'Connexion au serveur...');
        console.log('🌐 Chargement réseau (pas de cache)');

        const data = await this._fetchAllFromNetwork(progress);

        // Sauvegarder le résultat compilé
        this._cache.write('compiled', data, ODA_CACHE_CONFIG.TTL.compiled);
        progress(100, '✓ Chargement terminé');

        return { data, fromCache: false, stale: false };
    }

    /**
     * Récupère toutes les données depuis Supabase en parallèle
     */
    async _fetchAllFromNetwork(progress) {
        // Lancer toutes les requêtes EN PARALLÈLE (pas en séquence !)
        progress(10, 'Chargement en parallèle...');

        const [shops, productData, likesRaw, subscriberCounts] = await Promise.all([
            this._fetchShops(),
            this._fetchProductData(),
            this._fetchLikesRaw(),
            this._fetchSubscriberCounts(),
        ]);

        progress(75, 'Assemblage des données...');

        // Sauvegarder chaque couche individuellement aussi
        this._cache.write('shops',       shops,            ODA_CACHE_CONFIG.TTL.shops);
        this._cache.write('productData', productData,      ODA_CACHE_CONFIG.TTL.products);
        this._cache.write('likesRaw',    likesRaw,         ODA_CACHE_CONFIG.TTL.likes);
        this._cache.write('subscribers', subscriberCounts, ODA_CACHE_CONFIG.TTL.subscribers);

        progress(85, 'Calcul des classements...');

        // Assembler les données finales
        return this._compile(shops, productData, likesRaw, subscriberCounts);
    }

    async _fetchShops() {
        return this._cache.dedup('fetch_shops', async () => {
            // Essayer le cache individuel d'abord
            const cached = this._cache.read('shops');
            if (cached?.fresh) return cached.data;

            const { data, error } = await this._db
                .from('parametres_boutique')
                .select('user_id, config');
            if (error) throw error;

            const shops = {};
            data.forEach(row => {
                const cfg = row.config || {};
                shops[row.user_id] = {
                    id: row.user_id,
                    nom: cfg?.general?.nom || 'Boutique',
                    slug: cfg?.identifiant?.slug || cfg?.slug || null,
                    logo: cfg?.apparence?.logo || cfg?.logo || null,
                    couleur: cfg?.apparence?.couleurPrimaire || cfg?.couleurPrimaire || null,
                    description: cfg?.general?.description || '',
                };
            });
            return shops;
        });
    }

    async _fetchProductData() {
        return this._cache.dedup('fetch_products', async () => {
            const cached = this._cache.read('productData');
            if (cached?.fresh) return cached.data;

            // Une seule requête pour les produits (pas deux comme avant !)
            const { data, error } = await this._db
                .from('produits')
                .select('id, user_id')
                .eq('statut', 'published')
                .gt('stock', 0);
            if (error) throw error;

            // Compter les produits ET construire la map id→userId en une passe
            const counts = {};
            const idToShop = {};
            data.forEach(p => {
                counts[p.user_id] = (counts[p.user_id] || 0) + 1;
                idToShop[p.id] = p.user_id;
            });
            return { counts, idToShop };
        });
    }

    async _fetchLikesRaw() {
        return this._cache.dedup('fetch_likes', async () => {
            const cached = this._cache.read('likesRaw');
            if (cached?.fresh) return cached.data;

            const { data, error } = await this._db
                .from('product_likes')
                .select('product_id');
            if (error) throw error;
            return data;
        });
    }

    async _fetchSubscriberCounts() {
        return this._cache.dedup('fetch_subscribers', async () => {
            const cached = this._cache.read('subscribers');
            if (cached?.fresh) return cached.data;

            try {
                const { data, error } = await this._db
                    .from('shop_follows')
                    .select('shop_id');
                if (error) return {};
                const counts = {};
                data.forEach(r => { counts[r.shop_id] = (counts[r.shop_id] || 0) + 1; });
                return counts;
            } catch { return {}; }
        });
    }

    /**
     * Assemble toutes les données en la structure finale utilisée par l'UI
     */
    _compile(shops, productData, likesRaw, subscriberCounts) {
        const { counts: productCounts, idToShop } = productData;

        // Calculer les likes par boutique
        const shopLikes = {};
        likesRaw.forEach(like => {
            const shopId = idToShop[like.product_id];
            if (shopId) shopLikes[shopId] = (shopLikes[shopId] || 0) + 1;
        });

        // Construire la liste finale enrichie
        const DEFAULT_COLORS = ['#FF6B00', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
        const getDefaultColor = id => {
            const hash = [...String(id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
            return DEFAULT_COLORS[hash % DEFAULT_COLORS.length];
        };

        let allShops = Object.values(shops).map(shop => ({
            ...shop,
            couleur: shop.couleur || getDefaultColor(shop.id),
            totalLikes: shopLikes[shop.id] || 0,
            productCount: productCounts[shop.id] || 0,
            subscriberCount: subscriberCounts[shop.id] || 0,
        })).filter(s => s.nom !== 'Boutique' || s.productCount > 0);

        // Classer : Top 10 par likes, reste à conserver pour mélange côté UI
        const sorted = [...allShops].sort((a, b) => b.totalLikes - a.totalLikes);
        const top10 = sorted.slice(0, 10);
        const rest = sorted.slice(10);

        return { allShops, top10, rest, shopLikes, productCounts, subscriberCounts };
    }

    /**
     * Refresh silencieux en arrière-plan (ne bloque pas l'UI)
     */
    _scheduleBackgroundRefresh(progress) {
        if (this._isRefreshing) return;
        console.log('🔄 Refresh silencieux planifié dans 2s...');

        setTimeout(async () => {
            if (this._isRefreshing) return;
            this._isRefreshing = true;

            try {
                // Invalider le cache compilé pour forcer le rechargement réseau
                this._cache._mem.invalidate('compiled');
                this._cache._storage.invalidate('compiled');

                const freshData = await this._fetchAllFromNetwork(() => {});
                this._cache.write('compiled', freshData, ODA_CACHE_CONFIG.TTL.compiled);

                // Notifier l'UI qu'il y a des données fraîches
                window.dispatchEvent(new CustomEvent('oda:data:refreshed', {
                    detail: { data: freshData }
                }));

                progress(100, '✓ Données actualisées');
                console.log('✅ Refresh silencieux terminé');
            } catch (e) {
                console.warn('⚠️ Refresh silencieux échoué:', e.message);
            } finally {
                this._isRefreshing = false;
            }
        }, ODA_CACHE_CONFIG.BACKGROUND_REFRESH_DELAY);
    }
}

/* ================================================================
   6. PRÉCHARGEUR — S'active depuis la PAGE D'ORIGINE
      (ex: oda-achats.html, avant même que l'user clique)
   ================================================================ */

class OdaPrefetcher {
    constructor(cacheManager) {
        this._cache = cacheManager;
        this._prefetchStarted = false;
    }

    /**
     * Attacher aux liens vers pro.html pour précharger au survol
     * Appeler depuis oda-achats.html
     */
    attachToLinks(selector = 'a[href*="boutiques"], a[href*="pro.html"]') {
        const links = document.querySelectorAll(selector);
        if (links.length === 0) return;

        const onHover = () => {
            if (!this._prefetchStarted && window.db) {
                this._prefetchStarted = true;
                console.log('🚀 Préchargement boutiques déclenché au survol');
                this._prefetch();
            }
        };

        links.forEach(link => {
            link.addEventListener('mouseenter', onHover, { once: true });
            link.addEventListener('touchstart', onHover, { once: true, passive: true });
        });

        console.log(`🔗 Préchargeur attaché à ${links.length} lien(s)`);
    }

    /**
     * Précharger immédiatement (appeler si vous savez que l'utilisateur va naviguer)
     */
    async _prefetch() {
        if (!window.db) return;
        try {
            const loader = new OdaDataLoader(window.db, this._cache);
            // Vérifier si déjà en cache frais
            if (!this._cache.isFresh('compiled')) {
                await loader._fetchAllFromNetwork(() => {});
                console.log('✅ Données préchargées avec succès');
            } else {
                console.log('📦 Données déjà en cache — préchargement inutile');
            }
        } catch (e) {
            console.warn('Préchargement échoué:', e.message);
        }
    }

    /**
     * Précharger après un délai (ex: après DOMContentLoaded, si on sait qu'ils vont naviguer)
     */
    prefetchAfter(delayMs = 3000) {
        setTimeout(() => {
            if (!this._prefetchStarted) {
                this._prefetchStarted = true;
                this._prefetch();
            }
        }, delayMs);
    }
}

/* ================================================================
   7. REMPLACEMENT DE LA FONCTION init() DE pro.html
      Ce code REMPLACE le init() original pour intégrer le cache
   ================================================================ */

// Instancier le gestionnaire de cache globalement
window.ODA = window.ODA || {};
window.ODA.cache = new OdaCacheManager();
window.ODA.prefetcher = new OdaPrefetcher(window.ODA.cache);

/**
 * Nouveau init() ultra-rapide — remplace l'original dans pro.html
 * Injecter APRÈS le script principal ou remplacer init()
 */
async function initWithCache() {
    const cacheManager = window.ODA.cache;
    const t0 = performance.now();

    try {
        // ── Afficher les skeletons IMMÉDIATEMENT (avant toute requête)
        const top10Grid = document.getElementById('top10Grid');
        const allGrid   = document.getElementById('allShopsGrid');
        if (top10Grid) renderSkeletons(top10Grid, 4);
        if (allGrid)   renderSkeletons(allGrid, 6);

        initEventListeners();

        // ── Auth en arrière-plan (non-bloquant)
        const authPromise = initAuth();

        // ── Charger les données (cache-first !)
        setLoaderProgress(5, 'Vérification du cache...');
        const loader = new OdaDataLoader(db, cacheManager);

        const result = await loader.loadAll((pct, label) => {
            setLoaderProgress(pct, label);
        });

        const { data, fromCache, stale } = result;

        // ── Injecter les données dans STATE
        STATE.allShops        = data.allShops;
        STATE.top10           = data.top10;
        STATE.rest            = shuffleArray(data.rest);
        STATE.restFiltered    = [...STATE.rest];
        STATE.shopLikes       = data.shopLikes;
        STATE.shopProductCounts    = data.productCounts;
        STATE.shopSubscriberCounts = data.subscriberCounts;

        // ── Rendre l'UI IMMÉDIATEMENT
        renderTop10();
        renderAllShops();
        updateHeaderStats();

        const elapsed = (performance.now() - t0).toFixed(0);
        setLoaderProgress(100, fromCache
            ? `⚡ ${elapsed}ms (depuis cache${stale ? ' — actualisation...' : ''})`
            : `✓ ${elapsed}ms`
        );
        setTimeout(hideLoader, fromCache ? 200 : 500);

        // ── Attendre auth et charger les abonnements
        await authPromise;
        if (STATE.currentUser) {
            await loadSubscriptions();
        }

        // ── Écouter le refresh silencieux pour mettre à jour l'UI
        window.addEventListener('oda:data:refreshed', (e) => {
            const fresh = e.detail.data;
            // Mettre à jour STATE avec les nouvelles données
            STATE.allShops = fresh.allShops;
            STATE.top10    = fresh.top10;
            STATE.rest     = shuffleArray(fresh.rest);
            STATE.restFiltered = [...STATE.rest];
            STATE.shopLikes = fresh.shopLikes;
            STATE.shopProductCounts = fresh.productCounts;
            STATE.shopSubscriberCounts = fresh.subscriberCounts;
            // Re-render silencieux
            renderTop10();
            filterAndSort();
            updateHeaderStats();
            showToast('✓ Données actualisées', 'info');
            console.log('🔄 UI mis à jour avec les données fraîches');
        });

        console.log(`⚡ ODA Boutiques: ${elapsed}ms (${fromCache ? 'cache' : 'réseau'})`);
        console.log('📊 Stats cache mémoire:', cacheManager.memStats);

    } catch (err) {
        console.error('❌ Init error:', err);
        setLoaderProgress(100, 'Erreur de chargement');
        showToast('❌ ' + (err.message || 'Erreur de chargement'), 'error');
        setTimeout(hideLoader, 1500);
    }
}

/* ================================================================
   8. GESTION DU CACHE LORS DES ACTIONS UTILISATEUR
   ================================================================ */

/**
 * Invalider le cache abonnés quand l'utilisateur s'abonne/se désabonne
 * Appeler dans toggleSubscribe() après succès
 */
function invalidateSubscriberCache(shopId) {
    const cache = window.ODA?.cache;
    if (!cache) return;

    // Invalider le cache compilé (contient les subscriber counts)
    cache._mem.invalidate('compiled');
    cache._storage.invalidate('compiled');
    cache._mem.invalidate('subscribers');
    cache._storage.invalidate('subscribers');

    console.log(`♻️ Cache abonnés invalidé pour boutique ${shopId}`);
}

// Patcher toggleSubscribe pour invalider le cache après succès
const _originalToggleSubscribe = window.toggleSubscribe;
window.toggleSubscribe = async function(shopId, btnEl) {
    if (_originalToggleSubscribe) {
        await _originalToggleSubscribe(shopId, btnEl);
        // Invalider après l'action
        invalidateSubscriberCache(shopId);
    }
};

/* ================================================================
   9. REMPLACER init() PAR initWithCache() AU DÉMARRAGE
   ================================================================ */

// Overrider la fonction init originale
window._originalInit = window.init;
window.init = initWithCache;

// Si le DOM est déjà chargé, relancer
if (document.readyState !== 'loading') {
    // Annuler l'init original s'il a déjà été planifié et relancer le nôtre
    setTimeout(initWithCache, 0);
} else {
    document.addEventListener('DOMContentLoaded', initWithCache, { once: true });
}

/* ================================================================
   10. UTILITAIRES DÉVELOPPEUR (console)
   ================================================================ */

window.ODA.dev = {
    /**
     * Afficher les stats du cache dans la console
     */
    stats() {
        const cache = window.ODA.cache;
        console.group('📊 ODA Cache Stats');
        console.log('Mémoire:', cache.memStats);
        console.log('Storage:', cache.storageInfo);
        console.groupEnd();
    },

    /**
     * Vider le cache et recharger
     */
    flush() {
        window.ODA.cache.flush();
        console.log('🗑️ Cache vidé — rechargement...');
        location.reload();
    },

    /**
     * Forcer un refresh immédiat depuis le réseau
     */
    async refresh() {
        console.log('🔄 Refresh forcé...');
        window.ODA.cache._mem.invalidate('compiled');
        window.ODA.cache._storage.invalidate('compiled');
        await initWithCache();
    },
};



console.log('⚡ oda-cache.js chargé — Cache multi-couches actif');