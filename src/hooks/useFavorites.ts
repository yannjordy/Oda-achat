// src/hooks/useFavorites.ts
// ─────────────────────────────────────────────────────────────
// Hook : Gestion des favoris (Supabase ou localStorage)
// ─────────────────────────────────────────────────────────────
// Usage :
//   const { ids, toggle, isFav, count } = useFavorites();
//
// À implémenter :
//  - Si utilisateur connecté → synchroniser avec Supabase table `favoris`
//  - Si non connecté → localStorage clé "oda-favorites"
//  - toggle(produit_id) — ajoute ou retire des favoris
//  - isFav(produit_id) → boolean
//  - ids → Set<string> des produit_id favoris
//  - count → nombre de favoris

export interface UseFavoritesReturn {
  ids: Set<string>;
  toggle: (produitId: string) => void;
  isFav: (produitId: string) => boolean;
  count: number;
}

export function useFavorites(): UseFavoritesReturn {
  // TODO: Implémenter le hook
  throw new Error("useFavorites: non implémenté");
}
