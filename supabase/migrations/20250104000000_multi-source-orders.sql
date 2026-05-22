-- ═══════════════════════════════════════════════════════════════
-- Migration: Multi‑Source Orders System
-- Ajoute la gestion des produits externes + commandes unifiées
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Colonnes source sur produits ──────────────────────────
ALTER TABLE public.produits
  ADD COLUMN IF NOT EXISTS source            TEXT DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS external_url      TEXT,
  ADD COLUMN IF NOT EXISTS external_platform TEXT,
  ADD COLUMN IF NOT EXISTS external_id       TEXT;

COMMENT ON COLUMN public.produits.source            IS 'internal | jumia | aliexpress | external';
COMMENT ON COLUMN public.produits.external_url      IS 'Lien vers le produit sur la plateforme externe';
COMMENT ON COLUMN public.produits.external_platform IS 'Nom de la plateforme (Jumia, AliExpress…)';
COMMENT ON COLUMN public.produits.external_id       IS 'ID du produit chez le fournisseur externe';

-- ── 2. Table orders (UUID PK, multi‑source) ──────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero          TEXT UNIQUE NOT NULL,
  -- Client
  client_nom      TEXT NOT NULL,
  client_telephone TEXT NOT NULL,
  client_email    TEXT,
  -- Livraison
  adresse_livraison TEXT,
  ville           TEXT,
  quartier        TEXT,
  mode_livraison  TEXT DEFAULT 'domicile',  -- domicile | retrait
  frais_livraison INTEGER DEFAULT 0,
  -- Paiement
  mode_paiement   TEXT,   -- mtn | orange | carte | cash
  operateur       TEXT,   -- mtn | orange
  telephone_paiement TEXT,
  statut_paiement TEXT DEFAULT 'en_attente', -- en_attente | paye | echec | rembourse
  -- Totaux
  sous_total      INTEGER NOT NULL,
  total           INTEGER NOT NULL,
  devise          TEXT DEFAULT 'FCFA',
  -- Suivi
  statut          TEXT DEFAULT 'en_attente',
  -- en_attente | confirme | preparation | expedie | livre | annule | rembourse
  notes_admin     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Table order_items (UUID PK) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      BIGINT REFERENCES public.produits(id) ON DELETE SET NULL,
  -- snapshot produit (au moment de la commande)
  product_nom     TEXT NOT NULL,
  product_prix    INTEGER NOT NULL,
  product_image   TEXT,
  quantite        INTEGER DEFAULT 1,
  -- source
  source            TEXT DEFAULT 'internal',
  external_url      TEXT,
  external_platform TEXT,
  -- suivi externe (admin)
  statut_externe  TEXT DEFAULT 'pending',  -- pending | ordered | received | shipped
  tracking_externe TEXT,
  notes_externe   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Index ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_client_telephone ON public.orders(client_telephone);
CREATE INDEX IF NOT EXISTS idx_orders_statut          ON public.orders(statut);
CREATE INDEX IF NOT EXISTS idx_order_items_order      ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_source     ON public.order_items(source);

-- ── 5. RLS ───────────────────────────────────────────────────
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert orders"      ON public.orders      FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow insert order_items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow select orders"      ON public.orders      FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow select order_items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow update orders"      ON public.orders
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow update order_items" ON public.order_items
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
