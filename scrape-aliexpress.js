/**
 * Scraper AliExpress Affiliate → Supabase (ODA Market)
 *
 * Prérequis :
 *   1. Être approuvé au programme AliExpress Affiliate (portals.aliexpress.com)
 *   2. Avoir App Key + App Secret + Access Token
 *   3. Configurer dans .env.local :
 *        ALIEXPRESS_APP_KEY=votre_app_key
 *        ALIEXPRESS_APP_SECRET=votre_app_secret
 *        ALIEXPRESS_ACCESS_TOKEN=votre_access_token
 *        ALIEXPRESS_TRACKING_ID=votre_tracking_id
 *
 * Lancement :
 *   node scrape-aliexpress.js
 *
 * Ce qu'il fait :
 *   - Cherche des produits sur AliExpress par catégorie
 *   - Convertit les prix EUR → FCFA avec marge (× 1.35)
 *   - Stocke dans Supabase avec source = 'aliexpress'
 *   - Ne duplique pas les produits déjà importés (vérifie external_id)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const USER_ID = process.env.ALIEXPRESS_USER_ID || '77d8379b-46da-4506-a1cd-603c2535cc8a';
const MARGIN = 1.35; // × 35% de marge sur le prix AliExpress
const EUR_TO_FCFA = 655.957; // taux fixe FCFA

let AffiliateClient, DropshipperClient;

try {
  const ae = require('ae_sdk');
  AffiliateClient = ae.AffiliateClient;
} catch {
  console.error('❌ ae_sdk non installé. Lance : npm install ae_sdk');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mapping catégories AliExpress → catégories ODA
const CATEGORIES = [
  { name: 'Électronique', keywords: 'smartphone', category_id: '509' },
  { name: 'Électronique', keywords: 'laptop', category_id: '517' },
  { name: 'Électronique', keywords: 'earphones bluetooth', category_id: '514' },
  { name: 'Électronique', keywords: 'smartwatch', category_id: '513' },
  { name: 'Mode', keywords: 'men t-shirt', category_id: '510' },
  { name: 'Mode', keywords: 'women dress', category_id: '510' },
  { name: 'Mode', keywords: 'shoes men', category_id: '515' },
  { name: 'Mode', keywords: 'sunglasses', category_id: '510' },
  { name: 'Maison', keywords: 'kitchen tools', category_id: '511' },
  { name: 'Maison', keywords: 'home decoration', category_id: '511' },
  { name: 'Beauté', keywords: 'skincare', category_id: '512' },
  { name: 'Beauté', keywords: 'makeup', category_id: '512' },
  { name: 'Sport', keywords: 'fitness equipment', category_id: '516' },
  { name: 'Sport', keywords: 'sport shoes', category_id: '516' },
  { name: 'Bijoux', keywords: 'jewelry', category_id: '508' },
  { name: 'Bijoux', keywords: 'watch men', category_id: '508' },
];

function eurToFcfa(eurPrice) {
  const raw = Number(eurPrice) * EUR_TO_FCFA * MARGIN;
  return Math.round(raw / 100) * 100; // arrondi à la centaine sup
}

function buildProductUrl(productId) {
  return `https://www.aliexpress.com/item/${productId}.html`;
}

async function getExistingIds() {
  const { data } = await supabase
    .from('produits')
    .select('external_id')
    .eq('source', 'aliexpress');
  return new Set((data || []).map(r => r.external_id));
}

async function scrapeAndImport() {
  if (!process.env.ALIEXPRESS_APP_KEY || !process.env.ALIEXPRESS_APP_SECRET) {
    console.error('❌ ALIEXPRESS_APP_KEY ou ALIEXPRESS_APP_SECRET manquant dans .env.local');
    console.error('   Ajoutez :');
    console.error('   ALIEXPRESS_APP_KEY=votre_app_key');
    console.error('   ALIEXPRESS_APP_SECRET=votre_app_secret');
    console.error('   ALIEXPRESS_ACCESS_TOKEN=votre_access_token');
    console.error('   ALIEXPRESS_TRACKING_ID=votre_tracking_id');
    process.exit(1);
  }

  const client = new AffiliateClient({
    app_key: process.env.ALIEXPRESS_APP_KEY,
    app_secret: process.env.ALIEXPRESS_APP_SECRET,
    session: process.env.ALIEXPRESS_ACCESS_TOKEN || '',
  });

  console.log('═══════════════════════════════════════════');
  console.log('  Scraper AliExpress → ODA Market');
  console.log(`  Marge appliquée : ${Math.round((MARGIN - 1) * 100)}%`);
  console.log('═══════════════════════════════════════════\n');

  const existingIds = await getExistingIds();
  console.log(`📦 ${existingIds.size} produits AliExpress déjà dans Supabase\n`);

  let totalImported = 0;
  let totalSkipped = 0;

  for (const cat of CATEGORIES) {
    console.log(`📂 ${cat.name} → recherche "${cat.keywords}"...`);

    try {
      const result = await client.queryProducts({
        keywords: cat.keywords,
        category_ids: cat.category_id,
        page_no: '1',
        page_size: '50',
        sort: 'LAST_VOLUME_DESC',
        target_currency: 'EUR',
        target_language: 'FR',
        tracking_id: process.env.ALIEXPRESS_TRACKING_ID || '',
        ship_to_country: 'CM',
      });

      if (!result.ok) {
        console.log(`  ⚠ Erreur API: ${result.message}`);
        continue;
      }

      const products = result.data?.products || [];
      if (products.length === 0) {
        console.log('  → Aucun produit trouvé');
        continue;
      }

      const batch = [];

      for (const p of products) {
        const productId = String(p.product_id);
        if (existingIds.has(productId)) {
          totalSkipped++;
          continue;
        }

        const priceEur = Number(p.sale_price || p.app_sale_price || 0);
        if (!priceEur || priceEur <= 0) continue;

        const priceFcfa = eurToFcfa(priceEur);
        if (priceFcfa < 500 || priceFcfa > 1000000) continue;

        const title = p.product_title || p.subject || '';
        if (!title) continue;

        batch.push({
          user_id: USER_ID,
          nom: title.substring(0, 255),
          description: `${title}\n\n📍 Source : AliExpress\n💰 Prix original : ${priceEur.toFixed(2)} €\n🚚 Livraison internationale disponible\n\n⚠️ Produit expédié depuis AliExpress — délai de livraison : 10-20 jours ouvrables.`,
          prix: priceFcfa,
          prix_promo: null,
          stock: 50,
          categorie: cat.name,
          statut: 'published',
          source: 'aliexpress',
          external_platform: 'aliexpress',
          external_id: productId,
          external_url: buildProductUrl(productId),
          main_image: p.product_main_image_url || p.image_urls?.split(',')?.[0] || '',
          description_images: p.image_urls?.split(',')?.slice(1) || [],
        });

        existingIds.add(productId);
      }

      if (batch.length > 0) {
        for (let i = 0; i < batch.length; i += 10) {
          const chunk = batch.slice(i, i + 10);
          const { error } = await supabase.from('produits').insert(chunk);
          if (error) {
            console.error(`  ❌ Erreur batch: ${error.message}`);
          } else {
            totalImported += chunk.length;
          }
        }
      }

      console.log(`  → ${batch.length} nouveaux, ${totalSkipped} ignorés (total: ${totalImported})`);
    } catch (err) {
      console.log(`  ❌ Erreur: ${err.message}`);
    }

    // Pause entre les catégories pour éviter le rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  Terminé ! ${totalImported} produits importés`);
  console.log(`  ${totalSkipped} existants ignorés`);
  console.log('═══════════════════════════════════════════\n');
}

scrapeAndImport().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
