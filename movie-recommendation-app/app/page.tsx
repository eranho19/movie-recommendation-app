'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import ViewToggle from './components/ViewToggle';
import MovieCard from './components/MovieCard';
import MovieCombinationCard from './components/MovieCombinationCard';
import MoviePreviewModal from './components/MoviePreviewModal';
import { AlertCircle, RefreshCw, Film, Star, Tv, Calendar } from 'lucide-react';
import LoadingAnimation from './components/LoadingAnimation';
import type { Movie, Filters, ViewMode, Genre, MovieCombination, MovieWithProvider } from './types/movie';
import { STREAMING_PROVIDERS, LANGUAGE_OPTIONS } from './types/movie';
import { getGenres, discoverMoviesWithProviders, getCombinedRating } from './lib/tmdb';
import { generateMovieCombinations, generateCombinationsPerProvider, findReplacementMovie } from './lib/combinations';
import { shouldExcludeMovie } from './lib/storage';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [movies, setMovies] = useState<MovieWithProvider[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [movieCombinations, setMovieCombinations] = useState<MovieCombination[]>([]);
  // Track replacement history: combinationIndex -> movieSlotIndex -> previously replaced movie IDs
  const [replacementHistory, setReplacementHistory] = useState<Map<string, number[]>>(new Map());
  const [combinationSeed, setCombinationSeed] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldFetchMovies, setShouldFetchMovies] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    genres: [],
    tags: [],
    minScore: 0,
    language: 'all',
    internationalLanguages: undefined,
    totalTime: undefined,
    streamingProviders: [],
    fromYear: undefined,
    toYear: undefined,
  });

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data.genres);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('Failed to load genres. Please check your API key.');
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies only when suggest button is clicked
  useEffect(() => {
    if (!shouldFetchMovies) return;
    
    // Capture filters at the time of fetch to avoid race conditions
    const currentFilters = filters;
    
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          sort_by: 'vote_average.desc',
          'vote_average.gte': currentFilters.minScore,
          watch_region: 'US',
        };

        // Add genre filter
        if (currentFilters.genres.length > 0) {
          params.with_genres = currentFilters.genres.join(',');
        }

        // Add language filter - International means NOT English
        if (currentFilters.language === 'english') {
          params.with_original_language = 'en';
        } else if (currentFilters.language === 'international') {
          // For international, we need to fetch all and filter out English
          // TMDB doesn't support "NOT" operator directly in this param
          params.with_original_language = ''; // We'll filter after
        }

        // Add streaming provider filter
        if (currentFilters.streamingProviders.length > 0) {
          const providerIds = currentFilters.streamingProviders
            .map(id => STREAMING_PROVIDERS.find(p => p.id === id)?.tmdbId)
            .filter(id => id !== undefined);
          params.with_watch_providers = providerIds.join('|');
        }

        // Add year range filter
        if (currentFilters.fromYear) {
          params['primary_release_date.gte'] = `${currentFilters.fromYear}-01-01`;
        }
        if (currentFilters.toYear) {
          params['primary_release_date.lte'] = `${currentFilters.toYear}-12-31`;
        }

        // Fetch movies with runtime and provider information
        console.log('Fetching with params:', params);
        const moviesData = await discoverMoviesWithProviders(params, 150);
        console.log(`Fetched ${moviesData.length} movies from TMDB`);
        
        // Filter by language
        let results = moviesData;
        if (currentFilters.language === 'international') {
          // Filter out English
          results = results.filter((movie: MovieWithProvider) => movie.original_language !== 'en');
          
          // If specific languages are selected, filter by those
          if (currentFilters.internationalLanguages && currentFilters.internationalLanguages.length > 0) {
            const selectedLanguageCodes = currentFilters.internationalLanguages
              .map(langId => {
                const langOption = LANGUAGE_OPTIONS.find(l => l.id === langId);
                return langOption?.code;
              })
              .filter(code => code !== undefined && code !== '');
            
            // If "Other" is selected, include languages not in the specific list
            const hasOther = currentFilters.internationalLanguages.includes('other');
            const specificCodes = selectedLanguageCodes.filter(code => code !== '');
            
            if (hasOther && specificCodes.length > 0) {
              // Include specific languages OR languages not in the list
              results = results.filter((movie: MovieWithProvider) => {
                const lang = movie.original_language;
                return specificCodes.includes(lang) || !LANGUAGE_OPTIONS.some(l => l.code === lang && l.code !== '');
              });
            } else if (hasOther) {
              // Only "Other" selected - show languages not in the specific list
              results = results.filter((movie: MovieWithProvider) => {
                const lang = movie.original_language;
                return !LANGUAGE_OPTIONS.some(l => l.code === lang && l.code !== '');
              });
            } else if (specificCodes.length > 0) {
              // Only specific languages selected
              results = results.filter((movie: MovieWithProvider) => 
                specificCodes.includes(movie.original_language)
              );
            }
          }
        } else if (currentFilters.language === 'all') {
          // For "All", if specific international languages are selected, filter to English + those languages
          if (currentFilters.internationalLanguages && currentFilters.internationalLanguages.length > 0) {
            const selectedLanguageCodes = currentFilters.internationalLanguages
              .map(langId => {
                const langOption = LANGUAGE_OPTIONS.find(l => l.id === langId);
                return langOption?.code;
              })
              .filter(code => code !== undefined && code !== '');
            
            // If "Other" is selected, include languages not in the specific list
            const hasOther = currentFilters.internationalLanguages.includes('other');
            const specificCodes = selectedLanguageCodes.filter(code => code !== '');
            
            if (hasOther && specificCodes.length > 0) {
              // Include English OR specific languages OR languages not in the list
              results = results.filter((movie: MovieWithProvider) => {
                const lang = movie.original_language;
                return lang === 'en' || specificCodes.includes(lang) || !LANGUAGE_OPTIONS.some(l => l.code === lang && l.code !== '');
              });
            } else if (hasOther) {
              // Only "Other" selected - show English OR languages not in the specific list
              results = results.filter((movie: MovieWithProvider) => {
                const lang = movie.original_language;
                return lang === 'en' || !LANGUAGE_OPTIONS.some(l => l.code === lang && l.code !== '');
              });
            } else if (specificCodes.length > 0) {
              // Only specific languages selected - show English OR those languages
              results = results.filter((movie: MovieWithProvider) => 
                movie.original_language === 'en' || specificCodes.includes(movie.original_language)
              );
            }
            // If no specific languages selected, show all (no filtering needed)
          }
        }
        console.log(`After language filter: ${results.length} movies`);
        
        // Filter out watched movies (that aren't marked as rewatch)
        const excludeChecks = await Promise.all(
          results.map((movie: MovieWithProvider) => shouldExcludeMovie(movie.id))
        );
        results = results.filter((_, index) => !excludeChecks[index]);
        console.log(`After watched filter: ${results.length} movies`);
        
        // Remove duplicates based on movie ID (in case same movie appears multiple times)
        const uniqueMovies = Array.from(
          new Map(results.map((movie: MovieWithProvider) => [movie.id, movie])).values()
        );
        
        console.log(`Total movies after filters: ${results.length}, Unique movies: ${uniqueMovies.length}`);
        
        // Sort and interleave movies based on language preference
        let sortedMovies: MovieWithProvider[];
        
        if (currentFilters.language === 'all' && currentFilters.internationalLanguages && currentFilters.internationalLanguages.length > 0) {
          // Separate English and International movies
          const englishMovies = uniqueMovies.filter((movie: MovieWithProvider) => movie.original_language === 'en');
          const internationalMovies = uniqueMovies.filter((movie: MovieWithProvider) => movie.original_language !== 'en');
          
          // Sort each group by combined rating
          englishMovies.sort((a: MovieWithProvider, b: MovieWithProvider) => {
            const ratingA = getCombinedRating(a.vote_average);
            const ratingB = getCombinedRating(b.vote_average);
            return ratingB - ratingA;
          });
          
          internationalMovies.sort((a: MovieWithProvider, b: MovieWithProvider) => {
            const ratingA = getCombinedRating(a.vote_average);
            const ratingB = getCombinedRating(b.vote_average);
            return ratingB - ratingA;
          });
          
          // Interleave: English first, then International, then alternate
          sortedMovies = [];
          
          // First result is always English (if available)
          if (englishMovies.length > 0) {
            sortedMovies.push(englishMovies[0]);
          }
          
          // Second result is International (if available)
          if (internationalMovies.length > 0) {
            sortedMovies.push(internationalMovies[0]);
          }
          
          // Then alternate: English, International, English, International...
          let englishIndex = 1; // Start from index 1 since we already added index 0
          let internationalIndex = 1; // Start from index 1 since we already added index 0
          
          // Alternate between English and International
          while (englishIndex < englishMovies.length || internationalIndex < internationalMovies.length) {
            // Add English if available
            if (englishIndex < englishMovies.length) {
              sortedMovies.push(englishMovies[englishIndex++]);
            }
            // Add International if available
            if (internationalIndex < internationalMovies.length) {
              sortedMovies.push(internationalMovies[internationalIndex++]);
            }
          }
          
          console.log(`Sorted with interleaving: ${englishMovies.length} English, ${internationalMovies.length} International`);
        } else {
          // Default sorting by combined rating
          sortedMovies = uniqueMovies.sort((a: MovieWithProvider, b: MovieWithProvider) => {
            const ratingA = getCombinedRating(a.vote_average);
            const ratingB = getCombinedRating(b.vote_average);
            return ratingB - ratingA;
          });
        }

        setMovies(sortedMovies);
        setFilteredMovies(sortedMovies);
        
        // Generate combinations if totalTime is set
        if (currentFilters.totalTime && currentFilters.totalTime > 0) {
          let combinations: MovieCombination[] = [];
          
          console.log(`Generating combinations for ${currentFilters.totalTime} hours from ${sortedMovies.length} movies`);
          
          if (currentFilters.streamingProviders.length > 0) {
            // Generate 3 combinations per provider
            const providerMap: { [id: string]: number } = {};
            currentFilters.streamingProviders.forEach(id => {
              const provider = STREAMING_PROVIDERS.find(p => p.id === id);
              if (provider) {
                providerMap[id] = provider.tmdbId;
              }
            });
            console.log('Provider map:', providerMap);
            combinations = generateCombinationsPerProvider(
              sortedMovies,
              currentFilters.totalTime,
              currentFilters.streamingProviders,
              providerMap
            );
          } else {
            // Generate 5 general combinations
            combinations = generateMovieCombinations(sortedMovies, currentFilters.totalTime, 5);
          }
          
          console.log(`Final combinations count: ${combinations.length}`);
          setMovieCombinations(combinations);
          // Reset replacement history when new combinations are generated
          setReplacementHistory(new Map());
        } else {
          setMovieCombinations([]);
          setReplacementHistory(new Map());
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please check your API key in .env.local file.');
        // Don't clear filters on error - preserve user selections
      } finally {
        setLoading(false);
        // Reset the fetch flag after completion (success or error)
        setShouldFetchMovies(false);
      }
    };

    fetchMovies();
    // Only depend on shouldFetchMovies and combinationSeed, not filters
    // Filters are captured at the start of the effect to avoid race conditions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchMovies, combinationSeed]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCombinationSeed(0); // Reset seed when filters change
  };

  const handlePreview = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleMovieWatchedChange = async (movieId: number) => {
    // Don't refresh the entire search - just replace the marked movie
    if (isCombinationMode && movieCombinations.length > 0) {
      // Find which combination contains this movie
      const combinationIndex = movieCombinations.findIndex(combo => 
        combo.movies.some(m => m.id === movieId)
      );
      
      if (combinationIndex !== -1) {
        // Use existing replace logic for combinations
        handleReplaceMovie(combinationIndex, movieId);
      }
    } else {
      // For list view, try to replace with another movie from available pool
      const movieToReplace = filteredMovies.find(m => m.id === movieId);
      if (movieToReplace) {
        // Get all currently displayed movie IDs (excluding the one being replaced)
        const displayedMovieIds = filteredMovies
          .filter(m => m.id !== movieId)
          .map(m => m.id);
        
        // Find a replacement from the available movies pool
        // Use movies array as the source, excluding already displayed movies
        const replacement = findReplacementMovie(movieToReplace, movies, displayedMovieIds);
        
        if (replacement) {
          // Replace the movie in filteredMovies only
          setFilteredMovies(prev => prev.map(m => m.id === movieId ? replacement : m));
          console.log(`Replaced "${movieToReplace.title}" with "${replacement.title}" in list view`);
        } else {
          // No replacement found, just remove it from the filtered list
          setFilteredMovies(prev => prev.filter(m => m.id !== movieId));
          console.log(`Removed "${movieToReplace.title}" from list (no suitable replacement found)`);
        }
      }
    }
  };

  const handleRequestAnotherSearch = () => {
    // Increment seed to trigger new combinations without changing filters
    setCombinationSeed(prev => prev + 1);
  };

  const handleReplaceMovie = (combinationIndex: number, movieId: number) => {
    // Find the movie to replace
    const combination = movieCombinations[combinationIndex];
    if (!combination) return;

    const movieToReplace = combination.movies.find(m => m.id === movieId);
    if (!movieToReplace) return;

    // Find the index of the movie in the combination
    const movieIndex = combination.movies.findIndex(m => m.id === movieId);
    const historyKey = `${combinationIndex}-${movieIndex}`;
    
    // Get previously replaced movie IDs for this slot
    const previouslyReplacedIds = replacementHistory.get(historyKey) || [];
    
    // Get all movie IDs from ALL combinations (excluding the one to replace)
    // This ensures replacements are unique across all recommendations
    const usedMovieIds = movieCombinations
      .flatMap(combo => combo.movies.map(m => m.id))
      .filter(id => id !== movieId); // Exclude the movie being replaced
    
    // Also exclude all previously replaced movies in this slot to prevent toggling
    const allExcludedIds = [...usedMovieIds, ...previouslyReplacedIds];
    
    // Find a suitable replacement from the available movies
    const replacement = findReplacementMovie(movieToReplace, movies, allExcludedIds, movieId);
    
    if (replacement) {
      // Create updated combination
      const updatedCombinations = [...movieCombinations];
      const updatedMovies = combination.movies.map(m => 
        m.id === movieId ? replacement : m
      );
      
      // Recalculate totals
      const totalRuntime = updatedMovies.reduce((sum, m) => sum + (m.runtime || 0), 0);
      const averageRating = updatedMovies.reduce((sum, m) => sum + m.vote_average, 0) / updatedMovies.length;
      
      updatedCombinations[combinationIndex] = {
        ...combination,
        movies: updatedMovies,
        totalRuntime,
        averageRating,
      };
      
      // Update replacement history: add the movie that was just replaced to the history
      const newHistory = new Map(replacementHistory);
      const currentHistory = newHistory.get(historyKey) || [];
      newHistory.set(historyKey, [...currentHistory, movieId]);
      setReplacementHistory(newHistory);
      
      setMovieCombinations(updatedCombinations);
    } else {
      // No suitable replacement found
      alert('No suitable replacement movie found with similar runtime. Try adjusting your filters or generating new combinations.');
    }
  };

  const handleSuggestMovies = () => {
    // Reset error and ensure we fetch with current filters
    setError(null);
    setShouldFetchMovies(true);
  };

  const isCombinationMode = filters.totalTime !== undefined && filters.totalTime > 0;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-imdb-bg flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-imdb-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Filter Panel */}
        <FilterPanel
          genres={genres}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSuggest={handleSuggestMovies}
        />

        {/* Results Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-imdb-text-primary mb-1">
              {loading 
                ? 'Loading...' 
                : isCombinationMode 
                  ? `${movieCombinations.length} Movie Combination${movieCombinations.length !== 1 ? 's' : ''} Found`
                  : `${filteredMovies.length} Movies Found`
              }
            </h2>
            <p className="text-imdb-text-secondary text-sm">
              {isCombinationMode 
                ? `Combinations totaling ${filters.totalTime}h (±30 min) • Sorted by rating`
                : 'Sorted by combined IMDB & Rotten Tomatoes scores'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isCombinationMode && movieCombinations.length > 0 && (
              <button
                onClick={handleRequestAnotherSearch}
                className="bg-imdb-yellow hover:bg-yellow-500 text-imdb-bg font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                New Combinations
              </button>
            )}
            {!isCombinationMode && <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-500 font-bold mb-1">Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
                <p className="text-red-300 text-sm mt-2">
                  Make sure you have:
                  <br />
                  1. Created a <code className="bg-black bg-opacity-30 px-1 rounded">.env.local</code> file
                  <br />
                  2. Added your TMDB API key: <code className="bg-black bg-opacity-30 px-1 rounded">NEXT_PUBLIC_TMDB_API_KEY=your_key_here</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingAnimation />}

        {/* Movies Grid/List or Combinations */}
        {shouldFetchMovies && !loading && !error && isCombinationMode && movieCombinations.length === 0 && (
          <div className="text-center py-20 max-w-2xl mx-auto">
            <AlertCircle className="w-16 h-16 text-imdb-yellow mx-auto mb-4 opacity-50" />
            <p className="text-imdb-text-primary text-xl font-bold mb-2">No movie combinations found</p>
            <p className="text-imdb-text-secondary mb-4">
              {filteredMovies.length > 0 
                ? `Found ${filteredMovies.length} movie(s), but couldn't create combinations for ${filters.totalTime} hours.`
                : 'No movies match your filter criteria.'}
            </p>
            
            <div className="bg-imdb-surface border border-imdb-border rounded-lg p-4 text-left">
              <p className="text-imdb-text-primary font-semibold mb-2">💡 Try this:</p>
              <ul className="text-imdb-text-secondary text-sm space-y-1">
                {filteredMovies.length > 0 ? (
                  <>
                    <li>• Try a different total time duration (e.g., {filters.totalTime && filters.totalTime > 3 ? (filters.totalTime! - 1) : (filters.totalTime! + 1)} hours)</li>
                    <li>• Remove or change your filters to get more movies</li>
                    <li>• Clear the "Total Viewing Time" to see individual movies</li>
                  </>
                ) : (
                  <>
                    <li>• Remove some filters (especially streaming + year combination)</li>
                    <li>• Try a more recent year range (2015-2024)</li>
                    <li>• Lower the minimum score</li>
                    <li>• Click "Clear All" to start fresh</li>
                  </>
                )}
              </ul>
              <p className="text-xs text-imdb-text-secondary mt-3">
                💡 Tip: Check browser console (F12) for detailed debug information
              </p>
            </div>
          </div>
        )}

        {shouldFetchMovies && !loading && !error && !isCombinationMode && filteredMovies.length === 0 && (
          <div className="text-center py-20 max-w-2xl mx-auto">
            <AlertCircle className="w-16 h-16 text-imdb-yellow mx-auto mb-4 opacity-50" />
            <p className="text-imdb-text-primary text-xl font-bold mb-2">No movies found</p>
            <p className="text-imdb-text-secondary mb-4">
              Your filter combination is too restrictive or no movies match your criteria.
            </p>
            
            {(filters.streamingProviders.length > 0 || filters.fromYear || filters.toYear) && (
              <div className="bg-imdb-surface border border-imdb-border rounded-lg p-4 text-left">
                <p className="text-imdb-text-primary font-semibold mb-2">💡 Tips:</p>
                <ul className="text-imdb-text-secondary text-sm space-y-1">
                  {filters.streamingProviders.length > 0 && (filters.fromYear || filters.toYear) && (
                    <li>• <strong>Year + Streaming</strong>: Older movies may not be on modern streaming platforms</li>
                  )}
                  {filters.streamingProviders.length > 0 && (
                    <li>• Try removing some streaming providers or clear the year filter</li>
                  )}
                  {(filters.fromYear || filters.toYear) && filters.streamingProviders.length === 0 && (
                    <li>• Try expanding your year range or remove the year filter</li>
                  )}
                  <li>• Lower the minimum score threshold</li>
                  <li>• Remove some genre filters</li>
                  <li>• Click "Clear All" to start fresh</li>
                </ul>
              </div>
            )}
            
            {!filters.streamingProviders.length && !filters.fromYear && !filters.toYear && (
              <p className="text-imdb-text-secondary text-sm">
                Try adjusting your filters or clearing some criteria
              </p>
            )}
          </div>
        )}

        {!loading && !error && isCombinationMode && movieCombinations.length > 0 && (
          <div className="space-y-6">
            {movieCombinations.map((combination, index) => (
              <MovieCombinationCard
                key={`${index}-${combinationSeed}`}
                combination={combination}
                rank={index + 1}
                onPreview={handlePreview}
                onMovieWatchedChange={handleMovieWatchedChange}
                onReplaceMovie={handleReplaceMovie}
                combinationIndex={index}
              />
            ))}
          </div>
        )}

        {!loading && !error && !isCombinationMode && filteredMovies.length > 0 && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredMovies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                rank={index + 1}
                viewMode={viewMode}
                onPreview={handlePreview}
                onWatchedChange={handleMovieWatchedChange}
              />
            ))}
          </div>
        )}

        {/* Initial state - show welcome message */}
        {!shouldFetchMovies && !loading && (
          <div className="text-center py-20 max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="w-24 h-24 bg-imdb-yellow bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-12 h-12 text-imdb-yellow" />
              </div>
              <h2 className="text-3xl font-bold text-imdb-text-primary mb-3">Ready to Find Your Perfect Movie?</h2>
              <p className="text-imdb-text-secondary text-lg mb-6">
                Select your preferences using the filters on the left, then click the <span className="text-imdb-yellow font-bold">"Suggest Movies"</span> button to get personalized recommendations!
              </p>
            </div>
            
            <div className="bg-imdb-surface border border-imdb-border rounded-lg p-6 text-left">
              <p className="text-imdb-text-primary font-semibold text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-imdb-yellow" />
                Quick Start Guide:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-imdb-text-secondary text-sm">
                <div className="flex items-start gap-3">
                  <Film className="w-5 h-5 text-imdb-yellow flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-imdb-text-primary">Select Genres</p>
                    <p>Pick your favorite movie genres</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-imdb-yellow flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-imdb-text-primary">Set Rating</p>
                    <p>Choose minimum quality threshold</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tv className="w-5 h-5 text-imdb-yellow flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-imdb-text-primary">Streaming</p>
                    <p>Filter by your subscriptions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-imdb-yellow flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-imdb-text-primary">Year Range</p>
                    <p>Choose classic or modern films</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Movie Preview Modal */}
      {selectedMovie && (
        <MoviePreviewModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}

