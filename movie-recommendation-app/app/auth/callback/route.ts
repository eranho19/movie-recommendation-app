import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  // Log all query parameters for debugging
  console.log('Callback route - Full URL:', requestUrl.toString());
  console.log('Callback route - Query params:', Object.fromEntries(requestUrl.searchParams));
  console.log('Callback route - Code:', code);
  console.log('Callback route - Error:', error);
  console.log('Callback route - All params:', {
    code,
    error,
    errorDescription,
    allParams: Object.fromEntries(requestUrl.searchParams)
  });

  // Handle OAuth errors
  if (error) {
    console.error('OAuth Error:', error, errorDescription);
    // Redirect to login with error message
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || error || 'Authentication failed');
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to client-side handler with all query parameters preserved
  // Supabase might pass the code in different formats, so we'll let the client handle it
  const handlerUrl = new URL('/auth/callback-handler', requestUrl.origin);
  
  // Preserve all query parameters (code might be there, or Supabase might use different params)
  requestUrl.searchParams.forEach((value, key) => {
    handlerUrl.searchParams.set(key, value);
  });
  
  console.log('Redirecting to handler with URL:', handlerUrl.toString());
  return NextResponse.redirect(handlerUrl);
}
