'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { runAllTests, testSupabaseConnection, testSupabaseTable, testSupabaseWrite } from '../lib/supabase-debug';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const initAuth = async () => {
      if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, using localStorage fallback');
        if (isMountedRef.current) {
          setIsInitialized(true);
        }
        return;
      }

      // Check if supabase client exists before using it
      if (!supabase || !isSupabaseConfigured()) {
        console.warn('[AuthProvider] Supabase client not available');
        if (isMountedRef.current) {
          setIsInitialized(true);
        }
        return;
      }

      try {
        // Check if there's already a session
        console.log('[AuthProvider] Checking for existing session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Check if component is still mounted before proceeding
        if (!isMountedRef.current) return;
        
        if (sessionError) {
          // Ignore AbortError - it's usually harmless (component unmounted during request)
          if (sessionError.name !== 'AbortError') {
            console.error('[AuthProvider] Error getting session:', sessionError);
          }
        }
        
        if (!session) {
          // Create anonymous session if no session exists
          console.log('[AuthProvider] No session found, creating anonymous session...');
          const { data, error } = await supabase.auth.signInAnonymously();
          
          // Check if component is still mounted before proceeding
          if (!isMountedRef.current) return;
          
          if (error) {
            // Ignore AbortError - it's usually harmless (component unmounted during request)
            if (error.name !== 'AbortError') {
              console.error('[AuthProvider] ❌ Error creating anonymous session:', error);
              console.error('[AuthProvider] Error code:', error.code);
              console.error('[AuthProvider] Error message:', error.message);
              console.error('[AuthProvider] 💡 TIP: Make sure Anonymous authentication is enabled in Supabase Dashboard');
              console.error('[AuthProvider]    Go to: Authentication → Providers → Enable "Anonymous"');
            }
            // If anonymous auth fails, continue without auth (will use localStorage)
          } else {
            console.log('[AuthProvider] ✅ Anonymous session created successfully!');
            console.log('[AuthProvider] User ID:', data.user?.id);
            console.log('[AuthProvider] User email:', data.user?.email);
            console.log('[AuthProvider] Is anonymous:', data.user?.is_anonymous);
          }
        } else {
          console.log('[AuthProvider] ✅ Existing session found');
          console.log('[AuthProvider] User ID:', session.user.id);
          console.log('[AuthProvider] Is anonymous:', session.user.is_anonymous);
        }
      } catch (error: any) {
        // Ignore AbortError - it's usually harmless (component unmounted during request)
        if (error?.name !== 'AbortError' && error?.message !== 'signal is aborted without reason') {
          console.error('[AuthProvider] ❌ Error initializing auth:', error);
        }
        // Continue without auth (will use localStorage)
      } finally {
        if (isMountedRef.current) {
          setIsInitialized(true);
          
          // Expose debug functions to window for easy testing
          if (typeof window !== 'undefined') {
            (window as any).testSupabase = {
              runAll: runAllTests,
              testConnection: testSupabaseConnection,
              testTable: testSupabaseTable,
              testWrite: testSupabaseWrite,
            };
            console.log('💡 Debug tools available! Type in console:');
            console.log('   testSupabase.runAll() - Run all tests');
            console.log('   testSupabase.testConnection() - Test auth');
            console.log('   testSupabase.testTable() - Test table access');
            console.log('   testSupabase.testWrite() - Test writing data');
          }
        }
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Show loading state while initializing (optional, can be removed if not needed)
  if (!isInitialized) {
    return <>{children}</>; // Render children immediately, auth happens in background
  }

  return <>{children}</>;
}
