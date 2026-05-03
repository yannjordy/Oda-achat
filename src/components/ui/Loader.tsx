// src/components/ui/Loader.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Loader de démarrage animé
// ─────────────────────────────────────────────────────────────
// Affiché au chargement initial de la page (index)
//
// Éléments :
//   - Overlay plein écran blanc (fixed, z-index 9999)
//   - Logo ODA (70×70, border-radius 18px) avec animation pulse
//   - Barre de chargement dégradé gold → terra (animation loadFill)
//   - Label "ODA MARKET" letterspacing
//
// Comportement :
//   - S'affiche pendant 1.4s
//   - Disparaît avec opacity 0 + transition 0.5s
//   - Utiliser useEffect + setTimeout pour le masquer
//
// Animations CSS :
//   logoPulse : scale 1 → 1.05 (1.4s infinite alternate)
//   loadFill  : width 0→100→0 avec margin-left (1.4s infinite)

export default function Loader() {
  // TODO: Implémenter le loader animé
  return null;
}
