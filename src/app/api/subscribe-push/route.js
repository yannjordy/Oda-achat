import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(req) {
  try {
    const { endpoint, keys, visitor_id, language } = await req.json()
    if (!endpoint) return Response.json({ success: false, error: 'Missing endpoint' }, { status: 400 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { error } = await supabase.from('push_subscriptions').upsert({
      endpoint,
      keys,
      visitor_id: visitor_id || 'anon',
      language: language || 'fr',
      subscribed_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    }, { onConflict: 'endpoint' })

    if (error) throw error

    return Response.json({ success: true })
  } catch (e) {
    console.error('Subscribe push error:', e)
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
