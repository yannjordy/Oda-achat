// src/components/ui/PWAModal.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Modal d'installation PWA
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   isOpen       boolean
//   onClose      func
//   onNeverShow  func   → localStorage.setItem('oda-modal-never', '1')
//
// AFFICHAGE AUTOMATIQUE (géré depuis page.js via usePWA()) :
//   - 2500ms après chargement si :
//     · Non installé (pas standalone)
//     · 'oda-modal-never' absent du localStorage
//     · 'oda-modal-shown' absent du sessionStorage
//
// STRUCTURE :
//   <div class="pwa-overlay">         ← fond semi-transparent, z-index 400
//     <div class="pwa-card">          ← bottom sheet mobile / card desktop
//
//       [×] Bouton fermer
//
//       [Logo ODA 60×60]
//       <h2>Installer ODA Market</h2>
//       <p>Accès rapide, fonctionne hors-ligne,
//          notifications de vos commandes</p>
//
//       ── Sur iOS ──
//       Étapes visuelles :
//         1. Appuie sur [📤] dans Safari
//         2. Sélectionne "Sur l'écran d'accueil"  [📱]
//         3. Confirme en tapant "Ajouter"           [✓]
//       (détecté avec isIOS() → /iPad|iPhone|iPod/.test(navigator.userAgent))
//
//       ── Sur Android/Chrome ──
//       <button onClick={handleInstall}>📲 Installer maintenant</button>
//       (si deferredPrompt disponible → prompt() sinon affiche guide)
//
//       <button onClick={onNeverShow}>Ne plus afficher</button>
//     </div>
//   </div>
//
// STYLES CARD :
//   position: fixed; bottom: 0; left: 0; right: 0 (mobile)
//   border-radius: var(--radius-xl) var(--radius-xl) 0 0
//   padding: 32px 24px; background: white
//   animation: slideUp 0.35s ease
//   max-height: 90vh; overflow-y: auto

'use client'

export default function PWAModal({ isOpen, onClose, onNeverShow }) {
  // TODO : implémenter le modal PWA
  return null;
}
