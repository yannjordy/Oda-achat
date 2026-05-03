// src/components/ui/Badge.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Badge générique réutilisable
// ─────────────────────────────────────────────────────────────
// Props :
//   children: React.ReactNode
//   variant: "tendance" | "promo" | "nouveau" | "top" | "verifie"
//            | "gold" | "green" | "red" | "grey"
//   size?: "sm" | "md"
//
// Styles par variant :
//   tendance : fond orange #FF6B00, texte blanc, "🔥 Tendance"
//   promo    : fond red-cm, texte blanc, "-XX%"
//   nouveau  : fond green, texte blanc, "Nouveau"
//   top      : fond gold dégradé, texte blanc, "🏆 Top Vendeur"
//   verifie  : fond green-pale, texte green, "✓ Vérifié"
//   gold     : fond gold-pale, texte gold
//   green    : fond green-pale, texte green
//   red      : fond #FEE2E2, texte #EF4444
//   grey     : fond grey-50, texte grey-700

export interface BadgeProps {
  children: React.ReactNode;
  variant:
    | "tendance"
    | "promo"
    | "nouveau"
    | "top"
    | "verifie"
    | "gold"
    | "green"
    | "red"
    | "grey";
  size?: "sm" | "md";
}

export default function Badge(_props: BadgeProps) {
  // TODO: Implémenter le composant Badge
  return null;
}
