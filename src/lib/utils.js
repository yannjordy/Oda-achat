// src/lib/utils.js
// ─────────────────────────────────────────────────────────────
// Fonctions utilitaires partagées
// ─────────────────────────────────────────────────────────────

/**
 * Formate un montant en Francs CFA
 * formatPrice(8500) → "8 500 F"
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('fr-CM').format(amount) + ' F'
}

/**
 * Tronque un texte
 * truncate("Robe Wax Kente Traditionnel", 20) → "Robe Wax Kente Trad…"
 */
export function truncate(text, max) {
  return text.length > max ? text.slice(0, max) + '…' : text
}

/**
 * Génère les initiales (pour avatars sans image)
 * getInitials("Mama Koki") → "MK"
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Calcule le pourcentage de réduction
 * getDiscount(10000, 8500) → 15
 */
export function getDiscount(original, sale) {
  return Math.round(((original - sale) / original) * 100)
}

/**
 * Formate une date relative
 * timeAgo("2024-01-15T10:00:00") → "Il y a 2 min"
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60)  return `Il y a ${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)  return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `Il y a ${hours}h`
  return `Il y a ${Math.floor(hours / 24)}j`
}

/**
 * Slugifie un texte pour les URLs
 * slugify("Robe Wax Kente") → "robe-wax-kente"
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Génère un numéro de commande unique
 * genNumeroCommande() → "ODA-2024-A8F3K"
 */
export function genNumeroCommande() {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).toUpperCase().slice(2, 7)
  return `ODA-${year}-${rand}`
}

/**
 * Détecte si l'app est installée en mode standalone (PWA)
 */
export function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

/**
 * Détecte iOS
 */
export function isIOS() {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Classe CSS conditionnelle (cn utility)
 * cn('base', condition && 'extra', 'always') → "base extra always"
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
