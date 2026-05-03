// src/components/ui/StatsCounter.tsx
// ─────────────────────────────────────────────────────────────
// COMPOSANT : Compteurs animés des statistiques ODA
// ─────────────────────────────────────────────────────────────
// Affiché sur la page d'accueil
//
// Props :
//   stats: StatItem[]
//
// export interface StatItem {
//   id: string;
//   target: number;    // valeur finale
//   suffix: string;    // ex: "+", "K+", " villes"
//   label: string;     // ex: "Utilisateurs", "Boutiques"
//   icon: string;      // emoji
// }
//
// Valeurs par défaut (depuis index.html) :
//   { id: "cntUsers",    target: 12000, suffix: "+",       label: "Utilisateurs",  icon: "👥" }
//   { id: "cntShops",    target: 350,   suffix: "+",       label: "Boutiques",     icon: "🏪" }
//   { id: "cntProducts", target: 8500,  suffix: "+",       label: "Produits",      icon: "📦" }
//   { id: "cntCities",   target: 10,    suffix: " villes", label: "Villes CM",     icon: "🗺️" }
//
// Comportement :
//   - Animation déclenchée par IntersectionObserver (threshold: 0.3)
//   - Compteur monte de 0 à target en ~1.5s (easing ease-out)
//   - requestAnimationFrame pour la fluidité
//   - Une seule animation (disconnect après déclenchement)
//
// Styles :
//   - Grille 2×2 (mobile) / 4 colonnes (desktop)
//   - Fond gold-pale, radius-xl
//   - Chiffre en font-head, grand, couleur gold

export interface StatItem {
  id: string;
  target: number;
  suffix: string;
  label: string;
  icon: string;
}

export interface StatsCounterProps {
  stats?: StatItem[];
}

export default function StatsCounter(_props: StatsCounterProps) {
  // TODO: Implémenter les compteurs animés
  return null;
}
