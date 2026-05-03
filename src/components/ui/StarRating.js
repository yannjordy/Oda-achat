// src/components/ui/StarRating.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Note en étoiles
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   note          number    — 0 à 5 (décimales ok, ex: 4.7)
//   nbAvis        number    — affiche "(X avis)" si fourni
//   size          "sm" | "md" | "lg"   (défaut: "sm")
//   interactive   boolean   — si true : sélecteur cliquable
//   onChange      func      — onChange(note) si interactive
//
// RENDU LECTURE SEULE :
//   ⭐⭐⭐⭐½  4.7  (128 avis)
//   - 5 étoiles : pleine / demi / vide selon la note
//   - Couleur : #F2B72B (gold-light)
//   - Étoile demi : utiliser clip-path ou deux éléments superposés
//
// RENDU INTERACTIF :
//   5 étoiles cliquables
//   - Hover : colorier jusqu'à l'étoile survolée
//   - Clic  : onChange(index + 1)
//   - État survol géré avec useState(hovered)
//
// TAILLES :
//   sm  → font-size: 0.85rem  (dans les cartes produit)
//   md  → font-size: 1rem     (dans les sections avis)
//   lg  → font-size: 1.4rem   (dans les pages détail)
//
// FONCTION UTILITAIRE :
//   function getStarType(index, note) {
//     if (note >= index + 1) return 'full'
//     if (note >= index + 0.5) return 'half'
//     return 'empty'
//   }

'use client'

import { useState } from 'react'

export default function StarRating({ note = 0, nbAvis, size = 'sm', interactive = false, onChange }) {
  // TODO : implémenter les étoiles
  return null;
}
