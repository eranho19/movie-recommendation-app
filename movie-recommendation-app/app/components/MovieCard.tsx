'use client';

import { Star, Calendar, Play, Award, Clock, Eye, EyeOff, RotateCcw, RefreshCcw, Info, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Movie } from '../types/movie';
import { getPosterUrl, getCombinedRating } from '../lib/tmdb';
import { formatRuntime } from '../lib/combinations';
import { isMovieWatched, markMovieAsWatched, unmarkMovieAsWatched } from '../lib/storage';

interface MovieCardProps {
  movie: Movie;
  rank: number;
  viewMode: 'list' | 'grid';
  onPreview: (movie: Movie) => void;
  onWatchedChange?: (movieId: number) => void;
  compact?: boolean;
  showReplaceButton?: boolean;
  onReplace?: (movieId: number) => void;
  autoReplaceOnWatched?: boolean; // Auto-replace when marked as "do not watch again"
}

export default function MovieCard({ 
  movie, 
  rank, 
  viewMode, 
  onPreview, 
  onWatchedChange,
  compact = false,
  showReplaceButton = false,
  onReplace,
  autoReplaceOnWatched = false
}: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const combinedRating = getCombinedRating(movie.vote_average);
  const isAwardWorthy = movie.vote_average >= 8.0 && movie.vote_count > 1000;
  const runtime = movie.runtime ? formatRuntime(movie.runtime) : 'N/A';
  
  const [watchedStatus, setWatchedStatus] = useState<{ watched: boolean; mightWatchAgain: boolean }>({
    watched: false,
    mightWatchAgain: false,
  });
  
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);

  useEffect(() => {
    const checkWatchedStatus = async () => {
      const status = await isMovieWatched(movie.id);
      if (status) {
        setWatchedStatus({ watched: true, mightWatchAgain: status.mightWatchAgain });
      } else {
        setWatchedStatus({ watched: false, mightWatchAgain: false });
      }
    };
    checkWatchedStatus();
  }, [movie.id]);

  const handleMarkAsSeenNoRewatch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Mark as watched with mightWatchAgain = false (do not suggest again)
    await markMovieAsWatched(movie.id, false);
    setWatchedStatus({ watched: true, mightWatchAgain: false });
    onWatchedChange?.(movie.id);
    
    // If auto-replace is enabled and onReplace callback exists, replace the movie
    if (autoReplaceOnWatched && onReplace) {
      onReplace(movie.id);
    }
  };

  const handleMarkAsSeenMightRewatch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Mark as watched with mightWatchAgain = true (can suggest again)
    await markMovieAsWatched(movie.id, true);
    setWatchedStatus({ watched: true, mightWatchAgain: true });
    onWatchedChange?.(movie.id);
  };

  if (viewMode === 'grid') {
    return (
      <div className={`bg-imdb-surface border border-imdb-border rounded-lg overflow-hidden hover:border-imdb-yellow transition-all group ${compact ? '' : ''}`}>
        <div 
          className="relative aspect-[2/3] overflow-hidden"
        >
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!compact && (
            <div className="absolute top-2 left-2 bg-imdb-bg bg-opacity-90 px-2 py-1 rounded-md z-10">
              <span className="text-imdb-yellow font-bold text-lg">#{rank}</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-imdb-bg bg-opacity-90 px-2 py-1 rounded-md flex items-center gap-1 z-10">
            <Star className="w-4 h-4 text-imdb-yellow fill-imdb-yellow" />
            <span className="text-imdb-text-primary font-bold">{combinedRating}</span>
          </div>
          {watchedStatus.watched && (
            <div className="absolute top-12 right-2 bg-green-600 bg-opacity-90 px-2 py-1 rounded-md z-10">
              <Eye className="w-4 h-4 text-white" />
            </div>
          )}
          
          {/* Info Overlay */}
          {showInfoOverlay && (
            <div className="absolute inset-0 bg-black bg-opacity-95 z-20 overflow-y-auto p-4 text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfoOverlay(false);
                }}
                className="absolute top-2 right-2 bg-imdb-yellow text-imdb-bg p-1 rounded-full hover:bg-yellow-500 transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-xs space-y-2 mt-6">
                <h4 className="font-bold text-sm text-imdb-yellow mb-2">{movie.title}</h4>
                
                <div>
                  <span className="font-semibold">Synopsis:</span>
                  <p className="text-gray-300 mt-1 text-[10px] leading-relaxed">
                    {movie.overview || 'No synopsis available.'}
                  </p>
                </div>
                
                <div>
                  <span className="font-semibold">Language:</span>
                  <span className="text-gray-300 ml-1">{movie.original_language?.toUpperCase()}</span>
                </div>
                
                <div>
                  <span className="font-semibold">Year:</span>
                  <span className="text-gray-300 ml-1">{releaseYear}</span>
                </div>
                
                <div>
                  <span className="font-semibold">Runtime:</span>
                  <span className="text-gray-300 ml-1">{runtime}</span>
                </div>
                
                {isAwardWorthy && (
                  <div className="flex items-center gap-1 text-imdb-yellow">
                    <Award className="w-3 h-3" />
                    <span className="text-[10px]">Highly Rated (Award Worthy)</span>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfoOverlay(false);
                    onPreview(movie);
                  }}
                  className="w-full mt-2 bg-imdb-yellow text-imdb-bg py-1.5 rounded text-[10px] font-bold hover:bg-yellow-500 transition-all"
                >
                  View Full Details
                </button>
              </div>
            </div>
          )}
        </div>
        <div className={compact ? "p-3" : "p-4"}>
          <h3 className={`font-bold text-imdb-text-primary ${compact ? 'text-sm mb-1' : 'text-lg mb-2'} line-clamp-1`}>
            {movie.title}
          </h3>
          <div className={`flex items-center gap-2 text-xs text-imdb-text-secondary mb-2 flex-wrap`}>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{releaseYear}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{runtime}</span>
            </div>
            {isAwardWorthy && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1 text-imdb-yellow" title="Award Winner">
                  <Award className="w-3 h-3" />
                </div>
              </>
            )}
          </div>
          {!compact && (
            <p className="text-sm text-imdb-text-secondary line-clamp-3 mb-3">
              {movie.overview}
            </p>
          )}
          <div className="space-y-2">
            {/* View Info Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfoOverlay(true);
              }}
              className="w-full bg-imdb-border hover:bg-imdb-yellow hover:text-imdb-bg text-imdb-text-primary font-bold py-2 px-3 rounded text-xs transition-all flex items-center justify-center gap-2"
              title="View movie details (synopsis, director, cast, awards)"
            >
              <Info className="w-3 h-3" />
              Movie Info
            </button>
            
            {/* Two Separate Seen Buttons */}
            {!watchedStatus.watched ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleMarkAsSeenNoRewatch}
                  className="w-full px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 bg-red-600 text-white hover:bg-red-700"
                  title="Mark as seen and do not suggest again"
                >
                  <EyeOff className="w-3 h-3" />
                  Seen / Don't Suggest
                </button>
                <button
                  onClick={handleMarkAsSeenMightRewatch}
                  className="w-full px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 bg-green-600 text-white hover:bg-green-700"
                  title="Seen but might want to watch again"
                >
                  <Eye className="w-3 h-3" />
                  Seen / Might Rewatch
                </button>
              </div>
            ) : (
              <div className={`w-full px-2 py-1.5 rounded text-xs font-medium text-center ${
                watchedStatus.mightWatchAgain 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}>
                {watchedStatus.mightWatchAgain ? '✓ Might Rewatch' : '✓ Won\'t Suggest'}
              </div>
            )}
            
            {/* Replace Movie Button (in combinations) */}
            {showReplaceButton && onReplace && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReplace(movie.id);
                }}
                className="w-full bg-imdb-yellow hover:bg-yellow-500 text-imdb-bg font-bold py-2 px-3 rounded text-xs transition-all flex items-center justify-center gap-2"
                title="Replace this movie with another suggestion"
              >
                <RefreshCcw className="w-3 h-3" />
                Replace Movie
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-imdb-surface border border-imdb-border rounded-lg overflow-hidden hover:border-imdb-yellow transition-all">
      <div className="flex flex-col md:flex-row gap-4 p-4">
        {/* Rank Badge */}
        <div className="flex items-center justify-center md:justify-start">
          <span className="text-imdb-yellow font-bold text-3xl md:text-4xl w-12 text-center">
            #{rank}
          </span>
        </div>

        {/* Poster */}
        <div 
          className="relative w-full md:w-32 aspect-[2/3] flex-shrink-0 rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onPreview(movie)}
          title="Click to view details"
        >
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 128px"
          />
          {watchedStatus.watched && (
            <div className="absolute top-2 right-2 bg-green-600 bg-opacity-90 px-2 py-1 rounded-md">
              <Eye className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-imdb-text-primary text-xl md:text-2xl">
                {movie.title}
              </h3>
              <div className="flex items-center gap-1 bg-imdb-bg px-3 py-1 rounded-md flex-shrink-0">
                <Star className="w-5 h-5 text-imdb-yellow fill-imdb-yellow" />
                <span className="text-imdb-text-primary font-bold text-lg">{combinedRating}</span>
                <span className="text-imdb-text-secondary text-sm">/100</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-imdb-text-secondary mb-3 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{releaseYear}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{runtime}</span>
              </div>
              <span>•</span>
              <span className="uppercase text-xs">{movie.original_language}</span>
              {isAwardWorthy && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-imdb-yellow" title="Award Winner">
                    <Award className="w-4 h-4" />
                    <span className="text-xs">Award Winner</span>
                  </div>
                </>
              )}
            </div>
            <p className="text-imdb-text-secondary leading-relaxed mb-4">
              {movie.overview}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onPreview(movie)}
              className="bg-imdb-yellow hover:bg-yellow-500 text-imdb-bg font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2"
              title="View full movie details (with director, cast, trailer)"
            >
              <Info className="w-4 h-4" />
              Full Details
            </button>
            
            {!watchedStatus.watched ? (
              <>
                <button
                  onClick={handleMarkAsSeenNoRewatch}
                  className="px-4 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
                  title="Mark as seen and do not suggest again"
                >
                  <EyeOff className="w-4 h-4" />
                  Seen / Don't Suggest
                </button>
                <button
                  onClick={handleMarkAsSeenMightRewatch}
                  className="px-4 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
                  title="Seen but might want to watch again"
                >
                  <Eye className="w-4 h-4" />
                  Seen / Might Rewatch
                </button>
              </>
            ) : (
              <div className={`px-4 py-2 rounded-md font-medium text-center ${
                watchedStatus.mightWatchAgain 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}>
                {watchedStatus.mightWatchAgain ? '✓ Might Rewatch' : '✓ Won\'t Suggest'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

