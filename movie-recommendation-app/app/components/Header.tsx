'use client';

import { Film } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-imdb-bg border-b border-imdb-border sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-imdb-yellow p-2 rounded-md">
              <Film className="w-8 h-8 text-imdb-bg" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-imdb-text-primary">
                Let Me Set You Up For Tonight
              </h1>
              <p className="text-sm text-imdb-text-secondary hidden md:block">
                Perfect movie combinations for your evening
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-imdb-yellow px-4 py-2 rounded-md">
              <span className="text-imdb-bg font-bold text-lg">IMDb</span>
              <span className="text-imdb-bg text-sm">Style</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


