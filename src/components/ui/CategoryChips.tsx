// src/components/ui/CategoryChips.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Chips de catégories scrollables horizontalement
// ─────────────────────────────────────────────────────────────
// Utilisé sur : /produits, /boutiques
//
// Props :
//   categories: { value: string; label: string; icon: string }[]
//   selected: string          — valeur active
//   onChange: (value: string) => void
//   variant?: "light" | "dark"
//
// Comportement :
//   - Scroll horizontal sans scrollbar visible
//   - Chip "Tout" toujours en premier
//   - Chip active : fond primary (#FF6B00), texte blanc
//   - Chip inactive : fond grey-50 (light) ou bg-dark-2 (dark)
//   - Transition couleur douce au clic
//
// Styles :
//   - display: flex, gap: 8px, overflow-x: auto
//   - Padding horizontal 16px
//   - Chaque chip : padding 8px 16px, border-radius 30px
//   - scrollbar-width: none

import { Categorie, CATEGORIES } from "@/types";

export interface CategoryChipsProps {
  categories?: typeof CATEGORIES;
  selected: string;
  onChange: (value: string) => void;
  variant?: "light" | "dark";
}

export default function CategoryChips(_props: CategoryChipsProps) {
  // TODO: Implémenter les chips de catégories
  return null;
}
