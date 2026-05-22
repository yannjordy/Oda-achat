-- ============================================================
-- MIGRATION : Nouvelles tables pour ODA Market
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- 1. Table des abonnements push
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  keys JSONB,
  visitor_id TEXT,
  language TEXT DEFAULT 'fr',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for all" ON public.push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all" ON public.push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Enable delete for all" ON public.push_subscriptions FOR DELETE USING (true);

-- 2. Table des clics de parrainage
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  page TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  UNIQUE(referral_code, visitor_id)
);

ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for all" ON public.referral_clicks FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON public.referral_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_visitor ON public.referral_clicks(visitor_id);

-- 3. Vérifier que la table visiteurs existe
CREATE TABLE IF NOT EXISTS public.visiteurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT,
  event TEXT,
  page TEXT,
  referrer TEXT,
  referral_code TEXT,
  user_agent TEXT,
  screen TEXT,
  language TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visiteurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for all" ON public.visiteurs FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_visiteurs_visitor ON public.visiteurs(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visiteurs_event ON public.visiteurs(event);
CREATE INDEX IF NOT EXISTS idx_visiteurs_created ON public.visiteurs(created_at);
