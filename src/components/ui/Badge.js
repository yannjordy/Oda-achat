// src/components/ui/Badge.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Badge générique réutilisable
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   children   node
//   variant    string   — voir liste ci-dessous
//   size       "sm" | "md"   (défaut: "sm")
//   className  string
//
// VARIANTS ET STYLES :
//   "tendance"  background:#FF6B00        color:white        "🔥 Tendance"
//   "promo"     background:#CE1126        color:white        "-XX%"
//   "nouveau"   background:#007A5E        color:white        "🆕 Nouveau"
//   "top"       background:linear(gold)   color:white        "🏆 Top Vendeur"
//   "verifie"   background:#E6F5F1        color:#007A5E      "✓ Vérifié"
//   "gold"      background:#FFF8E7        color:#D4920A
//   "green"     background:#E6F5F1        color:#007A5E
//   "red"       background:#FEE2E2        color:#EF4444
//   "grey"      background:#F5F5F5        color:#444444
//
// STYLES COMMUNS :
//   display: inline-flex; align-items: center; gap: 3px
//   border-radius: 20px; font-weight: 700; white-space: nowrap
//   size "sm" → padding: 3px 8px;  font-size: 0.68rem
//   size "md" → padding: 5px 12px; font-size: 0.78rem

export default function Badge({ children, variant = 'grey', size = 'sm', className = '' }) {
  // TODO : implémenter le badge
  return null;
}
