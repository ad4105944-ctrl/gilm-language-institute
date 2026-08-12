import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const EXPECTED_SUPABASE_URL = "https://feaxpoleoyptdtaldgwx.supabase.co";

function runtimeConfig() {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
  const publishableKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "");
  return { url, publishableKey };
}

export function getSupabaseRuntimeConfig() {
  const { url, publishableKey } = runtimeConfig();
  if (!url || !publishableKey) {
    throw new Error("Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployed environment.");
  }
  if (url !== EXPECTED_SUPABASE_URL) {
    throw new Error(`Supabase runtime URL mismatch: received ${url}; expected ${EXPECTED_SUPABASE_URL}. Rebuild/redeploy after saving the corrected secret.`);
  }
  return { url, publishableKey };
}

export function createSupabaseAuthClient(): SupabaseClient {
  const { url, publishableKey } = getSupabaseRuntimeConfig();
  // Create a fresh client from the current build-time runtime values for each auth attempt;
  // no stale URL, project ref, or module-level client is retained.
  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function emailForGilmName(name: string) {
  const emails: Record<string, string> = {
    Ahmed: "ahmed@gilm.example",
    Amar: "amar@gilm.example",
    Cheybai: "cheybai@gilm.example",
    Tiki: "tiki@gilm.example",
  };
  const email = emails[name];
  if (!email) throw new Error("Choose one of the four authorized learners.");
  return email;
}
