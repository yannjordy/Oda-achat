import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(req) {
  try {
    const { visitor_id, referral_code, page } = await req.json()
    if (!referral_code) return Response.json({ success: false, error: 'Missing referral code' }, { status: 400 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { error } = await supabase.from('referral_clicks').upsert({
      referral_code,
      visitor_id: visitor_id || 'anon_' + Date.now(),
      page: page || '/',
      clicked_at: new Date().toISOString(),
    }, { onConflict: 'referral_code,visitor_id' })

    if (error) throw error

    return Response.json({ success: true })
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) return Response.json({ success: false, error: 'Missing code' }, { status: 400 })

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data: clicks } = await supabase
      .from('referral_clicks')
      .select('*', { count: 'exact' })
      .eq('referral_code', code)

    return Response.json({
      success: true,
      clicks: clicks?.length || 0,
    })
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
