// src/hooks/useCart.js
// ─────────────────────────────────────────────────────────────
// Hook : Gestion du panier (localStorage "oda-cart")
// ─────────────────────────────────────────────────────────────
//
// USAGE :
//   const { items, addItem, removeItem, updateQty, clear, total, count } = useCart()
//
// STRUCTURE D'UN ITEM :
//   { produit: {...}, quantite: 2, variante: 'L' }
//
// À IMPLÉMENTER :
//
//   Initialisation :
//     useState(() => {
//       const saved = localStorage.getItem('oda-cart')
//       return saved ? JSON.parse(saved) : []
//     })
//
//   Persistance :
//     useEffect(() => {
//       localStorage.setItem('oda-cart', JSON.stringify(items))
//     }, [items])
//
//   addItem(produit, quantite = 1, variante = '') :
//     - Si item (même produit.id ET même variante) existe → incrémenter quantite
//     - Sinon → push { produit, quantite, variante }
//
//   removeItem(produitId, variante = '') :
//     - filter out l'item correspondant
//
//   updateQty(produitId, quantite, variante = '') :
//     - Si quantite <= 0 → removeItem
//     - Sinon → mettre à jour la quantité
//
//   clear() :
//     - setItems([])
//
//   total :
//     items.reduce((sum, item) => sum + item.produit.prix * item.quantite, 0)
//
//   count :
//     items.reduce((sum, item) => sum + item.quantite, 0)
//
//   Sync entre onglets :
//     useEffect(() => {
//       const handler = (e) => {
//         if (e.key === 'oda-cart') setItems(JSON.parse(e.newValue || '[]'))
//       }
//       window.addEventListener('storage', handler)
//       return () => window.removeEventListener('storage', handler)
//     }, [])

'use client'

import { useState, useEffect } from 'react'

export function useCart() {
  // TODO : implémenter le hook panier
  return {
    items: [],
    addItem: () => {},
    removeItem: () => {},
    updateQty: () => {},
    clear: () => {},
    total: 0,
    count: 0,
  }
}
