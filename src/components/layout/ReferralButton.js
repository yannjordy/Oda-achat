'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import ReferralModal from './ReferralModal'

export default function ReferralButton({ userId, variant = 'inline' }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 12,
            background: 'linear-gradient(135deg, #FF6B00, #FF8F00)',
            border: 'none', cursor: 'pointer', color: 'white',
            fontWeight: 700, fontSize: '.82rem', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(255,107,0,.25)',
            transition: 'all .2s',
          }}
        >
          🎁 {t.referral.title}
        </button>
        {open && <ReferralModal userId={userId} onClose={() => setOpen(false)} />}
      </>
    )
  }

  if (variant === 'fab') {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 140, right: 16, zIndex: 999,
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B00, #FF8F00)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(255,107,0,.4)',
            fontSize: '1.4rem',
          }}
        >
          🎁
        </button>
        {open && <ReferralModal userId={userId} onClose={() => setOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #FF6B00, #FF8F00)',
          color: 'white', fontWeight: 700, fontSize: '.9rem',
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 12px rgba(255,107,0,.25)',
        }}
      >
        🎁 {t.referral.title}
      </button>
      {open && <ReferralModal userId={userId} onClose={() => setOpen(false)} />}
    </>
  )
}
