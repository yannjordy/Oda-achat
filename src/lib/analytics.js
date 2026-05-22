const ANALYTICS_ENABLED = true
const TRACK_API = '/api/track'

export function getVisitorId() {
  if (typeof window === 'undefined') return null
  let id = localStorage.getItem('oda_visitor_id')
  if (!id) {
    id = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('oda_visitor_id', id)
  }
  return id
}

export function getReferrer() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('ref') || null
}

export async function trackEvent(event, data = {}) {
  if (!ANALYTICS_ENABLED) return
  try {
    const payload = {
      visitor_id: getVisitorId(),
      event,
      page: window.location.pathname,
      referrer: document.referrer || null,
      referral_code: getReferrer(),
      user_agent: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
      language: navigator.language,
      ...data,
    }
    navigator.sendBeacon?.(TRACK_API, JSON.stringify(payload))
  } catch {}
}

export function trackPageView() {
  if (typeof window === 'undefined') return
  trackEvent('page_view')
  if (getReferrer()) {
    trackEvent('referral_click', { ref_code: getReferrer() })
  }
}

export function trackProductView(productId, productName) {
  trackEvent('product_view', { product_id: productId, product_name: productName })
}

export function trackAddToCart(productId, productName, price) {
  trackEvent('add_to_cart', { product_id: productId, product_name: productName, price })
}

export function trackOrder(amount, method) {
  trackEvent('order', { amount, payment_method: method })
}

export function trackSearch(query) {
  trackEvent('search', { query })
}

export function trackShare(platform) {
  trackEvent('share', { platform })
}

export function trackInstall() {
  trackEvent('pwa_install')
}

export function trackReferral(code) {
  trackEvent('referral_share', { code })
}
