'use client';

import { Star, Clock, Play, RefreshCw, Tv } from 'lucide-react';
import type { MovieCombination } from '../types/movie';
import { formatRuntime, getCombinationSummary } from '../lib/combinations';
import { STREAMING_PROVIDERS } from '../types/movie';
import MovieCard from './MovieCard';

interface MovieCombinationCardProps {
  combination: MovieCombination;
  rank: number;
  onPreview: (movie: any) => void;
  onMovieWatchedChange: (movieId: number) => void;
  onReplaceMovie?: (combinationIndex: number, movieId: number) => void;
  combinationIndex?: number;
}

export default function MovieCombinationCard({
  combination,
  rank,
  onPreview,
  onMovieWatchedChange,
  onReplaceMovie,
  combinationIndex,
}: MovieCombinationCardProps) {
  const provider = combination.provider 
    ? STREAMING_PROVIDERS.find(p => p.id === combination.provider)
    : null;

  return (
    <div className="bg-imdb-surface border-2 border-imdb-border rounded-lg overflow-hidden hover:border-imdb-yellow transition-all p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-imdb-yellow font-bold text-4xl">#{rank}</span>
          <div>
            <h3 className="text-xl font-bold text-imdb-text-primary mb-1 flex items-center gap-2">
              {provider ? (
                <>
                  <Tv className="w-5 h-5 text-imdb-yellow" />
                  {provider.name} Combination
                </>
              ) : (
                `Combination ${rank}`
              )}
            </h3>
            <p className="text-sm text-imdb-text-secondary">
              {getCombinationSummary(combination)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 bg-imdb-bg px-3 py-2 rounded-md">
              <Clock className="w-5 h-5 text-imdb-yellow" />
              <span className="text-imdb-text-primary font-bold text-lg">
                {formatRuntime(combination.totalRuntime)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 bg-imdb-bg px-3 py-2 rounded-md">
              <Star className="w-5 h-5 text-imdb-yellow fill-imdb-yellow" />
              <span className="text-imdb-text-primary font-bold text-lg">
                {combination.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {combination.movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            rank={index + 1}
            viewMode="grid"
            onPreview={onPreview}
            onWatchedChange={onMovieWatchedChange}
            compact={true}
            showReplaceButton={!!onReplaceMovie}
            onReplace={onReplaceMovie && combinationIndex !== undefined 
              ? (movieId) => onReplaceMovie(combinationIndex, movieId)
              : undefined
            }
            autoReplaceOnWatched={!!onReplaceMovie}
          />
        ))}
      </div>
    </div>
  );
}


