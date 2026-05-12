'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES } from '@/lib/constants';

// ==================== SUPABASE ====================
const SUPABASE_URL      = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== CONFIG ====================
const CONFIG = {
    CACHE_DURATION      : 5 * 24 * 60 * 60 * 1000,
    DEBOUNCE_DELAY      : 300,
    CAROUSEL_INTERVAL   : 5000,
    LOW_STOCK_THRESHOLD : 5,
    NEW_PRODUCT_DAYS    : 7,
    RECOMMEND_LIKES     : 3,
    TOP_RATING          : 4,
    SALE_PRICE          : 5000,
    TOP_PERCENT         : 0.3,
    MAX_PRODUCTS_PER_ROW: 60,
};

function _chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
}

// ==================== CACHE MANAGER ====================
class CacheManager {
    constructor() {
        this.KEYS = {
            PRODUCTS  : 'oda_products_v3',
            LIKES     : 'oda_likes_v3',
            COMMENTS  : 'oda_comments_v3',
            SHOPS     : 'oda_shops_v3',
            TIMESTAMP : 'oda_cache_ts_v3',
        };
    }
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify({ data, ts: Date.now(), exp: Date.now() + CONFIG.CACHE_DURATION }));
            return true;
        } catch (e) { if (e.name === 'QuotaExceededError') this._purge(); return false; }
    }
    saveAll(products, likes, comments, shops) {
        this.save(this.KEYS.PRODUCTS, products);
        this.save(this.KEYS.LIKES,    likes);
        this.save(this.KEYS.COMMENTS, comments);
        this.save(this.KEYS.SHOPS,    shops);
        localStorage.setItem(this.KEYS.TIMESTAMP, Date.now().toString());
        console.log('💾 Cache sauvegardé');
    }
    load(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const { data, exp } = JSON.parse(raw);
            if (Date.now() > exp) { localStorage.removeItem(key); return null; }
            return data;
        } catch { localStorage.removeItem(key); return null; }
    }
    loadAll() {
        return {
            products : this.load(this.KEYS.PRODUCTS),
            likes    : this.load(this.KEYS.LIKES),
            comments : this.load(this.KEYS.COMMENTS),
            shops    : this.load(this.KEYS.SHOPS),
        };
    }
    isValid() {
        return [this.KEYS.PRODUCTS, this.KEYS.LIKES, this.KEYS.COMMENTS, this.KEYS.SHOPS]
            .every(k => {
                try {
                    const raw = localStorage.getItem(k);
                    if (!raw) return false;
                    const { exp } = JSON.parse(raw);
                    return Date.now() < exp;
                } catch { return false; }
            });
    }
    clearAll() { Object.values(this.KEYS).forEach(k => localStorage.removeItem(k)); console.log('🗑️ Cache vidé'); }
    _purge() {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.startsWith('oda_') && !Object.values(this.KEYS).includes(k)) localStorage.removeItem(k);
        }
    }
    getInfo() {
        const ts = localStorage.getItem(this.KEYS.TIMESTAMP);
        if (!ts) return { valid: false, age: null };
        const age = Date.now() - parseInt(ts);
        const min = Math.floor(age / 60000);
        return { valid: this.isValid(), age: min < 60 ? `${min} min` : `${Math.floor(min / 60)} h` };
    }
}

// ==================== OPTIMIZED DATA LOADER ====================
class OptimizedDataLoader {
    constructor(sb) {
        this.sb    = sb;
        this.cache = window.cacheManager;
        this.data  = { products: [], likes: {}, comments: {}, shops: {} };
    }
    async load() {
        try {
            if (this.cache.isValid()) { console.log('📦 Cache valide'); await this._fromCache(); }
            else                      { console.log('🌐 Cache expiré'); await this._fromServer(); }
            return this.data;
        } catch (err) { console.error('❌ Erreur chargement:', err); throw err; }
    }
    async _fromCache() {
        const cached = this.cache.loadAll();
        this.data.products = cached.products || [];
        this.data.likes    = cached.likes    || {};
        this.data.comments = cached.comments || {};
        this.data.shops    = cached.shops    || {};
        console.log(`📦 ${this.data.products.length} produits depuis le cache`);
        setTimeout(() => this._updateInBackground(), 5 * 60 * 1000);
    }
    async _fromServer() {
        const currentUserId = window._currentUserId;
        const [shopsRes, productsRes, likesCountRes, userLikesRes] = await Promise.all([
            this.sb.from('parametres_boutique').select('user_id, config'),
            this.sb.from('produits').select('id,nom,description,prix,stock,main_image,categorie,user_id,created_at,prix_promo,prix_initial').in('statut', ['published', 'actif', 'active', 'disponible', 'publié']).gt('stock', 0).limit(500),
            this.sb.from('product_likes').select('product_id'),
            this.sb.from('product_likes').select('product_id').eq('user_id', currentUserId),
        ]);
        (shopsRes.data || []).forEach(s => {
            // Couvrir toutes les structures de config possibles (comme dans produit.html)
            const cfg  = s.config || {};
            const slug = cfg?.identifiant?.slug
                      || cfg?.slug
                      || cfg?.general?.slug
                      || null;
            this.data.shops[s.user_id] = {
                nom             : cfg?.general?.nom || 'Boutique',
                identifiant     : slug,
                userId          : s.user_id,
                couleurPrimaire : cfg?.apparence?.couleurPrimaire || '#FF6B00',
            };
        });
        this.data.products = (productsRes.data || []).map(p => ({
            id          : p.id,
            nom         : p.nom,
            description : p.description,
            prix        : p.prix,
            prix_promo  : p.prix_promo,
            prix_initial: p.prix_initial,
            stock       : p.stock,
            mainImage   : p.main_image,
            categorie   : p.categorie,
            userId      : p.user_id,
            created_at  : p.created_at,
            shopName    : this.data.shops[p.user_id]?.nom || 'Boutique',
            shopSlug    : this.data.shops[p.user_id]?.identifiant,
            shopColor   : this.data.shops[p.user_id]?.couleurPrimaire || '#FF6B00',
            rating      : '0.0',
            likes       : 0,
        }));
        const userLikedSet = new Set((userLikesRes.data || []).map(l => l.product_id));
        (likesCountRes.data || []).forEach(l => {
            if (!this.data.likes[l.product_id]) this.data.likes[l.product_id] = { count: 0, users: [] };
            this.data.likes[l.product_id].count++;
            this.data.likes[l.product_id].userLiked = userLikedSet.has(l.product_id);
        });
        userLikedSet.forEach(pid => {
            if (!this.data.likes[pid]) this.data.likes[pid] = { count: 0, users: [] };
            this.data.likes[pid].userLiked = true;
        });
        this.data.products = this.data.products.map(p => ({
            ...p,
            likes  : this.data.likes[p.id]?.count || 0,
            rating : '0.0',
        }));
        this.cache.saveAll(this.data.products, this.data.likes, this.data.comments, this.data.shops);
        console.log(`✅ ${this.data.products.length} produits chargés depuis Supabase`);
    }
    async _updateInBackground() {
        console.log('🔄 Mise à jour silencieuse…');
        try {
            await this._fromServer();
            window._applyLoadedData(this.data);
            console.log('✅ Mise à jour silencieuse terminée');
        } catch (e) { console.warn('⚠️ Mise à jour silencieuse échouée:', e); }
    }
    async forceReload() { this.cache.clearAll(); return this.load(); }
    _avgRating(comments) {
        if (!comments.length) return '0.0';
        return (comments.reduce((s, c) => s + (c.rating || 0), 0) / comments.length).toFixed(1);
    }
}

// ==================== IMPROVED MENU ====================
class ImprovedMenu {
    constructor() {
        this.products           = [];
        this.categories         = new Map();
        this.expandedCategories = new Set();
        if (typeof window !== 'undefined') this._injectStyles();
    }
    init(products)   { this.products = products; this._buildCategories(); this.render(); }
    update(products) { this.products = products; this._buildCategories(); this.render(); }
    _buildCategories() {
        this.categories.clear();
        this.categories.set('Tous', { count: this.products.length, subcategories: this._getSubcats(this.products) });
        const groups = {};
        this.products.forEach(p => { const c = p.categorie || 'Autres'; if (!groups[c]) groups[c] = []; groups[c].push(p); });
        Object.entries(groups)
            .sort((a, b) => b[1].length - a[1].length)
            .forEach(([cat, prods]) => {
                this.categories.set(cat, { count: prods.length, subcategories: this._getSubcats(prods) });
            });
    }
    _getSubcats(products) {
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - CONFIG.NEW_PRODUCT_DAYS);
        const subs = {};
        const recommended = products.filter(p => (p.likes || 0) >= CONFIG.RECOMMEND_LIKES);
        if (recommended.length) subs['⭐ Recommandés'] = recommended.length;
        const newOnes = products.filter(p => new Date(p.created_at) >= cutoff);
        if (newOnes.length) subs['🆕 Nouveaux'] = newOnes.length;
        const topN    = Math.max(1, Math.ceil(products.length * CONFIG.TOP_PERCENT));
        const popular = [...products].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, topN);
        if (popular.length) subs['🔥 Populaires'] = popular.length;
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= CONFIG.LOW_STOCK_THRESHOLD);
        if (lowStock.length) subs['⚠️ Fin de stock'] = lowStock.length;
        const sales = products.filter(p => p.prix < CONFIG.SALE_PRICE);
        if (sales.length) subs['💰 Soldes'] = sales.length;
        const topRated = products.filter(p => parseFloat(p.rating || 0) >= CONFIG.TOP_RATING);
        if (topRated.length) subs['🏆 Mieux notés'] = topRated.length;
        return subs;
    }
    render() {
        const list = document.getElementById('categoryList');
        if (!list) return;
        let html = '';
        const categoriesArray = Array.from(this.categories.entries());
        for (let i = 0; i < categoriesArray.length; i += 2) {
            const row = categoriesArray.slice(i, i + 2);
            html += '<div class="im-row">';
            row.forEach(([cat, data]) => {
                const isAll    = cat === 'Tous';
                const icon     = this._icon(cat);
                const pct      = ((data.count / this.products.length) * 100).toFixed(0);
                const hasSubs  = Object.keys(data.subcategories).length > 0;
                const expanded = this.expandedCategories.has(cat);
                html += `<div class="im-wrapper" style="flex:1;">
                  <div class="im-item ${isAll ? 'im-all' : ''}">
                    <div class="im-content" onclick="window.improvedMenu.selectCategory('${cat}','all')">
                      <div class="im-left"><span class="im-icon">${icon}</span><span class="im-name">${cat}</span></div>
                      <div class="im-right">
                        <span class="im-count">${data.count}</span>
                        ${!isAll ? `<span class="im-pct">${pct}%</span>` : ''}
                      </div>
                    </div>
                    ${hasSubs ? `<button class="im-toggle ${expanded ? 'expanded' : ''}" onclick="event.stopPropagation();window.improvedMenu.toggleCat('${cat}')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>` : ''}
                    ${!isAll ? `<div class="im-progress"><div class="im-progress-bar" style="width:${pct}%"></div></div>` : ''}
                  </div>`;
                if (hasSubs) {
                    html += `<div class="im-subs ${expanded ? 'expanded' : ''}">`;
                    Object.entries(data.subcategories).forEach(([sub, count]) => {
                        html += `<div class="im-sub" onclick="event.stopPropagation();window.improvedMenu.selectCategory('${cat}','${sub}')">
                          <span class="im-sub-name">${sub}</span><span class="im-sub-count">${count}</span>
                        </div>`;
                    });
                    html += '</div>';
                }
                html += '</div>';
            });
            if (row.length === 1) html += '<div class="im-wrapper" style="flex:1;visibility:hidden;"></div>';
            html += '</div>';
        }
        list.innerHTML = html;
    }
    toggleCat(cat) {
        if (this.expandedCategories.has(cat)) this.expandedCategories.delete(cat);
        else this.expandedCategories.add(cat);
        this.render();
    }
    selectCategory(cat, sub = 'all') {
        this._closeMenu();
        window.dispatchEvent(new CustomEvent('categorySelected', { detail: { category: cat, subcategory: sub } }));
    }
    _closeMenu() {
        document.getElementById('sideMenu')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
        document.body.style.overflow = ''; // ✅ FIX : débloque le scroll après sélection de catégorie
    }
    _icon(cat) {
        const found = CATEGORIES.find(c => cat.toLowerCase() === c.label.toLowerCase() || cat.toLowerCase().includes(c.value.toLowerCase()));
        return found ? found.icon : '📦';
    }
    _injectStyles() {
        if (document.getElementById('im-styles')) return;
        const s = document.createElement('style'); s.id = 'im-styles';
        s.textContent = `
            .im-wrapper{margin-bottom:6px;}
            .im-item{background:var(--bg-secondary);border-radius:12px;overflow:hidden;border:2px solid transparent;position:relative;cursor:pointer;transition:all .2s;}
            .im-item:hover{transform:translateX(3px);box-shadow:0 4px 12px rgba(0,0,0,.1);}
            .im-all{background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));border-color:transparent;}
            .im-all .im-name,.im-all .im-count,.im-all .im-pct{color:#fff!important;}
            .im-content{display:flex;justify-content:space-between;align-items:center;padding:10px 40px 10px 12px;}
            .im-left{display:flex;align-items:center;gap:8px;}
            .im-icon{font-size:1rem;}
            .im-name{font-weight:600;font-size:.82rem;color:var(--text-primary);}
            .im-right{display:flex;align-items:center;gap:6px;}
            .im-count{font-weight:700;color:var(--primary-color);background:rgba(255,107,0,.1);padding:2px 8px;border-radius:10px;min-width:32px;text-align:center;font-size:.85rem;}
            .im-pct{font-size:.65rem;color:var(--text-secondary);}
            .im-toggle{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:26px;height:26px;border:none;background:rgba(255,255,255,.9);border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s;}
            .im-toggle svg{transition:transform .3s;color:var(--primary-color);}
            .im-toggle.expanded svg{transform:rotate(180deg);}
            .im-progress{height:3px;background:rgba(0,0,0,.05);}
            .im-progress-bar{height:100%;background:linear-gradient(90deg,var(--primary-color),var(--primary-dark));transition:width .5s;}
            .im-subs{max-height:0;overflow:hidden;transition:max-height .35s ease;padding:0 8px;background:rgba(0,0,0,.02);}
            .im-subs.expanded{max-height:400px;padding:4px 8px 8px;}
            .im-sub{display:flex;justify-content:space-between;align-items:center;padding:7px 8px;background:#fff;border-radius:6px;margin-bottom:4px;border:1px solid var(--border-color);cursor:pointer;transition:all .2s;}
            .im-sub:hover{transform:translateX(4px);border-color:var(--primary-color);}
            .im-sub-name{font-size:.75rem;font-weight:500;color:var(--text-primary);}
            .im-sub-count{font-size:.72rem;font-weight:700;color:var(--primary-color);background:rgba(255,107,0,.1);padding:2px 6px;border-radius:6px;}`;
        document.head.appendChild(s);
    }
}

function getUserId() {
    let id = localStorage.getItem('oda_user_id');
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('oda_user_id', id);
    }
    return id;
}

function getUserName() {
    let name = localStorage.getItem('oda_user_name');
    if (!name) {
        name = prompt('Entrez votre nom pour commenter :') || 'Anonyme';
        localStorage.setItem('oda_user_name', name);
    }
    return name;
}

function formatPrice(price) { return `${Number(price).toLocaleString('fr-FR')} FCFA`; }

function formatDate(str) {
    const date = new Date(str);
    const diff = Math.floor((Date.now() - date) / 86400000);
    if (diff === 0) return 'Aujourd\'hui';
    if (diff === 1) return 'Hier';
    if (diff < 7)  return `Il y a ${diff} jours`;
    if (diff < 30) return `Il y a ${Math.floor(diff / 7)} sem.`;
    return date.toLocaleDateString('fr-FR');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span style="font-size:1.1rem;">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutRight .3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function _sevenDaysAgo() {
    const d = new Date(); d.setDate(d.getDate() - CONFIG.NEW_PRODUCT_DAYS); return d;
}

// ==================== STYLES SECTIONS ====================
function _injectSectionStyles() {
    if (document.getElementById('cat-section-styles')) return;
    const s = document.createElement('style'); s.id = 'cat-section-styles';
    s.textContent = `
        .oda-section{margin-bottom:16px;}
        /* FIX: forcer chaque section à occuper toute la largeur de la grille */
        .products-grid .oda-section{grid-column:1/-1;width:100%;}
        .oda-section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:0 2px;}
        .oda-section-title-wrap{display:flex;align-items:center;gap:8px;}
        .oda-section-title{font-size:1.05rem;font-weight:700;color:var(--text-primary);}
        .oda-section-badge{background:var(--primary-color);color:#fff;font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:20px;}
        .oda-section-count{font-size:.78rem;color:var(--text-secondary);font-weight:500;}
        /* FIX scroll: cursor grab + min 0 sur padding, scroll-snap actif */
        .oda-scroll-row{display:flex;gap:12px;overflow-x:scroll;overflow-y:hidden;padding-bottom:8px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none;cursor:grab;width:100%;overscroll-behavior-x:contain;will-change:scroll-position;}
        .oda-scroll-row:active{cursor:grabbing;}
        .oda-scroll-row::-webkit-scrollbar{display:none;}
        .oda-badge{position:absolute;font-size:.62rem;font-weight:700;padding:3px 7px;border-radius:10px;z-index:5;pointer-events:none;}
        .oda-badge-new{top:8px;left:8px;background:#10B981;color:#fff;}
        .oda-badge-stock{top:34px;left:8px;background:#F59E0B;color:#fff;}
        .oda-badge-sale{top:8px;right:44px;background:#EF4444;color:#fff;}
        .product-card{background:var(--bg-primary);border-radius:12px;overflow:hidden;box-shadow:var(--shadow-sm);cursor:pointer;position:relative;display:flex;flex-direction:column;border:1px solid var(--border-color);transition:all .25s cubic-bezier(.4,0,.2,1);}
        .product-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.12);border-color:var(--primary-color);}
        .product-image-wrapper{position:relative;width:100%;padding-top:65%;background:#f5f5f5;overflow:hidden;}
        .product-image{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .3s ease;}
        .product-card:hover .product-image{transform:scale(1.05);}
        .btn-favorite{position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;z-index:5;box-shadow:0 2px 8px rgba(0,0,0,.15);}
.btn-favorite svg{width:18px;height:18px;}
.btn-favorite.active{background:var(--error-color);color:#fff;}
.btn-favorite.active svg{stroke:#fff;fill:#fff;}
.btn-like,.btn-comments{display:inline-flex;align-items:center;gap:4px;background:var(--bg-secondary);border:none;border-radius:8px;padding:4px 8px;font-size:.72rem;cursor:pointer;transition:all .2s;}
.btn-like.liked{background:rgba(239,68,68,.1);color:#EF4444;}
.btn-like.liked .like-icon svg{fill:#EF4444;stroke:#EF4444;}
.btn-like:hover{transform:scale(1.05);}
.like-icon{display:flex;align-items:center;}
.like-icon svg{width:16px;height:16px;}
        .btn-favorite:hover{transform:scale(1.1);}
        .btn-report-card{position:absolute;top:8px;left:8px;width:28px;height:28px;border-radius:6px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;font-size:.85rem;z-index:5;box-shadow:0 2px 6px rgba(0,0,0,.12);opacity:.7;}
        .btn-report-card:hover{opacity:1;transform:scale(1.1);background:#FEE2E2;}
        .product-card:hover .btn-report-card{opacity:1;}
        .product-info{padding:10px;display:flex;flex-direction:column;gap:5px;flex:1;}
        .shop-badge{display:inline-flex;align-items:center;gap:3px;font-size:.68rem;font-weight:500;color:var(--text-secondary);padding:2px 6px;border-radius:8px;width:fit-content;}
        .product-name{font-size:.83rem;font-weight:700;color:var(--text-primary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3;}
        .product-engagement{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .product-rating{font-size:.7rem;color:var(--text-secondary);font-weight:600;}
        .product-price{font-size:1.05rem;font-weight:800;color:var(--primary-color);}
        .badge-promo{display:inline-block;padding:2px 8px;background:#dc2626;color:white;border-radius:10px;font-size:.7rem;font-weight:700;letter-spacing:.5px;}
        .product-stock{font-size:.68rem;font-weight:600;color:#F59E0B;}
        .product-footer{display:flex;justify-content:space-between;align-items:center;margin-top:6px;}
        /* FIX: réduire l'espace du séparateur pour éviter les grands blancs */
        .oda-category-separator{width:100%;height:2px;background:linear-gradient(90deg,var(--primary-color),transparent);margin:4px 0 8px;border-radius:2px;opacity:0.25;grid-column:1/-1;}
        .oda-voir-plus-wrap{display:flex;justify-content:center;padding:10px 0 4px;}
        .oda-voir-plus-btn{display:inline-flex;align-items:center;gap:8px;padding:9px 22px;border:2px solid var(--primary-color);border-radius:24px;background:transparent;color:var(--primary-color);font-size:.85rem;font-weight:700;cursor:pointer;transition:all .22s;letter-spacing:.02em;}
        .oda-voir-plus-btn:hover{background:var(--primary-color);color:#fff;transform:translateY(-1px);box-shadow:0 4px 14px rgba(255,107,0,.3);}
        .oda-voir-plus-btn .vp-count{background:rgba(255,107,0,.12);color:var(--primary-color);font-size:.75rem;padding:2px 8px;border-radius:12px;font-weight:700;}
        .oda-voir-plus-btn:hover .vp-count{background:rgba(255,255,255,.25);color:#fff;}`;
    document.head.appendChild(s);
}

// ==================== VOIR PLUS ====================
if (typeof window !== 'undefined') window._odaRowData = {};
if (typeof window !== 'undefined') window._odaLoadMore = function(safeId) {
    const data = window._odaRowData[safeId];
    if (!data) return;
    const { prods, offset } = data;
    const batch  = prods.slice(offset, offset + CONFIG.MAX_PRODUCTS_PER_ROW);
    const rowEl  = document.getElementById('row-' + safeId);
    if (!rowEl) return;
    const CARD_GAP = 30;
    batch.forEach((product, i) => {
        setTimeout(() => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'min-width:175px;max-width:175px;scroll-snap-align:start;flex-shrink:0;';
            wrapper.innerHTML = createProductCard(product, true);
            const card = wrapper.firstElementChild;
            if (card) {
                card.classList.add('entering');
                card.addEventListener('animationend', () => card.classList.remove('entering'), { once: true });
            }
            rowEl.appendChild(wrapper.firstElementChild || wrapper);
        }, i * CARD_GAP);
    });
    data.offset += CONFIG.MAX_PRODUCTS_PER_ROW;
    const remaining = prods.length - data.offset;
    const btnWrap   = document.getElementById('vp-wrap-' + safeId);
    if (!btnWrap) return;
    if (remaining <= 0) { btnWrap.remove(); }
    else {
        const countEl = btnWrap.querySelector('.vp-count');
        if (countEl) countEl.textContent = remaining + ' de plus';
    }
};

// ==================== SOUS-CATÉGORIES ====================
function _subcatConfigs(baseProducts) {
    const cutoff = _sevenDaysAgo();
    const topN   = Math.max(1, Math.ceil(baseProducts.length * CONFIG.TOP_PERCENT));
    const sorted = [...baseProducts].sort(
        (a, b) => (window._productLikes[b.id]?.count || b.likes || 0) - (window._productLikes[a.id]?.count || a.likes || 0)
    );
    return [
        { label: '⭐ Recommandés',        filter: p => (window._productLikes[p.id]?.count || p.likes || 0) >= CONFIG.RECOMMEND_LIKES },
        { label: '🆕 Nouveaux arrivages', filter: p => new Date(p.created_at) >= cutoff },
        { label: '🔥 Populaires',          filter: p => sorted.slice(0, topN).some(t => t.id === p.id) },
        { label: '⚠️ Fin de stock',        filter: p => p.stock > 0 && p.stock <= CONFIG.LOW_STOCK_THRESHOLD },
        { label: '💰 Soldes & Bons plans', filter: p => p.prix < CONFIG.SALE_PRICE },
        { label: '🏆 Mieux notés',         filter: p => parseFloat(p.rating || 0) >= CONFIG.TOP_RATING },
    ];
}

// ==================== CARTE PRODUIT — identique à achats ====================
function createProductCard(product, isHorizontal = false) {
    const cardStyle     = isHorizontal ? 'min-width:175px;max-width:175px;scroll-snap-align:start;flex-shrink:0;' : '';
    const likeData      = window._productLikes[product.id]    || { count: 0, userLiked: false };
    const commentsCount = (window._productComments[product.id] || []).length;
    const shopColor     = product.shopColor || '#FF6B00';
    const cutoff        = _sevenDaysAgo();
    const isNew         = new Date(product.created_at) >= cutoff;
    const isLowStock    = product.stock > 0 && product.stock <= CONFIG.LOW_STOCK_THRESHOLD;
    const isSale        = product.prix < CONFIG.SALE_PRICE;

    return `
        <div class="product-card" data-product-id="${product.id}" style="${cardStyle}" onclick="window.goToProduct(${product.id})">
            <div class="product-image-wrapper">
                ${isNew      ? `<span class="oda-badge oda-badge-new">Nouveau</span>` : ''}
                ${isLowStock ? `<span class="oda-badge oda-badge-stock">⚠️ ${product.stock} restant${product.stock > 1 ? 's' : ''}</span>` : ''}
                ${isSale && !isNew ? `<span class="oda-badge oda-badge-sale">Promo</span>` : ''}
                <button class="btn-favorite ${window._favoriteProducts.has(product.id) ? 'active' : ''}"
                        onclick="event.stopPropagation();window.toggleFavorite(${product.id})">
                    ${window._favoriteProducts.has(product.id)
                        ? '<svg class="heart-icon" viewBox="0 0 24 24" fill="#EF4444" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>'
                        : '<svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
                </button>
                <button class="btn-report-card"
                        onclick="event.stopPropagation();window.openReportModal(${product.id}, '${product.nom.replace(/'/g, "\\'")}')"
                        aria-label="Signaler ce produit">
                    🚩
                </button>
                <img src="${product.mainImage || 'https://via.placeholder.com/300'}"
                     class="product-image" alt="${product.nom}" loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300?text=Produit'">
            </div>
            <div class="product-info">
                <!-- Nom + couleur boutique comme oda-achats.html -->
                <span class="shop-badge"
                      style="background:${shopColor}18;color:${shopColor};padding:3px 8px;border-radius:8px;font-size:.7rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;width:fit-content;margin-bottom:2px;">
                    🏪 ${product.shopName || 'Boutique'}
                </span>
                <h3 class="product-name">${product.nom}</h3>
                <div class="product-engagement">
                    <button class="btn-like ${likeData.userLiked ? 'liked' : ''}"
                            data-like-product="${product.id}"
                            onclick="event.stopPropagation();window.toggleLike(${product.id})">
                        <span class="like-icon">${likeData.userLiked
                                ? '<svg viewBox="0 0 24 24" fill="#EF4444" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>'
                                : '<svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
                            </span>
                        <span class="like-count">${likeData.count}</span>
                    </button>
                    <button class="btn-comments"
                            onclick="event.stopPropagation();window.showCommentsModal(${product.id})">
                        <span>💬</span><span>${commentsCount}</span>
                    </button>
                    ${parseFloat(product.rating || 0) >= 1
                        ? `<span class="product-rating">⭐ ${product.rating}</span>`
                        : ''}
                </div>
                <div class="product-footer">
                    <!-- Prix avec couleur boutique -->
                    ${product.prix_promo && Number(product.prix_promo) > 0 && Number(product.prix_promo) < Number(product.prix) ? `
                        <div class="product-price" style="color:#22c55e;font-weight:800;font-size:1.05rem;">
                            ${formatPrice(product.prix_promo)}
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:2px;">
                            <span style="text-decoration:line-through;opacity:0.7;font-size:0.85rem;color:${shopColor};">
                                ${product.prix_initial ? formatPrice(product.prix_initial) : formatPrice(product.prix)}
                            </span>
                            <span class="badge-promo">-${Math.round((1 - Number(product.prix_promo)/Number(product.prix)) * 100)}%</span>
                        </div>
                    ` : `
                        <div class="product-price" style="color:${shopColor};font-size:1.05rem;font-weight:800;">
                            ${formatPrice(product.prix)}
                        </div>
                    `}
                    ${isLowStock ? `<div class="product-stock">⚠️ Stock faible</div>` : ''}
                </div>
            </div>
        </div>`;
}

// ==================== SECTION HORIZONTALE ====================
function _buildSection(title, products, showBadge = false) {
    if (!products.length) return '';
    return `
        <div class="oda-section">
            <div class="oda-section-header">
                <div class="oda-section-title-wrap">
                    <h3 class="oda-section-title">${title}</h3>
                    ${showBadge ? `<span class="oda-section-badge">${products.length}</span>` : ''}
                </div>
                <span class="oda-section-count">${products.length} produit${products.length > 1 ? 's' : ''}</span>
            </div>
            <div class="oda-scroll-row">${products.map(p => createProductCard(p, true)).join('')}</div>
        </div>`;
}

function _skeletonCard() {
    return `<div class="oda-skeleton-card">
        <div class="oda-sk-img"></div>
        <div class="oda-sk-body">
            <div class="oda-sk-badge"></div>
            <div class="oda-sk-title"></div>
            <div class="oda-sk-title short"></div>
            <div class="oda-sk-price"></div>
        </div>
    </div>`;
}
// ==================== SKELETONS ====================
function showSkeletons(count = 6) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    // (Conserve ta logique originale de skeletons ici)
    const sectionsHtml = Array(3).fill(0).map(() => `
        <div class="oda-skeleton-section">
            <div class="oda-skeleton-section-title"></div>
            <div class="oda-skeleton-row">${Array(4).fill(_skeletonCard()).join('')}</div>
        </div>`).join('');
    grid.innerHTML = sectionsHtml;
}

// ==================== LOAD ALL PRODUCTS OPTIMIZED ====================
async function loadAllProductsOptimized() {
    try {
        const loader = new OptimizedDataLoader(supabase);
        const data   = await loader.load();
        window._applyLoadedData(data);
    } catch (err) {
        console.error('❌ Erreur globale:', err);
        showToast('Erreur de chargement des produits', 'error');
    }
}

if (typeof window !== 'undefined') window._applyLoadedData = function(data) {
    const deduped = _deduplicateProducts(data.products);
    window._allProducts      = deduped;
    window._productLikes     = data.likes;
    window._productComments  = data.comments;

    _injectSectionStyles();
    window.improvedMenu.init(deduped);
    renderProducts(deduped);
    renderCarousel(deduped);
};

function _deduplicateProducts(products) {
    const seen = new Map();
    return products.filter(p => {
        const key = `${p.nom?.trim().toLowerCase()}|${p.prix}|${p.categorie?.toLowerCase()}|${p.mainImage || ''}`;
        if (seen.has(key)) return false;
        seen.set(key, true);
        return true;
    });
}

// ==================== RENDER PRODUCTS ====================
// Stratégie de regroupement :
//   • Plusieurs catégories ("Tous") → une rangée horizontale par catégorie
//   • Une seule catégorie (filtrée)  → une rangée horizontale par boutique
//     (si 1 seule boutique : découpage en tranches de 15)
// Dans les deux cas : scroll vertical entre rangées + scroll horizontal dans chaque rangée.
function renderProducts(products) {
    const grid       = document.getElementById('productsGrid');
    const countEl    = document.getElementById('productCount');
    const emptyState = document.getElementById('emptyState');
    if (!grid) return;

    if (countEl) countEl.textContent = `${products.length} produit${products.length !== 1 ? 's' : ''}`;

    if (!products.length) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    const subcats = _subcatConfigs(products);
    let html = '';

    // ── Sections spéciales (Recommandés, Nouveaux, Populaires…) ──
    subcats.forEach(({ label, filter }) => {
        const sub = products.filter(filter);
        if (sub.length >= 2) html += _buildSection(label, sub, true);
    });

    html += '<div class="oda-category-separator" style="grid-column:1/-1"></div>';

    // ── Stratégie de regroupement ──────────────────────────────────────────
    const uniqueCategories = new Set(products.map(p => p.categorie || 'Autres'));

    if (uniqueCategories.size === 1) {
        // Vue filtrée (une seule catégorie) : regrouper par boutique
        const catName = [...uniqueCategories][0];
        const catIcon = window.improvedMenu._icon(catName);
        const byShop  = {};
        products.forEach(p => {
            const shop = p.shopName || 'Boutique';
            if (!byShop[shop]) byShop[shop] = [];
            byShop[shop].push(p);
        });

        const shopEntries = Object.entries(byShop).sort((a, b) => b[1].length - a[1].length);

        if (shopEntries.length === 1) {
            // 1 seule boutique → découper en tranches de 15
            const allProds = shopEntries[0][1];
            _chunkArray(allProds, 15).forEach((chunk, i, arr) => {
                const safeId = `${catName.replace(/[^a-zA-Z0-9]/g, '_')}_chunk${i}`;
                html += `<div class="oda-section">
                    <div class="oda-section-header">
                        <div class="oda-section-title-wrap">
                            <h3 class="oda-section-title">${catIcon} ${catName}</h3>
                            ${i === 0 ? `<span class="oda-section-badge">${allProds.length}</span>` : ''}
                        </div>
                        <span class="oda-section-count">${i + 1} / ${arr.length}</span>
                    </div>
                    <div class="oda-scroll-row" id="row-${safeId}">
                        ${chunk.map(p => createProductCard(p, true)).join('')}
                    </div>
                </div>`;
            });
        } else {
            // Plusieurs boutiques → une rangée par boutique
            shopEntries.forEach(([shop, prods]) => {
                const safeId  = shop.replace(/[^a-zA-Z0-9]/g, '_') + '_shop';
                const initial = prods.slice(0, CONFIG.MAX_PRODUCTS_PER_ROW);
                const rest    = prods.slice(CONFIG.MAX_PRODUCTS_PER_ROW);
                html += `<div class="oda-section">
                    <div class="oda-section-header">
                        <div class="oda-section-title-wrap">
                            <h3 class="oda-section-title">🏪 ${shop}</h3>
                            <span class="oda-section-badge">${prods.length}</span>
                        </div>
                        <span class="oda-section-count">${prods.length} produit${prods.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="oda-scroll-row" id="row-${safeId}">
                        ${initial.map(p => createProductCard(p, true)).join('')}
                    </div>`;
                if (rest.length > 0) {
                    window._odaRowData[safeId] = { prods: rest, offset: 0 };
                    html += `<div class="oda-voir-plus-wrap" id="vp-wrap-${safeId}">
                        <button class="oda-voir-plus-btn" onclick="window._odaLoadMore('${safeId}')">
                            Voir plus <span class="vp-count">${rest.length} de plus</span>
                        </button>
                    </div>`;
                }
                html += '</div>';
            });
        }
    } else {
        // Vue "Tous" : une rangée par catégorie
        const byCategory = {};
        products.forEach(p => {
            const cat = p.categorie || 'Autres';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(p);
        });
        Object.entries(byCategory)
            .sort((a, b) => b[1].length - a[1].length)
            .forEach(([cat, prods]) => {
                const icon    = window.improvedMenu._icon(cat);
                const initial = prods.slice(0, CONFIG.MAX_PRODUCTS_PER_ROW);
                const rest    = prods.slice(CONFIG.MAX_PRODUCTS_PER_ROW);
                const safeId  = cat.replace(/[^a-zA-Z0-9]/g, '_');
                html += `<div class="oda-section">
                    <div class="oda-section-header">
                        <div class="oda-section-title-wrap">
                            <h3 class="oda-section-title">${icon} ${cat}</h3>
                            <span class="oda-section-badge">${prods.length}</span>
                        </div>
                        <span class="oda-section-count">${prods.length} produit${prods.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="oda-scroll-row" id="row-${safeId}">
                        ${initial.map(p => createProductCard(p, true)).join('')}
                    </div>`;
                if (rest.length > 0) {
                    window._odaRowData[safeId] = { prods: rest, offset: 0 };
                    html += `<div class="oda-voir-plus-wrap" id="vp-wrap-${safeId}">
                        <button class="oda-voir-plus-btn" onclick="window._odaLoadMore('${safeId}')">
                            Voir plus <span class="vp-count">${rest.length} de plus</span>
                        </button>
                    </div>`;
                }
                html += '</div>';
            });
    }

    grid.innerHTML = html;
    attachProductInteractions();
    initCardReportTriggers();
}

// ==================== CAROUSEL ====================
function renderCarousel(products) {
    const container = document.getElementById('carouselContainer');
    const dotsEl    = document.getElementById('carouselDots');
    if (!container) return;

    const featured = products
        .filter(p => p.mainImage)
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 20);

    if (!featured.length) return;

    container.innerHTML = featured.map((p, i) => `
        <div class="carousel-item" data-product-id="${p.id}" onclick="window.goToProduct(${p.id})">
            <img src="${p.mainImage}" class="carousel-image" alt="${p.nom}" loading="${i === 0 ? 'eager' : 'lazy'}"
                 onerror="this.parentElement.style.display='none'">
            <button class="btn-report-carousel"
                    onclick="event.stopPropagation();window.openReportModal(${p.id}, '${p.nom.replace(/'/g, "\\'")}')"
                    aria-label="Signaler ce produit">
                🚩
            </button>
                    <div class="carousel-overlay">
                        <div class="carousel-info">
                            <div class="shop-name">🏪 ${p.shopName}</div>
                            <h2>${p.nom}</h2>
                            ${p.prix_promo && Number(p.prix_promo) > 0 && Number(p.prix_promo) < Number(p.prix) ? `
                                <div class="product-price" style="color:#22c55e;font-weight:700;">${formatPrice(p.prix_promo)}</div>
                                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                    <span style="text-decoration:line-through;opacity:0.8;font-size:0.9rem;">${p.prix_initial ? formatPrice(p.prix_initial) : formatPrice(p.prix)}</span>
                                    <span class="badge-promo" style="background:#dc2626;color:white;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:700;">-${Math.round((1 - Number(p.prix_promo)/Number(p.prix)) * 100)}%</span>
                                </div>
                            ` : `
                                <div class="product-price">${formatPrice(p.prix)}</div>
                            `}
                        </div>
                    </div>
        </div>`).join('');

    if (dotsEl) {
        dotsEl.innerHTML = featured.map((_, i) =>
            `<div class="dot ${i === 0 ? 'active' : ''}" onclick="window.goToSlide(${i})"></div>`
        ).join('');
    }
}

// ==================== CAROUSEL CONTROLS ====================
function initCarouselControls() {
    const container = document.getElementById('carouselContainer');
    const btnPrev   = document.getElementById('btnPrev');
    const btnNext   = document.getElementById('btnNext');
    if (!container) return;

    const getSlides = () => container.querySelectorAll('.carousel-item');
    const getDots   = () => document.querySelectorAll('.dot');

    window.goToSlide = function(idx) {
        const slides = getSlides();
        const dots   = getDots();
        if (!slides.length) return;
        window._currentSlide = (idx + slides.length) % slides.length;
        container.style.transform = `translateX(-${window._currentSlide * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === window._currentSlide));
    };

    if (btnPrev) btnPrev.addEventListener('click', () => window.goToSlide(window._currentSlide - 1));
    if (btnNext) btnNext.addEventListener('click', () => window.goToSlide(window._currentSlide + 1));

    window._carouselInterval = setInterval(() => {
        const slides = getSlides();
        if (slides.length) window.goToSlide(window._currentSlide + 1);
    }, CONFIG.CAROUSEL_INTERVAL);

    // Swipe tactile
    let startX = 0;
    container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend',   e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) window.goToSlide(window._currentSlide + (diff > 0 ? 1 : -1));
    });

    // Drag souris (FIX: permettre le glissement à la souris)
    let isDragging = false, dragStartX = 0;
    const wrapper = container.closest('.carousel-wrapper') || container;
    wrapper.addEventListener('mousedown', e => { isDragging = true; dragStartX = e.clientX; });
    window.addEventListener('mouseup',   e => {
        if (!isDragging) return;
        isDragging = false;
        const diff = dragStartX - e.clientX;
        if (Math.abs(diff) > 50) window.goToSlide(window._currentSlide + (diff > 0 ? 1 : -1));
    });
}

// ==================== SEARCH ====================
function initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            const filtered = q
                ? window._allProducts.filter(p =>
                    (p.nom         || '').toLowerCase().includes(q) ||
                    (p.description || '').toLowerCase().includes(q) ||
                    (p.categorie   || '').toLowerCase().includes(q) ||
                    (p.shopName    || '').toLowerCase().includes(q)
                )
                : window._allProducts;
            renderProducts(filtered);
            if (q) {
                const grid = document.getElementById('productsGrid');
                if (grid) grid.style.animation = 'fadeIn .3s ease';
            }
        }, CONFIG.DEBOUNCE_DELAY);
    });
}

// ==================== CATEGORY FILTERING ====================
function setupCategoryFiltering() {
    window.addEventListener('categorySelected', (e) => {
        const { category, subcategory } = e.detail;
        let filtered = window._allProducts;

        if (category !== 'Tous') filtered = filtered.filter(p => p.categorie === category);

        if (subcategory && subcategory !== 'all') {
            const cutoff = _sevenDaysAgo();
            const topN   = Math.max(1, Math.ceil(filtered.length * CONFIG.TOP_PERCENT));
            const sorted = [...filtered].sort((a, b) =>
                (window._productLikes[b.id]?.count || b.likes || 0) -
                (window._productLikes[a.id]?.count || a.likes || 0)
            );
            const subMap = {
                '⭐ Recommandés'     : p => (window._productLikes[p.id]?.count || p.likes || 0) >= CONFIG.RECOMMEND_LIKES,
                '🆕 Nouveaux'        : p => new Date(p.created_at) >= cutoff,
                '🔥 Populaires'      : p => sorted.slice(0, topN).some(t => t.id === p.id),
                '⚠️ Fin de stock'    : p => p.stock > 0 && p.stock <= CONFIG.LOW_STOCK_THRESHOLD,
                '💰 Soldes'          : p => p.prix < CONFIG.SALE_PRICE,
                '🏆 Mieux notés'     : p => parseFloat(p.rating || 0) >= CONFIG.TOP_RATING,
            };
            const fn = Object.entries(subMap).find(([k]) => subcategory.includes(k.replace(/^[^ ]+ /, '')))?.[1]
                     || subMap[subcategory];
            if (fn) filtered = filtered.filter(fn);
        }

        renderProducts(filtered);
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        window.scrollToProducts?.();
    });
}

// ==================== SIDE MENU ====================
function initSideMenu() {
    const menuBtn   = document.getElementById('menuBtn');
    const closeBtn  = document.getElementById('closeMenuBtn');
    const overlay   = document.getElementById('overlay');
    const sideMenu  = document.getElementById('sideMenu');

    const open  = () => { sideMenu?.classList.add('active'); overlay?.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const close = () => { sideMenu?.classList.remove('active'); overlay?.classList.remove('active'); document.body.style.overflow = ''; };

    menuBtn?.addEventListener('click',  open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click',  close);

    // About / Contact / Help
    document.getElementById('aboutLink')?.addEventListener('click', e => {
        e.preventDefault(); close();
        const m = document.getElementById('aboutModal');
        if (m) { m.style.display = 'flex'; setTimeout(() => m.style.opacity = '1', 10); }
    });
    document.getElementById('contactLink')?.addEventListener('click', e => {
        e.preventDefault(); close();
        const m = document.getElementById('contactModal');
        if (m) { m.style.display = 'flex'; setTimeout(() => m.style.opacity = '1', 10); }
    });
    document.getElementById('helpLink')?.addEventListener('click', e => {
        e.preventDefault(); close();
        const m = document.getElementById('helpModal');
        if (m) { m.style.display = 'flex'; setTimeout(() => m.style.opacity = '1', 10); }
    });

    window.closeModal = function(id) {
        const m = document.getElementById(id);
        if (m) { m.style.opacity = '0'; setTimeout(() => m.style.display = 'none', 300); }
    };
}

// ==================== SCROLL BEHAVIOR ====================
function initScrollBehavior() {
    window.scrollToProducts = function() {
        document.querySelector('.products-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const header = document.querySelector('.main-header');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (header) {
            header.style.boxShadow = current > 10 ? '0 2px 20px rgba(0,0,0,.3)' : 'none';
        }
        lastScroll = current;
    }, { passive: true });
}

// ==================== FAVORITES ====================
function loadFavorites() {
    try {
        const saved = JSON.parse(localStorage.getItem('oda_favorites') || '[]');
        window._favoriteProducts = new Set(saved);
    } catch { window._favoriteProducts = new Set(); }
}

function saveFavorites() {
    try {
        localStorage.setItem('oda_favorites', JSON.stringify([...window._favoriteProducts]));
    } catch {}
}

if (typeof window !== 'undefined') window.toggleFavorite = function(productId) {
    if (window._favoriteProducts.has(productId)) window._favoriteProducts.delete(productId);
    else                                          window._favoriteProducts.add(productId);
    saveFavorites();
    updateBadges();
    // Rafraîchir l'icône sur la carte
    const btn = document.querySelector(`[onclick*="toggleFavorite(${productId})"]`);
    if (btn) {
        const isFav = window._favoriteProducts.has(productId);
        btn.innerHTML = isFav
            ? '<svg class="heart-icon" viewBox="0 0 24 24" fill="#EF4444" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>'
            : '<svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.classList.toggle('active', isFav);
    }
    showToast(window._favoriteProducts.has(productId) ? '✅ Ajouté aux favoris' : ' Retiré des favoris', 'success');
};

function updateBadges() {
    const favBadge = document.getElementById('favBadge');
    if (favBadge) {
        const count = window._favoriteProducts.size;
        favBadge.textContent = count;
        favBadge.style.display = count > 0 ? 'block' : 'none';
    }
}

// ==================== LIKES ====================
if (typeof window !== 'undefined') window.toggleLike = async function(productId) {
    const userId = window._currentUserId;
    const curr   = window._productLikes[productId] || { count: 0, userLiked: false };

    // Optimistic update
    curr.userLiked = !curr.userLiked;
    curr.count     = Math.max(0, curr.count + (curr.userLiked ? 1 : -1));
    window._productLikes[productId] = curr;

    // Update UI
    const btn = document.querySelector(`[data-like-product="${productId}"]`);
    if (btn) {
        btn.classList.toggle('liked', curr.userLiked);
        btn.querySelector('.like-icon').innerHTML = curr.userLiked
        ? '<svg viewBox="0 0 24 24" fill="#EF4444" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.querySelector('.like-count').textContent = curr.count;
    }

    try {
        if (curr.userLiked) {
            await supabase.from('product_likes').upsert({ product_id: productId, user_id: userId }, { onConflict: 'product_id,user_id' });
        } else {
            await supabase.from('product_likes').delete().eq('product_id', productId).eq('user_id', userId);
        }
    } catch (e) { console.warn('Like sync error:', e); }
};

// ==================== UTILITAIRES NOM / VERROU 3 MOIS ====================
// Le nom est verrouillé pendant 3 mois après sa première saisie
function _getNomLock() {
    try {
        const raw = localStorage.getItem('oda_name_lock');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}
function _isNomLocked() {
    const lock = _getNomLock();
    if (!lock) return false;
    const trois_mois = 90 * 24 * 60 * 60 * 1000;
    return (Date.now() - lock.ts) < trois_mois;
}
function _setNomLock(name) {
    localStorage.setItem('oda_user_name', name);
    localStorage.setItem('oda_name_lock', JSON.stringify({ name, ts: Date.now() }));
}
function _tempsRestantLock() {
    const lock = _getNomLock();
    if (!lock) return '';
    const ms   = 90 * 24 * 60 * 60 * 1000 - (Date.now() - lock.ts);
    if (ms <= 0) return '';
    const jours = Math.ceil(ms / 86400000);
    return jours > 1 ? `encore ${jours} jours` : 'moins d\'un jour';
}

// ==================== ÉTOILES SVG (coloration + demi-étoile) ====================
function _renderStars(rating, interactive = false, name = 'oda_rating') {
    // rating : nombre flottant (ex: 3.5), interactive : affiche cliquable
    const full = Math.floor(rating);
    const half = (rating - full) >= 0.4 && (rating - full) < 0.9;
    const empty = 5 - full - (half ? 1 : 0);

    if (!interactive) {
        // Affichage lecture seule avec SVG colorés
        let svg = '';
        const star = (type) => {
            const id = 'h' + Math.random().toString(36).slice(2,7);
            if (type === 'full')
                return `<svg width="18" height="18" viewBox="0 0 24 24" style="display:inline;vertical-align:middle;">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill="#FFC107" stroke="#FFC107" stroke-width="1" stroke-linejoin="round"/>
                </svg>`;
            if (type === 'half')
                return `<svg width="18" height="18" viewBox="0 0 24 24" style="display:inline;vertical-align:middle;">
                    <defs><linearGradient id="${id}"><stop offset="50%" stop-color="#FFC107"/>
                    <stop offset="50%" stop-color="#e0e0e0"/></linearGradient></defs>
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill="url(#${id})" stroke="#FFC107" stroke-width="1" stroke-linejoin="round"/>
                </svg>`;
            return `<svg width="18" height="18" viewBox="0 0 24 24" style="display:inline;vertical-align:middle;">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill="#e0e0e0" stroke="#d0d0d0" stroke-width="1" stroke-linejoin="round"/>
            </svg>`;
        };
        for (let i=0;i<full;i++)  svg += star('full');
        if (half)                  svg += star('half');
        for (let i=0;i<empty;i++) svg += star('empty');
        return svg;
    }

    // Affichage interactif : 5 étoiles cliquables + demi-étoiles
    // Valeurs possibles : 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5
    let html = `<div id="oda-star-picker" style="display:flex;gap:4px;margin-bottom:12px;align-items:center;">`;
    for (let i = 1; i <= 5; i++) {
        const idFull = `star-full-${i}`;
        const idHalf = `star-half-${i}`;
        html += `
        <div style="position:relative;width:32px;height:32px;cursor:pointer;">
            <!-- demi gauche -->
            <div style="position:absolute;left:0;top:0;width:50%;height:100%;z-index:2;"
                 onclick="window._pickStar(${i - 0.5})" title="${i - 0.5} étoile${i>1?'s':''}"></div>
            <!-- demi droite -->
            <div style="position:absolute;right:0;top:0;width:50%;height:100%;z-index:2;"
                 onclick="window._pickStar(${i})" title="${i} étoile${i>1?'s':''}"></div>
            <svg id="oda-star-${i}" width="32" height="32" viewBox="0 0 24 24"
                 style="position:absolute;top:0;left:0;transition:transform .15s;">
                <defs>
                    <linearGradient id="grad-${i}">
                        <stop id="gstop-${i}" offset="100%" stop-color="#e0e0e0"/>
                        <stop offset="100%" stop-color="#e0e0e0"/>
                    </linearGradient>
                </defs>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill="url(#grad-${i})" stroke="#FFC107" stroke-width="1" stroke-linejoin="round"/>
            </svg>
        </div>`;
    }
    html += `</div>
    <input type="hidden" id="oda_rating_val" value="5">
    <div id="oda-star-label" style="font-size:.82rem;color:#666;margin-bottom:10px;">⭐ 5 / 5</div>`;
    return html;
}

// Mettre à jour visuellement les étoiles du picker
if (typeof window !== 'undefined') window._pickStar = function(val) {
    document.getElementById('oda_rating_val').value = val;
    const labels = {0.5:'Très mauvais',1:'Mauvais',1.5:'Passable',2:'Décevant',
                    2.5:'Moyen',3:'Correct',3.5:'Bien',4:'Très bien',4.5:'Excellent',5:'Parfait'};
    const lbl = document.getElementById('oda-star-label');
    if (lbl) lbl.textContent = `⭐ ${val} / 5 — ${labels[val]||''}`;

    for (let i = 1; i <= 5; i++) {
        const stop = document.getElementById(`gstop-${i}`);
        const svg  = document.getElementById(`oda-star-${i}`);
        if (!stop || !svg) continue;
        let pct = '0%';
        if (val >= i)         pct = '100%';
        else if (val >= i-0.5) pct = '50%';
        stop.setAttribute('offset', pct);
        // changer la couleur de remplissage
        stop.setAttribute('stop-color', '#FFC107');
        const poly = svg.querySelector('polygon');
        if (poly) poly.setAttribute('fill', `url(#grad-${i})`);
        svg.style.transform = val === i ? 'scale(1.2)' : 'scale(1)';
    }
};

// ==================== CHARGEMENT COMMENTAIRES SUPABASE (tous utilisateurs) ====================
async function _loadCommentsFromDB(productId) {
    try {
        const { data, error } = await supabase
            .from('product_comments')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        window._productComments[productId] = data || [];
        return data || [];
    } catch (e) {
        console.warn('Erreur chargement commentaires:', e);
        return window._productComments[productId] || [];
    }
}

// ==================== VÉRIFICATION SESSION PROPRIÉTAIRE ====================
// Vérifie si l'utilisateur connecté est bien le propriétaire du produit
async function _checkOwnerSession(product) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { isOwner: false, shopName: null };
        const userId = session.user.id;
        // Comparer avec le userId du produit
        if (product.userId !== userId) return { isOwner: false, shopName: null };
        // Récupérer le nom de la boutique
        const { data: boutique } = await supabase
            .from('parametres_boutique')
            .select('config')
            .eq('user_id', userId)
            .single();
        const shopName = boutique?.config?.general?.nom
                      || boutique?.config?.nom
                      || 'Propriétaire';
        return { isOwner: true, shopName };
    } catch (e) {
        console.warn('Vérification session propriétaire:', e);
        return { isOwner: false, shopName: null };
    }
}

// ==================== RÉPONSE PROPRIÉTAIRE DEPUIS ACHATS ====================
if (typeof window !== 'undefined') window.submitOwnerReply = async function(productId, parentId, shopName) {
    const textEl = document.getElementById(`owner-reply-text-${parentId}`);
    const text   = textEl?.value.trim() || '';
    if (!text) {
        showToast('⚠️ Écrivez une réponse', 'error');
        textEl?.focus();
        return;
    }
    const btn = document.getElementById(`owner-reply-btn-${parentId}`);
    try {
        if (btn) { btn.disabled = true; btn.textContent = '…'; }
        const { data: { session } } = await supabase.auth.getSession();
        const { data, error } = await supabase.from('product_comments').insert({
            product_id : productId,
            parent_id  : parentId,
            user_id    : session?.user?.id || null,
            user_name  : shopName || 'Propriétaire',
            comment    : text,
            contenu    : text,
            is_vendeur : true,
            rating     : 0,
        }).select().single();
        if (error) throw error;
        if (!window._productComments[productId]) window._productComments[productId] = [];
        window._productComments[productId].unshift(data);
        showToast('✅ Réponse publiée en tant que propriétaire !', 'success');
        document.querySelector('.oda-comments-modal')?.remove();
        window.showCommentsModal(productId);
    } catch (err) {
        console.error('Erreur réponse propriétaire:', err);
        showToast('❌ Erreur lors de la publication', 'error');
        if (btn) { btn.disabled = false; btn.textContent = '↩ Envoyer'; }
    }
};

// ==================== COMMENTS MODAL ====================
function _avgRating(comments) {
    if (!comments || !comments.length) return '0.0';
    return (comments.reduce((s, c) => s + (c.rating || 0), 0) / comments.length).toFixed(1);
}

if (typeof window !== 'undefined') window.showCommentsModal = async function(productId) {
    const product  = window._allProducts.find(p => p.id === productId);
    if (!product) return;
    const likeData = window._productLikes[productId] || { count: 0, userLiked: false };

    // Supprimer modal existant et afficher un loader
    document.querySelector('.oda-comments-modal')?.remove();
    const loader = document.createElement('div');
    loader.className = 'oda-comments-modal';
    loader.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.4);';
    loader.innerHTML = `<div style="background:#fff;border-radius:16px;padding:24px;text-align:center;">
        <div style="width:36px;height:36px;border:4px solid #eee;border-top-color:var(--primary-color);
             border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div>
        <div style="font-size:.9rem;color:#666;">Chargement des avis…</div>
    </div>`;
    document.body.appendChild(loader);

    // Charger TOUS les commentaires ET vérifier si propriétaire connecté en parallèle
    const [comments, ownerCheck] = await Promise.all([
        _loadCommentsFromDB(productId),
        _checkOwnerSession(product),
    ]);
    const isOwner  = ownerCheck.isOwner;
    const shopName = ownerCheck.shopName;
    loader.remove();

    // Vérification verrou nom
    const locked  = _isNomLocked();
    const lock    = _getNomLock();
    const savedName = lock?.name || localStorage.getItem('oda_user_name') || '';
    const reste   = _tempsRestantLock();

    const nameField = locked
        ? `<div style="position:relative;margin-bottom:10px;">
               <input type="text" value="${savedName}" readonly
                   style="width:100%;padding:11px 14px 11px 40px;border:2px solid #10B981;
                   border-radius:10px;font-size:.9rem;font-family:inherit;outline:none;
                   background:#f0fdf4;color:#065f46;font-weight:700;box-sizing:border-box;cursor:not-allowed;">
               <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:1rem;">🔒</span>
               <div style="font-size:.72rem;color:#10B981;margin-top:4px;">
                   Nom verrouillé — modifiable ${reste ? 'dans ' + reste : 'bientôt'}
               </div>
           </div>`
        : `<input id="odaCommentName" type="text"
               value="${savedName}"
               placeholder="Votre nom (obligatoire) *"
               style="width:100%;padding:11px 14px;border:2px solid #e5e5e5;
               border-radius:10px;font-size:.9rem;font-family:inherit;outline:none;
               margin-bottom:10px;box-sizing:border-box;"
               oninput="this.style.borderColor=this.value.trim()?'#e5e5e5':'#EF4444'">`;

    // Séparer commentaires parents et réponses (vendeur ou utilisateur)
    const parentComments = comments.filter(c => !c.parent_id && !c.is_vendeur);
    const repliesMap     = {};
    comments.filter(c => c.parent_id || c.is_vendeur).forEach(r => {
        const key = r.parent_id || 'orphan';
        if (!repliesMap[key]) repliesMap[key] = [];
        repliesMap[key].push(r);
    });

    // Construction liste commentaires
    const avg = parseFloat(_avgRating(parentComments));
    const commentsListHtml = parentComments.length === 0
        ? `<p style="text-align:center;color:#999;padding:24px 0;">Aucun avis — soyez le premier ! 🙌</p>`
        : parentComments.map(c => {
            const auteur   = c.user_name || 'Anonyme';
            const initiale = auteur.charAt(0).toUpperCase();
            const note     = parseFloat(c.rating || 0);
            const myReplies = repliesMap[c.id] || [];

            const repliesHtml = myReplies.map(r => {
                const isVendor = r.is_vendeur;
                const rName    = r.user_name || (isVendor ? 'Propriétaire' : 'Anonyme');
                return `<div style="margin-top:10px;padding:10px 14px;
                    background:${isVendor ? 'rgba(255,107,0,0.06)' : 'rgba(59,130,246,0.05)'};
                    border-left:3px solid ${isVendor ? 'var(--primary-color)' : '#3b82f6'};
                    border-radius:0 8px 8px 0;">
                    <div style="font-size:.7rem;font-weight:700;
                        color:${isVendor ? 'var(--primary-color)' : '#3b82f6'};margin-bottom:4px;">
                        ${isVendor ? '🏪 Réponse du propriétaire' : '👤 ' + rName} · ${formatDate(r.created_at)}
                    </div>
                    <p style="margin:0;font-size:.85rem;line-height:1.5;color:#1a1a1a;">
                        ${r.comment || r.contenu || ''}
                    </p>
                </div>`;
            }).join('');

            // Bouton réponse propriétaire (visible seulement si connecté en tant que propriétaire)
            const ownerReplyBlock = isOwner ? `
                <!-- Formulaire réponse PROPRIÉTAIRE -->
                <div id="owner-reply-form-${c.id}" style="display:none;margin-top:10px;
                    background:rgba(255,107,0,0.04);border:1.5px solid rgba(255,107,0,0.2);
                    border-radius:10px;padding:12px;">
                    <div style="font-size:.72rem;font-weight:700;color:var(--primary-color);margin-bottom:8px;">
                        🏪 Répondre en tant que propriétaire · ${shopName}
                    </div>
                    <textarea id="owner-reply-text-${c.id}" rows="2"
                        style="width:100%;padding:10px;border:1.5px solid rgba(255,107,0,0.3);
                        border-radius:8px;font-family:inherit;font-size:.85rem;
                        resize:none;outline:none;box-sizing:border-box;background:#fff;"
                        placeholder="Votre réponse en tant que propriétaire…"
                        onfocus="this.style.borderColor='var(--primary-color)'"
                        onblur="this.style.borderColor='rgba(255,107,0,0.3)'"></textarea>
                    <div style="display:flex;gap:8px;margin-top:6px;justify-content:flex-end;">
                        <button
                            onclick="document.getElementById('owner-reply-form-${c.id}').style.display='none'"
                            style="padding:6px 12px;border:none;background:#f0f0f0;
                            border-radius:8px;cursor:pointer;font-size:.8rem;color:#555;">
                            Annuler
                        </button>
                        <button id="owner-reply-btn-${c.id}"
                            onclick="window.submitOwnerReply(${productId}, ${c.id}, '${(shopName||'Propriétaire').replace(/'/g,'\\\'')}')"
                            style="padding:6px 16px;background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));
                            color:#fff;border:none;border-radius:8px;cursor:pointer;
                            font-size:.8rem;font-weight:700;">
                            🏪 Publier
                        </button>
                    </div>
                </div>
                <button
                    onclick="const f=document.getElementById('owner-reply-form-${c.id}');f.style.display=f.style.display==='none'?'block':'none';if(f.style.display==='block')document.getElementById('owner-reply-text-${c.id}').focus();"
                    style="margin-top:8px;padding:4px 12px;border:1.5px solid rgba(255,107,0,0.4);
                    background:rgba(255,107,0,0.06);border-radius:20px;font-size:.75rem;cursor:pointer;
                    color:var(--primary-color);font-weight:700;transition:all .2s;display:block;"
                    onmouseover="this.style.background='rgba(255,107,0,0.14)'"
                    onmouseout="this.style.background='rgba(255,107,0,0.06)'">
                    🏪 Répondre (propriétaire)
                </button>` : '';

            return `
            <div style="padding:14px 0;border-bottom:1px solid #f0f0f0;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:36px;height:36px;border-radius:50%;
                            background:var(--primary-color);color:#fff;flex-shrink:0;
                            display:flex;align-items:center;justify-content:center;
                            font-weight:700;font-size:.9rem;">${initiale}</div>
                        <div>
                            <div style="font-weight:700;font-size:.9rem;">${auteur}</div>
                            <div style="font-size:.72rem;color:#999;">${formatDate(c.created_at)}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;">
                        ${_renderStars(note)}
                        <span style="font-size:.78rem;color:#888;margin-left:2px;">${note.toFixed(1)}</span>
                    </div>
                </div>
                <p style="margin:0;font-size:.88rem;line-height:1.6;color:#1a1a1a;padding-left:44px;">
                    ${c.comment || c.contenu || ''}
                </p>

                <!-- Réponses imbriquées -->
                <div style="padding-left:44px;">
                    ${repliesHtml}

                    ${ownerReplyBlock}

                    <!-- Formulaire réponse utilisateur normal (caché par défaut) -->
                    <div id="reply-form-${c.id}" style="display:none;margin-top:10px;">
                        <textarea id="reply-text-${c.id}" rows="2"
                            style="width:100%;padding:10px;border:1.5px solid #e5e5e5;
                            border-radius:8px;font-family:inherit;font-size:.85rem;
                            resize:none;outline:none;box-sizing:border-box;
                            transition:border-color .2s;"
                            placeholder="Votre réponse…"
                            onfocus="this.style.borderColor='var(--primary-color)'"
                            onblur="this.style.borderColor='#e5e5e5'"></textarea>
                        <div style="display:flex;gap:8px;margin-top:6px;justify-content:flex-end;">
                            <button
                                onclick="document.getElementById('reply-form-${c.id}').style.display='none'"
                                style="padding:6px 12px;border:none;background:#f0f0f0;
                                border-radius:8px;cursor:pointer;font-size:.8rem;color:#555;">
                                Annuler
                            </button>
                            <button id="reply-btn-${c.id}"
                                onclick="window.submitOdaReply(${productId}, ${c.id})"
                                style="padding:6px 16px;background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));
                                color:#fff;border:none;border-radius:8px;cursor:pointer;
                                font-size:.8rem;font-weight:700;">
                                ↩ Envoyer
                            </button>
                        </div>
                    </div>

                    <!-- Bouton afficher/masquer le formulaire utilisateur -->
                    <button
                        onclick="const f=document.getElementById('reply-form-${c.id}');f.style.display=f.style.display==='none'?'block':'none';if(f.style.display==='block')document.getElementById('reply-text-${c.id}').focus();"
                        style="margin-top:8px;padding:4px 12px;border:1.5px solid #e0e0e0;
                        background:none;border-radius:20px;font-size:.75rem;cursor:pointer;
                        color:#666;transition:all .2s;"
                        onmouseover="this.style.borderColor='var(--primary-color)';this.style.color='var(--primary-color)'"
                        onmouseout="this.style.borderColor='#e0e0e0';this.style.color='#666'">
                        ↩ Répondre
                    </button>
                </div>
            </div>`;
        }).join('');

    const modal = document.createElement('div');
    modal.className = 'oda-comments-modal';
    modal.innerHTML = `
        <div onclick="this.parentElement.remove()"
             style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8998;"></div>
        <div style="position:fixed;bottom:0;left:0;right:0;background:#fff;
             border-radius:20px 20px 0 0;max-height:88vh;overflow-y:auto;padding:24px;
             z-index:8999;animation:slideUp .3s ease;">

            <div style="width:40px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 16px;"></div>

            <h3 style="font-size:1.05rem;font-weight:800;text-align:center;margin-bottom:4px;">${product.nom}</h3>

            ${isOwner ? `
            <div style="background:rgba(255,107,0,0.08);border:1.5px solid rgba(255,107,0,0.25);
                border-radius:12px;padding:10px 14px;margin-bottom:12px;
                display:flex;align-items:center;gap:10px;">
                <span style="font-size:1.4rem;">🏪</span>
                <div>
                    <div style="font-size:.78rem;font-weight:800;color:var(--primary-color);">Mode propriétaire activé</div>
                    <div style="font-size:.7rem;color:#666;">Vous pouvez répondre aux commentaires en tant que <strong>${shopName}</strong></div>
                </div>
            </div>` : ''}

            <!-- Stats -->
            <div style="display:flex;justify-content:space-around;background:#f8f8f8;
                 border-radius:14px;padding:16px;margin-bottom:20px;">
                <div style="text-align:center;">
                    <div style="font-size:1.6rem;font-weight:800;color:var(--primary-color);">${likeData.count}</div>
                    <div style="font-size:.72rem;color:#888;margin-top:2px;display:flex;align-items:center;justify-content:center;gap:4px;"><svg viewBox="0 0 24 24" fill="#888" width="12" height="12"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Likes</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.6rem;font-weight:800;color:var(--primary-color);">${parentComments.length}</div>
                    <div style="font-size:.72rem;color:#888;margin-top:2px;">💬 Avis</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.6rem;font-weight:800;color:#FFC107;">${avg.toFixed(1)}</div>
                    <div style="font-size:.72rem;color:#888;margin-top:2px;">
                        ${_renderStars(avg)}
                    </div>
                </div>
            </div>

            <!-- Formulaire -->
            <div style="background:#fafafa;border-radius:14px;padding:16px;margin-bottom:20px;border:1px solid #f0f0f0;">
                <h4 style="font-size:.95rem;font-weight:700;margin-bottom:14px;">✍️ Ajouter un avis</h4>

                ${nameField}
                ${_renderStars(5, true)}

                <textarea id="odaCommentInput"
                    style="width:100%;padding:12px;border:1.5px solid #e5e5e5;border-radius:10px;
                    resize:none;font-family:inherit;font-size:.9rem;outline:none;
                    box-sizing:border-box;background:#fff;"
                    rows="3" placeholder="Partagez votre avis…"></textarea>

                <button onclick="window.submitOdaComment(${productId})"
                    style="margin-top:12px;width:100%;padding:13px;
                    background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));
                    color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;
                    font-size:.95rem;font-family:inherit;letter-spacing:.02em;">
                    Publier l'avis
                </button>
            </div>

            <!-- Liste -->
            <h4 style="font-size:.95rem;font-weight:700;margin-bottom:14px;">
                Tous les avis (${parentComments.length})
            </h4>
            ${commentsListHtml}
        </div>`;

    document.body.appendChild(modal);
    // Initialiser le picker à 5 étoiles
    setTimeout(() => window._pickStar(5), 50);
};

if (typeof window !== 'undefined') window.submitOdaComment = async function(productId) {
    const locked = _isNomLocked();
    const lock   = _getNomLock();

    // Récupérer le nom (verrouillé ou champ libre)
    let name = locked
        ? (lock?.name || '')
        : (document.getElementById('odaCommentName')?.value.trim() || '');

    const textEl   = document.getElementById('odaCommentInput');
    const ratingEl = document.getElementById('oda_rating_val');

    // Validation nom
    if (!name) {
        const field = document.getElementById('odaCommentName');
        if (field) { field.style.borderColor = '#EF4444'; field.focus(); }
        showToast('⚠️ Votre nom est obligatoire', 'error');
        return;
    }
    // Validation texte
    const text = textEl?.value.trim() || '';
    if (!text) {
        showToast('⚠️ Écrivez un commentaire', 'error');
        textEl?.focus();
        return;
    }

    const rating = parseFloat(ratingEl?.value || '5');
    const userId = window._currentUserId;

    // Verrouiller le nom si c'est la première fois
    if (!locked) _setNomLock(name);

    try {
        const btn = document.querySelector('.oda-comments-modal button[onclick*="submitOdaComment"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Publication…'; }

        const { data, error } = await supabase.from('product_comments').insert({
            product_id : productId,
            user_id    : userId,
            user_name  : name,
            comment    : text,
            rating     : rating,
        }).select().single();

        if (error) throw error;

        if (!window._productComments[productId]) window._productComments[productId] = [];
        window._productComments[productId].unshift(data);

        showToast('✅ Avis publié !', 'success');
        document.querySelector('.oda-comments-modal')?.remove();
        window.showCommentsModal(productId);
    } catch (err) {
        console.error('Erreur commentaire:', err);
        showToast('❌ Erreur lors de la publication', 'error');
        const btn = document.querySelector('.oda-comments-modal button[onclick*="submitOdaComment"]');
        if (btn) { btn.disabled = false; btn.textContent = "Publier l'avis"; }
    }
};

// ==================== RÉPONSE UTILISATEUR ====================
if (typeof window !== 'undefined') window.submitOdaReply = async function(productId, parentId) {
    const textEl = document.getElementById(`reply-text-${parentId}`);
    const text   = textEl?.value.trim() || '';
    if (!text) {
        showToast('⚠️ Écrivez une réponse', 'error');
        textEl?.focus();
        return;
    }

    // Récupérer le nom de l'utilisateur
    const locked = _isNomLocked();
    const lock   = _getNomLock();
    let name = locked
        ? (lock?.name || '')
        : (localStorage.getItem('oda_user_name') || '');
    if (!name) {
        name = prompt('Entrez votre nom pour répondre :') || 'Anonyme';
        if (!locked) _setNomLock(name);
    }

    const userId = window._currentUserId;
    const btn    = document.getElementById(`reply-btn-${parentId}`);

    try {
        if (btn) { btn.disabled = true; btn.textContent = '…'; }

        // Insertion dans Supabase avec parent_id pour lier la réponse
        const { data, error } = await supabase.from('product_comments').insert({
            product_id : productId,
            parent_id  : parentId,
            user_id    : userId,
            user_name  : name,
            comment    : text,
            contenu    : text,
            is_vendeur : false,
            rating     : 0,
        }).select().single();

        if (error) throw error;

        // Mise à jour locale immédiate
        if (!window._productComments[productId]) window._productComments[productId] = [];
        window._productComments[productId].unshift(data);

        showToast('✅ Réponse publiée !', 'success');

        // Recharger le modal pour afficher la réponse
        document.querySelector('.oda-comments-modal')?.remove();
        window.showCommentsModal(productId);

    } catch (err) {
        console.error('Erreur réponse:', err);
        showToast('❌ Erreur lors de la publication', 'error');
        if (btn) { btn.disabled = false; btn.textContent = '↩ Envoyer'; }
    }
};

// ==================== PRODUCT NAVIGATION ====================
if (typeof window !== 'undefined') window.goToProduct = async function(productId) {
    try {
        const userId = window._currentUserId || null;
        await supabase.from('product_clicks').insert({
            product_id: productId,
            user_id: userId,
            clicked_at: new Date().toISOString()
        });
    } catch (e) {
        console.warn('Click tracking failed:', e);
    }
    window.location.href = `produit?id=${productId}`;
};

// ==================== REPORT MODAL ====================
let _reportProductId = null;
let _longPressTimer = null;

if (typeof window !== 'undefined') window.openReportModal = function(productId, productName) {
    _reportProductId = productId;
    const modal = document.getElementById('reportModal');
    const nameEl = document.getElementById('reportProductName');
    if (modal) modal.classList.add('active');
    if (nameEl) nameEl.textContent = productName;
    document.querySelectorAll('input[name="reportReason"]').forEach(r => r.checked = false);
    const commentEl = document.getElementById('reportComment');
    if (commentEl) commentEl.value = '';
    document.getElementById('overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
};

if (typeof window !== 'undefined') window.closeReportModal = function() {
    const modal = document.getElementById('reportModal');
    if (modal) modal.classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = '';
    _reportProductId = null;
};

if (typeof window !== 'undefined') window.submitReport = async function() {
    const selectedReason = document.querySelector('input[name="reportReason"]:checked');
    if (!selectedReason) {
        showToast('⚠️ Veuillez sélectionner un motif de signalement', 'warning');
        return;
    }
    const comment = document.getElementById('reportComment')?.value || '';
    const submitBtn = document.getElementById('reportSubmitBtn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Envoi...'; }
    try {
        const reportText = `Raison: ${selectedReason.value}${comment ? ' | ' + comment : ''}`;
        const { data, error } = await supabase.from('product_comments').insert({
            product_id: _reportProductId,
            user_id: window._currentUserId || null,
            user_name: '🚩 Signalement',
            comment: reportText,
            rating: 1,
        });
        if (error) throw error;
        showToast('✅ Signalement envoyé avec succès', 'success');
        window.closeReportModal();
    } catch (err) {
        console.error('Erreur signalement:', err);
        showToast('❌ Erreur lors de l\'envoi du signalement: ' + (err.message || err.details || ''), 'error');
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Envoyer le signalement'; }
    }
};

function initCardReportTriggers() {
    document.querySelectorAll('.product-card, .carousel-item').forEach(card => {
        if (card._reportAttached) return;
        card._reportAttached = true;

        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const productId = card.dataset.productId;
        const productName = card.querySelector('.product-name')?.textContent || card.querySelector('.carousel-info h2')?.textContent || '';

        if (isMobile) {
            card.addEventListener('touchstart', (e) => {
                _longPressTimer = setTimeout(() => {
                    _longPressTimer = null;
                    if (productId) window.openReportModal(parseInt(productId), productName);
                }, 600);
            }, { passive: true });

            card.addEventListener('touchend', () => {
                if (_longPressTimer) {
                    clearTimeout(_longPressTimer);
                    _longPressTimer = null;
                }
            }, { passive: true });

            card.addEventListener('touchmove', () => {
                if (_longPressTimer) {
                    clearTimeout(_longPressTimer);
                    _longPressTimer = null;
                }
            }, { passive: true });

            card.addEventListener('touchcancel', () => {
                if (_longPressTimer) {
                    clearTimeout(_longPressTimer);
                    _longPressTimer = null;
                }
            }, { passive: true });
        } else {
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (productId) window.openReportModal(parseInt(productId), productName);
            });
        }
    });
}

// ==================== ATTACH INTERACTIONS ====================
function attachProductInteractions() {
    document.querySelectorAll('.oda-scroll-row').forEach(row => {
        // Éviter de réattacher plusieurs fois les événements
        if (row._dragAttached) return;
        row._dragAttached = true;

        let isDown   = false;
        let startX   = 0;
        let scrollLeft = 0;

        // ── SOURIS ─────────────────────────────────────────────────────────
        row.addEventListener('mousedown', e => {
            isDown     = true;
            startX     = e.pageX - row.offsetLeft;
            scrollLeft = row.scrollLeft;
            row.style.cursor = 'grabbing';
        });
        window.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            row.style.cursor = 'grab';
        });
        row.addEventListener('mouseleave', () => {
            if (!isDown) return;
            isDown = false;
            row.style.cursor = 'grab';
        });
        row.addEventListener('mousemove', e => {
            if (!isDown) return;
            // Pas de preventDefault ici → ne bloque pas les clics natifs
            const x    = e.pageX - row.offsetLeft;
            const walk = (x - startX) * 2;
            row.scrollLeft = scrollLeft - walk;
        });

        // ── TACTILE (mobile) ───────────────────────────────────────────────
        // Le scroll natif CSS (overflow-x:scroll + -webkit-overflow-scrolling:touch)
        // gère déjà le glissement sur mobile. On ajoute juste le feedback visuel.
        row.addEventListener('touchstart', () => {
            row.style.cursor = 'grabbing';
        }, { passive: true });
        row.addEventListener('touchend', () => {
            row.style.cursor = 'grab';
        }, { passive: true });
    });
}

// ==================== REALTIME ====================
function initRealtimeSubscription() {
    try {
        const channel = supabase.channel('marketplace_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'product_likes' }, payload => {
                const pid = payload.new?.product_id;
                if (!pid) return;
                if (!window._productLikes[pid]) window._productLikes[pid] = { count: 0, userLiked: false };
                window._productLikes[pid].count++;
                const countEl = document.querySelector(`[data-like-product="${pid}"] .like-count`);
                if (countEl) countEl.textContent = window._productLikes[pid].count;
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'product_comments' }, payload => {
                const pid = payload.new?.product_id;
                if (!pid) return;
                if (!window._productComments[pid]) window._productComments[pid] = [];
                window._productComments[pid].unshift(payload.new);
            })
            .subscribe();
    } catch (e) { console.warn('Realtime unavailable:', e); }
}

// ==================== VISIBILITY REFRESH ====================
function setupVisibilityRefresh() {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            const info = window.cacheManager?.getInfo();
            if (info && !info.valid) {
                console.log('🔄 Refresh après inactivité…');
                loadAllProductsOptimized();
            }
        }
    });
}

// ==================== PARAMÈTRES ====================
function initialiserParametres() {
    const settingsBtn   = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const settingsClose = document.getElementById('settingsCloseBtn');

    settingsBtn?.addEventListener('click', () => {
        settingsModal?.classList.add('active');
        verifierStatutNotifications();
    });
    settingsClose?.addEventListener('click', () => settingsModal?.classList.remove('active'));
    settingsModal?.addEventListener('click', e => {
        if (e.target === settingsModal) settingsModal.classList.remove('active');
    });

    document.getElementById('darkMode')?.addEventListener('change', e => {
        document.body.classList.toggle('dark-mode', e.target.checked);
        localStorage.setItem('oda_dark_mode', e.target.checked);
    });
    if (localStorage.getItem('oda_dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
        const dm = document.getElementById('darkMode');
        if (dm) dm.checked = true;
    }

    window.effacerDonnees = function() {
        if (!confirm('Êtes-vous sûr de vouloir effacer toutes vos données ?')) return;
        window.cacheManager?.clearAll();
        localStorage.removeItem('oda_favorites');
        localStorage.removeItem('oda_user_id');
        localStorage.removeItem('oda_user_name');
        window._favoriteProducts = new Set();
        updateBadges();
        showToast('✅ Données effacées', 'success');
        settingsModal?.classList.remove('active');
        setTimeout(() => window.location.reload(), 1000);
    };
}

// ==================== NOTIFICATIONS ====================
if (typeof window !== 'undefined') window.activerNotifications = async function() {
    if (!('Notification' in window)) { showToast('Notifications non supportées', 'error'); return; }
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            showToast('✅ Notifications activées !', 'success');
            verifierStatutNotifications();
        } else {
            showToast('❌ Permission refusée', 'error');
        }
    } catch (e) { showToast('Erreur notifications', 'error'); }
};

function verifierStatutNotifications() {
    const btn    = document.getElementById('enableNotifBtn');
    const text   = document.getElementById('notifStatusText');
    if (!('Notification' in window)) {
        if (text) text.textContent = 'Non supporté par ce navigateur';
        if (btn)  btn.style.display = 'none';
        return;
    }
    const status = { granted: ['✅ Activées', 'none'], denied: ['❌ Bloquées', 'none'], default: ['⏳ Non configurées', 'flex'] };
    const [msg, display] = status[Notification.permission] || status.default;
    if (text) text.textContent = msg;
    if (btn)  btn.style.display = display;
}

// ==================== FORCE RELOAD BUTTON ====================
function addForceReloadButton() {
    const existing = document.getElementById('forceReloadBtn');
    if (existing) return;
    const btn = document.createElement('button');
    btn.id    = 'forceReloadBtn';
    btn.textContent = '🔄';
    btn.title = 'Recharger les produits';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:44px;height:44px;border-radius:50%;background:var(--primary-color);color:white;border:none;font-size:1.2rem;cursor:pointer;z-index:1000;box-shadow:0 4px 12px rgba(255,107,0,.4);transition:all .3s;display:flex;align-items:center;justify-content:center;';
    btn.addEventListener('click', async () => {
        btn.style.transform = 'rotate(360deg)';
        await loadAllProductsOptimized();
        setTimeout(() => btn.style.transform = '', 500);
    });
    document.body.appendChild(btn);
}

// ==================== CSS GLOBAL ====================
const ODA_GLOBAL_CSS = `
:root {
    --primary-color   : #FF6B00;
    --primary-dark    : #E55D00;
    --secondary-color : #1A1A2E;
    --bg-primary      : #ffffff;
    --bg-secondary    : #f5f5f5;
    --text-primary    : #1a1a1a;
    --text-secondary  : #666666;
    --border-color    : #e5e5e5;
    --shadow-sm       : 0 2px 8px rgba(0,0,0,.08);
    --shadow-md       : 0 4px 16px rgba(0,0,0,.12);
    --success-color   : #10B981;
    --error-color     : #EF4444;
}
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font-family:'Inter',sans-serif;background:var(--bg-secondary);color:var(--text-primary);min-height:100vh;overflow-x:hidden;}

/* ── HEADER ── */
.main-header{position:fixed;top:0;left:0;right:0;z-index:1000;background:linear-gradient(135deg,var(--secondary-color),#16213e);padding-top:max(12px, env(safe-area-inset-top));padding-right:16px;padding-bottom:12px;padding-left:16px;transition:box-shadow .3s ease;}
.header-content{display:flex;justify-content:space-between;align-items:center;max-width:1400px;margin:0 auto;}
.menu-btn{width:36px;height:36px;background:none;border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:background .3s;}
.menu-btn:hover{background:rgba(255,255,255,.1);}
.logo{display:flex;align-items:center;gap:8px;font-size:1.3rem;font-weight:800;color:white;}
.header-icons{display:flex;gap:12px;align-items:center;}
.icon-btn{position:relative;width:40px;height:40px;background:none;border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:all .3s ease;}
.icon-btn:hover{background:rgba(255,255,255,.1);}
.icon-btn .badge{position:absolute;top:-4px;right:-4px;background:var(--primary-color);color:white;font-size:.7rem;font-weight:700;padding:2px 6px;border-radius:10px;min-width:18px;text-align:center;}
.search-container{max-width:1400px;margin:0 auto;padding:12px 0 0;}
.search-box{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.15);padding:10px 16px;border-radius:24px;border:2px solid transparent;transition:all .3s ease;}
.search-box:focus-within{background:rgba(255,255,255,.25);border-color:var(--primary-color);}
.search-box svg{color:rgba(255,255,255,.7);flex-shrink:0;}
.search-box input{flex:1;border:none;background:transparent;font-size:.95rem;color:white;outline:none;}
.search-box input::placeholder{color:rgba(255,255,255,.6);}

/* ── CAROUSEL ── */
.hero-carousel{margin-top:140px;height:400px;position:relative;overflow:hidden;background:linear-gradient(135deg,#f8f8f8,#020202);border-radius:24px;margin-left:16px;margin-right:16px;box-shadow:0 8px 24px rgba(0,0,0,.15);}
.carousel-wrapper{position:relative;width:100%;height:100%;border-radius:24px;overflow:hidden;cursor:grab;user-select:none;}
.carousel-wrapper:active{cursor:grabbing;}
.carousel-container{display:flex;transition:transform .6s cubic-bezier(.4,0,.2,1);height:100%;}
.carousel-item{min-width:100%;height:100%;position:relative;overflow:hidden;cursor:pointer;}
.carousel-image{width:100%;height:100%;object-fit:cover;object-position:center;}
.btn-report-carousel{position:absolute;top:16px;left:16px;width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;font-size:1rem;z-index:15;box-shadow:0 2px 8px rgba(0,0,0,.2);opacity:.8;}
.btn-report-carousel:hover{opacity:1;transform:scale(1.1);background:#FEE2E2;}
.carousel-overlay{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,.8),transparent);padding:40px;color:white;}
.carousel-info h2{font-size:2rem;font-weight:800;margin-bottom:8px;text-shadow:2px 2px 4px rgba(0,0,0,.5);}
.carousel-info .shop-name{font-size:1.1rem;opacity:.9;margin-bottom:4px;}
.carousel-info .product-price{font-size:1.8rem;font-weight:900;color:var(--primary-color);text-shadow:2px 2px 4px rgba(0,0,0,.8);}
.banner-actions{position:absolute;bottom:80px;left:50%;transform:translateX(-50%);display:flex;gap:20px;z-index:10;}
.banner-btn{display:flex;flex-direction:column;align-items:center;gap:8px;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,.3);border-radius:16px;padding:16px 24px;cursor:pointer;transition:all .3s ease;color:white;font-weight:600;font-size:.9rem;min-width:100px;}
.banner-btn:hover{background:rgba(255,255,255,.25);transform:translateY(-4px);box-shadow:0 8px 20px rgba(0,0,0,.3);}
.banner-icon{font-size:2rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2));display:flex;align-items:center;justify-content:center;}
.banner-icon svg{width:32px;height:32px;}
.carousel-btn{position:absolute;top:50%;transform:translateY(-50%);width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:all .3s ease;box-shadow:0 4px 12px rgba(0,0,0,.2);}
.carousel-btn:hover{background:white;transform:translateY(-50%) scale(1.1);}
.carousel-btn.prev{left:20px;}
.carousel-btn.next{right:20px;}
.carousel-dots{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:10;}
.dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.5);cursor:pointer;transition:all .3s ease;border:2px solid transparent;}
.dot:hover{background:rgba(255,255,255,.8);}
.dot.active{background:white;width:32px;border-radius:5px;}

/* ── PRODUITS ── */
.products-container{max-width:1400px;margin:0 auto;padding:calc(8px + env(safe-area-inset-top, 0px)) 20px 20px;}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.section-header h2{font-size:1.5rem;font-weight:700;color:var(--text-primary);}
.product-count{color:var(--text-secondary);font-size:.9rem;}
/* FIX: le grid ne s'applique qu'aux cartes directes, pas aux sections */
.products-grid{display:block;animation:fadeIn .5s ease;}

/* ── SPINNER ── */
.spinner{width:48px;height:48px;border:4px solid var(--border-color);border-top-color:var(--primary-color);border-radius:50%;animation:spin 1s linear infinite;}

/* ── EMPTY STATE ── */
.empty-state{text-align:center;padding:80px 20px;display:none;}
.empty-state svg{width:80px;height:80px;color:var(--text-secondary);margin-bottom:24px;}
.empty-state h3{font-size:1.5rem;font-weight:700;color:var(--text-primary);margin-bottom:12px;}
.empty-state p{color:var(--text-secondary);}

/* ── TOAST ── */
.toast-container{position:fixed;top:90px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:12px;max-width:350px;}
.toast{background:white;padding:16px 20px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);display:flex;align-items:center;gap:12px;animation:slideInRight .3s ease;border-left:4px solid var(--primary-color);}
.toast.success{border-left-color:var(--success-color);}
.toast.error{border-left-color:var(--error-color);}

/* ── SIDE MENU ── */
.side-menu{position:fixed;top:0;left:-100%;width:100%;max-width:100%;height:100vh;background:var(--bg-primary);box-shadow:0 10px 40px rgba(0,0,0,.3);z-index:2000;transition:left .3s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;overflow:hidden;padding-top:env(safe-area-inset-top);}
.side-menu.active{left:0;}
.im-row{display:flex;gap:8px;margin-bottom:6px;}
.im-row .im-wrapper{flex:1;min-width:0;}
.im-row .im-wrapper:only-child{max-width:50%;}
.menu-header{flex-shrink:0;display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid var(--border-color);background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));color:white;box-shadow:0 2px 8px rgba(255,107,0,.2);}
.menu-header h2{font-size:1.05rem;font-weight:700;display:flex;align-items:center;gap:6px;}
.btn-close{width:30px;height:30px;background:rgba(255,255,255,.2);border:none;color:white;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:all .3s ease;}
.btn-close:hover{background:rgba(255,255,255,.3);}
.btn-close:active{transform:rotate(90deg) scale(.9);}
.menu-content{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.menu-section.categories-section{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:14px;border-bottom:2px solid var(--border-color);position:relative;}
.menu-section.categories-section::-webkit-scrollbar{width:5px;}
.menu-section.categories-section::-webkit-scrollbar-track{background:var(--bg-secondary);border-radius:10px;}
.menu-section.categories-section::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--primary-color),var(--primary-dark));border-radius:10px;}
.menu-section.fixed-section{flex-shrink:0;padding:12px 14px;background:var(--bg-primary);}
.menu-section h3{font-size:.75rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;display:flex;align-items:center;gap:5px;}
.category-list{display:flex;flex-direction:column;gap:6px;scroll-behavior:smooth;}
.category-item{padding:10px 12px;background:var(--bg-secondary);border-radius:10px;font-weight:500;cursor:pointer;transition:all .3s ease;border:2px solid transparent;position:relative;display:flex;justify-content:space-between;align-items:center;font-size:.85rem;}
.category-item::before{content:'';position:absolute;left:0;top:0;height:100%;width:0;background:linear-gradient(90deg,var(--primary-color),var(--primary-dark));transition:width .3s cubic-bezier(.4,0,.2,1);border-radius:12px;z-index:-1;}
.category-item:hover::before{width:100%;}
.category-item:hover{color:white;transform:translateX(5px);}
.category-item.active{background:linear-gradient(90deg,var(--primary-color),var(--primary-dark));color:white;box-shadow:0 4px 12px rgba(255,107,0,.3);}
.category-badge{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 8px;background:rgba(255,107,0,.15);color:var(--primary-color);font-size:.72rem;font-weight:700;border-radius:12px;margin-left:auto;transition:all .3s ease;}
.category-item.active .category-badge,.category-item:hover .category-badge{background:rgba(255,255,255,.3);color:white;}
.menu-link{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-secondary);border-radius:10px;text-decoration:none;color:var(--text-primary);font-weight:500;margin-bottom:6px;transition:all .3s ease;position:relative;overflow:hidden;font-size:.85rem;}
.menu-link::before{content:'';position:absolute;left:-100%;top:0;height:100%;width:4px;background:var(--primary-color);transition:left .3s ease;}
.menu-link:hover::before{left:0;}
.menu-link:hover{background:rgba(255,107,0,.05);transform:translateX(4px);}
.scroll-indicator{position:absolute;bottom:0;left:0;right:0;height:50px;background:linear-gradient(to top,var(--bg-primary),transparent);pointer-events:none;opacity:0;transition:opacity .3s ease;display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px;}
.scroll-indicator::after{content:'⬇';font-size:1.2rem;color:var(--primary-color);animation:bounce 2s infinite;}

/* ── OVERLAY ── */
.overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:1500;opacity:0;visibility:hidden;transition:all .3s ease;}
.overlay.active{opacity:1;visibility:visible;}

/* ── REPORT MODAL ── */
.report-modal{display:none;position:fixed;inset:0;z-index:3000;align-items:center;justify-content:center;padding:20px;}
.report-modal.active{display:flex;}
.report-modal-content{background:#fff;border-radius:16px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:reportSlideIn .3s ease;}
@keyframes reportSlideIn{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}
.report-modal-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border-color);}
.report-modal-header h3{font-size:.95rem;font-weight:700;color:var(--text-primary);}
.report-close{width:32px;height:32px;background:var(--bg-secondary);border:none;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);transition:all .2s;}
.report-close:hover{background:#FEE2E2;color:#EF4444;}
.report-modal-body{padding:16px 20px;}
.report-product-name{font-size:.82rem;font-weight:600;color:var(--primary-color);background:rgba(255,107,0,.08);padding:8px 12px;border-radius:8px;margin-bottom:12px;}
.report-reasons{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
.report-reason{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-secondary);border-radius:8px;cursor:pointer;transition:all .2s;}
.report-reason:hover{background:rgba(255,107,0,.06);}
.report-reason input[type="radio"]{accent-color:var(--primary-color);width:16px;height:16px;}
.report-reason span{font-size:.82rem;font-weight:500;color:var(--text-primary);}
.report-comment{width:100%;padding:10px 12px;border:2px solid var(--border-color);border-radius:10px;font-size:.82rem;resize:none;font-family:inherit;color:var(--text-primary);transition:border-color .2s;background:var(--bg-secondary);}
.report-comment:focus{outline:none;border-color:var(--primary-color);background:#fff;}
.report-modal-footer{display:flex;gap:10px;padding:12px 20px;border-top:1px solid var(--border-color);}
.report-btn-cancel,.report-btn-submit{flex:1;padding:10px 16px;border:none;border-radius:10px;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;}
.report-btn-cancel{background:var(--bg-secondary);color:var(--text-secondary);}
.report-btn-cancel:hover{background:#E5E7EB;}
.report-btn-submit{background:var(--primary-color);color:#fff;}
.report-btn-submit:hover{background:var(--primary-dark);}
.report-btn-submit:disabled{opacity:.5;cursor:not-allowed;}

/* ── ODA MODALS (About/Contact/Help) ── */
.oda-modal{display:none;position:fixed;inset:0;z-index:5000;align-items:center;justify-content:center;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);cursor:pointer;}
.modal-content{position:relative;background:linear-gradient(135deg,#f0f7ff 0%,#e8f4fd 100%);border-radius:24px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;z-index:1;}
.modal-content.modal-contact{background:linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%);}
.modal-content.modal-help{background:linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%);}
.modal-close{position:absolute;top:16px;right:16px;width:36px;height:36px;background:rgba(0,0,0,.1);border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#333;transition:all .2s;z-index:2;}
.modal-close:hover{background:rgba(0,0,0,.2);transform:scale(1.1);}
.modal-header{padding:40px 24px 24px;text-align:center;}
.modal-icon-wrapper{margin-bottom:16px;}
.modal-main-icon{font-size:4rem;}
.modal-title{font-size:2rem;font-weight:800;color:#1a1a1a;margin-bottom:8px;}
.modal-body{padding:0 24px 24px;}
.info-card,.help-card{background:rgba(255,255,255,.7);backdrop-filter:blur(10px);border-radius:16px;padding:24px;margin-bottom:16px;display:flex;gap:16px;align-items:flex-start;box-shadow:0 4px 16px rgba(0,0,0,.08);}
.info-icon,.help-icon{font-size:2.5rem;flex-shrink:0;}
.info-content h3,.help-content h3{font-size:1.1rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;}
.info-content p,.help-content p{color:#4a5568;line-height:1.6;margin:0 0 8px;}
.contact-details{background:rgba(255,255,255,.7);backdrop-filter:blur(10px);border-radius:16px;padding:24px;margin-bottom:16px;}
.contact-details h3{font-size:1.1rem;font-weight:700;margin-bottom:16px;color:#1a1a1a;}
.contact-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
@media(max-width:480px){.contact-grid{grid-template-columns:1fr;}}
.contact-item{display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,.8);border-radius:12px;transition:all .3s ease;}
.contact-item:hover{background:rgba(255,255,255,.9);transform:translateX(8px);}
.contact-icon{font-size:1.8rem;flex-shrink:0;}
.contact-item strong{display:block;font-size:.85rem;color:#6b7280;margin-bottom:4px;}
.contact-item p,.contact-item a{color:#1a1a1a;font-weight:600;margin:0;text-decoration:none;}
.alert-box{background:rgba(16,185,129,.1);border-left:4px solid #10b981;border-radius:8px;padding:16px;margin-top:16px;display:flex;gap:12px;align-items:flex-start;}
.alert-box p{margin:0;color:#047857;font-weight:500;}
.tip-box{background:rgba(245,158,11,.1);border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin-top:16px;display:flex;gap:12px;align-items:flex-start;}
.tip-box p{margin:0;color:#92400e;font-weight:500;}
.vendor-section{background:linear-gradient(135deg,rgba(79,172,254,.1),rgba(0,242,254,.1));border-radius:16px;padding:24px;margin-top:24px;text-align:center;}
.vendor-section h3{font-size:1.3rem;font-weight:700;margin-bottom:12px;color:#1a1a1a;}
.download-btn{display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,#4facfe,#00f2fe);color:white;padding:18px 28px;border-radius:16px;text-decoration:none;margin:24px auto;max-width:400px;box-shadow:0 8px 25px rgba(79,172,254,.4);transition:all .3s cubic-bezier(.4,0,.2,1);animation:pulseGlow 2s ease-in-out infinite;}
.download-btn:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 12px 35px rgba(79,172,254,.5);}
.benefits-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.benefit-item{background:rgba(255,255,255,.8);padding:12px 16px;border-radius:12px;text-align:center;font-weight:600;color:#1a1a1a;box-shadow:0 2px 8px rgba(0,0,0,.05);}
.faq-section{background:rgba(255,255,255,.6);border-radius:16px;padding:24px;}
.faq-section h3{font-size:1.2rem;font-weight:700;margin-bottom:20px;color:#1a1a1a;}
.faq-item{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(0,0,0,.1);}
.faq-item:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none;}
.faq-item strong{display:block;font-size:1rem;color:#1a1a1a;margin-bottom:8px;}
.faq-item p{color:#4a5568;line-height:1.6;margin:0;}
.faq-item a{color:#4facfe;text-decoration:none;font-weight:600;}
.benefits-list{list-style:none;padding:0;margin:8px 0;}
.benefits-list li{padding:4px 0;color:#4a5568;}

/* ── SETTINGS MODAL ── */
.settings-modal{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:all .3s ease;}
.settings-modal.active{opacity:1;visibility:visible;}
.settings-modal-content{background:var(--bg-primary);border-radius:20px;width:90%;max-width:500px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);}
.settings-modal-content::-webkit-scrollbar{width:6px;}
.settings-modal-content::-webkit-scrollbar-track{background:var(--bg-secondary);}
.settings-modal-content::-webkit-scrollbar-thumb{background:var(--primary-color);border-radius:10px;}
.settings-header{display:flex;justify-content:space-between;align-items:center;padding:24px;background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));color:white;border-radius:20px 20px 0 0;}
.settings-header h2{font-size:1.3rem;font-weight:700;}
.settings-body{padding:24px 20px;}
.settings-section{margin-bottom:32px;padding-bottom:28px;border-bottom:1px solid var(--border-color);}
.settings-section:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none;}
.settings-section .section-header{display:flex;align-items:center;gap:8px;margin-bottom:16px;}
.section-icon{font-size:1.2rem;}
.settings-section .section-header h3{font-size:1rem;font-weight:700;color:var(--text-primary);margin:0;}
.settings-toggle{display:flex;justify-content:space-between;align-items:center;padding:16px;background:var(--bg-secondary);border-radius:12px;margin-bottom:8px;cursor:pointer;transition:all .3s ease;}
.settings-toggle:hover{background:#f0f0f0;}
.toggle-info{display:flex;flex-direction:column;gap:4px;}
.toggle-title{font-weight:600;font-size:.95rem;color:var(--text-primary);}
.toggle-desc{font-size:.8rem;color:var(--text-secondary);}
.switch{position:relative;display:inline-block;width:52px;height:28px;}
.switch input{opacity:0;width:0;height:0;}
.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#ccc;transition:.3s;border-radius:28px;}
.slider::before{position:absolute;content:'';height:22px;width:22px;left:3px;bottom:3px;background:white;transition:.3s;border-radius:50%;}
input:checked+.slider{background:var(--primary-color);}
input:checked+.slider::before{transform:translateX(24px);}
.form-group{margin-bottom:16px;}
.form-label{display:block;font-size:.85rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.03em;}
.form-input{width:100%;padding:12px 16px;background:var(--bg-secondary);border:2px solid var(--border-color);border-radius:12px;font-size:.95rem;color:var(--text-primary);font-family:inherit;transition:all .3s ease;}
.form-input:focus{outline:none;border-color:var(--primary-color);background:white;}
.form-input:read-only{cursor:not-allowed;opacity:.7;}
.btn-edit{display:flex;align-items:center;gap:6px;padding:10px 16px;background:var(--primary-color);color:white;border:none;border-radius:10px;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .3s ease;}
.btn-edit:hover{background:var(--primary-dark);transform:translateY(-2px);}
.btn-primary{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 20px;background:var(--primary-color);color:white;border:none;border-radius:12px;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .3s ease;}
.btn-primary:hover{background:var(--primary-dark);transform:translateY(-2px);}
.btn-danger{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 20px;background:#FEE2E2;color:#EF4444;border:none;border-radius:12px;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .3s ease;width:100%;}
.btn-danger:hover{background:#FECACA;transform:translateY(-2px);}

/* ★ MODIFIÉ — ODA VENDOR MODAL (modal transparente, texte noir gras, ombre forte) ── */
.oda-vendor-btn{border:2px solid rgba(255,255,255,.3)!important;border-radius:10px!important;transition:all .3s!important;}
.oda-vendor-btn:hover{border-color:var(--primary-color)!important;background:rgba(255,107,0,.15)!important;}
.oda-vendor-btn.connected{border-color:#10b981!important;background:rgba(16,185,129,.15)!important;box-shadow:0 0 0 2px rgba(16,185,129,.3)!important;}
.oda-modal-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:flex-start;justify-content:flex-end;padding-top:70px;padding-right:16px;pointer-events:none;opacity:0;transition:opacity .2s ease;}
.oda-modal-overlay.active{pointer-events:all;opacity:1;}
.oda-modal-overlay .backdrop{position:fixed;inset:0;background:rgba(0,0,0,.25);backdrop-filter:blur(3px);}
.oda-modal-box{
    position:relative;z-index:1;
    /* Transparent comme demandé : fond très légèrement teinté, verre dépoli fort */
    background:rgba(255,255,255,0.18);
    backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
    border:1px solid rgba(255,255,255,0.35);
    border-radius:24px;padding:28px 24px;width:300px;
    box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 1px 0 rgba(255,255,255,0.5);
    transform:translateY(-10px) scale(.96);
    transition:all .25s cubic-bezier(.34,1.4,.64,1);
    text-align:center;color:#fff;
}
.oda-modal-overlay.active .oda-modal-box{transform:translateY(0) scale(1);}
.oda-modal-logo{width:60px;height:60px;border-radius:14px;object-fit:cover;margin:0 auto 14px;display:block;box-shadow:0 4px 14px rgba(0,0,0,0.2);}
.oda-modal-title{font-size:1.05rem;font-weight:800;color:#fff;margin-bottom:4px;text-shadow:0 1px 4px rgba(0,0,0,.3);}
.oda-modal-sub{font-size:.8rem;color:rgba(255,255,255,.85);margin-bottom:18px;line-height:1.4;font-weight:600;}
.oda-form-input{
    width:100%;padding:11px 14px;
    background:rgba(255,255,255,0.15);
    border:1.5px solid rgba(255,255,255,0.35);
    border-radius:10px;font-size:.88rem;
    color:#fff;font-family:'Inter',sans-serif;
    outline:none;transition:all .2s;margin-bottom:10px;
    font-weight:600;text-align:left;
}
.oda-form-input::placeholder{color:rgba(255,255,255,0.55);font-weight:400;}
.oda-form-input:focus{border-color:rgba(255,255,255,0.8);background:rgba(255,255,255,0.22);box-shadow:0 0 0 3px rgba(255,255,255,0.15);}
.oda-form-error{
    background:rgba(239,68,68,.25);border:1.5px solid rgba(239,68,68,.6);
    color:#ffdddd;padding:8px 12px;border-radius:8px;font-size:.78rem;
    margin-bottom:10px;display:none;text-align:left;font-weight:700;
}
.oda-form-error.show{display:block;}
.oda-sandbox-btn{
    width:100%;padding:12px 16px;
    background:linear-gradient(135deg,#FF6B00,#e55d00);
    color:white!important;border:none;border-radius:12px;
    font-size:.9rem;font-weight:800;cursor:pointer;
    font-family:'Inter',sans-serif;transition:all .2s;
    box-shadow:0 4px 14px rgba(255,107,0,.35);margin-bottom:8px;
}
.oda-sandbox-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(255,107,0,.5);}
.oda-sandbox-btn:disabled{opacity:.65;cursor:not-allowed;}
.oda-logout-link{font-size:.75rem;color:rgba(255,255,255,.7);cursor:pointer;text-decoration:underline;background:none;border:none;font-family:'Inter',sans-serif;transition:color .2s;font-weight:600;}
.oda-logout-link:hover{color:#fff;}
.oda-divider{display:flex;align-items:center;gap:8px;margin:14px 0;color:rgba(255,255,255,0.5);font-size:.72rem;font-weight:700;}
.oda-divider::before,.oda-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.2);}
.oda-no-account{font-size:.75rem;color:rgba(255,255,255,.75);line-height:1.5;font-weight:600;}
.oda-no-account a{color:#FFB347;font-weight:700;text-decoration:underline;cursor:pointer;}
.oda-user-avatar{
    width:52px;height:52px;
    background:linear-gradient(135deg,#FF6B00,#e55d00);
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    font-size:1.4rem;font-weight:800;color:white;
    margin:0 auto 10px;box-shadow:0 4px 14px rgba(255,107,0,.4);
}
/* ── Animation de succès de connexion ── */
@keyframes odaSuccessPop{0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.15) rotate(3deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes odaSuccessFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes odaCheckmark{0%{stroke-dashoffset:50}100%{stroke-dashoffset:0}}
.oda-success-overlay{
    position:absolute;inset:0;border-radius:20px;
    background:rgba(255,255,255,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    z-index:20;animation:odaSuccessFadeIn .25s ease;
    gap:6px;padding:20px;
}
.oda-success-icon{
    width:72px;height:72px;
    background:linear-gradient(135deg,#10b981,#059669);
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    font-size:2.2rem;
    animation:odaSuccessPop .55s cubic-bezier(.34,1.4,.64,1) both;
    box-shadow:0 8px 28px rgba(16,185,129,.45);margin-bottom:8px;
}
/* ── Champ mot de passe avec bouton œil ── */
.oda-pw-wrapper{position:relative;margin-bottom:10px;}
.oda-pw-wrapper .oda-form-input{margin-bottom:0;padding-right:44px;}
.oda-pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);
    background:none;border:none;cursor:pointer;color:rgba(255,255,255,.7);
    padding:4px;display:flex;align-items:center;justify-content:center;
    transition:color .2s;border-radius:6px;}
.oda-pw-toggle:hover{color:#fff;}
.oda-success-title{font-size:1.05rem;font-weight:800;color:#111;text-align:center;}
.oda-success-sub{font-size:.82rem;color:#444;font-weight:600;text-align:center;}
/* ── Icône personnage (connecté) ── */
.oda-connected-icon{
    display:flex;align-items:center;justify-content:center;
    width:26px;height:26px;
}

/* ── KEYFRAMES ── */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideInRight{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes slideOutRight{to{opacity:0;transform:translateX(100%)}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes bounceIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,107,0,.7)}70%{box-shadow:0 0 0 20px rgba(255,107,0,0)}100%{box-shadow:0 0 0 0 rgba(255,107,0,0)}}
@keyframes pulseGlow{0%,100%{box-shadow:0 8px 25px rgba(79,172,254,.4)}50%{box-shadow:0 8px 35px rgba(79,172,254,.6)}}
@keyframes modalSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes odaBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.pulse-animation{animation:pulse-animation 2s ease-in-out infinite;}
@keyframes pulse-animation{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
.shake-animation:hover{animation:shake-animation .5s ease;}
@keyframes shake-animation{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}

/* ── RESPONSIVE ── */
@media(max-width:768px){
    .main-header{padding:10px 12px;}
    .logo{font-size:1.1rem;}
    .icon-btn{width:36px;height:36px;}
    .hero-carousel{height:350px;margin-top:130px;border-radius:16px;margin-left:12px;margin-right:12px;}
    .banner-actions{bottom:60px;gap:12px;}
    .banner-btn{padding:12px 16px;min-width:80px;font-size:.8rem;}
    .btn-report-card{opacity:.85;}
    .product-card:hover .btn-report-card{opacity:.85;}
    /* FIX: pas de restriction de colonne sur mobile */
    .products-grid{display:block;}
    .settings-modal{padding:0;align-items:flex-end;}
    .settings-modal-content{max-height:95vh;border-radius:20px 20px 0 0;animation:modalSlideUp .3s ease;}
    .settings-header{border-radius:20px 20px 0 0;padding:20px;}
    .contact-grid{grid-template-columns:1fr;}
    .benefits-grid{grid-template-columns:1fr;}
    .oda-modal-overlay{padding-top:60px;padding-right:8px;}
    .oda-modal-box{width:calc(100vw - 16px);max-width:320px;}
}
@media(max-width:480px){
    .hero-carousel{height:300px;margin-top:120px;}
    .banner-actions{flex-direction:row;gap:8px;bottom:50px;}
    .banner-btn{padding:10px 12px;min-width:70px;font-size:.75rem;}
}

/* ── DARK MODE ── */
body.dark-mode{background:#1a1a1a;color:#ffffff;}
body.dark-mode .settings-modal-content,body.dark-mode .settings-body{background:#2d2d2d;}
body.dark-mode .settings-toggle{background:#3a3a3a;}
body.dark-mode .settings-toggle:hover{background:#4a4a4a;}
body.dark-mode .form-input{background:#3a3a3a;border-color:#4a4a4a;color:white;}
body.dark-mode .toggle-title{color:white;}
body.dark-mode .toggle-desc{color:#aaa;}

/* ── SKELETON SHIMMER ── */
@keyframes shimmer{0%{background-position:-700px 0}100%{background-position:700px 0}}
.oda-skeleton-section{margin-bottom:32px;}
.oda-skeleton-section-title{height:18px;width:140px;border-radius:8px;margin-bottom:14px;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:700px 100%;animation:shimmer 1.4s infinite linear;}
.oda-skeleton-row{display:flex;gap:12px;overflow:hidden;padding-bottom:4px;}
.oda-skeleton-card{flex-shrink:0;min-width:160px;max-width:160px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #f0f0f0;}
.oda-sk-img{width:100%;height:140px;background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:700px 100%;animation:shimmer 1.4s infinite linear;}
.oda-sk-body{padding:10px;display:flex;flex-direction:column;gap:7px;}
.oda-sk-badge{height:12px;width:60px;border-radius:6px;background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:700px 100%;animation:shimmer 1.4s infinite linear;}
.oda-sk-title{height:14px;width:90%;border-radius:6px;background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:700px 100%;animation:shimmer 1.4s infinite linear;}
.oda-sk-title.short{width:60%;}
.oda-sk-price{height:16px;width:70px;border-radius:6px;margin-top:4px;background:linear-gradient(90deg,#ffe5d0 25%,#ffd0b0 50%,#ffe5d0 75%);background-size:700px 100%;animation:shimmer 1.4s infinite linear;}
@keyframes cardReveal{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.product-card.entering{animation:cardReveal .35s cubic-bezier(.22,1,.36,1) both;}
body.dark-mode .oda-sk-img,body.dark-mode .oda-sk-badge,body.dark-mode .oda-sk-title,body.dark-mode .oda-skeleton-section-title{background:linear-gradient(90deg,#2a2a2a 25%,#333 50%,#2a2a2a 75%);background-size:700px 100%;}
body.dark-mode .oda-skeleton-card{background:#222;border-color:#333;}
body.dark-mode .oda-sk-price{background:linear-gradient(90deg,#3a2010 25%,#4a2e18 50%,#3a2010 75%);background-size:700px 100%;}
`;

// ==================== COMPOSANT REACT ====================
export default function OdaAchatsPage() {

    // ── ★ NOUVEAU : État du modal sandbox ODA ──
    const [odaModalOpen,    setOdaModalOpen]    = useState(false);
    const [odaConnected,    setOdaConnected]    = useState(false);
    const [odaUser,         setOdaUser]         = useState(null);
    const [odaEmail,        setOdaEmail]        = useState('');
    const [odaPassword,     setOdaPassword]     = useState('');
    const [odaLoading,      setOdaLoading]      = useState(false);
    const [odaError,        setOdaError]        = useState('');
    const [odaShowSuccess,  setOdaShowSuccess]  = useState(false);
    const [odaShowPwd,     setOdaShowPwd]     = useState(false);

    // ── ★ NOUVEAU : CGU (Conditions d'Utilisation) ──
    const [cguAccepted,    setCguAccepted]    = useState(false);
    const [showCguModal,   setShowCguModal]   = useState(false);

    // ── ★ NOUVEAU : Vérifier session ODA existante ──
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                const u = session.user;
                setOdaConnected(true);
                setOdaUser({
                    name   : u.user_metadata?.name || u.email?.split('@')[0] || 'Vendeur',
                    email  : u.email || '',
                    avatar : (u.user_metadata?.name || u.email || '?').charAt(0).toUpperCase(),
                });
            }
        });
    }, []);

    // ── ★ NOUVEAU : Vérifier si CGU déjà acceptées ──
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const accepted = localStorage.getItem('oda_cgu_accepted') === 'true';
        setCguAccepted(accepted);
        if (!accepted) setShowCguModal(true);
    }, []);

    // ── ★ NOUVEAU : Accepter les CGU ──
    function handleAcceptCGU() {
        localStorage.setItem('oda_cgu_accepted', 'true');
        setCguAccepted(true);
        setShowCguModal(false);
        showToast('✅ Conditions acceptées ! Bienvenue sur ODA Market', 'success');
    }

    // ── ★ NOUVEAU : Connexion ODA Supabase ──
    async function handleOdaLogin(e) {
        e.preventDefault();
        setOdaLoading(true);
        setOdaError('');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email    : odaEmail.trim(),
                password : odaPassword,
            });
            if (error) {
                setOdaError(
                    error.message.includes('Invalid login credentials')
                        ? 'Email ou mot de passe incorrect.'
                        : error.message
                );
                return;
            }
            const u = data.user;
            // Vérifier que l'utilisateur a une boutique
            const { data: boutique } = await supabase
                .from('parametres_boutique').select('user_id').eq('user_id', u.id).single();
            if (!boutique) {
                await supabase.auth.signOut();
                setOdaError('Aucune boutique associée à ce compte vendeur.');
                return;
            }
            const userInfo = {
                name   : u.user_metadata?.name || u.email?.split('@')[0] || 'Vendeur',
                email  : u.email || '',
                avatar : (u.user_metadata?.name || u.email || '?').charAt(0).toUpperCase(),
            };
            setOdaUser(userInfo);
            setOdaShowSuccess(true);
            // Après l'animation de succès → passer en mode connecté
            setTimeout(() => {
                setOdaShowSuccess(false);
                setOdaConnected(true);
            }, 2200);
        } catch (err) {
            setOdaError('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setOdaLoading(false);
        }
    }

    // ── ★ NOUVEAU : Déconnexion ODA ──
    async function handleOdaLogout() {
        await supabase.auth.signOut();
        setOdaConnected(false);
        setOdaUser(null);
        setOdaEmail('');
        setOdaPassword('');
        setOdaModalOpen(false);
    }

    // ── Initialisation globale (inchangée) ──
    useEffect(() => {
        if (typeof window === 'undefined') return;

        window._allProducts      = [];
        window._favoriteProducts = new Set();
        window._productLikes     = {};
        window._productComments  = {};
        window._currentSlide     = 0;
        window._carouselInterval = null;
        window._popularProducts  = [];
        window._currentUserId    = getUserId();

        window.cacheManager  = new CacheManager();
        window.improvedMenu  = new ImprovedMenu();

        console.log('🚀 ODA MARKETPLACE — démarrage');

        if (!document.getElementById('oda-global-css')) {
            const styleEl = document.createElement('style');
            styleEl.id    = 'oda-global-css';
            styleEl.textContent = ODA_GLOBAL_CSS;
            document.head.appendChild(styleEl);
        }

        if (!document.getElementById('oda-font-link')) {
            const link = document.createElement('link');
            link.id    = 'oda-font-link';
            link.rel   = 'stylesheet';
            link.href  = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
            document.head.appendChild(link);
        }

        loadFavorites();
        updateBadges();
        showSkeletons(8);

        loadAllProductsOptimized().then(() => {
            setupCategoryFiltering();
            initSideMenu();
            initCarouselControls();
            initCardReportTriggers();
            initSearch();
            initScrollBehavior();
            initialiserParametres();
            addForceReloadButton();
            initRealtimeSubscription();

            if (window.matchMedia('(display-mode: standalone)').matches) {
                document.body.classList.add('pwa-mode');
            }
            console.log('✅ ODA prêt !');
        });

        setupVisibilityRefresh();

        return () => {
            if (window._carouselInterval) clearInterval(window._carouselInterval);
        };
    }, []);
    return (
        <>
            {/* ── HEADER ── */}
            <header className="main-header">
                <div className="header-content">
                    <button className="menu-btn" id="menuBtn" aria-label="Menu">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h18M3 6h18M3 18h18"/>
                        </svg>
                    </button>
                    <div className="logo">🛍️ Odamarket</div>
                    <div className="header-icons">
                        <button className="icon-btn" onClick={() => window.location.href='/favorie'} aria-label="Favoris">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span className="badge" id="favBadge" style={{display:'none'}}>0</span>
                        </button>
                        <button className="icon-btn" id="settingsBtn" title="Paramètres" aria-label="Paramètres">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>

                        {/* ★ MODIFIÉ — Bouton Vendeur ODA avec icône personnage si connecté */}
                        <button
                            className={`icon-btn oda-vendor-btn${odaConnected ? ' connected' : ''}`}
                            id="vendorBtn"
                            title={odaConnected ? `Connecté — ${odaUser?.name}` : 'Accès Espace Vendeur / Sandbox'}
                            aria-label="Espace Vendeur ODA"
                            onClick={() => setOdaModalOpen(o => !o)}
                        >
                            {odaConnected ? (
                                /* Icône personnage quand connecté */
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{color:'#10b981'}}>
                                    <circle cx="12" cy="8" r="4"/>
                                    <path d="M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7"/>
                                </svg>
                            ) : (
                                <img
                                    src="/images/oda-seller.svg"
                                    alt="ODA"
                                    width="26" height="26"
                                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                                />
                            )}
                            {/* Fallback si l'image ODA ne charge pas */}
                            {!odaConnected && (
                                <span style={{display:'none',width:'26px',height:'26px',borderRadius:'6px',background:'linear-gradient(135deg,#FF6B00,#e55d00)',alignItems:'center',justifyContent:'center',fontSize:'1rem',fontWeight:800,color:'white'}}>O</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="search-container">
                    <div className="search-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input type="text" placeholder="Rechercher des produits, boutiques..." id="searchInput" />
                    </div>
                </div>

                {/* ★ MODIFIÉ — Modal ODA Sandbox (transparent, ombre, texte noir gras) */}
                <div className={`oda-modal-overlay${odaModalOpen ? ' active' : ''}`} id="odaModalOverlay">
                    <div className="backdrop" onClick={() => setOdaModalOpen(false)}></div>
                    <div className="oda-modal-box" id="odaModalBox">

                        {/* Overlay animation de succès */}
                        {odaShowSuccess && (
                            <div className="oda-success-overlay">
                                <div className="oda-success-icon">✅</div>
                                <div className="oda-success-title">Connexion réussie !</div>
                                <div className="oda-success-sub">Bienvenue {odaUser?.name} 👋</div>
                            </div>
                        )}

                        {odaConnected ? (
                            /* ── État connecté ── */
                            <>
                                <div className="oda-user-avatar">{odaUser?.avatar}</div>
                                <div className="oda-modal-title">{odaUser?.name}</div>
                                <div className="oda-modal-sub" style={{marginBottom:'20px'}}>{odaUser?.email}</div>
                                <button
                                    className="oda-sandbox-btn"
                                    onClick={() => { window.location.href = '/sandbox'; }}
                                >
                                    📊 Accéder à la Sandbox
                                </button>
                                <div className="oda-divider">ou</div>
                                <button className="oda-logout-link" onClick={handleOdaLogout}>
                                    Se déconnecter
                                </button>
                            </>
                        ) : (
                            /* ── Formulaire de connexion ── */
                            <>
                                <img
                                    src="/images/oda-seller.svg"
                                    alt="ODA"
                                    width="60" height="60"
                                    className="oda-modal-logo"
                                    onError={e => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                {/* Fallback logo */}
                                <div style={{display:'none',width:'60px',height:'60px',borderRadius:'14px',background:'linear-gradient(135deg,#FF6B00,#e55d00)',alignItems:'center',justifyContent:'center',fontSize:'1.6rem',fontWeight:800,color:'white',margin:'0 auto 14px',boxShadow:'0 4px 14px rgba(255,107,0,.3)'}}>O</div>

                                <div className="oda-modal-title">Espace Vendeur ODA</div>
                                <div className="oda-modal-sub">Connectez-vous pour accéder à la sandbox</div>

                                <form onSubmit={handleOdaLogin} style={{width:'100%'}}>
                                    <input
                                        type="email"
                                        className="oda-form-input"
                                        placeholder="Adresse email"
                                        value={odaEmail}
                                        onChange={e => { setOdaEmail(e.target.value); setOdaError(''); }}
                                        required
                                        autoComplete="email"
                                    />
                                    <div className="oda-pw-wrapper">
                                        <input
                                            type={odaShowPwd ? 'text' : 'password'}
                                            className="oda-form-input"
                                            placeholder="Mot de passe"
                                            value={odaPassword}
                                            onChange={e => { setOdaPassword(e.target.value); setOdaError(''); }}
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="oda-pw-toggle"
                                            onClick={() => setOdaShowPwd(v => !v)}
                                            aria-label={odaShowPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                        >
                                            {odaShowPwd ? (
                                                /* Œil barré */
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                                </svg>
                                            ) : (
                                                /* Œil ouvert */
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {odaError && (
                                        <div className="oda-form-error show">{odaError}</div>
                                    )}
                                    <button
                                        type="submit"
                                        className="oda-sandbox-btn"
                                        disabled={odaLoading}
                                    >
                                        {odaLoading ? '⏳ Connexion en cours…' : '🔐 Se connecter'}
                                    </button>
                                </form>

                                <div className="oda-divider">vendeur ?</div>
                                <div className="oda-no-account">
                                    Pas encore de compte ?{' '}
                                    <a href="https://oda-seller.vercel.app" target="_blank" rel="noreferrer">
                                        Créer ma boutique
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── MENU LATÉRAL ── */}
            <div className="side-menu" id="sideMenu">
                <div className="menu-header">
                    <h2><span>📂</span><span>Menu</span></h2>
                    <button className="btn-close" id="closeMenuBtn" aria-label="Fermer le menu">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
                <div className="menu-content">
                    <div className="menu-section categories-section" id="categoriesSection">
                        <h3><span>🏷️</span><span>Catégories</span></h3>
                        <div className="category-list" id="categoryList">
                            <div className="category-item active" data-category="Tous">
                                <span>Tous les produits</span>
                                <span className="category-badge">0</span>
                            </div>
                        </div>
                        <div className="scroll-indicator"></div>
                    </div>
                    <div className="menu-section fixed-section">
                        <h3><span>🧭</span><span>Navigation</span></h3>
                        <a href="/achats" className="menu-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/>
                                <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Accueil
                        </a>
                        <a href="/favorie" className="menu-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Mes Favoris
                        </a>
                        <a href="/boutiques" className="menu-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" strokeWidth="2"/>
                                <path d="M3 9l1.5-5h15L21 9M9 13v4m6-4v4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Boutiques
                        </a>
                    </div>
                </div>
            </div>

            {/* ── MODAL À PROPOS ── */}
            <div id="aboutModal" className="oda-modal">
                <div className="modal-overlay" onClick={() => window.closeModal('aboutModal')}></div>
                <div className="modal-content modal-about">
                    <button className="modal-close" onClick={() => window.closeModal('aboutModal')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div className="modal-header">
                        <div className="modal-icon-wrapper pulse-animation"><span className="modal-main-icon">🏪</span></div>
                        <h2 className="modal-title">À propos de ODA Market</h2>
                    </div>
                    <div className="modal-body">
                        <div className="info-card slide-in">
                            <div className="info-icon">🌍</div>
                            <div className="info-content">
                                <h3>D&apos;où viennent nos produits ?</h3>
                                <p>ODA Market collabore avec des <strong>vendeurs locaux</strong> passionnés du Cameroun 🇨🇲 et d&apos;ailleurs ! Chaque produit provient de <strong>boutiques vérifiées</strong> qui s&apos;engagent à offrir qualité et authenticité ✨</p>
                            </div>
                        </div>
                        <div className="info-card slide-in" style={{animationDelay:'0.1s'}}>
                            <div className="info-icon">⚙️</div>
                            <div className="info-content">
                                <h3>Comment ça fonctionne ?</h3>
                                <p>Notre marketplace connecte <strong>acheteurs et vendeurs</strong> de manière simple et sécurisée 🔐. Parcourez les produits, contactez les vendeurs et effectuez vos achats en toute confiance 🛒</p>
                            </div>
                        </div>
                        <div className="info-card slide-in" style={{animationDelay:'0.2s'}}>
                            <div className="info-icon">🚀</div>
                            <div className="info-content">
                                <h3>Notre mission</h3>
                                <p>Rendre le commerce local <strong>accessible à tous</strong> grâce à la technologie 💡. Nous croyons que chaque vendeur mérite d&apos;avoir sa boutique en ligne 🌐</p>
                            </div>
                        </div>
                        <div className="info-card slide-in" style={{animationDelay:'0.3s'}}>
                            <div className="info-icon">👨‍💻</div>
                            <div className="info-content">
                                <h3>Développé par</h3>
                                <p>Kitio Guemeve Yann Jordy — Développeur fullstack passionné du Cameroun</p>
                                <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'12px',background:'rgba(255,255,255,0.5)',padding:'12px',borderRadius:'12px',cursor:'pointer'}}>
                                    <p style={{margin:0,fontSize:'16px',color:'#333',fontWeight:500}}>yann jordy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MODAL CONTACT ── */}
            <div id="contactModal" className="oda-modal">
                <div className="modal-overlay" onClick={() => window.closeModal('contactModal')}></div>
                <div className="modal-content modal-contact">
                    <button className="modal-close" onClick={() => window.closeModal('contactModal')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div className="modal-header">
                        <div className="modal-icon-wrapper"><span className="modal-main-icon">📬</span></div>
                        <h2 className="modal-title">Contactez-nous</h2>
                    </div>
                    <div className="modal-body">
                        <div className="contact-details slide-in" style={{animationDelay:'0.3s'}}>
                            <h3>📬 Informations de contact</h3>
                            <div className="contact-grid">
                                <div className="contact-item">
                                    <span className="contact-icon">👤</span>
                                    <div><strong>Nom complet</strong><p>Kitio Guemeve Yann Jordy</p></div>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-icon">📧</span>
                                    <div><strong>Email</strong><a href="mailto:kityann@example.com">kityann@example.com</a></div>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-icon">📱</span>
                                    <div><strong>WhatsApp</strong><a href="https://wa.me/237698111771" target="_blank" rel="noreferrer">+237 698 111 771</a></div>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-icon">💼</span>
                                    <div><strong>Portfolio</strong><a href="https://kitio-yann-port-folio.vercel.app" target="_blank" rel="noreferrer">kitio-yann-port-folio.vercel.app</a></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MODAL AIDE ── */}
            <div id="helpModal" className="oda-modal">
                <div className="modal-overlay" onClick={() => window.closeModal('helpModal')}></div>
                <div className="modal-content modal-help">
                    <button className="modal-close" onClick={() => window.closeModal('helpModal')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div className="modal-header">
                        <div className="modal-icon-wrapper shake-animation"><span className="modal-main-icon">🆘</span></div>
                        <h2 className="modal-title">Centre d&apos;aide</h2>
                    </div>
                    <div className="modal-body">
                        <div className="help-card slide-in">
                            <div className="help-icon">⏳</div>
                            <div className="help-content">
                                <h3>Paiement en ligne</h3>
                                <p><strong>⚠️ Important :</strong> Lors d&apos;un paiement direct en ligne, veuillez <strong>patienter</strong> quelques instants ⏱️ pendant le traitement de votre transaction. Ne fermez pas la page ! 🚫</p>
                                <div className="alert-box">
                                    <span className="alert-icon">✅</span>
                                    <p>Vous recevrez une confirmation par email et SMS une fois le paiement validé 📧📱</p>
                                </div>
                            </div>
                        </div>
                        <div className="help-card slide-in" style={{animationDelay:'0.1s'}}>
                            <div className="help-icon">🔐</div>
                            <div className="help-content">
                                <h3>Cache Boutique - Identifiant Unique</h3>
                                <p>Chaque boutique possède un <strong>identifiant unique</strong> 🎯 qui garantit :</p>
                                <ul className="benefits-list">
                                    <li>✨ L&apos;authenticité du vendeur</li>
                                    <li>🔒 La sécurité de vos achats</li>
                                    <li>📊 Le suivi de vos commandes</li>
                                    <li>⭐ Les avis vérifiés</li>
                                </ul>
                                <div className="tip-box">
                                    <span className="tip-icon">💡</span>
                                    <p><strong>Astuce :</strong> Vérifiez toujours l&apos;identifiant de la boutique avant d&apos;acheter !</p>
                                </div>
                            </div>
                        </div>
                        <div className="vendor-section slide-in" style={{animationDelay:'0.2s'}}>
                            <h3>🏪 Vous êtes vendeur ?</h3>
                            <p>Rejoignez ODA Market et développez votre business ! 📈</p>
                            <p>Téléchargez <strong>ODA Seller</strong> - l&apos;application dédiée aux vendeurs 🚀</p>
                            <a href="https://oda-seller.vercel.app" target="_blank" rel="noreferrer" className="download-btn">
                                <span className="btn-icon-left">📲</span>
                                <span className="btn-text-main">
                                    <strong>Télécharger ODA Seller</strong>
                                    <small>Gérez votre boutique facilement</small>
                                </span>
                                <span className="btn-icon-right">→</span>
                            </a>
                            <div className="vendor-benefits">
                                <h4>Pourquoi ODA Seller ?</h4>
                                <div className="benefits-grid">
                                    <div className="benefit-item">📊 Gestion simple</div>
                                    <div className="benefit-item">💰 Paiements rapides</div>
                                    <div className="benefit-item">📱 Application mobile</div>
                                    <div className="benefit-item">🎯 Plus de clients</div>
                                </div>
                            </div>
                        </div>
                        <div className="faq-section slide-in" style={{animationDelay:'0.3s'}}>
                            <h3>❓ Questions fréquentes</h3>
                            <div className="faq-item">
                                <strong>Comment suivre ma commande ?</strong>
                                <p>Connectez-vous à votre compte et consultez l&apos;onglet &quot;Mes commandes&quot; 📦</p>
                            </div>
                            <div className="faq-item">
                                <strong>Puis-je retourner un produit ?</strong>
                                <p>Contactez le vendeur dans les 48h pour discuter d&apos;un éventuel retour 🔄</p>
                            </div>
                            <div className="faq-item">
                                <strong>Besoin d&apos;aide supplémentaire ?</strong>
                                <p>Contactez notre support via WhatsApp : <a href="https://wa.me/237698111771">+237 698 111 771</a> 💬</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── OVERLAY ── */}
            <div className="overlay" id="overlay"></div>

            {/* ── REPORT MODAL ── */}
            <div className="report-modal" id="reportModal">
                <div className="report-modal-content">
                    <div className="report-modal-header">
                        <h3>🚩 Signaler ce produit</h3>
                        <button className="report-close" onClick={() => window.closeReportModal()}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div className="report-modal-body">
                        <p className="report-product-name" id="reportProductName"></p>
                        <div className="report-reasons">
                            <label className="report-reason">
                                <input type="radio" name="reportReason" value="contenu_inapproprie" />
                                <span>Contenu inapproprié</span>
                            </label>
                            <label className="report-reason">
                                <input type="radio" name="reportReason" value="arnaque" />
                                <span>Arnaque / Fraude</span>
                            </label>
                            <label className="report-reason">
                                <input type="radio" name="reportReason" value="produit_interdit" />
                                <span>Produit interdit</span>
                            </label>
                            <label className="report-reason">
                                <input type="radio" name="reportReason" value="fausse_description" />
                                <span>Fausse description</span>
                            </label>
                            <label className="report-reason">
                                <input type="radio" name="reportReason" value="autre" />
                                <span>Autre</span>
                            </label>
                        </div>
                        <textarea className="report-comment" id="reportComment" placeholder="Décrivez le problème (optionnel)..." rows="3"></textarea>
                    </div>
                    <div className="report-modal-footer">
                        <button className="report-btn-cancel" onClick={() => window.closeReportModal()}>Annuler</button>
                        <button className="report-btn-submit" id="reportSubmitBtn" onClick={() => window.submitReport()}>Envoyer le signalement</button>
                    </div>
                </div>
            </div>

            {/* ── CARROUSEL ── */}
            <section className="hero-carousel" id="heroCarousel">
                <div className="carousel-wrapper">
                    <button className="carousel-btn prev" id="btnPrev" aria-label="Précédent">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <div className="carousel-container" id="carouselContainer">
                        {/* Généré dynamiquement */}
                    </div>
                    <button className="carousel-btn next" id="btnNext" aria-label="Suivant">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </button>
                </div>
                <div className="banner-actions">
                    <button className="banner-btn" onClick={() => window.scrollToProducts()}>
                        <div className="banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"/><path d="M4 8h16v4H4z"/><path d="M12 6V2"/><path d="M8 6c0-2 4-2 4 0"/><path d="M16 6c0-2-4-2-4 0"/></svg></div>
                        <span>produits</span>
                    </button>
                    <button className="banner-btn" onClick={() => window.location.href='/favorie'}>
                        <div className="banner-icon"><svg viewBox="0 0 24 24" fill="#EF4444" width="24" height="24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
                        <span>favoris</span>
                    </button>
                    <button className="banner-btn" onClick={() => window.location.href='/boutiques'}>
                        <div className="banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4"/><path d="M8 14h8"/><path d="M10 14v4"/><path d="M14 14v4"/></svg></div>
                        <span>boutique</span>
                    </button>
                    <button className="banner-btn" onClick={() => window.location.href='/services'}>
                        <div className="banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2z"/><path d="M20 18v-7a8 8 0 00-16 0v7"/><path d="M9 11h6"/></svg></div>
                        <span>services</span>
                    </button>
                </div>
                <div className="carousel-dots" id="carouselDots"></div>
            </section>

            {/* ── GRILLE PRODUITS ── */}
            <main className="products-container">
                <div className="section-header">
                    <h2>Tous les produits</h2>
                    <span className="product-count" id="productCount">0 produits</span>
                </div>
                <div className="products-grid" id="productsGrid">
                    {/* Généré dynamiquement */}
                </div>
                <div className="empty-state" id="emptyState" style={{display:'none'}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <h3>Aucun produit trouvé</h3>
                    <p>Revenez plus tard pour découvrir nos nouveaux produits</p>
                </div>
            </main>

            {/* ── TOASTS ── */}
            <div className="toast-container" id="toastContainer"></div>

            {/* ── MODAL PARAMÈTRES ── */}
            <div className="settings-modal" id="settingsModal">
                <div className="settings-modal-content">
                    <div className="settings-header">
                        <h2>⚙️ Paramètres</h2>
                        <button className="btn-close" id="settingsCloseBtn" aria-label="Fermer">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <div className="settings-body">
                        {/* Animation félicitations */}
                        <div id="odaCelebration" style={{position:'fixed',inset:0,zIndex:999999,display:'none',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',flexDirection:'column',gap:'16px'}}>
                            <div id="celebrationContent" style={{textAlign:'center'}}>
                                <div style={{fontSize:'4rem',animation:'bounceIn 0.6s ease'}}>🎉</div>
                                <div style={{fontSize:'1.4rem',fontWeight:800,color:'white',marginTop:'12px'}} id="celebrationName"></div>
                                <div style={{fontSize:'0.9rem',color:'rgba(255,255,255,0.8)',marginTop:'6px'}}>Bienvenue dans votre espace vendeur !</div>
                                <div style={{marginTop:'20px',width:'60px',height:'60px',borderRadius:'50%',background:'linear-gradient(135deg,#FF6B00,#e55d00)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem',margin:'20px auto 0',animation:'pulse 1.5s infinite'}}>🏪</div>
                            </div>
                            <div id="celebrationConfetti" style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden'}}></div>
                        </div>

                        {/* Notifications */}
                        <div className="settings-section">
                            <div className="section-header">
                                <span className="section-icon">🔔</span>
                                <h3>Notifications Push</h3>
                            </div>
                            <div id="notificationStatus" style={{background:'var(--bg-secondary)',padding:'16px',borderRadius:'12px',marginBottom:'16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                <div>
                                    <div style={{fontWeight:600,marginBottom:'4px'}}>Statut des notifications</div>
                                    <div id="notifStatusText" style={{fontSize:'0.9rem',color:'var(--text-secondary)'}}>Chargement...</div>
                                </div>
                                <button className="btn-primary" id="enableNotifBtn" onClick={() => window.activerNotifications?.()}>Activer</button>
                            </div>
                            {[
                                {id:'notifNewProducts', title:'Nouveaux produits',     desc:'Être notifié des nouveaux produits'},
                                {id:'notifPromotions',  title:'Promotions',            desc:'Recevoir les offres spéciales'},
                                {id:'notifComments',    title:'Nouveaux commentaires', desc:'Sur les produits que vous suivez'},
                                {id:'notifPopular',     title:'Produits populaires',   desc:'Vos favoris qui deviennent populaires'},
                            ].map(n => (
                                <div className="settings-toggle" key={n.id}>
                                    <div className="toggle-info">
                                        <div className="toggle-title">{n.title}</div>
                                        <div className="toggle-desc">{n.desc}</div>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" id={n.id} defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/* Préférences */}
                        <div className="settings-section">
                            <div className="section-header">
                                <span className="section-icon">🎨</span>
                                <h3>Préférences</h3>
                            </div>
                            <div className="settings-toggle">
                                <div className="toggle-info">
                                    <div className="toggle-title">Mode sombre</div>
                                    <div className="toggle-desc">Activer le thème sombre</div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" id="darkMode" />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-toggle">
                                <div className="toggle-info">
                                    <div className="toggle-title">Sons</div>
                                    <div className="toggle-desc">Activer les sons de l&apos;application</div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" id="appSounds" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>

                        {/* Données */}
                        <div className="settings-section">
                            <div className="section-header">
                                <span className="section-icon">🗑️</span>
                                <h3>Données</h3>
                            </div>
                            <button className="btn-danger" onClick={() => window.effacerDonnees()}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                                Effacer toutes mes données
                            </button>
                        </div>
                    </div>s
                </div>
            </div>
        </>
    );
}