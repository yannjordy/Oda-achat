

(function patchOdaInstantEntry() {

    /* ─── Clés du cache utilisées par CacheManager ─── */
    const CACHE_KEY_PRODUCTS  = 'oda_products';
    const CACHE_KEY_LIKES     = 'oda_likes';
    const CACHE_KEY_COMMENTS  = 'oda_comments';
    const CACHE_KEY_SHOPS     = 'oda_shops';

    /* ─── Vérifie qu'un cache existe (même expiré) ─── */
    function hasCacheData() {
        try {
            const raw = localStorage.getItem(CACHE_KEY_PRODUCTS);
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed.data) && parsed.data.length > 0;
        } catch {
            return false;
        }
    }

    /* ─── Lit le cache brut (ignore l'expiration) ─── */
    function loadCacheIgnoringExpiry() {
        function get(key) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) return null;
                return JSON.parse(raw).data;
            } catch { return null; }
        }
        return {
            products : get(CACHE_KEY_PRODUCTS)  || [],
            likes    : get(CACHE_KEY_LIKES)      || {},
            comments : get(CACHE_KEY_COMMENTS)   || {},
            shops    : get(CACHE_KEY_SHOPS)      || {},
        };
    }

    /* ─── Styles du bouton "Entrer maintenant" ─── */
    function injectButtonStyles() {
        if (document.getElementById('oda-instant-styles')) return;
        const style = document.createElement('style');
        style.id = 'oda-instant-styles';
        style.textContent = `
            #oda-instant-btn {
                margin-top: 24px;
                padding: 14px 32px;
                background: linear-gradient(135deg, #FF6B00, #FFA500);
                color: #fff;
                font-size: 1rem;
                font-weight: 700;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(255, 107, 0, 0.5);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                animation: odaPulse 1.8s infinite;
            }
            #oda-instant-btn:hover {
                transform: translateY(-2px) scale(1.04);
                box-shadow: 0 10px 28px rgba(255, 107, 0, 0.6);
            }
            #oda-instant-btn:active {
                transform: scale(0.97);
            }
            #oda-instant-hint {
                margin-top: 10px;
                color: rgba(255,255,255,0.75);
                font-size: 0.78rem;
            }
            @keyframes odaPulse {
                0%, 100% { box-shadow: 0 6px 20px rgba(255,107,0,0.5); }
                50%       { box-shadow: 0 6px 32px rgba(255,107,0,0.85); }
            }
        `;
        document.head.appendChild(style);
    }

    /* ─── Ajoute le bouton dans le loader violet (lp-box) ─── */
    function injectButtonIntoLoader() {
        // Attendre que le loader soit rendu dans le DOM
        const interval = setInterval(() => {
            const box = document.querySelector('.lp-box');
            if (!box) return;

            clearInterval(interval);
            injectButtonStyles();

            const btn = document.createElement('button');
            btn.id          = 'oda-instant-btn';
            btn.textContent = '⚡ Entrer maintenant';

            const hint = document.createElement('p');
            hint.id          = 'oda-instant-hint';
            hint.textContent = 'Données du cache — sync Supabase en arrière-plan';

            box.appendChild(btn);
            box.appendChild(hint);

            btn.addEventListener('click', handleInstantEntry);
        }, 50);
    }

    /* ─── Action du bouton : skip loader + afficher depuis cache ─── */
    function handleInstantEntry() {
        const btn = document.getElementById('oda-instant-btn');
        if (btn) {
            btn.disabled        = true;
            btn.textContent     = '⏳ Chargement…';
            btn.style.opacity   = '0.7';
        }

        /* 1. Forcer le LoadingProgress à se terminer immédiatement */
        if (window.loadingProgress) {
            window.loadingProgress.complete();
        } else {
            // Fallback : masquer le loader directement
            const overlay = document.getElementById('lpOverlay');
            if (overlay) {
                overlay.style.transition = 'opacity 0.3s';
                overlay.style.opacity    = '0';
                setTimeout(() => overlay.remove(), 350);
            }
        }

        /* 2. Charger les données depuis le cache (expiration ignorée) */
        const staleData = loadCacheIgnoringExpiry();

        /* 3. Appliquer immédiatement à l'interface */
        if (typeof _applyLoadedData === 'function') {
            _applyLoadedData(staleData);
            console.log('⚡ Instant entry — données cache appliquées');
        } else {
            // Si _applyLoadedData n'est pas encore dispo, on réessaie dans 200ms
            setTimeout(() => {
                if (typeof _applyLoadedData === 'function') {
                    _applyLoadedData(staleData);
                }
            }, 200);
        }

        /* 4. Lancer la synchronisation Supabase en arrière-plan (silencieuse) */
        setTimeout(syncSupabaseInBackground, 1500);
    }

    /* ─── Sync silencieuse en arrière-plan ─── */
    async function syncSupabaseInBackground() {
        if (!window.supabase) {
            console.warn('⚠️ Supabase non disponible pour la sync background');
            return;
        }
        console.log('🔄 Sync Supabase en arrière-plan…');
        try {
            const loader = new OptimizedDataLoader(window.supabase);

            // Forcer le rechargement depuis serveur (bypass cache)
            const freshData = await loader._fromServer();

            // Mettre à jour l'UI discrètement
            if (typeof _applyLoadedData === 'function') {
                _applyLoadedData(loader.data);
                console.log('✅ Sync background terminée — UI mise à jour');
            }
        } catch (err) {
            console.warn('⚠️ Sync background échouée (hors ligne ?):', err.message);
            // Pas d'alerte utilisateur — l'app reste fonctionnelle avec le cache
        }
    }

    /* ─── Interception du DOMContentLoaded ─── */
    // On surcharge le chargement initial pour injecter le bouton
    // seulement si un cache existe
    const originalInit = document.addEventListener.bind(document);

    document.addEventListener('DOMContentLoaded', () => {
        if (hasCacheData()) {
            console.log('⚡ Cache détecté — bouton "Entrer maintenant" activé');
            // Attendre que LoadingProgress.start() soit appelé
            setTimeout(injectButtonIntoLoader, 10);
        } else {
            console.log('ℹ️ Pas de cache — chargement normal Supabase');
        }
    });

    console.log('✅ ODA Instant Entry — patch chargé');

})();
