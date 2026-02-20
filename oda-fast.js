/**
 * oda-fast.js — Chargement instantané pour pro.html
 * ═══════════════════════════════════════════════════
 * Remplace les 5 requêtes lentes par 1 seul appel RPC
 * + Cache localStorage qui rend la page instantanée dès la 2ème visite
 *
 * INSTALLATION : ajouter dans pro.html, AVANT le </body>
 *   <script src="oda-fast.js"></script>
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     CONFIG CACHE
  ────────────────────────────────────────────── */
  const CACHE_KEY     = 'oda_boutiques_v1';
  const CACHE_TTL_MS  = 20 * 60 * 1000;   // 20 min → affichage depuis cache
  const STALE_TTL_MS  = 60 * 60 * 1000;   // 1h  → refresh silencieux autorisé

  /* ──────────────────────────────────────────────
     CACHE localStorage (lecture/écriture)
  ────────────────────────────────────────────── */
  function cacheRead() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry || !entry.data) return null;
      const age = Date.now() - entry.ts;
      return {
        data:  entry.data,
        fresh: age < CACHE_TTL_MS,   // frais → afficher directement
        stale: age < STALE_TTL_MS,   // périmé mais utilisable
      };
    } catch { return null; }
  }

  function cacheWrite(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch (e) {
      // Quota dépassé → vider les vieilles entrées ODA
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('oda_')) localStorage.removeItem(k);
      }
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); }
      catch { /* silencieux */ }
    }
  }

  function cacheInvalidate() {
    try { localStorage.removeItem(CACHE_KEY); } catch { }
  }

  /* ──────────────────────────────────────────────
     APPEL RPC UNIQUE (remplace les 5 requêtes)
  ────────────────────────────────────────────── */
  async function fetchFromServer() {
    // ① Appel RPC — 1 seule requête, tout calculé côté SQL
    const { data, error } = await db.rpc('get_boutiques_summary');

    if (error) {
      console.error('RPC error:', error.message);
      throw error;
    }

    // ② Transformer le résultat plat en structure STATE
    const DEFAULT_COLORS = ['#FF6B00','#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4'];
    const colorFor = id => {
      const h = [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0);
      return DEFAULT_COLORS[h % DEFAULT_COLORS.length];
    };

    const allShops = data.map(row => ({
      id:              row.shop_id,
      nom:             row.nom             || 'Boutique',
      slug:            row.slug            || null,
      logo:            row.logo            || null,
      couleur:         row.couleur         || colorFor(row.shop_id),
      description:     row.description     || '',
      productCount:    Number(row.product_count)    || 0,
      totalLikes:      Number(row.total_likes)      || 0,
      subscriberCount: Number(row.subscriber_count) || 0,
    })).filter(s => s.nom !== 'Boutique' || s.productCount > 0);

    return allShops;
  }

  /* ──────────────────────────────────────────────
     INJECTER DANS STATE + RENDER
  ────────────────────────────────────────────── */
  function applyToState(allShops) {
    const sorted = [...allShops].sort((a, b) => b.totalLikes - a.totalLikes);
    STATE.allShops  = allShops;
    STATE.top10     = sorted.slice(0, CFG.TOP_COUNT);
    STATE.rest      = shuffleArray(sorted.slice(CFG.TOP_COUNT));
    STATE.restFiltered = [...STATE.rest];

    // Reconstruire les maps de stats (utilisées par toggleSubscribe etc.)
    STATE.shopLikes            = {};
    STATE.shopProductCounts    = {};
    STATE.shopSubscriberCounts = {};
    allShops.forEach(s => {
      STATE.shopLikes[s.id]            = s.totalLikes;
      STATE.shopProductCounts[s.id]    = s.productCount;
      STATE.shopSubscriberCounts[s.id] = s.subscriberCount;
    });
  }

  function renderAll() {
    renderTop10();
    renderAllShops();
    updateHeaderStats();
  }

  /* ──────────────────────────────────────────────
     REFRESH SILENCIEUX (en arrière-plan)
  ────────────────────────────────────────────── */
  async function backgroundRefresh() {
    try {
      const fresh = await fetchFromServer();
      cacheWrite(fresh);
      applyToState(fresh);
      renderAll();
      if (STATE.currentUser) updateAllSubscribeButtons();
      console.log('✅ Refresh silencieux terminé — UI mis à jour');
    } catch (e) {
      console.warn('⚠️ Refresh silencieux échoué:', e.message);
    }
  }

  /* ──────────────────────────────────────────────
     NOUVEAU init() — remplace l'original
  ────────────────────────────────────────────── */
  async function fastInit() {
    const t0 = performance.now();

    // Afficher skeletons immédiatement (0 délai)
    const g1 = document.getElementById('top10Grid');
    const g2 = document.getElementById('allShopsGrid');
    if (g1) renderSkeletons(g1, 4);
    if (g2) renderSkeletons(g2, 6);
    initEventListeners();

    // ── Lire le cache
    const cached = cacheRead();

    if (cached && cached.fresh) {
      // ════ CAS 1 : Cache frais → affichage IMMÉDIAT, 0 réseau ════
      setLoaderProgress(100, '⚡ Instantané');
      applyToState(cached.data);
      renderAll();
      hideLoader();

      const ms = (performance.now() - t0).toFixed(0);
      console.log(`⚡ pro.html chargé depuis cache en ${ms}ms`);

      // Auth + abonnements en arrière-plan (non-bloquant)
      initAuth().then(() => {
        if (STATE.currentUser) loadSubscriptions();
      });

      // Si proche de l'expiration, refresh silencieux
      setTimeout(backgroundRefresh, 5000);
      return;
    }

    if (cached && cached.stale) {
      // ════ CAS 2 : Cache périmé → afficher l'ancien, refresh en arrière-plan ════
      setLoaderProgress(100, '📦 Cache (actualisation...)');
      applyToState(cached.data);
      renderAll();
      hideLoader();

      const ms = (performance.now() - t0).toFixed(0);
      console.log(`📦 pro.html chargé depuis cache périmé en ${ms}ms — refresh en cours`);

      // Auth en arrière-plan
      initAuth().then(() => {
        if (STATE.currentUser) loadSubscriptions();
      });

      // Refresh immédiat en arrière-plan
      setTimeout(backgroundRefresh, 500);
      return;
    }

    // ════ CAS 3 : Pas de cache → charger depuis réseau (première visite) ════
    console.log('🌐 Première visite — chargement réseau');

    try {
      // Auth en parallèle du réseau
      setLoaderProgress(10, 'Connexion...');
      const [allShops] = await Promise.all([
        fetchFromServer(),
        initAuth(),
      ]);

      setLoaderProgress(90, 'Affichage...');
      cacheWrite(allShops);
      applyToState(allShops);
      renderAll();

      if (STATE.currentUser) await loadSubscriptions();

      setLoaderProgress(100, '✓ Chargé');
      setTimeout(hideLoader, 300);

      const ms = (performance.now() - t0).toFixed(0);
      console.log(`🌐 pro.html chargé depuis réseau en ${ms}ms (mis en cache)`);

    } catch (err) {
      console.error('Erreur chargement:', err);
      setLoaderProgress(100, 'Erreur');
      showToast('❌ ' + (err.message || 'Erreur de chargement'), 'error');
      setTimeout(hideLoader, 1500);
    }
  }

  /* ──────────────────────────────────────────────
     INVALIDER LE CACHE APRÈS ABONNEMENT/DÉSABONNEMENT
  ────────────────────────────────────────────── */
  const _orig_toggleSubscribe = window.toggleSubscribe;
  if (_orig_toggleSubscribe) {
    window.toggleSubscribe = async function (shopId, btnEl) {
      await _orig_toggleSubscribe(shopId, btnEl);
      // Invalider uniquement les counts d'abonnés dans le cache
      const cached = cacheRead();
      if (cached && cached.data) {
        const shop = cached.data.find(s => s.id === shopId);
        if (shop) {
          const isNowSubscribed = STATE.subscribedShops.has(shopId);
          shop.subscriberCount += isNowSubscribed ? 1 : -1;
          cacheWrite(cached.data); // Mettre à jour le cache avec le nouveau count
        }
      }
    };
  }

  /* ──────────────────────────────────────────────
     COMMANDES CONSOLE POUR DEBUG
  ────────────────────────────────────────────── */
  window.ODA = window.ODA || {};
  window.ODA.cache = {
    info() {
      const c = cacheRead();
      if (!c) return console.log('❌ Pas de cache');
      const age = Math.round((Date.now() - JSON.parse(localStorage.getItem(CACHE_KEY) || '{}').ts) / 1000);
      console.log(`📦 Cache: ${c.data.length} boutiques | âge: ${age}s | frais: ${c.fresh} | utilisable: ${c.stale}`);
    },
    flush() {
      cacheInvalidate();
      console.log('🗑️ Cache vidé — recharger la page');
    },
    async refresh() {
      console.log('🔄 Refresh forcé...');
      cacheInvalidate();
      await fastInit();
    },
  };

  /* ──────────────────────────────────────────────
     REMPLACER init() ET DÉMARRER
  ────────────────────────────────────────────── */
  // Overrider la fonction init originale
  window.init = fastInit;

  // Démarrer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fastInit, { once: true });
  } else {
    fastInit();
  }

})();