// src/components/ui/Button.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Bouton réutilisable
// ─────────────────────────────────────────────────────────────
// Props :
//   children: React.ReactNode
//   variant: "primary" | "secondary" | "outline" | "ghost" | "gradient"
//   size?: "sm" | "md" | "lg" | "full"
//   loading?: boolean       — spinner animé, désactive le bouton
//   disabled?: boolean
//   icon?: React.ReactNode  — icône à gauche du label
//   onClick?: () => void
//   type?: "button" | "submit" | "reset"
//   className?: string
//
// Styles par variant :
//   primary   : fond #FF6B00, texte blanc, hover darken
//   secondary : fond grey-100, texte grey-900
//   outline   : bordure #FF6B00, texte #FF6B00, fond transparent
//   ghost     : fond transparent, texte grey-700, hover grey-50
//   gradient  : fond linear-gradient(135deg, gold → terra), texte blanc
//               box-shadow: 0 4px 16px rgba(212,146,10,0.3)
//
// Tous les variants :
//   - border-radius: 30px (pill)
//   - font-weight: 700
//   - transition: all 0.3s
//   - hover: translateY(-2px) + shadow renforcé

import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg" | "full";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export default function Button(_props: ButtonProps) {
  // TODO: Implémenter le composant Button
  return null;
}
