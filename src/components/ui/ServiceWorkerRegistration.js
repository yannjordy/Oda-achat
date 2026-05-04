'use client';

import { useEffect, useState, useCallback } from 'react';

export default function ServiceWorkerRegistration() {
  const [swReady, setSwReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const registerSW = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setSwReady(true);
      console.log('Service Worker registered:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }, []);

  useEffect(() => {
    registerSW();

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.dispatchEvent(new CustomEvent('pwa-install-ready', { detail: { prompt: e } }));
      console.log('beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      window.dispatchEvent(new CustomEvent('pwa-installed'));
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [registerSW]);

  // Expose install function globally
  useEffect(() => {
    window.installPWA = async () => {
      if (!deferredPrompt) {
        console.log('Install prompt not available');
        return false;
      }

      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User choice: ${outcome}`);
        setDeferredPrompt(null);
        return outcome === 'accepted';
      } catch (error) {
        console.error('Error prompting install:', error);
        return false;
      }
    };
  }, [deferredPrompt]);

  // Expose update function globally
  useEffect(() => {
    window.updatePWA = async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    };
  }, []);

  if (!swReady) return null;

  return null;
}
