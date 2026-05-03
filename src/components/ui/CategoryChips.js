// src/components/ui/CategoryChips.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Chips de catégories scrollables horizontalement
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   selected     string     — valeur de la catégorie active
//   onChange     func       — onChange(value)
//   variant      "light" | "dark"   (défaut: "light")
//   withAll      boolean    — affiche le chip "Tout" en premier (défaut: true)
//
// CATÉGORIES (depuis types/index.js) :
//   [
//     { value:'mode',         label:'Mode',         icon:'👗' },
//     { value:'beaute',       label:'Beauté',        icon:'💄' },
//     { value:'alimentation', label:'Alimentation',  icon:'🥗' },
//     { value:'art',          label:'Art',           icon:'🎨' },
//     { value:'artisanat',    label:'Artisanat',     icon:'🧺' },
//     { value:'maison',       label:'Maison',        icon:'🏠' },
//     { value:'sport',        label:'Sport',         icon:'⚽' },
//     { value:'electronique', label:'Électronique',  icon:'📱' },
//     { value:'bijoux',       label:'Bijoux',        icon:'📿' },
//     { value:'autre',        label:'Autre',         icon:'✨' },
//   ]
//
// RENDU :
//   <div class="chips-row scrollbar-none">
//     {withAll && <button class="chip chip--all">Tout</button>}
//     {CATEGORIES.map(cat => (
//       <button class="chip" key={cat.value}>{cat.icon} {cat.label}</button>
//     ))}
//   </div>
//
// CHIP ACTIVE vs INACTIVE :
//   variant "light" :
//     active   → background: var(--primary); color: white
//     inactive → background: var(--grey-50); color: var(--grey-700)
//   variant "dark" :
//     active   → background: var(--primary); color: white
//     inactive → background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7)
//
// STYLES CONTENEUR :
//   display: flex; gap: 8px; overflow-x: auto; padding: 0 16px 8px
//   scrollbar-width: none (classe .scrollbar-none)
//
// STYLES CHIP :
//   padding: 8px 16px; border-radius: 30px; white-space: nowrap
//   font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer
//   transition: all 0.2s; flex-shrink: 0

'use client'

import { CATEGORIES } from '@/lib/constants'

export default function CategoryChips({ selected = 'tout', onChange, variant = 'light', withAll = true }) {
  // TODO : implémenter les chips de catégories
  return null;
}
