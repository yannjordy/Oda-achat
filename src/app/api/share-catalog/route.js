import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || 'Tous'
  const wa = searchParams.get('wa')

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    let query = supabase
      .from('produits')
      .select('nom, prix, description, categorie')
      .in('statut', ['published', 'actif', 'active'])
      .gt('stock', 0)
      .limit(20)

    if (category !== 'Tous') {
      query = query.eq('categorie', category)
    }

    const { data: products } = await query

    if (!products?.length) {
      const msg = category === 'Tous'
        ? 'Découvrez ODA Market - La marketplace N°1 du Cameroun ! 🇨🇲\n\nAchetez et vendez facilement sur https://odamarket.cm\n\n#ODAMarket #Cameroun #Shopping'
        : `Découvrez les meilleurs produits ${category} sur ODA Market ! 🇨🇲\n\nhttps://odamarket.cm/achats?categorie=${encodeURIComponent(category)}\n\n#ODAMarket #${category} #Cameroun`

      if (wa) return Response.redirect(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`)
      return Response.json({ success: true, message: msg, products: [] })
    }

    let catalog = `🛍️ *ODA Market - ${category}*\n\n`
    products.forEach((p, i) => {
      catalog += `${i + 1}. ${p.nom} - ${Number(p.prix).toLocaleString('fr-FR')} FCFA\n`
    })
    catalog += `\n👉 https://odamarket.cm/achats?categorie=${encodeURIComponent(category)}\n\n#ODAMarket #Cameroun`

    if (wa) {
      return Response.redirect(`https://wa.me/${wa}?text=${encodeURIComponent(catalog)}`)
    }

    return Response.json({ success: true, message: catalog, products, category })
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
