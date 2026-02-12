'use client';

import { Star, Calendar, Award as AwardIcon, Clock, Eye, EyeOff, RefreshCcw, Info, X, User, Film, Trophy, Globe, Sparkles, MessageSquareText } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Award, Movie } from '../types/movie';
import { getPosterUrl, getCombinedRating, getMovieAwards, getMovieDetails } from '../lib/tmdb';
import { formatRuntime } from '../lib/combinations';
import { isMovieWatched, markMovieAsWatched } from '../lib/storage';

interface CrewMember {
  name: string;
  job: string;
}

interface CastMember {
  name: string;
  character?: string;
}

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
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [director, setDirector] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState<string | null>(null);
  const [reviewHasSpoilers, setReviewHasSpoilers] = useState<boolean | null>(null);
  const [showReviewCard, setShowReviewCard] = useState(false);

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

  useEffect(() => {
    if (!showInfoOverlay) return;

    let cancelled = false;
    const run = async () => {
      setInfoLoading(true);
      setInfoError(null);
      try {
        const [details, movieAwards] = await Promise.all([
          getMovieDetails(movie.id),
          getMovieAwards(movie.id),
        ]);

        const directorInfo = details.credits?.crew?.find((member: CrewMember) => member.job === 'Director');
        const topCast = (details.credits?.cast ?? []).slice(0, 5).map((c: any) => ({
          name: c?.name,
          character: c?.character,
        })) as CastMember[];

        if (!cancelled) {
          setDirector(directorInfo?.name || null);
          setCast(topCast);
          setAwards(movieAwards ?? []);
        }
      } catch (e) {
        console.error('Error fetching movie info overlay details:', e);
        if (!cancelled) setInfoError('Could not load extra info. Please try again.');
      } finally {
        if (!cancelled) setInfoLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [showInfoOverlay, movie.id]);

  const getAwardDecoration = (awardName: string) => {
    const name = awardName.toLowerCase();
    if (name.includes('academy') || name.includes('oscar')) return { Icon: Trophy, label: 'Oscars' };
    if (name.includes('golden globe')) return { Icon: Globe, label: 'Golden Globes' };
    if (name.includes('bafta')) return { Icon: AwardIcon, label: 'BAFTA' };
    if (name.includes('cannes')) return { Icon: Film, label: 'Cannes' };
    if (name.includes('critically') || name.includes('acclaim')) return { Icon: Sparkles, label: 'Critically Acclaimed' };
    return { Icon: AwardIcon, label: 'Award' };
  };

  const handleFetchReview = async (spoilers: boolean) => {
    setReviewLoading(true);
    setReviewError(null);
    setReviewText(null);
    setReviewHasSpoilers(spoilers);
    setShowReviewCard(true);
    try {
      const res = await fetch('/api/movie-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id, spoilers, purpose: spoilers ? 'explained' : 'review' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      setReviewText(data?.review ?? 'No review available.');
    } catch (e: any) {
      console.error('Error fetching review:', e);
      setReviewError(e?.message || 'Failed to generate review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCloseReviewCard = () => {
    setShowReviewCard(false);
  };

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
      <div className={`relative bg-imdb-surface border border-imdb-border rounded-lg overflow-hidden hover:border-imdb-yellow transition-all group ${compact ? '' : ''}`}>
        {/* Base card content (hidden when overlay is open so nothing appears "below" it) */}
        <div className={showInfoOverlay ? 'opacity-0 pointer-events-none select-none' : ''}>
          <div className="relative aspect-[2/3] overflow-hidden">
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
                    <AwardIcon className="w-3 h-3" />
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

        {/* Info Overlay (covers entire card: poster + details + buttons) */}
        {showInfoOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-95 z-50 flex flex-col text-white overflow-hidden min-h-0 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReviewCard(false);
                setShowInfoOverlay(false);
              }}
              className="absolute top-2 right-2 bg-imdb-yellow text-imdb-bg p-1 rounded-full hover:bg-yellow-500 transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Review mode replaces Movie Info until closed/back */}
            {showReviewCard ? (
              <>
                {/* Header (non-scroll) */}
                <div className="px-4 pt-6 pb-3 flex-shrink-0">
                  <div className="text-imdb-yellow font-bold text-sm truncate">
                    {reviewHasSpoilers ? 'Movie explained (may include spoilers)' : 'Movie review (no spoilers)'}
                  </div>
                  <div className="text-xs text-gray-300 truncate">{movie.title}</div>
                </div>

                {/* Scrollable review */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                  {reviewLoading && (
                    <div className="text-xs text-gray-300">Gathering sources and writing…</div>
                  )}
                  {reviewError && <div className="text-xs text-red-300">{reviewError}</div>}
                  {reviewText && (
                    <div className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {reviewText}
                    </div>
                  )}
                  {!reviewLoading && !reviewError && !reviewText && (
                    <div className="text-xs text-gray-300">No review available.</div>
                  )}
                </div>

                {/* Footer (fixed) */}
                <div className="flex-shrink-0 px-4 pb-4 pt-3 border-t border-white/10 bg-black/90">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseReviewCard();
                    }}
                    className="w-full bg-imdb-border hover:bg-imdb-yellow hover:text-imdb-bg text-imdb-text-primary font-bold py-2 px-3 rounded text-xs transition-all"
                  >
                    Back to Movie Info
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Header (non-scroll) */}
                <div className="px-4 pt-6 pb-3 flex-shrink-0">
                  <h4 className="font-bold text-sm text-imdb-yellow">{movie.title}</h4>
                </div>

                {/* Scrollable details */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                  <div className="text-xs space-y-2">
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

                    {/* Director + Cast + Awards */}
                    {infoLoading ? (
                      <div className="text-gray-300 text-[10px]">Loading director, cast, and awards…</div>
                    ) : infoError ? (
                      <div className="text-red-300 text-[10px]">{infoError}</div>
                    ) : (
                      <>
                        {director && (
                          <div className="flex items-start gap-2">
                            <Film className="w-3 h-3 text-imdb-yellow mt-0.5" />
                            <div>
                              <span className="font-semibold">Director:</span>
                              <span className="text-gray-300 ml-1">{director}</span>
                            </div>
                          </div>
                        )}

                        {cast.length > 0 && (
                          <div className="flex items-start gap-2">
                            <User className="w-3 h-3 text-imdb-yellow mt-0.5" />
                            <div>
                              <span className="font-semibold">Leading actors:</span>
                              <ul className="text-gray-300 mt-1 text-[10px] space-y-0.5">
                                {cast.map((actor, idx) => (
                                  <li key={idx}>
                                    <span className="text-white">{actor.name}</span>
                                    {actor.character ? <span className="text-gray-400"> as {actor.character}</span> : null}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {awards.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 text-imdb-yellow">
                              <AwardIcon className="w-3 h-3" />
                              <span className="text-[10px] font-semibold">Main awards</span>
                            </div>
                            <div className="mt-1 space-y-1">
                              {awards.slice(0, 4).map((award, idx) => {
                                const { Icon } = getAwardDecoration(award.name);
                                return (
                                  <div key={idx} className="flex items-center gap-2 text-[10px] text-gray-300">
                                    <Icon className="w-3 h-3 text-imdb-yellow" />
                                    <span>{award.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {isAwardWorthy && (
                      <div className="flex items-center gap-1 text-imdb-yellow">
                        <AwardIcon className="w-3 h-3" />
                        <span className="text-[10px]">Highly Rated (Award Worthy)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer (fixed buttons) */}
                <div className="flex-shrink-0 px-4 pb-4 pt-3 border-t border-white/10 bg-black/90">
                  <div className="text-xs space-y-2">
                    <div className="flex items-center gap-2 text-imdb-yellow">
                      <MessageSquareText className="w-3 h-3" />
                      <span className="text-[10px] font-semibold">Movie reviews (web-based)</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleFetchReview(true);
                        }}
                        className="w-full bg-red-600 text-white py-1.5 rounded text-[10px] font-bold hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Explains the movie and may include spoilers"
                        disabled={reviewLoading}
                      >
                        Movie explained (may include spoilers)
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleFetchReview(false);
                        }}
                        className="w-full bg-imdb-border text-white py-1.5 rounded text-[10px] font-bold hover:bg-imdb-yellow hover:text-imdb-bg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Generates a spoiler-free review by gathering info from the web"
                        disabled={reviewLoading}
                      >
                        Movie review without spoilers
                      </button>
                    </div>

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
              </>
            )}
          </div>
        )}
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
                  <AwardIcon className="w-4 h-4" />
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

