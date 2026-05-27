'use client'
import { useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'

const CATEGORIES = [
  { value: 'Tous', label: 'Tous les produits', icon: '📦' },
  { value: 'Mode', label: 'Mode', icon: '👗' },
  { value: 'Beauté', label: 'Beauté', icon: '💄' },
  { value: 'Alimentation', label: 'Alimentation', icon: '🥗' },
  { value: 'Électronique', label: 'Électronique', icon: '📱' },
  { value: 'Maison', label: 'Maison', icon: '🏠' },
  { value: 'Sport', label: 'Sport', icon: '⚽' },
  { value: 'Bijoux', label: 'Bijoux', icon: '📿' },
  { value: 'Art', label: 'Art', icon: '🎨' },
  { value: 'Artisanat', label: 'Artisanat', icon: '🧺' },
]

export default function ShareCatalog({ variant = 'fab', onClose }) {
  const { t, lang } = useI18n()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState('Tous')
  const [catalog, setCatalog] = useState(null)

  const generateCatalog = useCallback(async (cat) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/share-catalog?category=${encodeURIComponent(cat)}&lang=${lang}`)
      const data = await res.json()
      if (data.success) {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(data.message)}`
        setCatalog({ message: data.message, waUrl, products: data.products })
      }
    } catch {}
    setLoading(false)
  }, [lang])

  const handleShare = useCallback(async (cat) => {
    await generateCatalog(cat)
  }, [generateCatalog])

  const handleShareWA = useCallback(() => {
    if (catalog?.waUrl) {
      window.open(catalog.waUrl, '_blank')
    }
  }, [catalog])

  if (variant === 'fab') {
    return (
      <>
        <button
          onClick={() => setCatalog(catalog ? null : { message: '', waUrl: '', products: [] })}
          style={{
            position: 'fixed', bottom: 'calc(80px + var(--sab, 0px))', right: 16, zIndex: 999,
            width: 52, height: 52, borderRadius: '50%',
            background: '#25D366', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37,211,102,.4)',
            fontSize: '1.4rem',
          }}
        >
          📢
        </button>

        {catalog && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }} onClick={e => { if (e.target === e.currentTarget) setCatalog(null) }}>
            <div style={{
              background: 'white', width: '100%', maxWidth: 480,
              borderRadius: '20px 20px 0 0', padding: '16px 20px 32px',
              animation: 'slideUp .35s cubic-bezier(.34,1.3,.64,1)',
              maxHeight: '85vh', overflow: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 36, height: 4, background: '#E5E5EA', borderRadius: 4 }} />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px' }}>
                📢 Partager le catalogue
              </h3>
              <p style={{ fontSize: '.82rem', color: '#666', margin: '0 0 16px' }}>
                Choisissez une catégorie à partager sur WhatsApp
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.value} onClick={() => handleShare(cat.value)}
                    disabled={loading}
                    style={{
                      padding: '10px 12px', borderRadius: 10,
                      border: category === cat.value ? '2px solid #25D366' : '1.5px solid #eee',
                      background: category === cat.value ? 'rgba(37,211,102,.08)' : 'white',
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: '.8rem',
                      fontWeight: 600, color: '#333', transition: 'all .2s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                  {t.general.loading}
                </div>
              )}

              {catalog.message && !loading && (
                <div>
                  <div style={{
                    background: '#F0FFF4', borderRadius: 12, padding: 12,
                    fontSize: '.78rem', color: '#2E7D32', lineHeight: 1.6,
                    marginBottom: 12, maxHeight: 200, overflow: 'auto',
                    whiteSpace: 'pre-wrap', fontFamily: 'monospace',
                  }}>
                    {catalog.message}
                  </div>
                  <button onClick={handleShareWA}
                    style={{
                      width: '100%', padding: 14, borderRadius: 12, border: 'none',
                      background: '#25D366', color: 'white', fontWeight: 700,
                      fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    📱 {t.services.sendWA}
                  </button>
                </div>
              )}

              <button onClick={() => setCatalog(null)}
                style={{
                  width: '100%', padding: 12, marginTop: 12,
                  background: '#F2F2F7', border: 'none', borderRadius: 12,
                  fontWeight: 600, fontSize: '.85rem', cursor: 'pointer',
                  color: '#666', fontFamily: 'inherit',
                }}
              >
                {t.general.close}
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return null
}
