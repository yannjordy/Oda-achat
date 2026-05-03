'use client'

import { useState, useRef, useCallback } from 'react'

const WARNING_SLIDES = [
  {
    icon: '⚠️',
    title: 'Attention — Avant de commander',
    body: `ODA Market facilite la mise en relation entre acheteurs et vendeurs. Avant de finaliser votre commande, veuillez lire attentivement les informations suivantes concernant les paiements.

En continuant, vous reconnaissez avoir compris les risques associés à chaque mode de paiement.`,
    severity: 'info',
  },
  {
    icon: '📞',
    title: 'Paiement Mobile Money',
    body: `Les paiements via MTN Mobile Money et Orange Money ne sont PAS automatisés sur ODA Market.

⚠️ Risques :
  • Le transfert est DIRECT entre vous et le vendeur
  • Aucune confirmation automatique par l'application
  • En cas d'erreur de numéro, le remboursement n'est pas garanti
  • ODA Market ne peut pas vérifier que le paiement a bien été reçu

✅ Conseils :
  • Vérifiez bien le numéro du vendeur avant d'envoyer
  • Gardez une capture d'écran de la transaction
  • Contactez le vendeur après le paiement`,
    severity: 'warning',
  },
  {
    icon: '💵',
    title: 'Paiement à la livraison — Recommandé',
    body: `Le paiement à la livraison est le mode de paiement le PLUS SÛR sur ODA Market.

✅ Avantages :
  • Vous payez uniquement quand vous recevez le produit
  • Vous pouvez vérifier le produit avant de payer
  • Aucun risque de fraude ou d'erreur de transfert
  • Pas de risque lié au Mobile Money

Ce mode est fortement recommandé, surtout pour votre première commande.`,
    severity: 'safe',
  },
  {
    icon: '💳',
    title: 'Paiement par Carte Bancaire',
    body: `Si le vendeur a configuré Stripe, vous pouvez payer par carte bancaire.

✅ Sécurisé :
  • Paiement traité par Stripe (leader mondial)
  • Vos données bancaires ne sont jamais stockées sur ODA Market
  • Protection contre la fraude
  • Confirmation automatique du paiement

⚠️ Vérifiez que le lien de paiement est bien configuré par le vendeur avant d'utiliser ce mode.`,
    severity: 'safe',
  },
  {
    icon: '🛡️',
    title: 'Protection de l\'acheteur',
    body: `ODA Market s'engage à protéger vos achats :

✅ Ce que nous faisons :
  • Vérification des boutiques inscrites
  • Système d'avis et de notes
  • Médiation en cas de litige
  • Possibilité de signaler un vendeur

❌ Ce que nous NE garantissons PAS :
  • La qualité exacte du produit reçu
  • Le délai de livraison (dépend du vendeur)
  • Le remboursement automatique en cas de problème

En cas de problème, contactez le vendeur via WhatsApp ou notre support.`,
    severity: 'info',
  },
]

const PAYMENT_CSS = `
  .pw-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.65);
    backdrop-filter: blur(8px);
    z-index: 8500;
    display: flex; align-items: flex-end; justify-content: center;
    animation: pw-fi .25s ease;
  }
  @keyframes pw-fi { from { opacity: 0 } to { opacity: 1 } }

  .pw-sheet {
    background: var(--bg-primary, #fff);
    border-radius: 24px 24px 0 0;
    width: 100%; max-width: 540px;
    max-height: 94vh;
    overflow: hidden;
    display: flex; flex-direction: column;
    animation: pw-su .35s cubic-bezier(.25,.46,.45,.94);
  }
  @keyframes pw-su { from { transform: translateY(100%) } to { transform: translateY(0) } }

  .pw-header {
    padding: 14px 20px 12px;
    border-bottom: 1px solid var(--border-color, #E5E7EB);
    display: flex; align-items: center; gap: 12px;
    flex-shrink: 0;
  }
  .pw-handle {
    width: 36px; height: 4px;
    background: var(--border-color, #E5E7EB);
    border-radius: 2px;
  }
  .pw-title {
    flex: 1; font-size: 1rem; font-weight: 800;
    color: var(--text-primary, #1A1A1A);
    display: flex; align-items: center; gap: 8px;
  }
  .pw-close {
    width: 32px; height: 32px; border-radius: 50%;
    border: none; background: var(--bg-secondary, #F8F9FA);
    color: var(--text-secondary, #6B7280);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 1rem; flex-shrink: 0;
  }

  .pw-body {
    flex: 1; overflow: hidden; position: relative;
  }

  .pw-track {
    display: flex;
    transition: transform .35s cubic-bezier(.25,.46,.45,.94);
    height: 100%;
  }

  .pw-slide {
    min-width: 100%;
    padding: 24px 22px 20px;
    overflow-y: auto;
    display: flex; flex-direction: column; align-items: center;
  }

  .pw-slide-icon {
    width: 64px; height: 64px;
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; margin-bottom: 16px;
  }
  .pw-slide-icon.info    { background: linear-gradient(135deg, rgba(59,130,246,.12), rgba(59,130,246,.04)); }
  .pw-slide-icon.warning { background: linear-gradient(135deg, rgba(245,158,11,.15), rgba(245,158,11,.04)); }
  .pw-slide-icon.safe    { background: linear-gradient(135deg, rgba(16,185,129,.12), rgba(16,185,129,.04)); }

  .pw-slide-title {
    font-size: 1.15rem; font-weight: 800;
    color: var(--text-primary, #1A1A1A);
    text-align: center; margin-bottom: 12px;
  }

  .pw-slide-text {
    font-size: .88rem; line-height: 1.8;
    white-space: pre-line; text-align: left;
    max-width: 440px;
  }
  .pw-slide-text.info-text    { color: var(--text-secondary, #6B7280); }
  .pw-slide-text.warning-text { color: #92400E; }
  .pw-slide-text.safe-text    { color: #065F46; }

  .pw-footer {
    padding: 14px 20px 28px;
    border-top: 1px solid var(--border-color, #E5E7EB);
    flex-shrink: 0;
  }

  .pw-dots {
    display: flex; justify-content: center; gap: 6px;
    margin-bottom: 16px;
  }
  .pw-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--border-color, #E5E7EB);
    transition: all .25s ease;
  }
  .pw-dot.active {
    width: 24px; border-radius: 4px;
    background: var(--primary-color, #FF6B00);
  }
  .pw-dot.warn { background: #F59E0B; }
  .pw-dot.warn.active { background: #F59E0B; }
  .pw-dot.safe { background: #10B981; }
  .pw-dot.safe.active { background: #10B981; }

  .pw-nav-row {
    display: flex; gap: 10px;
  }
  .pw-btn-prev, .pw-btn-next {
    flex: 1; padding: 14px;
    border-radius: 14px; font-weight: 700;
    font-size: .95rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all .2s; font-family: inherit;
  }
  .pw-btn-prev {
    background: var(--bg-secondary, #F8F9FA);
    color: var(--text-secondary, #6B7280);
    border: 1.5px solid var(--border-color, #E5E7EB);
  }
  .pw-btn-prev:hover { background: var(--border-color, #E5E7EB); }
  .pw-btn-next {
    background: linear-gradient(135deg, var(--primary-color, #FF6B00), #E55D00);
    color: #fff; border: none;
    box-shadow: 0 4px 14px rgba(255,107,0,.3);
  }
  .pw-btn-next:hover { transform: translateY(-1px); }
  .pw-btn-next:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }

  .pw-btn-confirm {
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
  .pw-btn-confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,.4); }

  .pw-checkbox-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 14px; margin-bottom: 12px;
    background: var(--bg-secondary, #F8F9FA);
    border-radius: 12px; border: 1.5px solid var(--border-color, #E5E7EB);
  }
  .pw-checkbox-row input[type="checkbox"] {
    width: 20px; height: 20px; margin-top: 2px; flex-shrink: 0;
    accent-color: var(--primary-color, #FF6B00);
  }
  .pw-checkbox-label {
    font-size: .85rem; line-height: 1.5;
    color: var(--text-primary, #1A1A1A); font-weight: 600;
  }
  .pw-btn-confirm:disabled {
    opacity: .5; cursor: not-allowed; transform: none; box-shadow: none;
  }
`

export default function PaymentWarningModal({ isOpen, onClose, onConfirm }) {
  const [slide, setSlide] = useState(0)
  const [checked, setChecked] = useState(false)
  const touchRef = useRef({ x: 0, y: 0 })

  const go = useCallback((dir) => {
    setSlide(prev => {
      const next = prev + dir
      return Math.max(0, Math.min(WARNING_SLIDES.length - 1, next))
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

  const handleConfirm = () => {
    if (!checked) return
    localStorage.setItem('oda-payment-warning-accepted', new Date().toISOString())
    onConfirm()
    onClose()
  }

  const handleClose = () => {
    setSlide(0)
    setChecked(false)
    onClose()
  }

  if (!isOpen) return null

  const isLast = slide === WARNING_SLIDES.length - 1
  const isFirst = slide === 0
  const current = WARNING_SLIDES[slide]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAYMENT_CSS }} />
      <div className="pw-overlay" onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
        <div className="pw-sheet">

          {/* Header */}
          <div className="pw-header">
            <div className="pw-handle" />
            <div className="pw-title">
              ⚠️ Informations paiement
            </div>
            <button className="pw-close" onClick={handleClose}>✕</button>
          </div>

          {/* Slides */}
          <div
            className="pw-body"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="pw-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
              {WARNING_SLIDES.map((s, i) => (
                <div key={i} className="pw-slide">
                  <div className={`pw-slide-icon ${s.severity}`}>{s.icon}</div>
                  <div className="pw-slide-title">{s.title}</div>
                  <div className={`pw-slide-text ${s.severity === 'warning' ? 'warning-text' : s.severity === 'safe' ? 'safe-text' : 'info-text'}`}>
                    {s.body}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pw-footer">
            <div className="pw-dots">
              {WARNING_SLIDES.map((s, i) => (
                <div
                  key={i}
                  className={`pw-dot${i === slide ? ' active' : ''} ${s.severity === 'warning' ? ' warn' : ''} ${s.severity === 'safe' ? ' safe' : ''}`}
                />
              ))}
            </div>

            {isLast ? (
              <>
                <div className="pw-checkbox-row">
                  <input
                    type="checkbox"
                    id="pw-ack"
                    checked={checked}
                    onChange={e => setChecked(e.target.checked)}
                  />
                  <label htmlFor="pw-ack" className="pw-checkbox-label">
                    J'ai lu et compris les risques liés aux paiements. Je souhaite poursuivre ma commande.
                  </label>
                </div>
                <button
                  className="pw-btn-confirm"
                  onClick={handleConfirm}
                  disabled={!checked}
                >
                  ✅ Continuer la commande
                </button>
              </>
            ) : (
              <div className="pw-nav-row">
                <button className="pw-btn-prev" onClick={() => go(-1)} disabled={isFirst}>
                  ← Précédent
                </button>
                <button className="pw-btn-next" onClick={() => go(1)}>
                  Suivant →
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
