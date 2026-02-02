// ==================== PWA MANAGER ULTRA-OPTIMISÉ POUR ODA-ACHATS.HTML ====================
// Version optimisée pour un chargement en moins de 1 minute
// Auteur: Assistant Claude - Performance Edition
// Date: 2026

(function() {
    'use strict';
    
    // ==================== CONFIGURATION PERFORMANCE ====================
    const CONFIG = {
        // Chargement différé (LAZY LOADING)
        lazyInit: true,              // Initialiser uniquement les fonctionnalités critiques
        deferNonCritical: 3000,      // Différer le non-critique de 3 secondes
        
        // Notifications optimisées
        enableNotifications: false,   // Désactiver par défaut pour la vitesse
        notificationDelay: 10000,     // Première notif après 10s (si activées)
        maxNotifications: 3,          // Réduire à 3 max
        
        // Cache agressif
        cacheStrategy: 'cache-first', // Privilégier le cache
        cacheExpiry: 3600000,         // 1 heure
        
        // Service Worker
        swEnabled: true,
        swScope: '/',
        
        // Performance
        enablePrefetch: true,         // Précharger les ressources critiques
        enableCompression: true,      // Compresser les données
        minimalMode: false            // Mode minimal (désactive tout sauf SW)
    };
    
    // Variables globales
    let deferredPrompt = null;
    let notificationCount = 0;
    let isInitialized = false;
    
    // ==================== UTILITAIRES PERFORMANCE ====================
    
    // Détection de la connexion
    const getConnectionSpeed = () => {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!connection) return 'unknown';
        
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink; // Mbps
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
            return 'slow';
        } else if (effectiveType === '3g' || downlink < 2) {
            return 'medium';
        } else {
            return 'fast';
        }
    };
    
    // Adapter la config selon la connexion
    const adaptConfigToConnection = () => {
        const speed = getConnectionSpeed();
        console.log(`📡 Connexion détectée: ${speed}`);
        
        if (speed === 'slow') {
            CONFIG.minimalMode = true;
            CONFIG.enableNotifications = false;
            CONFIG.deferNonCritical = 10000;
            console.log('🐌 Mode minimal activé (connexion lente)');
        } else if (speed === 'medium') {
            CONFIG.enableNotifications = false;
            CONFIG.deferNonCritical = 5000;
        }
    };
    
    // Debounce pour optimiser les événements
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
    
    // Vérifier si le localStorage est disponible et fonctionnel
    const isStorageAvailable = () => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    };
    
    // ==================== CACHE MANAGER ULTRA-RAPIDE ====================
    class FastCacheManager {
        constructor() {
            this.storageAvailable = isStorageAvailable();
            this.memoryCache = new Map(); // Cache en mémoire pour vitesse maximale
        }
        
        // Sauvegarder avec compression (si possible)
        async set(key, data, ttl = CONFIG.cacheExpiry) {
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                ttl: ttl
            };
            
            // Cache mémoire TOUJOURS
            this.memoryCache.set(key, cacheItem);
            
            // Cache localStorage (optionnel)
            if (this.storageAvailable && !CONFIG.minimalMode) {
                try {
                    const compressed = CONFIG.enableCompression ? 
                        this.compress(JSON.stringify(cacheItem)) : 
                        JSON.stringify(cacheItem);
                    localStorage.setItem(`oda_cache_${key}`, compressed);
                } catch (e) {
                    console.warn('⚠️ Cache localStorage échoué:', e.message);
                }
            }
        }
        
        // Récupérer depuis le cache
        async get(key) {
            // 1. Vérifier le cache mémoire (le plus rapide)
            if (this.memoryCache.has(key)) {
                const cached = this.memoryCache.get(key);
                if (this.isValid(cached)) {
                    console.log(`⚡ Cache mémoire HIT: ${key}`);
                    return cached.data;
                } else {
                    this.memoryCache.delete(key);
                }
            }
            
            // 2. Vérifier le cache localStorage
            if (this.storageAvailable) {
                try {
                    const stored = localStorage.getItem(`oda_cache_${key}`);
                    if (stored) {
                        const decompressed = CONFIG.enableCompression ? 
                            this.decompress(stored) : 
                            stored;
                        const cached = JSON.parse(decompressed);
                        
                        if (this.isValid(cached)) {
                            console.log(`💾 Cache localStorage HIT: ${key}`);
                            // Restaurer dans le cache mémoire
                            this.memoryCache.set(key, cached);
                            return cached.data;
                        } else {
                            localStorage.removeItem(`oda_cache_${key}`);
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Lecture cache échouée:', e.message);
                }
            }
            
            console.log(`❌ Cache MISS: ${key}`);
            return null;
        }
        
        // Vérifier si le cache est valide
        isValid(cached) {
            if (!cached || !cached.timestamp) return false;
            const age = Date.now() - cached.timestamp;
            return age < cached.ttl;
        }
        
        // Compression basique (pour économiser l'espace)
        compress(str) {
            try {
                return btoa(encodeURIComponent(str));
            } catch (e) {
                return str; // Fallback sans compression
            }
        }
        
        // Décompression
        decompress(str) {
            try {
                return decodeURIComponent(atob(str));
            } catch (e) {
                return str; // Fallback
            }
        }
        
        // Nettoyer les caches expirés
        cleanup() {
            // Nettoyer le cache mémoire
            for (const [key, value] of this.memoryCache.entries()) {
                if (!this.isValid(value)) {
                    this.memoryCache.delete(key);
                }
            }
            
            // Nettoyer localStorage (en arrière-plan)
            if (this.storageAvailable && !CONFIG.minimalMode) {
                setTimeout(() => {
                    try {
                        const keys = Object.keys(localStorage);
                        keys.forEach(key => {
                            if (key.startsWith('oda_cache_')) {
                                const stored = localStorage.getItem(key);
                                if (stored) {
                                    try {
                                        const cached = JSON.parse(this.decompress(stored));
                                        if (!this.isValid(cached)) {
                                            localStorage.removeItem(key);
                                        }
                                    } catch (e) {
                                        localStorage.removeItem(key);
                                    }
                                }
                            }
                        });
                        console.log('🧹 Cache nettoyé');
                    } catch (e) {
                        console.warn('⚠️ Nettoyage cache échoué');
                    }
                }, 5000); // Après 5 secondes
            }
        }
        
        // Vider tout le cache
        clear() {
            this.memoryCache.clear();
            if (this.storageAvailable) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('oda_cache_')) {
                        localStorage.removeItem(key);
                    }
                });
            }
            console.log('🗑️ Cache vidé');
        }
    }
    
    // ==================== PWA MANAGER OPTIMISÉ ====================
    class OptimizedPWAManager {
        constructor() {
            this.cacheManager = new FastCacheManager();
            this.swRegistration = null;
            this.criticalInitDone = false;
        }
        
        // Initialisation en deux phases
        async init() {
            if (isInitialized) {
                console.log('⚠️ PWA déjà initialisé');
                return;
            }
            
            console.log('🚀 PWA Manager - Phase 1: Critique');
            
            // Adapter selon la connexion
            adaptConfigToConnection();
            
            // Phase 1: CRITIQUE (immédiat)
            await this.criticalInit();
            
            // Phase 2: NON-CRITIQUE (différé)
            if (!CONFIG.minimalMode) {
                setTimeout(() => this.nonCriticalInit(), CONFIG.deferNonCritical);
            }
            
            isInitialized = true;
        }
        
        // Phase 1: Initialisation critique (rapide)
        async criticalInit() {
            const startTime = performance.now();
            
            // 1. Service Worker (prioritaire)
            if (CONFIG.swEnabled) {
                this.registerServiceWorker().catch(err => {
                    console.warn('⚠️ SW registration failed:', err.message);
                });
            }
            
            // 2. Nettoyer le cache expiré (async, non-bloquant)
            setTimeout(() => this.cacheManager.cleanup(), 2000);
            
            // 3. Gestion de l'installation PWA
            this.handleInstallPrompt();
            
            this.criticalInitDone = true;
            const duration = (performance.now() - startTime).toFixed(2);
            console.log(`✅ Phase critique terminée en ${duration}ms`);
        }
        
        // Phase 2: Initialisation non-critique (différée)
        async nonCriticalInit() {
            console.log('🔧 PWA Manager - Phase 2: Non-critique');
            
            // Notifications (si activées)
            if (CONFIG.enableNotifications) {
                await this.setupNotifications();
            }
            
            // Événements
            this.setupEventListeners();
            
            // Préchargement (si activé)
            if (CONFIG.enablePrefetch) {
                this.prefetchCriticalResources();
            }
            
            console.log('✅ Phase non-critique terminée');
        }
        
        // ==================== SERVICE WORKER ====================
        async registerServiceWorker() {
            if (!('serviceWorker' in navigator)) {
                console.warn('⚠️ Service Worker non supporté');
                return null;
            }
            
            // Vérifier si déjà enregistré (cache)
            const cached = await this.cacheManager.get('sw_registered');
            if (cached) {
                console.log('✅ SW déjà enregistré (cache)');
                this.swRegistration = await navigator.serviceWorker.ready;
                return this.swRegistration;
            }
            
            try {
                this.swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: CONFIG.swScope,
                    updateViaCache: 'none' // Toujours vérifier les mises à jour
                });
                
                console.log('✅ Service Worker enregistré:', this.swRegistration.scope);
                
                // Mettre en cache l'info
                await this.cacheManager.set('sw_registered', true, 86400000); // 24h
                
                // Gérer les mises à jour (non-bloquant)
                this.handleSWUpdates();
                
                return this.swRegistration;
            } catch (error) {
                console.error('❌ Erreur SW:', error.message);
                return null;
            }
        }
        
        // Gérer les mises à jour du SW
        handleSWUpdates() {
            if (!this.swRegistration) return;
            
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🆕 Nouvelle version disponible');
                        
                        // Notification discrète
                        if (!CONFIG.minimalMode) {
                            this.showUpdateBanner();
                        }
                    }
                });
            });
        }
        
        // Bannière de mise à jour (non-intrusive)
        showUpdateBanner() {
            const banner = document.createElement('div');
            banner.id = 'update-banner';
            banner.innerHTML = `
                <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white; padding: 16px; border-radius: 12px; 
                            box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 9999;
                            display: flex; align-items: center; justify-content: space-between;
                            animation: slideUp 0.3s ease;">
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">🆕 Nouvelle version</div>
                        <div style="font-size: 0.85rem; opacity: 0.9;">Une mise à jour est disponible</div>
                    </div>
                    <button onclick="window.location.reload()" 
                            style="background: white; color: #667eea; border: none; 
                                   padding: 10px 20px; border-radius: 8px; font-weight: 600; 
                                   cursor: pointer;">
                        Actualiser
                    </button>
                </div>
            `;
            document.body.appendChild(banner);
            
            // Auto-masquer après 10 secondes
            setTimeout(() => {
                banner.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => banner.remove(), 300);
            }, 10000);
        }
        
        // ==================== INSTALLATION PWA ====================
        handleInstallPrompt() {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                console.log('📲 PWA installable détectée');
                
                // Afficher le bouton d'installation (différé)
                if (!CONFIG.minimalMode) {
                    setTimeout(() => this.showInstallButton(), 5000);
                }
            });
            
            window.addEventListener('appinstalled', () => {
                console.log('✅ PWA installée avec succès');
                deferredPrompt = null;
                
                // Notification légère
                if (CONFIG.enableNotifications && Notification.permission === 'granted') {
                    this.showNotification('✅ Installation réussie', {
                        body: 'ODA Marketplace est maintenant sur votre appareil',
                        tag: 'install-success'
                    });
                }
            });
        }
        
        // Bouton d'installation optimisé
        showInstallButton() {
            if (!deferredPrompt) return;
            
            // Vérifier si déjà affiché récemment
            const lastShown = localStorage.getItem('oda_install_btn_shown');
            if (lastShown && (Date.now() - parseInt(lastShown)) < 86400000) {
                console.log('⚠️ Bouton d\'installation déjà affiché récemment');
                return;
            }
            
            const btn = document.createElement('button');
            btn.id = 'pwa-install-btn';
            btn.innerHTML = '📲 Installer';
            btn.style.cssText = `
                position: fixed; bottom: 80px; right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; border: none; padding: 12px 20px;
                border-radius: 50px; font-weight: 600; font-size: 0.9rem;
                cursor: pointer; box-shadow: 0 4px 12px rgba(102,126,234,0.4);
                z-index: 9998; transition: all 0.3s ease;
                animation: bounceIn 0.5s ease;
            `;
            
            btn.onclick = async () => {
                if (!deferredPrompt) return;
                
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                
                if (result.outcome === 'accepted') {
                    console.log('✅ Installation acceptée');
                } else {
                    console.log('❌ Installation refusée');
                }
                
                btn.remove();
                deferredPrompt = null;
            };
            
            document.body.appendChild(btn);
            localStorage.setItem('oda_install_btn_shown', Date.now().toString());
            
            // Auto-masquer après 20 secondes
            setTimeout(() => {
                if (btn.parentNode) {
                    btn.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => btn.remove(), 300);
                }
            }, 20000);
        }
        
        // ==================== NOTIFICATIONS (OPTIONNELLES) ====================
        async setupNotifications() {
            if (!('Notification' in window)) {
                console.warn('⚠️ Notifications non supportées');
                return;
            }
            
            if (Notification.permission === 'granted') {
                console.log('✅ Notifications autorisées');
                // Lancer les notifications automatiques
                setTimeout(() => this.startAutoNotifications(), CONFIG.notificationDelay);
            } else if (Notification.permission === 'default') {
                // Demander plus tard (non-intrusif)
                setTimeout(() => this.requestNotificationPermission(), 15000);
            }
        }
        
        async requestNotificationPermission() {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('✅ Permission accordée');
                    this.showNotification('🎉 Notifications activées', {
                        body: 'Vous recevrez les dernières offres et nouveautés!',
                        tag: 'permission-granted'
                    });
                }
            } catch (error) {
                console.warn('⚠️ Permission refusée:', error);
            }
        }
        
        async showNotification(title, options = {}) {
            if (Notification.permission !== 'granted') return;
            if (notificationCount >= CONFIG.maxNotifications) return;
            
            const defaultOptions = {
                icon: '/oda.png',
                badge: '/oda.png',
                vibrate: [200, 100, 200],
                requireInteraction: false,
                silent: true, // Silencieux par défaut
                ...options
            };
            
            try {
                if (this.swRegistration) {
                    await this.swRegistration.showNotification(title, defaultOptions);
                } else {
                    new Notification(title, defaultOptions);
                }
                notificationCount++;
                console.log(`✅ Notification: "${title}" (${notificationCount}/${CONFIG.maxNotifications})`);
            } catch (error) {
                console.warn('⚠️ Notification échouée:', error.message);
            }
        }
        
        startAutoNotifications() {
            const notifications = [
                {
                    delay: 10000,
                    title: '🆕 Nouveaux produits',
                    body: 'Découvrez les derniers arrivages sur ODA Marketplace!',
                    tag: 'new-products'
                },
                {
                    delay: 30000,
                    title: '🔥 Offre spéciale',
                    body: 'Réductions exclusives sur une sélection de produits!',
                    tag: 'special-offer'
                }
            ];
            
            notifications.forEach(notif => {
                setTimeout(() => {
                    if (notificationCount < CONFIG.maxNotifications) {
                        this.showNotification(notif.title, {
                            body: notif.body,
                            tag: notif.tag
                        });
                    }
                }, notif.delay);
            });
        }
        
        // ==================== ÉVÉNEMENTS ====================
        setupEventListeners() {
            // Online/Offline (debounced)
            const onlineHandler = debounce(() => {
                console.log('✅ En ligne');
                if (CONFIG.enableNotifications && !CONFIG.minimalMode) {
                    this.showNotification('✅ Connexion rétablie', {
                        body: 'Vous êtes de nouveau en ligne',
                        tag: 'online',
                        silent: true
                    });
                }
            }, 1000);
            
            const offlineHandler = debounce(() => {
                console.log('⚠️ Hors ligne');
            }, 1000);
            
            window.addEventListener('online', onlineHandler);
            window.addEventListener('offline', offlineHandler);
            
            // Visibilité (optimisé)
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    console.log('👀 Page visible');
                }
            });
        }
        
        // ==================== PRÉCHARGEMENT ====================
        prefetchCriticalResources() {
            // Précharger les ressources critiques en arrière-plan
            const criticalResources = [
                '/oda.png',
                '/manifest.json'
            ];
            
            criticalResources.forEach(url => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = url;
                link.as = url.endsWith('.png') ? 'image' : 'fetch';
                document.head.appendChild(link);
            });
            
            console.log('⚡ Préchargement lancé');
        }
    }
    
    // ==================== INITIALISATION ULTRA-RAPIDE ====================
    
    // Fonction d'initialisation optimisée
    const initPWA = () => {
        // Vérifier si on doit initialiser
        if (CONFIG.minimalMode && !CONFIG.swEnabled) {
            console.log('⚠️ PWA désactivé (mode minimal sans SW)');
            return;
        }
        
        // Créer le manager
        window.pwaManager = new OptimizedPWAManager();
        
        // Initialiser immédiatement
        window.pwaManager.init().catch(err => {
            console.error('❌ Erreur init PWA:', err);
        });
    };
    
    // Lancer dès que possible
    if (document.readyState === 'loading') {
        // Attendre que le DOM soit interactif (pas complètement chargé)
        document.addEventListener('DOMContentLoaded', initPWA);
    } else {
        // Le DOM est déjà prêt
        initPWA();
    }
    
    // ==================== STYLES ANIMATIONS ====================
    const injectStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounceIn {
                0% { transform: scale(0) translateY(50px); opacity: 0; }
                60% { transform: scale(1.1); }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; transform: translateY(20px); }
            }
            @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideDown {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(100%); opacity: 0; }
            }
            #pwa-install-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102,126,234,0.5);
            }
            #pwa-install-btn:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    };
    
    // Injecter les styles (différé)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }
    
    // ==================== API PUBLIQUE ====================
    
    // Exposer des fonctions utiles
    window.odaPWA = {
        // Vider le cache
        clearCache: () => {
            if (window.pwaManager) {
                window.pwaManager.cacheManager.clear();
                console.log('✅ Cache vidé - Rechargez la page');
            }
        },
        
        // Forcer la mise à jour du SW
        updateSW: async () => {
            if (window.pwaManager?.swRegistration) {
                await window.pwaManager.swRegistration.update();
                console.log('🔄 Mise à jour vérifiée');
            }
        },
        
        // Activer le mode minimal
        enableMinimalMode: () => {
            CONFIG.minimalMode = true;
            CONFIG.enableNotifications = false;
            console.log('🐌 Mode minimal activé');
        },
        
        // Obtenir les stats
        getStats: () => {
            return {
                initialized: isInitialized,
                minimalMode: CONFIG.minimalMode,
                swEnabled: CONFIG.swEnabled,
                notificationsEnabled: CONFIG.enableNotifications,
                cacheSize: window.pwaManager?.cacheManager.memoryCache.size || 0
            };
        }
    };
    
    // ==================== LOGS ====================
    console.log('%c🚀 ODA PWA Manager - Version Optimisée', 'color: #667eea; font-size: 16px; font-weight: bold;');
    console.log('%c⚡ Chargement ultra-rapide activé', 'color: #10B981; font-weight: bold;');
    console.log('%c📡 Adaptation automatique selon la connexion', 'color: #3B82F6;');
    console.log('%c💾 Cache intelligent en mémoire + localStorage', 'color: #9C27B0;');
    console.log('%c🎯 Objectif: Chargement < 1 minute', 'color: #FF6B00; font-weight: bold;');
    console.log('');
    console.log('💡 Commandes disponibles:');
    console.log('  - odaPWA.clearCache()     : Vider le cache');
    console.log('  - odaPWA.updateSW()       : Vérifier les mises à jour');
    console.log('  - odaPWA.enableMinimalMode() : Mode minimal');
    console.log('  - odaPWA.getStats()       : Voir les statistiques');
    
})();
