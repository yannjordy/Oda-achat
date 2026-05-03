// src/hooks/useCart.ts
// ─────────────────────────────────────────────────────────────
// Hook : Gestion du panier (localStorage)
// ─────────────────────────────────────────────────────────────
// Usage :
//   const { items, addItem, removeItem, updateQty, clear, total, count } = useCart();
//
// À implémenter :
//  - Lecture/écriture dans localStorage clé "oda-cart"
//  - addItem(produit, quantite, variante?) — incrémente si déjà présent
//  - removeItem(produit_id, variante?)
//  - updateQty(produit_id, quantite, variante?)
//  - clear() — vide le panier
//  - total — somme des prix * quantités
//  - count — nb total d'articles
//  - Synchronisation entre onglets via storage event

import { PanierItem, Produit } from "@/types";

export interface UseCartReturn {
  items: PanierItem[];
  addItem: (produit: Produit, quantite?: number, variante?: string) => void;
  removeItem: (produitId: string, variante?: string) => void;
  updateQty: (produitId: string, quantite: number, variante?: string) => void;
  clear: () => void;
  total: number;
  count: number;
}

export function useCart(): UseCartReturn {
  // TODO: Implémenter le hook
  throw new Error("useCart: non implémenté");
}
