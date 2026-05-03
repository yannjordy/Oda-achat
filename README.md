# ODA Market — Next.js 14

> **La Marketplace N°1 au Cameroun** 🇨🇲
> Projet converti de HTML/CSS/JS vers **Next.js 14 App Router** (JavaScript)

---

## 🚀 Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.local.example .env.local
# → Renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Copier le logo dans /public
#    oda1.png  (192×192 minimum)

# 4. Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

---

## 🗂️ Structure du projet

```
oda-market/
│
├── public/
│   ├── manifest.json        # PWA manifest
│   └── oda1.png             # ⚠️  À ajouter manuellement
│
├── src/
│   │
│   ├── app/                 # Pages Next.js (App Router)
│   │   ├── layout.js        # Layout racine (fonts, metadata PWA)
│   │   ├── globals.css      # Design tokens CSS + Tailwind
│   │   ├── page.js          # /           → Accueil (index.html)
│   │   ├── boutiques/
│   │   │   └── page.js      # /boutiques  → Liste boutiques (boutiques.html)
│   │   ├── boutique/
│   │   │   └── page.js      # /boutique?id=xxx → Détail boutique (boutique.html)
│   │   ├── achats/
│   │   │   └── page.js      # /achats     → Catalogue produits (oda-achats.html)
│   │   ├── produit/
│   │   │   └── page.js      # /produit?id=xxx  → Détail produit (produit.html)
│   │   ├── paiement/
│   │   │   └── page.js      # /paiement   → Checkout (payement.html)
│   │   ├── favoris/
│   │   │   └── page.js      # /favoris    → Mes favoris (favorie.html)
│   │   └── sandbox/
│   │       └── page.js      # /sandbox    → Espace vendeur (sandbox.html)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js        # Header fixe (variants: default/dark/transparent)
│   │   │   └── BottomNav.js     # Navigation mobile 5 onglets (fixe en bas)
│   │   ├── product/
│   │   │   └── ProductCard.js   # Carte produit (variants: grid/list)
│   │   ├── boutique/
│   │   │   └── BoutiqueCard.js  # Carte boutique (variants: dark/light)
│   │   └── ui/
│   │       ├── Loader.js        # Loader animé de démarrage
│   │       ├── LiveNotif.js     # Popup achat live (bas gauche)
│   │       ├── PWAModal.js      # Modal installation PWA (iOS + Android)
│   │       ├── Ticker.js        # Défilement infini produits (2 lignes)
│   │       ├── StatsCounter.js  # Compteurs animés (12k+, 350+, etc.)
│   │       ├── CategoryChips.js # Chips catégories scrollables
│   │       ├── SearchBar.js     # Barre de recherche (variants: hero/header/inline)
│   │       ├── StarRating.js    # Étoiles lecture ou interactive
│   │       ├── Badge.js         # Badge générique (tendance/promo/top…)
│   │       ├── Button.js        # Bouton (variants: primary/outline/gradient…)
│   │       ├── ImageGallery.js  # Galerie swipeable (page produit)
│   │       └── FilterDrawer.js  # Bottom sheet filtres avancés
│   │
│   ├── hooks/
│   │   ├── useCart.js           # Panier → localStorage "oda-cart"
│   │   ├── useFavorites.js      # Favoris → Supabase ou localStorage
│   │   ├── usePWA.js            # Installation PWA (Android/iOS)
│   │   └── useScrollReveal.js   # Animations IntersectionObserver
│   │
│   └── lib/
│       ├── supabase.js          # Client Supabase navigateur (singleton)
│       ├── constants.js         # CATEGORIES, VILLES_CM, NOTIF_DATA, TICKER_PRODUCTS…
│       └── utils.js             # formatPrice, getDiscount, timeAgo, slugify, cn…
│
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

---

## 🗺️ Correspondance HTML → Routes Next.js

| Fichier HTML      | Route Next.js         | Récupération de l'ID     |
|-------------------|-----------------------|--------------------------|
| `index.html`      | `/`                   | —                        |
| `boutiques.html`  | `/boutiques`          | —                        |
| `boutique.html`   | `/boutique?id=xxx`    | `useSearchParams().get('id')` |
| `oda-achats.html` | `/achats`             | —                        |
| `produit.html`    | `/produit?id=xxx`     | `useSearchParams().get('id')` |
| `payement.html`   | `/paiement`           | —                        |
| `favorie.html`    | `/favoris`            | —                        |
| `sandbox.html`    | `/sandbox`            | —                        |

---

## 🎨 Design Tokens

Définis dans `src/app/globals.css` et `tailwind.config.js` :

| Token            | Valeur      | Usage                          |
|------------------|-------------|--------------------------------|
| `--gold`         | `#D4920A`   | Couleur principale accueil     |
| `--terra`        | `#C4622D`   | Dégradé avec gold              |
| `--primary`      | `#FF6B00`   | Orange (boutiques, produits)   |
| `--green`        | `#007A5E`   | Badge vérifié, succès          |
| `--red-cm`       | `#CE1126`   | Couleur drapeau Cameroun       |
| `--bg-dark`      | `#0C0E14`   | Fond sombre (page boutiques)   |
| `--grey-900`     | `#1A1A1A`   | Texte principal                |

**Fonts chargées :**
- `Playfair Display` — titres (accueil)
- `Sora` — texte courant
- `Syne` — titres (page boutiques dark)
- `DM Sans` — texte (page boutiques dark)
- `Inter` — UI générale

---

## 🗄️ Tables Supabase

```sql
-- Utilisateurs (étend auth.users)
CREATE TABLE utilisateurs (
  id          UUID PRIMARY KEY REFERENCES auth.users,
  nom         TEXT,
  telephone   TEXT,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'acheteur',   -- 'acheteur' | 'vendeur' | 'admin'
  ville       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Boutiques
CREATE TABLE boutiques (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendeur_id     UUID REFERENCES utilisateurs,
  nom            TEXT NOT NULL,
  slug           TEXT UNIQUE,
  description    TEXT,
  categorie      TEXT,
  avatar_url     TEXT,
  couverture_url TEXT,
  ville          TEXT,
  note_moyenne   NUMERIC DEFAULT 0,
  nb_avis        INT     DEFAULT 0,
  nb_produits    INT     DEFAULT 0,
  nb_ventes      INT     DEFAULT 0,
  nb_abonnes     INT     DEFAULT 0,
  est_verifie    BOOLEAN DEFAULT false,
  est_actif      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Produits
CREATE TABLE produits (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id    UUID REFERENCES boutiques,
  nom            TEXT NOT NULL,
  slug           TEXT,
  description    TEXT,
  categorie      TEXT,
  prix           NUMERIC NOT NULL,
  prix_original  NUMERIC,
  images         TEXT[]  DEFAULT '{}',
  variantes      JSONB,
  stock          INT     DEFAULT 0,
  nb_ventes      INT     DEFAULT 0,
  note_moyenne   NUMERIC DEFAULT 0,
  nb_avis        INT     DEFAULT 0,
  est_tendance   BOOLEAN DEFAULT false,
  est_promo      BOOLEAN DEFAULT false,
  est_actif      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Avis
CREATE TABLE avis (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id  UUID REFERENCES produits,
  user_id     UUID REFERENCES utilisateurs,
  note        INT  CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Commandes
CREATE TABLE commandes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero              TEXT UNIQUE,
  acheteur_id         UUID REFERENCES utilisateurs,
  lignes              JSONB,
  adresse_livraison   JSONB,
  mode_livraison      TEXT,
  mode_paiement       TEXT,
  telephone_paiement  TEXT,
  sous_total          NUMERIC,
  frais_livraison     NUMERIC,
  total               NUMERIC,
  code_promo          TEXT,
  remise              NUMERIC DEFAULT 0,
  statut              TEXT    DEFAULT 'en_attente',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Favoris
CREATE TABLE favoris (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES utilisateurs,
  produit_id  UUID REFERENCES produits,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, produit_id)
);
```

---

## 📱 PWA (Progressive Web App)

Le manifest est dans `public/manifest.json`.

Pour activer le **Service Worker** (cache hors-ligne) :
```bash
npm install next-pwa
```

Puis dans `next.config.js` :
```js
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' })
module.exports = withPWA({ /* ta config */ })
```

---

## 🛠️ Stack

| Technologie   | Usage                              |
|---------------|------------------------------------|
| Next.js 14    | Framework (App Router)             |
| JavaScript    | Langage (pas TypeScript)           |
| Tailwind CSS  | Styles utilitaires                 |
| Supabase      | BDD + Auth + Storage               |
| next/image    | Optimisation images                |
| next/link     | Navigation client-side             |
| next/navigation | usePathname, useSearchParams     |
