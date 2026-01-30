'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { runAllTests, testSupabaseConnection, testSupabaseTable, testSupabaseWrite } from '../lib/supabase-debug';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
  // "Authenticated" here means a real (non-anonymous) user session.
  // We still use anonymous sessions (when enabled) so we can persist watched movies to Supabase.
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = supabase;

    if (!isSupabaseConfigured() || !client) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: existingSession }, error: sessionError } = await client.auth.getSession();
        if (!isMounted) return;

        if (sessionError) {
          console.error('[AuthProvider] Error getting session:', sessionError);
        }

        if (existingSession) {
          setSession(existingSession);
          setUser(existingSession.user ?? null);
        } else {
          // No session: try to create an anonymous session so we can persist watched movies to Supabase.
          // If Anonymous provider is not enabled in Supabase, this will fail and the app will fall back to localStorage.
          console.log('[AuthProvider] No session found, attempting anonymous sign-in...');
          const { data, error } = await client.auth.signInAnonymously();
          if (!isMounted) return;

          if (error) {
            console.error('[AuthProvider] ❌ Anonymous sign-in failed:', error);
            console.error('[AuthProvider] 💡 TIP: Enable Anonymous auth in Supabase (Authentication → Providers → Anonymous)');
            setSession(null);
            setUser(null);
          } else {
            console.log('[AuthProvider] ✅ Anonymous session created:', data.user?.id);
            setSession(data.session ?? null);
            setUser(data.user ?? null);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('[AuthProvider] ❌ Error initializing auth:', err);
        setSession(null);
        setUser(null);
      } finally {
        if (!isMounted) return;
        setLoading(false);

        // Expose debug functions to window for easy testing (matches SUPABASE_TROUBLESHOOTING.md).
        if (typeof window !== 'undefined') {
          (window as any).testSupabase = {
            runAll: runAllTests,
            testConnection: testSupabaseConnection,
            testTable: testSupabaseTable,
            testWrite: testSupabaseWrite,
          };
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase || !isSupabaseConfigured()) {
      return { error: { message: 'Supabase is not configured' } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!supabase || !isSupabaseConfigured()) {
      return { error: { message: 'Supabase is not configured' } };
    }

    // Supabase automatically encrypts/hashes passwords using bcrypt
    // No manual encryption needed - passwords are never stored in plain text
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // If email confirmation is disabled, user will be automatically signed in
        // If enabled, user will need to confirm email first
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // If signup is successful and email confirmation is disabled, 
    // the user is automatically logged in and session is created
    return { error, data };
  };

  const signOut = async () => {
    if (!supabase || !isSupabaseConfigured()) {
      return;
    }

    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!user && !user.is_anonymous,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
