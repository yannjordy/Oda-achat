'use client'
import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { I18nProvider } from '@/lib/i18n'
import { trackPageView, getReferrer } from '@/lib/analytics'

function TrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = getReferrer()
    if (ref) localStorage.setItem('oda_referral_code', ref)
    trackPageView()
  }, [pathname, searchParams])

  return null
}

function Tracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  )
}

export default function PageTracker({ children }) {
  return (
    <I18nProvider>
      <Tracker />
      {children}
    </I18nProvider>
  )
}
