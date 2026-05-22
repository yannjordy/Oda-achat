import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function genererNumero() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `ODA-${yy}${mm}-${seq}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { client_nom, client_telephone, adresse, ville, mode_paiement, operateur, items } = body;

    if (!client_nom || !client_telephone || !items?.length) {
      return Response.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const sous_total = items.reduce((s, i) => s + i.prix * i.quantite, 0);
    const frais_livraison = ville === 'douala' ? 1000 : 2500;
    const total = sous_total + frais_livraison;
    const numero = genererNumero();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        numero,
        client_nom,
        client_telephone,
        adresse_livraison: adresse,
        ville,
        mode_paiement,
        operateur,
        sous_total,
        frais_livraison,
        total,
        statut: 'en_attente',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      product_nom: i.nom,
      product_prix: i.prix,
      product_image: i.image,
      quantite: i.quantite,
      source: i.source || 'internal',
      external_url: i.external_url || '',
      external_platform: i.external_platform || '',
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return Response.json({ success: true, order: { numero, id: order.id, total } });
  } catch (err) {
    console.error('Order error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const telephone = searchParams.get('telephone');

    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });

    if (telephone) query = query.eq('client_telephone', telephone);

    const { data, error } = await query;
    if (error) throw error;

    return Response.json({ orders: data || [] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
