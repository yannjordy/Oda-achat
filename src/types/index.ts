// src/types/index.ts
// ─────────────────────────────────────────────────────────────
// Types TypeScript — miroir des tables Supabase
// ─────────────────────────────────────────────────────────────

// ── Utilisateur ────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  nom: string;
  telephone?: string;
  avatar_url?: string;
  role: "acheteur" | "vendeur" | "admin";
  ville?: string;
  created_at: string;
}

// ── Boutique ───────────────────────────────────────────────
export interface Boutique {
  id: string;
  vendeur_id: string;
  nom: string;
  slug: string;
  description?: string;
  categorie: string;
  avatar_url?: string;
  couverture_url?: string;
  ville: string;
  note_moyenne: number;
  nb_avis: number;
  nb_produits: number;
  nb_ventes: number;
  nb_abonnes: number;
  est_verifie: boolean;
  est_actif: boolean;
  created_at: string;
}

// ── Produit ────────────────────────────────────────────────
export interface Produit {
  id: string;
  boutique_id: string;
  boutique?: Boutique;
  nom: string;
  slug: string;
  description?: string;
  categorie: string;
  prix: number;
  prix_original?: number;       // Prix avant promo
  images: string[];             // URLs des images
  variantes?: ProduitVariante[];
  stock: number;
  nb_ventes: number;
  note_moyenne: number;
  nb_avis: number;
  est_tendance: boolean;
  est_promo: boolean;
  est_actif: boolean;
  created_at: string;
}

export interface ProduitVariante {
  type: "taille" | "couleur" | "autre";
  valeurs: string[];
}

// ── Avis ──────────────────────────────────────────────────
export interface Avis {
  id: string;
  produit_id: string;
  user_id: string;
  user?: Pick<User, "nom" | "avatar_url">;
  note: number;               // 1 à 5
  commentaire?: string;
  created_at: string;
}

// ── Commande ──────────────────────────────────────────────
export type StatutCommande =
  | "en_attente"
  | "confirmee"
  | "en_preparation"
  | "en_livraison"
  | "livree"
  | "annulee";

export interface Commande {
  id: string;
  numero: string;
  acheteur_id: string;
  acheteur?: Pick<User, "nom" | "telephone">;
  lignes: LigneCommande[];
  adresse_livraison: AdresseLivraison;
  mode_livraison: "domicile" | "retrait";
  mode_paiement: "mtn_momo" | "orange_money" | "wave";
  telephone_paiement: string;
  sous_total: number;
  frais_livraison: number;
  total: number;
  code_promo?: string;
  remise?: number;
  statut: StatutCommande;
  created_at: string;
  updated_at: string;
}

export interface LigneCommande {
  produit_id: string;
  produit?: Pick<Produit, "nom" | "images" | "prix">;
  quantite: number;
  prix_unitaire: number;
  variante_choisie?: string;
}

export interface AdresseLivraison {
  nom_complet: string;
  telephone: string;
  ville: string;
  quartier: string;
  adresse_detail?: string;
}

// ── Favori ────────────────────────────────────────────────
export interface Favori {
  id: string;
  user_id: string;
  produit_id: string;
  produit?: Produit;
  created_at: string;
}

// ── Panier (client-side) ──────────────────────────────────
export interface PanierItem {
  produit: Produit;
  quantite: number;
  variante_choisie?: string;
}

// ── Catégories ────────────────────────────────────────────
export type Categorie =
  | "mode"
  | "beaute"
  | "alimentation"
  | "art"
  | "artisanat"
  | "maison"
  | "sport"
  | "electronique"
  | "bijoux"
  | "autre";

export const CATEGORIES: { value: Categorie; label: string; icon: string }[] = [
  { value: "mode",         label: "Mode",         icon: "👗" },
  { value: "beaute",       label: "Beauté",        icon: "💄" },
  { value: "alimentation", label: "Alimentation",  icon: "🥗" },
  { value: "art",          label: "Art",           icon: "🎨" },
  { value: "artisanat",    label: "Artisanat",     icon: "🧺" },
  { value: "maison",       label: "Maison",        icon: "🏠" },
  { value: "sport",        label: "Sport",         icon: "⚽" },
  { value: "electronique", label: "Électronique",  icon: "📱" },
  { value: "bijoux",       label: "Bijoux",        icon: "📿" },
  { value: "autre",        label: "Autre",         icon: "✨" },
];

// ── Villes du Cameroun ────────────────────────────────────
export const VILLES_CM = [
  "Douala",
  "Yaoundé",
  "Bafoussam",
  "Bamenda",
  "Kribi",
  "Ngaoundéré",
  "Garoua",
  "Maroua",
  "Bertoua",
  "Ebolowa",
] as const;

export type VilleCM = (typeof VILLES_CM)[number];
