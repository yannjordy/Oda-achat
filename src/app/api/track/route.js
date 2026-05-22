import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(req) {
  try {
    const data = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { error: visitError } = await supabase.from('visiteurs').insert({
      visitor_id: data.visitor_id,
      event: data.event,
      page: data.page,
      referrer: data.referrer,
      referral_code: data.referral_code,
      user_agent: data.user_agent?.substring(0, 500),
      screen: data.screen,
      language: data.language,
      metadata: data.product_id ? { product_id: data.product_id, product_name: data.product_name } : null,
    })
    if (visitError) console.error('Track error:', visitError)

    if (data.referral_code) {
      const { error: refError } = await supabase.from('referral_clicks').upsert({
        referral_code: data.referral_code,
        visitor_id: data.visitor_id,
        page: data.page,
        clicked_at: new Date().toISOString(),
      }, { onConflict: 'referral_code,visitor_id' })
      if (refError) console.error('Referral track error:', refError)
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error('Track API error:', e)
    return Response.json({ success: false }, { status: 500 })
  }
}
