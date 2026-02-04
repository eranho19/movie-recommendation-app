'use client';

import Image from 'next/image';
import { Calendar, EyeOff, Star, Trash2 } from 'lucide-react';
import type { Movie } from '../types/movie';
import { getPosterUrl, getCombinedRating } from '../lib/tmdb';

export type ExcludedMovieEntry = {
  id: number;
  watchedAt?: string;
  movie?: Movie;
  loadError?: boolean;
};

type ExcludedMoviesPanelProps = {
  entries: ExcludedMovieEntry[];
  loading: boolean;
  error: string | null;
  onPreview: (movie: Movie) => void;
  onRemoveFromList: (movieId: number) => void;
};

export default function ExcludedMoviesPanel({
  entries,
  loading,
  error,
  onPreview,
  onRemoveFromList,
}: ExcludedMoviesPanelProps) {
  if (loading) {
    return (
      <div className="bg-imdb-surface border border-imdb-border rounded-lg p-6">
        <div className="text-imdb-text-secondary">Loading your “Do not suggest again” list…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4">
        <div className="text-red-300 text-sm">{error}</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-imdb-surface border border-imdb-border rounded-lg p-10 text-center">
        <div className="w-14 h-14 bg-imdb-yellow bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
          <EyeOff className="w-7 h-7 text-imdb-yellow" />
        </div>
        <h3 className="text-imdb-text-primary font-bold text-lg mb-2">No movies here yet</h3>
        <p className="text-imdb-text-secondary text-sm">
          When you click <span className="text-imdb-yellow font-semibold">Seen / Don’t Suggest</span>, the movie will show up in this tab.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-imdb-surface border border-imdb-border rounded-lg overflow-hidden">
      <div className="divide-y divide-imdb-border">
        {entries.map((entry) => {
          const movie = entry.movie;
          const posterUrl = getPosterUrl(movie?.poster_path ?? null, 'w185');
          const releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : '—';
          const combinedRating = movie ? getCombinedRating(movie.vote_average) : undefined;

          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 hover:bg-imdb-bg/40 transition-colors"
            >
              <div className="relative w-12 h-[72px] flex-shrink-0 rounded overflow-hidden bg-imdb-bg">
                <Image
                  src={posterUrl}
                  alt={movie?.title ?? `Movie ${entry.id}`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-imdb-text-primary truncate">
                      {movie?.title ?? `Unknown title (ID ${entry.id})`}
                    </div>
                    <div className="text-xs text-imdb-text-secondary flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {releaseYear}
                      </span>
                      {entry.watchedAt && (
                        <>
                          <span>•</span>
                          <span title={entry.watchedAt}>Excluded {new Date(entry.watchedAt).toLocaleDateString()}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-red-300">
                        <EyeOff className="w-3 h-3" />
                        Don’t suggest
                      </span>
                      {typeof combinedRating === 'number' && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3 h-3 text-imdb-yellow fill-imdb-yellow" />
                            <span className="text-imdb-text-primary font-semibold">{combinedRating}/100</span>
                          </span>
                        </>
                      )}
                      {entry.loadError && (
                        <>
                          <span>•</span>
                          <span className="text-red-300">Couldn’t load details</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {movie && (
                      <button
                        onClick={() => onPreview(movie)}
                        className="bg-imdb-yellow hover:bg-yellow-500 text-imdb-bg font-bold py-1.5 px-3 rounded-md text-xs"
                        title="View full movie details"
                      >
                        Details
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveFromList(entry.id)}
                      className="bg-imdb-border hover:bg-red-700 hover:text-white text-imdb-text-primary font-bold py-1.5 px-3 rounded-md inline-flex items-center justify-center gap-2 transition-colors text-xs"
                      title="Delete this entry from your “Do not suggest again” list"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove from List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

