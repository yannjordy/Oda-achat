// src/hooks/useScrollReveal.js
// ─────────────────────────────────────────────────────────────
// Hook : Animations scroll reveal (IntersectionObserver)
// ─────────────────────────────────────────────────────────────
//
// USAGE :
//   const containerRef = useScrollReveal()
//   <section ref={containerRef}>
//     <div className="sr">   ← slide up
//     <div className="sr-l"> ← slide depuis gauche
//     <div className="sr-r"> ← slide depuis droite
//     <div className="sr-z"> ← zoom in
//   </section>
//
// CLASSES CSS (définies dans globals.css) :
//   .sr   { opacity:0; transform:translateY(28px);  transition:.6s ease }
//   .sr-l { opacity:0; transform:translateX(-36px); transition:.65s ease }
//   .sr-r { opacity:0; transform:translateX(36px);  transition:.65s ease }
//   .sr-z { opacity:0; transform:scale(.9);          transition:.6s ease }
//   .in   { opacity:1 !important; transform:none !important }
//
// À IMPLÉMENTER :
//
//   const ref = useRef(null)
//
//   useEffect(() => {
//     const el = ref.current
//     if (!el) return
//
//     const targets = el.querySelectorAll('.sr, .sr-l, .sr-r, .sr-z')
//
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             entry.target.classList.add('in')
//             observer.unobserve(entry.target)   // une seule animation
//           }
//         })
//       },
//       { threshold: 0.15 }
//     )
//
//     targets.forEach((t) => observer.observe(t))
//
//     return () => observer.disconnect()
//   }, [])
//
//   return ref

'use client'

import { useRef, useEffect } from 'react'

export function useScrollReveal() {
  // TODO : implémenter le hook scroll reveal
  return useRef(null)
}
