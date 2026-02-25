(function OdaUpdateChecker() {
    // ── Configuration ──────────────────────────────────────
    const VERSION_URL      = './version.json';  // chemin vers ton fichier version.json
    const CHECK_INTERVAL   = 5 * 60 * 1000;    // vérification toutes les 5 minutes
    const STORAGE_KEY      = 'oda_app_version';
    const DISMISSED_KEY    = 'oda_update_dismissed';

    let banner       = null;
    let checkTimer   = null;
    let latestData   = null;

    // ── 1. Créer la bannière (cachée au départ) ────────────
    function createBanner() {
        if (document.getElementById('oda-update-banner')) return;

        banner = document.createElement('div');
        banner.id        = 'oda-update-banner';
        banner.className = 'oda-update-banner';
        banner.innerHTML = `
            <div class="oda-update-icon">🚀</div>
            <div class="oda-update-text">
                <div class="oda-update-title">Nouvelle version disponible !</div>
                <div class="oda-update-sub" id="oda-update-msg">Rechargez pour profiter des améliorations</div>
            </div>
            <div class="oda-update-actions">
                <button class="oda-btn-update" onclick="OdaUpdate.apply()">Mettre à jour</button>
                <button class="oda-btn-dismiss" onclick="OdaUpdate.dismiss()" title="Plus tard">✕</button>
            </div>
        `;
        document.body.appendChild(banner);
    }

    // ── 2. Afficher la bannière ────────────────────────────
    function showBanner(data) {
        createBanner();
        const msg = document.getElementById('oda-update-msg');
        if (msg && data?.message) msg.textContent = data.message;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => banner.classList.add('visible'));
        });
        console.log(`🆕 Nouvelle version disponible : ${data?.version}`);
    }

    // ── 3. Vérifier la version depuis version.json ─────────
    async function checkVersion() {
        try {
            const res = await fetch(`${VERSION_URL}?_=${Date.now()}`, {
                cache: 'no-store',
            });
            if (!res.ok) return;

            const data        = await res.json();
            const newVersion  = data?.version;
            if (!newVersion) return;

            const storedVersion = localStorage.getItem(STORAGE_KEY);

            if (!storedVersion) {
                // Première visite — enregistrer silencieusement
                localStorage.setItem(STORAGE_KEY, newVersion);
                return;
            }

            if (newVersion !== storedVersion) {
                // Version différente → afficher la bannière
                latestData = data;
                localStorage.removeItem(DISMISSED_KEY);
                showBanner(data);
            }

        } catch (e) {
            // Pas de connexion ou fichier absent — ignorer silencieusement
            console.debug('[OdaUpdate] version check silently failed:', e.message);
        }
    }

    // ── 4. Appliquer la mise à jour (recharge la page) ────
    function apply() {
        // Enregistrer la nouvelle version AVANT le rechargement
        if (latestData?.version) {
            localStorage.setItem(STORAGE_KEY, latestData.version);
        }
        // Vider le cache SW si présent
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
        // Vider le cache ODA et recharger
        window.cacheManager?.clearAll();
        window.location.reload(true);
    }

    // ── 5. Rejeter temporairement (réapparaît au prochain chargement)
    function dismiss() {
        if (!banner) return;
        banner.classList.remove('visible');
        localStorage.setItem(DISMISSED_KEY, 'true');
        setTimeout(() => banner.remove(), 600);
    }

    // ── 6. Vérification à la reprise d'onglet ─────────────
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkVersion();
    });

    // ── 7. Démarrage ──────────────────────────────────────
    // Première vérification après 3 secondes (laisse le temps à l'app de charger)
    setTimeout(checkVersion, 3000);

    // Puis toutes les 5 minutes
    checkTimer = setInterval(checkVersion, CHECK_INTERVAL);

    // API publique
    window.OdaUpdate = { apply, dismiss, checkVersion };

    console.log('✅ OdaUpdateChecker actif — vérification toutes les 5 min');
})();
