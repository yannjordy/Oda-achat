// src/components/product/ProductCard.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Carte Produit  (utilisée sur /achats, /boutique, /)
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   produit        object   — données du produit (voir types)
//   onAddToCart    func     — callback ajout panier
//   onToggleFav    func     — callback toggle favori
//   isFav          boolean  — cœur rempli ou vide
//   variant        "grid" | "list"
//
// STRUCTURE DU PRODUIT :
//   { id, nom, prix, prix_original, images[], est_tendance,
//     est_promo, nb_ventes, note_moyenne, nb_avis,
//     boutique: { id, nom, avatar_url } }
//
// RENDU variant="grid"  (défaut) :
//   ┌───────────────────┐
//   │  [image 1:1]      │  ← next/image objectFit:cover
//   │  🔥 Tendance  ❤️  │  ← badges superposés
//   │  "42 vendus"      │
//   ├───────────────────┤
//   │  Nom du produit   │
//   │  🏪 Nom boutique  │
//   │  ⭐ 4.8 (128)     │
//   │  8 500 F  ~~10k~~ │
//   │  [+ Panier]       │
//   └───────────────────┘
//
// RENDU variant="list" :
//   [img 80×80] | Nom · Boutique · Prix · Note | [+ Panier]
//
// BADGES :
//   - "🔥 Tendance"  si est_tendance  (fond #FF6B00, blanc)
//   - "-XX%"        si est_promo     (fond red-cm, blanc)
//   - "X vendus"    toujours visible (fond rgba noir 50%)
//
// INTERACTIONS :
//   - Clic carte → Link href={`/produit?id=${produit.id}`}
//   - Clic ❤️  → onToggleFav(produit.id) (stopPropagation)
//   - Clic panier → onAddToCart(produit)  (stopPropagation)
//
// STYLES :
//   background: white; border-radius: var(--radius-md)
//   box-shadow: var(--shadow-sm)
//   transition: transform 0.2s; hover: translateY(-3px)

'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({ produit, onAddToCart, onToggleFav, isFav = false, variant = 'grid' }) {
  // TODO : implémenter la carte produit
  return null;
}
