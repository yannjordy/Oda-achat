// src/hooks/useFavorites.js
// ─────────────────────────────────────────────────────────────
// Hook : Gestion des favoris (Supabase OU localStorage)
// ─────────────────────────────────────────────────────────────
//
// USAGE :
//   const { ids, toggle, isFav, count } = useFavorites()
//
// LOGIQUE :
//   - Si utilisateur connecté (Supabase auth) :
//       · Charger les favoris depuis table `favoris`
//       · toggle → INSERT ou DELETE dans Supabase
//   - Si non connecté :
//       · Charger / sauvegarder dans localStorage "oda-favorites"
//         (tableau d'IDs : ["uuid1", "uuid2", ...])
//       · toggle → ajouter ou retirer du tableau
//
// À IMPLÉMENTER :
//
//   Initialisation :
//     const [ids, setIds] = useState(new Set())
//     const [user, setUser] = useState(null)
//
//     useEffect(() => {
//       // Écouter l'auth Supabase
//       supabase.auth.getSession().then(({ data }) => {
//         setUser(data.session?.user ?? null)
//       })
//       const { data: { subscription } } = supabase.auth.onAuthStateChange(
//         (_, session) => setUser(session?.user ?? null)
//       )
//       return () => subscription.unsubscribe()
//     }, [])
//
//     useEffect(() => {
//       if (user) {
//         // Charger depuis Supabase
//         supabase.from('favoris').select('produit_id').eq('user_id', user.id)
//           .then(({ data }) => setIds(new Set(data.map(f => f.produit_id))))
//       } else {
//         // Charger depuis localStorage
//         const saved = JSON.parse(localStorage.getItem('oda-favorites') || '[]')
//         setIds(new Set(saved))
//       }
//     }, [user])
//
//   toggle(produitId) :
//     const next = new Set(ids)
//     if (next.has(produitId)) {
//       next.delete(produitId)
//       if (user) supabase.from('favoris').delete()
//                  .eq('user_id', user.id).eq('produit_id', produitId)
//       else localStorage.setItem('oda-favorites', JSON.stringify([...next]))
//     } else {
//       next.add(produitId)
//       if (user) supabase.from('favoris').insert({ user_id: user.id, produit_id: produitId })
//       else localStorage.setItem('oda-favorites', JSON.stringify([...next]))
//     }
//     setIds(next)
//
//   isFav(produitId) → ids.has(produitId)
//   count           → ids.size

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useFavorites() {
  // TODO : implémenter le hook favoris
  return {
    ids: new Set(),
    toggle: () => {},
    isFav: () => false,
    count: 0,
  }
}
