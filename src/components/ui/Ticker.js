// src/components/ui/Ticker.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Défilement infini de produits  (page d'accueil)
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   produits   array   — liste des produits à afficher (12 items)
//
// STRUCTURE D'UN PRODUIT :
//   { name, shop, price, icon, hot, sold }
//
// COMPORTEMENT :
//   - Ligne 1 : produits[0..7] dupliqués, défilement ← gauche
//   - Ligne 2 : produits[4..11] dupliqués, défilement → droite
//   - Vitesse : 30s par cycle (CSS animation)
//   - Pause sur hover : animation-play-state: paused
//   - Compteur live : "🔥 X achats aujourd'hui"
//     · Commence à 147, +1 à +3 toutes les 8s (setInterval)
//
// ANIMATIONS CSS :
//   @keyframes tickerLeft  { from { transform: translateX(0); }
//                            to   { transform: translateX(-50%); } }
//   @keyframes tickerRight { from { transform: translateX(-50%); }
//                            to   { transform: translateX(0); } }
//   → Durée 30s linear infinite
//   → La duplication des items crée l'effet boucle parfaite
//
// CARTE TICKER :
//   <a href="/produit?id=..." class="ticker-card">
//     <div class="ticker-card-img">
//       {icon}                              ← emoji 2.5rem
//       {hot && <span>🔥 Tendance</span>}   ← badge absolu haut gauche
//       <span>{sold}</span>                 ← badge absolu bas droite
//     </div>
//     <div class="ticker-card-body">
//       <div>{name}</div>
//       <div>{shop}</div>
//       <div>{price}</div>
//       <div>⭐⭐⭐⭐⭐</div>
//     </div>
//   </a>
//
// STYLES CARTE :
//   width: 160px; flex-shrink: 0
//   background: white; border-radius: var(--radius-md)
//   box-shadow: var(--shadow-sm); overflow: hidden
//   .ticker-card-img : height 100px, fond grey-50, centré, position relative
//   .ticker-card-body : padding 10px 12px

'use client'

import { useState, useEffect } from 'react'

export default function Ticker({ produits = [] }) {
  // TODO : implémenter le ticker
  return null;
}
