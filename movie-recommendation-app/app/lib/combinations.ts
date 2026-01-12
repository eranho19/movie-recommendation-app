import type { Movie, MovieCombination, MovieWithProvider } from '../types/movie';

const MARGIN_MINUTES = 30; // ±30 minutes margin
const REPLACEMENT_MARGIN_MINUTES = 15; // ±15 minutes margin for replacement

interface CombinationWithScore {
  combination: MovieCombination;
  score: number;
}

/**
 * Generate movie combinations per provider that sum up to the target time (in hours) with ±30 minute margin
 * Returns 3 combinations per provider
 */
export function generateCombinationsPerProvider(
  movies: MovieWithProvider[],
  targetHours: number,
  providers: string[],
  providerMap: { [id: string]: number }
): MovieCombination[] {
  const allCombinations: MovieCombination[] = [];
  const globalUsedMovieIds = new Set<number>(); // Track movies used across ALL providers
  
  console.log(`Generating combinations for ${providers.length} provider(s) from ${movies.length} total movies`);
  
  for (const providerId of providers) {
    const tmdbProviderId = providerMap[providerId];
    console.log(`Checking provider ${providerId} (TMDB ID: ${tmdbProviderId})`);
    
    // Filter movies available on this provider that haven't been used yet
    const providerMovies = movies.filter(m => 
      m.availableOn && 
      m.availableOn.includes(String(tmdbProviderId)) &&
      !globalUsedMovieIds.has(m.id) // Exclude already used movies
    );
    
    console.log(`Found ${providerMovies.length} unused movies available on ${providerId}`);
    
    // If no movies match the provider filter, try using all unused movies
    const unusedMovies = movies.filter(m => !globalUsedMovieIds.has(m.id));
    const moviesToUse = providerMovies.length > 0 ? providerMovies : unusedMovies;
    
    if (moviesToUse.length > 0) {
      console.log(`Generating combinations from ${moviesToUse.length} unused movies for ${providerId}`);
      const combinations = generateMovieCombinations(moviesToUse, targetHours, 3);
      console.log(`Generated ${combinations.length} combinations for ${providerId}`);
      
      // Tag combinations with provider and track used movie IDs globally
      combinations.forEach(combo => {
        combo.provider = providerId;
        combo.movies.forEach(m => globalUsedMovieIds.add(m.id));
      });
      allCombinations.push(...combinations);
    } else {
      console.log(`No unused movies available for provider ${providerId}`);
    }
  }
  
  console.log(`Total combinations generated: ${allCombinations.length}`);
  console.log(`Total unique movies used: ${globalUsedMovieIds.size}`);
  return allCombinations;
}

/**
 * Generate movie combinations that sum up to the target time (in hours) with ±30 minute margin
 * Returns up to 'count' diverse combinations
 */
export function generateMovieCombinations(
  movies: Movie[],
  targetHours: number,
  count: number = 5
): MovieCombination[] {
  const targetMinutes = targetHours * 60;
  const minTime = targetMinutes - MARGIN_MINUTES;
  const maxTime = targetMinutes + MARGIN_MINUTES;
  
  // Filter movies with valid runtime
  const validMovies = movies.filter(m => m.runtime && m.runtime > 0);
  
  if (validMovies.length === 0) {
    return [];
  }
  
  const allCombinations: CombinationWithScore[] = [];
  
  // Generate combinations using dynamic programming approach
  // We'll try different combination sizes (1 to 5 movies)
  for (let size = 1; size <= Math.min(5, validMovies.length); size++) {
    const combinations = generateCombinationsOfSize(validMovies, size, minTime, maxTime);
    allCombinations.push(...combinations);
  }
  
  // Sort by score (considers time accuracy and rating)
  allCombinations.sort((a, b) => b.score - a.score);
  
  // Return top combinations, ensuring NO duplicate movies across combinations
  const selected: MovieCombination[] = [];
  const usedMovieIds = new Set<number>();
  
  for (const item of allCombinations) {
    if (selected.length >= count) break;
    
    // Check if this combination uses any movies already used in previous combinations
    const hasOverlap = item.combination.movies.some(m => usedMovieIds.has(m.id));
    
    // Only select combinations with NO overlapping movies
    if (!hasOverlap) {
      selected.push(item.combination);
      item.combination.movies.forEach(m => usedMovieIds.add(m.id));
    }
  }
  
  return selected;
}

function generateCombinationsOfSize(
  movies: Movie[],
  size: number,
  minTime: number,
  maxTime: number
): CombinationWithScore[] {
  const results: CombinationWithScore[] = [];
  
  function backtrack(start: number, current: Movie[], currentTime: number) {
    // If we have enough movies, check if time is in range
    if (current.length === size) {
      if (currentTime >= minTime && currentTime <= maxTime) {
        const totalRuntime = currentTime;
        const averageRating = current.reduce((sum, m) => sum + m.vote_average, 0) / current.length;
        
        // Calculate score: considers both time accuracy and rating
        const timeAccuracy = 1 - Math.abs(currentTime - (minTime + maxTime) / 2) / MARGIN_MINUTES;
        const ratingScore = averageRating / 10;
        const score = (timeAccuracy * 0.3) + (ratingScore * 0.7);
        
        results.push({
          combination: {
            movies: [...current],
            totalRuntime,
            averageRating,
          },
          score,
        });
      }
      return;
    }
    
    // Try adding each movie
    for (let i = start; i < movies.length; i++) {
      const movie = movies[i];
      const newTime = currentTime + (movie.runtime || 0);
      
      // Prune: if we're already over maxTime, skip
      if (newTime > maxTime) continue;
      
      // Prune: if we can't possibly reach minTime with remaining movies, skip
      const remainingSlots = size - current.length - 1;
      const minPossibleAddition = remainingSlots > 0 
        ? Math.min(...movies.slice(i + 1).map(m => m.runtime || 0).filter(r => r > 0)) * remainingSlots 
        : 0;
      
      if (newTime + minPossibleAddition < minTime && current.length < size - 1) {
        // Might still be able to reach target, continue
      }
      
      current.push(movie);
      backtrack(i + 1, current, newTime);
      current.pop();
      
      // Limit results to avoid exponential explosion
      if (results.length > 1000) break;
    }
  }
  
  backtrack(0, [], 0);
  return results;
}

/**
 * Format runtime in hours and minutes
 */
export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

/**
 * Get a summary of the combination
 */
export function getCombinationSummary(combination: MovieCombination): string {
  const runtime = formatRuntime(combination.totalRuntime);
  const rating = combination.averageRating.toFixed(1);
  const movieCount = combination.movies.length;
  
  return `${movieCount} movie${movieCount > 1 ? 's' : ''} • ${runtime} • ★ ${rating}`;
}

/**
 * Find a replacement movie for a given movie in a combination
 * Replacement should have similar runtime (±15 minutes)
 */
export function findReplacementMovie(
  originalMovie: Movie,
  allMovies: Movie[],
  usedMovieIds: number[]
): Movie | null {
  const targetRuntime = originalMovie.runtime || 90; // Default to 90 minutes if no runtime
  const minRuntime = targetRuntime - REPLACEMENT_MARGIN_MINUTES;
  const maxRuntime = targetRuntime + REPLACEMENT_MARGIN_MINUTES;
  
  console.log(`Finding replacement for "${originalMovie.title}" (${targetRuntime}min)`);
  console.log(`Looking for movies between ${minRuntime}-${maxRuntime} minutes`);
  console.log(`Available movies: ${allMovies.length}, Used IDs: ${usedMovieIds.length}`);
  
  // Filter movies with similar runtime that aren't already used
  const candidates = allMovies.filter(m => 
    m.id !== originalMovie.id &&
    !usedMovieIds.includes(m.id) &&
    m.runtime &&
    m.runtime >= minRuntime &&
    m.runtime <= maxRuntime
  );
  
  console.log(`Found ${candidates.length} replacement candidates`);
  
  // If no candidates found with strict runtime, try with wider margin (±30 minutes)
  if (candidates.length === 0) {
    const widerMinRuntime = targetRuntime - (REPLACEMENT_MARGIN_MINUTES * 2);
    const widerMaxRuntime = targetRuntime + (REPLACEMENT_MARGIN_MINUTES * 2);
    
    console.log(`No candidates found, trying wider range: ${widerMinRuntime}-${widerMaxRuntime} minutes`);
    
    const widerCandidates = allMovies.filter(m => 
      m.id !== originalMovie.id &&
      !usedMovieIds.includes(m.id) &&
      m.runtime &&
      m.runtime >= widerMinRuntime &&
      m.runtime <= widerMaxRuntime
    );
    
    console.log(`Found ${widerCandidates.length} candidates with wider range`);
    
    if (widerCandidates.length > 0) {
      const replacement = widerCandidates.sort((a, b) => b.vote_average - a.vote_average)[0];
      console.log(`Selected replacement: "${replacement.title}" (${replacement.runtime}min)`);
      return replacement;
    }
  }
  
  // Sort by rating and return the best one
  if (candidates.length > 0) {
    const replacement = candidates.sort((a, b) => b.vote_average - a.vote_average)[0];
    console.log(`Selected replacement: "${replacement.title}" (${replacement.runtime}min)`);
    return replacement;
  }
  
  console.log('No suitable replacement found');
  return null;
}


