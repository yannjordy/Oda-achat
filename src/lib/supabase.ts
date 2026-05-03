// src/lib/supabase.ts
// ─────────────────────────────────────────────────────────────
// Client Supabase côté navigateur (singleton)
// Utilisé dans tous les composants client ("use client")
// ─────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Instance singleton pour usage direct
export const supabase = createClient();
