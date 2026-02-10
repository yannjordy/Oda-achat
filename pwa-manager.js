// ==================== PWA MANAGER POUR ODA-ACHATS.HTML ====================
// À placer dans la balise <head> de oda-achats.html

(function() {
    'use strict';
    
    console.log('🚀 Initialisation PWA ODA Marketplace');
    
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
        notificationInterval: 300000 // 5 minutes entre les séries
    };
    
    let notificationCount = 0;
    let deferredPrompt = null;
    
    // ==================== CLASS PWA MANAGER ====================
    class OdaPWAManager {
        constructor() {
            this.init();
        }
        
        async init() {
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
            
            console.log('✅ PWA Manager initialisé');
        }
        
        // ==================== SERVICE WORKER ====================
        async registerServiceWorker() {
            if (!('serviceWorker' in navigator)) {
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
            if (confirm('🆕 Une nouvelle version est disponible. Voulez-vous actualiser?')) {
                window.location.reload();
            }
        }
        
        // ==================== INSTALLATION PWA ====================
        handleInstallPrompt() {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                console.log('📲 PWA installable');
                
                // Afficher un bouton d'installation si besoin
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
            // Créer un bouton d'installation flottant
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
            if (!('Notification' in window)) {
                console.warn('⚠️ Notifications non supportées');
                return false;
            }
            
            if (Notification.permission === 'granted') {
                console.log('✅ Notifications déjà autorisées');
                return true;
            }
            
            if (Notification.permission === 'default') {
                // Demander après 3 secondes pour ne pas être intrusif
                setTimeout(() => this.requestNotificationPermission(), 3000);
            }
            
            return false;
        }
        
        async requestNotificationPermission() {
            if (Notification.permission === 'granted') return true;
            
            try {
                const permission = await Notification.requestPermission();
                
                if (permission === 'granted') {
                    console.log('✅ Permission notifications accordée');
                    this.sendWelcomeNotification();
                    return true;
                } else {
                    console.log('❌ Permission refusée');
                    return false;
                }
            } catch (error) {
                console.error('Erreur permission:', error);
                return false;
            }
        }
        
        async sendNotification(title, options = {}) {
            if (Notification.permission !== 'granted') {
                console.warn('⚠️ Notifications non autorisées');
                return;
            }
            
            if (notificationCount >= CONFIG.maxNotifications) {
                console.log('⚠️ Limite de notifications atteinte');
                return;
            }
            
            const defaultOptions = {
                icon: '/oda-icon-192.png',
                badge: '/oda-icon-96.png',
                vibrate: [200, 100, 200],
                requireInteraction: false,
                silent: false,
                ...options
            };
            
            try {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.showNotification(title, defaultOptions);
                } else {
                    new Notification(title, defaultOptions);
                }
                
                notificationCount++;
                console.log(`✅ Notification envoyée: "${title}" (${notificationCount}/${CONFIG.maxNotifications})`);
            } catch (error) {
                console.error('❌ Erreur notification:', error);
            }
        }
        
        sendWelcomeNotification() {
            this.sendNotification('🎉 Bienvenue sur ODA Marketplace!', {
                body: 'Merci d\'activer les notifications. Restez informé des nouveautés!',
                tag: 'welcome'
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
                    body: '📱 Le "Samsung Galaxy S24" est très demandé. Stock limité, commandez vite!',
                    tag: 'popular'
                },
                {
                    delay: CONFIG.notificationDelay.popular,
                    title: '👋 Vous nous manquez!',
                    body: '🛍️ Cela fait un moment. Revenez découvrir nos nouveautés!',
                    tag: 'comeback'
                },
                {
                    delay: CONFIG.notificationDelay.reminder,
                    title: '🎁 Cadeau spécial pour vous',
                    body: '💝 Complétez votre profil et recevez 500 FCFA de réduction sur votre prochain achat!',
                    tag: 'special-offer'
                },
                {
                    delay: CONFIG.notificationDelay.special,
                    title: '🌟 Produits recommandés',
                    body: '👀 Basé sur vos favoris, nous avons sélectionné 5 produits qui pourraient vous plaire!',
                    tag: 'recommended'
                }
            ];
            
            notifications.forEach(notif => {
                setTimeout(() => {
                    if (Notification.permission === 'granted' && notificationCount < CONFIG.maxNotifications) {
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
                    notificationCount = 0; // Réinitialiser le compteur
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
                }
            });
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
    
    // Ajouter les styles pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounceIn {
            0% { transform: scale(0) translateY(50px); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(20px); }
        }
    `;
    document.head.appendChild(style);
    
})();
