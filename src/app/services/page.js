'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('services')
      .select('*')
      .eq('statut', 'actif')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setServices(data || []);
      })
      .catch(() => { if (!cancelled) setServices([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:'Poppins,sans-serif' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#34C759,#30B068)', padding:'60px 20px 40px', textAlign:'center', color:'white' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🛎️</div>
        <h1 style={{ fontSize:'1.6rem', fontWeight:800, margin:0 }}>Services</h1>
        <p style={{ fontSize:'.9rem', opacity:.8, marginTop:6 }}>Découvrez les services de nos partenaires</p>
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'20px 16px 40px' }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius:16, overflow:'hidden', background:'#F2F2F7', aspectRatio:'4/3', animation:'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#999' }}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>🛎️</div>
            <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'#333', margin:'0 0 6px' }}>Aucun service pour le moment</h2>
            <p style={{ fontSize:'.85rem', color:'#999', margin:0 }}>Revenez plus tard pour découvrir les services disponibles</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {services.map(svc => (
              <div key={svc.id} style={{ borderRadius:16, overflow:'hidden', border:'1px solid #F0F0F0', background:'white', boxShadow:'0 2px 12px rgba(0,0,0,.06)', transition:'transform .2s,box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'; }}
              >
                {/* Images */}
                <div style={{ position:'relative', aspectRatio:'16/10', overflow:'hidden', background:'#F2F2F7' }}>
                  {svc.images && svc.images.length > 0 ? (
                    <img src={svc.images[0]} alt={svc.nom}
                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', color:'#ccc' }}>🛎️</div>
                  )}
                  {svc.video_url && (
                    <a href={svc.video_url} target="_blank" rel="noopener noreferrer"
                      style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.5)', color:'white', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', fontSize:'.7rem', backdropFilter:'blur(4px)' }}>
                      ▶
                    </a>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding:14 }}>
                  <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 4px', lineHeight:1.3 }}>{svc.nom}</h3>
                  {svc.description && (
                    <p style={{ fontSize:'.8rem', color:'#666', margin:'0 0 10px', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {svc.description}
                    </p>
                  )}
                  {svc.lieu && (
                    <div style={{ fontSize:'.75rem', color:'#999', marginBottom:8, display:'flex', alignItems:'center', gap:4 }}>
                      📍 {svc.lieu}
                    </div>
                  )}
                  {svc.images && svc.images.length > 1 && (
                    <div style={{ display:'flex', gap:4, marginBottom:10 }}>
                      {svc.images.slice(0,4).map((img, i) => (
                        <img key={i} src={img} alt=""
                          style={{ width:32, height:32, borderRadius:6, objectFit:'cover', border:'1px solid #F0F0F0' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ))}
                    </div>
                  )}
                  {svc.whatsapp && (
                    <a href={`https://wa.me/${svc.whatsapp.replace(/\s/g,'')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, background:'#25D366', color:'white', fontWeight:600, fontSize:'.8rem', textDecoration:'none', transition:'opacity .15s' }}
                      onMouseEnter={e => e.target.style.opacity = '.85'}
                      onMouseLeave={e => e.target.style.opacity = '1'}
                    >
                      💬 Contacter via WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
}
