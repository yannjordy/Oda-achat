// src/components/ui/Ticker.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Défilement infini de produits (2 lignes)
// ─────────────────────────────────────────────────────────────
// Affiché sur la page d'accueil
//
// Props :
//   produits: TickerProduit[]
//
// export interface TickerProduit {
//   name: string;
//   shop: string;
//   price: string;
//   icon: string;      // emoji
//   hot: boolean;
//   sold: string;      // ex: "42 vendus"
// }
//
// Comportement :
//   - Ligne 1 : défilement vers la gauche (produits 0-7 dupliqués)
//   - Ligne 2 : défilement vers la droite (produits 4-11 dupliqués)
//   - Vitesse : ~30s pour un cycle complet
//   - Pause au survol (hover)
//   - Compteur live "🔥 X achats aujourd'hui" (incrémente toutes les 8s)
//
// Carte ticker :
//   - Image/emoji (carré 80px)
//   - Badge "🔥 Tendance" si hot
//   - Badge "X vendus"
//   - Nom, boutique, prix
//   - ⭐⭐⭐⭐⭐
//   - Lien vers /produits
//
// CSS Animation : @keyframes tickerLeft / tickerRight
//   transform: translateX(0) → translateX(-50%)   (pour la duplication)

export interface TickerProduit {
  name: string;
  shop: string;
  price: string;
  icon: string;
  hot: boolean;
  sold: string;
}

export interface TickerProps {
  produits: TickerProduit[];
}

export default function Ticker(_props: TickerProps) {
  // TODO: Implémenter le ticker de produits
  return null;
}
