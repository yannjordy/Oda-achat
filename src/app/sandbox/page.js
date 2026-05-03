'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

// ==================== SUPABASE ====================
const SUPABASE_URL      = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM'
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ==================== CSS GLOBAL ====================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

:root {
  --primary:        #FF6B00;
  --primary-dark:   #d95a00;
  --primary-glow:   rgba(255, 107, 0, 0.18);
  --sidebar-bg:     #0d0d14;
  --sidebar-width:  248px;
  --topbar-h:       60px;
  --bg:             #f4f5f7;
  --card:           #ffffff;
  --text:           #111827;
  --muted:          #6b7280;
  --border:         #e5e7eb;
  --success:        #10b981;
  --danger:         #ef4444;
  --info:           #3b82f6;
  --purple:         #8b5cf6;
  --telegram-color: #2CA5E0;
  --whatsapp-color: #25D366;
  --facebook-color: #1877F2;
  --shadow-sm:      0 1px 4px rgba(0,0,0,0.06);
  --shadow-md:      0 4px 20px rgba(0,0,0,0.08);
  --shadow-lg:      0 8px 40px rgba(0,0,0,0.12);
  --radius-sm:      10px;
  --radius-md:      14px;
  --radius-lg:      20px;
  --transition:     all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 16px; scroll-behavior: smooth; overflow-x: hidden; max-width: 100%; }
body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  overflow-x: hidden;
  max-width: 100%;
  width: 100%;
  position: relative;
}

/* === SIDEBAR === */
.sidebar {
  position: fixed;
  top: 0; left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  z-index: 900;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid rgba(255,255,255,0.04);
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.sidebar-logo-img { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; }
.sidebar-logo-fallback {
  width: 34px; height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  display: none;
  flex-shrink: 0;
}
.sidebar-logo-text { display: flex; flex-direction: column; line-height: 1; }
.logo-brand { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.1rem; color: white; letter-spacing: -0.02em; }
.logo-sub { font-size: 0.62rem; color: var(--primary); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; }
.sidebar-close-btn {
  display: none;
  margin-left: auto;
  background: rgba(255,255,255,0.08);
  border: none;
  color: rgba(255,255,255,0.6);
  width: 30px; height: 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}
.sidebar-close-btn:hover { background: rgba(255,255,255,0.14); color: white; }
.sidebar-shop-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 14px;
  padding: 12px 14px;
  background: rgba(255,107,0,0.1);
  border: 1px solid rgba(255,107,0,0.2);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.shop-avatar {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: rgba(255,107,0,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.shop-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.82rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.shop-badge { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--success); font-weight: 600; margin-top: 2px; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
.sidebar-nav { flex: 1; overflow-y: auto; padding: 8px 10px; scrollbar-width: none; }
.sidebar-nav::-webkit-scrollbar { display: none; }
.nav-section-label { font-size: 0.62rem; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; padding: 6px 10px 4px; text-transform: uppercase; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.55);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
  position: relative;
  margin-bottom: 2px;
}
.nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }
.nav-item.active { background: rgba(255, 107, 0, 0.15); color: var(--primary); }
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 3px;
  background: var(--primary);
  border-radius: 0 3px 3px 0;
}
.nav-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-label { flex: 1; }
.nav-badge { background: var(--danger); color: white; font-size: 0.62rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 5px; }
.nav-external { font-size: 0.7rem; opacity: 0.5; }
.nav-social.telegram:hover { color: var(--telegram-color); background: rgba(44, 165, 224, 0.12); }
.nav-social.whatsapp:hover { color: var(--whatsapp-color); background: rgba(37, 211, 102, 0.12); }
.nav-social.facebook:hover { color: var(--facebook-color); background: rgba(24, 119, 242, 0.12); }
.nav-download { background: rgba(255,107,0,0.08); border: 1px solid rgba(255,107,0,0.2); color: var(--primary) !important; font-weight: 600; }
.nav-download:hover { background: rgba(255,107,0,0.16) !important; color: var(--primary) !important; }
.sidebar-footer { padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.footer-link { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.4); font-size: 0.78rem; text-decoration: none; padding: 6px 8px; border-radius: 8px; transition: var(--transition); }
.footer-link:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); }
.footer-logout-btn { display: flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; font-size: 0.78rem; font-family: 'DM Sans', sans-serif; padding: 7px 10px; border-radius: 8px; cursor: pointer; transition: var(--transition); width: 100%; }
.footer-logout-btn:hover { background: rgba(239,68,68,0.2); }

/* === OVERLAY MOBILE === */
.sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); z-index: 850; opacity: 0; transition: opacity 0.3s; }
.sidebar-overlay.active { opacity: 1; }

/* === MAIN WRAPPER === */
.main-wrapper {
  margin-left: var(--sidebar-width);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
  width: calc(100% - var(--sidebar-width));
  max-width: calc(100% - var(--sidebar-width));
  overflow-x: hidden;
  transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1), max-width 0.3s cubic-bezier(0.4,0,0.2,1);
}

/* === TOPBAR === */
.topbar { position: sticky; top: 0; height: var(--topbar-h); background: rgba(255,255,255,0.96); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; z-index: 800; flex-shrink: 0; width: 100%; overflow: hidden; }
.topbar-left { display: flex; align-items: center; gap: 14px; }
.hamburger-btn { display: none; flex-direction: column; gap: 4px; background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; transition: var(--transition); }
.hamburger-btn:hover { background: var(--border); }
.hamburger-btn span { display: block; width: 20px; height: 2px; background: var(--text); border-radius: 2px; transition: var(--transition); }
.topbar-title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.05rem; color: var(--text); }
.topbar-right { display: flex; align-items: center; gap: 10px; }
.topbar-notif-btn { position: relative; background: var(--bg); border: 1px solid var(--border); color: var(--muted); width: 38px; height: 38px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition); }
.topbar-notif-btn:hover { background: var(--border); color: var(--text); }
.topbar-notif-badge { position: absolute; top: -4px; right: -4px; background: var(--danger); color: white; font-size: 0.58rem; font-weight: 700; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid white; }
.topbar-download-btn { display: flex; align-items: center; gap: 6px; background: var(--primary); color: white; text-decoration: none; font-size: 0.8rem; font-weight: 600; padding: 7px 14px; border-radius: 10px; transition: var(--transition); white-space: nowrap; }
.topbar-download-btn:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,107,0,0.35); }
.topbar-user { display: flex; align-items: center; gap: 8px; }
.topbar-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), #ff8c40); display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.9rem; color: white; flex-shrink: 0; box-shadow: 0 2px 8px rgba(255,107,0,0.3); }
.topbar-username { font-size: 0.85rem; font-weight: 600; color: var(--text); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* === CONTENT === */
.content-area { flex: 1; padding: 28px 28px 40px; width: 100%; max-width: 100%; overflow-x: hidden; box-sizing: border-box; }

/* === PANELS === */
.sb-panel { display: none; animation: fadeUp 0.3s ease; }
.sb-panel.active { display: block; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

/* === SHOP HERO === */
.shop-hero { position: relative; background: linear-gradient(135deg, #0d0d14 0%, #1a1428 50%, #0d0d14 100%); border-radius: var(--radius-lg); padding: 28px 32px; margin-bottom: 28px; overflow: hidden; border: 1px solid rgba(255,107,0,0.15); }
.shop-hero-glow { position: absolute; top: -40%; left: -10%; width: 400px; height: 300px; background: radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%); pointer-events: none; }
.shop-hero-content { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; position: relative; }
.shop-hero-icon { font-size: 2.8rem; width: 68px; height: 68px; background: rgba(255,107,0,0.12); border: 1px solid rgba(255,107,0,0.25); border-radius: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.shop-hero-name { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.5rem; color: white; letter-spacing: -0.02em; margin-bottom: 4px; }
.shop-hero-sub { font-size: 0.82rem; color: rgba(255,255,255,0.5); }
.shop-hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; position: relative; }
.hero-download-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--primary); color: white; text-decoration: none; font-size: 0.85rem; font-weight: 700; padding: 10px 20px; border-radius: var(--radius-sm); transition: var(--transition); white-space: nowrap; }
.hero-download-btn:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,107,0,0.4); }
.hero-socials { display: flex; gap: 8px; flex-wrap: wrap; }
.social-pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: var(--radius-sm); text-decoration: none; font-size: 0.8rem; font-weight: 600; transition: var(--transition); white-space: nowrap; }
.social-pill.telegram { background: rgba(44, 165, 224, 0.15); color: var(--telegram-color); border: 1px solid rgba(44, 165, 224, 0.25); }
.social-pill.whatsapp { background: rgba(37, 211, 102, 0.15); color: var(--whatsapp-color); border: 1px solid rgba(37, 211, 102, 0.25); }
.social-pill.facebook { background: rgba(24, 119, 242, 0.15); color: var(--facebook-color); border: 1px solid rgba(24, 119, 242, 0.25); }
.social-pill:hover { transform: translateY(-2px); filter: brightness(1.1); }

/* === KPI GRID === */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; width: 100%; }
.kpi-card { background: var(--card); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); display: flex; align-items: center; gap: 14px; transition: var(--transition); position: relative; overflow: hidden; min-width: 0; cursor: pointer; }
.kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: var(--radius-md) var(--radius-md) 0 0; background: var(--kpi-color, var(--primary)); opacity: 0; transition: opacity 0.2s; }
.kpi-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.kpi-card:hover::before { opacity: 1; }
/* Ripple effect on KPI tap */
.kpi-card:active { transform: scale(0.97); }
.kpi-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
.kpi-icon.orange { background: rgba(255,107,0,0.1); }
.kpi-icon.green  { background: rgba(16,185,129,0.1); }
.kpi-icon.blue   { background: rgba(59,130,246,0.1); }
.kpi-icon.purple { background: rgba(139,92,246,0.1); }
.kpi-card.orange-card { --kpi-color: var(--primary); }
.kpi-card.green-card  { --kpi-color: var(--success); }
.kpi-card.blue-card   { --kpi-color: var(--info); }
.kpi-card.purple-card { --kpi-color: var(--purple); }
.kpi-label { font-size: 0.75rem; color: var(--muted); font-weight: 500; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
.kpi-value { font-family: 'Sora', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--text); line-height: 1; letter-spacing: -0.03em; }

/* === SECTION HEADER === */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
.section-title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: var(--text); }

/* === FILTER PILLS === */
.filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-pill { padding: 5px 14px; border: 1.5px solid var(--border); background: white; border-radius: 20px; font-size: 0.78rem; font-weight: 600; color: var(--muted); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: var(--transition); white-space: nowrap; }
.filter-pill:hover { border-color: var(--primary); color: var(--primary); }
.filter-pill.active { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 3px 10px rgba(255,107,0,0.3); }
.filter-pill:active { transform: scale(0.95); }

/* === PRODUCTS GRID === */
.products-grid { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.product-row {
  background: var(--card);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  border: 1.5px solid var(--border);
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: var(--transition);
  width: 100%;
  min-width: 0;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}
.product-row:hover { border-color: var(--primary); box-shadow: 0 4px 20px rgba(255,107,0,0.08); transform: translateX(3px); }
.product-row:active { transform: scale(0.99); background: rgba(255,107,0,0.03); }
/* Ripple tactile sur product-row */
.product-row::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--tap-x, 50%) var(--tap-y, 50%), rgba(255,107,0,0.12) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
  border-radius: inherit;
  pointer-events: none;
}
.product-row.tapped::after { opacity: 1; }

.product-thumb { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; background: var(--bg); flex-shrink: 0; }
.product-thumb-placeholder { width: 56px; height: 56px; border-radius: 10px; background: linear-gradient(135deg, #f0f2f5, #e5e7eb); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
.product-info { flex: 1; min-width: 0; }
.product-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-cat { font-size: 0.73rem; color: var(--muted); background: var(--bg); padding: 2px 8px; border-radius: 6px; display: inline-block; }
.product-status { flex-shrink: 0; }
.status-badge { font-size: 0.68rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em; }
.status-badge.published { background: rgba(16,185,129,0.1); color: var(--success); }
.status-badge.draft     { background: rgba(107,114,128,0.1); color: var(--muted); }
.product-stats { display: flex; gap: 16px; align-items: center; flex-shrink: 0; }
.stat-item { display: flex; align-items: center; gap: 4px; font-size: 0.82rem; font-weight: 600; color: var(--muted); min-width: 40px; }
.stat-item.likes    { color: #ef4444; }
.stat-item.comments { color: var(--info); }
.stat-item.clicks   { color: var(--success); }
.product-price { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.9rem; color: var(--primary); flex-shrink: 0; min-width: 100px; text-align: right; }
.arrow-icon { color: var(--muted); font-size: 1.2rem; flex-shrink: 0; transition: var(--transition); }
.product-row:hover .arrow-icon { color: var(--primary); transform: translateX(3px); }

/* === PANEL HEADER === */
.panel-header { margin-bottom: 24px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.panel-header-text { flex: 1; }
.panel-title { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.3rem; color: var(--text); margin-bottom: 4px; letter-spacing: -0.02em; }
.panel-sub { font-size: 0.85rem; color: var(--muted); }
.panel-refresh-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg); border: 1.5px solid var(--border);
  color: var(--muted); font-size: 0.75rem; font-weight: 600;
  padding: 6px 12px; border-radius: 20px;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: var(--transition); white-space: nowrap; flex-shrink: 0;
}
.panel-refresh-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
.panel-refresh-btn:active { transform: scale(0.95); }
.panel-refresh-btn.spinning svg { animation: spin 0.75s linear infinite; }

/* === CHARTS === */
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }

/* ✨ FIX: chart-card glow & interaction */
.chart-card {
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  min-width: 0;
  overflow: hidden;
  width: 100%;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  position: relative;
}
.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.chart-card:active { transform: scale(0.99); }

/* Glow animation au clic */
@keyframes chartGlowOrange {
  0%   { box-shadow: 0 0 0 0 rgba(255,107,0,0.55), var(--shadow-sm); border-color: rgba(255,107,0,0.5); }
  50%  { box-shadow: 0 0 0 8px rgba(255,107,0,0.08), 0 0 32px rgba(255,107,0,0.25); border-color: rgba(255,107,0,0.6); }
  100% { box-shadow: 0 0 0 0 rgba(255,107,0,0), var(--shadow-sm); border-color: var(--border); }
}
@keyframes chartGlowBlue {
  0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.55), var(--shadow-sm); border-color: rgba(59,130,246,0.5); }
  50%  { box-shadow: 0 0 0 8px rgba(59,130,246,0.08), 0 0 32px rgba(59,130,246,0.25); border-color: rgba(59,130,246,0.6); }
  100% { box-shadow: 0 0 0 0 rgba(59,130,246,0), var(--shadow-sm); border-color: var(--border); }
}
@keyframes chartGlowPurple {
  0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.55), var(--shadow-sm); border-color: rgba(139,92,246,0.5); }
  50%  { box-shadow: 0 0 0 8px rgba(139,92,246,0.08), 0 0 32px rgba(139,92,246,0.25); border-color: rgba(139,92,246,0.6); }
  100% { box-shadow: 0 0 0 0 rgba(139,92,246,0), var(--shadow-sm); border-color: var(--border); }
}
@keyframes chartGlowGreen {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.55), var(--shadow-sm); border-color: rgba(16,185,129,0.5); }
  50%  { box-shadow: 0 0 0 8px rgba(16,185,129,0.08), 0 0 32px rgba(16,185,129,0.25); border-color: rgba(16,185,129,0.6); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0), var(--shadow-sm); border-color: var(--border); }
}
.chart-card.glow-orange { animation: chartGlowOrange 0.8s ease-out forwards; }
.chart-card.glow-blue   { animation: chartGlowBlue   0.8s ease-out forwards; }
.chart-card.glow-purple { animation: chartGlowPurple 0.8s ease-out forwards; }
.chart-card.glow-green  { animation: chartGlowGreen  0.8s ease-out forwards; }

/* Indicateur "clique pour zoomer" subtil */
.chart-card::before {
  content: '✦';
  position: absolute;
  top: 10px; right: 52px;
  font-size: 0.55rem;
  color: var(--muted);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.chart-card:hover::before { opacity: 0.5; }

.chart-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.chart-title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.95rem; color: var(--text); margin-bottom: 3px; }
.chart-subtitle { font-size: 0.78rem; color: var(--muted); }
.chart-badge { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.chart-badge.orange { background: rgba(255,107,0,0.1); }
.chart-badge.blue   { background: rgba(59,130,246,0.1); }
.chart-badge.purple { background: rgba(139,92,246,0.1); }
.chart-badge.green  { background: rgba(16,185,129,0.1); }
.chart-container { position: relative; height: 280px; }

/* === NOTIFICATIONS === */
.notif-list { display: flex; flex-direction: column; gap: 10px; }
.notif-item { background: var(--card); border-radius: var(--radius-md); padding: 16px 20px; border: 1.5px solid var(--border); display: flex; align-items: flex-start; gap: 14px; animation: slideIn 0.35s ease; transition: var(--transition); }
.notif-item:hover { border-color: var(--info); transform: translateX(3px); }
.notif-item.unread { border-left: 4px solid var(--info); background: #f0f6ff; }
.notif-item.is-report { border-left: 4px solid #EF4444; background: #FEF2F2; }
.notif-item.is-report:hover { border-color: #EF4444; }
.notif-item.is-report .notif-icon { background: rgba(239,68,68,0.1); }
.notif-item.is-report { cursor: pointer; user-select: none; }
.notif-item.is-report .notif-content { flex: 1; }
.notif-delete-btn { width: 30px; height: 30px; border: none; background: rgba(239,68,68,0.1); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #EF4444; transition: all .2s; flex-shrink: 0; align-self: flex-start; margin-top: 6px; }
.notif-delete-btn:hover { background: #EF4444; color: #fff; transform: scale(1.1); }
.notif-count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; padding: 0 8px; background: #EF4444; color: #fff; font-size: 0.75rem; font-weight: 700; border-radius: 12px; margin-left: 8px; }
.report-expanded { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
.report-individual { padding: 10px 12px; background: rgba(239,68,68,0.06); border-radius: 8px; border-left: 3px solid #EF4444; }
.report-individual-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.report-individual-num { font-size: 0.78rem; font-weight: 700; color: #EF4444; }
.report-individual-date { font-size: 0.72rem; color: #999; }
.report-individual-text { font-size: 0.84rem; color: #333; line-height: 1.6; white-space: pre-wrap; }
.notif-count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; padding: 0 8px; background: #EF4444; color: #fff; font-size: 0.75rem; font-weight: 700; border-radius: 12px; margin-left: 8px; }
.report-expanded { margin-top: 10px; padding: 12px; background: rgba(239,68,68,0.05); border-radius: 8px; border-left: 3px solid #EF4444; }
.report-full-text { font-size: 0.84rem; color: #333; line-height: 1.6; white-space: pre-wrap; }
.report-expand-hint { font-size: 0.72rem; color: #EF4444; margin-top: 6px; font-weight: 500; }
.report-product-info { display: flex; gap: 12px; margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.7); border-radius: 10px; border: 1px solid rgba(239,68,68,0.15); }
.report-product-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.report-product-details { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.report-product-price { font-weight: 700; font-size: 0.85rem; color: #EF4444; }
.report-product-stock { font-size: 0.75rem; color: var(--muted); }
.report-product-stock.low { color: #F59E0B; font-weight: 600; }
@keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
.notif-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(59,130,246,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.notif-content { flex: 1; }
.notif-title { font-weight: 700; font-size: 0.88rem; margin-bottom: 3px; }
.notif-body  { font-size: 0.82rem; color: var(--muted); line-height: 1.5; }
.notif-time  { font-size: 0.73rem; color: var(--muted); margin-top: 6px; }
.no-notifs { text-align: center; padding: 80px 20px; color: var(--muted); }
.no-notifs-icon { font-size: 3rem; margin-bottom: 14px; display: block; }

/* === MODAL COMMENTAIRES === */
.comments-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px); z-index: 99999; display: flex; align-items: flex-end; justify-content: center; opacity: 0; visibility: hidden; transition: all 0.3s; }
.comments-overlay.active { opacity: 1; visibility: visible; }
.comments-sheet { background: white; border-radius: 24px 24px 0 0; width: 100%; max-width: 680px; max-height: 82vh; display: flex; flex-direction: column; transform: translateY(100%); transition: transform 0.38s cubic-bezier(0.34, 1.15, 0.64, 1); box-shadow: 0 -20px 60px rgba(0,0,0,0.2); touch-action: pan-y; }
.comments-overlay.active .comments-sheet { transform: translateY(0); }
.comments-handle { width: 40px; height: 4px; background: #e5e7eb; border-radius: 2px; margin: 14px auto 0; cursor: grab; }
.comments-handle:active { cursor: grabbing; }
.comments-header { padding: 16px 24px 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.comments-header h3 { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.95rem; }
.close-btn { background: var(--bg); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: var(--transition); }
.close-btn:hover { background: var(--border); color: var(--text); }
.comments-body { flex: 1; overflow-y: auto; padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
.comment-item { background: var(--bg); border-radius: var(--radius-sm); padding: 12px 16px; }
.comment-author { font-weight: 700; font-size: 0.83rem; margin-bottom: 5px; color: var(--text); }
.comment-text { font-size: 0.88rem; color: var(--text); line-height: 1.55; }
.comment-meta { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
.comment-date { font-size: 0.73rem; color: var(--muted); }
.comment-rating { font-size: 0.78rem; color: #f59e0b; font-weight: 600; }
.no-comments { text-align: center; padding: 50px 20px; color: var(--muted); }
.no-comments-icon { font-size: 2.5rem; display: block; margin-bottom: 10px; }

/* === LOADER === */
.sb-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; color: var(--muted); gap: 14px; font-size: 0.88rem; grid-column: 1 / -1; }
.sb-spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* === EMPTY STATE === */
.empty-state { text-align: center; padding: 80px 20px; color: var(--muted); }
.empty-icon  { font-size: 3rem; display: block; margin-bottom: 14px; }
.empty-title { font-family: 'Sora', sans-serif; font-size: 1.05rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.empty-text  { font-size: 0.85rem; line-height: 1.6; }

/* === SEARCH BAR === */
.search-bar-wrapper { position: relative; margin-bottom: 16px; width: 100%; }
.search-bar-wrapper svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; flex-shrink: 0; }
.search-input { width: 100%; padding: 11px 14px 11px 42px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); background: var(--card); font-family: 'DM Sans', sans-serif; font-size: 0.88rem; color: var(--text); outline: none; transition: var(--transition); box-sizing: border-box; }
.search-input::placeholder { color: var(--muted); }
.search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
.search-count { font-size: 0.75rem; color: var(--muted); margin-bottom: 10px; font-weight: 500; }

/* === TOAST === */
.sb-toast { position: fixed; bottom: 24px; right: 24px; background: #111827; color: white; padding: 12px 18px; border-radius: 12px; font-size: 0.85rem; font-weight: 500; z-index: 999999; box-shadow: 0 8px 32px rgba(0,0,0,0.25); transform: translateY(80px); opacity: 0; transition: all 0.4s cubic-bezier(0.34, 1.4, 0.64, 1); max-width: 320px; display: flex; align-items: center; gap: 10px; }
.sb-toast.show    { transform: translateY(0); opacity: 1; }
.sb-toast.success { background: var(--success); }
.sb-toast.info    { background: var(--info); }
.sb-toast.error   { background: var(--danger); }

/* =============================================
   MOBILE BOTTOM NAVIGATION BAR  ✨ NOUVEAU
   ============================================= */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  z-index: 700;
  padding: 4px 0 env(safe-area-inset-bottom, 4px);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
}
.mobile-nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  transition: var(--transition);
  position: relative;
  -webkit-tap-highlight-color: transparent;
  min-height: 52px;
}
.mobile-nav-tab.active { color: var(--primary); }
.mobile-nav-tab.active svg { transform: translateY(-2px); }
.mobile-nav-tab:active { transform: scale(0.9); }
.mobile-nav-tab svg { transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
/* Indicateur actif sous l'icône */
.mobile-nav-tab::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%; transform: translateX(-50%);
  width: 4px; height: 4px;
  border-radius: 2px;
  background: var(--primary);
  opacity: 0;
  transition: opacity 0.2s, width 0.2s;
}
.mobile-nav-tab.active::after { opacity: 1; width: 20px; }
.mobile-nav-dot {
  position: absolute;
  top: 5px; right: calc(50% - 20px);
  width: 7px; height: 7px;
  background: var(--danger);
  border-radius: 50%;
  border: 2px solid white;
}

/* === SCROLL-TO-TOP BUTTON ✨ NOUVEAU === */
.scroll-top-btn {
  display: none;
  position: fixed;
  bottom: 80px;
  right: 16px;
  width: 40px; height: 40px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(255,107,0,0.35);
  z-index: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
}
.scroll-top-btn.visible { display: flex; }
.scroll-top-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,107,0,0.45); }
.scroll-top-btn:active { transform: scale(0.92); }

/* === RESPONSIVE === */
@media (max-width: 1280px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .topbar-username { display: none; }
}
@media (max-width: 1024px) {
  .charts-row { grid-template-columns: 1fr; }
  .topbar-download-btn span { display: none; }
  .topbar-download-btn { padding: 7px 10px; }
}
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); box-shadow: none; width: 260px; }
  .sidebar.open { transform: translateX(0); box-shadow: 4px 0 30px rgba(0,0,0,0.4); }
  .sidebar-overlay.active { display: block; }
  .sidebar-close-btn { display: flex; }
  .hamburger-btn { display: flex; }
  .main-wrapper { margin-left: 0 !important; width: 100% !important; max-width: 100% !important; }
  .topbar { padding: 0 14px; }
  .topbar-download-btn { display: none; }
  /* Espace pour bottom nav */
  .content-area { padding: 16px 14px 90px; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .shop-hero { padding: 20px 18px; }
  .shop-hero-name { font-size: 1.15rem; }
  .shop-hero-actions { flex-direction: column; align-items: flex-start; gap: 10px; }
  .product-stats { gap: 10px; }
  .product-price { display: none; }
  .product-status { display: none; }
  .charts-row { gap: 14px; }
  .chart-container { height: 240px; }
  /* Afficher bottom nav */
  .mobile-bottom-nav { display: flex; }
  /* Toast remonte au-dessus de la bottom nav */
  .sb-toast { bottom: 72px; }
  /* Scroll-to-top visible */
  .scroll-top-btn.visible { display: flex; }
}
@media (max-width: 480px) {
  .kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .kpi-value { font-size: 1.4rem; }
  .kpi-card { padding: 13px 12px; gap: 10px; }
  .kpi-icon { width: 40px; height: 40px; font-size: 1rem; border-radius: 10px; }
  .kpi-label { font-size: 0.7rem; }
  .shop-hero { padding: 16px 14px; border-radius: var(--radius-md); }
  .shop-hero-icon { width: 52px; height: 52px; font-size: 2rem; border-radius: 14px; }
  .shop-hero-name { font-size: 1.05rem; }
  .shop-hero-sub { font-size: 0.75rem; }
  .hero-download-btn { font-size: 0.78rem; padding: 8px 12px; width: 100%; justify-content: center; }
  .hero-socials { width: 100%; }
  .social-pill { padding: 6px 10px; font-size: 0.73rem; flex: 1; justify-content: center; }
  .product-row { padding: 11px 12px; gap: 10px; }
  .product-thumb, .product-thumb-placeholder { width: 44px; height: 44px; border-radius: 8px; }
  .product-name { font-size: 0.83rem; }
  .product-cat { font-size: 0.68rem; }
  .stat-item { font-size: 0.75rem; gap: 3px; min-width: 28px; }
  .arrow-icon { display: none; }
  .section-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  /* ✨ FIX: Filter pills scrollables sur mobile */
  .filter-pills { width: 100%; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .filter-pills::-webkit-scrollbar { display: none; }
  .filter-pill { flex-shrink: 0; font-size: 0.73rem; padding: 5px 12px; }
  .search-input { font-size: 0.84rem; }
  .chart-card { padding: 14px; }
  .chart-container { height: 220px; }
  .chart-title { font-size: 0.85rem; }
  .chart-subtitle { font-size: 0.72rem; }
  .chart-badge { width: 32px; height: 32px; font-size: 0.9rem; }
  .notif-item { padding: 12px 14px; gap: 10px; }
  .notif-icon { width: 34px; height: 34px; font-size: 0.95rem; }
  .notif-title { font-size: 0.82rem; }
  .notif-body  { font-size: 0.76rem; }
  .panel-title { font-size: 1.05rem; }
  .panel-sub { font-size: 0.8rem; }
  .topbar { padding: 0 12px; height: 54px; }
  .topbar-title { font-size: 0.88rem; }
  .topbar-avatar { width: 32px; height: 32px; font-size: 0.82rem; }
  .sb-toast { bottom: 68px; right: 10px; left: 10px; max-width: none; font-size: 0.8rem; }
  .comments-header { padding: 14px 16px 12px; }
  .comments-body { padding: 12px 14px; }
  .kpi-card { flex-direction: row; }
  .product-stats { gap: 6px; }
  .stat-item { min-width: 24px; font-size: 0.72rem; }
  .panel-refresh-btn { font-size: 0.7rem; padding: 5px 10px; }
}

/* === RÉPONSE VENDEUR === */
.comment-reply-btn { display: inline-flex; align-items: center; gap: 5px; background: none; border: 1.5px solid var(--border); color: var(--muted); font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: var(--transition); margin-top: 8px; }
.comment-reply-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
.reply-form { margin-top: 10px; background: rgba(255,107,0,0.04); border: 1.5px solid rgba(255,107,0,0.2); border-radius: var(--radius-sm); padding: 10px 12px; animation: fadeUp 0.22s ease; }
.reply-textarea { width: 100%; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--text); resize: none; outline: none; min-height: 56px; }
.reply-textarea::placeholder { color: var(--muted); }
.reply-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; }
.reply-cancel-btn { background: none; border: none; color: var(--muted); font-size: 0.78rem; cursor: pointer; padding: 4px 8px; border-radius: 6px; font-family: 'DM Sans', sans-serif; }
.reply-cancel-btn:hover { color: var(--text); }
.reply-send-btn { background: var(--primary); color: white; border: none; font-size: 0.78rem; font-weight: 700; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: var(--transition); display: flex; align-items: center; gap: 5px; }
.reply-send-btn:hover { background: var(--primary-dark); }
.reply-send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.vendor-reply { background: rgba(255,107,0,0.06); border-left: 3px solid var(--primary); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; padding: 10px 14px; margin-top: 8px; }
.vendor-reply-label { font-size: 0.68rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }
.vendor-reply-text { font-size: 0.84rem; color: var(--text); line-height: 1.5; }
.vendor-reply-date { font-size: 0.7rem; color: var(--muted); margin-top: 5px; }
`

// ==================== SOUS-COMPOSANT : LIGNE PRODUIT ====================
function ProductRow({ p, mesLikes, mesCommentaires, mesClics, searchTerm, onOpenComments }) {
  const [imgError, setImgError] = useState(false)
  const [tapped,   setTapped]   = useState(false)
  const likes    = mesLikes[p.id] || 0
  const comments = (mesCommentaires[p.id] || []).length
  const clics    = mesClics[p.id] || 0
  const isDraft  = (s) => s === false || s === 0 || s === 'draft' || s === 'brouillon' || s === 'inactif' || s === 'inactive'
  const isPublished = !isDraft(p.statut)

  let nomAffiche = p.nom || 'Produit sans nom'
  if (searchTerm) {
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    nomAffiche = nomAffiche.replace(regex, '<mark style="background:rgba(255,107,0,0.2);color:#FF6B00;border-radius:3px;padding:0 2px;">$1</mark>')
  }

  function handleClick(e) {
    // Effet ripple tactile
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top)  / rect.height) * 100
    e.currentTarget.style.setProperty('--tap-x', `${x}%`)
    e.currentTarget.style.setProperty('--tap-y', `${y}%`)
    setTapped(true)
    setTimeout(() => setTapped(false), 400)
    onOpenComments(p.id, p.nom || '')
  }

  return (
    <div className={`product-row${tapped ? ' tapped' : ''}`} onClick={handleClick}>
      {!imgError && p.main_image
        ? <img className="product-thumb" src={p.main_image} alt={p.nom} onError={() => setImgError(true)} />
        : <div className="product-thumb-placeholder">📷</div>
      }
      <div className="product-info">
        <div className="product-name" dangerouslySetInnerHTML={{ __html: nomAffiche }} />
        <div className="product-cat">{p.categorie || 'Non catégorisé'}</div>
      </div>
      <div className="product-status">
        <span className={`status-badge ${isPublished ? 'published' : 'draft'}`}>
          {isPublished ? 'Publié' : 'Brouillon'}
        </span>
      </div>
      <div className="product-stats">
        <div className="stat-item likes">❤️ {likes}</div>
        <div className="stat-item comments">💬 {comments}</div>
        <div className="stat-item clicks">👁️ {clics}</div>
      </div>
      <div className="product-price">{(p.prix || 0).toLocaleString()} FCFA</div>
      <div className="arrow-icon">›</div>
    </div>
  )
}

// ==================== UTILITAIRES CANVAS (remplace chart.js) ====================

function setupCanvas(canvas) {
  if (!canvas) return null
  const parent = canvas.parentElement
  if (!parent) return null
  const dpr = window.devicePixelRatio || 1

  // ✅ FIX: Si le panel est display:none, clientWidth = 0 → utiliser getBoundingClientRect
  let W = parent.clientWidth
  let H = parent.clientHeight
  if (W === 0) {
    const rect = parent.getBoundingClientRect()
    W = rect.width || 400
  }
  if (H === 0) {
    // Essayer la hauteur CSS computée
    const cs = window.getComputedStyle(parent)
    H = parseInt(cs.height) || 280
  }
  if (W === 0 || H === 0) return null

  canvas.width  = W * dpr
  canvas.height = H * dpr
  canvas.style.width  = W + 'px'
  canvas.style.height = H + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)
  return { ctx, W, H }
}

function drawBarChart(canvas, labels, values, barColor) {
  const s = setupCanvas(canvas)
  if (!s || !labels.length) return
  const { ctx, W, H } = s
  const pad = { top: 24, right: 16, bottom: 56, left: 48 }
  const cW = W - pad.left - pad.right
  const cH = H - pad.top - pad.bottom
  const maxVal = Math.max(...values, 1)
  const steps = 4

  ctx.font = '11px DM Sans, sans-serif'
  ctx.textAlign = 'right'
  for (let i = 0; i <= steps; i++) {
    const y = pad.top + cH - (i / steps) * cH
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke()
    ctx.fillStyle = '#9ca3af'
    ctx.fillText(Math.round((i / steps) * maxVal), pad.left - 6, y + 4)
  }

  const slotW = cW / labels.length
  const barW  = Math.min(slotW * 0.6, 52)

  labels.forEach((label, i) => {
    const val  = values[i] || 0
    const barH = Math.max((val / maxVal) * cH, val > 0 ? 2 : 0)
    const x    = pad.left + i * slotW + slotW / 2 - barW / 2
    const y    = pad.top + cH - barH
    const r    = Math.min(6, barW / 2, barH > 0 ? barH : 6)

    if (barH > 0) {
      ctx.fillStyle = barColor
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + barW - r, y)
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r)
      ctx.lineTo(x + barW, y + barH)
      ctx.lineTo(x, y + barH)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.fill()
    }

    ctx.save()
    ctx.translate(x + barW / 2, pad.top + cH + 14)
    ctx.rotate(-0.55)
    ctx.fillStyle = '#6b7280'
    ctx.font = '10px DM Sans, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(label, 0, 0)
    ctx.restore()
  })
}

function drawGroupedBarChart(canvas, labels, datasets) {
  const s = setupCanvas(canvas)
  if (!s || !labels.length) return
  const { ctx, W, H } = s
  const pad = { top: 36, right: 16, bottom: 56, left: 48 }
  const cW = W - pad.left - pad.right
  const cH = H - pad.top - pad.bottom
  const allVals = datasets.flatMap(d => d.data)
  const maxVal  = Math.max(...allVals, 1)
  const steps   = 4

  ctx.font = '11px DM Sans, sans-serif'
  ctx.textAlign = 'right'
  for (let i = 0; i <= steps; i++) {
    const y = pad.top + cH - (i / steps) * cH
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke()
    ctx.fillStyle = '#9ca3af'
    ctx.fillText(Math.round((i / steps) * maxVal), pad.left - 6, y + 4)
  }

  const legendX = pad.left
  datasets.forEach((ds, di) => {
    const lx = legendX + di * 120
    ctx.fillStyle = ds.color
    ctx.fillRect(lx, 8, 12, 12)
    ctx.fillStyle = '#374151'
    ctx.font = '11px DM Sans, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(ds.label, lx + 16, 19)
  })

  const groupW = cW / labels.length
  const n      = datasets.length
  const barW   = Math.min(groupW / (n + 1), 28)
  const gap    = 3

  labels.forEach((label, i) => {
    const groupX = pad.left + i * groupW + groupW / 2 - (n * barW + (n - 1) * gap) / 2
    datasets.forEach((ds, di) => {
      const val  = ds.data[i] || 0
      const barH = Math.max((val / maxVal) * cH, val > 0 ? 2 : 0)
      const x    = groupX + di * (barW + gap)
      const y    = pad.top + cH - barH
      const r    = Math.min(4, barW / 2, barH > 0 ? barH : 4)

      if (barH > 0) {
        ctx.fillStyle = ds.color
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + barW - r, y)
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r)
        ctx.lineTo(x + barW, y + barH)
        ctx.lineTo(x, y + barH)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
        ctx.fill()
      }
    })

    ctx.save()
    ctx.translate(pad.left + i * groupW + groupW / 2, pad.top + cH + 14)
    ctx.rotate(-0.45)
    ctx.fillStyle = '#6b7280'
    ctx.font = '10px DM Sans, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(label, 0, 0)
    ctx.restore()
  })
}

// ✅ FIX MAJEUR: Doughnut responsive — légende à droite sur desktop, en bas sur mobile
function drawDoughnutChart(canvas, labels, values, colors) {
  const s = setupCanvas(canvas)
  if (!s || !labels.length) return
  const { ctx, W, H } = s
  const total = values.reduce((a, b) => a + b, 0)
  if (total === 0) return

  // ✅ Détecter mobile : si la largeur est < 420, passer en mode compact
  const isMobile = W < 420

  // Positionnement du centre selon le mode
  const cx      = isMobile ? W / 2 : W * 0.36
  const cy      = isMobile ? H * 0.42 : H / 2
  const maxR    = isMobile
    ? Math.min(W * 0.36, H * 0.36)
    : Math.min(W * 0.36, H * 0.46)
  const radius  = maxR
  const inner   = radius * 0.62
  const dur     = 900
  let   startT  = null

  function render(ts) {
    if (!startT) startT = ts
    const prog = Math.min((ts - startT) / dur, 1)
    const ease = 1 - Math.pow(1 - prog, 3)

    ctx.clearRect(0, 0, W, H)

    let angle = -Math.PI / 2
    values.forEach((val, i) => {
      const slice = (val / total) * Math.PI * 2 * ease
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, angle, angle + slice)
      ctx.closePath()
      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
      angle += slice
    })

    // Trou intérieur
    ctx.beginPath()
    ctx.arc(cx, cy, inner, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()

    // Texte central
    ctx.globalAlpha = ease
    ctx.fillStyle = '#111827'
    ctx.font = `bold ${isMobile ? '16px' : '20px'} Sora, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(total, cx, cy + (isMobile ? 4 : 6))
    ctx.fillStyle = '#6b7280'
    ctx.font = `${isMobile ? '9px' : '11px'} DM Sans, sans-serif`
    ctx.fillText('produits', cx, cy + (isMobile ? 16 : 20))
    ctx.globalAlpha = 1

    // ✅ Légende : à droite sur desktop, en bas sur mobile
    if (isMobile) {
      // Légende en bas centrée
      const legendStartY = cy + radius + 12
      const colW = W / 2
      labels.forEach((label, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const lx  = col === 0 ? 8 : colW + 8
        const ly  = legendStartY + row * 18
        ctx.globalAlpha = Math.min(ease * 1.4, 1)
        ctx.fillStyle = colors[i % colors.length]
        ctx.beginPath()
        ctx.arc(lx + 5, ly, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#374151'
        ctx.font = '9px DM Sans, sans-serif'
        ctx.textAlign = 'left'
        const pct = Math.round((values[i] / total) * 100)
        const txt = label.length > 10 ? label.substring(0, 10) + '…' : label
        ctx.fillText(`${txt} (${pct}%)`, lx + 13, ly + 4)
        ctx.globalAlpha = 1
      })
    } else {
      // Légende à droite
      const legendX = W * 0.70
      const lineH   = 22
      const startY  = cy - ((labels.length * lineH) / 2) + lineH / 2
      labels.forEach((label, i) => {
        const y = startY + i * lineH
        ctx.globalAlpha = Math.min(ease * 1.4, 1)
        ctx.fillStyle = colors[i % colors.length]
        ctx.beginPath()
        ctx.arc(legendX, y, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#374151'
        ctx.font = '11px DM Sans, sans-serif'
        ctx.textAlign = 'left'
        const pct = Math.round((values[i] / total) * 100)
        const avail = W - legendX - 10
        const maxChars = Math.max(6, Math.floor(avail / 7))
        const txt = label.length > maxChars ? label.substring(0, maxChars) + '…' : label
        ctx.fillText(`${txt} (${pct}%)`, legendX + 10, y + 4)
        ctx.globalAlpha = 1
      })
    }

    if (prog < 1) requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

function drawHorizontalBarChart(canvas, labels, values, barColor) {
  const s = setupCanvas(canvas)
  if (!s || !labels.length) return
  const { ctx, W, H } = s

  // ✅ FIX: padding gauche responsive (110 trop grand sur mobile)
  const labelPad = Math.min(110, W * 0.28)
  const pad    = { top: 16, right: 60, bottom: 16, left: labelPad }
  const cW     = W - pad.left - pad.right
  const cH     = H - pad.top - pad.bottom
  const maxVal = Math.max(...values, 1)
  const barH   = Math.min((cH / labels.length) * 0.6, 28)
  const slotH  = cH / labels.length
  const dur    = 800
  let   startT = null

  function render(ts) {
    if (!startT) startT = ts
    const prog = Math.min((ts - startT) / dur, 1)
    ctx.clearRect(0, 0, W, H)

    labels.forEach((label, i) => {
      const barProg = Math.min(Math.max((prog - i * 0.08) / (1 - labels.length * 0.08 + 0.08), 0), 1)
      const ease    = 1 - Math.pow(1 - barProg, 3)
      const val     = values[i] || 0
      const fullBW  = (val / maxVal) * cW
      const bW      = fullBW * ease
      const y       = pad.top + i * slotH + slotH / 2 - barH / 2
      const r       = Math.min(6, barH / 2, bW > 4 ? bW : 4)

      // Track
      ctx.fillStyle = 'rgba(0,0,0,0.05)'
      ctx.beginPath()
      ctx.roundRect ? ctx.roundRect(pad.left, y, cW, barH, 6) : ctx.rect(pad.left, y, cW, barH)
      ctx.fill()

      // Barre animée
      if (bW > 4) {
        ctx.fillStyle = barColor
        ctx.beginPath()
        ctx.moveTo(pad.left, y)
        ctx.lineTo(pad.left + bW - r, y)
        ctx.quadraticCurveTo(pad.left + bW, y, pad.left + bW, y + r)
        ctx.lineTo(pad.left + bW, y + barH - r)
        ctx.quadraticCurveTo(pad.left + bW, y + barH, pad.left + bW - r, y + barH)
        ctx.lineTo(pad.left, y + barH)
        ctx.closePath()
        ctx.fill()
      }

      // Label Y
      ctx.globalAlpha = Math.min(ease * 2, 1)
      ctx.fillStyle = '#374151'
      const fontSize = W < 400 ? 9 : 11
      ctx.font = `${fontSize}px DM Sans, sans-serif`
      ctx.textAlign = 'right'
      const maxChars = Math.max(8, Math.floor((labelPad - 10) / (fontSize * 0.6)))
      const lbl = label.length > maxChars ? label.substring(0, maxChars) + '…' : label
      ctx.fillText(lbl, pad.left - 8, y + barH / 2 + 4)

      // Valeur à droite
      ctx.fillStyle = '#6b7280'
      ctx.font = `${Math.max(8, fontSize - 1)}px DM Sans, sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText(val.toLocaleString() + ' F', pad.left + fullBW + 6, y + barH / 2 + 4)
      ctx.globalAlpha = 1
    })

    if (prog < 1) requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

// ==================== COMPOSANT PRINCIPAL ====================
export default function ODAStudio() {

  // ===== STATE =====
  const [sbAvatar,          setSbAvatar]          = useState('?')
  const [sbUserName,        setSbUserName]        = useState('')
  const [shopNom,           setShopNom]           = useState(null)
  const [mesProduits,       setMesProduits]       = useState([])
  const [mesLikes,          setMesLikes]          = useState({})
  const [mesCommentaires,   setMesCommentaires]   = useState({})
  const [mesClics,          setMesClics]          = useState({})
  const [notifications,     setNotifications]     = useState([])
  const [filtreActuel,      setFiltreActuel]      = useState('tous')
  const [sidebarOuvert,     setSidebarOuvert]     = useState(false)
  const [activePanel,       setActivePanel]       = useState('produits')
  const [searchTerm,        setSearchTerm]        = useState('')
  const [toast,             setToast]             = useState({ msg: '', type: '', show: false })
  const [loading,           setLoading]           = useState(true)
  const [logoError,         setLogoError]         = useState(false)
  const [showFilterBar,     setShowFilterBar]     = useState(false)
  const [commentsOpen,      setCommentsOpen]      = useState(false)
  const [commentsProductId, setCommentsProductId] = useState(null)
  const [commentsProductName, setCommentsProductName] = useState('')
  const [replyingTo,        setReplyingTo]        = useState(null)
  const [replyText,         setReplyText]         = useState('')
  const [sendingReply,      setSendingReply]      = useState(false)
  // ✨ NOUVEAU: état glow sur charts + scroll-to-top + refresh
  const [glowingChart,      setGlowingChart]      = useState(null)
  const [showScrollTop,     setShowScrollTop]     = useState(false)
  const [refreshingCharts,  setRefreshingCharts]  = useState(false)
  const [expandedNotifs,    setExpandedNotifs]    = useState({})

  // Refs
  const mesProdRef    = useRef([])
  const mesLikesRef   = useRef({})
  const mesCommRef    = useRef({})
  const mesClicsRef   = useRef({})
  const chartClicsRef = useRef(null)
  const chartEngRef   = useRef(null)
  const chartCatRef   = useRef(null)
  const chartRevRef   = useRef(null)
  const realtimeRef   = useRef(null)
  const mainRef       = useRef(null)

  // Sync refs ↔ state
  useEffect(() => { mesProdRef.current    = mesProduits     }, [mesProduits])
  useEffect(() => { mesLikesRef.current   = mesLikes        }, [mesLikes])
  useEffect(() => { mesCommRef.current    = mesCommentaires }, [mesCommentaires])
  useEffect(() => { mesClicsRef.current   = mesClics        }, [mesClics])

  // ✨ FIX CRITIQUE: redessiner les charts à chaque ouverture d'un panel graphique
  // (suppression du guard chartsInitialised qui bloquait le re-render)
  useEffect(() => {
    if (activePanel === 'stats-produits' || activePanel === 'stats-categories') {
      const timer = setTimeout(() => initialiserGraphiques(), 150)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePanel])

  // ✨ NOUVEAU: scroll-to-top sur mobile
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const onScroll = () => setShowScrollTop(el.scrollTop > 200)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const panelTitles = {
    'produits':         'Mes Produits',
    'stats-produits':   'Clics & Vues',
    'stats-categories': 'Catégories',
    'notifications':    'Notifications'
  }

  // ===== SIDEBAR =====
  const ouvrirSidebar = () => { setSidebarOuvert(true);  document.body.style.overflow = 'hidden' }
  const fermerSidebar = () => { setSidebarOuvert(false); document.body.style.overflow = '' }
  const toggleSidebar = () => sidebarOuvert ? fermerSidebar() : ouvrirSidebar()

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768 && sidebarOuvert) fermerSidebar() }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [sidebarOuvert])

  // ===== INIT =====
  useEffect(() => { verifierAuth() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ===== AUTH =====
  async function verifierAuth() {
    try {
      const { data: { session }, error } = await sb.auth.getSession()
      if (error || !session) { window.location.href = '/achats'; return }
      const user = session.user
      const email   = user.email || ''
      const nomMeta = user.user_metadata?.name || ''
      setSbAvatar((nomMeta || email).charAt(0).toUpperCase())
      setSbUserName(nomMeta || email.split('@')[0])
      const { data: boutiqueCheck } = await sb
        .from('parametres_boutique').select('user_id').eq('user_id', user.id).single()
      if (!boutiqueCheck) { await sb.auth.signOut(); window.location.href = '/achats'; return }
      await chargerBoutique(user)
      await chargerToutesLesDonnees(user)
      demarrerRealtime(user)
    } catch (e) {
      console.error('Auth error:', e)
      window.location.href = '/achats'
    }
  }

  // ===== BOUTIQUE =====
  async function chargerBoutique(user) {
    try {
      const { data, error } = await sb
        .from('parametres_boutique').select('user_id, config').eq('user_id', user.id).single()
      if (error) return
      const nom = data.config?.general?.nom || data.config?.nom || 'Ma Boutique'
      setShopNom(nom)
    } catch (e) { console.warn('Pas de boutique:', e) }
  }

  // ===== DEDUPLICATION PRODUITS =====
  function _deduplicateProducts(products) {
    const seen = new Map()
    return products.filter(p => {
      const key = `${p.nom?.trim().toLowerCase()}|${p.prix}|${p.categorie?.toLowerCase()}|${p.main_image || ''}`
      if (seen.has(key)) return false
      seen.set(key, true)
      return true
    })
  }

  // ===== CHARGEMENT DONNÉES =====
  async function chargerToutesLesDonnees(user) {
    setLoading(true)
    try {
      const { data: produits } = await sb
        .from('produits').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      const prods = _deduplicateProducts(produits || [])
      setMesProduits(prods)
      setShowFilterBar(prods.length > 0)

      const newLikes    = {}
      const newComments = {}
      const newClics    = {}

      if (prods.length > 0) {
        const ids = prods.map(p => p.id)

        const { data: likes } = await sb
          .from('product_likes').select('product_id, user_id').in('product_id', ids)
        ;(likes || []).forEach(l => { newLikes[l.product_id] = (newLikes[l.product_id] || 0) + 1 })

        const { data: comments } = await sb
          .from('product_comments').select('*').in('product_id', ids).order('created_at', { ascending: false })
        ;(comments || []).forEach(c => {
          const contenu = c.contenu || c.comment || ''
          const isReport = c.user_name?.includes('Signalement') || contenu.startsWith('Raison:')
          if (isReport) return
          if (!newComments[c.product_id]) newComments[c.product_id] = []
          newComments[c.product_id].push(c)
        })

        // Charger les signalements existants (groupés par produit)
        const notifMap = new Map()
        ;(comments || []).forEach(c => {
          const contenu = c.contenu || c.comment || ''
          const isReport = c.user_name?.includes('Signalement') || contenu.startsWith('Raison:')
          if (!isReport) return
          const produit = prods.find(p => p.id === c.product_id)
          const key = c.product_id
          if (notifMap.has(key)) {
            const existing = notifMap.get(key)
            existing.count++
            existing.dbIds.push(c.id)
            existing.reports.push({
              id: c.id,
              message: contenu,
              created_at: c.created_at || new Date().toISOString()
            })
            if (new Date(c.created_at) > new Date(existing.created_at)) {
              existing.created_at = c.created_at
            }
          } else {
              const isRecent = (date) => (Date.now() - new Date(date).getTime()) < 24 * 60 * 60 * 1000
              notifMap.set(key, {
                id:           c.id,
                dbIds:        [c.id],
                productId:    c.product_id,
                productName:  produit?.nom || 'Produit inconnu',
                auteur:       'Signalement',
                message:      contenu,
                created_at:   c.created_at || new Date().toISOString(),
                unread:       isRecent(c.created_at),
                isReport:     true,
                count:        1,
              reports: [{
                id: c.id,
                message: contenu,
                created_at: c.created_at || new Date().toISOString()
              }],
              productImage: produit?.main_image || null,
              productPrice: produit?.prix || null,
              productStock: produit?.stock || null,
              productDesc:  produit?.description || null
            })
          }
        })
        setNotifications([...notifMap.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))

        try {
          const { data: clics } = await sb.from('product_clicks').select('product_id').in('product_id', ids)
          ;(clics || []).forEach(c => { newClics[c.product_id] = (newClics[c.product_id] || 0) + 1 })
        } catch (e) { console.warn('Table product_clicks non trouvée.') }
      }

      setMesLikes(newLikes)
      setMesCommentaires(newComments)
      setMesClics(newClics)
    } catch (e) {
      console.error('Erreur chargement données:', e)
      afficherToast('❌ Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ===== SUPPRIMER SIGNALEMENT =====
  async function supprimerSignalement(notifId, dbIds) {
    if (!confirm('Supprimer ce signalement ?')) return
    try {
      const ids = dbIds || [notifId]
      if (ids.length) await sb.from('product_comments').delete().in('id', ids)
      setNotifications(prev => prev.filter(n => n.id !== notifId))
      afficherToast('🗑️ Signalement supprimé', 'success')
    } catch (e) {
      console.error('Erreur suppression:', e)
      afficherToast('❌ Erreur lors de la suppression', 'error')
    }
  }

  // ===== PRODUITS FILTRÉS =====
  function getProduitsFiltrés() {
    let result = mesProduits
    const isDraftFn = (s) => s === false || s === 0 || s === 'draft' || s === 'brouillon' || s === 'inactif' || s === 'inactive'
    if (filtreActuel === 'published') result = result.filter(p => !isDraftFn(p.statut))
    if (filtreActuel === 'draft')     result = result.filter(p => isDraftFn(p.statut))
    if (searchTerm) {
      result = result.filter(p =>
        (p.nom || '').toLowerCase().includes(searchTerm) ||
        (p.categorie || '').toLowerCase().includes(searchTerm)
      )
    }
    return result
  }

  // ===== FILTRES =====
  function filtrerProduits(filtre) {
    setFiltreActuel(filtre)
    setSearchTerm('')
  }

  // ===== COMMENTAIRES =====
  function ouvrirCommentaires(productId, productName) {
    setCommentsProductId(productId)
    setCommentsProductName(productName)
    setCommentsOpen(true)
  }
  function fermerCommentaires() { setCommentsOpen(false); setReplyingTo(null); setReplyText('') }

  // Swipe-to-close sur le sheet commentaires
  const swipeStartY = useRef(null)
  function handleSheetTouchStart(e) { swipeStartY.current = e.touches[0].clientY }
  function handleSheetTouchEnd(e) {
    if (swipeStartY.current === null) return
    const delta = e.changedTouches[0].clientY - swipeStartY.current
    if (delta > 80) fermerCommentaires()
    swipeStartY.current = null
  }

  // ===== RÉPONSE VENDEUR =====
  async function envoyerReponse(parentCommentId) {
    if (!replyText.trim() || sendingReply) return
    setSendingReply(true)
    try {
      const { data, error } = await sb.from('product_comments').insert({
        product_id:    commentsProductId,
        parent_id:     parentCommentId,
        contenu:       replyText.trim(),
        comment:       replyText.trim(),
        is_vendeur:    true,
        user_name:     shopNom || 'Propriétaire',
        created_at:    new Date().toISOString()
      }).select().single()
      if (error) throw error
      const newReply = data || { id: Date.now(), product_id: commentsProductId, parent_id: parentCommentId, contenu: replyText.trim(), is_vendeur: true, user_name: 'Vendeur', created_at: new Date().toISOString() }
      setMesCommentaires(prev => ({
        ...prev,
        [commentsProductId]: [newReply, ...(prev[commentsProductId] || [])]
      }))
      afficherToast('✅ Réponse envoyée !', 'success')
      setReplyingTo(null)
      setReplyText('')
    } catch (e) {
      const localReply = { id: Date.now(), product_id: commentsProductId, parent_id: parentCommentId, contenu: replyText.trim(), comment: replyText.trim(), is_vendeur: true, user_name: shopNom || 'Propriétaire', created_at: new Date().toISOString() }
      setMesCommentaires(prev => ({
        ...prev,
        [commentsProductId]: [localReply, ...(prev[commentsProductId] || [])]
      }))
      afficherToast('✅ Réponse enregistrée', 'success')
      setReplyingTo(null)
      setReplyText('')
    } finally {
      setSendingReply(false)
    }
  }

  // ===== ONGLETS =====
  // ✅ FIX: plus de guard chartsInitialised — le useEffect gère le rendu
  function changerOnglet(onglet) {
    setActivePanel(onglet)
    if (onglet === 'notifications') marquerNotificationsLues()
    if (window.innerWidth <= 768 && sidebarOuvert) fermerSidebar()
    // Scroll vers le haut
    if (mainRef.current) mainRef.current.scrollTop = 0
  }

  // ===== NOTIFICATIONS =====
  const unreadCount = notifications.filter(n => n.unread).length

  function marquerNotificationsLues() {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  // ===== GRAPHIQUES =====
  function initialiserGraphiques() {
    initialiserChartClics()
    initialiserChartEngagement()
    initialiserChartCategories()
    initialiserChartRevenuCategories()
  }

  function initialiserChartClics() {
    const canvas = chartClicsRef.current
    if (!canvas) return
    const top10 = [...mesProdRef.current]
      .map(p => ({ nom: (p.nom || 'Produit').substring(0, 18), clics: mesClicsRef.current[p.id] || 0 }))
      .sort((a, b) => b.clics - a.clics)
      .slice(0, 10)
    drawBarChart(canvas, top10.map(p => p.nom), top10.map(p => p.clics), 'rgba(255,107,0,0.85)')
  }

  function initialiserChartEngagement() {
    const canvas = chartEngRef.current
    if (!canvas) return
    const top8 = [...mesProdRef.current]
      .map(p => ({
        nom:      (p.nom || 'Produit').substring(0, 14),
        likes:    mesLikesRef.current[p.id] || 0,
        comments: (mesCommRef.current[p.id] || []).length
      }))
      .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
      .slice(0, 8)
    drawGroupedBarChart(canvas, top8.map(p => p.nom), [
      { label: 'Likes',        data: top8.map(p => p.likes),    color: 'rgba(239,68,68,0.85)'   },
      { label: 'Commentaires', data: top8.map(p => p.comments), color: 'rgba(59,130,246,0.85)'  }
    ])
  }

  function initialiserChartCategories() {
    const canvas = chartCatRef.current
    if (!canvas) return
    const cats = {}
    mesProdRef.current.forEach(p => { const c = p.categorie || 'Autre'; cats[c] = (cats[c] || 0) + 1 })
    const colors = ['#FF6B00','#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#06B6D4','#84CC16','#EC4899','#6366F1']
    drawDoughnutChart(canvas, Object.keys(cats), Object.values(cats), colors)
  }

  function initialiserChartRevenuCategories() {
    const canvas = chartRevRef.current
    if (!canvas) return
    const cats = {}
    mesProdRef.current.forEach(p => {
      const c = p.categorie || 'Autre'
      cats[c] = (cats[c] || 0) + ((p.prix || 0) * (p.stock || 0))
    })
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 8)
    drawHorizontalBarChart(canvas, sorted.map(([k]) => k), sorted.map(([, v]) => v), 'rgba(139,92,246,0.85)')
  }

  // ✨ NOUVEAU: Rafraîchir les charts manuellement
  async function rafraichirCharts() {
    setRefreshingCharts(true)
    setTimeout(() => {
      initialiserGraphiques()
      setRefreshingCharts(false)
      afficherToast('📊 Graphiques actualisés', 'success')
    }, 400)
  }

  // ✨ NOUVEAU: Effet lumineux sur clic d'un chart
  function handleChartClick(chartId) {
    setGlowingChart(chartId)
    setTimeout(() => setGlowingChart(null), 850)
  }

  // ===== REALTIME =====
  function demarrerRealtime(user) {
    const prods = mesProdRef.current
    if (!user || !prods.length) return
    const productIds = prods.map(p => p.id)

    realtimeRef.current = sb
      .channel('sandbox-comments-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'product_comments' }, (payload) => {
        const newComment = payload.new
        if (!productIds.includes(newComment.product_id)) return

        const contenu = newComment.contenu || newComment.comment || ''
        const isReport = newComment.user_name?.includes('Signalement') || contenu.startsWith('Raison:')

        if (isReport) {
          const produit = prods.find(p => p.id === newComment.product_id)
          const nomProduit = produit?.nom || 'votre produit'
          const message = contenu.replace(/\[SIGNALEMENT\]\s*/g, '')
          setNotifications(prev => {
            const idx = prev.findIndex(n => n.productId === newComment.product_id && n.isReport)
            if (idx !== -1) {
              const updated = [...prev]
              const report = {
                id: newComment.id,
                message: contenu,
                created_at: newComment.created_at || new Date().toISOString()
              }
              updated[idx] = {
                ...updated[idx],
                count: (updated[idx].count || 1) + 1,
                dbIds: [...(updated[idx].dbIds || [updated[idx].dbId]), newComment.id],
                reports: [...(updated[idx].reports || []), report],
                unread: true
              }
              return updated
            }
            return [{
              id:          newComment.id || Date.now(),
              dbIds:       [newComment.id],
              productId:   newComment.product_id,
              productName: nomProduit,
              auteur: 'Signalement',
              message,
              created_at:  newComment.created_at || new Date().toISOString(),
              unread:      true,
              isReport:    true,
              count:       1,
              reports: [{
                id: newComment.id,
                message: contenu,
                created_at: newComment.created_at || new Date().toISOString()
              }],
              productImage: produit?.main_image || null,
              productPrice: produit?.prix || null,
              productStock: produit?.stock || null,
              productDesc: produit?.description || null
            }, ...prev]
          })
          afficherToast(`🚩 Signalement sur "${nomProduit}"`, 'warning')
          return
        }

        if (newComment.is_vendeur) {
          setMesCommentaires(prev => ({
            ...prev,
            [newComment.product_id]: [newComment, ...(prev[newComment.product_id] || [])]
          }))
          return
        }
        const produit    = prods.find(p => p.id === newComment.product_id)
        const nomProduit = produit?.nom || 'votre produit'
        const auteur     = newComment.user_name || newComment.nom_utilisateur || "Quelqu'un"
        const message    = contenu

        setMesCommentaires(prev => ({
          ...prev,
          [newComment.product_id]: [newComment, ...(prev[newComment.product_id] || [])]
        }))

        const notif = {
          id:          newComment.id || Date.now(),
          productId:   newComment.product_id,
          productName: nomProduit,
          auteur, message,
          created_at:  newComment.created_at || new Date().toISOString(),
          unread:      true
        }
        setNotifications(prev => [notif, ...prev])
        afficherToast(`💬 ${auteur} a commenté "${nomProduit}"`, 'info')
      })
      .subscribe()
  }

  // ===== TOAST =====
  function afficherToast(msg, type = '') {
    setToast({ msg, type, show: true })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000)
  }

  // ===== DÉCONNEXION =====
  async function deconnexion() {
    if (!confirm('Voulez-vous vous déconnecter ?')) return
    try {
      if (realtimeRef.current) await sb.removeChannel(realtimeRef.current)
      await sb.auth.signOut()
      window.location.href = '/achats'
    } catch (e) {
      window.location.href = '/achats'
    }
  }

  // ===== DONNÉES CALCULÉES =====
  const produitsFiltrés = getProduitsFiltrés()
  const comments        = commentsProductId ? (mesCommentaires[commentsProductId] || []) : []
  const totalLikes      = Object.values(mesLikes).reduce((a, b) => a + b, 0)
  const totalComments   = Object.values(mesCommentaires).reduce((a, arr) => a + arr.length, 0)
  const totalClics      = Object.values(mesClics).reduce((a, b) => a + b, 0)
  const isDraftKpi = (s) => s === false || s === 0 || s === 'draft' || s === 'brouillon' || s === 'inactif' || s === 'inactive'
  const totalProduits = mesProduits.filter(p => !isDraftKpi(p.statut)).length

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* OVERLAY MOBILE */}
      <div
        className={`sidebar-overlay${sidebarOuvert ? ' active' : ''}`}
        id="sidebarOverlay"
        onClick={toggleSidebar}
      />

      {/* ===================== SIDEBAR ===================== */}
      <aside className={`sidebar${sidebarOuvert ? ' open' : ''}`} id="sidebar">
        <div className="sidebar-logo">
          {!logoError
            ? <img src="/images/oda.png" alt="ODA" className="sidebar-logo-img" onError={() => setLogoError(true)} />
            : <div className="sidebar-logo-fallback" id="logoFallback" style={{ display: 'flex' }}><span className="logo-icon">🏪</span></div>
          }
          <div className="sidebar-logo-text">
            <span className="logo-brand">ODA</span>
            <span className="logo-sub">Studio</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar} title="Fermer">✕</button>
        </div>

        {shopNom && (
          <div className="sidebar-shop-card" id="sidebarShopCard">
            <div className="shop-avatar" id="sidebarShopAvatar">🏪</div>
            <div className="shop-meta">
              <div className="shop-name" id="sidebarShopName">{shopNom}</div>
              <div className="shop-badge"><span className="badge-dot"></span> En ligne</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="nav-section-label">TABLEAU DE BORD</div>

          <button className={`nav-item${activePanel === 'produits' ? ' active' : ''}`} onClick={() => changerOnglet('produits')}>
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </span>
            <span className="nav-label">Mes Produits</span>
          </button>

          <button className={`nav-item${activePanel === 'stats-produits' ? ' active' : ''}`} onClick={() => changerOnglet('stats-produits')}>
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </span>
            <span className="nav-label">Clics &amp; Vues</span>
          </button>

          <button className={`nav-item${activePanel === 'stats-categories' ? ' active' : ''}`} onClick={() => changerOnglet('stats-categories')}>
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
            </span>
            <span className="nav-label">Catégories</span>
          </button>

          <button className={`nav-item notif-nav${activePanel === 'notifications' ? ' active' : ''}`} onClick={() => changerOnglet('notifications')}>
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </span>
            <span className="nav-label">Notifications</span>
            {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>

          <div className="nav-section-label" style={{ marginTop: '20px' }}>COMMUNAUTÉ</div>

          <a className="nav-item nav-social telegram" href="https://t.me/odacommunaute" target="_blank" rel="noreferrer">
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.19l-2.02 9.52c-.15.69-.54.86-1.09.53l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.06 5.53-4.99c.24-.21-.05-.33-.37-.12L6.81 14.4l-2.96-.92c-.64-.2-.65-.64.14-.95l11.55-4.45c.54-.19 1.01.13.4 1.11z"/></svg>
            </span>
            <span className="nav-label">Communauté Telegram</span>
            <span className="nav-external">↗</span>
          </a>

          <a className="nav-item nav-social whatsapp" href="https://whatsapp.com/channel/odachannel" target="_blank" rel="noreferrer">
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </span>
            <span className="nav-label">Canal WhatsApp</span>
            <span className="nav-external">↗</span>
          </a>

          <a className="nav-item nav-social facebook" href="https://facebook.com/odamarketplace" target="_blank" rel="noreferrer">
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </span>
            <span className="nav-label">Page Facebook</span>
            <span className="nav-external">↗</span>
          </a>

          <div className="nav-section-label" style={{ marginTop: '20px' }}>APPLICATION</div>

          <a className="nav-item nav-download" href="https://oda-seller.vercel.app" target="_blank" rel="noreferrer">
            <span className="nav-icon">⬇️</span>
            <span className="nav-label">Télécharger l&apos;app ODA</span>
            <span className="nav-external">↗</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <a href="/achats" className="footer-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Retour à la boutique
          </a>
          <button className="footer-logout-btn" onClick={deconnexion}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ===================== MAIN WRAPPER ===================== */}
      <div className="main-wrapper" ref={mainRef} style={{ overflowY: 'auto', overflowX: 'hidden' }}>

        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Menu">
              <span /><span /><span />
            </button>
            <h1 className="topbar-title">{panelTitles[activePanel] || 'ODA Studio'}</h1>
          </div>
          <div className="topbar-right">
            <button
              className="topbar-notif-btn"
              onClick={() => changerOnglet('notifications')}
              title="Notifications"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unreadCount > 0 && <span className="topbar-notif-badge">{unreadCount}</span>}
            </button>
            <a href="https://oda-seller.vercel.app" target="_blank" rel="noreferrer" className="topbar-download-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>App ODA</span>
            </a>
            <div className="topbar-user">
              <div className="topbar-avatar">{sbAvatar}</div>
              <span className="topbar-username">{sbUserName}</span>
            </div>
          </div>
        </header>

        {/* ===== CONTENU ===== */}
        <main className="content-area">

          {/* ===== PANEL : MES PRODUITS ===== */}
          <div className={`sb-panel${activePanel === 'produits' ? ' active' : ''}`} id="panel-produits">
            {shopNom && (
              <div className="shop-hero" id="shopBanner">
                <div className="shop-hero-glow" />
                <div className="shop-hero-content">
                  <div className="shop-hero-icon">🏪</div>
                  <div>
                    <div className="shop-hero-name">{shopNom}</div>
                    <div className="shop-hero-sub">Bienvenue dans votre espace vendeur · ODA Studio</div>
                  </div>
                </div>
                <div className="shop-hero-actions">
                  <a href="https://oda-seller.vercel.app" target="_blank" rel="noreferrer" className="hero-download-btn">
                    <img src="/logo-oda.png" alt="ODA" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} onError={e => (e.target.style.display = 'none')} />
                    Télécharger l&apos;app ODA
                  </a>
                  <div className="hero-socials">
                    <a href="https://t.me/odacommunaute" target="_blank" rel="noreferrer" className="social-pill telegram">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.19l-2.02 9.52c-.15.69-.54.86-1.09.53l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.06 5.53-4.99c.24-.21-.05-.33-.37-.12L6.81 14.4l-2.96-.92c-.64-.2-.65-.64.14-.95l11.55-4.45c.54-.19 1.01.13.4 1.11z"/></svg>
                      Telegram
                    </a>
                    <a href="https://whatsapp.com/channel/odachannel" target="_blank" rel="noreferrer" className="social-pill whatsapp">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                    <a href="https://facebook.com/odamarketplace" target="_blank" rel="noreferrer" className="social-pill facebook">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* KPIs */}
            <div className="kpi-grid">
              {loading ? (
                <div className="sb-loader" style={{ gridColumn: '1/-1' }}>
                  <div className="sb-spinner" /><span>Chargement...</span>
                </div>
              ) : (
                <>
                  <div className="kpi-card orange-card" style={{ '--kpi-color': 'var(--primary)' }}>
                    <div className="kpi-icon orange">📦</div>
                    <div><div className="kpi-label">Produits publiés</div><div className="kpi-value">{totalProduits}</div></div>
                  </div>
                  <div className="kpi-card green-card" style={{ '--kpi-color': 'var(--success)' }}>
                    <div className="kpi-icon green">❤️</div>
                    <div><div className="kpi-label">Total likes</div><div className="kpi-value">{totalLikes.toLocaleString()}</div></div>
                  </div>
                  <div className="kpi-card blue-card" style={{ '--kpi-color': 'var(--info)' }}>
                    <div className="kpi-icon blue">💬</div>
                    <div><div className="kpi-label">Commentaires</div><div className="kpi-value">{totalComments.toLocaleString()}</div></div>
                  </div>
                  <div className="kpi-card purple-card" style={{ '--kpi-color': 'var(--purple)' }}>
                    <div className="kpi-icon purple">👁️</div>
                    <div><div className="kpi-label">Total clics</div><div className="kpi-value">{totalClics.toLocaleString()}</div></div>
                  </div>
                </>
              )}
            </div>

            {/* Filtres */}
            <div className="section-header">
              <h2 className="section-title">Catalogue produits</h2>
              {showFilterBar && (
                <div className="filter-pills">
                  <button className={`filter-pill${filtreActuel === 'tous'      ? ' active' : ''}`} onClick={() => filtrerProduits('tous')}>Tous</button>
                  <button className={`filter-pill${filtreActuel === 'published' ? ' active' : ''}`} onClick={() => filtrerProduits('published')}>✅ Publiés</button>
                  <button className={`filter-pill${filtreActuel === 'draft'     ? ' active' : ''}`} onClick={() => filtrerProduits('draft')}>📝 Brouillons</button>
                </div>
              )}
            </div>

            {/* Barre de recherche */}
            {showFilterBar && (
              <div className="search-bar-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Rechercher un produit par nom ou catégorie…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value.trim().toLowerCase())}
                  autoComplete="off"
                />
              </div>
            )}
            {searchTerm && (
              <div className="search-count">
                {produitsFiltrés.length} résultat{produitsFiltrés.length !== 1 ? 's' : ''} pour &quot;{searchTerm}&quot;
              </div>
            )}

            {/* Liste produits */}
            <div className="products-grid">
              {loading ? null
                : mesProduits.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📦</span>
                    <div className="empty-title">Aucun produit pour l&apos;instant</div>
                    <div className="empty-text">Créez votre premier produit depuis l&apos;app ODA Vendeur</div>
                  </div>
                ) : produitsFiltrés.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">{searchTerm ? '🔍' : '📭'}</span>
                    <div className="empty-title">{searchTerm ? 'Aucun résultat' : 'Aucun produit ici'}</div>
                    <div className="empty-text">{searchTerm ? `Aucun produit ne correspond à "${searchTerm}".` : 'Aucun produit ne correspond à ce filtre.'}</div>
                  </div>
                ) : produitsFiltrés.map(p => (
                  <ProductRow
                    key={p.id}
                    p={p}
                    mesLikes={mesLikes}
                    mesCommentaires={mesCommentaires}
                    mesClics={mesClics}
                    searchTerm={searchTerm}
                    onOpenComments={ouvrirCommentaires}
                  />
                ))
              }
            </div>
          </div>

          {/* ===== PANEL : STATS CLICS ===== */}
          <div className={`sb-panel${activePanel === 'stats-produits' ? ' active' : ''}`} id="panel-stats-produits">
            <div className="panel-header">
              <div className="panel-header-text">
                <h2 className="panel-title">Clics &amp; Engagement</h2>
                <p className="panel-sub">Performance détaillée par produit</p>
              </div>
              <button
                className={`panel-refresh-btn${refreshingCharts ? ' spinning' : ''}`}
                onClick={rafraichirCharts}
                title="Actualiser"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Actualiser
              </button>
            </div>
            <div className="charts-row">
              {/* ✨ Chart avec glow au clic */}
              <div
                className={`chart-card${glowingChart === 'clics' ? ' glow-orange' : ''}`}
                onClick={() => handleChartClick('clics')}
              >
                <div className="chart-card-header">
                  <div><div className="chart-title">Clics par produit</div><div className="chart-subtitle">Top 10 produits les plus consultés</div></div>
                  <div className="chart-badge orange">👁️</div>
                </div>
                <div className="chart-container"><canvas ref={chartClicsRef} /></div>
              </div>
              <div
                className={`chart-card${glowingChart === 'engagement' ? ' glow-blue' : ''}`}
                onClick={() => handleChartClick('engagement')}
              >
                <div className="chart-card-header">
                  <div><div className="chart-title">Likes vs Commentaires</div><div className="chart-subtitle">Engagement comparé par produit</div></div>
                  <div className="chart-badge blue">💬</div>
                </div>
                <div className="chart-container"><canvas ref={chartEngRef} /></div>
              </div>
            </div>
          </div>

          {/* ===== PANEL : STATS CATÉGORIES ===== */}
          <div className={`sb-panel${activePanel === 'stats-categories' ? ' active' : ''}`} id="panel-stats-categories">
            <div className="panel-header">
              <div className="panel-header-text">
                <h2 className="panel-title">Analyse par catégorie</h2>
                <p className="panel-sub">Distribution et valeur de votre catalogue</p>
              </div>
              <button
                className={`panel-refresh-btn${refreshingCharts ? ' spinning' : ''}`}
                onClick={rafraichirCharts}
                title="Actualiser"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Actualiser
              </button>
            </div>
            <div className="charts-row">
              {/* ✨ Doughnut FIXED pour mobile */}
              <div
                className={`chart-card${glowingChart === 'cat' ? ' glow-purple' : ''}`}
                onClick={() => handleChartClick('cat')}
              >
                <div className="chart-card-header">
                  <div><div className="chart-title">Répartition des produits</div><div className="chart-subtitle">Distribution par catégorie</div></div>
                  <div className="chart-badge purple">🏷️</div>
                </div>
                <div className="chart-container"><canvas ref={chartCatRef} /></div>
              </div>
              {/* ✨ Horizontal bar FIXED padding mobile */}
              <div
                className={`chart-card${glowingChart === 'rev' ? ' glow-green' : ''}`}
                onClick={() => handleChartClick('rev')}
              >
                <div className="chart-card-header">
                  <div><div className="chart-title">Valeur du stock</div><div className="chart-subtitle">Revenus potentiels par catégorie</div></div>
                  <div className="chart-badge green">💰</div>
                </div>
                <div className="chart-container"><canvas ref={chartRevRef} /></div>
              </div>
            </div>
          </div>

          {/* ===== PANEL : NOTIFICATIONS ===== */}
          <div className={`sb-panel${activePanel === 'notifications' ? ' active' : ''}`} id="panel-notifications">
            <div className="panel-header">
              <div className="panel-header-text">
                <h2 className="panel-title">Notifications</h2>
                <p className="panel-sub">Commentaires, signalements et interactions en temps réel</p>
              </div>
            </div>
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="no-notifs">
                  <span className="no-notifs-icon">🔔</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>Aucune notification</div>
                  <div style={{ fontSize: '0.85rem' }}>Les nouveaux commentaires sur vos produits apparaîtront ici en temps réel.</div>
                </div>
              ) : notifications.map(n => {
                const date = new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                const isExpanded = expandedNotifs[n.id]
                const preview = n.isReport ? n.message.substring(0, 60) + (n.message.length > 60 ? '...' : '') : n.message.substring(0, 120) + (n.message.length > 120 ? '...' : '')
                return (
                  <div key={n.id} className={`notif-item${n.unread ? ' unread' : ''}${n.isReport ? ' is-report' : ''}`}>
                    <div className="notif-icon">{n.isReport ? '🚩' : '💬'}</div>
                    <div className="notif-content" onClick={() => n.isReport && setExpandedNotifs(prev => ({ ...prev, [n.id]: !prev[n.id] }))}>
                      <div className="notif-title">
                        {n.isReport ? 'Signalement' : 'Nouveau commentaire sur'} &quot;{n.productName}&quot;
                        {n.isReport && n.count > 1 && <span className="notif-count-badge">{n.count}×</span>}
                      </div>
                      {n.isReport && n.productImage && (
                        <div className="report-product-info">
                          <img src={n.productImage} alt={n.productName} className="report-product-img" onError={(e) => { e.target.style.display = 'none' }} />
                          <div className="report-product-details">
                            {n.productPrice && <span className="report-product-price">{n.productPrice.toLocaleString('fr-FR')} FCFA</span>}
                            {n.productStock !== null && <span className={`report-product-stock ${n.productStock <= 5 ? 'low' : ''}`}>Stock: {n.productStock}</span>}
                          </div>
                        </div>
                      )}
                      <div className="notif-body"><strong>{n.auteur}</strong> : &quot;{preview}&quot;{n.isReport && n.count > 1 ? ` (${n.count} signalements)` : ''}</div>
                      {n.isReport && isExpanded && (
                        <div className="report-expanded">
                          {(n.reports || [{ message: n.message, created_at: n.created_at }]).map((r, ri) => {
                            const rDate = new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                            return (
                              <div key={r.id || ri} className="report-individual">
                                <div className="report-individual-header">
                                  <span className="report-individual-num">🚩 Signalement #{ri + 1}</span>
                                  <span className="report-individual-date">📅 {rDate}</span>
                                </div>
                                <div className="report-individual-text">{r.message}</div>
                              </div>
                            )
                          })}
                          <div className="report-expand-hint">Cliquez pour réduire</div>
                        </div>
                      )}
                      {n.isReport && !isExpanded && n.message.length > 60 && (
                        <div className="report-expand-hint">Cliquez pour voir le détail →</div>
                      )}
                      <div className="notif-time">📅 {date}</div>
                    </div>
                    {n.isReport && (
                      <button className="notif-delete-btn" onClick={(e) => { e.stopPropagation(); supprimerSignalement(n.id, n.dbIds || [n.dbId]) }} aria-label="Supprimer le signalement">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </main>
      </div>

      {/* ===================== MOBILE BOTTOM NAV ✨ NOUVEAU ===================== */}
      <nav className="mobile-bottom-nav">
        <button className={`mobile-nav-tab${activePanel === 'produits' ? ' active' : ''}`} onClick={() => changerOnglet('produits')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          <span>Produits</span>
        </button>
        <button className={`mobile-nav-tab${activePanel === 'stats-produits' ? ' active' : ''}`} onClick={() => changerOnglet('stats-produits')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>Clics</span>
        </button>
        <button className={`mobile-nav-tab${activePanel === 'stats-categories' ? ' active' : ''}`} onClick={() => changerOnglet('stats-categories')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
          </svg>
          <span>Catégories</span>
        </button>
        <button className={`mobile-nav-tab${activePanel === 'notifications' ? ' active' : ''}`} onClick={() => changerOnglet('notifications')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span>Notifs</span>
          {unreadCount > 0 && <span className="mobile-nav-dot" />}
        </button>
      </nav>

      {/* ===================== SCROLL TO TOP ✨ NOUVEAU ===================== */}
      <button
        className={`scroll-top-btn${showScrollTop ? ' visible' : ''}`}
        onClick={() => mainRef.current && (mainRef.current.scrollTop = 0)}
        title="Remonter"
      >
        ↑
      </button>

      {/* ===================== MODAL COMMENTAIRES ===================== */}
      <div
        className={`comments-overlay${commentsOpen ? ' active' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) fermerCommentaires() }}
      >
        <div
          className="comments-sheet"
          onTouchStart={handleSheetTouchStart}
          onTouchEnd={handleSheetTouchEnd}
        >
          <div className="comments-handle" />
          <div className="comments-header">
            <h3>💬 {commentsProductName}</h3>
            <button className="close-btn" onClick={fermerCommentaires}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="comments-body">
            {comments.length === 0 ? (
              <div className="no-comments">
                <span className="no-comments-icon">💬</span>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>Aucun commentaire</div>
                <div style={{ fontSize: '0.84rem' }}>Ce produit n&apos;a pas encore reçu de commentaires.</div>
              </div>
            ) : (() => {
              const parents   = comments.filter(c => !c.parent_id && !c.is_vendeur)
              const repliesMap = {}
              comments.filter(c => c.parent_id || c.is_vendeur).forEach(r => {
                const key = r.parent_id || 'orphan'
                if (!repliesMap[key]) repliesMap[key] = []
                repliesMap[key].push(r)
              })
              return parents.map((c, i) => {
                const date   = new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                const stars  = c.rating ? '⭐'.repeat(Math.round(c.rating)) : ''
                const auteur = c.user_name || c.nom_utilisateur || c.user_email?.split('@')[0] || 'Anonyme'
                const myReplies = repliesMap[c.id] || []
                const isReplying = replyingTo === c.id
                return (
                  <div key={c.id || i} className="comment-item">
                    <div className="comment-author">👤 {auteur}</div>
                    <div className="comment-text">{c.contenu || c.comment || c.text || ''}</div>
                    <div className="comment-meta">
                      <span className="comment-date">📅 {date}</span>
                      {stars && <span className="comment-rating">{stars} ({c.rating}/5)</span>}
                    </div>
                    {myReplies.map((r, ri) => (
                      <div key={r.id || ri} className="vendor-reply">
                        <div className="vendor-reply-label">🏪 Réponse du propriétaire</div>
                        <div className="vendor-reply-text">{r.contenu || r.comment || r.text || ''}</div>
                        <div className="vendor-reply-date">📅 {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))}
                    {!isReplying && (
                      <button className="comment-reply-btn" onClick={() => { setReplyingTo(c.id); setReplyText('') }}>
                        ↩ Répondre
                      </button>
                    )}
                    {isReplying && (
                      <div className="reply-form">
                        <textarea
                          className="reply-textarea"
                          placeholder="Votre réponse en tant que vendeur…"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          autoFocus
                        />
                        <div className="reply-actions">
                          <button className="reply-cancel-btn" onClick={() => { setReplyingTo(null); setReplyText('') }}>Annuler</button>
                          <button className="reply-send-btn" onClick={() => envoyerReponse(c.id)} disabled={sendingReply || !replyText.trim()}>
                            {sendingReply ? '…' : '↩ Envoyer'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>

      {/* ===================== TOAST ===================== */}
      <div className={`sb-toast${toast.type ? ' ' + toast.type : ''}${toast.show ? ' show' : ''}`}>
        {toast.msg}
      </div>
    </>
  )
}