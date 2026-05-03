// src/components/ui/ImageGallery.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Galerie d'images swipeable (page produit)
// ─────────────────────────────────────────────────────────────
// Props :
//   images: string[]         — URLs des images
//   alt: string
//   badge?: React.ReactNode  — badge promo/nouveau superposé
//
// Comportement :
//   - Image principale en grand (ratio 1:1 ou 4:3)
//   - Miniatures scrollables en bas (row horizontale)
//   - Clic sur miniature → change image principale
//   - Swipe gauche/droite sur mobile (touch events)
//   - Indicateur de position (dots)
//   - Zoom sur tap (double-tap mobile)
//
// Styles :
//   - next/image avec objectFit: cover
//   - Miniature active : bordure 2px primary
//   - Transition : opacity + scale entre images

export interface ImageGalleryProps {
  images: string[];
  alt: string;
  badge?: React.ReactNode;
}

export default function ImageGallery(_props: ImageGalleryProps) {
  // TODO: Implémenter la galerie d'images
  return null;
}
