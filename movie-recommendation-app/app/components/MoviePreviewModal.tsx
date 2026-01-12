'use client';

import { X, ExternalLink, Star, Calendar, Award as AwardIcon, User, Film as FilmIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Movie, Video, Award } from '../types/movie';
import { getMovieVideos, getYouTubeEmbedUrl, getCombinedRating, getMovieAwards, getMovieDetails } from '../lib/tmdb';

interface MoviePreviewModalProps {
  movie: Movie;
  onClose: () => void;
}

interface CrewMember {
  name: string;
  job: string;
}

interface CastMember {
  name: string;
  character: string;
  profile_path: string | null;
}

export default function MoviePreviewModal({ movie, onClose }: MoviePreviewModalProps) {
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [director, setDirector] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [awardsLoading, setAwardsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const details = await getMovieDetails(movie.id);
        
        // Extract director
        const directorInfo = details.credits?.crew?.find((member: CrewMember) => member.job === 'Director');
        setDirector(directorInfo?.name || null);
        
        // Extract top 5 cast members
        const topCast = details.credits?.cast?.slice(0, 5) || [];
        setCast(topCast);
        
        // Get trailer
        const trailerVideo = details.videos?.results?.find(
          (v: Video) => v.type === 'Trailer' && v.site === 'YouTube' && v.official
        ) || details.videos?.results?.find(
          (v: Video) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || details.videos?.results?.[0];
        
        setTrailer(trailerVideo || null);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAwards = async () => {
      try {
        const movieAwards = await getMovieAwards(movie.id);
        setAwards(movieAwards);
      } catch (error) {
        console.error('Error fetching awards:', error);
      } finally {
        setAwardsLoading(false);
      }
    };

    fetchMovieData();
    fetchAwards();
  }, [movie.id]);

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const combinedRating = getCombinedRating(movie.vote_average);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-imdb-surface border border-imdb-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-imdb-border sticky top-0 bg-imdb-surface z-10">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-imdb-text-primary mb-2">
              {movie.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-imdb-text-secondary">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{releaseYear}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-imdb-yellow fill-imdb-yellow" />
                <span className="text-imdb-text-primary font-bold">{combinedRating}/100</span>
              </div>
              <span className="uppercase text-xs bg-imdb-bg px-2 py-1 rounded">
                {movie.original_language}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-imdb-text-secondary hover:text-imdb-yellow ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Player */}
        <div className="p-6">
          {loading ? (
            <div className="aspect-video bg-imdb-bg rounded-lg flex items-center justify-center">
              <div className="text-imdb-text-secondary">Loading trailer...</div>
            </div>
          ) : trailer ? (
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={getYouTubeEmbedUrl(trailer.key)}
                title={trailer.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-imdb-bg rounded-lg flex items-center justify-center">
              <div className="text-center text-imdb-text-secondary">
                <p className="mb-2">No trailer available</p>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-imdb-yellow hover:underline inline-flex items-center gap-1"
                >
                  Search on YouTube
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Awards */}
          {!awardsLoading && awards.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <AwardIcon className="w-5 h-5 text-imdb-yellow" />
                <h3 className="text-xl font-bold text-imdb-text-primary">Awards & Recognition</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {awards.map((award, index) => (
                  <div 
                    key={index}
                    className="bg-imdb-bg border border-imdb-yellow border-opacity-30 rounded-lg p-3 flex items-start gap-3"
                  >
                    <AwardIcon className="w-5 h-5 text-imdb-yellow flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-imdb-text-primary font-semibold">{award.name}</p>
                      {award.category && (
                        <p className="text-imdb-text-secondary text-sm">{award.category}</p>
                      )}
                      {award.year && (
                        <p className="text-imdb-yellow text-xs mt-1">{award.year}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-imdb-text-primary mb-3">Synopsis</h3>
            <p className="text-imdb-text-secondary leading-relaxed">
              {movie.overview || 'No synopsis available.'}
            </p>
          </div>

          {/* Director & Cast */}
          {!loading && (director || cast.length > 0) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Director */}
              {director && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FilmIcon className="w-5 h-5 text-imdb-yellow" />
                    <h3 className="text-lg font-bold text-imdb-text-primary">Director</h3>
                  </div>
                  <p className="text-imdb-text-secondary">{director}</p>
                </div>
              )}
              
              {/* Leading Cast */}
              {cast.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-imdb-yellow" />
                    <h3 className="text-lg font-bold text-imdb-text-primary">Leading Cast</h3>
                  </div>
                  <ul className="text-imdb-text-secondary space-y-1">
                    {cast.map((actor, index) => (
                      <li key={index} className="text-sm">
                        <span className="text-imdb-text-primary">{actor.name}</span>
                        {actor.character && <span className="text-imdb-text-secondary"> as {actor.character}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* External Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`https://www.imdb.com/find?q=${encodeURIComponent(movie.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-imdb-yellow hover:bg-yellow-500 text-imdb-bg font-bold py-2 px-4 rounded-md inline-flex items-center gap-2"
            >
              View on IMDb
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(movie.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-imdb-border hover:bg-imdb-yellow hover:text-imdb-bg text-imdb-text-primary font-bold py-2 px-4 rounded-md inline-flex items-center gap-2 transition-colors"
            >
              View on Rotten Tomatoes
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

