'use client'
import { useI18n } from '@/lib/i18n'

export default function LanguageSwitcher({ compact }) {
  const { lang, setLang } = useI18n()

  if (compact) {
    return (
      <button
        onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        style={{
          background: 'rgba(255,255,255,.1)',
          border: '1px solid rgba(255,255,255,.2)',
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: '.78rem',
          fontWeight: 600,
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all .2s',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <button
        onClick={() => setLang('fr')}
        style={{
          padding: '6px 14px',
          borderRadius: 8,
          border: lang === 'fr' ? '2px solid #FF6B00' : '2px solid #e0e0e0',
          background: lang === 'fr' ? 'rgba(255,107,0,.08)' : 'transparent',
          fontWeight: 600,
          fontSize: '.82rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          color: lang === 'fr' ? '#FF6B00' : '#666',
          transition: 'all .2s',
        }}
      >
        🇫🇷 Français
      </button>
      <button
        onClick={() => setLang('en')}
        style={{
          padding: '6px 14px',
          borderRadius: 8,
          border: lang === 'en' ? '2px solid #FF6B00' : '2px solid #e0e0e0',
          background: lang === 'en' ? 'rgba(255,107,0,.08)' : 'transparent',
          fontWeight: 600,
          fontSize: '.82rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          color: lang === 'en' ? '#FF6B00' : '#666',
          transition: 'all .2s',
        }}
      >
        🇬🇧 English
      </button>
    </div>
  )
}
