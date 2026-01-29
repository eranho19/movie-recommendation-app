import { Suspense } from 'react';
import CallbackHandlerClient from './CallbackHandlerClient';

export const dynamic = 'force-dynamic';

export default function CallbackHandlerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-imdb-bg flex items-center justify-center">
          <div className="text-imdb-text-primary">Completing sign in...</div>
        </div>
      }
    >
      <CallbackHandlerClient />
    </Suspense>
  );
}
