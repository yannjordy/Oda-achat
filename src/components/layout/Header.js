// src/components/layout/Header.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Header fixe  (toutes les pages)
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   variant       "default" | "dark" | "transparent"
//   showBack      boolean  — bouton retour ←
//   showSearch    boolean  — barre de recherche intégrée
//   showInstall   boolean  — bouton "📲 Installer"
//   title         string   — titre centré (pages intérieures)
//   onBack        func     — callback retour (défaut: router.back())
//
// VARIANT "default"  (page accueil) :
//   ← Logo ODA + badge "CM" vert
//   → Bouton "📲 Installer" (gradient gold→terra)
//     Chip drapeau 🇨🇲
//   Fond : rgba(255,255,255,0.92) + blur(20px)
//   Bordure bas : 1px solid var(--grey-100)
//
// VARIANT "dark"  (boutiques, achats) :
//   ← Logo ODA (version claire)
//   ↕ <SearchBar variant="header" /> (si showSearch)
//   → Icône 🛒 panier (badge rouge compteur articles)
//   Fond : rgba(12,14,20,0.92) + blur(20px)
//   Bordure bas : 1px solid rgba(255,255,255,0.08)
//
// VARIANT "transparent"  (pages détail) :
//   ← Bouton retour (rond, fond semi-transparent)
//   ↕ Titre centré
//   → Icônes contextuelles (partage, favoris, panier)
//   Fond : transparent (au-dessus de l'image)
//
// STYLES COMMUNS :
//   position: fixed; top: 0; left: 0; right: 0; z-index: 200
//   height: 62px
//   padding: 0 20px
//   display: flex; align-items: center; justify-content: space-between
//   backdrop-filter: blur(20px)

'use client'

export default function Header({ variant = 'default', showBack = false, showSearch = false, showInstall = false, title, onBack }) {
  // TODO : implémenter le Header
  return null;
}
