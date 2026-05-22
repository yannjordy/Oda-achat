'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import fr from './translations/fr'
import en from './translations/en'

const LANG_KEY = 'oda_lang'
const translations = { fr, en }

const I18nContext = createContext()

function getBrowserLang() {
  if (typeof window === 'undefined') return 'fr'
  const stored = localStorage.getItem(LANG_KEY)
  if (stored && translations[stored]) return stored
  const browser = navigator.language?.split('-')[0]
  if (browser && translations[browser]) return browser
  return 'fr'
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('fr')

  useEffect(() => {
    setLangState(getBrowserLang())
  }, [])

  const setLang = useCallback((l) => {
    if (!translations[l]) return
    setLangState(l)
    localStorage.setItem(LANG_KEY, l)
    document.documentElement.lang = l
  }, [])

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] || fr }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  return ctx || { lang: 'fr', setLang: () => {}, t: fr }
}
