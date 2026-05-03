// src/components/ui/Button.js
// ═══════════════════════════════════════════════════════════════
// COMPOSANT : Bouton réutilisable  (5 variantes)
// ═══════════════════════════════════════════════════════════════
//
// PROPS :
//   children    node
//   variant     "primary" | "secondary" | "outline" | "ghost" | "gradient"
//   size        "sm" | "md" | "lg" | "full"
//   loading     boolean   — spinner + disabled
//   disabled    boolean
//   icon        node      — icône avant le label
//   onClick     func
//   type        "button" | "submit" | "reset"   (défaut: "button")
//   className   string
//
// VARIANTS :
//   "primary"   background:#FF6B00    color:white    hover:darken+translateY(-2px)
//   "secondary" background:#EBEBEB    color:#1A1A1A
//   "outline"   border:2px #FF6B00   color:#FF6B00  background:transparent
//   "ghost"     background:transparent color:#444    hover:background grey-50
//   "gradient"  background:linear-gradient(135deg,#D4920A,#C4622D)  color:white
//               box-shadow: 0 4px 16px rgba(212,146,10,0.3)
//               hover: translateY(-2px) + shadow renforcé
//
// TAILLES :
//   "sm"   → padding:8px 16px;   font-size:0.78rem
//   "md"   → padding:12px 24px;  font-size:0.88rem   (défaut)
//   "lg"   → padding:16px 32px;  font-size:1rem
//   "full" → width:100%;  padding:14px;  font-size:0.92rem
//
// STYLES COMMUNS :
//   border-radius: 30px; font-weight: 700; border: none; cursor: pointer
//   display: inline-flex; align-items: center; gap: 8px
//   transition: all 0.3s
//   disabled → opacity: 0.55; cursor: not-allowed
//
// LOADING :
//   Remplacer le texte par un spinner CSS (border animation)
//   + désactiver le bouton

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  onClick,
  type = 'button',
  className = '',
}) {
  // TODO : implémenter le bouton
  return null;
}
