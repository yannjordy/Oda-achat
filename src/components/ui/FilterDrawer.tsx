// src/components/ui/FilterDrawer.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Drawer de filtres avancés (page produits)
// ─────────────────────────────────────────────────────────────
// Props :
//   isOpen: boolean
//   onClose: () => void
//   onApply: (filters: FilterValues) => void
//   initialValues?: FilterValues
//
// export interface FilterValues {
//   categories: string[]
//   prixMin: number
//   prixMax: number
//   villes: string[]
//   noteMin: number       — 0 à 5
//   enPromo: boolean
//   enTendance: boolean
// }
//
// Contenu du drawer (bottom sheet sur mobile) :
//   - Handle de drag en haut
//   - Titre "Filtres" + bouton "Réinitialiser"
//   - Section Catégories (checkboxes multi-sélection)
//   - Section Prix (slider range min/max, affiche "X F – Y F")
//   - Section Ville (checkboxes VILLES_CM)
//   - Section Note minimale (étoiles cliquables)
//   - Toggle "En promo seulement"
//   - Toggle "Tendance seulement"
//   - Bouton "Appliquer les filtres (X résultats)"
//
// Styles :
//   - Position fixed, bottom 0, z-index 300
//   - Slide-up animation depuis le bas
//   - Overlay semi-transparent derrière
//   - border-radius-xl en haut
//   - Max-height: 85vh, overflow-y: auto

export interface FilterValues {
  categories: string[];
  prixMin: number;
  prixMax: number;
  villes: string[];
  noteMin: number;
  enPromo: boolean;
  enTendance: boolean;
}

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  initialValues?: FilterValues;
}

export default function FilterDrawer(_props: FilterDrawerProps) {
  // TODO: Implémenter le drawer de filtres
  return null;
}
