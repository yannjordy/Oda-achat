import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const counts = {
      en_attente: orders.filter(o => o.statut === 'en_attente').length,
      confirme: orders.filter(o => o.statut === 'confirme').length,
      externe: orders.filter(o => o.order_items?.some(i => i.source !== 'internal')).length,
    };

    return Response.json({ orders: orders || [], counts });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { order_id, statut, notes_admin, item_id, statut_externe, tracking_externe } = body;

    if (order_id && statut) {
      const { error } = await supabase
        .from('orders')
        .update({ statut, notes_admin, updated_at: new Date().toISOString() })
        .eq('id', order_id);

      if (error) throw error;
    }

    if (item_id && statut_externe) {
      const update = { statut_externe };
      if (tracking_externe) update.tracking_externe = tracking_externe;
      const { error } = await supabase
        .from('order_items')
        .update(update)
        .eq('id', item_id);

      if (error) throw error;
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
