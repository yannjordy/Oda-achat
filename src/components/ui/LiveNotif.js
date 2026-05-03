// src/components/ui/LiveNotif.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Notification live d'achat  (page d'accueil)
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   data    array   — liste NOTIF_DATA (passée depuis page.js)
//
// DONNÉES ATTENDUES (chaque item) :
//   { icon: '👗', title: 'Robe Wax Kente achetée',
//     sub: 'Il y a 12s · Douala, Akwa', price: '8 500 F' }
//
// COMPORTEMENT :
//   1. Première notif après 6 secondes (setTimeout)
//   2. Rotation toutes les 9 secondes (setInterval)
//   3. Chaque notif reste visible 3800ms puis disparaît
//   4. Cycle infini sur le tableau data
//   5. Cleanup sur démontage (clearInterval + clearTimeout)
//
// AFFICHAGE :
//   - show=true  → translateX(0), opacity 1
//   - show=false → translateX(-110%), opacity 0
//   - Transition : 0.4s ease
//
// STRUCTURE :
//   <div class="live-notif">       ← position fixed bas gauche
//     <div class="notif-icon">{icon}</div>
//     <div class="notif-body">
//       <div class="notif-title">{title}</div>
//       <div class="notif-sub">{sub}</div>
//     </div>
//     <div class="notif-price">{price}</div>
//   </div>
//
// STYLES :
//   position: fixed; bottom: 80px; left: 16px; z-index: 150
//   background: white; border-radius: var(--radius-md)
//   box-shadow: var(--shadow-md)
//   padding: 12px 16px; max-width: 280px
//   display: flex; align-items: center; gap: 12px
//   transition: transform 0.4s ease, opacity 0.4s ease

'use client'

import { useState, useEffect, useRef } from 'react'

export default function LiveNotif({ data = [] }) {
  // TODO : implémenter les notifications live
  return null;
}
