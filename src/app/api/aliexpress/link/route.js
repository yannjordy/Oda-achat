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
        { error: 'AliExpress non configuré' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { url: sourceUrl, type = 0 } = body;

    if (!sourceUrl) {
      return NextResponse.json(
        { error: 'URL produit requise' },
        { status: 400 }
      );
    }

    const result = await client.generateAffiliateLinks({
      promotion_link_type: type,
      source_values: sourceUrl,
      tracking_id: process.env.ALIEXPRESS_TRACKING_ID || '',
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message || 'Erreur génération lien affiliation' },
        { status: 502 }
      );
    }

    return NextResponse.json({ links: result.data });
  } catch (err) {
    console.error('❌ AliExpress link error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
