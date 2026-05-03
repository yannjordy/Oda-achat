'use client';



import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// ==================== SUPABASE ====================
const SUPABASE_URL      = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== UTILITAIRES ====================
function formatPrice(price, devise = 'FCFA') {
    return `${Number(price).toLocaleString('fr-FR')} ${devise}`;
}

function formatDate(str) {
    if (!str) return '';
    const date = new Date(str);
    const diff = Math.floor((Date.now() - date) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    if (diff < 7)  return `Il y a ${diff} jours`;
    if (diff < 30) return `Il y a ${Math.floor(diff / 7)} sem.`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getStatutColor(statut) {
    const map = {
        'en_attente'  : { bg: '#FEF3C7', color: '#D97706', label: 'En attente' },
        'confirmée'   : { bg: '#D1FAE5', color: '#059669', label: 'Confirmée'  },
        'confirmee'   : { bg: '#D1FAE5', color: '#059669', label: 'Confirmée'  },
        'livrée'      : { bg: '#DBEAFE', color: '#2563EB', label: 'Livrée'     },
        'livree'      : { bg: '#DBEAFE', color: '#2563EB', label: 'Livrée'     },
        'annulée'     : { bg: '#FEE2E2', color: '#DC2626', label: 'Annulée'    },
        'annulee'     : { bg: '#FEE2E2', color: '#DC2626', label: 'Annulée'    },
    };
    return map[statut] || { bg: '#F3F4F6', color: '#6B7280', label: statut || 'Inconnu' };
}

// ==================== STYLES ====================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
    --primary   : #FF6B00;
    --primary-dk: #E55D00;
    --bg        : #F8F9FA;
    --bg-card   : #FFFFFF;
    --text      : #1A1A1A;
    --text-sec  : #6B7280;
    --border    : #E5E7EB;
    --shadow-sm : 0 1px 3px rgba(0,0,0,.06);
    --shadow-md : 0 4px 12px rgba(0,0,0,.10);
    --shadow-lg : 0 10px 30px rgba(0,0,0,.12);
    --radius    : 14px;
    --radius-sm : 8px;
    --trans     : .25s cubic-bezier(.4,0,.2,1);
}

* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }

body {
    font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
    background:var(--bg);
    color:var(--text);
    line-height:1.6;
    min-height:100vh;
}

/* ── HEADER ── */
.fav-header {
    position:sticky;
    top:0;
    z-index:100;
    background:var(--bg-card);
    border-bottom:1px solid var(--border);
    box-shadow:var(--shadow-sm);
    padding:0 16px;
    display:flex;
    align-items:center;
    gap:12px;
    height:60px;
}
.fav-header-btn {
    width:40px; height:40px;
    border-radius:var(--radius-sm);
    border:none;
    background:var(--bg);
    color:var(--text);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer;
    transition:var(--trans);
    flex-shrink:0;
}
.fav-header-btn:hover { background:var(--border); }
.fav-header-title {
    flex:1;
    font-size:1.1rem;
    font-weight:700;
    color:var(--text);
}
.fav-header-count {
    font-size:.78rem;
    font-weight:700;
    background:var(--primary);
    color:#fff;
    padding:3px 10px;
    border-radius:20px;
    min-width:28px;
    text-align:center;
}

/* ── TABS ── */
.fav-tabs {
    display:flex;
    background:var(--bg-card);
    border-bottom:1px solid var(--border);
    padding:0 16px;
    gap:0;
    position:sticky;
    top:60px;
    z-index:99;
}
.fav-tab {
    flex:1;
    padding:14px 8px;
    border:none;
    background:transparent;
    font-family:inherit;
    font-size:.9rem;
    font-weight:600;
    color:var(--text-sec);
    cursor:pointer;
    border-bottom:3px solid transparent;
    transition:var(--trans);
    display:flex;
    align-items:center;
    justify-content:center;
    gap:6px;
}
.fav-tab.active {
    color:var(--primary);
    border-bottom-color:var(--primary);
}
.fav-tab-badge {
    background:var(--primary);
    color:#fff;
    font-size:.65rem;
    font-weight:800;
    padding:1px 6px;
    border-radius:10px;
    line-height:1.6;
}
.fav-tab:not(.active) .fav-tab-badge {
    background:var(--border);
    color:var(--text-sec);
}

/* ── CONTENU ── */
.fav-content { padding:16px; max-width:600px; margin:0 auto; }

/* ── ÉTAT VIDE ── */
.fav-empty {
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:64px 24px;
    gap:16px;
    text-align:center;
}
.fav-empty-icon {
    font-size:4rem;
    line-height:1;
    filter:drop-shadow(0 4px 8px rgba(0,0,0,.12));
}
.fav-empty h3 {
    font-size:1.15rem;
    font-weight:700;
    color:var(--text);
}
.fav-empty p {
    font-size:.88rem;
    color:var(--text-sec);
    max-width:260px;
}
.fav-empty-btn {
    margin-top:8px;
    padding:12px 28px;
    background:var(--primary);
    color:#fff;
    border:none;
    border-radius:30px;
    font-family:inherit;
    font-size:.9rem;
    font-weight:700;
    cursor:pointer;
    transition:var(--trans);
    box-shadow:0 4px 14px rgba(255,107,0,.35);
}
.fav-empty-btn:hover { background:var(--primary-dk); transform:translateY(-1px); }

/* ── LOADING ── */
.fav-loader {
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:16px;
    padding:60px 24px;
    color:var(--text-sec);
    font-size:.9rem;
}
.fav-spinner {
    width:36px; height:36px;
    border:3px solid var(--border);
    border-top-color:var(--primary);
    border-radius:50%;
    animation:spin .8s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }

/* ── GRILLE FAVORIS ── */
.fav-grid {
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:12px;
}
@media(min-width:480px) { .fav-grid { grid-template-columns:repeat(3,1fr); } }

/* ── CARTE PRODUIT FAVORI ── */
.fav-card {
    background:var(--bg-card);
    border-radius:var(--radius);
    overflow:hidden;
    box-shadow:var(--shadow-sm);
    border:1px solid var(--border);
    transition:var(--trans);
    cursor:pointer;
    position:relative;
    display:flex;
    flex-direction:column;
}
.fav-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); border-color:var(--primary); }

.fav-card-img-wrap {
    position:relative;
    width:100%;
    padding-top:80%;
    background:#f5f5f5;
    overflow:hidden;
}
.fav-card-img {
    position:absolute;
    inset:0;
    width:100%; height:100%;
    object-fit:cover;
    transition:transform .3s ease;
}
.fav-card:hover .fav-card-img { transform:scale(1.06); }

.fav-card-remove {
    position:absolute;
    top:8px; right:8px;
    width:30px; height:30px;
    border-radius:50%;
    background:rgba(255,255,255,.95);
    backdrop-filter:blur(8px);
    border:none;
    cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:.9rem;
    box-shadow:0 2px 8px rgba(0,0,0,.15);
    transition:var(--trans);
    z-index:5;
}
.fav-card-remove:hover { background:#FEE2E2; transform:scale(1.12); }

.fav-card-body {
    padding:10px;
    display:flex;
    flex-direction:column;
    gap:4px;
    flex:1;
}
.fav-card-shop {
    font-size:.67rem;
    font-weight:600;
    color:var(--primary);
    background:rgba(255,107,0,.1);
    padding:2px 7px;
    border-radius:8px;
    width:fit-content;
}
.fav-card-name {
    font-size:.82rem;
    font-weight:700;
    color:var(--text);
    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;
    line-height:1.3;
}
.fav-card-price {
    font-size:1rem;
    font-weight:800;
    color:var(--primary);
    margin-top:auto;
    padding-top:4px;
}
.fav-card-stock {
    font-size:.65rem;
    font-weight:600;
    color:#F59E0B;
}
.fav-card-footer {
    display:flex;
    justify-content:space-between;
    align-items:center;
}
.fav-card-buy {
    width:100%;
    margin:0 10px 10px;
    padding:8px;
    background:var(--primary);
    color:#fff;
    border:none;
    border-radius:var(--radius-sm);
    font-family:inherit;
    font-size:.8rem;
    font-weight:700;
    cursor:pointer;
    transition:var(--trans);
}
.fav-card-buy:hover { background:var(--primary-dk); }

/* ── SECTION TITRE ── */
.fav-section-title {
    font-size:.78rem;
    font-weight:700;
    color:var(--text-sec);
    text-transform:uppercase;
    letter-spacing:.06em;
    margin:0 0 10px;
    display:flex;
    align-items:center;
    gap:6px;
}
.fav-section-title::after {
    content:'';
    flex:1;
    height:1px;
    background:var(--border);
}

/* ── LISTE COMMANDES ── */
.orders-list {
    display:flex;
    flex-direction:column;
    gap:14px;
}

/* ── CARTE COMMANDE ── */
.order-card {
    background:var(--bg-card);
    border-radius:var(--radius);
    border:1px solid var(--border);
    box-shadow:var(--shadow-sm);
    overflow:hidden;
    transition:var(--trans);
    animation:fadeSlideIn .3s ease both;
}
@keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

.order-card-header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:14px 16px 12px;
    border-bottom:1px solid var(--border);
    gap:8px;
}
.order-card-num {
    font-size:.82rem;
    font-weight:800;
    color:var(--text);
}
.order-card-date {
    font-size:.72rem;
    color:var(--text-sec);
    margin-top:2px;
}
.order-card-statut {
    font-size:.7rem;
    font-weight:700;
    padding:3px 10px;
    border-radius:20px;
    white-space:nowrap;
    flex-shrink:0;
}
.order-card-delete {
    width:32px; height:32px;
    border-radius:var(--radius-sm);
    border:none;
    background:transparent;
    color:#DC2626;
    cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:var(--trans);
    flex-shrink:0;
}
.order-card-delete:hover { background:#FEE2E2; }

/* ── Corps produits ── */
.order-card-products {
    display:flex;
    flex-direction:column;
    gap:0;
}
.order-product-row {
    display:flex;
    align-items:center;
    gap:10px;
    padding:10px 16px;
    border-bottom:1px solid var(--border);
}
.order-product-row:last-child { border-bottom:none; }
.order-product-img {
    width:48px; height:48px;
    border-radius:var(--radius-sm);
    object-fit:cover;
    background:#f5f5f5;
    flex-shrink:0;
}
.order-product-info { flex:1; min-width:0; }
.order-product-name {
    font-size:.82rem;
    font-weight:700;
    color:var(--text);
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
}
.order-product-qty {
    font-size:.72rem;
    color:var(--text-sec);
}
.order-product-price {
    font-size:.88rem;
    font-weight:800;
    color:var(--primary);
    flex-shrink:0;
}

/* ── Pied commande ── */
.order-card-footer {
    padding:12px 16px;
    background:#FAFAFA;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:8px;
    flex-wrap:wrap;
}
.order-total-label { font-size:.78rem; color:var(--text-sec); font-weight:600; }
.order-total-value {
    font-size:1rem;
    font-weight:800;
    color:var(--text);
}
.order-pay-tag {
    font-size:.7rem;
    font-weight:600;
    padding:3px 9px;
    border-radius:20px;
    background:rgba(255,107,0,.1);
    color:var(--primary);
}

/* ── Expand/Collapse détails ── */
.order-details-toggle {
    width:100%;
    padding:8px 16px;
    border:none;
    border-top:1px solid var(--border);
    background:transparent;
    font-family:inherit;
    font-size:.76rem;
    font-weight:600;
    color:var(--text-sec);
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:4px;
    transition:var(--trans);
}
.order-details-toggle:hover { background:var(--bg); color:var(--text); }

.order-details {
    padding:12px 16px 14px;
    border-top:1px solid var(--border);
    display:flex;
    flex-direction:column;
    gap:8px;
    background:#FAFAFA;
}
.order-detail-row {
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:8px;
    font-size:.78rem;
}
.order-detail-lbl { color:var(--text-sec); font-weight:500; }
.order-detail-val { color:var(--text); font-weight:600; text-align:right; }
.order-detail-divider {
    height:1px;
    background:var(--border);
    margin:4px 0;
}
.order-boutique-name {
    font-size:.82rem;
    font-weight:700;
    color:var(--primary);
}

/* ── TOAST ── */
.fav-toast-wrap {
    position:fixed;
    bottom:24px; left:50%;
    transform:translateX(-50%);
    z-index:9999;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:8px;
    pointer-events:none;
}
.fav-toast {
    background:var(--text);
    color:#fff;
    padding:10px 20px;
    border-radius:24px;
    font-size:.85rem;
    font-weight:600;
    box-shadow:var(--shadow-md);
    animation:toastIn .3s ease;
    white-space:nowrap;
    pointer-events:none;
}
@keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }

/* ── MODAL CONFIRMATION SUPPRESSION ── */
.confirm-overlay {
    position:fixed; inset:0;
    background:rgba(0,0,0,.5);
    backdrop-filter:blur(4px);
    z-index:1000;
    display:flex;
    align-items:flex-end;
    justify-content:center;
    padding-bottom:env(safe-area-inset-bottom);
}
.confirm-sheet {
    background:var(--bg-card);
    border-radius:24px 24px 0 0;
    padding:24px 24px 32px;
    width:100%;
    max-width:480px;
    animation:slideUp .25s ease;
}
@keyframes slideUp { from { transform:translateY(100%); } to { transform:none; } }
.confirm-icon { font-size:2.5rem; text-align:center; margin-bottom:12px; }
.confirm-title { font-size:1.05rem; font-weight:800; color:var(--text); text-align:center; margin-bottom:6px; }
.confirm-desc  { font-size:.85rem; color:var(--text-sec); text-align:center; margin-bottom:24px; }
.confirm-btns  { display:flex; flex-direction:column; gap:10px; }
.confirm-btn-del {
    padding:14px;
    background:#DC2626;
    color:#fff;
    border:none;
    border-radius:12px;
    font-family:inherit;
    font-size:.95rem;
    font-weight:700;
    cursor:pointer;
    transition:var(--trans);
}
.confirm-btn-del:hover { background:#B91C1C; }
.confirm-btn-cancel {
    padding:14px;
    background:var(--bg);
    color:var(--text);
    border:none;
    border-radius:12px;
    font-family:inherit;
    font-size:.95rem;
    font-weight:600;
    cursor:pointer;
    transition:var(--trans);
}
.confirm-btn-cancel:hover { background:var(--border); }

/* ── Skeleton ── */
.sk-card {
    background:var(--bg-card);
    border-radius:var(--radius);
    overflow:hidden;
    border:1px solid var(--border);
}
.sk-img { width:100%; padding-top:80%; background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
.sk-body { padding:10px; display:flex; flex-direction:column; gap:8px; }
.sk-line { height:10px; border-radius:6px; background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
.sk-line.short { width:60%; }
.sk-line.price { width:45%; height:14px; }
@keyframes shimmer { to { background-position:-200% 0; } }

/* ── BARRE FILTRES ── */
.fav-filter-bar {
    display:flex;
    gap:8px;
    overflow-x:auto;
    scrollbar-width:none;
    padding-bottom:4px;
    margin-bottom:14px;
}
.fav-filter-bar::-webkit-scrollbar { display:none; }
.fav-filter-chip {
    flex-shrink:0;
    padding:6px 14px;
    border-radius:20px;
    border:1.5px solid var(--border);
    background:var(--bg-card);
    font-family:inherit;
    font-size:.78rem;
    font-weight:600;
    color:var(--text-sec);
    cursor:pointer;
    transition:var(--trans);
    white-space:nowrap;
}
.fav-filter-chip.active {
    border-color:var(--primary);
    background:rgba(255,107,0,.08);
    color:var(--primary);
}
`;

// ==================== COMPOSANT PRINCIPAL ====================
export default function FavoritePage() {
    const [activeTab,     setActiveTab]     = useState('favoris');
    const [favProducts,   setFavProducts]   = useState([]);
    const [orders,        setOrders]        = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [toasts,        setToasts]        = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(null); // { index, numero }
    const [expandedOrders,setExpandedOrders]= useState(new Set());
    const [catFilter,     setCatFilter]     = useState('Tous');

    // ── Toast helper
    const showToast = useCallback((msg) => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
    }, []);

    // ── Charger les favoris depuis localStorage → Supabase
    useEffect(() => {
        async function loadFavorites() {
            setLoading(true);
            try {
                const raw = localStorage.getItem('oda_favorites');
                const ids = raw ? JSON.parse(raw) : [];
                if (!ids.length) { setFavProducts([]); setLoading(false); return; }

                const { data, error } = await supabase
                    .from('produits')
                    .select('id,nom,description,prix,stock,main_image,categorie,user_id')
                    .in('id', ids)
                    .eq('statut', 'published');

                if (error) throw error;

                // Enrichir avec le nom de la boutique
                const userIds = [...new Set((data || []).map(p => p.user_id))];
                let shopMap = {};
                if (userIds.length) {
                    const { data: shops } = await supabase
                        .from('parametres_boutique')
                        .select('user_id,config')
                        .in('user_id', userIds);
                    (shops || []).forEach(s => {
                        shopMap[s.user_id] = s.config?.general?.nom || 'Boutique';
                    });
                }

                setFavProducts(
                    (data || []).map(p => ({
                        ...p,
                        shopName: shopMap[p.user_id] || 'Boutique',
                    }))
                );
            } catch (e) {
                console.error('Erreur chargement favoris:', e);
                setFavProducts([]);
            } finally {
                setLoading(false);
            }
        }
        loadFavorites();
    }, []);

    // ── Charger les commandes depuis localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem('oda_orders');
            setOrders(raw ? JSON.parse(raw) : []);
        } catch {
            setOrders([]);
        }
    }, []);

    // ── Retirer un favori
    const removeFavorite = (productId) => {
        try {
            const raw = localStorage.getItem('oda_favorites');
            const ids = new Set(raw ? JSON.parse(raw) : []);
            ids.delete(productId);
            localStorage.setItem('oda_favorites', JSON.stringify([...ids]));
        } catch {}
        setFavProducts(p => p.filter(x => x.id !== productId));
        showToast('Retiré des favoris');
        // Mettre à jour le badge dans la page principale si elle est ouverte
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        }
    };

    // ── Supprimer une commande
    const deleteOrder = (index) => {
        setOrders(prev => {
            const next = prev.filter((_, i) => i !== index);
            localStorage.setItem('oda_orders', JSON.stringify(next));
            return next;
        });
        setConfirmDelete(null);
        showToast('Facture supprimée');
    };

    // ── Basculer expand/collapse d'une commande
    const toggleExpand = (index) => {
        setExpandedOrders(prev => {
            const next = new Set(prev);
            next.has(index) ? next.delete(index) : next.add(index);
            return next;
        });
    };

    // ── Catégories des favoris
    const categories = ['Tous', ...new Set(favProducts.map(p => p.categorie || 'Autres'))];
    const filteredFavs = catFilter === 'Tous'
        ? favProducts
        : favProducts.filter(p => (p.categorie || 'Autres') === catFilter);

    // ── Naviguer vers le produit
    const goToProduct = (id) => {
        window.location.href = `/produit?id=${id}`;
    };

    return (
        <>
            {/* CSS */}
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* ── HEADER ── */}
            <header className="fav-header">
                <button className="fav-header-btn" onClick={() => window.history.back()} aria-label="Retour">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                </button>
                <span className="fav-header-title">Mes Favoris & Commandes</span>
                {activeTab === 'favoris' && favProducts.length > 0 && (
                    <span className="fav-header-count">{favProducts.length}</span>
                )}
                {activeTab === 'commandes' && orders.length > 0 && (
                    <span className="fav-header-count">{orders.length}</span>
                )}
            </header>

            {/* ── TABS ── */}
            <nav className="fav-tabs">
                <button
                    className={`fav-tab ${activeTab === 'favoris' ? 'active' : ''}`}
                    onClick={() => setActiveTab('favoris')}
                >
                    ❤️ Favoris
                    {favProducts.length > 0 && (
                        <span className="fav-tab-badge">{favProducts.length}</span>
                    )}
                </button>
                <button
                    className={`fav-tab ${activeTab === 'commandes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('commandes')}
                >
                    📋 Mes Commandes
                    {orders.length > 0 && (
                        <span className="fav-tab-badge">{orders.length}</span>
                    )}
                </button>
            </nav>

            {/* ══════════════════════════════
                TAB — FAVORIS
            ══════════════════════════════ */}
            {activeTab === 'favoris' && (
                <main className="fav-content">
                    {loading ? (
                        /* Skeletons */
                        <div className="fav-grid">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div className="sk-card" key={i}>
                                    <div className="sk-img" />
                                    <div className="sk-body">
                                        <div className="sk-line short" />
                                        <div className="sk-line" />
                                        <div className="sk-line short" />
                                        <div className="sk-line price" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : favProducts.length === 0 ? (
                        /* État vide */
                        <div className="fav-empty">
                            <div className="fav-empty-icon">🤍</div>
                            <h3>Aucun favori pour l'instant</h3>
                            <p>Appuyez sur ❤️ sur un produit pour l'ajouter à vos favoris.</p>
                            <button className="fav-empty-btn" onClick={() => window.location.href = '/'}>
                                Découvrir des produits
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Filtre par catégorie */}
                            {categories.length > 2 && (
                                <div className="fav-filter-bar">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            className={`fav-filter-chip ${catFilter === cat ? 'active' : ''}`}
                                            onClick={() => setCatFilter(cat)}
                                        >
                                            {cat === 'Tous' ? `🏠 Tous (${favProducts.length})` : cat}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredFavs.length === 0 ? (
                                <div className="fav-empty" style={{ paddingTop: 40 }}>
                                    <div className="fav-empty-icon">🔍</div>
                                    <h3>Aucun favori dans cette catégorie</h3>
                                </div>
                            ) : (
                                <div className="fav-grid">
                                    {filteredFavs.map(product => (
                                        <div
                                            key={product.id}
                                            className="fav-card"
                                            onClick={() => goToProduct(product.id)}
                                        >
                                            <div className="fav-card-img-wrap">
                                                <img
                                                    src={product.main_image || 'https://via.placeholder.com/300?text=Produit'}
                                                    className="fav-card-img"
                                                    alt={product.nom}
                                                    onError={e => { e.target.src = 'https://via.placeholder.com/300?text=Produit'; }}
                                                    loading="lazy"
                                                />
                                                <button
                                                    className="fav-card-remove"
                                                    onClick={e => { e.stopPropagation(); removeFavorite(product.id); }}
                                                    aria-label="Retirer des favoris"
                                                    title="Retirer des favoris"
                                                >
                                                    ❤️
                                                </button>
                                            </div>
                                            <div className="fav-card-body">
                                                <span className="fav-card-shop">🏪 {product.shopName}</span>
                                                <h3 className="fav-card-name">{product.nom}</h3>
                                                <div className="fav-card-footer">
                                                    <span className="fav-card-price">{formatPrice(product.prix)}</span>
                                                    {product.stock <= 5 && product.stock > 0 && (
                                                        <span className="fav-card-stock">⚠️ {product.stock} restant{product.stock > 1 ? 's' : ''}</span>
                                                    )}
                                                    {product.stock === 0 && (
                                                        <span className="fav-card-stock" style={{ color: '#DC2626' }}>Rupture</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="fav-card-buy"
                                                onClick={e => { e.stopPropagation(); goToProduct(product.id); }}
                                                disabled={product.stock === 0}
                                                style={product.stock === 0 ? { background: '#9CA3AF', cursor: 'not-allowed' } : {}}
                                            >
                                                {product.stock === 0 ? '❌ Épuisé' : '🛒 Commander'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            )}

            {/* ══════════════════════════════
                TAB — COMMANDES / FACTURES
            ══════════════════════════════ */}
            {activeTab === 'commandes' && (
                <main className="fav-content">
                    {orders.length === 0 ? (
                        <div className="fav-empty">
                            <div className="fav-empty-icon">📋</div>
                            <h3>Aucune commande enregistrée</h3>
                            <p>Vos factures apparaîtront ici après chaque commande passée.</p>
                            <button className="fav-empty-btn" onClick={() => window.location.href = '/'}>
                                Explorer les produits
                            </button>
                        </div>
                    ) : (
                        <div className="orders-list">
                            <p className="fav-section-title">
                                {orders.length} commande{orders.length > 1 ? 's' : ''} enregistrée{orders.length > 1 ? 's' : ''}
                            </p>
                            {orders.map((order, index) => {
                                const statut = getStatutColor(order.statut);
                                const isExpanded = expandedOrders.has(index);
                                return (
                                    <div className="order-card" key={index}>
                                        {/* ── En-tête ── */}
                                        <div className="order-card-header">
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="order-card-num">
                                                    {order.numero || `#${order.id}`}
                                                </div>
                                                <div className="order-card-date">
                                                    {order.date || formatDate(order.savedAt)}
                                                    {order.boutique?.nom && (
                                                        <> · <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                                            {order.boutique.nom}
                                                        </span></>
                                                    )}
                                                </div>
                                            </div>
                                            <span
                                                className="order-card-statut"
                                                style={{ background: statut.bg, color: statut.color }}
                                            >
                                                {statut.label}
                                            </span>
                                            <button
                                                className="order-card-delete"
                                                onClick={() => setConfirmDelete({ index, numero: order.numero || `#${order.id}` })}
                                                aria-label="Supprimer cette facture"
                                                title="Supprimer"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                                    <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* ── Produits ── */}
                                        <div className="order-card-products">
                                            {(order.produits || []).map((p, pi) => (
                                                <div className="order-product-row" key={pi}>
                                                    <img
                                                        src={p.image || 'https://via.placeholder.com/80?text=Produit'}
                                                        className="order-product-img"
                                                        alt={p.nom}
                                                        onError={e => { e.target.src = 'https://via.placeholder.com/80?text=Produit'; }}
                                                    />
                                                    <div className="order-product-info">
                                                        <div className="order-product-name">{p.nom}</div>
                                                        <div className="order-product-qty">Qté : {p.quantite || 1}</div>
                                                    </div>
                                                    <div className="order-product-price">
                                                        {formatPrice(p.prix, order.devise)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── Pied ── */}
                                        <div className="order-card-footer">
                                            <div>
                                                <div className="order-total-label">Total payé</div>
                                                <div className="order-total-value">
                                                    {formatPrice(order.montantTotal, order.devise)}
                                                </div>
                                            </div>
                                            <span className="order-pay-tag">
                                                {order.labelPaiement || order.modePaiement || 'Paiement'}
                                            </span>
                                        </div>

                                        {/* ── Bouton Détails ── */}
                                        <button
                                            className="order-details-toggle"
                                            onClick={() => toggleExpand(index)}
                                        >
                                            {isExpanded ? '▲ Masquer les détails' : '▼ Voir les détails'}
                                        </button>

                                        {/* ── Détails dépliables ── */}
                                        {isExpanded && (
                                            <div className="order-details">
                                                {/* Livraison */}
                                                <div className="order-detail-row">
                                                    <span className="order-detail-lbl">Produit(s)</span>
                                                    <span className="order-detail-val">{formatPrice(order.montantProduit, order.devise)}</span>
                                                </div>
                                                <div className="order-detail-row">
                                                    <span className="order-detail-lbl">Livraison</span>
                                                    <span className="order-detail-val">
                                                        {order.livraisonGratuite ? 'Gratuite 🎁' : formatPrice(order.fraisLivraison, order.devise)}
                                                    </span>
                                                </div>
                                                <div className="order-detail-divider" />

                                                {/* Client */}
                                                {order.client && (
                                                    <>
                                                        <div className="order-detail-row">
                                                            <span className="order-detail-lbl">👤 Client</span>
                                                            <span className="order-detail-val">{order.client.nom}</span>
                                                        </div>
                                                        <div className="order-detail-row">
                                                            <span className="order-detail-lbl">📞 Téléphone</span>
                                                            <span className="order-detail-val">{order.client.telephone}</span>
                                                        </div>
                                                        <div className="order-detail-row">
                                                            <span className="order-detail-lbl">📍 Adresse</span>
                                                            <span className="order-detail-val" style={{ maxWidth: '55%' }}>
                                                                {order.client.adresse}
                                                                {order.client.ville ? ` — ${order.client.ville}` : ''}
                                                            </span>
                                                        </div>
                                                        <div className="order-detail-divider" />
                                                    </>
                                                )}

                                                {/* Boutique */}
                                                {order.boutique && (
                                                    <div className="order-detail-row">
                                                        <span className="order-detail-lbl">🏪 Boutique</span>
                                                        <span className="order-boutique-name">{order.boutique.nom}</span>
                                                    </div>
                                                )}
                                                {order.boutique?.telephone && (
                                                    <div className="order-detail-row">
                                                        <span className="order-detail-lbl">Contact</span>
                                                        <a href={`tel:${order.boutique.telephone}`} className="order-detail-val" style={{ color: 'var(--primary)' }}>
                                                            {order.boutique.telephone}
                                                        </a>
                                                    </div>
                                                )}

                                                {/* Lien Stripe si disponible */}
                                                {order.stripeLien && (
                                                    <a
                                                        href={order.stripeLien}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display:'flex',alignItems:'center',gap:8,
                                                            marginTop:8,padding:'10px 14px',
                                                            background:'rgba(255,107,0,.08)',
                                                            border:'1.5px solid var(--primary)',
                                                            borderRadius:10,
                                                            color:'var(--primary)',fontSize:'.8rem',fontWeight:700,
                                                            textDecoration:'none'
                                                        }}
                                                    >
                                                        💳 Accéder à la page de paiement Stripe ↗
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            )}

            {/* ── MODAL CONFIRMATION SUPPRESSION ── */}
            {confirmDelete && (
                <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon">🗑️</div>
                        <div className="confirm-title">Supprimer cette facture ?</div>
                        <div className="confirm-desc">
                            La commande <strong>{confirmDelete.numero}</strong> sera retirée de votre historique.
                            Cette action est irréversible.
                        </div>
                        <div className="confirm-btns">
                            <button className="confirm-btn-del" onClick={() => deleteOrder(confirmDelete.index)}>
                                Oui, supprimer
                            </button>
                            <button className="confirm-btn-cancel" onClick={() => setConfirmDelete(null)}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TOASTS ── */}
            <div className="fav-toast-wrap">
                {toasts.map(t => (
                    <div key={t.id} className="fav-toast">{t.msg}</div>
                ))}
            </div>
        </>
    );
}