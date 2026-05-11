
'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';


const GLOBAL_CSS = `
:root {
  --primary:#FF6B00;--primary-dark:#D45B00;--primary-glow:rgba(255,107,0,.4);
  --primary-soft:rgba(255,107,0,.12);--bg:#0C0E14;--bg-2:#13161F;
  --bg-card:#181C28;--surface:#1E2235;--surface-2:#252A3E;
  --border:rgba(255,255,255,.07);--border-accent:rgba(255,107,0,.35);
  --text-1:#F0F4FF;--text-2:#8896B3;--text-3:#4A556B;
  --gold:#F5A623;--silver:#9BB3CC;--bronze:#C47D4A;
  --success:#00D68F;--error:#FF4D6D;--snap-yellow:#FFFC00;
  --story-ring-1:#FF6B00;--story-ring-2:#FF9500;
  --radius-s:10px;--radius-m:16px;--radius-l:22px;--radius-xl:30px;--radius-full:9999px;
  --hdr-h:112px;--font-display:'Syne',sans-serif;--font-body:'DM Sans',sans-serif;
  --ease-bounce:cubic-bezier(.34,1.56,.64,1);--ease-out:cubic-bezier(.4,0,.2,1);
  --t-fast:.18s var(--ease-out);--t-norm:.28s var(--ease-out);--t-bounce:.38s var(--ease-bounce);
  --shadow-card:0 8px 32px rgba(0,0,0,.5);--shadow-glow:0 0 30px var(--primary-glow);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;-webkit-font-smoothing:antialiased;}
html{scroll-behavior:smooth;overflow-x:hidden;}
body{font-family:var(--font-body);background:var(--bg);color:var(--text-1);min-height:100vh;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom,20px);}
a{text-decoration:none;color:inherit;}
/* PAGE LOADER */
.page-loader{position:fixed;inset:0;background:var(--bg);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px;transition:opacity .55s var(--ease-out),visibility .55s;}
.page-loader.fade-out{opacity:0;visibility:hidden;pointer-events:none;}
.loader-inner{display:flex;flex-direction:column;align-items:center;gap:18px;width:200px;}
.loader-ring{position:relative;width:80px;height:80px;display:flex;align-items:center;justify-content:center;}
.loader-emoji{font-size:2rem;position:absolute;z-index:2;animation:emojiBounce 1.6s ease-in-out infinite;}
@keyframes emojiBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
.loader-svg{width:80px;height:80px;position:absolute;top:0;left:0;transform:rotate(-90deg);}
.loader-track{fill:none;stroke:rgba(255,255,255,.08);stroke-width:5;}
.loader-fill{fill:none;stroke:var(--primary);stroke-width:5;stroke-linecap:round;stroke-dasharray:226;stroke-dashoffset:226;animation:loaderSpin 1.8s ease-in-out infinite;filter:drop-shadow(0 0 6px var(--primary));}
@keyframes loaderSpin{0%{stroke-dashoffset:226}50%{stroke-dashoffset:56}100%{stroke-dashoffset:226}}
.loader-label{font-family:var(--font-display);font-size:.8rem;color:var(--text-3);letter-spacing:.06em;text-transform:uppercase;}
.loader-bar-wrap{width:100%;height:3px;background:rgba(255,255,255,.07);border-radius:var(--radius-full);overflow:hidden;}
.loader-bar{height:100%;width:0%;background:linear-gradient(90deg,var(--primary),#FF9500);border-radius:var(--radius-full);transition:width .3s var(--ease-out);box-shadow:0 0 10px var(--primary-glow);}
/* OVERLAY */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:1999;opacity:0;visibility:hidden;transition:all var(--t-norm);}
.overlay.active{opacity:1;visibility:visible;}
/* SIDE MENU */
.side-menu{position:fixed;top:0;left:0;width:270px;height:100vh;height:100dvh;background:#0F121A;border-right:1px solid var(--border);z-index:2000;transform:translateX(-100%);transition:transform .32s var(--ease-out);display:flex;flex-direction:column;padding:env(safe-area-inset-top,0) 0 0;box-shadow:6px 0 40px rgba(0,0,0,.6);}
.side-menu.active{transform:translateX(0);}
.side-menu-header{display:flex;align-items:center;justify-content:space-between;padding:20px 18px 18px;border-bottom:1px solid var(--border);}
.side-menu-logo{font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:var(--text-1);letter-spacing:-.02em;}
.side-menu-close{width:34px;height:34px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-s);color:var(--text-2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--t-fast);}
.side-menu-close:hover{background:var(--error);color:white;border-color:var(--error);}
.side-menu-nav{padding:16px 12px;flex:1;overflow-y:auto;}
.side-nav-label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);padding:0 8px;margin-bottom:10px;}
.side-nav-link{display:flex;align-items:center;gap:12px;padding:12px 12px;border-radius:var(--radius-s);color:var(--text-2);font-size:.9rem;font-weight:500;transition:all var(--t-fast);margin-bottom:4px;}
.side-nav-link:hover,.side-nav-link.active{background:var(--primary-soft);color:var(--primary);}
/* HEADER */
.app-header{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(12,14,20,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding-top:env(safe-area-inset-top,0);transition:box-shadow var(--t-norm);}
.app-header.scrolled{box-shadow:0 4px 30px rgba(0,0,0,.5);}
.app-header-inner{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 6px;}
.hdr-btn{width:38px;height:38px;border:none;background:rgba(255,255,255,.05);border-radius:var(--radius-s);color:var(--text-1);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background var(--t-fast);}
.hdr-btn:hover{background:rgba(255,255,255,.1);}
.hdr-center{display:flex;align-items:center;gap:7px;}
.hdr-logo-icon{font-size:1.4rem;}
.hdr-logo-text{font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:var(--text-1);letter-spacing:-.03em;}
.hdr-right{display:flex;gap:6px;align-items:center;}
.hdr-search{padding:0 14px 10px;}
.search-box{display:flex;align-items:center;gap:9px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.09);border-radius:var(--radius-full);padding:9px 14px;transition:all var(--t-norm);}
.search-box:focus-within{background:rgba(255,255,255,.1);border-color:var(--primary);box-shadow:0 0 0 4px rgba(255,107,0,.12);}
.search-ico{color:var(--text-3);flex-shrink:0;transition:color var(--t-fast);}
.search-box:focus-within .search-ico{color:var(--primary);}
#shopSearchInput{flex:1;background:transparent;border:none;outline:none;font-family:var(--font-body);font-size:.88rem;font-weight:500;color:var(--text-1);}
#shopSearchInput::placeholder{color:var(--text-3);}
.search-clear{display:none;width:24px;height:24px;border:none;background:rgba(255,255,255,.08);border-radius:50%;color:var(--text-2);cursor:pointer;align-items:center;justify-content:center;transition:all var(--t-fast);flex-shrink:0;}
.search-clear.visible{display:flex;}
.search-clear:hover{background:var(--error);color:white;}
.hdr-meta{display:flex;align-items:center;gap:6px;padding:5px 4px 0;}
.meta-pill{font-size:.72rem;color:var(--text-3);font-weight:500;}
.meta-pill b{color:var(--primary);font-weight:700;}
.meta-dot{color:var(--text-3);font-size:.72rem;}
/* MAIN */
.snap-main{padding-top:var(--hdr-h);min-height:100vh;}
/* STORIES BAR */
.stories-bar-wrap{padding:16px 0 0;background:var(--bg);}
.stories-label{display:flex;align-items:center;gap:8px;padding:0 16px 10px;}
.stories-label-icon{font-size:1rem;}
.stories-label-txt{font-family:var(--font-display);font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);}
.stories-bar{display:flex;gap:14px;padding:4px 16px 18px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
.stories-bar::-webkit-scrollbar{display:none;}
.story-item{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;cursor:pointer;scroll-snap-align:start;animation:storyIn .5s var(--ease-bounce) backwards;}
@keyframes storyIn{from{opacity:0;transform:scale(.7) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.story-ring-outer{width:70px;height:70px;border-radius:50%;background:conic-gradient(var(--primary) 0%,var(--snap-yellow) 50%,var(--primary) 100%);padding:3px;position:relative;transition:transform var(--t-bounce);}
.story-item:hover .story-ring-outer,.story-item:active .story-ring-outer{transform:scale(1.08);}
.story-ring-outer.rank-1{background:conic-gradient(#F5A623,#FFD700,#F5A623,#A07000,#F5A623);box-shadow:0 0 14px rgba(245,166,35,.6);}
.story-ring-outer.rank-2{background:conic-gradient(#9BB3CC,#CDD8E3,#9BB3CC);box-shadow:0 0 10px rgba(155,179,204,.4);}
.story-ring-outer.rank-3{background:conic-gradient(#C47D4A,#E8A87C,#C47D4A);box-shadow:0 0 10px rgba(196,125,74,.4);}
.story-ring-inner{width:100%;height:100%;border-radius:50%;border:3px solid var(--bg);overflow:hidden;background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:1.6rem;}
.story-ring-inner img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
.story-rank-badge{position:absolute;bottom:-2px;right:-2px;width:22px;height:22px;border-radius:50%;border:2px solid var(--bg);display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:900;font-family:var(--font-display);z-index:2;}
.story-rank-badge.gold{background:linear-gradient(135deg,#F5A623,#D4820A);color:white;}
.story-rank-badge.silver{background:linear-gradient(135deg,#9BB3CC,#6B8AA5);color:white;}
.story-rank-badge.bronze{background:linear-gradient(135deg,#C47D4A,#9A5A2A);color:white;}
.story-rank-badge.other{background:var(--surface-2);color:var(--text-3);font-size:.55rem;}
.story-name{font-family:var(--font-body);font-size:.68rem;font-weight:600;color:var(--text-2);text-align:center;max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.story-subs{font-size:.6rem;color:var(--primary);font-weight:700;}
.story-skel{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;}
.story-skel-ring{width:70px;height:70px;border-radius:50%;background:linear-gradient(90deg,var(--surface) 25%,var(--surface-2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}
.story-skel-name{width:50px;height:8px;border-radius:4px;background:linear-gradient(90deg,var(--surface) 25%,var(--surface-2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
/* DIVIDER */
.snap-divider{padding:6px 16px 14px;background:var(--bg);}
.snap-divider-line{height:1px;background:var(--border);margin-bottom:12px;}
.snap-divider-controls{display:flex;align-items:center;justify-content:space-between;}
.snap-divider-txt{font-family:var(--font-display);font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);}
.snap-sort-wrap{position:relative;}
.snap-sort{appearance:none;-webkit-appearance:none;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);padding:6px 30px 6px 12px;font-family:var(--font-body);font-size:.75rem;font-weight:600;color:var(--text-2);cursor:pointer;outline:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238896B3' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;transition:all var(--t-fast);}
.snap-sort:focus{border-color:var(--primary);color:var(--primary);}
/* DISCOVER GRID */
.discover-section{padding:0 10px 32px;background:var(--bg);}
.discover-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.discover-grid .tile-card:nth-child(5n+1){grid-column:1/-1;}
@media(min-width:480px){.discover-grid{grid-template-columns:repeat(2,1fr);gap:12px;}}
@media(min-width:720px){.discover-grid{grid-template-columns:repeat(3,1fr);gap:14px;}.discover-grid .tile-card:nth-child(5n+1){grid-column:span 1;}.discover-grid .tile-card:nth-child(7n+1){grid-column:1/-1;}}
@media(min-width:1024px){.discover-section{padding:0 16px 40px;}.discover-grid{grid-template-columns:repeat(4,1fr);gap:16px;}.discover-grid .tile-card:nth-child(7n+1){grid-column:span 1;}.discover-grid .tile-card:nth-child(9n+1){grid-column:span 2;}}
/* TILE CARD */
.tile-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-l);overflow:hidden;position:relative;cursor:pointer;display:flex;flex-direction:column;transition:transform var(--t-bounce),box-shadow var(--t-norm),border-color var(--t-norm);animation:tileIn .45s var(--ease-bounce) backwards;}
@keyframes tileIn{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
.tile-card:hover{transform:translateY(-4px) scale(1.01);border-color:var(--border-accent);box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 0 1px rgba(255,107,0,.08);}
.tile-card:active{transform:scale(.97);}
.tile-card.rank-1{border-color:rgba(245,166,35,.45);}
.tile-card.rank-2{border-color:rgba(155,179,204,.35);}
.tile-card.rank-3{border-color:rgba(196,125,74,.35);}
.tile-cover{height:90px;position:relative;overflow:hidden;background:var(--surface);flex-shrink:0;}
.tile-card:nth-child(5n+1) .tile-cover,.tile-card.tile-featured .tile-cover{height:140px;}
.tile-slideshow{position:absolute;inset:0;overflow:hidden;}
.tile-slide-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .7s ease;}
.tile-slide-img.active{opacity:1;}
.tile-card:hover .tile-slide-img.active{transform:scale(1.04);transition:opacity .7s ease,transform .5s ease;}
.tile-cover-gradient{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,.6) 100%);}
.tile-cover-badges{position:absolute;top:8px;left:8px;display:flex;gap:5px;z-index:2;}
.tile-badge{font-size:.62rem;font-weight:700;font-family:var(--font-display);padding:3px 8px;border-radius:var(--radius-full);backdrop-filter:blur(8px);letter-spacing:.04em;}
.tile-badge-rank{background:rgba(0,0,0,.6);color:white;border:1px solid rgba(255,255,255,.15);}
.tile-badge-rank.gold{background:rgba(245,166,35,.85);color:#000;border:none;}
.tile-badge-rank.silver{background:rgba(155,179,204,.85);color:#000;border:none;}
.tile-badge-rank.bronze{background:rgba(196,125,74,.85);color:#fff;border:none;}
.tile-badge-verified{background:rgba(0,214,143,.2);color:var(--success);border:1px solid rgba(0,214,143,.3);}
.tile-cover-sub{position:absolute;top:8px;right:8px;z-index:2;}
.tile-sub-btn{width:30px;height:30px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;backdrop-filter:blur(8px);background:rgba(0,0,0,.55);color:var(--text-2);transition:all var(--t-bounce);line-height:1;}
.tile-sub-btn:hover,.tile-sub-btn.subbed{background:rgba(0,214,143,.25);color:var(--success);transform:scale(1.15);}
.tile-sub-btn.loading{opacity:.5;pointer-events:none;}
.tile-body{padding:11px 12px 13px;display:flex;flex-direction:column;gap:9px;flex:1;}
.tile-top-row{display:flex;align-items:center;gap:9px;}
.tile-avatar{width:38px;height:38px;border-radius:var(--radius-s);object-fit:cover;border:1.5px solid var(--border);background:var(--surface);flex-shrink:0;transition:transform var(--t-bounce);}
.tile-card:hover .tile-avatar{transform:scale(1.08) rotate(2deg);}
.tile-avatar-placeholder{width:38px;height:38px;border-radius:var(--radius-s);background:var(--surface-2);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;transition:transform var(--t-bounce);}
.tile-card:hover .tile-avatar-placeholder{transform:scale(1.08) rotate(2deg);}
.tile-name-wrap{flex:1;min-width:0;}
.tile-name{font-family:var(--font-display);font-size:.88rem;font-weight:700;color:var(--text-1);letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;margin-bottom:2px;}
.tile-slug{font-size:.67rem;color:var(--text-3);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tile-stats{display:flex;gap:5px;flex-wrap:wrap;}
.chip{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:var(--radius-full);font-size:.66rem;font-weight:700;white-space:nowrap;line-height:1;}
.chip svg{width:11px;height:11px;flex-shrink:0;}
.chip-likes{background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.2);color:#FF4D6D;}
.chip-products{background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.2);color:#60A5FA;}
.chip-subs{background:var(--primary-soft);border:1px solid rgba(255,107,0,.2);color:var(--primary);}
.tile-desc{font-size:.71rem;color:var(--text-2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.tile-actions{display:flex;gap:6px;margin-top:auto;}
.tile-btn-sub{flex:1;padding:8px 10px;border-radius:var(--radius-s);border:1.5px solid rgba(255,255,255,.09);background:var(--surface);color:var(--text-2);font-family:var(--font-body);font-size:.74rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all var(--t-bounce);position:relative;overflow:hidden;}
.tile-btn-sub::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--primary),var(--primary-dark));opacity:0;transition:opacity var(--t-fast);}
.tile-btn-sub:hover::after{opacity:.12;}
.tile-btn-sub.subscribed{border-color:rgba(0,214,143,.35);color:var(--success);background:rgba(0,214,143,.08);}
.tile-btn-sub.loading{opacity:.55;pointer-events:none;}
.tile-btn-visit{display:flex;align-items:center;justify-content:center;gap:5px;padding:8px 14px;border-radius:var(--radius-s);border:none;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;font-family:var(--font-body);font-size:.74rem;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 4px 12px rgba(255,107,0,.3);transition:all var(--t-bounce);}
.tile-btn-visit:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(255,107,0,.45);}
/* SKELETON */
.tile-skel{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-l);overflow:hidden;animation:tileIn .45s var(--ease-bounce) backwards;}
.tile-skel-cover{height:90px;background:linear-gradient(90deg,var(--surface) 25%,var(--surface-2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}
.tile-skel-body{padding:11px 12px;display:flex;flex-direction:column;gap:9px;}
.tile-skel-row{display:flex;gap:9px;align-items:center;}
.tile-skel-av{width:38px;height:38px;border-radius:var(--radius-s);flex-shrink:0;background:linear-gradient(90deg,var(--surface) 25%,var(--surface-2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}
.tile-skel-lines{flex:1;display:flex;flex-direction:column;gap:5px;}
.tile-skel-line{height:10px;border-radius:4px;background:linear-gradient(90deg,var(--surface) 25%,var(--surface-2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}
.tile-skel-line.w70{width:70%;}.tile-skel-line.w45{width:45%;}
.tile-skel-chips{display:flex;gap:5px;}
.tile-skel-chip{height:22px;width:60px;border-radius:var(--radius-full);background:linear-gradient(90deg,var(--surface) 25%,var(--surface-2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}
.tile-skel-btns{display:flex;gap:6px;}
.tile-skel-btn{height:34px;flex:1;border-radius:var(--radius-s);background:linear-gradient(90deg,var(--surface) 25%,var(--surface-2) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}
/* EMPTY */
.snap-empty{padding:60px 24px;text-align:center;}
.snap-empty-icon{font-size:3.5rem;margin-bottom:16px;display:block;}
.snap-empty h3{font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:var(--text-2);margin-bottom:8px;letter-spacing:-.02em;}
.snap-empty p{font-size:.85rem;color:var(--text-3);margin-bottom:20px;}
.snap-btn-reset{padding:10px 22px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-2);font-family:var(--font-body);font-size:.85rem;font-weight:600;cursor:pointer;transition:all var(--t-fast);}
.snap-btn-reset:hover{border-color:var(--primary);color:var(--primary);}
/* LOAD MORE */
.snap-load-more-wrap{padding:20px 0 10px;text-align:center;}
.snap-load-more-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-full);color:var(--text-2);font-family:var(--font-body);font-size:.85rem;font-weight:700;cursor:pointer;transition:all var(--t-bounce);}
.snap-load-more-btn:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-soft);transform:translateY(-2px);}
/* TOAST */
.toast-container{position:fixed;bottom:calc(20px + env(safe-area-inset-bottom,0));right:14px;left:14px;z-index:99998;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;}
.toast{display:flex;align-items:center;gap:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-m);padding:12px 16px;font-size:.84rem;font-weight:600;color:var(--text-1);box-shadow:0 8px 30px rgba(0,0,0,.55);pointer-events:all;animation:toastIn .4s var(--ease-bounce);max-width:380px;width:fit-content;margin:0 auto;backdrop-filter:blur(14px);}
@keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
.toast.fade-out{animation:toastOut .3s ease forwards;}
@keyframes toastOut{to{opacity:0;transform:translateY(10px) scale(.92)}}
.toast.success{border-color:rgba(0,214,143,.4);}
.toast.error{border-color:rgba(255,77,109,.4);}
.toast.info{border-color:rgba(255,107,0,.4);}
.toast-icon{font-size:1.1rem;}
/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:3000;opacity:0;visibility:hidden;transition:all var(--t-norm);display:flex;align-items:flex-end;justify-content:center;}
.modal-overlay.active{opacity:1;visibility:visible;}
.modal-sheet{background:var(--bg-card);border-radius:var(--radius-xl) var(--radius-xl) 0 0;border:1px solid var(--border);border-bottom:none;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;transform:translateY(40px);transition:transform var(--t-bounce);position:relative;padding-bottom:env(safe-area-inset-bottom,20px);}
.modal-overlay.active .modal-sheet{transform:translateY(0);}
.modal-drag-handle{width:36px;height:4px;background:var(--border);border-radius:99px;margin:12px auto 4px;}
.modal-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border:1px solid var(--border);background:var(--surface);border-radius:50%;color:var(--text-2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--t-fast);z-index:1;}
.modal-close:hover{background:var(--error);color:white;border-color:var(--error);}
.modal-shop-cover{height:8px;width:100%;background:linear-gradient(90deg,var(--shop-color,var(--primary)),transparent);}
.modal-body-inner{padding:20px 20px 24px;}
.modal-shop-header{display:flex;gap:14px;align-items:center;margin-bottom:20px;padding-top:4px;}
.modal-shop-avatar{width:72px;height:72px;border-radius:var(--radius-m);object-fit:cover;border:2px solid var(--border);flex-shrink:0;}
.modal-shop-avatar-ph{width:72px;height:72px;border-radius:var(--radius-m);background:var(--surface-2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;}
.modal-shop-info{flex:1;min-width:0;}
.modal-shop-name{font-family:var(--font-display);font-size:1.3rem;font-weight:800;color:var(--text-1);letter-spacing:-.03em;margin-bottom:4px;word-break:break-word;}
.modal-shop-slug{font-size:.77rem;color:var(--text-3);font-weight:500;}
.modal-verified{display:inline-flex;align-items:center;gap:3px;font-size:.68rem;font-weight:700;color:var(--success);background:rgba(0,214,143,.12);border:1px solid rgba(0,214,143,.2);border-radius:var(--radius-full);padding:2px 8px;margin-top:4px;}
.modal-stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;}
.modal-stat-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-m);padding:12px 8px;text-align:center;}
.modal-stat-num{font-family:var(--font-display);font-size:1.3rem;font-weight:900;color:var(--text-1);letter-spacing:-.03em;line-height:1;margin-bottom:4px;}
.modal-stat-label{font-size:.66rem;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:.04em;}
.modal-desc{font-size:.84rem;color:var(--text-2);line-height:1.6;margin-bottom:18px;}
.modal-actions{display:flex;gap:10px;}
.modal-btn-sub{flex:1;padding:13px;border-radius:var(--radius-s);border:1.5px solid rgba(255,255,255,.1);background:var(--surface);color:var(--text-2);font-family:var(--font-body);font-size:.88rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all var(--t-bounce);}
.modal-btn-sub.subscribed{border-color:rgba(0,214,143,.4);color:var(--success);background:rgba(0,214,143,.08);}
.modal-btn-visit{flex:1;padding:13px;border-radius:var(--radius-s);border:none;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;font-family:var(--font-body);font-size:.88rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(255,107,0,.3);transition:all var(--t-bounce);}
.modal-btn-visit:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(255,107,0,.5);}
/* SCROLLBAR */
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--surface-2);border-radius:99px;}
::-webkit-scrollbar-thumb:hover{background:var(--primary);}
/* UTILITIES */
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
/* TABS */
.snap-tabs{display:flex;gap:0;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.07);background:var(--bg);position:sticky;top:var(--hdr-h);z-index:90;}
.snap-tab{flex:1;padding:12px 8px;border:none;background:transparent;color:var(--text-3);font-family:var(--font-display);font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;cursor:pointer;border-bottom:2px solid transparent;transition:all .22s ease;display:flex;align-items:center;justify-content:center;gap:6px;}
.snap-tab:hover{color:var(--text-2);}
.snap-tab.active{color:var(--primary);border-bottom-color:var(--primary);}
.snap-tab .tab-badge{background:var(--primary);color:white;border-radius:99px;font-size:.58rem;padding:1px 5px;font-weight:800;min-width:16px;text-align:center;}
/* SLIDESHOW DOTS */
.slide-dots{position:absolute;bottom:7px;left:50%;transform:translateX(-50%);display:flex;gap:4px;z-index:3;}
.slide-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.4);transition:all .25s ease;flex-shrink:0;}
.slide-dot.active{background:#fff;width:14px;border-radius:3px;}
/* SUB STORIES */
.sub-stories-wrap{padding:16px 0 4px;background:var(--bg);}
.sub-stories-label{display:flex;align-items:center;gap:8px;padding:0 16px 10px;font-family:var(--font-display);font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);}
#subStoriesBar{display:flex;gap:12px;padding:4px 16px 12px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
#subStoriesBar::-webkit-scrollbar{display:none;}
.sub-story-item{display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0;cursor:pointer;transition:transform .2s ease;}
.sub-story-item:active{transform:scale(.93);}
.sub-story-ring{width:66px;height:66px;border-radius:50%;padding:2.5px;position:relative;}
.sub-story-ring--new{background:conic-gradient(#25D366,#128C7E,#25D366,#07BC4C,#25D366);box-shadow:0 0 12px rgba(37,211,102,.45);}
.sub-story-ring--seen{background:rgba(255,255,255,.15);}
.sub-story-inner{width:100%;height:100%;border-radius:50%;border:2.5px solid var(--bg);overflow:hidden;background:var(--surface);position:relative;display:flex;align-items:center;justify-content:center;}
.sub-story-badge{position:absolute;bottom:-2px;right:-2px;background:#25D366;color:white;font-size:.58rem;font-weight:900;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg);font-family:var(--font-display);}
.sub-story-name{font-size:.62rem;font-weight:600;color:var(--text-2);text-align:center;max-width:62px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* STATUS STORIES */
.status-bar-wrap{padding:8px 0 0;background:var(--bg);border-bottom:1px solid var(--border);}
.status-bar{display:flex;gap:14px;padding:4px 16px 14px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
.status-bar::-webkit-scrollbar{display:none;}
.status-item{display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0;cursor:pointer;scroll-snap-align:start;position:relative;}
.status-ring{width:72px;height:72px;border-radius:50%;padding:3px;background:conic-gradient(#FF6B00,#FF0080,#7928CA,#00D68F,#FF6B00);animation:statusRingPulse 2.5s ease-in-out infinite;position:relative;transition:transform .28s cubic-bezier(.34,1.56,.64,1);}
.status-ring.seen{background:rgba(255,255,255,.15);animation:none;}
.status-item:hover .status-ring,.status-item:active .status-ring{transform:scale(1.08);}
@keyframes statusRingPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.25)}}
.status-ring-inner{width:100%;height:100%;border-radius:50%;border:3px solid var(--bg);overflow:hidden;background:var(--surface);display:flex;align-items:center;justify-content:center;}
.status-ring-inner img{width:100%;height:100%;object-fit:cover;}
.status-name{font-family:var(--font-body);font-size:.65rem;font-weight:600;color:var(--text-2);text-align:center;max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.status-time{font-size:.55rem;color:var(--primary);font-weight:600;margin-top:-2px;}
.status-live-dot{width:8px;height:8px;border-radius:50%;background:#FF4D6D;position:absolute;top:2px;right:2px;z-index:2;animation:livePulse 1.2s ease-in-out infinite;border:2px solid var(--bg);}
@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
/* STATUS VIEWER — TikTok Design */
.st-viewer-overlay{position:fixed;inset:0;z-index:99999;background:#000;}
@keyframes stProgress{to{width:100%}}
.st-viewer-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(0px);}
.st-viewer-media{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
.st-viewer-media video,.st-viewer-media img{width:100%;height:100%;object-fit:cover;}
.st-vol-btn{position:absolute;bottom:16px;left:16px;z-index:6;width:36px;height:36px;border:none;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s,opacity .2s;opacity:.7;pointer-events:auto;}
.st-vol-btn:active{transform:scale(.85);opacity:1;}
.st-vol-btn svg{width:18px;height:18px;}

/* PROGRESS BARS */
.st-bars{position:absolute;top:8px;left:8px;right:8px;z-index:10;display:flex;gap:3px;}
.st-bar-track{flex:1;height:2px;background:rgba(255,255,255,.35);border-radius:2px;overflow:hidden;}
.st-bar-fill{height:100%;background:#fff;border-radius:2px;width:0%;}
.st-bar-fill.done{width:100%;}
.st-bar-fill.active{width:0%;}

/* HEADER */
.st-header{position:absolute;top:16px;left:0;right:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 12px;pointer-events:none;}
.st-header>*{pointer-events:auto;}
.st-btn-close{width:36px;height:36px;border:none;background:rgba(0,0,0,.4);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s;}
.st-btn-close:active{transform:scale(.88);}
.st-shop-info{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.3);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:6px 12px 6px 6px;border-radius:99px;}
.st-avatar{width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(255,255,255,.5);}
.st-avatar-ph{display:flex;align-items:center;justify-content:center;font-size:.9rem;background:rgba(255,255,255,.1);width:30px;height:30px;border-radius:50%;border:1.5px solid rgba(255,255,255,.3);}
.st-shop-name{font-size:.8rem;font-weight:700;color:#fff;}
.st-dot-row{display:flex;gap:4px;align-items:center;margin-left:4px;}
.st-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.5);cursor:pointer;transition:all .2s;}
.st-dot.active{width:14px;border-radius:2px;background:#fff;}

/* RIGHT ACTIONS */
.st-actions{position:absolute;right:10px;bottom:140px;z-index:10;display:flex;flex-direction:column;gap:18px;align-items:center;}
.st-action-btn{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;color:#fff;transition:transform .15s;padding:0;}
.st-action-btn:active{transform:scale(.88);}
.st-action-btn svg{width:28px;height:28px;filter:drop-shadow(0 2px 8px rgba(0,0,0,.5));}
.st-action-label{font-size:.58rem;font-weight:600;text-align:center;text-shadow:0 1px 4px rgba(0,0,0,.6);}
.st-action-btn.subbed .st-action-label{color:#00D68F;}

/* FOOTER */
.st-footer{position:absolute;bottom:60px;left:16px;right:80px;z-index:10;}
.st-caption{color:#fff;font-size:.85rem;font-weight:500;line-height:1.4;text-shadow:0 1px 6px rgba(0,0,0,.8);margin-bottom:10px;}
.st-hashtag{color:var(--primary);font-weight:700;cursor:pointer;}
.st-hashtag:hover{text-decoration:underline;}
.st-music{display:flex;align-items:center;gap:6px;font-size:.75rem;color:rgba(255,255,255,.8);margin-top:4px;}
.st-music svg{width:16px;height:16px;}

/* NAV ZONES */
.st-nav-left,.st-nav-right{position:absolute;top:50px;bottom:80px;width:30%;z-index:5;cursor:pointer;}
.st-nav-left{left:0;}
.st-nav-right{right:0;}

/* COMMENTS PANEL */
.st-comments-panel{position:absolute;inset:0;z-index:20;background:rgba(0,0,0,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:flex;flex-direction:column;animation:stCommentsIn .3s ease;}
@keyframes stCommentsIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.st-comments-header{display:flex;align-items:center;justify-content:space-between;padding:52px 16px 12px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;}
.st-comments-header span{font-size:1rem;font-weight:700;color:#fff;}
.st-comments-close{width:30px;height:30px;border:none;background:rgba(255,255,255,.1);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
.st-comments-close:active{background:rgba(255,255,255,.2);}
.st-comments-list{flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:12px;}
.st-comments-loading,.st-comments-empty{text-align:center;color:rgba(255,255,255,.4);font-size:.85rem;padding:40px 0;}
.st-comment{display:flex;gap:10px;animation:stCommentIn .3s ease backwards;}
@keyframes stCommentIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.st-comment-avatar{width:32px;height:32px;border-radius:50%;background:var(--primary);color:white;font-size:.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.st-comment-body{flex:1;min-width:0;}
.st-comment-author{font-size:.72rem;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:2px;}
.st-comment-date{font-weight:400;color:rgba(255,255,255,.3);}
.st-comment-text{font-size:.82rem;color:#fff;line-height:1.4;}
.st-comment-text .st-hashtag{color:#FF9500;}
.st-comment-reply-btn{display:inline-block;font-size:.65rem;color:rgba(255,255,255,.35);cursor:pointer;margin-top:2px;font-weight:500;transition:color .15s;background:none;border:none;padding:0;font-family:inherit;}
.st-comment-reply-btn:hover{color:var(--primary);}
.st-comment-reply-to{font-size:.68rem;color:rgba(255,255,255,.3);margin-bottom:4px;display:flex;align-items:center;gap:4px;}
.st-comment-reply-to svg{flex-shrink:0;}
.st-comment.is-reply{padding-left:42px;}
.st-comment.is-reply .st-comment-avatar{width:24px;height:24px;font-size:.6rem;}
.st-comment.is-reply .st-comment-body .st-comment-author{font-size:.65rem;}
.st-comment.is-reply .st-comment-body .st-comment-text{font-size:.78rem;}
.st-comment-reply-preview{display:flex;align-items:center;gap:6px;padding:6px 10px;margin-bottom:6px;background:rgba(255,255,255,.06);border-radius:8px;font-size:.72rem;color:rgba(255,255,255,.5);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
.st-comment-reply-preview svg{flex-shrink:0;width:14px;height:14px;stroke:rgba(255,255,255,.3);}
.st-comment-reply-indicator{display:flex;align-items:center;gap:6px;padding:5px 10px;background:rgba(255,107,0,.15);border-radius:8px;font-size:.72rem;color:rgba(255,255,255,.6);}
.st-comment-reply-indicator b{color:#fff;}
.st-comments-input-wrap{display:flex;align-items:center;gap:8px;padding:10px 12px max(10px,env(safe-area-inset-bottom,10px));border-top:1px solid rgba(255,255,255,.08);flex-shrink:0;background:rgba(0,0,0,.5);}
.st-comments-input{flex:1;padding:10px 14px;border-radius:99px;border:1.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;font-size:.85rem;outline:none;font-family:var(--font-body);transition:border-color .15s;}
.st-comments-input:focus{border-color:var(--primary);}
.st-comments-input::placeholder{color:rgba(255,255,255,.3);}
.st-comments-send{width:38px;height:38px;border-radius:50%;border:none;background:var(--primary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s;flex-shrink:0;}
.st-comments-send:active{transform:scale(.88);}
/* MODAL THUMBS */
.modal-thumbs{margin-bottom:18px;}
.modal-thumbs-label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-3);margin-bottom:8px;}
.modal-thumbs-row{display:flex;gap:6px;}
.modal-thumb-img{flex:1;height:70px;object-fit:cover;border-radius:10px;border:1px solid var(--border);min-width:0;cursor:pointer;transition:transform .2s ease;}
.modal-thumb-img:hover{transform:scale(1.04);}
/* ABONNEMENTS EMPTY */
#subEmptyState{padding:60px 24px;text-align:center;}
#subEmptyState .snap-empty-icon{display:block;font-size:3rem;margin-bottom:14px;}
#subEmptyState h3{font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:var(--text-2);margin-bottom:8px;}
#subEmptyState p{font-size:.84rem;color:var(--text-3);}
.sub-card{border-color:rgba(0,214,143,.18) !important;}
/* TILE COVER LOGO */
.tile-cover-logo{position:absolute;bottom:8px;left:10px;z-index:10;width:36px;height:36px;border-radius:9px;object-fit:cover;border:2.5px solid rgba(255,255,255,.95);box-shadow:0 2px 10px rgba(0,0,0,.7);background:var(--surface);transition:transform .2s ease;display:block !important;}
.tile-card:hover .tile-cover-logo{transform:scale(1.12);}
.tile-cover-logo-ph{display:flex !important;align-items:center;justify-content:center;font-size:1.1rem;background:var(--surface-2);border-radius:9px;position:absolute;bottom:8px;left:10px;z-index:10;width:36px;height:36px;border:2.5px solid rgba(255,255,255,.95);box-shadow:0 2px 10px rgba(0,0,0,.7);}
/* SUB STORY SLIDESHOW */
.sub-story-slides{position:absolute;inset:0;border-radius:50%;overflow:hidden;z-index:1;}
.sub-story-slide{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;opacity:0;transition:opacity .6s ease;object-fit:cover;}
.sub-story-slide.active{opacity:1;}
.sub-story-logo{position:absolute;bottom:0;left:0;width:22px;height:22px;border-radius:50%;border:2px solid var(--bg);object-fit:cover;z-index:5;background:var(--surface);display:block !important;}
.sub-story-logo-ph{display:flex !important;align-items:center;justify-content:center;font-size:.65rem;background:var(--surface-2);position:absolute;bottom:0;left:0;width:22px;height:22px;border-radius:50%;border:2px solid var(--bg);z-index:5;}
.sub-story-inner{position:relative !important;overflow:hidden;}
`;

const SUPABASE_URL      = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CFG = {
  PAGE_SIZE:       12,
  TOP_COUNT:       10,
  DEBOUNCE_MS:     260,
  CACHE_KEY:       'oda_boutiques_v5_snap',
  CACHE_DURATION:  3 * 24 * 60 * 60 * 1000,  // 72h
  DEFAULT_COLORS:  ['#FF6B00','#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#EC4899'],
  SLIDE_INTERVAL:  3200,
  MAX_PRODUCT_IMG: 5,
};


const STATE = {
  currentUser:          null,
  anonymousUserId:      null,
  allShops:             [],
  top10:                [],
  rest:                 [],
  restFiltered:         [],
  visibleCount:         CFG.PAGE_SIZE,
  searchTerm:           '',
  sortBy:               'random',
  subscribedShops:      new Set(),
  shopLikes:            {},
  shopProductCounts:    {},
  shopSubscriberCounts: {},
  shopTopImages:        {},
  subscriptionProducts: [],
  activeTab:            'discover',
  _slideTimers:         {},
  statusesByShop:       [],  // [{ shop, statuses: [...] }]
  statusesLoading:      true,
};

/* ════════════════════════════════════════════════
   DOM HELPERS
════════════════════════════════════════════════ */
const $  = id => document.getElementById(id);
const dom = {
  loader:              () => $('pageLoader'),
  loaderBar:           () => $('loaderBarFill'),
  loaderText:          () => $('loaderText'),
  header:              () => $('mainHeader'),
  searchInput:         () => $('shopSearchInput'),
  searchClear:         () => $('searchClear'),
  top10Grid:           () => $('top10Grid'),
  allShopsGrid:        () => $('allShopsGrid'),
  emptyState:          () => $('emptyState'),
  loadMoreWrap:        () => $('loadMoreWrap'),
  btnLoadMore:         () => $('btnLoadMore'),
  sortSelect:          () => $('sortSelect'),
  totalShopsNum:       () => $('totalShopsNum'),
  totalSubscribedNum:  () => $('totalSubscribedNum'),
  toastContainer:      () => $('toastContainer'),
  shopModalOverlay:    () => $('shopModalOverlay'),
  shopModalContent:    () => $('shopModalContent'),
  sideMenu:            () => $('sideMenu'),
  overlay:             () => $('overlay'),
  tabDiscover:         () => $('tabDiscover'),
  tabSubscriptions:    () => $('tabSubscriptions'),
  discoverSection:     () => $('discoverSection'),
  subscriptionsSection:() => $('subscriptionsSection'),
  subStoriesBar:       () => $('subStoriesBar'),
  subShopsGrid:        () => $('subShopsGrid'),
  statusStoriesBar:    () => $('statusStoriesBar'),
  subEmptyState:       () => $('subEmptyState'),
};

/* ════════════════════════════════════════════════
   CACHE MANAGER
════════════════════════════════════════════════ */
class CacheManager {
  constructor() { this.KEY = CFG.CACHE_KEY; this.DUR = CFG.CACHE_DURATION; }
  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify({
        data, timestamp: Date.now(), expiresAt: Date.now() + this.DUR
      }));
      return true;
    } catch (e) { console.warn('Cache save failed:', e.message); return false; }
  }
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry?.data) return null;
      const now   = Date.now();
      const fresh = now < entry.expiresAt;
      const stale = (now - entry.timestamp) < this.DUR * 2;
      if (!fresh && !stale) { localStorage.removeItem(this.KEY); return null; }
      return { data: entry.data, fresh, stale };
    } catch { localStorage.removeItem(this.KEY); return null; }
  }
  clear() { localStorage.removeItem(this.KEY); }
}
const cacheManager = new CacheManager();

/* ════════════════════════════════════════════════
   LOADER
════════════════════════════════════════════════ */
const loader = {
  _pct: 0,
  start() { this.update(2, 'Connexion...'); },
  update(pct, txt) {
    this._pct = pct;
    const bar = dom.loaderBar(); if (bar) bar.style.width = pct + '%';
    const lbl = dom.loaderText(); if (lbl && txt) lbl.textContent = txt;
  },
  async simulate(from, to, ms = 400) {
    const steps = 20, step = (to - from) / steps, delay = ms / steps;
    for (let i = 0; i < steps; i++) {
      await this.delay(delay);
      this.update(Math.round(from + step * i), null);
    }
    this.update(to, null);
  },
  delay(ms) { return new Promise(r => setTimeout(r, ms)); },
  complete() {
    this.update(100, 'Prêt !');
    setTimeout(() => dom.loader()?.classList.add('fade-out'), 300);
  },
  showError(msg) {
    const lbl = dom.loaderText();
    if (lbl) lbl.textContent = '❌ ' + msg;
  }
};

/* ════════════════════════════════════════════════
   DATA LOADING
════════════════════════════════════════════════ */
async function loadFromNetwork(withProgress = false) {
  if (withProgress) loader.update(10, 'Chargement boutiques...');
  const { data: rawShops, error } = await db
    .from('parametres_boutique')
    .select('user_id, config, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!rawShops?.length) return { shops: [], likes: {}, products: {}, subscribers: {}, topImages: {} };

  const shops = rawShops.map(row => ({
    id:          row.user_id,
    name:        row.config?.general?.nom || row.config?.nom || 'Boutique',
    description: row.config?.general?.description || row.config?.description || '',
    slug:        row.config?.identifiant?.slug || row.config?.slug || null,
    logo_url:    row.config?.apparence?.logoUrl
              || row.config?.apparence?.logo_url
              || row.config?.apparence?.logo
              || row.config?.logo_url
              || row.config?.logoUrl
              || null,
    cover_url:   row.config?.apparence?.coverUrl
              || row.config?.apparence?.cover_url
              || row.config?.cover_url
              || null,
    color:       row.config?.apparence?.couleurPrimaire
              || row.config?.apparence?.color
              || row.config?.color
              || null,
    verified:    row.config?.verified || false,
    created_at:  row.created_at,
  }));

  if (withProgress) loader.update(35, 'Statistiques...');
  const ids = shops.map(s => s.id);
  const products  = {};
  const likes     = {};
  const topImages = {};
  try {
    const { data: prodsData } = await db
      .from('produits')
      .select('user_id, id, main_image, description_images')
      .in('user_id', ids);
    if (prodsData) {
      for (const prod of prodsData) {
        const sid = prod.user_id;
        products[sid] = (products[sid] || 0) + 1;
        if (!topImages[sid]) topImages[sid] = [];
        const extras = Array.isArray(prod.description_images)
          ? prod.description_images.filter(Boolean) : [];
        const allImgs = [prod.main_image, ...extras].filter(Boolean);
        for (const img of allImgs) {
          if (topImages[sid].length < CFG.MAX_PRODUCT_IMG) topImages[sid].push(img);
        }
      }
    }
  } catch (e) { console.warn('Produits non chargés:', e.message); }

  const subscribers = {};
  if (withProgress) loader.update(72, 'Organisation...');
  const result = { shops, likes, products, subscribers, topImages };
  cacheManager.save(result);
  return result;
}

/* ── Chargement rapide : boutiques seules (sans produits) ── */
async function loadShopsOnly() {
  const { data: rawShops, error } = await db
    .from('parametres_boutique')
    .select('user_id, config, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!rawShops?.length) return [];
  return rawShops.map(row => ({
    id:          row.user_id,
    name:        row.config?.general?.nom || row.config?.nom || 'Boutique',
    description: row.config?.general?.description || row.config?.description || '',
    slug:        row.config?.identifiant?.slug || row.config?.slug || null,
    logo_url:    row.config?.apparence?.logoUrl
              || row.config?.apparence?.logo_url
              || row.config?.apparence?.logo
              || row.config?.logo_url
              || row.config?.logoUrl
              || null,
    cover_url:   row.config?.apparence?.coverUrl
              || row.config?.apparence?.cover_url
              || row.config?.cover_url
              || null,
    color:       row.config?.apparence?.couleurPrimaire
              || row.config?.apparence?.color
              || row.config?.color
              || null,
    verified:    row.config?.verified || false,
    created_at:  row.created_at,
  }));
}

/* ── Chargement progressif des produits par lots de boutiques ── */
async function loadProductsProgressively(shopIds, onBatch) {
  const products  = {};
  const topImages = {};
  const BATCH_SIZE = 3;
  for (let i = 0; i < shopIds.length; i += BATCH_SIZE) {
    const batch = shopIds.slice(i, i + BATCH_SIZE);
    try {
      const { data: prodsData } = await db
        .from('produits')
        .select('user_id, id, main_image, description_images')
        .in('user_id', batch);
      if (prodsData) {
        for (const prod of prodsData) {
          const sid = prod.user_id;
          products[sid] = (products[sid] || 0) + 1;
          if (!topImages[sid]) topImages[sid] = [];
          const extras = Array.isArray(prod.description_images)
            ? prod.description_images.filter(Boolean) : [];
          const allImgs = [prod.main_image, ...extras].filter(Boolean);
          for (const img of allImgs) {
            if (topImages[sid].length < CFG.MAX_PRODUCT_IMG) topImages[sid].push(img);
          }
        }
      }
    } catch (e) { console.warn('Lot produits échoué:', e.message); }
    if (onBatch) onBatch({ products, topImages });
  }
  return { products, topImages };
}

function applyToState(data) {
  STATE.shopLikes            = data.likes       || {};
  STATE.shopProductCounts    = data.products    || {};
  STATE.shopSubscriberCounts = data.subscribers || {};
  STATE.shopTopImages        = data.topImages   || {};
  const shops = (data.shops || []).map(s => ({
    ...s,
    likeCount:       STATE.shopLikes[s.id]            || 0,
    productCount:    STATE.shopProductCounts[s.id]     || 0,
    subscriberCount: STATE.shopSubscriberCounts[s.id]  || 0,
    color:           s.color || CFG.DEFAULT_COLORS[Math.floor(Math.random() * CFG.DEFAULT_COLORS.length)],
    topImages:       STATE.shopTopImages[s.id]         || [],
  }));
  shops.sort((a, b) => b.likeCount - a.likeCount);
  STATE.top10    = shops.slice(0, CFG.TOP_COUNT);
  STATE.rest     = shops;
  STATE.allShops = shops;
  STATE.restFiltered = [...shops];
}

/* ════════════════════════════════════════════════
   AUTH & SUBSCRIPTIONS
════════════════════════════════════════════════ */
const LS_USER_ID  = 'oda_user_id';
const LS_SUBS_KEY = 'oda_subscribed_shops';

function getAnonymousUserId() {
  let uid = localStorage.getItem(LS_USER_ID);
  if (!uid) {
    uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(LS_USER_ID, uid);
  }
  return uid;
}

async function initAuth() {
  STATE.anonymousUserId = getAnonymousUserId();
  try {
    const { data: { session } } = await db.auth.getSession();
    STATE.currentUser = session?.user || null;
  } catch { STATE.currentUser = null; }
}

async function loadSubscriptions() {
  try {
    const stored = localStorage.getItem(LS_SUBS_KEY);
    if (stored) {
      const arr = JSON.parse(stored);
      STATE.subscribedShops = new Set(arr);
    }
  } catch { STATE.subscribedShops = new Set(); }
  updateAllSubscribeButtons();
  updateHeaderStats();
  const badge = $('subTabBadge');
  if (badge) {
    const n = STATE.subscribedShops.size;
    badge.textContent = n;
    badge.style.display = n > 0 ? 'inline-flex' : 'none';
  }
  if (STATE.subscribedShops.size > 0) await loadSubscriptionProducts();
}

function saveSubscriptions() {
  localStorage.setItem(LS_SUBS_KEY, JSON.stringify([...STATE.subscribedShops]));
}

async function loadSubscriptionProducts() {
  if (STATE.subscribedShops.size === 0) return;
  try {
    const ids   = [...STATE.subscribedShops];
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await db
      .from('produits')
      .select('id, user_id, main_image, description_images, nom, created_at')
      .in('user_id', ids)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(30);
    if (!error && data) {
      STATE.subscriptionProducts = data;
      renderSubStories();
    }
  } catch (e) { console.warn('loadSubscriptionProducts:', e.message); }
}

/* ════════════════════════════════════════════════
   STATUS LOADING
════════════════════════════════════════════════ */
async function loadShopStatuses() {
  try {
    const now = new Date().toISOString();
    const { data, error } = await db
      .from('shop_statuses')
      .select('*')
      .gt('expires_at', now)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data?.length) { STATE.statusesByShop = []; renderStatusStories(); return; }

    const grouped = {};
    for (const s of data) {
      if (!grouped[s.user_id]) grouped[s.user_id] = [];
      grouped[s.user_id].push(s);
    }

    STATE.statusesByShop = Object.entries(grouped)
      .map(([userId, statuses]) => {
        const shop = STATE.allShops.find(sh => sh.id === userId);
        return shop ? { shop, statuses } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.statuses[0].created_at - a.statuses[0].created_at);

    renderStatusStories();
  } catch (e) {
    console.warn('loadShopStatuses:', e.message);
  } finally {
    STATE.statusesLoading = false;
  }
}

function renderStatusStories() {
  const bar = dom.statusStoriesBar();
  if (!bar) return;
  const items = STATE.statusesByShop;
  if (!items?.length) { bar.innerHTML = ''; const wrap = document.getElementById('statusStoriesWrap'); if (wrap) wrap.style.display = 'none'; return; }
  const wrap = document.getElementById('statusStoriesWrap');
  if (wrap) wrap.style.display = '';

  bar.innerHTML = items.map(({ shop, statuses }) => {
    const avatarHtml = shop.logo_url
      ? `<img src="${escHtml(shop.logo_url)}" alt="${escHtml(shop.name)}">`
      : `<span style="font-size:1.4rem;">${getShopEmoji(shop)}</span>`;
    const timeAgo = getTimeAgo(statuses[0].created_at);
    return `
    <div class="status-item" onclick="openStatusViewer('${shop.id}')">
      <div class="status-ring${statuses.every(s => s._seen) ? ' seen' : ''}">
        <div class="status-ring-inner">${avatarHtml}</div>
        <span class="status-live-dot"></span>
      </div>
      <span class="status-name">${escHtml(shop.name)}</span>
      <span class="status-time">${timeAgo}</span>
    </div>`;
  }).join('');
  const badge = document.getElementById('statusCountBadge');
  if (badge) badge.textContent = items.length;
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min}min`;
  const h = Math.floor(min / 60);
  return `Il y a ${h}h`;
}

/* ════════════════════════════════════════════════
   STATUS VIEWER — Instagram-like cross-shop stories
════════════════════════════════════════════════ */
/* ── SVG Icons pour le viewer TikTok ── */
const ST_ICONS = {
  close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  share: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>',
  visit: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  subscribe: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  subscribed: '<svg width="28" height="28" viewBox="0 0 24 24" fill="#00D68F" stroke="#00D68F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  music: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  comment: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  volumeOn: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>',
  volumeOff: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
};

/* ── Rendu caption avec hashtags ── */
function renderCaption(text) {
  return text.replace(/#(\w+)/g, '<span class="st-hashtag">#$1</span>');
}

/* ── Gestionnaire global des commentaires ── */
let commentsState = { visible: false, statusId: null, comments: [] };
let replyingTo = null;

async function loadComments(statusId) {
  try {
    const { data } = await db.from('shop_status_comments').select('*').eq('status_id', statusId).order('created_at', { ascending: false }).limit(50);
    commentsState.comments = data || [];
  } catch (_) { commentsState.comments = []; }
  renderCommentsList();
}

function renderCommentsList() {
  const list = document.getElementById('stCommentsList');
  if (!list) return;
  if (!commentsState.comments.length) {
    list.innerHTML = '<div class="st-comments-empty">Aucun commentaire pour le moment</div>';
    return;
  }
  const topLevel = commentsState.comments.filter(c => !c.reply_to);
  list.innerHTML = topLevel.map(c => renderComment(c)).join('');
}

function renderComment(c) {
  const replies = commentsState.comments.filter(r => r.reply_to === c.id);
  const t = new Date(c.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
  const content = renderCaption(escHtml(c.content));
  const safeName = escHtml(c.author_name || 'Anonyme').replace(/'/g, "\\'");
  let html = `<div class="st-comment" data-id="${c.id}"><div class="st-comment-avatar">${(c.author_name || 'A')[0]}</div><div class="st-comment-body"><div class="st-comment-author">${escHtml(c.author_name || 'Anonyme')} <span class="st-comment-date">· ${t}</span></div><div class="st-comment-text">${content}</div><button class="st-comment-reply-btn" onclick="window.setReplyTo('${c.id}','${safeName}')">Répondre</button>`;
  if (replies.length) {
    html += replies.map(r => {
      const rt = new Date(r.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
      const rContent = renderCaption(escHtml(r.content));
      return `<div class="st-comment is-reply"><div class="st-comment-avatar">${(r.author_name || 'A')[0]}</div><div class="st-comment-body"><div class="st-comment-author">${escHtml(r.author_name || 'Anonyme')} <span class="st-comment-date">· ${rt}</span></div><div class="st-comment-text">${rContent}</div></div></div>`;
    }).join('');
  }
  html += `</div></div>`;
  return html;
}

function openComments(statusId) {
  commentsState.visible = true;
  commentsState.statusId = statusId;
  replyingTo = null;
  const panel = document.getElementById('stCommentsPanel');
  if (panel) panel.style.display = 'flex';
  const overlay = document.getElementById('storyViewer');
  if (overlay && overlay._onCommentsOpen) overlay._onCommentsOpen();
  loadComments(statusId);
  updateReplyIndicator();
}

function closeComments() {
  commentsState.visible = false;
  commentsState.statusId = null;
  replyingTo = null;
  const panel = document.getElementById('stCommentsPanel');
  if (panel) panel.style.display = 'none';
  const overlay = document.getElementById('storyViewer');
  if (overlay && overlay._onCommentsClose) overlay._onCommentsClose();
  updateReplyIndicator();
}

function updateReplyIndicator() {
  const wrap = document.getElementById('stReplyIndicator');
  if (!wrap) return;
  if (replyingTo) {
    wrap.style.display = 'flex';
    wrap.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><path d="M12 18V6"/></svg> Réponse à <b>${escHtml(replyingTo.authorName)}</b> <span style="margin-left:auto;cursor:pointer;font-size:.8rem;opacity:.6" onclick="window.clearReplyTo()">✕</span>`;
  } else {
    wrap.style.display = 'none';
    wrap.innerHTML = '';
  }
}

function openStatusViewer(shopId) {
  const allEntries = STATE.statusesByShop;
  if (!allEntries.length) return;

  let startEntryIdx = allEntries.findIndex(e => e.shop.id === shopId);
  if (startEntryIdx < 0) startEntryIdx = 0;

  let currentEntryIdx = startEntryIdx;
  let currentStatusIdx = 0;
  let progressTimer = null;
  let touchStartX = 0;
  let videoEndHandler = null;
  let isMuted = true;

  const overlay = document.createElement('div');
  overlay.id = 'storyViewer';
  overlay.className = 'st-viewer-overlay';

  function getCurrentEntry() { return allEntries[currentEntryIdx]; }
  function getCurrentStatus() { const e = getCurrentEntry(); return e ? e.statuses[currentStatusIdx] : null; }
  function isOnLastStatus() { const e = getCurrentEntry(); return e && currentStatusIdx >= e.statuses.length - 1; }
  function isOnFirstStatus() { return currentStatusIdx <= 0; }
  function hasNextShop() { return currentEntryIdx < allEntries.length - 1; }
  function hasPrevShop() { return currentEntryIdx > 0; }

  /* ── Subscribe toggle ── */
  const toggleSub = async () => {
    const e = getCurrentEntry();
    if (!e) return;
    const subbed = STATE.subscribedShops.has(e.shop.id);
    if (subbed) {
      STATE.subscribedShops.delete(e.shop.id);
      saveSubscriptions();
    } else {
      STATE.subscribedShops.add(e.shop.id);
      saveSubscriptions();
    }
    try {
      const uid = STATE.anonymousUserId || getAnonymousUserId();
      if (subbed) {
        await db.from('shop_subscriptions').delete().eq('user_id', uid).eq('shop_id', e.shop.id);
      } else {
        await db.from('shop_subscriptions').upsert({ user_id: uid, shop_id: e.shop.id, created_at: new Date().toISOString() });
      }
    } catch (_) {}
    updateAllSubscribeButtons();
    updateHeaderStats();
    render();
    const badge = $('subTabBadge');
    if (badge) { const n = STATE.subscribedShops.size; badge.textContent = n; badge.style.display = n > 0 ? 'inline-flex' : 'none'; }
  };

  /* ── Share ── */
  const share = async () => {
    const entry = getCurrentEntry();
    if (!entry) return;
    const { shop, statuses } = entry;
    const s = statuses[currentStatusIdx];
    const url = window.location.origin + '/boutique/' + (shop.slug || shop.id);
    const text = s.caption || `Découvrez ${shop.name} sur ODA Marketplace`;
    if (navigator.share) {
      try { await navigator.share({ title: shop.name, text, url }); } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast('🔗 Lien copié !', 'success');
      } catch (_) { showToast('❌ Erreur de partage', 'error'); }
    }
  };

  /* ── Comments ── */
  const toggleComments = () => {
    const s = getCurrentStatus();
    if (!s) return;
    if (commentsState.visible) { closeComments(); return; }
    openComments(s.id);
  };

  const sendComment = async () => {
    const input = document.getElementById('stCommentInput');
    if (!input || !input.value.trim()) return;
    const s = getCurrentStatus();
    if (!s) return;
    const content = input.value.trim();
    input.value = '';
    try {
      const uid = STATE.anonymousUserId || getAnonymousUserId();
      const payload = {
        status_id: s.id,
        user_id: uid,
        author_name: 'Visiteur',
        content,
      };
      if (replyingTo) payload.reply_to = replyingTo.id;
      await db.from('shop_status_comments').insert(payload);
      replyingTo = null;
      updateReplyIndicator();
      await loadComments(s.id);
    } catch (_) { showToast('❌ Erreur lors de l\'envoi', 'error'); }
  };

  /* ── Volume ── */
  const toggleMute = () => {
    const video = document.getElementById('stVideo');
    if (!video) return;
    isMuted = !isMuted;
    video.muted = isMuted;
    const btn = document.getElementById('stVolBtn');
    if (btn) btn.innerHTML = isMuted ? ST_ICONS.volumeOff : ST_ICONS.volumeOn;
  };

  /* ── Progress bar helper ── */
  function setProgressDuration(ms) {
    const bar = overlay.querySelector('.st-bar-fill.active');
    if (bar) {
      bar.style.animation = 'none';
      bar.offsetHeight; // trigger reflow
      bar.style.animation = `stProgress ${ms}ms linear forwards`;
    }
  }

  /* ── Render ── */
  const render = () => {
    const entry = getCurrentEntry();
    if (!entry) { closeViewer(); return; }
    const { shop, statuses } = entry;
    const s = statuses[currentStatusIdx];
    const subbed = STATE.subscribedShops.has(shop.id);
    const isVideo = s.type === 'video';

    overlay.innerHTML = `
    <div class="st-viewer-bg" style="background:${isVideo ? '#000' : `url('${escHtml(s.media_url)}') center/cover no-repeat`}"></div>
    <div class="st-viewer-media">
      ${isVideo ? `<video src="${escHtml(s.media_url)}" autoplay muted playsinline id="stVideo" style="width:100%;height:100%;object-fit:cover;"></video>` : `<img src="${escHtml(s.media_url)}" alt="" style="width:100%;height:100%;object-fit:cover;">`}
      ${isVideo ? `<button class="st-vol-btn" id="stVolBtn" onclick="window.statusToggleMute()">${ST_ICONS.volumeOff}</button>` : ''}
    </div>
    <div class="st-bars">
      ${statuses.map((_, i) => `
        <div class="st-bar-track"><div class="st-bar-fill ${i < currentStatusIdx ? 'done' : i === currentStatusIdx ? 'active' : ''}"></div></div>
      `).join('')}
    </div>
    <div class="st-header">
      <button class="st-btn-close" onclick="window.closeStatusViewer()">${ST_ICONS.close}</button>
      <div class="st-shop-info">
        ${shop.logo_url ? `<img src="${escHtml(shop.logo_url)}" class="st-avatar" alt="">` : `<div class="st-avatar st-avatar-ph">${getShopEmoji(shop)}</div>`}
        <span class="st-shop-name">${escHtml(shop.name)}</span>
        ${allEntries.length > 1 ? `<div class="st-dot-row">${allEntries.map((e, i) => `<span class="st-dot${i === currentEntryIdx ? ' active' : ''}" onclick="window.statusJumpTo(${i})"></span>`).join('')}</div>` : ''}
      </div>
    </div>
    <div class="st-actions">
      <button class="st-action-btn" onclick="visitShop('${shop.id}','${escHtml(shop.slug || '')}')">${ST_ICONS.visit}<span class="st-action-label">Boutique</span></button>
      <button class="st-action-btn${subbed ? ' subbed' : ''}" onclick="window.statusToggleSub()" id="stSubBtn">${subbed ? ST_ICONS.subscribed : ST_ICONS.subscribe}<span class="st-action-label">${subbed ? 'Abonné' : "S'abonner"}</span></button>
      <button class="st-action-btn" onclick="window.statusToggleComments()">${ST_ICONS.comment}<span class="st-action-label">Commenter</span></button>
      <button class="st-action-btn" onclick="window.statusShare()">${ST_ICONS.share}<span class="st-action-label">Partager</span></button>
    </div>
    <div class="st-footer">
      ${s.caption ? `<div class="st-caption">${renderCaption(escHtml(s.caption))}</div>` : ''}
      <div class="st-music">${ST_ICONS.music}<span>${escHtml(shop.name)} · Son original</span></div>
    </div>
    <div class="st-nav-left" onclick="window.statusNav(-1)"></div>
    <div class="st-nav-right" onclick="window.statusNav(1)"></div>
    <div class="st-comments-panel" id="stCommentsPanel" style="display:none">
      <div class="st-comments-header">
        <span>Commentaires</span>
        <button class="st-comments-close" onclick="window.statusToggleComments()">${ST_ICONS.close}</button>
      </div>
      <div class="st-comments-list" id="stCommentsList">
        <div class="st-comments-loading">Chargement...</div>
      </div>
      <div class="st-comments-input-wrap">
        <div style="flex:1;display:flex;flex-direction:column;gap:4px">
          <div class="st-comment-reply-indicator" id="stReplyIndicator" style="display:none"></div>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="text" class="st-comments-input" id="stCommentInput" placeholder="Ajouter un commentaire..." maxlength="200" />
            <button class="st-comments-send" id="stCommentSend" onclick="window.statusSendComment()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>`;

    /* Video handling */
    if (isVideo) {
      const video = document.getElementById('stVideo');
      if (video) {
        video.addEventListener('loadedmetadata', () => {
          const dur = Math.min(video.duration * 1000, 80000);
          setProgressDuration(dur);
        }, { once: true });
        videoEndHandler = () => advance();
        video.addEventListener('ended', videoEndHandler, { once: true });
        video.play().catch(() => {});
      }
    }
  };

  /* ── Global window helpers ── */
  window.statusToggleSub = toggleSub;
  window.statusShare = share;
  window.statusToggleComments = toggleComments;
  window.statusSendComment = sendComment;
  window.setReplyTo = (id, name) => {
    replyingTo = { id, authorName: name };
    updateReplyIndicator();
    const input = document.getElementById('stCommentInput');
    if (input) input.focus();
  };
  window.clearReplyTo = () => {
    replyingTo = null;
    updateReplyIndicator();
  };
  window.statusToggleMute = toggleMute;

  window.statusJumpTo = (idx) => {
    clearTimeout(progressTimer);
    if (commentsState.visible) {
      commentsState.visible = false;
      const panel = document.getElementById('stCommentsPanel');
      if (panel) panel.style.display = 'none';
      replyingTo = null;
      updateReplyIndicator();
    }
    if (idx >= 0 && idx < allEntries.length) {
      currentEntryIdx = idx;
      currentStatusIdx = 0;
      render(); autoNext();
    }
  };

  window.statusNav = (dir) => {
    clearTimeout(progressTimer);
    if (commentsState.visible) {
      commentsState.visible = false;
      const panel = document.getElementById('stCommentsPanel');
      if (panel) panel.style.display = 'none';
      replyingTo = null;
      updateReplyIndicator();
    }
    const entry = getCurrentEntry();
    if (!entry) return;
    if (dir > 0 && isOnLastStatus() && hasNextShop()) {
      currentEntryIdx++;
      currentStatusIdx = 0;
      render(); autoNext();
    } else if (dir < 0 && isOnFirstStatus() && hasPrevShop()) {
      currentEntryIdx--;
      currentStatusIdx = 0;
      render(); autoNext();
    } else {
      currentStatusIdx = Math.max(0, Math.min(entry.statuses.length - 1, currentStatusIdx + dir));
      render(); autoNext();
    }
  };

  window.closeStatusViewer = () => {
    clearTimeout(progressTimer);
    overlay.remove();
    delete window.statusNav;
    delete window.closeStatusViewer;
    delete window.statusToggleSub;
    delete window.statusJumpTo;
    delete window.statusShare;
    delete window.statusToggleComments;
    delete window.statusSendComment;
    delete window.setReplyTo;
    delete window.clearReplyTo;
    delete window.statusToggleMute;
  };

  const advance = () => {
    const entry = getCurrentEntry();
    if (!entry) { window.closeStatusViewer(); return; }
    if (currentStatusIdx < entry.statuses.length - 1) {
      currentStatusIdx++;
      render(); autoNext();
    } else if (hasNextShop()) {
      currentEntryIdx++;
      currentStatusIdx = 0;
      render(); autoNext();
    } else {
      window.closeStatusViewer();
    }
  };

  const autoNext = () => {
    clearTimeout(progressTimer);
    const s = getCurrentStatus();
    if (s && s.type === 'video') {
      const video = document.getElementById('stVideo');
      if (video) {
        videoEndHandler = () => advance();
        video.addEventListener('ended', videoEndHandler, { once: true });
        video.play().catch(() => {});
        return;
      }
    }
    setProgressDuration(5000);
    progressTimer = setTimeout(advance, 5000);
    overlay._progressTimer = progressTimer;
  };

  const closeViewer = window.closeStatusViewer;

  render();
  document.body.appendChild(overlay);
  setProgressDuration(5000);
  autoNext();

  overlay._onCommentsOpen = () => {
    const v = document.getElementById('stVideo');
    if (v) v.pause();
    clearTimeout(progressTimer);
    overlay._progressTimer = null;
  };
  overlay._onCommentsClose = () => {
    autoNext();
  };

  overlay.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 60) window.statusNav(diff > 0 ? -1 : 1);
  }, { passive: true });
}

/* ════════════════════════════════════════════════
   TOGGLE SUBSCRIBE
════════════════════════════════════════════════ */
async function toggleSubscribe(shopId, btnEl) {
  btnEl.classList.add('loading');
  const was = STATE.subscribedShops.has(shopId);
  try {
    if (was) {
      STATE.subscribedShops.delete(shopId);
      saveSubscriptions();
      showToast('Désabonné 👋', 'info');
    } else {
      STATE.subscribedShops.add(shopId);
      saveSubscriptions();
      showToast('Abonné ! 🔔', 'success');
    }
    const badge = $('subTabBadge');
    if (badge) {
      const n = STATE.subscribedShops.size;
      badge.textContent = n;
      badge.style.display = n > 0 ? 'inline-flex' : 'none';
    }
    updateAllSubscribeButtons();
    updateHeaderStats();
    if (STATE.activeTab === 'subscriptions') renderSubscriptionsTab();
    renderSubStories();
    try {
      const uid = STATE.anonymousUserId || getAnonymousUserId();
      if (was) {
        await db.from('shop_subscriptions').delete().eq('user_id', uid).eq('shop_id', shopId);
      } else {
        await db.from('shop_subscriptions').upsert({
          user_id: uid, shop_id: shopId, created_at: new Date().toISOString()
        });
      }
    } catch (_) {}
  } catch (e) {
    showToast('Erreur : ' + e.message, 'error');
  } finally {
    btnEl.classList.remove('loading');
  }
}

function updateAllSubscribeButtons() {
  document.querySelectorAll('[data-subscribe]').forEach(btn => {
    const sid    = btn.dataset.subscribe;
    const subbed = STATE.subscribedShops.has(sid);
    if (btn.classList.contains('tile-btn-sub')) {
      btn.classList.toggle('subscribed', subbed);
      btn.innerHTML = subbed
        ? `<span>✓</span><span>Abonné</span>`
        : `<span>🔔</span><span>S'abonner</span>`;
    } else if (btn.classList.contains('tile-sub-btn')) {
      btn.classList.toggle('subbed', subbed);
      btn.innerHTML = subbed ? '✓' : '🔔';
    } else if (btn.classList.contains('modal-btn-sub')) {
      btn.classList.toggle('subscribed', subbed);
      btn.textContent = subbed ? '✓ Abonné' : "🔔 S'abonner";
    }
  });
}

/* ════════════════════════════════════════════════
   UTILS
════════════════════════════════════════════════ */
function updateHeaderStats() {
  const t = dom.totalShopsNum(), s = dom.totalSubscribedNum();
  if (t) t.textContent = formatNum(STATE.allShops.length);
  if (s) s.textContent = formatNum(STATE.subscribedShops.size);
}

function loadMore() {
  STATE.visibleCount += CFG.PAGE_SIZE;
  renderAllShops();
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function formatNum(n) {
  if (!n) return '0';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return String(n);
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getShopEmoji(shop) {
  const emojis = ['🛍️','🏪','🎁','💎','👗','👟','🍕','📱','🌿','💄','🎨','🏺'];
  const idx = (shop.name?.charCodeAt(0) || 0) % emojis.length;
  return emojis[idx];
}

function showToast(msg, type = 'info') {
  const c = dom.toastContainer();
  if (!c) return;
  const icons = { success: '✅', error: '❌', info: '💬' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type] || '💬'}</span><span>${escHtml(msg)}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add('fade-out');
    setTimeout(() => t.remove(), 350);
  }, 3200);
}


function renderStorySkeletons(container, n = 5) {
  if (!container) return;
  container.innerHTML = Array.from({ length: n }, () => `
    <div class="story-skel">
      <div class="story-skel-ring"></div>
      <div class="story-skel-name"></div>
    </div>
  `).join('');
}

function renderTop10() {
  const container = dom.top10Grid();
  if (!container) return;
  if (!STATE.top10.length) { container.innerHTML = ''; return; }
  container.innerHTML = STATE.top10.map((shop, i) => {
    const rank     = i + 1;
    const cls      = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
    const badgeCls = rank === 1 ? 'gold'   : rank === 2 ? 'silver'  : rank === 3 ? 'bronze' : 'other';
    const badgeTxt = rank === 1 ? '🥇'     : rank === 2 ? '🥈'      : rank === 3 ? '🥉'     : `#${rank}`;
    const delay    = i * 60;
    const avatarHtml = shop.logo_url
      ? `<img src="${escHtml(shop.logo_url)}" alt="${escHtml(shop.name)}" class="story-ring-inner" style="object-fit:cover;">`
      : `<div class="story-ring-inner">${getShopEmoji(shop)}</div>`;
    return `
    <div class="story-item ${cls}" style="animation-delay:${delay}ms"
         onclick="openShopModal('${shop.id}')">
      <div class="story-ring-outer ${cls}" style="--shop-color:${shop.color}">
        ${avatarHtml}
        <div class="story-rank-badge ${badgeCls}">${badgeTxt}</div>
      </div>
      <span class="story-name">${escHtml(shop.name)}</span>
      <span class="story-subs">${formatNum(shop.subscriberCount)} 🔔</span>
    </div>`;
  }).join('');
}

/* ════════════════════════════════════════════════
   RENDER — STORIES ABONNEMENTS (style WhatsApp)
════════════════════════════════════════════════ */
function renderSubStories() {
  const bar = dom.subStoriesBar();
  if (!bar) return;
  if (STATE.subscribedShops.size === 0) { bar.innerHTML = ''; return; }

  const byShop = {};
  for (const prod of STATE.subscriptionProducts) {
    if (!byShop[prod.user_id]) byShop[prod.user_id] = [];
    byShop[prod.user_id].push(prod);
  }

  const shopIds = [...STATE.subscribedShops];
  let html = '';

  for (const shopId of shopIds) {
    const shop  = STATE.allShops.find(s => s.id === shopId);
    if (!shop) continue;
    const prods   = byShop[shopId] || [];
    const hasNew  = prods.length > 0;
    const ringCls = hasNew ? 'sub-story-ring--new' : 'sub-story-ring--seen';

    let prodImages = [];
    if (hasNew) {
      prodImages = prods.flatMap(p => {
        const imgs = [];
        if (p.main_image) imgs.push(p.main_image);
        if (Array.isArray(p.description_images)) imgs.push(...p.description_images.filter(Boolean).slice(0, 1));
        return imgs;
      }).filter(Boolean).slice(0, 6);
    }
    if (prodImages.length === 0 && shop.topImages?.length > 0) prodImages = shop.topImages.slice(0, 4);

    const logoOverlay = shop.logo_url
      ? `<img src="${escHtml(shop.logo_url)}" class="sub-story-logo" alt="${escHtml(shop.name)}" title="${escHtml(shop.name)}">`
      : `<span class="sub-story-logo sub-story-logo-ph">${getShopEmoji(shop)}</span>`;

    let innerContent;
    if (prodImages.length > 0) {
      innerContent = `
        <div class="sub-story-slides" id="sslides-${shopId}">
          ${prodImages.map((url, si) => `
            <img src="${escHtml(url)}" class="sub-story-slide ${si === 0 ? 'active' : ''}" alt="" loading="${si === 0 ? 'eager' : 'lazy'}">`
          ).join('')}
        </div>${logoOverlay}`;
    } else if (shop.logo_url) {
      innerContent = `<img src="${escHtml(shop.logo_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="">`;
    } else {
      innerContent = `<span style="font-size:1.8rem;">${getShopEmoji(shop)}</span>`;
    }

    html += `
    <div class="sub-story-item" onclick="openSubStoryViewer('${shop.id}')" title="${escHtml(shop.name)}">
      <div class="sub-story-ring ${ringCls}">
        <div class="sub-story-inner">${innerContent}</div>
        ${hasNew ? `<span class="sub-story-badge">${prods.length}</span>` : ''}
      </div>
      <span class="sub-story-name">${escHtml(shop.name)}</span>
    </div>`;
  }

  bar.innerHTML = html || '<p style="color:var(--text-3);font-size:.78rem;padding:8px 16px;">Aucune nouveauté</p>';
  startStoryCircleSlideshows();
}

function startStoryCircleSlideshows() {
  if (window._storyCircleTimers) window._storyCircleTimers.forEach(id => clearInterval(id));
  window._storyCircleTimers = [];
  document.querySelectorAll('.sub-story-slides').forEach(slidesEl => {
    const slides = slidesEl.querySelectorAll('.sub-story-slide');
    if (slides.length <= 1) return;
    let idx = 0;
    slides[0].classList.add('active');
    const timer = setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 2000);
    window._storyCircleTimers.push(timer);
  });
}

/* ════════════════════════════════════════════════
   STORY VIEWER (plein écran style WhatsApp)
════════════════════════════════════════════════ */
function openSubStoryViewer(shopId) {
  const shop  = STATE.allShops.find(s => s.id === shopId);
  if (!shop) return;
  const prods  = STATE.subscriptionProducts.filter(p => p.user_id === shopId);
  const images = prods.map(p => ({
    url:  p.main_image || (Array.isArray(p.description_images) ? p.description_images[0] : null) || '',
    name: p.nom || 'Produit',
    id:   p.id,
  })).filter(i => i.url);

  if (!images.length) { openShopModal(shopId); return; }

  let currentIdx = 0, progressTimer = null;
  const overlay = document.createElement('div');
  overlay.id = 'storyViewer';
  overlay.className = 'story-viewer-overlay';

  const render = () => {
    const img = images[currentIdx];
    overlay.innerHTML = `
    <div class="story-viewer-bg" style="background-image:url('${escHtml(img.url)}')"></div>
    <div class="story-viewer-header">
      <div class="story-viewer-info">
        ${shop.logo_url
          ? `<img src="${escHtml(shop.logo_url)}" class="story-viewer-avatar" alt="">`
          : `<div class="story-viewer-avatar" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">${getShopEmoji(shop)}</div>`
        }
        <div>
          <div class="story-viewer-shopname">${escHtml(shop.name)}</div>
          <div class="story-viewer-prodname">${escHtml(img.name)}</div>
        </div>
      </div>
      <button class="story-viewer-close" onclick="window.closeStoryViewer()">✕</button>
    </div>
    <div class="story-viewer-bars">
      ${images.map((_, i) => `
        <div class="story-bar-track">
          <div class="story-bar-fill ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}"></div>
        </div>`).join('')}
    </div>
    <div class="story-viewer-prev"  onclick="window.storyNav(-1)"></div>
    <div class="story-viewer-next"  onclick="window.storyNav(1)"></div>
    <div class="story-viewer-actions">
      <button class="story-viewer-visit"
        onclick="visitShop('${shop.id}','${escHtml(shop.slug || '')}')">
        Visiter la boutique →
      </button>
    </div>`;
  };

  window.storyNav = (dir) => {
    clearTimeout(progressTimer);
    currentIdx = Math.max(0, Math.min(images.length - 1, currentIdx + dir));
    render(); autoNext();
  };

  window.closeStoryViewer = () => {
    clearTimeout(progressTimer);
    overlay.remove();
    delete window.storyNav;
    delete window.closeStoryViewer;
  };

  const autoNext = () => {
    progressTimer = setTimeout(() => {
      if (currentIdx < images.length - 1) { currentIdx++; render(); autoNext(); }
      else { window.closeStoryViewer(); }
    }, 4000);
  };

  render();
  document.body.appendChild(overlay);
  autoNext();
}

/* ════════════════════════════════════════════════
   RENDER — TILE SKELETONS
════════════════════════════════════════════════ */
function renderTileSkeletons(container, n = 6) {
  if (!container) return;
  container.innerHTML = Array.from({ length: n }, (_, i) => `
    <div class="tile-skel" style="animation-delay:${i * 55}ms">
      <div class="tile-skel-cover"></div>
      <div class="tile-skel-body">
        <div class="tile-skel-row">
          <div class="tile-skel-av"></div>
          <div class="tile-skel-lines">
            <div class="tile-skel-line w70"></div>
            <div class="tile-skel-line w45"></div>
          </div>
        </div>
        <div class="tile-skel-chips">
          <div class="tile-skel-chip"></div>
          <div class="tile-skel-chip"></div>
          <div class="tile-skel-chip"></div>
        </div>
        <div class="tile-skel-btns">
          <div class="tile-skel-btn"></div>
          <div class="tile-skel-btn" style="max-width:80px"></div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════
   RENDER — DISCOVER (toutes boutiques)
════════════════════════════════════════════════ */
function renderAllShops() {
  const container = dom.allShopsGrid();
  if (!container) return;
  stopAllSlideshows();
  const visible = STATE.restFiltered.slice(0, STATE.visibleCount);
  const hasMore = STATE.restFiltered.length > STATE.visibleCount;
  const empty   = STATE.restFiltered.length === 0;
  if (dom.emptyState()) dom.emptyState().style.display = empty ? 'block' : 'none';
  const lmw = dom.loadMoreWrap();
  if (lmw) lmw.style.display = hasMore ? 'block' : 'none';
  if (empty) { container.innerHTML = ''; return; }
  container.innerHTML = visible.map((shop, i) => buildTileCard(shop, i)).join('');
  visible.forEach(shop => { if (shop.topImages?.length > 1) startSlideshow(shop); });
}

function buildTileCard(shop, i) {
  const subbed  = STATE.subscribedShops.has(shop.id);
  const delay   = (i % 12) * 45;
  const images  = shop.topImages || [];

  const avatarHtml = shop.logo_url
    ? `<img src="${escHtml(shop.logo_url)}" alt="${escHtml(shop.name)}" class="tile-avatar" loading="lazy">`
    : `<div class="tile-avatar-placeholder">${getShopEmoji(shop)}</div>`;

  const descHtml    = shop.description ? `<p class="tile-desc">${escHtml(shop.description)}</p>` : '';
  const verifiedHtml = shop.verified ? `<span class="tile-badge tile-badge-verified">✓ Vérifié</span>` : '';

  const dotsHtml = images.length > 1
    ? `<div class="slide-dots" id="dots-${shop.id}">
        ${images.map((_, di) => `<span class="slide-dot ${di === 0 ? 'active' : ''}"></span>`).join('')}
       </div>` : '';

  const photoBadge = images.length > 0
    ? `<span class="tile-badge" style="background:rgba(0,0,0,.55);color:#fff;backdrop-filter:blur(6px);">
        📸 ${images.length} produit${images.length > 1 ? 's' : ''}
       </span>` : '';

  let slideshowHtml;
  if (images.length > 0) {
    slideshowHtml = `<div class="tile-slideshow" id="slides-${shop.id}">
      ${images.map((url, si) => `
        <img src="${escHtml(url)}" class="tile-slide-img ${si === 0 ? 'active' : ''}" alt="" loading="${si === 0 ? 'eager' : 'lazy'}">`
      ).join('')}
    </div>`;
  } else if (shop.cover_url) {
    slideshowHtml = `<div class="tile-slideshow" id="slides-${shop.id}">
      <img src="${escHtml(shop.cover_url)}" class="tile-slide-img active" alt="" loading="lazy">
    </div>`;
  } else {
    slideshowHtml = `<div class="tile-slideshow" id="slides-${shop.id}" style="background:linear-gradient(135deg,${shop.color}33,${shop.color}08);"></div>`;
  }

  const coverLogoHtml = shop.logo_url
    ? `<img src="${escHtml(shop.logo_url)}" class="tile-cover-logo" alt="${escHtml(shop.name)}">`
    : `<div class="tile-cover-logo tile-cover-logo-ph">${getShopEmoji(shop)}</div>`;

  return `
  <div class="tile-card" id="card-${shop.id}" style="animation-delay:${delay}ms;--shop-color:${shop.color}"
       onclick="openShopModal('${shop.id}')">
    <div class="tile-cover">
      ${slideshowHtml}
      <div class="tile-cover-gradient"></div>
      <div class="tile-cover-badges">${verifiedHtml}${photoBadge}</div>
      ${coverLogoHtml}
      <div class="tile-cover-sub">
        <button class="tile-sub-btn ${subbed ? 'subbed' : ''}"
          data-subscribe="${shop.id}"
          onclick="event.stopPropagation();toggleSubscribe('${shop.id}',this)">
          ${subbed ? '✓' : '🔔'}
        </button>
      </div>
      ${dotsHtml}
    </div>
    <div class="tile-body">
      <div class="tile-top-row">
        ${avatarHtml}
        <div class="tile-name-wrap">
          <div class="tile-name">${escHtml(shop.name)}</div>
          <div class="tile-slug">${shop.slug ? '@' + escHtml(shop.slug) : ''}</div>
        </div>
      </div>
      <div class="tile-stats">
        <span class="chip chip-likes">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.065 6.065 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          ${formatNum(shop.likeCount)}
        </span>
        <span class="chip chip-products">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          ${formatNum(shop.productCount)}
        </span>
        <span class="chip chip-subs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          ${formatNum(shop.subscriberCount)}
        </span>
      </div>
      ${descHtml}
      <div class="tile-actions" onclick="event.stopPropagation()">
        <button class="tile-btn-sub ${subbed ? 'subscribed' : ''}"
          data-subscribe="${shop.id}"
          onclick="toggleSubscribe('${shop.id}',this)">
          ${subbed ? `<span>✓</span><span>Abonné</span>` : `<span>🔔</span><span>S'abonner</span>`}
        </button>
        <button class="tile-btn-visit"
          onclick="visitShop('${shop.id}','${escHtml(shop.slug || '')}')">
          Visiter →
        </button>
      </div>
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════
   SLIDESHOW (cartes)
════════════════════════════════════════════════ */
function startSlideshow(shop) {
  const images = shop.topImages;
  if (!images || images.length <= 1) return;
  let idx = 0;
  const timerId = setInterval(() => {
    const slidesEl = document.getElementById(`slides-${shop.id}`);
    const dotsEl   = document.getElementById(`dots-${shop.id}`);
    if (!slidesEl) { clearInterval(timerId); return; }
    const slides = slidesEl.querySelectorAll('.tile-slide-img');
    if (!slides.length) { clearInterval(timerId); return; }
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
    if (dotsEl) {
      dotsEl.querySelectorAll('.slide-dot').forEach((d, di) => {
        d.classList.toggle('active', di === idx);
      });
    }
  }, CFG.SLIDE_INTERVAL);
  STATE._slideTimers[shop.id] = timerId;
}

function stopAllSlideshows() {
  Object.values(STATE._slideTimers).forEach(id => clearInterval(id));
  STATE._slideTimers = {};
}

/* ════════════════════════════════════════════════
   RENDER — ONGLET ABONNEMENTS
════════════════════════════════════════════════ */
function renderSubscriptionsTab() {
  const grid  = dom.subShopsGrid();
  const empty = dom.subEmptyState();
  if (!grid || !empty) return;
  const subIds = [...STATE.subscribedShops];
  if (subIds.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  const shops = subIds.map(id => STATE.allShops.find(s => s.id === id)).filter(Boolean);
  grid.innerHTML = shops.map((shop, i) => buildSubscriptionCard(shop, i)).join('');
  shops.forEach(shop => { if (shop.topImages?.length > 1) startSlideshow(shop); });
  renderSubStories();
}

function buildSubscriptionCard(shop, i) {
  const images   = shop.topImages || [];
  const subProds = STATE.subscriptionProducts.filter(p => p.user_id === shop.id);
  const hasNew   = subProds.length > 0;

  let slideshowHtml;
  if (images.length > 0) {
    slideshowHtml = `<div class="tile-slideshow" id="slides-${shop.id}">
      ${images.map((url, si) => `
        <img src="${escHtml(url)}" class="tile-slide-img ${si === 0 ? 'active' : ''}" alt="" loading="${si === 0 ? 'eager' : 'lazy'}">`
      ).join('')}
    </div>`;
  } else if (shop.cover_url) {
    slideshowHtml = `<div class="tile-slideshow" id="slides-${shop.id}">
      <img src="${escHtml(shop.cover_url)}" class="tile-slide-img active" alt="" loading="lazy">
    </div>`;
  } else {
    slideshowHtml = `<div class="tile-slideshow" id="slides-${shop.id}" style="background:linear-gradient(135deg,${shop.color}33,${shop.color}08);"></div>`;
  }

  const dotsHtml = images.length > 1
    ? `<div class="slide-dots" id="dots-${shop.id}">
        ${images.map((_, di) => `<span class="slide-dot ${di === 0 ? 'active' : ''}"></span>`).join('')}
       </div>` : '';

  const avatarHtml = shop.logo_url
    ? `<img src="${escHtml(shop.logo_url)}" alt="${escHtml(shop.name)}" class="tile-avatar" loading="lazy">`
    : `<div class="tile-avatar-placeholder">${getShopEmoji(shop)}</div>`;

  const newBadge = hasNew
    ? `<span class="tile-badge" style="background:rgba(0,214,143,.2);color:#00D68F;border:1px solid rgba(0,214,143,.3);">
        ✨ ${subProds.length} nouveau${subProds.length > 1 ? 'x' : ''}
       </span>` : '';

  const subCoverLogo = shop.logo_url
    ? `<img src="${escHtml(shop.logo_url)}" class="tile-cover-logo" alt="${escHtml(shop.name)}">`
    : `<div class="tile-cover-logo tile-cover-logo-ph">${getShopEmoji(shop)}</div>`;

  return `
  <div class="tile-card sub-card" id="card-${shop.id}" style="animation-delay:${i * 45}ms;--shop-color:${shop.color}"
       onclick="openShopModal('${shop.id}')">
    <div class="tile-cover">
      ${slideshowHtml}
      <div class="tile-cover-gradient"></div>
      <div class="tile-cover-badges">${newBadge}</div>
      ${subCoverLogo}
      <div class="tile-cover-sub">
        <button class="tile-sub-btn subbed"
          data-subscribe="${shop.id}"
          onclick="event.stopPropagation();toggleSubscribe('${shop.id}',this)">✓</button>
      </div>
      ${dotsHtml}
    </div>
    <div class="tile-body">
      <div class="tile-top-row">
        ${avatarHtml}
        <div class="tile-name-wrap">
          <div class="tile-name">${escHtml(shop.name)}</div>
          <div class="tile-slug">${shop.slug ? '@' + escHtml(shop.slug) : ''}</div>
        </div>
      </div>
      <div class="tile-stats">
        <span class="chip chip-products">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          ${formatNum(shop.productCount)}
        </span>
        <span class="chip chip-likes">❤️ ${formatNum(shop.likeCount)}</span>
        ${hasNew ? `<span class="chip" style="background:rgba(0,214,143,.12);color:#00D68F;border:1px solid rgba(0,214,143,.2);">🆕 ${subProds.length}</span>` : ''}
      </div>
      <div class="tile-actions" onclick="event.stopPropagation()">
        <button class="tile-btn-sub subscribed"
          data-subscribe="${shop.id}"
          onclick="toggleSubscribe('${shop.id}',this)">
          <span>✓</span><span>Abonné</span>
        </button>
        <button class="tile-btn-visit"
          onclick="visitShop('${shop.id}','${escHtml(shop.slug || '')}')">
          Visiter →
        </button>
      </div>
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════
   MODAL DÉTAIL BOUTIQUE
════════════════════════════════════════════════ */
function openShopModal(shopId) {
  const shop = STATE.allShops.find(s => s.id === shopId);
  if (!shop) return;
  const isSubbed = STATE.subscribedShops.has(shopId);
  const content  = dom.shopModalContent();
  if (!content) return;

  const avatarHtml   = shop.logo_url
    ? `<img src="${escHtml(shop.logo_url)}" class="modal-shop-avatar" alt="${escHtml(shop.name)}">`
    : `<div class="modal-shop-avatar-ph">${getShopEmoji(shop)}</div>`;
  const verifiedHtml = shop.verified ? `<span class="modal-verified">✓ Boutique Vérifiée</span>` : '';
  const descHtml     = shop.description ? `<p class="modal-desc">${escHtml(shop.description)}</p>` : '';

  const images   = shop.topImages || [];
  const thumbsHtml = images.length > 0
    ? `<div class="modal-thumbs">
        <div class="modal-thumbs-label">📸 Produits populaires</div>
        <div class="modal-thumbs-row">
          ${images.slice(0, 4).map(url => `<img src="${escHtml(url)}" class="modal-thumb-img" alt="" loading="lazy">`).join('')}
        </div>
       </div>` : '';

  content.innerHTML = `
    <div class="modal-shop-cover" style="--shop-color:${shop.color}"></div>
    <div class="modal-body-inner">
      <div class="modal-shop-header">
        ${avatarHtml}
        <div class="modal-shop-info">
          <div class="modal-shop-name">${escHtml(shop.name)}</div>
          ${shop.slug ? `<div class="modal-shop-slug">@${escHtml(shop.slug)}</div>` : ''}
          ${verifiedHtml}
        </div>
      </div>
      <div class="modal-stats-grid">
        <div class="modal-stat-box">
          <div class="modal-stat-num" style="color:#FF4D6D">${formatNum(shop.likeCount)}</div>
          <div class="modal-stat-label">❤️ Likes</div>
        </div>
        <div class="modal-stat-box">
          <div class="modal-stat-num" style="color:#60A5FA">${formatNum(shop.productCount)}</div>
          <div class="modal-stat-label">📦 Produits</div>
        </div>
        <div class="modal-stat-box">
          <div class="modal-stat-num" style="color:var(--primary)">${formatNum(shop.subscriberCount)}</div>
          <div class="modal-stat-label">🔔 Abonnés</div>
        </div>
      </div>
      ${descHtml}
      ${thumbsHtml}
      <div class="modal-actions">
        <button class="modal-btn-sub ${isSubbed ? 'subscribed' : ''}"
          data-subscribe="${shop.id}"
          onclick="toggleSubscribe('${shop.id}',this)">
          ${isSubbed ? '✓ Abonné' : "🔔 S'abonner"}
        </button>
        <button class="modal-btn-visit"
          onclick="visitShop('${shop.id}','${escHtml(shop.slug || '')}')">
          Visiter →
        </button>
      </div>
    </div>`;

  dom.shopModalOverlay()?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeShopModal() {
  dom.shopModalOverlay()?.classList.remove('active');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════ */
function visitShop(shopId, slug) {
  const target = (slug && slug.trim()) ? slug.trim() : shopId;
  window.location.href = `boutique?shop=${encodeURIComponent(target)}`;
}

/* ════════════════════════════════════════════════
   TABS
════════════════════════════════════════════════ */
function switchTab(tab) {
  STATE.activeTab = tab;
  stopAllSlideshows();
  const tabDisc = dom.tabDiscover(), tabSub  = dom.tabSubscriptions();
  const secDisc = dom.discoverSection(), secSub  = dom.subscriptionsSection();
  if (tabDisc) tabDisc.classList.toggle('active', tab === 'discover');
  if (tabSub)  tabSub.classList.toggle('active',  tab === 'subscriptions');
  if (secDisc) secDisc.style.display = tab === 'discover'       ? '' : 'none';
  if (secSub)  secSub.style.display  = tab === 'subscriptions'  ? '' : 'none';
  if (tab === 'subscriptions') {
    renderSubscriptionsTab();
    renderSubStories();
  } else {
    const visible = STATE.restFiltered.slice(0, STATE.visibleCount);
    visible.forEach(shop => { if (shop.topImages?.length > 1) startSlideshow(shop); });
  }
}

/* ════════════════════════════════════════════════
   MENU
════════════════════════════════════════════════ */
function openMenu() {
  dom.sideMenu()?.classList.add('active');
  dom.overlay()?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  dom.sideMenu()?.classList.remove('active');
  dom.overlay()?.classList.remove('active');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════════
   FILTER & SORT
════════════════════════════════════════════════ */
function filterAndSort() {
  let list = [...STATE.allShops];
  const q  = STATE.searchTerm.toLowerCase().trim();
  if (q) {
    list = list.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.slug?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  }
  switch (STATE.sortBy) {
    case 'likes':       list.sort((a, b) => b.likeCount - a.likeCount); break;
    case 'products':    list.sort((a, b) => b.productCount - a.productCount); break;
    case 'subscribers': list.sort((a, b) => b.subscriberCount - a.subscriberCount); break;
    case 'name':        list.sort((a, b) => a.name.localeCompare(b.name, 'fr')); break;
    case 'random':      shuffleArr(list); break;
  }
  STATE.restFiltered = list;
  STATE.visibleCount = CFG.PAGE_SIZE;
  renderAllShops();
}

let _searchTimer = null;
function onSearch(val) {
  const clear = dom.searchClear();
  if (clear) clear.classList.toggle('visible', val.length > 0);
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    STATE.searchTerm = val;
    STATE.visibleCount = CFG.PAGE_SIZE;
    filterAndSort();
  }, CFG.DEBOUNCE_MS);
}

function resetSearch() {
  const inp = dom.searchInput();
  if (inp) inp.value = '';
  dom.searchClear()?.classList.remove('visible');
  STATE.searchTerm   = '';
  STATE.visibleCount = CFG.PAGE_SIZE;
  filterAndSort();
}

/* ════════════════════════════════════════════════
   EVENT LISTENERS
════════════════════════════════════════════════ */
function initEventListeners() {
  $('menuBtn')?.addEventListener('click', openMenu);
  $('closeMenuBtn')?.addEventListener('click', closeMenu);
  dom.overlay()?.addEventListener('click', closeMenu);

  const si = dom.searchInput();
  if (si) {
    si.addEventListener('input', e => onSearch(e.target.value));
    si.addEventListener('keydown', e => { if (e.key === 'Escape') { resetSearch(); si.blur(); } });
  }
  dom.searchClear()?.addEventListener('click', () => {
    if (dom.searchInput()) dom.searchInput().value = '';
    resetSearch();
    dom.searchInput()?.focus();
  });
  dom.sortSelect()?.addEventListener('change', e => {
    STATE.sortBy = e.target.value;
    filterAndSort();
  });
  dom.btnLoadMore()?.addEventListener('click', loadMore);
  window.addEventListener('scroll', () => {
    dom.header()?.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeShopModal(); window.closeStoryViewer?.(); }
  });
  document.addEventListener('click', e => {
    const viewer = document.getElementById('storyViewer');
    if (viewer && e.target === viewer) window.closeStoryViewer?.();
  });
}

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
async function init() {
  const t0 = performance.now();
  renderStorySkeletons(dom.top10Grid(), 5);
  renderTileSkeletons(dom.allShopsGrid(), 6);
  initEventListeners();
  loader.start();

  const cached = cacheManager.load();

  if (cached?.fresh) {
    loader.update(10, 'Cache détecté...');
    await loader.delay(60);
    loader.update(45, 'Chargement boutiques...');
    applyToState(cached.data);
    renderTop10();
    loadShopStatuses();
    await loader.delay(60);
    loader.update(75, 'Affichage...');
    filterAndSort();
    updateHeaderStats();
    await loader.simulate(75, 100, 250);
    loader.complete();
    console.log(`⚡ Chargé depuis cache en ${(performance.now()-t0).toFixed(0)}ms`);
    initAuth().then(() => loadSubscriptions());
    setTimeout(async () => {
      try {
        const fresh = await loadFromNetwork(false);
        applyToState(fresh); renderTop10(); filterAndSort();
        updateHeaderStats(); updateAllSubscribeButtons();
        loadShopStatuses();
        if (STATE.activeTab === 'subscriptions') renderSubscriptionsTab();
      } catch (e) { console.warn('Refresh silencieux échoué:', e.message); }
    }, 3000);
    return;
  }

  if (cached?.stale) {
    loader.update(20, 'Cache (actualisation...)');
    applyToState(cached.data); renderTop10(); filterAndSort();
    updateHeaderStats(); loader.complete();
    loadShopStatuses();
    initAuth().then(() => loadSubscriptions());
    setTimeout(async () => {
      try {
        const fresh = await loadFromNetwork(false);
        cacheManager.save(fresh); applyToState(fresh);
        renderTop10(); filterAndSort(); updateHeaderStats();
        updateAllSubscribeButtons();
        loadShopStatuses();
        if (STATE.activeTab === 'subscriptions') renderSubscriptionsTab();
      } catch (e) { console.warn('Refresh échoué:', e.message); }
    }, 500);
    return;
  }

  try {
    loader.update(5, 'Boutiques...');
    const shops = await loadShopsOnly();
    await initAuth();

    const fakeShops = shops.map(s => ({
      ...s,
      likeCount: 0, productCount: 0, subscriberCount: 0,
      color: s.color || CFG.DEFAULT_COLORS[Math.floor(Math.random() * CFG.DEFAULT_COLORS.length)],
      topImages: [],
    }));
    fakeShops.sort((a, b) => b.likeCount - a.likeCount);
    STATE.top10    = fakeShops.slice(0, CFG.TOP_COUNT);
    STATE.rest     = fakeShops;
    STATE.allShops = fakeShops;
    STATE.restFiltered = [...fakeShops];

    renderTop10();
    filterAndSort();
    updateHeaderStats();
    await loadSubscriptions();
    loadShopStatuses();
    loader.update(60, 'Produits...');

    const ids = shops.map(s => s.id);
    let completedProducts  = {};
    let completedTopImages = {};

    await loadProductsProgressively(ids, ({ products, topImages }) => {
      completedProducts  = { ...completedProducts, ...products };
      completedTopImages = { ...completedTopImages, ...topImages };
      STATE.shopProductCounts = completedProducts;
      STATE.shopTopImages     = completedTopImages;
      const shopsWithProducts = shops.map(s => ({
        ...s,
        likeCount:       0,
        productCount:    completedProducts[s.id] || 0,
        subscriberCount: 0,
        color:           s.color || CFG.DEFAULT_COLORS[Math.floor(Math.random() * CFG.DEFAULT_COLORS.length)],
        topImages:       completedTopImages[s.id] || [],
      }));
      shopsWithProducts.sort((a, b) => b.likeCount - a.likeCount);
      STATE.top10    = shopsWithProducts.slice(0, CFG.TOP_COUNT);
      STATE.rest     = shopsWithProducts;
      STATE.allShops = shopsWithProducts;
      STATE.restFiltered = [...shopsWithProducts];
      renderTop10();
      filterAndSort();
      updateAllSubscribeButtons();
    });

    const finalResult = {
      shops, likes: {}, products: completedProducts, subscribers: {}, topImages: completedTopImages,
    };
    cacheManager.save(finalResult);
    loader.complete();
    console.log(`🌐 Chargé progressivement en ${(performance.now()-t0).toFixed(0)}ms`);
  } catch (err) {
    console.error('❌ Init error:', err);
    loader.showError(err.message || 'Erreur de chargement');
    showToast('❌ Erreur : ' + (err.message || 'Vérifiez votre connexion'), 'error');
    setTimeout(() => dom.loader()?.classList.add('fade-out'), 1500);
  }
}


export default function BoutiquesPage() {

  useEffect(() => {
    /* ── 1. Injecter le CSS global ── */
    if (!document.getElementById('oda-boutiques-css')) {
      const style = document.createElement('style');
      style.id = 'oda-boutiques-css';
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }

    /* ── 2. Charger la police Syne + DM Sans si absente ── */
    if (!document.getElementById('oda-google-fonts')) {
      const link = document.createElement('link');
      link.id   = 'oda-google-fonts';
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }

    /* ── 3. Exposer les fonctions sur window (utilisées dans innerHTML onclick) ── */
    window.toggleSubscribe    = toggleSubscribe;
    window.visitShop          = visitShop;
    window.openShopModal      = openShopModal;
    window.closeShopModal     = closeShopModal;
    window.closeMenu          = closeMenu;
    window.openMenu           = openMenu;
    window.resetSearch        = resetSearch;
    window.switchTab          = switchTab;
    window.openSubStoryViewer = openSubStoryViewer;
    window.openStatusViewer  = openStatusViewer;

    /* ── Refresh périodique des status ── */
    const statusInterval = setInterval(loadShopStatuses, 30000);
    window._statusRefreshInterval = statusInterval;

    window.ODA_BOUTIQUES = {
      state:        () => STATE,
      cacheFlush:   () => { cacheManager.clear(); location.reload(); },
      forceRefresh: async () => { cacheManager.clear(); await init(); },
    };

    /* ── 4. Démarrer l'app ── */
    init();

    console.log('🏪 ODA Boutiques Snap — Next.js v5 (slideshow + abonnements + stories)');

    /* ── 5. Cleanup à la destruction du composant ── */
    return () => {
      stopAllSlideshows();
      if (window._storyCircleTimers) {
        window._storyCircleTimers.forEach(id => clearInterval(id));
      }
      if (window._statusRefreshInterval) clearInterval(window._statusRefreshInterval);
      delete window.toggleSubscribe;
      delete window.visitShop;
      delete window.openShopModal;
      delete window.closeShopModal;
      delete window.closeMenu;
      delete window.openMenu;
      delete window.resetSearch;
      delete window.switchTab;
      delete window.openSubStoryViewer;
      delete window.ODA_BOUTIQUES;
    };
  }, []);

  /* ════════════════════════════════════════════
     JSX — Structure HTML complète (identique au HTML original)
  ════════════════════════════════════════════ */
  return (
    <>
      {/* ══ SIDE MENU ══ */}
      <div className="side-menu" id="sideMenu">
        <div className="side-menu-header">
          <span className="side-menu-logo">🛍️ ODA</span>
          <button
            className="side-menu-close"
            id="closeMenuBtn"
            onClick={() => closeMenu()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav className="side-menu-nav">
          <p className="side-nav-label">Navigation</p>
          <a href="achats" className="side-nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Accueil
          </a>
          <a href="favorie" className="side-nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Mes Favoris
          </a>
          <a href="boutiques" className="side-nav-link active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 9l1.5-5h15L21 9" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Boutiques
          </a>
        </nav>
      </div>

      {/* ══ OVERLAY ══ */}
      <div className="overlay" id="overlay" onClick={() => closeMenu()}></div>

      {/* ══ HEADER ══ */}
      <header className="app-header" id="mainHeader">
        <div className="app-header-inner">
          <button className="hdr-btn" id="menuBtn" onClick={() => openMenu()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="15" y2="18"/>
            </svg>
          </button>

          <div className="hdr-center">
            <span className="hdr-logo-icon">🛍️</span>
            <span className="hdr-logo-text">Odamarket</span>
          </div>

          <div className="hdr-right">
            <button
              className="hdr-btn"
              onClick={() => window.location.href = 'favorie'}
              title="Favoris"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button className="hdr-btn vendor-btn" id="vendorBtn" title="Espace Vendeur">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="images/oda-logo.svg" alt="ODA" width="22" height="22" style={{ borderRadius: 5 }} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="hdr-search">
          <div className="search-box" id="searchWrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="search-ico">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              id="shopSearchInput"
              placeholder="Rechercher une boutique..."
              autoComplete="off"
              spellCheck={false}
            />
            <button className="search-clear" id="searchClear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="hdr-meta">
            <span className="meta-pill"><b id="totalShopsNum">–</b> boutiques</span>
            <span className="meta-dot">·</span>
            <span className="meta-pill"><b id="totalSubscribedNum">–</b> abonnements</span>
          </div>
        </div>
      </header>

      {/* ══ MAIN CONTENT ══ */}
      <main className="snap-main" id="snapMain">

        {/* ── STATUS STORIES BAR (En Direct) ── */}
        <section className="status-bar-wrap" id="statusStoriesWrap" style={{display:'none'}}>
          <div className="stories-label">
            <span className="stories-label-icon">🟢</span>
            <span className="stories-label-txt">En Direct</span>
            <span id="statusCountBadge" style={{background:'var(--primary)',color:'white',fontSize:'.6rem',fontWeight:800,padding:'2px 7px',borderRadius:99,marginLeft:4}}>0</span>
          </div>
          <div className="status-bar" id="statusStoriesBar">
            {/* Rempli par JS */}
          </div>
        </section>

        {/* ── STORIES BAR (Top 10) ── */}
        <section className="stories-bar-wrap" id="top10Section">
          <div className="stories-label">
            <span className="stories-label-icon">🏆</span>
            <span className="stories-label-txt">Top Boutiques</span>
          </div>
          <div className="stories-bar" id="top10Grid">
            {/* Rempli par JS */}
          </div>
        </section>

        {/* ── TABS ── */}
        <div className="snap-tabs">
          <button
            className="snap-tab active"
            id="tabDiscover"
            onClick={() => switchTab('discover')}
          >
            🛍️ Découvrir
          </button>
          <button
            className="snap-tab"
            id="tabSubscriptions"
            onClick={() => switchTab('subscriptions')}
          >
            🔔 Abonnements
            <span className="tab-badge" id="subTabBadge" style={{ display: 'none' }}>0</span>
          </button>
        </div>

        {/* ── SECTION DÉCOUVRIR ── */}
        <div id="discoverSection">
          <div className="snap-divider">
            <div className="snap-divider-line"></div>
            <div className="snap-divider-controls">
              <span className="snap-divider-txt">Toutes les boutiques</span>
              <div className="snap-sort-wrap">
                <select className="snap-sort" id="sortSelect" defaultValue="random">
                  <option value="random">✨ Aléatoire</option>
                  <option value="products">📦 Produits</option>
                  <option value="subscribers">🔔 Abonnés</option>
                  <option value="likes">❤️ Likes</option>
                  <option value="name">🔤 A–Z</option>
                </select>
              </div>
            </div>
          </div>

          <section className="discover-section" id="allShopsSection">
            <div className="discover-grid" id="allShopsGrid"></div>

            <div className="snap-empty" id="emptyState" style={{ display: 'none' }}>
              <div className="snap-empty-icon">🔍</div>
              <h3>Aucune boutique trouvée</h3>
              <p>Essayez un autre terme de recherche</p>
              <button className="snap-btn-reset" onClick={() => resetSearch()}>
                Réinitialiser
              </button>
            </div>

            <div className="snap-load-more-wrap" id="loadMoreWrap" style={{ display: 'none' }}>
              <button className="snap-load-more-btn" id="btnLoadMore">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                Voir plus
              </button>
            </div>
          </section>
        </div>

        {/* ── SECTION ABONNEMENTS ── */}
        <div id="subscriptionsSection" style={{ display: 'none' }}>
          <div className="sub-stories-wrap">
            <div className="sub-stories-label">
              <span>🟢</span>
              <span>Nouvelles publications</span>
            </div>
            <div id="subStoriesBar"></div>
          </div>

          <div className="discover-section">
            <div className="discover-grid" id="subShopsGrid"></div>
            <div id="subEmptyState" style={{ display: 'none' }}>
              <span className="snap-empty-icon">🔔</span>
              <h3>Aucun abonnement</h3>
              <p>Abonnez-vous à des boutiques pour les retrouver ici</p>
            </div>
          </div>
        </div>

      </main>

      {/* ══ TOAST ══ */}
      <div className="toast-container" id="toastContainer"></div>

      {/* ══ MODAL BOUTIQUE ══ */}
      <div
        className="modal-overlay"
        id="shopModalOverlay"
        onClick={() => closeShopModal()}
      >
        <div
          className="modal-sheet"
          id="shopModal"
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-drag-handle"></div>
          <button className="modal-close" onClick={() => closeShopModal()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div id="shopModalContent"></div>
        </div>
      </div>
    </>
  );
}