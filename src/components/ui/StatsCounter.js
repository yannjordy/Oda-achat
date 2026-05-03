// src/components/ui/StatsCounter.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Compteurs animés des statistiques ODA
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   stats   array   — liste des stats (défaut ci-dessous)
//
// VALEURS PAR DÉFAUT :
//   [
//     { id:'cntUsers',    target:12000, suffix:'+',       label:'Utilisateurs', icon:'👥' },
//     { id:'cntShops',    target:350,   suffix:'+',       label:'Boutiques',    icon:'🏪' },
//     { id:'cntProducts', target:8500,  suffix:'+',       label:'Produits',     icon:'📦' },
//     { id:'cntCities',   target:10,    suffix:' villes', label:'Villes CM',    icon:'🗺️'  },
//   ]
//
// COMPORTEMENT :
//   - Déclenché par IntersectionObserver (threshold: 0.3)
//   - Chaque compteur monte de 0 → target en ~1500ms
//   - Easing ease-out (ralentissement en fin)
//   - Utiliser requestAnimationFrame :
//       const start = performance.now()
//       const step = (now) => {
//         const progress = Math.min((now - start) / 1500, 1)
//         const eased = 1 - Math.pow(1 - progress, 3)  // easeOutCubic
//         el.textContent = Math.floor(eased * target) + suffix
//         if (progress < 1) requestAnimationFrame(step)
//       }
//       requestAnimationFrame(step)
//   - observer.disconnect() après premier déclenchement
//
// STRUCTURE :
//   <div class="stats-grid">
//     {stats.map(s => (
//       <div class="stat-card" key={s.id}>
//         <div class="stat-icon">{s.icon}</div>
//         <div class="stat-value" id={s.id}>0{s.suffix}</div>
//         <div class="stat-label">{s.label}</div>
//       </div>
//     ))}
//   </div>
//
// STYLES GRILLE :
//   display: grid; grid-template-columns: repeat(2, 1fr) (mobile)
//   grid-template-columns: repeat(4, 1fr) (≥768px)
//   gap: 16px; padding: 24px
//   background: var(--gold-pale); border-radius: var(--radius-xl)
//
// STYLES CARTE :
//   text-align: center; padding: 20px 16px
//   .stat-icon  : font-size: 2rem; margin-bottom: 8px
//   .stat-value : font-family: var(--font-head); font-size: 2rem
//                 font-weight: 900; color: var(--gold)
//   .stat-label : font-size: 0.8rem; color: var(--grey-400); margin-top: 4px

'use client'

import { useRef, useEffect } from 'react'

const DEFAULT_STATS = [
  { id: 'cntUsers',    target: 12000, suffix: '+',       label: 'Utilisateurs', icon: '👥' },
  { id: 'cntShops',    target: 350,   suffix: '+',       label: 'Boutiques',    icon: '🏪' },
  { id: 'cntProducts', target: 8500,  suffix: '+',       label: 'Produits',     icon: '📦' },
  { id: 'cntCities',   target: 10,    suffix: ' villes', label: 'Villes CM',    icon: '🗺️'  },
]

export default function StatsCounter({ stats = DEFAULT_STATS }) {
  // TODO : implémenter les compteurs animés
  return null;
}
