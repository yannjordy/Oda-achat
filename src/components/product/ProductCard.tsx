// src/components/product/ProductCard.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Carte produit (utilisée sur /produits et /boutiques/[id])
// ─────────────────────────────────────────────────────────────
// Props :
//   produit: Produit
//   onAddToCart?: (produit: Produit) => void
//   onToggleFav?: (produitId: string) => void
//   isFav?: boolean
//   variant?: "grid" | "list"   — affichage grille ou ligne
//
// Contenu :
//   - Image produit (ratio 1:1) avec next/image
//   - Badge "🔥 Tendance" si est_tendance
//   - Badge "% Promo" si est_promo (calculé avec getDiscount())
//   - Badge "X vendus" (nb_ventes)
//   - Icône favoris (cœur) en haut à droite
//   - Nom produit (tronqué à 40 chars)
//   - Nom de la boutique (lien vers /boutiques/[id])
//   - Note ⭐ + nb avis
//   - Prix (et prix barré si promo)
//   - Bouton "Ajouter au panier"
//
// Lien principal : /produits/[id]
// Styles : card avec shadow-sm, radius-md, hover scale(1.01)

import { Produit } from "@/types";

export interface ProductCardProps {
  produit: Produit;
  onAddToCart?: (produit: Produit) => void;
  onToggleFav?: (produitId: string) => void;
  isFav?: boolean;
  variant?: "grid" | "list";
}

export default function ProductCard(_props: ProductCardProps) {
  // TODO: Implémenter la carte produit
  return null;
}
