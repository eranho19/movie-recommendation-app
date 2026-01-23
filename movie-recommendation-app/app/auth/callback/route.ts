import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth Error:', error, errorDescription);
    // Redirect to login with error message
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || error || 'Authentication failed');
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
        
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('Session Exchange Error:', exchangeError);
          const loginUrl = new URL('/login', requestUrl.origin);
          loginUrl.searchParams.set('error', exchangeError.message || 'Failed to create session');
          return NextResponse.redirect(loginUrl);
        }

        // Success - redirect to home
        return NextResponse.redirect(new URL('/', requestUrl.origin));
      } catch (err: any) {
        console.error('Callback Error:', err);
        const loginUrl = new URL('/login', requestUrl.origin);
        loginUrl.searchParams.set('error', err.message || 'Authentication error occurred');
        return NextResponse.redirect(loginUrl);
      }
    } else {
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'Supabase is not configured');
      return NextResponse.redirect(loginUrl);
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
