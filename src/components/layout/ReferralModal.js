'use client'
import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { generateReferralCode, getReferralLink, getShareText } from '@/lib/referral'
import { trackReferral } from '@/lib/analytics'

export default function ReferralModal({ userId, onClose }) {
  const { t } = useI18n()
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [clicks, setClicks] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('oda_ref_code_' + userId)
    if (stored) {
      setCode(stored)
    } else {
      const newCode = generateReferralCode(userId)
      setCode(newCode)
      localStorage.setItem('oda_ref_code_' + userId, newCode)
    }
  }, [userId])

  useEffect(() => {
    if (!code) return
    fetch(`/api/referral?code=${code}`)
      .then(r => r.json())
      .then(d => { if (d.success) setClicks(d.clicks) })
      .catch(() => {})
  }, [code])

  const shareLink = getReferralLink(code)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      trackReferral(code)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleShareWA = () => {
    const text = getShareText(code, t)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    trackReferral(code)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ODA Market',
          text: getShareText(code, t),
          url: shareLink,
        })
        trackReferral(code)
      } catch {}
    } else {
      handleCopy()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div style={{
        background: 'white', width: '100%', maxWidth: 480,
        borderRadius: '20px 20px 0 0', padding: '20px 24px 32px',
        animation: 'slideUp .35s cubic-bezier(.34,1.3,.64,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, background: '#E5E5EA', borderRadius: 4 }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎁</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>
            {t.referral.title}
          </h2>
          <p style={{ fontSize: '.88rem', color: '#666', margin: 0 }}>
            {t.referral.subtitle}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
          borderRadius: 14, padding: 16, marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#E65100', marginBottom: 6 }}>
            {t.referral.yourCode}
          </div>
          <div style={{
            fontSize: '1.6rem', fontWeight: 900, color: '#FF6B00',
            letterSpacing: 4, fontFamily: 'monospace',
          }}>
            {code}
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 12, marginBottom: 16,
          justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a1a' }}>{clicks}</div>
            <div style={{ fontSize: '.72rem', color: '#999' }}>{t.referral.statsReferrals}</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34C759' }}>{clicks * 500} F</div>
            <div style={{ fontSize: '.72rem', color: '#999' }}>{t.referral.statsEarnings}</div>
          </div>
        </div>

        <div style={{
          background: '#F8F9FA', borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
        }}>
          <input readOnly value={shareLink}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: '.78rem', color: '#666', fontFamily: 'inherit',
              outline: 'none', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          />
          <button onClick={handleCopy}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: copied ? '#34C759' : '#FF6B00', color: 'white',
              fontWeight: 600, fontSize: '.78rem', cursor: 'pointer',
              fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            {copied ? t.general.copied : t.referral.copyLink}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleShareWA}
            style={{
              flex: 1, padding: 12, borderRadius: 12, border: 'none',
              background: '#25D366', color: 'white', fontWeight: 700,
              fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            📱 {t.referral.shareWA}
          </button>
          <button onClick={handleShare}
            style={{
              flex: 1, padding: 12, borderRadius: 12, border: 'none',
              background: '#1877F2', color: 'white', fontWeight: 700,
              fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            🔗 {t.general.share}
          </button>
        </div>

        <button onClick={onClose}
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
  )
}
