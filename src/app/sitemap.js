export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default async function sitemap() {
  const baseUrl = 'https://odamarket.cm'

  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' },
    { url: `${baseUrl}/achats`, priority: 0.9, changeFrequency: 'hourly' },
    { url: `${baseUrl}/services`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/boutiques`, priority: 0.8, changeFrequency: 'daily' },
    { url: `${baseUrl}/favorie`, priority: 0.3, changeFrequency: 'weekly' },
  ]

  let productUrls = []
  let serviceUrls = []
  let shopUrls = []

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const [products, services, shops] = await Promise.all([
      supabase.from('produits').select('id, nom, updated_at').in('statut', ['published', 'actif', 'active']).gt('stock', 0).limit(1000),
      supabase.from('services').select('id, nom, created_at').eq('statut', 'actif').limit(500),
      supabase.from('parametres_boutique').select('user_id, config, updated_at').limit(500),
    ])

    if (products.data) {
      productUrls = products.data.map(p => ({
        url: `${baseUrl}/produit?id=${p.id}`,
        priority: 0.7,
        changeFrequency: 'daily',
        lastModified: p.updated_at,
      }))
    }

    if (services.data) {
      serviceUrls = services.data.map(s => ({
        url: `${baseUrl}/services#${s.id}`,
        priority: 0.6,
        changeFrequency: 'weekly',
        lastModified: s.created_at,
      }))
    }

    if (shops.data) {
      shopUrls = shops.data.map(s => {
        const slug = s.config?.identifiant?.slug || s.user_id
        return {
          url: `${baseUrl}/boutique?shop=${slug}`,
          priority: 0.6,
          changeFrequency: 'daily',
          lastModified: s.updated_at,
        }
      })
    }
  } catch {}

  return [...staticPages, ...productUrls, ...serviceUrls, ...shopUrls]
}
