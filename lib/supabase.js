import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

export const supabase = supabaseConfig.url && supabaseConfig.url.startsWith('http')
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;