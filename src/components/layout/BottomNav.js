// src/components/layout/BottomNav.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Navigation mobile fixe en bas  (toutes les pages)
// ═══════════════════════════════════════════════════════════════
//
// 5 ONGLETS :
//   🏠  Accueil     /
//   🛍️  Achats      /achats
//   🏪  Boutiques   /boutiques
//   ❤️   Favoris     /favoris
//   👤  Mon espace  /sandbox
//
// BADGES :
//   - ❤️ Favoris  → badge rouge si useFavorites().count > 0
//   - 🛍️ Achats   → badge orange si useCart().count > 0
//
// ONGLET ACTIF :
//   - Icône + label en couleur primary (#FF6B00)
//   - Petit trait orange sous l'onglet actif
//   - Détection via usePathname()
//
// STYLES :
//   position: fixed; bottom: 0; left: 0; right: 0; z-index: 200
//   height: 64px
//   background: rgba(255,255,255,0.95) + blur(20px)
//   border-top: 1px solid var(--grey-100)
//   padding-bottom: env(safe-area-inset-bottom)   ← PWA notch iOS
//   display: grid; grid-template-columns: repeat(5, 1fr)

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  // TODO : implémenter la navigation mobile
  return null;
}
