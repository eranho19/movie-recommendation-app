const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const POSTER_SIZE = 'w500';
export const BACKDROP_SIZE = 'original';

export async function fetchFromTMDB(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY || '');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    throw error;
  }
}

export async function getGenres() {
  return fetchFromTMDB('/genre/movie/list');
}

export async function discoverMovies(params: {
  with_genres?: string;
  with_original_language?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  sort_by?: string;
  page?: number;
  with_watch_providers?: string;
  watch_region?: string;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
}) {
  return fetchFromTMDB('/discover/movie', {
    ...params,
    include_adult: false,
    include_video: false,
    'vote_count.gte': 100, // Ensure movies have enough votes to be reliable
  });
}

// Fetch movies with runtime information
export async function discoverMoviesWithRuntime(params: {
  with_genres?: string;
  with_original_language?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  sort_by?: string;
  page?: number;
}, limit: number = 100) {
  // Fetch multiple pages to get enough movies
  const promises = [];
  const pagesToFetch = Math.ceil(limit / 20); // TMDB returns 20 per page
  
  for (let i = 1; i <= Math.min(pagesToFetch, 5); i++) {
    promises.push(discoverMovies({ ...params, page: i }));
  }
  
  const results = await Promise.all(promises);
  const allMovies = results.flatMap(r => r.results);
  
  // Fetch runtime for each movie (in batches to avoid overwhelming the API)
  const moviesWithRuntime = [];
  
  for (let i = 0; i < Math.min(allMovies.length, limit); i++) {
    try {
      const details = await getMovieDetails(allMovies[i].id);
      moviesWithRuntime.push({
        ...allMovies[i],
        runtime: details.runtime || 0,
      });
      
      // Small delay to avoid rate limiting
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error fetching runtime for movie ${allMovies[i].id}:`, error);
      // Include movie without runtime
      moviesWithRuntime.push({
        ...allMovies[i],
        runtime: 0,
      });
    }
  }
  
  return moviesWithRuntime;
}

export async function getMovieDetails(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}`, {
    append_to_response: 'videos,credits',
  });
}

export async function getMovieVideos(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}/videos`);
}

export async function searchMovies(query: string, page: number = 1) {
  return fetchFromTMDB('/search/movie', {
    query,
    page,
    include_adult: false,
  });
}

export function getPosterUrl(posterPath: string | null, size: string = POSTER_SIZE): string {
  if (!posterPath) return '/placeholder-poster.jpg';
  return `${IMAGE_BASE_URL}/${size}${posterPath}`;
}

export function getBackdropUrl(backdropPath: string | null): string {
  if (!backdropPath) return '/placeholder-backdrop.jpg';
  return `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${backdropPath}`;
}

export function getYouTubeUrl(videoKey: string): string {
  return `https://www.youtube.com/watch?v=${videoKey}`;
}

export function getYouTubeEmbedUrl(videoKey: string): string {
  return `https://www.youtube.com/embed/${videoKey}`;
}

// Helper to combine TMDB rating with simulated Rotten Tomatoes
// In a real app, you'd integrate with the Rotten Tomatoes API
export function getCombinedRating(tmdbRating: number): number {
  // TMDB ratings are out of 10, we'll simulate RT percentage and average them
  const tmdbPercentage = (tmdbRating / 10) * 100;
  // Simulate RT being slightly different (±10%)
  const rtSimulated = Math.min(100, Math.max(0, tmdbPercentage + (Math.random() * 20 - 10)));
  return Math.round((tmdbPercentage + rtSimulated) / 2);
}

// Fetch streaming providers for a movie
export async function getMovieProviders(movieId: number) {
  try {
    const data = await fetchFromTMDB(`/movie/${movieId}/watch/providers`);
    return data.results?.US || null; // Focus on US providers
  } catch (error) {
    console.error('Error fetching providers:', error);
    return null;
  }
}

// Fetch movies with streaming provider information
export async function discoverMoviesWithProviders(params: {
  with_genres?: string;
  with_original_language?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  sort_by?: string;
  page?: number;
  with_watch_providers?: string;
  watch_region?: string;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
}, limit: number = 100) {
  // Fetch multiple pages to get enough movies
  const promises = [];
  const pagesToFetch = Math.ceil(limit / 20);
  
  for (let i = 1; i <= Math.min(pagesToFetch, 5); i++) {
    promises.push(discoverMovies({ ...params, page: i }));
  }
  
  const results = await Promise.all(promises);
  const allMovies = results.flatMap(r => r.results);
  
  // Fetch runtime and provider info for each movie
  const moviesWithInfo = [];
  
  for (let i = 0; i < Math.min(allMovies.length, limit); i++) {
    try {
      const [details, providers] = await Promise.all([
        getMovieDetails(allMovies[i].id),
        getMovieProviders(allMovies[i].id)
      ]);
      
      // Get flatrate (free with subscription) providers
      // Convert to strings to match the type definition and enable proper comparison
      const availableOn = providers?.flatrate?.map((p: any) => String(p.provider_id)) || [];
      
      // Debug logging for provider data (only log first few to avoid spam)
      if (i < 3 && availableOn.length > 0) {
        console.log(`Movie "${allMovies[i].title}" available on providers:`, availableOn);
      }
      
      moviesWithInfo.push({
        ...allMovies[i],
        runtime: details.runtime || 0,
        availableOn,
      });
      
      // Small delay to avoid rate limiting
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error fetching info for movie ${allMovies[i].id}:`, error);
      // Include movie without extra info
      moviesWithInfo.push({
        ...allMovies[i],
        runtime: 0,
        availableOn: [],
      });
    }
  }
  
  return moviesWithInfo;
}

// Fetch awards from OMDB API (requires separate API key)
// For now, we'll use TMDB keywords to identify award-winning movies
export async function getMovieAwards(movieId: number, imdbId?: string) {
  try {
    // Get keywords which might indicate awards
    const keywordsData = await fetchFromTMDB(`/movie/${movieId}/keywords`);
    const keywords = keywordsData.keywords || [];
    
    // Check for award-related keywords
    const awardKeywords = keywords.filter((kw: any) => 
      kw.name.toLowerCase().includes('oscar') ||
      kw.name.toLowerCase().includes('academy award') ||
      kw.name.toLowerCase().includes('golden globe') ||
      kw.name.toLowerCase().includes('bafta') ||
      kw.name.toLowerCase().includes('cannes') ||
      kw.name.toLowerCase().includes('sundance') ||
      kw.name.toLowerCase().includes('emmy')
    );
    
    // Get movie details for additional info
    const details = await fetchFromTMDB(`/movie/${movieId}`);
    
    const awards = [];
    
    // If movie has high ratings and certain keywords, likely award winner
    if (details.vote_average >= 7.5 && details.vote_count > 1000) {
      // Check release year for historical context
      const releaseYear = details.release_date ? new Date(details.release_date).getFullYear() : null;
      
      // Movies with very high ratings likely have awards
      if (details.vote_average >= 8.5) {
        awards.push({
          name: 'Critically Acclaimed',
          won: true,
          category: 'High Ratings',
          year: releaseYear || undefined
        });
      }
      
      if (details.vote_average >= 8.0 && awardKeywords.length > 0) {
        awards.push({
          name: 'Major Film Awards',
          won: true,
          category: 'Multiple Categories',
          year: releaseYear || undefined
        });
      }
    }
    
    // Add keyword-based awards
    awardKeywords.forEach((kw: any) => {
      const kwName = kw.name.toLowerCase();
      if (kwName.includes('oscar') || kwName.includes('academy')) {
        awards.push({
          name: 'Academy Awards (Oscars)',
          won: true,
          category: 'Various'
        });
      } else if (kwName.includes('golden globe')) {
        awards.push({
          name: 'Golden Globe Awards',
          won: true,
          category: 'Various'
        });
      } else if (kwName.includes('bafta')) {
        awards.push({
          name: 'BAFTA Awards',
          won: true,
          category: 'Various'
        });
      } else if (kwName.includes('cannes')) {
        awards.push({
          name: 'Cannes Film Festival',
          won: true,
          category: 'Festival Awards'
        });
      }
    });
    
    // Remove duplicates
    const uniqueAwards = awards.filter((award, index, self) =>
      index === self.findIndex(a => a.name === award.name)
    );
    
    return uniqueAwards;
  } catch (error) {
    console.error('Error fetching awards:', error);
    return [];
  }
}

