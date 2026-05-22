export function generateReferralCode(userId) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
  const suffix = userId?.toString().slice(-4) || ''
  return code + suffix
}

export function getReferralLink(code) {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.origin)
  url.searchParams.set('ref', code)
  return url.toString()
}

export function getReferralCodeFromUrl() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('ref') || null
}

export function getShareText(code, t) {
  const link = getReferralLink(code)
  return `${t?.referral?.shareWAText || 'Join ODA Market!'}\n\n${link}`
}

export function getShareLink(code, t) {
  return getReferralLink(code)
}
