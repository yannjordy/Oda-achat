// src/components/ui/SearchBar.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Barre de recherche  (3 variantes)
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   placeholder   string   — texte placeholder
//   value         string
//   onChange      func     — onChange(value)
//   onSearch      func     — onSearch(value)  sur Enter ou clic bouton
//   variant       "hero" | "header" | "inline"   (défaut: "inline")
//   autoFocus     boolean
//
// ── VARIANT "hero"  (section Hero, page d'accueil) ──────────
//   Grande barre blanche arrondie avec shadow-md
//   [🔍] [  Rechercher un produit, boutique…      ] [Rechercher →]
//   Sous la barre : suggestions rapides cliquables
//     "Mode"  "Beauté"  "Alimentation"  "Artisanat"
//   Hauteur: 56px; border-radius: 30px; padding: 0 8px 0 20px
//   Bouton: gradient gold→terra, border-radius: 30px
//
// ── VARIANT "header"  (Header dark boutiques/achats) ────────
//   Fond sombre compact
//   [🔍] [  Rechercher…  ]
//   background: rgba(255,255,255,0.08)
//   border: 1px solid rgba(255,255,255,0.12)
//   color: white; height: 40px; border-radius: 12px
//   placeholder couleur rgba(255,255,255,0.4)
//
// ── VARIANT "inline"  (page /achats, dans le body) ──────────
//   Fond gris léger
//   [🔍] [  Rechercher…  ] [×]  ← bouton clear si value non vide
//   background: var(--grey-50)
//   border: 1.5px solid var(--grey-200); focus: border primary
//   height: 48px; border-radius: var(--radius-md)
//
// COMPORTEMENT COMMUN :
//   - onSearch déclenché sur : touche Enter + clic bouton (hero)
//   - Icône × apparaît si value.length > 0 (inline)
//   - Clic × → onChange('') + focus input

'use client'

import { useRef } from 'react'

export default function SearchBar({
  placeholder = 'Rechercher un produit…',
  value,
  onChange,
  onSearch,
  variant = 'inline',
  autoFocus = false,
}) {
  // TODO : implémenter la barre de recherche
  return null;
}
