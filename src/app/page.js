

'use client';

import { useEffect, useRef, useState } from 'react';
import TermsModal from '@/components/ui/TermsModal';


const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap');

  :root {
    --white:      #ffffff;
    --off-white:  #F8F6F2;
    --grey-50:    #F5F5F5;
    --grey-100:   #EBEBEB;
    --grey-200:   #D6D6D6;
    --grey-400:   #9E9E9E;
    --grey-700:   #444444;
    --grey-900:   #1A1A1A;
    --gold:       #D4920A;
    --gold-light: #F2B72B;
    --gold-pale:  #FFF8E7;
    --terra:      #C4622D;
    --terra-pale: #FFF1EB;
    --green:      #007A5E;
    --green-pale: #E6F5F1;
    --red-cm:     #CE1126;
    --shadow-sm:  0 2px 8px rgba(0,0,0,0.06);
    --shadow-md:  0 8px 32px rgba(0,0,0,0.10);
    --shadow-lg:  0 20px 60px rgba(0,0,0,0.13);
    --radius-xl:  24px;
    --radius-lg:  16px;
    --radius-md:  12px;
    --radius-sm:  8px;
    --font-head:  'Playfair Display', serif;
    --font-body:  'Sora', sans-serif;
  }

  *, *::before, *::after {
    margin: 0; padding: 0; box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--white);
    color: var(--grey-900);
    font-family: var(--font-body);
    overflow-x: hidden;
    padding-bottom: 48px;
  }
  img { display: block; max-width: 100%; }
  a { text-decoration: none; color: inherit; }

  /* ── Scroll Reveal ── */
  .sr   { opacity:0; transform:translateY(28px); transition: opacity .6s ease, transform .6s ease; }
  .sr-l { opacity:0; transform:translateX(-36px); transition: opacity .65s ease, transform .65s ease; }
  .sr-r { opacity:0; transform:translateX(36px);  transition: opacity .65s ease, transform .65s ease; }
  .sr-z { opacity:0; transform:scale(.9);          transition: opacity .6s ease, transform .6s ease; }
  .in   { opacity:1 !important; transform:none !important; }

  /* ── Loader ── */
  #loader {
    position: fixed; inset: 0; z-index: 9999;
    background: var(--white);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 18px;
    transition: opacity 0.5s ease;
  }
  .loader-logo {
    width: 70px; height: 70px;
    border-radius: 18px; overflow: hidden;
    box-shadow: var(--shadow-md);
    background: var(--gold-pale);
    display: flex; align-items: center; justify-content: center;
    animation: logoPulse 1.4s ease-in-out infinite alternate;
  }
  .loader-logo img { width: 100%; height: 100%; object-fit: cover; }
  .loader-bar { width: 120px; height: 3px; background: var(--grey-100); border-radius: 2px; overflow: hidden; }
  .loader-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold), var(--terra));
    border-radius: 2px;
    animation: loadFill 1.4s ease-in-out infinite;
  }
  @keyframes logoPulse { from { transform: scale(1); } to { transform: scale(1.05); } }
  @keyframes loadFill {
    0%   { width: 0%;   margin-left: 0; }
    50%  { width: 100%; margin-left: 0; }
    100% { width: 0%;   margin-left: 100%; }
  }
  .loader-label {
    font-family: var(--font-body); font-size: 0.72rem; font-weight: 600;
    letter-spacing: 3px; text-transform: uppercase; color: var(--grey-400);
  }

  /* ── Header ── */
  header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--grey-100);
    padding: 0 20px; height: 62px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .logo-wrap { display: flex; align-items: center; gap: 10px; }
  .logo-img {
    width: 38px; height: 38px; border-radius: 10px; overflow: hidden;
    background: var(--gold-pale);
    display: flex; align-items: center; justify-content: center;
  }
  .logo-img img { width: 100%; height: 100%; object-fit: cover; }
  .logo-text { font-family: var(--font-head); font-size: 1.25rem; font-weight: 900; color: var(--grey-900); }
  .logo-text span { color: var(--gold); }
  .logo-badge {
    background: var(--green); color: #fff;
    font-size: 0.58rem; font-weight: 700;
    padding: 2px 7px; border-radius: 20px;
    letter-spacing: 0.8px; text-transform: uppercase;
  }
  .header-actions { display: flex; align-items: center; gap: 10px; }
  .btn-install-header {
    background: linear-gradient(135deg, var(--gold) 0%, var(--terra) 100%);
    color: #fff; border: none; border-radius: 30px; padding: 9px 18px;
    font-family: var(--font-body); font-size: 0.78rem; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    box-shadow: 0 4px 16px rgba(212,146,10,0.3); transition: all 0.3s;
  }
  .btn-install-header:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,146,10,0.45); }
  .cm-chip {
    display: flex; align-items: center; gap: 5px;
    background: var(--grey-50); border: 1px solid var(--grey-100);
    border-radius: 30px; padding: 5px 11px;
    font-size: 0.72rem; font-weight: 600; color: var(--grey-700);
  }

  /* ── Hero ── */
  .hero { padding-top: 62px; min-height: 100svh; display: flex; flex-direction: column; position: relative; overflow: hidden; }
  .hero-bg-pattern {
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 60% 40% at 80% 20%, rgba(212,146,10,0.07) 0%, transparent 70%),
      radial-gradient(ellipse 50% 50% at 10% 80%, rgba(196,98,45,0.06) 0%, transparent 70%);
  }
  .hero-top {
    position: relative; z-index: 1; flex: 1;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    padding: 44px 22px 0;
  }
  .hero-pill {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--gold-pale); border: 1px solid rgba(212,146,10,0.25);
    border-radius: 30px; padding: 6px 14px;
    font-size: 0.73rem; font-weight: 700; color: var(--gold);
    letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 20px;
  }
  .live-dot { width: 7px; height: 7px; background: var(--green); border-radius: 50%; animation: blink 1.4s ease-in-out infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .hero-title {
    font-family: var(--font-head); font-size: clamp(2.2rem, 9vw, 3.8rem);
    font-weight: 900; line-height: 1.1; color: var(--grey-900); margin-bottom: 16px;
  }
  .hero-title .accent { color: var(--gold); }
  .hero-title .accent-terra { color: var(--terra); }
  .hero-sub { font-size: 0.98rem; color: var(--grey-400); max-width: 320px; line-height: 1.75; margin-bottom: 28px; font-weight: 400; }
  .hero-cta-group { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 360px; margin-bottom: 36px; }
  .btn-primary {
    width: 100%; background: linear-gradient(135deg, var(--gold) 0%, var(--terra) 100%);
    color: #fff; border: none; border-radius: var(--radius-xl); padding: 18px 28px;
    font-family: var(--font-body); font-size: 1rem; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    box-shadow: 0 10px 36px rgba(212,146,10,0.35); transition: all 0.35s ease;
    position: relative; overflow: hidden;
  }
  .btn-primary::after {
    content: ''; position: absolute;
    top: -50%; left: -60%; width: 55%; height: 200%;
    background: rgba(255,255,255,0.18); transform: skewX(-20deg); transition: left 0.5s ease;
  }
  .btn-primary:hover::after { left: 120%; }
  .btn-primary:hover { transform: translateY(-4px); box-shadow: 0 18px 52px rgba(212,146,10,0.50); }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary {
    width: 100%; background: var(--white); color: var(--grey-700);
    border: 1.5px solid var(--grey-200); border-radius: var(--radius-xl);
    padding: 16px 28px; font-family: var(--font-body); font-size: 0.95rem; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px; transition: all 0.3s;
  }
  .btn-secondary:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-pale); }
  .pulse-dot {
    position: absolute; top: -3px; right: -3px;
    width: 12px; height: 12px; background: var(--green); border-radius: 50%; border: 2px solid #fff;
  }
  .pulse-dot::after {
    content: ''; position: absolute; inset: -4px; border-radius: 50%;
    background: var(--green); opacity: 0; animation: pulseWave 1.8s ease-out infinite;
  }
  @keyframes pulseWave { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }

  /* ── Stories ── */
  .stories-section { width: 100%; padding: 0 18px; margin-bottom: 8px; position: relative; z-index: 1; }
  .stories-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--grey-400); margin-bottom: 12px; }
  .stories-track { display: flex; gap: 16px; overflow-x: auto; padding: 6px 2px 12px; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .stories-track::-webkit-scrollbar { display: none; }
  .story-item { display: flex; flex-direction: column; align-items: center; gap: 7px; scroll-snap-align: start; cursor: pointer; flex-shrink: 0; }
  .story-ring {
    width: 66px; height: 66px; border-radius: 50%; padding: 2.5px;
    background: conic-gradient(var(--gold) 0deg, var(--terra) 90deg, var(--green) 180deg, var(--gold) 360deg);
    transition: transform 0.3s;
  }
  .story-ring:hover { transform: scale(1.08); }
  .story-ring.g-green { background: conic-gradient(var(--green) 0deg, #00BFA5 180deg, var(--green) 360deg); }
  .story-ring.g-terra { background: conic-gradient(var(--terra) 0deg, #FF8A65 180deg, var(--terra) 360deg); }
  .story-ring.g-red   { background: conic-gradient(var(--red-cm) 0deg, #EF5350 180deg, var(--red-cm) 360deg); }
  .story-avatar {
    width: 100%; height: 100%; border-radius: 50%; background: var(--grey-100);
    border: 2.5px solid var(--white); display: flex; align-items: center; justify-content: center;
    font-size: 1.7rem; overflow: hidden;
  }
  .story-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .story-name { font-size: 0.64rem; font-weight: 600; color: var(--grey-400); max-width: 66px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* ── Marquee ── */
  .marquee-wrap { overflow: hidden; background: var(--grey-900); margin: 36px 0; padding: 13px 0; }
  .marquee-track { display: flex; animation: marqueeAnim 22s linear infinite; white-space: nowrap; }
  .marquee-item { padding: 0 26px; font-size: 0.85rem; font-weight: 700; color: var(--gold); display: flex; align-items: center; gap: 10px; letter-spacing: 0.5px; }
  .marquee-item .sep { color: var(--terra); font-size: 1rem; }
  @keyframes marqueeAnim { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

  /* ── Market Visual ── */
  .market-visual {
    position: relative; z-index: 1; margin: 0 18px 40px;
    border-radius: var(--radius-xl); overflow: hidden; height: 260px;
    background: var(--grey-100); display: flex; align-items: center; justify-content: center;
    box-shadow: var(--shadow-md);
  }
  .market-visual img { width: 100%; height: 100%; object-fit: cover; }
  .market-visual-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--grey-400); }
  .market-visual-placeholder span { font-size: 3rem; }
  .market-visual-placeholder p { font-size: 0.78rem; font-weight: 600; text-align: center; max-width: 180px; }
  .market-badge {
    position: absolute; bottom: 18px; left: 18px;
    background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
    border-radius: var(--radius-lg); padding: 12px 16px;
    display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-md);
  }
  .market-badge-icon { font-size: 1.6rem; }
  .market-badge-num { font-family: var(--font-head); font-size: 1.2rem; font-weight: 900; color: var(--grey-900); }
  .market-badge-label { font-size: 0.7rem; color: var(--grey-400); font-weight: 500; }

  /* ── Section wrap & Bento ── */
  .section-wrap { padding: 0 18px; margin-bottom: 44px; }
  .section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20px; }
  .section-overline { font-size: 0.68rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--terra); margin-bottom: 4px; }
  .section-title { font-family: var(--font-head); font-size: 1.65rem; font-weight: 700; line-height: 1.2; color: var(--grey-900); }
  .section-link { color: var(--gold); font-size: 0.82rem; font-weight: 600; border-bottom: 1px solid rgba(212,146,10,0.3); padding-bottom: 2px; transition: color 0.3s; }
  .section-link:hover { color: var(--terra); }
  .bento { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .bento-card {
    background: var(--white); border: 1.5px solid var(--grey-100);
    border-radius: var(--radius-lg); padding: 20px 16px;
    display: flex; flex-direction: column; gap: 12px;
    transition: all 0.3s; position: relative; overflow: hidden; box-shadow: var(--shadow-sm);
  }
  .bento-card:hover { border-color: var(--gold); transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .bento-card.span-2 { grid-column: 1/-1; flex-direction: row; align-items: center; }
  .bento-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .bento-card.c-gold::before  { background: linear-gradient(90deg, var(--gold), var(--gold-light)); }
  .bento-card.c-terra::before { background: linear-gradient(90deg, var(--terra), #FF8A65); }
  .bento-card.c-green::before { background: linear-gradient(90deg, var(--green), #00BFA5); }
  .bento-card.c-red::before   { background: linear-gradient(90deg, var(--red-cm), #FF7043); }
  .bento-icon-wrap { width: 48px; height: 48px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
  .bento-icon-wrap.bg-gold  { background: var(--gold-pale); }
  .bento-icon-wrap.bg-terra { background: var(--terra-pale); }
  .bento-icon-wrap.bg-green { background: var(--green-pale); }
  .bento-icon-wrap.bg-red   { background: #FFF0F0; }
  .bento-label { font-size: 0.63rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--grey-400); margin-bottom: 1px; }
  .bento-title { font-size: 0.97rem; font-weight: 700; color: var(--grey-900); margin-bottom: 3px; }
  .bento-desc  { font-size: 0.81rem; color: var(--grey-400); line-height: 1.6; }

  /* ── Gallery ── */
  .gallery-section { margin-bottom: 44px; }
  .gallery-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 180px 180px; gap: 10px; padding: 0 18px; }
  .gallery-cell {
    border-radius: var(--radius-lg); overflow: hidden; background: var(--grey-100);
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--shadow-sm); position: relative;
  }
  .gallery-cell img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
  .gallery-cell:hover img { transform: scale(1.05); }
  .gallery-cell.tall { grid-row: 1 / 3; }
  .gallery-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--grey-200); }
  .gallery-placeholder span { font-size: 2.2rem; }
  .gallery-placeholder p { font-size: 0.68rem; font-weight: 600; text-align: center; max-width: 90px; }
  .gallery-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 30px 12px 12px; background: linear-gradient(to top, rgba(0,0,0,0.55), transparent); font-size: 0.72rem; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }

  /* ── Boutiques ── */
  .shops-track { display: flex; gap: 14px; overflow-x: auto; padding: 6px 18px 18px; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .shops-track::-webkit-scrollbar { display: none; }
  .shop-card {
    min-width: 220px; border-radius: var(--radius-lg); background: var(--white);
    border: 1.5px solid var(--grey-100); overflow: hidden; scroll-snap-align: start;
    flex-shrink: 0; transition: all 0.35s; box-shadow: var(--shadow-sm); cursor: pointer;
  }
  .shop-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: var(--gold); }
  .shop-img { width: 100%; height: 150px; background: var(--grey-100); display: flex; align-items: center; justify-content: center; font-size: 3.5rem; overflow: hidden; position: relative; }
  .shop-img img { width:100%; height:100%; object-fit:cover; transition: transform 0.5s; }
  .shop-card:hover .shop-img img { transform: scale(1.06); }
  .shop-badge { position: absolute; top: 10px; left: 10px; background: var(--white); border-radius: 20px; padding: 3px 10px; font-size: 0.62rem; font-weight: 700; color: var(--gold); letter-spacing: 0.5px; text-transform: uppercase; box-shadow: var(--shadow-sm); }
  .shop-info { padding: 14px; }
  .shop-name { font-size: 0.95rem; font-weight: 700; color: var(--grey-900); margin-bottom: 3px; }
  .shop-meta { font-size: 0.77rem; color: var(--grey-400); font-weight: 500; }
  .shop-rating { display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; background: var(--gold-pale); border-radius: 20px; padding: 3px 9px; font-size: 0.72rem; font-weight: 700; color: var(--gold); }

  /* ── Install Banner ── */
  .install-banner {
    margin: 0 18px 44px; background: var(--grey-900); border-radius: var(--radius-xl);
    padding: 32px 24px; text-align: center; position: relative; overflow: hidden;
  }
  .install-banner::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; background: radial-gradient(circle, rgba(212,146,10,0.18) 0%, transparent 70%); }
  .install-banner::after  { content: ''; position: absolute; bottom: -60px; left: -40px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(196,98,45,0.14) 0%, transparent 70%); }
  .install-banner-img {
    width: 100px; height: 100px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold-pale), var(--terra-pale));
    margin: 0 auto 18px; display: flex; align-items: center; justify-content: center;
    font-size: 3rem; border: 3px solid rgba(212,146,10,0.25); position: relative; z-index: 1; overflow: hidden;
  }
  .install-banner-img img { width:100%; height:100%; object-fit:cover; }
  .install-banner h2 { font-family: var(--font-head); font-size: 1.5rem; font-weight: 700; color: var(--white); margin-bottom: 10px; line-height: 1.25; position: relative; z-index: 1; }
  .install-banner p { color: rgba(255,255,255,0.55); font-size: 0.87rem; line-height: 1.65; margin-bottom: 22px; position: relative; z-index: 1; }
  .install-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 24px; position: relative; z-index: 1; }
  .install-tag { background: rgba(212,146,10,0.12); border: 1px solid rgba(212,146,10,0.22); border-radius: 20px; padding: 5px 13px; font-size: 0.72rem; font-weight: 600; color: var(--gold-light); }
  .btn-install-big {
    width: 100%; background: linear-gradient(135deg, var(--gold), var(--terra));
    color: #fff; border: none; border-radius: var(--radius-lg); padding: 17px;
    font-family: var(--font-body); font-size: 1rem; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    box-shadow: 0 10px 36px rgba(212,146,10,0.4); transition: all 0.3s; position: relative; z-index: 1;
  }
  .btn-install-big:hover { transform: translateY(-3px); box-shadow: 0 18px 50px rgba(212,146,10,0.55); }

  /* ── Stats ── */
  .stats-section { padding: 0 18px; margin-bottom: 44px; }
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat-card {
    background: var(--white); border: 1.5px solid var(--grey-100);
    border-radius: var(--radius-lg); padding: 22px 16px; text-align: center;
    box-shadow: var(--shadow-sm); transition: all 0.3s;
  }
  .stat-card:hover { border-color: var(--gold); transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .stat-card.span-2 { grid-column: 1/-1; }
  .stat-icon { font-size: 1.6rem; margin-bottom: 8px; }
  .stat-num {
    font-family: var(--font-head); font-size: 2rem; font-weight: 900;
    background: linear-gradient(135deg, var(--gold), var(--terra));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin-bottom: 4px;
  }
  .stat-label { font-size: 0.77rem; color: var(--grey-400); font-weight: 500; }

  /* ── Témoignages ── */
  .testi-track { display: flex; gap: 14px; overflow-x: auto; padding: 6px 18px 18px; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .testi-track::-webkit-scrollbar { display: none; }
  .testi-card {
    min-width: 270px; max-width: 290px; background: var(--white);
    border: 1.5px solid var(--grey-100); border-radius: var(--radius-lg);
    padding: 20px 18px; flex-shrink: 0; scroll-snap-align: start;
    display: flex; flex-direction: column; gap: 12px;
    position: relative; overflow: hidden; transition: all 0.3s; box-shadow: var(--shadow-sm);
  }
  .testi-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--gold); }
  .testi-card::before { content: '"'; position: absolute; top: -8px; right: 12px; font-family: var(--font-head); font-size: 5.5rem; color: var(--gold); opacity: 0.07; line-height: 1; pointer-events: none; }
  .testi-card::after { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px; border-radius: var(--radius-lg) 0 0 var(--radius-lg); }
  .testi-card.v-douala::after    { background: var(--gold); }
  .testi-card.v-yaounde::after   { background: var(--green); }
  .testi-card.v-bafoussam::after { background: var(--terra); }
  .testi-card.v-kribi::after     { background: var(--red-cm); }
  .testi-stars { display: flex; gap: 2px; }
  .testi-star  { font-size: 0.82rem; }
  .testi-text { font-size: 0.85rem; color: var(--grey-700); line-height: 1.7; font-style: italic; flex: 1; }
  .testi-text strong { color: var(--gold); font-style: normal; }
  .testi-user { display: flex; align-items: center; gap: 11px; border-top: 1px solid var(--grey-100); padding-top: 12px; }
  .testi-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--grey-100); border: 2px solid var(--grey-100); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; overflow: hidden; }
  .testi-avatar img { width:100%; height:100%; object-fit:cover; }
  .testi-name { font-size: 0.85rem; font-weight: 700; color: var(--grey-900); }
  .testi-loc  { font-size: 0.72rem; color: var(--grey-400); font-weight: 500; }

  /* ── Rating bars ── */
  .rating-section { padding: 0 18px; margin-bottom: 44px; }
  .rating-box { background: var(--white); border: 1.5px solid var(--grey-100); border-radius: var(--radius-xl); padding: 24px; display: flex; flex-direction: column; gap: 20px; box-shadow: var(--shadow-sm); }
  .rating-main { display: flex; align-items: center; gap: 16px; }
  .rating-big { font-family: var(--font-head); font-size: 3.2rem; font-weight: 900; color: var(--grey-900); }
  .rating-sub { display: flex; flex-direction: column; gap: 4px; }
  .rating-stars { display: flex; gap: 4px; font-size: 1.1rem; }
  .rating-total { font-size: 0.77rem; color: var(--grey-400); font-weight: 500; }
  .rating-bars { display: flex; flex-direction: column; gap: 8px; }
  .testi-bar-row { display: flex; align-items: center; gap: 10px; }
  .testi-bar-label { font-size: 0.75rem; font-weight: 600; color: var(--grey-700); width: 14px; }
  .testi-bar-bg { flex: 1; height: 6px; background: var(--grey-100); border-radius: 3px; overflow: hidden; }
  .testi-bar-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-light)); border-radius: 3px; width: 0; transition: width 1.2s ease; }
  .testi-bar-pct { font-size: 0.7rem; font-weight: 600; color: var(--grey-400); width: 32px; text-align: right; }

  /* ── Footer ── */
  .footer { background: var(--grey-900); padding: 36px 22px 28px; margin-bottom: 0; }
  .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
  .footer-logo-img { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .footer-logo-img img { width:100%; height:100%; object-fit:cover; }
  .footer-logo-name { font-family: var(--font-head); font-size: 1.1rem; font-weight: 900; color: var(--white); }
  .footer-logo-name span { color: var(--gold); }
  .footer-desc { font-size: 0.83rem; color: rgba(255,255,255,0.45); line-height: 1.65; margin-bottom: 24px; }
  .footer-links { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 22px; }
  .footer-link { color: rgba(255,255,255,0.55); font-size: 0.8rem; font-weight: 500; transition: color 0.2s; }
  .footer-link:hover { color: var(--gold); }
  .footer-flags { display: flex; gap: 10px; margin-bottom: 24px; }
  .footer-flag-chip { display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.06); border-radius: 20px; padding: 5px 11px; font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.55); }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; font-size: 0.72rem; color: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: space-between; }

  /* ── Mega CTA ── */
  .mega-cta-wrap { padding: 0 18px; margin: 44px 0; }
  .mega-cta {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    background: var(--grey-900); border-radius: var(--radius-xl); padding: 26px 28px;
    text-decoration: none; position: relative; overflow: hidden;
    box-shadow: 0 16px 48px rgba(26,26,26,0.25);
    transition: transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s ease;
    user-select: none; -webkit-user-select: none;
  }
  .mega-cta::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(212,146,10,0.18) 0%, rgba(196,98,45,0.12) 50%, transparent 100%); pointer-events: none; }
  .mega-cta::after  { content: ''; position: absolute; top: -40%; right: -10%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(212,146,10,0.14) 0%, transparent 70%); pointer-events: none; }
  .mega-cta:hover { transform: translateY(-5px); box-shadow: 0 28px 64px rgba(26,26,26,0.35); }
  .mega-cta.pressing { transform: scale(0.964) translateY(2px) !important; box-shadow: 0 4px 18px rgba(26,26,26,0.22) !important; transition: transform 0.12s ease, box-shadow 0.12s ease !important; }
  .ripple-wave { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.18); pointer-events: none; transform: scale(0); animation: rippleExpand 0.65s cubic-bezier(0,0.55,0.45,1) forwards; z-index: 10; }
  @keyframes rippleExpand { 0% { transform: scale(0); opacity: 1; } 60% { transform: scale(4); opacity: 0.5; } 100% { transform: scale(8); opacity: 0; } }
  .mega-cta-flash { position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(135deg, rgba(212,146,10,0.35), rgba(196,98,45,0.2)); pointer-events: none; opacity: 0; animation: flashGold 0.5s ease forwards; z-index: 9; }
  @keyframes flashGold { 0% { opacity: 0.9; } 100% { opacity: 0; } }
  .emoji-burst { position: absolute; font-size: 1.4rem; pointer-events: none; z-index: 20; animation: emojiPop 0.9s cubic-bezier(0.23,1,0.32,1) forwards; }
  @keyframes emojiPop { 0% { transform: translate(0,0) scale(0.4) rotate(0deg); opacity: 1; } 60% { opacity: 1; } 100% { transform: translate(var(--ex),var(--ey)) scale(1.1) rotate(var(--er)); opacity: 0; } }
  .mega-cta-left { position: relative; z-index: 1; }
  .mega-cta-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(212,146,10,0.18); border: 1px solid rgba(212,146,10,0.3); border-radius: 20px; padding: 4px 12px; font-size: 0.68rem; font-weight: 700; color: var(--gold-light); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 10px; }
  .mega-cta-title { font-family: var(--font-head); font-size: 1.55rem; font-weight: 900; color: var(--white); line-height: 1.2; margin-bottom: 6px; }
  .mega-cta-sub { font-size: 0.8rem; color: rgba(255,255,255,0.5); font-weight: 500; }
  .mega-cta-arrow { position: relative; z-index: 1; width: 58px; height: 58px; flex-shrink: 0; background: linear-gradient(135deg, var(--gold), var(--terra)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 8px 24px rgba(212,146,10,0.4); transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .mega-cta:hover .mega-cta-arrow { transform: scale(1.12) rotate(12deg); box-shadow: 0 12px 32px rgba(212,146,10,0.55); }
  .mega-cta.pressing .mega-cta-arrow { transform: scale(0.88) rotate(-5deg); box-shadow: 0 3px 10px rgba(212,146,10,0.3); }
  .mega-cta-live-row { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 12px; padding: 0 4px; }
  .mega-cta-visitor { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 600; color: var(--grey-400); }
  .mega-cta-visitor .vdot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; animation: blink 1.4s ease-in-out infinite; }
  .mega-cta-sep { color: var(--grey-200); font-size: 0.7rem; }

  /* ── Comments ── */
  .comments-section { padding: 0 18px; margin-bottom: 44px; }
  .comments-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .comments-overline { font-size: 0.68rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--terra); margin-bottom: 4px; }
  .comments-title { font-family: var(--font-head); font-size: 1.45rem; font-weight: 700; color: var(--grey-900); }
  .comments-live-pill { display: inline-flex; align-items: center; gap: 6px; background: #FEF2F2; border: 1px solid rgba(206,17,38,0.15); border-radius: 20px; padding: 5px 13px; font-size: 0.7rem; font-weight: 700; color: var(--red-cm); }
  .comments-feed { display: flex; flex-direction: column; gap: 10px; }
  .comment-bubble { background: var(--white); border: 1.5px solid var(--grey-100); border-radius: 18px; border-bottom-left-radius: 4px; padding: 14px 16px; box-shadow: var(--shadow-sm); opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .comment-bubble.visible { opacity: 1; transform: translateY(0); }
  .comment-bubble.right { border-bottom-left-radius: 18px; border-bottom-right-radius: 4px; background: var(--gold-pale); border-color: rgba(212,146,10,0.2); align-self: flex-end; }
  .comment-header { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; }
  .comment-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--grey-100); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; overflow: hidden; }
  .comment-avatar img { width:100%; height:100%; object-fit:cover; }
  .comment-author { font-size: 0.82rem; font-weight: 700; color: var(--grey-900); }
  .comment-time   { font-size: 0.68rem; color: var(--grey-400); }
  .comment-stars { font-size: 0.8rem; margin-bottom: 5px; }
  .comment-text  { font-size: 0.83rem; color: var(--grey-700); line-height: 1.6; }
  .comment-text strong { color: var(--gold); }
  .comment-product-tag { display: inline-flex; align-items: center; gap: 5px; background: var(--grey-50); border: 1px solid var(--grey-100); border-radius: 20px; padding: 3px 10px; font-size: 0.7rem; font-weight: 600; color: var(--grey-700); margin-top: 8px; }
  .new-comment-notif { position: fixed; bottom: 20px; left: 16px; right: 16px; z-index: 600; background: var(--white); border: 1.5px solid var(--grey-100); border-radius: var(--radius-lg); padding: 12px 15px; display: flex; align-items: center; gap: 11px; box-shadow: var(--shadow-lg); transform: translateY(130px); opacity: 0; transition: transform 0.45s cubic-bezier(.16,1,.3,1), opacity 0.45s ease; }
  .new-comment-notif.show { transform: translateY(0); opacity: 1; }
  .new-comment-notif-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; flex-shrink: 0; animation: blink 1.2s ease-in-out infinite; }
  .new-comment-notif-body { flex: 1; }
  .new-comment-notif-title { font-size: 0.78rem; font-weight: 700; color: var(--grey-900); }
  .new-comment-notif-sub   { font-size: 0.68rem; color: var(--grey-400); margin-top: 1px; }
  .new-comment-notif-stars { font-size: 0.72rem; }
  .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 12px 16px; background: var(--grey-50); border: 1.5px solid var(--grey-100); border-radius: 18px; border-bottom-left-radius: 4px; width: fit-content; }
  .typing-dot { width: 7px; height: 7px; background: var(--grey-400); border-radius: 50%; animation: typingBounce 1.2s ease-in-out infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

  /* ── Ticker ── */
  .ticker-section { margin-bottom: 44px; }
  .ticker-header { display: flex; align-items: center; justify-content: space-between; padding: 0 18px; margin-bottom: 14px; }
  .ticker-live-badge { display: inline-flex; align-items: center; gap: 6px; background: #FEF2F2; border: 1px solid rgba(206,17,38,0.2); border-radius: 20px; padding: 5px 13px; font-size: 0.7rem; font-weight: 700; color: var(--red-cm); letter-spacing: 0.5px; text-transform: uppercase; }
  .ticker-live-dot { width: 7px; height: 7px; background: var(--red-cm); border-radius: 50%; animation: blink 1s ease-in-out infinite; }
  .ticker-count { font-size: 0.75rem; color: var(--grey-400); font-weight: 500; }
  .ticker-row { overflow: hidden; margin-bottom: 10px; }
  .ticker-track { display: flex; gap: 12px; animation: tickerSlide 28s linear infinite; }
  .ticker-track.reverse { animation: tickerSlideReverse 32s linear infinite; }
  .ticker-track:hover { animation-play-state: paused; }
  @keyframes tickerSlide        { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes tickerSlideReverse { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
  .ticker-card { flex-shrink: 0; width: 160px; background: var(--white); border: 1.5px solid var(--grey-100); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.25s; }
  .ticker-card:hover { border-color: var(--gold); transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .ticker-card-img { width: 100%; height: 110px; background: var(--grey-50); display: flex; align-items: center; justify-content: center; font-size: 2.8rem; position: relative; overflow: hidden; }
  .ticker-card-img img { width:100%; height:100%; object-fit:cover; transition: transform 0.4s; }
  .ticker-card:hover .ticker-card-img img { transform: scale(1.08); }
  .ticker-sold-badge { position: absolute; top: 6px; right: 6px; background: rgba(0,122,94,0.9); color: #fff; font-size: 0.58rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; letter-spacing: 0.3px; }
  .ticker-hot-badge  { position: absolute; top: 6px; left: 6px; background: var(--red-cm); color: #fff; font-size: 0.58rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
  .ticker-card-body { padding: 10px 10px 12px; }
  .ticker-card-name  { font-size: 0.78rem; font-weight: 700; color: var(--grey-900); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ticker-card-shop  { font-size: 0.66rem; color: var(--grey-400); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ticker-card-price { font-family: var(--font-head); font-size: 0.95rem; font-weight: 900; color: var(--terra); }
  .ticker-card-stars { font-size: 0.62rem; color: var(--gold); margin-top: 3px; }

  /* ── Live Notif ── */
  .live-notif-wrap { position: fixed; bottom: 20px; left: 16px; right: 16px; z-index: 500; pointer-events: none; }
  .live-notif { background: var(--white); border: 1.5px solid var(--grey-100); border-radius: var(--radius-lg); padding: 12px 16px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-lg); transform: translateY(120px); transition: transform 0.45s cubic-bezier(.16,1,.3,1), opacity 0.45s ease; opacity: 0; pointer-events: all; }
  .live-notif.show { transform: translateY(0); opacity: 1; }
  .live-notif-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--gold-pale); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
  .live-notif-text { flex: 1; }
  .live-notif-title { font-size: 0.8rem; font-weight: 700; color: var(--grey-900); margin-bottom: 2px; }
  .live-notif-sub   { font-size: 0.7rem; color: var(--grey-400); }
  .live-notif-price { font-family: var(--font-head); font-size: 0.9rem; font-weight: 900; color: var(--terra); flex-shrink: 0; }
`;

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
      {/* ── Styles globaux injectés ── */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ════════════════════════════════════════════
          LOADER
      ════════════════════════════════════════════ */}
      <div id="loader">
        <div className="loader-logo">
          <img src="/images/oda.png" alt="ODA Market" onError={e => { e.target.parentElement.innerHTML = '🛍️'; }} />
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
            <img src="/images/icon-192x192.png" alt="ODA Market" onError={e => { e.target.parentElement.innerHTML = '🛍️'; }} />
          </div>
          <span className="logo-text">ODA <span>Market</span></span>
          <span className="logo-badge">CM 🇨🇲</span>
        </div>
        <div className="header-actions">
          <div className="cm-chip">🇨🇲 Cameroun</div>
          <button className="btn-install-header" onClick={handleInstall}>
            ⬇️ Installer
          </button>
        </div>
      </header>

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
              <img src="/images/icon-livraison.png" style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt="" />
            </div>
            <div>
              <p className="bento-label">Logistique</p>
              <p className="bento-title">Livraison rapide</p>
              <p className="bento-desc">Partout au Cameroun en moins de 48h.</p>
            </div>
          </div>
          <div className="bento-card c-green sr-r">
            <div className="bento-icon-wrap bg-green">
              <img src="/images/icon-paiement.png" style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt="" />
            </div>
            <div>
              <p className="bento-label">Paiement</p>
              <p className="bento-title">MTN &amp; Orange</p>
              <p className="bento-desc">Mobile Money sécurisé, zéro frais cachés.</p>
            </div>
          </div>
          <div className="bento-card c-terra sr-l">
            <div className="bento-icon-wrap bg-terra">
              <img src="/images/icon-vendeuses.png" style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt="" />
            </div>
            <div>
              <p className="bento-label">Communauté</p>
              <p className="bento-title">Vendeuses vérifiées</p>
              <p className="bento-desc">820+ boutiques locales contrôlées.</p>
            </div>
          </div>
          <div className="bento-card c-red sr-r">
            <div className="bento-icon-wrap bg-red">
              <img src="/images/icon-secure.png" style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt="" />
            </div>
            <div>
              <p className="bento-label">Sécurité</p>
              <p className="bento-title">Achat protégé</p>
              <p className="bento-desc">Remboursement garanti si problème.</p>
            </div>
          </div>
          <div className="bento-card c-gold span-2 sr">
            <div className="bento-icon-wrap bg-gold">
              <img src="/images/oda.png" style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt="" />
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
          <img src="/images/oda.png" alt="Vendeuse ODA Market" />
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
            <img src="/images/icon-192x192.png" alt="ODA Market" onError={e => { e.target.parentElement.innerHTML = '🛍️'; }} />
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
