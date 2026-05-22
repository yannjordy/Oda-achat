'use client';
import { useState, useEffect } from 'react';

export default function AdminCommandes() {
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { chargerCommandes(); }, []);

  const chargerCommandes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.counts) setCounts(data.counts);
    } catch (e) { console.error('Erreur chargement commandes:', e); }
    finally { setLoading(false); }
  };

  const updateStatut = async (orderId, statut) => {
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, statut }),
      });
      chargerCommandes();
    } catch (e) { console.error('Erreur mise à jour:', e); }
  };

  const updateItemExterne = async (itemId, statutExterne, tracking = '') => {
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, statut_externe: statutExterne, tracking_externe: tracking }),
      });
      chargerCommandes();
    } catch (e) { console.error('Erreur mise à jour item:', e); }
  };

  const filtered = filter === 'all' ? orders
    : filter === 'externe' ? orders.filter(o => o.order_items?.some(i => i.source !== 'internal'))
    : orders.filter(o => o.statut === filter);

  const badgeStatut = (s) => {
    const colors = {
      en_attente: { bg:'#FFF7ED', fg:'#C2410C' },
      confirme: { bg:'#EFF6FF', fg:'#1D4ED8' },
      expedie: { bg:'#F0FDF4', fg:'#15803D' },
      livre: { bg:'#F0FDF4', fg:'#15803D' },
      annule: { bg:'#FEF2F2', fg:'#DC2626' },
    };
    const c = colors[s] || { bg:'#F9FAFB', fg:'#6B7280' };
    return <span style={{ background:c.bg, color:c.fg, padding:'3px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:700, textTransform:'capitalize' }}>{s?.replace(/_/g,' ')}</span>;
  };

  const badgeSource = (s) => {
    if (s === 'internal') return null;
    return <span style={{ marginLeft:4, fontSize:'0.6rem', background:'#E8F5E9', color:'#2E7D32', padding:'1px 6px', borderRadius:6, fontWeight:700 }}>{s}</span>;
  };

  if (loading) return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F8F9FA' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'4px solid #E5E7EB', borderTopColor:'#FF6B00', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:'#6B7280', fontWeight:600 }}>Chargement des commandes...</p>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight:'100vh', background:'#F8F9FA', fontFamily:'Inter,sans-serif', padding:'24px 16px 40px', maxWidth:900, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800 }}>🛒 Commandes</h1>
          <p style={{ fontSize:'0.85rem', color:'#6B7280' }}>{orders.length} commandes</p>
        </div>
        <button onClick={chargerCommandes} style={{
          padding:'8px 16px', background:'#FF6B00', color:'#fff', border:'none',
          borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:'0.85rem',
        }}>↻ Actualiser</button>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { label:'Toutes', count:orders.length, key:'all' },
          { label:'En attente', count:counts.en_attente || 0, key:'en_attente' },
          { label:'Confirmées', count:counts.confirme || 0, key:'confirme' },
          { label:'Externes', count:counts.externe || 0, key:'externe' },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} style={{
            padding:'8px 16px', borderRadius:20, border:'2px solid', fontWeight:700,
            cursor:'pointer', fontSize:'0.8rem', transition:'all .2s',
            background: filter === s.key ? (s.key === 'externe' ? '#FFF7ED' : '#FF6B00') : '#fff',
            color: filter === s.key ? (s.key === 'externe' ? '#C2410C' : '#fff') : (s.key === 'externe' ? '#C2410C' : '#374151'),
            borderColor: filter === s.key ? (s.key === 'externe' ? '#FDBA74' : '#FF6B00') : '#E5E7EB',
          }}>
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#9CA3AF' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>📭</div>
          <p style={{ fontWeight:600 }}>Aucune commande</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map(order => {
            const externes = order.order_items?.filter(i => i.source !== 'internal') || [];
            return (
              <div key={order.id} style={{
                background:'#fff', borderRadius:16, padding:16,
                boxShadow:'0 1px 3px rgba(0,0,0,.06)', border:'1px solid #F3F4F6',
              }}>
                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'0.95rem' }}>
                      #{order.numero}
                      {externes.length > 0 && (
                        <span style={{ marginLeft:8, fontSize:'0.6rem', background:'#FFF7ED', color:'#C2410C', padding:'2px 8px', borderRadius:6, fontWeight:700, verticalAlign:'middle' }}>
                          🌍 {externes.length} externe(s)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'#6B7280', marginTop:4 }}>
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                  {badgeStatut(order.statut)}
                </div>

                {/* Client */}
                <div style={{ background:'#F9FAFB', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem' }}>
                    <span><strong>{order.client_nom}</strong></span>
                    <span style={{ color:'#FF6B00' }}>{order.total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'#6B7280', marginTop:4 }}>
                    📞 {order.client_telephone} · 📍 {order.adresse_livraison} ({order.ville})
                    {order.mode_paiement && <span> · 💳 {order.mode_paiement}</span>}
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom:12 }}>
                  {order.order_items?.map(item => (
                    <div key={item.id} style={{
                      display:'flex', gap:10, alignItems:'center', padding:'8px 0',
                      borderBottom:'1px solid #F3F4F6',
                    }}>
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_nom}
                          style={{ width:40, height:40, borderRadius:6, objectFit:'cover' }}
                          onError={e => { e.target.style.display = 'none'; }} />
                      )}
                      <div style={{ flex:1, fontSize:'0.85rem' }}>
                        <span style={{ fontWeight:600 }}>{item.product_nom}</span>
                        {badgeSource(item.source)}
                        <div style={{ color:'#6B7280', fontSize:'0.75rem' }}>
                          x{item.quantite} · {Number(item.product_prix).toLocaleString('fr-FR')} FCFA/unité
                        </div>
                      </div>
                      {item.source !== 'internal' && (
                        <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
                          {item.external_url && (
                            <a href={item.external_url} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize:'0.7rem', color:'#FF6B00', fontWeight:600, textDecoration:'none' }}>
                              Voir sur {item.external_platform || 'site'} ↗
                            </a>
                          )}
                          {item.statut_externe && (
                            <span style={{ fontSize:'0.65rem', color:'#6B7280', fontWeight:600 }}>
                              {item.statut_externe}
                            </span>
                          )}
                          {item.tracking_externe && (
                            <span style={{ fontSize:'0.65rem', color:'#15803D' }}>
                              📦 {item.tracking_externe}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {order.statut === 'en_attente' && (
                    <button onClick={() => updateStatut(order.id, 'confirme')}
                      style={btnStyle('#059669','#D1FAE5')}>✅ Confirmer</button>
                  )}
                  {order.statut === 'confirme' && (
                    <button onClick={() => updateStatut(order.id, 'expedie')}
                      style={btnStyle('#2563EB','#DBEAFE')}>📦 Marquer expédié</button>
                  )}
                  {order.statut === 'expedie' && (
                    <button onClick={() => updateStatut(order.id, 'livre')}
                      style={btnStyle('#16A34A','#DCFCE7')}>✅ Livré</button>
                  )}
                  {order.statut !== 'annule' && order.statut !== 'livre' && (
                    <button onClick={() => updateStatut(order.id, 'annule')}
                      style={btnStyle('#DC2626','#FEE2E2')}>❌ Annuler</button>
                  )}
                  {/* External items actions */}
                  {externes.map(item => (
                    item.statut_externe !== 'commande_passee' && item.statut_externe !== 'recu' && (
                      <button key={item.id} onClick={() => updateItemExterne(item.id, 'commande_passee')}
                        style={btnStyle('#C2410C','#FFF7ED')}>
                        🛒 Commande {item.external_platform || 'externe'} passée
                      </button>
                    )
                  ))}
                  {externes.some(i => i.statut_externe === 'commande_passee') && (
                    <button onClick={() => updateItemExterne(
                      externes.find(i => i.statut_externe === 'commande_passee')?.id,
                      'recu', prompt('N° de tracking:') || ''
                    )} style={btnStyle('#7C3AED','#EDE9FE')}>
                      📦 Marquer reçu + tracking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const btnStyle = (color, bg) => ({
  padding:'6px 14px', background:bg, color, border:'none',
  borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:'0.78rem',
  transition:'all .2s',
});
