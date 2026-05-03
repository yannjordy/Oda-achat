// src/lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Client Supabase côté navigateur (singleton)
// ─────────────────────────────────────────────────────────────

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Instance singleton pour usage direct dans les composants
export const supabase = createClient()
