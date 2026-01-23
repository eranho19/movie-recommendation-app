import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if credentials are provided
let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // Enable to detect session from URL
      },
    });
  } catch (error) {
    console.warn('Failed to create Supabase client:', error);
  }
} else {
  console.warn('Supabase credentials not found. Using localStorage fallback.');
}

// Create a safe wrapper that checks if client exists
export const supabase: SupabaseClient | null = supabaseInstance;

export const isSupabaseConfigured = () => {
  return Boolean(supabaseInstance);
};
