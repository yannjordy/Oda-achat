'use client'

import { useState, useRef, useCallback } from 'react'

const TERMS_SLIDES = [
  {
    icon: '📋',
    title: 'Bienvenue sur ODA Market',
    body: `ODA Market est une marketplace camerounaise qui met en relation acheteurs et vendeurs locaux.

En utilisant notre plateforme, vous acceptez les présentes conditions d'utilisation.

ODA Market agit comme intermédiaire entre les vendeurs et les acheteurs. Nous ne sommes pas responsables directement de la qualité des produits vendus, mais nous nous engageons à vérifier les boutiques inscrites.`,
  },
  {
    icon: '👤',
    title: 'Compte utilisateur',
    body: `Pour utiliser ODA Market, vous devez créer un compte avec des informations exactes.

Vous êtes responsable de la confidentialité de votre compte et de toutes les activités qui en découlent.

Deux types de comptes sont disponibles :
  • Acheteur — pour parcourir et commander des produits
  • Vendeur — pour gérer une boutique et vendre des produits

Vous pouvez supprimer votre compte à tout moment depuis les paramètres.`,
  },
  {
    icon: '🛒',
    title: 'Commandes & Achats',
    body: `Lorsque vous passez une commande sur ODA Market :

  1. Vous sélectionnez un produit et validez votre commande
  2. Le vendeur reçoit votre demande et la confirme
  3. Le paiement est effectué selon le mode choisi
  4. La livraison est assurée dans le délai indiqué

ODA Market ne garantit pas la disponibilité de tous les produits. Un vendeur peut annuler une commande si le produit n'est plus en stock.

Vous pouvez contacter le vendeur via WhatsApp pour toute question.`,
  },
  {
    icon: '💳',
    title: 'Paiements',
    body: `ODA Market supporte plusieurs modes de paiement :

  • MTN Mobile Money
  • Orange Money
  • Carte bancaire (via Stripe)
  • Paiement à la livraison (espèces)

⚠️ Important : Les paiements Mobile Money ne sont pas encore automatisés. Le transfert est direct entre l'acheteur et le vendeur.

ODA Market ne peut pas garantir la confirmation automatique des paiements Mobile Money. Nous recommandons le paiement à la livraison pour plus de sécurité.

En cas de problème de paiement, contactez le vendeur ou notre support.`,
  },
  {
    icon: '🚚',
    title: 'Livraison',
    body: `La livraison est gérée par les vendeurs partenaires d'ODA Market.

Frais de livraison :
  • Douala : à partir de 1 000 FCFA
  • Autres villes : à partir de 2 500 FCFA
  • Livraison gratuite possible selon le montant

Délais estimés : 2 à 5 jours ouvrables.

Vous pouvez suivre votre commande depuis l'onglet "Mes Commandes". En cas de retard, contactez directement le vendeur.`,
  },
  {
    icon: '🔒',
    title: 'Confidentialité',
    body: `ODA Market collecte vos données pour :

  • Créer et gérer votre compte
  • Traiter vos commandes
  • Améliorer nos services
  • Envoyer des notifications utiles

Vos données ne sont jamais vendues à des tiers.

Nous utilisons Supabase pour le stockage sécurisé des données. Les informations de paiement ne sont pas stockées sur nos serveurs.

Vous pouvez demander la suppression de vos données à tout moment.`,
  },
  {
    icon: '🚫',
    title: 'Interdictions',
    body: `Il est strictement interdit sur ODA Market de :

  • Vendre des produits illégaux ou illicites
  • Publier des contenus offensants ou trompeurs
  • Usurper l'identité d'un autre utilisateur
  • Tenter de contourner les systèmes de paiement
  • Utiliser la plateforme à des fins frauduleuses

Toute violation entraînera la suspension immédiate du compte.

ODA Market se réserve le droit de modérer les contenus et de bannir les utilisateurs non conformes.`,
  },
  {
    icon: '⚖️',
    title: 'Responsabilité',
    body: `ODA Market est un intermédiaire technique et n'est pas responsable :

  • De la qualité des produits vendus par les boutiques
  • Des retards de livraison imputables aux vendeurs
  • Des litiges directs entre acheteurs et vendeurs
  • Des problèmes liés aux paiements Mobile Money

ODA Market s'engage cependant à :
  • Vérifier les boutiques inscrites
  • Faciliter la résolution des litiges
  • Améliorer continuellement la sécurité de la plateforme`,
  },
  {
    icon: '📞',
    title: 'Contact & Support',
    body: `Pour toute question ou réclamation :

  • Email : support@odamarket.cm
  • WhatsApp : via le bouton sur chaque produit
  • Depuis l'application : Aide & Support

Nous nous engageons à répondre dans les 24 heures.

Les conditions d'utilisation peuvent être modifiées à tout moment. Les utilisateurs seront notifiés des changements importants.

Dernière mise à jour : Janvier 2025`,
  },
]

const TERMS_CSS = `
  .terms-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.6);
    backdrop-filter: blur(6px);
    z-index: 9500;
    display: flex; align-items: flex-end; justify-content: center;
    animation: terms-fi .25s ease;
  }
  @keyframes terms-fi { from { opacity: 0 } to { opacity: 1 } }

  .terms-sheet {
    background: var(--bg-primary, #fff);
    border-radius: 24px 24px 0 0;
    width: 100%; max-width: 540px;
    max-height: 92vh;
    overflow: hidden;
    display: flex; flex-direction: column;
    animation: terms-su .35s cubic-bezier(.25,.46,.45,.94);
  }
  @keyframes terms-su { from { transform: translateY(100%) } to { transform: translateY(0) } }

  .terms-header {
    padding: 14px 20px 12px;
    border-bottom: 1px solid var(--border-color, #E5E7EB);
    display: flex; align-items: center; gap: 12px;
    flex-shrink: 0;
  }
  .terms-handle {
    width: 36px; height: 4px;
    background: var(--border-color, #E5E7EB);
    border-radius: 2px; margin: 0 auto;
  }
  .terms-title {
    flex: 1; font-size: 1rem; font-weight: 800;
    color: var(--text-primary, #1A1A1A);
  }
  .terms-close {
    width: 32px; height: 32px; border-radius: 50%;
    border: none; background: var(--bg-secondary, #F8F9FA);
    color: var(--text-secondary, #6B7280);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 1rem; flex-shrink: 0;
  }

  .terms-body {
    flex: 1; overflow: hidden; position: relative;
  }

  .terms-track {
    display: flex;
    transition: transform .35s cubic-bezier(.25,.46,.45,.94);
    height: 100%;
  }

  .terms-slide {
    min-width: 100%;
    padding: 28px 24px 20px;
    overflow-y: auto;
    display: flex; flex-direction: column; align-items: center;
  }

  .terms-slide-icon {
    width: 64px; height: 64px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255,107,0,.1), rgba(255,107,0,.04));
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; margin-bottom: 18px;
  }

  .terms-slide-title {
    font-size: 1.2rem; font-weight: 800;
    color: var(--text-primary, #1A1A1A);
    text-align: center; margin-bottom: 14px;
  }

  .terms-slide-text {
    font-size: .9rem; line-height: 1.75;
    color: var(--text-secondary, #6B7280);
    white-space: pre-line; text-align: left;
    max-width: 440px;
  }

  .terms-footer {
    padding: 14px 20px 24px;
    border-top: 1px solid var(--border-color, #E5E7EB);
    flex-shrink: 0;
  }

  .terms-dots {
    display: flex; justify-content: center; gap: 6px;
    margin-bottom: 16px;
  }
  .terms-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--border-color, #E5E7EB);
    transition: all .25s ease;
  }
  .terms-dot.active {
    width: 24px; border-radius: 4px;
    background: var(--primary-color, #FF6B00);
  }

  .terms-nav-row {
    display: flex; gap: 10px;
  }
  .terms-btn-prev, .terms-btn-next {
    flex: 1; padding: 14px;
    border-radius: 14px; font-weight: 700;
    font-size: .95rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all .2s; font-family: inherit;
  }
  .terms-btn-prev {
    background: var(--bg-secondary, #F8F9FA);
    color: var(--text-secondary, #6B7280);
    border: 1.5px solid var(--border-color, #E5E7EB);
  }
  .terms-btn-prev:hover { background: var(--border-color, #E5E7EB); }
  .terms-btn-next {
    background: linear-gradient(135deg, var(--primary-color, #FF6B00), #E55D00);
    color: #fff; border: none;
    box-shadow: 0 4px 14px rgba(255,107,0,.3);
  }
  .terms-btn-next:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,107,0,.35); }
  .terms-btn-next:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }

  .terms-btn-accept {
    width: 100%; padding: 15px;
    border-radius: 14px; font-weight: 700;
    font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #10B981, #059669);
    color: #fff; border: none;
    box-shadow: 0 4px 14px rgba(16,185,129,.3);
    transition: all .2s; font-family: inherit;
    margin-top: 10px;
  }
  .terms-btn-accept:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,.4); }
`

export default function TermsModal({ isOpen, onClose, onAccept }) {
  const [slide, setSlide] = useState(0)
  const touchRef = useRef({ x: 0, y: 0 })

  const go = useCallback((dir) => {
    setSlide(prev => {
      const next = prev + dir
      return Math.max(0, Math.min(TERMS_SLIDES.length - 1, next))
    })
  }, [])

  const handleTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    if (Math.abs(dx) > 50) {
      go(dx > 0 ? -1 : 1)
    }
  }

  const handleAccept = () => {
    localStorage.setItem('oda-terms-accepted', new Date().toISOString())
    if (onAccept) onAccept()
    onClose()
  }

  if (!isOpen) return null

  const isLast = slide === TERMS_SLIDES.length - 1
  const isFirst = slide === 0

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TERMS_CSS }} />
      <div className="terms-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="terms-sheet">

          {/* Header */}
          <div className="terms-header">
            <div className="terms-handle" />
            <div className="terms-title">Conditions d'utilisation</div>
            <button className="terms-close" onClick={onClose}>✕</button>
          </div>

          {/* Slides */}
          <div
            className="terms-body"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="terms-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
              {TERMS_SLIDES.map((s, i) => (
                <div key={i} className="terms-slide">
                  <div className="terms-slide-icon">{s.icon}</div>
                  <div className="terms-slide-title">{s.title}</div>
                  <div className="terms-slide-text">{s.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="terms-footer">
            <div className="terms-dots">
              {TERMS_SLIDES.map((_, i) => (
                <div key={i} className={`terms-dot${i === slide ? ' active' : ''}`} />
              ))}
            </div>
            <div className="terms-nav-row">
              <button className="terms-btn-prev" onClick={() => go(-1)} disabled={isFirst}>
                ← Précédent
              </button>
              <button className="terms-btn-next" onClick={() => go(1)} disabled={isLast}>
                Suivant →
              </button>
            </div>
            {isLast && (
              <button className="terms-btn-accept" onClick={handleAccept}>
                ✅ J'accepte les conditions
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
