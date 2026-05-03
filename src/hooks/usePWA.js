// src/hooks/usePWA.js
// ─────────────────────────────────────────────────────────────
// Hook : Gestion de l'installation PWA (Android + iOS)
// ─────────────────────────────────────────────────────────────
//
// USAGE :
//   const { canInstall, isInstalled, isIOSDevice, promptInstall,
//           showGuide, setShowGuide, neverShow } = usePWA()
//
// À IMPLÉMENTER :
//
//   const [deferredPrompt, setDeferredPrompt] = useState(null)
//   const [showGuide, setShowGuide] = useState(false)
//
//   // Capturer l'événement beforeinstallprompt (Android/Chrome)
//   useEffect(() => {
//     const handler = (e) => {
//       e.preventDefault()
//       setDeferredPrompt(e)
//     }
//     window.addEventListener('beforeinstallprompt', handler)
//     return () => window.removeEventListener('beforeinstallprompt', handler)
//   }, [])
//
//   // Auto-affichage modal 2500ms après chargement
//   useEffect(() => {
//     if (isStandalone()) return
//     if (localStorage.getItem('oda-modal-never')) return
//     if (sessionStorage.getItem('oda-modal-shown')) return
//
//     const t = setTimeout(() => {
//       if (deferredPrompt && !isIOS()) {
//         // Android : déclencher directement
//         deferredPrompt.prompt()
//         deferredPrompt.userChoice.then(c => {
//           if (c.outcome === 'accepted') setDeferredPrompt(null)
//         })
//       } else {
//         // iOS ou pas de prompt natif → afficher le guide
//         setShowGuide(true)
//       }
//       sessionStorage.setItem('oda-modal-shown', '1')
//     }, 2500)
//     return () => clearTimeout(t)
//   }, [deferredPrompt])
//
//   promptInstall() :
//     if (isStandalone()) return
//     if (deferredPrompt) {
//       deferredPrompt.prompt()
//       deferredPrompt.userChoice.then(c => {
//         if (c.outcome === 'accepted') setDeferredPrompt(null)
//       })
//     } else {
//       setShowGuide(true)
//     }
//
//   neverShow() :
//     localStorage.setItem('oda-modal-never', '1')
//     setShowGuide(false)
//
//   isInstalled → isStandalone()
//   isIOSDevice → isIOS()
//   canInstall  → !!deferredPrompt || isIOS()

'use client'

import { useState, useEffect } from 'react'
import { isStandalone, isIOS } from '@/lib/utils'

export function usePWA() {
  // TODO : implémenter le hook PWA
  return {
    canInstall: false,
    isInstalled: false,
    isIOSDevice: false,
    promptInstall: () => {},
    showGuide: false,
    setShowGuide: () => {},
    neverShow: () => {},
  }
}
