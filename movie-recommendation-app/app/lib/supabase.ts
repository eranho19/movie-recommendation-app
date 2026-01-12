import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if credentials are provided
let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Failed to create Supabase client:', error);
  }
} else {
  console.warn('Supabase credentials not found. Using localStorage fallback.');
}

export const supabase = supabaseInstance as SupabaseClient;

export const isSupabaseConfigured = () => {
  return Boolean(supabaseInstance);
};
