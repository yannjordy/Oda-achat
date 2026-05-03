// src/lib/constants.js
// ─────────────────────────────────────────────────────────────
// Constantes partagées dans toute l'application
// ─────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { value: 'mode',          label: 'Mode',          icon: '👗' },
  { value: 'beaute',        label: 'Beauté',         icon: '💄' },
  { value: 'alimentation',  label: 'Alimentation',   icon: '🥗' },
  { value: 'art',           label: 'Art',            icon: '🎨' },
  { value: 'artisanat',     label: 'Artisanat',      icon: '🧺' },
  { value: 'maison',        label: 'Maison',         icon: '🏠' },
  { value: 'sport',         label: 'Sport',          icon: '⚽' },
  { value: 'electronique',  label: 'Électronique',   icon: '📱' },
  { value: 'bijoux',        label: 'Bijoux',         icon: '📿' },
  { value: 'autre',         label: 'Autre',          icon: '✨' },
]

export const VILLES_CM = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Bamenda',
  'Kribi',
  'Ngaoundéré',
  'Garoua',
  'Maroua',
  'Bertoua',
  'Ebolowa',
]

export const MODES_PAIEMENT = [
  { value: 'mtn_momo',      label: 'MTN Mobile Money', color: '#FFCB05', logo: '🟡' },
  { value: 'orange_money',  label: 'Orange Money',      color: '#FF6600', logo: '🟠' },
  { value: 'wave',          label: 'Wave',              color: '#0096FF', logo: '🔵' },
]

export const FRAIS_LIVRAISON = {
  Douala:     500,
  Yaoundé:    500,
  Bafoussam:  1000,
  Bamenda:    1000,
  Kribi:      1500,
  Ngaoundéré: 2000,
  Garoua:     2000,
  Maroua:     2500,
  Bertoua:    2000,
  Ebolowa:    1500,
}

export const NOTIF_DATA = [
  { icon: '👗', title: 'Robe Wax Kente achetée',  sub: 'Il y a 12s · Douala, Akwa',      price: '8 500 F' },
  { icon: '🥥', title: 'Huile de Coco achetée',   sub: 'Il y a 28s · Yaoundé, Bastos',   price: '3 200 F' },
  { icon: '🧵', title: 'Pagne Traditionnel',       sub: 'Il y a 45s · Bafoussam',         price: '6 500 F' },
  { icon: '🌶️', title: 'Épices Yaoundé Mix',      sub: 'Il y a 1 min · Douala, Bali',    price: '1 800 F' },
  { icon: '🧼', title: 'Savon Karité acheté',      sub: 'Il y a 2 min · Kribi',           price: '1 500 F' },
  { icon: '📿', title: 'Bijoux Perles achetés',    sub: 'Il y a 3 min · Douala, Bonanjo', price: '4 000 F' },
  { icon: '🍅', title: 'Sauce Tomate CM',          sub: 'Il y a 4 min · Ngaoundéré',      price: '900 F'   },
  { icon: '🎨', title: 'Tissu Bogolan acheté',     sub: 'Il y a 5 min · Bamenda',         price: '5 500 F' },
]

export const TICKER_PRODUCTS = [
  { name: 'Robe Wax Kente',     shop: 'Wax & Style',      price: '8 500 F',  icon: '👗', hot: true,  sold: '42 vendus'  },
  { name: 'Huile de Coco Bio',  shop: 'Beauté Naturelle', price: '3 200 F',  icon: '🥥', hot: false, sold: '89 vendus'  },
  { name: 'Ndolé épicé 500g',   shop: 'Mama Koki',        price: '2 800 F',  icon: '🥗', hot: true,  sold: '127 vendus' },
  { name: 'Bijoux Perles',      shop: 'Art du Cameroun',  price: '4 000 F',  icon: '📿', hot: false, sold: '31 vendus'  },
  { name: 'Pagne Traditionnel', shop: 'Fleur Wax Douala', price: '6 500 F',  icon: '🧵', hot: true,  sold: '56 vendus'  },
  { name: 'Savon Karité CM',    shop: 'Beauté Naturelle', price: '1 500 F',  icon: '🧼', hot: false, sold: '204 vendus' },
  { name: 'Statue Bamiléké',    shop: 'Art du Cameroun',  price: '12 000 F', icon: '🗿', hot: false, sold: '18 vendus'  },
  { name: 'Épices Yaoundé Mix', shop: 'Mama Koki',        price: '1 800 F',  icon: '🌶️', hot: true,  sold: '93 vendus'  },
  { name: 'Tissu Bogolan',      shop: 'Wax & Style',      price: '5 500 F',  icon: '🎨', hot: true,  sold: '37 vendus'  },
  { name: 'Crème Cacao Pur',    shop: 'Beauté Naturelle', price: '2 500 F',  icon: '✨', hot: false, sold: '61 vendus'  },
  { name: 'Vannerie Artisanale',shop: 'Art du Cameroun',  price: '3 800 F',  icon: '🧺', hot: false, sold: '22 vendus'  },
  { name: 'Sauce Tomate CM',    shop: 'Mama Koki',        price: '900 F',    icon: '🍅', hot: true,  sold: '315 vendus' },
]
