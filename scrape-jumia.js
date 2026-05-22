/**
 * Scraper Jumia Cameroun → Supabase (ODA Market)
 *
 * Prérequis :
 *   npm install cheerio
 *
 * Lancement :
 *   node scrape-jumia.js
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');

let cheerio;
try {
  cheerio = require('cheerio');
} catch {
  console.error('❌ cheerio non installé. Lance : npm install cheerio');
  process.exit(1);
}

const SUPABASE_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const USER_ID = '77d8379b-46da-4506-a1cd-603c2535cc8a';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORIES = {
  Mode:       ['/catalogue/mode-1070/', '/catalogue/chaussures-3037/'],
  Beauté:     ['/catalogue/beaute-1093/'],
  Électronique: ['/catalogue/electronique-1073/', '/catalogue/telephone-tablette-1090/'],
  Maison:     ['/catalogue/maison-1074/'],
  Sport:      ['/catalogue/sport-1087/'],
  Bijoux:     ['/catalogue/bijoux-3006/'],
};

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      timeout: 15000,
    }, (res) => {
      if ([301, 302, 308].includes(res.statusCode) && res.headers.location) {
        fetchHTML(new URL(res.headers.location, url).href).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function parsePrice(text) {
  const n = parseInt(text.replace(/[^\d]/g, ''));
  return n > 0 ? n : null;
}

async function scrapeCategory(categorie, paths) {
  const products = [];
  const seen = new Set();

  for (const path of paths) {
    for (let page = 1; page <= 5; page++) {
      const url = `https://jumia.cm${path}?page=${page}`;
      console.log(`  📄 ${categorie} page ${page}`);
      try {
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);

        const articles = $('article[data-id]').toArray();
        if (articles.length === 0) {
          console.log('    → Plus de produits, arrêt');
          break;
        }

        for (const el of articles) {
          const $el = $(el);
          const name = $el.find('h3').text().trim() || $el.find('.name').text().trim();
          const key = name.toLowerCase().slice(0, 40);
          if (!name || seen.has(key)) continue;
          seen.add(key);

          const img = $el.find('img').first().attr('data-src') || $el.find('img').first().attr('src') || '';
          const link = $el.find('a').first().attr('href') || '';
          const priceEl = $el.find('.price, .prc, [class*="price"]').first();
          const oldPriceEl = $el.find('.old, .prc-old, [class*="old"]').first();
          const price = parsePrice(priceEl.text());
          const oldPrice = parsePrice(oldPriceEl.text());

          if (!price || price < 200 || price > 500000) continue;

          products.push({
            user_id: USER_ID,
            nom: name.substring(0, 255),
            description: `${name} — Disponible sur Jumia Cameroun. Prix: ${price} FCFA.`,
            prix: price,
            prix_promo: null,
            stock: Math.floor(Math.random() * 40) + 3,
            categorie,
            statut: 'published',
            main_image: img.startsWith('http') ? img : `https://placehold.co/400x400/FF6B00/white?text=${encodeURIComponent(name.slice(0, 20))}`,
            description_images: [],
          });
        }
        console.log(`    → ${products.length} produits cumulés`);

        // Attente polie entre les pages
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
      } catch (err) {
        console.log(`    → Erreur: ${err.message}`);
        break;
      }
    }
  }
  return products;
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Scraper Jumia Cameroun → ODA Market');
  console.log('═══════════════════════════════════════════\n');

  let total = 0, totalOk = 0;

  for (const [cat, paths] of Object.entries(CATEGORIES)) {
    console.log(`\n📂 ${cat}`);
    const products = await scrapeCategory(cat, paths);
    if (products.length === 0) {
      console.log('  ⚠ Aucun produit — la structure Jumia a peut-être changé');
      continue;
    }

    // Insertion par lots de 10
    for (let i = 0; i < products.length; i += 10) {
      const batch = products.slice(i, i + 10);
      const { error } = await supabase.from('produits').insert(batch);
      if (error) console.error('  ❌ Erreur batch:', error.message);
      else totalOk += batch.length;
    }
    total += products.length;
    console.log(`  ✅ ${totalOk} insérés / ${total} trouvés`);
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  Terminé ! ${totalOk} produits insérés dans Supabase`);
  console.log(`═══════════════════════════════════════════`);
}

main().catch(console.error);
