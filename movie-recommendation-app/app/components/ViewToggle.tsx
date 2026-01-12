'use client';

import { List, Grid3x3 } from 'lucide-react';
import type { ViewMode } from '../types/movie';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-imdb-surface border border-imdb-border rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded-md transition-all ${
          viewMode === 'list'
            ? 'bg-imdb-yellow text-imdb-bg'
            : 'text-imdb-text-secondary hover:text-imdb-yellow'
        }`}
        title="List View"
      >
        <List className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-md transition-all ${
          viewMode === 'grid'
            ? 'bg-imdb-yellow text-imdb-bg'
            : 'text-imdb-text-secondary hover:text-imdb-yellow'
        }`}
        title="Grid View"
      >
        <Grid3x3 className="w-5 h-5" />
      </button>
    </div>
  );
}








