'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function useLocalCart() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('oda_cart') || '[]')); } catch { setItems([]); }
  }, []);
  const clear = () => { localStorage.setItem('oda_cart', '[]'); setItems([]); };
  const count = items.reduce((s, i) => s + i.quantite, 0);
  const total = items.reduce((s, i) => s + i.prix * i.quantite, 0);
  return { items, count, total, clear };
}

const VILLES_CM = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi',
  'Limbe', 'Buea', 'Kumba', 'Dschang', 'Nkongsamba',
];

export default function PaiementPage() {
  const router = useRouter();
  const { items, total, clear } = useLocalCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({ nom: '', telephone: '', adresse: '', ville: 'Douala', mode_paiement: '', operateur: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (items.length === 0 && !done) {
      router.push('/achats');
    }
  }, [items, done, router]);

  const fraisLivraison = form.ville === 'Douala' ? 1000 : 2500;
  const netTotal = total + fraisLivraison;

  const validateStep1 = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Requis';
    if (!form.telephone.match(/^6\d{8}$/)) e.telephone = 'Format: 6XXXXXXXX';
    if (!form.adresse.trim()) e.adresse = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const soumettreCommande = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_nom: form.nom,
          client_telephone: form.telephone,
          adresse: form.adresse,
          ville: form.ville,
          mode_paiement: form.mode_paiement,
          operateur: form.operateur,
          items,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(data.order);
        clear();
        // Notification admin
        try {
          await supabase.from('notifications_admin').insert({
            titre: `Nouvelle commande ${data.order.numero}`,
            message: `${form.nom} - ${netTotal.toLocaleString('fr-FR')} FCFA`,
            lien: `/admin/commandes`,
          });
        } catch {}
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (err) {
      alert('Erreur réseau: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const externalItems = items.filter(i => i.source !== 'internal');

  if (done) {
    return (
      <main style={styles.page}>
        <div style={styles.successCard}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Commande confirmée !</h1>
          <p style={{ color: '#6B7280', marginBottom: 8 }}>N° <strong style={{ color: '#FF6B00' }}>{done.numero}</strong></p>
          <p style={{ color: '#6B7280', marginBottom: 20 }}>Total: <strong>{netTotal.toLocaleString('fr-FR')} FCFA</strong></p>

          {externalItems.length > 0 && (
            <div style={{ background: '#FFF7ED', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#C2410C', marginBottom: 6 }}>📦 Produits externes détectés</p>
              <p style={{ fontSize: '0.85rem', color: '#9A3412' }}>
                {externalItems.length} produit(s) viennent d'une autre plateforme.
                Notre équipe va les commander pour vous. Vous recevrez un suivi par WhatsApp.
              </p>
            </div>
          )}

          <button onClick={() => router.push('/achats')} style={styles.btnPrimary}>
            Continuer mes achats
          </button>
          <button onClick={() => router.push(`/admin/commandes?tel=${form.telephone}`)} style={styles.btnSecondary}>
            Suivre ma commande
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{styleSheet}</style>

      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <button onClick={() => router.back()} style={styles.backBtn}>← Retour</button>

        {/* Stepper */}
        <div style={styles.stepper}>
          {['Panier', 'Livraison', 'Paiement'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                ...styles.stepDot,
                background: step > i + 1 ? '#10B981' : step === i + 1 ? '#FF6B00' : '#E5E7EB',
                color: step >= i + 1 ? '#fff' : '#6B7280',
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: step >= i + 1 ? '#1A1A1A' : '#9CA3AF' }}>
                {label}
              </span>
              {i < 2 && <div style={{ width: 24, height: 2, background: step > i + 1 ? '#10B981' : '#E5E7EB' }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Cart recap */}
        {step === 1 && (
          <div>
            <h2 style={styles.title}>📋 Récapitulatif</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(item => (
                <div key={item.product_id} style={styles.itemCard}>
                  <img src={item.image || '/placeholder.png'} alt={item.nom}
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/48x48/FF6B00/white?text=P'; }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {item.nom}
                      {item.source !== 'internal' && (
                        <span style={{ marginLeft: 6, fontSize: '0.6rem', background: '#E8F5E9', color: '#2E7D32', padding: '1px 6px', borderRadius: 6 }}>{item.source}</span>
                      )}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>x{item.quantite}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#FF6B00' }}>{(item.prix * item.quantite).toLocaleString('fr-FR')} F</div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={styles.btnPrimary}>
              Continuer →
            </button>
          </div>
        )}

        {/* Step 2: Delivery info */}
        {step === 2 && (
          <div>
            <h2 style={styles.title}>📍 Livraison</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={styles.label}>Nom complet *</label>
                <input style={{ ...styles.input, borderColor: errors.nom ? '#EF4444' : '#E5E7EB' }}
                  value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  placeholder="Votre nom" />
                {errors.nom && <span style={styles.err}>{errors.nom}</span>}
              </div>
              <div>
                <label style={styles.label}>Téléphone *</label>
                <input style={{ ...styles.input, borderColor: errors.telephone ? '#EF4444' : '#E5E7EB' }}
                  value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  placeholder="6XXXXXXXX" maxLength={9} />
                {errors.telephone && <span style={styles.err}>{errors.telephone}</span>}
              </div>
              <div>
                <label style={styles.label}>Ville *</label>
                <select style={styles.input} value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}>
                  {VILLES_CM.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Adresse / Quartier *</label>
                <input style={{ ...styles.input, borderColor: errors.adresse ? '#EF4444' : '#E5E7EB' }}
                  value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))}
                  placeholder="Quartier, rue, point de repère" />
                {errors.adresse && <span style={styles.err}>{errors.adresse}</span>}
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={styles.btnOutline}>← Retour</button>
              <button onClick={() => { if (validateStep1()) setStep(3); }} style={{ ...styles.btnPrimary, flex: 1 }}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div>
            <h2 style={styles.title}>💳 Paiement</h2>

            {/* External products warning */}
            {externalItems.length > 0 && (
              <div style={{
                background: '#FFF7ED', borderRadius: 12, padding: 14, marginBottom: 16,
                border: '1px solid #FDBA74',
              }}>
                <p style={{ fontWeight: 700, color: '#C2410C', marginBottom: 4 }}>🛒 Produit(s) externe(s)</p>
                <p style={{ fontSize: '0.8rem', color: '#9A3412' }}>
                  {externalItems.length} produit(s) de plateformes externes. Nous les commandons pour vous.
                  Livraison légèrement plus longue.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'mtn', label: 'MTN Mobile Money', icon: '📞', desc: 'Paiement via MTN MoMo' },
                { id: 'orange', label: 'Orange Money', icon: '🍊', desc: 'Paiement via Orange Money' },
                { id: 'cash', label: 'Paiement à la livraison', icon: '💵', desc: 'Espèces à la réception' },
              ].map(m => (
                <label key={m.id} style={{
                  ...styles.payMethod,
                  borderColor: form.mode_paiement === m.id ? '#FF6B00' : '#E5E7EB',
                  background: form.mode_paiement === m.id ? '#FFF7ED' : '#fff',
                }}>
                  <input type="radio" name="payment" value={m.id}
                    checked={form.mode_paiement === m.id}
                    onChange={e => setForm(f => ({ ...f, mode_paiement: e.target.value, operateur: e.target.value === 'mtn' ? 'mtn' : e.target.value === 'orange' ? 'orange' : '' }))}
                    style={{ display: 'none' }} />
                  <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{m.desc}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: 10, border: `2px solid ${form.mode_paiement === m.id ? '#FF6B00' : '#D1D5DB'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {form.mode_paiement === m.id && <div style={{ width: 10, height: 10, borderRadius: 5, background: '#FF6B00' }} />}
                  </div>
                </label>
              ))}
            </div>

            {/* Recap */}
            <div style={{
              background: '#F9FAFB', borderRadius: 12, padding: 16, marginTop: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                <span style={{ color: '#6B7280' }}>Sous-total</span>
                <span style={{ fontWeight: 600 }}>{total.toLocaleString('fr-FR')} F</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                <span style={{ color: '#6B7280' }}>Livraison</span>
                <span style={{ fontWeight: 600 }}>+{fraisLivraison.toLocaleString('fr-FR')} F</span>
              </div>
              <div style={{ height: 1, background: '#E5E7EB', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                <span>Total</span>
                <span style={{ color: '#FF6B00' }}>{netTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={styles.btnOutline}>← Retour</button>
              <button onClick={soumettreCommande} disabled={loading || !form.mode_paiement} style={{
                ...styles.btnPrimary, flex: 1, opacity: loading || !form.mode_paiement ? 0.6 : 1,
              }}>
                {loading ? '⏳ En cours...' : `✅ Confirmer ${netTotal.toLocaleString('fr-FR')} F`}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#F8F9FA', padding: '20px 16px 40px', fontFamily: 'Inter,sans-serif' },
  backBtn: { background: 'none', border: 'none', color: '#FF6B00', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', marginBottom: 16 },
  stepper: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 28 },
  stepDot: { width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 },
  title: { fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 },
  itemCard: { display: 'flex', gap: 12, alignItems: 'center', padding: 12, background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: '#374151' },
  input: { width: '100%', padding: '12px 14px', border: '2px solid #E5E7EB', borderRadius: 10, fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' },
  err: { fontSize: '0.75rem', color: '#EF4444', marginTop: 4, display: 'block' },
  payMethod: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '2px solid #E5E7EB', borderRadius: 12, cursor: 'pointer', transition: 'all .2s' },
  btnPrimary: { width: '100%', padding: 16, marginTop: 16, background: 'linear-gradient(135deg,#FF6B00,#E55D00)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,107,0,.3)' },
  btnSecondary: { width: '100%', padding: 14, marginTop: 10, background: '#F9FAFB', color: '#6B7280', border: '2px solid #E5E7EB', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  btnOutline: { padding: '14px 20px', background: '#fff', border: '2px solid #E5E7EB', borderRadius: 12, fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontSize: '0.9rem' },
};

const styleSheet = `
  input:focus, select:focus { border-color: #FF6B00 !important; box-shadow: 0 0 0 3px rgba(255,107,0,.1); }
  @media(max-width:480px) { .page { padding: 16px 12px; } }
`;
