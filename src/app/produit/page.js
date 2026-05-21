'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PaymentWarningModal from '@/components/ui/PaymentWarningModal';

// ==================== CONFIG SUPABASE ====================
const SUPABASE_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== UTILITAIRES ====================

function getUserId() {
  if (typeof window === 'undefined') return 'ssr_user';
  let uid = localStorage.getItem('oda_user_id');
  if (!uid) {
    uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('oda_user_id', uid);
  }
  return uid;
}

function getUserName() {
  if (typeof window === 'undefined') return 'Anonyme';
  let name = localStorage.getItem('oda_user_name');
  if (!name) {
    name = window.prompt('Entrez votre nom pour commenter:') || 'Anonyme';
    localStorage.setItem('oda_user_name', name);
  }
  return name;
}

function formatPrice(price, devise = 'FCFA') {
  return `${Number(price).toLocaleString('fr-FR')} ${devise}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  return date.toLocaleDateString('fr-FR');
}

// Vérifie si une chaîne est une URL valide (ex : lien de paiement Stripe)
function isURL(str) {
  if (!str || typeof str !== 'string') return false;
  try { return Boolean(new URL(str)); } catch { return false; }
}

// Config par défaut identique à DEFAULT_PARAMS de parametre.js
function getDefaultShopConfig() {
  return {
    general:     { nom: 'Ma Boutique', description: '', telephone: '', email: '', adresse: '' },
    identifiant: { slug: '', disponible: false, auto: false },
    paiement: {
      carte:  { actif: false, cle: '', confirme: false },
      mobile: {
        actif: false, confirme: false,
        mtn:    { actif: false, nomCompte: '', numero: '', confirme: false },
        orange: { actif: false, nomCompte: '', numero: '', confirme: false },
      },
      cash:   { actif: false, confirme: false },
      devise: 'FCFA',
    },
    livraison: {
      fraisDouala: 1000, fraisAutres: 2500,
      delai: '2-5 jours ouvrables',
      gratuit: false, montantMin: 50000,
      zonesPersonnalisees: [],
    },
    apparence:     { couleurPrimaire: '#FF6B00', couleurSecondaire: '#1A1A1A', logo: '', favicon: '', police: 'Inter' },
    notifications: { commandes: true, stock: true, clients: false, rapports: true },
  };
}

// ==================== PARSING IMAGES ====================

function estURLValide(str) {
  if (!str || typeof str !== 'string') return false;
  const t = str.trim();
  return t.startsWith('http') || t.startsWith('/') || t.startsWith('data:');
}
function filtrerURLsValides(arr) {
  return arr.filter(i => i && typeof i === 'string').map(i => i.trim())
    .filter(i => i !== '' && i !== 'null' && i !== 'undefined').filter(estURLValide);
}
function parseJSONArray(jsonStr) {
  try {
    let p = JSON.parse(jsonStr);
    if (typeof p === 'string') { try { p = JSON.parse(p); } catch (_) {} }
    return Array.isArray(p) ? filtrerURLsValides(p) : [];
  } catch { return []; }
}
function parseJSONObject(jsonStr) {
  try {
    const p = JSON.parse(jsonStr);
    if (typeof p === 'object' && p !== null)
      return Object.values(p).filter(v => typeof v === 'string').filter(estURLValide);
    return [];
  } catch { return []; }
}
function parseImages(data) {
  if (Array.isArray(data)) return filtrerURLsValides(data);
  if (typeof data === 'string') {
    const t = data.trim();
    if (!t || t === 'null' || t === 'undefined') return [];
    if (t.startsWith('[')) return parseJSONArray(t);
    if (t.startsWith('{')) return parseJSONObject(t);
    if (estURLValide(t)) return [t];
    if (t.includes(',')) return t.split(',').map(u => u.trim()).filter(estURLValide);
    return [];
  }
  if (typeof data === 'object' && data !== null)
    return Object.values(data).filter(v => typeof v === 'string').filter(estURLValide);
  return [];
}
function buildAllImages(product) {
  const raw = product.main_image ? String(product.main_image).trim() : '';
  const mainUrl = estURLValide(raw) ? raw : null;
  let images = mainUrl ? [mainUrl] : [];
  for (const src of [product.additional_images, product.description_images, product.images]) {
    if (src) images.push(...parseImages(src));
  }
  if (mainUrl) images = [mainUrl, ...images.slice(1).filter(img => img !== mainUrl)];
  if (images.length > 1) {
    const p = images[0];
    images = [p, ...[...new Set(images.slice(1))].filter(img => img !== p)];
  }
  if (images.length === 0) images.push('https://via.placeholder.com/600x600?text=Aucune+Image');
  return images;
}

// ==================== GÉNÉRATEUR NUMÉRO DE COMMANDE ====================
// Compatible avec le format utilisé dans commandes.js
function genererNumeroCommande(count = 0) {
  const date = new Date();
  const yy   = String(date.getFullYear()).slice(-2);
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const seq  = String(count + 1).padStart(4, '0');
  return `CMD-${yy}${mm}-${seq}`;
}


function genererLienUSSD(operateur, numeroDest, montant) {
  // Nettoyer le numéro : retirer espaces, tirets, +237, 00237
  let num = String(numeroDest).replace(/[\s\-().]/g, '');
  if (num.startsWith('+237')) num = num.slice(4);
  if (num.startsWith('00237')) num = num.slice(5);
  if (num.startsWith('+')) num = num.slice(1);

  const mont = Math.round(Number(montant));

  if (operateur === 'mtn') {
    // *126*NUMERO*MONTANT# → le réseau MTN demandera le code PIN
    return `tel:*126*${num}*${mont}%23`;
  }
  if (operateur === 'orange') {
    // #150*NUMERO*MONTANT# → le réseau Orange demandera le code PIN
    return `tel:%23150*${num}*${mont}%23`;
  }
  return null;
}

// ==================== CSS ====================
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  :root{--primary-color:#FF6B00;--primary-dark:#E55D00;--secondary-color:#1A1A1A;--bg-primary:#FFFFFF;--bg-secondary:#F8F9FA;--text-primary:#1A1A1A;--text-secondary:#6B7280;--border-color:#E5E7EB;--success-color:#10B981;--error-color:#EF4444;--shadow-sm:0 1px 2px rgba(0,0,0,.05);--shadow-md:0 4px 6px rgba(0,0,0,.1);--shadow-lg:0 10px 15px rgba(0,0,0,.1);--radius-sm:8px;--radius-md:12px;--radius-lg:16px;--transition:.3s ease;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg-secondary);color:var(--text-primary);line-height:1.6;overflow-x:hidden;}
  #loader{position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-primary);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;}
  .loader-spinner{width:50px;height:50px;border:4px solid var(--border-color);border-top-color:var(--primary-color);border-radius:50%;animation:spin 1s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .header{position:fixed;top:0;left:0;right:0;background:var(--bg-primary);box-shadow:var(--shadow-md);z-index:1000;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;}
  .btn-back,.btn-share{width:44px;height:44px;border-radius:var(--radius-md);border:none;background:var(--bg-secondary);color:var(--text-primary);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:var(--transition);}
  .btn-back:active,.btn-share:active{transform:scale(.95);background:var(--border-color);}
  .header-title{font-size:1.1rem;font-weight:700;color:var(--text-primary);flex:1;text-align:center;padding:0 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .carousel-container{margin-top:72px;background:var(--bg-primary);padding-bottom:20px;}
  .main-image-wrapper{position:relative;width:100%;padding-top:100%;background:var(--bg-secondary);overflow:hidden;cursor:zoom-in;}
  .main-image{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .3s ease;}
  .main-image.zoom{transform:scale(1.5);cursor:zoom-out;}
  .image-counter{position:absolute;bottom:16px;right:16px;background:rgba(0,0,0,.7);color:white;padding:6px 12px;border-radius:20px;font-size:.85rem;font-weight:600;backdrop-filter:blur(10px);z-index:10;}
  .thumbnails-container{display:flex;gap:8px;padding:16px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .thumbnails-container::-webkit-scrollbar{display:none;}
  .thumbnail{flex-shrink:0;width:70px;height:70px;border-radius:var(--radius-sm);border:3px solid transparent;cursor:pointer;transition:all .3s ease;object-fit:cover;}
  .thumbnail.active{border-color:var(--primary-color);transform:scale(1.05);}
  .product-content{padding:20px 16px 130px;}
  .product-header{margin-bottom:24px;}
  .product-name{font-size:1.5rem;font-weight:800;margin-bottom:8px;color:var(--text-primary);line-height:1.3;}
  .product-header-actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:8px;}
  .btn-report-product{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(239,68,68,.08);color:#EF4444;border:none;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s;}
  .btn-report-product:hover{background:rgba(239,68,68,.15);transform:scale(1.05);}
  .product-category{display:inline-block;padding:6px 12px;background:linear-gradient(135deg,rgba(255,107,0,.1),rgba(255,107,0,.05));color:var(--primary-color);border-radius:20px;font-size:.85rem;font-weight:600;margin-bottom:16px;}
  .price-section{background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));padding:24px;border-radius:var(--radius-lg);margin-bottom:24px;color:white;}
   .product-price{font-size:2rem;font-weight:900;margin-bottom:8px;}
   .badge-promo{display:inline-block;padding:4px 10px;background:#dc2626;color:white;border-radius:20px;font-size:.8rem;font-weight:700;letter-spacing:.5px;}
   .stock-info{display:flex;align-items:center;gap:8px;font-size:.9rem;opacity:.95;}
  .stock-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:rgba(255,255,255,.2);border-radius:12px;font-weight:600;}
  .description-section{background:var(--bg-primary);padding:24px;border-radius:var(--radius-lg);margin-bottom:24px;box-shadow:var(--shadow-sm);}
  .section-title{font-size:1.1rem;font-weight:700;margin-bottom:12px;color:var(--text-primary);display:flex;align-items:center;gap:8px;}
  .product-description{color:var(--text-secondary);line-height:1.7;font-size:.95rem;}
  .engagement-section{background:var(--bg-primary);padding:20px 24px;border-radius:var(--radius-lg);margin-bottom:24px;box-shadow:var(--shadow-sm);}
  .engagement-stats{display:flex;gap:20px;align-items:center;margin-bottom:16px;}
  .stat-item{display:flex;flex-direction:column;align-items:center;gap:4px;}
  .stat-value{font-size:1.3rem;font-weight:700;color:var(--text-primary);}
  .stat-label{font-size:.85rem;color:var(--text-secondary);}
  .engagement-buttons{display:flex;gap:12px;}
  .btn-like,.btn-comments{flex:1;padding:12px 16px;border:2px solid var(--border-color);background:var(--bg-secondary);border-radius:var(--radius-md);font-weight:600;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center;gap:8px;}
  .btn-like:active,.btn-comments:active{transform:scale(.95);}
  .btn-like.liked{background:#FFE5E5;border-color:var(--error-color);color:var(--error-color);}
  .btn-like svg,.btn-fav-floating svg{width:20px;height:20px;}
  .btn-like.liked svg{fill:#EF4444;stroke:#EF4444;}
  .comments-section{background:var(--bg-primary);padding:24px;border-radius:var(--radius-lg);margin-bottom:24px;box-shadow:var(--shadow-sm);}
  .comment-form{margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--border-color);}
  .rating-input{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
  .rating-input input[type="radio"]{display:none;}
  .rating-input label{cursor:pointer;transition:transform .2s ease;font-size:1.5rem;}
  .rating-input label:hover{transform:scale(1.1);}
  .comment-form textarea{width:100%;padding:12px;border:2px solid var(--border-color);border-radius:var(--radius-md);font-family:inherit;font-size:.95rem;resize:vertical;min-height:80px;margin-bottom:12px;transition:border-color .3s ease;}
  .comment-form textarea:focus{outline:none;border-color:var(--primary-color);}
  .btn-submit-comment{width:100%;padding:12px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius-md);font-weight:600;cursor:pointer;transition:all .3s ease;}
  .btn-submit-comment:hover{background:var(--primary-dark);}
  .comments-list{display:flex;flex-direction:column;gap:16px;}
  .comment-item{padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);}
  .comment-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
  .comment-user{display:flex;align-items:center;gap:8px;}
  .user-avatar{width:36px;height:36px;border-radius:50%;background:var(--primary-color);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;}
  .user-name{font-weight:600;color:var(--text-primary);}
  .comment-rating{font-size:.9rem;}
  .comment-text{margin:8px 0;line-height:1.6;color:var(--text-primary);}
  .comment-date{font-size:.8rem;color:var(--text-secondary);}
  .empty-comments{text-align:center;padding:40px 20px;color:var(--text-secondary);}
  .shop-section{background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));padding:24px;border-radius:var(--radius-lg);margin-bottom:24px;color:white;}
  .shop-info{display:flex;align-items:center;gap:16px;margin-bottom:16px;}
  .shop-icon{width:60px;height:60px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;overflow:hidden;}
  .shop-icon img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
  .shop-details h3{font-size:1.2rem;margin-bottom:4px;}
  .shop-details p{opacity:.9;font-size:.9rem;}
  .btn-visit-shop{width:100%;padding:14px;background:white;color:var(--primary-color);border:none;border-radius:var(--radius-md);font-weight:700;cursor:pointer;transition:all .3s ease;}
  .btn-visit-shop:active{transform:translateY(-2px);}
  .action-buttons{position:fixed;bottom:0;left:0;right:0;background:var(--bg-primary);padding:16px;box-shadow:0 -4px 12px rgba(0,0,0,.1);z-index:999;}
  .btn-primary,.btn-secondary{width:100%;padding:16px;border:none;border-radius:var(--radius-md);font-weight:700;font-size:1rem;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px;}
  .btn-primary{background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));color:white;box-shadow:0 4px 12px rgba(255,107,0,.3);}
  .btn-primary:active{transform:translateY(-2px);}
  .btn-secondary{background:#25D366;color:white;}
  .btn-secondary:active{transform:translateY(-2px);}
  .notification{position:fixed;top:80px;left:50%;transform:translateX(-50%) translateY(-100px);background:white;padding:16px 24px;border-radius:var(--radius-md);box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:12px;z-index:10000;opacity:0;transition:all .3s ease;pointer-events:none;}
  .notification.show{transform:translateX(-50%) translateY(0);opacity:1;pointer-events:auto;}
  .notification.success{border-left:4px solid var(--success-color);}
  .notification.error{border-left:4px solid var(--error-color);}
  .notification.info{border-left:4px solid var(--primary-color);}
  @media(max-width:768px){.product-name{font-size:1.3rem;}.product-price{font-size:1.7rem;}.stat-value{font-size:1.1rem;}}

  /* ════ MODAL SIGNALEMENT ════ */
  .report-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:flex-end;justify-content:center;}
  .report-overlay.active{display:flex;}
  .report-sheet{background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:0 0 24px;animation:cmd-su .35s cubic-bezier(.25,.46,.45,.94);}
  .report-header{padding:16px 20px;border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;}
  .report-header h3{font-size:1rem;font-weight:700;color:var(--text-primary);}
  .report-close{width:32px;height:32px;border:none;background:var(--bg-secondary);border-radius:8px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);}
  .report-close:hover{background:#FEE2E2;color:#EF4444;}
  .report-body{padding:16px 20px;}
  .report-product-label{font-size:.85rem;font-weight:600;color:var(--primary-color);background:rgba(255,107,0,.08);padding:8px 12px;border-radius:8px;margin-bottom:12px;}
  .report-reasons{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
  .report-reason{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-secondary);border-radius:8px;cursor:pointer;transition:all .2s;}
  .report-reason:hover{background:rgba(255,107,0,.06);}
  .report-reason input[type="radio"]{accent-color:var(--primary-color);width:16px;height:16px;}
  .report-reason span{font-size:.85rem;font-weight:500;color:var(--text-primary);}
  .report-comment{width:100%;padding:10px 12px;border:2px solid var(--border-color);border-radius:10px;font-size:.85rem;resize:none;font-family:inherit;color:var(--text-primary);transition:border-color .2s;background:var(--bg-secondary);}
  .report-comment:focus{outline:none;border-color:var(--primary-color);background:#fff;}
  .report-footer{display:flex;gap:10px;padding:0 20px;}
  .report-btn-cancel,.report-btn-submit{flex:1;padding:11px 16px;border:none;border-radius:10px;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;}
  .report-btn-cancel{background:var(--bg-secondary);color:var(--text-secondary);}
  .report-btn-cancel:hover{background:#E5E7EB;}
  .report-btn-submit{background:var(--primary-color);color:#fff;}
  .report-btn-submit:hover{background:var(--primary-dark);}
  .report-btn-submit:disabled{opacity:.5;cursor:not-allowed;}
  .btn-fav-floating{position:absolute;top:16px;right:16px;z-index:10;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;box-shadow:0 2px 8px rgba(0,0,0,.15);}
  .btn-fav-floating:hover{transform:scale(1.1);}
  .btn-fav-floating.active{background:rgba(239,68,68,.9);box-shadow:0 2px 12px rgba(239,68,68,.4);}
  .btn-fav-floating.active svg{fill:#fff;stroke:#fff;}

  /* ════ MODAL COMMANDE ════ */
  .cmd-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2000;display:flex;align-items:flex-end;justify-content:center;animation:cmd-fi .25s ease;}
  @keyframes cmd-fi{from{opacity:0}to{opacity:1}}
  .cmd-modal{background:var(--bg-primary);border-radius:20px 20px 0 0;width:100%;max-width:540px;max-height:94vh;overflow-y:auto;padding:0 0 40px;animation:cmd-su .35s cubic-bezier(.25,.46,.45,.94);}
  @keyframes cmd-su{from{transform:translateY(100%)}to{transform:translateY(0)}}
  .cmd-header{position:sticky;top:0;z-index:10;background:var(--bg-primary);padding:12px 20px 14px;border-bottom:1px solid var(--border-color);display:flex;align-items:center;gap:12px;}
  .cmd-handle{width:36px;height:4px;background:var(--border-color);border-radius:2px;margin:0 auto;}
  .cmd-title{font-size:1.1rem;font-weight:800;color:var(--text-primary);flex:1;display:flex;align-items:center;gap:8px;}
  .cmd-close{width:32px;height:32px;border-radius:50%;border:none;background:var(--bg-secondary);color:var(--text-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;flex-shrink:0;}
  .cmd-body{padding:18px 20px;}
  .cmd-recap{display:flex;align-items:center;gap:14px;padding:14px;background:var(--bg-secondary);border-radius:var(--radius-md);margin-bottom:6px;}
  .cmd-recap-img{width:64px;height:64px;border-radius:var(--radius-sm);object-fit:cover;flex-shrink:0;}
  .cmd-recap-name{font-size:.93rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;}
  .cmd-recap-price{font-size:1.05rem;font-weight:900;color:var(--primary-color);}
  .cmd-shop-tag{display:inline-flex;align-items:center;gap:4px;margin-top:5px;font-size:.75rem;color:var(--text-secondary);}
  .cmd-shop-tag a{color:var(--primary-color);font-weight:600;text-decoration:none;}
  .cmd-section-label{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary);margin:20px 0 10px;display:flex;align-items:center;gap:6px;}
  .cmd-section-label::after{content:'';flex:1;height:1px;background:var(--border-color);}
  .cmd-field{margin-bottom:13px;}
  .cmd-label{font-size:.86rem;font-weight:600;color:var(--text-primary);margin-bottom:6px;display:block;}
  .cmd-input{width:100%;padding:13px 14px;border:2px solid var(--border-color);border-radius:var(--radius-md);font-size:.95rem;font-family:inherit;color:var(--text-primary);background:var(--bg-primary);transition:border-color .25s,box-shadow .25s;-webkit-appearance:none;}
  .cmd-input:focus{outline:none;border-color:var(--primary-color);box-shadow:0 0 0 3px rgba(255,107,0,.1);}
  .cmd-input.err{border-color:var(--error-color);}
  .cmd-err{font-size:.78rem;color:var(--error-color);margin-top:4px;display:block;}
  .cmd-methods{display:flex;flex-direction:column;gap:10px;}
  .cmd-method{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:2px solid var(--border-color);border-radius:var(--radius-md);cursor:pointer;transition:all .2s;background:var(--bg-primary);}
  .cmd-method:hover{border-color:var(--primary-color);}
  .cmd-method.sel{border-color:var(--primary-color);background:rgba(255,107,0,.05);}
  .cmd-method input[type="radio"]{display:none;}
  .cmd-radio{width:20px;height:20px;border-radius:50%;border:2px solid var(--border-color);flex-shrink:0;margin-top:3px;position:relative;transition:border-color .2s;}
  .cmd-method.sel .cmd-radio{border-color:var(--primary-color);}
  .cmd-method.sel .cmd-radio::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:var(--primary-color);}
  .cmd-micon{font-size:1.6rem;flex-shrink:0;}
  .cmd-mbody{flex:1;}
  .cmd-mtitle{font-size:.95rem;font-weight:700;color:var(--text-primary);}
  .cmd-mdesc{font-size:.81rem;color:var(--text-secondary);margin-top:2px;}
  .cmd-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:#DCFCE7;color:#16A34A;border-radius:20px;font-size:.7rem;font-weight:700;margin-top:4px;}
  .cmd-pay-box{margin-top:12px;padding:16px;background:linear-gradient(135deg,#FFF7ED,#FFF3E0);border:1.5px solid rgba(255,107,0,.2);border-radius:var(--radius-md);animation:cmd-sd .25s ease;}
  @keyframes cmd-sd{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
  .cmd-pay-title{font-size:.75rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;}
  .cmd-mm-card{display:flex;align-items:center;gap:12px;padding:12px 14px;background:white;border-radius:10px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,.06);}
  .cmd-mm-num{font-size:1.3rem;font-weight:900;color:var(--primary-color);letter-spacing:.04em;}
  .cmd-mm-name{font-size:.82rem;color:var(--text-secondary);}
  .cmd-mm-name strong{color:var(--text-primary);}
  .cmd-stripe-link{display:flex;align-items:center;gap:10px;padding:12px 14px;background:white;border-radius:10px;border:1px solid #E5E7EB;text-decoration:none;color:var(--text-primary);font-weight:600;font-size:.9rem;transition:all .2s;margin-bottom:8px;}
  .cmd-stripe-link:hover{border-color:var(--primary-color);box-shadow:0 2px 8px rgba(255,107,0,.12);}
  .cmd-instr{font-size:.82rem;color:var(--text-secondary);line-height:1.55;margin-top:6px;}
  .cmd-instr strong{color:var(--text-primary);}
  .cmd-client-num{margin-top:12px;animation:cmd-sd .25s ease;}
  .cmd-liv-box{background:var(--bg-secondary);border-radius:var(--radius-md);padding:14px 16px;margin-top:8px;}
  .cmd-liv-row{display:flex;justify-content:space-between;align-items:center;font-size:.88rem;padding:5px 0;}
  .cmd-liv-lbl{color:var(--text-secondary);}
  .cmd-liv-val{font-weight:700;color:var(--text-primary);}
  .cmd-liv-val.free{color:var(--success-color);}
  .cmd-liv-div{height:1px;background:var(--border-color);margin:8px 0;}
  .cmd-liv-total{display:flex;justify-content:space-between;align-items:center;padding-top:8px;}
  .cmd-liv-total-lbl{font-size:.93rem;font-weight:700;color:var(--text-primary);}
  .cmd-liv-total-val{font-size:1.2rem;font-weight:900;color:var(--primary-color);}
  .cmd-no-method{text-align:center;padding:24px;background:var(--bg-secondary);border-radius:var(--radius-md);color:var(--text-secondary);font-size:.9rem;}
  .cmd-btn-ok{width:100%;padding:16px;margin-top:22px;background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));color:white;border:none;border-radius:var(--radius-md);font-weight:700;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 4px 12px rgba(255,107,0,.3);transition:all .3s;}
  .cmd-btn-ok:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(255,107,0,.35);}
  .cmd-btn-ok:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none;}
  .cmd-btn-cancel{width:100%;padding:13px;margin-top:10px;background:var(--bg-secondary);color:var(--text-secondary);border:none;border-radius:var(--radius-md);font-weight:600;font-size:.95rem;cursor:pointer;transition:background .2s;}
  .cmd-btn-cancel:hover{background:var(--border-color);}
  .cmd-spinner{width:18px;height:18px;border:3px solid rgba(255,255,255,.4);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;}

  /* ════ ALERTE MOBILE MONEY ════ */
  .cmd-mobile-alert{
    display:flex;align-items:flex-start;gap:10px;
    padding:13px 14px;margin-top:12px;
    background:linear-gradient(135deg,#FFF3E0,#FFF8F0);
    border:1.5px solid #FF9800;border-radius:var(--radius-md);
    animation:cmd-sd .3s ease;
  }
  .cmd-mobile-alert-icon{font-size:1.3rem;flex-shrink:0;margin-top:1px;}
  .cmd-mobile-alert-body{flex:1;}
  .cmd-mobile-alert-title{font-size:.84rem;font-weight:700;color:#E65100;margin-bottom:3px;}
  .cmd-mobile-alert-text{font-size:.79rem;color:#7B4400;line-height:1.5;}
  .cmd-mobile-alert-text strong{color:#E65100;}

  /* ════ BOUTON USSD ════ */
  .cmd-ussd-wrap{margin-top:14px;}
  .cmd-ussd-btn{
    display:flex;align-items:center;justify-content:center;gap:10px;
    width:100%;padding:14px 16px;
    background:linear-gradient(135deg,#1A237E,#283593);
    color:white;border:none;border-radius:var(--radius-md);
    font-weight:700;font-size:.95rem;font-family:inherit;
    cursor:pointer;text-decoration:none;
    box-shadow:0 4px 14px rgba(26,35,126,.35);
    transition:all .3s ease;
  }
  .cmd-ussd-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(26,35,126,.45);}
  .cmd-ussd-btn:active{transform:scale(.97);}
  .cmd-ussd-mtn{background:linear-gradient(135deg,#FFCA28,#F9A825);color:#1A1A1A;box-shadow:0 4px 14px rgba(255,202,40,.4);}
  .cmd-ussd-mtn:hover{box-shadow:0 6px 20px rgba(255,202,40,.55);}
  .cmd-ussd-orange{background:linear-gradient(135deg,#FF6D00,#E65100);box-shadow:0 4px 14px rgba(255,109,0,.4);}
  .cmd-ussd-orange:hover{box-shadow:0 6px 20px rgba(255,109,0,.55);}
  .cmd-ussd-hint{font-size:.75rem;color:var(--text-secondary);text-align:center;margin-top:7px;line-height:1.4;}

  /* ════ BON DE COMMANDE / FACTURE ════ */
  .bc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px;animation:cmd-fi .3s ease;}
  .bc-modal{background:white;border-radius:24px;width:100%;max-width:480px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.25);animation:cmd-su .4s cubic-bezier(.25,.46,.45,.94);}
  .bc-header{background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));padding:28px 24px 20px;border-radius:24px 24px 0 0;text-align:center;position:relative;}
  .bc-logo{font-size:3rem;margin-bottom:8px;}
  .bc-title{font-size:1.25rem;font-weight:800;color:white;margin-bottom:4px;}
  .bc-numero{font-size:.85rem;color:rgba(255,255,255,.8);font-weight:500;}
  .bc-success-ring{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.6);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 12px;}
  .bc-body{padding:20px;}
  .bc-section{background:#F8F9FA;border-radius:14px;padding:14px 16px;margin-bottom:12px;}
  .bc-section-title{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-secondary);margin-bottom:10px;display:flex;align-items:center;gap:6px;}
  .bc-row{display:flex;justify-content:space-between;align-items:flex-start;font-size:.875rem;padding:4px 0;}
  .bc-label{color:var(--text-secondary);font-weight:500;flex-shrink:0;margin-right:8px;}
  .bc-value{font-weight:600;color:var(--text-primary);text-align:right;word-break:break-word;}
  .bc-divider{height:1px;background:var(--border-color);margin:10px 0;}
  .bc-total-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0 0;}
  .bc-total-label{font-size:1rem;font-weight:700;color:var(--text-primary);}
  .bc-total-val{font-size:1.35rem;font-weight:900;color:var(--primary-color);}
  .bc-boutique-link{display:flex;align-items:center;gap:8px;padding:10px 12px;background:rgba(255,107,0,.07);border:1.5px solid rgba(255,107,0,.2);border-radius:10px;text-decoration:none;color:var(--primary-color);font-size:.82rem;font-weight:600;margin-top:8px;word-break:break-all;}
  .bc-status{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:#FFF3E0;color:#E65100;border-radius:20px;font-size:.78rem;font-weight:700;}
  .bc-actions{padding:0 20px 20px;display:flex;flex-direction:column;gap:10px;}
  .bc-btn-share{width:100%;padding:15px;background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));color:white;border:none;border-radius:14px;font-weight:700;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .3s;font-family:inherit;}
  .bc-btn-share:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(255,107,0,.35);}
  .bc-btn-copy{width:100%;padding:14px;background:white;color:var(--text-primary);border:2px solid var(--border-color);border-radius:14px;font-weight:600;font-size:.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .3s;font-family:inherit;}
  .bc-btn-copy:hover{border-color:var(--primary-color);color:var(--primary-color);}
  .bc-btn-copy.copied{border-color:var(--success-color);color:var(--success-color);}
  .bc-btn-close{width:100%;padding:13px;background:var(--bg-secondary);color:var(--text-secondary);border:none;border-radius:14px;font-weight:600;font-size:.95rem;cursor:pointer;transition:background .2s;font-family:inherit;}
  .bc-btn-close:hover{background:var(--border-color);}
  .bc-stripe-btn{width:100%;padding:14px;background:linear-gradient(135deg,#635BFF,#4B45D6);color:white;border:none;border-radius:14px;font-weight:700;font-size:.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .3s;font-family:inherit;text-decoration:none;}
  .bc-stripe-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,91,255,.35);}
  .bc-product-line{display:flex;align-items:center;gap:12px;padding:6px 0;}
  .bc-product-img{width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;border:1px solid var(--border-color);}
  .bc-product-info{flex:1;}
  .bc-product-name{font-size:.875rem;font-weight:600;color:var(--text-primary);}
  .bc-product-price{font-size:.8rem;color:var(--primary-color);font-weight:700;}
`;

// ================================================================
// COMPOSANT PRINCIPAL
// ================================================================

function ProduitDetail() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading]                   = useState(true);
  const [currentProduct, setCurrentProduct]     = useState(null);
  const [shopConfig, setShopConfig]             = useState(null);
  const [productLikes, setProductLikes]         = useState({ count: 0, userLiked: false });
  const [productComments, setProductComments]   = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages]               = useState([]);
  const [isZoomed, setIsZoomed]                 = useState(false);
  const [notification, setNotification]         = useState({ message: '', type: 'info', show: false });
  const [ratingValue, setRatingValue]           = useState(5);
  const [commentText, setCommentText]           = useState('');
  const [likeLoading, setLikeLoading]           = useState(false);

  // ── Modal commande
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showPaymentWarning, setShowPaymentWarning] = useState(false);
  const [orderLoading, setOrderLoading]   = useState(false);
  const [orderForm, setOrderForm]         = useState({
    nom: '', telephone: '', adresse: '',
    modePaiement: '',   // 'mtn' | 'orange' | 'carte' | 'cash'
    numeroPaiement: '', // numéro mobile money du CLIENT
    ville: 'autres',    // pour frais livraison
  });
  const [orderErrors, setOrderErrors] = useState({});
  const [bonCommande, setBonCommande]   = useState(null); // facture à afficher après succès
  const [pwAccepted, setPwAccepted]     = useState(false); // avertissement paiement accepté
  const [reportOpen, setReportOpen]     = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportComment, setReportComment] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [waPrixPropose, setWaPrixPropose] = useState('');

  const currentUserIdRef   = useRef(null);
  const notifTimerRef      = useRef(null);
  const commentsSectionRef = useRef(null);

  useEffect(() => { currentUserIdRef.current = getUserId(); }, []);

  useEffect(() => {
    if (!shopConfig?.apparence) return;
    const { couleurPrimaire, couleurSecondaire } = shopConfig.apparence;
    if (couleurPrimaire) {
      document.documentElement.style.setProperty('--primary-color', couleurPrimaire);
      document.documentElement.style.setProperty('--primary-dark', couleurPrimaire + 'dd');
    }
    if (couleurSecondaire)
      document.documentElement.style.setProperty('--text-primary', couleurSecondaire);
  }, [shopConfig]);

  // ── Notification
  const afficherNotification = useCallback((message, type = 'info') => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setNotification({ message, type, show: true });
    notifTimerRef.current = setTimeout(() => setNotification(p => ({ ...p, show: false })), 3000);
  }, []);

  // ── Chargements
  const chargerConfigurationBoutique = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('parametres_boutique').select('config').eq('user_id', userId).single();
      if (data && !error) { setShopConfig(data.config); return data.config; }
    } catch (e) { console.error('❌ config boutique:', e); }
    const def = getDefaultShopConfig();
    setShopConfig(def);
    return def;
  }, []);

  const chargerLikes = useCallback(async (productId) => {
    try {
      const { data: likes, error } = await supabase
        .from('product_likes').select('user_id').eq('product_id', productId);
      if (error) throw error;
      setProductLikes({ count: likes.length, userLiked: likes.some(l => l.user_id === currentUserIdRef.current) });
    } catch { setProductLikes({ count: 0, userLiked: false }); }
  }, []);

  const chargerCommentaires = useCallback(async (productId) => {
    try {
      const { data: comments, error } = await supabase
        .from('product_comments').select('*').eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProductComments(comments || []);
    } catch { setProductComments([]); }
  }, []);

  const chargerProduit = useCallback(async () => {
    try {
      const productId = searchParams.get('id');
      if (!productId) throw new Error('ID produit manquant');
      const { data: product, error } = await supabase
        .from('produits').select('*').eq('id', productId).single();
      if (error) throw error;
      if (!product) throw new Error('Produit non trouvé');
      setCurrentProduct(product);
      setIsFavorite(getFavStatus(product.id));
      document.title = `${product.nom} - ODA Marketplace`;

      const productUrl = window.location.href;
      const productImage = product.images?.[0] || product.image || '/images/oda-logo.png';
      const devise = shopConfig?.paiement?.devise || 'FCFA';
      const productDesc = product.description ? product.description.substring(0, 200) : `Découvrez ${product.nom} sur ODA Marketplace`;

      const setMeta = (name, content) => {
        let el = document.querySelector(`meta[property="${name}"]`) || document.querySelector(`meta[name="${name}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute('property', name); document.head.appendChild(el); }
        el.setAttribute('content', content);
      };
      const setMetaName = (name, content) => {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
        el.setAttribute('content', content);
      };

      setMeta('og:title', `${product.nom} - ODA Marketplace`);
      setMeta('og:description', productDesc);
      setMeta('og:image', productImage);
      setMeta('og:url', productUrl);
      setMeta('og:type', 'product');
      setMetaName('twitter:card', 'summary_large_image');
      setMetaName('twitter:title', `${product.nom} - ODA Marketplace`);
      setMetaName('twitter:description', productDesc);
      setMetaName('twitter:image', productImage);
      const images = buildAllImages(product);
      setAllImages(images);
      setCurrentImageIndex(0);
      await Promise.all([
        chargerConfigurationBoutique(product.user_id),
        chargerLikes(productId),
        chargerCommentaires(productId),
      ]);
      setLoading(false);
    } catch (err) {
      console.error('❌ produit:', err);
      afficherNotification('Erreur lors du chargement du produit', 'error');
      setTimeout(() => router.push('/oda-achats'), 2000);
    }
  }, [searchParams, chargerConfigurationBoutique, chargerLikes, chargerCommentaires, afficherNotification, router]);

  useEffect(() => {
    chargerProduit();
    return () => { if (notifTimerRef.current) clearTimeout(notifTimerRef.current); };
  }, [chargerProduit]);

  const changerImage = useCallback((index) => {
    if (index < 0 || index >= allImages.length) return;
    setCurrentImageIndex(index); setIsZoomed(false);
  }, [allImages.length]);
  const handleMainImageClick = () => setIsZoomed(p => !p);

  const getStockInfo = () => {
    const s = currentProduct?.stock || 0;
    if (s > 10) return { icon: '✅', text: 'En stock',       quantity: `• ${s} disponibles` };
    if (s > 0)  return { icon: '⚠️', text: 'Stock limité',   quantity: `• Plus que ${s} !` };
    return          { icon: '❌', text: 'Rupture de stock', quantity: '' };
  };

  const calculerNoteMoyenne = () => {
    if (!productComments.length) return '0.0';
    const sum = productComments.reduce((a, c) => a + (c.rating || 0), 0);
    return (sum / productComments.length).toFixed(1);
  };

  const toggleLike = async () => {
    if (!currentProduct) return;
    setLikeLoading(true);
    try {
      if (productLikes.userLiked) {
        const { error } = await supabase.from('product_likes').delete()
          .eq('product_id', currentProduct.id).eq('user_id', currentUserIdRef.current);
        if (error) throw error;
        setProductLikes(p => ({ count: Math.max(0, p.count - 1), userLiked: false }));
        afficherNotification('Like retiré', 'info');
      } else {
        const { error } = await supabase.from('product_likes')
          .insert({ product_id: currentProduct.id, user_id: currentUserIdRef.current });
        if (error) throw error;
        setProductLikes(p => ({ count: p.count + 1, userLiked: true }));
        afficherNotification('Produit liké !', 'success');
      }
    } catch { afficherNotification('Erreur lors du like', 'error'); }
    finally { setLikeLoading(false); }
  };

  const getFavStatus = (id) => {
    try { return (JSON.parse(localStorage.getItem('oda_favorites') || '[]')).includes(id); } catch { return false; }
  };
  const saveFavorites = (id, fav) => {
    try {
      const f = JSON.parse(localStorage.getItem('oda_favorites') || '[]');
      if (fav) { if (!f.includes(id)) f.push(id); } else { const i = f.indexOf(id); if (i > -1) f.splice(i, 1); }
      localStorage.setItem('oda_favorites', JSON.stringify(f));
    } catch {}
  };
  const toggleFavorite = () => {
    if (!currentProduct) return;
    const next = !isFavorite;
    setIsFavorite(next);
    saveFavorites(currentProduct.id, next);
    afficherNotification(next ? '✅ Ajouté aux favoris' : ' Retiré des favoris', 'success');
  };

  const openReportModalProduit = () => { setReportOpen(true); setReportReason(''); setReportComment(''); };

  const submitReportProduit = async () => {
    if (!reportReason || !currentProduct) return;
    setReportLoading(true);
    try {
      const reportText = `Raison: ${reportReason}${reportComment ? ' | ' + reportComment : ''}`;
      const { error } = await supabase.from('product_comments').insert({
        product_id: currentProduct.id,
        user_id: currentUserIdRef.current || null,
        user_name: '🚩 Signalement',
        comment: reportText,
        rating: 1,
      });
      if (error) throw error;
      afficherNotification('✅ Signalement envoyé', 'success');
      setReportOpen(false);
    } catch (e) {
      console.error('Erreur signalement:', e);
      afficherNotification('❌ Erreur lors de l\'envoi', 'error');
    } finally { setReportLoading(false); }
  };

  const submitComment = async () => {
    const comment = commentText.trim();
    if (!comment) { afficherNotification('Le commentaire ne peut pas être vide', 'error'); return; }
    if (!currentProduct) return;
    const userName = getUserName();
    try {
      const { data, error } = await supabase.from('product_comments')
        .insert({ product_id: currentProduct.id, user_id: currentUserIdRef.current, user_name: userName, comment, rating: ratingValue })
        .select().single();
      if (error) throw error;
      setProductComments(p => [data, ...p]);
      setCommentText(''); setRatingValue(5);
      afficherNotification('Commentaire ajouté !', 'success');
    } catch { afficherNotification("Erreur lors de l'ajout du commentaire", 'error'); }
  };

  const scrollToComments = () => commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const partagerProduit = async () => {
    if (!currentProduct) return;
    const url = window.location.href;
    const imageUrl = currentProduct.images?.[0] || currentProduct.image || '';
    if (navigator.share) {
      try {
        const shareData = { title: currentProduct.nom, text: `Découvrez ${currentProduct.nom} sur ODA Marketplace`, url };
        if (imageUrl) {
          try {
            const resp = await fetch(imageUrl);
            const blob = await resp.blob();
            const file = new File([blob], `${currentProduct.nom}.jpg`, { type: blob.type || 'image/jpeg' });
            shareData.files = [file];
          } catch { /* image non partageable, on envoie sans */ }
        }
        await navigator.share(shareData);
      }
      catch (e) { if (e.name !== 'AbortError') console.error(e); }
    } else {
      try { await navigator.clipboard.writeText(url); afficherNotification('Lien copié !', 'success'); }
      catch { afficherNotification('Impossible de copier le lien', 'error'); }
    }
  };

  const contacterWhatsApp = () => {
    if (!currentProduct) return;
    const telephone = shopConfig?.general?.telephone || '';
    if (!telephone) { afficherNotification('Numéro WhatsApp non disponible', 'error'); return; }
    const devise = shopConfig?.paiement?.devise || 'FCFA';
    setWaMessage(
      `Bonjour, je suis intéressé(e) par ce produit :\n\n📦 ${currentProduct.nom}\n💰 ${formatPrice(currentProduct.prix, devise)}`
    );
    setWaPrixPropose('');
    setShowWaModal(true);
  };

  const allerBoutique = async () => {
    if (!currentProduct) { afficherNotification('Impossible de charger la boutique', 'error'); return; }
    try {
      let slug = shopConfig?.identifiant?.slug || null;
      if (!slug) {
        const { data, error } = await supabase.from('parametres_boutique')
          .select('config').eq('user_id', currentProduct.user_id).single();
        if (data && !error) slug = data.config?.identifiant?.slug || data.config?.slug || null;
      }
      if (!slug) slug = currentProduct.user_id;
      afficherNotification('Redirection vers la boutique...', 'info');
      setTimeout(() => { window.location.href = `${window.location.origin}/boutique?shop=${slug}`; }, 500);
    } catch { afficherNotification("Erreur lors de l'accès à la boutique", 'error'); }
  };

 
  const getMethodesPaiement = useCallback(() => {
    const p = shopConfig?.paiement || {};
    const liste = [];

    // ── MTN Mobile Money
    if (p.mobile?.actif && p.mobile?.mtn?.actif) {
      liste.push({
        id:         'mtn',
        label:      'MTN Mobile Money',
        icon:       '📞',
        bgIcon:     '#FFCC0030',
        description:'Envoi via MTN MoMo',
        type:       'mobile',
        numero:     p.mobile.mtn.numero    || '',
        nomCompte:  p.mobile.mtn.nomCompte || '',
        confirme:   p.mobile.mtn.confirme  || false,
      });
    }

    // ── Orange Money
    if (p.mobile?.actif && p.mobile?.orange?.actif) {
      liste.push({
        id:         'orange',
        label:      'Orange Money',
        icon:       '🍊',
        bgIcon:     '#FF790030',
        description:'Envoi via Orange Money',
        type:       'mobile',
        numero:     p.mobile.orange.numero    || '',
        nomCompte:  p.mobile.orange.nomCompte || '',
        confirme:   p.mobile.orange.confirme  || false,
      });
    }

    // ── Carte bancaire
    if (p.carte?.actif) {
      liste.push({
        id:         'carte',
        label:      'Carte bancaire',
        icon:       '💳',
        bgIcon:     '#007AFF20',
        description:'Visa, Mastercard, Amex',
        type:       'carte',
        cle:        p.carte.cle     || '',
        confirme:   p.carte.confirme || false,
      });
    }

    // ── Paiement à la livraison
    if (p.cash?.actif) {
      liste.push({
        id:         'cash',
        label:      'Paiement à la livraison',
        icon:       '💵',
        bgIcon:     '#10B98120',
        description:'Espèces à la réception',
        type:       'cash',
        confirme:   p.cash.confirme || false,
      });
    }

    return liste;
  }, [shopConfig]);


  const calculerLivraison = useCallback(() => {
    const liv  = shopConfig?.livraison || {};
    const prix = currentProduct?.prix  || 0;
    const dv   = shopConfig?.paiement?.devise || 'FCFA';

    if (liv.gratuit && prix >= (liv.montantMin || 0)) {
      return { frais: 0, label: 'Gratuite 🎁', gratuit: true };
    }

    let frais = liv.fraisAutres ?? 2500;
    if (orderForm.ville === 'douala') frais = liv.fraisDouala ?? 1000;
    if (orderForm.ville.startsWith('zone_')) {
      const idx = parseInt(orderForm.ville.replace('zone_', ''));
      const zone = (liv.zonesPersonnalisees || [])[idx];
      if (zone) frais = zone.frais ?? frais;
    }

    return { frais, label: formatPrice(frais, dv), gratuit: false };
  }, [shopConfig, currentProduct, orderForm.ville]);

  // ── Ouvrir modal — montre l'avertissement uniquement si pas encore accepté
  const ouvrirFormCommande = () => {
    if ((currentProduct?.stock || 0) === 0) {
      afficherNotification('Ce produit est en rupture de stock', 'error');
      return;
    }
    if (pwAccepted) {
      setOrderForm({ nom: '', telephone: '', adresse: '', modePaiement: '', numeroPaiement: '', ville: 'autres' });
      setOrderErrors({});
      setShowOrderForm(true);
      document.body.style.overflow = 'hidden';
    } else {
      setShowPaymentWarning(true);
      document.body.style.overflow = 'hidden';
    }
  };

  // ── Callback après acceptation avertissement paiement
  const apresAvertissement = () => {
    setPwAccepted(true);
    setOrderForm({ nom: '', telephone: '', adresse: '', modePaiement: '', numeroPaiement: '', ville: 'autres' });
    setOrderErrors({});
    setShowOrderForm(true);
    document.body.style.overflow = 'hidden';
  };

  const fermerFormCommande = () => {
    setShowOrderForm(false);
    setShowPaymentWarning(false);
    document.body.style.overflow = '';
  };

  const setField = (field, value) => {
    setOrderForm(p => ({ ...p, [field]: value }));
    if (orderErrors[field]) setOrderErrors(p => ({ ...p, [field]: '' }));
  };

  // ── Validation
  const valider = () => {
    const errs = {};
    if (!orderForm.nom.trim())       errs.nom = 'Veuillez entrer votre nom complet';
    if (!orderForm.telephone.trim()) errs.telephone = 'Veuillez entrer votre téléphone';
    else if (!/^[0-9\s\+\-]{8,15}$/.test(orderForm.telephone.trim()))
      errs.telephone = 'Numéro invalide (ex: +237 6XX XX XX XX)';
    if (!orderForm.adresse.trim())   errs.adresse = 'Veuillez entrer votre adresse';
    if (!orderForm.modePaiement)     errs.modePaiement = 'Veuillez choisir un mode de paiement';

    const sel = getMethodesPaiement().find(m => m.id === orderForm.modePaiement);
    if (sel?.type === 'mobile' && !orderForm.numeroPaiement.trim())
      errs.numeroPaiement = `Entrez votre numéro ${sel.label}`;

    setOrderErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const soumettreCommande = async () => {
    if (!valider() || !currentProduct) return;
    setOrderLoading(true);

    const methodes  = getMethodesPaiement();
    const sel       = methodes.find(m => m.id === orderForm.modePaiement);
    const livraison = calculerLivraison();
    const devise    = shopConfig?.paiement?.devise || 'FCFA';
    const slug      = shopConfig?.identifiant?.slug || '';
    const total     = (currentProduct.prix || 0) + livraison.frais;

    // ── Générer le numéro de commande (optionnel, tenter sans si colonne absente)
    let commandesCount = 0;
    try {
      const { count } = await supabase
        .from('commandes').select('id', { count: 'exact', head: true });
      commandesCount = count || 0;
    } catch { commandesCount = Math.floor(Math.random() * 9000) + 1000; }

   
    const champOriginaux = {
      user_id:           currentProduct.user_id,
      client_nom:        orderForm.nom.trim(),
      client_email:      null,
      client_telephone:  orderForm.telephone.trim(),
      adresse_livraison: orderForm.adresse.trim(),
      produits_data:     [
        {
          nom:      currentProduct.nom,
          prix:     currentProduct.prix,
          quantite: 1,
          image:    allImages[0] || null,
        },
      ],
      montant_total:     total,
      statut:            'en_attente',
      created_at:        new Date().toISOString(),
    };

    // ── Champs ÉTENDUS — champOriginaux + colonnes optionnelles
    //    Si une colonne manque → tentative 2 utilise champOriginaux seul
    const champEtendus = {
      ...champOriginaux,
      numero:             genererNumeroCommande(commandesCount),
      ville:              orderForm.ville,
      mode_paiement:      orderForm.modePaiement,
      numero_client:      orderForm.numeroPaiement.trim() || null,
      numero_marchand:    sel?.numero    || null,
      compte_marchand:    sel?.nomCompte || null,
      devise,
      frais_livraison:    livraison.frais,
      livraison_gratuite: livraison.gratuit,
    };


    // ────────────────────────────────────────────────────────
    //  Aide : détecter si l'erreur est liée à une colonne inconnue
    // ────────────────────────────────────────────────────────
    const estErreurColonne = (err) => {
      if (!err) return false;
      const code = err.code || '';
      const msg  = (err.message || '').toLowerCase();
      
      return (
        code === '42703' ||
        code === 'PGRST204' ||
        msg.includes('column') ||
        msg.includes('colonne') ||
        msg.includes('does not exist') ||
        msg.includes('unknown field') ||
        msg.includes('unrecognized') ||
        msg.includes('42703')
      );
    };

    
    const sauvegarderCommandeLocale = (bc) => {
      try {
        const stored = JSON.parse(localStorage.getItem('oda_orders') || '[]');
        // Éviter les doublons si la même commande est ré-affichée
        const existe = stored.some(o => o.id === bc.id && o.numero === bc.numero);
        if (!existe) {
          stored.unshift({ ...bc, savedAt: new Date().toISOString() });
          // Conserver au maximum 50 commandes dans l'historique
          localStorage.setItem('oda_orders', JSON.stringify(stored.slice(0, 50)));
          console.log('💾 Commande sauvegardée dans l\'historique local :', bc.numero);
        }
      } catch (e) {
        console.warn('⚠️ Impossible de sauvegarder la commande localement :', e);
      }
    };

   
    const afficherBonCommande = (insertedId, numero) => {
      fermerFormCommande();

      // ── Construire l'objet facture en amont pour le sauvegarder
      //    dans localStorage AVANT d'appeler setBonCommande
      const nouvelleCommande = {
        // Identifiants
        id:              insertedId,
        numero:          numero || `#${insertedId}`,
        date:            new Date().toLocaleString('fr-FR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }),

        // Boutique — tout ce qu'il faut pour retrouver la boutique
        boutique: {
          nom:       shopConfig?.general?.nom       || 'Ma Boutique',
          telephone: shopConfig?.general?.telephone || '',
          email:     shopConfig?.general?.email     || '',
          adresse:   shopConfig?.general?.adresse   || '',
          lien:      boutiqueLien || '',
          slug:      slug || '',
        },

        // Client
        client: {
          nom:       orderForm.nom.trim(),
          telephone: orderForm.telephone.trim(),
          adresse:   orderForm.adresse.trim(),
          ville:     orderForm.ville,
        },

        // Produit commandé
        produits: [
          {
            nom:      currentProduct.nom,
            prix:     currentProduct.prix,
            quantite: 1,
            image:    allImages[0] || null,
          },
        ],

        // Paiement & montants
        modePaiement:      orderForm.modePaiement,
        labelPaiement:     sel?.label || orderForm.modePaiement,
        montantProduit:    currentProduct.prix,
        fraisLivraison:    livraison.frais,
        livraisonGratuite: livraison.gratuit,
        montantTotal:      total,
        devise,
        statut:            'en_attente',

        // Stripe (si carte) — lien de paiement restant accessible
        stripeLien: sel?.type === 'carte' && sel?.cle && isURL(sel.cle) ? sel.cle : null,
      };

      // ── Sauvegarder dans localStorage (page /favorie)
      sauvegarderCommandeLocale(nouvelleCommande);

      // ── Afficher la facture + notification
      setBonCommande(nouvelleCommande);
      afficherNotification('✅ Commande enregistrée avec succès !', 'success');
    };

    const fallbackBonCommande = () => {
      const fakeId = Date.now();
      afficherBonCommande(fakeId, genererNumeroCommande(commandesCount));
    };

    try {
      // ══ Tentative 1 : insertion avec champs étendus (commandes.js) ══
      console.log('📤 Tentative 1 — champs étendus');
      let { data, error } = await supabase
        .from('commandes').insert(champEtendus).select().single();

      // ══ Tentative 2 : si colonne inconnue → champs originaux seulement ══
      if (error && estErreurColonne(error)) {
        console.warn('⚠️ Colonne(s) manquante(s), tentative 2 — champs originaux :', error.message);
        const res2 = await supabase
          .from('commandes').insert(champOriginaux).select().single();
        data  = res2.data;
        error = res2.error;
      }

      // ══ Table absente → bon de commande fallback ══
      if (error?.code === '42P01') {
        fallbackBonCommande();
        return;
      }

      // ══ Autre erreur réelle ══
      if (error) {
        console.error('❌ Commande — erreur Supabase :', error);
        afficherNotification(
          `Erreur : ${error.message || 'Impossible d\'enregistrer la commande'}`,
          'error'
        );
        return;
      }

      // ══ Succès ══
      afficherBonCommande(data.id, champEtendus.numero || champOriginaux.numero);

    } catch (err) {
      console.error('❌ Commande — exception :', err);

      // Table absente
      if (err?.code === '42P01') {
        fallbackBonCommande();
        return;
      }

      afficherNotification(
        `Erreur inattendue : ${err?.message || 'Veuillez réessayer'}`,
        'error'
      );
    } finally {
      setOrderLoading(false);
    }
  };

  // ==================== VALEURS DÉRIVÉES ====================
  const stockInfo     = currentProduct ? getStockInfo() : { icon: '✅', text: 'En stock', quantity: '' };
  const devise        = shopConfig?.paiement?.devise || 'FCFA';
  const shopName      = shopConfig?.general?.nom || 'Ma Boutique';
  const shopLogo      = shopConfig?.apparence?.logo || '';
  const noteMoyenne   = calculerNoteMoyenne();
  const notifIcons    = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const methodesPaiem = getMethodesPaiement();
  const methodeSel    = methodesPaiem.find(m => m.id === orderForm.modePaiement);
  const livraison     = calculerLivraison();
  const montantTotal  = (currentProduct?.prix || 0) + livraison.frais;
  const slug          = shopConfig?.identifiant?.slug || '';
  const boutiqueLien  = slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/boutique?shop=${slug}`
    : '';

  // ── State copié (pour le feedback bouton "Copier")
  const [copied, setCopied] = useState(false);

  // ── Lien USSD pour le paiement Mobile Money actif
  const ussdLien = methodeSel?.type === 'mobile' && methodeSel?.numero
    ? genererLienUSSD(methodeSel.id, methodeSel.numero, montantTotal)
    : null;

  // ==================== RENDER ====================
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      {loading && (
        <div id="loader">
          <div className="loader-spinner" />
          <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Chargement...</p>
        </div>
      )}

      <div className={`notification${notification.show ? ' show' : ''} ${notification.type}`}>
        <span>{notifIcons[notification.type] || 'ℹ️'}</span>
        <span>{notification.message}</span>
      </div>

      <header className="header">
        <button className="btn-back" onClick={() => window.history.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="header-title">{currentProduct?.nom || 'Produit'}</h1>
        <button className="btn-share" onClick={partagerProduit}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </header>

      <div className="carousel-container">
        <div className="main-image-wrapper" onClick={handleMainImageClick}>
          <img
            className={`main-image${isZoomed ? ' zoom' : ''}`}
            src={allImages[currentImageIndex] || ''}
            alt="Produit"
            style={{ opacity: loading ? 0.5 : 1 }}
            onLoad={e => { e.target.style.opacity = 1; }}
            onError={e => { e.target.src = 'https://via.placeholder.com/600x600?text=Image+non+disponible'; e.target.style.opacity = 1; }}
          />
          {allImages.length > 1 && (
            <div className="image-counter">{currentImageIndex + 1} / {allImages.length}</div>
          )}
          <button className={`btn-fav-floating${isFavorite ? ' active' : ''}`} onClick={toggleFavorite} aria-label="Ajouter aux favoris">
            {isFavorite
              ? <svg viewBox="0 0 24 24" fill="#fff" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/></svg>}
          </button>
        </div>
        <div className="thumbnails-container" style={{ display: allImages.length > 1 ? 'flex' : 'none' }}>
          {allImages.map((img, index) => (
            <img key={index} src={img}
              className={`thumbnail${index === currentImageIndex ? ' active' : ''}`}
              onClick={() => changerImage(index)} alt={`Miniature ${index + 1}`} loading="lazy"
              onError={e => { e.target.src = `https://via.placeholder.com/70x70?text=${index + 1}`; }}
              style={index === 0 ? { borderColor: 'var(--primary-color)', boxShadow: '0 0 8px rgba(255,107,0,0.5)' }
                : index === currentImageIndex ? { borderColor: 'var(--primary-color)' } : {}}
            />
          ))}
        </div>
      </div>

      <div className="product-content">
        <div className="product-header">
          <h2 className="product-name">{currentProduct?.nom || 'Nom du produit'}</h2>
          <div className="product-header-actions">
            <span className="product-category">📦 {currentProduct?.categorie || 'Catégorie'}</span>
            <button className="btn-report-product" onClick={() => openReportModalProduit()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              Signaler
            </button>
          </div>
        </div>

        <div className="price-section">
          {currentProduct?.prix_promo && Number(currentProduct.prix_promo) > 0 && Number(currentProduct.prix_promo) < Number(currentProduct.prix) ? (
            <>
              <div className="product-price" style={{color:'var(--success)',fontWeight:700}}>
                {formatPrice(currentProduct.prix_promo, devise)}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                <span style={{textDecoration:'line-through',color:'var(--text-muted)',fontSize:'1rem'}}>
                  {currentProduct.prix_initial ? formatPrice(currentProduct.prix_initial, devise) : formatPrice(currentProduct.prix, devise)}
                </span>
                <span className="badge-promo">Promotion -{Math.round((1 - Number(currentProduct.prix_promo)/Number(currentProduct.prix)) * 100)}%</span>
              </div>
            </>
          ) : (
            <div className="product-price">{currentProduct ? formatPrice(currentProduct.prix, devise) : '0 FCFA'}</div>
          )}
          <div className="stock-info">
            <div className="stock-badge"><span>{stockInfo.icon}</span><span>{stockInfo.text}</span></div>
            <span>{stockInfo.quantity}</span>
          </div>
        </div>

        <div className="description-section">
          <h3 className="section-title">📝 Description</h3>
          <p className="product-description">{currentProduct?.description || 'Aucune description disponible.'}</p>
        </div>

        <div className="engagement-section">
          <div className="engagement-stats">
            <div className="stat-item"><div className="stat-value">{productLikes.count}</div><div className="stat-label">J&apos;aime</div></div>
            <div className="stat-item"><div className="stat-value">{productComments.length}</div><div className="stat-label">Commentaires</div></div>
            <div className="stat-item"><div className="stat-value">⭐ {noteMoyenne}</div><div className="stat-label">Note</div></div>
          </div>
          <div className="engagement-buttons">
            <button className={`btn-like${productLikes.userLiked ? ' liked' : ''}`} onClick={toggleLike} disabled={likeLoading}>
              <span>{productLikes.userLiked
                ? <svg viewBox="0 0 24 24" fill="#EF4444" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/></svg>}</span>
              <span>{productLikes.userLiked ? 'Aimé' : "J'aime"}</span>
            </button>

            <button className="btn-comments" onClick={scrollToComments}><span>💬</span><span>Commenter</span></button>
          </div>
        </div>

        <div className="shop-section">
          <div className="shop-info">
            <div className="shop-icon">
              {shopLogo ? <img src={shopLogo} alt={shopName} /> : <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="30" height="30"><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4"/><path d="M8 14h8"/><path d="M10 14v4"/><path d="M14 14v4"/></svg>}
            </div>
            <div className="shop-details"><h3>{shopName}</h3><p>Visitez la boutique pour plus de produits</p></div>
          </div>
          <button className="btn-visit-shop" onClick={allerBoutique}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" style={{marginRight:6}}><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4"/><path d="M8 14h8"/><path d="M10 14v4"/><path d="M14 14v4"/></svg> Voir la boutique</button>
        </div>

        <div className="comments-section" ref={commentsSectionRef}>
          <h3 className="section-title">💬 Commentaires</h3>
          <div className="comment-form">
            <div className="rating-input">
              <span>Note :</span>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star}>
                  <input type="radio" name="rating" value={star} id={`star${star}`}
                    checked={ratingValue === star} onChange={() => setRatingValue(star)} />
                  <label htmlFor={`star${star}`}>⭐</label>
                </span>
              ))}
            </div>
            <textarea placeholder="Partagez votre avis sur ce produit..."
              value={commentText} onChange={e => setCommentText(e.target.value)} />
            <button className="btn-submit-comment" onClick={submitComment}>Publier le commentaire</button>
          </div>
          <div className="comments-list">
            {productComments.length === 0 ? (
              <div className="empty-comments">
                <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>Aucun commentaire pour l&apos;instant</p>
                <p>Soyez le premier à donner votre avis !</p>
              </div>
            ) : productComments.map((comment, i) => (
              <div key={comment.id || i} className="comment-item">
                <div className="comment-header">
                  <div className="comment-user">
                    <div className="user-avatar">{comment.user_name.charAt(0).toUpperCase()}</div>
                    <span className="user-name">{comment.user_name}</span>
                  </div>
                  <div className="comment-rating">{'⭐'.repeat(comment.rating || 5)}</div>
                </div>
                <p className="comment-text">{comment.comment}</p>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOUTONS FIXES ── */}
      <div className="action-buttons">
        <button className="btn-primary" onClick={ouvrirFormCommande}>🛒 Passer la commande</button>
        <button className="btn-secondary" onClick={contacterWhatsApp}>📱 Contacter sur WhatsApp</button>
      </div>

      {

      }
      {showOrderForm && (
        <div className="cmd-overlay" onClick={e => { if (e.target === e.currentTarget) fermerFormCommande(); }}>
          <div className="cmd-modal">

            {/* Header sticky */}
            <div className="cmd-header">
              <div className="cmd-handle" />
              <div className="cmd-title">🛒 Passer la commande</div>
              <button className="cmd-close" onClick={fermerFormCommande}>✕</button>
            </div>

            <div className="cmd-body">

              {/* ── Récap produit + lien boutique */}
              {currentProduct && (
                <div className="cmd-recap">
                  <img className="cmd-recap-img"
                    src={allImages[0] || 'https://via.placeholder.com/64x64'}
                    alt={currentProduct.nom}
                    onError={e => { e.target.src = 'https://via.placeholder.com/64x64'; }} />
                  <div>
                    <div className="cmd-recap-name">{currentProduct.nom}</div>
                    <div className="cmd-recap-price">{formatPrice(currentProduct.prix, devise)}</div>
                    {boutiqueLien && (
                      <div className="cmd-shop-tag">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{marginRight:4,verticalAlign:'middle'}}><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4"/><path d="M8 14h8"/><path d="M10 14v4"/><path d="M14 14v4"/></svg> {shopName} &nbsp;·&nbsp;
                        <a href={boutiqueLien} target="_blank" rel="noopener noreferrer">voir la boutique ↗</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ════ 1 — INFORMATIONS CLIENT ════ */}
              <div className="cmd-section-label">👤 Vos informations</div>

              <div className="cmd-field">
                <label className="cmd-label">Nom complet *</label>
                <input type="text" className={`cmd-input${orderErrors.nom ? ' err' : ''}`}
                  placeholder="Ex : Jean Dupont"
                  value={orderForm.nom} onChange={e => setField('nom', e.target.value)} />
                {orderErrors.nom && <span className="cmd-err">{orderErrors.nom}</span>}
              </div>

              <div className="cmd-field">
                <label className="cmd-label">Téléphone *</label>
                <input type="tel" className={`cmd-input${orderErrors.telephone ? ' err' : ''}`}
                  placeholder="+237 6XX XX XX XX"
                  value={orderForm.telephone} onChange={e => setField('telephone', e.target.value)} />
                {orderErrors.telephone && <span className="cmd-err">{orderErrors.telephone}</span>}
              </div>

              <div className="cmd-field">
                <label className="cmd-label">Adresse de livraison *</label>
                <input type="text" className={`cmd-input${orderErrors.adresse ? ' err' : ''}`}
                  placeholder="Quartier, rue, ville..."
                  value={orderForm.adresse} onChange={e => setField('adresse', e.target.value)} />
                {orderErrors.adresse && <span className="cmd-err">{orderErrors.adresse}</span>}
              </div>

              {/* Ville — détermine fraisDouala ou fraisAutres */}
              <div className="cmd-field">
                <label className="cmd-label">Ville de livraison</label>
                <select className="cmd-input" value={orderForm.ville} onChange={e => setField('ville', e.target.value)}>
                  <option value="douala">Douala</option>
                  <option value="autres">Autre ville</option>
                  {(shopConfig?.livraison?.zonesPersonnalisees || []).map((zone, i) =>
                    zone.nom ? <option key={i} value={`zone_${i}`}>{zone.nom}</option> : null
                  )}
                </select>
              </div>

              {/* ════ 2 — MODE DE PAIEMENT ════ */}
              <div className="cmd-section-label">💳 Mode de paiement</div>

              {orderErrors.modePaiement && (
                <span className="cmd-err" style={{ display: 'block', marginBottom: 8 }}>
                  {orderErrors.modePaiement}
                </span>
              )}

              {methodesPaiem.length === 0 ? (
                <div className="cmd-no-method">
                  <p>⚠️ Aucune méthode de paiement configurée par cette boutique.</p>
                  <p style={{ marginTop: 8, fontSize: '.82rem' }}>Contactez le vendeur via WhatsApp.</p>
                </div>
              ) : (
                <div className="cmd-methods">
                  {methodesPaiem.map(m => (
                    <label key={m.id}
                      className={`cmd-method${orderForm.modePaiement === m.id ? ' sel' : ''}`}
                      onClick={() => { setField('modePaiement', m.id); setField('numeroPaiement', ''); }}>
                      <input type="radio" name="modePaiement" value={m.id}
                        checked={orderForm.modePaiement === m.id} readOnly />
                      <div className="cmd-radio" />
                      <div className="cmd-micon"
                        style={{ width: 44, height: 44, borderRadius: 10, background: m.bgIcon, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
                        {m.icon}
                      </div>
                      <div className="cmd-mbody">
                        <div className="cmd-mtitle">{m.label}</div>
                        <div className="cmd-mdesc">{m.description}</div>
                        {m.confirme && <span className="cmd-badge">✓ Vérifié</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* ══ Bloc d'info paiement Mobile Money (MTN ou Orange) ══ */}
              {methodeSel?.type === 'mobile' && (
                <div className="cmd-pay-box">
                  <div className="cmd-pay-title">📲 Instructions de paiement</div>

                  {/* ── ALERTE : paiements mobiles non supportés par ODA ── */}
                  <div className="cmd-mobile-alert">
                    <div className="cmd-mobile-alert-icon">⚠️</div>
                    <div className="cmd-mobile-alert-body">
                      <div className="cmd-mobile-alert-title">Attention — Paiement mobile non suivi par ODA</div>
                      <div className="cmd-mobile-alert-text">
                        Les paiements <strong>MTN Mobile Money</strong> et <strong>Orange Money</strong> ne sont
                        pas encore pris en charge par l&apos;application ODA. Votre transfert ne sera
                        pas confirmé automatiquement.{' '}
                        <strong>Nous vous recommandons vivement de choisir le paiement à la livraison</strong>{' '}
                        pour éviter tout problème.
                      </div>
                    </div>
                  </div>

                  {/* Numéro + nom de compte du MARCHAND */}
                  {methodeSel.numero ? (
                    <div className="cmd-mm-card">
                      <span style={{ fontSize: '2rem' }}>{methodeSel.icon}</span>
                      <div>
                        <div className="cmd-mm-name">
                          Compte marchand : <strong>{methodeSel.nomCompte || shopName}</strong>
                        </div>
                        {/* ← Numéro marchand de parametre.js affiché ici */}
                        <div className="cmd-mm-num">{methodeSel.numero}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="cmd-instr" style={{ color: 'var(--error-color)', marginBottom: 8 }}>
                      ⚠️ Le numéro {methodeSel.label} n&apos;a pas encore été configuré par le vendeur.
                    </p>
                  )}

                  <p className="cmd-instr">
                    Montant à envoyer :{' '}
                    <strong>{formatPrice(currentProduct?.prix || 0, devise)}</strong>
                    {livraison.frais > 0 && <> + <strong>{formatPrice(livraison.frais, devise)}</strong> (livraison)</>}
                    {' '}= <strong>{formatPrice(montantTotal, devise)}</strong>
                  </p>

                  {/* ── BOUTON USSD — Déclenche le paiement directement depuis le téléphone ── */}
                  {ussdLien && methodeSel.numero && (
                    <div className="cmd-ussd-wrap">
                      <a
                        href={ussdLien}
                        className={`cmd-ussd-btn cmd-ussd-${methodeSel.id}`}
                        onClick={() => {
                          // Légère pause pour que le lien USSD s'ouvre avant de continuer
                          setTimeout(() => {
                            afficherNotification(
                              `Entrez votre code PIN ${methodeSel.label} pour valider`,
                              'info'
                            );
                          }, 400);
                        }}
                      >
                        {methodeSel.id === 'mtn' ? '📲' : '🍊'}
                        Payer via {methodeSel.label} (USSD)
                        <span style={{ marginLeft: 'auto', fontSize: '.8rem', opacity: .75 }}>*{methodeSel.id === 'mtn' ? '126' : '#150'}#</span>
                      </a>
                      <p className="cmd-ussd-hint">
                        Appuyez sur ce bouton pour ouvrir automatiquement le menu {methodeSel.label} sur
                        votre téléphone. Votre code PIN vous sera demandé pour valider le paiement
                        de <strong>{formatPrice(montantTotal, devise)}</strong>.
                      </p>
                    </div>
                  )}

                  <p className="cmd-instr" style={{ marginTop: 10 }}>
                    Après l&apos;envoi, renseignez votre numéro ci-dessous pour confirmer.
                  </p>

                  {/* Numéro du CLIENT */}
                  <div className="cmd-client-num">
                    <label className="cmd-label" style={{ marginTop: 10 }}>
                      Votre numéro {methodeSel.label} *
                    </label>
                    <input type="tel"
                      className={`cmd-input${orderErrors.numeroPaiement ? ' err' : ''}`}
                      placeholder="Ex : 6XX XX XX XX"
                      value={orderForm.numeroPaiement}
                      onChange={e => setField('numeroPaiement', e.target.value)} />
                    {orderErrors.numeroPaiement && <span className="cmd-err">{orderErrors.numeroPaiement}</span>}
                  </div>
                </div>
              )}

              {/* ══ Bloc info Carte bancaire ══ */}
              {methodeSel?.type === 'carte' && (
                <div className="cmd-pay-box">
                  <div className="cmd-pay-title">💳 Paiement en ligne sécurisé</div>
                  {methodeSel.cle ? (
                    isURL(methodeSel.cle) ? (
                      <>
                        <p className="cmd-instr" style={{ marginBottom: 10 }}>
                          Vous serez redirigé vers la page de paiement sécurisée.
                          Montant : <strong>{formatPrice(montantTotal, devise)}</strong>
                        </p>
                        <a href={methodeSel.cle} target="_blank" rel="noopener noreferrer"
                          className="cmd-stripe-link">
                          <span>🔗</span>
                          <span>Accéder à la page de paiement Stripe</span>
                          <span style={{ marginLeft: 'auto', fontSize: '.8rem', opacity: .6 }}>↗</span>
                        </a>
                        <p className="cmd-instr" style={{ fontSize: '.78rem', marginTop: 6 }}>
                          Redirection automatique après validation.
                        </p>
                      </>
                    ) : (
                      <p className="cmd-instr">
                        Paiement sécurisé par Stripe (Visa, Mastercard, Amex).
                        Montant total : <strong>{formatPrice(montantTotal, devise)}</strong>
                      </p>
                    )
                  ) : (
                    <p className="cmd-instr" style={{ color: 'var(--error-color)' }}>
                      ⚠️ Le paiement par carte n&apos;est pas encore configuré par le vendeur.
                    </p>
                  )}
                </div>
              )}

              {/* ══ Bloc info Cash ══ */}
              {methodeSel?.type === 'cash' && (
                <div className="cmd-pay-box">
                  <div className="cmd-pay-title">💵 Paiement à la réception</div>
                  <p className="cmd-instr">
                    Préparez <strong>{formatPrice(montantTotal, devise)}</strong> en espèces.
                    Règlement au livreur à la réception de votre commande.
                  </p>
                </div>
              )}

              {/* ════ 3 — RÉCAPITULATIF LIVRAISON ════ */}
              {currentProduct && (
                <>
                  <div className="cmd-section-label">📦 Récapitulatif</div>
                  <div className="cmd-liv-box">
                    <div className="cmd-liv-row">
                      <span className="cmd-liv-lbl">Produit</span>
                      <span className="cmd-liv-val">{formatPrice(currentProduct.prix, devise)}</span>
                    </div>
                    <div className="cmd-liv-row">
                      <span className="cmd-liv-lbl">
                        Livraison ({orderForm.ville === 'douala' ? 'Douala' : 'Autre ville'})
                      </span>
                      <span className={`cmd-liv-val${livraison.gratuit ? ' free' : ''}`}>
                        {livraison.gratuit ? 'Gratuite 🎁' : formatPrice(livraison.frais, devise)}
                      </span>
                    </div>
                    <div className="cmd-liv-row">
                      <span className="cmd-liv-lbl">Délai estimé</span>
                      <span className="cmd-liv-val" style={{ fontSize: '.84rem', fontWeight: 600 }}>
                        ⏱ {shopConfig?.livraison?.delai || '2-5 jours ouvrables'}
                      </span>
                    </div>
                    <div className="cmd-liv-div" />
                    <div className="cmd-liv-total">
                      <span className="cmd-liv-total-lbl">Total à payer</span>
                      <span className="cmd-liv-total-val">{formatPrice(montantTotal, devise)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Boutons */}
              <button className="cmd-btn-ok"
                onClick={soumettreCommande}
                disabled={orderLoading || methodesPaiem.length === 0}>
                {orderLoading ? (
                  <><div className="cmd-spinner" /> Traitement en cours...</>
                ) : methodeSel?.type === 'carte' && methodeSel?.cle && isURL(methodeSel.cle) ? (
                  <>💳 Valider &amp; payer en ligne</>
                ) : (
                  <>✅ Valider la commande</>
                )}
              </button>
              <button className="cmd-btn-cancel" onClick={fermerFormCommande}>Annuler</button>

            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL AVERTISSEMENT PAIEMENT — Avant de passer commande
      ================================================================ */}
      <PaymentWarningModal
        isOpen={showPaymentWarning}
        onClose={fermerFormCommande}
        onConfirm={apresAvertissement}
      />

      {/* ================================================================
          BON DE COMMANDE — FACTURE PARTAGEABLE
          Affiché après validation réussie, en remplacement du /payement
      ================================================================ */}
      {bonCommande && (() => {
        const bc = bonCommande;

        // ── Texte brut de la facture pour copier/partager
        const texteFacture = [
          '╔══════════════════════════════╗',
          `║   BON DE COMMANDE ODA        ║`,
          '╚══════════════════════════════╝',
          '',
          `📋 Commande : ${bc.numero}`,
          `📅 Date     : ${bc.date}`,
          `✅ Statut   : En attente de confirmation`,
          '',
          '🏪 BOUTIQUE',
          `   ${bc.boutique.nom}`,
          bc.boutique.telephone ? `   📞 ${bc.boutique.telephone}` : '',
          bc.boutique.email     ? `   ✉️  ${bc.boutique.email}`    : '',
          bc.boutique.adresse   ? `   📍 ${bc.boutique.adresse}`   : '',
          bc.boutique.lien      ? `   🔗 ${bc.boutique.lien}`      : '',
          '',
          '👤 CLIENT',
          `   ${bc.client.nom}`,
          `   📞 ${bc.client.telephone}`,
          `   📍 ${bc.client.adresse}${bc.client.ville ? ' — ' + bc.client.ville : ''}`,
          '',
          '📦 ARTICLES',
          ...bc.produits.map(p => `   • ${p.nom} × ${p.quantite} = ${(p.prix * p.quantite).toLocaleString('fr-FR')} ${bc.devise}`),
          '',
          `💰 Sous-total   : ${bc.montantProduit.toLocaleString('fr-FR')} ${bc.devise}`,
          bc.livraisonGratuite
            ? `🚚 Livraison    : Gratuite 🎁`
            : `🚚 Livraison    : ${bc.fraisLivraison.toLocaleString('fr-FR')} ${bc.devise}`,
          `💳 Paiement     : ${bc.labelPaiement}`,
          '──────────────────────────────',
          `💵 TOTAL        : ${bc.montantTotal.toLocaleString('fr-FR')} ${bc.devise}`,
          '',
          bc.boutique.lien ? `🛍️ Retrouvez la boutique : ${bc.boutique.lien}` : '',
          '',
          'Merci pour votre commande ! 🙏',
        ].filter(l => l !== '').join('\n');

        const copier = async () => {
          try {
            await navigator.clipboard.writeText(texteFacture);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            // fallback
            const el = document.createElement('textarea');
            el.value = texteFacture;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }
        };

        const partager = async () => {
          if (navigator.share) {
            try {
              await navigator.share({
                title: `Bon de commande ${bc.numero} — ${bc.boutique.nom}`,
                text:  texteFacture,
              });
            } catch (e) { if (e.name !== 'AbortError') copier(); }
          } else {
            copier();
          }
        };

        const MODES_LABEL = {
          mtn:    '📞 MTN Mobile Money',
          orange: '🍊 Orange Money',
          carte:  '💳 Carte bancaire',
          cash:   '💵 Paiement à la livraison',
        };

        return (
          <div className="bc-overlay" onClick={e => { if (e.target === e.currentTarget) setBonCommande(null); }}>
            <div className="bc-modal">

              {/* ── En-tête gradient ── */}
              <div className="bc-header">
                <div className="bc-success-ring">✅</div>
                <div className="bc-title">Commande confirmée !</div>
                <div className="bc-numero">{bc.numero} · {bc.date}</div>
              </div>

              <div className="bc-body">

                {/* Statut */}
                <div style={{ textAlign:'center', marginBottom:14 }}>
                  <span className="bc-status">⏳ En attente de confirmation du vendeur</span>
                </div>

                {/* ── Boutique ── */}
                <div className="bc-section">
                  <div className="bc-section-title">🏪 Boutique</div>
                  <div className="bc-row">
                    <span className="bc-label">Nom</span>
                    <span className="bc-value">{bc.boutique.nom}</span>
                  </div>
                  {bc.boutique.telephone && (
                    <div className="bc-row">
                      <span className="bc-label">Téléphone</span>
                      <a href={`tel:${bc.boutique.telephone}`} className="bc-value" style={{ color:'var(--primary-color)' }}>{bc.boutique.telephone}</a>
                    </div>
                  )}
                  {bc.boutique.email && (
                    <div className="bc-row">
                      <span className="bc-label">Email</span>
                      <span className="bc-value">{bc.boutique.email}</span>
                    </div>
                  )}
                  {bc.boutique.adresse && (
                    <div className="bc-row">
                      <span className="bc-label">Adresse</span>
                      <span className="bc-value">{bc.boutique.adresse}</span>
                    </div>
                  )}
                  {bc.boutique.lien && (
                    <a href={bc.boutique.lien} target="_blank" rel="noopener noreferrer" className="bc-boutique-link">
                      <span>🔗</span>
                      <span style={{ flex:1 }}>Accéder à la boutique</span>
                      <span style={{ opacity:.6, fontSize:'.75rem' }}>↗</span>
                    </a>
                  )}
                </div>

                {/* ── Client ── */}
                <div className="bc-section">
                  <div className="bc-section-title">👤 Vos informations</div>
                  <div className="bc-row"><span className="bc-label">Nom</span><span className="bc-value">{bc.client.nom}</span></div>
                  <div className="bc-row"><span className="bc-label">Téléphone</span><span className="bc-value">{bc.client.telephone}</span></div>
                  <div className="bc-row"><span className="bc-label">Adresse</span><span className="bc-value">{bc.client.adresse}</span></div>
                  {bc.client.ville && (
                    <div className="bc-row"><span className="bc-label">Ville</span><span className="bc-value">{bc.client.ville}</span></div>
                  )}
                </div>

                {/* ── Produits ── */}
                <div className="bc-section">
                  <div className="bc-section-title">📦 Articles commandés</div>
                  {bc.produits.map((p, i) => (
                    <div key={i} className="bc-product-line">
                      {p.image && (
                        <img src={p.image} alt={p.nom} className="bc-product-img"
                          onError={e => { e.target.style.display = 'none'; }} />
                      )}
                      <div className="bc-product-info">
                        <div className="bc-product-name">{p.nom} × {p.quantite}</div>
                        <div className="bc-product-price">{(p.prix * p.quantite).toLocaleString('fr-FR')} {bc.devise}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Récapitulatif montants ── */}
                <div className="bc-section">
                  <div className="bc-section-title">💰 Récapitulatif</div>
                  <div className="bc-row">
                    <span className="bc-label">Sous-total</span>
                    <span className="bc-value">{bc.montantProduit.toLocaleString('fr-FR')} {bc.devise}</span>
                  </div>
                  <div className="bc-row">
                    <span className="bc-label">Livraison</span>
                    <span className="bc-value" style={{ color: bc.livraisonGratuite ? 'var(--success-color)' : 'inherit' }}>
                      {bc.livraisonGratuite ? 'Gratuite 🎁' : `${bc.fraisLivraison.toLocaleString('fr-FR')} ${bc.devise}`}
                    </span>
                  </div>
                  <div className="bc-row">
                    <span className="bc-label">Paiement</span>
                    <span className="bc-value">{MODES_LABEL[bc.modePaiement] || bc.labelPaiement}</span>
                  </div>
                  <div className="bc-divider" />
                  <div className="bc-total-row">
                    <span className="bc-total-label">Total à payer</span>
                    <span className="bc-total-val">{bc.montantTotal.toLocaleString('fr-FR')} {bc.devise}</span>
                  </div>
                </div>

              </div>{/* /bc-body */}

              {/* ── Boutons d'action ── */}
              <div className="bc-actions">

                {/* Stripe — si paiement carte avec lien */}
                {bc.stripeLien && (
                  <a href={`${bc.stripeLien}?client_reference_id=${bc.id}`}
                    target="_blank" rel="noopener noreferrer" className="bc-stripe-btn">
                    💳 Payer en ligne via Stripe
                  </a>
                )}

                {/* Partager — ouvre le sélecteur natif de l'OS */}
                <button className="bc-btn-share" onClick={partager}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Partager la facture
                </button>

                {/* Copier le texte brut */}
                <button className={`bc-btn-copy${copied ? ' copied' : ''}`} onClick={copier}>
                  {copied ? '✅ Copié !' : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      Copier la facture
                    </>
                  )}
                </button>

                {/* Fermer */}
                <button className="bc-btn-close" onClick={() => setBonCommande(null)}>
                  Fermer
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── MODAL WHATSAPP AVEC PROPOSITION DE PRIX ── */}
      {showWaModal && (() => {
        const telephone = shopConfig?.general?.telephone?.replace(/\D/g, '') || '';
        const devise = shopConfig?.paiement?.devise || 'FCFA';
        return (
          <div className="report-overlay active" onClick={() => setShowWaModal(false)}>
            <div className="report-sheet" onClick={e => e.stopPropagation()} style={{ padding:'0 0 24px' }}>
              <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 2px' }}>
                <div style={{ width:36, height:4, background:'#E5E5EA', borderRadius:4 }} />
              </div>
              <div style={{ padding:'4px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <h3 style={{ fontSize:'1.05rem', fontWeight:800, margin:0, color:'#1a1a1a' }}>📱 Contacter sur WhatsApp</h3>
                  <button onClick={() => setShowWaModal(false)} style={{ width:30, height:30, borderRadius:'50%', background:'#F2F2F7', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', color:'#666' }}>✕</button>
                </div>
                <div style={{ background:'#F8F8FA', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
                  <div style={{ fontSize:'.78rem', fontWeight:600, color:'#333' }}>{currentProduct?.nom}</div>
                  {currentProduct && <div style={{ fontSize:'.82rem', fontWeight:700, color:'#34C759', marginTop:2 }}>{formatPrice(currentProduct.prix, devise)}</div>}
                </div>
                {shopConfig?.negociation?.prix !== false ? (
                  <>
                    <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                      <input value={waPrixPropose} onChange={e => {
                        const v = e.target.value.replace(/\D/g,'');
                        if (currentProduct?.prix && Number(v) >= Number(currentProduct.prix)) return;
                        setWaPrixPropose(v);
                      }} type="text" inputMode="numeric"
                        placeholder="Votre prix proposé (FCFA)"
                        style={{ flex:1, padding:'11px 14px', borderRadius:10, border:'1.5px solid #eee', fontSize:'.85rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box', background:'#FAFAFA' }}
                      />
                      {currentProduct?.prix && (
                        <div style={{ display:'flex', alignItems:'center', padding:'0 10px', fontSize:'.72rem', color:'#999', fontWeight:500, background:'#F2F2F7', borderRadius:8, whiteSpace:'nowrap' }}>
                          Max: {formatPrice(currentProduct.prix, devise)}
                        </div>
                      )}
                    </div>
                    {waPrixPropose ? (
                      <>
                        <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)} rows={3}
                          style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #eee', fontSize:'.82rem', fontFamily:'inherit', outline:'none', resize:'none', boxSizing:'border-box', marginBottom:10, background:'#FAFAFA' }}
                          placeholder="Votre message..."
                        />
                        <a href={`https://wa.me/${telephone}?text=${encodeURIComponent((waMessage + `\n💰 Mon prix proposé : ${Number(waPrixPropose).toLocaleString('fr-FR')} ${devise}`) + `\n\n🔗 ${window.location.href}`)}`} target="_blank" rel="noopener noreferrer"
                          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'13px', borderRadius:10, background:'#25D366', color:'white', fontWeight:700, fontSize:'.88rem', textDecoration:'none', boxSizing:'border-box' }}
                          onClick={() => setTimeout(() => setShowWaModal(false), 500)}>
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Envoyer sur WhatsApp
                        </a>
                      </>
                    ) : (
                      <div style={{ textAlign:'center', padding:'10px 0', color:'#999', fontSize:'.8rem' }}>
                        Entrez un prix inférieur au prix affiché pour envoyer le message
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ textAlign:'center', padding:'12px', marginBottom:10, background:'#FFF5F5', borderRadius:10, color:'#E53E3E', fontWeight:600, fontSize:'.85rem' }}>
                      💰 Prix non négociable
                    </div>
                    <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)} rows={3}
                      style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #eee', fontSize:'.82rem', fontFamily:'inherit', outline:'none', resize:'none', boxSizing:'border-box', marginBottom:10, background:'#FAFAFA' }}
                      placeholder="Votre message..."
                    />
                    <a href={`https://wa.me/${telephone}?text=${encodeURIComponent((waMessage || `Bonjour, je suis intéressé(e) par ce produit :\n\n📦 ${currentProduct?.nom || ''}\n💰 ${currentProduct ? formatPrice(currentProduct.prix, devise) : ''}`) + `\n\n🔗 ${window.location.href}`)}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'13px', borderRadius:10, background:'#25D366', color:'white', fontWeight:700, fontSize:'.88rem', textDecoration:'none', boxSizing:'border-box' }}
                      onClick={() => setTimeout(() => setShowWaModal(false), 500)}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Contacter sur WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL SIGNALEMENT ── */}
      <div className={`report-overlay${reportOpen ? ' active' : ''}`} onClick={() => setReportOpen(false)}>
        <div className="report-sheet" onClick={e => e.stopPropagation()}>
          <div className="report-header">
            <h3>🚩 Signaler ce produit</h3>
            <button className="report-close" onClick={() => setReportOpen(false)}>✕</button>
          </div>
          <div className="report-body">
            <p className="report-product-label">{currentProduct?.nom || ''}</p>
            <div className="report-reasons">
              {[
                { value: 'contenu_inapproprie', label: 'Contenu inapproprié' },
                { value: 'arnaque', label: 'Arnaque / Fraude' },
                { value: 'produit_interdit', label: 'Produit interdit' },
                { value: 'fausse_description', label: 'Fausse description' },
                { value: 'autre', label: 'Autre' },
              ].map(r => (
                <label key={r.value} className="report-reason">
                  <input type="radio" name="reportReasonProd" value={r.value} checked={reportReason === r.value} onChange={() => setReportReason(r.value)} />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
            <textarea className="report-comment" placeholder="Décrivez le problème (optionnel)..." value={reportComment} onChange={e => setReportComment(e.target.value)} rows={3} />
          </div>
          <div className="report-footer">
            <button className="report-btn-cancel" onClick={() => setReportOpen(false)}>Annuler</button>
            <button className="report-btn-submit" onClick={submitReportProduit} disabled={reportLoading || !reportReason}>
              {reportLoading ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ==================== EXPORT ====================
export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ position: 'fixed', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ width: 50, height: 50, border: '4px solid #E5E7EB', borderTopColor: '#FF6B00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 16, color: '#6B7280' }}>Chargement...</p>
        </div>
      }
    >
      <ProduitDetail />
    </Suspense>
  );
}