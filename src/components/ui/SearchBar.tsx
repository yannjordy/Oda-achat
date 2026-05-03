// src/components/ui/SearchBar.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Barre de recherche
// ─────────────────────────────────────────────────────────────
// Utilisé sur : Header (dark), Hero (accueil), page produits
//
// Props :
//   placeholder?: string          — défaut "Rechercher un produit…"
//   value: string
//   onChange: (value: string) => void
//   onSearch?: (value: string) => void   — soumission (Enter / bouton)
//   variant?: "hero" | "header" | "inline"
//   autoFocus?: boolean
//
// Variants :
//
//  "hero" (page accueil) :
//    - Grande barre blanche avec shadow-md
//    - Icône loupe à gauche
//    - Bouton "Rechercher" orange à droite
//    - Suggestions rapides en dessous : "Mode", "Beauté", "Alimentation"…
//
//  "header" (header dark boutiques) :
//    - Fond #1C1F2A, texte blanc, icône loupe
//    - Compact (height 40px)
//
//  "inline" (page produits) :
//    - Fond grey-50, border grey-200
//    - Icône loupe + bouton clear (×) si valeur non vide

export interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  variant?: "hero" | "header" | "inline";
  autoFocus?: boolean;
}

export default function SearchBar(_props: SearchBarProps) {
  // TODO: Implémenter la barre de recherche
  return null;
}
