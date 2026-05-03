// src/components/ui/FilterDrawer.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Drawer de filtres avancés  (page /achats)
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   isOpen          boolean
//   onClose         func
//   onApply         func(filters)   — appelé au clic "Appliquer"
//   initialValues   object          — valeurs initiales des filtres
//
// STRUCTURE DES FILTRES :
//   {
//     categories : string[]   — ex: ['mode', 'bijoux']
//     prixMin    : number     — ex: 0
//     prixMax    : number     — ex: 50000
//     villes     : string[]   — ex: ['Douala']
//     noteMin    : number     — 0 à 5
//     enPromo    : boolean
//     enTendance : boolean
//   }
//
// STRUCTURE DU DRAWER :
//   Overlay (fond rgba(0,0,0,0.5), z-index 300, clic → fermer)
//   └─ Bottom Sheet (fond blanc, border-radius xl en haut, z-index 301)
//        ├─ Handle (petit trait gris centré)
//        ├─ Header : "Filtres"  +  bouton "Réinitialiser"
//        ├─ Section Catégories  (checkboxes multi)
//        ├─ Section Prix        (deux inputs min/max ou slider range)
//        ├─ Section Ville       (checkboxes VILLES_CM)
//        ├─ Section Note min    (<StarRating interactive />)
//        ├─ Toggle "En promo seulement"
//        ├─ Toggle "Tendance seulement"
//        └─ Bouton "Appliquer les filtres" (primary, full)
//
// ANIMATION :
//   Fermé  → transform: translateY(100%)
//   Ouvert → transform: translateY(0)
//   Transition : 0.35s ease
//
// STYLES BOTTOM SHEET :
//   position: fixed; bottom: 0; left: 0; right: 0
//   max-height: 85vh; overflow-y: auto
//   border-radius: 24px 24px 0 0; padding: 12px 20px 32px
//   background: white

'use client'

import { useState, useEffect } from 'react'
import { CATEGORIES, VILLES_CM } from '@/lib/constants'

export default function FilterDrawer({ isOpen, onClose, onApply, initialValues = {} }) {
  // TODO : implémenter le drawer de filtres
  return null;
}
