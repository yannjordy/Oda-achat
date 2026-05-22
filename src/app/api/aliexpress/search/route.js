import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function getClient() {
  const { AffiliateClient } = await import('ae_sdk');

  if (!process.env.ALIEXPRESS_APP_KEY || !process.env.ALIEXPRESS_APP_SECRET) {
    return null;
  }

  return new AffiliateClient({
    app_key: process.env.ALIEXPRESS_APP_KEY,
    app_secret: process.env.ALIEXPRESS_APP_SECRET,
    session: process.env.ALIEXPRESS_ACCESS_TOKEN || '',
  });
}

export async function POST(req) {
  try {
    const client = await getClient();
    if (!client) {
      return NextResponse.json(
        { error: 'AliExpress non configuré. Ajoutez ALIEXPRESS_APP_KEY et ALIEXPRESS_APP_SECRET dans .env.local' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      keywords = '',
      page_no = '1',
      page_size = '20',
      sort = 'SALE_PRICE_ASC',
      min_sale_price,
      max_sale_price,
      ship_to_country = 'CM',
      target_currency = 'EUR',
      target_language = 'FR',
      category_ids,
    } = body;

    const params = {
      keywords,
      page_no: String(page_no),
      page_size: String(page_size),
      sort,
      ship_to_country,
      target_currency,
      target_language,
    };

    if (process.env.ALIEXPRESS_TRACKING_ID) {
      params.tracking_id = process.env.ALIEXPRESS_TRACKING_ID;
    }
    if (min_sale_price) params.min_sale_price = String(min_sale_price);
    if (max_sale_price) params.max_sale_price = String(max_sale_price);
    if (category_ids) params.category_ids = String(category_ids);

    const result = await client.queryProducts(params);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message || 'Erreur API AliExpress' },
        { status: 502 }
      );
    }

    return NextResponse.json({ products: result.data });
  } catch (err) {
    console.error('❌ AliExpress search error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
