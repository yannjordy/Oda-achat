// src/components/ui/StarRating.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Affichage de la note en étoiles
// ─────────────────────────────────────────────────────────────
// Props :
//   note: number            — valeur entre 0 et 5 (décimale ok)
//   nbAvis?: number         — affiche "(nb avis)" à côté
//   size?: "sm" | "md" | "lg"
//   interactive?: boolean   — si true → sélecteur de note cliquable
//   onChange?: (note: number) => void
//
// Rendu :
//   ⭐⭐⭐⭐½  (4.5)  · 128 avis
//
// Étoile partielle : clip-path ou dégradé pour les demi-étoiles
// Couleur étoile : #F2B72B (gold-light)

export interface StarRatingProps {
  note: number;
  nbAvis?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (note: number) => void;
}

export default function StarRating(_props: StarRatingProps) {
  // TODO: Implémenter le composant d'étoiles
  return null;
}
