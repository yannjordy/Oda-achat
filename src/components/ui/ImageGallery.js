// src/components/ui/ImageGallery.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Galerie d'images swipeable  (page /produit)
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   images   string[]        — URLs des images (Supabase Storage)
//   alt      string          — texte alternatif
//   badge    node            — badge promo/tendance superposé
//
// STRUCTURE :
//   <div class="gallery">
//     <div class="gallery-main">
//       <Image src={images[current]} />      ← image principale
//       {badge}                               ← badge absolu haut gauche
//       <button ←  onClick={prev} />         ← flèche précédente
//       <button →  onClick={next} />         ← flèche suivante
//       <div class="gallery-dots">           ← indicateurs de position
//         {images.map((_, i) => <span class={i===current ? 'active' : ''} />)}
//       </div>
//     </div>
//     <div class="gallery-thumbs">           ← miniatures scrollables
//       {images.map((src, i) => (
//         <div class={`thumb ${i===current ? 'active' : ''}`}
//              onClick={() => setCurrent(i)}>
//           <Image src={src} />
//         </div>
//       ))}
//     </div>
//   </div>
//
// SWIPE MOBILE :
//   - onTouchStart → stocker touchStartX
//   - onTouchEnd   → si diff > 50px → prev/next
//
// STYLES :
//   .gallery-main  : position relative; aspect-ratio:1; overflow:hidden
//                    border-radius: var(--radius-lg)
//   .gallery-thumbs: display:flex; gap:8px; overflow-x:auto; margin-top:12px
//   .thumb         : width:64px; height:64px; flex-shrink:0; border-radius:8px
//                    overflow:hidden; cursor:pointer; opacity:0.6
//   .thumb.active  : opacity:1; border:2px solid var(--primary)
//   .gallery-dots  : position:absolute; bottom:12px; left:50%; transform:translateX(-50%)
//                    display:flex; gap:6px
//   dot            : width:6px; height:6px; border-radius:50%
//                    background:rgba(255,255,255,0.5)
//   dot.active     : background:white; width:18px (pill)

'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ImageGallery({ images = [], alt = '', badge }) {
  // TODO : implémenter la galerie swipeable
  return null;
}
