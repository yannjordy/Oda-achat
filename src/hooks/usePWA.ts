// src/hooks/usePWA.ts
// ─────────────────────────────────────────────────────────────
// Hook : Gestion de l'installation PWA
// ─────────────────────────────────────────────────────────────
// Usage :
//   const { canInstall, isInstalled, isIOS, promptInstall, showIOSGuide } = usePWA();
//
// À implémenter :
//  - Capture de l'événement `beforeinstallprompt` (Android/Chrome)
//  - Détection iOS (guide manuel)
//  - Détection si déjà installé (standalone mode)
//  - promptInstall() → déclenche la native prompt ou le guide iOS
//  - showIOSGuide → boolean pour afficher le modal d'instructions iOS
//  - Auto-affichage du modal après 2500ms (si pas déjà montré)
//    via sessionStorage clé "oda-modal-shown"
//    et localStorage clé "oda-modal-never"

export interface UsePWAReturn {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => void;
  showIOSGuide: boolean;
  setShowIOSGuide: (v: boolean) => void;
  neverShow: () => void;
}

export function usePWA(): UsePWAReturn {
  // TODO: Implémenter le hook
  throw new Error("usePWA: non implémenté");
}
