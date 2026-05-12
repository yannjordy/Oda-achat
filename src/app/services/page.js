'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEY = 'oda_fav_services';

function getFavorites() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function toggleFav(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx > -1) favs.splice(idx, 1); else favs.push(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  return favs;
}

function Svg({ name, size = 18, color = 'currentColor', fill = 'none' }) {
  const p = { viewBox:'0 0 24 24', width:size, height:size, fill, stroke:color, strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round' };
  const m = {
    heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    play: <polygon points="5 3 19 12 5 21 5 3"/>,
    whatsapp: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    chevronLeft: <polyline points="15 18 9 12 15 6"/>,
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
    phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>,
  };
  return <svg {...p}>{m[name]}</svg>;
}

function ImageCarousel({ images, nom }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!images || images.length < 2) return;
    timer.current = setInterval(() => setIdx(prev => (prev + 1) % images.length), 3000);
    return () => clearInterval(timer.current);
  }, [images]);

  if (!images || images.length === 0) {
    return <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', color:'#ccc', background:'#f0f0f2' }}>🛎️</div>;
  }

  return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden' }}>
      {images.map((img, i) => (
        <img key={i} src={img} alt={nom}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: i === idx ? 1 : 0, transition:'opacity .6s ease' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      ))}
      {images.length > 1 && (
        <div style={{ position:'absolute', bottom:6, left:'50%', transform:'translateX(-50%)', display:'flex', gap:4, zIndex:2 }}>
          {images.map((_, i) => (
            <div key={i} style={{ width: i === idx ? 16 : 5, height:5, borderRadius:3, background: i === idx ? '#34C759' : 'rgba(255,255,255,.6)', transition:'all .3s' }} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoPlayer({ url }) {
  if (!url) return null;
  const isYoutube = url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/embed/');
  if (isYoutube) {
    let embedUrl = url;
    if (url.includes('youtu.be/')) embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    if (url.includes('watch?v=')) embedUrl = url.replace('watch?v=', 'embed/');
    const ampIdx = embedUrl.indexOf('&');
    if (ampIdx > -1) embedUrl = embedUrl.substring(0, ampIdx);
    return (
      <div style={{ width:'100%', aspectRatio:'16/9', borderRadius:12, overflow:'hidden', background:'#000' }}>
        <iframe src={embedUrl} style={{ width:'100%', height:'100%', border:'none' }} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen />
      </div>
    );
  }
  return (
    <video controls style={{ width:'100%', borderRadius:12, background:'#000' }} preload="metadata">
      <source src={url} />
    </video>
  );
}

function GalleryModal({ images, idx, onClose, onChange }) {
  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') onChange(-1); if (e.key === 'ArrowRight') onChange(1); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onChange]);
  if (!images || !images.length) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:10001, background:'rgba(0,0,0,.92)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.15)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Svg name="close" color="white" />
      </button>
      {images.length > 1 && (
        <button onClick={() => onChange(-1)} style={{ position:'absolute', left:12, width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,.1)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Svg name="chevronLeft" color="white" size={24} />
        </button>
      )}
      <img src={images[idx]} alt="" style={{ maxWidth:'100%', maxHeight:'90vh', borderRadius:8, objectFit:'contain' }} />
      {images.length > 1 && (
        <button onClick={() => onChange(1)} style={{ position:'absolute', right:12, width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,.1)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Svg name="chevronRight" color="white" size={24} />
        </button>
      )}
      <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', color:'rgba(255,255,255,.6)', fontSize:'.8rem', fontWeight:600 }}>
        {idx + 1} / {images.length}
      </div>
    </div>
  );
}

function ServiceDetail({ svc, onClose, favs, onToggleFav, onShare }) {
  const [galIdx, setGalIdx] = useState(0);
  const [showGal, setShowGal] = useState(false);
  const [prixPropose, setPrixPropose] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!svc) return;
    const propose = prixPropose ? `\n💰 Mon prix proposé : ${Number(prixPropose).toLocaleString('fr-FR')} FCFA` : '';
    const template = `Bonjour ! Je suis intéressé(e) par votre service "${svc.nom}".${svc.prix ? `\nPrix affiché : ${Number(svc.prix).toLocaleString('fr-FR')} FCFA` : ''}${propose}\nPouvez-vous me donner plus d'informations ?`;
    setMsg(template);
  }, [svc, prixPropose]);

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!svc) return null;
  const images = svc.images || [];
  const waNum = svc.whatsapp?.replace(/\s/g, '');
  const waUrl = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}` : '#';

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,.5)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center', animation:'fadeIn .2s ease' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'white', width:'100%', maxWidth:520, maxHeight:'92vh', borderRadius:'20px 20px 0 0', overflow:'hidden', display:'flex', flexDirection:'column', animation:'slideUp .35s cubic-bezier(.34,1.3,.64,1)' }}>
        {/* Drag handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'8px 0 0' }}>
          <div style={{ width:36, height:4, background:'#E5E5EA', borderRadius:4 }} />
        </div>
        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 20px 24px', WebkitOverflowScrolling:'touch' }}>
          {/* Close + fav */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:'#F2F2F7', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#333' }}>
              <Svg name="close" size={16} />
            </button>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => onShare(svc)} style={{ width:32, height:32, borderRadius:'50%', background:'#F2F2F7', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#666' }}>
                <Svg name="share" size={16} />
              </button>
              <button onClick={() => onToggleFav(svc.id)} style={{ width:32, height:32, borderRadius:'50%', background:'#F2F2F7', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Svg name="heart" size={16} color={favs.includes(svc.id) ? '#FF4B4B' : '#999'} fill={favs.includes(svc.id) ? '#FF4B4B' : 'none'} />
              </button>
            </div>
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div style={{ position:'relative', width:'100%', aspectRatio:'16/10', borderRadius:14, overflow:'hidden', background:'#f0f0f2', marginBottom:16, cursor:'pointer' }}
              onClick={() => setShowGal(true)}>
              <img src={images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e => { e.target.style.display = 'none'; }} />
              {images.length > 1 && (
                <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,.6)', color:'white', fontSize:'.7rem', fontWeight:600, padding:'3px 9px', borderRadius:8, backdropFilter:'blur(4px)' }}>
                  +{images.length - 1}
                </div>
              )}
            </div>
          )}

          {/* Nom + Prix */}
          <h2 style={{ fontSize:'1.2rem', fontWeight:800, margin:'0 0 4px', color:'#1a1a1a', lineHeight:1.3 }}>{svc.nom}</h2>
          {svc.prix && (
            <div style={{ fontSize:'1.15rem', fontWeight:800, color:'#34C759', marginBottom:8 }}>
              {Number(svc.prix).toLocaleString('fr-FR')} FCFA
            </div>
          )}

          {/* Lieu */}
          {svc.lieu && (
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.82rem', color:'#888', marginBottom:6 }}>
              📍 {svc.lieu}
            </div>
          )}

          {/* Description */}
          {svc.description && (
            <p style={{ fontSize:'.88rem', color:'#444', lineHeight:1.7, margin:'10px 0 16px' }}>{svc.description}</p>
          )}

          {/* Vidéo inline */}
          {svc.video_url && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:'.75rem', fontWeight:700, color:'#999', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Vidéo de présentation</div>
              <VideoPlayer url={svc.video_url} />
            </div>
          )}

          {/* Grille d'images restantes */}
          {images.length > 1 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:16 }}>
              {images.slice(1, 4).map((img, i) => (
                <div key={i} style={{ aspectRatio:'1', borderRadius:10, overflow:'hidden', background:'#f0f0f2', cursor:'pointer' }}
                  onClick={() => { setGalIdx(i + 1); setShowGal(true); }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { e.target.style.display = 'none'; }} />
                </div>
              ))}
            </div>
          )}

          {/* WhatsApp avec proposition de prix obligatoire */}
          {svc.whatsapp && (
            <div style={{ marginTop:8 }}>
              <div style={{ fontSize:'.75rem', fontWeight:700, color:'#999', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Contacter le prestataire</div>
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                <input value={prixPropose} onChange={e => {
                  const v = e.target.value.replace(/\D/g,'');
                  if (svc.prix && Number(v) >= Number(svc.prix)) return;
                  setPrixPropose(v);
                }} type="text" inputMode="numeric"
                  placeholder="Votre prix proposé (FCFA)"
                  style={{ flex:1, padding:'11px 14px', borderRadius:12, border:'1.5px solid #eee', fontSize:'.85rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box', background:'#FAFAFA' }} />
                {svc.prix && <div style={{ display:'flex', alignItems:'center', padding:'0 10px', fontSize:'.75rem', color:'#999', fontWeight:500, background:'#F2F2F7', borderRadius:10, whiteSpace:'nowrap' }}>Max: {Number(svc.prix).toLocaleString('fr-FR')}</div>}
              </div>
              {prixPropose ? (
                <>
                  <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3}
                    style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:'1.5px solid #eee', fontSize:'.85rem', fontFamily:'inherit', outline:'none', resize:'none', boxSizing:'border-box', marginBottom:10, background:'#FAFAFA' }}
                    placeholder="Votre message..." />
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'13px', borderRadius:12, background:'#25D366', color:'white', fontWeight:700, fontSize:'.9rem', textDecoration:'none', transition:'opacity .15s', boxSizing:'border-box' }}>
                    <Svg name="whatsapp" size={18} color="white" fill="white" /> Envoyer sur WhatsApp
                  </a>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'10px 0', color:'#aaa', fontSize:'.8rem' }}>
                  Entrez un prix inférieur au prix affiché pour envoyer le message
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showGal && <GalleryModal images={images} idx={galIdx} onClose={() => setShowGal(false)} onChange={d => setGalIdx(i => (i + d + images.length) % images.length)} />}
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [favTab, setFavTab] = useState(false);
  const [favs, setFavs] = useState([]);
  const [detail, setDetail] = useState(null);

  useEffect(() => { setFavs(getFavorites()); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase.from('services').select('*').eq('statut', 'actif').order('created_at', { ascending: false })
      .then(({ data }) => { if (!cancelled) setServices(data || []); })
      .catch(() => { if (!cancelled) setServices([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function handleToggleFav(id) { const u = toggleFav(id); setFavs([...u]); }

  function handleShare(svc) {
    if (navigator.share) {
      navigator.share({
        title: svc.nom,
        text: `${svc.nom}${svc.prix ? ` - ${Number(svc.prix).toLocaleString('fr-FR')} FCFA` : ''}${svc.description ? `\n${svc.description}` : ''}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${svc.nom}${svc.prix ? ` - ${Number(svc.prix).toLocaleString('fr-FR')} FCFA` : ''}`).then(() => {
        const t = document.createElement('div'); t.textContent = '🔗 Lien copié !'; Object.assign(t.style, { position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', background:'#333', color:'white', padding:'10px 20px', borderRadius:12, fontSize:'.85rem', fontWeight:600, zIndex:99999, boxShadow:'0 4px 16px rgba(0,0,0,.2)' });
        document.body.appendChild(t); setTimeout(() => t.remove(), 2000);
      });
    }
  }

  const filtered = favTab
    ? services.filter(s => favs.includes(s.id))
    : services.filter(s => !search.trim() || s.nom?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()));

  function renderServiceCard(svc) {
    return (
      <div key={svc.id} className="svc-card" onClick={() => setDetail(svc)}>
        <div className="svc-card-img-wrap">
          <ImageCarousel images={svc.images} nom={svc.nom} />
          <button className="svc-fav-btn" onClick={e => { e.stopPropagation(); handleToggleFav(svc.id); }}>
            <Svg name="heart" size={14} color={favs.includes(svc.id) ? '#FF4B4B' : '#999'} fill={favs.includes(svc.id) ? '#FF4B4B' : 'none'} />
          </button>
          {svc.video_url && (
            <span className="svc-video-badge">
              <Svg name="play" size={8} color="white" fill="white" /> Vidéo
            </span>
          )}
        </div>
        <div className="svc-card-body">
          <h3 className="svc-card-title">{svc.nom}</h3>
          {svc.prix ? <div className="svc-card-price">{Number(svc.prix).toLocaleString('fr-FR')} FCFA</div> : null}
          <div className="svc-card-footer">
            {svc.lieu ? <span className="svc-card-lieu">📍 {svc.lieu}</span> : <span />}
            {svc.whatsapp && (
              <a href={`https://wa.me/${svc.whatsapp.replace(/\s/g,'')}?text=Bonjour%21%20Je%20suis%20int%C3%A9ress%C3%A9%28e%29%20par%20${encodeURIComponent(svc.nom)}`}
                target="_blank" rel="noopener noreferrer" className="svc-card-wa"
                onClick={e => e.stopPropagation()}>
                <Svg name="whatsapp" size={10} color="white" fill="white" /> WA
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  function buildSections(list) {
    const sections = [];
    const nouveautes = list.filter(s => new Date(s.created_at) > new Date(Date.now() - 7*24*60*60*1000));
    if (nouveautes.length >= 2) sections.push({ label: '✨ Nouveautés', items: nouveautes });
    const avecVideo = list.filter(s => s.video_url);
    if (avecVideo.length >= 2) sections.push({ label: '📹 Avec vidéo', items: avecVideo });
    const avecPrix = list.filter(s => s.prix);
    if (avecPrix.length >= 2 && avecPrix.length < list.length) sections.push({ label: '💰 Avec prix', items: avecPrix });
    const sansPrix = list.filter(s => !s.prix);
    if (sansPrix.length >= 2 && sansPrix.length < list.length) sections.push({ label: '🆓 Sans prix', items: sansPrix });
    const parLieu = {};
    list.forEach(s => { const l = s.lieu || 'Autre'; if (!parLieu[l]) parLieu[l] = []; parLieu[l].push(s); });
    Object.entries(parLieu).sort((a,b) => b[1].length - a[1].length).forEach(([lieu, items]) => {
      if (items.length >= 3 && !sections.some(s => s.items === items)) sections.push({ label: `📍 ${lieu}`, items });
    });
    sections.push({ label: `📋 Tous les services (${list.length})`, items: list });
    return sections.map((sec, i) => (
      <div key={i} className="svc-section">
        <div className="svc-section-header">
          <div className="svc-section-title-wrap">
            <h3 className="svc-section-title">{sec.label}</h3>
            <span className="svc-section-badge">{sec.items.length}</span>
          </div>
          <span className="svc-section-count">{sec.items.length} service{sec.items.length > 1 ? 's' : ''}</span>
        </div>
        <div className="svc-scroll-row">
          {sec.items.map(s => renderServiceCard(s))}
        </div>
      </div>
    ));
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f7', fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif' }}>
      <style>{`
        .svc-page { max-width:1000px; margin:0 auto; padding:0 12px 80px; }
        .svc-header { display:flex; align-items:center; gap:10px; padding:14px 0; position:sticky; top:0; background:#f5f5f7; z-index:50; }
        .svc-back { width:36px; height:36px; border-radius:50%; border:none; background:white; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.06); color:#333; flex-shrink:0; transition:transform .15s; }
        .svc-back:active { transform:scale(.9); }
        .svc-search-wrap { flex:1; position:relative; }
        .svc-search { width:100%; padding:10px 14px 10px 38px; border-radius:20px; border:1.5px solid #eee; background:white; font-size:.85rem; outline:none; transition:border-color .2s; box-sizing:border-box; font-family:inherit; }
        .svc-search:focus { border-color:#34C759; }
        .svc-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none; display:flex; }
        .svc-tabs { display:flex; gap:8px; margin-bottom:14px; }
        .svc-tab { padding:8px 16px; border-radius:20px; border:none; font-size:.8rem; font-weight:600; cursor:pointer; background:white; color:#666; transition:all .2s; font-family:inherit; box-shadow:0 1px 4px rgba(0,0,0,.04); }
        .svc-tab.active { background:#34C759; color:white; box-shadow:0 4px 12px rgba(52,199,89,.25); }
        .svc-tab:active { transform:scale(.95); }
        .svc-tab-count { font-size:.7rem; opacity:.7; margin-left:4px; }
        .svc-section { margin-bottom:20px; }
        .svc-section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:0 2px; }
        .svc-section-title-wrap { display:flex; align-items:center; gap:8px; }
        .svc-section-title { font-size:.95rem; font-weight:700; color:#1a1a1a; margin:0; }
        .svc-section-badge { background:#34C759; color:white; font-size:.65rem; font-weight:700; padding:2px 7px; border-radius:10px; }
        .svc-section-count { font-size:.75rem; color:#999; font-weight:500; }
        .svc-scroll-row { display:flex; gap:12px; overflow-x:auto; overflow-y:hidden; padding-bottom:8px; scroll-snap-type:x proximity; -webkit-overflow-scrolling:touch; scrollbar-width:none; cursor:grab; width:100%; }
        .svc-scroll-row:active { cursor:grabbing; }
        .svc-scroll-row::-webkit-scrollbar { display:none; }
        .svc-card { min-width:185px; max-width:185px; background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); cursor:pointer; border:1px solid #f0f0f0; transition:transform .2s,box-shadow .2s; scroll-snap-align:start; flex-shrink:0; }
        .svc-card:hover { transform:translateY(-3px); box-shadow:0 8px 20px rgba(0,0,0,.1); }
        .svc-card-img-wrap { position:relative; width:100%; aspect-ratio:2/1; overflow:hidden; background:#f0f0f2; }
        .svc-fav-btn { position:absolute; top:6px; right:6px; width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,.92); backdrop-filter:blur(6px); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:5; box-shadow:0 2px 6px rgba(0,0,0,.1); transition:transform .2s; }
        .svc-fav-btn:active { transform:scale(.8); }
        .svc-video-badge { position:absolute; bottom:6px; left:6px; background:rgba(0,0,0,.5); color:white; font-size:.58rem; padding:2px 6px; border-radius:5px; backdrop-filter:blur(4px); z-index:2; display:flex; align-items:center; gap:3px; }
        .svc-card-body { padding:10px 12px 12px; }
        .svc-card-title { font-size:.8rem; font-weight:700; color:#1a1a1a; margin:0 0 2px; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .svc-card-price { font-size:.85rem; font-weight:800; color:#34C759; }
        .svc-card-lieu { font-size:.65rem; color:#aaa; display:flex; align-items:center; gap:2px; }
        .svc-card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:4px; }
        .svc-card-wa { display:inline-flex; align-items:center; gap:3px; padding:4px 10px; border-radius:6px; background:#25D366; color:white; font-size:.65rem; font-weight:600; text-decoration:none; }
        .svc-empty { text-align:center; padding:60px 20px; color:#999; }
        .svc-empty-icon { font-size:3rem; margin-bottom:12px; }
        .svc-empty-title { font-size:1.1rem; font-weight:700; color:#333; margin:0 0 6px; }
        .svc-empty-sub { font-size:.82rem; color:#999; margin:0; }
        .svc-skel-section { margin-bottom:20px; }
        .svc-skel-section-title { width:160px; height:16px; border-radius:8px; background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%); background-size:200% 100%; animation:shimmer 1.4s ease infinite; margin-bottom:12px; }
        .svc-skel-row { display:flex; gap:12px; }
        .svc-skel { min-width:185px; max-width:185px; background:white; border-radius:12px; overflow:hidden; }
        .svc-skel-img { width:100%; aspect-ratio:2/1; background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%); background-size:200% 100%; animation:shimmer 1.4s ease infinite; }
        .svc-skel-body { padding:10px; }
        .svc-skel-line { height:8px; border-radius:4px; background:#f0f0f0; margin-bottom:6px; }
        .svc-skel-line:last-child { width:50%; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      <div className="svc-page">
        <div className="svc-header">
          <button className="svc-back" onClick={() => window.history.back()}><Svg name="arrowLeft" size={20} /></button>
          <div className="svc-search-wrap">
            <span className="svc-search-icon"><Svg name="search" size={16} /></span>
            <input className="svc-search" placeholder="Rechercher un service..." value={search}
              onChange={e => { setSearch(e.target.value); setFavTab(false); }} />
          </div>
        </div>

        <div className="svc-tabs">
          <button className={`svc-tab${!favTab ? ' active' : ''}`} onClick={() => setFavTab(false)}>Tous <span className="svc-tab-count">({services.length})</span></button>
          <button className={`svc-tab${favTab ? ' active' : ''}`} onClick={() => setFavTab(true)}><Svg name="heart" size={12} color={favTab ? 'white' : '#999'} fill={favTab ? 'white' : 'none'} /> Favoris <span className="svc-tab-count">({favs.length})</span></button>
        </div>

        {loading ? (
          <div>
            {[1,2,3].map(i => (
              <div key={i} className="svc-skel-section">
                <div className="svc-skel-section-title" />
                <div className="svc-skel-row">
                  {[1,2,3,4].map(j => (
                    <div key={j} className="svc-skel">
                      <div className="svc-skel-img" />
                      <div className="svc-skel-body">
                        <div className="svc-skel-line" />
                        <div className="svc-skel-line" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="svc-empty">
            <div className="svc-empty-icon">{favTab ? '💔' : '🛎️'}</div>
            <h3 className="svc-empty-title">{favTab ? 'Aucun favori' : 'Aucun service trouvé'}</h3>
            <p className="svc-empty-sub">{favTab ? 'Ajoutez des services en favoris avec le cœur ♥' : 'Modifiez votre recherche ou revenez plus tard'}</p>
          </div>
        ) : (
          buildSections(filtered, favs, handleToggleFav, setDetail)
        )}
      </div>

      {detail && <ServiceDetail svc={detail} onClose={() => setDetail(null)} favs={favs} onToggleFav={handleToggleFav} onShare={handleShare} />}
    </div>
  );
}
