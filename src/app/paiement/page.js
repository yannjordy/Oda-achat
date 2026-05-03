// src/app/paiement/page.js
// ═══════════════════════════════════════════════════════════════
// PAGE : Paiement / Checkout   →   /paiement
// Fichier source : payement.html
// ═══════════════════════════════════════════════════════════════
//
// SECTIONS À CODER :
//
//  1. <Header variant="transparent" showBack title="Paiement" />
//     - Bouton retour ← → /achats
//
//  2. Stepper visuel — 3 étapes
//     [ 1. Récapitulatif ] ──── [ 2. Livraison ] ──── [ 3. Paiement ]
//     - Étape active : couleur primary
//     - Étapes passées : vert avec ✓
//     - Navigation : boutons "Suivant" / "Précédent"
//
//  ── ÉTAPE 1 : Récapitulatif ─────────────────────────────────
//  - Liste des articles du panier (depuis useCart())
//    · Image, nom, variante choisie, quantité, prix ligne
//    · Bouton modifier quantité ou retirer
//  - Champ code promo (input + bouton "Appliquer")
//  - Tableau récap :
//    · Sous-total
//    · Remise promo (si applicable)
//    · Frais de livraison (calculés selon mode choisi)
//    · TOTAL (en gras, couleur primary)
//  - Bouton "Continuer →"
//
//  ── ÉTAPE 2 : Informations de Livraison ─────────────────────
//  - Champ Nom complet *
//  - Champ Téléphone (format +237…) *
//  - Select Ville (VILLES_CM) *
//  - Champ Quartier / Adresse précise *
//  - Choix mode livraison :
//    · 🚚 Livraison à domicile (frais selon ville)
//    · 🏪 Retrait en boutique (gratuit)
//  - Bouton "Continuer →"
//
//  ── ÉTAPE 3 : Paiement ──────────────────────────────────────
//  - Sélection opérateur (cards cliquables) :
//    · MTN Mobile Money  (jaune)
//    · Orange Money      (orange)
//    · Wave              (bleu)
//  - Champ "Numéro de paiement" (pré-rempli si connu)
//  - Récapitulatif montant final
//  - Bouton "✅ Confirmer et payer X F CFA"
//    → Appel Supabase : INSERT dans `commandes`
//
//  3. Modal Confirmation
//     - Succès : animation ✅, numéro commande, lien suivi
//     - Erreur  : message d'erreur, bouton réessayer
//
// ───────────────────────────────────────────────────────────────
// SUPABASE :
//   const { data, error } = await supabase
//     .from('commandes')
//     .insert({
//       numero: genNumeroCommande(),   // ex: ODA-2024-XXXXX
//       acheteur_id: user.id,
//       lignes: panierItems,
//       adresse_livraison: adresse,
//       mode_livraison: modeLivraison,
//       mode_paiement: modeP,
//       telephone_paiement: telPaiement,
//       sous_total: sousTotal,
//       frais_livraison: fraisLiv,
//       total: total,
//       statut: 'en_attente',
//     })
//     .select()
//     .single();
// ═══════════════════════════════════════════════════════════════

'use client'

export default function PaiementPage() {
  return (
    <main>
      {/* TODO : coder la page de paiement */}
    </main>
  );
}
