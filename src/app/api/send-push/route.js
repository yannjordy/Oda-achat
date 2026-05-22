import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function getWebpush() {
  const webpush = await import('web-push')
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (publicKey && privateKey) {
    webpush.default.setVapidDetails('mailto:contact@odamarket.cm', publicKey, privateKey)
  }
  return webpush.default
}

export async function POST(req) {
  try {
    const { title, body, icon, url, segment } = await req.json()
    if (!title || !body) return Response.json({ success: false, error: 'Missing title or body' }, { status: 400 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    let query = supabase.from('push_subscriptions').select('*')
    if (segment && segment !== 'all') {
      query = query.eq('language', segment)
    }

    const { data: subscriptions } = await query
    if (!subscriptions?.length) return Response.json({ success: true, sent: 0, total: 0 })

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY

    if (!publicKey || !privateKey) {
      return Response.json({
        success: false,
        error: 'VAPID keys not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local',
      }, { status: 500 })
    }

    const webpush = await getWebpush()

    const payload = {
      title,
      body,
      icon: icon || '/images/icon-192x192.png',
      badge: '/images/icon-192x192.png',
      data: { url: url || '/', click_action: url || '/' },
    }

    let sent = 0
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: sub.keys,
          }, JSON.stringify(payload))
          sent++
          return { endpoint: sub.endpoint, success: true }
        } catch (err) {
          if (err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          }
          return { endpoint: sub.endpoint, success: false, error: err.message }
        }
      })
    )

    return Response.json({
      success: true,
      sent,
      total: subscriptions.length,
      results: results.map(r => r.value),
    })
  } catch (e) {
    console.error('Send push error:', e)
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
