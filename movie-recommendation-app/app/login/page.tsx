import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-imdb-bg flex items-center justify-center">
          <div className="text-imdb-text-primary">Loading...</div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
