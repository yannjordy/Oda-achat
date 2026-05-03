// src/components/ui/Loader.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Loader animé de démarrage  (page d'accueil)
// ═══════════════════════════════════════════════════════════════
//
// COMPORTEMENT :
//   - Affiché dès le montage (visible: true)
//   - Après 1400ms → opacity passe à 0 (transition 500ms)
//   - Après 1900ms → retiré du DOM (visible: false)
//   - Utiliser useEffect + deux setTimeout imbriqués
//
// STRUCTURE HTML :
//   <div id="loader">              ← overlay fixed plein écran
//     <div class="loader-logo">   ← 70×70, radius 18px, animation pulse
//       <img src="/oda1.png" />
//     </div>
//     <div class="loader-bar">    ← 120px × 3px, fond grey-100
//       <div class="loader-bar-fill" />   ← animation loadFill
//     </div>
//     <span class="loader-label">ODA MARKET</span>
//   </div>
//
// ANIMATIONS CSS (à définir en style JSX ou module CSS) :
//
//   @keyframes logoPulse {
//     from { transform: scale(1); }
//     to   { transform: scale(1.05); }
//   }
//   → animation: logoPulse 1.4s ease-in-out infinite alternate
//
//   @keyframes loadFill {
//     0%   { width: 0%;   margin-left: 0; }
//     50%  { width: 100%; margin-left: 0; }
//     100% { width: 0%;   margin-left: 100%; }
//   }
//   → animation: loadFill 1.4s ease-in-out infinite
//
// STYLES LOADER :
//   position: fixed; inset: 0; z-index: 9999
//   background: white
//   display: flex; flex-direction: column
//   align-items: center; justify-content: center; gap: 18px
//   transition: opacity 0.5s ease
//
// LABEL :
//   font-size: 0.72rem; font-weight: 600
//   letter-spacing: 3px; text-transform: uppercase
//   color: var(--grey-400)

'use client'

import { useState, useEffect } from 'react'

export default function Loader() {
  // TODO : implémenter le loader animé
  return null;
}
