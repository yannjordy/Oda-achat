

(function OdaNotifications() {
    'use strict';

    const VAPID_PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';

    // URL de votre Edge Function Supabase
    const SUPABASE_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';

    // ── 🔑 Clé d'identifiant de l'appareil ──────────────────
    function getDeviceId() {
        let id = localStorage.getItem('oda_device_id');
        if (!id) {
            id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem('oda_device_id', id);
        }
        return id;
    }

    // ── 🔄 Convertir la clé VAPID en Uint8Array ──────────────
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw     = window.atob(base64);
        return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
    }

    // ── 📱 Vérifier le support Push ──────────────────────────
    function isSupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }

    // ── 🔔 Demander la permission de notifier ────────────────
    async function requestPermission() {
        if (!isSupported()) return 'unsupported';
        const perm = await Notification.requestPermission();
        return perm; // 'granted' | 'denied' | 'default'
    }

    // ── 📡 Obtenir ou créer un abonnement push ───────────────
    async function getPushSubscription() {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
            sub = await reg.pushManager.subscribe({
                userVisibleOnly     : true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
        }
        return sub;
    }

    // ── 💾 Sauvegarder l'abonnement dans Supabase ────────────
    async function saveSubscription(sub, shopId) {
        const key  = sub.getKey('p256dh');
        const auth = sub.getKey('auth');
        const payload = {
            user_device: getDeviceId(),
            shop_id    : shopId,
            endpoint   : sub.endpoint,
            p256dh     : btoa(String.fromCharCode(...new Uint8Array(key))),
            auth       : btoa(String.fromCharCode(...new Uint8Array(auth))),
        };

        const res = await fetch(
            'https://xjckbqbqxcwzcrlmuvzf.supabase.co/rest/v1/push_subscriptions',
            {
                method : 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'apikey'       : SUPABASE_ANON,
                    'Authorization': `Bearer ${SUPABASE_ANON}`,
                    'Prefer'       : 'resolution=merge-duplicates', // upsert
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            const err = await res.text();
            throw new Error('Erreur sauvegarde subscription: ' + err);
        }
    }

    // ── 🗑️ Supprimer l'abonnement de Supabase ───────────────
    async function removeSubscription(shopId) {
        const deviceId = getDeviceId();
        await fetch(
            `https://xjckbqbqxcwzcrlmuvzf.supabase.co/rest/v1/push_subscriptions?user_device=eq.${deviceId}&shop_id=eq.${shopId}`,
            {
                method : 'DELETE',
                headers: {
                    'apikey'       : SUPABASE_ANON,
                    'Authorization': `Bearer ${SUPABASE_ANON}`,
                },
            }
        );
    }

    // ── 🏪 Lister les boutiques suivies (localStorage) ───────
    function getFollowedShops() {
        try {
            return JSON.parse(localStorage.getItem('oda_followed_shops') || '[]');
        } catch { return []; }
    }

    function setFollowedShops(shops) {
        localStorage.setItem('oda_followed_shops', JSON.stringify(shops));
    }

    function isFollowing(shopId) {
        return getFollowedShops().includes(shopId);
    }

    // ── 📲 S'ABONNER à une boutique ──────────────────────────
    async function subscribeToShop(shopId, shopName) {
        if (!isSupported()) {
            return { ok: false, reason: 'unsupported', message: 'Navigateur non compatible' };
        }

        // 1. Demander la permission
        const perm = await requestPermission();
        if (perm !== 'granted') {
            return { ok: false, reason: 'denied', message: 'Permission refusée par l\'utilisateur' };
        }

        try {
            // 2. Obtenir le subscription push
            const sub = await getPushSubscription();

            // 3. Sauvegarder dans Supabase
            await saveSubscription(sub, shopId);

            // 4. Mémoriser localement
            const followed = getFollowedShops();
            if (!followed.includes(shopId)) {
                followed.push(shopId);
                setFollowedShops(followed);
            }

            // 5. Notification locale de confirmation (silencieuse dans l'app)
            _showSystemNotif('✅ Abonné !', `Vous recevrez les nouveaux produits de ${shopName} en notification.`);

            console.log(`🔔 Abonné à la boutique ${shopName} (${shopId})`);
            return { ok: true };

        } catch (err) {
            console.error('❌ Erreur abonnement:', err);
            return { ok: false, reason: 'error', message: err.message };
        }
    }

    // ── 🔕 SE DÉSABONNER d'une boutique ─────────────────────
    async function unsubscribeFromShop(shopId, shopName) {
        try {
            await removeSubscription(shopId);
            const followed = getFollowedShops().filter(id => id !== shopId);
            setFollowedShops(followed);
            _showSystemNotif('🔕 Désabonné', `Vous ne recevrez plus les notifications de ${shopName}.`);
            return { ok: true };
        } catch (err) {
            console.error('❌ Erreur désabonnement:', err);
            return { ok: false, message: err.message };
        }
    }

    // ── 📤 Envoyer une notification push à tous les abonnés ──
    // (appelé depuis boutique.html quand un produit est publié)
    async function notifyNewProduct(shopId, product) {
        try {
            const res = await fetch(PUSH_ENDPOINT, {
                method : 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON}`,
                },
                body: JSON.stringify({ shop_id: shopId, product }),
            });
            const data = await res.json();
            console.log(`📤 Push envoyé — ${data.sent} abonnés notifiés`);
            return data;
        } catch (err) {
            console.error('❌ Erreur envoi push:', err);
        }
    }

    // ── 🔔 Notification système locale (quand app ouverte) ───
    // N'utilise PAS les toasts in-app — utilise les notifications OS
    function _showSystemNotif(title, body, options = {}) {
        if (Notification.permission !== 'granted') return;
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, {
                body,
                icon  : '/oda1.png',
                badge : '/oda1.png',
                silent: true,   // ← pas de son (déjà dans l'app)
                tag   : 'oda-local-' + Date.now(),
                ...options,
            });
        });
    }

    // ── 🎛️ Bouton "Suivre la boutique" — HTML injecté ────────
    // Usage : OdaNotifications.renderSubscribeButton(shopId, shopName, containerId)
    function renderSubscribeButton(shopId, shopName, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const following = isFollowing(shopId);
        container.innerHTML = `
            <button
                id="oda-follow-btn-${shopId}"
                class="oda-follow-btn ${following ? 'following' : ''}"
                onclick="OdaNotifications.toggleFollow('${shopId}', '${shopName}')"
            >
                <span class="oda-follow-icon">${following ? '🔔' : '🔕'}</span>
                <span class="oda-follow-text">${following ? 'Abonné' : 'Suivre la boutique'}</span>
            </button>
        `;

        // Injecter les styles si pas encore fait
        if (!document.getElementById('oda-notif-styles')) {
            const s = document.createElement('style');
            s.id = 'oda-notif-styles';
            s.textContent = `
                .oda-follow-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border: 2px solid #FF6B00;
                    border-radius: 50px;
                    background: white;
                    color: #FF6B00;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    white-space: nowrap;
                }
                .oda-follow-btn:hover {
                    background: #FF6B00;
                    color: white;
                    transform: scale(1.04);
                }
                .oda-follow-btn.following {
                    background: #FF6B00;
                    color: white;
                }
                .oda-follow-btn.following:hover {
                    background: #E55D00;
                }
                .oda-follow-icon { font-size: 1.1rem; }
                /* Bannière d'abonnement flottante */
                .oda-subscribe-banner {
                    position: fixed;
                    bottom: -120px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: calc(100% - 32px);
                    max-width: 460px;
                    background: #2C3E50;
                    color: white;
                    border-radius: 16px;
                    padding: 14px 18px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    z-index: 99998;
                    box-shadow: 0 4px 30px rgba(0,0,0,0.3);
                    border: 2px solid rgba(255,107,0,0.5);
                    transition: bottom 0.45s cubic-bezier(0.34,1.56,0.64,1);
                }
                .oda-subscribe-banner.show { bottom: 24px; }
                .oda-subscribe-banner img {
                    width: 52px;
                    height: 52px;
                    border-radius: 10px;
                    object-fit: cover;
                    flex-shrink: 0;
                }
                .oda-subscribe-banner .sb-text { flex: 1; min-width: 0; }
                .oda-subscribe-banner .sb-title {
                    font-weight: 700;
                    font-size: 0.9rem;
                    margin-bottom: 2px;
                }
                .oda-subscribe-banner .sb-sub {
                    font-size: 0.75rem;
                    opacity: 0.7;
                }
                .oda-sub-btn {
                    background: #FF6B00;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.82rem;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .oda-sub-btn:hover { background: #E55D00; }
                .oda-sub-close {
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    flex-shrink: 0;
                    font-size: 0.9rem;
                }
            `;
            document.head.appendChild(s);
        }
    }

    // ── 🔁 Basculer l'abonnement (bouton toggle) ─────────────
    async function toggleFollow(shopId, shopName) {
        const btn = document.getElementById(`oda-follow-btn-${shopId}`);
        if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }

        let result;
        if (isFollowing(shopId)) {
            result = await unsubscribeFromShop(shopId, shopName);
        } else {
            result = await subscribeToShop(shopId, shopName);
        }

        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        renderSubscribeButton(shopId, shopName, btn?.parentElement?.id || '');
        return result;
    }

    // ── 🪧 Bannière "Abonnez-vous" après 30s ─────────────────
    // (affiché aux nouveaux visiteurs d'une boutique)
    function showSubscribeBanner(shopId, shopName, shopLogo, productImage) {
        if (isFollowing(shopId)) return;                        // déjà abonné
        if (sessionStorage.getItem(`oda_banner_${shopId}`)) return; // déjà vu cette session

        setTimeout(() => {
            if (document.getElementById('oda-sub-banner')) return;

            const banner = document.createElement('div');
            banner.id        = 'oda-sub-banner';
            banner.className = 'oda-subscribe-banner';
            banner.innerHTML = `
                <img src="${productImage || shopLogo || '/oda1.png'}" alt="${shopName}" onerror="this.src='/oda1.png'">
                <div class="sb-text">
                    <div class="sb-title">Restez informé !</div>
                    <div class="sb-sub">Recevez les nouveaux produits de <strong>${shopName}</strong></div>
                </div>
                <button class="oda-sub-btn" onclick="OdaNotifications.subscribeToShop('${shopId}','${shopName}').then(()=>document.getElementById('oda-sub-banner')?.remove())">
                    🔔 Suivre
                </button>
                <button class="oda-sub-close" onclick="this.closest('.oda-subscribe-banner').remove();sessionStorage.setItem('oda_banner_${shopId}','1')">✕</button>
            `;
            document.body.appendChild(banner);
            requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('show')));
        }, 30_000); // afficher après 30 secondes
    }

    // ── 📊 Exposer l'API publique ────────────────────────────
    window.OdaNotifications = {
        subscribeToShop,
        unsubscribeFromShop,
        toggleFollow,
        notifyNewProduct,
        isFollowing,
        getFollowedShops,
        renderSubscribeButton,
        showSubscribeBanner,
        isSupported,
    };

    console.log('🔔 OdaNotifications chargé — prêt');
})();