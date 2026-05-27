// src/components/layout/Header.js
// ══════════════════════════════════════════════════════════════
// COMPOSANT : Header fixe (toutes les pages)
// ══════════════════════════════════════════════════════════════

'use client'

import { useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';

  const CSS = `
  .oda-header {
    position: fixed;
    top: 0;
    left: 0; right: 0;
    z-index: 200;
    height: calc(62px + var(--sat, 0px));
    padding: var(--sat, 0px) 20px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transition: box-shadow 0.3s ease;
  }
  .oda-header.default {
    background: rgba(255,255,255,0.92);
    border-bottom: 1px solid var(--grey-100);
  }
  .oda-header.dark {
    background: rgba(12,14,20,0.92);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .oda-header.transparent {
    background: transparent;
  }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .header-back-btn {
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(255,255,255,0.2); border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 1.1rem;
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  }
  .header-logo-wrap { display: flex; align-items: center; gap: 10px; }
  .header-logo-img {
    width: 38px; height: 38px; border-radius: 10px; overflow: hidden;
    background: var(--gold-pale); display: flex; align-items: center; justify-content: center;
  }
  .header-logo-img img { width: 100%; height: 100%; object-fit: cover; }
  .header-logo-text { font-family: var(--font-head, 'Playfair Display'); font-size: 1.25rem; font-weight: 900; color: var(--grey-900); }
  .header-logo-text span { color: var(--gold); }
  .header-logo-badge {
    background: var(--green); color: #fff; font-size: 0.58rem; font-weight: 700;
    padding: 2px 7px; border-radius: 20px; letter-spacing: 0.8px; text-transform: uppercase;
  }
  .header-title {
    font-family: var(--font-head, 'Playfair Display'); font-size: 1.1rem; font-weight: 700;
    color: var(--grey-900); position: absolute; left: 50%; transform: translateX(-50%);
  }
  .header-actions { display: flex; align-items: center; gap: 10px; }
  .header-btn-install {
    background: linear-gradient(135deg, var(--gold) 0%, var(--terra) 100%);
    color: #fff; border: none; border-radius: 30px; padding: 9px 18px;
    font-family: var(--font-body, 'Sora'); font-size: 0.78rem; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    box-shadow: 0 4px 16px rgba(212,146,10,0.3); transition: all 0.3s;
  }
  .header-btn-install:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,146,10,0.45); }
  .header-cm-chip {
    display: flex; align-items: center; gap: 5px;
    background: var(--grey-50); border: 1px solid var(--grey-100);
    border-radius: 30px; padding: 5px 11px;
    font-size: 0.72rem; font-weight: 600; color: var(--grey-700);
  }
  .dark .header-logo-text { color: #fff; }
  .dark .header-title { color: #fff; }
  .dark .header-cm-chip { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); }
`;

export default function Header({ variant = 'default', showBack = false, showSearch = false, showInstall = false, title, onBack }) {
  const router = useRouter();

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  function isStandalone() {
    return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  }
  function handleInstall() {
    if (isStandalone()) return;
    if (window.installPWA) window.installPWA();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className={`oda-header ${variant}`}>
        <div className="header-left">
          {showBack ? (
            <button className="header-back-btn" onClick={onBack || (() => router.back())}>
              ←
            </button>
          ) : (
            <div className="header-logo-wrap">
              <div className="header-logo-img">
                <img src="/images/oda-logo.svg" alt="ODA Market" width="38" height="38" />
              </div>
              <span className="header-logo-text">ODA <span>Market</span></span>
              {variant === 'default' && <span className="header-logo-badge">CM 🇨🇲</span>}
            </div>
          )}
        </div>

        {showSearch && <SearchBar variant="header" />}

        {title && <h1 className="header-title">{title}</h1>}

        {!showSearch && !title && (
          <div className="header-actions">
            {variant === 'default' && (
              <>
                <div className="header-cm-chip">🇨🇲 Cameroun</div>
                {showInstall && (
                  <button className="header-btn-install" onClick={handleInstall}>
                    ⬇️ Installer
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
