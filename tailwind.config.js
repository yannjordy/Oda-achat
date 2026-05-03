/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens ODA Market — Accueil
        gold:           "#D4920A",
        "gold-light":   "#F2B72B",
        "gold-pale":    "#FFF8E7",
        terra:          "#C4622D",
        "terra-pale":   "#FFF1EB",
        "oda-green":    "#007A5E",
        "green-pale":   "#E6F5F1",
        "red-cm":       "#CE1126",
        // Design tokens ODA Market — Boutiques / Produits
        primary:        "#FF6B00",
        "primary-dark": "#E55D00",
        // Greys
        "grey-50":      "#F5F5F5",
        "grey-100":     "#EBEBEB",
        "grey-200":     "#D6D6D6",
        "grey-400":     "#9E9E9E",
        "grey-700":     "#444444",
        "grey-900":     "#1A1A1A",
        // Dark (boutiques)
        "bg-dark":      "#0C0E14",
        "bg-dark-2":    "#13161F",
      },
      fontFamily: {
        head:  ["Playfair Display", "serif"],
        body:  ["Sora", "sans-serif"],
        syne:  ["Syne", "sans-serif"],
        dm:    ["DM Sans", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "24px",
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,0.06)",
        md: "0 8px 32px rgba(0,0,0,0.10)",
        lg: "0 20px 60px rgba(0,0,0,0.13)",
      },
    },
  },
  plugins: [],
};
