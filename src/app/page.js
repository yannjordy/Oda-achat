'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/Header';
import TermsModal from '@/components/ui/TermsModal';


// ── Données produits ──────────────────────────────────────────────────────────
const PRODUCTS = [
  { name: 'Robe Wax Kente',      shop: 'Wax & Style',      price: '8 500 F',  icon: '👗', hot: true,  sold: '42 vendus' },
  { name: 'Huile de Coco Bio',   shop: 'Beauté Naturelle', price: '3 200 F',  icon: '🥥', hot: false, sold: '89 vendus' },
  { name: 'Ndolé épicé 500g',    shop: 'Mama Koki',        price: '2 800 F',  icon: '🥗', hot: true,  sold: '127 vendus' },
  { name: 'Bijoux Perles',       shop: 'Art du Cameroun',  price: '4 000 F',  icon: '📿', hot: false, sold: '31 vendus' },
  { name: 'Pagne Traditionnel',  shop: 'Fleur Wax Douala', price: '6 500 F',  icon: '🧵', hot: true,  sold: '56 vendus' },
  { name: 'Savon Karité CM',     shop: 'Beauté Naturelle', price: '1 500 F',  icon: '🧼', hot: false, sold: '204 vendus' },
  { name: 'Statue Bamiléké',     shop: 'Art du Cameroun',  price: '12 000 F', icon: '🗿', hot: false, sold: '18 vendus' },
  { name: 'Épices Yaoundé Mix',  shop: 'Mama Koki',        price: '1 800 F',  icon: '🌶️', hot: true,  sold: '93 vendus' },
  { name: 'Tissu Bogolan',       shop: 'Wax & Style',      price: '5 500 F',  icon: '🎨', hot: true,  sold: '37 vendus' },
  { name: 'Crème Cacao Pur',     shop: 'Beauté Naturelle', price: '2 500 F',  icon: '✨', hot: false, sold: '61 vendus' },
  { name: 'Vannerie Artisanale', shop: 'Art du Cameroun',  price: '3 800 F',  icon: '🧺', hot: false, sold: '22 vendus' },
  { name: 'Sauce Tomate CM',     shop: 'Mama Koki',        price: '900 F',    icon: '🍅', hot: true,  sold: '315 vendus' },
];

// ── Données notifications live achat ─────────────────────────────────────────
const NOTIF_DATA = [
  { icon: '👗', title: 'Robe Wax Kente achetée', sub: 'Il y a 12s · Douala, Akwa',      price: '8 500 F' },
  { icon: '🥥', title: 'Huile de Coco achetée',  sub: 'Il y a 28s · Yaoundé, Bastos',   price: '3 200 F' },
  { icon: '🧵', title: 'Pagne Traditionnel',      sub: 'Il y a 45s · Bafoussam',         price: '6 500 F' },
  { icon: '🌶️', title: 'Épices Yaoundé Mix',     sub: 'Il y a 1 min · Douala, Bali',    price: '1 800 F' },
  { icon: '🧼', title: 'Savon Karité acheté',     sub: 'Il y a 2 min · Kribi',           price: '1 500 F' },
  { icon: '📿', title: 'Bijoux Perles achetés',   sub: 'Il y a 3 min · Douala, Bonanjo', price: '4 000 F' },
  { icon: '🍅', title: 'Sauce Tomate CM',         sub: 'Il y a 4 min · Ngaoundéré',      price: '900 F' },
  { icon: '🎨', title: 'Tissu Bogolan acheté',    sub: 'Il y a 5 min · Bamenda',         price: '5 500 F' },
];


export default function OdaMarketPage() {
  const notifIdxRef       = useRef(null);
  const notifTimerRef     = useRef(null);
  const [showTerms, setShowTerms] = useState(false);

  // ── 1. Loader ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    loader.style.opacity = '0';
    const t = setTimeout(() => { loader.style.display = 'none'; }, 500);
    return () => clearTimeout(t);
  }, []);

  // ── 3. Scroll Reveal Animations ──────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll('.sr, .sr-l, .sr-r, .sr-z');
    const onScroll = () => {
      els.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 70) {
          el.classList.add('in');
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const t = setTimeout(onScroll, 100);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(t);
    };
  }, []);

  // ── 4. Compteurs Stats animés ────────────────────────────────────────────
  useEffect(() => {
    const counters = [
      { id: 'cntUsers',   target: 15400, suffix: '+' },
      { id: 'cntSellers', target: 820,   suffix: '+' },
      { id: 'cntOrders',  target: 32000, suffix: '+' },
    ];
    const animateCounter = (el, target, suffix) => {
      const duration = 2000;
      const start    = performance.now();
      const step = ts => {
        const progress = Math.min((ts - start) / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        const value    = Math.floor(ease * target);
        el.textContent = value >= 1000
          ? (value / 1000).toFixed(1) + 'k' + suffix
          : value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const statObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counters.forEach(({ id, target, suffix }) => {
            const el = document.getElementById(id);
            if (el) animateCounter(el, target, suffix);
          });
          statObs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    const firstStat = document.getElementById('cntUsers');
    if (firstStat) {
      const grid = firstStat.closest('.stats-grid');
      if (grid) statObs.observe(grid);
    }
    return () => statObs.disconnect();
  }, []);


  useEffect(() => {
    const barsContainer = document.getElementById('ratingBars');
    if (!barsContainer) return;
    const barsObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.testi-bar-fill').forEach(bar => {
            setTimeout(() => { bar.style.width = bar.getAttribute('data-w'); }, 200);
          });
          barsObs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    barsObs.observe(barsContainer);
    return () => barsObs.disconnect();
  }, []);

  // ── 6. Ticker produits (2 rangées, défilement infini) ───────────────────
  useEffect(() => {
    const buildTickerCard = (p) => `
      <a href="achats" class="ticker-card">
        <div class="ticker-card-img">
          ${p.icon}
          ${p.hot ? '<div class="ticker-hot-badge">🔥 Tendance</div>' : ''}
          <div class="ticker-sold-badge">${p.sold}</div>
        </div>
        <div class="ticker-card-body">
          <div class="ticker-card-name">${p.name}</div>
          <div class="ticker-card-shop">${p.shop}</div>
          <div class="ticker-card-price">${p.price}</div>
          <div class="ticker-card-stars">⭐⭐⭐⭐⭐</div>
        </div>
      </a>`;

    const row1 = document.getElementById('tickerRow1');
    const row2 = document.getElementById('tickerRow2');
    if (!row1 || !row2) return;

    const set1  = PRODUCTS.slice(0, 8);
    row1.innerHTML = [...set1, ...set1].map(buildTickerCard).join('');

    const set2  = PRODUCTS.slice(4);
    row2.innerHTML = [...set2, ...set2].map(buildTickerCard).join('');

    // Compteur live — incrémente doucement toutes les 8 s
    let count = 147;
    const tickerInterval = setInterval(() => {
      count += Math.floor(Math.random() * 3);
      const el = document.getElementById('tickerCount');
      if (el) el.textContent = `🔥 ${count} achats aujourd'hui`;
    }, 8000);

    return () => clearInterval(tickerInterval);
  }, []);

  // ── 7. Notifications live achats ────────────────────────────────────────
  useEffect(() => {
    const showNextNotif = () => {
      const el    = document.getElementById('liveNotif');
      const icon  = document.getElementById('notifIcon');
      const title = document.getElementById('notifTitle');
      const sub   = document.getElementById('notifSub');
      const price = document.getElementById('notifPrice');
      if (!el) return;
      const data = NOTIF_DATA[notifIdxRef.current % NOTIF_DATA.length];
      notifIdxRef.current++;
      icon.textContent  = data.icon;
      title.textContent = data.title;
      sub.textContent   = data.sub;
      price.textContent = data.price;
      el.classList.add('show');
      setTimeout(() => { el.classList.remove('show'); }, 3800);
    };

    const startLoop = () => {
      const firstTimeout = setTimeout(() => {
        showNextNotif();
        notifTimerRef.current = setInterval(showNextNotif, 9000);
      }, 6000);
      return firstTimeout;
    };

    const firstTimeout = startLoop();
    return () => {
      clearTimeout(firstTimeout);
      if (notifTimerRef.current) clearInterval(notifTimerRef.current);
    };
  }, []);

  // ── 8. Mega CTA — ripple, pressing, emoji burst ──────────────────────────
  useEffect(() => {
    const EMOJIS = ['🛍️', '✨', '🎉', '🔥', '💫'];

    const addEffects = (ctaEl) => {
      if (!ctaEl) return;

      const handlePress = (e) => {
        ctaEl.classList.add('pressing');

        // Coordonnées
        const rect = ctaEl.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Ripple
        const size   = Math.max(rect.width, rect.height);
        const ripple = document.createElement('div');
        ripple.className  = 'ripple-wave';
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;`;
        ctaEl.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);

        // Flash doré
        const flash = document.createElement('div');
        flash.className = 'mega-cta-flash';
        ctaEl.appendChild(flash);
        setTimeout(() => flash.remove(), 500);

        // Explosion d'émojis
        for (let i = 0; i < 5; i++) {
          const emoji = document.createElement('div');
          emoji.className   = 'emoji-burst';
          emoji.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
          const angle = Math.random() * 360;
          const dist  = 40 + Math.random() * 60;
          emoji.style.setProperty('--ex', `${Math.cos(angle * Math.PI / 180) * dist}px`);
          emoji.style.setProperty('--ey', `${Math.sin(angle * Math.PI / 180) * dist}px`);
          emoji.style.setProperty('--er', `${-90 + Math.random() * 180}deg`);
          emoji.style.left = `${x}px`;
          emoji.style.top  = `${y}px`;
          ctaEl.appendChild(emoji);
          setTimeout(() => emoji.remove(), 900);
        }

        setTimeout(() => ctaEl.classList.remove('pressing'), 220);
      };

      ctaEl.addEventListener('mousedown',  handlePress);
      ctaEl.addEventListener('touchstart', handlePress, { passive: true });

      return () => {
        ctaEl.removeEventListener('mousedown',  handlePress);
        ctaEl.removeEventListener('touchstart', handlePress);
      };
    };

    const cta1    = document.getElementById('mainCta');
    const cta2    = document.getElementById('mainCta2');
    const clean1  = addEffects(cta1);
    const clean2  = addEffects(cta2);

    return () => {
      if (clean1) clean1();
      if (clean2) clean2();
    };
  }, []);

  // ── 9. Compteurs visiteurs / paniers actifs (live fictif) ───────────────
  useEffect(() => {
    let visitors = 214;
    let carts    = 38;

    const updateCounts = () => {
      visitors = Math.max(180, visitors + Math.floor(Math.random() * 5) - 1);
      carts    = Math.max(20,  carts    + Math.floor(Math.random() * 3) - 1);
      const v1 = document.getElementById('visitorCount');
      const v2 = document.getElementById('visitorCount2');
      const c  = document.getElementById('cartCount');
      if (v1) v1.textContent = `${visitors} visiteurs actifs`;
      if (v2) v2.textContent = `${visitors} visiteurs actifs`;
      if (c)  c.textContent  = `${carts} paniers en cours`;
    };

    const interval = setInterval(updateCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── 10. Apparition automatique des bulles de commentaires ───────────────
  useEffect(() => {
    const bubbles = document.querySelectorAll('.comment-bubble');
    bubbles.forEach((bubble, i) => {
      setTimeout(() => bubble.classList.add('visible'), 300 + i * 250);
    });
  }, []);

  // ── 10. PWA — utilise window.installPWA exposé par ServiceWorkerRegistration
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  function isStandalone() {
    return window.navigator.standalone === true ||
           window.matchMedia('(display-mode: standalone)').matches;
  }
  function handleInstall() {
    if (isStandalone()) return;
    if (window.installPWA) {
      window.installPWA();
    }
  }

  return (
    <>
      {/* ── Styles globaux injectés ── */}{/* ════════════════════════════════════════════
          LOADER
      ════════════════════════════════════════════ */}
      <div id="loader">
        <div className="loader-logo">
          <img src="/images/oda-logo.png" alt="ODA Market" width="70" height="70" />
        </div>
        <div className="loader-bar">
          <div className="loader-bar-fill"></div>
        </div>
        <p className="loader-label">Chargement…</p>
      </div>

      {/* ════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════ */}
      <header>
        <div className="logo-wrap">
          <div className="logo-img">
            <img src="/images/oda-logo.png" alt="ODA Market" width="38" height="38" />
          </div>
          <span className="logo-text">ODA <span>Market</span></span>
          <span className="logo-badge">CM 🇨🇲</span>
        </div>
      </header>
      {/* ════════════════════════════════════════
          HEADER
      ════════════════════════════════════════ */}
      <Header variant="default" showInstall={true} />


      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg-pattern"></div>

        <div className="hero-top">
          <div className="hero-pill sr">
            <span className="live-dot"></span>
            Marketplace active au Cameroun
          </div>

          <h1 className="hero-title sr">
            Le marché <span className="accent">africain</span><br />
            dans votre <span className="accent-terra">poche</span>
          </h1>

          <p className="hero-sub sr">
            Achetez, vendez et découvrez les meilleures boutiques de Douala, Yaoundé
            et de tout le Cameroun — simplement, depuis votre téléphone.
          </p>

          <div className="hero-cta-group sr">
            <button className="btn-primary" onClick={handleInstall} style={{ position: 'relative' }}>
              <span className="pulse-dot"></span>
              ⬇️ Télécharger l'application
            </button>
            <a href="achats" className="btn-secondary">
              🛍️ Explorer les produits
            </a>
          </div>

          {/* Stories vendeurs */}
          <div className="stories-section sr">
            <p className="stories-label">Vendeuses populaires</p>
            <div className="stories-track">
              <div className="story-item">
                <div className="story-ring">
                  <div className="story-avatar">👩🏾</div>
                </div>
                <span className="story-name">Mama Béa</span>
              </div>
              <div className="story-item">
                <div className="story-ring g-green">
                  <div className="story-avatar">👩🏿</div>
                </div>
                <span className="story-name">Awa Style</span>
              </div>
              <div className="story-item">
                <div className="story-ring g-terra">
                  <div className="story-avatar">👩🏾</div>
                </div>
                <span className="story-name">Fleur Wax</span>
              </div>
              <div className="story-item">
                <div className="story-ring g-red">
                  <div className="story-avatar">👩🏿</div>
                </div>
                <span className="story-name">Mireille B.</span>
              </div>
              <div className="story-item">
                <div className="story-ring">
                  <div className="story-avatar">👩🏾</div>
                </div>
                <span className="story-name">Solange K.</span>
              </div>
              <div className="story-item">
                <div className="story-ring g-green">
                  <div className="story-avatar">👩🏿</div>
                </div>
                <span className="story-name">Henriette</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {

      }
      <div className="marquee-wrap">
        <div className="marquee-track">
          {['Douala','Yaoundé','Bafoussam','Garoua','Bamenda','Kribi','Limbé','Ngaoundéré','Edéa',
            'Douala','Yaoundé','Bafoussam','Garoua','Bamenda','Kribi','Limbé','Ngaoundéré','Edéa'].map((v, i) => (
            <div key={i} className="marquee-item">
              📍 {v} <span className="sep">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          TICKER — VENTES EN DIRECT
      ════════════════════════════════════════════ */}
      <section className="ticker-section">
        <div className="ticker-header">
          <div className="ticker-live-badge">
            <span className="ticker-live-dot"></span>
            Ventes en direct
          </div>
          <span className="ticker-count" id="tickerCount">🔥 147 achats aujourd'hui</span>
        </div>
        <div className="ticker-row">
          <div className="ticker-track" id="tickerRow1"></div>
        </div>
        <div className="ticker-row">
          <div className="ticker-track reverse" id="tickerRow2"></div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          IMAGE MARCHÉ PRINCIPALE
      ════════════════════════════════════════════ */}
      <div className="market-visual sr">
        <img src="/images/marche-femmes.jpg" alt="Marché africain Cameroun" />
        <div className="market-visual-placeholder">
          <span></span>
          <p></p>
        </div>
        <div className="market-badge">
          <div className="market-badge-icon">🛒</div>
          <div className="market-badge-text">
            <div className="market-badge-num">+32k</div>
            <div className="market-badge-label">commandes livrées</div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          SECTION POURQUOI ODA — BENTO
      ════════════════════════════════════════════ */}
      <section className="section-wrap" id="pourquoi">
        <div className="section-head">
          <div>
            <p className="section-overline">Nos avantages</p>
            <h2 className="section-title">Pourquoi choisir<br />ODA Market ?</h2>
          </div>
          <a href="boutiques.html" className="section-link">Voir tout</a>
        </div>
        <div className="bento">
          <div className="bento-card c-gold sr-l">
            <div className="bento-icon-wrap bg-gold">
<img src="/images/icon-livraison.svg" width="32" height="32" alt="" />  
            </div>
            <div>
              <p className="bento-label">Logistique</p>
              <p className="bento-title">Livraison rapide</p>
              <p className="bento-desc">Partout au Cameroun en moins de 48h.</p>
            </div>
          </div>
          <div className="bento-card c-green sr-r">
            <div className="bento-icon-wrap bg-green">
<img src="/images/icon-paiement.svg" width="32" height="32" alt="" />  
            </div>
            <div>
              <p className="bento-label">Paiement</p>
              <p className="bento-title">MTN &amp; Orange</p>
              <p className="bento-desc">Mobile Money sécurisé, zéro frais cachés.</p>
            </div>
          </div>
          <div className="bento-card c-terra sr-l">
            <div className="bento-icon-wrap bg-terra">
<img src="/images/icon-vendeuses.svg" width="32" height="32" alt="" />  
            </div>
            <div>
              <p className="bento-label">Communauté</p>
              <p className="bento-title">Vendeuses vérifiées</p>
              <p className="bento-desc">820+ boutiques locales contrôlées.</p>
            </div>
          </div>
          <div className="bento-card c-red sr-r">
            <div className="bento-icon-wrap bg-red">
<img src="/images/icon-secure.svg" width="32" height="32" alt="" />  
            </div>
            <div>
              <p className="bento-label">Sécurité</p>
              <p className="bento-title">Achat protégé</p>
              <p className="bento-desc">Remboursement garanti si problème.</p>
            </div>
          </div>
          <div className="bento-card c-gold span-2 sr">
            <div className="bento-icon-wrap bg-gold">
<img src="/images/oda-logo.svg" width="32" height="32" alt="" />  
            </div>
            <div>
              <p className="bento-label">Application</p>
              <p className="bento-title">Disponible hors connexion</p>
              <p className="bento-desc">Installez ODA Market et utilisez-le même sans internet. Votre boutique toujours disponible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          GALERIE — PHOTOS MARCHÉ
      ════════════════════════════════════════════ */}
      <section className="gallery-section">
        <div className="section-wrap">
          <div className="section-head">
            <div>
              <p className="section-overline">Activités</p>
              <h2 className="section-title">Le marché camerounais<br />en images</h2>
            </div>
          </div>
        </div>
        <div className="gallery-grid">
          <div className="gallery-cell tall sr-l">
            <img src="/images/femme-marche-1.jpg" alt="Femme au marché Douala" />
            <div className="gallery-placeholder">
              <span></span>
              <p>Photo femme marché (grande)</p>
            </div>
            <div className="gallery-caption">Marché de Douala</div>
          </div>
          <div className="gallery-cell sr-r">
            <img src="/images/femme-marche-2.jpg" alt="Vendeuse tissu wax" />
            <div className="gallery-placeholder">
              <span></span>
              <p>Photo tissu wax</p>
            </div>
            <div className="gallery-caption">Pagnes &amp; Wax</div>
          </div>
          <div className="gallery-cell sr-r" style={{ transitionDelay: '.15s' }}>
            <img src="/images/femme-marche-3.jpg" alt="Produits locaux camerounais" />
            <div className="gallery-placeholder">
              <span></span>
              <p>Photo produits locaux</p>
            </div>
            <div className="gallery-caption">Produits locaux</div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BOUTIQUES POPULAIRES
      ════════════════════════════════════════════ */}
      <section className="section-wrap" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div style={{ padding: '0 18px' }}>
          <div className="section-head">
            <div>
              <p className="section-overline">Tendances</p>
              <h2 className="section-title">Boutiques populaires</h2>
            </div>
            <a href="achats" className="section-link">Tout voir</a>
          </div>
        </div>
        <div className="shops-track">
          <div className="shop-card sr-z">
            <div className="shop-img">
              <img src="/images/boutique-wax.jpg" alt="Mode Africaine" />
              <div className="shop-badge">Mode</div>
            </div>
            <div className="shop-info">
              <p className="shop-name">Wax &amp; Style Douala</p>
              <p className="shop-meta">Pagnes, robes, accessoires</p>
              <div className="shop-rating">⭐ 4.9 · 240 avis</div>
            </div>
          </div>
          <div className="shop-card sr-z" style={{ transitionDelay: '.1s' }}>
            <div className="shop-img">
              <img src="/images/boutique-cosmetique.jpg" alt="Cosmétiques africains" />
              <div className="shop-badge">Beauté</div>
            </div>
            <div className="shop-info">
              <p className="shop-name">Beauté Naturelle CM</p>
              <p className="shop-meta">Cosmétiques naturels bio</p>
              <div className="shop-rating">⭐ 4.8 · 186 avis</div>
            </div>
          </div>
          <div className="shop-card sr-z" style={{ transitionDelay: '.2s' }}>
            <div className="shop-img">
              <img src="/images/boutique-alimentaire.jpg" alt="Produits alimentaires" />
              <div className="shop-badge">Alimentation</div>
            </div>
            <div className="shop-info">
              <p className="shop-name">Mama Koki Yaoundé</p>
              <p className="shop-meta">Épices, légumes, condiments</p>
              <div className="shop-rating">⭐ 4.9 · 312 avis</div>
            </div>
          </div>
          <div className="shop-card sr-z" style={{ transitionDelay: '.3s' }}>
            <div className="shop-img">
              <img src="/images/boutique-artisanat.jpg" alt="Artisanat camerounais" />
              <div className="shop-badge">Artisanat</div>
            </div>
            <div className="shop-info">
              <p className="shop-name">Art du Cameroun</p>
              <p className="shop-meta">Statues, bijoux, vannerie</p>
              <div className="shop-rating">⭐ 4.7 · 95 avis</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          MEGA CTA — PARCOURIR LES PRODUITS
      ════════════════════════════════════════════ */}
      <div className="mega-cta-wrap sr">
        <a href="achats" className="mega-cta" id="mainCta">
          <div className="mega-cta-left">
            <div className="mega-cta-tag">
              <span className="live-dot"></span>
              Marketplace active
            </div>
            <div className="mega-cta-title">Parcourir tous<br />les produits</div>
            <div className="mega-cta-sub">Mode · Beauté · Alimentation · Artisanat…</div>
          </div>
          <div className="mega-cta-arrow">🛍️</div>
        </a>
        <div className="mega-cta-live-row">
          <div className="mega-cta-visitor">
            <span className="vdot"></span>
            <span id="visitorCount">214 visiteurs actifs</span>
          </div>
          <span className="mega-cta-sep">·</span>
          <div className="mega-cta-visitor">🛒 <span id="cartCount">38 paniers en cours</span></div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════ */}
      <section className="stats-section">
        <div className="section-head" style={{ padding: '0 0 16px' }}>
          <div>
            <p className="section-overline">ODA en chiffres</p>
            <h2 className="section-title">Une communauté<br />qui grandit</h2>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card sr-l">
            <div className="stat-icon">👥</div>
            <div className="stat-num" id="cntUsers">0</div>
            <div className="stat-label">Utilisateurs actifs</div>
          </div>
          <div className="stat-card sr-r">
            <div className="stat-icon">🏪</div>
            <div className="stat-num" id="cntSellers">0</div>
            <div className="stat-label">Boutiques ouvertes</div>
          </div>
          <div className="stat-card span-2 sr">
            <div className="stat-icon">📦</div>
            <div className="stat-num" id="cntOrders">0</div>
            <div className="stat-label">Commandes livrées avec succès</div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BANNER INSTALL PWA
      ════════════════════════════════════════════ */}
      <div className="install-banner sr">
        <div className="install-banner-img">
<img src="/images/oda-logo.svg" alt="ODA Market" width="100" height="100" />  
        </div>
        <h2>Votre boutique,<br />partout avec vous</h2>
        <p>Téléchargez ODA Market et gérez vos ventes, suivez vos commandes, et développez votre commerce même hors connexion.</p>
        <div className="install-tags">
          <span className="install-tag">🚀 Gratuit</span>
          <span className="install-tag">📶 Hors ligne</span>
          <span className="install-tag">🔔 Notifications</span>
          <span className="install-tag">💳 Mobile Money</span>
        </div>
        <button className="btn-install-big" onClick={handleInstall}>
          ⬇️ Installer ODA Market gratuitement
        </button>
      </div>

      {/* ════════════════════════════════════════════
          TÉMOIGNAGES
      ════════════════════════════════════════════ */}
      <section className="section-wrap" style={{ paddingLeft: 0, paddingRight: 0, marginBottom: 0 }}>
        <div style={{ padding: '0 18px 16px' }}>
          <div className="section-head">
            <div>
              <p className="section-overline">Témoignages</p>
              <h2 className="section-title">Ce que disent<br />nos utilisateurs</h2>
            </div>
          </div>
        </div>
        <div className="testi-track">
          <div className="testi-card v-douala sr-z">
            <div className="testi-stars">⭐⭐⭐⭐⭐</div>
            <p className="testi-text">
              Depuis que j'utilise <strong>ODA Market</strong>, mes ventes ont doublé. Je reçois mes commandes directement sur mon téléphone. C'est vraiment révolutionnaire !
            </p>
            <div className="testi-user">
              <div className="testi-avatar">👩🏾</div>
              <div>
                <p className="testi-name">Marie-Claire N.</p>
                <p className="testi-loc">📍 Douala, Akwa</p>
              </div>
            </div>
          </div>
          <div className="testi-card v-yaounde sr-z" style={{ transitionDelay: '.1s' }}>
            <div className="testi-stars">⭐⭐⭐⭐⭐</div>
            <p className="testi-text">
              La livraison était rapide et le produit exactement comme sur la photo. Le paiement MTN Money était simple et <strong>sécurisé</strong>. Je recommande.
            </p>
            <div className="testi-user">
              <div className="testi-avatar">👨🏿</div>
              <div>
                <p className="testi-name">Patrick Awana</p>
                <p className="testi-loc">📍 Yaoundé, Bastos</p>
              </div>
            </div>
          </div>
          <div className="testi-card v-bafoussam sr-z" style={{ transitionDelay: '.2s' }}>
            <div className="testi-stars">⭐⭐⭐⭐⭐</div>
            <p className="testi-text">
              Je vends mes pagnes wax depuis Bafoussam et je livre dans tout le pays. <strong>ODA Market</strong> m'a ouvert des portes inimaginables. Merci !
            </p>
            <div className="testi-user">
              <div className="testi-avatar">👩🏿</div>
              <div>
                <p className="testi-name">Awa Fongang</p>
                <p className="testi-loc">📍 Bafoussam</p>
              </div>
            </div>
          </div>
          <div className="testi-card v-kribi sr-z" style={{ transitionDelay: '.3s' }}>
            <div className="testi-stars">⭐⭐⭐⭐⭐</div>
            <p className="testi-text">
              Les produits de la mer que je vends à Kribi partent maintenant à Yaoundé et Douala grâce à <strong>ODA</strong>. Un vrai marché numérique camerounais.
            </p>
            <div className="testi-user">
              <div className="testi-avatar">👩🏾</div>
              <div>
                <p className="testi-name">Solange Ebongue</p>
                <p className="testi-loc">📍 Kribi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          RATING BARS
      ════════════════════════════════════════════ */}
      <section className="rating-section" style={{ marginTop: '24px' }}>
        <div className="rating-box" id="ratingBars">
          <div className="rating-main">
            <div className="rating-big">4.9</div>
            <div className="rating-sub">
              <div className="rating-stars">⭐⭐⭐⭐⭐</div>
              <p className="rating-total">Basé sur 2 847 avis</p>
            </div>
          </div>
          <div className="rating-bars">
            {[
              { star: 5, pct: '88%' },
              { star: 4, pct: '8%' },
              { star: 3, pct: '2%' },
              { star: 2, pct: '1%' },
              { star: 1, pct: '1%' },
            ].map(({ star, pct }) => (
              <div key={star} className="testi-bar-row">
                <span className="testi-bar-label">{star}</span>
                <div className="testi-bar-bg">
                  <div className="testi-bar-fill" data-w={pct}></div>
                </div>
                <span className="testi-bar-pct">{pct}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          COMMENTAIRES LIVE
      ════════════════════════════════════════════ */}
      <section className="comments-section">
        <div className="comments-head">
          <div className="comments-title-group">
            <p className="comments-overline">Activité récente</p>
            <h2 className="comments-title">Ce que les gens<br />disent en ce moment</h2>
          </div>
          <div className="comments-live-pill">
            <span className="ticker-live-dot"></span>
            Live
          </div>
        </div>

        <div className="comments-feed" id="commentsFeed">
          {/* Commentaire 1 — utilisateur (gauche) */}
          <div className="comment-bubble">
            <div className="comment-header">
              <div className="comment-avatar">👩🏾</div>
              <div className="comment-meta">
                <div className="comment-author">Marie-Claire N. · Douala</div>
                <div className="comment-time">Il y a 3 minutes</div>
              </div>
            </div>
            <div className="comment-stars">⭐⭐⭐⭐⭐</div>
            <div className="comment-text">
              J'ai reçu ma commande en moins de 24h ! <strong>Qualité impeccable</strong>, exactement comme sur les photos. Je recommande vivement !
            </div>
            <div className="comment-product-tag">👗 Robe Wax Kente · 8 500 F</div>
          </div>

          {/* Indicateur frappe */}
          <div className="typing-indicator" id="typingIndicator" style={{ display: 'none' }}>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>

          {/* Commentaire 2 — vendeur (droite) */}
          <div className="comment-bubble right">
            <div className="comment-header">
              <div className="comment-avatar">👩🏿</div>
              <div className="comment-meta">
                <div className="comment-author">Awa Fongang · Boutique Wax&amp;Style</div>
                <div className="comment-time">Il y a 5 minutes</div>
              </div>
            </div>
            <div className="comment-text">
              Merci Marie-Claire 🙏 Votre satisfaction est notre priorité ! Revenez quand vous voulez, <strong>de nouveaux pagnes arrivent cette semaine</strong> 🎁
            </div>
          </div>

          {/* Commentaire 3 (gauche) */}
          <div className="comment-bubble">
            <div className="comment-header">
              <div className="comment-avatar">👨🏿</div>
              <div className="comment-meta">
                <div className="comment-author">Patrick A. · Yaoundé</div>
                <div className="comment-time">Il y a 8 minutes</div>
              </div>
            </div>
            <div className="comment-stars">⭐⭐⭐⭐⭐</div>
            <div className="comment-text">
              Le paiement <strong>MTN Mobile Money</strong> était ultra rapide. J'ai payé et 2 min après j'ai reçu la confirmation. Application top !
            </div>
            <div className="comment-product-tag">🌶️ Épices Yaoundé Mix · 1 800 F</div>
          </div>

          {/* Zone injection commentaires live JS */}
          <div id="liveCommentsZone"></div>
        </div>
      </section>

      {/* Notification nouveau commentaire */}
      <div className="new-comment-notif" id="newCommentNotif">
        <div className="new-comment-notif-dot"></div>
        <div className="new-comment-notif-body">
          <div className="new-comment-notif-title" id="ncTitle">Nouveau commentaire</div>
          <div className="new-comment-notif-sub"   id="ncSub">il y a quelques secondes</div>
          <div className="new-comment-notif-stars" id="ncStars">⭐⭐⭐⭐⭐</div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="footer" style={{ marginTop: '44px' }}>
        <div className="footer-logo">
          <div className="footer-logo-img">
            <img src="/images/oda-logo.svg" alt="ODA Market" width="38" height="38" />
          </div>
          <span className="footer-logo-name">ODA <span>Market</span></span>
        </div>
        <p className="footer-desc">
          La marketplace N°1 du Cameroun. Achetez et vendez facilement, partout au pays, en toute confiance.
        </p>
        <div className="footer-flags">
          <div className="footer-flag-chip">🇨🇲 Cameroun</div>
          <div className="footer-flag-chip">🌍 Made in Africa</div>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">À propos</a>
          <a href="#" className="footer-link">Vendre sur ODA</a>
          <a href="#" className="footer-link">Aide &amp; Support</a>
          <a href="#" className="footer-link">Politique de confidentialité</a>
          <a href="#" className="footer-link" onClick={e => { e.preventDefault(); setShowTerms(true); }}>Conditions d'utilisation</a>
        </div>
        <div className="footer-bottom">
          <span>© 2025 ODA Market. Tous droits réservés.</span>
          <span>🇨🇲 Douala, Cameroun</span>
        </div>
      </footer>

      {/* ════════════════════════════════════════════
          MEGA CTA 2 — VOIR TOUS LES PRODUITS
      ════════════════════════════════════════════ */}
      <div className="mega-cta-wrap sr">
        <a href="achats" className="mega-cta" id="mainCta2">
          <div className="mega-cta-left">
            <div className="mega-cta-tag">
              <span className="live-dot"></span>
              +820 boutiques disponibles
            </div>
            <div className="mega-cta-title">Voir tous<br />les produits</div>
            <div className="mega-cta-sub">Livraison partout au Cameroun 🇨🇲</div>
          </div>
          <div className="mega-cta-arrow">→</div>
        </a>
        <div className="mega-cta-live-row">
          <div className="mega-cta-visitor">
            <span className="vdot"></span>
            <span id="visitorCount2">214 visiteurs actifs</span>
          </div>
          <span className="mega-cta-sep">·</span>
          <div className="mega-cta-visitor">🔥 <span>Dernière commande il y a 2 min</span></div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          NOTIFICATION LIVE ACHAT (popup flottant)
      ════════════════════════════════════════════ */}
      <div className="live-notif-wrap">
        <div className="live-notif" id="liveNotif">
          <div className="live-notif-icon" id="notifIcon">🛍️</div>
          <div className="live-notif-text">
            <div className="live-notif-title" id="notifTitle">Quelqu'un vient d'acheter</div>
            <div className="live-notif-sub"   id="notifSub">Il y a quelques secondes · Douala</div>
          </div>
          <div className="live-notif-price" id="notifPrice">2 500 F</div>
        </div>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
}
