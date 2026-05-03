// src/lib/utils.ts
// ─────────────────────────────────────────────────────────────
// Fonctions utilitaires partagées
// ─────────────────────────────────────────────────────────────

/**
 * Formate un montant en Francs CFA (XAF)
 * Ex: formatPrice(8500) → "8 500 F CFA"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Tronque un texte à une longueur max
 */
export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

/**
 * Génère les initiales d'un nom (pour les avatars)
 * Ex: getInitials("Mama Koki") → "MK"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calcule le pourcentage de réduction
 * Ex: getDiscount(10000, 8500) → 15
 */
export function getDiscount(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Formate une date relative (ex: "Il y a 2 min")
 */
export function timeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return `Il y a ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

/**
 * Slugifie un texte pour les URLs
 * Ex: slugify("Robe Wax Kente") → "robe-wax-kente"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Détecte si l'app tourne en mode standalone (PWA installée)
 * @ts-ignore TypeScript doesn't recognize navigator.standalone yet
 */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

/**
 * Détecte iOS
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
