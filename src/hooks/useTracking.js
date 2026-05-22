'use client'
import { useEffect } from 'react'
import { trackPageView, trackProductView, trackAddToCart, trackSearch, getVisitorId, getReferrer } from '@/lib/analytics'

export function usePageTracking() {
  useEffect(() => {
    trackPageView()
  }, [])
}

export function useProductTracking(productId, productName) {
  useEffect(() => {
    if (productId) trackProductView(productId, productName)
  }, [productId, productName])
}

export function useReferralDetection() {
  useEffect(() => {
    const code = getReferrer()
    if (code) {
      localStorage.setItem('oda_referral_code', code)
    }
  }, [])
}

export { getVisitorId, getReferrer, trackProductView, trackAddToCart, trackSearch }
