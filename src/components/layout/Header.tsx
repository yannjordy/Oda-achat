// src/components/layout/Header.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Header fixe (toutes les pages)
// ─────────────────────────────────────────────────────────────
// Props :
//   variant?: "default" | "dark" | "transparent"
//   showBack?: boolean          — bouton retour (pages détail)
//   showSearch?: boolean        — barre de recherche intégrée
//   showInstall?: boolean       — bouton "Installer l'app"
//   title?: string              — titre centré (pages intérieures)
//
// Contenu selon variant :
//
//  "default" (index.html) :
//    ← Logo ODA Market + badge "CM"
//    → Bouton "📲 Installer" + chip drapeau 🇨🇲
//
//  "dark" (boutiques.html) :
//    ← Logo
//    ↕ Barre de recherche
//    → Icône panier (badge compteur)
//
//  "transparent" (pages détail) :
//    ← Bouton retour
//    ↕ Titre de la page
//    → Icônes contextuelle (partage, favoris, panier)
//
// Styles :
//   - Position fixed, z-index 200
//   - Blur backdrop : backdrop-filter: blur(20px)
//   - Bordure bottom : 1px solid var(--grey-100)
//   - Hauteur : 62px

export interface HeaderProps {
  variant?: "default" | "dark" | "transparent";
  showBack?: boolean;
  showSearch?: boolean;
  showInstall?: boolean;
  title?: string;
}

export default function Header(_props: HeaderProps) {
  // TODO: Implémenter le composant Header
  return null;
}
