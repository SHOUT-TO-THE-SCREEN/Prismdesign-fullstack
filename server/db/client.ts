import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";

// This elevated client must never be imported by or exposed to the frontend.
export const db = createClient(config.supabaseUrl, config.supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});
