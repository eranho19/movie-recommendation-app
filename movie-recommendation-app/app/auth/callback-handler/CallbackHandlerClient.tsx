'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function CallbackHandlerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [_isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        console.error('Supabase is not configured');
        router.push('/login?error=Supabase is not configured');
        return;
      }

      // Log for debugging
      console.log('Callback handler - Full URL:', window.location.href);
      console.log('Callback handler - Full href:', window.location.href);
      console.log('Callback handler - Pathname:', window.location.pathname);
      console.log('Callback handler - Search:', window.location.search);
      console.log('Callback handler - Hash:', window.location.hash);
      console.log('Callback handler - Code from query params:', code);
      console.log('Callback handler - All search params:', Array.from(searchParams.entries()));

      // Check hash fragment (Supabase sometimes uses hash for OAuth callbacks)
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      const codeFromHash = hashParams.get('code');
      const errorFromHash = hashParams.get('error');
      const errorDescriptionFromHash = hashParams.get('error_description');

      // Also check for other possible parameter names Supabase might use
      const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
      const type = searchParams.get('type') || hashParams.get('type');

      console.log('Callback handler - Hash:', hash);
      console.log('Callback handler - Code from hash:', codeFromHash);
      console.log('Callback handler - Error from hash:', errorFromHash);
      console.log('Callback handler - Access token:', accessToken ? 'present' : 'missing');
      console.log('Callback handler - Refresh token:', refreshToken ? 'present' : 'missing');
      console.log('Callback handler - Type:', type);

      // Handle errors from hash
      if (errorFromHash) {
        console.error('OAuth error from hash:', errorFromHash, errorDescriptionFromHash);
        router.push(
          `/login?error=${encodeURIComponent(
            errorDescriptionFromHash || errorFromHash || 'Authentication failed'
          )}`
        );
        return;
      }

      // Use code from query params or hash
      const authCode = code || codeFromHash;

      if (authCode) {
        try {
          // Exchange the code for a session on the client side
          console.log('Exchanging code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

          if (error) {
            console.error('Session Exchange Error:', error);
            router.push(`/login?error=${encodeURIComponent(error.message || 'Failed to create session')}`);
            return;
          }

          if (!data.session) {
            console.error('No session returned from exchange');
            router.push('/login?error=Failed to create session');
            return;
          }

          console.log('Session created successfully, redirecting to home');
          // Success - redirect to home
          // The session is now stored in localStorage and will be picked up by AuthContext
          router.push('/');
        } catch (err: any) {
          console.error('Callback Handler Error:', err);
          router.push(`/login?error=${encodeURIComponent(err.message || 'Authentication error occurred')}`);
        }
      } else {
        // No code in URL - check if Supabase has already processed the session
        // This can happen if Supabase's detectSessionInUrl already handled it
        console.log('No code in URL, checking if Supabase already has a session...');

        // Wait a moment for Supabase to process the URL if it contains session info
        await new Promise((resolve) => setTimeout(resolve, 500));

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          router.push(`/login?error=${encodeURIComponent(sessionError.message || 'Failed to get session')}`);
          return;
        }

        if (session) {
          console.log('Session already exists, redirecting to home');
          router.push('/');
          return;
        }

        // No code and no session - this is an error
        console.error('No authorization code received and no existing session');
        router.push('/login?error=No authorization code received');
      }
    };

    handleCallback().finally(() => {
      setIsProcessing(false);
    });
  }, [code, searchParams, router]);

  return (
    <div className="min-h-screen bg-imdb-bg flex items-center justify-center">
      <div className="text-imdb-text-primary">Completing sign in...</div>
    </div>
  );
}

