// src/hooks/useScrollReveal.ts
// ─────────────────────────────────────────────────────────────
// Hook : Animation scroll reveal (IntersectionObserver)
// ─────────────────────────────────────────────────────────────
// Usage :
//   const ref = useScrollReveal();
//   <section ref={ref} className="sr"> ... </section>
//
// À implémenter :
//  - Observe les éléments avec classes : sr, sr-l, sr-r, sr-z
//  - Ajoute la classe "in" quand l'élément entre dans le viewport
//  - Threshold : 0.15
//  - Cleanup au démontage

import { RefObject } from "react";

export function useScrollReveal<T extends HTMLElement>(): RefObject<T> {
  // TODO: Implémenter le hook
  throw new Error("useScrollReveal: non implémenté");
}
