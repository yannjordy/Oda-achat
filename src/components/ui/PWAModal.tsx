// src/components/ui/PWAModal.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Modal d'installation PWA
// ─────────────────────────────────────────────────────────────
// Affiché automatiquement 2500ms après le chargement si :
//   - L'app n'est pas déjà installée (standalone)
//   - Pas de flag "oda-modal-never" dans localStorage
//   - Pas de flag "oda-modal-shown" dans sessionStorage
//
// Props :
//   isOpen: boolean
//   onClose: () => void
//   onNeverShow: () => void   — stocke "oda-modal-never" en localStorage
//
// Contenu :
//   - Overlay semi-transparent
//   - Card centrée (bottom sheet sur mobile)
//   - Logo ODA
//   - Titre "Installer ODA Market"
//   - Description bénéfices (rapide, hors-ligne, notifications)
//
//   Sur iOS :
//     Instructions étape par étape :
//       1. Appuyer sur 📤 (bouton partage Safari)
//       2. Sélectionner "Sur l'écran d'accueil"
//       3. Confirmer "Ajouter"
//
//   Sur Android/Chrome :
//     Bouton "Installer maintenant" → déclenche deferredPrompt
//
//   - Lien "Ne plus afficher" → onNeverShow()
//   - Bouton fermer (×)

export interface PWAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNeverShow: () => void;
}

export default function PWAModal(_props: PWAModalProps) {
  // TODO: Implémenter le modal PWA
  return null;
}
