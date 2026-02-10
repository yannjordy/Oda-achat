// ==================== PWA MANAGER OPTIMISÉ POUR ODA-ACHATS.HTML ====================
// Support complet Safari/iPhone + Notifications visuelles + Sonnerie
// À placer dans la balise <head> de oda-achats.html

(function() {
    'use strict';
    
    console.log('🚀 Initialisation PWA ODA Marketplace (Version Optimisée)');
    
    // ==================== CONFIGURATION ====================
    const CONFIG = {
        notificationDelay: {
            welcome: 5000,        // 5 secondes
            newProducts: 30000,   // 30 secondes
            flash: 60000,         // 1 minute
            popular: 120000,      // 2 minutes
            reminder: 180000,     // 3 minutes
            special: 240000       // 4 minutes
        },
        maxNotifications: 6,
        notificationInterval: 300000, // 5 minutes entre les séries
        
        // Configuration sonnerie
        notificationSound: {
            enabled: true,
            volume: 0.7,
            // URL vers un fichier audio ou utilisation de sons Web Audio API
            soundUrl: '/notification-sound.mp3', // À remplacer par votre fichier audio
            frequency: 800, // Fréquence pour son synthétique (Hz)
            duration: 200   // Durée du son (ms)
        },
        
        // Configuration affichage visuel
        visualNotification: {
            enabled: true,
            duration: 8000, // 8 secondes
            position: 'top', // 'top' ou 'bottom'
            showOnScreen: true // Force l'affichage même si la page est visible
        },
        
        // Configuration Safari/iOS
        safari: {
            useWebNotifications: true, // Utiliser notifications web même sur Safari
            fallbackToVisual: true,     // Basculer vers notifications visuelles si échec
            requestInterval: 60000      // Délai entre les demandes de permission (1 min)
        }
    };
    
    let notificationCount = 0;
    let deferredPrompt = null;
    let audioContext = null;
    let lastPermissionRequest = 0;
    
    // ==================== DÉTECTION NAVIGATEUR ====================
    const BrowserDetector = {
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
        isFirefox: /Firefox/.test(navigator.userAgent),
        
        supportsServiceWorker: 'serviceWorker' in navigator,
        supportsNotifications: 'Notification' in window,
        supportsPushManager: 'PushManager' in window,
        
        log() {
            console.log('📱 Détection navigateur:', {
                safari: this.isSafari,
                iOS: this.isIOS,
                chrome: this.isChrome,
                firefox: this.isFirefox,
                serviceWorker: this.supportsServiceWorker,
                notifications: this.supportsNotifications,
                push: this.supportsPushManager
            });
        }
    };
    
    // ==================== GESTIONNAIRE DE SON ====================
    class NotificationSoundManager {
        constructor() {
            this.audioElement = null;
            this.audioContext = null;
            this.initialized = false;
        }
        
        async init() {
            if (this.initialized) return;
            
            try {
                // Essayer de charger le fichier audio
                if (CONFIG.notificationSound.soundUrl) {
                    this.audioElement = new Audio(CONFIG.notificationSound.soundUrl);
                    this.audioElement.volume = CONFIG.notificationSound.volume;
                    
                    // Précharger l'audio
                    await this.audioElement.load();
                    console.log('✅ Son de notification chargé depuis fichier');
                }
                
                // Initialiser Web Audio API comme fallback
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                this.initialized = true;
            } catch (error) {
                console.warn('⚠️ Impossible d\'initialiser l\'audio:', error);
            }
        }
        
        async play() {
            if (!CONFIG.notificationSound.enabled) return;
            
            try {
                // Essayer de jouer le fichier audio
                if (this.audioElement) {
                    const playPromise = this.audioElement.play();
                    if (playPromise !== undefined) {
                        await playPromise;
                        console.log('🔊 Son de notification joué (fichier)');
                        return;
                    }
                }
                
                // Fallback: utiliser Web Audio API pour générer un son
                this.playSyntheticSound();
            } catch (error) {
                console.warn('⚠️ Impossible de jouer le son:', error);
                // Essayer le son synthétique comme dernier recours
                this.playSyntheticSound();
            }
        }
        
        playSyntheticSound() {
            if (!this.audioContext) return;
            
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // Configuration du son (double bip)
                oscillator.frequency.value = CONFIG.notificationSound.frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(CONFIG.notificationSound.volume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + CONFIG.notificationSound.duration / 1000);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + CONFIG.notificationSound.duration / 1000);
                
                // Deuxième bip
                setTimeout(() => {
                    const oscillator2 = this.audioContext.createOscillator();
                    const gainNode2 = this.audioContext.createGain();
                    
                    oscillator2.connect(gainNode2);
                    gainNode2.connect(this.audioContext.destination);
                    
                    oscillator2.frequency.value = CONFIG.notificationSound.frequency * 1.2;
                    oscillator2.type = 'sine';
                    
                    gainNode2.gain.setValueAtTime(CONFIG.notificationSound.volume, this.audioContext.currentTime);
                    gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + CONFIG.notificationSound.duration / 1000);
                    
                    oscillator2.start(this.audioContext.currentTime);
                    oscillator2.stop(this.audioContext.currentTime + CONFIG.notificationSound.duration / 1000);
                }, 150);
                
                console.log('🔊 Son de notification joué (synthétique)');
            } catch (error) {
                console.warn('⚠️ Erreur son synthétique:', error);
            }
        }
        
        // Activer l'audio après interaction utilisateur (requis pour iOS)
        async unlock() {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            if (this.audioElement) {
                const playPromise = this.audioElement.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.audioElement.pause();
                        this.audioElement.currentTime = 0;
                    }).catch(() => {});
                }
            }
        }
    }
    
    // ==================== NOTIFICATION VISUELLE À L'ÉCRAN ====================
    class VisualNotificationManager {
        constructor() {
            this.container = null;
            this.activeNotifications = [];
            this.init();
        }
        
        init() {
            // Créer le conteneur de notifications
            this.container = document.createElement('div');
            this.container.id = 'oda-visual-notifications';
            this.container.style.cssText = `
                position: fixed;
                ${CONFIG.visualNotification.position === 'top' ? 'top: 20px;' : 'bottom: 80px;'}
                right: 20px;
                z-index: 999999;
                pointer-events: none;
                max-width: 400px;
                width: calc(100% - 40px);
            `;
            
            // Attendre que le DOM soit prêt
            if (document.body) {
                document.body.appendChild(this.container);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(this.container);
                });
            }
        }
        
        show(title, body, options = {}) {
            const notification = document.createElement('div');
            const notifId = 'notif-' + Date.now();
            notification.id = notifId;
            notification.className = 'oda-visual-notification';
            
            // Icône par défaut
            const icon = options.icon || '🔔';
            
            notification.innerHTML = `
                <div class="notif-icon">${icon}</div>
                <div class="notif-content">
                    <div class="notif-title">${title}</div>
                    <div class="notif-body">${body}</div>
                </div>
                <button class="notif-close" onclick="this.parentElement.remove()">×</button>
            `;
            
            notification.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 20px;
                border-radius: 16px;
                margin-bottom: 12px;
                box-shadow: 0 10px 40px rgba(102, 126, 234, 0.5), 
                           0 0 0 1px rgba(255,255,255,0.1) inset;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                pointer-events: auto;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                animation: slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                backdrop-filter: blur(10px);
                transform-origin: right center;
            `;
            
            // Événement de clic
            notification.addEventListener('click', () => {
                if (options.onClick) {
                    options.onClick();
                }
            });
            
            // Effet de survol
            notification.addEventListener('mouseenter', () => {
                notification.style.transform = 'translateX(-5px) scale(1.02)';
                notification.style.boxShadow = '0 15px 50px rgba(102, 126, 234, 0.6)';
            });
            
            notification.addEventListener('mouseleave', () => {
                notification.style.transform = 'translateX(0) scale(1)';
                notification.style.boxShadow = '0 10px 40px rgba(102, 126, 234, 0.5)';
            });
            
            // Ajouter au conteneur
            if (this.container) {
                this.container.appendChild(notification);
                this.activeNotifications.push(notifId);
                
                // Retirer automatiquement après le délai
                setTimeout(() => {
                    this.remove(notifId);
                }, options.duration || CONFIG.visualNotification.duration);
            }
        }
        
        remove(notifId) {
            const notification = document.getElementById(notifId);
            if (notification) {
                notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 1, 1)';
                setTimeout(() => {
                    notification.remove();
                    this.activeNotifications = this.activeNotifications.filter(id => id !== notifId);
                }, 400);
            }
        }
        
        clear() {
            this.activeNotifications.forEach(id => this.remove(id));
        }
    }
    
    // ==================== CLASS PWA MANAGER ====================
    class OdaPWAManager {
        constructor() {
            this.soundManager = new NotificationSoundManager();
            this.visualManager = new VisualNotificationManager();
            this.init();
        }
        
        async init() {
            // Détection du navigateur
            BrowserDetector.log();
            
            // Initialiser le son
            await this.soundManager.init();
            
            // Débloquer l'audio sur la première interaction utilisateur (iOS)
            this.setupAudioUnlock();
            
            // Enregistrer le Service Worker
            await this.registerServiceWorker();
            
            // Gérer l'installation PWA
            this.handleInstallPrompt();
            
            // Vérifier et demander les permissions
            await this.checkNotificationPermission();
            
            // Démarrer les notifications automatiques
            this.startAutoNotifications();
            
            // Écouter les événements
            this.setupEventListeners();
            
            // Ajouter les styles CSS
            this.injectStyles();
            
            console.log('✅ PWA Manager initialisé (Version Optimisée)');
        }
        
        setupAudioUnlock() {
            const unlockAudio = () => {
                this.soundManager.unlock();
                document.removeEventListener('touchstart', unlockAudio);
                document.removeEventListener('click', unlockAudio);
            };
            
            document.addEventListener('touchstart', unlockAudio);
            document.addEventListener('click', unlockAudio);
        }
        
        // ==================== SERVICE WORKER ====================
        async registerServiceWorker() {
            if (!BrowserDetector.supportsServiceWorker) {
                console.warn('⚠️ Service Worker non supporté');
                return null;
            }
            
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });
                
                console.log('✅ Service Worker enregistré:', registration.scope);
                
                // Mettre à jour le SW
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🆕 Nouvelle version disponible');
                            this.showUpdateNotification();
                        }
                    });
                });
                
                return registration;
            } catch (error) {
                console.error('❌ Erreur enregistrement SW:', error);
                return null;
            }
        }
        
        showUpdateNotification() {
            this.visualManager.show(
                '🆕 Nouvelle version disponible',
                'Cliquez pour actualiser et profiter des dernières fonctionnalités.',
                {
                    icon: '🔄',
                    duration: 10000,
                    onClick: () => window.location.reload()
                }
            );
        }
        
        // ==================== INSTALLATION PWA ====================
        handleInstallPrompt() {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                console.log('📲 PWA installable');
                
                // Afficher un bouton d'installation
                this.showInstallButton();
            });
            
            window.addEventListener('appinstalled', () => {
                console.log('✅ PWA installée');
                deferredPrompt = null;
                
                this.sendNotification('🎉 Installation réussie!', {
                    body: 'ODA Marketplace est maintenant installée sur votre appareil.',
                    tag: 'install-success'
                });
            });
        }
        
        showInstallButton() {
            const installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.innerHTML = '📲 Installer l\'app';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 14px 24px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
                z-index: 9999;
                transition: all 0.3s ease;
                animation: bounceIn 0.6s ease;
            `;
            
            installBtn.addEventListener('click', async () => {
                if (!deferredPrompt) return;
                
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                
                if (result.outcome === 'accepted') {
                    console.log('✅ Installation acceptée');
                    installBtn.remove();
                } else {
                    console.log('❌ Installation refusée');
                }
                
                deferredPrompt = null;
            });
            
            document.body.appendChild(installBtn);
            
            // Masquer après 30 secondes
            setTimeout(() => {
                installBtn.style.animation = 'fadeOut 0.5s ease';
                setTimeout(() => installBtn.remove(), 500);
            }, 30000);
        }
        
        // ==================== NOTIFICATIONS ====================
        async checkNotificationPermission() {
            if (!BrowserDetector.supportsNotifications) {
                console.warn('⚠️ Notifications non supportées');
                
                if (CONFIG.safari.fallbackToVisual) {
                    console.log('✅ Utilisation des notifications visuelles uniquement');
                    return true;
                }
                
                return false;
            }
            
            if (Notification.permission === 'granted') {
                console.log('✅ Notifications déjà autorisées');
                return true;
            }
            
            if (Notification.permission === 'default') {
                // Sur Safari/iOS, attendre plus longtemps avant de demander
                const delay = BrowserDetector.isIOS ? 10000 : 3000;
                setTimeout(() => this.requestNotificationPermission(), delay);
            }
            
            return false;
        }
        
        async requestNotificationPermission() {
            // Éviter de spammer l'utilisateur avec des demandes
            const now = Date.now();
            if (now - lastPermissionRequest < CONFIG.safari.requestInterval) {
                console.log('⏳ Délai de demande de permission non écoulé');
                return false;
            }
            
            lastPermissionRequest = now;
            
            if (Notification.permission === 'granted') return true;
            
            // Sur Safari/iOS, afficher d'abord une notification visuelle explicative
            if (BrowserDetector.isSafari || BrowserDetector.isIOS) {
                this.visualManager.show(
                    '🔔 Activer les notifications',
                    'Restez informé des nouveautés et offres exclusives !',
                    {
                        icon: '💡',
                        duration: 5000
                    }
                );
                
                // Attendre 2 secondes avant de demander la permission
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            try {
                const permission = await Notification.requestPermission();
                
                if (permission === 'granted') {
                    console.log('✅ Permission notifications accordée');
                    this.sendWelcomeNotification();
                    return true;
                } else {
                    console.log('❌ Permission refusée');
                    
                    // Afficher message explicatif si refusé
                    if (CONFIG.safari.fallbackToVisual) {
                        this.visualManager.show(
                            'ℹ️ Notifications désactivées',
                            'Vous recevrez des notifications visuelles à la place.',
                            {
                                icon: '💬',
                                duration: 6000
                            }
                        );
                    }
                    
                    return false;
                }
            } catch (error) {
                console.error('Erreur permission:', error);
                return false;
            }
        }
        
        async sendNotification(title, options = {}) {
            const canUseSystemNotif = Notification.permission === 'granted';
            const shouldShowVisual = CONFIG.visualNotification.enabled && 
                                    (!canUseSystemNotif || CONFIG.visualNotification.showOnScreen);
            
            // Limiter le nombre de notifications
            if (notificationCount >= CONFIG.maxNotifications) {
                console.log('⚠️ Limite de notifications atteinte');
                return;
            }
            
            // Jouer le son de notification
            await this.soundManager.play();
            
            // Afficher notification visuelle à l'écran
            if (shouldShowVisual) {
                this.visualManager.show(title, options.body || '', {
                    icon: this.extractEmoji(title),
                    duration: CONFIG.visualNotification.duration,
                    onClick: options.onClick
                });
            }
            
            // Envoyer notification système si possible
            if (canUseSystemNotif) {
                const defaultOptions = {
                    icon: options.icon || '/icon.png',
                    badge: options.badge || '/badge.png',
                    vibrate: [200, 100, 200, 100, 200],
                    requireInteraction: false,
                    silent: false, // Important: ne pas mettre en silencieux
                    tag: options.tag || 'default',
                    renotify: true, // Ré-alerter même si tag existe
                    ...options
                };
                
                try {
                    if (BrowserDetector.supportsServiceWorker && navigator.serviceWorker.controller) {
                        const registration = await navigator.serviceWorker.ready;
                        await registration.showNotification(title, defaultOptions);
                    } else {
                        new Notification(title, defaultOptions);
                    }
                    
                    console.log(`✅ Notification système envoyée: "${title}"`);
                } catch (error) {
                    console.error('❌ Erreur notification système:', error);
                }
            }
            
            notificationCount++;
            console.log(`📊 Total notifications: ${notificationCount}/${CONFIG.maxNotifications}`);
        }
        
        extractEmoji(text) {
            const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
            const match = text.match(emojiRegex);
            return match ? match[0] : '🔔';
        }
        
        sendWelcomeNotification() {
            this.sendNotification('🎉 Bienvenue sur ODA Marketplace!', {
                body: 'Merci d\'activer les notifications. Restez informé des nouveautés!',
                tag: 'welcome',
                requireInteraction: true
            });
        }
        
        // ==================== NOTIFICATIONS AUTOMATIQUES ====================
        startAutoNotifications() {
            const notifications = [
                {
                    delay: CONFIG.notificationDelay.welcome,
                    title: '🆕 Nouveaux produits disponibles!',
                    body: '🎁 15 nouveaux articles viennent d\'arriver. Découvrez-les maintenant!',
                    tag: 'new-products'
                },
                {
                    delay: CONFIG.notificationDelay.newProducts,
                    title: '🔥 Offre Flash du jour!',
                    body: '⚡ Réduction de 30% sur une sélection de produits. Offre limitée!',
                    tag: 'flash-sale'
                },
                {
                    delay: CONFIG.notificationDelay.flash,
                    title: '⭐ Produit le plus populaire',
                    body: '📱 Le "Samsung Galaxy S24" est très demandé. Stock limité!',
                    tag: 'popular'
                },
                {
                    delay: CONFIG.notificationDelay.popular,
                    title: '👋 Vous nous manquez!',
                    body: '🛍️ Revenez découvrir nos nouveautés et offres exclusives!',
                    tag: 'comeback'
                },
                {
                    delay: CONFIG.notificationDelay.reminder,
                    title: '🎁 Cadeau spécial pour vous',
                    body: '💝 Complétez votre profil: 500 FCFA de réduction sur votre prochain achat!',
                    tag: 'special-offer'
                },
                {
                    delay: CONFIG.notificationDelay.special,
                    title: '🌟 Produits recommandés',
                    body: '👀 5 produits sélectionnés selon vos favoris vous attendent!',
                    tag: 'recommended'
                }
            ];
            
            notifications.forEach(notif => {
                setTimeout(() => {
                    if (notificationCount < CONFIG.maxNotifications) {
                        this.sendNotification(notif.title, {
                            body: notif.body,
                            tag: notif.tag
                        });
                    }
                }, notif.delay);
            });
            
            console.log(`⏰ ${notifications.length} notifications programmées`);
            
            // Répéter les notifications toutes les 5 minutes
            setInterval(() => {
                if (notificationCount >= CONFIG.maxNotifications) {
                    notificationCount = 0; // Réinitialiser
                }
                this.sendRandomNotification();
            }, CONFIG.notificationInterval);
        }
        
        sendRandomNotification() {
            const randomNotifs = [
                {
                    title: '💎 Nouveauté exclusive',
                    body: 'Un produit premium vient d\'être ajouté à notre catalogue!',
                    tag: 'exclusive'
                },
                {
                    title: '🎯 Offre personnalisée',
                    body: 'Une offre spéciale basée sur vos préférences vous attend!',
                    tag: 'personalized'
                },
                {
                    title: '⏰ Vente flash dans 1h',
                    body: 'Préparez-vous! Une vente flash exceptionnelle commence bientôt.',
                    tag: 'countdown'
                },
                {
                    title: '📦 Livraison gratuite',
                    body: 'Aujourd\'hui seulement: livraison gratuite sur tout le site!',
                    tag: 'free-delivery'
                },
                {
                    title: '🏆 Top ventes de la semaine',
                    body: 'Découvrez les 10 produits les plus vendus cette semaine!',
                    tag: 'top-sales'
                },
                {
                    title: '💰 Prix en baisse',
                    body: '15 produits de votre wishlist ont baissé de prix!',
                    tag: 'price-drop'
                }
            ];
            
            const random = randomNotifs[Math.floor(Math.random() * randomNotifs.length)];
            this.sendNotification(random.title, {
                body: random.body,
                tag: random.tag
            });
        }
        
        // ==================== ÉVÉNEMENTS ====================
        setupEventListeners() {
            // Détection mode hors ligne
            window.addEventListener('online', () => {
                console.log('✅ Connexion rétablie');
                this.sendNotification('✅ Connexion rétablie', {
                    body: 'Vous êtes de nouveau en ligne!',
                    tag: 'online'
                });
            });
            
            window.addEventListener('offline', () => {
                console.log('⚠️ Mode hors ligne');
                this.sendNotification('⚠️ Mode hors ligne', {
                    body: 'Certaines fonctionnalités peuvent être limitées.',
                    tag: 'offline'
                });
            });
            
            // Visibilité de la page
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    console.log('👋 Page cachée');
                } else {
                    console.log('👀 Page visible');
                    // Effacer les notifications visuelles quand l'utilisateur revient
                    setTimeout(() => this.visualManager.clear(), 2000);
                }
            });
        }
        
        // ==================== STYLES CSS ====================
        injectStyles() {
            const style = document.createElement('style');
            style.id = 'oda-pwa-styles';
            style.textContent = `
                /* Animations */
                @keyframes bounceIn {
                    0% { transform: scale(0) translateY(50px); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                
                @keyframes fadeOut {
                    to { opacity: 0; transform: translateY(20px); }
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                /* Styles des notifications visuelles */
                .oda-visual-notification {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                .oda-visual-notification .notif-icon {
                    font-size: 28px;
                    flex-shrink: 0;
                    animation: pulse 2s ease-in-out infinite;
                }
                
                .oda-visual-notification .notif-content {
                    flex: 1;
                    min-width: 0;
                }
                
                .oda-visual-notification .notif-title {
                    font-weight: 700;
                    font-size: 15px;
                    margin-bottom: 4px;
                    line-height: 1.3;
                }
                
                .oda-visual-notification .notif-body {
                    font-size: 13px;
                    opacity: 0.95;
                    line-height: 1.4;
                }
                
                .oda-visual-notification .notif-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    font-size: 18px;
                    line-height: 1;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .oda-visual-notification .notif-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }
                
                /* Responsive */
                @media (max-width: 480px) {
                    #oda-visual-notifications {
                        left: 10px;
                        right: 10px;
                        max-width: none;
                        width: auto;
                    }
                    
                    .oda-visual-notification {
                        padding: 14px 16px;
                    }
                    
                    .oda-visual-notification .notif-icon {
                        font-size: 24px;
                    }
                    
                    .oda-visual-notification .notif-title {
                        font-size: 14px;
                    }
                    
                    .oda-visual-notification .notif-body {
                        font-size: 12px;
                    }
                }
                
                /* Bouton d'installation */
                #pwa-install-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
                }
                
                #pwa-install-btn:active {
                    transform: translateY(0);
                }
            `;
            
            document.head.appendChild(style);
        }
    }
    
    // ==================== INITIALISATION ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.pwaManager = new OdaPWAManager();
        });
    } else {
        window.pwaManager = new OdaPWAManager();
    }
    
})();
