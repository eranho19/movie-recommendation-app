'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../components/LoginPage';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const mode = searchParams.get('mode') || 'login';
  const errorParam = searchParams.get('error');
  const [initialError] = useState<string | null>(errorParam);

  // Clear error from URL after displaying it
  useEffect(() => {
    if (errorParam) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [errorParam]);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-imdb-bg flex items-center justify-center">
        <div className="text-imdb-text-primary">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return <LoginPage initialMode={mode === 'signup' ? 'signup' : 'login'} initialError={initialError} />;
}

