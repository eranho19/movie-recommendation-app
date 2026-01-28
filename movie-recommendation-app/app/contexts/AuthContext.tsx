'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    isAuthenticated: !!user,
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
