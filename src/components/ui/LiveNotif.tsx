// src/components/ui/LiveNotif.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Notification live d'achat en temps réel
// ─────────────────────────────────────────────────────────────
// Affiché sur la page d'accueil (coin bas gauche)
//
// Données (NOTIF_DATA dans index.html) :
//   { icon, title, sub (lieu + temps), price }
//
// Comportement :
//   - Première notif après 6 secondes
//   - Rotation toutes les 9 secondes
//   - Apparition : slide-in depuis la gauche + opacity
//   - Disparition après 3800ms
//   - Cycle infini sur NOTIF_DATA
//
// Contenu de chaque notif :
//   [icon] [title]          [price]
//          [sub — lieu/temps]
//
// Styles :
//   - Position fixed, bottom 80px, left 16px, z-index 150
//   - Card blanche, shadow-md, radius-md
//   - Max-width 280px
//   - Transition : translateX(-110%) → translateX(0)

export default function LiveNotif() {
  // TODO: Implémenter les notifications live
  return null;
}
